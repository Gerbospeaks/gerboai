import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import VapiAssistant from "./VapiAssistant";
import ChatAssistant from "../components/ChatAssistant";
import IndustryPickerModal from "../components/IndustryPickerModal";
import { useIndustryPicker } from "../hooks/useIndustryPicker";
import TimelineNavigation from "./TimelineNavigation";
import { Helmet } from "react-helmet";
import InstallButton from "../components/InstallButton";
import CookieConsent from "../components/CookieConsent";
import heroBg from "../assets/videos/world.mp4";
import google from "../assets/google-play.png"
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

/* ─── Currency utilities (unchanged) ─────────────────────────────────────── */
const fetchGeoInfo = async () => {
  try {
    const res = await fetch("https://ipapi.co/json/");
    if (!res.ok) throw new Error();
    const data = await res.json();
    return {
      currencyCode: data.currency || "USD",
      countryName: data.country_name || "Unknown",
    };
  } catch {
    return { currencyCode: "USD", countryName: "Unknown" };
  }
};

const fetchExchangeRate = async (targetCurrency) => {
  if (targetCurrency === "USD") return 1;
  try {
    const res = await fetch(`https://open.er-api.com/v6/latest/USD`);
    if (!res.ok) throw new Error();
    const data = await res.json();
    return data.rates?.[targetCurrency] ?? 1;
  } catch {
    return 1;
  }
};

const formatPrice = (usdPrice, rate, currencyCode) => {
  const converted = usdPrice * rate;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: 0,
    }).format(converted);
  } catch {
    return `${currencyCode} ${Math.round(converted)}`;
  }
};

