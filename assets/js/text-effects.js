/* =========================================
   Text Effects: Scramble + Letter Animation
   ========================================= */

(function () {
  class TextScramble {
    constructor(el) {
      this.el = el;
      this.chars = '!<>-_\\/[]{}—=+*^?#_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
      this.frame = 0;
      this.queue = [];
      this.resolve = null;
    }

    setText(newText) {
      const oldText = this.el.innerText;
      const length = Math.max(oldText.length, newText.length);
      return new Promise(resolve => {
        this.resolve = resolve;
        this.queue = [];
        for (let i = 0; i < length; i++) {
          const from = oldText[i] || '';
          const to = newText[i] || '';
          // Stagger start per character so letters resolve left-to-right
          const start = Math.floor(Math.random() * 8) + i * 1;
          const end = start + 10 + Math.floor(Math.random() * 12);
          this.queue.push({ from, to, start, end });
        }
        cancelAnimationFrame(this.frameRequest);
        this.frame = 0;
        this.lastTime = performance.now();
        this.update();
      });
    }

    update() {
      // Throttle to ~30fps for a readable but snappy decode
      const now = performance.now();
      if (now - this.lastTime < 33) {
        this.frameRequest = requestAnimationFrame(() => this.update());
        return;
      }
      this.lastTime = now;

      let output = '';
      let complete = 0;
      for (let i = 0; i < this.queue.length; i++) {
        let { from, to, start, end, char } = this.queue[i];
        if (this.frame >= end) {
          complete++;
          output += to;
        } else if (this.frame >= start) {
          if (!char || Math.random() < 0.18) {
            char = this.chars[Math.floor(Math.random() * this.chars.length)];
            this.queue[i].char = char;
          }
          output += '<span class="scramble-text">' + char + '</span>';
        } else {
          output += from;
        }
      }
      this.el.innerHTML = output;
      if (complete === this.queue.length) {
        this.resolve();
      } else {
        this.frameRequest = requestAnimationFrame(() => this.update());
        this.frame++;
      }
    }
  }

  // Expose via window
  window.TextScramble = TextScramble;
})();


window.initLetterAnimation = function () {
  if (document.body.classList.contains('reduced-effects')) return;
  document.querySelectorAll('.split-text').forEach(el => {
    const text = el.textContent;
    el.innerHTML = '';
    [...text].forEach((char, i) => {
      const span = document.createElement('span');
      span.classList.add('letter');
      span.textContent = char === ' ' ? '\u00A0' : char;
      span.style.animationDelay = (0.4 + i * 0.03) + 's';
      el.appendChild(span);
    });
  });
};


window.initTextScramble = function () {
  if (document.body.classList.contains('reduced-effects')) return;
  const targets = document.querySelectorAll('.section__title');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.scrambled) {
        entry.target.dataset.scrambled = 'true';
        const scramble = new window.TextScramble(entry.target);
        scramble.setText(entry.target.textContent);
      }
    });
  }, { threshold: 0.5 });

  targets.forEach(el => observer.observe(el));
};


window.initWordRotate = function () {
  var el = document.getElementById('heroRotate');
  if (!el) return;

  var words = el.dataset.words.split(',');
  var index = 0;
  var scramble = new window.TextScramble(el);
  var reduced = document.body.classList.contains('reduced-effects');

  function next() {
    index = (index + 1) % words.length;
    if (reduced) {
      el.textContent = words[index];
      setTimeout(next, 2500);
    } else {
      scramble.setText(words[index]).then(function () {
        setTimeout(next, 2500);
      });
    }
  }

  // Start cycling after the initial letter animation settles
  setTimeout(next, 3000);
};
