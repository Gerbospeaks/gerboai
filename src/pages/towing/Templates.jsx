import React, { useState } from 'react';
import { 
  FileText, 
  ShoppingCart, 
  Check, 
  Eye,
  Sparkles,
  Wrench,
  Car,
  Zap,
  Crown,
  Gauge,
  CreditCard,
  Lock
} from 'lucide-react';

// ─── SVG Invoice Previews ────────────────────────────────────────────────────

const ClassicInvoiceSVG = () => (
  <svg viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <rect width="400" height="500" fill="#f8f7f4"/>
    {/* Header bar */}
    <rect width="400" height="70" fill="#374151"/>
    <text x="20" y="30" fontFamily="Georgia,serif" fontSize="15" fontWeight="bold" fill="white">CLASSIC WORKSHOP</text>
    <text x="20" y="50" fontFamily="Georgia,serif" fontSize="9" fill="#9ca3af">AUTO REPAIR &amp; SERVICES</text>
    <text x="320" y="30" fontFamily="Georgia,serif" fontSize="10" fill="#9ca3af">INVOICE</text>
    <text x="305" y="48" fontFamily="Georgia,serif" fontSize="13" fontWeight="bold" fill="white">#2024-0891</text>

    {/* 3-column info row */}
    <rect x="10" y="80" width="118" height="75" rx="2" fill="white" stroke="#e5e7eb" strokeWidth="1"/>
    <text x="20" y="98" fontFamily="Georgia,serif" fontSize="7" fontWeight="bold" fill="#6b7280">CUSTOMER</text>
    <text x="20" y="112" fontFamily="Georgia,serif" fontSize="8" fill="#111827">John Anderson</text>
    <text x="20" y="124" fontFamily="Georgia,serif" fontSize="7" fill="#6b7280">082 555 0123</text>
    <text x="20" y="135" fontFamily="Georgia,serif" fontSize="7" fill="#6b7280">john@email.com</text>
    <text x="20" y="146" fontFamily="Georgia,serif" fontSize="7" fill="#6b7280">14 Oak Street, CPT</text>

    <rect x="141" y="80" width="118" height="75" rx="2" fill="white" stroke="#e5e7eb" strokeWidth="1"/>
    <text x="151" y="98" fontFamily="Georgia,serif" fontSize="7" fontWeight="bold" fill="#6b7280">BILLING</text>
    <text x="151" y="112" fontFamily="Georgia,serif" fontSize="8" fill="#111827">Invoice Date</text>
    <text x="151" y="124" fontFamily="Georgia,serif" fontSize="7" fill="#6b7280">14 Nov 2024</text>
    <text x="151" y="136" fontFamily="Georgia,serif" fontSize="8" fill="#111827">Due Date</text>
    <text x="151" y="148" fontFamily="Georgia,serif" fontSize="7" fill="#6b7280">21 Nov 2024</text>

    <rect x="272" y="80" width="118" height="75" rx="2" fill="white" stroke="#e5e7eb" strokeWidth="1"/>
    <text x="282" y="98" fontFamily="Georgia,serif" fontSize="7" fontWeight="bold" fill="#6b7280">VEHICLE</text>
    <text x="282" y="112" fontFamily="Georgia,serif" fontSize="8" fill="#111827">2019 Toyota Camry</text>
    <text x="282" y="124" fontFamily="Georgia,serif" fontSize="7" fill="#6b7280">Reg: CA 123-456</text>
    <text x="282" y="136" fontFamily="Georgia,serif" fontSize="7" fill="#6b7280">VIN: 4T1B11HK0KU</text>
    <text x="282" y="148" fontFamily="Georgia,serif" fontSize="7" fill="#6b7280">ODO: 87,420 km</text>

    {/* Table header */}
    <rect x="10" y="168" width="380" height="22" fill="#374151"/>
    <text x="18" y="183" fontFamily="Georgia,serif" fontSize="8" fontWeight="bold" fill="white">DESCRIPTION</text>
    <text x="220" y="183" fontFamily="Georgia,serif" fontSize="8" fontWeight="bold" fill="white">QTY</text>
    <text x="265" y="183" fontFamily="Georgia,serif" fontSize="8" fontWeight="bold" fill="white">UNIT</text>
    <text x="330" y="183" fontFamily="Georgia,serif" fontSize="8" fontWeight="bold" fill="white">TOTAL</text>

    {/* Table rows */}
    {[
      ["Oil & Filter Change (Full Synthetic)", "1", "R 850", "R 850"],
      ["Brake Pads - Front Axle Set", "1", "R 1,200", "R 1,200"],
      ["Brake Fluid Flush", "1", "R 450", "R 450"],
      ["Tyre Rotation & Balance (4)", "4", "R 120", "R 480"],
      ["Labour - General Service", "2h", "R 350", "R 700"],
    ].map(([desc, qty, unit, total], i) => (
      <g key={i}>
        <rect x="10" y={194 + i * 26} width="380" height="26" fill={i % 2 === 0 ? "white" : "#f9fafb"} stroke="#f3f4f6" strokeWidth="0.5"/>
        <text x="18" y={211 + i * 26} fontFamily="Georgia,serif" fontSize="8" fill="#111827">{desc}</text>
        <text x="225" y={211 + i * 26} fontFamily="Georgia,serif" fontSize="8" fill="#374151">{qty}</text>
        <text x="258" y={211 + i * 26} fontFamily="Georgia,serif" fontSize="8" fill="#374151">{unit}</text>
        <text x="328" y={211 + i * 26} fontFamily="Georgia,serif" fontSize="8" fontWeight="bold" fill="#111827">{total}</text>
      </g>
    ))}

    {/* Totals */}
    <line x1="240" y1="330" x2="390" y2="330" stroke="#e5e7eb" strokeWidth="1"/>
    <text x="250" y="346" fontFamily="Georgia,serif" fontSize="8" fill="#6b7280">Subtotal</text>
    <text x="340" y="346" fontFamily="Georgia,serif" fontSize="8" fill="#374151">R 3,680</text>
    <text x="250" y="362" fontFamily="Georgia,serif" fontSize="8" fill="#6b7280">VAT (15%)</text>
    <text x="340" y="362" fontFamily="Georgia,serif" fontSize="8" fill="#374151">R 552</text>
    <rect x="240" y="370" width="150" height="28" fill="#374151" rx="2"/>
    <text x="250" y="389" fontFamily="Georgia,serif" fontSize="9" fontWeight="bold" fill="white">TOTAL DUE</text>
    <text x="320" y="389" fontFamily="Georgia,serif" fontSize="10" fontWeight="bold" fill="white">R 4,232</text>

    {/* Footer note */}
    <line x1="10" y1="415" x2="390" y2="415" stroke="#e5e7eb" strokeWidth="1"/>
    <text x="18" y="430" fontFamily="Georgia,serif" fontSize="7" fill="#9ca3af">Payment due within 7 days. EFT: Classic Workshop | FNB | Acc: 62812345678 | Branch: 250655</text>
    <text x="18" y="445" fontFamily="Georgia,serif" fontSize="7" fill="#9ca3af">Workshop: 021 555 0100 | www.classicworkshop.co.za | Reg No: 2018/123456/07</text>

    {/* Stamp */}
    <circle cx="340" cy="445" r="28" fill="none" stroke="#d1fae5" strokeWidth="2"/>
    <circle cx="340" cy="445" r="24" fill="none" stroke="#d1fae5" strokeWidth="1"/>
    <text x="340" y="440" fontFamily="Georgia,serif" fontSize="7" fontWeight="bold" fill="#059669" textAnchor="middle">PAID</text>
    <text x="340" y="452" fontFamily="Georgia,serif" fontSize="6" fill="#059669" textAnchor="middle">14/11/2024</text>
  </svg>
);

