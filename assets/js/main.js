/**
 * LEALTIX v1.0 - Interactive Logic & SaaS Engine
 * Full interaction controller for HORECA Loyalty Platform
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initNavbarScroll();
  initSpecularEffect();
  initHeroTitleSplitText();
  initHeroVideoFade();
  initHeroVideoCrossDissolve();
  initCtaRipple();
  initRoiCalculator();
  initPricingToggle();
  initDashboardSimulator();
  initSolutionsTabs();
  initDemoModal();
  initFaqAccordion();
  initLealboxChatbot();
});

function initHeroVideoCrossDissolve() {
  const videoA = document.getElementById('hero-video-a');
  const videoB = document.getElementById('hero-video-b');
  if (!videoA || !videoB) return;

  const PLAYBACK_RATE = 0.75; // 75% video playback speed
  videoA.playbackRate = PLAYBACK_RATE;
  videoB.playbackRate = PLAYBACK_RATE;

  // Ensure playback rate remains 0.75 when video plays
  videoA.addEventListener('play', () => { videoA.playbackRate = PLAYBACK_RATE; });
  videoB.addEventListener('play', () => { videoB.playbackRate = PLAYBACK_RATE; });

  const DISSOLVE_TIME = 1.0; // 1 second cross-dissolve overlap
  let isDissolving = false;
  let activeVideo = videoA;
  let nextVideo = videoB;

  videoA.play().catch(() => {});

  const checkDissolve = () => {
    requestAnimationFrame(checkDissolve);

    if (!activeVideo.duration || Number.isNaN(activeVideo.duration)) return;

    const remaining = activeVideo.duration - activeVideo.currentTime;

    if (remaining <= DISSOLVE_TIME && !isDissolving) {
      isDissolving = true;
      nextVideo.currentTime = 0;
      nextVideo.playbackRate = PLAYBACK_RATE;
      nextVideo.play().then(() => {
        // Smooth cross-dissolve transition: nextVideo fades to 100% opacity, activeVideo fades out
        nextVideo.style.opacity = '1';
        activeVideo.style.opacity = '0';

        setTimeout(() => {
          activeVideo.pause();
          activeVideo.currentTime = 0;
          // Swap active/next roles
          const temp = activeVideo;
          activeVideo = nextVideo;
          nextVideo = temp;
          isDissolving = false;
        }, (DISSOLVE_TIME * 1000) + 60);
      }).catch(() => {
        isDissolving = false;
      });
    }
  };

  requestAnimationFrame(checkDissolve);
}

function initHeroVideoFade() {
  const videoWrapper = document.getElementById('hero-video-wrapper');
  const ctaWrapper = document.getElementById('hero-cta-wrapper');
  const bottomGroup = document.getElementById('hero-bottom-group');

  const onScroll = () => {
    const scrollY = window.scrollY || window.pageYOffset;
    const vh = window.innerHeight || 800;

    // Fade and slide smoothly as subsequent sections slide over the hero
    const progress = Math.min(1, Math.max(0, scrollY / (vh * 0.32)));
    const opacity = Math.max(0, 1 - Math.pow(progress, 1.3));
    const translateY = (-progress * 28).toFixed(1);

    if (videoWrapper) {
      videoWrapper.style.opacity = opacity.toFixed(3);
      videoWrapper.style.transform = `scale(${(1 + progress * 0.04).toFixed(3)})`;
    }

    if (ctaWrapper) {
      ctaWrapper.style.opacity = opacity.toFixed(3);
      ctaWrapper.style.transform = `translate3d(0, ${translateY}px, 0)`;
      ctaWrapper.style.pointerEvents = opacity < 0.1 ? 'none' : 'auto';
    }

    if (bottomGroup) {
      bottomGroup.style.opacity = opacity.toFixed(3);
      bottomGroup.style.transform = `translate3d(0, ${translateY}px, 0)`;
      bottomGroup.style.pointerEvents = opacity < 0.1 ? 'none' : 'auto';
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

function initHeroTitleSplitText() {
  if (typeof window.initAllSectionSplitText === 'function') {
    window.initAllSectionSplitText();
  }
}

function initCtaRipple() {
  const container = document.getElementById('cta-ripple-container');
  if (!container || typeof RippleDistortion === 'undefined') return;

  new RippleDistortion('#cta-ripple-container', {
    interactiveTarget: '#cta-section',
    brushSize: 180,
    rings: 3.5,
    spread: 6.5,
    fade: 2.8,
    spacing: 10,
    glint: 0.85,
    tint: '#2dd4bf'
  });
}

/* ==========================================================================
   1. Navigation & Mobile Menu
   ========================================================================== */
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  if (!toggleBtn || !mobileMenu) return;

  toggleBtn.addEventListener('click', () => {
    const isHidden = mobileMenu.classList.contains('hidden-drawer');
    if (isHidden) {
      mobileMenu.classList.remove('hidden-drawer');
      mobileMenu.classList.add('visible-drawer');
      toggleBtn.innerHTML = '<span class="material-symbols-outlined text-3xl text-on-surface">close</span>';
    } else {
      mobileMenu.classList.add('hidden-drawer');
      mobileMenu.classList.remove('visible-drawer');
      toggleBtn.innerHTML = '<span class="material-symbols-outlined text-3xl text-on-surface">menu</span>';
    }
  });

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.add('hidden-drawer');
      mobileMenu.classList.remove('visible-drawer');
      toggleBtn.innerHTML = '<span class="material-symbols-outlined text-3xl text-on-surface">menu</span>';
    });
  });
}

