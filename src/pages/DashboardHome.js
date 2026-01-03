import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { dashboards } from '../config/dashboardConfig';

function DashboardHome() {
  const { user, userDashboard, logout } = useAuth();
  const navigate = useNavigate();

  if (!user || !userDashboard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  const dashboard = dashboards.find(d => d.id === userDashboard);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="bg-gray-800 shadow-lg">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center space-x-3">
            <span className="text-4xl">{dashboard.icon}</span>
            <h1 className="text-2xl font-bold text-white">{dashboard.name}</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-gray-300">
              <div className="font-semibold">{user.name}</div>
              <div className="text-sm">{user.email}</div>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="bg-gray-800 rounded-xl p-8 shadow-xl">
          <h2 className="text-3xl font-bold text-white mb-4">
            Welcome to your {dashboard.name}
          </h2>
          <p className="text-gray-300 text-lg mb-6">
            {dashboard.description}
          </p>
          <div className="bg-gray-700 rounded-lg p-6">
            <p className="text-gray-400 mb-4">
              This is your personalized dashboard. You selected this dashboard during registration.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-600 rounded p-4">
                <p className="text-gray-300 font-semibold mb-2">Account Details:</p>
                <ul className="text-gray-400 space-y-1 text-sm">
                  <li>✓ Name: {user.name}</li>
                  <li>✓ Email: {user.email}</li>
                  <li>✓ Dashboard: {dashboard.name}</li>
                  <li>✓ Email Verified: {user.emailVerified ? 'Yes' : 'No'}</li>
                </ul>
              </div>
              <div className="bg-gray-600 rounded p-4">
                <p className="text-gray-300 font-semibold mb-2">Features:</p>
                <ul className="text-gray-400 space-y-1 text-sm">
                  <li>✓ Personalized workspace</li>
                  <li>✓ Custom tools</li>
                  <li>✓ Secure access</li>
                  <li>✓ Industry-specific features</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardHome;