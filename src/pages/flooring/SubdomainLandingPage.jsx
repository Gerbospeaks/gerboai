import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/img/flooring-logo.png"
const fontStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&family=Barlow:wght@400;500;600&display=swap');
`;

/* ─── Design Tokens ────────────────────────────────────────────────────── */
const C = {
  ink: "#111318", // deep slate-dark
  ink2: "#1C2028", // mid slate
  surface: "#F6F2EE", // warm stone cream
  white: "#FFFFFF",
  clay: "#C47A45", // primary accent — terracotta clay
  clayD: "#9A5C2C", // darker accent
  clayL: "#EDD9C8", // light tint
  border: "#E4D8CC",
  text: "#1E2027",
  muted: "#8A7B6E",
};

/* ─── Scroll helper ─────────────────────────────────────────────────────── */
const scrollTo = (id) =>
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

/* ─── Stone Tile SVG Texture ────────────────────────────────────────────── */
function StoneTile({ opacity = 0.04 }) {
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
      <filter id="st">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.72"
          numOctaves="4"
          stitchTiles="stitch"
        />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#st)" />
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
        boxShadow: "0 32px 80px rgba(17,19,24,0.32)",
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
          background: "#F0EBE4",
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
            solidflo.co.za/flooring/INV-2024
          </span>
        </div>
      </div>

      {/* Invoice header */}
      <div
        style={{
          padding: "20px 24px 16px",
          borderBottom: `2px solid ${C.clay}`,
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
                <img src={logo} alt="Flooring Logo" style={{ width: "100px", height: "auto" }} />
              </span>
             
            </div>
            <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>
              Dlamini Premium Flooring
            </p>
            <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>
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
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 800,
                fontSize: 20,
                color: C.ink,
                margin: 0,
              }}
            >
              INV-0037
            </p>
            <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>
              Issued 01 Apr 2025
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
                desc: "Engineered Oak Flooring (12mm, 85m²)",
                qty: 85,
                unit: "R320.00",
                total: "R27 200.00",
              },
              {
                desc: "Acoustic Underlay (85m²)",
                qty: 85,
                unit: "R42.00",
                total: "R3 570.00",
              },
              {
                desc: "Installation – Floating Method (85m²)",
                qty: 85,
                unit: "R85.00",
                total: "R7 225.00",
              },
              {
                desc: "Skirting Board & Scotia (42 lin m)",
                qty: 42,
                unit: "R68.00",
                total: "R2 856.00",
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
          ["Subtotal", "R40 851.00"],
          ["VAT (15%)", "R6 127.65"],
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
              color: "rgba(246,242,238,0.7)",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Total Due
          </span>
          <span
            style={{
              color: "#F6EEE4",
              fontWeight: 800,
              fontSize: 15,
              minWidth: 80,
              textAlign: "right",
            }}
          >
            R46 978.65
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─── Navbar ────────────────────────────────────────────────────────────── */
function Navbar({ onLogin, onRegister }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const links = ["features", "pricing", "testimonials", "faq"];

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: C.ink,
        borderBottom: `1px solid rgba(196,122,69,0.15)`,
        transition: "box-shadow .2s",
        boxShadow: scrolled ? "0 4px 20px rgba(0,0,0,0.4)" : "none",
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
          <span style={{ fontSize: 22 }}><img src={logo} width={160} alt="Flooring Logo" /></span>
          <div>
            
          </div>
        </div>

        {/* Desktop links */}
        <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
          {links.map((s) => (
            <button
              key={s}
              onClick={() => scrollTo(s)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "rgba(246,238,228,0.45)",
                fontSize: 14,
                fontFamily: "'Barlow', sans-serif",
                fontWeight: 500,
                textTransform: "capitalize",
                transition: "color .2s",
              }}
              onMouseEnter={(e) => (e.target.style.color = "#F6EEE4")}
              onMouseLeave={(e) =>
                (e.target.style.color = "rgba(246,238,228,0.45)")
              }
            >
              {s}
            </button>
          ))}
        </div>

        {/* CTA */}
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button
            onClick={onLogin}
            style={{
              background: "none",
              border: "1px solid rgba(196,122,69,0.3)",
              borderRadius: 8,
              padding: "7px 18px",
              color: "rgba(246,238,228,0.7)",
              fontSize: 13,
              fontFamily: "'Barlow', sans-serif",
              cursor: "pointer",
            }}
          >
            Sign In
          </button>
          <button
            onClick={onRegister}
            style={{
              background: C.clay,
              border: "none",
              borderRadius: 8,
              padding: "8px 20px",
              color: C.white,
              fontSize: 13,
              fontWeight: 700,
              fontFamily: "'Barlow', sans-serif",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(196,122,69,0.4)",
            }}
          >
            Start Free →
          </button>
        </div>
      </div>
    </nav>
  );
}

/* ─── Hero ──────────────────────────────────────────────────────────────── */
function Hero({ onRegister }) {
  return (
    <section
      style={{
        background: C.ink,
        padding: "72px 24px 80px",
        position: "relative",
        overflow: "hidden",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <StoneTile opacity={0.045} />

      {/* Warm glow */}
      <div
        style={{
          position: "absolute",
          bottom: -80,
          left: "50%",
          transform: "translateX(-50%)",
          width: 700,
          height: 300,
          borderRadius: "50%",
          background: C.clay,
          opacity: 0.1,
          filter: "blur(80px)",
          pointerEvents: "none",
        }}
      />

      {/* Tile grid lines — decorative */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(rgba(196,122,69,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(196,122,69,0.04) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          position: "relative",
          display: "flex",
          alignItems: "center",
          gap: 60,
          flexWrap: "wrap",
          width: "100%",
        }}
      >
        {/* Left */}
        <div style={{ flex: "1 1 420px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(196,122,69,0.12)",
              border: "1px solid rgba(196,122,69,0.3)",
              borderRadius: 99,
              padding: "5px 14px",
              marginBottom: 22,
            }}
          >
            <span style={{ fontSize: 14 }}>🪨</span>
            <span
              style={{
                color: C.clay,
                fontSize: 12,
                fontWeight: 700,
                fontFamily: "'Barlow', sans-serif",
                letterSpacing: "0.05em",
              }}
            >
              Purpose-Built for South African Flooring Contractors
            </span>
          </div>

          <h1
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 900,
              fontSize: "clamp(40px, 5vw, 62px)",
              lineHeight: 1.05,
              color: "#F6EEE4",
              margin: "0 0 20px",
              letterSpacing: "-0.5px",
            }}
          >
            Invoicing Built for
            <br />
            <span style={{ color: C.clay }}>the Floor,</span>
            <br />
            Not the Office.
          </h1>

          <p
            style={{
              color: "rgba(246,238,228,0.5)",
              fontSize: 17,
              lineHeight: 1.7,
              margin: "0 0 36px",
              fontFamily: "'Barlow', sans-serif",
              maxWidth: 460,
            }}
          >
            Send professional quotes, calculate materials by m², and get paid on
            time — purpose-built for South African flooring installers and
            tiling contractors.
          </p>

          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <button
              onClick={onRegister}
              style={{
                background: C.clay,
                border: "none",
                borderRadius: 10,
                padding: "14px 28px",
                color: C.white,
                fontSize: 15,
                fontWeight: 700,
                fontFamily: "'Barlow', sans-serif",
                cursor: "pointer",
                boxShadow: "0 8px 24px rgba(196,122,69,0.4)",
                transition: "transform .15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "scale(1.03)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            >
              Start Free — No Card Needed
            </button>
            <button
              onClick={() => scrollTo("features")}
              style={{
                background: "rgba(196,122,69,0.08)",
                border: "1px solid rgba(196,122,69,0.3)",
                borderRadius: 10,
                padding: "14px 24px",
                color: "rgba(246,238,228,0.7)",
                fontSize: 15,
                fontWeight: 600,
                fontFamily: "'Barlow', sans-serif",
                cursor: "pointer",
              }}
            >
              See How It Works →
            </button>
          </div>

          {/* Trust row */}
          <div
            style={{
              display: "flex",
              gap: 24,
              marginTop: 32,
              flexWrap: "wrap",
            }}
          >
            {[
              "Free plan forever",
              "VAT-compliant quotes",
              "Mobile-friendly",
              "SA-built & hosted",
            ].map((t) => (
              <span
                key={t}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  color: "rgba(246,238,228,0.3)",
                  fontSize: 12,
                  fontFamily: "'Barlow', sans-serif",
                }}
              >
                <span style={{ color: C.clay, fontSize: 10 }}>✦</span>
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Right: Invoice preview */}
        <div
          style={{
            flex: "1 1 340px",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div style={{ position: "relative" }}>
            {/* Badge floating */}
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
                fontFamily: "'Barlow', sans-serif",
                boxShadow: "0 8px 20px rgba(22,163,74,0.4)",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span>💰</span> Payment received!
            </div>
            <MockInvoice />
            {/* Stats row */}
            <div style={{ display: "flex", gap: 12, marginTop: 14 }}>
              {[
                ["R 94 500", "This Month"],
                ["18", "Active Jobs"],
                ["4.9★", "Client Rating"],
              ].map(([v, l]) => (
                <div
                  key={l}
                  style={{
                    flex: 1,
                    background: "rgba(196,122,69,0.08)",
                    border: "1px solid rgba(196,122,69,0.2)",
                    borderRadius: 10,
                    padding: "10px 12px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontWeight: 800,
                      fontSize: 18,
                      color: "#F6EEE4",
                    }}
                  >
                    {v}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "rgba(246,238,228,0.4)",
                      fontFamily: "'Barlow', sans-serif",
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

      {/* Trusted-by bar */}
      <div
        style={{
          maxWidth: 1200,
          margin: "48px auto 0",
          borderTop: "1px solid rgba(196,122,69,0.1)",
          paddingTop: 28,
          display: "flex",
          gap: 40,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <span
          style={{
            color: "rgba(246,238,228,0.25)",
            fontSize: 13,
            fontFamily: "'Barlow', sans-serif",
          }}
        >
          TRUSTED BY SA FLOORING CONTRACTORS
        </span>
        {[
          "Dlamini Premium Flooring",
          "Van Wyk Tile & Stone",
          "Khoza Floor Finishes",
          "Cape Timber Floors",
        ].map((b) => (
          <span
            key={b}
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              fontSize: 15,
              color: "rgba(246,238,228,0.2)",
              letterSpacing: 0.5,
            }}
          >
            {b}
          </span>
        ))}
      </div>
    </section>
  );
}

/* ─── Layer Divider ─────────────────────────────────────────────────────── */
function LayDivider() {
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
          background: `linear-gradient(to right, transparent, rgba(196,122,69,0.3))`,
        }}
      />
      <span style={{ color: C.clay, fontSize: 14 }}>✦</span>
      <div
        style={{
          height: 1,
          flex: 1,
          background: `linear-gradient(to left, transparent, rgba(196,122,69,0.3))`,
        }}
      />
    </div>
  );
}

/* ─── How It Works ─────────────────────────────────────────────────────── */
function HowItWorks() {
  const steps = [
    {
      icon: "📐",
      title: "Measure & Quote",
      desc: "Enter room dimensions and the system calculates m² automatically. Add materials, underlay, and labour to send a professional itemised quote — straight from your phone on site.",
    },
    {
      icon: "📩",
      title: "Send the Invoice",
      desc: "One tap sends a VAT-compliant invoice via email, SMS, or WhatsApp PDF. Clients get it instantly — no chasing, no printing.",
    },
    {
      icon: "💳",
      title: "Get Paid Instantly",
      desc: "Customers pay via EFT, PayFast, or SnapScan. You get notified the moment money lands. No more end-of-month awkward calls.",
    },
  ];

  return (
    <section style={{ background: C.white, padding: "80px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <p
            style={{
              color: C.clay,
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
                    i === 1 ? "rgba(196,122,69,0.07)" : "rgba(17,19,24,0.06)",
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
                  color: i === 1 ? "#F6EEE4" : C.ink,
                  margin: "0 0 10px",
                }}
              >
                {s.title}
              </h3>
              <p
                style={{
                  color: i === 1 ? "rgba(246,238,228,0.55)" : C.muted,
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
                    background: C.clay,
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
      icon: "📐",
      title: "m² Quote Calculator",
      desc: "Enter room dimensions and SolidFlo calculates coverage automatically. Add material grades, waste factor, and labour — send a quote before you leave the client.",
    },
    {
      icon: "🪨",
      title: "Material Cost Tracking",
      desc: "Log tiles, timber boards, vinyl, underlay, and adhesive per project. Always know what a job costs before you start — and protect your margins.",
    },
    {
      icon: "🗂️",
      title: "Client Records",
      desc: "Full histories of every client, project, and payment in one place. See past jobs instantly when a client calls back for another room.",
    },
    {
      icon: "💳",
      title: "Instant Payments",
      desc: "Accept EFT, PayFast, or SnapScan with payment links embedded on every invoice. Customers pay the moment they open it.",
    },
    {
      icon: "📦",
      title: "Stock Management",
      desc: "Track off-cuts, spare tiles, and surplus underlay across jobs. Know what's in your vehicle before you price the next installation.",
    },
    {
      icon: "📊",
      title: "Business Reports",
      desc: "Monthly revenue, outstanding balances, and job profitability at a glance. Know exactly where your business stands every week.",
    },
    {
      icon: "🔔",
      title: "Payment Reminders",
      desc: "Automatically chase overdue invoices with polite reminders — so you can focus on laying floors, not chasing payments.",
    },
    {
      icon: "📱",
      title: "Mobile-First",
      desc: "Send quotes and invoices from your phone on site. No laptop, no delay. Fully mobile-responsive from the ground up.",
    },
    {
      icon: "🧾",
      title: "VAT-Compliant",
      desc: "Every invoice is SARS-compliant. Set VAT-inclusive or exclusive pricing per quote. Audit-ready from day one.",
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
              color: C.clay,
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
            Every tool your flooring business needs
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
            No bloat. No irrelevant features. Just what a flooring contractor
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
                border: `1px solid rgba(196,122,69,0.15)`,
                transition: "box-shadow .2s, transform .2s, border-color .2s",
                cursor: "default",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 8px 32px rgba(196,122,69,0.12)";
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.borderColor = "rgba(196,122,69,0.45)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = "rgba(196,122,69,0.15)";
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: C.clayL,
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
      desc: "For sole traders just getting started",
      features: [
        "5 invoices / month",
        "Basic m² quote builder",
        "Client records",
        "PDF export",
        "Email support",
      ],
      cta: "Get Started Free",
    },
    {
      name: "Installer",
      price: "R299",
      period: "/month",
      desc: "For established flooring contractors",
      highlight: true,
      features: [
        "Unlimited invoices & quotes",
        "Material cost tracking",
        "Stock management",
        "Payment links (EFT, PayFast)",
        "Monthly reports",
        "Email & WhatsApp delivery",
        "Payment reminders",
      ],
      cta: "Start 14-Day Free Trial",
    },
    {
      name: "Studio",
      price: "R599",
      period: "/month",
      desc: "For flooring businesses with multiple teams",
      features: [
        "Everything in Installer",
        "Up to 5 users",
        "Multi-job dashboard",
        "Custom invoice branding",
        "Xero / QuickBooks sync",
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
              color: C.clay,
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
          {plans.map((p, i) => (
            <div
              key={i}
              style={{
                borderRadius: 16,
                padding: "32px 28px",
                background: p.highlight ? C.ink : C.surface,
                border: p.highlight
                  ? `2px solid ${C.clay}`
                  : `1px solid ${C.border}`,
                display: "flex",
                flexDirection: "column",
                position: "relative",
                boxShadow: p.highlight
                  ? "0 20px 60px rgba(17,19,24,0.35)"
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
                    background: C.clay,
                    color: C.white,
                    fontSize: 11,
                    fontWeight: 800,
                    padding: "5px 16px",
                    borderRadius: 99,
                    fontFamily: "'Barlow', sans-serif",
                    letterSpacing: "0.08em",
                    boxShadow: "0 4px 12px rgba(196,122,69,0.4)",
                    whiteSpace: "nowrap",
                  }}
                >
                  MOST POPULAR
                </div>
              )}

              <div style={{ marginBottom: 20 }}>
                <p
                  style={{
                    color: p.highlight ? "rgba(246,238,228,0.5)" : C.clay,
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
                      color: p.highlight ? "#F6EEE4" : C.ink,
                    }}
                  >
                    {p.price}
                  </span>
                  <span
                    style={{
                      color: p.highlight ? "rgba(246,238,228,0.4)" : C.muted,
                      fontSize: 14,
                      fontFamily: "'Barlow', sans-serif",
                    }}
                  >
                    {p.period}
                  </span>
                </div>
                <p
                  style={{
                    color: p.highlight ? "rgba(246,238,228,0.4)" : C.muted,
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
                      fill={C.clay}
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
                        color: p.highlight ? "rgba(246,238,228,0.75)" : C.text,
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
                  background: p.highlight ? C.clay : C.ink,
                  border: "none",
                  borderRadius: 10,
                  padding: "12px",
                  color: p.highlight ? C.white : "#F6EEE4",
                  fontWeight: 700,
                  fontSize: 14,
                  fontFamily: "'Barlow', sans-serif",
                  cursor: "pointer",
                  boxShadow: p.highlight
                    ? "0 6px 20px rgba(196,122,69,0.35)"
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
        "I used to spend evenings writing quotes in spreadsheets. Now I send them from site before the client even gets home. They always comment on how professional it looks.",
      name: "Sipho Dlamini",
      role: "Premium Flooring, Johannesburg",
      avatar: "SD",
    },
    {
      quote:
        "The m² calculator alone paid for itself. I used to underquote on large rooms all the time. Now every quote is accurate and I'm actually making money on material.",
      name: "Petrus van Wyk",
      role: "Tile & Stone, Pretoria",
      avatar: "PV",
    },
    {
      quote:
        "My overdue invoices dropped 70% in the first month. The WhatsApp PDF just makes it too easy for clients to pay on the spot.",
      name: "Zanele Khoza",
      role: "Floor Finishes, Durban",
      avatar: "ZK",
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
              color: C.clay,
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
            Trusted by flooring contractors across SA
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
                border: `1px solid rgba(196,122,69,0.15)`,
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              <div style={{ display: "flex", gap: 2 }}>
                {[...Array(5)].map((_, j) => (
                  <span key={j} style={{ color: C.clay, fontSize: 16 }}>
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
                  borderTop: `1px solid rgba(196,122,69,0.12)`,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: C.clayD,
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
            ["600+", "Active contractors"],
            ["R 22M+", "Quoted monthly"],
            ["4.9/5", "App store rating"],
            ["70%", "Faster payments"],
          ].map(([v, l], i) => (
            <div
              key={i}
              style={{
                padding: "28px 24px",
                textAlign: "center",
                borderRight: i < 3 ? "1px solid rgba(196,122,69,0.1)" : "none",
              }}
            >
              <div
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 900,
                  fontSize: 36,
                  color: C.clay,
                }}
              >
                {v}
              </div>
              <div
                style={{
                  fontFamily: "'Barlow', sans-serif",
                  fontSize: 13,
                  color: "rgba(246,238,228,0.4)",
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
      q: "Is SolidFlo built specifically for flooring contractors?",
      a: "Yes. The m² calculator, material tracking fields, and job costing tools are designed around how flooring and tiling businesses actually work — not adapted from generic invoicing software.",
    },
    {
      q: "Can I use it on site from my phone?",
      a: "Absolutely. SolidFlo is fully mobile-responsive. You can create and send quotes directly from a job site, no laptop needed. Most contractors send their first quote within 10 minutes of signing up.",
    },
    {
      q: "Does it handle VAT automatically?",
      a: "Yes. You can set VAT-inclusive or exclusive pricing per quote, and it calculates everything correctly for SARS compliance. Every invoice includes the required fields for a valid tax invoice.",
    },
    {
      q: "Is SolidFlo really free?",
      a: "Yes — our Starter plan is free forever. You get 5 invoices per month with no credit card required. When you're ready to grow, upgrade to Installer or Studio for unlimited invoicing.",
    },
    {
      q: "What if I have employees or a subcontractor?",
      a: "The Studio plan supports up to 5 users, each with their own login and permissions. Your team can log materials and time while you focus on client relationships.",
    },
    {
      q: "Can I import my existing client list?",
      a: "Yes, you can import clients via CSV. Our support team can also help you migrate from spreadsheets or another system — free of charge.",
    },
  ];

  return (
    <section id="faq" style={{ background: C.white, padding: "80px 24px" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <p
            style={{
              color: C.clay,
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
            Questions flooring contractors ask
          </h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {faqs.map((faq, i) => (
            <div
              key={i}
              style={{
                background: open === i ? C.clayL : C.surface,
                borderRadius: 12,
                border: `1px solid ${open === i ? C.clay : C.border}`,
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
                  stroke={C.clay}
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
                    borderTop: `1px solid rgba(196,122,69,0.2)`,
                    paddingTop: 14,
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
      <StoneTile opacity={0.04} />
      {/* Giant background icon */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "18rem",
          lineHeight: 1,
          opacity: 0.04,
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        🪨
      </div>
      <div
        style={{
          maxWidth: 680,
          margin: "0 auto",
          textAlign: "center",
          position: "relative",
        }}
      >
        <p
          style={{
            color: C.clay,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            fontFamily: "'Barlow', sans-serif",
            marginBottom: 16,
          }}
        >
          Get started today
        </p>
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
          Your business, running smoother.
        </h2>
        <p
          style={{
            color: "rgba(246,238,228,0.4)",
            fontSize: 16,
            margin: "0 0 36px",
            fontFamily: "'Barlow', sans-serif",
          }}
        >
          Join 600+ South African flooring contractors and tiling businesses
          that quote professionally and get paid faster with SolidFlo.
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
              background: C.clay,
              border: "none",
              borderRadius: 12,
              padding: "16px 36px",
              color: C.white,
              fontSize: 16,
              fontWeight: 800,
              fontFamily: "'Barlow Condensed', sans-serif",
              cursor: "pointer",
              letterSpacing: 0.5,
              boxShadow: "0 8px 28px rgba(196,122,69,0.45)",
            }}
          >
            START FOR FREE
          </button>
          <button
            onClick={() => scrollTo("pricing")}
            style={{
              background: "rgba(196,122,69,0.1)",
              border: "1px solid rgba(196,122,69,0.3)",
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

/* ─── Footer ────────────────────────────────────────────────────────────── */
function Footer({ onLogin, onRegister }) {
  const cols = [
    {
      title: "Product",
      links: ["Features", "Pricing", "Quote Builder", "Job Costing", "Reports"],
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
        background: "#0A0C10",
        borderTop: "1px solid rgba(196,122,69,0.1)",
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
              <span style={{ fontSize: 22 }}><img src={logo} alt="Flooring Logo" style={{ width: "160px", height: "auto" }} /></span>
              <div>
               
              </div>
            </div>
            <p
              style={{
                color: "rgba(246,238,228,0.25)",
                fontSize: 13,
                lineHeight: 1.7,
                fontFamily: "'Barlow', sans-serif",
                marginBottom: 20,
                maxWidth: 220,
              }}
            >
              Professional invoicing software built specifically for South
              African flooring installers and tiling contractors.
            </p>
            <button
              onClick={onRegister}
              style={{
                background: C.clay,
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
                  color: "rgba(246,238,228,0.4)",
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
                      color: "rgba(246,238,228,0.3)",
                      fontSize: 13,
                      fontFamily: "'Barlow', sans-serif",
                      textDecoration: "none",
                      transition: "color .15s",
                    }}
                    onMouseEnter={(e) => (e.target.style.color = "#F6EEE4")}
                    onMouseLeave={(e) =>
                      (e.target.style.color = "rgba(246,238,228,0.3)")
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
            borderTop: "1px solid rgba(196,122,69,0.08)",
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
              color: "rgba(246,238,228,0.2)",
              fontSize: 12,
              fontFamily: "'Barlow', sans-serif",
              margin: 0,
            }}
          >
            © {new Date().getFullYear()} SolidFlo. All rights reserved.
          </p>
          <p
            style={{
              color: "rgba(246,238,228,0.2)",
              fontSize: 12,
              fontFamily: "'Barlow', sans-serif",
              margin: 0,
            }}
          >
            Made with craft in South Africa 🇿🇦
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
      <style>{fontStyle}</style>
      <div style={{ minHeight: "100vh", fontFamily: "'Barlow', sans-serif" }}>
        <Navbar onLogin={goLogin} onRegister={goRegister} />
        <Hero onRegister={goRegister} />
        <LayDivider />
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