const PremiumInvoiceSVG = () => (
  <svg viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <rect width="400" height="500" fill="#faf9ff"/>
    {/* Elegant border frame */}
    <rect x="8" y="8" width="384" height="484" fill="none" stroke="#7c3aed" strokeWidth="2"/>
    <rect x="12" y="12" width="376" height="476" fill="none" stroke="#c4b5fd" strokeWidth="0.5"/>

    {/* Top gold accent bar */}
    <rect x="8" y="8" width="384" height="52" fill="#4c1d95"/>
    <rect x="8" y="55" width="384" height="4" fill="#7c3aed"/>

    <text x="200" y="32" fontFamily="Palatino,Georgia,serif" fontSize="14" fontWeight="bold" fill="#e9d5ff" textAnchor="middle" letterSpacing="4">PREMIUM AUTO SERVICE</text>
    <text x="200" y="50" fontFamily="Palatino,Georgia,serif" fontSize="7" fill="#a78bfa" textAnchor="middle" letterSpacing="6">LUXURY VEHICLE SPECIALISTS</text>

    {/* Invoice badge */}
    <rect x="290" y="72" width="95" height="40" rx="3" fill="#f5f3ff" stroke="#7c3aed" strokeWidth="1.5"/>
    <text x="338" y="87" fontFamily="Palatino,Georgia,serif" fontSize="7" fill="#6d28d9" textAnchor="middle" letterSpacing="2">INVOICE</text>
    <text x="338" y="103" fontFamily="Palatino,Georgia,serif" fontSize="10" fontWeight="bold" fill="#4c1d95" textAnchor="middle">#PAS-2409</text>

    {/* Client details */}
    <text x="20" y="88" fontFamily="Palatino,Georgia,serif" fontSize="7" fill="#8b5cf6" letterSpacing="2">BILLED TO</text>
    <text x="20" y="102" fontFamily="Palatino,Georgia,serif" fontSize="10" fontWeight="bold" fill="#1f1b2e">Ms. Victoria Hartmann</text>
    <text x="20" y="115" fontFamily="Palatino,Georgia,serif" fontSize="8" fill="#6b7280">082 900 1122 · victoria@hartmann.co.za</text>

    {/* Divider with ornament */}
    <line x1="20" y1="128" x2="380" y2="128" stroke="#c4b5fd" strokeWidth="0.8"/>
    <text x="200" y="133" fontFamily="serif" fontSize="10" fill="#a78bfa" textAnchor="middle">◆</text>

    {/* Vehicle & Service info */}
    <rect x="20" y="138" width="170" height="55" rx="4" fill="#f5f3ff" stroke="#ddd6fe" strokeWidth="1"/>
    <text x="30" y="154" fontFamily="Palatino,Georgia,serif" fontSize="7" fill="#8b5cf6" letterSpacing="2">VEHICLE</text>
    <text x="30" y="168" fontFamily="Palatino,Georgia,serif" fontSize="9" fontWeight="bold" fill="#1f1b2e">2023 Mercedes-Benz E300</text>
    <text x="30" y="181" fontFamily="Palatino,Georgia,serif" fontSize="7" fill="#6b7280">GP · WMY · 2023 · Odo: 12,840 km</text>

    <rect x="205" y="138" width="175" height="55" rx="4" fill="#f5f3ff" stroke="#ddd6fe" strokeWidth="1"/>
    <text x="215" y="154" fontFamily="Palatino,Georgia,serif" fontSize="7" fill="#8b5cf6" letterSpacing="2">SERVICE DATE</text>
    <text x="215" y="168" fontFamily="Palatino,Georgia,serif" fontSize="9" fontWeight="bold" fill="#1f1b2e">14 November 2024</text>
    <text x="215" y="181" fontFamily="Palatino,Georgia,serif" fontSize="7" fill="#6b7280">Consultant: James Whitfield</text>

    {/* Table */}
    <rect x="20" y="204" width="360" height="18" fill="#4c1d95" rx="2"/>
    <text x="28" y="216" fontFamily="Palatino,Georgia,serif" fontSize="7.5" fill="#e9d5ff" letterSpacing="1">SERVICE / PARTS DESCRIPTION</text>
    <text x="262" y="216" fontFamily="Palatino,Georgia,serif" fontSize="7.5" fill="#e9d5ff">QTY</text>
    <text x="300" y="216" fontFamily="Palatino,Georgia,serif" fontSize="7.5" fill="#e9d5ff">RATE</text>
    <text x="348" y="216" fontFamily="Palatino,Georgia,serif" fontSize="7.5" fill="#e9d5ff">AMOUNT</text>

    {[
      ["Mercedes-Benz Genuine Engine Oil 5W-40 (7L)", "7L", "R 180", "R 1,260"],
      ["OEM Oil Filter — MB Part #A2711800109", "1", "R 620", "R 620"],
      ["AMG Brake Disc Set — Front Pair", "2", "R 3,800", "R 7,600"],
      ["Brembo Performance Brake Pads", "1", "R 2,100", "R 2,100"],
      ["Master Technician Labour (3.5 hrs)", "3.5h", "R 850", "R 2,975"],
    ].map(([desc, qty, rate, amt], i) => (
      <g key={i}>
        <rect x="20" y={226 + i * 24} width="360" height="24" fill={i % 2 === 0 ? "white" : "#faf8ff"} stroke="#ede9fe" strokeWidth="0.5"/>
        <text x="28" y={242 + i * 24} fontFamily="Palatino,Georgia,serif" fontSize="7.5" fill="#1f1b2e">{desc}</text>
        <text x="265" y={242 + i * 24} fontFamily="Palatino,Georgia,serif" fontSize="7.5" fill="#374151">{qty}</text>
        <text x="298" y={242 + i * 24} fontFamily="Palatino,Georgia,serif" fontSize="7.5" fill="#374151">{rate}</text>
        <text x="346" y={242 + i * 24} fontFamily="Palatino,Georgia,serif" fontSize="7.5" fontWeight="bold" fill="#4c1d95">{amt}</text>
      </g>
    ))}

    {/* Totals */}
    <rect x="240" y="352" width="140" height="70" rx="3" fill="#f5f3ff" stroke="#ddd6fe" strokeWidth="1"/>
    <text x="252" y="370" fontFamily="Palatino,Georgia,serif" fontSize="7.5" fill="#6b7280">Subtotal</text>
    <text x="352" y="370" fontFamily="Palatino,Georgia,serif" fontSize="7.5" fill="#374151" textAnchor="end">R 14,555</text>
    <text x="252" y="387" fontFamily="Palatino,Georgia,serif" fontSize="7.5" fill="#6b7280">VAT (15%)</text>
    <text x="352" y="387" fontFamily="Palatino,Georgia,serif" fontSize="7.5" fill="#374151" textAnchor="end">R 2,183</text>
    <line x1="252" y1="396" x2="368" y2="396" stroke="#c4b5fd" strokeWidth="0.8"/>
    <text x="252" y="411" fontFamily="Palatino,Georgia,serif" fontSize="9" fontWeight="bold" fill="#4c1d95">TOTAL</text>
    <text x="370" y="411" fontFamily="Palatino,Georgia,serif" fontSize="11" fontWeight="bold" fill="#4c1d95" textAnchor="end">R 16,738</text>

    {/* Notes */}
    <text x="20" y="368" fontFamily="Palatino,Georgia,serif" fontSize="7" fill="#8b5cf6" letterSpacing="1">NOTES</text>
    <text x="20" y="381" fontFamily="Palatino,Georgia,serif" fontSize="7" fill="#6b7280">Next service due at 22,840 km or</text>
    <text x="20" y="393" fontFamily="Palatino,Georgia,serif" fontSize="7" fill="#6b7280">12 months — whichever comes first.</text>
    <text x="20" y="405" fontFamily="Palatino,Georgia,serif" fontSize="7" fill="#6b7280">All parts carry 12-month warranty.</text>

    {/* Footer */}
    <rect x="8" y="445" width="384" height="47" fill="#4c1d95"/>
    <text x="200" y="463" fontFamily="Palatino,Georgia,serif" fontSize="7" fill="#a78bfa" textAnchor="middle">Premium Auto Service · 4 Sandton Drive, Johannesburg · 011 555 0800</text>
    <text x="200" y="477" fontFamily="Palatino,Georgia,serif" fontSize="7" fill="#7c3aed" textAnchor="middle">info@premiumauto.co.za · www.premiumauto.co.za · VAT: 4123456789</text>
  </svg>
);

