import React, { useState, useEffect } from "react";
import {
  FileText,
  ShoppingCart,
  Check,
  Eye,
  Sparkles,
  GraduationCap,
  BookOpen,
  School,
  Crown,
  Users,
  Lock,
  X,
  ChevronDown,
} from "lucide-react";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
} from "firebase/firestore";

const FoundationPhaseSVG = () => (
  <svg
    viewBox="0 0 320 420"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-full"
  >
    {["#007A4D", "#FFB612", "#DE3008", "#002395", "#007A4D", "#FFB612"].map(
      (c, i) => (
        <rect
          key={i}
          x={i * (320 / 6)}
          y="0"
          width={320 / 6}
          height="7"
          fill={c}
        />
      ),
    )}
    <rect x="0" y="7" width="320" height="72" fill="#1a3c5e" />
    <circle cx="290" cy="20" r="36" fill="rgba(255,255,255,0.04)" />
    <rect
      x="14"
      y="18"
      width="44"
      height="44"
      rx="8"
      fill="rgba(255,255,255,0.15)"
    />
    <text x="36" y="45" textAnchor="middle" fontSize="18" fill="white">
      🏫
    </text>
    <text x="66" y="34" fontSize="11" fontWeight="bold" fill="white">
      GREENFIELD PRIMARY SCHOOL
    </text>
    <text x="66" y="47" fontSize="7.5" fill="rgba(255,255,255,0.6)">
      123 Education Road, Pretoria
    </text>
    <text x="66" y="57" fontSize="7.5" fill="rgba(255,255,255,0.6)">
      Tel: 012 345 6789
    </text>
    <rect x="210" y="22" width="96" height="18" rx="4" fill="#FFB612" />
    <text
      x="258"
      y="34"
      textAnchor="middle"
      fontSize="7"
      fontWeight="bold"
      fill="#1a1a1a"
    >
      LEARNER PROGRESS REPORT
    </text>
    <text
      x="258"
      y="52"
      textAnchor="middle"
      fontSize="6.5"
      fill="rgba(255,255,255,0.6)"
    >
      Foundation Phase · Grade 2
    </text>
    <text
      x="258"
      y="61"
      textAnchor="middle"
      fontSize="6.5"
      fill="rgba(255,255,255,0.6)"
    >
      Term 1 · 2025
    </text>
    <rect
      x="10"
      y="88"
      width="300"
      height="34"
      rx="7"
      fill="#f0f7f4"
      stroke="#c6e0d4"
      strokeWidth="0.8"
    />
    {[
      ["Learner Name", "Amara Dlamini"],
      ["Grade", "Grade 2"],
      ["Student No.", "2025-001"],
      ["Date of Birth", "12 Mar 2017"],
    ].map(([l, v], i) => (
      <g key={i} transform={`translate(${18 + i * 73},93)`}>
        <text
          fontSize="5.5"
          fontWeight="bold"
          fill="#007A4D"
          letterSpacing="0.5"
        >
          {l.toUpperCase()}
        </text>
        <text y="12" fontSize="7.5" fontWeight="600" fill="#1a1a1a">
          {v}
        </text>
      </g>
    ))}
    <rect x="10" y="130" width="93" height="38" rx="7" fill="#007A4D" />
    <text
      x="56"
      y="144"
      textAnchor="middle"
      fontSize="6"
      fill="rgba(255,255,255,0.8)"
      fontWeight="bold"
    >
      OVERALL AVERAGE
    </text>
    <text
      x="56"
      y="159"
      textAnchor="middle"
      fontSize="16"
      fontWeight="bold"
      fill="white"
    >
      78%
    </text>
    <rect x="112" y="130" width="93" height="38" rx="7" fill="#1a3c5e" />
    <text
      x="158"
      y="144"
      textAnchor="middle"
      fontSize="6"
      fill="rgba(255,255,255,0.8)"
      fontWeight="bold"
    >
      ATTENDANCE
    </text>
    <text
      x="158"
      y="159"
      textAnchor="middle"
      fontSize="16"
      fontWeight="bold"
      fill="white"
    >
      94%
    </text>
    <rect x="214" y="130" width="96" height="38" rx="7" fill="#FFB612" />
    <text
      x="262"
      y="144"
      textAnchor="middle"
      fontSize="6"
      fill="rgba(0,0,0,0.6)"
      fontWeight="bold"
    >
      SUBJECTS
    </text>
    <text
      x="262"
      y="159"
      textAnchor="middle"
      fontSize="16"
      fontWeight="bold"
      fill="#1a1a1a"
    >
      6
    </text>
    <rect x="10" y="177" width="3" height="12" rx="1" fill="#007A4D" />
    <text
      x="18"
      y="187"
      fontSize="8"
      fontWeight="bold"
      fill="#1a3c5e"
      letterSpacing="0.4"
    >
      ACADEMIC PERFORMANCE
    </text>
    <rect x="10" y="194" width="300" height="16" fill="#1a3c5e" />
    {["Learning Area", "Mark (%)", "Level", "Achievement", "Comments"].map(
      (h, i) => (
        <text
          key={i}
          x={[16, 116, 148, 177, 228][i]}
          y="205"
          fontSize="5.5"
          fontWeight="bold"
          fill="white"
          letterSpacing="0.3"
        >
          {h}
        </text>
      ),
    )}
    {[
      ["Home Language", "82%", "7", "Outstanding", "Excellent"],
      ["Mathematics", "74%", "6", "Meritorious", "Good work"],
      ["Life Skills", "90%", "7", "Outstanding", "Superb"],
      ["Natural Sci.", "68%", "5", "Substantial", "Well done"],
      ["Social Sci.", "71%", "6", "Meritorious", "Good effort"],
      ["Creative Arts", "85%", "7", "Outstanding", "Talented"],
    ].map(([sub, m, l, ach, com], i) => (
      <g key={i}>
        <rect
          x="10"
          y={210 + i * 16}
          width="300"
          height="16"
          fill={i % 2 === 0 ? "#f9fafb" : "white"}
          stroke="#e5e7eb"
          strokeWidth="0.4"
        />
        <text
          x="16"
          y={221 + i * 16}
          fontSize="6.5"
          fontWeight="600"
          fill="#1a1a1a"
        >
          {sub}
        </text>
        <text
          x="116"
          y={221 + i * 16}
          fontSize="6.5"
          fontWeight="bold"
          fill="#007A4D"
        >
          {m}
        </text>
        <rect
          x="144"
          y={212 + i * 16}
          width="14"
          height="9"
          rx="2"
          fill={
            ["#15803d", "#1d4ed8", "#0369a1", "#15803d", "#1d4ed8", "#15803d"][
              i
            ]
          }
        />
        <text
          x="151"
          y={219.5 + i * 16}
          textAnchor="middle"
          fontSize="5.5"
          fontWeight="bold"
          fill="white"
        >
          {l}
        </text>
        <text
          x="177"
          y={221 + i * 16}
          fontSize="6"
          fill={
            ["#15803d", "#1d4ed8", "#0369a1", "#15803d", "#1d4ed8", "#15803d"][
              i
            ]
          }
          fontWeight="600"
        >
          {ach}
        </text>
        <text x="228" y={221 + i * 16} fontSize="5.5" fill="#9ca3af">
          {com}
        </text>
      </g>
    ))}
    <rect x="10" y="306" width="300" height="16" fill="#1a3c5e" />
    <text x="16" y="317" fontSize="6.5" fontWeight="bold" fill="white">
      TOTAL AVERAGE
    </text>
    <text x="116" y="317" fontSize="8" fontWeight="bold" fill="#FFB612">
      78%
    </text>
    <rect
      x="10"
      y="328"
      width="300"
      height="24"
      rx="5"
      fill="#f9fafb"
      stroke="#e5e7eb"
      strokeWidth="0.6"
    />
    <text
      x="16"
      y="337"
      fontSize="5"
      fontWeight="bold"
      fill="#6b7280"
      letterSpacing="0.5"
    >
      CAPS ACHIEVEMENT SCALE
    </text>
    {[
      { c: 7, col: "#15803d" },
      { c: 6, col: "#1d4ed8" },
      { c: 5, col: "#0369a1" },
      { c: 4, col: "#ca8a04" },
      { c: 3, col: "#ea580c" },
      { c: 2, col: "#dc2626" },
      { c: 1, col: "#991b1b" },
    ].map(({ c, col }, i) => (
      <g key={c} transform={`translate(${14 + i * 40},340)`}>
        <rect width="10" height="8" rx="2" fill={col} />
        <text
          x="5"
          y="7"
          textAnchor="middle"
          fontSize="5.5"
          fontWeight="bold"
          fill="white"
        >
          {c}
        </text>
      </g>
    ))}
    <line
      x1="10"
      y1="362"
      x2="310"
      y2="362"
      stroke="#e5e7eb"
      strokeWidth="1.2"
    />
    {["Class Educator", "Principal", "Parent/Guardian"].map((r, i) => (
      <g key={r} transform={`translate(${20 + i * 98},364)`}>
        <line
          x1="0"
          y1="22"
          x2="80"
          y2="22"
          stroke="#9ca3af"
          strokeWidth="0.8"
        />
        <text x="40" y="30" textAnchor="middle" fontSize="6" fill="#6b7280">
          {r}
        </text>
        <text x="40" y="39" textAnchor="middle" fontSize="5.5" fill="#9ca3af">
          Date: ___________
        </text>
      </g>
    ))}
    {["#007A4D", "#FFB612", "#DE3008", "#002395", "#007A4D", "#FFB612"].map(
      (c, i) => (
        <rect
          key={i}
          x={i * (320 / 6)}
          y="414"
          width={320 / 6}
          height="6"
          fill={c}
        />
      ),
    )}
  </svg>
);

