import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSubdomain } from "../../hooks/useSubdomain";
import { getIndustryConfig } from "../../config/industryConfig";
import heroVideo from "../../assets/videos/education.mp4";
import logo from "../../assets/img/poolservice-logo.png";
import logotop from "../../assets/img/poolservice-logo-top.png";  
import { HC, heroFontStyle } from "../../styles/landingTokens";
import google from "../../assets/google-play.png";
import Helmet from "react-helmet";
const fontStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&family=Barlow:wght@400;500;600;700&display=swap');
`;

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  white: "#FFFFFF",
  bg: "#F7F9FC",
  bgAlt: "#EEF3FB",
  border: "#DDE3EE",
  borderL: "#E8ECF4",
  text: "#1B2A3D",
  sub: "#4A5568",
  muted: "#718096",
  shadow: "rgba(27,42,61,0.07)",
};
const C = {
  ink: "#0D1B2A", // deep navy
  ink2: "#1B2E42", // mid navy
  surface: "#F4F7FA", // cool light bg
  white: "#FFFFFF",
  orange: "#F97316", // primary accent
  orangeD: "#C2580F",
  orangeL: "#FFF0E5",
  steel: "#64748B",
  border: "#E2E8F0",
  text: "#1E293B",
  muted: "#64748B",
};

// ─── Smooth scroll helper ─────────────────────────────────────────────────────
function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

// ─── Mock Invoice card (plumbing-flavoured) ───────────────────────────────────
function MockInvoice({ config }) {
  const lineItems = config.mockLineItems || [
    {
      desc: "Monthly Pool Maintenance (x4 visits)",
      qty: 4,
      unit: "R480.00",
      total: "R1 920.00",
    },
    {
      desc: "Algae Treatment & Shock Dose",
      qty: 1,
      unit: "R650.00",
      total: "R650.00",
    },
    {
      desc: "Pool Pump Service & Filter Clean",
      qty: 1,
      unit: "R850.00",
      total: "R850.00",
    },
    {
      desc: "Chemicals – Chlorine & pH Balance",
      qty: 1,
      unit: "R420.00",
      total: "R420.00",
    },
  ];
  const subtotal = config.mockSubtotal || "R3 840.00";
  const vat = config.mockVat || "R576.00";
  const total = config.mockTotal || "R4 416.00";
  const refNo = config.mockRef || "INV-0098";
  const bizName = config.mockBizName || `${config.label} Services`;

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
            <div
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 900,
                fontSize: 20,
                color: config.color,
                marginBottom: 4,
              }}
            >
              SolidFlo
            </div>
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
              Issued 4 Jun 2025
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
function Hero({ onRegister }) {
  return (
    <section
      style={{
        background: C.cream,
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

      {/* Ambient glow, tinted with aqua */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 70% 60% at 15% 30%, rgba(99,102,241,.08) 0%, transparent 60%), radial-gradient(ellipse 60% 70% at 90% 15%, rgba(6,182,212,.12) 0%, transparent 55%)",
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
              background: "rgba(6,182,212,0.1)",
              border: "1px solid rgba(6,182,212,0.28)",
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
                background: C.aqua,
                display: "inline-block",
              }}
            />
            <span
              style={{
                color: C.aqua,
                fontSize: 12,
                fontWeight: 700,
                fontFamily: "'Lato', sans-serif",
              }}
            >
              Built for Pool Service &amp; Maintenance Pros
            </span>
          </div>

          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 700,
              fontSize: "clamp(2.6rem, 5vw, 4.2rem)",
              lineHeight: 1.1,
              color: C.navy,
              margin: "0 0 24px",
            }}
          >
            Quote your rounds.
            <br />
            <em style={{ fontStyle: "italic", color: C.aqua }}>Get paid faster.</em>
            <br />
            Run your pool business.
          </h1>

          <p
            style={{
              color: C.textMid,
              fontSize: "clamp(1rem, 2vw, 1.2rem)",
              lineHeight: 1.7,
              margin: "0 0 40px",
              fontFamily: "'Lato', sans-serif",
              maxWidth: 480,
            }}
          >
            SolidFlo is purpose-built for SA pool service and maintenance
            professionals. Create recurring service invoices, track chemicals
            &amp; call-outs, and get paid in under 60 seconds.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 40 }}>
            <button
              onClick={onRegister}
              style={{
                height: 52,
                padding: "0 32px",
                background: C.aqua,
                border: "none",
                borderRadius: 4,
                color: C.white,
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
              Start Free — No Card Needed
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

          {/* Trust row */}
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            {[
              "Free plan forever",
              "VAT-compliant invoices",
              "WhatsApp invoicing",
              "SA-built & hosted",
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
                <svg width="13" height="13" viewBox="0 0 20 20" fill={C.aqua}>
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                {t}
              </span>
            ))}
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
                color: C.white,
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
            <MockInvoice />
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
            color: C.textMuted,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            fontFamily: "'Lato', sans-serif",
          }}
        >
          Trusted by SA pool service pros
        </span>
        {[
          "Blue Wave Pools JHB",
          "Cape Aqua Services",
          "Durban Pool Care",
          "PE Crystal Clear Pools",
        ].map((b) => (
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
// ─── Features ─────────────────────────────────────────────────────────────────
function Features({ config }) {
  return (
    <section id="features" className="py-16 sm:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <p
            className="text-xs font-bold uppercase tracking-widest mb-3"
            style={{ color: config.accent }}
          >
            Features
          </p>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900">
            Everything your {config.label.toLowerCase()} business needs
          </h2>
          <p className="text-gray-400 mt-3 max-w-xl mx-auto text-sm sm:text-base">
            No unnecessary extras. Just the tools that matter for how you work.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {config.features.map((f) => (
            <div
              key={f.title}
              className="group p-6 rounded-2xl border border-gray-100 hover:border-transparent transition-all hover:shadow-lg"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-4"
                style={{ background: config.lightBg }}
              >
                {f.icon}
              </div>
              <h3 className="font-bold text-gray-800 mb-1.5 text-sm">
                {f.title}
              </h3>
              <p className="text-gray-400 text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Pricing ──────────────────────────────────────────────────────────────────
function Pricing({ config, onRegister }) {
  return (
    <section
      id="pricing"
      style={{ background: config.lightBg }}
      className="py-16 sm:py-24"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <p
            className="text-xs font-bold uppercase tracking-widest mb-3"
            style={{ color: config.accent }}
          >
            Pricing
          </p>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900">
            Simple, honest pricing
          </h2>
          <p className="text-gray-500 mt-3 text-sm sm:text-base">
            Start free. Upgrade when you're ready. No hidden fees.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {config.pricing.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-6 flex flex-col ${plan.highlight ? "shadow-xl text-white" : "bg-white border border-gray-200"}`}
              style={plan.highlight ? { background: config.color } : {}}
            >
              {plan.highlight && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-4 py-1 rounded-full text-white"
                  style={{ background: config.accent }}
                >
                  Most Popular
                </div>
              )}
              <div className="mb-4">
                <p
                  className={`font-bold text-sm mb-0.5 ${plan.highlight ? "text-white/70" : "text-gray-500"}`}
                >
                  {plan.name}
                </p>
                <div className="flex items-baseline gap-1">
                  <span
                    className={`text-3xl font-extrabold ${plan.highlight ? "text-white" : "text-gray-900"}`}
                  >
                    {plan.price}
                  </span>
                  <span
                    className={`text-sm ${plan.highlight ? "text-white/50" : "text-gray-400"}`}
                  >
                    {plan.period}
                  </span>
                </div>
                <p
                  className={`text-xs mt-1 ${plan.highlight ? "text-white/50" : "text-gray-400"}`}
                >
                  {plan.desc}
                </p>
              </div>
              <ul className="space-y-2.5 flex-1 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs">
                    <svg
                      className="w-4 h-4 flex-shrink-0 mt-0.5"
                      style={{ color: config.accent }}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span
                      className={
                        plan.highlight ? "text-white/80" : "text-gray-600"
                      }
                    >
                      {f}
                    </span>
                  </li>
                ))}
              </ul>
              <button
                onClick={onRegister}
                className="w-full py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90"
                style={
                  plan.highlight
                    ? { background: config.accent, color: "#fff" }
                    : { background: config.lightBg, color: config.accentDark }
                }
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
function Testimonials({ config }) {
  const statsStrip = config.statsStrip || [
    ["1 400+", "SA pool professionals"],
    ["R 6M+", "Invoiced monthly"],
    ["4.9/5", "App store rating"],
    ["< 60s", "Avg invoice time"],
  ];

  return (
    <section id="testimonials" className="py-16 sm:py-24 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <p
            className="text-xs font-bold uppercase tracking-widest mb-3"
            style={{ color: config.accent }}
          >
            Testimonials
          </p>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900">
            Trusted by {config.label.toLowerCase()} businesses across SA
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {config.testimonials.map((t) => (
            <div
              key={t.name}
              className="p-6 rounded-2xl border border-gray-100 flex flex-col gap-4"
            >
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-4 h-4"
                    style={{ color: config.accent }}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed flex-1">
                "{t.quote}"
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{ background: config.accent }}
                >
                  {t.avatar}
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-800">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.role}</p>
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

// ─── FAQ ──────────────────────────────────────────────────────────────────────
function FAQ({ config }) {
  const [open, setOpen] = useState(null);

  return (
    <section
      id="faq"
      style={{ background: config.lightBg }}
      className="py-16 sm:py-24"
    >
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <p
            className="text-xs font-bold uppercase tracking-widest mb-3"
            style={{ color: config.accent }}
          >
            FAQ
          </p>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900">
            Common questions
          </h2>
        </div>
        <div className="space-y-3">
          {config.faqs.map((faq, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden"
            >
              <button
                className="w-full flex items-center justify-between px-5 py-4 text-left"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="text-sm font-semibold text-gray-800 pr-4">
                  {faq.q}
                </span>
                <svg
                  className="w-4 h-4 flex-shrink-0 transition-transform"
                  style={{
                    color: config.accent,
                    transform: open === i ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {open === i && (
                <div className="px-5 pb-4 text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-3">
                  {faq.a}
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
        <div style={{ fontSize: 44, marginBottom: 14 }}>{config.icon}</div>
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
          Ready to get paid faster?
        </h2>
        <p
          style={{
            color: "rgba(255,255,255,0.45)",
            fontSize: 15,
            margin: "0 0 34px",
            fontFamily: "'Barlow', sans-serif",
          }}
        >
          Join hundreds of {config.label.toLowerCase()} businesses already using
          SolidFlo.
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

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer({ config, onLogin, onRegister }) {
  const cols = [
    {
      title: "Product",
      links: [
        "Features",
        "Pricing",
        "Service Schedules",
        "Chemical Invoicing",
        "WhatsApp Delivery",
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
        background: "#0C1929",
        borderTop: "1px solid rgba(255,255,255,0.05)",
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
          {/* Brand column */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 16,
              }}
            >
              
              <div>
                <img src={logo} width={100} alt="" />
              </div>
            </div>
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
              Professional invoicing software built for South African{" "}
              {config.label.toLowerCase()} and maintenance businesses.
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

          {/* Link columns */}
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

        {/* Bottom bar */}
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
            Proudly South African 🇿🇦
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

  const goLogin = () => navigate("/login");
  const goRegister = () => {
  localStorage.setItem("pendingDashboardId", "poolservices"); // use the real id
  navigate("/register?industry=poolservices");
};

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
