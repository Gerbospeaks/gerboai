import React, { useState, useRef, useEffect } from "react";
import { db } from "../firebase";
import { collection, query, where, getDocs, doc, setDoc, serverTimestamp } from "firebase/firestore";
// ─── Industry config — all 27 from App.js ────────────────────────────────────
const INDUSTRIES = [
  { id: "all", label: "All industries", emoji: "🌐" },
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

// ─── Sample provider data covering all 27 industries ─────────────────────────
const PROVIDERS = [
  // Mechanics
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
    color: "#fef3c7",
    textColor: "#92400e",
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
    initials: "AP",
    color: "#fee2e2",
    textColor: "#991b1b",
    badges: [
      { label: "Engine rebuild", type: "blue" },
      { label: "Gearbox", type: "purple" },
    ],
    about: "Full mechanical overhaul specialists with 15 years experience.",
  },
  // Electrical
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
    initials: "VM",
    color: "#ede9fe",
    textColor: "#5b21b6",
    badges: [
      { label: "DB upgrades", type: "blue" },
      { label: "Fault finding", type: "amber" },
    ],
    about: "Fast fault diagnosis and after-hours emergency call-outs.",
  },
  // Carpentry
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
  // Plumbing
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
  // Logistics
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
    initials: "SM",
    color: "#fff7ed",
    textColor: "#c2410c",
    badges: [
      { label: "Office relocation", type: "blue" },
      { label: "Pallet freight", type: "purple" },
    ],
    about: "Heavy freight and office/warehouse relocation specialists.",
  },
  // Construction
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
  // Accounting
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
  // Cleaning
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
  // Education
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
    initials: "BM",
    color: "#fdf4ff",
    textColor: "#7e22ce",
    badges: [
      { label: "Maths & Science", type: "purple" },
      { label: "Online sessions", type: "blue" },
    ],
    about: "Grade 8-12 tutoring specialists with 95% matric pass rate.",
  },
  // Health
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
  // Hotel / Hospitality
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
  // HVAC
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
  // Landscaping
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
  // Legal
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
  // Painting
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
  // Pest Control
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
  // Photography
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
  // Pool Services
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
  // Real Estate
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
  // Restaurants
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
  // Retail
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
  // Security
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
  // Solar
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
    initials: "SP",
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
  // Towing
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
  // Welding
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
  // Flooring
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
  // Window Repair
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

// ─── Badge color map ──────────────────────────────────────────────────────────
const BADGE_STYLES = {
  green: { background: "#dcfce7", color: "#166534" },
  blue: { background: "#dbeafe", color: "#1e40af" },
  amber: { background: "#fef3c7", color: "#92400e" },
  purple: { background: "#ede9fe", color: "#5b21b6" },
};
function useProviders(industry) {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      const ref = collection(db, "serviceProviders");
      const q = industry === "all"
        ? query(ref)
        : query(ref, where("industry", "==", industry));
      const snap = await getDocs(q);
      setProviders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }
    fetch();
  }, [industry]);

  return { providers, loading };
}
// ─── Reusable badge ───────────────────────────────────────────────────────────
function Badge({ label, type }) {
  const s = BADGE_STYLES[type] || BADGE_STYLES.blue;
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 500,
        padding: "3px 8px",
        borderRadius: 20,
        ...s,
      }}
    >
      {label}
    </span>
  );
}

