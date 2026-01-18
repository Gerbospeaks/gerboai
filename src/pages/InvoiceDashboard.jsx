import React from 'react';
import { Link } from 'react-router-dom';

function InvoiceDashboard() {
  return (
    <div className="flex h-screen bg-gray-300">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200">
        <div className="p-4">
          <div className="flex items-center space-x-2 mb-8">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center text-white text-xl font-bold">
              I
            </div>
            <span className="font-semibold text-lg">Invoice System</span>
          </div>

          <nav className="space-y-2">
            <Link to="/" className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
              <span>🏠</span>
              <span>Home</span>
            </Link>
            <div className="flex items-center space-x-3 px-3 py-2 text-gray-900 bg-orange-50 rounded-lg">
              <span>📄</span>
              <span>Invoices</span>
            </div>
            <div className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
              <span>👥</span>
              <span>Customers</span>
            </div>
            <div className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
              <span>💰</span>
              <span>Payments</span>
            </div>
            <div className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
              <span>📊</span>
              <span>Reports</span>
            </div>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <h1 className="text-2xl font-semibold">Invoice Dashboard</h1>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm text-gray-500 mb-1">Total Invoices</div>
              <div className="text-3xl font-bold text-orange-600">248</div>
              <div className="text-sm text-green-600 mt-2">↑ 12% from last month</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm text-gray-500 mb-1">Total Revenue</div>
              <div className="text-3xl font-bold text-gray-900">$124,563</div>
              <div className="text-sm text-green-600 mt-2">↑ 8% from last month</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm text-gray-500 mb-1">Pending Payments</div>
              <div className="text-3xl font-bold text-red-600">$23,450</div>
              <div className="text-sm text-gray-500 mt-2">18 invoices overdue</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Recent Invoices</h2>
            </div>
            <table className="w-full">
              <thead className="bg-gray-300">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr className="hover:bg-gray-300">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">INV-001</td>
                  <td className="px-6 py-4 text-sm text-gray-500">Acme Corp</td>
                  <td className="px-6 py-4 text-sm text-gray-900">$5,280.00</td>
                  <td className="px-6 py-4 text-sm"><span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Paid</span></td>
                  <td className="px-6 py-4 text-sm text-gray-500">Jan 15, 2026</td>
                </tr>
                <tr className="hover:bg-gray-300">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">INV-002</td>
                  <td className="px-6 py-4 text-sm text-gray-500">TechStart Inc</td>
                  <td className="px-6 py-4 text-sm text-gray-900">$3,420.00</td>
                  <td className="px-6 py-4 text-sm"><span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Pending</span></td>
                  <td className="px-6 py-4 text-sm text-gray-500">Jan 10, 2026</td>
                </tr>
                <tr className="hover:bg-gray-300">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">INV-003</td>
                  <td className="px-6 py-4 text-sm text-gray-500">Global Solutions</td>
                  <td className="px-6 py-4 text-sm text-gray-900">$8,750.00</td>
                  <td className="px-6 py-4 text-sm"><span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Overdue</span></td>
                  <td className="px-6 py-4 text-sm text-gray-500">Dec 28, 2025</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InvoiceDashboard;