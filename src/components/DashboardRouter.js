import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { dashboards } from "../config/dashboardConfig";

function DashboardRouter() {
  const { user, userDashboard, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Wait until auth + Firestore user data has fully loaded
    if (loading) return;

    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    if (userDashboard) {
      const dashboard = dashboards.find((d) => d.id === userDashboard);
      if (dashboard) {
        navigate(dashboard.path, { replace: true });
        return;
      }
    }

    // userDashboard is set but doesn't match any dashboard config — send to login
    console.warn("No matching dashboard found for:", userDashboard);
    navigate("/login", { replace: true });
  }, [user, userDashboard, loading, navigate]);

  return (
    <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
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
        <p className="text-[14px] text-[#6b7280] font-medium">
          Loading your dashboard...
        </p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default DashboardRouter;