const useCurrency = () => {
  const [currencyCode, setCurrencyCode] = useState("USD");
  const [exchangeRate, setExchangeRate] = useState(1);
  const [countryName, setCountryName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { currencyCode: code, countryName: country } = await fetchGeoInfo();
      const rate = await fetchExchangeRate(code);
      if (!cancelled) {
        setCurrencyCode(code);
        setExchangeRate(rate);
        setCountryName(country);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { currencyCode, exchangeRate, countryName, loading };
};

/* ─── Styles ─────────────────────────────────────────────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Lato:wght@300;400;600;700;900&display=swap');

  :root {
  --navy:       #0f172a;
  --navy-mid:   #1e293b;
  --navy-light: #334155;
  --red:        #6366f1;
  --red-hover:  #4f46e5;
  --red-light:  #eef2ff;
  --blue:       #0ea5e9;
  --green:      #10b981;

  --cream:      #f8fafc;
  --cream-mid:  #f1f5f9;
  --cream-dark: #e2e8f0;
  --card-bg:    #ffffff;

  --border:     #e2e8f0;
  --bg:         var(--cream);
  --white:      var(--card-bg);
  --text:       #0f172a;
  --text-mid:   #475569;
  --text-muted: #94a3b8;
}

  .lp * { box-sizing: border-box; }
  .lp { font-family: 'Lato', sans-serif; color: var(--text); overflow-x: hidden; background: var(--cream); }
  .lp h1, .lp h2, .lp h3 { font-family: 'Playfair Display', serif; }

  /* ── Scroll bar ── */
  .lp ::-webkit-scrollbar { width: 6px; }
  .lp ::-webkit-scrollbar-track { background: var(--cream-mid); }
  .lp ::-webkit-scrollbar-thumb { background: var(--red); border-radius: 6px; }

  /* ── Scroll progress bar ── */
  .lp-progress {
    position: fixed; top: 0; left: 0; height: 3px; z-index: 200;
   background: linear-gradient(90deg, var(--red), #818cf8);
    transition: width .1s linear;
  }

  /* ════════════════════════════════════════════════
     NAV
  ════════════════════════════════════════════════ */
  .lp-nav {
    position: fixed; top: 40px; left: 0; right: 0; z-index: 100;
    height: 64px;
    display: flex; align-items: center;
    padding: 0 40px;
    transition: background .25s, box-shadow .25s;
  }
  .lp-nav.scrolled {
    background: rgba(254,252,248,.97);
    backdrop-filter: blur(12px);
    box-shadow: 0 2px 20px rgba(26,18,8,.08);
  }
  .lp-nav-inner {
    max-width: 1200px; width: 100%; margin: 0 auto;
    display: flex; align-items: center; justify-content: space-between;
  }
  .lp-nav-links { display: flex; align-items: center; gap: 32px; }
  .lp-nav-links a {
    font-size: 13px; font-weight: 700; letter-spacing: .04em;
    text-transform: uppercase; color: var(--text-mid);
    text-decoration: none; transition: color .15s;
  }
  .lp-nav-links a:hover { color: var(--navy); }
  .lp-nav-ctas { display: flex; align-items: center; gap: 10px; }
  .lp-btn-ghost {
    height: 36px; padding: 0 18px;
    background: transparent; border: 1px solid var(--cream-dark);
    color: var(--text-mid); border-radius: 3px;
    font-size: 13px; font-weight: 700; cursor: pointer;
    font-family: 'Lato', sans-serif; letter-spacing: .03em;
    transition: border-color .15s, color .15s, background .15s;
  }
  .lp-btn-ghost:hover { border-color: var(--navy); color: var(--navy); background: var(--cream-mid); }
  .lp-btn-primary {
    height: 36px; padding: 0 20px;
    background: var(--red); color: #fff;
    border: none; border-radius: 3px;
    font-size: 13px; font-weight: 700; cursor: pointer;
    font-family: 'Lato', sans-serif; letter-spacing: .03em;
    display: flex; align-items: center; gap: 6px;
    transition: background .15s, transform .15s;
  }
  .lp-btn-primary:hover { background: var(--red-hover); transform: translateY(-1px); }
  .lp-hamburger {
    display: none; background: none; border: none; cursor: pointer; color: var(--navy); padding: 4px;
  }
  .lp-nav:not(.scrolled) .lp-hamburger {
  color: var(--navy);
}
/* ════════════════════════════════════════════════
   SERVICES / MARKETPLACE SECTION
════════════════════════════════════════════════ */
.lp-services {
  background: transparent;
  padding: 96px 24px;
}
.lp-services-inner {
  max-width: 1060px;
  margin: 0 auto;
}
.lp-services-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 40px;
}
.lp-services-card {
  background: var(--card-bg);
  border: 1px solid var(--cream-dark);
  border-radius: 14px;
  padding: 28px 24px;
  cursor: pointer;
  opacity: 1;
  transition: box-shadow .2s, border-color .2s, transform .2s;
  position: relative; overflow: hidden;
}
.lp-services-card::before {
  content: '';
  position: absolute; top: 0; left: 0; right: 0; height: 3px;
  background: linear-gradient(90deg, var(--red), #818cf8);
  opacity: 0; transition: opacity .2s;
}
.lp-services-card:hover::before { opacity: 1; }
.lp-services-card:hover {
  box-shadow: 0 10px 32px rgba(99,102,241,.1);
  transform: translateY(-4px);
  border-color: rgba(99,102,241,.25);
}
.lp-services-card-emoji {
  font-size: 32px; margin-bottom: 14px; display: block;
}
.lp-services-card-title {
  font-family: 'Playfair Display', serif;
  font-size: 17px; font-weight: 600;
  color: var(--navy); margin-bottom: 6px;
}
.lp-services-card-desc {
  font-size: 12px; color: var(--text-muted);
  line-height: 1.6; margin-bottom: 16px;
}
.lp-services-card-count {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 11px; font-weight: 700;
  color: var(--red);
  background: var(--red-light);
  border: 1px solid rgba(99,102,241,.18);
  padding: 3px 10px; border-radius: 20px;
}
.lp-services-card-count-dot {
  width: 5px; height: 5px; border-radius: 50%;
  background: #4ade80;
  box-shadow: 0 0 5px #4ade80;
}
.lp-services-cta-row {
  display: flex; align-items: center;
  justify-content: space-between; flex-wrap: wrap; gap: 16px;
  background: var(--navy);
  border-radius: 14px; padding: 32px 36px;
}
.lp-services-cta-left h3 {
  font-family: 'Playfair Display', serif;
  font-size: 22px; color: #fff; margin-bottom: 6px;
}
.lp-services-cta-left p {
  font-size: 13px; color: rgba(255,255,255,.5);
  line-height: 1.6; max-width: 420px;
}
.lp-services-cta-btns {
  display: flex; gap: 10px; flex-wrap: wrap; flex-shrink: 0;
}
.lp-services-btn-primary {
  height: 44px; padding: 0 24px;
  background: var(--red); color: #fff;
  border: none; border-radius: 6px;
  font-family: 'Lato', sans-serif;
  font-size: 13px; font-weight: 700; letter-spacing: .04em;
  text-transform: uppercase;
  display: inline-flex; align-items: center; gap: 8px;
  cursor: pointer; transition: all .18s;
}
.lp-services-btn-primary:hover {
  background: var(--red-hover); transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(99,102,241,.4);
}
.lp-services-btn-ghost {
  height: 44px; padding: 0 20px;
  background: rgba(255,255,255,.07);
  border: 1px solid rgba(255,255,255,.15);
  color: rgba(255,255,255,.75); border-radius: 6px;
  font-family: 'Lato', sans-serif;
  font-size: 13px; font-weight: 700; letter-spacing: .04em;
  text-transform: uppercase; cursor: pointer; transition: all .18s;
}
.lp-services-btn-ghost:hover {
  background: rgba(255,255,255,.13); color: #fff;
}
.kraal-section {
  display:grid;
  padding: 72px 0;
  background: transparent;
}
  .kraal-section .section-eyebrow {
  text-align: center;
  display: block;
  margin-bottom: 10px;
}
@media (max-width: 1024px) {
  .lp-services-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 640px) {
  .lp-services-grid { grid-template-columns: 1fr; }
  .lp-services-cta-row { padding: 28px 24px; flex-direction: column; }
}
.lp-nav.scrolled .lp-hamburger {
  color: var(--navy);
}
  /* ── Mobile nav drawer ── */
  .lp-drawer-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,.6); z-index: 150;
  }
  .lp-drawer {
    position: fixed; top: 0; right: 0; bottom: 0; width: 280px;
    background: var(--navy); z-index: 160;
    padding: 24px;
    transform: translateX(100%); transition: transform .25s ease;
  }
  .lp-drawer.open { transform: translateX(0); }
  .lp-drawer-close {
    background: none; border: none; cursor: pointer; color: rgba(255,255,255,.6);
    position: absolute; top: 20px; right: 20px;
  }
  .lp-drawer-close:hover { color: #fff; }
  .lp-drawer-links { margin-top: 48px; display: flex; flex-direction: column; gap: 20px; }
  .lp-drawer-links a {
    font-size: 16px; font-weight: 700; color: rgba(255,255,255,.8);
    text-decoration: none; letter-spacing: .03em;
    padding-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,.08);
    transition: color .15s;
  }
  .lp-drawer-links a:hover { color: #fff; }
  .lp-drawer-ctas { margin-top: 28px; display: flex; flex-direction: column; gap: 10px; }
  .lp-drawer-ctas .lp-btn-ghost,
  .lp-drawer-ctas .lp-btn-primary { width: 100%; justify-content: center; height: 44px; font-size: 14px; }
/* ════════════════════════════════════════════════
   ANALYTICS / CHARTS SECTION
════════════════════════════════════════════════ */
.lp-analytics {
  background: transparent;
  padding: 96px 24px;
}
.lp-analytics-inner {
  max-width: 1060px;
  margin: 0 auto;
}
.lp-analytics-metrics {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 32px;
}
.lp-analytics-metric {
  background: transparent;
  border: 1px solid #C1B2FF;
  border-radius: 10px;
  padding: 18px 20px;
}
.lp-analytics-metric-label {
  font-size: 12px; color: var(--text-muted);
  font-weight: 600; letter-spacing: .04em;
  text-transform: uppercase; margin-bottom: 8px;
}
.lp-analytics-metric-value {
  font-family: 'Playfair Display', serif;
  font-size: 26px; font-weight: 700;
  color: var(--navy); line-height: 1;
}
.lp-analytics-metric-delta {
  font-size: 12px; color: #10b981;
  margin-top: 6px; font-weight: 600;
}
.lp-analytics-charts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}
.lp-analytics-chart-card {
  background: var(--card-bg);
  border: 1px solid var(--cream-dark);
  border-radius: 12px;
  padding: 24px 24px 18px;
}
.lp-analytics-chart-card.full {
  grid-column: 1 / -1;
}
.lp-analytics-chart-title {
  font-size: 15px; font-weight: 700;
  color: var(--navy); margin-bottom: 4px;
}
.lp-analytics-chart-sub {
  font-size: 12px; color: var(--text-muted);
  margin-bottom: 14px;
}
.lp-analytics-legend {
  display: flex; flex-wrap: wrap;
  gap: 14px; margin-bottom: 14px;
  font-size: 12px; color: var(--text-mid);
}
.lp-analytics-legend-dot {
  width: 10px; height: 10px;
  border-radius: 2px; display: inline-block;
  margin-right: 4px; vertical-align: middle;
}
.lp-funnel-row {
  display: flex; align-items: center;
  gap: 12px; margin-bottom: 10px;
}
.lp-funnel-label {
  font-size: 12px; color: var(--text-muted);
  width: 100px; text-align: right; flex-shrink: 0;
}
.lp-funnel-bar-wrap {
  flex: 1; background: var(--cream-mid);
  border-radius: 4px; height: 30px;
  overflow: hidden;
}
.lp-funnel-bar {
  height: 100%; border-radius: 4px;
  display: flex; align-items: center;
  justify-content: flex-end; padding-right: 10px;
}
.lp-funnel-val {
  font-size: 12px; font-weight: 700; color: #fff;
}
@media (max-width: 768px) {
  .lp-analytics-metrics { grid-template-columns: repeat(2, 1fr); }
  .lp-analytics-charts  { grid-template-columns: 1fr; }
  .lp-analytics-chart-card.full { grid-column: auto; }
}
  /* ════════════════════════════════════════════════
     HERO  (keeps dark navy — contrast with cream below)
  ════════════════════════════════════════════════ */
  .lp-hero {
   background: #ffffff;
  transition: background 0.4s ease;
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding: 100px 40px 80px;
  position: relative;
  overflow: hidden;
}
  .lp-hero-inner {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: 60px;
}

.lp-hero-left {
  text-align: left;
  padding-top: 100px;
}
.lp-hero.scrolled {
  background: #5ed34e;
}
.lp-hero-right {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}
    .lp-hero-video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  z-index: 0;
  pointer-events: none;
}

