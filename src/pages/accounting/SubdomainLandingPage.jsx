import { useState } from "react";
import { useNavigate } from "react-router-dom";

// ─── Accounting config (hardcoded) ────────────────────────────────────────────
const config = {
  icon: "🧾",
  label: "Accounting",
  color: "#085041",
  accent: "#1D9E75",
  accentDark: "#0F6E56",
  lightBg: "#E1F5EE",
  cta: "Start Free Trial",
  headline: "Invoice smarter.\nGet paid faster.",
  subheadline:
    "Professional invoicing, automated reminders, VAT-compliant documents, and real-time cash flow insights — built for South African accounting firms.",
  features: [
    {
      icon: "📄",
      title: "SARS-Compliant Invoices",
      desc: "Generate VAT invoices that meet SARS requirements, with automatic tax calculations and compliant document formatting.",
    },
    {
      icon: "🔔",
      title: "Automated Payment Reminders",
      desc: "Schedule reminders via SMS and email. Reduce overdue accounts without the awkward follow-up calls.",
    },
    {
      icon: "📊",
      title: "Cash Flow Dashboard",
      desc: "Live view of outstanding invoices, paid amounts, and projected cash flow across all your clients.",
    },
    {
      icon: "🏦",
      title: "EFT & Card Payments",
      desc: "Accept EFT payments with your banking details embedded, or enable card payments through PayFast and Peach Payments.",
    },
    {
      icon: "👥",
      title: "Multi-Client Management",
      desc: "Manage invoices across dozens of clients from a single dashboard, with per-client billing history and reports.",
    },
    {
      icon: "🔗",
      title: "Xero & Sage Integration",
      desc: "Sync invoices and payment status directly with Xero, Sage One, or QuickBooks — no double capturing.",
    },
  ],
  pricing: [
    {
      name: "Starter",
      price: "Free",
      period: "",
      desc: "For sole practitioners just getting started",
      cta: "Get started free",
      highlight: false,
      features: [
        "Up to 5 invoices/month",
        "SARS-compliant templates",
        "Client portal",
        "Email support",
      ],
    },
    {
      name: "Professional",
      price: "R499",
      period: "/month",
      desc: "For growing accounting practices",
      cta: "Start free trial",
      highlight: true,
      features: [
        "Unlimited invoices",
        "Automated reminders",
        "Cash flow dashboard",
        "Xero & Sage sync",
        "Up to 50 clients",
        "Priority support",
      ],
    },
    {
      name: "Firm",
      price: "R1 299",
      period: "/month",
      desc: "For multi-partner firms & teams",
      cta: "Contact sales",
      highlight: false,
      features: [
        "Everything in Professional",
        "Unlimited clients",
        "Multi-user access (5 seats)",
        "White-label invoices",
        "API access",
      ],
    },
  ],
  testimonials: [
    {
      quote:
        "SolidFlo cut our debtor days from 45 to 18. The automated reminders do the chasing for us — our clients pay on time now.",
      name: "Thabo Mokoena",
      role: "CA(SA), Johannesburg",
      avatar: "TM",
    },
    {
      quote:
        "The Xero integration is seamless. I create an invoice in SolidFlo and it's in our books instantly. Saves us hours every month.",
      name: "Suzanne van der Berg",
      role: "Bookkeeper, Cape Town",
      avatar: "SV",
    },
    {
      quote:
        "SARS-compliant VAT invoices out of the box. Our external auditors have zero complaints — that alone is worth the subscription.",
      name: "Nomsa Khumalo",
      role: "Accounting Firm, Pretoria",
      avatar: "NK",
    },
  ],
  faqs: [
    {
      q: "Are invoices compliant with SARS VAT requirements?",
      a: "Yes. Every invoice includes all fields required by SARS — VAT registration number, tax invoice header, line-item VAT breakdowns, and compliant date formats. We stay updated with SARS guidelines automatically.",
    },
    {
      q: "Which accounting software does SolidFlo integrate with?",
      a: "We integrate natively with Xero, Sage One (Accounting), and QuickBooks Online. Invoices and payment status sync automatically — no CSV exports or manual capturing needed.",
    },
    {
      q: "Can my clients pay via EFT?",
      a: "Absolutely. Your banking details are embedded on every invoice with a unique payment reference. We also support instant EFT via PayFast, and card payments through Peach Payments — all tracked automatically.",
    },
    {
      q: "How many clients can I manage on the free plan?",
      a: "The free Starter plan supports up to 3 active clients and 5 invoices per month — enough to trial the platform fully. The Professional plan supports 50 clients, and the Firm plan is unlimited.",
    },
    {
      q: "Is my client data stored securely in South Africa?",
      a: "Yes. All data is hosted within South Africa and is fully POPIA compliant. We use bank-grade encryption for data in transit and at rest, and perform regular independent security audits.",
    },
  ],
};

