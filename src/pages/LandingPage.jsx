import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import HeroInvoiceOverlay from "./HeroInvoiceOverlay";
import ChatAssistant from "../components/ChatAssistant";
import IndustryPickerModal from "../components/IndustryPickerModal";
import { useIndustryPicker } from "../hooks/useIndustryPicker";
import TimelineNavigation from "./TimelineNavigation";
import { Helmet } from "react-helmet";
import InstallButton from "../components/InstallButton";
import CookieConsent from "../components/CookieConsent";
import heroBg from "../assets/videos/world.mp4";
import { css } from "./landingPageStyles";
import google from "../assets/google-play.png";
import {
  Zap,
  Shield,
  TrendingUp,
  Clock,
  Code,
  Lock,
  Users,
  CheckCircle,
  ArrowRight,
  Star,
  Menu,
  X,
  ChevronRight,
  Play,
  Sparkles,
} from "lucide-react";
import logo from "../assets/img/solidflo.png";
import logo1 from "../assets/img/solidflo-logo.png";
import globe from "../assets/images/globe.webp";
import instagram from "../assets/images/instagram.png";
import facebook from "../assets/images/facebook.png";
import twitter from "../assets/images/twitter.png";
import linkedin from "../assets/images/linkedin.png";
import computer from "../assets/images/new_solidflo_bg_transp_text.png";
import { useCurrency as useAppCurrency } from "../contexts/CurrencyContext";

