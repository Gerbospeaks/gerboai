import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { injectDynamicManifest } from "./utils/generateManifest";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { AdminProvider } from "./contexts/AdminContext";
import { getSubdomainFromHost } from "./utils/subdomain";
import ProtectedRoute from "./components/ProtectedRoute";
import { DASHBOARD_ID_TO_PATH } from "./constants/dashboardPaths";
import PWAInstallPrompt from "./components/Pwainstallprompt";
import LandingPage from "./pages/LandingPage";
import Register from "./pages/Register";
import Login from "./pages/Login";
import { PlanProvider } from "./pages/technology/planGating";
import AboutPage from "./pages/AboutPage";
import { useIsStandalone } from "./hooks/useIsStandalone";
import ContactPage from "./pages/ContactPage";
import BlogPostPage from "./pages/BlogPostPage";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsPage from "./pages/TermsPage";
import AuthAction from "./pages/AuthAction";
import DashboardRouter from "./components/DashboardRouter";
import FinancialOverview from "./pages/FinancialOverview";
import AdminDashboard from "./pages/AdminDashboard";
import TemplateSelector from "./pages/accounting/TemplateSelector";
import SolidMarket from "./pages/PublicMarketplace";
import SolidEducare from "./pages/education/SubdomainLandingPage";
import SolidMechanic from "./pages/mechanics/SubdomainLandingPage";
import SolidAccountant from "./pages/accounting/SubdomainLandingPage";
import SolidCleaner from "./pages/cleaning/SubdomainLandingPage";
import SolidWelder from "./pages/welding/SubdomainLandingPage";
import SolidCarpenter from "./pages/carpentry/SubdomainLandingPage";
import SolidConstructor from "./pages/construction/SubdomainLandingPage";
import SolidElectrical from "./pages/electrical/SubdomainLandingPage";
import SolidFlooring from "./pages/flooring/SubdomainLandingPage";
import SolidHealth from "./pages/health/SubdomainLandingPage";
import SolidHotel from "./pages/hotel/SubdomainLandingPage";
import SolidHVAC from "./pages/hvac/SubdomainLandingPage";
import SolidTechnology from "./pages/technology/SubdomainLandingPage";
import SolidUpholstery from "./pages/upholstery/SubdomainLandingPage";
import SolidVirtual from "./pages/virtual-services/SubdomainLandingPage";
import SolidLandscaping from "./pages/landscaping/SubdomainLandingPage";
import SolidLegal from "./pages/legal/SubdomainLandingPage";
import SolidLogistics from "./pages/logistics/SubdomainLandingPage";
import SolidPainting from "./pages/painting/SubdomainLandingPage";
import SolidPestControl from "./pages/pest-control/SubdomainLandingPage";
import SolidPhotography from "./pages/photography/SubdomainLandingPage";
import SolidPlumbing from "./pages/plumbing/SubdomainLandingPage";
import SolidPoolService from "./pages/pool-services/SubdomainLandingPage";
import SolidRealEstate from "./pages/realEstate/SubdomainLandingPage";
import SolidRestaurant from "./pages/restaurants/SubdomainLandingPage";
import SolidRetail from "./pages/retail/SubdomainLandingPage";
import SolidSecurity from "./pages/security/SubdomainLandingPage";
import SolidSolar from "./pages/solar-installation/SubdomainLandingPage";
import SolidTowing from "./pages/towing/SubdomainLandingPage";
import SolidWindowRepair from "./pages/window-repair/SubdomainLandingPage";
import SubdomainAuthPage from "./pages/SubdomainAuthPage";
import PublicMarketplace from "./pages/PublicMarketplace";
import SolidFloAgent from "./components/SolidFloAgent/SolidFloAgent";
import MechanicsDashboard from "./pages/mechanics/MechanicsDashboard";
import SecurityDashboard from "./pages/security/SecurityDashboard";
import TechnologyDashboard from "./pages/technology/TechnologyDashboard";
import UpholsteryDashboard from "./pages/upholstery/UpholsteryDashboard";
import VirtualDashboard from "./pages/virtual-services/VirtualDashboard";
import HealthcareDashboard from "./pages/health/HealthcareDashboard";
import ElectricalDashboard from "./pages/electrical/ElectricalDashboard";
import RestaurantDashboard from "./pages/restaurants/RestaurantDashboard";
import ConstructionDashboard from "./pages/construction/ConstructionDashboard";
import CleaningDashboard from "./pages/cleaning/CleaningDashboard";
import EducationDashboard from "./pages/education/EducationDashboard";
import HotelDashboard from "./pages/hotel/HotelDashboard";
import LegalDashboard from "./pages/legal/LegalDashboard";
import PlumbingDashboard from "./pages/plumbing/PlumbingDashboard";
import RetailDashboard from "./pages/retail/RetailDashboard";
import LandscapingDashboard from "./pages/landscaping/LandscapingDashboard";
import LogisticsDashboard from "./pages/logistics/LogisticsDashboard";
import PhotographyDashboard from "./pages/photography/PhotographyDashboard";
import RealEstateDashboard from "./pages/realEstate/RealEstateDashboard";
import FlooringDashboard from "./pages/flooring/FlooringDashboard";
import WeldingDashboard from "./pages/welding/WeldingDashboard";
import PaintingDashboard from "./pages/painting/PaintingDashboard";
import PestcontrolDashboard from "./pages/pest-control/PestcontrolDashboard";
import PoolservicesDashboard from "./pages/pool-services/PoolservicesDashboard";
import SolarDashboard from "./pages/solar-installation/SolarDashboard";
import TowingDashboard from "./pages/towing/TowingDashboard";
import WindowrepairDashboard from "./pages/window-repair/WindowrepairDashboard";
import HVACDashboard from "./pages/hvac/HVACDashboard";
import CarpentryDashboard from "./pages/carpentry/CarpentryDashboard";
import AccountingDashboard from "./pages/accounting/AccountingDashboard";
import Vehicles from "./pages/mechanics/Vehicles";
import Templates from "./pages/mechanics/Templates";
import PartsInventory from "./pages/mechanics/PartsInventory";
import HistoryView from "./pages/mechanics/HistoryView";
import SignatureStamp from "./pages/mechanics/SignatureStamp";
import PracticeOverview from "./pages/health/PracticeOverview";
import PendingPayments from "./pages/health/PendingPayments";
import AppointmentsCalendar from "./pages/health/AppointmentsCalendar";
import NotesView from "./pages/cleaning/NotesView";
import ParentPortal from "./pages/education/ParentPortal";
import StaffPortal from "./pages/education/StaffPortal";
import { useSubAccount } from "./hooks/useSubAccount";
import SubAccountDashboard from "./pages/mechanics/SubAccountDashboard";
 import GuestMenuPage from "./pages/hotel/GuestMenuPage"; 
 import MenuSignagePage from "./pages/hotel/MenuSignagePage";
