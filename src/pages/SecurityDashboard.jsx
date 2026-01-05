import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ChevronDown, ChevronLeft, Home, Settings, Shield, Users, Calendar, FileText, DollarSign, FileBarChart, BarChart3, Menu, Plus, Send, Edit, CheckSquare, Clock, MapPin } from 'lucide-react';

const SecurityDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
   const [activeTab, setActiveTab] = useState('Invoice');
  const { user } = useAuth();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-gray-900 border-r border-gray-200 transition-all duration-300 overflow-hidden`}>
        <div className="p-4">
          <div className="flex items-center space-x-2 mb-8">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-lg">SecureGuard Pro</span>
            <ChevronDown className="w-4 h-4 ml-auto text-gray-400" />
          </div>

          <nav className="space-y-1">
            <div className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer">
              <Home className="w-5 h-5" />
              <span>Dashboard</span>
            </div>
            <div className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer">
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </div>
            
            <div className="pt-4">
              <div className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer">
                <Calendar className="w-5 h-5" />
                <span>Scheduling</span>
              </div>
              
              <div className="mt-2">
                <div className="flex items-center justify-between px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5" />
                    <span>Billing</span>
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </div>
                
                <div className="ml-8 mt-1 space-y-1">
                  <div className="px-3 py-2 text-sm text-gray-900 bg-gray-100 rounded-lg cursor-pointer">
                    Invoices
                  </div>
                  <div className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer">
                    Contracts
                  </div>
                  <div className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer">
                    Clients
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer mt-2">
                <Users className="w-5 h-5" />
                <span>Security Personnel</span>
              </div>

              <div className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer">
                <MapPin className="w-5 h-5" />
                <span>Site Locations</span>
              </div>

              <div className="flex items-center justify-between px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer">
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5" />
                  <span>Time Tracking</span>
                </div>
                <ChevronDown className="w-4 h-4" />
              </div>

              <div className="flex items-center justify-between px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer">
                <div className="flex items-center space-x-3">
                  <DollarSign className="w-5 h-5" />
                  <span>Payments</span>
                </div>
                <ChevronDown className="w-4 h-4" />
              </div>

              <div className="flex items-center justify-between px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer">
                <div className="flex items-center space-x-3">
                  <FileBarChart className="w-5 h-5" />
                  <span>Reports</span>
                </div>
                <ChevronDown className="w-4 h-4" />
              </div>

              <div className="flex items-center justify-between px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer">
                <div className="flex items-center space-x-3">
                  <BarChart3 className="w-5 h-5" />
                  <span>Analytics</span>
                </div>
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
            <div className="flex-1">
        <div className="text-sm font-medium">{user?.name || 'User'}</div>
        <div className="text-xs text-gray-500">{user?.email || 'email@example.com'}</div>
      </div>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg">
                <Menu className="w-5 h-5" />
              </button>
              <ChevronLeft className="w-5 h-5 text-gray-400" />
              <h1 className="text-xl font-semibold">Invoice #SEC-2026-0145</h1>
            </div>
            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <CheckSquare className="w-4 h-4" />
                <span>Mark as Paid</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                <Send className="w-4 h-4" />
                <span>Send</span>
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white border-b border-gray-200 px-6">
          <div className="flex space-x-8">
            {['Invoice', 'History', 'Notes'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 border-b-2 ${
                  activeTab === tab
                    ? 'border-red-600 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 flex items-center space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-yellow-700 font-medium">Pending</span>
                <span className="text-yellow-600">Payment due in 7 days</span>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Total Amount</div>
                  <div className="text-2xl font-semibold text-red-600">R 8,450.00</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Outstanding</div>
                  <div className="text-2xl font-semibold">R 8,450.00</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">VAT Amount</div>
                  <div className="text-2xl font-semibold">R 1,408.33</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Invoice Date</div>
                  <div className="text-base font-medium">01/01/2025</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Due Date</div>
                  <div className="text-base font-medium">08/01/2025</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Contract Period</div>
                  <div className="text-base font-medium">December 2026</div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center space-x-2">
                    <MapPin className="w-5 h-5" />
                    <span>Service Location</span>
                  </h2>
                  <button className="flex items-center space-x-2 text-red-600 hover:text-red-700">
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Site Name</div>
                    <div className="font-medium">Westfield Shopping Centre</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Site Code</div>
                    <div className="font-medium">WSC-001</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-sm text-gray-500">Address</div>
                    <div className="font-medium">Ariel Way, White City, London W12 7GF</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Contact Person</div>
                    <div className="font-medium">James Patterson</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Phone</div>
                    <div className="font-medium">020 8743 0000</div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Payments</h2>
                  <button className="flex items-center space-x-2 text-red-600 hover:text-red-700">
                    <Plus className="w-4 h-4" />
                    <span>Add</span>
                  </button>
                </div>
                
                <div className="text-center py-8 text-gray-500">
                  No payments recorded yet
                </div>
              </div>
            </div>

            <div className="col-span-1">
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="text-right mb-6">
                  <div className="text-sm font-semibold mb-1">INVOICE</div>
                  <div className="text-xs">Invoice No: SEC-2026-0145</div>
                  <div className="text-xs text-gray-500">Date: 01/01/2025</div>
                  <div className="text-xs text-gray-500">Due: 08/01/2025</div>
                </div>

                <div className="flex items-start space-x-3 mb-6">
                  <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-xs">
                    <div className="font-semibold mb-1">SecureGuard Pro Ltd</div>
                    <div className="text-gray-600">Security House, 45 Park Lane</div>
                    <div className="text-gray-600">London, W1K 1PN</div>
                    <div className="text-gray-600">Tel: 020 7123 4567</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6 text-xs">
                  <div>
                    <div className="text-red-600 font-medium mb-1">Bill To</div>
                    <div className="font-semibold">Westfield Corporation</div>
                    <div className="text-gray-600">Finance Department</div>
                    <div className="text-gray-600">Ariel Way</div>
                    <div className="text-gray-600">London, W12 7GF</div>
                  </div>
                  <div>
                    <div className="text-red-600 font-medium mb-1">Service Location</div>
                    <div className="text-gray-600">Westfield Shopping Centre</div>
                    <div className="text-gray-600">White City, London</div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded p-3 mb-4 text-xs">
                  <div className="font-medium mb-1">Contract Details</div>
                  <div className="text-gray-600">Period: December 2026</div>
                  <div className="text-gray-600">Type: 24/7 Security Coverage</div>
                </div>

                <div className="text-xs mb-4">
                  <div className="font-medium mb-2">Services Provided</div>
                  <div className="grid grid-cols-6 gap-2 font-medium mb-2 pb-2 border-b">
                    <div className="col-span-2">Service</div>
                    <div className="text-center">Hours</div>
                    <div className="text-right">Rate</div>
                    <div className="text-center">VAT</div>
                    <div className="text-right">Total</div>
                  </div>
                  
                  <div className="grid grid-cols-6 gap-2 mb-3 text-gray-700">
                    <div className="col-span-2">Security Officers (Day Shift)</div>
                    <div className="text-center">720</div>
                    <div className="text-right">15.00</div>
                    <div className="text-center">20%</div>
                    <div className="text-right">3600.00</div>
                  </div>

                  <div className="grid grid-cols-6 gap-2 mb-3 text-gray-700">
                    <div className="col-span-2">Security Officers (Night Shift)</div>
                    <div className="text-center">360</div>
                    <div className="text-right">18.00</div>
                    <div className="text-center">20%</div>
                    <div className="text-right">2160.00</div>
                  </div>

                  <div className="grid grid-cols-6 gap-2 mb-3 text-gray-700">
                    <div className="col-span-2">Supervisor Services</div>
                    <div className="text-center">168</div>
                    <div className="text-right">22.00</div>
                    <div className="text-center">20%</div>
                    <div className="text-right">1232.00</div>
                  </div>

                  <div className="grid grid-cols-6 gap-2 text-gray-700">
                    <div className="col-span-2">Mobile Patrol Services</div>
                    <div className="text-center">60</div>
                    <div className="text-right">25.00</div>
                    <div className="text-center">20%</div>
                    <div className="text-right">1050.00</div>
                  </div>
                </div>

                <div className="border-t pt-3 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>R 7,041.67</span>
                  </div>
                  <div className="flex justify-between">
                    <span>VAT (20%):</span>
                    <span>R 1,408.33</span>
                  </div>
                  <div className="flex justify-between font-semibold text-red-600 border-t pt-2 text-sm">
                    <span>Total Due:</span>
                    <span>R 8,450.00</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t">
                  <div className="text-xs font-medium mb-2 text-red-600">Bank Details</div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>Bank: Barclays Bank UK</div>
                    <div>Account: SecureGuard Pro Ltd</div>
                    <div>Sort Code: 20-00-00</div>
                    <div>Account No: 87654321</div>
                    <div>IBAN: GB29 BARC 2000 0087 6543 21</div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t text-xs text-gray-500 space-y-1">
                  <div>VAT Reg: GB 987 6543 21</div>
                  <div>Company Reg: 87654321</div>
                  <div>SIA License: SIA-ACS-12345</div>
                  <div className="text-center mt-3 italic">Payment terms: 7 days from invoice date</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityDashboard;