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
import DashboardRouter from './components/DashboardRouter';

// Your existing dashboard imports
import InvoiceDashboard from './pages/InvoiceDashboard';
import MechanicsDashboard from './pages/MechanicsDashboard';
import SecurityDashboard from './pages/SecurityDashboard';
import HealthcareDashboard from './pages/HealthcareDashboard';
import ElectricalDashboard from './pages/ElectricalDashboard';
import RestaurantDashboard from './pages/RestaurantDashboard';
import ConstructionDashboard from './pages/ConstructionDashboard';
import CleaningDashboard from './pages/CleaningDashboard';
import EducationDashboard from './pages/EducationDashboard';
import HotelDashboard from './pages/HotelDashboard';  
import LegalDashboard from './pages/LegalDashboard';
import PlumbingDashboard from './pages/PlumbingDashboard';
import RetailDashboard from './pages/RetailDashboard';
import LandscapingDashboard from './pages/LandscapingDashboard';
import LogisticsDashboard from './pages/LogisticsDashboard';
import PhotographyDashboard from './pages/PhotographyDashboard';
import RealEstateDashboard from './pages/RealEstateDashboard';
import VeterinaryDashboard from './pages/VeterinaryDashboard';
import HVACDashboard from './pages/HVACDashboard';
import AccountingDashboard from './pages/AccountingDashboard';  
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