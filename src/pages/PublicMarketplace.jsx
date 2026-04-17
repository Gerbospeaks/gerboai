/**
 * PublicMarketplace.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * SolidFlo Public-Facing Service Marketplace
 *
 * USAGE
 * ─────
 * 1. Drop this file into your src/pages/ (or src/components/) folder.
 * 2. Add the route in your router (e.g. React Router v6):
 *
 *      import PublicMarketplace from './pages/PublicMarketplace';
 *      <Route path="/marketplace" element={<PublicMarketplace />} />
 *
 * 3. Make sure Google Fonts are loaded. Add to your index.html <head>:
 *
 *      <link
 *        href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&family=Lato:wght@300;400;700;900&display=swap"
 *        rel="stylesheet"
 *      />
 *
 * 4. No extra npm packages required — pure React + inline styles.
 *
 * CUSTOMISATION
 * ─────────────
 * · PROVIDERS array  — add / remove / edit provider objects
 * · INDUSTRIES array — add new filter categories
 * · SOLIDFLO_URL     — change the base URL if your domain changes
 * · Colors           — edit the CSS_VARS object at the top
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useCallback, useEffect } from "react";

// ── Config ────────────────────────────────────────────────────────────────────

const SOLIDFLO_URL = "https://solidflo.co.za";

// ── Design tokens ─────────────────────────────────────────────────────────────

const T = {
  navy: "#1a2340",
  navyMid: "#2d3a55",
  red: "#e8442a",
  redHover: "#c73520",
  cream: "#f4f5f8",
  white: "#ffffff",
  border: "#d9dde6",
  text: "#1a2340",
  muted: "#8a93a6",
  green: "#1d8348",
  blue: "#1b6ec2",
};

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

const BADGE_STYLES = {
  green: { background: "#eafaf1", color: "#1d8348" },
  blue: { background: "#e8f0fb", color: "#1b6ec2" },
  amber: { background: "#fffbeb", color: "#b45309" },
  purple: { background: "#f3f0ff", color: "#6d28d9" },
};

function getIndustryLabel(id) {
  return (INDUSTRIES.find((i) => i.id === id) || { label: id }).label;
}

function navigateTo(path) {
  window.open(`${SOLIDFLO_URL}${path}`, "_blank", "noopener,noreferrer");
}

// ── Reusable style objects ────────────────────────────────────────────────────

const s = {
  // layout
  flex: (gap = 0, align = "center", wrap = false) => ({
    display: "flex",
    alignItems: align,
    gap,
    ...(wrap ? { flexWrap: "wrap" } : {}),
  }),
  grid: (cols, gap) => ({
    display: "grid",
    gridTemplateColumns: cols,
    gap,
  }),
  // text
  label: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: ".06em",
    textTransform: "uppercase",
  },
};

// ── Sub-components ────────────────────────────────────────────────────────────

function Badge({ label, type }) {
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 700,
        padding: "2px 8px",
        borderRadius: 20,
        ...BADGE_STYLES[type],
      }}
    >
      {label}
    </span>
  );
}

function SectionTitle({ children }) {
  return (
    <div
      style={{
        ...s.label,
        color: T.muted,
        display: "flex",
        alignItems: "center",
        gap: 10,
        margin: "28px 0 12px",
      }}
    >
      {children}
      <div style={{ flex: 1, height: 1, background: T.border }} />
    </div>
  );
}

// ── Provider Card ─────────────────────────────────────────────────────────────

function ProviderCard({ provider: p, expanded, onToggle, onBook }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={() => onToggle(p.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: T.white,
        border: p.featured ? `1.5px solid ${T.blue}` : `1px solid ${T.border}`,
        borderRadius: 5,
        padding: "16px",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        boxShadow: hovered ? "0 4px 20px rgba(26,35,64,.1)" : "none",
        transform: hovered ? "translateY(-1px)" : "none",
        transition: "box-shadow .15s, transform .15s",
      }}
    >
      {/* Top row */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 5,
            flexShrink: 0,
            background: p.bg,
            color: p.tc,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          {p.initials}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: T.text,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {p.name}
          </div>
          <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>
            {getIndustryLabel(p.industry)} · {p.loc}
          </div>
        </div>

        <div
          style={{
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 4,
          }}
        >
          {p.featured && (
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                background: "#e8f0fb",
                color: T.blue,
                padding: "2px 8px",
                borderRadius: 20,
              }}
            >
              Top Rated
            </span>
          )}
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: T.text,
              whiteSpace: "nowrap",
            }}
          >
            {p.rate}
          </span>
        </div>
      </div>

      {/* Badges */}
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
        {p.badges.map((b, i) => (
          <Badge key={i} label={b.l} type={b.t} />
        ))}
      </div>

      {/* Stats */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <span style={{ fontSize: 11, color: T.muted }}>
          <span style={{ color: "#f59e0b" }}>★</span> {p.rating} ({p.reviews})
        </span>
        <span style={{ fontSize: 11, color: T.muted }}>⏱ {p.response}</span>
        {!p.avail && (
          <span style={{ fontSize: 10, color: T.red, fontWeight: 700 }}>
            Unavailable
          </span>
        )}
      </div>

      {/* Expanded about */}
      {expanded && (
        <div
          style={{
            fontSize: 12,
            color: T.muted,
            lineHeight: 1.6,
            paddingTop: 8,
            borderTop: `1px solid ${T.border}`,
          }}
        >
          {p.about}
          <div
            style={{
              marginTop: 8,
              fontSize: 11,
              color: T.blue,
              fontWeight: 700,
            }}
          >
            Register on SolidFlo to book this provider →
          </div>
        </div>
      )}

      {/* Book button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (p.avail) onBook(p);
        }}
        style={{
          width: "100%",
          padding: "9px 0",
          borderRadius: 4,
          border: "none",
          fontFamily: "'Lato', sans-serif",
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: ".03em",
          cursor: p.avail ? "pointer" : "not-allowed",
          background: p.avail ? T.navy : "#eef0f5",
          color: p.avail ? "#fff" : T.muted,
          marginTop: 2,
          transition: "background .15s",
        }}
        onMouseEnter={(e) => {
          if (p.avail) e.currentTarget.style.background = "#0e1428";
        }}
        onMouseLeave={(e) => {
          if (p.avail) e.currentTarget.style.background = T.navy;
        }}
      >
        {p.avail ? "Book Now — Get a Quote" : "Currently Unavailable"}
      </button>
    </div>
  );
}

// ── Registration Modal ────────────────────────────────────────────────────────

function RegisterModal({ mode, providerName, onClose }) {
  const isLogin = mode === "login";

  // Close on Escape key
  useEffect(() => {
    const handle = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
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
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(20,26,48,.65)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: T.white,
          borderRadius: 6,
          padding: 32,
          width: "100%",
          maxWidth: 440,
          border: `1px solid ${T.border}`,
          boxShadow: "0 16px 48px rgba(20,26,48,.25)",
          position: "relative",
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: "none",
            border: "none",
            fontSize: 18,
            color: T.muted,
            cursor: "pointer",
            lineHeight: 1,
          }}
        >
          ✕
        </button>

        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 5,
              background: T.red,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="2.5"
            >
              <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m12-9l2 9M9 21h6" />
            </svg>
          </div>
          <span
            style={{
              fontSize: 16,
              fontWeight: 900,
              color: T.navy,
              fontFamily: "'Playfair Display', serif",
            }}
          >
            SolidFlo
          </span>
        </div>

        {/* Heading */}
        <h2
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 22,
            color: T.navy,
            marginBottom: 8,
          }}
        >
          {isLogin
            ? "Sign In to SolidFlo"
            : providerName
              ? `Book ${providerName}`
              : "Create Your Free Account"}
        </h2>
        <p
          style={{
            fontSize: 13,
            color: T.muted,
            lineHeight: 1.65,
            marginBottom: 22,
          }}
        >
          {isLogin
            ? "Access your account to manage bookings, quotes and service requests."
            : providerName
              ? `To book ${providerName} and receive a quote, you need a free SolidFlo account.`
              : "Join SolidFlo to post job requests, receive quotes from multiple providers, and manage your entire business in one place."}
        </p>

        {/* Features */}
        <div style={{ marginBottom: 22 }}>
          {features.map((f, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 8,
                fontSize: 13,
                color: T.text,
                marginBottom: 10,
              }}
            >
              <span
                style={{
                  color: T.green,
                  fontSize: 14,
                  flexShrink: 0,
                  marginTop: 1,
                }}
              >
                ✓
              </span>
              {f}
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={() => navigateTo(isLogin ? "/login" : "/register")}
          style={{
            width: "100%",
            height: 46,
            background: T.red,
            color: "#fff",
            border: "none",
            borderRadius: 4,
            fontFamily: "'Lato', sans-serif",
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: ".04em",
            textTransform: "uppercase",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            transition: "all .15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = T.redHover;
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = T.red;
            e.currentTarget.style.transform = "none";
          }}
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

        {/* Switch mode */}
        <p
          style={{
            textAlign: "center",
            marginTop: 14,
            fontSize: 12,
            color: T.muted,
          }}
        >
          {isLogin ? (
            <>
              Don't have an account?{" "}
              <span
                onClick={() => navigateTo("/register")}
                style={{ color: T.blue, fontWeight: 700, cursor: "pointer" }}
              >
                Register free
              </span>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <span
                onClick={() => navigateTo("/login")}
                style={{ color: T.blue, fontWeight: 700, cursor: "pointer" }}
              >
                Sign in
              </span>
            </>
          )}
        </p>
        {!isLogin && (
          <p
            style={{
              fontSize: 11,
              color: T.muted,
              textAlign: "center",
              marginTop: 8,
              letterSpacing: ".02em",
            }}
          >
            ✓ No credit card required &nbsp;·&nbsp; ✓ Free to start
          </p>
        )}
      </div>
    </div>
  );
}

