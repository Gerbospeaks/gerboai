import React, { useState } from "react";
import {
  BookOpen,
  Download,
  Search,
  FileText,
  BookMarked,
  Book,
  Layers,
  Clock,
  X,
  Library,
  Grid3X3,
  List,
  Eye,
  GraduationCap,
  BookCheck,
} from "lucide-react";

// ─── CONFIG ───────────────────────────────────────────────────────────────────
// 1. Enable "Public Access" on your R2 bucket in the Cloudflare dashboard
// 2. Paste your bucket's public URL below (no trailing slash)
const R2_PUBLIC_URL = "https://pub-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX.r2.dev";

// ─── GRADES ───────────────────────────────────────────────────────────────────
const GRADES = [
  {
    id: "grade-r",
    label: "Grade R",
    folder: "grade-r",
    emoji: "🌱",
    color: "#f59e0b",
    bg: "#fffbeb",
  },
  {
    id: "grade-0",
    label: "Grade 0",
    folder: "grade-0",
    emoji: "🌿",
    color: "#10b981",
    bg: "#f0fdf4",
  },
  {
    id: "grade-1",
    label: "Grade 1",
    folder: "grade-1",
    emoji: "⭐",
    color: "#6366f1",
    bg: "#eef2ff",
  },
  {
    id: "grade-2",
    label: "Grade 2",
    folder: "grade-2",
    emoji: "🔷",
    color: "#3b82f6",
    bg: "#eff6ff",
  },
  {
    id: "grade-3",
    label: "Grade 3",
    folder: "grade-3",
    emoji: "🟣",
    color: "#8b5cf6",
    bg: "#f5f3ff",
  },
  {
    id: "grade-4",
    label: "Grade 4",
    folder: "grade-4",
    emoji: "🔴",
    color: "#ef4444",
    bg: "#fff1f2",
  },
  {
    id: "grade-5",
    label: "Grade 5",
    folder: "grade-5",
    emoji: "🟠",
    color: "#f97316",
    bg: "#fff7ed",
  },
  {
    id: "grade-6",
    label: "Grade 6",
    folder: "grade-6",
    emoji: "🟤",
    color: "#b45309",
    bg: "#fef3c7",
  },
  {
    id: "grade-7",
    label: "Grade 7",
    folder: "grade-7",
    emoji: "🎓",
    color: "#0f172a",
    bg: "#f8fafc",
  },
];

// ─── SUBJECT STYLES ───────────────────────────────────────────────────────────
const SUBJECT_STYLES = {
  Mathematics: { bg: "#eef2ff", color: "#4f46e5" },
  English: { bg: "#eff6ff", color: "#2563eb" },
  Afrikaans: { bg: "#f0fdf4", color: "#16a34a" },
  "Natural Science": { bg: "#f0f9ff", color: "#0284c7" },
  "Social Studies": { bg: "#fffbeb", color: "#b45309" },
  "Life Skills": { bg: "#fdf4ff", color: "#9333ea" },
  Technology: { bg: "#f5f3ff", color: "#7c3aed" },
  "Art & Craft": { bg: "#fff7ed", color: "#ea580c" },
  Music: { bg: "#fdf4ff", color: "#a21caf" },
  "Physical Education": { bg: "#f0fdf4", color: "#15803d" },
  Reading: { bg: "#eff6ff", color: "#1d4ed8" },
  Writing: { bg: "#fef9c3", color: "#a16207" },
  "All Subjects": { bg: "#f8fafc", color: "#475569" },
};
const ss = (subject) =>
  SUBJECT_STYLES[subject] || { bg: "#f1f5f9", color: "#475569" };

