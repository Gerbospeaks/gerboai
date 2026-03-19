const ProfessionalInvoiceSVG = () => (
  <svg
    viewBox="0 0 400 500"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-full"
  >
    <rect width="400" height="500" fill="#f8faff" />
    {/* Header */}
    <rect width="400" height="68" fill="#1e40af" />
    <text
      x="20"
      y="28"
      fontFamily="'Trebuchet MS',sans-serif"
      fontSize="15"
      fontWeight="bold"
      fill="white"
    >
      MERIDIAN CONSULTING GROUP
    </text>
    <text
      x="20"
      y="46"
      fontFamily="'Trebuchet MS',sans-serif"
      fontSize="8"
      fill="#93c5fd"
      letterSpacing="2"
    >
      CHARTERED ACCOUNTANTS &amp; BUSINESS ADVISORS
    </text>
    <text
      x="20"
      y="60"
      fontFamily="'Trebuchet MS',sans-serif"
      fontSize="7"
      fill="#bfdbfe"
    >
      011 555 0400 · info@meridiancg.co.za · VAT: 4100223344
    </text>
    <rect x="310" y="10" width="80" height="48" rx="4" fill="#1e3a8a" />
    <text
      x="350"
      y="30"
      fontFamily="'Trebuchet MS',sans-serif"
      fontSize="8"
      fill="#93c5fd"
      textAnchor="middle"
      letterSpacing="1"
    >
      INVOICE
    </text>
    <text
      x="350"
      y="48"
      fontFamily="'Trebuchet MS',sans-serif"
      fontSize="11"
      fontWeight="bold"
      fill="white"
      textAnchor="middle"
    >
      #MCG-4471
    </text>

    {/* 3-column info */}
    {[
      {
        label: "BILL TO",
        lines: [
          "Hartley & Sons (Pty) Ltd",
          "Attn: Mr. G. Hartley",
          "62 Commerce Ave, JHB",
          "greg@hartleyco.co.za",
        ],
      },
      {
        label: "BILLING PERIOD",
        lines: [
          "Oct 2024",
          "01 Oct – 31 Oct 2024",
          "Due: 30 Nov 2024",
          "Terms: 30 days net",
        ],
      },
      {
        label: "ACCOUNT INFO",
        lines: [
          "Acc: MCG-0042",
          "Ref: HAR-2024-Q4",
          "Manager: T. Ndlovu",
          "Retainer: Active",
        ],
      },
    ].map(({ label, lines }, col) => (
      <g key={col}>
        <rect
          x={10 + col * 130}
          y={78}
          width={120}
          height={76}
          rx="3"
          fill="white"
          stroke="#dbeafe"
          strokeWidth="1.2"
        />
        <rect
          x={10 + col * 130}
          y={78}
          width={120}
          height={5}
          rx="2"
          fill="#3b82f6"
        />
        <text
          x={20 + col * 130}
          y={96}
          fontFamily="'Trebuchet MS',sans-serif"
          fontSize="6.5"
          fill="#3b82f6"
          letterSpacing="2"
        >
          {label}
        </text>
        {lines.map((line, i) => (
          <text
            key={i}
            x={20 + col * 130}
            y={108 + i * 12}
            fontFamily="'Trebuchet MS',sans-serif"
            fontSize={i === 0 ? "8" : "7"}
            fontWeight={i === 0 ? "bold" : "normal"}
            fill={i === 0 ? "#1e3a8a" : "#6b7280"}
          >
            {line}
          </text>
        ))}
      </g>
    ))}

    {/* Table */}
    <rect x="10" y="164" width="380" height="20" rx="2" fill="#1e40af" />
    <text
      x="18"
      y="177"
      fontFamily="'Trebuchet MS',sans-serif"
      fontSize="7.5"
      fill="white"
      letterSpacing="1"
    >
      SERVICE DESCRIPTION
    </text>
    <text
      x="240"
      y="177"
      fontFamily="'Trebuchet MS',sans-serif"
      fontSize="7.5"
      fill="#bfdbfe"
    >
      HRS
    </text>
    <text
      x="278"
      y="177"
      fontFamily="'Trebuchet MS',sans-serif"
      fontSize="7.5"
      fill="#bfdbfe"
    >
      RATE
    </text>
    <text
      x="340"
      y="177"
      fontFamily="'Trebuchet MS',sans-serif"
      fontSize="7.5"
      fill="white"
    >
      AMOUNT
    </text>

    {[
      ["Monthly Management Accounts Preparation", "8", "R 950", "R 7,600"],
      ["VAT201 Submission & Reconciliation", "3", "R 950", "R 2,850"],
      ["PAYE / EMP201 Processing (12 employees)", "2", "R 950", "R 1,900"],
      ["Annual Financial Statements (draft)", "6", "R 1,200", "R 7,200"],
      ["Tax Compliance Review — Section 11(a)", "4", "R 1,200", "R 4,800"],
      ["CIPC Annual Return Filing", "1", "R 850", "R 850"],
    ].map(([desc, hrs, rate, amt], i) => (
      <g key={i}>
        <rect
          x="10"
          y={188 + i * 22}
          width="380"
          height="22"
          fill={i % 2 === 0 ? "white" : "#eff6ff"}
          stroke="#dbeafe"
          strokeWidth="0.4"
        />
        <text
          x="18"
          y={203 + i * 22}
          fontFamily="'Trebuchet MS',sans-serif"
          fontSize="7.5"
          fill="#1e3a8a"
        >
          {desc}
        </text>
        <text
          x="244"
          y={203 + i * 22}
          fontFamily="'Trebuchet MS',sans-serif"
          fontSize="7.5"
          fill="#6b7280"
        >
          {hrs}
        </text>
        <text
          x="276"
          y={203 + i * 22}
          fontFamily="'Trebuchet MS',sans-serif"
          fontSize="7.5"
          fill="#6b7280"
        >
          {rate}
        </text>
        <text
          x="338"
          y={203 + i * 22}
          fontFamily="'Trebuchet MS',sans-serif"
          fontSize="8"
          fontWeight="bold"
          fill="#1e40af"
        >
          {amt}
        </text>
      </g>
    ))}

    {/* Totals */}
    <rect
      x="248"
      y="328"
      width="142"
      height="84"
      rx="4"
      fill="#eff6ff"
      stroke="#bfdbfe"
      strokeWidth="1.2"
    />
    <text
      x="258"
      y="346"
      fontFamily="'Trebuchet MS',sans-serif"
      fontSize="7.5"
      fill="#6b7280"
    >
      Subtotal
    </text>
    <text
      x="382"
      y="346"
      fontFamily="'Trebuchet MS',sans-serif"
      fontSize="7.5"
      fill="#374151"
      textAnchor="end"
    >
      R 25,200
    </text>
    <text
      x="258"
      y="362"
      fontFamily="'Trebuchet MS',sans-serif"
      fontSize="7.5"
      fill="#6b7280"
    >
      VAT (15%)
    </text>
    <text
      x="382"
      y="362"
      fontFamily="'Trebuchet MS',sans-serif"
      fontSize="7.5"
      fill="#374151"
      textAnchor="end"
    >
      R 3,780
    </text>
    <line
      x1="258"
      y1="371"
      x2="382"
      y2="371"
      stroke="#bfdbfe"
      strokeWidth="1"
    />
    <text
      x="258"
      y="388"
      fontFamily="'Trebuchet MS',sans-serif"
      fontSize="9"
      fontWeight="bold"
      fill="#1e40af"
    >
      TOTAL DUE
    </text>
    <text
      x="382"
      y="390"
      fontFamily="'Trebuchet MS',sans-serif"
      fontSize="12"
      fontWeight="bold"
      fill="#1e40af"
      textAnchor="end"
    >
      R 28,980
    </text>
    <text
      x="258"
      y="404"
      fontFamily="'Trebuchet MS',sans-serif"
      fontSize="7"
      fill="#93c5fd"
    >
      EFT preferred · FNB · Acc: 628 4451 123
    </text>

    {/* Notes */}
    <rect
      x="10"
      y="328"
      width="230"
      height="84"
      rx="4"
      fill="white"
      stroke="#dbeafe"
      strokeWidth="1"
    />
    <text
      x="20"
      y="346"
      fontFamily="'Trebuchet MS',sans-serif"
      fontSize="7"
      fill="#3b82f6"
      letterSpacing="1"
    >
      NOTES
    </text>
    <text
      x="20"
      y="360"
      fontFamily="'Trebuchet MS',sans-serif"
      fontSize="7.5"
      fill="#374151"
    >
      All work performed in terms of the
    </text>
    <text
      x="20"
      y="372"
      fontFamily="'Trebuchet MS',sans-serif"
      fontSize="7.5"
      fill="#374151"
    >
      signed engagement letter dated
    </text>
    <text
      x="20"
      y="384"
      fontFamily="'Trebuchet MS',sans-serif"
      fontSize="7.5"
      fill="#374151"
    >
      01 February 2024.
    </text>
    <text
      x="20"
      y="400"
      fontFamily="'Trebuchet MS',sans-serif"
      fontSize="7"
      fill="#9ca3af"
    >
      Interest charged at prime + 2% on overdue accounts.
    </text>

    {/* Footer */}
    <rect x="0" y="428" width="400" height="72" fill="#1e40af" />
    <text
      x="200"
      y="452"
      fontFamily="'Trebuchet MS',sans-serif"
      fontSize="8"
      fill="#93c5fd"
      textAnchor="middle"
    >
      Meridian Consulting Group (Pty) Ltd · Reg: 2015/334421/07
    </text>
    <text
      x="200"
      y="466"
      fontFamily="'Trebuchet MS',sans-serif"
      fontSize="8"
      fill="#bfdbfe"
      textAnchor="middle"
    >
      14 Sandton Square, Johannesburg · 011 555 0400 · www.meridiancg.co.za
    </text>
    <text
      x="200"
      y="484"
      fontFamily="'Trebuchet MS',sans-serif"
      fontSize="7"
      fill="#3b82f6"
      textAnchor="middle"
    >
      Member: South African Institute of Chartered Accountants (SAICA) ·
      Practice No: 934221
    </text>
  </svg>
);