const SpeedShopInvoiceSVG = () => (
  <svg viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <rect width="400" height="500" fill="#0f0f0f"/>
    {/* Diagonal red slash accent */}
    <polygon points="0,0 180,0 120,70 0,70" fill="#dc2626"/>
    <polygon points="380,0 400,0 400,70 320,70" fill="#991b1b"/>

    {/* Shop name */}
    <text x="18" y="28" fontFamily="'Arial Black',Impact,sans-serif" fontSize="16" fontWeight="900" fill="white" letterSpacing="1">SPEED</text>
    <text x="18" y="50" fontFamily="'Arial Black',Impact,sans-serif" fontSize="16" fontWeight="900" fill="#ef4444" letterSpacing="1">SHOP PRO</text>
    <text x="330" y="30" fontFamily="'Arial Black',Impact,sans-serif" fontSize="8" fill="#9ca3af" letterSpacing="3">INVOICE</text>
    <text x="310" y="52" fontFamily="'Arial Black',Impact,sans-serif" fontSize="12" fontWeight="bold" fill="white">#SSP-0347</text>

    {/* Red accent line */}
    <rect x="0" y="70" width="400" height="3" fill="#dc2626"/>
    <rect x="0" y="73" width="400" height="1" fill="#7f1d1d"/>

    {/* Client / vehicle strips */}
    <rect x="0" y="82" width="400" height="28" fill="#1a1a1a"/>
    <rect x="0" y="82" width="3" height="28" fill="#dc2626"/>
    <text x="14" y="94" fontFamily="'Arial Black',sans-serif" fontSize="7" fill="#9ca3af" letterSpacing="2">CLIENT</text>
    <text x="14" y="106" fontFamily="'Arial Black',sans-serif" fontSize="9" fontWeight="bold" fill="white">Ryan "Boost" Pietersen</text>
    <text x="180" y="94" fontFamily="'Arial Black',sans-serif" fontSize="7" fill="#9ca3af" letterSpacing="2">DATE</text>
    <text x="180" y="106" fontFamily="'Arial Black',sans-serif" fontSize="9" fontWeight="bold" fill="white">14 NOV 2024</text>
    <text x="300" y="94" fontFamily="'Arial Black',sans-serif" fontSize="7" fill="#9ca3af" letterSpacing="2">JOB</text>
    <text x="300" y="106" fontFamily="'Arial Black',sans-serif" fontSize="9" fontWeight="bold" fill="#ef4444">STAGE 2 TUNE</text>

    <rect x="0" y="114" width="400" height="28" fill="#141414"/>
    <rect x="0" y="114" width="3" height="28" fill="#7f1d1d"/>
    <text x="14" y="126" fontFamily="'Arial Black',sans-serif" fontSize="7" fill="#9ca3af" letterSpacing="2">VEHICLE</text>
    <text x="14" y="138" fontFamily="'Arial Black',sans-serif" fontSize="9" fontWeight="bold" fill="white">2020 VW Golf 7.5 GTI  ·  GP: BT20 KGTF</text>
    <text x="300" y="126" fontFamily="'Arial Black',sans-serif" fontSize="7" fill="#9ca3af" letterSpacing="2">MILEAGE</text>
    <text x="300" y="138" fontFamily="'Arial Black',sans-serif" fontSize="9" fontWeight="bold" fill="white">44,200 km</text>

    {/* Table header */}
    <rect x="0" y="150" width="400" height="20" fill="#dc2626"/>
    <text x="14" y="163" fontFamily="'Arial Black',sans-serif" fontSize="8" fill="white" letterSpacing="1">WORK ORDER</text>
    <text x="265" y="163" fontFamily="'Arial Black',sans-serif" fontSize="8" fill="white">QTY</text>
    <text x="310" y="163" fontFamily="'Arial Black',sans-serif" fontSize="8" fill="white">PRICE</text>
    <text x="355" y="163" fontFamily="'Arial Black',sans-serif" fontSize="8" fill="white">TOTAL</text>

    {[
      ["ECU Remap — Stage 2 (APR)", "1", "R 6,500", "R 6,500"],
      ["Forge Motorsport DVR Valve", "1", "R 2,800", "R 2,800"],
      ["Forge Intercooler Pipe Kit", "1", "R 1,950", "R 1,950"],
      ["K&N High-Flow Air Filter", "1", "R 1,200", "R 1,200"],
      ["Dyno Run — Pre & Post Tune", "2", "R 800", "R 1,600"],
      ["Performance Labour (5 hrs)", "5h", "R 550", "R 2,750"],
    ].map(([desc, qty, price, total], i) => (
      <g key={i}>
        <rect x="0" y={174 + i * 24} width="400" height="24" fill={i % 2 === 0 ? "#1a1a1a" : "#141414"}/>
        <rect x="0" y={174 + i * 24} width="2" height="24" fill={i % 2 === 0 ? "#374151" : "#1f2937"}/>
        <text x="14" y={190 + i * 24} fontFamily="'Arial',sans-serif" fontSize="8" fill="#d1d5db">{desc}</text>
        <text x="268" y={190 + i * 24} fontFamily="'Arial',sans-serif" fontSize="8" fill="#9ca3af">{qty}</text>
        <text x="305" y={190 + i * 24} fontFamily="'Arial',sans-serif" fontSize="8" fill="#9ca3af">{price}</text>
        <text x="353" y={190 + i * 24} fontFamily="'Arial Black',sans-serif" fontSize="8" fontWeight="bold" fill="#ef4444">{total}</text>
      </g>
    ))}

    {/* Totals */}
    <rect x="240" y="322" width="160" height="80" fill="#1a1a1a" stroke="#dc2626" strokeWidth="1"/>
    <rect x="240" y="322" width="4" height="80" fill="#dc2626"/>
    <text x="254" y="340" fontFamily="'Arial',sans-serif" fontSize="8" fill="#9ca3af">Subtotal</text>
    <text x="390" y="340" fontFamily="'Arial',sans-serif" fontSize="8" fill="#d1d5db" textAnchor="end">R 16,800</text>
    <text x="254" y="356" fontFamily="'Arial',sans-serif" fontSize="8" fill="#9ca3af">VAT (15%)</text>
    <text x="390" y="356" fontFamily="'Arial',sans-serif" fontSize="8" fill="#d1d5db" textAnchor="end">R 2,520</text>
    <line x1="254" y1="365" x2="390" y2="365" stroke="#374151" strokeWidth="0.8"/>
    <text x="254" y="380" fontFamily="'Arial Black',sans-serif" fontSize="9" fontWeight="bold" fill="white">DUE</text>
    <text x="390" y="382" fontFamily="'Arial Black',sans-serif" fontSize="13" fontWeight="bold" fill="#ef4444" textAnchor="end">R 19,320</text>
    <text x="254" y="396" fontFamily="'Arial',sans-serif" fontSize="7" fill="#6b7280">Before HP Gains 🔥</text>

    {/* Power gains callout */}
    <rect x="0" y="322" width="232" height="50" fill="#1a1a1a"/>
    <rect x="0" y="322" width="232" height="3" fill="#dc2626"/>
    <text x="14" y="338" fontFamily="'Arial Black',sans-serif" fontSize="7" fill="#ef4444" letterSpacing="2">POWER GAINS</text>
    <text x="14" y="354" fontFamily="'Arial',sans-serif" fontSize="8" fill="#9ca3af">Stock: 180 kW / 350 Nm</text>
    <text x="14" y="367" fontFamily="'Arial',sans-serif" fontSize="8" fill="#d1d5db">Tuned: <tspan fill="#ef4444" fontWeight="bold">240 kW / 480 Nm</tspan>  ⚡ +60 kW</text>

    {/* Notes */}
    <rect x="0" y="376" width="232" height="40" fill="#141414"/>
    <text x="14" y="391" fontFamily="'Arial',sans-serif" fontSize="7" fill="#6b7280">Map covered under 12-month warranty.</text>
    <text x="14" y="404" fontFamily="'Arial',sans-serif" fontSize="7" fill="#6b7280">Use 98-octane fuel only. Book follow-up at 50k km.</text>

    {/* Footer */}
    <rect x="0" y="420" width="400" height="80" fill="#0a0a0a"/>
    <rect x="0" y="420" width="400" height="2" fill="#dc2626"/>
    <text x="14" y="438" fontFamily="'Arial Black',sans-serif" fontSize="8" fill="#9ca3af" letterSpacing="1">SPEED SHOP PRO</text>
    <text x="14" y="452" fontFamily="'Arial',sans-serif" fontSize="7" fill="#6b7280">Unit 5, Industrial Park, Kempton Park  ·  060 555 0200</text>
    <text x="14" y="464" fontFamily="'Arial',sans-serif" fontSize="7" fill="#6b7280">info@speedshoppro.co.za  ·  @SpeedShopPro</text>
    {/* Checkered flag motif */}
    {Array.from({ length: 8 }).map((_, i) =>
      Array.from({ length: 4 }).map((_, j) => (
        <rect key={`${i}-${j}`} x={300 + i * 10} y={430 + j * 10} width="10" height="10"
          fill={(i + j) % 2 === 0 ? "#1f2937" : "#374151"} />
      ))
    )}
  </svg>
);

