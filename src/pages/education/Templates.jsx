import React, { useState } from "react";
import {
  Star,
  ShoppingCart,
  Check,
  Eye,
  Sparkles,
  Lock,
  X,
  ChevronDown,
  Award,
  Heart,
  Zap,
  Sun,
  Palette,
  BookOpen,
  Trophy,
  Leaf,
  Rocket,
} from "lucide-react";

/* ─────────────────────────────────────────────
   GRADE OPTIONS  (R – 7)
───────────────────────────────────────────── */
const GRADES = [
  "Grade R",
  "Grade 1",
  "Grade 2",
  "Grade 3",
  "Grade 4",
  "Grade 5",
  "Grade 6",
  "Grade 7",
];
const CURRENT_YEAR = new Date().getFullYear();

/* ─────────────────────────────────────────────
   CERTIFICATE SVGs  (all accept { grade } prop)
───────────────────────────────────────────── */

// 1. RAINBOW STAR — General Achievement
export const RainbowStarSVG = ({ grade = "Grade R" }) => (
  <svg
    viewBox="0 0 595 842"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-full"
  >
    <defs>
      <linearGradient id="rs_bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFFDE7" />
        <stop offset="100%" stopColor="#FCE4EC" />
      </linearGradient>
      <linearGradient id="rs_rainbow" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#FF6B9D" />
        <stop offset="20%" stopColor="#FF8C42" />
        <stop offset="40%" stopColor="#FFD93D" />
        <stop offset="60%" stopColor="#6BCB77" />
        <stop offset="80%" stopColor="#4FC3F7" />
        <stop offset="100%" stopColor="#9B59B6" />
      </linearGradient>
    </defs>
    <rect width="595" height="842" fill="url(#rs_bg)" />
    <rect x="0" y="0" width="595" height="18" fill="url(#rs_rainbow)" />
    <rect x="0" y="824" width="595" height="18" fill="url(#rs_rainbow)" />
    <rect
      x="24"
      y="26"
      width="547"
      height="790"
      rx="18"
      fill="none"
      stroke="#FF6B9D"
      strokeWidth="2.5"
      strokeDasharray="10 5"
    />
    <rect
      x="32"
      y="34"
      width="531"
      height="774"
      rx="14"
      fill="none"
      stroke="#FFD93D"
      strokeWidth="1"
    />
    {[
      ["#FF6B9D", 50, 60],
      ["#4FC3F7", 545, 60],
      ["#FFB347", 50, 782],
      ["#A5D6A7", 545, 782],
      ["#CE93D8", 297, 38],
      ["#80DEEA", 297, 804],
    ].map(([c, x, y], i) => (
      <circle key={i} cx={x} cy={y} r="9" fill={c} opacity="0.55" />
    ))}
    {[
      [60, 140, "#FFB347", 22],
      [535, 130, "#FF6B9D", 18],
      [80, 700, "#CE93D8", 16],
      [515, 710, "#4FC3F7", 20],
      [297, 58, "#6BCB77", 14],
      [100, 420, "#FFD93D", 12],
      [490, 410, "#FF6B9D", 12],
    ].map(([x, y, c, s], i) => (
      <text key={i} x={x} y={y} textAnchor="middle" fontSize={s} fill={c}>
        ⭐
      </text>
    ))}
    {["#007A4D", "#FFB612", "#DE3008", "#002395", "#007A4D", "#FFB612"].map(
      (c, i) => (
        <rect
          key={i}
          x={44 + i * 84}
          y="64"
          width="84"
          height="7"
          rx="1"
          fill={c}
        />
      ),
    )}
    <circle
      cx="297"
      cy="150"
      r="60"
      fill="white"
      stroke="#FF6B9D"
      strokeWidth="3"
    />
    <circle
      cx="297"
      cy="150"
      r="52"
      fill="#FFF9C4"
      stroke="#FFD93D"
      strokeWidth="1.5"
      strokeDasharray="4 3"
    />
    <text x="297" y="168" textAnchor="middle" fontSize="52">
      🌟
    </text>
    <text
      x="297"
      y="248"
      textAnchor="middle"
      fontSize="18"
      fontWeight="bold"
      fill="#7E57C2"
      fontFamily="Georgia, serif"
      letterSpacing="3"
    >
      SUNSHINE CRÈCHE &amp; PRIMARY
    </text>
    <text
      x="297"
      y="268"
      textAnchor="middle"
      fontSize="11"
      fill="#9E9E9E"
      fontFamily="Georgia, serif"
    >
      Registered ECD &amp; Primary School · South Africa
    </text>
    <path
      d="M120 284 Q297 296 474 284"
      fill="none"
      stroke="#FFB347"
      strokeWidth="2"
    />
    <circle cx="297" cy="284" r="5" fill="#FFB347" />
    <rect x="80" y="300" width="435" height="52" rx="26" fill="#FF6B9D" />
    <rect
      x="84"
      y="304"
      width="427"
      height="44"
      rx="22"
      fill="none"
      stroke="rgba(255,255,255,0.4)"
      strokeWidth="1.5"
    />
    <text
      x="297"
      y="331"
      textAnchor="middle"
      fontSize="20"
      fontWeight="bold"
      fill="white"
      fontFamily="Georgia, serif"
      letterSpacing="2"
    >
      CERTIFICATE OF ACHIEVEMENT
    </text>
    <text
      x="297"
      y="386"
      textAnchor="middle"
      fontSize="13"
      fill="#757575"
      fontFamily="Georgia, serif"
    >
      This certificate is proudly awarded to
    </text>
    <text
      x="297"
      y="448"
      textAnchor="middle"
      fontSize="30"
      fontWeight="bold"
      fill="#1A237E"
      fontFamily="Georgia, serif"
      fontStyle="italic"
    >
      ________________________________
    </text>
    <path
      d="M130 455 Q297 462 464 455"
      fill="none"
      stroke="#FF6B9D"
      strokeWidth="1.5"
    />
    <rect x="185" y="468" width="225" height="32" rx="16" fill="#7E57C2" />
    <text
      x="297"
      y="489"
      textAnchor="middle"
      fontSize="13"
      fontWeight="bold"
      fill="white"
      fontFamily="Georgia, serif"
    >
      {grade} · {CURRENT_YEAR}
    </text>
    <text
      x="297"
      y="536"
      textAnchor="middle"
      fontSize="13"
      fill="#555"
      fontFamily="Georgia, serif"
    >
      for demonstrating outstanding effort,
    </text>
    <text
      x="297"
      y="556"
      textAnchor="middle"
      fontSize="13"
      fill="#555"
      fontFamily="Georgia, serif"
    >
      enthusiasm and love of learning.
    </text>
    <text x="183" y="600" textAnchor="middle" fontSize="28">
      ⭐
    </text>
    <text x="240" y="600" textAnchor="middle" fontSize="28">
      ⭐
    </text>
    <text x="297" y="600" textAnchor="middle" fontSize="36">
      🌟
    </text>
    <text x="354" y="600" textAnchor="middle" fontSize="28">
      ⭐
    </text>
    <text x="411" y="600" textAnchor="middle" fontSize="28">
      ⭐
    </text>
    <text
      x="297"
      y="636"
      textAnchor="middle"
      fontSize="10"
      fill="#BDBDBD"
      fontFamily="Georgia, serif"
    >
      Issued in accordance with the South African National Curriculum (CAPS) ·{" "}
      {grade}
    </text>
    <line
      x1="100"
      y1="700"
      x2="240"
      y2="700"
      stroke="#E0E0E0"
      strokeWidth="1.5"
    />
    <text
      x="170"
      y="716"
      textAnchor="middle"
      fontSize="11"
      fill="#9E9E9E"
      fontFamily="Georgia, serif"
    >
      Class Teacher
    </text>
    <text
      x="170"
      y="730"
      textAnchor="middle"
      fontSize="10"
      fill="#BDBDBD"
      fontFamily="Georgia, serif"
    >
      Date: _______________
    </text>
    <circle
      cx="297"
      cy="706"
      r="28"
      fill="white"
      stroke="#FFD93D"
      strokeWidth="2"
    />
    <circle cx="297" cy="706" r="22" fill="#FFF9C4" />
    <text x="297" y="714" textAnchor="middle" fontSize="24">
      🏅
    </text>
    <line
      x1="355"
      y1="700"
      x2="495"
      y2="700"
      stroke="#E0E0E0"
      strokeWidth="1.5"
    />
    <text
      x="425"
      y="716"
      textAnchor="middle"
      fontSize="11"
      fill="#9E9E9E"
      fontFamily="Georgia, serif"
    >
      Principal
    </text>
    <text
      x="425"
      y="730"
      textAnchor="middle"
      fontSize="10"
      fill="#BDBDBD"
      fontFamily="Georgia, serif"
    >
      Date: _______________
    </text>
    <circle
      cx="297"
      cy="778"
      r="34"
      fill="none"
      stroke="#FF6B9D"
      strokeWidth="1.5"
      strokeDasharray="4 2"
    />
    <text
      x="297"
      y="771"
      textAnchor="middle"
      fontSize="8"
      fill="#FF6B9D"
      fontFamily="Georgia, serif"
    >
      SCHOOL
    </text>
    <text
      x="297"
      y="783"
      textAnchor="middle"
      fontSize="8"
      fill="#FF6B9D"
      fontFamily="Georgia, serif"
    >
      STAMP
    </text>
  </svg>
);