// ─── UTILS ────────────────────────────────────────────────────────────────────
const formatSize = (bytes) => {
  if (!bytes) return null;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
};
const formatDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("en-ZA", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

const fileIcon = (key = "") => {
  const ext = key.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return FileText;
  if (ext === "docx") return BookOpen;
  if (ext === "pptx") return Layers;
  return BookMarked;
};

// ═══════════════════════════════════════════════════════════════════════════════
// MANIFEST  ← Add your R2 files here after uploading
// ───────────────────────────────────────────────────────────────────────────────
// key      : R2 object path  e.g. "grade-1/maths-term1.pdf"
// name     : display name shown to students
// subject  : must match a key in SUBJECT_STYLES (or add a new one)
// type     : Workbook | Worksheet | Assessment | Activity Book | Reading Book | Exam Paper
// size     : bytes (optional but nice)
// uploaded : ISO date string (optional)
// term     : "Term 1" … "Term 4" (optional)
// year     : "2026" (optional)
// ═══════════════════════════════════════════════════════════════════════════════
const MANIFEST = {
  "grade-r": [
    {
      key: "grade-r/phonics-workbook-term1.pdf",
      name: "Phonics Workbook – Term 1",
      subject: "Reading",
      type: "Workbook",
      size: 2100000,
      uploaded: "2026-01-15",
      term: "Term 1",
      year: "2026",
    },
    {
      key: "grade-r/numbers-1-10-activity.pdf",
      name: "Numbers 1–10 Activity Book",
      subject: "Mathematics",
      type: "Activity Book",
      size: 1450000,
      uploaded: "2026-01-20",
      term: "Term 1",
      year: "2026",
    },
    {
      key: "grade-r/shapes-colours-worksheet.pdf",
      name: "Shapes & Colours Worksheet",
      subject: "Art & Craft",
      type: "Worksheet",
      size: 890000,
      uploaded: "2026-02-01",
      term: "Term 1",
      year: "2026",
    },
    {
      key: "grade-r/life-skills-gr-r.pdf",
      name: "Life Skills Grade R",
      subject: "Life Skills",
      type: "Workbook",
      size: 1200000,
      uploaded: "2026-02-10",
      term: "Term 1",
      year: "2026",
    },
  ],
  "grade-0": [
    {
      key: "grade-0/foundation-maths-t1.pdf",
      name: "Foundation Maths – Term 1",
      subject: "Mathematics",
      type: "Workbook",
      size: 1800000,
      uploaded: "2026-01-14",
      term: "Term 1",
      year: "2026",
    },
    {
      key: "grade-0/early-reading-grade0.pdf",
      name: "Early Reading Book",
      subject: "Reading",
      type: "Reading Book",
      size: 1300000,
      uploaded: "2026-01-22",
      term: "Term 1",
      year: "2026",
    },
  ],
  "grade-1": [
    {
      key: "grade-1/maths-term1-workbook.pdf",
      name: "Maths Term 1 Workbook",
      subject: "Mathematics",
      type: "Workbook",
      size: 3200000,
      uploaded: "2026-01-10",
      term: "Term 1",
      year: "2026",
    },
    {
      key: "grade-1/english-reading-book.pdf",
      name: "English Reading Book",
      subject: "English",
      type: "Reading Book",
      size: 2800000,
      uploaded: "2026-01-12",
      term: "Term 1",
      year: "2026",
    },
    {
      key: "grade-1/afrikaans-oefenboek.pdf",
      name: "Afrikaans Oefenboek",
      subject: "Afrikaans",
      type: "Workbook",
      size: 2600000,
      uploaded: "2026-01-18",
      term: "Term 1",
      year: "2026",
    },
    {
      key: "grade-1/life-skills-t1.pdf",
      name: "Life Skills – Term 1",
      subject: "Life Skills",
      type: "Workbook",
      size: 1900000,
      uploaded: "2026-02-03",
      term: "Term 1",
      year: "2026",
    },
  ],
  "grade-2": [
    {
      key: "grade-2/maths-workbook-2026.pdf",
      name: "Mathematics Workbook 2026",
      subject: "Mathematics",
      type: "Workbook",
      size: 4100000,
      uploaded: "2026-01-09",
      term: "Term 1",
      year: "2026",
    },
    {
      key: "grade-2/english-worksheet-pack.pdf",
      name: "English Worksheet Pack",
      subject: "English",
      type: "Worksheet",
      size: 1700000,
      uploaded: "2026-01-22",
      term: "Term 1",
      year: "2026",
    },
    {
      key: "grade-2/natural-science-t1.pdf",
      name: "Natural Science – Term 1",
      subject: "Natural Science",
      type: "Workbook",
      size: 2200000,
      uploaded: "2026-02-10",
      term: "Term 1",
      year: "2026",
    },
    {
      key: "grade-2/afrikaans-gr2.pdf",
      name: "Afrikaans Graad 2",
      subject: "Afrikaans",
      type: "Workbook",
      size: 2400000,
      uploaded: "2026-02-14",
      term: "Term 1",
      year: "2026",
    },
  ],
  "grade-3": [
    {
      key: "grade-3/maths-grade3-workbook.pdf",
      name: "Grade 3 Maths Workbook",
      subject: "Mathematics",
      type: "Workbook",
      size: 4800000,
      uploaded: "2026-01-08",
      term: "Term 1",
      year: "2026",
    },
    {
      key: "grade-3/english-comprehension.pdf",
      name: "English Comprehension Pack",
      subject: "English",
      type: "Worksheet",
      size: 2300000,
      uploaded: "2026-01-25",
      term: "Term 1",
      year: "2026",
    },
    {
      key: "grade-3/social-studies-gr3.pdf",
      name: "Social Studies Grade 3",
      subject: "Social Studies",
      type: "Workbook",
      size: 3100000,
      uploaded: "2026-02-15",
      term: "Term 1",
      year: "2026",
    },
    {
      key: "grade-3/technology-workbook.pdf",
      name: "Technology Workbook",
      subject: "Technology",
      type: "Workbook",
      size: 2700000,
      uploaded: "2026-02-20",
      term: "Term 1",
      year: "2026",
    },
  ],
  "grade-4": [
    {
      key: "grade-4/maths-term1-gr4.pdf",
      name: "Maths – Term 1",
      subject: "Mathematics",
      type: "Workbook",
      size: 5200000,
      uploaded: "2026-01-07",
      term: "Term 1",
      year: "2026",
    },
    {
      key: "grade-4/english-grammar-gr4.pdf",
      name: "English Grammar Workbook",
      subject: "English",
      type: "Workbook",
      size: 3400000,
      uploaded: "2026-01-20",
      term: "Term 1",
      year: "2026",
    },
    {
      key: "grade-4/natural-science-gr4.pdf",
      name: "Natural Science Grade 4",
      subject: "Natural Science",
      type: "Workbook",
      size: 3800000,
      uploaded: "2026-02-08",
      term: "Term 1",
      year: "2026",
    },
    {
      key: "grade-4/social-studies-gr4.pdf",
      name: "Social Studies Grade 4",
      subject: "Social Studies",
      type: "Workbook",
      size: 2900000,
      uploaded: "2026-02-18",
      term: "Term 1",
      year: "2026",
    },
  ],
  "grade-5": [
    {
      key: "grade-5/maths-workbook-gr5.pdf",
      name: "Mathematics – Grade 5",
      subject: "Mathematics",
      type: "Workbook",
      size: 5600000,
      uploaded: "2026-01-06",
      term: "Term 1",
      year: "2026",
    },
    {
      key: "grade-5/english-essay-pack.pdf",
      name: "English Essay & Writing",
      subject: "English",
      type: "Workbook",
      size: 2900000,
      uploaded: "2026-01-19",
      term: "Term 1",
      year: "2026",
    },
    {
      key: "grade-5/afrikaans-gr5.pdf",
      name: "Afrikaans – Graad 5",
      subject: "Afrikaans",
      type: "Workbook",
      size: 3200000,
      uploaded: "2026-02-12",
      term: "Term 1",
      year: "2026",
    },
    {
      key: "grade-5/exam-papers-t1.pdf",
      name: "Term 1 Exam Papers",
      subject: "All Subjects",
      type: "Exam Paper",
      size: 4100000,
      uploaded: "2026-03-01",
      term: "Term 1",
      year: "2026",
    },
  ],
  "grade-6": [
    {
      key: "grade-6/maths-gr6-workbook.pdf",
      name: "Mathematics – Grade 6",
      subject: "Mathematics",
      type: "Workbook",
      size: 6100000,
      uploaded: "2026-01-05",
      term: "Term 1",
      year: "2026",
    },
    {
      key: "grade-6/english-lit-gr6.pdf",
      name: "English Literature & Language",
      subject: "English",
      type: "Workbook",
      size: 4200000,
      uploaded: "2026-01-18",
      term: "Term 1",
      year: "2026",
    },
    {
      key: "grade-6/natural-science-gr6.pdf",
      name: "Natural Science – Grade 6",
      subject: "Natural Science",
      type: "Workbook",
      size: 4500000,
      uploaded: "2026-02-06",
      term: "Term 1",
      year: "2026",
    },
    {
      key: "grade-6/social-studies-gr6.pdf",
      name: "Social Studies – Grade 6",
      subject: "Social Studies",
      type: "Workbook",
      size: 3700000,
      uploaded: "2026-02-18",
      term: "Term 1",
      year: "2026",
    },
  ],
  "grade-7": [
    {
      key: "grade-7/maths-gr7-workbook.pdf",
      name: "Mathematics – Grade 7",
      subject: "Mathematics",
      type: "Workbook",
      size: 6800000,
      uploaded: "2026-01-04",
      term: "Term 1",
      year: "2026",
    },
    {
      key: "grade-7/english-gr7-complete.pdf",
      name: "English Complete Workbook",
      subject: "English",
      type: "Workbook",
      size: 5100000,
      uploaded: "2026-01-17",
      term: "Term 1",
      year: "2026",
    },
    {
      key: "grade-7/natural-science-gr7.pdf",
      name: "Natural Science – Grade 7",
      subject: "Natural Science",
      type: "Workbook",
      size: 5300000,
      uploaded: "2026-02-05",
      term: "Term 1",
      year: "2026",
    },
    {
      key: "grade-7/social-studies-gr7.pdf",
      name: "Social Studies – Grade 7",
      subject: "Social Studies",
      type: "Workbook",
      size: 4400000,
      uploaded: "2026-02-17",
      term: "Term 1",
      year: "2026",
    },
    {
      key: "grade-7/exam-papers-gr7-2026.pdf",
      name: "Grade 7 Exam Papers 2026",
      subject: "All Subjects",
      type: "Exam Paper",
      size: 6200000,
      uploaded: "2026-03-05",
      term: "Term 1",
      year: "2026",
    },
  ],
};

// ─── INLINE PDF VIEWER MODAL ─────────────────────────────────────────────────
const ViewerModal = ({ book, onClose }) => {
  const url = `${R2_PUBLIC_URL}/${book.key}`;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.8)",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "11px 18px",
          background: "#0f172a",
          flexShrink: 0,
        }}
      >
        <BookOpen style={{ width: 17, height: 17, color: "#818cf8" }} />
        <div
          style={{
            flex: 1,
            fontSize: 13.5,
            fontWeight: 700,
            color: "#fff",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {book.name}
        </div>
        <a
          href={url}
          download={book.key.split("/").pop()}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            background: "#4f46e5",
            color: "#fff",
            padding: "7px 14px",
            borderRadius: 9,
            textDecoration: "none",
            fontSize: 12,
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          <Download style={{ width: 12, height: 12 }} /> Download
        </a>
        <button
          onClick={onClose}
          style={{
            background: "rgba(255,255,255,.1)",
            border: "none",
            borderRadius: 8,
            padding: 7,
            cursor: "pointer",
            color: "#fff",
            display: "flex",
            flexShrink: 0,
          }}
        >
          <X style={{ width: 16, height: 16 }} />
        </button>
      </div>
      {/* Viewer */}
      <iframe
        src={url}
        title={book.name}
        style={{ flex: 1, border: "none", background: "#1e293b" }}
      />
    </div>
  );
};

