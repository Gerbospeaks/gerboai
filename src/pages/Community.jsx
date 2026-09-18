import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  MessageSquare,
  Megaphone,
  Star,
  Send,
} from "lucide-react";
import logo from "../assets/img/solidflo.png";
import facebook from "../assets/images/facebook.png";
import twitter from "../assets/images/twitter.png";
import instagram from "../assets/images/instagram.png";

/* ─── Content ────────────────────────────────────────────────────────────
   Static for now — no forum backend yet. Three feeds, filterable by tab:
   product updates (your changelog), customer showcase (real stories once
   you have them), and discussion prompts that point out to your social
   channels until an on-site forum exists. Swap UPDATES/SHOWCASE/PROMPTS
   for real data or an API call later without touching the layout. */

const TABS = [
  { id: "all", label: "All" },
  { id: "updates", label: "Product updates" },
  { id: "showcase", label: "Customer showcase" },
  { id: "discussion", label: "Discussions" },
];

const UPDATES = [
  {
    type: "updates",
    date: "Sep 2026",
    title: "Guest menu QR codes for hotels",
    body: "Hotel accounts can now generate a QR code that opens a live, mobile-friendly menu — no app or login needed for guests.",
  },
  {
    type: "updates",
    date: "Aug 2026",
    title: "Faster recurring billing",
    body: "Recurring invoices now generate and send in the background, so large client lists no longer slow down your dashboard.",
  },
  {
    type: "updates",
    date: "Jul 2026",
    title: "Sub-accounts for mechanics",
    body: "Add technicians as sub-accounts with their own login, scoped to the vehicles and jobs you assign them.",
  },
];

const SHOWCASE = [
  {
    type: "showcase",
    name: "Mark Moyo",
    role: "Electrician, Harare",
    image: "https://i.pravatar.cc/150?u=markmoyo",
    body: "Switched all my quotes to SolidFlo templates. Clients sign off faster because everything looks like it came from a real company.",
  },
  {
    type: "showcase",
    name: "Thandiwe Nkosi",
    role: "Clinic administrator",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Thandiwe",
    body: "Appointment reminders cut our no-show rate by almost half in the first month. Didn't expect that from an invoicing tool.",
  },
];

const PROMPTS = [
  {
    type: "discussion",
    title: "What would make your dashboard faster to use?",
    body: "We read every reply. Tell us the one click you wish didn't exist.",
  },
  {
    type: "discussion",
    title: "Show off your invoice templates",
    body: "Customised your branding, stamp, or layout? Post a screenshot — we reshare the best ones.",
  },
];

const SOCIALS = [
  {
    icon: facebook,
    alt: "Facebook",
    href: "https://web.facebook.com/solidflo.saas",
  },
  { icon: twitter, alt: "Twitter", href: "https://x.com/solidflo_saas" },
  {
    icon: instagram,
    alt: "Instagram",
    href: "https://www.instagram.com/solidflo_saas?igsh=MTdwcHlxc2gyemFzdw==",
  },
];