// 2. BRAVERY BADGE — Courage & Confidence
export const BraveryBadgeSVG = ({ grade = "Grade R" }) => (
  <svg
    viewBox="0 0 595 842"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-full"
  >
    <defs>
      <linearGradient id="bb_bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#E3F2FD" />
        <stop offset="100%" stopColor="#E8F5E9" />
      </linearGradient>
      <linearGradient id="bb_shield" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#1565C0" />
        <stop offset="100%" stopColor="#0D47A1" />
      </linearGradient>
    </defs>
    <rect width="595" height="842" fill="url(#bb_bg)" />
    {["#007A4D", "#FFB612", "#DE3008", "#002395", "#007A4D", "#FFB612"].map(
      (c, i) => (
        <rect key={i} x={i * 99.2} y="0" width="99.2" height="14" fill={c} />
      ),
    )}
    {["#007A4D", "#FFB612", "#DE3008", "#002395", "#007A4D", "#FFB612"].map(
      (c, i) => (
        <rect key={i} x={i * 99.2} y="828" width="99.2" height="14" fill={c} />
      ),
    )}
    <path
      d="M0,22 L15,36 L30,22 L45,36 L60,22 L75,36 L90,22 L105,36 L120,22 L135,36 L150,22 L165,36 L180,22 L195,36 L210,22 L225,36 L240,22 L255,36 L270,22 L285,36 L300,22 L315,36 L330,22 L345,36 L360,22 L375,36 L390,22 L405,36 L420,22 L435,36 L450,22 L465,36 L480,22 L495,36 L510,22 L525,36 L540,22 L555,36 L570,22 L585,36 L595,22"
      fill="none"
      stroke="#42A5F5"
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
    <rect
      x="28"
      y="42"
      width="539"
      height="758"
      rx="12"
      fill="none"
      stroke="#1565C0"
      strokeWidth="3"
    />
    <rect
      x="36"
      y="50"
      width="523"
      height="742"
      rx="8"
      fill="none"
      stroke="#66BB6A"
      strokeWidth="1"
      strokeDasharray="6 4"
    />
    <text
      x="297"
      y="96"
      textAnchor="middle"
      fontSize="16"
      fontWeight="bold"
      fill="#1565C0"
      fontFamily="Georgia, serif"
      letterSpacing="3"
    >
      LITTLE STEPS SCHOOL
    </text>
    <text
      x="297"
      y="114"
      textAnchor="middle"
      fontSize="11"
      fill="#78909C"
      fontFamily="Georgia, serif"
    >
      Foundation &amp; Intermediate Phase · South Africa
    </text>
    <line
      x1="100"
      y1="126"
      x2="495"
      y2="126"
      stroke="#90CAF9"
      strokeWidth="1.5"
    />
    <path
      d="M297,148 L390,192 L390,280 Q390,350 297,390 Q204,350 204,280 L204,192 Z"
      fill="url(#bb_shield)"
    />
    <path
      d="M297,158 L378,198 L378,278 Q378,340 297,376 Q216,340 216,278 L216,198 Z"
      fill="#42A5F5"
    />
    <path
      d="M297,172 L362,206 L362,274 Q362,326 297,358 Q232,326 232,274 L232,206 Z"
      fill="none"
      stroke="rgba(255,255,255,0.3)"
      strokeWidth="1.5"
    />
    <text x="297" y="296" textAnchor="middle" fontSize="72">
      🦁
    </text>
    {[
      [172, 188, "#FFD700", 20],
      [422, 188, "#FFD700", 20],
      [148, 290, "#4FC3F7", 16],
      [446, 290, "#4FC3F7", 16],
      [170, 392, "#FFD700", 18],
      [424, 392, "#FFD700", 18],
    ].map(([x, y, c, s], i) => (
      <text key={i} x={x} y={y} textAnchor="middle" fontSize={s} fill={c}>
        ★
      </text>
    ))}
    <rect x="90" y="418" width="415" height="48" rx="24" fill="#1565C0" />
    <text
      x="297"
      y="447"
      textAnchor="middle"
      fontSize="19"
      fontWeight="bold"
      fill="white"
      fontFamily="Georgia, serif"
      letterSpacing="2"
    >
      BRAVERY &amp; COURAGE AWARD
    </text>
    <text
      x="297"
      y="494"
      textAnchor="middle"
      fontSize="13"
      fill="#546E7A"
      fontFamily="Georgia, serif"
    >
      This certificate is awarded with great pride to
    </text>
    <text
      x="297"
      y="556"
      textAnchor="middle"
      fontSize="30"
      fontWeight="bold"
      fill="#0D47A1"
      fontFamily="Georgia, serif"
      fontStyle="italic"
    >
      ________________________________
    </text>
    <path
      d="M130 563 Q297 570 464 563"
      fill="none"
      stroke="#42A5F5"
      strokeWidth="1.5"
    />
    <rect x="185" y="576" width="225" height="30" rx="15" fill="#66BB6A" />
    <text
      x="297"
      y="596"
      textAnchor="middle"
      fontSize="13"
      fontWeight="bold"
      fill="white"
      fontFamily="Georgia, serif"
    >
      {grade} · {CURRENT_YEAR}
    </text>
    <text
      x="297"
      y="636"
      textAnchor="middle"
      fontSize="12"
      fill="#546E7A"
      fontFamily="Georgia, serif"
    >
      for showing exceptional bravery, confidence
    </text>
    <text
      x="297"
      y="654"
      textAnchor="middle"
      fontSize="12"
      fill="#546E7A"
      fontFamily="Georgia, serif"
    >
      and courage in the classroom every day.
    </text>
    <circle
      cx="148"
      cy="714"
      r="36"
      fill="white"
      stroke="#FFB300"
      strokeWidth="2.5"
    />
    <circle cx="148" cy="714" r="28" fill="#FFF9C4" />
    <text x="148" y="722" textAnchor="middle" fontSize="32">
      🏅
    </text>
    <circle
      cx="447"
      cy="714"
      r="36"
      fill="white"
      stroke="#E91E63"
      strokeWidth="2.5"
    />
    <circle cx="447" cy="714" r="28" fill="#FCE4EC" />
    <text x="447" y="722" textAnchor="middle" fontSize="32">
      💫
    </text>
    <line
      x1="180"
      y1="760"
      x2="310"
      y2="760"
      stroke="#B0BEC5"
      strokeWidth="1.5"
    />
    <text
      x="245"
      y="774"
      textAnchor="middle"
      fontSize="11"
      fill="#90A4AE"
      fontFamily="Georgia, serif"
    >
      Class Teacher
    </text>
    <text
      x="245"
      y="788"
      textAnchor="middle"
      fontSize="10"
      fill="#B0BEC5"
      fontFamily="Georgia, serif"
    >
      Date: _______________
    </text>
    <line
      x1="320"
      y1="760"
      x2="450"
      y2="760"
      stroke="#B0BEC5"
      strokeWidth="1.5"
    />
    <text
      x="385"
      y="774"
      textAnchor="middle"
      fontSize="11"
      fill="#90A4AE"
      fontFamily="Georgia, serif"
    >
      Principal
    </text>
    <text
      x="385"
      y="788"
      textAnchor="middle"
      fontSize="10"
      fill="#B0BEC5"
      fontFamily="Georgia, serif"
    >
      Date: _______________
    </text>
    <text
      x="297"
      y="820"
      textAnchor="middle"
      fontSize="9"
      fill="#90A4AE"
      fontFamily="Georgia, serif"
    >
      Issued in accordance with the South African National Curriculum (CAPS) ·{" "}
      {grade}
    </text>
  </svg>
);

// 3. GOLDEN APPLE — Academic Excellence
export const GoldenAppleSVG = ({ grade = "Grade R" }) => (
  <svg
    viewBox="0 0 595 842"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-full"
  >
    <defs>
      <linearGradient id="ga_bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFFDE7" />
        <stop offset="100%" stopColor="#FFF8E1" />
      </linearGradient>
      <linearGradient id="ga_gold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFD54F" />
        <stop offset="100%" stopColor="#FF8F00" />
      </linearGradient>
      <linearGradient id="ga_banner" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#BF360C" />
        <stop offset="50%" stopColor="#E64A19" />
        <stop offset="100%" stopColor="#BF360C" />
      </linearGradient>
    </defs>
    <rect width="595" height="842" fill="url(#ga_bg)" />
    <rect
      x="16"
      y="16"
      width="563"
      height="810"
      rx="6"
      fill="none"
      stroke="url(#ga_gold)"
      strokeWidth="4"
    />
    <rect
      x="24"
      y="24"
      width="547"
      height="794"
      rx="4"
      fill="none"
      stroke="#FFD54F"
      strokeWidth="1.5"
    />
    <rect
      x="30"
      y="30"
      width="535"
      height="782"
      rx="2"
      fill="none"
      stroke="#FFD54F"
      strokeWidth="0.6"
      strokeDasharray="6 4"
    />
    {[
      [42, 42],
      [553, 42],
      [42, 800],
      [553, 800],
    ].map(([x, y], i) => (
      <text
        key={i}
        x={x}
        y={y}
        textAnchor="middle"
        fontSize="22"
        fill="#FFD54F"
        fontFamily="serif"
      >
        ✦
      </text>
    ))}
    {[
      [297, 42],
      [42, 421],
      [553, 421],
      [297, 800],
    ].map(([x, y], i) => (
      <text
        key={i}
        x={x}
        y={y}
        textAnchor="middle"
        fontSize="16"
        fill="#FF8F00"
        fontFamily="serif"
      >
        ◆
      </text>
    ))}
    {["#007A4D", "#FFB612", "#DE3008", "#002395", "#007A4D", "#FFB612"].map(
      (c, i) => (
        <rect
          key={i}
          x={44 + i * 84}
          y="58"
          width="84"
          height="8"
          rx="1"
          fill={c}
        />
      ),
    )}
    <text
      x="297"
      y="96"
      textAnchor="middle"
      fontSize="13"
      fill="#E65100"
      fontFamily="Georgia, serif"
      letterSpacing="4"
      fontWeight="bold"
    >
      GOLDEN APPLE ACADEMY
    </text>
    <text
      x="297"
      y="112"
      textAnchor="middle"
      fontSize="10"
      fill="#BF360C"
      fontFamily="Georgia, serif"
    >
      ── Foundation &amp; Senior Primary · South Africa ──
    </text>
    <circle
      cx="297"
      cy="200"
      r="72"
      fill="white"
      stroke="url(#ga_gold)"
      strokeWidth="3"
    />
    <circle cx="297" cy="200" r="64" fill="#FFFDE7" />
    <text x="297" y="224" textAnchor="middle" fontSize="72">
      🍎
    </text>
    <path
      d="M60,290 L80,278 L515,278 L535,290 L515,302 L80,302 Z"
      fill="url(#ga_banner)"
    />
    <path d="M80,278 L60,266 L68,290 L60,314 L80,302 Z" fill="#8B2500" />
    <path d="M515,278 L535,266 L527,290 L535,314 L515,302 Z" fill="#8B2500" />
    <text
      x="297"
      y="296"
      textAnchor="middle"
      fontSize="18"
      fontWeight="bold"
      fill="white"
      fontFamily="Georgia, serif"
      letterSpacing="3"
    >
      CERTIFICATE OF EXCELLENCE
    </text>
    <path d="M120 318 L220 318" stroke="#FFD54F" strokeWidth="1.5" />
    <text x="297" y="322" textAnchor="middle" fontSize="16" fill="#FF8F00">
      ✦
    </text>
    <path d="M374 318 L474 318" stroke="#FFD54F" strokeWidth="1.5" />
    <text
      x="297"
      y="356"
      textAnchor="middle"
      fontSize="13"
      fill="#795548"
      fontFamily="Georgia, serif"
    >
      This certificate is presented to
    </text>
    <text
      x="297"
      y="420"
      textAnchor="middle"
      fontSize="30"
      fontWeight="bold"
      fill="#4A148C"
      fontFamily="Georgia, serif"
      fontStyle="italic"
    >
      ________________________________
    </text>
    <path
      d="M110 428 Q297 436 484 428"
      fill="none"
      stroke="url(#ga_gold)"
      strokeWidth="1.5"
    />
    <rect
      x="185"
      y="444"
      width="225"
      height="32"
      rx="16"
      fill="url(#ga_gold)"
    />
    <text
      x="297"
      y="465"
      textAnchor="middle"
      fontSize="13"
      fontWeight="bold"
      fill="white"
      fontFamily="Georgia, serif"
    >
      {grade} · {CURRENT_YEAR}
    </text>
    <text
      x="297"
      y="510"
      textAnchor="middle"
      fontSize="13"
      fill="#5D4037"
      fontFamily="Georgia, serif"
    >
      for showing outstanding dedication,
    </text>
    <text
      x="297"
      y="528"
      textAnchor="middle"
      fontSize="13"
      fill="#5D4037"
      fontFamily="Georgia, serif"
    >
      hard work and a love of learning.
    </text>
    <text x="220" y="605" textAnchor="middle" fontSize="64">
      🍎
    </text>
    <text x="374" y="605" textAnchor="middle" fontSize="64">
      📜
    </text>
    <path d="M120 630 L220 630" stroke="#FFD54F" strokeWidth="1.5" />
    <text x="297" y="634" textAnchor="middle" fontSize="16" fill="#FF8F00">
      ✦
    </text>
    <path d="M374 630 L474 630" stroke="#FFD54F" strokeWidth="1.5" />
    <text
      x="297"
      y="658"
      textAnchor="middle"
      fontSize="10"
      fill="#BDBDBD"
      fontFamily="Georgia, serif"
    >
      Issued in accordance with the South African National Curriculum (CAPS) ·{" "}
      {grade}
    </text>
    <line
      x1="90"
      y1="716"
      x2="240"
      y2="716"
      stroke="url(#ga_gold)"
      strokeWidth="1.5"
    />
    <text
      x="165"
      y="730"
      textAnchor="middle"
      fontSize="11"
      fill="#9E9E9E"
      fontFamily="Georgia, serif"
    >
      Class Teacher
    </text>
    <text
      x="165"
      y="744"
      textAnchor="middle"
      fontSize="10"
      fill="#BDBDBD"
      fontFamily="Georgia, serif"
    >
      Date: _______________
    </text>
    <circle
      cx="297"
      cy="726"
      r="34"
      fill="white"
      stroke="url(#ga_gold)"
      strokeWidth="2.5"
    />
    <circle cx="297" cy="726" r="26" fill="#FFFDE7" />
    <text
      x="297"
      y="719"
      textAnchor="middle"
      fontSize="9"
      fill="#E65100"
      fontFamily="Georgia, serif"
    >
      OFFICIAL
    </text>
    <text
      x="297"
      y="731"
      textAnchor="middle"
      fontSize="9"
      fill="#E65100"
      fontFamily="Georgia, serif"
    >
      SEAL
    </text>
    <circle
      cx="297"
      cy="726"
      r="34"
      fill="none"
      stroke="#FFD54F"
      strokeWidth="1"
      strokeDasharray="3 2"
    />
    <line
      x1="354"
      y1="716"
      x2="504"
      y2="716"
      stroke="url(#ga_gold)"
      strokeWidth="1.5"
    />
    <text
      x="429"
      y="730"
      textAnchor="middle"
      fontSize="11"
      fill="#9E9E9E"
      fontFamily="Georgia, serif"
    >
      Principal
    </text>
    <text
      x="429"
      y="744"
      textAnchor="middle"
      fontSize="10"
      fill="#BDBDBD"
      fontFamily="Georgia, serif"
    >
      Date: _______________
    </text>
    {["#007A4D", "#FFB612", "#DE3008", "#002395", "#007A4D", "#FFB612"].map(
      (c, i) => (
        <rect
          key={i}
          x={44 + i * 84}
          y="776"
          width="84"
          height="8"
          rx="1"
          fill={c}
        />
      ),
    )}
    <text
      x="297"
      y="808"
      textAnchor="middle"
      fontSize="9"
      fill="#BDBDBD"
      fontFamily="Georgia, serif"
    >
      Golden Apple Academy · CAPS Certificate · {CURRENT_YEAR}
    </text>
  </svg>
);