// ─── BOOK CARD — GRID ────────────────────────────────────────────────────────
const GridCard = ({ book, gradeColor, onView }) => {
  const [hov, setHov] = useState(false);
  const Icon = fileIcon(book.key);
  const style = ss(book.subject);
  const url = `${R2_PUBLIC_URL}/${book.key}`;

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: "#fff",
        borderRadius: 18,
        border: `1.5px solid ${hov ? gradeColor + "55" : "#f1f5f9"}`,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: "all .18s",
        transform: hov ? "translateY(-3px)" : "translateY(0)",
        boxShadow: hov ? `0 10px 28px ${gradeColor}14` : "none",
      }}
    >
      {/* Gradient stripe */}
      <div
        style={{
          height: 5,
          background: `linear-gradient(90deg, ${gradeColor}, ${style.color})`,
        }}
      />

      <div
        style={{
          padding: "15px 15px 14px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Icon + type */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: 11,
          }}
        >
          <div
            style={{
              width: 43,
              height: 43,
              background: style.bg,
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon style={{ width: 19, height: 19, color: style.color }} />
          </div>
          <span
            style={{
              fontSize: 10,
              fontWeight: 800,
              background: style.bg,
              color: style.color,
              padding: "3px 8px",
              borderRadius: 99,
            }}
          >
            {book.type}
          </span>
        </div>

        {/* Name */}
        <div
          style={{
            fontSize: 13.5,
            fontWeight: 800,
            color: "#0f172a",
            lineHeight: 1.35,
            marginBottom: 7,
            flex: 1,
          }}
        >
          {book.name}
        </div>

        {/* Subject */}
        <span
          style={{
            display: "inline-flex",
            alignSelf: "flex-start",
            fontSize: 11,
            fontWeight: 600,
            background: style.bg,
            color: style.color,
            padding: "3px 10px",
            borderRadius: 99,
            marginBottom: 12,
          }}
        >
          {book.subject}
        </span>

        {/* Meta */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 11,
            color: "#94a3b8",
            paddingTop: 10,
            borderTop: "1px solid #f8fafc",
            marginBottom: 12,
          }}
        >
          {book.term && <span>{book.term}</span>}
          {book.term && book.size && <span>·</span>}
          {book.size && <span>{formatSize(book.size)}</span>}
          {book.uploaded && (
            <span
              style={{
                marginLeft: "auto",
                display: "flex",
                alignItems: "center",
                gap: 3,
              }}
            >
              <Clock style={{ width: 9, height: 9 }} />{" "}
              {formatDate(book.uploaded)}
            </span>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 7 }}>
          <button
            onClick={() => onView(book)}
            style={{
              flex: 1,
              background: "#f1f5f9",
              color: "#374151",
              border: "none",
              borderRadius: 10,
              padding: "8px",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 5,
            }}
          >
            <Eye style={{ width: 12, height: 12 }} /> View
          </button>
          <a
            href={url}
            download={book.key.split("/").pop()}
            style={{
              flex: 1,
              background: "#4f46e5",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              padding: "8px",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 5,
              textDecoration: "none",
            }}
          >
            <Download style={{ width: 12, height: 12 }} /> Download
          </a>
        </div>
      </div>
    </div>
  );
};

