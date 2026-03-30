import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { dashboards } from "../config/dashboardConfig";
import { getSubdomain } from "../utils/getSubdomain";
import { SUBDOMAIN_ROUTES } from "../utils/subdomainMap";

function DashboardRouter() {
  const { user, userDashboard } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !userDashboard) return;

    const subdomain = getSubdomain();
    if (subdomain && SUBDOMAIN_ROUTES[subdomain]) {
      navigate(SUBDOMAIN_ROUTES[subdomain], { replace: true });
      return;
    }

    if (SUBDOMAIN_ROUTES[userDashboard]) {
      window.location.href = `https://${userDashboard}.solidflo.co.za`;
      return;
    }

    // ── Fallback: navigate within main domain ─────────────────────
    const dashboard = dashboards.find((d) => d.id === userDashboard);
    if (dashboard) {
      navigate(dashboard.path, { replace: true });
    }
  }, [user, userDashboard, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <div className="text-gray-300 text-xl">
          Redirecting to your dashboard...
        </div>
      </div>
    </div>
  );
}

export default DashboardRouter;
