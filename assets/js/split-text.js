/**
 * SplitText GSAP Kinetic Typography Controller
 * Staggered character entrance & exit animation for LEALTIX Hero Title (Bottom to Top, Letter by Letter)
 * Accurately maps continuous color gradients across characters
 */
class SplitTextAnimation {
  constructor(target, options = {}) {
    this.el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!this.el) return;

    this.options = Object.assign({
      delay: 28, // ms between each character
      duration: 0.95,
      ease: 'power3.out',
      from: { opacity: 0, yPercent: 115, y: 25 },
      to: { opacity: 1, yPercent: 0, y: 0 },
      exitTo: { opacity: 0, yPercent: -115, y: -25 },
      trigger: this.el
    }, options);

    this.init();
  }

  init() {
    this.splitElements();
    this.initAnimation();
  }

  splitElements() {
    this.el.classList.add('split-parent');

    // Recursively split text nodes while preserving span wrappers (such as .gradient-text)
    const splitNode = node => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent;
        if (!text.trim()) return document.createTextNode(text);

        const fragment = document.createDocumentFragment();
        const words = text.split(/(\s+)/);

        words.forEach(word => {
          if (/^\s+$/.test(word)) {
            fragment.appendChild(document.createTextNode(word));
          } else if (word) {
            const wordSpan = document.createElement('span');
            wordSpan.className = 'split-word';

            for (const char of word) {
              const charSpan = document.createElement('span');
              charSpan.className = 'split-char';
              charSpan.textContent = char;
              wordSpan.appendChild(charSpan);
            }
            fragment.appendChild(wordSpan);
          }
        });
        return fragment;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const clone = node.cloneNode(false);
        Array.from(node.childNodes).forEach(child => {
          const splitChild = splitNode(child);
          if (splitChild) clone.appendChild(splitChild);
        });
        return clone;
      }
      return node.cloneNode(true);
    };

    const newChildren = Array.from(this.el.childNodes).map(splitNode);
    this.el.innerHTML = '';
    newChildren.forEach(child => this.el.appendChild(child));

    // Map smooth continuous multi-stop gradient across .gradient-text characters
    const gradientChars = Array.from(this.el.querySelectorAll('.gradient-text .split-char'));
    if (gradientChars.length > 1) {
      const stops = [
        { t: 0.0, r: 45, g: 212, b: 191 },   // #2dd4bf Teal
        { t: 0.3, r: 56, g: 189, b: 248 },   // #38bdf8 Sky Blue
        { t: 0.7, r: 251, g: 146, b: 60 },   // #fb923c Amber
        { t: 1.0, r: 249, g: 115, b: 22 }    // #f97316 Vibrant Orange
      ];

      const interpolateColor = t => {
        t = Math.max(0, Math.min(1, t));
        for (let i = 0; i < stops.length - 1; i++) {
          const s0 = stops[i];
          const s1 = stops[i + 1];
          if (t >= s0.t && t <= s1.t) {
            const localT = (t - s0.t) / (s1.t - s0.t);
            const r = Math.round(s0.r + (s1.r - s0.r) * localT);
            const g = Math.round(s0.g + (s1.g - s0.g) * localT);
            const b = Math.round(s0.b + (s1.b - s0.b) * localT);
            return `rgb(${r}, ${g}, ${b})`;
          }
        }
        const last = stops[stops.length - 1];
        return `rgb(${last.r}, ${last.g}, ${last.b})`;
      };

      gradientChars.forEach((charEl, idx) => {
        const factor = idx / (gradientChars.length - 1);
        const col = interpolateColor(factor);
        charEl.style.color = col;
        charEl.style.webkitTextFillColor = col;
      });
    }

    this.chars = Array.from(this.el.querySelectorAll('.split-char'));
  }

  initAnimation() {
    if (typeof gsap === 'undefined') return;

    if (typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }

    // Set initial from state (below the baseline)
    gsap.set(this.chars, {
      ...this.options.from,
      force3D: true
    });

    // Entrance and Exit ScrollTrigger (al entrar y salir)
    ScrollTrigger.create({
      trigger: this.options.trigger,
      start: 'top 85%',
      end: 'bottom 15%',
      onEnter: () => this.animateIn(),
      onLeave: () => this.animateOut(),
      onEnterBack: () => this.animateIn(),
      onLeaveBack: () => this.animateOut()
    });

    // Initial entrance on page load
    this.animateIn();
  }

  animateIn() {
    if (!this.chars || !this.chars.length) return;
    gsap.to(this.chars, {
      ...this.options.to,
      duration: this.options.duration,
      ease: this.options.ease,
      stagger: this.options.delay / 1000,
      overwrite: 'auto'
    });
  }

  animateOut() {
    if (!this.chars || !this.chars.length) return;
    gsap.to(this.chars, {
      ...this.options.exitTo,
      duration: this.options.duration * 0.7,
      ease: 'power2.in',
      stagger: (this.options.delay * 0.45) / 1000,
      overwrite: 'auto'
    });
  }
}

window.SplitTextAnimation = SplitTextAnimation;
