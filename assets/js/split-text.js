/**
 * SplitText GSAP Kinetic Typography Controller
 * Staggered character & word entrance animations across ALL sections.
 * Guarantees every single section title (h2) and subtitle (p / span) enters with kinetic SplitText.
 */

(function () {
  'use strict';

  // Helper to split text into words and chars while preserving child nodes
  function splitNodeToSpans(node, mode) {
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

          if (mode === 'words') {
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
        const splitChild = splitNodeToSpans(child, mode);
        if (splitChild) clone.appendChild(splitChild);
      });
      return clone;
    }
    return node.cloneNode(true);
  }

  function splitElement(el, mode = 'chars') {
    if (!el || el.classList.contains('split-parent')) return [];

    el.classList.add('split-parent');
    const newChildren = Array.from(el.childNodes).map(child => splitNodeToSpans(child, mode));
    el.innerHTML = '';
    newChildren.forEach(child => el.appendChild(child));

    // Handle continuous multi-stop gradient for .gradient-text characters if present
    const gradientChars = Array.from(el.querySelectorAll('.gradient-text .split-char'));
    if (gradientChars.length > 1) {
      const stops = [
        { t: 0.0, r: 45, g: 212, b: 191 },
        { t: 0.3, r: 56, g: 189, b: 248 },
        { t: 0.7, r: 251, g: 146, b: 60 },
        { t: 1.0, r: 249, g: 115, b: 22 }
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

    return mode === 'words' 
      ? Array.from(el.querySelectorAll('.split-word'))
      : Array.from(el.querySelectorAll('.split-char'));
  }

  function initSectionHeaderAnimations() {
    if (typeof gsap === 'undefined') return;

    // 1. HERO TITLE SPECIAL KINETIC STREAM
    const heroTitle = document.getElementById('hero-main-title') || document.getElementById('hero-title');
    if (heroTitle && !heroTitle.classList.contains('split-parent')) {
      const heroChars = splitElement(heroTitle, 'chars');
      if (heroChars.length) {
        gsap.set(heroChars, { opacity: 0, yPercent: 115, y: 20, force3D: true });
        
        let isInHero = true;
        const handleHeroScroll = () => {
          const scrollY = window.scrollY || window.pageYOffset;
          const hideThreshold = window.innerHeight * 0.20;

          if (scrollY > hideThreshold && isInHero) {
            isInHero = false;
            gsap.to(heroChars, { opacity: 0, yPercent: -115, y: -20, duration: 0.6, ease: 'power2.in', stagger: 0.008, overwrite: 'auto' });
          } else if (scrollY <= hideThreshold && !isInHero) {
            isInHero = true;
            gsap.to(heroChars, { opacity: 1, yPercent: 0, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.02, overwrite: 'auto' });
          }
        };

        window.addEventListener('scroll', handleHeroScroll, { passive: true });

        setTimeout(() => {
          gsap.to(heroChars, { opacity: 1, yPercent: 0, y: 0, duration: 0.95, ease: 'power3.out', stagger: 0.022 });
        }, 120);
      }
    }

    // 2. FIND EVERY SECTION IN MAIN CONTENT STREAM
    const sections = Array.from(document.querySelectorAll('#main-content-stream section, #main-content-stream footer'));

    sections.forEach(sec => {
      // Find all heading elements inside this section
      const heading = sec.querySelector('h2');
      if (!heading) return;

      // Find badge (tag) and subtitle (p)
      const container = heading.closest('.text-center') || heading.parentElement;
      const badge = container ? container.querySelector('span') : null;
      const subtitle = container ? container.querySelector('p') : null;

      // Split elements
      const badgeItems = badge ? splitElement(badge, 'words') : [];
      const headingChars = splitElement(heading, 'chars');
      const subtitleWords = subtitle ? splitElement(subtitle, 'words') : [];

      // Set initial hidden state (below baseline)
      if (badgeItems.length) {
        gsap.set(badgeItems, { opacity: 0, yPercent: 80, force3D: true });
      }
      if (headingChars.length) {
        gsap.set(headingChars, { opacity: 0, yPercent: 110, rotateZ: 2, force3D: true });
      }
      if (subtitleWords.length) {
        gsap.set(subtitleWords, { opacity: 0, yPercent: 90, force3D: true });
      }

      let isRevealed = false;

      // Animation Timeline function
      const revealHeader = () => {
        if (isRevealed) return;
        isRevealed = true;

        const tl = gsap.timeline({ overwrite: 'auto' });

        if (badgeItems.length) {
          tl.to(badgeItems, {
            opacity: 1,
            yPercent: 0,
            duration: 0.6,
            ease: 'power3.out',
            stagger: 0.03
          }, 0);
        }

        if (headingChars.length) {
          const charStagger = Math.min(0.018, 0.6 / headingChars.length);
          tl.to(headingChars, {
            opacity: 1,
            yPercent: 0,
            rotateZ: 0,
            duration: 0.85,
            ease: 'power3.out',
            stagger: charStagger
          }, badgeItems.length ? 0.12 : 0);
        }

        if (subtitleWords.length) {
          const wordStagger = Math.min(0.025, 0.5 / subtitleWords.length);
          tl.to(subtitleWords, {
            opacity: 1,
            yPercent: 0,
            duration: 0.75,
            ease: 'power3.out',
            stagger: wordStagger
          }, headingChars.length ? 0.25 : 0);
        }
      };

      const resetHeader = () => {
        if (!isRevealed) return;
        isRevealed = false;

        if (badgeItems.length) {
          gsap.to(badgeItems, { opacity: 0, yPercent: 80, duration: 0.5, ease: 'power2.in', overwrite: 'auto' });
        }
        if (headingChars.length) {
          gsap.to(headingChars, { opacity: 0, yPercent: 110, rotateZ: 2, duration: 0.5, ease: 'power2.in', overwrite: 'auto' });
        }
        if (subtitleWords.length) {
          gsap.to(subtitleWords, { opacity: 0, yPercent: 90, duration: 0.5, ease: 'power2.in', overwrite: 'auto' });
        }
      };

      // Intersection Observer with threshold & rootMargin
      const targetObs = container || heading;
      const observer = new IntersectionObserver((entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          revealHeader();
        } else if (entry.boundingClientRect.top > (window.innerHeight || 800) * 0.9) {
          // Reset when scrolled back up above viewport
          resetHeader();
        }
      }, {
        threshold: [0, 0.15],
        rootMargin: '0px 0px -8% 0px'
      });

      observer.observe(targetObs);

      // Check initial position on load in case section is already in view
      const checkInitialView = () => {
        const rect = targetObs.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) {
          revealHeader();
        }
      };

      setTimeout(checkInitialView, 150);
    });
  }

  window.initAllSectionSplitText = initSectionHeaderAnimations;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSectionHeaderAnimations);
  } else {
    initSectionHeaderAnimations();
  }
})();
