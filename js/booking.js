/* =========================================================
   ANINA — weekly booking calendar (Google-Calendar style)
   Drag to select one or more time blocks, navigate weeks,
   submit to the same Google Sheet endpoint as the rest of
   the site. No dependencies.
   ========================================================= */
(function () {
  "use strict";

  var head = document.getElementById("calHead");
  var body = document.getElementById("calBody");
  if (!head || !body) return; // calendar not on this page

  var cfg = window.ANINA_CONFIG || {};
  var FIRST = 6, LAST = 21, ROW = 48;      // time axis 6am..9pm, 48px/hour
  var MAX_WEEKS = 8;                         // how far ahead you can book
  // opening hours per weekday (0=Sun .. 6=Sat): [openHour, closeHour]
  var OPEN = { 0: [7, 13], 1: [6, 21], 2: [6, 21], 3: [6, 21], 4: [6, 21], 5: [6, 21], 6: [6, 21] };

  var DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  var now = new Date();
  var baseMonday = mondayOf(now);
  var weekOffset = 0;
  var selections = [];          // {dateISO, dow, start, end}
  var drag = null;

  /* ---------- date helpers ---------- */
  function pad(n) { return n < 10 ? "0" + n : "" + n; }
  function isoDate(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function addDays(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }
  function mondayOf(d) { var x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); var wd = (x.getDay() + 6) % 7; return addDays(x, -wd); }
  function hourLabel(h) { var ap = h < 12 ? "AM" : "PM"; var hh = h % 12; if (hh === 0) hh = 12; return hh + " " + ap; }
  function hourFull(h) { var ap = h < 12 ? "AM" : "PM"; var hh = h % 12; if (hh === 0) hh = 12; return hh + ":00 " + ap; }

  /* ---------- render ---------- */
  function weekMonday() { return addDays(baseMonday, weekOffset * 7); }

  function render() {
    var mon = weekMonday();
    var days = [];
    for (var i = 0; i < 7; i++) days.push(addDays(mon, i));

    // toolbar range label
    var sun = days[6];
    var range = MON[mon.getMonth()] + " " + mon.getDate() + " – " +
      (mon.getMonth() === sun.getMonth() ? "" : MON[sun.getMonth()] + " ") + sun.getDate() + ", " + sun.getFullYear();
    document.getElementById("calRange").textContent = range;
    document.getElementById("calPrev").disabled = weekOffset <= 0;
    document.getElementById("calNext").disabled = weekOffset >= MAX_WEEKS;

    var todayISO = isoDate(now);

    // header
    var h = '<div class="cal__corner"></div>';
    days.forEach(function (d) {
      var today = isoDate(d) === todayISO ? " is-today" : "";
      h += '<div class="cal__dayhead' + today + '"><div class="dow">' + DOW[d.getDay()] +
        '</div><div class="dnum">' + d.getDate() + '</div></div>';
    });
    head.innerHTML = h;

    // body: gutter + 7 columns
    var b = '<div class="cal__gutter">';
    for (var hr = FIRST; hr < LAST; hr++) b += '<div class="cal__hourlabel">' + hourLabel(hr) + '</div>';
    b += '</div>';

    days.forEach(function (d) {
      var iso = isoDate(d);
      var isToday = iso === todayISO;
      var open = OPEN[d.getDay()];
      b += '<div class="cal__col' + (isToday ? ' is-today' : '') + '" data-date="' + iso + '" data-dow="' + d.getDay() + '">';
      for (var hr = FIRST; hr < LAST; hr++) {
        var slot = new Date(d.getFullYear(), d.getMonth(), d.getDate(), hr);
        var withinHours = hr >= open[0] && hr < open[1];
        var future = slot.getTime() > now.getTime();
        var isOpen = withinHours && future;
        b += '<div class="cal__cell ' + (isOpen ? "is-open" : "is-disabled") +
          '" data-date="' + iso + '" data-dow="' + d.getDay() + '" data-hour="' + hr + '"></div>';
      }
      b += '</div>';
    });
    body.innerHTML = b;

    // paint selection blocks + now-line into their columns
    var cols = body.querySelectorAll(".cal__col");
    cols.forEach(function (col) {
      var iso = col.getAttribute("data-date");
      selections.filter(function (s) { return s.dateISO === iso; }).forEach(function (s) {
        col.appendChild(blockEl(s));
      });
      if (iso === todayISO) {
        var frac = now.getHours() + now.getMinutes() / 60;
        if (frac >= FIRST && frac <= LAST) {
          var nl = document.createElement("div");
          nl.className = "cal__now";
          nl.style.top = ((frac - FIRST) * ROW) + "px";
          nl.style.left = "0"; nl.style.right = "0";
          col.appendChild(nl);
        }
      }
    });

    renderChips();
  }

  function blockEl(s) {
    var el = document.createElement("div");
    el.className = "cal__block";
    el.style.top = ((s.start - FIRST) * ROW + 1) + "px";
    el.style.height = ((s.end - s.start) * ROW - 3) + "px";
    el.innerHTML = '<span class="rm">&times;</span>' + hourFull(s.start) + "<br>" + hourFull(s.end);
    el.dataset.date = s.dateISO; el.dataset.start = s.start; el.dataset.end = s.end;
    return el;
  }

  /* ---------- selection model ---------- */
  function mergeAdd(dateISO, dow, s, e) {
    var same = selections.filter(function (x) { return x.dateISO === dateISO; });
    var others = selections.filter(function (x) { return x.dateISO !== dateISO; });
    same.push({ dateISO: dateISO, dow: dow, start: s, end: e });
    same.sort(function (a, b) { return a.start - b.start; });
    var merged = [];
    same.forEach(function (it) {
      var last = merged[merged.length - 1];
      if (last && it.start <= last.end) last.end = Math.max(last.end, it.end);
      else merged.push({ dateISO: it.dateISO, dow: it.dow, start: it.start, end: it.end });
    });
    selections = others.concat(merged);
  }
  function removeBlock(dateISO, start, end) {
    selections = selections.filter(function (x) {
      return !(x.dateISO === dateISO && x.start === +start && x.end === +end);
    });
  }

  /* ---------- drag interaction ---------- */
  function cellFrom(x, y) {
    var el = document.elementFromPoint(x, y);
    return el && el.closest ? el.closest(".cal__cell.is-open") : null;
  }
  function drawProvisional() {
    removeProvisional();
    if (!drag) return;
    var s = Math.min(drag.startHour, drag.curHour), e = Math.max(drag.startHour, drag.curHour) + 1;
    var el = document.createElement("div");
    el.className = "cal__block is-prov"; el.id = "calProv";
    el.style.top = ((s - FIRST) * ROW + 1) + "px";
    el.style.height = ((e - s) * ROW - 3) + "px";
    el.innerHTML = hourFull(s) + "<br>" + hourFull(e);
    drag.col.appendChild(el);
  }
  function removeProvisional() { var p = document.getElementById("calProv"); if (p) p.remove(); }

  function onDown(e) {
    var blk = e.target.closest ? e.target.closest(".cal__block") : null;
    if (blk && !blk.classList.contains("is-prov")) {
      removeBlock(blk.dataset.date, blk.dataset.start, blk.dataset.end);
      render();
      return;
    }
    var cell = e.target.closest ? e.target.closest(".cal__cell.is-open") : null;
    if (!cell) return;
    e.preventDefault();
    drag = {
      dateISO: cell.dataset.date, dow: +cell.dataset.dow,
      col: cell.closest(".cal__col"),
      startHour: +cell.dataset.hour, curHour: +cell.dataset.hour,
    };
    drawProvisional();
    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
  }
  function onMove(e) {
    if (!drag) return;
    var cell = cellFrom(e.clientX, e.clientY);
    if (cell && cell.dataset.date === drag.dateISO) {
      drag.curHour = +cell.dataset.hour;
      drawProvisional();
    }
  }
  function onUp() {
    if (drag) {
      var s = Math.min(drag.startHour, drag.curHour), e = Math.max(drag.startHour, drag.curHour) + 1;
      mergeAdd(drag.dateISO, drag.dow, s, e);
      removeProvisional();
      drag = null;
      render();
    }
    document.removeEventListener("pointermove", onMove);
    document.removeEventListener("pointerup", onUp);
  }
  body.addEventListener("pointerdown", onDown);

  /* ---------- chips + summary ---------- */
  function sortedSel() {
    return selections.slice().sort(function (a, b) {
      return a.dateISO === b.dateISO ? a.start - b.start : (a.dateISO < b.dateISO ? -1 : 1);
    });
  }
  function labelFor(s) {
    var d = new Date(s.dateISO + "T00:00:00");
    return DOW[d.getDay()] + ", " + MON[d.getMonth()] + " " + d.getDate() +
      " · " + hourFull(s.start) + " – " + hourFull(s.end);
  }
  function renderChips() {
    var ul = document.getElementById("calChips");
    var items = sortedSel();
    if (!items.length) { ul.innerHTML = '<li class="chips__empty">Nothing selected yet — drag on the calendar above.</li>'; return; }
    ul.innerHTML = items.map(function (s) {
      return '<li class="chip"><span>' + labelFor(s) + '</span>' +
        '<button type="button" aria-label="Remove" data-date="' + s.dateISO + '" data-start="' + s.start + '" data-end="' + s.end + '">&times;</button></li>';
    }).join("");
    ul.querySelectorAll("button").forEach(function (btn) {
      btn.addEventListener("click", function () {
        removeBlock(btn.dataset.date, btn.dataset.start, btn.dataset.end); render();
      });
    });
  }

  /* ---------- navigation ---------- */
  document.getElementById("calPrev").addEventListener("click", function () { if (weekOffset > 0) { weekOffset--; render(); } });
  document.getElementById("calNext").addEventListener("click", function () { if (weekOffset < MAX_WEEKS) { weekOffset++; render(); } });
  document.getElementById("calToday").addEventListener("click", function () { weekOffset = 0; render(); });

  /* ---------- submit ---------- */
  var form = document.getElementById("bookingForm");
  var statusEl = document.getElementById("formStatus");
  var submitBtn = document.getElementById("submitBtn");
  function setStatus(msg, kind) { statusEl.textContent = msg; statusEl.classList.remove("is-ok", "is-err"); if (kind) statusEl.classList.add(kind); }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!selections.length) { setStatus("Please pick at least one time on the calendar above.", "is-err"); return; }
      if (!form.checkValidity()) { form.reportValidity(); return; }

      var slots = sortedSel().map(function (s) {
        return { date: s.dateISO, day: DOW[new Date(s.dateISO + "T00:00:00").getDay()], start: hourFull(s.start), end: hourFull(s.end), label: labelFor(s) };
      });
      var data = {
        name: form.name.value.trim(), email: form.email.value.trim(), phone: form.phone.value.trim(),
        service: form.service.value || "", notes: form.notes.value.trim(),
        slots: slots, slotsText: slots.map(function (s) { return s.label; }).join("; "),
        submittedAt: new Date().toISOString(), source: "website-calendar",
      };

      submitBtn.disabled = true; submitBtn.textContent = "Sending…"; setStatus("");

      function done(ok) {
        submitBtn.disabled = false; submitBtn.textContent = "Request Booking";
        if (ok) { selections = []; form.reset(); render();
          setStatus("✓ Thank you, " + data.name.split(" ")[0] + "! We've got your " + slots.length + " time" + (slots.length > 1 ? "s" : "") + " — we'll confirm by email within one business day.", "is-ok");
        } else {
          setStatus("Something went wrong. Please email hello@aninasanctuary.ph and we'll help.", "is-err");
        }
      }

      if (!cfg.BOOKING_ENDPOINT) {
        setTimeout(function () {
          submitBtn.disabled = false; submitBtn.textContent = "Request Booking";
          selections = []; form.reset(); render();
          setStatus("✓ Demo mode — " + slots.length + " time" + (slots.length > 1 ? "s" : "") + " captured. Connect Google Sheets to go live (see README).", "is-ok");
        }, 700);
        return;
      }
      fetch(cfg.BOOKING_ENDPOINT, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(data) })
        .then(function () { done(true); }).catch(function () { done(false); });
    });
  }

  render();
})();