// 4. FRIENDSHIP BLOSSOM — Social & Emotional
export const FriendshipBlossomSVG = ({ grade = "Grade R" }) => (
  <svg
    viewBox="0 0 595 842"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-full"
  >
    <defs>
      <linearGradient id="fb_bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FCE4EC" />
        <stop offset="40%" stopColor="#F3E5F5" />
        <stop offset="100%" stopColor="#EDE7F6" />
      </linearGradient>
      <linearGradient id="fb_banner" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#AD1457" />
        <stop offset="50%" stopColor="#E91E63" />
        <stop offset="100%" stopColor="#AD1457" />
      </linearGradient>
    </defs>
    <rect width="595" height="842" fill="url(#fb_bg)" />
    {Array.from({ length: 18 }).map((_, i) => (
      <ellipse
        key={`t${i}`}
        cx={16 + i * 32}
        cy={18}
        rx="12"
        ry="16"
        fill="#F48FB1"
        opacity="0.4"
      />
    ))}
    {Array.from({ length: 18 }).map((_, i) => (
      <ellipse
        key={`b${i}`}
        cx={16 + i * 32}
        cy={824}
        rx="12"
        ry="16"
        fill="#CE93D8"
        opacity="0.4"
      />
    ))}
    {Array.from({ length: 12 }).map((_, i) => (
      <ellipse
        key={`l${i}`}
        cx={16}
        cy={60 + i * 62}
        rx="16"
        ry="10"
        fill="#F48FB1"
        opacity="0.3"
      />
    ))}
    {Array.from({ length: 12 }).map((_, i) => (
      <ellipse
        key={`r${i}`}
        cx={579}
        cy={60 + i * 62}
        rx="16"
        ry="10"
        fill="#CE93D8"
        opacity="0.3"
      />
    ))}
    <rect
      x="36"
      y="36"
      width="523"
      height="770"
      rx="16"
      fill="none"
      stroke="#F48FB1"
      strokeWidth="2"
      strokeDasharray="8 5"
    />
    {[
      ["❤️", 60, 90, 18],
      ["🌸", 530, 80, 20],
      ["💕", 54, 400, 16],
      ["🌺", 535, 410, 18],
      ["💖", 297, 50, 16],
      ["🌷", 150, 760, 16],
      ["🌻", 440, 758, 16],
    ].map(([e, x, y, s], i) => (
      <text key={i} x={x} y={y} textAnchor="middle" fontSize={s}>
        {e}
      </text>
    ))}
    {["#007A4D", "#FFB612", "#DE3008", "#002395", "#007A4D", "#FFB612"].map(
      (c, i) => (
        <rect
          key={i}
          x={44 + i * 84}
          y="56"
          width="84"
          height="7"
          rx="1"
          fill={c}
        />
      ),
    )}
    <text
      x="297"
      y="96"
      textAnchor="middle"
      fontSize="17"
      fontWeight="bold"
      fill="#880E4F"
      fontFamily="Georgia, serif"
      letterSpacing="2"
    >
      BLOSSOM PRIMARY SCHOOL
    </text>
    <path
      d="M100 106 Q297 114 494 106"
      fill="none"
      stroke="#F48FB1"
      strokeWidth="1.5"
    />
    <text
      x="297"
      y="122"
      textAnchor="middle"
      fontSize="11"
      fill="#AD1457"
      fontFamily="Georgia, serif"
    >
      Foundation &amp; Intermediate Phase · South Africa
    </text>
    <circle
      cx="297"
      cy="218"
      r="76"
      fill="white"
      stroke="#F48FB1"
      strokeWidth="3"
    />
    <circle cx="297" cy="218" r="66" fill="#FCE4EC" />
    {Array.from({ length: 8 }).map((_, i) => (
      <ellipse
        key={i}
        cx={297 + 58 * Math.cos((i * 45 * Math.PI) / 180)}
        cy={218 + 58 * Math.sin((i * 45 * Math.PI) / 180)}
        rx="14"
        ry="9"
        fill="#F48FB1"
        opacity="0.6"
        transform={`rotate(${i * 45}, ${297 + 58 * Math.cos((i * 45 * Math.PI) / 180)}, ${218 + 58 * Math.sin((i * 45 * Math.PI) / 180)})`}
      />
    ))}
    <circle cx="297" cy="218" r="46" fill="#FCE4EC" />
    <text x="297" y="238" textAnchor="middle" fontSize="56">
      🌸
    </text>
    <rect
      x="70"
      y="318"
      width="455"
      height="50"
      rx="25"
      fill="url(#fb_banner)"
    />
    <rect
      x="74"
      y="322"
      width="447"
      height="42"
      rx="21"
      fill="none"
      stroke="rgba(255,255,255,0.35)"
      strokeWidth="1.5"
    />
    <text
      x="297"
      y="349"
      textAnchor="middle"
      fontSize="18"
      fontWeight="bold"
      fill="white"
      fontFamily="Georgia, serif"
      letterSpacing="2"
    >
      KINDNESS &amp; FRIENDSHIP AWARD
    </text>
    <text
      x="297"
      y="394"
      textAnchor="middle"
      fontSize="13"
      fill="#7B1FA2"
      fontFamily="Georgia, serif"
    >
      Awarded with love and warmth to
    </text>
    <text
      x="297"
      y="456"
      textAnchor="middle"
      fontSize="30"
      fontWeight="bold"
      fill="#4A148C"
      fontFamily="Georgia, serif"
      fontStyle="italic"
    >
      ________________________________
    </text>
    <path
      d="M120 463 Q297 470 474 463"
      fill="none"
      stroke="#F48FB1"
      strokeWidth="1.5"
    />
    <rect x="185" y="476" width="225" height="32" rx="16" fill="#CE93D8" />
    <text
      x="297"
      y="497"
      textAnchor="middle"
      fontSize="13"
      fontWeight="bold"
      fill="white"
      fontFamily="Georgia, serif"
    >
      {grade} · {CURRENT_YEAR}
    </text>
    <text
      x="297"
      y="540"
      textAnchor="middle"
      fontSize="13"
      fill="#7B1FA2"
      fontFamily="Georgia, serif"
    >
      for being a wonderful, caring friend
    </text>
    <text
      x="297"
      y="558"
      textAnchor="middle"
      fontSize="13"
      fill="#7B1FA2"
      fontFamily="Georgia, serif"
    >
      and spreading kindness every single day.
    </text>
    <text x="175" y="618" textAnchor="middle" fontSize="40">
      🌸
    </text>
    <text x="247" y="614" textAnchor="middle" fontSize="30">
      🤝
    </text>
    <text x="297" y="622" textAnchor="middle" fontSize="46">
      💝
    </text>
    <text x="347" y="614" textAnchor="middle" fontSize="30">
      🤝
    </text>
    <text x="419" y="618" textAnchor="middle" fontSize="40">
      🌺
    </text>
    <text
      x="297"
      y="650"
      textAnchor="middle"
      fontSize="10"
      fill="#CE93D8"
      fontFamily="Georgia, serif"
    >
      Issued in accordance with the South African National Curriculum (CAPS) ·{" "}
      {grade}
    </text>
    <rect
      x="60"
      y="680"
      width="475"
      height="72"
      rx="12"
      fill="rgba(255,255,255,0.6)"
      stroke="#F48FB1"
      strokeWidth="1"
    />
    <line
      x1="88"
      y1="726"
      x2="228"
      y2="726"
      stroke="#F48FB1"
      strokeWidth="1.5"
    />
    <text
      x="158"
      y="740"
      textAnchor="middle"
      fontSize="11"
      fill="#9E9E9E"
      fontFamily="Georgia, serif"
    >
      Class Teacher
    </text>
    <text
      x="158"
      y="754"
      textAnchor="middle"
      fontSize="10"
      fill="#BDBDBD"
      fontFamily="Georgia, serif"
    >
      Date: _______________
    </text>
    <circle
      cx="297"
      cy="718"
      r="28"
      fill="white"
      stroke="#F48FB1"
      strokeWidth="2"
    />
    <circle cx="297" cy="718" r="21" fill="#FCE4EC" />
    <text x="297" y="726" textAnchor="middle" fontSize="24">
      🌸
    </text>
    <line
      x1="366"
      y1="726"
      x2="506"
      y2="726"
      stroke="#CE93D8"
      strokeWidth="1.5"
    />
    <text
      x="436"
      y="740"
      textAnchor="middle"
      fontSize="11"
      fill="#9E9E9E"
      fontFamily="Georgia, serif"
    >
      Principal
    </text>
    <text
      x="436"
      y="754"
      textAnchor="middle"
      fontSize="10"
      fill="#BDBDBD"
      fontFamily="Georgia, serif"
    >
      Date: _______________
    </text>
    <circle
      cx="297"
      cy="802"
      r="28"
      fill="none"
      stroke="#F48FB1"
      strokeWidth="1.5"
      strokeDasharray="3 2"
    />
    <text x="297" y="796" textAnchor="middle" fontSize="7" fill="#F48FB1">
      SCHOOL
    </text>
    <text x="297" y="807" textAnchor="middle" fontSize="7" fill="#F48FB1">
      STAMP
    </text>
  </svg>
);

