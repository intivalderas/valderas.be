/* =========================================
   UI: Sidebar, Scroll,
   Magnetic Buttons, Tags, Parallax
   ========================================= */

function prefersReducedMotion() {
  return document.body.classList.contains('reduced-effects') ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

window.initHeroTimeline = function () {
  var els = document.querySelectorAll('.hero__anim');
  if (!els.length) return;

  // Clear the CSS hidden state so GSAP .from() animates toward opacity:1
  els.forEach(function (el) {
    el.style.visibility = 'visible';
    el.style.opacity = '1';
  });

  // Skip animation if reduced effects
  if (prefersReducedMotion()) {
    gsap.set(els, { opacity: 1, y: 0 });
    return;
  }

  var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.from('.hero__label', { y: 10, opacity: 0, duration: 0.6 })
    .from('.hero__name', { y: 15, opacity: 0, duration: 0.7 }, '-=0.4')
    .from('.hero__title', { y: 20, opacity: 0, duration: 0.8 }, '-=0.5')
    .from('.hero__subtitle', { y: 20, opacity: 0, duration: 0.8 }, '-=0.5')
    .from('.hero__tags', { y: 20, opacity: 0, duration: 0.6 }, '-=0.4')
    .from('.hero__cta', { y: 20, opacity: 0, duration: 0.6 }, '-=0.3')
    .from('.hero__portrait', { y: 30, opacity: 0, duration: 0.8 }, '-=0.5')
    .from('.hero__scroll', { opacity: 0, duration: 1 }, '-=0.3');
};


window.initNav = function () {
  const scrollIndicator = document.getElementById('scrollIndicator');

  // Scroll indicator fade
  window.addEventListener('scroll', () => {
    if (scrollIndicator && window.scrollY > 200) {
      scrollIndicator.style.opacity = '0';
      scrollIndicator.style.transition = 'opacity 0.5s ease';
    }
  });

  // Mobile sidebar toggle
  const toggle = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');

  function openSidebar() {
    sidebar.classList.add('sidebar--open');
    toggle.classList.add('sidebar-toggle--open');
    overlay.classList.add('sidebar__overlay--visible');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close menu');
  }

  function closeSidebar() {
    sidebar.classList.remove('sidebar--open');
    toggle.classList.remove('sidebar-toggle--open');
    overlay.classList.remove('sidebar__overlay--visible');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
  }

  if (toggle && sidebar) {
    toggle.addEventListener('click', function () {
      if (sidebar.classList.contains('sidebar--open')) {
        closeSidebar();
      } else {
        openSidebar();
      }
    });

    if (overlay) {
      overlay.addEventListener('click', closeSidebar);
    }

    window.closeSidebar = closeSidebar;
  }
};


window.initSmoothScroll = function () {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        document.body.classList.remove('resume-mode');
        const offset = 80;
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: targetPosition, behavior: 'smooth' });
        if (window.closeSidebar) window.closeSidebar();
      }
    });
  });
};


window.initScrollReveal = function () {
  var elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  // If reduced effects, just show everything immediately
  if (prefersReducedMotion()) {
    gsap.set(elements, { opacity: 1, y: 0 });
    return;
  }

  // Hide reveal elements until they enter viewport
  var revealEls = document.querySelectorAll('.reveal:not(.reveal--clip)');
  gsap.set(revealEls, { opacity: 0, y: 30 });

  ScrollTrigger.batch(revealEls, {
    onEnter: function (batch) {
      gsap.to(batch, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.08,
        ease: 'power3.out',
        clearProps: 'all'
      });
    },
    start: 'top 90%',
    once: true
  });

  // Clip-path reveal variant
  var clipEls = document.querySelectorAll('.reveal--clip');
  clipEls.forEach(function (el) {
    gsap.fromTo(el,
      { clipPath: 'inset(0 100% 0 0)' },
      {
        clipPath: 'inset(0 0% 0 0)',
        duration: 1,
        ease: 'power3.inOut',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          once: true
        }
      }
    );
  });
};


window.initMagneticButtons = function () {
  document.querySelectorAll('.magnetic-btn').forEach(function (btn) {
    var xTo = gsap.quickTo(btn, 'x', { duration: 0.4, ease: 'power3.out' });
    var yTo = gsap.quickTo(btn, 'y', { duration: 0.4, ease: 'power3.out' });

    btn.addEventListener('mousemove', function (e) {
      var rect = btn.getBoundingClientRect();
      var dx = e.clientX - rect.left - rect.width / 2;
      var dy = e.clientY - rect.top - rect.height / 2;
      xTo(dx * 0.2);
      yTo(dy * 0.2);
    });

    btn.addEventListener('mouseleave', function () {
      xTo(0);
      yTo(0);
    });
  });
};


