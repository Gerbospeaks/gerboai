import React from "react";

/**
 * TemplateThumbnails
 *
 * Small SVG mockups that mirror the actual look of each invoice template
 * (from TemplateRenderer.jsx) — same color scheme, same rough layout —
 * instead of generic stock photography. Each one renders inside the
 * existing h-56 image slot on the Templates.jsx cards.
 */

const Base = ({ children, bg = "#ffffff" }) => (
  <svg
    viewBox="0 0 400 500"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-full"
    preserveAspectRatio="xMidYMid slice"
  >
    <rect width="400" height="500" fill={bg} />
    {children}
  </svg>
);

/* ── Classic Workshop — white bg, black rule, 3 gray boxes, dark table ── */
export const ClassicThumb = () => (
  <Base bg="#ffffff">
    <rect x="24" y="24" width="60" height="60" rx="4" fill="#e5e7eb" />
    <rect x="24" y="94" width="140" height="6" fill="#9ca3af" />
    <rect x="24" y="108" width="100" height="6" fill="#9ca3af" />
    <text
      x="376"
      y="60"
      textAnchor="end"
      fontFamily="Georgia, serif"
      fontWeight="700"
      fontSize="34"
      fill="#111827"
    >
      INVOICE
    </text>
    <rect x="220" y="76" width="156" height="44" fill="none" />
    <rect x="220" y="80" width="156" height="8" fill="#d1d5db" />
    <rect x="220" y="96" width="156" height="8" fill="#d1d5db" />
    <rect x="0" y="132" width="400" height="4" fill="#111827" />

    {/* 3 column boxes */}
    <rect x="24" y="156" width="106" height="90" fill="#e5e7eb" />
    <rect x="24" y="156" width="106" height="16" fill="#9ca3af" />
    <rect x="147" y="156" width="106" height="90" fill="#e5e7eb" />
    <rect x="147" y="156" width="106" height="16" fill="#9ca3af" />
    <rect x="270" y="156" width="106" height="90" fill="#e5e7eb" />
    <rect x="270" y="156" width="106" height="16" fill="#9ca3af" />

    {/* table */}
    <rect x="24" y="268" width="352" height="22" fill="#1f2937" />
    <rect x="24" y="296" width="352" height="1" fill="#e5e7eb" />
    <rect x="24" y="322" width="352" height="1" fill="#e5e7eb" />
    <rect x="24" y="348" width="352" height="1" fill="#e5e7eb" />

    {/* total */}
    <rect x="220" y="378" width="156" height="26" fill="#f9fafb" />
    <rect
      x="220"
      y="378"
      width="156"
      height="26"
      fill="none"
      stroke="#111827"
      strokeWidth="1"
    />

    {/* footer note */}
    <text
      x="200"
      y="470"
      textAnchor="middle"
      fontFamily="Georgia, serif"
      fontStyle="italic"
      fontSize="10"
      fill="#dc2626"
    >
      Guarantee on all parts &amp; workmanship
    </text>
  </Base>
);

/* ── Premium Auto Service (Elegant) — purple border, serif, centered ── */
export const PremiumThumb = () => (
  <Base bg="#ffffff">
    <rect
      x="10"
      y="10"
      width="380"
      height="480"
      fill="none"
      stroke="#4c1d95"
      strokeWidth="8"
    />
    <circle
      cx="200"
      cy="60"
      r="22"
      fill="#ede9fe"
      stroke="#6d28d9"
      strokeWidth="2"
    />
    <rect x="150" y="94" width="100" height="6" fill="#c4b5fd" />
    <text
      x="200"
      y="140"
      textAnchor="middle"
      fontFamily="Georgia, serif"
      fontSize="28"
      fill="#6d28d9"
    >
      INVOICE
    </text>
    <rect x="170" y="150" width="60" height="6" fill="#d1d5db" />
    <rect x="0" y="172" width="400" height="3" fill="#4c1d95" />

    <rect x="34" y="196" width="150" height="60" fill="none" />
    <text
      x="34"
      y="204"
      fontFamily="Georgia, serif"
      fontWeight="700"
      fontSize="12"
      fill="#4c1d95"
    >
      BILLED TO
    </text>
    <rect x="34" y="214" width="120" height="6" fill="#c4b5fd" />
    <rect x="34" y="228" width="140" height="6" fill="#e5e7eb" />

    <text
      x="216"
      y="204"
      fontFamily="Georgia, serif"
      fontWeight="700"
      fontSize="12"
      fill="#4c1d95"
    >
      VEHICLE
    </text>
    <rect x="216" y="214" width="120" height="6" fill="#c4b5fd" />
    <rect x="216" y="228" width="140" height="6" fill="#e5e7eb" />

    <rect x="34" y="268" width="332" height="2" fill="#4c1d95" />
    <rect x="34" y="292" width="332" height="1" fill="#e5e7eb" />
    <rect x="34" y="316" width="332" height="1" fill="#e5e7eb" />
    <rect x="34" y="340" width="332" height="1" fill="#e5e7eb" />

    <rect x="216" y="372" width="150" height="26" fill="#4c1d95" />
    <text
      x="291"
      y="390"
      textAnchor="middle"
      fontFamily="Georgia, serif"
      fontSize="12"
      fill="#ffffff"
    >
      TOTAL
    </text>

    <text
      x="200"
      y="466"
      textAnchor="middle"
      fontFamily="Georgia, serif"
      fontStyle="italic"
      fontSize="10"
      fill="#6b7280"
    >
      Thank you for your business
    </text>
  </Base>
);

