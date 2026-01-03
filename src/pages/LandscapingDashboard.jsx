import React, { useState, useEffect } from 'react';
import { Printer, Download } from 'lucide-react';
import { serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import {
  getFirestore,
  collection,
  query,
  orderBy,
  limit,
  getDocs
} from 'firebase/firestore';

import { getAuth, signOut } from 'firebase/auth';
import { ChevronDown, ChevronLeft, Home, Settings, Users, Calendar, FileText, LogOut, DollarSign, FileBarChart, BarChart3, Menu, Plus, Send, Edit, CheckSquare, Wrench, ClipboardList, Leaf, Droplets, Scissors } from 'lucide-react';

const generateInvoiceNumber = async (userId) => {
  const db = getFirestore();
  const year = new Date().getFullYear();

  const invoicesRef = collection(db, 'users', userId, 'invoices');

  const q = query(
    invoicesRef,
    orderBy('createdAt', 'desc'),
    limit(1)
  );

  const snapshot = await getDocs(q);

  let lastNumber = 891; // fallback start

  if (!snapshot.empty) {
    const lastInvoice = snapshot.docs[0].data();
    const match = lastInvoice.invoiceNumber?.match(/(\d+)$/);

    if (match) {
      lastNumber = Number(match[1]);
    }
  }

  const nextNumber = lastNumber + 1;

  return `HVAC-${year}-${String(nextNumber).padStart(4, '0')}`;
};


const LandscapingDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Invoice');
  const [showInvoice, setShowInvoice] = useState(false);
  const { user } = useAuth();
  const [invoiceNumber, setInvoiceNumber] = useState('');
useEffect(() => {
  if (!user?.uid) return;

  const loadInvoiceNumber = async () => {
    const nextInvoice = await generateInvoiceNumber(user.uid);
    setInvoiceNumber(nextInvoice);
  };

  loadInvoiceNumber();
}, [user]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [clientName, setClientName] = useState('Emma Thompson');
  const [clientId, setClientId] = useState('C-2024-3421');
  const [clientEmail, setClientEmail] = useState('emma.thompson@example.com');
  const [clientPhone, setClientPhone] = useState('0161 789 4563');
  const [clientAddress, setClientAddress] = useState('156 Wilmslow Road, Didsbury, Manchester, M20 8RY');
  const [serviceType, setServiceType] = useState('Garden Renovation & Maintenance');
  
  const handlePrint = () => {
    window.print();
  };

  const handleSave = () => {
    window.print();
  }; 
  
 const handleLogout = async () => {
     const auth = getAuth();
     try {
       await signOut(auth);
       console.log('Logged out successfully');
     } catch (error) {
       console.error('Error logging out:', error);
     }
   };

  return (
    <div className="flex h-screen bg-gray-50">
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed lg:relative lg:translate-x-0 z-50 w-64 bg-gray-900 border-r border-gray-200 transition-transform duration-300 h-full print:hidden`}>
        <div className="p-4">
         <div className="flex items-center space-x-2 mb-8">
                     <img src="public/logo512.png" alt="Logo" className="w-8 h-8 rounded-lg object-contain" />
                     <span className="font-semibold text-lg text-white">SolidFlo Pro</span>
                     <ChevronDown className="w-4 h-4 ml-auto text-gray-400" />
                   </div>

          <nav className="space-y-1">
            <div className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-lg cursor-pointer">
              <Home className="w-5 h-5" />
              <span>Dashboard</span>
            </div>
            <div className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-lg cursor-pointer">
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </div>
            
            <div className="pt-4">
              <div className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-lg cursor-pointer">
                <Calendar className="w-5 h-5" />
                <span>Job Schedule</span>
              </div>
              
              <div className="mt-2">
                <div className="flex items-center justify-between px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-lg cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5" />
                    <span>Billing</span>
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </div>
                
                <div className="ml-8 mt-1 space-y-1">
                  <div className="px-3 py-2 text-sm text-white bg-gray-800 rounded-lg cursor-pointer">
                    Invoices
                  </div>
                  <div className="px-3 py-2 text-sm text-gray-400 hover:bg-gray-800 rounded-lg cursor-pointer">
                    Clients
                  </div>
                  <div className="px-3 py-2 text-sm text-gray-400 hover:bg-gray-800 rounded-lg cursor-pointer">
                    Quotes
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-lg cursor-pointer mt-2">
                <Users className="w-5 h-5" />
                <span>Client Records</span>
              </div>

              <div className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-lg cursor-pointer">
                <Wrench className="w-5 h-5" />
                <span>Crew Members</span>
              </div>

              <div className="flex items-center justify-between px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-lg cursor-pointer">
                <div className="flex items-center space-x-3">
                  <Scissors className="w-5 h-5" />
                  <span>Equipment</span>
                </div>
                <ChevronDown className="w-4 h-4" />
              </div>

              <div className="flex items-center justify-between px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-lg cursor-pointer">
                <div className="flex items-center space-x-3">
                  <ClipboardList className="w-5 h-5" />
                  <span>Maintenance Plans</span>
                </div>
                <ChevronDown className="w-4 h-4" />
              </div>

              <div className="flex items-center justify-between px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-lg cursor-pointer">
                <div className="flex items-center space-x-3">
                  <DollarSign className="w-5 h-5" />
                  <span>Payments</span>
                </div>
                <ChevronDown className="w-4 h-4" />
              </div>

              <div className="flex items-center justify-between px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-lg cursor-pointer">
                <div className="flex items-center space-x-3">
                  <FileBarChart className="w-5 h-5" />
                  <span>Reports</span>
                </div>
                <ChevronDown className="w-4 h-4" />
              </div>

              <div className="flex items-center justify-between px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-lg cursor-pointer">
                <div className="flex items-center space-x-3">
                  <BarChart3 className="w-5 h-5" />
                  <span>Analytics</span>
                </div>
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700 bg-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-600 rounded-full"></div>
             <div className="flex-1">
              <div className="text-sm font-medium text-white">{user?.name || 'User'}</div>
              <div className="text-xs text-gray-400">{user?.email || 'email@example.com'}</div>
            </div>
             <button onClick={handleLogout} className="text-gray-400 hover:text-white">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 lg:space-x-4">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg">
                <Menu className="w-5 h-5" />
              </button>
              <ChevronLeft className="hidden lg:block w-5 h-5 text-gray-400" />
              <h1 className="text-base lg:text-xl font-semibold">
                Invoice #{invoiceNumber}
                </h1>
            </div>
            
            <div className="hidden lg:flex items-center space-x-3 print:hidden">
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <CheckSquare className="w-4 h-4" />
                <span>Mark as Paid</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                <Send className="w-4 h-4" />
                <span>Send</span>
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Save as PDF
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Log Out
              </button>
            </div>
            
            <button
              onClick={handleLogout}
              className="lg:hidden p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors print:hidden"
            >
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>

        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 print:hidden">
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 whitespace-nowrap text-sm">
              <CheckSquare className="w-4 h-4" />
              <span>Mark as Paid</span>
            </button>
            <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 whitespace-nowrap text-sm">
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </button>
            <button className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 whitespace-nowrap text-sm">
              <Send className="w-4 h-4" />
              <span>Send</span>
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap text-sm"
            >
              <Download className="w-4 h-4" />
              <span>Save PDF</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors whitespace-nowrap text-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>
          </div>
        </div>

        <div className="bg-white border-b border-gray-200 px-4 lg:px-6 overflow-x-auto print:hidden">
          <div className="flex space-x-4 lg:space-x-8 min-w-max">
            {['Invoice', 'History', 'Notes'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 border-b-2 ${
                  activeTab === tab
                    ? 'border-green-600 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 lg:p-6">
          <button
            onClick={() => setShowInvoice(!showInvoice)}
            className="lg:hidden w-full mb-4 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <FileText className="w-5 h-5" />
            {showInvoice ? 'Hide Invoice' : 'View Invoice'}
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
            <div className={`${showInvoice ? 'hidden' : 'block'} lg:col-span-3 space-y-6 lg:block print:hidden`}>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 flex items-center space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-yellow-700 font-medium">Pending</span>
                <span className="text-yellow-600">Payment due within 14 days</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Total Amount</div>
                  <div className="text-2xl font-semibold text-green-600">R 2,845.00</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Paid</div>
                  <div className="text-2xl font-semibold text-green-600">R 0.00</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Balance Due</div>
                  <div className="text-2xl font-semibold">R 2,845.00</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Service Date</div>
                  <div className="text-base font-medium">15/12/2024</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Invoice Date</div>
                  <div className="text-base font-medium">16/12/2024</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Due Date</div>
                  <div className="text-base font-medium">30/12/2024</div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>Client Information</span>
                  </h2>
                  <button className="flex items-center space-x-2 text-green-600 hover:text-green-700">
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Client Name</div>
                    <input
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full px-4 py-2 border rounded"
                    />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Client ID</div>
                    <input
                      type="text"
                      value={clientId}
                      onChange={(e) => setClientId(e.target.value)}
                      className="w-full px-4 py-2 border rounded"
                    />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Email</div>
                    <input
                      type="text"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      className="w-full px-4 py-2 border rounded"
                    />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Phone</div>
                    <input
                      type="text"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      className="w-full px-4 py-2 border rounded"
                    />
                  </div>
                  <div className="col-span-1 sm:col-span-2">
                    <div className="text-sm text-gray-500">Service Address</div>
                    <input
                      type="text"
                      value={clientAddress}
                      onChange={(e) => setClientAddress(e.target.value)}
                      className="w-full px-4 py-2 border rounded"
                    />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Property Type</div>
                    <div className="font-medium">Residential</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Service Type</div>
                    <input
                      type="text"
                      value={serviceType}
                      onChange={(e) => setServiceType(e.target.value)}
                      className="w-full px-4 py-2 border rounded"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Payments</h2>
                  <button className="flex items-center space-x-2 text-green-600 hover:text-green-700">
                    <Plus className="w-4 h-4" />
                    <span>Add</span>
                  </button>
                </div>
                
                <div className="text-center text-gray-400 py-8">
                  <p>No payments recorded yet</p>
                  <p className="text-sm mt-2">Payment due by 30 December 2024</p>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center space-x-2">
                    <Droplets className="w-5 h-5" />
                    <span>Garden Details</span>
                  </h2>
                </div>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Garden Size:</span>
                    <span className="font-medium">450 m²</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Lawn Area:</span>
                    <span className="font-medium">280 m²</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Planted Beds:</span>
                    <span className="font-medium">6 areas</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Irrigation System:</span>
                    <span className="font-medium">Automatic Drip</span>
                  </div>
                </div>
              </div>
            </div>
             
            <div className={`${!showInvoice ? 'hidden' : 'block'} lg:block lg:col-span-3 mx-auto bg-white shadow-lg`} style={{
              width: '100%',
              maxWidth: '210mm',
              minHeight: '297mm',
              padding: '5mm'
            }}>
              <div className="lg:col-span-1">
                <div className="bg-white border border-gray-200 rounded-lg p-4 lg:p-6 shadow-sm">
                  <div className="text-right mb-6">
                    <div className="text-sm font-semibold mb-1">LANDSCAPING SERVICE INVOICE</div>
                   <div className="text-xs">Invoice No: {invoiceNumber}</div>
                    <div className="text-xs text-gray-500">Service Date: 15/12/2024</div>
                     <div className="text-xs text-gray-500">Date Issued : {new Date().toLocaleDateString('en-GB')}
                  </div>
                 <div className="text-xs text-gray-500">
                    Due Date: {(() => {
                      const dueDate = new Date();
                      dueDate.setDate(dueDate.getDate() + 21);
                      return dueDate.toLocaleDateString('en-GB');
                    })()}
                  </div>
                  </div>

                  <div className="flex items-start space-x-3 mb-6">
                    <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Leaf className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-xs">
                      <div className="font-semibold mb-1">GreenScape Pro Landscaping Ltd</div>
                      <div className="text-gray-600">12 Riverside Business Park</div>
                      <div className="text-gray-600">Sale, Manchester, M33 7WR</div>
                      <div className="text-gray-600">Tel: 0161 973 2400</div>
                      <div className="text-gray-600">Email: info@greenscape.co.uk</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-xs">
                    <div>
                      <div className="text-green-600 font-medium mb-1">Bill To</div>
                      <div className="font-semibold">{clientName}</div>
                      <div className="text-gray-600">{clientAddress}</div>
                      <div className="text-gray-600">{clientPhone}</div>
                      <div className="text-gray-600">{clientEmail}</div>
                    </div>
                    <div>
                      <div className="text-green-600 font-medium mb-1">Service Location</div>
                      <div className="text-gray-600">{clientAddress}</div>
                      <div className="text-gray-600 mt-2">Client ID: {clientId}</div>
                      <div className="text-gray-600">Property: Residential</div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded p-3 mb-4 text-xs">
                    <div className="font-medium mb-1">Crew Details</div>
                    <div className="text-gray-600">Lead: Michael Roberts - Senior Landscaper</div>
                    <div className="text-gray-600">Team Members: 3 (Including equipment operator)</div>
                    <div className="text-gray-600">Service Time: 08:00 - 17:30 (2 days)</div>
                  </div>

                  <div className="bg-green-50 rounded p-3 mb-4 text-xs">
                    <div className="font-medium mb-1">Project Information</div>
                    <div className="text-gray-600">Garden Size: 450 m² (Lawn: 280 m²)</div>
                    <div className="text-gray-600">Service Type: {serviceType}</div>
                    <div className="text-gray-600">Weather Conditions: Dry, 12°C</div>
                  </div>

                  <div className="text-xs mb-4">
                    <div className="font-medium mb-2">Services & Materials</div>
                    <div className="grid grid-cols-6 gap-2 font-medium mb-2 pb-2 border-b">
                      <div className="col-span-3">Description</div>
                      <div className="text-center">Rate</div>
                      <div className="text-right">Qty</div>
                      <div className="text-right">Amount</div>
                    </div>
                    
                    <div className="grid grid-cols-6 gap-2 mb-2 text-gray-700">
                      <div className="col-span-3">Garden Design Consultation</div>
                      <div className="text-center text-xs">R95/hr</div>
                      <div className="text-right">2</div>
                      <div className="text-right">R190.00</div>
                    </div>

                    <div className="grid grid-cols-6 gap-2 mb-2 text-gray-700">
                      <div className="col-span-3">Lawn Renovation & Reseeding</div>
                      <div className="text-center text-xs">R4/m²</div>
                      <div className="text-right">280</div>
                      <div className="text-right">R1,120.00</div>
                    </div>

                    <div className="grid grid-cols-6 gap-2 mb-2 text-gray-700">
                      <div className="col-span-3">Premium Topsoil (per tonne)</div>
                      <div className="text-center text-xs">R45/t</div>
                      <div className="text-right">6</div>
                      <div className="text-right">R270.00</div>
                    </div>

                    <div className="grid grid-cols-6 gap-2 mb-2 text-gray-700">
                      <div className="col-span-3">Flower Bed Preparation</div>
                      <div className="text-center text-xs">-</div>
                      <div className="text-right">6</div>
                      <div className="text-right">R420.00</div>
                    </div>

                    <div className="grid grid-cols-6 gap-2 mb-2 text-gray-700">
                      <div className="col-span-3">Shrub & Plant Installation</div>
                      <div className="text-center text-xs">R15/ea</div>
                      <div className="text-right">45</div>
                      <div className="text-right">R675.00</div>
                    </div>

                    <div className="grid grid-cols-6 gap-2 mb-2 text-gray-700">
                      <div className="col-span-3">Mulch Application (Bark)</div>
                      <div className="text-center text-xs">R35/m³</div>
                      <div className="text-right">4</div>
                      <div className="text-right">R140.00</div>
                    </div>

                    <div className="grid grid-cols-6 gap-2 mb-2 text-gray-700">
                      <div className="col-span-3">Hedge Trimming Service</div>
                      <div className="text-center text-xs">R45/hr</div>
                      <div className="text-right">1</div>
                      <div className="text-right">R45.00</div>
                    </div>

                    <div className="grid grid-cols-6 gap-2 mb-2 text-gray-700">
                      <div className="col-span-3">Garden Path Edging (Stone)</div>
                      <div className="text-center text-xs">R18/m</div>
                      <div className="text-right">12</div>
                      <div className="text-right">R216.00</div>
                    </div>

                    <div className="grid grid-cols-6 gap-2 mb-4 text-gray-700">
                      <div className="col-span-3">Waste Removal & Disposal</div>
                      <div className="text-center text-xs">-</div>
                      <div className="text-right">1</div>
                      <div className="text-right">R120.00</div>
                    </div>
                  </div>

                  <div className="border-t pt-4 text-xs">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-medium">R3,196.00</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Discount (11%):</span>
                      <span className="font-medium text-green-600">-R351.00</span>
                    </div>
                    <div className="flex justify-between mb-2 pb-2 border-b">
                      <span className="text-gray-600">VAT (0%):</span>
                      <span className="font-medium">R0.00</span>
                    </div>
                    <div className="flex justify-between text-base font-bold">
                      <span>Total Amount Due:</span>
                      <span className="text-green-600">R2,845.00</span>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded p-4 mt-6 text-xs">
                    <div className="font-medium mb-2">Payment Information</div>
                    <div className="space-y-1 text-gray-700">
                      <div>Bank: Manchester Building Society</div>
                      <div>Account Name: GreenScape Pro Landscaping Ltd</div>
                      <div>Sort Code: 01-23-45</div>
                      <div>Account Number: 12345678</div>
                      <div className="pt-2">Payment Reference: LAND-2024-1256</div>
                    </div>
                  </div>

                  <div className="mt-6 text-xs text-gray-600">
                    <div className="font-medium mb-2">Terms & Conditions</div>
                    <div className="space-y-1">
                      <p>• Payment is due within 14 days of invoice date</p>
                      <p>• Late payments may incur a 2% monthly interest charge</p>
                      <p>• All work is guaranteed for 12 months from completion date</p>
                      <p>• Plants carry a 6-month establishment guarantee</p>
                      <p>• Customer satisfaction is our priority - please contact us with any concerns</p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t text-center text-xs text-gray-500">
                    <p>Thank you for choosing GreenScape Pro Landscaping</p>
                    <p className="mt-1">Company Registration No: 12345678 | VAT No: GB123456789</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandscapingDashboard;