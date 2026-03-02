/* =========================================
   Portrait — glare effect + face stickers
   ========================================= */

window.initPortrait = function () {
  var container = document.getElementById('heroPortrait');
  if (!container) return;

  var frame = container.querySelector('.hero__frame');
  var glare = container.querySelector('.hero__glare');

  // --- Slap sounds (never the same one twice in a row) ---
  var slapCount = 5;
  var slaps = [];
  var lastSlap = -1;
  for (var i = 0; i < slapCount; i++) {
    var a = new Audio('/assets/sfx/slap-' + (i + 1) + '.webm');
    a.preload = 'auto';
    a.volume = 0.1;
    slaps.push(a);
  }

  // --- Burst particles on sticker placement ---
  var activeParticles = 0;
  var MAX_PARTICLES = 60;

  function spawnBurst(stickerImg) {
    if (activeParticles >= MAX_PARTICLES) return;

    var rect = stickerImg.getBoundingClientRect();
    var count = Math.min(8, MAX_PARTICLES - activeParticles);
    var sides = ['top', 'bottom', 'left', 'right'];

    for (var i = 0; i < count; i++) {
      var side = sides[Math.floor(Math.random() * 4)];
      var cx, cy;

      if (side === 'top') {
        cx = rect.left + Math.random() * rect.width;
        cy = rect.top;
      } else if (side === 'bottom') {
        cx = rect.left + Math.random() * rect.width;
        cy = rect.bottom;
      } else if (side === 'left') {
        cx = rect.left;
        cy = rect.top + Math.random() * rect.height;
      } else {
        cx = rect.right;
        cy = rect.top + Math.random() * rect.height;
      }

      var dot = document.createElement('span');
      dot.className = 'hero__particle';
      var angle = (side === 'top') ? -Math.PI / 2 + (Math.random() - 0.5) * 1.2
                : (side === 'bottom') ? Math.PI / 2 + (Math.random() - 0.5) * 1.2
                : (side === 'left') ? Math.PI + (Math.random() - 0.5) * 1.2
                : (Math.random() - 0.5) * 1.2;
      var dist = 40 + Math.random() * 70;
      var dx = Math.cos(angle) * dist;
      var dy = Math.sin(angle) * dist;
      var size = 3 + Math.random() * 5;
      dot.style.cssText =
        'left:' + cx.toFixed(0) + 'px;top:' + cy.toFixed(0) + 'px;' +
        'width:' + size + 'px;height:' + size + 'px;' +
        '--dx:' + dx.toFixed(0) + 'px;--dy:' + dy.toFixed(0) + 'px;' +
        'animation-duration:' + (0.4 + Math.random() * 0.3).toFixed(2) + 's';
      document.body.appendChild(dot);
      activeParticles++;
      dot.addEventListener('animationend', function () { dot.remove(); activeParticles--; });
    }
  }

  // --- Spam click tracking ---
  var rapidClicks = 0;
  var rapidTimer = null;
  var RAPID_WINDOW = 400;  // ms between clicks to count as rapid
  var SHAKE_THRESHOLD = 6;
  var EXPLODE_THRESHOLD = 10;
  var MAX_STICKERS = 20;
  var lastClickTime = 0;
  var MIN_CLICK_INTERVAL = 80; // ms — throttle taps on mobile

  function trackRapidClick() {
    rapidClicks++;
    clearTimeout(rapidTimer);
    rapidTimer = setTimeout(function () { rapidClicks = 0; }, RAPID_WINDOW);
  }

  function playSlap() {
    var idx;
    do { idx = Math.floor(Math.random() * slapCount); } while (idx === lastSlap);
    lastSlap = idx;
    var s = slaps[idx];
    s.currentTime = 0;
    // Pitch escalation: gets higher with rapid clicks
    var pitch = Math.min(1 + rapidClicks * 0.12, 2.5);
    s.playbackRate = pitch;
    s.play().catch(function () {});
  }

  var isShaking = false;

  function screenShake() {
    if (isShaking) return;
    isShaking = true;
    var intensity = 4 + rapidClicks * 0.5;
    var duration = 300;
    var start = performance.now();
    var mainContent = document.querySelector('.main-content') || document.body;

    function shake(now) {
      var elapsed = now - start;
      if (elapsed > duration) {
        mainContent.style.transform = '';
        isShaking = false;
        return;
      }
      var decay = 1 - elapsed / duration;
      var x = (Math.random() - 0.5) * 2 * intensity * decay;
      var y = (Math.random() - 0.5) * 2 * intensity * decay;
      mainContent.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
      requestAnimationFrame(shake);
    }
    requestAnimationFrame(shake);
  }

  function explodeStickers() {
    var stickers = frame.querySelectorAll('.hero__face-sticker');
    if (!stickers.length) return;

    stickers.forEach(function (s) {
      var angle = Math.random() * Math.PI * 2;
      var dist = 300 + Math.random() * 400;
      var dx = Math.cos(angle) * dist;
      var dy = Math.sin(angle) * dist;
      var spin = (Math.random() - 0.5) * 720;
      s.style.transition = 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.6s ease';
      s.style.transform = 'translate(' + dx.toFixed(0) + 'px,' + dy.toFixed(0) + 'px) rotate(' + spin.toFixed(0) + 'deg)';
      s.style.opacity = '0';
      s.style.pointerEvents = 'none';
    });

    setTimeout(function () {
      stickers.forEach(function (s) { s.remove(); });
      resetFavicon();
    }, 650);

    rapidClicks = 0;
  }

  // --- Glare: mouse tracking ---
  frame.addEventListener('mousemove', function (e) {
    var rect = frame.getBoundingClientRect();
    var x = ((e.clientX - rect.left) / rect.width * 100).toFixed(1);
    var y = ((e.clientY - rect.top) / rect.height * 100).toFixed(1);
    glare.style.background =
      'radial-gradient(circle at ' + x + '% ' + y + '%, rgba(255,255,255,0.25), transparent 60%)';
  });

  frame.addEventListener('mouseleave', function () {
    glare.style.background = '';
  });

  // --- Glare: gyroscope tracking ---
  if (window.Gyroscope) {
    Gyroscope.on(function (gx, gy) {
      var x = (gx * 100).toFixed(1);
      var y = (gy * 100).toFixed(1);
      glare.style.background =
        'radial-gradient(circle at ' + x + '% ' + y + '%, rgba(255,255,255,0.25), transparent 60%)';
    });
  }

  // --- Favicon swap ---
  var defaultFavicon = document.querySelector('link[rel="icon"][sizes="32x32"]');
  var defaultHref = defaultFavicon ? defaultFavicon.href : '';

  function setFavicon(src) {
    var icon = document.querySelector('link[rel="icon"][sizes="32x32"]');
    if (!icon) return;
    var faviconImg = new Image();
    faviconImg.crossOrigin = 'anonymous';
    faviconImg.onload = function () {
      var c = document.createElement('canvas');
      c.width = 32;
      c.height = 32;
      var ctx = c.getContext('2d');
      ctx.beginPath();
      ctx.arc(16, 16, 16, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(faviconImg, 0, 0, 32, 32);
      icon.href = c.toDataURL('image/png');
    };
    faviconImg.src = src;
  }

  function resetFavicon() {
    var icon = document.querySelector('link[rel="icon"][sizes="32x32"]');
    if (icon && defaultHref) icon.href = defaultHref;
  }

  // --- Sticker buttons ---
  container.querySelectorAll('.hero__sticker-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      // Throttle rapid taps to prevent mobile crash
      var now = Date.now();
      if (now - lastClickTime < MIN_CLICK_INTERVAL) return;
      lastClickTime = now;

      trackRapidClick();

      // Explode at threshold
      if (rapidClicks >= EXPLODE_THRESHOLD) {
        screenShake();
        explodeStickers();
        playSlap();
        window.psTrack('Portrait_Sticker_Explode');
        return;
      }

      // Cap stickers in frame
      var existing = frame.querySelectorAll('.hero__face-sticker');
      if (existing.length >= MAX_STICKERS) {
        existing[0].remove();
      }

      var name = btn.dataset.sticker;
      var img = document.createElement('img');
      img.src = '/assets/img/stickers/' + name + '.webp';
      img.alt = '';
      img.classList.add('hero__face-sticker');
      var tilt = (Math.random() * 16 - 8).toFixed(1);
      var offsetX = (Math.random() * 10 - 5).toFixed(1);
      var offsetY = (Math.random() * 10 - 5).toFixed(1);
      img.style.transform = 'translate(' + offsetX + '%, ' + offsetY + '%) rotate(' + tilt + 'deg)';
      frame.appendChild(img);
      frame.classList.remove('hero__frame--slap');
      void frame.offsetWidth;
      frame.classList.add('hero__frame--slap');
      playSlap();
      setFavicon(img.src);

      // Screen shake at threshold
      if (rapidClicks >= SHAKE_THRESHOLD) {
        screenShake();
      }

      // Skip particles during very rapid clicking to reduce DOM pressure
      if (rapidClicks < SHAKE_THRESHOLD) {
        requestAnimationFrame(function () { spawnBurst(img); });
      }
      window.psTrack('Portrait_Sticker_' + name);
    });
  });

  // --- Clear stickers ---
  var clearBtn = document.getElementById('heroStickerClear');
  if (clearBtn) {
    clearBtn.addEventListener('click', function () {
      frame.querySelectorAll('.hero__face-sticker').forEach(function (s) { s.remove(); });
      resetFavicon();
    });
  }

  // --- Intro: slap a sticker on first load to hint interactivity ---
  var introPlayed = sessionStorage.getItem('portrait-intro');
  if (!introPlayed) {
    var stickerBar = container.querySelector('.hero__sticker-bar');
    // Wait for portrait fade-in animation (1.2s delay + 0.8s duration = 2s)
    setTimeout(function () {
      // Place the cool sticker
      var img = document.createElement('img');
      img.src = '/assets/img/stickers/inti-cool.webp';
      img.alt = '';
      img.classList.add('hero__face-sticker');
      img.style.transform = 'rotate(-3deg)';
      frame.appendChild(img);
      frame.classList.remove('hero__frame--slap');
      void frame.offsetWidth;
      frame.classList.add('hero__frame--slap');
      playSlap();
      setFavicon(img.src);

      // Visual punch to compensate for blocked audio
      frame.style.transition = 'transform 0.15s cubic-bezier(0.22, 1, 0.36, 1)';
      frame.style.transform = 'rotate(-2deg) scale(0.96)';
      setTimeout(function () {
        frame.style.transform = 'rotate(1deg) scale(1.02)';
        setTimeout(function () {
          frame.style.transform = '';
          frame.style.transition = '';
        }, 150);
      }, 150);

      // Show the sticker bar
      stickerBar.classList.add('hero__sticker-bar--intro');

      // Hide the bar after a few seconds
      setTimeout(function () {
        stickerBar.classList.remove('hero__sticker-bar--intro');
      }, 3000);

      sessionStorage.setItem('portrait-intro', '1');
    }, 2200);
  }
};