const CorporateInvoiceSVG = () => (
  <svg
    viewBox="0 0 400 500"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-full"
  >
    <rect width="400" height="500" fill="#f8f8f6" />
    {/* Outer and inner border */}
    <rect
      x="6"
      y="6"
      width="388"
      height="488"
      fill="none"
      stroke="#334155"
      strokeWidth="2"
    />
    <rect
      x="10"
      y="10"
      width="380"
      height="480"
      fill="none"
      stroke="#cbd5e1"
      strokeWidth="0.5"
    />

    {/* Header band */}
    <rect x="6" y="6" width="388" height="60" fill="#0f172a" />
    <rect x="6" y="64" width="388" height="5" fill="#334155" />

    <text
      x="22"
      y="30"
      fontFamily="'Palatino Linotype',Palatino,Georgia,serif"
      fontSize="14"
      fontWeight="bold"
      fill="#e2e8f0"
      letterSpacing="3"
    >
      ATLAS CORPORATE ADVISORY
    </text>
    <text
      x="22"
      y="48"
      fontFamily="'Palatino Linotype',serif"
      fontSize="7"
      fill="#64748b"
      letterSpacing="5"
    >
      CHARTERED ACCOUNTANTS · CORPORATE ADVISORS
    </text>
    <text
      x="22"
      y="62"
      fontFamily="'Palatino Linotype',serif"
      fontSize="7"
      fill="#475569"
    >
      +27 (0)21 555 0900 · atlas@atlascorp.co.za
    </text>
    <rect
      x="298"
      y="14"
      width="90"
      height="44"
      rx="3"
      fill="#1e293b"
      stroke="#475569"
      strokeWidth="1"
    />
    <text
      x="343"
      y="32"
      fontFamily="Palatino,serif"
      fontSize="8"
      fill="#94a3b8"
      textAnchor="middle"
      letterSpacing="2"
    >
      INVOICE
    </text>
    <text
      x="343"
      y="50"
      fontFamily="Palatino,serif"
      fontSize="12"
      fontWeight="bold"
      fill="#e2e8f0"
      textAnchor="middle"
    >
      #ACA-0093
    </text>

    {/* Client block */}
    <text
      x="22"
      y="84"
      fontFamily="Palatino,serif"
      fontSize="7"
      fill="#64748b"
      letterSpacing="3"
    >
      ISSUED TO
    </text>
    <text
      x="22"
      y="99"
      fontFamily="Palatino,serif"
      fontSize="11"
      fontWeight="bold"
      fill="#0f172a"
    >
      Pinnacle Holdings Group
    </text>
    <text
      x="22"
      y="112"
      fontFamily="Palatino,serif"
      fontSize="8"
      fill="#475569"
    >
      Attn: CFO – Ms. Refilwe Mokoena
    </text>
    <text
      x="22"
      y="124"
      fontFamily="Palatino,serif"
      fontSize="8"
      fill="#475569"
    >
      33 Bree Street, Cape Town, 8001
    </text>
    <text
      x="22"
      y="136"
      fontFamily="Palatino,serif"
      fontSize="8"
      fill="#475569"
    >
      refilwe.m@pinnacleg.co.za · 021 888 0100
    </text>

    {/* Date / ref block */}
    <rect
      x="260"
      y="76"
      width="130"
      height="70"
      rx="3"
      fill="#f1f5f9"
      stroke="#cbd5e1"
      strokeWidth="1"
    />
    <text
      x="270"
      y="93"
      fontFamily="Palatino,serif"
      fontSize="7"
      fill="#64748b"
      letterSpacing="2"
    >
      DATE ISSUED
    </text>
    <text
      x="270"
      y="107"
      fontFamily="Palatino,serif"
      fontSize="9"
      fontWeight="bold"
      fill="#0f172a"
    >
      14 November 2024
    </text>
    <text
      x="270"
      y="122"
      fontFamily="Palatino,serif"
      fontSize="7"
      fill="#64748b"
      letterSpacing="2"
    >
      DUE DATE
    </text>
    <text
      x="270"
      y="136"
      fontFamily="Palatino,serif"
      fontSize="9"
      fontWeight="bold"
      fill="#0f172a"
    >
      14 December 2024
    </text>

    {/* Ornament divider */}
    <line
      x1="22"
      y1="150"
      x2="378"
      y2="150"
      stroke="#cbd5e1"
      strokeWidth="0.8"
    />
    <text
      x="200"
      y="155"
      fontFamily="serif"
      fontSize="10"
      fill="#94a3b8"
      textAnchor="middle"
    >
      ◆
    </text>

    {/* Table */}
    <rect x="22" y="160" width="356" height="19" fill="#0f172a" rx="2" />
    <text
      x="30"
      y="173"
      fontFamily="Palatino,serif"
      fontSize="7.5"
      fill="#94a3b8"
      letterSpacing="1"
    >
      PROFESSIONAL SERVICES — Q4 2024
    </text>
    <text
      x="256"
      y="173"
      fontFamily="Palatino,serif"
      fontSize="7.5"
      fill="#64748b"
    >
      UNITS
    </text>
    <text
      x="298"
      y="173"
      fontFamily="Palatino,serif"
      fontSize="7.5"
      fill="#64748b"
    >
      RATE
    </text>
    <text
      x="352"
      y="173"
      fontFamily="Palatino,serif"
      fontSize="7.5"
      fill="#e2e8f0"
    >
      TOTAL
    </text>

    {[
      ["Audit of Annual Financial Statements", "Fixed", "—", "R 42,000"],
      ["IFRS Compliance Review & Advisory", "10h", "R 1,800", "R 18,000"],
      ["Transfer Pricing Documentation", "8h", "R 1,800", "R 14,400"],
      ["Board Pack Preparation (Oct–Nov)", "Fixed", "—", "R 8,500"],
      ["Corporate Tax Computation & ITR14", "6h", "R 1,500", "R 9,000"],
      ["Shareholder Agreement Review", "4h", "R 1,500", "R 6,000"],
    ].map(([desc, units, rate, total], i) => (
      <g key={i}>
        <rect
          x="22"
          y={183 + i * 23}
          width="356"
          height="23"
          fill={i % 2 === 0 ? "white" : "#f8fafc"}
          stroke="#e2e8f0"
          strokeWidth="0.5"
        />
        <text
          x="30"
          y={199 + i * 23}
          fontFamily="Palatino,serif"
          fontSize="8"
          fill="#0f172a"
        >
          {desc}
        </text>
        <text
          x="260"
          y={199 + i * 23}
          fontFamily="Palatino,serif"
          fontSize="7.5"
          fill="#64748b"
        >
          {units}
        </text>
        <text
          x="296"
          y={199 + i * 23}
          fontFamily="Palatino,serif"
          fontSize="7.5"
          fill="#64748b"
        >
          {rate}
        </text>
        <text
          x="370"
          y={199 + i * 23}
          fontFamily="Palatino,serif"
          fontSize="8"
          fontWeight="bold"
          fill="#0f172a"
          textAnchor="end"
        >
          {total}
        </text>
      </g>
    ))}

    {/* Totals */}
    <rect
      x="248"
      y="326"
      width="130"
      height="86"
      rx="3"
      fill="#f1f5f9"
      stroke="#cbd5e1"
      strokeWidth="1"
    />
    <text
      x="258"
      y="344"
      fontFamily="Palatino,serif"
      fontSize="8"
      fill="#64748b"
    >
      Subtotal
    </text>
    <text
      x="370"
      y="344"
      fontFamily="Palatino,serif"
      fontSize="8"
      fill="#334155"
      textAnchor="end"
    >
      R 97,900
    </text>
    <text
      x="258"
      y="360"
      fontFamily="Palatino,serif"
      fontSize="8"
      fill="#64748b"
    >
      VAT (15%)
    </text>
    <text
      x="370"
      y="360"
      fontFamily="Palatino,serif"
      fontSize="8"
      fill="#334155"
      textAnchor="end"
    >
      R 14,685
    </text>
    <text
      x="258"
      y="376"
      fontFamily="Palatino,serif"
      fontSize="8"
      fill="#64748b"
    >
      Retainer applied
    </text>
    <text
      x="370"
      y="376"
      fontFamily="Palatino,serif"
      fontSize="8"
      fill="#16a34a"
      textAnchor="end"
    >
      – R 10,000
    </text>
    <line
      x1="258"
      y1="384"
      x2="370"
      y2="384"
      stroke="#94a3b8"
      strokeWidth="0.8"
    />
    <text
      x="258"
      y="400"
      fontFamily="Palatino,serif"
      fontSize="9"
      fontWeight="bold"
      fill="#0f172a"
    >
      BALANCE DUE
    </text>
    <text
      x="370"
      y="402"
      fontFamily="Palatino,serif"
      fontSize="12"
      fontWeight="bold"
      fill="#0f172a"
      textAnchor="end"
    >
      R 102,585
    </text>
    <text
      x="258"
      y="416"
      fontFamily="Palatino,serif"
      fontSize="7"
      fill="#94a3b8"
    >
      EFT · Standard Bank · 051 001
    </text>

    {/* Notes */}
    <rect
      x="22"
      y="326"
      width="216"
      height="86"
      rx="3"
      fill="white"
      stroke="#e2e8f0"
      strokeWidth="1"
    />
    <text
      x="32"
      y="344"
      fontFamily="Palatino,serif"
      fontSize="7"
      fill="#64748b"
      letterSpacing="2"
    >
      BANKING DETAILS
    </text>
    <text
      x="32"
      y="358"
      fontFamily="Palatino,serif"
      fontSize="7.5"
      fill="#334151"
    >
      Atlas Corporate Advisory (Pty) Ltd
    </text>
    <text
      x="32"
      y="370"
      fontFamily="Palatino,serif"
      fontSize="7.5"
      fill="#334151"
    >
      Standard Bank · Branch: 051 001
    </text>
    <text
      x="32"
      y="382"
      fontFamily="Palatino,serif"
      fontSize="7.5"
      fill="#334151"
    >
      Acc: 027 334 5567 · Type: Current
    </text>
    <text
      x="32"
      y="397"
      fontFamily="Palatino,serif"
      fontSize="7"
      fill="#94a3b8"
    >
      Use invoice number as reference.
    </text>

    {/* Footer */}
    <rect x="6" y="432" width="388" height="62" fill="#0f172a" />
    <line x1="6" y1="432" x2="394" y2="432" stroke="#334155" strokeWidth="2" />
    <text
      x="200"
      y="452"
      fontFamily="Palatino,serif"
      fontSize="7.5"
      fill="#64748b"
      textAnchor="middle"
    >
      Atlas Corporate Advisory (Pty) Ltd · Reg: 2010/118823/07 · VAT: 4800112233
    </text>
    <text
      x="200"
      y="467"
      fontFamily="Palatino,serif"
      fontSize="7.5"
      fill="#94a3b8"
      textAnchor="middle"
    >
      Suite 12, 100 St Georges Mall, Cape Town · www.atlascorp.co.za
    </text>
    <text
      x="200"
      y="483"
      fontFamily="Palatino,serif"
      fontSize="7"
      fill="#334155"
      textAnchor="middle"
    >
      Registered Auditor: IRBA Reg No. 3441 · SAICA Member Firm
    </text>
  </svg>
);

