export const css = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600&family=Source+Serif+4:opsz,wght@8..60,400;8..60,500&display=swap');

  .lp {
    --base:       #141413;
    --base-deep:  #1f1e1c;
    --panel:      #262624;
    --ink:        #faf9f5;
    --ink-mid:    #cfcdc4;
    --ink-dim:    #9a988f;
    --line:       rgba(250,249,245,.14);
    --line-strong:rgba(250,249,245,.26);
    --accent:     #d94a0b;
    --accent-soft:#fbe9df;
    --signal:     #0b8a5e;
    --r-sm: 8px; --r-md: 12px; --r-lg: 20px; --r-xl: 32px;
    --maxw: 1120px;
    --sect: 112px;
    --gut: 24px;
    --serif: 'Source Serif 4', Georgia, 'Times New Roman', serif;
  }
  .lp *, .lp *::before, .lp *::after { box-sizing: border-box; }
  .lp {
    font-family: 'Instrument Sans', system-ui, -apple-system, sans-serif;
    color: var(--ink);
    background: var(--base);
    overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
    min-height: 100vh;
  }
  .lp p { margin: 0; }
  .lp h1, .lp h2, .lp h3 {
    margin: 0; color: var(--ink);
    font-family: var(--serif);
    font-weight: 400;
    letter-spacing: -.02em;
    line-height: 1.08;
  }
  .lp a:focus-visible, .lp button:focus-visible, .lp summary:focus-visible {
    outline: 2px solid var(--accent); outline-offset: 3px; border-radius: var(--r-sm);
  }
  .lp ::selection { background: rgba(217,74,11,.22); }

  /* ── Buttons ── */
  .lp-btn {
    height: 44px; padding: 0 22px;
    border-radius: var(--r-md);
    font-family: inherit; font-size: 15px; font-weight: 500;
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    cursor: pointer; border: 1px solid transparent;
    transition: background .18s, border-color .18s, transform .18s;
    white-space: nowrap;
  }
  .lp-btn-dark { background: var(--ink); color: var(--base); }
  .lp-btn-dark:hover { background: #e6e4da; transform: translateY(-1px); }
  .lp-btn-light { background: transparent; color: var(--ink); border-color: var(--line-strong); }
  .lp-btn-light:hover { background: rgba(20,20,19,.05); }
  .lp-btn-accent { background: var(--accent); color: #fff; }
  .lp-btn-accent:hover { background: #b23a07; transform: translateY(-1px); }
  .lp-btn-lg { height: 52px; padding: 0 28px; font-size: 16px; }
  .lp-btn-sm { height: 38px; padding: 0 16px; font-size: 14px; }
  .lp-btn-block { width: 100%; }

  /* ── Nav ── */
  .lp-nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    height: 68px; padding: 0 var(--gut);
    display: flex; align-items: center;
    border-bottom: 1px solid transparent;
    transition: background .25s, border-color .25s, backdrop-filter .25s;
  }
  .lp-nav.scrolled {
    background: rgba(20,20,19,.88);
    backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
    border-bottom-color: var(--line);
  }
  .lp-nav-inner {
    max-width: var(--maxw); width: 100%; margin: 0 auto;
    display: flex; align-items: center; justify-content: space-between; gap: 24px;
  }
  .lp-nav-logo { height: 38px; display: block; }
  .lp-nav-links { display: flex; align-items: center; gap: 4px; }
  .lp-nav-link {
    background: none; border: none; font-family: inherit;
    font-size: 15px; font-weight: 500; color: var(--ink-mid);
    padding: 8px 14px; border-radius: var(--r-sm); cursor: pointer;
    transition: background .18s, color .18s;
  }
  .lp-nav-link:hover { background: rgba(20,20,19,.06); color: var(--ink); }
  .lp-nav-ctas { display: flex; align-items: center; gap: 8px; }
  .lp-hamburger {
    display: none; background: none; border: none; cursor: pointer;
    color: var(--ink); padding: 6px; border-radius: var(--r-sm);
  }

  /* ── Drawer ── */
  .lp-drawer-overlay {
    position: fixed; inset: 0; z-index: 150; background: rgba(20,20,19,.4);
  }
  .lp-drawer {
    position: fixed; top: 0; right: 0; bottom: 0; width: 300px; z-index: 160;
    background: var(--base); border-left: 1px solid var(--line);
    padding: 24px; transform: translateX(100%);
    transition: transform .3s cubic-bezier(.4,0,.2,1);
  }
  .lp-drawer.open { transform: translateX(0); }
  .lp-drawer-close {
    position: absolute; top: 18px; right: 18px; background: none; border: none;
    cursor: pointer; color: var(--ink-dim); padding: 6px;
  }
  .lp-drawer-links { margin-top: 52px; display: flex; flex-direction: column; }
  .lp-drawer-links button {
    text-align: left; background: none; border: none; border-bottom: 1px solid var(--line);
    font-family: var(--serif); font-size: 22px; color: var(--ink);
    padding: 16px 0; cursor: pointer;
  }
  .lp-drawer-ctas { margin-top: 28px; display: flex; flex-direction: column; gap: 10px; }

  /* ── Hero ── */
  .lp-hero {
    padding: 176px var(--gut) 72px;
    text-align: center;
  }
  .lp-hero-inner { max-width: 860px; margin: 0 auto; }
  .lp-hero h1 {
    font-size: clamp(2.8rem, 7vw, 5.2rem);
    line-height: 1.02; letter-spacing: -.03em;
    margin-bottom: 24px;
  }
  .lp-hero h1 em { font-style: italic; color: var(--accent); }
  .lp-hero-sub {
    font-size: clamp(1.05rem, 1.6vw, 1.3rem);
    color: var(--ink-mid); line-height: 1.55;
    max-width: 560px; margin: 0 auto 36px;
  }
  .lp-hero-ctas { display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; margin-bottom: 22px; }
  .lp-hero-note { font-size: 13.5px; color: var(--ink-dim); }

  .lp-showcase { padding: 0 var(--gut); }
  .lp-showcase-frame {
    max-width: var(--maxw); margin: 0 auto;
    background: var(--base-deep);
    border-radius: var(--r-xl);
    padding: 56px 32px;
    display: flex; align-items: center; justify-content: center;
    overflow: hidden; min-height: 380px;
  }

  /* ── Sections ── */
  .lp-section { padding: var(--sect) var(--gut); }
  .lp-section-inner { max-width: var(--maxw); margin: 0 auto; }
  .lp-section-head { max-width: 640px; margin: 0 0 56px; }
  .lp-section-head.center { text-align: center; margin-left: auto; margin-right: auto; }
  .lp-section-head h2 { font-size: clamp(2rem, 4vw, 3.2rem); margin-bottom: 16px; }
  .lp-section-head p { font-size: 17px; color: var(--ink-mid); line-height: 1.6; }

  .lp-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
  .lp-card {
    background: var(--base-deep); border-radius: var(--r-lg);
    padding: 36px 32px 40px; min-height: 280px;
    display: flex; flex-direction: column;
    opacity: 0; transform: translateY(14px);
    transition: opacity .55s cubic-bezier(.2,.8,.3,1), transform .55s cubic-bezier(.2,.8,.3,1);
  }
  .lp-card.visible { opacity: 1; transform: none; }
  .lp-card-icon {
    width: 44px; height: 44px; border-radius: var(--r-md);
    background: var(--panel); display: flex; align-items: center; justify-content: center;
    color: var(--accent); margin-bottom: auto;
  }
  .lp-card h3 { font-size: 26px; margin: 48px 0 12px; line-height: 1.15; }
  .lp-card p { font-size: 15.5px; color: var(--ink-mid); line-height: 1.6; }

  /* Industries strip */
  .lp-industries { padding: 0 var(--gut) var(--sect); }
  .lp-industries-inner {
    max-width: var(--maxw); margin: 0 auto;
    border-top: 1px solid var(--line); padding-top: 56px;
    display: flex; align-items: center; justify-content: space-between; gap: 32px; flex-wrap: wrap;
  }
  .lp-industries-text h2 { font-size: clamp(1.7rem, 3vw, 2.4rem); margin-bottom: 10px; }
  .lp-industries-text p { color: var(--ink-mid); font-size: 16px; max-width: 46ch; line-height: 1.6; }
  .lp-pill-row { display: flex; flex-wrap: wrap; gap: 8px; max-width: 460px; }
  .lp-pill {
    padding: 8px 16px; border: 1px solid var(--line-strong); border-radius: 999px;
    font-size: 14px; color: var(--ink-mid); background: transparent;
    font-family: inherit; cursor: pointer; transition: background .18s, color .18s;
  }
  .lp-pill:hover { background: var(--ink); color: var(--base); border-color: var(--ink); }

  /* CTA */
  .lp-cta { padding: 0 var(--gut) var(--sect); }
  .lp-cta-card {
    max-width: var(--maxw); margin: 0 auto;
    background: var(--ink); color: #fff; border-radius: var(--r-xl);
    padding: 88px 32px; text-align: center;
  }
  .lp-cta-card h2 { color: #fff; font-size: clamp(2rem, 4.4vw, 3.4rem); margin-bottom: 16px; }
  .lp-cta-card p { color: rgba(255,255,255,.7); font-size: 17px; margin-bottom: 34px; }
  .lp-cta-btns { display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; }
  .lp-cta-card .lp-btn-light { color: #fff; border-color: rgba(255,255,255,.3); }
  .lp-cta-card .lp-btn-light:hover { background: rgba(255,255,255,.1); }
  .lp-cta-card .lp-btn-dark { background: #fff; color: var(--ink); }
  .lp-cta-card .lp-btn-dark:hover { background: #ece9df; }

  .lp-app {
    max-width: var(--maxw); margin: 40px auto 0;
    display: flex; align-items: center; justify-content: center; gap: 20px; flex-wrap: wrap;
    color: var(--ink-dim); font-size: 15px;
  }
  .lp-app img { height: 48px; width: auto; }

  /* ── Footer ── */
  .lp-footer { border-top: 1px solid var(--line); padding: 64px var(--gut) 32px; }
  .lp-footer-grid {
    max-width: var(--maxw); margin: 0 auto 48px;
    display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 40px;
  }
  .lp-footer-logo { height: 32px; margin-bottom: 16px; }
  .lp-footer-tagline { font-size: 14.5px; color: var(--ink-dim); line-height: 1.6; max-width: 36ch; margin-bottom: 20px; }
  .lp-footer-socials { display: flex; gap: 8px; }
  .lp-footer-social {
    width: 36px; height: 36px; border-radius: var(--r-sm);
    border: 1px solid var(--line); display: flex; align-items: center; justify-content: center;
    transition: background .18s;
  }
  .lp-footer-social:hover { background: rgba(20,20,19,.06); }
  .lp-footer-social img { width: 15px; height: 15px; filter: brightness(0); opacity: .7; }
  .lp-footer-col-title { font-size: 13.5px; font-weight: 600; margin-bottom: 14px; }
  .lp-footer-links { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
  .lp-footer-links button {
    background: none; border: none; padding: 0; font-family: inherit;
    font-size: 14.5px; color: var(--ink-dim); cursor: pointer; text-align: left;
  }
  .lp-footer-links button:hover { color: var(--ink); }
  .lp-footer-bottom {
    max-width: var(--maxw); margin: 0 auto; padding-top: 24px;
    border-top: 1px solid var(--line);
    display: flex; justify-content: space-between; font-size: 13px; color: var(--ink-dim);
  }

  /* ── Modal ── */
  .lp-modal-overlay {
    position: fixed; inset: 0; z-index: 300;
    background: rgba(20,20,19,.5);
    backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center;
    padding: 24px; animation: lp-fade .2s ease both;
  }
  .lp-modal {
    background: var(--base); border-radius: var(--r-xl);
    width: 100%; max-width: 640px; max-height: calc(100vh - 48px);
    overflow-y: auto; position: relative;
    padding: 48px 40px 40px;
    box-shadow: 0 30px 80px rgba(20,20,19,.3);
    animation: lp-pop .28s cubic-bezier(.2,.8,.3,1) both;
  }
  .lp-modal.wide { max-width: 980px; }
  .lp-modal-close {
    position: absolute; top: 18px; right: 18px;
    width: 38px; height: 38px; border-radius: 50%;
    background: rgba(20,20,19,.06); border: none; cursor: pointer; color: var(--ink);
    display: flex; align-items: center; justify-content: center;
    transition: background .18s;
  }
  .lp-modal-close:hover { background: rgba(20,20,19,.12); }
  .lp-modal-head { margin-bottom: 32px; padding-right: 32px; }
  .lp-modal-head h2 { font-size: clamp(1.8rem, 3.4vw, 2.5rem); margin-bottom: 10px; }
  .lp-modal-head p { color: var(--ink-mid); font-size: 16px; line-height: 1.55; }
  .lp-currency-badge {
    display: inline-block; margin-top: 14px; padding: 5px 14px;
    border: 1px solid var(--line); border-radius: 999px; font-size: 13px; color: var(--ink-mid);
  }

  /* Pricing */
  .lp-plans { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
  .lp-plan {
    background: var(--panel); border: 1px solid var(--line);
    border-radius: var(--r-lg); padding: 28px 24px; position: relative;
    display: flex; flex-direction: column;
  }
  .lp-plan.popular { border-color: var(--ink); box-shadow: 0 0 0 1px var(--ink); }
  .lp-plan-badge {
    position: absolute; top: -11px; left: 22px; background: var(--ink); color: #fff;
    font-size: 11.5px; font-weight: 600; padding: 4px 12px; border-radius: 999px;
  }
  .lp-plan-name { font-size: 14px; font-weight: 600; color: var(--ink-dim); margin-bottom: 12px; }
  .lp-plan-price { font-family: var(--serif); font-size: 38px; line-height: 1; letter-spacing: -.02em; min-height: 38px; }
  .lp-plan-period { font-size: 13px; color: var(--ink-dim); margin-top: 6px; }
  .lp-plan-desc { font-size: 14px; color: var(--ink-mid); margin: 16px 0; padding-bottom: 16px; border-bottom: 1px solid var(--line); line-height: 1.5; }
  .lp-plan-features { list-style: none; padding: 0; margin: 0 0 24px; display: flex; flex-direction: column; gap: 10px; flex: 1; }
  .lp-plan-feature { display: flex; gap: 9px; font-size: 14px; color: var(--ink-mid); }
  .lp-plan-feature svg { flex-shrink: 0; margin-top: 3px; color: var(--signal); }
  .lp-price-skeleton {
    display: inline-block; width: 90px; height: 36px; border-radius: var(--r-sm);
    background: linear-gradient(90deg, rgba(20,20,19,.05) 25%, rgba(20,20,19,.1) 50%, rgba(20,20,19,.05) 75%);
    background-size: 200% 100%; animation: lp-shimmer 1.5s infinite;
  }

  /* Customers */
  .lp-quotes { display: flex; flex-direction: column; gap: 14px; }
  .lp-quote { background: var(--panel); border: 1px solid var(--line); border-radius: var(--r-lg); padding: 26px 26px 22px; }
  .lp-quote-text { font-family: var(--serif); font-size: 19px; line-height: 1.45; margin-bottom: 20px; }
  .lp-quote-author { display: flex; align-items: center; gap: 12px; }
  .lp-quote-author img { width: 40px; height: 40px; border-radius: 50%; background: var(--base-deep); }
  .lp-quote-name { font-size: 14.5px; font-weight: 600; }
  .lp-quote-role { font-size: 13px; color: var(--ink-dim); margin-top: 2px; }

  /* FAQ */
  .lp-faq-list { display: flex; flex-direction: column; }
  .lp-faq-item { border-top: 1px solid var(--line); }
  .lp-faq-item:last-child { border-bottom: 1px solid var(--line); }
  .lp-faq-item summary {
    list-style: none; cursor: pointer; padding: 20px 0;
    font-size: 16.5px; font-weight: 500;
    display: flex; justify-content: space-between; align-items: center; gap: 16px;
  }
  .lp-faq-item summary::-webkit-details-marker { display: none; }
  .lp-faq-item summary svg { flex-shrink: 0; color: var(--ink-dim); transition: transform .2s; }
  .lp-faq-item[open] summary svg { transform: rotate(90deg); }
  .lp-faq-a { padding: 0 0 22px; font-size: 15px; line-height: 1.65; color: var(--ink-mid); max-width: 56ch; }

  /* Marketplace */
  .lp-market-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 28px; }
  .lp-market-card {
    background: var(--panel); border: 1px solid var(--line); border-radius: var(--r-lg);
    padding: 22px; cursor: pointer; text-align: left; font-family: inherit; color: inherit;
    transition: border-color .18s, transform .18s;
  }
  .lp-market-card:hover { border-color: var(--ink); transform: translateY(-2px); }
  .lp-market-emoji { font-size: 24px; display: block; margin-bottom: 12px; }
  .lp-market-title { font-weight: 600; font-size: 15.5px; margin-bottom: 6px; }
  .lp-market-desc { font-size: 13.5px; color: var(--ink-mid); line-height: 1.5; margin-bottom: 12px; }
  .lp-market-count { font-size: 12.5px; color: var(--signal); font-weight: 500; }
  .lp-modal-actions { display: flex; gap: 10px; flex-wrap: wrap; }

  /* Numbers */
  .lp-metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 28px; }
  .lp-metric { background: var(--panel); border: 1px solid var(--line); border-radius: var(--r-md); padding: 18px; }
  .lp-metric-label { font-size: 13px; color: var(--ink-dim); margin-bottom: 8px; }
  .lp-metric-value { font-family: var(--serif); font-size: 28px; letter-spacing: -.02em; line-height: 1; }
  .lp-metric-delta { font-size: 12.5px; color: var(--signal); margin-top: 8px; font-weight: 500; }
  .lp-funnel-title { font-weight: 600; font-size: 15px; margin-bottom: 14px; }
  .lp-funnel-row { display: flex; align-items: center; gap: 14px; margin-bottom: 8px; }
  .lp-funnel-label { font-size: 13px; color: var(--ink-dim); width: 100px; text-align: right; flex-shrink: 0; }
  .lp-funnel-bar-wrap { flex: 1; background: var(--base-deep); border-radius: var(--r-sm); height: 28px; overflow: hidden; }
  .lp-funnel-bar { height: 100%; background: var(--ink); display: flex; align-items: center; justify-content: flex-end; padding-right: 10px; color: #fff; font-size: 12px; font-weight: 500; }

  /* Vapi */
  vapi-widget::part(button-text), vapi-widget::part(label) { display: none !important; }

  /* Mobile bottom nav */
  .lp-bottom-nav { display: none; }

  @keyframes lp-up { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: none; } }
  @keyframes lp-fade { from { opacity: 0; } to { opacity: 1; } }
  @keyframes lp-pop { from { opacity: 0; transform: translateY(16px) scale(.98); } to { opacity: 1; transform: none; } }
  @keyframes lp-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
  .lp-hero h1 { animation: lp-up .7s cubic-bezier(.2,.8,.3,1) both .05s; }
  .lp-hero-sub { animation: lp-up .7s cubic-bezier(.2,.8,.3,1) both .12s; }
  .lp-hero-ctas { animation: lp-up .7s cubic-bezier(.2,.8,.3,1) both .18s; }


  /* ── Dark theme + split hero ── */
  .lp-nav-logo, .lp-footer-logo { filter: brightness(0) invert(1); }
  .lp-nav-link:hover { background: rgba(250,249,245,.08); }
  .lp-btn-light:hover { background: rgba(250,249,245,.08); }
  .lp-modal-close { background: rgba(250,249,245,.1); }
  .lp-modal-close:hover { background: rgba(250,249,245,.18); }
  .lp-footer-social:hover { background: rgba(250,249,245,.08); }
  .lp-footer-social img { filter: brightness(0) invert(1); }
  .lp-plan-badge, .lp-funnel-bar { color: var(--base); }
  .lp-cta-card { background: var(--base-deep); color: var(--ink); border: 1px solid var(--line); }
  .lp-cta-card h2 { color: var(--ink); }
  .lp-cta-card p { color: var(--ink-mid); }
  .lp-cta-card .lp-btn-light { color: var(--ink); border-color: var(--line-strong); }
  .lp-cta-card .lp-btn-light:hover { background: rgba(250,249,245,.08); }
  .lp-cta-card .lp-btn-dark { background: var(--ink); color: var(--base); }

  .lp-hero {
    padding: 104px var(--gut) 56px; min-height: 100vh;
    display: flex; align-items: center; text-align: left;
  }
  .lp-hero-grid {
    max-width: 1240px; width: 100%; margin: 0 auto;
    display: grid; grid-template-columns: 1fr 1fr; gap: 56px; align-items: center;
  }
  .lp-hero-left { display: flex; flex-direction: column; align-items: center; text-align: center; }
  .lp-hero h1 { font-size: clamp(2.6rem, 5vw, 4.2rem); margin-bottom: 18px; }
  .lp-hero-sub { margin: 0 auto 32px; max-width: 440px; }
  .lp-signup {
    width: 100%; max-width: 448px;
    border: 1px solid var(--line-strong); border-radius: 32px;
    padding: 28px; display: flex; flex-direction: column; gap: 14px;
    animation: lp-up .7s cubic-bezier(.2,.8,.3,1) both .18s;
  }
  .lp-signup-or { font-size: 12px; color: var(--ink-dim); text-align: center; letter-spacing: .04em; }
  .lp-signup-fine { font-size: 12.5px; color: var(--ink-dim); line-height: 1.5; text-align: center; }
  .lp-hero-app {
    margin-top: 24px;
    display: flex; flex-direction: row; align-items: center; justify-content: center;
    gap: 12px; flex-wrap: nowrap;
  }
  .lp-hero-app img { height: 68px; width: auto; display: block; }
  .lp-hero-right {
    border-radius: var(--r-xl); background: var(--base-deep);
    min-height: 640px; padding: 32px; overflow: hidden;
    display: flex; align-items: center; justify-content: center;
  }


  /* ── Footer curtain ── */
  .lp-content { position: relative; z-index: 1; background: var(--base); }
  .lp-footer { background: var(--base-deep); }
  html.lp-footer-reveal .lp-content {
    margin-bottom: var(--footer-h, 420px);
    box-shadow: 0 30px 60px rgba(0,0,0,.55);
    border-bottom-left-radius: var(--r-xl);
    border-bottom-right-radius: var(--r-xl);
  }
  html.lp-footer-reveal .lp-footer {
    position: fixed; bottom: 0; left: 0; right: 0; z-index: 0;
    border-top: none;
  }
  html.lp-footer-reveal .lp-footer > * { animation: lp-up .6s cubic-bezier(.2,.8,.3,1) both; }

  /* ── Responsive ── */
  @media (max-width: 960px) {
    .lp-cards, .lp-plans, .lp-market-grid { grid-template-columns: 1fr; }
    .lp-metrics { grid-template-columns: 1fr 1fr; }
    .lp-footer-grid { grid-template-columns: 1fr 1fr; }
    .lp-card { min-height: 0; }
    .lp-card h3 { margin-top: 32px; }
  }
  @media (max-width: 768px) {
    .lp { --sect: 72px; --gut: 18px; padding-bottom: 68px; }
    .lp-nav-links, .lp-nav-ctas { display: none; }
    .lp-hamburger { display: block; }
    .lp-hero { padding: 120px var(--gut) 48px; }
    .lp-hero-ctas { flex-direction: column; }
    .lp-hero-ctas .lp-btn { width: 100%; }
    .lp-showcase-frame { padding: 28px 12px; border-radius: var(--r-lg); min-height: 0; }
    .lp-cta-card { padding: 56px 22px; border-radius: var(--r-lg); }
    .lp-modal { padding: 44px 22px 28px; border-radius: var(--r-lg); }
    .lp-modal-overlay { padding: 12px; align-items: flex-end; }
    .lp-footer-bottom { flex-direction: column; gap: 8px; text-align: center; }
    .lp-funnel-label { width: 76px; font-size: 12px; }
    .lp-bottom-nav {
      display: flex; position: fixed; bottom: 0; left: 0; right: 0; z-index: 200;
      background: rgba(250,249,245,.95); backdrop-filter: blur(16px);
      border-top: 1px solid var(--line);
      padding: 8px 0 max(12px, env(safe-area-inset-bottom));
    }
    .lp-bottom-tab {
      flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px;
      font-family: inherit; font-size: 10.5px; font-weight: 500;
      color: var(--ink-dim); background: none; border: none; cursor: pointer; padding: 4px 0;
    }
    .lp-bottom-tab.active { color: var(--accent); }
    .lp-bottom-tab svg { width: 21px; height: 21px; }
  }

  @media (max-width: 960px) {
    .lp-hero { min-height: 0; padding-top: 96px; }
    .lp-hero-grid { grid-template-columns: 1fr; gap: 36px; }
    .lp-hero-right { min-height: 0; padding: 20px 12px; border-radius: var(--r-lg); }
  }
  @media (max-width: 768px) {
    .lp-bottom-nav { background: rgba(20,20,19,.95); }
    .lp-signup { padding: 22px 18px; border-radius: 24px; }
  }
  @media (prefers-reduced-motion: reduce) {
    html.lp-footer-reveal .lp-footer > * { animation: none; }
    .lp *, .lp *::before, .lp *::after {
      animation-duration: .01ms !important; transition-duration: .01ms !important;
    }
    .lp-card { opacity: 1 !important; transform: none !important; }
  }
`;

export default css;
