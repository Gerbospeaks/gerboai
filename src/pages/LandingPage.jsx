import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import HeroInvoiceOverlay from "./HeroInvoiceOverlay";
import IndustryPickerModal from "../components/IndustryPickerModal";
import { useIndustryPicker } from "../hooks/useIndustryPicker";
import CookieConsent from "../components/CookieConsent";
import { css } from "./landingPageStyles";
import google from "../assets/google-play.png";
import appStore from "../assets/app-store.png"; 
import {
  Zap,
  TrendingUp,
  Layers,
  ArrowRight,
  CheckCircle,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import logo from "../assets/img/solidflo.png";
import instagram from "../assets/images/instagram.png";
import facebook from "../assets/images/facebook.png";
import twitter from "../assets/images/twitter.png";
import { useCurrency as useAppCurrency } from "../contexts/CurrencyContext";

/* ─── Data (module-level so it isn't rebuilt on every render) ─────────────── */
const FEATURES = [
  {
    icon: <Zap size={20} />,
    title: "Documents in seconds",
    desc: "Invoices, quotes, bookings, reports and purchase orders — created and sent in a few clicks, not hours.",
  },
  {
    icon: <TrendingUp size={20} />,
    title: "Get paid faster",
    desc: "Automated reminders and online payment links keep money moving, so you spend less time chasing clients.",
  },
  {
    icon: <Layers size={20} />,
    title: "Built for your trade",
    desc: "Templates for 26 industries, from mechanics and electricians to healthcare and education — one platform.",
  },
];

const MARKET = [
  {
    emoji: "🔧",
    title: "Mechanical",
    desc: "Fleet servicing, diagnostics, engine rebuilds and roadworthy inspections.",
    count: 2,
  },
  {
    emoji: "⚡",
    title: "Electrical",
    desc: "COC-certified electricians for residential, commercial and solar wiring.",
    count: 2,
  },
  {
    emoji: "🚿",
    title: "Plumbing",
    desc: "24/7 emergency callouts, leak detection and full bathroom renovations.",
    count: 1,
  },
  {
    emoji: "🏗️",
    title: "Construction",
    desc: "CIDB-accredited contractors for new builds, renovations and extensions.",
    count: 1,
  },
  {
    emoji: "❄️",
    title: "HVAC",
    desc: "Commercial and industrial HVAC installation, servicing and repairs.",
    count: 1,
  },
  {
    emoji: "🔒",
    title: "Security",
    desc: "PSiRA-registered armed response, site guarding and CCTV solutions.",
    count: 1,
  },
];

const TESTIMONIALS = [
  {
    name: "Mark Moyo",
    role: "Electrician",
    image: "https://i.pravatar.cc/150?u=markmoyo",
    text: "Since using the stamp and signature feature, my invoices look far more professional. Clients take them seriously and I get paid without the back-and-forth.",
  },
  {
    name: "Gregquinn Lee",
    role: "Founder, Reelancestry Streaming",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Gracious",
    text: "The automated recurring billing feature has been a game-changer for our subscription business. Our cash flow has never been better.",
  },
  {
    name: "Donald Potts",
    role: "Owner, Gerbo AI Call Answering AI",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Donald",
    text: "Best invoicing software we've used. Simple, powerful, and the support team is incredibly responsive.",
  },
];

const PLANS = [
  {
    name: "Starter",
    usdPrice: 0,
    period: "Forever Free",
    popular: false,
    desc: "Perfect for freelancers and solo entrepreneurs",
    features: [
      "Up to 5 clients",
      "Unlimited invoices",
      "Basic reports",
      "Email support",
      "Mobile app access",
    ],
    cta: "Get Started Free",
  },
  {
    name: "Professional",
    usdPrice: 5,
    period: "per month",
    popular: true,
    desc: "Ideal for growing businesses",
    features: [
      "Unlimited clients",
      "Recurring billing",
      "Time tracking",
      "Advanced reports",
      "Priority support",
      "Custom branding",
      "Payment integrations",
      "API access",
    ],
    cta: "Start Free Trial",
  },
  {
    name: "Enterprise",
    usdPrice: 10,
    period: "per month",
    popular: false,
    desc: "For large teams and businesses",
    features: [
      "Everything in Professional",
      "Multi-user access",
      "Advanced permissions",
      "Dedicated account manager",
      "Custom integrations",
      "SLA guarantee",
      "White-label option",
      "Custom training",
    ],
    cta: "Contact Sales",
  },
];

const FAQS = [
  {
    q: "Is SolidFlo really free?",
    a: "Yes! Our Starter plan is completely free forever. Unlimited invoices for up to 5 clients — no credit card required.",
  },
  {
    q: "Can I cancel my subscription anytime?",
    a: "Absolutely. No long-term contracts or cancellation fees. Upgrade, downgrade, or cancel any time from your account settings.",
  },
  {
    q: "What payment methods do you accept?",
    a: "All major credit cards (Visa, Mastercard, Amex), PayPal, and bank transfers through our integrated payment processors.",
  },
  {
    q: "Is my data secure?",
    a: "Security is our top priority. 256-bit SSL encryption, regular audits, and full GDPR and SOC 2 compliance.",
  },
  {
    q: "Do you offer customer support?",
    a: "Yes! Email support for all users. Professional and Enterprise plans get priority support with live chat access.",
  },
  {
    q: "Can I import my existing data?",
    a: "Yes — import clients and invoices from Excel, CSV, or other invoicing platforms using our built-in import tool.",
  },
];

const METRICS = [
  { label: "Monthly Revenue", value: "$548K", delta: "↑ 18% vs last month" },
  { label: "Active Businesses", value: "10,240", delta: "↑ 9% vs last month" },
  { label: "Invoices Sent", value: "84,300", delta: "↑ 22% vs last month" },
  { label: "Avg. Payment Time", value: "3.1 days", delta: "↓ 40% faster" },
];

const FUNNEL = [
  { label: "Invoice sent", pct: 100 },
  { label: "Opened", pct: 82 },
  { label: "Clicked pay", pct: 61 },
  { label: "Paid on time", pct: 74 },
  { label: "Collected", pct: 97 },
];

const NAV = [
  { id: "features", label: "Features", type: "scroll" },
  { id: "pricing", label: "Pricing", type: "scroll" },
  { id: "marketplace", label: "Marketplace", type: "modal" },
  { id: "customers", label: "Customers", type: "modal" },
  { id: "faq", label: "FAQ", type: "modal" },
];

/* ─── Modal shell ────────────────────────────────────────────────────────── */
const Modal = ({ title, subtitle, onClose, wide, children }) => {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div
      className="lp-modal-overlay"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={`lp-modal${wide ? " wide" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <button className="lp-modal-close" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>
        <div className="lp-modal-head">
          <h2>{title}</h2>
          {subtitle}
        </div>
        {children}
      </div>
    </div>
  );
};

/* ─── Page ───────────────────────────────────────────────────────────────── */
const LandingPage = () => {
  const { isOpen, intent, open, close } = useIndustryPicker();
  const navigate = useNavigate();
  const {
    currencyCode,
    countryName,
    loading: currencyLoading,
    formatCurrency: formatVisitorCurrency,
  } = useAppCurrency();

  const footerRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [modal, setModal] = useState(null); // 'pricing' | 'customers' | 'faq' | 'marketplace' | 'numbers'
  const [visible, setVisible] = useState({});
  const [activeTab, setActiveTab] = useState("home");

  const closeModal = React.useCallback(() => setModal(null), []);
  const openModal = (id) => {
    setMobileOpen(false);
    setModal(id);
  };

  const localPrice = (usd) => {
    if (currencyLoading) return null;
    if (usd === 0) return "Free";
    return formatVisitorCurrency(usd, "USD", { fractionDigits: 0 });
  };

  const scrollTo = (id) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  const handleNav = (item) => {
    setMobileOpen(false);
    item.type === "scroll" ? scrollTo(item.id) : openModal(item.id);
  };

  const openMarket = () =>
    window.open(
      "https://market.solidflo.co.za",
      "_blank",
      "noopener,noreferrer",
    );

  const openCalendly = () => {
    if (window.Calendly)
      window.Calendly.initPopupWidget({
        url: "https://calendly.com/gabriel-solidflo/30min?background_color=1a2340&text_color=ffffff&primary_color=e8442a",
      });
  };

  /* Calendly */
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://assets.calendly.com/assets/external/widget.css";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    const script = document.createElement("script");
    script.src = "https://assets.calendly.com/assets/external/widget.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.head.contains(link)) document.head.removeChild(link);
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, []);

  /* Vapi */
  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://unpkg.com/@vapi-ai/client-sdk-react/dist/embed/widget.umd.js";
    script.async = true;
    script.onload = () => {
      const container = document.getElementById("vapi-widget-container");
      if (container && !container.querySelector("vapi-widget")) {
        const widget = document.createElement("vapi-widget");
        widget.setAttribute(
          "public-key",
          "6fbcc6b2-c19e-4f0a-b3fb-dac4a5a4f377",
        );
        widget.setAttribute(
          "assistant-id",
          "7e49f9c1-b56a-4892-8c1f-28de1bb0428c",
        );
        widget.setAttribute("mode", "chat");
        widget.setAttribute("theme", "dark");
        widget.setAttribute("base-bg-color", "#002c7e");
        widget.setAttribute("accent-color", "#000000");
        widget.setAttribute("position", "bottom-right");
        widget.setAttribute("title", "Solidflo Assistant");
        widget.setAttribute("label", "");
        widget.setAttribute(
          "chat-first-message",
          "Hey, How can I help you today?",
        );
        widget.setAttribute("consent-required", "false");
        container.appendChild(widget);
      }
    };
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, []);

  /* Nav background on scroll */
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 24);
    h();
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  /* Footer curtain: pin the footer under the page and reserve its height */
  useEffect(() => {
    const el = footerRef.current;
    if (!el) return;
    const sync = () => {
      const h = el.offsetHeight;
      // Footer taller than most of the viewport can't be revealed — fall back to static
      const fits = h < window.innerHeight * 0.85 && window.innerWidth > 768;
      document.documentElement.style.setProperty("--footer-h", `${h}px`);
      document.documentElement.classList.toggle("lp-footer-reveal", fits);
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    window.addEventListener("resize", sync);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", sync);
      document.documentElement.classList.remove("lp-footer-reveal");
      document.documentElement.style.removeProperty("--footer-h");
    };
  }, []);

  /* Reveal cards */
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting)
            setVisible((p) => ({ ...p, [e.target.id]: true }));
        }),
      { threshold: 0.12 },
    );
    document.querySelectorAll("[data-anim]").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const bottomTabs = [
    {
      id: "home",
      label: "Home",
      action: () => window.scrollTo({ top: 0, behavior: "smooth" }),
      d: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    },
    {
      id: "features",
      label: "Features",
      action: () => scrollTo("features"),
      d: "M13 10V3L4 14h7v7l9-11h-7z",
    },
    {
      id: "pricing",
      label: "Pricing",
      action: () => scrollTo("pricing"),
      d: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    },
    {
      id: "faq",
      label: "FAQ",
      action: () => openModal("faq"),
      d: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    },
    {
      id: "start",
      label: "Start",
      action: () => open("register"),
      d: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
    },
  ];

  return (
    <>
      {isOpen && <IndustryPickerModal onClose={close} intent={intent} />}

      <Helmet>
        <title>SolidFlo — Business Management Software for 26 Industries</title>
        <meta
          name="description"
          content="SolidFlo is business management software built for every trade — invoicing, quotes, scheduling and client management for mechanics, electricians, construction, healthcare, education and more. Free plan available, no credit card required."
        />
        <link rel="canonical" href="https://solidflo.co.za/" />
        <meta property="og:site_name" content="SolidFlo" />
        <meta
          property="og:title"
          content="SolidFlo — Business Management Software for 26 Industries"
        />
        <meta
          property="og:description"
          content="Invoicing, quotes, scheduling and client management — one platform built for every trade. Start free, no credit card required."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://solidflo.co.za/" />
        <meta
          property="og:image"
          content="https://solidflo.co.za/og-image.jpg"
        />
        <meta property="og:locale" content="en_ZA" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="SolidFlo — Business Management Software for 26 Industries"
        />
        <meta
          name="twitter:description"
          content="Invoicing, quotes, scheduling and client management — one platform built for every trade."
        />
        <meta
          name="twitter:image"
          content="https://solidflo.co.za/og-image.jpg"
        />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "SolidFlo",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            url: "https://solidflo.co.za/",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: "4.9",
              ratingCount: "10000",
            },
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQS.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          })}
        </script>
      </Helmet>

      <div className="lp">
        <style>{css}</style>

        <div className="lp-content">
          {/* ── Nav ── */}
          <nav className={`lp-nav${scrolled ? " scrolled" : ""}`}>
            <div className="lp-nav-inner">
              <img src={logo} alt="SolidFlo" className="lp-nav-logo" />
              <div className="lp-nav-links">
                {NAV.map((n) => (
                  <button
                    key={n.id}
                    className="lp-nav-link"
                    onClick={() => handleNav(n)}
                  >
                    {n.label}
                  </button>
                ))}
              </div>
              <div className="lp-nav-ctas">
                <button className="lp-nav-link" onClick={() => open("login")}>
                  Login
                </button>
                <button
                  className="lp-btn lp-btn-light lp-btn-sm"
                  onClick={openCalendly}
                >
                  Contact sales
                </button>
                <button
                  className="lp-btn lp-btn-dark lp-btn-sm"
                  onClick={() => open("register")}
                >
                  Start free
                </button>
              </div>
              <button
                className="lp-hamburger"
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
              >
                <Menu size={22} />
              </button>
            </div>
          </nav>

          {/* ── Mobile drawer ── */}
          {mobileOpen && (
            <div
              className="lp-drawer-overlay"
              onClick={() => setMobileOpen(false)}
            />
          )}
          <div className={`lp-drawer${mobileOpen ? " open" : ""}`}>
            <button
              className="lp-drawer-close"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
            <div className="lp-drawer-links">
              {NAV.map((n) => (
                <button key={n.id} onClick={() => handleNav(n)}>
                  {n.label}
                </button>
              ))}
            </div>
            <div className="lp-drawer-ctas">
              <button
                className="lp-btn lp-btn-light lp-btn-block"
                onClick={() => open("login")}
              >
                Login
              </button>
              <button
                className="lp-btn lp-btn-dark lp-btn-block"
                onClick={() => open("register")}
              >
                Start free
              </button>
            </div>
          </div>

          {/* ── Hero ── */}
          <header className="lp-hero">
            <div className="lp-hero-grid">
              <div className="lp-hero-left">
                <h1>
                  Business management, made <em>proper</em>
                </h1>
                <p className="lp-hero-sub">
                  Invoices, quotes, bookings and reports for every trade — one
                  simple platform to run your business.
                </p>
                <div className="lp-signup">
                  <button
                    className="lp-btn lp-btn-dark lp-btn-block"
                    onClick={() => open("register")}
                  >
                    Start free <ArrowRight size={16} />
                  </button>
                  <div className="lp-signup-or">OR</div>
                  <button
                    className="lp-btn lp-btn-light lp-btn-block"
                    onClick={openCalendly}
                  >
                    Book a demo
                  </button>
                  <p className="lp-signup-fine">
                    No credit card required · 14-day free trial · Cancel anytime
                  </p>
                </div>
                <div className="lp-hero-app">
                  <img src={google} alt="Get SolidFlo on Google Play" />
                  <img
                    src={appStore}
                    alt="Download SolidFlo on the App Store"
                  />
                </div>
              </div>
              <div
                className="lp-hero-right"
                aria-label="SolidFlo assistant preview"
              >
                <HeroInvoiceOverlay />
              </div>
            </div>
          </header>

          {/* ── Features ── */}
          <section id="features" className="lp-section">
            <div className="lp-section-inner">
              <div className="lp-section-head">
                <h2>Everything you need to run your business</h2>
                <p>
                  Powerful tools that streamline your billing and help you get
                  paid faster.
                </p>
              </div>
              <div className="lp-cards">
                {FEATURES.map((f, i) => (
                  <div
                    key={f.title}
                    id={`feat-${i}`}
                    data-anim
                    className={`lp-card${visible[`feat-${i}`] ? " visible" : ""}`}
                    style={{ transitionDelay: `${i * 80}ms` }}
                  >
                    <div className="lp-card-icon">{f.icon}</div>
                    <h3>{f.title}</h3>
                    <p>{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Pricing ── */}
          <section id="pricing" className="lp-section">
            <div className="lp-section-inner">
              <div className="lp-section-head center">
                <h2>Simple, transparent pricing</h2>
                <p>
                  Choose the plan that's right for you. All plans include a
                  14-day free trial.
                </p>
                {!currencyLoading && (
                  <span className="lp-currency-badge">
                    Prices shown in <strong>{currencyCode}</strong>
                    {countryName ? ` · ${countryName}` : ""}
                  </span>
                )}
              </div>
              <div className="lp-plans">
                {PLANS.map((plan) => (
                  <div
                    key={plan.name}
                    className={`lp-plan${plan.popular ? " popular" : ""}`}
                  >
                    {plan.popular && (
                      <div className="lp-plan-badge">Most popular</div>
                    )}
                    <div className="lp-plan-name">{plan.name}</div>
                    <div className="lp-plan-price">
                      {currencyLoading ? (
                        <span className="lp-price-skeleton" />
                      ) : (
                        localPrice(plan.usdPrice)
                      )}
                    </div>
                    <div className="lp-plan-period">
                      {plan.usdPrice > 0 ? `/ ${plan.period}` : plan.period}
                      {!currencyLoading &&
                        plan.usdPrice > 0 &&
                        currencyCode !== "USD" &&
                        ` · ≈ $${plan.usdPrice} USD`}
                    </div>
                    <div className="lp-plan-desc">{plan.desc}</div>
                    <ul className="lp-plan-features">
                      {plan.features.map((f) => (
                        <li key={f} className="lp-plan-feature">
                          <CheckCircle size={14} /> {f}
                        </li>
                      ))}
                    </ul>
                    <button
                      className={`lp-btn lp-btn-block ${plan.popular ? "lp-btn-dark" : "lp-btn-light"}`}
                      onClick={() => navigate("/register")}
                    >
                      {plan.cta}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Industries strip ── */}
          <section className="lp-industries">
            <div className="lp-industries-inner">
              <div className="lp-industries-text">
                <h2>26 industries. One marketplace.</h2>
                <p>
                  Find trusted service providers across Gauteng, or list your
                  own business and start getting clients.
                </p>
                <div style={{ marginTop: 24 }}>
                  <button
                    className="lp-btn lp-btn-light"
                    onClick={() => openModal("marketplace")}
                  >
                    Explore the marketplace <ChevronRight size={16} />
                  </button>
                </div>
              </div>
              <div className="lp-pill-row">
                {MARKET.map((m) => (
                  <button
                    key={m.title}
                    className="lp-pill"
                    onClick={() => openModal("marketplace")}
                  >
                    {m.emoji} {m.title}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* ── CTA ── */}
          <section className="lp-cta">
            <div className="lp-cta-card">
              <h2>Ready to transform your billing?</h2>
              <p>
                Start your 14-day free trial today. No credit card required.
              </p>
              <div className="lp-cta-btns">
                <button
                  className="lp-btn lp-btn-dark lp-btn-lg"
                  onClick={() => navigate("/register")}
                >
                  Start free <ArrowRight size={16} />
                </button>
                <button
                  className="lp-btn lp-btn-light lp-btn-lg"
                  onClick={() => scrollTo("pricing")}
                >
                  See pricing
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* ── Footer (fixed under the page; the page scrolls over it) ── */}
        <footer className="lp-footer" ref={footerRef}>
          <div className="lp-footer-grid">
            <div>
              <img src={logo} alt="SolidFlo" className="lp-footer-logo" />
              <p className="lp-footer-tagline">
                Free online invoicing for small businesses. Create and send
                invoices, track time and expenses, and accept online payments.
              </p>
              <div className="lp-footer-socials">
                {[
                  {
                    icon: facebook,
                    alt: "Facebook",
                    href: "https://web.facebook.com/solidflo.saas",
                  },
                  {
                    icon: twitter,
                    alt: "Twitter",
                    href: "https://x.com/solidflo_saas",
                  },
                  {
                    icon: instagram,
                    alt: "Instagram",
                    href: "https://www.instagram.com/solidflo_saas?igsh=MTdwcHlxc2gyemFzdw==",
                  },
                ].map((s) => (
                  <a
                    key={s.alt}
                    href={s.href}
                    className="lp-footer-social"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.alt}
                  >
                    <img src={s.icon} alt="" />
                  </a>
                ))}
              </div>
            </div>
            <div>
              <div className="lp-footer-col-title">Product</div>
              <ul className="lp-footer-links">
                <li>
                  <button onClick={() => scrollTo("features")}>Features</button>
                </li>
                <li>
                  <button onClick={() => scrollTo("pricing")}>Pricing</button>
                </li>
                <li>
                  <button onClick={() => openModal("marketplace")}>
                    Marketplace
                  </button>
                </li>
                <li>
                  <button onClick={() => openModal("numbers")}>
                    Platform numbers
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <div className="lp-footer-col-title">Company</div>
              <ul className="lp-footer-links">
                {[
                  ["About", "/about"],
                  ["Careers", "/careers"],
                  ["Press Kit", "/press-kit"],
                  ["Contact", "/contact"],
                  ["Partners", "/partners"],
                ].map(([l, p]) => (
                  <li key={l}>
                    <button onClick={() => navigate(p)}>{l}</button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="lp-footer-col-title">Resources</div>
              <ul className="lp-footer-links">
                {[
                  ["Help Center", "/help-center"],
                  ["Blogs", "/blogs"],
                  ["Tutorials", "/tutorials"],
                  ["Community", "/community"],
                  ["Privacy Policy", "/privacy"],
                  ["Terms of Service", "/terms"],
                ].map(([l, p]) => (
                  <li key={l}>
                    <button onClick={() => navigate(p)}>{l}</button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="lp-footer-bottom">
            <span>
              © {new Date().getFullYear()} SolidFlo. All rights reserved.
            </span>
            <span>Modern Invoicing &amp; Billing</span>
          </div>
        </footer>

        <CookieConsent />
        <div id="vapi-widget-container" />

        {/* ── Modals ── */}
        {modal === "customers" && (
          <Modal
            title="Loved by growing businesses"
            onClose={closeModal}
            subtitle={<p>See what our customers have to say about SolidFlo.</p>}
          >
            <div className="lp-quotes">
              {TESTIMONIALS.map((t) => (
                <figure key={t.name} className="lp-quote" style={{ margin: 0 }}>
                  <blockquote
                    className="lp-quote-text"
                    style={{ margin: "0 0 20px" }}
                  >
                    “{t.text}”
                  </blockquote>
                  <figcaption className="lp-quote-author">
                    <img src={t.image} alt="" />
                    <div>
                      <div className="lp-quote-name">{t.name}</div>
                      <div className="lp-quote-role">{t.role}</div>
                    </div>
                  </figcaption>
                </figure>
              ))}
            </div>
          </Modal>
        )}

        {modal === "faq" && (
          <Modal
            title="Frequently asked questions"
            onClose={closeModal}
            subtitle={<p>Everything you need to know about SolidFlo.</p>}
          >
            <div className="lp-faq-list">
              {FAQS.map((f) => (
                <details key={f.q} className="lp-faq-item">
                  <summary>
                    {f.q} <ChevronRight size={18} />
                  </summary>
                  <div className="lp-faq-a">{f.a}</div>
                </details>
              ))}
            </div>
          </Modal>
        )}

        {modal === "marketplace" && (
          <Modal
            wide
            title="Verified providers, every industry"
            onClose={closeModal}
            subtitle={
              <p>
                Browse and book trusted service providers across Gauteng — or
                list your own business and start getting clients today.
              </p>
            }
          >
            <div className="lp-market-grid">
              {MARKET.map((m) => (
                <button
                  key={m.title}
                  className="lp-market-card"
                  onClick={openMarket}
                >
                  <span className="lp-market-emoji">{m.emoji}</span>
                  <div className="lp-market-title">{m.title}</div>
                  <div className="lp-market-desc">{m.desc}</div>
                  <span className="lp-market-count">
                    {m.count} provider{m.count !== 1 ? "s" : ""} listed
                  </span>
                </button>
              ))}
            </div>
            <div className="lp-modal-actions">
              <button className="lp-btn lp-btn-dark" onClick={openMarket}>
                Browse marketplace <ArrowRight size={15} />
              </button>
              <button
                className="lp-btn lp-btn-light"
                onClick={() => {
                  closeModal();
                  open("register");
                }}
              >
                List my business
              </button>
            </div>
          </Modal>
        )}

        {modal === "numbers" && (
          <Modal
            wide
            title="Numbers that speak for themselves"
            onClose={closeModal}
            subtitle={<p>Platform activity across SolidFlo businesses.</p>}
          >
            <div className="lp-metrics">
              {METRICS.map((m) => (
                <div key={m.label} className="lp-metric">
                  <div className="lp-metric-label">{m.label}</div>
                  <div className="lp-metric-value">{m.value}</div>
                  <div className="lp-metric-delta">{m.delta}</div>
                </div>
              ))}
            </div>
            <div className="lp-funnel-title">Invoice conversion funnel</div>
            {FUNNEL.map((r) => (
              <div key={r.label} className="lp-funnel-row">
                <div className="lp-funnel-label">{r.label}</div>
                <div className="lp-funnel-bar-wrap">
                  <div className="lp-funnel-bar" style={{ width: `${r.pct}%` }}>
                    {r.pct}%
                  </div>
                </div>
              </div>
            ))}
          </Modal>
        )}
      </div>

      {/* ── Mobile bottom nav ── */}
      <nav className="lp-bottom-nav" aria-label="Quick navigation">
        {bottomTabs.map((tab) => (
          <button
            key={tab.id}
            className={`lp-bottom-tab${activeTab === tab.id ? " active" : ""}`}
            onClick={() => {
              setActiveTab(tab.id);
              tab.action();
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d={tab.d} />
            </svg>
            {tab.label}
          </button>
        ))}
      </nav>
    </>
  );
};

export default LandingPage;