// ─── Smooth scroll helper ─────────────────────────────────────────────────────
function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar({ onLogin, onRegister }) {
  const [open, setOpen] = useState(false);

  return (
    <nav
      style={{
        background: config.color,
        borderBottom: `1px solid rgba(255,255,255,0.08)`,
      }}
      className="sticky top-0 z-50"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <span className="text-xl">{config.icon}</span>
          <div>
            <span className="text-white font-bold text-sm">SolidFlo</span>
            <span className="text-white/40 text-xs ml-1.5">{config.label}</span>
          </div>
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {["features", "pricing", "testimonials", "faq"].map((s) => (
            <button
              key={s}
              onClick={() => scrollTo(s)}
              className="text-white/60 hover:text-white text-sm capitalize transition-colors"
            >
              {s}
            </button>
          ))}
        </div>

        {/* CTA buttons */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={onLogin}
            className="px-4 py-1.5 text-sm text-white/70 hover:text-white transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={onRegister}
            className="px-4 py-1.5 text-sm font-semibold rounded-lg transition-colors"
            style={{ background: config.accent, color: "#fff" }}
          >
            {config.cta}
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 text-white/60 hover:text-white"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            {open ? (
              <path d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div
          style={{ background: config.color }}
          className="md:hidden border-t border-white/10 px-4 pb-4 pt-2 space-y-2"
        >
          {["features", "pricing", "testimonials", "faq"].map((s) => (
            <button
              key={s}
              onClick={() => {
                scrollTo(s);
                setOpen(false);
              }}
              className="block w-full text-left text-white/60 hover:text-white py-1.5 text-sm capitalize"
            >
              {s}
            </button>
          ))}
          <div className="flex gap-2 pt-2">
            <button
              onClick={onLogin}
              className="flex-1 py-2 text-sm text-white border border-white/20 rounded-lg hover:border-white/40 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={onRegister}
              className="flex-1 py-2 text-sm font-semibold rounded-lg"
              style={{ background: config.accent, color: "#fff" }}
            >
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
      className="relative overflow-hidden py-20 sm:py-28"
      style={{ background: config.color }}
    >
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(${config.accent}33 1px, transparent 1px), linear-gradient(90deg, ${config.accent}33 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Glow blob */}
      <div
        className="absolute -top-20 -right-20 w-96 h-96 rounded-full blur-3xl opacity-20"
        style={{ background: config.accent }}
      />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6"
          style={{
            background: `${config.accent}22`,
            color: config.accent,
            border: `1px solid ${config.accent}44`,
          }}
        >
          <span>{config.icon}</span>
          <span>Built for {config.label} Businesses</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight mb-5 whitespace-pre-line">
          {config.headline}
        </h1>
        <p className="text-base sm:text-xl text-white/60 leading-relaxed max-w-2xl mx-auto mb-10">
          {config.subheadline}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onRegister}
            className="px-8 py-3.5 rounded-xl font-bold text-white text-base shadow-lg transition-transform hover:scale-105"
            style={{ background: config.accent }}
          >
            {config.cta}
          </button>
          <button
            onClick={() => scrollTo("features")}
            className="px-8 py-3.5 rounded-xl font-semibold text-sm text-white/70 border border-white/20 hover:border-white/40 transition-colors"
          >
            See how it works →
          </button>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-white/30 text-xs">
          {[
            "No credit card required",
            "Free plan available",
            "Cancel anytime",
            "South African business",
          ].map((t) => (
            <span key={t} className="flex items-center gap-1.5">
              <svg
                className="w-3.5 h-3.5"
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
              {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Features ─────────────────────────────────────────────────────────────────
function Features() {
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
              className="p-6 rounded-2xl border border-gray-100 hover:border-transparent transition-all hover:shadow-lg"
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
function Pricing({ onRegister }) {
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
              className={`relative rounded-2xl p-6 flex flex-col ${
                plan.highlight
                  ? "shadow-xl text-white"
                  : "bg-white border border-gray-200"
              }`}
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
                  className={`font-bold text-sm mb-0.5 ${
                    plan.highlight ? "text-white/70" : "text-gray-500"
                  }`}
                >
                  {plan.name}
                </p>
                <div className="flex items-baseline gap-1">
                  <span
                    className={`text-3xl font-extrabold ${
                      plan.highlight ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span
                      className={`text-sm ${
                        plan.highlight ? "text-white/50" : "text-gray-400"
                      }`}
                    >
                      {plan.period}
                    </span>
                  )}
                </div>
                <p
                  className={`text-xs mt-1 ${
                    plan.highlight ? "text-white/50" : "text-gray-400"
                  }`}
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
function Testimonials() {
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
      </div>
    </section>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────
function FAQ() {
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
function CTABanner({ onRegister }) {
  return (
    <section className="py-16 sm:py-20" style={{ background: config.color }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <span className="text-4xl">{config.icon}</span>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-4 mb-4">
          Ready to get paid faster?
        </h2>
        <p className="text-white/50 mb-8 text-sm sm:text-base">
          Join hundreds of {config.label.toLowerCase()} businesses already using
          SolidFlo.
        </p>
        <button
          onClick={onRegister}
          className="px-10 py-4 rounded-xl font-bold text-white text-base shadow-lg transition-transform hover:scale-105"
          style={{ background: config.accent }}
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
    <footer className="border-t border-gray-100 py-10 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">{config.icon}</span>
            <div>
              <p className="font-bold text-gray-800 text-sm">
                SolidFlo {config.label}
              </p>
              <p className="text-xs text-gray-400">
                Professional invoicing for SA businesses
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-gray-400">
            <button
              onClick={() => scrollTo("features")}
              className="hover:text-gray-600 transition-colors"
            >
              Features
            </button>
            <button
              onClick={() => scrollTo("pricing")}
              className="hover:text-gray-600 transition-colors"
            >
              Pricing
            </button>
            <button
              onClick={() => scrollTo("faq")}
              className="hover:text-gray-600 transition-colors"
            >
              FAQ
            </button>
            <button
              onClick={onLogin}
              className="hover:text-gray-600 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={onRegister}
              className="px-3 py-1.5 rounded-lg text-white text-xs font-semibold"
              style={{ background: config.accent }}
            >
              Sign Up
            </button>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-300">
          <p>© {new Date().getFullYear()} SolidFlo. All rights reserved.</p>
          <p>Made in South Africa 🇿🇦</p>
        </div>
      </div>
    </footer>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function SubdomainLandingPage() {
  const navigate = useNavigate();

  const goLogin = () => navigate("/login");
  const goRegister = () => navigate("/register");

  return (
    <div className="min-h-screen font-sans">
      <Navbar onLogin={goLogin} onRegister={goRegister} />
      <Hero onRegister={goRegister} />
      <Features />
      <Pricing onRegister={goRegister} />
      <Testimonials />
      <FAQ />
      <CTABanner onRegister={goRegister} />
      <Footer onLogin={goLogin} onRegister={goRegister} />
    </div>
  );
}
