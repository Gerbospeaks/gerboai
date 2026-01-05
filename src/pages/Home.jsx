// Save this as: src/pages/Home.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  BookOpen,
  Menu,
  X,
  LogOut
} from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalQuotes: 0,
    totalInvoiced: 0,
    totalClients: 0,
    pendingPayments: 0,
    loading: true
  });

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
      padding: '20px',
      borderRadius: '14px',
      minHeight: '140px',
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
          width: '48px',
          height: '48px',
          borderRadius: '10px',
          background: gradient,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px'
        }}>
          {icon}
        </div>
      </div>
      <div>
        <div style={{ color: '#9aa7b2', fontSize: '13px', marginBottom: '8px' }}>{title}</div>
        {loading ? (
          <div style={{ height: '32px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}></div>
        ) : (
          <>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#e6eef6', marginBottom: '4px' }}>{value}</div>
            {subtitle && <div style={{ fontSize: '12px', color: '#9aa7b2' }}>{subtitle}</div>}
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-900">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed lg:relative lg:translate-x-0 z-50 w-64 bg-indigo-950 border-r border-gray-800 transition-transform duration-300 h-full`}
      >
        <div className="p-4">
          <div className="flex items-center space-x-2 mb-8">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-lg text-white">
              SolidFlo
            </span>
            <ChevronDown className="w-4 h-4 ml-auto text-gray-400" />
          </div>

          <nav className="space-y-1">
            <div 
              onClick={() => navigate('/home')}
              className="flex items-center space-x-3 px-3 py-2 text-white bg-indigo-800 rounded-lg cursor-pointer"
            >
              <HomeIcon className="w-5 h-5" />
              <span>Home</span>
            </div>
            
            <div 
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-indigo-800 rounded-lg cursor-pointer"
            >
              <TrendingUp className="w-5 h-5" />
              <span>Dashboard</span>
            </div>

            <div className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-indigo-800 rounded-lg cursor-pointer">
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </div>

            <div className="pt-4">
              <div className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-indigo-800 rounded-lg cursor-pointer">
                <TrendingUp className="w-5 h-5" />
                <span>Financial Overview</span>
              </div>

              <div className="mt-2">
                <div className="flex items-center justify-between px-3 py-2 text-gray-300 hover:bg-indigo-800 rounded-lg cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5" />
                    <span>Invoicing</span>
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </div>

                <div className="ml-8 mt-1 space-y-1">
                  <div 
                    onClick={() => navigate('/dashboard')}
                    className="px-3 py-2 text-sm text-gray-400 hover:bg-indigo-800 rounded-lg cursor-pointer"
                  >
                    Create Invoice
                  </div>
                  <div className="px-3 py-2 text-sm text-gray-400 hover:bg-indigo-800 rounded-lg cursor-pointer">
                    All Invoices
                  </div>
                  <div className="px-3 py-2 text-sm text-gray-400 hover:bg-indigo-800 rounded-lg cursor-pointer">
                    Recurring
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-indigo-800 rounded-lg cursor-pointer mt-2">
                <Users className="w-5 h-5" />
                <span>Clients</span>
              </div>

              <div className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-indigo-800 rounded-lg cursor-pointer">
                <Receipt className="w-5 h-5" />
                <span>Expenses</span>
              </div>

              <div className="flex items-center justify-between px-3 py-2 text-gray-300 hover:bg-indigo-800 rounded-lg cursor-pointer">
                <div className="flex items-center space-x-3">
                  <CreditCard className="w-5 h-5" />
                  <span>Payments</span>
                </div>
                <ChevronDown className="w-4 h-4" />
              </div>

              <div className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-indigo-800 rounded-lg cursor-pointer">
                <Wallet className="w-5 h-5" />
                <span>Bank Accounts</span>
              </div>

              <div className="flex items-center justify-between px-3 py-2 text-gray-300 hover:bg-indigo-800 rounded-lg cursor-pointer">
                <div className="flex items-center space-x-3">
                  <BarChart3 className="w-5 h-5" />
                  <span>Reports</span>
                </div>
                <ChevronDown className="w-4 h-4" />
              </div>

              <div className="flex items-center justify-between px-3 py-2 text-gray-300 hover:bg-indigo-800 rounded-lg cursor-pointer">
                <div className="flex items-center space-x-3">
                  <PieChart className="w-5 h-5" />
                  <span>Tax Center</span>
                </div>
                <ChevronDown className="w-4 h-4" />
              </div>

              <div className="flex items-center justify-between px-3 py-2 text-gray-300 hover:bg-indigo-800 rounded-lg cursor-pointer">
                <div className="flex items-center space-x-3">
                  <BarChart3 className="w-5 h-5" />
                  <span>Analytics</span>
                </div>
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-indigo-700 bg-indigo-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
              {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-white">
                {user?.name || "User"}
              </div>
              <div className="text-xs text-gray-400">
                {user?.email || "email@example.com"}
              </div>
            </div>
            <button onClick={handleLogout} className="text-gray-400 hover:text-white">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Mobile Menu Button */}
        <div className="lg:hidden fixed top-4 left-4 z-30">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 bg-indigo-600 text-white rounded-lg shadow-lg"
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
          padding: '48px 28px'
        }}>
          {/* Welcome Section */}
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: '42px', fontWeight: '700', margin: '0 0 12px 0', color: '#e6eef6' }}>
              Welcome back, {user?.name || user?.email?.split('@')[0]}!
            </h2>
            <p style={{ fontSize: '16px', color: '#9aa7b2', margin: 0 }}>
              Here's your business overview and performance metrics
            </p>
          </div>

          {/* Statistics Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '18px',
            marginBottom: '48px'
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
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '18px',
            marginBottom: '48px'
          }}>
            {/* Pending Payments */}
            <div style={{
              background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0.01))',
              padding: '24px',
              borderRadius: '14px',
              border: '1px solid rgba(255, 255, 255, 0.02)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Pending Payments</h3>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  background: 'rgba(245, 158, 11, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px'
                }}>
                  ⏰
                </div>
              </div>
              {stats.loading ? (
                <div style={{ height: '36px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}></div>
              ) : (
                <div>
                  <p style={{ fontSize: '36px', fontWeight: '700', color: '#f59e0b', margin: '0 0 8px 0' }}>
                    {formatCurrency(stats.pendingPayments)}
                  </p>
                  <p style={{ fontSize: '14px', color: '#9aa7b2', margin: 0 }}>Outstanding invoices awaiting payment</p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div style={{
              background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0.01))',
              padding: '24px',
              borderRadius: '14px',
              border: '1px solid rgba(255, 255, 255, 0.02)'
            }}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600' }}>Quick Actions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button
                  onClick={() => navigate('/dashboard')}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px',
                    background: 'linear-gradient(90deg, rgba(124, 58, 237, 0.15), rgba(6, 182, 212, 0.06))',
                    border: '1px solid rgba(255, 255, 255, 0.02)',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    transition: 'all 300ms',
                    color: '#e6eef6',
                    fontSize: '14px',
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
                    padding: '16px',
                    background: 'linear-gradient(90deg, rgba(6, 182, 212, 0.15), rgba(124, 58, 237, 0.06))',
                    border: '1px solid rgba(255, 255, 255, 0.02)',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    transition: 'all 300ms',
                    color: '#e6eef6',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  <span>📋 Create New Quote</span>
                  <span>→</span>
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px',
                    background: 'linear-gradient(90deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.06))',
                    border: '1px solid rgba(255, 255, 255, 0.02)',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    transition: 'all 300ms',
                    color: '#e6eef6',
                    fontSize: '14px',
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
            padding: '48px',
            textAlign: 'center',
            boxShadow: '0 10px 40px rgba(124, 58, 237, 0.3)'
          }}>
            <h3 style={{ fontSize: '32px', fontWeight: '700', margin: '0 0 12px 0', color: 'white' }}>
              Ready to manage your business?
            </h3>
            <p style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.9)', margin: '0 0 32px 0' }}>
              Access your full dashboard to create invoices, manage clients, and track payments
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                padding: '16px 32px',
                background: 'white',
                color: '#7c3aed',
                border: '0',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: '16px',
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
          <div style={{ marginTop: '48px', textAlign: 'center', color: '#9aa7b2', fontSize: '13px' }}>
            © 2026 SolidFlo • Modern Invoicing & Billing
          </div>
        </div>
      </div>
    </div>
  );
}