const ContemporaryInvoiceSVG = () => (
  <svg
    viewBox="0 0 400 500"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-full"
  >
    <rect width="400" height="500" fill="#f0fdf4" />
    {/* Bold top accent */}
    <rect x="0" y="0" width="400" height="10" fill="#059669" />
    <rect x="0" y="0" width="8" height="500" fill="#059669" />

    {/* Header */}
    <text
      x="24"
      y="35"
      fontFamily="'Arial Black',Impact,sans-serif"
      fontSize="15"
      fontWeight="900"
      fill="#064e3b"
      letterSpacing="1"
    >
      VERTEX FINANCIAL
    </text>
    <text
      x="24"
      y="52"
      fontFamily="'Arial Black',sans-serif"
      fontSize="8"
      fill="#059669"
      letterSpacing="3"
    >
      ADVISORY SERVICES
    </text>
    <text
      x="24"
      y="65"
      fontFamily="Arial,sans-serif"
      fontSize="7"
      fill="#6b7280"
    >
      021 555 0250 · admin@vertexfinancial.co.za · VAT: 4300445566
    </text>

    {/* Invoice badge */}
    <rect x="295" y="14" width="98" height="52" rx="6" fill="#065f46" />
    <text
      x="344"
      y="36"
      fontFamily="'Arial Black',sans-serif"
      fontSize="8"
      fill="#6ee7b7"
      textAnchor="middle"
      letterSpacing="2"
    >
      INVOICE
    </text>
    <text
      x="344"
      y="56"
      fontFamily="'Arial Black',sans-serif"
      fontSize="12"
      fontWeight="bold"
      fill="white"
      textAnchor="middle"
    >
      #VF-2281
    </text>

    {/* Client & info cards */}
    <rect
      x="18"
      y="80"
      width="178"
      height="68"
      rx="5"
      fill="white"
      stroke="#a7f3d0"
      strokeWidth="1.5"
    />
    <rect x="18" y="80" width="178" height="6" rx="3" fill="#059669" />
    <text
      x="28"
      y="100"
      fontFamily="Arial,sans-serif"
      fontSize="7"
      fill="#059669"
      letterSpacing="2"
      fontWeight="bold"
    >
      CLIENT
    </text>
    <text
      x="28"
      y="114"
      fontFamily="'Arial Black',sans-serif"
      fontSize="9"
      fontWeight="bold"
      fill="#064e3b"
    >
      Nimbus Tech Solutions
    </text>
    <text
      x="28"
      y="126"
      fontFamily="Arial,sans-serif"
      fontSize="7.5"
      fill="#6b7280"
    >
      CFO: Siyanda Mthembu
    </text>
    <text
      x="28"
      y="138"
      fontFamily="Arial,sans-serif"
      fontSize="7.5"
      fill="#6b7280"
    >
      siyanda@nimbustech.co.za
    </text>

    <rect
      x="206"
      y="80"
      width="186"
      height="68"
      rx="5"
      fill="white"
      stroke="#a7f3d0"
      strokeWidth="1.5"
    />
    <rect x="206" y="80" width="186" height="6" rx="3" fill="#059669" />
    <text
      x="216"
      y="100"
      fontFamily="Arial,sans-serif"
      fontSize="7"
      fill="#059669"
      letterSpacing="2"
      fontWeight="bold"
    >
      DETAILS
    </text>
    <text
      x="216"
      y="114"
      fontFamily="Arial,sans-serif"
      fontSize="8"
      fontWeight="bold"
      fill="#064e3b"
    >
      Invoice Date: 14 Nov 2024
    </text>
    <text
      x="216"
      y="126"
      fontFamily="Arial,sans-serif"
      fontSize="7.5"
      fill="#6b7280"
    >
      Due Date: 14 Dec 2024
    </text>
    <text
      x="216"
      y="138"
      fontFamily="Arial,sans-serif"
      fontSize="7.5"
      fill="#6b7280"
    >
      Ref: NTS-Q4-2024 · Terms: 30 days
    </text>

    {/* Service period banner */}
    <rect
      x="18"
      y="158"
      width="374"
      height="22"
      rx="3"
      fill="#d1fae5"
      stroke="#6ee7b7"
      strokeWidth="1"
    />
    <text
      x="28"
      y="173"
      fontFamily="'Arial Black',sans-serif"
      fontSize="8"
      fill="#065f46"
      letterSpacing="1"
    >
      SERVICE PERIOD: OCTOBER – NOVEMBER 2024
    </text>

    {/* Table */}
    <rect x="18" y="186" width="374" height="19" fill="#065f46" rx="2" />
    <text
      x="26"
      y="199"
      fontFamily="Arial,sans-serif"
      fontSize="7.5"
      fill="#6ee7b7"
      letterSpacing="1"
    >
      DESCRIPTION
    </text>
    <text
      x="254"
      y="199"
      fontFamily="Arial,sans-serif"
      fontSize="7.5"
      fill="#a7f3d0"
    >
      HRS
    </text>
    <text
      x="296"
      y="199"
      fontFamily="Arial,sans-serif"
      fontSize="7.5"
      fill="#a7f3d0"
    >
      RATE
    </text>
    <text
      x="356"
      y="199"
      fontFamily="Arial,sans-serif"
      fontSize="7.5"
      fill="white"
    >
      TOTAL
    </text>

    {[
      ["CFO Advisory (Part-Time) — Oct & Nov", "20", "R 2,200", "R 44,000"],
      ["SARS eFiling & Tax Clearance Certificate", "2", "R 1,100", "R 2,200"],
      ["Cash Flow Forecast Model (3-year)", "8", "R 1,400", "R 11,200"],
      ["BEE Compliance Review & Gap Analysis", "5", "R 1,400", "R 7,000"],
      ["Board Resolution Preparation (×3)", "2", "R 900", "R 1,800"],
    ].map(([desc, hrs, rate, total], i) => (
      <g key={i}>
        <rect
          x="18"
          y={209 + i * 23}
          width="374"
          height="23"
          fill={i % 2 === 0 ? "white" : "#f0fdf4"}
          stroke="#d1fae5"
          strokeWidth="0.5"
        />
        <text
          x="26"
          y={225 + i * 23}
          fontFamily="Arial,sans-serif"
          fontSize="7.5"
          fill="#064e3b"
        >
          {desc}
        </text>
        <text
          x="257"
          y={225 + i * 23}
          fontFamily="Arial,sans-serif"
          fontSize="7.5"
          fill="#6b7280"
        >
          {hrs}
        </text>
        <text
          x="294"
          y={225 + i * 23}
          fontFamily="Arial,sans-serif"
          fontSize="7.5"
          fill="#6b7280"
        >
          {rate}
        </text>
        <text
          x="384"
          y={225 + i * 23}
          fontFamily="Arial,sans-serif"
          fontSize="8"
          fontWeight="bold"
          fill="#059669"
          textAnchor="end"
        >
          {total}
        </text>
      </g>
    ))}

    {/* Totals */}
    <rect x="242" y="330" width="150" height="88" rx="5" fill="#065f46" />
    <text
      x="254"
      y="350"
      fontFamily="Arial,sans-serif"
      fontSize="8"
      fill="#6ee7b7"
    >
      Subtotal
    </text>
    <text
      x="384"
      y="350"
      fontFamily="Arial,sans-serif"
      fontSize="8"
      fill="#a7f3d0"
      textAnchor="end"
    >
      R 66,200
    </text>
    <text
      x="254"
      y="366"
      fontFamily="Arial,sans-serif"
      fontSize="8"
      fill="#6ee7b7"
    >
      VAT (15%)
    </text>
    <text
      x="384"
      y="366"
      fontFamily="Arial,sans-serif"
      fontSize="8"
      fill="#a7f3d0"
      textAnchor="end"
    >
      R 9,930
    </text>
    <line
      x1="254"
      y1="375"
      x2="384"
      y2="375"
      stroke="#34d399"
      strokeWidth="0.8"
    />
    <text
      x="254"
      y="392"
      fontFamily="'Arial Black',sans-serif"
      fontSize="9"
      fontWeight="bold"
      fill="white"
    >
      TOTAL DUE
    </text>
    <text
      x="384"
      y="394"
      fontFamily="'Arial Black',sans-serif"
      fontSize="13"
      fontWeight="bold"
      fill="#6ee7b7"
      textAnchor="end"
    >
      R 76,130
    </text>
    <text
      x="254"
      y="412"
      fontFamily="Arial,sans-serif"
      fontSize="7"
      fill="#34d399"
    >
      Nedbank · 198 8822 5544
    </text>

    {/* Milestone box */}
    <rect
      x="18"
      y="330"
      width="214"
      height="88"
      rx="5"
      fill="white"
      stroke="#a7f3d0"
      strokeWidth="1.5"
    />
    <text
      x="28"
      y="348"
      fontFamily="Arial,sans-serif"
      fontSize="7"
      fill="#059669"
      letterSpacing="2"
      fontWeight="bold"
    >
      NEXT ENGAGEMENT
    </text>
    <text
      x="28"
      y="363"
      fontFamily="Arial,sans-serif"
      fontSize="7.5"
      fill="#374151"
    >
      Dec board pack due: 06 Dec 2024
    </text>
    <text
      x="28"
      y="376"
      fontFamily="Arial,sans-serif"
      fontSize="7.5"
      fill="#374151"
    >
      Q4 tax computations: 20 Dec 2024
    </text>
    <text
      x="28"
      y="389"
      fontFamily="Arial,sans-serif"
      fontSize="7.5"
      fill="#374151"
    >
      Year-end audit prep: Jan 2025
    </text>
    <rect
      x="28"
      y="400"
      width="90"
      height="14"
      rx="7"
      fill="#d1fae5"
      stroke="#6ee7b7"
      strokeWidth="1"
    />
    <text
      x="73"
      y="411"
      fontFamily="Arial,sans-serif"
      fontSize="7"
      fill="#065f46"
      textAnchor="middle"
      fontWeight="bold"
    >
      RETAINER ACTIVE ✓
    </text>

    {/* Footer */}
    <rect x="0" y="434" width="400" height="66" fill="#064e3b" />
    <rect x="0" y="434" width="8" height="66" fill="#059669" />
    <text
      x="200"
      y="455"
      fontFamily="Arial,sans-serif"
      fontSize="7.5"
      fill="#6ee7b7"
      textAnchor="middle"
    >
      Vertex Financial Advisory Services (Pty) Ltd · Reg: 2019/441122/07
    </text>
    <text
      x="200"
      y="469"
      fontFamily="Arial,sans-serif"
      fontSize="7.5"
      fill="#a7f3d0"
      textAnchor="middle"
    >
      14 Buitenkant Street, Cape Town · 021 555 0250 · www.vertexfinancial.co.za
    </text>
    <text
      x="200"
      y="486"
      fontFamily="Arial,sans-serif"
      fontSize="7"
      fill="#34d399"
      textAnchor="middle"
    >
      Registered Tax Practitioner · SAIT Member · Practice No: 28831
    </text>
  </svg>
);