const css = `
  .cm {
    --base: #070a12; --panel: #0d1220;
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
  .cm *, .cm *::before, .cm *::after { box-sizing: border-box; }
  .cm::before {
    content: ''; position: fixed; inset: 0; z-index: 0; pointer-events: none;
    background: radial-gradient(ellipse 90% 55% at 50% 0%, rgba(109,124,255,.13) 0%, transparent 58%);
  }
  .cm > * { position: relative; z-index: 1; }
  .cm a:focus-visible, .cm button:focus-visible { outline: 2px solid var(--accent-hi); outline-offset: 3px; border-radius: var(--r-sm); }

  .cm-nav {
    display: flex; align-items: center; justify-content: space-between;
    padding: 22px 32px; border-bottom: 1px solid var(--line);
    max-width: 1180px; margin: 0 auto;
  }
  .cm-nav-back {
    display: inline-flex; align-items: center; gap: 7px;
    font-size: 14px; font-weight: 500; color: var(--ink-mid);
    background: none; border: none; cursor: pointer; padding: 6px 0;
    transition: color .18s;
  }
  .cm-nav-back:hover { color: var(--ink); }
  .cm-nav-logo { height: 30px; }

  .cm-hero { max-width: 720px; margin: 0 auto; text-align: center; padding: 64px 24px 32px; }
  .cm-hero h1 { font-size: clamp(1.9rem, 4vw, 2.6rem); font-weight: 600; letter-spacing: -.035em; margin: 0 0 14px; }
  .cm-hero p { font-size: 16px; color: var(--ink-mid); line-height: 1.6; margin: 0 auto; max-width: 46ch; }

  .cm-tabs {
    display: flex; justify-content: center; gap: 6px; flex-wrap: wrap;
    max-width: var(--maxw); margin: 0 auto; padding: 0 24px 40px;
  }
  .cm-tab {
    height: 38px; padding: 0 16px; border-radius: 999px;
    background: transparent; border: 1px solid var(--line-strong);
    color: var(--ink-mid); font-family: inherit; font-size: 13.5px; font-weight: 500;
    cursor: pointer; transition: border-color .18s, color .18s, background .18s;
  }
  .cm-tab:hover { border-color: var(--line-accent); color: var(--ink); }
  .cm-tab.active { background: var(--accent); border-color: var(--accent); color: #fff; }

  .cm-feed { max-width: var(--maxw); margin: 0 auto; padding: 0 24px 20px; display: flex; flex-direction: column; gap: 14px; }

  .cm-card {
    background: rgba(13,18,32,.66); border: 1px solid var(--line);
    border-radius: var(--r-lg); padding: 26px;
    display: flex; gap: 18px; align-items: flex-start;
  }
  .cm-card-icon {
    width: 38px; height: 38px; border-radius: var(--r-sm); flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    background: var(--accent-dim); border: 1px solid var(--line-accent); color: var(--accent-hi);
  }
  .cm-card-icon.update { background: var(--accent-dim); border-color: var(--line-accent); color: var(--accent-hi); }
  .cm-card-icon.showcase { background: var(--signal-dim); border-color: rgba(46,230,168,.28); color: var(--signal); }
  .cm-card-icon.discussion { background: rgba(255,180,84,.12); border-color: rgba(255,180,84,.28); color: #ffb454; }
  .cm-card-body { flex: 1; min-width: 0; }
  .cm-card-meta { font-size: 12.5px; color: var(--ink-dim); margin-bottom: 6px; }
  .cm-card h3 { font-size: 16px; font-weight: 600; color: var(--ink); margin: 0 0 8px; letter-spacing: -.02em; }
  .cm-card p { font-size: 14px; color: var(--ink-mid); line-height: 1.6; margin: 0; }

  .cm-showcase-person { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
  .cm-showcase-avatar { width: 38px; height: 38px; border-radius: 50%; border: 1px solid var(--line-strong); }
  .cm-showcase-name { font-size: 14px; font-weight: 600; color: var(--ink); }
  .cm-showcase-role { font-size: 12.5px; color: var(--ink-dim); }
  .cm-showcase-stars { display: flex; gap: 2px; color: #ffb454; margin-bottom: 10px; }

  .cm-discussion-btn {
    margin-top: 14px; display: inline-flex; align-items: center; gap: 7px;
    background: none; border: none; padding: 0; cursor: pointer;
    font-family: inherit; font-size: 13px; font-weight: 600; color: var(--accent-hi);
    transition: gap .18s;
  }
  .cm-discussion-btn:hover { gap: 10px; }

  .cm-social {
    max-width: var(--maxw); margin: 40px auto 0; padding: 32px 24px;
    border-top: 1px solid var(--line);
    display: flex; align-items: center; justify-content: space-between;
    gap: 20px; flex-wrap: wrap;
  }
  .cm-social-text h3 { font-size: 16px; font-weight: 600; color: var(--ink); margin: 0 0 4px; letter-spacing: -.02em; }
  .cm-social-text p { font-size: 13.5px; color: var(--ink-mid); margin: 0; }
  .cm-social-icons { display: flex; gap: 8px; }
  .cm-social-icon {
    width: 38px; height: 38px; border-radius: var(--r-md);
    background: rgba(255,255,255,.04); border: 1px solid var(--line);
    display: flex; align-items: center; justify-content: center;
    transition: background .18s, border-color .18s;
  }
  .cm-social-icon:hover { background: var(--accent-dim); border-color: var(--line-accent); }
  .cm-social-icon img { width: 16px; height: 16px; filter: brightness(0) invert(1); opacity: .85; }

  .cm-cta { max-width: var(--maxw); margin: 0 auto; padding: 20px 24px 80px; }
  .cm-cta-box {
    display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-wrap: wrap;
    background: linear-gradient(135deg, rgba(109,124,255,.13) 0%, rgba(13,18,32,.75) 60%);
    border: 1px solid var(--line-accent); border-radius: var(--r-lg); padding: 28px 30px;
  }
  .cm-cta-box h3 { font-size: 17px; font-weight: 600; color: var(--ink); margin: 0 0 5px; letter-spacing: -.02em; }
  .cm-cta-box p { font-size: 13.5px; color: var(--ink-mid); margin: 0; max-width: 40ch; }
  .cm-cta-btn {
    height: 44px; padding: 0 20px; border-radius: var(--r-md); flex-shrink: 0;
    background: var(--accent); color: #fff; border: none;
    font-family: inherit; font-size: 14px; font-weight: 600; letter-spacing: -.01em;
    display: inline-flex; align-items: center; gap: 8px; cursor: pointer;
    transition: background .18s, transform .18s;
  }
  .cm-cta-btn:hover { background: var(--accent-hi); transform: translateY(-1px); }

  @media (max-width: 640px) {
    .cm-card { flex-direction: column; }
    .cm-social, .cm-cta-box { flex-direction: column; align-items: flex-start; }
    .cm-nav { padding: 18px 20px; }
  }
  @media (prefers-reduced-motion: reduce) {
    .cm * { transition-duration: .01ms !important; }
  }
`;

