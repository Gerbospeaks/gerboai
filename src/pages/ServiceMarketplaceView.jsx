import { useState, useCallback } from "react";
import BookingPanel from "../components/BookingPanel";
import {
  sendBookingRequest,
  sendQuote,
  acceptRequest,
  declineRequest,
  useMyRequests,
  useIncomingRequests,
} from "../hooks/useBookingRequests";
import { useProviders, useMyProviderListing } from "../hooks/useProviders";
import { useAuth } from "../contexts/AuthContext";
// ── Design tokens ─────────────────────────────────────────────────────────────
const T = {
  navy: "#0f172a",
  navyMid: "#1e293b",
  navyLight: "#334155",
  indigo: "#6366f1",
  indigoHov: "#4f46e5",
  indigoLt: "#eef2ff",
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  border: "#e2e8f0",
  borderMid: "#cbd5e1",
  textPri: "#0f172a",
  textMid: "#475569",
  textMuted: "#94a3b8",
  green: "#16a34a",
  greenLt: "#f0fdf4",
  greenBd: "#bbf7d0",
  red: "#dc2626",
  redLt: "#fef2f2",
  amber: "#d97706",
  amberLt: "#fffbeb",
  amberBd: "#fde68a",
  blue: "#2563eb",
  blueLt: "#eff6ff",
  blueBd: "#bfdbfe",
  purple: "#7c3aed",
  purpleLt: "#f5f3ff",
  purpleBd: "#ddd6fe",
};

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,700&family=Lato:wght@300;400;600;700;900&display=swap');
* { box-sizing: border-box; }
::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 2px; }
input, select, textarea, button { font-family: 'Lato', sans-serif; }
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
    name: "PrimeCare Occupational",
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
    about: "Professional painters with 10+ years experience.",
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
  new: { bg: T.purpleLt, color: T.purple, label: "Awaiting quote" },
  quoted: { bg: T.amberLt, color: T.amber, label: "Quote received" },
  accepted: { bg: T.greenLt, color: T.green, label: "Confirmed" },
  declined: { bg: T.redLt, color: T.red, label: "Declined" },
};

const INC_STATUS = {
  new: { label: "New request", bg: T.purpleLt, color: T.purple },
  quoted: { label: "Quote sent", bg: T.amberLt, color: T.amber },
  accepted: { label: "Accepted", bg: T.greenLt, color: T.green },
  declined: { label: "Declined", bg: T.redLt, color: T.red },
};

const URGENCY_STYLES = {
  "Urgent (today/tomorrow)": { bg: T.redLt, color: T.red },
  "Standard (2-3 days)": { bg: T.blueLt, color: T.blue },
  "Flexible (within a week)": { bg: T.greenLt, color: T.green },
};

const BADGE_COLORS = {
  green: { bg: T.greenLt, color: T.green, border: T.greenBd },
  blue: { bg: T.blueLt, color: T.blue, border: T.blueBd },
  amber: { bg: T.amberLt, color: T.amber, border: T.amberBd },
  purple: { bg: T.purpleLt, color: T.purple, border: T.purpleBd },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function getLabel(id) {
  return (INDUSTRIES.find((i) => i.id === id) || { label: id }).label;
}

// ── Shared primitives ─────────────────────────────────────────────────────────

function Toast({ message }) {
  return message ? (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        background: T.navy,
        color: "#fff",
        fontSize: 13,
        fontWeight: 700,
        padding: "11px 22px",
        borderRadius: 8,
        zIndex: 9999,
        whiteSpace: "nowrap",
        boxShadow: "0 8px 28px rgba(15,23,42,.3)",
        border: "1px solid rgba(255,255,255,.08)",
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
        padding: "3px 9px",
        borderRadius: 20,
        background: c.bg,
        color: c.color,
        border: `1px solid ${c.border}`,
      }}
    >
      {label}
    </span>
  );
}

function SectionTitle({ children, count }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        margin: "36px 0 20px",
      }}
    >
      <span
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 20,
          fontWeight: 600,
          color: T.textPri,
          whiteSpace: "nowrap",
          letterSpacing: "-.015em",
        }}
      >
        {children}
      </span>
      <div
        style={{
          flex: 1,
          height: 1,
          background: `linear-gradient(90deg, ${T.border} 0%, transparent 100%)`,
        }}
      />
      {count != null && (
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: ".07em",
            textTransform: "uppercase",
            color: T.indigo,
            background: T.indigoLt,
            border: `1px solid rgba(99,102,241,.2)`,
            padding: "4px 12px",
            borderRadius: 20,
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          {count} listed
        </span>
      )}
    </div>
  );
}

// ── Topbar ────────────────────────────────────────────────────────────────────

