import { useState, useCallback } from "react";

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
  { id: "pool-services", label: "Pool Services", emoji: "🏊" },
  { id: "realestate", label: "Real Estate", emoji: "🏠" },
  { id: "restaurants", label: "Restaurants", emoji: "🍽️" },
  { id: "retail", label: "Retail", emoji: "🛍️" },
  { id: "security", label: "Security", emoji: "🔒" },
  { id: "solar-installation", label: "Solar", emoji: "☀️" },
  { id: "towing", label: "Towing", emoji: "🚗" },
  { id: "welding", label: "Welding", emoji: "🔥" },
  { id: "flooring", label: "Flooring", emoji: "🪵" },
  { id: "window-repair", label: "Window Repair", emoji: "🪟" },
];

const PROVIDERS = [
  {
    id: "p1",
    industry: "mechanics",
    name: "Jake's Motor Workshop",
    location: "Randburg, JHB",
    rate: "R450/hr",
    rating: 4.9,
    reviews: 38,
    response: "~20 min",
    available: true,
    featured: true,
    initials: "JM",
    color: "#fef9c3",
    textColor: "#854d0e",
    badges: [
      { label: "Available today", type: "green" },
      { label: "Fleet servicing", type: "blue" },
      { label: "Diagnostics", type: "blue" },
    ],
    about:
      "Specialist in fleet vehicle maintenance and roadworthy inspections.",
  },
  {
    id: "p2",
    industry: "mechanics",
    name: "AutoPro Services",
    location: "Sandton, JHB",
    rate: "R380/hr",
    rating: 4.7,
    reviews: 22,
    response: "~45 min",
    available: false,
    featured: false,
    initials: "AP",
    color: "#fee2e2",
    textColor: "#991b1b",
    badges: [
      { label: "Engine rebuild", type: "blue" },
      { label: "Gearbox", type: "purple" },
    ],
    about: "Full mechanical overhaul specialists with 15 years experience.",
  },
  {
    id: "p3",
    industry: "electrical",
    name: "PowerEdge Electrical",
    location: "Midrand, JHB",
    rate: "R500/hr",
    rating: 4.8,
    reviews: 51,
    response: "~30 min",
    available: true,
    featured: true,
    initials: "PE",
    color: "#dbeafe",
    textColor: "#1e40af",
    badges: [
      { label: "Available today", type: "green" },
      { label: "COC certified", type: "blue" },
      { label: "Solar wiring", type: "amber" },
    ],
    about:
      "Licensed electricians for residential, commercial and industrial projects.",
  },
  {
    id: "p4",
    industry: "electrical",
    name: "Volt Masters",
    location: "Roodepoort, JHB",
    rate: "R420/hr",
    rating: 4.6,
    reviews: 17,
    response: "~1 hr",
    available: true,
    featured: false,
    initials: "VM",
    color: "#ede9fe",
    textColor: "#5b21b6",
    badges: [
      { label: "DB upgrades", type: "blue" },
      { label: "Fault finding", type: "amber" },
    ],
    about: "Fast fault diagnosis and after-hours emergency call-outs.",
  },
  {
    id: "p5",
    industry: "carpentry",
    name: "TimberWorks Carpentry",
    location: "Pretoria East",
    rate: "R320/hr",
    rating: 4.7,
    reviews: 29,
    response: "~1 hr",
    available: true,
    featured: false,
    initials: "TW",
    color: "#dcfce7",
    textColor: "#166534",
    badges: [
      { label: "Available today", type: "green" },
      { label: "Custom built-ins", type: "blue" },
      { label: "Doors & frames", type: "blue" },
    ],
    about: "Bespoke timber solutions for homes and commercial spaces.",
  },
  {
    id: "p6",
    industry: "plumbing",
    name: "FlowRight Plumbing",
    location: "Centurion, PTA",
    rate: "R400/hr",
    rating: 4.8,
    reviews: 44,
    response: "~25 min",
    available: true,
    featured: true,
    initials: "FR",
    color: "#e0f2fe",
    textColor: "#0369a1",
    badges: [
      { label: "Available today", type: "green" },
      { label: "Emergency callouts", type: "amber" },
      { label: "Leak detection", type: "blue" },
    ],
    about: "24/7 emergency plumbing and complete bathroom renovations.",
  },
  {
    id: "p7",
    industry: "logistics",
    name: "SA Courier Express",
    location: "JHB South",
    rate: "R2 800/run",
    rating: 4.5,
    reviews: 67,
    response: "~15 min",
    available: true,
    featured: false,
    initials: "SC",
    color: "#fdf4ff",
    textColor: "#7e22ce",
    badges: [
      { label: "Same-day delivery", type: "green" },
      { label: "Nationwide", type: "blue" },
      { label: "Refrigerated", type: "blue" },
    ],
    about: "Cold-chain and standard courier services across South Africa.",
  },
  {
    id: "p8",
    industry: "logistics",
    name: "SwiftMove Logistics",
    location: "East Rand, JHB",
    rate: "R1 500/run",
    rating: 4.4,
    reviews: 33,
    response: "~30 min",
    available: false,
    featured: false,
    initials: "SM",
    color: "#fff7ed",
    textColor: "#c2410c",
    badges: [
      { label: "Office relocation", type: "blue" },
      { label: "Pallet freight", type: "purple" },
    ],
    about: "Heavy freight and office/warehouse relocation specialists.",
  },
  {
    id: "p9",
    industry: "construction",
    name: "BuildRight Construction",
    location: "Pretoria North",
    rate: "R650/hr",
    rating: 4.9,
    reviews: 12,
    response: "~2 hrs",
    available: true,
    featured: true,
    initials: "BR",
    color: "#fef9c3",
    textColor: "#854d0e",
    badges: [
      { label: "CIDB registered", type: "blue" },
      { label: "Renovations", type: "green" },
      { label: "Extensions", type: "blue" },
    ],
    about:
      "Fully CIDB-accredited contractor for residential and commercial builds.",
  },
  {
    id: "p10",
    industry: "accounting",
    name: "ClearBooks Accounting",
    location: "Hatfield, PTA",
    rate: "R350/hr",
    rating: 4.9,
    reviews: 88,
    response: "~1 hr",
    available: true,
    featured: true,
    initials: "CB",
    color: "#f0fdf4",
    textColor: "#166534",
    badges: [
      { label: "SAIPA registered", type: "green" },
      { label: "SARS submissions", type: "blue" },
      { label: "Payroll", type: "blue" },
    ],
    about:
      "Registered accountants handling SME bookkeeping, VAT and tax submissions.",
  },
  {
    id: "p11",
    industry: "cleaning",
    name: "SparkleClean Pro",
    location: "Boksburg, JHB",
    rate: "R280/hr",
    rating: 4.6,
    reviews: 55,
    response: "~20 min",
    available: true,
    featured: false,
    initials: "SP",
    color: "#ecfdf5",
    textColor: "#065f46",
    badges: [
      { label: "Available today", type: "green" },
      { label: "Deep clean", type: "blue" },
      { label: "Industrial", type: "amber" },
    ],
    about: "Industrial and domestic deep-cleaning with eco-friendly products.",
  },
  {
    id: "p12",
    industry: "education",
    name: "BrightMinds Tutoring",
    location: "Fourways, JHB",
    rate: "R250/hr",
    rating: 4.8,
    reviews: 41,
    response: "~45 min",
    available: true,
    featured: false,
    initials: "BM",
    color: "#fdf4ff",
    textColor: "#7e22ce",
    badges: [
      { label: "Maths & Science", type: "purple" },
      { label: "Online sessions", type: "blue" },
    ],
    about: "Grade 8-12 tutoring specialists with 95% matric pass rate.",
  },
  {
    id: "p13",
    industry: "health",
    name: "PrimeCare Occupational Health",
    location: "Rosebank, JHB",
    rate: "R800/hr",
    rating: 4.9,
    reviews: 26,
    response: "~1 hr",
    available: true,
    featured: true,
    initials: "PC",
    color: "#fef2f2",
    textColor: "#991b1b",
    badges: [
      { label: "IOD assessments", type: "amber" },
      { label: "Pre-employment", type: "blue" },
      { label: "On-site", type: "green" },
    ],
    about:
      "Occupational health services including medicals, IOD and wellness screenings.",
  },
  {
    id: "p14",
    industry: "hotel",
    name: "EventSpace Hospitality",
    location: "Sandton, JHB",
    rate: "Custom quote",
    rating: 4.7,
    reviews: 19,
    response: "~2 hrs",
    available: true,
    featured: false,
    initials: "ES",
    color: "#fffbeb",
    textColor: "#78350f",
    badges: [
      { label: "Conference setup", type: "blue" },
      { label: "Catering", type: "amber" },
      { label: "AV equipment", type: "purple" },
    ],
    about:
      "Full event and conference management with catering and AV solutions.",
  },
  {
    id: "p15",
    industry: "hvac",
    name: "AirMaster HVAC",
    location: "Midrand, JHB",
    rate: "R480/hr",
    rating: 4.7,
    reviews: 34,
    response: "~30 min",
    available: true,
    featured: true,
    initials: "AM",
    color: "#e0f2fe",
    textColor: "#075985",
    badges: [
      { label: "Available today", type: "green" },
      { label: "VRV systems", type: "blue" },
      { label: "Maintenance", type: "blue" },
    ],
    about:
      "Commercial and industrial HVAC installation, servicing and emergency repairs.",
  },
  {
    id: "p16",
    industry: "landscaping",
    name: "GreenScape Landscaping",
    location: "Waterkloof, PTA",
    rate: "R300/hr",
    rating: 4.6,
    reviews: 48,
    response: "~1 hr",
    available: false,
    featured: false,
    initials: "GS",
    color: "#f0fdf4",
    textColor: "#14532d",
    badges: [
      { label: "Garden design", type: "green" },
      { label: "Irrigation", type: "blue" },
      { label: "Maintenance", type: "blue" },
    ],
    about:
      "Landscape architects and maintenance crews for residential and commercial.",
  },
  {
    id: "p17",
    industry: "legal",
    name: "Mokoena Attorneys Inc.",
    location: "Menlyn, PTA",
    rate: "R1 200/hr",
    rating: 4.9,
    reviews: 15,
    response: "~4 hrs",
    available: true,
    featured: false,
    initials: "MA",
    color: "#f8fafc",
    textColor: "#334155",
    badges: [
      { label: "Commercial law", type: "blue" },
      { label: "Labour disputes", type: "amber" },
      { label: "Contracts", type: "purple" },
    ],
    about:
      "Boutique commercial law firm specialising in SME contracts and labour.",
  },
  {
    id: "p18",
    industry: "painting",
    name: "PerfectCoat Painters",
    location: "Alberton, JHB",
    rate: "R280/hr",
    rating: 4.5,
    reviews: 62,
    response: "~45 min",
    available: true,
    featured: false,
    initials: "PP",
    color: "#fff1f2",
    textColor: "#9f1239",
    badges: [
      { label: "Available today", type: "green" },
      { label: "Interior & exterior", type: "blue" },
      { label: "Waterproofing", type: "amber" },
    ],
    about:
      "Professional painters with 10+ years experience across residential and commercial.",
  },
  {
    id: "p19",
    industry: "pest-control",
    name: "BugBusters Pest Control",
    location: "Kempton Park, JHB",
    rate: "R550 flat",
    rating: 4.6,
    reviews: 37,
    response: "~30 min",
    available: true,
    featured: false,
    initials: "BB",
    color: "#fff7ed",
    textColor: "#9a3412",
    badges: [
      { label: "Same-day service", type: "green" },
      { label: "Fumigation", type: "amber" },
      { label: "Rodent control", type: "blue" },
    ],
    about:
      "Registered pest control operators for residential and commercial premises.",
  },
  {
    id: "p20",
    industry: "photography",
    name: "LensLab Photography",
    location: "Melrose, JHB",
    rate: "R1 800/half-day",
    rating: 4.9,
    reviews: 43,
    response: "~2 hrs",
    available: false,
    featured: false,
    initials: "LL",
    color: "#1e1b4b",
    textColor: "#c7d2fe",
    badges: [
      { label: "Product shoots", type: "purple" },
      { label: "Corporate events", type: "blue" },
      { label: "Drone footage", type: "amber" },
    ],
    about:
      "Award-winning commercial and event photographers with drone capability.",
  },
  {
    id: "p21",
    industry: "pool-services",
    name: "AquaClear Pool Services",
    location: "Centurion, PTA",
    rate: "R350/visit",
    rating: 4.7,
    reviews: 29,
    response: "~1 hr",
    available: true,
    featured: false,
    initials: "AC",
    color: "#ecfeff",
    textColor: "#0e7490",
    badges: [
      { label: "Weekly service", type: "blue" },
      { label: "Equipment repair", type: "amber" },
      { label: "Chemical balance", type: "green" },
    ],
    about: "Full pool maintenance, chemical balancing and pump/filter repairs.",
  },
  {
    id: "p22",
    industry: "realestate",
    name: "PropertyPro Agents",
    location: "Midrand, JHB",
    rate: "Commission-based",
    rating: 4.8,
    reviews: 31,
    response: "~2 hrs",
    available: true,
    featured: false,
    initials: "PR",
    color: "#f8fafc",
    textColor: "#0f172a",
    badges: [
      { label: "Commercial listings", type: "blue" },
      { label: "Property valuations", type: "purple" },
      { label: "Lease agreements", type: "amber" },
    ],
    about: "Specialist commercial and industrial property agents in Gauteng.",
  },
  {
    id: "p23",
    industry: "restaurants",
    name: "Chef's Table Catering",
    location: "Morningside, JHB",
    rate: "R180/person",
    rating: 4.8,
    reviews: 56,
    response: "~1 hr",
    available: true,
    featured: false,
    initials: "CT",
    color: "#fdf4ff",
    textColor: "#6b21a8",
    badges: [
      { label: "Corporate events", type: "purple" },
      { label: "Set menus", type: "blue" },
      { label: "Halaal certified", type: "green" },
    ],
    about:
      "Professional catering for corporate functions, launches and team events.",
  },
  {
    id: "p24",
    industry: "retail",
    name: "ShelfSet Retail Solutions",
    location: "JHB CBD",
    rate: "Custom quote",
    rating: 4.5,
    reviews: 14,
    response: "~3 hrs",
    available: true,
    featured: false,
    initials: "SS",
    color: "#fef9c3",
    textColor: "#713f12",
    badges: [
      { label: "Store fit-out", type: "blue" },
      { label: "Planograms", type: "amber" },
      { label: "POS systems", type: "purple" },
    ],
    about:
      "End-to-end retail merchandising, store layouts and POS installations.",
  },
  {
    id: "p25",
    industry: "security",
    name: "ShieldGuard Security",
    location: "Germiston, JHB",
    rate: "R220/hr",
    rating: 4.7,
    reviews: 48,
    response: "~15 min",
    available: true,
    featured: true,
    initials: "SG",
    color: "#1e293b",
    textColor: "#94a3b8",
    badges: [
      { label: "Armed response", type: "amber" },
      { label: "CCTV install", type: "blue" },
      { label: "Site guards", type: "green" },
    ],
    about:
      "PSiRA-registered security company providing armed, guarding and CCTV services.",
  },
  {
    id: "p26",
    industry: "solar-installation",
    name: "SunPower Solar Installs",
    location: "Pretoria, PTA",
    rate: "Custom quote",
    rating: 4.8,
    reviews: 22,
    response: "~1 hr",
    available: true,
    featured: false,
    initials: "SP2",
    color: "#fef9c3",
    textColor: "#713f12",
    badges: [
      { label: "Off-grid systems", type: "amber" },
      { label: "Grid-tied", type: "blue" },
      { label: "Maintenance", type: "green" },
    ],
    about:
      "NRS097 compliant solar installers for commercial and residential rooftops.",
  },
  {
    id: "p27",
    industry: "towing",
    name: "FastTow Roadside Assist",
    location: "N1 North Corridor",
    rate: "R800 flat",
    rating: 4.5,
    reviews: 71,
    response: "~10 min",
    available: true,
    featured: false,
    initials: "FT",
    color: "#fee2e2",
    textColor: "#991b1b",
    badges: [
      { label: "24/7 available", type: "green" },
      { label: "Flatbed towing", type: "blue" },
      { label: "Accident recovery", type: "amber" },
    ],
    about:
      "24-hour roadside assistance and accident recovery across Gauteng highways.",
  },
  {
    id: "p28",
    industry: "welding",
    name: "IronFusion Welding",
    location: "Vereeniging, VTW",
    rate: "R380/hr",
    rating: 4.6,
    reviews: 18,
    response: "~1 hr",
    available: false,
    featured: false,
    initials: "IF",
    color: "#1c1917",
    textColor: "#d6d3d1",
    badges: [
      { label: "Structural steel", type: "blue" },
      { label: "Aluminium", type: "purple" },
      { label: "On-site welding", type: "amber" },
    ],
    about:
      "Certified welders for structural, fabrication and pipe welding projects.",
  },
  {
    id: "p29",
    industry: "flooring",
    name: "FloorMaster Installations",
    location: "Bryanston, JHB",
    rate: "R180/m²",
    rating: 4.7,
    reviews: 36,
    response: "~1 hr",
    available: true,
    featured: false,
    initials: "FM",
    color: "#fdf4ff",
    textColor: "#581c87",
    badges: [
      { label: "Epoxy", type: "purple" },
      { label: "Vinyl plank", type: "blue" },
      { label: "Hardwood", type: "amber" },
    ],
    about:
      "Commercial and residential flooring specialists across all materials.",
  },
  {
    id: "p30",
    industry: "window-repair",
    name: "ClearView Window Repairs",
    location: "Benoni, JHB",
    rate: "R350/hr",
    rating: 4.6,
    reviews: 24,
    response: "~30 min",
    available: true,
    featured: false,
    initials: "CV",
    color: "#ecfeff",
    textColor: "#164e63",
    badges: [
      { label: "Double glazing", type: "blue" },
      { label: "Aluminium frames", type: "purple" },
      { label: "Shopfronts", type: "amber" },
    ],
    about:
      "Window repairs, replacements and shopfront glazing for commercial properties.",
  },
];