/* ── Speed Shop Pro — black bg, red accents, italic bold ── */
export const SpeedThumb = () => (
  <Base bg="#0a0a0a">
    <rect x="0" y="0" width="400" height="500" fill="#0a0a0a" />
    <rect x="24" y="24" width="60" height="60" rx="4" fill="#1f1f1f" />
    <rect x="24" y="96" width="140" height="10" fill="#dc2626" />
    <text
      x="376"
      y="66"
      textAnchor="end"
      fontFamily="Arial Black, sans-serif"
      fontWeight="900"
      fontStyle="italic"
      fontSize="40"
      fill="#dc2626"
    >
      INVOICE
    </text>
    <rect x="256" y="78" width="120" height="34" fill="#dc2626" />
    <rect x="0" y="128" width="400" height="6" fill="#dc2626" />

    <rect x="24" y="152" width="106" height="80" rx="4" fill="#1a1a1a" />
    <rect x="147" y="152" width="106" height="80" rx="4" fill="#1a1a1a" />
    <rect x="270" y="152" width="106" height="80" rx="4" fill="#1a1a1a" />
    <rect x="34" y="162" width="70" height="8" fill="#dc2626" />
    <rect x="157" y="162" width="70" height="8" fill="#dc2626" />
    <rect x="280" y="162" width="70" height="8" fill="#dc2626" />

    <rect x="24" y="256" width="352" height="24" fill="#dc2626" />
    <rect x="24" y="284" width="352" height="1" fill="#262626" />
    <rect x="24" y="310" width="352" height="1" fill="#262626" />
    <rect x="24" y="336" width="352" height="1" fill="#262626" />

    <rect x="196" y="366" width="180" height="30" fill="#dc2626" />
    <text
      x="286"
      y="387"
      textAnchor="middle"
      fontFamily="Arial Black, sans-serif"
      fontWeight="900"
      fontSize="14"
      fill="#ffffff"
    >
      TOTAL
    </text>

    <text
      x="200"
      y="470"
      textAnchor="middle"
      fontFamily="Arial, sans-serif"
      fontStyle="italic"
      fontSize="10"
      fill="#6b7280"
    >
      12 months / 15,000km guarantee
    </text>
  </Base>
);