const Community = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState("all");

  const items = [...UPDATES, ...SHOWCASE, ...PROMPTS].filter(
    (i) => tab === "all" || i.type === tab,
  );

  return (
    <>
      <Helmet>
        <title>Community — SolidFlo</title>
        <meta
          name="description"
          content="Product updates, customer showcase, and discussions from the SolidFlo community."
        />
        <link rel="canonical" href="https://solidflo.co.za/community" />
      </Helmet>

      <div className="cm">
        <style>{css}</style>

        <nav className="cm-nav">
          <button className="cm-nav-back" onClick={() => navigate("/")}>
            <ArrowLeft size={16} /> Back to SolidFlo
          </button>
          <img src={logo} alt="SolidFlo" className="cm-nav-logo" />
        </nav>

        <section className="cm-hero">
          <h1>Community</h1>
          <p>
            What's new in SolidFlo, how other businesses are using it, and open
            questions we're still figuring out together.
          </p>
        </section>

        <div className="cm-tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`cm-tab${tab === t.id ? " active" : ""}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <section className="cm-feed">
          {items.map((item, i) => {
            if (item.type === "updates") {
              return (
                <article key={`u-${i}`} className="cm-card">
                  <div className="cm-card-icon update">
                    <Sparkles size={17} />
                  </div>
                  <div className="cm-card-body">
                    <div className="cm-card-meta">{item.date}</div>
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                  </div>
                </article>
              );
            }
            if (item.type === "showcase") {
              return (
                <article key={`s-${i}`} className="cm-card">
                  <div className="cm-card-icon showcase">
                    <Star size={17} />
                  </div>
                  <div className="cm-card-body">
                    <div className="cm-showcase-person">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="cm-showcase-avatar"
                      />
                      <div>
                        <div className="cm-showcase-name">{item.name}</div>
                        <div className="cm-showcase-role">{item.role}</div>
                      </div>
                    </div>
                    <p>{item.body}</p>
                  </div>
                </article>
              );
            }
            return (
              <article key={`d-${i}`} className="cm-card">
                <div className="cm-card-icon discussion">
                  <MessageSquare size={17} />
                </div>
                <div className="cm-card-body">
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                  <button
                    className="cm-discussion-btn"
                    onClick={() => window.open(SOCIALS[0].href, "_blank")}
                  >
                    Join the conversation <ArrowRight size={14} />
                  </button>
                </div>
              </article>
            );
          })}
        </section>

        <div className="cm-social">
          <div className="cm-social-text">
            <h3>Follow along</h3>
            <p>Updates, tips, and behind-the-scenes on our socials.</p>
          </div>
          <div className="cm-social-icons">
            {SOCIALS.map((s) => (
              <a
                key={s.alt}
                href={s.href}
                className="cm-social-icon"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.alt}
              >
                <img src={s.icon} alt={s.alt} />
              </a>
            ))}
          </div>
        </div>

        <div className="cm-cta">
          <div className="cm-cta-box">
            <div>
              <h3>Have your own story?</h3>
              <p>Tell us how you use SolidFlo — we might feature it here.</p>
            </div>
            <button className="cm-cta-btn" onClick={() => navigate("/contact")}>
              <Send size={15} /> Share your story
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Community;
