// Updated Home.js without sidebar - to be called from dashboard like FinancialOverview
// Updated Home.js without sidebar - to be called from dashboard like FinancialOverview

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getFirestore, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { 
  TrendingUp, 
  FileText, 
  Users, 
  Receipt,
  TrendingDown,
  ArrowRight
} from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showInvoicesList, setShowInvoicesList] = useState(false);
  const [invoices, setInvoices] = useState([]);
  
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
    if (!user?.uid) return;
    
    try {
      const db = getFirestore();
      
      // Fetch invoices
      const invoicesRef = collection(db, "users", user.uid, "invoices");
      const invoicesSnapshot = await getDocs(invoicesRef);
      
      let totalInvoiced = 0;
      let pendingPayments = 0;
      let invoiceCount = 0;
      const invoicesList = [];

      invoicesSnapshot.forEach(doc => {
        const data = doc.data();
        invoiceCount++;
        
        // Handle different data structures
        const amount = parseFloat(data.totals?.total || data.total || 0);
        totalInvoiced += amount;
        
        // Calculate pending payments
        if (data.status === 'pending' || data.status === 'unpaid' || data.status === 'partially_paid') {
          const due = parseFloat(data.totals?.due || data.totals?.total || data.total || 0);
          pendingPayments += due;
        }

        invoicesList.push({
          id: doc.id,
          ...data
        });
      });

      // Sort invoices by date (newest first)
      invoicesList.sort((a, b) => {
        const dateA = a.dates?.invoiceDate || a.dates?.quoteDate || a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.dates?.invoiceDate || b.dates?.quoteDate || b.createdAt?.toDate?.() || new Date(0);
        
        const timeA = typeof dateA === 'string' ? new Date(dateA).getTime() : dateA.getTime?.() || 0;
        const timeB = typeof dateB === 'string' ? new Date(dateB).getTime() : dateB.getTime?.() || 0;
        
        return timeB - timeA;
      });

      setInvoices(invoicesList);

      // Fetch quotes
      let quoteCount = 0;
      try {
        const quotesRef = collection(db, "users", user.uid, "quotes");
        const quotesSnapshot = await getDocs(quotesRef);
        quoteCount = quotesSnapshot.docs.length;
        
        // Also add revenue from paid quotes
        quotesSnapshot.forEach(doc => {
          const data = doc.data();
          if (data.status === 'paid') {
            const amount = parseFloat(data.totals?.total || data.total || 0);
            totalInvoiced += amount;
          }
        });
      } catch (error) {
        console.log('No quotes collection or error fetching quotes:', error);
      }

      // Fetch clients
      let clientCount = 0;
      try {
        const clientsRef = collection(db, "users", user.uid, "clients");
        const clientsSnapshot = await getDocs(clientsRef);
        clientCount = clientsSnapshot.docs.length;
      } catch (error) {
        console.log('No clients collection or error fetching clients:', error);
      }

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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount);
  };

  const StatCard = ({ title, value, icon: Icon, gradient, subtitle, loading, trend }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${gradient}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <h3 className="text-gray-600 text-sm mb-1">{title}</h3>
      {loading ? (
        <div className="h-8 bg-gray-100 rounded animate-pulse"></div>
      ) : (
        <>
          <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-300 p-4 md:p-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          Welcome, {user?.name || user?.email?.split('@')[0]}! 👋
        </h1>
        <p className="text-gray-600">
          Here's your business overview and performance metrics
        </p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Invoices"
          value={stats.totalInvoices}
          icon={FileText}
          gradient="bg-gradient-to-br from-purple-600 to-purple-700"
          subtitle="All time"
          loading={stats.loading}
          trend={12}
        />

        <StatCard
          title="Total Quotes"
          value={stats.totalQuotes}
          icon={Receipt}
          gradient="bg-gradient-to-br from-cyan-600 to-cyan-700"
          subtitle="Generated"
          loading={stats.loading}
        />

        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.totalInvoiced)}
          icon={TrendingUp}
          gradient="bg-gradient-to-br from-emerald-600 to-emerald-700"
          subtitle="Total invoiced"
          loading={stats.loading}
          trend={8}
        />

        <StatCard
          title="Active Clients"
          value={stats.totalClients}
          icon={Users}
          gradient="bg-gradient-to-br from-orange-600 to-orange-700"
          subtitle="Client base"
          loading={stats.loading}
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Pending Payments */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Pending Payments</h3>
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Receipt className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          {stats.loading ? (
            <div className="h-12 bg-gray-100 rounded animate-pulse"></div>
          ) : (
            <div>
              <p className="text-4xl font-bold text-orange-600 mb-2">
                {formatCurrency(stats.pendingPayments)}
              </p>
              <p className="text-sm text-gray-600">Outstanding invoices awaiting payment</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border border-purple-200 rounded-lg transition-all duration-300 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-semibold text-purple-900">Create New Invoice</span>
              </div>
              <ArrowRight className="w-5 h-5 text-purple-600 group-hover:translate-x-1 transition-transform duration-300" />
            </button>

            <button
              onClick={() => navigate('/dashboard')}
              className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-cyan-50 to-cyan-100 hover:from-cyan-100 hover:to-cyan-200 border border-cyan-200 rounded-lg transition-all duration-300 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-cyan-600 rounded-lg flex items-center justify-center">
                  <Receipt className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-semibold text-cyan-900">Create New Quote</span>
              </div>
              <ArrowRight className="w-5 h-5 text-cyan-600 group-hover:translate-x-1 transition-transform duration-300" />
            </button>

            <button
              className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-200 border border-emerald-200 rounded-lg transition-all duration-300 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-semibold text-emerald-900">Manage Clients</span>
              </div>
              <ArrowRight className="w-5 h-5 text-emerald-600 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent Invoices</h3>
          <button
            onClick={() => setShowInvoicesList(true)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View all
          </button>
        </div>

        {stats.loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
            ))}
          </div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h4 className="text-gray-900 font-semibold mb-2">No invoices yet</h4>
            <p className="text-gray-600 text-sm mb-4">Create your first invoice to get started</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Invoice
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {invoices.slice(0, 5).map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer border border-gray-200"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="text-sm font-semibold text-gray-900 truncate">
                      {invoice.quoteNumber || invoice.invoiceNumber || invoice.id}
                    </h4>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${
                        invoice.status === 'paid'
                          ? 'bg-emerald-100 text-emerald-700'
                          : invoice.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {invoice.status || 'Draft'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {invoice.customer?.name || invoice.customerName || 'No customer'}
                    </span>
                    {(invoice.dates?.invoiceDate || invoice.date) && (
                      <span>
                        {new Date(invoice.dates?.invoiceDate || invoice.date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right ml-4">
                  <div className="text-base font-bold text-gray-900">
                    {formatCurrency(invoice.totals?.total || invoice.total || 0)}
                  </div>
                  {(invoice.totals?.subtotal || invoice.subtotal) && (
                    <div className="text-xs text-gray-500">
                      Subtotal: {formatCurrency(invoice.totals?.subtotal || invoice.subtotal)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-center shadow-lg">
        <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
          Ready to manage your business?
        </h3>
        <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
          Access your full dashboard to create invoices, manage clients, and track payments
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-lg hover:shadow-xl inline-flex items-center gap-2"
        >
          Go to Dashboard
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* Footer */}
      <div className="mt-12 text-center text-gray-500 text-sm">
        © 2026 SolidFlo • Modern Invoicing & Billing
      </div>

      {/* Invoices List Modal */}
      {showInvoicesList && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">All Invoices</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {stats.totalInvoices} {stats.totalInvoices === 1 ? 'invoice' : 'invoices'} found
                </p>
              </div>
              <button
                onClick={() => setShowInvoicesList(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-300"
              >
                ✕
              </button>
            </div>

            {/* Invoices List */}
            <div className="overflow-y-auto max-h-[calc(80vh-140px)] p-6">
              {invoices.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Receipt className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No invoices yet</h3>
                  <p className="text-gray-600 mb-6">Create your first invoice to get started</p>
                  <button
                    onClick={() => {
                      setShowInvoicesList(false);
                      navigate('/dashboard');
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                  >
                    Create Invoice
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {invoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="group bg-gray-50 hover:bg-gray-100 rounded-xl p-4 border border-gray-200 hover:border-gray-300 transition-all duration-300 cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-gray-900 font-semibold truncate">
                              {invoice.quoteNumber || invoice.invoiceNumber || invoice.id}
                            </h3>
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
                                invoice.status === 'paid'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : invoice.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {invoice.status || 'Draft'}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
                            <span className="flex items-center">
                              <Users className="w-4 h-4 mr-1.5" />
                              {invoice.customer?.name || invoice.customerName || 'No customer'}
                            </span>
                            {(invoice.dates?.invoiceDate || invoice.date) && (
                              <span className="flex items-center">
                                📅 {new Date(invoice.dates?.invoiceDate || invoice.date).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 ml-4">
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-900">
                              {formatCurrency(invoice.totals?.total || invoice.total || 0)}
                            </div>
                            {(invoice.totals?.subtotal || invoice.subtotal) && (
                              <div className="text-xs text-gray-600">
                                Subtotal: {formatCurrency(invoice.totals?.subtotal || invoice.subtotal)}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log('View invoice:', invoice.id);
                            }}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-all duration-300 opacity-0 group-hover:opacity-100"
                          >
                            <FileText className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}