/* ── Modern Minimalist — white bg, blue-500, rounded, spacious ── */
export const ModernThumb = () => (
  <Base bg="#ffffff">
    <rect x="24" y="24" width="60" height="60" rx="8" fill="#eff6ff" />
    <rect x="24" y="96" width="130" height="6" rx="3" fill="#bfdbfe" />
    <rect x="24" y="110" width="90" height="6" rx="3" fill="#bfdbfe" />
    <text
      x="376"
      y="62"
      textAnchor="end"
      fontFamily="Helvetica, Arial, sans-serif"
      fontWeight="800"
      fontSize="36"
      fill="#3b82f6"
    >
      INVOICE
    </text>
    <rect x="220" y="80" width="156" height="40" rx="8" fill="#eff6ff" />
    <rect x="0" y="140" width="400" height="6" fill="#3b82f6" />

    <rect x="24" y="164" width="168" height="92" rx="10" fill="#f9fafb" />
    <rect x="208" y="164" width="168" height="92" rx="10" fill="#eff6ff" />
    <rect x="40" y="180" width="90" height="8" rx="4" fill="#93c5fd" />
    <rect x="224" y="180" width="90" height="8" rx="4" fill="#60a5fa" />

    <rect x="24" y="278" width="352" height="26" rx="6" fill="#3b82f6" />
    <rect x="24" y="312" width="352" height="1" fill="#f3f4f6" />
    <rect x="24" y="338" width="352" height="1" fill="#f3f4f6" />
    <rect x="24" y="364" width="352" height="1" fill="#f3f4f6" />

    <rect x="176" y="396" width="200" height="34" rx="8" fill="#3b82f6" />
    <text
      x="276"
      y="418"
      textAnchor="middle"
      fontFamily="Helvetica, Arial, sans-serif"
      fontWeight="700"
      fontSize="15"
      fill="#ffffff"
    >
      TOTAL
    </text>

    <text
      x="200"
      y="470"
      textAnchor="middle"
      fontFamily="Helvetica, Arial, sans-serif"
      fontStyle="italic"
      fontSize="10"
      fill="#9ca3af"
    >
      Thank you for your business
    </text>
  </Base>
);

/* ── Diagnostic Specialist — white bg, green-600, bordered boxes, technical ── */
export const DiagnosticThumb = () => (
  <Base bg="#ffffff">
    <rect
      x="24"
      y="24"
      width="60"
      height="60"
      rx="4"
      fill="#f0fdf4"
      stroke="#16a34a"
      strokeWidth="1.5"
    />
    <rect x="24" y="96" width="120" height="6" fill="#86efac" />
    <text
      x="376"
      y="58"
      textAnchor="end"
      fontFamily="Helvetica, Arial, sans-serif"
      fontWeight="700"
      fontSize="26"
      fill="#16a34a"
    >
      SERVICE INVOICE
    </text>
    <rect
      x="256"
      y="70"
      width="120"
      height="40"
      rx="4"
      fill="#f0fdf4"
      stroke="#16a34a"
      strokeWidth="1.5"
    />
    <rect x="0" y="126" width="400" height="6" fill="#16a34a" />

    <rect
      x="24"
      y="150"
      width="106"
      height="86"
      rx="4"
      fill="none"
      stroke="#16a34a"
      strokeWidth="1.5"
    />
    <rect
      x="147"
      y="150"
      width="106"
      height="86"
      rx="4"
      fill="none"
      stroke="#16a34a"
      strokeWidth="1.5"
    />
    <rect
      x="270"
      y="150"
      width="106"
      height="86"
      rx="4"
      fill="none"
      stroke="#16a34a"
      strokeWidth="1.5"
    />
    <rect x="34" y="160" width="70" height="7" fill="#16a34a" />
    <rect x="157" y="160" width="70" height="7" fill="#16a34a" />
    <rect x="280" y="160" width="70" height="7" fill="#16a34a" />

    <rect x="24" y="256" width="352" height="20" fill="#16a34a" />
    <rect x="24" y="276" width="352" height="20" fill="#f0fdf4" />
    <rect x="24" y="300" width="352" height="1" fill="#e5e7eb" />
    <rect x="24" y="324" width="352" height="1" fill="#e5e7eb" />

    <rect
      x="196"
      y="356"
      width="180"
      height="52"
      rx="4"
      fill="none"
      stroke="#16a34a"
      strokeWidth="1.5"
    />
    <rect x="196" y="382" width="180" height="26" fill="#16a34a" />
    <text
      x="286"
      y="400"
      textAnchor="middle"
      fontFamily="Helvetica, Arial, sans-serif"
      fontWeight="700"
      fontSize="12"
      fill="#ffffff"
    >
      TOTAL DUE
    </text>

    <text
      x="200"
      y="470"
      textAnchor="middle"
      fontFamily="Helvetica, Arial, sans-serif"
      fontStyle="italic"
      fontSize="10"
      fill="#6b7280"
    >
      Thank you for your business
    </text>
  </Base>
);

export const TEMPLATE_THUMBNAILS = {
  classic: ClassicThumb,
  premium: PremiumThumb,
  speed: SpeedThumb,
  modern: ModernThumb,
  diagnostic: DiagnosticThumb,
};

export default TEMPLATE_THUMBNAILS;
