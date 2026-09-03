/**
 * RippleDistortion WebGL Engine
 * High-performance liquid ripple distortion shader for LEALTIX
 */
class RippleDistortion {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    if (!this.container) return;

    this.options = Object.assign({
      src: 'assets/images/ImagotipoV.png',
      brushSize: 160,
      strength: 0.28,
      swirl: 0.8,
      rings: 3.5,
      spread: 6,
      fade: 2.8,
      spacing: 12,
      dispersion: 0.04,
      glint: 0.25,
      tint: '#00c4b4',
      tintAmount: 0.12,
      grayscale: false,
      highlightColor: '#ffffff',
      trigger: 'hover'
    }, options);

    this.MAX_WAVES = 80;
    this.START_SCALE = 1.5;
    this.LIFE_CONSTANT = Math.log(500);

    this.init();
  }

  init() {
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'ripple-distortion-canvas absolute inset-0 w-full h-full pointer-events-none rounded-2xl';
    this.canvas.style.opacity = '1';
    this.canvas.style.transition = 'opacity 0.4s ease';
    this.container.style.position = 'relative';
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
    this.initTexture();
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
    this.offsets = new Float32Array(this.MAX_WAVES * 2);
    this.scales = new Float32Array(this.MAX_WAVES * 2);
    this.opacities = new Float32Array(this.MAX_WAVES);
  }

  hexToRGB(hex) {
    const clean = hex.replace('#', '');
    const full = clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean;
    const n = parseInt(full, 16);
    if (Number.isNaN(n)) return [1, 1, 1];
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

    const compositeVS = `
      precision highp float;
      attribute vec2 position;
      attribute vec2 uv;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    const compositeFS = `
      precision highp float;
      varying vec2 vUv;
      uniform sampler2D uTexture;
      uniform sampler2D uDisplacement;
      uniform vec2 uResolution;
      uniform vec2 uTextureSize;
      uniform vec2 uTexel;
      uniform vec3 uTint;
      uniform vec3 uHighlight;
      uniform float uStrength;
      uniform float uSwirl;
      uniform float uDispersion;
      uniform float uGlint;
      uniform float uTintAmount;
      uniform float uGrayscale;
      const float TAU = 6.283185307179586;

      vec2 coverUV(vec2 uv) {
        vec2 safe = max(uTextureSize, vec2(1.0));
        vec2 s = uResolution / safe;
        vec2 scaledSize = safe * max(s.x, s.y);
        vec2 offset = (uResolution - scaledSize) * 0.5;
        return (uv * uResolution - offset) / scaledSize;
      }

      void main() {
        float amount = texture2D(uDisplacement, vUv).r;
        vec2 base = coverUV(vUv);
        float theta = amount * uSwirl * TAU;
        vec2 dir = vec2(sin(theta), cos(theta));
        vec2 push = dir * amount * uStrength;

        vec3 color;
        if (uDispersion > 0.001) {
          float split = uDispersion * 0.25;
          color.r = texture2D(uTexture, base + push * (1.0 + split)).r;
          color.g = texture2D(uTexture, base + push).g;
          color.b = texture2D(uTexture, base + push * (1.0 - split)).b;
        } else {
          color = texture2D(uTexture, base + push).rgb;
        }

        if (uGrayscale > 0.001) {
          color = mix(color, vec3(dot(color, vec3(0.2126, 0.7152, 0.0722))), uGrayscale);
        }

        if (uTintAmount > 0.001) {
          color = mix(color, color * uTint * 1.9, clamp(amount * 1.6, 0.0, 1.0) * uTintAmount);
        }

        if (uGlint > 0.001) {
          float ex = texture2D(uDisplacement, vUv + vec2(uTexel.x, 0.0)).r - texture2D(uDisplacement, vUv - vec2(uTexel.x, 0.0)).r;
          float ey = texture2D(uDisplacement, vUv + vec2(0.0, uTexel.y)).r - texture2D(uDisplacement, vUv - vec2(0.0, uTexel.y)).r;
          vec3 normal = normalize(vec3(-ex * 26.0, -ey * 26.0, 1.0));
          vec3 light = normalize(vec3(-0.35, 0.55, 1.0));
          float raw = pow(max(dot(normal, light), 0.0), 22.0);
          float flatSpec = pow(max(light.z, 0.0), 22.0);
          color += uHighlight * clamp((raw - flatSpec) / max(1.0 - flatSpec, 0.0001), 0.0, 1.0) * uGlint;
        }

        gl_FragColor = vec4(color, 1.0);
      }
    `;

    this.waveProgram = this.createProgram(waveVS, waveFS);
    this.compositeProgram = this.createProgram(compositeVS, compositeFS);
  }

  initBuffers() {
    const gl = this.gl;

    // Full screen Quad
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

    // Framebuffer for displacement simulation
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

  initTexture() {
    const gl = this.gl;
    this.imageTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.imageTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    this.textureSize = [1200, 900];
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      this.textureSize = [image.naturalWidth || 1200, image.naturalHeight || 900];
      gl.bindTexture(gl.TEXTURE_2D, this.imageTexture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    };
    image.src = this.options.src;
  }

  resize() {
    if (!this.canvas || !this.container) return;
    const rect = this.container.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = Math.max(1, rect.width * dpr);
    this.height = Math.max(1, rect.height * dpr);

    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.gl.viewport(0, 0, this.width, this.height);
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

    const onPointerMove = e => {
      const rect = this.container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (
        e.clientX < rect.left ||
        e.clientX > rect.right ||
        e.clientY < rect.top ||
        e.clientY > rect.bottom
      ) return;

      const x = (e.clientX - rect.left) * dpr;
      const y = (rect.height - (e.clientY - rect.top)) * dpr;

      const step = Math.max(1, this.options.spacing);
      if (Math.abs(x - prevX) > step || Math.abs(y - prevY) > step) {
        this.setNewWave(x, y, 1);
        prevX = x;
        prevY = y;
      }
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });

    // Initial ambient water drops
    setTimeout(() => {
      this.setNewWave(this.width * 0.5, this.height * 0.5, 1.2);
    }, 500);
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

    // 2. Render composite pass to screen
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this.width, this.height);
    gl.disable(gl.BLEND);

    gl.useProgram(this.compositeProgram);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.imageTexture);
    gl.uniform1i(gl.getUniformLocation(this.compositeProgram, 'uTexture'), 0);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.fboTexture);
    gl.uniform1i(gl.getUniformLocation(this.compositeProgram, 'uDisplacement'), 1);

    gl.uniform2f(gl.getUniformLocation(this.compositeProgram, 'uResolution'), this.width, this.height);
    gl.uniform2f(gl.getUniformLocation(this.compositeProgram, 'uTextureSize'), this.textureSize[0], this.textureSize[1]);
    gl.uniform2f(gl.getUniformLocation(this.compositeProgram, 'uTexel'), 1 / 512, 1 / 512);

    const tintRGB = this.hexToRGB(this.options.tint);
    const highlightRGB = this.hexToRGB(this.options.highlightColor);
    gl.uniform3f(gl.getUniformLocation(this.compositeProgram, 'uTint'), tintRGB[0], tintRGB[1], tintRGB[2]);
    gl.uniform3f(gl.getUniformLocation(this.compositeProgram, 'uHighlight'), highlightRGB[0], highlightRGB[1], highlightRGB[2]);
    gl.uniform1f(gl.getUniformLocation(this.compositeProgram, 'uStrength'), this.options.strength);
    gl.uniform1f(gl.getUniformLocation(this.compositeProgram, 'uSwirl'), this.options.swirl);
    gl.uniform1f(gl.getUniformLocation(this.compositeProgram, 'uDispersion'), this.options.dispersion);
    gl.uniform1f(gl.getUniformLocation(this.compositeProgram, 'uGlint'), this.options.glint);
    gl.uniform1f(gl.getUniformLocation(this.compositeProgram, 'uTintAmount'), this.options.tintAmount);
    gl.uniform1f(gl.getUniformLocation(this.compositeProgram, 'uGrayscale'), this.options.grayscale ? 1 : 0);

    const cPosLoc = gl.getAttribLocation(this.compositeProgram, 'position');
    const cUvLoc = gl.getAttribLocation(this.compositeProgram, 'uv');
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
    gl.enableVertexAttribArray(cPosLoc);
    gl.vertexAttribPointer(cPosLoc, 2, gl.FLOAT, false, 16, 0);
    gl.enableVertexAttribArray(cUvLoc);
    gl.vertexAttribPointer(cUvLoc, 2, gl.FLOAT, false, 16, 8);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
}

window.RippleDistortion = RippleDistortion;
