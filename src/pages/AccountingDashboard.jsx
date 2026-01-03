
import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { serverTimestamp } from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth";
import {
  getFirestore,
  collection,
  query,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  setDoc,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Printer, Download } from "lucide-react";
import { db } from "../firebase";
import CustomerModal from './CustomerModal';
import CustomersListModal from './CustomersListModal';
import {
  ChevronDown,
  ChevronLeft,
  Home,
  Settings,
  Users,
  Calendar,
  FileText,
  Calculator,
  FileBarChart,
  BarChart3,
  Menu,
  Plus,
  Send,
  Edit,
  LogOut,
  CheckSquare,
  TrendingUp,
  CreditCard,
  Receipt,
  //Wallet,
 // PieChart,
  DollarSign,
 // ClipboardList,
  //Package,
  Briefcase,
  Upload,
  BookOpen,
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
  return `INV-${year}-${String(nextNumber).padStart(4, "0")}`;
};

const AccountingDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Invoice");
  const [showInvoice, setShowInvoice] = useState(false);
  const { user } = useAuth();
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceId, setInvoiceId] = useState(null);
  const [savedInvoices, setSavedInvoices] = useState([]);
  const [showInvoicesList, setShowInvoicesList] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [savedCustomers, setSavedCustomers] = useState([]);
  const [showCustomersListModal, setShowCustomersListModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    if (!user?.uid) return;

    const loadInvoiceNumber = async () => {
      const nextInvoice = await generateInvoiceNumber(user.uid);
      setInvoiceNumber(nextInvoice);
    };

    loadInvoiceNumber();
    loadSavedInvoices();
  }, [user]);

  const loadCustomers = async () => {
    try {
      const q = query(collection(db, "users", user.uid, "clients"), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const customersData = [];
      
      querySnapshot.forEach((doc) => {
        customersData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setCustomers(customersData);
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  };

  const loadSavedInvoices = async () => {
    if (!user?.uid) return;

    const db = getFirestore();
    const invoicesRef = collection(db, "users", user.uid, "invoices");
    const q = query(invoicesRef, orderBy("createdAt", "desc"), limit(50));
    const snapshot = await getDocs(q);

    const invoices = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setSavedInvoices(invoices);
  };

  const handleAddNewCustomer = () => {
    setSelectedCustomer(null);
    setShowCustomerModal(true);
  };

  const handleEditCustomer = (customer) => {
    setSelectedCustomer(customer);
    setShowCustomerModal(true);
  };

  const loadCustomer = (customer) => {
    setCustomerName(customer.name || "");
    setCustomerEmail(customer.email || "");
    setCustomerPhone(customer.phone || "");
    setCustomerAddress(customer.address || "");
    setCustomerId(customer.customerId || "");
  };

  const handleCustomerSaved = () => {
    loadCustomers();
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadInvoice = (invoice) => {
    setInvoiceId(invoice.id);
    setInvoiceNumber(invoice.invoiceNumber || "");
    setCustomerName(invoice.customer?.name || "");
    setCustomerEmail(invoice.customer?.email || "");
    setCustomerPhone(invoice.customer?.phone || "");
    setCustomerAddress(invoice.customer?.address || "");
    setCustomerId(invoice.customer?.customerId || "");
    setInvoiceDate(invoice.dates?.invoiceDate || new Date().toISOString().split('T')[0]);
    setDueDate(invoice.dates?.dueDate || "");
    setPaymentTerms(invoice.payment?.terms || "Net 30");
    setItems(invoice.items || []);
    setShowInvoicesList(false);
  };

  const loadSavedCustomers = async () => {
    if (!user?.uid) return;

    const db = getFirestore();
    const customersRef = collection(db, "users", user.uid, "clients");
    const q = query(customersRef, orderBy("createdAt", "desc"), limit(50));
    const snapshot = await getDocs(q);

    const customers = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setSavedCustomers(customers.filter(c => !c._placeholder));
  };

  const handleSaveCustomer = async () => {
    if (!user?.uid) return;
    
    if (!customerName || !customerEmail) {
      alert("Please enter customer name and email");
      return;
    }

    try {
      const db = getFirestore();
      const customerData = {
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
        address: customerAddress,
        customerId: customerId || `CUST-${Date.now()}`,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await addDoc(collection(db, "users", user.uid, "clients"), customerData);
      alert("Customer saved successfully!");
      loadSavedCustomers();
    } catch (error) {
      console.error("Error saving customer:", error);
      alert("Failed to save customer");
    }
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

    setInvoiceNumber(savedInvoice.invoiceNumber);
    setItems(savedInvoice.items);
    setCustomerName(savedInvoice.customer.name);
    setCustomerEmail(savedInvoice.customer.email);
    setCustomerPhone(savedInvoice.customer.phone);
    setCustomerAddress(savedInvoice.customer.address);
    setInvoiceDate(savedInvoice.dates.invoiceDate);
    setDueDate(savedInvoice.dates.dueDate);

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
      type: newItem.type || "Service",
      rate,
      qty,
      amount: rate * qty,
    };

    setItems((prev) => [...prev, item]);
    setNewItem({ description: "", rate: "", qty: "", type: "Service" });
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

  const [customerName, setCustomerName] = useState("Acme Corporation");
  const [customerId, setCustomerId] = useState("CUST-2024-5678");
  const [customerEmail, setCustomerEmail] = useState("accounts@acmecorp.com");
  const [customerPhone, setCustomerPhone] = useState("011 234 5678");
  const [customerAddress, setCustomerAddress] = useState(
    "456 Business Park, Sandton, 2196"
  );
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("Net 30");

  const [businessInfo, setBusinessInfo] = useState({
    businessName: "PRECISION ACCOUNTING SERVICES",
    addressLine1: "123 Finance Street",
    addressLine2: "Rosebank",
    city: "Johannesburg",
    postalCode: "2196",
    primaryPhone: "011 789 0123",
    secondaryPhone: "082 456 7890",
    logoUrl: "",
    taxNumber: "VAT-9012345678",
    registrationNumber: "2024/123456/07",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.uid) {
      loadBusinessInfo();
    }
  }, [user]);

  useEffect(() => {
    const fetchBusinessInfo = async () => {
      if (!user?.uid) return;

      try {
        const db = getFirestore();
        const docRef = doc(db, "users", user.uid, "settings", "businessInfo");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setBusinessInfo(docSnap.data());
        } else {
          console.log("No business info found");
        }
      } catch (error) {
        console.error("Error fetching business info:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessInfo();
  }, [user]);

  const loadBusinessInfo = async () => {
    if (!user?.uid) return;

    try {
      const db = getFirestore();
      const docRef = doc(db, "users", user.uid, "settings", "businessInfo");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setBusinessInfo(docSnap.data());
      }
    } catch (error) {
      console.error("Error loading business info:", error);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user?.uid) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    try {
      const storage = getStorage();
      const storageRef = ref(storage, `users/${user.uid}/logo/${file.name}`);

      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      setBusinessInfo({ ...businessInfo, logoUrl: downloadURL });
      alert("Logo uploaded successfully!");
    } catch (error) {
      console.error("Error uploading logo:", error);
      alert("Failed to upload logo");
    }
  };

  const handleSaveBusinessInfo = async () => {
    if (!user?.uid) return;

    try {
      const db = getFirestore();
      const docRef = doc(db, "users", user.uid, "settings", "businessInfo");
      await setDoc(docRef, businessInfo);
      alert("Business information saved successfully!");
      setShowSettings(false);
    } catch (error) {
      console.error("Error saving business info:", error);
      alert("Failed to save business information");
    }
  };

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
    type: "Service",
  });

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const vat = subtotal * 0.15;
  const total = subtotal + vat;

  const buildInvoicePayload = (numberToUse) => ({
    invoiceNumber: numberToUse,
    locked: true,
    status: "pending",

    dates: {
      invoiceDate: invoiceDate,
      dueDate: dueDate,
    },

    customer: {
      name: customerName,
      email: customerEmail,
      phone: customerPhone,
      address: customerAddress,
      customerId,
    },

    payment: {
      terms: paymentTerms,
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

    alert("Invoice saved successfully");
    loadSavedInvoices();
  };

  const handleNewInvoice = () => {
    setInvoiceId(null);
    setInvoiceNumber("");
    setCustomerName("Acme Corporation");
    setCustomerId("CUST-2024-5678");
    setCustomerEmail("accounts@acmecorp.com");
    setCustomerPhone("011 234 5678");
    setCustomerAddress("456 Business Park, Sandton, 2196");
    setInvoiceDate(new Date().toISOString().split('T')[0]);
    setDueDate("");
    setPaymentTerms("Net 30");
    setItems([]);

    const loadNewNumber = async () => {
      if (user?.uid) {
        const nextInvoice = await generateInvoiceNumber(user.uid);
        setInvoiceNumber(nextInvoice);
      }
    };
    loadNewNumber();
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
        } fixed lg:relative lg:translate-x-0 z-50 w-64 bg-slate-900 border-r border-gray-200 transition-transform duration-300 h-full print:hidden`}
      >
        <div className="p-4">
          <div className="flex items-center space-x-2 mb-8">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-lg text-white">
              Accounting Pro
            </span>
            <ChevronDown className="w-4 h-4 ml-auto text-gray-400" />
          </div>

          <nav className="space-y-1">
            <div className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-slate-800 rounded-lg cursor-pointer">
              <Home className="w-5 h-5" />
              <span>Dashboard</span>
            </div>
            <div
              onClick={() => setShowSettings(true)}
              className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-slate-800 rounded-lg cursor-pointer"
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </div>

            <div className="pt-4">
              <div className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-slate-800 rounded-lg cursor-pointer">
                <TrendingUp className="w-5 h-5" />
                <span>Financial Overview</span>
              </div>

              <div className="mt-2">
                <div className="flex items-center justify-between px-3 py-2 text-gray-300 hover:bg-slate-800 rounded-lg cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <Receipt className="w-5 h-5" />
                    <span>Invoices</span>
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </div>

                <div className="ml-8 mt-1 space-y-1">
                  <div
                    onClick={handleNewInvoice}
                    className="px-3 py-2 text-sm text-white bg-slate-800 rounded-lg cursor-pointer"
                  >
                    Create Invoice
                  </div>
                  <div
                    onClick={() => setShowInvoicesList(!showInvoicesList)}
                    className="px-3 py-2 text-sm text-gray-400 hover:bg-slate-800 rounded-lg cursor-pointer"
                  >
                    All Invoices ({savedInvoices.length})
                  </div>
                  <div className="px-3 py-2 text-sm text-gray-400 hover:bg-slate-800 rounded-lg cursor-pointer">
                    Overdue
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-slate-800 rounded-lg cursor-pointer mt-2">
                <Users className="w-5 h-5" />
                <span>Clients</span>
              </div>
              <div className="ml-8 mt-1 space-y-1">
                <div 
                  onClick={handleAddNewCustomer}
                  className="flex items-center space-x-3 px-3 py-2 text-gray-400 hover:bg-slate-800 rounded-lg cursor-pointer mt-2"
                >
                  <span>Add Client</span>
                </div>
                <div
                  onClick={() => setShowCustomersListModal(true)}
                  className="px-3 py-2 text-sm text-gray-400 hover:bg-slate-800 rounded-lg cursor-pointer"
                >
                  All Clients ({savedCustomers.length})
                </div>
              </div>

              <div className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-slate-800 rounded-lg cursor-pointer">
                <DollarSign className="w-5 h-5" />
                <span>Expenses</span>
              </div>

              <div className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-slate-800 rounded-lg cursor-pointer">
                <BookOpen className="w-5 h-5" />
                <span>General Ledger</span>
              </div>

              <div className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-slate-800 rounded-lg cursor-pointer">
                <Briefcase className="w-5 h-5" />
                <span>Assets</span>
              </div>

              <div className="flex items-center justify-between px-3 py-2 text-gray-300 hover:bg-slate-800 rounded-lg cursor-pointer">
                <div className="flex items-center space-x-3">
                  <CreditCard className="w-5 h-5" />
                  <span>Payments</span>
                </div>
                <ChevronDown className="w-4 h-4" />
              </div>

              <div className="flex items-center justify-between px-3 py-2 text-gray-300 hover:bg-slate-800 rounded-lg cursor-pointer">
                <div className="flex items-center space-x-3">
                  <FileBarChart className="w-5 h-5" />
                  <span>Reports</span>
                </div>
                <ChevronDown className="w-4 h-4" />
              </div>

              <div className="flex items-center justify-between px-3 py-2 text-gray-300 hover:bg-slate-800 rounded-lg cursor-pointer">
                <div className="flex items-center space-x-3">
                  <BarChart3 className="w-5 h-5" />
                  <span>Analytics</span>
                </div>
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700 bg-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full"></div>
            <div className="flex-1">
              <div className="text-sm font-medium text-white">
                {user?.name || "User"}
              </div>
              <div className="text-xs text-gray-400">
                {user?.email || "email@example.com"}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-white"
            >
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
            </div>

            <div className="hidden lg:flex items-center space-x-3 print:hidden">
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <CheckSquare className="w-4 h-4" />
                <span>Mark Paid</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </button>
              <button
                onClick={handleSaveInvoice}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save Invoice
              </button>

              <button
                onClick={handleNewInvoice}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Plus className="w-4 h-4" />
                New
              </button>

              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Send className="w-4 h-4" />
                <span>Send</span>
              </button>
              <button
                onClick={handleSavePDF}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
              <span>Mark Paid</span>
            </button>
            <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 whitespace-nowrap text-sm">
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
              className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors whitespace-nowrap text-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>
          </div>
        </div>

        <div className="bg-slate-900 border-b border-gray-200 px-4 lg:px-6 overflow-x-auto print:hidden">
          <div className="flex space-x-4 lg:space-x-8 min-w-max">
            {["Invoice", "Payments", "History", "Notes"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 border-b-2 ${
                  activeTab === tab
                    ? "border-blue-400 text-white"
                    : "border-transparent text-gray-400 hover:text-gray-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 lg:p-6">
          {/* Business Settings Modal */}
          {showSettings && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                <div className="p-4 border-b flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Business Settings</h2>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ✕
                  </button>
                </div>

                <div className="overflow-auto p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Business Logo
                      </label>
                      <div className="flex items-center gap-4">
                        {businessInfo.logoUrl ? (
                          <img
                            src={businessInfo.logoUrl}
                            alt="Business Logo"
                            className="w-24 h-24 object-contain border rounded-lg"
                          />
                        ) : (
                          <div className="w-24 h-24 border-2 border-dashed rounded-lg flex items-center justify-center bg-gray-50">
                            <Upload className="w-8 h-8 text-gray-400" />
                          </div>
                        )}

                        <div className="flex-1">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                            id="logo-upload"
                          />
                          <label
                            htmlFor="logo-upload"
                            className="inline-block px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 cursor-pointer"
                          >
                            {businessInfo.logoUrl
                              ? "Change Logo"
                              : "Upload Logo"}
                          </label>
                          <p className="text-xs text-gray-500 mt-2">
                            Recommended: Square image, max 5MB
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Business Name
                      </label>
                      <input
                        type="text"
                        value={businessInfo.businessName}
                        onChange={(e) =>
                          setBusinessInfo({
                            ...businessInfo,
                            businessName: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border rounded-lg"
                        placeholder="Precision Accounting Services"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Address Line 1
                      </label>
                      <input
                        type="text"
                        value={businessInfo.addressLine1}
                        onChange={(e) =>
                          setBusinessInfo({
                            ...businessInfo,
                            addressLine1: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border rounded-lg"
                        placeholder="123 Finance Street"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Address Line 2
                      </label>
                      <input
                        type="text"
                        value={businessInfo.addressLine2}
                        onChange={(e) =>
                          setBusinessInfo({
                            ...businessInfo,
                            addressLine2: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border rounded-lg"
                        placeholder="Rosebank"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          City
                        </label>
                        <input
                          type="text"
                          value={businessInfo.city}
                          onChange={(e) =>
                            setBusinessInfo({
                              ...businessInfo,
                              city: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border rounded-lg"
                          placeholder="Johannesburg"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Postal Code
                        </label>
                        <input
                          type="text"
                          value={businessInfo.postalCode}
                          onChange={(e) =>
                            setBusinessInfo({
                              ...businessInfo,
                              postalCode: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border rounded-lg"
                          placeholder="2196"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Primary Phone *
                      </label>
                      <input
                        type="tel"
                        value={businessInfo.primaryPhone}
                        onChange={(e) =>
                          setBusinessInfo({
                            ...businessInfo,
                            primaryPhone: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border rounded-lg"
                        placeholder="011 789 0123"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Secondary Phone (Optional)
                      </label>
                      <input
                        type="tel"
                        value={businessInfo.secondaryPhone}
                        onChange={(e) =>
                          setBusinessInfo({
                            ...businessInfo,
                            secondaryPhone: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border rounded-lg"
                        placeholder="082 456 7890"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        VAT/Tax Number
                      </label>
                      <input
                        type="text"
                        value={businessInfo.taxNumber}
                        onChange={(e) =>
                          setBusinessInfo({
                            ...businessInfo,
                            taxNumber: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border rounded-lg"
                        placeholder="VAT-9012345678"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Registration Number
                      </label>
                      <input
                        type="text"
                        value={businessInfo.registrationNumber}
                        onChange={(e) =>
                          setBusinessInfo({
                            ...businessInfo,
                            registrationNumber: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border rounded-lg"
                        placeholder="2024/123456/07"
                      />
                    </div>

                    <button
                      onClick={handleSaveBusinessInfo}
                      className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
                    >
                      Save Business Information
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <CustomersListModal
            showModal={showCustomersListModal}
            setShowModal={setShowCustomersListModal}
            customers={customers}
            onLoadCustomer={loadCustomer}
            onEditCustomer={handleEditCustomer}
            onAddNewCustomer={handleAddNewCustomer}
          />

          <CustomerModal
            showModal={showCustomerModal}
            setShowModal={setShowCustomerModal}
            existingCustomer={selectedCustomer}
            onCustomerSaved={handleCustomerSaved}
          />

          {/* Saved Invoices List Modal */}
          {showInvoicesList && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
                <div className="p-4 border-b flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Saved Invoices</h2>
                  <button
                    onClick={() => setShowInvoicesList(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <div className="overflow-auto p-4">
                  {savedInvoices.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No saved invoices yet
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {savedInvoices.map((invoice) => (
                        <div
                          key={invoice.id}
                          onClick={() => loadInvoice(invoice)}
                          className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-semibold text-lg">
                                {invoice.invoiceNumber || "N/A"}
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                Client: {invoice.customer?.name || "N/A"}
                              </div>
                              <div className="text-sm text-gray-600">
                                Email: {invoice.customer?.email || "N/A"}
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className="text-lg font-semibold text-blue-600">
                                R{invoice.totals?.total?.toFixed(2) || "0.00"}
                              </div>
                              <div className="text-sm text-gray-500">
                                {invoice.dates?.invoiceDate
                                  ? new Date(
                                      invoice.dates.invoiceDate
                                    ).toLocaleDateString("en-ZA")
                                  : "N/A"}
                              </div>
                              <div
                                className={`text-xs mt-1 px-2 py-1 rounded ${
                                  invoice.status === "paid"
                                    ? "bg-green-100 text-green-700"
                                    : invoice.status === "pending"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {invoice.status || "unknown"}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Mobile View Invoice Button */}
          <button
            onClick={() => setShowInvoice(!showInvoice)}
            className="lg:hidden w-full mb-4 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FileText className="w-5 h-5" />
            {showInvoice ? "Hide Invoice" : "View Invoice"}
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div
              className={`${
                showInvoice ? "hidden" : "block"
              } space-y-6 lg:block print:hidden`}
            >
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-blue-700 font-medium">Pending Payment</span>
                <span className="text-blue-600">Due: {dueDate || 'Not set'}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="text-sm text-gray-500 mb-1">Total Amount</div>
                  <div className="text-2xl font-semibold text-blue-600">
                    R{total.toFixed(2)}
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="text-sm text-gray-500 mb-1">Paid</div>
                  <div className="text-2xl font-semibold text-green-600">
                    R0.00
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="text-sm text-gray-500 mb-1">Balance Due</div>
                  <div className="text-2xl font-semibold text-red-600">
                    R{total.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>Client Information</span>
                  </h2>
                  <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700">
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Client Name</div>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-4 py-2 border rounded"
                    />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Client ID</div>
                    <input
                      type="text"
                      value={customerId}
                      onChange={(e) => setCustomerId(e.target.value)}
                      className="w-full px-4 py-2 border rounded"
                    />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Email</div>
                    <input
                      type="text"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full px-4 py-2 border rounded"
                    />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Phone</div>
                    <input
                      type="text"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-4 py-2 border rounded"
                    />
                  </div>
                  <div className="col-span-1 sm:col-span-2">
                    <div className="text-sm text-gray-500">Address</div>
                    <input
                      type="text"
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      className="w-full px-4 py-2 border rounded"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center space-x-2">
                    <Calendar className="w-5 h-5" />
                    <span>Invoice Details</span>
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Invoice Date</div>
                    <input
                      type="date"
                      value={invoiceDate}
                      onChange={(e) => setInvoiceDate(e.target.value)}
                      className="w-full px-4 py-2 border rounded"
                    />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Due Date</div>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-4 py-2 border rounded"
                    />
                  </div>
                  <div className="col-span-1 sm:col-span-2">
                    <div className="text-sm text-gray-500">Payment Terms</div>
                    <select
                      value={paymentTerms}
                      onChange={(e) => setPaymentTerms(e.target.value)}
                      className="w-full px-4 py-2 border rounded"
                    >
                      <option value="Due on Receipt">Due on Receipt</option>
                      <option value="Net 15">Net 15</option>
                      <option value="Net 30">Net 30</option>
                      <option value="Net 60">Net 60</option>
                      <option value="Net 90">Net 90</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">Add Line Item</h2>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                  <select
                    value={newItem.type}
                    onChange={(e) =>
                      setNewItem({ ...newItem, type: e.target.value })
                    }
                    className="px-4 py-2 border rounded"
                  >
                    <option value="Service">Service</option>
                    <option value="Consultation">Consultation</option>
                    <option value="Bookkeeping">Bookkeeping</option>
                    <option value="Tax Preparation">Tax Preparation</option>
                    <option value="Audit">Audit</option>
                  </select>

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
                    className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Payment Information</h2>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="font-medium">EFT/Card/Cash</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Payment Terms:</span>
                    <span className="font-medium">{paymentTerms}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Late Fee:</span>
                    <span className="font-medium">2% per month</span>
                  </div>
                </div>
              </div>
            </div>

            <div
              className={`${
                !showInvoice ? "hidden" : "block"
              } lg:block mx-auto bg-white shadow-lg overflow-hidden`}
              style={{
                width: "100%",
                maxWidth: "210mm",
                minHeight: "297mm",
              }}
            >
              <div className="bg-white" style={{ padding: "15mm 20mm" }}>
                {/* Header Section */}
                <div className="border-b-2 border-black pb-4 mb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        {loading ? (
                          <div className="w-16 h-16 bg-gray-200 animate-pulse rounded"></div>
                        ) : businessInfo.logoUrl ? (
                          <img
                            src={businessInfo.logoUrl}
                            alt="Business Logo"
                            className="w-16 h-16 object-contain"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-blue-100 rounded flex items-center justify-center">
                            <Calculator className="w-8 h-8 text-blue-600" />
                          </div>
                        )}
                        <div>
                          <div className="text-xl font-bold">
                            {businessInfo.businessName}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs leading-relaxed">
                        <div>{businessInfo.addressLine1}</div>
                        <div>{businessInfo.addressLine2}</div>
                        <div>
                          {businessInfo.city} {businessInfo.postalCode}
                        </div>
                        <div className="mt-1">
                          T: {businessInfo.primaryPhone}
                          {businessInfo.secondaryPhone &&
                            `, ${businessInfo.secondaryPhone}`}
                        </div>
                        {businessInfo.taxNumber && (
                          <div>VAT: {businessInfo.taxNumber}</div>
                        )}
                        {businessInfo.registrationNumber && (
                          <div>Reg: {businessInfo.registrationNumber}</div>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-3xl font-bold mb-4">INVOICE</div>
                      <div className="text-xs space-y-1">
                        <div className="flex justify-between gap-8">
                          <span className="font-semibold">INVOICE NO.</span>
                          <span>{invoiceNumber}</span>
                        </div>
                        <div className="flex justify-between gap-8">
                          <span className="font-semibold">DATE</span>
                          <span>{new Date(invoiceDate).toLocaleDateString("en-ZA")}</span>
                        </div>
                        <div className="flex justify-between gap-8">
                          <span className="font-semibold">DUE DATE</span>
                          <span>{dueDate ? new Date(dueDate).toLocaleDateString("en-ZA") : 'N/A'}</span>
                        </div>
                        <div className="flex justify-between gap-8">
                          <span className="font-semibold">TERMS</span>
                          <span>{paymentTerms}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Client Details */}
                <div className="grid grid-cols-1 gap-4 mb-4">
                  <div className="bg-gray-200 p-3">
                    <div className="font-bold text-xs mb-2 bg-gray-400 px-2 py-1">
                      BILL TO
                    </div>
                    <div className="text-xs space-y-1">
                      <div className="font-semibold">{customerName}</div>
                      <div className="h-12 overflow-hidden text-xs leading-tight">
                        {customerAddress}
                      </div>
                      <div>{customerEmail}</div>
                      <div>{customerPhone}</div>
                    </div>
                  </div>
                </div>

                {/* Items Table */}
                <div className="mb-4">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gray-300">
                        <th className="text-left px-2 py-1 font-bold">
                          DESCRIPTION
                        </th>
                        <th className="text-center px-2 py-1 font-bold">
                          QTY
                        </th>
                        <th className="text-right px-2 py-1 font-bold">
                          RATE
                        </th>
                        <th className="text-right px-2 py-1 font-bold">
                          AMOUNT
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, index) => (
                        <tr key={index} className="border-b">
                          <td className="px-2 py-2">
                            <div className="font-medium">{item.type}</div>
                            <div className="text-gray-600">{item.description}</div>
                          </td>
                          <td className="text-center px-2 py-2">{item.qty}</td>
                          <td className="text-right px-2 py-2">
                            R {item.rate.toFixed(2)}
                          </td>
                          <td className="text-right px-2 py-2">
                            R {item.amount.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                  <div className="border-t pt-3 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>R{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>VAT (20%):</span>
                      <span>R{vat.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-semibold border-t pt-2">
                      <span>Total:</span>
                      <span>R{total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600 pt-2 border-t">
                      <span>Amount Paid:</span>
                      <span>R0.00</span>
                    </div>
                    <div className="flex justify-between font-semibold text-indigo-600 border-t pt-2 text-sm">
                      <span>Amount Due:</span>
                      <span>R{total.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t">
                    <div className="text-xs font-medium mb-2 text-indigo-600">
                      Payment Information
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>Bank: Barclays Bank PLC</div>
                      <div>Account: AccounTech Pro Ltd</div>
                      <div>Sort Code: 20-00-00</div>
                      <div>Account No: 12345678</div>
                      <div>IBAN: GB29 BARC 2000 0012 3456 78</div>
                      <div className="mt-2">Payment Terms: Net 21 days</div>
                      <div>Reference: {invoiceNumber}</div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t text-xs text-gray-500 space-y-1">
                    <div>Company Reg: 87654321</div>
                    <div>VAT Reg: GB 987 6543 21</div>
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
                
                .print\\:hidden,
                nav,
                button,
                [class*="sidebar"],
                [class*="bg-indigo-900"],
                [class*="border-b"] {
                  display: none !important;
                }
                
                .space-y-6.lg\\:block {
                  display: none !important;
                }
                
                .flex.h-screen.bg-gray-50,
                .flex-1.overflow-auto {
                  overflow: hidden !important;
                }
                
                .grid.grid-cols-1.lg\\:grid-cols-2 {
                  display: block !important;
                  grid-template-columns: 1fr !important;
                  overflow: hidden !important;
                }
                
                .lg\\:block.mx-auto.bg-white.shadow-lg {
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
   
  );
};

export default AccountingDashboard;