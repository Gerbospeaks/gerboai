import React from 'react';
import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AdminProvider } from './contexts/AdminContext';
import ProtectedRoute from './components/ProtectedRoute';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import LandingPage from './pages/LandingPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import BlogPostPage from './pages/BlogPostPage';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsPage from './pages/TermsPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/HomeView';
import DashboardRouter from './components/DashboardRouter';
import FinancialOverview from './pages/FinancialOverview';
import AdminDashboard from './pages/AdminDashboard';
import MechanicsDashboard from './pages/mechanics/MechanicsDashboard';
import SecurityDashboard from './pages/security/SecurityDashboard';
import HealthcareDashboard from './pages/health/HealthcareDashboard';
import ElectricalDashboard from './pages/electrical/ElectricalDashboard';
import RestaurantDashboard from './pages/restaurants/RestaurantDashboard';
import ConstructionDashboard from './pages/construction/ConstructionDashboard';
import CleaningDashboard from './pages/cleaning/CleaningDashboard';
import EducationDashboard from './pages/education/EducationDashboard';
import HotelDashboard from './pages/hotel/HotelDashboard';
import LegalDashboard from './pages/legal/LegalDashboard';
import PlumbingDashboard from './pages/plumbing/PlumbingDashboard';
import RetailDashboard from './pages/retail/RetailDashboard';
import LandscapingDashboard from './pages/landscaping/LandscapingDashboard';
import LogisticsDashboard from './pages/logistics/LogisticsDashboard';
import PhotographyDashboard from './pages/photography/PhotographyDashboard';
import RealEstateDashboard from './pages/realEstate/RealEstateDashboard';
import FlooringDashboard from './pages/flooring/FlooringDashboard';
import WeldingDashboard from './pages/welding/WeldingDashboard';  
import PaintingDashboard from './pages/painting/PaintingDashboard';
import PestcontrolDashboard from './pages/pest-contrrol/PestcontrolDashboard';
import PoolservicesDashboard from './pages/pool-services/PoolservicesDashboard';
import SolarDashboard from './pages/solar-installation/SolarDashboard'; 
import TowingDashboard from './pages/towing/TowingDashboard';
import WindowrepairDashboard from './pages/window-repair/WindowrepairDashboard';  
import HVACDashboard from './pages/hvac/HVACDashboard';
import CarpentryDashboard from './pages/carpentry/CarpentryDashboard';
import AccountingDashboard from './pages/accounting/AccountingDashboard';
import AuthAction from './pages/AuthAction';
import PracticeOverview from './pages/health/PracticeOverview';
import PendingPayments from './pages/health/PendingPayments';
import AppointmentsCalendar from './pages/health/AppointmentsCalendar';
import Vehicles from './pages/mechanics/Vehicles';
import Templates from './pages/mechanics/Templates';
import PartsInventory from './pages/mechanics/PartsInventory';
import HistoryView from './pages/mechanics/HistoryView';
import NotesView from './pages/mechanics/NotesView';
import SignatureStamp from './pages/mechanics/SignatureStamp';
import TemplateSelector from './pages/accounting/TemplateSelector';
import ParentPortal from './pages/education/ParentPortal';
import StaffPortal from './pages/education/StaffPortal';
function App() {

  
  return (
    <Router>
      <AuthProvider>
        <AdminProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/blogs" element={<BlogPostPage />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/auth-action" element={<AuthAction />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            

            {/* Admin Route */}
            <Route 
              path="/admin" 
              element={
                <ProtectedAdminRoute>
                  <AdminDashboard />
                </ProtectedAdminRoute>
              } 
            />

            {/* Protected Home Page */}
            <Route 
              path="/home" 
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              } 
            />

            {/* Dashboard Router - redirects to user's assigned dashboard */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardRouter />
                </ProtectedRoute>
              } 
            />

            {/* Financial Overview */}
            <Route 
              path="/financial-overview" 
              element={
                <ProtectedRoute>
                  <FinancialOverview />
                </ProtectedRoute>
              }
            />
             
            {/* Template Renderer */}
            <Route 
              path="/template-renderer" 
              element={
                <ProtectedRoute>
                  <TemplateSelector />
                </ProtectedRoute>
              } 
            />

            {/* Mechanics Routes */}
            <Route 
              path="/mechanics" 
              element={
                <ProtectedRoute>
                  <MechanicsDashboard />
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
              path="/notes-view" 
              element={
                <ProtectedRoute>
                  <NotesView />
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

            {/* Healthcare Routes */}
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

            {/* Industry Dashboard Routes */}
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
              path="/cleaning" 
              element={
                <ProtectedRoute>
                  <CleaningDashboard />
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
              path="/pest-control" 
              element={
                <ProtectedRoute>
                  <PestcontrolDashboard />
                </ProtectedRoute>
              } 
            />
             <Route 
              path="/pool-services" 
              element={
                <ProtectedRoute>
                  <PoolservicesDashboard />
                </ProtectedRoute>
              } 
            />
             <Route 
              path="/solar-installation" 
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
              path="/window-repair" 
              element={
                <ProtectedRoute>
                  <WindowrepairDashboard />
                </ProtectedRoute>
              } 
            />
            <Route path="/parents/:schoolSlug" element={<ParentPortal />} />
            <Route path="/staff/:portalSlug" element={<StaffPortal />} />
          </Routes>
        </AdminProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;