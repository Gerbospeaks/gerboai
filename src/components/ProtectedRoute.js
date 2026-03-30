import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getSubdomain } from "../utils/getSubdomain";
import { SUBDOMAIN_ROUTES } from "../utils/subdomainMap";

function ProtectedRoute({ children }) {
  const { user, loading, userDashboard } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <div className="text-gray-300 text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  // Not logged in → send to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Email not verified → send to login
  if (!user.emailVerified) {
    return <Navigate to="/login" replace />;
  }

  // ── Subdomain access guard ──────────────────────────────────────
  // Prevent a mechanic from accessing healthcare.solidflo.co.za etc.
  const subdomain = getSubdomain();
  if (subdomain && userDashboard && subdomain !== userDashboard) {
    // Wrong subdomain → bounce to their correct one
    window.location.href = `https://${userDashboard}.solidflo.co.za`;
    return null;
  }

  return children;
}

export default ProtectedRoute;
