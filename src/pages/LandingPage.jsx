import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import VapiAssistant from "./VapiAssistant";
import ChatAssistant from "../components/ChatAssistant";
import TimelineNavigation from "./TimelineNavigation";
import { Helmet } from "react-helmet";
import {
  Zap,
  Shield,
  TrendingUp,
  Clock,
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
import greylogo from "../assets/images/grey-logo.png";
import computer from "../assets/images/new_solidflo_bg_transp_text.png";

// ─────────────────────────────────────────────────────────────────────────────
// CURRENCY UTILITIES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetches the visitor's country + currency from ipapi.co (free, no key needed).
 * Falls back to USD if the request fails.
 */
const fetchGeoInfo = async () => {
  try {
    const res = await fetch("https://ipapi.co/json/");
    if (!res.ok) throw new Error("geo fetch failed");
    const data = await res.json();
    return {
      currencyCode: data.currency || "USD",
      countryName: data.country_name || "Unknown",
    };
  } catch {
    return { currencyCode: "USD", countryName: "Unknown" };
  }
};

/**
 * Fetches the live USD → targetCurrency exchange rate from Frankfurter (free, no key).
 * Falls back to 1 (i.e. USD) on error.
 */
const fetchExchangeRate = async (targetCurrency) => {
  if (targetCurrency === "USD") return 1;
  try {
    const res = await fetch(
      `https://api.frankfurter.app/latest?from=USD&to=${targetCurrency}`,
    );
    if (!res.ok) throw new Error("rate fetch failed");
    const data = await res.json();
    return data.rates?.[targetCurrency] ?? 1;
  } catch {
    return 1;
  }
};

/**
 * Formats a USD price into the visitor's local currency.
 *
 * @param {number}  usdPrice       – base price in US dollars
 * @param {number}  rate           – exchange rate from USD → local currency
 * @param {string}  currencyCode   – ISO 4217 code, e.g. "ZAR", "EUR", "GBP"
 * @returns {string}               – formatted string, e.g. "R 347" or "€ 17"
 */
const formatPrice = (usdPrice, rate, currencyCode) => {
  const converted = usdPrice * rate;

  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: 0,
    }).format(converted);
  } catch {
    // Fallback if Intl doesn't know the currency code
    return `${currencyCode} ${Math.round(converted)}`;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// HOOK: useCurrency
// ─────────────────────────────────────────────────────────────────────────────
const useCurrency = () => {
  const [currencyCode, setCurrencyCode] = useState("USD");
  const [exchangeRate, setExchangeRate] = useState(1);
  const [countryName, setCountryName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const { currencyCode: code, countryName: country } = await fetchGeoInfo();
      const rate = await fetchExchangeRate(code);

      if (!cancelled) {
        setCurrencyCode(code);
        setExchangeRate(rate);
        setCountryName(country);
        setLoading(false);
      }
    };

    init();
    return () => {
      cancelled = true;
    };
  }, []);

  return { currencyCode, exchangeRate, countryName, loading };
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

