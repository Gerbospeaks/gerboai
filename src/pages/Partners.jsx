import React from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import {
  ArrowLeft,
  ArrowRight,
  CreditCard,
  Calendar,
  FileSpreadsheet,
  MessageSquare,
  Cloud,
  Workflow,
  Code2,
  CheckCircle2,
} from "lucide-react";
import logo from "../assets/img/solidflo.png";

/* ─── Content ────────────────────────────────────────────────────────────
   PLACEHOLDER integration names below (Stripe, PayFast, QuickBooks, etc.)
   — these are examples of the *kind* of tool that fits each category, not
   confirmed live integrations. Swap in only integrations you have actually
   built and can support before this goes live; listing a real company here
   without a real integration implies a partnership that doesn't exist. */

const CATEGORIES = [
  {
    icon: CreditCard,
    title: "Payments",
    desc: "Accept online payments directly on invoices and get paid faster.",
    examples: ["Stripe", "PayFast", "Ozow"],
    status: "live",
  },
  {
    icon: FileSpreadsheet,
    title: "Accounting",
    desc: "Sync invoices and expenses with the books your accountant already uses.",
    examples: ["QuickBooks", "Xero", "Sage"],
    status: "planned",
  },
  {
    icon: Calendar,
    title: "Calendar & scheduling",
    desc: "Two-way sync for appointments, bookings, and job scheduling.",
    examples: ["Google Calendar", "Outlook Calendar"],
    status: "live",
  },
  {
    icon: MessageSquare,
    title: "Communications",
    desc: "Send automated reminders and updates over SMS and email.",
    examples: ["Twilio", "WhatsApp Business"],
    status: "planned",
  },
  {
    icon: Cloud,
    title: "Storage & documents",
    desc: "Back up generated documents to the cloud drive your team already uses.",
    examples: ["Google Drive", "Dropbox"],
    status: "planned",
  },
  {
    icon: Workflow,
    title: "Automation",
    desc: "Trigger workflows in other tools whenever something changes in SolidFlo.",
    examples: ["Zapier", "Make"],
    status: "planned",
  },
];

const STEPS = [
  {
    title: "Tell us what you're building",
    body: "Share what your tool does and how a SolidFlo connection would help mutual customers.",
  },
  {
    title: "We scope the integration together",
    body: "We'll confirm what's technically possible today, and what needs API access we don't expose yet.",
  },
  {
    title: "Build, test, and list it",
    body: "Once it's working end-to-end, it goes on this page — with your name, not a placeholder.",
  },
];