const ModernInvoiceSVG = () => (
  <svg viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <rect width="400" height="500" fill="#f8faff"/>
    {/* Sidebar accent */}
    <rect x="0" y="0" width="6" height="500" fill="#2563eb"/>

    {/* Header */}
    <rect x="0" y="0" width="400" height="75" fill="white"/>
    <rect x="0" y="74" width="400" height="1" fill="#e0e7ff"/>
    <text x="24" y="30" fontFamily="'Trebuchet MS',sans-serif" fontSize="16" fontWeight="bold" fill="#1e40af" letterSpacing="1">MODERN AUTO</text>
    <text x="24" y="48" fontFamily="'Trebuchet MS',sans-serif" fontSize="8" fill="#93c5fd" letterSpacing="3">SERVICE CENTRE</text>
    <text x="24" y="63" fontFamily="'Trebuchet MS',sans-serif" fontSize="7" fill="#cbd5e1">031 555 0300 · service@modernauto.co.za</text>

    {/* Invoice badge top-right */}
    <rect x="285" y="14" width="100" height="46" rx="6" fill="#eff6ff" stroke="#bfdbfe" strokeWidth="1.5"/>
    <text x="335" y="32" fontFamily="'Trebuchet MS',sans-serif" fontSize="8" fill="#3b82f6" textAnchor="middle" letterSpacing="2">INVOICE</text>
    <text x="335" y="50" fontFamily="'Trebuchet MS',sans-serif" fontSize="11" fontWeight="bold" fill="#1e40af" textAnchor="middle">#MA-1147</text>

    {/* Info cards */}
    <rect x="18" y="88" width="115" height="72" rx="6" fill="white" stroke="#bfdbfe" strokeWidth="1.5"/>
    <rect x="18" y="88" width="115" height="6" rx="3" fill="#3b82f6"/>
    <text x="28" y="108" fontFamily="'Trebuchet MS',sans-serif" fontSize="7" fill="#6b7280" letterSpacing="1">BILL TO</text>
    <text x="28" y="121" fontFamily="'Trebuchet MS',sans-serif" fontSize="8.5" fontWeight="bold" fill="#1e3a5f">Sarah Dlamini</text>
    <text x="28" y="133" fontFamily="'Trebuchet MS',sans-serif" fontSize="7" fill="#6b7280">071 234 5678</text>
    <text x="28" y="145" fontFamily="'Trebuchet MS',sans-serif" fontSize="7" fill="#6b7280">sarah@email.co.za</text>
    <text x="28" y="154" fontFamily="'Trebuchet MS',sans-serif" fontSize="7" fill="#6b7280">22 Berea Rd, Durban</text>

    <rect x="143" y="88" width="115" height="72" rx="6" fill="white" stroke="#bfdbfe" strokeWidth="1.5"/>
    <rect x="143" y="88" width="115" height="6" rx="3" fill="#3b82f6"/>
    <text x="153" y="108" fontFamily="'Trebuchet MS',sans-serif" fontSize="7" fill="#6b7280" letterSpacing="1">VEHICLE</text>
    <text x="153" y="121" fontFamily="'Trebuchet MS',sans-serif" fontSize="8.5" fontWeight="bold" fill="#1e3a5f">2021 Honda Civic</text>
    <text x="153" y="133" fontFamily="'Trebuchet MS',sans-serif" fontSize="7" fill="#6b7280">KZN: KZN 456 GP</text>
    <text x="153" y="145" fontFamily="'Trebuchet MS',sans-serif" fontSize="7" fill="#6b7280">VIN: 2HGFC2F52M</text>
    <text x="153" y="157" fontFamily="'Trebuchet MS',sans-serif" fontSize="7" fill="#6b7280">Odo: 31,000 km</text>

    <rect x="268" y="88" width="114" height="72" rx="6" fill="white" stroke="#bfdbfe" strokeWidth="1.5"/>
    <rect x="268" y="88" width="114" height="6" rx="3" fill="#3b82f6"/>
    <text x="278" y="108" fontFamily="'Trebuchet MS',sans-serif" fontSize="7" fill="#6b7280" letterSpacing="1">DATE &amp; STATUS</text>
    <text x="278" y="121" fontFamily="'Trebuchet MS',sans-serif" fontSize="8.5" fontWeight="bold" fill="#1e3a5f">14 Nov 2024</text>
    <text x="278" y="133" fontFamily="'Trebuchet MS',sans-serif" fontSize="7" fill="#6b7280">Due: 21 Nov 2024</text>
    <rect x="278" y="141" width="55" height="14" rx="7" fill="#dcfce7"/>
    <text x="305" y="152" fontFamily="'Trebuchet MS',sans-serif" fontSize="7" fill="#16a34a" textAnchor="middle" fontWeight="bold">PAID ✓</text>

    {/* Table */}
    <rect x="18" y="172" width="364" height="20" rx="4" fill="#2563eb"/>
    <text x="28" y="185" fontFamily="'Trebuchet MS',sans-serif" fontSize="7.5" fill="white" letterSpacing="1">DESCRIPTION</text>
    <text x="250" y="185" fontFamily="'Trebuchet MS',sans-serif" fontSize="7.5" fill="#bfdbfe">QTY</text>
    <text x="295" y="185" fontFamily="'Trebuchet MS',sans-serif" fontSize="7.5" fill="#bfdbfe">RATE</text>
    <text x="350" y="185" fontFamily="'Trebuchet MS',sans-serif" fontSize="7.5" fill="white">TOTAL</text>

    {[
      ["30,000 km Major Service", "1", "R 2,400", "R 2,400"],
      ["Honda Genuine Oil Filter", "1", "R 380", "R 380"],
      ["Air Filter Replacement", "1", "R 520", "R 520"],
      ["Spark Plugs — NGK Iridium (4)", "4", "R 280", "R 1,120"],
      ["Wiper Blades — Front Pair", "2", "R 190", "R 380"],
      ["Wheel Alignment & Balance", "1", "R 650", "R 650"],
    ].map(([desc, qty, rate, total], i) => (
      <g key={i}>
        <rect x="18" y={196 + i * 24} width="364" height="24" rx={i === 5 ? "4" : "0"}
          fill={i % 2 === 0 ? "white" : "#f0f7ff"} stroke="#e0e7ff" strokeWidth="0.5"/>
        <text x="28" y={212 + i * 24} fontFamily="'Trebuchet MS',sans-serif" fontSize="7.5" fill="#1e3a5f">{desc}</text>
        <text x="254" y={212 + i * 24} fontFamily="'Trebuchet MS',sans-serif" fontSize="7.5" fill="#6b7280">{qty}</text>
        <text x="292" y={212 + i * 24} fontFamily="'Trebuchet MS',sans-serif" fontSize="7.5" fill="#6b7280">{rate}</text>
        <text x="348" y={212 + i * 24} fontFamily="'Trebuchet MS',sans-serif" fontSize="8" fontWeight="bold" fill="#2563eb">{total}</text>
      </g>
    ))}

    {/* Totals */}
    <rect x="248" y="348" width="134" height="78" rx="6" fill="#eff6ff" stroke="#bfdbfe" strokeWidth="1.5"/>
    <text x="258" y="366" fontFamily="'Trebuchet MS',sans-serif" fontSize="8" fill="#6b7280">Subtotal</text>
    <text x="374" y="366" fontFamily="'Trebuchet MS',sans-serif" fontSize="8" fill="#374151" textAnchor="end">R 5,450</text>
    <text x="258" y="382" fontFamily="'Trebuchet MS',sans-serif" fontSize="8" fill="#6b7280">VAT (15%)</text>
    <text x="374" y="382" fontFamily="'Trebuchet MS',sans-serif" fontSize="8" fill="#374151" textAnchor="end">R 817</text>
    <line x1="258" y1="391" x2="374" y2="391" stroke="#bfdbfe" strokeWidth="1"/>
    <text x="258" y="408" fontFamily="'Trebuchet MS',sans-serif" fontSize="9" fontWeight="bold" fill="#1e40af">TOTAL</text>
    <text x="374" y="410" fontFamily="'Trebuchet MS',sans-serif" fontSize="12" fontWeight="bold" fill="#2563eb" textAnchor="end">R 6,267</text>
    <text x="258" y="420" fontFamily="'Trebuchet MS',sans-serif" fontSize="7" fill="#93c5fd">EFT · 30-day credit available</text>

    {/* Notes */}
    <rect x="18" y="348" width="220" height="78" rx="6" fill="white" stroke="#e0e7ff" strokeWidth="1"/>
    <text x="28" y="366" fontFamily="'Trebuchet MS',sans-serif" fontSize="7" fill="#3b82f6" letterSpacing="1">TECHNICIAN NOTES</text>
    <text x="28" y="380" fontFamily="'Trebuchet MS',sans-serif" fontSize="7.5" fill="#374151">All fluids checked and topped up.</text>
    <text x="28" y="393" fontFamily="'Trebuchet MS',sans-serif" fontSize="7.5" fill="#374151">Battery: 12.6V — good condition.</text>
    <text x="28" y="406" fontFamily="'Trebuchet MS',sans-serif" fontSize="7.5" fill="#374151">Next service: 60,000 km / Nov 2025</text>

    {/* Footer */}
    <rect x="0" y="440" width="400" height="60" fill="white"/>
    <rect x="0" y="440" width="400" height="1" fill="#e0e7ff"/>
    <rect x="0" y="440" width="6" height="60" fill="#2563eb"/>
    <text x="24" y="459" fontFamily="'Trebuchet MS',sans-serif" fontSize="7" fill="#6b7280">Modern Auto Service Centre · 88 Smith St, Durban · 031 555 0300</text>
    <text x="24" y="472" fontFamily="'Trebuchet MS',sans-serif" fontSize="7" fill="#6b7280">service@modernauto.co.za · www.modernauto.co.za · VAT No: 4987654321</text>
    <text x="24" y="488" fontFamily="'Trebuchet MS',sans-serif" fontSize="7" fill="#bfdbfe">Thank you for choosing Modern Auto Service Centre.</text>
  </svg>
);

