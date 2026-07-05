import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import logo from "../../assets/img/accounting-logo.png";
import logotop from "../../assets/img/accounting-logo-top.png";
import google from "../../assets/google-play.png";
const fontStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&family=Barlow:wght@400;500;600&display=swap');
`;
const HC = {
  navy: "#0f172a",
  indigo: "#6366f1",
  indigoHover: "#4f46e5",
  indigoLight: "#eef2ff",
  cream: "#f8fafc",
  creamMid: "#f1f5f9",
  creamDark: "#e2e8f0",
  text: "#0f172a",
  textMid: "#475569",
  textMuted: "#94a3b8",
  white: "#ffffff",
};

/* Add these two families alongside your existing Barlow import.
   Put this <style> once near the top of the component (or merge into fontStyle). */
const heroFontStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Lato:wght@300;400;600;700;900&display=swap');
`;
/* ─── Design Tokens ────────────────────────────────────────────────────── */
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

/* ─── Mock Invoice UI ───────────────────────────────────────────────────── */
function MockInvoice() {
  return (
    <div
      style={{
        background: HC.white,
        borderRadius: 16,
        boxShadow: "0 32px 80px rgba(15,23,42,0.14)",
        overflow: "hidden",
        fontFamily: "'Lato', sans-serif",
        border: `1px solid ${HC.creamDark}`,
        maxWidth: 520,
        width: "100%",
      }}
    >
      {/* Chrome bar */}
      <div
        style={{
          background: HC.creamMid,
          padding: "10px 16px",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
          <span
            key={c}
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: c,
              display: "inline-block",
            }}
          />
        ))}
        <div
          style={{
            flex: 1,
            background: HC.white,
            borderRadius: 6,
            height: 22,
            margin: "0 12px",
            display: "flex",
            alignItems: "center",
            paddingLeft: 10,
          }}
        >
          <span style={{ fontSize: 11, color: HC.textMuted }}>
            solidflo.co.za/accounting/INV-2024
          </span>
        </div>
      </div>

      {/* Invoice header */}
      <div
        style={{
          padding: "20px 24px 16px",
          borderBottom: `2px solid ${HC.indigo}`,
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
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 6,
              }}
            >
              <span style={{ fontSize: 20 }}>🧾</span>
              <span
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontWeight: 700,
                  fontSize: 18,
                  color: HC.navy,
                }}
              >
                SolidFlo
              </span>
            </div>
            <p style={{ fontSize: 12, color: HC.textMuted, margin: 0 }}>
              Mokoena Accounting Inc.
            </p>
            <p style={{ fontSize: 11, color: HC.textMuted, margin: 0 }}>
              Johannesburg, South Africa
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                background: "#DCFCE7",
                color: "#16A34A",
                fontSize: 11,
                fontWeight: 700,
                padding: "3px 10px",
                borderRadius: 99,
                marginBottom: 6,
              }}
            >
              PAID
            </div>
            <p
              style={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: 700,
                fontSize: 20,
                color: HC.navy,
                margin: 0,
              }}
            >
              INV-0087
            </p>
            <p style={{ fontSize: 11, color: HC.textMuted, margin: 0 }}>
              Issued 28 Mar 2025
            </p>
          </div>
        </div>
      </div>

      {/* Line items */}
      <div style={{ padding: "0 24px" }}>
        <table
          style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}
        >
          <thead>
            <tr style={{ borderBottom: `1px solid ${HC.creamDark}` }}>
              {["Description", "Qty", "Unit Price", "Total"].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "10px 0 8px",
                    color: HC.textMuted,
                    fontWeight: 600,
                    textAlign: h === "Description" ? "left" : "right",
                    fontSize: 11,
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              {
                desc: "Monthly Bookkeeping (Apr)",
                qty: 1,
                unit: "R2 800.00",
                total: "R2 800.00",
              },
              {
                desc: "VAT Return Preparation",
                qty: 1,
                unit: "R950.00",
                total: "R950.00",
              },
              {
                desc: "Annual Financial Statements",
                qty: 1,
                unit: "R4 500.00",
                total: "R4 500.00",
              },
              {
                desc: "Tax Advisory Consultation (2h)",
                qty: 2,
                unit: "R750.00",
                total: "R1 500.00",
              },
            ].map((r, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${HC.creamDark}` }}>
                <td style={{ padding: "9px 0", color: HC.text }}>{r.desc}</td>
                <td
                  style={{
                    padding: "9px 0",
                    textAlign: "right",
                    color: HC.textMuted,
                  }}
                >
                  {r.qty}
                </td>
                <td
                  style={{
                    padding: "9px 0",
                    textAlign: "right",
                    color: HC.textMuted,
                  }}
                >
                  {r.unit}
                </td>
                <td
                  style={{
                    padding: "9px 0",
                    textAlign: "right",
                    fontWeight: 600,
                    color: HC.navy,
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
          padding: "12px 24px 20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 4,
        }}
      >
        {[
          ["Subtotal", "R9 750.00"],
          ["VAT (15%)", "R1 462.50"],
        ].map(([l, v]) => (
          <div key={l} style={{ display: "flex", gap: 32, fontSize: 12 }}>
            <span style={{ color: HC.textMuted }}>{l}</span>
            <span style={{ color: HC.text, minWidth: 80, textAlign: "right" }}>
              {v}
            </span>
          </div>
        ))}
        <div
          style={{
            display: "flex",
            gap: 32,
            background: HC.navy,
            borderRadius: 8,
            padding: "6px 14px",
            marginTop: 6,
          }}
        >
          <span
            style={{
              color: "rgba(255,255,255,0.7)",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Total Due
          </span>
          <span
            style={{
              color: HC.white,
              fontWeight: 800,
              fontSize: 15,
              minWidth: 80,
              textAlign: "right",
            }}
          >
            R11 212.50
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
                background: HC.indigo,
                border: "none",
                borderRadius: 8,
                padding: "8px 20px",
                color: HC.white,
                fontSize: 13,
                fontWeight: 700,
                fontFamily: "'Lato', sans-serif",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(99,102,241,0.3)",
                transition: "background .15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = HC.indigoHover)}
              onMouseLeave={(e) => (e.currentTarget.style.background = HC.indigo)}
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
                  background: HC.indigo,
                  border: "none",
                  borderRadius: 8,
                  padding: "12px",
                  color: HC.white,
                  fontSize: 14,
                  fontWeight: 700,
                  fontFamily: "'Lato', sans-serif",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(99,102,241,0.3)",
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
        background: HC.cream,
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

      {/* Ambient glow, same language as main hero */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 70% 60% at 15% 30%, rgba(99,102,241,.08) 0%, transparent 60%), radial-gradient(ellipse 60% 70% at 90% 15%, rgba(99,102,241,.06) 0%, transparent 55%)",
          pointerEvents: "none",
        }}
      />

      {/* Framed "device" container, matching lp-hero-inner */}
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
          border: `1px solid rgba(15,23,42,0.08)`,
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
          {/* Badge: avatars + pill + text, matches main hero badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "6px 14px 6px 6px",
              background: HC.white,
              border: `1px solid ${HC.creamDark}`,
              borderRadius: 30,
              boxShadow: "0 4px 14px rgba(15,23,42,0.06)",
              marginBottom: 28,
              fontFamily: "'Lato', sans-serif",
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              {[1, 2, 3].map((n, i) => (
                <img
                  key={n}
                  src={`https://i.pravatar.cc/60?img=${n}`}
                  alt=""
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    border: "2px solid #fff",
                    objectFit: "cover",
                    marginLeft: i === 0 ? 0 : -8,
                  }}
                />
              ))}
            </div>
            <span
              style={{
                background: HC.navy,
                color: HC.white,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.02em",
                padding: "4px 10px",
                borderRadius: 20,
                whiteSpace: "nowrap",
              }}
            >
              800+ firms
            </span>
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: HC.textMid,
              }}
            >
              Built for SA accountants
            </span>
          </div>

          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 700,
              fontSize: "clamp(2.6rem, 5vw, 4.2rem)",
              lineHeight: 1.1,
              color: HC.navy,
              margin: "0 0 24px",
            }}
          >
            Invoice smarter.
            <br />
            Get paid <em style={{ fontStyle: "italic", color: HC.indigo }}>faster.</em>
            <br />
            Run your practice.
          </h1>

          <p
            style={{
              color: HC.textMid,
              fontSize: "clamp(1rem, 2vw, 1.2rem)",
              lineHeight: 1.7,
              margin: "0 0 40px",
              fontFamily: "'Lato', sans-serif",
              maxWidth: 480,
            }}
          >
            SolidFlo is purpose-built for SA accounting practices. Create
            SARS-compliant invoices, automate payment reminders, and get
            real-time cash flow insights — in under 60 seconds.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 40 }}>
            <button
              onClick={onRegister}
              style={{
                height: 52,
                padding: "0 32px",
                background: HC.indigo,
                border: "none",
                borderRadius: 4,
                color: HC.white,
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                fontFamily: "'Lato', sans-serif",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                transition: "background .15s, transform .15s, box-shadow .15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = HC.indigoHover;
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = HC.indigo;
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              Start Free Trial →
            </button>
            <button
              onClick={() => scrollTo("features")}
              style={{
                height: 52,
                padding: "0 28px",
                background: "transparent",
                border: `1.5px solid ${HC.creamDark}`,
                borderRadius: 4,
                color: HC.navy,
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                fontFamily: "'Lato', sans-serif",
                cursor: "pointer",
                transition: "border-color .15s, background .15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = HC.navy;
                e.currentTarget.style.background = HC.creamMid;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = HC.creamDark;
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
              "SARS-compliant invoices",
              "Xero & Sage sync",
              "SA-built & hosted",
            ].map((t) => (
              <span
                key={t}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  color: HC.textMuted,
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: "0.03em",
                  fontFamily: "'Lato', sans-serif",
                }}
              >
                <svg width="13" height="13" viewBox="0 0 20 20" fill="#4ade80">
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
                color: HC.white,
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
            <div style={{ display: "flex", gap: 12, marginTop: 14 }}>
              {[
                ["R 128 400", "This Month"],
                ["34", "Active Clients"],
                ["4.9★", "Client Rating"],
              ].map(([v, l]) => (
                <div
                  key={l}
                  style={{
                    flex: 1,
                    background: HC.white,
                    border: `1px solid ${HC.creamDark}`,
                    borderRadius: 10,
                    padding: "10px 12px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontWeight: 700,
                      fontSize: 18,
                      color: HC.navy,
                    }}
                  >
                    {v}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: HC.textMuted,
                      fontFamily: "'Lato', sans-serif",
                    }}
                  >
                    {l}
                  </div>
                </div>
              ))}
            </div>
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
            color: HC.textMuted,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            fontFamily: "'Lato', sans-serif",
          }}
        >
          Trusted by SA accounting firms
        </span>
        {[
          "Mokoena & Associates",
          "Van der Berg Bookkeeping",
          "Khumalo Tax Solutions",
          "Cape Ledger Partners",
        ].map((b) => (
          <span
            key={b}
            style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 600,
              fontSize: 15,
              color: HC.textMuted,
            }}
          >
            {b}
          </span>
        ))}
      </div>
    </section>
  );
}

