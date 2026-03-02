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
  function spawnBurst(stickerImg) {
    var rect = stickerImg.getBoundingClientRect();
    var count = 10 + Math.floor(Math.random() * 6);
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
      dot.addEventListener('animationend', function () { dot.remove(); });
    }
  }

  function playSlap() {
    var idx;
    do { idx = Math.floor(Math.random() * slapCount); } while (idx === lastSlap);
    lastSlap = idx;
    var s = slaps[idx];
    s.currentTime = 0;
    s.play().catch(function () {});
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
      // Wait one frame so the sticker has layout before reading its rect
      requestAnimationFrame(function () { spawnBurst(img); });
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
};