const IS_SUBDOMAIN = !!getSubdomainFromHost();

const PUBLIC_ROUTES = new Set([
  "/",
  "/about",
  "/contact",
  "/blogs",
  "/privacy",
  "/terms",
  "/login",
  "/register",
  "/auth-action",
]);

// ─── Full-page spinner shown while Firebase resolves auth state ───────────────
export function AppLoader() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        width: "100vw",
        background: "#f8f9fc",
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          border: "4px solid #e5e7eb",
          borderTop: "4px solid #1655e0",
          borderRadius: "50%",
          animation: "spin 0.75s linear infinite",
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── Redirect logged-in, verified users away from auth pages ─────────────────
function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <AppLoader />;
  // Only redirect if email is verified — unverified users stay on login
  if (user && user.emailVerified) return <Navigate to="/dashboard" replace />;
  return children;
}

function PWAGate() {
  const { loading } = useAuth();
  const { pathname } = useLocation();

  if (loading) return null;

  const isPublic =
    PUBLIC_ROUTES.has(pathname) ||
    pathname.startsWith("/parents/") ||
    pathname.startsWith("/staff/") || 
    pathname.startsWith("/menu/") || 
    pathname.startsWith("/display/");

  if (isPublic) return null;
  return <PWAInstallPrompt appReady={true} />;
}

// ─── Dev-tools & right-click lock ────────────────────────────────────────────
function useSecurityLock() {
  useEffect(() => {
    const block = (e) => e.preventDefault();
    const blockKeys = (e) => {
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && ["I", "J", "C"].includes(e.key)) ||
        (e.ctrlKey && ["u", "s", "c", "a"].includes(e.key))
      )
        e.preventDefault();
    };
    document.addEventListener("contextmenu", block);
    document.addEventListener("keydown", blockKeys);
    return () => {
      document.removeEventListener("contextmenu", block);
      document.removeEventListener("keydown", blockKeys);
    };
  }, []);
}