function Topbar({ title, subtitle, icon, right, onBack }) {
  return (
    <div
      style={{
        background: T.navy,
        height: 60,
        padding: "0 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        borderBottom: "1px solid rgba(255,255,255,.07)",
        position: "sticky",
        top: 0,
        zIndex: 50,
        boxShadow: "0 2px 20px rgba(0,0,0,.25)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {onBack && (
          <button
            onClick={onBack}
            style={{
              background: "rgba(255,255,255,.08)",
              border: "1px solid rgba(255,255,255,.15)",
              color: "#fff",
              cursor: "pointer",
              width: 32,
              height: 32,
              borderRadius: 6,
              fontSize: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background .15s",
            }}
          >
            ←
          </button>
        )}
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: T.indigo,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        <div>
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "#fff",
              letterSpacing: ".01em",
            }}
          >
            {title}
          </div>
          {subtitle && (
            <div
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,.35)",
                marginTop: 1,
              }}
            >
              {subtitle}
            </div>
          )}
        </div>
      </div>
      {right}
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

function Sidebar({ active, onSelect, providers = [] }) {
  const [search, setSearch] = useState("");
  const filteredIndustries = INDUSTRIES.filter((i) =>
    i.label.toLowerCase().includes(search.toLowerCase()),
  );
  function industryCount(id) {
    if (id === "all") return providers.length;
    return providers.filter((p) => p.industry === id).length;
  }
  return (
    <aside
      style={{
        position: "sticky",
        top: 60,
        background: "#fff",
        border: `1px solid ${T.border}`,
        borderRadius: 14,
        overflow: "hidden",
        boxShadow: "0 1px 8px rgba(15,23,42,.06)",
      }}
    >
      {/* Top gradient stripe */}
      <div
        style={{
          height: 3,
          background: "linear-gradient(90deg, #6366f1, #818cf8, #0ea5e9)",
        }}
      />

      {/* Header */}
      <div
        style={{
          padding: "16px 16px 12px",
          borderBottom: `1px solid ${T.border}`,
        }}
      >
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: ".1em",
            textTransform: "uppercase",
            color: T.textMuted,
            marginBottom: 12,
          }}
        >
          Industries
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "#f8fafc",
            border: `1px solid ${T.border}`,
            borderRadius: 8,
            padding: "8px 12px",
          }}
        >
          <span style={{ color: T.textMuted, fontSize: 14 }}>⌕</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter…"
            style={{
              background: "none",
              border: "none",
              outline: "none",
              fontSize: 12,
              color: T.textPri,
              width: "100%",
            }}
          />
        </div>
      </div>

      {/* List */}
      <div
        style={{
          padding: "6px 0",
          maxHeight: "calc(100vh - 200px)",
          overflowY: "auto",
        }}
      >
        {filteredIndustries.map((ind, i) => {
          const isActive = active === ind.id;
          return (
            <div key={ind.id}>
              {ind.id === "all" && (
                <div
                  style={{ height: 1, background: T.border, margin: "4px 0" }}
                />
              )}
              <div
                onClick={() => onSelect(ind.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "8px 16px",
                  gap: 10,
                  cursor: "pointer",
                  transition: "background .13s",
                  borderLeft: `2px solid ${isActive ? T.indigo : "transparent"}`,
                  background: isActive ? T.indigoLt : "transparent",
                }}
                onMouseEnter={(e) =>
                  !isActive && (e.currentTarget.style.background = "#f8fafc")
                }
                onMouseLeave={(e) =>
                  !isActive &&
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <span style={{ fontSize: 14, lineHeight: 1, flexShrink: 0 }}>
                  {ind.emoji}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: isActive ? 700 : 600,
                    flex: 1,
                    color: isActive ? T.indigo : T.textMid,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {ind.label}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "2px 7px",
                    borderRadius: 10,
                    background: isActive ? "rgba(99,102,241,.12)" : "#f1f5f9",
                    color: isActive ? T.indigo : T.textMuted,
                    flexShrink: 0,
                  }}
                >
                  {industryCount(ind.id)}
                </span>
              </div>
              {ind.id === "all" && (
                <div
                  style={{ height: 1, background: T.border, margin: "4px 0" }}
                />
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}

// ── Availability banner ───────────────────────────────────────────────────────

function AvailBanner({ availNow, total }) {
  return (
    <div
      style={{
        background: "#fff",
        border: `1px solid ${T.border}`,
        borderRadius: 14,
        padding: "22px 28px",
        marginBottom: 32,
        display: "flex",
        alignItems: "center",
        gap: 20,
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 1px 8px rgba(15,23,42,.06)",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: "linear-gradient(90deg, #6366f1, #818cf8, #0ea5e9)",
        }}
      />
      <div
        style={{
          width: 11,
          height: 11,
          borderRadius: "50%",
          background: "#22c55e",
          flexShrink: 0,
          boxShadow: "0 0 0 4px rgba(34,197,94,.15)",
        }}
      />
      <span
        style={{
          fontSize: 14,
          color: T.textMid,
          fontWeight: 600,
          flex: 1,
          lineHeight: 1.5,
        }}
      >
        <strong style={{ color: T.textPri }}>Live marketplace</strong> —
        verified service providers ready to quote across Gauteng.
      </span>
      <div style={{ display: "flex" }}>
        <div style={{ textAlign: "center", padding: "0 24px" }}>
          <span
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 36,
              fontWeight: 700,
              color: T.textPri,
              lineHeight: 1,
              display: "block",
            }}
          >
            {availNow}
          </span>
          <span
            style={{
              fontSize: 10,
              color: T.textMuted,
              letterSpacing: ".07em",
              textTransform: "uppercase",
              marginTop: 3,
              display: "block",
            }}
          >
            Available now
          </span>
        </div>
        <div
          style={{
            textAlign: "center",
            padding: "0 24px",
            borderLeft: `1px solid ${T.border}`,
          }}
        >
          <span
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 36,
              fontWeight: 700,
              color: T.textPri,
              lineHeight: 1,
              display: "block",
            }}
          >
            {total}
          </span>
          <span
            style={{
              fontSize: 10,
              color: T.textMuted,
              letterSpacing: ".07em",
              textTransform: "uppercase",
              marginTop: 3,
              display: "block",
            }}
          >
            Total listed
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Provider card ─────────────────────────────────────────────────────────────

function ProviderCard({ provider: p, expanded, onToggle, onBook }) {
  return (
    <div
      onClick={() => onToggle(p.id)}
      style={{
        background: "#fff",
        borderRadius: 12,
        padding: "22px",
        border: p.featured
          ? `1.5px solid rgba(99,102,241,.4)`
          : `1px solid ${T.border}`,
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        transition: "box-shadow .2s, transform .2s, border-color .2s",
        position: "relative",
        overflow: "hidden",
        boxShadow: p.featured ? "0 2px 16px rgba(99,102,241,.08)" : "none",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 10px 36px rgba(15,23,42,.1)";
        e.currentTarget.style.transform = "translateY(-3px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = p.featured
          ? "0 2px 16px rgba(99,102,241,.08)"
          : "none";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Top row */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div
          style={{
            width: 46,
            height: 46,
            borderRadius: 10,
            flexShrink: 0,
            background: p.color,
            color: p.textColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          {p.initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: T.textPri,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              marginBottom: 3,
            }}
          >
            {p.name}
          </div>
          <div style={{ fontSize: 12, color: T.textMuted }}>
            {getLabel(p.industry)} · {p.location}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 5,
            flexShrink: 0,
          }}
        >
          {p.featured && (
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                background: T.indigoLt,
                color: T.indigo,
                padding: "3px 10px",
                borderRadius: 20,
                border: "1px solid rgba(99,102,241,.2)",
              }}
            >
              Top Rated
            </span>
          )}
          <span
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: T.textPri,
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
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <span style={{ fontSize: 12, color: T.textMuted }}>
          <span style={{ color: "#f59e0b" }}>★</span> {p.rating} ({p.reviews})
        </span>
        <span style={{ fontSize: 12, color: T.textMuted }}>⏱ {p.response}</span>
        {!p.available && (
          <span style={{ fontSize: 11, color: T.red, fontWeight: 700 }}>
            Unavailable
          </span>
        )}
      </div>

      {/* Expanded */}
      {expanded && (
        <div
          style={{
            fontSize: 13,
            color: T.textMid,
            lineHeight: 1.65,
            paddingTop: 14,
            borderTop: `1px solid ${T.border}`,
          }}
        >
          {p.about}
        </div>
      )}

      {/* CTA */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          p.available && onBook(p.id);
        }}
        style={{
          width: "100%",
          padding: "12px 0",
          borderRadius: 6,
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: ".05em",
          textTransform: "uppercase",
          cursor: p.available ? "pointer" : "not-allowed",
          background: p.available ? T.navy : "#f8fafc",
          color: p.available ? "#fff" : T.textMuted,
          border: p.available ? `1px solid ${T.navy}` : `1px solid ${T.border}`,
          transition: "all .18s",
        }}
        onMouseEnter={(e) =>
          p.available &&
          ((e.currentTarget.style.background = T.indigo),
          (e.currentTarget.style.borderColor = T.indigo))
        }
        onMouseLeave={(e) =>
          p.available &&
          ((e.currentTarget.style.background = T.navy),
          (e.currentTarget.style.borderColor = T.navy))
        }
      >
        {p.available ? "Book Now — Get a Quote" : "Currently Unavailable"}
      </button>
    </div>
  );
}

// ── My requests panel ─────────────────────────────────────────────────────────

function MyRequests({ reqs }) {
  return (
    <div
      style={{
        background: "#fff",
        border: `1px solid ${T.border}`,
        borderRadius: 14,
        overflow: "hidden",
        boxShadow: "0 1px 8px rgba(15,23,42,.06)",
      }}
    >
      <div
        style={{
          padding: "14px 22px",
          borderBottom: `1px solid ${T.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 700, color: T.textPri }}>
          My Service Requests
        </span>
        <span
          style={{
            fontSize: 11,
            color: T.textMuted,
            background: "#f1f5f9",
            padding: "3px 10px",
            borderRadius: 20,
            fontWeight: 600,
          }}
        >
          {reqs.length} total
        </span>
      </div>
      <div style={{ padding: "8px 0" }}>
        {reqs.map((req, i) => {
          const pill = STATUS_PILL[req.status];
          return (
            <div
              key={req.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 22px",
                borderBottom:
                  i < reqs.length - 1 ? `1px solid #f1f5f9` : "none",
              }}
            >
              <div>
                <div
                  style={{ fontSize: 13, fontWeight: 600, color: T.textPri }}
                >
                  {req.providerName} {/* was req.name */}
                </div>
                <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>
                  {getLabel(req.providerIndustry)} · Requested {req.receivedAt}
                </div>
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "4px 12px",
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
  );
}

// ── Quote modal ───────────────────────────────────────────────────────────────

function QuoteModal({ target, onClose, onSend }) {
  const [amount, setAmount] = useState(target?.quoteAmount || "");
  const [notes, setNotes] = useState("");
  if (!target) return null;

  const inp = {
    fontSize: 13,
    padding: "9px 12px",
    borderRadius: 8,
    border: `1px solid ${T.border}`,
    background: "#fff",
    color: T.textPri,
    width: "100%",
    outline: "none",
    fontFamily: "'Lato', sans-serif",
    boxSizing: "border-box",
  };
  const lbl = {
    fontSize: 11,
    fontWeight: 700,
    color: T.textMid,
    textTransform: "uppercase",
    letterSpacing: ".05em",
    display: "block",
    marginBottom: 5,
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 20,
        backdropFilter: "blur(6px)",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 14,
          padding: 28,
          width: "100%",
          maxWidth: 440,
          border: `1px solid ${T.border}`,
          boxShadow: "0 24px 60px rgba(15,23,42,.25)",
        }}
      >
        <div
          style={{
            fontSize: 18,
            fontFamily: "'Playfair Display', serif",
            fontWeight: 600,
            color: T.textPri,
            marginBottom: 6,
          }}
        >
          Send a Quote
        </div>
        <div style={{ fontSize: 13, color: T.textMuted, marginBottom: 20 }}>
          To: {target.from} · {target.service.slice(0, 60)}…
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={lbl}>Quote amount (R)</label>
          <input
            style={inp}
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. R1 800 or R450/hr × 3hrs"
          />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={lbl}>Notes to client (optional)</label>
          <textarea
            style={{ ...inp, resize: "vertical", minHeight: 72 }}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Inclusions, exclusions, lead times…"
          />
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              fontSize: 13,
              fontWeight: 700,
              padding: "10px 18px",
              borderRadius: 8,
              background: "#f8fafc",
              color: T.textMid,
              border: `1px solid ${T.border}`,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => amount.trim() && onSend(amount, notes)}
            style={{
              flex: 1,
              fontSize: 13,
              fontWeight: 700,
              padding: 10,
              borderRadius: 8,
              background: T.blue,
              color: "#fff",
              border: "none",
              cursor: "pointer",
            }}
          >
            Send Quote
          </button>
        </div>
      </div>
    </div>
  );
}
function PostServiceModal({ onClose, onSubmit }) {
  const [businessName, setBusinessName] = useState("");
  const [industry, setIndustry]         = useState("mechanics");
  const [about, setAbout]               = useState("");
  const [rate, setRate]                 = useState("");
  const [location, setLocation]         = useState("");
  const [response, setResponse]         = useState("~1 hr");
  const [badges, setBadges]             = useState("");
  const [saving, setSaving]             = useState(false);

  const inp = {
    width: "100%", padding: "9px 12px", fontSize: 13,
    border: `1px solid ${T.border}`, borderRadius: 8,
    outline: "none", fontFamily: "'Lato', sans-serif",
    marginBottom: 14, boxSizing: "border-box",
  };
  const lbl = {
    fontSize: 11, fontWeight: 700, color: T.textMid,
    textTransform: "uppercase", letterSpacing: ".05em",
    display: "block", marginBottom: 5,
  };

  async function handleSubmit() {
    if (!businessName.trim() || !about.trim()) return;
    setSaving(true);
    await onSubmit({
      businessName,
      name: businessName,
      industry,
      about,
      rate:      rate     || "Quote on request",
      location:  location || "",
      response:  response || "~1 hr",
      // Convert comma-separated badge text into badge objects
      badges: badges
        .split(",")
        .map(b => b.trim())
        .filter(Boolean)
        .map(b => ({ label: b, type: "blue" })),
      initials:  businessName.slice(0, 2).toUpperCase(),
      color:     "#eef2ff",
      textColor: "#4f46e5",
      rating:    0,
      reviews:   0,
      featured:  false,
      active:    true,
      available: true,
    });
    setSaving(false);
  }

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(15,23,42,.55)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, padding: 20, backdropFilter: "blur(6px)",
    }}>
      <div style={{
        background: "#fff", borderRadius: 14, padding: 28,
        width: "100%", maxWidth: 480,
        boxShadow: "0 24px 60px rgba(15,23,42,.25)",
        maxHeight: "90vh", overflowY: "auto",
      }}>
        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <div style={{
            fontSize: 18, fontFamily: "'Playfair Display', serif",
            fontWeight: 600, color: T.textPri, marginBottom: 4,
          }}>
            List Your Service
          </div>
          <div style={{ fontSize: 13, color: T.textMuted }}>
            Your listing will appear on the marketplace for clients to book.
          </div>
        </div>

        {/* Business Name */}
        <label style={lbl}>Business Name *</label>
        <input
          style={inp}
          value={businessName}
          onChange={e => setBusinessName(e.target.value)}
          placeholder="e.g. Jake's Motor Workshop"
        />

        {/* Industry */}
        <label style={lbl}>Industry *</label>
        <select
          style={{ ...inp, cursor: "pointer" }}
          value={industry}
          onChange={e => setIndustry(e.target.value)}
        >
          {INDUSTRIES.filter(i => i.id !== "all").map(i => (
            <option key={i.id} value={i.id}>{i.emoji} {i.label}</option>
          ))}
        </select>

        {/* About */}
        <label style={lbl}>Describe your service *</label>
        <textarea
          style={{ ...inp, resize: "vertical", minHeight: 80 }}
          value={about}
          onChange={e => setAbout(e.target.value)}
          placeholder="e.g. Specialist in fleet vehicle maintenance and roadworthy inspections."
        />

        {/* Rate */}
        <label style={lbl}>Rate / Pricing</label>
        <input
          style={inp}
          value={rate}
          onChange={e => setRate(e.target.value)}
          placeholder="e.g. R450/hr or Custom quote"
        />

        {/* Location */}
        <label style={lbl}>Location</label>
        <input
          style={inp}
          value={location}
          onChange={e => setLocation(e.target.value)}
          placeholder="e.g. Randburg, JHB"
        />

        {/* Response time */}
        <label style={lbl}>Typical Response Time</label>
        <select
          style={{ ...inp, cursor: "pointer" }}
          value={response}
          onChange={e => setResponse(e.target.value)}
        >
          <option>~15 min</option>
          <option>~20 min</option>
          <option>~30 min</option>
          <option>~45 min</option>
          <option>~1 hr</option>
          <option>~2 hrs</option>
          <option>~4 hrs</option>
        </select>

        {/* Badges / tags */}
        <label style={lbl}>Service Tags</label>
        <input
          style={inp}
          value={badges}
          onChange={e => setBadges(e.target.value)}
          placeholder="e.g. Available today, Fleet servicing, Diagnostics"
        />
        <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 14, marginTop: -10 }}>
          Comma-separated — shown as badges on your card
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <button
            onClick={onClose}
            style={{
              fontSize: 13, fontWeight: 700, padding: "10px 18px",
              borderRadius: 8, background: "#f8fafc",
              color: T.textMid, border: `1px solid ${T.border}`, cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || !businessName.trim() || !about.trim()}
            style={{
              flex: 1, fontSize: 13, fontWeight: 700, padding: 10,
              borderRadius: 8, background: T.indigo, color: "#fff",
              border: "none", cursor: "pointer", opacity: saving ? .6 : 1,
            }}
          >
            {saving ? "Publishing..." : "Publish Listing"}
          </button>
        </div>
      </div>
    </div>
  );
}
// ── MarketView ────────────────────────────────────────────────────────────────
function normalizeProvider(p) {
  return {
    ...p,
    available: p.available ?? p.avail ?? true,
    location: p.location ?? p.loc ?? "",
    color: p.color ?? p.bg ?? "#eef2ff",
    textColor: p.textColor ?? p.tc ?? "#4f46e5",
    badges: (p.badges || []).map((b) => ({
      label: b.label ?? b.l ?? "",
      type: b.type ?? b.t ?? "blue",
    })),
  };
}

