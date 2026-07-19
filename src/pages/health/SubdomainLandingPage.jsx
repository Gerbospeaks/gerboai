import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/img/healthcare-logo.png"
import logotop from "../../assets/img/healthcare-logo-top.png"
import { HC, heroFontStyle } from "../../styles/landingTokens";
import google from "../../assets/google-play.png";
import Helmet from "react-helmet";
const fontStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&family=Barlow:wght@400;500;600&display=swap');
`;

/* ─── Design Tokens ────────────────────────────────────────────────────── */
const C = {
  ink: "#0C1824", // deep navy
  ink2: "#132033", // mid navy
  surface: "#EEF4F7", // cool clinical off-white
  white: "#FFFFFF",
  teal: "#1BA8B0", // primary accent — medical teal
  tealD: "#0F7A82", // darker accent
  tealL: "#C4EAF0", // light tint
  border: "#D6E8EC",
  text: "#111D28",
  muted: "#6B8794",
};

/* ─── Scroll helper ─────────────────────────────────────────────────────── */
const scrollTo = (id) =>
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

/* ─── Medical Cross Texture ─────────────────────────────────────────────── */
function MedTexture({ opacity = 0.04 }) {
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
      <filter id="mt">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.68"
          numOctaves="4"
          stitchTiles="stitch"
        />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#mt)" />
    </svg>
  );
}

/* ─── Mock Invoice UI ───────────────────────────────────────────────────── */
function MockInvoice() {
  return (
    <div
      style={{
        background: C.white,
        borderRadius: 16,
        boxShadow: "0 32px 80px rgba(12,24,36,0.32)",
        overflow: "hidden",
        fontFamily: "'Barlow', sans-serif",
        border: `1px solid ${C.border}`,
        maxWidth: 520,
        width: "100%",
      }}
    >
      {/* Chrome bar */}
      <div
        style={{
          background: "#E8F2F5",
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
            background: C.white,
            borderRadius: 6,
            height: 22,
            margin: "0 12px",
            display: "flex",
            alignItems: "center",
            paddingLeft: 10,
          }}
        >
          <span style={{ fontSize: 11, color: C.muted }}>
            solidflo.co.za/healthcare/INV-2024
          </span>
        </div>
      </div>

      {/* Invoice header */}
      <div
        style={{
          padding: "20px 24px 16px",
          borderBottom: `2px solid ${C.teal}`,
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
              <span style={{ fontSize: 22 }}>
                <img src={logotop} width={140} alt="SolidFlo" />
              </span>
              
            </div>
            <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>
              Dr. Naidoo Family Practice
            </p>
            <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>
              Sandton, Johannesburg
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
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 800,
                fontSize: 20,
                color: C.ink,
                margin: 0,
              }}
            >
              INV-0112
            </p>
            <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>
              Issued 02 Apr 2025
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
            <tr style={{ borderBottom: `1px solid ${C.border}` }}>
              {["Description", "Qty", "Unit Price", "Total"].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "10px 0 8px",
                    color: C.muted,
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
                desc: "GP Consultation – New Patient (30 min)",
                qty: 1,
                unit: "R950.00",
                total: "R950.00",
              },
              {
                desc: "Blood Pressure & BMI Screening",
                qty: 1,
                unit: "R220.00",
                total: "R220.00",
              },
              {
                desc: "Pathology Referral & Admin Fee",
                qty: 1,
                unit: "R180.00",
                total: "R180.00",
              },
              {
                desc: "Medical Certificate",
                qty: 1,
                unit: "R120.00",
                total: "R120.00",
              },
            ].map((r, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                <td style={{ padding: "9px 0", color: C.text }}>{r.desc}</td>
                <td
                  style={{
                    padding: "9px 0",
                    textAlign: "right",
                    color: C.muted,
                  }}
                >
                  {r.qty}
                </td>
                <td
                  style={{
                    padding: "9px 0",
                    textAlign: "right",
                    color: C.muted,
                  }}
                >
                  {r.unit}
                </td>
                <td
                  style={{
                    padding: "9px 0",
                    textAlign: "right",
                    fontWeight: 600,
                    color: C.ink,
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
          ["Subtotal", "R1 470.00"],
          ["VAT (15%)", "R220.50"],
        ].map(([l, v]) => (
          <div key={l} style={{ display: "flex", gap: 32, fontSize: 12 }}>
            <span style={{ color: C.muted }}>{l}</span>
            <span style={{ color: C.text, minWidth: 80, textAlign: "right" }}>
              {v}
            </span>
          </div>
        ))}
        <div
          style={{
            display: "flex",
            gap: 32,
            background: C.ink,
            borderRadius: 8,
            padding: "6px 14px",
            marginTop: 6,
          }}
        >
          <span
            style={{
              color: "rgba(200,234,240,0.7)",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Total Due
          </span>
          <span
            style={{
              color: "#C4EAF0",
              fontWeight: 800,
              fontSize: 15,
              minWidth: 80,
              textAlign: "right",
            }}
          >
            R1 690.50
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
/* ─── Hero (healthcare, restyled to match construction-style framed hero) ── */
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

      {/* Ambient glow, tinted with teal */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 70% 60% at 15% 30%, rgba(99,102,241,.08) 0%, transparent 60%), radial-gradient(ellipse 60% 70% at 90% 15%, rgba(27,168,176,.12) 0%, transparent 55%)",
          pointerEvents: "none",
        }}
      />

      {/* Subtle hex/dot grid — kept as a light callback to the original texture */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(circle, rgba(27,168,176,0.08) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
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
              background: "rgba(27,168,176,0.1)",
              border: "1px solid rgba(27,168,176,0.28)",
              borderRadius: 99,
              padding: "6px 14px",
              marginBottom: 28,
            }}
          >
            <span style={{ fontSize: 14 }}>🏥</span>
            <span
              style={{
                color: C.teal,
                fontSize: 12,
                fontWeight: 700,
                fontFamily: "'Lato', sans-serif",
              }}
            >
              Purpose-Built for African Healthcare Practices
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
            Billing Built for
            <br />
            <em style={{ fontStyle: "italic", color: C.teal }}>the Consulting Room,</em>
            <br />
            Not the Back Office.
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
            Send professional invoices, manage medical aid claims, and get
            paid on time — purpose-built for African GPs, specialists,
            and allied health practitioners.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 40 }}>
            <button
              onClick={onRegister}
              style={{
                height: 52,
                padding: "0 32px",
                background: C.teal,
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
          Trusted By African healthcare practitioners
        </span>
        {[
          "Dr. Naidoo Family Practice",
          "Khoza Physiotherapy",
          "Cape Town Dental Studio",
          "Botha Specialist Centre",
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
/* ─── Pulse Divider ─────────────────────────────────────────────────────── */
function PulseDivider() {
  return (
    <div
      style={{
        background: C.surface,
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
          background: `linear-gradient(to right, transparent, rgba(27,168,176,0.3))`,
        }}
      />
      <span style={{ color: C.teal, fontSize: 14 }}>✦</span>
      <div
        style={{
          height: 1,
          flex: 1,
          background: `linear-gradient(to left, transparent, rgba(27,168,176,0.3))`,
        }}
      />
    </div>
  );
}

/* ─── How It Works ─────────────────────────────────────────────────────── */
function HowItWorks() {
  const steps = [
    {
      icon: "📋",
      title: "Capture the Consultation",
      desc: "Log the patient, tariff codes, procedures, and consumables in seconds. Generate a professional itemised invoice straight from your tablet between appointments.",
    },
    {
      icon: "📩",
      title: "Send the Invoice",
      desc: "One tap sends a compliant invoice via email, SMS, or WhatsApp PDF. Patients and medical aids get it instantly — no printing, no delays.",
    },
    {
      icon: "💳",
      title: "Get Paid Instantly",
      desc: "Patients pay via EFT, PayFast, or SnapScan. Medical aid remittances are tracked automatically. You're notified the moment funds arrive.",
    },
  ];

  return (
    <section style={{ background: C.white, padding: "80px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <p
            style={{
              color: C.teal,
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
            Invoice a patient in under 60 seconds.
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
                    i === 1 ? "rgba(27,168,176,0.07)" : "rgba(12,24,36,0.06)",
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
                  color: i === 1 ? "#EEF6F8" : C.ink,
                  margin: "0 0 10px",
                }}
              >
                {s.title}
              </h3>
              <p
                style={{
                  color: i === 1 ? "rgba(200,234,240,0.55)" : C.muted,
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
                    background: C.teal,
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
      icon: "📋",
      title: "Tariff Code Library",
      desc: "NHRPL and BHF tariff codes built in. Select a procedure and the correct billing rate populates automatically — no manual lookups, no billing errors.",
    },
    {
      icon: "🏥",
      title: "Medical Aid Claims",
      desc: "Track claims per medical aid scheme and remittance status in one place. Know exactly what's been paid, what's outstanding, and what's been rejected.",
    },
    {
      icon: "🗂️",
      title: "Patient Records",
      desc: "Full billing history for every patient. See all past invoices, payment status, and medical aid details the moment a patient calls.",
    },
    {
      icon: "💳",
      title: "Instant Co-payment Collection",
      desc: "Collect patient co-payments via EFT, PayFast, or SnapScan — embedded on every invoice. Patients pay before they leave the waiting room.",
    },
    {
      icon: "📦",
      title: "Consumables Tracking",
      desc: "Log dressings, syringes, and consumables per encounter so nothing gets missed on the invoice. Protect your margins on every procedure.",
    },
    {
      icon: "📊",
      title: "Practice Reports",
      desc: "Monthly revenue, outstanding balances, scheme breakdowns, and collection rates at a glance. Run a tighter, more profitable practice.",
    },
    {
      icon: "🔔",
      title: "Automated Reminders",
      desc: "Politely chase outstanding co-payments and unresolved claims on autopilot — so your front desk can focus on patients, not admin.",
    },
    {
      icon: "📱",
      title: "Mobile-First",
      desc: "Invoice patients between consultations from your phone or tablet. Fully mobile-responsive — works perfectly on ward rounds.",
    },
    {
      icon: "🧾",
      title: "SARS & HPCSA Compliant",
      desc: "Every invoice meets SARS VAT requirements and HPCSA billing guidelines. Audit-ready, fully compliant from day one.",
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
              color: C.teal,
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
            Every tool your practice needs
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
            No bloat. No irrelevant features. Just what a healthcare
            practitioner actually uses every day.
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
                border: `1px solid rgba(27,168,176,0.15)`,
                transition: "box-shadow .2s, transform .2s, border-color .2s",
                cursor: "default",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 8px 32px rgba(27,168,176,0.12)";
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.borderColor = "rgba(27,168,176,0.45)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = "rgba(27,168,176,0.15)";
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: C.tealL,
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
      name: "Solo",
      price: "Free",
      period: "forever",
      desc: "For solo practitioners just getting started",
      features: [
        "10 invoices / month",
        "Basic tariff code lookup",
        "Patient records",
        "PDF export",
        "Email support",
      ],
      cta: "Get Started Free",
    },
    {
      name: "Practice",
      price: "R399",
      period: "/month",
      desc: "For established private practices",
      highlight: true,
      features: [
        "Unlimited invoices & claims",
        "Medical aid claim tracking",
        "Consumables log",
        "Payment links (EFT, PayFast)",
        "Monthly practice reports",
        "Email & WhatsApp delivery",
        "Automated payment reminders",
      ],
      cta: "Start 14-Day Free Trial",
    },
    {
      name: "Clinic",
      price: "R799",
      period: "/month",
      desc: "For multi-practitioner clinics",
      features: [
        "Everything in Practice",
        "Up to 8 practitioners",
        "Per-practitioner reporting",
        "Custom invoice branding",
        "Xero / Sage sync",
        "Priority support",
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
              color: C.teal,
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
            Start free. Upgrade when your practice is ready to grow.
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
                  ? `2px solid ${C.teal}`
                  : `1px solid ${C.border}`,
                display: "flex",
                flexDirection: "column",
                position: "relative",
                boxShadow: p.highlight
                  ? "0 20px 60px rgba(12,24,36,0.35)"
                  : "none",
              }}
            >
              {p.highlight && (
                <div
                  style={{
                    position: "absolute",
                    top: -14,
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: C.teal,
                    color: C.white,
                    fontSize: 11,
                    fontWeight: 800,
                    padding: "5px 16px",
                    borderRadius: 99,
                    fontFamily: "'Barlow', sans-serif",
                    letterSpacing: "0.08em",
                    boxShadow: "0 4px 12px rgba(27,168,176,0.4)",
                    whiteSpace: "nowrap",
                  }}
                >
                  MOST POPULAR
                </div>
              )}

              <div style={{ marginBottom: 20 }}>
                <p
                  style={{
                    color: p.highlight ? "rgba(200,234,240,0.5)" : C.teal,
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
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
                      color: p.highlight ? "#EEF6F8" : C.ink,
                    }}
                  >
                    {p.price}
                  </span>
                  <span
                    style={{
                      color: p.highlight ? "rgba(200,234,240,0.4)" : C.muted,
                      fontSize: 14,
                      fontFamily: "'Barlow', sans-serif",
                    }}
                  >
                    {p.period}
                  </span>
                </div>
                <p
                  style={{
                    color: p.highlight ? "rgba(200,234,240,0.4)" : C.muted,
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
                      fill={C.teal}
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
                        color: p.highlight ? "rgba(200,234,240,0.75)" : C.text,
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
                  background: p.highlight ? C.teal : C.ink,
                  border: "none",
                  borderRadius: 10,
                  padding: "12px",
                  color: p.highlight ? C.white : "#EEF6F8",
                  fontWeight: 700,
                  fontSize: 14,
                  fontFamily: "'Barlow', sans-serif",
                  cursor: "pointer",
                  boxShadow: p.highlight
                    ? "0 6px 20px rgba(27,168,176,0.35)"
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
        "I used to lose 2 hours a week chasing co-payments. SolidFlo sends the reminder automatically. My front desk can finally focus on patients instead of invoices.",
      name: "Dr. Priya Naidoo",
      role: "GP, Sandton",
      avatar: "PN",
    },
    {
      quote:
        "The medical aid claim tracker is a game-changer. I can see exactly which schemes owe me money and follow up on rejected claims before they disappear.",
      name: "Sipho Khoza",
      role: "Physiotherapist, Durban",
      avatar: "SK",
    },
    {
      quote:
        "My collection rate went from 71% to 94% in three months. The payment link on the invoice makes it embarrassingly easy for patients to pay on the spot.",
      name: "Dr. Elsa Botha",
      role: "Specialist, Cape Town",
      avatar: "EB",
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
              color: C.teal,
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
            Trusted by practitioners across SA
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
                border: `1px solid rgba(27,168,176,0.15)`,
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              <div style={{ display: "flex", gap: 2 }}>
                {[...Array(5)].map((_, j) => (
                  <span key={j} style={{ color: C.teal, fontSize: 16 }}>
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
                  borderTop: `1px solid rgba(27,168,176,0.12)`,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: C.tealD,
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
            ["700+", "Active practices"],
            ["1200+", "Billed monthly"],
            ["4.9/5", "App store rating"],
            ["94%", "Avg collection rate"],
          ].map(([v, l], i) => (
            <div
              key={i}
              style={{
                padding: "28px 24px",
                textAlign: "center",
                borderRight: i < 3 ? "1px solid rgba(27,168,176,0.1)" : "none",
              }}
            >
              <div
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 900,
                  fontSize: 36,
                  color: C.teal,
                }}
              >
                {v}
              </div>
              <div
                style={{
                  fontFamily: "'Barlow', sans-serif",
                  fontSize: 13,
                  color: "rgba(200,234,240,0.4)",
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
      q: "Is SolidFlo built specifically for healthcare practices?",
      a: "Yes. The tariff code library, medical aid claim tracking, and HPCSA-compliant invoice templates are all designed around how African healthcare practices actually bill — not adapted from generic invoicing software.",
    },
    {
      q: "Does it support NHRPL and BHF tariff codes?",
      a: "Yes. SolidFlo includes a built-in tariff code library for common NHRPL and BHF codes. Select a procedure and the correct billing rate populates automatically, reducing errors and saving time on every invoice.",
    },
    {
      q: "Can I track medical aid claims separately from private patients?",
      a: "Absolutely. You can tag invoices by payment type — medical aid scheme or private — and track each claim's status from submission through to remittance or rejection, all in one dashboard.",
    },
    {
      q: "Is SolidFlo really free?",
      a: "Yes — our Solo plan is free forever. You get 10 invoices per month with no credit card required. When your practice grows, upgrade to Practice or Clinic for unlimited billing and medical aid tracking.",
    },
    {
      q: "What if I have a receptionist or billing administrator?",
      a: "The Clinic plan supports up to 8 users, each with their own login and role-based access. Your billing admin can manage invoices while you stay focused on patients.",
    },
    {
      q: "Can I import my existing patient records?",
      a: "Yes, you can import patient details via CSV. Our support team can also help migrate data from existing practice management software — free of charge.",
    },
  ];

  return (
    <section id="faq" style={{ background: C.white, padding: "80px 24px" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <p
            style={{
              color: C.teal,
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
            Questions practitioners ask
          </h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {faqs.map((faq, i) => (
            <div
              key={i}
              style={{
                background: open === i ? C.tealL : C.surface,
                borderRadius: 12,
                border: `1px solid ${open === i ? C.teal : C.border}`,
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
                  stroke={C.teal}
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
                    borderTop: `1px solid rgba(27,168,176,0.2)`,
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
      <MedTexture opacity={0.04} />
      
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
            color: "#EEF6F8",
            margin: "0 0 16px",
            letterSpacing: -0.5,
          }}
        >
          Your practice, running smarter.
        </h2>
        <p
          style={{
            color: "rgba(200,234,240,0.4)",
            fontSize: 16,
            margin: "0 0 36px",
            fontFamily: "'Barlow', sans-serif",
          }}
        >
          Join 700+ African practitioners and clinics that bill
          professionally and get paid faster with SolidFlo.
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
              background: C.teal,
              border: "none",
              borderRadius: 12,
              padding: "16px 36px",
              color: C.white,
              fontSize: 16,
              fontWeight: 800,
              fontFamily: "'Barlow Condensed', sans-serif",
              cursor: "pointer",
              letterSpacing: 0.5,
              boxShadow: "0 8px 28px rgba(27,168,176,0.45)",
            }}
          >
            START FOR FREE
          </button>
          <button
            onClick={() => scrollTo("pricing")}
            style={{
              background: "rgba(27,168,176,0.1)",
              border: "1px solid rgba(27,168,176,0.3)",
              borderRadius: 12,
              padding: "16px 28px",
              color: "rgba(200,234,240,0.7)",
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
            color: "rgba(200,234,240,0.2)",
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
        "Made in Africa",
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
/* ─── App ───────────────────────────────────────────────────────────────── */
export default function SubdomainLandingPage() {
  const navigate = useNavigate();

  const goLogin = () => navigate("/login");
  const goRegister = () => {
  localStorage.setItem("pendingDashboardId", "healthcare"); // use the real id
  navigate("/register?industry=healthcare");
};

  return (
    <>
    <Helmet>
  <title>Medical Billing & Invoicing Software for Healthcare Practices | SolidFlo</title>
  <meta
    name="description"
    content="Bill patients with built-in tariff codes, track medical aid claims, and send SARS & HPCSA-compliant invoices in under 60 seconds. Built for African GPs, specialists, and allied health practitioners. Free plan available, no credit card required."
  />
  <link rel="canonical" href="https://healthcare.solidflo.co.za/" />

  {/* Open Graph */}
  <meta property="og:site_name" content="SolidFlo" />
  <meta property="og:title" content="Medical Billing & Invoicing Software for Healthcare Practices | SolidFlo" />
  <meta
    property="og:description"
    content="Tariff code billing, medical aid claim tracking, and compliant invoicing — built for African healthcare practitioners."
  />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://healthcare.solidflo.co.za/" />
  <meta property="og:image" content="https://healthcare.solidflo.co.za/og-image.jpg" />
  <meta property="og:locale" content="en_ZA" />

  {/* Twitter */}
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Medical Billing & Invoicing Software for Healthcare Practices | SolidFlo" />
  <meta
    name="twitter:description"
    content="Tariff code billing and medical aid claim tracking — built for African healthcare practices."
  />
  <meta name="twitter:image" content="https://healthcare.solidflo.co.za/og-image.jpg" />

  {/* Structured data: software */}
  <script type="application/ld+json">
    {JSON.stringify({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "SolidFlo for Healthcare Practices",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web",
      "url": "https://healthcare.solidflo.co.za/",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "ZAR",
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "ratingCount": "700",
      },
    })}
  </script>

  {/* Structured data: FAQ */}
  <script type="application/ld+json">
    {JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Is SolidFlo built specifically for healthcare practices?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. The tariff code library, medical aid claim tracking, and HPCSA-compliant invoice templates are all designed around how African healthcare practices actually bill — not adapted from generic invoicing software.",
          },
        },
        {
          "@type": "Question",
          "name": "Does it support NHRPL and BHF tariff codes?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. SolidFlo includes a built-in tariff code library for common NHRPL and BHF codes. Select a procedure and the correct billing rate populates automatically, reducing errors and saving time on every invoice.",
          },
        },
        {
          "@type": "Question",
          "name": "Can I track medical aid claims separately from private patients?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Absolutely. You can tag invoices by payment type — medical aid scheme or private — and track each claim's status from submission through to remittance or rejection, all in one dashboard.",
          },
        },
        {
          "@type": "Question",
          "name": "Is SolidFlo really free?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes — our Solo plan is free forever. You get 10 invoices per month with no credit card required. When your practice grows, upgrade to Practice or Clinic for unlimited billing and medical aid tracking.",
          },
        },
        {
          "@type": "Question",
          "name": "What if I have a receptionist or billing administrator?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "The Clinic plan supports up to 8 users, each with their own login and role-based access. Your billing admin can manage invoices while you stay focused on patients.",
          },
        },
        {
          "@type": "Question",
          "name": "Can I import my existing patient records?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, you can import patient details via CSV. Our support team can also help migrate data from existing practice management software — free of charge.",
          },
        },
      ],
    })}
  </script>
</Helmet>
      <style>{fontStyle}</style>
      <div style={{ minHeight: "100vh", fontFamily: "'Barlow', sans-serif" }}>
        <Navbar onLogin={goLogin} onRegister={goRegister} />
        <Hero onRegister={goRegister} />
        <PulseDivider />
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
