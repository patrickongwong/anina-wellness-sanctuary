<div align="center">

# ANINA Wellness Sanctuary

**A premium integrated longevity · mobility · strength · recovery sanctuary — BF Homes, Parañaque.**

Marketing site + a booking system that writes to Google Sheets. Zero build step, hosts free on GitHub Pages.

</div>

---

## ✦ What this is

A single-page, visually-rich website for ANINA Wellness Sanctuary, built as a
plain static site (HTML + CSS + vanilla JS) so anyone can clone it, open it, and
ship it without a toolchain.

- **Stunning Scandinavian aesthetic** — warm bone canvas, sage & clay accents,
  editorial serif display, generous whitespace, subtle scroll animations.
- **Booking system → Google Sheets** — the form posts to a Google Apps Script
  Web App that appends each request to a Sheet. No backend, no secrets.
- **Sections** — Hero · Philosophy · Programs · The Space (gallery) ·
  Membership · Booking · Contact.

> **Images are placeholders.** They're license-clean photos sourced via
> [Openverse](https://openverse.org) for demonstration and should be swapped for
> ANINA's own photography before launch. See [`CREDITS.md`](./CREDITS.md).

## ✦ Quick start (local preview)

No dependencies. Either:

```bash
# option A — just open it
open index.html

# option B — serve it (recommended; date input & fetch behave better)
python3 -m http.server 8000
# then visit http://localhost:8000
```

The booking form works immediately in **demo mode** (validates + shows success,
writes nowhere). To make it live, wire up Google Sheets ↓.

## ✦ Connect the booking form to Google Sheets

Full step-by-step (≈5 min): **[`apps-script/README-booking.md`](./apps-script/README-booking.md)**

Short version:
1. New Google Sheet → **Extensions → Apps Script** → paste
   [`apps-script/Code.gs`](./apps-script/Code.gs).
2. **Deploy → New deployment → Web app** · *Execute as: Me* · *Access: Anyone*.
3. Copy the `/exec` URL into [`js/config.js`](./js/config.js):
   ```js
   window.ANINA_CONFIG = { BOOKING_ENDPOINT: "https://script.google.com/macros/s/…/exec" };
   ```
4. Commit & push. Bookings now land in the **Bookings** tab.

## ✦ Deploy (GitHub Pages)

This repo ships a workflow at [`.github/workflows/pages.yml`](./.github/workflows/pages.yml).

1. Push to GitHub.
2. **Settings → Pages → Build and deployment → Source: GitHub Actions.**
3. Every push to `main` publishes to `https://<user>.github.io/<repo>/`.

(Or just drag the folder onto Netlify — it's fully static.)

## ✦ Editing content

Everything is plain HTML/CSS — no framework to learn.

| Want to change… | Edit |
|---|---|
| Copy, sections, pricing | `index.html` |
| Colours, fonts, spacing | `css/styles.css` (design tokens in `:root`) |
| Nav / gallery / form behaviour | `js/main.js` |
| Booking endpoint | `js/config.js` |
| Photos | replace files in `assets/images/` (keep the same names) |

Design tokens live at the top of `css/styles.css`:

```css
--bone: #F4F1EA;   --ink:  #221F1A;
--sage: #6E7F63;   --clay: #B47A5E;
```

## ✦ Project structure

```
anina-wellness-sanctuary/
├── index.html                 # the whole page
├── css/styles.css             # design system + all styles
├── js/
│   ├── config.js              # booking endpoint (edit this)
│   └── main.js                # nav, reveals, gallery, form
├── assets/images/             # placeholder photography
├── apps-script/
│   ├── Code.gs                # Google Sheets backend
│   └── README-booking.md      # setup guide
├── .github/workflows/pages.yml
├── CREDITS.md
└── README.md
```

## ✦ For coworkers

Clone it, open `index.html`, and you're looking at the live site. Propose changes
via a branch + PR. The design tokens and section-per-`<section>` structure make
edits low-risk — change copy in `index.html`, tweak colours in `:root`.

---

<div align="center">
<sub>Built for ANINA Wellness Sanctuary · Founder Edrin Panganiban · South Metro Manila</sub>
</div>
