import React from 'react';
import { Calendar, Users, DollarSign, Wrench, Phone} from 'lucide-react';

export default function PlumbingDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Plumbing Dashboard</h1>
            <p className="text-gray-600">Manage your plumbing services</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700">
              New Service Call
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Today's Jobs</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">12</p>
              </div>
              <Calendar className="w-8 h-8 text-cyan-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active Clients</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">48</p>
              </div>
              <Users className="w-8 h-8 text-cyan-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Revenue (MTD)</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">R8,450</p>
              </div>
              <DollarSign className="w-8 h-8 text-cyan-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Emergency Calls</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">3</p>
              </div>
              <Phone className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold mb-4">Today's Schedule</h2>
            <div className="space-y-3">
              {['Leak Repair - 123 Oak St', 'Water Heater Install - 456 Elm Ave', 'Drain Cleaning - 789 Pine Rd'].map((job, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center gap-3">
                    <Wrench className="w-5 h-5 text-cyan-600" />
                    <span className="text-sm">{job}</span>
                  </div>
                  <span className="text-xs text-gray-500">{`${9 + idx * 2}:00 AM`}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold mb-4">Service Types</h2>
            <div className="space-y-3">
              {[
                { name: 'Emergency Repairs', count: 15 },
                { name: 'Installations', count: 8 },
                { name: 'Maintenance', count: 12 },
                { name: 'Inspections', count: 6 }
              ].map((service, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{service.name}</span>
                  <span className="text-sm font-semibold text-cyan-600">{service.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