.lp-hero-video-overlay {
  position: absolute;
  padding-top: 40px;
  inset: 0;
  
  z-index: 1;
  pointer-events: none;
}
  .lp-hero > *:not(.lp-hero-video):not(.lp-hero-video-overlay) {
  position: relative;
  z-index: 2;
}
  .lp-hero::before {
    content: '';
    position: absolute; inset: 0;
    background:
      radial-gradient(ellipse 70% 60% at 15% 40%, rgba(99,102,241,.07) 0%, transparent 60%),
      radial-gradient(ellipse 60% 70% at 85% 20%, rgba(27,110,194,.06) 0%, transparent 55%),
      radial-gradient(ellipse 50% 50% at 50% 90%, rgba(99,102,241,.04) 0%, transparent 60%);
    pointer-events: none;
  }
  .lp-hero::after {
    content: '';
    position: absolute;
    width: 800px; height: 800px;
    background:
      radial-gradient(ellipse at 40% 40%, rgba(99,102,241,.09) 0%, transparent 55%),
      radial-gradient(ellipse at 70% 60%, rgba(27,110,194,.07) 0%, transparent 55%);
    top: -200px; right: -200px;
    pointer-events: none;
  }
  .lp-hero-badge {
    display: inline-flex; align-items: center; gap: 7px;
  padding: 6px 14px;
  background: rgba(99,102,241,.08);
  border: 1px solid rgba(99,102,241,.2);
  border-radius: 20px;
  font-size: 12px; font-weight: 700; letter-spacing: .05em;
  text-transform: uppercase; color: var(--red);
  margin-bottom: 28px;
  }
  .lp-hero h1 {
   font-size: clamp(2.8rem, 5vw, 4.5rem);
  line-height: 1.08;
  color: var(--navy);
  margin-bottom: 24px;
  text-align: left;
    animation: lp-up .65s ease both .05s;
  }
  .lp-hero h1 em { font-style: italic; color: var(--red); }
  .lp-hero-sub {
    font-size: clamp(1rem, 2vw, 1.25rem); color: var(--text-mid);
    max-width: 520px; margin: 0 0 40px; line-height: 1.7; text-align: left;
    animation: lp-up .65s ease both .1s;
  }
  .lp-hero-ctas {
    display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: flex-start;
  margin-bottom: 40px;
    animation: lp-up .65s ease both .15s;
  }
  .lp-hero-primary {
    height: 52px; padding: 0 32px;
    background: var(--red); color: #fff;
    border: none; border-radius: 4px;
    font-family: 'Lato', sans-serif;
    font-size: 14px; font-weight: 700; letter-spacing: .04em;
    display: flex; align-items: center; gap: 8px; cursor: pointer;
    transition: background .15s, transform .15s, box-shadow .15s;
    text-transform: uppercase;
  }
  .lp-hero-primary:hover {
    background: var(--red-hover);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(232,68,42,.4);
  }
  .lp-hero-secondary {
    height: 52px; padding: 0 28px;
    background: transparent;
    border: 1.5px solid var(--cream-dark); border-radius: 4px;
    font-family: 'Lato', sans-serif;
    font-size: 14px; font-weight: 700; letter-spacing: .04em;
    display: flex; align-items: center; gap: 8px; cursor: pointer; color: var(--navy);
    transition: border-color .15s, color .15s, background .15s;
    text-transform: uppercase;
  }
  .lp-hero-secondary:hover { border-color: var(--navy); color: var(--navy); background: var(--cream-mid); }
  .lp-hero-trust {
   display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 600;
  letter-spacing: .03em;
  justify-content: flex-start;
    animation: lp-up .65s ease both .2s;
    
  }
  .lp-hero-trust-item { display: flex; align-items: center; gap: 6px; }
  .lp-hero-trust-item svg { color: #4ade80; }

  .lp-hero-screen {
    width: 100%;
  position: relative;
  animation: lp-float 6s ease-in-out infinite;
  }
    .lp-hero-orb {
  width: 480px;
  height: 480px;
  border-radius: 50%;
  background: radial-gradient(circle at 38% 38%,
    #818cf8 0%,
    #6366f1 30%,
    #4338ca 60%,
    #1e1b4b 100%
  );
  position: relative;
  animation: lp-float 6s ease-in-out infinite;
  box-shadow:
    0 0 80px rgba(99,102,241,.35),
    0 0 160px rgba(99,102,241,.15);
}

.lp-hero-orb::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%,
    rgba(255,255,255,.25) 0%,
    transparent 55%
  );
}

