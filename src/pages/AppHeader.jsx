// components/AppHeader.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getDashboardRoute } from "../utils/dashboardRoutes";
import { LayoutDashboard, FileText, Settings, LogOut, ChevronDown, Bell } from "lucide-react";

/**
 * AppHeader — reusable sticky nav bar
 *
 * Props:
 *   actions       array of { label, icon: LucideIcon, onClick, variant: "primary"|"secondary" }
 *   showActions   bool — hide the action buttons entirely (default true)
 *   onSettingsOpen callback — if provided, shows the gear icon + Settings menu item
 */
const AppHeader = ({ actions = [], showActions = true, onSettingsOpen }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const close = (e) => {
      if (!e.target.closest("#app-header-user-menu")) setShowUserMenu(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const handleLogout = async () => {
    try { await logout(); navigate("/login"); }
    catch (e) { console.error(e); }
  };

  const getUserInitials = () => {
    if (user?.name) return user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
    if (user?.email) return user.email[0].toUpperCase();
    return "U";
  };

  const getUserDisplayName = () => user?.name || user?.email?.split("@")[0] || "User";

  const getBusinessName = () => user?.settings?.businessInfo?.businessName || "SOLIDFLO";

  return (
    <header className="sticky top-0 z-40 bg-stone-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">

        {/* Brand */}
        <div
          className="flex items-center gap-2.5 flex-shrink-0 cursor-pointer"
          onClick={() => navigate("/")}
        >
        
          <span className="font-bold text-gray-800 text-sm tracking-tight hidden sm:block">
            {getBusinessName()}
          </span>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">

          {/* Page-specific action buttons */}
          {showActions && actions.length > 0 && (
            <div className="flex items-center gap-2">
              {actions.map(({ label, icon: Icon, onClick, variant = "secondary" }, i) => (
                <button
                  key={i}
                  onClick={onClick}
                  className={
                    variant === "primary"
                      ? "flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                      : "flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg bg-white hover:bg-gray-50 transition-colors"
                  }
                >
                  {Icon && <Icon className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Settings gear — only shown if parent passes onSettingsOpen */}
          {onSettingsOpen && (
            <button
              onClick={onSettingsOpen}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Business Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}

          {/* Notifications */}
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="w-4 h-4" />
          </button>

          {/* User menu */}
          <div id="app-header-user-menu" className="relative">
            <button
              onClick={() => setShowUserMenu((p) => !p)}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 overflow-hidden">
                {user?.photoURL
                  ? <img src={user.photoURL} alt="av" className="w-full h-full object-cover" />
                  : getUserInitials()}
              </div>
              <span className="hidden sm:block text-sm font-semibold text-gray-700 max-w-[120px] truncate">
                {getUserDisplayName()}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${showUserMenu ? "rotate-180" : ""}`} />
            </button>

            {showUserMenu && (
              <div className="fixed right-4 top-14 w-52 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                  <p className="text-sm font-semibold text-gray-900 truncate">{getUserDisplayName()}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
                <div className="py-1">
                 <button onClick={() => { setShowUserMenu(false); navigate(getDashboardRoute(user?.dashboardId)); }}
  className="w-full flex items-center gap-3 px-4 py-3 sm:py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
  <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" /> Home
</button>
                  <button onClick={() => { setShowUserMenu(false); navigate(getDashboardRoute(user?.dashboardId)); }}
  className="w-full flex items-center gap-3 px-4 py-3 sm:py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
  <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" /> Dashboard
</button>
                  {onSettingsOpen && (
                    <button onClick={() => { setShowUserMenu(false); navigate(getDashboardRoute(user?.dashboardId)); }}
  className="w-full flex items-center gap-3 px-4 py-3 sm:py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
  <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" /> Business Settings
</button>
                  )}
                  <div className="border-t border-gray-100 my-1" />
                  <button onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 sm:py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                    <LogOut className="w-4 h-4 flex-shrink-0" /> Sign out
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};

export default AppHeader;