const css = `
  .pt {
    --base: #070a12; --panel: #0d1220;
    --line: rgba(255,255,255,.08); --line-strong: rgba(255,255,255,.14); --line-accent: rgba(109,124,255,.32);
    --accent: #6d7cff; --accent-hi: #8b97ff; --accent-dim: rgba(109,124,255,.12);
    --signal: #2ee6a8; --signal-dim: rgba(46,230,168,.12);
    --warn: #ffb454; --warn-dim: rgba(255,180,84,.12);
    --ink: #e9ecf7; --ink-mid: #9aa3bd; --ink-dim: #626c88; --ink-faint: #3e465c;
    --r-sm: 4px; --r-md: 8px; --r-lg: 16px; --maxw: 1020px;

    font-family: 'Instrument Sans', system-ui, -apple-system, sans-serif;
    background: var(--base); color: var(--ink);
    min-height: 100vh; position: relative; overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
  }
  .pt *, .pt *::before, .pt *::after { box-sizing: border-box; }
  .pt::before {
    content: ''; position: fixed; inset: 0; z-index: 0; pointer-events: none;
    background: radial-gradient(ellipse 90% 55% at 50% 0%, rgba(109,124,255,.13) 0%, transparent 58%);
  }
  .pt > * { position: relative; z-index: 1; }
  .pt a:focus-visible, .pt button:focus-visible { outline: 2px solid var(--accent-hi); outline-offset: 3px; border-radius: var(--r-sm); }

  .pt-nav {
    display: flex; align-items: center; justify-content: space-between;
    padding: 22px 32px; border-bottom: 1px solid var(--line);
    max-width: 1180px; margin: 0 auto;
  }
  .pt-nav-back {
    display: inline-flex; align-items: center; gap: 7px;
    font-size: 14px; font-weight: 500; color: var(--ink-mid);
    background: none; border: none; cursor: pointer; padding: 6px 0;
    transition: color .18s;
  }
  .pt-nav-back:hover { color: var(--ink); }
  .pt-nav-logo { height: 30px; }

  .pt-hero { max-width: 720px; margin: 0 auto; text-align: center; padding: 64px 24px 24px; }
  .pt-hero h1 { font-size: clamp(1.9rem, 4vw, 2.6rem); font-weight: 600; letter-spacing: -.035em; margin: 0 0 14px; }
  .pt-hero p { font-size: 16px; color: var(--ink-mid); line-height: 1.6; margin: 0 auto; max-width: 48ch; }

  .pt-section { max-width: var(--maxw); margin: 0 auto; padding: 40px 24px; }
  .pt-section-title { font-size: 13px; font-weight: 600; color: var(--ink-dim); margin: 0 0 18px; }

  .pt-cats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
  .pt-cat {
    background: rgba(13,18,32,.66); border: 1px solid var(--line);
    border-radius: var(--r-lg); padding: 24px; position: relative;
  }
  .pt-cat-icon {
    width: 36px; height: 36px; border-radius: var(--r-sm);
    background: var(--accent-dim); border: 1px solid var(--line-accent);
    display: flex; align-items: center; justify-content: center;
    color: var(--accent-hi); margin-bottom: 14px;
  }
  .pt-cat h3 { font-size: 15px; font-weight: 600; color: var(--ink); margin: 0 0 6px; letter-spacing: -.02em; }
  .pt-cat p { font-size: 13px; color: var(--ink-mid); line-height: 1.55; margin: 0 0 16px; }
  .pt-cat-chips { display: flex; flex-wrap: wrap; gap: 6px; }
  .pt-chip {
    font-size: 11.5px; font-weight: 500; padding: 4px 10px; border-radius: 999px;
    background: rgba(255,255,255,.05); border: 1px solid var(--line-strong); color: var(--ink-mid);
  }
  .pt-status {
    position: absolute; top: 18px; right: 18px;
    font-size: 10.5px; font-weight: 600; padding: 3px 9px; border-radius: 999px;
    display: inline-flex; align-items: center; gap: 5px;
  }
  .pt-status.live { background: var(--signal-dim); border: 1px solid rgba(46,230,168,.28); color: var(--signal); }
  .pt-status.planned { background: var(--warn-dim); border: 1px solid rgba(255,180,84,.28); color: var(--warn); }
  .pt-status-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }

  .pt-steps { display: flex; flex-direction: column; gap: 1px; background: var(--line); border: 1px solid var(--line); border-radius: var(--r-lg); overflow: hidden; }
  .pt-step { display: flex; gap: 16px; background: rgba(10,14,25,.92); padding: 22px 24px; align-items: flex-start; }
  .pt-step-num {
    width: 30px; height: 30px; border-radius: 50%; flex-shrink: 0;
    background: var(--accent-dim); border: 1px solid var(--line-accent); color: var(--accent-hi);
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 600;
  }
  .pt-step h3 { font-size: 15px; font-weight: 600; color: var(--ink); margin: 0 0 6px; letter-spacing: -.02em; }
  .pt-step p { font-size: 13.5px; color: var(--ink-mid); line-height: 1.6; margin: 0; }

  .pt-api {
    max-width: var(--maxw); margin: 0 auto; padding: 0 24px 40px;
  }
  .pt-api-box {
    display: flex; align-items: center; gap: 18px;
    background: rgba(13,18,32,.6); border: 1px solid var(--line);
    border-radius: var(--r-lg); padding: 24px 26px;
  }
  .pt-api-icon {
    width: 40px; height: 40px; border-radius: var(--r-sm); flex-shrink: 0;
    background: rgba(255,255,255,.05); border: 1px solid var(--line-strong);
    display: flex; align-items: center; justify-content: center; color: var(--ink);
  }
  .pt-api-box h3 { font-size: 15px; font-weight: 600; color: var(--ink); margin: 0 0 4px; letter-spacing: -.02em; }
  .pt-api-box p { font-size: 13.5px; color: var(--ink-mid); margin: 0; }
  .pt-api-link {
    margin-left: auto; flex-shrink: 0;
    font-size: 13.5px; font-weight: 600; color: var(--accent-hi);
    display: inline-flex; align-items: center; gap: 6px;
    background: none; border: none; cursor: pointer;
  }

  .pt-cta { max-width: var(--maxw); margin: 0 auto; padding: 0 24px 80px; }
  .pt-cta-box {
    display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-wrap: wrap;
    background: linear-gradient(135deg, rgba(109,124,255,.13) 0%, rgba(13,18,32,.75) 60%);
    border: 1px solid var(--line-accent); border-radius: var(--r-lg); padding: 30px 32px;
  }
  .pt-cta-box h3 { font-size: 19px; font-weight: 600; color: var(--ink); margin: 0 0 6px; letter-spacing: -.02em; }
  .pt-cta-box p { font-size: 13.5px; color: var(--ink-mid); margin: 0; max-width: 42ch; }
  .pt-cta-btn {
    height: 46px; padding: 0 22px; border-radius: var(--r-md); flex-shrink: 0;
    background: var(--accent); color: #fff; border: none;
    font-family: inherit; font-size: 14px; font-weight: 600; letter-spacing: -.01em;
    display: inline-flex; align-items: center; gap: 8px; cursor: pointer;
    transition: background .18s, transform .18s;
  }
  .pt-cta-btn:hover { background: var(--accent-hi); transform: translateY(-1px); }

  @media (max-width: 900px) {
    .pt-cats { grid-template-columns: 1fr 1fr; }
  }
  @media (max-width: 640px) {
    .pt-cats { grid-template-columns: 1fr; }
    .pt-cta-box, .pt-api-box { flex-direction: column; align-items: flex-start; }
    .pt-api-link { margin-left: 0; }
    .pt-nav { padding: 18px 20px; }
    .pt-step { padding: 18px 20px; }
  }
  @media (prefers-reduced-motion: reduce) {
    .pt * { transition-duration: .01ms !important; }
  }
`;

const Partners = () => {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Technology partners — SolidFlo</title>
        <meta
          name="description"
          content="Tools that connect with SolidFlo, and how to become an integration partner."
        />
        <link rel="canonical" href="https://solidflo.co.za/partners" />
      </Helmet>

      <div className="pt">
        <style>{css}</style>

        <nav className="pt-nav">
          <button className="pt-nav-back" onClick={() => navigate("/")}>
            <ArrowLeft size={16} /> Back to SolidFlo
          </button>
          <img src={logo} alt="SolidFlo" className="pt-nav-logo" />
        </nav>

        <section className="pt-hero">
          <h1>Technology partners</h1>
          <p>
            SolidFlo connects to the tools businesses already run on — for
            payments, accounting, scheduling, and more.
          </p>
        </section>

        <section className="pt-section">
          <div className="pt-section-title">Integration categories</div>
          <div className="pt-cats">
            {CATEGORIES.map((c) => {
              const Icon = c.icon;
              return (
                <div key={c.title} className="pt-cat">
                  <span className={`pt-status ${c.status}`}>
                    <span className="pt-status-dot" />
                    {c.status === "live" ? "Live" : "Planned"}
                  </span>
                  <div className="pt-cat-icon">
                    <Icon size={16} />
                  </div>
                  <h3>{c.title}</h3>
                  <p>{c.desc}</p>
                  <div className="pt-cat-chips">
                    {c.examples.map((e) => (
                      <span key={e} className="pt-chip">
                        {e}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="pt-api">
          <div className="pt-api-box">
            <div className="pt-api-icon">
              <Code2 size={18} />
            </div>
            <div>
              <h3>Build your own connection</h3>
              <p>
                Read and write invoices, clients, and jobs through the SolidFlo
                API.
              </p>
            </div>
            <button
              className="pt-api-link"
              onClick={() => navigate("/contact")}
            >
              Request API access <ArrowRight size={14} />
            </button>
          </div>
        </section>

        <section className="pt-section">
          <div className="pt-section-title">
            How a partnership comes together
          </div>
          <div className="pt-steps">
            {STEPS.map((s, i) => (
              <div key={s.title} className="pt-step">
                <div className="pt-step-num">{i + 1}</div>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="pt-cta">
          <div className="pt-cta-box">
            <div>
              <h3>Want to build an integration?</h3>
              <p>
                Tell us about your tool and what a connection would unlock for
                your users.
              </p>
            </div>
            <button className="pt-cta-btn" onClick={() => navigate("/contact")}>
              <CheckCircle2 size={15} /> Apply as a partner
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Partners;
