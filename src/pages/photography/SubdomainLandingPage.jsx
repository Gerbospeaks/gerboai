import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/img/photography-logo.png"; 
const fontStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&family=Barlow:wght@400;500;600&display=swap');
`;

/* ─── Design Tokens ─────────────────────────────────────────────────────── */
const C = {
  ink: "#0F0D0A",
  ink2: "#1A1712",
  surface: "#F5F0E8",
  white: "#FFFFFF",
  gold: "#C8973A",
  goldD: "#9A6E22",
  goldL: "#F0E0C0",
  border: "#E8DECE",
  text: "#1E1A14",
  muted: "#7A7060",
};

/* ─── Scroll helper ─────────────────────────────────────────────────────── */
const scrollTo = (id) =>
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

/* ─── Film grain texture ────────────────────────────────────────────────── */
function GrainTexture({ opacity = 0.04 }) {
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
          baseFrequency="0.80"
          numOctaves="4"
          stitchTiles="stitch"
        />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#grain)" />
    </svg>
  );
}

/* ─── Mock Invoice ──────────────────────────────────────────────────────── */
function MockInvoice() {
  return (
    <div
      style={{
        background: C.white,
        borderRadius: 16,
        boxShadow: "0 32px 80px rgba(15,13,10,0.38)",
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
          background: "#EDE8DF",
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
            solidflo.co.za/photography/INV-0053
          </span>
        </div>
      </div>

      {/* Header */}
      <div
        style={{
          padding: "20px 24px 16px",
          borderBottom: `2px solid ${C.gold}`,
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
              <span style={{ fontSize: 26 }}>📷</span>
              <div>
                <p
                  style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 800,
                    fontSize: 16,
                    color: C.ink,
                    margin: 0,
                  }}
                >
                  Langa Frame Studios
                </p>
                <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>
                  Johannesburg, South Africa
                </p>
              </div>
            </div>
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
                fontFamily: "'Barlow', sans-serif",
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
              INV-0053
            </p>
            <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>
              Issued 03 Apr 2025
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
                desc: "Wedding Photography – Full Day (10 hrs)",
                qty: 1,
                unit: "R12 500.00",
                total: "R12 500.00",
              },
              {
                desc: "Professional Photo Editing (350 images)",
                qty: 1,
                unit: "R3 200.00",
                total: "R3 200.00",
              },
              {
                desc: "Second Shooter – Ceremony & Reception",
                qty: 1,
                unit: "R2 800.00",
                total: "R2 800.00",
              },
              {
                desc: "Premium Photo Album (30 spreads, lay-flat)",
                qty: 1,
                unit: "R4 500.00",
                total: "R4 500.00",
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
          ["Subtotal", "R23 000.00"],
          ["VAT (15%)", "R3 450.00"],
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
              color: "rgba(245,240,232,0.7)",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Total Due
          </span>
          <span
            style={{
              color: "#F5F0E8",
              fontWeight: 800,
              fontSize: 15,
              minWidth: 80,
              textAlign: "right",
              fontFamily: "'Barlow Condensed', sans-serif",
            }}
          >
            R26 450.00
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

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: C.ink,
        borderBottom: `1px solid rgba(200,151,58,0.18)`,
        boxShadow: scrolled ? "0 4px 20px rgba(0,0,0,0.5)" : "none",
        transition: "box-shadow .2s",
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
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          
          <div>
            <img src={logo} width={160} alt="" />
          </div>
        </div>

        <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
          {["features", "pricing", "testimonials", "faq"].map((s) => (
            <button
              key={s}
              onClick={() => scrollTo(s)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "rgba(245,240,232,0.45)",
                fontSize: 14,
                fontFamily: "'Barlow', sans-serif",
                fontWeight: 500,
                textTransform: "capitalize",
                transition: "color .2s",
              }}
              onMouseEnter={(e) => (e.target.style.color = "#F5F0E8")}
              onMouseLeave={(e) =>
                (e.target.style.color = "rgba(245,240,232,0.45)")
              }
            >
              {s}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button
            onClick={onLogin}
            style={{
              background: "none",
              border: `1px solid rgba(200,151,58,0.35)`,
              borderRadius: 8,
              padding: "7px 18px",
              color: "rgba(245,240,232,0.7)",
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
              background: C.gold,
              border: "none",
              borderRadius: 8,
              padding: "8px 20px",
              color: C.white,
              fontSize: 13,
              fontWeight: 700,
              fontFamily: "'Barlow', sans-serif",
              cursor: "pointer",
              boxShadow: `0 4px 12px ${C.gold}66`,
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
      <GrainTexture opacity={0.05} />

      {/* Warm cinematic glow */}
      <div
        style={{
          position: "absolute",
          bottom: -60,
          left: "50%",
          transform: "translateX(-50%)",
          width: 800,
          height: 320,
          borderRadius: "50%",
          background: C.gold,
          opacity: 0.09,
          filter: "blur(90px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: -100,
          right: -100,
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: C.gold,
          opacity: 0.05,
          filter: "blur(80px)",
          pointerEvents: "none",
        }}
      />

      {/* Subtle grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(rgba(200,151,58,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(200,151,58,0.04) 1px, transparent 1px)`,
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
              background: "rgba(200,151,58,0.12)",
              border: "1px solid rgba(200,151,58,0.3)",
              borderRadius: 99,
              padding: "5px 14px",
              marginBottom: 22,
            }}
          >
            <span style={{ fontSize: 14 }}>📷</span>
            <span
              style={{
                color: C.gold,
                fontSize: 12,
                fontWeight: 700,
                fontFamily: "'Barlow', sans-serif",
                letterSpacing: "0.05em",
              }}
            >
              Purpose-Built for South African Photographers
            </span>
          </div>

          <h1
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 900,
              fontSize: "clamp(40px, 5vw, 62px)",
              lineHeight: 1.05,
              color: "#F5F0E8",
              margin: "0 0 20px",
              letterSpacing: "-0.5px",
            }}
          >
            Spend More Time
            <br />
            <span style={{ color: C.gold }}>Behind the Lens.</span>
            <br />
            Less Chasing Cash.
          </h1>

          <p
            style={{
              color: "rgba(245,240,232,0.5)",
              fontSize: 17,
              lineHeight: 1.7,
              margin: "0 0 36px",
              fontFamily: "'Barlow', sans-serif",
              maxWidth: 460,
            }}
          >
            Send polished quotes, collect deposits, deliver galleries, and get
            fully paid — purpose-built for South African photographers,
            videographers, and content creators.
          </p>

          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <button
              onClick={onRegister}
              style={{
                background: C.gold,
                border: "none",
                borderRadius: 10,
                padding: "14px 28px",
                color: C.white,
                fontSize: 15,
                fontWeight: 700,
                fontFamily: "'Barlow', sans-serif",
                cursor: "pointer",
                boxShadow: `0 8px 24px ${C.gold}4D`,
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
                background: "rgba(200,151,58,0.1)",
                border: "1px solid rgba(200,151,58,0.3)",
                borderRadius: 10,
                padding: "14px 24px",
                color: "rgba(245,240,232,0.7)",
                fontSize: 15,
                fontWeight: 600,
                fontFamily: "'Barlow', sans-serif",
                cursor: "pointer",
              }}
            >
              See How It Works →
            </button>
          </div>

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
              "Deposit protection",
              "Gallery delivery",
              "SA-built & hosted",
            ].map((t) => (
              <span
                key={t}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  color: "rgba(245,240,232,0.3)",
                  fontSize: 12,
                  fontFamily: "'Barlow', sans-serif",
                }}
              >
                <span style={{ color: C.gold, fontSize: 10 }}>✦</span>
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
              <span>💰</span> Deposit received!
            </div>
            <MockInvoice />
            <div style={{ display: "flex", gap: 12, marginTop: 14 }}>
              {[
                ["R128 000", "This Month"],
                ["31", "Active Bookings"],
                ["4.9★", "Client Rating"],
              ].map(([v, l]) => (
                <div
                  key={l}
                  style={{
                    flex: 1,
                    background: "rgba(200,151,58,0.1)",
                    border: "1px solid rgba(200,151,58,0.22)",
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
                      color: "#F5F0E8",
                    }}
                  >
                    {v}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "rgba(245,240,232,0.4)",
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
          borderTop: "1px solid rgba(200,151,58,0.12)",
          paddingTop: 28,
          display: "flex",
          gap: 40,
          flexWrap: "wrap",
          alignItems: "center",
          width: "100%",
          position: "relative",
        }}
      >
        <span
          style={{
            color: "rgba(245,240,232,0.25)",
            fontSize: 13,
            fontFamily: "'Barlow', sans-serif",
          }}
        >
          TRUSTED BY SA PHOTOGRAPHERS & VIDEOGRAPHERS
        </span>
        {[
          "Langa Frame Studios",
          "Sithole Creative Co.",
          "Cape Light Photography",
          "Dube Film & Photo",
        ].map((b) => (
          <span
            key={b}
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              fontSize: 15,
              color: "rgba(245,240,232,0.2)",
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

/* ─── Divider ───────────────────────────────────────────────────────────── */
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
          background: `linear-gradient(to right, transparent, ${C.gold}55)`,
        }}
      />
      <span style={{ color: C.gold, fontSize: 14 }}>✦</span>
      <div
        style={{
          height: 1,
          flex: 1,
          background: `linear-gradient(to left, transparent, ${C.gold}55)`,
        }}
      />
    </div>
  );
}

