import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSubdomain } from "../../hooks/useSubdomain";
import { getIndustryConfig } from "../../config/industryConfig";
import logo from "../../assets/img/hvac-logo.png";
import logotop from "../../assets/img/hvac-logo-top.png";
import { HC, heroFontStyle } from "../../styles/landingTokens";
import google from "../../assets/google-play.png";
import Helmet from "react-helmet";
/* ─── Font ──────────────────────────────────────────────────────────────── */
const fontStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&family=Barlow:wght@400;500;600&display=swap');
`;

const responsiveCSS = `
  .nav-links-desktop { display: flex; }
  .nav-ctas-desktop  { display: flex; }
  .nav-hamburger     { display: none; }
  @media (max-width: 768px) {
    .nav-links-desktop { display: none !important; }
    .nav-ctas-desktop  { display: none !important; }
    .nav-hamburger     { display: block !important; }
    .footer-grid       { grid-template-columns: 1fr 1fr !important; }
    .stats-grid        { grid-template-columns: 1fr 1fr !important; }
    .hiw-grid          { grid-template-columns: 1fr !important; }
  }
  @media (max-width: 560px) {
    .footer-grid  { grid-template-columns: 1fr !important; }
    .pricing-grid { grid-template-columns: 1fr !important; }
    .feat-grid    { grid-template-columns: 1fr !important; }
    .test-grid    { grid-template-columns: 1fr !important; }
  }
