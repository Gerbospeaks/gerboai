import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { dashboards } from '../config/dashboardConfig';
import { getSubdomain } from '../utils/getSubdomain';
import { SUBDOMAIN_ROUTES } from '../utils/subdomainMap';

function DashboardRouter() {
  const { user, userDashboard } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && userDashboard) {
      const dashboard = dashboards.find(d => d.id === userDashboard);
      
      if (dashboard) {
        navigate(dashboard.path, { replace: true });
      }
    }
  }, [user, userDashboard, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
      <div className="text-gray-800 text-xl">Redirecting to your dashboard...</div>
    </div>
  );
}

export default DashboardRouter;