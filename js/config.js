/* =========================================================
   ANINA — site configuration
   ========================================================= */
window.ANINA_CONFIG = {

  /* ---------------------------------------------------------
     BOOKING → Google Sheets
     Paste your deployed Google Apps Script Web App URL below.
     (See apps-script/README-booking.md for the 5-minute setup.)
     Empty = DEMO MODE (validates + shows success, writes nowhere).
     --------------------------------------------------------- */
  BOOKING_ENDPOINT: "",

  /* ---------------------------------------------------------
     INSTAGRAM — live "Follow along" feed
     ---------------------------------------------------------
     A static site can't pull a profile feed by itself (Instagram
     needs an access token that must NOT live in a public repo).
     The standard fix is a free widget service that holds the token
     for you and gives you an embed snippet. See README → "Live
     Instagram feed" for 3-minute setup (LightWidget / Behold / etc).

     Fill ONE of these:
       • EMBED_HTML     — paste the full <iframe>/<script> snippet the
                          widget service gives you (works with any of them)
       • LIGHTWIDGET_ID — just the id from a LightWidget embed
                          (e.g. the "abc123..." in lightwidget.com/widgets/abc123.html)

     Leave both empty to show the on-brand fallback grid that links
     to the profile below.
     --------------------------------------------------------- */
  INSTAGRAM: {
    HANDLE: "anina_wellness_sanctuary",
    PROFILE_URL: "https://www.instagram.com/anina_wellness_sanctuary/",
    EMBED_HTML: "",
    LIGHTWIDGET_ID: "",
  },
};