const ModernBizInvoiceSVG = () => (
  <svg
    viewBox="0 0 400 500"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-full"
  >
    <rect width="400" height="500" fill="#fafbff" />
    {/* Left indigo sidebar */}
    <rect x="0" y="0" width="110" height="500" fill="#3730a3" />
    {/* Sidebar content */}
    <text
      x="55"
      y="40"
      fontFamily="'Trebuchet MS',sans-serif"
      fontSize="7"
      fill="#a5b4fc"
      textAnchor="middle"
      letterSpacing="2"
    >
      AXIOM
    </text>
    <text
      x="55"
      y="56"
      fontFamily="'Trebuchet MS',sans-serif"
      fontSize="8"
      fontWeight="bold"
      fill="white"
      textAnchor="middle"
    >
      ADVISORY
    </text>
    <line x1="20" y1="65" x2="90" y2="65" stroke="#4338ca" strokeWidth="1" />

    {/* Sidebar info sections */}
    {[
      { label: "INVOICE", value: "#AX-3301" },
      { label: "DATE", value: "14 Nov 2024" },
      { label: "DUE", value: "14 Dec 2024" },
      { label: "TERMS", value: "30 days net" },
      { label: "REF", value: "ORC-Q4-24" },
    ].map(({ label, value }, i) => (
      <g key={i}>
        <text
          x="55"
          y={90 + i * 38}
          fontFamily="'Trebuchet MS',sans-serif"
          fontSize="6.5"
          fill="#818cf8"
          textAnchor="middle"
          letterSpacing="2"
        >
          {label}
        </text>
        <text
          x="55"
          y={104 + i * 38}
          fontFamily="'Trebuchet MS',sans-serif"
          fontSize="9"
          fontWeight="bold"
          fill="white"
          textAnchor="middle"
        >
          {value}
        </text>
      </g>
    ))}

    <line x1="20" y1="290" x2="90" y2="290" stroke="#4338ca" strokeWidth="1" />
    <text
      x="55"
      y="310"
      fontFamily="'Trebuchet MS',sans-serif"
      fontSize="6.5"
      fill="#818cf8"
      textAnchor="middle"
      letterSpacing="2"
    >
      TOTAL DUE
    </text>
    <text
      x="55"
      y="328"
      fontFamily="'Trebuchet MS',sans-serif"
      fontSize="13"
      fontWeight="bold"
      fill="#a5b4fc"
      textAnchor="middle"
    >
      R 54,740
    </text>

    <line x1="20" y1="342" x2="90" y2="342" stroke="#4338ca" strokeWidth="1" />
    <text
      x="55"
      y="362"
      fontFamily="'Trebuchet MS',sans-serif"
      fontSize="6.5"
      fill="#818cf8"
      textAnchor="middle"
      letterSpacing="1"
    >
      PAYMENT
    </text>
    <text
      x="55"
      y="376"
      fontFamily="'Trebuchet MS',sans-serif"
      fontSize="7.5"
      fill="white"
      textAnchor="middle"
    >
      Absa Bank
    </text>
    <text
      x="55"
      y="390"
      fontFamily="'Trebuchet MS',sans-serif"
      fontSize="7"
      fill="#a5b4fc"
      textAnchor="middle"
    >
      4055 223 441
    </text>

    <text
      x="55"
      y="470"
      fontFamily="'Trebuchet MS',sans-serif"
      fontSize="6.5"
      fill="#4338ca"
      textAnchor="middle"
      letterSpacing="1"
    >
      SAICA · SAIT
    </text>
    <text
      x="55"
      y="484"
      fontFamily="'Trebuchet MS',sans-serif"
      fontSize="6.5"
      fill="#4338ca"
      textAnchor="middle"
    >
      Reg: 2016/55231
    </text>

    {/* Main content area */}
    {/* Client */}
    <text
      x="126"
      y="28"
      fontFamily="'Trebuchet MS',sans-serif"
      fontSize="7"
      fill="#6366f1"
      letterSpacing="2"
    >
      BILLED TO
    </text>
    <text
      x="126"
      y="44"
      fontFamily="'Trebuchet MS',sans-serif"
      fontSize="12"
      fontWeight="bold"
      fill="#1e1b4b"
    >
      Orchard Capital Group
    </text>
    <text
      x="126"
      y="58"
      fontFamily="'Trebuchet MS',sans-serif"
      fontSize="8"
      fill="#6b7280"
    >
      MD: Mr. Pieter van Zyl · 083 222 0088
    </text>
    <text
      x="126"
      y="70"
      fontFamily="'Trebuchet MS',sans-serif"
      fontSize="8"
      fill="#6b7280"
    >
      pieter@orchardcapital.co.za · Stellenbosch
    </text>

    <line x1="122" y1="80" x2="390" y2="80" stroke="#e0e7ff" strokeWidth="1" />

    {/* Table */}
    <rect x="122" y="88" width="270" height="18" rx="2" fill="#3730a3" />
    <text
      x="130"
      y="100"
      fontFamily="'Trebuchet MS',sans-serif"
      fontSize="7"
      fill="#c7d2fe"
      letterSpacing="1"
    >
      SERVICE
    </text>
    <text
      x="310"
      y="100"
      fontFamily="'Trebuchet MS',sans-serif"
      fontSize="7"
      fill="#c7d2fe"
    >
      HRS
    </text>
    <text
      x="352"
      y="100"
      fontFamily="'Trebuchet MS',sans-serif"
      fontSize="7"
      fill="white"
    >
      AMT
    </text>

    {[
      ["Bookkeeping & Reconciliation (Oct)", "12", "R 7,200"],
      ["Payroll Processing — 22 staff", "3", "R 2,400"],
      ["Management Accounts Package", "6", "R 5,400"],
      ["SARS VAT201 & Provisional Tax", "4", "R 3,600"],
      ["Due Diligence — Acquisition Target A", "16", "R 22,400"],
      ["Statutory Registers Update (CIPC)", "2", "R 1,400"],
      ["Business Valuation Report", "10", "R 12,340"],
    ].map(([desc, hrs, amt], i) => (
      <g key={i}>
        <rect
          x="122"
          y={110 + i * 22}
          width="270"
          height="22"
          fill={i % 2 === 0 ? "white" : "#eef2ff"}
          stroke="#e0e7ff"
          strokeWidth="0.4"
        />
        <text
          x="130"
          y={125 + i * 22}
          fontFamily="'Trebuchet MS',sans-serif"
          fontSize="7.5"
          fill="#1e1b4b"
        >
          {desc}
        </text>
        <text
          x="313"
          y={125 + i * 22}
          fontFamily="'Trebuchet MS',sans-serif"
          fontSize="7.5"
          fill="#6b7280"
        >
          {hrs}h
        </text>
        <text
          x="384"
          y={125 + i * 22}
          fontFamily="'Trebuchet MS',sans-serif"
          fontSize="8"
          fontWeight="bold"
          fill="#4338ca"
          textAnchor="end"
        >
          {amt}
        </text>
      </g>
    ))}

    <line
      x1="122"
      y1="268"
      x2="392"
      y2="268"
      stroke="#e0e7ff"
      strokeWidth="1"
    />
    <text
      x="250"
      y="284"
      fontFamily="'Trebuchet MS',sans-serif"
      fontSize="8"
      fill="#6b7280"
    >
      Subtotal
    </text>
    <text
      x="386"
      y="284"
      fontFamily="'Trebuchet MS',sans-serif"
      fontSize="8"
      fill="#374151"
      textAnchor="end"
    >
      R 54,740
    </text>
    <text
      x="250"
      y="298"
      fontFamily="'Trebuchet MS',sans-serif"
      fontSize="8"
      fill="#6b7280"
    >
      VAT (15%)
    </text>
    <text
      x="386"
      y="298"
      fontFamily="'Trebuchet MS',sans-serif"
      fontSize="8"
      fill="#374151"
      textAnchor="end"
    >
      R 8,211
    </text>
    <rect x="240" y="305" width="152" height="26" rx="3" fill="#3730a3" />
    <text
      x="250"
      y="323"
      fontFamily="'Trebuchet MS',sans-serif"
      fontSize="10"
      fontWeight="bold"
      fill="white"
    >
      TOTAL
    </text>
    <text
      x="384"
      y="323"
      fontFamily="'Trebuchet MS',sans-serif"
      fontSize="11"
      fontWeight="bold"
      fill="#a5b4fc"
      textAnchor="end"
    >
      R 62,951
    </text>

    {/* Notes */}
    <rect
      x="122"
      y="340"
      width="270"
      height="90"
      rx="4"
      fill="#eef2ff"
      stroke="#c7d2fe"
      strokeWidth="1"
    />
    <text
      x="132"
      y="358"
      fontFamily="'Trebuchet MS',sans-serif"
      fontSize="7"
      fill="#6366f1"
      letterSpacing="2"
    >
      NOTES &amp; TERMS
    </text>
    <text
      x="132"
      y="372"
      fontFamily="'Trebuchet MS',sans-serif"
      fontSize="7.5"
      fill="#374151"
    >
      Engagement letter signed: 01 Feb 2024.
    </text>
    <text
      x="132"
      y="385"
      fontFamily="'Trebuchet MS',sans-serif"
      fontSize="7.5"
      fill="#374151"
    >
      All services rendered per signed scope.
    </text>
    <text
      x="132"
      y="398"
      fontFamily="'Trebuchet MS',sans-serif"
      fontSize="7.5"
      fill="#374151"
    >
      Late payment: prime + 2% per month.
    </text>
    <text
      x="132"
      y="415"
      fontFamily="'Trebuchet MS',sans-serif"
      fontSize="7"
      fill="#818cf8"
    >
      Axiom Advisory · 8 Dorp St, Stellenbosch · 021 555 0250
    </text>
    <text
      x="132"
      y="427"
      fontFamily="'Trebuchet MS',sans-serif"
      fontSize="7"
      fill="#818cf8"
    >
      www.axiomadvisory.co.za · hello@axiomadvisory.co.za
    </text>
  </svg>
);

