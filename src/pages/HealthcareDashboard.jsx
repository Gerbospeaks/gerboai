import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { serverTimestamp } from 'firebase/firestore';
import { getAuth, signOut } from 'firebase/auth';
import { db } from '../firebase';
import {
  getFirestore,
  collection,
  query,
  orderBy,
  limit,
  getDocs
} from 'firebase/firestore';

import { Printer, Download } from 'lucide-react';
import { ChevronDown, ChevronLeft, Home, Settings, Heart, Users, Calendar, LogOut, FileText, DollarSign, FileBarChart, BarChart3, Menu, Plus, Send, Edit, CheckSquare, Stethoscope, ClipboardList } from 'lucide-react';
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


const HealthcareDashboard = () => {
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

  // Set sidebar open on desktop by default
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

  const [clientName, setClientName] = useState('Gabriel Smith');
  const [clientId, setClientId] = useState('123456');
  const [clientDob, setClientDob] = useState('01/01/1980');
  const [clientInsurance, setClientInsurance] = useState('ABC Insurance');
  const [clientPhone, setClientPhone] = useState('123-456-7890');
  const [clientEmail, setClientEmail] = useState('gabriel.smith@example.com');
  
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
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
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
                <span>Appointments</span>
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
                    Patients
                  </div>
                  <div className="px-3 py-2 text-sm text-gray-400 hover:bg-gray-800 rounded-lg cursor-pointer">
                    Insurance Claims
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-lg cursor-pointer mt-2">
                <Users className="w-5 h-5" />
                <span>Patient Records</span>
              </div>

              <div className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-lg cursor-pointer">
                <Stethoscope className="w-5 h-5" />
                <span>Medical Staff</span>
              </div>

              <div className="flex items-center justify-between px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-lg cursor-pointer">
                <div className="flex items-center space-x-3">
                  <ClipboardList className="w-5 h-5" />
                  <span>Prescriptions</span>
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

      {/* Main Content */}
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
              <button className="flex items-center space-x-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
                <Send className="w-4 h-4" />
                <span>Send</span>
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
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
            
            {/* Mobile Action Buttons */}
            <button
              onClick={handleLogout}
              className="lg:hidden p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors print:hidden"
            >
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>

        {/* Mobile Action Buttons Bar */}
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
            <button className="flex items-center gap-2 px-3 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 whitespace-nowrap text-sm">
              <Send className="w-4 h-4" />
              <span>Send</span>
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-3 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors whitespace-nowrap text-sm"
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

        <div className="bg-gray-900 border-b border-gray-200 px-4 lg:px-6 overflow-x-auto print:hidden">
          <div className="flex space-x-4 lg:space-x-8 min-w-max">
            {['Invoice', 'History', 'Notes'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 border-b-2 ${
                  activeTab === tab
                    ? 'border-teal-600 text-white'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 lg:p-6">
          {/* Mobile View Invoice Button */}
          <button
            onClick={() => setShowInvoice(!showInvoice)}
            className="lg:hidden w-full mb-4 flex items-center justify-center gap-2 px-4 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            <FileText className="w-5 h-5" />
            {showInvoice ? 'Hide Invoice' : 'View Invoice'}
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
            <div className={`${showInvoice ? 'hidden' : 'block'} lg:col-span-3 space-y-6 lg:block print:hidden`}>
              <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-green-700 font-medium">Paid</span>
                <span className="text-green-600">Insurance claim processed</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Total Amount</div>
                  <div className="text-2xl font-semibold text-teal-600">R 485.00</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Insurance Covered</div>
                  <div className="text-2xl font-semibold text-green-600">R 388.00</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Patient Responsibility</div>
                  <div className="text-2xl font-semibold">R 97.00</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Service Date</div>
                  <div className="text-base font-medium">
                    {new Date().toLocaleDateString('en-GB')}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Invoice Date</div>
                  <div className="text-base font-medium">
                    {new Date().toLocaleDateString('en-GB')}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Paid On</div>
                  <div className="text-base font-medium">31/12/2024</div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>Patient Information</span>
                  </h2>
                  <button className="flex items-center space-x-2 text-teal-600 hover:text-teal-700">
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Patient Name</div>
                    <input
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full px-4 py-2 border rounded"
                    />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Patient ID</div>
                    <input
                      type="text"
                      value={clientId}
                      onChange={(e) => setClientId(e.target.value)}
                      className="w-full px-4 py-2 border rounded"
                    />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Date of Birth</div>
                    <input
                      type="date"
                      value={clientDob}
                      onChange={(e) => setClientDob(e.target.value)}
                      className="w-full px-4 py-2 border rounded"
                    />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">NHS Number</div>
                    <div className="font-medium">485 777 3456</div>
                  </div>
                  <div className="col-span-1 sm:col-span-2">
                    <div className="text-sm text-gray-500">Insurance Provider</div>
                    <input
                      type="text"
                      value={clientInsurance}
                      onChange={(e) => setClientInsurance(e.target.value)}
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
                  <div>
                    <div className="text-sm text-gray-500">Email</div>
                    <input
                      type="text"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      className="w-full px-4 py-2 border rounded"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Payments</h2>
                  <button className="flex items-center space-x-2 text-teal-600 hover:text-teal-700">
                    <Plus className="w-4 h-4" />
                    <span>Add</span>
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div>
                      <div className="font-semibold">R388.00</div>
                      <div className="text-sm text-gray-500">Paid on 31 December 2024</div>
                    </div>
                    <div>
                      <div className="text-green-600 font-medium">Insurance - Bupa</div>
                      <div className="text-sm text-gray-500">Claim #BU2024-8923</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <div className="font-semibold">R97.00</div>
                      <div className="text-sm text-gray-500">Paid on 31 December 2024</div>
                    </div>
                    <div>
                      <div className="text-green-600 font-medium">Patient Co-pay</div>
                      <div className="text-sm text-gray-500">Card Payment</div>
                    </div>
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
                    <div className="text-sm font-semibold mb-1">MEDICAL INVOICE</div>
                    <div className="text-xs">Invoice No: {invoiceNumber}</div>
                    <div className="text-xs text-gray-500">Service Date: 28/12/2024</div>
                     <div className="text-xs text-gray-500">Service Date: {new Date().toLocaleDateString('en-GB')}
                  </div>
                 <div className="text-xs text-gray-500">
                    Invoice Date: {(() => {
                      const dueDate = new Date();
                      dueDate.setDate(dueDate.getDate() + 3);
                      return dueDate.toLocaleDateString('en-GB');
                    })()}
                  </div>
                  </div>

                  <div className="flex items-start space-x-3 mb-6">
                    <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Heart className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-xs">
                      <div className="font-semibold mb-1">SolidFlo  Clinic</div>
                      <div className="text-gray-600">78 Harley Street</div>
                      <div className="text-gray-600">London, W1G 7HJ</div>
                      <div className="text-gray-600">Tel: 020 7946 0958</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-xs">
                    <div>
                      <div className="text-teal-600 font-medium mb-1">Patient</div>
                      <div className="font-semibold">{clientName}</div>
                      <div className="text-gray-600">{clientDob}</div>
                      <div className="text-gray-600">NHS: 485 777 3456</div>
                      <div className="text-gray-600">{clientId}</div>
                    </div>
                    <div>
                      <div className="text-teal-600 font-medium mb-1">Insurance</div>
                      <div className="text-gray-600">{clientInsurance}</div>
                      <div className="text-gray-600">Policy: BU789456</div>
                      <div className="text-gray-600">Auth: #AUTH-8923</div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded p-3 mb-4 text-xs">
                    <div className="font-medium mb-1">Attending Physician</div>
                    <div className="text-gray-600">Dr. Sarah Wilson, MD</div>
                    <div className="text-gray-600">GMC: 7123456</div>
                  </div>

                  <div className="text-xs mb-4">
                    <div className="font-medium mb-2">Services Rendered</div>
                    <div className="grid grid-cols-6 gap-2 font-medium mb-2 pb-2 border-b">
                      <div className="col-span-3">Description</div>
                      <div className="text-center">Code</div>
                      <div className="text-right">Units</div>
                      <div className="text-right">Amount</div>
                    </div>
                    
                    <div className="grid grid-cols-6 gap-2 mb-2 text-gray-700">
                      <div className="col-span-3">Consultation - General Practice</div>
                      <div className="text-center text-xs">99213</div>
                      <div className="text-right">1</div>
                      <div className="text-right">85.00</div>
                    </div>

                    <div className="grid grid-cols-6 gap-2 mb-2 text-gray-700">
                      <div className="col-span-3">Blood Tests - Full Panel</div>
                      <div className="text-center text-xs">80050</div>
                      <div className="text-right">1</div>
                      <div className="text-right">145.00</div>
                    </div>

                    <div className="grid grid-cols-6 gap-2 mb-2 text-gray-700">
                      <div className="col-span-3">ECG - 12 Lead</div>
                      <div className="text-center text-xs">93000</div>
                      <div className="text-right">1</div>
                      <div className="text-right">120.00</div>
                    </div>

                    <div className="grid grid-cols-6 gap-2 mb-2 text-gray-700">
                      <div className="col-span-3">X-Ray - Chest PA</div>
                      <div className="text-center text-xs">71010</div>
                      <div className="text-right">1</div>
                      <div className="text-right">95.00</div>
                    </div>

                    <div className="grid grid-cols-6 gap-2 text-gray-700">
                      <div className="col-span-3">Prescription Medication</div>
                      <div className="text-center text-xs">-</div>
                      <div className="text-right">1</div>
                      <div className="text-right">40.00</div>
                    </div>
                  </div>

                  <div className="border-t pt-3 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>R 485.00</span>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span>Insurance Coverage (80%):</span>
                      <span>- R 388.00</span>
                    </div>
                    <div className="flex justify-between font-semibold text-teal-600 border-t pt-2 text-sm">
                      <span>Patient Responsibility:</span>
                      <span>R 97.00</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t">
                    <div className="text-xs font-medium mb-2 text-teal-600">Payment Details</div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>Bank: HSBC UK</div>
                      <div>Account: SolidFlo  Ltd</div>
                      <div>Sort Code: 40-47-84</div>
                      <div>Account No: 45678901</div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t text-xs text-gray-500 space-y-1">
                    <div>Clinic Reg: MC123456</div>
                    <div>CQC Rating: Outstanding</div>
                    <div className="text-center mt-3 italic">For medical records inquiries, please contact us</div>
                  </div>
                </div>
              </div>
            </div>
            
            <style>{`
              @media print {
                body {
                  margin: 0;
                  padding: 0;
                }
                
                @page {
                  size: A4;
                  margin: 0;
                }
                
                .print\\:hidden {
                  display: none !important;
                }
                
                /* Show invoice on print */
                .lg\\:block {
                  display: block !important;
                }
                
                /* Avoid page breaks inside elements */
                * {
                  page-break-inside: avoid;
                  break-inside: avoid;
                }
                
                /* Ensure content flows to next page if needed */
                .grid, .space-y-1, .border-t {
                  page-break-inside: avoid;
                  break-inside: avoid;
                }
              }
              
              @media screen {
                body {
                  background: #f3f4f6;
                }
              }
              
              @media screen and (max-width: 1024px) {
                /* Adjust invoice container on mobile */
                [style*="210mm"] {
                  width: 100% !important;
                  padding: 5mm !important;
                }
                
                /* Custom scrollbar for mobile action buttons */
                .overflow-x-auto::-webkit-scrollbar {
                  height: 4px;
                }
                
                .overflow-x-auto::-webkit-scrollbar-track {
                  background: #f1f1f1;
                  border-radius: 10px;
                }
                
                .overflow-x-auto::-webkit-scrollbar-thumb {
                  background: #888;
                  border-radius: 10px;
                }
                
                .overflow-x-auto::-webkit-scrollbar-thumb:hover {
                  background: #555;
                }
              }
            `}</style>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthcareDashboard;