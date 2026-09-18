/* ════════════════════════════════════════════════════════════════════════════
   SolidFlo — landing page stylesheet
   ────────────────────────────────────────────────────────────────────────────
   Drop-in replacement for the `css` template string in LandingPage.jsx.

   Usage:
     import { css } from "./landingPageStyles";
     ...
     <style>{css}</style>

   Every class name from the existing JSX is preserved, so no markup changes
   are required. Optional refinements are listed in NOTES.md.

   Direction: "instrument panel". One continuous dark field, hairline borders,
   tabular numerals on data, a single accent plus a signal colour reserved for
   live/positive values. The hero video is the one loud moment; everything
   below it is quiet.
   ══════════════════════════════════════════════════════════════════════════ */

export const css = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

  /* ════════════════════════════════════════════════
     TOKENS
  ════════════════════════════════════════════════ */
  .lp {
    /* Surfaces — blue-black, never neutral grey */
    --base:        #070a12;
    --base-deep:   #04060c;
    --panel:       #0d1220;
    --panel-raise: #151c2e;
    --panel-glass: rgba(255,255,255,.028);

    /* Hairlines */
    --line:        rgba(255,255,255,.08);
    --line-strong: rgba(255,255,255,.14);
    --line-accent: rgba(109,124,255,.32);

    /* Accent + signal */
    --accent:      #6d7cff;
    --accent-hi:   #8b97ff;
    --accent-dim:  rgba(109,124,255,.12);
    --signal:      #2ee6a8;
    --signal-dim:  rgba(46,230,168,.12);
    --warn:        #ffb454;

    /* Ink */
    --ink:         #e9ecf7;
    --ink-mid:     #9aa3bd;
    --ink-dim:     #626c88;
    --ink-faint:   #3e465c;

    /* Radius scale — four steps, used by hierarchy not habit */
    --r-sm:  4px;
    --r-md:  8px;
    --r-lg:  16px;
    --r-xl:  28px;

    /* Rhythm */
    --sect:     112px;
    --sect-sm:  68px;
    --gut:      24px;
    --maxw:     1120px;

    /* Legacy aliases — kept so any inline styles still in the JSX
       (e.g. the eyebrow overrides on the Globe/Testimonials sections)
       resolve to something sane instead of breaking. */
    --navy:       var(--base);
    --navy-mid:   var(--panel);
    --navy-light: var(--panel-raise);
    --red:        var(--accent);
    --red-hover:  var(--accent-hi);
    --red-light:  var(--accent-dim);
    --blue:       #4cc4f5;
    --green:      var(--signal);
    --cream:      var(--base);
    --cream-mid:  var(--panel);
    --cream-dark: var(--line);
    --card-bg:    var(--panel);
    --border:     var(--line);
    --bg:         var(--base);
    --white:      var(--panel);
    --text:       var(--ink);
    --text-mid:   var(--ink-mid);
    --text-muted: var(--ink-dim);
  }

  .lp *, .lp *::before, .lp *::after { box-sizing: border-box; }

  .lp {
    font-family: 'Instrument Sans', system-ui, -apple-system, sans-serif;
    color: var(--ink);
    background: var(--base);
    overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
    position: relative;
  }

  .lp-content {
    position: relative;
    z-index: 1;

    /* The ambient field moves onto the sheet itself. background-attachment:
       fixed keeps the parallax feel while clipping it to the sheet, so it
       can't tint the footer once revealed. */
    background-color: var(--base);
    background-image:
      radial-gradient(ellipse 90% 55% at 12% 0%,   rgba(109,124,255,.13) 0%, transparent 58%),
      radial-gradient(ellipse 70% 50% at 88% 22%,  rgba(46,230,168,.055) 0%, transparent 55%),
      radial-gradient(ellipse 80% 60% at 50% 100%, rgba(109,124,255,.07) 0%, transparent 60%);
    background-attachment: fixed;
    background-repeat: no-repeat;
  }

  
  .lp-content > * { position: relative; z-index: 1; }

  /* The sheet's bottom edge — a hairline so the reveal reads as a seam
     rather than the page simply ending. */
  .lp-content::after {
    content: '';
    position: absolute; left: 0; right: 0; bottom: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--line-strong), transparent);
  }

  /* ── The reveal itself ── */
  html.lp-footer-reveal .lp-content {
    margin-bottom: var(--footer-h, 420px);
    box-shadow: 0 24px 60px rgba(0,0,0,.55);
  }

  html.lp-footer-reveal .lp-footer {
    position: fixed;
    bottom: 0; left: 0; right: 0;
    z-index: 0;
    border-top: none;
  }

  /* Footer content lifts into place as it's uncovered. The sheet is the thing
     moving, so this is a small assist rather than a second animation. */
  html.lp-footer-reveal .lp-footer > * {
    opacity: 0;
    transform: translateY(18px);
    transition: opacity .5s cubic-bezier(.2,.8,.3,1),
                transform .5s cubic-bezier(.2,.8,.3,1);
  }
  html.lp-footer-reveal .lp-footer.revealed > * {
    opacity: 1;
    transform: translateY(0);
  }
  html.lp-footer-reveal .lp-footer.revealed > *:nth-child(2) {
    transition-delay: .08s;
  }
  /* ── Type scale ─────────────────────────────────────────────────────────
     Weight 550–600, tight tracking. No serif display face: this is software,
     not a magazine. ──────────────────────────────────────────────────────── */
  .lp h1, .lp h2, .lp h3 {
    font-family: 'Instrument Sans', system-ui, sans-serif;
    font-weight: 600;
    letter-spacing: -.035em;
    line-height: 1.06;
    color: var(--ink);
    margin: 0;
  }
  .lp p { margin: 0; }

  /* Numerals get a tabular mono face. This is functional, not decorative:
     the page is full of figures that should align and read as instrument
     readouts. Labels stay in the sans. */
  .lp-stat-value,
  .lp-analytics-metric-value,
  .lp-plan-price,
  .lp-funnel-val,
  .lp-analytics-metric-delta,
  .lp-hero-badge-count {
    font-family: 'IBM Plex Mono', ui-monospace, monospace;
    font-variant-numeric: tabular-nums;
    font-feature-settings: 'tnum' 1;
  }

  .lp ::selection { background: rgba(109,124,255,.35); color: #fff; }

  /* Keyboard focus — visible everywhere, never removed */
  .lp a:focus-visible,
  .lp button:focus-visible {
    outline: 2px solid var(--accent-hi);
    outline-offset: 3px;
    border-radius: var(--r-sm);
  }

  /* ── Scrollbar ── */
  .lp ::-webkit-scrollbar { width: 8px; }
  .lp ::-webkit-scrollbar-track { background: var(--base-deep); }
  .lp ::-webkit-scrollbar-thumb {
    background: var(--panel-raise);
    border-radius: 999px;
    border: 2px solid var(--base-deep);
  }
  .lp ::-webkit-scrollbar-thumb:hover { background: var(--ink-faint); }

  /* ── Scroll progress ── */
  .lp-progress {
    position: fixed; top: 0; left: 0; height: 2px; z-index: 200;
    background: linear-gradient(90deg, var(--accent), var(--signal));
    box-shadow: 0 0 12px rgba(109,124,255,.6);
    transition: width .1s linear;
  }

  /* ════════════════════════════════════════════════
     NAV
  ════════════════════════════════════════════════ */
  .lp-nav {
    position: fixed; top: 20px; left: 0; right: 0; z-index: 100;
    height: 62px;
    display: flex; align-items: center;
    padding: 0 32px;
    transition: left .4s cubic-bezier(.4,0,.2,1),
                right .4s cubic-bezier(.4,0,.2,1),
                background .3s, border-color .3s, box-shadow .3s, top .3s;
    border: 1px solid transparent;
    border-radius: var(--r-lg);
  }
  .lp-nav.scrolled {
    top: 14px;
    left: 5vw; right: 5vw;
    max-width: 1180px;
    margin: 0 auto;
    background: rgba(9,13,24,.72);
    backdrop-filter: blur(20px) saturate(1.4);
    -webkit-backdrop-filter: blur(20px) saturate(1.4);
    border-color: var(--line);
    box-shadow:
      0 1px 0 rgba(255,255,255,.05) inset,
      0 18px 48px rgba(0,0,0,.5);
  }
  .lp-nav-inner {
    max-width: var(--maxw); width: 100%; margin: 0 auto;
    display: flex; align-items: center; justify-content: space-between;
    gap: 24px;
  }
  .lp-nav-links { display: flex; align-items: center; gap: 30px; }
  .lp-nav-links a {
    font-size: 14px;
    font-weight: 500;
    letter-spacing: -.01em;
    color: var(--ink-mid);
    text-decoration: none;
    transition: color .18s;
    position: relative;
  }
  .lp-nav-links a::after {
    content: '';
    position: absolute; left: 0; right: 0; bottom: -7px;
    height: 1px; background: var(--accent);
    transform: scaleX(0); transform-origin: left;
    transition: transform .22s cubic-bezier(.4,0,.2,1);
  }
  .lp-nav-links a:hover { color: var(--ink); }
  .lp-nav-links a:hover::after { transform: scaleX(1); }

  .lp-nav-ctas { display: flex; align-items: center; gap: 10px; }

  .lp-btn-ghost {
    height: 38px; padding: 0 18px;
    background: transparent;
    border: 1px solid var(--line-strong);
    color: var(--ink-mid);
    border-radius: var(--r-md);
    font-family: inherit;
    font-size: 14px; font-weight: 500; letter-spacing: -.01em;
    cursor: pointer;
    transition: border-color .18s, color .18s, background .18s;
  }
  .lp-btn-ghost:hover {
    border-color: var(--line-accent);
    color: var(--ink);
    background: var(--panel-glass);
  }

  .lp-btn-primary {
    height: 38px; padding: 0 18px;
    background: var(--accent);
    color: #fff;
    border: none;
    border-radius: var(--r-md);
    font-family: inherit;
    font-size: 14px; font-weight: 600; letter-spacing: -.01em;
    cursor: pointer;
    display: inline-flex; align-items: center; gap: 7px;
    box-shadow: 0 1px 0 rgba(255,255,255,.22) inset, 0 6px 20px rgba(109,124,255,.3);
    transition: background .18s, transform .18s, box-shadow .18s;
  }
  .lp-btn-primary:hover {
    background: var(--accent-hi);
    transform: translateY(-1px);
    box-shadow: 0 1px 0 rgba(255,255,255,.28) inset, 0 10px 28px rgba(109,124,255,.42);
  }
  .lp-btn-primary:active { transform: translateY(0); }

  .lp-hamburger {
    display: none; background: none; border: none;
    cursor: pointer; color: var(--ink); padding: 6px;
    border-radius: var(--r-sm);
  }
  .lp-nav:not(.scrolled) .lp-hamburger,
  .lp-nav.scrolled .lp-hamburger { color: var(--ink); }

  /* ── Mobile drawer ── */
  .lp-drawer-overlay {
    position: fixed; inset: 0; z-index: 150;
    background: rgba(4,6,12,.78);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
  }
  .lp-drawer {
    position: fixed; top: 0; right: 0; bottom: 0; width: 300px;
    background: var(--panel);
    border-left: 1px solid var(--line);
    z-index: 160;
    padding: 24px;
    transform: translateX(100%);
    transition: transform .34s cubic-bezier(.4,0,.2,1);
  }
  .lp-drawer.open { transform: translateX(0); }
  .lp-drawer-close {
    background: none; border: none; cursor: pointer;
    color: var(--ink-dim);
    position: absolute; top: 20px; right: 20px;
    padding: 6px; border-radius: var(--r-sm);
    transition: color .18s;
  }
  .lp-drawer-close:hover { color: var(--ink); }
  .lp-drawer-links { margin-top: 56px; display: flex; flex-direction: column; }
  .lp-drawer-links a {
    font-size: 17px; font-weight: 500; letter-spacing: -.02em;
    color: var(--ink-mid);
    text-decoration: none;
    padding: 16px 0;
    border-bottom: 1px solid var(--line);
    transition: color .18s, padding-left .18s;
  }
  .lp-drawer-links a:hover { color: var(--ink); padding-left: 6px; }
  .lp-drawer-ctas { margin-top: 28px; display: flex; flex-direction: column; gap: 10px; }
  .lp-drawer-ctas .lp-btn-ghost,
  .lp-drawer-ctas .lp-btn-primary {
    width: 100%; justify-content: center; height: 46px; font-size: 15px;
  }

  /* ════════════════════════════════════════════════
     HERO — the one loud moment
  ════════════════════════════════════════════════ */
  .lp-hero {
    background: var(--base);
    min-height: 100vh;
    display: flex; align-items: center;
    padding: 132px 32px 88px;
    position: relative;
    overflow: hidden;
  }
  /* Neutralised: the old rule flipped the hero to green on scroll. */
  .lp-hero.scrolled { background: var(--base); }

  .lp-hero-video {
    position: absolute; inset: 0;
    width: 100%; height: 100%;
    object-fit: cover; object-position: center;
    z-index: 0;
    opacity: .5;
    filter: saturate(.55) contrast(1.06) brightness(.62);
    pointer-events: none;
  }
  /* Scrim — makes headline text legible over the footage and grades the
     video into the page colour instead of ending at a hard edge. */
  .lp-hero-video-overlay {
    position: absolute; inset: 0; z-index: 1;
    pointer-events: none;
    background:
      linear-gradient(to bottom,
        rgba(7,10,18,.86) 0%,
        rgba(7,10,18,.52) 32%,
        rgba(7,10,18,.72) 72%,
        var(--base) 100%),
      radial-gradient(ellipse 70% 60% at 22% 45%, rgba(109,124,255,.18) 0%, transparent 62%);
  }
  .lp-hero > *:not(.lp-hero-video):not(.lp-hero-video-overlay) {
    position: relative; z-index: 2;
  }
  /* The old decorative ::before/::after blooms are redundant now that the
     page has one ambient field. Removed rather than layered. */
  .lp-hero::before, .lp-hero::after { content: none; }

  /* Glass instrument shell */
  .lp-hero-inner {
    max-width: var(--maxw); width: 100%; margin: 0 auto;
    display: grid;
    grid-template-columns: minmax(0,1.04fr) minmax(0,.96fr);
    align-items: center;
    gap: 56px;
    padding: 52px 56px;
    border: 1px solid var(--line-strong);
    border-radius: var(--r-xl);
    background: linear-gradient(160deg, rgba(21,28,46,.62) 0%, rgba(9,13,24,.5) 100%);
    backdrop-filter: blur(22px) saturate(1.3);
    -webkit-backdrop-filter: blur(22px) saturate(1.3);
    box-shadow:
      0 1px 0 rgba(255,255,255,.1) inset,
      0 0 0 1px rgba(0,0,0,.4),
      0 40px 90px rgba(0,0,0,.6);
    position: relative;
  }
  /* Inner bezel line */
  .lp-hero-inner::after {
    content: '';
    position: absolute; inset: 7px;
    border-radius: calc(var(--r-xl) - 7px);
    border: 1px solid rgba(255,255,255,.045);
    pointer-events: none;
  }

  .lp-hero-left { text-align: left; padding-top: 0; }

  /* Live-status chip. The dot pulses because the claim is "live" — motion
     that carries meaning rather than decoration. */
  .lp-hero-badge {
    display: inline-flex; align-items: center; gap: 10px;
    padding: 5px 14px 5px 5px;
    background: rgba(255,255,255,.045);
    border: 1px solid var(--line-strong);
    border-radius: 999px;
    margin-bottom: 26px;
    backdrop-filter: blur(8px);
  }
  .lp-hero-badge-avatars { display: flex; align-items: center; }
  .lp-hero-badge-avatars img {
    width: 26px; height: 26px; border-radius: 50%;
    border: 2px solid var(--panel-raise);
    object-fit: cover; margin-left: -9px;
  }
  .lp-hero-badge-avatars img:first-child { margin-left: 0; }
  .lp-hero-badge-count {
    background: var(--accent-dim);
    border: 1px solid var(--line-accent);
    color: var(--accent-hi);
    font-size: 11px; font-weight: 600; letter-spacing: 0;
    padding: 3px 10px; border-radius: 999px;
    white-space: nowrap;
  }
  .lp-hero-badge-text {
    font-size: 13px; font-weight: 500;
    color: var(--ink-mid);
    text-transform: none; letter-spacing: -.01em;
    padding-right: 4px;
  }

  .lp-hero h1 {
    font-size: clamp(2.6rem, 5.2vw, 4.3rem);
    font-weight: 600;
    letter-spacing: -.045em;
    line-height: 1.02;
    color: var(--ink);
    margin-bottom: 22px;
    text-align: left;
    animation: lp-up .7s cubic-bezier(.2,.8,.3,1) both .05s;
  }
  /* The rotating word changes on a timer, so marking it is functional —
     it signals which token is animating. Kept as a colour shift, not italic. */
  .lp-hero h1 em {
    font-style: normal;
    font-weight: 600;
    color: var(--accent-hi);
    display: inline-block;
    animation: lp-word .5s cubic-bezier(.2,.8,.3,1) both;
  }
  .lp-hero-sub {
    font-size: clamp(1rem, 1.5vw, 1.15rem);
    color: var(--ink-mid);
    max-width: 50ch;
    margin: 0 0 36px;
    line-height: 1.6;
    letter-spacing: -.005em;
    text-align: left;
    animation: lp-up .7s cubic-bezier(.2,.8,.3,1) both .12s;
  }
  .lp-hero-ctas {
    display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
    justify-content: flex-start;
    margin-bottom: 34px;
    animation: lp-up .7s cubic-bezier(.2,.8,.3,1) both .18s;
  }
  .lp-hero-ctas .lp-btn-primary { height: 52px; padding: 0 28px; font-size: 15px; }

  .lp-hero-secondary {
    height: 52px; padding: 0 24px;
    background: rgba(255,255,255,.04);
    border: 1px solid var(--line-strong);
    border-radius: var(--r-md);
    font-family: inherit;
    font-size: 15px; font-weight: 500; letter-spacing: -.01em;
    display: inline-flex; align-items: center; gap: 9px;
    cursor: pointer; color: var(--ink);
    text-transform: none;
    transition: border-color .18s, background .18s, transform .18s;
  }
  .lp-hero-secondary:hover {
    border-color: var(--line-accent);
    background: rgba(255,255,255,.075);
    transform: translateY(-1px);
  }

  .lp-hero-trust {
    display: flex; align-items: center; gap: 22px; flex-wrap: wrap;
    font-size: 13px; color: var(--ink-dim);
    font-weight: 450; letter-spacing: -.005em;
    justify-content: flex-start;
    animation: lp-up .7s cubic-bezier(.2,.8,.3,1) both .24s;
  }
  .lp-hero-trust-item { display: flex; align-items: center; gap: 7px; }
  .lp-hero-trust-item svg { color: var(--signal); flex-shrink: 0; }

  .lp-hero-right {
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    position: relative; min-width: 0; width: 100%;
    animation: lp-up .8s cubic-bezier(.2,.8,.3,1) both .3s;
  }

  /* Retained for the screenshot slider / orb if you bring them back */
  .lp-hero-screen { width: 100%; position: relative; }
  .lp-hero-screen-glow {
    position: absolute; inset: -48px;
    background: radial-gradient(ellipse at 50% 55%, rgba(109,124,255,.3), transparent 68%);
    pointer-events: none;
  }
  .lp-hero-screen-frame {
    border-radius: var(--r-lg);
    overflow: hidden;
    border: 1px solid var(--line-strong);
    background: var(--panel);
    box-shadow: 0 1px 0 rgba(255,255,255,.08) inset, 0 30px 70px rgba(0,0,0,.6);
  }
  .lp-hero-screen-frame img {
    width: 100%; height: auto; display: block;
    animation: lp-fade .45s ease both;
  }
  .lp-hero-orb {
    width: 440px; height: 440px; border-radius: 50%;
    background: radial-gradient(circle at 36% 34%,
      #a5aeff 0%, var(--accent) 28%, #3b46c9 58%, #0b1030 100%);
    position: relative;
    animation: lp-float 7s ease-in-out infinite;
    box-shadow: 0 0 90px rgba(109,124,255,.35), 0 0 200px rgba(109,124,255,.14);
  }
  .lp-hero-orb::after {
    content: '';
    position: absolute; inset: 0; border-radius: 50%;
    background: radial-gradient(circle at 30% 28%, rgba(255,255,255,.28) 0%, transparent 55%);
  }

  /* Floating invoice cards */
  .lp-invoice-float, .lp-invoice-float2 {
    position: absolute;
    background: rgba(13,18,32,.9);
    border: 1px solid var(--line-strong);
    border-radius: var(--r-md);
    z-index: 2; text-align: left;
    backdrop-filter: blur(14px);
    box-shadow: 0 20px 48px rgba(0,0,0,.5);
  }
  .lp-invoice-float  { left: 32px; top: 22%; padding: 18px 20px; width: 308px; animation: lp-up .8s ease both .4s; }
  .lp-invoice-float2 { right: 32px; top: 26%; padding: 16px 18px; width: 220px; animation: lp-up .8s ease both .55s; }
  .lp-invoice-float-tag {
    font-size: 10px; font-weight: 600; letter-spacing: .02em;
    text-transform: none; padding: 3px 9px; border-radius: var(--r-sm);
  }
  @media (max-width: 1200px) {
    .lp-invoice-float, .lp-invoice-float2 { display: none; }
  }

  .lp-slide-dots { display: flex; justify-content: center; gap: 6px; margin-top: 18px; }
  .lp-slide-dot {
    height: 3px; width: 10px; border: none; border-radius: 999px;
    cursor: pointer; background: var(--ink-faint);
    transition: width .32s cubic-bezier(.4,0,.2,1), background .32s;
  }
  .lp-slide-dot.active { width: 30px; background: var(--accent); }

  .lp-cut { display: none; }

  /* ════════════════════════════════════════════════
     SECTION HEADERS
     The eyebrow becomes a small marker with a leading rule rather than a
     tracked-out caps pill — it reads as a system label on an instrument.
  ════════════════════════════════════════════════ */
  .lp-section-head {
    text-align: center;
    margin-bottom: 56px;
    max-width: 660px;
    margin-left: auto; margin-right: auto;
  }
  .lp-section-eyebrow,
  .section-eyebrow {
    display: inline-flex; align-items: center; gap: 9px;
    font-size: 13px; font-weight: 500;
    letter-spacing: -.005em;
    text-transform: none;
    color: var(--accent-hi);
    background: transparent !important;
    border: none !important;
    border-radius: 0;
    padding: 0;
    margin-bottom: 18px;
  }
  .lp-section-eyebrow::before,
  .section-eyebrow::before {
    content: '';
    width: 22px; height: 1px;
    background: linear-gradient(90deg, transparent, var(--accent));
  }
  .lp-section-eyebrow::after,
  .section-eyebrow::after {
    content: '';
    width: 22px; height: 1px;
    background: linear-gradient(90deg, var(--accent), transparent);
  }
  .lp-section-head h2 {
    font-size: clamp(1.95rem, 3.6vw, 2.85rem);
    color: var(--ink);
    line-height: 1.08;
    margin-bottom: 14px;
    letter-spacing: -.04em;
  }
  .lp-section-head p {
    font-size: 16px;
    color: var(--ink-mid);
    max-width: 58ch;
    margin: 0 auto;
    line-height: 1.62;
    letter-spacing: -.005em;
  }

  /* ════════════════════════════════════════════════
     STATS — a readout strip, not four cards
  ════════════════════════════════════════════════ */
  .lp-stats {
    background: transparent;
    padding: 0 var(--gut);
    position: relative;
  }
  .lp-stats-inner {
    max-width: var(--maxw); margin: 0 auto;
    display: grid; grid-template-columns: repeat(4,1fr);
    border: 1px solid var(--line);
    border-radius: var(--r-lg);
    background: rgba(13,18,32,.6);
    backdrop-filter: blur(12px);
    overflow: hidden;
  }
  .lp-stat {
    text-align: left;
    padding: 30px 28px;
    border-right: 1px solid var(--line);
    opacity: 0; transform: translateY(14px);
    transition: opacity .55s cubic-bezier(.2,.8,.3,1), transform .55s cubic-bezier(.2,.8,.3,1);
  }
  .lp-stat.visible { opacity: 1; transform: translateY(0); }
  .lp-stat:last-child { border-right: none; }
  .lp-stat-icon {
    width: 34px; height: 34px; border-radius: var(--r-sm);
    background: var(--accent-dim);
    border: 1px solid var(--line-accent);
    display: flex; align-items: center; justify-content: center;
    margin: 0 0 16px; color: var(--accent-hi);
  }
  .lp-stat-value {
    font-size: 27px; font-weight: 500;
    color: var(--ink); line-height: 1; margin-bottom: 7px;
    letter-spacing: -.03em;
  }
  .lp-stat-label {
    font-size: 13px; font-weight: 450;
    letter-spacing: -.005em; text-transform: none;
    color: var(--ink-dim);
  }

  /* ════════════════════════════════════════════════
     ANALYTICS
  ════════════════════════════════════════════════ */
  .lp-analytics { background: transparent; padding: var(--sect) var(--gut); }
  .lp-analytics-inner { max-width: var(--maxw); margin: 0 auto; }

  .lp-analytics-metrics {
    display: grid; grid-template-columns: repeat(4,1fr);
    gap: 12px; margin-bottom: 28px;
  }
  .lp-analytics-metric {
    background: var(--panel-glass);
    border: 1px solid var(--line);
    border-radius: var(--r-md);
    padding: 20px;
    transition: border-color .2s, background .2s;
  }
  .lp-analytics-metric:hover {
    border-color: var(--line-strong);
    background: rgba(255,255,255,.05);
  }
  .lp-analytics-metric-label {
    font-size: 13px; color: var(--ink-dim);
    font-weight: 450; letter-spacing: -.005em;
    text-transform: none; margin-bottom: 10px;
  }
  .lp-analytics-metric-value {
    font-size: 25px; font-weight: 500;
    color: var(--ink); line-height: 1; letter-spacing: -.03em;
  }
  .lp-analytics-metric-delta {
    font-size: 12px; color: var(--signal);
    margin-top: 9px; font-weight: 500;
  }

  .lp-analytics-charts {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 16px; margin-bottom: 16px;
  }
  .lp-analytics-chart-card {
    background: rgba(13,18,32,.66);
    border: 1px solid var(--line);
    border-radius: var(--r-lg);
    padding: 26px 26px 20px;
    backdrop-filter: blur(10px);
  }
  .lp-analytics-chart-card.full { grid-column: 1 / -1; }
  .lp-analytics-chart-title {
    font-size: 16px; font-weight: 600;
    color: var(--ink); margin-bottom: 5px; letter-spacing: -.02em;
  }
  .lp-analytics-chart-sub {
    font-size: 13px; color: var(--ink-dim);
    margin-bottom: 16px; letter-spacing: -.005em;
  }
  .lp-analytics-legend {
    display: flex; flex-wrap: wrap; gap: 16px;
    margin-bottom: 16px;
    font-size: 12.5px; color: var(--ink-mid);
  }
  .lp-analytics-legend-dot {
    width: 9px; height: 9px; border-radius: 2px;
    display: inline-block; margin-right: 6px; vertical-align: middle;
  }

  .lp-funnel-row { display: flex; align-items: center; gap: 14px; margin-bottom: 9px; }
  .lp-funnel-label {
    font-size: 13px; color: var(--ink-dim);
    width: 104px; text-align: right; flex-shrink: 0;
    letter-spacing: -.005em;
  }
  .lp-funnel-bar-wrap {
    flex: 1;
    background: rgba(255,255,255,.04);
    border: 1px solid var(--line);
    border-radius: var(--r-sm);
    height: 30px; overflow: hidden;
  }
  .lp-funnel-bar {
    height: 100%;
    border-radius: 2px;
    display: flex; align-items: center; justify-content: flex-end;
    padding-right: 11px;
  }
  .lp-funnel-val { font-size: 12px; font-weight: 500; color: #fff; }

  /* ════════════════════════════════════════════════
     FEATURES — a hairline matrix, no drop shadows
  ════════════════════════════════════════════════ */
  .lp-features { background: transparent; padding: var(--sect) var(--gut); }
  .lp-features-grid {
    max-width: var(--maxw); margin: 0 auto;
    display: grid; grid-template-columns: repeat(3,1fr); gap: 1px;
    background: var(--line);
    border: 1px solid var(--line);
    border-radius: var(--r-lg); overflow: hidden;
  }
  .lp-feature-card {
    background: rgba(10,14,25,.92);
    padding: 34px 30px;
    opacity: 0; transform: translateY(14px);
    transition: opacity .5s cubic-bezier(.2,.8,.3,1),
                transform .5s cubic-bezier(.2,.8,.3,1),
                background .22s;
  }
  .lp-feature-card.visible { opacity: 1; transform: translateY(0); }
  .lp-feature-card:hover { background: rgba(21,28,46,.95); }
  .lp-feature-icon {
    width: 40px; height: 40px; border-radius: var(--r-sm);
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 18px;
    border: 1px solid var(--line);
  }
  .lp-feature-card h3 {
    font-size: 16px; font-weight: 600;
    color: var(--ink); margin-bottom: 9px; letter-spacing: -.02em;
  }
  .lp-feature-card p {
    font-size: 14px; color: var(--ink-mid);
    line-height: 1.6; letter-spacing: -.005em;
  }
  .lp-feature-bar {
    height: 2px; width: 26px;
    background: var(--accent);
    margin-bottom: 18px; border-radius: 2px;
    transform: scaleX(0); transform-origin: left;
    transition: transform .4s cubic-bezier(.2,.8,.3,1) .12s, width .28s;
  }
  .lp-feature-card.visible .lp-feature-bar { transform: scaleX(1); }
  .lp-feature-card:hover .lp-feature-bar { width: 52px; }

  /* ════════════════════════════════════════════════
     SERVICES / MARKETPLACE
  ════════════════════════════════════════════════ */
  .lp-services { background: transparent; padding: var(--sect) var(--gut); }
  .lp-services-inner { max-width: var(--maxw); margin: 0 auto; }
  .lp-services-grid {
    display: grid; grid-template-columns: repeat(3,1fr);
    gap: 14px; margin-bottom: 36px;
  }
  .lp-services-card {
    background: rgba(13,18,32,.66);
    border: 1px solid var(--line);
    border-radius: var(--r-lg);
    padding: 28px 26px;
    cursor: pointer;
    position: relative; overflow: hidden;
    backdrop-filter: blur(10px);
    transition: border-color .22s, background .22s, transform .22s;
  }
  .lp-services-card::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, var(--accent), transparent);
    opacity: 0; transition: opacity .22s;
  }
  .lp-services-card:hover::before { opacity: 1; }
  .lp-services-card:hover {
    border-color: var(--line-accent);
    background: rgba(21,28,46,.8);
    transform: translateY(-3px);
  }
  .lp-services-card-emoji {
    font-size: 26px; margin-bottom: 16px; display: block;
    filter: saturate(.85);
  }
  .lp-services-card-title {
    font-size: 17px; font-weight: 600;
    color: var(--ink); margin-bottom: 7px; letter-spacing: -.02em;
  }
  .lp-services-card-desc {
    font-size: 13.5px; color: var(--ink-mid);
    line-height: 1.6; margin-bottom: 18px; letter-spacing: -.005em;
  }
  .lp-services-card-count {
    display: inline-flex; align-items: center; gap: 7px;
    font-size: 12px; font-weight: 500;
    color: var(--signal);
    background: var(--signal-dim);
    border: 1px solid rgba(46,230,168,.22);
    padding: 4px 11px; border-radius: 999px;
  }
  .lp-services-card-count-dot {
    width: 5px; height: 5px; border-radius: 50%;
    background: var(--signal);
    box-shadow: 0 0 7px var(--signal);
    animation: lp-pulse 2.4s ease-in-out infinite;
  }

  .lp-services-cta-row {
    display: flex; align-items: center; justify-content: space-between;
    flex-wrap: wrap; gap: 20px;
    background: linear-gradient(135deg, rgba(109,124,255,.13) 0%, rgba(13,18,32,.75) 60%);
    border: 1px solid var(--line-accent);
    border-radius: var(--r-lg);
    padding: 34px 38px;
  }
  .lp-services-cta-left h3 {
    font-size: 23px; color: var(--ink);
    margin-bottom: 8px; letter-spacing: -.03em;
  }
  .lp-services-cta-left p {
    font-size: 14px; color: var(--ink-mid);
    line-height: 1.6; max-width: 46ch; letter-spacing: -.005em;
  }
  .lp-services-cta-btns { display: flex; gap: 10px; flex-wrap: wrap; flex-shrink: 0; }
  .lp-services-btn-primary {
    height: 46px; padding: 0 24px;
    background: var(--accent); color: #fff;
    border: none; border-radius: var(--r-md);
    font-family: inherit;
    font-size: 14px; font-weight: 600; letter-spacing: -.01em;
    text-transform: none;
    display: inline-flex; align-items: center; gap: 8px;
    cursor: pointer;
    box-shadow: 0 1px 0 rgba(255,255,255,.2) inset, 0 6px 20px rgba(109,124,255,.3);
    transition: background .18s, transform .18s, box-shadow .18s;
  }
  .lp-services-btn-primary:hover {
    background: var(--accent-hi); transform: translateY(-1px);
    box-shadow: 0 1px 0 rgba(255,255,255,.26) inset, 0 10px 28px rgba(109,124,255,.42);
  }
  .lp-services-btn-ghost {
    height: 46px; padding: 0 22px;
    background: rgba(255,255,255,.05);
    border: 1px solid var(--line-strong);
    color: var(--ink); border-radius: var(--r-md);
    font-family: inherit;
    font-size: 14px; font-weight: 500; letter-spacing: -.01em;
    text-transform: none; cursor: pointer;
    transition: background .18s, border-color .18s;
  }
  .lp-services-btn-ghost:hover {
    background: rgba(255,255,255,.09);
    border-color: var(--line-accent);
  }

  /* ════════════════════════════════════════════════
     GLOBE
  ════════════════════════════════════════════════ */
  .lp-globe {
    background: transparent;
    padding: var(--sect) var(--gut);
    text-align: center;
    position: relative; overflow: hidden;
  }
  .lp-globe::before { content: none; }
  .lp-globe h2 {
    color: var(--ink);
    font-size: clamp(1.95rem, 3.6vw, 2.85rem);
    margin-bottom: 14px; letter-spacing: -.04em;
  }
  .lp-globe h2 em { font-style: normal; color: var(--accent-hi); }
  .lp-globe p {
    color: var(--ink-mid); font-size: 16px;
    max-width: 52ch; margin: 0 auto; line-height: 1.62;
  }
  .lp-globe img { max-width: 760px; width: 100%; }

  /* ════════════════════════════════════════════════
     PRICING
  ════════════════════════════════════════════════ */
  .lp-pricing {
    background: transparent;
    padding: var(--sect) var(--gut);
    position: relative; overflow: hidden;
  }
  .lp-pricing-grid {
    max-width: 1040px; margin: 0 auto;
    display: grid; grid-template-columns: repeat(3,1fr);
    gap: 14px; align-items: start;
  }
  .lp-plan {
    background: rgba(13,18,32,.66);
    border: 1px solid var(--line);
    border-radius: var(--r-lg);
    padding: 34px 28px;
    position: relative;
    backdrop-filter: blur(10px);
    opacity: 0; transform: translateY(14px);
    transition: opacity .5s cubic-bezier(.2,.8,.3,1),
                transform .5s cubic-bezier(.2,.8,.3,1),
                border-color .22s;
  }
  .lp-plan.visible { opacity: 1; transform: translateY(0); }
  .lp-plan:hover { border-color: var(--line-strong); }
  .lp-plan.popular {
    background: linear-gradient(170deg, rgba(109,124,255,.16) 0%, rgba(13,18,32,.85) 55%);
    border-color: var(--line-accent);
    box-shadow: 0 0 0 1px rgba(109,124,255,.1), 0 26px 64px rgba(0,0,0,.5);
  }
  .lp-plan.popular.visible { transform: translateY(-8px); }
  .lp-plan-badge {
    position: absolute; top: -11px; left: 28px;
    background: var(--accent); color: #fff;
    font-size: 11px; font-weight: 600; letter-spacing: -.005em;
    text-transform: none;
    padding: 4px 12px; border-radius: 999px;
    white-space: nowrap;
    box-shadow: 0 4px 14px rgba(109,124,255,.45);
  }
  .lp-plan-name {
    font-size: 14px; font-weight: 500;
    letter-spacing: -.01em; text-transform: none;
    color: var(--ink-dim); margin-bottom: 14px;
  }
  .lp-plan.popular .lp-plan-name { color: var(--accent-hi); }
  .lp-plan-price {
    font-size: 40px; font-weight: 500;
    color: var(--ink); line-height: 1;
    margin-bottom: 6px; letter-spacing: -.04em;
  }
  .lp-plan.popular .lp-plan-price { color: #fff; }
  .lp-plan-period { font-size: 13px; color: var(--ink-dim); margin-bottom: 4px; }
  .lp-plan.popular .lp-plan-period { color: var(--ink-mid); }
  .lp-plan-usd { font-size: 12px; color: var(--ink-faint); margin-bottom: 22px; }
  .lp-plan.popular .lp-plan-usd { color: var(--ink-dim); }
  .lp-plan-desc {
    font-size: 14px; color: var(--ink-mid);
    margin-bottom: 24px; line-height: 1.55;
    border-bottom: 1px solid var(--line);
    padding-bottom: 22px; letter-spacing: -.005em;
  }
  .lp-plan.popular .lp-plan-desc { border-color: var(--line-accent); }
  .lp-plan-features {
    list-style: none; padding: 0; margin: 0 0 28px;
    display: flex; flex-direction: column; gap: 11px;
  }
  .lp-plan-feature {
    display: flex; align-items: flex-start; gap: 9px;
    font-size: 14px; color: var(--ink-mid); letter-spacing: -.005em;
  }
  .lp-plan.popular .lp-plan-feature { color: var(--ink); }
  .lp-plan-feature svg { flex-shrink: 0; margin-top: 2px; }
  .lp-plan-cta {
    width: 100%; height: 44px;
    border-radius: var(--r-md); cursor: pointer;
    font-family: inherit;
    font-size: 14px; font-weight: 600; letter-spacing: -.01em;
    text-transform: none; border: none;
    transition: background .18s, border-color .18s, transform .18s;
  }
  .lp-plan-cta-default {
    background: rgba(255,255,255,.05);
    color: var(--ink);
    border: 1px solid var(--line-strong);
  }
  .lp-plan-cta-default:hover {
    border-color: var(--line-accent);
    background: rgba(255,255,255,.09);
  }
  .lp-plan-cta-popular {
    background: var(--accent); color: #fff;
    box-shadow: 0 1px 0 rgba(255,255,255,.22) inset, 0 6px 20px rgba(109,124,255,.34);
  }
  .lp-plan-cta-popular:hover { background: var(--accent-hi); transform: translateY(-1px); }

  .lp-price-skeleton {
    display: inline-block; width: 110px; height: 40px;
    background: linear-gradient(90deg, rgba(255,255,255,.05) 25%, rgba(255,255,255,.11) 50%, rgba(255,255,255,.05) 75%);
    background-size: 200% 100%;
    animation: lp-shimmer 1.5s infinite;
    border-radius: var(--r-sm);
  }
  .lp-currency-badge {
    display: inline-flex; align-items: center; gap: 7px;
    margin-top: 18px; padding: 6px 15px;
    background: var(--panel-glass);
    border: 1px solid var(--line);
    border-radius: 999px;
    font-size: 13px; color: var(--ink-mid); font-weight: 450;
  }
  .lp-currency-badge strong { color: var(--ink); font-weight: 600; }

  /* ════════════════════════════════════════════════
     TESTIMONIALS
  ════════════════════════════════════════════════ */
  .lp-testimonials {
    background: transparent;
    padding: var(--sect) var(--gut);
    position: relative; overflow: hidden;
  }
  .lp-testimonials::before { content: none; }
  .lp-testimonials h2 {
    color: var(--ink); text-align: center;
    font-size: clamp(1.95rem, 3.6vw, 2.85rem);
    margin-bottom: 14px; letter-spacing: -.04em;
  }
  /* Overrides the inline rgba(253,246,236,.5) left in the JSX */
  .lp-testimonials .lp-section-head p { color: var(--ink-mid) !important; }
  .lp-testimonials-grid {
    max-width: var(--maxw); margin: 0 auto;
    display: grid; grid-template-columns: repeat(3,1fr); gap: 14px;
  }
  .lp-testimonial {
    background: rgba(13,18,32,.66);
    border: 1px solid var(--line);
    border-left: 1px solid var(--line);
    border-radius: var(--r-lg);
    padding: 30px 28px;
    backdrop-filter: blur(10px);
    opacity: 0; transform: translateY(14px);
    transition: opacity .5s cubic-bezier(.2,.8,.3,1),
                transform .5s cubic-bezier(.2,.8,.3,1),
                border-color .22s;
  }
  .lp-testimonial.visible { opacity: 1; transform: translateY(0); }
  .lp-testimonial:hover { border-color: var(--line-strong); }
  .lp-testimonial-stars { display: flex; gap: 3px; margin-bottom: 18px; color: var(--warn); }
  .lp-testimonial-text {
    font-size: 14.5px; color: var(--ink);
    line-height: 1.68; margin-bottom: 22px;
    font-style: normal; letter-spacing: -.005em;
  }
  .lp-testimonial-author { display: flex; align-items: center; gap: 11px; }
  .lp-testimonial-avatar {
    width: 38px; height: 38px; border-radius: 50%;
    border: 1px solid var(--line-strong);
    background: var(--panel-raise);
  }
  .lp-testimonial-name { font-size: 14px; font-weight: 600; color: var(--ink); letter-spacing: -.01em; }
  .lp-testimonial-role { font-size: 12.5px; color: var(--ink-dim); margin-top: 2px; }

  /* ════════════════════════════════════════════════
     FAQ
  ════════════════════════════════════════════════ */
  .lp-faq { background: transparent; padding: var(--sect) var(--gut); }
  .lp-faq-list {
    max-width: 760px; margin: 0 auto;
    display: flex; flex-direction: column; gap: 8px;
  }
  .lp-faq-item {
    background: rgba(13,18,32,.6);
    border: 1px solid var(--line);
    border-radius: var(--r-md);
    padding: 22px 26px;
    opacity: 0; transform: translateY(10px);
    transition: opacity .45s cubic-bezier(.2,.8,.3,1),
                transform .45s cubic-bezier(.2,.8,.3,1),
                border-color .2s, background .2s;
  }
  .lp-faq-item.visible { opacity: 1; transform: translateY(0); }
  .lp-faq-item:hover { border-color: var(--line-strong); background: rgba(21,28,46,.7); }
  .lp-faq-q {
    font-size: 15px; font-weight: 600; color: var(--ink);
    display: flex; align-items: flex-start; gap: 11px;
    margin-bottom: 10px; letter-spacing: -.02em;
  }
  .lp-faq-q svg { color: var(--accent); flex-shrink: 0; margin-top: 3px; }
  .lp-faq-a {
    font-size: 14px; color: var(--ink-mid);
    line-height: 1.68; padding-left: 26px; letter-spacing: -.005em;
  }

  /* ════════════════════════════════════════════════
     CTA
  ════════════════════════════════════════════════ */
  .lp-cta {
    background: transparent;
    padding: var(--sect) var(--gut);
    text-align: center;
    position: relative; overflow: hidden;
  }
  .lp-cta::before {
    content: '';
    position: absolute; inset: 0;
    background: radial-gradient(ellipse 60% 70% at 50% 50%, rgba(109,124,255,.14) 0%, transparent 62%);
    pointer-events: none;
  }
  .lp-cta > * { position: relative; z-index: 1; }
  .lp-cta h2 {
    color: var(--ink);
    font-size: clamp(2rem, 4vw, 3rem);
    margin-bottom: 16px; letter-spacing: -.04em;
  }
  .lp-cta p {
    color: var(--ink-mid); font-size: 16px;
    max-width: 52ch; margin: 0 auto 36px; line-height: 1.62;
  }
  .lp-cta-btns {
    display: flex; align-items: center; justify-content: center;
    gap: 12px; flex-wrap: wrap; margin-bottom: 22px;
  }
  .lp-cta-primary {
    height: 52px; padding: 0 30px;
    background: var(--accent); color: #fff;
    border: none; border-radius: var(--r-md); cursor: pointer;
    font-family: inherit; font-size: 15px; font-weight: 600;
    letter-spacing: -.01em; text-transform: none;
    display: inline-flex; align-items: center; gap: 9px;
    box-shadow: 0 1px 0 rgba(255,255,255,.22) inset, 0 8px 26px rgba(109,124,255,.36);
    transition: background .18s, transform .18s, box-shadow .18s;
  }
  .lp-cta-primary:hover {
    background: var(--accent-hi); transform: translateY(-2px);
    box-shadow: 0 1px 0 rgba(255,255,255,.28) inset, 0 14px 36px rgba(109,124,255,.48);
  }
  .lp-cta-secondary {
    height: 52px; padding: 0 26px;
    background: rgba(255,255,255,.04); color: var(--ink);
    border: 1px solid var(--line-strong);
    border-radius: var(--r-md); cursor: pointer;
    font-family: inherit; font-size: 15px; font-weight: 500;
    letter-spacing: -.01em; text-transform: none;
    transition: border-color .18s, background .18s, transform .18s;
  }
  .lp-cta-secondary:hover {
    border-color: var(--line-accent);
    background: rgba(255,255,255,.08);
    transform: translateY(-1px);
  }
  .lp-cta-footnote { font-size: 13px; color: var(--ink-dim); letter-spacing: -.005em; }

  /* ════════════════════════════════════════════════
     APP DOWNLOAD
  ════════════════════════════════════════════════ */
  .kraal-section {
    display: block;
    padding: var(--sect-sm) 0;
    background: transparent;
  }
  .section-inner { max-width: var(--maxw); margin: 0 auto; padding: 0 var(--gut); }
  .hero-app {
    display: flex; flex-direction: column;
    align-items: flex-start; gap: 18px;
    margin: 0 auto;
    padding: 34px 36px;
    background: rgba(13,18,32,.6);
    border: 1px solid var(--line);
    border-radius: var(--r-lg);
    backdrop-filter: blur(10px);
    max-width: 520px;
  }
  .hero-app h1 {
    font-size: 20px; font-weight: 600;
    letter-spacing: -.03em; color: var(--ink);
    margin: 0;
  }
  .hero-app h1.section-eyebrow::before,
  .hero-app h1.section-eyebrow::after { content: none; }
  .hero-app img { max-width: 168px; height: auto; }

  /* ════════════════════════════════════════════════
     FOOTER
  ════════════════════════════════════════════════ */
  .lp-footer {
    background: var(--base-deep);
    border-top: 1px solid var(--line);
    padding: 72px var(--gut) 32px;
  }
  .lp-footer-grid {
    max-width: var(--maxw); margin: 0 auto 52px;
    display: grid; grid-template-columns: 2.2fr 1fr 1fr 1fr; gap: 44px;
  }
  .lp-footer-logo { height: 34px; margin-bottom: 18px; }
  .lp-footer-tagline {
    font-size: 14px; color: var(--ink-mid);
    line-height: 1.65; margin-bottom: 22px; max-width: 42ch;
    letter-spacing: -.005em;
  }
  .lp-footer-socials { display: flex; gap: 8px; }
  .lp-footer-social {
    width: 36px; height: 36px; border-radius: var(--r-md);
    background: var(--panel-glass);
    border: 1px solid var(--line);
    display: flex; align-items: center; justify-content: center;
    transition: background .18s, border-color .18s; cursor: pointer;
  }
  .lp-footer-social:hover { background: var(--accent-dim); border-color: var(--line-accent); }
  .lp-footer-social img { width: 15px; height: 15px; filter: brightness(0) invert(1); opacity: .8; }
  .lp-footer-col-title {
    font-size: 13px; font-weight: 600;
    letter-spacing: -.01em; text-transform: none;
    color: var(--ink); margin-bottom: 16px;
  }
  .lp-footer-links { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 11px; }
  .lp-footer-links a, .lp-footer-links span {
    font-size: 14px; color: var(--ink-dim);
    text-decoration: none; cursor: pointer;
    transition: color .18s; letter-spacing: -.005em;
  }
  .lp-footer-links a:hover, .lp-footer-links span:hover { color: var(--ink); }
  .lp-footer-bottom {
    max-width: var(--maxw); margin: 0 auto;
    padding-top: 26px; border-top: 1px solid var(--line);
    display: flex; align-items: center; justify-content: space-between;
    font-size: 13px; color: var(--ink-faint);
  }

  /* ════════════════════════════════════════════════
     VAPI WIDGET
  ════════════════════════════════════════════════ */
  vapi-widget::part(button-text),
  vapi-widget::part(label),
  vapi-widget [part="button-text"],
  vapi-widget [part="label"] { display: none !important; }

  vapi-widget::part(button) {
    width: 54px !important; min-width: 54px !important;
    height: 54px !important;
    padding: 0 !important;
    border-radius: 50% !important;
    justify-content: center !important;
    box-shadow: 0 8px 28px rgba(109,124,255,.4) !important;
  }

  /* ════════════════════════════════════════════════
     MOBILE BOTTOM NAV
  ════════════════════════════════════════════════ */
  .lp-bottom-nav { display: none; }
  @media (max-width: 768px) {
    .lp-bottom-nav {
      display: flex;
      position: fixed; bottom: 0; left: 0; right: 0; z-index: 200;
      background: rgba(7,10,18,.86);
      backdrop-filter: blur(20px) saturate(1.4);
      -webkit-backdrop-filter: blur(20px) saturate(1.4);
      border-top: 1px solid var(--line);
      padding: 8px 0 max(12px, env(safe-area-inset-bottom));
    }
    .lp-bottom-tab {
      flex: 1; display: flex; flex-direction: column;
      align-items: center; gap: 4px;
      font-size: 10.5px; font-weight: 500;
      color: var(--ink-faint); cursor: pointer;
      background: none; border: none;
      font-family: inherit; letter-spacing: -.005em;
      transition: color .18s; padding: 4px 0;
    }
    .lp-bottom-tab.active { color: var(--accent-hi); }
    .lp-bottom-tab svg { width: 21px; height: 21px; }
    .lp { padding-bottom: 68px; }
  }

  /* ════════════════════════════════════════════════
     ANIMATIONS
  ════════════════════════════════════════════════ */
  @keyframes lp-up {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes lp-word {
    from { opacity: 0; transform: translateY(-8px); filter: blur(3px); }
    to   { opacity: 1; transform: translateY(0);    filter: blur(0); }
  }
  @keyframes lp-fade {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes lp-shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
  @keyframes lp-float {
    0%,100% { transform: translateY(0); }
    50%     { transform: translateY(-14px); }
  }
  @keyframes lp-pulse {
    0%,100% { opacity: 1;  box-shadow: 0 0 7px var(--signal); }
    50%     { opacity: .45; box-shadow: 0 0 2px var(--signal); }
  }
  .lp-float { animation: lp-float 6s ease-in-out infinite; }

  /* ════════════════════════════════════════════════
     RESPONSIVE
  ════════════════════════════════════════════════ */
  @media (max-width: 1100px) {
    .lp-hero-inner {
      grid-template-columns: 1fr;
      gap: 40px;
      padding: 40px 28px;
      border-radius: var(--r-lg);
    }
    .lp-hero-inner::after { inset: 6px; border-radius: 10px; }
    .lp-hero-left { text-align: center; }
    .lp-hero-left h1, .lp-hero-sub {
      text-align: center; margin-left: auto; margin-right: auto;
    }
    .lp-hero-ctas, .lp-hero-trust { justify-content: center; }
    .lp-hero-badge { margin-left: auto; margin-right: auto; }
  }

  @media (max-width: 1024px) {
    .lp-pricing-grid { grid-template-columns: 1fr 1fr; }
    .lp-footer-grid  { grid-template-columns: 1.4fr 1fr 1fr; }
    .lp-services-grid { grid-template-columns: repeat(2,1fr); }
    .lp-plan.popular.visible { transform: translateY(0); }
  }

  @media (max-width: 900px) {
    .lp-analytics-metrics { grid-template-columns: repeat(2,1fr); }
    .lp-analytics-charts  { grid-template-columns: 1fr; }
    .lp-analytics-chart-card.full { grid-column: auto; }
    .lp-stats-inner { grid-template-columns: repeat(2,1fr); }
    .lp-stat:nth-child(2n) { border-right: none; }
    .lp-stat:nth-child(-n+2) { border-bottom: 1px solid var(--line); }
  }

  @media (max-width: 768px) {
    .lp { --sect: 72px; --sect-sm: 48px; --gut: 18px; }
html.lp-footer-reveal .lp-content { margin-bottom: 0; box-shadow: none; }
    html.lp-footer-reveal .lp-footer  { position: static; }
    html.lp-footer-reveal .lp-footer > * { opacity: 1; transform: none; }
    .lp-nav {
      top: 0; height: 58px; padding: 0 16px;
      border-radius: 0;
      background: rgba(7,10,18,.9) !important;
      backdrop-filter: blur(18px);
      -webkit-backdrop-filter: blur(18px);
      border-bottom: 1px solid var(--line);
    }
    .lp-nav.scrolled, .lp-nav:not(.scrolled) {
      left: 0; right: 0; top: 0;
      max-width: none; border-radius: 0;
      box-shadow: none;
    }
    .lp-nav-links, .lp-nav-ctas { display: none; }
    .lp-hamburger { display: block; }

    .lp-hero { padding: 96px 18px 56px; min-height: auto; }
    .lp-hero h1 { font-size: 2.15rem; }
    .lp-hero-sub { font-size: .98rem; margin-bottom: 28px; }
    .lp-hero-ctas { flex-direction: column; gap: 10px; width: 100%; }
    .lp-hero-ctas .lp-btn-primary,
    .lp-hero-secondary { width: 100%; height: 50px; justify-content: center; }
    .lp-hero-trust { flex-direction: column; align-items: center; gap: 10px; }
    .lp-hero-inner { gap: 30px; padding: 30px 20px; }
    .lp-hero-right { display: block !important; }

    .lp-features-grid { grid-template-columns: 1fr 1fr; }
    .lp-pricing-grid { grid-template-columns: 1fr; max-width: 420px; }
    .lp-testimonials-grid { grid-template-columns: 1fr; }
    .lp-footer-grid { grid-template-columns: 1fr 1fr; gap: 32px; }
    .lp-footer-bottom { flex-direction: column; gap: 10px; text-align: center; }
    .lp-services-cta-row { padding: 28px 22px; flex-direction: column; align-items: flex-start; }
    .lp-funnel-label { width: 76px; font-size: 12px; }
  }

  @media (max-width: 560px) {
    .lp-features-grid { grid-template-columns: 1fr; }
    .lp-services-grid { grid-template-columns: 1fr; }
    .lp-analytics-metrics { grid-template-columns: 1fr 1fr; }
    .lp-footer-grid { grid-template-columns: 1fr; }
    .hero-app { padding: 26px 22px; }
  }

  /* ── Reduced motion ─────────────────────────────────────────────────────
     Entrances resolve to their end state; nothing loops. ───────────────── */
  @media (prefers-reduced-motion: reduce) {
    .lp *,
    .lp *::before,
    .lp *::after {
      animation-duration: .01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: .01ms !important;
      scroll-behavior: auto !important;
    }
      html.lp-footer-reveal .lp-footer > * { opacity: 1 !important; transform: none !important; }
    .lp-stat, .lp-feature-card, .lp-plan, .lp-testimonial, .lp-faq-item {
      opacity: 1 !important; transform: none !important;
    }
    .lp-feature-card .lp-feature-bar { transform: scaleX(1) !important; }
    .lp-hero-video { display: none; }
  }
`;

export default css;