const INITIAL_INCOMING = [
  {
    id: "r1",
    from: "SparkleClean Pro",
    fromIndustry: "cleaning",
    service: "Fleet vehicle servicing — 4 vans due for 10 000 km service",
    address: "14 Industrial Road, Boksburg",
    date: "2025-08-18",
    time: "08:00",
    urgency: "Standard (2-3 days)",
    attachedDoc: "New purchase order",
    receivedAt: "2 hours ago",
    status: "new",
  },
  {
    id: "r2",
    from: "BuildRight Construction",
    fromIndustry: "construction",
    service: "Electrical COC required for new commercial premises, 3-phase DB",
    address: "Plot 22, Pretoria North Industrial",
    date: "2025-08-19",
    time: "07:30",
    urgency: "Urgent (today/tomorrow)",
    attachedDoc: "Current quote",
    receivedAt: "Yesterday",
    status: "quoted",
    quoteAmount: "R3 200",
  },
  {
    id: "r3",
    from: "ClearBooks Accounting",
    fromIndustry: "accounting",
    service: "Monthly bookkeeping catchup — 6 months behind, Xero setup needed",
    address: "Online / remote",
    date: "2025-08-20",
    time: "10:00",
    urgency: "Flexible (within a week)",
    attachedDoc: "None",
    receivedAt: "3 days ago",
    status: "accepted",
  },
];

