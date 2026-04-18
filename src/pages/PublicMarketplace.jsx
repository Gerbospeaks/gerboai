import { useState, useCallback, useEffect, useRef } from "react";
import heroBg from "../assets/videos/market.mp4";
import logo from "../assets/img/solidflo.png";
import BookingPanel from "../components/BookingPanel";
// ── Config ────────────────────────────────────────────────────────────────────
import { useProviders }        from "../hooks/useProviders";
import { sendBookingRequest }  from "../hooks/useBookingRequests";
import { useAuth }             from "../contexts/AuthContext"; 
const SOLIDFLO_URL = "https://solidflo.co.za";

// ── CSS (mirrors LandingPage token system exactly) ────────────────────────────

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,700&family=Lato:wght@300;400;600;700;900&display=swap');

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

  .mp * { box-sizing: border-box; }
  .mp {
    font-family: 'Lato', sans-serif;
    color: var(--text);
    overflow-x: hidden;
    background: var(--cream);
  }
  .mp h1, .mp h2, .mp h3 { font-family: 'Playfair Display', serif; }

  /* ── Scroll progress ── */
  .mp-progress {
    position: fixed; top: 0; left: 0; height: 3px; z-index: 200;
    background: linear-gradient(90deg, var(--red), #818cf8);
    transition: width .1s linear;
    pointer-events: none;
  }

  /* ════════════════════════════════════
     NAV
  ════════════════════════════════════ */
  .mp-nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    height: 64px;
    display: flex; align-items: center;
    padding: 0 40px;
    transition: background .25s, box-shadow .25s;
  }
  .mp-nav.scrolled {
    background: rgba(15,23,42,.97);
    backdrop-filter: blur(12px);
    box-shadow: 0 2px 20px rgba(0,0,0,.25);
  }
  .mp-nav-inner {
    max-width: 1200px; width: 100%; margin: 0 auto;
    display: flex; align-items: center; justify-content: space-between;
  }
  .mp-nav-logo {
    display: flex; align-items: center;
  }
 
  .mp-nav-ctas { display: flex; align-items: center; gap: 10px; }
  .mp-btn-ghost {
    height: 36px; padding: 0 18px;
    background: rgba(255,255,255,.08);
    border: 1px solid rgba(255,255,255,.15);
    color: rgba(255,255,255,.8); border-radius: 3px;
    font-size: 12px; font-weight: 700; cursor: pointer;
    font-family: 'Lato', sans-serif; letter-spacing: .04em;
    transition: all .15s;
  }
  .mp-btn-ghost:hover { background: rgba(255,255,255,.16); color: #fff; }
  .mp-btn-primary {
    height: 36px; padding: 0 20px;
    background: var(--red); color: #fff;
    border: none; border-radius: 3px;
    font-size: 12px; font-weight: 700; cursor: pointer;
    font-family: 'Lato', sans-serif; letter-spacing: .04em;
    display: flex; align-items: center; gap: 6px;
    transition: background .15s, transform .15s;
  }
  .mp-btn-primary:hover { background: var(--red-hover); transform: translateY(-1px); }

  /* Hide "Post a Request" text on mobile, show "Post" */
  .mp-btn-primary-full { display: inline; }
  .mp-btn-primary-short { display: none; }

  @media (max-width: 640px) {
    .mp-btn-primary-full { display: none; }
    .mp-btn-primary-short { display: inline; }
    .mp-nav { padding: 0 16px; }
  }

  /* ════════════════════════════════════
     HERO
  ════════════════════════════════════ */
  .mp-hero {
    min-height: 100vh;
    display: flex; align-items: center;
    padding: 120px 40px 100px;
    position: relative; overflow: hidden;
    background: var(--navy);
  }
  .mp-hero-video {
    position: absolute; inset: 0;
    width: 100%; height: 100%;
    object-fit: cover; object-position: center;
    z-index: 0; pointer-events: none;
    opacity: 1;
  }
  .mp-hero-overlay {
    position: absolute; inset: 0; z-index: 1; pointer-events: none;
    background: #29231fa1;
  }
  .mp-hero-inner {
    max-width: 1200px; width: 100%; margin: 0 auto;
    position: relative; z-index: 2;
    display: grid; grid-template-columns: 1.1fr 1fr;
    align-items: center; gap: 72px;
  }
  .mp-hero-badge {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 6px 16px;
    background: rgba(99,102,241,.12);
    border: 1px solid rgba(99,102,241,.3);
    border-radius: 20px;
    font-size: 11px; font-weight: 700; letter-spacing: .06em;
    text-transform: uppercase; color: #a5b4fc;
    margin-bottom: 28px;
  }
  .mp-hero-badge-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: #4ade80;
    box-shadow: 0 0 8px #4ade80;
  }
  .mp-hero h1 {
    font-size: clamp(2.8rem, 5vw, 4.2rem);
    line-height: 1.06; color: #fff; margin-bottom: 22px;
    animation: mp-up .65s ease both .05s;
  }
  .mp-hero h1 em { font-style: italic; color: var(--red); }
  .mp-hero-sub {
    font-size: 17px; color: rgba(255,255,255,.6);
    line-height: 1.7; max-width: 500px; margin-bottom: 40px;
    animation: mp-up .65s ease both .1s;
  }
  .mp-hero-ctas {
    display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 40px;
    animation: mp-up .65s ease both .15s;
  }
  .mp-hero-primary {
    height: 54px; padding: 0 32px;
    background: var(--red); color: #fff;
    border: none; border-radius: 4px;
    font-family: 'Lato', sans-serif;
    font-size: 14px; font-weight: 700; letter-spacing: .04em;
    text-transform: uppercase;
    display: flex; align-items: center; gap: 8px;
    cursor: pointer; transition: all .15s;
  }
  .mp-hero-primary:hover {
    background: var(--red-hover);
    transform: translateY(-2px);
    box-shadow: 0 8px 28px rgba(99,102,241,.45);
  }
  .mp-hero-secondary {
    height: 54px; padding: 0 28px;
    background: rgba(255,255,255,.08);
    border: 1.5px solid rgba(255,255,255,.2);
    color: rgba(255,255,255,.85); border-radius: 4px;
    font-family: 'Lato', sans-serif;
    font-size: 14px; font-weight: 700; letter-spacing: .04em;
    text-transform: uppercase; cursor: pointer; transition: all .15s;
  }
  .mp-hero-secondary:hover { background: rgba(255,255,255,.15); color: #fff; }
  .mp-hero-trust {
    display: flex; gap: 24px; flex-wrap: wrap;
    font-size: 12px; color: rgba(255,255,255,.45);
    font-weight: 600; letter-spacing: .03em;
    animation: mp-up .65s ease both .2s;
  }
  .mp-hero-trust-item { display: flex; align-items: center; gap: 6px; }
  .mp-hero-trust-check { color: #4ade80; }

  /* hero stats panel */
  .mp-hero-stats {
    background: rgba(255,255,255,.05);
    border: 1px solid rgba(255,255,255,.1);
    border-radius: 12px; padding: 6px;
    display: grid; grid-template-columns: 1fr 1fr; gap: 6px;
    animation: mp-up .7s ease both .25s;
  }
    .mp-hero-slider {
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,.1);
  background: rgba(255,255,255,.04);
  padding: 6px;
  animation: mp-up .7s ease both .25s;
  /* clip the overflow so cards vanish at edges */
  mask-image: linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%);
  height: 420px;
}
.mp-hero-slider-track {
  display: flex;
  flex-direction: column;
  gap: 8px;
  animation: mp-slide-up 18s linear infinite;
}
.mp-hero-slider-track:hover { animation-play-state: paused; }

@keyframes mp-slide-up {
  0%   { transform: translateY(0); }
  100% { transform: translateY(-50%); }
}
/* ── Sidebar Ad ── */
.mp-sidebar-ad {
  margin: 12px 12px 16px;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  transition: box-shadow .2s, transform .2s;
  flex-shrink: 0;
  position: relative;
}
.mp-sidebar-ad:hover {
  box-shadow: 0 4px 20px rgba(99,102,241,.12);
  transform: translateY(-2px);
}

/* Rotation fade animation */
@keyframes mp-ad-fade {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}
.mp-sidebar-ad-slot {
  animation: mp-ad-fade .4s ease both;
}

/* Sponsored label */
.mp-sidebar-ad-tag {
  position: absolute; top: 8px; left: 8px; z-index: 3;
  font-size: 9px; font-weight: 700; letter-spacing: .07em;
  text-transform: uppercase;
  background: rgba(0,0,0,.45);
  color: rgba(255,255,255,.7);
  padding: 2px 7px; border-radius: 3px;
  backdrop-filter: blur(4px);
}

/* Image variant */
.mp-sidebar-ad-image {
  width: 100%;
  aspect-ratio: 6/5;      /* displays at ~376×313px from 300×250 source */
  object-fit: cover;
  display: block;
}
.mp-sidebar-ad-caption {
  padding: 10px 12px 12px;
  background: #fff;
  border-top: 1px solid #f1f5f9;
}
.mp-sidebar-ad-caption strong {
  font-size: 12px; color: #0f172a;
  display: block; margin-bottom: 2px; font-weight: 700;
}
.mp-sidebar-ad-caption span {
  font-size: 11px; color: #94a3b8; line-height: 1.4;
}

/* Branded card variant (no image) */
.mp-sidebar-ad-branded {
  padding: 18px 16px 16px;
  position: relative; overflow: hidden;
  min-height: 140px;
  display: flex; flex-direction: column; justify-content: flex-end;
}
.mp-sidebar-ad-branded::before {
  content: '';
  position: absolute; top: -30px; right: -30px;
  width: 110px; height: 110px; border-radius: 50%;
  background: rgba(255,255,255,.07);
}
.mp-sidebar-ad-branded-headline {
  font-size: 13px; font-weight: 700; color: #fff;
  line-height: 1.35; margin-bottom: 5px;
  position: relative; z-index: 1;
}
.mp-sidebar-ad-branded-sub {
  font-size: 11px; color: rgba(255,255,255,.55);
  line-height: 1.5; margin-bottom: 14px;
  position: relative; z-index: 1;
}
.mp-sidebar-ad-branded-btn {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 11px; font-weight: 700; letter-spacing: .04em;
  text-transform: uppercase;
  background: var(--red); color: #fff;
  border: none; border-radius: 4px;
  padding: 6px 12px; cursor: pointer;
  transition: background .15s;
  font-family: 'Lato', sans-serif;
  width: fit-content;
  position: relative; z-index: 1;
}
.mp-sidebar-ad-branded-btn:hover { background: var(--red-hover); }

/* Dot indicators */
.mp-sidebar-ad-dots {
  display: flex; justify-content: center;
  gap: 5px; padding: 8px 0 4px;
}
.mp-sidebar-ad-dot {
  width: 5px; height: 5px; border-radius: 50%;
  background: #e2e8f0; border: none; padding: 0; cursor: pointer;
  transition: background .2s, transform .2s;
}
.mp-sidebar-ad-dot.active {
  background: var(--red);
  transform: scale(1.3);
}
.mp-hero-mini-card {
  background: rgba(255,255,255,.07);
  border: 1px solid rgba(255,255,255,.1);
  border-radius: 8px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
  transition: background .2s, border-color .2s;
  cursor: default;
}
.mp-hero-mini-card:hover {
  background: rgba(255,255,255,.12);
  border-color: rgba(99,102,241,.4);
}
.mp-hero-mini-avatar {
  width: 40px; height: 40px;
  border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700;
  flex-shrink: 0;
}
.mp-hero-mini-info { flex: 1; min-width: 0; }
.mp-hero-mini-name {
  font-size: 13px; font-weight: 700; color: #fff;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  margin-bottom: 3px;
}
.mp-hero-mini-meta {
  font-size: 11px; color: rgba(255,255,255,.45);
}
.mp-hero-mini-right {
  display: flex; flex-direction: column;
  align-items: flex-end; gap: 4px; flex-shrink: 0;
}
.mp-hero-mini-rate {
  font-size: 12px; font-weight: 700; color: #fff;
}
.mp-hero-mini-avail {
  display: flex; align-items: center; gap: 4px;
  font-size: 10px; font-weight: 700; color: #4ade80;
}
.mp-hero-mini-avail-dot {
  width: 5px; height: 5px; border-radius: 50%;
  background: #4ade80; box-shadow: 0 0 6px #4ade80;
}
.mp-hero-mini-unavail {
  font-size: 10px; font-weight: 700; color: rgba(255,255,255,.3);
}
.mp-hero-mini-star {
  font-size: 10px; color: #f59e0b;
}
  .mp-hero-stat {
    background: rgba(255,255,255,.06);
    border-radius: 8px; padding: 24px 20px;
    display: flex; flex-direction: column; gap: 6px;
  }
  .mp-hero-stat-icon { font-size: 24px; }
  .mp-hero-stat-val {
    font-family: 'Playfair Display', serif;
    font-size: 36px; font-weight: 700; color: #fff; line-height: 1;
  }
  .mp-hero-stat-lbl {
    font-size: 10px; font-weight: 700; letter-spacing: .07em;
    text-transform: uppercase; color: rgba(255,255,255,.35);
  }

  /* ════════════════════════════════════
     FILTER BAR
  ════════════════════════════════════ */

  /* ════════════════════════════════════
     CONTENT AREA
  ════════════════════════════════════ */

