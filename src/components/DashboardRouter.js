// DashboardRouter.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { DASHBOARD_ID_TO_PATH } from "../constants/dashboardPaths";

function DashboardRouter() {
  const { user, userDashboard, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    if (!user.emailVerified) {
      navigate("/login", { replace: true });
      return;
    }

    if (userDashboard) {
      const path = DASHBOARD_ID_TO_PATH[userDashboard];
      if (path) {
        navigate(path, { replace: true });
        return;
      }
    }

    // dashboardId exists but has no matching path — misconfigured account
    console.warn("No matching dashboard path for dashboardId:", userDashboard);
    navigate("/login", { replace: true });
  }, [user, userDashboard, loading, navigate]);

  return (
    <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center">
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

export default DashboardRouter;
