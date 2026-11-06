/**
 * SEO_MarketplaceMeta.jsx  (v2 — subdomain architecture)
 * ─────────────────────────────────────────────────────────────────
 * Built for:  market.gerboai.com
 * Architecture: the marketplace is a subdomain, not a path.
 *   market.gerboai.com/           → all industries
 *   market.gerboai.com/plumbing   → plumbers page
 *   market.gerboai.com/electrical → electricians page
 *   … etc for all 27 industries
 *
 * INSTALL:
 *   npm install react-helmet-async
 *   (react-router-dom is already in your project)
 *
 * SETUP — in main.jsx, wrap with HelmetProvider:
 *   import { HelmetProvider } from 'react-helmet-async';
 *   <HelmetProvider><App /></HelmetProvider>
 *
 * In App.jsx, add these two routes inside the IS_SUBDOMAIN block,
 * specifically inside the "market" case (or wherever SolidMarket renders).
 * Your current code renders <SubdomainRoot /> at "/" which maps to SolidMarket.
 * Add a second route for the industry slug:
 *
 *   // Inside IS_SUBDOMAIN Routes block:
 *   <Route path="/"            element={<SolidMarket />} />
 *   <Route path="/:industry"   element={<SolidMarket />} />   ← ADD THIS
 *
 * Then inside PublicMarketplace.jsx:
 *   import { MarketplaceSEO, MarketplaceBreadcrumb, IndustryFAQ, useIndustryRoute } from './SEO_MarketplaceMeta';
 *   useIndustryRoute(activeFilter, setActiveFilter);   // add inside component
 *   <MarketplaceSEO activeFilter={activeFilter} providers={providers} />
 *   <MarketplaceBreadcrumb activeFilter={activeFilter} />
 *   <IndustryFAQ activeFilter={activeFilter} />        // add at bottom of .mp-main
 * ─────────────────────────────────────────────────────────────────
 */

import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, useNavigate } from "react-router-dom";

const BASE = "https://market.gerboai.com";
const MAIN = "https://gerboai.com";