function initNavbarScroll() {
  const navbar = document.getElementById('main-nav');
  const logoImg = document.getElementById('nav-brand-logo');
  if (!navbar) return;

  let currentLogo = 'isotipo';

  function updateNavbarState() {
    const scrollY = window.scrollY || window.pageYOffset;
    const navHeight = navbar.offsetHeight || 80;
    const probeY = navHeight / 2; // Exact probe line under header
    const isHero = scrollY < (window.innerHeight * 0.3);

    // Dynamic Logo Switch: Isotipo in Hero, ImagotipoH2 in other sections
    if (logoImg) {
      if (isHero && currentLogo !== 'isotipo') {
        currentLogo = 'isotipo';
        logoImg.style.opacity = '0';
        setTimeout(() => {
          logoImg.src = 'assets/images/isotipo.png';
          logoImg.className = 'h-9 sm:h-10 w-auto object-contain transition-all duration-300 group-hover:scale-105';
          logoImg.style.opacity = '1';
        }, 120);
      } else if (!isHero && currentLogo !== 'imagotipo') {
        currentLogo = 'imagotipo';
        logoImg.style.opacity = '0';
        setTimeout(() => {
          logoImg.src = 'assets/images/ImagotipoH2.png';
          logoImg.className = 'h-8 sm:h-[38px] w-auto object-contain transition-all duration-300 group-hover:scale-105';
          logoImg.style.opacity = '1';
        }, 120);
      }
    }

    // If in Hero range, force transparent header (Zero background)
    if (isHero) {
      navbar.classList.remove('header-theme-light', 'header-theme-dark');
      navbar.classList.add('header-theme-transparent');
    } else {
      navbar.classList.remove('header-theme-transparent', 'header-theme-dark');
      navbar.classList.add('header-theme-light');
    }
  }

  window.addEventListener('scroll', () => {
    updateNavbarState();
    highlightActiveNavLink();
  }, { passive: true });

  // Initial trigger
  updateNavbarState();
  highlightActiveNavLink();
}

