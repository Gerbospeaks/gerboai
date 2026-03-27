import { useState, useEffect, useRef, useCallback } from "react";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  getDocs,
  doc,
  getDoc,
  setDoc,
  where,
} from "firebase/firestore";
import { useAuth } from "../../contexts/AuthContext";
import { buildGradeThemes } from "../../lib/gradeThemes";
import { loadPaletteSelections } from "../../lib/themeService";
const injectPrintStyles = () => {
  if (document.getElementById("report-print-styles")) return;
  const style = document.createElement("style");
  style.id = "report-print-styles";
  style.textContent = `
    @media print {
      body > * { display: none !important; }
      #report-layout { display: block !important; }
      #left-panel,
      #theme-bar,
      #student-list-panel,
      #mobile-tab-bar,
      .no-print { display: none !important; }
      #report-preview {
        display: block !important;
        position: static !important;
        overflow: visible !important;
        background: white !important;
        flex: none !important;
        width: 100% !important;
      }
      @page {
        size: A4 portrait;
        margin: 0;
      }
      .report-page {
        width: 210mm !important;
        min-height: 297mm !important;
        max-height: 297mm !important;
        page-break-after: always !important;
        break-after: page !important;
        overflow: hidden !important;
        box-shadow: none !important;
        margin: 0 auto !important;
      }
      .report-page:last-child {
        page-break-after: avoid !important;
        break-after: avoid !important;
      }
    }
  `;
  document.head.appendChild(style);
};

const injectFonts = () => {
  if (document.getElementById("rpt-gf")) return;
  const l = document.createElement("link");
  l.id = "rpt-gf";
  l.rel = "stylesheet";
  l.href =
    "https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Lato:wght@300;400;700&family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500;700&display=swap";
  document.head.appendChild(l);
};

const injectResponsiveStyles = () => {
  if (document.getElementById("report-responsive-styles")) return;
  const style = document.createElement("style");
  style.id = "report-responsive-styles";
  style.textContent = `
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ── DESKTOP (>= 901px) ── */
    @media (min-width: 901px) {
      #mobile-tab-bar { display: none !important; }
      #mobile-panel-preview,
      #mobile-panel-inputs,
      #mobile-panel-classlist { display: contents !important; }
      /* Reset any mobile-forced styles */
      #left-panel { display: flex !important; }
      #theme-bar  { display: flex !important; }
      #student-list-panel { display: flex !important; }
    }

    /* ── MOBILE (<= 900px) ── */
    @media (max-width: 900px) {
      #report-layout {
        flex-direction: column !important;
        height: 100dvh !important;
        overflow: hidden !important;
      }

      /* Theme bar hidden on mobile */
      #theme-bar { display: none !important; }

      /* Left panel (inputs) hidden by default; shown when inputs tab active */
      #left-panel {
        display: none !important;
        width: 100% !important;
        max-width: 100% !important;
        min-width: unset !important;
        border-right: none !important;
        border-bottom: 1px solid #dee2e6;
        flex: 1 !important;
        overflow-y: auto !important;
      }
      #left-panel.mobile-active {
        display: flex !important;
        flex-direction: column !important;
      }

      /* Student list panel: hidden by default; shown when classlist tab active */
      #student-list-panel {
        position: static !important;
        transform: none !important;
        box-shadow: none !important;
        display: none !important;
        width: 100% !important;
        max-width: 100% !important;
        height: auto !important;
        flex: 1 !important;
        border-left: none !important;
        border-top: 1px solid #e5e7eb !important;
        overflow-y: auto !important;
      }
      #student-list-panel.mobile-active {
        display: flex !important;
        flex-direction: column !important;
      }
        .report-page-scaler {
  width: 100%;
  display: flex;
  justify-content: center;
  overflow: hidden;
}
      /* Preview: shown by default */
      #report-preview {
       display: none !important;
  flex: 1 !important;
  overflow-y: auto !important;
  overflow-x: hidden !important;   /* was overflow-x: auto */
  min-height: 0 !important;
      }
      #report-preview.mobile-active {
        display: flex !important;
        flex-direction: column !important;
      }

      /* Bottom tab bar */
      #mobile-tab-bar {
        display: flex !important;
        height: 62px !important;
        min-height: 62px !important;
        flex-shrink: 0 !important;
      }

      .report-page {
         margin: 4px auto !important;
      }
    }

    @media print {
      #mobile-tab-bar { display: none !important; }
    }
  `;
  document.head.appendChild(style);
};

const normaliseGrade = (g) =>
  String(g || "")
    .replace(/^grade\s*/i, "")
    .trim();

const AVATAR_COLORS = [
  ["#dbeafe", "#1d4ed8"],
  ["#dcfce7", "#15803d"],
  ["#fef9c3", "#a16207"],
  ["#fce7f3", "#9d174d"],
  ["#ede9fe", "#6d28d9"],
  ["#ffedd5", "#c2410c"],
  ["#cffafe", "#0e7490"],
  ["#f3f4f6", "#374151"],
];

