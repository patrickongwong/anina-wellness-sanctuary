/* =========================================================
   ANINA Wellness Sanctuary — interactions
   ========================================================= */
(function () {
  "use strict";

  /* ---------- year ---------- */
  var yr = document.getElementById("year");
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- nav: solidify on scroll ---------- */
  var nav = document.getElementById("nav");
  function onScroll() {
    if (window.scrollY > 40) nav.classList.add("is-solid");
    else nav.classList.remove("is-solid");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- mobile menu ---------- */
  var toggle = document.getElementById("navToggle");
  var links = document.querySelector(".nav__links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("is-open");
      toggle.classList.toggle("is-active", open);
      toggle.setAttribute("aria-expanded", String(open));
    });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        links.classList.remove("is-open");
        toggle.classList.remove("is-active");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- scroll reveal ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- gallery lightbox ---------- */
  var lb = document.getElementById("lightbox");
  var lbImg = document.getElementById("lightboxImg");
  var lbClose = document.getElementById("lightboxClose");
  function openLb(src, alt) {
    lbImg.src = src; lbImg.alt = alt || "";
    lb.classList.add("is-open"); lb.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function closeLb() {
    lb.classList.remove("is-open"); lb.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    setTimeout(function () { lbImg.src = ""; }, 400);
  }
  document.querySelectorAll(".gallery__item").forEach(function (btn) {
    btn.addEventListener("click", function () {
      openLb(btn.getAttribute("data-full"), btn.querySelector("img").alt);
    });
  });
  if (lbClose) lbClose.addEventListener("click", closeLb);
  if (lb) lb.addEventListener("click", function (e) { if (e.target === lb) closeLb(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeLb(); });

  /* ---------- min date = today ---------- */
  var dateInput = document.getElementById("date");
  if (dateInput) {
    var t = new Date();
    var iso = t.getFullYear() + "-" +
      String(t.getMonth() + 1).padStart(2, "0") + "-" +
      String(t.getDate()).padStart(2, "0");
    dateInput.min = iso;
  }

  /* ---------- booking form ---------- */
  var form = document.getElementById("bookingForm");
  var status = document.getElementById("formStatus");
  var submitBtn = document.getElementById("submitBtn");
  var cfg = window.ANINA_CONFIG || {};

  function setStatus(msg, kind) {
    status.textContent = msg;
    status.classList.remove("is-ok", "is-err");
    if (kind) status.classList.add(kind);
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      var data = {
        name: form.name.value.trim(),
        email: form.email.value.trim(),
        phone: form.phone.value.trim(),
        service: form.service.value,
        date: form.date.value,
        time: form.time.value,
        notes: form.notes.value.trim(),
        submittedAt: new Date().toISOString(),
        source: "website",
      };

      submitBtn.disabled = true;
      submitBtn.textContent = "Sending…";
      setStatus("");

      // DEMO MODE — no endpoint configured yet
      if (!cfg.BOOKING_ENDPOINT) {
        setTimeout(function () {
          setStatus(
            "✓ Demo mode — request captured locally. Wire up Google Sheets to go live (see README).",
            "is-ok"
          );
          form.reset();
          if (dateInput) dateInput.value = "";
          submitBtn.disabled = false;
          submitBtn.textContent = "Request Booking";
        }, 700);
        return;
      }

      // LIVE — post to Google Apps Script Web App.
      // Apps Script Web Apps don't return CORS headers for browser fetch,
      // so we send as text/plain (a "simple" request) and don't read the body.
      fetch(cfg.BOOKING_ENDPOINT, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(data),
      })
        .then(function () {
          setStatus(
            "✓ Thank you, " + data.name.split(" ")[0] +
            "! Your request is in — we'll confirm by email within one business day.",
            "is-ok"
          );
          form.reset();
          if (dateInput) dateInput.value = "";
        })
        .catch(function () {
          setStatus(
            "Something went wrong sending your request. Please email hello@aninasanctuary.ph and we'll sort it out.",
            "is-err"
          );
        })
        .finally(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = "Request Booking";
        });
    });
  }
})();