// 5. SPACE EXPLORER — Curiosity & Discovery
export const SpaceExplorerSVG = ({ grade = "Grade R" }) => {
  const stars = [
    [52, 88],
    [178, 44],
    [423, 67],
    [561, 112],
    [88, 201],
    [490, 178],
    [134, 334],
    [522, 298],
    [67, 445],
    [478, 412],
    [310, 156],
    [38, 512],
    [557, 523],
    [200, 612],
    [412, 589],
    [88, 678],
    [501, 667],
    [156, 734],
    [440, 756],
    [297, 820],
    [230, 88],
    [360, 110],
    [100, 300],
    [490, 350],
    [150, 480],
    [520, 490],
    [80, 600],
    [510, 610],
    [260, 700],
    [380, 720],
    [44, 160],
    [548, 155],
    [200, 250],
    [400, 240],
    [130, 390],
    [460, 380],
    [210, 530],
    [380, 545],
    [100, 760],
    [490, 770],
  ];
  return (
    <svg
      viewBox="0 0 595 842"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      <defs>
        <linearGradient id="se_bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0D0D2B" />
          <stop offset="50%" stopColor="#1A0A3E" />
          <stop offset="100%" stopColor="#0A1628" />
        </linearGradient>
        <linearGradient id="se_gold" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#F9A825" />
          <stop offset="50%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#F9A825" />
        </linearGradient>
        <linearGradient id="se_banner" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#4A148C" />
          <stop offset="50%" stopColor="#6A1B9A" />
          <stop offset="100%" stopColor="#4A148C" />
        </linearGradient>
      </defs>
      <rect width="595" height="842" fill="url(#se_bg)" />
      {stars.map(([x, y], i) => {
        const r = [0.8, 1.2, 1.6, 0.6, 1.4][i % 5];
        const op = [0.9, 0.6, 0.8, 0.5, 0.7][i % 5];
        return <circle key={i} cx={x} cy={y} r={r} fill="white" opacity={op} />;
      })}
      <ellipse
        cx="500"
        cy="200"
        rx="200"
        ry="400"
        fill="rgba(100,80,180,0.06)"
        transform="rotate(-30, 500, 200)"
      />
      <rect
        x="18"
        y="18"
        width="559"
        height="806"
        rx="14"
        fill="none"
        stroke="url(#se_gold)"
        strokeWidth="3"
      />
      <rect
        x="26"
        y="26"
        width="543"
        height="790"
        rx="10"
        fill="none"
        stroke="rgba(255,215,0,0.25)"
        strokeWidth="1"
        strokeDasharray="8 4"
      />
      {[
        [40, 48],
        [555, 48],
        [40, 810],
        [555, 810],
      ].map(([x, y], i) => (
        <text
          key={i}
          x={x}
          y={y}
          textAnchor="middle"
          fontSize="20"
          fill="#FFD700"
          opacity="0.8"
        >
          ✦
        </text>
      ))}
      {["#00A550", "#FFB612", "#DE3008", "#003DA5", "#00A550", "#FFB612"].map(
        (c, i) => (
          <rect
            key={i}
            x={44 + i * 84}
            y="58"
            width="84"
            height="7"
            rx="1"
            fill={c}
            opacity="0.85"
          />
        ),
      )}
      <text
        x="297"
        y="98"
        textAnchor="middle"
        fontSize="15"
        fontWeight="bold"
        fill="#FFD700"
        fontFamily="Georgia, serif"
        letterSpacing="3"
      >
        GALAXY EXPLORERS SCHOOL
      </text>
      <text
        x="297"
        y="114"
        textAnchor="middle"
        fontSize="10"
        fill="rgba(255,255,255,0.5)"
        fontFamily="Georgia, serif"
      >
        Foundation &amp; Senior Phase · South Africa
      </text>
      <ellipse
        cx="297"
        cy="230"
        rx="90"
        ry="14"
        fill="none"
        stroke="rgba(255,215,0,0.2)"
        strokeWidth="10"
      />
      <circle
        cx="297"
        cy="230"
        r="68"
        fill="rgba(100,80,180,0.15)"
        stroke="rgba(255,215,0,0.3)"
        strokeWidth="1.5"
      />
      <circle cx="297" cy="230" r="58" fill="rgba(30,20,80,0.6)" />
      <text x="297" y="258" textAnchor="middle" fontSize="72">
        👨‍🚀
      </text>
      <text x="180" y="170" fontSize="18">
        🚀
      </text>
      <text x="400" y="165" fontSize="16">
        🪐
      </text>
      <text x="155" y="290" fontSize="16">
        ⭐
      </text>
      <text x="420" y="295" fontSize="16">
        🌙
      </text>
      <text x="200" y="318" fontSize="14">
        🌟
      </text>
      <text x="380" y="316" fontSize="14">
        💫
      </text>
      <rect
        x="72"
        y="322"
        width="451"
        height="50"
        rx="25"
        fill="url(#se_banner)"
      />
      <rect
        x="76"
        y="326"
        width="443"
        height="42"
        rx="21"
        fill="none"
        stroke="rgba(255,215,0,0.4)"
        strokeWidth="1.5"
      />
      <text
        x="297"
        y="353"
        textAnchor="middle"
        fontSize="18"
        fontWeight="bold"
        fill="#FFD700"
        fontFamily="Georgia, serif"
        letterSpacing="2"
      >
        SPACE EXPLORER CERTIFICATE
      </text>
      <text
        x="297"
        y="398"
        textAnchor="middle"
        fontSize="13"
        fill="rgba(255,255,255,0.75)"
        fontFamily="Georgia, serif"
      >
        This cosmic certificate is awarded to
      </text>
      <text
        x="297"
        y="460"
        textAnchor="middle"
        fontSize="30"
        fontWeight="bold"
        fill="white"
        fontFamily="Georgia, serif"
        fontStyle="italic"
      >
        ________________________________
      </text>
      <path
        d="M110 468 Q297 476 484 468"
        fill="none"
        stroke="#FFD700"
        strokeWidth="1.5"
      />
      <rect
        x="185"
        y="482"
        width="225"
        height="32"
        rx="16"
        fill="rgba(255,215,0,0.15)"
        stroke="#FFD700"
        strokeWidth="1.5"
      />
      <text
        x="297"
        y="503"
        textAnchor="middle"
        fontSize="13"
        fontWeight="bold"
        fill="#FFD700"
        fontFamily="Georgia, serif"
      >
        {grade} · {CURRENT_YEAR}
      </text>
      <text
        x="297"
        y="548"
        textAnchor="middle"
        fontSize="13"
        fill="rgba(255,255,255,0.7)"
        fontFamily="Georgia, serif"
      >
        for incredible curiosity, imagination and
      </text>
      <text
        x="297"
        y="566"
        textAnchor="middle"
        fontSize="13"
        fill="rgba(255,255,255,0.7)"
        fontFamily="Georgia, serif"
      >
        always reaching for the stars.
      </text>
      <text x="168" y="630" textAnchor="middle" fontSize="40">
        🌍
      </text>
      <text x="240" y="624" textAnchor="middle" fontSize="30">
        🚀
      </text>
      <text x="297" y="634" textAnchor="middle" fontSize="46">
        ⭐
      </text>
      <text x="354" y="624" textAnchor="middle" fontSize="30">
        🌙
      </text>
      <text x="426" y="630" textAnchor="middle" fontSize="40">
        🪐
      </text>
      <text
        x="297"
        y="658"
        textAnchor="middle"
        fontSize="10"
        fill="rgba(255,215,0,0.4)"
        fontFamily="Georgia, serif"
      >
        Issued in accordance with the South African National Curriculum (CAPS) ·{" "}
        {grade}
      </text>
      <rect
        x="60"
        y="682"
        width="475"
        height="72"
        rx="12"
        fill="rgba(255,255,255,0.05)"
        stroke="rgba(255,215,0,0.3)"
        strokeWidth="1"
      />
      <line
        x1="88"
        y1="726"
        x2="228"
        y2="726"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="1.5"
      />
      <text
        x="158"
        y="740"
        textAnchor="middle"
        fontSize="11"
        fill="rgba(255,255,255,0.5)"
        fontFamily="Georgia, serif"
      >
        Class Teacher
      </text>
      <text
        x="158"
        y="754"
        textAnchor="middle"
        fontSize="10"
        fill="rgba(255,255,255,0.3)"
        fontFamily="Georgia, serif"
      >
        Date: _______________
      </text>
      <circle
        cx="297"
        cy="718"
        r="30"
        fill="rgba(255,215,0,0.08)"
        stroke="#FFD700"
        strokeWidth="1.5"
      />
      <circle
        cx="297"
        cy="718"
        r="22"
        fill="rgba(255,215,0,0.05)"
        stroke="rgba(255,215,0,0.3)"
        strokeWidth="1"
      />
      <text x="297" y="726" textAnchor="middle" fontSize="26">
        🌟
      </text>
      <line
        x1="366"
        y1="726"
        x2="506"
        y2="726"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="1.5"
      />
      <text
        x="436"
        y="740"
        textAnchor="middle"
        fontSize="11"
        fill="rgba(255,255,255,0.5)"
        fontFamily="Georgia, serif"
      >
        Principal
      </text>
      <text
        x="436"
        y="754"
        textAnchor="middle"
        fontSize="10"
        fill="rgba(255,255,255,0.3)"
        fontFamily="Georgia, serif"
      >
        Date: _______________
      </text>
      <circle
        cx="297"
        cy="802"
        r="26"
        fill="none"
        stroke="rgba(255,215,0,0.4)"
        strokeWidth="1.5"
        strokeDasharray="3 2"
      />
      <text
        x="297"
        y="797"
        textAnchor="middle"
        fontSize="7"
        fill="rgba(255,215,0,0.5)"
        fontFamily="Georgia, serif"
      >
        SCHOOL
      </text>
      <text
        x="297"
        y="808"
        textAnchor="middle"
        fontSize="7"
        fill="rgba(255,215,0,0.5)"
        fontFamily="Georgia, serif"
      >
        STAMP
      </text>
    </svg>
  );
};

