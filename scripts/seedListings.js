/**
 * seedListings.js
 * ─────────────────────────────────────────────────────────────────
 * Exports seedListings(ownerIds, total) — called automatically by
 * emailAccountCreator.js after accounts are created.
 *
 * Can also be run standalone:  node seedListings.js
 * (In that case put UIDs in OWNER_IDS at the bottom.)
 *
 * REQUIRES:
 *   npm install firebase-admin
 *   GOOGLE_APPLICATION_CREDENTIALS set to your service account JSON
 * ─────────────────────────────────────────────────────────────────
 */

import admin from "firebase-admin";
import { fileURLToPath } from "url";
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    // OR: credential: admin.credential.cert(require('./serviceAccountKey.json')),
  });
}

const db = admin.firestore();

// ── Helpers ───────────────────────────────────────────────────────
const rand    = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const now     = admin.firestore.Timestamp.now();

function expiresAt(daysFromNow = 30) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return admin.firestore.Timestamp.fromDate(d);
}

function toInitials(name) {
  const words = name.trim().split(/\s+/);
  return words.length >= 2
    ? (words[0][0] + words[1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
}

// ── Provinces & towns ─────────────────────────────────────────────
const LOCATIONS = {
  Gauteng: [
    "Pretoria", "Centurion", "Midrand", "Sandton", "Randburg",
    "Roodepoort", "Boksburg", "Germiston", "Benoni", "Soweto",
    "Tembisa", "Kempton Park", "Krugersdorp", "Alberton",
  ],
  Mpumalanga: [
    "Nelspruit", "Mbombela", "Witbank", "eMalahleni", "Secunda",
    "Middelburg", "Standerton", "Ermelo", "Barberton", "Hazyview",
    "White River", "Komatipoort", "Lydenburg", "Bethal",
  ],
  Limpopo: [
    "Polokwane", "Tzaneen", "Phalaborwa", "Mokopane", "Lephalale",
    "Bela-Bela", "Thohoyandou", "Louis Trichardt", "Turfloop",
    "Giyani", "Musina", "Burgersfort", "Nylstroom", "Makhado",
  ],
};

const PROVINCES = Object.keys(LOCATIONS);

// ── All 28 industries ─────────────────────────────────────────────
const INDUSTRIES = [
  {
    id: "mechanics", color: "#e0f2fe", textColor: "#0369a1",
    badges: ["Engine diagnostics", "Oil & filter change", "Brake service", "Suspension repair", "Clutch replacement", "Timing belt", "Wheel alignment", "Roadworthy inspection"],
    names: ["AutoFix", "SpeedWrench", "ProMotor", "QuickLane Auto", "MasterTech Motors"],
    abouts: [
      "Full-service automotive workshop specialising in petrol and diesel vehicles. Fast turnaround, quality parts.",
      "Experienced mechanics handling everything from routine services to complex engine overhauls.",
    ],
  },
  {
    id: "healthcare", color: "#fce7f3", textColor: "#9d174d",
    badges: ["General consultations", "Chronic disease management", "Wound care", "Vaccinations", "Blood pressure monitoring"],
    names: ["MediCare Clinic", "HealthFirst", "WellBeing Centre", "FamilyCare Medical"],
    abouts: [
      "Affordable primary healthcare services for families and individuals. Walk-ins welcome.",
      "Comprehensive medical consultations, chronic medication management, and preventive care.",
    ],
  },
  {
    id: "security", color: "#fef3c7", textColor: "#92400e",
    badges: ["Armed response", "CCTV installation", "Access control", "Electric fencing", "Security guarding"],
    names: ["GuardPro Security", "ShieldForce", "SafeZone Solutions", "SentryWatch"],
    abouts: [
      "Professional security solutions including armed response, CCTV installation, and access control.",
      "24/7 monitored alarm systems and armed response for residential and commercial clients.",
    ],
  },
  {
    id: "electrical", color: "#fef9c3", textColor: "#713f12",
    badges: ["DB board upgrades", "Load shedding solutions", "Solar installation", "Fault finding", "Wiring & rewiring"],
    names: ["WattWise Electrical", "PowerUp Sparks", "VoltMaster", "BrightWire Electricians"],
    abouts: [
      "Qualified electricians for residential and commercial projects. COC certificates issued.",
      "From DB board upgrades to full solar setups — reliable electrical work at fair rates.",
    ],
  },
  {
    id: "restaurant", color: "#fce7f3", textColor: "#831843",
    badges: ["Dine-in", "Takeaways", "Catering", "Halaal", "Vegetarian options"],
    names: ["Spice Garden", "The Braai Spot", "Mama's Kitchen", "Urban Bites", "Flame & Fork"],
    abouts: [
      "Family restaurant serving hearty African meals. Fresh ingredients, generous portions.",
      "Street food-inspired eatery with bold flavours, quick service, and dine-in or takeaway.",
    ],
  },
  {
    id: "construction", color: "#ffedd5", textColor: "#7c2d12",
    badges: ["Renovations", "New builds", "Plastering", "Paving", "Roofing", "Tiling"],
    names: ["BuildRight Construction", "StructurePro", "Foundation Masters", "SolidBuild"],
    abouts: [
      "Experienced construction team for residential and commercial builds, renovations, and repairs.",
      "Full-service construction company handling new builds, extensions, and property renovations.",
    ],
  },
  {
    id: "cleaning", color: "#ecfdf5", textColor: "#065f46",
    badges: ["Deep cleaning", "Office cleaning", "Carpet cleaning", "Post-construction cleanup", "Move-in/out cleaning"],
    names: ["SparkleClean", "FreshStart Cleaning", "CleanPro Services", "Shine & Shine"],
    abouts: [
      "Professional cleaning services for homes and offices. Eco-friendly products available.",
      "Thorough, reliable cleaning teams available 7 days a week. No job too big or too small.",
    ],
  },
  {
    id: "education", color: "#ede9fe", textColor: "#4c1d95",
    badges: ["Matric tutoring", "Maths & Science", "English lessons", "After-school care", "Online tutoring"],
    names: ["BrainBoost Tutors", "SmartKids Academy", "EduEdge", "LearnFirst Centre"],
    abouts: [
      "Qualified tutors offering one-on-one and group sessions for Grades 4–12.",
      "Helping learners achieve academic excellence with focused, personalised tuition.",
    ],
  },
  {
    id: "hotel", color: "#f0fdf4", textColor: "#14532d",
    badges: ["B&B", "Self-catering", "Conference facilities", "Pet-friendly", "Pool access"],
    names: ["Sunset Lodge", "The Guesthouse Co.", "Hillview Retreat", "Acacia Stay"],
    abouts: [
      "Comfortable guesthouse accommodation with warm hospitality and home-cooked breakfasts.",
      "Modern self-catering units for business and leisure travellers. Wi-Fi and DSTV included.",
    ],
  },
  {
    id: "legal", color: "#f5f3ff", textColor: "#3730a3",
    badges: ["Contract drafting", "Eviction notices", "Wills & estates", "Labour disputes", "Debt collection"],
    names: ["LexPro Attorneys", "Justice First Legal", "The Law Studio", "ClearCase Legal"],
    abouts: [
      "Practical legal services for individuals and small businesses. Consultations available.",
      "Affordable legal advice covering contracts, property, labour, and family law matters.",
    ],
  },
  {
    id: "plumbing", color: "#eff6ff", textColor: "#1e3a8a",
    badges: ["Burst pipes", "Leak detection", "Geyser installation", "Drain unblocking", "Water meter faults"],
    names: ["FlowFix Plumbing", "PipePro", "DrainMaster", "AquaFix Solutions"],
    abouts: [
      "Qualified plumbers available for emergencies and planned installations. 24/7 call-out.",
      "Fast, reliable plumbing services for residential and commercial properties.",
    ],
  },
  {
    id: "retail", color: "#fff7ed", textColor: "#9a3412",
    badges: ["Electronics", "Clothing", "Hardware", "Groceries", "Appliances"],
    names: ["ValueMart", "TownShop", "QuickMart", "LocalStore"],
    abouts: [
      "Your neighbourhood store for everyday essentials, electronics, and household goods.",
      "Stocking quality brands at competitive prices. Delivery available within 10km.",
    ],
  },
  {
    id: "landscaping", color: "#f0fdf4", textColor: "#166534",
    badges: ["Garden design", "Lawn mowing", "Tree felling", "Irrigation systems", "Paving & rockery"],
    names: ["GreenThumb Landscapes", "Garden Artisans", "TurfMaster", "NatureScapes"],
    abouts: [
      "Professional landscaping and garden maintenance for residential and corporate clients.",
      "Transforming outdoor spaces with creative garden designs, paving, and irrigation solutions.",
    ],
  },
  {
    id: "logistics", color: "#f8fafc", textColor: "#334155",
    badges: ["Same-day delivery", "Furniture removal", "Courier services", "Warehousing", "Long-distance transport"],
    names: ["SwiftMove Logistics", "CargoLink", "HaulPro Transport", "QuickShift"],
    abouts: [
      "Reliable logistics and courier services across South Africa. Tracked deliveries.",
      "Furniture removal, courier, and freight solutions for businesses and individuals.",
    ],
  },
  {
    id: "photography", color: "#fdf4ff", textColor: "#701a75",
    badges: ["Weddings", "Corporate events", "Portraits", "Real estate", "Product photography"],
    names: ["LensArt Studio", "CapturePro Photography", "Golden Hour Photos", "PixelPerfect"],
    abouts: [
      "Award-winning photography studio capturing life's most important moments in stunning detail.",
      "Professional photographer available for weddings, portraits, and commercial shoots.",
    ],
  },
  {
    id: "realestate", color: "#f0f9ff", textColor: "#075985",
    badges: ["Property sales", "Rentals", "Property management", "Valuations", "Commercial leasing"],
    names: ["HomeFinders Realty", "PropertyPro", "EstateEdge", "KeyHolders"],
    abouts: [
      "Experienced property practitioners assisting buyers, sellers, and landlords.",
      "Residential and commercial real estate services. Honest advice, quick results.",
    ],
  },
  {
    id: "flooring", color: "#fefce8", textColor: "#854d0e",
    badges: ["Laminate installation", "Epoxy flooring", "Tiles", "Vinyl flooring", "Polished concrete"],
    names: ["FloorCraft", "TileRight", "SurfacePro", "GroundLevel Flooring"],
    abouts: [
      "Expert flooring installers for homes and commercial spaces. Free quotes available.",
      "From tiles to epoxy — professional flooring solutions delivered on time.",
    ],
  },
  {
    id: "hvac", color: "#ecfeff", textColor: "#164e63",
    badges: ["Aircon installation", "Aircon service", "Heat pumps", "Ventilation systems", "Refrigeration"],
    names: ["CoolBreeze HVAC", "AirPro Systems", "ClimateControl SA", "FrostLine HVAC"],
    abouts: [
      "Certified HVAC technicians for installations, services, and repairs of all major brands.",
      "Keeping your spaces cool in summer and warm in winter — efficient, affordable HVAC solutions.",
    ],
  },
  {
    id: "accounting", color: "#f0fdf4", textColor: "#14532d",
    badges: ["Bookkeeping", "Tax returns", "Payroll", "VAT submissions", "Financial statements"],
    names: ["NumbersRight Accounting", "ClearBooks", "TaxPro Advisors", "FinanceFirst"],
    abouts: [
      "Qualified accountants and tax practitioners serving SMEs and sole traders.",
      "Accurate bookkeeping, SARS submissions, and financial reporting for your business.",
    ],
  },
  {
    id: "painting", color: "#fff1f2", textColor: "#881337",
    badges: ["Interior painting", "Exterior painting", "Waterproofing", "Texture finishes", "Roof painting"],
    names: ["ColorCraft Painters", "BrushPro", "PaintRight SA", "FreshCoat Painters"],
    abouts: [
      "Experienced painting contractors for residential and commercial properties.",
      "Quality interior and exterior painting with premium paints. Neat, professional finish guaranteed.",
    ],
  },
  {
    id: "pestcontrol", color: "#fef2f2", textColor: "#7f1d1d",
    badges: ["Cockroach treatment", "Rodent control", "Termite treatment", "Bed bug treatment", "Fumigation"],
    names: ["PestAway", "BugBusters SA", "ClearNest Pest Control", "ShieldPest"],
    abouts: [
      "HACCP-compliant pest control services for homes, restaurants, and warehouses.",
      "Safe, effective pest elimination using approved products. Guaranteed results.",
    ],
  },
  {
    id: "poolservices", color: "#ecfeff", textColor: "#0e7490",
    badges: ["Pool cleaning", "Chemical balancing", "Pump & filter repairs", "Pool plastering", "New pool builds"],
    names: ["AquaClear Pools", "PoolPro SA", "BlueWave Pool Services", "SplashTech"],
    abouts: [
      "Professional pool cleaning, maintenance, and repairs for residential and commercial pools.",
      "Weekly pool maintenance contracts available. Keep your pool sparkling year-round.",
    ],
  },
  {
    id: "solarinstallation", color: "#fffbeb", textColor: "#78350f",
    badges: ["Solar panels", "Inverters", "Battery backup", "Grid-tied systems", "Load shedding solutions"],
    names: ["SunPower Solar", "BrightSolar SA", "EcoEnergy Solutions", "SolarEdge Installers"],
    abouts: [
      "Certified solar installers providing complete energy solutions to beat load shedding.",
      "Custom solar system design, supply, and installation. Finance options available.",
    ],
  },
  {
    id: "towing", color: "#fef3c7", textColor: "#78350f",
    badges: ["24/7 towing", "Accident recovery", "Long-distance towing", "Bike towing", "Flatbed towing"],
    names: ["TowRight SA", "QuickTow", "RoadRescue Towing", "HaulAway"],
    abouts: [
      "24-hour towing and roadside assistance. Fast response times across the province.",
      "Professional vehicle recovery and towing service. All vehicle types accommodated.",
    ],
  },
  {
    id: "welding", color: "#fff7ed", textColor: "#9a3412",
    badges: ["Steel fabrication", "Gate repairs", "Burglar bars", "Custom metalwork", "Mobile welding"],
    names: ["IronCraft Welding", "SparkWeld", "SteelPro Fabrication", "MetalWorks SA"],
    abouts: [
      "Qualified welders specialising in structural steel, gates, burglar bars, and custom fabrication.",
      "Mobile welding service available on-site. Quality workmanship, competitive rates.",
    ],
  },
  {
    id: "carpentry", color: "#fdf6ec", textColor: "#7c4a1e",
    badges: ["Custom furniture", "Built-in cupboards", "Door frames", "Decking", "Wood repairs"],
    names: ["WoodCraft Carpentry", "GrainWork", "TimberPro SA", "FineCraft Joinery"],
    abouts: [
      "Skilled carpenters crafting custom furniture, built-in cupboards, and wooden structures.",
      "Quality woodwork for homes and offices — from decking to fitted kitchens.",
    ],
  },
  {
    id: "window-repair", color: "#f0f9ff", textColor: "#0c4a6e",
    badges: ["Glass replacement", "Aluminium windows", "Double glazing", "Shower doors", "Shopfront glazing"],
    names: ["ClearView Glass", "GlassPro SA", "WindowFix", "PanePerfect"],
    abouts: [
      "Fast glass replacement and window repairs for homes and commercial buildings.",
      "Aluminium window installation, glass cutting, and emergency glazing services.",
    ],
  },
];

const RATES          = ["Custom quote", "R350/hr", "R450/hr", "R500/hr", "R600/hr", "R750/hr", "From R200", "From R500", "POA"];
const RESPONSE_TIMES = ["~15 min", "~20 min", "~30 min", "~45 min", "~1 hr", "~2 hrs"];
const PLACEHOLDER    = "https://placehold.co/800x400/e2e8f0/64748b?text=Listing+Image";

// ─────────────────────────────────────────────────────────────────
// buildListing — generates one Firestore document
// ownerId is picked randomly from the array of created UIDs
// ─────────────────────────────────────────────────────────────────
function buildListing(industry, ownerIds) {
  const province     = rand(PROVINCES);
  const town         = rand(LOCATIONS[province]);
  const baseName     = rand(industry.names);
  const businessName = `${baseName} ${town}`;
  const badgeCount   = randInt(2, 5);
  const badges       = [...industry.badges]
    .sort(() => Math.random() - 0.5)
    .slice(0, badgeCount)
    .map((label) => ({ label, type: "blue" }));

  return {
    about:        rand(industry.abouts),
    active:       true,
    available:    true,
    badges,
    businessName,
    color:        industry.color,
    expiresAt:    expiresAt(randInt(7, 90)),
    featured:     Math.random() < 0.1,
    imageUrl:     PLACEHOLDER,
    industry:     industry.id,
    initials:     toInitials(businessName),
    location:     `${town}, ${province}`,
    name:         businessName,
    ownerId:      rand(ownerIds),   // ← one of the just-created accounts
    rate:         rand(RATES),
    rating:       0,
    response:     rand(RESPONSE_TIMES),
    reviews:      0,
    textColor:    industry.textColor,
    updatedAt:    now,
    province,
  };
}

// ─────────────────────────────────────────────────────────────────
// seedListings (named export — called by emailAccountCreator)
// ─────────────────────────────────────────────────────────────────
export async function seedListings(ownerIds = [], totalListings = 100) {
  if (!ownerIds.length) throw new Error("ownerIds array is empty.");

  console.log(`🌍 Seeding ${totalListings} listings across ${PROVINCES.join(", ")}...`);
  console.log(`👤 Distributing across ${ownerIds.length} owner account(s)\n`);

  let committed = 0;
  let batch     = db.batch();
  let batchSize = 0;

  for (let i = 0; i < totalListings; i++) {
    const industry = INDUSTRIES[i % INDUSTRIES.length];
    const doc      = buildListing(industry, ownerIds);
    const ref      = db.collection("listings").doc();
    batch.set(ref, doc);
    batchSize++;

    // Firestore batch limit = 500; flush early to stay safe
    if (batchSize === 490) {
      await batch.commit();
      committed += batchSize;
      console.log(`  ✔ Committed ${committed} listings so far...`);
      batch     = db.batch();
      batchSize = 0;
    }
  }

  if (batchSize > 0) {
    await batch.commit();
    committed += batchSize;
  }

  console.log(`\n✅ Done! ${committed} listings seeded into Firestore.\n`);
}

// ─────────────────────────────────────────────────────────────────
// Standalone usage (only if emailAccountCreator isn't being used)
// ─────────────────────────────────────────────────────────────────

const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
  // Paste real UIDs here only if running this file independently
  const OWNER_IDS = [
    "REPLACE_WITH_REAL_UID_1",
    "REPLACE_WITH_REAL_UID_2",
  ];

  seedListings(OWNER_IDS, 100).catch((err) => {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  });
}