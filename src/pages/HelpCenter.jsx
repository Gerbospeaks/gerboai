import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import {
  Search,
  Rocket,
  CreditCard,
  ShieldCheck,
  Wrench,
  Plug,
  LifeBuoy,
  ChevronDown,
  ArrowRight,
  Mail,
  MessageCircle,
  ArrowLeft,
} from "lucide-react";
import logo from "../assets/img/solidflo.png";

/* ─── Content ────────────────────────────────────────────────────────────
   Swap in real article links once you have them (each `href` below is a
   placeholder path under /help-center/). Nothing here talks to an API —
   it's a static index with client-side search over titles + keywords. */

const CATEGORIES = [
  {
    id: "getting-started",
    icon: Rocket,
    title: "Getting started",
    desc: "Set up your account, pick your industry, and invite your team.",
    count: 8,
  },
  {
    id: "billing",
    icon: CreditCard,
    title: "Billing & plans",
    desc: "Upgrade, downgrade, payment methods, invoices for your subscription.",
    count: 6,
  },
  {
    id: "account-security",
    icon: ShieldCheck,
    title: "Account & security",
    desc: "Passwords, two-factor login, sub-accounts, and data privacy.",
    count: 7,
  },
  {
    id: "dashboards",
    icon: Wrench,
    title: "Industries & dashboards",
    desc: "How templates, quotes, and workflows differ across all 26 trades.",
    count: 12,
  },
  {
    id: "integrations",
    icon: Plug,
    title: "Integrations & API",
    desc: "Connect payment providers, calendars, and pull data through the API.",
    count: 5,
  },
  {
    id: "troubleshooting",
    icon: LifeBuoy,
    title: "Troubleshooting",
    desc: "Fix login issues, missing invoices, sync errors, and slow loading.",
    count: 9,
  },
];

const ARTICLES = [
  { title: "Create your first invoice", category: "Getting started", keywords: "invoice create new quote", time: "3 min" },
  { title: "Switch your business to a different industry dashboard", category: "Getting started", keywords: "industry switch dashboard change", time: "4 min" },
  { title: "Add a sub-account for a technician or staff member", category: "Account & security", keywords: "sub-account team staff invite", time: "3 min" },
  { title: "Understand Starter, Professional, and Enterprise plans", category: "Billing & plans", keywords: "plan price upgrade downgrade", time: "4 min" },
  { title: "Update your card or billing details", category: "Billing & plans", keywords: "card payment method billing", time: "2 min" },
  { title: "Reset a forgotten password", category: "Account & security", keywords: "password reset forgot login", time: "2 min" },
  { title: "Why can't I log in on my industry subdomain?", category: "Troubleshooting", keywords: "login subdomain error stuck", time: "3 min" },
  { title: "Set up recurring billing for a client", category: "Billing & plans", keywords: "recurring billing subscription client", time: "4 min" },
  { title: "Add your practice's stamp and signature", category: "Industries & dashboards", keywords: "stamp signature mechanic invoice", time: "3 min" },
  { title: "Share a parent or staff portal link", category: "Industries & dashboards", keywords: "education parent staff portal link", time: "3 min" },
  { title: "Connect a payment provider", category: "Integrations & API", keywords: "payment integration provider connect", time: "5 min" },
  { title: "Cancel or pause your subscription", category: "Billing & plans", keywords: "cancel pause subscription downgrade", time: "2 min" },
];

const FAQS = [
  {
    q: "Which URL should I use to log in?",
    a: "Log in from your industry's subdomain — for example mechanics.solidflo.co.za — not the main solidflo.co.za site, which doesn't host accounts. If you're not sure which subdomain you signed up on, use the recovery link on the main login page.",
  },
  {
    q: "Can I change my industry after signing up?",
    a: "Yes. Each account is tied to one industry dashboard at a time. Contact support to move an existing account, since this changes which templates and fields are shown.",
  },
  {
    q: "Do sub-accounts count toward my client limit?",
    a: "No. The client limit on the Starter plan counts your own clients, not team members. Add as many staff sub-accounts as your plan allows under Team settings.",
  },
  {
    q: "How do I cancel?",
    a: "Go to Account settings → Billing → Cancel plan. Your account moves to the free Starter tier at the end of the current billing period; nothing is deleted.",
  },
  {
    q: "Is my data backed up?",
    a: "Yes, continuously, with point-in-time recovery. Export a copy any time from Account settings → Export data.",
  },
];

