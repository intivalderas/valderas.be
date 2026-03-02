/* =========================================
   3D Tilt + Shine on Project Cards
   ========================================= */
/* =========================================
   Gradient border follow on Kind Words cards
   ========================================= */

window.initKindWordsGradient = function () {
  var cards = document.querySelectorAll('.kind-words__card');

  // Desktop: mouse-driven gradient
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(1);
      const y = ((e.clientY - rect.top) / rect.height * 100).toFixed(1);
      card.style.setProperty('--gradient-x', x + '%');
      card.style.setProperty('--gradient-y', y + '%');
    });

    card.addEventListener('mouseleave', () => {
      card.style.removeProperty('--gradient-x');
      card.style.removeProperty('--gradient-y');
    });
  });

  // Mobile: gyroscope-driven gradient for visible cards
  if (window.Gyroscope) {
    var visibleCards = new Set();
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          visibleCards.add(entry.target);
        } else {
          visibleCards.delete(entry.target);
        }
      });
    }, { threshold: 0.1 });

    cards.forEach(function (card) { observer.observe(card); });

    Gyroscope.on(function (gx, gy) {
      var x = (gx * 100).toFixed(1) + '%';
      var y = (gy * 100).toFixed(1) + '%';
      visibleCards.forEach(function (card) {
        card.style.setProperty('--gradient-x', x);
        card.style.setProperty('--gradient-y', y);
      });
    });
  }
};

window.initKindWordsVibes = function () {
  var section = document.querySelector('.section--kind-words');
  if (!section) return;

  // --- IntersectionObserver to toggle active class ---
  var isActive = false;
  var animId = null;

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        section.classList.add('kind-words--active');
        if (!isActive) {
          isActive = true;
          animate();
        }
      } else {
        section.classList.remove('kind-words--active');
        isActive = false;
        if (animId) {
          cancelAnimationFrame(animId);
          animId = null;
        }
      }
    });
  }, { threshold: 0.15 });

  observer.observe(section);

  // --- Canvas setup ---
  var canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute;top:0;bottom:0;left:50%;width:100vw;transform:translateX(-50%);z-index:1;pointer-events:none;';
  canvas.setAttribute('aria-hidden', 'true');
  section.insertBefore(canvas, section.firstChild);

  // Make card grid and header sit above canvas + ::before
  var grid = section.querySelector('.kind-words__grid');
  if (grid) { grid.style.position = 'relative'; grid.style.zIndex = '2'; }
  var header = section.querySelector('.section__header');
  if (header) { header.style.position = 'relative'; header.style.zIndex = '2'; }

  var ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = section.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // --- Confetti line particles ---
  var confettiColors = ['#ff8a80', '#f48fb1', '#ffab91', '#ffcc80', '#ffd54f', '#fff176', '#e0e7ff', '#c4b5fd'];
  var particles = [];
  var maxParticles = 28;

  function spawnParticle() {
    return {
      x: Math.random() * canvas.width,
      y: canvas.height + 10,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -(0.3 + Math.random() * 0.5),
      length: 12 + Math.random() * 20,
      thickness: 2 + Math.random() * 3,
      angle: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.02,
      color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
      opacity: 0.35 + Math.random() * 0.25,
      phase: Math.random() * Math.PI * 2
    };
  }

  // Pre-populate
  for (var i = 0; i < maxParticles; i++) {
    var p = spawnParticle();
    p.y = Math.random() * canvas.height;
    particles.push(p);
  }

  var time = 0;

  function animate() {
    if (!isActive) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    time += 0.02;

    for (var i = particles.length - 1; i >= 0; i--) {
      var p = particles[i];
      p.x += p.vx + Math.sin(time + p.phase) * 0.3;
      p.y += p.vy;
      p.angle += p.spin;

      // Fade near top
      var fadeZone = canvas.height * 0.2;
      var alpha = p.y < fadeZone ? (p.y / fadeZone) * p.opacity : p.opacity;

      if (p.y < -20 || alpha <= 0) {
        particles[i] = spawnParticle();
        continue;
      }

      ctx.globalAlpha = alpha;
      ctx.strokeStyle = p.color;
      ctx.lineWidth = p.thickness;
      ctx.lineCap = 'round';
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.beginPath();
      ctx.moveTo(-p.length / 2, 0);
      ctx.lineTo(p.length / 2, 0);
      ctx.stroke();
      ctx.restore();
    }

    ctx.globalAlpha = 1;
    animId = requestAnimationFrame(animate);
  }
};

window.initCardTilt = function () {
  document.querySelectorAll('.project-card').forEach(function (card) {
    var imageEl = card.querySelector('.project-card__image');
    if (imageEl) {
      var shine = document.createElement('div');
      shine.classList.add('project-card__shine');
      imageEl.appendChild(shine);
    }

    var rxTo = gsap.quickTo(card, 'rotateX', { duration: 0.3, ease: 'power2.out' });
    var ryTo = gsap.quickTo(card, 'rotateY', { duration: 0.3, ease: 'power2.out' });
    var scaleTo = gsap.quickTo(card, 'scale', { duration: 0.3, ease: 'power2.out' });

    // Set perspective once
    gsap.set(card, { transformPerspective: 800 });

    card.addEventListener('mousemove', function (e) {
      var rect = card.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width;
      var y = (e.clientY - rect.top) / rect.height;
      rxTo((y - 0.5) * -8);
      ryTo((x - 0.5) * 8);
      scaleTo(1.02);

      var shineEl = card.querySelector('.project-card__shine');
      if (shineEl) {
        shineEl.style.background = 'radial-gradient(circle at ' + (x * 100) + '% ' + (y * 100) + '%, rgba(255,255,255,0.15), transparent 60%)';
      }
    });

    card.addEventListener('mouseleave', function () {
      rxTo(0);
      ryTo(0);
      scaleTo(1);
    });
  });
};