// ─── BOOK CARD — LIST ────────────────────────────────────────────────────────
const ListCard = ({ book, gradeColor, onView }) => {
  const [hov, setHov] = useState(false);
  const Icon = fileIcon(book.key);
  const style = ss(book.subject);
  const url = `${R2_PUBLIC_URL}/${book.key}`;

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "13px 18px",
        background: hov ? "#fafbff" : "#fff",
        borderRadius: 14,
        border: `1.5px solid ${hov ? "#c7d2fe" : "#f1f5f9"}`,
        marginBottom: 8,
        transition: "all .15s",
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          background: style.bg,
          borderRadius: 11,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon style={{ width: 17, height: 17, color: style.color }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13.5,
            fontWeight: 700,
            color: "#0f172a",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {book.name}
        </div>
        <div
          style={{
            display: "flex",
            gap: 7,
            alignItems: "center",
            marginTop: 3,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              background: style.bg,
              color: style.color,
              padding: "2px 8px",
              borderRadius: 99,
            }}
          >
            {book.subject}
          </span>
          <span style={{ fontSize: 11, color: "#94a3b8" }}>{book.type}</span>
          {book.term && (
            <span style={{ fontSize: 11, color: "#94a3b8" }}>
              · {book.term}
            </span>
          )}
          {book.size && (
            <span style={{ fontSize: 11, color: "#94a3b8" }}>
              · {formatSize(book.size)}
            </span>
          )}
        </div>
      </div>
      {book.uploaded && (
        <div
          style={{
            fontSize: 11,
            color: "#94a3b8",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            gap: 3,
          }}
        >
          <Clock style={{ width: 9, height: 9 }} /> {formatDate(book.uploaded)}
        </div>
      )}
      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
        <button
          onClick={() => onView(book)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            padding: "7px 12px",
            background: "#eef2ff",
            border: "none",
            borderRadius: 9,
            fontSize: 12,
            fontWeight: 700,
            color: "#4f46e5",
            cursor: "pointer",
          }}
        >
          <Eye style={{ width: 12, height: 12 }} /> View
        </button>
        <a
          href={url}
          download={book.key.split("/").pop()}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            padding: "7px 12px",
            background: "#4f46e5",
            border: "none",
            borderRadius: 9,
            fontSize: 12,
            fontWeight: 700,
            color: "#fff",
            cursor: "pointer",
            textDecoration: "none",
          }}
        >
          <Download style={{ width: 12, height: 12 }} /> Download
        </a>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN LIBRARY