/* ─── How It Works ─────────────────────────────────────────────────────── */
function HowItWorks() {
  const steps = [
    {
      icon: "📝",
      title: "Quote & Book",
      desc: "Send a professional package quote with your rates, inclusions, and a deposit request — all in one link. Clients confirm and pay the deposit directly. No back-and-forth emails.",
    },
    {
      icon: "📩",
      title: "Invoice the Balance",
      desc: "When the shoot wraps, send the balance invoice instantly via email or WhatsApp PDF. Link it to the gallery delivery so clients pay before they download.",
    },
    {
      icon: "💳",
      title: "Get Paid & Deliver",
      desc: "Clients pay via EFT, PayFast, or SnapScan. You're notified immediately, and they unlock their gallery. No more chasing payment before releasing images.",
    },
  ];

  return (
    <section style={{ background: C.white, padding: "80px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <p
            style={{
              color: C.gold,
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
            Quote, shoot, deliver, repeat.
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
                    i === 1 ? "rgba(200,151,58,0.07)" : "rgba(15,13,10,0.06)",
                  lineHeight: 1,
                }}
              >
                0{i + 1}
              </div>
              <img src={logo} width={80} alt="" />
             
              <p
                style={{
                  color: i === 1 ? "rgba(245,240,232,0.55)" : C.muted,
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
                    background: C.gold,
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
      icon: "📦",
      title: "Package Builder",
      desc: "Create half-day, full-day, wedding, and portrait packages with custom inclusions. Send a single quote link — clients see exactly what they're paying for.",
    },
    {
      icon: "💰",
      title: "Deposit & Balance Invoicing",
      desc: "Split any booking into a deposit and balance invoice automatically. Protect yourself from cancellations and improve cash flow across every shoot.",
    },
    {
      icon: "🗓️",
      title: "Booking Calendar",
      desc: "See all your confirmed shoots, pending quotes, and follow-ups in one view. Never double-book a date or forget a corporate shoot again.",
    },
    {
      icon: "🖼️",
      title: "Gallery Delivery Links",
      desc: "Link gallery delivery to invoice payment. Clients get access to their images the moment the balance clears — no more awkward payment conversations.",
    },
    {
      icon: "📄",
      title: "Shoot Contracts",
      desc: "Send a professional contract alongside your quote. Clients sign digitally before the deposit is due. Disputes resolved before they start.",
    },
    {
      icon: "📊",
      title: "Business Reports",
      desc: "Monthly revenue, outstanding balances, and revenue per shoot type. Know your most profitable work so you can book more of it.",
    },
    {
      icon: "🔔",
      title: "Automatic Reminders",
      desc: "Automatically remind clients about unpaid balances before gallery delivery. Polite, professional, and completely hands-off.",
    },
    {
      icon: "📱",
      title: "Mobile-First",
      desc: "Quote from a consultation, invoice at wrap, and share galleries from your phone. Fully responsive — no laptop, no delays.",
    },
    {
      icon: "🧾",
      title: "VAT-Compliant Invoices",
      desc: "Every invoice meets SARS requirements. Toggle VAT on or off per client. Audit-ready from day one.",
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
              color: C.gold,
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
            Every tool your photography business needs
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
            No bloat. No generic invoicing software. Just what a photographer
            actually uses on every booking.
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
                border: `1px solid rgba(200,151,58,0.15)`,
                transition: "box-shadow .2s, transform .2s, border-color .2s",
                cursor: "default",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = `0 8px 32px rgba(200,151,58,0.12)`;
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.borderColor = "rgba(200,151,58,0.45)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = "rgba(200,151,58,0.15)";
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: C.goldL,
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
      desc: "For photographers just starting out",
      features: [
        "5 invoices / month",
        "Basic package quotes",
        "Client records",
        "PDF export",
        "Email support",
      ],
      cta: "Get Started Free",
    },
    {
      name: "Shooter",
      price: "R299",
      period: "/month",
      desc: "For professional photographers & videographers",
      highlight: true,
      features: [
        "Unlimited invoices & quotes",
        "Deposit & balance invoicing",
        "Shoot contracts (e-sign)",
        "Gallery delivery links",
        "Booking calendar",
        "Payment links (EFT, PayFast)",
        "Automatic payment reminders",
      ],
      cta: "Start 14-Day Free Trial",
    },
    {
      name: "Studio",
      price: "R599",
      period: "/month",
      desc: "For photography studios with multiple photographers",
      features: [
        "Everything in Shooter",
        "Up to 5 photographer logins",
        "Multi-shoot dashboard",
        "Custom branded contracts",
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
              color: C.gold,
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
            Start free. Upgrade when your bookings are rolling.
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
                  ? `2px solid ${C.gold}`
                  : `1px solid ${C.border}`,
                display: "flex",
                flexDirection: "column",
                position: "relative",
                boxShadow: p.highlight
                  ? "0 20px 60px rgba(15,13,10,0.35)"
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
                    background: C.gold,
                    color: C.white,
                    fontSize: 11,
                    fontWeight: 800,
                    padding: "5px 16px",
                    borderRadius: 99,
                    fontFamily: "'Barlow', sans-serif",
                    letterSpacing: "0.08em",
                    boxShadow: `0 4px 12px ${C.gold}66`,
                    whiteSpace: "nowrap",
                  }}
                >
                  MOST POPULAR
                </div>
              )}
              <div style={{ marginBottom: 20 }}>
                <p
                  style={{
                    color: p.highlight ? "rgba(245,240,232,0.5)" : C.gold,
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
                      color: p.highlight ? "#F5F0E8" : C.ink,
                    }}
                  >
                    {p.price}
                  </span>
                  <span
                    style={{
                      color: p.highlight ? "rgba(245,240,232,0.4)" : C.muted,
                      fontSize: 14,
                      fontFamily: "'Barlow', sans-serif",
                    }}
                  >
                    {p.period}
                  </span>
                </div>
                <p
                  style={{
                    color: p.highlight ? "rgba(245,240,232,0.4)" : C.muted,
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
                      fill={C.gold}
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
                        color: p.highlight ? "rgba(245,240,232,0.75)" : C.text,
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
                  background: p.highlight ? C.gold : C.ink,
                  border: "none",
                  borderRadius: 10,
                  padding: "12px",
                  color: "#F5F0E8",
                  fontWeight: 700,
                  fontSize: 14,
                  fontFamily: "'Barlow', sans-serif",
                  cursor: "pointer",
                  boxShadow: p.highlight ? `0 6px 20px ${C.gold}59` : "none",
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
        "I used to release galleries and then spend weeks chasing the balance. With SolidFlo the gallery link only activates after payment clears. I haven't had a single late payer since.",
      name: "Lungelo Langa",
      role: "Langa Frame Studios, Johannesburg",
      avatar: "LL",
    },
    {
      quote:
        "The deposit invoicing feature alone changed my business. I take 50% upfront on every wedding now — SolidFlo makes it feel completely normal to the client because it looks so professional.",
      name: "Carla du Plessis",
      role: "Cape Light Photography, Cape Town",
      avatar: "CD",
    },
    {
      quote:
        "I photograph 8–10 corporates a month. Sending the invoice with a PayFast link the moment the shoot wraps means I'm usually paid before I've even culled the images.",
      name: "Zanele Dube",
      role: "Dube Film & Photo, Pretoria",
      avatar: "ZD",
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
              color: C.gold,
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
            Trusted by photographers across SA
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
                border: `1px solid rgba(200,151,58,0.15)`,
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              <div style={{ display: "flex", gap: 2 }}>
                {[...Array(5)].map((_, j) => (
                  <span key={j} style={{ color: C.gold, fontSize: 16 }}>
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
                  borderTop: `1px solid rgba(200,151,58,0.12)`,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: C.goldD,
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
            ["700+", "Active photographers"],
            ["R 28M+", "Quoted monthly"],
            ["4.9/5", "App store rating"],
            ["72%", "Faster payments"],
          ].map(([v, l], i) => (
            <div
              key={i}
              style={{
                padding: "28px 24px",
                textAlign: "center",
                borderRight: i < 3 ? `1px solid rgba(200,151,58,0.1)` : "none",
              }}
            >
              <div
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 900,
                  fontSize: 36,
                  color: C.gold,
                }}
              >
                {v}
              </div>
              <div
                style={{
                  fontFamily: "'Barlow', sans-serif",
                  fontSize: 13,
                  color: "rgba(245,240,232,0.4)",
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
      q: "Is SolidFlo built specifically for photographers?",
      a: "Yes. The package builder, deposit/balance split invoicing, shoot contracts, and gallery delivery links are designed around how photographers actually manage bookings — not adapted from generic small business software.",
    },
    {
      q: "How does the gallery delivery link work?",
      a: "You paste your gallery link (from Pixieset, Google Drive, Dropbox, or anywhere else) into the invoice. The client only sees the active link once their balance invoice is marked as paid. It's automatic and completely hands-off.",
    },
    {
      q: "Can I collect deposits before the shoot?",
      a: "Yes. The Shooter plan lets you split any booking into a deposit invoice and a balance invoice. Send the deposit quote when the client confirms, then send the balance invoice after the shoot wraps.",
    },
    {
      q: "Do clients need to sign a contract?",
      a: "Yes — the Shooter plan includes digital shoot contracts. Clients sign before the deposit is due. Your signed contract and invoice are stored together on every booking.",
    },
    {
      q: "Is SolidFlo really free?",
      a: "Yes — the Starter plan is free forever with 5 invoices per month and no credit card required. Upgrade to Shooter when you need unlimited invoicing, deposit splitting, contracts, and gallery links.",
    },
    {
      q: "Can I manage multiple photographers in my studio?",
      a: "Yes. The Studio plan supports up to 5 photographer logins, each with their own bookings and invoices. You see everything from one dashboard while your team works independently.",
    },
  ];

  return (
    <section id="faq" style={{ background: C.white, padding: "80px 24px" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <p
            style={{
              color: C.gold,
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
            Questions photographers ask
          </h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {faqs.map((faq, i) => (
            <div
              key={i}
              style={{
                background: open === i ? C.goldL : C.surface,
                borderRadius: 12,
                border: `1px solid ${open === i ? C.gold : C.border}`,
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
                  stroke={C.gold}
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
                    borderTop: `1px solid rgba(200,151,58,0.2)`,
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
      <GrainTexture opacity={0.045} />
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
        📷
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
            color: C.gold,
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
            color: "#F5F0E8",
            margin: "0 0 16px",
            letterSpacing: -0.5,
          }}
        >
          Focus on the art.
          <br />
          Let us handle the admin.
        </h2>
        <p
          style={{
            color: "rgba(245,240,232,0.4)",
            fontSize: 16,
            margin: "0 0 36px",
            fontFamily: "'Barlow', sans-serif",
          }}
        >
          Join 700+ South African photographers and videographers who quote
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
              background: C.gold,
              border: "none",
              borderRadius: 12,
              padding: "16px 36px",
              color: C.white,
              fontSize: 16,
              fontWeight: 800,
              fontFamily: "'Barlow Condensed', sans-serif",
              cursor: "pointer",
              letterSpacing: 0.5,
              boxShadow: `0 8px 28px ${C.gold}73`,
            }}
          >
            START FOR FREE
          </button>
          <button
            onClick={() => scrollTo("pricing")}
            style={{
              background: "rgba(200,151,58,0.1)",
              border: "1px solid rgba(200,151,58,0.3)",
              borderRadius: 12,
              padding: "16px 28px",
              color: "rgba(245,240,232,0.7)",
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
            color: "rgba(245,240,232,0.2)",
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
        "Package Builder",
        "Gallery Links",
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
        background: "#090806",
        borderTop: `1px solid rgba(200,151,58,0.12)`,
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
               <img src={logo} width={160} alt="" />
              </div>
            </div>
            <p
              style={{
                color: "rgba(245,240,232,0.25)",
                fontSize: 13,
                lineHeight: 1.7,
                fontFamily: "'Barlow', sans-serif",
                marginBottom: 20,
                maxWidth: 220,
              }}
            >
              Professional invoicing and booking management built for South
              African photographers and videographers.
            </p>
            <button
              onClick={onRegister}
              style={{
                background: C.gold,
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
                  color: "rgba(245,240,232,0.4)",
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
                      color: "rgba(245,240,232,0.3)",
                      fontSize: 13,
                      fontFamily: "'Barlow', sans-serif",
                      textDecoration: "none",
                      transition: "color .15s",
                    }}
                    onMouseEnter={(e) => (e.target.style.color = "#F5F0E8")}
                    onMouseLeave={(e) =>
                      (e.target.style.color = "rgba(245,240,232,0.3)")
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
            borderTop: `1px solid rgba(200,151,58,0.1)`,
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
              color: "rgba(245,240,232,0.2)",
              fontSize: 12,
              fontFamily: "'Barlow', sans-serif",
              margin: 0,
            }}
          >
            © {new Date().getFullYear()} SolidFlo. All rights reserved.
          </p>
          <p
            style={{
              color: "rgba(245,240,232,0.2)",
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
export default function PhotographyLandingPage() {
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
