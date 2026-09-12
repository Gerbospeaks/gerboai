import React, { useState, useEffect } from "react";
import {
  FileText,
  ShoppingCart,
  Check,
  Eye,
  Sparkles,
  Stethoscope,
  Heart,
  Activity,
  Pill,
  Cross,
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

// ─── Invoice Preview SVGs ────────────────────────────────────────────────────

const ClassicMedicalPreview = () => (
  <svg
    viewBox="0 0 400 500"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-full"
  >
    <rect width="400" height="500" fill="#f8f9fa" />
    {/* Header */}
    <rect width="400" height="70" fill="#4b5563" />
    <text
      x="20"
      y="28"
      fontFamily="Georgia, serif"
      fontSize="14"
      fill="white"
      fontWeight="bold"
    >
      MEDICAL INVOICE
    </text>
    <text x="20" y="44" fontFamily="Georgia, serif" fontSize="8" fill="#d1d5db">
      City General Hospital
    </text>
    <text x="20" y="56" fontFamily="Georgia, serif" fontSize="7" fill="#9ca3af">
      123 Health Avenue, Medical District
    </text>
    <text
      x="310"
      y="28"
      fontFamily="Georgia, serif"
      fontSize="8"
      fill="#d1d5db"
    >
      Invoice #
    </text>
    <text
      x="310"
      y="40"
      fontFamily="Georgia, serif"
      fontSize="10"
      fill="white"
      fontWeight="bold"
    >
      MED-00412
    </text>
    <text
      x="310"
      y="54"
      fontFamily="Georgia, serif"
      fontSize="7"
      fill="#9ca3af"
    >
      Date: 19 Feb 2026
    </text>

    {/* 3-column info strip */}
    <rect x="0" y="70" width="133" height="60" fill="#e5e7eb" />
    <rect x="133" y="70" width="134" height="60" fill="#d1d5db" />
    <rect x="267" y="70" width="133" height="60" fill="#e5e7eb" />

    <text
      x="10"
      y="86"
      fontFamily="Georgia, serif"
      fontSize="7"
      fill="#6b7280"
      fontWeight="bold"
    >
      PATIENT
    </text>
    <text x="10" y="98" fontFamily="Georgia, serif" fontSize="8" fill="#111827">
      John A. Smith
    </text>
    <text
      x="10"
      y="109"
      fontFamily="Georgia, serif"
      fontSize="7"
      fill="#374151"
    >
      DOB: 12 Mar 1980
    </text>
    <text
      x="10"
      y="120"
      fontFamily="Georgia, serif"
      fontSize="7"
      fill="#374151"
    >
      ID: PT-29834
    </text>

    <text
      x="143"
      y="86"
      fontFamily="Georgia, serif"
      fontSize="7"
      fill="#6b7280"
      fontWeight="bold"
    >
      DOCTOR
    </text>
    <text
      x="143"
      y="98"
      fontFamily="Georgia, serif"
      fontSize="8"
      fill="#111827"
    >
      Dr. Emily Carter
    </text>
    <text
      x="143"
      y="109"
      fontFamily="Georgia, serif"
      fontSize="7"
      fill="#374151"
    >
      Internal Medicine
    </text>
    <text
      x="143"
      y="120"
      fontFamily="Georgia, serif"
      fontSize="7"
      fill="#374151"
    >
      Lic: MD-77821
    </text>

    <text
      x="277"
      y="86"
      fontFamily="Georgia, serif"
      fontSize="7"
      fill="#6b7280"
      fontWeight="bold"
    >
      BILLING
    </text>
    <text
      x="277"
      y="98"
      fontFamily="Georgia, serif"
      fontSize="8"
      fill="#111827"
    >
      Scheme: MedAid
    </text>
    <text
      x="277"
      y="109"
      fontFamily="Georgia, serif"
      fontSize="7"
      fill="#374151"
    >
      Member: 445-GH-2
    </text>
    <text
      x="277"
      y="120"
      fontFamily="Georgia, serif"
      fontSize="7"
      fill="#374151"
    >
      Auth: A829301
    </text>

    {/* Divider */}
    <line x1="0" y1="130" x2="400" y2="130" stroke="#9ca3af" strokeWidth="1" />

    {/* Services table header */}
    <rect x="0" y="130" width="400" height="20" fill="#374151" />
    <text
      x="10"
      y="144"
      fontFamily="Georgia, serif"
      fontSize="8"
      fill="white"
      fontWeight="bold"
    >
      DESCRIPTION
    </text>
    <text
      x="210"
      y="144"
      fontFamily="Georgia, serif"
      fontSize="8"
      fill="white"
      fontWeight="bold"
    >
      CODE
    </text>
    <text
      x="270"
      y="144"
      fontFamily="Georgia, serif"
      fontSize="8"
      fill="white"
      fontWeight="bold"
    >
      QTY
    </text>
    <text
      x="320"
      y="144"
      fontFamily="Georgia, serif"
      fontSize="8"
      fill="white"
      fontWeight="bold"
    >
      AMOUNT
    </text>

    {/* Table rows */}
    {[
      ["Consultation – General", "0190", "1", "R 850.00"],
      ["Full Blood Count (FBC)", "4021", "1", "R 320.00"],
      ["Chest X-Ray (PA View)", "3520", "1", "R 540.00"],
      ["ECG – 12 Lead", "4110", "1", "R 410.00"],
      ["Urine Dipstick Analysis", "3301", "2", "R 180.00"],
    ].map(([desc, code, qty, amt], i) => (
      <g key={i}>
        <rect
          x="0"
          y={150 + i * 22}
          width="400"
          height="22"
          fill={i % 2 === 0 ? "#ffffff" : "#f3f4f6"}
        />
        <text
          x="10"
          y={164 + i * 22}
          fontFamily="Georgia, serif"
          fontSize="8"
          fill="#1f2937"
        >
          {desc}
        </text>
        <text
          x="210"
          y={164 + i * 22}
          fontFamily="Georgia, serif"
          fontSize="8"
          fill="#6b7280"
        >
          {code}
        </text>
        <text
          x="275"
          y={164 + i * 22}
          fontFamily="Georgia, serif"
          fontSize="8"
          fill="#374151"
        >
          {qty}
        </text>
        <text
          x="320"
          y={164 + i * 22}
          fontFamily="Georgia, serif"
          fontSize="8"
          fill="#111827"
          fontWeight="bold"
        >
          {amt}
        </text>
      </g>
    ))}

    {/* Totals */}
    <line x1="0" y1="260" x2="400" y2="260" stroke="#d1d5db" strokeWidth="1" />
    <rect x="250" y="262" width="150" height="18" fill="#f3f4f6" />
    <text
      x="260"
      y="274"
      fontFamily="Georgia, serif"
      fontSize="8"
      fill="#6b7280"
    >
      Subtotal
    </text>
    <text
      x="360"
      y="274"
      fontFamily="Georgia, serif"
      fontSize="8"
      fill="#374151"
    >
      R 2,300.00
    </text>
    <rect x="250" y="280" width="150" height="18" fill="#f3f4f6" />
    <text
      x="260"
      y="292"
      fontFamily="Georgia, serif"
      fontSize="8"
      fill="#6b7280"
    >
      Medical Aid
    </text>
    <text
      x="354"
      y="292"
      fontFamily="Georgia, serif"
      fontSize="8"
      fill="#16a34a"
    >
      −R 1,800.00
    </text>
    <rect x="250" y="298" width="150" height="22" fill="#4b5563" />
    <text
      x="260"
      y="313"
      fontFamily="Georgia, serif"
      fontSize="9"
      fill="white"
      fontWeight="bold"
    >
      PATIENT DUE
    </text>
    <text
      x="346"
      y="313"
      fontFamily="Georgia, serif"
      fontSize="9"
      fill="white"
      fontWeight="bold"
    >
      R 500.00
    </text>

    {/* Notes */}
    <text
      x="10"
      y="285"
      fontFamily="Georgia, serif"
      fontSize="7"
      fill="#6b7280"
      fontWeight="bold"
    >
      NOTES
    </text>
    <text
      x="10"
      y="296"
      fontFamily="Georgia, serif"
      fontSize="7"
      fill="#374151"
    >
      Please present this invoice at the billing office.
    </text>
    <text
      x="10"
      y="307"
      fontFamily="Georgia, serif"
      fontSize="7"
      fill="#374151"
    >
      Payment due within 30 days of service date.
    </text>

    {/* Footer */}
    <rect x="0" y="460" width="400" height="40" fill="#e5e7eb" />
    <line x1="0" y1="460" x2="400" y2="460" stroke="#9ca3af" strokeWidth="1" />
    <text
      x="200"
      y="476"
      fontFamily="Georgia, serif"
      fontSize="7"
      fill="#6b7280"
      textAnchor="middle"
    >
      City General Hospital · Tel: +27 11 000 1234 · billing@cityhospital.co.za
    </text>
    <text
      x="200"
      y="490"
      fontFamily="Georgia, serif"
      fontSize="7"
      fill="#9ca3af"
      textAnchor="middle"
    >
      Registration No. 2005/012345/07 · VAT No. 4120987654
    </text>
  </svg>
);

const PremiumHealthcarePreview = () => (
  <svg
    viewBox="0 0 400 500"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-full"
  >
    <rect width="400" height="500" fill="#faf5ff" />
    {/* Outer border */}
    <rect
      x="6"
      y="6"
      width="388"
      height="488"
      fill="none"
      stroke="#7c3aed"
      strokeWidth="1.5"
    />
    <rect
      x="10"
      y="10"
      width="380"
      height="480"
      fill="none"
      stroke="#c4b5fd"
      strokeWidth="0.5"
    />

    {/* Top accent bar */}
    <rect x="6" y="6" width="388" height="6" fill="#7c3aed" />

    {/* Logo / branding area */}
    <circle cx="45" cy="55" r="22" fill="#7c3aed" />
    <text
      x="45"
      y="51"
      fontFamily="Palatino, serif"
      fontSize="14"
      fill="white"
      textAnchor="middle"
      fontWeight="bold"
    >
      ♥
    </text>
    <text
      x="45"
      y="63"
      fontFamily="Palatino, serif"
      fontSize="7"
      fill="white"
      textAnchor="middle"
    >
      CARE
    </text>

    <text
      x="78"
      y="46"
      fontFamily="Palatino, serif"
      fontSize="16"
      fill="#4c1d95"
      fontWeight="bold"
    >
      PrivateMed
    </text>
    <text
      x="78"
      y="58"
      fontFamily="Palatino, serif"
      fontSize="8"
      fill="#7c3aed"
    >
      Private Healthcare Practice
    </text>
    <text
      x="78"
      y="70"
      fontFamily="Palatino, serif"
      fontSize="7"
      fill="#9ca3af"
    >
      Reg. No. 2012/045678/08
    </text>

    <text
      x="370"
      y="42"
      fontFamily="Palatino, serif"
      fontSize="9"
      fill="#7c3aed"
      textAnchor="end"
      fontWeight="bold"
    >
      INVOICE
    </text>
    <text
      x="370"
      y="54"
      fontFamily="Palatino, serif"
      fontSize="8"
      fill="#4c1d95"
      textAnchor="end"
    >
      #PM-2026-0198
    </text>
    <text
      x="370"
      y="66"
      fontFamily="Palatino, serif"
      fontSize="7"
      fill="#9ca3af"
      textAnchor="end"
    >
      19 February 2026
    </text>

    {/* Purple divider */}
    <line x1="20" y1="85" x2="380" y2="85" stroke="#7c3aed" strokeWidth="1" />
    <line x1="20" y1="88" x2="380" y2="88" stroke="#c4b5fd" strokeWidth="0.5" />

    {/* Bill to / practice info */}
    <text
      x="24"
      y="104"
      fontFamily="Palatino, serif"
      fontSize="7"
      fill="#7c3aed"
      fontWeight="bold"
      letterSpacing="2"
    >
      BILLED TO
    </text>
    <text
      x="24"
      y="116"
      fontFamily="Palatino, serif"
      fontSize="9"
      fill="#1f2937"
      fontWeight="bold"
    >
      Mrs. Claire Beaumont
    </text>
    <text
      x="24"
      y="127"
      fontFamily="Palatino, serif"
      fontSize="8"
      fill="#374151"
    >
      21 Rose Garden, Sandton, 2196
    </text>
    <text
      x="24"
      y="138"
      fontFamily="Palatino, serif"
      fontSize="8"
      fill="#374151"
    >
      claire.beaumont@email.com
    </text>

    <text
      x="230"
      y="104"
      fontFamily="Palatino, serif"
      fontSize="7"
      fill="#7c3aed"
      fontWeight="bold"
      letterSpacing="2"
    >
      ATTENDING
    </text>
    <text
      x="230"
      y="116"
      fontFamily="Palatino, serif"
      fontSize="9"
      fill="#1f2937"
      fontWeight="bold"
    >
      Dr. Sophia Langley
    </text>
    <text
      x="230"
      y="127"
      fontFamily="Palatino, serif"
      fontSize="8"
      fill="#374151"
    >
      Specialist: Cardiology
    </text>
    <text
      x="230"
      y="138"
      fontFamily="Palatino, serif"
      fontSize="8"
      fill="#374151"
    >
      Practice No. 0834219
    </text>

    {/* Table */}
    <rect x="20" y="152" width="360" height="20" fill="#7c3aed" rx="2" />
    <text
      x="28"
      y="165"
      fontFamily="Palatino, serif"
      fontSize="8"
      fill="white"
      fontWeight="bold"
    >
      SERVICE
    </text>
    <text
      x="230"
      y="165"
      fontFamily="Palatino, serif"
      fontSize="8"
      fill="white"
      fontWeight="bold"
    >
      DATE
    </text>
    <text
      x="310"
      y="165"
      fontFamily="Palatino, serif"
      fontSize="8"
      fill="white"
      fontWeight="bold"
    >
      AMOUNT
    </text>

    {[
      ["Cardiological Consultation", "12 Feb 2026", "R 1,850"],
      ["Echocardiogram (Echo)", "12 Feb 2026", "R 2,200"],
      ["Holter Monitor (24hr)", "14 Feb 2026", "R 1,600"],
      ["Stress Test – Treadmill", "17 Feb 2026", "R 1,950"],
      ["Follow-up Consultation", "19 Feb 2026", "R 950"],
    ].map(([svc, date, amt], i) => (
      <g key={i}>
        <rect
          x="20"
          y={172 + i * 22}
          width="360"
          height="22"
          fill={i % 2 === 0 ? "#faf5ff" : "#f3e8ff"}
        />
        <line
          x1="20"
          y1={194 + i * 22}
          x2="380"
          y2={194 + i * 22}
          stroke="#e9d5ff"
          strokeWidth="0.5"
        />
        <text
          x="28"
          y={186 + i * 22}
          fontFamily="Palatino, serif"
          fontSize="8"
          fill="#1f2937"
        >
          {svc}
        </text>
        <text
          x="230"
          y={186 + i * 22}
          fontFamily="Palatino, serif"
          fontSize="8"
          fill="#6b7280"
        >
          {date}
        </text>
        <text
          x="310"
          y={186 + i * 22}
          fontFamily="Palatino, serif"
          fontSize="8"
          fill="#4c1d95"
          fontWeight="bold"
        >
          {amt}
        </text>
      </g>
    ))}

    {/* Total */}
    <line x1="20" y1="283" x2="380" y2="283" stroke="#7c3aed" strokeWidth="1" />
    <rect x="260" y="288" width="120" height="28" fill="#7c3aed" rx="3" />
    <text
      x="270"
      y="300"
      fontFamily="Palatino, serif"
      fontSize="8"
      fill="#e9d5ff"
    >
      TOTAL DUE
    </text>
    <text
      x="270"
      y="312"
      fontFamily="Palatino, serif"
      fontSize="10"
      fill="white"
      fontWeight="bold"
    >
      R 8,550.00
    </text>

    <text
      x="24"
      y="302"
      fontFamily="Palatino, serif"
      fontSize="7"
      fill="#9ca3af"
    >
      Banking Details · FNB · Acc: 620 445 8891
    </text>
    <text
      x="24"
      y="314"
      fontFamily="Palatino, serif"
      fontSize="7"
      fill="#9ca3af"
    >
      Ref: PM-2026-0198 · Payment within 14 days
    </text>

    {/* Bottom border accent */}
    <rect x="6" y="488" width="388" height="6" fill="#7c3aed" />

    <text
      x="200"
      y="474"
      fontFamily="Palatino, serif"
      fontSize="7"
      fill="#7c3aed"
      textAnchor="middle"
    >
      PrivateMed Practice · info@privatemed.co.za · +27 11 880 2200
    </text>
  </svg>
);

const EmergencyCarePreview = () => (
  <svg
    viewBox="0 0 400 500"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-full"
  >
    <rect width="400" height="500" fill="#fff" />
    {/* Bold red header */}
    <rect width="400" height="90" fill="#dc2626" />
    {/* Cross symbol */}
    <rect x="18" y="22" width="8" height="26" fill="white" rx="1" />
    <rect x="10" y="30" width="24" height="8" fill="white" rx="1" />

    <text
      x="48"
      y="42"
      fontFamily="Impact, sans-serif"
      fontSize="18"
      fill="white"
      letterSpacing="2"
    >
      EMERGENCY CARE
    </text>
    <text
      x="48"
      y="56"
      fontFamily="Arial, sans-serif"
      fontSize="8"
      fill="#fca5a5"
    >
      Rapid Response Medical Centre · 24/7
    </text>
    <text
      x="48"
      y="68"
      fontFamily="Arial, sans-serif"
      fontSize="7"
      fill="#fecaca"
    >
      12 Trauma Road, Johannesburg · +27 11 999 0000
    </text>

    <rect x="280" y="16" width="104" height="58" fill="#b91c1c" rx="3" />
    <text
      x="332"
      y="33"
      fontFamily="Arial, sans-serif"
      fontSize="7"
      fill="#fca5a5"
      textAnchor="middle"
      fontWeight="bold"
    >
      INVOICE
    </text>
    <text
      x="332"
      y="46"
      fontFamily="Impact, sans-serif"
      fontSize="12"
      fill="white"
      textAnchor="middle"
    >
      #ER-4491
    </text>
    <text
      x="332"
      y="59"
      fontFamily="Arial, sans-serif"
      fontSize="7"
      fill="#fca5a5"
      textAnchor="middle"
    >
      19 FEB 2026
    </text>
    <text
      x="332"
      y="70"
      fontFamily="Arial, sans-serif"
      fontSize="7"
      fill="#fecaca"
      textAnchor="middle"
    >
      URGENT
    </text>

    {/* Alert strip */}
    <rect x="0" y="90" width="400" height="18" fill="#fef2f2" />
    <rect x="0" y="90" width="4" height="18" fill="#dc2626" />
    <text
      x="12"
      y="102"
      fontFamily="Arial, sans-serif"
      fontSize="7"
      fill="#7f1d1d"
      fontWeight="bold"
    >
      ⚠ EMERGENCY ADMISSION — PRIORITY BILLING — TRAUMA LEVEL 2
    </text>

    {/* Patient info */}
    <rect x="0" y="108" width="200" height="50" fill="#fafafa" />
    <rect x="200" y="108" width="200" height="50" fill="#f5f5f5" />
    <text
      x="10"
      y="122"
      fontFamily="Arial, sans-serif"
      fontSize="7"
      fill="#dc2626"
      fontWeight="bold"
    >
      PATIENT DETAILS
    </text>
    <text
      x="10"
      y="134"
      fontFamily="Arial, sans-serif"
      fontSize="8"
      fill="#111827"
      fontWeight="bold"
    >
      Marcus T. Dlamini
    </text>
    <text
      x="10"
      y="145"
      fontFamily="Arial, sans-serif"
      fontSize="7"
      fill="#374151"
    >
      Triage: Level 2 · Age: 34
    </text>
    <text
      x="10"
      y="155"
      fontFamily="Arial, sans-serif"
      fontSize="7"
      fill="#374151"
    >
      Arrival: 02:14 · Discharged: 06:50
    </text>

    <text
      x="210"
      y="122"
      fontFamily="Arial, sans-serif"
      fontSize="7"
      fill="#dc2626"
      fontWeight="bold"
    >
      CASE REFERENCE
    </text>
    <text
      x="210"
      y="134"
      fontFamily="Arial, sans-serif"
      fontSize="8"
      fill="#111827"
      fontWeight="bold"
    >
      Case #ER-29-FEB-91
    </text>
    <text
      x="210"
      y="145"
      fontFamily="Arial, sans-serif"
      fontSize="7"
      fill="#374151"
    >
      Attending: Dr. Ravi Nair
    </text>
    <text
      x="210"
      y="155"
      fontFamily="Arial, sans-serif"
      fontSize="7"
      fill="#374151"
    >
      Unit: Trauma Bay 3
    </text>

    {/* Table */}
    <rect x="0" y="158" width="400" height="20" fill="#1f2937" />
    <text
      x="10"
      y="171"
      fontFamily="Arial, sans-serif"
      fontSize="8"
      fill="white"
      fontWeight="bold"
    >
      PROCEDURE / SERVICE
    </text>
    <text
      x="240"
      y="171"
      fontFamily="Arial, sans-serif"
      fontSize="8"
      fill="#9ca3af"
    >
      TARIFF
    </text>
    <text
      x="290"
      y="171"
      fontFamily="Arial, sans-serif"
      fontSize="8"
      fill="#9ca3af"
    >
      QTY
    </text>
    <text
      x="340"
      y="171"
      fontFamily="Arial, sans-serif"
      fontSize="8"
      fill="white"
      fontWeight="bold"
    >
      TOTAL
    </text>

    {[
      ["Emergency Room Fee (Level 2)", "0800", "1", "R 1,200"],
      ["Trauma Assessment & Stabilisation", "0910", "1", "R 980"],
      ["IV Line & Fluids (1L NaCl)", "2210", "2", "R 420"],
      ["X-Ray – Rib Series", "3540", "1", "R 650"],
      ["Wound Suturing (6 sutures)", "2880", "1", "R 740"],
      ["Analgesia Administration", "1920", "3", "R 330"],
    ].map(([svc, code, qty, amt], i) => (
      <g key={i}>
        <rect
          x="0"
          y={178 + i * 21}
          width="400"
          height="21"
          fill={i % 2 === 0 ? "#fff" : "#fef2f2"}
        />
        <rect
          x="0"
          y={178 + i * 21}
          width="3"
          height="21"
          fill={i % 2 === 0 ? "#e5e7eb" : "#fca5a5"}
        />
        <text
          x="10"
          y={192 + i * 21}
          fontFamily="Arial, sans-serif"
          fontSize="8"
          fill="#111827"
        >
          {svc}
        </text>
        <text
          x="240"
          y={192 + i * 21}
          fontFamily="Arial, sans-serif"
          fontSize="8"
          fill="#6b7280"
        >
          {code}
        </text>
        <text
          x="293"
          y={192 + i * 21}
          fontFamily="Arial, sans-serif"
          fontSize="8"
          fill="#374151"
        >
          {qty}
        </text>
        <text
          x="340"
          y={192 + i * 21}
          fontFamily="Arial, sans-serif"
          fontSize="8"
          fill="#dc2626"
          fontWeight="bold"
        >
          {amt}
        </text>
      </g>
    ))}

    {/* Total */}
    <rect x="0" y="304" width="400" height="2" fill="#dc2626" />
    <rect x="0" y="306" width="400" height="1" fill="#fca5a5" />
    <rect x="240" y="310" width="160" height="32" fill="#dc2626" rx="2" />
    <text
      x="252"
      y="323"
      fontFamily="Arial, sans-serif"
      fontSize="8"
      fill="#fecaca"
    >
      TOTAL DUE
    </text>
    <text
      x="252"
      y="337"
      fontFamily="Impact, sans-serif"
      fontSize="12"
      fill="white"
    >
      R 4,320.00
    </text>

    <text
      x="10"
      y="325"
      fontFamily="Arial, sans-serif"
      fontSize="7"
      fill="#6b7280"
    >
      Medical Aid Claim Submitted
    </text>
    <text
      x="10"
      y="337"
      fontFamily="Arial, sans-serif"
      fontSize="7"
      fill="#374151"
      fontWeight="bold"
    >
      Balance payable within 7 days
    </text>

    {/* Footer */}
    <rect x="0" y="458" width="400" height="42" fill="#1f2937" />
    <rect x="0" y="458" width="400" height="3" fill="#dc2626" />
    <text
      x="200"
      y="475"
      fontFamily="Arial, sans-serif"
      fontSize="7"
      fill="#9ca3af"
      textAnchor="middle"
    >
      Rapid Response Medical Centre · billing@rrmc.co.za · +27 11 999 0000
    </text>
    <text
      x="200"
      y="490"
      fontFamily="Arial, sans-serif"
      fontSize="7"
      fill="#6b7280"
      textAnchor="middle"
    >
      Reg. 2010/099123/07 · Practice No. ER-441 · VAT 4130009812
    </text>
  </svg>
);

const WellnessPreview = () => (
  <svg
    viewBox="0 0 400 500"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-full"
  >
    <rect width="400" height="500" fill="#f0f9ff" />
    {/* Soft top band */}
    <rect width="400" height="8" fill="#0284c7" />

    {/* Generous top whitespace */}
    <rect x="0" y="8" width="400" height="82" fill="#e0f2fe" />

    {/* Stethoscope mark */}
    <circle cx="36" cy="52" r="20" fill="#0284c7" opacity="0.15" />
    <circle
      cx="36"
      cy="52"
      r="12"
      fill="none"
      stroke="#0284c7"
      strokeWidth="2"
    />
    <line x1="36" y1="40" x2="36" y2="32" stroke="#0284c7" strokeWidth="2" />
    <circle cx="36" cy="30" r="3" fill="#0284c7" />

    <text
      x="66"
      y="40"
      fontFamily="Trebuchet MS, sans-serif"
      fontSize="16"
      fill="#075985"
      fontWeight="bold"
    >
      WellnessCare
    </text>
    <text
      x="66"
      y="53"
      fontFamily="Trebuchet MS, sans-serif"
      fontSize="8"
      fill="#0284c7"
    >
      Preventive & Integrative Medicine
    </text>
    <text
      x="66"
      y="65"
      fontFamily="Trebuchet MS, sans-serif"
      fontSize="7"
      fill="#7dd3fc"
    >
      7 Serenity Lane, Cape Town, 8001
    </text>
    <text
      x="66"
      y="76"
      fontFamily="Trebuchet MS, sans-serif"
      fontSize="7"
      fill="#7dd3fc"
    >
      info@wellnesscare.co.za
    </text>

    <text
      x="368"
      y="44"
      fontFamily="Trebuchet MS, sans-serif"
      fontSize="8"
      fill="#0284c7"
      textAnchor="end"
    >
      TAX INVOICE
    </text>
    <text
      x="368"
      y="56"
      fontFamily="Trebuchet MS, sans-serif"
      fontSize="9"
      fill="#075985"
      textAnchor="end"
      fontWeight="bold"
    >
      WC-2026-0311
    </text>
    <text
      x="368"
      y="68"
      fontFamily="Trebuchet MS, sans-serif"
      fontSize="7"
      fill="#7dd3fc"
      textAnchor="end"
    >
      19 February 2026
    </text>
    <text
      x="368"
      y="80"
      fontFamily="Trebuchet MS, sans-serif"
      fontSize="7"
      fill="#7dd3fc"
      textAnchor="end"
    >
      Due: 05 March 2026
    </text>

    {/* Blue horizontal rule */}
    <line x1="20" y1="94" x2="380" y2="94" stroke="#0284c7" strokeWidth="1.5" />

    {/* Spacious patient block */}
    <text
      x="24"
      y="114"
      fontFamily="Trebuchet MS, sans-serif"
      fontSize="7"
      fill="#0284c7"
      fontWeight="bold"
      letterSpacing="3"
    >
      PATIENT
    </text>
    <text
      x="24"
      y="128"
      fontFamily="Trebuchet MS, sans-serif"
      fontSize="11"
      fill="#0c4a6e"
      fontWeight="bold"
    >
      Amahle N. Khumalo
    </text>
    <text
      x="24"
      y="141"
      fontFamily="Trebuchet MS, sans-serif"
      fontSize="8"
      fill="#374151"
    >
      34 Fynbos Drive, Somerset West
    </text>
    <text
      x="24"
      y="153"
      fontFamily="Trebuchet MS, sans-serif"
      fontSize="8"
      fill="#374151"
    >
      amahle.k@email.com · 082 555 7743
    </text>

    <text
      x="230"
      y="114"
      fontFamily="Trebuchet MS, sans-serif"
      fontSize="7"
      fill="#0284c7"
      fontWeight="bold"
      letterSpacing="3"
    >
      PROVIDER
    </text>
    <text
      x="230"
      y="128"
      fontFamily="Trebuchet MS, sans-serif"
      fontSize="9"
      fill="#0c4a6e"
      fontWeight="bold"
    >
      Dr. Lerato Mokoena
    </text>
    <text
      x="230"
      y="141"
      fontFamily="Trebuchet MS, sans-serif"
      fontSize="8"
      fill="#374151"
    >
      Integrative Medicine Specialist
    </text>
    <text
      x="230"
      y="153"
      fontFamily="Trebuchet MS, sans-serif"
      fontSize="8"
      fill="#374151"
    >
      Practice No. WC-0044-PM
    </text>

    {/* Subtle divider */}
    <line x1="20" y1="164" x2="380" y2="164" stroke="#bae6fd" strokeWidth="1" />

    {/* Table header */}
    <rect x="20" y="168" width="360" height="20" fill="#0284c7" rx="3" />
    <text
      x="30"
      y="181"
      fontFamily="Trebuchet MS, sans-serif"
      fontSize="8"
      fill="white"
      fontWeight="bold"
    >
      WELLNESS SERVICE
    </text>
    <text
      x="250"
      y="181"
      fontFamily="Trebuchet MS, sans-serif"
      fontSize="8"
      fill="#bae6fd"
    >
      SESSION
    </text>
    <text
      x="320"
      y="181"
      fontFamily="Trebuchet MS, sans-serif"
      fontSize="8"
      fill="white"
      fontWeight="bold"
    >
      FEE
    </text>

    {[
      ["Annual Wellness Screening", "1 x 60min", "R 750"],
      ["Nutritional Assessment & Plan", "1 x 45min", "R 620"],
      ["Stress & Cortisol Panel", "1 x Lab", "R 480"],
      ["Mindfulness-Based Therapy", "4 x 30min", "R 960"],
      ["Vitamin IV Infusion (Myers)", "1 x Drip", "R 1,100"],
    ].map(([svc, sess, fee], i) => (
      <g key={i}>
        <rect
          x="20"
          y={188 + i * 24}
          width="360"
          height="24"
          fill={i % 2 === 0 ? "#f0f9ff" : "#e0f2fe"}
        />
        <text
          x="30"
          y={203 + i * 24}
          fontFamily="Trebuchet MS, sans-serif"
          fontSize="8"
          fill="#0c4a6e"
        >
          {svc}
        </text>
        <text
          x="250"
          y={203 + i * 24}
          fontFamily="Trebuchet MS, sans-serif"
          fontSize="8"
          fill="#6b7280"
        >
          {sess}
        </text>
        <text
          x="320"
          y={203 + i * 24}
          fontFamily="Trebuchet MS, sans-serif"
          fontSize="8"
          fill="#0284c7"
          fontWeight="bold"
        >
          {fee}
        </text>
      </g>
    ))}

    {/* Total area */}
    <line
      x1="20"
      y1="309"
      x2="380"
      y2="309"
      stroke="#bae6fd"
      strokeWidth="1.5"
    />
    <rect x="260" y="314" width="120" height="26" fill="#0284c7" rx="3" />
    <text
      x="270"
      y="325"
      fontFamily="Trebuchet MS, sans-serif"
      fontSize="7"
      fill="#bae6fd"
    >
      TOTAL PAYABLE
    </text>
    <text
      x="270"
      y="336"
      fontFamily="Trebuchet MS, sans-serif"
      fontSize="10"
      fill="white"
      fontWeight="bold"
    >
      R 3,910.00
    </text>

    <text
      x="24"
      y="326"
      fontFamily="Trebuchet MS, sans-serif"
      fontSize="7"
      fill="#6b7280"
    >
      Bank: Nedbank · Acc: 1987 442 001
    </text>
    <text
      x="24"
      y="338"
      fontFamily="Trebuchet MS, sans-serif"
      fontSize="7"
      fill="#374151"
    >
      Ref: WC-2026-0311
    </text>

    {/* Bottom band */}
    <rect x="0" y="492" width="400" height="8" fill="#0284c7" />
    <text
      x="200"
      y="474"
      fontFamily="Trebuchet MS, sans-serif"
      fontSize="7"
      fill="#0284c7"
      textAnchor="middle"
    >
      WellnessCare · +27 21 445 8801 · info@wellnesscare.co.za
    </text>
    <text
      x="200"
      y="485"
      fontFamily="Trebuchet MS, sans-serif"
      fontSize="7"
      fill="#7dd3fc"
      textAnchor="middle"
    >
      VAT No. 4590123877 · Practice Lic. WC-PM-0044
    </text>
  </svg>
);

const PharmacyPreview = () => (
  <svg
    viewBox="0 0 400 500"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-full"
  >
    <rect width="400" height="500" fill="#f0fdf4" />
    {/* Header */}
    <rect width="400" height="78" fill="#15803d" />
    {/* Pill icon */}
    <ellipse
      cx="30"
      cy="39"
      rx="14"
      ry="8"
      fill="white"
      opacity="0.9"
      transform="rotate(-30 30 39)"
    />
    <line x1="22" y1="32" x2="38" y2="46" stroke="#15803d" strokeWidth="2" />

    <text
      x="54"
      y="30"
      fontFamily="Verdana, sans-serif"
      fontSize="14"
      fill="white"
      fontWeight="bold"
    >
      PharmaPlus
    </text>
    <text
      x="54"
      y="43"
      fontFamily="Verdana, sans-serif"
      fontSize="7"
      fill="#86efac"
    >
      Dispensing Pharmacy & Compounding
    </text>
    <text
      x="54"
      y="55"
      fontFamily="Verdana, sans-serif"
      fontSize="7"
      fill="#4ade80"
    >
      45 Health Hub, Pretoria · +27 12 345 9900
    </text>
    <text
      x="54"
      y="67"
      fontFamily="Verdana, sans-serif"
      fontSize="7"
      fill="#4ade80"
    >
      Pharm. Lic. No. G-2201 · VAT 4330091234
    </text>

    <rect x="278" y="12" width="110" height="54" fill="#166534" rx="3" />
    <text
      x="333"
      y="29"
      fontFamily="Verdana, sans-serif"
      fontSize="7"
      fill="#86efac"
      textAnchor="middle"
      fontWeight="bold"
    >
      DISPENSING INVOICE
    </text>
    <text
      x="333"
      y="42"
      fontFamily="Verdana, sans-serif"
      fontSize="10"
      fill="white"
      textAnchor="middle"
      fontWeight="bold"
    >
      #PP-8841
    </text>
    <text
      x="333"
      y="55"
      fontFamily="Verdana, sans-serif"
      fontSize="7"
      fill="#4ade80"
      textAnchor="middle"
    >
      19 Feb 2026
    </text>

    {/* Patient + Prescriber */}
    <rect x="0" y="78" width="200" height="56" fill="#dcfce7" />
    <rect x="200" y="78" width="200" height="56" fill="#f0fdf4" />
    <text
      x="10"
      y="94"
      fontFamily="Verdana, sans-serif"
      fontSize="7"
      fill="#15803d"
      fontWeight="bold"
    >
      PATIENT
    </text>
    <text
      x="10"
      y="106"
      fontFamily="Verdana, sans-serif"
      fontSize="9"
      fill="#14532d"
      fontWeight="bold"
    >
      Mr. Sipho Ndlovu
    </text>
    <text
      x="10"
      y="118"
      fontFamily="Verdana, sans-serif"
      fontSize="7"
      fill="#374151"
    >
      ID: 8004125184089
    </text>
    <text
      x="10"
      y="128"
      fontFamily="Verdana, sans-serif"
      fontSize="7"
      fill="#374151"
    >
      Med Aid: Bonitas · Dep 02
    </text>

    <text
      x="210"
      y="94"
      fontFamily="Verdana, sans-serif"
      fontSize="7"
      fill="#15803d"
      fontWeight="bold"
    >
      PRESCRIBER
    </text>
    <text
      x="210"
      y="106"
      fontFamily="Verdana, sans-serif"
      fontSize="8"
      fill="#14532d"
      fontWeight="bold"
    >
      Dr. Fatima Ismail
    </text>
    <text
      x="210"
      y="118"
      fontFamily="Verdana, sans-serif"
      fontSize="7"
      fill="#374151"
    >
      Rx No. 2026-02-84912
    </text>
    <text
      x="210"
      y="128"
      fontFamily="Verdana, sans-serif"
      fontSize="7"
      fill="#374151"
    >
      Date: 17 Feb 2026
    </text>

    {/* Table */}
    <rect x="0" y="134" width="400" height="20" fill="#14532d" />
    <text
      x="10"
      y="147"
      fontFamily="Verdana, sans-serif"
      fontSize="7"
      fill="#86efac"
      fontWeight="bold"
    >
      MEDICATION / PRODUCT
    </text>
    <text
      x="190"
      y="147"
      fontFamily="Verdana, sans-serif"
      fontSize="7"
      fill="#86efac"
      fontWeight="bold"
    >
      NAPPI
    </text>
    <text
      x="240"
      y="147"
      fontFamily="Verdana, sans-serif"
      fontSize="7"
      fill="#86efac"
      fontWeight="bold"
    >
      QTY
    </text>
    <text
      x="275"
      y="147"
      fontFamily="Verdana, sans-serif"
      fontSize="7"
      fill="#86efac"
      fontWeight="bold"
    >
      DAYS
    </text>
    <text
      x="320"
      y="147"
      fontFamily="Verdana, sans-serif"
      fontSize="7"
      fill="white"
      fontWeight="bold"
    >
      PRICE
    </text>

    {[
      ["Amlodipine 5mg Tabs", "707842", "30", "30", "R 88.50"],
      ["Metformin 850mg (Glucophage)", "714411", "60", "30", "R 112.00"],
      ["Atorvastatin 40mg Tabs", "729034", "30", "30", "R 145.00"],
      ["Aspirin 100mg Disprin", "700801", "30", "30", "R 34.00"],
      ["Vitamin D3 1000IU Caps", "801234", "60", "60", "R 98.00"],
      ["Dispensing Fee", "–", "–", "–", "R 45.00"],
    ].map(([med, nappi, qty, days, price], i) => (
      <g key={i}>
        <rect
          x="0"
          y={154 + i * 22}
          width="400"
          height="22"
          fill={i % 2 === 0 ? "#f0fdf4" : "#dcfce7"}
        />
        <rect x="0" y={154 + i * 22} width="3" height="22" fill="#15803d" />
        <text
          x="10"
          y={168 + i * 22}
          fontFamily="Verdana, sans-serif"
          fontSize="7.5"
          fill="#14532d"
        >
          {med}
        </text>
        <text
          x="190"
          y={168 + i * 22}
          fontFamily="Verdana, sans-serif"
          fontSize="7"
          fill="#6b7280"
        >
          {nappi}
        </text>
        <text
          x="242"
          y={168 + i * 22}
          fontFamily="Verdana, sans-serif"
          fontSize="7"
          fill="#374151"
        >
          {qty}
        </text>
        <text
          x="277"
          y={168 + i * 22}
          fontFamily="Verdana, sans-serif"
          fontSize="7"
          fill="#374151"
        >
          {days}
        </text>
        <text
          x="320"
          y={168 + i * 22}
          fontFamily="Verdana, sans-serif"
          fontSize="7.5"
          fill="#15803d"
          fontWeight="bold"
        >
          {price}
        </text>
      </g>
    ))}

    {/* Totals */}
    <line
      x1="0"
      y1="286"
      x2="400"
      y2="286"
      stroke="#86efac"
      strokeWidth="1.5"
    />
    <rect x="270" y="290" width="130" height="18" fill="#dcfce7" />
    <text
      x="280"
      y="302"
      fontFamily="Verdana, sans-serif"
      fontSize="7"
      fill="#6b7280"
    >
      Subtotal
    </text>
    <text
      x="368"
      y="302"
      fontFamily="Verdana, sans-serif"
      fontSize="7"
      fill="#374151"
      textAnchor="end"
    >
      R 522.50
    </text>
    <rect x="270" y="308" width="130" height="18" fill="#dcfce7" />
    <text
      x="280"
      y="320"
      fontFamily="Verdana, sans-serif"
      fontSize="7"
      fill="#6b7280"
    >
      Med Aid Claim
    </text>
    <text
      x="368"
      y="320"
      fontFamily="Verdana, sans-serif"
      fontSize="7"
      fill="#16a34a"
      textAnchor="end"
    >
      −R 380.00
    </text>
    <rect x="270" y="326" width="130" height="24" fill="#15803d" rx="2" />
    <text
      x="280"
      y="337"
      fontFamily="Verdana, sans-serif"
      fontSize="7"
      fill="#86efac"
      fontWeight="bold"
    >
      CO-PAYMENT
    </text>
    <text
      x="368"
      y="337"
      fontFamily="Verdana, sans-serif"
      fontSize="7"
      fill="white"
      fontWeight="bold"
      textAnchor="end"
    >
      R 142.50
    </text>
    <text
      x="368"
      y="347"
      fontFamily="Verdana, sans-serif"
      fontSize="6"
      fill="#4ade80"
      textAnchor="end"
    >
      INCL. VAT
    </text>

    {/* Insurance ready strip */}
    <rect x="0" y="358" width="260" height="38" fill="#dcfce7" rx="3" />
    <text
      x="10"
      y="372"
      fontFamily="Verdana, sans-serif"
      fontSize="7"
      fill="#15803d"
      fontWeight="bold"
    >
      INSURANCE CLAIM DETAILS
    </text>
    <text
      x="10"
      y="383"
      fontFamily="Verdana, sans-serif"
      fontSize="7"
      fill="#374151"
    >
      Auth No: BN-2026-441892 · Claim: 0099-B
    </text>
    <text
      x="10"
      y="393"
      fontFamily="Verdana, sans-serif"
      fontSize="7"
      fill="#374151"
    >
      Chronic Package · ICD10: E11.9, I10, E78.0
    </text>

    {/* Footer */}
    <rect x="0" y="460" width="400" height="40" fill="#14532d" />
    <text
      x="200"
      y="476"
      fontFamily="Verdana, sans-serif"
      fontSize="7"
      fill="#86efac"
      textAnchor="middle"
    >
      PharmaPlus Dispensing Pharmacy · pharmacy@pharmaplus.co.za
    </text>
    <text
      x="200"
      y="490"
      fontFamily="Verdana, sans-serif"
      fontSize="7"
      fill="#4ade80"
      textAnchor="middle"
    >
      Pharmacist: R. Patel (B.Pharm) · Insp. Auth. G-2201
    </text>
  </svg>
);

// Map template id → preview component
const PREVIEW_COMPONENTS = {
  classic: ClassicMedicalPreview,
  premium: PremiumHealthcarePreview,
  emergency: EmergencyCarePreview,
  wellness: WellnessPreview,
  pharmacy: PharmacyPreview,
};

// ─── Template definitions ────────────────────────────────────────────────────

const TEMPLATES = {
  classic: {
    id: "classic",
    name: "Classic Medical",
    description:
      "Traditional medical invoice with professional 3-column layout",
    price: 0,
    isPremium: false,
    category: "free",
    icon: Cross,
    color: "gray",
    features: [
      "Professional 3-column layout",
      "Patient details section",
      "Services and procedures breakdown",
      "Print optimized for A4",
    ],
    preview:
      "Three neat columns showing patient info, billing details, and medical services with a clean itemized table.",
  },
  premium: {
    id: "premium",
    name: "Premium Healthcare",
    description: "Modern design with elegant branding for private practices",
    price: 299,
    isPremium: true,
    category: "premium",
    icon: Heart,
    color: "purple",
    features: [
      "Elegant design aesthetic",
      "Large branding area",
      "Enhanced color scheme",
      "Premium paper compatible",
    ],
    preview:
      "Sophisticated bordered design with modern fonts and premium purple accents. Perfect for private healthcare practices.",
  },
  emergency: {
    id: "emergency",
    name: "Emergency Care Pro",
    description: "Bold and clear design for urgent care facilities",
    price: 349,
    isPremium: true,
    category: "emergency",
    icon: Activity,
    color: "red",
    features: [
      "High-visibility red design",
      "Emergency-focused layout",
      "Bold typography",
      "Urgent care styling",
    ],
    preview:
      "Dynamic red and white design with clear hierarchy. Ideal for emergency rooms and urgent care centers.",
  },
  wellness: {
    id: "wellness",
    name: "Wellness & Preventive",
    description: "Clean, calming design with blue health accents",
    price: 249,
    isPremium: true,
    category: "wellness",
    icon: Stethoscope,
    color: "blue",
    features: [
      "Calming blue design",
      "Spacious layout",
      "Modern typography",
      "Clean and professional",
    ],
    preview:
      "Contemporary design with soothing blue accents and generous white space. Perfect for wellness centers and preventive care.",
  },
  pharmacy: {
    id: "pharmacy",
    name: "Pharmacy Specialist",
    description: "Organized layout perfect for pharmaceutical services",
    price: 279,
    isPremium: true,
    category: "pharmacy",
    icon: Pill,
    color: "green",
    features: [
      "Pharmaceutical green theme",
      "Detailed medication breakdown",
      "Prescription details section",
      "Insurance-ready format",
    ],
    preview:
      "Clean design with green accents. Optimized for pharmacies and medication dispensing services.",
  },
};

// ─── Main Component ──────────────────────────────────────────────────────────

const Templates = ({ user }) => {
  const [purchasedTemplates, setPurchasedTemplates] = useState(["classic"]);
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

  useEffect(() => {
    loadPurchasedTemplates();
  }, [user]);

  const loadPurchasedTemplates = async () => {
    if (!user?.uid) return;
    try {
      const db = getFirestore();
      const docRef = doc(db, "users", user.uid, "settings", "templates");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setPurchasedTemplates(docSnap.data().purchased || ["classic"]);
      } else {
        await setDoc(docRef, {
          purchased: ["classic"],
          active: "classic",
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
            purchased: ["classic", templateId],
            active: "classic",
            updatedAt: serverTimestamp(),
          });
        }
        setPurchasedTemplates((prev) => [...prev, templateId]);
        alert(
          "✅ Template added successfully!\n\nYou can now select it from the template dropdown when creating job cards.",
        );
      } catch (error) {
        console.error("Error adding template:", error);
        alert("❌ Failed to add template. Please try again.");
      }
      return;
    }
    setShowPayment(templateId);
  };

  const handlePaymentSubmit = async () => {
    if (!user?.uid || !showPayment) return;
    if (
      !cardDetails.cardNumber ||
      !cardDetails.expiryDate ||
      !cardDetails.cvv ||
      !cardDetails.cardName
    ) {
      alert("Please fill in all card details");
      return;
    }
    const cleanCardNumber = cardDetails.cardNumber.replace(/\s/g, "");
    if (cleanCardNumber.length !== 16 || !/^\d+$/.test(cleanCardNumber)) {
      alert("Please enter a valid 16-digit card number");
      return;
    }
    if (!/^\d{2}\/\d{2}$/.test(cardDetails.expiryDate)) {
      alert("Please enter expiry date in MM/YY format");
      return;
    }
    if (cardDetails.cvv.length !== 3 || !/^\d+$/.test(cardDetails.cvv)) {
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
          purchased: ["classic", showPayment],
          active: "classic",
          updatedAt: serverTimestamp(),
        });
      }
      const paymentRef = doc(
        db,
        "users",
        user.uid,
        "payments",
        Date.now().toString(),
      );
      await setDoc(paymentRef, {
        templateId: showPayment,
        templateName: TEMPLATES[showPayment].name,
        amount: TEMPLATES[showPayment].price,
        currency: "USD",
        timestamp: serverTimestamp(),
        status: "completed",
      });
      setPurchasedTemplates((prev) => [...prev, showPayment]);
      setCardDetails({ cardNumber: "", expiryDate: "", cvv: "", cardName: "" });
      setShowPayment(null);
      alert(
        "✅ Payment successful!\n\nYour template has been purchased and is now available.",
      );
    } catch (error) {
      console.error("Error processing payment:", error);
      alert("❌ Payment failed. Please try again.");
    } finally {
      setPaymentProcessing(false);
    }
  };

  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\s/g, "");
    const chunks = cleaned.match(/.{1,4}/g);
    return chunks ? chunks.join(" ") : cleaned;
  };

  const formatExpiryDate = (value) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length >= 2)
      return cleaned.slice(0, 2) + "/" + cleaned.slice(2, 4);
    return cleaned;
  };

  const categories = [
    { id: "all", name: "All Templates" },
    { id: "free", name: "Free" },
    { id: "premium", name: "Premium" },
    { id: "emergency", name: "Emergency" },
    { id: "wellness", name: "Wellness" },
    { id: "pharmacy", name: "Pharmacy" },
  ];

  const filteredTemplates = Object.values(TEMPLATES).filter((template) => {
    if (selectedCategory === "all") return true;
    return template.category === selectedCategory;
  });

  const getColorClasses = (color) => {
    const colors = {
      gray: "from-gray-500 to-gray-600",
      purple: "from-purple-500 to-purple-600",
      red: "from-red-500 to-red-600",
      blue: "from-blue-500 to-blue-600",
      green: "from-green-500 to-green-600",
    };
    return colors[color] || colors.gray;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-gray-300">
      {/* Header */}
     

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-teal-600">
            {purchasedTemplates.length}
          </div>
          <div className="text-sm text-gray-600">Templates Owned</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-cyan-600">
            {Object.keys(TEMPLATES).length}
          </div>
          <div className="text-sm text-gray-600">Total Available</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-green-600">
            R
            {Object.values(TEMPLATES)
              .filter((t) => purchasedTemplates.includes(t.id))
              .reduce((sum, t) => sum + t.price, 0)}
          </div>
          <div className="text-sm text-gray-600">Total Value</div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedCategory === category.id
                ? "bg-teal-600 text-gray-800 shadow-lg scale-105"
                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => {
          const isPurchased = purchasedTemplates.includes(template.id);
          const Icon = template.icon;
          const PreviewComponent = PREVIEW_COMPONENTS[template.id];

          return (
            <div
              key={template.id}
              className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden hover:shadow-2xl hover:border-teal-300 transition-all duration-300 transform hover:-translate-y-1"
            >
              {/* Invoice Preview SVG */}
              <div
                className="relative h-64 bg-gray-50 overflow-hidden group cursor-pointer"
                onClick={() => setShowPreview(template.id)}
              >
                <div className="w-full h-full transform group-hover:scale-105 transition-transform duration-500 origin-top">
                  <PreviewComponent />
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 rounded-full px-4 py-2 flex items-center gap-2 shadow-lg">
                    <Eye className="w-4 h-4 text-teal-600" />
                    <span className="text-sm font-medium text-teal-700">
                      View Full Preview
                    </span>
                  </div>
                </div>

                {/* Badges */}
                {template.isPremium && !isPurchased && (
                  <div className="absolute top-3 right-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-gray-800 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg">
                    <Sparkles className="w-3.5 h-3.5" />
                    Premium
                  </div>
                )}
                {isPurchased && (
                  <div className="absolute top-3 left-3 bg-green-600 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg">
                    <Check className="w-4 h-4" />
                    Owned
                  </div>
                )}
              </div>

              {/* Template Info */}
              <div className="p-5">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="w-5 h-5 text-teal-600" />
                  <h3 className="text-lg font-bold text-gray-900">
                    {template.name}
                  </h3>
                </div>
                <p className="text-sm text-gray-600 mb-4 min-h-[40px]">
                  {template.description}
                </p>

                {/* Features */}
                <div className="mb-4">
                  <div className="text-xs font-semibold text-gray-500 mb-2">
                    FEATURES
                  </div>
                  <ul className="space-y-2">
                    {template.features.map((feature, index) => (
                      <li
                        key={index}
                        className="text-sm text-gray-700 flex items-start gap-2"
                      >
                        <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Price and Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div>
                    {template.isPremium ? (
                      <div>
                        <div className="text-3xl font-bold text-teal-600">
                          R{template.price}
                        </div>
                        <div className="text-xs text-gray-500">one-time</div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-3xl font-bold text-green-600">
                          Free
                        </div>
                        <div className="text-xs text-gray-500">included</div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowPreview(template.id)}
                      className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-100 hover:border-gray-400 flex items-center gap-2 transition-all"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="hidden sm:inline text-sm">Preview</span>
                    </button>

                    {isPurchased ? (
                      <div className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-semibold flex items-center gap-2 border-2 border-green-200">
                        <Check className="w-5 h-5" />
                        <span>Owned</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handlePurchase(template.id)}
                        className="px-4 py-2 bg-gradient-to-r from-teal-600 to-cyan-500 text-gray-800 rounded-lg hover:from-teal-700 hover:to-cyan-600 flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transition-all"
                      >
                        {template.isPremium ? (
                          <>
                            <ShoppingCart className="w-4 h-4" />
                            Buy Now
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
            </div>
          );
        })}
      </div>

      {/* Help Section */}
      <div className="bg-teal-50 border border-teal-200 rounded-lg p-6">
        <h3 className="font-semibold text-teal-900 mb-2 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          How to use your templates
        </h3>
        <ol className="text-sm text-teal-800 space-y-2 list-decimal list-inside">
          <li>
            Purchase a template that matches your medical practice's style
          </li>
          <li>Go to "Create Job Card" from the sidebar menu</li>
          <li>
            Look for the template selector dropdown at the top of the page
          </li>
          <li>Select your purchased template from the dropdown</li>
          <li>Your invoice will automatically use the selected design</li>
        </ol>
      </div>

      {/* Preview Modal */}
      {showPreview &&
        (() => {
          const PreviewComponent = PREVIEW_COMPONENTS[showPreview];
          return (
            <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
              <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                <div className="p-5 border-b flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100">
                  <div className="flex items-center gap-3">
                    {React.createElement(TEMPLATES[showPreview].icon, {
                      className: "w-6 h-6 text-teal-600",
                    })}
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        {TEMPLATES[showPreview].name}
                      </h2>
                      <p className="text-sm text-gray-500">
                        {TEMPLATES[showPreview].description}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPreview(null)}
                    className="text-gray-500 hover:text-gray-700 text-3xl w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <div className="overflow-auto p-6 bg-gray-100 flex gap-6">
                  {/* Large SVG preview */}
                  <div
                    className="flex-1 bg-white rounded-lg shadow-md overflow-hidden"
                    style={{ minWidth: 320, maxWidth: 420 }}
                  >
                    <PreviewComponent />
                  </div>

                  {/* Side info */}
                  <div className="flex-1 flex flex-col gap-4 min-w-0">
                    <div className="bg-white rounded-lg p-5 shadow-sm">
                      <h4 className="font-semibold text-gray-800 mb-3">
                        Template Features
                      </h4>
                      <ul className="space-y-2">
                        {TEMPLATES[showPreview].features.map(
                          (feature, index) => (
                            <li
                              key={index}
                              className="flex items-center gap-2 text-sm text-gray-700"
                            >
                              <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                              {feature}
                            </li>
                          ),
                        )}
                      </ul>
                    </div>

                    <div className="bg-teal-50 rounded-lg p-4 border border-teal-100">
                      <p className="text-sm text-teal-900">
                        <strong>Design Preview:</strong>{" "}
                        {TEMPLATES[showPreview].preview}
                      </p>
                    </div>

                    <div className="bg-white rounded-lg p-5 shadow-sm">
                      {TEMPLATES[showPreview].isPremium ? (
                        <div className="text-center">
                          <div className="text-3xl font-bold text-teal-600 mb-1">
                            R{TEMPLATES[showPreview].price}
                          </div>
                          <div className="text-xs text-gray-500 mb-4">
                            One-time payment · Lifetime access
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <div className="text-3xl font-bold text-green-600 mb-1">
                            Free
                          </div>
                          <div className="text-xs text-gray-500 mb-4">
                            Included with your account
                          </div>
                        </div>
                      )}

                      {purchasedTemplates.includes(showPreview) ? (
                        <div className="w-full px-6 py-3 bg-green-100 text-green-700 rounded-lg font-semibold flex items-center justify-center gap-2 border-2 border-green-200">
                          <Check className="w-5 h-5" />
                          You Own This Template
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setShowPreview(null);
                            handlePurchase(showPreview);
                          }}
                          className="w-full px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-500 text-gray-800 rounded-lg hover:from-teal-700 hover:to-cyan-600 flex items-center justify-center gap-2 font-semibold shadow-lg hover:shadow-xl transition-all"
                        >
                          {TEMPLATES[showPreview].isPremium ? (
                            <>
                              <ShoppingCart className="w-5 h-5" />
                              Purchase for R{TEMPLATES[showPreview].price}
                            </>
                          ) : (
                            <>
                              <Check className="w-5 h-5" />
                              Get Free Template
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
            <div className="p-6 border-b bg-gradient-to-r from-teal-500 to-cyan-500 text-gray-800 rounded-t-xl">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold">Complete Purchase</h2>
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
                  className="text-gray-800 hover:text-gray-200 text-3xl w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors"
                  disabled={paymentProcessing}
                >
                  ✕
                </button>
              </div>
              <div className="flex items-center gap-2 text-teal-50">
                {React.createElement(TEMPLATES[showPayment].icon, {
                  className: "w-5 h-5",
                })}
                <span className="text-sm font-medium">
                  {TEMPLATES[showPayment].name}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 rounded-lg p-4 text-center">
                <div className="text-sm text-gray-600 mb-1">Total Amount</div>
                <div className="text-4xl font-bold text-teal-600">
                  R{TEMPLATES[showPayment].price}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  One-time payment · Lifetime access
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  value={cardDetails.cardName}
                  onChange={(e) =>
                    setCardDetails((prev) => ({
                      ...prev,
                      cardName: e.target.value,
                    }))
                  }
                  placeholder="John Smith"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  disabled={paymentProcessing}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Card Number
                </label>
                <input
                  type="text"
                  value={cardDetails.cardNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\s/g, "");
                    if (value.length <= 16 && /^\d*$/.test(value)) {
                      setCardDetails((prev) => ({
                        ...prev,
                        cardNumber: formatCardNumber(value),
                      }));
                    }
                  }}
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent font-mono"
                  disabled={paymentProcessing}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    value={cardDetails.expiryDate}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      if (value.length <= 4)
                        setCardDetails((prev) => ({
                          ...prev,
                          expiryDate: formatExpiryDate(value),
                        }));
                    }}
                    placeholder="MM/YY"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent font-mono"
                    disabled={paymentProcessing}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CVV
                  </label>
                  <input
                    type="text"
                    value={cardDetails.cvv}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      if (value.length <= 3)
                        setCardDetails((prev) => ({ ...prev, cvv: value }));
                    }}
                    placeholder="123"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent font-mono"
                    disabled={paymentProcessing}
                  />
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-xs text-green-800">
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>Secure Payment:</strong> Your payment information is
                    encrypted and secure. We never store your complete card
                    details.
                  </div>
                </div>
              </div>

              <button
                onClick={handlePaymentSubmit}
                disabled={paymentProcessing}
                className="w-full px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-500 text-gray-800 rounded-lg hover:from-teal-700 hover:to-cyan-600 flex items-center justify-center gap-2 font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {paymentProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    Pay R{TEMPLATES[showPayment].price}
                  </>
                )}
              </button>

              <p className="text-xs text-center text-gray-500">
                By completing this purchase, you agree to our terms and
                conditions
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Templates;