const IntermediatePhaseSVG = () => (
  <svg
    viewBox="0 0 320 420"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-full"
  >
    <rect x="0" y="0" width="320" height="6" fill="#007A4D" />
    <rect x="0" y="6" width="320" height="66" fill="#1e3a5f" />
    <rect x="0" y="72" width="320" height="4" fill="#FFB612" />
    <rect
      x="14"
      y="16"
      width="46"
      height="46"
      rx="7"
      fill="rgba(255,255,255,0.1)"
    />
    <text x="37" y="44" textAnchor="middle" fontSize="20" fill="white">
      🏫
    </text>
    <text x="68" y="30" fontSize="11" fontWeight="bold" fill="white">
      RIVERSIDE ACADEMY
    </text>
    <text x="68" y="42" fontSize="7" fill="rgba(255,255,255,0.6)">
      45 Learning Avenue, Cape Town
    </text>
    <text
      x="210"
      y="24"
      fontSize="10"
      fontWeight="bold"
      fill="#FFB612"
      letterSpacing="0.8"
    >
      ACADEMIC REPORT CARD
    </text>
    <text x="210" y="36" fontSize="6.5" fill="rgba(255,255,255,0.7)">
      Intermediate Phase · Grade 5
    </text>
    <text x="210" y="46" fontSize="6.5" fill="rgba(255,255,255,0.7)">
      Term 2 · 2025
    </text>
    <rect
      x="10"
      y="82"
      width="170"
      height="72"
      rx="7"
      stroke="#e5e7eb"
      strokeWidth="0.8"
      fill="white"
    />
    <rect x="10" y="82" width="170" height="14" rx="7" fill="#f3f4f6" />
    <rect x="10" y="89" width="170" height="7" fill="#f3f4f6" />
    <text
      x="16"
      y="92"
      fontSize="6"
      fontWeight="bold"
      fill="#374151"
      letterSpacing="0.5"
    >
      LEARNER INFORMATION
    </text>
    {[
      ["Full Name", "Sipho Nkosi"],
      ["Grade", "Grade 5"],
      ["Student No.", "2025-042"],
      ["Parent", "Mrs. Nkosi"],
      ["Contact", "082 555 1234"],
      ["DOB", "14 Jun 2014"],
    ].map(([l, v], i) => (
      <g
        key={i}
        transform={`translate(${i % 2 === 0 ? 16 : 96},${100 + Math.floor(i / 2) * 18})`}
      >
        <text fontSize="5" fill="#9ca3af" letterSpacing="0.4">
          {l.toUpperCase()}
        </text>
        <text y="10" fontSize="7" fontWeight="600" fill="#111827">
          {v}
        </text>
      </g>
    ))}
    <rect
      x="188"
      y="82"
      width="122"
      height="34"
      rx="7"
      stroke="#e5e7eb"
      strokeWidth="0.8"
      fill="white"
    />
    <circle
      cx="210"
      cy="99"
      r="14"
      fill="none"
      stroke="#e5e7eb"
      strokeWidth="3"
    />
    <circle
      cx="210"
      cy="99"
      r="14"
      fill="none"
      stroke="#1d4ed8"
      strokeWidth="3"
      strokeDasharray="74 100"
      strokeLinecap="round"
      transform="rotate(-90 210 99)"
    />
    <text
      x="210"
      y="103"
      textAnchor="middle"
      fontSize="7"
      fontWeight="bold"
      fill="#1d4ed8"
    >
      74%
    </text>
    <text x="232" y="94" fontSize="6" fill="#9ca3af" letterSpacing="0.4">
      OVERALL AVG
    </text>
    <text x="232" y="104" fontSize="8" fontWeight="bold" fill="#111827">
      Meritorious
    </text>
    <text x="232" y="113" fontSize="6" fill="#6b7280">
      Level 6 · CAPS
    </text>
    <rect
      x="188"
      y="122"
      width="122"
      height="32"
      rx="7"
      stroke="#e5e7eb"
      strokeWidth="0.8"
      fill="white"
    />
    <text x="196" y="133" fontSize="6" fill="#9ca3af" letterSpacing="0.4">
      ATTENDANCE
    </text>
    <text x="196" y="145" fontSize="14" fontWeight="bold" fill="#007A4D">
      94%
    </text>
    <rect x="230" y="129" width="72" height="6" rx="3" fill="#e5e7eb" />
    <rect x="230" y="129" width="68" height="6" rx="3" fill="#007A4D" />
    <text x="230" y="147" fontSize="5.5" fill="#9ca3af">
      47 / 50 days present
    </text>
    <rect x="10" y="162" width="3" height="11" rx="1" fill="#007A4D" />
    <text
      x="18"
      y="171"
      fontSize="7.5"
      fontWeight="bold"
      fill="#1e3a5f"
      letterSpacing="0.4"
    >
      ACADEMIC PERFORMANCE PER SUBJECT
    </text>
    <rect x="10" y="178" width="300" height="14" fill="#1e3a5f" rx="3" />
    {["Subject", "Mark", "Progress", "Level", "Remarks"].map((h, i) => (
      <text
        key={i}
        x={[16, 86, 112, 188, 218][i]}
        y="188"
        fontSize="5.5"
        fontWeight="bold"
        fill="white"
        letterSpacing="0.3"
      >
        {h}
      </text>
    ))}
    {[
      ["Home Language", "82%", 82, "#15803d", "L7", "Outstanding"],
      ["Mathematics", "68%", 68, "#0369a1", "L5", "Substantial"],
      ["Natural Sciences", "74%", 74, "#1d4ed8", "L6", "Meritorious"],
      ["Social Sciences", "71%", 71, "#1d4ed8", "L6", "Meritorious"],
      ["Technology", "85%", 85, "#15803d", "L7", "Outstanding"],
      ["EMS", "66%", 66, "#0369a1", "L5", "Substantial"],
    ].map(([sub, m, pct, col, lv, rem], i) => (
      <g key={i}>
        <rect
          x="10"
          y={192 + i * 16}
          width="300"
          height="16"
          fill={i % 2 === 0 ? "#fafafa" : "white"}
          stroke="#f3f4f6"
          strokeWidth="0.4"
        />
        <text
          x="16"
          y={203 + i * 16}
          fontSize="6.5"
          fontWeight="600"
          fill="#111"
        >
          {sub}
        </text>
        <text
          x="86"
          y={203 + i * 16}
          fontSize="6.5"
          fontWeight="bold"
          fill={col}
        >
          {m}
        </text>
        <rect
          x="112"
          y={196 + i * 16}
          width="70"
          height="6"
          rx="3"
          fill="#e5e7eb"
        />
        <rect
          x="112"
          y={196 + i * 16}
          width={(70 * pct) / 100}
          height="6"
          rx="3"
          fill={col}
        />
        <rect
          x="184"
          y={194 + i * 16}
          width="18"
          height="10"
          rx="2"
          fill={col}
        />
        <text
          x="193"
          y={201.5 + i * 16}
          textAnchor="middle"
          fontSize="5.5"
          fontWeight="bold"
          fill="white"
        >
          {lv}
        </text>
        <text x="218" y={203 + i * 16} fontSize="5.5" fill="#6b7280">
          {rem}
        </text>
      </g>
    ))}
    <rect
      x="10"
      y="288"
      width="300"
      height="15"
      fill="#1e3a5f"
      stroke="#007A4D"
      strokeWidth="1.2"
    />
    <text x="16" y="298.5" fontSize="6.5" fontWeight="bold" fill="white">
      OVERALL AVERAGE
    </text>
    <rect
      x="100"
      y="290"
      width="188"
      height="7"
      rx="3"
      fill="rgba(255,255,255,0.15)"
    />
    <rect x="100" y="290" width="139" height="7" rx="3" fill="#FFB612" />
    <text
      x="294"
      y="298.5"
      textAnchor="end"
      fontSize="9"
      fontWeight="bold"
      fill="#FFB612"
    >
      74%
    </text>
    <rect x="10" y="310" width="3" height="11" rx="1" fill="#FFB612" />
    <text
      x="18"
      y="319"
      fontSize="7"
      fontWeight="bold"
      fill="#1e3a5f"
      letterSpacing="0.3"
    >
      EDUCATOR'S REMARKS
    </text>
    <rect
      x="10"
      y="324"
      width="300"
      height="30"
      rx="5"
      fill="#fafafa"
      stroke="#e5e7eb"
      strokeWidth="0.7"
    />
    <text x="16" y="334" fontSize="6" fill="#374151">
      Sipho demonstrates excellent dedication and a positive attitude
    </text>
    <text x="16" y="344" fontSize="6" fill="#374151">
      towards his studies. Keep up the outstanding work!
    </text>
    <line x1="10" y1="362" x2="310" y2="362" stroke="#e5e7eb" strokeWidth="1" />
    {["Class Educator", "Principal / HOD", "Parent / Guardian"].map((r, i) => (
      <g key={r} transform={`translate(${18 + i * 98},364)`}>
        <line
          x1="0"
          y1="22"
          x2="82"
          y2="22"
          stroke="#9ca3af"
          strokeWidth="0.7"
        />
        <text x="41" y="30" textAnchor="middle" fontSize="6" fill="#6b7280">
          {r}
        </text>
        <text x="41" y="39" textAnchor="middle" fontSize="5.5" fill="#9ca3af">
          Date: ___________
        </text>
      </g>
    ))}
    <text x="160" y="416" textAnchor="middle" fontSize="5" fill="#9ca3af">
      Issued in accordance with CAPS · Riverside Academy · Term 2 2025
    </text>
  </svg>
);