function ProtectedDashboard() {
  const { authUser } = useAuth();              
  const { parentUid, loading } = useSubAccount(authUser);

  if (loading) return <AppLoader />;           

  if (parentUid) {
   
    return <SubAccountDashboard parentUid={parentUid} subUser={authUser} />;
  }

 
  return <MechanicsDashboard />;
}
function DashboardRoutes() {
  const { userDashboard } = useAuth();
  return (
   <>
   
   <Routes>
      {/* 
        /dashboard is the entry point after login.
        DashboardRouter reads userDashboard from AuthContext
        and navigates to the correct industry path below.
      */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardRouter />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/home" element={<Navigate to="/dashboard" replace />} />

      <Route
        path="/financial-overview"
        element={
          <ProtectedRoute>
            <FinancialOverview />
          </ProtectedRoute>
        }
      />
      <Route
        path="/template-renderer"
        element={
          <ProtectedRoute>
            <TemplateSelector />
          </ProtectedRoute>
        }
      />

      {/* ── Mechanics ── */}
      <Route
        path="/mechanics"
        element={
          <ProtectedRoute>
           <ProtectedDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/history-view"
        element={
          <ProtectedRoute>
            <HistoryView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/signature"
        element={
          <ProtectedRoute>
            <SignatureStamp />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vehicles"
        element={
          <ProtectedRoute>
            <Vehicles />
          </ProtectedRoute>
        }
      />
      <Route
        path="/templates"
        element={
          <ProtectedRoute>
            <Templates />
          </ProtectedRoute>
        }
      />
      <Route
        path="/parts-inventory"
        element={
          <ProtectedRoute>
            <PartsInventory />
          </ProtectedRoute>
        }
      />

      {/* ── Healthcare ── */}
      <Route
        path="/healthcare"
        element={
          <ProtectedRoute>
            <HealthcareDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/practice-overview"
        element={
          <ProtectedRoute>
            <PracticeOverview />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pending-payments"
        element={
          <ProtectedRoute>
            <PendingPayments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/appointments"
        element={
          <ProtectedRoute>
            <AppointmentsCalendar />
          </ProtectedRoute>
        }
      />

      {/* ── All other industries ── */}
      <Route
        path="/security"
        element={
          <ProtectedRoute>
            <SecurityDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/electrical"
        element={
          <ProtectedRoute>
            <ElectricalDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/restaurant"
        element={
          <ProtectedRoute>
            <RestaurantDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/construction"
        element={
          <ProtectedRoute>
            <ConstructionDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/technology"
        element={
          <ProtectedRoute>
           
        <TechnologyDashboard />
               
          </ProtectedRoute>
        }
      />
      <Route
        path="/upholstery"
        element={
          <ProtectedRoute>
            <UpholsteryDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/virtualservice"
        element={
          <ProtectedRoute>
            <VirtualDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cleaning"
        element={
          <ProtectedRoute>
            <CleaningDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notesview"
        element={
          <ProtectedRoute>
            <NotesView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/education"
        element={
          <ProtectedRoute>
            <EducationDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hotel"
        element={
          <ProtectedRoute>
            <HotelDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/legal"
        element={
          <ProtectedRoute>
            <LegalDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/plumbing"
        element={
          <ProtectedRoute>
            <PlumbingDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/retail"
        element={
          <ProtectedRoute>
            <RetailDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/landscaping"
        element={
          <ProtectedRoute>
            <LandscapingDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/logistics"
        element={
          <ProtectedRoute>
            <LogisticsDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/photography"
        element={
          <ProtectedRoute>
            <PhotographyDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/realestate"
        element={
          <ProtectedRoute>
            <RealEstateDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/flooring"
        element={
          <ProtectedRoute>
            <FlooringDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hvac"
        element={
          <ProtectedRoute>
            <HVACDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/accounting"
        element={
          <ProtectedRoute>
            <AccountingDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/painting"
        element={
          <ProtectedRoute>
            <PaintingDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pestcontrol"
        element={
          <ProtectedRoute>
            <PestcontrolDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/poolservices"
        element={
          <ProtectedRoute>
            <PoolservicesDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/solarinstallation"
        element={
          <ProtectedRoute>
            <SolarDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/towing"
        element={
          <ProtectedRoute>
            <TowingDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/welding"
        element={
          <ProtectedRoute>
            <WeldingDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/carpentry"
        element={
          <ProtectedRoute>
            <CarpentryDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/windowrepair"
        element={
          <ProtectedRoute>
            <WindowrepairDashboard />
          </ProtectedRoute>
        }
      />
{/* ── Education portals (intentionally unprotected ── public links for parents/staff) ── */}
    <Route path="/parents/:portalSlug" element={<ParentPortal />} /> <Route path="/staff/:portalSlug" element={<StaffPortal />} /> 
    {/* ── Hotel guest menu (intentionally unprotected ── public QR link + TV signage) ── */} 
    <Route path="/menu/:propertyId" element={<GuestMenuPage />} /> 
   <Route path="/display/:propertyId" element={<MenuSignagePage />} />
    <Route path="*" element={<Navigate to="/" replace />} /> 
      {/* ── Education portals (intentionally unprotected — public links for parents/staff) ── */}
      <Route path="/parents/:portalSlug" element={<ParentPortal />} />
      <Route path="/staff/:portalSlug" element={<StaffPortal />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    <SolidFloAgent industry={userDashboard || "general"} />
</>
  );
}

// ─── Subdomain landing page map ───────────────────────────────────────────────
const SUBDOMAIN_LANDING = {
  education: SolidEducare,
  mechanics: SolidMechanic,
  accounting: SolidAccountant,
  cleaning: SolidCleaner,
  carpentry: SolidCarpenter,
  construction: SolidConstructor,
  electrical: SolidElectrical,
  flooring: SolidFlooring,
  market: SolidMarket,
  health: SolidHealth,
  healthcare: SolidHealth,
  hotel: SolidHotel,
  hvac: SolidHVAC,
  landscaping: SolidLandscaping,
  legal: SolidLegal,
  logistics: SolidLogistics,
  painting: SolidPainting,
  pestcontrol: SolidPestControl,
  photography: SolidPhotography,
  plumbing: SolidPlumbing,
  poolservices: SolidPoolService,
  realestate: SolidRealEstate,
  restaurant: SolidRestaurant,
  retail: SolidRetail,
  security: SolidSecurity,
  solarinstallation: SolidSolar,
  towing: SolidTowing,
  welding: SolidWelder,
  technology: SolidTechnology,
  upholstery: SolidUpholstery,
  virtualservice: SolidVirtual,
  windowrepair: SolidWindowRepair,
};

function SubdomainRoot() {
  const subdomain = getSubdomainFromHost();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (user && user.emailVerified) {
      navigate("/dashboard", { replace: true });
    }
   
  }, [loading, user, navigate]);

  if (loading) return <AppLoader />;
  if (user && user.emailVerified) return <AppLoader />; 

  const LandingComponent = SUBDOMAIN_LANDING[subdomain];
  if (LandingComponent) return <LandingComponent />;

  
  return <Navigate to="/login" replace />;
}
function RedirectToSubdomainAuth({ mode }) {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const industry =
      params.get("industry") ||
      localStorage.getItem("pendingDashboardId") ||
      "mechanics"; // sensible default

    const sub = DASHBOARD_ID_TO_PATH[industry] ? industry : "mechanics";
    window.location.href = `https://${sub}.solidflo.co.za/${mode}?industry=${industry}`;
  }, [mode]);

  return <AppLoader />;
}
function MainDomainRoot() {
  const { user, loading } = useAuth();
  const isStandalone = useIsStandalone();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (user && user.emailVerified) {
      navigate("/dashboard", { replace: true });
      return;
    }
    if (isStandalone) {
      // Main domain has no login — redirect to your mechanics or default subdomain
      window.location.href = "https://mechanics.solidflo.co.za/login";
    }
  }, [loading, user, navigate, isStandalone]);

  if (loading) return <AppLoader />;
  return <LandingPage />;
}
// ─── Main App ─────────────────────────────────────────────────────────────────
function App() {
  useSecurityLock();
useEffect(() => {
    const subdomain = getSubdomainFromHost();
    if (subdomain) injectDynamicManifest(subdomain);
  }, []);
  return (
    <Router>
      <AuthProvider>
        <AdminProvider>
          {IS_SUBDOMAIN ? (
            // ── SUBDOMAIN (e.g. mechanics.solidflo.co.za) ──────────────────
            <Routes>
              <Route path="/" element={<SubdomainRoot />} />

              {/* 
                Login: SubdomainAuthPage reads pathname to show LoginView.
                After successful Firebase sign-in it navigates to /dashboard.
                DashboardRouter then reads userDashboard from AuthContext
                and redirects to the correct industry dashboard path.
              */}
              <Route
                path="/login"
                element={
                  <PublicOnlyRoute>
                    <SubdomainAuthPage />
                  </PublicOnlyRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicOnlyRoute>
                    <SubdomainAuthPage />
                  </PublicOnlyRoute>
                }
              />

              <Route path="/market" element={<SolidMarket />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/auth-action" element={<AuthAction />} />
              <Route
                path="/marketplace/:industry"
                element={<PublicMarketplace />}
              />
              {/* PWAGate lives inside Router so useLocation works */}
              <Route
                path="/*"
                element={
                  <>
                    <PWAGate />
                    <DashboardRoutes />
                  </>
                }
              />
            </Routes>
          ) : (
            // ── MAIN DOMAIN (solidflo.co.za) ──────────────────────────────
            <Routes>
              <Route path="/" element={<MainDomainRoot />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/blogs" element={<BlogPostPage />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/auth-action" element={<AuthAction />} />

              {/* Auth is subdomain-only — block direct access on main domain */}
   <Route
  path="/login"
  element={
    <PublicOnlyRoute>
      <Login />
    </PublicOnlyRoute>
  }
/>
<Route
  path="/register"
  element={
    <PublicOnlyRoute>
      <Register />
    </PublicOnlyRoute>
  }
/>

              <Route
                path="/*"
                element={
                  <>
                    <PWAGate />
                    <DashboardRoutes />
                  </>
                }
              />
            </Routes>
          )}
        </AdminProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