const INITIAL_MY_REQS = [
  {
    id: 1,
    name: "Jake's Motor Workshop",
    industry: "mechanics",
    date: "2 days ago",
    status: "confirmed",
  },
  {
    id: 2,
    name: "PowerEdge Electrical",
    industry: "electrical",
    date: "5 days ago",
    status: "progress",
  },
  {
    id: 3,
    name: "SA Courier Express",
    industry: "logistics",
    date: "today",
    status: "pending",
  },
];

const STATUS_PILL = {
  confirmed: { bg: "#eafaf1", color: "#1d8348", label: "Confirmed" },
  progress: { bg: "#e8f0fb", color: "#1b6ec2", label: "In progress" },
  pending: { bg: "#fffbeb", color: "#b45309", label: "Awaiting quote" },
};

const INC_STATUS = {
  new: { label: "New request", bg: "#f3f0ff", color: "#6d28d9" },
  quoted: { label: "Quote sent", bg: "#fffbeb", color: "#b45309" },
  accepted: { label: "Accepted", bg: "#eafaf1", color: "#1d8348" },
  declined: { label: "Declined", bg: "#fdf2f0", color: "#e8442a" },
};

const URGENCY_STYLES = {
  "Urgent (today/tomorrow)": { bg: "#fdf2f0", color: "#e8442a" },
  "Standard (2-3 days)": { bg: "#e8f0fb", color: "#1b6ec2" },
  "Flexible (within a week)": { bg: "#eafaf1", color: "#1d8348" },
};

