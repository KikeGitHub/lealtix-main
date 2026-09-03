/**
 * LEALTIX v1.0 - Interactive Logic & SaaS Engine
 * Full interaction controller for HORECA Loyalty Platform
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initNavbarScroll();
  initSpecularEffect();
  initRoiCalculator();
  initPricingToggle();
  initDashboardSimulator();
  initSolutionsTabs();
  initDemoModal();
  initFaqAccordion();
});

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
  if (!navbar) return;

  function updateNavbarState() {
    const navHeight = navbar.offsetHeight || 80;
    const probeY = navHeight / 2; // Exact probe line under header

    // If at the very top of the page (Hero section), always force dark header
    if (window.scrollY < 80) {
      navbar.classList.remove('header-theme-light');
      navbar.classList.add('header-theme-dark');
      return;
    }

    // Find all sections or footer elements by viewport position
    const sections = document.querySelectorAll('section, footer');
    let currentTheme = 'dark';

    sections.forEach(sec => {
      const rect = sec.getBoundingClientRect();
      if (rect.top <= probeY && rect.bottom > probeY) {
        const theme = sec.getAttribute('data-theme');
        if (theme) {
          currentTheme = theme;
        }
      }
    });

    if (currentTheme === 'light') {
      navbar.classList.remove('header-theme-dark');
      navbar.classList.add('header-theme-light');
    } else {
      navbar.classList.remove('header-theme-light');
      navbar.classList.add('header-theme-dark');
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
    monthly: { start: 49, pro: 129, business: 299 },
    annual: { start: 39, pro: 99, business: 239 }
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
      if (priceStart) priceStart.textContent = `$${activeSet.start}`;
      if (pricePro) pricePro.textContent = `$${activeSet.pro}`;
      if (priceBusiness) priceBusiness.textContent = `$${activeSet.business}`;
      
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

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;

      tabButtons.forEach(b => {
        b.classList.remove('active', 'bg-white', 'text-primary', 'shadow-soft');
        b.classList.add('text-on-surface-variant');
      });

      btn.classList.add('active', 'bg-white', 'text-primary', 'shadow-soft');
      btn.classList.remove('text-on-surface-variant');

      tabPanels.forEach(panel => {
        panel.classList.add('hidden');
        if (panel.id === targetId) {
          panel.classList.remove('hidden');
          panel.classList.add('animate-fadeIn');
        }
      });
    });
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
  const items = document.querySelectorAll('#main-nav .nav-link, #main-nav .open-demo-modal');
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
