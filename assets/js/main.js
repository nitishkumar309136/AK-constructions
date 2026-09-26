(function () {
  'use strict';

  var WA_BASE = 'https://wa.me/918770418045';

  function formatINR(num) {
    return '\u20B9' + Math.round(num).toLocaleString('en-IN');
  }

  /* ===== Mobile nav toggle ===== */
  var navToggle = document.querySelector('.nav-toggle');
  var mobileNav = document.getElementById('mobileNav');
  if (navToggle && mobileNav) {
    navToggle.addEventListener('click', function () {
      var open = mobileNav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      navToggle.textContent = open ? '\u00D7' : '\u2630';
    });
  }

  /* ===== FAQ accordion ===== */
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var q = item.querySelector('.faq-q');
    var a = item.querySelector('.faq-a');
    if (!q || !a) return;
    q.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(function (i) {
        i.classList.remove('open');
        var ans = i.querySelector('.faq-a');
        if (ans) ans.style.maxHeight = null;
        var btn = i.querySelector('.faq-q');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('open');
        a.style.maxHeight = a.scrollHeight + 'px';
        q.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ===== Project tabs ===== */
  document.querySelectorAll('.tab-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var target = btn.getAttribute('data-tab');
      document.querySelectorAll('.tab-btn').forEach(function (b) {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      document.querySelectorAll('.tab-panel').forEach(function (p) { p.classList.remove('active'); });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      var panel = document.getElementById(target);
      if (panel) panel.classList.add('active');
    });
  });

  /* ===== Cost calculator ===== */
  var areaInput = document.getElementById('area');
  var floorsInput = document.getElementById('floors');
  var cityInput = document.getElementById('city');
  var tierBtns = document.querySelectorAll('.tier-btn');
  var resultAmount = document.getElementById('resultAmount');
  var cityNote = document.getElementById('cityNote');

  if (areaInput && floorsInput && cityInput && resultAmount) {
    var currentRate = 2200;

    function calcCost() {
      var area = parseFloat(areaInput.value) || 0;
      var floors = parseFloat(floorsInput.value) || 1;
      var cityFactor = parseFloat(cityInput.value) || 1;
      var base = area * floors * currentRate * cityFactor;
      var low = base * 0.95;
      var high = base * 1.10;
      resultAmount.textContent = formatINR(low) + ' \u2013 ' + formatINR(high);
      if (cityNote && cityInput.selectedOptions.length) {
        cityNote.textContent = 'Rate factor for ' + cityInput.selectedOptions[0].textContent + ' applied.';
      }
    }

    tierBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        tierBtns.forEach(function (b) {
          b.classList.remove('active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
        currentRate = parseFloat(btn.getAttribute('data-rate'));
        calcCost();
      });
    });

    [areaInput, floorsInput, cityInput].forEach(function (el) {
      el.addEventListener('input', calcCost);
      el.addEventListener('change', calcCost);
    });

    calcCost();
  }

  /* ===== EMI calculator ===== */
  var loanAmt = document.getElementById('loanAmt');
  var rate = document.getElementById('rate');
  var tenure = document.getElementById('tenure');

  if (loanAmt && rate && tenure) {
    var loanAmtVal = document.getElementById('loanAmtVal');
    var rateVal = document.getElementById('rateVal');
    var tenureVal = document.getElementById('tenureVal');
    var emiOut = document.getElementById('emiOut');

    function calcEMI() {
      var P = parseFloat(loanAmt.value);
      var annualR = parseFloat(rate.value);
      var years = parseFloat(tenure.value);
      var r = annualR / 12 / 100;
      var n = years * 12;
      var emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);

      loanAmtVal.textContent = formatINR(P);
      rateVal.textContent = annualR.toFixed(1) + '%';
      tenureVal.textContent = years + ' yrs';
      emiOut.textContent = formatINR(emi);
    }

    [loanAmt, rate, tenure].forEach(function (el) { el.addEventListener('input', calcEMI); });
    calcEMI();
  }

  /* ===== Reviews loader (from assets/data/reviews.json) ===== */
  var reviewList = document.getElementById('reviewList');
  if (reviewList) {
    var fallbackShown = false;

    function starsHTML(n) {
      n = Math.max(0, Math.min(5, Math.round(Number(n) || 5)));
      return new Array(n + 1).join('\u2605') + new Array(6 - n).join('\u2606');
    }

    function cardHTML(r) {
      return '<div class="review-card">' +
        '<div class="r-head">' +
          '<div class="r-name">' + escapeHTML(r.name || 'Google User') +
            '<span class="stars">' + starsHTML(r.rating) + '</span></div>' +
          '<div class="r-meta">' + escapeHTML(r.time || '') + '</div>' +
        '</div>' +
        '<p>' + escapeHTML(r.text || '') + '</p>' +
      '</div>';
    }

    function escapeHTML(s) {
      return String(s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function showFallback() {
      if (fallbackShown) return;
      fallbackShown = true;
      reviewList.innerHTML =
        '<div class="testi-card"><div class="ph-title">Review Yahan Aayega</div>' +
        '<p>Google se real reviews auto-load honge — iske liye tools/fetch-reviews.js chalayein (REVIEWS-GUIDE.md dekhein). Tab tak, aapke 4.9\u2605 rating aur 115 reviews Google/Justdial par live hain.</p></div>' +
        '<div class="testi-card"><div class="ph-title">Review Yahan Aayega</div>' +
        '<p>Apne recent customers se Google par review likhwane ke liye, unhe yeh short link bhejein: apna review likhne ka link Contact page par milta hai.</p></div>';
    }

    fetch('/assets/data/reviews.json', { cache: 'no-store' })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        var items = (data && Array.isArray(data.reviews)) ? data.reviews : [];
        if (!items.length) { showFallback(); return; }
        reviewList.innerHTML = items.map(cardHTML).join('');
      })
      .catch(showFallback);
  }

  /* ===== Naksha slider (home hero) ===== */
  var nakshaSlider = document.getElementById('nakshaSlider');
  if (nakshaSlider) {
    var track = document.getElementById('nakshaTrack');
    var slides = track.querySelectorAll('img');
    var dotsWrap = document.getElementById('nakshaDots');
    var prevBtn = document.getElementById('nakshaPrev');
    var nextBtn = document.getElementById('nakshaNext');
    var idx = 0;
    var dots = [];

    slides.forEach(function (_, i) {
      var d = document.createElement('button');
      d.type = 'button';
      d.setAttribute('aria-label', 'Naksha ' + (i + 1));
      d.addEventListener('click', function () { goTo(i); });
      dotsWrap.appendChild(d);
      dots.push(d);
    });

    function render() {
      track.style.transform = 'translateX(-' + (idx * 100) + '%)';
      dots.forEach(function (d, i) { d.classList.toggle('active', i === idx); });
    }

    function goTo(i) {
      idx = (i + slides.length) % slides.length;
      render();
    }

    prevBtn.addEventListener('click', function () { goTo(idx - 1); });
    nextBtn.addEventListener('click', function () { goTo(idx + 1); });
    render();
  }

  /* ===== Home hero: full-screen auto slider ===== */
  var heroSlides = document.getElementById('heroSlides');
  if (heroSlides) {
    var hSlides = heroSlides.querySelectorAll('.hs-slide');
    var hDotsWrap = document.getElementById('heroDots');
    var hCaption = document.getElementById('heroCaption');
    var hPause = document.getElementById('heroPause');
    var hIdx = 0, hTimer = null, hDots = [];
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var userPaused = reduceMotion; // respect reduced-motion: no autoplay

    hSlides.forEach(function (_, i) {
      var d = document.createElement('button');
      d.type = 'button';
      d.setAttribute('aria-label', 'Photo ' + (i + 1));
      d.addEventListener('click', function () { heroGo(i); restart(); });
      hDotsWrap.appendChild(d);
      hDots.push(d);
    });

    function heroGo(i) {
      hIdx = (i + hSlides.length) % hSlides.length;
      hSlides.forEach(function (s, j) { s.classList.toggle('active', j === hIdx); });
      hDots.forEach(function (d, j) { d.classList.toggle('active', j === hIdx); });
      if (hCaption) hCaption.textContent = hSlides[hIdx].getAttribute('data-caption') || '';
    }
    function stop() { clearInterval(hTimer); hTimer = null; }
    function start() { stop(); if (!userPaused) hTimer = setInterval(function () { heroGo(hIdx + 1); }, 5000); }
    function restart() { if (hTimer) start(); }

    document.getElementById('heroPrev').addEventListener('click', function () { heroGo(hIdx - 1); restart(); });
    document.getElementById('heroNext').addEventListener('click', function () { heroGo(hIdx + 1); restart(); });
    hPause.addEventListener('click', function () {
      userPaused = !userPaused;
      hPause.setAttribute('aria-pressed', userPaused ? 'true' : 'false');
      hPause.setAttribute('aria-label', userPaused ? 'Slideshow chalayein' : 'Slideshow rokein');
      hPause.innerHTML = userPaused ? '&#9654;' : '&#10074;&#10074;';
      userPaused ? stop() : start();
    });
    if (reduceMotion) {
      hPause.setAttribute('aria-pressed', 'true');
      hPause.innerHTML = '&#9654;';
    }

    // swipe on phones
    var touchX = null;
    heroSlides.parentNode.addEventListener('touchstart', function (e) { touchX = e.touches[0].clientX; }, { passive: true });
    heroSlides.parentNode.addEventListener('touchend', function (e) {
      if (touchX === null) return;
      var dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 45) { heroGo(hIdx + (dx < 0 ? 1 : -1)); restart(); }
      touchX = null;
    });
    // don't cycle in a background tab
    document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });

    heroGo(0);
    start();
  }

  /* ===== Lightbox for gallery photos ===== */
  var lbLinks = Array.prototype.slice.call(document.querySelectorAll('a.lb'));
  if (lbLinks.length) {
    var lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.innerHTML = '<img alt=""><div class="lb-cap"></div>' +
      '<button type="button" class="lb-close" aria-label="Band karein">&times;</button>' +
      '<button type="button" class="lb-prev" aria-label="Pichhli photo">&#8249;</button>' +
      '<button type="button" class="lb-next" aria-label="Agli photo">&#8250;</button>';
    document.body.appendChild(lb);
    var lbImg = lb.querySelector('img'), lbCap = lb.querySelector('.lb-cap');
    var lbGroup = [], lbIdx = 0, lbReturn = null;

    function lbShow(i) {
      lbIdx = (i + lbGroup.length) % lbGroup.length;
      var a = lbGroup[lbIdx];
      lbImg.src = a.getAttribute('href');
      lbImg.alt = a.getAttribute('data-caption') || '';
      lbCap.textContent = a.getAttribute('data-caption') || '';
    }
    function lbClose() {
      lb.classList.remove('open');
      lbImg.removeAttribute('src');
      if (lbReturn) lbReturn.focus();
    }

    lbLinks.forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        // browse only the photos in the same grid (e.g. the open project tab)
        var grid = a.closest('.gallery-grid') || document;
        lbGroup = Array.prototype.slice.call(grid.querySelectorAll('a.lb'));
        lbReturn = a;
        lbShow(lbGroup.indexOf(a));
        lb.classList.add('open');
        lb.querySelector('.lb-close').focus();
      });
    });
    lb.querySelector('.lb-close').addEventListener('click', lbClose);
    lb.querySelector('.lb-prev').addEventListener('click', function () { lbShow(lbIdx - 1); });
    lb.querySelector('.lb-next').addEventListener('click', function () { lbShow(lbIdx + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) lbClose(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') lbClose();
      else if (e.key === 'ArrowLeft') lbShow(lbIdx - 1);
      else if (e.key === 'ArrowRight') lbShow(lbIdx + 1);
    });
  }

  /* ===== Plot area converter (dhur / katha / decimal -> sq ft) ===== */
  var convValue = document.getElementById('convValue');
  var convUnit = document.getElementById('convUnit');
  if (convValue && convUnit) {
    // Common Bihar land units, in sq ft (katha size varies by district)
    var UNIT_SQFT = { sqft: 1, sqm: 10.7639, dhur: 68.0625, katha: 1361.25, decimal: 435.6, bigha: 27225 };
    var plotCards = document.querySelectorAll('.plot-card[data-area]');
    var convMatch = document.getElementById('convMatch');
    var convMatchLink = document.getElementById('convMatchLink');

    function fmt(n) {
      return n.toLocaleString('en-IN', { maximumFractionDigits: n < 10 ? 2 : 1 });
    }

    function convert() {
      var sqft = (parseFloat(convValue.value) || 0) * (UNIT_SQFT[convUnit.value] || 1);
      document.querySelectorAll('[data-conv]').forEach(function (el) {
        el.textContent = fmt(sqft / UNIT_SQFT[el.getAttribute('data-conv')]);
      });

      var best = null;
      plotCards.forEach(function (card) {
        card.classList.remove('match');
        var diff = Math.abs(parseFloat(card.getAttribute('data-area')) - sqft);
        if (!best || diff < best.diff) best = { card: card, diff: diff };
      });
      if (!convMatch || !best) return;
      if (sqft <= 0) { convMatch.hidden = true; return; }
      best.card.classList.add('match');
      convMatchLink.href = best.card.getAttribute('href');
      convMatchLink.textContent = best.card.querySelector('.dims').textContent;
      convMatch.hidden = false;
    }

    convValue.addEventListener('input', convert);
    convUnit.addEventListener('change', convert);
    convert();
  }

  /* ===== Contact form (front-end only; opens WhatsApp with details) ===== */
  var leadForm = document.getElementById('leadForm');
  if (leadForm) {
    leadForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = (document.getElementById('name') || {}).value || '';
      var mobile = (document.getElementById('mobile') || {}).value || '';
      var town = (document.getElementById('townInput') || {}).value || '';
      var plot = (document.getElementById('plotSize') || {}).value || '';
      var msg = (document.getElementById('msg') || {}).value || '';
      var text = 'Namaste, main ' + name + ' hun. ' +
        (town ? 'Shehar/Gaon: ' + town + '. ' : '') +
        (plot ? 'Plot size: ' + plot + ' sqft. ' : '') +
        (msg ? msg + ' ' : '') +
        (mobile ? '(Mobile: ' + mobile + ')' : '');
      var formNote = document.getElementById('formNote');
      if (formNote) {
        formNote.textContent = 'Dhanyavaad, ' + name + '! Aapka WhatsApp message taiyaar ho gaya hai — abhi bhejein aur 24 ghanton mein jawab paayein.';
        formNote.style.display = 'block';
      }
      window.open(WA_BASE + '?text=' + encodeURIComponent(text), '_blank');
    });
  }
})();
