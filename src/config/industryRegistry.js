import { lazy } from "react";
const FallbackSubDashboard = lazy(() =>
  import("../pages/mechanics/SubAccountDashboard")
);

// ─── Helper to register an industry ──────────────────────────────────────────
// mainPath   → existing full dashboard import path
// subPath    → sub-account dashboard path (null = use fallback until built)

const reg = (label, mainPath, subPath = null) => ({
  label,
  mainDashboard: lazy(() => import(/* @vite-ignore */ mainPath)),
  subDashboard: subPath
    ? lazy(() => import(/* @vite-ignore */ subPath))
    : FallbackSubDashboard,
});

// ─── Registry ─────────────────────────────────────────────────────────────────

export const INDUSTRY_REGISTRY = {

  mechanics: reg(
    "Motor Mechanics",
    "../pages/mechanics/MechanicsDashboard",
    "../pages/mechanics/SubAccountDashboard"
  ),

  carpentry: reg(
    "Carpentry",
    "../pages/carpentry/CarpentryDashboard",
    "../pages/carpentry/CarpentrySubAccountDashboard"
  ),

  electrical: reg(
    "Electrical",
    "../pages/electrical/ElectricalDashboard",
    "../pages/electrical/ElectricalSubAccountDashboard"
  ),

  plumbing: reg(
    "Plumbing",
    "../pages/plumbing/PlumbingDashboard",
    "../pages/plumbing/PlumbingSubAccountDashboard"
  ),

  construction: reg(
    "Construction",
    "../pages/construction/ConstructionDashboard",
    "../pages/construction/ConstructionSubAccountDashboard"
  ),

  painting: reg(
    "Painting",
    "../pages/painting/PaintingDashboard",
    "../pages/painting/PaintingSubAccountDashboard"
  ),

  flooring: reg(
    "Flooring",
    "../pages/flooring/FlooringDashboard",
    "../pages/flooring/FlooringSubAccountDashboard"
  ),

  welding: reg(
    "Welding & Fabrication",
    "../pages/welding/WeldingDashboard",
    "../pages/welding/WeldingSubAccountDashboard"
  ),

  hvac: reg(
    "HVAC",
    "../pages/hvac/HVACDashboard",
    "../pages/hvac/HVACSubAccountDashboard"
  ),

  roofing: reg(
    "Roofing",
    "../pages/roofing/RoofingDashboard",           // add when built
    "../pages/roofing/RoofingSubAccountDashboard"
  ),

  landscaping: reg(
    "Landscaping",
    "../pages/landscaping/LandscapingDashboard",
    "../pages/landscaping/LandscapingSubAccountDashboard"
  ),

  cleaning: reg(
    "Cleaning Services",
    "../pages/cleaning/CleaningDashboard",
    "../pages/cleaning/CleaningSubAccountDashboard"
  ),

  pestcontrol: reg(
    "Pest Control",
    "../pages/pest-control/PestcontrolDashboard",
    "../pages/pest-control/PestcontrolSubAccountDashboard"
  ),

  poolservices: reg(
    "Pool Services",
    "../pages/pool-services/PoolservicesDashboard",
    "../pages/pool-services/PoolservicesSubAccountDashboard"
  ),

  solarinstallation: reg(
    "Solar Installation",
    "../pages/solar-installation/SolarDashboard",
    "../pages/solar-installation/SolarSubAccountDashboard"
  ),

  windowrepair: reg(
    "Window Repair",
    "../pages/window-repair/WindowrepairDashboard",
    "../pages/window-repair/WindowrepairSubAccountDashboard"
  ),

  towing: reg(
    "Towing",
    "../pages/towing/TowingDashboard",
    "../pages/towing/TowingSubAccountDashboard"
  ),

  upholstery: reg(
    "Upholstery",
    "../pages/upholstery/UpholsteryDashboard",
    "../pages/upholstery/UpholsterySubAccountDashboard"
  ),

  security: reg(
    "Security Systems",
    "../pages/security/SecurityDashboard",
    "../pages/security/SecuritySubAccountDashboard"
  ),

  logistics: reg(
    "Transport & Logistics",
    "../pages/logistics/LogisticsDashboard",
    "../pages/logistics/LogisticsSubAccountDashboard"
  ),

  retail: reg(
    "Retail",
    "../pages/retail/RetailDashboard",
    "../pages/retail/RetailSubAccountDashboard"
  ),

  restaurant: reg(
    "Restaurant & Food",
    "../pages/restaurants/RestaurantDashboard",
    "../pages/restaurants/RestaurantSubAccountDashboard"
  ),

  hotel: reg(
    "Hotel & Hospitality",
    "../pages/hotel/HotelDashboard",
    "../pages/hotel/HotelSubAccountDashboard"
  ),

  photography: reg(
    "Photography",
    "../pages/photography/PhotographyDashboard",
    "../pages/photography/PhotographySubAccountDashboard"
  ),

  realestate: reg(
    "Real Estate",
    "../pages/realEstate/RealEstateDashboard",
    "../pages/realEstate/RealEstateSubAccountDashboard"
  ),

  education: reg(
    "Education & Tutoring",
    "../pages/education/EducationDashboard",
    "../pages/education/EducationSubAccountDashboard"
  ),

  healthcare: reg(
    "Healthcare",
    "../pages/health/HealthcareDashboard",
    "../pages/health/HealthcareSubAccountDashboard"
  ),

  legal: reg(
    "Legal Services",
    "../pages/legal/LegalDashboard",
    "../pages/legal/LegalSubAccountDashboard"
  ),

  accounting: reg(
    "Accounting & Finance",
    "../pages/accounting/AccountingDashboard",
    "../pages/accounting/AccountingSubAccountDashboard"
  ),

  technology: reg(
    "IT & Technology",
    "../pages/technology/TechnologyDashboard",
    "../pages/technology/TechnologySubAccountDashboard"
  ),

  virtualservice: reg(
    "Virtual Services",
    "../pages/virtual-services/VirtualDashboard",
    "../pages/virtual-services/VirtualSubAccountDashboard"
  ),

};

export const DEFAULT_INDUSTRY = "mechanics";

// ─── Convenience exports ───────────────────────────────────────────────────────

// All valid industry keys — useful for validation, onboarding dropdowns, etc.
export const INDUSTRY_KEYS = Object.keys(INDUSTRY_REGISTRY);

// Human-readable list — useful for <select> in onboarding or settings
export const INDUSTRY_OPTIONS = INDUSTRY_KEYS.map((key) => ({
  value: key,
  label: INDUSTRY_REGISTRY[key].label,
}));

// Safe lookup — always returns a valid entry, never undefined
export const getIndustryEntry = (industry) =>
  INDUSTRY_REGISTRY[industry] ?? INDUSTRY_REGISTRY[DEFAULT_INDUSTRY];