const DetailedStatementSVG = () => (
  <svg
    viewBox="0 0 400 500"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-full"
  >
    <rect width="400" height="500" fill="#f0fdfa" />
    {/* Top bar */}
    <rect x="0" y="0" width="400" height="62" fill="#134e4a" />
    <rect x="0" y="62" width="400" height="5" fill="#0d9488" />

    <text
      x="18"
      y="26"
      fontFamily="'Courier New',monospace"
      fontSize="13"
      fontWeight="bold"
      fill="#99f6e4"
      letterSpacing="2"
    >
      BALANCE STATEMENT
    </text>
    <text
      x="18"
      y="44"
      fontFamily="'Courier New',monospace"
      fontSize="7"
      fill="#5eead4"
      letterSpacing="3"
    >
      MERIDIAN TAX &amp; ACCOUNTING SERVICES
    </text>
    <text
      x="18"
      y="58"
      fontFamily="'Courier New',monospace"
      fontSize="7"
      fill="#0d9488"
    >
      VAT: 4600334455 · 010 555 0700 · accounts@meridiantax.co.za
    </text>

    <rect
      x="290"
      y="8"
      width="104"
      height="46"
      rx="4"
      fill="#0f3d39"
      stroke="#0d9488"
      strokeWidth="1"
    />
    <text
      x="342"
      y="28"
      fontFamily="'Courier New',monospace"
      fontSize="7"
      fill="#5eead4"
      textAnchor="middle"
      letterSpacing="2"
    >
      STATEMENT
    </text>
    <text
      x="342"
      y="46"
      fontFamily="'Courier New',monospace"
      fontSize="10"
      fontWeight="bold"
      fill="white"
      textAnchor="middle"
    >
      #MTS-0018
    </text>

    {/* Account header */}
    <rect
      x="10"
      y="76"
      width="380"
      height="52"
      rx="3"
      fill="white"
      stroke="#99f6e4"
      strokeWidth="1"
    />
    <text
      x="20"
      y="92"
      fontFamily="'Courier New',monospace"
      fontSize="7"
      fill="#0d9488"
      letterSpacing="2"
    >
      ACCOUNT HOLDER
    </text>
    <text
      x="20"
      y="106"
      fontFamily="'Courier New',monospace"
      fontSize="9.5"
      fontWeight="bold"
      fill="#134e4a"
    >
      Greenleaf Property Investments (Pty) Ltd
    </text>
    <text
      x="20"
      y="120"
      fontFamily="'Courier New',monospace"
      fontSize="7.5"
      fill="#6b7280"
    >
      Attn: Mr. A. Steyn · 084 100 2200 · asteyn@greenleaf.co.za · 22 Riebeek
      St, CPT
    </text>
    <text
      x="310"
      y="92"
      fontFamily="'Courier New',monospace"
      fontSize="7"
      fill="#0d9488"
      letterSpacing="1"
    >
      STATEMENT DATE
    </text>
    <text
      x="310"
      y="106"
      fontFamily="'Courier New',monospace"
      fontSize="8.5"
      fontWeight="bold"
      fill="#134e4a"
    >
      30 Nov 2024
    </text>
    <rect x="310" y="112" width="72" height="14" rx="7" fill="#ccfbf1" />
    <text
      x="346"
      y="123"
      fontFamily="'Courier New',monospace"
      fontSize="7"
      fill="#0d9488"
      textAnchor="middle"
      fontWeight="bold"
    >
      OVERDUE ⚠
    </text>

    {/* Statement table */}
    <rect x="10" y="136" width="380" height="18" fill="#134e4a" rx="2" />
    <text
      x="18"
      y="148"
      fontFamily="'Courier New',monospace"
      fontSize="7"
      fill="#5eead4"
      letterSpacing="2"
    >
      TRANSACTION HISTORY — NOV 2024
    </text>
    <text
      x="230"
      y="148"
      fontFamily="'Courier New',monospace"
      fontSize="7"
      fill="#99f6e4"
    >
      DATE
    </text>
    <text
      x="285"
      y="148"
      fontFamily="'Courier New',monospace"
      fontSize="7"
      fill="#99f6e4"
    >
      DEBIT
    </text>
    <text
      x="338"
      y="148"
      fontFamily="'Courier New',monospace"
      fontSize="7"
      fill="white"
    >
      BALANCE
    </text>

    {[
      ["Balance b/f — 31 Oct 2024", "01 Nov", "—", "R 4,200"],
      ["Monthly Bookkeeping Service", "05 Nov", "R 6,800", "R 11,000"],
      ["VAT201 Filing — Oct period", "08 Nov", "R 1,500", "R 12,500"],
      ["Payment received — EFT", "12 Nov", "– R 4,200", "R 8,300"],
      ["EMP201 PAYE Submission", "15 Nov", "R 1,200", "R 9,500"],
      ["Provisional Tax Computation", "18 Nov", "R 3,500", "R 13,000"],
      ["Company Tax Return (ITR14)", "20 Nov", "R 5,400", "R 18,400"],
      ["Secretarial — Shareholders Mtg", "22 Nov", "R 2,800", "R 21,200"],
      ["Disbursements — CIPC filing fee", "25 Nov", "R 175", "R 21,375"],
      ["Credit note — duplicate charge", "28 Nov", "– R 500", "R 20,875"],
    ].map(([desc, date, debit, balance], i) => {
      const isCredit = debit.startsWith("–");
      return (
        <g key={i}>
          <rect
            x="10"
            y={158 + i * 19}
            width="380"
            height="19"
            fill={i % 2 === 0 ? "white" : "#f0fdfa"}
            stroke="#ccfbf1"
            strokeWidth="0.4"
          />
          <text
            x="18"
            y={172 + i * 19}
            fontFamily="'Courier New',monospace"
            fontSize="7.5"
            fill="#134e4a"
          >
            {desc}
          </text>
          <text
            x="232"
            y={172 + i * 19}
            fontFamily="'Courier New',monospace"
            fontSize="7"
            fill="#6b7280"
          >
            {date}
          </text>
          <text
            x="282"
            y={172 + i * 19}
            fontFamily="'Courier New',monospace"
            fontSize="7.5"
            fill={isCredit ? "#16a34a" : "#374151"}
            fontWeight={isCredit ? "bold" : "normal"}
          >
            {debit}
          </text>
          <text
            x="378"
            y={172 + i * 19}
            fontFamily="'Courier New',monospace"
            fontSize="7.5"
            fontWeight="bold"
            fill="#0d9488"
            textAnchor="end"
          >
            {balance}
          </text>
        </g>
      );
    })}

    {/* Aging summary */}
    <rect x="10" y="352" width="380" height="18" rx="2" fill="#0d9488" />
    <text
      x="18"
      y="364"
      fontFamily="'Courier New',monospace"
      fontSize="7"
      fill="white"
      letterSpacing="2"
    >
      AGING ANALYSIS
    </text>

    {[
      ["Current (0–30 days)", "#d1fae5", "#065f46", "R 20,875"],
      ["31–60 days", "#fef9c3", "#713f12", "R 0"],
      ["61+ days (overdue)", "#fee2e2", "#991b1b", "R 0"],
    ].map(([label, bg, col, val], i) => (
      <g key={i}>
        <rect
          x={10 + i * 128}
          y="374"
          width="124"
          height="26"
          rx="3"
          fill={bg}
          stroke="#99f6e4"
          strokeWidth="0.8"
        />
        <text
          x={68 + i * 128}
          y="385"
          fontFamily="'Courier New',monospace"
          fontSize="6.5"
          fill={col}
          textAnchor="middle"
        >
          {label}
        </text>
        <text
          x={68 + i * 128}
          y="396"
          fontFamily="'Courier New',monospace"
          fontSize="9"
          fontWeight="bold"
          fill={col}
          textAnchor="middle"
        >
          {val}
        </text>
      </g>
    ))}

    {/* Total outstanding */}
    <rect x="10" y="408" width="380" height="28" rx="3" fill="#134e4a" />
    <text
      x="20"
      y="427"
      fontFamily="'Courier New',monospace"
      fontSize="9"
      fontWeight="bold"
      fill="white"
    >
      TOTAL OUTSTANDING
    </text>
    <text
      x="380"
      y="428"
      fontFamily="'Courier New',monospace"
      fontSize="13"
      fontWeight="bold"
      fill="#5eead4"
      textAnchor="end"
    >
      R 20,875
    </text>
    <text
      x="380"
      y="432"
      fontFamily="'Courier New',monospace"
      fontSize="6.5"
      fill="#0d9488"
      textAnchor="end"
    >
      incl. VAT
    </text>

    {/* Footer */}
    <text
      x="18"
      y="452"
      fontFamily="'Courier New',monospace"
      fontSize="7"
      fill="#6b7280"
    >
      Queries: accounts@meridiantax.co.za · 010 555 0700 ext 3
    </text>
    <text
      x="18"
      y="465"
      fontFamily="'Courier New',monospace"
      fontSize="7"
      fill="#6b7280"
    >
      EFT: Meridian Tax · Nedbank · Br: 198 005 · Acc: 1023 334 552
    </text>
    <text
      x="18"
      y="478"
      fontFamily="'Courier New',monospace"
      fontSize="7"
      fill="#0d9488"
    >
      Use statement number as payment reference.
    </text>
    <text
      x="18"
      y="492"
      fontFamily="'Courier New',monospace"
      fontSize="6.5"
      fill="#134e4a"
    >
      Meridian Tax &amp; Accounting Services (Pty) Ltd · Reg: 2012/334411/07 ·
      Registered Tax Practitioner No: 19922
    </text>
  </svg>
);