function highlightActiveNavLink() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  let currentSection = '';

  sections.forEach(sec => {
    const top = sec.offsetTop - 120;
    const height = sec.offsetHeight;
    if (window.scrollY >= top && window.scrollY < top + height) {
      currentSection = sec.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${currentSection}`) {
      link.classList.add('active');
    }
  });
}

/* ==========================================================================
   2. Interactive ROI Calculator
   ========================================================================== */
function initRoiCalculator() {
  const dailyVisitsInput = document.getElementById('roi-visits-input');
  const dailyVisitsSlider = document.getElementById('roi-visits-slider');
  const avgTicketInput = document.getElementById('roi-ticket-input');
  const avgTicketSlider = document.getElementById('roi-ticket-slider');
  
  const monthlyProfitEl = document.getElementById('roi-monthly-profit');
  const annualProfitEl = document.getElementById('roi-annual-profit');
  const extraVisitsEl = document.getElementById('roi-extra-visits');
  const roiMultiplierEl = document.getElementById('roi-multiplier');

  if (!dailyVisitsInput || !avgTicketInput) return;

  function calculateROI() {
    const visits = Math.max(10, parseInt(dailyVisitsInput.value) || 120);
    const ticket = Math.max(1, parseFloat(avgTicketInput.value) || 25);
    
    // Sync slider values
    if (dailyVisitsSlider) dailyVisitsSlider.value = visits;
    if (avgTicketSlider) avgTicketSlider.value = ticket;

    // HORECA Benchmarks:
    // Monthly total visits = visits * 30 days
    // 15% increase in repeat customer retention rate
    // Incremental visits per month = visits * 30 * 0.15
    // Typical HORECA gross margin on incremental sales = 60%
    const monthlyTotalVisits = visits * 30;
    const incrementalVisits = Math.round(monthlyTotalVisits * 0.15);
    const grossIncrementalRevenue = incrementalVisits * ticket;
    const estimatedNetProfit = Math.round(grossIncrementalRevenue * 0.60);
    const annualNetProfit = estimatedNetProfit * 12;

    // ROI Multiplier based on Lealtix Pro ($129/mo)
    const proCostMonthly = 129;
    const multiplier = (estimatedNetProfit / proCostMonthly).toFixed(1);

    // Animate numbers
    if (monthlyProfitEl) monthlyProfitEl.textContent = `+$${estimatedNetProfit.toLocaleString('en-US')}`;
    if (annualProfitEl) annualProfitEl.textContent = `+$${annualNetProfit.toLocaleString('en-US')}`;
    if (extraVisitsEl) extraVisitsEl.textContent = `+${incrementalVisits.toLocaleString('en-US')} visitas/mes`;
    if (roiMultiplierEl) roiMultiplierEl.textContent = `${multiplier}x ROI`;
  }

  // Event Listeners for inputs and sliders
  dailyVisitsInput.addEventListener('input', () => {
    calculateROI();
  });

  avgTicketInput.addEventListener('input', () => {
    calculateROI();
  });

  if (dailyVisitsSlider) {
    dailyVisitsSlider.addEventListener('input', (e) => {
      dailyVisitsInput.value = e.target.value;
      calculateROI();
    });
  }

  if (avgTicketSlider) {
    avgTicketSlider.addEventListener('input', (e) => {
      avgTicketInput.value = e.target.value;
      calculateROI();
    });
  }

  // Quick preset buttons
  const presetBtns = document.querySelectorAll('.roi-preset-btn');
  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      presetBtns.forEach(b => b.classList.remove('bg-secondary', 'text-white'));
      btn.classList.add('bg-secondary', 'text-white');
      dailyVisitsInput.value = btn.dataset.visits;
      avgTicketInput.value = btn.dataset.ticket;
      calculateROI();
    });
  });

  // Initial calculation
  calculateROI();
}

/* ==========================================================================
   3. Pricing Toggle (Mensual / Anual)
   ========================================================================== */
function initPricingToggle() {
  const toggleBtn = document.getElementById('pricing-toggle-btn');
  const priceStart = document.getElementById('price-start');
  const pricePro = document.getElementById('price-pro');
  const priceBusiness = document.getElementById('price-business');
  const periodLabels = document.querySelectorAll('.pricing-period');

  if (!toggleBtn) return;

  let isAnnual = false;

  const prices = {
    monthly: { start: '$500', pro: '$1,200', business: 'A medida' },
    annual: { start: '$400', pro: '$960', business: 'A medida' }
  };

  toggleBtn.addEventListener('click', () => {
    isAnnual = !isAnnual;
    toggleBtn.classList.toggle('annual', isAnnual);

    const activeSet = isAnnual ? prices.annual : prices.monthly;
    
    // Animate change
    [priceStart, pricePro, priceBusiness].forEach(el => {
      if (el) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(-6px)';
      }
    });

    setTimeout(() => {
      if (priceStart) priceStart.textContent = activeSet.start;
      if (pricePro) pricePro.textContent = activeSet.pro;
      if (priceBusiness) priceBusiness.textContent = activeSet.business;
      
      periodLabels.forEach(lbl => {
        lbl.textContent = isAnnual ? '/mes (facturado anual)' : '/mes';
      });

      [priceStart, pricePro, priceBusiness].forEach(el => {
        if (el) {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        }
      });
    }, 150);
  });
}

/* ==========================================================================
   4. Live Interactive Dashboard Simulator & Canvas Chart
   ========================================================================== */
function initDashboardSimulator() {
  const canvas = document.getElementById('dashboard-chart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let animationProgress = 0;

  // Resize canvas for sharp retina displays
  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    drawChart(1);
  }

  const datasets = {
    general: [24, 38, 52, 45, 68, 85, 94, 110, 125, 142, 168, 195],
    wallet: [12, 22, 35, 48, 62, 79, 95, 118, 134, 155, 180, 210],
    campaigns: [8, 15, 28, 40, 32, 58, 70, 88, 92, 115, 130, 150]
  };

  let currentDataset = 'general';

  function drawChart(progress) {
    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    const data = datasets[currentDataset];
    const maxVal = 220;

    ctx.clearRect(0, 0, w, h);

    // Draw horizontal grid lines
    ctx.strokeStyle = 'rgba(11, 28, 48, 0.06)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
      const y = (h / 4) * i + 20;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Gradient fill under curve
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, 'rgba(0, 106, 97, 0.35)');
    gradient.addColorStop(0.7, 'rgba(0, 106, 97, 0.05)');
    gradient.addColorStop(1, 'rgba(0, 106, 97, 0.0)');

    const stepX = w / (data.length - 1);
    const points = data.map((val, idx) => {
      const targetY = h - (val / maxVal) * (h - 40) - 20;
      const currentY = h - (val * progress / maxVal) * (h - 40) - 20;
      return { x: idx * stepX, y: currentY };
    });

    // Draw Area Fill
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 0; i < points.length - 1; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2;
      const yc = (points[i].y + points[i + 1].y) / 2;
      ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }
    ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw Main Line
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 0; i < points.length - 1; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2;
      const yc = (points[i].y + points[i + 1].y) / 2;
      ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }
    ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
    ctx.strokeStyle = '#006a61';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw Glowing Data Points
    points.forEach((p, idx) => {
      if (idx % 3 === 0 || idx === points.length - 1) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.strokeStyle = '#006a61';
        ctx.lineWidth = 2.5;
        ctx.stroke();
      }
    });
  }

  function animateChart() {
    let start = null;
    const duration = 600;

    function step(timestamp) {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      drawChart(easeProgress);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }
    requestAnimationFrame(step);
  }

  window.addEventListener('resize', resizeCanvas);
  setTimeout(resizeCanvas, 100);

  // Tab buttons for dashboard views
  const dashTabBtns = document.querySelectorAll('.dash-filter-btn');
  dashTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      dashTabBtns.forEach(b => {
        b.classList.remove('bg-secondary', 'text-white');
        b.classList.add('bg-surface-container-low', 'text-on-surface-variant');
      });
      btn.classList.add('bg-secondary', 'text-white');
      btn.classList.remove('bg-surface-container-low', 'text-on-surface-variant');
      
      currentDataset = btn.dataset.view;
      animateChart();
    });
  });

  // Live Activity Feed Ticker Simulation
  const liveTickerList = document.getElementById('live-activity-ticker');
  const activities = [
    { name: 'Ana M.', action: 'Registró consumo en Mesa 12 (+180 pts)', time: 'Hace 1 min', icon: 'receipt_long', color: 'text-secondary' },
    { name: 'Carlos R.', action: 'Canjeó Postre Cumpleañero', time: 'Hace 3 min', icon: 'cake', color: 'text-roi-orange' },
    { name: 'Sofia T.', action: 'Instaló pase en Apple Wallet', time: 'Hace 5 min', icon: 'wallet', color: 'text-secondary' },
    { name: 'David L.', action: 'Reactivado tras 30 días sin visitas', time: 'Hace 8 min', icon: 'autorenew', color: 'text-success' },
    { name: 'Lucía G.', action: 'Alcanzó Nivel VIP Platinum (+350 pts)', time: 'Hace 12 min', icon: 'workspace_premium', color: 'text-secondary' }
  ];

  if (liveTickerList) {
    let activityIndex = 0;
    setInterval(() => {
      const item = activities[activityIndex % activities.length];
      const el = document.createElement('div');
      el.className = 'flex items-center justify-between p-3 rounded-lg bg-surface-container-lowest border border-outline-variant/30 text-xs transition-all transform -translate-y-2 opacity-0 duration-300';
      el.innerHTML = `
        <div class="flex items-center gap-3">
          <div class="w-7 h-7 rounded-full bg-secondary-surface flex items-center justify-center text-secondary font-bold">
            <span class="material-symbols-outlined text-[16px]">${item.icon}</span>
          </div>
          <div>
            <span class="font-bold text-on-surface">${item.name}</span>
            <span class="text-on-surface-variant ml-1">${item.action}</span>
          </div>
        </div>
        <span class="text-[11px] text-outline whitespace-nowrap ml-2 font-mono">${item.time}</span>
      `;

      liveTickerList.insertBefore(el, liveTickerList.firstChild);
      
      setTimeout(() => {
        el.classList.remove('-translate-y-2', 'opacity-0');
      }, 50);

      if (liveTickerList.children.length > 4) {
        liveTickerList.removeChild(liveTickerList.lastChild);
      }

      activityIndex++;
    }, 4500);
  }
}

/* ==========================================================================
   5. Solutions Tabs Interactivity
   ========================================================================== */
function initSolutionsTabs() {
  const tabButtons = document.querySelectorAll('.solution-tab-btn');
  const tabPanels = document.querySelectorAll('.solution-panel');

  if (!tabButtons.length) return;

  const activateTab = (btn) => {
    const targetId = btn.dataset.target;

    tabButtons.forEach(b => {
      b.classList.remove('active');
    });

    btn.classList.add('active');

    tabPanels.forEach(panel => {
      panel.classList.add('hidden');
      if (panel.id === targetId) {
        panel.classList.remove('hidden');
        panel.classList.add('animate-fadeIn');
      }
    });
  };

  tabButtons.forEach(btn => {
    // Switch automatically on hover (mouseenter / pointerenter)
    btn.addEventListener('mouseenter', () => activateTab(btn));
    btn.addEventListener('pointerenter', () => activateTab(btn));
    // Support click for mobile touchscreens
    btn.addEventListener('click', () => activateTab(btn));
  });
}

/* ==========================================================================
   6. Demo Booking Modal
   ========================================================================== */
function initDemoModal() {
  const modal = document.getElementById('demo-modal');
  const openBtns = document.querySelectorAll('.open-demo-modal');
  const closeBtns = document.querySelectorAll('.close-demo-modal');
  const demoForm = document.getElementById('demo-form');
  const successState = document.getElementById('demo-success-state');

  if (!modal) return;

  function openModal() {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = '';
    // Reset state after transition
    setTimeout(() => {
      if (demoForm) demoForm.classList.remove('hidden');
      if (successState) successState.classList.add('hidden');
    }, 300);
  }

  openBtns.forEach(btn => btn.addEventListener('click', openModal));
  closeBtns.forEach(btn => btn.addEventListener('click', closeModal));

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
      closeModal();
    }
  });

  if (demoForm) {
    demoForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = demoForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      
      submitBtn.innerHTML = `
        <span class="inline-block animate-spin mr-2">⟳</span>
        Agendando...
      `;
      submitBtn.disabled = true;

      setTimeout(() => {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        demoForm.classList.add('hidden');
        if (successState) successState.classList.remove('hidden');
      }, 900);
    });
  }
}

/* ==========================================================================
   7. FAQ Accordion
   ========================================================================== */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    const answerEl = item.querySelector('.faq-answer');
    const icon = item.querySelector('.faq-icon');

    if (!questionBtn || !answerEl) return;

    questionBtn.addEventListener('click', () => {
      const isOpen = !answerEl.classList.contains('hidden');

      // Close all others
      faqItems.forEach(otherItem => {
        const otherAns = otherItem.querySelector('.faq-answer');
        const otherIcon = otherItem.querySelector('.faq-icon');
        if (otherAns && otherItem !== item) {
          otherAns.classList.add('hidden');
          if (otherIcon) otherIcon.style.transform = 'rotate(0deg)';
        }
      });

      if (isOpen) {
        answerEl.classList.add('hidden');
        if (icon) icon.style.transform = 'rotate(0deg)';
      } else {
        answerEl.classList.remove('hidden');
        if (icon) icon.style.transform = 'rotate(180deg)';
      }
    });
  });
}

/* ==========================================================================
   8. Specular Interactive Pointer Beam & Rim Light Controller
   ========================================================================== */
function initSpecularEffect() {
  const items = document.querySelectorAll('#main-nav .nav-link, .open-demo-modal, .btn-primary-roi, .btn-specular-header');
  if (!items.length) return;

  const proximityMax = 220; // Proximity threshold in pixels
  let pointerX = -1000;
  let pointerY = -1000;
  let lastTime = performance.now();

  const itemStates = Array.from(items).map(el => ({
    el,
    angle: 2.4,
    idleAngle: 2.4,
    bright: 0,
    speed: 0.35
  }));

  window.addEventListener('pointermove', e => {
    pointerX = e.clientX;
    pointerY = e.clientY;
  }, { passive: true });

  function render(now) {
    const dt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;

    itemStates.forEach(item => {
      const rect = item.el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      // Distance to element bounding box
      const dx = Math.max(rect.left - pointerX, 0, pointerX - rect.right);
      const dy = Math.max(rect.top - pointerY, 0, pointerY - rect.bottom);
      const dist = Math.hypot(dx, dy);

      // Angle calculation towards cursor
      let pointerAngle;
      if (dist === 0) {
        const nx = (pointerX - cx) / (rect.width / 2);
        const ny = (cy - pointerY) / (rect.height / 2);
        pointerAngle = Math.atan2(2 / rect.height, -2 / rect.width) + nx * 0.3 + ny * 0.15;
      } else {
        pointerAngle = Math.atan2(cy - pointerY, pointerX - cx);
      }

      // Smooth proximity Hermite curve
      const t = Math.max(0, 1 - dist / proximityMax);
      const proximityT = t * t * (3 - 2 * t);

      // Damped angle steering
      item.idleAngle += item.speed * dt;
      const targetAngle = pointerX > 0 ? pointerAngle : item.idleAngle;
      const diff = ((targetAngle - item.angle + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
      item.angle += diff * (1 - Math.exp(-dt * 8));

      // Damped brightness intensity
      item.bright += (proximityT - item.bright) * (1 - Math.exp(-dt * 9));

      // Update CSS Variables on element
      item.el.style.setProperty('--specular-angle', `${item.angle}rad`);
      const intensity = item.el.classList.contains('active') ? Math.max(0.85, item.bright) : item.bright;
      item.el.style.setProperty('--specular-intensity', intensity.toFixed(3));
      
      const localX = Math.round(((pointerX - rect.left) / rect.width) * 100);
      const localY = Math.round(((pointerY - rect.top) / rect.height) * 100);
      item.el.style.setProperty('--specular-x', `${Math.max(0, Math.min(100, localX))}%`);
      item.el.style.setProperty('--specular-y', `${Math.max(0, Math.min(100, localY))}%`);
    });

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

/* ==========================================================================
   10. Lealbox AI Chatbot Controller
   ========================================================================== */
function initLealboxChatbot() {
  const openBtn = document.getElementById('open-lealbox-chat');
  const closeBtn = document.getElementById('close-lealbox-chat');
  const chatModal = document.getElementById('lealbox-chat-modal');
  const tooltip = document.getElementById('chatbot-tooltip');
  const messagesContainer = document.getElementById('chat-messages-container');
  const chatForm = document.getElementById('chat-input-form');
  const userInput = document.getElementById('chat-user-input');
  const quickPills = document.querySelectorAll('.chat-pill');

  if (!openBtn || !chatModal) return;

  const toggleChat = () => {
    const isHidden = chatModal.classList.contains('hidden');
    if (isHidden) {
      chatModal.classList.remove('hidden');
      chatModal.classList.add('flex');
      if (userInput) userInput.focus();
    } else {
      chatModal.classList.add('hidden');
      chatModal.classList.remove('flex');
    }
  };

  openBtn.addEventListener('click', toggleChat);
  if (closeBtn) closeBtn.addEventListener('click', toggleChat);
  if (tooltip) tooltip.addEventListener('click', toggleChat);

  // Auto-scroll chat to bottom
  const scrollToBottom = () => {
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  };

  // Add message bubble
  const addMessage = (text, sender = 'bot') => {
    const bubble = document.createElement('div');
    bubble.className = 'chat-message-bubble flex items-start gap-2.5';

    if (sender === 'user') {
      bubble.classList.add('justify-end');
      bubble.innerHTML = `
        <div class="bg-gradient-to-r from-secondary to-[#2dd4bf] text-[#0b1c30] font-semibold p-3.5 rounded-2xl rounded-tr-sm max-w-[85%] leading-relaxed shadow-md">
          ${text}
        </div>
      `;
    } else {
      bubble.innerHTML = `
        <div class="w-7 h-7 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/50 flex items-center justify-center shrink-0 mt-0.5">
          <span class="material-symbols-outlined text-[#f6d365] text-sm">smart_toy</span>
        </div>
        <div class="bg-white/10 text-[#f8fafc] p-3.5 rounded-2xl rounded-tl-sm border border-white/15 max-w-[85%] leading-relaxed">
          ${text}
        </div>
      `;
    }

    messagesContainer.appendChild(bubble);
    scrollToBottom();
  };

  // Typing indicator
  const showTyping = () => {
    const indicator = document.createElement('div');
    indicator.id = 'chat-typing-indicator';
    indicator.className = 'chat-message-bubble flex items-center gap-2 text-xs text-slate-300';
    indicator.innerHTML = `
      <div class="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
        <span class="material-symbols-outlined text-xs text-[#2dd4bf]">smart_toy</span>
      </div>
      <div class="flex items-center gap-1 bg-white/10 px-3 py-2 rounded-xl">
        <span class="w-1.5 h-1.5 rounded-full bg-[#2dd4bf] typing-dot"></span>
        <span class="w-1.5 h-1.5 rounded-full bg-[#2dd4bf] typing-dot"></span>
        <span class="w-1.5 h-1.5 rounded-full bg-[#2dd4bf] typing-dot"></span>
      </div>
    `;
    messagesContainer.appendChild(indicator);
    scrollToBottom();
  };

  const hideTyping = () => {
    const ind = document.getElementById('chat-typing-indicator');
    if (ind) ind.remove();
  };

  // Bot Knowledge Engine
  const getBotResponse = (query) => {
    const q = query.toLowerCase();

    if (q.includes('ecosistema') || q.includes('como funciona') || q.includes('cómo funciona')) {
      return `El <strong>Ecosistema LEALTIX</strong> conecta toda la operación en tiempo real:<br><br>
      • <strong>Front-Office (Píxel):</strong> Marca blanca incrustada en tu dominio web.<br>
      • <strong>Lealbox:</strong> Mesero Virtual con IA y memoria de consumo.<br>
      • <strong>Comandix:</strong> Sincronización en sala para meseros.<br>
      • <strong>Kitchndix:</strong> Control KDS en cocina con checklist y cronómetro.<br><br>
      Todo sincronizado con el Dashboard central para el dueño o gerente.`;
    }

    if (q.includes('lealbox') || q.includes('comandix') || q.includes('kitchndix') || q.includes('trilogia') || q.includes('trilogía')) {
      return `Nuestra <strong>Trilogía Operativa</strong> une los puntos clave:<br><br>
      1. 🤖 <strong>Lealbox:</strong> Chatbot con IA que recuerda el historial del comensal y hace venta cruzada.<br>
      2. 📱 <strong>Comandix:</strong> Tableta para meseros que recibe las comandas al instante.<br>
      3. 🍳 <strong>Kitchndix:</strong> Monitor KDS con checklist de recetas para evitar mermas.<br><br>
      ¿Te gustaría ver una demo de estos módulos?`;
    }

    if (q.includes('precio') || q.includes('plan') || q.includes('costo') || q.includes('cuanto cuesta') || q.includes('cuánto cuesta') || q.includes('mxn')) {
      return `Contamos con esquemas transparentes en <strong>MXN</strong>:<br><br>
      ☕ <strong>Plan Básico (~$500 MXN/mes):</strong> Control operativo, base de datos y correos transaccionales (ideal cafeterías).<br>
      ⚡ <strong>Plan Pro (~$1,200 MXN/mes):</strong> IA Lealbox, Trilogía Operativa (Comandix + Kitchndix), WhatsApp y Servicio Administrado.<br>
      🏢 <strong>Enterprise (A Medida):</strong> Multi-sucursal y sector hotelero HORECA.`;
    }

    if (q.includes('demo') || q.includes('agendar') || q.includes('probar') || q.includes('contacto') || q.includes('llamada')) {
      const demoModal = document.getElementById('demo-modal');
      if (demoModal) {
        setTimeout(() => {
          chatModal.classList.add('hidden');
          demoModal.classList.remove('hidden');
          demoModal.classList.add('flex');
        }, 1200);
      }
      return `¡Excelente! Te abriré de inmediato el formulario para agendar una <strong>Demostración Personalizada</strong> con un especialista del sector HORECA. 🚀`;
    }

    if (q.includes('hibrido') || q.includes('híbrido') || q.includes('servicio administrado')) {
      return `Con nuestro <strong>Modelo Híbrido</strong>:<br>
      <em>"Tú te dedicas a vender comida; nosotros nos encargamos de que tus clientes regresen."</em><br><br>
      Nuestro equipo se encarga de operar la base de datos y lanzar las campañas de retención sin que inviertas tiempo de tu personal.`;
    }

    return `Entiendo perfectamente tu interés en <em>"${query}"</em>. En <strong>LEALTIX</strong> optimizamos tanto la retención de clientes con IA como la sincronización de tu cocina y sala.<br><br>
    ¿Deseas que agendemos una <strong>Demostración en Vivo</strong> para tu restaurante o cafetería?`;
  };

  const handleUserMessage = (msg) => {
    if (!msg.trim()) return;
    addMessage(msg, 'user');
    showTyping();

    setTimeout(() => {
      hideTyping();
      const botReply = getBotResponse(msg);
      addMessage(botReply, 'bot');
    }, 800);
  };

  if (chatForm && userInput) {
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = userInput.value;
      userInput.value = '';
      handleUserMessage(val);
    });
  }

  quickPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const question = pill.dataset.question || pill.textContent.trim();
      handleUserMessage(question);
    });
  });
}
