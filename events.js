/* ==========================================================================
   REC 517 | events.js : the Events page. Upcoming events, past events with
   photo galleries, and a full-screen photo viewer. Events and photos are
   added in the Admin page (admin.html), not here.
   ========================================================================== */
(function () {
  "use strict";
  var A = window.RAPI; if (!A) return;
  var esc = A.esc, $ = function (s, r) { return (r || document).querySelector(s); };
  var up = $("[data-upcoming]"), past = $("[data-past]");
  if (!up || !past) return;
  var EVENTS = [];
  var CAL = '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>';
  var PIN = '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 21.5s-7-6.2-7-11.5a7 7 0 0 1 14 0c0 5.3-7 11.5-7 11.5z"/><circle cx="12" cy="10" r="2.6"/></svg>';
  var CLOCK = '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 2"/></svg>';
  var CAM = '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 8h3l2-2.5h6L17 8h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13.5" r="3.5"/></svg>';

  function today() { var d = new Date(); return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
  function isUpcoming(e) { var end = A.day(e.end_date) || A.day(e.event_date); return end && end >= today(); }

  function card(e, i, upcoming) {
    var d = A.day(e.event_date), cover = A.photoUrl(e.cover) || A.photoUrl(e.photos[0] && e.photos[0].path), n = e.photos.length;
    var link = A.safeHttps(e.link_url);
    return '<article class="event-card' + (upcoming ? " is-upcoming" : "") + '">' +
      '<div class="event-media">' + (cover ? '<img src="' + esc(cover) + '" alt="" loading="lazy" decoding="async">' : '<span class="event-ph" aria-hidden="true">517</span>') +
      (d ? '<span class="date-badge" aria-hidden="true"><b>' + d.toLocaleDateString("en-US", { month: "short" }) + '</b>' + d.getDate() + '</span>' : "") +
      (n ? '<span class="photo-count">' + CAM + n + " photo" + (n === 1 ? "" : "s") + "</span>" : "") + "</div>" +
      '<div class="event-body"><h3>' + esc(e.title) + "</h3>" +
      '<ul class="event-meta"><li>' + CAL + "<span>" + esc(A.dateRange(e.event_date, e.end_date)) + "</span></li>" +
      (e.time_text ? "<li>" + CLOCK + "<span>" + esc(e.time_text) + "</span></li>" : "") +
      (e.location ? "<li>" + PIN + "<span>" + esc(e.location) + "</span></li>" : "") + "</ul>" +
      (e.summary ? "<p>" + esc(e.summary) + "</p>" : "") +
      '<div class="event-actions">' +
      (n || e.details ? '<button type="button" class="btn btn-sm ' + (upcoming ? "btn-outline" : "btn-dark") + '" data-open="' + i + '">' + (n ? "View photos" : "Details") + '<span class="sr-only">: ' + esc(e.title) + "</span></button>" : "") +
      (link ? '<a class="btn btn-sm btn-primary" href="' + esc(link) + '" target="_blank" rel="noopener">' + esc(e.link_label || "Learn more") + '<span class="sr-only"> (opens in a new tab)</span></a>' : "") +
      "</div></div></article>";
  }

  function render() {
    var upc = [], old = [];
    EVENTS.forEach(function (e, i) { (isUpcoming(e) ? upc : old).push([e, i]); });
    upc.sort(function (a, b) { return a[0].event_date < b[0].event_date ? -1 : 1; });   // soonest first
    up.innerHTML = upc.length ? upc.map(function (x) { return card(x[0], x[1], true); }).join("")
      : '<div class="empty-state"><p><strong>No upcoming events posted yet.</strong> Check back soon, or <a href="./involved.html">get involved</a> to hear about them first.</p></div>';
    past.innerHTML = old.length ? old.map(function (x) { return card(x[0], x[1], false); }).join("")
      : '<div class="empty-state"><p>Photos from REC 517 events will appear here.</p></div>';
  }

  /* ---------- gallery dialog ---------- */
  var dlg = $("#gallery"), grid = $("[data-gallery-grid]"), cur = null, lastFocus = null;
  function openGallery(i) {
    var e = EVENTS[i]; if (!e) return; cur = e; lastFocus = document.activeElement;
    $("#gallery-title").textContent = e.title;
    $("[data-gallery-meta]").textContent = [A.dateRange(e.event_date, e.end_date), e.time_text, e.location].filter(Boolean).join(" · ");
    $("[data-gallery-details]").innerHTML = (e.details ? "<p>" + A.multiline(e.details) + "</p>" : e.summary ? "<p>" + esc(e.summary) + "</p>" : "");
    grid.innerHTML = e.photos.map(function (p, k) {
      var u = A.photoUrl(p.path);
      return '<li><button type="button" class="thumb" data-photo="' + k + '" aria-label="Open photo ' + (k + 1) + " of " + e.photos.length + (p.caption ? ": " + esc(p.caption) : "") + '">' +
        '<img src="' + esc(u) + '" alt="" loading="lazy" decoding="async"></button></li>';
    }).join("");
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", "");
    document.body.classList.add("menu-open");
  }
  function closeGallery() { if (dlg.open) dlg.close(); }
  dlg.addEventListener("close", function () { document.body.classList.remove("menu-open"); if (lastFocus) lastFocus.focus(); });
  dlg.addEventListener("click", function (ev) {
    if (ev.target === dlg) return closeGallery();
    if (ev.target.closest("[data-close]")) return closeGallery();
    var t = ev.target.closest("[data-photo]"); if (t) openLightbox(+t.getAttribute("data-photo"), t);
  });

  /* ---------- lightbox ---------- */
  var lb = $("#lightbox"), img = $("[data-lb-img]"), idx = 0, lbFrom = null;
  function show() {
    var p = cur.photos[idx]; img.src = A.photoUrl(p.path);
    img.alt = p.caption || ("Photo " + (idx + 1) + " from " + cur.title);
    $("[data-lb-cap]").textContent = p.caption || "";
    $("[data-lb-count]").textContent = (idx + 1) + " / " + cur.photos.length;
    var single = cur.photos.length < 2; $("[data-lb-prev]").hidden = single; $("[data-lb-next]").hidden = single;
    [idx - 1, idx + 1].forEach(function (k) { var q = cur.photos[(k + cur.photos.length) % cur.photos.length]; if (q) new Image().src = A.photoUrl(q.path); });
  }
  function openLightbox(k, from) { idx = k; lbFrom = from; (dlg.open ? dlg : document.body).appendChild(lb); lb.hidden = false; show(); $("[data-lb-close]").focus(); document.addEventListener("keydown", onKey, true); }
  function closeLightbox() { lb.hidden = true; document.removeEventListener("keydown", onKey, true); if (lbFrom) lbFrom.focus(); }
  function step(d) { idx = (idx + d + cur.photos.length) % cur.photos.length; show(); }
  function onKey(ev) {
    if (lb.hidden) return;
    if (ev.key === "Escape") { ev.preventDefault(); ev.stopPropagation(); closeLightbox(); }
    else if (ev.key === "ArrowRight") { ev.preventDefault(); step(1); }
    else if (ev.key === "ArrowLeft") { ev.preventDefault(); step(-1); }
    else if (ev.key === "Tab") {   // keep focus inside the viewer
      var f = Array.prototype.filter.call(lb.querySelectorAll("button"), function (b) { return !b.hidden; });
      var i = f.indexOf(document.activeElement); ev.preventDefault(); f[(i + (ev.shiftKey ? -1 : 1) + f.length) % f.length].focus();
    }
  }
  lb.addEventListener("click", function (ev) {
    if (ev.target.closest("[data-lb-close]") || ev.target === lb) return closeLightbox();
    if (ev.target.closest("[data-lb-prev]")) return step(-1);
    if (ev.target.closest("[data-lb-next]")) return step(1);
  });
  var x0 = null;
  lb.addEventListener("touchstart", function (ev) { x0 = ev.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", function (ev) { if (x0 == null) return; var dx = ev.changedTouches[0].clientX - x0; if (Math.abs(dx) > 45) step(dx < 0 ? 1 : -1); x0 = null; });

  document.addEventListener("click", function (ev) { var b = ev.target.closest("[data-open]"); if (b) openGallery(+b.getAttribute("data-open")); });

  if (!A.ready) {
    up.innerHTML = '<div class="empty-state"><p><strong>Events are coming soon.</strong> Check back for upcoming events and photos, or <a href="./involved.html">get involved</a> now.</p></div>';
    past.innerHTML = '<div class="empty-state"><p>Photos from REC 517 events will appear here.</p></div>';
    return;
  }
  A.events().then(function (list) { EVENTS = (list || []).map(function (e) { e.photos = e.photos || []; return e; }); render(); })
    .catch(function () {
      up.innerHTML = '<div class="empty-state"><p>Events couldn’t load right now. Please refresh the page in a minute.</p></div>';
      past.innerHTML = "";
    });
})();
