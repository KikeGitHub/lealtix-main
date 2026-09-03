/**
 * SplitText GSAP Kinetic Typography Controller
 * Staggered character & word entrance and exit animations across all sections.
 * Automatically initializes on section titles and subtitles with ScrollTrigger bidirectional transitions.
 */

class SplitTextAnimation {
  constructor(target, options = {}) {
    this.el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!this.el) return;

    this.options = Object.assign({
      mode: 'chars', // 'chars' or 'words'
      delay: 20, // ms between items
      duration: 0.8,
      ease: 'power3.out',
      fromY: 110,
      trigger: this.el,
      isHero: false
    }, options);

    this.init();
  }

  init() {
    this.splitElements();
    if (this.options.isHero) {
      this.initHeroAnimation();
    } else {
      this.initScrollTriggerAnimation();
    }
  }

  splitElements() {
    this.el.classList.add('split-parent');

    // Recursively split text nodes while preserving span wrappers (such as .gradient-text, bold, etc.)
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

            if (this.options.mode === 'words') {
              wordSpan.textContent = word;
            } else {
              for (const char of word) {
                const charSpan = document.createElement('span');
                charSpan.className = 'split-char';
                charSpan.textContent = char;
                wordSpan.appendChild(charSpan);
              }
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

    // Map smooth continuous multi-stop gradient across .gradient-text characters if present
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

    this.items = this.options.mode === 'words' 
      ? Array.from(this.el.querySelectorAll('.split-word'))
      : Array.from(this.el.querySelectorAll('.split-char'));
  }

  initHeroAnimation() {
    if (typeof gsap === 'undefined' || !this.items.length) return;

    gsap.set(this.items, {
      opacity: 0,
      yPercent: 115,
      y: 20,
      force3D: true
    });

    let isInHero = true;
    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      const hideThreshold = window.innerHeight * 0.20;

      if (scrollY > hideThreshold && isInHero) {
        isInHero = false;
        gsap.to(this.items, {
          opacity: 0,
          yPercent: -115,
          y: -20,
          duration: 0.6,
          ease: 'power2.in',
          stagger: 0.008,
          overwrite: 'auto'
        });
      } else if (scrollY <= hideThreshold && !isInHero) {
        isInHero = true;
        gsap.to(this.items, {
          opacity: 1,
          yPercent: 0,
          y: 0,
          duration: 0.9,
          ease: 'power3.out',
          stagger: 0.02,
          overwrite: 'auto'
        });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    setTimeout(() => {
      gsap.to(this.items, {
        opacity: 1,
        yPercent: 0,
        y: 0,
        duration: 0.95,
        ease: 'power3.out',
        stagger: 0.024
      });
    }, 120);
  }

  initScrollTriggerAnimation() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' || !this.items.length) return;

    // Set initial hidden state
    gsap.set(this.items, {
      opacity: 0,
      yPercent: this.options.fromY,
      force3D: true
    });

    const triggerEl = this.options.trigger || this.el.closest('.text-center') || this.el.closest('section') || this.el;
    const staggerTime = Math.min(0.025, 0.6 / Math.max(1, this.items.length));

    ScrollTrigger.create({
      trigger: triggerEl,
      start: 'top 88%',
      onEnter: () => {
        gsap.to(this.items, {
          opacity: 1,
          yPercent: 0,
          duration: this.options.duration,
          ease: 'power3.out',
          stagger: staggerTime,
          overwrite: 'auto'
        });
      },
      onEnterBack: () => {
        gsap.to(this.items, {
          opacity: 1,
          yPercent: 0,
          duration: this.options.duration * 0.6,
          ease: 'power3.out',
          stagger: staggerTime * 0.5,
          overwrite: 'auto'
        });
      },
      onLeaveBack: () => {
        gsap.to(this.items, {
          opacity: 0,
          yPercent: this.options.fromY,
          duration: this.options.duration * 0.6,
          ease: 'power2.in',
          stagger: staggerTime * 0.5,
          overwrite: 'auto'
        });
      }
    });
  }
}

// Auto-initialize SplitText on all non-hero sections
function initAllSectionSplitText() {
  // 1. Hero Title (Character level)
  const heroTitle = document.querySelector('#hero-main-title') || document.querySelector('#hero-title');
  if (heroTitle && !heroTitle.classList.contains('split-parent')) {
    new SplitTextAnimation(heroTitle, {
      isHero: true,
      mode: 'chars',
      delay: 24,
      duration: 0.95
    });
  }

  // 2. All Section Headings (H2) outside Hero
  const sectionHeadings = document.querySelectorAll('#main-content-stream section h2');
  sectionHeadings.forEach(h2 => {
    new SplitTextAnimation(h2, {
      mode: 'chars',
      duration: 0.85,
      fromY: 105,
      trigger: h2.closest('.text-center') || h2
    });
  });

  // 3. All Section Subtitles (P) and Upper category badges in section headers
  const sectionSubtitles = document.querySelectorAll('#main-content-stream section .text-center > p, #main-content-stream section .text-center > span.font-mono');
  sectionSubtitles.forEach(sub => {
    new SplitTextAnimation(sub, {
      mode: 'words',
      duration: 0.75,
      fromY: 90,
      trigger: sub.closest('.text-center') || sub
    });
  });
}

window.SplitTextAnimation = SplitTextAnimation;
window.initAllSectionSplitText = initAllSectionSplitText;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAllSectionSplitText);
} else {
  initAllSectionSplitText();
}
