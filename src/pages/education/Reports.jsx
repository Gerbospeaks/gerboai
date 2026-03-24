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

// ── PRINT STYLES (injected once) ───────────────────────────────────────────
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

      /* Preview: shown by default */
      #report-preview {
        display: none !important;
        flex: 1 !important;
        overflow-y: auto !important;
        overflow-x: auto !important;
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
        width: 100% !important;
        min-width: 320px !important;
        min-height: unset !important;
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

// ── REPORT PAGE COMPONENTS ────────────────────────────────────────────────────
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

const TERM_DATA = [
  {
    num: 1,
    period: "January – March 2026",
    lang: [
      "Listens attentively and follows oral instructions",
      "Speaks clearly and communicates ideas in sentences",
      "Recognises letters of the alphabet (upper & lower case)",
      "Identifies initial sounds and blends (phonics)",
      "Reads simple CVC words and sight words",
      "Shows comprehension of short texts/stories",
      "Writes letters and simple words legibly",
      "Copies from the board with accuracy",
    ],
    math: [
      "Counts to 20 and beyond (number concept)",
      "Recognises and writes numbers 1–20",
      "Solves addition and subtraction to 10",
      "Understands more/less, before/after, between",
      "Identifies 2D shapes (circle, square, triangle, rectangle)",
      "Understands patterns and completes sequences",
      "Uses measurement concepts (long/short, heavy/light)",
    ],
    life: [
      "Beginning Knowledge (self & environment)",
      "Creative Arts — participates in art/music",
      "Physical Education — gross motor skills",
      "Personal & Social Well-being",
    ],
    side: {
      title: "Social Development",
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
    period: "April – June 2026",
    lang: [
      "Listens and follows two-step oral instructions",
      "Retells a story in sequence using key vocabulary",
      "Blends and segments sounds (CVC & CCVC words)",
      "Reads decodable texts with growing fluency",
      "Demonstrates reading comprehension (answers questions)",
      "Writes simple sentences independently",
      "Uses capital letters and full stops correctly",
      "Spells common sight words correctly",
    ],
    math: [
      "Number concept and counting to 50",
      "Addition and subtraction within 20",
      "Skip counting (2s, 5s, 10s)",
      "Place value: tens and units",
      "3D objects: sphere, cube, cylinder, cone",
      "Symmetry and position (left/right/inside/outside)",
      "Data handling: simple picture graphs",
    ],
    life: [
      "My community and cultural awareness",
      "Creative Arts — drawing/craft/movement",
      "Physical Education — co-ordination & games",
      "Health and hygiene habits",
    ],
    side: {
      title: "Fine Motor & Handwriting",
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
    period: "July – September 2026",
    lang: [
      "Listens critically and responds to discussions",
      "Speaks in complete sentences; uses descriptive language",
      "Reads levelled readers with expression and fluency",
      "Reads and understands instructions and labels",
      "Shows comprehension: main idea, characters, sequence",
      "Writes a short paragraph (3–5 sentences)",
      "Uses punctuation: capital letters, full stops, question marks",
      "Spells words correctly from word lists",
    ],
    math: [
      "Number concept to 75",
      "Addition and subtraction within 30",
      "Repeated addition as introduction to multiplication",
      "Fractions: halves and quarters of shapes/groups",
      "Length, mass and capacity (non-standard units)",
      "Time: days, months, o'clock and half past",
      "Money: identifies coins and notes",
    ],
    life: [
      "Natural environment and weather/seasons",
      "Creative Arts — music, drama, visual arts",
      "Physical Education — ball skills & team games",
      "Social well-being and responsible choices",
    ],
    side: {
      title: "Cognitive Development",
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
    period: "October – December 2026",
    lang: [
      "Listens and responds appropriately to a range of texts",
      "Speaks with confidence in group and class discussions",
      "Reads independently with fluency and expression",
      "Demonstrates strong reading comprehension skills",
      "Writes a short creative or factual text",
      "Uses correct grammar, punctuation and spelling",
      "Shows growth in vocabulary and word recognition",
    ],
    math: [
      "Number concept to 100",
      "Addition and subtraction within 50",
      "Grouping and sharing (division concept)",
      "Shapes, patterns and symmetry",
      "Time, money and measurement",
      "Data: collect, sort and represent data",
    ],
    life: [
      "Heritage, culture and society",
      "Creative Arts — end-of-year performance/project",
      "Physical Education — fitness and sport participation",
    ],
    side: null,
  },
];

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
          width: 80,
          height: 80,
          borderRadius: t.id === "playful" ? 20 : 12,
          background:
            t.id === "professional"
              ? "#f3f4f6"
              : `linear-gradient(135deg,${t.p},${t.sky})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 38,
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
        }}
      >
        🏫
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
  return (
    <PageShell t={t}>
      <TermBanner t={t} termNum={td.num} period={td.period} />
      <SecTitle t={t} col={t.p}>
        Home Language
      </SecTitle>
      <RTable
        t={t}
        cols={[{ label: "Skill / Outcome" }, { label: "Mark", w: "12%" }]}
        rows={[
          ...td.lang.map((s) => [s, ""]),
          [
            { v: "Home Language Overall Mark (1–7)", bold: true, total: true },
            { v: "", bold: true, total: true },
          ],
        ]}
      />
      <div style={{ display: "flex", gap: "4mm", marginTop: "2mm" }}>
        <div style={{ flex: 1 }}>
          <SecTitle t={t} col={t.teal}>
            Mathematics
          </SecTitle>
          <RTable
            t={t}
            cols={[{ label: "Outcome" }, { label: "Mark", w: "15%" }]}
            rows={[
              ...td.math.map((s) => [s, ""]),
              [
                { v: "Mathematics Overall (1–7)", bold: true, total: true },
                { v: "", bold: true, total: true },
              ],
            ]}
          />
          {isT4 && (
            <>
              <SecTitle t={t} col={t.sky}>
                Life Skills
              </SecTitle>
              <RTable
                t={t}
                cols={[{ label: "Outcome" }, { label: "Mark", w: "15%" }]}
                rows={[
                  ...td.life.map((s) => [s, ""]),
                  [
                    { v: "Life Skills Overall (1–7)", bold: true, total: true },
                    { v: "", bold: true, total: true },
                  ],
                ]}
              />
            </>
          )}
        </div>
        <div style={{ flex: 1 }}>
          {!isT4 && (
            <>
              <SecTitle t={t} col={t.sky}>
                Life Skills
              </SecTitle>
              <RTable
                t={t}
                cols={[{ label: "Outcome" }, { label: "Mark", w: "15%" }]}
                rows={[
                  ...td.life.map((s) => [s, ""]),
                  [
                    { v: "Life Skills Overall (1–7)", bold: true, total: true },
                    { v: "", bold: true, total: true },
                  ],
                ]}
              />
            </>
          )}
          {td.side && (
            <>
              <SecTitle t={t} col={t.a}>
                {td.side.title}
              </SecTitle>
              <RTable
                t={t}
                cols={[{ label: "Skill" }, { label: "E/M/D/B", w: "15%" }]}
                rows={td.side.items.map((s) => [s, ""])}
              />
            </>
          )}
          {isT4 && (
            <>
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
                rows={[
                  ["Home Language", "", "", "", "", { v: "", total: true }],
                  ["Add. Language", "", "", "", "", { v: "", total: true }],
                  ["Mathematics", "", "", "", "", { v: "", total: true }],
                  ["Life Skills", "", "", "", "", { v: "", total: true }],
                ]}
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
                    ["☐ Promoted to Grade 2", t.teal],
                    ["☐ Retained in Grade 1", t.a],
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
            </>
          )}
        </div>
      </div>
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
              {data.grade || "1"} Progress Report {data.schoolYear || "2026"}
            </p>
          </div>
        )}
      </div>
    </PageShell>
  );
};

// ── FULL REPORT ───────────────────────────────────────────────────────────────
const Report = ({ themeId, data, firebaseData, businessName, logoUrl }) => {
  const t = THEMES[themeId];
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
      {TERM_DATA.map((td) => (
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

// ── ACTION TOOLBAR ────────────────────────────────────────────────────────────
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

  const handlePrint = () => window.print();

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
      { key: "grade", label: "Grade", placeholder: "e.g. 1" },
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

const TemplateSelectorBar = ({ selected, onSelect }) => (
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

// ── MAIN EXPORT ───────────────────────────────────────────────────────────────
export default function Reports() {
  const { user } = useAuth();
  const db = getFirestore();

  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [savedStudentIds, setSavedStudentIds] = useState(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [businessInfo, setBusinessInfo] = useState(null);
  const [businessName, setBusinessName] = useState("Solidflo Saas School");

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
        <TemplateSelectorBar selected={selected} onSelect={setSelected} />

        {/* ══ CENTRE — REPORT PREVIEW ═════════════════════════════════════════ */}
        <div
          id="report-preview"
          className={mobileTab === "preview" ? "mobile-active" : ""}
          style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "auto",
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

          <div style={{ flex: 1 }}>
            <Report
              themeId={selected}
              data={data}
              firebaseData={firebaseData}
              businessName={businessName}
              logoUrl={businessInfo?.logoUrl}
            />
          </div>
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