/* Remove old floating invoices on small screens */
@media (max-width: 768px) {
  .lp-hero {
    padding: 90px 20px 48px;
    min-height: auto;
    background: linear-gradient(160deg, #f8fafc 0%, #eef2ff 100%) !important;
  }
     .kraal-section {
    padding: 52px 0;
  }
  .lp-hero h1 { font-size: 2.2rem; text-align: center; }
  .lp-hero-sub { text-align: center; font-size: 0.95rem; margin: 0 auto 28px; }
  .lp-hero-badge { font-size: 10px; }
  .lp-hero-ctas { flex-direction: column; gap: 10px; }
  .lp-hero-primary,
  .lp-hero-secondary {
    width: 100%; height: 48px;
    justify-content: center; border-radius: 10px;
  }
  .lp-hero-trust { flex-direction: column; align-items: center; gap: 8px; }
  /* Hero image below text on mobile */
  .lp-hero-right {
    display: block !important;
    margin: 0 -4px;
  }
  .lp-hero-screen-frame { border-radius: 14px; }
  .lp-hero-inner { gap: 28px; }
}
  .lp-hero-screen-glow {
    position: absolute; inset: -40px;
    background: radial-gradient(ellipse at 50% 60%, rgba(232,68,42,.2), transparent 70%);
    pointer-events: none;
  }
  .lp-hero-screen-frame {
    border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--cream-dark);
  box-shadow:
    0 24px 60px rgba(15, 23, 42, .12),
    0 4px 16px rgba(15, 23, 42, .06);
  background: var(--cream-mid);
  }
  .lp-hero-screen-frame img { width: 100%;
  height: auto;
  display: block;
  transition: opacity .4s ease; }

  /* ── Invoice floats ── */
  .lp-invoice-float {
    position: absolute;
    left: 32px; top: 22%;
    background: rgba(14,22,45,.88);
    border: 1px solid rgba(255,255,255,.1);
    border-radius: 8px;
    padding: 18px 20px;
    width: 308px;
    z-index: 2;
    text-align: left;
    animation: lp-up .7s ease both .3s;
  }
  .lp-invoice-float2 {
    position: absolute;
    right: 32px; top: 26%;
    background: rgba(14,22,45,.88);
    border: 1px solid rgba(255,255,255,.1);
    border-radius: 8px;
    padding: 16px 18px;
    width: 220px;
    z-index: 2;
    text-align: left;
    animation: lp-up .7s ease both .45s;
  }
  .lp-invoice-float-tag {
    font-size: 9px; font-weight: 700; letter-spacing: .06em;
    text-transform: uppercase; padding: 2px 8px;
    border-radius: 10px;
  }
  @media (max-width: 1200px) {
    .lp-invoice-float, .lp-invoice-float2 { display: none; }
  }
  .lp-slide-dots { display: flex;
  justify-content: center;
  gap: 6px;
  margin-top: 16px; }
  .lp-slide-dot {
    height: 4px;
  border-radius: 2px;
  cursor: pointer;
  transition: width .3s, background .3s;
  background: var(--cream-dark);
  width: 8px;
  border: none;
  }
  .lp-slide-dot.active { width: 28px; background: var(--red); }