// 6. SPORTS CHAMPION — Physical Achievement (NEW)
export const SportsChampionSVG = ({ grade = "Grade R" }) => (
  <svg
    viewBox="0 0 595 842"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-full"
  >
    <defs>
      <linearGradient id="sc_bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#E8F5E9" />
        <stop offset="100%" stopColor="#E3F2FD" />
      </linearGradient>
      <linearGradient id="sc_green" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#1B5E20" />
        <stop offset="50%" stopColor="#2E7D32" />
        <stop offset="100%" stopColor="#1B5E20" />
      </linearGradient>
      <linearGradient id="sc_trophy" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FFD700" />
        <stop offset="100%" stopColor="#FF8F00" />
      </linearGradient>
    </defs>
    <rect width="595" height="842" fill="url(#sc_bg)" />
    {/* Chevron border top */}
    <path d="M0,0 L595,0 L595,22 L0,22 Z" fill="#1B5E20" />
    <path d="M0,22 L595,22 L595,30 L0,30 Z" fill="#FFB612" />
    <path d="M0,812 L595,812 L595,820 L0,820 Z" fill="#FFB612" />
    <path d="M0,820 L595,820 L595,842 L0,842 Z" fill="#1B5E20" />
    {/* Diagonal stripe accents */}
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <line
        key={i}
        x1={-20 + i * 120}
        y1="42"
        x2={60 + i * 120}
        y2="42"
        stroke="#43A047"
        strokeWidth="3"
        opacity="0.3"
      />
    ))}
    <rect
      x="26"
      y="40"
      width="543"
      height="762"
      rx="10"
      fill="none"
      stroke="#2E7D32"
      strokeWidth="2.5"
    />
    <rect
      x="34"
      y="48"
      width="527"
      height="746"
      rx="7"
      fill="none"
      stroke="#A5D6A7"
      strokeWidth="1"
      strokeDasharray="5 4"
    />
    {/* School name */}
    <text
      x="297"
      y="88"
      textAnchor="middle"
      fontSize="16"
      fontWeight="bold"
      fill="#1B5E20"
      fontFamily="Georgia, serif"
      letterSpacing="3"
    >
      CHAMPIONS PRIMARY SCHOOL
    </text>
    <text
      x="297"
      y="106"
      textAnchor="middle"
      fontSize="11"
      fill="#558B2F"
      fontFamily="Georgia, serif"
    >
      Foundation Phase to Senior Phase · South Africa
    </text>
    {["#007A4D", "#FFB612", "#DE3008", "#002395", "#007A4D", "#FFB612"].map(
      (c, i) => (
        <rect
          key={i}
          x={44 + i * 84}
          y="116"
          width="84"
          height="7"
          rx="1"
          fill={c}
        />
      ),
    )}
    {/* Trophy centrepiece */}
    <circle
      cx="297"
      cy="222"
      r="74"
      fill="white"
      stroke="#FFD700"
      strokeWidth="3"
    />
    <circle cx="297" cy="222" r="64" fill="#FFFDE7" />
    <text x="297" y="246" textAnchor="middle" fontSize="78">
      🏆
    </text>
    {/* Laurel wreath arms */}
    <text x="160" y="230" textAnchor="middle" fontSize="40">
      🌿
    </text>
    <text
      x="434"
      y="230"
      textAnchor="middle"
      fontSize="40"
      style={{ transform: "scaleX(-1)", transformOrigin: "434px 0" }}
    >
      🌿
    </text>
    {/* Stars */}
    {[
      [240, 148, 16],
      [297, 136, 20],
      [354, 148, 16],
    ].map(([x, y, s], i) => (
      <text key={i} x={x} y={y} textAnchor="middle" fontSize={s} fill="#FFD700">
        ★
      </text>
    ))}
    {/* Banner */}
    <rect
      x="76"
      y="320"
      width="443"
      height="50"
      rx="25"
      fill="url(#sc_green)"
    />
    <rect
      x="80"
      y="324"
      width="435"
      height="42"
      rx="21"
      fill="none"
      stroke="rgba(255,214,0,0.4)"
      strokeWidth="1.5"
    />
    <text
      x="297"
      y="351"
      textAnchor="middle"
      fontSize="19"
      fontWeight="bold"
      fill="#FFD700"
      fontFamily="Georgia, serif"
      letterSpacing="2"
    >
      SPORTS CHAMPION AWARD
    </text>
    <text
      x="297"
      y="396"
      textAnchor="middle"
      fontSize="13"
      fill="#33691E"
      fontFamily="Georgia, serif"
    >
      Awarded with pride and honour to
    </text>
    <text
      x="297"
      y="458"
      textAnchor="middle"
      fontSize="30"
      fontWeight="bold"
      fill="#1A237E"
      fontFamily="Georgia, serif"
      fontStyle="italic"
    >
      ________________________________
    </text>
    <path
      d="M120 466 Q297 474 474 466"
      fill="none"
      stroke="#43A047"
      strokeWidth="1.5"
    />
    <rect x="185" y="480" width="225" height="32" rx="16" fill="#2E7D32" />
    <text
      x="297"
      y="501"
      textAnchor="middle"
      fontSize="13"
      fontWeight="bold"
      fill="white"
      fontFamily="Georgia, serif"
    >
      {grade} · {CURRENT_YEAR}
    </text>
    <text
      x="297"
      y="544"
      textAnchor="middle"
      fontSize="13"
      fill="#33691E"
      fontFamily="Georgia, serif"
    >
      for outstanding sportsmanship, teamwork
    </text>
    <text
      x="297"
      y="562"
      textAnchor="middle"
      fontSize="13"
      fill="#33691E"
      fontFamily="Georgia, serif"
    >
      and dedication on and off the field.
    </text>
    {/* Sports emoji row */}
    <text x="168" y="624" textAnchor="middle" fontSize="38">
      ⚽
    </text>
    <text x="235" y="620" textAnchor="middle" fontSize="30">
      🏅
    </text>
    <text x="297" y="628" textAnchor="middle" fontSize="44">
      🏆
    </text>
    <text x="359" y="620" textAnchor="middle" fontSize="30">
      🎽
    </text>
    <text x="426" y="624" textAnchor="middle" fontSize="38">
      🏃
    </text>
    <text
      x="297"
      y="656"
      textAnchor="middle"
      fontSize="10"
      fill="#A5D6A7"
      fontFamily="Georgia, serif"
    >
      Issued in accordance with the South African National Curriculum (CAPS) ·{" "}
      {grade}
    </text>
    {/* Signature block */}
    <rect
      x="60"
      y="680"
      width="475"
      height="72"
      rx="12"
      fill="rgba(255,255,255,0.6)"
      stroke="#A5D6A7"
      strokeWidth="1"
    />
    <line
      x1="88"
      y1="726"
      x2="228"
      y2="726"
      stroke="#81C784"
      strokeWidth="1.5"
    />
    <text
      x="158"
      y="740"
      textAnchor="middle"
      fontSize="11"
      fill="#9E9E9E"
      fontFamily="Georgia, serif"
    >
      Class Teacher
    </text>
    <text
      x="158"
      y="754"
      textAnchor="middle"
      fontSize="10"
      fill="#BDBDBD"
      fontFamily="Georgia, serif"
    >
      Date: _______________
    </text>
    <circle
      cx="297"
      cy="718"
      r="28"
      fill="white"
      stroke="#FFD700"
      strokeWidth="2"
    />
    <circle cx="297" cy="718" r="21" fill="#FFFDE7" />
    <text x="297" y="726" textAnchor="middle" fontSize="24">
      🥇
    </text>
    <line
      x1="366"
      y1="726"
      x2="506"
      y2="726"
      stroke="#81C784"
      strokeWidth="1.5"
    />
    <text
      x="436"
      y="740"
      textAnchor="middle"
      fontSize="11"
      fill="#9E9E9E"
      fontFamily="Georgia, serif"
    >
      Principal
    </text>
    <text
      x="436"
      y="754"
      textAnchor="middle"
      fontSize="10"
      fill="#BDBDBD"
      fontFamily="Georgia, serif"
    >
      Date: _______________
    </text>
    <circle
      cx="297"
      cy="800"
      r="26"
      fill="none"
      stroke="#81C784"
      strokeWidth="1.5"
      strokeDasharray="3 2"
    />
    <text x="297" y="795" textAnchor="middle" fontSize="7" fill="#558B2F">
      SCHOOL
    </text>
    <text x="297" y="806" textAnchor="middle" fontSize="7" fill="#558B2F">
      STAMP
    </text>
  </svg>
);

// 7. CREATIVE ARTS — Artistic Achievement (NEW)
export const CreativeArtsSVG = ({ grade = "Grade R" }) => (
  <svg
    viewBox="0 0 595 842"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-full"
  >
    <defs>
      <linearGradient id="ca_bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFF3E0" />
        <stop offset="50%" stopColor="#F3E5F5" />
        <stop offset="100%" stopColor="#E0F7FA" />
      </linearGradient>
      <linearGradient id="ca_banner" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#6A1B9A" />
        <stop offset="33%" stopColor="#C62828" />
        <stop offset="66%" stopColor="#E65100" />
        <stop offset="100%" stopColor="#6A1B9A" />
      </linearGradient>
    </defs>
    <rect width="595" height="842" fill="url(#ca_bg)" />
    {/* Paint splash border dots */}
    {[
      ["#FF6B9D", 0],
      ["#FF8C42", 60],
      ["#FFD93D", 120],
      ["#6BCB77", 180],
      ["#4FC3F7", 240],
      ["#9B59B6", 300],
      ["#FF6B9D", 360],
      ["#FF8C42", 420],
      ["#FFD93D", 480],
      ["#6BCB77", 540],
    ].map(([c, x], i) => (
      <circle key={i} cx={x + 30} cy={16} r="8" fill={c} opacity="0.6" />
    ))}
    {[
      ["#FF6B9D", 0],
      ["#FF8C42", 60],
      ["#FFD93D", 120],
      ["#6BCB77", 180],
      ["#4FC3F7", 240],
      ["#9B59B6", 300],
      ["#FF6B9D", 360],
      ["#FF8C42", 420],
      ["#FFD93D", 480],
      ["#6BCB77", 540],
    ].map(([c, x], i) => (
      <circle key={i} cx={x + 30} cy={826} r="8" fill={c} opacity="0.6" />
    ))}
    {/* Wavy side borders */}
    <path
      d="M28,50 Q40,100 28,150 Q16,200 28,250 Q40,300 28,350 Q16,400 28,450 Q40,500 28,550 Q16,600 28,650 Q40,700 28,750 Q16,800 28,830"
      fill="none"
      stroke="#CE93D8"
      strokeWidth="2.5"
      strokeDasharray="6 4"
    />
    <path
      d="M567,50 Q555,100 567,150 Q579,200 567,250 Q555,300 567,350 Q579,400 567,450 Q555,500 567,550 Q579,600 567,650 Q555,700 567,750 Q579,800 567,830"
      fill="none"
      stroke="#80DEEA"
      strokeWidth="2.5"
      strokeDasharray="6 4"
    />
    <rect
      x="40"
      y="36"
      width="515"
      height="770"
      rx="14"
      fill="none"
      stroke="#CE93D8"
      strokeWidth="1.5"
    />
    {["#007A4D", "#FFB612", "#DE3008", "#002395", "#007A4D", "#FFB612"].map(
      (c, i) => (
        <rect
          key={i}
          x={44 + i * 84}
          y="56"
          width="84"
          height="7"
          rx="1"
          fill={c}
        />
      ),
    )}
    <text
      x="297"
      y="96"
      textAnchor="middle"
      fontSize="16"
      fontWeight="bold"
      fill="#6A1B9A"
      fontFamily="Georgia, serif"
      letterSpacing="2"
    >
      RAINBOW ARTS PRIMARY SCHOOL
    </text>
    <text
      x="297"
      y="114"
      textAnchor="middle"
      fontSize="11"
      fill="#AB47BC"
      fontFamily="Georgia, serif"
    >
      Foundation Phase to Senior Phase · South Africa
    </text>
    {/* Art palette centrepiece */}
    <circle
      cx="297"
      cy="208"
      r="72"
      fill="white"
      stroke="url(#ca_banner)"
      strokeWidth="3"
    />
    <circle cx="297" cy="208" r="62" fill="#FFF8E1" />
    <text x="297" y="232" textAnchor="middle" fontSize="74">
      🎨
    </text>
    {/* Floating art emojis */}
    {[
      ["🖌️", 170, 158, 18],
      ["✏️", 424, 158, 18],
      ["🎭", 154, 270, 16],
      ["🎵", 440, 270, 16],
      ["📐", 168, 326, 14],
      ["🖍️", 426, 326, 14],
    ].map(([e, x, y, s], i) => (
      <text key={i} x={x} y={y} textAnchor="middle" fontSize={s}>
        {e}
      </text>
    ))}
    <rect
      x="68"
      y="308"
      width="459"
      height="50"
      rx="25"
      fill="url(#ca_banner)"
    />
    <rect
      x="72"
      y="312"
      width="451"
      height="42"
      rx="21"
      fill="none"
      stroke="rgba(255,255,255,0.35)"
      strokeWidth="1.5"
    />
    <text
      x="297"
      y="339"
      textAnchor="middle"
      fontSize="18"
      fontWeight="bold"
      fill="white"
      fontFamily="Georgia, serif"
      letterSpacing="2"
    >
      CREATIVE ARTS AWARD
    </text>
    <text
      x="297"
      y="384"
      textAnchor="middle"
      fontSize="13"
      fill="#7B1FA2"
      fontFamily="Georgia, serif"
    >
      This certificate is proudly awarded to
    </text>
    <text
      x="297"
      y="446"
      textAnchor="middle"
      fontSize="30"
      fontWeight="bold"
      fill="#4A148C"
      fontFamily="Georgia, serif"
      fontStyle="italic"
    >
      ________________________________
    </text>
    <path
      d="M120 454 Q297 462 474 454"
      fill="none"
      stroke="#CE93D8"
      strokeWidth="1.5"
    />
    <rect
      x="185"
      y="468"
      width="225"
      height="32"
      rx="16"
      fill="url(#ca_banner)"
    />
    <text
      x="297"
      y="489"
      textAnchor="middle"
      fontSize="13"
      fontWeight="bold"
      fill="white"
      fontFamily="Georgia, serif"
    >
      {grade} · {CURRENT_YEAR}
    </text>
    <text
      x="297"
      y="532"
      textAnchor="middle"
      fontSize="13"
      fill="#7B1FA2"
      fontFamily="Georgia, serif"
    >
      for exceptional creativity, imagination
    </text>
    <text
      x="297"
      y="550"
      textAnchor="middle"
      fontSize="13"
      fill="#7B1FA2"
      fontFamily="Georgia, serif"
    >
      and artistic expression.
    </text>
    {/* Arts row */}
    <text x="168" y="614" textAnchor="middle" fontSize="38">
      🎨
    </text>
    <text x="235" y="610" textAnchor="middle" fontSize="30">
      🎵
    </text>
    <text x="297" y="620" textAnchor="middle" fontSize="44">
      🌈
    </text>
    <text x="359" y="610" textAnchor="middle" fontSize="30">
      🎭
    </text>
    <text x="426" y="614" textAnchor="middle" fontSize="38">
      ✨
    </text>
    <text
      x="297"
      y="650"
      textAnchor="middle"
      fontSize="10"
      fill="#CE93D8"
      fontFamily="Georgia, serif"
    >
      Issued in accordance with the South African National Curriculum (CAPS) ·{" "}
      {grade}
    </text>
    <rect
      x="60"
      y="674"
      width="475"
      height="72"
      rx="12"
      fill="rgba(255,255,255,0.5)"
      stroke="#CE93D8"
      strokeWidth="1"
    />
    <line
      x1="88"
      y1="718"
      x2="228"
      y2="718"
      stroke="#CE93D8"
      strokeWidth="1.5"
    />
    <text
      x="158"
      y="732"
      textAnchor="middle"
      fontSize="11"
      fill="#9E9E9E"
      fontFamily="Georgia, serif"
    >
      Class Teacher
    </text>
    <text
      x="158"
      y="746"
      textAnchor="middle"
      fontSize="10"
      fill="#BDBDBD"
      fontFamily="Georgia, serif"
    >
      Date: _______________
    </text>
    <circle
      cx="297"
      cy="710"
      r="28"
      fill="white"
      stroke="#CE93D8"
      strokeWidth="2"
    />
    <circle cx="297" cy="710" r="21" fill="#F3E5F5" />
    <text x="297" y="718" textAnchor="middle" fontSize="24">
      🎨
    </text>
    <line
      x1="366"
      y1="718"
      x2="506"
      y2="718"
      stroke="#80DEEA"
      strokeWidth="1.5"
    />
    <text
      x="436"
      y="732"
      textAnchor="middle"
      fontSize="11"
      fill="#9E9E9E"
      fontFamily="Georgia, serif"
    >
      Principal
    </text>
    <text
      x="436"
      y="746"
      textAnchor="middle"
      fontSize="10"
      fill="#BDBDBD"
      fontFamily="Georgia, serif"
    >
      Date: _______________
    </text>
    <circle
      cx="297"
      cy="796"
      r="26"
      fill="none"
      stroke="#CE93D8"
      strokeWidth="1.5"
      strokeDasharray="3 2"
    />
    <text x="297" y="791" textAnchor="middle" fontSize="7" fill="#AB47BC">
      SCHOOL
    </text>
    <text x="297" y="802" textAnchor="middle" fontSize="7" fill="#AB47BC">
      STAMP
    </text>
  </svg>
);

