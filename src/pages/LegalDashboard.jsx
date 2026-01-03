import React from 'react';
import { Scale, Calendar, Users, DollarSign, Briefcase, FileText } from 'lucide-react';
const generateInvoiceNumber = () => {
  const year = new Date().getFullYear();
  const storageKey = `lg_invoice_${year}`;

  let lastNumber = Number(localStorage.getItem(storageKey)) || 891;
  const nextNumber = lastNumber + 1;

  localStorage.setItem(storageKey, nextNumber);

  return `LG-${year}-${String(nextNumber).padStart(4, '0')}`;
};

export default function LegalDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Legal Dashboard</h1>
            <p className="text-gray-600">Case & Client Management</p>
          </div>
          <button className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800">
            New Case
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active Cases</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">23</p>
              </div>
              <Briefcase className="w-8 h-8 text-slate-700" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Hearings This Week</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">6</p>
              </div>
              <Calendar className="w-8 h-8 text-slate-700" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Clients</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">89</p>
              </div>
              <Users className="w-8 h-8 text-slate-700" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Billable Hours</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">234</p>
              </div>
              <DollarSign className="w-8 h-8 text-slate-700" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