const DiagnosticInvoiceSVG = () => (
  <svg viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <rect width="400" height="500" fill="#f0fdf4"/>
    {/* Top band */}
    <rect x="0" y="0" width="400" height="64" fill="#14532d"/>
    <rect x="0" y="64" width="400" height="4" fill="#16a34a"/>

    {/* Grid texture overlay */}
    {Array.from({ length: 20 }).map((_, i) => (
      <line key={`h${i}`} x1="0" y1={i * 26} x2="400" y2={i * 26} stroke="#f0fdf4" strokeWidth="0.15" opacity="0.3"/>
    ))}
    {Array.from({ length: 16 }).map((_, i) => (
      <line key={`v${i}`} x1={i * 26} y1="0" x2={i * 26} y2="500" stroke="#f0fdf4" strokeWidth="0.15" opacity="0.3"/>
    ))}

    <text x="18" y="26" fontFamily="'Courier New',monospace" fontSize="13" fontWeight="bold" fill="#86efac" letterSpacing="2">DIAGNOSTIC SPECIALIST</text>
    <text x="18" y="46" fontFamily="'Courier New',monospace" fontSize="7" fill="#4ade80" letterSpacing="3">ADVANCED VEHICLE DIAGNOSTICS</text>

    {/* OBD icon */}
    <rect x="310" y="10" width="72" height="44" rx="4" fill="#166534" stroke="#22c55e" strokeWidth="1"/>
    <text x="346" y="27" fontFamily="'Courier New',monospace" fontSize="7" fill="#86efac" textAnchor="middle">OBD-II</text>
    <text x="346" y="41" fontFamily="'Courier New',monospace" fontSize="8" fontWeight="bold" fill="white" textAnchor="middle">SCAN</text>

    {/* Report header */}
    <rect x="10" y="76" width="380" height="26" fill="white" stroke="#bbf7d0" strokeWidth="1" rx="2"/>
    <text x="20" y="88" fontFamily="'Courier New',monospace" fontSize="7" fill="#166534" letterSpacing="2">DIAGNOSTIC REPORT</text>
    <text x="20" y="98" fontFamily="'Courier New',monospace" fontSize="7" fill="#6b7280">Invoice: #DS-4821  ·  Date: 14 Nov 2024  ·  Tech: N. Botha  ·  Bay: 03</text>
    <rect x="320" y="79" width="64" height="20" rx="3" fill="#dcfce7" stroke="#86efac" strokeWidth="1"/>
    <text x="352" y="93" fontFamily="'Courier New',monospace" fontSize="8" fontWeight="bold" fill="#14532d" textAnchor="middle">COMPLETE</text>

    {/* Vehicle / customer row */}
    <rect x="10" y="108" width="186" height="60" rx="3" fill="white" stroke="#bbf7d0" strokeWidth="1"/>
    <text x="20" y="122" fontFamily="'Courier New',monospace" fontSize="6.5" fill="#16a34a" letterSpacing="2">VEHICLE</text>
    <text x="20" y="135" fontFamily="'Courier New',monospace" fontSize="8.5" fontWeight="bold" fill="#111827">2017 Ford Ranger 2.2L</text>
    <text x="20" y="148" fontFamily="'Courier New',monospace" fontSize="7" fill="#6b7280">Reg: GP · HJK 456 · Odo: 142,800 km</text>
    <text x="20" y="160" fontFamily="'Courier New',monospace" fontSize="7" fill="#6b7280">VIN: WF0FXXGBWFKL12345</text>

    <rect x="204" y="108" width="186" height="60" rx="3" fill="white" stroke="#bbf7d0" strokeWidth="1"/>
    <text x="214" y="122" fontFamily="'Courier New',monospace" fontSize="6.5" fill="#16a34a" letterSpacing="2">CUSTOMER</text>
    <text x="214" y="135" fontFamily="'Courier New',monospace" fontSize="8.5" fontWeight="bold" fill="#111827">David van der Berg</text>
    <text x="214" y="148" fontFamily="'Courier New',monospace" fontSize="7" fill="#6b7280">083 777 0055  ·  david@email.co.za</text>
    <text x="214" y="160" fontFamily="'Courier New',monospace" fontSize="7" fill="#6b7280">14 Jacaranda St, Pretoria East</text>

    {/* Fault codes section */}
    <rect x="10" y="176" width="380" height="20" rx="2" fill="#166534"/>
    <text x="18" y="189" fontFamily="'Courier New',monospace" fontSize="8" fill="#86efac" letterSpacing="2">FAULT CODES RETRIEVED</text>
    <text x="310" y="189" fontFamily="'Courier New',monospace" fontSize="7" fill="#4ade80">5 codes scanned</text>

    {[
      ["P0087", "Fuel Rail Pressure Too Low", "HIGH", "#fef2f2", "#ef4444"],
      ["P0171", "System Too Lean — Bank 1", "MEDIUM", "#fffbeb", "#f59e0b"],
      ["P0402", "EGR Flow Excessive Detected", "MEDIUM", "#fffbeb", "#f59e0b"],
      ["P2002", "DPF Efficiency Below Threshold", "LOW", "#f0fdf4", "#22c55e"],
      ["U0100", "Lost Comm w/ ECM/PCM 'A'", "INFO", "#eff6ff", "#3b82f6"],
    ].map(([code, desc, sev, bg, col], i) => (
      <g key={i}>
        <rect x="10" y={200 + i * 20} width="380" height="20" fill={i % 2 === 0 ? "white" : "#f0fdf4"} stroke="#d1fae5" strokeWidth="0.5"/>
        <rect x="10" y={200 + i * 20} width="58" height="20" fill={bg}/>
        <text x="38" y={214 + i * 20} fontFamily="'Courier New',monospace" fontSize="8" fontWeight="bold" fill={col} textAnchor="middle">{code}</text>
        <text x="75" y={214 + i * 20} fontFamily="'Courier New',monospace" fontSize="7.5" fill="#374151">{desc}</text>
        <rect x="310" y={203 + i * 20} width="52" height="14" rx="7" fill={bg} stroke={col} strokeWidth="0.8"/>
        <text x="336" y={214 + i * 20} fontFamily="'Courier New',monospace" fontSize="6.5" fill={col} textAnchor="middle" fontWeight="bold">{sev}</text>
      </g>
    ))}

    {/* Inspection checklist */}
    <rect x="10" y="304" width="380" height="18" rx="2" fill="#166534"/>
    <text x="18" y="316" fontFamily="'Courier New',monospace" fontSize="8" fill="#86efac" letterSpacing="2">INSPECTION CHECKLIST</text>

    {[
      ["Engine Oil", "✓ OK"], ["Coolant Level", "✓ OK"], ["Brake Fluid", "⚠ Low"],
      ["Air Filter", "✗ Replace"], ["Battery", "✓ 12.4V"], ["Tyres (avg)", "✓ 4mm"]
    ].map(([item, status], i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const color = status.startsWith("✓") ? "#16a34a" : status.startsWith("⚠") ? "#d97706" : "#dc2626";
      return (
        <g key={i}>
          <rect x={10 + col * 128} y={326 + row * 22} width="124" height="20" rx="2"
            fill="white" stroke="#bbf7d0" strokeWidth="0.8"/>
          <text x={18 + col * 128} y={340 + row * 22} fontFamily="'Courier New',monospace" fontSize="7" fill="#374151">{item}</text>
          <text x={116 + col * 128} y={340 + row * 22} fontFamily="'Courier New',monospace" fontSize="7" fontWeight="bold" fill={color} textAnchor="end">{status}</text>
        </g>
      );
    })}

    {/* Services table */}
    <rect x="10" y="374" width="380" height="18" rx="2" fill="#166534"/>
    <text x="18" y="386" fontFamily="'Courier New',monospace" fontSize="8" fill="#86efac" letterSpacing="2">SERVICES RENDERED</text>

    {[
      ["Full OBD-II Diagnostic Scan + Report", "R 850"],
      ["Fuel Pressure Regulator Replacement", "R 2,400"],
      ["Labour (2.5 hrs @ R 420/hr)", "R 1,050"],
    ].map(([desc, total], i) => (
      <g key={i}>
        <rect x="10" y={396 + i * 18} width="380" height="18" fill={i % 2 === 0 ? "white" : "#f0fdf4"} stroke="#d1fae5" strokeWidth="0.5"/>
        <text x="18" y={408 + i * 18} fontFamily="'Courier New',monospace" fontSize="7.5" fill="#111827">{desc}</text>
        <text x="380" y={408 + i * 18} fontFamily="'Courier New',monospace" fontSize="8" fontWeight="bold" fill="#166534" textAnchor="end">{total}</text>
      </g>
    ))}

    {/* Total */}
    <rect x="270" y="452" width="120" height="32" rx="3" fill="#14532d"/>
    <text x="280" y="465" fontFamily="'Courier New',monospace" fontSize="8" fill="#86efac">TOTAL DUE</text>
    <text x="380" y="476" fontFamily="'Courier New',monospace" fontSize="11" fontWeight="bold" fill="#4ade80" textAnchor="end">R 4,899</text>

    <text x="18" y="468" fontFamily="'Courier New',monospace" fontSize="7" fill="#6b7280">Diagnostic Specialist · 8 Tech Park, Midrand · 011 555 0600</text>
    <text x="18" y="480" fontFamily="'Courier New',monospace" fontSize="7" fill="#6b7280">info@diagnosticspec.co.za · VAT: 4567891230</text>
  </svg>
);