// ─── Provider card ────────────────────────────────────────────────────────────
function ProviderCard({ provider, onBook }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      onClick={() => setExpanded((e) => !e)}
      style={{
        background: "var(--color-background-primary)",
        border: provider.featured
          ? "1.5px solid #0891b2"
          : "0.5px solid var(--color-border-tertiary)",
        borderRadius: "var(--border-radius-lg)",
        padding: 14,
        display: "flex",
        gap: 12,
        cursor: "pointer",
        transition: "border-color .15s, box-shadow .15s",
        marginBottom: 10,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,.06)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: "var(--border-radius-md)",
          background: provider.color,
          color: provider.textColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 14,
          fontWeight: 600,
          flexShrink: 0,
        }}
      >
        {provider.initials}
      </div>

      {/* Body */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Top row */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 8,
            marginBottom: 4,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: "var(--color-text-primary)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {provider.name}
            </div>
            <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
              {INDUSTRIES.find((i) => i.id === provider.industry)?.label} ·{" "}
              {provider.location}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: 4,
            }}
          >
            {provider.featured && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 500,
                  background: "#ecfeff",
                  color: "#0e7490",
                  padding: "2px 8px",
                  borderRadius: 20,
                  border: "0.5px solid #a5f3fc",
                  whiteSpace: "nowrap",
                }}
              >
                Top rated
              </span>
            )}
            <span
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: "#0891b2",
                whiteSpace: "nowrap",
              }}
            >
              {provider.rate}
            </span>
          </div>
        </div>

        {/* Badges */}
        <div
          style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}
        >
          {provider.badges.map((b, i) => (
            <Badge key={i} {...b} />
          ))}
        </div>

        {/* Meta */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span
            style={{
              fontSize: 12,
              color: "var(--color-text-secondary)",
              display: "flex",
              alignItems: "center",
              gap: 3,
            }}
          >
            <span style={{ color: "#f59e0b" }}>★</span>
            {provider.rating} ({provider.reviews} reviews)
          </span>
          <span
            style={{
              fontSize: 12,
              color: "var(--color-text-secondary)",
              display: "flex",
              alignItems: "center",
              gap: 3,
            }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            Responds in {provider.response}
          </span>
          {!provider.available && (
            <span style={{ fontSize: 11, color: "#dc2626", fontWeight: 500 }}>
              Unavailable
            </span>
          )}
        </div>

        {/* Expanded about */}
        {expanded && (
          <div
            style={{
              marginTop: 8,
              fontSize: 12,
              color: "var(--color-text-secondary)",
              lineHeight: 1.5,
              paddingTop: 8,
              borderTop: "0.5px solid var(--color-border-tertiary)",
            }}
          >
            {provider.about}
          </div>
        )}

        {/* Book button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onBook(provider);
          }}
          style={{
            marginTop: 10,
            width: "100%",
            fontSize: 12,
            fontWeight: 500,
            padding: "7px 14px",
            borderRadius: "var(--border-radius-md)",
            background: provider.available ? "#0891b2" : "#94a3b8",
            color: "#fff",
            border: "none",
            cursor: provider.available ? "pointer" : "not-allowed",
            transition: "background .15s",
          }}
          onMouseEnter={(e) => {
            if (provider.available)
              e.currentTarget.style.background = "#0e7490";
          }}
          onMouseLeave={(e) => {
            if (provider.available)
              e.currentTarget.style.background = "#0891b2";
          }}
        >
          {provider.available ? "Book now" : "Currently unavailable"}
        </button>
      </div>
    </div>
  );
}

// ─── Booking panel ────────────────────────────────────────────────────────────
function BookingPanel({ provider, onClose, onSubmit }) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("09:00");
  const [address, setAddress] = useState("");
  const [desc, setDesc] = useState("");
  const [urgency, setUrgency] = useState("Standard (2-3 days)");
  const [attachDoc, setAttachDoc] = useState("None");
  const [error, setError] = useState("");
  const panelRef = useRef(null);

  useEffect(() => {
    panelRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, []);

  const handleSubmit = () => {
    if (!date || !desc.trim()) {
      setError("Please fill in the date and describe what you need.");
      return;
    }
   async function submitBookingToFirestore({ provider, user, businessInfo, formData }) {
  const requestId = doc(collection(db, "_ids")).id; // generate a clean ID

  const base = {
    requestId,
    date:        formData.date,
    time:        formData.time,
    address:     formData.address,
    description: formData.desc,
    urgency:     formData.urgency,
    attachedDoc: formData.attachDoc,
    createdAt:   serverTimestamp(),
    updatedAt:   serverTimestamp(),
  };

  // Requester copy
  await setDoc(
    doc(db, "users", user.uid, "serviceRequests", requestId),
    {
      ...base,
      providerId:       provider.id,
      providerName:     provider.name,
      providerIndustry: provider.industry,
      status:           "pending",
      quoteAmount:      null,
      quoteNotes:       null,
    }
  );

  // Provider mirror copy
  await setDoc(
    doc(db, "users", provider.id, "incomingRequests", requestId),
    {
      ...base,
      requesterId:        user.uid,
      requesterName:      businessInfo?.businessName || user.displayName || "Unknown",
      requesterIndustry:  businessInfo?.industry || "unknown",
      status:             "new",
      quoteAmount:        null,
      quoteNotes:         null,
    }
  );

  return requestId;
}
  };

  const inputStyle = {
    fontSize: 13,
    padding: "7px 10px",
    borderRadius: "var(--border-radius-md)",
    border: "0.5px solid var(--color-border-secondary)",
    background: "var(--color-background-secondary)",
    color: "var(--color-text-primary)",
    width: "100%",
    outline: "none",
  };

  return (
    <div
      ref={panelRef}
      style={{
        background: "var(--color-background-primary)",
        border: "0.5px solid var(--color-border-tertiary)",
        borderRadius: "var(--border-radius-lg)",
        padding: 16,
      }}
    >
      {/* Title */}
      <div
        style={{
          fontSize: 13,
          fontWeight: 500,
          color: "var(--color-text-primary)",
          marginBottom: 12,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <div
          style={{
            width: 20,
            height: 20,
            borderRadius: 6,
            background: "#ecfeff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#0891b2"
            strokeWidth="2.5"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </div>
        Book — {provider.name}
      </div>

      {/* Summary strip */}
      <div
        style={{
          background: "var(--color-background-secondary)",
          borderRadius: "var(--border-radius-md)",
          padding: "10px 12px",
          marginBottom: 12,
          display: "flex",
          justifyContent: "space-between",
          fontSize: 13,
        }}
      >
        <span style={{ color: "var(--color-text-secondary)" }}>
          {INDUSTRIES.find((i) => i.id === provider.industry)?.label} ·{" "}
          {provider.location}
        </span>
        <span style={{ color: "var(--color-text-primary)", fontWeight: 500 }}>
          {provider.rate}
        </span>
      </div>

      {/* Date / Time */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
          marginBottom: 10,
        }}
      >
        <div>
          <label
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: "var(--color-text-secondary)",
              textTransform: "uppercase",
              letterSpacing: ".05em",
              display: "block",
              marginBottom: 4,
            }}
          >
            Service date
          </label>
          <input
            type="date"
            style={inputStyle}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div>
          <label
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: "var(--color-text-secondary)",
              textTransform: "uppercase",
              letterSpacing: ".05em",
              display: "block",
              marginBottom: 4,
            }}
          >
            Preferred time
          </label>
          <input
            type="time"
            style={inputStyle}
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>
      </div>

      {/* Address */}
      <div style={{ marginBottom: 10 }}>
        <label
          style={{
            fontSize: 11,
            fontWeight: 500,
            color: "var(--color-text-secondary)",
            textTransform: "uppercase",
            letterSpacing: ".05em",
            display: "block",
            marginBottom: 4,
          }}
        >
          Service address
        </label>
        <input
          type="text"
          placeholder="Your property or site address"
          style={inputStyle}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
      </div>

      {/* Description */}
      <div style={{ marginBottom: 10 }}>
        <label
          style={{
            fontSize: 11,
            fontWeight: 500,
            color: "var(--color-text-secondary)",
            textTransform: "uppercase",
            letterSpacing: ".05em",
            display: "block",
            marginBottom: 4,
          }}
        >
          Describe what you need
        </label>
        <textarea
          placeholder={`E.g. ${provider.about}`}
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          style={{ ...inputStyle, resize: "vertical", minHeight: 64 }}
        />
      </div>

      {/* Urgency / Attach */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
          marginBottom: 12,
        }}
      >
        <div>
          <label
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: "var(--color-text-secondary)",
              textTransform: "uppercase",
              letterSpacing: ".05em",
              display: "block",
              marginBottom: 4,
            }}
          >
            Urgency
          </label>
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
          <label
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: "var(--color-text-secondary)",
              textTransform: "uppercase",
              letterSpacing: ".05em",
              display: "block",
              marginBottom: 4,
            }}
          >
            Attach to document
          </label>
          <select
            style={inputStyle}
            value={attachDoc}
            onChange={(e) => setAttachDoc(e.target.value)}
          >
            <option>None</option>
            <option>Current quote</option>
            <option>Current invoice</option>
            <option>New purchase order</option>
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ fontSize: 12, color: "#dc2626", marginBottom: 8 }}>
          {error}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={onClose}
          style={{
            fontSize: 13,
            fontWeight: 500,
            padding: "9px 16px",
            borderRadius: "var(--border-radius-md)",
            background: "var(--color-background-secondary)",
            color: "var(--color-text-secondary)",
            border: "0.5px solid var(--color-border-secondary)",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          style={{
            flex: 1,
            fontSize: 13,
            fontWeight: 500,
            padding: 9,
            borderRadius: "var(--border-radius-md)",
            background: "#059669",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            transition: "background .15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#047857";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#059669";
          }}
        >
          Send booking request
        </button>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ServiceMarketplaceView({ user, businessInfo, onBack }) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [bookingProvider, setBookingProvider] = useState(null);
  const [requests, setRequests] = useState([
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
  ]);
  const [toast, setToast] = useState(null);

  const filteredProviders =
    activeCategory === "all"
      ? PROVIDERS
      : PROVIDERS.filter((p) => p.industry === activeCategory);

  const featuredProviders = filteredProviders.filter((p) => p.featured);
  const standardProviders = filteredProviders.filter((p) => !p.featured);
  const availableToday = PROVIDERS.filter((p) => p.available).length;

  const handleBook = (provider) => {
    setBookingProvider(provider);
  };

  const handleSubmitBooking = ({
    provider,
    date,
    desc,
    urgency,
    attachDoc,
  }) => {
    const newReq = {
      id: Date.now(),
      name: provider.name,
      industry: provider.industry,
      date: "Just now",
      status: "pending",
    };
    setRequests((r) => [...r, newReq]);
    setBookingProvider(null);
    setToast(
      `Booking request sent to ${provider.name}. They'll respond with a quote shortly.`,
    );
    setTimeout(() => setToast(null), 4000);
  };

  const STATUS_PILL = {
    confirmed: { background: "#dcfce7", color: "#166534", label: "Confirmed" },
    progress: { background: "#dbeafe", color: "#1e40af", label: "In progress" },
    pending: {
      background: "#fef3c7",
      color: "#92400e",
      label: "Awaiting quote",
    },
  };

  return (
    <div
      style={{
        background: "var(--color-background-tertiary)",
        borderRadius: "var(--border-radius-lg)",
        overflow: "hidden",
        border: "0.5px solid var(--color-border-tertiary)",
        position: "relative",
      }}
    >
      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "absolute",
            top: 16,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#059669",
            color: "#fff",
            fontSize: 13,
            fontWeight: 500,
            padding: "10px 18px",
            borderRadius: 999,
            zIndex: 100,
            whiteSpace: "nowrap",
            boxShadow: "0 4px 16px rgba(0,0,0,.15)",
            pointerEvents: "none",
          }}
        >
          {toast}
        </div>
      )}

      {/* Top bar */}
      <div
        style={{
          background: "var(--color-background-primary)",
          borderBottom: "0.5px solid var(--color-border-tertiary)",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {onBack && (
            <button
              onClick={onBack}
              style={{
                width: 28,
                height: 28,
                borderRadius: "var(--border-radius-md)",
                border: "0.5px solid var(--color-border-secondary)",
                background: "var(--color-background-secondary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--color-text-secondary)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          )}
          <div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: "var(--color-text-primary)",
              }}
            >
              Find a service provider
            </div>
            <div
              style={{
                fontSize: 12,
                color: "var(--color-text-secondary)",
                marginTop: 1,
              }}
            >
              Book from {INDUSTRIES.length - 1} industries on your platform
            </div>
          </div>
        </div>
        <button
          style={{
            fontSize: 12,
            fontWeight: 500,
            padding: "6px 14px",
            borderRadius: "var(--border-radius-md)",
            background: "#7c3aed",
            color: "#fff",
            border: "none",
            cursor: "pointer",
          }}
        >
          Post a request ↗
        </button>
      </div>

      {/* Filter chips */}
      <div
        style={{
          background: "var(--color-background-primary)",
          borderBottom: "0.5px solid var(--color-border-tertiary)",
          padding: "10px 16px",
          display: "flex",
          gap: 8,
          overflowX: "auto",
          flexWrap: "nowrap",
        }}
      >
        {INDUSTRIES.map((ind) => (
          <button
            key={ind.id}
            onClick={() => {
              setActiveCategory(ind.id);
              setBookingProvider(null);
            }}
            style={{
              fontSize: 12,
              fontWeight: 500,
              padding: "5px 12px",
              borderRadius: 20,
              whiteSpace: "nowrap",
              cursor: "pointer",
              transition: "all .15s",
              border: "0.5px solid",
              background:
                activeCategory === ind.id
                  ? "#0891b2"
                  : "var(--color-background-secondary)",
              color:
                activeCategory === ind.id
                  ? "#fff"
                  : "var(--color-text-secondary)",
              borderColor:
                activeCategory === ind.id
                  ? "#0891b2"
                  : "var(--color-border-secondary)",
            }}
          >
            {ind.emoji} {ind.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div
        style={{
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {/* Availability bar */}
        <div
          style={{
            background: "#f0fdf4",
            border: "0.5px solid #bbf7d0",
            borderRadius: "var(--border-radius-md)",
            padding: "10px 14px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 13,
            color: "#166534",
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#22c55e",
              flexShrink: 0,
            }}
          />
          <span>
            {availableToday} providers across the platform are available today
          </span>
        </div>

        {/* Featured section */}
        {featuredProviders.length > 0 && (
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: "var(--color-text-tertiary)",
                textTransform: "uppercase",
                letterSpacing: ".06em",
                marginBottom: 8,
              }}
            >
              Recommended for you
            </div>
            {featuredProviders.map((p) => (
              <ProviderCard key={p.id} provider={p} onBook={handleBook} />
            ))}
          </div>
        )}

        {/* Divider */}
        {featuredProviders.length > 0 && standardProviders.length > 0 && (
          <div
            style={{
              height: "0.5px",
              background: "var(--color-border-tertiary)",
            }}
          />
        )}

        {/* Standard section */}
        {standardProviders.length > 0 && (
          <div>
            {featuredProviders.length > 0 && (
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  color: "var(--color-text-tertiary)",
                  textTransform: "uppercase",
                  letterSpacing: ".06em",
                  marginBottom: 8,
                }}
              >
                More providers
              </div>
            )}
            {standardProviders.map((p) => (
              <ProviderCard key={p.id} provider={p} onBook={handleBook} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {filteredProviders.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "32px 16px",
              background: "var(--color-background-primary)",
              borderRadius: "var(--border-radius-lg)",
              border: "0.5px solid var(--color-border-tertiary)",
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 8 }}>
              {INDUSTRIES.find((i) => i.id === activeCategory)?.emoji || "🔍"}
            </div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: "var(--color-text-primary)",
                marginBottom: 4,
              }}
            >
              No providers listed yet
            </div>
            <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
              Be the first to list your business in this category.
            </div>
          </div>
        )}

        {/* Divider */}
        <div
          style={{
            height: "0.5px",
            background: "var(--color-border-tertiary)",
          }}
        />

        {/* Booking panel */}
        {bookingProvider && (
          <BookingPanel
            provider={bookingProvider}
            onClose={() => setBookingProvider(null)}
            onSubmit={handleSubmitBooking}
          />
        )}

        {/* My requests */}
        <div
          style={{
            background: "var(--color-background-primary)",
            border: "0.5px solid var(--color-border-tertiary)",
            borderRadius: "var(--border-radius-lg)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "12px 14px",
              borderBottom: "0.5px solid var(--color-border-tertiary)",
              fontSize: 13,
              fontWeight: 500,
              color: "var(--color-text-primary)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>My service requests</span>
            <span
              style={{
                fontSize: 11,
                color: "var(--color-text-tertiary)",
                fontWeight: 400,
              }}
            >
              {requests.length} total
            </span>
          </div>
          {requests.map((req, i) => {
            const pill = STATUS_PILL[req.status];
            return (
              <div
                key={req.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 14px",
                  borderBottom:
                    i < requests.length - 1
                      ? "0.5px solid var(--color-border-tertiary)"
                      : "none",
                  fontSize: 13,
                }}
              >
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 2 }}
                >
                  <span
                    style={{
                      fontWeight: 500,
                      color: "var(--color-text-primary)",
                    }}
                  >
                    {req.name}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      color: "var(--color-text-tertiary)",
                    }}
                  >
                    {INDUSTRIES.find((i) => i.id === req.industry)?.label} ·
                    Requested {req.date}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    padding: "3px 10px",
                    borderRadius: 20,
                    background: pill.background,
                    color: pill.color,
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
  );
}