/* ════════════════════════════════════
   SIDEBAR LAYOUT
════════════════════════════════════ */
.mp-layout {
  display: grid;
  grid-template-columns: 400px 1fr;
  align-items: start;
  width: 100%;
  margin: 0 auto;
  padding: 20px 20px 20px;
  gap: 28px;
}

/* ── Sidebar ── */
.mp-sidebar {
  position: sticky;
  top: 80px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 1px 8px rgba(15,23,42,.06);
}
.mp-sidebar::before {
  content: '';
  position: absolute; top: 0; left: 0; right: 0; height: 3px;
  background: linear-gradient(90deg, var(--red), #818cf8, #0ea5e9);
}
.mp-sidebar-header {
  padding: 20px 16px 14px;
  border-bottom: 1px solid #f1f5f9;
}
.mp-sidebar-title {
  font-size: 10px; font-weight: 700; letter-spacing: .1em;
  text-transform: uppercase; color: #94a3b8;
  margin-bottom: 12px;
}
.mp-sidebar-search {
  display: flex; align-items: center; gap: 8px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 8px 12px;
  transition: border-color .15s, box-shadow .15s;
}
.mp-sidebar-search:focus-within {
  border-color: rgba(99,102,241,.4);
  box-shadow: 0 0 0 3px rgba(99,102,241,.08);
}
.mp-sidebar-search-icon { color: #cbd5e1; font-size: 14px; flex-shrink: 0; }
.mp-sidebar-search-input {
  background: none; border: none; outline: none;
  font-family: 'Lato', sans-serif;
  font-size: 12px; color: #0f172a; width: 100%;
}
.mp-sidebar-search-input::placeholder { color: #cbd5e1; }

.mp-sidebar-list {
  padding: 6px 0;
  max-height: 100vh ;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #e2e8f0 transparent;
}
.mp-sidebar-list::-webkit-scrollbar { width: 3px; }
.mp-sidebar-list::-webkit-scrollbar-track { background: transparent; }
.mp-sidebar-list::-webkit-scrollbar-thumb {
  background: #e2e8f0; border-radius: 2px;
}

.mp-sidebar-item {
  display: flex; align-items: center;
  padding: 8px 16px; gap: 10px;
  cursor: pointer;
  transition: background .13s;
  border-left: 2px solid transparent;
  position: relative;
}
.mp-sidebar-item:hover { background: #f8fafc; }
.mp-sidebar-item.active {
  background: var(--red-light);
  border-left-color: var(--red);
}
.mp-sidebar-item-emoji { font-size: 14px; line-height: 1; flex-shrink: 0; }
.mp-sidebar-item-label {
  font-size: 12px; font-weight: 600;
  color: #64748b;
  flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  transition: color .13s;
}
.mp-sidebar-item:hover .mp-sidebar-item-label { color: #0f172a; }
.mp-sidebar-item.active .mp-sidebar-item-label { color: var(--red); font-weight: 700; }
.mp-sidebar-item-count {
  font-size: 10px; font-weight: 700;
  color: #94a3b8;
  background: #f1f5f9;
  border-radius: 10px;
  padding: 2px 7px;
  flex-shrink: 0;
  transition: background .13s, color .13s;
}
.mp-sidebar-item.active .mp-sidebar-item-count {
  background: rgba(99,102,241,.12);
  color: var(--red);
}
.mp-sidebar-divider {
  height: 1px; background: #f1f5f9;
  margin: 4px 0;
}

/* ── Main content (right of sidebar) ── */
.mp-main { min-width: 0; }

/* ════════════════════════════════════
   MOBILE SIDEBAR DRAWER
════════════════════════════════════ */

/* Floating filter button — mobile only */
.mp-filter-fab {
  display: none;
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 150;
  background: var(--navy);
  color: #fff;
  border: none;
  border-radius: 28px;
  height: 48px;
  padding: 0 22px;
  font-family: 'Lato', sans-serif;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: .04em;
  cursor: pointer;
  display: none;
  align-items: center;
  gap: 8px;
  box-shadow: 0 6px 24px rgba(15,23,42,.3);
  transition: background .15s, transform .15s, box-shadow .15s;
}
.mp-filter-fab:hover {
  background: var(--red);
  transform: translateX(-50%) translateY(-2px);
  box-shadow: 0 10px 28px rgba(99,102,241,.4);
}
.mp-filter-fab-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: #4ade80;
  box-shadow: 0 0 6px #4ade80;
  flex-shrink: 0;
}

/* Drawer overlay */
.mp-drawer-overlay {
  display: none;
  position: fixed; inset: 0; z-index: 300;
  background: rgba(15,23,42,.55);
  backdrop-filter: blur(4px);
  opacity: 0;
  transition: opacity .25s;
}
.mp-drawer-overlay.open {
  opacity: 1;
}

/* Drawer panel */
.mp-drawer {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  z-index: 301;
  background: #fff;
  border-radius: 20px 20px 0 0;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  transform: translateY(100%);
  transition: transform .3s cubic-bezier(.32,.72,0,1);
  box-shadow: 0 -8px 40px rgba(15,23,42,.18);
  overflow: hidden;
}
.mp-drawer.open {
  transform: translateY(0);
}
.mp-drawer-handle {
  width: 36px; height: 4px; border-radius: 2px;
  background: #e2e8f0;
  margin: 12px auto 0;
  flex-shrink: 0;
}
.mp-drawer-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 20px 12px;
  border-bottom: 1px solid #f1f5f9;
  flex-shrink: 0;
}
.mp-drawer-header-title {
  font-size: 14px; font-weight: 700; color: #0f172a; letter-spacing: -.01em;
}
.mp-drawer-close {
  width: 28px; height: 28px; border-radius: 50%;
  background: #f1f5f9; border: none;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; color: #64748b; cursor: pointer;
  transition: background .15s;
}
.mp-drawer-close:hover { background: #e2e8f0; }
.mp-drawer-search {
  padding: 12px 16px;
  border-bottom: 1px solid #f1f5f9;
  flex-shrink: 0;
}
.mp-drawer-search-inner {
  display: flex; align-items: center; gap: 8px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 9px 12px;
}
.mp-drawer-search-inner:focus-within {
  border-color: rgba(99,102,241,.4);
  box-shadow: 0 0 0 3px rgba(99,102,241,.08);
}
.mp-drawer-search-icon { color: #cbd5e1; font-size: 14px; flex-shrink: 0; }
.mp-drawer-search-input {
  background: none; border: none; outline: none;
  font-family: 'Lato', sans-serif;
  font-size: 13px; color: #0f172a; width: 100%;
}
.mp-drawer-search-input::placeholder { color: #cbd5e1; }
.mp-drawer-list {
  overflow-y: auto;
  flex: 1;
  padding: 6px 0 24px;
  scrollbar-width: thin;
  scrollbar-color: #e2e8f0 transparent;
}
/* Drawer items reuse sidebar item styles */
.mp-drawer-item {
  display: flex; align-items: center;
  padding: 11px 20px; gap: 12px;
  cursor: pointer;
  transition: background .13s;
  border-left: 3px solid transparent;
}
.mp-drawer-item:hover { background: #f8fafc; }
.mp-drawer-item.active {
  background: var(--red-light);
  border-left-color: var(--red);
}
.mp-drawer-item-emoji { font-size: 16px; line-height: 1; flex-shrink: 0; }
.mp-drawer-item-label {
  font-size: 13px; font-weight: 600;
  color: #64748b;
  flex: 1;
  transition: color .13s;
}
.mp-drawer-item:hover .mp-drawer-item-label { color: #0f172a; }
.mp-drawer-item.active .mp-drawer-item-label { color: var(--red); font-weight: 700; }
.mp-drawer-item-count {
  font-size: 11px; font-weight: 700;
  color: #94a3b8;
  background: #f1f5f9;
  border-radius: 10px;
  padding: 3px 9px;
  flex-shrink: 0;
}
.mp-drawer-item.active .mp-drawer-item-count {
  background: rgba(99,102,241,.12);
  color: var(--red);
}
.mp-drawer-divider {
  height: 1px; background: #f1f5f9; margin: 4px 0;
}

/* ════════════════════════════════════
   RESPONSIVE — sidebar collapses
════════════════════════════════════ */
@media (max-width: 1024px) {
  .mp-layout {
    grid-template-columns: 200px 1fr;
    padding: 28px 24px 60px;
    gap: 20px;
  }
}
@media (max-width: 768px) {
  .mp-layout {
    grid-template-columns: 1fr;
    padding: 24px 20px 80px; /* extra bottom padding for FAB */
  }
  /* Hide the sticky sidebar on mobile */
  .mp-sidebar {
    display: none;
  }
  /* Show FAB and drawer */
  .mp-filter-fab {
    display: flex;
  }
  .mp-drawer-overlay {
    display: block;
  }
}
 .mp-avail-banner {
  background: #012f64;
  border: 1px solid #e2e8f0;
  border-radius: 14px; padding: 24px 32px;
  margin-bottom: 40px;
  display: flex; align-items: center; gap: 20px;
  position: relative; overflow: hidden;
  box-shadow: 0 1px 8px rgba(15,23,42,.06);
}
.mp-avail-banner::before {
  content: '';
  position: absolute; top: 0; left: 0; right: 0; height: 3px;
  background: linear-gradient(90deg, var(--red), #818cf8, #0ea5e9);
}
.mp-avail-dot {
  width: 11px; height: 11px; border-radius: 50%;
  background: #22c55e; flex-shrink: 0;
  box-shadow: 0 0 0 4px rgba(34,197,94,.15);
  animation: mp-live-pulse 2.2s ease-in-out infinite;
}
@keyframes mp-live-pulse {
  0%,100% { box-shadow: 0 0 0 4px rgba(34,197,94,.15); }
  50%      { box-shadow: 0 0 0 8px rgba(34,197,94,.07); }
}
.mp-avail-text {
  font-size: 14px; color: #475569; font-weight: 500; flex: 1; line-height: 1.5;
}
.mp-avail-text strong { color: #0f172a; font-weight: 700; }
.mp-avail-count { margin-left: auto; display: flex; }
.mp-avail-stat {
  text-align: center; padding: 0 24px;
  border-left: 1px solid #e2e8f0;
}
.mp-avail-stat:first-child { border-left: none; }
.mp-avail-num {
  font-family: 'Playfair Display', serif;
  font-size: 36px; font-weight: 700; color: #0f172a; line-height: 1; display: block;
}
.mp-avail-sub {
  font-size: 10px; color: #94a3b8;
  letter-spacing: .07em; text-transform: uppercase; margin-top: 3px; display: block;
}
.mp-avail-dot {
  width: 12px; height: 12px; border-radius: 50%;
  background: #4ade80; flex-shrink: 0;
  box-shadow: 0 0 0 4px rgba(74,222,128,.15), 0 0 16px #4ade80;
  animation: mp-live-pulse 2.2s ease-in-out infinite;
}
 .mp-avail-dot {
  width: 12px; height: 12px; border-radius: 50%;
  background: #4ade80; flex-shrink: 0;
  box-shadow: 0 0 0 4px rgba(74,222,128,.15), 0 0 16px #4ade80;
  animation: mp-live-pulse 2.2s ease-in-out infinite;
}
 @keyframes mp-live-pulse {
  0%,100% { box-shadow: 0 0 0 4px rgba(74,222,128,.15), 0 0 14px #4ade80; }
  50%      { box-shadow: 0 0 0 9px rgba(74,222,128,.06), 0 0 22px #4ade80; }
}
.mp-avail-text {
  font-size: 14px; color: rgba(255,255,255,.6);
  font-weight: 600; line-height: 1.5; flex: 1;
}
.mp-avail-text strong { color: rgba(255,255,255,.9); font-weight: 700; }
.mp-avail-count { margin-left: auto; display: flex; align-items: center; gap: 0; }
.mp-avail-stat {
  text-align: center; padding: 0 28px;
  border-left: 1px solid rgba(255,255,255,.08);
}
.mp-avail-stat:first-child { border-left: none; }
.mp-avail-num {
  font-family: 'Playfair Display', serif;
  font-size: 42px; font-weight: 700; color: #fff; line-height: 1; display: block;
}
.mp-avail-sub {
  font-size: 10px; color: rgba(255,255,255,.3);
  letter-spacing: .08em; text-transform: uppercase; margin-top: 3px; display: block;
}
  /* section title */
  .mp-section-eyebrow {
    display: inline-block; font-size: 10px; font-weight: 700;
    letter-spacing: .1em; text-transform: uppercase;
    color: var(--red); margin-bottom: 10px;
    padding: 4px 12px; background: var(--red-light);
    border: 1px solid rgba(99,102,241,.2); border-radius: 2px;
  }
 .mp-section-title {
  display: flex; align-items: center; gap: 16px;
  margin: 40px 0 24px;
}
.mp-section-title-text {
  font-family: 'Playfair Display', serif;
  font-size: 20px; font-weight: 600; color: #0f172a;
  white-space: nowrap; letter-spacing: -.015em;
}
.mp-section-title-line {
  flex: 1; height: 1px;
  background: linear-gradient(90deg, #e2e8f0 0%, transparent 100%);
}
.mp-section-title-badge {
  font-size: 10px; font-weight: 700; letter-spacing: .07em;
  text-transform: uppercase; color: var(--red);
  background: var(--red-light); border: 1px solid rgba(99,102,241,.18);
  padding: 4px 12px; border-radius: 20px; white-space: nowrap; flex-shrink: 0;
}
  /* ════════════════════════════════════
     PROVIDER CARDS — big grid
  ════════════════════════════════════ */
 .mp-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px; margin-bottom: 8px;
}
.mp-card {
  background: #fff;
  border: 0.7px solid #e8edf3;
  border-radius: 0px;
  padding: 0;
  cursor: pointer;
  display: flex; flex-direction: column;
  transition: box-shadow .22s, transform .22s, border-color .22s;
  opacity: 0; transform: translateY(14px);
  animation: mp-up .4s ease forwards;
  position: relative;
  overflow: hidden;
}
.mp-card::before { display: none; }
.mp-card:hover {
  box-shadow: 0 12px 40px rgba(15,23,42,.11);
  transform: translateY(-4px);
  border-color: #d0d8e4;
}
.mp-card.featured {
  border-color: rgba(236, 236, 236, 0.4);
  border-width: 1.5px;
  box-shadow: 0 2px 18px rgba(99,102,241,.09);
}

/* ── Image banner at top of card ── */
.mp-card-banner {
  width: 100%;
  height: 180px;
  display: flex; align-items: center; justify-content: center;
  position: relative;
  overflow: hidden;
  border-radius: 16px 16px 0 0;
  flex-shrink: 0;
}
.mp-card-banner-initials {
  font-size: 48px; font-weight: 900;
  letter-spacing: -.03em;
  opacity: .18;
  position: absolute;
  user-select: none;
  font-family: 'Playfair Display', serif;
}
.mp-card-banner-icon {
  font-size: 52px;
  position: relative; z-index: 1;
  filter: drop-shadow(0 4px 12px rgba(0,0,0,.15));
}
.mp-card-featured-badge {
  position: absolute; top: 12px; right: 12px; z-index: 2;
  font-size: 10px; font-weight: 700;
  background: rgba(255,255,255,.92);
  color: var(--red);
  padding: 4px 12px; border-radius: 20px;
  border: 1px solid rgba(99,102,241,.25);
  backdrop-filter: blur(6px);
}
.mp-card-avail-pip {
  position: absolute; top: 12px; left: 12px; z-index: 2;
  display: flex; align-items: center; gap: 5px;
  background: rgba(255,255,255,.92);
  border-radius: 20px; padding: 4px 10px;
  font-size: 10px; font-weight: 700; color: #16a34a;
  backdrop-filter: blur(6px);
}
.mp-card-avail-pip-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: #4ade80;
  box-shadow: 0 0 6px #4ade80;
}

/* ── Card body ── */
.mp-card-body {
  padding: 18px 20px 20px;
  display: flex; flex-direction: column; gap: 10px;
  flex: 1;
}

/* Name row: bold name + rate badge */
.mp-card-title-row {
  display: flex; align-items: flex-start; justify-content: space-between; gap: 8px;
}
.mp-card-name {
  font-size: 16px; font-weight: 800; color: #0f172a;
  line-height: 1.25; letter-spacing: -.02em;
  font-family: 'Playfair Display', serif;
}
.mp-card-rate {
  font-size: 11px; font-weight: 700;
  color: var(--red);
  background: var(--red-light);
  border: 1px solid rgba(99,102,241,.18);
  padding: 3px 10px; border-radius: 20px;
  white-space: nowrap; flex-shrink: 0;
}
.mp-card-meta { font-size: 12px; color: #94a3b8; margin-top: -4px; }
.mp-card-about {
  font-size: 13px; color: #64748b; line-height: 1.6;
}
.mp-card-badges { display: flex; gap: 5px; flex-wrap: wrap; }
.mp-badge {
  font-size: 10px; font-weight: 700;
  padding: 3px 9px; border-radius: 20px; border: 1px solid transparent;
}
.mp-badge-green  { background: #f0fdf4; color: #16a34a; border-color: #bbf7d0; }
.mp-badge-blue   { background: #eff6ff; color: #2563eb; border-color: #bfdbfe; }
.mp-badge-amber  { background: #fffbeb; color: #d97706; border-color: #fde68a; }
.mp-badge-purple { background: #f5f3ff; color: #7c3aed; border-color: #ddd6fe; }
.mp-card-stats { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.mp-card-stat { font-size: 12px; color: #94a3b8; }
.mp-card-unavail { font-size: 11px; color: #ef4444; font-weight: 700; }

/* ── "Shop Now" style link button ── */
.mp-card-footer {
  padding: 0 20px 18px;
  display: flex; align-items: center; justify-content: flex-end;
  border-top: 1px solid #f1f5f9;
  margin-top: auto;
  padding-top: 14px;
}
.mp-card-btn {
  background: none; border: none; padding: 0;
  font-family: 'Lato', sans-serif; font-size: 13px;
  font-weight: 800; letter-spacing: .01em;
  cursor: pointer; transition: gap .18s, color .18s;
  display: flex; align-items: center; gap: 6px;
  text-transform: none;
}
.mp-card-btn-avail {
  color: var(--red);
}
.mp-card-btn-avail:hover {
  color: var(--red-hover);
  gap: 10px;
}
.mp-card-btn-avail .mp-card-btn-arrow {
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 15px;
  transition: transform .18s;
}
.mp-card-btn-avail:hover .mp-card-btn-arrow {
  transform: translateX(3px);
}
.mp-card-btn-unavail {
  color: #cbd5e1;
  cursor: not-allowed;
  font-size: 12px; font-weight: 600;
}
  /* ════════════════════════════════════
     STATS STRIP (below hero)
  ════════════════════════════════════ */
  .mp-stats {
    background: var(--navy); padding: 56px 24px;
  }
  .mp-stats-inner {
    max-width: 1000px; margin: 0 auto;
    display: grid; grid-template-columns: repeat(4,1fr); gap: 0;
  }
  .mp-stat-cell {
    text-align: center; padding: 20px 24px;
    border-right: 1px solid rgba(255,255,255,.07);
    opacity: 0; transform: translateY(20px);
    transition: opacity .5s ease, transform .5s ease;
  }
  .mp-stat-cell.visible { opacity: 1; transform: translateY(0); }
  .mp-stat-cell:last-child { border-right: none; }
  .mp-stat-cell-icon {
    width: 40px; height: 40px; border-radius: 4px;
    background: rgba(99,102,241,.12);
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 12px; color: var(--red); font-size: 18px;
  }
  .mp-stat-cell-val {
    font-family: 'Playfair Display', serif;
    font-size: 36px; font-weight: 700; color: #fff; line-height: 1; margin-bottom: 6px;
  }
  .mp-stat-cell-lbl {
    font-size: 11px; font-weight: 700; letter-spacing: .07em;
    text-transform: uppercase; color: rgba(255,255,255,.35);
  }

  /* ════════════════════════════════════
     BOTTOM CTA SECTION
  ════════════════════════════════════ */
.mp-cta {
  background: #0f172a;
  border-radius: 14px; padding: 72px 48px; margin-top: 64px;
  text-align: center; position: relative; overflow: hidden;
}
.mp-cta::before {
  content: '';
  position: absolute; inset: 0; pointer-events: none;
  background:
    radial-gradient(ellipse 60% 80% at 15% 50%, rgba(99,102,241,.22) 0%, transparent 60%),
    radial-gradient(ellipse 40% 60% at 85% 25%, rgba(14,165,233,.12) 0%, transparent 55%);
}
.mp-cta::after {
  content: '';
  position: absolute; top: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(99,102,241,.6), rgba(14,165,233,.4), transparent);
}
.mp-cta-inner { position: relative; z-index: 1; }
.mp-cta-tag {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 5px 16px; border-radius: 20px; margin-bottom: 20px;
  background: rgba(99,102,241,.15); border: 1px solid rgba(99,102,241,.3);
  font-size: 10px; font-weight: 700; letter-spacing: .08em;
  text-transform: uppercase; color: #a5b4fc;
}
.mp-cta h2 {
  font-size: clamp(1.9rem, 3vw, 2.8rem); color: #fff; margin-bottom: 14px; line-height: 1.12;
}
.mp-cta h2 em { font-style: italic; color: #818cf8; }
.mp-cta p {
  font-size: 15px; color: rgba(255,255,255,.5);
  max-width: 480px; margin: 0 auto 40px; line-height: 1.75;
}
.mp-cta-btns { display: flex; align-items: center; justify-content: center; gap: 12px; flex-wrap: wrap; }
.mp-cta-primary {
  height: 52px; padding: 0 32px;
  background: var(--red); color: #fff; border: none; border-radius: 6px;
  font-family: 'Lato', sans-serif; font-size: 13px; font-weight: 700;
  letter-spacing: .05em; text-transform: uppercase;
  display: flex; align-items: center; gap: 8px; cursor: pointer;
  transition: all .18s;
}
.mp-cta-primary:hover {
  background: var(--red-hover); transform: translateY(-2px);
  box-shadow: 0 8px 28px rgba(99,102,241,.4);
}
.mp-cta-secondary {
  height: 52px; padding: 0 28px;
  background: rgba(255,255,255,.07);
  color: rgba(255,255,255,.7);
  border: 1px solid rgba(255,255,255,.15); border-radius: 6px;
  font-family: 'Lato', sans-serif; font-size: 13px; font-weight: 700;
  letter-spacing: .05em; text-transform: uppercase; cursor: pointer;
  transition: all .18s;
}
.mp-cta-secondary:hover { background: rgba(255,255,255,.13); color: #fff; }
.mp-cta-perks {
  display: flex; align-items: center; justify-content: center;
  gap: 24px; margin-top: 28px; flex-wrap: wrap;
}
.mp-cta-perk {
  display: flex; align-items: center; gap: 6px;
  font-size: 12px; color: rgba(255,255,255,.3);
  font-weight: 600; letter-spacing: .02em;
}
.mp-cta-perk-check { color: #4ade80; }

  /* ════════════════════════════════════
     MODAL
  ════════════════════════════════════ */
 .mp-modal-overlay {
  position: fixed; inset: 0;
  background: rgba(15,23,42,.6);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; padding: 20px;
  backdrop-filter: blur(8px);
}
.mp-modal {
  background: #fff;
  border-radius: 16px;
  width: 100%; max-width: 680px;
  display: grid; grid-template-columns: 220px 1fr;
  overflow: hidden;
  box-shadow: 0 32px 80px rgba(15,23,42,.25);
  position: relative;
  animation: mp-up .3s ease;
}
.mp-modal-close {
  position: absolute; top: 14px; right: 16px; z-index: 10;
  background: rgba(255,255,255,.15); border: 1px solid rgba(255,255,255,.2);
  width: 28px; height: 28px; border-radius: 50%;
  font-size: 12px; color: #fff; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background .15s;
  line-height: 1;
}
.mp-modal-close:hover { background: rgba(255,255,255,.25); }

/* ── Left panel ── */
.mp-modal-left {
  background: linear-gradient(160deg, #1e1b4b 0%, #312e81 45%, #1e3a5f 100%);
  padding: 32px 20px 28px;
  display: flex; flex-direction: column;
  align-items: flex-start; gap: 0;
  position: relative; overflow: hidden;
}
.mp-modal-left::before {
  content: '';
  position: absolute; bottom: -40px; right: -40px;
  width: 160px; height: 160px; border-radius: 50%;
  background: rgba(99,102,241,.2);
}
.mp-modal-left::after {
  content: '';
  position: absolute; top: -20px; left: -20px;
  width: 100px; height: 100px; border-radius: 50%;
  background: rgba(14,165,233,.12);
}
.mp-modal-left-logo {
  position: relative; z-index: 1; margin-bottom: 28px;
}
.mp-modal-trust {
  position: relative; z-index: 1; margin-bottom: auto;
}
.mp-modal-trust-stars {
  display: flex; gap: 3px; margin-bottom: 6px;
}
.mp-modal-trust-star {
  width: 20px; height: 20px; border-radius: 3px;
  background: #22c55e;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; color: #fff;
}
.mp-modal-trust-score {
  font-size: 12px; color: rgba(255,255,255,.6);
  font-weight: 600; line-height: 1.5;
}
.mp-modal-trust-score strong { color: #fff; }

/* illustration */
.mp-modal-illustration {
  position: relative; z-index: 1;
  width: 100%; margin-top: 24px;
  display: flex; align-items: flex-end; justify-content: center;
  gap: 0;
}
.mp-modal-illus-circle {
  width: 90px; height: 90px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 36px;
  position: relative;
}
.mp-modal-illus-circle-a {
  background: rgba(255,255,255,.12);
  border: 2px solid rgba(255,255,255,.2);
  z-index: 2;
}
.mp-modal-illus-circle-b {
  background: rgba(99,102,241,.25);
  border: 2px solid rgba(99,102,241,.35);
  margin-left: -20px; z-index: 1;
}
.mp-modal-illus-rays {
  position: absolute; inset: -8px;
  background: conic-gradient(
    from 0deg,
    transparent 0deg, rgba(255,193,7,.35) 10deg, transparent 20deg,
    transparent 40deg, rgba(255,193,7,.35) 50deg, transparent 60deg,
    transparent 80deg, rgba(255,193,7,.35) 90deg, transparent 100deg,
    transparent 120deg, rgba(255,193,7,.35) 130deg, transparent 140deg,
    transparent 160deg, rgba(255,193,7,.35) 170deg, transparent 180deg,
    transparent 200deg, rgba(255,193,7,.35) 210deg, transparent 220deg,
    transparent 240deg, rgba(255,193,7,.35) 250deg, transparent 260deg,
    transparent 280deg, rgba(255,193,7,.35) 290deg, transparent 300deg,
    transparent 320deg, rgba(255,193,7,.35) 330deg, transparent 340deg,
    transparent 360deg
  );
  border-radius: 50%;
  animation: mp-spin 12s linear infinite;
}
@keyframes mp-spin { to { transform: rotate(360deg); } }

/* ── Right panel ── */
.mp-modal-right {
  padding: 36px 32px 28px;
  display: flex; flex-direction: column; gap: 0;
}
.mp-modal-right h2 {
  font-size: 22px; color: #0f172a; margin-bottom: 10px; line-height: 1.2;
}
.mp-modal-sub {
  font-size: 13px; color: #64748b; line-height: 1.65; margin-bottom: 22px;
}
.mp-modal-features {
  margin-bottom: 24px; display: flex; flex-direction: column; gap: 10px;
}
.mp-modal-feature {
  display: flex; align-items: flex-start; gap: 10px;
  font-size: 13px; color: #334155; line-height: 1.4;
}
.mp-modal-feature-check {
  width: 18px; height: 18px; border-radius: 50%;
  background: #f0fdf4; border: 1px solid #bbf7d0;
  color: #16a34a; font-size: 10px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; margin-top: 1px;
}
.mp-modal-cta {
  width: 100%; height: 48px;
  background: var(--red); color: #fff;
  border: none; border-radius: 8px;
  font-family: 'Lato', sans-serif; font-size: 13px; font-weight: 700;
  letter-spacing: .04em; text-transform: uppercase;
  cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
  transition: all .18s; margin-bottom: 14px;
}
.mp-modal-cta:hover {
  background: var(--red-hover); transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(99,102,241,.35);
}
.mp-modal-switch {
  text-align: center; font-size: 12px; color: #94a3b8;
}
.mp-modal-switch-link {
  color: var(--red); font-weight: 700; cursor: pointer;
}
.mp-modal-switch-link:hover { text-decoration: underline; }
.mp-modal-footnote {
  text-align: center; font-size: 11px; color: #cbd5e1; margin-top: 8px;
}

/* responsive — stack on mobile */
@media (max-width: 600px) {
  .mp-modal { grid-template-columns: 1fr; max-width: 380px; }
  .mp-modal-left { padding: 28px 24px 24px; flex-direction: row; flex-wrap: wrap; gap: 16px; }
  .mp-modal-illustration { display: none; }
  .mp-modal-close { color: #fff; }
}

  /* ════════════════════════════════════
     FOOTER
  ════════════════════════════════════ */
 .mp-footer {
  background: var(--navy);
  border-top: 1px solid rgba(255,255,255,.06);
}
.mp-footer-upper {
  max-width: 1200px; margin: 0 auto;
  padding: 48px 40px 36px;
  display: flex; align-items: flex-start; justify-content: space-between;
  gap: 40px; flex-wrap: wrap;
}
.mp-footer-brand { display: flex; flex-direction: column; gap: 10px; max-width: 280px; }
.mp-footer-tagline {
  font-size: 13px; color: rgba(255,255,255,.3); line-height: 1.65;
}
.mp-footer-links-group {
  display: flex; flex-direction: column; gap: 10px;
}
.mp-footer-links-label {
  font-size: 10px; font-weight: 700; letter-spacing: .08em;
  text-transform: uppercase; color: rgba(255,255,255,.25); margin-bottom: 4px;
}
.mp-footer-link {
  font-size: 13px; color: rgba(255,255,255,.4);
  text-decoration: none; transition: color .15s; cursor: pointer;
}
.mp-footer-link:hover { color: rgba(255,255,255,.85); }
.mp-footer-lower {
  border-top: 1px solid rgba(255,255,255,.05);
  padding: 20px 40px;
  max-width: 1200px; margin: 0 auto;
  display: flex; align-items: center; justify-content: space-between;
  flex-wrap: wrap; gap: 12px;
}
.mp-footer-copy { font-size: 12px; color: rgba(255,255,255,.2); letter-spacing: .02em; }
.mp-footer-legal { display: flex; gap: 20px; }
.mp-footer-legal a {
  font-size: 12px; color: rgba(255,255,255,.2);
  text-decoration: none; transition: color .15s;
}
.mp-footer-legal a:hover { color: rgba(255,255,255,.55); }

/* ── Ad sizing by breakpoint ── */
.mp-ad-sidebar {
  width: 300px;
  height: 250px;
  overflow: hidden;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  transition: box-shadow .2s, transform .2s;
  position: relative;
  flex-shrink: 0;
  margin: 12px auto 16px;
  display: block;
}
.mp-ad-sidebar:hover {
  box-shadow: 0 4px 20px rgba(99,102,241,.12);
  transform: translateY(-2px);
}
.mp-ad-sidebar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.mp-ad-sidebar-caption {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  padding: 8px 12px 10px;
  background: linear-gradient(to top, rgba(15,23,42,.85), transparent);
  color: #fff;
}
.mp-ad-sidebar-caption strong {
  font-size: 12px; display: block; margin-bottom: 1px; font-weight: 700;
}
.mp-ad-sidebar-caption span {
  font-size: 10px; color: rgba(255,255,255,.6);
}

/* Leaderboard — 728×90 desktop */
.mp-ad-banner {
  width: 728px;
  height: 90px;
  max-width: 100%;
  overflow: hidden;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  position: relative;
  margin: 0 0 20px;
  transition: box-shadow .2s, transform .2s;
  display: flex;
  align-items: center;
}
.mp-ad-banner:hover {
  box-shadow: 0 4px 20px rgba(99,102,241,.12);
  transform: translateY(-2px);
}
.mp-ad-banner img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.mp-ad-banner-inner {
  display: flex;
  align-items: center;
  width: 100%; height: 100%;
  background: #fff;
}
.mp-ad-banner-img {
  height: 90px;
  width: 120px;
  object-fit: cover;
  flex-shrink: 0;
}
.mp-ad-banner-text {
  flex: 1;
  padding: 0 16px;
}
.mp-ad-banner-text strong {
  font-size: 13px; color: #0f172a;
  display: block; margin-bottom: 2px; font-weight: 700;
}
.mp-ad-banner-text span {
  font-size: 11px; color: #94a3b8;
}
.mp-ad-banner-cta {
  padding: 0 16px;
  flex-shrink: 0;
  font-size: 11px; font-weight: 700;
  color: #fff; background: #6366f1;
  border-radius: 6px;
  height: 34px;
  display: flex; align-items: center;
  margin-right: 12px;
  text-transform: uppercase; letter-spacing: .04em;
  white-space: nowrap;
}

/* Tablet — 468×60 */
@media (max-width: 1024px) {
  .mp-ad-sidebar {
    width: 250px;
    height: 250px;
    margin: 12px auto 16px;
  }
  .mp-ad-banner {
    width: 468px;
    height: 60px;
  }
  .mp-ad-banner-img {
    height: 60px;
    width: 80px;
  }
  .mp-ad-banner-text strong { font-size: 12px; }
  .mp-ad-banner-text span { display: none; }
  .mp-ad-banner-cta {
    height: 28px;
    font-size: 10px;
    padding: 0 12px;
  }
}

/* Mobile — 336×280 Large Rectangle */
@media (max-width: 768px) {
  .mp-ad-banner {
    width: 336px;
    height: 280px;
    max-width: 100%;
    flex-direction: column;
    border-radius: 10px;
    margin: 0 auto 20px;
  }
  .mp-ad-banner-inner {
    flex-direction: column;
    height: 100%;
  }
  .mp-ad-banner-img {
    width: 100%;
    height: 180px;
    object-fit: cover;
  }
  .mp-ad-banner-text {
    padding: 10px 14px 6px;
  }
  .mp-ad-banner-text span { display: block; }
  .mp-ad-banner-cta {
    margin: 0 14px 12px;
    height: 32px;
    width: calc(100% - 28px);
    justify-content: center;
  }
}
  text-align: center; padding: 80px 24px;
}
.mp-empty-icon {
  width: 72px; height: 72px; margin: 0 auto 20px;
  background: #f8fafc; border: 1px solid #e2e8f0;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center; font-size: 28px;
}
.mp-empty-title {
  font-family: 'Playfair Display', serif;
  font-size: 20px; font-weight: 600; color: #0f172a; margin-bottom: 8px;
}
.mp-empty-sub { font-size: 14px; color: #94a3b8; line-height: 1.6; }
  /* ════════════════════════════════════
     ANIMATIONS
  ════════════════════════════════════ */
  @keyframes mp-up {
    from { opacity: 0; transform: translateY(22px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes mp-float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-12px) } }

  /* ════════════════════════════════════
     RESPONSIVE
  ════════════════════════════════════ */
  @media (max-width: 1024px) {
    .mp-grid { grid-template-columns: repeat(2, 1fr); }
    .mp-hero-inner { grid-template-columns: 1fr; }
    .mp-hero-stats { display: none; }
    .mp-stats-inner { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 640px) {
    .mp-grid { grid-template-columns: 1fr; }
    .mp-hero { padding: 100px 24px 80px; }
    .mp-cta { padding: 40px 24px; }
  }
    @media (max-width: 640px) {
  .mp-avail-banner { flex-direction: column; align-items: flex-start; gap: 16px; padding: 24px 20px; }
  .mp-avail-count { width: 100%; }
  .mp-avail-stat { padding: 0 20px 0 0; border-left: none; border-right: 1px solid rgba(255,255,255,.08); }
  .mp-footer-upper { flex-direction: column; gap: 32px; padding: 40px 20px 28px; }
  .mp-footer-lower { padding: 16px 20px; }
  .mp-cta { padding: 48px 24px; }
}
`;

// ── Data ──────────────────────────────────────────────────────────────────────

const INDUSTRIES = [
  { id: "all", label: "All Industries", emoji: "🌐" },
  { id: "mechanics", label: "Mechanical", emoji: "🔧" },
  { id: "electrical", label: "Electrical", emoji: "⚡" },
  { id: "carpentry", label: "Carpentry", emoji: "🪚" },
  { id: "plumbing", label: "Plumbing", emoji: "🚿" },
  { id: "logistics", label: "Logistics", emoji: "🚛" },
  { id: "construction", label: "Construction", emoji: "🏗️" },
  { id: "accounting", label: "Accounting", emoji: "📊" },
  { id: "cleaning", label: "Cleaning", emoji: "🧹" },
  { id: "education", label: "Education", emoji: "🎓" },
  { id: "health", label: "Healthcare", emoji: "🏥" },
  { id: "hotel", label: "Hospitality", emoji: "🏨" },
  { id: "hvac", label: "HVAC", emoji: "❄️" },
  { id: "landscaping", label: "Landscaping", emoji: "🌿" },
  { id: "legal", label: "Legal", emoji: "⚖️" },
  { id: "painting", label: "Painting", emoji: "🎨" },
  { id: "pest-control", label: "Pest Control", emoji: "🐛" },
  { id: "photography", label: "Photography", emoji: "📷" },
  { id: "pool", label: "Pool Services", emoji: "🏊" },
  { id: "realestate", label: "Real Estate", emoji: "🏠" },
  { id: "restaurants", label: "Restaurants", emoji: "🍽️" },
  { id: "retail", label: "Retail", emoji: "🛍️" },
  { id: "security", label: "Security", emoji: "🔒" },
  { id: "solar", label: "Solar", emoji: "☀️" },
  { id: "towing", label: "Towing", emoji: "🚗" },
  { id: "welding", label: "Welding", emoji: "🔥" },
  { id: "flooring", label: "Flooring", emoji: "🪵" },
  { id: "windows", label: "Window Repair", emoji: "🪟" },
];

const PROVIDERS = [
  {
    id: "p1",
    industry: "mechanics",
    name: "Jake's Motor Workshop",
    loc: "Randburg, JHB",
    rate: "R450/hr",
    rating: 4.9,
    reviews: 38,
    response: "~20 min",
    avail: true,
    featured: true,
    initials: "JM",
    bg: "#fef9c3",
    tc: "#854d0e",
    about:
      "Specialist in fleet vehicle maintenance and roadworthy inspections.",
    badges: [
      { l: "Available today", t: "green" },
      { l: "Fleet servicing", t: "blue" },
      { l: "Diagnostics", t: "blue" },
    ],
  },
  {
    id: "p2",
    industry: "mechanics",
    name: "AutoPro Services",
    loc: "Sandton, JHB",
    rate: "R380/hr",
    rating: 4.7,
    reviews: 22,
    response: "~45 min",
    avail: false,
    featured: false,
    initials: "AP",
    bg: "#fee2e2",
    tc: "#991b1b",
    about: "Full mechanical overhaul specialists with 15 years experience.",
    badges: [
      { l: "Engine rebuild", t: "blue" },
      { l: "Gearbox", t: "purple" },
    ],
  },
  {
    id: "p3",
    industry: "electrical",
    name: "PowerEdge Electrical",
    loc: "Midrand, JHB",
    rate: "R500/hr",
    rating: 4.8,
    reviews: 51,
    response: "~30 min",
    avail: true,
    featured: true,
    initials: "PE",
    bg: "#dbeafe",
    tc: "#1e40af",
    about:
      "Licensed electricians for residential, commercial and industrial projects.",
    badges: [
      { l: "Available today", t: "green" },
      { l: "COC certified", t: "blue" },
      { l: "Solar wiring", t: "amber" },
    ],
  },
  {
    id: "p4",
    industry: "electrical",
    name: "Volt Masters",
    loc: "Roodepoort, JHB",
    rate: "R420/hr",
    rating: 4.6,
    reviews: 17,
    response: "~1 hr",
    avail: true,
    featured: false,
    initials: "VM",
    bg: "#ede9fe",
    tc: "#5b21b6",
    about: "Fast fault diagnosis and after-hours emergency call-outs.",
    badges: [
      { l: "DB upgrades", t: "blue" },
      { l: "Fault finding", t: "amber" },
    ],
  },
  {
    id: "p5",
    industry: "carpentry",
    name: "TimberWorks Carpentry",
    loc: "Pretoria East",
    rate: "R320/hr",
    rating: 4.7,
    reviews: 29,
    response: "~1 hr",
    avail: true,
    featured: false,
    initials: "TW",
    bg: "#dcfce7",
    tc: "#166534",
    about: "Bespoke timber solutions for homes and commercial spaces.",
    badges: [
      { l: "Available today", t: "green" },
      { l: "Custom built-ins", t: "blue" },
      { l: "Doors & frames", t: "blue" },
    ],
  },
  {
    id: "p6",
    industry: "plumbing",
    name: "FlowRight Plumbing",
    loc: "Centurion, PTA",
    rate: "R400/hr",
    rating: 4.8,
    reviews: 44,
    response: "~25 min",
    avail: true,
    featured: true,
    initials: "FR",
    bg: "#e0f2fe",
    tc: "#0369a1",
    about: "24/7 emergency plumbing and complete bathroom renovations.",
    badges: [
      { l: "Available today", t: "green" },
      { l: "Emergency callouts", t: "amber" },
      { l: "Leak detection", t: "blue" },
    ],
  },
  {
    id: "p7",
    industry: "logistics",
    name: "SA Courier Express",
    loc: "JHB South",
    rate: "R2 800/run",
    rating: 4.5,
    reviews: 67,
    response: "~15 min",
    avail: true,
    featured: false,
    initials: "SC",
    bg: "#fdf4ff",
    tc: "#7e22ce",
    about: "Cold-chain and standard courier services across South Africa.",
    badges: [
      { l: "Same-day delivery", t: "green" },
      { l: "Nationwide", t: "blue" },
      { l: "Refrigerated", t: "blue" },
    ],
  },
  {
    id: "p8",
    industry: "logistics",
    name: "SwiftMove Logistics",
    loc: "East Rand, JHB",
    rate: "R1 500/run",
    rating: 4.4,
    reviews: 33,
    response: "~30 min",
    avail: false,
    featured: false,
    initials: "SM",
    bg: "#fff7ed",
    tc: "#c2410c",
    about: "Heavy freight and office/warehouse relocation specialists.",
    badges: [
      { l: "Office relocation", t: "blue" },
      { l: "Pallet freight", t: "purple" },
    ],
  },
  {
    id: "p9",
    industry: "construction",
    name: "BuildRight Construction",
    loc: "Pretoria North",
    rate: "R650/hr",
    rating: 4.9,
    reviews: 12,
    response: "~2 hrs",
    avail: true,
    featured: true,
    initials: "BR",
    bg: "#fef9c3",
    tc: "#854d0e",
    about:
      "Fully CIDB-accredited contractor for residential and commercial builds.",
    badges: [
      { l: "CIDB registered", t: "blue" },
      { l: "Renovations", t: "green" },
      { l: "Extensions", t: "blue" },
    ],
  },
  {
    id: "p10",
    industry: "accounting",
    name: "ClearBooks Accounting",
    loc: "Hatfield, PTA",
    rate: "R350/hr",
    rating: 4.9,
    reviews: 88,
    response: "~1 hr",
    avail: true,
    featured: true,
    initials: "CB",
    bg: "#f0fdf4",
    tc: "#166534",
    about:
      "Registered accountants handling SME bookkeeping, VAT and tax submissions.",
    badges: [
      { l: "SAIPA registered", t: "green" },
      { l: "SARS submissions", t: "blue" },
      { l: "Payroll", t: "blue" },
    ],
  },
  {
    id: "p11",
    industry: "cleaning",
    name: "SparkleClean Pro",
    loc: "Boksburg, JHB",
    rate: "R280/hr",
    rating: 4.6,
    reviews: 55,
    response: "~20 min",
    avail: true,
    featured: false,
    initials: "SP",
    bg: "#ecfdf5",
    tc: "#065f46",
    about: "Industrial and domestic deep-cleaning with eco-friendly products.",
    badges: [
      { l: "Available today", t: "green" },
      { l: "Deep clean", t: "blue" },
      { l: "Industrial", t: "amber" },
    ],
  },
  {
    id: "p12",
    industry: "education",
    name: "BrightMinds Tutoring",
    loc: "Fourways, JHB",
    rate: "R250/hr",
    rating: 4.8,
    reviews: 41,
    response: "~45 min",
    avail: true,
    featured: false,
    initials: "BM",
    bg: "#fdf4ff",
    tc: "#7e22ce",
    about: "Grade 8-12 tutoring specialists with 95% matric pass rate.",
    badges: [
      { l: "Maths & Science", t: "purple" },
      { l: "Online sessions", t: "blue" },
    ],
  },
  {
    id: "p13",
    industry: "health",
    name: "PrimeCare Occupational Health",
    loc: "Rosebank, JHB",
    rate: "R800/hr",
    rating: 4.9,
    reviews: 26,
    response: "~1 hr",
    avail: true,
    featured: true,
    initials: "PC",
    bg: "#fef2f2",
    tc: "#991b1b",
    about:
      "Occupational health services including medicals, IOD and wellness screenings.",
    badges: [
      { l: "IOD assessments", t: "amber" },
      { l: "Pre-employment", t: "blue" },
      { l: "On-site", t: "green" },
    ],
  },
  {
    id: "p14",
    industry: "hotel",
    name: "EventSpace Hospitality",
    loc: "Sandton, JHB",
    rate: "Custom quote",
    rating: 4.7,
    reviews: 19,
    response: "~2 hrs",
    avail: true,
    featured: false,
    initials: "ES",
    bg: "#fffbeb",
    tc: "#78350f",
    about:
      "Full event and conference management with catering and AV solutions.",
    badges: [
      { l: "Conference setup", t: "blue" },
      { l: "Catering", t: "amber" },
      { l: "AV equipment", t: "purple" },
    ],
  },
  {
    id: "p15",
    industry: "hvac",
    name: "AirMaster HVAC",
    loc: "Midrand, JHB",
    rate: "R480/hr",
    rating: 4.7,
    reviews: 34,
    response: "~30 min",
    avail: true,
    featured: true,
    initials: "AM",
    bg: "#e0f2fe",
    tc: "#075985",
    about:
      "Commercial and industrial HVAC installation, servicing and emergency repairs.",
    badges: [
      { l: "Available today", t: "green" },
      { l: "VRV systems", t: "blue" },
      { l: "Maintenance", t: "blue" },
    ],
  },
  {
    id: "p16",
    industry: "landscaping",
    name: "GreenScape Landscaping",
    loc: "Waterkloof, PTA",
    rate: "R300/hr",
    rating: 4.6,
    reviews: 48,
    response: "~1 hr",
    avail: false,
    featured: false,
    initials: "GS",
    bg: "#f0fdf4",
    tc: "#14532d",
    about:
      "Landscape architects and maintenance crews for residential and commercial.",
    badges: [
      { l: "Garden design", t: "green" },
      { l: "Irrigation", t: "blue" },
      { l: "Maintenance", t: "blue" },
    ],
  },
  {
    id: "p17",
    industry: "legal",
    name: "Mokoena Attorneys Inc.",
    loc: "Menlyn, PTA",
    rate: "R1 200/hr",
    rating: 4.9,
    reviews: 15,
    response: "~4 hrs",
    avail: true,
    featured: false,
    initials: "MA",
    bg: "#f8fafc",
    tc: "#334155",
    about:
      "Boutique commercial law firm specialising in SME contracts and labour.",
    badges: [
      { l: "Commercial law", t: "blue" },
      { l: "Labour disputes", t: "amber" },
      { l: "Contracts", t: "purple" },
    ],
  },
  {
    id: "p18",
    industry: "painting",
    name: "PerfectCoat Painters",
    loc: "Alberton, JHB",
    rate: "R280/hr",
    rating: 4.5,
    reviews: 62,
    response: "~45 min",
    avail: true,
    featured: false,
    initials: "PP",
    bg: "#fff1f2",
    tc: "#9f1239",
    about:
      "Professional painters with 10+ years experience across residential and commercial.",
    badges: [
      { l: "Available today", t: "green" },
      { l: "Interior & exterior", t: "blue" },
      { l: "Waterproofing", t: "amber" },
    ],
  },
  {
    id: "p19",
    industry: "pest-control",
    name: "BugBusters Pest Control",
    loc: "Kempton Park, JHB",
    rate: "R550 flat",
    rating: 4.6,
    reviews: 37,
    response: "~30 min",
    avail: true,
    featured: false,
    initials: "BB",
    bg: "#fff7ed",
    tc: "#9a3412",
    about:
      "Registered pest control operators for residential and commercial premises.",
    badges: [
      { l: "Same-day service", t: "green" },
      { l: "Fumigation", t: "amber" },
      { l: "Rodent control", t: "blue" },
    ],
  },
  {
    id: "p20",
    industry: "photography",
    name: "LensLab Photography",
    loc: "Melrose, JHB",
    rate: "R1 800/half-day",
    rating: 4.9,
    reviews: 43,
    response: "~2 hrs",
    avail: false,
    featured: false,
    initials: "LL",
    bg: "#1e1b4b",
    tc: "#c7d2fe",
    about:
      "Award-winning commercial and event photographers with drone capability.",
    badges: [
      { l: "Product shoots", t: "purple" },
      { l: "Corporate events", t: "blue" },
      { l: "Drone footage", t: "amber" },
    ],
  },
  {
    id: "p21",
    industry: "pool",
    name: "AquaClear Pool Services",
    loc: "Centurion, PTA",
    rate: "R350/visit",
    rating: 4.7,
    reviews: 29,
    response: "~1 hr",
    avail: true,
    featured: false,
    initials: "AC",
    bg: "#ecfeff",
    tc: "#0e7490",
    about: "Full pool maintenance, chemical balancing and pump/filter repairs.",
    badges: [
      { l: "Weekly service", t: "blue" },
      { l: "Equipment repair", t: "amber" },
      { l: "Chemical balance", t: "green" },
    ],
  },
  {
    id: "p22",
    industry: "realestate",
    name: "PropertyPro Agents",
    loc: "Midrand, JHB",
    rate: "Commission-based",
    rating: 4.8,
    reviews: 31,
    response: "~2 hrs",
    avail: true,
    featured: false,
    initials: "PR",
    bg: "#f8fafc",
    tc: "#0f172a",
    about: "Specialist commercial and industrial property agents in Gauteng.",
    badges: [
      { l: "Commercial listings", t: "blue" },
      { l: "Property valuations", t: "purple" },
      { l: "Lease agreements", t: "amber" },
    ],
  },
  {
    id: "p23",
    industry: "restaurants",
    name: "Chef's Table Catering",
    loc: "Morningside, JHB",
    rate: "R180/person",
    rating: 4.8,
    reviews: 56,
    response: "~1 hr",
    avail: true,
    featured: false,
    initials: "CT",
    bg: "#fdf4ff",
    tc: "#6b21a8",
    about:
      "Professional catering for corporate functions, launches and team events.",
    badges: [
      { l: "Corporate events", t: "purple" },
      { l: "Set menus", t: "blue" },
      { l: "Halaal certified", t: "green" },
    ],
  },
  {
    id: "p24",
    industry: "security",
    name: "ShieldGuard Security",
    loc: "Germiston, JHB",
    rate: "R220/hr",
    rating: 4.7,
    reviews: 48,
    response: "~15 min",
    avail: true,
    featured: true,
    initials: "SG",
    bg: "#1e293b",
    tc: "#94a3b8",
    about:
      "PSiRA-registered security company providing armed, guarding and CCTV services.",
    badges: [
      { l: "Armed response", t: "amber" },
      { l: "CCTV install", t: "blue" },
      { l: "Site guards", t: "green" },
    ],
  },
  {
    id: "p25",
    industry: "solar",
    name: "SunPower Solar Installs",
    loc: "Pretoria, PTA",
    rate: "Custom quote",
    rating: 4.8,
    reviews: 22,
    response: "~1 hr",
    avail: true,
    featured: false,
    initials: "SP2",
    bg: "#fef9c3",
    tc: "#713f12",
    about:
      "NRS097 compliant solar installers for commercial and residential rooftops.",
    badges: [
      { l: "Off-grid systems", t: "amber" },
      { l: "Grid-tied", t: "blue" },
      { l: "Maintenance", t: "green" },
    ],
  },
  {
    id: "p26",
    industry: "towing",
    name: "FastTow Roadside Assist",
    loc: "N1 North Corridor",
    rate: "R800 flat",
    rating: 4.5,
    reviews: 71,
    response: "~10 min",
    avail: true,
    featured: false,
    initials: "FT",
    bg: "#fee2e2",
    tc: "#991b1b",
    about:
      "24-hour roadside assistance and accident recovery across Gauteng highways.",
    badges: [
      { l: "24/7 available", t: "green" },
      { l: "Flatbed towing", t: "blue" },
      { l: "Accident recovery", t: "amber" },
    ],
  },
  {
    id: "p27",
    industry: "welding",
    name: "IronFusion Welding",
    loc: "Vereeniging, VTW",
    rate: "R380/hr",
    rating: 4.6,
    reviews: 18,
    response: "~1 hr",
    avail: false,
    featured: false,
    initials: "IF",
    bg: "#1c1917",
    tc: "#d6d3d1",
    about:
      "Certified welders for structural, fabrication and pipe welding projects.",
    badges: [
      { l: "Structural steel", t: "blue" },
      { l: "Aluminium", t: "purple" },
      { l: "On-site welding", t: "amber" },
    ],
  },
  {
    id: "p28",
    industry: "flooring",
    name: "FloorMaster Installations",
    loc: "Bryanston, JHB",
    rate: "R180/m²",
    rating: 4.7,
    reviews: 36,
    response: "~1 hr",
    avail: true,
    featured: false,
    initials: "FM",
    bg: "#fdf4ff",
    tc: "#581c87",
    about:
      "Commercial and residential flooring specialists across all materials.",
    badges: [
      { l: "Epoxy", t: "purple" },
      { l: "Vinyl plank", t: "blue" },
      { l: "Hardwood", t: "amber" },
    ],
  },
  {
    id: "p29",
    industry: "windows",
    name: "ClearView Window Repairs",
    loc: "Benoni, JHB",
    rate: "R350/hr",
    rating: 4.6,
    reviews: 24,
    response: "~30 min",
    avail: true,
    featured: false,
    initials: "CV",
    bg: "#ecfeff",
    tc: "#164e63",
    about:
      "Window repairs, replacements and shopfront glazing for commercial properties.",
    badges: [
      { l: "Double glazing", t: "blue" },
      { l: "Aluminium frames", t: "purple" },
      { l: "Shopfronts", t: "amber" },
    ],
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function getIndustryLabel(id) {
  return (INDUSTRIES.find((i) => i.id === id) || { label: id }).label;
}

function navigateTo(path) {
  window.open(`${SOLIDFLO_URL}${path}`, "_blank", "noopener,noreferrer");
}

const BADGE_CLASS = {
  green: "mp-badge-green",
  blue: "mp-badge-blue",
  amber: "mp-badge-amber",
  purple: "mp-badge-purple",
};

// ── Sub-components ────────────────────────────────────────────────────────────

function Badge({ label, type }) {
  return (
    <span className={`mp-badge ${BADGE_CLASS[type] || "mp-badge-blue"}`}>
      {label}
    </span>
  );
}
function AdSlot({ ad, variant = "sidebar" }) {
  if (!ad) return null;
  const isBanner = variant === "banner";

  return (
    <div
      key={ad.src}
      className={isBanner ? "mp-ad-banner mp-sidebar-ad-slot" : "mp-ad-sidebar mp-sidebar-ad-slot"}
      onClick={() => window.open(ad.url, "_blank", "noopener,noreferrer")}
    >
      <span className="mp-sidebar-ad-tag">Sponsored</span>

      {isBanner ? (
        <div className="mp-ad-banner-inner">
          <img src={ad.src} alt={ad.headline} className="mp-ad-banner-img" />
          <div className="mp-ad-banner-text">
            <strong>{ad.headline}</strong>
            <span>{ad.sub}</span>
          </div>
          <div className="mp-ad-banner-cta">Learn More →</div>
        </div>
      ) : (
        <>
          <img src={ad.src} alt={ad.headline} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          <div className="mp-ad-sidebar-caption">
            <strong>{ad.headline}</strong>
            <span>{ad.sub}</span>
          </div>
        </>
      )}
    </div>
  );
}
function SectionTitle({ children, count }) {
  return (
    <div className="mp-section-title">
      <span className="mp-section-title-text">{children}</span>
      <div className="mp-section-title-line" />
      {count != null && (
        <span className="mp-section-title-badge">{count} listed</span>
      )}
    </div>
  );
}

// ── Industry → emoji map for banner icon ─────────────────────────────────────
const INDUSTRY_ICON = {
  mechanics: "🔧",
  electrical: "⚡",
  carpentry: "🪚",
  plumbing: "🚿",
  logistics: "🚛",
  construction: "🏗️",
  accounting: "📊",
  cleaning: "🧹",
  education: "🎓",
  health: "🏥",
  hotel: "🏨",
  hvac: "❄️",
  landscaping: "🌿",
  legal: "⚖️",
  painting: "🎨",
  "pest-control": "🐛",
  photography: "📷",
  pool: "🏊",
  realestate: "🏠",
  restaurants: "🍽️",
  retail: "🛍️",
  security: "🔒",
  solar: "☀️",
  towing: "🚗",
  welding: "🔥",
  flooring: "🪵",
  windows: "🪟",
};

// ── Provider Card ─────────────────────────────────────────────────────────────

function ProviderCard({ provider: p, expanded, onToggle, onBook, delay }) {
  const icon = INDUSTRY_ICON[p.industry] || "🏢";
  return (
    <div
      className={`mp-card${p.featured ? " featured" : ""}`}
      style={{ animationDelay: `${delay}ms` }}
      onClick={() => onToggle(p.id)}
    >
      {/* ── Image-style banner ── */}
      <div
        className="mp-card-banner"
        style={{
          background: `linear-gradient(135deg, ${p.bg} 0%, ${p.bg}cc 100%)`,
        }}
      >
        <span className="mp-card-banner-initials" style={{ color: p.tc }}>
          {p.initials}
        </span>
        <span className="mp-card-banner-icon">{icon}</span>

        {/* Available pill — top left */}
        {p.avail && (
          <span className="mp-card-avail-pip">
            <span className="mp-card-avail-pip-dot" />
            Available
          </span>
        )}

        {/* Top Rated badge — top right */}
        {p.featured && (
          <span className="mp-card-featured-badge">⭐ Top Rated</span>
        )}
      </div>

      {/* ── Card body ── */}
      <div className="mp-card-body">
        {/* Name + rate */}
        <div className="mp-card-title-row">
          <div className="mp-card-name">{p.name}</div>
          <span className="mp-card-rate">{p.rate}</span>
        </div>

        {/* Location + industry */}
        <div className="mp-card-meta">
          {getIndustryLabel(p.industry)} · {p.loc}
        </div>

        {/* About (always visible now) */}
        <div className="mp-card-about">{p.about}</div>

        {/* Badges */}
        <div className="mp-card-badges">
          {p.badges.map((b, i) => (
            <Badge key={i} label={b.l} type={b.t} />
          ))}
        </div>

        {/* Stats */}
        <div className="mp-card-stats">
          <span className="mp-card-stat">
            <span style={{ color: "#f59e0b" }}>★</span> {p.rating} ({p.reviews}{" "}
            reviews)
          </span>
          <span className="mp-card-stat">⏱ {p.response}</span>
          {!p.avail && <span className="mp-card-unavail">Unavailable</span>}
        </div>
      </div>

      {/* ── Shop-Now style footer link ── */}
      <div className="mp-card-footer">
        <button
          className={`mp-card-btn ${p.avail ? "mp-card-btn-avail" : "mp-card-btn-unavail"}`}
          onClick={(e) => {
            e.stopPropagation();
            if (p.avail) onBook(p);
          }}
        >
          {p.avail ? (
            <>
              Book Now — Get a Quote
              <span className="mp-card-btn-arrow">→</span>
            </>
          ) : (
            "Currently Unavailable"
          )}
        </button>
      </div>
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────

function RegisterModal({ mode, providerName, onClose }) {
  const isLogin = mode === "login";

  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const features = isLogin
    ? [
        "View and manage your service requests",
        "Track quotes and accepted bookings",
        "Message service providers directly",
        "Access your invoices and documents",
      ]
    : [
        "Post unlimited job requests to providers",
        "Receive and compare quotes instantly",
        "Manage invoices, jobs and payments in one place",
        "Starter plan — free forever, no credit card needed",
      ];

  return (
    <div className="mp-modal-overlay" onClick={onClose}>
      <div className="mp-modal" onClick={(e) => e.stopPropagation()}>
        <button className="mp-modal-close" onClick={onClose}>
          ✕
        </button>

        {/* ── Left panel ── */}
        <div className="mp-modal-left">
          <div className="mp-modal-left-logo">
            <img src={logo} alt="SolidFlo" style={{ height: 36 }} />
          </div>

          <div className="mp-modal-trust">
            <div className="mp-modal-trust-stars">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="mp-modal-trust-star">
                  ★
                </div>
              ))}
            </div>
            <div className="mp-modal-trust-score">
              <strong>Rated 4.8</strong>
              <br />
              by 200+ Gauteng businesses
            </div>
          </div>

          <div className="mp-modal-illustration">
            
          </div>
        </div>

        {/* ── Right panel ── */}
        <div className="mp-modal-right">
          <h2>
            {isLogin
              ? "Welcome back"
              : providerName
                ? `Book ${providerName}`
                : "Find the right provider, fast"}
          </h2>

          <p className="mp-modal-sub">
            {isLogin
              ? "Sign in to manage your bookings, quotes and service requests."
              : providerName
                ? `Create a free account to book ${providerName} and receive a quote directly.`
                : "Join hundreds of Gauteng businesses already using SolidFlo to connect with verified service providers."}
          </p>

          <div className="mp-modal-features">
            {features.map((f, i) => (
              <div key={i} className="mp-modal-feature">
                <span className="mp-modal-feature-check">✓</span> {f}
              </div>
            ))}
          </div>

          <button
            className="mp-modal-cta"
            onClick={() => navigateTo(isLogin ? "/" : "/")}
          >
            {isLogin ? "Sign In at solidflo.co.za" : "Get Started Free"}
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M7 17L17 7M7 7h10v10" />
            </svg>
          </button>

          <p className="mp-modal-switch">
            {isLogin ? (
              <>
                Don't have an account?{" "}
                <span
                  className="mp-modal-switch-link"
                  onClick={() => navigateTo("/")}
                >
                  Register free
                </span>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <span
                  className="mp-modal-switch-link"
                  onClick={() => navigateTo("/")}
                >
                  Sign in
                </span>
              </>
            )}
          </p>

          {!isLogin && (
            <p className="mp-modal-footnote">
              ✓ No credit card required &nbsp;·&nbsp; ✓ Free to start
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Mobile Sidebar Drawer ─────────────────────────────────────────────────────

function SidebarDrawer({
  isOpen,
  onClose,
  activeFilter,
  onFilterChange,
  sidebarSearch,
  setSidebarSearch,
}) {
  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const filteredIndustries = INDUSTRIES.filter((ind) =>
    ind.label.toLowerCase().includes(sidebarSearch.toLowerCase()),
  );

  const handleSelect = (id) => {
    onFilterChange(id);
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`mp-drawer-overlay${isOpen ? " open" : ""}`}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div className={`mp-drawer${isOpen ? " open" : ""}`}>
        <div className="mp-drawer-handle" />

        <div className="mp-drawer-header">
          <span className="mp-drawer-header-title">Browse Industries</span>
          <button className="mp-drawer-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="mp-drawer-search">
          <div className="mp-drawer-search-inner">
            <span className="mp-drawer-search-icon">⌕</span>
            <input
              className="mp-drawer-search-input"
              placeholder="Search industries…"
              value={sidebarSearch}
              onChange={(e) => setSidebarSearch(e.target.value)}
              autoFocus={isOpen}
            />
          </div>
        </div>

        <div className="mp-drawer-list">
          {filteredIndustries.map((ind) => (
            <div key={ind.id}>
              {ind.id === "all" && <div className="mp-drawer-divider" />}
              <div
                className={`mp-drawer-item${activeFilter === ind.id ? " active" : ""}`}
                onClick={() => handleSelect(ind.id)}
              >
                <span className="mp-drawer-item-emoji">{ind.emoji}</span>
                <span className="mp-drawer-item-label">{ind.label}</span>
                <span className="mp-drawer-item-count">
                  {ind.id === "all"
                    ? PROVIDERS.length
                    : PROVIDERS.filter((p) => p.industry === ind.id).length}
                </span>
              </div>
              {ind.id === "all" && <div className="mp-drawer-divider" />}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────────

function Hero({ availCount, totalCount, onPostJob, onBrowse }) {
  const [currentWord, setCurrentWord] = useState(0);
  const WORDS = ["Fast", "Simple", "Trusted", "Smart"];

  useEffect(() => {
    const t = setInterval(
      () => setCurrentWord((w) => (w + 1) % WORDS.length),
      2600,
    );
    return () => clearInterval(t);
  }, []);

  // Duplicate the providers list so the loop is seamless
  const sliderItems = [...PROVIDERS, ...PROVIDERS];

  return (
    <section className="mp-hero">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="mp-hero-video"
        src={heroBg}
      />
      <div className="mp-hero-overlay" />

      <div className="mp-hero-inner">
        {/* Left */}
        <div>
          <div className="mp-hero-badge">
            <span className="mp-hero-badge-dot" />
            {availCount} providers available now
          </div>

          <h1>
            Find Trusted Providers{" "}
            <em key={currentWord}>{WORDS[currentWord]}</em>
          </h1>

          <p className="mp-hero-sub">
            Browse, compare and book verified trade and professional service
            providers across Gauteng. No registration needed to browse.
          </p>

          <div className="mp-hero-ctas">
            <button className="mp-hero-primary" onClick={onBrowse}>
              Browse Providers
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
            <button className="mp-hero-secondary" onClick={onPostJob}>
              Post a Job ↗
            </button>
          </div>

          <div className="mp-hero-trust">
            {[
              "No sign-up to browse",
              "Verified professionals",
              "Gauteng-based",
            ].map((t) => (
              <div key={t} className="mp-hero-trust-item">
                <span className="mp-hero-trust-check">✓</span> {t}
              </div>
            ))}
          </div>
        </div>

        {/* Right — sliding provider cards */}
        <div className="mp-hero-slider">
          <div className="mp-hero-slider-track">
            {sliderItems.map((p, i) => (
              <div key={`${p.id}-${i}`} className="mp-hero-mini-card">
                <div
                  className="mp-hero-mini-avatar"
                  style={{ background: p.bg, color: p.tc }}
                >
                  {p.initials}
                </div>
                <div className="mp-hero-mini-info">
                  <div className="mp-hero-mini-name">{p.name}</div>
                  <div className="mp-hero-mini-meta">
                    {getIndustryLabel(p.industry)} · {p.loc}
                  </div>
                </div>
                <div className="mp-hero-mini-right">
                  <span className="mp-hero-mini-rate">{p.rate}</span>
                  <span className="mp-hero-mini-star">★ {p.rating}</span>
                  {p.avail ? (
                    <span className="mp-hero-mini-avail">
                      <span className="mp-hero-mini-avail-dot" />
                      Available
                    </span>
                  ) : (
                    <span className="mp-hero-mini-unavail">Unavailable</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function industryProviderCount(industryId) {
  if (industryId === "all") return PROVIDERS.length;
  return PROVIDERS.filter((p) => p.industry === industryId).length;
}

export default function PublicMarketplace() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [expandedCards, setExpandedCards] = useState({});
  const [modal, setModal] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [sidebarSearch, setSidebarSearch] = useState("");
  const [scrollPct, setScrollPct] = useState(0);
  const [visible, setVisible] = useState({});
  const [drawerOpen, setDrawerOpen] = useState(false);
const [bookingProvider, setBookingProvider] = useState(null);
const [toast, setToast] = useState("");
const showToast = useCallback((msg) => {
  setToast(msg);
  setTimeout(() => setToast(""), 3500);
}, []);
 const { user }                        = useAuth();
const { providers, loading, error }   = useProviders(activeFilter);
 
const featured   = providers.filter((p) => p.featured);
const standard   = providers.filter((p) => !p.featured);
const availCount = providers.filter((p) => p.avail).length;

  // Active industry label for FAB
  const activeIndustry = INDUSTRIES.find((i) => i.id === activeFilter);
const [currentAd, setCurrentAd] = useState(0);

const ADS = [
   {
    "type": "image",
    "name": "Alex Upholstery Hub d/bouble",
    "headline": "Designer Collection",
    "sub": "Experience the perfect blend of style",
    "url": "https://alex-upholstery.co.za",
    "status": "active",
    "src": "/ads/alex-bed-1.png"
  },
  {
    "type": "image",
    "name": "AI Call answering",
    "headline": "Gerbo Ai Call Answering",
    "sub": "Never Loose A Call",
    "url": "https://gerboai.com",
    "status": "active",
    "src": "/ads/gerbo-ad.png"
  },
  {
    "type": "image",
    "name": "Video and Image Editing",
    "headline": "Video Trimming",
    "sub": "remove unwanted Video sections",
    "url": "https://videolid.com",
    "status": "active",
    "src": "/ads/videolid-ad.png"
  },
];

useEffect(() => {
  const t = setInterval(() => {
    setCurrentAd((prev) => (prev + 1) % ADS.length);
  }, 6000); // rotates every 6 seconds
  return () => clearInterval(t);
}, []);
  // Scroll progress + nav scroll state
  useEffect(() => {
    const h = () => {
      const sy = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setScrolled(sy > 600);
      setScrollPct(Math.min(sy / max, 1) * 100);
    };
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  // Intersection observer for stats strip
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

  const openModal = useCallback(
    (mode, providerName) => setModal({ mode, providerName }),
    [],
  );
  const closeModal = useCallback(() => setModal(null), []);
  const toggleCard = useCallback(
    (id) => setExpandedCards((prev) => ({ ...prev, [id]: !prev[id] })),
    [],
  );
  const handleBook = useCallback(
  (provider) => {
    if (!user) {
      // Not logged in → show your existing register modal
      openModal("register", provider.name);
      return;
    }
    // Logged in → open booking panel directly
    setBookingProvider(provider);
  },
  [user, openModal],
);
const handleSubmitBooking = useCallback(
  async (provider, formData) => {
    try {
      await sendBookingRequest(formData, provider, user);
      setBookingProvider(null);
      showToast(`Booking sent to ${provider.name}! They'll respond with a quote.`);
    } catch (err) {
      console.error(err);
      showToast("Failed to send booking. Please try again.");
    }
  },
  [user],
);
  const handleFilterChange = (id) => {
    setActiveFilter(id);
    setExpandedCards({});
  };

  return (
    <div className="mp">
      <style>{css}</style>

      {/* Scroll progress */}
      <div className="mp-progress" style={{ width: `${scrollPct}%` }} />

      {/* Nav */}
      <nav className={`mp-nav${scrolled ? " scrolled" : ""}`}>
        <div className="mp-nav-inner">
          <div className="mp-nav-logo">
            <img src={logo} alt="SolidFlo" style={{ height: 44 }} />
          </div>
          <div className="mp-nav-ctas">
            <button className="mp-btn-ghost" onClick={() => openModal("login")}>
              Sign In
            </button>
            <button
              className="mp-btn-primary"
              onClick={() => openModal("register")}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              {/* Full text on desktop, short text on mobile */}
              <span className="mp-btn-primary-full">Post a Request</span>
              <span className="mp-btn-primary-short">Post</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <Hero
        availCount={availCount}
        totalCount={PROVIDERS.length}
        onPostJob={() => openModal("register")}
        onBrowse={() =>
          document
            .getElementById("mp-filter")
            ?.scrollIntoView({ behavior: "smooth" })
        }
      />

      {/* Dark wrapper so the whole below-filter area is navy */}
      <div style={{ background: "#f8fafc" }}>
        <div className="mp-layout">
          {/* ── Sidebar (desktop only) ── */}
          <aside className="mp-sidebar">
<AdSlot ad={ADS[currentAd]} variant="sidebar" />
            <div className="mp-sidebar-header">
              <div className="mp-sidebar-title">Industries</div>
              <div className="mp-sidebar-search">
                <span className="mp-sidebar-search-icon">⌕</span>
                <input
                  className="mp-sidebar-search-input"
                  placeholder="Filter…"
                  value={sidebarSearch}
                  onChange={(e) => setSidebarSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="mp-sidebar-list">
              {INDUSTRIES.filter((ind) =>
                ind.label.toLowerCase().includes(sidebarSearch.toLowerCase()),
              ).map((ind, i) => (
                <div key={ind.id}>
                  {ind.id === "all" && <div className="mp-sidebar-divider" />}
                  <div
                    className={`mp-sidebar-item${activeFilter === ind.id ? " active" : ""}`}
                    onClick={() => handleFilterChange(ind.id)}
                  >
                    <span className="mp-sidebar-item-emoji">{ind.emoji}</span>
                    <span className="mp-sidebar-item-label">{ind.label}</span>
                    <span className="mp-sidebar-item-count">
                      {industryProviderCount(ind.id)}
                    </span>
                  </div>
                  {ind.id === "all" && <div className="mp-sidebar-divider" />}
                </div>
              ))}
            </div>
           <AdSlot ad={ADS[currentAd]} variant="sidebar" />
          </aside>
          {/* ── Main content ── */}
          <div className="mp-main">
            {/* Availability banner */}
            <div className="mp-avail-banner">
              <div className="mp-avail-dot" />
              <span className="mp-avail-text">
                <strong>Live marketplace</strong> — verified service providers
                ready to quote across Gauteng right now.
              </span>
              <div className="mp-avail-count">
                <div className="mp-avail-stat">
                  <span className="mp-avail-num">
                    {availCount}
                  </span>
                  <span className="mp-avail-sub">Available now</span>
                </div>
                <div className="mp-avail-stat">
                  <span className="mp-avail-num">{providers.length}</span>
                  <span className="mp-avail-sub">Total listed</span>
                </div>
              </div>
            </div>

            {/* Featured */}
            {featured.length > 0 && (
              <>
                <SectionTitle count={featured.length}>
                  Recommended for you
                </SectionTitle>
                <div className="mp-grid">
                  {featured.map((p, i) => (
                    <ProviderCard
                      key={p.id}
                      provider={p}
                      expanded={!!expandedCards[p.id]}
                      onToggle={toggleCard}
                      onBook={handleBook}
                      delay={i * 60}
                    />
                  ))}
                </div>
              </>
            )}

            {standard.length > 0 && (
  <>
    {featured.length > 0 && (
      <SectionTitle count={standard.length}>
        More providers
      </SectionTitle>
    )}

    {/* ── Inline Ad Banner ── */}
    <div
      key={`inline-${currentAd}`}
      className="mp-sidebar-ad mp-sidebar-ad-slot"
      style={{ margin: "0 0 20px", borderRadius: 12, cursor: "pointer" }}
      onClick={() =>
        window.open(ADS[currentAd].url, "_blank", "noopener,noreferrer")
      }
    >
      <span className="mp-sidebar-ad-tag">Sponsored</span>
      {ADS[currentAd].type === "image" ? (
        <div style={{ display: "flex", alignItems: "center", background: "#fff" }}>
          <img
            src={ADS[currentAd].src}
            alt={ADS[currentAd].alt}
            style={{
              width: 120,
              height: 90,
              objectFit: "cover",
              borderRadius: "12px 0 0 12px",
              flexShrink: 0,
            }}
          />
          <div style={{ padding: "12px 16px" }}>
            <strong style={{ fontSize: 13, color: "#0f172a", display: "block", marginBottom: 4 }}>
              {ADS[currentAd].headline}
            </strong>
            <span style={{ fontSize: 12, color: "#94a3b8" }}>
              {ADS[currentAd].sub}
            </span>
            <div style={{
              marginTop: 8,
              fontSize: 11,
              fontWeight: 700,
              color: "#6366f1",
              textTransform: "uppercase",
              letterSpacing: ".04em",
            }}>
              Learn more →
            </div>
          </div>
        </div>
      ) : (
        <div
          className="mp-sidebar-ad-branded"
          style={{ background: ADS[currentAd].bg }}
        >
          <div className="mp-sidebar-ad-branded-headline">
            {ADS[currentAd].headline}
          </div>
          <div className="mp-sidebar-ad-branded-sub">{ADS[currentAd].sub}</div>
          <button className="mp-sidebar-ad-branded-btn">
            {ADS[currentAd].cta}
          </button>
        </div>
      )}
    </div>

    <div className="mp-grid">
      {standard.map((p, i) => (
        <ProviderCard
          key={p.id}
          provider={p}
          expanded={!!expandedCards[p.id]}
          onToggle={toggleCard}
          onBook={handleBook}
          delay={i * 40}
        />
      ))}
    </div>
  </>
)} 
{bookingProvider && (
  <div style={{ marginTop: 12 }}>
    <BookingPanel
      provider={bookingProvider}
      onClose={() => setBookingProvider(null)}
      onSubmit={handleSubmitBooking}
    />
  </div>
)}
            {/* Empty */}
            {providers.length === 0 && !loading && (
              <div className="mp-empty">
                <div className="mp-empty-icon">
                  {INDUSTRIES.find((i) => i.id === activeFilter)?.emoji || "🔍"}
                </div>
                <div className="mp-empty-title">
                  No providers listed in this category yet
                </div>
                <div className="mp-empty-sub">
                  Be the first to list your business — register on SolidFlo
                  today.
                </div>
              </div>
            )}

           
          </div>
          {/* end .mp-main */}
        </div>
        {/* end .mp-layout */}
      </div>

      {/* ── Mobile Filter FAB ── */}
      <button className="mp-filter-fab" onClick={() => setDrawerOpen(true)}>
        <span className="mp-filter-fab-dot" />
        {activeIndustry?.emoji} {activeIndustry?.label || "All Industries"}
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {/* ── Mobile Sidebar Drawer ── */}
      <SidebarDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
        sidebarSearch={sidebarSearch}
        setSidebarSearch={setSidebarSearch}
      />
        {/* CTA */}
            <div className="mp-cta">
              <div className="mp-cta-inner">
                <div className="mp-cta-tag">For Businesses</div>
                <h2>
                  Need a specific <em>service?</em>
                </h2>
                <p>
                  Post a job request and receive quotes directly from verified
                  providers in your area — free to start, no credit card needed.
                </p>
                <div className="mp-cta-btns">
                  <button
                    className="mp-cta-primary"
                    onClick={() => openModal("register")}
                  >
                    Post a Job Request
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path d="M7 17L17 7M7 7h10v10" />
                    </svg>
                  </button>
                  <button
                    className="mp-cta-secondary"
                    onClick={() => navigateTo("/")}
                  >
                    Learn More
                  </button>
                </div>
                <div className="mp-cta-perks">
                  {[
                    "Free to register",
                    "No credit card required",
                    "Starter plan forever free",
                  ].map((t) => (
                    <span key={t} className="mp-cta-perk">
                      <span className="mp-cta-perk-check">✓</span> {t}
                    </span>
                  ))}
                </div>
              </div>
            </div> 
      {/* Footer */}
      <footer className="mp-footer">
        <div className="mp-footer-upper">
          <div className="mp-footer-brand">
            <img src={logo} alt="SolidFlo" style={{ height: 80 }} />
            <p className="mp-footer-tagline">
              The marketplace for verified trade and professional service
              providers across Gauteng.
            </p>
          </div>
          <div className="mp-footer-links-group">
            <div className="mp-footer-links-label">Platform</div>
            <span
              className="mp-footer-link"
              onClick={() => navigateTo("https://solidflo.co.za")}
            >
              Register Free
            </span>
            <span className="mp-footer-link" onClick={() => navigateTo("/")}>
              Sign In
            </span>
            <span className="mp-footer-link" onClick={() => openModal("/")}>
              Post a Job
            </span>
          </div>
          <div className="mp-footer-links-group">
            <div className="mp-footer-links-label">Industries</div>
            {INDUSTRIES.slice(1, 6).map((ind) => (
              <span
                key={ind.id}
                className="mp-footer-link"
                onClick={() => {
                  document
                    .getElementById("mp-filter")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                {ind.emoji} {ind.label}
              </span>
            ))}
          </div>
          <div className="mp-footer-links-group">
            <div className="mp-footer-links-label">Company</div>
            <a
              className="mp-footer-link"
              href={SOLIDFLO_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              solidflo.co.za
            </a>
          </div>
        </div>
        <div className="mp-footer-lower">
          <span className="mp-footer-copy">
            © {new Date().getFullYear()} SolidFlo · Marketplace for verified
            service providers in Gauteng
          </span>
          <div className="mp-footer-legal">
            <a
              href={`${SOLIDFLO_URL}/privacy`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Privacy
            </a>
            <a
              href={`${SOLIDFLO_URL}/terms`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Terms
            </a>
          </div>
        </div>
      </footer>

      {/* Modal */}
      {modal && (
        <RegisterModal
          mode={modal.mode}
          providerName={modal.providerName}
          onClose={closeModal}
        />
      )}
       {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
          background: "#0f172a", color: "#fff", fontSize: 13, fontWeight: 700,
          padding: "11px 22px", borderRadius: 8, zIndex: 9999,
          boxShadow: "0 8px 28px rgba(15,23,42,.3)", pointerEvents: "none",
        }}>
          {toast}
        </div>
      )}
    </div>
  );
}
