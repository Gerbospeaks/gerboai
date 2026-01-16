import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { serverTimestamp } from "firebase/firestore";
import logo from '../../assets/img/solidflo-logo.png';
import { getAuth, signOut } from "firebase/auth";
import { db } from '../../firebase';
import {
  getFirestore,
  collection,
  query,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
import { Printer, Download } from "lucide-react";
import Templates from "./Templates";
import TemplateSelector, { TemplateRenderer } from './TemplateSelector';
import {
  ChevronDown,
  ChevronLeft,
  Home,
  Settings,
  Heart,
  Users,
  Calendar,
  FileText,
  DollarSign,
  FileBarChart,
  BarChart3,
  Menu,
  Plus,
  Send,
  Edit,
  LogOut,
  CheckSquare,
  Wrench,
  ClipboardList,
  Thermometer,
  Wind,
  Fan,
} from "lucide-react";
const generateInvoiceNumber = async (userId) => {
  const db = getFirestore();
  const year = new Date().getFullYear();

  const invoicesRef = collection(db, "users", userId, "invoices");

  const q = query(invoicesRef, orderBy("createdAt", "desc"), limit(1));

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

  return `HVAC-${year}-${String(nextNumber).padStart(4, "0")}`;
};

const HVACDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Invoice");
  const [showInvoice, setShowInvoice] = useState(false);
  const [activeView, setActiveView] = useState("invoice");
  const { user } = useAuth();
  const [activeTemplate, setActiveTemplate] = useState("classic");
  const [selectedTemplate, setSelectedTemplate] = useState('professional');
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceId, setInvoiceId] = useState(null);
const [stampSettings, setStampSettings] = useState({
    text: "APPROVED",
    color: "#d32f2f",
    showDate: true,
    enabled: true
  });
  useEffect(() => {
  if (!user?.uid) return;

  const loadInvoiceNumber = async () => {
    const nextInvoice = await generateInvoiceNumber(user.uid);
    setInvoiceNumber(nextInvoice);
  };

  loadInvoiceNumber();
}, [user]);


const loadInvoice = (invoice) => {
  setInvoiceNumber(invoice.invoiceNumber);
  setClientName(invoice.client.name);
  setClientEmail(invoice.client.email);
  setClientPhone(invoice.client.phone);
  setClientAddress(invoice.client.address);
  setClientId(invoice.client.clientId);
  setItems(invoice.items);
};
const loadInvoiceForExport = async () => {
  if (!user?.uid || !invoiceId) return null;

  const db = getFirestore();
  const snap = await getDoc(
    doc(db, "users", user.uid, "invoices", invoiceId)
  );

  return snap.exists() ? snap.data() : null;
};
const handleSavePDF = async () => {
  const savedInvoice = await loadInvoiceForExport();

  if (!savedInvoice) {
    alert("Please save the invoice before exporting PDF");
    return;
  }

  // Populate UI with saved data
  setInvoiceNumber(savedInvoice.invoiceNumber);
  setItems(savedInvoice.items);
  setClientName(savedInvoice.client.name);
  setClientEmail(savedInvoice.client.email);
  setClientPhone(savedInvoice.client.phone);
  setClientAddress(savedInvoice.client.address);

  setTimeout(() => {
    window.print(); // PDF export
  }, 300);
};
const handleAddItem = () => {
  if (!newItem.description || !newItem.qty) return;

  const rate = Number(newItem.rate) || 0;
  const qty = Number(newItem.qty);

  const item = {
    description: newItem.description,
    rate,
    qty,
    amount: rate * qty,
  };

  setItems((prev) => [...prev, item]);

  // reset inputs
  setNewItem({ description: "", rate: "", qty: "" });
};

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
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [clientName, setClientName] = useState("Sarah Mitchell");
  const [clientId, setClientId] = useState("C-2026-4567");
  const [clientEmail, setClientEmail] = useState("sarah.mitchell@example.com");
  const [clientPhone, setClientPhone] = useState("0161 123 4567");
  const [clientAddress, setClientAddress] = useState(
    "42 Deansgate, Manchester, M3 2BA"
  );
  const [serviceType, setServiceType] = useState("Annual Maintenance & Repair");

  const handlePrint = () => {
    window.print();
  };

  const handleSave = () => {
    window.print();
  };
  const [items, setItems] = useState([]);

  const [newItem, setNewItem] = useState({
  description: "",
  rate: "",
  qty: "",
});

 const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