window.initParallax = function () {
  if (!document.querySelector('.hero')) return;
  if (prefersReducedMotion()) return;

  // Two hero columns shift at different rates — content vs portrait
  var heroContent = document.querySelector('.hero__content');
  var heroPortrait = document.querySelector('.hero__portrait');
  var heroTrigger = {
    trigger: '.hero',
    start: 'top top',
    end: 'bottom top',
    scrub: true
  };

  if (heroContent) {
    gsap.to(heroContent, {
      y: function () { return window.innerHeight * 0.06; },
      ease: 'none',
      scrollTrigger: heroTrigger
    });
  }

  if (heroPortrait) {
    gsap.to(heroPortrait, {
      y: function () { return window.innerHeight * 0.1; },
      ease: 'none',
      scrollTrigger: Object.assign({}, heroTrigger)
    });
  }

  // Gyroscope-based tilt shift (mobile)
  var heroTitle = document.querySelector('.hero__title');
  var heroSubtitle = document.querySelector('.hero__subtitle');
  var heroTags = document.querySelector('.hero__tags');

  if (window.Gyroscope && heroTitle) {
    Gyroscope.on(function (gx, gy) {
      if (window.scrollY > window.innerHeight * 0.5) return;
      var offsetX = (gx - 0.5) * 20;
      var offsetY = (gy - 0.5) * 10;
      gsap.set(heroTitle, { x: offsetX });
      if (heroSubtitle) {
        gsap.set(heroSubtitle, { x: offsetX * 0.6, y: offsetY * 0.6 });
      }
      if (heroTags) {
        gsap.set(heroTags, { x: offsetX * 0.4, y: offsetY * 0.4 });
      }
    });
  }
};


window.initDepthParallax = function () {
  if (prefersReducedMotion()) return;

  var layers = [
    // Marquee — lags, feels like a strip in the distance
    { sel: '.marquee',        speed: -8 },

    // Work
    { sel: '.section--work .section__title', speed: 12 },
    { sel: '.work-card', speed: 5, stagger: 3 },

    // About
    { sel: '.section--about .section__title', speed: 12 },
    { sel: '.about__text',    speed: -5 },
    { sel: '.about__details', speed: 8 },

    // Kind Words
    { sel: '.section--kind-words .section__title', speed: 10 },

    // Contact
    { sel: '.section--contact .section__title', speed: 12 },
    { sel: '.contact__email',  speed: 15 },
    { sel: '.contact__links',  speed: -8 }
  ];

  layers.forEach(function (layer) {
    var els = document.querySelectorAll(layer.sel);
    els.forEach(function (el, i) {
      // Use the closest section as trigger so the transform doesn't
      // shift the trigger itself, which causes jumps on direction change
      var section = el.closest('section, .hero, .marquee') || el.parentElement;
      gsap.fromTo(el,
        { y: -(layer.speed + (layer.stagger ? i * layer.stagger : 0)) / 2 },
        {
          y: (layer.speed + (layer.stagger ? i * layer.stagger : 0)) / 2,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.5
          }
        }
      );
    });
  });
};


window.initTagHover = function () {
  document.querySelectorAll('.tag').forEach(tag => {
    tag.addEventListener('mouseenter', function () {
      this.style.transition = 'all 0.15s ease';
    });
    tag.addEventListener('mouseleave', function () {
      this.style.transition = 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
    });
  });
};


window.initResume = function () {
  const toggleBtn = document.getElementById('resumeToggle');
  const backBtn = document.getElementById('resumeBack');
  const printBtn = document.getElementById('resumePrint');

  function enterResume(e) {
    e.preventDefault();
    document.body.classList.add('resume-mode');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (window.closeSidebar) window.closeSidebar();
  }

  function exitResume(e) {
    e.preventDefault();
    document.body.classList.remove('resume-mode');
  }

  if (toggleBtn) toggleBtn.addEventListener('click', enterResume);
  if (backBtn) backBtn.addEventListener('click', exitResume);
  if (printBtn) printBtn.addEventListener('click', function () { window.print(); });
};
