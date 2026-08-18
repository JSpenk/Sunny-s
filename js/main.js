document.addEventListener('DOMContentLoaded', function () {

  // ---------- Mobile nav ----------
  var menuBtn = document.querySelector('.menu-btn');
  var mobileNav = document.querySelector('.mobile-nav');
  if (menuBtn && mobileNav) {
    menuBtn.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
      menuBtn.classList.toggle('active');
      var expanded = mobileNav.classList.contains('open');
      menuBtn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    });
    mobileNav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        mobileNav.classList.remove('open');
        menuBtn.classList.remove('active');
      });
    });
  }

  // ---------- Header shrink on scroll ----------
  var header = document.querySelector('.site-header');
  if (header) {
    var onScrollHeader = function () {
      if (window.scrollY > 12) header.classList.add('scrolled');
      else header.classList.remove('scrolled');
    };
    onScrollHeader();
    window.addEventListener('scroll', onScrollHeader, { passive: true });
  }

  // ---------- Scroll reveal ----------
  var revealEls = document.querySelectorAll('.reveal, .reveal-scale');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in-view'); });
  }

  // Auto-stagger direct children inside any [data-stagger] container
  document.querySelectorAll('[data-stagger]').forEach(function (container) {
    Array.prototype.forEach.call(container.children, function (child, i) {
      child.style.setProperty('--delay', (i * 0.12) + 's');
    });
  });

  // ---------- Subtle hero parallax (mouse) ----------
  var heroArt = document.querySelector('.hero-art img');
  var heroRays = document.querySelector('.hero .ray-burst');
  if (heroArt && window.matchMedia('(pointer: fine)').matches) {
    document.querySelector('.hero').addEventListener('mousemove', function (e) {
      var w = window.innerWidth, h = window.innerHeight;
      var x = (e.clientX / w - 0.5) * 18;
      var y = (e.clientY / h - 0.5) * 18;
      heroArt.style.transform = 'translate(' + x + 'px,' + y + 'px)';
      if (heroRays) heroRays.style.transform = 'translate(' + (x * -0.6) + 'px,' + (y * -0.6) + 'px)';
    });
  }

  // ---------- Scroll parallax for decorative rays ----------
  var parallaxEls = document.querySelectorAll('[data-parallax]');
  if (parallaxEls.length) {
    var onScrollParallax = function () {
      var sy = window.scrollY;
      parallaxEls.forEach(function (el) {
        var speed = parseFloat(el.getAttribute('data-parallax')) || 0.15;
        el.style.transform = 'translateY(' + (sy * speed) + 'px)';
      });
    };
    window.addEventListener('scroll', onScrollParallax, { passive: true });
  }

  // ---------- Animated stat counters ----------
  var counters = document.querySelectorAll('[data-count]');
  if (counters.length && 'IntersectionObserver' in window) {
    var countIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var target = parseFloat(el.getAttribute('data-count'));
        var suffix = el.getAttribute('data-suffix') || '';
        var isInt = Number.isInteger(target);
        var start = performance.now();
        var dur = 1400;
        function tick(now) {
          var p = Math.min((now - start) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          var val = target * eased;
          el.textContent = (isInt ? Math.round(val) : val.toFixed(1)) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        countIO.unobserve(el);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { countIO.observe(el); });
  }

  // ---------- Parallax banner image (scroll-driven, eased) ----------
  var pxImgs = document.querySelectorAll('.parallax-banner .px-img');
  if (pxImgs.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var reach = 90; // max px of vertical travel in each direction
    var updatePx = function () {
      var wh = window.innerHeight;
      pxImgs.forEach(function (img) {
        var wrap = img.closest('.parallax-banner');
        var rect = wrap.getBoundingClientRect();
        var total = wh + rect.height;
        var progress = (wh - rect.top) / total; // ~0 entering, ~1 leaving
        var clamped = Math.min(Math.max(progress, 0), 1);
        var translate = (clamped - 0.5) * 2 * reach;
        img.style.transform = 'translateY(' + translate.toFixed(1) + 'px) scale(1.02)';
      });
    };
    updatePx();
    window.addEventListener('scroll', updatePx, { passive: true });
    window.addEventListener('resize', updatePx);
  }

  // ---------- Price toggle (Membership / Single Wash) ----------
  var priceToggle = document.querySelector('#price-toggle');
  if (priceToggle) {
    var toggleBtns = priceToggle.querySelectorAll('.toggle-btn');
    var priceCards = document.querySelectorAll('.tier[data-mo-price]');
    var captionEl = document.querySelector('#pricing-caption');
    var captions = {
      membership: 'Membership prices are per month for unlimited access. Plans can be managed or canceled anytime.',
      single: 'Single wash prices are pay-per-visit — no membership required.'
    };

    function setPriceMode(mode) {
      priceToggle.classList.toggle('mode-single', mode === 'single');
      toggleBtns.forEach(function (b) {
        b.classList.toggle('active', b.dataset.mode === mode);
      });
      priceCards.forEach(function (card) {
        var moPrice = card.dataset.moPrice, moSuffix = card.dataset.moSuffix || '/mo';
        var singlePrice = card.dataset.singlePrice, singleSuffix = card.dataset.singleSuffix || '/single';
        var priceEl = card.querySelector('.tier-price');
        var orEl = card.querySelector('.tier-or');
        var ctaEl = card.querySelector('.tier-cta');
        var memberOnlyLines = card.querySelectorAll('.mship-only');
        if (mode === 'membership') {
          priceEl.innerHTML = moPrice + '<small>' + moSuffix + '</small>';
          orEl.textContent = 'or ' + singlePrice + ' per single wash';
          if (ctaEl) ctaEl.textContent = 'Join Unlimited';
          memberOnlyLines.forEach(function (li) { li.style.display = ''; });
        } else {
          priceEl.innerHTML = singlePrice + '<small>' + singleSuffix + '</small>';
          orEl.textContent = 'or ' + moPrice + moSuffix + ' unlimited';
          if (ctaEl) ctaEl.textContent = 'Buy Single Wash';
          memberOnlyLines.forEach(function (li) { li.style.display = 'none'; });
        }
      });
      if (captionEl) captionEl.textContent = captions[mode];
    }

    toggleBtns.forEach(function (btn) {
      btn.addEventListener('click', function () { setPriceMode(btn.dataset.mode); });
    });
  }

  // ---------- Contact form (Web3Forms) ----------
  var contactForm = document.querySelector('#contact-form');
  if (contactForm) {
    var statusEl = contactForm.querySelector('#form-status');
    var submitBtn = contactForm.querySelector('button[type="submit"]');

    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      // Honeypot: if a bot filled this hidden field, silently drop the submission
      if (contactForm.botcheck && contactForm.botcheck.checked) return;

      var originalBtnText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';
      if (statusEl) {
        statusEl.textContent = '';
        statusEl.className = 'form-status';
      }

      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(contactForm)))
      })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalBtnText;
          if (data.success) {
            contactForm.reset();
            if (statusEl) {
              statusEl.textContent = "Thanks — your message is on its way. We'll get back to you soon.";
              statusEl.className = 'form-status is-success';
            }
          } else {
            if (statusEl) {
              statusEl.textContent = "Something didn't go through. Mind trying again, or just call us at (530) 797-4788?";
              statusEl.className = 'form-status is-error';
            }
          }
        })
        .catch(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = originalBtnText;
          if (statusEl) {
            statusEl.textContent = "Something didn't go through. Mind trying again, or just call us at (530) 797-4788?";
            statusEl.className = 'form-status is-error';
          }
        });
    });
  }
});