const vat = 0;
const total = subtotal + vat;

  const buildInvoicePayload = (numberToUse) => ({
  invoiceNumber: numberToUse,
  locked: true, // 🔒 lock once saved
  status: "pending",

  dates: {
    serviceDate: "28/12/2026",
    issuedDate: new Date().toISOString(),
    dueDate: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 21);
      return d.toISOString();
    })(),
  },

  client: {
    name: clientName,
    email: clientEmail,
    phone: clientPhone,
    address: clientAddress,
    clientId,
  },

  items,

  totals: {
    subtotal,
    vat,
    total,
    paid: 0,
    due: total,
  },

  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
});

  const handleSaveInvoice = async () => {
  if (!user?.uid) return;

  const db = getFirestore();
  let numberToUse = invoiceNumber;

  // 🔐 Only generate if invoice is NEW
  if (!invoiceId) {
    numberToUse = await generateInvoiceNumber(user.uid);
    setInvoiceNumber(numberToUse);
  }

  const invoiceData = buildInvoicePayload(numberToUse);

  if (invoiceId) {
    // 🔁 Update existing (number stays same)
    await updateDoc(
      doc(db, "users", user.uid, "invoices", invoiceId),
      {
        ...invoiceData,
        updatedAt: serverTimestamp(),
      }
    );
  } else {
    // 🆕 Create & lock
    const ref = await addDoc(
      collection(db, "users", user.uid, "invoices"),
      invoiceData
    );
    setInvoiceId(ref.id);
  }

  alert("Invoice saved and locked");
};


  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      console.log("Logged out successfully");
    } catch (error) {
      console.error("Error logging out:", error);
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
      <div
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed lg:relative lg:translate-x-0 z-50 w-64 bg-gray-900 border-r border-gray-200 transition-transform duration-300 h-full print:hidden`}
      >
        <div className="p-4">
          <div className="flex items-center space-x-2 mb-8">
              <img
                  src={logo}
                  alt="Business Logo"
                  className="w-16 h-12 object-contain rounded-lg"
                />
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
                <span>Service Calls</span>
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
                    Estimates
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-lg cursor-pointer mt-2">
                <Users className="w-5 h-5" />
                <span>Client Records</span>
              </div>

              <div className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-lg cursor-pointer">
                <Wrench className="w-5 h-5" />
                <span>Technicians</span>
              </div>

              <div className="flex items-center justify-between px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-lg cursor-pointer">
                <div className="flex items-center space-x-3">
                  <Fan className="w-5 h-5" />
                  <span>Equipment</span>
                </div>
                <ChevronDown className="w-4 h-4" />
              </div>

              <div className="flex items-center justify-between px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-lg cursor-pointer">
                <div className="flex items-center space-x-3">
                  <ClipboardList className="w-5 h-5" />
                  <span>Maintenance</span>
                </div>
                <ChevronDown className="w-4 h-4" />
              </div>
               <div
                              onClick={() => setActiveView("templates")}
                              className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-slate-800 rounded-lg cursor-pointer"
                            >
                              <FileText className="w-5 h-5" />
                              <span>Invoice Templates</span>
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
              <div className="text-sm font-medium text-white">
                {user?.name || "User"}
              </div>
              <div className="text-xs text-gray-400">
                {user?.email || "email@example.com"}
              </div>
            </div>
             <button onClick={handleLogout} className="text-gray-400 hover:text-white">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
         <div className="sticky top-0 z-40 flex flex-col">
        <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 lg:space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <Menu className="w-5 h-5" />
              </button>
              <ChevronLeft className="hidden lg:block w-5 h-5 text-gray-400" />
              <h1 className="text-base lg:text-xl font-semibold">
                Invoice #{invoiceNumber || "— not saved yet —"}
                </h1>
              <TemplateSelector
                              user={user}
                              selectedTemplate={activeTemplate}
                              onTemplateChange={setActiveTemplate}
                            />
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
              <button
                onClick={handleSaveInvoice}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg"
              >
                Save Invoice
              </button>

              <button className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
                <Send className="w-4 h-4" />
                <span>Send</span>
              </button>
                <button
                onClick={handleSavePDF}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg"
                >
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
            <button className="flex items-center gap-2 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 whitespace-nowrap text-sm">
              <Send className="w-4 h-4" />
              <span>Send</span>
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors whitespace-nowrap text-sm"
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
            {["Invoice", "History", "Notes"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 border-b-2 ${
                  activeTab === tab
                    ? "border-orange-600 text-white"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        </div>
        <div className="p-4 lg:p-6">
          {/* Mobile View Invoice Button */}
          <button
            onClick={() => setShowInvoice(!showInvoice)}
            className="lg:hidden w-full mb-4 flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <FileText className="w-5 h-5" />
            {showInvoice ? "Hide Invoice" : "View Invoice"}
          </button>
             {activeView === "templates" && <Templates user={user} />}
                     {activeView === "invoice" && (
                       <>
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
            <div
              className={`${
                showInvoice ? "hidden" : "block"
              } lg:col-span-3 space-y-6 lg:block print:hidden`}
            >
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 flex items-center space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-yellow-700 font-medium">Pending</span>
                <span className="text-yellow-600">
                  Payment due within 30 days
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Total Amount</div>
                  <div className="text-2xl font-semibold text-orange-600">
                    R 1,485.00
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Paid</div>
                  <div className="text-2xl font-semibold text-green-600">
                    R 0.00
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Balance Due</div>
                  <div className="text-2xl font-semibold">R 1,485.00</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Service Date</div>
                  <div className="text-base font-medium">28/12/2026</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Invoice Date</div>
                  <div className="text-base font-medium">29/12/2026</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Due Date</div>
                  <div className="text-base font-medium">28/01/2025</div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>Client Information</span>
                  </h2>
                  <button className="flex items-center space-x-2 text-orange-600 hover:text-orange-700">
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
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
  <h2 className="text-lg font-semibold mb-4">Add Service / Item</h2>

  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
    <input
      type="text"
      placeholder="Description"
      value={newItem.description}
      onChange={(e) =>
        setNewItem({ ...newItem, description: e.target.value })
      }
      className="px-4 py-2 border rounded"
    />

    <input
      type="number"
      placeholder="Rate"
      value={newItem.rate}
      onChange={(e) =>
        setNewItem({ ...newItem, rate: e.target.value })
      }
      className="px-4 py-2 border rounded"
    />

    <input
      type="number"
      placeholder="Qty"
      value={newItem.qty}
      onChange={(e) =>
        setNewItem({ ...newItem, qty: e.target.value })
      }
      className="px-4 py-2 border rounded"
    />

    <button
      onClick={handleAddItem}
      className="bg-orange-600 text-white rounded-lg px-4 py-2 hover:bg-orange-700 flex items-center justify-center gap-2"
    >
      <Plus className="w-4 h-4" />
      Add
    </button>
  </div>
</div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Payments</h2>
                  <button className="flex items-center space-x-2 text-orange-600 hover:text-orange-700">
                    <Plus className="w-4 h-4" />
                    <span>Add</span>
                  </button>
                </div>

                <div className="text-center text-gray-400 py-8">
                  <p>No payments recorded yet</p>
                  <p className="text-sm mt-2">Payment due by 28 January 2025</p>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center space-x-2">
                    <Thermometer className="w-5 h-5" />
                    <span>Equipment Details</span>
                  </h2>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">System Type:</span>
                    <span className="font-medium">
                      Central Air Conditioning
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Brand:</span>
                    <span className="font-medium">Carrier</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Model:</span>
                    <span className="font-medium">24ACB736A003</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Installation Date:</span>
                    <span className="font-medium">15/03/2020</span>
                  </div>
                </div>
              </div>
            </div>

            <div
              className={`${
                !showInvoice ? "hidden" : "block"
              } lg:block lg:col-span-3 mx-auto bg-white shadow-lg`}
              style={{
                width: "100%",
                maxWidth: "210mm",
                minHeight: "297mm",
                padding: "5mm",
              }}
            >
              <div className="lg:col-span-1 m-[10mm]">
                <div className="bg-white  rounded-lg p-4 lg:p-6 shadow-sm">
                  <div className="flex justify-between items-start mb-6">
                {/* LEFT SIDE — LOGO ON TOP */}
                <div className="flex flex-col items-start">
                    <div className="w-20 h-20 mb-2">
                    <img
                        src={user.logoUrl}
                        alt={`${user.name} logo`}
                        className="w-full h-full object-contain"
                    />
                    </div>

                    <div className="text-xs">
                    <div className="font-semibold mb-1">
                        CoolTech HVAC Services Ltd
                    </div>
                    <div className="text-gray-600">Unit 5, Trafford Park</div>
                    <div className="text-gray-600">Manchester, M17 1AB</div>
                    <div className="text-gray-600">Tel: 0161 555 0123</div>
                    <div className="text-gray-600">
                        Email: service@cooltech.co.uk
                    </div>
                    </div>
                </div>

                {/* RIGHT SIDE — INVOICE DETAILS */}
                <div className="text-right text-xs">
                    <div className="text-sm font-semibold mb-1">
                    HVAC SERVICE INVOICE
                    </div>
                    <div>Invoice No: {invoiceNumber}</div>
                    <div className="text-gray-500">
                    Service Date: 28/12/2026
                    </div>
                    <div className="text-gray-500">
                    Date Issued: {new Date().toLocaleDateString("en-GB")}
                    </div>
                    <div className="text-gray-500">
                    Due Date:{" "}
                    {(() => {
                        const dueDate = new Date();
                        dueDate.setDate(dueDate.getDate() + 21);
                        return dueDate.toLocaleDateString("en-GB");
                    })()}
                    </div>
                </div>
                </div>


                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-xs">
                    <div>
                      <div className="text-orange-600 font-medium mb-1">
                        Bill To
                      </div>
                      <div className="font-semibold">{clientName}</div>
                      <div className="text-gray-600">{clientAddress}</div>
                      <div className="text-gray-600">{clientPhone}</div>
                      <div className="text-gray-600">{clientEmail}</div>
                    </div>
                    <div>
                      <div className="text-orange-600 font-medium mb-1">
                        Service Location
                      </div>
                      <div className="text-gray-600">{clientAddress}</div>
                      <div className="text-gray-600 mt-2">
                        Client ID: {clientId}
                      </div>
                      <div className="text-gray-600">Property: Residential</div>
                    </div>
                  </div>

                  <div className="flex gap-4 mb-4">
  {/* Technician Details */}
  <div className="bg-gray-50 rounded p-3 text-xs flex-1">
    <div className="font-medium mb-1">Technician Details</div>
    <div className="text-gray-600">
      James Anderson - Cert. HVAC Technician
    </div>
    <div className="text-gray-600">License: HVAC-UK-45789</div>
    <div className="text-gray-600">
      Service Time: 09:00 - 13:30 (4.5 hours)
    </div>
  </div>

  {/* Equipment Information */}
  <div className="bg-orange-50 rounded p-3 text-xs flex-1">
    <div className="font-medium mb-1">Equipment Information</div>
    <div className="text-gray-600">
      System: Central Air Conditioning
    </div>
    <div className="text-gray-600">
      Brand: Carrier • Model: 24ACB736A003
    </div>
    <div className="text-gray-600">Serial: CC2020-4567-XYZ</div>
  </div>
</div>


                  <div className="text-xs mb-4">
                    <div className="font-medium mb-2">Services & Parts</div>
                    <div className="grid grid-cols-6 gap-2 font-medium mb-2 pb-2 border-b">
                      <div className="col-span-3">Description</div>
                      <div className="text-center">Rate</div>
                      <div className="text-right">Qty</div>
                      <div className="text-right">Amount</div>
                    </div>

                    {items.map((item, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-6 gap-2 mb-2 text-gray-700"
                      >
                        <div className="col-span-3">{item.description}</div>
                        <div className="text-center text-xs">
                          {item.rate ? `R${item.rate}/hr` : "-"}
                        </div>
                        <div className="text-right">{item.qty}</div>
                        <div className="text-right">
                          R{item.amount.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-3 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>R 1,485.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>VAT (20%):</span>
                      <span>R 0.00</span>
                    </div>
                    <div className="flex justify-between font-semibold border-t pt-2">
                      <span>Total:</span>
                      <span>R 1,485.00</span>
                    </div>
                    <div className="flex justify-between text-gray-600 pt-2 border-t">
                      <span>Amount Paid:</span>
                      <span>R 0.00</span>
                    </div>
                    <div className="flex justify-between font-semibold text-orange-600 border-t pt-2 text-sm">
                      <span>Amount Due:</span>
                      <span>R 1,485.00</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t">
                    <div className="text-xs font-medium mb-2 text-orange-600">
                      Payment Information
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>Bank: Barclays Bank PLC</div>
                      <div>Account: CoolTech HVAC Services Ltd</div>
                      <div>Sort Code: 20-00-00</div>
                      <div>Account No: 87654321</div>
                      <div>IBAN: GB29 BARC 2000 0087 6543 21</div>
                      <div className="mt-2">Payment Terms: Net 30 days</div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t text-xs text-gray-500 space-y-1">
                    <div>Company Reg: 12345678</div>
                    <div>VAT Reg: GB 123 4567 89</div>
                    <div className="text-center mt-3 italic">
                      Thank you for your business
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <style>{`
              @media print {
                * {
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
                
                html, body {
                  margin: 0;
                  padding: 0;
                  background: white !important;
                  overflow: hidden !important;
                  width: 210mm;
                  height: 297mm;
                }
                
                @page {
                  size: A4;
                  margin: 0;
                }
                
                /* Hide all the UI chrome */
                .print\\:hidden,
                nav,
                button,
                [class*="sidebar"],
                [class*="bg-gray-900"],
                [class*="border-b"] {
                  display: none !important;
                }
                
                /* Hide the left form panel */
                .space-y-6.lg\\:block {
                  display: none !important;
                }
                
                /* Hide main container overflow */
                .flex.h-screen.bg-gray-50,
                .flex-1.overflow-auto {
                  overflow: hidden !important;
                }
                
                /* Show and style only the invoice */
                .grid.grid-cols-1.lg\\:grid-cols-6 {
                  display: block !important;
                  grid-template-columns: 1fr !important;
                  overflow: hidden !important;
                }
                
                .lg\\:col-span-3.mx-auto.bg-white.shadow-lg {
                  display: block !important;
                  box-shadow: none !important;
                  max-width: 210mm !important;
                  width: 210mm !important;
                  margin: 0 !important;
                  padding: 0 !important;
                  overflow: hidden !important;
                }
                
                /* Avoid page breaks */
                .bg-white.rounded-lg {
                  page-break-inside: avoid;
                  break-inside: avoid;
                }
              }
            `}</style>
          </div>
           </>)}
        </div>
      </div>
    </div>
  );
};

export default HVACDashboard;