const FormalAcademicSVG = () => (
  <svg
    viewBox="0 0 320 420"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-full"
  >
    <defs>
      <linearGradient id="topbar" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#007A4D" />
        <stop offset="33%" stopColor="#1e3a5f" />
        <stop offset="66%" stopColor="#FFB612" />
        <stop offset="100%" stopColor="#DE3008" />
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="320" height="5" fill="url(#topbar)" />
    <rect
      x="0"
      y="5"
      width="320"
      height="415"
      fill="white"
      stroke="#d1d5db"
      strokeWidth="0.5"
    />
    <rect x="0" y="5" width="320" height="72" fill="white" />
    <line x1="10" y1="77" x2="310" y2="77" stroke="#111" strokeWidth="2" />
    <rect
      x="14"
      y="14"
      width="54"
      height="54"
      rx="3"
      fill="#f3f4f6"
      stroke="#e5e7eb"
      strokeWidth="0.7"
    />
    <text x="41" y="46" textAnchor="middle" fontSize="22" fill="#374151">
      🏫
    </text>
    <text
      x="76"
      y="28"
      fontSize="13"
      fontWeight="bold"
      fill="#111"
      fontFamily="serif"
      letterSpacing="0.5"
    >
      EXCEL HIGH SCHOOL
    </text>
    <text x="76" y="40" fontSize="7" fill="#374151">
      78 Academic Street, Johannesburg · 2001
    </text>
    <text x="76" y="50" fontSize="7" fill="#374151">
      Tel: 011 234 5678 · Email: info@excelhigh.co.za
    </text>
    <text
      x="306"
      y="24"
      textAnchor="end"
      fontSize="11"
      fontWeight="bold"
      fill="#111"
      fontFamily="serif"
      letterSpacing="1.5"
    >
      LEARNER ACADEMIC REPORT
    </text>
    <line x1="210" y1="27" x2="306" y2="27" stroke="#111" strokeWidth="1.5" />
    <text x="306" y="38" textAnchor="end" fontSize="7" fill="#374151">
      Report Number: <tspan fontWeight="bold">RPT-2025-042</tspan>
    </text>
    <text x="306" y="48" textAnchor="end" fontSize="7" fill="#374151">
      Academic Period: <tspan fontWeight="bold">Term 1 2025</tspan>
    </text>
    <text x="306" y="58" textAnchor="end" fontSize="7" fill="#374151">
      Grade: <tspan fontWeight="bold">Grade 6</tspan>
    </text>
    <rect x="10" y="84" width="300" height="13" fill="#1e3a5f" />
    <text
      x="16"
      y="93.5"
      fontSize="6.5"
      fontWeight="bold"
      fill="white"
      letterSpacing="0.5"
    >
      LEARNER PARTICULARS
    </text>
    {[
      [
        ["Full Name", "Thabo Mokoena"],
        ["Student No.", "2025-042"],
      ],
      [
        ["Date of Birth", "22 Sep 2013"],
        ["Grade", "Grade 6"],
      ],
      [
        ["Parent/Guardian", "Mr. T. Mokoena"],
        ["Contact", "073 555 9900"],
      ],
    ].map((row, ri) => (
      <g key={ri}>
        <rect
          x="10"
          y={97 + ri * 14}
          width="300"
          height="14"
          fill={ri % 2 === 0 ? "white" : "#f9fafb"}
          stroke="#e5e7eb"
          strokeWidth="0.4"
        />
        {row.map(([l, v], ci) => (
          <g
            key={l}
            transform={`translate(${ci === 0 ? 16 : 166},${99 + ri * 14})`}
          >
            <text fontSize="5.5" fontWeight="bold" fill="#374151" x="0" y="5">
              {l}:
            </text>
            <text fontSize="7" fill="#111" x="60" y="5">
              {v}
            </text>
          </g>
        ))}
      </g>
    ))}
    <rect x="10" y="142" width="300" height="13" fill="#1e3a5f" />
    <text
      x="16"
      y="151"
      fontSize="6.5"
      fontWeight="bold"
      fill="white"
      letterSpacing="0.5"
    >
      ACADEMIC PERFORMANCE SUMMARY — CAPS CURRICULUM
    </text>
    <rect
      x="10"
      y="155"
      width="300"
      height="11"
      fill="#f3f4f6"
      stroke="#d1d5db"
      strokeWidth="0.4"
    />
    {[
      "Learning Area / Subject",
      "Mark (%)",
      "Achiev. Level",
      "Descriptor",
      "Educator Comment",
    ].map((h, i) => (
      <text
        key={i}
        x={[16, 110, 138, 174, 228][i]}
        y="163.5"
        fontSize="5.5"
        fontWeight="bold"
        fill="#374151"
        letterSpacing="0.3"
      >
        {h}
      </text>
    ))}
    {[
      ["Home Language", "86", 7, "Outstanding", "Excellent performance"],
      ["Mathematics", "72", 6, "Meritorious", "Very good effort"],
      ["Natural Sciences", "79", 6, "Meritorious", "Great work"],
      ["Social Sciences", "68", 5, "Substantial", "Good progress"],
      ["Technology", "91", 7, "Outstanding", "Exceptional"],
      ["EMS", "75", 6, "Meritorious", "Well done"],
    ].map(([sub, m, l, desc, com], i) => (
      <g key={i}>
        <rect
          x="10"
          y={166 + i * 14}
          width="300"
          height="14"
          fill={i % 2 === 0 ? "white" : "#fafafa"}
          stroke="#e5e7eb"
          strokeWidth="0.3"
        />
        <text x="16" y={176 + i * 14} fontSize="6.5" fontWeight="600">
          {sub}
        </text>
        <text
          x="110"
          y={176 + i * 14}
          fontSize="6.5"
          fontWeight="bold"
          textAnchor="middle"
        >
          {m}
        </text>
        <rect
          x="130"
          y={168 + i * 14}
          width="14"
          height="8"
          rx="1"
          fill={
            [
              ,
              "#15803d",
              "#1d4ed8",
              "#1d4ed8",
              "#0369a1",
              "#15803d",
              "#1d4ed8",
            ][l]
          }
        />
        <text
          x="137"
          y={174.5 + i * 14}
          textAnchor="middle"
          fontSize="5.5"
          fontWeight="bold"
          fill="white"
        >
          {l}
        </text>
        <text
          x="174"
          y={176 + i * 14}
          fontSize="6"
          fill={
            [
              ,
              "#15803d",
              "#1d4ed8",
              "#1d4ed8",
              "#0369a1",
              "#15803d",
              "#1d4ed8",
            ][l]
          }
          fontWeight="600"
        >
          {desc}
        </text>
        <text x="228" y={176 + i * 14} fontSize="5.5" fill="#6b7280">
          {com}
        </text>
      </g>
    ))}
    <rect x="10" y="250" width="300" height="14" fill="#1e3a5f" />
    <text x="16" y="260" fontSize="6.5" fontWeight="bold" fill="white">
      OVERALL AVERAGE
    </text>
    <text
      x="110"
      y="260"
      textAnchor="middle"
      fontSize="10"
      fontWeight="bold"
      fill="#FFB612"
    >
      79%
    </text>
    <text x="160" y="260" fontSize="7" fill="rgba(255,255,255,0.7)">
      Achievement Level 6 — Meritorious
    </text>
    <rect
      x="10"
      y="270"
      width="300"
      height="11"
      fill="#f3f4f6"
      stroke="#d1d5db"
      strokeWidth="0.4"
    />
    <text x="16" y="278" fontSize="5.5" fontWeight="bold" fill="#374151">
      CAPS ACHIEVEMENT LEVEL DESCRIPTORS
    </text>
    <rect
      x="10"
      y="281"
      width="300"
      height="18"
      stroke="#d1d5db"
      strokeWidth="0.4"
      fill="white"
    />
    {[
      { c: 7, l: "Outstanding", r: "80–100" },
      { c: 6, l: "Meritorious", r: "70–79" },
      { c: 5, l: "Substantial", r: "60–69" },
      { c: 4, l: "Adequate", r: "50–59" },
      { c: 3, l: "Moderate", r: "40–49" },
      { c: 2, l: "Elementary", r: "30–39" },
      { c: 1, l: "Not Achieved", r: "0–29" },
    ].map(({ c, l, r }, i) => (
      <g key={c} transform={`translate(${14 + i * 42},284)`}>
        <text fontSize="9" fontWeight="bold" fill="#1e3a5f">
          {c}
        </text>
        <text y="9" fontSize="4.5" fontWeight="600" fill="#374151">
          {l}
        </text>
        <text y="15" fontSize="4" fill="#9ca3af">
          {r}%
        </text>
      </g>
    ))}
    <rect x="10" y="305" width="300" height="13" fill="#1e3a5f" />
    <text
      x="16"
      y="314"
      fontSize="6.5"
      fontWeight="bold"
      fill="white"
      letterSpacing="0.5"
    >
      ATTENDANCE RECORD
    </text>
    <rect
      x="10"
      y="318"
      width="300"
      height="22"
      stroke="#d1d5db"
      strokeWidth="0.4"
      fill="white"
    />
    {[
      ["Total School Days", "50"],
      ["Days Present", "47"],
      ["Attendance Rate", "94%"],
    ].map(([l, v], i) => (
      <g key={l} transform={`translate(${20 + i * 100},318)`}>
        <text y="11" fontSize="5.5" fill="#9ca3af" letterSpacing="0.4">
          {l.toUpperCase()}
        </text>
        <text
          y="21"
          fontSize="11"
          fontWeight="bold"
          fill={i === 2 ? "#007A4D" : "#111"}
        >
          {v}
        </text>
      </g>
    ))}
    <rect x="10" y="346" width="300" height="13" fill="#1e3a5f" />
    <text x="16" y="355" fontSize="6.5" fontWeight="bold" fill="white">
      EDUCATOR'S REMARKS
    </text>
    <rect
      x="10"
      y="359"
      width="300"
      height="18"
      fill="white"
      stroke="#d1d5db"
      strokeWidth="0.4"
    />
    <text x="16" y="368" fontSize="6" fill="#374151">
      Thabo is a dedicated learner who consistently performs at a high level.
    </text>
    <text x="16" y="376" fontSize="6" fill="#374151">
      His commitment to excellence is commendable.
    </text>
    <line x1="10" y1="384" x2="310" y2="384" stroke="#111" strokeWidth="1.5" />
    {["Class Educator", "Principal", "Parent / Guardian"].map((r, i) => (
      <g key={r} transform={`translate(${18 + i * 98},386)`}>
        <text fontSize="5.5" fill="#6b7280">
          {r}
        </text>
        <text y="10" fontSize="5.5" fill="#9ca3af">
          Signature: ___________
        </text>
        <text y="19" fontSize="5.5" fill="#9ca3af">
          Date: _______________
        </text>
      </g>
    ))}
    <text x="160" y="416" textAnchor="middle" fontSize="4.5" fill="#9ca3af">
      Official academic record issued in accordance with SASA and CAPS · Excel
      High School · 2025
    </text>
  </svg>
);

