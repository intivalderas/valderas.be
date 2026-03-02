/* =========================================
   Easter Eggs: Dark Mode Toggle
   Long-press the logo to activate
   ========================================= */

window.initDarkMode = function () {
  var logo = document.querySelector('.sidebar__logo');
  var logoPath = document.querySelector('.sidebar__logo-path');
  if (!logo || !logoPath) return;

  var holdTimer = null;
  var isAnimating = false;
  var didToggle = false;
  var HOLD_DURATION = 800;
  var UNDRAW_CURVE = 'cubic-bezier(0.42, 0, 1, 1)';
  var DRAW_CURVE = 'cubic-bezier(0, 0, 0.58, 1)';

  function toggleDarkMode() {
    isAnimating = true;

    // Wait a beat, then toggle
    setTimeout(function () {
      document.body.classList.toggle('dark-mode');

      var isDark = document.body.classList.contains('dark-mode');
      if (window.syncDarkModeToggle) {
        window.syncDarkModeToggle(isDark);
      }

      // Re-draw and fade in together
      setTimeout(function () {
        logoPath.style.transition = 'stroke-dashoffset 0.6s ' + DRAW_CURVE;
        logoPath.style.strokeDashoffset = '0';
        logo.style.transition = 'opacity 0.6s ' + DRAW_CURVE;
        logo.style.opacity = '1';

        setTimeout(function () {
          logoPath.style.transition = '';
          logo.style.transition = '';
          logo.style.opacity = '';
          isAnimating = false;
        }, 700);
      }, 100);
    }, 200);
  }

  // Prevent link navigation if the hold triggered
  logo.addEventListener('click', function (e) {
    if (isAnimating || didToggle) {
      e.preventDefault();
      didToggle = false;
    }
  });

  logo.addEventListener('pointerdown', function () {
    if (isAnimating) return;
    didToggle = false;

    // Clear the CSS animation so JS can control stroke-dashoffset
    logoPath.style.animation = 'none';
    logoPath.style.strokeDashoffset = '0';

    // Force reflow, then un-draw + fade the whole logo together
    logoPath.getBoundingClientRect();
    logoPath.style.transition = 'stroke-dashoffset ' + HOLD_DURATION + 'ms ' + UNDRAW_CURVE;
    logoPath.style.strokeDashoffset = '600';
    logo.style.transition = 'opacity ' + HOLD_DURATION + 'ms ' + UNDRAW_CURVE;
    logo.style.opacity = '0';

    holdTimer = setTimeout(function () {
      holdTimer = null;
      didToggle = true;
      toggleDarkMode();
    }, HOLD_DURATION);
  });

  logo.addEventListener('pointerup', cancelHold);
  logo.addEventListener('pointerleave', cancelHold);
  logo.addEventListener('pointercancel', cancelHold);

  function cancelHold() {
    if (holdTimer) {
      clearTimeout(holdTimer);
      holdTimer = null;

      // Cancelled — snap everything back
      logoPath.style.transition = 'stroke-dashoffset 0.3s ' + DRAW_CURVE;
      logoPath.style.strokeDashoffset = '0';
      logo.style.transition = 'opacity 0.3s ' + DRAW_CURVE;
      logo.style.opacity = '1';
      setTimeout(function () {
        logoPath.style.transition = '';
        logo.style.transition = '';
        logo.style.opacity = '';
      }, 300);
    }
  }
};