function MarketView({ onShowIncoming }) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [bookingProvider, setBookingProvider] = useState(null);
  const [expandedCards, setExpandedCards] = useState({});
  const [postingOpen, setPostingOpen] = useState(false);
  const { providers: rawProviders, loading } = useProviders(activeCategory);
  const providers = rawProviders.map(normalizeProvider);
  const { user } = useAuth();
  const { requests: myReqs = [], loading: reqsLoading } = useMyRequests(
    user?.uid,
  );
  const [toast, setToast] = useState("");

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  }, []);

  const featured = providers.filter((p) => p.featured);
  const standard = providers.filter((p) => !p.featured);
  const availCount = providers.filter((p) => p.available || p.avail).length;

  const toggleCard = (id) =>
    setExpandedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  const handleBook = (id) => {
    const p = providers.find((x) => x.id === id);
    if (p?.available ?? p?.avail) setBookingProvider(p);
  };
  const handleSubmitBooking = useCallback(
    async (provider, formData) => {
      try {
        await sendBookingRequest(formData, provider, user);
        setBookingProvider(null);
        showToast(`Booking sent to ${provider.name}!`);
      } catch (err) {
        console.error(err);
        showToast("Failed to send booking. Please try again.");
      }
    },
    [user],
  );

  const handleFilterChange = (id) => {
    setActiveCategory(id);
    setBookingProvider(null);
    setExpandedCards({});
  };

  return (
    <div
      style={{
        background: T.pageBg,
        minHeight: "100vh",
        fontFamily: "'Lato', sans-serif",
      }}
    >
      <style>{FONTS}</style>

      <Topbar
        title="Service Marketplace"
        subtitle="Marketplace › Browse"
        icon={
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="2"
          >
            <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m12-9l2 9M9 21h6" />
          </svg>
        }
        right={
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              onClick={onShowIncoming}
              style={{
                height: 36,
                padding: "0 18px",
                background: "rgba(255,255,255,.08)",
                border: "1px solid rgba(255,255,255,.15)",
                color: "rgba(255,255,255,.8)",
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                letterSpacing: ".04em",
              }}
            >
              Incoming Requests
            </button>
            <button
              onClick={() => setPostingOpen(true)}
              style={{
                height: 36,
                padding: "0 20px",
                background: T.indigo,
                color: "#fff",
                border: "none",
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                letterSpacing: ".04em",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span>+</span> List My Service
            </button>
          </div>
        }
      />

      {/* Layout */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "240px 1fr",
          alignItems: "start",
          padding: "28px 32px 80px",
          gap: 24,
          maxWidth: 1440,
          margin: "0 auto",
        }}
      >
        <Sidebar
          active={activeCategory}
          onSelect={handleFilterChange}
          providers={providers}
        />

        {/* Main */}
        {/* Main */}
        <div style={{ minWidth: 0 }}>
          <AvailBanner availNow={availCount} total={providers.length} />

          {/* ── Content: loading / empty / grids ── */}
          {loading ? (
            <div
              style={{
                textAlign: "center",
                padding: "80px 24px",
                color: T.textMuted,
              }}
            >
              Loading providers...
            </div>
          ) : providers.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 24px" }}>
              <div
                style={{
                  width: 72,
                  height: 72,
                  margin: "0 auto 20px",
                  background: "#f8fafc",
                  border: `1px solid ${T.border}`,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 28,
                }}
              >
                {INDUSTRIES.find((i) => i.id === activeCategory)?.emoji || "🔍"}
              </div>
              <div
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 20,
                  fontWeight: 600,
                  color: T.textPri,
                  marginBottom: 8,
                }}
              >
                No providers listed in this category yet
              </div>
              <div style={{ fontSize: 14, color: T.textMuted }}>
                Be the first to list your business in this category.
              </div>
            </div>
          ) : (
            <>
              {/* Featured */}
              {featured.length > 0 && (
                <>
                  <SectionTitle count={featured.length}>
                    Recommended for you
                  </SectionTitle>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3,1fr)",
                      gap: 18,
                      marginBottom: 8,
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
                  {featured.length > 0 && (
                    <SectionTitle count={standard.length}>
                      More providers
                    </SectionTitle>
                  )}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3,1fr)",
                      gap: 18,
                      marginBottom: 8,
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
            </>
          )}

          {/* Booking panel — always outside the loading/empty/grid block */}
          {bookingProvider && (
            <div style={{ marginTop: 12 }}>
              <BookingPanel
                provider={bookingProvider}
                onClose={() => setBookingProvider(null)}
                onSubmit={handleSubmitBooking}
              />
            </div>
          )}

          {/* My requests — always shown */}
          <div style={{ marginTop: 36 }}>
            <MyRequests reqs={myReqs} />
          </div>
        </div>
      </div>
     {postingOpen && (
  <PostServiceModal
    onClose={() => setPostingOpen(false)}
    onSubmit={async (listingData) => {
      try {
        const { setDoc, doc, serverTimestamp } = await import("firebase/firestore");
        const { db } = await import("../firebase");
        await setDoc(
          doc(db, "providers", user.uid),
          { ...listingData, ownerId: user.uid, updatedAt: serverTimestamp() },
          { merge: true }
        );
        setPostingOpen(false);
        showToast("Your service is now live on the marketplace!");
      } catch (err) {
        console.error(err);
        showToast("Failed to publish. Please try again.");
      }
    }}
  />
)}

      <Toast message={toast} />
    </div>
  );
}