const css = `
  .hc {
    --base: #070a12; --base-deep: #04060c; --panel: #0d1220; --panel-raise: #151c2e;
    --line: rgba(255,255,255,.08); --line-strong: rgba(255,255,255,.14); --line-accent: rgba(109,124,255,.32);
    --accent: #6d7cff; --accent-hi: #8b97ff; --accent-dim: rgba(109,124,255,.12);
    --signal: #2ee6a8; --signal-dim: rgba(46,230,168,.12);
    --ink: #e9ecf7; --ink-mid: #9aa3bd; --ink-dim: #626c88; --ink-faint: #3e465c;
    --r-sm: 4px; --r-md: 8px; --r-lg: 16px; --maxw: 900px;

    font-family: 'Instrument Sans', system-ui, -apple-system, sans-serif;
    background: var(--base); color: var(--ink);
    min-height: 100vh; position: relative; overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
  }
  .hc *, .hc *::before, .hc *::after { box-sizing: border-box; }
  .hc::before {
    content: ''; position: fixed; inset: 0; z-index: 0; pointer-events: none;
    background: radial-gradient(ellipse 90% 55% at 50% 0%, rgba(109,124,255,.13) 0%, transparent 58%);
  }
  .hc > * { position: relative; z-index: 1; }
  .hc a:focus-visible, .hc button:focus-visible, .hc input:focus-visible {
    outline: 2px solid var(--accent-hi); outline-offset: 3px; border-radius: var(--r-sm);
  }

  .hc-nav {
    display: flex; align-items: center; justify-content: space-between;
    padding: 22px 32px; border-bottom: 1px solid var(--line);
    max-width: 1180px; margin: 0 auto;
  }
  .hc-nav-back {
    display: inline-flex; align-items: center; gap: 7px;
    font-size: 14px; font-weight: 500; color: var(--ink-mid);
    background: none; border: none; cursor: pointer; padding: 6px 0;
    transition: color .18s;
  }
  .hc-nav-back:hover { color: var(--ink); }
  .hc-nav-logo { height: 30px; }

  .hc-hero {
    max-width: 720px; margin: 0 auto; text-align: center;
    padding: 72px 24px 40px;
  }
  .hc-hero h1 {
    font-size: clamp(1.9rem, 4vw, 2.6rem); font-weight: 600;
    letter-spacing: -.035em; line-height: 1.1; margin: 0 0 14px;
  }
  .hc-hero p { font-size: 16px; color: var(--ink-mid); line-height: 1.6; margin: 0 auto 32px; max-width: 46ch; }

  .hc-search {
    position: relative; max-width: 560px; margin: 0 auto;
  }
  .hc-search svg {
    position: absolute; left: 18px; top: 50%; transform: translateY(-50%);
    color: var(--ink-dim); pointer-events: none;
  }
  .hc-search input {
    width: 100%; height: 52px; padding: 0 18px 0 50px;
    background: var(--panel); border: 1px solid var(--line-strong);
    border-radius: var(--r-md); color: var(--ink);
    font-family: inherit; font-size: 15px;
    transition: border-color .18s, box-shadow .18s;
  }
  .hc-search input::placeholder { color: var(--ink-dim); }
  .hc-search input:focus {
    outline: none; border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-dim);
  }

  .hc-section { max-width: var(--maxw); margin: 0 auto; padding: 36px 24px; }
  .hc-section-title {
    font-size: 13px; font-weight: 600; letter-spacing: -.005em;
    color: var(--ink-dim); margin: 0 0 18px;
  }

  .hc-cats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
  .hc-cat {
    background: rgba(13,18,32,.66); border: 1px solid var(--line);
    border-radius: var(--r-lg); padding: 22px; text-align: left;
    cursor: pointer; font-family: inherit;
    transition: border-color .2s, background .2s, transform .2s;
  }
  .hc-cat:hover { border-color: var(--line-accent); background: rgba(21,28,46,.8); transform: translateY(-2px); }
  .hc-cat-icon {
    width: 34px; height: 34px; border-radius: var(--r-sm);
    background: var(--accent-dim); border: 1px solid var(--line-accent);
    display: flex; align-items: center; justify-content: center;
    color: var(--accent-hi); margin-bottom: 14px;
  }
  .hc-cat h3 { font-size: 15px; font-weight: 600; color: var(--ink); margin: 0 0 6px; letter-spacing: -.02em; }
  .hc-cat p { font-size: 13px; color: var(--ink-mid); line-height: 1.55; margin: 0 0 12px; }
  .hc-cat-count { font-size: 12px; color: var(--ink-dim); }

  .hc-articles { display: flex; flex-direction: column; gap: 1px; background: var(--line); border: 1px solid var(--line); border-radius: var(--r-lg); overflow: hidden; }
  .hc-article {
    display: flex; align-items: center; justify-content: space-between; gap: 16px;
    background: rgba(10,14,25,.92); padding: 18px 22px;
    cursor: pointer; font-family: inherit; text-align: left; border: none; width: 100%;
    transition: background .18s;
  }
  .hc-article:hover { background: rgba(21,28,46,.95); }
  .hc-article-main { display: flex; flex-direction: column; gap: 4px; }
  .hc-article-title { font-size: 14.5px; font-weight: 500; color: var(--ink); letter-spacing: -.01em; }
  .hc-article-meta { font-size: 12.5px; color: var(--ink-dim); }
  .hc-article svg { color: var(--ink-faint); flex-shrink: 0; transition: transform .18s, color .18s; }
  .hc-article:hover svg { color: var(--accent-hi); transform: translateX(2px); }

  .hc-empty { text-align: center; padding: 40px 20px; color: var(--ink-dim); font-size: 14px; }

  .hc-faq { display: flex; flex-direction: column; gap: 8px; }
  .hc-faq-item { background: rgba(13,18,32,.6); border: 1px solid var(--line); border-radius: var(--r-md); overflow: hidden; }
  .hc-faq-q {
    width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 12px;
    padding: 18px 22px; background: none; border: none; cursor: pointer;
    font-family: inherit; font-size: 14.5px; font-weight: 600; color: var(--ink); text-align: left;
  }
  .hc-faq-q svg { color: var(--ink-dim); flex-shrink: 0; transition: transform .22s; }
  .hc-faq-item.open .hc-faq-q svg { transform: rotate(180deg); color: var(--accent-hi); }
  .hc-faq-a {
    max-height: 0; overflow: hidden; transition: max-height .28s cubic-bezier(.2,.8,.3,1);
  }
  .hc-faq-item.open .hc-faq-a { max-height: 240px; }
  .hc-faq-a-inner { padding: 0 22px 20px; font-size: 14px; color: var(--ink-mid); line-height: 1.65; }

  .hc-cta {
    max-width: var(--maxw); margin: 24px auto 80px; padding: 0 24px;
  }
  .hc-cta-box {
    display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-wrap: wrap;
    background: linear-gradient(135deg, rgba(109,124,255,.13) 0%, rgba(13,18,32,.75) 60%);
    border: 1px solid var(--line-accent); border-radius: var(--r-lg);
    padding: 30px 32px;
  }
  .hc-cta-box h3 { font-size: 19px; font-weight: 600; color: var(--ink); margin: 0 0 6px; letter-spacing: -.02em; }
  .hc-cta-box p { font-size: 13.5px; color: var(--ink-mid); margin: 0; max-width: 40ch; }
  .hc-cta-btns { display: flex; gap: 10px; flex-shrink: 0; }
  .hc-cta-btn {
    height: 44px; padding: 0 20px; border-radius: var(--r-md);
    font-family: inherit; font-size: 14px; font-weight: 600; letter-spacing: -.01em;
    display: inline-flex; align-items: center; gap: 8px; cursor: pointer; border: none;
    transition: background .18s, transform .18s;
  }
  .hc-cta-btn.primary { background: var(--accent); color: #fff; }
  .hc-cta-btn.primary:hover { background: var(--accent-hi); transform: translateY(-1px); }
  .hc-cta-btn.ghost { background: rgba(255,255,255,.05); color: var(--ink); border: 1px solid var(--line-strong); }
  .hc-cta-btn.ghost:hover { background: rgba(255,255,255,.09); }

  @media (max-width: 720px) {
    .hc-cats { grid-template-columns: 1fr; }
    .hc-cta-box { flex-direction: column; align-items: flex-start; }
    .hc-nav { padding: 18px 20px; }
    .hc-hero { padding: 48px 20px 32px; }
    .hc-article { padding: 16px 18px; }
  }

  @media (prefers-reduced-motion: reduce) {
    .hc * { transition-duration: .01ms !important; }
  }
`;

