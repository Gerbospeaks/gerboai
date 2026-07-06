import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSubdomain } from "../../hooks/useSubdomain";
import { getIndustryConfig } from "../../config/industryConfig";
import logo from "../../assets/img/legal-logo.png"; 
import logotop from "../../assets/img/legal-logo-top.png";
import { HC, heroFontStyle } from "../../styles/landingTokens";
import google from "../../assets/google-play.png";
import Helmet from "react-helmet";
// ─── Font import ──────────────────────────────────────────────────────────────
const fontStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&family=Barlow:wght@400;500;600&display=swap');
`;
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
// ─── Scroll helper ────────────────────────────────────────────────────────────
function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

// ─── Grain texture overlay (matches carpentry WoodGrain) ─────────────────────
function GrainOverlay({ opacity = 0.04 }) {
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
      <filter id="grain">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.65"
          numOctaves="3"
          stitchTiles="stitch"
        />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#grain)" />
    </svg>
  );
}

// ─── Section divider (matches carpentry CraftDivider) ────────────────────────
function SectionDivider({ accent }) {
  return (
    <div
      style={{
        background: "#FAF5EE",
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
          background: `linear-gradient(to right, transparent, ${accent}44)`,
        }}
      />
      <span style={{ color: accent, fontSize: 14 }}>✦</span>
      <div
        style={{
          height: 1,
          flex: 1,
          background: `linear-gradient(to left, transparent, ${accent}44)`,
        }}
      />
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

// ─── Hero (restyled to match construction-style framed hero) ─────────────────
function Hero({ config, onRegister }) {
  return (
    <section
      style={{
        background: config.cream || "#FAF6EF",
        padding: "72px 24px 96px",
        position: "relative",
        overflow: "hidden",
        minHeight: "100vh",
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
          background: `radial-gradient(ellipse 70% 60% at 15% 30%, rgba(99,102,241,.08) 0%, transparent 60%), radial-gradient(ellipse 60% 70% at 90% 15%, ${config.accent}1F 0%, transparent 55%)`,
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
        {/* Left copy */}
        <div style={{ flex: "1 1 420px" }}>
          {/* Industry badge */}
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
            <span style={{ fontSize: 14 }}>{config.icon}</span>
            <span
              style={{
                color: config.accent,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.05em",
                fontFamily: "'Lato', sans-serif",
              }}
            >
              Purpose-Built for {config.label} Businesses
            </span>
          </div>

          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 700,
              fontSize: "clamp(2.6rem, 5vw, 4.2rem)",
              lineHeight: 1.1,
              color: config.navy || "#1A1208",
              margin: "0 0 24px",
            }}
          >
            {config.headline}
          </h1>

          <p
            style={{
              color: config.textMid || "#5B4C3A",
              fontSize: "clamp(1rem, 2vw, 1.2rem)",
              lineHeight: 1.7,
              margin: "0 0 40px",
              maxWidth: 480,
              fontFamily: "'Lato', sans-serif",
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
                border: `1.5px solid ${config.creamDark || "#E8D9C4"}`,
                borderRadius: 4,
                color: config.navy || "#1A1208",
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                fontFamily: "'Lato', sans-serif",
                cursor: "pointer",
                transition: "border-color .15s, background .15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = config.navy || "#1A1208";
                e.currentTarget.style.background = config.creamMid || "#F5EDE0";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = config.creamDark || "#E8D9C4";
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
              "Mobile-friendly",
              "SA-built & hosted",
            ].map((t) => (
              <span
                key={t}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  color: config.textMuted || "#8C7B6B",
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: "0.03em",
                  fontFamily: "'Lato', sans-serif",
                }}
              >
                <span style={{ color: config.accent, fontSize: 10 }}>✦</span>
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Right: Invoice preview */}
        <div style={{ flex: "1 1 340px", display: "flex", justifyContent: "center" }}>
          <div style={{ position: "relative", width: "100%", maxWidth: 460 }}>
            {/* Floating badge */}
            <div
              style={{
                position: "absolute",
                top: -18,
                right: -18,
                zIndex: 2,
                background: "#16A34A",
                color: "#fff",
                borderRadius: 10,
                padding: "8px 14px",
                fontSize: 12,
                fontWeight: 700,
                boxShadow: "0 8px 20px rgba(22,163,74,0.4)",
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontFamily: "'Lato', sans-serif",
              }}
            >
              <span>💰</span> Payment received!
            </div>

            {/* Invoice card */}
            <div
              style={{
                background: "#fff",
                borderRadius: 16,
                boxShadow: "0 32px 80px rgba(26,18,8,0.20)",
                overflow: "hidden",
                border: "1px solid #E8D9C4",
                fontFamily: "'Lato', sans-serif",
              }}
            >
              {/* Chrome bar */}
              <div
                style={{
                  background: "#F5EDE0",
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
                    background: "#fff",
                    borderRadius: 6,
                    height: 22,
                    margin: "0 12px",
                    display: "flex",
                    alignItems: "center",
                    paddingLeft: 10,
                  }}
                >
                  <span style={{ fontSize: 11, color: "#8C7B6B" }}>
                    solidflo.co.za/{config.label.toLowerCase()}/INV-2025
                  </span>
                </div>
              </div>

              {/* Invoice header */}
              <div
                style={{
                  padding: "20px 24px 16px",
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
                    <img src={logotop} width={100} alt="" />
                    <p style={{ fontSize: 12, color: "#8C7B6B", margin: 0 }}>
                      South African Business
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
                        color: "#1A1208",
                        margin: 0,
                      }}
                    >
                      INV-0042
                    </p>
                    <p style={{ fontSize: 11, color: "#8C7B6B", margin: 0 }}>
                      Issued 1 Apr 2025
                    </p>
                  </div>
                </div>
              </div>

              {/* Line items */}
              <div style={{ padding: "0 24px" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: 12,
                  }}
                >
                  <thead>
                    <tr style={{ borderBottom: "1px solid #E8D9C4" }}>
                      {["Description", "Qty", "Unit Price", "Total"].map(
                        (h) => (
                          <th
                            key={h}
                            style={{
                              padding: "10px 0 8px",
                              color: "#8C7B6B",
                              fontWeight: 600,
                              textAlign: h === "Description" ? "left" : "right",
                              fontSize: 11,
                            }}
                          >
                            {h}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {(
                      config.invoiceLines || [
                        {
                          desc: "Professional Services (8h)",
                          qty: 1,
                          unit: "R3 200.00",
                          total: "R3 200.00",
                        },
                        {
                          desc: "Consultation & Advice",
                          qty: 2,
                          unit: "R800.00",
                          total: "R1 600.00",
                        },
                        {
                          desc: "Document Preparation",
                          qty: 1,
                          unit: "R650.00",
                          total: "R650.00",
                        },
                        {
                          desc: "Filing & Administration",
                          qty: 1,
                          unit: "R350.00",
                          total: "R350.00",
                        },
                      ]
                    ).map((r, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #E8D9C4" }}>
                        <td style={{ padding: "9px 0", color: "#2D1F0E" }}>
                          {r.desc}
                        </td>
                        <td
                          style={{
                            padding: "9px 0",
                            textAlign: "right",
                            color: "#8C7B6B",
                          }}
                        >
                          {r.qty}
                        </td>
                        <td
                          style={{
                            padding: "9px 0",
                            textAlign: "right",
                            color: "#8C7B6B",
                          }}
                        >
                          {r.unit}
                        </td>
                        <td
                          style={{
                            padding: "9px 0",
                            textAlign: "right",
                            fontWeight: 600,
                            color: "#1A1208",
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
                  ["Subtotal", "R5 800.00"],
                  ["VAT (15%)", "R870.00"],
                ].map(([l, v]) => (
                  <div
                    key={l}
                    style={{ display: "flex", gap: 32, fontSize: 12 }}
                  >
                    <span style={{ color: "#8C7B6B" }}>{l}</span>
                    <span
                      style={{
                        color: "#2D1F0E",
                        minWidth: 80,
                        textAlign: "right",
                      }}
                    >
                      {v}
                    </span>
                  </div>
                ))}
                <div
                  style={{
                    display: "flex",
                    gap: 32,
                    background: "#1A1208",
                    borderRadius: 8,
                    padding: "6px 14px",
                    marginTop: 6,
                  }}
                >
                  <span
                    style={{
                      color: "rgba(245,230,211,0.7)",
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    Total Due
                  </span>
                  <span
                    style={{
                      color: "#F5E6D3",
                      fontWeight: 800,
                      fontSize: 15,
                      minWidth: 80,
                      textAlign: "right",
                      fontFamily: "'Playfair Display', serif",
                    }}
                  >
                    R6 670.00
                  </span>
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div style={{ display: "flex", gap: 12, marginTop: 14 }}>
              {[
                ["R 48 400", "This Month"],
                ["9", "Active Jobs"],
                ["4.9★", "Client Rating"],
              ].map(([v, l]) => (
                <div
                  key={l}
                  style={{
                    flex: 1,
                    background: "#fff",
                    border: `1px solid ${config.creamDark || "#E8D9C4"}`,
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
                      color: config.navy || "#1A1208",
                    }}
                  >
                    {v}
                  </div>
                  <div style={{ fontSize: 11, color: config.textMuted || "#8C7B6B" }}>
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
            color: config.textMuted || "#8C7B6B",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            fontFamily: "'Lato', sans-serif",
          }}
        >
          Trusted by SA {config.label.toLowerCase()} businesses
        </span>
        {(
          config.trustedBy || [
            "Trusted Business A",
            "Trusted Business B",
            "Trusted Business C",
            "Trusted Business D",
          ]
        ).map((b) => (
          <span
            key={b}
            style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 600,
              fontSize: 15,
              color: config.textMuted || "#8C7B6B",
            }}
          >
            {b}
          </span>
        ))}
      </div>
    </section>
  );
}
// ─── How It Works ─────────────────────────────────────────────────────────────
function HowItWorks({ config }) {
  const steps = config.howItWorks || [
    {
      icon: "📋",
      title: "Build a Quote",
      desc: "Log the client, services, and pricing. Send a professional itemised quote in minutes — straight from your phone on site.",
    },
    {
      icon: "📩",
      title: "Send the Invoice",
      desc: "One tap sends a VAT-compliant invoice via email, SMS, or WhatsApp PDF. Clients get it instantly — no chasing, no printing.",
    },
    {
      icon: "💳",
      title: "Get Paid Instantly",
      desc: "Customers pay via EFT, PayFast, or SnapScan. Get notified the moment money lands. No more awkward end-of-month calls.",
    },
  ];

  return (
    <section
      style={{
        background: "#fff",
        padding: "80px 24px",
        fontFamily: "'Barlow', sans-serif",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <p
            style={{
              color: config.accent,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 3,
              textTransform: "uppercase",
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
              color: "#1A1208",
              margin: 0,
              letterSpacing: -0.5,
            }}
          >
            Quote and invoice in 60 seconds.
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
                background: i === 1 ? "#1A1208" : "#FAF5EE",
                borderRadius: 16,
                padding: "36px 32px",
                border: `1px solid ${i === 1 ? "transparent" : "#E8D9C4"}`,
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
                  color: i === 1 ? `${config.accent}12` : "rgba(26,18,8,0.06)",
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
                  color: i === 1 ? "#F5E6D3" : "#1A1208",
                  margin: "0 0 10px",
                }}
              >
                {s.title}
              </h3>
              <p
                style={{
                  color: i === 1 ? "rgba(245,230,211,0.55)" : "#8C7B6B",
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
                    background: config.accent,
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

// ─── Features ─────────────────────────────────────────────────────────────────
function Features({ config }) {
  return (
    <section
      id="features"
      style={{
        background: "#FAF5EE",
        padding: "80px 24px",
        fontFamily: "'Barlow', sans-serif",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <p
            style={{
              color: config.accent,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 3,
              textTransform: "uppercase",
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
              color: "#1A1208",
              margin: "0 0 12px",
              letterSpacing: -0.5,
            }}
          >
            Every tool your {config.label.toLowerCase()} business needs
          </h2>
          <p
            style={{
              color: "#8C7B6B",
              fontSize: 15,
              maxWidth: 520,
              margin: "0 auto",
            }}
          >
            No bloat. No irrelevant features. Just what a{" "}
            {config.label.toLowerCase()} professional actually uses every day.
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
                background: "#fff",
                borderRadius: 14,
                padding: "24px 22px",
                border: `1px solid ${config.accent}26`,
                transition: "box-shadow .2s, transform .2s, border-color .2s",
                cursor: "default",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = `0 8px 32px ${config.accent}1F`;
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.borderColor = `${config.accent}73`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = `${config.accent}26`;
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: config.lightBg,
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
                  color: "#1A1208",
                  margin: "0 0 6px",
                }}
              >
                {f.title}
              </h3>
              <p
                style={{
                  color: "#8C7B6B",
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

// ─── Pricing ──────────────────────────────────────────────────────────────────
function Pricing({ config, onRegister }) {
  return (
    <section
      id="pricing"
      style={{
        background: "#fff",
        padding: "80px 24px",
        fontFamily: "'Barlow', sans-serif",
      }}
    >
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <p
            style={{
              color: config.accent,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 3,
              textTransform: "uppercase",
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
              color: "#1A1208",
              margin: "0 0 12px",
              letterSpacing: -0.5,
            }}
          >
            Honest pricing. No surprises.
          </h2>
          <p style={{ color: "#8C7B6B", fontSize: 15 }}>
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
                background: plan.highlight ? "#1A1208" : "#FAF5EE",
                border: plan.highlight
                  ? `2px solid ${config.accent}`
                  : "1px solid #E8D9C4",
                display: "flex",
                flexDirection: "column",
                position: "relative",
                boxShadow: plan.highlight
                  ? "0 20px 60px rgba(26,18,8,0.35)"
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
                    background: config.accent,
                    color: "#fff",
                    fontSize: 11,
                    fontWeight: 800,
                    padding: "5px 16px",
                    borderRadius: 99,
                    letterSpacing: "0.08em",
                    boxShadow: `0 4px 12px ${config.accent}66`,
                    whiteSpace: "nowrap",
                  }}
                >
                  MOST POPULAR
                </div>
              )}

              <div style={{ marginBottom: 20 }}>
                <p
                  style={{
                    color: plan.highlight
                      ? "rgba(245,230,211,0.5)"
                      : config.accent,
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
                      color: plan.highlight ? "#F5E6D3" : "#1A1208",
                    }}
                  >
                    {plan.price}
                  </span>
                  <span
                    style={{
                      color: plan.highlight
                        ? "rgba(245,230,211,0.4)"
                        : "#8C7B6B",
                      fontSize: 14,
                    }}
                  >
                    {plan.period}
                  </span>
                </div>
                <p
                  style={{
                    color: plan.highlight ? "rgba(245,230,211,0.4)" : "#8C7B6B",
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
                        color: plan.highlight
                          ? "rgba(245,230,211,0.75)"
                          : "#2D1F0E",
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
                  background: plan.highlight ? config.accent : "#1A1208",
                  border: "none",
                  borderRadius: 10,
                  padding: "12px",
                  color: "#F5E6D3",
                  fontWeight: 700,
                  fontSize: 14,
                  fontFamily: "'Barlow', sans-serif",
                  cursor: "pointer",
                  boxShadow: plan.highlight
                    ? `0 6px 20px ${config.accent}59`
                    : "none",
                }}
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
  return (
    <section
      id="testimonials"
      style={{
        background: "#FAF5EE",
        padding: "80px 24px",
        fontFamily: "'Barlow', sans-serif",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <p
            style={{
              color: config.accent,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 3,
              textTransform: "uppercase",
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
              color: "#1A1208",
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
                background: "#fff",
                borderRadius: 16,
                padding: "28px 24px",
                border: `1px solid ${config.accent}26`,
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              <div style={{ display: "flex", gap: 2 }}>
                {[...Array(5)].map((_, j) => (
                  <span key={j} style={{ color: config.accent, fontSize: 16 }}>
                    ★
                  </span>
                ))}
              </div>
              <p
                style={{
                  color: "#2D1F0E",
                  fontSize: 14,
                  lineHeight: 1.75,
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
                  borderTop: `1px solid ${config.accent}1F`,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: config.accentDark || config.accent,
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
                      color: "#1A1208",
                      margin: 0,
                    }}
                  >
                    {t.name}
                  </p>
                  <p style={{ fontSize: 12, color: "#8C7B6B", margin: 0 }}>
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
            background: "#1A1208",
            borderRadius: 16,
            marginTop: 48,
            overflow: "hidden",
          }}
        >
          {(
            config.stats || [
              ["500+", "Active businesses"],
              ["700+", "Invoices monthly"],
              ["4.9/5", "App store rating"],
              ["60%", "Faster payments"],
            ]
          ).map(([v, l], i, arr) => (
            <div
              key={i}
              style={{
                padding: "28px 24px",
                textAlign: "center",
                borderRight:
                  i < arr.length - 1 ? `1px solid ${config.accent}1A` : "none",
              }}
            >
              <div
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 900,
                  fontSize: 36,
                  color: config.accent,
                }}
              >
                {v}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "rgba(245,230,211,0.4)",
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

// ─── FAQ ──────────────────────────────────────────────────────────────────────
function FAQ({ config }) {
  const [open, setOpen] = useState(null);

  return (
    <section
      id="faq"
      style={{
        background: "#fff",
        padding: "80px 24px",
        fontFamily: "'Barlow', sans-serif",
      }}
    >
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <p
            style={{
              color: config.accent,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 3,
              textTransform: "uppercase",
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
              color: "#1A1208",
              margin: 0,
              letterSpacing: -0.5,
            }}
          >
            Questions {config.label.toLowerCase()} businesses ask
          </h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {config.faqs.map((faq, i) => (
            <div
              key={i}
              style={{
                background: open === i ? config.lightBg : "#FAF5EE",
                borderRadius: 12,
                border: `1px solid ${open === i ? config.accent : "#E8D9C4"}`,
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
                    color: "#1A1208",
                  }}
                >
                  {faq.q}
                </span>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={config.accent}
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
                    borderTop: `1px solid ${config.accent}33`,
                    paddingTop: 14,
                  }}
                >
                  <p
                    style={{
                      color: "#8C7B6B",
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

// ─── CTA Banner ───────────────────────────────────────────────────────────────
function CTABanner({ config, onRegister }) {
  return (
    <section
      style={{
        background: config.color,
        padding: "80px 24px",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Barlow', sans-serif",
      }}
    >
      <GrainOverlay opacity={0.04} />
     

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
            color: "#F5E6D3",
            margin: "0 0 16px",
            letterSpacing: -0.5,
          }}
        >
          Your {config.label.toLowerCase()} business, running smarter.
        </h2>
        <p
          style={{
            color: "rgba(245,230,211,0.4)",
            fontSize: 16,
            margin: "0 0 36px",
          }}
        >
          Join hundreds of South African {config.label.toLowerCase()} businesses
          that invoice professionally and get paid faster with SolidFlo.
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
              background: config.accent,
              border: "none",
              borderRadius: 12,
              padding: "16px 36px",
              color: "#fff",
              fontSize: 16,
              fontWeight: 800,
              fontFamily: "'Barlow Condensed', sans-serif",
              cursor: "pointer",
              letterSpacing: 0.5,
              boxShadow: `0 8px 28px ${config.accent}73`,
            }}
          >
            START FOR FREE
          </button>
          <button
            onClick={() => scrollTo("pricing")}
            style={{
              background: `${config.accent}1A`,
              border: `1px solid ${config.accent}4D`,
              borderRadius: 12,
              padding: "16px 28px",
              color: "rgba(245,230,211,0.7)",
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            See all plans →
          </button>
        </div>
        <p
          style={{
            color: "rgba(245,230,211,0.2)",
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
            Proudly South African 🇿🇦 ·
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
  localStorage.setItem("pendingDashboardId", "legal"); // use the real id
  navigate("/register?industry=legal");
};

  return (
    <>
    <Helmet>
  <title>{config.metaTitle || `Invoicing & Billing Software for Legal Practices | SolidFlo`}</title>
  <meta
    name="description"
    content={
      config.metaDescription ||
      "Bill clients, track matters, and send professional VAT-compliant invoices in minutes. Built for South African attorneys, law firms, and legal practitioners. Free plan available, no credit card required."
    }
  />
  <link rel="canonical" href={`https://${subdomain}.solidflo.co.za/`} />

  {/* Open Graph */}
  <meta property="og:site_name" content="SolidFlo" />
  <meta
    property="og:title"
    content={config.metaTitle || `Invoicing & Billing Software for Legal Practices | SolidFlo`}
  />
  <meta
    property="og:description"
    content={
      config.metaDescription ||
      "Client billing and VAT-compliant invoicing built for South African legal practices."
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
    content={config.metaTitle || `Invoicing & Billing Software for Legal Practices | SolidFlo`}
  />
  <meta
    name="twitter:description"
    content={
      config.metaDescription ||
      "Client billing and invoicing — built for South African legal practices."
    }
  />
  <meta name="twitter:image" content={`https://${subdomain}.solidflo.co.za/og-image.jpg`} />

  {/* Structured data: software */}
  <script type="application/ld+json">
    {JSON.stringify({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": `SolidFlo for ${config.label || "Legal Practices"}`,
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
        <Navbar config={config} onLogin={goLogin} onRegister={goRegister} />
        <Hero config={config} onRegister={goRegister} />
        <SectionDivider accent={config.accent} />
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
