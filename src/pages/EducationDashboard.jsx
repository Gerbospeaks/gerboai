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
  Edit,
  CheckSquare,
  Wrench,
  ClipboardList,
  Zap,
  LogOut,
  Lightbulb,
  Plug,
  Battery,
} from "lucide-react";

const generateInvoiceNumber = async (userId) => {
  const db = getFirestore();
  const year = new Date().getFullYear();

  const invoicesRef = collection(db, "users", userId, "invoices");
  const q = query(invoicesRef, orderBy("createdAt", "desc"), limit(1));
  const snapshot = await getDocs(q);

  let lastNumber = 1200;

  if (!snapshot.empty) {
    const lastInvoice = snapshot.docs[0].data();
    const match = lastInvoice.invoiceNumber?.match(/(\d+)$/);
    if (match) {
      lastNumber = Number(match[1]);
    }
  }

  const nextNumber = lastNumber + 1;
  return `ELEC-${year}-${String(nextNumber).padStart(4, "0")}`;
};

const ElectricalDashboard = () => {
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

  const [clientName, setClientName] = useState("Robert Thompson");
  const [clientId, setClientId] = useState("C-2024-8923");
  const [clientEmail, setClientEmail] = useState("robert.thompson@example.com");
  const [clientPhone, setClientPhone] = useState("0161 789 4567");
  const [clientAddress, setClientAddress] = useState(
    "156 Oxford Road, Manchester, M1 7ED"
  );
  const [serviceType, setServiceType] = useState("Electrical Installation & Testing");

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
    locked: true,
    status: "pending",

    dates: {
      serviceDate: "29/12/2024",
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
      await updateDoc(doc(db, "users", user.uid, "invoices", invoiceId), {
        ...invoiceData,
        updatedAt: serverTimestamp(),
      });
    } else {
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
    <div className="flex h-screen bg-gradient-to-br from-blue-50 to-slate-100">
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
        } fixed lg:relative lg:translate-x-0 z-50 w-64 bg-gradient-to-b from-slate-900 to-slate-800 border-r border-slate-700 transition-transform duration-300 h-full print:hidden`}
      >
        <div className="p-4">
          <div className="flex items-center space-x-2 mb-8 bg-blue-600 rounded-lg p-3">
            <Zap className="w-8 h-8 text-yellow-400" />
            <span className="font-bold text-lg text-white">
              BrightSpark Pro
            </span>
          </div>

          <nav className="space-y-1">
            <div className="flex items-center space-x-3 px-3 py-2 text-slate-300 hover:bg-slate-700 rounded-lg cursor-pointer transition-colors">
              <Home className="w-5 h-5" />
              <span>Dashboard</span>
            </div>
            <div className="flex items-center space-x-3 px-3 py-2 text-slate-300 hover:bg-slate-700 rounded-lg cursor-pointer transition-colors">
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </div>

            <div className="pt-4">
              <div className="flex items-center space-x-3 px-3 py-2 text-slate-300 hover:bg-slate-700 rounded-lg cursor-pointer transition-colors">
                <Calendar className="w-5 h-5" />
                <span>Job Schedule</span>
              </div>

              <div className="mt-2">
                <div className="flex items-center justify-between px-3 py-2 text-slate-300 hover:bg-slate-700 rounded-lg cursor-pointer transition-colors">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5" />
                    <span>Billing</span>
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </div>

                <div className="ml-8 mt-1 space-y-1">
                  <div className="px-3 py-2 text-sm text-white bg-blue-600 rounded-lg cursor-pointer">
                    Invoices
                  </div>
                  <div className="px-3 py-2 text-sm text-slate-400 hover:bg-slate-700 rounded-lg cursor-pointer transition-colors">
                    Clients
                  </div>
                  <div className="px-3 py-2 text-sm text-slate-400 hover:bg-slate-700 rounded-lg cursor-pointer transition-colors">
                    Quotes
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 px-3 py-2 text-slate-300 hover:bg-slate-700 rounded-lg cursor-pointer mt-2 transition-colors">
                <Users className="w-5 h-5" />
                <span>Client Database</span>
              </div>

              <div className="flex items-center space-x-3 px-3 py-2 text-slate-300 hover:bg-slate-700 rounded-lg cursor-pointer transition-colors">
                <Wrench className="w-5 h-5" />
                <span>Electricians</span>
              </div>

              <div className="flex items-center justify-between px-3 py-2 text-slate-300 hover:bg-slate-700 rounded-lg cursor-pointer transition-colors">
                <div className="flex items-center space-x-3">
                  <Battery className="w-5 h-5" />
                  <span>Equipment</span>
                </div>
                <ChevronDown className="w-4 h-4" />
              </div>

              <div className="flex items-center justify-between px-3 py-2 text-slate-300 hover:bg-slate-700 rounded-lg cursor-pointer transition-colors">
                <div className="flex items-center space-x-3">
                  <ClipboardList className="w-5 h-5" />
                  <span>Inspections</span>
                </div>
                <ChevronDown className="w-4 h-4" />
              </div>

              <div className="flex items-center justify-between px-3 py-2 text-slate-300 hover:bg-slate-700 rounded-lg cursor-pointer transition-colors">
                <div className="flex items-center space-x-3">
                  <DollarSign className="w-5 h-5" />
                  <span>Payments</span>
                </div>
                <ChevronDown className="w-4 h-4" />
              </div>

              <div className="flex items-center justify-between px-3 py-2 text-slate-300 hover:bg-slate-700 rounded-lg cursor-pointer transition-colors">
                <div className="flex items-center space-x-3">
                  <FileBarChart className="w-5 h-5" />
                  <span>Reports</span>
                </div>
                <ChevronDown className="w-4 h-4" />
              </div>

              <div className="flex items-center justify-between px-3 py-2 text-slate-300 hover:bg-slate-700 rounded-lg cursor-pointer transition-colors">
                <div className="flex items-center space-x-3">
                  <BarChart3 className="w-5 h-5" />
                  <span>Analytics</span>
                </div>
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700 bg-slate-900">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
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
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              <ChevronLeft className="hidden lg:block w-5 h-5 text-slate-400" />
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-600" />
                <h1 className="text-base lg:text-xl font-semibold">
                  Invoice #{invoiceNumber || "— not saved yet —"}
                </h1>
              </div>
            </div>

            <div className="hidden lg:flex items-center space-x-3 print:hidden">
              <button className="flex items-center space-x-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
                <CheckSquare className="w-4 h-4" />
                <span>Mark as Paid</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </button>
              <button
                onClick={handleSaveInvoice}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Invoice
              </button>

              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Send className="w-4 h-4" />
                <span>Send</span>
              </button>
              <button
                onClick={handleSavePDF}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save as PDF
              </button>

              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
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

        {/* Mobile Action Buttons Bar */}
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 print:hidden">
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button className="flex items-center gap-2 px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 whitespace-nowrap text-sm">
              <CheckSquare className="w-4 h-4" />
              <span>Mark as Paid</span>
            </button>
            <button className="flex items-center gap-2 px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 whitespace-nowrap text-sm">
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </button>
            <button className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 whitespace-nowrap text-sm">
              <Send className="w-4 h-4" />
              <span>Send</span>
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap text-sm"
            >
              <Download className="w-4 h-4" />
              <span>Save PDF</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-3 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors whitespace-nowrap text-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>
          </div>
        </div>

        <div className="bg-slate-900 border-b border-slate-700 px-4 lg:px-6 overflow-x-auto print:hidden">
          <div className="flex space-x-4 lg:space-x-8 min-w-max">
            {["Invoice", "History", "Notes"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 border-b-2 transition-colors ${
                  activeTab === tab
                    ? "border-blue-500 text-white"
                    : "border-transparent text-slate-400 hover:text-slate-300"
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
            className="lg:hidden w-full mb-4 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FileText className="w-5 h-5" />
            {showInvoice ? "Hide Invoice" : "View Invoice"}
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
            <div
              className={`${
                showInvoice ? "hidden" : "block"
              } lg:col-span-3 space-y-6 lg:block print:hidden`}
            >
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-500 rounded-lg px-4 py-3 flex items-center space-x-3 shadow-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-blue-700 font-medium">Pending</span>
                <span className="text-blue-600">
                  Payment due within 30 days
                </span>
              </div>

              {/* Stats Cards - Redesigned Layout */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
                  <div className="text-sm opacity-90 mb-1">Total Amount</div>
                  <div className="text-3xl font-bold">£2,340.00</div>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white shadow-lg">
                  <div className="text-sm opacity-90 mb-1">Paid</div>
                  <div className="text-3xl font-bold">£0.00</div>
                </div>
                <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-4 text-white shadow-lg">
                  <div className="text-sm opacity-90 mb-1">Balance Due</div>
                  <div className="text-3xl font-bold">£2,340.00</div>
                </div>
              </div>

              {/* Date Information - Different Layout */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Date Information
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-slate-600">Service Date</span>
                    <span className="font-semibold">29/12/2024</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-slate-600">Invoice Date</span>
                    <span className="font-semibold">30/12/2024</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-600">Due Date</span>
                    <span className="font-semibold text-blue-600">20/01/2025</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center space-x-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    <span>Client Information</span>
                  </h2>
                  <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700">
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-slate-500">Client Name</div>
                    <input
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">Client ID</div>
                    <input
                      type="text"
                      value={clientId}
                      onChange={(e) => setClientId(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">Email</div>
                    <input
                      type="text"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">Phone</div>
                    <input
                      type="text"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="col-span-1 sm:col-span-2">
                    <div className="text-sm text-slate-500">Service Address</div>
                    <input
                      type="text"
                      value={clientAddress}
                      onChange={(e) => setClientAddress(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">Property Type</div>
                    <div className="font-medium">Commercial</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">Service Type</div>
                    <input
                      type="text"
                      value={serviceType}
                      onChange={(e) => setServiceType(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-6 mb-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-blue-600" />
                  Add Service / Item
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <input
                    type="text"
                    placeholder="Description"
                    value={newItem.description}
                    onChange={(e) =>
                      setNewItem({ ...newItem, description: e.target.value })
                    }
                    className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />

                  <input
                    type="number"
                    placeholder="Rate"
                    value={newItem.rate}
                    onChange={(e) =>
                      setNewItem({ ...newItem, rate: e.target.value })
                    }
                    className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />

                  <input
                    type="number"
                    placeholder="Qty"
                    value={newItem.qty}
                    onChange={(e) =>
                      setNewItem({ ...newItem, qty: e.target.value })
                    }
                    className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />

                  <button
                    onClick={handleAddItem}
                    className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                    Payments
                  </h2>
                  <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700">
                    <Plus className="w-4 h-4" />
                    <span>Add</span>
                  </button>
                </div>

                <div className="text-center text-slate-400 py-8">
                  <p>No payments recorded yet</p>
                  <p className="text-sm mt-2">Payment due by 20 January 2025</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center space-x-2">
                    <Lightbulb className="w-5 h-5 text-amber-600" />
                    <span>Equipment Details</span>
                  </h2>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-amber-200">
                    <span className="text-slate-600">System Type:</span>
                    <span className="font-medium">
                      Consumer Unit (Fuse Box)
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-amber-200">
                    <span className="text-slate-600">Brand:</span>
                    <span className="font-medium">Schneider Electric</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-amber-200">
                    <span className="text-slate-600">Model:</span>
                    <span className="font-medium">EasyPact CVS250</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-600">Installation Date:</span>
                    <span className="font-medium">10/08/2021</span>
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
                <div className="bg-white rounded-lg p-4 lg:p-6 shadow-sm">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex flex-col items-start">
                      <div className="w-20 h-20 mb-2 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Zap className="w-12 h-12 text-yellow-400" />
                      </div>

                      <div className="text-xs">
                        <div className="font-semibold mb-1 text-blue-900">
                          BrightSpark Electrical Ltd
                        </div>
                        <div className="text-slate-600">78 Portland Street</div>
                        <div className="text-slate-600">Manchester, M1 4GU</div>
                        <div className="text-slate-600">Tel: 0161 456 7890</div>
                        <div className="text-slate-600">
                          Email: info@brightspark.co.uk
                        </div>
                      </div>
                    </div>

                    <div className="text-right text-xs">
                      <div className="text-sm font-semibold mb-1 text-blue-900">
                        ELECTRICAL SERVICE INVOICE
                      </div>
                      <div>Invoice No: {invoiceNumber}</div>
                      <div className="text-slate-500">
                        Service Date: 29/12/2024
                      </div>
                      <div className="text-slate-500">
                        Date Issued: {new Date().toLocaleDateString("en-GB")}
                      </div>
                      <div className="text-slate-500">
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
                      <div className="text-blue-600 font-medium mb-1">
                        Bill To
                      </div>
                      <div className="font-semibold">{clientName}</div>
                      <div className="text-slate-600">{clientAddress}</div>
                      <div className="text-slate-600">{clientPhone}</div>
                      <div className="text-slate-600">{clientEmail}</div>
                    </div>
                    <div>
                      <div className="text-blue-600 font-medium mb-1">
                        Service Location
                      </div>
                      <div className="text-slate-600">{clientAddress}</div>
                      <div className="text-slate-600 mt-2">
                        Client ID: {clientId}
                      </div>
                      <div className="text-slate-600">Property: Commercial</div>
                    </div>
                  </div>

                  <div className="flex gap-4 mb-4">
                    <div className="bg-blue-50 rounded p-3 text-xs flex-1">
                      <div className="font-medium mb-1 text-blue-900">
                        Electrician Details
                      </div>
                      <div className="text-slate-600">
                        Michael Davies - Cert. Electrician
                      </div>
                      <div className="text-slate-600">License: ECS-UK-67234</div>
                      <div className="text-slate-600">
                        Service Time: 08:30 - 17:00 (8.5 hours)
                      </div>
                    </div>

                    <div className="bg-amber-50 rounded p-3 text-xs flex-1">
                      <div className="font-medium mb-1 text-amber-900">
                        Equipment Information
                      </div>
                      <div className="text-slate-600">
                        System: Consumer Unit
                      </div>
                      <div className="text-slate-600">
                        Brand: Schneider • Model: EasyPact CVS250
                      </div>
                      <div className="text-slate-600">Serial: SE2021-6734-ABC</div>
                    </div>
                  </div>

                  <div className="text-xs mb-4">
                    <div className="font-medium mb-2">Services & Materials</div>
                    <div className="grid grid-cols-6 gap-2 font-medium mb-2 pb-2 border-b">
                      <div className="col-span-3">Description</div>
                      <div className="text-center">Rate</div>
                      <div className="text-right">Qty</div>
                      <div className="text-right">Amount</div>
                    </div>

                    {items.map((item, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-6 gap-2 mb-2 text-slate-700"
                      >
                        <div className="col-span-3">{item.description}</div>
                        <div className="text-center text-xs">
                          {item.rate ? `£${item.rate}/hr` : "-"}
                        </div>
                        <div className="text-right">{item.qty}</div>
                        <div className="text-right">
                          £{item.amount.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-3 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>£2,340.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>VAT (20%):</span>
                      <span>£0.00</span>
                    </div>
                    <div className="flex justify-between font-semibold border-t pt-2">
                      <span>Total:</span>
                      <span>£2,340.00</span>
                    </div>
                    <div className="flex justify-between text-slate-600 pt-2 border-t">
                      <span>Amount Paid:</span>
                      <span>£0.00</span>
                    </div>
                    <div className="flex justify-between font-semibold text-blue-600 border-t pt-2 text-sm">
                      <span>Amount Due:</span>
                      <span>£2,340.00</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t">
                    <div className="text-xs font-medium mb-2 text-blue-600">
                      Payment Information
                    </div>
                    <div className="text-xs text-slate-600 space-y-1">
                      <div>Bank: NatWest Bank PLC</div>
                      <div>Account: BrightSpark Electrical Ltd</div>
                      <div>Sort Code: 60-40-05</div>
                      <div>Account No: 12345678</div>
                      <div>IBAN: GB29 NWBK 6040 0512 3456 78</div>
                      <div className="mt-2">Payment Terms: Net 30 days</div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t text-xs text-slate-500 space-y-1">
                    <div>Company Reg: 98765432</div>
                    <div>VAT Reg: GB 987 6543 21</div>
                    <div>NICEIC Approved Contractor</div>
                    <div className="text-center mt-3 italic text-blue-600">
                      Thank you for choosing BrightSpark Electrical
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
                
                .print\\:hidden,
                nav,
                button,
                [class*="sidebar"],
                [class*="bg-slate-900"],
                [class*="border-b"] {
                  display: none !important;
                }
                
                .space-y-6.lg\\:block {
                  display: none !important;
                }
                
                .flex.h-screen,
                .flex-1.overflow-auto {
                  overflow: hidden !important;
                }
                
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
                
                .bg-white.rounded-lg {
                  page-break-inside: avoid;
                  break-inside: avoid;
                }
              }
            `}</style>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElectricalDashboard;
                