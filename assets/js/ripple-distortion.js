/**
 * WebGL Liquid Water Ripple Background Engine
 * Interactive fluid ripple waves and specular caustics for CTA Section background
 */
class RippleDistortion {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    if (!this.container) return;

    this.options = Object.assign({
      interactiveTarget: '#cta-section',
      brushSize: 180,
      rings: 3.5,
      spread: 6.5,
      fade: 2.8,
      spacing: 10,
      glint: 0.85,
      tint: '#2dd4bf'
    }, options);

    this.MAX_WAVES = 80;
    this.START_SCALE = 1.5;
    this.LIFE_CONSTANT = Math.log(500);

    this.init();
  }

  init() {
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'ripple-distortion-canvas absolute inset-0 w-full h-full pointer-events-none';
    this.canvas.style.zIndex = '0';
    this.container.style.position = 'absolute';
    this.container.appendChild(this.canvas);

    this.gl = this.canvas.getContext('webgl', { alpha: true, antialias: false, premultipliedAlpha: false });
    if (!this.gl) {
      console.warn('WebGL not supported for RippleDistortion');
      return;
    }

    const gl = this.gl;
    gl.getExtension('OES_texture_float');
    gl.getExtension('OES_texture_float_linear');

    this.initWaves();
    this.initShaders();
    this.initBuffers();
    this.initEvents();
    this.resize();

    window.addEventListener('resize', () => this.resize(), { passive: true });

    this.lastTime = performance.now();
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  initWaves() {
    this.waves = Array.from({ length: this.MAX_WAVES }, () => ({
      x: 0,
      y: 0,
      scale: this.START_SCALE,
      target: this.START_SCALE,
      size: 1,
      opacity: 0
    }));
    this.currentWave = 0;
  }

  hexToRGB(hex) {
    const clean = hex.replace('#', '');
    const full = clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean;
    const n = parseInt(full, 16);
    if (Number.isNaN(n)) return [0.176, 0.831, 0.749];
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  }

  createShader(type, source) {
    const gl = this.gl;
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compile error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  createProgram(vsSource, fsSource) {
    const gl = this.gl;
    const vs = this.createShader(gl.VERTEX_SHADER, vsSource);
    const fs = this.createShader(gl.FRAGMENT_SHADER, fsSource);
    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      return null;
    }
    return program;
  }

  initShaders() {
    const waveVS = `
      precision highp float;
      attribute vec2 position;
      attribute vec2 uv;
      uniform vec2 uOffset;
      uniform vec2 uScale;
      uniform float uOpacity;
      varying vec2 vUv;
      varying float vOpacity;
      void main() {
        vUv = uv;
        vOpacity = uOpacity;
        gl_Position = vec4(uOffset + position * uScale, 0.0, 1.0);
      }
    `;

    const waveFS = `
      precision highp float;
      varying vec2 vUv;
      varying float vOpacity;
      uniform float uRings;
      const float PI = 3.141592653589793;
      const float EDGE = 0.006737947;
      void main() {
        vec2 p = vUv * 2.0 - 1.0;
        float r = dot(p, p);
        if (r > 1.0) discard;
        float brush = (exp(-r * 5.0) - EDGE) / (1.0 - EDGE);
        brush *= 0.55 + 0.45 * cos(sqrt(r) * PI * 2.0 * uRings);
        gl_FragColor = vec4(vec3(brush * vOpacity * vOpacity), 1.0);
      }
    `;

    const screenVS = `
      precision highp float;
      attribute vec2 position;
      attribute vec2 uv;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    const screenFS = `
      precision highp float;
      varying vec2 vUv;
      uniform sampler2D uDisplacement;
      uniform vec2 uTexel;
      uniform vec3 uTint;
      uniform float uGlint;

      void main() {
        float amount = texture2D(uDisplacement, vUv).r;
        if (amount < 0.002) {
          discard;
        }

        float ex = texture2D(uDisplacement, vUv + vec2(uTexel.x, 0.0)).r - texture2D(uDisplacement, vUv - vec2(uTexel.x, 0.0)).r;
        float ey = texture2D(uDisplacement, vUv + vec2(0.0, uTexel.y)).r - texture2D(uDisplacement, vUv - vec2(0.0, uTexel.y)).r;
        vec3 normal = normalize(vec3(-ex * 32.0, -ey * 32.0, 1.0));
        vec3 light = normalize(vec3(-0.35, 0.55, 1.0));
        
        float raw = pow(max(dot(normal, light), 0.0), 18.0);
        float flatSpec = pow(max(light.z, 0.0), 18.0);
        float glint = clamp((raw - flatSpec) / max(1.0 - flatSpec, 0.0001), 0.0, 1.0) * uGlint;

        vec3 waterColor = mix(uTint, vec3(1.0), clamp(glint * 1.2, 0.0, 1.0));
        float alpha = smoothstep(0.003, 0.16, amount) * (0.45 + glint * 0.55);

        gl_FragColor = vec4(waterColor, alpha);
      }
    `;

    this.waveProgram = this.createProgram(waveVS, waveFS);
    this.screenProgram = this.createProgram(screenVS, screenFS);
  }

  initBuffers() {
    const gl = this.gl;

    const quadVertices = new Float32Array([
      -1, -1, 0, 0,
       1, -1, 1, 0,
      -1,  1, 0, 1,
      -1,  1, 0, 1,
       1, -1, 1, 0,
       1,  1, 1, 1
    ]);

    this.quadBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, quadVertices, gl.STATIC_DRAW);

    this.fbo = gl.createFramebuffer();
    this.fboTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.fboTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 512, 512, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.fboTexture, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  resize() {
    if (!this.canvas || !this.container) return;
    const rect = this.container.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = Math.max(1, rect.width * dpr);
    this.height = Math.max(1, rect.height * dpr);

    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  setNewWave(x, y, power = 1) {
    const wave = this.waves[this.currentWave];
    this.currentWave = (this.currentWave + 1) % this.MAX_WAVES;
    wave.x = x;
    wave.y = y;
    wave.scale = this.START_SCALE * power;
    wave.target = this.START_SCALE * Math.max(1, this.options.spread) * power;
    wave.size = Math.max(1, this.options.brushSize);
    wave.opacity = 1;
  }

  initEvents() {
    let prevX = 0;
    let prevY = 0;

    const targetEl = typeof this.options.interactiveTarget === 'string'
      ? document.querySelector(this.options.interactiveTarget)
      : this.options.interactiveTarget || this.container;

    if (!targetEl) return;

    const onPointerMove = e => {
      const rect = this.container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (
        e.clientX < rect.left ||
        e.clientX > rect.right ||
        e.clientY < rect.top ||
        e.clientY > rect.bottom
      ) {
        return;
      }

      const x = (e.clientX - rect.left) * dpr;
      const y = (rect.height - (e.clientY - rect.top)) * dpr;

      const step = Math.max(1, this.options.spacing);
      if (Math.abs(x - prevX) > step || Math.abs(y - prevY) > step) {
        this.setNewWave(x, y, 1);
        prevX = x;
        prevY = y;
      }
    };

    targetEl.addEventListener('pointermove', onPointerMove, { passive: true });
  }

  animate(now) {
    requestAnimationFrame(this.animate);
    const gl = this.gl;
    if (!gl) return;

    const dt = Math.min(0.05, (now - this.lastTime) / 1000);
    this.lastTime = now;

    const growth = 1 - Math.exp(-dt * 1.09);
    const decay = Math.exp((-dt * this.LIFE_CONSTANT) / Math.max(0.15, this.options.fade));

    // 1. Render displacement waves to FBO
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
    gl.viewport(0, 0, 512, 512);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(this.waveProgram);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);

    gl.uniform1f(gl.getUniformLocation(this.waveProgram, 'uRings'), this.options.rings);

    const posLoc = gl.getAttribLocation(this.waveProgram, 'position');
    const uvLoc = gl.getAttribLocation(this.waveProgram, 'uv');
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 16, 0);
    gl.enableVertexAttribArray(uvLoc);
    gl.vertexAttribPointer(uvLoc, 2, gl.FLOAT, false, 16, 8);

    const offsetLoc = gl.getUniformLocation(this.waveProgram, 'uOffset');
    const scaleLoc = gl.getUniformLocation(this.waveProgram, 'uScale');
    const opacityLoc = gl.getUniformLocation(this.waveProgram, 'uOpacity');

    for (let i = 0; i < this.MAX_WAVES; i++) {
      const wave = this.waves[i];
      if (wave.opacity <= 0) continue;

      wave.opacity *= decay;
      wave.scale += (wave.target - wave.scale) * growth;

      if (wave.opacity < 0.002) {
        wave.opacity = 0;
        continue;
      }

      const half = (wave.scale * wave.size) / 2;
      const ox = (wave.x / this.width) * 2 - 1;
      const oy = (wave.y / this.height) * 2 - 1;
      const sx = (half / this.width) * 2;
      const sy = (half / this.height) * 2;

      gl.uniform2f(offsetLoc, ox, oy);
      gl.uniform2f(scaleLoc, sx, sy);
      gl.uniform1f(opacityLoc, wave.opacity);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    // 2. Render water wave highlights directly over section background
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this.width, this.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(this.screenProgram);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.fboTexture);
    gl.uniform1i(gl.getUniformLocation(this.screenProgram, 'uDisplacement'), 0);

    gl.uniform2f(gl.getUniformLocation(this.screenProgram, 'uTexel'), 1 / 512, 1 / 512);

    const tintRGB = this.hexToRGB(this.options.tint);
    gl.uniform3f(gl.getUniformLocation(this.screenProgram, 'uTint'), tintRGB[0], tintRGB[1], tintRGB[2]);
    gl.uniform1f(gl.getUniformLocation(this.screenProgram, 'uGlint'), this.options.glint);

    const cPosLoc = gl.getAttribLocation(this.screenProgram, 'position');
    const cUvLoc = gl.getAttribLocation(this.screenProgram, 'uv');
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
    gl.enableVertexAttribArray(cPosLoc);
    gl.vertexAttribPointer(cPosLoc, 2, gl.FLOAT, false, 16, 0);
    gl.enableVertexAttribArray(cUvLoc);
    gl.vertexAttribPointer(cUvLoc, 2, gl.FLOAT, false, 16, 8);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
}

window.RippleDistortion = RippleDistortion;
