import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import AboutPage from './pages/AboutPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';  
import ContactPage from './pages/ContactPage';
import BlogPostPage from './pages/BlogPostPage';  
import DashboardRouter from './components/DashboardRouter';
import PrivacyPolicy from './pages/PrivacyPolicy';  
import TermsPage from './pages/TermsPage';
import FinancialOverview from './pages/FinancialOverview';  
import InvoiceDashboard from './pages/InvoiceDashboard';
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
import VeterinaryDashboard from './pages/veterinary/VeterinaryDashboard';
import HVACDashboard from './pages/hvac/HVACDashboard';
import AccountingDashboard from './pages/accounting/AccountingDashboard';  
import QuoteTemplate from './pages/accounting/QuoteTemplate';
import PracticeOverview from './pages/health/PracticeOverview';
import PendingPayments from './pages/health/PendingPayments';
import AppointmentsCalendar from './pages/health/AppointmentsCalendar';
import Vehicles from './pages/mechanics/Vehicles';  
import Templates from './pages/mechanics/Templates';
import TemplateSelector from './pages/accounting/TemplateSelector';
import PartsInventory from './pages/mechanics/PartsInventory';
import {  } from 'lucide-react';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* NEW: Landing Page - Public Route (Root) */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/blogs" element={<BlogPostPage/>}/>
          <Route path="privacy" element={<PrivacyPolicy/>}/>
          <Route path="terms" element={<TermsPage/>}/>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* NEW: Home Page - Protected Route */}
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
           <Route 
            path="/template-renderer" 
            element={
              <ProtectedRoute>
                <TemplateSelector />
              </ProtectedRoute>
            } 
          />
          {/* Protected Dashboard Routes */}
          <Route 
            path="/invoice" 
            element={
              <ProtectedRoute>
                <InvoiceDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/mechanics" 
            element={
              <ProtectedRoute>
                <MechanicsDashboard />
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
          <Route 
            path="/security" 
            element={
              <ProtectedRoute>
                <SecurityDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/healthcare" 
            element={
              <ProtectedRoute>
                <HealthcareDashboard />
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
            path="/pending-payments" 
            element={
              <ProtectedRoute>
                <PendingPayments />
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
            path="/appointments" 
            element={
              <ProtectedRoute>
                <AppointmentsCalendar />
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
            path="/financial-overview" 
            element={
              <ProtectedRoute>
                <FinancialOverview />
              </ProtectedRoute>
            }
          />  
          <Route 
            path="/quote-template" 
            element={
              <ProtectedRoute>
                <QuoteTemplate />
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
            path="/practice-overview" 
            element={
              <ProtectedRoute>
                <PracticeOverview />
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
            path="/veterinary" 
            element={
              <ProtectedRoute>
                <VeterinaryDashboard />
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
          {/* Redirect root to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;