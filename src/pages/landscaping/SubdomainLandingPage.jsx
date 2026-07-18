import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSubdomain } from "../../hooks/useSubdomain";
import { getIndustryConfig } from "../../config/industryConfig";
import logo from "../../assets/img/landscaping-logo.png";
import logotop from "../../assets/img/landscaping-logo-top.png";
import { HC, heroFontStyle } from "../../styles/landingTokens";
import google from "../../assets/google-play.png";
import Helmet from "react-helmet";
// ─── Google Fonts ─────────────────────────────────────────────────────────────
const fontStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&family=Barlow:wght@400;500;600&display=swap');
`;

// ─── Design Tokens ────────────────────────────────────────────────────────────
// Base palette — accent values are overridden per config
const base = {
  ink: "#111318",
  ink2: "#1C2028",
  surface: "#F6F2EE",
  white: "#FFFFFF",
  border: "#E4D8CC",
  text: "#1E2027",
  muted: "#8A7B6E",
};
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
// Derive runtime tokens from config.accent (hex)
function tokens(accent) {
  return {
    ...base,
    accent,
    accentD: shadeHex(accent, -30),
    accentL: hexAlpha(accent, 0.15),
    accentBorder: hexAlpha(accent, 0.3),
  };
}

// Tiny hex helpers — no deps
function hexAlpha(hex, a) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

function shadeHex(hex, pct) {
  const clamp = (v) => Math.max(0, Math.min(255, v));
  const r = clamp(parseInt(hex.slice(1, 3), 16) + pct);
  const g = clamp(parseInt(hex.slice(3, 5), 16) + pct);
  const b = clamp(parseInt(hex.slice(5, 7), 16) + pct);
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
}

// ─── Scroll helper ────────────────────────────────────────────────────────────
const scrollTo = (id) =>
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

// ─── Noise Texture ────────────────────────────────────────────────────────────
function NoiseTile({ opacity = 0.04 }) {
  return (
    <svg
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        opacity,
      }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <filter id="noise">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.72"
          numOctaves="4"
          stitchTiles="stitch"
        />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#noise)" />
    </svg>
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
            <img src={logotop} alt="SolidFlo" style={{ maxWidth: "100%" }} />
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

// ─── Hero (restyled to match construction-style framed hero) ─────────────────
function Hero({ config, C, onRegister }) {
  return (
    <section
      style={{
        background: base.cream,
        padding: "80px 24px 96px",
        position: "relative",
        overflow: "hidden",
        minHeight: "92vh",
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
          background: `radial-gradient(ellipse 70% 60% at 15% 30%, rgba(99,102,241,.08) 0%, transparent 60%), radial-gradient(ellipse 60% 70% at 90% 15%, ${hexAlpha(C.accent, 0.14)} 0%, transparent 55%)`,
          pointerEvents: "none",
        }}
      />

      {/* Framed "device" container */}
      <div
        style={{
          maxWidth: 860,
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
            background: hexAlpha(C.accent, 0.1),
            border: `1px solid ${hexAlpha(C.accent, 0.28)}`,
            borderRadius: 99,
            padding: "5px 16px",
            marginBottom: 24,
          }}
        >
          <span style={{ fontSize: 14 }}>{config.icon}</span>
          <span
            style={{
              color: C.accent,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.06em",
              fontFamily: "'Lato', sans-serif",
            }}
          >
            Built for {config.label} Businesses
          </span>
        </div>

        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 700,
            fontSize: "clamp(2.4rem, 6vw, 4rem)",
            lineHeight: 1.1,
            color: base.navy,
            margin: "0 0 22px",
          }}
        >
          {config.headline}
        </h1>

        <p
          style={{
            color: base.textMid,
            fontSize: 18,
            lineHeight: 1.7,
            margin: "0 auto 40px",
            maxWidth: 560,
            fontFamily: "'Lato', sans-serif",
          }}
        >
          {config.subheadline}
        </p>

        <div
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "center",
            flexWrap: "wrap",
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
              color: base.white,
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
              border: `1.5px solid ${base.creamDark}`,
              borderRadius: 4,
              color: base.navy,
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              fontFamily: "'Lato', sans-serif",
              cursor: "pointer",
              transition: "border-color .15s, background .15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = base.navy;
              e.currentTarget.style.background = base.creamMid;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = base.creamDark;
              e.currentTarget.style.background = "transparent";
            }}
          >
            See How It Works
          </button>
        </div>

        {/* Trust row */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 24,
            marginTop: 32,
            justifyContent: "center",
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
                color: base.textMuted,
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
    </section>
  );
}
// ─── Layer Divider ────────────────────────────────────────────────────────────
function LayDivider({ C }) {
  return (
    <div
      style={{
        background: base.surface,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        padding: "20px 24px",
      }}
    >
      <div
        style={{
          height: 1,
          flex: 1,
          background: `linear-gradient(to right, transparent, ${hexAlpha(C.accent, 0.3)})`,
        }}
      />
      <span style={{ color: C.accent, fontSize: 14 }}>✦</span>
      <div
        style={{
          height: 1,
          flex: 1,
          background: `linear-gradient(to left, transparent, ${hexAlpha(C.accent, 0.3)})`,
        }}
      />
    </div>
  );
}

// ─── Features ─────────────────────────────────────────────────────────────────
function Features({ config, C }) {
  return (
    <section
      id="features"
      style={{ background: base.surface, padding: "80px 24px" }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <p
            style={{
              color: C.accent,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 3,
              textTransform: "uppercase",
              fontFamily: "'Barlow', sans-serif",
              marginBottom: 10,
            }}
          >
            Features
          </p>
          <h2
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 900,
              fontSize: "clamp(28px,4vw,46px)",
              color: base.ink,
              margin: "0 0 12px",
              letterSpacing: -0.5,
            }}
          >
            Everything your {config.label.toLowerCase()} business needs
          </h2>
          <p
            style={{
              color: base.muted,
              fontSize: 15,
              maxWidth: 520,
              margin: "0 auto",
              fontFamily: "'Barlow', sans-serif",
            }}
          >
            No bloat. No irrelevant features. Just what your business actually
            uses every day.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 18,
          }}
        >
          {config.features.map((f, i) => (
            <div
              key={i}
              style={{
                background: base.white,
                borderRadius: 14,
                padding: "24px 22px",
                border: `1px solid ${hexAlpha(C.accent, 0.15)}`,
                transition: "box-shadow .2s, transform .2s, border-color .2s",
                cursor: "default",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = `0 8px 32px ${hexAlpha(C.accent, 0.12)}`;
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.borderColor = hexAlpha(C.accent, 0.45);
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = hexAlpha(C.accent, 0.15);
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
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
                  color: base.ink,
                  margin: "0 0 6px",
                }}
              >
                {f.title}
              </h3>
              <p
                style={{
                  color: base.muted,
                  fontSize: 13,
                  lineHeight: 1.65,
                  margin: 0,
                  fontFamily: "'Barlow', sans-serif",
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

// ─── Pricing ──────────────────────────────────────────────────────────────────
function Pricing({ config, C, onRegister }) {
  return (
    <section
      id="pricing"
      style={{ background: base.white, padding: "80px 24px" }}
    >
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <p
            style={{
              color: C.accent,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 3,
              textTransform: "uppercase",
              fontFamily: "'Barlow', sans-serif",
              marginBottom: 10,
            }}
          >
            Pricing
          </p>
          <h2
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 900,
              fontSize: "clamp(28px,4vw,46px)",
              color: base.ink,
              margin: "0 0 12px",
              letterSpacing: -0.5,
            }}
          >
            Honest pricing. No surprises.
          </h2>
          <p
            style={{
              color: base.muted,
              fontSize: 15,
              fontFamily: "'Barlow', sans-serif",
            }}
          >
            Start free. Upgrade when your business is ready to grow.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))",
            gap: 20,
          }}
        >
          {config.pricing.map((plan, i) => (
            <div
              key={i}
              style={{
                borderRadius: 16,
                padding: "32px 28px",
                background: plan.highlight ? base.ink : base.surface,
                border: plan.highlight
                  ? `2px solid ${C.accent}`
                  : `1px solid ${base.border}`,
                display: "flex",
                flexDirection: "column",
                position: "relative",
                boxShadow: plan.highlight
                  ? "0 20px 60px rgba(17,19,24,0.35)"
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
                    color: base.white,
                    fontSize: 11,
                    fontWeight: 800,
                    padding: "5px 16px",
                    borderRadius: 99,
                    fontFamily: "'Barlow', sans-serif",
                    letterSpacing: "0.08em",
                    boxShadow: `0 4px 12px ${hexAlpha(C.accent, 0.4)}`,
                    whiteSpace: "nowrap",
                  }}
                >
                  MOST POPULAR
                </div>
              )}

              <div style={{ marginBottom: 20 }}>
                <p
                  style={{
                    color: plan.highlight ? "rgba(246,238,228,0.5)" : C.accent,
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    margin: "0 0 6px",
                    fontFamily: "'Barlow', sans-serif",
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
                      color: plan.highlight ? "#F6EEE4" : base.ink,
                    }}
                  >
                    {plan.price}
                  </span>
                  <span
                    style={{
                      color: plan.highlight
                        ? "rgba(246,238,228,0.4)"
                        : base.muted,
                      fontSize: 14,
                      fontFamily: "'Barlow', sans-serif",
                    }}
                  >
                    {plan.period}
                  </span>
                </div>
                <p
                  style={{
                    color: plan.highlight
                      ? "rgba(246,238,228,0.4)"
                      : base.muted,
                    fontSize: 12,
                    margin: "4px 0 0",
                    fontFamily: "'Barlow', sans-serif",
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
                          ? "rgba(246,238,228,0.75)"
                          : base.text,
                        fontSize: 13,
                        fontFamily: "'Barlow', sans-serif",
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
                  background: plan.highlight ? C.accent : base.ink,
                  border: "none",
                  borderRadius: 10,
                  padding: "12px",
                  color: plan.highlight ? base.white : "#F6EEE4",
                  fontWeight: 700,
                  fontSize: 14,
                  fontFamily: "'Barlow', sans-serif",
                  cursor: "pointer",
                  boxShadow: plan.highlight
                    ? `0 6px 20px ${hexAlpha(C.accent, 0.35)}`
                    : "none",
                  transition: "opacity .2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
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

// ─── Testimonials ─────────────────────────────────────────────────────────────
function Testimonials({ config, C }) {
  return (
    <section
      id="testimonials"
      style={{ background: base.surface, padding: "80px 24px" }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <p
            style={{
              color: C.accent,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 3,
              textTransform: "uppercase",
              fontFamily: "'Barlow', sans-serif",
              marginBottom: 10,
            }}
          >
            Testimonials
          </p>
          <h2
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 900,
              fontSize: "clamp(28px,4vw,46px)",
              color: base.ink,
              margin: 0,
              letterSpacing: -0.5,
            }}
          >
            Trusted by {config.label.toLowerCase()} businesses across SA
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))",
            gap: 20,
          }}
        >
          {config.testimonials.map((t, i) => (
            <div
              key={i}
              style={{
                background: base.white,
                borderRadius: 16,
                padding: "28px 24px",
                border: `1px solid ${hexAlpha(C.accent, 0.15)}`,
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
                  color: base.text,
                  fontSize: 14,
                  lineHeight: 1.75,
                  fontFamily: "'Barlow', sans-serif",
                  margin: 0,
                  flex: 1,
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
                  borderTop: `1px solid ${hexAlpha(C.accent, 0.12)}`,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: C.accentD,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 800,
                    fontSize: 14,
                    color: base.white,
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
                      color: base.ink,
                      margin: 0,
                    }}
                  >
                    {t.name}
                  </p>
                  <p
                    style={{
                      fontFamily: "'Barlow', sans-serif",
                      fontSize: 12,
                      color: base.muted,
                      margin: 0,
                    }}
                  >
                    {t.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────
function FAQ({ config, C }) {
  const [open, setOpen] = useState(null);

  return (
    <section id="faq" style={{ background: base.white, padding: "80px 24px" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <p
            style={{
              color: C.accent,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 3,
              textTransform: "uppercase",
              fontFamily: "'Barlow', sans-serif",
              marginBottom: 10,
            }}
          >
            FAQ
          </p>
          <h2
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 900,
              fontSize: "clamp(28px,4vw,46px)",
              color: base.ink,
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
                background: open === i ? C.accentL : base.surface,
                borderRadius: 12,
                border: `1px solid ${open === i ? C.accent : base.border}`,
                overflow: "hidden",
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
                    color: base.ink,
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
                    padding: "0 22px 18px",
                    borderTop: `1px solid ${hexAlpha(C.accent, 0.2)}`,
                    paddingTop: 14,
                  }}
                >
                  <p
                    style={{
                      color: base.muted,
                      fontSize: 14,
                      lineHeight: 1.7,
                      margin: 0,
                      fontFamily: "'Barlow', sans-serif",
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

// ─── CTA Banner ───────────────────────────────────────────────────────────────
function CTABanner({ config, C, onRegister }) {
  return (
    <section
      style={{
        background: base.ink,
        padding: "80px 24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <NoiseTile opacity={0.04} />
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
            fontSize: "clamp(28px,4vw,52px)",
            color: "#F6EEE4",
            margin: "0 0 16px",
            letterSpacing: -0.5,
          }}
        >
          Ready to get paid faster?
        </h2>
        <p
          style={{
            color: "rgba(246,238,228,0.4)",
            fontSize: 16,
            margin: "0 0 36px",
            fontFamily: "'Barlow', sans-serif",
          }}
        >
          Join hundreds of {config.label.toLowerCase()} businesses already using
          SolidFlo to quote professionally and get paid on time.
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
              padding: "16px 36px",
              color: base.white,
              fontSize: 16,
              fontWeight: 800,
              fontFamily: "'Barlow Condensed', sans-serif",
              cursor: "pointer",
              letterSpacing: 0.5,
              boxShadow: `0 8px 28px ${hexAlpha(C.accent, 0.45)}`,
            }}
          >
            {config.cta.toUpperCase()}
          </button>
          <button
            onClick={() => scrollTo("pricing")}
            style={{
              background: hexAlpha(C.accent, 0.1),
              border: `1px solid ${hexAlpha(C.accent, 0.3)}`,
              borderRadius: 12,
              padding: "16px 28px",
              color: "rgba(246,238,228,0.7)",
              fontSize: 15,
              fontWeight: 600,
              fontFamily: "'Barlow', sans-serif",
              cursor: "pointer",
            }}
          >
            See all plans →
          </button>
        </div>
        <p
          style={{
            color: "rgba(246,238,228,0.2)",
            fontSize: 12,
            marginTop: 20,
            fontFamily: "'Barlow', sans-serif",
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
// ─── Main page ────────────────────────────────────────────────────────────────
export default function SubdomainLandingPage() {
  const navigate = useNavigate();
  const { subdomain } = useSubdomain();
  const config = getIndustryConfig(subdomain);

  // Build runtime color tokens from the config's accent colour
  const C = tokens(config.accent);

  const goLogin = () => navigate("/login");
  const goRegister = () => {
  localStorage.setItem("pendingDashboardId", "landscaping"); // use the real id
  navigate("/register?industry=landscaping");
};

  return (
    <>
    <Helmet>
  <title>{config.metaTitle || `Quoting & Invoicing Software for Landscaping Businesses | SolidFlo`}</title>
  <meta
    name="description"
    content={
      config.metaDescription ||
      "Send professional quotes, track materials and crew labour, and get paid faster. Built for African landscaping and garden services businesses. Free plan available, no credit card required."
    }
  />
  <link rel="canonical" href={`https://${subdomain}.solidflo.co.za/`} />

  {/* Open Graph */}
  <meta property="og:site_name" content="SolidFlo" />
  <meta
    property="og:title"
    content={config.metaTitle || `Quoting & Invoicing Software for Landscaping Businesses | SolidFlo`}
  />
  <meta
    property="og:description"
    content={
      config.metaDescription ||
      "Quotes, material tracking, and invoicing built for African landscaping businesses."
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
    content={config.metaTitle || `Quoting & Invoicing Software for Landscaping Businesses | SolidFlo`}
  />
  <meta
    name="twitter:description"
    content={
      config.metaDescription ||
      "Quotes and invoicing — built for African landscaping businesses."
    }
  />
  <meta name="twitter:image" content={`https://${subdomain}.solidflo.co.za/og-image.jpg`} />

  {/* Structured data: software */}
  <script type="application/ld+json">
    {JSON.stringify({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": `SolidFlo for ${config.label || "Landscaping"}`,
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web",
      "url": `https://${subdomain}.solidflo.co.za/`,
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "ZAR"
      },
      ...(config.ratingValue && config.ratingCount
        ? {
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": config.ratingValue,
              "ratingCount": config.ratingCount
            }
          }
        : {})
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
          "acceptedAnswer": { "@type": "Answer", "text": f.a }
        }))
      })}
    </script>
  )}
</Helmet>
      <style>{fontStyle}</style>
      <div style={{ minHeight: "100vh", fontFamily: "'Barlow', sans-serif" }}>
        <Navbar
          config={config}
          C={C}
          onLogin={goLogin}
          onRegister={goRegister}
        />
        <Hero config={config} C={C} onRegister={goRegister} />
        <LayDivider C={C} />
        <Features config={config} C={C} />
        <Pricing config={config} C={C} onRegister={goRegister} />
        <Testimonials config={config} C={C} />
        <FAQ config={config} C={C} />
        <CTABanner config={config} C={C} onRegister={goRegister} />
        <Footer
          config={config}
          C={C}
          onLogin={goLogin}
          onRegister={goRegister}
        />
      </div>
    </>
  );
}