// 8. READING STAR — Literacy (NEW)
export const ReadingStarSVG = ({ grade = "Grade R" }) => (
  <svg
    viewBox="0 0 595 842"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-full"
  >
    <defs>
      <linearGradient id="read_bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#E8EAF6" />
        <stop offset="100%" stopColor="#F9FBE7" />
      </linearGradient>
      <linearGradient id="read_navy" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#1A237E" />
        <stop offset="50%" stopColor="#283593" />
        <stop offset="100%" stopColor="#1A237E" />
      </linearGradient>
      <linearGradient id="read_gold2" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FFD54F" />
        <stop offset="100%" stopColor="#F57F17" />
      </linearGradient>
    </defs>
    <rect width="595" height="842" fill="url(#read_bg)" />
    {/* Double border */}
    <rect
      x="14"
      y="14"
      width="567"
      height="814"
      rx="8"
      fill="none"
      stroke="#1A237E"
      strokeWidth="4"
    />
    <rect
      x="22"
      y="22"
      width="551"
      height="798"
      rx="4"
      fill="none"
      stroke="#FFD54F"
      strokeWidth="1.5"
    />
    <rect
      x="30"
      y="30"
      width="535"
      height="782"
      rx="2"
      fill="none"
      stroke="#9FA8DA"
      strokeWidth="0.8"
      strokeDasharray="5 4"
    />
    {/* Corner books */}
    {[
      [44, 50, 0],
      [551, 50, 1],
      [44, 800, 2],
      [551, 800, 3],
    ].map(([x, y, i]) => (
      <text key={i} x={x} y={y} textAnchor="middle" fontSize="18">
        📚
      </text>
    ))}
    {["#007A4D", "#FFB612", "#DE3008", "#002395", "#007A4D", "#FFB612"].map(
      (c, i) => (
        <rect
          key={i}
          x={44 + i * 84}
          y="66"
          width="84"
          height="7"
          rx="1"
          fill={c}
        />
      ),
    )}
    <text
      x="297"
      y="106"
      textAnchor="middle"
      fontSize="15"
      fontWeight="bold"
      fill="#1A237E"
      fontFamily="Georgia, serif"
      letterSpacing="3"
    >
      WORDS &amp; WONDER PRIMARY
    </text>
    <text
      x="297"
      y="123"
      textAnchor="middle"
      fontSize="11"
      fill="#5C6BC0"
      fontFamily="Georgia, serif"
    >
      Foundation Phase to Senior Phase · South Africa
    </text>
    {/* Open book centrepiece */}
    <circle
      cx="297"
      cy="216"
      r="72"
      fill="white"
      stroke="url(#read_gold2)"
      strokeWidth="3"
    />
    <circle cx="297" cy="216" r="63" fill="#E8EAF6" />
    <text x="297" y="240" textAnchor="middle" fontSize="76">
      📖
    </text>
    {/* Floating letters */}
    {[
      ["A", 165, 168, "#E53935", 22],
      ["B", 429, 168, "#1565C0", 22],
      ["C", 148, 280, "#2E7D32", 18],
      ["Z", 446, 280, "#6A1B9A", 18],
    ].map(([l, x, y, c, s], i) => (
      <text
        key={i}
        x={x}
        y={y}
        textAnchor="middle"
        fontSize={s}
        fontWeight="bold"
        fill={c}
        fontFamily="Georgia, serif"
        opacity="0.6"
      >
        {l}
      </text>
    ))}
    <rect
      x="76"
      y="316"
      width="443"
      height="50"
      rx="25"
      fill="url(#read_navy)"
    />
    <rect
      x="80"
      y="320"
      width="435"
      height="42"
      rx="21"
      fill="none"
      stroke="rgba(255,213,79,0.4)"
      strokeWidth="1.5"
    />
    <text
      x="297"
      y="347"
      textAnchor="middle"
      fontSize="19"
      fontWeight="bold"
      fill="#FFD54F"
      fontFamily="Georgia, serif"
      letterSpacing="2"
    >
      READING STAR AWARD
    </text>
    <text
      x="297"
      y="392"
      textAnchor="middle"
      fontSize="13"
      fill="#3949AB"
      fontFamily="Georgia, serif"
    >
      This certificate is proudly presented to
    </text>
    <text
      x="297"
      y="454"
      textAnchor="middle"
      fontSize="30"
      fontWeight="bold"
      fill="#0D47A1"
      fontFamily="Georgia, serif"
      fontStyle="italic"
    >
      ________________________________
    </text>
    <path
      d="M120 462 Q297 470 474 462"
      fill="none"
      stroke="#FFD54F"
      strokeWidth="1.5"
    />
    <rect
      x="185"
      y="476"
      width="225"
      height="32"
      rx="16"
      fill="url(#read_gold2)"
    />
    <text
      x="297"
      y="497"
      textAnchor="middle"
      fontSize="13"
      fontWeight="bold"
      fill="white"
      fontFamily="Georgia, serif"
    >
      {grade} · {CURRENT_YEAR}
    </text>
    <text
      x="297"
      y="540"
      textAnchor="middle"
      fontSize="13"
      fill="#3949AB"
      fontFamily="Georgia, serif"
    >
      for remarkable reading progress,
    </text>
    <text
      x="297"
      y="558"
      textAnchor="middle"
      fontSize="13"
      fill="#3949AB"
      fontFamily="Georgia, serif"
    >
      literacy skills and love of books.
    </text>
    {/* Book row */}
    <text x="168" y="618" textAnchor="middle" fontSize="38">
      📚
    </text>
    <text x="235" y="614" textAnchor="middle" fontSize="30">
      ✏️
    </text>
    <text x="297" y="624" textAnchor="middle" fontSize="44">
      ⭐
    </text>
    <text x="359" y="614" textAnchor="middle" fontSize="30">
      📖
    </text>
    <text x="426" y="618" textAnchor="middle" fontSize="38">
      🌟
    </text>
    <text
      x="297"
      y="654"
      textAnchor="middle"
      fontSize="10"
      fill="#9FA8DA"
      fontFamily="Georgia, serif"
    >
      Issued in accordance with the South African National Curriculum (CAPS) ·{" "}
      {grade}
    </text>
    <line
      x1="90"
      y1="718"
      x2="240"
      y2="718"
      stroke="#9FA8DA"
      strokeWidth="1.5"
    />
    <text
      x="165"
      y="732"
      textAnchor="middle"
      fontSize="11"
      fill="#9E9E9E"
      fontFamily="Georgia, serif"
    >
      Class Teacher
    </text>
    <text
      x="165"
      y="746"
      textAnchor="middle"
      fontSize="10"
      fill="#BDBDBD"
      fontFamily="Georgia, serif"
    >
      Date: _______________
    </text>
    <circle
      cx="297"
      cy="724"
      r="30"
      fill="white"
      stroke="url(#read_gold2)"
      strokeWidth="2.5"
    />
    <circle cx="297" cy="724" r="23" fill="#E8EAF6" />
    <text
      x="297"
      y="720"
      textAnchor="middle"
      fontSize="9"
      fill="#1A237E"
      fontFamily="Georgia, serif"
    >
      OFFICIAL
    </text>
    <text
      x="297"
      y="732"
      textAnchor="middle"
      fontSize="9"
      fill="#1A237E"
      fontFamily="Georgia, serif"
    >
      SEAL
    </text>
    <circle
      cx="297"
      cy="724"
      r="30"
      fill="none"
      stroke="#FFD54F"
      strokeWidth="1"
      strokeDasharray="3 2"
    />
    <line
      x1="354"
      y1="718"
      x2="504"
      y2="718"
      stroke="#9FA8DA"
      strokeWidth="1.5"
    />
    <text
      x="429"
      y="732"
      textAnchor="middle"
      fontSize="11"
      fill="#9E9E9E"
      fontFamily="Georgia, serif"
    >
      Principal
    </text>
    <text
      x="429"
      y="746"
      textAnchor="middle"
      fontSize="10"
      fill="#BDBDBD"
      fontFamily="Georgia, serif"
    >
      Date: _______________
    </text>
    {["#007A4D", "#FFB612", "#DE3008", "#002395", "#007A4D", "#FFB612"].map(
      (c, i) => (
        <rect
          key={i}
          x={44 + i * 84}
          y="776"
          width="84"
          height="7"
          rx="1"
          fill={c}
        />
      ),
    )}
    <text
      x="297"
      y="806"
      textAnchor="middle"
      fontSize="9"
      fill="#BDBDBD"
      fontFamily="Georgia, serif"
    >
      Words &amp; Wonder Primary · CAPS Literacy Certificate · {CURRENT_YEAR}
    </text>
  </svg>
);

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */
const CERTIFICATES = {
  rainbow_star: {
    id: "rainbow_star",
    name: "Rainbow Star",
    subtitle: "General Achievement",
    description:
      "Bright rainbow design with star motifs. Perfect for all-round achievement, end-of-term celebrations, and any milestone across Grade R–7.",
    price: 0,
    isPremium: false,
    category: "free",
    icon: Star,
    color: "pink",
    SVGPreview: RainbowStarSVG,
    emoji: "🌟",
    features: [
      "Star motif design",
      "Rainbow colour bar",
      "Grade R–7 compatible",
      "Teacher & principal sign-off",
    ],
    grades: GRADES,
  },
  bravery_badge: {
    id: "bravery_badge",
    name: "Bravery Badge",
    subtitle: "Courage & Confidence",
    description:
      "Shield and lion design celebrating bravery. Great for learners who overcame fears — from Grade R through to Grade 7.",
    price: 149,
    isPremium: true,
    category: "behaviour",
    icon: Award,
    color: "blue",
    SVGPreview: BraveryBadgeSVG,
    emoji: "🦁",
    features: [
      "Shield crest design",
      "Zigzag border",
      "Medal seals",
      "Grade R–7 compatible",
    ],
    grades: GRADES,
  },
  golden_apple: {
    id: "golden_apple",
    name: "Golden Apple",
    subtitle: "Academic Excellence",
    description:
      "Elegant gold-framed certificate for academic milestones — literacy, numeracy, STEM, languages and more, across all primary grades.",
    price: 179,
    isPremium: true,
    category: "academic",
    icon: Sparkles,
    color: "amber",
    SVGPreview: GoldenAppleSVG,
    emoji: "🍎",
    features: [
      "Ornate gold frame",
      "Ribbon banner",
      "Grade R–7 compatible",
      "Formal diploma style",
    ],
    grades: GRADES,
  },
  friendship: {
    id: "friendship",
    name: "Friendship Blossom",
    subtitle: "Social & Emotional",
    description:
      "Soft floral design celebrating kindness, friendship and social-emotional growth across all primary grades.",
    price: 149,
    isPremium: true,
    category: "behaviour",
    icon: Heart,
    color: "rose",
    SVGPreview: FriendshipBlossomSVG,
    emoji: "🌸",
    features: [
      "Petal border pattern",
      "Pastel gradient",
      "Grade R–7 compatible",
      "Warm friendly tone",
    ],
    grades: GRADES,
  },
  space_explorer: {
    id: "space_explorer",
    name: "Space Explorer",
    subtitle: "Curiosity & Discovery",
    description:
      "Dark space theme with gold stars — perfect for science, STEM discovery or special recognition from Grade R to Grade 7.",
    price: 199,
    isPremium: true,
    category: "special",
    icon: Zap,
    color: "indigo",
    SVGPreview: SpaceExplorerSVG,
    emoji: "🚀",
    features: [
      "Deep space background",
      "Gold accent frame",
      "Grade R–7 compatible",
      "Star field effect",
    ],
    grades: GRADES,
  },
  sports_champion: {
    id: "sports_champion",
    name: "Sports Champion",
    subtitle: "Physical Achievement",
    description:
      "Bold green and gold trophy design for sports, athletics and physical education achievements across all primary grades.",
    price: 149,
    isPremium: true,
    category: "special",
    icon: Trophy,
    color: "green",
    SVGPreview: SportsChampionSVG,
    emoji: "🏆",
    features: [
      "Trophy centrepiece",
      "Laurel wreath",
      "Grade R–7 compatible",
      "Sports & PE awards",
    ],
    grades: GRADES,
  },
  creative_arts: {
    id: "creative_arts",
    name: "Creative Arts",
    subtitle: "Artistic Expression",
    description:
      "Vibrant rainbow palette design for art, music, drama and creative subjects. Celebrates every young artist from Grade R to Grade 7.",
    price: 149,
    isPremium: true,
    category: "special",
    icon: Palette,
    color: "purple",
    SVGPreview: CreativeArtsSVG,
    emoji: "🎨",
    features: [
      "Paint splash border",
      "Multicolour gradient",
      "Grade R–7 compatible",
      "Arts & culture awards",
    ],
    grades: GRADES,
  },
  reading_star: {
    id: "reading_star",
    name: "Reading Star",
    subtitle: "Literacy Achievement",
    description:
      "Classic navy and gold design celebrating reading milestones, literacy and a love of books — from first words to chapter books.",
    price: 149,
    isPremium: true,
    category: "academic",
    icon: BookOpen,
    color: "navy",
    SVGPreview: ReadingStarSVG,
    emoji: "📚",
    features: [
      "Open book motif",
      "ABC letter accents",
      "Grade R–7 compatible",
      "Literacy milestone award",
    ],
    grades: GRADES,
  },
};