const LandingPage = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  // ── Currency state ──────────────────────────────────────────────────────────
  const {
    currencyCode,
    exchangeRate,
    countryName,
    loading: currencyLoading,
  } = useCurrency();

  /**
   * Converts a USD price to a localised string.
   * While rates are loading we show a neutral "—" placeholder.
   */
  const localPrice = (usdPrice) => {
    if (currencyLoading) return "—";
    if (usdPrice === 0) return formatPrice(0, exchangeRate, currencyCode);
    return formatPrice(usdPrice, exchangeRate, currencyCode);
  };

  // ── Calendly ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://assets.calendly.com/assets/external/widget.css";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    const style = document.createElement("style");
    style.textContent = `
      .calendly-badge-widget {
        bottom: 40px !important;
        left: 20px !important;
      }
    `;
    document.head.appendChild(style);

    const script = document.createElement("script");
    script.src = "https://assets.calendly.com/assets/external/widget.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.head.contains(link)) document.head.removeChild(link);
      if (document.head.contains(style)) document.head.removeChild(style);
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, []);

  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentWord, setCurrentWord] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState({});

  const words = ["Smarter", "Faster", "Better"];
  const slides = [
    {
      id: 1,
      src: require("../assets/images/product1.png"),
      alt: "Dashboard",
      title: "Intuitive Dashboard",
    },
    {
      id: 2,
      src: require("../assets/images/product2.png"),
      alt: "Professional Invoices",
      title: "Professional Invoices",
    },
    {
      id: 3,
      src: require("../assets/images/product3.png"),
      alt: "Payment Processing",
      title: "Seamless Payments",
    },
  ];

  // Animated word rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % words.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Vapi widget
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
        widget.setAttribute("base-bg-color", "#000000");
        widget.setAttribute("accent-color", "#de5a02");
        widget.setAttribute("cta-button-color", "#000000");
        widget.setAttribute("cta-button-text-color", "#ffffff");
        widget.setAttribute("border-radius", "large");
        widget.setAttribute("size", "full");
        widget.setAttribute("position", "bottom-right");
        widget.setAttribute("title", "TALK WITH AARON");
        widget.setAttribute("start-button-text", "Start");
        widget.setAttribute("end-button-text", "End Call");
        widget.setAttribute("cta-subtitle", "Need help?");
        widget.setAttribute(
          "chat-first-message",
          "Hey, How can I help you today?",
        );
        widget.setAttribute("chat-placeholder", "Type your message...");
        widget.setAttribute("voice-show-transcript", "true");
        widget.setAttribute("consent-required", "false");
        container.appendChild(widget);
      }
    };

    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, []);

  // Slide rotation
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(slideInterval);
  }, [slides.length]);

  // Scroll tracking
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const maxScroll = documentHeight - windowHeight;
      const progress = Math.min(scrollPosition / maxScroll, 1);
      setScrollY(scrollPosition);
      setScrollProgress(progress);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1 },
    );
    document.querySelectorAll("[data-animate]").forEach((el) => {
      observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    document.body.style.overflow = !mobileMenuOpen ? "hidden" : "";
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    document.body.style.overflow = "";
  };

  const handleLogin = () => navigate("/login");
  const handleSignup = () => navigate("/register");

  const getScrollGradient = () => {
    const progress = Math.min(scrollY / 1000, 1);
    const gradients = [
      {
        from: "rgb(248, 250, 252)",
        via: "rgb(253, 160, 74)",
        to: "rgb(247, 151, 62)",
      },
      {
        from: "rgb(254, 243, 199)",
        via: "rgb(255, 237, 213)",
        to: "rgb(219, 234, 254)",
      },
      {
        from: "rgb(255, 237, 213)",
        via: "rgb(254, 215, 170)",
        to: "rgb(191, 219, 254)",
      },
    ];

    const interpolateColor = (color1, color2, factor) => {
      const rgb1 = color1.match(/\d+/g).map(Number);
      const rgb2 = color2.match(/\d+/g).map(Number);
      const result = rgb1.map((channel, i) =>
        Math.round(channel + factor * (rgb2[i] - channel)),
      );
      return `rgb(${result[0]}, ${result[1]}, ${result[2]})`;
    };

    const interpolateGradient = (grad1, grad2, factor) => ({
      from: interpolateColor(grad1.from, grad2.from, factor),
      via: interpolateColor(grad1.via, grad2.via, factor),
      to: interpolateColor(grad1.to, grad2.to, factor),
    });

    let currentGradient;
    if (progress < 0.5) {
      currentGradient = interpolateGradient(
        gradients[0],
        gradients[1],
        progress * 2,
      );
    } else {
      currentGradient = interpolateGradient(
        gradients[1],
        gradients[2],
        (progress - 0.5) * 2,
      );
    }

    return `linear-gradient(135deg, ${currentGradient.from} 0%, ${currentGradient.via} 50%, ${currentGradient.to} 100%)`;
  };

  const features = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Lightning Fast",
      description:
        "Create and send invoices in seconds with our streamlined workflow. No more tedious data entry.",
      color: "from-yellow-400 to-orange-500",
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Bank-Level Security",
      description:
        "Your data is protected with 256-bit SSL encryption and regular security audits.",
      color: "from-blue-400 to-indigo-500",
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Grow Your Revenue",
      description:
        "Get paid 2x faster with automated reminders and online payment integration.",
      color: "from-green-400 to-emerald-500",
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Save Time",
      description:
        "Automate recurring invoices and reduce administrative work by up to 70%.",
      color: "from-purple-400 to-pink-500",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Team Collaboration",
      description:
        "Work seamlessly with your team with role-based access and real-time updates.",
      color: "from-cyan-400 to-blue-500",
    },
    {
      icon: <CheckCircle className="w-8 h-8" />,
      title: "Smart Tracking",
      description:
        "Never lose track of payments with intelligent status tracking and notifications.",
      color: "from-red-400 to-rose-500",
    },
  ];

  const stats = [
    {
      value: "10K+",
      label: "Active Users",
      icon: <Users className="w-6 h-6" />,
    },
    {
      value: "$5k+",
      label: "Processed Monthly",
      icon: <TrendingUp className="w-6 h-6" />,
    },
    { value: "99.9%", label: "Uptime", icon: <Shield className="w-6 h-6" /> },
    { value: "24/7", label: "Support", icon: <Clock className="w-6 h-6" /> },
  ];

  const testimonials = [
    {
      name: "Thomas Dube",
      role: "CEO, Afromind Capital",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Thomas",
      rating: 5,
      text: "SolidFlo has completely transformed how we handle invoicing. We've cut our billing time by 70% and get paid 2x faster. The automation features are incredible!",
    },
    {
      name: "Gracious Ncube",
      role: "Founder, Anantara Skincare",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Gracious",
      rating: 5,
      text: "The automated recurring billing feature has been a game-changer for our subscription business. Our cash flow has never been better. Highly recommend!",
    },
    {
      name: "Gabriel Moyo",
      role: "Owner, Gerbospeaks AI",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Gabriel",
      rating: 5,
      text: "Best invoicing software we've used. Simple, powerful, and the support team is incredibly responsive. It's like having a billing department in your pocket.",
    },
  ];

  // ── Pricing plans – prices stored in USD, displayed in local currency ───────
  const pricingPlans = [
    {
      name: "Starter",
      usdPrice: 0,
      period: "Forever Free",
      description: "Perfect for freelancers and solo entrepreneurs",
      features: [
        "Up to 5 clients",
        "Unlimited invoices",
        "Basic reports",
        "Email support",
        "Mobile app access",
      ],
      cta: "Get Started Free",
      popular: false,
    },
    {
      name: "Professional",
      usdPrice: 6,
      period: "per month",
      description: "Ideal for growing businesses",
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
      popular: true,
    },
    {
      name: "Enterprise",
      usdPrice: 25,
      period: "per month",
      description: "For large teams and businesses",
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
      popular: false,
    },
  ];

  return (
    <>
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <style jsx>{`
          @import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap");

          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family:
              "Inter",
              -apple-system,
              BlinkMacSystemFont,
              "Segoe UI",
              sans-serif;
          }

          html {
            scroll-behavior: smooth;
          }

          ::-webkit-scrollbar {
            width: 10px;
          }
          ::-webkit-scrollbar-track {
            background: #f1f1f1;
          }
          ::-webkit-scrollbar-thumb {
            background: linear-gradient(180deg, #ff9d00, #e68a00);
            border-radius: 10px;
          }

          .gradient-text {
            background: linear-gradient(135deg, #fb470b 0%, #000000 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          .glass {
            background: rgba(255, 255, 255, 0.7);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.3);
          }

          @keyframes float {
            0%,
            100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-20px);
            }
          }
          .float-animation {
            animation: float 6s ease-in-out infinite;
          }

          @keyframes slideInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes slideInLeft {
            from {
              opacity: 0;
              transform: translateX(-30px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          @keyframes slideInRight {
            from {
              opacity: 0;
              transform: translateX(30px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
          @keyframes scaleIn {
            from {
              opacity: 0;
              transform: scale(0.9);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
          @keyframes shimmer {
            0% {
              opacity: 0.4;
            }
            50% {
              opacity: 0.9;
            }
            100% {
              opacity: 0.4;
            }
          }

          .animate-slide-up {
            animation: slideInUp 0.6s ease-out forwards;
          }
          .animate-slide-left {
            animation: slideInLeft 0.6s ease-out forwards;
          }
          .animate-slide-right {
            animation: slideInRight 0.6s ease-out forwards;
          }
          .animate-fade-in {
            animation: fadeIn 0.8s ease-out forwards;
          }
          .animate-scale-in {
            animation: scaleIn 0.5s ease-out forwards;
          }

          /* Skeleton shimmer for price loading state */
          .price-skeleton {
            display: inline-block;
            width: 80px;
            height: 48px;
            background: linear-gradient(
              90deg,
              #e5e7eb 25%,
              #f3f4f6 50%,
              #e5e7eb 75%
            );
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            border-radius: 8px;
            vertical-align: middle;
          }

          .hover-lift {
            transition:
              transform 0.3s ease,
              box-shadow 0.3s ease;
          }
          .hover-lift:hover {
            transform: translateY(-8px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          }

          .gradient-border {
            position: relative;
            background: white;
          }
          .gradient-border::before {
            content: "";
            position: absolute;
            inset: 0;
            border-radius: inherit;
            padding: 2px;
            background: linear-gradient(135deg, #ff9d00, #e68a00);
            -webkit-mask:
              linear-gradient(#fff 0 0) content-box,
              linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            mask-composite: exclude;
          }

          @keyframes pulse {
            0%,
            100% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
          }
          .animate-pulse {
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }

          .word-rotation {
            display: inline-block;
            animation: slideInUp 0.5s ease-out;
          }

          @media (max-width: 768px) {
            .hero-title {
              font-size: 2.5rem !important;
            }
            .section-title {
              font-size: 2rem !important;
            }
          }

          .dot-pattern {
            background-image: radial-gradient(
              circle,
              #e5e7eb 1px,
              transparent 1px
            );
            background-size: 20px 20px;
          }
          .gradient-overlay {
            background: linear-gradient(
              135deg,
              rgba(255, 157, 0, 0.1) 0%,
              rgba(102, 126, 234, 0.1) 100%
            );
          }
        `}</style>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={closeMobileMenu}
          />
        )}

        {/* Mobile Navigation */}
        <div
          className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 lg:hidden ${
            mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="p-6">
            <button
              onClick={closeMobileMenu}
              className="absolute top-6 right-6 text-gray-600 hover:text-gray-900"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="mt-12 space-y-6">
              <a
                href="#features"
                onClick={closeMobileMenu}
                className="block text-lg font-medium text-gray-700 hover:text-orange-500 transition-colors"
              >
                Features
              </a>
              <a
                href="#pricing"
                onClick={closeMobileMenu}
                className="block text-lg font-medium text-gray-700 hover:text-orange-500 transition-colors"
              >
                Pricing
              </a>
              <a
                href="#testimonials"
                onClick={closeMobileMenu}
                className="block text-lg font-medium text-gray-700 hover:text-orange-500 transition-colors"
              >
                Testimonials
              </a>
              <a
                href="#faq"
                onClick={closeMobileMenu}
                className="block text-lg font-medium text-gray-700 hover:text-orange-500 transition-colors"
              >
                FAQ
              </a>
              <div className="pt-6 space-y-3">
                <button
                  onClick={() => {
                    closeMobileMenu();
                    handleLogin();
                  }}
                  className="w-full py-3 px-6 border-2 border-orange-500 text-orange-500 rounded-lg font-semibold hover:bg-orange-50 transition-all"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    closeMobileMenu();
                    handleSignup();
                  }}
                  className="w-full py-3 px-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
                >
                  Start Free Trial
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Header */}
        <header
          className={`fixed top-0 left-0 right-0 z-30 transition-all duration-300 ${scrollY > 50 ? "glass shadow-lg" : "bg-transparent"}`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <div className="flex items-center">
                <img src={logo} alt="SolidFlo" className="h-16 w-auto" />
              </div>
              <nav className="hidden lg:flex items-center space-x-8">
                <a
                  href="#features"
                  className="text-gray-700 hover:text-orange-500 font-medium transition-colors"
                >
                  Features
                </a>
                <a
                  href="#pricing"
                  className="text-gray-700 hover:text-orange-500 font-medium transition-colors"
                >
                  Pricing
                </a>
                <a
                  href="#testimonials"
                  className="text-gray-700 hover:text-orange-500 font-medium transition-colors"
                >
                  Testimonials
                </a>
                <a
                  href="#faq"
                  className="text-gray-700 hover:text-orange-500 font-medium transition-colors"
                >
                  FAQ
                </a>
              </nav>
              <div className="hidden lg:flex items-center space-x-4">
                <button
                  onClick={handleLogin}
                  className="px-6 py-2.5 text-gray-700 font-semibold hover:text-orange-500 transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={handleSignup}
                  className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all flex items-center gap-2"
                >
                  Start Free Trial <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden text-gray-700 hover:text-orange-500"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section
          className="relative min-h-screen pt-[380px] pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden transition-all duration-500"
          style={{ background: getScrollGradient() }}
        >
          <div className="absolute inset-0 dot-pattern opacity-50" />
          <div className="absolute top-20 right-0 w-96 h-96 bg-orange-200 rounded-full filter blur-3xl opacity-20 animate-pulse" />
          <div
            className="absolute bottom-0 left-0 w-96 h-96 bg-blue-200 rounded-full filter blur-3xl opacity-20 animate-pulse"
            style={{ animationDelay: "1s" }}
          />

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center max-w-4xl mx-auto">
              <img
                src={logo}
                alt="SolidFlo"
                className="w-14 md:w-8 lg:w-24 h-auto mx-auto block mb-4"
              />

              <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 rounded-full mb-8 animate-slide-up">
                <Sparkles className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-semibold text-orange-600">
                  Trusted by 10,000+ businesses worldwide
                </span>
              </div>

              <h1
                className="hero-title text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-gray-900 animate-slide-up"
                style={{ animationDelay: "0.1s" }}
              >
                Invoicing Made{" "}
                <span className="word-rotation gradient-text" key={currentWord}>
                  {words[currentWord]}
                </span>
              </h1>

              <p
                className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed animate-slide-up"
                style={{ animationDelay: "0.2s" }}
              >
                Create professional invoices, get paid faster, and grow your
                business with the most intuitive invoicing platform
              </p>

              <div
                className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 animate-slide-up"
                style={{ animationDelay: "0.3s" }}
              >
                <button
                  onClick={handleSignup}
                  className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold text-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all flex items-center gap-2 group"
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => {
                    if (window.Calendly) {
                      window.Calendly.initPopupWidget({
                        url: "https://calendly.com/gabriel-solidflo/30min?background_color=2c448c&text_color=ffffff&primary_color=9effbe",
                      });
                    }
                  }}
                  className="px-8 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold text-lg hover:border-orange-500 hover:text-orange-500 transition-all flex items-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  Book a Demo
                </button>
              </div>

              <div
                className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500 animate-fade-in"
                style={{ animationDelay: "0.4s" }}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>30-day free trial</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Cancel anytime</span>
                </div>
              </div>

              <div className="flex justify-center mb-8">
                <TimelineNavigation variant="inline" />
              </div>
            </div>

            {/* Product Screenshot */}
            <div
              className="mt-20 animate-scale-in"
              style={{ animationDelay: "0.5s" }}
            >
              <div className="relative max-w-5xl mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-600 rounded-2xl filter blur-3xl opacity-20 animate-pulse" />
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border-8 border-white float-animation">
                  <div className="relative h-full">
                    <img
                      src={slides[currentSlide].src}
                      alt={slides[currentSlide].alt}
                      className="w-full h-auto transition-opacity duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
                  </div>
                </div>
                <div className="flex justify-center gap-2 mt-6">
                  {slides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`h-2 rounded-full transition-all duration-300 ${index === currentSlide ? "w-8 bg-orange-500" : "w-2 bg-gray-300 hover:bg-gray-400"}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-96 h-96 bg-orange-500 rounded-full filter blur-3xl" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl" />
          </div>
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  id={`stat-${index}`}
                  data-animate
                  className={`text-center ${isVisible[`stat-${index}`] ? "animate-slide-up" : "opacity-0"}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-500/20 rounded-lg mb-4">
                    <div className="text-orange-400">{stat.icon}</div>
                  </div>
                  <div className="text-4xl lg:text-5xl font-bold text-white mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-400 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="section-title text-4xl md:text-5xl font-bold mb-4 text-gray-900">
                Everything you need to{" "}
                <span className="gradient-text">succeed</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Powerful features designed to streamline your billing process
                and help you get paid faster
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  id={`feature-${index}`}
                  data-animate
                  className={`group p-8 bg-white rounded-2xl shadow-lg hover-lift border border-gray-100 ${isVisible[`feature-${index}`] ? "animate-slide-up" : "opacity-0"}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div
                    className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.color} mb-6 text-white`}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-orange-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Globe Section */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-white">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
              Trusted <span className="gradient-text">Globally</span>
            </h2>
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
              Join thousands of businesses across 50+ countries using SolidFlo
            </p>
            <div className="max-w-4xl mx-auto">
              <img
                src={globe}
                alt="Global Presence"
                className="w-full h-auto"
              />
            </div>
          </div>
        </section>

        {/* ── Pricing Section ──────────────────────────────────────────────────── */}
        <section
          id="pricing"
          className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
        >
          <div className="absolute inset-0 dot-pattern opacity-30" />

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
                Simple, <span className="gradient-text">transparent</span>{" "}
                pricing
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Choose the plan that's right for you. All plans include a 14-day
                free trial.
              </p>

              {/* ── Currency badge ── */}
              {!currencyLoading && (
                <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 bg-orange-50 border border-orange-200 rounded-full text-sm text-orange-700 font-medium">
                  <span>🌍</span>
                  <span>
                    Prices shown in <strong>{currencyCode}</strong>
                    {countryName ? ` for ${countryName}` : ""}
                  </span>
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {pricingPlans.map((plan, index) => (
                <div
                  key={index}
                  id={`pricing-${index}`}
                  data-animate
                  className={`relative p-8 bg-white rounded-2xl shadow-xl hover-lift border-2 ${
                    plan.popular
                      ? "border-orange-500 transform scale-105"
                      : "border-gray-200"
                  } ${isVisible[`pricing-${index}`] ? "animate-scale-in" : "opacity-0"}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="inline-block px-4 py-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-semibold rounded-full">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="text-2xl font-bold mb-2 text-gray-900">
                      {plan.name}
                    </h3>
                    <p className="text-gray-600">{plan.description}</p>
                  </div>

                  {/* ── Localised price display ── */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                      {currencyLoading ? (
                        // Shimmer skeleton while rate is loading
                        <span
                          className="price-skeleton"
                          aria-label="Loading price…"
                        />
                      ) : plan.usdPrice === 0 ? (
                        <span className="text-5xl font-bold text-gray-900">
                          Free
                        </span>
                      ) : (
                        <span className="text-4xl font-bold text-gray-900">
                          {localPrice(plan.usdPrice)}
                        </span>
                      )}
                      {plan.usdPrice > 0 && !currencyLoading && (
                        <span className="text-gray-600">/ {plan.period}</span>
                      )}
                    </div>

                    {/* Show USD equivalent as a subtle note for non-USD currencies */}
                    {!currencyLoading &&
                      currencyCode !== "USD" &&
                      plan.usdPrice > 0 && (
                        <p className="text-xs text-gray-400 mt-1">
                          ≈ ${plan.usdPrice} USD / {plan.period}
                        </p>
                      )}
                  </div>

                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={handleSignup}
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${
                      plan.popular
                        ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:shadow-lg transform hover:-translate-y-1"
                        : "border-2 border-gray-300 text-gray-700 hover:border-orange-500 hover:text-orange-500"
                    }`}
                  >
                    {plan.cta}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section
          id="testimonials"
          className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
        >
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
                Loved by thousands of businesses
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                See what our customers have to say about SolidFlo
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  id={`testimonial-${index}`}
                  data-animate
                  className={`p-8 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 hover-lift ${isVisible[`testimonial-${index}`] ? "animate-slide-up" : "opacity-0"}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 fill-orange-400 text-orange-400"
                      />
                    ))}
                  </div>
                  <p className="text-gray-300 mb-6 leading-relaxed italic">
                    "{testimonial.text}"
                  </p>
                  <div className="flex items-center gap-4">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <div className="font-semibold text-white">
                        {testimonial.name}
                      </div>
                      <div className="text-sm text-gray-400">
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
                Frequently asked questions
              </h2>
              <p className="text-xl text-gray-600">
                Everything you need to know about SolidFlo
              </p>
            </div>
            <div className="space-y-4">
              {[
                {
                  q: "Is SolidFlo really free?",
                  a: "Yes! Our Starter plan is completely free forever. You can create unlimited invoices for up to 5 clients with no credit card required.",
                },
                {
                  q: "Can I cancel my subscription anytime?",
                  a: "Absolutely. There are no long-term contracts or cancellation fees. You can upgrade, downgrade, or cancel your subscription at any time from your account settings.",
                },
                {
                  q: "What payment methods do you accept?",
                  a: "We support all major credit cards (Visa, Mastercard, American Express), PayPal, and bank transfers through our integrated payment processors.",
                },
                {
                  q: "Is my data secure?",
                  a: "Security is our top priority. We use bank-level 256-bit SSL encryption, regular security audits, and are fully compliant with GDPR and SOC 2 standards.",
                },
                {
                  q: "Do you offer customer support?",
                  a: "Yes! We provide email support for all users. Professional and Enterprise plans get priority support with faster response times and live chat access.",
                },
                {
                  q: "Can I import my existing data?",
                  a: "Yes, you can easily import your existing client and invoice data from Excel, CSV, or other invoicing platforms using our data import tool.",
                },
              ].map((faq, index) => (
                <div
                  key={index}
                  id={`faq-${index}`}
                  data-animate
                  className={`p-6 bg-white rounded-xl shadow-md border border-gray-200 hover:border-orange-500 transition-all ${isVisible[`faq-${index}`] ? "animate-slide-up" : "opacity-0"}`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <h3 className="text-lg font-semibold mb-3 text-gray-900 flex items-center gap-3">
                    <ChevronRight className="w-5 h-5 text-orange-500" />
                    {faq.q}
                  </h3>
                  <p className="text-gray-600 leading-relaxed pl-8">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-orange-500 to-orange-600 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full filter blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full filter blur-3xl" />
          </div>
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Ready to transform your billing?
            </h2>
            <p className="text-xl text-white/90 mb-10 leading-relaxed">
              Join 10,000+ businesses already using SolidFlo. Start your 14-day
              free trial today — no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleSignup}
                className="px-8 py-4 bg-white text-orange-600 rounded-xl font-semibold text-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all flex items-center justify-center gap-2 group"
              >
                Start Free Trial{" "}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-8 py-4 border-2 border-white text-white rounded-xl font-semibold text-lg hover:bg-white hover:text-orange-600 transition-all">
                Schedule a Demo
              </button>
            </div>
            <p className="mt-8 text-white/80 text-sm">
              ✓ No credit card required ✓ 14-day free trial ✓ Cancel anytime
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
              <div>
                <img src={logo1} alt="SolidFlo" className="h-10 mb-4" />
                <p className="text-gray-400 mb-6 leading-relaxed">
                  Free online invoicing for small businesses. Create and send
                  invoices, track time and expenses, and accept online payments.
                </p>
                <div className="flex gap-4">
                  {[
                    { icon: facebook, alt: "Facebook" },
                    { icon: twitter, alt: "Twitter" },
                    { icon: linkedin, alt: "LinkedIn" },
                    { icon: instagram, alt: "Instagram" },
                  ].map((social, index) => (
                    <a
                      key={index}
                      href="#"
                      className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-orange-500 transition-colors"
                    >
                      <img
                        src={social.icon}
                        alt={social.alt}
                        className="w-5 h-5"
                      />
                    </a>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4 text-orange-400">
                  Product
                </h3>
                <ul className="space-y-3">
                  {[
                    "Features",
                    "Pricing",
                    "Integrations",
                    "API Docs",
                    "Updates",
                  ].map((item) => (
                    <li key={item}>
                      <a
                        href="#"
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4 text-orange-400">
                  Company
                </h3>
                <ul className="space-y-3">
                  {[
                    { label: "About", path: "/about" },
                    { label: "Careers", path: "/careers" },
                    { label: "Press Kit", path: "/press-kit" },
                    { label: "Contact", path: "/contact" },
                    { label: "Partners", path: "/partners" },
                  ].map((item) => (
                    <li key={item.label}>
                      <a
                        onClick={() => navigate(item.path)}
                        className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4 text-orange-400">
                  Resources
                </h3>
                <ul className="space-y-3">
                  {[
                    { label: "Help Center", path: "/help-center" },
                    { label: "Blogs", path: "/blogs" },
                    { label: "Tutorials", path: "/tutorials" },
                    { label: "Community", path: "/community" },
                    { label: "Privacy Policy", path: "/privacy" },
                    { label: "Terms of Service", path: "/terms" },
                  ].map((item) => (
                    <li key={item.label}>
                      <a
                        onClick={() => navigate(item.path)}
                        className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-8 border-t border-gray-800 text-center text-gray-400">
              <p>
                &copy; {new Date().getFullYear()} SolidFlo. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>

      {/* Vapi Widget */}
      <div id="vapi-widget-container"></div>
    </>
  );
};

export default LandingPage;