const PreSchoolSVG = () => (
  <svg
    viewBox="0 0 320 420"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-full"
  >
    <defs>
      <linearGradient id="topRainbow2" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#FF6B6B" />
        <stop offset="25%" stopColor="#FFD93D" />
        <stop offset="50%" stopColor="#6BCB77" />
        <stop offset="75%" stopColor="#4D96FF" />
        <stop offset="100%" stopColor="#FF6B6B" />
      </linearGradient>
      <linearGradient id="headerGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#667eea" />
        <stop offset="100%" stopColor="#764ba2" />
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="320" height="10" fill="url(#topRainbow2)" />
    <rect x="0" y="10" width="320" height="70" fill="url(#headerGrad2)" />
    <circle cx="290" cy="20" r="36" fill="rgba(255,255,255,0.06)" />
    <circle cx="270" cy="65" r="22" fill="rgba(255,255,255,0.04)" />
    <text x="20" y="36" fontSize="20">
      🏫
    </text>
    <text x="48" y="32" fontSize="11" fontWeight="bold" fill="white">
      SUNSHINE NURSERY SCHOOL
    </text>
    <text x="48" y="50" fontSize="18" fontWeight="bold" fill="#FFD93D">
      ⭐ Learner Progress Report ⭐
    </text>
    <text x="48" y="63" fontSize="7" fill="rgba(255,255,255,0.7)">
      Term 1 · 2025
    </text>
    <rect
      x="270"
      y="20"
      width="36"
      height="42"
      rx="8"
      fill="rgba(255,255,255,0.12)"
    />
    <text x="288" y="46" textAnchor="middle" fontSize="22">
      🎒
    </text>
    <text
      x="288"
      y="58"
      textAnchor="middle"
      fontSize="7"
      fill="#FFD93D"
      fontWeight="bold"
    >
      Grade R
    </text>
    <rect
      x="10"
      y="88"
      width="300"
      height="42"
      rx="10"
      fill="#e0f2fe"
      stroke="#7dd3fc"
      strokeWidth="1.5"
    />
    <text x="22" y="115" fontSize="28">
      👦
    </text>
    <text x="58" y="104" fontSize="13" fontWeight="bold" fill="#0369a1">
      Lebo Sithole
    </text>
    {[
      ["Grade", "Grade R"],
      ["Student No.", "2025-R01"],
      ["DOB", "05 Jan 2019"],
      ["Parent", "Mrs Sithole"],
    ].map(([l, v], i) => (
      <g key={i} transform={`translate(${58 + i * 62},108)`}>
        <text fontSize="5" fill="#64748b" letterSpacing="0.4">
          {l.toUpperCase()}
        </text>
        <text y="10" fontSize="7" fontWeight="600" fill="#0f172a">
          {v}
        </text>
      </g>
    ))}
    <text x="296" y="110" textAnchor="middle" fontSize="24">
      😁
    </text>
    <text
      x="296"
      y="123"
      textAnchor="middle"
      fontSize="10"
      fontWeight="bold"
      fill="#0369a1"
    >
      82%
    </text>
    <text x="296" y="131" textAnchor="middle" fontSize="5.5" fill="#64748b">
      Overall
    </text>
    {[
      {
        label: "Days at School 📅",
        val: "44",
        sub: "out of 47 days",
        col: "#6BCB77",
        bg: "#f0fdf4",
      },
      {
        label: "Overall Average 📊",
        val: "82%",
        sub: "Outstanding",
        col: "#4D96FF",
        bg: "#eff6ff",
      },
      {
        label: "Subjects 📚",
        val: "6",
        sub: "learning areas",
        col: "#FF6B6B",
        bg: "#fff1f2",
      },
    ].map(({ label, val, sub, col, bg }, i) => (
      <g key={i}>
        <rect
          x={10 + i * 100}
          y="138"
          width="96"
          height="36"
          rx="10"
          fill={bg}
          stroke={col + "30"}
          strokeWidth="1.5"
        />
        <text
          x={58 + i * 100}
          y="151"
          textAnchor="middle"
          fontSize="6"
          fill="#64748b"
        >
          {label}
        </text>
        <text
          x={58 + i * 100}
          y="163"
          textAnchor="middle"
          fontSize="15"
          fontWeight="bold"
          fill={col}
        >
          {val}
        </text>
        <text
          x={58 + i * 100}
          y="171"
          textAnchor="middle"
          fontSize="5.5"
          fill="#94a3b8"
        >
          {sub}
        </text>
      </g>
    ))}
    <text x="16" y="192" fontSize="9" fontWeight="bold" fill="#6366f1">
      📚 Learning Areas & Progress
    </text>
    {[
      {
        name: "Home Language 🗣️",
        mark: 85,
        stars: 5,
        col: "#FF6B6B",
        bg: "#fff0f0",
      },
      {
        name: "Mathematics ➕",
        mark: 78,
        stars: 4,
        col: "#FFD93D",
        bg: "#fffbeb",
      },
      {
        name: "Life Skills 🌟",
        mark: 90,
        stars: 5,
        col: "#6BCB77",
        bg: "#f0fdf4",
      },
      {
        name: "Creative Arts 🎨",
        mark: 88,
        stars: 5,
        col: "#4D96FF",
        bg: "#eff6ff",
      },
      {
        name: "Physical Ed. ⚽",
        mark: 82,
        stars: 5,
        col: "#FF9F43",
        bg: "#fff7ed",
      },
      { name: "Music 🎵", mark: 75, stars: 4, col: "#A55EEA", bg: "#faf5ff" },
    ].map(({ name, mark, stars, col, bg }, i) => (
      <g key={i}>
        <rect
          x="10"
          y={198 + i * 30}
          width="300"
          height="27"
          rx="8"
          fill={bg}
          stroke={col + "40"}
          strokeWidth="1.5"
        />
        <rect x="10" y={198 + i * 30} width="4" height="27" rx="2" fill={col} />
        <text
          x="22"
          y={213 + i * 30}
          fontSize="7.5"
          fontWeight="bold"
          fill="#1e293b"
        >
          {name}
        </text>
        {[1, 2, 3, 4, 5].map((s) => (
          <text
            key={s}
            x={22 + (s - 1) * 12}
            y={222 + i * 30}
            fontSize="8"
            opacity={s <= stars ? 1 : 0.2}
          >
            ⭐
          </text>
        ))}
        <circle cx="278" cy={211 + i * 30} r="12" fill={col} />
        <text
          x="278"
          y={215 + i * 30}
          textAnchor="middle"
          fontSize="8"
          fontWeight="bold"
          fill="white"
        >
          {mark}
        </text>
        <rect
          x="22"
          y={224 + i * 30}
          width="240"
          height="4"
          rx="2"
          fill="#e2e8f0"
        />
        <rect
          x="22"
          y={224 + i * 30}
          width={(240 * mark) / 100}
          height="4"
          rx="2"
          fill={col}
        />
      </g>
    ))}
    <rect
      x="10"
      y="382"
      width="300"
      height="24"
      rx="10"
      fill="#fef3c7"
      stroke="#fbbf24"
      strokeWidth="1.5"
    />
    <text x="16" y="392" fontSize="7.5" fontWeight="bold" fill="#92400e">
      💬 Educator's Message
    </text>
    <text x="16" y="402" fontSize="6" fill="#78350f">
      Lebo is a joy to teach! She shows wonderful curiosity and enthusiasm. 🌟
    </text>
    <rect x="0" y="410" width="320" height="10" fill="url(#topRainbow2)" />
  </svg>
);