`;

/* ─── Token helper ──────────────────────────────────────────────────────── */
const T = (config) => ({
  ink: config.color || "#0C1824",
  surface: "#EEF4F7",
  white: "#FFFFFF",
  accent: config.accent || "#1BA8B0",
  accentD: config.accentDark || "#0F7A82",
  accentL: config.lightBg || "#C4EAF0",
  border: "#D6E8EC",
  text: "#111D28",
  muted: "#6B8794",
});
const C = {
  ink: "#085041", // deep teal (was deep navy)
  ink2: "#0F6E56", // mid teal (was mid navy)
  surface: "#F0FAF6", // cool light teal bg (was cool light blue)
  white: "#FFFFFF",
  green: "#1D9E75", // primary accent (was orange)
  greenD: "#0F6E56", // darker accent
  greenL: "#E1F5EE", // light tint
  steel: "#64748B",
  border: "#E2E8F0",
  text: "#1E293B",
  muted: "#64748B",
};
/* ─── Scroll helper ─────────────────────────────────────────────────────── */
const scrollTo = (id) =>
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

/* ─── Dot grid bg ───────────────────────────────────────────────────────── */
function DotGrid({ accent }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        backgroundImage: `radial-gradient(circle, ${accent}18 1px, transparent 1px)`,
        backgroundSize: "32px 32px",
      }}
    />
  );
}

/* ─── Eyebrow label ─────────────────────────────────────────────────────── */
function Eyebrow({ accent, children }) {
  return (
    <p
      style={{
        color: accent,
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: 3,
        textTransform: "uppercase",
        fontFamily: "'Barlow', sans-serif",
        margin: "0 0 10px",
      }}
    >
      {children}
    </p>
  );
}

/* ─── Navbar (restyled to match light hero) ──────────────────────────────── */
function Navbar({ onLogin, onRegister }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    const fn = () => { if (window.innerWidth > 768) setOpen(false); };
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  const links = ["features", "pricing", "testimonials", "faq"];
  const AMBER = "#C67C3A";
  const AMBER_HOVER = "#A9652C";

  const handleNavLink = (id) => {
    scrollTo(id);
    setOpen(false);
  };

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: HC.cream,
        borderBottom: `1px solid ${HC.creamDark}`,
        transition: "box-shadow .2s",
        boxShadow: scrolled ? "0 4px 20px rgba(15,23,42,0.08)" : "none",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 60,
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              background: "transparent",
              width: 160,
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img src={logo} alt="SolidFlo" style={{ maxWidth: "100%" }} />
          </div>
        </div>

        {/* Desktop links */}
        {!isMobile && (
          <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
            {links.map((s) => (
              <button
                key={s}
                onClick={() => scrollTo(s)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: HC.textMid,
                  fontSize: 14,
                  fontFamily: "'Lato', sans-serif",
                  fontWeight: 600,
                  textTransform: "capitalize",
                  transition: "color .2s",
                }}
                onMouseEnter={(e) => (e.target.style.color = HC.navy)}
                onMouseLeave={(e) => (e.target.style.color = HC.textMid)}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Desktop CTA */}
        {!isMobile && (
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button
              onClick={onLogin}
              style={{
                background: "none",
                border: `1px solid ${HC.creamDark}`,
                borderRadius: 8,
                padding: "7px 18px",
                color: HC.textMid,
                fontSize: 13,
                fontFamily: "'Lato', sans-serif",
                fontWeight: 600,
                cursor: "pointer",
                transition: "border-color .15s, color .15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = HC.navy;
                e.currentTarget.style.color = HC.navy;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = HC.creamDark;
                e.currentTarget.style.color = HC.textMid;
              }}
            >
              Sign In
            </button>
            <button
              onClick={onRegister}
              style={{
                background: AMBER,
                border: "none",
                borderRadius: 8,
                padding: "8px 20px",
                color: HC.white,
                fontSize: 13,
                fontWeight: 700,
                fontFamily: "'Lato', sans-serif",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(198,124,58,0.35)",
                transition: "background .15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = AMBER_HOVER)}
              onMouseLeave={(e) => (e.currentTarget.style.background = AMBER)}
            >
              Start Free →
            </button>
          </div>
        )}

        {/* Hamburger button (mobile only) */}
        {isMobile && (
          <button
            onClick={() => setOpen(!open)}
            style={{
              background: "none",
              border: `1px solid ${HC.creamDark}`,
              borderRadius: 8,
              padding: "8px 10px",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              gap: 5,
              alignItems: "center",
              justifyContent: "center",
            }}
            aria-label="Toggle menu"
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                style={{
                  display: "block",
                  width: 22,
                  height: 2,
                  background: HC.navy,
                  borderRadius: 2,
                  transition: "transform .2s, opacity .2s",
                  transformOrigin: "center",
                  transform:
                    open && i === 0 ? "translateY(7px) rotate(45deg)"
                    : open && i === 1 ? "scaleX(0)"
                    : open && i === 2 ? "translateY(-7px) rotate(-45deg)"
                    : "none",
                  opacity: open && i === 1 ? 0 : 1,
                }}
              />
            ))}
          </button>
        )}
      </div>

      {/* Mobile dropdown menu */}
      {isMobile && (
        <div
          style={{
            maxHeight: open ? 400 : 0,
            overflow: "hidden",
            transition: "max-height .3s ease",
            background: HC.creamMid,
            borderTop: open ? `1px solid ${HC.creamDark}` : "none",
          }}
        >
          <div style={{ padding: "12px 24px 20px", display: "flex", flexDirection: "column", gap: 4 }}>
            {links.map((s) => (
              <button
                key={s}
                onClick={() => handleNavLink(s)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: HC.textMid,
                  fontSize: 16,
                  fontFamily: "'Lato', sans-serif",
                  fontWeight: 600,
                  textTransform: "capitalize",
                  padding: "12px 0",
                  textAlign: "left",
                  borderBottom: `1px solid ${HC.creamDark}`,
                  transition: "color .2s",
                }}
                onMouseEnter={(e) => (e.target.style.color = HC.navy)}
                onMouseLeave={(e) => (e.target.style.color = HC.textMid)}
              >
                {s}
              </button>
            ))}

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
              <button
                onClick={() => { onLogin(); setOpen(false); }}
                style={{
                  background: "none",
                  border: `1px solid ${HC.creamDark}`,
                  borderRadius: 8,
                  padding: "11px",
                  color: HC.textMid,
                  fontSize: 14,
                  fontFamily: "'Lato', sans-serif",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Sign In
              </button>
              <button
                onClick={() => { onRegister(); setOpen(false); }}
                style={{
                  background: AMBER,
                  border: "none",
                  borderRadius: 8,
                  padding: "12px",
                  color: HC.white,
                  fontSize: 14,
                  fontWeight: 700,
                  fontFamily: "'Lato', sans-serif",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(198,124,58,0.35)",
                }}
              >
                Start Free →
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

/* ─── Hero (generic, restyled to match construction-style framed hero) ──── */
function Hero({ config, onRegister }) {
  const C = T(config);

  return (
    <section
      style={{
        background: C.cream,
        padding: "80px 24px 100px",
        position: "relative",
        overflow: "hidden",
        minHeight: "88vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        fontFamily: "'Lato', sans-serif",
      }}
    >
      <style>{heroFontStyle}</style>

      {/* Ambient glow, tinted with accent */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 70% 60% at 15% 30%, rgba(99,102,241,.08) 0%, transparent 60%), radial-gradient(ellipse 60% 70% at 90% 15%, ${C.accent}1F 0%, transparent 55%)`,
          pointerEvents: "none",
        }}
      />

      {/* Framed "device" container */}
      <div
        style={{
          maxWidth: 880,
          margin: "0 auto",
          position: "relative",
          width: "100%",
          textAlign: "center",
          border: "1px solid rgba(15,23,42,0.08)",
          borderRadius: 32,
          padding: "60px 56px",
          background: "rgba(255,255,255,0.6)",
          backdropFilter: "blur(6px)",
          boxShadow:
            "0 1px 0 rgba(255,255,255,0.6) inset, 0 24px 60px rgba(15,23,42,0.10), 0 4px 16px rgba(15,23,42,0.06)",
        }}
      >
        {/* Badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: `${C.accent}1A`,
            border: `1px solid ${C.accent}48`,
            borderRadius: 99,
            padding: "6px 16px",
            marginBottom: 28,
          }}
        >
          <span style={{ fontSize: 15 }}>{config.icon}</span>
          <span
            style={{
              color: C.accent,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.05em",
              fontFamily: "'Lato', sans-serif",
            }}
          >
            Built for {config.label} Businesses
          </span>
        </div>

        {/* Headline */}
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 700,
            fontSize: "clamp(2.3rem, 6vw, 3.9rem)",
            lineHeight: 1.1,
            color: C.navy,
            margin: "0 0 22px",
          }}
        >
          {config.headline}
        </h1>

        {/* Sub */}
        <p
          style={{
            color: C.textMid,
            fontSize: "clamp(1rem, 2vw, 1.15rem)",
            lineHeight: 1.72,
            margin: "0 auto 40px",
            maxWidth: 580,
            fontFamily: "'Lato', sans-serif",
          }}
        >
          {config.subheadline}
        </p>

        {/* CTAs */}
        <div
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "center",
            flexWrap: "wrap",
            marginBottom: 40,
          }}
        >
          <button
            onClick={onRegister}
            style={{
              height: 52,
              padding: "0 32px",
              background: C.accent,
              border: "none",
              borderRadius: 4,
              color: "#fff",
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              fontFamily: "'Lato', sans-serif",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              transition: "transform .15s, box-shadow .15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          >
            {config.cta}
          </button>
          <button
            onClick={() => scrollTo("features")}
            style={{
              height: 52,
              padding: "0 28px",
              background: "transparent",
              border: `1.5px solid ${C.creamDark}`,
              borderRadius: 4,
              color: C.navy,
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              fontFamily: "'Lato', sans-serif",
              cursor: "pointer",
              transition: "border-color .15s, background .15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = C.navy;
              e.currentTarget.style.background = C.creamMid;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = C.creamDark;
              e.currentTarget.style.background = "transparent";
            }}
          >
            See How It Works
          </button>
        </div>

        {/* Trust */}
        <div
          style={{
            display: "flex",
            gap: 24,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {[
            "No credit card required",
            "Free plan available",
            "Cancel anytime",
            "African business",
          ].map((t) => (
            <span
              key={t}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                color: C.textMuted,
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.03em",
                fontFamily: "'Lato', sans-serif",
              }}
            >
              <span style={{ color: C.accent, fontSize: 10 }}>✦</span>
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Trusted-by bar */}
      <div
        style={{
          maxWidth: 1100,
          margin: "40px auto 0",
          width: "100%",
          paddingLeft: 24,
          paddingRight: 24,
          display: "flex",
          gap: 40,
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <span
          style={{
            color: C.textMuted,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            fontFamily: "'Lato', sans-serif",
          }}
        >
          Trusted by SA businesses
        </span>
        {(
          config.trustedBy || [
            "Cape Town SMEs",
            "Joburg Contractors",
            "Durban Freelancers",
            "Pretoria Agencies",
          ]
        ).map((b) => (
          <span
            key={b}
            style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 600,
              fontSize: 15,
              color: C.textMuted,
            }}
          >
            {b}
          </span>
        ))}
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   HOW IT WORKS
════════════════════════════════════════════════════════════════════════════ */
function HowItWorks({ config }) {
  const C = T(config);
  const steps = config.steps || [
    {
      icon: "📋",
      title: "Create Your Invoice",
      desc: "Log your client, services, and amounts in seconds. Generate a professional itemised invoice straight from your phone or desktop.",
    },
    {
      icon: "📩",
      title: "Send Instantly",
      desc: "One tap sends a polished invoice via email, SMS, or WhatsApp PDF. Clients receive it instantly — no printing, no delays.",
    },
    {
      icon: "💳",
      title: "Get Paid Fast",
      desc: "Clients pay via EFT, card, or PayFast. You're notified the moment funds arrive. Track everything from one dashboard.",
    },
  ];

  return (
    <section
      style={{
        background: C.white,
        padding: "80px 24px",
        fontFamily: "'Barlow', sans-serif",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <Eyebrow accent={C.accent}>How It Works</Eyebrow>
          <h2
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 900,
              fontSize: "clamp(28px,4vw,48px)",
              color: C.text,
              margin: 0,
              letterSpacing: -0.5,
            }}
          >
            Invoice a client in under 60 seconds.
          </h2>
        </div>

        <div
          className="hiw-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 24,
          }}
        >
          {steps.map((s, i) => (
            <div
              key={i}
              style={{
                background: i === 1 ? C.ink : C.surface,
                borderRadius: 16,
                padding: "36px 32px",
                border: `1px solid ${i === 1 ? "transparent" : C.border}`,
                position: "relative",
                boxShadow: i === 1 ? "0 20px 60px rgba(0,0,0,0.25)" : "none",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 24,
                  right: 24,
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 900,
                  fontSize: 52,
                  color: i === 1 ? `${C.accent}10` : "rgba(12,24,36,0.05)",
                  lineHeight: 1,
                }}
              >
                0{i + 1}
              </div>
              <div style={{ fontSize: 32, marginBottom: 16 }}>{s.icon}</div>
              <h3
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 800,
                  fontSize: 22,
                  color: i === 1 ? "#EEF6F8" : C.text,
                  margin: "0 0 10px",
                }}
              >
                {s.title}
              </h3>
              <p
                style={{
                  color: i === 1 ? "rgba(220,235,240,0.5)" : C.muted,
                  fontSize: 14,
                  lineHeight: 1.7,
                  margin: 0,
                }}
              >
                {s.desc}
              </p>
              {i === 1 && (
                <div
                  style={{
                    marginTop: 20,
                    display: "inline-block",
                    background: C.accent,
                    borderRadius: 6,
                    padding: "5px 14px",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#fff",
                  }}
                >
                  Most Popular Step
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   FEATURES
════════════════════════════════════════════════════════════════════════════ */
function Features({ config }) {
  const C = T(config);

  return (
    <section
      id="features"
      style={{
        background: C.surface,
        padding: "80px 24px",
        fontFamily: "'Barlow', sans-serif",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <Eyebrow accent={C.accent}>Features</Eyebrow>
          <h2
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 900,
              fontSize: "clamp(28px,4vw,46px)",
              color: C.text,
              margin: "0 0 12px",
              letterSpacing: -0.5,
            }}
          >
            Everything your {config.label.toLowerCase()} business needs
          </h2>
          <p
            style={{
              color: C.muted,
              fontSize: 15,
              maxWidth: 520,
              margin: "0 auto",
            }}
          >
            No unnecessary extras. Just the tools that matter for how you work.
          </p>
        </div>

        <div
          className="feat-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px,1fr))",
            gap: 18,
          }}
        >
          {config.features.map((f, i) => (
            <div
              key={i}
              style={{
                background: C.white,
                borderRadius: 14,
                padding: "24px 22px",
                border: `1px solid ${C.accent}22`,
                transition: "box-shadow .2s, transform .2s, border-color .2s",
                cursor: "default",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = `0 8px 32px ${C.accent}18`;
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.borderColor = `${C.accent}60`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = `${C.accent}22`;
              }}
            >
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 10,
                  background: C.accentL,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  marginBottom: 14,
                }}
              >
                {f.icon}
              </div>
              <h3
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 800,
                  fontSize: 18,
                  color: C.text,
                  margin: "0 0 6px",
                }}
              >
                {f.title}
              </h3>
              <p
                style={{
                  color: C.muted,
                  fontSize: 13,
                  lineHeight: 1.65,
                  margin: 0,
                }}
              >
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   PRICING
════════════════════════════════════════════════════════════════════════════ */
function Pricing({ config, onRegister }) {
  const C = T(config);

  return (
    <section
      id="pricing"
      style={{
        background: C.white,
        padding: "80px 24px",
        fontFamily: "'Barlow', sans-serif",
      }}
    >
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <Eyebrow accent={C.accent}>Pricing</Eyebrow>
          <h2
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 900,
              fontSize: "clamp(28px,4vw,46px)",
              color: C.text,
              margin: "0 0 12px",
              letterSpacing: -0.5,
            }}
          >
            Honest pricing. No surprises.
          </h2>
          <p style={{ color: C.muted, fontSize: 15 }}>
            Start free. Upgrade when you're ready. No hidden fees.
          </p>
        </div>

        <div
          className="pricing-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(270px,1fr))",
            gap: 20,
          }}
        >
          {config.pricing.map((plan, i) => (
            <div
              key={i}
              style={{
                borderRadius: 16,
                padding: "32px 28px",
                background: plan.highlight ? C.ink : C.surface,
                border: plan.highlight
                  ? `2px solid ${C.accent}`
                  : `1px solid ${C.border}`,
                display: "flex",
                flexDirection: "column",
                position: "relative",
                boxShadow: plan.highlight
                  ? "0 20px 60px rgba(0,0,0,0.28)"
                  : "none",
              }}
            >
              {plan.highlight && (
                <div
                  style={{
                    position: "absolute",
                    top: -14,
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: C.accent,
                    color: "#fff",
                    fontSize: 11,
                    fontWeight: 800,
                    padding: "5px 16px",
                    borderRadius: 99,
                    letterSpacing: "0.08em",
                    boxShadow: `0 4px 12px ${C.accent}55`,
                    whiteSpace: "nowrap",
                  }}
                >
                  MOST POPULAR
                </div>
              )}

              <div style={{ marginBottom: 20 }}>
                <p
                  style={{
                    color: plan.highlight ? `${C.accent}99` : C.accent,
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    margin: "0 0 6px",
                  }}
                >
                  {plan.name}
                </p>
                <div
                  style={{ display: "flex", alignItems: "baseline", gap: 4 }}
                >
                  <span
                    style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontWeight: 900,
                      fontSize: 40,
                      color: plan.highlight ? "#EEF6F8" : C.text,
                    }}
                  >
                    {plan.price}
                  </span>
                  <span
                    style={{
                      color: plan.highlight ? "rgba(220,235,240,0.4)" : C.muted,
                      fontSize: 14,
                    }}
                  >
                    {plan.period}
                  </span>
                </div>
                <p
                  style={{
                    color: plan.highlight ? "rgba(220,235,240,0.4)" : C.muted,
                    fontSize: 12,
                    margin: "4px 0 0",
                  }}
                >
                  {plan.desc}
                </p>
              </div>

              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: "0 0 28px",
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                {plan.features.map((f, j) => (
                  <li
                    key={j}
                    style={{
                      display: "flex",
                      gap: 10,
                      alignItems: "flex-start",
                    }}
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 20 20"
                      fill={C.accent}
                      style={{ flexShrink: 0, marginTop: 2 }}
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span
                      style={{
                        color: plan.highlight
                          ? "rgba(220,235,240,0.78)"
                          : C.text,
                        fontSize: 13,
                      }}
                    >
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                onClick={onRegister}
                style={{
                  background: plan.highlight ? C.accent : C.ink,
                  border: "none",
                  borderRadius: 10,
                  padding: "13px",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 14,
                  fontFamily: "'Barlow', sans-serif",
                  cursor: "pointer",
                  boxShadow: plan.highlight
                    ? `0 6px 20px ${C.accent}44`
                    : "none",
                  transition: "opacity .15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   TESTIMONIALS
════════════════════════════════════════════════════════════════════════════ */
function Testimonials({ config }) {
  const C = T(config);

  return (
    <section
      id="testimonials"
      style={{
        background: C.surface,
        padding: "80px 24px",
        fontFamily: "'Barlow', sans-serif",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <Eyebrow accent={C.accent}>Testimonials</Eyebrow>
          <h2
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 900,
              fontSize: "clamp(28px,4vw,46px)",
              color: C.text,
              margin: 0,
              letterSpacing: -0.5,
            }}
          >
            Trusted by {config.label.toLowerCase()} businesses across SA
          </h2>
        </div>

        <div
          className="test-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(290px,1fr))",
            gap: 20,
          }}
        >
          {config.testimonials.map((t, i) => (
            <div
              key={i}
              style={{
                background: C.white,
                borderRadius: 16,
                padding: "28px 24px",
                border: `1px solid ${C.accent}20`,
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              <div style={{ display: "flex", gap: 2 }}>
                {[...Array(5)].map((_, j) => (
                  <span key={j} style={{ color: C.accent, fontSize: 16 }}>
                    ★
                  </span>
                ))}
              </div>
              <p
                style={{
                  color: C.text,
                  fontSize: 14,
                  lineHeight: 1.75,
                  margin: 0,
                  flex: 1,
                  fontStyle: "italic",
                }}
              >
                "{t.quote}"
              </p>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  paddingTop: 12,
                  borderTop: `1px solid ${C.accent}18`,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: C.accentD || C.accent,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 800,
                    fontSize: 14,
                    color: "#fff",
                    flexShrink: 0,
                  }}
                >
                  {t.avatar}
                </div>
                <div>
                  <p
                    style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontWeight: 700,
                      fontSize: 15,
                      color: C.text,
                      margin: 0,
                    }}
                  >
                    {t.name}
                  </p>
                  <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>
                    {t.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats strip */}
        <div
          className="stats-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            background: C.ink,
            borderRadius: 16,
            marginTop: 48,
            overflow: "hidden",
          }}
        >
          {(
            config.stats || [
              ["100+", "Active users"],
              ["500+", "Billed monthly"],
              ["4.9/5", "App rating"],
              ["99.9%", "Uptime"],
            ]
          ).map(([v, l], i, arr) => (
            <div
              key={i}
              style={{
                padding: "28px 24px",
                textAlign: "center",
                borderRight:
                  i < arr.length - 1 ? `1px solid ${C.accent}18` : "none",
              }}
            >
              <div
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 900,
                  fontSize: 36,
                  color: C.accent,
                }}
              >
                {v}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "rgba(220,235,240,0.4)",
                  marginTop: 4,
                  fontFamily: "'Barlow', sans-serif",
                }}
              >
                {l}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   FAQ
════════════════════════════════════════════════════════════════════════════ */
function FAQ({ config }) {
  const [open, setOpen] = useState(null);
  const C = T(config);

  return (
    <section
      id="faq"
      style={{
        background: C.white,
        padding: "80px 24px",
        fontFamily: "'Barlow', sans-serif",
      }}
    >
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <Eyebrow accent={C.accent}>FAQ</Eyebrow>
          <h2
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 900,
              fontSize: "clamp(28px,4vw,46px)",
              color: C.text,
              margin: 0,
              letterSpacing: -0.5,
            }}
          >
            Common questions
          </h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {config.faqs.map((faq, i) => (
            <div
              key={i}
              style={{
                background: open === i ? C.accentL : C.surface,
                borderRadius: 12,
                overflow: "hidden",
                border: `1px solid ${open === i ? C.accent : C.border}`,
                transition: "border-color .2s, background .2s",
              }}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "18px 22px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  gap: 16,
                }}
              >
                <span
                  style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 700,
                    fontSize: 17,
                    color: C.text,
                  }}
                >
                  {faq.q}
                </span>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={C.accent}
                  strokeWidth="2.5"
                  style={{
                    flexShrink: 0,
                    transform: open === i ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform .2s",
                  }}
                >
                  <path d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {open === i && (
                <div
                  style={{
                    padding: "14px 22px 18px",
                    borderTop: `1px solid ${C.accent}28`,
                  }}
                >
                  <p
                    style={{
                      color: C.muted,
                      fontSize: 14,
                      lineHeight: 1.7,
                      margin: 0,
                    }}
                  >
                    {faq.a}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   CTA BANNER
════════════════════════════════════════════════════════════════════════════ */
function CTABanner({ config, onRegister }) {
  const C = T(config);

  return (
    <section
      style={{
        background: C.ink,
        padding: "80px 24px",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Barlow', sans-serif",
      }}
    >
      <DotGrid accent={C.accent} />
     

      <div
        style={{
          maxWidth: 680,
          margin: "0 auto",
          textAlign: "center",
          position: "relative",
        }}
      >
        <img src={google} alt="" />
        <h2
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 900,
            fontSize: "clamp(30px,5vw,54px)",
            color: "#EEF6F8",
            margin: "0 0 16px",
            letterSpacing: -0.5,
          }}
        >
          Your {config.label.toLowerCase()} business, running smarter.
        </h2>
        <p
          style={{
            color: "rgba(220,235,240,0.4)",
            fontSize: 16,
            margin: "0 0 36px",
          }}
        >
          Join hundreds of {config.label.toLowerCase()} businesses already using
          SolidFlo to invoice professionally and get paid faster.
        </p>

        <div
          style={{
            display: "flex",
            gap: 14,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={onRegister}
            style={{
              background: C.accent,
              border: "none",
              borderRadius: 12,
              padding: "16px 38px",
              color: "#fff",
              fontSize: 16,
              fontWeight: 800,
              fontFamily: "'Barlow Condensed', sans-serif",
              cursor: "pointer",
              letterSpacing: 0.5,
              boxShadow: `0 8px 28px ${C.accent}50`,
              transition: "transform .15s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "scale(1.03)")
            }
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            START FOR FREE
          </button>
          <button
            onClick={() => scrollTo("pricing")}
            style={{
              background: `${C.accent}14`,
              border: `1px solid ${C.accent}44`,
              borderRadius: 12,
              padding: "16px 28px",
              color: "rgba(220,235,240,0.75)",
              fontSize: 15,
              fontWeight: 600,
              fontFamily: "'Barlow', sans-serif",
              cursor: "pointer",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.borderColor = `${C.accent}88`)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.borderColor = `${C.accent}44`)
            }
          >
            See all plans →
          </button>
        </div>

        <p
          style={{
            color: "rgba(220,235,240,0.18)",
            fontSize: 12,
            marginTop: 20,
          }}
        >
          No credit card required · Free plan available forever · Cancel anytime
        </p>
      </div>
    </section>
  );
}

function Footer({ onLogin, onRegister }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  const cols = [
    {
      title: "Product",
      links: [
        "Features",
        "Pricing",
        "Cash Flow Dashboard",
        "Client Portal",
        "Reports",
      ],
    },
    {
      title: "Resources",
      links: ["Help Centre", "Video Guides", "Blog", "API Docs", "Community"],
    },
    {
      title: "Company",
      links: [
        "About SolidFlo",
        "Contact Us",
        "Privacy Policy",
        "Terms of Service",
        "Made in SA 🇿🇦",
      ],
    },
  ];

  return (
    <footer
      style={{
        background: "#040e0b",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        padding: isMobile ? "48px 20px 28px" : "56px 24px 32px",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile
              ? "1fr"
              : "2fr repeat(3, 1fr)",
            gap: isMobile ? 36 : 40,
            marginBottom: isMobile ? 36 : 48,
          }}
        >
          {/* Brand */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  background: "transparent",
                  width: 160,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                }}
              >
                <img src={logo} alt="" />
              </div>
            </div>
            <p
              style={{
                color: "rgba(255,255,255,0.3)",
                fontSize: 13,
                lineHeight: 1.7,
                fontFamily: "'Barlow', sans-serif",
                marginBottom: 20,
                maxWidth: isMobile ? "100%" : 220,
              }}
            >
              Professional invoicing software built specifically for South
              African accounting firms and practitioners.
            </p>
            <button
              onClick={onRegister}
              style={{
                background: C.green,
                border: "none",
                borderRadius: 8,
                padding: "10px 20px",
                color: C.white,
                fontSize: 13,
                fontWeight: 700,
                fontFamily: "'Barlow', sans-serif",
                cursor: "pointer",
              }}
            >
              Get started free
            </button>
          </div>

          {/* Link columns — 2-up on mobile so they don't all stack to one long column */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile
                ? "repeat(2, 1fr)"
                : "repeat(3, 1fr)",
              gap: isMobile ? "28px 16px" : 40,
              gridColumn: isMobile ? "auto" : "span 3",
            }}
          >
            {cols.map((col, i) => (
              <div key={i}>
                <p
                  style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 800,
                    fontSize: 14,
                    color: "rgba(255,255,255,0.5)",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    margin: "0 0 16px",
                  }}
                >
                  {col.title}
                </p>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 10 }}
                >
                  {col.links.map((l) => (
                    <a
                      key={l}
                      href="#"
                      style={{
                        color: "rgba(255,255,255,0.35)",
                        fontSize: 13,
                        fontFamily: "'Barlow', sans-serif",
                        textDecoration: "none",
                        transition: "color .15s",
                      }}
                      onMouseEnter={(e) => (e.target.style.color = C.white)}
                      onMouseLeave={(e) =>
                        (e.target.style.color = "rgba(255,255,255,0.35)")
                      }
                    >
                      {l}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.06)",
            paddingTop: 24,
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            justifyContent: "space-between",
            alignItems: isMobile ? "flex-start" : "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <p
            style={{
              color: "rgba(255,255,255,0.2)",
              fontSize: 12,
              fontFamily: "'Barlow', sans-serif",
              margin: 0,
            }}
          >
            © {new Date().getFullYear()} SolidFlo. All rights reserved.
          </p>
          <p
            style={{
              color: "rgba(255,255,255,0.2)",
              fontSize: 12,
              fontFamily: "'Barlow', sans-serif",
              margin: 0,
            }}
          >
            Proudly  African ·
          </p>
        </div>
      </div>
    </footer>
  );
}
/* ════════════════════════════════════════════════════════════════════════════
   MAIN
════════════════════════════════════════════════════════════════════════════ */
export default function SubdomainLandingPage() {
  const navigate = useNavigate();
  const { subdomain } = useSubdomain();
  const config = getIndustryConfig(subdomain);

  const goLogin = () => navigate("/login");
  const goRegister = () => {
  localStorage.setItem("pendingDashboardId", "hvac"); // use the real id
  navigate("/register?industry=hvac");
};

  return (
    <>
    <Helmet>
  <title>{config.metaTitle || `Invoicing Software for HVAC & Air Conditioning Businesses | SolidFlo`}</title>
  <meta
    name="description"
    content={
      config.metaDescription ||
      "Create job quotes, track parts and labour, and send VAT-compliant invoices in under 60 seconds. Built for African HVAC and air conditioning contractors. Free plan available, no credit card required."
    }
  />
  <link rel="canonical" href={`https://${subdomain}.solidflo.co.za/`} />

  {/* Open Graph */}
  <meta property="og:site_name" content="SolidFlo" />
  <meta
    property="og:title"
    content={config.metaTitle || `Invoicing Software for HVAC & Air Conditioning Businesses | SolidFlo`}
  />
  <meta
    property="og:description"
    content={
      config.metaDescription ||
      "Job quotes, parts tracking, and VAT invoicing — built for African HVAC and air conditioning contractors."
    }
  />
  <meta property="og:type" content="website" />
  <meta property="og:url" content={`https://${subdomain}.solidflo.co.za/`} />
  <meta property="og:image" content={`https://${subdomain}.solidflo.co.za/og-image.jpg`} />
  <meta property="og:locale" content="en_ZA" />

  {/* Twitter */}
  <meta name="twitter:card" content="summary_large_image" />
  <meta
    name="twitter:title"
    content={config.metaTitle || `Invoicing Software for HVAC & Air Conditioning Businesses | SolidFlo`}
  />
  <meta
    name="twitter:description"
    content={
      config.metaDescription ||
      "Job quotes and VAT invoicing — built for African HVAC contractors."
    }
  />
  <meta name="twitter:image" content={`https://${subdomain}.solidflo.co.za/og-image.jpg`} />

  {/* Structured data: software */}
  <script type="application/ld+json">
    {JSON.stringify({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": `SolidFlo for ${config.label || "HVAC"}`,
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web",
      "url": `https://${subdomain}.solidflo.co.za/`,
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "ZAR",
      },
      ...(config.ratingValue && config.ratingCount
        ? {
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": config.ratingValue,
              "ratingCount": config.ratingCount,
            },
          }
        : {}),
    })}
  </script>

  {/* Structured data: FAQ */}
  {config.faqs?.length > 0 && (
    <script type="application/ld+json">
      {JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": config.faqs.map((f) => ({
          "@type": "Question",
          "name": f.q,
          "acceptedAnswer": { "@type": "Answer", "text": f.a },
        })),
      })}
    </script>
  )}
</Helmet>
      <style>{fontStyle}</style>
      <style>{responsiveCSS}</style>
      <div style={{ minHeight: "100vh", fontFamily: "'Barlow', sans-serif" }}>
        <Navbar config={config} onLogin={goLogin} onRegister={goRegister} />
        <Hero config={config} onRegister={goRegister} />
        <HowItWorks config={config} />
        <Features config={config} />
        <Pricing config={config} onRegister={goRegister} />
        <Testimonials config={config} />
        <FAQ config={config} />
        <CTABanner config={config} onRegister={goRegister} />
        <Footer config={config} onLogin={goLogin} onRegister={goRegister} />
      </div>
    </>
  );
}
