/**
 * SplitText GSAP Kinetic Typography Controller
 * Staggered character entrance & exit animation for LEALTIX Hero Title
 */
class SplitTextAnimation {
  constructor(target, options = {}) {
    this.el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!this.el) return;

    this.options = Object.assign({
      delay: 35, // ms between chars
      duration: 1.25,
      ease: 'power3.out',
      from: { opacity: 0, y: 45, rotateX: -20 },
      to: { opacity: 1, y: 0, rotateX: 0 },
      exitTo: { opacity: 0, y: -40, rotateX: 20 },
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

    this.chars = Array.from(this.el.querySelectorAll('.split-char'));
  }

  initAnimation() {
    if (typeof gsap === 'undefined') return;

    if (typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }

    // Set initial from state
    gsap.set(this.chars, {
      ...this.options.from,
      transformPerspective: 800,
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
      stagger: (this.options.delay * 0.5) / 1000,
      overwrite: 'auto'
    });
  }
}

window.SplitTextAnimation = SplitTextAnimation;