/* ─── How It Works ─────────────────────────────────────────────────────── */
function HowItWorks() {
  const steps = [
    {
      icon: "📋",
      title: "Create a Client Invoice",
      desc: "Log the client, engagement type, and services rendered. Add line items from your service catalogue and set your billable rate.",
    },
    {
      icon: "📩",
      title: "Send the Invoice",
      desc: "One tap sends a professional SARS-compliant VAT invoice via email, SMS, or WhatsApp PDF — directly to your client.",
    },
    {
      icon: "💳",
      title: "Get Paid Instantly",
      desc: "Clients pay via EFT, card, or instant EFT. Payment reminders go out automatically. You get notified the moment money lands.",
    },
  ];

  return (
    <section style={{ background: C.white, padding: "80px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <p
            style={{
              color: C.green,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 3,
              textTransform: "uppercase",
              fontFamily: "'Barlow', sans-serif",
              marginBottom: 10,
            }}
          >
            How It Works
          </p>
          <h2
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 900,
              fontSize: "clamp(30px,4vw,48px)",
              color: C.ink,
              margin: 0,
              letterSpacing: -0.5,
            }}
          >
            Invoice in 60 seconds, flat.
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
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
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 24,
                  right: 24,
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 900,
                  fontSize: 48,
                  color:
                    i === 1 ? "rgba(255,255,255,0.05)" : "rgba(8,80,65,0.06)",
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
                  color: i === 1 ? C.white : C.ink,
                  margin: "0 0 10px",
                }}
              >
                {s.title}
              </h3>
              <p
                style={{
                  color: i === 1 ? "rgba(255,255,255,0.55)" : C.muted,
                  fontSize: 14,
                  lineHeight: 1.7,
                  margin: 0,
                  fontFamily: "'Barlow', sans-serif",
                }}
              >
                {s.desc}
              </p>
              {i === 1 && (
                <div
                  style={{
                    marginTop: 20,
                    display: "inline-block",
                    background: C.green,
                    borderRadius: 6,
                    padding: "5px 14px",
                    fontSize: 12,
                    fontWeight: 700,
                    color: C.white,
                    fontFamily: "'Barlow', sans-serif",
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

/* ─── Features ─────────────────────────────────────────────────────────── */
function Features() {
  const features = [
    {
      icon: "📄",
      title: "SARS-Compliant Invoices",
      desc: "Generate VAT invoices that meet every SARS requirement — VAT registration number, correct tax lines, and audit-ready formatting out of the box.",
    },
    {
      icon: "🔔",
      title: "Automated Payment Reminders",
      desc: "Schedule polite reminders via SMS and email. Reduce overdue accounts and eliminate awkward follow-up calls entirely.",
    },
    {
      icon: "📊",
      title: "Cash Flow Dashboard",
      desc: "Live view of outstanding invoices, paid amounts, and projected cash flow across all your clients — at a glance.",
    },
    {
      icon: "🏦",
      title: "EFT & Card Payments",
      desc: "Accept EFT with your banking details embedded, or enable card payments through PayFast and Peach Payments. Reconcile automatically.",
    },
    {
      icon: "👥",
      title: "Multi-Client Management",
      desc: "Manage invoices across dozens of clients from a single dashboard, with per-client billing history, notes, and reports.",
    },
    {
      icon: "🔗",
      title: "Xero & Sage Integration",
      desc: "Sync invoices and payment status directly with Xero, Sage One, or QuickBooks — no double-capturing, no CSV exports.",
    },
    {
      icon: "🔒",
      title: "POPIA-Compliant & Secure",
      desc: "All data hosted in South Africa with bank-grade encryption. POPIA compliant. Regular independent security audits.",
    },
    {
      icon: "📁",
      title: "Client Portal",
      desc: "Give each client their own branded portal to view and download invoices, check payment history, and track outstanding balances.",
    },
    {
      icon: "📈",
      title: "VAT & Tax Reports",
      desc: "Run VAT output reports ready for your accountant or for SARS e-filing. Monthly, quarterly, or custom date ranges.",
    },
  ];

  return (
    <section
      id="features"
      style={{ background: C.surface, padding: "80px 24px" }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <p
            style={{
              color: C.green,
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
              color: C.ink,
              margin: "0 0 12px",
              letterSpacing: -0.5,
            }}
          >
            Everything an accounting practice needs
          </h2>
          <p
            style={{
              color: C.muted,
              fontSize: 15,
              maxWidth: 520,
              margin: "0 auto",
              fontFamily: "'Barlow', sans-serif",
            }}
          >
            No bloat. No unnecessary extras. Just the tools your practice
            actually uses every day.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 18,
          }}
        >
          {features.map((f, i) => (
            <div
              key={i}
              style={{
                background: C.white,
                borderRadius: 14,
                padding: "24px 22px",
                border: `1px solid ${C.border}`,
                transition: "box-shadow .2s, transform .2s",
                cursor: "default",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 8px 32px rgba(8,80,65,0.1)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: C.greenL,
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
                  color: C.ink,
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

/* ─── Pricing ───────────────────────────────────────────────────────────── */
function Pricing({ onRegister }) {
  const plans = [
    {
      name: "Starter",
      price: "Free",
      period: "forever",
      desc: "For sole practitioners just getting started",
      features: [
        "5 invoices / month",
        "Up to 3 active clients",
        "SARS-compliant templates",
        "Client portal",
        "Email support",
      ],
      cta: "Get Started Free",
    },
    {
      name: "Professional",
      price: "R115",
      period: "/month",
      desc: "The sweet spot for growing practices",
      highlight: true,
      features: [
        "Unlimited invoices",
        "Up to 50 clients",
        "Automated payment reminders",
        "Cash flow dashboard",
        "VAT reports",
        "Priority support",
      ],
      cta: "Start 14-Day Free Trial",
    },
    {
      name: "Firm",
      price: "R200",
      period: "/month",
      desc: "Multi-partner firms & large teams",
      features: [
        "Everything in Professional",
        "Unlimited clients",
        "5 user seats included",
        "White-label invoices",
        "API access",
        "Dedicated account manager",
      ],
      cta: "Contact Sales",
    },
  ];

  return (
    <section id="pricing" style={{ background: C.white, padding: "80px 24px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <p
            style={{
              color: C.green,
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
              color: C.ink,
              margin: "0 0 12px",
              letterSpacing: -0.5,
            }}
          >
            Honest pricing. No surprises.
          </h2>
          <p
            style={{
              color: C.muted,
              fontSize: 15,
              fontFamily: "'Barlow', sans-serif",
            }}
          >
            Start free. Upgrade when your practice is ready to scale.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))",
            gap: 20,
          }}
        >
          {plans.map((p, i) => (
            <div
              key={i}
              style={{
                borderRadius: 16,
                padding: "32px 28px",
                background: p.highlight ? C.ink : C.surface,
                border: p.highlight
                  ? `2px solid ${C.green}`
                  : `1px solid ${C.border}`,
                display: "flex",
                flexDirection: "column",
                position: "relative",
              }}
            >
              {p.highlight && (
                <div
                  style={{
                    position: "absolute",
                    top: -14,
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: C.green,
                    color: C.white,
                    fontSize: 11,
                    fontWeight: 800,
                    padding: "5px 16px",
                    borderRadius: 99,
                    fontFamily: "'Barlow', sans-serif",
                    letterSpacing: 0.5,
                    boxShadow: "0 4px 12px rgba(29,158,117,0.4)",
                    whiteSpace: "nowrap",
                  }}
                >
                  MOST POPULAR
                </div>
              )}

              <div style={{ marginBottom: 20 }}>
                <p
                  style={{
                    color: p.highlight ? "rgba(255,255,255,0.5)" : C.muted,
                    fontSize: 12,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    margin: "0 0 6px",
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
                      fontSize: 40,
                      color: p.highlight ? C.white : C.ink,
                    }}
                  >
                    {p.price}
                  </span>
                  <span
                    style={{
                      color: p.highlight ? "rgba(255,255,255,0.4)" : C.muted,
                      fontSize: 14,
                      fontFamily: "'Barlow', sans-serif",
                    }}
                  >
                    {p.period}
                  </span>
                </div>
                <p
                  style={{
                    color: p.highlight ? "rgba(255,255,255,0.4)" : C.muted,
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
                  margin: "0 0 28px",
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                {p.features.map((f, j) => (
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
                      fill={C.green}
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
                        color: p.highlight ? "rgba(255,255,255,0.75)" : C.text,
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
                  background: p.highlight ? C.green : C.ink,
                  border: "none",
                  borderRadius: 10,
                  padding: "12px",
                  color: C.white,
                  fontWeight: 700,
                  fontSize: 14,
                  fontFamily: "'Barlow', sans-serif",
                  cursor: "pointer",
                  boxShadow: p.highlight
                    ? "0 6px 20px rgba(29,158,117,0.35)"
                    : "none",
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
function Testimonials() {
  const testimonials = [
    {
      quote:
        "SolidFlo cut our debtor days from 45 to 18. The automated reminders do the chasing for us — our clients pay on time now.",
      name: "Thabo Mokoena",
      role: "CA(SA), Mokoena & Associates, Johannesburg",
      avatar: "TM",
    },
    {
      quote:
        "The Xero integration is seamless. I create an invoice in SolidFlo and it's in our books instantly. Saves us hours every month.",
      name: "Suzanne van der Berg",
      role: "Bookkeeper, Van der Berg Accounting, Cape Town",
      avatar: "SV",
    },
    {
      quote:
        "SARS-compliant VAT invoices out of the box. Our external auditors have zero complaints — that alone is worth the subscription.",
      name: "Nomsa Khumalo",
      role: "Director, Khumalo Tax Solutions, Pretoria",
      avatar: "NK",
    },
  ];

  return (
    <section
      id="testimonials"
      style={{ background: C.surface, padding: "80px 24px" }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <p
            style={{
              color: C.green,
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
              color: C.ink,
              margin: 0,
              letterSpacing: -0.5,
            }}
          >
            Loved by SA accounting professionals
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))",
            gap: 20,
          }}
        >
          {testimonials.map((t, i) => (
            <div
              key={i}
              style={{
                background: C.white,
                borderRadius: 16,
                padding: "28px 24px",
                border: `1px solid ${C.border}`,
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              <div style={{ display: "flex", gap: 2 }}>
                {[...Array(5)].map((_, j) => (
                  <span key={j} style={{ color: C.green, fontSize: 16 }}>
                    ★
                  </span>
                ))}
              </div>
              <p
                style={{
                  color: C.text,
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
                  borderTop: `1px solid ${C.border}`,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: C.ink,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 800,
                    fontSize: 14,
                    color: C.white,
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
                      color: C.ink,
                      margin: 0,
                    }}
                  >
                    {t.name}
                  </p>
                  <p
                    style={{
                      fontFamily: "'Barlow', sans-serif",
                      fontSize: 12,
                      color: C.muted,
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

        {/* Stats strip */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            background: C.ink,
            borderRadius: 16,
            marginTop: 48,
            overflow: "hidden",
          }}
        >
          {[
            ["800+", "Active practices"],
            ["R 28M+", "Invoiced monthly"],
            ["4.9/5", "App store rating"],
            ["18 days", "Avg debtor days"],
          ].map(([v, l], i) => (
            <div
              key={i}
              style={{
                padding: "28px 24px",
                textAlign: "center",
                borderRight:
                  i < 3 ? "1px solid rgba(255,255,255,0.07)" : "none",
              }}
            >
              <div
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 900,
                  fontSize: 36,
                  color: C.green,
                }}
              >
                {v}
              </div>
              <div
                style={{
                  fontFamily: "'Barlow', sans-serif",
                  fontSize: 13,
                  color: "rgba(255,255,255,0.45)",
                  marginTop: 4,
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
function FAQ() {
  const [open, setOpen] = useState(null);
  const faqs = [
    {
      q: "Are invoices VAT-compliant for SARS?",
      a: "Absolutely. Every invoice includes your VAT registration number, correct VAT line items, the required SARS fields, and compliant date formatting. We stay updated with SARS guidelines automatically. You can also run a VAT Output report for your accountant or for e-filing.",
    },
    {
      q: "Which accounting software does SolidFlo integrate with?",
      a: "We integrate natively with Xero, Sage One (Accounting), and QuickBooks Online. Invoices and payment status sync automatically — no CSV exports or manual capturing needed.",
    },
    {
      q: "Can my clients pay via EFT?",
      a: "Yes. Your banking details are embedded on every invoice with a unique payment reference for easy reconciliation. We also support instant EFT via PayFast, and card payments through Peach Payments — all tracked and reconciled automatically.",
    },
    {
      q: "Is SolidFlo really free?",
      a: "Yes — our Starter plan is free forever. You get 5 invoices per month across up to 3 clients with no credit card required. When you're ready to grow, upgrade to Professional or Firm for unlimited invoicing.",
    },
    {
      q: "Is my client data stored securely in South Africa?",
      a: "Yes. All data is hosted within South Africa and is fully POPIA compliant. We use bank-grade encryption for data in transit and at rest, and perform regular independent security audits.",
    },
    {
      q: "Can multiple team members use the same account?",
      a: "The Firm plan includes 5 user seats. Each team member gets their own login with role-based permissions. Additional seats can be added on request. The Professional plan is single-user but can be upgraded at any time.",
    },
  ];

  return (
    <section id="faq" style={{ background: C.white, padding: "80px 24px" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <p
            style={{
              color: C.green,
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
              color: C.ink,
              margin: 0,
              letterSpacing: -0.5,
            }}
          >
            Questions accountants ask
          </h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {faqs.map((faq, i) => (
            <div
              key={i}
              style={{
                background: C.surface,
                borderRadius: 12,
                border: `1px solid ${open === i ? C.green : C.border}`,
                overflow: "hidden",
                transition: "border-color .2s",
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
                    color: C.ink,
                  }}
                >
                  {faq.q}
                </span>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={C.green}
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
                    borderTop: `1px solid ${C.border}`,
                  }}
                >
                  <p
                    style={{
                      color: C.muted,
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
function CTABanner({ onRegister }) {
  return (
    <section
      style={{
        background: C.ink,
        padding: "80px 24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          bottom: -60,
          left: -60,
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: C.green,
          opacity: 0.08,
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
            fontSize: "clamp(28px,4vw,52px)",
            color: C.white,
            margin: "0 0 16px",
            letterSpacing: -0.5,
          }}
        >
          Your practice, running smarter.
        </h2>
        <p
          style={{
            color: "rgba(255,255,255,0.45)",
            fontSize: 16,
            margin: "0 0 36px",
            fontFamily: "'Barlow', sans-serif",
          }}
        >
          Join 800+ South African accounting practices that bill professionally
          and get paid faster with SolidFlo.
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
              background: C.green,
              border: "none",
              borderRadius: 12,
              padding: "16px 36px",
              color: C.white,
              fontSize: 16,
              fontWeight: 800,
              fontFamily: "'Barlow Condensed', sans-serif",
              cursor: "pointer",
              letterSpacing: 0.5,
              boxShadow: "0 8px 28px rgba(29,158,117,0.45)",
            }}
          >
            START FOR FREE
          </button>
          <button
            onClick={() => scrollTo("pricing")}
            style={{
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 12,
              padding: "16px 28px",
              color: "rgba(255,255,255,0.7)",
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
            color: "rgba(255,255,255,0.2)",
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

/* ─── Footer ────────────────────────────────────────────────────────────── */
function Footer({ onLogin, onRegister }) {
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
        padding: "56px 24px 32px",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr repeat(3, 1fr)",
            gap: 40,
            marginBottom: 48,
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
                maxWidth: 220,
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

        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.06)",
            paddingTop: 24,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
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
            Proudly South African 🇿🇦 · 
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ─── App ───────────────────────────────────────────────────────────────── */
export default function SubdomainLandingPage() {
  const navigate = useNavigate();

  const goLogin = () => navigate("/login");
  const goRegister = () => navigate("/register");

  return (
    <>
      <Helmet>
        <title>Accounting Software for SA Practices | SolidFlo</title>
        <meta
          name="description"
          content="SARS-compliant invoicing, automated payment reminders, and cash flow dashboards built for South African accounting firms. Free plan available — start in 60 seconds."
        />
        <link rel="canonical" href="https://accounting.solidflo.co.za/" />

        <meta property="og:title" content="Accounting Software for SA Practices | SolidFlo" />
        <meta property="og:description" content="SARS-compliant invoicing and payment automation built for South African accounting firms." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://accounting.solidflo.co.za/" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Accounting Software for SA Practices | SolidFlo" />
        <meta name="twitter:description" content="SARS-compliant invoicing and payment automation built for South African accounting firms." />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "SolidFlo for Accounting Practices",
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Web",
            "offers": { "@type": "Offer", "price": "0", "priceCurrency": "ZAR" },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.9",
              "ratingCount": "800",
            },
          })}
        </script>
      </Helmet>
      <style>{fontStyle}</style>
      <div style={{ minHeight: "100vh", fontFamily: "'Barlow', sans-serif" }}>
        <Navbar onLogin={goLogin} onRegister={goRegister} />
        <Hero onRegister={goRegister} />
        <HowItWorks />
        <Features />
        <Pricing onRegister={goRegister} />
        <Testimonials />
        <FAQ />
        <CTABanner onRegister={goRegister} />
        <Footer onLogin={goLogin} onRegister={goRegister} />
      </div>
    </>
  );
}
