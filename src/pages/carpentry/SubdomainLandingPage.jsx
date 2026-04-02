

import { useState } from "react";

// ─── Carpentry Config ─────────────────────────────────────────────────────────
const config = {
  icon: "🪵",
  label: "Carpentry",
  accent: "#C67C3A",
  accentDark: "#9B5A20",
  accentLight: "#F0DCC8",
  color: "#1A1208",
  colorMid: "#2D1F0E",
  lightBg: "#FAF5EE",
  headline: "Invoicing Built for the Workshop, Not the Boardroom",
  subheadline:
    "Send professional quotes, track materials, and get paid on time — purpose-built for South African carpenters and joinery businesses.",
  cta: "Start Free Today",
  features: [
    { icon: "📐", title: "Quote Builder", desc: "Create itemised quotes with timber grades, hardware costs, and labour — all in minutes." },
    { icon: "🪚", title: "Job Cost Tracking", desc: "Log materials per project so you always know what a job actually costs you." },
    { icon: "🗂️", title: "Client Records", desc: "Keep full histories of every client, project, and payment in one place." },
    { icon: "💳", title: "Instant Payments", desc: "Accept EFT, PayFast, or SnapScan with payment links on every invoice." },
    { icon: "📦", title: "Stock & Materials", desc: "Track sheet goods, solid timber, and consumables across your projects." },
    { icon: "📊", title: "Business Reports", desc: "Monthly revenue, outstanding balances, and job profitability at a glance." },
  ],
  pricing: [
    {
      name: "Starter",
      price: "Free",
      period: "",
      desc: "For sole traders just getting started",
      features: ["5 invoices/month", "Basic quote builder", "Client records", "PDF export"],
      cta: "Get Started Free",
      highlight: false,
    },
    {
      name: "Craftsman",
      price: "R299",
      period: "/mo",
      desc: "For established carpentry businesses",
      features: ["Unlimited invoices & quotes", "Job cost tracking", "Material stock log", "Payment links (EFT, PayFast)", "Monthly reports", "Email & WhatsApp delivery"],
      cta: "Start 14-Day Trial",
      highlight: true,
    },
    {
      name: "Workshop",
      price: "R599",
      period: "/mo",
      desc: "For joinery shops with multiple staff",
      features: ["Everything in Craftsman", "Up to 5 users", "Multi-job dashboard", "Priority support", "Custom invoice branding", "Xero / QuickBooks sync"],
      cta: "Contact Sales",
      highlight: false,
    },
  ],
  testimonials: [
    {
      quote: "I used to spend Sunday evenings writing quotes in Word. Now I send them from site in under 5 minutes. Clients love how professional they look.",
      name: "Riaan van der Merwe",
      role: "Custom Furniture, Cape Town",
      avatar: "RV",
    },
    {
      quote: "The material cost tracker alone saved my business. I was underquoting badly. Now I know exactly what every job costs before I start.",
      name: "Themba Nkosi",
      role: "Kitchen Installations, Joburg",
      avatar: "TN",
    },
    {
      quote: "My outstanding invoices dropped by 60% in the first month. The payment link on the invoice just makes it too easy for clients to pay.",
      name: "André Botha",
      role: "Joinery & Shopfitting, Pretoria",
      avatar: "AB",
    },
  ],
  faqs: [
    { q: "Is SolidFlo built specifically for carpentry?", a: "Yes. The quote templates, material tracking fields, and job costing tools are all designed around how carpentry and joinery businesses actually work — not adapted from generic invoicing software." },
    { q: "Can I use it on site from my phone?", a: "Absolutely. SolidFlo is fully mobile-responsive. You can create and send quotes directly from a job site, no laptop needed." },
    { q: "Does it handle VAT automatically?", a: "Yes. You can set VAT-inclusive or exclusive pricing per quote, and it calculates everything correctly for SARS compliance." },
    { q: "What if I have an apprentice or office assistant?", a: "The Workshop plan supports up to 5 users, each with their own login and permissions." },
    { q: "Can I import my existing client list?", a: "Yes, you can import clients via CSV. Our support team can also help you migrate from spreadsheets or another system." },
  ],
};

// ─── Smooth Scroll ────────────────────────────────────────────────────────────
function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

