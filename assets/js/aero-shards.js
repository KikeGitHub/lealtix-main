/**
 * LEALTIX - AeroShards Background Effect Engine
 * Procedural 3D faceted crystal diamond shards with flow turbulence, 
 * specular lighting, interactive pointer repulsion, and ripple physics.
 */

(function () {
  'use strict';

  function initAeroShards() {
    const section = document.getElementById('paradigma');
    const canvas = document.getElementById('paradigma-shards-canvas');
    if (!section || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let animationFrameId = null;
    let isVisible = true;

    // Palette Configuration (LEALTIX Theme)
    const PALETTE = {
      background: [7, 18, 32],      // #071220 deep navy
      shard: [14, 165, 233],        // #0ea5e9 bright cyan
      accent: [45, 212, 191],       // #2dd4bf mint teal
      gold: [212, 175, 55],         // #d4af37 gold highlight
      white: [255, 255, 255]
    };

    // Shard instances count based on screen size
    const SHARD_COUNT = window.innerWidth < 768 ? 45 : 90;
    const shards = [];

    // Pointer & Ripple physics
    const pointer = {
      x: -1000,
      y: -1000,
      rawX: -1000,
      rawY: -1000,
      vx: 0,
      vy: 0,
      active: false,
      presence: 0
    };

    const ripples = [];

    // Initialize procedural shards
    for (let i = 0; i < SHARD_COUNT; i++) {
      shards.push({
        phase: Math.random(),
        lane: (Math.random() - 0.5) * 2,
        depth: Math.random(),
        scale: 0.55 + Math.random() * 0.9,
        spinSpeed: 0.5 + Math.random() * 1.5,
        rollOffset: Math.random() * Math.PI * 2,
        speedFactor: 0.8 + Math.random() * 0.4,
        size: 14 + Math.random() * 22,
        aspectRatio: 0.55 + Math.random() * 0.35,
        colorIndex: Math.random()
      });
    }

    function resize() {
      const rect = section.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);
    }

    window.addEventListener('resize', resize, { passive: true });
    resize();

    // Intersection Observer to sleep when off-screen
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      isVisible = entry ? entry.isIntersecting : true;
      if (isVisible && !animationFrameId) {
        lastTime = performance.now();
        loop(lastTime);
      }
    }, { threshold: 0.05 });
    observer.observe(section);

    // Mouse & Pointer interaction on section
    section.addEventListener('pointermove', (e) => {
      const rect = section.getBoundingClientRect();
      pointer.rawX = e.clientX - rect.left;
      pointer.rawY = e.clientY - rect.top;
      pointer.active = true;
    }, { passive: true });

    section.addEventListener('pointerleave', () => {
      pointer.active = false;
    }, { passive: true });

    section.addEventListener('pointerdown', (e) => {
      const rect = section.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;

      if (ripples.length < 5) {
        ripples.push({
          x: px,
          y: py,
          age: 0,
          maxAge: 1.6,
          radius: 0,
          maxRadius: Math.max(width, height) * 0.65,
          strength: 1.0
        });
      }
    }, { passive: true });

    // Mathematical 3D Path Stream Curve
    function getPathPosition(t, w, h) {
      // Flowing S-curve ribbon with depth
      const aspect = w / Math.max(h, 1);
      const angle = t * Math.PI * 2;
      
      const x = (t * 1.3 - 0.15) * w;
      const y = h * 0.5 + Math.sin(angle) * (h * 0.28) + Math.sin(angle * 3) * (h * 0.06);
      const z = Math.cos(angle * 2) * 0.4;
      
      // Tangent vector
      const dx = 1.3 * w;
      const dy = Math.cos(angle) * (h * 0.28 * Math.PI * 2) + Math.cos(angle * 3) * (h * 0.18 * Math.PI * 2);
      const len = Math.hypot(dx, dy) || 1;

      return {
        x,
        y,
        z,
        tx: dx / len,
        ty: dy / len,
        nx: -dy / len,
        ny: dx / len
      };
    }

    let lastTime = performance.now();
    let flowDistance = 0;

    function loop(now) {
      if (!isVisible) {
        animationFrameId = null;
        return;
      }

      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      flowDistance += dt * 0.12;

      // Update pointer smoothing
      if (pointer.active) {
        pointer.x += (pointer.rawX - pointer.x) * (1 - Math.exp(-dt * 15));
        pointer.y += (pointer.rawY - pointer.y) * (1 - Math.exp(-dt * 15));
        pointer.presence += (1 - pointer.presence) * (1 - Math.exp(-dt * 8));
      } else {
        pointer.presence += (0 - pointer.presence) * (1 - Math.exp(-dt * 5));
      }

      // Update Ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.age += dt;
        r.radius = (r.age / r.maxAge) * r.maxRadius;
        r.strength = Math.max(0, 1 - r.age / r.maxAge);
        if (r.age >= r.maxAge) {
          ripples.splice(i, 1);
        }
      }

      // Clear frame
      ctx.clearRect(0, 0, width, height);

      // Render Ambient Glow Layer behind shards
      const grad = ctx.createRadialGradient(
        width * 0.5, height * 0.5, 50,
        width * 0.5, height * 0.5, Math.max(width, height) * 0.6
      );
      grad.addColorStop(0, 'rgba(45, 212, 191, 0.08)');
      grad.addColorStop(0.5, 'rgba(14, 165, 233, 0.04)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Draw Ripples
      for (const r of ripples) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(45, 212, 191, ${r.strength * 0.35})`;
        ctx.lineWidth = 2 * r.strength;
        ctx.stroke();
        ctx.restore();
      }

      // Sort shards by depth for proper z-layering
      const renderList = [];

      for (let i = 0; i < shards.length; i++) {
        const s = shards[i];
        const t = (s.phase + flowDistance * s.speedFactor) % 1;
        const path = getPathPosition(t, width, height);

        // Lateral ribbon spread with sine wave oscillation
        const wave = Math.sin(t * Math.PI * 8 + s.depth * 5) * 20;
        const spread = s.lane * (height * 0.32) + wave;

        let posX = path.x + path.nx * spread;
        let posY = path.y + path.ny * spread;
        let posZ = path.z + (s.depth - 0.5) * 0.5;

        // Pointer Repulsion Physics
        if (pointer.presence > 0.01) {
          const dx = posX - pointer.x;
          const dy = posY - pointer.y;
          const dist = Math.hypot(dx, dy);
          const maxDist = 200;
          if (dist < maxDist && dist > 0) {
            const force = (1 - dist / maxDist) * 85 * pointer.presence;
            posX += (dx / dist) * force;
            posY += (dy / dist) * force;
          }
        }

        // Ripple Displacement
        for (const r of ripples) {
          const rdx = posX - r.x;
          const rdy = posY - r.y;
          const rdist = Math.hypot(rdx, rdy);
          const ringDist = Math.abs(rdist - r.radius);
          if (ringDist < 60 && rdist > 0) {
            const rippleForce = Math.sin((1 - ringDist / 60) * Math.PI) * 28 * r.strength;
            posX += (rdx / rdist) * rippleForce;
            posY += (rdy / rdist) * rippleForce;
          }
        }

        renderList.push({
          s,
          t,
          x: posX,
          y: posY,
          z: posZ,
          tangentX: path.tx,
          tangentY: path.ty
        });
      }

      // Sort back-to-front
      renderList.sort((a, b) => a.z - b.z);

      // Render 3D Faceted Diamond Shards
      for (const item of renderList) {
        const { s, t, x, y, z, tangentX, tangentY } = item;

        // Perspective scale & fog
        const depthFactor = 0.65 + (z + 0.5) * 0.5; // 0.65 to 1.15
        const currentSize = s.size * depthFactor;
        const w = currentSize * s.aspectRatio;
        const h = currentSize;

        // 3D Banking and Roll rotation
        const roll = s.rollOffset + now * 0.0015 * s.spinSpeed;
        const baseAngle = Math.atan2(tangentY, tangentX);
        const cosRoll = Math.cos(roll);
        const sinRoll = Math.sin(roll);

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(baseAngle + cosRoll * 0.4);

        // Color selection: blend between cyan, mint teal, and gold highlight
        let baseR, baseG, baseB;
        if (s.colorIndex < 0.6) {
          baseR = PALETTE.accent[0];
          baseG = PALETTE.accent[1];
          baseB = PALETTE.accent[2];
        } else if (s.colorIndex < 0.85) {
          baseR = PALETTE.shard[0];
          baseG = PALETTE.shard[1];
          baseB = PALETTE.shard[2];
        } else {
          baseR = PALETTE.gold[0];
          baseG = PALETTE.gold[1];
          baseB = PALETTE.gold[2];
        }

        const opacity = Math.min(1, Math.max(0.15, (0.4 + (z + 0.5) * 0.55)));
        const foldZ = Math.abs(sinRoll) * 0.7 + 0.3;

        // Facet Left: Triangle (Top -> Left -> Bottom)
        ctx.beginPath();
        ctx.moveTo(0, -h);
        ctx.lineTo(-w * cosRoll, 0);
        ctx.lineTo(0, h);
        ctx.closePath();

        const lightFacetA = 0.5 + 0.5 * sinRoll;
        const fillA = `rgba(${Math.round(baseR * lightFacetA)}, ${Math.round(baseG * lightFacetA)}, ${Math.round(baseB * lightFacetA)}, ${opacity})`;
        ctx.fillStyle = fillA;
        ctx.fill();

        // Facet Right: Triangle (Top -> Right -> Bottom)
        ctx.beginPath();
        ctx.moveTo(0, -h);
        ctx.lineTo(w * (1 - cosRoll * 0.5), 0);
        ctx.lineTo(0, h);
        ctx.closePath();

        const lightFacetB = 0.85 - 0.35 * sinRoll;
        const fillB = `rgba(${Math.round(baseR * lightFacetB)}, ${Math.round(baseG * lightFacetB)}, ${Math.round(baseB * lightFacetB)}, ${opacity})`;
        ctx.fillStyle = fillB;
        ctx.fill();

        // Faceted Crease Specular Highlight line down the center fold
        ctx.beginPath();
        ctx.moveTo(0, -h);
        ctx.lineTo(0, h);
        ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.75 * foldZ})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Outer Diamond Wireframe Glint
        ctx.beginPath();
        ctx.moveTo(0, -h);
        ctx.lineTo(-w * cosRoll, 0);
        ctx.lineTo(0, h);
        ctx.lineTo(w * (1 - cosRoll * 0.5), 0);
        ctx.closePath();
        ctx.strokeStyle = `rgba(${baseR}, ${baseG}, ${baseB}, ${opacity * 0.5})`;
        ctx.lineWidth = 0.75;
        ctx.stroke();

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(loop);
    }

    animationFrameId = requestAnimationFrame(loop);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAeroShards);
  } else {
    initAeroShards();
  }
})();
