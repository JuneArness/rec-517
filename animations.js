/* ==========================================================================
   REC 517 | animations.js
   Scroll reveals, number counters and a gentle hero parallax.
   Everything is skipped when the visitor prefers reduced motion, and the
   page still shows all content if this file doesn't run.
   ========================================================================== */
(function () {
  "use strict";

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var targets = Array.prototype.slice.call(document.querySelectorAll(".reveal, .reveal-stagger, .reveal-media, .share-bar, [data-count]"));

  /* ---------- Number counters ----------
     <span data-count="70500">70,500</span> counts up from 0 when seen.
     The final number is already in the HTML, so it's correct without JS. */
  function fmt(n, el) {
    var s = Math.round(n).toString();
    if (el.getAttribute("data-comma") !== "false") s = s.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return s;
  }
  function runCounter(el) {
    var end = parseFloat(el.getAttribute("data-count"));
    if (isNaN(end)) return;
    if (reduce) { el.textContent = fmt(end, el); return; }
    var dur = 1700, t0 = null;
    function step(t) {
      if (t0 === null) t0 = t;
      var p = Math.min(1, (t - t0) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(end * eased, el);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function reveal(el) {
    el.classList.add("is-in");
    if (el.hasAttribute("data-count")) runCounter(el);
  }

  if (!("IntersectionObserver" in window) || reduce) {
    targets.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    targets.forEach(function (el) { if (el.hasAttribute("data-count")) el.textContent = "0"; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { reveal(en.target); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    targets.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Gentle parallax on the hero court lines ---------- */
  if (!reduce) {
    var layers = Array.prototype.slice.call(document.querySelectorAll("[data-parallax]"));
    if (layers.length) {
      var ticking = false;
      var update = function () {
        var y = window.scrollY;
        layers.forEach(function (l) {
          if (y < window.innerHeight * 1.2) l.style.transform = "translate3d(0," + (y * parseFloat(l.getAttribute("data-parallax"))).toFixed(1) + "px,0)";
        });
        ticking = false;
      };
      window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    }
  }
})();
