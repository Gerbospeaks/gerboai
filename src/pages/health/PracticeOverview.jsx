import React, { useState, useEffect } from "react";
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  DollarSign,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  CreditCard,
  Heart,
  BarChart3
} from "lucide-react";

const PracticeOverview = ({ user, savedInvoices, patients, onAddNewPatient }) => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalPatients: 0,
    activePatients: 0,
    totalInvoices: 0,
    pendingPayments: 0,
    completedInvoices: 0,
    averageInvoiceValue: 0,
  });

  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    if (savedInvoices && patients) {
      calculateStats();
    }
  }, [savedInvoices, patients]);

  const calculateStats = () => {
    // Add safety checks
    if (!savedInvoices || !patients) return;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Calculate revenue with safety check
    const totalRev = (savedInvoices || []).reduce((sum, inv) => sum + (inv.totals?.total || 0), 0);
    const monthlyRev = (savedInvoices || [])
      .filter(inv => {
        if (!inv.createdAt) return false;
        const invDate = inv.createdAt?.toDate ? inv.createdAt.toDate() : new Date(inv.createdAt);
        return invDate.getMonth() === currentMonth && invDate.getFullYear() === currentYear;
      })
      .reduce((sum, inv) => sum + (inv.totals?.total || 0), 0);

    // Count invoices by status
    const pending = (savedInvoices || []).filter(inv => inv.status === 'pending').length;
    const completed = (savedInvoices || []).filter(inv => inv.status === 'completed').length;

    // Calculate average invoice value
    const avgValue = savedInvoices.length > 0 ? totalRev / savedInvoices.length : 0;

    setStats({
      totalRevenue: totalRev,
      monthlyRevenue: monthlyRev,
      totalPatients: (patients || []).length,
      activePatients: (patients || []).filter(p => !p.inactive).length,
      totalInvoices: (savedInvoices || []).length,
      pendingPayments: pending,
      completedInvoices: completed,
      averageInvoiceValue: avgValue,
    });

    // Get recent activity (last 5 invoices)
    const recent = (savedInvoices || [])
      .slice(0, 5)
      .map(inv => ({
        id: inv.id,
        type: 'invoice',
        title: `Invoice ${inv.invoiceNumber}`,
        patient: inv.patient?.name,
        amount: inv.totals?.total,
        status: inv.status,
        date: inv.createdAt,
      }));

    setRecentActivity(recent);
  };

  const formatCurrency = (amount) => {
    return `R${amount.toFixed(2)}`;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('en-ZA');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-400 rounded-lg p-6 text-gray-800">
        <h1 className="text-3xl font-bold mb-2">Practice Overview</h1>
        <p className="text-blue-100">Real-time insights into your healthcare practice</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {formatCurrency(stats.totalRevenue)}
          </div>
          <div className="text-sm text-gray-500">Total Revenue</div>
          <div className="mt-2 text-xs text-green-600 text-sm font-medium">
            {formatCurrency(stats.monthlyRevenue)} this month
          </div>
        </div>

        {/* Total Patients */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <Activity className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {stats.totalPatients}
          </div>
          <div className="text-sm text-gray-500">Total Patients</div>
          <div className="mt-2 text-xs text-blue-600 text-sm font-medium">
            {stats.activePatients} active
          </div>
        </div>

        {/* Total Invoices */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <BarChart3 className="w-5 h-5 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {stats.totalInvoices}
          </div>
          <div className="text-sm text-gray-500">Total Invoices</div>
          <div className="mt-2 text-xs text-purple-600 text-sm font-medium">
            {stats.completedInvoices} completed
          </div>
        </div>

        {/* Pending Payments */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <AlertCircle className="w-5 h-5 text-orange-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {stats.pendingPayments}
          </div>
          <div className="text-sm text-gray-500">Pending Payments</div>
          <div className="mt-2 text-xs text-orange-600 text-sm font-medium">
            Requires attention
          </div>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-3 md:space-x-4">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-900">
                {formatCurrency(stats.averageInvoiceValue)}
              </div>
              <div className="text-xs text-gray-500">Average Invoice Value</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-3 md:space-x-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-900">
                {stats.completedInvoices}
              </div>
              <div className="text-xs text-gray-500">Completed Invoices</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-3 md:space-x-4">
            <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-pink-600" />
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-900">
                {stats.activePatients}
              </div>
              <div className="text-xs text-gray-500">Active Patients</div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Revenue Trend */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <span>Revenue Overview</span>
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-400 rounded">
              <span className="text-sm text-gray-600">This Month</span>
              <span className="text-lg font-semibold text-green-600">
                {formatCurrency(stats.monthlyRevenue)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-400 rounded">
              <span className="text-sm text-gray-600">Total Revenue</span>
              <span className="text-lg font-semibold text-blue-600">
                {formatCurrency(stats.totalRevenue)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-400 rounded">
              <span className="text-sm text-gray-600">Average Invoice</span>
              <span className="text-lg font-semibold text-purple-600">
                {formatCurrency(stats.averageInvoiceValue)}
              </span>
            </div>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            <span>Invoice Status</span>
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Completed</span>
                <span className="text-sm font-medium">{stats.completedInvoices}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-green-500 h-3 rounded-full transition-all"
                  style={{ 
                    width: `${stats.totalInvoices > 0 ? (stats.completedInvoices / stats.totalInvoices) * 100 : 0}%` 
                  }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Pending</span>
                <span className="text-sm font-medium">{stats.pendingPayments}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-orange-500 h-3 rounded-full transition-all"
                  style={{ 
                    width: `${stats.totalInvoices > 0 ? (stats.pendingPayments / stats.totalInvoices) * 100 : 0}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
          <Activity className="w-5 h-5 text-blue-600" />
          <span>Recent Activity</span>
        </h3>
        
        {recentActivity.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No recent activity
          </div>
        ) : (
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div 
                key={activity.id}
                className="flex items-center justify-between p-4 bg-gray-800 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    activity.status === 'completed' ? 'bg-green-100' : 'bg-orange-100'
                  }`}>
                    <FileText className={`w-5 h-5 ${
                      activity.status === 'completed' ? 'text-green-600' : 'text-orange-600'
                    }`} />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{activity.title}</div>
                    <div className="text-sm text-gray-500">{activity.patient}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">
                    {formatCurrency(activity.amount)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDate(activity.date)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-gray-50 text-gray-800 rounded-lg hover:bg-blue-700 transition-colors">
            <FileText className="w-5 h-5" />
            <span>Create Invoice</span>
          </button>
          <button 
          onClick={onAddNewPatient}
          className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-gray-800 rounded-lg hover:bg-green-700 transition-colors">
            <Users className="w-5 h-5" />
            <span>Add Patient</span>
          </button>
          <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-purple-600 text-gray-800 rounded-lg hover:bg-purple-700 transition-colors">
            <Calendar className="w-5 h-5" />
            <span>View Schedule</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PracticeOverview;