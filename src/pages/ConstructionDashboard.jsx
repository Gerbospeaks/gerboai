import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { serverTimestamp } from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth";
import { db } from '../firebase';
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
import {
  ChevronDown,
  ChevronLeft,
  Home,
  Settings,
  Users,
  Calendar,
  FileText,
  DollarSign,
  FileBarChart,
  BarChart3,
  Menu,
  Plus,
  Send,
  LogOut,
  Edit,
  CheckSquare,
  HardHat,
  Building2,
  Hammer,
  ClipboardList,
} from "lucide-react";

const generateInvoiceNumber = async (userId) => {
  const db = getFirestore();
  const year = new Date().getFullYear();
  const invoicesRef = collection(db, "users", userId, "invoices");
  const q = query(invoicesRef, orderBy("createdAt", "desc"), limit(1));
  const snapshot = await getDocs(q);

  let lastNumber = 1000;

  if (!snapshot.empty) {
    const lastInvoice = snapshot.docs[0].data();
    const match = lastInvoice.invoiceNumber?.match(/(\d+)$/);
    if (match) {
      lastNumber = Number(match[1]);
    }
  }

  const nextNumber = lastNumber + 1;
  return `CONS-${year}-${String(nextNumber).padStart(4, "0")}`;
};

const ConstructionDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Invoice");
  const [showInvoice, setShowInvoice] = useState(false);
  const { user } = useAuth();
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceId, setInvoiceId] = useState(null);

  useEffect(() => {
    if (!user?.uid) return;

    const loadInvoiceNumber = async () => {
      const nextInvoice = await generateInvoiceNumber(user.uid);
      setInvoiceNumber(nextInvoice);
    };

    loadInvoiceNumber();
  }, [user]);

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

    setInvoiceNumber(savedInvoice.invoiceNumber);
    setItems(savedInvoice.items);
    setClientName(savedInvoice.client.name);
    setClientEmail(savedInvoice.client.email);
    setClientPhone(savedInvoice.client.phone);
    setClientAddress(savedInvoice.client.address);

    setTimeout(() => {
      window.print();
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
    setNewItem({ description: "", rate: "", qty: "" });
  };

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

  const [clientName, setClientName] = useState("Riverside Properties Ltd");
  const [clientId, setClientId] = useState("CL-2024-8821");
  const [clientEmail, setClientEmail] = useState("contracts@riverside-prop.co.uk");
  const [clientPhone, setClientPhone] = useState("0161 789 4532");
  const [clientAddress, setClientAddress] = useState(
    "Riverside Development, Salford Quays, M50 3AZ"
  );
  const [projectType, setProjectType] = useState("Commercial Renovation");

  const handlePrint = () => {
    window.print();
  };

  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({
    description: "",
    rate: "",
    qty: "",
  });

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const vat = subtotal * 0.2;
  const total = subtotal + vat;

  const buildInvoicePayload = (numberToUse) => ({
    invoiceNumber: numberToUse,
    locked: true,
    status: "pending",

    dates: {
      serviceDate: "28/12/2024",
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

    if (!invoiceId) {
      numberToUse = await generateInvoiceNumber(user.uid);
      setInvoiceNumber(numberToUse);
    }

    const invoiceData = buildInvoicePayload(numberToUse);

    if (invoiceId) {
      await updateDoc(
        doc(db, "users", user.uid, "invoices", invoiceId),
        {
          ...invoiceData,
          updatedAt: serverTimestamp(),
        }
      );
    } else {
      const ref = await addDoc(
        collection(db, "users", user.uid, "invoices"),
        invoiceData
      );
      setInvoiceId(ref.id);
    }

    alert("Invoice saved successfully");
  };

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100">
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
        } fixed lg:relative lg:translate-x-0 z-50 w-64 bg-gradient-to-b from-slate-800 to-slate-900 border-r border-slate-700 transition-transform duration-300 h-full print:hidden`}
      >
        <div className="p-4">
          <div className="flex items-center space-x-3 mb-8 bg-slate-700/50 p-3 rounded-lg">
            <Building2 className="w-8 h-8 text-amber-500" />
            <div>
              <div className="font-bold text-lg text-white">BuildPro</div>
              <div className="text-xs text-slate-400">Construction Management</div>
            </div>
          </div>

          <nav className="space-y-1">
            <div className="flex items-center space-x-3 px-3 py-2 text-slate-300 hover:bg-slate-700 rounded-lg cursor-pointer transition">
              <Home className="w-5 h-5" />
              <span>Dashboard</span>
            </div>

            <div className="pt-4 space-y-1">
              <div className="flex items-center space-x-3 px-3 py-2 text-slate-300 hover:bg-slate-700 rounded-lg cursor-pointer transition">
                <Calendar className="w-5 h-5" />
                <span>Project Schedule</span>
              </div>

              <div className="mt-2">
                <div className="flex items-center justify-between px-3 py-2 text-slate-300 hover:bg-slate-700 rounded-lg cursor-pointer transition">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5" />
                    <span>Invoicing</span>
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </div>

                <div className="ml-8 mt-1 space-y-1">
                  <div className="px-3 py-2 text-sm text-white bg-amber-600 rounded-lg cursor-pointer">
                    Invoices
                  </div>
                  <div className="px-3 py-2 text-sm text-slate-400 hover:bg-slate-700 rounded-lg cursor-pointer">
                    Clients
                  </div>
                  <div className="px-3 py-2 text-sm text-slate-400 hover:bg-slate-700 rounded-lg cursor-pointer">
                    Quotes
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 px-3 py-2 text-slate-300 hover:bg-slate-700 rounded-lg cursor-pointer mt-2 transition">
                <Users className="w-5 h-5" />
                <span>Client Management</span>
              </div>

              <div className="flex items-center space-x-3 px-3 py-2 text-slate-300 hover:bg-slate-700 rounded-lg cursor-pointer transition">
                <HardHat className="w-5 h-5" />
                <span>Crew & Workers</span>
              </div>

              <div className="flex items-center justify-between px-3 py-2 text-slate-300 hover:bg-slate-700 rounded-lg cursor-pointer transition">
                <div className="flex items-center space-x-3">
                  <Hammer className="w-5 h-5" />
                  <span>Materials</span>
                </div>
                <ChevronDown className="w-4 h-4" />
              </div>

              <div className="flex items-center justify-between px-3 py-2 text-slate-300 hover:bg-slate-700 rounded-lg cursor-pointer transition">
                <div className="flex items-center space-x-3">
                  <ClipboardList className="w-5 h-5" />
                  <span>Site Reports</span>
                </div>
                <ChevronDown className="w-4 h-4" />
              </div>

              <div className="flex items-center justify-between px-3 py-2 text-slate-300 hover:bg-slate-700 rounded-lg cursor-pointer transition">
                <div className="flex items-center space-x-3">
                  <DollarSign className="w-5 h-5" />
                  <span>Payments</span>
                </div>
                <ChevronDown className="w-4 h-4" />
              </div>

              <div className="flex items-center justify-between px-3 py-2 text-slate-300 hover:bg-slate-700 rounded-lg cursor-pointer transition">
                <div className="flex items-center space-x-3">
                  <FileBarChart className="w-5 h-5" />
                  <span>Reports</span>
                </div>
                <ChevronDown className="w-4 h-4" />
              </div>

              <div className="flex items-center space-x-3 px-3 py-2 text-slate-300 hover:bg-slate-700 rounded-lg cursor-pointer transition">
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </div>
            </div>
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700 bg-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold">
              {user?.name?.[0] || "U"}
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-white">
                {user?.name || "User"}
              </div>
              <div className="text-xs text-slate-400">
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
        <div className="bg-white border-b border-slate-200 px-4 lg:px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 lg:space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-slate-100 rounded-lg transition"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <FileText className="w-6 h-6 text-amber-600" />
                <h1 className="text-base lg:text-xl font-bold text-slate-800">
                  Invoice #{invoiceNumber || "New Invoice"}
                </h1>
              </div>
            </div>

            <div className="hidden lg:flex items-center space-x-3 print:hidden">
              <button
                onClick={handleSaveInvoice}
                className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition font-medium"
              >
                <CheckSquare className="w-4 h-4" />
                Save Invoice
              </button>

              <button
                onClick={handleSavePDF}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition"
              >
                <Download className="w-4 h-4" />
                Save as PDF
              </button>

              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Log Out
              </button>
            </div>

            <button
              onClick={handleLogout}
              className="lg:hidden p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition print:hidden"
            >
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>

        {/* Mobile Action Buttons */}
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 print:hidden">
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={handleSaveInvoice}
              className="flex items-center gap-2 px-3 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 whitespace-nowrap text-sm"
            >
              <CheckSquare className="w-4 h-4" />
              Save
            </button>
            <button
              onClick={handleSavePDF}
              className="flex items-center gap-2 px-3 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 whitespace-nowrap text-sm"
            >
              <Download className="w-4 h-4" />
              PDF
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-3 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 whitespace-nowrap text-sm"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-slate-200 px-4 lg:px-6 overflow-x-auto print:hidden">
          <div className="flex space-x-4 lg:space-x-8 min-w-max">
            {["Invoice", "History", "Notes"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 border-b-2 font-medium transition ${
                  activeTab === tab
                    ? "border-amber-600 text-amber-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
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
            className="lg:hidden w-full mb-4 flex items-center justify-center gap-2 px-4 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
          >
            <FileText className="w-5 h-5" />
            {showInvoice ? "Hide Invoice" : "View Invoice"}
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Panel - Form */}
            <div
              className={`${
                showInvoice ? "hidden" : "block"
              } lg:block space-y-6 print:hidden`}
            >
              {/* Status Card */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 rounded-lg px-4 py-3 shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse"></div>
                  <span className="text-amber-700 font-semibold">Pending Payment</span>
                  <span className="text-amber-600">Due in 21 days</span>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                  <div className="text-sm text-slate-500 mb-1">Total Amount</div>
                  <div className="text-2xl font-bold text-amber-600">
                    R{total.toFixed(2)}
                  </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                  <div className="text-sm text-slate-500 mb-1">Paid</div>
                  <div className="text-2xl font-bold text-green-600">R0.00</div>
                </div>
                <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                  <div className="text-sm text-slate-500 mb-1">Balance Due</div>
                  <div className="text-2xl font-bold text-slate-800">
                    R{total.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Client Information */}
              <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-amber-600" />
                    Client Information
                  </h2>
                  <button className="flex items-center gap-2 text-amber-600 hover:text-amber-700 font-medium">
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-slate-600 font-medium">Client Name</label>
                    <input
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg mt-1 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-600 font-medium">Client ID</label>
                    <input
                      type="text"
                      value={clientId}
                      onChange={(e) => setClientId(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg mt-1 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-600 font-medium">Email</label>
                    <input
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg mt-1 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-600 font-medium">Phone</label>
                    <input
                      type="tel"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg mt-1 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm text-slate-600 font-medium">Project Address</label>
                    <input
                      type="text"
                      value={clientAddress}
                      onChange={(e) => setClientAddress(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg mt-1 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-600 font-medium">Project Type</label>
                    <input
                      type="text"
                      value={projectType}
                      onChange={(e) => setProjectType(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg mt-1 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-600 font-medium">Property Type</label>
                    <div className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg mt-1 text-slate-700">
                      Commercial
                    </div>
                  </div>
                </div>
              </div>

              {/* Add Items */}
              <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Hammer className="w-5 h-5 text-amber-600" />
                  Add Line Item
                </h2>

                <div className="grid grid-cols-4 gap-3">
                  <input
                    type="text"
                    placeholder="Description"
                    value={newItem.description}
                    onChange={(e) =>
                      setNewItem({ ...newItem, description: e.target.value })
                    }
                    className="col-span-4 md:col-span-2 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                  <input
                    type="number"
                    placeholder="Rate (R)"
                    value={newItem.rate}
                    onChange={(e) =>
                      setNewItem({ ...newItem, rate: e.target.value })
                    }
                    className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                  <input
                    type="number"
                    placeholder="Qty"
                    value={newItem.qty}
                    onChange={(e) =>
                      setNewItem({ ...newItem, qty: e.target.value })
                    }
                    className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleAddItem}
                    className="col-span-4 md:col-span-4 bg-amber-600 text-white rounded-lg px-4 py-2 hover:bg-amber-700 flex items-center justify-center gap-2 font-medium transition"
                  >
                    <Plus className="w-4 h-4" />
                    Add Item
                  </button>
                </div>
              </div>

              {/* Project Details */}
              <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-amber-600" />
                  Project Details
                </h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-600 font-medium">Project Manager:</span>
                    <span className="text-slate-800">Michael Roberts</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-600 font-medium">Site Foreman:</span>
                    <span className="text-slate-800">David Thompson</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-600 font-medium">Start Date:</span>
                    <span className="text-slate-800">15/11/2024</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-600 font-medium">Completion Date:</span>
                    <span className="text-slate-800">28/12/2024</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel - Invoice Preview */}
            <div
              className={`${
                !showInvoice ? "hidden" : "block"
              } lg:block bg-white shadow-xl rounded-lg overflow-hidden`}
              style={{
                maxWidth: "210mm",
                minHeight: "297mm",
              }}
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-8">
                  {/* Company Logo & Info */}
                  <div className="flex flex-col">
                    <div className="w-24 h-24 mb-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                      <Building2 className="w-12 h-12 text-white" />
                    </div>
                    <div className="text-xs">
                      <div className="font-bold text-lg mb-2 text-slate-800">
                        BuildPro Construction Ltd
                      </div>
                      <div className="text-slate-600">Unit 12, Trafford Industrial Estate</div>
                      <div className="text-slate-600">Manchester, M17 8WB</div>
                      <div className="text-slate-600">Tel: 0161 234 5678</div>
                      <div className="text-slate-600">Email: invoices@buildpro.co.uk</div>
                    </div>
                  </div>

                  {/* Invoice Details */}
                  <div className="text-right">
                    <div className="text-2xl font-bold text-slate-800 mb-2">
                      INVOICE
                    </div>
                    <div className="text-sm space-y-1">
                      <div className="font-semibold text-slate-700">
                        Invoice No: {invoiceNumber}
                      </div>
                      <div className="text-slate-600">
                        Project Date: 28/12/2024
                      </div>
                      <div className="text-slate-600">
                        Date Issued: {new Date().toLocaleDateString("en-GB")}
                      </div>
                      <div className="text-slate-600">
                        Due Date:{" "}
                        {(() => {
                          const dueDate = new Date();
                          dueDate.setDate(dueDate.getDate() + 21);
                          return dueDate.toLocaleDateString("en-GB");
                        })()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bill To & Project Info */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <div className="text-amber-600 font-bold mb-2 text-sm">
                      BILL TO
                    </div>
                    <div className="text-sm">
                      <div className="font-bold text-slate-800">{clientName}</div>
                      <div className="text-slate-600">{clientAddress}</div>
                      <div className="text-slate-600 mt-1">{clientPhone}</div>
                      <div className="text-slate-600">{clientEmail}</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-amber-600 font-bold mb-2 text-sm">
                      PROJECT LOCATION
                    </div>
                    <div className="text-sm">
                      <div className="text-slate-600">{clientAddress}</div>
                      <div className="text-slate-600 mt-2">
                        Client ID: {clientId}
                      </div>
                      <div className="text-slate-600">
                        Type: {projectType}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Project Summary */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="text-xs font-semibold text-slate-700 mb-2">
                      Project Management
                    </div>
                    <div className="text-xs text-slate-600 space-y-1">
                      <div>Project Manager: Michael Roberts</div>
                      <div>Site Foreman: David Thompson</div>
                      <div>License: CSCS-UK-45789</div>
                    </div>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-4">
                    <div className="text-xs font-semibold text-slate-700 mb-2">
                      Project Timeline
                    </div>
                    <div className="text-xs text-slate-600 space-y-1">
                      <div>Start: 15/11/2024</div>
                      <div>Completion: 28/12/2024</div>
                      <div>Duration: 6 weeks</div>
                    </div>
                  </div>
                </div>

                {/* Line Items */}
                <div className="mb-6">
                  <div className="text-sm font-bold mb-3 text-slate-800">
                    WORK COMPLETED & MATERIALS
                  </div>
                  
                  {/* Table Header */}
                  <div className="grid grid-cols-12 gap-2 bg-slate-100 px-4 py-3 rounded-t-lg text-xs font-semibold text-slate-700">
                    <div className="col-span-6">Description</div>
                    <div className="col-span-2 text-center">Rate</div>
                    <div className="col-span-2 text-center">Qty</div>
                    <div className="col-span-2 text-right">Amount</div>
                  </div>

                  {/* Table Body */}
                  <div className="border border-slate-200 rounded-b-lg">
                    {items.length > 0 ? (
                      items.map((item, index) => (
                        <div
                          key={index}
                          className="grid grid-cols-12 gap-2 px-4 py-3 text-xs text-slate-700 border-b border-slate-100 last:border-b-0"
                        >
                          <div className="col-span-6">{item.description}</div>
                          <div className="col-span-2 text-center">
                            R{item.rate.toFixed(2)}
                          </div>
                          <div className="col-span-2 text-center">{item.qty}</div>
                          <div className="col-span-2 text-right font-semibold">
                            R{item.amount.toFixed(2)}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-8 text-center text-slate-400 text-sm">
                        No items added yet
                      </div>
                    )}
                  </div>
                </div>

                {/* Totals */}
                <div className="border-t-2 border-slate-200 pt-4 space-y-2 text-sm">
                  <div className="flex justify-between text-slate-700">
                    <span>Subtotal:</span>
                    <span>R{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>VAT (20%):</span>
                    <span>R{vat.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t-2 border-slate-300 pt-2 text-slate-800">
                    <span>TOTAL:</span>
                    <span>R{total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 pt-2 border-t border-slate-200">
                    <span>Amount Paid:</span>
                    <span>R0.00</span>
                  </div>
                  <div className="flex justify-between font-bold text-amber-600 border-t-2 border-amber-200 pt-2">
                    <span>AMOUNT DUE:</span>
                    <span>R{total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Payment Information */}
                <div className="mt-8 pt-6 border-t border-slate-200">
                  <div className="text-sm font-bold mb-3 text-amber-600">
                    PAYMENT INFORMATION
                  </div>
                  <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="font-semibold">Bank:</span> NatWest Bank PLC
                      </div>
                      <div>
                        <span className="font-semibold">Account Name:</span> BuildPro Construction Ltd
                      </div>
                      <div>
                        <span className="font-semibold">Sort Code:</span> 60-00-00
                      </div>
                      <div>
                        <span className="font-semibold">Account No:</span> 12345678
                      </div>
                      <div className="col-span-2">
                        <span className="font-semibold">IBAN:</span> GB29 NWBK 6000 0012 3456 78
                      </div>
                      <div className="col-span-2 mt-2 pt-2 border-t border-slate-200">
                        <span className="font-semibold">Payment Terms:</span> Net 21 days from invoice date
                      </div>
                    </div>
                  </div>
                </div>

                {/* Terms & Conditions */}
                <div className="mt-6 pt-4 border-t border-slate-200">
                  <div className="text-xs font-semibold text-slate-700 mb-2">
                    TERMS & CONDITIONS
                  </div>
                  <div className="text-xs text-slate-600 space-y-1">
                    <p>• Payment is due within 21 days of invoice date</p>
                    <p>• Late payments may incur a 5% monthly interest charge</p>
                    <p>• All work completed to British Standards and Building Regulations</p>
                    <p>• 12-month warranty on workmanship from completion date</p>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-6 pt-6 border-t border-slate-200 text-xs text-slate-500 text-center space-y-1">
                  <div className="flex justify-center gap-6">
                    <div>Company Reg: 09876543</div>
                    <div>VAT Reg: GB 987 6543 21</div>
                  </div>
                  <div className="mt-3 text-slate-400 italic">
                    Thank you for choosing BuildPro Construction
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
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
            width: 210mm;
            height: 297mm;
          }
          
          @page {
            size: A4;
            margin: 0;
          }
          
          /* Hide all UI elements */
          .print\\:hidden {
            display: none !important;
          }
          
          /* Hide the sidebar */
          .bg-gradient-to-b.from-slate-800 {
            display: none !important;
          }
          
          /* Hide the left form panel */
          .space-y-6 {
            display: none !important;
          }
          
          /* Make the main container take full width */
          .grid.grid-cols-1.lg\\:grid-cols-2 {
            display: block !important;
          }
          
          /* Show only the invoice and remove extra styling */
          .bg-white.shadow-xl.rounded-lg {
            display: block !important;
            box-shadow: none !important;
            max-width: 210mm !important;
            width: 210mm !important;
            margin: 0 !important;
            border-radius: 0 !important;
            overflow: visible !important;
          }
          
          /* Ensure invoice content is visible */
          .lg\\:block.bg-white.shadow-xl {
            display: block !important;
          }
          
          /* Avoid page breaks inside important sections */
          .bg-slate-50.rounded-lg,
          .bg-amber-50.rounded-lg {
            page-break-inside: avoid;
            break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
};

export default ConstructionDashboard;