/* ==========================================================================
   REC 517 | involved.js : Sponsor / Donate / Volunteer forms on involved.html.
   Forms are saved to the REC 517 database and read in the Admin page.
   Nothing is shown as "sent" unless it was actually saved.
   ========================================================================== */
(function () {
  "use strict";
  var A = window.RAPI, C = window.REC517 || {};
  if (!A) return;

  // Donate: online giving button + note, from data.js
  var give = document.querySelector("[data-give]"), url = A.safeHttps(C.donateUrl);
  if (give && url) {
    give.hidden = false;
    give.querySelector("[data-give-link]").href = url;
    give.querySelector("[data-give-label]").textContent = C.donateButton || "Give online";
  }
  var note = document.querySelector("[data-give-note]");
  if (note) { note.textContent = C.donateNote || ""; note.hidden = !C.donateNote; }

  function phoneOk(v) { var d = String(v || "").replace(/\D/g, ""); return !d || /^1?\d{10}$/.test(d); }

  Array.prototype.forEach.call(document.querySelectorAll(".inv-form"), function (form) {
    var kind = form.getAttribute("data-kind"), status = form.querySelector(".form-status"), done = form.nextElementSibling;
    var btn = form.querySelector('button[type="submit"]'), label = btn.innerHTML, busy = false;
    function say(k, html) { status.className = "form-status show " + k; status.innerHTML = html; }

    function checkField(f) {
      var box = f.closest(".field"); if (!box || box.matches("fieldset")) return true;
      var ok = f.type === "checkbox" ? (!f.required || f.checked) : (f.checkValidity() && (!f.required || f.value.trim() !== ""));
      if (ok && f.hasAttribute("data-phone")) ok = phoneOk(f.value);
      box.classList.toggle("invalid", !ok); f.setAttribute("aria-invalid", ok ? "false" : "true");
      return ok;
    }
    function checkGroup(fs) {
      var ok = !fs.hasAttribute("data-required") || !!fs.querySelector("input:checked");
      fs.classList.toggle("invalid", !ok);
      return ok;
    }
    form.addEventListener("change", function (ev) {
      var fs = ev.target.closest("fieldset[data-group]"); if (fs && fs.classList.contains("invalid")) checkGroup(fs);
      if (ev.target.closest(".field.invalid")) checkField(ev.target);
    });

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      if (busy) return;
      var fields = Array.prototype.filter.call(form.querySelectorAll("input, textarea"), function (f) { return f.id && f.name !== "website"; });
      var bad = fields.filter(function (f) { return !checkField(f); });
      var badGroups = Array.prototype.filter.call(form.querySelectorAll("fieldset[data-group]"), function (fs) { return !checkGroup(fs); });
      if (bad.length || badGroups.length) {
        say("error", "Please fix the highlighted fields.");
        (bad[0] || badGroups[0].querySelector("input")).focus();
        return;
      }
      if (!A.ready) {
        say("info", "Thanks! Online forms aren’t connected yet, so this was <strong>not sent</strong>. Please check back soon, or reach out through the <a href=\"./contact.html\">Contact page</a>.");
        status.focus(); return;
      }
      var val = function (n) { var el = form.elements[n]; return el ? String(el.value || "").trim() : ""; };
      var picks = function (n) { return Array.prototype.map.call(form.querySelectorAll('input[name="' + n + '"]:checked'), function (i) { return i.value; }); };
      var adult = form.querySelector('input[name="adult"]:checked');
      var data = {
        kind: kind, name: val("name"), email: val("email"), phone: val("phone"), organization: val("organization"),
        interests: picks("interests"), availability: picks("availability"), adult: adult ? adult.value === "true" : null,
        message: val("message"), consent: form.elements.consent.checked, website: val("website")
      };
      busy = true; btn.disabled = true; btn.textContent = "Sending…"; status.className = "form-status";
      A.submit(data).then(function (ref) {
        done.querySelector("[data-ref]").textContent = ref;
        status.className = "form-status"; form.hidden = true; done.hidden = false; done.focus();
      }).catch(function (err) {
        say("error", A.esc(err.message) + " Your form was <strong>not sent</strong>. Please try again.");
        status.focus();
      }).then(function () { busy = false; btn.disabled = false; btn.innerHTML = label; });
    });

    done.querySelector("[data-again]").addEventListener("click", function () {
      form.reset(); form.hidden = false; done.hidden = true; status.className = "form-status";
      form.querySelector("input").focus();
    });
  });
})();
