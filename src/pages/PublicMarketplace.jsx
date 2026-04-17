import { useState, useCallback, useEffect, useRef } from "react";
import heroBg from "../assets/videos/market.mp4";
import logo from "../assets/img/solidflo.png";
// ── Config ────────────────────────────────────────────────────────────────────

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
  grid-template-columns: 240px 1fr;
  align-items: start;
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 40px 80px;
  gap: 32px;
}

/* ── Sidebar ── */
.mp-sidebar {
  position: sticky;
  top: 80px;
  background: rgba(255,255,255,.03);
  border: 1px solid rgba(255,255,255,.07);
  border-radius: 14px;
  overflow: hidden;
}
.mp-sidebar::before {
  content: '';
  position: absolute; top: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(99,102,241,.45), transparent);
}
.mp-sidebar-header {
  padding: 18px 20px 14px;
  border-bottom: 1px solid rgba(255,255,255,.06);
}
.mp-sidebar-title {
  font-size: 10px; font-weight: 700; letter-spacing: .1em;
  text-transform: uppercase; color: rgba(255,255,255,.3);
}
.mp-sidebar-search {
  margin-top: 12px;
  display: flex; align-items: center; gap: 8px;
  background: rgba(255,255,255,.05);
  border: 1px solid rgba(255,255,255,.09);
  border-radius: 6px;
  padding: 8px 12px;
}
.mp-sidebar-search-icon { color: rgba(255,255,255,.25); font-size: 13px; flex-shrink: 0; }
.mp-sidebar-search-input {
  background: none; border: none; outline: none;
  font-family: 'Lato', sans-serif;
  font-size: 12px; color: rgba(255,255,255,.7);
  width: 100%;
}
.mp-sidebar-search-input::placeholder { color: rgba(255,255,255,.25); }

.mp-sidebar-list {
  padding: 8px 0;
  max-height: calc(100vh - 200px);
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,.08) transparent;
}
.mp-sidebar-list::-webkit-scrollbar { width: 4px; }
.mp-sidebar-list::-webkit-scrollbar-track { background: transparent; }
.mp-sidebar-list::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,.1); border-radius: 2px;
}