// ── Hero Section ──────────────────────────────────────────────────────────────

function Hero({ availCount, totalCount, onPostJob }) {
  const [currentWord, setCurrentWord] = useState(0);
  const WORDS = ["Fast", "Simple", "Trusted", "Smart"];

  useEffect(() => {
    const t = setInterval(
      () => setCurrentWord((w) => (w + 1) % WORDS.length),
      2600,
    );
    return () => clearInterval(t);
  }, []);

  return (
    <div
      style={{
        background: T.navy,
        padding: "64px 32px 72px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse 60% 80% at 5% 50%, rgba(232,68,42,.12) 0%, transparent 55%), radial-gradient(ellipse 50% 60% at 95% 20%, rgba(27,110,194,.1) 0%, transparent 55%)",
        }}
      />

      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          position: "relative",
          zIndex: 2,
          display: "grid",
          gridTemplateColumns: "1.1fr 1fr",
          alignItems: "center",
          gap: 64,
        }}
      >
        {/* Left */}
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              padding: "5px 13px",
              borderRadius: 20,
              marginBottom: 22,
              background: "rgba(232,68,42,.15)",
              border: "1px solid rgba(232,68,42,.3)",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: ".06em",
              textTransform: "uppercase",
              color: "#ff9a85",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#4ade80",
                display: "inline-block",
              }}
            />
            {availCount} providers available now
          </div>

          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(2.4rem, 4vw, 3.6rem)",
              lineHeight: 1.08,
              color: "#fff",
              marginBottom: 20,
            }}
          >
            Find Trusted Providers{" "}
            <em
              style={{
                fontStyle: "italic",
                color: T.red,
                display: "inline-block",
                minWidth: 120,
              }}
            >
              {WORDS[currentWord]}
            </em>
          </h1>

          <p
            style={{
              fontSize: 16,
              color: "rgba(255,255,255,.6)",
              lineHeight: 1.7,
              marginBottom: 32,
              maxWidth: 480,
            }}
          >
            Browse, compare and book verified trade and professional service
            providers across Gauteng. No registration needed to browse.
          </p>

          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              marginBottom: 32,
            }}
          >
            <button
              onClick={() =>
                document
                  .getElementById("sf-filter-bar")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              style={{
                height: 50,
                padding: "0 28px",
                background: T.red,
                color: "#fff",
                border: "none",
                borderRadius: 4,
                fontFamily: "'Lato', sans-serif",
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: ".04em",
                textTransform: "uppercase",
                display: "flex",
                alignItems: "center",
                gap: 8,
                cursor: "pointer",
                transition: "all .15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = T.redHover;
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = T.red;
                e.currentTarget.style.transform = "none";
              }}
            >
              Browse Providers
            </button>
            <button
              onClick={onPostJob}
              style={{
                height: 50,
                padding: "0 24px",
                background: "rgba(255,255,255,.08)",
                color: "rgba(255,255,255,.85)",
                border: "1px solid rgba(255,255,255,.2)",
                borderRadius: 4,
                fontFamily: "'Lato', sans-serif",
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: ".04em",
                textTransform: "uppercase",
                cursor: "pointer",
                transition: "all .15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,.15)";
                e.currentTarget.style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,.08)";
                e.currentTarget.style.color = "rgba(255,255,255,.85)";
              }}
            >
              Post a Job ↗
            </button>
          </div>

          <div
            style={{
              display: "flex",
              gap: 20,
              flexWrap: "wrap",
              fontSize: 12,
              color: "rgba(255,255,255,.45)",
              fontWeight: 600,
            }}
          >
            {[
              "No sign-up to browse",
              "Verified professionals",
              "Gauteng-based",
            ].map((t) => (
              <span
                key={t}
                style={{ display: "flex", alignItems: "center", gap: 5 }}
              >
                <span style={{ color: "#4ade80" }}>✓</span> {t}
              </span>
            ))}
          </div>
        </div>

        {/* Right — stats panel (hidden on mobile via CSS class approach, inline responsive) */}
        <div
          style={{
            background: "rgba(255,255,255,.05)",
            border: "1px solid rgba(255,255,255,.1)",
            borderRadius: 8,
            padding: 4,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 4,
          }}
        >
          {[
            { icon: "🔧", val: totalCount, lbl: "Listed Providers" },
            { icon: "✅", val: availCount, lbl: "Available Today" },
            { icon: "⭐", val: "4.7", lbl: "Avg. Rating" },
            { icon: "🏭", val: INDUSTRIES.length - 1, lbl: "Industries" },
          ].map((stat, i) => (
            <div
              key={i}
              style={{
                background: "rgba(255,255,255,.06)",
                borderRadius: 6,
                padding: 20,
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              <div style={{ fontSize: 22 }}>{stat.icon}</div>
              <div
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 32,
                  fontWeight: 700,
                  color: "#fff",
                  lineHeight: 1,
                }}
              >
                {stat.val}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,.4)",
                  fontWeight: 700,
                  letterSpacing: ".05em",
                  textTransform: "uppercase",
                }}
              >
                {stat.lbl}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function PublicMarketplace() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [expandedCards, setExpandedCards] = useState({});
  const [modal, setModal] = useState(null); // { mode: 'register'|'login', providerName?: string }

  const filtered =
    activeFilter === "all"
      ? PROVIDERS
      : PROVIDERS.filter((p) => p.industry === activeFilter);
  const featured = filtered.filter((p) => p.featured);
  const standard = filtered.filter((p) => !p.featured);
  const availCount = PROVIDERS.filter((p) => p.avail).length;

  const openModal = useCallback((mode, providerName) => {
    setModal({ mode, providerName });
  }, []);

  const closeModal = useCallback(() => setModal(null), []);

  const toggleCard = useCallback((id) => {
    setExpandedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const handleBook = useCallback(
    (provider) => {
      openModal("register", provider.name);
    },
    [openModal],
  );

  const handleFilterChange = (id) => {
    setActiveFilter(id);
    setExpandedCards({});
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        fontFamily: "'Lato', sans-serif",
        background: T.cream,
        color: T.text,
        minHeight: "100vh",
      }}
    >
      {/* ── Topbar ── */}
      <div
        style={{
          background: T.navy,
          height: 56,
          padding: "0 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 100,
          borderBottom: "1px solid rgba(255,255,255,.08)",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 6,
              background: T.red,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="2.5"
            >
              <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m12-9l2 9M9 21h6" />
            </svg>
          </div>
          <span
            style={{
              fontSize: 16,
              fontWeight: 900,
              color: "#fff",
              fontFamily: "'Playfair Display', serif",
            }}
          >
            SolidFlo
          </span>
          <span
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,.35)",
              fontWeight: 700,
              letterSpacing: ".06em",
              textTransform: "uppercase",
              marginLeft: 2,
            }}
          >
            Marketplace
          </span>
        </div>

        {/* Nav actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => openModal("login")}
            style={{
              height: 34,
              padding: "0 16px",
              background: "rgba(255,255,255,.08)",
              border: "1px solid rgba(255,255,255,.15)",
              color: "rgba(255,255,255,.8)",
              borderRadius: 3,
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "'Lato', sans-serif",
              letterSpacing: ".04em",
              transition: "all .15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,.15)";
              e.currentTarget.style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,.08)";
              e.currentTarget.style.color = "rgba(255,255,255,.8)";
            }}
          >
            Sign In
          </button>
          <button
            onClick={() => openModal("register")}
            style={{
              height: 34,
              padding: "0 18px",
              background: T.red,
              color: "#fff",
              border: "none",
              borderRadius: 3,
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "'Lato', sans-serif",
              letterSpacing: ".04em",
              display: "flex",
              alignItems: "center",
              gap: 6,
              transition: "all .15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = T.redHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = T.red;
            }}
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

      {/* ── Hero ── */}
      <Hero
        availCount={availCount}
        totalCount={PROVIDERS.length}
        onPostJob={() => openModal("register")}
      />

      {/* ── Filter bar ── */}
      <div
        id="sf-filter-bar"
        style={{
          background: T.navyMid,
          padding: "0 32px",
          height: 42,
          display: "flex",
          alignItems: "center",
          gap: 4,
          overflowX: "auto",
          scrollbarWidth: "none",
          borderBottom: "1px solid rgba(255,255,255,.07)",
          position: "sticky",
          top: 56,
          zIndex: 90,
        }}
      >
        {INDUSTRIES.map((ind) => {
          const active = activeFilter === ind.id;
          return (
            <button
              key={ind.id}
              onClick={() => handleFilterChange(ind.id)}
              style={{
                height: 28,
                padding: "0 13px",
                borderRadius: 3,
                fontSize: 12,
                fontWeight: 700,
                whiteSpace: "nowrap",
                cursor: "pointer",
                border: "1px solid transparent",
                fontFamily: "'Lato', sans-serif",
                flexShrink: 0,
                background: active ? T.red : "transparent",
                color: active ? "#fff" : "rgba(255,255,255,.55)",
                borderColor: active ? T.red : "transparent",
                transition: "all .15s",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.color = "rgba(255,255,255,.85)";
                  e.currentTarget.style.background = "rgba(255,255,255,.08)";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.color = "rgba(255,255,255,.55)";
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              {ind.emoji} {ind.label}
            </button>
          );
        })}
      </div>

      {/* ── Content ── */}
      <div
        style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 32px 60px" }}
      >
        {/* Available banner */}
        <div
          style={{
            background: T.navy,
            borderRadius: 5,
            padding: "14px 20px",
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#4ade80",
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,.75)",
              fontWeight: 600,
            }}
          >
            Service providers available on the platform today
          </span>
          <div style={{ marginLeft: "auto", textAlign: "right" }}>
            <div
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 28,
                fontWeight: 700,
                color: "#fff",
                lineHeight: 1,
              }}
            >
              {filtered.filter((p) => p.avail).length}
            </div>
            <div
              style={{
                fontSize: 10,
                color: "rgba(255,255,255,.35)",
                letterSpacing: ".06em",
                textTransform: "uppercase",
              }}
            >
              Available now
            </div>
          </div>
        </div>

        {/* Featured providers */}
        {featured.length > 0 && (
          <>
            <SectionTitle>Recommended for you</SectionTitle>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 14,
                marginBottom: 6,
              }}
            >
              {featured.map((p) => (
                <ProviderCard
                  key={p.id}
                  provider={p}
                  expanded={!!expandedCards[p.id]}
                  onToggle={toggleCard}
                  onBook={handleBook}
                />
              ))}
            </div>
          </>
        )}

        {/* Standard providers */}
        {standard.length > 0 && (
          <>
            {featured.length > 0 && <SectionTitle>More providers</SectionTitle>}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 14,
                marginBottom: 6,
              }}
            >
              {standard.map((p) => (
                <ProviderCard
                  key={p.id}
                  provider={p}
                  expanded={!!expandedCards[p.id]}
                  onToggle={toggleCard}
                  onBook={handleBook}
                />
              ))}
            </div>
          </>
        )}

        {/* Empty state */}
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 16px" }}>
            <div
              style={{
                width: 56,
                height: 56,
                margin: "0 auto 12px",
                background: "#eef0f5",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
              }}
            >
              {INDUSTRIES.find((i) => i.id === activeFilter)?.emoji || "🔍"}
            </div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "#4a5568",
                marginBottom: 6,
              }}
            >
              No providers listed in this category yet
            </div>
            <div style={{ fontSize: 13, color: T.muted }}>
              Be the first to list your business — register on SolidFlo.
            </div>
          </div>
        )}

        {/* Post a job CTA */}
        <div
          style={{
            background: T.navy,
            borderRadius: 6,
            padding: "40px 32px",
            marginTop: 40,
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              background:
                "radial-gradient(ellipse 70% 80% at 20% 50%, rgba(232,68,42,.15) 0%, transparent 55%)",
            }}
          />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                padding: "5px 13px",
                borderRadius: 20,
                marginBottom: 18,
                background: "rgba(232,68,42,.15)",
                border: "1px solid rgba(232,68,42,.3)",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: ".06em",
                textTransform: "uppercase",
                color: "#ff9a85",
              }}
            >
              For Businesses
            </div>
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
                color: "#fff",
                marginBottom: 12,
              }}
            >
              Need a specific service?
            </h2>
            <p
              style={{
                fontSize: 15,
                color: "rgba(255,255,255,.55)",
                marginBottom: 28,
                lineHeight: 1.65,
                maxWidth: 520,
                margin: "0 auto 28px",
              }}
            >
              Register on SolidFlo to post a job request and receive quotes
              directly from verified providers in your area.
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={() => openModal("register")}
                style={{
                  height: 50,
                  padding: "0 28px",
                  background: T.red,
                  color: "#fff",
                  border: "none",
                  borderRadius: 4,
                  fontFamily: "'Lato', sans-serif",
                  fontSize: 14,
                  fontWeight: 700,
                  letterSpacing: ".04em",
                  textTransform: "uppercase",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  cursor: "pointer",
                  transition: "all .15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = T.redHover;
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 24px rgba(232,68,42,.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = T.red;
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = "none";
                }}
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
                onClick={() => navigateTo("/")}
                style={{
                  height: 50,
                  padding: "0 24px",
                  background: "rgba(255,255,255,.08)",
                  color: "rgba(255,255,255,.8)",
                  border: "1px solid rgba(255,255,255,.2)",
                  borderRadius: 4,
                  fontFamily: "'Lato', sans-serif",
                  fontSize: 14,
                  fontWeight: 700,
                  letterSpacing: ".04em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  transition: "all .15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,.15)";
                  e.currentTarget.style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,.08)";
                  e.currentTarget.style.color = "rgba(255,255,255,.8)";
                }}
              >
                Learn More about SolidFlo
              </button>
            </div>
            <p
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,.3)",
                marginTop: 16,
                letterSpacing: ".03em",
              }}
            >
              ✓ Free to register &nbsp;·&nbsp; ✓ No credit card required
              &nbsp;·&nbsp; ✓ Starter plan forever free
            </p>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div
        style={{
          background: T.navy,
          padding: "28px 32px",
          textAlign: "center",
          borderTop: "1px solid rgba(255,255,255,.06)",
        }}
      >
        <p
          style={{
            fontSize: 12,
            color: "rgba(255,255,255,.3)",
            letterSpacing: ".03em",
          }}
        >
          © {new Date().getFullYear()} SolidFlo &nbsp;·&nbsp;
          <a
            href={SOLIDFLO_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "rgba(255,255,255,.55)",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            solidflo.co.za
          </a>
          &nbsp;·&nbsp; Marketplace for verified service providers in Gauteng
        </p>
      </div>

      {/* ── Modal ── */}
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