// ─── Template Definitions ────────────────────────────────────────────────────

const TEMPLATES = {
  classic: {
    id: 'classic',
    name: 'Classic Workshop',
    description: 'Traditional auto repair invoice with professional 3-column layout',
    price: 0,
    isPremium: false,
    category: 'free',
    icon: Wrench,
    color: 'gray',
    SvgPreview: ClassicInvoiceSVG,
    features: [
      'Professional 3-column layout',
      'Vehicle details section',
      'Parts and labor breakdown',
      'Print optimized for A4'
    ],
    preview: 'Three neat columns showing customer info, billing details, and vehicle information with a clean items table.'
  },
  premium: {
    id: 'premium',
    name: 'Premium Auto Service',
    description: 'Modern design with bold branding for high-end auto shops',
    price: 299,
    isPremium: true,
    category: 'premium',
    icon: Crown,
    color: 'purple',
    SvgPreview: PremiumInvoiceSVG,
    features: [
      'Luxury design aesthetic',
      'Large branding area',
      'Enhanced color scheme',
      'Premium paper compatible'
    ],
    preview: 'Elegant bordered design with serif fonts and premium purple accents. Perfect for luxury vehicle specialists.'
  },
  speed: {
    id: 'speed',
    name: 'Speed Shop Pro',
    description: 'Bold and dynamic design for performance workshops',
    price: 349,
    isPremium: true,
    category: 'performance',
    icon: Zap,
    color: 'red',
    SvgPreview: SpeedShopInvoiceSVG,
    features: [
      'High-energy red design',
      'Performance-focused layout',
      'Bold typography',
      'Racing-inspired styling'
    ],
    preview: 'Dynamic red and black design with aggressive styling. Ideal for performance tuning and racing shops.'
  },
  modern: {
    id: 'modern',
    name: 'Modern Minimalist',
    description: 'Clean, contemporary design with blue accents',
    price: 249,
    isPremium: true,
    category: 'modern',
    icon: Car,
    color: 'blue',
    SvgPreview: ModernInvoiceSVG,
    features: [
      'Minimalist blue design',
      'Spacious layout',
      'Modern typography',
      'Clean and professional'
    ],
    preview: 'Contemporary design with blue accents and generous white space. Perfect for modern auto service centers.'
  },
  diagnostic: {
    id: 'diagnostic',
    name: 'Diagnostic Specialist',
    description: 'Technical layout perfect for detailed diagnostic work',
    price: 279,
    isPremium: true,
    category: 'technical',
    icon: Gauge,
    color: 'green',
    SvgPreview: DiagnosticInvoiceSVG,
    features: [
      'Technical green theme',
      'Detailed service breakdown',
      'Diagnostic codes section',
      'Inspection checklist ready'
    ],
    preview: 'Technical design with green accents. Optimized for diagnostic centers and detailed inspection reports.'
  }
};