// ─────────────────────────────────────────────────────────────────────────────
// INDUSTRY SEO CONFIG
// One entry per sidebar industry. Keys must match the industry IDs in
// PublicMarketplace.jsx (INDUSTRIES array) and App.jsx subdomain map.
// ─────────────────────────────────────────────────────────────────────────────
export const INDUSTRY_SEO = {
  all: {
    slug: "",
    title: "Service Providers in Gauteng | GerboAI Marketplace",
    description:
      "Find verified tradespeople and service providers across Gauteng. Compare quotes, check ratings and book online. Plumbers, electricians, mechanics and 25+ industries.",
    h1: "Verified Service Providers in Gauteng",
    schemaType: "LocalBusiness",
    faqs: [
      {
        q: "How do I find a reliable service provider in Gauteng?",
        a: "Browse GerboAI's verified marketplace. Every listed provider has been reviewed by real Gauteng businesses. Filter by industry, check ratings and send a booking request — no middleman needed.",
      },
      {
        q: "Is GerboAI free to use?",
        a: "Browsing the marketplace is completely free with no sign-up required. You only need a free account to post a job request or receive quotes from providers.",
      },
      {
        q: "How quickly will I receive a quote?",
        a: "Most providers respond within 15–60 minutes during business hours. Providers marked 'Available today' are actively taking new bookings right now.",
      },
    ],
  },
  mechanics: {
    slug: "mechanics",
    title: "Mechanics & Auto Repair in Gauteng | GerboAI Market",
    description:
      "Book certified mechanics in Johannesburg and Pretoria. Fleet servicing, engine rebuilds, diagnostics and roadworthy inspections. Get quotes from R380/hr.",
    h1: "Mechanics & Auto Repair Services in Gauteng",
    schemaType: "AutoRepair",
    faqs: [
      {
        q: "How much does a mechanic cost per hour in South Africa?",
        a: "Mechanic rates in Gauteng range from R350–R550 per hour for general work. Specialist diagnostics or engine rebuilds may be quoted at a flat project rate.",
      },
      {
        q: "Can I get a mobile mechanic in Johannesburg?",
        a: "Yes. Several GerboAI providers offer mobile call-outs to your home or workplace across the JHB metro, including Sandton, Randburg and Midrand.",
      },
      {
        q: "What is a roadworthy inspection and how much does it cost?",
        a: "A roadworthy certificate confirms your vehicle meets legal safety standards. Inspections in Gauteng typically cost R400–R800 at a registered testing station.",
      },
    ],
  },
  electrical: {
    slug: "electrical",
    title: "Licensed Electricians in Gauteng | COC Certificates | GerboAI",
    description:
      "Find ECSA-registered electricians in Johannesburg and Pretoria. COC certificates, DB upgrades, solar wiring, fault finding and emergency call-outs. From R420/hr.",
    h1: "Licensed Electricians in Gauteng",
    schemaType: "Electrician",
    faqs: [
      {
        q: "What is a COC certificate and do I need one?",
        a: "A Certificate of Compliance (COC) confirms your electrical installation meets SANS 10142 standards. It is legally required when selling a property in South Africa.",
      },
      {
        q: "How much does an electrician charge per hour in Gauteng?",
        a: "Standard residential electrician rates in Gauteng range from R380–R600 per hour. Emergency after-hours call-outs typically attract a 50–100% surcharge.",
      },
      {
        q: "Can electricians install solar panels in Johannesburg?",
        a: "Yes. Many GerboAI electricians are qualified to wire and commission solar PV systems compliant with NRS097, including grid-tied and off-grid installations.",
      },
    ],
  },
  carpentry: {
    slug: "carpentry",
    title: "Carpenters & Joinery in Gauteng | Custom Built-ins | GerboAI",
    description:
      "Hire skilled carpenters in Pretoria and Johannesburg. Custom built-in cupboards, doors, frames, decking and bespoke timber work. Rates from R320/hr.",
    h1: "Carpenters & Joinery Services in Gauteng",
    schemaType: "HomeAndConstructionBusiness",
    faqs: [
      {
        q: "How much does a carpenter charge per hour in South Africa?",
        a: "Carpentry rates in Gauteng range from R280–R450 per hour. Custom built-in cupboards are often quoted per linear metre — typically R1 800–R4 500/m depending on materials.",
      },
      {
        q: "How long do custom built-in cupboards take to install?",
        a: "A standard single-bedroom built-in takes 2–3 days from template to installation. Larger projects like kitchen cabinetry take 5–10 working days.",
      },
    ],
  },
  plumbing: {
    slug: "plumbing",
    title: "Plumbers in Gauteng | Emergency Plumbing | GerboAI Market",
    description:
      "Find licensed plumbers in Johannesburg and Pretoria. 24/7 emergency call-outs, burst pipes, bathroom renovations, leak detection. Rates from R400/hr.",
    h1: "Licensed Plumbers in Gauteng",
    schemaType: "Plumber",
    faqs: [
      {
        q: "How much does a plumber cost per hour in South Africa?",
        a: "Plumber call-out rates in Gauteng typically start at R350–R500 per hour. Emergency after-hours rates are usually 1.5–2× the standard rate.",
      },
      {
        q: "Do I need a licensed plumber for bathroom renovations?",
        a: "Yes. Any work on water supply or drainage connecting to municipal supply must be done by a plumber registered with the PIRB (Plumbing Industry Registration Board).",
      },
      {
        q: "What is the most common plumbing problem in African homes?",
        a: "Burst geysers, blocked drains and leaking pipes are the most common. Most can be diagnosed and repaired in a single visit by a qualified plumber.",
      },
    ],
  },
  logistics: {
    slug: "logistics",
    title: "Logistics & Courier Services in Gauteng | GerboAI Market",
    description:
      "Book same-day couriers, freight and logistics companies in Johannesburg. Cold-chain, nationwide delivery and office relocation. Get quotes instantly.",
    h1: "Logistics & Courier Services in Gauteng",
    schemaType: "MovingCompany",
    faqs: [
      {
        q: "How much does same-day courier delivery cost in Johannesburg?",
        a: "Same-day courier rates within JHB start from R150–R350 for small packages. Larger freight is quoted per pallet or kg/km depending on the provider.",
      },
    ],
  },
  construction: {
    slug: "construction",
    title: "Construction Companies in Gauteng | CIDB Contractors | GerboAI",
    description:
      "Find CIDB-registered builders in Johannesburg and Pretoria. Residential builds, commercial renovations, extensions and structural work. Get quotes today.",
    h1: "CIDB-Registered Construction Companies in Gauteng",
    schemaType: "GeneralContractor",
    faqs: [
      {
        q: "What is CIDB registration and why does it matter?",
        a: "The CIDB grades contractors from Grade 1–9 based on capacity and compliance. Always hire a CIDB-registered contractor for formal building work to protect yourself legally.",
      },
      {
        q: "How much does a building extension cost in South Africa?",
        a: "Residential extensions in Gauteng typically cost R8 000–R15 000 per square metre depending on finishes. Always get at least three quotes before proceeding.",
      },
    ],
  },
  accounting: {
    slug: "accounting",
    title: "Accountants & Bookkeepers in Gauteng | SARS Submissions | GerboAI",
    description:
      "Find SAIPA-registered accountants in Pretoria and Johannesburg. VAT returns, SARS submissions, payroll and SME bookkeeping. From R350/hr.",
    h1: "Registered Accountants & Bookkeepers in Gauteng",
    schemaType: "AccountingService",
    faqs: [
      {
        q: "How much does an accountant charge per hour in South Africa?",
        a: "Accountant rates in Gauteng range from R300–R1 200 per hour. Many offer monthly bookkeeping retainers from R1 500–R5 000/month.",
      },
      {
        q: "What is the deadline for company tax returns in South Africa?",
        a: "Company income tax returns (ITR14) are due 12 months after financial year-end. SARS penalties apply for late submission.",
      },
    ],
  },
  cleaning: {
    slug: "cleaning",
    title:
      "Cleaning Services in Gauteng | Office & Industrial Cleaning | GerboAI",
    description:
      "Book professional cleaning companies in Johannesburg and Pretoria. Office cleaning, deep cleans and industrial cleaning. Rates from R280/hr.",
    h1: "Professional Cleaning Services in Gauteng",
    schemaType: "HomeAndConstructionBusiness",
    faqs: [
      {
        q: "How much does office cleaning cost per hour in South Africa?",
        a: "Commercial cleaning rates in Gauteng range from R200–R350 per hour. Monthly contracts typically work out cheaper than ad-hoc bookings.",
      },
    ],
  },
  health: {
    slug: "health",
    title:
      "Occupational Health Services in Gauteng | IOD & Medicals | GerboAI",
    description:
      "Find occupational health practitioners in Johannesburg. Pre-employment medicals, IOD assessments and on-site wellness screenings. Book today.",
    h1: "Occupational Health Services in Gauteng",
    schemaType: "MedicalBusiness",
    faqs: [
      {
        q: "How much does a pre-employment medical cost in South Africa?",
        a: "Pre-employment medical costs range from R350–R1 200 depending on tests required. Mining and construction medicals including lung function tests are at the higher end.",
      },
    ],
  },
  hotel: {
    slug: "hospitality",
    title:
      "Event & Hospitality Services in Gauteng | Conference Catering | GerboAI",
    description:
      "Book event management and hospitality companies in Johannesburg. Conference setup, catering, AV equipment and corporate functions.",
    h1: "Event & Hospitality Services in Gauteng",
    schemaType: "EventVenue",
    faqs: [
      {
        q: "How much does corporate event catering cost per person in South Africa?",
        a: "Corporate catering in Gauteng starts from R120–R250 per person for a conference setup. Full-service gala dinners range from R350–R800+ per person.",
      },
    ],
  },
  hvac: {
    slug: "hvac",
    title:
      "HVAC Companies in Gauteng | Aircon Installation & Repair | GerboAI",
    description:
      "Find HVAC specialists in Johannesburg and Pretoria. Aircon installation, VRV systems, maintenance contracts and emergency repairs. From R480/hr.",
    h1: "HVAC & Air Conditioning Services in Gauteng",
    schemaType: "HomeAndConstructionBusiness",
    faqs: [
      {
        q: "How much does air conditioning installation cost in South Africa?",
        a: "A standard 9 000 BTU split unit installation costs R3 500–R6 500 including unit and labour. Larger commercial systems are quoted per zone or capacity.",
      },
      {
        q: "How often should HVAC systems be serviced?",
        a: "Commercial HVAC systems should be serviced every 3–6 months. Residential split units need at minimum an annual service to maintain efficiency and warranty compliance.",
      },
    ],
  },
  landscaping: {
    slug: "landscaping",
    title: "Landscaping & Garden Services in Gauteng | GerboAI Market",
    description:
      "Hire professional landscapers in Pretoria and Johannesburg. Garden design, irrigation, lawn maintenance and commercial landscaping. From R300/hr.",
    h1: "Landscaping & Garden Services in Gauteng",
    schemaType: "LandscapeService",
    faqs: [
      {
        q: "How much does landscaping cost in South Africa?",
        a: "Basic garden maintenance costs R250–R400 per hour. Full landscape design projects are quoted per square metre, typically R350–R900/m² depending on complexity.",
      },
    ],
  },
  legal: {
    slug: "legal",
    title: "Commercial Lawyers in Gauteng | SME Legal Services | GerboAI",
    description:
      "Find commercial attorneys and labour law specialists in Pretoria and Johannesburg. Contracts, CCMA representation and company compliance. From R1 200/hr.",
    h1: "Commercial Attorneys & Legal Services in Gauteng",
    schemaType: "LegalService",
    faqs: [
      {
        q: "How much does a commercial lawyer charge in South Africa?",
        a: "Commercial attorney rates range from R800–R2 500 per hour. Many offer fixed-fee packages for standard contracts and company registrations.",
      },
      {
        q: "What is the CCMA and when do I need a labour lawyer?",
        a: "The CCMA handles employment disputes. If you receive a CCMA notice, consulting a labour lawyer within 24–48 hours is strongly recommended.",
      },
    ],
  },
  painting: {
    slug: "painting",
    title: "Painters in Gauteng | Interior & Exterior Painting | GerboAI",
    description:
      "Book professional painters in Johannesburg and Pretoria. Interior and exterior painting, waterproofing and texture finishes. From R280/hr.",
    h1: "Professional Painters in Gauteng",
    schemaType: "HomeAndConstructionBusiness",
    faqs: [
      {
        q: "How much does house painting cost in South Africa?",
        a: "Interior painting in Gauteng costs R25–R55 per square metre. A full 3-bedroom house interior typically costs R8 000–R18 000 depending on paint quality.",
      },
    ],
  },
  "pestcontrol": {
    slug: "pestcontrol",
    title: "Pest Control Services in Gauteng | Fumigation | GerboAI Market",
    description:
      "Book registered pest control operators in Johannesburg. Cockroach, rodent and termite treatments. Same-day service from R550 flat rate.",
    h1: "Registered Pest Control Services in Gauteng",
    schemaType: "HomeAndConstructionBusiness",
    faqs: [
      {
        q: "How much does pest control cost in South Africa?",
        a: "Residential pest treatments in Gauteng start from R450–R800 per visit. Commercial fumigation is quoted by floor area, typically R15–R35 per square metre.",
      },
    ],
  },
  photography: {
    slug: "photography",
    title: "Commercial Photographers in Gauteng | Events & Products | GerboAI",
    description:
      "Book professional photographers in Johannesburg. Product shoots, corporate events, drone footage and headshots. Half-day rates from R1 800.",
    h1: "Commercial & Event Photographers in Gauteng",
    schemaType: "ProfessionalService",
    faqs: [
      {
        q: "How much does a commercial photographer cost in South Africa?",
        a: "Day rates in Gauteng range from R3 500–R12 000+ depending on experience and usage rights. Product shoots can be quoted per image or per half-day.",
      },
    ],
  },
  poolservices: {
    slug: "poolservices",
    title: "Pool Services in Gauteng | Cleaning & Maintenance | GerboAI",
    description:
      "Find pool cleaning and maintenance companies in Pretoria and Johannesburg. Weekly service, chemical balancing and pump repairs. From R350/visit.",
    h1: "Pool Cleaning & Maintenance Services in Gauteng",
    schemaType: "HomeAndConstructionBusiness",
    faqs: [
      {
        q: "How much does pool maintenance cost in South Africa?",
        a: "Weekly pool service in Gauteng costs R350–R650 per visit. Monthly contracts work out to R800–R1 800 per month depending on pool size.",
      },
    ],
  },
  realestate: {
    slug: "realestate",
    title:
      "Commercial Property Agents in Gauteng | Industrial Listings | GerboAI",
    description:
      "Find specialist commercial property agents in Johannesburg and Pretoria. Buying, selling, leasing and property valuations across Gauteng.",
    h1: "Commercial Property Agents in Gauteng",
    schemaType: "RealEstateAgent",
    faqs: [
      {
        q: "What commission do commercial property agents charge in South Africa?",
        a: "Commercial agent commission is typically 5–7.5% of sale price or 8–10% of annual rental for lease transactions.",
      },
    ],
  },
  restaurant: {
    slug: "restaurant",
    title: "Corporate Catering in Gauteng | Event Food Services | GerboAI",
    description:
      "Book catering companies in Johannesburg. Corporate lunches, halaal-certified menus and set menus from R180/person.",
    h1: "Corporate Catering & Food Services in Gauteng",
    schemaType: "FoodService",
    faqs: [
      {
        q: "How far in advance should I book corporate catering?",
        a: "For small lunches under 20 people, 48–72 hours is usually sufficient. Events over 50 guests should be booked 1–2 weeks in advance.",
      },
    ],
  },
  security: {
    slug: "security",
    title: "Security Companies in Gauteng | Armed Response | PSiRA | GerboAI",
    description:
      "Find PSiRA-registered security companies in Johannesburg. Armed response, site guarding, CCTV installation and access control. From R220/hr.",
    h1: "PSiRA-Registered Security Companies in Gauteng",
    schemaType: "LocalBusiness",
    faqs: [
      {
        q: "What is PSiRA registration and why does it matter?",
        a: "PSiRA registration is legally required for all security providers in South Africa. Always verify PSiRA registration before hiring any security company.",
      },
      {
        q: "How much does armed response cost per month in Gauteng?",
        a: "Armed response monitoring contracts typically cost R350–R700 per month for residential properties. Commercial sites are priced higher.",
      },
    ],
  },
  solar: {
    slug: "solarinstallation",
    title: "Solar Installers in Gauteng | Off-Grid & Grid-Tied | GerboAI",
    description:
      "Find NRS097-compliant solar companies in Pretoria and Johannesburg. Off-grid, grid-tied and hybrid systems for homes and businesses.",
    h1: "Solar Installation Companies in Gauteng",
    schemaType: "Electrician",
    faqs: [
      {
        q: "How much does a solar system cost in South Africa?",
        a: "A basic residential backup system (5kW inverter + 10kWh batteries) costs R80 000–R140 000 installed. Full off-grid systems range from R180 000–R350 000+.",
      },
      {
        q: "What is NRS097 compliance for solar in South Africa?",
        a: "NRS097 is the standard for grid-connected embedded generation. Any solar installation connecting to Eskom or municipal supply must comply and be signed off by a registered electrician.",
      },
    ],
  },
  towing: {
    slug: "towing",
    title: "Towing & Roadside Assistance in Gauteng | 24/7 | GerboAI",
    description:
      "Book 24-hour towing and accident recovery in Johannesburg. Flatbed towing and highway recovery across Gauteng from R800 flat.",
    h1: "24-Hour Towing & Roadside Assistance in Gauteng",
    schemaType: "AutomotiveBusiness",
    faqs: [
      {
        q: "How much does towing cost in South Africa?",
        a: "Local towing within JHB typically costs R600–R1 200 flat rate. Long-distance towing is quoted per km, usually R18–R35/km depending on vehicle size.",
      },
    ],
  },
  welding: {
    slug: "welding",
    title: "Welding Services in Gauteng | Structural & Fabrication | GerboAI",
    description:
      "Find certified welders in Johannesburg and Vereeniging. Structural steel, aluminium, pipe welding and on-site fabrication. From R380/hr.",
    h1: "Certified Welding Services in Gauteng",
    schemaType: "HomeAndConstructionBusiness",
    faqs: [
      {
        q: "How much do welding services cost in South Africa?",
        a: "Welding rates in Gauteng range from R320–R550 per hour. Structural steel fabrication is often quoted per kg, typically R45–R120/kg.",
      },
    ],
  },
  flooring: {
    slug: "flooring",
    title:
      "Flooring Installation in Gauteng | Epoxy, Vinyl & Hardwood | GerboAI",
    description:
      "Book flooring companies in Johannesburg. Epoxy, vinyl plank, hardwood and commercial flooring from R180/m². Residential and commercial.",
    h1: "Flooring Installation Services in Gauteng",
    schemaType: "HomeAndConstructionBusiness",
    faqs: [
      {
        q: "How much does vinyl plank flooring cost installed in South Africa?",
        a: "Vinyl plank installation costs R180–R320 per square metre including materials and labour. Epoxy floor coatings cost R120–R280/m² depending on specification.",
      },
    ],
  },
  windows: {
    slug: "windowrepair",
    title: "Window Repair & Glazing in Gauteng | Aluminium Frames | GerboAI",
    description:
      "Book window repair specialists in Johannesburg. Double glazing, aluminium frames, shopfront glazing and glass repairs. From R350/hr.",
    h1: "Window Repair & Glazing Services in Gauteng",
    schemaType: "HomeAndConstructionBusiness",
    faqs: [
      {
        q: "How much does window glass replacement cost in South Africa?",
        a: "Replacing a standard 600×900mm pane in Gauteng costs R350–R700 including glass and labour. Larger shopfront panels are quoted individually.",
      },
    ],
  },
  education: {
    slug: "education",
    title: "Tutoring & Education Services in Gauteng | GerboAI Market",
    description:
      "Find qualified tutors in Johannesburg and Pretoria. Grade 8–12 tutoring, online and in-person sessions, Maths and Science specialists from R250/hr.",
    h1: "Tutoring & Education Services in Gauteng",
    schemaType: "EducationalOrganization",
    faqs: [
      {
        q: "How much does a tutor cost per hour in South Africa?",
        a: "Tutor rates in Gauteng range from R200–R450 per hour. Maths and Science specialists are at the higher end.",
      },
    ],
  },
  retail: {
    slug: "retail",
    title:
      "Retail Services in Gauteng | Shop Fitouts & Merchandising | GerboAI",
    description:
      "Connect with retail service providers in Johannesburg and Pretoria. Shop fitouts, merchandising and retail operations support.",
    h1: "Retail Services in Gauteng",
    schemaType: "LocalBusiness",
    faqs: [],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// SCHEMA HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function orgSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "GerboAI",
    url: MAIN,
    logo: `${MAIN}/logo.png`,
    description:
      "GerboAI is an invoicing and business management platform for African service providers, with a public marketplace connecting Gauteng businesses with verified tradespeople.",
    areaServed: { "@type": "State", name: "Gauteng", addressCountry: "ZA" },
    sameAs: [MAIN, BASE],
  };
}