// ═══════════════════════════════════════════════════════════════════════════════
const LibraryView = () => {
  const [grade, setGrade] = useState(GRADES[0]);
  const [search, setSearch] = useState("");
  const [filterSubject, setSubject] = useState("All");
  const [filterType, setType] = useState("All");
  const [sortBy, setSort] = useState("name");
  const [viewMode, setViewMode] = useState("grid");
  const [preview, setPreview] = useState(null);

  const gradeBooks = MANIFEST[grade.id] || [];
  const subjects = [
    "All",
    ...Array.from(new Set(gradeBooks.map((b) => b.subject))),
  ];
  const types = ["All", ...Array.from(new Set(gradeBooks.map((b) => b.type)))];

  const displayed = gradeBooks
    .filter((b) => {
      const q = search.toLowerCase();
      return (
        (!q ||
          b.name?.toLowerCase().includes(q) ||
          b.subject?.toLowerCase().includes(q)) &&
        (filterSubject === "All" || b.subject === filterSubject) &&
        (filterType === "All" || b.type === filterType)
      );
    })
    .sort((a, b) => {
      if (sortBy === "name") return (a.name || "").localeCompare(b.name || "");
      if (sortBy === "date") return new Date(b.uploaded) - new Date(a.uploaded);
      if (sortBy === "size") return (b.size || 0) - (a.size || 0);
      return 0;
    });

  const totalBooks = Object.values(MANIFEST).reduce((s, a) => s + a.length, 0);
  const totalSize = Object.values(MANIFEST)
    .flat()
    .reduce((s, b) => s + (b.size || 0), 0);

  return (
    <div style={{ fontFamily: "'DM Sans', 'Nunito', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&display=swap'); * { box-sizing:border-box; }`}</style>

      {/* ── HERO ── */}
      <div
        style={{
          background:
            "linear-gradient(135deg,#1e1b4b 0%,#3730a3 55%,#4f46e5 100%)",
          borderRadius: 22,
          padding: "28px 28px 24px",
          marginBottom: 24,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -30,
            top: -30,
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "rgba(255,255,255,.05)",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 80,
            bottom: -70,
            width: 160,
            height: 160,
            borderRadius: "50%",
            background: "rgba(255,255,255,.04)",
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 22,
            position: "relative",
          }}
        >
          <div
            style={{
              width: 50,
              height: 50,
              background: "rgba(255,255,255,.15)",
              borderRadius: 15,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Library style={{ width: 24, height: 24, color: "#fff" }} />
          </div>
          <div>
            <div
              style={{
                fontSize: 21,
                fontWeight: 800,
                color: "#fff",
                lineHeight: 1.1,
              }}
            >
              School Library
            </div>
            <div
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,.6)",
                marginTop: 3,
              }}
            >
              Grade R – Grade 7 · Workbooks & Resources
            </div>
          </div>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 10,
            position: "relative",
          }}
        >
          {[
            { label: "Total Books", value: totalBooks, icon: BookOpen },
            { label: "Grades", value: `${GRADES.length}`, icon: GraduationCap },
            { label: "Total Size", value: formatSize(totalSize), icon: Layers },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                background: "rgba(255,255,255,.1)",
                borderRadius: 14,
                padding: "14px 16px",
              }}
            >
              <s.icon
                style={{
                  width: 15,
                  height: 15,
                  color: "rgba(255,255,255,.55)",
                  marginBottom: 6,
                }}
              />
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: "#fff",
                  lineHeight: 1,
                }}
              >
                {s.value}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,.5)",
                  fontWeight: 600,
                  marginTop: 4,
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── GRADE TABS ── */}
      <div style={{ marginBottom: 20 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "#94a3b8",
            letterSpacing: ".07em",
            textTransform: "uppercase",
            marginBottom: 10,
          }}
        >
          Select Grade
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {GRADES.map((g) => {
            const count = (MANIFEST[g.id] || []).length;
            const active = grade.id === g.id;
            return (
              <button
                key={g.id}
                onClick={() => {
                  setGrade(g);
                  setSubject("All");
                  setType("All");
                  setSearch("");
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  padding: "9px 15px",
                  borderRadius: 14,
                  border: active
                    ? `2px solid ${g.color}`
                    : "1.5px solid #e2e8f0",
                  background: active ? g.bg : "#fff",
                  cursor: "pointer",
                  transition: "all .15s",
                  boxShadow: active ? `0 4px 14px ${g.color}22` : "none",
                }}
              >
                <span style={{ fontSize: 17 }}>{g.emoji}</span>
                <div>
                  <div
                    style={{
                      fontSize: 12.5,
                      fontWeight: 800,
                      color: active ? g.color : "#374151",
                      lineHeight: 1,
                    }}
                  >
                    {g.label}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      color: active ? g.color : "#94a3b8",
                      marginTop: 2,
                    }}
                  >
                    {count} book{count !== 1 ? "s" : ""}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── GRADE HEADER ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "14px 18px",
          background: grade.bg,
          border: `1.5px solid ${grade.color}30`,
          borderRadius: 16,
          marginBottom: 16,
        }}
      >
        <span style={{ fontSize: 28 }}>{grade.emoji}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: grade.color }}>
            {grade.label} Library
          </div>
          <div
            style={{
              fontSize: 12,
              color: grade.color,
              opacity: 0.6,
              marginTop: 2,
            }}
          >
            {displayed.length} of {gradeBooks.length} book
            {gradeBooks.length !== 1 ? "s" : ""}
            {filterSubject !== "All" ? ` · ${filterSubject}` : ""}
          </div>
        </div>
        {/* View toggle */}
        <div
          style={{
            display: "flex",
            background: `${grade.color}20`,
            borderRadius: 10,
            padding: 3,
            gap: 2,
          }}
        >
          {[
            { mode: "grid", Icon: Grid3X3 },
            { mode: "list", Icon: List },
          ].map(({ mode, Icon }) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              style={{
                background: viewMode === mode ? "#fff" : "transparent",
                border: "none",
                borderRadius: 7,
                padding: "6px 9px",
                cursor: "pointer",
                color: viewMode === mode ? grade.color : grade.color + "77",
                boxShadow:
                  viewMode === mode ? "0 1px 4px rgba(0,0,0,.1)" : "none",
              }}
            >
              <Icon style={{ width: 14, height: 14 }} />
            </button>
          ))}
        </div>
      </div>

      {/* ── TOOLBAR ── */}
      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          marginBottom: 14,
          alignItems: "center",
        }}
      >
        {/* Search */}
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <Search
            style={{
              position: "absolute",
              left: 11,
              top: "50%",
              transform: "translateY(-50%)",
              width: 14,
              height: 14,
              color: "#94a3b8",
              pointerEvents: "none",
            }}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${grade.label} books…`}
            style={{
              width: "100%",
              padding: "9px 32px 9px 33px",
              border: "1.5px solid #e2e8f0",
              borderRadius: 12,
              fontSize: 13,
              outline: "none",
              fontFamily: "inherit",
              background: "#fff",
              color: "#0f172a",
            }}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              style={{
                position: "absolute",
                right: 9,
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#94a3b8",
                display: "flex",
              }}
            >
              <X style={{ width: 13, height: 13 }} />
            </button>
          )}
        </div>
        <select
          value={filterSubject}
          onChange={(e) => setSubject(e.target.value)}
          style={{
            padding: "9px 12px",
            border: "1.5px solid #e2e8f0",
            borderRadius: 12,
            fontSize: 13,
            outline: "none",
            fontFamily: "inherit",
            background: "#fff",
            color: "#374151",
            cursor: "pointer",
          }}
        >
          {subjects.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select
          value={filterType}
          onChange={(e) => setType(e.target.value)}
          style={{
            padding: "9px 12px",
            border: "1.5px solid #e2e8f0",
            borderRadius: 12,
            fontSize: 13,
            outline: "none",
            fontFamily: "inherit",
            background: "#fff",
            color: "#374151",
            cursor: "pointer",
          }}
        >
          {types.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSort(e.target.value)}
          style={{
            padding: "9px 12px",
            border: "1.5px solid #e2e8f0",
            borderRadius: 12,
            fontSize: 13,
            outline: "none",
            fontFamily: "inherit",
            background: "#fff",
            color: "#374151",
            cursor: "pointer",
          }}
        >
          <option value="name">A – Z</option>
          <option value="date">Newest First</option>
          <option value="size">Largest First</option>
        </select>
      </div>

      {/* ── SUBJECT PILLS ── */}
      {gradeBooks.length > 0 && (
        <div
          style={{
            display: "flex",
            gap: 7,
            flexWrap: "wrap",
            marginBottom: 18,
          }}
        >
          {subjects.map((subj) => {
            const style = ss(subj);
            const active = filterSubject === subj;
            const count =
              subj === "All"
                ? gradeBooks.length
                : gradeBooks.filter((b) => b.subject === subj).length;
            return (
              <button
                key={subj}
                onClick={() => setSubject(subj)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "5px 12px",
                  borderRadius: 99,
                  background: active ? style.color : style.bg,
                  color: active ? "#fff" : style.color,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 700,
                  transition: "all .15s",
                }}
              >
                {subj}
                <span
                  style={{
                    background: active
                      ? "rgba(255,255,255,.25)"
                      : style.color + "22",
                    padding: "1px 6px",
                    borderRadius: 99,
                    fontSize: 10,
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* ── CONTENT ── */}
      {gradeBooks.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            background: "#fff",
            borderRadius: 18,
            border: "1.5px solid #f1f5f9",
          }}
        >
          <div style={{ fontSize: 44, marginBottom: 10 }}>📚</div>
          <div
            style={{
              fontSize: 15,
              fontWeight: 800,
              color: "#0f172a",
              marginBottom: 6,
            }}
          >
            {grade.label} is empty
          </div>
          <div style={{ fontSize: 13, color: "#94a3b8" }}>
            Upload PDFs to your R2 bucket under{" "}
            <code
              style={{
                background: "#eef2ff",
                color: "#4f46e5",
                padding: "1px 6px",
                borderRadius: 5,
              }}
            >
              {grade.folder}/
            </code>
            , then add them to the MANIFEST.
          </div>
        </div>
      ) : displayed.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "50px 20px",
            background: "#fff",
            borderRadius: 18,
            border: "1.5px solid #f1f5f9",
          }}
        >
          <div style={{ fontSize: 36, marginBottom: 10 }}>🔍</div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "#0f172a",
              marginBottom: 4,
            }}
          >
            No results found
          </div>
          <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 14 }}>
            Try clearing your search or filters.
          </div>
          <button
            onClick={() => {
              setSearch("");
              setSubject("All");
              setType("All");
            }}
            style={{
              background: "#4f46e5",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              padding: "8px 18px",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Clear filters
          </button>
        </div>
      ) : viewMode === "grid" ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
            gap: 16,
          }}
        >
          {displayed.map((book) => (
            <GridCard
              key={book.key}
              book={book}
              gradeColor={grade.color}
              onView={setPreview}
            />
          ))}
        </div>
      ) : (
        <div>
          {displayed.map((book) => (
            <ListCard
              key={book.key}
              book={book}
              gradeColor={grade.color}
              onView={setPreview}
            />
          ))}
        </div>
      )}

     

      {/* ── INLINE PDF VIEWER ── */}
      {preview && (
        <ViewerModal book={preview} onClose={() => setPreview(null)} />
      )}
    </div>
  );
};

export default LibraryView;
