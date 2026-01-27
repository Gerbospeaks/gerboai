import React from 'react';
import { Calendar, Users, DollarSign, PawPrint } from 'lucide-react';
import Templates from "./Templates"; 
import AIInvoiceExtractor from "../AIInvoiceExtractor";
import TemplateSelector, { TemplateRenderer } from './TemplateSelector';
export default function VeterinaryDashboard() {
  return (
    <div className="min-h-screen bg-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Veterinary Dashboard</h1>
            <p className="text-gray-600">Pet Care & Appointments</p>
          </div>
          <button className="px-4 py-2 bg-fuchsia-600 text-gray-800 rounded-lg hover:bg-fuchsia-700">
            New Appointment
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Today's Appointments</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">24</p>
              </div>
              <Calendar className="w-8 h-8 text-fuchsia-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Registered Pets</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">567</p>
              </div>
              <PawPrint className="w-8 h-8 text-fuchsia-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active Clients</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">389</p>
              </div>
              <Users className="w-8 h-8 text-fuchsia-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Weekly Revenue</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">R6,400</p>
              </div>
              <DollarSign className="w-8 h-8 text-fuchsia-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