.mp-sidebar-item {
  display: flex; align-items: center;
  padding: 9px 20px; gap: 10px;
  cursor: pointer;
  transition: background .14s, color .14s;
  border-left: 2px solid transparent;
  position: relative;
}
.mp-sidebar-item:hover { background: rgba(255,255,255,.05); }
.mp-sidebar-item.active {
  background: rgba(99,102,241,.12);
  border-left-color: var(--red);
}
.mp-sidebar-item-emoji { font-size: 14px; line-height: 1; flex-shrink: 0; }
.mp-sidebar-item-label {
  font-size: 12px; font-weight: 600;
  color: rgba(255,255,255,.45);
  flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  transition: color .14s;
}
.mp-sidebar-item:hover .mp-sidebar-item-label { color: rgba(255,255,255,.8); }
.mp-sidebar-item.active .mp-sidebar-item-label { color: #a5b4fc; font-weight: 700; }
.mp-sidebar-item-count {
  font-size: 10px; font-weight: 700;
  color: rgba(255,255,255,.18);
  background: rgba(255,255,255,.05);
  border-radius: 10px;
  padding: 2px 7px;
  flex-shrink: 0;
  transition: background .14s, color .14s;
}
.mp-sidebar-item.active .mp-sidebar-item-count {
  background: rgba(99,102,241,.2);
  color: #818cf8;
}
.mp-sidebar-divider {
  height: 1px; background: rgba(255,255,255,.05);
  margin: 6px 0;
}

/* ── Main content (right of sidebar) ── */
.mp-main { min-width: 0; }

/* ════════════════════════════════════
   RESPONSIVE — sidebar collapses
════════════════════════════════════ */
@media (max-width: 1024px) {
  .mp-layout {
    grid-template-columns: 200px 1fr;
    padding: 28px 24px 60px;
    gap: 24px;
  }
}
@media (max-width: 768px) {
  .mp-layout {
    grid-template-columns: 1fr;
    padding: 24px 20px 60px;
  }
  .mp-sidebar {
    position: static;
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
  .mp-sidebar-list {
    max-height: 260px;
    grid-column: span 2;
  }
}
  /* avail banner */
  .mp-avail-banner {
  background: linear-gradient(135deg, rgba(99,102,241,.1) 0%, rgba(14,165,233,.06) 100%);
  border: 1px solid rgba(99,102,241,.2);
  border-radius: 14px; padding: 28px 36px;
  margin-bottom: 48px;
  display: flex; align-items: center; gap: 24px;
  position: relative; overflow: hidden;
}
  .mp-avail-banner::before {
  content: '';
  position: absolute; top: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(99,102,241,.55), rgba(14,165,233,.35), transparent);
}
.mp-avail-banner::after {
  content: '';
  position: absolute; inset: 0; pointer-events: none;
  background: radial-gradient(ellipse 50% 120% at 90% 50%, rgba(14,165,233,.07) 0%, transparent 70%);
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
  display: flex; align-items: center; gap: 18px;
  margin: 48px 0 28px;
}
.mp-section-title-text {
  font-family: 'Playfair Display', serif;
  font-size: 22px; font-weight: 600; color: #fff;
  white-space: nowrap; letter-spacing: -.015em;
}
.mp-section-title-line {
  flex: 1; height: 1px;
  background: linear-gradient(90deg, rgba(99,102,241,.35) 0%, transparent 100%);
}
.mp-section-title-badge {
  font-size: 10px; font-weight: 700; letter-spacing: .08em;
  text-transform: uppercase; color: rgba(99,102,241,.8);
  background: rgba(99,102,241,.1); border: 1px solid rgba(99,102,241,.2);
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
  background: rgba(255,255,255,.04);
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 12px; padding: 26px;
  cursor: pointer;
  display: flex; flex-direction: column; gap: 16px;
  transition: box-shadow .22s, transform .22s, border-color .22s, background .22s;
  opacity: 0; transform: translateY(16px);
  animation: mp-up .45s ease forwards;
  position: relative; overflow: hidden;
}
.mp-card::before {
  content: '';
  position: absolute; top: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.1), transparent);
}
.mp-card:hover {
  box-shadow: 0 20px 52px rgba(0,0,0,.45), 0 0 0 1px rgba(99,102,241,.35);
  transform: translateY(-4px);
  background: rgba(255,255,255,.07);
  border-color: rgba(99,102,241,.3);
}
.mp-card.featured {
  border-color: rgba(99,102,241,.3);
  background: rgba(99,102,241,.06);
}
.mp-card.featured::before {
  background: linear-gradient(90deg, transparent, rgba(99,102,241,.45), rgba(14,165,233,.25), transparent);
}
.mp-card-top { display: flex; align-items: flex-start; gap: 14px; }
.mp-card-avatar {
  width: 48px; height: 48px; border-radius: 10px;
  flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 700;
  box-shadow: 0 2px 12px rgba(0,0,0,.25);
}
.mp-card-info { flex: 1; min-width: 0; }
.mp-card-name {
  font-size: 15px; font-weight: 700; color: #fff;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  margin-bottom: 4px;
}
.mp-card-meta { font-size: 12px; color: rgba(255,255,255,.38); }
.mp-card-right {
  flex-shrink: 0; display: flex; flex-direction: column;
  align-items: flex-end; gap: 6px;
}
.mp-card-featured-badge {
  font-size: 10px; font-weight: 700;
  background: rgba(99,102,241,.18); color: #a5b4fc;
  padding: 3px 10px; border-radius: 20px;
  border: 1px solid rgba(99,102,241,.3);
}
.mp-card-rate { font-size: 15px; font-weight: 700; color: #fff; white-space: nowrap; }
.mp-card-badges { display: flex; gap: 6px; flex-wrap: wrap; }
.mp-badge {
  font-size: 10px; font-weight: 700;
  padding: 3px 10px; border-radius: 20px; border: 1px solid transparent;
}
.mp-badge-green  { background: rgba(16,185,129,.14);  color: #34d399; border-color: rgba(16,185,129,.25); }
.mp-badge-blue   { background: rgba(14,165,233,.14);  color: #38bdf8; border-color: rgba(14,165,233,.25); }
.mp-badge-amber  { background: rgba(245,158,11,.14);  color: #fbbf24; border-color: rgba(245,158,11,.22); }
.mp-badge-purple { background: rgba(139,92,246,.14);  color: #c4b5fd; border-color: rgba(139,92,246,.25); }
.mp-card-stats { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
.mp-card-stat { font-size: 12px; color: rgba(255,255,255,.38); }
.mp-card-unavail { font-size: 11px; color: #f87171; font-weight: 700; }
.mp-card-about {
  font-size: 13px; color: rgba(255,255,255,.5); line-height: 1.7;
  padding-top: 16px; border-top: 1px solid rgba(255,255,255,.07);
}
.mp-card-about-link { margin-top: 10px; font-size: 12px; color: #818cf8; font-weight: 700; }
.mp-card-btn {
  width: 100%; padding: 13px 0;
  border-radius: 6px;
  font-family: 'Lato', sans-serif; font-size: 12px;
  font-weight: 700; letter-spacing: .05em;
  cursor: pointer; transition: all .18s;
  text-transform: uppercase;
}
.mp-card-btn-avail {
  background: rgba(99,102,241,.18); color: #a5b4fc;
  border: 1px solid rgba(99,102,241,.3);
}
.mp-card-btn-avail:hover {
  background: var(--red); color: #fff;
  border-color: var(--red);
  box-shadow: 0 6px 20px rgba(99,102,241,.35);
  transform: translateY(-1px);
}
.mp-card-btn-unavail {
  background: rgba(255,255,255,.03); color: rgba(255,255,255,.2);
  border: 1px solid rgba(255,255,255,.07); cursor: not-allowed;
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
  border: 1px solid rgba(99,102,241,.2);
  border-radius: 16px; padding: 80px 48px; margin-top: 72px;
  text-align: center; position: relative; overflow: hidden;
  background: linear-gradient(135deg, rgba(15,23,42,1) 0%, rgba(26,16,64,.9) 50%, rgba(15,32,64,.95) 100%);
}
.mp-cta::before {
  content: '';
  position: absolute; inset: 0; pointer-events: none;
  background:
    radial-gradient(ellipse 65% 80% at 15% 50%, rgba(99,102,241,.22) 0%, transparent 60%),
    radial-gradient(ellipse 45% 65% at 85% 25%, rgba(14,165,233,.14) 0%, transparent 55%);
}
.mp-cta::after {
  content: '';
  position: absolute; top: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(99,102,241,.7) 40%, rgba(14,165,233,.5) 60%, transparent 100%);
}
.mp-cta-inner { position: relative; z-index: 1; }
.mp-cta-tag {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 5px 16px; border-radius: 20px; margin-bottom: 24px;
  background: rgba(99,102,241,.12); border: 1px solid rgba(99,102,241,.3);
  font-size: 10px; font-weight: 700; letter-spacing: .08em;
  text-transform: uppercase; color: #a5b4fc;
}
.mp-cta h2 {
  font-size: clamp(2rem, 3.5vw, 3rem); color: #fff; margin-bottom: 16px; line-height: 1.1;
}
.mp-cta h2 em { font-style: italic; color: #818cf8; }
.mp-cta p {
  font-size: 16px; color: rgba(255,255,255,.5);
  max-width: 500px; margin: 0 auto 44px; line-height: 1.75;
}
.mp-cta-btns { display: flex; align-items: center; justify-content: center; gap: 14px; flex-wrap: wrap; }
.mp-cta-primary {
  height: 54px; padding: 0 36px;
  background: var(--red); color: #fff; border: none; border-radius: 6px;
  font-family: 'Lato', sans-serif; font-size: 13px; font-weight: 700;
  letter-spacing: .05em; text-transform: uppercase;
  display: flex; align-items: center; gap: 8px; cursor: pointer;
  transition: all .18s;
}
.mp-cta-primary:hover {
  background: var(--red-hover); transform: translateY(-2px);
  box-shadow: 0 10px 32px rgba(99,102,241,.45);
}
.mp-cta-secondary {
  height: 54px; padding: 0 32px;
  background: rgba(255,255,255,.06);
  color: rgba(255,255,255,.75);
  border: 1px solid rgba(255,255,255,.15); border-radius: 6px;
  font-family: 'Lato', sans-serif; font-size: 13px; font-weight: 700;
  letter-spacing: .05em; text-transform: uppercase; cursor: pointer;
  transition: all .18s;
}
.mp-cta-secondary:hover { background: rgba(255,255,255,.12); color: #fff; }
.mp-cta-perks {
  display: flex; align-items: center; justify-content: center; gap: 28px;
  margin-top: 28px; flex-wrap: wrap;
}
.mp-cta-perk {
  display: flex; align-items: center; gap: 7px;
  font-size: 12px; color: rgba(255,255,255,.3);
  font-weight: 600; letter-spacing: .03em;
}
.mp-cta-perk-check { color: #4ade80; font-size: 13px; }

  /* ════════════════════════════════════
     MODAL
  ════════════════════════════════════ */
  .mp-modal-overlay {
    position: fixed; inset: 0;
    background: rgba(15,23,42,.75);
    display: flex; align-items: center; justify-content: center;
    z-index: 1000; padding: 20px;
    backdrop-filter: blur(6px);
  }
  .mp-modal {
    background: var(--card-bg);
    border-radius: 10px; padding: 36px;
    width: 100%; max-width: 460px;
    border: 1px solid var(--cream-dark);
    box-shadow: 0 24px 60px rgba(15,23,42,.3);
    position: relative;
    animation: mp-up .3s ease;
  }
  .mp-modal-close {
    position: absolute; top: 16px; right: 16px;
    background: none; border: none; font-size: 20px;
    color: var(--text-muted); cursor: pointer; line-height: 1;
  }
  .mp-modal-logo { display: flex; align-items: center; gap: 9px; margin-bottom: 22px; }
  .mp-modal-logo-icon {
    width: 30px; height: 30px; border-radius: 6px;
    background: var(--red);
    display: flex; align-items: center; justify-content: center;
  }
  .mp-modal-logo-text {
    font-family: 'Playfair Display', serif;
    font-size: 17px; font-weight: 700; color: var(--navy);
  }
  .mp-modal h2 {
    font-size: 24px; color: var(--navy); margin-bottom: 10px;
  }
  .mp-modal-sub { font-size: 14px; color: var(--text-muted); line-height: 1.65; margin-bottom: 24px; }
  .mp-modal-features { margin-bottom: 26px; display: flex; flex-direction: column; gap: 12px; }
  .mp-modal-feature { display: flex; align-items: flex-start; gap: 10px; font-size: 14px; color: var(--text); }
  .mp-modal-feature-check { color: var(--green); font-size: 15px; flex-shrink: 0; margin-top: 1px; }
  .mp-modal-cta {
    width: 100%; height: 48px;
    background: var(--red); color: #fff;
    border: none; border-radius: 4px;
    font-family: 'Lato', sans-serif; font-size: 14px; font-weight: 700;
    letter-spacing: .04em; text-transform: uppercase;
    cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
    transition: all .15s;
  }
  .mp-modal-cta:hover { background: var(--red-hover); transform: translateY(-1px); }
  .mp-modal-switch { text-align: center; margin-top: 16px; font-size: 13px; color: var(--text-muted); }
  .mp-modal-switch-link { color: var(--blue); font-weight: 700; cursor: pointer; }
  .mp-modal-footnote { font-size: 11px; color: var(--text-muted); text-align: center; margin-top: 10px; }

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

  /* ════════════════════════════════════
     EMPTY STATE
  ════════════════════════════════════ */
 .mp-empty {
  text-align: center; padding: 80px 24px;
}
.mp-empty-icon {
  width: 72px; height: 72px; margin: 0 auto 20px;
  background: rgba(99,102,241,.1);
  border: 1px solid rgba(99,102,241,.2);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center; font-size: 30px;
}
.mp-empty-title {
  font-family: 'Playfair Display', serif;
  font-size: 22px; font-weight: 600; color: #fff; margin-bottom: 10px;
}
.mp-empty-sub { font-size: 14px; color: rgba(255,255,255,.35); line-height: 1.6; }

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
    .mp-nav { padding: 0 20px; }
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

// ── Provider Card ─────────────────────────────────────────────────────────────

function ProviderCard({ provider: p, expanded, onToggle, onBook, delay }) {
  return (
    <div
      className={`mp-card${p.featured ? " featured" : ""}`}
      style={{ animationDelay: `${delay}ms` }}
      onClick={() => onToggle(p.id)}
    >
      {/* Top */}
      <div className="mp-card-top">
        <div
          className="mp-card-avatar"
          style={{ background: p.bg, color: p.tc }}
        >
          {p.initials}
        </div>
        <div className="mp-card-info">
          <div className="mp-card-name">{p.name}</div>
          <div className="mp-card-meta">
            {getIndustryLabel(p.industry)} · {p.loc}
          </div>
        </div>
        <div className="mp-card-right">
          {p.featured && (
            <span className="mp-card-featured-badge">Top Rated</span>
          )}
          <span className="mp-card-rate">{p.rate}</span>
        </div>
      </div>

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

      {/* Expanded */}
      {expanded && (
        <div className="mp-card-about">
          {p.about}
          <div className="mp-card-about-link">
            Register on SolidFlo to book this provider →
          </div>
        </div>
      )}

      {/* CTA */}
      <button
        className={`mp-card-btn ${p.avail ? "mp-card-btn-avail" : "mp-card-btn-unavail"}`}
        onClick={(e) => {
          e.stopPropagation();
          if (p.avail) onBook(p);
        }}
      >
        {p.avail ? "Book Now — Get a Quote" : "Currently Unavailable"}
      </button>
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
        "Receive & compare quotes instantly",
        "Manage invoices, jobs & payments in one place",
        "Starter plan — free forever, no credit card needed",
      ];

  return (
    <div className="mp-modal-overlay" onClick={onClose}>
      <div className="mp-modal" onClick={(e) => e.stopPropagation()}>
        <button className="mp-modal-close" onClick={onClose}>
          ✕
        </button>

        <div className="mp-modal-logo">
          
           <img src={logo} alt="SolidFlo" style={{ height: 44 }} />
        </div>

        <h2>
          {isLogin
            ? "Sign In to SolidFlo"
            : providerName
              ? `Book ${providerName}`
              : "Create Your Free Account"}
        </h2>
        <p className="mp-modal-sub">
          {isLogin
            ? "Access your account to manage bookings, quotes and service requests."
            : providerName
              ? `To book ${providerName} and receive a quote, you need a free SolidFlo account.`
              : "Join SolidFlo to post job requests, receive quotes from multiple providers, and manage your entire business in one place."}
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
          onClick={() => navigateTo(isLogin ? "/login" : "/register")}
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
                onClick={() => navigateTo("/register")}
              >
                Register free
              </span>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <span
                className="mp-modal-switch-link"
                onClick={() => navigateTo("/login")}
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
                  <span className="mp-hero-mini-star">
                    ★ {p.rating}
                  </span>
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

  const filtered =
    activeFilter === "all"
      ? PROVIDERS
      : PROVIDERS.filter((p) => p.industry === activeFilter);
  const featured = filtered.filter((p) => p.featured);
  const standard = filtered.filter((p) => !p.featured);
  const availCount = PROVIDERS.filter((p) => p.avail).length;

  // Scroll progress + nav scroll state
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
    (provider) => openModal("register", provider.name),
    [openModal],
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
              Post a Request
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

      {/* Stats strip */}
      <section className="mp-stats">
        <div className="mp-stats-inner">
          {[
            {
              icon: "👥",
              val: `${PROVIDERS.length}+`,
              lbl: "Listed Providers",
            },
            { icon: "✅", val: `${availCount}`, lbl: "Available Today" },
            { icon: "⭐", val: "4.7", lbl: "Average Rating" },
            { icon: "🏭", val: `${INDUSTRIES.length - 1}`, lbl: "Industries" },
          ].map((s, i) => (
            <div
              key={i}
              id={`mpstat-${i}`}
              data-anim
              className={`mp-stat-cell${visible[`mpstat-${i}`] ? " visible" : ""}`}
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <div className="mp-stat-cell-icon">{s.icon}</div>
              <div className="mp-stat-cell-val">{s.val}</div>
              <div className="mp-stat-cell-lbl">{s.lbl}</div>
            </div>
          ))}
        </div>
      </section>

     

     {/* Dark wrapper so the whole below-filter area is navy */}
<div style={{ background: "#fffff" }}>
  <div className="mp-layout">

    {/* ── Sidebar ── */}
    <aside className="mp-sidebar">
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
          ind.label.toLowerCase().includes(sidebarSearch.toLowerCase())
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
              {filtered.filter((p) => p.avail).length}
            </span>
            <span className="mp-avail-sub">Available now</span>
          </div>
          <div className="mp-avail-stat">
            <span className="mp-avail-num">{filtered.length}</span>
            <span className="mp-avail-sub">Total listed</span>
          </div>
        </div>
      </div>

      {/* Featured */}
      {featured.length > 0 && (
        <>
          <SectionTitle count={featured.length}>Recommended for you</SectionTitle>
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

      {/* Standard */}
      {standard.length > 0 && (
        <>
          {featured.length > 0 && (
            <SectionTitle count={standard.length}>More providers</SectionTitle>
          )}
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

      {/* Empty */}
      {filtered.length === 0 && (
        <div className="mp-empty">
          <div className="mp-empty-icon">
            {INDUSTRIES.find((i) => i.id === activeFilter)?.emoji || "🔍"}
          </div>
          <div className="mp-empty-title">
            No providers listed in this category yet
          </div>
          <div className="mp-empty-sub">
            Be the first to list your business — register on SolidFlo today.
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="mp-cta">
        <div className="mp-cta-inner">
          <div className="mp-cta-tag">For Businesses</div>
          <h2>Need a specific <em>service?</em></h2>
          <p>
            Post a job request and receive quotes directly from verified
            providers in your area — free to start, no credit card needed.
          </p>
          <div className="mp-cta-btns">
            <button className="mp-cta-primary" onClick={() => openModal("register")}>
              Post a Job Request
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M7 17L17 7M7 7h10v10" />
              </svg>
            </button>
            <button className="mp-cta-secondary" onClick={() => navigateTo("/")}>
              Learn More
            </button>
          </div>
          <div className="mp-cta-perks">
            {["Free to register", "No credit card required", "Starter plan forever free"].map((t) => (
              <span key={t} className="mp-cta-perk">
                <span className="mp-cta-perk-check">✓</span> {t}
              </span>
            ))}
          </div>
        </div>
      </div>

    </div>{/* end .mp-main */}
  </div>{/* end .mp-layout */}
</div>

{/* Footer */}
<footer className="mp-footer">
  <div className="mp-footer-upper">
    <div className="mp-footer-brand">
      <img src={logo} alt="SolidFlo" style={{ height: 40 }} />
      <p className="mp-footer-tagline">
        The marketplace for verified trade and professional service
        providers across Gauteng.
      </p>
    </div>
    <div className="mp-footer-links-group">
      <div className="mp-footer-links-label">Platform</div>
      <span className="mp-footer-link" onClick={() => navigateTo("/register")}>Register Free</span>
      <span className="mp-footer-link" onClick={() => navigateTo("/login")}>Sign In</span>
      <span className="mp-footer-link" onClick={() => openModal("register")}>Post a Job</span>
    </div>
    <div className="mp-footer-links-group">
      <div className="mp-footer-links-label">Industries</div>
      {INDUSTRIES.slice(1, 6).map((ind) => (
        <span
          key={ind.id}
          className="mp-footer-link"
          onClick={() => {
            document.getElementById("mp-filter")?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          {ind.emoji} {ind.label}
        </span>
      ))}
    </div>
    <div className="mp-footer-links-group">
      <div className="mp-footer-links-label">Company</div>
      <a className="mp-footer-link" href={SOLIDFLO_URL} target="_blank" rel="noopener noreferrer">solidflo.co.za</a>
    </div>
  </div>
  <div className="mp-footer-lower">
    <span className="mp-footer-copy">
      © {new Date().getFullYear()} SolidFlo · Marketplace for verified service providers in Gauteng
    </span>
    <div className="mp-footer-legal">
      <a href={`${SOLIDFLO_URL}/privacy`} target="_blank" rel="noopener noreferrer">Privacy</a>
      <a href={`${SOLIDFLO_URL}/terms`} target="_blank" rel="noopener noreferrer">Terms</a>
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
    </div>
  );
}