// ─── Wood Grain SVG Pattern ───────────────────────────────────────────────────
function WoodGrainBg({ opacity = 0.04 }) {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <filter id="grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#grain)" />
    </svg>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar({ onLogin, onRegister }) {
  const [open, setOpen] = useState(false);

  return (
    <nav
      style={{
        background: config.color,
        borderBottom: `1px solid rgba(198,124,58,0.15)`,
        fontFamily: "'DM Sans', sans-serif",
      }}
      className="sticky top-0 z-50"
    >
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
            style={{ background: `${config.accent}22`, border: `1px solid ${config.accent}44` }}
          >
            🪵
          </div>
          <div>
            <span
              className="font-bold text-sm tracking-tight"
              style={{ color: "#F5E6D3", fontFamily: "'Playfair Display', serif", letterSpacing: "0.01em" }}
            >
              SolidFlo
            </span>
            <span
              className="text-xs ml-2 px-2 py-0.5 rounded-full"
              style={{ background: `${config.accent}22`, color: config.accent, fontSize: "0.65rem", letterSpacing: "0.06em" }}
            >
              CARPENTRY
            </span>
          </div>
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-7">
          {["features", "pricing", "testimonials", "faq"].map((s) => (
            <button
              key={s}
              onClick={() => scrollTo(s)}
              className="text-sm capitalize transition-colors"
              style={{ color: "rgba(245,230,211,0.45)", letterSpacing: "0.03em" }}
              onMouseEnter={(e) => (e.target.style.color = "#F5E6D3")}
              onMouseLeave={(e) => (e.target.style.color = "rgba(245,230,211,0.45)")}
            >
              {s}
            </button>
          ))}
        </div>

        {/* CTA buttons */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={onLogin}
            className="px-4 py-1.5 text-sm transition-colors"
            style={{ color: "rgba(245,230,211,0.5)" }}
            onMouseEnter={(e) => (e.target.style.color = "#F5E6D3")}
            onMouseLeave={(e) => (e.target.style.color = "rgba(245,230,211,0.5)")}
          >
            Sign In
          </button>
          <button
            onClick={onRegister}
            className="px-5 py-2 text-sm font-semibold rounded-lg transition-all hover:opacity-90"
            style={{ background: config.accent, color: "#fff", letterSpacing: "0.02em" }}
          >
            {config.cta}
          </button>
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setOpen(!open)} className="md:hidden p-2" style={{ color: "rgba(245,230,211,0.6)" }}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {open ? <path d="M6 18L18 6M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>

      {open && (
        <div
          style={{ background: config.colorMid, borderTop: `1px solid rgba(198,124,58,0.15)` }}
          className="md:hidden px-6 pb-5 pt-3 space-y-1"
        >
          {["features", "pricing", "testimonials", "faq"].map((s) => (
            <button
              key={s}
              onClick={() => { scrollTo(s); setOpen(false); }}
              className="block w-full text-left py-2 text-sm capitalize"
              style={{ color: "rgba(245,230,211,0.6)" }}
            >
              {s}
            </button>
          ))}
          <div className="flex gap-2 pt-3">
            <button onClick={onLogin} className="flex-1 py-2.5 text-sm rounded-lg border" style={{ color: "#F5E6D3", borderColor: "rgba(198,124,58,0.3)" }}>
              Sign In
            </button>
            <button onClick={onRegister} className="flex-1 py-2.5 text-sm font-semibold rounded-lg" style={{ background: config.accent, color: "#fff" }}>
              Sign Up Free
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero({ onRegister }) {
  return (
    <section
      className="relative overflow-hidden"
      style={{ background: config.color, minHeight: "88vh", display: "flex", alignItems: "center" }}
    >
      <WoodGrainBg opacity={0.045} />

      {/* Warm glow */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-64 blur-3xl opacity-20 pointer-events-none"
        style={{ background: `radial-gradient(ellipse, ${config.accent}, transparent 70%)` }}
      />

      {/* Decorative chisel marks */}
      <div className="absolute top-12 right-0 w-64 h-full opacity-5 pointer-events-none" style={{ borderLeft: `1px solid ${config.accent}` }} />
      <div className="absolute top-12 right-8 w-px h-full opacity-5 pointer-events-none" style={{ background: config.accent }} />

      <div className="relative max-w-5xl mx-auto px-6 py-24 text-center w-full">
        {/* Eyebrow */}
        <div
          className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-xs font-semibold mb-8 tracking-widest uppercase"
          style={{
            background: `${config.accent}18`,
            color: config.accent,
            border: `1px solid ${config.accent}35`,
            letterSpacing: "0.1em",
          }}
        >
          <span>🪚</span>
          <span>Purpose-Built for South African Carpenters</span>
        </div>

        <h1
          className="text-4xl sm:text-6xl font-bold leading-tight mb-6"
          style={{
            color: "#F5E6D3",
            fontFamily: "'Playfair Display', serif",
            lineHeight: 1.15,
          }}
        >
          {config.headline}
        </h1>

        <p
          className="text-base sm:text-xl leading-relaxed max-w-2xl mx-auto mb-12"
          style={{ color: "rgba(245,230,211,0.5)", fontFamily: "'DM Sans', sans-serif" }}
        >
          {config.subheadline}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onRegister}
            className="px-9 py-4 rounded-xl font-bold text-white text-base transition-all hover:brightness-110"
            style={{ background: config.accent, fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.02em" }}
          >
            {config.cta}
          </button>
          <button
            onClick={() => scrollTo("features")}
            className="px-9 py-4 rounded-xl font-semibold text-sm transition-colors"
            style={{
              color: "rgba(245,230,211,0.65)",
              border: `1px solid rgba(198,124,58,0.3)`,
              fontFamily: "'DM Sans', sans-serif",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = `rgba(198,124,58,0.7)`)}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = `rgba(198,124,58,0.3)`)}
          >
            See how it works →
          </button>
        </div>

        {/* Trust bar */}
        <div className="flex flex-wrap items-center justify-center gap-8 mt-14" style={{ color: "rgba(245,230,211,0.25)", fontSize: "0.75rem", fontFamily: "'DM Sans', sans-serif" }}>
          {["No credit card required", "Free plan available", "Cancel anytime", "Made in South Africa 🇿🇦"].map((t) => (
            <span key={t} className="flex items-center gap-2">
              <span style={{ color: config.accent }}>✦</span>
              {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────
function CraftDivider() {
  return (
    <div className="flex items-center justify-center gap-4 py-6" style={{ background: config.lightBg }}>
      <div className="h-px flex-1" style={{ background: `linear-gradient(to right, transparent, ${config.accent}40)` }} />
      <span style={{ color: config.accent, fontSize: "1.2rem" }}>✦</span>
      <div className="h-px flex-1" style={{ background: `linear-gradient(to left, transparent, ${config.accent}40)` }} />
    </div>
  );
}

// ─── Features ─────────────────────────────────────────────────────────────────
function Features() {
  return (
    <section id="features" className="py-20 sm:py-28" style={{ background: config.lightBg }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <p
            className="text-xs font-bold uppercase tracking-widest mb-3"
            style={{ color: config.accent, letterSpacing: "0.15em", fontFamily: "'DM Sans', sans-serif" }}
          >
            Features
          </p>
          <h2
            className="text-3xl sm:text-4xl font-bold text-gray-900"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Every tool your carpentry business needs
          </h2>
          <p className="text-gray-400 mt-3 max-w-lg mx-auto text-sm" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            No bloat. No irrelevant features. Just what a carpenter actually uses every day.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {config.features.map((f) => (
            <div
              key={f.title}
              className="group p-7 rounded-2xl border transition-all duration-300 cursor-default"
              style={{
                background: "#fff",
                borderColor: "rgba(198,124,58,0.12)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = `rgba(198,124,58,0.5)`;
                e.currentTarget.style.boxShadow = `0 8px 32px rgba(198,124,58,0.1)`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = `rgba(198,124,58,0.12)`;
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-5"
                style={{ background: config.accentLight }}
              >
                {f.icon}
              </div>
              <h3
                className="font-bold text-gray-800 mb-2 text-sm"
                style={{ fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.01em" }}
              >
                {f.title}
              </h3>
              <p className="text-gray-400 text-xs leading-relaxed" style={{ fontFamily: "'DM Sans', sans-serif" }}>
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
function Pricing({ onRegister }) {
  return (
    <section id="pricing" className="py-20 sm:py-28 bg-white">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-14">
          <p
            className="text-xs font-bold uppercase tracking-widest mb-3"
            style={{ color: config.accent, letterSpacing: "0.15em", fontFamily: "'DM Sans', sans-serif" }}
          >
            Pricing
          </p>
          <h2
            className="text-3xl sm:text-4xl font-bold text-gray-900"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Simple, honest pricing
          </h2>
          <p className="text-gray-400 mt-3 text-sm" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Start free. Upgrade when you're ready. No hidden fees.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {config.pricing.map((plan) => (
            <div
              key={plan.name}
              className="relative rounded-2xl p-7 flex flex-col"
              style={
                plan.highlight
                  ? { background: config.color, boxShadow: `0 20px 60px rgba(26,18,8,0.35)` }
                  : { background: "#fff", border: `1px solid rgba(198,124,58,0.15)` }
              }
            >
              {plan.highlight && (
                <div
                  className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-xs font-bold px-4 py-1.5 rounded-full text-white tracking-wider"
                  style={{ background: config.accent, letterSpacing: "0.06em", fontFamily: "'DM Sans', sans-serif" }}
                >
                  MOST POPULAR
                </div>
              )}

              <div className="mb-5">
                <p
                  className="font-semibold text-xs mb-1 uppercase tracking-widest"
                  style={{
                    color: plan.highlight ? "rgba(245,230,211,0.5)" : config.accent,
                    letterSpacing: "0.12em",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {plan.name}
                </p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span
                    className="text-4xl font-bold"
                    style={{
                      color: plan.highlight ? "#F5E6D3" : "#1A1208",
                      fontFamily: "'Playfair Display', serif",
                    }}
                  >
                    {plan.price}
                  </span>
                  <span
                    className="text-sm"
                    style={{ color: plan.highlight ? "rgba(245,230,211,0.4)" : "#9CA3AF", fontFamily: "'DM Sans', sans-serif" }}
                  >
                    {plan.period}
                  </span>
                </div>
                <p
                  className="text-xs mt-2"
                  style={{
                    color: plan.highlight ? "rgba(245,230,211,0.4)" : "#9CA3AF",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {plan.desc}
                </p>
              </div>

              <ul className="space-y-3 flex-1 mb-7">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-xs">
                    <svg
                      className="w-4 h-4 flex-shrink-0 mt-0.5"
                      style={{ color: config.accent }}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span
                      style={{
                        color: plan.highlight ? "rgba(245,230,211,0.75)" : "#4B5563",
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                onClick={onRegister}
                className="w-full py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90"
                style={
                  plan.highlight
                    ? { background: config.accent, color: "#fff", fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.02em" }
                    : { background: config.accentLight, color: config.accentDark, fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.02em" }
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
function Testimonials() {
  return (
    <section id="testimonials" className="py-20 sm:py-28" style={{ background: config.lightBg }}>
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-14">
          <p
            className="text-xs font-bold uppercase tracking-widest mb-3"
            style={{ color: config.accent, letterSpacing: "0.15em", fontFamily: "'DM Sans', sans-serif" }}
          >
            Testimonials
          </p>
          <h2
            className="text-3xl sm:text-4xl font-bold text-gray-900"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Trusted by carpenters across SA
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {config.testimonials.map((t) => (
            <div
              key={t.name}
              className="p-7 rounded-2xl bg-white flex flex-col gap-5"
              style={{ border: `1px solid rgba(198,124,58,0.12)` }}
            >
              {/* Stars */}
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4" style={{ color: config.accent }} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              <p
                className="text-gray-600 text-sm leading-relaxed flex-1"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                "{t.quote}"
              </p>

              <div className="flex items-center gap-3 pt-4" style={{ borderTop: `1px solid rgba(198,124,58,0.1)` }}>
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{ background: config.accentDark, fontFamily: "'DM Sans', sans-serif" }}
                >
                  {t.avatar}
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-800" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    {t.name}
                  </p>
                  <p className="text-xs text-gray-400" style={{ fontFamily: "'DM Sans', sans-serif" }}>
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
function FAQ() {
  const [open, setOpen] = useState(null);

  return (
    <section id="faq" className="py-20 sm:py-28 bg-white">
      <div className="max-w-2xl mx-auto px-6">
        <div className="text-center mb-14">
          <p
            className="text-xs font-bold uppercase tracking-widest mb-3"
            style={{ color: config.accent, letterSpacing: "0.15em", fontFamily: "'DM Sans', sans-serif" }}
          >
            FAQ
          </p>
          <h2
            className="text-3xl sm:text-4xl font-bold text-gray-900"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Common questions
          </h2>
        </div>

        <div className="space-y-3">
          {config.faqs.map((faq, i) => (
            <div
              key={i}
              className="rounded-xl overflow-hidden"
              style={{ border: `1px solid rgba(198,124,58,0.15)` }}
            >
              <button
                className="w-full flex items-center justify-between px-6 py-4 text-left transition-colors"
                onClick={() => setOpen(open === i ? null : i)}
                style={{ background: open === i ? config.accentLight : "#fff" }}
              >
                <span
                  className="text-sm font-semibold text-gray-800 pr-4"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  {faq.q}
                </span>
                <svg
                  className="w-4 h-4 flex-shrink-0 transition-transform duration-200"
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
                <div
                  className="px-6 pb-5 text-sm text-gray-500 leading-relaxed pt-3"
                  style={{
                    borderTop: `1px solid rgba(198,124,58,0.1)`,
                    background: config.accentLight,
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
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
function CTABanner({ onRegister }) {
  return (
    <section
      className="relative overflow-hidden py-20 sm:py-24"
      style={{ background: config.color }}
    >
      <WoodGrainBg opacity={0.04} />
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10"
        style={{ fontSize: "20rem", lineHeight: 1 }}
      >
        🪵
      </div>
      <div className="relative max-w-3xl mx-auto px-6 text-center">
        <p
          className="text-xs font-bold uppercase tracking-widest mb-4"
          style={{ color: config.accent, letterSpacing: "0.15em", fontFamily: "'DM Sans', sans-serif" }}
        >
          Get started today
        </p>
        <h2
          className="text-3xl sm:text-5xl font-bold mb-5"
          style={{ color: "#F5E6D3", fontFamily: "'Playfair Display', serif", lineHeight: 1.2 }}
        >
          Ready to get paid faster?
        </h2>
        <p
          className="mb-10 text-sm sm:text-base"
          style={{ color: "rgba(245,230,211,0.45)", fontFamily: "'DM Sans', sans-serif" }}
        >
          Join hundreds of carpentry businesses already using SolidFlo.
        </p>
        <button
          onClick={onRegister}
          className="px-10 py-4 rounded-xl font-bold text-white text-base transition-all hover:brightness-110"
          style={{ background: config.accent, fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.02em" }}
        >
          {config.cta}
        </button>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer({ onLogin, onRegister }) {
  return (
    <footer className="border-t py-10 bg-white" style={{ borderColor: "rgba(198,124,58,0.12)" }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🪵</span>
            <div>
              <p
                className="font-bold text-gray-800 text-sm"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                SolidFlo Carpentry
              </p>
              <p className="text-xs text-gray-400" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Professional invoicing for SA carpenters
              </p>
            </div>
          </div>

          <div className="flex items-center gap-5 text-xs text-gray-400" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            {["features", "pricing", "faq"].map((s) => (
              <button
                key={s}
                onClick={() => scrollTo(s)}
                className="capitalize hover:text-gray-600 transition-colors"
              >
                {s}
              </button>
            ))}
            <button onClick={onLogin} className="hover:text-gray-600 transition-colors">Sign In</button>
            <button
              onClick={onRegister}
              className="px-4 py-1.5 rounded-lg text-white text-xs font-semibold"
              style={{ background: config.accent }}
            >
              Sign Up
            </button>
          </div>
        </div>

        <div
          className="mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-300"
          style={{ borderTop: "1px solid rgba(198,124,58,0.1)", fontFamily: "'DM Sans', sans-serif" }}
        >
          <p>© {new Date().getFullYear()} SolidFlo. All rights reserved.</p>
          <p>Made with craft in South Africa 🇿🇦</p>
        </div>
      </div>
    </footer>
  );
}

// ─── Google Fonts Loader ──────────────────────────────────────────────────────
function FontLoader() {
  return (
    <link
      href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap"
      rel="stylesheet"
    />
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function CarpentryLandingPage() {
  const goLogin = () => alert("Navigate to /login");
  const goRegister = () => alert("Navigate to /register");

  return (
    <>
      <FontLoader />
      <div className="min-h-screen" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <Navbar onLogin={goLogin} onRegister={goRegister} />
        <Hero onRegister={goRegister} />
        <CraftDivider />
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