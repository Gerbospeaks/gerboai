// config/industryConfig.js
// Central config for every industry subdomain —
// landing page content, branding, features, pricing, testimonials, FAQs

export const INDUSTRY_CONFIG = {
  // ─── MECHANICS ──────────────────────────────────────────────────────────────
  mechanics: {
    subdomain: "mechanics",
    label: "Mechanics",
    headline: "Job Cards & Invoices Built for the Workshop",
    subheadline:
      "Stop writing by hand. SolidFlo gives your workshop professional job cards, quotes and invoices — ready to send in seconds.",
    cta: "Start Free — No Card Needed",
    color: "#111827",
    accent: "#f59e0b",
    accentDark: "#b45309",
    lightBg: "#fffbeb",
    icon: "🔧",
    features: [
      {
        icon: "📋",
        title: "Digital Job Cards",
        desc: "Capture vehicle details, pre-auth codes, mileage and work done — all in one place.",
      },
      {
        icon: "💸",
        title: "Instant Invoicing",
        desc: "Turn any job card into a professional invoice with one click. Include labour and parts separately.",
      },
      {
        icon: "🚗",
        title: "Vehicle History",
        desc: "Track every service per vehicle registration. Know exactly what was done and when.",
      },
      {
        icon: "📱",
        title: "Send via WhatsApp or Email",
        desc: "Share quotes and invoices directly from your phone. Clients can pay online instantly.",
      },
      {
        icon: "🏦",
        title: "Banking Details on Every Invoice",
        desc: "Auto-include your EFT details so clients know exactly how to pay.",
      },
      {
        icon: "📊",
        title: "Revenue Dashboard",
        desc: "See monthly income, outstanding invoices and top clients at a glance.",
      },
    ],
    pricing: [
      {
        name: "Starter",
        price: "Free",
        period: "",
        desc: "Perfect for solo mechanics",
        features: [
          "5 invoices/month",
          "Job cards",
          "PDF download",
          "Email support",
        ],
        cta: "Get Started",
        highlight: false,
      },
      {
        name: "Pro",
        price: "R299",
        period: "/mo",
        desc: "For busy workshops",
        features: [
          "Unlimited invoices",
          "Vehicle history",
          "WhatsApp sending",
          "Online payments",
          "Priority support",
        ],
        cta: "Start Free Trial",
        highlight: true,
      },
      {
        name: "Workshop",
        price: "R599",
        period: "/mo",
        desc: "Multi-bay operations",
        features: [
          "Everything in Pro",
          "Multiple staff logins",
          "Custom job card template",
          "Monthly reports",
          "Dedicated support",
        ],
        cta: "Contact Us",
        highlight: false,
      },
    ],
    testimonials: [
      {
        name: "Thabo M.",
        role: "Owner, TM Auto Repairs",
        quote:
          "I used to spend an hour a day doing paperwork. Now it takes 5 minutes. My clients are impressed with how professional everything looks.",
        avatar: "TM",
      },
      {
        name: "Riaan van Wyk",
        role: "Master Technician, Pretoria",
        quote:
          "The vehicle history feature alone is worth it. I can see exactly what I did on a car 6 months ago without digging through a pile of papers.",
        avatar: "RV",
      },
      {
        name: "Fatima Davids",
        role: "Workshop Manager, Cape Town",
        quote:
          "My mechanics send job cards from their phones now. No more lost paperwork and clients get their invoices same day.",
        avatar: "FD",
      },
    ],
    faqs: [
      {
        q: "Can I customise the job card template?",
        a: "Yes — Pro and Workshop plans let you add your logo, stamp, and custom fields.",
      },
      {
        q: "Do clients need an account to pay?",
        a: "No. They receive a link and can pay instantly via card, EFT or SnapScan with no login required.",
      },
      {
        q: "Can I track parts and labour separately?",
        a: "Yes. Each line item can be tagged as labour or parts, and the totals are broken out on the invoice.",
      },
      {
        q: "What if I already use a paper system?",
        a: "You can run both in parallel while you transition. Most workshops are fully digital within a week.",
      },
    ],
  },

  // ─── ACCOUNTING ─────────────────────────────────────────────────────────────
  accounting: {
    subdomain: "accounting",
    label: "Accounting",
    headline: "Invoicing Software Designed for Accountants",
    subheadline:
      "Send tax-compliant invoices, manage client billing and track payments — all from one clean dashboard.",
    cta: "Create Your Free Account",
    color: "#0f2744",
    accent: "#2563eb",
    accentDark: "#1d4ed8",
    lightBg: "#eff6ff",
    icon: "📊",
    features: [
      {
        icon: "🧾",
        title: "Tax-Compliant Invoices",
        desc: "VAT-ready invoices with all required fields — invoice number, tax breakdown, and supplier details.",
      },
      {
        icon: "📁",
        title: "Client Billing Profiles",
        desc: "Store billing info, payment history and outstanding balances per client.",
      },
      {
        icon: "📅",
        title: "Recurring Invoices",
        desc: "Set monthly retainer invoices to send automatically — never chase the same invoice twice.",
      },
      {
        icon: "📤",
        title: "Batch Sending",
        desc: "Send invoices to multiple clients at once at month-end with a single click.",
      },
      {
        icon: "📈",
        title: "Aged Debtors Report",
        desc: "See exactly who owes what and for how long — 30, 60, 90 days.",
      },
      {
        icon: "🏦",
        title: "EFT & Online Payments",
        desc: "Accept payment by EFT with auto-included banking details or via PayFast and Yoco.",
      },
    ],
    pricing: [
      {
        name: "Solo",
        price: "Free",
        period: "",
        desc: "For independent bookkeepers",
        features: [
          "10 invoices/month",
          "VAT invoices",
          "PDF export",
          "Email support",
        ],
        cta: "Get Started",
        highlight: false,
      },
      {
        name: "Practice",
        price: "R349",
        period: "/mo",
        desc: "For small accounting firms",
        features: [
          "Unlimited invoices",
          "Recurring billing",
          "Batch sending",
          "Aged debtors report",
          "Online payments",
        ],
        cta: "Start Free Trial",
        highlight: true,
      },
      {
        name: "Firm",
        price: "R699",
        period: "/mo",
        desc: "Multi-staff practices",
        features: [
          "Everything in Practice",
          "Staff logins",
          "Client portal",
          "Custom branding",
          "Priority support",
        ],
        cta: "Contact Us",
        highlight: false,
      },
    ],
    testimonials: [
      {
        name: "Priya Naidoo",
        role: "CA(SA), Durban",
        quote:
          "My month-end billing used to take a full day. With SolidFlo I'm done in under an hour. The recurring invoices are a game changer.",
        avatar: "PN",
      },
      {
        name: "Johan Botha",
        role: "Senior Bookkeeper, Johannesburg",
        quote:
          "The aged debtors report is exactly what I needed. I can see outstanding invoices at a glance and follow up the same day.",
        avatar: "JB",
      },
      {
        name: "Nompumelelo Dube",
        role: "Practice Manager, Pretoria",
        quote:
          "Professional invoices, sent instantly. My clients comment on how polished everything looks compared to what I sent before.",
        avatar: "ND",
      },
    ],
    faqs: [
      {
        q: "Are invoices VAT-compliant?",
        a: "Yes. Invoices include VAT number fields, tax breakdowns and all SARS-required fields for a valid tax invoice.",
      },
      {
        q: "Can I set up recurring monthly invoices?",
        a: "Yes — set a billing cycle once and invoices send automatically on your chosen date each month.",
      },
      {
        q: "Can multiple staff send invoices?",
        a: "The Firm plan supports multiple staff logins, each with their own sending history.",
      },
      {
        q: "Can I export to my accounting software?",
        a: "PDF and CSV exports are available on all plans. Direct integrations are on our roadmap.",
      },
    ],
  },

  // ─── HEALTHCARE / HEALTH ────────────────────────────────────────────────────
  healthcare: {
    subdomain: "healthcare",
    label: "Healthcare",
    headline: "Billing Made Simple for Healthcare Practices",
    subheadline:
      "Generate professional tax invoices and quotes for consultations, procedures and medical supplies — and get paid faster.",
    cta: "Start Billing for Free",
    color: "#064e3b",
    accent: "#10b981",
    accentDark: "#059669",
    lightBg: "#ecfdf5",
    icon: "🏥",
    features: [
      {
        icon: "🧾",
        title: "Medical Tax Invoices",
        desc: "ICD-10 code fields, procedure descriptions, and VAT — all on one compliant invoice.",
      },
      {
        icon: "💊",
        title: "Line-Item Billing",
        desc: "Bill consultations, medications and procedures separately with accurate totals.",
      },
      {
        icon: "📋",
        title: "Patient Quotes",
        desc: "Send quotes before treatment so patients know exactly what to expect.",
      },
      {
        icon: "🔒",
        title: "Confidential Records",
        desc: "Each patient's billing history is securely stored and easily retrievable.",
      },
      {
        icon: "📱",
        title: "Email & WhatsApp Delivery",
        desc: "Send invoices directly to patients via email or WhatsApp from any device.",
      },
      {
        icon: "💳",
        title: "Online Payment Links",
        desc: "Patients can pay instantly via card or EFT — no need to chase payments.",
      },
    ],
    pricing: [
      {
        name: "Solo",
        price: "Free",
        period: "",
        desc: "For individual practitioners",
        features: [
          "5 invoices/month",
          "Patient quotes",
          "PDF download",
          "Email support",
        ],
        cta: "Get Started",
        highlight: false,
      },
      {
        name: "Practice",
        price: "R349",
        period: "/mo",
        desc: "For small practices",
        features: [
          "Unlimited invoices",
          "ICD-10 fields",
          "Online payments",
          "Patient history",
          "Priority support",
        ],
        cta: "Start Free Trial",
        highlight: true,
      },
      {
        name: "Clinic",
        price: "R699",
        period: "/mo",
        desc: "Multi-practitioner clinics",
        features: [
          "Everything in Practice",
          "Multiple practitioners",
          "Custom invoice template",
          "Monthly billing reports",
          "Dedicated support",
        ],
        cta: "Contact Us",
        highlight: false,
      },
    ],
    testimonials: [
      {
        name: "Dr. Ayesha Moosa",
        role: "General Practitioner, Sandton",
        quote:
          "My admin used to take 2 hours after every session. SolidFlo cut that down to 15 minutes. Invoices look professional and go out same day.",
        avatar: "AM",
      },
      {
        name: "Sister Lindiwe Khumalo",
        role: "Private Nursing Practitioner",
        quote:
          "Patients appreciate getting a proper invoice immediately. Online payments mean I rarely have to follow up for money anymore.",
        avatar: "LK",
      },
      {
        name: "Dr. Pieter Venter",
        role: "Physiotherapist, Cape Town",
        quote:
          "The quote feature is brilliant. Patients know what they'll pay before they arrive, which removes so much awkwardness at billing time.",
        avatar: "PV",
      },
    ],
    faqs: [
      {
        q: "Can I add ICD-10 codes to invoices?",
        a: "Yes — there are dedicated fields for diagnosis codes, procedure codes and descriptions on every invoice.",
      },
      {
        q: "Is patient data kept private?",
        a: "All data is stored securely in Firebase with access restricted to your account only.",
      },
      {
        q: "Can I bill medical aids?",
        a: "You can generate the invoice with all required fields and send it to the medical aid directly from SolidFlo.",
      },
      {
        q: "Can multiple practitioners use the same account?",
        a: "The Clinic plan supports multiple practitioners, each with their own invoice history.",
      },
    ],
  },
  health: {
    subdomain: "health",
    label: "Healthcare",
    headline: "Billing Made Simple for Healthcare Practices",
    subheadline:
      "Generate professional tax invoices and quotes for consultations, procedures and medical supplies — and get paid faster.",
    cta: "Start Billing for Free",
    color: "#064e3b",
    accent: "#10b981",
    accentDark: "#059669",
    lightBg: "#ecfdf5",
    icon: "🏥",
    features: [],
    pricing: [],
    testimonials: [],
    faqs: [],
  },

  // ─── ELECTRICAL ─────────────────────────────────────────────────────────────
  electrical: {
    subdomain: "electrical",
    label: "Electrical",
    headline: "Quotes & Invoices for Electricians, Done in Minutes",
    subheadline:
      "From COC certificates to cable runs — generate professional electrical quotes and invoices from any device, on any job site.",
    cta: "Start Free Today",
    color: "#1c1917",
    accent: "#f59e0b",
    accentDark: "#d97706",
    lightBg: "#fef3c7",
    icon: "⚡",
    features: [
      {
        icon: "📋",
        title: "On-Site Quotes",
        desc: "Generate and send quotes from your phone while still on the customer's premises.",
      },
      {
        icon: "🔌",
        title: "Labour & Materials Split",
        desc: "List cable, fittings, DB boards and labour as separate line items — fully transparent billing.",
      },
      {
        icon: "✅",
        title: "COC Reference Tracking",
        desc: "Record Certificate of Compliance numbers against each completed job invoice.",
      },
      {
        icon: "📸",
        title: "Notes & Site Details",
        desc: "Add job site notes, phase details and any special instructions to each invoice.",
      },
      {
        icon: "💳",
        title: "Get Paid On Completion",
        desc: "Send a payment link the moment the job is done — no more waiting for EFTs to clear.",
      },
      {
        icon: "📊",
        title: "Job & Revenue Tracking",
        desc: "See all open jobs, quotes awaiting approval and monthly earnings at a glance.",
      },
    ],
    pricing: [
      {
        name: "Solo",
        price: "Free",
        period: "",
        desc: "For sole traders",
        features: [
          "5 invoices/month",
          "On-site quotes",
          "PDF download",
          "Email support",
        ],
        cta: "Get Started",
        highlight: false,
      },
      {
        name: "Pro",
        price: "R279",
        period: "/mo",
        desc: "For busy electricians",
        features: [
          "Unlimited invoices",
          "COC tracking",
          "Online payments",
          "Job history",
          "Priority support",
        ],
        cta: "Start Free Trial",
        highlight: true,
      },
      {
        name: "Team",
        price: "R549",
        period: "/mo",
        desc: "For electrical contractors",
        features: [
          "Everything in Pro",
          "Multiple staff",
          "Custom templates",
          "Revenue reports",
          "Dedicated support",
        ],
        cta: "Contact Us",
        highlight: false,
      },
    ],
    testimonials: [
      {
        name: "Deon Pretorius",
        role: "Master Electrician, Midrand",
        quote:
          "I quote on site, customer approves on the spot, and I invoice the moment I'm done. Cash flow has never been better.",
        avatar: "DP",
      },
      {
        name: "Siphiwe Nkosi",
        role: "Electrical Contractor, Soweto",
        quote:
          "Splitting materials and labour on the invoice makes my quotes look so much more professional. Clients trust the numbers.",
        avatar: "SN",
      },
      {
        name: "Leon Jacobs",
        role: "COC Electrician, Bellville",
        quote:
          "The COC tracking is a small feature that saves me big headaches. I know exactly which invoice ties to which certificate.",
        avatar: "LJ",
      },
    ],
    faqs: [
      {
        q: "Can I use this on a job site without Wi-Fi?",
        a: "You can prepare quotes offline and send them the moment you have signal.",
      },
      {
        q: "Can I attach photos or documents to invoices?",
        a: "You can add notes and reference numbers. Photo attachments are on our roadmap.",
      },
      {
        q: "Does it support three-phase billing?",
        a: "Yes — you can add any line item with any description, including phase-specific work.",
      },
      {
        q: "Can my office admin manage my invoices?",
        a: "The Team plan allows multiple logins with different access levels.",
      },
    ],
  },

  // ─── PLUMBING ────────────────────────────────────────────────────────────────
  plumbing: {
    subdomain: "plumbing",
    label: "Plumbing",
    headline: "Professional Invoicing for Plumbers",
    subheadline:
      "Quote fast, invoice faster. SolidFlo helps plumbers send professional quotes and get paid the same day the job is done.",
    cta: "Try SolidFlo Free",
    color: "#0c2340",
    accent: "#0ea5e9",
    accentDark: "#0284c7",
    lightBg: "#e0f2fe",
    icon: "🔩",
    features: [
      {
        icon: "📋",
        title: "Fast On-Site Quotes",
        desc: "Generate a professional quote from your phone in under 2 minutes, right in front of the client.",
      },
      {
        icon: "🔧",
        title: "Parts & Labour Billing",
        desc: "List geysers, pipes, fittings and call-out fees as separate line items.",
      },
      {
        icon: "📸",
        title: "Job Notes",
        desc: "Add site notes and special conditions so there's no dispute about what was agreed.",
      },
      {
        icon: "💳",
        title: "Same-Day Payments",
        desc: "Send a payment link on job completion. Accept card, EFT or PayFast.",
      },
      {
        icon: "📅",
        title: "Maintenance Reminders",
        desc: "Tag clients for follow-up and send maintenance quotes on schedule.",
      },
      {
        icon: "📊",
        title: "Outstanding Invoice Tracker",
        desc: "Never lose track of who still owes you — see all unpaid invoices in one view.",
      },
    ],
    pricing: [
      {
        name: "Starter",
        price: "Free",
        period: "",
        desc: "For sole traders",
        features: [
          "5 invoices/month",
          "On-site quotes",
          "PDF export",
          "Email support",
        ],
        cta: "Get Started",
        highlight: false,
      },
      {
        name: "Pro",
        price: "R279",
        period: "/mo",
        desc: "For busy plumbers",
        features: [
          "Unlimited invoices",
          "Online payments",
          "Client history",
          "Outstanding tracker",
          "Priority support",
        ],
        cta: "Start Free Trial",
        highlight: true,
      },
      {
        name: "Team",
        price: "R549",
        period: "/mo",
        desc: "For plumbing contractors",
        features: [
          "Everything in Pro",
          "Staff logins",
          "Custom templates",
          "Revenue reports",
          "Dedicated support",
        ],
        cta: "Contact Us",
        highlight: false,
      },
    ],
    testimonials: [
      {
        name: "André du Plessis",
        role: "Master Plumber, Centurion",
        quote:
          "I invoice before I even pack my van. By the time I'm home, the EFT is in my account. That never happened before.",
        avatar: "AP",
      },
      {
        name: "Nokwanda Zulu",
        role: "Plumbing Contractor, Durban",
        quote:
          "My clients appreciate the professional quotes. It sets expectations upfront and I have almost no payment disputes anymore.",
        avatar: "NZ",
      },
      {
        name: "Gerhard Smit",
        role: "Emergency Plumber, Johannesburg",
        quote:
          "The outstanding invoice tracker is brilliant. I used to forget about small jobs. Now nothing falls through the cracks.",
        avatar: "GS",
      },
    ],
    faqs: [
      {
        q: "Can I add a call-out fee to every invoice automatically?",
        a: "Yes — you can save line item templates that pre-populate on each new invoice.",
      },
      {
        q: "Can clients approve a quote before I start work?",
        a: "Yes — clients receive the quote by email or WhatsApp and can confirm it digitally.",
      },
      {
        q: "Does it work on my phone?",
        a: "SolidFlo is fully mobile-responsive. Create and send quotes from any smartphone.",
      },
      {
        q: "What payment methods can clients use?",
        a: "EFT (with your banking details on the invoice), PayFast (card & SnapScan), and Yoco.",
      },
    ],
  },

  // ─── SOLAR ───────────────────────────────────────────────────────────────────
  "solar-installation": {
    subdomain: "solar-installation",
    label: "Solar",
    headline: "Quotes & Invoices for Solar Installers",
    subheadline:
      "Win more installations with detailed, professional solar quotes. Invoice on completion and get paid without the admin headache.",
    cta: "Start Free Today",
    color: "#1a1200",
    accent: "#eab308",
    accentDark: "#ca8a04",
    lightBg: "#fefce8",
    icon: "☀️",
    features: [
      {
        icon: "🔆",
        title: "Detailed Solar Quotes",
        desc: "List panels, inverters, batteries, cabling, mounting and labour as clear line items.",
      },
      {
        icon: "📋",
        title: "System Specifications",
        desc: "Add system size (kWp), inverter brand, battery capacity and warranty terms to quotes.",
      },
      {
        icon: "📝",
        title: "Proposal-Style Estimates",
        desc: "Professional multi-page proposals that win clients over competitors.",
      },
      {
        icon: "✅",
        title: "Deposit & Final Invoicing",
        desc: "Send a deposit invoice, then a final invoice on completion — all tracked in one place.",
      },
      {
        icon: "💳",
        title: "Online Payments",
        desc: "Accept deposits by card or EFT. Reduce cancellations with upfront payment links.",
      },
      {
        icon: "📊",
        title: "Pipeline Dashboard",
        desc: "Track every quote, deposit and installation from enquiry to completion.",
      },
    ],
    pricing: [
      {
        name: "Starter",
        price: "Free",
        period: "",
        desc: "For new installers",
        features: [
          "5 quotes/month",
          "Line-item billing",
          "PDF export",
          "Email support",
        ],
        cta: "Get Started",
        highlight: false,
      },
      {
        name: "Pro",
        price: "R349",
        period: "/mo",
        desc: "For active installers",
        features: [
          "Unlimited quotes",
          "Deposit invoicing",
          "Online payments",
          "Pipeline tracker",
          "Priority support",
        ],
        cta: "Start Free Trial",
        highlight: true,
      },
      {
        name: "Company",
        price: "R699",
        period: "/mo",
        desc: "For solar companies",
        features: [
          "Everything in Pro",
          "Staff logins",
          "Custom proposals",
          "Revenue reports",
          "Dedicated support",
        ],
        cta: "Contact Us",
        highlight: false,
      },
    ],
    testimonials: [
      {
        name: "Brendan Fourie",
        role: "Solar Installer, Pretoria",
        quote:
          "My proposals used to take 3 hours in Word. SolidFlo gets them done in 20 minutes and they look ten times better.",
        avatar: "BF",
      },
      {
        name: "Yusuf Isaacs",
        role: "Solar Company Owner, Cape Town",
        quote:
          "Collecting deposits upfront changed everything. We went from 30% cancellations to almost zero since we started using payment links.",
        avatar: "YI",
      },
      {
        name: "Anelisa Mgxaji",
        role: "Solar Sales, East London",
        quote:
          "The pipeline view shows me exactly where every deal is. I know what to follow up and nothing gets forgotten.",
        avatar: "AM",
      },
    ],
    faqs: [
      {
        q: "Can I include technical specs in a quote?",
        a: "Yes — there is a notes section where you can add system specs, warranties and terms of installation.",
      },
      {
        q: "Can I send a deposit invoice separately from the final invoice?",
        a: "Yes — you can create multiple invoices per project and track each independently.",
      },
      {
        q: "Can clients sign off on a quote?",
        a: "Clients can confirm receipt and approval via the email link. Digital signature is on our roadmap.",
      },
      {
        q: "Can multiple sales reps use the platform?",
        a: "Yes — the Company plan supports multiple staff logins with individual invoice histories.",
      },
    ],
  },

  // ─── CARPENTRY ───────────────────────────────────────────────────────────────
  carpentry: {
    subdomain: "carpentry",
    label: "Carpentry",
    headline: "Invoicing Built for the Workshop, Not the Boardroom",
    subheadline:
      "Send professional quotes, track materials, and get paid on time — purpose-built for South African carpenters and joinery businesses.",
    cta: "Start Free Today",
    color: "#1A1208",
    accent: "#C67C3A",
    accentDark: "#9B5A20",
    lightBg: "#FAF5EE",
    icon: "🪵",
    features: [
      {
        icon: "📐",
        title: "Quote Builder",
        desc: "Create itemised quotes with timber grades, hardware costs, and labour — all in minutes.",
      },
      {
        icon: "🪚",
        title: "Job Cost Tracking",
        desc: "Log materials per project so you always know what a job actually costs you.",
      },
      {
        icon: "🗂️",
        title: "Client Records",
        desc: "Keep full histories of every client, project, and payment in one place.",
      },
      {
        icon: "💳",
        title: "Instant Payments",
        desc: "Accept EFT, PayFast, or SnapScan with payment links on every invoice.",
      },
      {
        icon: "📦",
        title: "Stock & Materials",
        desc: "Track sheet goods, solid timber, and consumables across your projects.",
      },
      {
        icon: "📊",
        title: "Business Reports",
        desc: "Monthly revenue, outstanding balances, and job profitability at a glance.",
      },
    ],
    pricing: [
      {
        name: "Starter",
        price: "Free",
        period: "",
        desc: "For sole traders just getting started",
        features: [
          "5 invoices/month",
          "Basic quote builder",
          "Client records",
          "PDF export",
        ],
        cta: "Get Started Free",
        highlight: false,
      },
      {
        name: "Craftsman",
        price: "R299",
        period: "/mo",
        desc: "For established carpentry businesses",
        features: [
          "Unlimited invoices & quotes",
          "Job cost tracking",
          "Material stock log",
          "Payment links (EFT, PayFast)",
          "Monthly reports",
          "Email & WhatsApp delivery",
        ],
        cta: "Start 14-Day Trial",
        highlight: true,
      },
      {
        name: "Workshop",
        price: "R599",
        period: "/mo",
        desc: "For joinery shops with multiple staff",
        features: [
          "Everything in Craftsman",
          "Up to 5 users",
          "Multi-job dashboard",
          "Priority support",
          "Custom invoice branding",
          "Xero / QuickBooks sync",
        ],
        cta: "Contact Sales",
        highlight: false,
      },
    ],
    testimonials: [
      {
        name: "Riaan van der Merwe",
        role: "Custom Furniture, Cape Town",
        quote:
          "I used to spend Sunday evenings writing quotes in Word. Now I send them from site in under 5 minutes. Clients love how professional they look.",
        avatar: "RV",
      },
      {
        name: "Themba Nkosi",
        role: "Kitchen Installations, Joburg",
        quote:
          "The material cost tracker alone saved my business. I was underquoting badly. Now I know exactly what every job costs before I start.",
        avatar: "TN",
      },
      {
        name: "André Botha",
        role: "Joinery & Shopfitting, Pretoria",
        quote:
          "My outstanding invoices dropped by 60% in the first month. The payment link on the invoice just makes it too easy for clients to pay.",
        avatar: "AB",
      },
    ],
    faqs: [
      {
        q: "Is SolidFlo built specifically for carpentry?",
        a: "Yes. The quote templates, material tracking fields, and job costing tools are all designed around how carpentry and joinery businesses actually work.",
      },
      {
        q: "Can I use it on site from my phone?",
        a: "Absolutely. SolidFlo is fully mobile-responsive. You can create and send quotes directly from a job site, no laptop needed.",
      },
      {
        q: "Does it handle VAT automatically?",
        a: "Yes. You can set VAT-inclusive or exclusive pricing per quote, and it calculates everything correctly for SARS compliance.",
      },
      {
        q: "What if I have an apprentice or office assistant?",
        a: "The Workshop plan supports up to 5 users, each with their own login and permissions.",
      },
    ],
  },

  // ─── CLEANING ────────────────────────────────────────────────────────────────
  cleaning: {
    subdomain: "cleaning",
    label: "Cleaning",
    headline: "Invoicing & Scheduling for Cleaning Businesses",
    subheadline:
      "Manage recurring clients, send professional invoices, and get paid on time — built for cleaning companies across South Africa.",
    cta: "Start Free Today",
    color: "#0f2744",
    accent: "#06b6d4",
    accentDark: "#0891b2",
    lightBg: "#ecfeff",
    icon: "🧹",
    features: [
      {
        icon: "🔁",
        title: "Recurring Invoices",
        desc: "Set weekly or monthly cleaning invoices to go out automatically. Never miss a billing cycle.",
      },
      {
        icon: "📋",
        title: "Service Checklists",
        desc: "Attach cleaning checklists to jobs so clients know exactly what was done.",
      },
      {
        icon: "📍",
        title: "Multi-Site Clients",
        desc: "Bill different rates for different properties under the same client.",
      },
      {
        icon: "💳",
        title: "EFT & Card Payments",
        desc: "Include payment links on every invoice. Get paid faster with zero chasing.",
      },
      {
        icon: "👥",
        title: "Staff Job Assignments",
        desc: "Assign cleaning teams to jobs and track completion from your phone.",
      },
      {
        icon: "📊",
        title: "Revenue Dashboard",
        desc: "Track monthly revenue, outstanding balances and your most profitable clients.",
      },
    ],
    pricing: [
      {
        name: "Starter",
        price: "Free",
        period: "",
        desc: "For solo cleaners",
        features: [
          "5 invoices/month",
          "Basic scheduling",
          "PDF export",
          "Email support",
        ],
        cta: "Get Started",
        highlight: false,
      },
      {
        name: "Pro",
        price: "R279",
        period: "/mo",
        desc: "For growing cleaning businesses",
        features: [
          "Unlimited invoices",
          "Recurring billing",
          "Multi-site clients",
          "Online payments",
          "Priority support",
        ],
        cta: "Start Free Trial",
        highlight: true,
      },
      {
        name: "Company",
        price: "R549",
        period: "/mo",
        desc: "For cleaning companies with teams",
        features: [
          "Everything in Pro",
          "Staff logins",
          "Job assignments",
          "Revenue reports",
          "Dedicated support",
        ],
        cta: "Contact Us",
        highlight: false,
      },
    ],
    testimonials: [
      {
        name: "Zanele Mokoena",
        role: "Owner, ZM Cleaning Services, Joburg",
        quote:
          "Recurring invoices changed my business. I set them up once and clients pay automatically. I don't chase anyone anymore.",
        avatar: "ZM",
      },
      {
        name: "Pieter Louw",
        role: "Commercial Cleaning, Pretoria",
        quote:
          "Managing 15 client sites was a nightmare in spreadsheets. SolidFlo makes it simple to bill each property at the right rate.",
        avatar: "PL",
      },
      {
        name: "Thandiwe Cele",
        role: "Residential Cleaner, Durban",
        quote:
          "My clients trust me more since I started sending proper invoices. It feels like a real business now.",
        avatar: "TC",
      },
    ],
    faqs: [
      {
        q: "Can I bill different clients at different rates?",
        a: "Yes — each client can have their own pricing, and you can create separate line items for different services.",
      },
      {
        q: "Can I set up weekly recurring invoices?",
        a: "Yes — choose daily, weekly, bi-weekly or monthly billing cycles per client.",
      },
      {
        q: "Can my staff use the app?",
        a: "The Company plan supports multiple staff logins with job-level access.",
      },
      {
        q: "Can clients pay by card?",
        a: "Yes — payment links via PayFast and Yoco are included on Pro and Company plans.",
      },
    ],
  },

  // ─── CONSTRUCTION ────────────────────────────────────────────────────────────
  construction: {
    subdomain: "construction",
    label: "Construction",
    headline: "Professional Invoicing for Construction Companies",
    subheadline:
      "Manage project billing, track subcontractors, and invoice clients at every stage — from foundation to final handover.",
    cta: "Start Free Today",
    color: "#1c1410",
    accent: "#ea580c",
    accentDark: "#c2410c",
    lightBg: "#fff7ed",
    icon: "🏗️",
    features: [
      {
        icon: "📋",
        title: "Progress Billing",
        desc: "Invoice clients at project milestones — deposit, mid-project, and final.",
      },
      {
        icon: "🧱",
        title: "Materials & Labour Split",
        desc: "Itemise bricks, steel, concrete, plant hire and labour separately on every invoice.",
      },
      {
        icon: "📁",
        title: "Project File",
        desc: "Keep all quotes, invoices and variation orders for each project in one place.",
      },
      {
        icon: "📝",
        title: "Variation Orders",
        desc: "Create and send variation order documentation for out-of-scope work.",
      },
      {
        icon: "💳",
        title: "Large Payment Handling",
        desc: "Support for high-value invoices with EFT and bank transfer details included.",
      },
      {
        icon: "📊",
        title: "Project Profitability",
        desc: "Track costs vs billed amounts to know exactly where you stand on each job.",
      },
    ],
    pricing: [
      {
        name: "Starter",
        price: "Free",
        period: "",
        desc: "For small contractors",
        features: [
          "5 invoices/month",
          "Progress billing",
          "PDF export",
          "Email support",
        ],
        cta: "Get Started",
        highlight: false,
      },
      {
        name: "Builder",
        price: "R349",
        period: "/mo",
        desc: "For active construction businesses",
        features: [
          "Unlimited invoices",
          "Variation orders",
          "Project files",
          "Online payments",
          "Priority support",
        ],
        cta: "Start Free Trial",
        highlight: true,
      },
      {
        name: "Contractor",
        price: "R699",
        period: "/mo",
        desc: "For construction companies",
        features: [
          "Everything in Builder",
          "Staff logins",
          "Custom templates",
          "Profitability reports",
          "Dedicated support",
        ],
        cta: "Contact Us",
        highlight: false,
      },
    ],
    testimonials: [
      {
        name: "Bongani Zulu",
        role: "Building Contractor, Gauteng",
        quote:
          "Progress billing used to be a mess of spreadsheets and emails. Now I track everything in SolidFlo and my clients always know what they're paying for.",
        avatar: "BZ",
      },
      {
        name: "Henk du Toit",
        role: "Civil Contractor, Western Cape",
        quote:
          "Variation orders were always a headache. SolidFlo makes it quick to document and get approval before I start extra work.",
        avatar: "HD",
      },
      {
        name: "Lerato Sithole",
        role: "Building Renovations, Pretoria",
        quote:
          "I've cut my invoicing time in half. The project file keeps everything neat and clients respect how organised I am now.",
        avatar: "LS",
      },
    ],
    faqs: [
      {
        q: "Can I invoice in stages for a single project?",
        a: "Yes — create multiple invoices per project and tag them as deposit, progress or final.",
      },
      {
        q: "Can I send variation orders digitally?",
        a: "Yes — variation orders can be created, sent and acknowledged through the platform.",
      },
      {
        q: "Does it handle large invoice amounts?",
        a: "Yes — there are no invoice amount limits. Banking details are always included for EFT.",
      },
      {
        q: "Can I add subcontractor costs to a project?",
        a: "Yes — add any cost as a line item, including subcontractor fees, to track project margins.",
      },
    ],
  },

  // ─── EDUCATION ───────────────────────────────────────────────────────────────
  education: {
    subdomain: "education",
    label: "Education",
    headline: "School Management Made Easy for Schools & Tutors",
    subheadline:
      "Send term fees, tuition invoices and ad hoc charges professionally — and give parents a simple way to pay.",
    cta: "Start Free Today",
    color: "#1e1b4b",
    accent: "#7c3aed",
    accentDark: "#6d28d9",
    lightBg: "#f5f3ff",
    icon: "🎓",
    features: [
      {
        icon: "📚",
        title: "Term Fee Invoices",
        desc: "Generate term invoices per learner with a single click — no manual entry needed.",
      },
      {
        icon: "👨‍👩‍👧",
        title: "Parent Portal",
        desc: "Parents view and pay outstanding invoices from a secure link — no app download needed.",
      },
      {
        icon: "🔁",
        title: "Recurring Tuition Billing",
        desc: "Set up monthly tuition fees to send automatically on the same date every month.",
      },
      {
        icon: "📊",
        title: "Fee Tracking Dashboard",
        desc: "See who has paid, who is outstanding, and total collected this term at a glance.",
      },
      {
        icon: "💳",
        title: "Online Payments",
        desc: "Parents pay via card, EFT or SnapScan directly from the invoice link.",
      },
      {
        icon: "📄",
        title: "Receipts & Statements",
        desc: "Issue payment receipts and full account statements per learner.",
      },
    ],
    pricing: [
      {
        name: "Starter",
        price: "Free",
        period: "",
        desc: "For independent tutors",
        features: [
          "10 invoices/month",
          "Parent portal",
          "PDF export",
          "Email support",
        ],
        cta: "Get Started",
        highlight: false,
      },
      {
        name: "School",
        price: "R349",
        period: "/mo",
        desc: "For small schools & academies",
        features: [
          "Unlimited invoices",
          "Recurring billing",
          "Online payments",
          "Fee tracker",
          "Priority support",
        ],
        cta: "Start Free Trial",
        highlight: true,
      },
      {
        name: "Campus",
        price: "R699",
        period: "/mo",
        desc: "For larger institutions",
        features: [
          "Everything in School",
          "Multiple staff",
          "Bulk invoicing",
          "Financial reports",
          "Dedicated support",
        ],
        cta: "Contact Us",
        highlight: false,
      },
    ],
    testimonials: [
      {
        name: "Mrs. Thandi Dlamini",
        role: "Principal, Dlamini Private Academy",
        quote:
          "Collecting fees used to take our admin staff a full week. Now invoices go out in one click and parents pay the same day.",
        avatar: "TD",
      },
      {
        name: "Craig Olivier",
        role: "Maths Tutor, Cape Town",
        quote:
          "The recurring billing is perfect for my monthly students. I set it up once and I never have to think about it again.",
        avatar: "CO",
      },
      {
        name: "Nomsa Khumalo",
        role: "Aftercare Centre, Soweto",
        quote:
          "Parents appreciate the professional invoices. It's made my small aftercare look like a proper school.",
        avatar: "NK",
      },
    ],
    faqs: [
      {
        q: "Can I bill per learner?",
        a: "Yes — each learner has their own profile and invoices are generated and tracked individually.",
      },
      {
        q: "Can parents pay online?",
        a: "Yes — each invoice has a secure payment link that parents can use to pay by card, EFT or SnapScan.",
      },
      {
        q: "Can I set up different fees for different grades?",
        a: "Yes — create fee templates per grade and apply them in bulk at the start of each term.",
      },
      {
        q: "Is learner data kept private?",
        a: "Yes — all data is stored securely and only accessible by authorised staff.",
      },
    ],
  },

  // ─── HOTEL / HOSPITALITY ─────────────────────────────────────────────────────
  hotel: {
    subdomain: "hotel",
    label: "Hospitality",
    headline: "Professional Invoicing for Guesthouses & Hotels",
    subheadline:
      "Issue guest invoices, manage deposits, and track accommodation revenue — built for South African hospitality businesses.",
    cta: "Start Free Today",
    color: "#1a0f0a",
    accent: "#b45309",
    accentDark: "#92400e",
    lightBg: "#fef3c7",
    icon: "🏨",
    features: [
      {
        icon: "🛏️",
        title: "Guest Invoices",
        desc: "Generate itemised invoices including accommodation, meals, and extras for each guest.",
      },
      {
        icon: "💰",
        title: "Deposit Billing",
        desc: "Send deposit invoices at booking and final invoices on checkout.",
      },
      {
        icon: "📅",
        title: "Booking Reference Tracking",
        desc: "Link every invoice to a booking reference for clean record-keeping.",
      },
      {
        icon: "💳",
        title: "Online & EFT Payments",
        desc: "Guests pay via card or EFT from a secure payment link on the invoice.",
      },
      {
        icon: "📊",
        title: "Revenue Reports",
        desc: "Track monthly room revenue, occupancy billing, and outstanding balances.",
      },
      {
        icon: "📄",
        title: "Proforma Quotes",
        desc: "Send proforma invoices for group bookings and corporate guests.",
      },
    ],
    pricing: [
      {
        name: "Starter",
        price: "Free",
        period: "",
        desc: "For B&Bs and small guesthouses",
        features: [
          "5 invoices/month",
          "Deposit billing",
          "PDF export",
          "Email support",
        ],
        cta: "Get Started",
        highlight: false,
      },
      {
        name: "Property",
        price: "R299",
        period: "/mo",
        desc: "For active guesthouses & lodges",
        features: [
          "Unlimited invoices",
          "Booking references",
          "Online payments",
          "Revenue reports",
          "Priority support",
        ],
        cta: "Start Free Trial",
        highlight: true,
      },
      {
        name: "Hotel",
        price: "R599",
        period: "/mo",
        desc: "For larger properties & groups",
        features: [
          "Everything in Property",
          "Staff logins",
          "Group invoicing",
          "Custom templates",
          "Dedicated support",
        ],
        cta: "Contact Us",
        highlight: false,
      },
    ],
    testimonials: [
      {
        name: "Marié van Zyl",
        role: "Owner, Karoo Guesthouse",
        quote:
          "I used to email Word documents as invoices. Now guests receive a professional invoice with a payment link. It looks so much better.",
        avatar: "MV",
      },
      {
        name: "Sipho Hadebe",
        role: "Lodge Manager, Mpumalanga",
        quote:
          "Deposit invoicing has completely stopped no-shows. Guests take their booking seriously once they've paid a deposit.",
        avatar: "SH",
      },
      {
        name: "Colette Rousseau",
        role: "B&B Owner, Franschhoek",
        quote:
          "The revenue reports give me a clear picture of every month. I know exactly which months to plan for and which need a push.",
        avatar: "CR",
      },
    ],
    faqs: [
      {
        q: "Can I send a deposit invoice and a final invoice?",
        a: "Yes — create as many invoices per booking as you need and track each one separately.",
      },
      {
        q: "Can I add extras like meals or tours to an invoice?",
        a: "Yes — add any service as a line item on any guest invoice.",
      },
      {
        q: "Can corporate clients get monthly statements?",
        a: "Yes — generate and send full account statements for any client on request.",
      },
      {
        q: "Does it support foreign guest billing?",
        a: "You can invoice in ZAR and include your banking details for international transfers.",
      },
    ],
  },

  // ─── HVAC ────────────────────────────────────────────────────────────────────
  hvac: {
    subdomain: "hvac",
    label: "HVAC",
    headline: "Quotes & Invoices for HVAC Technicians",
    subheadline:
      "From split unit installations to full building HVAC systems — send professional quotes and get paid on completion.",
    cta: "Start Free Today",
    color: "#0c1a2e",
    accent: "#38bdf8",
    accentDark: "#0284c7",
    lightBg: "#e0f2fe",
    icon: "❄️",
    features: [
      {
        icon: "📋",
        title: "Installation Quotes",
        desc: "Itemise units, refrigerant, materials, labour and call-out fees on every quote.",
      },
      {
        icon: "🔧",
        title: "Service & Maintenance Billing",
        desc: "Create recurring service contracts and bill clients monthly or annually.",
      },
      {
        icon: "✅",
        title: "Job Completion Invoices",
        desc: "Invoice immediately on job completion with a payment link for instant payment.",
      },
      {
        icon: "📦",
        title: "Parts & Equipment Tracking",
        desc: "Track HVAC components used per job for accurate costing.",
      },
      {
        icon: "💳",
        title: "Online Payments",
        desc: "Accept card, EFT or SnapScan directly from the invoice link.",
      },
      {
        icon: "📊",
        title: "Job & Revenue Tracking",
        desc: "See all open jobs, pending quotes and monthly revenue in one view.",
      },
    ],
    pricing: [
      {
        name: "Solo",
        price: "Free",
        period: "",
        desc: "For independent HVAC techs",
        features: [
          "5 invoices/month",
          "Installation quotes",
          "PDF export",
          "Email support",
        ],
        cta: "Get Started",
        highlight: false,
      },
      {
        name: "Pro",
        price: "R299",
        period: "/mo",
        desc: "For busy HVAC businesses",
        features: [
          "Unlimited invoices",
          "Service contracts",
          "Online payments",
          "Job tracking",
          "Priority support",
        ],
        cta: "Start Free Trial",
        highlight: true,
      },
      {
        name: "Company",
        price: "R599",
        period: "/mo",
        desc: "For HVAC companies",
        features: [
          "Everything in Pro",
          "Staff logins",
          "Custom templates",
          "Revenue reports",
          "Dedicated support",
        ],
        cta: "Contact Us",
        highlight: false,
      },
    ],
    testimonials: [
      {
        name: "Jaco Visser",
        role: "HVAC Technician, Pretoria",
        quote:
          "I send the invoice while I'm still packing my tools. By the time I'm back at the office, it's often already paid.",
        avatar: "JV",
      },
      {
        name: "Nomvula Dlamini",
        role: "HVAC Contractor, Johannesburg",
        quote:
          "Service contract billing is now fully automatic. I don't have to remember to invoice anyone anymore.",
        avatar: "ND",
      },
      {
        name: "Dewald Steyn",
        role: "Commercial HVAC, Cape Town",
        quote:
          "Clients appreciate detailed quotes that break down every component. It builds trust and I win more tenders.",
        avatar: "DS",
      },
    ],
    faqs: [
      {
        q: "Can I set up annual service contract billing?",
        a: "Yes — create recurring invoices on any schedule, including annually.",
      },
      {
        q: "Can I include warranty details on invoices?",
        a: "Yes — use the notes section to add warranty terms, service intervals and any other details.",
      },
      {
        q: "Does it work on site without an office computer?",
        a: "Yes — SolidFlo is fully mobile. Create and send invoices from your phone or tablet.",
      },
      {
        q: "Can my admin manage invoices for me?",
        a: "The Company plan supports multiple staff logins with appropriate access levels.",
      },
    ],
  },

  // ─── LANDSCAPING ─────────────────────────────────────────────────────────────
  landscaping: {
    subdomain: "landscaping",
    label: "Landscaping",
    headline: "Professional Invoicing for Landscapers & Garden Services",
    subheadline:
      "Quote for new gardens, invoice for ongoing maintenance, and get paid on time — built for South African landscaping businesses.",
    cta: "Start Free Today",
    color: "#14280a",
    accent: "#65a30d",
    accentDark: "#4d7c0f",
    lightBg: "#f7fee7",
    icon: "🌿",
    features: [
      {
        icon: "🌳",
        title: "Garden Design Quotes",
        desc: "Create detailed landscaping quotes with plants, materials, paving and labour.",
      },
      {
        icon: "🔁",
        title: "Recurring Maintenance Invoices",
        desc: "Set up monthly garden service invoices that go out automatically.",
      },
      {
        icon: "📍",
        title: "Multi-Property Clients",
        desc: "Manage multiple properties per client and bill each at the right rate.",
      },
      {
        icon: "💳",
        title: "Same-Day Payments",
        desc: "Send payment links on completion. Accept card, EFT or SnapScan.",
      },
      {
        icon: "📋",
        title: "Service Records",
        desc: "Keep a log of every service visit and what was done at each property.",
      },
      {
        icon: "📊",
        title: "Revenue Dashboard",
        desc: "Track monthly income, outstanding invoices and your most profitable clients.",
      },
    ],
    pricing: [
      {
        name: "Starter",
        price: "Free",
        period: "",
        desc: "For solo gardeners",
        features: [
          "5 invoices/month",
          "Garden quotes",
          "PDF export",
          "Email support",
        ],
        cta: "Get Started",
        highlight: false,
      },
      {
        name: "Pro",
        price: "R279",
        period: "/mo",
        desc: "For active landscaping businesses",
        features: [
          "Unlimited invoices",
          "Recurring billing",
          "Multi-property",
          "Online payments",
          "Priority support",
        ],
        cta: "Start Free Trial",
        highlight: true,
      },
      {
        name: "Company",
        price: "R549",
        period: "/mo",
        desc: "For landscaping companies",
        features: [
          "Everything in Pro",
          "Staff logins",
          "Team scheduling",
          "Revenue reports",
          "Dedicated support",
        ],
        cta: "Contact Us",
        highlight: false,
      },
    ],
    testimonials: [
      {
        name: "Karel Mostert",
        role: "Garden Services, Stellenbosch",
        quote:
          "Recurring invoices for my 40 weekly clients used to take me a whole Friday. Now it's done automatically before I wake up.",
        avatar: "KM",
      },
      {
        name: "Sibusiso Ndlovu",
        role: "Landscaping Contractor, Durban",
        quote:
          "The detailed quotes have helped me win bigger design projects. Clients can see exactly what they're getting.",
        avatar: "SN",
      },
      {
        name: "Anri Bekker",
        role: "Garden Design, Pretoria",
        quote:
          "Managing multiple properties per client was chaos before. SolidFlo makes it clean and professional.",
        avatar: "AB",
      },
    ],
    faqs: [
      {
        q: "Can I invoice per visit or per month?",
        a: "Yes — set up per-visit invoices or monthly retainer billing, depending on your agreement with the client.",
      },
      {
        q: "Can I include plant lists in quotes?",
        a: "Yes — add any item as a line item, including specific plants, trees and materials.",
      },
      {
        q: "Can I manage a team of gardeners?",
        a: "The Company plan supports multiple staff logins and job assignment tracking.",
      },
      {
        q: "Does it work on a phone at the client's garden?",
        a: "Yes — fully mobile. Create and send invoices from anywhere.",
      },
    ],
  },

  // ─── LEGAL ───────────────────────────────────────────────────────────────────
  legal: {
    subdomain: "legal",
    label: "Legal",
    headline: "Time Billing & Invoicing for South African Law Practices",
    subheadline:
      "Track billable hours, generate fee accounts, and get paid faster — built for attorneys, advocates and legal consultants.",
    cta: "Start Free Today",
    color: "#0f1729",
    accent: "#6366f1",
    accentDark: "#4f46e5",
    lightBg: "#eef2ff",
    icon: "⚖️",
    features: [
      {
        icon: "⏱️",
        title: "Time & Fee Tracking",
        desc: "Log billable hours and disbursements per matter for accurate fee accounts.",
      },
      {
        icon: "📄",
        title: "Professional Fee Accounts",
        desc: "Generate compliant fee accounts with matter references, time entries and VAT.",
      },
      {
        icon: "📁",
        title: "Matter Management",
        desc: "Keep all invoices, quotes and correspondence organised per matter.",
      },
      {
        icon: "💳",
        title: "Online Payments",
        desc: "Include payment links for EFT and card on every fee account.",
      },
      {
        icon: "📊",
        title: "Aged Debtors Report",
        desc: "See exactly which matters have outstanding fees and for how long.",
      },
      {
        icon: "🔁",
        title: "Retainer Billing",
        desc: "Set up automatic monthly retainer invoices for ongoing client relationships.",
      },
    ],
    pricing: [
      {
        name: "Solo",
        price: "Free",
        period: "",
        desc: "For solo practitioners",
        features: [
          "10 invoices/month",
          "Matter management",
          "PDF export",
          "Email support",
        ],
        cta: "Get Started",
        highlight: false,
      },
      {
        name: "Practice",
        price: "R399",
        period: "/mo",
        desc: "For small law firms",
        features: [
          "Unlimited fee accounts",
          "Time tracking",
          "Retainer billing",
          "Aged debtors",
          "Priority support",
        ],
        cta: "Start Free Trial",
        highlight: true,
      },
      {
        name: "Firm",
        price: "R799",
        period: "/mo",
        desc: "For multi-attorney firms",
        features: [
          "Everything in Practice",
          "Multiple attorneys",
          "Custom branding",
          "Financial reports",
          "Dedicated support",
        ],
        cta: "Contact Us",
        highlight: false,
      },
    ],
    testimonials: [
      {
        name: "Adv. Siyanda Mthembu",
        role: "Advocate, Johannesburg Bar",
        quote:
          "Billing used to be the part of practice I dreaded most. SolidFlo makes it quick and my fee accounts look completely professional.",
        avatar: "SM",
      },
      {
        name: "Liesl van Niekerk",
        role: "Attorney, Cape Town",
        quote:
          "The retainer billing means I never forget to invoice my monthly clients. It's completely automated.",
        avatar: "LV",
      },
      {
        name: "Rajesh Pillay",
        role: "Commercial Law, Durban",
        quote:
          "The aged debtors report gives me a clear picture of outstanding fees. I follow up immediately instead of months later.",
        avatar: "RP",
      },
    ],
    faqs: [
      {
        q: "Are fee accounts VAT-compliant?",
        a: "Yes — all required SARS fields are included, including VAT registration number and tax breakdown.",
      },
      {
        q: "Can I track disbursements separately?",
        a: "Yes — add disbursements as separate line items on any fee account.",
      },
      {
        q: "Can multiple attorneys use the same account?",
        a: "The Firm plan supports individual attorney logins with their own billing history.",
      },
      {
        q: "Can clients pay online?",
        a: "Yes — payment links for EFT and card are included on every fee account.",
      },
    ],
  },

  // ─── LOGISTICS ───────────────────────────────────────────────────────────────
  logistics: {
    subdomain: "logistics",
    label: "Logistics",
    headline: "Invoicing & Trip Billing for Logistics Companies",
    subheadline:
      "Invoice per trip, per load or per contract — and get paid faster with professional delivery invoices and payment links.",
    cta: "Start Free Today",
    color: "#111827",
    accent: "#f97316",
    accentDark: "#ea580c",
    lightBg: "#fff7ed",
    icon: "🚛",
    features: [
      {
        icon: "🗺️",
        title: "Per-Trip Invoicing",
        desc: "Bill per delivery, per km, or per load with flexible line item structures.",
      },
      {
        icon: "📦",
        title: "Load & Cargo Details",
        desc: "Include cargo descriptions, weight, collection and delivery addresses on invoices.",
      },
      {
        icon: "📋",
        title: "Contract Billing",
        desc: "Set up monthly contract invoices for long-term logistics clients.",
      },
      {
        icon: "💳",
        title: "Fast Payment Links",
        desc: "Send payment links via WhatsApp immediately on delivery.",
      },
      {
        icon: "📊",
        title: "Route Revenue Tracking",
        desc: "See which routes and clients generate the most revenue.",
      },
      {
        icon: "🧾",
        title: "Fuel Levy & Surcharge Lines",
        desc: "Add fuel levies, toll fees and surcharges as separate line items.",
      },
    ],
    pricing: [
      {
        name: "Starter",
        price: "Free",
        period: "",
        desc: "For owner-drivers",
        features: [
          "5 invoices/month",
          "Trip billing",
          "PDF export",
          "Email support",
        ],
        cta: "Get Started",
        highlight: false,
      },
      {
        name: "Fleet",
        price: "R299",
        period: "/mo",
        desc: "For small logistics companies",
        features: [
          "Unlimited invoices",
          "Contract billing",
          "Online payments",
          "Route tracking",
          "Priority support",
        ],
        cta: "Start Free Trial",
        highlight: true,
      },
      {
        name: "Company",
        price: "R599",
        period: "/mo",
        desc: "For logistics operations",
        features: [
          "Everything in Fleet",
          "Staff logins",
          "Custom templates",
          "Revenue reports",
          "Dedicated support",
        ],
        cta: "Contact Us",
        highlight: false,
      },
    ],
    testimonials: [
      {
        name: "Musa Khoza",
        role: "Owner-Driver, Gauteng",
        quote:
          "I used to wait weeks for payment. Now I send the invoice the moment the delivery is done and I get paid the same day.",
        avatar: "MK",
      },
      {
        name: "Ronel Fourie",
        role: "Logistics Manager, Durban",
        quote:
          "Our contract clients now receive invoices automatically every month. It's saved us hours of admin time.",
        avatar: "RF",
      },
      {
        name: "Dumisani Nkosi",
        role: "Freight Contractor, Johannesburg",
        quote:
          "Breaking out fuel levies and toll fees as separate lines has made our invoices completely transparent. No more disputes.",
        avatar: "DN",
      },
    ],
    faqs: [
      {
        q: "Can I bill per km or per load?",
        a: "Yes — create any line item structure that matches your pricing model.",
      },
      {
        q: "Can I add fuel levy as a separate charge?",
        a: "Yes — add any surcharge or levy as a line item on any invoice.",
      },
      {
        q: "Can I manage invoices for multiple drivers?",
        a: "The Company plan supports multiple staff logins.",
      },
      {
        q: "Can clients approve loads before delivery?",
        a: "Yes — send a proforma invoice or quote before the trip and get digital approval.",
      },
    ],
  },

  // ─── PAINTING ────────────────────────────────────────────────────────────────
  painting: {
    subdomain: "painting",
    label: "Painting",
    headline: "Quotes & Invoices for Painters & Decorators",
    subheadline:
      "Send professional painting quotes from site, invoice on completion, and get paid without the admin hassle.",
    cta: "Start Free Today",
    color: "#1a1a2e",
    accent: "#8b5cf6",
    accentDark: "#7c3aed",
    lightBg: "#f5f3ff",
    icon: "🎨",
    features: [
      {
        icon: "📋",
        title: "On-Site Quotes",
        desc: "Generate painting quotes from your phone while assessing the job — send before you leave.",
      },
      {
        icon: "🪣",
        title: "Paint & Materials Billing",
        desc: "List paint brands, litres, primer, masking and labour as separate line items.",
      },
      {
        icon: "📐",
        title: "Area-Based Quoting",
        desc: "Calculate quotes based on square metres, number of rooms, or custom items.",
      },
      {
        icon: "💳",
        title: "Get Paid on Completion",
        desc: "Send a payment link the moment the final coat is dry.",
      },
      {
        icon: "📸",
        title: "Job Notes",
        desc: "Add notes about paint colours, finishes and special instructions per job.",
      },
      {
        icon: "📊",
        title: "Outstanding Invoices",
        desc: "Track all unpaid invoices so nothing slips through the cracks.",
      },
    ],
    pricing: [
      {
        name: "Starter",
        price: "Free",
        period: "",
        desc: "For sole painters",
        features: [
          "5 invoices/month",
          "On-site quotes",
          "PDF export",
          "Email support",
        ],
        cta: "Get Started",
        highlight: false,
      },
      {
        name: "Pro",
        price: "R249",
        period: "/mo",
        desc: "For painting contractors",
        features: [
          "Unlimited invoices",
          "Materials billing",
          "Online payments",
          "Job notes",
          "Priority support",
        ],
        cta: "Start Free Trial",
        highlight: true,
      },
      {
        name: "Company",
        price: "R499",
        period: "/mo",
        desc: "For painting companies",
        features: [
          "Everything in Pro",
          "Staff logins",
          "Custom templates",
          "Revenue reports",
          "Dedicated support",
        ],
        cta: "Contact Us",
        highlight: false,
      },
    ],
    testimonials: [
      {
        name: "Gert Joubert",
        role: "Painting Contractor, Cape Town",
        quote:
          "I quote on site and the client approves on the spot. Half the time they pay the deposit before I've even left.",
        avatar: "GJ",
      },
      {
        name: "Ntombi Shabalala",
        role: "Interior Painter, Johannesburg",
        quote:
          "Breaking out paint and labour separately makes my quotes look so much more professional than my competitors.",
        avatar: "NS",
      },
      {
        name: "Werner Botha",
        role: "Commercial Painting, Pretoria",
        quote:
          "Outstanding invoices used to keep me up at night. Now I can see them all in one place and follow up immediately.",
        avatar: "WB",
      },
    ],
    faqs: [
      {
        q: "Can I quote per room or per square metre?",
        a: "Yes — create any line item structure, including per-room or per-m² pricing.",
      },
      {
        q: "Can I include paint brand and colour on invoices?",
        a: "Yes — add any product details in the line item description.",
      },
      {
        q: "Can I collect a deposit upfront?",
        a: "Yes — send a deposit invoice and a final invoice, both with payment links.",
      },
      {
        q: "Does it work on a phone at the client's house?",
        a: "Yes — fully mobile. Create and send quotes from anywhere.",
      },
    ],
  },

  // ─── PEST CONTROL ─────────────────────────────────────────────────────────────
  "pest-control": {
    subdomain: "pest-control",
    label: "Pest Control",
    headline: "Professional Invoicing for Pest Control Businesses",
    subheadline:
      "Quote for treatments, invoice on completion, and manage recurring contracts — built for South African pest control operators.",
    cta: "Start Free Today",
    color: "#1a1a0a",
    accent: "#84cc16",
    accentDark: "#65a30d",
    lightBg: "#f7fee7",
    icon: "🐛",
    features: [
      {
        icon: "📋",
        title: "Treatment Quotes",
        desc: "Generate itemised quotes for fumigation, baiting, trapping and other services.",
      },
      {
        icon: "🔁",
        title: "Contract Billing",
        desc: "Set up monthly or quarterly pest control contracts with automatic invoicing.",
      },
      {
        icon: "🧪",
        title: "Chemical & Materials Log",
        desc: "Track chemicals used per job for compliance and accurate billing.",
      },
      {
        icon: "📄",
        title: "Treatment Certificates",
        desc: "Issue professional treatment certificates with each completed job invoice.",
      },
      {
        icon: "💳",
        title: "Online Payments",
        desc: "Send payment links via WhatsApp or email on job completion.",
      },
      {
        icon: "📊",
        title: "Contract Revenue Tracking",
        desc: "See active contracts, renewal dates and outstanding balances at a glance.",
      },
    ],
    pricing: [
      {
        name: "Starter",
        price: "Free",
        period: "",
        desc: "For independent operators",
        features: [
          "5 invoices/month",
          "Treatment quotes",
          "PDF export",
          "Email support",
        ],
        cta: "Get Started",
        highlight: false,
      },
      {
        name: "Pro",
        price: "R279",
        period: "/mo",
        desc: "For active pest control businesses",
        features: [
          "Unlimited invoices",
          "Contract billing",
          "Online payments",
          "Treatment certificates",
          "Priority support",
        ],
        cta: "Start Free Trial",
        highlight: true,
      },
      {
        name: "Company",
        price: "R549",
        period: "/mo",
        desc: "For pest control companies",
        features: [
          "Everything in Pro",
          "Staff logins",
          "Custom templates",
          "Revenue reports",
          "Dedicated support",
        ],
        cta: "Contact Us",
        highlight: false,
      },
    ],
    testimonials: [
      {
        name: "Fanie du Preez",
        role: "Pest Control Operator, Pretoria",
        quote:
          "Contract billing is now fully automatic. I've stopped losing clients to cancellation because they never miss an invoice.",
        avatar: "FP",
      },
      {
        name: "Lindiwe Mahlangu",
        role: "Fumigation Services, Johannesburg",
        quote:
          "Issuing treatment certificates with the invoice makes everything look completely professional and compliant.",
        avatar: "LM",
      },
      {
        name: "Etienne Loots",
        role: "Commercial Pest Control, Cape Town",
        quote:
          "My admin has dropped dramatically. Quotes, invoices and certificates all go out from my phone.",
        avatar: "EL",
      },
    ],
    faqs: [
      {
        q: "Can I include chemical details on invoices?",
        a: "Yes — add any treatment details, chemicals used and quantities as line items or notes.",
      },
      {
        q: "Can I set up quarterly contract billing?",
        a: "Yes — choose any billing frequency for recurring contracts.",
      },
      {
        q: "Can I send treatment certificates digitally?",
        a: "Yes — attach notes and reference numbers to job invoices to serve as treatment records.",
      },
      {
        q: "Can my technicians send invoices from site?",
        a: "The Company plan supports multiple staff logins, fully mobile.",
      },
    ],
  },

  // ─── PHOTOGRAPHY ─────────────────────────────────────────────────────────────
  photography: {
    subdomain: "photography",
    label: "Photography",
    headline: "Professional Invoicing for Photographers",
    subheadline:
      "Quote for shoots, collect deposits, and invoice on delivery — built for South African photographers and videographers.",
    cta: "Start Free Today",
    color: "#0f0f0f",
    accent: "#e11d48",
    accentDark: "#be123c",
    lightBg: "#fff1f2",
    icon: "📷",
    features: [
      {
        icon: "📸",
        title: "Shoot Quotes",
        desc: "Quote for weddings, portraits, events and commercial shoots with clear package breakdowns.",
      },
      {
        icon: "💰",
        title: "Deposit Invoicing",
        desc: "Secure bookings with deposit invoices and issue final invoices on delivery.",
      },
      {
        icon: "📅",
        title: "Booking Calendar",
        desc: "Track upcoming shoots and invoice deadlines in one view.",
      },
      {
        icon: "💳",
        title: "Online Payments",
        desc: "Clients pay deposits and final invoices via card or EFT — no cash needed.",
      },
      {
        icon: "📄",
        title: "Package Breakdowns",
        desc: "Show exactly what's included — hours, prints, edits, travel — in every quote.",
      },
      {
        icon: "📊",
        title: "Booking Revenue",
        desc: "Track confirmed bookings, deposits received and outstanding balances.",
      },
    ],
    pricing: [
      {
        name: "Starter",
        price: "Free",
        period: "",
        desc: "For new photographers",
        features: [
          "5 invoices/month",
          "Shoot quotes",
          "PDF export",
          "Email support",
        ],
        cta: "Get Started",
        highlight: false,
      },
      {
        name: "Pro",
        price: "R249",
        period: "/mo",
        desc: "For active photographers",
        features: [
          "Unlimited invoices",
          "Deposit billing",
          "Online payments",
          "Booking tracker",
          "Priority support",
        ],
        cta: "Start Free Trial",
        highlight: true,
      },
      {
        name: "Studio",
        price: "R499",
        period: "/mo",
        desc: "For studios & production companies",
        features: [
          "Everything in Pro",
          "Staff logins",
          "Custom branding",
          "Revenue reports",
          "Dedicated support",
        ],
        cta: "Contact Us",
        highlight: false,
      },
    ],
    testimonials: [
      {
        name: "Keamogetswe Sithole",
        role: "Wedding Photographer, Johannesburg",
        quote:
          "Deposit invoices have completely stopped last-minute cancellations. My bookings are so much more secure now.",
        avatar: "KS",
      },
      {
        name: "Rudi van der Berg",
        role: "Commercial Photographer, Cape Town",
        quote:
          "Clients love receiving a detailed quote with the full package breakdown. It sets expectations perfectly.",
        avatar: "RV",
      },
      {
        name: "Amahle Dube",
        role: "Portrait Photographer, Durban",
        quote:
          "I used to invoice in spreadsheets. SolidFlo made everything look professional overnight.",
        avatar: "AD",
      },
    ],
    faqs: [
      {
        q: "Can I send a deposit invoice and a balance invoice?",
        a: "Yes — create multiple invoices per booking and track each independently.",
      },
      {
        q: "Can I include usage rights terms on invoices?",
        a: "Yes — add any terms or notes in the notes section of any invoice.",
      },
      {
        q: "Can clients pay by card?",
        a: "Yes — payment links via PayFast and Yoco are available on Pro and Studio plans.",
      },
      {
        q: "Does it work for videographers too?",
        a: "Yes — the platform works for any creative service. Customise line items as needed.",
      },
    ],
  },

  // ─── POOL SERVICES ────────────────────────────────────────────────────────────
  "pool-services": {
    subdomain: "pool-services",
    label: "Pool Services",
    headline: "Invoicing for Pool Cleaners & Service Technicians",
    subheadline:
      "Manage recurring pool service clients, quote for repairs, and get paid on time — built for pool service businesses across SA.",
    cta: "Start Free Today",
    color: "#041f3a",
    accent: "#0ea5e9",
    accentDark: "#0284c7",
    lightBg: "#e0f2fe",
    icon: "🏊",
    features: [
      {
        icon: "🔁",
        title: "Weekly Service Billing",
        desc: "Set up automatic weekly or monthly invoices for each pool client.",
      },
      {
        icon: "🔧",
        title: "Repair & Parts Invoicing",
        desc: "List pumps, filters, chemicals and labour on repair invoices.",
      },
      {
        icon: "📋",
        title: "Service Reports",
        desc: "Record water readings, chemicals added and work done at each visit.",
      },
      {
        icon: "💳",
        title: "Online Payments",
        desc: "Accept card or EFT via a payment link on every invoice.",
      },
      {
        icon: "📍",
        title: "Multi-Property Billing",
        desc: "Manage multiple properties per client and bill each separately.",
      },
      {
        icon: "📊",
        title: "Outstanding Tracker",
        desc: "See all unpaid invoices across your client base in one clean view.",
      },
    ],
    pricing: [
      {
        name: "Starter",
        price: "Free",
        period: "",
        desc: "For solo pool technicians",
        features: [
          "5 invoices/month",
          "Service billing",
          "PDF export",
          "Email support",
        ],
        cta: "Get Started",
        highlight: false,
      },
      {
        name: "Pro",
        price: "R249",
        period: "/mo",
        desc: "For active pool services",
        features: [
          "Unlimited invoices",
          "Recurring billing",
          "Online payments",
          "Service reports",
          "Priority support",
        ],
        cta: "Start Free Trial",
        highlight: true,
      },
      {
        name: "Company",
        price: "R499",
        period: "/mo",
        desc: "For pool service companies",
        features: [
          "Everything in Pro",
          "Staff logins",
          "Multi-property",
          "Revenue reports",
          "Dedicated support",
        ],
        cta: "Contact Us",
        highlight: false,
      },
    ],
    testimonials: [
      {
        name: "Barry Engelbrecht",
        role: "Pool Services, Pretoria",
        quote:
          "Weekly recurring invoices mean I never have to think about billing. Everything goes out automatically.",
        avatar: "BE",
      },
      {
        name: "Thandi Nkosi",
        role: "Pool Technician, Johannesburg",
        quote:
          "Repair invoices used to be scribbled on paper. Now they're professional PDFs with payment links. My clients respect the difference.",
        avatar: "TN",
      },
      {
        name: "Cobus Rademeyer",
        role: "Pool Service Co., Cape Town",
        quote:
          "Managing 60 weekly clients was impossible before. SolidFlo makes billing feel effortless.",
        avatar: "CR",
      },
    ],
    faqs: [
      {
        q: "Can I set up weekly automatic invoices?",
        a: "Yes — choose weekly, bi-weekly or monthly billing per client.",
      },
      {
        q: "Can I add chemical usage to service records?",
        a: "Yes — add any details in the notes section of each invoice.",
      },
      {
        q: "Can I bill different rates for different pool sizes?",
        a: "Yes — set custom pricing per client or per property.",
      },
      {
        q: "Can my technicians invoice from site?",
        a: "Yes — fully mobile. Send invoices from any smartphone.",
      },
    ],
  },

  // ─── REAL ESTATE ─────────────────────────────────────────────────────────────
  realestate: {
    subdomain: "realestate",
    label: "Real Estate",
    headline: "Commission & Fee Invoicing for Real Estate Agents",
    subheadline:
      "Invoice for commission, management fees and admin charges — and get paid on transfer or lease signing.",
    cta: "Start Free Today",
    color: "#0f1a2e",
    accent: "#0ea5e9",
    accentDark: "#0284c7",
    lightBg: "#f0f9ff",
    icon: "🏡",
    features: [
      {
        icon: "💼",
        title: "Commission Invoices",
        desc: "Generate professional commission invoices with property address, sale price and commission split.",
      },
      {
        icon: "📋",
        title: "Rental Management Billing",
        desc: "Invoice landlords for management fees, maintenance coordination and admin charges.",
      },
      {
        icon: "📁",
        title: "Deal File Tracking",
        desc: "Keep all invoices and documents organised per property transaction.",
      },
      {
        icon: "💳",
        title: "Online Payments",
        desc: "Accept EFT with clear banking details or use card payment links.",
      },
      {
        icon: "📊",
        title: "Commission Pipeline",
        desc: "Track pending and confirmed commissions across all active deals.",
      },
      {
        icon: "🔁",
        title: "Monthly Rental Statements",
        desc: "Issue monthly landlord statements with rental income and fee deductions.",
      },
    ],
    pricing: [
      {
        name: "Starter",
        price: "Free",
        period: "",
        desc: "For independent agents",
        features: [
          "5 invoices/month",
          "Commission billing",
          "PDF export",
          "Email support",
        ],
        cta: "Get Started",
        highlight: false,
      },
      {
        name: "Agent",
        price: "R299",
        period: "/mo",
        desc: "For active real estate professionals",
        features: [
          "Unlimited invoices",
          "Rental statements",
          "Deal tracking",
          "Online payments",
          "Priority support",
        ],
        cta: "Start Free Trial",
        highlight: true,
      },
      {
        name: "Agency",
        price: "R599",
        period: "/mo",
        desc: "For property agencies",
        features: [
          "Everything in Agent",
          "Staff logins",
          "Custom branding",
          "Revenue reports",
          "Dedicated support",
        ],
        cta: "Contact Us",
        highlight: false,
      },
    ],
    testimonials: [
      {
        name: "Celeste du Plessis",
        role: "Property Agent, Cape Town",
        quote:
          "Commission invoices used to be informal and awkward. SolidFlo made them professional and I get paid faster at transfer.",
        avatar: "CD",
      },
      {
        name: "Mpho Motsepe",
        role: "Rental Agent, Johannesburg",
        quote:
          "Monthly landlord statements are now automatic. My landlords love the professional reporting.",
        avatar: "MM",
      },
      {
        name: "Greg Nortje",
        role: "Real Estate Principal, Pretoria",
        quote:
          "Tracking pending commissions across my team used to be a spreadsheet nightmare. Now it's all in one place.",
        avatar: "GN",
      },
    ],
    faqs: [
      {
        q: "Can I include property details on commission invoices?",
        a: "Yes — add property address, sale price, commission rate and split details on every invoice.",
      },
      {
        q: "Can I issue monthly rental statements?",
        a: "Yes — generate and send full rental income statements per landlord.",
      },
      {
        q: "Can multiple agents use the same account?",
        a: "The Agency plan supports multiple agent logins with individual billing histories.",
      },
      {
        q: "Does it handle VAT on commission?",
        a: "Yes — VAT is calculated automatically and shown correctly on all fee invoices.",
      },
    ],
  },

  // ─── RESTAURANTS ─────────────────────────────────────────────────────────────
  restaurants: {
    subdomain: "restaurants",
    label: "Restaurants",
    headline: "Invoicing for Caterers, Events & Food Businesses",
    subheadline:
      "Send professional catering quotes and event invoices — and get deposits paid before you lift a pan.",
    cta: "Start Free Today",
    color: "#1a0800",
    accent: "#dc2626",
    accentDark: "#b91c1c",
    lightBg: "#fef2f2",
    icon: "🍽️",
    features: [
      {
        icon: "📋",
        title: "Catering Quotes",
        desc: "Quote per head, per menu, or per event with itemised food, staff and equipment costs.",
      },
      {
        icon: "💰",
        title: "Deposit & Final Invoicing",
        desc: "Collect a booking deposit and issue a final invoice after the event.",
      },
      {
        icon: "📅",
        title: "Event Calendar",
        desc: "Track upcoming catering events and their invoice statuses in one view.",
      },
      {
        icon: "💳",
        title: "Online Payments",
        desc: "Clients pay deposits and balances via card or EFT from the invoice link.",
      },
      {
        icon: "📦",
        title: "Supplier Invoice Tracking",
        desc: "Log supplier costs per event to accurately track your margins.",
      },
      {
        icon: "📊",
        title: "Revenue by Event",
        desc: "See income per event and identify your most profitable clients.",
      },
    ],
    pricing: [
      {
        name: "Starter",
        price: "Free",
        period: "",
        desc: "For home caterers",
        features: [
          "5 invoices/month",
          "Catering quotes",
          "PDF export",
          "Email support",
        ],
        cta: "Get Started",
        highlight: false,
      },
      {
        name: "Pro",
        price: "R279",
        period: "/mo",
        desc: "For active catering businesses",
        features: [
          "Unlimited invoices",
          "Deposit billing",
          "Online payments",
          "Event calendar",
          "Priority support",
        ],
        cta: "Start Free Trial",
        highlight: true,
      },
      {
        name: "Company",
        price: "R549",
        period: "/mo",
        desc: "For catering companies",
        features: [
          "Everything in Pro",
          "Staff logins",
          "Custom templates",
          "Revenue reports",
          "Dedicated support",
        ],
        cta: "Contact Us",
        highlight: false,
      },
    ],
    testimonials: [
      {
        name: "Fatima Jacobs",
        role: "Event Caterer, Cape Town",
        quote:
          "Deposit invoices have stopped every last-minute cancellation I used to dread. My bookings are rock solid now.",
        avatar: "FJ",
      },
      {
        name: "Sipho Mthethwa",
        role: "Corporate Catering, Johannesburg",
        quote:
          "Clients take me seriously now. A professional quote and invoice makes all the difference when competing for events.",
        avatar: "SM",
      },
      {
        name: "Elna Venter",
        role: "Wedding Caterer, Pretoria",
        quote:
          "Per-head quoting used to take me hours in Excel. SolidFlo gets it done in minutes.",
        avatar: "EV",
      },
    ],
    faqs: [
      {
        q: "Can I quote per person for catering?",
        a: "Yes — create line items priced per head or per package, however your business models it.",
      },
      {
        q: "Can I send a deposit invoice before the event?",
        a: "Yes — create a deposit invoice and a final invoice for each event.",
      },
      {
        q: "Can I track supplier costs?",
        a: "Yes — log supplier costs as line items on internal cost sheets to calculate margins.",
      },
      {
        q: "Can clients pay by card?",
        a: "Yes — payment links via PayFast and Yoco are available on Pro and Company plans.",
      },
    ],
  },

  // ─── RETAIL ──────────────────────────────────────────────────────────────────
  retail: {
    subdomain: "retail",
    label: "Retail",
    headline: "Professional Invoicing for Retail & Trade Businesses",
    subheadline:
      "Issue trade invoices, manage wholesale accounts, and track outstanding payments — built for South African retail businesses.",
    cta: "Start Free Today",
    color: "#1a1a2e",
    accent: "#7c3aed",
    accentDark: "#6d28d9",
    lightBg: "#f5f3ff",
    icon: "🛍️",
    features: [
      {
        icon: "🧾",
        title: "Trade & Wholesale Invoices",
        desc: "Issue VAT-compliant invoices to trade customers and wholesale buyers.",
      },
      {
        icon: "📦",
        title: "Product Line Billing",
        desc: "List SKUs, quantities, unit prices and discounts clearly on every invoice.",
      },
      {
        icon: "💳",
        title: "Online & EFT Payments",
        desc: "Accept EFT with auto-included banking details or card via PayFast.",
      },
      {
        icon: "📊",
        title: "Debtor Tracking",
        desc: "See which trade accounts are outstanding and follow up from one dashboard.",
      },
      {
        icon: "📁",
        title: "Customer Account History",
        desc: "Full invoice and payment history per trade customer at your fingertips.",
      },
      {
        icon: "🔁",
        title: "Recurring Account Billing",
        desc: "Set up monthly statements and recurring invoices for wholesale accounts.",
      },
    ],
    pricing: [
      {
        name: "Starter",
        price: "Free",
        period: "",
        desc: "For small retailers",
        features: [
          "10 invoices/month",
          "Trade invoices",
          "PDF export",
          "Email support",
        ],
        cta: "Get Started",
        highlight: false,
      },
      {
        name: "Pro",
        price: "R299",
        period: "/mo",
        desc: "For active retail businesses",
        features: [
          "Unlimited invoices",
          "Debtor tracking",
          "Online payments",
          "Account history",
          "Priority support",
        ],
        cta: "Start Free Trial",
        highlight: true,
      },
      {
        name: "Business",
        price: "R599",
        period: "/mo",
        desc: "For wholesale & distribution",
        features: [
          "Everything in Pro",
          "Staff logins",
          "Bulk invoicing",
          "Custom branding",
          "Dedicated support",
        ],
        cta: "Contact Us",
        highlight: false,
      },
    ],
    testimonials: [
      {
        name: "Yusuf Patel",
        role: "Wholesale Distributor, Durban",
        quote:
          "My trade clients now receive proper invoices instantly. Outstanding payments have dropped significantly.",
        avatar: "YP",
      },
      {
        name: "Sandra Viljoen",
        role: "Retail Owner, Johannesburg",
        quote:
          "Tracking which accounts are overdue used to take me half a day every week. SolidFlo makes it instant.",
        avatar: "SV",
      },
      {
        name: "Thabo Mofokeng",
        role: "General Dealer, Soweto",
        quote:
          "The professional invoices have helped me get taken seriously by larger buyers. It's made a real difference.",
        avatar: "TM",
      },
    ],
    faqs: [
      {
        q: "Can I add product codes and SKUs to invoices?",
        a: "Yes — use the line item description to include any product reference you need.",
      },
      {
        q: "Are invoices VAT-compliant?",
        a: "Yes — all required SARS fields are included on every invoice.",
      },
      {
        q: "Can I give trade discounts on invoices?",
        a: "Yes — add discount line items or apply percentage discounts per line.",
      },
      {
        q: "Can multiple staff create invoices?",
        a: "The Business plan supports multiple staff logins.",
      },
    ],
  },

  // ─── SECURITY ────────────────────────────────────────────────────────────────
  security: {
    subdomain: "security",
    label: "Security",
    headline: "Contract Billing for Security Companies",
    subheadline:
      "Invoice clients for guarding, monitoring and armed response — with professional contracts and automatic monthly billing.",
    cta: "Start Free Today",
    color: "#0f1117",
    accent: "#ef4444",
    accentDark: "#dc2626",
    lightBg: "#fef2f2",
    icon: "🔒",
    features: [
      {
        icon: "📋",
        title: "Monthly Contract Invoicing",
        desc: "Set up automatic monthly invoices for guarding, monitoring and access control contracts.",
      },
      {
        icon: "👮",
        title: "Site Billing",
        desc: "Bill per site, per officer, or per shift — fully flexible line item structure.",
      },
      {
        icon: "📄",
        title: "Service Level Agreements",
        desc: "Reference SLA numbers and contract terms on every invoice.",
      },
      {
        icon: "💳",
        title: "EFT & Card Payments",
        desc: "Include payment links on every invoice for instant client payment.",
      },
      {
        icon: "📊",
        title: "Contract Revenue Tracker",
        desc: "See active contracts, renewal dates and monthly recurring revenue at a glance.",
      },
      {
        icon: "👥",
        title: "Multi-Site Clients",
        desc: "Manage multiple sites per client and generate consolidated or separate invoices.",
      },
    ],
    pricing: [
      {
        name: "Starter",
        price: "Free",
        period: "",
        desc: "For small security operations",
        features: [
          "5 invoices/month",
          "Contract billing",
          "PDF export",
          "Email support",
        ],
        cta: "Get Started",
        highlight: false,
      },
      {
        name: "Pro",
        price: "R349",
        period: "/mo",
        desc: "For active security companies",
        features: [
          "Unlimited invoices",
          "Multi-site billing",
          "Online payments",
          "Contract tracker",
          "Priority support",
        ],
        cta: "Start Free Trial",
        highlight: true,
      },
      {
        name: "Enterprise",
        price: "R699",
        period: "/mo",
        desc: "For large security operations",
        features: [
          "Everything in Pro",
          "Staff logins",
          "Custom templates",
          "Revenue reports",
          "Dedicated support",
        ],
        cta: "Contact Us",
        highlight: false,
      },
    ],
    testimonials: [
      {
        name: "Dirk Lombard",
        role: "Security Company Owner, Pretoria",
        quote:
          "Monthly billing used to be 2 days of admin. Now it's automated and I get paid on the 1st without lifting a finger.",
        avatar: "DL",
      },
      {
        name: "Nomsa Zungu",
        role: "Armed Response Manager, Johannesburg",
        quote:
          "Clients get professional invoices with all their contract details. It's made our business look more established.",
        avatar: "NZ",
      },
      {
        name: "JP Olivier",
        role: "Security Director, Cape Town",
        quote:
          "Managing 30+ client sites was impossible before. SolidFlo keeps every account clean and current.",
        avatar: "JP",
      },
    ],
    faqs: [
      {
        q: "Can I set up automatic monthly invoices?",
        a: "Yes — recurring invoices go out automatically on your chosen date each month.",
      },
      {
        q: "Can I bill per officer or per site?",
        a: "Yes — create any line item structure that matches your contract pricing.",
      },
      {
        q: "Can I manage multiple sites per client?",
        a: "Yes — create separate invoices per site or consolidate multiple sites on one invoice.",
      },
      {
        q: "Can clients pay by debit order or EFT?",
        a: "EFT with auto-included banking details is supported. Debit order integration is on the roadmap.",
      },
    ],
  },

  // ─── TOWING ──────────────────────────────────────────────────────────────────
  towing: {
    subdomain: "towing",
    label: "Towing",
    headline: "Fast Invoicing for Towing & Recovery Businesses",
    subheadline:
      "Invoice on the roadside, accept payments instantly, and keep your cash flow moving — built for towing operators across SA.",
    cta: "Start Free Today",
    color: "#111827",
    accent: "#f59e0b",
    accentDark: "#d97706",
    lightBg: "#fffbeb",
    icon: "🚗",
    features: [
      {
        icon: "📋",
        title: "Roadside Invoicing",
        desc: "Create and send invoices from your phone while still at the scene.",
      },
      {
        icon: "🗺️",
        title: "Distance-Based Billing",
        desc: "Charge per km, per tow, or flat rate — flexible line item structure.",
      },
      {
        icon: "🔧",
        title: "Recovery & Storage Fees",
        desc: "Add storage, recovery and labour fees as separate line items.",
      },
      {
        icon: "💳",
        title: "On-the-Spot Payments",
        desc: "Accept card, EFT or SnapScan from a payment link sent via WhatsApp.",
      },
      {
        icon: "📊",
        title: "Job & Revenue Tracking",
        desc: "See all completed tows, pending invoices and monthly income at a glance.",
      },
      {
        icon: "🏦",
        title: "Insurance Company Billing",
        desc: "Generate invoices with all required details for insurance claim submission.",
      },
    ],
    pricing: [
      {
        name: "Starter",
        price: "Free",
        period: "",
        desc: "For owner-operators",
        features: [
          "5 invoices/month",
          "Roadside billing",
          "PDF export",
          "Email support",
        ],
        cta: "Get Started",
        highlight: false,
      },
      {
        name: "Pro",
        price: "R249",
        period: "/mo",
        desc: "For active towing businesses",
        features: [
          "Unlimited invoices",
          "Distance billing",
          "Online payments",
          "Job tracker",
          "Priority support",
        ],
        cta: "Start Free Trial",
        highlight: true,
      },
      {
        name: "Fleet",
        price: "R499",
        period: "/mo",
        desc: "For towing companies",
        features: [
          "Everything in Pro",
          "Staff logins",
          "Custom templates",
          "Revenue reports",
          "Dedicated support",
        ],
        cta: "Contact Us",
        highlight: false,
      },
    ],
    testimonials: [
      {
        name: "Trevor Smit",
        role: "Towing Operator, Johannesburg",
        quote:
          "I invoice from my phone before I've even released the hook. Clients pay via WhatsApp on the spot.",
        avatar: "TS",
      },
      {
        name: "Busi Mhlongo",
        role: "Recovery Towing, Durban",
        quote:
          "Insurance billing used to be a nightmare. Professional invoices with all the right details mean faster claim processing.",
        avatar: "BM",
      },
      {
        name: "Hennie du Plessis",
        role: "Towing Company, Pretoria",
        quote:
          "Managing my drivers' jobs and invoices is now dead simple. Everything is tracked in one place.",
        avatar: "HP",
      },
    ],
    faqs: [
      {
        q: "Can I invoice per km towed?",
        a: "Yes — create any billing structure, including per-km rates with a minimum call-out fee.",
      },
      {
        q: "Can I add storage fees to an invoice?",
        a: "Yes — add any additional charge as a line item.",
      },
      {
        q: "Can I accept card payments on site?",
        a: "Yes — payment links via PayFast allow card, SnapScan and EFT.",
      },
      {
        q: "Can I bill insurance companies directly?",
        a: "Yes — generate invoices with all required reference and vehicle details for insurance submissions.",
      },
    ],
  },

  // ─── WELDING ─────────────────────────────────────────────────────────────────
  welding: {
    subdomain: "welding",
    label: "Welding",
    headline: "Professional Quotes & Invoices for Welders",
    subheadline:
      "Quote for fabrication, invoice on completion, and get paid without the paperwork — built for South African welders and metal workers.",
    cta: "Start Free Today",
    color: "#1a0e00",
    accent: "#f97316",
    accentDark: "#ea580c",
    lightBg: "#fff7ed",
    icon: "🔩",
    features: [
      {
        icon: "📋",
        title: "Fabrication Quotes",
        desc: "Itemise steel, consumables, labour and transport on every quote.",
      },
      {
        icon: "⚙️",
        title: "Materials & Labour Split",
        desc: "Show clients exactly how their job is priced — builds trust and wins more work.",
      },
      {
        icon: "🏭",
        title: "On-Site & Workshop Jobs",
        desc: "Invoice for field welding and workshop fabrication with equal ease.",
      },
      {
        icon: "💳",
        title: "Get Paid on Completion",
        desc: "Send a payment link the moment the job is done and signed off.",
      },
      {
        icon: "📦",
        title: "Material Cost Tracking",
        desc: "Log steel, gas and consumable costs per job to protect your margins.",
      },
      {
        icon: "📊",
        title: "Job & Revenue Dashboard",
        desc: "Track open quotes, in-progress jobs and outstanding invoices in one view.",
      },
    ],
    pricing: [
      {
        name: "Starter",
        price: "Free",
        period: "",
        desc: "For sole welders",
        features: [
          "5 invoices/month",
          "Fabrication quotes",
          "PDF export",
          "Email support",
        ],
        cta: "Get Started",
        highlight: false,
      },
      {
        name: "Pro",
        price: "R249",
        period: "/mo",
        desc: "For active welding businesses",
        features: [
          "Unlimited invoices",
          "Materials tracking",
          "Online payments",
          "Job history",
          "Priority support",
        ],
        cta: "Start Free Trial",
        highlight: true,
      },
      {
        name: "Workshop",
        price: "R499",
        period: "/mo",
        desc: "For fabrication workshops",
        features: [
          "Everything in Pro",
          "Staff logins",
          "Custom templates",
          "Revenue reports",
          "Dedicated support",
        ],
        cta: "Contact Us",
        highlight: false,
      },
    ],
    testimonials: [
      {
        name: "Gerrie Bosman",
        role: "Fabrication Welder, Johannesburg",
        quote:
          "Detailed quotes that break out materials and labour have helped me win bigger contracts. Clients see the value.",
        avatar: "GB",
      },
      {
        name: "Siphamandla Dube",
        role: "Structural Welder, Durban",
        quote:
          "I used to quote from memory and always undercharged. Tracking material costs has protected my margins.",
        avatar: "SD",
      },
      {
        name: "André Potgieter",
        role: "Welding Workshop, Pretoria",
        quote:
          "From quote to invoice in two taps. My admin has basically disappeared.",
        avatar: "AP",
      },
    ],
    faqs: [
      {
        q: "Can I include material specifications on quotes?",
        a: "Yes — add any technical details, specs or standards in the line item descriptions.",
      },
      {
        q: "Can I collect a deposit for large fabrication jobs?",
        a: "Yes — send a deposit invoice and a final invoice per project.",
      },
      {
        q: "Can I track my steel and gas costs per job?",
        a: "Yes — log any cost as a line item to monitor job profitability.",
      },
      {
        q: "Does it work on a phone at a job site?",
        a: "Yes — fully mobile. Create and send quotes from anywhere.",
      },
    ],
  },

  // ─── FLOORING ────────────────────────────────────────────────────────────────
  flooring: {
    subdomain: "flooring",
    label: "Flooring",
    headline: "Professional Invoicing for Flooring Installers",
    subheadline:
      "Quote per m², invoice on completion, and get paid faster — built for carpet, tile, laminate and hardwood flooring businesses.",
    cta: "Start Free Today",
    color: "#1a1005",
    accent: "#a16207",
    accentDark: "#854d0e",
    lightBg: "#fefce8",
    icon: "🪟",
    features: [
      {
        icon: "📐",
        title: "Per-m² Quoting",
        desc: "Quote by square metre for carpet, tile, vinyl, laminate and hardwood installations.",
      },
      {
        icon: "🪣",
        title: "Materials & Labour Split",
        desc: "List flooring materials, underlay, adhesive and installation labour separately.",
      },
      {
        icon: "📋",
        title: "On-Site Quotes",
        desc: "Measure up and send a professional quote before you leave the client's premises.",
      },
      {
        icon: "💳",
        title: "Deposit & Final Invoice",
        desc: "Collect a materials deposit upfront and invoice the balance on completion.",
      },
      {
        icon: "📦",
        title: "Material Cost Tracking",
        desc: "Log flooring costs per job to ensure accurate margins.",
      },
      {
        icon: "📊",
        title: "Outstanding Tracker",
        desc: "Keep tabs on all unpaid invoices across your active jobs.",
      },
    ],
    pricing: [
      {
        name: "Starter",
        price: "Free",
        period: "",
        desc: "For sole installers",
        features: [
          "5 invoices/month",
          "m² quoting",
          "PDF export",
          "Email support",
        ],
        cta: "Get Started",
        highlight: false,
      },
      {
        name: "Pro",
        price: "R249",
        period: "/mo",
        desc: "For active flooring businesses",
        features: [
          "Unlimited invoices",
          "Deposit billing",
          "Online payments",
          "Material tracking",
          "Priority support",
        ],
        cta: "Start Free Trial",
        highlight: true,
      },
      {
        name: "Company",
        price: "R499",
        period: "/mo",
        desc: "For flooring companies",
        features: [
          "Everything in Pro",
          "Staff logins",
          "Custom templates",
          "Revenue reports",
          "Dedicated support",
        ],
        cta: "Contact Us",
        highlight: false,
      },
    ],
    testimonials: [
      {
        name: "Danie Swart",
        role: "Tile & Carpet Installer, Cape Town",
        quote:
          "I quote on site, get the deposit paid before I even order materials, and invoice the balance on the last day. Cash flow is sorted.",
        avatar: "DS",
      },
      {
        name: "Ntombi Zulu",
        role: "Vinyl Flooring Installer, Durban",
        quote:
          "Per-m² quotes that break out underlay and installation separately have made me look far more professional.",
        avatar: "NZ",
      },
      {
        name: "Pietman Coetzee",
        role: "Hardwood Flooring, Pretoria",
        quote:
          "No more handwritten quotes. My clients see professional documents and it's reflected in how quickly they approve and pay.",
        avatar: "PC",
      },
    ],
    faqs: [
      {
        q: "Can I quote per square metre?",
        a: "Yes — price per m² and enter the area to calculate totals automatically.",
      },
      {
        q: "Can I send a deposit invoice for materials?",
        a: "Yes — create a deposit invoice and a final invoice per job.",
      },
      {
        q: "Can I list different flooring types at different rates?",
        a: "Yes — each line item has its own description, quantity and price.",
      },
      {
        q: "Does it work on a phone when measuring up?",
        a: "Yes — fully mobile. Create quotes directly from your phone at the client's property.",
      },
    ],
  },

  // ─── WINDOW REPAIR ───────────────────────────────────────────────────────────
  "window-repair": {
    subdomain: "window-repair",
    label: "Window Repair",
    headline: "Fast Invoicing for Glaziers & Window Repair Businesses",
    subheadline:
      "Quote for glass replacements and installations, invoice on completion, and get paid on the day — built for South African glaziers.",
    cta: "Start Free Today",
    color: "#0a1628",
    accent: "#38bdf8",
    accentDark: "#0284c7",
    lightBg: "#f0f9ff",
    icon: "🪟",
    features: [
      {
        icon: "📋",
        title: "On-Site Quotes",
        desc: "Measure and quote for glass replacements, frames and seals from your phone.",
      },
      {
        icon: "🔧",
        title: "Glass & Labour Billing",
        desc: "Itemise glass type, size, frames, seals and installation labour on every invoice.",
      },
      {
        icon: "⚡",
        title: "Emergency Call-Out Invoicing",
        desc: "Invoice for emergency glass replacements immediately — with a payment link on the spot.",
      },
      {
        icon: "💳",
        title: "Same-Day Payments",
        desc: "Clients pay via card or EFT from a WhatsApp payment link before you leave.",
      },
      {
        icon: "📦",
        title: "Glass & Materials Tracking",
        desc: "Log glass costs per job to track your margins accurately.",
      },
      {
        icon: "📊",
        title: "Outstanding Invoice Tracker",
        desc: "See all unpaid invoices across your jobs in one clean dashboard.",
      },
    ],
    pricing: [
      {
        name: "Starter",
        price: "Free",
        period: "",
        desc: "For sole glaziers",
        features: [
          "5 invoices/month",
          "On-site quotes",
          "PDF export",
          "Email support",
        ],
        cta: "Get Started",
        highlight: false,
      },
      {
        name: "Pro",
        price: "R249",
        period: "/mo",
        desc: "For active glazing businesses",
        features: [
          "Unlimited invoices",
          "Emergency billing",
          "Online payments",
          "Materials tracking",
          "Priority support",
        ],
        cta: "Start Free Trial",
        highlight: true,
      },
      {
        name: "Company",
        price: "R499",
        period: "/mo",
        desc: "For glazing companies",
        features: [
          "Everything in Pro",
          "Staff logins",
          "Custom templates",
          "Revenue reports",
          "Dedicated support",
        ],
        cta: "Contact Us",
        highlight: false,
      },
    ],
    testimonials: [
      {
        name: "Bertus van Heerden",
        role: "Glazier, Johannesburg",
        quote:
          "Emergency call-outs are now invoiced and paid before I'm even back in my van. The payment link via WhatsApp is brilliant.",
        avatar: "BV",
      },
      {
        name: "Asanda Mthembu",
        role: "Glass Replacement, Durban",
        quote:
          "Professional invoices have helped me win larger contracts with property managers. It makes all the difference.",
        avatar: "AM",
      },
      {
        name: "Francois Pretorius",
        role: "Window Repairs, Pretoria",
        quote:
          "Tracking which jobs are still unpaid is now effortless. I follow up the same day instead of weeks later.",
        avatar: "FP",
      },
    ],
    faqs: [
      {
        q: "Can I invoice for emergency call-outs at different rates?",
        a: "Yes — create separate line items for call-out fees, after-hours rates and materials.",
      },
      {
        q: "Can I specify glass type and size on invoices?",
        a: "Yes — add full specifications in the line item descriptions.",
      },
      {
        q: "Can I accept card payment on site?",
        a: "Yes — payment links via PayFast allow card, SnapScan and EFT.",
      },
      {
        q: "Can my glaziers invoice from site?",
        a: "The Company plan supports multiple staff logins, fully mobile.",
      },
    ],
  },

  // ─── FALLBACK / DEFAULT ───────────────────────────────────────────────────────
  default: {
    subdomain: null,
    label: "SolidFlo",
    headline: "Professional Invoicing for Every Business",
    subheadline:
      "Send quotes, job cards and invoices in seconds. Get paid faster. Run your business smarter.",
    cta: "Get Started Free",
    color: "#1a2332",
    accent: "#3b82f6",
    accentDark: "#2563eb",
    lightBg: "#eff6ff",
    icon: "📋",
    features: [
      {
        icon: "⚡",
        title: "Fast Invoicing",
        desc: "Create and send professional invoices in under 2 minutes from any device.",
      },
      {
        icon: "💳",
        title: "Online Payments",
        desc: "Accept card, EFT and SnapScan. Get paid the same day you send the invoice.",
      },
      {
        icon: "📊",
        title: "Business Dashboard",
        desc: "Track revenue, outstanding invoices and top clients at a glance.",
      },
      {
        icon: "📱",
        title: "Mobile First",
        desc: "Works perfectly on any smartphone. Invoice from the job site, not just the office.",
      },
      {
        icon: "🏦",
        title: "Banking Details",
        desc: "Auto-include your EFT details on every invoice so clients know how to pay.",
      },
      {
        icon: "🔒",
        title: "Secure & Private",
        desc: "Your data is encrypted and accessible only by you.",
      },
    ],
    pricing: [
      {
        name: "Free",
        price: "Free",
        period: "",
        desc: "Try it out",
        features: [
          "5 invoices/month",
          "Quotes",
          "PDF download",
          "Email support",
        ],
        cta: "Get Started",
        highlight: false,
      },
      {
        name: "Pro",
        price: "R299",
        period: "/mo",
        desc: "Grow your business",
        features: [
          "Unlimited invoices",
          "Online payments",
          "Client history",
          "Priority support",
        ],
        cta: "Start Free Trial",
        highlight: true,
      },
      {
        name: "Business",
        price: "R599",
        period: "/mo",
        desc: "For teams",
        features: [
          "Everything in Pro",
          "Staff logins",
          "Custom templates",
          "Reports",
          "Dedicated support",
        ],
        cta: "Contact Us",
        highlight: false,
      },
    ],
    testimonials: [
      {
        name: "Sipho Dlamini",
        role: "Freelance Contractor, Johannesburg",
        quote:
          "SolidFlo made me look like a proper business from day one. Clients take me more seriously now.",
        avatar: "SD",
      },
      {
        name: "Carla van Rensburg",
        role: "Small Business Owner, Cape Town",
        quote:
          "I used to send invoices on WhatsApp as screenshots. Now I send proper PDFs and get paid twice as fast.",
        avatar: "CV",
      },
      {
        name: "Moses Sithole",
        role: "Service Provider, Durban",
        quote:
          "The online payment link is the best feature. No more waiting 3 days for an EFT that may or may not arrive.",
        avatar: "MS",
      },
    ],
    faqs: [
      {
        q: "Is SolidFlo free to use?",
        a: "Yes — the Starter plan is free with up to 5 invoices per month. No credit card required.",
      },
      {
        q: "Which industries does SolidFlo support?",
        a: "Mechanics, accounting, healthcare, electrical, plumbing, solar, cleaning, legal, construction and more.",
      },
      {
        q: "Can I accept online payments?",
        a: "Yes — integrate PayFast, Yoco, Stripe or PayPal and include a Pay Now link on every invoice.",
      },
      {
        q: "Is my data safe?",
        a: "All data is stored securely in Google Firebase with encryption at rest and in transit.",
      },
    ],
  },
};

// ─── Aliases ──────────────────────────────────────────────────────────────────
// Handle alternate subdomain keys that map to the same config

INDUSTRY_CONFIG["solar"] = INDUSTRY_CONFIG["solar-installation"];
INDUSTRY_CONFIG["health"] = INDUSTRY_CONFIG["healthcare"];
INDUSTRY_CONFIG["realEstate"] = INDUSTRY_CONFIG["realestate"];
INDUSTRY_CONFIG["pestcontrol"] = INDUSTRY_CONFIG["pest-control"];
INDUSTRY_CONFIG["poolservices"] = INDUSTRY_CONFIG["pool-services"];
INDUSTRY_CONFIG["windowrepair"] = INDUSTRY_CONFIG["window-repair"];

export function getIndustryConfig(subdomain) {
  return INDUSTRY_CONFIG[subdomain] || INDUSTRY_CONFIG["default"];
}
