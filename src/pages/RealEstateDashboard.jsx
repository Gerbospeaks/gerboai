import React from 'react';
import { Home, Calendar, DollarSign, Key} from 'lucide-react';

export default function RealEstateDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Real Estate Dashboard</h1>
            <p className="text-gray-600">Property & Tenant Management</p>
          </div>
          <button className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700">
            Add Property
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active Listings</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">28</p>
              </div>
              <Home className="w-8 h-8 text-amber-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Viewings Scheduled</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">15</p>
              </div>
              <Calendar className="w-8 h-8 text-amber-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active Tenants</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">64</p>
              </div>
              <Key className="w-8 h-8 text-amber-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Monthly Income</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">R45,200</p>
              </div>
              <DollarSign className="w-8 h-8 text-amber-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}