const strHash = (s) => {
  let h = 0;
  const str = String(s || "0");
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
};
const avatarColor = (id) => AVATAR_COLORS[strHash(id) % AVATAR_COLORS.length];
const initials = (name) =>
  String(name || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const fmt = (n) =>
  `R${Number(n || 0).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`;

const pct = (a, b) => (b === 0 ? 0 : Math.round((a / b) * 100));

// ── THEMES ────────────────────────────────────────────────────────────────────
const THEMES = {
  classic: {
    id: "classic",
    name: "Foundation Classic",
    sub: "Navy · Cream · Gold",
    icon: "📘",
    p: "#1d3557",
    a: "#e63946",
    teal: "#2a9d8f",
    sky: "#457b9d",
    gold: "#f4a261",
    cream: "#f1faee",
    lt: "#a8dadc",
    bd: "#dee2e6",
    mu: "#6c757d",
    hf: `"Nunito","Trebuchet MS",sans-serif`,
    bf: `"Lato","Segoe UI",sans-serif`,
    cBg: "linear-gradient(160deg,#f1faee 60%,#fff)",
    fBg: "#f4a261",
    hTxt: "#fff",
    pgBorder: "6px solid #1d3557",
    tb: [
      "linear-gradient(90deg,#1d3557,#457b9d)",
      "linear-gradient(90deg,#2a9d8f,#57cc99)",
      "linear-gradient(90deg,#e63946,#f4845f)",
      "linear-gradient(90deg,#e9c46a,#f4a261)",
    ],
    sv: "filled",
    tableHeader: (p, bd, cream) => ({
      background: cream,
      color: p,
      fontWeight: 700,
      fontSize: "7.5pt",
      padding: "1.5mm 2mm",
      border: `1px solid ${bd}`,
      textAlign: "center",
    }),
    tableCell: (bd, even) => ({
      padding: "1.4mm 2mm",
      border: `1px solid ${bd}`,
      background: even ? "#f8f9fa" : "#fff",
      verticalAlign: "middle",
    }),
  },
  modern: {
    id: "modern",
    name: "Modern Minimal",
    sub: "Blue · White · Clean",
    icon: "🔷",
    p: "#1e3a8a",
    a: "#3b82f6",
    teal: "#10b981",
    sky: "#60a5fa",
    gold: "#f59e0b",
    cream: "#f0f9ff",
    lt: "#dbeafe",
    bd: "#e2e8f0",
    mu: "#64748b",
    hf: `"DM Sans","Segoe UI",Arial,sans-serif`,
    bf: `"DM Sans","Segoe UI",Arial,sans-serif`,
    cBg: "linear-gradient(135deg,#eff6ff,#dbeafe 50%,#fff)",
    fBg: "#1e3a8a",
    hTxt: "#fff",
    pgBorder: "4px solid #3b82f6",
    tb: [
      "linear-gradient(90deg,#1e3a8a,#3b82f6)",
      "linear-gradient(90deg,#065f46,#10b981)",
      "linear-gradient(90deg,#9f1239,#f43f5e)",
      "linear-gradient(90deg,#92400e,#f59e0b)",
    ],
    sv: "outlined",
    tableHeader: (p, bd) => ({
      background: "#fff",
      color: p,
      fontWeight: 600,
      fontSize: "7.5pt",
      padding: "1.5mm 2mm",
      borderBottom: `2px solid ${p}`,
      borderRight: "none",
      borderLeft: "none",
      borderTop: "none",
      textAlign: "center",
    }),
    tableCell: (bd, even) => ({
      padding: "1.6mm 2mm",
      borderBottom: `1px solid ${bd}`,
      borderLeft: "none",
      borderRight: "none",
      borderTop: "none",
      background: even ? "#f8fafc" : "#fff",
      verticalAlign: "middle",
    }),
  },
  professional: {
    id: "professional",
    name: "Formal Academic",
    sub: "Classic · Structured",
    icon: "📋",
    p: "#111827",
    a: "#374151",
    teal: "#15803d",
    sky: "#6b7280",
    gold: "#b45309",
    cream: "#f9fafb",
    lt: "#f3f4f6",
    bd: "#d1d5db",
    mu: "#9ca3af",
    hf: `"Playfair Display","Georgia","Times New Roman",serif`,
    bf: `"Georgia","Times New Roman",serif`,
    cBg: "#fff",
    fBg: "#111827",
    hTxt: "#fff",
    pgBorder: "3px double #111827",
    tb: [
      "linear-gradient(90deg,#111827,#374151)",
      "linear-gradient(90deg,#14532d,#15803d)",
      "linear-gradient(90deg,#7f1d1d,#b91c1c)",
      "linear-gradient(90deg,#78350f,#b45309)",
    ],
    sv: "underlined",
    tableHeader: (p, bd) => ({
      background: p,
      color: "#fff",
      fontWeight: 700,
      fontSize: "7.5pt",
      padding: "1.5mm 2mm",
      border: `1px solid ${p}`,
      textAlign: "center",
    }),
    tableCell: (bd, even) => ({
      padding: "1.4mm 2mm",
      border: `1px solid ${bd}`,
      background: even ? "#f9fafb" : "#fff",
      verticalAlign: "middle",
    }),
  },
  playful: {
    id: "playful",
    name: "Playful Rainbow",
    sub: "Bright · Fun · Colorful",
    icon: "🌈",
    p: "#7c3aed",
    a: "#f43f5e",
    teal: "#22c55e",
    sky: "#0ea5e9",
    gold: "#fbbf24",
    cream: "#fff7ed",
    lt: "#fef9c3",
    bd: "#e2e8f0",
    mu: "#64748b",
    hf: `"Nunito","Arial Rounded MT Bold",Arial,sans-serif`,
    bf: `"Nunito",Arial,sans-serif`,
    cBg: "linear-gradient(135deg,#fff7ed,#fef9c3 50%,#f0fdf4)",
    fBg: "#7c3aed",
    hTxt: "#fff",
    pgBorder: "6px solid #7c3aed",
    tb: [
      "linear-gradient(90deg,#7c3aed,#a78bfa)",
      "linear-gradient(90deg,#0891b2,#22d3ee)",
      "linear-gradient(90deg,#b91c1c,#f97316)",
      "linear-gradient(90deg,#a16207,#fbbf24)",
    ],
    sv: "pill",
    tableHeader: (p, bd) => ({
      background: "#faf5ff",
      color: p,
      fontWeight: 700,
      fontSize: "7.5pt",
      padding: "1.5mm 2mm",
      border: `1.5px solid ${bd}`,
      textAlign: "center",
    }),
    tableCell: (bd, even) => ({
      padding: "1.4mm 2mm",
      border: `1.5px solid ${bd}`,
      background: even ? "#faf5ff" : "#fff",
      verticalAlign: "middle",
    }),
  },
};
// ── GRADE-SPECIFIC THEMES (Grade R / 0–7) ─────────────────────────────────────
const GRADE_THEMES = {
  R: {
    id: "gradeR",
    grade: "R",
    name: "Grade R",
    tagline: "Rainbow Starters",
    emoji: "🌈",
    p: "#7c3aed",
    a: "#f43f5e",
    teal: "#22c55e",
    sky: "#0ea5e9",
    gold: "#fbbf24",
    cream: "#fff7ed",
    lt: "#fef9c3",
    bd: "#e2e8f0",
    mu: "#64748b",
    hf: `"Nunito","Arial Rounded MT Bold",Arial,sans-serif`,
    bf: `"Nunito",Arial,sans-serif`,
    cBg: "linear-gradient(135deg,#fff7ed,#fef9c3 50%,#f0fdf4)",
    fBg: "#7c3aed",
    hTxt: "#fff",
    pgBorder: "7px solid #7c3aed",
    accent1: "#f43f5e",
    accent2: "#fbbf24",
    tb: [
      "linear-gradient(90deg,#7c3aed,#a78bfa)",
      "linear-gradient(90deg,#0891b2,#22d3ee)",
      "linear-gradient(90deg,#b91c1c,#f97316)",
      "linear-gradient(90deg,#a16207,#fbbf24)",
    ],
    sv: "pill",
    tableHeader: (p, bd) => ({
      background: "#faf5ff",
      color: p,
      fontWeight: 700,
      fontSize: "7.5pt",
      padding: "1.5mm 2mm",
      border: `1.5px solid ${bd}`,
      textAlign: "center",
    }),
    tableCell: (bd, even) => ({
      padding: "1.4mm 2mm",
      border: `1.5px solid ${bd}`,
      background: even ? "#faf5ff" : "#fff",
      verticalAlign: "middle",
    }),
  },
  0: {
    id: "grade0",
    grade: "0",
    name: "Grade 0",
    tagline: "Bright Beginners",
    emoji: "🦋",
    p: "#db2777",
    a: "#f97316",
    teal: "#10b981",
    sky: "#8b5cf6",
    gold: "#fcd34d",
    cream: "#fdf2f8",
    lt: "#fce7f3",
    bd: "#fbcfe8",
    mu: "#9d174d",
    hf: `"Nunito","Arial Rounded MT Bold",Arial,sans-serif`,
    bf: `"Nunito",Arial,sans-serif`,
    cBg: "linear-gradient(135deg,#fdf2f8,#fce7f3 50%,#fff)",
    fBg: "#db2777",
    hTxt: "#fff",
    pgBorder: "6px solid #db2777",
    accent1: "#f97316",
    accent2: "#fcd34d",
    tb: [
      "linear-gradient(90deg,#db2777,#ec4899)",
      "linear-gradient(90deg,#065f46,#10b981)",
      "linear-gradient(90deg,#7c2d12,#f97316)",
      "linear-gradient(90deg,#78350f,#fcd34d)",
    ],
    sv: "pill",
    tableHeader: (p, bd) => ({
      background: "#fdf2f8",
      color: p,
      fontWeight: 700,
      fontSize: "7.5pt",
      padding: "1.5mm 2mm",
      border: `1.5px solid ${bd}`,
      textAlign: "center",
    }),
    tableCell: (bd, even) => ({
      padding: "1.4mm 2mm",
      border: `1.5px solid ${bd}`,
      background: even ? "#fdf2f8" : "#fff",
      verticalAlign: "middle",
    }),
  },
  1: {
    id: "grade1",
    grade: "1",
    name: "Grade 1",
    tagline: "Sunshine Learners",
    emoji: "☀️",
    p: "#b45309",
    a: "#ef4444",
    teal: "#0d9488",
    sky: "#d97706",
    gold: "#fbbf24",
    cream: "#fffbeb",
    lt: "#fef3c7",
    bd: "#fde68a",
    mu: "#92400e",
    hf: `"Nunito","Trebuchet MS",sans-serif`,
    bf: `"Lato","Segoe UI",sans-serif`,
    cBg: "linear-gradient(135deg,#fffbeb,#fef3c7 50%,#fff)",
    fBg: "#b45309",
    hTxt: "#fff",
    pgBorder: "6px solid #b45309",
    accent1: "#ef4444",
    accent2: "#fbbf24",
    tb: [
      "linear-gradient(90deg,#b45309,#d97706)",
      "linear-gradient(90deg,#0d9488,#2dd4bf)",
      "linear-gradient(90deg,#991b1b,#ef4444)",
      "linear-gradient(90deg,#a16207,#fbbf24)",
    ],
    sv: "filled",
    tableHeader: (p, bd, cream) => ({
      background: cream,
      color: p,
      fontWeight: 700,
      fontSize: "7.5pt",
      padding: "1.5mm 2mm",
      border: `1px solid ${bd}`,
      textAlign: "center",
    }),
    tableCell: (bd, even) => ({
      padding: "1.4mm 2mm",
      border: `1px solid ${bd}`,
      background: even ? "#fffbeb" : "#fff",
      verticalAlign: "middle",
    }),
  },
  2: {
    id: "grade2",
    grade: "2",
    name: "Grade 2",
    tagline: "Ocean Explorers",
    emoji: "🌊",
    p: "#0369a1",
    a: "#0ea5e9",
    teal: "#0891b2",
    sky: "#7dd3fc",
    gold: "#38bdf8",
    cream: "#f0f9ff",
    lt: "#e0f2fe",
    bd: "#bae6fd",
    mu: "#075985",
    hf: `"Nunito","Trebuchet MS",sans-serif`,
    bf: `"Lato","Segoe UI",sans-serif`,
    cBg: "linear-gradient(135deg,#f0f9ff,#e0f2fe 50%,#fff)",
    fBg: "#0369a1",
    hTxt: "#fff",
    pgBorder: "6px solid #0369a1",
    accent1: "#0ea5e9",
    accent2: "#38bdf8",
    tb: [
      "linear-gradient(90deg,#0369a1,#0ea5e9)",
      "linear-gradient(90deg,#0e7490,#06b6d4)",
      "linear-gradient(90deg,#1d4ed8,#60a5fa)",
      "linear-gradient(90deg,#1e40af,#3b82f6)",
    ],
    sv: "outlined",
    tableHeader: (p, bd) => ({
      background: "#f0f9ff",
      color: p,
      fontWeight: 600,
      fontSize: "7.5pt",
      padding: "1.5mm 2mm",
      borderBottom: `2px solid ${p}`,
      borderRight: "none",
      borderLeft: "none",
      borderTop: "none",
      textAlign: "center",
    }),
    tableCell: (bd, even) => ({
      padding: "1.6mm 2mm",
      borderBottom: `1px solid ${bd}`,
      borderLeft: "none",
      borderRight: "none",
      borderTop: "none",
      background: even ? "#f0f9ff" : "#fff",
      verticalAlign: "middle",
    }),
  },
  3: {
    id: "grade3",
    grade: "3",
    name: "Grade 3",
    tagline: "Forest Growers",
    emoji: "🌿",
    p: "#15803d",
    a: "#16a34a",
    teal: "#0d9488",
    sky: "#059669",
    gold: "#84cc16",
    cream: "#f0fdf4",
    lt: "#dcfce7",
    bd: "#bbf7d0",
    mu: "#166534",
    hf: `"Nunito","Trebuchet MS",sans-serif`,
    bf: `"Lato","Segoe UI",sans-serif`,
    cBg: "linear-gradient(135deg,#f0fdf4,#dcfce7 50%,#fff)",
    fBg: "#15803d",
    hTxt: "#fff",
    pgBorder: "6px solid #15803d",
    accent1: "#16a34a",
    accent2: "#84cc16",
    tb: [
      "linear-gradient(90deg,#15803d,#16a34a)",
      "linear-gradient(90deg,#0d9488,#2dd4bf)",
      "linear-gradient(90deg,#3f6212,#84cc16)",
      "linear-gradient(90deg,#065f46,#10b981)",
    ],
    sv: "filled",
    tableHeader: (p, bd, cream) => ({
      background: cream,
      color: p,
      fontWeight: 700,
      fontSize: "7.5pt",
      padding: "1.5mm 2mm",
      border: `1px solid ${bd}`,
      textAlign: "center",
    }),
    tableCell: (bd, even) => ({
      padding: "1.4mm 2mm",
      border: `1px solid ${bd}`,
      background: even ? "#f0fdf4" : "#fff",
      verticalAlign: "middle",
    }),
  },
  4: {
    id: "grade4",
    grade: "4",
    name: "Grade 4",
    tagline: "Cosmic Thinkers",
    emoji: "🚀",
    p: "#6d28d9",
    a: "#7c3aed",
    teal: "#7c3aed",
    sky: "#a78bfa",
    gold: "#c084fc",
    cream: "#faf5ff",
    lt: "#ede9fe",
    bd: "#ddd6fe",
    mu: "#5b21b6",
    hf: `"DM Sans","Segoe UI",Arial,sans-serif`,
    bf: `"DM Sans","Segoe UI",Arial,sans-serif`,
    cBg: "linear-gradient(135deg,#faf5ff,#ede9fe 50%,#fff)",
    fBg: "#6d28d9",
    hTxt: "#fff",
    pgBorder: "4px solid #6d28d9",
    accent1: "#ec4899",
    accent2: "#c084fc",
    tb: [
      "linear-gradient(90deg,#6d28d9,#7c3aed)",
      "linear-gradient(90deg,#1e40af,#3b82f6)",
      "linear-gradient(90deg,#be185d,#ec4899)",
      "linear-gradient(90deg,#7e22ce,#c084fc)",
    ],
    sv: "outlined",
    tableHeader: (p, bd) => ({
      background: "#faf5ff",
      color: p,
      fontWeight: 600,
      fontSize: "7.5pt",
      padding: "1.5mm 2mm",
      borderBottom: `2px solid ${p}`,
      borderRight: "none",
      borderLeft: "none",
      borderTop: "none",
      textAlign: "center",
    }),
    tableCell: (bd, even) => ({
      padding: "1.6mm 2mm",
      borderBottom: `1px solid ${bd}`,
      borderLeft: "none",
      borderRight: "none",
      borderTop: "none",
      background: even ? "#faf5ff" : "#fff",
      verticalAlign: "middle",
    }),
  },
  5: {
    id: "grade5",
    grade: "5",
    name: "Grade 5",
    tagline: "Autumn Achievers",
    emoji: "🍂",
    p: "#9a3412",
    a: "#c2410c",
    teal: "#0d9488",
    sky: "#b45309",
    gold: "#ea580c",
    cream: "#fff7ed",
    lt: "#ffedd5",
    bd: "#fed7aa",
    mu: "#7c2d12",
    hf: `"DM Sans","Segoe UI",Arial,sans-serif`,
    bf: `"DM Sans","Segoe UI",Arial,sans-serif`,
    cBg: "linear-gradient(135deg,#fff7ed,#ffedd5 50%,#fff)",
    fBg: "#9a3412",
    hTxt: "#fff",
    pgBorder: "4px solid #9a3412",
    accent1: "#c2410c",
    accent2: "#ea580c",
    tb: [
      "linear-gradient(90deg,#9a3412,#c2410c)",
      "linear-gradient(90deg,#0d9488,#2dd4bf)",
      "linear-gradient(90deg,#78350f,#ea580c)",
      "linear-gradient(90deg,#92400e,#f59e0b)",
    ],
    sv: "outlined",
    tableHeader: (p, bd) => ({
      background: "#fff7ed",
      color: p,
      fontWeight: 600,
      fontSize: "7.5pt",
      padding: "1.5mm 2mm",
      borderBottom: `2px solid ${p}`,
      borderRight: "none",
      borderLeft: "none",
      borderTop: "none",
      textAlign: "center",
    }),
    tableCell: (bd, even) => ({
      padding: "1.6mm 2mm",
      borderBottom: `1px solid ${bd}`,
      borderLeft: "none",
      borderRight: "none",
      borderTop: "none",
      background: even ? "#fff7ed" : "#fff",
      verticalAlign: "middle",
    }),
  },
  6: {
    id: "grade6",
    grade: "6",
    name: "Grade 6",
    tagline: "Steel Leaders",
    emoji: "⚡",
    p: "#0f4c75",
    a: "#1b6ca8",
    teal: "#0369a1",
    sky: "#0284c7",
    gold: "#0ea5e9",
    cream: "#f0f9ff",
    lt: "#dbeafe",
    bd: "#bfdbfe",
    mu: "#1e4e8c",
    hf: `"DM Sans","Segoe UI",Arial,sans-serif`,
    bf: `"DM Sans","Segoe UI",Arial,sans-serif`,
    cBg: "linear-gradient(135deg,#f0f4ff,#dbeafe 50%,#fff)",
    fBg: "#0f4c75",
    hTxt: "#fff",
    pgBorder: "4px solid #0f4c75",
    accent1: "#1b6ca8",
    accent2: "#0ea5e9",
    tb: [
      "linear-gradient(90deg,#0f4c75,#1b6ca8)",
      "linear-gradient(90deg,#065f46,#059669)",
      "linear-gradient(90deg,#7c2d12,#c2410c)",
      "linear-gradient(90deg,#0369a1,#0ea5e9)",
    ],
    sv: "underlined",
    tableHeader: (p, bd) => ({
      background: p,
      color: "#fff",
      fontWeight: 700,
      fontSize: "7.5pt",
      padding: "1.5mm 2mm",
      border: `1px solid ${p}`,
      textAlign: "center",
    }),
    tableCell: (bd, even) => ({
      padding: "1.4mm 2mm",
      border: `1px solid ${bd}`,
      background: even ? "#f0f9ff" : "#fff",
      verticalAlign: "middle",
    }),
  },
  7: {
    id: "grade7",
    grade: "7",
    name: "Grade 7",
    tagline: "Prestige Graduates",
    emoji: "🎓",
    p: "#111827",
    a: "#b45309",
    teal: "#15803d",
    sky: "#374151",
    gold: "#d97706",
    cream: "#fafaf9",
    lt: "#f5f5f4",
    bd: "#d1d5db",
    mu: "#6b7280",
    hf: `"Playfair Display","Georgia","Times New Roman",serif`,
    bf: `"Georgia","Times New Roman",serif`,
    cBg: "linear-gradient(160deg,#fafaf9,#f5f5f4 50%,#fff)",
    fBg: "#111827",
    hTxt: "#fff",
    pgBorder: "3px double #111827",
    accent1: "#b45309",
    accent2: "#d97706",
    tb: [
      "linear-gradient(90deg,#111827,#374151)",
      "linear-gradient(90deg,#14532d,#15803d)",
      "linear-gradient(90deg,#7f1d1d,#b91c1c)",
      "linear-gradient(90deg,#78350f,#b45309)",
    ],
    sv: "underlined",
    tableHeader: (p, bd) => ({
      background: p,
      color: "#fff",
      fontWeight: 700,
      fontSize: "7.5pt",
      padding: "1.5mm 2mm",
      border: `1px solid ${p}`,
      textAlign: "center",
    }),
    tableCell: (bd, even) => ({
      padding: "1.4mm 2mm",
      border: `1px solid ${bd}`,
      background: even ? "#fafaf9" : "#fff",
      verticalAlign: "middle",
    }),
  },
};

const resolveTheme = (themeId) =>
  THEMES[themeId] ||
  Object.values(GRADE_THEMES).find((t) => t.id === themeId) ||
  THEMES.classic;

const SecTitle = ({ t, col, children }) => {
  const c = col || t.p;
  const base = { fontFamily: t.hf, margin: "3mm 0 2mm", display: "block" };
  if (t.sv === "filled")
    return (
      <div
        style={{
          ...base,
          background: c,
          color: "#fff",
          padding: "2px 10px",
          borderRadius: 4,
          fontSize: "8.5pt",
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: "1.5px",
        }}
      >
        {children}
      </div>
    );
  if (t.sv === "outlined")
    return (
      <div
        style={{
          ...base,
          color: c,
          borderLeft: `4px solid ${c}`,
          paddingLeft: 8,
          fontSize: "9pt",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "1px",
        }}
      >
        {children}
      </div>
    );
  if (t.sv === "underlined")
    return (
      <div
        style={{
          ...base,
          color: c,
          borderBottom: `2px solid ${c}`,
          paddingBottom: "1mm",
          fontSize: "9.5pt",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "1.5px",
        }}
      >
        {children}
      </div>
    );
  if (t.sv === "pill")
    return (
      <div
        style={{
          ...base,
          background: c,
          color: "#fff",
          padding: "3px 14px",
          borderRadius: 20,
          fontSize: "8.5pt",
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: "1px",
          display: "inline-block",
        }}
      >
        {children}
      </div>
    );
};

const RTable = ({ t, cols, rows }) => (
  <table
    style={{
      width: "100%",
      borderCollapse: "collapse",
      fontSize: "8.5pt",
      fontFamily: t.bf,
    }}
  >
    <thead>
      <tr>
        {cols.map((c, i) => (
          <th
            key={i}
            style={{
              ...t.tableHeader(t.p, t.bd, t.cream),
              textAlign: i === 0 ? "left" : "center",
              width: i === 0 ? "auto" : c.w || "12%",
            }}
          >
            {c.label}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {rows.map((row, i) => (
        <tr key={i}>
          {row.map((cell, j) => (
            <td
              key={j}
              style={{
                ...t.tableCell(t.bd, i % 2 === 1),
                textAlign: j === 0 ? "left" : "center",
                fontWeight: cell?.bold ? 700 : 400,
                background: cell?.total
                  ? t.cream
                  : i % 2 === 1
                    ? "#f8f9fa"
                    : "#fff",
                color: cell?.bold ? t.p : "inherit",
              }}
            >
              {typeof cell === "object" ? (cell?.v ?? "") : cell}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
);

const PageShell = ({ t, children, noBorder }) => (
  <div
    className="report-page"
    style={{
      width: "210mm",
      minHeight: "297mm",
      background: "#fff",
      margin: "6px auto",
      borderTop: noBorder ? "none" : t.pgBorder,
      boxShadow: "0 3px 24px rgba(0,0,0,0.13)",
      padding: noBorder ? 0 : "10mm 14mm",
      position: "relative",
      overflow: "hidden",
      fontFamily: t.bf,
      fontSize: "10.5pt",
      color: "#212529",
      display: "flex",
      flexDirection: "column",
    }}
  >
    {t.id === "playful" && !noBorder && (
      <div
        style={{
          height: 7,
          background:
            "linear-gradient(90deg,#f43f5e,#fbbf24,#22c55e,#0ea5e9,#7c3aed,#f43f5e)",
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
        }}
      />
    )}
    {t.id === "playful" && !noBorder && <div style={{ height: 7 }} />}
    {children}
  </div>
);

const PageHeader = ({ t, title, sub, businessName }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: "5mm",
      paddingBottom: "3mm",
      borderBottom:
        t.sv === "underlined" ? "2px solid #111827" : `3px solid ${t.p}`,
      flexShrink: 0,
    }}
  >
    <div>
      <div
        style={{
          fontFamily: t.hf,
          fontSize: "14pt",
          fontWeight: 900,
          color: t.p,
          textTransform: "uppercase",
          letterSpacing: 1,
        }}
      >
        {title}
      </div>
      <div style={{ fontSize: "8pt", color: t.mu, marginTop: 1 }}>{sub}</div>
    </div>
    <div
      style={{
        fontFamily: t.hf,
        fontWeight: 900,
        fontSize: "12pt",
        color: t.p,
      }}
    >
      {businessName || "Solidflo Daycare"}
    </div>
  </div>
);

const TermBanner = ({ t, termNum, period }) => (
  <div
    style={{
      width: "calc(100% + 28mm)",
      marginLeft: "-14mm",
      marginTop: "-10mm",
      marginBottom: "3mm",
      padding: "5mm 14mm",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      background: t.tb[termNum - 1],
      flexShrink: 0,
    }}
  >
    <div>
      <div
        style={{
          fontFamily: t.hf,
          fontWeight: 900,
          fontSize: "15pt",
          color: "#fff",
        }}
      >
        Term {termNum}
      </div>
      <div
        style={{
          fontSize: "8pt",
          color: "rgba(255,255,255,0.85)",
          marginTop: 1,
        }}
      >
        {period} · Foundation Phase
      </div>
    </div>
    <div
      style={{
        background: "rgba(255,255,255,0.22)",
        color: "#fff",
        fontFamily: t.hf,
        fontWeight: 900,
        fontSize: "22pt",
        width: "17mm",
        height: "17mm",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {termNum}
    </div>
  </div>
);

const CommentsBox = ({ t, value }) => (
  <div
    style={{
      border: `1.5px solid ${t.bd}`,
      borderRadius: t.sv === "pill" ? 10 : 6,
      padding: "2mm 4mm",
      minHeight: "12mm",
      marginTop: "2mm",
      fontSize: "9pt",
      color: value ? "#212529" : "#aaa",
      flexShrink: 0,
      background: "#fff",
      whiteSpace: "pre-wrap",
    }}
  >
    {value || "Write comments here…"}
  </div>
);

const SigRow = ({ t, data }) => (
  <div style={{ display: "flex", gap: "5mm", marginTop: "3mm", flexShrink: 0 }}>
    {[
      ["Class Teacher", data.teacher],
      ["Principal", data.principal],
      ["Date", data.reportDate],
      ["Parent Signature", ""],
    ].map(([r, v]) => (
      <div
        key={r}
        style={{
          flex: 1,
          borderTop: `1.5px solid ${t.bd}`,
          paddingTop: "1.5mm",
          fontSize: "7.5pt",
          color: t.mu,
          fontFamily: t.hf,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        {r}:{" "}
        {v ? (
          <span style={{ color: "#212529", textTransform: "none" }}>{v}</span>
        ) : (
          "___________"
        )}
      </div>
    ))}
  </div>
);

// ── GRADE-SPECIFIC CURRICULUM DATA (CAPS-aligned, Grades R–7) ─────────────────
const GRADE_TERM_DATA = {
  R: [
    {
      num: 1,
      period: "January – March",
      subjects: [
        {
          name: "Language & Emergent Literacy",
          col: "p",
          wide: true,
          items: [
            "Listens attentively during story time and circle activities",
            "Follows simple one-step oral instructions",
            "Speaks in short sentences to express needs and ideas",
            "Identifies and names familiar objects in the environment",
            "Shows awareness of print (books have covers, text goes left-to-right)",
            "Recognises own name in print",
            "Holds a crayon/pencil with developing grip",
            "Attempts to draw pictures and make marks on paper",
          ],
        },
        {
          name: "Mathematics & Numeracy",
          col: "teal",
          items: [
            "Counts objects 1–5 with one-to-one correspondence",
            "Recognises numerals 1–5",
            "Sorts objects by colour, shape and size",
            "Identifies circle, square and triangle",
            "Builds and extends simple AB patterns",
            "Understands concepts: big/small, full/empty",
          ],
        },
        {
          name: "Life Skills & Well-being",
          col: "sky",
          items: [
            "Manages personal hygiene independently (washing hands, toileting)",
            "Participates in morning routine and transitions",
            "Shows awareness of own emotions and names them",
            "Engages in creative play and imaginative scenarios",
            "Participates in gross motor activities (running, jumping, climbing)",
          ],
        },
      ],
      side: {
        title: "Social & Emotional Development",
        col: "a",
        items: [
          "Separates from caregiver with growing confidence",
          "Takes turns and shares materials",
          "Uses words to solve minor conflicts",
          "Follows class rules with reminders",
          "Shows empathy toward peers",
        ],
      },
    },
    {
      num: 2,
      period: "April – June",
      subjects: [
        {
          name: "Language & Emergent Literacy",
          col: "p",
          wide: true,
          items: [
            "Listens to and retells a simple story with key details",
            "Speaks in 3–5 word sentences; expanding vocabulary",
            "Identifies rhyming words in songs and nursery rhymes",
            "Recognises initial sounds in familiar words (phonological awareness)",
            "Tracks print from left to right and top to bottom",
            "Writes own name using upper and lower case letters",
            "Draws recognisable pictures to represent ideas",
            "Copies simple words and letters from a model",
          ],
        },
        {
          name: "Mathematics & Numeracy",
          col: "teal",
          items: [
            "Counts objects 1–10 reliably",
            "Writes numerals 1–10 with correct formation",
            "Identifies which group has more or fewer",
            "Matches shapes to real-world objects",
            "Continues and creates ABAB/AABB patterns",
            "Orders three objects by size (seriation)",
          ],
        },
        {
          name: "Life Skills & Well-being",
          col: "sky",
          items: [
            "Identifies family members and community helpers",
            "Participates in creative arts (painting, collage, music, dance)",
            "Demonstrates fine motor control (cutting, threading, playdough)",
            "Engages in cooperative outdoor play and team games",
            "Recognises basic safety rules at home and school",
          ],
        },
      ],
      side: {
        title: "Fine Motor Development",
        col: "a",
        items: [
          "Holds scissors correctly; cuts along a straight line",
          "Threads large beads in sequence",
          "Completes 6–8 piece puzzles independently",
          "Colours within broad outlines",
          "Forms basic letter shapes with guidance",
        ],
      },
    },
    {
      num: 3,
      period: "July – September",
      subjects: [
        {
          name: "Language & Emergent Literacy",
          col: "p",
          wide: true,
          items: [
            "Listens to longer stories and answers simple questions",
            "Speaks clearly in full sentences; uses descriptive words",
            "Identifies and produces rhyming words",
            "Blends onset and rime (c-at, d-og)",
            "Recognises most letters of the alphabet (upper case)",
            "Attempts to write simple CVC words with support",
            "Illustrates own ideas in drawings with detail",
            "Engages in shared reading of big books",
          ],
        },
        {
          name: "Mathematics & Numeracy",
          col: "teal",
          items: [
            "Counts and represents numbers 1–15",
            "Adds groups of objects to 10 (concrete)",
            "Names and classifies 2D and 3D shapes",
            "Describes position: inside/outside, above/below",
            "Measures using non-standard units (hand spans, blocks)",
            "Reads simple pictographs",
          ],
        },
        {
          name: "Life Skills & Well-being",
          col: "sky",
          items: [
            "Explores the natural world (plants, animals, weather)",
            "Creates artwork using mixed media",
            "Participates in music, movement and drama",
            "Demonstrates improved balance and coordination",
            "Shows responsible behaviour with resources",
          ],
        },
      ],
      side: {
        title: "Cognitive Development",
        col: "gold",
        items: [
          "Matches, sorts and classifies by two attributes",
          "Recalls and sequences events in a story",
          "Solves simple problems using trial and error",
          "Shows curiosity and asks 'why' and 'how' questions",
          "Demonstrates memory through rhymes and songs",
        ],
      },
    },
    {
      num: 4,
      period: "October – December",
      subjects: [
        {
          name: "Language & Emergent Literacy",
          col: "p",
          wide: true,
          items: [
            "Listens critically and responds appropriately to discussions",
            "Speaks with growing confidence in group settings",
            "Identifies all letters of the alphabet (upper & lower case)",
            "Reads own name and familiar environmental print",
            "Writes short captions independently",
            "Shows strong phonological awareness (segmenting, blending)",
            "Demonstrates growth in vocabulary and language use",
          ],
        },
        {
          name: "Mathematics & Numeracy",
          col: "teal",
          items: [
            "Counts and represents numbers 1–20",
            "Adds and subtracts using concrete objects to 10",
            "Explores halves informally (sharing equally)",
            "Identifies and sequences days of the week",
            "Explores length, mass and capacity practically",
          ],
        },
        {
          name: "Life Skills & Well-being",
          col: "sky",
          items: [
            "Shows understanding of cultural diversity and heritage",
            "Performs in a year-end creative arts presentation",
            "Participates actively in physical activities",
          ],
        },
      ],
      side: null,
    },
  ],

  0: [
    {
      num: 1,
      period: "January – March",
      subjects: [
        {
          name: "Early Language & Communication",
          col: "p",
          wide: true,
          items: [
            "Responds to and follows simple verbal instructions",
            "Uses 2–4 word sentences to communicate needs",
            "Engages in listening activities (songs, stories, rhymes)",
            "Shows interest in books and printed materials",
            "Distinguishes between letters and pictures",
            "Attempts to write own name with support",
          ],
        },
        {
          name: "Early Numeracy",
          col: "teal",
          items: [
            "Counts 1–5 using fingers and objects",
            "Matches quantity to numeral 1–5",
            "Sorts and groups by one attribute (colour or shape)",
            "Names circle, square, triangle",
            "Identifies simple AB patterns",
          ],
        },
        {
          name: "Personal & Social Development",
          col: "sky",
          items: [
            "Manages basic self-care (dressing, toileting)",
            "Interacts positively with peers in play",
            "Follows simple class routines and rules",
            "Expresses feelings using words",
          ],
        },
      ],
      side: {
        title: "Play & Exploration",
        col: "a",
        items: [
          "Engages in sensory and exploratory play",
          "Uses blocks and construction toys purposefully",
          "Participates in role play and dramatic play",
          "Shows curiosity about the environment",
          "Explores art materials freely",
        ],
      },
    },
    {
      num: 2,
      period: "April – June",
      subjects: [
        {
          name: "Early Language & Communication",
          col: "p",
          wide: true,
          items: [
            "Listens to and retells a 3-event story",
            "Uses 4–6 word sentences; vocabulary is expanding",
            "Identifies initial sounds in words",
            "Recognises and names letters in own name",
            "Attempts letter formation with guidance",
            "Engages in mark-making and early writing",
          ],
        },
        {
          name: "Early Numeracy",
          col: "teal",
          items: [
            "Counts and matches objects 1–8",
            "Compares groups: more/less/same",
            "Identifies and names 4 basic shapes",
            "Copies and extends simple patterns",
            "Uses position words: next to, behind, in front",
          ],
        },
        {
          name: "Personal & Social Development",
          col: "sky",
          items: [
            "Shows increasing independence in daily tasks",
            "Works cooperatively in small group activities",
            "Begins to resolve conflicts with words",
            "Names and manages basic emotions",
          ],
        },
      ],
      side: {
        title: "Creative Arts & Motor Skills",
        col: "gold",
        items: [
          "Holds crayon with functional grip",
          "Cuts along a straight line",
          "Creates paintings and collages with intention",
          "Moves rhythmically to music",
          "Participates in action songs and movement games",
        ],
      },
    },
    {
      num: 3,
      period: "July – September",
      subjects: [
        {
          name: "Early Language & Communication",
          col: "p",
          wide: true,
          items: [
            "Recalls and sequences a story using pictures",
            "Speaks in full sentences; uses adjectives and verbs",
            "Blends simple onset and rime patterns",
            "Recognises most upper-case letters",
            "Writes letters of own name legibly",
            "Shows interest in shared reading activities",
          ],
        },
        {
          name: "Early Numeracy",
          col: "teal",
          items: [
            "Counts objects 1–12 reliably",
            "Writes numerals 1–10",
            "Adds groups of objects to 8 informally",
            "Identifies and sorts 2D and 3D shapes",
            "Compares length and mass informally",
          ],
        },
        {
          name: "Personal & Social Development",
          col: "sky",
          items: [
            "Shows awareness of community and environment",
            "Participates in group projects and discussions",
            "Demonstrates responsible behaviour",
            "Shows empathy and care for others",
          ],
        },
      ],
      side: {
        title: "Physical Development",
        col: "a",
        items: [
          "Runs, hops, skips with coordination",
          "Catches a large ball with two hands",
          "Completes puzzles (8–12 pieces)",
          "Uses scissors to cut simple shapes",
          "Draws figures with recognisable features",
        ],
      },
    },
    {
      num: 4,
      period: "October – December",
      subjects: [
        {
          name: "Early Language & Communication",
          col: "p",
          wide: true,
          items: [
            "Participates confidently in group discussions",
            "Uses descriptive language in storytelling",
            "Recognises all letters upper and lower case",
            "Reads familiar words and environmental print",
            "Writes simple words with support",
          ],
        },
        {
          name: "Early Numeracy",
          col: "teal",
          items: [
            "Counts to 15 and represents the quantity",
            "Adds and subtracts to 8 using objects",
            "Names days of the week in sequence",
            "Explores measurement concepts practically",
          ],
        },
        {
          name: "Personal & Social Development",
          col: "sky",
          items: [
            "Shows growth in social and emotional maturity",
            "Participates in end-of-year performance",
            "Demonstrates school-readiness behaviours",
          ],
        },
      ],
      side: null,
    },
  ],

  1: [
    {
      num: 1,
      period: "January – March",
      subjects: [
        {
          name: "Home Language",
          col: "p",
          wide: true,
          items: [
            "Listens attentively and follows oral instructions",
            "Speaks clearly and communicates ideas in sentences",
            "Recognises letters of the alphabet (upper & lower case)",
            "Identifies initial sounds and blends (phonics)",
            "Reads simple CVC words and sight words",
            "Shows comprehension of short texts/stories",
            "Writes letters and simple words legibly",
            "Copies from the board with accuracy",
          ],
        },
        {
          name: "Mathematics",
          col: "teal",
          items: [
            "Counts to 20 and beyond (number concept)",
            "Recognises and writes numbers 1–20",
            "Solves addition and subtraction to 10",
            "Understands more/less, before/after, between",
            "Identifies 2D shapes (circle, square, triangle, rectangle)",
            "Understands patterns and completes sequences",
            "Uses measurement concepts (long/short, heavy/light)",
          ],
        },
        {
          name: "Life Skills",
          col: "sky",
          items: [
            "Beginning Knowledge — self & environment",
            "Creative Arts — participates in art/music",
            "Physical Education — gross motor skills",
            "Personal & Social Well-being",
          ],
        },
      ],
      side: {
        title: "Social Development",
        col: "a",
        items: [
          "Settles into class routine confidently",
          "Works cooperatively with peers",
          "Follows school rules and instructions",
          "Shows self-control and respect",
          "Demonstrates independence in self-care",
        ],
      },
    },
    {
      num: 2,
      period: "April – June",
      subjects: [
        {
          name: "Home Language",
          col: "p",
          wide: true,
          items: [
            "Listens and follows two-step oral instructions",
            "Retells a story in sequence using key vocabulary",
            "Blends and segments sounds (CVC & CCVC words)",
            "Reads decodable texts with growing fluency",
            "Demonstrates reading comprehension (answers questions)",
            "Writes simple sentences independently",
            "Uses capital letters and full stops correctly",
            "Spells common sight words correctly",
          ],
        },
        {
          name: "Mathematics",
          col: "teal",
          items: [
            "Number concept and counting to 50",
            "Addition and subtraction within 20",
            "Skip counting (2s, 5s, 10s)",
            "Place value: tens and units",
            "3D objects: sphere, cube, cylinder, cone",
            "Symmetry and position (left/right/inside/outside)",
            "Data handling: simple picture graphs",
          ],
        },
        {
          name: "Life Skills",
          col: "sky",
          items: [
            "My community and cultural awareness",
            "Creative Arts — drawing/craft/movement",
            "Physical Education — co-ordination & games",
            "Health and hygiene habits",
          ],
        },
      ],
      side: {
        title: "Fine Motor & Handwriting",
        col: "a",
        items: [
          "Holds pencil/crayon with correct grip",
          "Forms letters correctly (letter formation)",
          "Uses scissors safely and accurately",
          "Colours within lines; drawing control",
          "Manipulates small objects (puzzles/beads)",
        ],
      },
    },
    {
      num: 3,
      period: "July – September",
      subjects: [
        {
          name: "Home Language",
          col: "p",
          wide: true,
          items: [
            "Listens critically and responds to discussions",
            "Speaks in complete sentences; uses descriptive language",
            "Reads levelled readers with expression and fluency",
            "Reads and understands instructions and labels",
            "Shows comprehension: main idea, characters, sequence",
            "Writes a short paragraph (3–5 sentences)",
            "Uses punctuation: capital letters, full stops, question marks",
            "Spells words correctly from word lists",
          ],
        },
        {
          name: "Mathematics",
          col: "teal",
          items: [
            "Number concept to 75",
            "Addition and subtraction within 30",
            "Repeated addition as introduction to multiplication",
            "Fractions: halves and quarters of shapes/groups",
            "Length, mass and capacity (non-standard units)",
            "Time: days, months, o'clock and half past",
            "Money: identifies coins and notes",
          ],
        },
        {
          name: "Life Skills",
          col: "sky",
          items: [
            "Natural environment and weather/seasons",
            "Creative Arts — music, drama, visual arts",
            "Physical Education — ball skills & team games",
            "Social well-being and responsible choices",
          ],
        },
      ],
      side: {
        title: "Cognitive Development",
        col: "gold",
        items: [
          "Follows multi-step instructions",
          "Solves problems creatively",
          "Shows curiosity and asks questions",
          "Classifies and sorts by attributes",
          "Remembers and applies routines",
        ],
      },
    },
    {
      num: 4,
      period: "October – December",
      subjects: [
        {
          name: "Home Language",
          col: "p",
          wide: true,
          items: [
            "Reads independently with fluency and expression",
            "Demonstrates strong reading comprehension skills",
            "Writes a short creative or factual text",
            "Uses correct grammar, punctuation and spelling",
            "Shows growth in vocabulary and word recognition",
          ],
        },
        {
          name: "Mathematics",
          col: "teal",
          items: [
            "Number concept to 100",
            "Addition and subtraction within 50",
            "Grouping and sharing (division concept)",
            "Shapes, patterns and symmetry",
            "Time, money and measurement",
            "Data: collect, sort and represent data",
          ],
        },
        {
          name: "Life Skills",
          col: "sky",
          items: [
            "Heritage, culture and society",
            "Creative Arts — end-of-year performance/project",
            "Physical Education — fitness and sport participation",
          ],
        },
      ],
      side: null,
    },
  ],

  2: [
    {
      num: 1,
      period: "January – March",
      subjects: [
        {
          name: "Home Language",
          col: "p",
          wide: true,
          items: [
            "Listens to and recalls main ideas from oral texts",
            "Speaks in full sentences using expanded vocabulary",
            "Reads levelled texts aloud with fluency and expression",
            "Identifies sight words, blends and digraphs",
            "Shows comprehension: who, what, where, when",
            "Writes 2–3 sentences on a given topic",
            "Uses capital letters, full stops and question marks",
            "Spells common and phonically regular words",
          ],
        },
        {
          name: "Mathematics",
          col: "teal",
          items: [
            "Number concept to 99 (place value: tens and units)",
            "Addition and subtraction within 50",
            "Repeated addition (arrays) to 20",
            "Sharing and grouping to 20",
            "2D shapes and 3D objects with properties",
            "Symmetry: lines of symmetry",
            "Length, mass and capacity — standard units introduced",
          ],
        },
        {
          name: "Life Skills",
          col: "sky",
          items: [
            "The local community and its services",
            "Creative Arts — visual arts and craft",
            "Physical Education — movement patterns and games",
            "Personal well-being: healthy habits and hygiene",
          ],
        },
      ],
      side: {
        title: "Language Development",
        col: "a",
        items: [
          "Understands and follows 3-step instructions",
          "Uses adjectives and adverbs in sentences",
          "Reads and interprets simple captions and labels",
          "Begins to use a dictionary for word meanings",
          "Writes a simple recount of personal experience",
        ],
      },
    },
    {
      num: 2,
      period: "April – June",
      subjects: [
        {
          name: "Home Language",
          col: "p",
          wide: true,
          items: [
            "Listens to discussions and identifies the main point",
            "Presents a short oral recount or description",
            "Reads and answers comprehension questions on a passage",
            "Identifies nouns, verbs and adjectives in sentences",
            "Writes a paragraph with topic sentence and support",
            "Uses commas in a list and apostrophe for possession",
            "Proofreads own writing for errors",
          ],
        },
        {
          name: "Mathematics",
          col: "teal",
          items: [
            "Numbers to 150 — ordering and comparing",
            "Addition and subtraction within 99",
            "Multiplication tables: 2, 5, 10",
            "Fractions: halves, quarters, thirds",
            "Patterns: geometric and number patterns",
            "Time: minutes, analogue and digital clocks",
            "Money: counting change to R10",
          ],
        },
        {
          name: "Life Skills",
          col: "sky",
          items: [
            "The environment and sustainability",
            "Creative Arts — music, singing and drama",
            "Physical Education — athletics and team sports",
            "Safety in the community and at home",
          ],
        },
      ],
      side: {
        title: "Numeracy Skills",
        col: "gold",
        items: [
          "Solves word problems with two steps",
          "Reads and interprets bar graphs",
          "Uses mental strategies for addition and subtraction",
          "Applies multiplication facts in context",
          "Identifies and continues number patterns",
        ],
      },
    },
    {
      num: 3,
      period: "July – September",
      subjects: [
        {
          name: "Home Language",
          col: "p",
          wide: true,
          items: [
            "Listens to and summarises a short informational text",
            "Engages in structured class discussions and debates",
            "Reads and identifies the theme of a story",
            "Uses prefixes and suffixes to determine word meaning",
            "Writes a narrative with beginning, middle and end",
            "Uses direct and indirect speech",
            "Identifies and corrects grammatical errors in sentences",
          ],
        },
        {
          name: "Mathematics",
          col: "teal",
          items: [
            "Numbers to 200",
            "Addition and subtraction within 150",
            "Multiplication tables: 3, 4",
            "Division: sharing and grouping to 50",
            "Length and perimeter of simple shapes",
            "Temperature: hot, warm, cold (degrees introduced)",
            "Data: tally marks and frequency tables",
          ],
        },
        {
          name: "Life Skills",
          col: "sky",
          items: [
            "History of the local area",
            "Creative Arts — integrated performance project",
            "Physical Education — swimming/water safety if applicable",
            "Emotional well-being: dealing with feelings",
          ],
        },
      ],
      side: {
        title: "Reading Comprehension",
        col: "a",
        items: [
          "Identifies main idea and supporting details",
          "Makes predictions before and during reading",
          "Makes inferences from text clues",
          "Distinguishes fact from opinion",
          "Retells text in own words accurately",
        ],
      },
    },
    {
      num: 4,
      period: "October – December",
      subjects: [
        {
          name: "Home Language",
          col: "p",
          wide: true,
          items: [
            "Reads a variety of texts independently with understanding",
            "Delivers a short prepared oral presentation",
            "Writes a well-structured multi-paragraph text",
            "Demonstrates command of grammar and punctuation",
            "Shows significant growth in spelling accuracy",
          ],
        },
        {
          name: "Mathematics",
          col: "teal",
          items: [
            "Number concept to 200",
            "All four operations within appropriate ranges",
            "Geometry: angles, lines and 3D models",
            "Measurement: perimeter, area informally",
            "Data: collect, organise, represent and analyse",
          ],
        },
        {
          name: "Life Skills",
          col: "sky",
          items: [
            "Cultural diversity and South African heritage",
            "Creative Arts — year-end showcase/performance",
            "Physical Education — fitness testing and reflection",
          ],
        },
      ],
      side: null,
    },
  ],

  3: [
    {
      num: 1,
      period: "January – March",
      subjects: [
        {
          name: "Home Language",
          col: "p",
          wide: true,
          items: [
            "Listens to and evaluates oral presentations",
            "Speaks clearly using complex sentences",
            "Reads independently using a range of strategies",
            "Identifies figurative language (simile, alliteration)",
            "Comprehension: cause and effect, inference",
            "Writes a short narrative using paragraphs",
            "Applies punctuation: speech marks, exclamation marks",
            "Proofreads and edits own writing systematically",
          ],
        },
        {
          name: "Mathematics",
          col: "teal",
          items: [
            "Number concept to 500 (place value to hundreds)",
            "Addition and subtraction within 300",
            "Multiplication tables: 2, 3, 4, 5, 10",
            "Division as the inverse of multiplication",
            "Fractions: halves, thirds, quarters, sixths",
            "2D shapes: angles, parallel lines",
            "Perimeter of polygons; area by counting squares",
          ],
        },
        {
          name: "Life Skills",
          col: "sky",
          items: [
            "The school and community environment",
            "Creative Arts — drawing, painting, collage",
            "Physical Education — basic movement and skills",
            "Personal & Social Well-being: self-identity",
          ],
        },
      ],
      side: {
        title: "Writing Skills",
        col: "a",
        items: [
          "Plans writing using mind maps or lists",
          "Writes topic sentences with supporting details",
          "Uses transitional words (first, then, finally)",
          "Varies sentence structure for effect",
          "Checks spelling using a word list/dictionary",
        ],
      },
    },
    {
      num: 2,
      period: "April – June",
      subjects: [
        {
          name: "Home Language",
          col: "p",
          wide: true,
          items: [
            "Participates in drama and role-play activities",
            "Uses context clues to understand unfamiliar vocabulary",
            "Reads and responds to a variety of text types",
            "Identifies genre features (fable, poem, report)",
            "Writes a factual report using subheadings",
            "Uses compound and complex sentences",
            "Revises and edits a piece of writing through multiple drafts",
          ],
        },
        {
          name: "Mathematics",
          col: "teal",
          items: [
            "Numbers to 999",
            "Addition and subtraction within 500",
            "Multiplication tables: 6, 7, 8, 9",
            "Long division (no remainder)",
            "Equivalent fractions",
            "3D shapes: nets and properties",
            "Time: 24-hour clock; elapsed time",
          ],
        },
        {
          name: "Life Skills",
          col: "sky",
          items: [
            "Maps and the local environment (Beginning Knowledge)",
            "Creative Arts — music, singing and instruments",
            "Physical Education — games, team activities",
            "Relationships and responsible behaviour",
          ],
        },
      ],
      side: {
        title: "Mathematical Reasoning",
        col: "gold",
        items: [
          "Solves multi-step word problems",
          "Explains own reasoning in words",
          "Checks answers using inverse operations",
          "Identifies and applies number patterns",
          "Uses estimation before calculating",
        ],
      },
    },
    {
      num: 3,
      period: "July – September",
      subjects: [
        {
          name: "Home Language",
          col: "p",
          wide: true,
          items: [
            "Evaluates the purpose and audience of a text",
            "Reads poetry and identifies rhyme, rhythm and mood",
            "Discusses characters and themes in a class novel",
            "Writes a persuasive paragraph",
            "Uses active and passive voice",
            "Applies subject-verb agreement consistently",
            "Completes a research task using two sources",
          ],
        },
        {
          name: "Mathematics",
          col: "teal",
          items: [
            "Number concept to 1 000",
            "All four operations within 999",
            "Ratio and proportion (informal)",
            "Decimals: tenths and hundredths (introduced)",
            "Mass, capacity and length — standard units",
            "Geometric patterns and tessellation",
            "Data: mean (average) introduced informally",
          ],
        },
        {
          name: "Life Skills",
          col: "sky",
          items: [
            "South African history: key events and figures",
            "Creative Arts — drama and visual arts project",
            "Physical Education — sport skills and fitness",
            "Making responsible choices",
          ],
        },
      ],
      side: {
        title: "Study Skills",
        col: "a",
        items: [
          "Uses a contents page and index in a book",
          "Takes simple notes from a text",
          "Organises information using a table or chart",
          "Plans study time effectively",
          "Participates actively in group discussions",
        ],
      },
    },
    {
      num: 4,
      period: "October – December",
      subjects: [
        {
          name: "Home Language",
          col: "p",
          wide: true,
          items: [
            "Reads a full class novel with comprehension",
            "Writes a well-structured multi-genre text",
            "Demonstrates mastery of grammar, punctuation and spelling",
            "Delivers a polished oral presentation",
            "Shows significant improvement across all language skills",
          ],
        },
        {
          name: "Mathematics",
          col: "teal",
          items: [
            "Consolidation of all four operations to 1 000",
            "Fractions, decimals and percentages (basic)",
            "Geometry: angles, transformations",
            "Measurement: area, perimeter and volume",
            "Data: full cycle — collect, represent, interpret",
          ],
        },
        {
          name: "Life Skills",
          col: "sky",
          items: [
            "Heritage, culture and citizenship",
            "End-of-year creative arts performance",
            "Physical fitness assessment",
          ],
        },
      ],
      side: null,
    },
  ],

  4: [
    {
      num: 1,
      period: "January – March",
      subjects: [
        {
          name: "Home Language",
          col: "p",
          items: [
            "Listens to and summarises informational texts",
            "Participates in formal and informal discussions",
            "Reads a variety of literary and factual texts",
            "Identifies theme, character and plot development",
            "Writes a narrative essay with plot and dialogue",
            "Applies grammar: nouns, verbs, adjectives, adverbs",
            "Punctuation: speech marks, apostrophes, semicolons",
          ],
        },
        {
          name: "First Additional Language",
          col: "sky",
          items: [
            "Listens and responds to basic instructions",
            "Reads and comprehends simple passages",
            "Writes sentences and short paragraphs",
            "Applies basic vocabulary and grammar rules",
            "Uses common tenses (present, past, future)",
          ],
        },
        {
          name: "Mathematics",
          col: "teal",
          items: [
            "Whole numbers to 100 000 (place value, ordering)",
            "Addition and subtraction within 100 000",
            "Multiplication of 4-digit × 2-digit numbers",
            "Division with remainders",
            "Common fractions and equivalent fractions",
            "Decimal fractions: tenths and hundredths",
            "Properties of 2D shapes and 3D objects",
          ],
        },
        {
          name: "Natural Sciences & Technology",
          col: "gold",
          items: [
            "Structure and function of plant and animal cells",
            "Food webs and ecosystems",
            "Properties of materials: hardness, flexibility, transparency",
            "Simple machines: levers and pulleys",
          ],
        },
      ],
      side: {
        title: "Social Sciences",
        col: "a",
        items: [
          "History: ancient civilisations (Egypt, Greece)",
          "Geography: map skills, compass directions",
          "Climate zones of Africa",
          "Resources and their use",
          "Life Skills: setting goals and self-management",
        ],
      },
    },
    {
      num: 2,
      period: "April – June",
      subjects: [
        {
          name: "Home Language",
          col: "p",
          items: [
            "Oral: debate and argumentative speaking",
            "Reading comprehension: inference and evaluation",
            "Identifies literary devices: metaphor, simile, personification",
            "Writes a descriptive essay and a formal letter",
            "Grammar: tenses (simple, continuous, perfect)",
            "Spelling: prefixes, suffixes, root words",
          ],
        },
        {
          name: "First Additional Language",
          col: "sky",
          items: [
            "Comprehension of longer passages",
            "Letter and email writing",
            "Vocabulary extension: synonyms and antonyms",
            "Question formation and responses",
          ],
        },
        {
          name: "Mathematics",
          col: "teal",
          items: [
            "Whole numbers to 100 000 — all operations",
            "Multiples and factors; prime numbers",
            "Percentages and ratio",
            "Geometry: angles (acute, obtuse, right, reflex)",
            "Perimeter and area of polygons",
            "Transformations: rotation, reflection, translation",
            "Graphs: bar, histogram, pie",
          ],
        },
        {
          name: "Natural Sciences & Technology",
          col: "gold",
          items: [
            "The solar system and space exploration",
            "Electrical circuits: conductors and insulators",
            "Water cycle and weather systems",
            "Designing and making a simple product",
          ],
        },
      ],
      side: {
        title: "Social Sciences",
        col: "a",
        items: [
          "History: colonisation and slave trade",
          "Geography: rivers, valleys, mountains in SA",
          "Natural and economic resources",
          "Human rights and democracy",
          "Life Skills: peer pressure and decision-making",
        ],
      },
    },
    {
      num: 3,
      period: "July – September",
      subjects: [
        {
          name: "Home Language",
          col: "p",
          items: [
            "Oral: prepared speech on a current topic",
            "Reading: novel study — character analysis",
            "Writes a transactional text (report, review)",
            "Grammar: phrases, clauses, sentence types",
            "Editing and proofreading strategies",
          ],
        },
        {
          name: "First Additional Language",
          col: "sky",
          items: [
            "Reading and analysing a short story",
            "Writing a personal recount",
            "Grammar: pronouns, prepositions",
            "Oral: short presentation on a topic",
          ],
        },
        {
          name: "Mathematics",
          col: "teal",
          items: [
            "Common fractions: operations (addition, subtraction)",
            "Decimal fractions: multiplication and division",
            "Volume and surface area of prisms",
            "Data handling: mean, median, mode, range",
            "Probability: likelihood scale",
          ],
        },
        {
          name: "Natural Sciences & Technology",
          col: "gold",
          items: [
            "The human body: skeletal and muscular systems",
            "Healthy living: diet, exercise, disease prevention",
            "Mixtures and solutions; separation techniques",
            "Technology: evaluation of designed products",
          ],
        },
      ],
      side: {
        title: "Social Sciences",
        col: "a",
        items: [
          "History: Great Trek and Battle of Blood River",
          "Geography: settlement patterns in SA",
          "Economic activities: farming, mining, manufacturing",
          "Life Skills: study skills and time management",
        ],
      },
    },
    {
      num: 4,
      period: "October – December",
      subjects: [
        {
          name: "Home Language",
          col: "p",
          items: [
            "Reading and responding to poetry",
            "Writes a creative narrative and personal essay",
            "Demonstrates mastery of grammar and vocabulary",
            "Oral: group discussion and evaluation",
          ],
        },
        {
          name: "First Additional Language",
          col: "sky",
          items: [
            "Reading comprehension: main idea and inference",
            "Writing a formal letter or essay",
            "Grammar revision: tenses, punctuation",
            "Vocabulary: idioms and phrases",
          ],
        },
        {
          name: "Mathematics",
          col: "teal",
          items: [
            "Consolidation: all operations with whole numbers",
            "Fractions, decimals and percentages",
            "Geometry: angle properties of polygons",
            "Measurement: volume, area, perimeter",
            "Data: full investigation cycle",
          ],
        },
        {
          name: "Natural Sciences & Technology",
          col: "gold",
          items: [
            "Energy: forms and transfers",
            "Ecosystems: food webs and energy flow",
            "Technology: design cycle review",
          ],
        },
      ],
      side: null,
    },
  ],

  5: [
    {
      num: 1,
      period: "January – March",
      subjects: [
        {
          name: "Home Language",
          col: "p",
          items: [
            "Oral: structured debate using evidence",
            "Reading: literary analysis of short stories",
            "Comprehension: identifying implicit and explicit meaning",
            "Writes a narrative essay with complex characterisation",
            "Grammar: active/passive voice; direct/indirect speech",
            "Spelling strategies: etymology and word families",
          ],
        },
        {
          name: "First Additional Language",
          col: "sky",
          items: [
            "Reading comprehension passages with inference questions",
            "Formal and informal letter writing",
            "Grammar: tenses, modals, conditionals",
            "Oral: prepared talk on an interest",
          ],
        },
        {
          name: "Mathematics",
          col: "teal",
          items: [
            "Whole numbers to 1 000 000",
            "All four operations with large numbers",
            "Exponents: squares and cubes",
            "Common fractions: all operations",
            "Percentages, ratio and rate",
            "Geometry: properties of triangles and quadrilaterals",
            "Transformation geometry",
          ],
        },
        {
          name: "Natural Sciences & Technology",
          col: "gold",
          items: [
            "Life processes: photosynthesis and respiration",
            "Biomes of South Africa",
            "Matter: states of matter and changes",
            "Technology: designing a structure under load",
          ],
        },
      ],
      side: {
        title: "Social Sciences",
        col: "a",
        items: [
          "History: pre-colonial kingdoms of southern Africa",
          "Geography: climate and biomes of SA",
          "Population distribution and migration",
          "EMS: needs and wants; economic systems",
          "Life Skills: personal values and life goals",
        ],
      },
    },
    {
      num: 2,
      period: "April – June",
      subjects: [
        {
          name: "Home Language",
          col: "p",
          items: [
            "Oral: dramatic monologue",
            "Reading: poetry — sound devices and imagery",
            "Writes a discursive essay (for and against)",
            "Grammar: complex sentences; subordinate clauses",
            "Paragraph development: unity and coherence",
          ],
        },
        {
          name: "First Additional Language",
          col: "sky",
          items: [
            "Newspaper report reading and analysis",
            "Writing a newspaper article",
            "Vocabulary in context: homophones, homonyms",
            "Grammar: relative clauses; reported speech",
          ],
        },
        {
          name: "Mathematics",
          col: "teal",
          items: [
            "Integers: introduction (positive and negative)",
            "Decimal fractions: all operations",
            "Area and perimeter of complex shapes",
            "Volume of rectangular prisms",
            "Graphs: interpreting double bar and line graphs",
            "Probability experiments",
          ],
        },
        {
          name: "Natural Sciences & Technology",
          col: "gold",
          items: [
            "Energy: electricity, heat and sound",
            "Electrical circuits: series and parallel",
            "Reactions: physical and chemical changes",
            "Technology: electrical application design",
          ],
        },
      ],
      side: {
        title: "Social Sciences",
        col: "a",
        items: [
          "History: colonisation and resistance in SA",
          "Geography: climate change and global warming",
          "Economic sectors: primary, secondary, tertiary",
          "EMS: trade and production",
          "Life Skills: stress management",
        ],
      },
    },
    {
      num: 3,
      period: "July – September",
      subjects: [
        {
          name: "Home Language",
          col: "p",
          items: [
            "Novel study: theme, setting and point of view",
            "Oral: group research presentation",
            "Writes an argumentative essay",
            "Grammar: modal verbs; complex tenses",
            "Research skills: source evaluation",
          ],
        },
        {
          name: "First Additional Language",
          col: "sky",
          items: [
            "Reading and analysing a short play",
            "Creative writing: dialogue and script",
            "Grammar: conditionals, passive voice",
            "Oral discussion with evidence",
          ],
        },
        {
          name: "Mathematics",
          col: "teal",
          items: [
            "Algebraic expressions: collecting like terms",
            "Equations: solving one-step equations",
            "Number patterns: rules and generalisations",
            "Geometry: angles in triangles and quadrilaterals",
            "Data: sampling and bias",
          ],
        },
        {
          name: "Natural Sciences & Technology",
          col: "gold",
          items: [
            "The solar system: gravity and forces",
            "Newton's Laws of Motion (introduction)",
            "Structures: load, stress, stability",
            "Technology: evaluating an existing system",
          ],
        },
      ],
      side: {
        title: "Social Sciences",
        col: "a",
        items: [
          "History: the mineral revolution in SA",
          "Geography: map projections and world regions",
          "Development and sustainability",
          "EMS: supply, demand and price",
          "Life Skills: conflict resolution",
        ],
      },
    },
    {
      num: 4,
      period: "October – December",
      subjects: [
        {
          name: "Home Language",
          col: "p",
          items: [
            "Reads and critically evaluates media texts",
            "Writes a polished multi-genre portfolio",
            "Demonstrates strong oral communication skills",
            "Command of grammar, punctuation and style",
          ],
        },
        {
          name: "First Additional Language",
          col: "sky",
          items: [
            "Reads and interprets varied text types",
            "Writes a structured essay",
            "Grammar and vocabulary consolidation",
            "Oral: debate or panel discussion",
          ],
        },
        {
          name: "Mathematics",
          col: "teal",
          items: [
            "Algebra: expressions and equations",
            "Geometry: angles and constructions",
            "Measurement: surface area and volume",
            "Data and probability: full investigation",
          ],
        },
        {
          name: "Natural Sciences & Technology",
          col: "gold",
          items: [
            "Revision: life sciences and physical sciences themes",
            "Technology: final design and build project",
          ],
        },
      ],
      side: null,
    },
  ],

  6: [
    {
      num: 1,
      period: "January – March",
      subjects: [
        {
          name: "Home Language",
          col: "p",
          items: [
            "Oral: formal speech with rhetorical devices",
            "Reading: critical analysis of a literary text",
            "Comprehension: synthesising information from multiple sources",
            "Essay: narrative with sophisticated plot structure",
            "Grammar: sentence variety; parallel structure",
            "Vocabulary: connotation and denotation",
          ],
        },
        {
          name: "First Additional Language",
          col: "sky",
          items: [
            "Reading comprehension: literary and non-literary texts",
            "Essay writing: descriptive and narrative",
            "Grammar: complex structures, reported speech",
            "Oral: individual and pair presentations",
          ],
        },
        {
          name: "Mathematics",
          col: "teal",
          items: [
            "Integers: all operations on the number line",
            "Rational numbers and irrational numbers",
            "Algebraic expressions: simplify and factorise",
            "Linear equations and word problems",
            "Geometry: angle relationships (co-interior, alternate)",
            "Surface area and volume of prisms and cylinders",
          ],
        },
        {
          name: "Natural Sciences",
          col: "gold",
          items: [
            "Cells: plant vs animal; microscopy",
            "Reproduction: asexual and sexual (plants and animals)",
            "Matter: atoms, elements, compounds, mixtures",
            "Chemical reactions: acids and bases",
          ],
        },
      ],
      side: {
        title: "Social Sciences & EMS",
        col: "a",
        items: [
          "History: SA under apartheid (1948–1990)",
          "Geography: development indicators (HDI, GNP)",
          "EMS: entrepreneurship and business plans",
          "Economic Systems: free market, command, mixed",
          "Life Orientation: career pathways",
        ],
      },
    },
    {
      num: 2,
      period: "April – June",
      subjects: [
        {
          name: "Home Language",
          col: "p",
          items: [
            "Oral: prepared debate with rebuttal",
            "Novel study: critical reading and analysis",
            "Writes a transactional text: formal report",
            "Grammar: modals, conditionals, clause analysis",
            "Comprehension: evaluating bias and perspective",
          ],
        },
        {
          name: "First Additional Language",
          col: "sky",
          items: [
            "Formal letter and email conventions",
            "Reading: newspaper and magazine articles",
            "Grammar: complex verb forms; discourse markers",
            "Creative writing: short story with theme",
          ],
        },
        {
          name: "Mathematics",
          col: "teal",
          items: [
            "Algebraic equations: linear and simultaneous (intro)",
            "Graphs: Cartesian plane; linear functions",
            "Geometry: triangles — congruency and similarity",
            "Theorem of Pythagoras",
            "Probability: theoretical and experimental",
          ],
        },
        {
          name: "Natural Sciences",
          col: "gold",
          items: [
            "Forces: Newton's Laws in action",
            "Energy: kinetic, potential, mechanical energy",
            "Electrostatics: charge and electric fields",
            "Technology: structures — bridges and domes",
          ],
        },
      ],
      side: {
        title: "Social Sciences & EMS",
        col: "a",
        items: [
          "History: transition to democracy (1990–1994)",
          "Geography: globalisation and its impacts",
          "EMS: accounting concepts and financial records",
          "Consumer rights and protection",
          "Life Orientation: leadership and civic duty",
        ],
      },
    },
    {
      num: 3,
      period: "July – September",
      subjects: [
        {
          name: "Home Language",
          col: "p",
          items: [
            "Poetry analysis: form, structure and effect",
            "Oral: group discussion with facilitation",
            "Writes a discursive essay and a review",
            "Grammar: complex and compound-complex sentences",
            "Research project: extended writing using multiple sources",
          ],
        },
        {
          name: "First Additional Language",
          col: "sky",
          items: [
            "Shakespearean or classic text adapted excerpts",
            "Analytical writing: character comparison",
            "Grammar: advanced tenses and voice",
            "Oral: dramatic reading or performance",
          ],
        },
        {
          name: "Mathematics",
          col: "teal",
          items: [
            "Patterns, sequences and series (arithmetic)",
            "Financial mathematics: interest, tax, budgets",
            "Geometry: coordinate geometry",
            "Trigonometry: ratios introduced (sin, cos, tan)",
            "Data: cumulative frequency; variance",
          ],
        },
        {
          name: "Natural Sciences",
          col: "gold",
          items: [
            "Ecosystems: population dynamics and biodiversity",
            "Human impact on the environment",
            "Waves: light, sound — properties and applications",
            "Technology: electronic systems",
          ],
        },
      ],
      side: {
        title: "Social Sciences & EMS",
        col: "a",
        items: [
          "History: post-apartheid SA — the new democracy",
          "Geography: urban growth and challenges",
          "EMS: financial statements: income and balance sheet",
          "Stock market and investment basics",
          "Life Orientation: health and lifestyle choices",
        ],
      },
    },
    {
      num: 4,
      period: "October – December",
      subjects: [
        {
          name: "Home Language",
          col: "p",
          items: [
            "Reads and evaluates a range of texts critically",
            "Writes a polished written portfolio",
            "Demonstrates advanced oral communication",
            "Mastery of grammar, style and register",
          ],
        },
        {
          name: "First Additional Language",
          col: "sky",
          items: [
            "Comprehensive reading comprehension",
            "Extended writing: essay or article",
            "Language and grammar consolidation",
            "Oral: evaluation and reflection",
          ],
        },
        {
          name: "Mathematics",
          col: "teal",
          items: [
            "Algebra and functions consolidation",
            "Trigonometry: solving right-angled triangles",
            "Geometry: formal proofs and theorems",
            "Statistics: full investigation and report",
          ],
        },
        {
          name: "Natural Sciences",
          col: "gold",
          items: [
            "Revision of life and physical sciences themes",
            "Technology: end-of-year design challenge",
          ],
        },
      ],
      side: null,
    },
  ],

  7: [
    {
      num: 1,
      period: "January – March",
      subjects: [
        {
          name: "Home Language",
          col: "p",
          items: [
            "Oral: structured debate with counter-arguments",
            "Reading: in-depth literary analysis (prose, poetry, drama)",
            "Comprehension: synthesising, evaluating, critiquing",
            "Essay: argumentative with thesis and evidence",
            "Grammar: clause analysis; complex sentence structures",
            "Vocabulary: etymology, register, connotation",
          ],
        },
        {
          name: "First Additional Language",
          col: "sky",
          items: [
            "Reads and critically analyses literary texts",
            "Writes formal and creative essays",
            "Grammar: advanced structures and conventions",
            "Oral: prepared and unprepared speech",
          ],
        },
        {
          name: "Mathematics",
          col: "teal",
          items: [
            "The real number system: rational and irrational numbers",
            "Exponents: laws and applications",
            "Algebraic expressions: factorisation and simplification",
            "Linear equations and inequalities",
            "Quadratic expressions (introduction)",
            "Geometry: angle theorems — parallel lines, triangles",
            "Transformation geometry",
          ],
        },
        {
          name: "Natural Sciences",
          col: "gold",
          items: [
            "Life Sciences: cell biology and genetics",
            "Physical Sciences: mechanics — motion and forces",
            "Chemistry: the periodic table; bonding",
            "Earth sciences: plate tectonics",
          ],
        },
      ],
      side: {
        title: "Humanities & Applied Subjects",
        col: "a",
        items: [
          "History: World War II and Cold War",
          "Geography: geomorphology; rivers and coasts",
          "EMS: financial literacy and business management",
          "Technology: systems and control",
          "Life Orientation: career guidance and values",
        ],
      },
    },
    {
      num: 2,
      period: "April – June",
      subjects: [
        {
          name: "Home Language",
          col: "p",
          items: [
            "Oral: panel discussion on a social issue",
            "Novel study: comparing themes and perspectives",
            "Writes a transactional text: formal report and proposal",
            "Grammar: passive voice, noun clauses, style",
            "Comprehension: evaluating point of view and bias",
          ],
        },
        {
          name: "First Additional Language",
          col: "sky",
          items: [
            "Reading: non-fiction — speeches, manifestos",
            "Writing: formal report and discursive essay",
            "Grammar: complex syntax and advanced tenses",
            "Oral: group collaboration and critique",
          ],
        },
        {
          name: "Mathematics",
          col: "teal",
          items: [
            "Functions: linear, quadratic, exponential (graphs)",
            "Simultaneous equations",
            "Geometry: circle theorems (introduction)",
            "Theorem of Pythagoras: applications",
            "Trigonometry: sin, cos, tan — solving triangles",
            "Financial Mathematics: compound interest, annuities",
          ],
        },
        {
          name: "Natural Sciences",
          col: "gold",
          items: [
            "Life Sciences: ecosystems and biodiversity",
            "Physical Sciences: electricity and magnetism",
            "Chemistry: reactions, equations and stoichiometry",
            "Environmental science: climate change impacts",
          ],
        },
      ],
      side: {
        title: "Humanities & Applied Subjects",
        col: "a",
        items: [
          "History: decolonisation and African independence",
          "Geography: development disparities; aid and trade",
          "EMS: income statement and cash flow",
          "Technology: electronics and communication systems",
          "Life Orientation: healthy relationships",
        ],
      },
    },
    {
      num: 3,
      period: "July – September",
      subjects: [
        {
          name: "Home Language",
          col: "p",
          items: [
            "Drama: staging and performing an excerpt",
            "Oral: individual research presentation with Q&A",
            "Writes a complex argumentative and analytical essay",
            "Grammar: advanced rhetoric and stylistic devices",
            "Research: extended investigation with bibliography",
          ],
        },
        {
          name: "First Additional Language",
          col: "sky",
          items: [
            "Poetry: close reading and appreciation",
            "Extended writing: creative or analytical essay",
            "Grammar revision: comprehensive structures",
            "Oral: dramatic reading or debate",
          ],
        },
        {
          name: "Mathematics",
          col: "teal",
          items: [
            "Probability: addition and multiplication rules",
            "Statistics: standard deviation; normal distribution",
            "Analytical Geometry: distance, gradient, midpoint",
            "Geometry: formal proofs — triangles and circles",
            "Trigonometry: identities and equations",
          ],
        },
        {
          name: "Natural Sciences",
          col: "gold",
          items: [
            "Life Sciences: human biology — reproduction, immunity",
            "Physical Sciences: waves, sound and light",
            "Chemistry: organic chemistry introduction",
            "Astronomy: the universe and space science",
          ],
        },
      ],
      side: {
        title: "Humanities & Applied Subjects",
        col: "a",
        items: [
          "History: globalisation and 21st century challenges",
          "Geography: urban management and sustainability",
          "EMS: balance sheet and financial analysis",
          "Technology: innovation and entrepreneurship",
          "Life Orientation: civic responsibility",
        ],
      },
    },
    {
      num: 4,
      period: "October – December",
      subjects: [
        {
          name: "Home Language",
          col: "p",
          items: [
            "Reading and critically evaluating a range of genres",
            "Writes a polished writing portfolio — multiple genres",
            "Advanced oral communication and argumentation",
            "Mastery of grammar, style, vocabulary and register",
          ],
        },
        {
          name: "First Additional Language",
          col: "sky",
          items: [
            "Comprehensive reading and comprehension portfolio",
            "Extended essay: analytical or creative",
            "Language consolidation: grammar and vocabulary",
            "Oral: final presentation or showcase",
          ],
        },
        {
          name: "Mathematics",
          col: "teal",
          items: [
            "Algebra: full revision — expressions, equations, functions",
            "Geometry: theorems and proof portfolios",
            "Trigonometry: comprehensive solving",
            "Statistics & Probability: final investigation",
            "Financial Mathematics: end-of-year applications",
          ],
        },
        {
          name: "Natural Sciences",
          col: "gold",
          items: [
            "Life and Physical Sciences comprehensive revision",
            "Independent research investigation report",
            "Technology: final design portfolio",
          ],
        },
      ],
      side: null,
    },
  ],
};
const getTermData = (grade) => {
  const key = String(normaliseGrade(grade) || "1");
  return GRADE_TERM_DATA[key] || GRADE_TERM_DATA["1"];
};

// ── ATTENDANCE PAGE ───────────────────────────────────────────────────────────
const AttendancePage = ({ t, data, studentAttendance, businessName }) => {
  const totalPresent = studentAttendance.filter(
    (r) => r.status === "present",
  ).length;
  const totalAbsent = studentAttendance.filter(
    (r) => r.status === "absent",
  ).length;
  const totalLate = studentAttendance.filter((r) => r.status === "late").length;
  const total = studentAttendance.length;
  const overallPct = pct(totalPresent, total);

  const termMonthMap = {
    "2026-01": 1,
    "2026-02": 1,
    "2026-03": 1,
    "2026-04": 2,
    "2026-05": 2,
    "2026-06": 2,
    "2026-07": 3,
    "2026-08": 3,
    "2026-09": 3,
    "2026-10": 4,
    "2026-11": 4,
    "2026-12": 4,
  };
  const byTerm = {
    1: { present: 0, absent: 0, late: 0, total: 0 },
    2: { present: 0, absent: 0, late: 0, total: 0 },
    3: { present: 0, absent: 0, late: 0, total: 0 },
    4: { present: 0, absent: 0, late: 0, total: 0 },
  };
  studentAttendance.forEach((r) => {
    const mo = r.date ? r.date.slice(0, 7) : null;
    const term = termMonthMap[mo];
    if (term) {
      byTerm[term][r.status] = (byTerm[term][r.status] || 0) + 1;
      byTerm[term].total++;
    }
  });

  const rateColor = (rate) =>
    rate >= 90 ? "#15803d" : rate >= 75 ? "#a16207" : "#dc2626";
  const sorted = [...studentAttendance]
    .sort((a, b) => (a.date || "").localeCompare(b.date || ""))
    .slice(-90);

  return (
    <PageShell t={t}>
      <PageHeader
        t={t}
        title="Attendance Record"
        sub={`${data.firstName} ${data.surname} · Grade ${data.grade || "1"} · ${data.schoolYear || "2026"}`}
        businessName={businessName}
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "3mm",
          marginBottom: "4mm",
        }}
      >
        {[
          { label: "Total Sessions", value: total, color: t.p },
          { label: "Present", value: totalPresent, color: t.teal },
          { label: "Absent", value: totalAbsent, color: t.a },
          { label: "Late Arrivals", value: totalLate, color: t.gold },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              border: `1.5px solid ${t.bd}`,
              borderRadius: 8,
              padding: "3mm",
              textAlign: "center",
              background: t.cream,
            }}
          >
            <div
              style={{
                fontFamily: t.hf,
                fontWeight: 900,
                fontSize: "16pt",
                color: s.color,
                lineHeight: 1,
              }}
            >
              {s.value}
            </div>
            <div
              style={{
                fontSize: "7.5pt",
                color: t.mu,
                marginTop: "1mm",
                fontWeight: 600,
                textTransform: "uppercase",
              }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          marginBottom: "4mm",
          padding: "3mm 4mm",
          border: `1.5px solid ${t.bd}`,
          borderRadius: 8,
          background: "#fff",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "2mm",
          }}
        >
          <span
            style={{
              fontFamily: t.hf,
              fontWeight: 800,
              fontSize: "9pt",
              color: t.p,
            }}
          >
            Overall Attendance Rate
          </span>
          <span
            style={{
              fontFamily: t.hf,
              fontWeight: 900,
              fontSize: "11pt",
              color: rateColor(overallPct),
            }}
          >
            {overallPct}%
          </span>
        </div>
        <div
          style={{
            height: 8,
            background: t.lt,
            borderRadius: 99,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${overallPct}%`,
              background:
                overallPct >= 90 ? t.teal : overallPct >= 75 ? t.gold : t.a,
              borderRadius: 99,
            }}
          />
        </div>
        {overallPct < 80 && (
          <div
            style={{
              marginTop: "2mm",
              fontSize: "8pt",
              color: t.a,
              fontWeight: 700,
            }}
          >
            ⚠ Below recommended 80% threshold — parent meeting advised
          </div>
        )}
      </div>
      <SecTitle t={t} col={t.p}>
        Term-by-Term Attendance
      </SecTitle>
      <RTable
        t={t}
        cols={[
          { label: "Term" },
          { label: "Total Days", w: "15%" },
          { label: "Present", w: "13%" },
          { label: "Absent", w: "13%" },
          { label: "Late", w: "10%" },
          { label: "Rate %", w: "12%" },
        ]}
        rows={[1, 2, 3, 4].map((tn) => {
          const td = byTerm[tn];
          const r = pct(td.present, td.total);
          return [
            `Term ${tn}`,
            td.total || "",
            td.present || "",
            td.absent || "",
            td.late || "",
            td.total > 0 ? { v: `${r}%`, bold: true } : "",
          ];
        })}
      />
      {sorted.length > 0 && (
        <>
          <SecTitle t={t} col={t.teal}>
            Attendance Calendar (Recent Records)
          </SecTitle>
          <div
            style={{
              padding: "3mm 4mm",
              border: `1.5px solid ${t.bd}`,
              borderRadius: 8,
              background: "#fff",
              marginBottom: "3mm",
            }}
          >
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 4,
                marginBottom: "2mm",
              }}
            >
              {sorted.map((r, i) => (
                <div
                  key={i}
                  title={`${r.date}: ${r.status}`}
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 3,
                    background:
                      r.status === "present"
                        ? t.teal
                        : r.status === "late"
                          ? t.gold
                          : t.a,
                    opacity: 0.85,
                    flexShrink: 0,
                  }}
                />
              ))}
            </div>
            <div
              style={{
                display: "flex",
                gap: "4mm",
                fontSize: "7.5pt",
                color: t.mu,
              }}
            >
              {[
                ["Present", t.teal],
                ["Late", t.gold],
                ["Absent", t.a],
              ].map(([lbl, col]) => (
                <span
                  key={lbl}
                  style={{ display: "flex", alignItems: "center", gap: 3 }}
                >
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 3,
                      background: col,
                      display: "inline-block",
                    }}
                  />
                  {lbl}
                </span>
              ))}
            </div>
          </div>
        </>
      )}
      {sorted.length === 0 && (
        <div
          style={{
            padding: "8mm",
            textAlign: "center",
            color: t.mu,
            fontSize: "9pt",
            border: `1.5px dashed ${t.bd}`,
            borderRadius: 8,
            marginTop: "4mm",
          }}
        >
          No attendance records found for this student
        </div>
      )}
      <SigRow t={t} data={data} />
    </PageShell>
  );
};

// ── FEES PAGE ─────────────────────────────────────────────────────────────────
const FeesPage = ({ t, data, studentFees, studentPayments, businessName }) => {
  const totalFees = studentFees?.total || 0;
  const paidFees = studentFees?.paid || 0;
  const balance = totalFees - paidFees;
  const status = studentFees?.status || "unpaid";
  const payPct = pct(paidFees, totalFees);
  const statusColors = {
    paid: { bg: "#dcfce7", color: "#15803d", label: "Paid in Full" },
    partial: { bg: "#fef9c3", color: "#a16207", label: "Partial Payment" },
    unpaid: { bg: "#fee2e2", color: "#dc2626", label: "Outstanding" },
  };
  const sc = statusColors[status] || statusColors.unpaid;
  return (
    <PageShell t={t}>
      <PageHeader
        t={t}
        title="Fee Statement"
        sub={`${data.firstName} ${data.surname} · Grade ${data.grade || "1"} · ${data.schoolYear || "2026"}`}
        businessName={businessName}
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "3mm",
          marginBottom: "4mm",
        }}
      >
        {[
          { label: "Total Fees", value: fmt(totalFees), color: t.p },
          { label: "Amount Paid", value: fmt(paidFees), color: t.teal },
          {
            label: "Balance Due",
            value: fmt(balance),
            color: balance > 0 ? t.a : t.teal,
          },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              border: `1.5px solid ${t.bd}`,
              borderRadius: 8,
              padding: "3mm 4mm",
              background: t.cream,
            }}
          >
            <div
              style={{
                fontSize: "7.5pt",
                color: t.mu,
                fontWeight: 700,
                textTransform: "uppercase",
                marginBottom: "1mm",
              }}
            >
              {s.label}
            </div>
            <div
              style={{
                fontFamily: t.hf,
                fontWeight: 900,
                fontSize: "13pt",
                color: s.color,
              }}
            >
              {s.value}
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          padding: "3mm 4mm",
          border: `1.5px solid ${t.bd}`,
          borderRadius: 8,
          background: "#fff",
          marginBottom: "4mm",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "2mm",
          }}
        >
          <span
            style={{
              fontFamily: t.hf,
              fontWeight: 800,
              fontSize: "9pt",
              color: t.p,
            }}
          >
            Payment Progress
          </span>
          <span
            style={{
              padding: "2px 10px",
              borderRadius: 99,
              fontSize: "9pt",
              fontWeight: 700,
              background: sc.bg,
              color: sc.color,
            }}
          >
            {sc.label}
          </span>
        </div>
        <div
          style={{
            height: 10,
            background: t.lt,
            borderRadius: 99,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${Math.min(payPct, 100)}%`,
              background: status === "paid" ? t.teal : t.gold,
              borderRadius: 99,
            }}
          />
        </div>
        <div
          style={{
            marginTop: "1mm",
            fontSize: "7.5pt",
            color: t.mu,
            textAlign: "right",
          }}
        >
          {payPct}% paid
        </div>
      </div>
      <SecTitle t={t} col={t.p}>
        Payment History
      </SecTitle>
      {studentPayments.length > 0 ? (
        <RTable
          t={t}
          cols={[
            { label: "Receipt No." },
            { label: "Date" },
            { label: "Method", w: "15%" },
            { label: "Term", w: "12%" },
            { label: "Amount", w: "15%" },
            { label: "Notes" },
          ]}
          rows={[
            ...studentPayments.map((p) => [
              p.receiptNumber || "—",
              p.createdAt?.toDate
                ? p.createdAt.toDate().toLocaleDateString("en-ZA")
                : p.date || "—",
              (p.method || "—").toUpperCase(),
              p.term || "—",
              { v: fmt(p.amount), bold: true },
              p.notes || "",
            ]),
            [
              { v: "TOTAL PAID", bold: true, total: true },
              { v: "", total: true },
              { v: "", total: true },
              { v: "", total: true },
              { v: fmt(paidFees), bold: true, total: true },
              { v: "", total: true },
            ],
          ]}
        />
      ) : (
        <div
          style={{
            padding: "8mm",
            textAlign: "center",
            color: t.mu,
            fontSize: "9pt",
            border: `1.5px dashed ${t.bd}`,
            borderRadius: 8,
          }}
        >
          No payment records found for this student
        </div>
      )}
      <div
        style={{
          marginTop: "4mm",
          padding: "3mm 4mm",
          background: balance > 0 ? "#fff7ed" : "#f0fdf4",
          borderRadius: 8,
          border: `1.5px solid ${balance > 0 ? t.gold : t.teal}`,
          fontSize: "8pt",
          color: balance > 0 ? "#92400e" : "#14532d",
          fontWeight: 600,
        }}
      >
        {balance > 0
          ? `⚠ Outstanding balance of ${fmt(balance)} remains. Please arrange payment to avoid interruption of schooling.`
          : `✓ All fees have been paid in full. Thank you for your prompt payment.`}
      </div>
      <SigRow t={t} data={data} />
    </PageShell>
  );
};

// ── BEHAVIOUR & WELFARE PAGE ──────────────────────────────────────────────────
const BehaviourWelfarePage = ({
  t,
  data,
  incidents,
  welfareFlags,
  businessName,
}) => {
  const severityConfig = {
    low: { label: "Minor", color: "#a16207", bg: "#fef9c3" },
    medium: { label: "Moderate", color: "#dc2626", bg: "#fee2e2" },
    high: { label: "Serious", color: "#7f1d1d", bg: "#fee2e2" },
  };
  const urgencyConfig = {
    low: { label: "Monitor", color: "#15803d" },
    moderate: { label: "Urgent", color: "#a16207" },
    high: { label: "Immediate", color: "#dc2626" },
  };
  return (
    <PageShell t={t}>
      <PageHeader
        t={t}
        title="Behaviour & Welfare"
        sub={`${data.firstName} ${data.surname} · Grade ${data.grade || "1"} · ${data.schoolYear || "2026"} — CONFIDENTIAL`}
        businessName={businessName}
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "3mm",
          marginBottom: "4mm",
        }}
      >
        {[
          { label: "Total Incidents", value: incidents.length, color: t.p },
          {
            label: "Serious",
            value: incidents.filter((i) => i.severity === "high").length,
            color: t.a,
          },
          {
            label: "Resolved",
            value: incidents.filter((i) => i.parentNotified).length,
            color: t.teal,
          },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              border: `1.5px solid ${t.bd}`,
              borderRadius: 8,
              padding: "3mm 4mm",
              background: t.cream,
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontFamily: t.hf,
                fontWeight: 900,
                fontSize: "18pt",
                color: s.color,
                lineHeight: 1,
              }}
            >
              {s.value}
            </div>
            <div
              style={{
                fontSize: "7.5pt",
                color: t.mu,
                marginTop: "1mm",
                fontWeight: 600,
                textTransform: "uppercase",
              }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>
      <SecTitle t={t} col={t.p}>
        Behaviour Incident Log
      </SecTitle>
      {incidents.length > 0 ? (
        <RTable
          t={t}
          cols={[
            { label: "Date" },
            { label: "Type" },
            { label: "Severity", w: "14%" },
            { label: "Action Taken" },
            { label: "Parent Notified", w: "14%" },
          ]}
          rows={incidents.map((inc) => {
            const sc = severityConfig[inc.severity] || severityConfig.low;
            return [
              inc.date || "—",
              inc.type || "—",
              { v: sc.label, bold: false },
              inc.actionTaken || "—",
              inc.parentNotified ? "Yes" : "No",
            ];
          })}
        />
      ) : (
        <div
          style={{
            padding: "5mm",
            textAlign: "center",
            color: t.mu,
            fontSize: "9pt",
            border: `1.5px dashed ${t.bd}`,
            borderRadius: 8,
            marginBottom: "4mm",
          }}
        >
          ✓ No behaviour incidents recorded — excellent conduct
        </div>
      )}
      <SecTitle t={t} col={t.a}>
        Welfare Flags (Confidential)
      </SecTitle>
      {welfareFlags.length > 0 ? (
        <>
          <div
            style={{
              marginBottom: "2mm",
              padding: "2mm 3mm",
              background: "#fdf2f8",
              border: "1px solid #fbcfe8",
              borderRadius: 6,
              fontSize: "8pt",
              color: "#9d174d",
              fontWeight: 700,
            }}
          >
            🔒 Confidential — Principal / Designated Safeguarding Lead access
            only
          </div>
          <RTable
            t={t}
            cols={[
              { label: "Date" },
              { label: "Category" },
              { label: "Urgency", w: "14%" },
              { label: "Notes" },
              { label: "Status", w: "13%" },
            ]}
            rows={welfareFlags.map((f) => {
              const uc = urgencyConfig[f.urgency] || urgencyConfig.moderate;
              return [
                f.date || "—",
                f.category || "—",
                { v: uc.label, bold: true },
                f.notes
                  ? f.notes.slice(0, 50) + (f.notes.length > 50 ? "…" : "")
                  : "—",
                f.status === "resolved"
                  ? "Resolved"
                  : f.status === "escalated"
                    ? "Escalated"
                    : "Open",
              ];
            })}
          />
        </>
      ) : (
        <div
          style={{
            padding: "5mm",
            textAlign: "center",
            color: t.mu,
            fontSize: "9pt",
            border: `1.5px dashed ${t.bd}`,
            borderRadius: 8,
          }}
        >
          ✓ No welfare concerns on record
        </div>
      )}
      <SigRow t={t} data={data} />
    </PageShell>
  );
};

// ── MARKS PAGE ────────────────────────────────────────────────────────────────
const MarksPage = ({ t, data, markbookEntries, businessName }) => {
  const studentName = `${data.firstName} ${data.surname}`.trim();
  const getScore = (entry) => {
    const scores = entry.scores || {};
    return (
      scores[studentName] ??
      scores[data.firstName] ??
      scores[data.emisNo] ??
      null
    );
  };
  const relevantEntries = markbookEntries.filter(
    (e) => getScore(e) !== null && getScore(e) !== undefined,
  );
  const bySubject = {};
  relevantEntries.forEach((e) => {
    const subj = e.subject || "General";
    if (!bySubject[subj]) bySubject[subj] = [];
    bySubject[subj].push(e);
  });
  const getAvgPct = (entries) => {
    const vals = entries
      .map((e) => {
        const sc = getScore(e);
        return sc !== null && sc !== "" && e.total
          ? (parseFloat(sc) / e.total) * 100
          : null;
      })
      .filter(Boolean);
    if (!vals.length) return null;
    return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
  };
  const capsCode = (pct) => {
    if (pct >= 80) return { code: 7, label: "Outstanding" };
    if (pct >= 70) return { code: 6, label: "Meritorious" };
    if (pct >= 60) return { code: 5, label: "Substantial" };
    if (pct >= 50) return { code: 4, label: "Adequate" };
    if (pct >= 40) return { code: 3, label: "Moderate" };
    if (pct >= 30) return { code: 2, label: "Elementary" };
    return { code: 1, label: "Not Achieved" };
  };
  return (
    <PageShell t={t}>
      <PageHeader
        t={t}
        title="Academic Assessment"
        sub={`${data.firstName} ${data.surname} · Grade ${data.grade || "1"} · ${data.schoolYear || "2026"}`}
        businessName={businessName}
      />
      {Object.keys(bySubject).length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(45mm, 1fr))",
            gap: "3mm",
            marginBottom: "4mm",
          }}
        >
          {Object.entries(bySubject).map(([subj, entries]) => {
            const avg = getAvgPct(entries);
            const caps = avg ? capsCode(parseFloat(avg)) : null;
            return (
              <div
                key={subj}
                style={{
                  border: `1.5px solid ${t.bd}`,
                  borderRadius: 8,
                  padding: "3mm",
                  textAlign: "center",
                  background: t.cream,
                }}
              >
                <div
                  style={{
                    fontSize: "8pt",
                    color: t.mu,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    marginBottom: "1mm",
                  }}
                >
                  {subj}
                </div>
                <div
                  style={{
                    fontFamily: t.hf,
                    fontWeight: 900,
                    fontSize: "15pt",
                    color: avg
                      ? parseFloat(avg) >= 75
                        ? t.teal
                        : parseFloat(avg) >= 50
                          ? t.gold
                          : t.a
                      : t.mu,
                    lineHeight: 1,
                  }}
                >
                  {avg ? `${avg}%` : "—"}
                </div>
                {caps && (
                  <div
                    style={{ fontSize: "7pt", color: t.mu, marginTop: "0.5mm" }}
                  >
                    Code {caps.code} · {caps.label}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      {Object.entries(bySubject).map(([subj, entries]) => (
        <div key={subj}>
          <SecTitle t={t} col={t.p}>
            {subj}
          </SecTitle>
          <RTable
            t={t}
            cols={[
              { label: "Assessment" },
              { label: "Date" },
              { label: "Out Of", w: "10%" },
              { label: "Score", w: "10%" },
              { label: "%", w: "10%" },
              { label: "Code", w: "10%" },
            ]}
            rows={entries.map((e) => {
              const score = getScore(e);
              const percentage =
                score !== null && score !== "" && e.total
                  ? ((parseFloat(score) / e.total) * 100).toFixed(1)
                  : null;
              const caps = percentage ? capsCode(parseFloat(percentage)) : null;
              return [
                e.assessment || "—",
                e.date || "—",
                e.total || "—",
                { v: score !== null ? score : "—", bold: true },
                percentage ? `${percentage}%` : "—",
                caps ? `${caps.code}` : "—",
              ];
            })}
          />
        </div>
      ))}
      {relevantEntries.length === 0 && (
        <div
          style={{
            padding: "8mm",
            textAlign: "center",
            color: t.mu,
            fontSize: "9pt",
            border: `1.5px dashed ${t.bd}`,
            borderRadius: 8,
            marginTop: "4mm",
          }}
        >
          No academic assessment records found for this student
        </div>
      )}
      <SecTitle t={t} col={t.teal}>
        Assessment Code Reference
      </SecTitle>
      <RTable
        t={t}
        cols={[{ label: "Code" }, { label: "Description" }, { label: "Range" }]}
        rows={[
          ["7", "Outstanding Achievement", "80–100%"],
          ["6", "Meritorious Achievement", "70–79%"],
          ["5", "Substantial Achievement", "60–69%"],
          ["4", "Adequate Achievement", "50–59%"],
          ["3", "Moderate Achievement", "40–49%"],
          ["2", "Elementary Achievement", "30–39%"],
          ["1", "Not Achieved", "0–29%"],
        ]}
      />
      <SigRow t={t} data={data} />
    </PageShell>
  );
};

// ── COVER PAGE ────────────────────────────────────────────────────────────────
const CoverPage = ({ t, data, businessName, logoUrl }) => (
  <PageShell t={t} noBorder>
    {t.id === "playful" ? (
      <div
        style={{
          height: 10,
          background:
            "linear-gradient(90deg,#f43f5e,#fbbf24,#22c55e,#0ea5e9,#7c3aed,#f43f5e)",
        }}
      />
    ) : (
      <div
        style={{
          width: "100%",
          height: "16mm",
          background: t.p,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            color: "#fff",
            fontFamily: t.hf,
            fontWeight: 800,
            fontSize: "13pt",
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          {businessName || "Solidflo Pre School"}
        </span>
      </div>
    )}
    {t.id === "playful" && (
      <div
        style={{
          width: "100%",
          height: "16mm",
          background: t.p,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            color: "#fff",
            fontFamily: t.hf,
            fontWeight: 800,
            fontSize: "13pt",
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          {businessName || "Solidflo Pre School"}
        </span>
      </div>
    )}
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "8mm",
        padding: "10mm 20mm",
        background: t.cBg,
      }}
    >
      <div
        style={{
          width: 100,
          height: 100,
          borderRadius: t.id === "playful" ? 20 : 12,
          background: logoUrl
            ? "#ffffff00"
            : t.id === "professional"
              ? "#ffffff00"
              : `linear-gradient(135deg,${t.p},${t.sky})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 38,
          overflow: "hidden",
        }}
      >
        {logoUrl ? (
          <img
            src={logoUrl}
            alt="School logo"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              padding: 1,
            }}
          />
        ) : (
          <span>🏫</span>
        )}
      </div>
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontFamily: t.hf,
            fontSize: "26pt",
            fontWeight: 900,
            color: t.p,
            lineHeight: 1.1,
          }}
        >
          Progress Report
        </div>
        <div
          style={{
            fontFamily: t.hf,
            fontSize: "15pt",
            fontWeight: 700,
            color: t.sky,
            marginTop: "3mm",
          }}
        >
          Grade {data.grade || "1"} — Foundation Phase
        </div>
        <div
          style={{
            display: "inline-block",
            marginTop: "5mm",
            background: t.a,
            color: "#fff",
            fontFamily: t.hf,
            fontWeight: 800,
            fontSize: "14pt",
            padding: "3mm 10mm",
            borderRadius: t.id === "playful" ? 30 : 6,
            letterSpacing: 1,
          }}
        >
          {data.schoolYear || "2026"}
        </div>
      </div>
      <div
        style={{
          width: "100%",
          maxWidth: "140mm",
          border: `2px solid ${t.lt}`,
          borderRadius: t.id === "playful" ? 16 : 10,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            background: t.p,
            color: "#fff",
            fontFamily: t.hf,
            fontWeight: 700,
            fontSize: "9pt",
            padding: "2mm 5mm",
            letterSpacing: 1,
            textTransform: "uppercase",
          }}
        >
          Learner Information
        </div>
        <div style={{ padding: "4mm 5mm", background: "#fff" }}>
          {[
            ["Name of Learner", data.firstName],
            ["Surname", data.surname],
            ["Date of Birth", data.dob],
            ["EMIS / Learner No.", data.emisNo],
            ["Class / Grade", data.classGrade || `Grade ${data.grade || "1"}`],
            ["Class Teacher", data.teacher],
            ["Parent / Guardian", data.parentName],
            ["Contact No.", data.parentPhone],
            ["School Year", data.schoolYear || "2026"],
          ].map(([f, v]) => (
            <div
              key={f}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "2mm 0",
                borderBottom: `1px solid ${t.bd}`,
              }}
            >
              <label
                style={{
                  fontFamily: t.hf,
                  fontWeight: 700,
                  fontSize: "8.5pt",
                  color: t.sky,
                  minWidth: "48mm",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                {f}
              </label>
              <div
                style={{
                  flex: 1,
                  borderBottom: v ? "none" : `1.5px solid ${t.bd}`,
                  height: 10,
                  display: "flex",
                  alignItems: "center",
                  fontSize: "8.5pt",
                  color: "#212529",
                  fontFamily: t.bf,
                }}
              >
                {v || ""}
              </div>
            </div>
          ))}
        </div>
      </div>
      <p
        style={{
          fontSize: "8pt",
          color: t.mu,
          textAlign: "center",
          maxWidth: "120mm",
          lineHeight: 1.6,
        }}
      >
        This report is compiled in accordance with the{" "}
        <strong>South African CAPS curriculum</strong> for Grade{" "}
        {data.grade || "1"} (Foundation Phase).
      </p>
    </div>
    <div
      style={{
        width: "100%",
        height: "12mm",
        background: t.fBg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <p
        style={{
          fontFamily: t.hf,
          fontWeight: 700,
          fontSize: "8pt",
          letterSpacing: "0.5px",
          color: "#fff",
        }}
      >
        {data.address || "Ext 36, Olivienhoutsbosch"} &nbsp;|&nbsp;{" "}
        {businessName || "Solidflo Pre School"} &nbsp;|&nbsp;{" "}
        {data.schoolYear || "2026"}
      </p>
    </div>
  </PageShell>
);

const KeyPage = ({ t, data, businessName }) => {
  const capsLevels = [
    { code: 7, label: "Outstanding", range: "80–100%", bg: "#2a9d8f" },
    { code: 6, label: "Meritorious", range: "70–79%", bg: "#57cc99" },
    { code: 5, label: "Substantial", range: "60–69%", bg: "#457b9d" },
    { code: 4, label: "Adequate", range: "50–59%", bg: "#f4a261" },
    { code: 3, label: "Moderate", range: "40–49%", bg: "#f77f00" },
    { code: 2, label: "Elementary", range: "30–39%", bg: "#e63946" },
    { code: 1, label: "Not Achieved", range: "0–29%", bg: "#6c757d" },
  ];
  const skillKeys = [
    {
      code: "E",
      label: "Exceeds",
      sub: "Independently & consistently",
      bg: "#2a9d8f",
    },
    { code: "M", label: "Meets", sub: "With minimal support", bg: "#457b9d" },
    {
      code: "D",
      label: "Developing",
      sub: "With support & guidance",
      bg: "#f4a261",
    },
    {
      code: "B",
      label: "Beginning",
      sub: "Just showing awareness",
      bg: "#e63946",
    },
  ];
  return (
    <PageShell t={t}>
      <PageHeader
        t={t}
        title="Assessment Key & Attendance"
        sub={`${businessName || "Solidflo Saas School"} · Grade ${data.grade || "1"} · ${data.schoolYear || "2026"}`}
        businessName={businessName}
      />
      <div style={{ flex: 1 }}>
        <SecTitle t={t} col={t.p}>
          Assessment Key (CAPS Codes)
        </SecTitle>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7,1fr)",
            gap: "2mm",
            margin: "2mm 0 3mm",
          }}
        >
          {capsLevels.map((l) => (
            <div
              key={l.code}
              style={{
                border: `1.5px solid ${t.bd}`,
                borderRadius: t.id === "playful" ? 10 : 6,
                padding: "2mm",
                textAlign: "center",
                background: t.cream,
              }}
            >
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: l.bg,
                  color: "#fff",
                  fontFamily: t.hf,
                  fontWeight: 900,
                  fontSize: "10pt",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1mm",
                }}
              >
                {l.code}
              </div>
              <div
                style={{
                  fontFamily: t.hf,
                  fontWeight: 700,
                  fontSize: "7pt",
                  color: t.p,
                }}
              >
                {l.label}
              </div>
              <div style={{ fontSize: "7pt", color: t.mu }}>{l.range}</div>
            </div>
          ))}
        </div>
        <SecTitle t={t} col={t.teal}>
          Skills Assessment Key
        </SecTitle>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: "2mm",
            margin: "2mm 0 4mm",
          }}
        >
          {skillKeys.map((s) => (
            <div
              key={s.code}
              style={{
                border: `1.5px solid ${t.bd}`,
                borderRadius: t.id === "playful" ? 10 : 6,
                padding: "2mm",
                textAlign: "center",
                background: t.cream,
              }}
            >
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: s.bg,
                  color: "#fff",
                  fontFamily: t.hf,
                  fontWeight: 900,
                  fontSize: "10pt",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1mm",
                }}
              >
                {s.code}
              </div>
              <div
                style={{
                  fontFamily: t.hf,
                  fontWeight: 700,
                  fontSize: "7pt",
                  color: t.p,
                }}
              >
                {s.label}
              </div>
              <div style={{ fontSize: "6.5pt", color: t.mu, lineHeight: 1.3 }}>
                {s.sub}
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
};

const loadScript = (src) =>
  new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement("script");
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });

const TermPage = ({ t, td, data, businessName }) => {
  const isT4 = td.num === 4;
  const comments = data[`comments${td.num}`] || "";
  const subjects = td.subjects || [];

  // Split wide (full-width) from regular subjects
  const wideSubjects = subjects.filter((s) => s.wide);
  const regularSubjects = subjects.filter((s) => !s.wide);

  // Pair up regular subjects for 2-column layout
  const pairs = [];
  for (let i = 0; i < regularSubjects.length; i += 2) {
    pairs.push(regularSubjects.slice(i, i + 2));
  }

  // Map colour key string → theme colour value
  const themeCol = (key) => {
    const map = {
      p: t.p,
      a: t.a,
      teal: t.teal,
      sky: t.sky,
      gold: t.gold,
      mu: t.mu,
      lt: t.lt,
    };
    return map[key] || t.p;
  };

  return (
    <PageShell t={t}>
      <TermBanner t={t} termNum={td.num} period={td.period} />

      {/* Wide (full-width) subjects */}
      {wideSubjects.map((subj) => (
        <div key={subj.name}>
          <SecTitle t={t} col={themeCol(subj.col)}>
            {subj.name}
          </SecTitle>
          <RTable
            t={t}
            cols={[{ label: "Skill / Outcome" }, { label: "Mark", w: "12%" }]}
            rows={[
              ...subj.items.map((item) => [item, ""]),
              [
                {
                  v: `${subj.name} Overall Mark (1–7)`,
                  bold: true,
                  total: true,
                },
                { v: "", bold: true, total: true },
              ],
            ]}
          />
        </div>
      ))}

      {/* Paired regular subjects in 2-column layout */}
      {pairs.map((pair, pIdx) => (
        <div
          key={pIdx}
          style={{
            display: "flex",
            gap: "4mm",
            marginTop: pIdx === 0 && wideSubjects.length === 0 ? 0 : "2mm",
          }}
        >
          {pair.map((subj) => (
            <div key={subj.name} style={{ flex: 1, minWidth: 0 }}>
              <SecTitle t={t} col={themeCol(subj.col)}>
                {subj.name}
              </SecTitle>
              <RTable
                t={t}
                cols={[{ label: "Outcome" }, { label: "Mark", w: "15%" }]}
                rows={[
                  ...subj.items.map((item) => [item, ""]),
                  [
                    {
                      v: `${subj.name} Overall (1–7)`,
                      bold: true,
                      total: true,
                    },
                    { v: "", bold: true, total: true },
                  ],
                ]}
              />
            </div>
          ))}
          {/* If odd number in pair, fill remaining space */}
          {pair.length === 1 && td.side && pIdx === pairs.length - 1 && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <SecTitle t={t} col={themeCol(td.side.col)}>
                {td.side.title}
              </SecTitle>
              <RTable
                t={t}
                cols={[{ label: "Skill" }, { label: "E/M/D/B", w: "15%" }]}
                rows={td.side.items.map((item) => [item, ""])}
              />
            </div>
          )}
        </div>
      ))}

      {/* Side section when subjects are even (side goes full-width below) */}
      {td.side && pairs.length > 0 && pairs[pairs.length - 1].length === 2 && (
        <div style={{ marginTop: "2mm" }}>
          <SecTitle t={t} col={themeCol(td.side.col)}>
            {td.side.title}
          </SecTitle>
          <RTable
            t={t}
            cols={[{ label: "Skill" }, { label: "E/M/D/B", w: "12%" }]}
            rows={td.side.items.map((item) => [item, ""])}
          />
        </div>
      )}

      {/* Side section when there are no pairs at all */}
      {td.side && pairs.length === 0 && (
        <div style={{ marginTop: "2mm" }}>
          <SecTitle t={t} col={themeCol(td.side.col)}>
            {td.side.title}
          </SecTitle>
          <RTable
            t={t}
            cols={[{ label: "Skill" }, { label: "E/M/D/B", w: "12%" }]}
            rows={td.side.items.map((item) => [item, ""])}
          />
        </div>
      )}

      {/* Year-end summary for Term 4 */}
      {isT4 && (
        <div style={{ marginTop: "2mm" }}>
          <SecTitle t={t} col={t.a}>
            Year-End Summary
          </SecTitle>
          <RTable
            t={t}
            cols={[
              { label: "Learning Area" },
              { label: "T1", w: "9%" },
              { label: "T2", w: "9%" },
              { label: "T3", w: "9%" },
              { label: "T4", w: "9%" },
              { label: "Final", w: "11%" },
            ]}
            rows={subjects.map((subj) => [
              subj.name,
              "",
              "",
              "",
              "",
              { v: "", total: true },
            ])}
          />
          <div
            style={{
              marginTop: "3mm",
              padding: "3mm 4mm",
              borderRadius: t.id === "playful" ? 12 : 6,
              border: `2px solid ${t.bd}`,
              background: t.cream,
            }}
          >
            <div
              style={{
                fontFamily: t.hf,
                fontWeight: 800,
                fontSize: "9pt",
                textTransform: "uppercase",
                letterSpacing: 1,
                color: t.p,
                marginBottom: "2mm",
              }}
            >
              Promotion Decision
            </div>
            <div style={{ display: "flex", gap: "3mm", flexWrap: "wrap" }}>
              {[
                [
                  `☐ Promoted to Grade ${(parseInt(normaliseGrade(data.grade)) || 0) + 1}`,
                  t.teal,
                ],
                [
                  `☐ Retained in Grade ${normaliseGrade(data.grade) || "1"}`,
                  t.a,
                ],
                ["☐ Conditional Promotion", t.gold],
              ].map(([lbl, col]) => (
                <div
                  key={lbl}
                  style={{
                    padding: "2mm 5mm",
                    border: `2px solid ${col}`,
                    borderRadius: t.id === "playful" ? 20 : 4,
                    fontSize: "8.5pt",
                    fontWeight: 700,
                    color: col,
                  }}
                >
                  {lbl}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Comments & Signatures */}
      <div style={{ marginTop: "auto", paddingTop: "3mm" }}>
        <SecTitle t={t} col={t.gold}>
          Teacher Comments — Term {td.num}
        </SecTitle>
        <CommentsBox t={t} value={comments} />
        <SigRow t={t} data={data} />
        {isT4 && (
          <div
            style={{
              marginTop: "4mm",
              padding: "3mm 4mm",
              background: t.p,
              color: "#fff",
              borderRadius: t.id === "playful" ? 10 : 6,
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontFamily: t.hf,
                fontWeight: 700,
                fontSize: "8pt",
                letterSpacing: "0.5px",
              }}
            >
              {businessName || "Solidflo Pre School"} ·{" "}
              {data.address || "Ext 36, Olivienhoutsbosch"} · Grade{" "}
              {normaliseGrade(data.grade) || "1"} Progress Report{" "}
              {data.schoolYear || "2026"}
            </p>
          </div>
        )}
      </div>
    </PageShell>
  );
};

// ── FULL REPORT ───────────────────────────────────────────────────────────────
const Report = ({ themeId, data, firebaseData, businessName, logoUrl }) => {
  const t = resolveTheme(themeId);
  const [gradeThemes, setGradeThemes] = useState(null);
  const {
    studentAttendance = [],
    studentFees = null,
    studentPayments = [],
    incidents = [],
    welfareFlags = [],
    markbookEntries = [],
  } = firebaseData || {};
  return (
    <div
      style={{ background: "#d4d8e0", padding: "10px 0", minHeight: "100%" }}
    >
      <CoverPage
        t={t}
        data={data}
        businessName={businessName}
        logoUrl={logoUrl}
      />
      <KeyPage t={t} data={data} businessName={businessName} />
      <AttendancePage
        t={t}
        data={data}
        studentAttendance={studentAttendance}
        businessName={businessName}
      />
      <FeesPage
        t={t}
        data={data}
        studentFees={studentFees}
        studentPayments={studentPayments}
        businessName={businessName}
      />
      <MarksPage
        t={t}
        data={data}
        markbookEntries={markbookEntries}
        businessName={businessName}
      />
      <BehaviourWelfarePage
        t={t}
        data={data}
        incidents={incidents}
        welfareFlags={welfareFlags}
        businessName={businessName}
      />
      {getTermData(data.grade).map((td) => (
        <TermPage
          key={td.num}
          t={t}
          td={td}
          data={data}
          businessName={businessName}
        />
      ))}
    </div>
  );
};
const GradeThemePage = ({ currentGrade, selected, onSelect, onClose }) => {
  const gradeOrder = ["R", "0", "1", "2", "3", "4", "5", "6", "7"];

  const previewColors = (theme) => [
    theme.p,
    theme.a,
    theme.teal,
    theme.sky,
    theme.gold,
  ];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 500,
        background: "rgba(0,0,0,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          width: "min(860px, 96vw)",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 24px 80px rgba(0,0,0,0.35)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: "20px 24px 16px",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#1d3557",
            borderRadius: "16px 16px 0 0",
            flexShrink: 0,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "system-ui,sans-serif",
                fontWeight: 800,
                fontSize: 18,
                color: "#fff",
                letterSpacing: 0.5,
              }}
            >
              🎨 Grade-Specific Themes
            </div>
            <div
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.65)",
                marginTop: 2,
              }}
            >
              Each grade has its own personality — select a theme or let it
              auto-apply from the student's grade
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              border: "none",
              background: "rgba(255,255,255,0.15)",
              color: "#fff",
              fontSize: 18,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
            }}
          >
            ×
          </button>
        </div>

        {/* Auto-apply notice */}
        {currentGrade && (
          <div
            style={{
              margin: "16px 24px 0",
              padding: "10px 14px",
              background: "#eff6ff",
              borderRadius: 8,
              border: "1px solid #bfdbfe",
              fontSize: 12,
              color: "#1e40af",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span>💡</span>
            <span>
              Current student is Grade <strong>{currentGrade}</strong> — the
              matching theme is highlighted below.
            </span>
            <button
              onClick={() => {
                const gt = Object.values(GRADE_THEMES).find(
                  (t) => String(t.grade) === String(currentGrade),
                );
                if (gt) {
                  onSelect(gt.id);
                  onClose();
                }
              }}
              style={{
                marginLeft: "auto",
                padding: "4px 12px",
                background: "#1d4ed8",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 700,
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              Auto-apply Grade {currentGrade} theme
            </button>
          </div>
        )}

        {/* Grade cards grid */}
        <div
          style={{
            padding: "20px 24px 24px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: 16,
          }}
        >
          {gradeOrder.map((gradeKey) => {
            const theme = GRADE_THEMES[gradeKey];
            if (!theme) return null;
            const isSelected = selected === theme.id;
            const isCurrentGrade =
              currentGrade && String(currentGrade) === String(theme.grade);
            const colors = previewColors(theme);

            return (
              <button
                key={gradeKey}
                onClick={() => {
                  onSelect(theme.id);
                  onClose();
                }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 0,
                  padding: 0,
                  borderRadius: 12,
                  cursor: "pointer",
                  border: isSelected
                    ? `3px solid ${theme.p}`
                    : isCurrentGrade
                      ? `2px dashed ${theme.p}`
                      : "2px solid #e5e7eb",
                  background: "#fff",
                  outline: "none",
                  overflow: "hidden",
                  transition: "all 0.15s",
                  boxShadow: isSelected
                    ? `0 4px 20px ${theme.p}44`
                    : "0 2px 8px rgba(0,0,0,0.06)",
                  textAlign: "left",
                }}
              >
                {/* Color bar preview */}
                <div style={{ height: 8, display: "flex", width: "100%" }}>
                  {colors.map((col, i) => (
                    <div
                      key={i}
                      style={{ flex: 1, background: col, height: "100%" }}
                    />
                  ))}
                </div>

                {/* Mini report preview */}
                <div
                  style={{
                    background: theme.cBg,
                    padding: "10px 12px 8px",
                    borderBottom: `3px solid ${theme.p}`,
                  }}
                >
                  {/* Fake report header */}
                  <div
                    style={{
                      fontFamily: theme.hf,
                      fontSize: 10,
                      fontWeight: 900,
                      color: theme.p,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      marginBottom: 4,
                    }}
                  >
                    Progress Report
                  </div>
                  {/* Fake rows */}
                  {[theme.a, theme.teal, theme.sky].map((col, i) => (
                    <div
                      key={i}
                      style={{
                        height: 4,
                        background: col,
                        borderRadius: 2,
                        marginBottom: 4,
                        width: `${85 - i * 18}%`,
                        opacity: 0.75,
                      }}
                    />
                  ))}
                  {/* Fake table */}
                  <div
                    style={{
                      marginTop: 6,
                      border: `1px solid ${theme.bd}`,
                      borderRadius: 3,
                      overflow: "hidden",
                    }}
                  >
                    {[theme.cream, "#fff", theme.cream].map((bg, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          gap: 2,
                          padding: "2px 4px",
                          background: i === 0 ? theme.p : bg,
                        }}
                      >
                        <div
                          style={{
                            flex: 2,
                            height: 3,
                            borderRadius: 1,
                            background:
                              i === 0
                                ? "rgba(255,255,255,0.7)"
                                : theme.mu + "44",
                          }}
                        />
                        <div
                          style={{
                            flex: 1,
                            height: 3,
                            borderRadius: 1,
                            background:
                              i === 0
                                ? "rgba(255,255,255,0.5)"
                                : theme.a + "66",
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Label */}
                <div style={{ padding: "10px 12px 12px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      marginBottom: 3,
                    }}
                  >
                    <span style={{ fontSize: 16 }}>{theme.emoji}</span>
                    <span
                      style={{
                        fontFamily: "system-ui,sans-serif",
                        fontWeight: 800,
                        fontSize: 13,
                        color: theme.p,
                      }}
                    >
                      {theme.name}
                    </span>
                    {isSelected && (
                      <span
                        style={{
                          marginLeft: "auto",
                          fontSize: 10,
                          fontWeight: 700,
                          background: theme.p,
                          color: "#fff",
                          padding: "2px 7px",
                          borderRadius: 99,
                        }}
                      >
                        ✓ Active
                      </span>
                    )}
                    {isCurrentGrade && !isSelected && (
                      <span
                        style={{
                          marginLeft: "auto",
                          fontSize: 10,
                          fontWeight: 700,
                          background: "#dbeafe",
                          color: "#1d4ed8",
                          padding: "2px 7px",
                          borderRadius: 99,
                        }}
                      >
                        Match
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: "#6b7280",
                      fontFamily: "system-ui,sans-serif",
                    }}
                  >
                    {theme.tagline}
                  </div>
                  {/* Color swatches */}
                  <div style={{ display: "flex", gap: 3, marginTop: 8 }}>
                    {colors.map((col, i) => (
                      <div
                        key={i}
                        style={{
                          width: 14,
                          height: 14,
                          borderRadius: 4,
                          background: col,
                          border: "1.5px solid rgba(0,0,0,0.1)",
                        }}
                      />
                    ))}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer with manual themes reminder */}
        <div
          style={{
            padding: "12px 24px",
            borderTop: "1px solid #e5e7eb",
            background: "#f9fafb",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderRadius: "0 0 16px 16px",
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 11, color: "#9ca3af" }}>
            Manual styles (Classic, Modern, Academic, Playful) are in the side
            panel
          </span>
          <button
            onClick={onClose}
            style={{
              padding: "7px 18px",
              background: "#1d3557",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const ActionToolbar = ({
  data,
  themeId,
  firebaseData,
  onSave,
  onNew,
  isSaving,
  savedStudentIds,
  activeStudentId,
}) => {
  const [pdfLoading, setPdfLoading] = useState(false);

  const handlePrint = async () => {
    const pages = document.querySelectorAll(".report-page");
    if (!pages.length) {
      window.print();
      return;
    }

    await loadScript(
      "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js",
    );

    const canvases = await Promise.all(
      [...pages].map((p) =>
        window.html2canvas(p, { scale: 2, backgroundColor: "#ffffff" }),
      ),
    );

    const printWindow = window.open("", "_blank");
    printWindow.document.write("<html><body style='margin:0'>");
    canvases.forEach((c) => {
      printWindow.document.write(
        `<img src="${c.toDataURL()}" style="width:100%;display:block;page-break-after:always"/>`,
      );
    });
    printWindow.document.write("</body></html>");
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const handleSaveAsPDF = async () => {
    setPdfLoading(true);
    try {
      await Promise.all([
        loadScript(
          "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js",
        ),
        loadScript(
          "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js",
        ),
      ]);
      const html2canvas = window.html2canvas;
      const { jsPDF } = window.jspdf;
      if (!html2canvas || !jsPDF) {
        window.print();
        return;
      }
      const pages = document.querySelectorAll(".report-page");
      if (!pages.length) {
        window.print();
        return;
      }
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      const A4_W = 210,
        A4_H = 297;
      for (let i = 0; i < pages.length; i++) {
        const canvas = await html2canvas(pages[i], {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
          width: pages[i].offsetWidth,
          height: pages[i].offsetHeight,
        });
        const imgData = canvas.toDataURL("image/jpeg", 0.95);
        const imgW = A4_W;
        const imgH = (canvas.height * A4_W) / canvas.width;
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, 0, imgW, Math.min(imgH, A4_H));
      }
      const filename =
        `${data.firstName || "Learner"}_${data.surname || ""}_Report_${data.schoolYear || "2026"}.pdf`.replace(
          /\s+/g,
          "_",
        );
      pdf.save(filename);
    } catch (err) {
      console.error("PDF generation failed:", err);
      window.print();
    } finally {
      setPdfLoading(false);
    }
  };

  const btnBase = {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 14px",
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
    fontFamily: "system-ui,sans-serif",
    fontSize: 13,
    fontWeight: 700,
    transition: "all 0.15s",
    flexShrink: 0,
  };

  return (
    <div
      className="no-print"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 14px",
        background: "#1d3557",
        borderBottom: "1px solid #0f2240",
        flexWrap: "wrap",
      }}
    >
      <span
        style={{
          color: "#a8dadc",
          fontSize: 12,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          marginRight: 4,
        }}
      >
        Report Actions
      </span>
      <button
        onClick={handlePrint}
        style={{ ...btnBase, background: "#fff", color: "#1d3557" }}
        title="Print report"
      >
        🖨️ Print
      </button>
      <button
        onClick={handleSaveAsPDF}
        disabled={pdfLoading}
        style={{
          ...btnBase,
          background: pdfLoading ? "#6c757d" : "#e63946",
          color: "#fff",
          opacity: pdfLoading ? 0.7 : 1,
        }}
      >
        {pdfLoading ? "⏳ Generating…" : "📄 Save as PDF"}
      </button>
      <button
        onClick={onSave}
        disabled={isSaving}
        style={{
          ...btnBase,
          background: isSaving ? "#6c757d" : "#2a9d8f",
          color: "#fff",
          opacity: isSaving ? 0.7 : 1,
        }}
      >
        {isSaving ? "⏳ Saving…" : "💾 Save Report"}
      </button>
      <button
        onClick={onNew}
        style={{ ...btnBase, background: "#f4a261", color: "#fff" }}
      >
        ✨ New Report
      </button>
      {activeStudentId && savedStudentIds.has(activeStudentId) && (
        <span
          style={{
            marginLeft: 8,
            padding: "4px 10px",
            background: "#dcfce7",
            color: "#15803d",
            borderRadius: 99,
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          ✓ Saved
        </span>
      )}
      <div style={{ flex: 1 }} />
      <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>
        {data.firstName
          ? `${data.firstName} ${data.surname}`
          : "No student selected"}{" "}
        · Theme: {THEMES[themeId]?.name}
      </span>
    </div>
  );
};

// ── INPUT SECTIONS ────────────────────────────────────────────────────────────
const SECTIONS = [
  {
    id: "learner",
    label: "Learner Details",
    icon: "👤",
    fields: [
      {
        key: "firstName",
        label: "First Name",
        placeholder: "e.g. Amahle",
        isName: true,
      },
      { key: "surname", label: "Surname", placeholder: "e.g. Dlamini" },
      {
        key: "dob",
        label: "Date of Birth",
        placeholder: "e.g. 14 March 2019",
        type: "text",
      },
      {
        key: "emisNo",
        label: "EMIS / Learner No.",
        placeholder: "e.g. 200-012345",
      },
      { key: "grade", label: "Grade", placeholder: "e.g. 1", type: "select" },
      { key: "classGrade", label: "Class Name", placeholder: "e.g. Grade 1B" },
    ],
  },
  {
    id: "school",
    label: "School & Staff",
    icon: "🏫",
    fields: [
      {
        key: "teacher",
        label: "Class Teacher",
        placeholder: "e.g. Mrs. Nkosi",
      },
      {
        key: "principal",
        label: "Principal",
        placeholder: "e.g. Mr. Van der Berg",
      },
      { key: "schoolYear", label: "School Year", placeholder: "e.g. 2026" },
      {
        key: "reportDate",
        label: "Report Date",
        placeholder: "e.g. 28 March 2026",
      },
      {
        key: "address",
        label: "School Address",
        placeholder: "e.g. Ext 36, Olivienhoutsbosch",
      },
    ],
  },
  {
    id: "comments",
    label: "Teacher Comments",
    icon: "💬",
    fields: [
      {
        key: "comments1",
        label: "Term 1 Comments",
        placeholder: "Write teacher comments for Term 1…",
        type: "textarea",
      },
      {
        key: "comments2",
        label: "Term 2 Comments",
        placeholder: "Write teacher comments for Term 2…",
        type: "textarea",
      },
      {
        key: "comments3",
        label: "Term 3 Comments",
        placeholder: "Write teacher comments for Term 3…",
        type: "textarea",
      },
      {
        key: "comments4",
        label: "Term 4 Comments",
        placeholder: "Write teacher comments for Term 4…",
        type: "textarea",
      },
    ],
  },
];

// ── NAME AUTOCOMPLETE INPUT ───────────────────────────────────────────────────
const NameAutocomplete = ({
  value,
  onChange,
  students,
  onStudentSelect,
  placeholder,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value || "");
  const ref = useRef(null);

  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  const filtered =
    query.length >= 1
      ? students
          .filter((s) =>
            String(s.name || "")
              .toLowerCase()
              .includes(query.toLowerCase()),
          )
          .slice(0, 8)
      : [];

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleChange = (e) => {
    setQuery(e.target.value);
    onChange(e.target.value);
    setOpen(true);
  };
  const handleSelect = (student) => {
    const parts = String(student.name || "")
      .trim()
      .split(/\s+/);
    setQuery(parts[0] || "");
    setOpen(false);
    onStudentSelect(student);
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <input
        type="text"
        value={query}
        onChange={handleChange}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: "6px 8px",
          fontSize: 12,
          border: "1px solid #ced4da",
          borderRadius: 6,
          outline: "none",
          fontFamily: "inherit",
          boxSizing: "border-box",
        }}
      />
      {open && filtered.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            zIndex: 1000,
            background: "#fff",
            border: "1px solid #ced4da",
            borderRadius: 6,
            boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
            maxHeight: 220,
            overflowY: "auto",
          }}
        >
          {filtered.map((s) => {
            const [bg, fg] = avatarColor(s.id || s.name);
            return (
              <button
                key={s.id}
                onMouseDown={() => handleSelect(s)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 10px",
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  borderBottom: "1px solid #f3f4f6",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#f0f9ff")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "none")
                }
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    background: bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                    fontWeight: 800,
                    color: fg,
                    flexShrink: 0,
                  }}
                >
                  {initials(s.name)}
                </div>
                <div>
                  <div
                    style={{ fontSize: 12, fontWeight: 600, color: "#111827" }}
                  >
                    {s.name}
                  </div>
                  <div style={{ fontSize: 10, color: "#9ca3af" }}>
                    {s.gradeLevel || "—"}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ── TEMPLATE THUMBNAIL ────────────────────────────────────────────────────────
const TemplateThumbnail = ({ theme, selected, onClick }) => (
  <button
    onClick={onClick}
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 5,
      padding: "8px 10px",
      borderRadius: 10,
      cursor: "pointer",
      flexShrink: 0,
      border: selected ? `2px solid ${theme.p}` : "2px solid transparent",
      background: selected ? theme.cream : "#f1f3f5",
      outline: "none",
      transition: "all 0.15s",
    }}
  >
    <div
      style={{
        width: 80,
        height: 90,
        borderRadius: 3,
        overflow: "hidden",
        border: `1.5px solid ${theme.bd}`,
        background: theme.cBg,
        display: "flex",
        flexDirection: "column",
        boxShadow: selected ? `0 2px 8px ${theme.p}33` : "none",
      }}
    >
      <div style={{ height: 7, background: theme.p }} />
      <div
        style={{
          flex: 1,
          padding: "2px 3px",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {[theme.a, theme.teal, theme.sky].map((c, i) => (
          <div
            key={i}
            style={{
              height: 3,
              background: c,
              borderRadius: 2,
              width: `${80 - i * 15}%`,
            }}
          />
        ))}
      </div>
      <div style={{ height: 5, background: theme.fBg }} />
    </div>
    <div
      style={{
        fontSize: 10,
        fontWeight: selected ? 700 : 400,
        color: selected ? theme.p : "#374151",
        whiteSpace: "nowrap",
        lineHeight: 1.2,
      }}
    >
      {theme.icon}
    </div>
    <div
      style={{
        fontSize: 9,
        fontWeight: selected ? 700 : 400,
        color: selected ? theme.p : "#6b7280",
        whiteSpace: "nowrap",
      }}
    >
      {theme.name.split(" ")[0]}
    </div>
  </button>
);

// ── STUDENT LIST PANEL ────────────────────────────────────────────────────────
const StudentListPanel = ({
  grade,
  students,
  loadingStudents,
  activeStudentId,
  onSelect,
  savedStudentIds,
}) => {
  const currentGrade = normaliseGrade(grade);
  const gradeStudents = currentGrade
    ? students.filter((s) => normaliseGrade(s.gradeLevel) === currentGrade)
    : students;
  const allGrades = [
    ...new Set(students.map((s) => normaliseGrade(s.gradeLevel))),
  ]
    .filter(Boolean)
    .sort((a, b) => {
      if (a === "R") return -1;
      if (b === "R") return 1;
      return (parseInt(a) || 0) - (parseInt(b) || 0);
    });

  return (
    <div
      id="student-list-panel"
      style={{
        width: 220,
        minWidth: 200,
        maxWidth: 240,
        display: "flex",
        flexDirection: "column",
        background: "#fff",
        borderLeft: "1px solid #e5e7eb",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          padding: "13px 14px 10px",
          borderBottom: "1px solid #e5e7eb",
          background: "#f9fafb",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 800,
            color: "#111827",
            textTransform: "uppercase",
            letterSpacing: "0.8px",
            marginBottom: 4,
          }}
        >
          🎓 Class List
        </div>
        {currentGrade ? (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#6366f1",
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: 12, fontWeight: 700, color: "#4f46e5" }}>
              Grade {currentGrade}
            </span>
            <span
              style={{ fontSize: 11, color: "#9ca3af", marginLeft: "auto" }}
            >
              {gradeStudents.length} learners
            </span>
          </div>
        ) : (
          <div style={{ fontSize: 11, color: "#9ca3af" }}>
            Enter a grade to filter
          </div>
        )}
      </div>
      {allGrades.length > 0 && (
        <div
          style={{
            padding: "8px 10px",
            borderBottom: "1px solid #f3f4f6",
            display: "flex",
            gap: 4,
            flexWrap: "wrap",
            flexShrink: 0,
            background: "#fafafa",
          }}
        >
          {allGrades.map((g) => (
            <span
              key={g}
              style={{
                fontSize: 10,
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: 99,
                background: currentGrade === g ? "#4f46e5" : "#ede9fe",
                color: currentGrade === g ? "#fff" : "#4f46e5",
              }}
            >
              Gr {g}
            </span>
          ))}
        </div>
      )}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {loadingStudents ? (
          <div style={{ padding: "24px 14px", textAlign: "center" }}>
            <div
              style={{
                width: 24,
                height: 24,
                border: "3px solid #e0e7ff",
                borderTop: "3px solid #4f46e5",
                borderRadius: "50%",
                margin: "0 auto 10px",
                animation: "spin 0.8s linear infinite",
              }}
            />
            <div style={{ fontSize: 11, color: "#9ca3af" }}>
              Loading learners…
            </div>
          </div>
        ) : gradeStudents.length === 0 ? (
          <div style={{ padding: "20px 14px", textAlign: "center" }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🏫</div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#6b7280",
                marginBottom: 4,
              }}
            >
              {currentGrade
                ? `No learners in Grade ${currentGrade}`
                : "No learners found"}
            </div>
          </div>
        ) : (
          gradeStudents.map((s, idx) => {
            const isActive = s.id === activeStudentId;
            const isSaved = savedStudentIds.has(s.id);
            const [bg, fg] = avatarColor(s.id || idx);
            return (
              <button
                key={s.id}
                onClick={() => onSelect(s)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "9px 12px",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  background: isActive ? "#eef2ff" : "transparent",
                  borderLeft: isActive
                    ? "3px solid #4f46e5"
                    : "3px solid transparent",
                  borderBottom: "1px solid #f3f4f6",
                  transition: "background 0.12s",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.background = "#f9fafb";
                }}
                onMouseLeave={(e) => {
                  if (!isActive)
                    e.currentTarget.style.background = "transparent";
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    background: bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 800,
                    color: fg,
                    flexShrink: 0,
                    border: isActive
                      ? `2px solid ${fg}33`
                      : "2px solid transparent",
                    position: "relative",
                  }}
                >
                  {initials(s.name)}
                  {isSaved && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: -3,
                        right: -3,
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        background: "#15803d",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 7,
                        color: "#fff",
                        border: "1.5px solid #fff",
                      }}
                    >
                      ✓
                    </div>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? "#1e1b4b" : "#111827",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {s.name}
                  </div>
                  <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 1 }}>
                    {s.gradeLevel || "—"}
                    {s.parentPhone ? ` · ${s.parentPhone}` : ""}
                    {isSaved && (
                      <span
                        style={{
                          marginLeft: 4,
                          color: "#15803d",
                          fontWeight: 700,
                        }}
                      >
                        · Saved ✓
                      </span>
                    )}
                  </div>
                </div>
                {isActive && (
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "#4f46e5",
                      flexShrink: 0,
                    }}
                  />
                )}
              </button>
            );
          })
        )}
      </div>
      <div
        style={{
          padding: "8px 12px",
          borderTop: "1px solid #e5e7eb",
          background: "#f9fafb",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ fontSize: 10, color: "#9ca3af" }}>
          {students.length} total learners
        </div>
        <div style={{ fontSize: 10, color: "#9ca3af" }}>Tap to auto-fill</div>
      </div>
    </div>
  );
};

const TemplateSelectorBar = ({ selected, onSelect, onGradeThemes }) => (
  <div
    className="no-print"
    id="theme-bar"
    style={{
      width: 100,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 4,
      padding: "10px 6px",
      background: "#cecece",
      borderRight: "1px solid #e5e7eb",
      borderLeft: "1px solid #e5e7eb",
      overflowY: "auto",
      flexShrink: 0,
    }}
  >
    <div
      style={{
        fontSize: 9,
        fontWeight: 800,
        color: "#9ca3af",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
        marginBottom: 6,
        textAlign: "center",
        lineHeight: 1.3,
      }}
    >
      Style
    </div>
    <button
      onClick={onGradeThemes}
      style={{
        width: "100%",
        padding: "6px 4px",
        borderRadius: 8,
        border: "2px solid #6366f1",
        background: "#eef2ff",
        color: "#4338ca",
        fontSize: 9,
        fontWeight: 800,
        cursor: "pointer",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
        marginBottom: 8,
        lineHeight: 1.3,
      }}
    >
      🎓
      <br />
      Grade
      <br />
      Themes
    </button>
    {Object.values(THEMES).map((theme) => (
      <TemplateThumbnail
        key={theme.id}
        theme={theme}
        selected={selected === theme.id}
        onClick={() => onSelect(theme.id)}
      />
    ))}
  </div>
);

// ── DATA STATUS INDICATOR ─────────────────────────────────────────────────────
const DataStatusBar = ({ loading, firebaseData, activeStudentId }) => {
  if (!activeStudentId) return null;
  const sources = [
    { label: "Profile", ok: true, icon: "👤" },
    {
      label: "Attendance",
      ok: (firebaseData?.studentAttendance?.length || 0) > 0,
      count: firebaseData?.studentAttendance?.length || 0,
      icon: "📅",
    },
    {
      label: "Fees",
      ok: !!firebaseData?.studentFees,
      count: firebaseData?.studentPayments?.length || 0,
      icon: "💰",
    },
    {
      label: "Marks",
      ok: (firebaseData?.markbookEntries?.length || 0) > 0,
      count: firebaseData?.markbookEntries?.length || 0,
      icon: "📊",
    },
    {
      label: "Behaviour",
      ok: true,
      count: firebaseData?.incidents?.length || 0,
      icon: "🛡",
    },
    {
      label: "Welfare",
      ok: true,
      count: firebaseData?.welfareFlags?.length || 0,
      icon: "🔒",
    },
  ];
  return (
    <div
      style={{
        padding: "8px 14px",
        borderTop: "1px solid #dee2e6",
        background: "#f8f9fa",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          fontSize: 9,
          fontWeight: 700,
          color: "#6c757d",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          marginBottom: 6,
        }}
      >
        {loading ? "⏳ Loading Firebase data…" : "✓ Data Sources"}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
        {sources.map((s) => (
          <div
            key={s.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 3,
              padding: "2px 7px",
              borderRadius: 99,
              fontSize: 9,
              fontWeight: 700,
              background: loading ? "#f1f3f5" : s.ok ? "#dcfce7" : "#fee2e2",
              color: loading ? "#9ca3af" : s.ok ? "#15803d" : "#dc2626",
            }}
          >
            <span>{s.icon}</span>
            <span>{s.label}</span>
            {s.count !== undefined && (
              <span style={{ opacity: 0.7 }}>({s.count})</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ── MOBILE BOTTOM TAB BAR ─────────────────────────────────────────────────────
const MobileTabBar = ({ activeTab, onChange, savedCount }) => {
  const tabs = [
    { id: "preview", label: "Preview", icon: "👁️" },
    { id: "inputs", label: "Edit", icon: "✏️" },
    {
      id: "classlist",
      label: "Class",
      icon: "👥",
      badge: savedCount > 0 ? savedCount : null,
    },
  ];
  return (
    <div
      id="mobile-tab-bar"
      className="no-print"
      style={{
        display: "none", // overridden by CSS on mobile
        position: "relative",
        zIndex: 200,
        background: "#fff",
        borderTop: "1px solid #e5e7eb",
        flexShrink: 0,
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 3,
              padding: "8px 0 10px",
              border: "none",
              cursor: "pointer",
              background: "transparent",
              color: isActive ? "#1d3557" : "#9ca3af",
              position: "relative",
              transition: "color 0.15s",
            }}
          >
            {/* Active indicator bar */}
            {isActive && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: "20%",
                  right: "20%",
                  height: 2,
                  background: "#1d3557",
                  borderRadius: "0 0 2px 2px",
                }}
              />
            )}
            <span style={{ fontSize: 20, lineHeight: 1 }}>{tab.icon}</span>
            <span
              style={{
                fontSize: 10,
                fontWeight: isActive ? 700 : 500,
                letterSpacing: "0.3px",
              }}
            >
              {tab.label}
            </span>
            {tab.badge && (
              <div
                style={{
                  position: "absolute",
                  top: 6,
                  right: "calc(50% - 18px)",
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  background: "#e63946",
                  color: "#fff",
                  fontSize: 9,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {tab.badge}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};

const ScaledReportContainer = ({ children }) => {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const PAGE_WIDTH = 794; // 210mm at 96dpi

    const updateScale = () => {
      if (!containerRef.current) return;
      const available = containerRef.current.offsetWidth - 16;
      const newScale = Math.min(1, available / PAGE_WIDTH);
      setScale(newScale);
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        flex: 1,
        padding: "0 8px",
        // Reserve vertical space so the scrollbar reflects actual content height
        minHeight: 0,
      }}
    >
      <div
        style={{
          transformOrigin: "top center",
          transform: `scale(${scale})`,
          // Compensate horizontal centering when scaled down
          marginLeft: scale < 1 ? `calc((${scale} - 1) * 397px)` : 0,
          // Collapse the extra vertical whitespace the scale creates
          marginBottom: scale < 1 ? `calc((${scale} - 1) * 100%)` : 0,
        }}
      >
        {children}
      </div>
    </div>
  );
};
export default function Reports() {
  const { user } = useAuth();
  const db = getFirestore();

  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [savedStudentIds, setSavedStudentIds] = useState(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [businessInfo, setBusinessInfo] = useState(null);
  const [businessName, setBusinessName] = useState("Solidflo Saas School");
  const [showGradeThemes, setShowGradeThemes] = useState(false);
  // Mobile tab state — "preview" | "inputs" | "classlist"
  const [mobileTab, setMobileTab] = useState("preview");

  useEffect(() => {
    const loadBusiness = async () => {
      if (!user?.uid) return;
      try {
        const snap = await getDoc(
          doc(db, "users", user.uid, "settings", "businessInfo"),
        );
        if (snap.exists()) {
          const biz = snap.data();
          setBusinessInfo(biz);
          if (biz.businessName) setBusinessName(biz.businessName);
        }
      } catch (err) {
        console.error("Failed to load business info", err);
      }
    };
    loadBusiness();
  }, [user?.uid]);

  useEffect(() => {
    const fetchStudents = async () => {
      if (!user?.uid) {
        setLoadingStudents(false);
        return;
      }
      try {
        const q = query(
          collection(db, "users", user.uid, "students"),
          orderBy("name"),
        );
        const snap = await getDocs(q);
        setStudents(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error("Reports: failed to load students", err);
      } finally {
        setLoadingStudents(false);
      }
    };
    fetchStudents();
  }, [user?.uid]);

  useEffect(() => {
    const fetchSavedReports = async () => {
      if (!user?.uid) return;
      try {
        const snap = await getDocs(
          collection(db, "users", user.uid, "savedReports"),
        );
        setSavedStudentIds(
          new Set(snap.docs.map((d) => d.data().studentId).filter(Boolean)),
        );
      } catch (_) {}
    };
    fetchSavedReports();
  }, [user?.uid]);

  const [firebaseData, setFirebaseData] = useState({});
  const [loadingFirebase, setLoadingFirebase] = useState(false);

  const fetchStudentFirebaseData = async (studentId, studentName) => {
    if (!user?.uid || !studentId) return;
    setLoadingFirebase(true);
    try {
      const attSnap = await getDocs(
        query(
          collection(db, "users", user.uid, "attendance"),
          orderBy("date", "desc"),
        ),
      );
      const allAttendance = attSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      const studentAttendance = allAttendance.filter(
        (r) => r.studentId === studentId || r.id?.startsWith(studentId),
      );

      const studentsSnap = await getDocs(
        collection(db, "users", user.uid, "students"),
      );
      const studentDoc = studentsSnap.docs.find((d) => d.id === studentId);
      const studentFees = studentDoc?.data()?.fees || null;

      const paymentsSnap = await getDocs(
        query(
          collection(db, "users", user.uid, "payments"),
          orderBy("createdAt", "desc"),
        ),
      );
      const studentPayments = paymentsSnap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter(
          (p) => p.studentId === studentId || p.studentName === studentName,
        );

      const incidentsSnap = await getDocs(
        query(
          collection(db, "users", user.uid, "incidents"),
          orderBy("createdAt", "desc"),
        ),
      );
      const incidents = incidentsSnap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter(
          (i) => i.studentId === studentId || i.studentName === studentName,
        );

      const welfareFlagsSnap = await getDocs(
        query(
          collection(db, "users", user.uid, "welfareFlags"),
          orderBy("createdAt", "desc"),
        ),
      );
      const welfareFlags = welfareFlagsSnap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter(
          (f) => f.studentId === studentId || f.studentName === studentName,
        );

      const markbookSnap = await getDocs(
        query(
          collection(db, "users", user.uid, "markbook"),
          orderBy("createdAt", "desc"),
        ),
      );
      const markbookEntries = markbookSnap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((e) => {
          const scores = e.scores || {};
          return (
            scores[studentName] !== undefined ||
            scores[studentName?.split(" ")[0]] !== undefined ||
            scores[studentId] !== undefined
          );
        });

      setFirebaseData({
        studentAttendance,
        studentFees,
        studentPayments,
        incidents,
        welfareFlags,
        markbookEntries,
      });
    } catch (err) {
      console.error("Reports: failed to load Firebase data for student", err);
    } finally {
      setLoadingFirebase(false);
    }
  };

  const [selected, setSelected] = useState("classic");
  const [activeSection, setActiveSection] = useState("learner");
  const [activeStudentId, setActiveStudentId] = useState(null);
  const [data, setData] = useState({
    firstName: "",
    surname: "",
    dob: "",
    emisNo: "",
    grade: "1",
    classGrade: "",
    teacher: "",
    principal: "",
    schoolYear: "2026",
    reportDate: "",
    address: "",
    parentName: "",
    parentPhone: "",
    parentEmail: "",
    allergies: "",
    medicalInfo: "",
    comments1: "",
    comments2: "",
    comments3: "",
    comments4: "",
  });

  useEffect(() => {
    const gradeKey = normaliseGrade(data.grade);
    if (gradeKey && GRADE_THEMES[gradeKey]) {
      setSelected(GRADE_THEMES[gradeKey].id);
    }
  }, [data.grade]);

  useEffect(() => {
    injectFonts();
    injectPrintStyles();
    injectResponsiveStyles();
  }, []);

  const update = (key, val) => setData((d) => ({ ...d, [key]: val }));

  const handleStudentSelect = (student) => {
    setActiveStudentId(student.id);
    const nameParts = String(student.name || "")
      .trim()
      .split(/\s+/);
    const firstName = nameParts[0] || "";
    const surname = nameParts.slice(1).join(" ") || "";
    const gradeRaw = normaliseGrade(student.gradeLevel);
    const fullName = `${firstName} ${surname}`.trim();
    setData((d) => ({
      ...d,
      firstName,
      surname,
      grade: gradeRaw || d.grade,
      classGrade: student.gradeLevel || d.classGrade,
      dob: student.dateOfBirth ? student.dateOfBirth : d.dob,
      emisNo: student.studentId || d.emisNo,
      parentName: student.parentName || d.parentName,
      parentPhone: student.parentPhone || d.parentPhone,
      parentEmail: student.parentEmail || d.parentEmail,
      allergies: student.allergies || d.allergies,
      medicalInfo:
        typeof student.medicalInfo === "string"
          ? student.medicalInfo
          : d.medicalInfo,
    }));
    setActiveSection("learner");
    fetchStudentFirebaseData(student.id, fullName);
    // Switch to preview after selecting a student on mobile
    setMobileTab("preview");
  };

  const handleSave = async () => {
    if (!user?.uid || !activeStudentId) return;
    setIsSaving(true);
    try {
      await setDoc(
        doc(db, "users", user.uid, "savedReports", activeStudentId),
        {
          studentId: activeStudentId,
          studentName: `${data.firstName} ${data.surname}`.trim(),
          themeId: selected,
          reportData: data,
          savedAt: new Date().toISOString(),
          schoolYear: data.schoolYear || "2026",
        },
      );
      setSavedStudentIds((prev) => new Set([...prev, activeStudentId]));
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleNew = () => {
    setActiveStudentId(null);
    setFirebaseData({});
    setData({
      firstName: "",
      surname: "",
      dob: "",
      emisNo: "",
      grade: "1",
      classGrade: "",
      teacher: "",
      principal: "",
      schoolYear: "2026",
      reportDate: "",
      address: "",
      parentName: "",
      parentPhone: "",
      parentEmail: "",
      allergies: "",
      medicalInfo: "",
      comments1: "",
      comments2: "",
      comments3: "",
      comments4: "",
    });
    setActiveSection("learner");
  };

  const currentSection = SECTIONS.find((s) => s.id === activeSection);
const ALL_GRADES = ["R", "1", "2", "3", "4", "5", "6", "7"];
  return (
    <>
      <div
        id="report-layout"
        style={{
          display: "flex",
          height: "100vh",
          fontFamily: "system-ui, sans-serif",
          background: "#e9ecef",
          overflow: "hidden",
          flexDirection: "row",
        }}
      >
        {/* ══ LEFT — INPUT PANEL ══════════════════════════════════════════════ */}
        <div
          id="left-panel"
          className={mobileTab === "inputs" ? "mobile-active" : ""}
          style={{
            width: 280,
            minWidth: 260,
            display: "flex",
            flexDirection: "column",
            background: "#fff",
            borderRight: "1px solid #dee2e6",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "10px 14px 8px",
              borderBottom: "1px solid #dee2e6",
              background: "#fff",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#1d3557",
                marginBottom: 2,
              }}
            >
              📝 Report Editor
            </div>
            <div style={{ fontSize: 10, color: "#6c757d" }}>
              Fill in details · preview updates live
            </div>
          </div>

          {/* Section tabs */}
          <div
            style={{
              display: "flex",
              borderBottom: "1px solid #dee2e6",
              background: "#f8f9fa",
              flexShrink: 0,
            }}
          >
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                style={{
                  flex: 1,
                  padding: "7px 2px",
                  fontSize: 9,
                  fontWeight: activeSection === s.id ? 700 : 400,
                  color: activeSection === s.id ? "#1d3557" : "#6c757d",
                  background: activeSection === s.id ? "#fff" : "transparent",
                  border: "none",
                  borderBottom:
                    activeSection === s.id
                      ? "2px solid #1d3557"
                      : "2px solid transparent",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <span style={{ fontSize: 12 }}>{s.icon}</span>
                <span style={{ lineHeight: 1.2, textAlign: "center" }}>
                  {s.label.split(" ").map((w, i) =>
                    i === 0 ? (
                      w
                    ) : (
                      <span key={i}>
                        <br />
                        {w}
                      </span>
                    ),
                  )}
                </span>
              </button>
            ))}
          </div>

          {/* Fields */}
          <div style={{ flex: 1, overflowY: "auto", padding: "10px 14px" }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#1d3557",
                marginBottom: 8,
              }}
            >
              {currentSection.icon} {currentSection.label}
            </div>
            {currentSection.fields.map((f) => (
              <div key={f.key} style={{ marginBottom: 10 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 10,
                    fontWeight: 600,
                    color: "#495057",
                    marginBottom: 3,
                    textTransform: "uppercase",
                    letterSpacing: "0.3px",
                  }}
                >
                  {f.label}
                </label>
                {f.isName ? (
                  <NameAutocomplete
                    value={data[f.key]}
                    onChange={(val) => update(f.key, val)}
                    students={students}
                    onStudentSelect={handleStudentSelect}
                    placeholder={f.placeholder}
                  />
                ) : f.type === "textarea" ? (
                  <textarea
                    value={data[f.key]}
                    onChange={(e) => update(f.key, e.target.value)}
                    placeholder={f.placeholder}
                    rows={3}
                    style={{
                      width: "100%",
                      padding: "6px 8px",
                      fontSize: 12,
                      border: "1px solid #ced4da",
                      borderRadius: 6,
                      outline: "none",
                      fontFamily: "inherit",
                      resize: "vertical",
                      boxSizing: "border-box",
                      lineHeight: 1.5,
                    }}
                  />
                ) : f.type === "select" ? (
                  <select
                    value={data[f.key] || ""}
                    onChange={(e) => update(f.key, e.target.value)}
                    style={{
                      width: "100%",
                      padding: "6px 8px",
                      fontSize: 12,
                      border: "1px solid #ced4da",
                      borderRadius: 6,
                      outline: "none",
                      fontFamily: "inherit",
                      boxSizing: "border-box",
                      background: "#fff",
                      cursor: "pointer",
                      color: data[f.key] ? "#212529" : "#9ca3af",
                    }}
                  >
                    <option value="">Select grade…</option>
                    {ALL_GRADES.map((g) => (
                      <option key={g} value={g}>
                        Grade {g}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={f.type || "text"}
                    value={data[f.key]}
                    onChange={(e) => update(f.key, e.target.value)}
                    placeholder={f.placeholder}
                    style={{
                      width: "100%",
                      padding: "6px 8px",
                      fontSize: 12,
                      border: "1px solid #ced4da",
                      borderRadius: 6,
                      outline: "none",
                      fontFamily: "inherit",
                      boxSizing: "border-box",
                    }}
                  />
                )}
              </div>
            ))}
            {activeStudentId && activeSection === "learner" && (
              <div
                style={{
                  marginTop: 10,
                  padding: "8px 10px",
                  background: "#f0f9ff",
                  borderRadius: 8,
                  border: "1px solid #bae6fd",
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#0369a1",
                    marginBottom: 4,
                    textTransform: "uppercase",
                  }}
                >
                  Auto-filled from Firebase
                </div>
                {[
                  ["Parent", data.parentName],
                  ["Phone", data.parentPhone],
                  ["Allergies", data.allergies],
                ]
                  .filter(([, v]) => v)
                  .map(([lbl, val]) => (
                    <div
                      key={lbl}
                      style={{
                        fontSize: 10,
                        color: "#0c4a6e",
                        marginBottom: 2,
                      }}
                    >
                      <strong>{lbl}:</strong> {val}
                    </div>
                  ))}
              </div>
            )}

            {/* Theme selector — shown inside inputs panel on mobile */}
            <div
              style={{
                marginTop: 16,
                borderTop: "1px solid #f3f4f6",
                paddingTop: 12,
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#6c757d",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  marginBottom: 8,
                }}
              >
                Report Style
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {Object.values(THEMES).map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setSelected(theme.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "6px 10px",
                      borderRadius: 8,
                      border: `2px solid ${selected === theme.id ? theme.p : "#e5e7eb"}`,
                      background:
                        selected === theme.id ? theme.cream : "#f9fafb",
                      cursor: "pointer",
                      fontSize: 11,
                      fontWeight: selected === theme.id ? 700 : 400,
                      color: selected === theme.id ? theme.p : "#374151",
                    }}
                  >
                    <span>{theme.icon}</span>
                    <span>{theme.name.split(" ")[0]}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DataStatusBar
            loading={loadingFirebase}
            firebaseData={firebaseData}
            activeStudentId={activeStudentId}
          />
          <div
            style={{
              padding: "6px 14px",
              borderTop: "1px solid #dee2e6",
              background: "#f8f9fa",
              fontSize: 9,
              color: "#6c757d",
              textAlign: "center",
              flexShrink: 0,
            }}
          >
            Changes appear instantly in the preview →
          </div>
        </div>

        {/* ══ CENTRE-LEFT — TEMPLATE STYLE PICKER (desktop only) ═════════════ */}
        <TemplateSelectorBar
          selected={selected}
          onSelect={setSelected}
          onGradeThemes={() => setShowGradeThemes(true)}
        />

        {/* ══ CENTRE — REPORT PREVIEW ═════════════════════════════════════════ */}

        <div
          id="report-preview"
          className={mobileTab === "preview" ? "mobile-active" : ""}
          style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            background: "#d4d8e0",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
          }}
        >
          <ActionToolbar
            data={data}
            themeId={selected}
            firebaseData={firebaseData}
            onSave={handleSave}
            onNew={handleNew}
            isSaving={isSaving}
            savedStudentIds={savedStudentIds}
            activeStudentId={activeStudentId}
          />

          {loadingFirebase && (
            <div
              style={{
                position: "absolute",
                top: 52,
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 100,
                background: "#1d3557",
                color: "#fff",
                padding: "8px 18px",
                borderRadius: 99,
                fontSize: 11,
                fontWeight: 700,
                boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <div
                style={{
                  width: 14,
                  height: 14,
                  border: "2px solid rgba(255,255,255,0.3)",
                  borderTop: "2px solid #fff",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                }}
              />
              Loading student data from Firebase…
            </div>
          )}

          <ScaledReportContainer>
            <Report
              themeId={selected}
              data={data}
              firebaseData={firebaseData}
              businessName={businessName}
              logoUrl={businessInfo?.logoUrl}
            />
          </ScaledReportContainer>
        </div>

        {/* ══ RIGHT — STUDENT LIST (desktop sidebar / mobile tab panel) ══════ */}
        <div
          id="student-list-panel"
          className={mobileTab === "classlist" ? "mobile-active" : ""}
          style={{
            width: 220,
            minWidth: 200,
            maxWidth: 240,
            display: "flex",
            flexDirection: "column",
            background: "#fff",
            borderLeft: "1px solid #e5e7eb",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          <StudentListPanel
            grade={data.grade}
            students={students}
            loadingStudents={loadingStudents}
            activeStudentId={activeStudentId}
            onSelect={handleStudentSelect}
            savedStudentIds={savedStudentIds}
          />
        </div>
      </div>

      {/* ══ MOBILE BOTTOM TAB BAR ═══════════════════════════════════════════ */}
      <MobileTabBar
        activeTab={mobileTab}
        onChange={setMobileTab}
        savedCount={savedStudentIds.size}
      />
      {showGradeThemes && (
        <GradeThemePage
          currentGrade={normaliseGrade(data.grade)}
          selected={selected}
          onSelect={setSelected}
          onClose={() => setShowGradeThemes(false)}
        />
      )}
      <style>{`
        @media print {
          #mobile-tab-bar { display: none !important; }
          body > * { display: none !important; }
          #report-preview { display: block !important; position: static !important; overflow: visible !important; background: white !important; }
          .no-print, #left-panel, #theme-bar, #student-list-panel { display: none !important; }
          .report-page { box-shadow: none !important; margin: 0 !important; page-break-after: always !important; }
        }
      `}</style>
    </>
  );
}