const BADGE_COLORS = {
  green: { bg: "#eafaf1", color: "#1d8348" },
  blue: { bg: "#e8f0fb", color: "#1b6ec2" },
  amber: { bg: "#fffbeb", color: "#b45309" },
  purple: { bg: "#f3f0ff", color: "#6d28d9" },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function getLabel(id) {
  return (INDUSTRIES.find((i) => i.id === id) || { label: id }).label;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Toast({ message }) {
  return message ? (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        background: "#1d8348",
        color: "#fff",
        fontSize: 13,
        fontWeight: 700,
        padding: "10px 20px",
        borderRadius: 4,
        zIndex: 9999,
        whiteSpace: "nowrap",
        boxShadow: "0 4px 16px rgba(20,26,48,.2)",
        pointerEvents: "none",
      }}
    >
      {message}
    </div>
  ) : null;
}

function Badge({ label, type }) {
  const c = BADGE_COLORS[type] || BADGE_COLORS.blue;
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 700,
        padding: "2px 7px",
        borderRadius: 20,
        background: c.bg,
        color: c.color,
      }}
    >
      {label}
    </span>
  );
}

function ProviderCard({ provider, expanded, onToggle, onBook }) {
  const p = provider;
  return (
    <div
      onClick={() => onToggle(p.id)}
      style={{
        background: "#fff",
        border: p.featured ? "1.5px solid #1b6ec2" : "1px solid #d9dde6",
        borderRadius: 4,
        padding: "14px 16px",
        cursor: "pointer",
        boxShadow: "none",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        transition: "box-shadow .15s",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.boxShadow = "0 2px 12px rgba(20,26,48,.08)")
      }
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
    >
      {/* Top row */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 4,
            flexShrink: 0,
            background: p.color,
            color: p.textColor,
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
              color: "#1a2340",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {p.name}
          </div>
          <div style={{ fontSize: 11, color: "#8a93a6", marginTop: 2 }}>
            {getLabel(p.industry)} · {p.location}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 4,
            flexShrink: 0,
          }}
        >
          {p.featured && (
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                background: "#e8f0fb",
                color: "#1b6ec2",
                padding: "2px 7px",
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
              color: "#1a2340",
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
          <Badge key={i} label={b.label} type={b.type} />
        ))}
      </div>

      {/* Meta */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            fontSize: 11,
            color: "#8a93a6",
            display: "flex",
            alignItems: "center",
            gap: 3,
          }}
        >
          <span style={{ color: "#f59e0b" }}>★</span>
          {p.rating} ({p.reviews})
        </span>
        <span style={{ fontSize: 11, color: "#8a93a6" }}>⏱ {p.response}</span>
        {!p.available && (
          <span style={{ fontSize: 10, color: "#e8442a", fontWeight: 700 }}>
            Unavailable
          </span>
        )}
      </div>

      {/* Expanded about */}
      {expanded && (
        <div
          style={{
            fontSize: 11,
            color: "#8a93a6",
            lineHeight: 1.5,
            paddingTop: 8,
            borderTop: "1px solid #d9dde6",
          }}
        >
          {p.about}
        </div>
      )}

      {/* Book button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onBook(p.id);
        }}
        style={{
          width: "100%",
          fontSize: 12,
          fontWeight: 700,
          padding: 8,
          borderRadius: 4,
          border: "none",
          cursor: p.available ? "pointer" : "not-allowed",
          fontFamily: "Lato, sans-serif",
          background: p.available ? "#1a2340" : "#eef0f5",
          color: p.available ? "#fff" : "#8a93a6",
          marginTop: 2,
        }}
      >
        {p.available ? "Book Now" : "Currently Unavailable"}
      </button>
    </div>
  );
}

function BookingPanel({ provider, onClose, onSubmit }) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("09:00");
  const [address, setAddress] = useState("");
  const [desc, setDesc] = useState("");
  const [urgency, setUrgency] = useState("Standard (2-3 days)");
  const [doc, setDoc] = useState("None");
  const [err, setErr] = useState("");

  const handleSubmit = () => {
    if (!date || !desc.trim()) {
      setErr("Please fill in the date and describe what you need.");
      return;
    }
    onSubmit(provider);
  };

  const inputStyle = {
    fontSize: 13,
    padding: "8px 10px",
    borderRadius: 4,
    border: "1px solid #d9dde6",
    background: "#fff",
    color: "#1a2340",
    width: "100%",
    outline: "none",
    fontFamily: "Lato, sans-serif",
    boxSizing: "border-box",
  };
  const labelStyle = {
    fontSize: 11,
    fontWeight: 700,
    color: "#4a5568",
    textTransform: "uppercase",
    letterSpacing: ".05em",
    display: "block",
    marginBottom: 4,
  };

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #d9dde6",
        borderRadius: 4,
        overflow: "hidden",
        marginBottom: 12,
      }}
    >
      <div
        style={{
          background: "#f0f2f6",
          borderBottom: "1px solid #d9dde6",
          padding: "10px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "#1a2340",
            textTransform: "uppercase",
            letterSpacing: ".05em",
          }}
        >
          Book — {provider.name}
        </span>
        <span style={{ fontSize: 11, color: "#8a93a6" }}>{provider.rate}</span>
      </div>
      <div style={{ padding: 16 }}>
        <div
          style={{
            background: "#1a2340",
            borderRadius: 4,
            padding: "10px 14px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <span style={{ fontSize: 12, color: "rgba(255,255,255,.6)" }}>
            {getLabel(provider.industry)} · {provider.location}
          </span>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>
            {provider.rate}
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            marginBottom: 10,
          }}
        >
          <div>
            <label style={labelStyle}>Service date</label>
            <input
              type="date"
              style={inputStyle}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div>
            <label style={labelStyle}>Preferred time</label>
            <input
              type="time"
              style={inputStyle}
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label style={labelStyle}>Service address</label>
          <input
            type="text"
            style={inputStyle}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Your property or site address"
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label style={labelStyle}>Describe what you need</label>
          <textarea
            style={{ ...inputStyle, resize: "vertical", minHeight: 64 }}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder={provider.about}
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            marginBottom: 10,
          }}
        >
          <div>
            <label style={labelStyle}>Urgency</label>
            <select
              style={inputStyle}
              value={urgency}
              onChange={(e) => setUrgency(e.target.value)}
            >
              <option>Standard (2-3 days)</option>
              <option>Urgent (today/tomorrow)</option>
              <option>Flexible (within a week)</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Attach to document</label>
            <select
              style={inputStyle}
              value={doc}
              onChange={(e) => setDoc(e.target.value)}
            >
              <option>None</option>
              <option>Current quote</option>
              <option>Current invoice</option>
              <option>New purchase order</option>
            </select>
          </div>
        </div>

        {err && (
          <div style={{ fontSize: 12, color: "#e8442a", marginBottom: 8 }}>
            {err}
          </div>
        )}

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={onClose}
            style={{
              fontSize: 13,
              fontWeight: 700,
              padding: "9px 16px",
              borderRadius: 4,
              background: "#f0f2f6",
              color: "#4a5568",
              border: "1px solid #d9dde6",
              cursor: "pointer",
              fontFamily: "Lato, sans-serif",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            style={{
              flex: 1,
              fontSize: 13,
              fontWeight: 700,
              padding: 9,
              borderRadius: 4,
              background: "#1d8348",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              fontFamily: "Lato, sans-serif",
            }}
          >
            Send Booking Request
          </button>
        </div>
      </div>
    </div>
  );
}

function MarketView({ onShowIncoming }) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [bookingProvider, setBookingProvider] = useState(null);
  const [expandedCards, setExpandedCards] = useState({});
  const [myReqs, setMyReqs] = useState(INITIAL_MY_REQS);
  const [toast, setToast] = useState("");

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  }, []);

  const filtered =
    activeCategory === "all"
      ? PROVIDERS
      : PROVIDERS.filter((p) => p.industry === activeCategory);
  const featured = filtered.filter((p) => p.featured);
  const standard = filtered.filter((p) => !p.featured);
  const availCount = PROVIDERS.filter((p) => p.available).length;

  const toggleCard = (id) =>
    setExpandedCards((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleBook = (id) => {
    const p = PROVIDERS.find((x) => x.id === id);
    if (!p?.available) return;
    setBookingProvider(p);
  };

  const handleSubmitBooking = (p) => {
    setMyReqs((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: p.name,
        industry: p.industry,
        date: "Just now",
        status: "pending",
      },
    ]);
    setBookingProvider(null);
    showToast(
      `Booking request sent to ${p.name}. They'll respond with a quote shortly.`,
    );
  };

  const chipStyle = (active) => ({
    fontSize: 12,
    fontWeight: 600,
    padding: "4px 12px",
    borderRadius: 3,
    whiteSpace: "nowrap",
    cursor: "pointer",
    border: active ? "1px solid #e8442a" : "1px solid transparent",
    color: active ? "#fff" : "rgba(255,255,255,.6)",
    background: active ? "#e8442a" : "transparent",
    fontFamily: "Lato, sans-serif",
    height: 28,
    display: "flex",
    alignItems: "center",
    transition: "all .15s",
  });

  return (
    <div
      style={{
        background: "#f4f5f8",
        minHeight: "100vh",
        fontFamily: "Lato, sans-serif",
      }}
    >
      {/* Topbar */}
      <div
        style={{
          background: "#1a2340",
          height: 52,
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          borderBottom: "1px solid rgba(255,255,255,.08)",
          position: "sticky",
          top: 0,
          zIndex: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "#e8442a",
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
              strokeWidth="2"
            >
              <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m12-9l2 9M9 21h6" />
            </svg>
          </div>
          <span
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "#fff",
              letterSpacing: ".01em",
            }}
          >
            Service Marketplace
          </span>
          <span
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,.45)",
              marginLeft: 6,
            }}
          >
            Marketplace › Browse
          </span>
        </div>
        <button
          onClick={onShowIncoming}
          style={{
            background: "#e8442a",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 700,
            padding: "0 16px",
            height: 32,
            borderRadius: 4,
            fontFamily: "Lato, sans-serif",
            whiteSpace: "nowrap",
          }}
        >
          Post a Request ↗
        </button>
      </div>

      {/* Filter bar */}
      <div
        style={{
          background: "#2d3a55",
          borderBottom: "1px solid rgba(255,255,255,.08)",
          padding: "0 24px",
          display: "flex",
          gap: 4,
          overflowX: "auto",
          alignItems: "center",
          height: 40,
          scrollbarWidth: "none",
        }}
      >
        {INDUSTRIES.map((ind) => (
          <button
            key={ind.id}
            style={chipStyle(activeCategory === ind.id)}
            onClick={() => {
              setActiveCategory(ind.id);
              setBookingProvider(null);
              setExpandedCards({});
            }}
          >
            {ind.emoji} {ind.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div
        style={{
          padding: "20px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 0,
        }}
      >
        {/* Available banner */}
        <div
          style={{
            background: "#1a2340",
            borderRadius: 5,
            padding: "14px 20px",
            marginBottom: 16,
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
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
              color: "rgba(255,255,255,.85)",
              fontWeight: 600,
            }}
          >
            Providers available on the platform today
          </span>
          <div style={{ marginLeft: "auto", textAlign: "right" }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#fff" }}>
              {availCount}
            </div>
            <div
              style={{
                fontSize: 10,
                color: "rgba(255,255,255,.45)",
                textTransform: "uppercase",
                letterSpacing: ".05em",
              }}
            >
              Available now
            </div>
          </div>
        </div>

        {/* Featured */}
        {featured.length > 0 && (
          <>
            <SectionTitle>Recommended for you</SectionTitle>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3,1fr)",
                gap: 12,
                marginBottom: 4,
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

        {/* Standard */}
        {standard.length > 0 && (
          <>
            {featured.length > 0 && <SectionTitle>More providers</SectionTitle>}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3,1fr)",
                gap: 12,
                marginBottom: 4,
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

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "32px 16px" }}>
            <div
              style={{
                width: 48,
                height: 48,
                margin: "0 auto 10px",
                background: "#eef0f5",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
              }}
            >
              {INDUSTRIES.find((i) => i.id === activeCategory)?.emoji || "🔍"}
            </div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#4a5568",
                marginBottom: 4,
              }}
            >
              No providers listed yet
            </div>
            <div style={{ fontSize: 12, color: "#8a93a6" }}>
              Be the first to list your business in this category.
            </div>
          </div>
        )}

        {/* Booking panel */}
        {bookingProvider && (
          <BookingPanel
            provider={bookingProvider}
            onClose={() => setBookingProvider(null)}
            onSubmit={handleSubmitBooking}
          />
        )}

        {/* My requests */}
        <SectionTitle>My Service Requests</SectionTitle>
        <div
          style={{
            background: "#fff",
            border: "1px solid #d9dde6",
            borderRadius: 4,
            overflow: "hidden",
            marginBottom: 12,
          }}
        >
          <div
            style={{
              background: "#f0f2f6",
              borderBottom: "1px solid #d9dde6",
              padding: "10px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#1a2340",
                textTransform: "uppercase",
                letterSpacing: ".05em",
              }}
            >
              Recent Requests
            </span>
            <span style={{ fontSize: 11, color: "#8a93a6" }}>
              {myReqs.length} total
            </span>
          </div>
          <div style={{ padding: 16 }}>
            {myReqs.map((req, i) => {
              const pill = STATUS_PILL[req.status];
              return (
                <div
                  key={req.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 0",
                    borderBottom:
                      i < myReqs.length - 1 ? "1px solid #d9dde6" : "none",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#1a2340",
                      }}
                    >
                      {req.name}
                    </div>
                    <div
                      style={{ fontSize: 11, color: "#8a93a6", marginTop: 2 }}
                    >
                      {getLabel(req.industry)} · Requested {req.date}
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "3px 10px",
                      borderRadius: 20,
                      background: pill.bg,
                      color: pill.color,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {pill.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <Toast message={toast} />
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: ".07em",
        textTransform: "uppercase",
        color: "#8a93a6",
        margin: "20px 0 10px",
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      {children}
      <div style={{ flex: 1, height: 1, background: "#d9dde6" }} />
    </div>
  );
}

function QuoteModal({ target, onClose, onSend }) {
  const [amount, setAmount] = useState(target?.quoteAmount || "");
  const [notes, setNotes] = useState("");

  if (!target) return null;

  const inputStyle = {
    fontSize: 13,
    padding: "8px 10px",
    borderRadius: 4,
    border: "1px solid #d9dde6",
    background: "#fff",
    color: "#1a2340",
    width: "100%",
    outline: "none",
    fontFamily: "Lato, sans-serif",
    boxSizing: "border-box",
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(20,26,48,.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 16,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 4,
          padding: 20,
          width: "100%",
          maxWidth: 420,
          border: "1px solid #d9dde6",
          boxShadow: "0 8px 32px rgba(20,26,48,.18)",
        }}
      >
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: "#1a2340",
            marginBottom: 4,
          }}
        >
          Send a Quote
        </div>
        <div style={{ fontSize: 12, color: "#8a93a6", marginBottom: 16 }}>
          To: {target.from} · {target.service.slice(0, 60)}…
        </div>
        <div style={{ marginBottom: 12 }}>
          <label
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#4a5568",
              textTransform: "uppercase",
              letterSpacing: ".05em",
              display: "block",
              marginBottom: 4,
            }}
          >
            Quote amount (R)
          </label>
          <input
            style={inputStyle}
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. R1 800 or R450/hr × 3hrs"
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#4a5568",
              textTransform: "uppercase",
              letterSpacing: ".05em",
              display: "block",
              marginBottom: 4,
            }}
          >
            Notes to client (optional)
          </label>
          <textarea
            style={{ ...inputStyle, resize: "vertical", minHeight: 64 }}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Inclusions, exclusions, lead times…"
          />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={onClose}
            style={{
              fontSize: 13,
              fontWeight: 700,
              padding: "9px 16px",
              borderRadius: 4,
              background: "#f0f2f6",
              color: "#4a5568",
              border: "1px solid #d9dde6",
              cursor: "pointer",
              fontFamily: "Lato, sans-serif",
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => amount.trim() && onSend(amount)}
            style={{
              flex: 1,
              fontSize: 13,
              fontWeight: 700,
              padding: 9,
              borderRadius: 4,
              background: "#1b6ec2",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              fontFamily: "Lato, sans-serif",
            }}
          >
            Send Quote
          </button>
        </div>
      </div>
    </div>
  );
}

