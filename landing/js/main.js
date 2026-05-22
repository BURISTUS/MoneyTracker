(function () {
  'use strict';

  var LANG_FLAGS = {
    en: '\u{1F1FA}\u{1F1F8}', ru: '\u{1F1F7}\u{1F1FA}', es: '\u{1F1EA}\u{1F1F8}',
    pt: '\u{1F1E7}\u{1F1F7}', fr: '\u{1F1EB}\u{1F1F7}', de: '\u{1F1E9}\u{1F1EA}',
    ja: '\u{1F1EF}\u{1F1F5}', zh: '\u{1F1E8}\u{1F1F3}', ko: '\u{1F1F0}\u{1F1F7}',
    ar: '\u{1F1F8}\u{1F1E6}', hi: '\u{1F1EE}\u{1F1F3}', it: '\u{1F1EE}\u{1F1F9}',
    nl: '\u{1F1F3}\u{1F1F1}', pl: '\u{1F1F5}\u{1F1F1}', tr: '\u{1F1F9}\u{1F1F7}',
    uk: '\u{1F1FA}\u{1F1E6}', th: '\u{1F1F9}\u{1F1ED}', vi: '\u{1F1FB}\u{1F1F3}',
    id: '\u{1F1EE}\u{1F1E9}', bn: '\u{1F1E7}\u{1F1F2}',
  };

  var RTL_LANGS = ['ar'];
  var currentLang = localStorage.getItem('sw-lang') || detectLang();
  var cache = {};

  function detectLang() {
    var n = navigator.language || 'en';
    var c = n.split('-')[0].toLowerCase();
    return LANG_FLAGS[c] ? c : 'en';
  }

  function loadJSON(lang) {
    if (cache[lang]) return Promise.resolve(cache[lang]);
    return fetch('i18n/' + lang + '.json')
      .then(function (r) { if (!r.ok) throw new Error(); return r.json(); })
      .then(function (d) { cache[lang] = d; return d; })
      .catch(function () {
        if (lang !== 'en') return loadJSON('en');
        return {};
      });
  }

  function apply(t) {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var k = el.getAttribute('data-i18n').split('.');
      var v = t;
      for (var i = 0; i < k.length; i++) { if (v == null) break; v = v[k[i]]; }
      if (typeof v === 'string') el.textContent = v;
    });
  }

  function setLang(lang) {
    currentLang = lang;
    localStorage.setItem('sw-lang', lang);
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('data-lang', lang);
    if (RTL_LANGS.indexOf(lang) !== -1) {
      document.documentElement.setAttribute('dir', 'rtl');
    } else {
      document.documentElement.removeAttribute('dir');
    }
    var flag = document.getElementById('langFlag');
    if (flag) flag.textContent = LANG_FLAGS[lang] || '';
    document.querySelectorAll('.lang-menu button').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-lang') === lang);
    });
    loadJSON(lang).then(apply);
  }

  function initTheme() {
    var saved = localStorage.getItem('sw-theme');
    if (saved) document.documentElement.setAttribute('data-theme', saved);
    document.getElementById('themeToggle').addEventListener('click', function () {
      var cur = document.documentElement.getAttribute('data-theme');
      var next = cur === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('sw-theme', next);
    });
  }

  function initLang() {
    var btn = document.getElementById('langBtn');
    var menu = document.getElementById('langMenu');
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      menu.classList.toggle('open');
    });
    document.addEventListener('click', function () { menu.classList.remove('open'); });
    menu.addEventListener('click', function (e) { e.stopPropagation(); });
    menu.querySelectorAll('button').forEach(function (b) {
      b.addEventListener('click', function () {
        setLang(this.getAttribute('data-lang'));
        menu.classList.remove('open');
      });
    });
  }

  function initNav() {
    var nav = document.getElementById('nav');
    window.addEventListener('scroll', function () {
      nav.classList.toggle('scrolled', window.pageYOffset > 40);
    }, { passive: true });
  }

  function initScroll() {
    if (!('IntersectionObserver' in window)) return;
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.08 });
    document.querySelectorAll('.section').forEach(function (s) {
      s.classList.add('fade-in');
      obs.observe(s);
    });
  }

  function initSmooth() {
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var h = this.getAttribute('href');
        if (h === '#') return;
        var t = document.querySelector(h);
        if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }); }
      });
    });
  }

  function init() {
    initTheme();
    initLang();
    initNav();
    initScroll();
    initSmooth();
    setLang(currentLang);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