const CATEGORIES = [
  { id: "all", name: "All", icon: "🎨" },
  { id: "free", name: "Free", icon: "🆓" },
  { id: "behaviour", name: "Behaviour", icon: "💛" },
  { id: "academic", name: "Academic", icon: "📚" },
  { id: "special", name: "Special", icon: "✨" },
];

const COLOR_MAP = {
  pink: {
    ring: "ring-pink-300",
    grad: "from-pink-400 to-rose-500",
    text: "text-pink-600",
    bg: "bg-pink-50",
    border: "border-pink-200",
  },
  blue: {
    ring: "ring-blue-300",
    grad: "from-blue-500 to-indigo-600",
    text: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  amber: {
    ring: "ring-amber-300",
    grad: "from-amber-400 to-orange-500",
    text: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
  rose: {
    ring: "ring-rose-300",
    grad: "from-rose-400 to-pink-500",
    text: "text-rose-600",
    bg: "bg-rose-50",
    border: "border-rose-200",
  },
  indigo: {
    ring: "ring-indigo-300",
    grad: "from-indigo-500 to-violet-600",
    text: "text-indigo-600",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
  },
  green: {
    ring: "ring-green-300",
    grad: "from-green-600 to-emerald-700",
    text: "text-green-700",
    bg: "bg-green-50",
    border: "border-green-200",
  },
  purple: {
    ring: "ring-purple-300",
    grad: "from-purple-500 to-fuchsia-600",
    text: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-200",
  },
  navy: {
    ring: "ring-indigo-400",
    grad: "from-indigo-700 to-blue-800",
    text: "text-indigo-700",
    bg: "bg-indigo-50",
    border: "border-indigo-300",
  },
};

/* ─────────────────────────────────────────────
   GRADE SELECTOR COMPONENT
───────────────────────────────────────────── */
function GradeSelector({ value, onChange, className = "" }) {
  return (
    <div className={`relative inline-block ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none pl-3 pr-8 py-1.5 rounded-xl border border-purple-200 bg-white text-xs font-bold text-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-300 cursor-pointer shadow-sm"
      >
        {GRADES.map((g) => (
          <option key={g} value={g}>
            {g}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-purple-400 pointer-events-none" />
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export default function Templates({ user }) {
  const [owned, setOwned] = useState(["rainbow_star"]);
  const [category, setCategory] = useState("all");
  const [preview, setPreview] = useState(null);
  const [payment, setPayment] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [card, setCard] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: "",
  });
  // Grade selection — per card AND for the preview modal
  const [cardGrades, setCardGrades] = useState(() =>
    Object.fromEntries(
      GRADES.map((_, i) => [Object.keys(CERTIFICATES)[i], "Grade R"]),
    ),
  );
  const [previewGrade, setPreviewGrade] = useState("Grade R");

  const setCardGrade = (id, grade) =>
    setCardGrades((prev) => ({ ...prev, [id]: grade }));

  const filtered = Object.values(CERTIFICATES).filter(
    (c) => category === "all" || c.category === category,
  );

  const totalValue = Object.values(CERTIFICATES)
    .filter((c) => owned.includes(c.id))
    .reduce((s, c) => s + c.price, 0);

  const formatCard = (v) => {
    const d = v.replace(/\s/g, "");
    return (d.match(/.{1,4}/g) || [d]).join(" ");
  };
  const formatExpiry = (v) => {
    const d = v.replace(/\D/g, "");
    return d.length >= 2 ? d.slice(0, 2) + "/" + d.slice(2, 4) : d;
  };

  const handleGet = (id) => {
    const cert = CERTIFICATES[id];
    if (!cert.isPremium) {
      setOwned((p) => [...new Set([...p, id])]);
      return;
    }
    setPayment(id);
  };

  const handlePay = async () => {
    const clean = card.number.replace(/\s/g, "");
    if (clean.length !== 16) return alert("Enter a valid 16-digit card number");
    if (!/^\d{2}\/\d{2}$/.test(card.expiry))
      return alert("Enter expiry as MM/YY");
    if (card.cvv.length !== 3) return alert("Enter a valid 3-digit CVV");
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 2000));
    setOwned((p) => [...new Set([...p, payment])]);
    setProcessing(false);
    setPayment(null);
    setCard({ number: "", expiry: "", cvv: "", name: "" });
    alert("✅ Certificate unlocked! You can now print it from Reports.");
  };

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "linear-gradient(135deg, #fdf6ff 0%, #fff7f0 50%, #f0f9ff 100%)",
        fontFamily: "'Georgia', 'Times New Roman', serif",
      }}
    >
      {/* ── Hero ── */}
      <div
        className="relative overflow-hidden px-4 pt-8 pb-6 mb-6"
        style={{
          background:
            "linear-gradient(135deg, #7C3AED 0%, #DB2777 50%, #F59E0B 100%)",
        }}
      >
        {["🌟", "🎨", "🏅", "🌸", "🚀", "⭐", "🦁", "💛"].map((e, i) => (
          <span
            key={i}
            className="absolute text-2xl pointer-events-none select-none"
            style={{
              top: `${[10, 25, 5, 60, 15, 50, 70, 35][i]}%`,
              left: `${[5, 90, 45, 8, 75, 55, 88, 22][i]}%`,
              opacity: 0.15,
              fontSize: "1.8rem",
            }}
          >
            {e}
          </span>
        ))}
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur px-3 py-1 rounded-full text-white text-xs font-bold mb-3 tracking-widest uppercase">
            <Sun className="w-3 h-3" /> Grade R–7 · SA Primary School
            Certificates
          </div>
          <h1
            className="text-2xl sm:text-3xl font-bold text-white mb-2"
            style={{ textShadow: "0 2px 12px rgba(0,0,0,0.2)" }}
          >
            🎓 Certificate Collection
          </h1>
          <p className="text-white/80 text-sm max-w-md mx-auto leading-relaxed">
            Beautiful printable certificates for every SA primary school learner
            — Grade R through Grade 7. Celebrate every milestone, big and small.
          </p>
        </div>
      </div>

      <div className="px-4 space-y-5 max-w-5xl mx-auto pb-10">
        {/* ── Stats ── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              value: owned.length,
              label: "Owned",
              color: "text-violet-600",
              bg: "bg-violet-50",
              border: "border-violet-200",
              icon: "🎓",
            },
            {
              value: Object.keys(CERTIFICATES).length,
              label: "Available",
              color: "text-pink-600",
              bg: "bg-pink-50",
              border: "border-pink-200",
              icon: "🌟",
            },
            {
              value: `R${totalValue}`,
              label: "Value Owned",
              color: "text-amber-600",
              bg: "bg-amber-50",
              border: "border-amber-200",
              icon: "💰",
            },
          ].map(({ value, label, color, bg, border, icon }) => (
            <div
              key={label}
              className={`${bg} border ${border} rounded-2xl p-3 text-center shadow-sm`}
            >
              <div className="text-base mb-0.5">{icon}</div>
              <div className={`text-xl font-bold ${color}`}>{value}</div>
              <div className="text-xs text-gray-500 leading-tight">{label}</div>
            </div>
          ))}
        </div>

        {/* ── Grade info banner ── */}
        <div className="flex items-center gap-3 bg-indigo-50 border border-indigo-200 rounded-2xl px-4 py-3">
          <span className="text-lg">🏫</span>
          <p className="text-xs text-indigo-800 font-semibold">
            All certificates support <strong>Grade R through Grade 7</strong> —
            select the grade on each card before printing.
          </p>
        </div>

        {/* ── Category Filter ── */}
        <div className="relative">
          <div className="sm:hidden">
            <button
              onClick={() => setFilterOpen((f) => !f)}
              className="w-full flex items-center justify-between px-4 py-3 bg-white border border-purple-200 rounded-2xl text-sm font-semibold text-purple-800 shadow-sm"
            >
              <span>
                {CATEGORIES.find((c) => c.id === category)?.icon}{" "}
                {CATEGORIES.find((c) => c.id === category)?.name}
              </span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${filterOpen ? "rotate-180" : ""}`}
              />
            </button>
            {filterOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-purple-100 rounded-2xl shadow-xl z-20 overflow-hidden">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setCategory(cat.id);
                      setFilterOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 text-sm font-semibold transition-colors flex items-center gap-2 ${category === cat.id ? "bg-purple-600 text-white" : "text-gray-700 hover:bg-purple-50"}`}
                  >
                    {cat.icon} {cat.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="hidden sm:flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-1.5 ${category === cat.id ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-md scale-105" : "bg-white text-gray-700 hover:bg-purple-50 border border-gray-200 hover:border-purple-200"}`}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* ── Certificate Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((cert) => {
            const isOwned = owned.includes(cert.id);
            const colors = COLOR_MAP[cert.color] || COLOR_MAP.pink;
            const Icon = cert.icon;
            const grade = cardGrades[cert.id] || "Grade R";

            return (
              <div
                key={cert.id}
                className={`bg-white rounded-3xl overflow-hidden shadow-md border-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${isOwned ? "border-green-300" : `border-gray-100 hover:${colors.border}`}`}
              >
                {/* Preview area */}
                <div
                  className="relative bg-gray-50 border-b border-gray-100"
                  style={{ height: 180 }}
                >
                  <div className="w-full h-full p-2">
                    <cert.SVGPreview grade={grade} />
                  </div>
                  {!isOwned && cert.isPremium && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex items-end justify-center pb-3 pointer-events-none">
                      <div className="flex items-center gap-1.5 bg-black/60 text-white px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-sm">
                        <Lock className="w-3 h-3" /> Unlock to print
                      </div>
                    </div>
                  )}
                  {isOwned && (
                    <div className="absolute top-3 left-3 bg-green-500 text-white px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow">
                      <Check className="w-3 h-3" /> Owned
                    </div>
                  )}
                  {!cert.isPremium && (
                    <div className="absolute top-3 right-3 bg-green-500 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow">
                      Free
                    </div>
                  )}
                  {cert.isPremium && !isOwned && (
                    <div
                      className={`absolute top-3 right-3 bg-gradient-to-r ${colors.grad} text-white px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow`}
                    >
                      <Sparkles className="w-3 h-3" /> Premium
                    </div>
                  )}
                </div>

                {/* Card body */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1 pr-2">
                      <span className="text-xl flex-shrink-0">
                        {cert.emoji}
                      </span>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-gray-900 truncate">
                          {cert.name}
                        </h3>
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                          {cert.subtitle}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {cert.isPremium ? (
                        <>
                          <div className={`text-xl font-bold ${colors.text}`}>
                            R{cert.price}
                          </div>
                          <div className="text-xs text-gray-400">once-off</div>
                        </>
                      ) : (
                        <>
                          <div className="text-xl font-bold text-green-600">
                            Free
                          </div>
                          <div className="text-xs text-gray-400">included</div>
                        </>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                    {cert.description}
                  </p>

                  {/* Grade selector */}
                  <div className="flex items-center gap-2 mb-3 p-2 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-xs text-gray-500 font-semibold flex-1">
                      Grade:
                    </span>
                    <GradeSelector
                      value={grade}
                      onChange={(g) => setCardGrade(cert.id, g)}
                    />
                  </div>

                  <ul className="space-y-1 mb-4">
                    {cert.features.map((f, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-xs text-gray-600"
                      >
                        <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <div className="flex gap-2 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => {
                        setPreview(cert.id);
                        setPreviewGrade(grade);
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-xs text-gray-600 hover:bg-gray-50 transition-colors font-semibold"
                    >
                      <Eye className="w-3.5 h-3.5" /> Preview
                    </button>
                    {isOwned ? (
                      <div className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-green-50 text-green-700 border border-green-200 rounded-xl text-xs font-bold">
                        <Check className="w-3.5 h-3.5" /> Owned
                      </div>
                    ) : (
                      <button
                        onClick={() => handleGet(cert.id)}
                        className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r ${colors.grad} text-white rounded-xl text-xs font-bold shadow hover:shadow-md transition-all`}
                      >
                        {cert.isPremium ? (
                          <>
                            <ShoppingCart className="w-3.5 h-3.5" /> R
                            {cert.price}
                          </>
                        ) : (
                          <>
                            <Check className="w-3.5 h-3.5" /> Get Free
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

        {/* ── Help Banner ── */}
        <div
          className="rounded-3xl p-5 border"
          style={{
            background: "linear-gradient(135deg, #fdf4ff, #fff7ed)",
            borderColor: "#e9d5ff",
          }}
        >
          <h3 className="font-bold text-purple-900 mb-2 flex items-center gap-2 text-sm">
            <Award className="w-4 h-4" /> How to print your certificates
          </h3>
          <ol className="text-xs text-purple-800 space-y-1.5 list-decimal list-inside">
            <li>Choose and unlock the certificate design you want</li>
            <li>
              Select the correct <strong>grade</strong> using the Grade selector
              on each card
            </li>
            <li>
              Go to <strong>Reports → Certificates</strong> in the sidebar
            </li>
            <li>Enter the learner's name and choose the certificate type</li>
            <li>
              Click <strong>Print</strong> or <strong>Save as PDF</strong>
            </li>
            <li>Hand it out with pride at assembly or end of term 🎉</li>
          </ol>
        </div>
      </div>

      {/* ── Preview Modal ── */}
      {preview && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg max-h-[94vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-4 border-b flex items-center justify-between bg-gray-50 flex-shrink-0">
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  {CERTIFICATES[preview].emoji} {CERTIFICATES[preview].name}
                </h2>
                <p className="text-xs text-gray-500">
                  {CERTIFICATES[preview].subtitle}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <GradeSelector
                  value={previewGrade}
                  onChange={setPreviewGrade}
                />
                <button
                  onClick={() => setPreview(null)}
                  className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-200 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="overflow-auto p-4 bg-gray-100 flex-1 flex items-center justify-center">
              <div className="w-full max-w-xs bg-white rounded-2xl shadow-xl overflow-hidden">
                {(() => {
                  const P = CERTIFICATES[preview].SVGPreview;
                  return <P grade={previewGrade} />;
                })()}
              </div>
            </div>
            <div className="p-4 border-t flex flex-col sm:flex-row items-center gap-3 bg-white flex-shrink-0">
              <p className="text-xs text-gray-500 flex-1 line-clamp-2">
                {CERTIFICATES[preview].description}
              </p>
              {owned.includes(preview) ? (
                <div className="px-4 py-2 bg-green-100 text-green-700 rounded-xl font-bold text-sm border border-green-200 flex items-center gap-2">
                  <Check className="w-4 h-4" /> Owned
                </div>
              ) : (
                <button
                  onClick={() => {
                    setPreview(null);
                    handleGet(preview);
                  }}
                  className={`px-5 py-2.5 bg-gradient-to-r ${COLOR_MAP[CERTIFICATES[preview].color]?.grad} text-white rounded-xl font-bold text-sm flex items-center gap-2 w-full sm:w-auto justify-center`}
                >
                  {CERTIFICATES[preview].isPremium ? (
                    <>
                      <ShoppingCart className="w-4 h-4" /> Buy for R
                      {CERTIFICATES[preview].price}
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" /> Get Free
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Payment Modal ── */}
      {payment && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md max-h-[96vh] overflow-auto shadow-2xl">
            <div
              className="p-5 rounded-t-3xl sticky top-0 z-10"
              style={{
                background: "linear-gradient(135deg, #7C3AED, #DB2777)",
              }}
            >
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-lg font-bold text-white">
                  Complete Purchase
                </h2>
                <button
                  onClick={() => {
                    setPayment(null);
                    setCard({ number: "", expiry: "", cvv: "", name: "" });
                  }}
                  className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/20 transition-colors"
                  disabled={processing}
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
              <p className="text-white/80 text-sm">
                {CERTIFICATES[payment].emoji} {CERTIFICATES[payment].name}
              </p>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 text-center">
                <div className="text-xs text-gray-500 mb-1">Total Amount</div>
                <div className="text-4xl font-bold text-purple-700">
                  R{CERTIFICATES[payment].price}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Once-off · Lifetime access · Unlimited prints · All grades
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  value={card.name}
                  onChange={(e) =>
                    setCard((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="Jane Smith"
                  disabled={processing}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-400 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Card Number
                </label>
                <input
                  type="text"
                  value={card.number}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\s/g, "");
                    if (v.length <= 16 && /^\d*$/.test(v))
                      setCard((p) => ({ ...p, number: formatCard(v) }));
                  }}
                  placeholder="1234 5678 9012 3456"
                  disabled={processing}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-400 text-sm font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Expiry
                  </label>
                  <input
                    type="text"
                    value={card.expiry}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "");
                      if (v.length <= 4)
                        setCard((p) => ({ ...p, expiry: formatExpiry(v) }));
                    }}
                    placeholder="MM/YY"
                    disabled={processing}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-400 font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    CVV
                  </label>
                  <input
                    type="text"
                    value={card.cvv}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "");
                      if (v.length <= 3) setCard((p) => ({ ...p, cvv: v }));
                    }}
                    placeholder="123"
                    disabled={processing}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-400 font-mono text-sm"
                  />
                </div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-xs text-green-800 flex gap-2">
                <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Secure Payment:</strong> Your card details are
                  encrypted and never stored.
                </span>
              </div>
              <button
                onClick={handlePay}
                disabled={processing}
                className="w-full px-6 py-3.5 rounded-2xl font-bold text-white flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-50"
                style={{
                  background: "linear-gradient(135deg, #7C3AED, #DB2777)",
                }}
              >
                {processing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />{" "}
                    Processing...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" /> Pay R
                    {CERTIFICATES[payment].price}
                  </>
                )}
              </button>
              <p className="text-xs text-center text-gray-400 pb-1">
                By purchasing you agree to our terms and conditions
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