function IncomingView({ onBack }) {
  const [incReqs, setIncReqs] = useState(INITIAL_INCOMING);
  const [incFilter, setIncFilter] = useState("all");
  const [expandedInc, setExpandedInc] = useState({});
  const [quoteTarget, setQuoteTarget] = useState(null);
  const [toast, setToast] = useState("");

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  }, []);

  const newCount = incReqs.filter((r) => r.status === "new").length;
  const shown =
    incFilter === "all"
      ? incReqs
      : incReqs.filter((r) => r.status === incFilter);

  const toggleInc = (id) =>
    setExpandedInc((prev) => ({ ...prev, [id]: !prev[id] }));
  const acceptReq = (id) => {
    const r = incReqs.find((x) => x.id === id);
    setIncReqs((prev) =>
      prev.map((x) => (x.id === id ? { ...x, status: "accepted" } : x)),
    );
    setExpandedInc((prev) => ({ ...prev, [id]: true }));
    showToast(`Job from ${r.from} accepted.`);
  };
  const declineReq = (id) => {
    const r = incReqs.find((x) => x.id === id);
    setIncReqs((prev) =>
      prev.map((x) => (x.id === id ? { ...x, status: "declined" } : x)),
    );
    setExpandedInc((prev) => ({ ...prev, [id]: true }));
    showToast(`Request from ${r.from} declined.`);
  };
  const sendQuote = (id, amount) => {
    const r = incReqs.find((x) => x.id === id);
    setIncReqs((prev) =>
      prev.map((x) =>
        x.id === id ? { ...x, status: "quoted", quoteAmount: amount } : x,
      ),
    );
    setExpandedInc((prev) => ({ ...prev, [id]: true }));
    showToast(`Quote of ${amount} sent to ${r.from}.`);
    setQuoteTarget(null);
  };

  const tabFilters = [
    { id: "all", label: "All" },
    { id: "new", label: "New" },
    { id: "quoted", label: "Quoted" },
    { id: "accepted", label: "Accepted" },
    { id: "declined", label: "Declined" },
  ];

  return (
    <div
      style={{
        background: "#f4f5f8",
        minHeight: "100vh",
        fontFamily: "Lato, sans-serif",
      }}
    >
      {/* Topbar */}
      <div
        style={{
          background: "#1a2340",
          height: 52,
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          borderBottom: "1px solid rgba(255,255,255,.08)",
          position: "sticky",
          top: 0,
          zIndex: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={onBack}
            style={{
              background: "rgba(255,255,255,.1)",
              border: "1px solid rgba(255,255,255,.2)",
              color: "#fff",
              cursor: "pointer",
              width: 30,
              height: 30,
              borderRadius: 4,
              fontSize: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ←
          </button>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "#e8442a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginLeft: 4,
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="2"
            >
              <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
              <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
            </svg>
          </div>
          <span
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "#fff",
              letterSpacing: ".01em",
            }}
          >
            Incoming Requests
          </span>
          <span
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,.45)",
              marginLeft: 6,
            }}
          >
            Marketplace › Requests
          </span>
        </div>
        {newCount > 0 && (
          <span
            style={{
              background: "#6d28d9",
              color: "#fff",
              fontSize: 11,
              fontWeight: 700,
              padding: "4px 10px",
              borderRadius: 20,
            }}
          >
            {newCount} new
          </span>
        )}
      </div>

      {/* Tab bar */}
      <div
        style={{
          background: "#f0f2f6",
          borderBottom: "1px solid #d9dde6",
          padding: "8px 16px",
          display: "flex",
          gap: 4,
          flexWrap: "wrap",
        }}
      >
        {tabFilters.map((f) => (
          <button
            key={f.id}
            onClick={() => setIncFilter(f.id)}
            style={{
              fontSize: 12,
              fontWeight: 700,
              padding: "4px 12px",
              borderRadius: 3,
              background: incFilter === f.id ? "#e8442a" : "transparent",
              color: incFilter === f.id ? "#fff" : "#8a93a6",
              border: "none",
              cursor: "pointer",
              fontFamily: "Lato, sans-serif",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            {f.label}
            {f.id === "new" && newCount > 0 && (
              <span
                style={{
                  background: "#6d28d9",
                  color: "#fff",
                  fontSize: 10,
                  padding: "1px 5px",
                  borderRadius: 999,
                }}
              >
                {newCount}
              </span>
            )}
          </button>
        ))}
      </div>

      <div style={{ padding: "20px 24px" }}>
        {shown.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 16px" }}>
            <div
              style={{
                width: 48,
                height: 48,
                margin: "0 auto 10px",
                background: "#eef0f5",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
              }}
            >
              📭
            </div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#4a5568",
                marginBottom: 4,
              }}
            >
              No {incFilter !== "all" ? incFilter : ""} requests
            </div>
            <div style={{ fontSize: 12, color: "#8a93a6" }}>
              When another business books your service, requests will appear
              here.
            </div>
          </div>
        ) : (
          shown.map((req) => {
            const st = INC_STATUS[req.status];
            const urg = URGENCY_STYLES[req.urgency] || {
              bg: "#e8f0fb",
              color: "#1b6ec2",
            };
            const exp = expandedInc[req.id];
            return (
              <div
                key={req.id}
                style={{
                  background: "#fff",
                  border:
                    req.status === "new"
                      ? "1.5px solid #6d28d9"
                      : "1px solid #d9dde6",
                  borderRadius: 4,
                  marginBottom: 10,
                  overflow: "hidden",
                }}
              >
                {/* Header */}
                <div
                  onClick={() => toggleInc(req.id)}
                  style={{
                    padding: "12px 14px",
                    cursor: "pointer",
                    display: "flex",
                    gap: 12,
                    alignItems: "flex-start",
                  }}
                >
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 4,
                      background: "#f3f0ff",
                      color: "#6d28d9",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 16,
                      flexShrink: 0,
                    }}
                  >
                    📥
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: 8,
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: "#1a2340",
                          }}
                        >
                          {req.from}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: "#8a93a6",
                            marginTop: 2,
                          }}
                        >
                          {getLabel(req.fromIndustry)} · Received{" "}
                          {req.receivedAt}
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: "3px 10px",
                          borderRadius: 20,
                          background: st.bg,
                          color: st.color,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {st.label}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "#4a5568",
                        marginTop: 6,
                        ...(exp
                          ? {}
                          : {
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }),
                      }}
                    >
                      {req.service}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: 6,
                        flexWrap: "wrap",
                        marginTop: 6,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: "2px 7px",
                          borderRadius: 20,
                          background: urg.bg,
                          color: urg.color,
                        }}
                      >
                        {req.urgency}
                      </span>
                      {req.attachedDoc !== "None" && (
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            padding: "2px 7px",
                            borderRadius: 20,
                            background: "#e8f0fb",
                            color: "#1b6ec2",
                          }}
                        >
                          📎 {req.attachedDoc}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded */}
                {exp && (
                  <div
                    style={{
                      padding: "0 14px 14px",
                      borderTop: "1px solid #d9dde6",
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 10,
                        margin: "12px 0",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: 11,
                            color: "#8a93a6",
                            textTransform: "uppercase",
                            letterSpacing: ".05em",
                            marginBottom: 3,
                            fontWeight: 700,
                          }}
                        >
                          Date requested
                        </div>
                        <div
                          style={{
                            fontSize: 13,
                            color: "#1a2340",
                            fontWeight: 600,
                          }}
                        >
                          {req.date} at {req.time}
                        </div>
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: 11,
                            color: "#8a93a6",
                            textTransform: "uppercase",
                            letterSpacing: ".05em",
                            marginBottom: 3,
                            fontWeight: 700,
                          }}
                        >
                          Address
                        </div>
                        <div
                          style={{
                            fontSize: 13,
                            color: "#1a2340",
                            fontWeight: 600,
                          }}
                        >
                          {req.address}
                        </div>
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "#4a5568",
                        lineHeight: 1.6,
                        marginBottom: 12,
                        background: "#f0f2f6",
                        padding: "10px 12px",
                        borderRadius: 4,
                      }}
                    >
                      {req.service}
                    </div>
                    {req.quoteAmount && (
                      <div
                        style={{
                          marginBottom: 12,
                          fontSize: 13,
                          color: "#1b6ec2",
                          fontWeight: 700,
                        }}
                      >
                        Your quote: {req.quoteAmount}
                      </div>
                    )}

                    {(req.status === "new" || req.status === "quoted") && (
                      <div
                        style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
                      >
                        <button
                          onClick={() => setQuoteTarget(req)}
                          style={{
                            flex: 1,
                            fontSize: 12,
                            fontWeight: 700,
                            padding: "8px 14px",
                            borderRadius: 4,
                            border: "none",
                            cursor: "pointer",
                            background: "#1b6ec2",
                            color: "#fff",
                            fontFamily: "Lato, sans-serif",
                          }}
                        >
                          {req.status === "new"
                            ? "Send a Quote"
                            : "Update Quote"}
                        </button>
                        <button
                          onClick={() => acceptReq(req.id)}
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            padding: "8px 14px",
                            borderRadius: 4,
                            border: "none",
                            cursor: "pointer",
                            background: "#1d8348",
                            color: "#fff",
                            fontFamily: "Lato, sans-serif",
                          }}
                        >
                          Accept Job
                        </button>
                        <button
                          onClick={() => declineReq(req.id)}
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            padding: "8px 14px",
                            borderRadius: 4,
                            border: "1px solid #d9dde6",
                            cursor: "pointer",
                            background: "#f0f2f6",
                            color: "#4a5568",
                            fontFamily: "Lato, sans-serif",
                          }}
                        >
                          Decline
                        </button>
                      </div>
                    )}
                    {req.status === "accepted" && (
                      <div
                        style={{
                          fontSize: 12,
                          color: "#1d8348",
                          background: "#eafaf1",
                          padding: "8px 12px",
                          borderRadius: 4,
                          fontWeight: 600,
                        }}
                      >
                        ✓ Job accepted — added to your jobs queue.
                      </div>
                    )}
                    {req.status === "declined" && (
                      <div
                        style={{
                          fontSize: 12,
                          color: "#e8442a",
                          background: "#fdf2f0",
                          padding: "8px 12px",
                          borderRadius: 4,
                          fontWeight: 600,
                        }}
                      >
                        ✗ Request declined.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Summary footer */}
      <div
        style={{
          padding: "10px 16px",
          borderTop: "1px solid #d9dde6",
          display: "flex",
          gap: 16,
          flexWrap: "wrap",
          fontSize: 12,
          color: "#8a93a6",
        }}
      >
        {["new", "quoted", "accepted", "declined"].map((k) => {
          const count = incReqs.filter((r) => r.status === k).length;
          const s = INC_STATUS[k];
          return count > 0 ? (
            <span key={k}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: s.color,
                  display: "inline-block",
                  marginRight: 4,
                }}
              />
              {count} {s.label.toLowerCase()}
            </span>
          ) : null;
        })}
      </div>

      {quoteTarget && (
        <QuoteModal
          target={quoteTarget}
          onClose={() => setQuoteTarget(null)}
          onSend={(amount) => sendQuote(quoteTarget.id, amount)}
        />
      )}

      <Toast message={toast} />
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────

export default function ServiceMarketplace() {
  const [view, setView] = useState("market");

  return view === "market" ? (
    <MarketView onShowIncoming={() => setView("incoming")} />
  ) : (
    <IncomingView onBack={() => setView("market")} />
  );
}