const HelpCenter = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [openFaq, setOpenFaq] = useState(null);

  const filteredArticles = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return ARTICLES.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.keywords.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q),
    );
  }, [query]);

  const isSearching = query.trim().length > 0;

  return (
    <>
      <Helmet>
        <title>Help Center — SolidFlo</title>
        <meta
          name="description"
          content="Find answers about billing, account settings, industry dashboards, integrations, and troubleshooting for SolidFlo."
        />
        <link rel="canonical" href="https://solidflo.co.za/help-center" />
      </Helmet>

      <div className="hc">
        <style>{css}</style>

        <nav className="hc-nav">
          <button className="hc-nav-back" onClick={() => navigate("/")}>
            <ArrowLeft size={16} /> Back to SolidFlo
          </button>
          <img src={logo} alt="SolidFlo" className="hc-nav-logo" />
        </nav>

        <section className="hc-hero">
          <h1>How can we help?</h1>
          <p>
            Search articles on billing, your account, and every industry
            dashboard — or browse by topic below.
          </p>
          <div className="hc-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search for an article…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search help articles"
            />
          </div>
        </section>

        {isSearching ? (
          <section className="hc-section">
            <div className="hc-section-title">
              {filteredArticles.length} result
              {filteredArticles.length !== 1 ? "s" : ""} for "{query}"
            </div>
            {filteredArticles.length > 0 ? (
              <div className="hc-articles">
                {filteredArticles.map((a) => (
                  <button key={a.title} className="hc-article">
                    <div className="hc-article-main">
                      <span className="hc-article-title">{a.title}</span>
                      <span className="hc-article-meta">
                        {a.category} · {a.time} read
                      </span>
                    </div>
                    <ArrowRight size={16} />
                  </button>
                ))}
              </div>
            ) : (
              <div className="hc-empty">
                No articles match that search. Try a different term, or{" "}
                <span
                  style={{ color: "var(--accent-hi)", cursor: "pointer" }}
                  onClick={() => navigate("/contact")}
                >
                  contact support
                </span>
                .
              </div>
            )}
          </section>
        ) : (
          <>
            <section className="hc-section">
              <div className="hc-section-title">Browse by topic</div>
              <div className="hc-cats">
                {CATEGORIES.map((c) => {
                  const Icon = c.icon;
                  return (
                    <button
                      key={c.id}
                      className="hc-cat"
                      onClick={() => setQuery(c.title)}
                    >
                      <div className="hc-cat-icon">
                        <Icon size={17} />
                      </div>
                      <h3>{c.title}</h3>
                      <p>{c.desc}</p>
                      <div className="hc-cat-count">{c.count} articles</div>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="hc-section">
              <div className="hc-section-title">Frequently asked</div>
              <div className="hc-faq">
                {FAQS.map((f, i) => (
                  <div
                    key={f.q}
                    className={`hc-faq-item${openFaq === i ? " open" : ""}`}
                  >
                    <button
                      className="hc-faq-q"
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      aria-expanded={openFaq === i}
                    >
                      {f.q}
                      <ChevronDown size={17} />
                    </button>
                    <div className="hc-faq-a">
                      <div className="hc-faq-a-inner">{f.a}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        <div className="hc-cta">
          <div className="hc-cta-box">
            <div>
              <h3>Still stuck?</h3>
              <p>Our team replies within one business day.</p>
            </div>
            <div className="hc-cta-btns">
              <button
                className="hc-cta-btn ghost"
                onClick={() => navigate("/contact")}
              >
                <Mail size={15} /> Email support
              </button>
              <button
                className="hc-cta-btn primary"
                onClick={() => navigate("/contact")}
              >
                <MessageCircle size={15} /> Chat with us
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HelpCenter;