/* ==========================================================================
   REC 517 | admin.js : the private Admin page (admin.html).
   Sign in -> Events (create/edit, upload photos from phone or computer,
   captions, cover photo, order) and Forms (Sponsor / Donate / Volunteer).
   Every action is checked again by the database; hiding a button here is
   never the only protection.
   ========================================================================== */
(function () {
  "use strict";
  var A = window.RAPI; if (!A) return;
  var esc = A.esc;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var views = $$("[data-view]");
  function view(name) { views.forEach(function (v) { v.hidden = v.getAttribute("data-view") !== name; }); }
  function status(el, kind, msg) { el.className = "form-status show " + kind; el.innerHTML = msg; }
  function clear(el) { el.className = "form-status"; el.innerHTML = ""; }
  var appStatus = $("[data-app-status]");
  function fail(err) { status(appStatus, "err", esc(err.message || String(err))); appStatus.focus(); if (err.code === "AUTH") start(); }
  function flash(msg) { status(appStatus, "ok", esc(msg)); clearTimeout(flash.t); flash.t = setTimeout(function () { clear(appStatus); }, 4000); }

  if (!A.ready) { $("[data-not-connected]").hidden = false; return; }

  /* ---------------- sign in ---------------- */
  var recovering = /type=recovery/.test(location.hash);
  A.auth.onChange(function (ev) { if (ev === "PASSWORD_RECOVERY") { recovering = true; view("newpass"); } else if (ev === "SIGNED_OUT") view("signin"); });

  $("#signin-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var st = $("[data-signin-status]"), b = e.target.querySelector('button[type="submit"]');
    var em = $("#a-email").value.trim(), pw = $("#a-pass").value;
    if (!em || !pw) { status(st, "err", "Enter your email and password."); return; }
    b.disabled = true; clear(st);
    A.auth.signIn(em, pw).then(function () { $("#a-pass").value = ""; start(); })
      .catch(function (err) { status(st, "err", esc(err.message)); st.focus(); })
      .then(function () { b.disabled = false; });
  });
  $("[data-forgot]").addEventListener("click", function () {
    var st = $("[data-signin-status]"), em = $("#a-email").value.trim();
    if (!em) { status(st, "info", "Type your email above first, then press “Forgot password?” again."); $("#a-email").focus(); return; }
    A.auth.reset(em).then(function () { status(st, "ok", "If that email has an account, a reset link is on its way. Open it on this device."); })
      .catch(function (err) { status(st, "err", esc(err.message)); });
  });
  $("#newpass-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var st = $("[data-newpass-status]"), pw = $("#a-new").value;
    if (pw.length < 10) { status(st, "err", "Use at least 10 characters."); return; }
    A.auth.setPassword(pw).then(function () { recovering = false; history.replaceState(null, "", location.pathname); start(); })
      .catch(function (err) { status(st, "err", esc(err.message)); });
  });
  $$("[data-signout]").forEach(function (b) { b.addEventListener("click", function () { A.auth.signOut().then(function () { view("signin"); }); }); });

  function start() {
    if (recovering) return view("newpass");
    A.auth.user().then(function (u) {
      if (!u) return view("signin");
      return A.rpc("admin_me").then(function (me) {
        if (!me.is_admin) return view("denied");
        $("[data-who]").textContent = u.email || "";
        view("app"); load();
      });
    }).catch(function (err) { view("signin"); status($("[data-signin-status]"), "err", esc(err.message)); });
  }

  /* ---------------- tabs ---------------- */
  var tabs = $$("[data-tab]");
  function selectTab(name, focus) {
    tabs.forEach(function (t) {
      var on = t.getAttribute("data-tab") === name;
      t.setAttribute("aria-selected", on ? "true" : "false"); t.tabIndex = on ? 0 : -1; if (on && focus) t.focus();
    });
    $$("[data-panel]").forEach(function (p) { p.hidden = p.getAttribute("data-panel") !== name; });
    clear(appStatus);
  }
  tabs.forEach(function (t, i) {
    t.addEventListener("click", function () { selectTab(t.getAttribute("data-tab")); load(); });
    t.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      var n = tabs[(i + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length]; selectTab(n.getAttribute("data-tab"), true);
    });
  });

  /* ---------------- data ---------------- */
  var OV = { events: [], requests: [] };
  function load() {
    return A.rpc("admin_overview").then(function (ov) { OV = ov; drawEvents(); drawRequests(); }).catch(fail);
  }

  /* ---------------- events list ---------------- */
  function drawEvents() {
    var ul = $("[data-ev-list]");
    if (!OV.events.length) { ul.innerHTML = '<li class="empty-state"><p>No events yet. Press <strong>+ New event</strong> to add your first one.</p></li>'; return; }
    ul.innerHTML = OV.events.map(function (e) {
      var u = A.photoUrl(e.cover);
      return '<li><button type="button" class="admin-item" data-edit="' + esc(e.id) + '">' +
        (u ? '<img src="' + esc(u) + '" alt="" loading="lazy">' : '<span class="admin-thumb-ph" aria-hidden="true">517</span>') +
        '<span class="admin-item-main"><strong>' + esc(e.title) + "</strong><span>" + esc(A.dateRange(e.event_date, e.end_date)) + " · " + e.photos + " photo" + (e.photos === 1 ? "" : "s") + "</span></span>" +
        '<span class="pill ' + (e.published ? "pill-live" : "pill-draft") + '">' + (e.published ? "Published" : "Draft") + "</span></button></li>";
    }).join("");
  }
  $("[data-ev-list]").addEventListener("click", function (e) { var b = e.target.closest("[data-edit]"); if (b) openEvent(b.getAttribute("data-edit")); });
  $("[data-new-event]").addEventListener("click", function () { openEvent(null); });
  $("[data-back]").addEventListener("click", function () { closeEditor(); });

  /* ---------------- event editor ---------------- */
  var form = $("#event-form"), EV = null;
  function showEditor(on) { $("[data-ev-list-view]").hidden = on; $("[data-ev-edit-view]").hidden = !on; window.scrollTo(0, $(".admin").offsetTop - 80); }
  function closeEditor() { if (uploading) return alertUpload(); EV = null; showEditor(false); load(); }
  function openEvent(id) {
    clear(appStatus); form.reset(); $$(".field.invalid", form).forEach(function (f) { f.classList.remove("invalid"); });
    if (!id) {
      EV = null; $("[data-ev-heading]").textContent = "New event"; $("[data-del-event]").hidden = true; drawPhotos(); showEditor(true); $("#e-title").focus(); return;
    }
    A.rpc("admin_get_event", { p_id: id }).then(function (e) {
      EV = e; $("[data-ev-heading]").textContent = "Edit event";
      ["title", "event_date", "end_date", "time_text", "location", "summary", "details", "link_url", "link_label"].forEach(function (k) { form.elements[k].value = e[k] || ""; });
      form.elements.published.checked = !!e.published; $("[data-del-event]").hidden = false;
      drawPhotos(); showEditor(true); $("[data-ev-heading]").focus && $("[data-ev-heading]").setAttribute("tabindex", "-1"); $("[data-ev-heading]").focus();
    }).catch(fail);
  }
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var t = form.elements.title, d = form.elements.event_date, l = form.elements.link_url, ok = true;
    [[t, t.value.trim() !== ""], [d, !!d.value], [l, !l.value.trim() || /^https:\/\/\S+$/.test(l.value.trim())]].forEach(function (x) {
      x[0].closest(".field").classList.toggle("invalid", !x[1]); x[0].setAttribute("aria-invalid", x[1] ? "false" : "true"); if (!x[1] && ok) { ok = false; x[0].focus(); }
    });
    if (!ok) return status(appStatus, "err", "Please fix the highlighted fields.");
    var p = {}; ["title", "event_date", "end_date", "time_text", "location", "summary", "details", "link_url", "link_label"].forEach(function (k) { p[k] = form.elements[k].value.trim(); });
    p.published = form.elements.published.checked; if (EV) p.id = EV.id;
    var b = form.querySelector('button[type="submit"]'); b.disabled = true;
    A.rpc("admin_save_event", { p: p }).then(function (id) {
      var isNew = !EV;
      return A.rpc("admin_get_event", { p_id: id }).then(function (e) {
        EV = e; $("[data-del-event]").hidden = false; $("[data-ev-heading]").textContent = "Edit event"; drawPhotos();
        flash(isNew ? "Event saved. Now add photos below." : (p.published ? "Saved. It’s live on the Events page." : "Saved as a draft (not shown on the website)."));
        if (isNew) $("[data-photos-card]").scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }).catch(fail).then(function () { b.disabled = false; });
  });
  $("[data-del-event]").addEventListener("click", function () {
    if (!EV || !confirm("Delete “" + EV.title + "” and all " + (EV.photos || []).length + " of its photos? This can’t be undone.")) return;
    A.rpc("admin_delete_event", { p_id: EV.id }).then(function (paths) { return A.removeFiles(paths).catch(function () {}); })
      .then(function () { EV = null; showEditor(false); load(); flash("Event deleted."); }).catch(fail);
  });

  /* ---------------- photos ---------------- */
  var grid = $("[data-photo-grid]");
  function drawPhotos() {
    var has = !!EV;
    $("[data-photo-tools]").hidden = !has; $("[data-photos-hint]").hidden = has;
    if (!has) { grid.innerHTML = ""; return; }
    var ph = EV.photos || [];
    $("[data-photos-card] h3").textContent = "Photos (" + ph.length + ")";
    grid.innerHTML = ph.map(function (p, i) {
      var cover = EV.cover_photo_id === p.id;
      return '<li class="photo-admin' + (cover ? " is-cover" : "") + '" data-id="' + esc(p.id) + '">' +
        '<img src="' + esc(A.photoUrl(p.path)) + '" alt="Photo ' + (i + 1) + '" loading="lazy">' +
        (cover ? '<span class="cover-tag">Cover</span>' : "") +
        '<label class="sr-only" for="cap-' + esc(p.id) + '">Caption for photo ' + (i + 1) + "</label>" +
        '<input id="cap-' + esc(p.id) + '" class="cap" maxlength="200" placeholder="Add a caption (optional)" value="' + esc(p.caption) + '" data-cap>' +
        '<div class="photo-btns">' +
        '<button type="button" data-move="-1" aria-label="Move photo ' + (i + 1) + ' earlier"' + (i === 0 ? " disabled" : "") + ">&larr;</button>" +
        '<button type="button" data-move="1" aria-label="Move photo ' + (i + 1) + ' later"' + (i === ph.length - 1 ? " disabled" : "") + ">&rarr;</button>" +
        '<button type="button" data-cover aria-label="Make photo ' + (i + 1) + ' the cover"' + (cover ? " disabled" : "") + ">&#9733;</button>" +
        '<button type="button" class="danger" data-del-photo aria-label="Delete photo ' + (i + 1) + '">&#128465;</button></div></li>';
    }).join("");
  }
  function refreshEvent() { return A.rpc("admin_get_event", { p_id: EV.id }).then(function (e) { EV = e; drawPhotos(); }); }
  grid.addEventListener("change", function (e) {
    var c = e.target.closest("[data-cap]"); if (!c) return;
    var id = c.closest("[data-id]").getAttribute("data-id");
    A.rpc("admin_update_photo", { p_id: id, p_caption: c.value }).then(function () {
      (EV.photos.filter(function (p) { return p.id === id; })[0] || {}).caption = c.value; flash("Caption saved.");
    }).catch(fail);
  });
  grid.addEventListener("click", function (e) {
    var li = e.target.closest("[data-id]"); if (!li) return;
    var id = li.getAttribute("data-id"), b;
    if ((b = e.target.closest("[data-move]"))) {
      A.rpc("admin_move_photo", { p_id: id, p_dir: +b.getAttribute("data-move") }).then(refreshEvent).then(function () {
        var nb = grid.querySelector('[data-id="' + id + '"] [data-move="' + b.getAttribute("data-move") + '"]'); if (nb && !nb.disabled) nb.focus();
      }).catch(fail);
    } else if (e.target.closest("[data-cover]")) {
      A.rpc("admin_set_cover", { p_event: EV.id, p_photo: id }).then(refreshEvent).then(function () { flash("Cover photo set."); }).catch(fail);
    } else if (e.target.closest("[data-del-photo]")) {
      if (!confirm("Delete this photo? This can’t be undone.")) return;
      A.rpc("admin_delete_photo", { p_id: id }).then(function (path) { return A.removeFiles([path]).catch(function () {}); })
        .then(refreshEvent).then(function () { flash("Photo deleted."); }).catch(fail);
    }
  });

  var uploading = false;
  function alertUpload() { status(appStatus, "info", "Photos are still uploading. Please wait until they finish."); }
  window.addEventListener("beforeunload", function (e) { if (uploading) { e.preventDefault(); e.returnValue = ""; } });
  function addFiles(list, asFlyer) {
    var files = Array.prototype.filter.call(list || [], function (f) { return /^image\//.test(f.type) || /\.(heic|heif)$/i.test(f.name); });
    var skipped = (list ? list.length : 0) - files.length;
    if (!EV || !files.length) { if (skipped) status(appStatus, "err", "Only photos can be added here."); return; }
    if (uploading) return alertUpload();
    if (files.length > 50) { status(appStatus, "err", "Please add up to 50 photos at a time."); return; }
    uploading = true; clear(appStatus);
    var q = $("[data-queue]"), bar = $("[data-progress-bar]"), txt = $("[data-progress-text]"), done = [], failed = [], n = 0;
    q.hidden = false; bar.style.width = "0%";
    function tick() { bar.style.width = Math.round(100 * n / files.length) + "%"; txt.textContent = "Uploading " + Math.min(n + 1, files.length) + " of " + files.length + "…"; }
    tick();
    // two at a time: quick on Wi-Fi, still reliable on a weak phone signal
    var i = 0;
    function worker() {
      if (i >= files.length) return Promise.resolve();
      var f = files[i++];
      return A.uploadPhoto(EV.id, f).then(function (path) { done.push(path); }, function (err) { failed.push((f.name || "photo") + ": " + err.message); })
        .then(function () { n++; tick(); return worker(); });
    }
    Promise.all([worker(), worker()]).then(function () {
      return done.length ? A.rpc("admin_add_photos", { p_event: EV.id, p_paths: done }) : null;
    }).then(function () { return refreshEvent(); }).then(function () {
      if (!asFlyer || !done.length) return;
      var fl = EV.photos.filter(function (p) { return p.path === done[0]; })[0];
      if (!fl) return;
      return A.rpc("admin_update_photo", { p_id: fl.id, p_caption: fl.caption || "Event flyer" })
        .then(function () { return A.rpc("admin_set_cover", { p_event: EV.id, p_photo: fl.id }); })
        .then(refreshEvent);
    }).then(function () {
      if (asFlyer && done.length) { txt.textContent = "Flyer added and set as the thumbnail."; flash("Flyer added. It’s now the thumbnail on the Events page." + (EV.published ? "" : " The event is still a draft; tick Published and save to show it.")); return; }
      txt.textContent = done.length + " photo" + (done.length === 1 ? "" : "s") + " added.";
      if (failed.length) status(appStatus, "err", "Some photos didn’t upload:<br>" + failed.map(esc).join("<br>"));
      else flash(done.length + " photo" + (done.length === 1 ? "" : "s") + " added." + (EV.published ? "" : " The event is still a draft; tick Published and save to show it."));
    }).catch(fail).then(function () { uploading = false; bar.style.width = "100%"; setTimeout(function () { q.hidden = true; }, 2500); });
  }
  $("[data-flyer]").addEventListener("change", function (e) { addFiles(Array.prototype.slice.call(e.target.files, 0, 1), true); e.target.value = ""; });
  $("[data-pick]").addEventListener("change", function (e) { addFiles(e.target.files); e.target.value = ""; });
  $("[data-camera]").addEventListener("change", function (e) { addFiles(e.target.files); e.target.value = ""; });
  var drop = $("[data-drop]");
  ["dragenter", "dragover"].forEach(function (t) { drop.addEventListener(t, function (e) { e.preventDefault(); drop.classList.add("over"); }); });
  ["dragleave", "drop"].forEach(function (t) { drop.addEventListener(t, function (e) { e.preventDefault(); drop.classList.remove("over"); }); });
  drop.addEventListener("drop", function (e) { if (e.dataTransfer) addFiles(e.dataTransfer.files); });

  /* ---------------- forms (requests) ---------------- */
  var KIND = { sponsor: "Sponsor", donate: "Donation", volunteer: "Volunteer" }, filter = "";
  function drawRequests() {
    var news = OV.requests.filter(function (r) { return r.status === "new"; }).length, badge = $("[data-new-count]");
    badge.hidden = !news; badge.textContent = news ? news + " new" : "";
    var list = OV.requests.filter(function (r) { return !filter || r.kind === filter; }), ul = $("[data-rq-list]");
    if (!list.length) { ul.innerHTML = '<li class="empty-state"><p>No forms here yet.</p></li>'; return; }
    ul.innerHTML = list.map(function (r) {
      return '<li><button type="button" class="admin-item" data-rq="' + esc(r.id) + '"><span class="kind-tag kind-' + esc(r.kind) + '">' + KIND[r.kind] + "</span>" +
        '<span class="admin-item-main"><strong>' + esc(r.name) + (r.organization ? " · " + esc(r.organization) : "") + "</strong><span>" +
        esc(new Date(r.created_at).toLocaleString()) + " · " + esc(r.ref) + "</span></span>" +
        '<span class="pill pill-' + esc(r.status) + '">' + { new: "New", contacted: "Contacted", closed: "Closed" }[r.status] + "</span></button></li>";
    }).join("");
  }
  $$("[data-kind-filter]").forEach(function (b) {
    b.addEventListener("click", function () {
      filter = b.getAttribute("data-kind-filter");
      $$("[data-kind-filter]").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      drawRequests();
    });
  });
  $("[data-rq-list]").addEventListener("click", function (e) { var b = e.target.closest("[data-rq]"); if (b) openRequest(b.getAttribute("data-rq")); });
  $("[data-rq-back]").addEventListener("click", function () { $("[data-rq-detail-view]").hidden = true; $("[data-rq-list-view]").hidden = false; load(); });
  function openRequest(id) {
    A.rpc("admin_get_request", { p_id: id }).then(function (r) {
      var row = function (k, v) { return v ? "<dt>" + k + "</dt><dd>" + v + "</dd>" : ""; };
      var tel = r.phone ? String(r.phone).replace(/[^\d+]/g, "") : "";
      $("[data-rq-detail]").innerHTML =
        '<p class="kind-tag kind-' + esc(r.kind) + '">' + KIND[r.kind] + "</p><h2 class=\"h3\" tabindex=\"-1\" data-rq-h>" + esc(r.name) + "</h2>" +
        '<dl class="rq-dl">' + row("Reference", esc(r.ref)) + row("Received", esc(new Date(r.created_at).toLocaleString())) +
        row("Organization", esc(r.organization)) + row("Email", '<a href="mailto:' + esc(r.email) + '">' + esc(r.email) + "</a>") +
        row("Phone", r.phone ? '<a href="tel:' + esc(tel) + '">' + esc(r.phone) + "</a>" : "") +
        row(r.kind === "sponsor" ? "Interested in" : r.kind === "donate" ? "Would like to give" : "Wants to help with", esc((r.interests || []).join(", "))) +
        row("Available", esc((r.availability || []).join(", "))) +
        row("18 or older", r.adult === true ? "Yes" : r.adult === false ? "No (needs parent/guardian approval)" : "") +
        row("Message", A.multiline(r.message)) + "</dl>" +
        '<div class="btn-row" style="margin:1rem 0 1.5rem"><a class="btn btn-primary btn-sm" href="mailto:' + esc(r.email) + '?subject=' + encodeURIComponent("REC 517: " + KIND[r.kind] + " (" + r.ref + ")") + '">Email</a>' +
        (tel ? '<a class="btn btn-outline btn-sm" href="tel:' + esc(tel) + '">Call</a><a class="btn btn-outline btn-sm" href="sms:' + esc(tel) + '">Text</a>' : "") + "</div>" +
        '<div class="form-grid"><div class="field"><label for="rq-status">Status</label><select id="rq-status">' +
        ["new", "contacted", "closed"].map(function (s) { return "<option value=\"" + s + "\"" + (r.status === s ? " selected" : "") + ">" + { new: "New", contacted: "Contacted", closed: "Closed" }[s] + "</option>"; }).join("") +
        '</select></div><div class="field"><label for="rq-notes">Private notes</label><textarea id="rq-notes" maxlength="4000" rows="4">' + esc(r.notes) + "</textarea></div>" +
        '<div class="btn-row"><button type="button" class="btn btn-primary btn-sm" data-rq-save>Save</button><button type="button" class="btn btn-outline btn-sm danger" data-rq-del>Delete form</button></div></div>';
      $("[data-rq-list-view]").hidden = true; $("[data-rq-detail-view]").hidden = false; $("[data-rq-h]").focus();
      $("[data-rq-save]").onclick = function () {
        A.rpc("admin_update_request", { p_id: r.id, p_status: $("#rq-status").value, p_notes: $("#rq-notes").value }).then(function () { flash("Saved."); }).catch(fail);
      };
      $("[data-rq-del]").onclick = function () {
        if (!confirm("Delete this form from " + r.name + "? This can’t be undone.")) return;
        A.rpc("admin_delete_request", { p_id: r.id }).then(function () { $("[data-rq-back]").click(); flash("Form deleted."); }).catch(fail);
      };
    }).catch(fail);
  }
  $("[data-export]").addEventListener("click", function () {
    A.rpc("admin_export_requests").then(function (rows) {
      if (!rows.length) return flash("No forms to download yet.");
      var cols = ["ref", "type", "received", "status", "name", "organization", "email", "phone", "interests", "availability", "age_18_plus", "message", "notes"];
      var cell = function (v) { v = v == null ? "" : String(v); if (/^[=+\-@\t\r]/.test(v)) v = "'" + v; return '"' + v.replace(/"/g, '""') + '"'; };
      var csv = [cols.join(",")].concat(rows.map(function (r) { return cols.map(function (c) { return cell(r[c]); }).join(","); })).join("\r\n");
      var a = document.createElement("a"); a.href = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv" }));
      a.download = "rec517-forms-" + new Date().toISOString().slice(0, 10) + ".csv"; document.body.appendChild(a); a.click(); a.remove();
    }).catch(fail);
  });

  start();
})();