function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "GerboAI Marketplace",
    url: BASE,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${BASE}/{search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

function buildFaqSchema(faqs) {
  if (!faqs?.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };
}

function buildProviderSchema(provider, industrySlug) {
  const seo = INDUSTRY_SEO[provider.industry] || INDUSTRY_SEO.all;
  return {
    "@context": "https://schema.org",
    "@type": seo.schemaType || "LocalBusiness",
    name: provider.name,
    description: provider.about,
    areaServed: {
      "@type": "City",
      name: provider.loc || provider.location || "Gauteng",
      addressCountry: "ZA",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: String(provider.rating),
      reviewCount: String(provider.reviews),
      bestRating: "5",
    },
    priceRange: provider.rate,
    url: `${BASE}/${industrySlug || ""}`,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// MarketplaceSEO
// Renders all <head> tags. Place inside PublicMarketplace just after
// <style>{css}</style>
// ─────────────────────────────────────────────────────────────────────────────
export function MarketplaceSEO({ activeFilter, providers = [] }) {
  const seo = INDUSTRY_SEO[activeFilter] || INDUSTRY_SEO.all;
  const slug = seo.slug || "";
  const canonical = slug ? `${BASE}/${slug}` : BASE;
  const faq = buildFaqSchema(seo.faqs);

  return (
    <Helmet>
      <html lang="en-ZA" />
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <link rel="canonical" href={canonical} />
      <meta name="robots" content="index, follow, max-image-preview:large" />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="GerboAI Market" />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={`${MAIN}/og-marketplace.jpg`} />
      <meta property="og:locale" content="en_ZA" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={`${MAIN}/og-marketplace.jpg`} />

      {/* South Africa geo targeting */}
      <meta name="geo.region" content="ZA-GT" />
      <meta name="geo.placename" content="Gauteng, South Africa" />
      <meta name="ICBM" content="-26.2041, 28.0473" />

      {/* Structured data */}
      <script type="application/ld+json">{JSON.stringify(orgSchema())}</script>
      <script type="application/ld+json">
        {JSON.stringify(websiteSchema())}
      </script>
      {faq && <script type="application/ld+json">{JSON.stringify(faq)}</script>}
      {providers.length > 0 && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: seo.h1,
            description: seo.description,
            numberOfItems: providers.length,
            itemListElement: providers.slice(0, 10).map((p, i) => ({
              "@type": "ListItem",
              position: i + 1,
              item: buildProviderSchema(p, slug),
            })),
          })}
        </script>
      )}
    </Helmet>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// useIndustryRoute
// Keeps the URL in sync with the active filter state.
//
// Requires these two routes in App.jsx inside the IS_SUBDOMAIN block:
//   <Route path="/"            element={<SolidMarket />} />
//   <Route path="/:industry"   element={<SolidMarket />} />
//
// Add inside PublicMarketplace component function:
//   useIndustryRoute(activeFilter, setActiveFilter);
// ─────────────────────────────────────────────────────────────────────────────
export function useIndustryRoute(activeFilter, setActiveFilter) {
  const { industry } = useParams();
  const navigate = useNavigate();

  // URL → state: direct navigation to market.gerboai.com/plumbing
  useEffect(() => {
    if (industry && INDUSTRY_SEO[industry]) {
      setActiveFilter(industry);
    } else if (!industry) {
      setActiveFilter("all");
    }
  }, [industry]);

  // state → URL: user clicks a sidebar item
  useEffect(() => {
    const slug = INDUSTRY_SEO[activeFilter]?.slug || "";
    const target = slug ? `/${slug}` : "/";
    if (window.location.pathname !== target) {
      navigate(target, { replace: true });
    }
  }, [activeFilter]);
}

// ─────────────────────────────────────────────────────────────────────────────
// MarketplaceBreadcrumb
// SEO breadcrumb with JSON-LD BreadcrumbList schema.
// Place just below the <nav> in PublicMarketplace.
// ─────────────────────────────────────────────────────────────────────────────
export function MarketplaceBreadcrumb({ activeFilter }) {
  const seo = INDUSTRY_SEO[activeFilter] || INDUSTRY_SEO.all;
  const crumbs = [
    { name: "GerboAI", url: MAIN },
    { name: "Marketplace", url: BASE },
  ];
  if (activeFilter !== "all" && seo.slug) {
    crumbs.push({
      name: seo.h1.replace(" in Gauteng", "").replace(" Services", ""),
      url: `${BASE}/${seo.slug}`,
    });
  }

  return (
    <>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: crumbs.map((c, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: c.name,
              item: c.url,
            })),
          })}
        </script>
      </Helmet>
      <nav
        aria-label="Breadcrumb"
        style={{
          padding: "10px 20px",
          fontSize: 12,
          color: "#94a3b8",
          fontFamily: "'Lato', sans-serif",
          background: "transparent",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        {crumbs.map((c, i) => (
          <span key={c.url}>
            {i > 0 && (
              <span style={{ margin: "0 6px", color: "#cbd5e1" }}>›</span>
            )}
            {i < crumbs.length - 1 ? (
              <a
                href={c.url}
                style={{ color: "#64748b", textDecoration: "none" }}
              >
                {c.name}
              </a>
            ) : (
              <span style={{ color: "#0f172a", fontWeight: 700 }}>
                {c.name}
              </span>
            )}
          </span>
        ))}
      </nav>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// IndustryFAQ
// Collapsible FAQ section in the page body — Google reads this for
// featured snippets. Place at the bottom of .mp-main, before the CTA.
// ─────────────────────────────────────────────────────────────────────────────
export function IndustryFAQ({ activeFilter }) {
  const seo = INDUSTRY_SEO[activeFilter] || INDUSTRY_SEO.all;
  if (!seo.faqs?.length) return null;

  return (
    <section
      style={{
        background: "#fff",
        borderRadius: 14,
        border: "1px solid #e2e8f0",
        padding: "32px 36px",
        marginTop: 48,
        marginBottom: 24,
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: ".1em",
          textTransform: "uppercase",
          color: "#6366f1",
          marginBottom: 8,
        }}
      >
        Frequently Asked Questions
      </div>
      <h2
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 22,
          fontWeight: 600,
          color: "#0f172a",
          marginBottom: 28,
          lineHeight: 1.2,
        }}
      >
        {seo.h1.replace(" in Gauteng", "").trim()} — Common Questions
      </h2>

      <div style={{ display: "flex", flexDirection: "column" }}>
        {seo.faqs.map(({ q, a }, i) => (
          <details
            key={i}
            style={{ borderTop: "1px solid #f1f5f9", padding: "16px 0" }}
          >
            <summary
              style={{
                fontFamily: "'Lato', sans-serif",
                fontSize: 14,
                fontWeight: 700,
                color: "#0f172a",
                cursor: "pointer",
                listStyle: "none",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              {q}
              <span
                style={{
                  color: "#6366f1",
                  fontSize: 18,
                  flexShrink: 0,
                  marginLeft: 12,
                }}
              >
                +
              </span>
            </summary>
            <p
              style={{
                marginTop: 10,
                fontSize: 14,
                color: "#475569",
                lineHeight: 1.75,
                maxWidth: 720,
              }}
            >
              {a}
            </p>
          </details>
        ))}
      </div>

      <p
        style={{
          marginTop: 24,
          fontSize: 12,
          color: "#94a3b8",
          borderTop: "1px solid #f1f5f9",
          paddingTop: 16,
        }}
      >
        Have more questions?{" "}
        <a
          href={`${MAIN}/contact`}
          style={{ color: "#6366f1", fontWeight: 700, textDecoration: "none" }}
        >
          Contact GerboAI
        </a>{" "}
        or post a job request and let providers respond directly.
      </p>
    </section>
  );
}