// ─── Main Component ──────────────────────────────────────────────────────────

const Templates = () => {
  const [purchasedTemplates, setPurchasedTemplates] = useState(['classic']);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showPreview, setShowPreview] = useState(null);
  const [showPayment, setShowPayment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  });

  const handlePurchase = async (templateId) => {
    const template = TEMPLATES[templateId];
    if (template.isPremium) {
      setShowPayment(templateId);
      return;
    }
    setPurchasedTemplates(prev => [...prev, templateId]);
    alert('✅ Template added successfully!');
  };

  const handlePaymentSubmit = async () => {
    const templateId = showPayment;
    const template = TEMPLATES[templateId];

    if (!paymentForm.cardNumber || paymentForm.cardNumber.replace(/\s/g, '').length !== 16) {
      alert('❌ Please enter a valid 16-digit card number'); return;
    }
    if (!paymentForm.cardName.trim()) {
      alert('❌ Please enter the cardholder name'); return;
    }
    if (!paymentForm.expiryDate || !/^\d{2}\/\d{2}$/.test(paymentForm.expiryDate)) {
      alert('❌ Please enter expiry date in MM/YY format'); return;
    }
    if (!paymentForm.cvv || paymentForm.cvv.length !== 3) {
      alert('❌ Please enter a valid 3-digit CVV'); return;
    }

    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      setPurchasedTemplates(prev => [...prev, templateId]);
      setPaymentForm({ cardNumber: '', cardName: '', expiryDate: '', cvv: '' });
      setShowPayment(null);
      alert(`✅ Payment successful!\n\n${template.name} has been added to your account.`);
    } catch (error) {
      alert('❌ Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g);
    return chunks ? chunks.join(' ') : cleaned;
  };

  const handleCardNumberChange = (e) => {
    const value = e.target.value.replace(/\s/g, '');
    if (/^\d*$/.test(value) && value.length <= 16) {
      setPaymentForm({ ...paymentForm, cardNumber: formatCardNumber(value) });
    }
  };

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) value = value.slice(0, 2) + '/' + value.slice(2, 4);
    if (value.length <= 5) setPaymentForm({ ...paymentForm, expiryDate: value });
  };

  const handleCvvChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 3) setPaymentForm({ ...paymentForm, cvv: value });
  };

  const categories = [
    { id: 'all', name: 'All Templates' },
    { id: 'free', name: 'Free' },
    { id: 'premium', name: 'Premium' },
    { id: 'performance', name: 'Performance' },
    { id: 'modern', name: 'Modern' },
    { id: 'technical', name: 'Technical' }
  ];

  const filteredTemplates = Object.values(TEMPLATES).filter(template =>
    selectedCategory === 'all' || template.category === selectedCategory
  );

  const getColorClasses = (color) => ({
    gray: 'from-gray-500 to-gray-600',
    purple: 'from-purple-500 to-purple-600',
    red: 'from-red-500 to-red-600',
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600'
  }[color] || 'from-gray-500 to-gray-600');

  return (
    <div className="min-h-screen bg-gray-300 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-gray-400 rounded-lg p-8 text-gray-800">
          <div className="flex items-center gap-3 mb-3">
            <FileText className="w-8 h-8" />
            <h1 className="text-3xl font-bold">Invoice Templates</h1>
          </div>
          <p className="text-orange-50 text-lg">
            Professional invoice designs crafted specifically for auto repair shops and mechanics
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-6 text-sm">
            {["One-time purchase", "Lifetime access", "Print ready"].map(f => (
              <div key={f} className="flex items-center gap-2">
                <Check className="w-5 h-5" /><span>{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-orange-600">{purchasedTemplates.length}</div>
            <div className="text-sm text-gray-600">Templates Owned</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-blue-600">{Object.keys(TEMPLATES).length}</div>
            <div className="text-sm text-gray-600">Total Available</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-green-600">
              R{Object.values(TEMPLATES).filter(t => purchasedTemplates.includes(t.id)).reduce((s, t) => s + t.price, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Value</div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === category.id
                  ? 'bg-gray-600 text-gray-800 shadow-lg scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map(template => {
            const isPurchased = purchasedTemplates.includes(template.id);
            const Icon = template.icon;
            const SvgPreview = template.SvgPreview;

            return (
              <div
                key={template.id}
                className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden hover:shadow-2xl hover:border-orange-300 transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* SVG Invoice Preview */}
                <div className="relative h-64 bg-gray-100 overflow-hidden group">
                  <div className="w-full h-full transition-transform duration-500 group-hover:scale-105">
                    <SvgPreview />
                  </div>

                  {/* Gradient overlay on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${getColorClasses(template.color)} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}></div>

                  {/* Badges */}
                  {template.isPremium && !isPurchased && (
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-gray-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md border border-gray-200">
                      <Sparkles className="w-3 h-3 text-purple-500" />
                      Premium
                    </div>
                  )}
                  {isPurchased && (
                    <div className="absolute top-3 left-3 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md">
                      <Check className="w-3 h-3" />
                      Owned
                    </div>
                  )}
                </div>

                {/* Template Info */}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-5 h-5 text-orange-600" />
                    <h3 className="text-lg font-bold text-gray-900">{template.name}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4 min-h-[40px]">{template.description}</p>

                  {/* Features */}
                  <div className="mb-4">
                    <div className="text-xs font-semibold text-gray-500 mb-2">FEATURES</div>
                    <ul className="space-y-2">
                      {template.features.map((feature, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
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
                          <div className="text-3xl font-bold text-orange-600">R{template.price}</div>
                          <div className="text-xs text-gray-500">one-time</div>
                        </div>
                      ) : (
                        <div>
                          <div className="text-3xl font-bold text-green-600">Free</div>
                          <div className="text-xs text-gray-500">included</div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowPreview(template.id)}
                        className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 flex items-center gap-2 transition-all"
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
                          className="px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-700 hover:to-red-700 flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transition-all"
                        >
                          {template.isPremium ? (
                            <><ShoppingCart className="w-4 h-4" />Buy Now</>
                          ) : (
                            <><Check className="w-4 h-4" />Get Free</>
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
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            How to use your templates
          </h3>
          <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
            <li>Purchase a template that matches your workshop's style</li>
            <li>Go to "Create Job Card" from the sidebar menu</li>
            <li>Look for the template selector dropdown at the top of the page</li>
            <li>Select your purchased template from the dropdown</li>
            <li>Your invoice will automatically use the selected design</li>
          </ol>
        </div>

        {/* Preview Modal */}
        {showPreview && (() => {
          const SvgPreview = TEMPLATES[showPreview].SvgPreview;
          const Icon = TEMPLATES[showPreview].icon;
          return (
            <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
              <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                <div className="p-5 border-b flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100">
                  <div className="flex items-center gap-3">
                    {React.createElement(Icon, { className: "w-6 h-6 text-orange-600" })}
                    <h2 className="text-xl font-bold text-gray-900">{TEMPLATES[showPreview].name}</h2>
                  </div>
                  <button
                    onClick={() => setShowPreview(null)}
                    className="text-gray-500 hover:text-gray-700 text-2xl w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-200 transition-colors"
                  >✕</button>
                </div>
                <div className="overflow-auto p-6 bg-gray-100 flex justify-center">
                  <div className="w-full max-w-lg shadow-xl rounded-lg overflow-hidden">
                    <SvgPreview />
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
              <div className="p-6 border-b bg-gray-800">
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-3">
                    <ShoppingCart className="w-6 h-6" />
                    <h2 className="text-2xl font-bold">Complete Purchase</h2>
                  </div>
                  <button
                    onClick={() => { setShowPayment(null); setPaymentForm({ cardNumber: '', cardName: '', expiryDate: '', cvv: '' }); }}
                    className="text-gray-400 hover:text-white text-3xl w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors"
                  >✕</button>
                </div>
              </div>

              <div className="p-6">
                <div className="mb-6 p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg border-2 border-orange-200">
                  <div className="flex items-center gap-3 mb-2">
                    {React.createElement(TEMPLATES[showPayment].icon, { className: "w-8 h-8 text-orange-600" })}
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900">{TEMPLATES[showPayment].name}</h3>
                      <p className="text-sm text-gray-600">{TEMPLATES[showPayment].description}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-orange-200">
                    <span className="text-sm text-gray-600">One-time payment</span>
                    <span className="text-2xl font-bold text-orange-600">R{TEMPLATES[showPayment].price}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <CreditCard className="w-4 h-4" /> Card Number
                    </label>
                    <input type="text" value={paymentForm.cardNumber} onChange={handleCardNumberChange}
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all font-mono text-lg"/>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Cardholder Name</label>
                    <input type="text" value={paymentForm.cardName}
                      onChange={(e) => setPaymentForm({ ...paymentForm, cardName: e.target.value.toUpperCase() })}
                      placeholder="JOHN DOE"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all uppercase"/>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Expiry Date</label>
                      <input type="text" value={paymentForm.expiryDate} onChange={handleExpiryChange} placeholder="MM/YY"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all font-mono text-lg"/>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">CVV</label>
                      <input type="password" value={paymentForm.cvv} onChange={handleCvvChange} placeholder="123" maxLength={3}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all font-mono text-lg"/>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-xs text-green-800 flex items-start gap-2">
                    <Lock className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Your payment information is encrypted and secure. This is a one-time purchase with lifetime access.</span>
                  </p>
                </div>

                <button
                  onClick={handlePaymentSubmit}
                  disabled={loading}
                  className="w-full mt-6 px-6 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-700 hover:to-red-700 font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Processing Payment...</>
                  ) : (
                    <><Lock className="w-5 h-5" />Pay R{TEMPLATES[showPayment].price}</>
                  )}
                </button>
                <p className="text-xs text-gray-500 text-center mt-4">By completing this purchase, you agree to our terms of service</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Templates;