// ── IncomingView ──────────────────────────────────────────────────────────────

function IncomingView({ onBack }) {
  const { user } = useAuth();
  const { listing } = useMyProviderListing(user?.uid); // get their provider doc id
  const { requests: incReqs = [], loading: incLoading } = useIncomingRequests(
    listing?.id,
  );
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
  const handleSendQuote = async (id, amount, notes) => {
    await sendQuote(id, amount, notes);
    setQuoteTarget(null);
  };
  const handleAccept = async (id) => {
    await acceptRequest(id);
  };
  const handleDecline = async (id) => {
    await declineRequest(id);
  };

  const tabs = [
    { id: "all", label: "All" },
    { id: "new", label: "New" },
    { id: "quoted", label: "Quoted" },
    { id: "accepted", label: "Accepted" },
    { id: "declined", label: "Declined" },
  ];

  return (
    <div
      style={{
        background: T.pageBg,
        minHeight: "100vh",
        fontFamily: "'Lato', sans-serif",
      }}
    >
      <style>{FONTS}</style>

      <Topbar
        title="Incoming Requests"
        subtitle="Marketplace › Requests"
        onBack={onBack}
        icon={
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="2"
          >
            <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
            <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
          </svg>
        }
        right={
          newCount > 0 && (
            <span
              style={{
                background: T.purple,
                color: "#fff",
                fontSize: 11,
                fontWeight: 700,
                padding: "5px 12px",
                borderRadius: 20,
              }}
            >
              {newCount} new
            </span>
          )
        }
      />

      {/* Tab bar */}
      <div
        style={{
          background: "#fff",
          borderBottom: `1px solid ${T.border}`,
          padding: "0 32px",
          display: "flex",
          gap: 4,
          alignItems: "center",
          height: 48,
        }}
      >
        {tabs.map((f) => {
          const active = incFilter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setIncFilter(f.id)}
              style={{
                fontSize: 12,
                fontWeight: 700,
                padding: "6px 14px",
                borderRadius: 6,
                background: active ? T.indigoLt : "transparent",
                color: active ? T.indigo : T.textMuted,
                border: active
                  ? `1px solid rgba(99,102,241,.2)`
                  : "1px solid transparent",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                transition: "all .13s",
              }}
            >
              {f.label}
              {f.id === "new" && newCount > 0 && (
                <span
                  style={{
                    background: T.purple,
                    color: "#fff",
                    fontSize: 10,
                    padding: "1px 6px",
                    borderRadius: 999,
                  }}
                >
                  {newCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div
        style={{ maxWidth: 900, margin: "0 auto", padding: "28px 32px 80px" }}
      >
        {/* Stats row */}
        <div style={{ display: "flex", gap: 12, marginBottom: 28 }}>
          {["new", "quoted", "accepted", "declined"].map((k) => {
            const count = incReqs.filter((r) => r.status === k).length;
            const s = INC_STATUS[k];
            return (
              <div
                key={k}
                style={{
                  flex: 1,
                  background: "#fff",
                  border: `1px solid ${T.border}`,
                  borderRadius: 12,
                  padding: "16px 20px",
                  boxShadow: "0 1px 4px rgba(15,23,42,.04)",
                }}
              >
                <div
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: 28,
                    fontWeight: 700,
                    color: T.textPri,
                    lineHeight: 1,
                  }}
                >
                  {count}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: ".07em",
                    color: s.color,
                    marginTop: 4,
                    background: s.bg,
                    display: "inline-block",
                    padding: "2px 8px",
                    borderRadius: 20,
                  }}
                >
                  {s.label}
                </div>
              </div>
            );
          })}
        </div>

        {shown.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "80px 24px",
              background: "#fff",
              borderRadius: 14,
              border: `1px solid ${T.border}`,
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                margin: "0 auto 16px",
                background: T.pageBg,
                border: `1px solid ${T.border}`,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 26,
              }}
            >
              📭
            </div>
            <div
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 18,
                fontWeight: 600,
                color: T.textPri,
                marginBottom: 6,
              }}
            >
              No {incFilter !== "all" ? incFilter : ""} requests
            </div>
            <div style={{ fontSize: 13, color: T.textMuted }}>
              When another business books your service, requests will appear
              here.
            </div>
          </div>
        ) : (
          shown.map((req) => {
            const st = INC_STATUS[req.status];
            const urg = URGENCY_STYLES[req.urgency] || {
              bg: T.blueLt,
              color: T.blue,
            };
            const exp = expandedInc[req.id];
            return (
              <div
                key={req.id}
                style={{
                  background: "#fff",
                  border:
                    req.status === "new"
                      ? `1.5px solid ${T.purple}`
                      : `1px solid ${T.border}`,
                  borderRadius: 14,
                  marginBottom: 12,
                  overflow: "hidden",
                  boxShadow:
                    req.status === "new"
                      ? `0 0 0 4px ${T.purpleLt}`
                      : "0 1px 4px rgba(15,23,42,.04)",
                }}
              >
                {/* Card header */}
                <div
                  onClick={() => toggleInc(req.id)}
                  style={{
                    padding: "16px 20px",
                    cursor: "pointer",
                    display: "flex",
                    gap: 14,
                    alignItems: "flex-start",
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      flexShrink: 0,
                      background: T.purpleLt,
                      color: T.purple,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 18,
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
                            fontSize: 14,
                            fontWeight: 700,
                            color: T.textPri,
                          }}
                        >
                          {req.clientName}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: T.textMuted,
                            marginTop: 2,
                          }}
                        >
                          Received {req.receivedAt}
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: "4px 12px",
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
                        fontSize: 13,
                        color: T.textMid,
                        marginTop: 8,
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
                        marginTop: 8,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: "3px 10px",
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
                            padding: "3px 10px",
                            borderRadius: 20,
                            background: T.blueLt,
                            color: T.blue,
                          }}
                        >
                          📎 {req.attachedDoc}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded body */}
                {exp && (
                  <div
                    style={{
                      padding: "0 20px 20px",
                      borderTop: `1px solid ${T.border}`,
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 16,
                        margin: "16px 0",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: 10,
                            color: T.textMuted,
                            textTransform: "uppercase",
                            letterSpacing: ".06em",
                            marginBottom: 4,
                            fontWeight: 700,
                          }}
                        >
                          Date requested
                        </div>
                        <div
                          style={{
                            fontSize: 13,
                            color: T.textPri,
                            fontWeight: 600,
                          }}
                        >
                          {req.date} at {req.time}
                        </div>
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: 10,
                            color: T.textMuted,
                            textTransform: "uppercase",
                            letterSpacing: ".06em",
                            marginBottom: 4,
                            fontWeight: 700,
                          }}
                        >
                          Address
                        </div>
                        <div
                          style={{
                            fontSize: 13,
                            color: T.textPri,
                            fontWeight: 600,
                          }}
                        >
                          {req.address}
                        </div>
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: T.textMid,
                        lineHeight: 1.65,
                        marginBottom: 16,
                        background: "#f8fafc",
                        padding: "12px 16px",
                        borderRadius: 8,
                        border: `1px solid ${T.border}`,
                      }}
                    >
                      {req.service}
                    </div>
                    {req.quoteAmount && (
                      <div
                        style={{
                          marginBottom: 14,
                          fontSize: 13,
                          color: T.blue,
                          fontWeight: 700,
                        }}
                      >
                        Your quote: {req.quoteAmount}
                      </div>
                    )}

                    {(req.status === "new" || req.status === "quoted") && (
                      <div
                        style={{ display: "flex", gap: 10, flexWrap: "wrap" }}
                      >
                        <button
                          onClick={() => setQuoteTarget(req)}
                          style={{
                            flex: 1,
                            fontSize: 12,
                            fontWeight: 700,
                            padding: "10px 16px",
                            borderRadius: 8,
                            border: "none",
                            cursor: "pointer",
                            background: T.blue,
                            color: "#fff",
                          }}
                        >
                          {req.status === "new"
                            ? "Send a Quote"
                            : "Update Quote"}
                        </button>
                        <button
                          onClick={() => acceptRequest(req.id)}
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            padding: "10px 16px",
                            borderRadius: 8,
                            border: "none",
                            cursor: "pointer",
                            background: T.green,
                            color: "#fff",
                          }}
                        >
                          Accept Job
                        </button>
                        <button
                          onClick={() => declineRequest(req.id)}
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            padding: "10px 16px",
                            borderRadius: 8,
                            border: `1px solid ${T.border}`,
                            cursor: "pointer",
                            background: "#f8fafc",
                            color: T.textMid,
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
                          color: T.green,
                          background: T.greenLt,
                          padding: "10px 14px",
                          borderRadius: 8,
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
                          color: T.red,
                          background: T.redLt,
                          padding: "10px 14px",
                          borderRadius: 8,
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

      {quoteTarget && (
        <QuoteModal
          target={quoteTarget}
          onClose={() => setQuoteTarget(null)}
          onSend={(amount, notes) =>
            handleSendQuote(quoteTarget.id, amount, notes)
          }
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
