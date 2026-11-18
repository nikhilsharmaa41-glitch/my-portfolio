(function () {
  /* ===== 1. Light / dark mode toggle ===== */
  var root = document.documentElement;
  var themeBtn = document.getElementById('theme');
  function isDark() {
    var t = root.getAttribute('data-theme');
    return t ? t === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  }
  themeBtn.addEventListener('click', function () {
    root.setAttribute('data-theme', isDark() ? 'light' : 'dark');
  });

  /* ===== 2. Scroll progress bar (yellow line at the top) ===== */
  var bar = document.getElementById('bar');
  var ticking = false;
  function updateBar() {
    var h = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(scrollY / h, 1) : 0) + ')';
    ticking = false;
  }
  addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(updateBar); }
  }, { passive: true });
  updateBar();

  /* ===== 3. Smooth scrolling (Lenis library) ===== */
  var reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (window.Lenis && !reduceMotion) {
    var lenis = new Lenis({ lerp: 0.07, wheelMultiplier: 0.9, smoothWheel: true });
    // lerp: lower = smoother/slower (try 0.05 to 0.12)
    var raf = function (t) { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);

    // Make nav links glide to their section
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href');
        if (id.length < 2) return;
        var target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        lenis.scrollTo(target, {
          offset: -70,
          duration: 1.6,
          easing: function (x) { return 1 - Math.pow(1 - x, 4); }
        });
      });
    });
  }

  /* ===== 4. Reveal-on-scroll animation ===== */
  if (!root.classList.contains('js') || !('IntersectionObserver' in window)) return;

  // Add or remove selectors here to choose what animates
  var targets = document.querySelectorAll(
    '.hero > *, h2, .about p, .group, .tl li, details, .contact .big, .contact p, .contact .btn'
  );
  var siblingCount = new Map();
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); observer.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

  targets.forEach(function (el) {
    var parent = el.parentNode;
    var n = siblingCount.get(parent) || 0;
    siblingCount.set(parent, n + 1);
    el.style.setProperty('--d', (Math.min(n, 6) * 0.1) + 's'); // delay between items
    el.classList.add('rv');
    observer.observe(el);
  });
})();
