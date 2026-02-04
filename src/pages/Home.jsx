// Updated Home.js with modern collapsible sidebar

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from "../assets/img/solidflo-logo.png";
import { useAuth } from '../contexts/AuthContext';

import { db } from '../firebase';
import { 
  Home as HomeIcon, 
  Settings, 
  TrendingUp, 
  FileText, 
  Users, 
  Receipt, 
  CreditCard, 
  Wallet, 
  BarChart3, 
  PieChart, 
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  LogOut,
  Calculator,
  TrendingDown
} from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isInvoicingOpen, setIsInvoicingOpen] = useState(false);
  const [isClientsOpen, setIsClientsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalQuotes: 0,
    totalInvoiced: 0,
    totalClients: 0,
    pendingPayments: 0,
    loading: true
  });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (user?.uid) {
      fetchBusinessStats();
    }
  }, [user]);

  const fetchBusinessStats = async () => {
    try {
      const invoicesSnapshot = await db
        .collection('users')
        .doc(user.uid)
        .collection('invoices')
        .get();
      
      let totalInvoiced = 0;
      let pendingPayments = 0;
      let invoiceCount = 0;

      invoicesSnapshot.forEach(doc => {
        if (doc.id !== '_init') {
          invoiceCount++;
          const data = doc.data();
          const amount = parseFloat(data.total || 0);
          totalInvoiced += amount;
          
          if (data.status === 'pending' || data.status === 'unpaid') {
            pendingPayments += amount;
          }
        }
      });

      const quotesSnapshot = await db
        .collection('users')
        .doc(user.uid)
        .collection('quotations')
        .get();
      
      const quoteCount = quotesSnapshot.docs.filter(doc => doc.id !== '_init').length;

      const clientsSnapshot = await db
        .collection('users')
        .doc(user.uid)
        .collection('clients')
        .get();
      
      const clientCount = clientsSnapshot.docs.filter(doc => doc.id !== '_init').length;

      setStats({
        totalInvoices: invoiceCount,
        totalQuotes: quoteCount,
        totalInvoiced: totalInvoiced,
        totalClients: clientCount,
        pendingPayments: pendingPayments,
        loading: false
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount);
  };

  const StatCard = ({ title, value, icon, gradient, subtitle, loading }) => (
    <div style={{
      background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0.01))',
      padding: 'clamp(16px, 3vw, 20px)',
      borderRadius: '14px',
      minHeight: 'clamp(120px, 20vw, 140px)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      border: '1px solid rgba(255, 255, 255, 0.02)',
      transition: 'transform 300ms cubic-bezier(0.2, 0.9, 0.25, 1)',
      cursor: 'pointer'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-6px)';
      e.currentTarget.style.boxShadow = '0 10px 30px rgba(2, 6, 23, 0.6)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'none';
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{
          width: 'clamp(40px, 8vw, 48px)',
          height: 'clamp(40px, 8vw, 48px)',
          borderRadius: '10px',
          background: gradient,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 'clamp(18px, 4vw, 24px)'
        }}>
          {icon}
        </div>
      </div>
      <div>
        <div style={{ color: '#9aa7b2', fontSize: 'clamp(11px, 2vw, 13px)', marginBottom: '8px' }}>{title}</div>
        {loading ? (
          <div style={{ height: '32px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}></div>
        ) : (
          <>
            <div style={{ fontSize: 'clamp(20px, 4vw, 28px)', fontWeight: '700', color: '#e6eef6', marginBottom: '4px' }}>{value}</div>
            {subtitle && <div style={{ fontSize: 'clamp(10px, 2vw, 12px)', color: '#9aa7b2' }}>{subtitle}</div>}
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-900">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Collapsed Sidebar (Icon Only) - Hidden on mobile */}
      <div
        className={`${
          sidebarOpen ? "hidden" : "hidden md:block"
        } fixed md:static z-40 w-20 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700/50 h-full print:hidden transition-all duration-300 shadow-2xl`}
      >
        <div className="flex flex-col items-center py-4 md:py-6 space-y-4 md:space-y-6">
          {/* Toggle Button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="group p-2 md:p-3 text-slate-400 hover:text-white hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-700 rounded-xl transition-all duration-300 shadow-lg hover:shadow-blue-500/50 hover:scale-110"
            title="Expand Sidebar"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6 group-hover:animate-pulse" />
          </button>

          {/* Logo */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300"></div>
            <div className="relative w-10 h-10 md:w-12 md:h-12 mb-2 md:mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-1 shadow-lg">
              <img
                src={logo}
                alt="Logo"
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
          </div>

          {/* Icon Navigation */}
          <div className="flex flex-col items-center space-y-3 md:space-y-4 w-full px-2 md:px-3">
            <button
              onClick={() => navigate('/home')}
              className="group relative p-2 md:p-3 text-slate-400 hover:text-white rounded-xl transition-all duration-300 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center overflow-hidden"
              title="Home"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <HomeIcon className="w-5 h-5 md:w-6 md:h-6 relative z-10 group-hover:scale-110 transition-transform duration-300" />
            </button>

            <button
              className="group relative p-2 md:p-3 text-slate-400 hover:text-white rounded-xl transition-all duration-300 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center overflow-hidden"
              title="Settings"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Settings className="w-5 h-5 md:w-6 md:h-6 relative z-10 group-hover:rotate-90 transition-transform duration-500" />
            </button>

            {!isMobile && (
              <>
                <button
                  className="group relative p-2 md:p-3 text-slate-400 hover:text-white rounded-xl transition-all duration-300 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center overflow-hidden"
                  title="Financial Dashboard"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <TrendingUp className="w-5 h-5 md:w-6 md:h-6 relative z-10 group-hover:scale-110 transition-transform duration-300" />
                </button>

                <button
                  onClick={() => navigate('/dashboard')}
                  className="group relative p-2 md:p-3 text-slate-400 hover:text-white rounded-xl transition-all duration-300 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center overflow-hidden"
                  title="Invoices"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <Receipt className="w-5 h-5 md:w-6 md:h-6 relative z-10 group-hover:scale-110 transition-transform duration-300" />
                </button>

                <button
                  className="group relative p-2 md:p-3 text-slate-400 hover:text-white rounded-xl transition-all duration-300 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center overflow-hidden"
                  title="Clients"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <Users className="w-5 h-5 md:w-6 md:h-6 relative z-10 group-hover:scale-110 transition-transform duration-300" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* User Icon at Bottom */}
        <div className="absolute bottom-4 md:bottom-6 left-0 right-0 flex justify-center">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full opacity-50 group-hover:opacity-100 blur-md transition-opacity duration-300"></div>
            <div className="relative w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center ring-2 ring-slate-700 shadow-lg group-hover:ring-4 group-hover:ring-blue-500/50 transition-all duration-300 text-white font-semibold">
              {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Sidebar */}
      <div
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed z-50 w-64 md:w-72 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700/50 transition-transform duration-300 h-full print:hidden shadow-2xl overflow-y-auto`}
      >
        <div className="p-4 md:p-6">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl opacity-20 group-hover:opacity-40 blur-xl transition-opacity duration-300"></div>
                <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 p-1 rounded-xl shadow-lg">
                  <img
                    src={logo}
                    alt="Business Logo"
                    className="w-12 h-10 md:w-16 md:h-12 object-contain rounded-lg bg-white/10"
                  />
                </div>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="group p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-xl transition-all duration-300 hover:rotate-90"
              title="Collapse Sidebar"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>

          <nav className="space-y-1.5 md:space-y-2">
            {/* Home */}
            <div 
              onClick={() => navigate('/home')}
              className="group flex items-center space-x-2 md:space-x-3 px-3 md:px-4 py-2.5 md:py-3 text-slate-300 hover:text-white hover:bg-gradient-to-r hover:from-blue-600/20 hover:to-blue-700/20 rounded-xl cursor-pointer transition-all duration-300 border border-transparent hover:border-blue-500/30"
            >
              <HomeIcon className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
              <span className="text-xs md:text-sm font-semibold">Home</span>
            </div>

            {/* Settings */}
            <div
              className="group flex items-center space-x-2 md:space-x-3 px-3 md:px-4 py-2.5 md:py-3 text-slate-300 hover:text-white hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-purple-700/20 rounded-xl cursor-pointer transition-all duration-300 border border-transparent hover:border-purple-500/30"
            >
              <Settings className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0 group-hover:rotate-90 transition-transform duration-500" />
              <span className="text-xs md:text-sm font-semibold">Settings</span>
            </div>

            {/* Financial Dashboard */}
            <div className="pt-3 md:pt-4 mt-3 md:mt-4 border-t border-slate-700/50">
              <div
                className="group flex items-center space-x-2 md:space-x-3 px-3 md:px-4 py-2.5 md:py-3 text-slate-300 hover:text-white hover:bg-gradient-to-r hover:from-emerald-600/20 hover:to-emerald-700/20 rounded-xl cursor-pointer transition-all duration-300 border border-transparent hover:border-emerald-500/30"
              >
                <TrendingUp className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                <span className="text-xs md:text-sm font-semibold truncate">Financial Dashboard</span>
              </div>

              {/* Invoicing Section */}
              <div className="mt-2 md:mt-3">
                <div
                  onClick={() => setIsInvoicingOpen(!isInvoicingOpen)}
                  className="group flex items-center justify-between px-3 md:px-4 py-2.5 md:py-3 text-slate-300 hover:text-white hover:bg-gradient-to-r hover:from-orange-600/20 hover:to-orange-700/20 rounded-xl cursor-pointer transition-all duration-300 border border-transparent hover:border-orange-500/30"
                >
                  <div className="flex items-center space-x-2 md:space-x-3 min-w-0">
                    <Receipt className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                    <span className="text-xs md:text-sm font-semibold truncate">
                      Invoicing
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 flex-shrink-0 transition-transform duration-300 ${
                      isInvoicingOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>

                <div
                  className={`ml-4 md:ml-6 mt-1.5 md:mt-2 space-y-1 border-l-2 border-slate-700/50 pl-3 md:pl-4 overflow-hidden transition-all duration-300 ${
                    isInvoicingOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div
                    onClick={() => {
                      navigate('/dashboard');
                      if (isMobile) setSidebarOpen(false);
                    }}
                    className="group px-2 md:px-3 py-2 md:py-2.5 text-xs md:text-sm text-slate-400 hover:text-white hover:bg-slate-700/30 rounded-lg cursor-pointer transition-all duration-300 flex items-center space-x-2"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0 group-hover:scale-150 transition-transform duration-300"></div>
                    <span className="truncate">Create Invoice</span>
                  </div>
                  <div
                    className="group px-2 md:px-3 py-2 md:py-2.5 text-xs md:text-sm text-slate-400 hover:text-white hover:bg-slate-700/30 rounded-lg cursor-pointer transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 min-w-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500 flex-shrink-0 group-hover:scale-150 transition-transform duration-300"></div>
                        <span className="truncate">All Invoices</span>
                      </div>
                      <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-2 py-0.5 md:px-2.5 md:py-1 rounded-full text-xs font-bold shadow-lg flex-shrink-0 ml-2">
                        {stats.totalInvoices}
                      </span>
                    </div>
                  </div>
                  <div
                    className="group px-2 md:px-3 py-2 md:py-2.5 text-xs md:text-sm text-slate-400 hover:text-white hover:bg-slate-700/30 rounded-lg cursor-pointer transition-all duration-300 flex items-center space-x-2"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0 group-hover:scale-150 transition-transform duration-300"></div>
                    <span className="truncate">Recurring</span>
                  </div>
                </div>
              </div>

              {/* Clients Section */}
              <div className="mt-2 md:mt-3">
                <div
                  onClick={() => setIsClientsOpen(!isClientsOpen)}
                  className="group flex items-center justify-between px-3 md:px-4 py-2.5 md:py-3 text-slate-300 hover:text-white hover:bg-gradient-to-r hover:from-pink-600/20 hover:to-pink-700/20 rounded-xl cursor-pointer transition-all duration-300 border border-transparent hover:border-pink-500/30"
                >
                  <div className="flex items-center space-x-2 md:space-x-3 min-w-0">
                    <Users className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                    <span className="text-xs md:text-sm font-semibold truncate">
                      Clients
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 flex-shrink-0 transition-transform duration-300 ${
                      isClientsOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>

                <div
                  className={`ml-4 md:ml-6 mt-1.5 md:mt-2 space-y-1 border-l-2 border-slate-700/50 pl-3 md:pl-4 overflow-hidden transition-all duration-300 ${
                    isClientsOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div
                    className="group px-2 md:px-3 py-2 md:py-2.5 text-xs md:text-sm text-slate-400 hover:text-white hover:bg-slate-700/30 rounded-lg cursor-pointer transition-all duration-300 flex items-center space-x-2"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0 group-hover:scale-150 transition-transform duration-300"></div>
                    <span className="truncate">Add Client</span>
                  </div>
                  <div
                    className="group px-2 md:px-3 py-2 md:py-2.5 text-xs md:text-sm text-slate-400 hover:text-white hover:bg-slate-700/30 rounded-lg cursor-pointer transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 min-w-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0 group-hover:scale-150 transition-transform duration-300"></div>
                        <span className="truncate">All Clients</span>
                      </div>
                      <span className="bg-gradient-to-r from-pink-600 to-purple-600 text-white px-2 py-0.5 md:px-2.5 md:py-1 rounded-full text-xs font-bold shadow-lg flex-shrink-0 ml-2">
                        {stats.totalClients}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Other Menu Items */}
              {!isMobile && (
                <>
                  <div
                    className="group flex items-center space-x-2 md:space-x-3 px-3 md:px-4 py-2.5 md:py-3 text-slate-300 hover:text-white hover:bg-gradient-to-r hover:from-cyan-600/20 hover:to-cyan-700/20 rounded-xl cursor-pointer transition-all duration-300 mt-2 border border-transparent hover:border-cyan-500/30"
                  >
                    <Receipt className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                    <span className="text-xs md:text-sm font-semibold truncate">Expenses</span>
                  </div>

                  <div
                    className="group flex items-center space-x-2 md:space-x-3 px-3 md:px-4 py-2.5 md:py-3 text-slate-300 hover:text-white hover:bg-gradient-to-r hover:from-indigo-600/20 hover:to-indigo-700/20 rounded-xl cursor-pointer transition-all duration-300 border border-transparent hover:border-indigo-500/30"
                  >
                    <BarChart3 className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                    <span className="text-xs md:text-sm font-semibold truncate">Reports</span>
                  </div>

                  <div
                    className="group flex items-center space-x-2 md:space-x-3 px-3 md:px-4 py-2.5 md:py-3 text-slate-300 hover:text-white hover:bg-gradient-to-r hover:from-violet-600/20 hover:to-violet-700/20 rounded-xl cursor-pointer transition-all duration-300 border border-transparent hover:border-violet-500/30"
                  >
                    <PieChart className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                    <span className="text-xs md:text-sm font-semibold truncate">Tax Center</span>
                  </div>
                </>
              )}
            </div>
          </nav>
        </div>

        {/* User Profile at Bottom */}
        <div className="sticky bottom-0 left-0 right-0 p-4 md:p-6 border-t border-slate-700/50 bg-gradient-to-t from-slate-900 to-transparent backdrop-blur-sm">
          <div className="flex items-center space-x-2 md:space-x-3">
            <div className="relative group flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full opacity-50 group-hover:opacity-100 blur-md transition-opacity duration-300"></div>
              <div className="relative w-9 h-9 md:w-11 md:h-11 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center ring-2 ring-slate-700 shadow-lg group-hover:ring-4 group-hover:ring-blue-500/50 transition-all duration-300 text-white font-semibold">
                {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs md:text-sm font-bold text-white bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent truncate">
                {user?.name || "User"}
              </div>
              <div className="text-xs text-slate-400 truncate">
                {user?.email || "email@example.com"}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="group text-slate-400 hover:text-white hover:bg-gradient-to-r hover:from-red-600/20 hover:to-red-700/20 p-2 md:p-2.5 rounded-xl transition-all duration-300 border border-transparent hover:border-red-500/30 flex-shrink-0"
            >
              <LogOut className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-300" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto md:ml-0">
        {/* Mobile Menu Button */}
        <div className="md:hidden fixed top-4 left-4 z-30">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 bg-slate-800 text-slate-300 rounded-lg shadow-lg hover:bg-slate-700 transition-colors"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        <div style={{
          minHeight: '100vh',
          background: `
            radial-gradient(1200px 400px at 10% 10%, rgba(124, 58, 237, 0.08), transparent 8%),
            radial-gradient(1000px 300px at 90% 90%, rgba(6, 182, 212, 0.06), transparent 8%),
            #0f1724
          `,
          color: '#e6eef6',
          fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
          padding: '24px 16px'
        }}>
          {/* Welcome Section */}
          <div style={{ textAlign: 'center', marginBottom: '32px', marginTop: '40px' }} className="md:mt-0">
            <h2 style={{ fontSize: 'clamp(24px, 5vw, 42px)', fontWeight: '700', margin: '0 0 12px 0', color: '#e6eef6' }}>
              Welcome back, {user?.name || user?.email?.split('@')[0]}!
            </h2>
            <p style={{ fontSize: 'clamp(14px, 2vw, 16px)', color: '#9aa7b2', margin: 0 }}>
              Here's your business overview and performance metrics
            </p>
          </div>

          {/* Statistics Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))',
            gap: '16px',
            marginBottom: '32px'
          }}>
            <StatCard
              title="Total Invoices"
              value={stats.totalInvoices}
              icon="📄"
              gradient="linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)"
              subtitle="All time"
              loading={stats.loading}
            />

            <StatCard
              title="Total Quotes"
              value={stats.totalQuotes}
              icon="📋"
              gradient="linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)"
              subtitle="Generated"
              loading={stats.loading}
            />

            <StatCard
              title="Total Revenue"
              value={formatCurrency(stats.totalInvoiced)}
              icon="💰"
              gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)"
              subtitle="Total invoiced"
              loading={stats.loading}
            />

            <StatCard
              title="Active Clients"
              value={stats.totalClients}
              icon="👥"
              gradient="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
              subtitle="Client base"
              loading={stats.loading}
            />
          </div>

          {/* Two Column Layout */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
            gap: '16px',
            marginBottom: '32px'
          }}>
            {/* Pending Payments */}
            <div style={{
              background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0.01))',
              padding: 'clamp(16px, 3vw, 24px)',
              borderRadius: '14px',
              border: '1px solid rgba(255, 255, 255, 0.02)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: 'clamp(16px, 3vw, 18px)', fontWeight: '600' }}>Pending Payments</h3>
                <div style={{
                  width: 'clamp(36px, 6vw, 44px)',
                  height: 'clamp(36px, 6vw, 44px)',
                  borderRadius: '10px',
                  background: 'rgba(245, 158, 11, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 'clamp(16px, 3vw, 20px)'
                }}>
                  ⏰
                </div>
              </div>
              {stats.loading ? (
                <div style={{ height: '36px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}></div>
              ) : (
                <div>
                  <p style={{ fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: '700', color: '#f59e0b', margin: '0 0 8px 0' }}>
                    {formatCurrency(stats.pendingPayments)}
                  </p>
                  <p style={{ fontSize: 'clamp(12px, 2vw, 14px)', color: '#9aa7b2', margin: 0 }}>Outstanding invoices awaiting payment</p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div style={{
              background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0.01))',
              padding: 'clamp(16px, 3vw, 24px)',
              borderRadius: '14px',
              border: '1px solid rgba(255, 255, 255, 0.02)'
            }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: 'clamp(16px, 3vw, 18px)', fontWeight: '600' }}>Quick Actions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button
                  onClick={() => navigate('/dashboard')}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 'clamp(12px, 2vw, 16px)',
                    background: 'linear-gradient(90deg, rgba(124, 58, 237, 0.15), rgba(6, 182, 212, 0.06))',
                    border: '1px solid rgba(255, 255, 255, 0.02)',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    transition: 'all 300ms',
                    color: '#e6eef6',
                    fontSize: 'clamp(12px, 2vw, 14px)',
                    fontWeight: '600'
                  }}
                >
                  <span>📄 Create New Invoice</span>
                  <span>→</span>
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 'clamp(12px, 2vw, 16px)',
                    background: 'linear-gradient(90deg, rgba(6, 182, 212, 0.15), rgba(124, 58, 237, 0.06))',
                    border: '1px solid rgba(255, 255, 255, 0.02)',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    transition: 'all 300ms',
                    color: '#e6eef6',
                    fontSize: 'clamp(12px, 2vw, 14px)',
                    fontWeight: '600'
                  }}
                >
                  <span>📋 Create New Quote</span>
                  <span>→</span>
                </button>
                <button
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 'clamp(12px, 2vw, 16px)',
                    background: 'linear-gradient(90deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.06))',
                    border: '1px solid rgba(255, 255, 255, 0.02)',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    transition: 'all 300ms',
                    color: '#e6eef6',
                    fontSize: 'clamp(12px, 2vw, 14px)',
                    fontWeight: '600'
                  }}
                >
                  <span>👥 Manage Clients</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div style={{
            background: 'linear-gradient(135deg, #051433ff 0%, #020333ff 100%)',
            borderRadius: '16px',
            padding: 'clamp(24px, 5vw, 48px)',
            textAlign: 'center',
            boxShadow: '0 10px 40px rgba(124, 58, 237, 0.3)'
          }}>
            <h3 style={{ fontSize: 'clamp(20px, 4vw, 32px)', fontWeight: '700', margin: '0 0 12px 0', color: 'white' }}>
              Ready to manage your business?
            </h3>
            <p style={{ fontSize: 'clamp(14px, 2vw, 16px)', color: 'rgba(255, 255, 255, 0.9)', margin: '0 0 24px 0' }}>
              Access your full dashboard to create invoices, manage clients, and track payments
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                padding: 'clamp(12px, 2vw, 16px) clamp(20px, 4vw, 32px)',
                background: 'white',
                color: '#7c3aed',
                border: '0',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: 'clamp(14px, 2vw, 16px)',
                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              Go to Dashboard
              <span>→</span>
            </button>
          </div>

          {/* Footer */}
          <div style={{ marginTop: 'clamp(24px, 5vw, 48px)', textAlign: 'center', color: '#9aa7b2', fontSize: 'clamp(11px, 2vw, 13px)' }}>
            © 2026 SolidFlo • Modern Invoicing & Billing
          </div>
        </div>
      </div>
    </div>
  );
}