<style>{css}</style>
/* ─── Component ──────────────────────────────────────────────────────────── */
const LandingPage = () => {
  const { isOpen, intent, open, close } = useIndustryPicker();
  const navigate = useNavigate();
  const startRegister = (industryId) => {
    localStorage.setItem("pendingDashboardId", industryId);
    navigate(`/register?industry=${industryId}`);
  };
  const {
    currencyCode,
    countryName,
    loading: currencyLoading,
    formatCurrency: formatVisitorCurrency,
  } = useAppCurrency();
const footerRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);
  const [scrollPct, setScrollPct] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currentWord, setCurrentWord] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [visible, setVisible] = useState({});
  const [cardsSwapped, setCardsSwapped] = useState(false);
  const words = ["Smarter", "Faster", "Simpler", "Powerful", "Proper"];
  const slides = [
    {
      id: 1,
      src: require("../assets/images/healthcare.png"),
      alt: "Dashboard",
    },
    {
      id: 2,
      src: require("../assets/images/construction.png"),
      alt: "Invoices",
    },
    { id: 3, src: require("../assets/images/electrical.png"), alt: "Payments" },
  ];
  const ROTATING = [
    {
      word: "Smarter",
      sub: "AI-powered documents for every industry — invoices, quotes, bookings, reports and more.",
    },
    {
      word: "Faster",
      sub: "Create invoices, medical records, school reports and purchase orders in seconds, not hours.",
    },
    {
      word: "Simpler",
      sub: "From mechanics to educators, cleaners to accountants — one platform built for your business.",
    },
    {
      word: "Powerful",
      sub: "Manage clients, track payments, generate documents and run your business from one place.",
    },
    {
      word: "Proper",
      sub: "Beautiful templates for every industry — billing, healthcare, education, construction and more.",
    },
  ];
  const localPrice = (usd) => {
    if (currencyLoading) return null;
    if (usd === 0) return "Free";
    return formatVisitorCurrency(usd, "USD", { fractionDigits: 0 });
  };
  const [activeTab, setActiveTab] = useState("home");

  // scroll helpers
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };
  /* ── Calendly ── */
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

  /* ── Vapi ── */
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

  /* ── Word rotation ── */
  useEffect(() => {
    const t = setInterval(
      () => setCurrentWord((p) => (p + 1) % ROTATING.length),
      2500,
    );
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js";
    script.async = true;
    script.onload = () => {
   const gridColor = "rgba(255,255,255,0.055)";
const tickColor = "rgba(154,163,189,0.85)";

      new window.Chart(document.getElementById("sfRevenueChart"), {
        type: "bar",
        data: {
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
          datasets: [
            {
              label: "Revenue ($K)",
              data: [320, 370, 410, 450, 495, 548],
              backgroundColor: "#6366f1",
              borderRadius: 5,
              borderSkipped: false,
            },
            {
              label: "Target",
              data: [400, 400, 400, 400, 400, 400],
              type: "line",
              borderColor: "#a5b4fc",
              borderWidth: 1.5,
              borderDash: [5, 4],
              pointRadius: 0,
              fill: false,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: {
              grid: { color: gridColor },
              ticks: { color: tickColor, font: { size: 11 } },
            },
            y: {
              grid: { color: gridColor },
              ticks: {
                color: tickColor,
                font: { size: 11 },
                callback: (v) => "$" + v + "K",
              },
              beginAtZero: true,
            },
          },
        },
      });

      new window.Chart(document.getElementById("sfIndustryChart"), {
        type: "doughnut",
        data: {
          labels: [
            "Construction",
            "Electrical",
            "Healthcare",
            "Plumbing",
            "Other",
          ],
          datasets: [
            {
              data: [28, 22, 19, 16, 15],
              backgroundColor: [
                "#6366f1",
                "#10b981",
                "#f59e0b",
                "#3b82f6",
                "#ec4899",
              ],
              borderWidth: 0,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: "65%",
          plugins: { legend: { display: false } },
        },
      });

      new window.Chart(document.getElementById("sfSpeedChart"), {
        type: "bar",
        data: {
          labels: [
            "Construction",
            "Electrical",
            "Healthcare",
            "Plumbing",
            "Security",
            "Mechanical",
          ],
          datasets: [
            {
              label: "Before",
              data: [18, 14, 21, 16, 12, 19],
              backgroundColor: "#e2e8f0",
              borderRadius: 4,
              barPercentage: 0.6,
            },
            {
              label: "After SolidFlo",
              data: [5, 4, 6, 5, 3, 5],
              backgroundColor: "#6366f1",
              borderRadius: 4,
              barPercentage: 0.6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: {
              grid: { color: gridColor },
              ticks: { color: tickColor, font: { size: 11 } },
            },
            y: {
              grid: { color: gridColor },
              ticks: {
                color: tickColor,
                font: { size: 11 },
                callback: (v) => v + "d",
              },
              beginAtZero: true,
            },
          },
        },
      });
    };
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, []);
  /* ── Slide rotation ── */
  useEffect(() => {
    const t = setInterval(
      () => setCurrentSlide((p) => (p + 1) % slides.length),
      4000,
    );
    return () => clearInterval(t);
  }, []);
useEffect(() => {
  const el = footerRef.current;
  if (!el) return;

  const sync = () => {
    const h = el.offsetHeight;
    // A footer taller than most of the viewport can't be revealed properly —
    // fall back to a normal static footer instead of trapping the user.
    const fits = h < window.innerHeight * 0.85;
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
  };
}, []);
  /* ── Scroll ── */
  useEffect(() => {
    const h = () => {
      const sy = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setScrolled(sy > 60);
      setScrollPct(Math.min(sy / max, 1) * 100);
    };
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setCardsSwapped((p) => !p), 3500);
    return () => clearInterval(t);
  }, []);

  /* ── Intersection observer ── */
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

useEffect(() => {
  const hero = document.querySelector(".lp-hero");
  const handleScroll = () => {
    hero.classList.toggle("scrolled", window.scrollY > 50);  
  };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const openCalendly = () => {
    if (window.Calendly)
      window.Calendly.initPopupWidget({
        url: "https://calendly.com/gabriel-solidflo/30min?background_color=1a2340&text_color=ffffff&primary_color=e8442a",
      });
  };

  /* ── Data ── */
  const features = [
    {
      icon: <Zap size={20} />,
      iconBg: "#fef3c7",
      iconColor: "#b45309",
      title: "Lightning Fast",
      desc: "Create and send invoices in seconds with our streamlined workflow.",
    },
    {
      icon: <Shield size={20} />,
      iconBg: "#dbeafe",
      iconColor: "#1d4ed8",
      title: "Bank-Level Security",
      desc: "Your data is protected with 256-bit SSL encryption and regular audits.",
    },
    {
      icon: <TrendingUp size={20} />,
      iconBg: "#dcfce7",
      iconColor: "#15803d",
      title: "Grow Your Revenue",
      desc: "Get paid 2× faster with automated reminders and online payment links.",
    },
    {
      icon: <Clock size={20} />,
      iconBg: "#f3e8ff",
      iconColor: "#7e22ce",
      title: "Save Time",
      desc: "Automate recurring invoices and cut admin work by up to 70%.",
    },
    {
      icon: <Users size={20} />,
      iconBg: "#cffafe",
      iconColor: "#0e7490",
      title: "Team Collaboration",
      desc: "Role-based access and real-time updates for your whole team.",
    },
    {
      icon: <CheckCircle size={20} />,
      iconBg: "#ffe4e6",
      iconColor: "#be123c",
      title: "Smart Tracking",
      desc: "Never lose track of payments — intelligent status notifications keep you informed.",
    },
  ];

  const stats = [
    { value: "Real-time", label: "Sync", icon: <Zap size={18} /> },
    { value: "256-bit", label: "Encryption", icon: <Lock size={18} /> },
    { value: "99.9%", label: "Uptime SLA", icon: <Shield size={18} /> },
    { value: "API", label: "First", icon: <Code size={18} /> },
  ];

  const testimonials = [
    {
      name: "Mark Moyo",
      role: "Electrician",
      rating: 5,
      text: "Since using the stamp and signature feature, my invoices look far more professional. Clients take them seriously and I get paid without the back-and-forth.",
      image: "https://i.pravatar.cc/150?u=markmoyo",
    },
    {
      name: "Gregquinn Lee",
      role: "Founder, Reelancestry Streaming",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Gracious",
      rating: 5,
      text: "The automated recurring billing feature has been a game-changer for our subscription business. Our cash flow has never been better.",
    },
    {
      name: "Donald Potts",
      role: "Owner, Gerbo AI Call Answering AI",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Donald",
      rating: 5,
      text: "Best invoicing software we've used. Simple, powerful, and the support team is incredibly responsive.",
    },
  ];

  const pricingPlans = [
    {
      name: "Starter",
      usdPrice: 0,
      period: "Forever Free",
      desc: "Perfect for freelancers and solo entrepreneurs",
      popular: false,
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
      desc: "Ideal for growing businesses",
      popular: true,
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
      desc: "For large teams and businesses",
      popular: false,
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

  const faqs = [
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

        {/* Open Graph */}
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

        {/* Twitter */}
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

        {/* Structured data: organization + software */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "SolidFlo",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            url: "https://solidflo.co.za/",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: "4.9",
              ratingCount: "10000",
            },
          })}
        </script>

        {/* Structured data: FAQ (matches your on-page FAQ section) */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((f) => ({
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
        {/* Progress bar */}
        <div className="lp-progress" style={{ width: `${scrollPct}%` }} />

        {/* ── Nav ── */}
        <nav className={`lp-nav${scrolled ? " scrolled" : ""}`}>
          <div className="lp-nav-inner">
            <img src={logo} alt="SolidFlo" style={{ height: 44 }} />
            <div className="lp-nav-links">
              <a href="#features">Features</a>
              <a href="#pricing">Pricing</a>
              <a href="#testimonials">Testimonials</a>
              <a href="#faq">FAQ</a>
            </div>
            <div className="lp-nav-ctas">
              <button className="lp-btn-ghost" onClick={() => open("login")}>
                Login
              </button>

              <button
                className="lp-btn-primary"
                onClick={() => open("register")}
              >
                Start Free <ArrowRight size={13} />
              </button>
            </div>

            <button
              className="lp-hamburger"
              onClick={() => setMobileOpen(true)}
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
          >
            <X size={20} />
          </button>
          <div className="lp-drawer-links">
            {["features", "pricing", "testimonials", "faq"].map((s) => (
              <a
                key={s}
                href={`#${s}`}
                onClick={() => setMobileOpen(false)}
                style={{ textTransform: "capitalize" }}
              >
                {s}
              </a>
            ))}
          </div>
          <div className="lp-drawer-ctas">
            <button className="lp-btn-ghost" onClick={() => open("login")}>
              Login
            </button>

            <button className="lp-btn-primary" onClick={() => open("register")}>
              Start Free
            </button>
          </div>
        </div>

        {/* ── Hero ── */}
        <section className="lp-hero">
          {/* Video background if you added it */}
          <video
            autoPlay
            muted
            loop
            playsInline
            className="lp-hero-video"
            src={heroBg}
          />
          <div className="lp-hero-video-overlay" />

          <div className="lp-hero-inner">
            {/* LEFT — text */}
            <div className="lp-hero-left">
              <div className="lp-hero-badge">
                <div className="lp-hero-badge-avatars">
                  <img src="https://i.pravatar.cc/60?img=1" alt="" />
                  <img src="https://i.pravatar.cc/60?img=2" alt="" />
                  <img src="https://i.pravatar.cc/60?img=3" alt="" />
                </div>
                <span className="lp-hero-badge-count">Plus 10k</span>
                <span className="lp-hero-badge-text">26 industries</span>
              </div>

              <h1>
                Business Management
                <br />
                Made <em key={currentWord}>{ROTATING[currentWord].word}</em>
              </h1>

              <p className="lp-hero-sub">{ROTATING[currentWord].sub}</p>

              <div className="lp-hero-ctas">
                <button
                  className="lp-btn-primary"
                  onClick={() => open("register")}
                >
                  Start Free Trial <ArrowRight size={15} />
                </button>
                <button className="lp-hero-secondary" onClick={openCalendly}>
                  <Play size={14} /> Book a Demo
                </button>
              </div>

              <div className="lp-hero-trust">
                {[
                  "No credit card required",
                  "30-day free trial",
                  "Cancel anytime",
                ].map((t) => (
                  <div key={t} className="lp-hero-trust-item">
                    <CheckCircle size={13} /> {t}
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 32 }}>
                <TimelineNavigation variant="inline" />
              </div>
            </div>

            {/* RIGHT — orb visual */}
            <div className="lp-hero-right">
              <HeroInvoiceOverlay />
            </div>
          </div>
        </section>

        {/* ── Stats ── */}
        <section className="lp-stats">
          <div className="lp-stats-inner">
            {stats.map((s, i) => (
              <div
                key={i}
                id={`stat-${i}`}
                data-anim
                className={`lp-stat${visible[`stat-${i}`] ? " visible" : ""}`}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className="lp-stat-icon">{s.icon}</div>
                <div className="lp-stat-value">{s.value}</div>
                <div className="lp-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </section>
        {/* ── Analytics / Charts ── */}
        <section className="lp-analytics">
          <div className="lp-analytics-inner">
            <div className="lp-section-head">
              <div className="lp-section-eyebrow">Platform Analytics</div>
              <h2>Numbers that speak for themselves</h2>
              <p>
                Real growth, real revenue — updated monthly across 10,000+
                businesses.
              </p>
            </div>

            {/* Metric cards */}
            <div className="lp-analytics-metrics">
              {[
                {
                  label: "Monthly Revenue",
                  value: "$548K",
                  delta: "↑ 18% vs last month",
                },
                {
                  label: "Active Businesses",
                  value: "10,240",
                  delta: "↑ 9% vs last month",
                },
                {
                  label: "Invoices Sent",
                  value: "84,300",
                  delta: "↑ 22% vs last month",
                },
                {
                  label: "Avg. Payment Time",
                  value: "3.1 days",
                  delta: "↓ 40% faster",
                },
              ].map((m, i) => (
                <div key={i} className="lp-analytics-metric">
                  <div className="lp-analytics-metric-label">{m.label}</div>
                  <div className="lp-analytics-metric-value">{m.value}</div>
                  <div className="lp-analytics-metric-delta">{m.delta}</div>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div className="lp-analytics-charts">
              <div className="lp-analytics-chart-card">
                <div className="lp-analytics-chart-title">
                  Monthly Revenue Processed
                </div>
                <div className="lp-analytics-chart-sub">
                  Jan – Jun 2025 (USD thousands)
                </div>
                <div className="lp-analytics-legend">
                  <span>
                    <span
                      className="lp-analytics-legend-dot"
                      style={{ background: "#6366f1" }}
                    />
                    Revenue
                  </span>
                  <span>
                    <span
                      className="lp-analytics-legend-dot"
                      style={{
                        background: "#a5b4fc",
                        border: "1px dashed #6366f1",
                      }}
                    />
                    Target
                  </span>
                </div>
                <div style={{ position: "relative", height: 200 }}>
                  <canvas id="sfRevenueChart" />
                </div>
              </div>

              <div className="lp-analytics-chart-card">
                <div className="lp-analytics-chart-title">
                  Users by Industry
                </div>
                <div className="lp-analytics-chart-sub">
                  Share of active accounts
                </div>
                <div className="lp-analytics-legend">
                  {[
                    { label: "Construction 28%", color: "#6366f1" },
                    { label: "Electrical 22%", color: "#10b981" },
                    { label: "Healthcare 19%", color: "#f59e0b" },
                    { label: "Plumbing 16%", color: "#3b82f6" },
                    { label: "Other 15%", color: "#ec4899" },
                  ].map((l) => (
                    <span key={l.label}>
                      <span
                        className="lp-analytics-legend-dot"
                        style={{ background: l.color }}
                      />
                      {l.label}
                    </span>
                  ))}
                </div>
                <div style={{ position: "relative", height: 200 }}>
                  <canvas id="sfIndustryChart" />
                </div>
              </div>

              <div className="lp-analytics-chart-card full">
                <div className="lp-analytics-chart-title">
                  Payment Speed Improvement
                </div>
                <div className="lp-analytics-chart-sub">
                  Average days to payment — before vs. after SolidFlo
                </div>
                <div className="lp-analytics-legend">
                  <span>
                    <span
                      className="lp-analytics-legend-dot"
                      style={{
                        background: "#e2e8f0",
                        border: "1px solid #cbd5e1",
                      }}
                    />
                    Before
                  </span>
                  <span>
                    <span
                      className="lp-analytics-legend-dot"
                      style={{ background: "#6366f1" }}
                    />
                    After SolidFlo
                  </span>
                </div>
                <div style={{ position: "relative", height: 180 }}>
                  <canvas id="sfSpeedChart" />
                </div>
              </div>
            </div>

            {/* Funnel */}
            <div className="lp-analytics-chart-card" style={{ marginTop: 20 }}>
              <div className="lp-analytics-chart-title">
                Invoice Conversion Funnel
              </div>
              <div className="lp-analytics-chart-sub">
                From draft to collected — platform average across all users
              </div>
              <div style={{ marginTop: 16 }}>
                {[
                  { label: "Invoice sent", pct: 100, color: "#6366f1" },
                  { label: "Opened", pct: 82, color: "#818cf8" },
                  { label: "Clicked pay", pct: 61, color: "#10b981" },
                  { label: "Paid on time", pct: 74, color: "#34d399" },
                  { label: "Collected", pct: 97, color: "#059669" },
                ].map((row) => (
                  <div key={row.label} className="lp-funnel-row">
                    <div className="lp-funnel-label">{row.label}</div>
                    <div className="lp-funnel-bar-wrap">
                      <div
                        className="lp-funnel-bar"
                        style={{ width: `${row.pct}%`, background: row.color }}
                      >
                        <span className="lp-funnel-val">{row.pct}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        {/* ── Features ── */}
        <section id="features" className="lp-features">
          <div className="lp-section-head">
            <div className="lp-section-eyebrow">Features</div>
            <h2>Everything you need to succeed</h2>
            <p>
              Powerful tools designed to streamline your billing and help you
              get paid faster.
            </p>
          </div>
          <div className="lp-features-grid">
            {features.map((f, i) => (
              <div
                key={i}
                id={`feat-${i}`}
                data-anim
                className={`lp-feature-card${visible[`feat-${i}`] ? " visible" : ""}`}
                style={{ transitionDelay: `${i * 60}ms` }}
              >
                <div className="lp-feature-bar" />
                <div
                  className="lp-feature-icon"
                  style={{ background: f.iconBg }}
                >
                  {React.cloneElement(f.icon, { color: f.iconColor })}
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
        {/* ── Services / Marketplace ── */}
        <section className="lp-services">
          <div className="lp-services-inner">
            <div className="lp-section-head">
              <div className="lp-section-eyebrow">Marketplace</div>
              <h2>Verified providers, every industry</h2>
              <p>
                Browse and book trusted service providers across Gauteng — or
                list your own business and start getting clients today.
              </p>
            </div>

            <div className="lp-services-grid">
              {[
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
              ].map((ind, i) => (
                <div
                  key={ind.title}
                  id={`svc-${i}`}
                  data-anim
                  className={`lp-services-card${visible[`svc-${i}`] ? " visible" : ""}`}
                  style={{ transitionDelay: `${i * 60}ms` }}
                  onClick={() =>
                    window.open(
                      "https://market.solidflo.co.za",
                      "_blank",
                      "noopener,noreferrer",
                    )
                  }
                >
                  <span className="lp-services-card-emoji">{ind.emoji}</span>
                  <div className="lp-services-card-title">{ind.title}</div>
                  <div className="lp-services-card-desc">{ind.desc}</div>
                  <span className="lp-services-card-count">
                    <span className="lp-services-card-count-dot" />
                    {ind.count} provider{ind.count !== 1 ? "s" : ""} listed
                  </span>
                </div>
              ))}
            </div>

            {/* CTA bar */}
            <div className="lp-services-cta-row">
              <div className="lp-services-cta-left">
                <h3>26 industries. One marketplace.</h3>
                <p>
                  Need a provider? Post a job and get quotes. Have a skill? List
                  your business free and start winning clients.
                </p>
              </div>
              <div className="lp-services-cta-btns">
                <button
                  className="lp-services-btn-primary"
                  onClick={() =>
                    window.open(
                      "https://market.solidflo.co.za",
                      "_blank",
                      "noopener,noreferrer",
                    )
                  }
                >
                  Browse Marketplace <ArrowRight size={14} />
                </button>
                <button
                  className="lp-services-btn-ghost"
                  onClick={() => open("register")}
                >
                  List My Business
                </button>
              </div>
            </div>
          </div>
        </section>
        {/* ── Globe ── */}
        <section
          className="lp-globe"
          style={{ position: "relative", overflow: "hidden" }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src={globe}
              alt="Global presence"
              style={{
                width: "70%",
                height: "70%",
                objectFit: "cover",
                opacity: 0.18,
                maskImage:
                  "radial-gradient(ellipse 70% 70% at 50% 50%, black 20%, transparent 80%)",
                WebkitMaskImage:
                  "radial-gradient(ellipse 70% 70% at 50% 50%, black 20%, transparent 80%)",
              }}
            />
          </div>
          <div
            className="lp-section-eyebrow"
            style={{
              background: "rgba(232,68,42,.15)",
              borderColor: "rgba(232,68,42,.3)",
              color: "#ff9a85",
            }}
          >
            Global Reach
          </div>
          <h2>
            Trusted <em>Globally</em>
          </h2>
          <p>
            Join thousands of businesses across 50+ countries using SolidFlo.
          </p>
        </section>

        {/* ── Pricing ── */}
        <section id="pricing" className="lp-pricing">
          <div className="lp-section-head">
            <div className="lp-section-eyebrow">Pricing</div>
            <h2>Simple, transparent pricing</h2>
            <p>
              Choose the plan that's right for you. All plans include a 14-day
              free trial.
            </p>
            {!currencyLoading && (
              <div className="lp-currency-badge">
                🌍 Prices shown in{" "}
                <strong style={{ marginLeft: 4 }}>{currencyCode}</strong>
                {countryName ? ` · ${countryName}` : ""}
              </div>
            )}
          </div>
          <div className="lp-pricing-grid">
            {pricingPlans.map((plan, i) => (
              <div
                key={i}
                id={`plan-${i}`}
                data-anim
                className={`lp-plan${plan.popular ? " popular" : ""}${visible[`plan-${i}`] ? " visible" : ""}`}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                {plan.popular && (
                  <div className="lp-plan-badge">Most Popular</div>
                )}
                <div className="lp-plan-name">{plan.name}</div>
                <div className="lp-plan-price">
                  {currencyLoading ? (
                    <span className="lp-price-skeleton" />
                  ) : (
                    localPrice(plan.usdPrice)
                  )}
                </div>
                {!currencyLoading && plan.usdPrice > 0 && (
                  <>
                    <div className="lp-plan-period">/ {plan.period}</div>
                    {currencyCode !== "USD" && (
                      <div className="lp-plan-usd">
                        ≈ ${plan.usdPrice} USD / {plan.period}
                      </div>
                    )}
                  </>
                )}
                <div className="lp-plan-desc">{plan.desc}</div>
                <ul className="lp-plan-features">
                  {plan.features.map((f, fi) => (
                    <li key={fi} className="lp-plan-feature">
                      <CheckCircle
                        size={14}
                        color={plan.popular ? "#4ade80" : "#1d8348"}
                      />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  className={`lp-plan-cta ${plan.popular ? "lp-plan-cta-popular" : "lp-plan-cta-default"}`}
                  onClick={() => navigate("/register")}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* ── Testimonials ── */}
        <section id="testimonials" className="lp-testimonials">
          <div className="lp-section-head">
            <div
              className="lp-section-eyebrow"
              style={{
                background: "rgba(232,68,42,.15)",
                borderColor: "rgba(232,68,42,.3)",
                color: "#ff9a85",
              }}
            >
              Testimonials
            </div>
            <h2>Loved by thousands of businesses</h2>
            <p style={{ color: "rgba(253,246,236,.5)" }}>
              See what our customers have to say about SolidFlo.
            </p>
          </div>
          <div className="lp-testimonials-grid">
            {testimonials.map((t, i) => (
              <div
                key={i}
                id={`test-${i}`}
                data-anim
                className={`lp-testimonial${visible[`test-${i}`] ? " visible" : ""}`}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className="lp-testimonial-stars">
                  {[...Array(t.rating)].map((_, si) => (
                    <Star key={si} size={14} fill="#fb923c" />
                  ))}
                </div>
                <p className="lp-testimonial-text">"{t.text}"</p>
                <div className="lp-testimonial-author">
                  <img
                    src={t.image}
                    alt={t.name}
                    className="lp-testimonial-avatar"
                  />
                  <div>
                    <div className="lp-testimonial-name">{t.name}</div>
                    <div className="lp-testimonial-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── FAQ ── */}
        <section id="faq" className="lp-faq">
          <div className="lp-section-head">
            <div className="lp-section-eyebrow">FAQ</div>
            <h2>Frequently asked questions</h2>
            <p>Everything you need to know about SolidFlo.</p>
          </div>
          <div className="lp-faq-list">
            {faqs.map((f, i) => (
              <div
                key={i}
                id={`faq-${i}`}
                data-anim
                className={`lp-faq-item${visible[`faq-${i}`] ? " visible" : ""}`}
                style={{ transitionDelay: `${i * 50}ms` }}
              >
                <div className="lp-faq-q">
                  <ChevronRight size={15} /> {f.q}
                </div>
                <div className="lp-faq-a">{f.a}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="lp-cta">
          <h2>Ready to transform your billing?</h2>
          <p>
            Join 10,000+ businesses already using SolidFlo. Start your 14-day
            free trial today.
          </p>
          <div className="lp-cta-btns">
            <button
              className="lp-cta-primary"
              onClick={() => navigate("/register")}
            >
              Start Free Trial <ArrowRight size={15} />
            </button>
            <button className="lp-cta-secondary" onClick={openCalendly}>
              Schedule a Demo
            </button>
          </div>
          <p className="lp-cta-footnote">
            No credit card required &nbsp; 14-day free trial &nbsp; Cancel
            anytime
          </p>
        </section>
        <section className="kraal-section">
          <div className="section-inner">
            <div className="hero-app">
              <h1 className="section-eyebrow light">
                Download the Solidflo app
              </h1>
              <img src={google} alt="" />
            </div>
          </div>
        </section>
</div>
        {/* ── Footer ── */}
        <footer className="lp-footer">
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
                    <img src={s.icon} alt={s.alt} />
                  </a>
                ))}
              </div>
            </div>
            <div>
              <div className="lp-footer-col-title">Product</div>
              <ul className="lp-footer-links">
                {[
                  "Features",
                  "Pricing",
                  "Integrations",
                  "API Docs",
                  "Updates",
                ].map((l) => (
                  <li key={l}>
                    <a href="#">{l}</a>
                  </li>
                ))}
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
                    <span onClick={() => navigate(p)}>{l}</span>
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
                    <span onClick={() => navigate(p)}>{l}</span>
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
       
      </div>
      {/* Bottom Nav */}
      <nav className="lp-bottom-nav">
        {[
          {
            id: "home",
            label: "Home",
            icon: (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
            ),
            action: () => window.scrollTo({ top: 0, behavior: "smooth" }),
          },
          {
            id: "features",
            label: "Features",
            icon: (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            ),
            action: () => scrollTo("features"),
          },
          {
            id: "market",
            label: "Market",
            icon: (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6M17 13l1.5 6M9 19h6"
                />
              </svg>
            ),
            action: () => scrollTo("pricing"),
          },
          {
            id: "faq",
            label: "FAQ",
            icon: (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            ),
            action: () => scrollTo("faq"),
          },
          {
            id: "start",
            label: "Start",
            icon: (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            ),
            action: () => open("register"),
          },
        ].map((tab) => (
          <button
            key={tab.id}
            className={`lp-bottom-tab${activeTab === tab.id ? " active" : ""}`}
            onClick={() => {
              setActiveTab(tab.id);
              tab.action();
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </nav>
    </>
  );
};

export default LandingPage;
