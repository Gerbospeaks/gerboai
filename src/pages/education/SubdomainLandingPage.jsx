import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import heroVideo from "../../assets/videos/education.mp4";
import { useSubdomain } from "../../hooks/useSubdomain";
import { getIndustryConfig } from "../../config/industryConfig";
import logo from "../../assets/img/educare-logo.png";
import logotop from "../../assets/img/educare-logo-top.png";
import { HC, heroFontStyle } from "../../styles/landingTokens";
import google from "../../assets/google-play.png";
import Helmet from "react-helmet";
const fontStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&family=Barlow:wght@400;500;600;700&display=swap');
`;

/* ─── Design tokens ─────────────────────────────────────────────────────── */
const T = {
  white: "#FFFFFF",
  bg: "#F7F9FC", // Zoho-style off-white page bg
  bgAlt: "#EEF3FB", // subtle blue-tinted alternate section
  border: "#DDE3EE",
  borderL: "#E8ECF4",
  text: "#1B2A3D",
  sub: "#4A5568",
  muted: "#718096",
  shadow: "rgba(27,42,61,0.07)",
};

/* ─── Scroll helper ─────────────────────────────────────────────────────── */
const scrollTo = (id) =>
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

/* ─── Chip / pill ───────────────────────────────────────────────────────── */
function Chip({ children, accent }) {
  return (
    <span
      style={{
        display: "inline-block",
        background: `${accent}14`,
        border: `1px solid ${accent}30`,
        color: accent,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        padding: "4px 12px",
        borderRadius: 4,
        fontFamily: "'Barlow', sans-serif",
      }}
    >
      {children}
    </span>
  );
}

/* ─── Section header ────────────────────────────────────────────────────── */
function SectionHead({ overline, title, sub, accent, center = true }) {
  return (
    <div style={{ textAlign: center ? "center" : "left", marginBottom: 48 }}>
      <Chip accent={accent}>{overline}</Chip>
      <h2
        style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 900,
          fontSize: "clamp(26px,3.5vw,42px)",
          color: T.text,
          margin: "12px 0 10px",
          letterSpacing: "-0.3px",
          lineHeight: 1.1,
        }}
      >
        {title}
      </h2>
      {sub && (
        <p
          style={{
            color: T.muted,
            fontSize: 15,
            lineHeight: 1.7,
            maxWidth: 540,
            margin: center ? "0 auto" : 0,
            fontFamily: "'Barlow', sans-serif",
          }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

/* ─── MockInvoice (unchanged logic, restyled) ───────────────────────────── */
function MockInvoice({ config }) {
  const lineItems = config.mockLineItems || [
    {
      desc: "Term 1 – Tuition Fee",
      qty: 1,
      unit: "R2 200.00",
      total: "R2 200.00",
    },
    { desc: "Activity Programme", qty: 1, unit: "R380.00", total: "R380.00" },
    { desc: "School Meal Plan", qty: 1, unit: "R650.00", total: "R650.00" },
    { desc: "Admin & Resources", qty: 1, unit: "R250.00", total: "R250.00" },
  ];
  const subtotal = config.mockSubtotal || "R3 480.00";
  const vat = config.mockVat || "R522.00";
  const total = config.mockTotal || "R4 002.00";
  const refNo = config.mockRef || "INV-0042";
  const bizName = config.mockBizName || `${config.label} Centre`;

  return (
    <div
      style={{
        background: T.white,
        borderRadius: 12,
        border: `1px solid ${T.border}`,
        overflow: "hidden",
        fontFamily: "'Barlow', sans-serif",
        width: "100%",
        maxWidth: 480,
        boxShadow: `0 20px 60px ${T.shadow}`,
      }}
    >
      {/* Chrome bar */}
      <div
        style={{
          background: "#F1F5F9",
          padding: "9px 14px",
          display: "flex",
          alignItems: "center",
          gap: 5,
        }}
      >
        {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
          <span
            key={c}
            style={{
              width: 11,
              height: 11,
              borderRadius: "50%",
              background: c,
              display: "inline-block",
            }}
          />
        ))}
        <div
          style={{
            flex: 1,
            background: T.white,
            borderRadius: 4,
            height: 20,
            margin: "0 10px",
            display: "flex",
            alignItems: "center",
            paddingLeft: 9,
          }}
        >
          <span style={{ fontSize: 10, color: T.muted }}>
            solidflo.co.za/invoice/{refNo}
          </span>
        </div>
      </div>

      {/* Header */}
      <div
        style={{
          padding: "18px 22px 14px",
          borderBottom: `2px solid ${config.accent}`,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <img src={logotop} width={72} alt="" style={{ marginBottom: 5 }} />
            <p style={{ fontSize: 11, color: T.muted, margin: 0 }}>{bizName}</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <span
              style={{
                background: "#DCFCE7",
                color: "#16A34A",
                fontSize: 10,
                fontWeight: 700,
                padding: "2px 9px",
                borderRadius: 3,
              }}
            >
              PAID
            </span>
            <p
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 800,
                fontSize: 18,
                color: config.color,
                margin: "5px 0 0",
              }}
            >
              {refNo}
            </p>
            <p style={{ fontSize: 10, color: T.muted, margin: 0 }}>
              Issued 28 Mar 2025
            </p>
          </div>
        </div>
      </div>

      {/* Line items */}
      <div style={{ padding: "0 22px" }}>
        <table
          style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}
        >
          <thead>
            <tr style={{ borderBottom: `1px solid ${T.borderL}` }}>
              {["Description", "Qty", "Unit", "Total"].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "9px 0 7px",
                    color: T.muted,
                    fontWeight: 600,
                    textAlign: h === "Description" ? "left" : "right",
                    fontSize: 10,
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lineItems.map((r, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${T.borderL}` }}>
                <td style={{ padding: "8px 0", color: T.text }}>{r.desc}</td>
                <td
                  style={{
                    padding: "8px 0",
                    textAlign: "right",
                    color: T.muted,
                  }}
                >
                  {r.qty}
                </td>
                <td
                  style={{
                    padding: "8px 0",
                    textAlign: "right",
                    color: T.muted,
                  }}
                >
                  {r.unit}
                </td>
                <td
                  style={{
                    padding: "8px 0",
                    textAlign: "right",
                    fontWeight: 600,
                    color: config.color,
                  }}
                >
                  {r.total}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div
        style={{
          padding: "10px 22px 18px",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 4,
        }}
      >
        {[
          ["Subtotal", subtotal],
          ["VAT (15%)", vat],
        ].map(([l, v]) => (
          <div key={l} style={{ display: "flex", gap: 28, fontSize: 11 }}>
            <span style={{ color: T.muted }}>{l}</span>
            <span style={{ color: T.text, minWidth: 72, textAlign: "right" }}>
              {v}
            </span>
          </div>
        ))}
        <div
          style={{
            display: "flex",
            gap: 28,
            background: config.color,
            borderRadius: 6,
            padding: "5px 12px",
            marginTop: 5,
          }}
        >
          <span
            style={{
              color: "rgba(255,255,255,0.7)",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            Total Due
          </span>
          <span
            style={{
              color: T.white,
              fontWeight: 800,
              fontSize: 14,
              minWidth: 72,
              textAlign: "right",
            }}
          >
            {total}
          </span>
        </div>
      </div>
    </div>
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

/* ─── Hero (education, restyled to match construction-style framed hero) ── */
function Hero({ config, onRegister }) {
  const stats = config.heroStats || [
    ["500+", "Schools"],
    ["98%", "Satisfaction"],
    ["< 60s", "Invoice time"],
  ];
  const trustedBy = config.trustedBy || [
    "Edu-Stars Academy",
    "Sunrise Learning Centre",
    "BrightPath Pre-Primary",
    "Cape Town Tuition Hub",
  ];

  return (
    <section
      style={{
        background: config.cream || T.cream,
        padding: "72px 24px 96px",
        position: "relative",
        overflow: "hidden",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <style>{heroFontStyle}</style>

      {/* Ambient glow, tinted with accent */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 70% 60% at 15% 30%, rgba(99,102,241,.08) 0%, transparent 60%), radial-gradient(ellipse 60% 70% at 90% 15%, ${config.accent}14 0%, transparent 55%)`,
          pointerEvents: "none",
        }}
      />

      {/* Framed "device" container */}
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          position: "relative",
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 60,
          flexWrap: "wrap",
          border: "1px solid rgba(15,23,42,0.08)",
          borderRadius: 32,
          padding: "56px 56px",
          background: "rgba(255,255,255,0.6)",
          backdropFilter: "blur(6px)",
          boxShadow:
            "0 1px 0 rgba(255,255,255,0.6) inset, 0 24px 60px rgba(15,23,42,0.10), 0 4px 16px rgba(15,23,42,0.06)",
        }}
      >
        {/* Left */}
        <div style={{ flex: "1 1 420px" }}>
          {/* Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: `${config.accent}1A`,
              border: `1px solid ${config.accent}48`,
              borderRadius: 99,
              padding: "6px 14px",
              marginBottom: 28,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: config.accent,
                display: "inline-block",
              }}
            />
            <span
              style={{
                color: config.accent,
                fontSize: 12,
                fontWeight: 700,
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
              fontSize: "clamp(2.6rem, 5vw, 4.2rem)",
              lineHeight: 1.1,
              color: config.navy || T.navy,
              margin: "0 0 24px",
            }}
          >
            {config.headline}
          </h1>

          <p
            style={{
              color: config.textMid || T.textMid,
              fontSize: "clamp(1rem, 2vw, 1.2rem)",
              lineHeight: 1.7,
              margin: "0 0 40px",
              fontFamily: "'Lato', sans-serif",
              maxWidth: 480,
            }}
          >
            {config.subheadline}
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 40 }}>
            <button
              onClick={onRegister}
              style={{
                height: 52,
                padding: "0 32px",
                background: config.accent,
                border: "none",
                borderRadius: 4,
                color: T.white,
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
              {config.cta || "Start for Free"}
            </button>
            <button
              onClick={() => scrollTo("features")}
              style={{
                height: 52,
                padding: "0 28px",
                background: "transparent",
                border: `1.5px solid ${config.creamDark || T.creamDark}`,
                borderRadius: 4,
                color: config.navy || T.navy,
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                fontFamily: "'Lato', sans-serif",
                cursor: "pointer",
                transition: "border-color .15s, background .15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = config.navy || T.navy;
                e.currentTarget.style.background = config.creamMid || T.creamMid;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = config.creamDark || T.creamDark;
                e.currentTarget.style.background = "transparent";
              }}
            >
              Explore Features
            </button>
          </div>

         
        </div>

        {/* Right: Invoice preview */}
        <div style={{ flex: "1 1 340px", display: "flex", justifyContent: "center" }}>
          <div style={{ position: "relative" }}>
            <div
              style={{
                position: "absolute",
                top: -18,
                right: -18,
                zIndex: 2,
                background: "#16A34A",
                color: T.white,
                borderRadius: 10,
                padding: "8px 14px",
                fontSize: 12,
                fontWeight: 700,
                fontFamily: "'Lato', sans-serif",
                boxShadow: "0 8px 20px rgba(22,163,74,0.35)",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span>💰</span> Payment received!
            </div>
            <MockInvoice config={config} />
           
          </div>
        </div>
      </div>

      {/* Trusted-by strip below the frame */}
      <div
        style={{
          maxWidth: 1200,
          margin: "40px auto 0",
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
            color: config.textMuted || T.textMuted,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            fontFamily: "'Lato', sans-serif",
          }}
        >
          Trusted by SA schools
        </span>
        {trustedBy.map((b) => (
          <span
            key={b}
            style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 600,
              fontSize: 15,
              color: config.textMuted || T.textMuted,
            }}
          >
            {b}
          </span>
        ))}
      </div>
    </section>
  );
}
/* ─── How It Works ── horizontal steps (Zoho style) ────────────────────── */
function HowItWorks({ config }) {
  const steps = config.howItWorks || [
    {
      icon: "📋",
      title: "Create a Job Card",
      desc: "Log client details and work required. Add parts, services and your rates.",
    },
    {
      icon: "📩",
      title: "Send the Invoice",
      desc: "One tap sends a professional VAT invoice via email, SMS or WhatsApp.",
    },
    {
      icon: "💳",
      title: "Get Paid Instantly",
      desc: "Clients pay via EFT or card. You're notified the moment funds arrive.",
    },
  ];

  return (
    <section
      style={{
        background: T.white,
        padding: "80px 28px",
        borderBottom: `1px solid ${T.border}`,
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <SectionHead
          overline="How It Works"
          accent={config.accent}
          title="Invoice in 60 seconds, flat."
          sub="Three simple steps from job to payment — no accounting degree required."
        />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px,1fr))",
            gap: 0,
            position: "relative",
          }}
        >
          {steps.map((s, i) => (
            <div
              key={i}
              style={{
                padding: "32px 28px",
                position: "relative",
                borderLeft: i > 0 ? `1px solid ${T.border}` : "none",
              }}
            >
              {/* Step number */}
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background:
                    i === 0 ? config.color : i === 1 ? config.accent : T.bg,
                  border: `2px solid ${i === 2 ? T.border : "transparent"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 900,
                  fontSize: 15,
                  color: i === 2 ? T.muted : T.white,
                  marginBottom: 18,
                  flexShrink: 0,
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </div>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{s.icon}</div>
              <h3
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 800,
                  fontSize: 20,
                  color: T.text,
                  margin: "0 0 8px",
                }}
              >
                {s.title}
              </h3>
              <p
                style={{
                  color: T.muted,
                  fontSize: 14,
                  lineHeight: 1.7,
                  margin: 0,
                  fontFamily: "'Barlow', sans-serif",
                }}
              >
                {s.desc}
              </p>
              {/* Connector arrow */}
              {i < steps.length - 1 && (
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    right: -14,
                    transform: "translateY(-50%)",
                    width: 28,
                    height: 28,
                    background: T.white,
                    border: `1px solid ${T.border}`,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1,
                    fontSize: 12,
                    color: T.muted,
                  }}
                >
                  →
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Dashboard Features ── Zoho-style tabbed platform showcase ─────────── */
function DashboardFeatures({ config, onRegister }) {
  const [activeTab, setActiveTab] = useState("all");

  const allFeatures = config.dashboardFeatures || [
    {
      category: "academic",
      icon: "📋",
      title: "Report Cards",
      desc: "Generate and share professional learner report cards in seconds. Attach grades, comments and certificates automatically.",
      tags: ["PDF export", "Templates"],
    },
    {
      category: "academic",
      icon: "✏️",
      title: "Assessments",
      desc: "Create and manage tests, assignments and formative assessments. Track performance by subject, term and learner over time.",
      tags: ["Grade tracking", "Term summaries"],
    },
    {
      category: "academic",
      icon: "📚",
      title: "Curriculum Manager",
      desc: "Align lesson plans to your curriculum. Organise by grade, subject and term with a clear visual planner.",
      tags: ["CAPS-aligned", "Lesson plans"],
    },
    {
      category: "academic",
      icon: "📖",
      title: "Homework Tracker",
      desc: "Set and track homework per class or subject. Parents and learners see due dates, status and feedback in one place.",
      tags: ["Due date alerts", "Parent view"],
    },
    {
      category: "academic",
      icon: "🗓️",
      title: "Timetable",
      desc: "Build and publish class timetables for staff and students. Drag-and-drop scheduling with automatic clash detection.",
      tags: ["Clash detection", "Printable PDF"],
    },
    {
      category: "academic",
      icon: "📕",
      title: "Library",
      desc: "Manage your school library digitally. Track checkouts, returns and overdue items with per-learner borrowing history.",
      tags: ["Book catalogue", "Borrowing log"],
    },
    {
      category: "admin",
      icon: "🏫",
      title: "School Overview",
      desc: "A live dashboard showing enrolment numbers, today's attendance rate, outstanding fees and upcoming events at a glance.",
      tags: ["Live stats", "At-a-glance"],
    },
    {
      category: "admin",
      icon: "👩‍🎓",
      title: "Student Profiles",
      desc: "Detailed profiles per learner — contact info, medical notes, previous reports and full attendance history.",
      tags: ["Medical notes", "Full history"],
    },
    {
      category: "admin",
      icon: "👩‍🏫",
      title: "Staff Management",
      desc: "Onboard and manage all staff. Store qualifications, class assignments and payroll details securely in one place.",
      tags: ["Qualifications", "Class roster"],
    },
    {
      category: "admin",
      icon: "✅",
      title: "Attendance Register",
      desc: "Take daily or per-period attendance on any device. Flag absenteeism trends and generate SACE-ready reports.",
      tags: ["Per-period", "Absence alerts"],
    },
    {
      category: "communication",
      icon: "📢",
      title: "School Notices",
      desc: "Publish notices to specific grades or the whole school. Parents get instant WhatsApp or email notifications — no app required.",
      tags: ["WhatsApp delivery", "Targeted"],
    },
    {
      category: "communication",
      icon: "📅",
      title: "Events Calendar",
      desc: "Create and publish events, sport days, exams and parent evenings. Sync to parent calendars with automated reminders.",
      tags: ["Calendar sync", "Reminders"],
    },
    {
      category: "compliance",
      icon: "🛡️",
      title: "Documents & Compliance",
      desc: "Store SACE certificates, POPI consents, inspection reports and policies. Expiry reminders so nothing lapses.",
      tags: ["POPI compliant", "Expiry alerts"],
    },
    {
      category: "compliance",
      icon: "🏅",
      title: "Certificates & Awards",
      desc: "Generate achievement and completion certificates branded with your school logo. Bulk print in one click.",
      tags: ["Auto-branded", "Bulk print"],
    },
  ];

  const tabs = [
    { key: "all", label: "All", count: allFeatures.length },
    {
      key: "admin",
      label: "Administration",
      count: allFeatures.filter((f) => f.category === "admin").length,
    },
    {
      key: "academic",
      label: "Academic",
      count: allFeatures.filter((f) => f.category === "academic").length,
    },
    {
      key: "communication",
      label: "Communication",
      count: allFeatures.filter((f) => f.category === "communication").length,
    },
    {
      key: "compliance",
      label: "Compliance",
      count: allFeatures.filter((f) => f.category === "compliance").length,
    },
  ];

  const visible =
    activeTab === "all"
      ? allFeatures
      : allFeatures.filter((f) => f.category === activeTab);

  const categoryColors = {
    admin: { bg: "#EEF3FB", color: "#2563EB" },
    academic: { bg: "#F0FDF4", color: "#16A34A" },
    communication: { bg: "#FFF7ED", color: "#EA580C" },
    compliance: { bg: "#F5F3FF", color: "#7C3AED" },
  };

  return (
    <section
      id="dashboard"
      style={{
        background: T.bg,
        padding: "80px 28px",
        borderBottom: `1px solid ${T.border}`,
      }}
    >
      <div style={{ maxWidth: 1160, margin: "0 auto" }}>
        <SectionHead
          overline="Platform"
          accent={config.accent}
          title="Your entire school, in one dashboard"
          sub="Beyond invoicing — Educare gives your school a complete operations hub from the moment you sign in."
        />

        {/* Zoho-style underline tabs */}
        <div
          style={{
            display: "flex",
            gap: 0,
            justifyContent: "center",
            marginBottom: 40,
            borderBottom: `1px solid ${T.border}`,
            paddingBottom: 0,
          }}
        >
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              style={{
                padding: "10px 20px",
                background: "none",
                border: "none",
                borderBottom:
                  activeTab === t.key
                    ? `2px solid ${config.color}`
                    : "2px solid transparent",
                marginBottom: -1,
                color: activeTab === t.key ? config.color : T.muted,
                fontSize: 13.5,
                fontWeight: activeTab === t.key ? 700 : 500,
                fontFamily: "'Barlow', sans-serif",
                cursor: "pointer",
                transition: "color 0.15s, border-color 0.15s",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {t.label}
              <span
                style={{
                  background:
                    activeTab === t.key ? `${config.color}18` : T.bgAlt,
                  color: activeTab === t.key ? config.color : T.muted,
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "1px 7px",
                  borderRadius: 99,
                }}
              >
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {/* 4-column card grid (Zoho style) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: 14,
          }}
        >
          {visible.map((f, i) => {
            const cc = categoryColors[f.category] || {
              bg: T.bgAlt,
              color: config.color,
            };
            return (
              <div
                key={i}
                style={{
                  background: T.white,
                  borderRadius: 8,
                  padding: "20px 18px",
                  border: `1px solid ${T.border}`,
                  borderLeft: `3px solid ${cc.color}`,
                  transition: "box-shadow 0.2s, transform 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = `0 4px 20px ${T.shadow}`;
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {/* Icon */}
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 8,
                    background: cc.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                    marginBottom: 12,
                  }}
                >
                  {f.icon}
                </div>
                <h3
                  style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 800,
                    fontSize: 16,
                    color: T.text,
                    margin: "0 0 6px",
                  }}
                >
                  {f.title}
                </h3>
                <p
                  style={{
                    color: T.muted,
                    fontSize: 12.5,
                    lineHeight: 1.6,
                    margin: "0 0 12px",
                    fontFamily: "'Barlow', sans-serif",
                  }}
                >
                  {f.desc}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {f.tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: 3,
                        background: cc.bg,
                        color: cc.color,
                        fontFamily: "'Barlow', sans-serif",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Connected-system callout bar */}
        <div
          style={{
            marginTop: 48,
            background: config.color,
            borderRadius: 8,
            padding: "28px 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 24,
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: "1 1 260px" }}>
            <h3
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 900,
                fontSize: 22,
                color: T.white,
                margin: "0 0 6px",
              }}
            >
              Everything talks to each other
            </h3>
            <p
              style={{
                color: "rgba(255,255,255,0.5)",
                fontSize: 13,
                margin: 0,
                lineHeight: 1.65,
                fontFamily: "'Barlow', sans-serif",
                maxWidth: 380,
              }}
            >
              Attendance links to reports, homework links to assessments,
              notices reach parents instantly — one connected system.
            </p>
          </div>
          <button
            onClick={onRegister}
            style={{
              background: config.accent,
              border: "none",
              borderRadius: 7,
              padding: "12px 26px",
              color: T.white,
              fontSize: 13,
              fontWeight: 700,
              fontFamily: "'Barlow', sans-serif",
              cursor: "pointer",
              whiteSpace: "nowrap",
              boxShadow: `0 4px 14px ${config.accent}55`,
            }}
          >
            See the dashboard →
          </button>
        </div>
      </div>
    </section>
  );
}

/* ─── Features ── Zoho alternating rows ─────────────────────────────────── */
function Features({ config }) {
  return (
    <section
      id="features"
      style={{
        background: T.white,
        padding: "80px 28px",
        borderBottom: `1px solid ${T.border}`,
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <SectionHead
          overline="Features"
          accent={config.accent}
          title={`Everything your ${config.label?.toLowerCase() || "education"} business needs`}
          sub="No unnecessary extras. Just the tools that matter for how you work."
        />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px,1fr))",
            gap: 14,
          }}
        >
          {config.features?.map((f, i) => (
            <div
              key={i}
              style={{
                background: T.bg,
                borderRadius: 8,
                padding: "22px 20px",
                border: `1px solid ${T.borderL}`,
                display: "flex",
                alignItems: "flex-start",
                gap: 14,
                transition: "box-shadow 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.boxShadow = `0 4px 16px ${T.shadow}`)
              }
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 8,
                  flexShrink: 0,
                  background: `${config.accent}12`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                }}
              >
                {f.icon}
              </div>
              <div>
                <h3
                  style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 800,
                    fontSize: 17,
                    color: T.text,
                    margin: "0 0 5px",
                  }}
                >
                  {f.title}
                </h3>
                <p
                  style={{
                    color: T.muted,
                    fontSize: 13,
                    lineHeight: 1.65,
                    margin: 0,
                    fontFamily: "'Barlow', sans-serif",
                  }}
                >
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Pricing ── Zoho-style clean table cards ───────────────────────────── */
function Pricing({ config, onRegister }) {
  return (
    <section
      id="pricing"
      style={{
        background: T.bg,
        padding: "80px 28px",
        borderBottom: `1px solid ${T.border}`,
      }}
    >
      <div style={{ maxWidth: 1020, margin: "0 auto" }}>
        <SectionHead
          overline="Pricing"
          accent={config.accent}
          title="Honest pricing. No surprises."
          sub="Start free. Upgrade when your school is ready to scale."
        />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(270px,1fr))",
            gap: 16,
          }}
        >
          {config.pricing?.map((p, i) => (
            <div
              key={i}
              style={{
                borderRadius: 10,
                padding: "32px 26px",
                background: p.highlight ? config.color : T.white,
                border: p.highlight
                  ? `2px solid ${config.accent}`
                  : `1px solid ${T.border}`,
                display: "flex",
                flexDirection: "column",
                position: "relative",
                boxShadow: p.highlight
                  ? `0 8px 32px ${config.color}30`
                  : "none",
              }}
            >
              {p.highlight && (
                <div
                  style={{
                    position: "absolute",
                    top: -13,
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: config.accent,
                    color: T.white,
                    fontSize: 10,
                    fontWeight: 800,
                    padding: "4px 14px",
                    borderRadius: 99,
                    fontFamily: "'Barlow', sans-serif",
                    letterSpacing: "0.06em",
                    boxShadow: `0 3px 10px ${config.accent}55`,
                    whiteSpace: "nowrap",
                  }}
                >
                  MOST POPULAR
                </div>
              )}

              <div style={{ marginBottom: 22 }}>
                <p
                  style={{
                    color: p.highlight ? "rgba(255,255,255,0.55)" : T.muted,
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    margin: "0 0 8px",
                    fontFamily: "'Barlow', sans-serif",
                  }}
                >
                  {p.name}
                </p>
                <div
                  style={{ display: "flex", alignItems: "baseline", gap: 4 }}
                >
                  <span
                    style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontWeight: 900,
                      fontSize: 42,
                      color: p.highlight ? T.white : T.text,
                    }}
                  >
                    {p.price}
                  </span>
                  <span
                    style={{
                      color: p.highlight ? "rgba(255,255,255,0.45)" : T.muted,
                      fontSize: 13,
                      fontFamily: "'Barlow', sans-serif",
                    }}
                  >
                    {p.period}
                  </span>
                </div>
                <p
                  style={{
                    color: p.highlight ? "rgba(255,255,255,0.4)" : T.muted,
                    fontSize: 12,
                    margin: "4px 0 0",
                    fontFamily: "'Barlow', sans-serif",
                  }}
                >
                  {p.desc}
                </p>
              </div>

              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: "0 0 24px",
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: 9,
                }}
              >
                {p.features?.map((f, j) => (
                  <li
                    key={j}
                    style={{
                      display: "flex",
                      gap: 9,
                      alignItems: "flex-start",
                    }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 20 20"
                      fill={config.accent}
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
                        color: p.highlight ? "rgba(255,255,255,0.8)" : T.sub,
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
                  background: p.highlight ? config.accent : "transparent",
                  border: p.highlight ? "none" : `1.5px solid ${config.color}`,
                  borderRadius: 7,
                  padding: "11px",
                  color: p.highlight ? T.white : config.color,
                  fontWeight: 700,
                  fontSize: 13,
                  fontFamily: "'Barlow', sans-serif",
                  cursor: "pointer",
                  boxShadow: p.highlight
                    ? `0 4px 14px ${config.accent}45`
                    : "none",
                  transition: "background 0.2s",
                }}
              >
                {p.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Testimonials ──────────────────────────────────────────────────────── */
function Testimonials({ config }) {
  const statsStrip = config.statsStrip || [
    ["500+", "SA Schools onboarded"],
    ["R 8M+", "Invoiced monthly"],
    ["4.9/5", "App store rating"],
    ["< 60s", "Avg invoice time"],
  ];

  return (
    <section
      id="testimonials"
      style={{
        background: T.white,
        padding: "80px 28px",
        borderBottom: `1px solid ${T.border}`,
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <SectionHead
          overline="Testimonials"
          accent={config.accent}
          title={`Loved by SA ${config.label?.toLowerCase() || "education"} businesses`}
          sub="Hear from school owners and principals across South Africa."
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(290px,1fr))",
            gap: 16,
          }}
        >
          {config.testimonials?.map((t, i) => (
            <div
              key={i}
              style={{
                background: T.bg,
                borderRadius: 8,
                padding: "26px 22px",
                border: `1px solid ${T.borderL}`,
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              {/* Stars */}
              <div style={{ display: "flex", gap: 2 }}>
                {[...Array(5)].map((_, j) => (
                  <span key={j} style={{ color: "#F59E0B", fontSize: 14 }}>
                    ★
                  </span>
                ))}
              </div>
              {/* Quote */}
              <p
                style={{
                  color: T.sub,
                  fontSize: 13.5,
                  lineHeight: 1.75,
                  fontFamily: "'Barlow', sans-serif",
                  margin: 0,
                  flex: 1,
                }}
              >
                "{t.quote}"
              </p>
              {/* Author */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  paddingTop: 12,
                  borderTop: `1px solid ${T.border}`,
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    background: config.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 800,
                    fontSize: 14,
                    color: T.white,
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
                      fontSize: 14,
                      color: T.text,
                      margin: 0,
                    }}
                  >
                    {t.name}
                  </p>
                  <p
                    style={{
                      fontFamily: "'Barlow', sans-serif",
                      fontSize: 11,
                      color: T.muted,
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

        {/* Stats band */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))",
            background: config.color,
            borderRadius: 8,
            marginTop: 44,
            overflow: "hidden",
          }}
        >
          {statsStrip.map(([v, l], i) => (
            <div
              key={i}
              style={{
                padding: "26px 22px",
                textAlign: "center",
                borderRight:
                  i < statsStrip.length - 1
                    ? "1px solid rgba(255,255,255,0.08)"
                    : "none",
              }}
            >
              <div
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 900,
                  fontSize: 34,
                  color: config.accent,
                }}
              >
                {v}
              </div>
              <div
                style={{
                  fontFamily: "'Barlow', sans-serif",
                  fontSize: 12,
                  color: "rgba(255,255,255,0.45)",
                  marginTop: 3,
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

/* ─── FAQ ───────────────────────────────────────────────────────────────── */
function FAQ({ config }) {
  const [open, setOpen] = useState(null);

  return (
    <section
      id="faq"
      style={{
        background: T.bg,
        padding: "80px 28px",
        borderBottom: `1px solid ${T.border}`,
      }}
    >
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <SectionHead
          overline="FAQ"
          accent={config.accent}
          title="Common questions"
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {config.faqs?.map((faq, i) => (
            <div
              key={i}
              style={{
                background: T.white,
                borderRadius: 8,
                border: `1px solid ${open === i ? config.color : T.border}`,
                overflow: "hidden",
                transition: "border-color 0.2s",
              }}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "16px 20px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  gap: 16,
                }}
              >
                <span
                  style={{
                    fontFamily: "'Barlow', sans-serif",
                    fontWeight: 600,
                    fontSize: 15,
                    color: T.text,
                  }}
                >
                  {faq.q}
                </span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={config.accent}
                  strokeWidth="2.5"
                  style={{
                    flexShrink: 0,
                    transform: open === i ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s",
                  }}
                >
                  <path d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {open === i && (
                <div
                  style={{
                    padding: "12px 20px 18px",
                    borderTop: `1px solid ${T.borderL}`,
                  }}
                >
                  <p
                    style={{
                      color: T.muted,
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

/* ─── CTA Banner ────────────────────────────────────────────────────────── */
function CTABanner({ config, onRegister }) {
  return (
    <section
      style={{
        background: `linear-gradient(135deg, ${config.color} 0%, ${config.colorDark || config.color} 100%)`,
        padding: "80px 28px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          bottom: -80,
          right: -80,
          width: 420,
          height: 420,
          borderRadius: "50%",
          background: config.accent,
          opacity: 0.06,
          filter: "blur(80px)",
        }}
      />
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
            fontSize: "clamp(28px,4vw,50px)",
            color: T.white,
            margin: "0 0 14px",
            letterSpacing: -0.4,
          }}
        >
          Your school, running smarter.
        </h2>
        <p
          style={{
            color: "rgba(255,255,255,0.45)",
            fontSize: 15,
            margin: "0 0 34px",
            fontFamily: "'Barlow', sans-serif",
          }}
        >
          Join hundreds of South African {config.label?.toLowerCase()}{" "}
          businesses that bill professionally and get paid faster with Educare.
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
              background: config.accent,
              border: "none",
              borderRadius: 8,
              padding: "14px 34px",
              color: T.white,
              fontSize: 15,
              fontWeight: 800,
              fontFamily: "'Barlow Condensed', sans-serif",
              cursor: "pointer",
              letterSpacing: 0.3,
              boxShadow: `0 6px 22px ${config.accent}60`,
            }}
          >
            START FOR FREE
          </button>
          <button
            onClick={() => scrollTo("pricing")}
            style={{
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 8,
              padding: "14px 26px",
              color: "rgba(255,255,255,0.7)",
              fontSize: 14,
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
            color: "rgba(255,255,255,0.2)",
            fontSize: 11.5,
            marginTop: 18,
            fontFamily: "'Barlow', sans-serif",
          }}
        >
          No credit card required · Free plan forever · Cancel anytime
        </p>
      </div>
    </section>
  );
}

/* ─── Footer ── Zoho-style structured columns ───────────────────────────── */
function Footer({ config, onLogin, onRegister }) {
  const cols = [
    {
      title: "Product",
      links: ["Features", "Pricing", "Report Cards", "Attendance", "Timetable"],
    },
    {
      title: "Resources",
      links: ["Help Centre", "Video Guides", "Blog", "API Docs", "Community"],
    },
    {
      title: "Company",
      links: [
        "About Educare",
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
        background: "#0C1929",
        borderTop: `1px solid rgba(255,255,255,0.05)`,
        padding: "52px 28px 28px",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr repeat(3, 1fr)",
            gap: 40,
            marginBottom: 44,
          }}
        >
          <div>
            <img
              src={logo}
              alt=""
              style={{ height: 34, objectFit: "contain", marginBottom: 14 }}
            />
            <p
              style={{
                color: "rgba(255,255,255,0.3)",
                fontSize: 13,
                lineHeight: 1.7,
                fontFamily: "'Barlow', sans-serif",
                marginBottom: 18,
                maxWidth: 220,
              }}
            >
              Professional school management software built for South African
              education businesses.
            </p>
            <button
              onClick={onRegister}
              style={{
                background: config.accent,
                border: "none",
                borderRadius: 6,
                padding: "9px 18px",
                color: T.white,
                fontSize: 12.5,
                fontWeight: 700,
                fontFamily: "'Barlow', sans-serif",
                cursor: "pointer",
              }}
            >
              Get started free
            </button>
          </div>
          {cols.map((col, i) => (
            <div key={i}>
              <p
                style={{
                  fontFamily: "'Barlow', sans-serif",
                  fontWeight: 700,
                  fontSize: 12,
                  color: "rgba(255,255,255,0.45)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  margin: "0 0 14px",
                }}
              >
                {col.title}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {col.links.map((l) => (
                  <a
                    key={l}
                    href="#"
                    style={{
                      color: "rgba(255,255,255,0.35)",
                      fontSize: 13,
                      fontFamily: "'Barlow', sans-serif",
                      textDecoration: "none",
                      transition: "color 0.15s",
                    }}
                    onMouseEnter={(e) => (e.target.style.color = T.white)}
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
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.06)",
            paddingTop: 22,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 10,
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
            © {new Date().getFullYear()} SolidFlo / Educare. All rights
            reserved.
          </p>
          <p
            style={{
              color: "rgba(255,255,255,0.2)",
              fontSize: 12,
              fontFamily: "'Barlow', sans-serif",
              margin: 0,
            }}
          >
            Proudly South African 🇿🇦
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ─── App ───────────────────────────────────────────────────────────────── */
export default function SubdomainLandingPage() {
  const navigate = useNavigate();
  const { subdomain } = useSubdomain();
  const config = getIndustryConfig(subdomain);

  const goLogin = () => navigate("/login");
  const goRegister = () => navigate("/register");

  return (
    <>
      <style>{fontStyle}</style>
      <div
        style={{
          minHeight: "100vh",
          fontFamily: "'Barlow', sans-serif",
          background: T.bg,
          color: T.text,
        }}
      >
        <Navbar config={config} onLogin={goLogin} onRegister={goRegister} />
        <Hero config={config} onRegister={goRegister} />
        <HowItWorks config={config} />
        <DashboardFeatures config={config} onRegister={goRegister} />
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