const TEMPLATES = {
  professional: {
    id: "professional",
    name: "Foundation Phase",
    subtitle: "Grade R – Grade 3",
    description:
      "SA flag-themed report with full CAPS 7-level achievement scale. Perfect for Foundation Phase learners.",
    price: 0,
    isPremium: false,
    category: "free",
    icon: GraduationCap,
    color: "green",
    reportTemplateId: "classic",
    SVGPreview: FoundationPhaseSVG,
    features: [
      "SA flag colour bar design",
      "CAPS 7-level achievement scale",
      "Learner & parent info sections",
      "3-party signature block",
    ],
  },
  premium: {
    id: "premium",
    name: "Formal Academic",
    subtitle: "All Grades",
    description:
      "Serif letterhead style matching official SA school documents. Suitable for all grades.",
    price: 299,
    isPremium: true,
    category: "premium",
    icon: Crown,
    color: "blue",
    reportTemplateId: "professional",
    SVGPreview: FormalAcademicSVG,
    features: [
      "Official letterhead style",
      "Full CAPS descriptor table",
      "Attendance record section",
      "Formal signature & date blocks",
    ],
  },
  modern: {
    id: "modern",
    name: "Intermediate Phase",
    subtitle: "Grade 4 – Grade 6",
    description:
      "Data-rich layout with per-subject progress bars and attendance ring. Ideal for Gr 4–6.",
    price: 249,
    isPremium: true,
    category: "modern",
    icon: School,
    color: "indigo",
    reportTemplateId: "modern",
    SVGPreview: IntermediatePhaseSVG,
    features: [
      "Per-subject progress bars",
      "Circular average indicator",
      "Attendance rate bar",
      "Compact data-dense layout",
    ],
  },
  course: {
    id: "course",
    name: "Early Childhood",
    subtitle: "Pre-School & Grade R",
    description:
      "Playful star-rating system with emoji feedback. Warm and friendly for young learners.",
    price: 279,
    isPremium: true,
    category: "courses",
    icon: BookOpen,
    color: "purple",
    reportTemplateId: "colorful",
    SVGPreview: PreSchoolSVG,
    features: [
      "Star rating system (1–5 ⭐)",
      "Emoji progress indicators",
      "Colourful subject cards",
      "Friendly educator message",
    ],
  },
};