@keyframes lp-fade {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

.lp-hero-screen-frame img {
  animation: lp-fade .4s ease both;
}
  .lp-cut {
    width: 100%; overflow: hidden; line-height: 0;
    background: var(--navy);
  }
  .lp-cut svg { display: block; }

  /* ════════════════════════════════════════════════
     STATS STRIP  — creamy dark
  ════════════════════════════════════════════════ */
  .lp-stats {
   background: #C1B2FF;
    padding: 56px 24px;
    position: relative;
  }
  .lp-stats-inner {
    max-width: 1000px; margin: 0 auto;
    display: grid; grid-template-columns: repeat(4,1fr); gap: 0;
  }
  .lp-stat {
    text-align: center;
    padding: 20px 24px;
    border-right: 1px solid rgba(253,246,236,.08);
    opacity: 0; transform: translateY(20px);
    transition: opacity .5s ease, transform .5s ease;
  }
  .lp-stat.visible { opacity: 1; transform: translateY(0); }
  .lp-stat:last-child { border-right: none; }
  .lp-stat-icon {
    width: 40px; height: 40px; border-radius: 4px;
    background: rgba(232,68,42,.12);
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 12px; color: var(--red);
  }
  .lp-stat-value { font-size: 36px; font-weight: 900; color: #fefcf8; line-height: 1; margin-bottom: 6px; font-family: 'Playfair Display', serif; }
  .lp-stat-label { font-size: 12px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: rgba(253,246,236,.4); }

  /* ════════════════════════════════════════════════
     FEATURES  — creamy background
  ════════════════════════════════════════════════ */
  .lp-features {
    background: #C1B2FF;
    padding: 96px 24px;
  }
  .lp-section-head { text-align: center; margin-bottom: 56px; }
  .lp-section-eyebrow {
    display: inline-block;
    font-size: 11px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase;
    color: var(--red); margin-bottom: 12px;
    padding: 4px 12px; background: var(--red-light);
    border: 1px solid rgba(232,68,42,.2); border-radius: 2px;
  }
.lp-section-head h2 {
    font-size: clamp(2rem, 4vw, 3rem); color: var(--navy); line-height: 1.1; margin-bottom: 16px;
    letter-spacing: -.02em;
  }
  .lp-section-head p { font-size: 16px; color: var(--text-mid); max-width: 560px; margin: 0 auto; line-height: 1.7; }

  .lp-features-grid {
    max-width: 1100px; margin: 0 auto;
    display: grid; grid-template-columns: repeat(3,1fr); gap: 1px;
    background: var(--cream-dark);
    border: 1px solid var(--cream-dark);
    border-radius: 6px; overflow: hidden;
  }
  .lp-feature-card {
    background: var(--card-bg);
    padding: 32px 28px;
    opacity: 0; transform: translateY(16px);
    transition: opacity .45s ease, transform .45s ease, background .2s;
  }
  .lp-feature-card.visible { opacity: 1; transform: translateY(0); }
  .lp-feature-card:hover { background: var(--cream-mid); }
  .lp-feature-icon {
    width: 44px; height: 44px; border-radius: 4px;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 18px;
  }
  .lp-feature-card h3 { font-family: 'Lato', sans-serif; font-size: 15px; font-weight: 700; color: var(--navy); margin-bottom: 8px; }
  .lp-feature-card p  { font-size: 13px; color: var(--text-mid); line-height: 1.65; }
  .lp-feature-bar {
    height: 3px; width: 32px; background: var(--red);
    margin-bottom: 16px; border-radius: 2px;
    transform: scaleX(0); transform-origin: left;
    transition: transform .3s ease .1s;
  }
  .lp-feature-card.visible .lp-feature-bar { transform: scaleX(1); }
  .lp-feature-card:hover .lp-feature-bar { width: 100%; }

  /* ════════════════════════════════════════════════
     GLOBE  — keeps navy
  ════════════════════════════════════════════════ */
  .lp-globe {
    background: transparent;
    padding: 96px 24px; text-align: center;
    position: relative; overflow: hidden;
  }
  .lp-globe::before {
    content: '';
    position: absolute; inset: 0;
    background: transparent;
    pointer-events: none;
  }
  .lp-globe h2 { color: #000000; font-size: clamp(2rem, 4vw, 3rem); margin-bottom: 12px; }
  .lp-globe p  { color: rgba(0,0,0,.55); font-size: 16px; max-width: 480px; margin: 0 auto 48px; line-height: 1.65; }
  .lp-globe img { max-width: 760px; width: 100%; }
.section-inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 36px;
}
  .hero-app {
  margin-top: 0; 
  flex: 1 1 320px; 
}
   .hero-app {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 20px;
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0);
  border: 0px solid rgba(0, 0, 0, 0.07);
  border-radius: 14px;
  backdrop-filter: blur(6px);
  max-width: 480px;
}
  /* ════════════════════════════════════════════════
     PRICING  — deeper cream
  ════════════════════════════════════════════════ */
  .lp-pricing {
    background: transparent;
    padding: 96px 24px;
    position: relative; overflow: hidden;
  }
  .lp-pricing-grid {
    max-width: 1060px; margin: 0 auto;
    display: grid; grid-template-columns: repeat(3,1fr); gap: 16px;
  }
  .lp-plan {
    background: var(--card-bg);
    border: 1px solid var(--cream-dark);
    border-radius: 5px; padding: 36px 28px;
    position: relative;
    opacity: 0; transform: translateY(16px);
    transition: opacity .45s ease, transform .45s ease, box-shadow .2s;
  }
  .lp-plan.visible { opacity: 1; transform: translateY(0); }
  .lp-plan:hover { box-shadow: 0 8px 32px rgba(43,31,20,.1); }
  .lp-plan.popular {
    background: var(--navy);
    border-color: var(--navy);
  }
  .lp-plan-badge {
    position: absolute; top: -12px; left: 50%; transform: translateX(-50%);
    background: var(--red); color: #fff;
    font-size: 10px; font-weight: 700; letter-spacing: .07em; text-transform: uppercase;
    padding: 4px 14px; border-radius: 20px;
    white-space: nowrap;
  }
  .lp-plan-name {
    font-size: 13px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase;
    color: var(--text-muted); margin-bottom: 6px;
  }
  .lp-plan.popular .lp-plan-name { color: rgba(255,255,255,.5); }
  .lp-plan-price {
    font-family: 'Playfair Display', serif;
    font-size: 42px; color: var(--navy); line-height: 1; margin-bottom: 4px;
  }
  .lp-plan.popular .lp-plan-price { color: #fff; }
  .lp-plan-period { font-size: 12px; color: var(--text-muted); margin-bottom: 4px; }
  .lp-plan.popular .lp-plan-period { color: rgba(255,255,255,.45); }
  .lp-plan-usd { font-size: 11px; color: var(--text-muted); margin-bottom: 20px; }
  .lp-plan.popular .lp-plan-usd { color: rgba(255,255,255,.3); }
  .lp-plan-desc { font-size: 13px; color: var(--text-mid); margin-bottom: 24px; line-height: 1.5; border-bottom: 1px solid var(--cream-dark); padding-bottom: 20px; }
  .lp-plan.popular .lp-plan-desc { color: rgba(255,255,255,.55); border-color: rgba(255,255,255,.1); }
  .lp-plan-features { list-style: none; padding: 0; margin: 0 0 28px; display: flex; flex-direction: column; gap: 10px; }
  .lp-plan-feature {
    display: flex; align-items: flex-start; gap: 8px;
    font-size: 13px; color: var(--text-mid);
  }
  .lp-plan.popular .lp-plan-feature { color: rgba(255,255,255,.7); }
  .lp-plan-feature svg { flex-shrink: 0; margin-top: 1px; }
  .lp-plan-cta {
    width: 100%; height: 40px;
    border-radius: 3px; cursor: pointer;
    font-family: 'Lato', sans-serif;
    font-size: 13px; font-weight: 700; letter-spacing: .04em; text-transform: uppercase;
    border: none; transition: background .15s, transform .15s;
  }
  .lp-plan-cta-default {
    background: transparent; color: var(--navy);
    border: 1px solid var(--cream-dark);
  }
  .lp-plan-cta-default:hover { border-color: var(--navy); background: var(--cream); }
  .lp-plan-cta-popular {
    background: var(--red); color: #fff;
  }
  .lp-plan-cta-popular:hover { background: var(--red-hover); transform: translateY(-1px); }
  .lp-price-skeleton {
    display: inline-block; width: 100px; height: 44px;
    background: linear-gradient(90deg, var(--cream-dark) 25%, var(--cream-mid) 50%, var(--cream-dark) 75%);
    background-size: 200% 100%;
    animation: lp-shimmer 1.4s infinite;
    border-radius: 4px;
  }
  .lp-currency-badge {
    display: inline-flex; align-items: center; gap: 6px;
    margin-top: 14px; padding: 5px 14px;
    background: var(--red-light); border: 1px solid rgba(232,68,42,.2);
    border-radius: 20px; font-size: 12px; color: var(--red); font-weight: 700;
  }

  /* ════════════════════════════════════════════════
     TESTIMONIALS  — warm dark brown
  ════════════════════════════════════════════════ */
  .lp-testimonials {
    background: transparent;
    padding: 96px 24px;
    position: relative; overflow: hidden;
  }
  .lp-testimonials::before {
    content: '';
    position: absolute; inset: 0;
    background:
      radial-gradient(ellipse 55% 50% at 5% 30%, rgba(99,102,241,.09) 0%, transparent 55%),
      radial-gradient(ellipse 45% 55% at 95% 70%, rgba(27,110,194,.07) 0%, transparent 55%);
    pointer-events: none;
  }
  .lp-testimonials h2 { color: #0a0a0a; text-align: center; font-size: clamp(2rem,4vw,3rem); margin-bottom: 10px; }
  .lp-testimonials > .lp-section-head > p { color: rgba(22, 22, 22, 0.5); }
  .lp-testimonials-grid {
    max-width: 1060px; margin: 0 auto;
    display: grid; grid-template-columns: repeat(3,1fr); gap: 16px;
  }
  .lp-testimonial {
    background: rgba(253,246,236);
    border: 1px solid rgba(253,246,236,.08);
    border-left: 3px solid var(--red);
    border-radius: 4px; padding: 28px;
    opacity: 0; transform: translateY(16px);
    transition: opacity .45s ease, transform .45s ease;
  }
  .lp-testimonial.visible { opacity: 1; transform: translateY(0); }
  .lp-testimonial-stars { display: flex; gap: 3px; margin-bottom: 16px; color: #fb923c; }
  .lp-testimonial-text { font-size: 14px; color: #000000; line-height: 1.7; margin-bottom: 20px; font-style: italic; }
  .lp-testimonial-author { display: flex; align-items: center; gap: 10px; }
  .lp-testimonial-avatar { width: 40px; height: 40px; border-radius: 50%; border: 2px solid rgba(253,246,236,.1); }
  .lp-testimonial-name { font-size: 13px; font-weight: 700; color: #5f2c02; }
  .lp-testimonial-role { font-size: 11px; color: rgb(151, 94, 13); margin-top: 1px; }

  /* ════════════════════════════════════════════════
     FAQ  — lightest cream
  ════════════════════════════════════════════════ */
  .lp-faq {
    background: transparent; padding: 96px 24px;
  }
  .lp-faq-list {
    max-width: 760px; margin: 0 auto;
    display: flex; flex-direction: column; gap: 2px;
  }
  .lp-faq-item {
    background: var(--card-bg); border: 1px solid var(--cream-dark); border-radius: 3px; padding: 20px 24px;
    opacity: 0; transform: translateX(-12px);
    transition: opacity .4s ease, transform .4s ease, border-color .15s;
  }
  .lp-faq-item.visible { opacity: 1; transform: translateX(0); }
  .lp-faq-item:hover { border-color: var(--red); }
  .lp-faq-q {
    font-size: 14px; font-weight: 700; color: var(--navy);
    display: flex; align-items: flex-start; gap: 10px; margin-bottom: 8px;
  }
  .lp-faq-q svg { color: var(--red); flex-shrink: 0; margin-top: 2px; }
  .lp-faq-a { font-size: 13px; color: var(--text-mid); line-height: 1.7; padding-left: 24px; }

  /* ════════════════════════════════════════════════
     CTA BANNER
  ════════════════════════════════════════════════ */
  .lp-cta {
    background: transparent;
    padding: 96px 24px;
    text-align: center;
    position: relative; overflow: hidden;
  }
  .lp-cta::before {
    content: '';
    position: absolute; inset: 0;
    background:
    radial-gradient(ellipse 70% 80% at 10% 50%, rgba(255,255,255,.08) 0%, transparent 50%),
    radial-gradient(ellipse 50% 60% at 90% 20%, rgba(255,255,255,.06) 0%, transparent 50%),
    radial-gradient(ellipse 40% 40% at 50% 100%, rgba(0,0,0,.1) 0%, transparent 50%);
    pointer-events: none;
  }
  .lp-cta h2 { color: #01034e; font-size: clamp(2rem,4vw,3.2rem); margin-bottom: 16px; }
  .lp-cta p  { color: rgba(2, 46, 129, 0.8); font-size: 16px; max-width: 540px; margin: 0 auto 40px; line-height: 1.65; }
  .lp-cta-btns { display: flex; align-items: center; justify-content: center; gap: 12px; flex-wrap: wrap; margin-bottom: 20px; }
  .lp-cta-primary {
    height: 52px; padding: 0 32px;
    background: #1f9df1; color: white;
    border: none; border-radius: 4px; cursor: pointer;
    font-family: 'Lato', sans-serif; font-size: 14px; font-weight: 700;
    letter-spacing: .04em; text-transform: uppercase;
    display: flex; align-items: center; gap: 8px;
    transition: transform .15s, box-shadow .15s;
  }
  .lp-cta-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,.2); }
  .lp-cta-secondary {
    height: 52px; padding: 0 28px;
    background: transparent; color: #1f9df1;
    border: 1px solid #1f9df1; border-radius: 4px; cursor: pointer;
    font-family: 'Lato', sans-serif; font-size: 14px; font-weight: 700;
    letter-spacing: .04em; text-transform: uppercase;
    transition: border-color .15s, background .15s;
  }
  .lp-cta-secondary:hover { border-color: #fff; background: rgba(255,255,255,.1); }
  .lp-cta-footnote { font-size: 12px; color: rgba(255,255,255,.6); letter-spacing: .03em; }

  /* ════════════════════════════════════════════════
     FOOTER  — keeps navy
  ════════════════════════════════════════════════ */
  .lp-footer { background: #C1B2FF; padding: 72px 24px 32px; }
  .lp-footer-grid {
    max-width: 1100px; margin: 0 auto;
    display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 48px;
    margin-bottom: 56px;
  }
  .lp-footer-logo { height: 38px; margin-bottom: 16px; }
  .lp-footer-tagline { font-size: 13px; color: rgb(0, 19, 71); line-height: 1.7; margin-bottom: 20px; max-width: 280px; }
  .lp-footer-socials { display: flex; gap: 8px; }
  .lp-footer-social {
    width: 34px; height: 34px; border-radius: 3px;
    background: #6366f1; border: 1px solid rgba(255,255,255,.1);
    display: flex; align-items: center; justify-content: center;
    transition: background .15s, border-color .15s; cursor: pointer;
  }
  .lp-footer-social:hover { background: #6366f1; border-color: #6366f1; }
  .lp-footer-social img { width: 16px; height: 16px; filter: brightness(0) invert(1); }
  .lp-footer-col-title { font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--red); margin-bottom: 16px; }
  .lp-footer-links { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
  .lp-footer-links a, .lp-footer-links span {
    font-size: 13px; color: rgba(0, 0, 0);
    text-decoration: none; cursor: pointer;
    transition: color .15s;
  }
  .lp-footer-links a:hover, .lp-footer-links span:hover { color: #000000; }
  .lp-footer-bottom {
    max-width: 1100px; margin: 0 auto;
    padding-top: 24px; border-top: 1px solid rgba(255,255,255,.07);
    display: flex; align-items: center; justify-content: space-between;
    font-size: 12px; color: #000000;
  }
/* Hide Vapi widget button text, keep icon only */
vapi-widget::part(button-text),
vapi-widget::part(label),
vapi-widget [part="button-text"],
vapi-widget [part="label"] {
  display: none !important;
}

/* Force the button to be a square icon circle */
vapi-widget::part(button) {
  width: 52px !important;
  min-width: 52px !important;
  padding: 0 !important;
  border-radius: 50% !important;
  justify-content: center !important;
}
  /* ════════════════════════════════════════════════
     ANIMATIONS
  ════════════════════════════════════════════════ */
  @keyframes lp-up      { from { opacity:0; transform:translateY(24px) } to { opacity:1; transform:translateY(0) } }
  @keyframes lp-shimmer { 0% { background-position:200% 0 } 100% { background-position:-200% 0 } }
  @keyframes lp-float   { 0%,100% { transform:translateY(0) } 50% { transform:translateY(-14px) } }
  .lp-float { animation: lp-float 5s ease-in-out infinite; }
/* ════════════════════════════════════════════════
   MOBILE BOTTOM NAV (app feel)
════════════════════════════════════════════════ */
.lp-bottom-nav {
  display: none;
}
@media (max-width: 768px) {
  .lp-bottom-nav {
    display: flex;
    position: fixed;
    bottom: 0; left: 0; right: 0;
    z-index: 200;
    background: rgba(255,255,255,.97);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-top: 0.5px solid #e2e8f0;
    padding: 6px 0 max(12px, env(safe-area-inset-bottom));
  }
  .lp-bottom-tab {
    flex: 1; display: flex; flex-direction: column;
    align-items: center; gap: 3px;
    font-size: 10px; font-weight: 700;
    color: #94a3b8; cursor: pointer;
    background: none; border: none;
    font-family: 'Lato', sans-serif;
    letter-spacing: .03em;
    transition: color .15s;
    padding: 4px 0;
  }
  .lp-bottom-tab.active { color: #6366f1; }
  .lp-bottom-tab svg { width: 22px; height: 22px; }
  /* Push page content above the nav bar */
  .lp { padding-bottom: 64px; }
}
  /* ════════════════════════════════════════════════
     RESPONSIVE
  ════════════════════════════════════════════════ */
  @media (max-width: 1024px) {
    .lp-pricing-grid { grid-template-columns: 1fr 1fr; }
    .lp-footer-grid  { grid-template-columns: 1fr 1fr; }
  }
  @media (max-width: 768px) {
    .lp-nav {
    top: 0; /* remove the 40px gap on mobile */
    height: 56px;
    padding: 0 16px;
    background: rgba(255,255,255,.97) !important;
    backdrop-filter: blur(12px);
    border-bottom: 0.5px solid #e2e8f0;
  }
  /* Always show on mobile regardless of scroll */
  .lp-nav.scrolled,
  .lp-nav:not(.scrolled) {
    background: rgba(255,255,255,.97) !important;
    box-shadow: none;
  }
    .lp-nav-links, .lp-nav-ctas { display: none; }
    .lp-hamburger { display: block; }
    .lp-stats-inner { grid-template-columns: repeat(2,1fr); }
    .lp-stat { border-bottom: 1px solid rgba(253,246,236,.07); }
    .lp-features-grid { grid-template-columns: 1fr 1fr; }
    .lp-pricing-grid { grid-template-columns: 1fr; max-width: 420px; }
    .lp-testimonials-grid { grid-template-columns: 1fr; }
    .lp-footer-grid { grid-template-columns: 1fr; gap: 32px; }
    .lp-footer-bottom { flex-direction: column; gap: 8px; text-align: center; }
  }
  @media (max-width: 560px) {
    .lp-features-grid { grid-template-columns: 1fr; }
    .lp-stats-inner { grid-template-columns: 1fr 1fr; }
  }
`;

/* ─── Component ──────────────────────────────────────────────────────────── */
const LandingPage = () => {
  const { isOpen, intent, open, close } = useIndustryPicker();
  const navigate = useNavigate();
  const {
    currencyCode,
    exchangeRate,
    countryName,
    loading: currencyLoading,
  } = useCurrency();

  const [scrolled, setScrolled] = useState(false);
  const [scrollPct, setScrollPct] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currentWord, setCurrentWord] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [visible, setVisible] = useState({});
  const [cardsSwapped, setCardsSwapped] = useState(false);
  const words = ["Smarter", "Faster", "Simpler", "Powerful", "Professional"];
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
      word: "Professional",
      sub: "Beautiful templates for every industry — billing, healthcare, education, construction and more.",
    },
  ];
  const localPrice = (usd) => {
    if (currencyLoading) return null;
    if (usd === 0) return "Free";
    return formatPrice(usd, exchangeRate, currencyCode);
  };
const [activeTab, setActiveTab] = useState('home');

// scroll helpers
const scrollTo = (id) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
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
        widget.setAttribute("base-bg-color", "#aae6e1");
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
      const gridColor = "rgba(0,0,0,0.06)";
      const tickColor = "rgba(0,0,0,0.45)";

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
        <title>SolidFlo — Invoicing Made Smarter</title>
      </Helmet>
      <div className="lp">
        <style>{css}</style>

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
                <Sparkles size={12} />
                Trusted by 10,000+ businesses worldwide
              </div>

              <h1>
                Business Management
                <br />
                Made <em key={currentWord}>{ROTATING[currentWord].word}</em>
              </h1>

              <p className="lp-hero-sub">{ROTATING[currentWord].sub}</p>

              <div className="lp-hero-ctas">
                <button className="lp-btn-primary" onClick={() => open("register")}>
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
              <div className="lp-hero-screen">
                <div className="lp-hero-screen-frame">
                  <img
                    key={currentSlide}
                    src={slides[currentSlide].src}
                    alt={slides[currentSlide].alt}
                  />
                </div>
                <div className="lp-slide-dots">
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      className={`lp-slide-dot${i === currentSlide ? " active" : ""}`}
                      onClick={() => setCurrentSlide(i)}
                    />
                  ))}
                </div>
              </div>
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
          <div id="vapi-widget-container" />
      </div>
{/* Bottom Nav */}
<nav className="lp-bottom-nav">
  {[
    { id: 'home',         label: 'Home',      icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>, action: () => window.scrollTo({top:0,behavior:'smooth'}) },
    { id: 'features',     label: 'Features',  icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>, action: () => scrollTo('features') },
    { id: 'market',       label: 'Market',    icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6M17 13l1.5 6M9 19h6"/></svg>, action: () => scrollTo('pricing') },
    { id: 'faq',          label: 'FAQ',       icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>, action: () => scrollTo('faq') },
    { id: 'start',        label: 'Start',     icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>, action: () => open('register') },
  ].map(tab => (
    <button
      key={tab.id}
      className={`lp-bottom-tab${activeTab === tab.id ? ' active' : ''}`}
      onClick={() => { setActiveTab(tab.id); tab.action(); }}
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
