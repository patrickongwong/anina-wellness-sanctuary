/* =========================================================
   ANINA × Coach Joycee — postpartum landing interactions
   ========================================================= */
(function () {
  "use strict";

  var yr = document.getElementById("ppYear");
  if (yr) yr.textContent = new Date().getFullYear();

  /* sticky bar solidify */
  var bar = document.getElementById("ppBar");
  function onScroll() {
    if (window.scrollY > 40) bar.classList.add("is-solid");
    else bar.classList.remove("is-solid");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* scroll reveal */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* booking form → same Google Sheet endpoint as the main site */
  var cfg = window.ANINA_CONFIG || {};
  var form = document.getElementById("ppForm");
  var status = document.getElementById("ppStatus");
  var btn = document.getElementById("ppSubmit");

  function setStatus(msg, kind) {
    status.textContent = msg;
    status.classList.remove("is-ok", "is-err");
    if (kind) status.classList.add(kind);
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }

      var data = {
        name: form.name.value.trim(),
        email: form.email.value.trim(),
        phone: form.phone.value.trim(),
        service: "Postpartum core assessment",
        date: "",
        time: "",
        notes:
          "Postpartum: " + form.stage.value +
          " · Prefers: " + form.format.value +
          (form.notes.value.trim() ? " · " + form.notes.value.trim() : ""),
        submittedAt: new Date().toISOString(),
        source: "postpartum-landing",
      };

      btn.disabled = true;
      btn.textContent = "Sending…";
      setStatus("");

      if (!cfg.BOOKING_ENDPOINT) {
        setTimeout(function () {
          setStatus("✓ Demo mode — request captured. Connect Google Sheets to go live (see README).", "is-ok");
          form.reset();
          btn.disabled = false;
          btn.textContent = "Request My Assessment";
        }, 700);
        return;
      }

      fetch(cfg.BOOKING_ENDPOINT, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(data),
      })
        .then(function () {
          setStatus("✓ Thank you, " + data.name.split(" ")[0] +
            "! Your request is in — we'll email you within one business day. 💛", "is-ok");
          form.reset();
        })
        .catch(function () {
          setStatus("Something went wrong. Please email hello@aninasanctuary.ph and we'll help.", "is-err");
        })
        .finally(function () {
          btn.disabled = false;
          btn.textContent = "Request My Assessment";
        });
    });
  }
})();