const Templates = ({ user }) => {
  const [purchasedTemplates, setPurchasedTemplates] = useState([
    "professional",
  ]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showPreview, setShowPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardName: "",
  });
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    loadPurchasedTemplates();
  }, [user]);

  const loadPurchasedTemplates = async () => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }
    try {
      const db = getFirestore();
      const docRef = doc(db, "users", user.uid, "settings", "templates");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setPurchasedTemplates(docSnap.data().purchased || ["professional"]);
      } else {
        await setDoc(docRef, {
          purchased: ["professional"],
          active: "professional",
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error("Error loading templates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (templateId) => {
    if (!user?.uid) return;
    const template = TEMPLATES[templateId];
    if (!template.isPremium) {
      try {
        const db = getFirestore();
        const docRef = doc(db, "users", user.uid, "settings", "templates");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          await updateDoc(docRef, {
            purchased: arrayUnion(templateId),
            updatedAt: serverTimestamp(),
          });
        } else {
          await setDoc(docRef, {
            purchased: ["professional", templateId],
            active: "professional",
            updatedAt: serverTimestamp(),
          });
        }
        setPurchasedTemplates((prev) => [...prev, templateId]);
        alert(
          "✅ Template added successfully!\n\nYou can now select it when creating reports.",
        );
      } catch (error) {
        alert("❌ Failed to add template. Please try again.");
      }
      return;
    }
    setShowPayment(templateId);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!user?.uid || !showPayment) return;
    const cleanCard = cardDetails.cardNumber.replace(/\s/g, "");
    if (cleanCard.length !== 16 || !/^\d+$/.test(cleanCard)) {
      alert("Please enter a valid 16-digit card number");
      return;
    }
    if (!/^\d{2}\/\d{2}$/.test(cardDetails.expiryDate)) {
      alert("Please enter expiry date in MM/YY format");
      return;
    }
    if (cardDetails.cvv.length !== 3) {
      alert("Please enter a valid 3-digit CVV");
      return;
    }
    setPaymentProcessing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const db = getFirestore();
      const docRef = doc(db, "users", user.uid, "settings", "templates");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        await updateDoc(docRef, {
          purchased: arrayUnion(showPayment),
          updatedAt: serverTimestamp(),
        });
      } else {
        await setDoc(docRef, {
          purchased: ["professional", showPayment],
          active: "professional",
          updatedAt: serverTimestamp(),
        });
      }
      await setDoc(
        doc(db, "users", user.uid, "payments", Date.now().toString()),
        {
          templateId: showPayment,
          templateName: TEMPLATES[showPayment].name,
          amount: TEMPLATES[showPayment].price,
          currency: "ZAR",
          timestamp: serverTimestamp(),
          status: "completed",
        },
      );
      setPurchasedTemplates((prev) => [...prev, showPayment]);
      setCardDetails({ cardNumber: "", expiryDate: "", cvv: "", cardName: "" });
      setShowPayment(null);
      alert(
        "✅ Payment successful!\n\nYour report card template is now available.",
      );
    } catch (error) {
      alert("❌ Payment failed. Please try again.");
    } finally {
      setPaymentProcessing(false);
    }
  };

  const formatCardNumber = (v) => {
    const c = v.replace(/\s/g, "");
    const ch = c.match(/.{1,4}/g);
    return ch ? ch.join(" ") : c;
  };
  const formatExpiryDate = (v) => {
    const c = v.replace(/\D/g, "");
    return c.length >= 2 ? c.slice(0, 2) + "/" + c.slice(2, 4) : c;
  };

  const categories = [
    { id: "all", name: "All Templates" },
    { id: "free", name: "Free" },
    { id: "premium", name: "Premium" },
    { id: "modern", name: "Intermediate" },
    { id: "courses", name: "Early Childhood" },
  ];

  const filteredTemplates = Object.values(TEMPLATES).filter(
    (t) => selectedCategory === "all" || t.category === selectedCategory,
  );

  const colorMap = {
    green: {
      ring: "ring-green-400",
      badge: "from-green-500 to-emerald-600",
      text: "text-green-600",
    },
    blue: {
      ring: "ring-blue-400",
      badge: "from-blue-600 to-indigo-600",
      text: "text-blue-600",
    },
    indigo: {
      ring: "ring-indigo-400",
      badge: "from-indigo-500 to-blue-600",
      text: "text-indigo-600",
    },
    purple: {
      ring: "ring-purple-400",
      badge: "from-purple-500 to-pink-500",
      text: "text-purple-600",
    },
  };

  const selectedCategoryName =
    categories.find((c) => c.id === selectedCategory)?.name || "All Templates";

  if (loading)
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading templates...</p>
        </div>
      </div>
    );

  return (
    <div className="space-y-4 sm:space-y-6 px-0">
      {/* Stats — 3 cols on all sizes but tighter on mobile */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {[
          {
            value: purchasedTemplates.length,
            label: "Templates Owned",
            color: "text-indigo-600",
          },
          {
            value: Object.keys(TEMPLATES).length,
            label: "Total Available",
            color: "text-blue-600",
          },
          {
            value: `R${Object.values(TEMPLATES)
              .filter((t) => purchasedTemplates.includes(t.id))
              .reduce((s, t) => s + t.price, 0)}`,
            label: "Total Value",
            color: "text-green-600",
          },
        ].map(({ value, label, color }) => (
          <div
            key={label}
            className="bg-white p-3 sm:p-4 rounded-xl border border-gray-200 shadow-sm"
          >
            <div className={`text-xl sm:text-2xl font-bold ${color}`}>
              {value}
            </div>
            <div className="text-xs sm:text-sm text-gray-500 leading-tight mt-0.5">
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Filters — scrollable row on mobile, wrap on larger */}
      <div className="relative">
        {/* Mobile: dropdown */}
        <div className="sm:hidden">
          <button
            onClick={() => setFilterOpen((f) => !f)}
            className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 shadow-sm"
          >
            <span>{selectedCategoryName}</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${filterOpen ? "rotate-180" : ""}`}
            />
          </button>
          {filterOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setFilterOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors ${
                    selectedCategory === cat.id
                      ? "bg-indigo-600 text-white"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tablet+: scrollable pill row */}
        <div className="hidden sm:flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                selectedCategory === cat.id
                  ? "bg-indigo-600 text-white shadow-md scale-105"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid — 1 col on mobile, 2 on sm, 3 on md+ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-4">
        {filteredTemplates.map((template) => {
          const isPurchased = purchasedTemplates.includes(template.id);
          const Icon = template.icon;
          const colors = colorMap[template.color] || colorMap.blue;
          const SVGComp = template.SVGPreview;

          return (
            <div
              key={template.id}
              className={`bg-white rounded-2xl border-2 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${
                isPurchased
                  ? "border-green-300"
                  : "border-gray-200 hover:border-indigo-300"
              }`}
            >
              {/* SVG Preview area — taller on mobile for better readability */}
              <div
                className="relative bg-gray-50 border-b border-gray-100"
                style={{ height: 200 }}
              >
                <div className="w-full h-full p-2">
                  <SVGComp />
                </div>
                {!isPurchased && template.isPremium && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent flex items-end justify-center pb-4 pointer-events-none">
                    <div className="flex items-center gap-2 bg-black/70 text-white px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm">
                      <Lock className="w-3.5 h-3.5" />
                      Purchase to unlock
                    </div>
                  </div>
                )}
                {template.isPremium && !isPurchased && (
                  <div
                    className={`absolute top-3 right-3 bg-gradient-to-r ${colors.badge} text-white px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg`}
                  >
                    <Sparkles className="w-3 h-3" />
                    Premium
                  </div>
                )}
                {isPurchased && (
                  <div className="absolute top-3 left-3 bg-green-500 text-white px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                    <Check className="w-3 h-3" />
                    Owned
                  </div>
                )}
                {!template.isPremium && (
                  <div className="absolute top-3 right-3 bg-green-500 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-lg">
                    Free
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4 sm:p-5">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Icon
                        className={`w-4 h-4 flex-shrink-0 ${colors.text}`}
                      />
                      <h3 className="text-sm sm:text-base font-bold text-gray-900 truncate">
                        {template.name}
                      </h3>
                    </div>
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      {template.subtitle}
                    </span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {template.isPremium ? (
                      <>
                        <div
                          className={`text-xl sm:text-2xl font-bold ${colors.text}`}
                        >
                          R{template.price}
                        </div>
                        <div className="text-xs text-gray-400">one-time</div>
                      </>
                    ) : (
                      <>
                        <div className="text-xl sm:text-2xl font-bold text-green-600">
                          Free
                        </div>
                        <div className="text-xs text-gray-400">included</div>
                      </>
                    )}
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-gray-500 mb-3 line-clamp-2">
                  {template.description}
                </p>

                <ul className="space-y-1 mb-4">
                  {template.features.map((f, i) => (
                    <li
                      key={i}
                      className="text-xs sm:text-sm text-gray-600 flex items-start gap-2"
                    >
                      <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => setShowPreview(template.id)}
                    className="flex-1 px-2 sm:px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-1.5 text-xs sm:text-sm text-gray-600 transition-all"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Preview
                  </button>
                  {isPurchased ? (
                    <div className="flex-1 px-2 sm:px-3 py-2 bg-green-50 text-green-700 rounded-lg font-semibold flex items-center justify-center gap-1.5 text-xs sm:text-sm border border-green-200">
                      <Check className="w-3.5 h-3.5" />
                      Owned
                    </div>
                  ) : (
                    <button
                      onClick={() => handlePurchase(template.id)}
                      className={`flex-1 px-2 sm:px-3 py-2 bg-gradient-to-r ${colors.badge} text-white rounded-lg font-semibold flex items-center justify-center gap-1.5 text-xs sm:text-sm shadow hover:shadow-md transition-all`}
                    >
                      {template.isPremium ? (
                        <>
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span className="hidden xs:inline">Buy</span> R
                          {template.price}
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          Get Free
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Help */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 sm:p-6">
        <h3 className="font-semibold text-indigo-900 mb-2 flex items-center gap-2 text-sm sm:text-base">
          <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
          How to use your report templates
        </h3>
        <ol className="text-xs sm:text-sm text-indigo-800 space-y-1.5 list-decimal list-inside">
          <li>Purchase the template that matches your school phase</li>
          <li>
            Go to <strong>Reports</strong> from the sidebar
          </li>
          <li>
            Click the <strong>Template</strong> dropdown in the preview panel
          </li>
          <li>
            Select your purchased template — locked ones require purchase first
          </li>
          <li>Fill in learner details and print or save as PDF</li>
        </ol>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-4 sm:p-5 border-b flex items-center justify-between bg-gray-50 flex-shrink-0">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                  {TEMPLATES[showPreview].name}
                </h2>
                <p className="text-xs sm:text-sm text-gray-500">
                  {TEMPLATES[showPreview].subtitle}
                </p>
              </div>
              <button
                onClick={() => setShowPreview(null)}
                className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-200 text-gray-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-auto p-4 sm:p-6 bg-gray-100 flex-1">
              <div className="max-w-sm mx-auto bg-white rounded-xl shadow-xl overflow-hidden">
                {React.createElement(TEMPLATES[showPreview].SVGPreview)}
              </div>
            </div>
            <div className="p-4 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white flex-shrink-0">
              <div className="text-xs sm:text-sm text-gray-500 line-clamp-2">
                {TEMPLATES[showPreview].description}
              </div>
              {purchasedTemplates.includes(showPreview) ? (
                <div className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-semibold flex items-center justify-center gap-2 text-sm border border-green-200 flex-shrink-0">
                  <Check className="w-4 h-4" />
                  Owned
                </div>
              ) : (
                <button
                  onClick={() => {
                    setShowPreview(null);
                    handlePurchase(showPreview);
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 text-sm flex-shrink-0 hover:bg-indigo-700 transition-colors"
                >
                  {TEMPLATES[showPreview].isPremium ? (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      Buy for R{TEMPLATES[showPreview].price}
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Get Free
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[96vh] overflow-auto shadow-2xl">
            <div className="p-5 sm:p-6 border-b bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-t-2xl sticky top-0 z-10">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-lg sm:text-xl font-bold">
                  Complete Purchase
                </h2>
                <button
                  onClick={() => {
                    setShowPayment(null);
                    setCardDetails({
                      cardNumber: "",
                      expiryDate: "",
                      cvv: "",
                      cardName: "",
                    });
                  }}
                  className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors"
                  disabled={paymentProcessing}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-indigo-100 text-sm">
                {TEMPLATES[showPayment].name} ·{" "}
                {TEMPLATES[showPayment].subtitle}
              </p>
            </div>

            {/* Use div with onSubmit-equivalent button instead of form to avoid issues */}
            <div className="p-5 sm:p-6 space-y-4">
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-center">
                <div className="text-xs text-gray-500 mb-1">Total Amount</div>
                <div className="text-4xl font-bold text-indigo-600">
                  R{TEMPLATES[showPayment].price}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  One-time payment · Lifetime access
                </div>
              </div>

              {[
                {
                  label: "Cardholder Name",
                  key: "cardName",
                  type: "text",
                  placeholder: "John Smith",
                },
                {
                  label: "Card Number",
                  key: "cardNumber",
                  type: "text",
                  placeholder: "1234 5678 9012 3456",
                  mono: true,
                },
              ].map(({ label, key, type, placeholder, mono }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                  </label>
                  <input
                    type={type}
                    value={cardDetails[key]}
                    placeholder={placeholder}
                    disabled={paymentProcessing}
                    className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm ${mono ? "font-mono" : ""}`}
                    onChange={(e) => {
                      if (key === "cardNumber") {
                        const v = e.target.value.replace(/\s/g, "");
                        if (v.length <= 16 && /^\d*$/.test(v))
                          setCardDetails((p) => ({
                            ...p,
                            cardNumber: formatCardNumber(v),
                          }));
                      } else {
                        setCardDetails((p) => ({
                          ...p,
                          [key]: e.target.value,
                        }));
                      }
                    }}
                  />
                </div>
              ))}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    value={cardDetails.expiryDate}
                    placeholder="MM/YY"
                    disabled={paymentProcessing}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "");
                      if (v.length <= 4)
                        setCardDetails((p) => ({
                          ...p,
                          expiryDate: formatExpiryDate(v),
                        }));
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CVV
                  </label>
                  <input
                    type="text"
                    value={cardDetails.cvv}
                    placeholder="123"
                    disabled={paymentProcessing}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "");
                      if (v.length <= 3)
                        setCardDetails((p) => ({ ...p, cvv: v }));
                    }}
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800 flex gap-2">
                <Check className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Secure Payment:</strong> Your payment information is
                  encrypted. We never store your full card details.
                </span>
              </div>

              <button
                onClick={handlePaymentSubmit}
                disabled={paymentProcessing}
                className="w-full px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 text-sm sm:text-base"
              >
                {paymentProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    Pay R{TEMPLATES[showPayment].price}
                  </>
                )}
              </button>
              <p className="text-xs text-center text-gray-400 pb-2">
                By purchasing you agree to our terms and conditions
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Templates;
