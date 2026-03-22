import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import HomeView from "../HomeView";
import BusinessSettingsModal from "../BusinessSettingsModal";
import AppHeader from "../AppHeader";
import { serverTimestamp } from "firebase/firestore";
import logo from "../../assets/img/solidflo-logo.png";
import Templates from "./Templates";
import PurchaseOrders from "../PurchaseOrders";
import { useLocation } from "react-router-dom";
import AIInvoiceWindow from '../AIInvoiceWindow';
import TemplateSelector, { TemplateRenderer } from "./TemplateSelector";
import { getAuth, signOut } from "firebase/auth";
import SignatureStamp from "../SignatureStamp";
import PhotographyMultiStepForm from "./PhotographyMultiStepForm";
import { getFunctions, httpsCallable } from "firebase/functions";
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
import { db } from "../../firebase";
import CustomerModal from "../CustomerModal";
import uploadLogoToR2 from "../../utils/uploadLogoToR2";
import CustomersListModal from "../CustomersListModal";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Home,
  Settings,
  Sparkles,
  Users,
  Save,
  Calendar,
  FileText,
  Camera,
  X,
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
  Wallet,
  PieChart,
  Image,
  ClipboardList,
  Package,
  Upload,
  Film,
  Eye,
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

const functions = getFunctions();

const PhotographyDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [inputMode, setInputMode] = useState("manual");
  const [documentType, setDocumentType] = useState("invoice");
  const [useAI, setUseAI] = useState(false);
  const [activeTab, setActiveTab] = useState("Invoice");
  const [showInvoice, setShowInvoice] = useState(false);
  const { user, authUser } = useAuth();
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceId, setInvoiceId] = useState(null);
  const [savedInvoices, setSavedInvoices] = useState([]);
  const [showInvoicesList, setShowInvoicesList] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCustomersList, setShowCustomersList] = useState(false);
  const [savedCustomers, setSavedCustomers] = useState([]);
  const [activeView, setActiveView] = useState("home");
  const [activeTemplate, setActiveTemplate] = useState("classic");
  const [showCustomersListModal, setShowCustomersListModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("professional");
  const [customers, setCustomers] = useState([]);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState(null);
  const [isInvoicingOpen, setIsInvoicingOpen] = useState(false);
  const [isClientsOpen, setIsClientsOpen] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showAIWindow, setShowAIWindow] = useState(false);
  const [stampSettings, setStampSettings] = useState({
    text: "APPROVED",
    color: "#d32f2f",
    showDate: false,
    enabled: false,
  });
  const [aiWindowOpen, setAiWindowOpen] = useState(false);
  const [aiDocType, setAiDocType] = useState('invoice');
  const [paymentStatus, setPaymentStatus] = useState({
    totalPaid: 0,
    balanceDue: 0,
    status: "pending",
  });

  const [customerName, setCustomerName] = useState("Sarah Johnson");
  const [customerId, setCustomerId] = useState("CUST-2026-5678");
  const [customerEmail, setCustomerEmail] = useState("sarah.johnson@example.com");
  const [customerPhone, setCustomerPhone] = useState("082 456 7890");
  const [customerAddress, setCustomerAddress] = useState("456 Oak Avenue, Johannesburg, 2000");
  const [eventDate, setEventDate] = useState("2026-06-15");
  const [eventType, setEventType] = useState("Wedding");
  const [eventLocation, setEventLocation] = useState("Silverstar Casino, Krugersdorp");

  const [businessInfo, setBusinessInfo] = useState({
    businessName: "PERFECT MOMENTS PHOTOGRAPHY",
    addressLine1: "123 Studio Street",
    addressLine2: "Rosebank",
    city: "Johannesburg",
    postalCode: "2196",
    primaryPhone: "011 234 5678",
    secondaryPhone: "082 987 6543",
    logoUrl: "",
  });

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({
    description: "",
    rate: "",
    qty: "",
    type: "Photography",
  });

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const vat = subtotal * 0.15;
  const total = subtotal + vat;

  const location = useLocation();

  // ── shared template props ────────────────────────────────────────────────
  const templateProps = {
    templateId: selectedTemplate,
    businessInfo,
    loading,
    jobCardNumber: invoiceNumber,
    customerName,
    customerEmail,
    customerPhone,
    customerAddress,
    eventType,
    eventDate,
    eventLocation,
    items,
    subtotal,
    vat,
    total,
    documentType: "photography",
    serviceType: "PHOTOGRAPHY",
    showStamp: stampSettings?.enabled || false,
    stampText: stampSettings?.text || "APPROVED",
    stampColor: stampSettings?.color || "#d32f2f",
    showStampDate: stampSettings?.showDate || false,
  };

  // ============================================================================
  // Effects
  // ============================================================================
  useEffect(() => {
    if (!user?.uid) return;
    const loadInvoiceNumber = async () => {
      const nextInvoice = await generateInvoiceNumber(user.uid);
      setInvoiceNumber(nextInvoice);
    };
    loadInvoiceNumber();
    loadSavedInvoices();
  }, [user]);

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    if (location.state?.activeView) {
      setActiveView(location.state.activeView);
    }
  }, [location.state]);

  useEffect(() => {
    if (user?.uid) loadBusinessInfo();
  }, [user]);

  useEffect(() => {
    const fetchBusinessInfo = async () => {
      if (!user?.uid) return;
      try {
        const db = getFirestore();
        const docRef = doc(db, "users", user.uid, "settings", "businessInfo");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) setBusinessInfo(docSnap.data());
      } catch (error) {
        console.error("Error fetching business info:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBusinessInfo();
  }, [user]);

  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ============================================================================
  // Data loaders
  // ============================================================================
  const loadCustomers = async () => {
    try {
      const q = query(collection(db, "customers"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const customersData = [];
      querySnapshot.forEach((doc) => {
        customersData.push({ id: doc.id, ...doc.data() });
      });
      setCustomers(customersData);
    } catch (error) {
      console.error("Error loading customers:", error);
    }
  };

  const loadSavedInvoices = async () => {
    if (!user?.uid) return;
    const db = getFirestore();
    const invoicesRef = collection(db, "users", user.uid, "invoices");
    const q = query(invoicesRef, orderBy("createdAt", "desc"), limit(50));
    const snapshot = await getDocs(q);
    setSavedInvoices(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  const loadSavedCustomers = async () => {
    if (!user?.uid) return;
    const db = getFirestore();
    const customersRef = collection(db, "users", user.uid, "clients");
    const q = query(customersRef, orderBy("createdAt", "desc"), limit(50));
    const snapshot = await getDocs(q);
    const customers = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setSavedCustomers(customers.filter((c) => !c._placeholder));
  };

  const loadBusinessInfo = async () => {
    if (!user?.uid) return;
    try {
      const db = getFirestore();
      const docRef = doc(db, "users", user.uid, "settings", "businessInfo");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) setBusinessInfo(docSnap.data());
    } catch (error) {
      console.error("Error loading business info:", error);
    }
  };

  const loadPaymentStatus = async () => {
    if (!user?.uid || !invoiceId) {
      setPaymentStatus({ totalPaid: 0, balanceDue: total, status: "pending" });
      return;
    }
    try {
      const collectionName = documentType === "estimate" ? "estimates" : "invoices";
      const invoiceDoc = await getDoc(doc(db, "users", user.uid, collectionName, invoiceId));
      if (invoiceDoc.exists()) {
        const data = invoiceDoc.data();
        setPaymentStatus({
          totalPaid: data.totals?.paid || 0,
          balanceDue: data.totals?.due || data.totals?.total || 0,
          status: data.status || "pending",
        });
      } else {
        setPaymentStatus({ totalPaid: 0, balanceDue: total, status: "pending" });
      }
    } catch (error) {
      console.error("Error loading payment status:", error);
      setPaymentStatus({ totalPaid: 0, balanceDue: total, status: "pending" });
    }
  };

  const loadInvoiceForExport = async () => {
    if (!user?.uid || !invoiceId) return null;
    const db = getFirestore();
    const snap = await getDoc(doc(db, "users", user.uid, "invoices", invoiceId));
    return snap.exists() ? snap.data() : null;
  };

  // ============================================================================
  // Handlers
  // ============================================================================
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

  const loadInvoice = (invoice) => {
    setInvoiceId(invoice.id);
    setInvoiceNumber(invoice.invoiceNumber || "");
    setCustomerName(invoice.customer?.name || "");
    setCustomerEmail(invoice.customer?.email || "");
    setCustomerPhone(invoice.customer?.phone || "");
    setCustomerAddress(invoice.customer?.address || "");
    setCustomerId(invoice.customer?.customerId || "");
    setEventDate(invoice.event?.date || "");
    setEventType(invoice.event?.type || "");
    setEventLocation(invoice.event?.location || "");
    setItems(invoice.items || []);
    setShowInvoicesList(false);
  };

  const buildInvoicePayload = (numberToUse) => ({
    invoiceNumber: numberToUse,
    locked: true,
    status: "pending",
    dates: {
      invoiceDate: new Date().toISOString(),
      dueDate: null,
    },
    customer: {
      name: customerName,
      email: customerEmail,
      phone: customerPhone,
      address: customerAddress,
      customerId,
    },
    event: {
      date: eventDate,
      type: eventType,
      location: eventLocation,
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
      const ref = await addDoc(collection(db, "users", user.uid, "invoices"), invoiceData);
      setInvoiceId(ref.id);
    }
    alert("Invoice saved successfully");
    loadSavedInvoices();
  };

  const handleConvertToInvoice = async () => {
    if (!user?.uid) return;
    if (!invoiceId) {
      alert("Please save the quote first before converting to invoice");
      return;
    }
    if (!window.confirm("Convert this quote to an invoice? This will create a new invoice with the same details.")) return;
    try {
      const db = getFirestore();
      const newInvoiceNumber = await generateInvoiceNumber(user.uid);
      const invoiceData = buildInvoicePayload(newInvoiceNumber);
      invoiceData.documentType = "invoice";
      invoiceData.convertedFromQuote = invoiceId;
      invoiceData.convertedFromQuoteNumber = invoiceNumber;
      invoiceData.convertedAt = serverTimestamp();
      const invoiceRef = await addDoc(collection(db, "users", user.uid, "invoices"), invoiceData);
      await updateDoc(doc(db, "users", user.uid, "quotes", invoiceId), {
        convertedToInvoice: true,
        convertedToInvoiceId: invoiceRef.id,
        convertedToInvoiceNumber: newInvoiceNumber,
        convertedAt: serverTimestamp(),
        status: "converted",
      });
      setDocumentType("invoice");
      setInvoiceId(invoiceRef.id);
      setInvoiceNumber(newInvoiceNumber);
      alert(`Quote successfully converted to Invoice ${newInvoiceNumber}`);
      loadSavedInvoices();
    } catch (error) {
      console.error("Error converting quote to invoice:", error);
      alert("Failed to convert quote to invoice");
    }
  };

  const handleProcessPayment = async () => {
    if (!invoiceId || !user?.uid) {
      alert("Please save the invoice before processing payment");
      return;
    }
    try {
      const collectionName = documentType === "estimate" ? "estimates" : "invoices";
      const invoiceDoc = await getDoc(doc(db, "users", user.uid, collectionName, invoiceId));
      if (invoiceDoc.exists()) {
        setSelectedInvoiceForPayment({ id: invoiceId, ...invoiceDoc.data() });
        setShowPaymentModal(true);
      } else {
        alert("Invoice not found. Please save the invoice first.");
      }
    } catch (error) {
      console.error("Error loading invoice:", error);
      alert("Failed to load invoice for payment");
    }
  };

  const handlePaymentComplete = () => {
    loadSavedInvoices();
    loadPaymentStatus();
    setShowPaymentModal(false);
  };

  const handleNewInvoice = () => {
    setInvoiceId(null);
    setInvoiceNumber("");
    setCustomerName("Sarah Johnson");
    setCustomerId("CUST-2026-5678");
    setCustomerEmail("sarah.johnson@example.com");
    setCustomerPhone("082 456 7890");
    setCustomerAddress("456 Oak Avenue, Johannesburg, 2000");
    setEventDate("2026-06-15");
    setEventType("Wedding");
    setEventLocation("Silverstar Casino, Krugersdorp");
    setItems([]);
    const loadNewNumber = async () => {
      if (user?.uid) {
        const nextInvoice = await generateInvoiceNumber(user.uid);
        setInvoiceNumber(nextInvoice);
      }
    };
    loadNewNumber();
  };

  const handleAddItem = () => {
    if (!newItem.description || !newItem.qty) return;
    const rate = Number(newItem.rate) || 0;
    const qty = Number(newItem.qty);
    const item = {
      description: newItem.description,
      type: newItem.type || "Photography",
      rate,
      qty,
      amount: rate * qty,
    };
    setItems((prev) => [...prev, item]);
    setNewItem({ description: "", rate: "", qty: "", type: "Photography" });
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user?.uid || !authUser) return;
    if (!file.type.startsWith("image/")) { alert("Please upload an image file"); return; }
    if (file.size > 5 * 1024 * 1024) { alert("Image size should be less than 5MB"); return; }
    try {
      setBusinessInfo((prev) => ({ ...prev, uploading: true }));
      const logoUrl = await uploadLogoToR2(file, authUser);
      setBusinessInfo((prev) => ({ ...prev, logoUrl, uploading: false }));
      const db = getFirestore();
      await setDoc(doc(db, "users", user.uid, "settings", "businessInfo"), { logoUrl, updatedAt: new Date().toISOString() }, { merge: true });
      alert("Logo uploaded successfully!");
    } catch (error) {
      console.error("Error uploading logo:", error);
      alert("Failed to upload logo: " + error.message);
      setBusinessInfo((prev) => ({ ...prev, uploading: false }));
    }
  };

  const handleSaveBusinessInfo = async () => {
    if (!user?.uid) return;
    try {
      const db = getFirestore();
      await setDoc(doc(db, "users", user.uid, "settings", "businessInfo"), businessInfo);
      alert("Business information saved successfully!");
      setShowSettings(false);
    } catch (error) {
      console.error("Error saving business info:", error);
      alert("Failed to save business information");
    }
  };

  const printStyles = `@media print { * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } html,body { margin:0!important;padding:0!important;width:210mm!important;background:white!important; } body * { visibility:hidden!important; } #print-area,#print-area * { visibility:visible!important; } #print-area { display:block!important;position:absolute!important;left:0!important;top:0!important;width:210mm!important;min-height:297mm!important;margin:0!important;padding:0!important;background:white!important; } @page { size:A4 portrait;margin:40px!important; } }`;


  const handlePrint = () => {
    const styleSheet = document.createElement("style");
    styleSheet.textContent = printStyles;
    document.head.appendChild(styleSheet);
    window.print();
    setTimeout(() => document.head.removeChild(styleSheet), 1000);
  };

  const handleSavePDF = async () => {
    const savedInvoice = await loadInvoiceForExport();
    if (!savedInvoice) { alert("Please save the invoice before exporting PDF"); return; }
    setInvoiceNumber(savedInvoice.invoiceNumber);
    setItems(savedInvoice.items);
    setCustomerName(savedInvoice.customer.name);
    setCustomerEmail(savedInvoice.customer.email);
    setCustomerPhone(savedInvoice.customer.phone);
    setCustomerAddress(savedInvoice.customer.address);
    setEventDate(savedInvoice.event.date);
    setEventType(savedInvoice.event.type);
    setEventLocation(savedInvoice.event.location);
    setTimeout(() => window.print(), 300);
  };

  const handleAIDataExtracted = (extractedData) => {
    if (extractedData.customer?.name) setCustomerName(extractedData.customer.name);
    if (extractedData.customer?.email) setCustomerEmail(extractedData.customer.email);
    if (extractedData.customer?.phone) setCustomerPhone(extractedData.customer.phone);
    if (extractedData.customer?.address) setCustomerAddress(extractedData.customer.address);
    if (extractedData.customer?.customerId) setCustomerId(extractedData.customer.customerId);
    if (extractedData.event?.date) setEventDate(extractedData.event.date);
    if (extractedData.event?.type) setEventType(extractedData.event.type);
    if (extractedData.event?.location) setEventLocation(extractedData.event.location);
    if (extractedData.items?.length > 0) setItems(extractedData.items);
    alert("✅ Photography invoice data extracted and populated successfully!");
  };

  const handleLogout = async () => {
    try {
      await signOut(getAuth());
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const headerActions = [
    documentType === "quote" && invoiceId && {
      label: "Convert to Invoice",
      icon: FileText,
      onClick: handleConvertToInvoice,
      className: "flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-sm font-semibold rounded-lg hover:from-purple-700 transition-colors shadow-sm whitespace-nowrap",
    },
    {
      label: "Preview",
      icon: Eye,
      onClick: () => setShowPreview(true),
      className: "flex items-center gap-1.5 px-3 py-1.5 bg-[#0f172a] hover:bg-[#1e293b] text-white text-sm font-medium rounded-md transition-colors whitespace-nowrap",
    },
    { label: "Print", icon: Printer, onClick: handlePrint, variant: "secondary" },
    {
      label: "New",
      icon: Plus,
      onClick: handleNewInvoice,
      className: "flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-sm font-semibold rounded-lg hover:from-emerald-700 transition-colors shadow-sm whitespace-nowrap",
    },
    {
      label: "Send",
      icon: Send,
      className: "flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold rounded-lg hover:from-blue-700 transition-colors shadow-sm whitespace-nowrap",
    },
    {
      label: "Save PDF",
      icon: Download,
      onClick: handleSavePDF,
      className: "flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-600 to-orange-700 text-white text-sm font-semibold rounded-lg hover:from-orange-700 transition-colors shadow-sm whitespace-nowrap",
    },
    {
      label: "Save",
      icon: Save,
      onClick: handleSaveInvoice,
      className: "flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-violet-600 to-violet-700 text-white text-sm font-semibold rounded-lg hover:from-violet-700 transition-colors shadow-sm whitespace-nowrap",
    },
    {
      label: "Logout",
      icon: LogOut,
      onClick: handleLogout,
      className: "flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-semibold rounded-lg hover:from-red-700 transition-colors shadow-sm whitespace-nowrap",
    },
  ].filter(Boolean);

  const mobileDashboardActions = [
    documentType === "quote" && invoiceId && {
      label: "To Invoice",
      icon: FileText,
      onClick: handleConvertToInvoice,
      className: "flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg text-xs font-semibold shadow-lg transition-all active:scale-95 whitespace-nowrap",
    },
    {
      label: "Save",
      icon: Save,
      onClick: handleSaveInvoice,
      className: "flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-violet-600 to-violet-700 text-white rounded-lg text-xs font-semibold shadow-lg transition-all active:scale-95 whitespace-nowrap",
    },
    {
      label: "Send",
      icon: Send,
      className: "flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-xs font-semibold shadow-lg transition-all active:scale-95 whitespace-nowrap",
    },
    {
      label: "PDF",
      icon: Download,
      onClick: handleSavePDF,
      className: "flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg text-xs font-semibold shadow-lg transition-all active:scale-95 whitespace-nowrap",
    },
    {
      label: "Print",
      icon: Printer,
      onClick: handlePrint,
      className: "flex items-center gap-1.5 px-3 py-2 bg-white border-2 border-slate-200 text-slate-700 rounded-lg text-xs font-semibold shadow-sm transition-all active:scale-95 whitespace-nowrap",
    },
  ].filter(Boolean);

  return (
    <div className="flex h-screen w-screen bg-gradient-to-br from-slate-50 via-slate-100 to-gray-100 overflow-hidden">
      {/* ── Mobile Sidebar Backdrop ──────────────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Collapsed Sidebar ────────────────────────────────────────────── */}
      <div className={`${sidebarOpen ? "hidden" : "hidden md:block"} fixed z-40 w-16 bg-gradient-to-b from-slate-900 to-slate-800 border-r border-slate-700 h-full print:hidden transition-all duration-300 shadow-xl`}>
        <div className="flex flex-col items-center py-4 md:py-6 space-y-4 md:space-y-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="group p-2 md:p-3 text-slate-400 hover:text-white hover:bg-gradient-to-r hover:from-violet-600 hover:to-violet-700 rounded-xl transition-all duration-300 shadow-lg hover:shadow-violet-500/50 hover:scale-110"
            title="Expand Sidebar"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6 group-hover:animate-pulse" />
          </button>

          <div className="w-10 h-10 mb-2">
            <img src={logo} alt="Logo" className="w-full h-full object-contain rounded-lg" />
          </div>

          <div className="w-10 border-t border-slate-600"></div>

          <div className="flex flex-col items-center space-y-3 md:space-y-4 w-full px-2 md:px-3">
            <button onClick={() => setActiveView("home")} className="group relative p-2 md:p-3 text-cyan-400 hover:text-white rounded-xl transition-all duration-300 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center overflow-hidden" title="Home">
              <div className="absolute inset-0 bg-gradient-to-r from-slate-600 to-slate-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Home className="w-5 h-5 md:w-6 md:h-6 relative z-10 group-hover:scale-110 transition-transform duration-300" />
            </button>
            <button onClick={() => setShowSettings(true)} className="p-2 text-slate-400 hover:text-white hover:bg-violet-600/80 rounded-lg transition-all duration-200 w-10 h-10 flex items-center justify-center" title="Settings">
              <Settings className="w-5 h-5" />
            </button>
            <button className="p-2 text-slate-400 hover:text-white hover:bg-violet-600/80 rounded-lg transition-all duration-200 w-10 h-10 flex items-center justify-center" title="Business Overview">
              <TrendingUp className="w-5 h-5" />
            </button>
            <button onClick={() => { handleNewInvoice(); setActiveView("invoice"); }} className="p-2 text-slate-400 hover:text-white hover:bg-violet-600/80 rounded-lg transition-all duration-200 w-10 h-10 flex items-center justify-center" title="Invoices">
              <ClipboardList className="w-5 h-5" />
            </button>
            <button onClick={() => setShowCustomersListModal(true)} className="p-2 text-slate-400 hover:text-white hover:bg-violet-600/80 rounded-lg transition-all duration-200 w-10 h-10 flex items-center justify-center" title="Clients">
              <Users className="w-5 h-5" />
            </button>
            <button onClick={() => setActiveView("templates")} className="p-2 text-slate-400 hover:text-white hover:bg-violet-600/80 rounded-lg transition-all duration-200 w-10 h-10 flex items-center justify-center" title="Invoice Templates">
              <FileText className="w-5 h-5" />
            </button>
            <button className="p-2 text-slate-400 hover:text-white hover:bg-violet-600/80 rounded-lg transition-all duration-200 w-10 h-10 flex items-center justify-center" title="Bookings">
              <Calendar className="w-5 h-5" />
            </button>
            <button className="p-2 text-slate-400 hover:text-white hover:bg-violet-600/80 rounded-lg transition-all duration-200 w-10 h-10 flex items-center justify-center" title="Portfolio">
              <Image className="w-5 h-5" />
            </button>
            <button className="p-2 text-slate-400 hover:text-white hover:bg-violet-600/80 rounded-lg transition-all duration-200 w-10 h-10 flex items-center justify-center" title="Packages">
              <Package className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="absolute bottom-4 md:bottom-6 left-0 right-0 flex justify-center">
          <div className="relative group">
            <div className="relative w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center ring-2 ring-violet-700 shadow-lg group-hover:ring-4 group-hover:ring-violet-500/50 transition-all duration-300">
              <img src={businessInfo.logoUrl} alt="" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Expanded Sidebar ─────────────────────────────────────────────── */}
      <div className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} fixed z-50 w-64 md:w-72 bg-gradient-to-b from-slate-900 to-slate-800 border-r border-slate-700 transition-transform duration-300 h-full print:hidden shadow-2xl overflow-y-auto`}>
        <div className="p-4 md:p-6">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <img src={logo} alt="Business Logo" className="w-16 h-12 object-contain rounded-lg" />
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-200"
              title="Collapse Sidebar"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>

          <nav className="space-y-1.5 md:space-y-2">
            <div onClick={() => { setActiveView("home"); setSidebarOpen(false); }} className="group flex items-center space-x-2 md:space-x-3 px-3 md:px-4 py-2.5 md:py-3 text-cyan-300 hover:text-white hover:bg-gradient-to-r hover:from-slate-600/20 hover:to-slate-700/20 rounded-xl cursor-pointer transition-all duration-300 border border-transparent hover:border-cyan-500/30">
              <Home className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
              <span className="text-xs md:text-sm font-semibold">Home</span>
            </div>
            <div onClick={() => { setShowSettings(true); setSidebarOpen(false); }} className="flex items-center space-x-3 px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200">
              <Settings className="w-5 h-5" />
              <span className="text-sm font-medium">Settings</span>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-700/50">
              <div className="flex items-center space-x-3 px-3 py-2.5 text-slate-300 hover:text-white hover:bg-violet-600/20 rounded-lg cursor-pointer transition-all duration-200">
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm font-medium">Business Overview</span>
              </div>

              <div className="mt-2">
                <div className="flex items-center justify-between px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200">
                  <div className="flex items-center space-x-3">
                    <ClipboardList className="w-5 h-5" />
                    <span className="text-sm font-medium">Invoices</span>
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </div>
                <div className="ml-4 mt-1 space-y-1 border-l-2 border-slate-700/50 pl-4">
                  <div onClick={() => { handleNewInvoice(); setSidebarOpen(false); setActiveView("invoice"); }} className="px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700/30 rounded-lg cursor-pointer transition-all duration-200">
                    Create Invoice
                  </div>
                  <div onClick={() => { setShowInvoicesList(!showInvoicesList); setSidebarOpen(false); }} className="px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700/30 rounded-lg cursor-pointer transition-all duration-200">
                    <div className="flex items-center justify-between">
                      <span>All Invoices</span>
                      <span className="text-violet-300 px-2 py-0.5 rounded-full text-xs font-semibold">{savedInvoices.length}</span>
                    </div>
                  </div>
                  <div className="px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700/30 rounded-lg cursor-pointer transition-all duration-200">
                    Pending Payment
                  </div>
                </div>
              </div>

              <div className="mt-2">
                <div className="flex items-center justify-between px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200">
                  <div className="flex items-center space-x-3">
                    <Users className="w-5 h-5" />
                    <span className="text-sm font-medium">Clients</span>
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </div>
                <div className="ml-4 mt-1 space-y-1 border-l-2 border-slate-700/50 pl-4">
                  <div onClick={handleAddNewCustomer} className="px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700/30 rounded-lg cursor-pointer transition-all duration-200">Add Client</div>
                  <div onClick={() => { setShowCustomersListModal(true); setSidebarOpen(false); }} className="px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700/30 rounded-lg cursor-pointer transition-all duration-200">
                    <div className="flex items-center justify-between">
                      <span>All Clients</span>
                      <span className="text-violet-300 px-2 py-0.5 rounded-full text-xs font-semibold">{savedCustomers.length}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div onClick={() => { setActiveView("templates"); setSidebarOpen(false); }} className="flex items-center space-x-3 px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200 mt-2">
                <FileText className="w-5 h-5" />
                <span className="text-sm font-medium">Invoice Templates</span>
              </div>
              <div className="flex items-center space-x-3 px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200">
                <Calendar className="w-5 h-5" />
                <span className="text-sm font-medium">Bookings</span>
              </div>
              <div className="flex items-center space-x-3 px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200">
                <Image className="w-5 h-5" />
                <span className="text-sm font-medium">Portfolio</span>
              </div>
              <div className="flex items-center space-x-3 px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200">
                <Package className="w-5 h-5" />
                <span className="text-sm font-medium">Packages</span>
              </div>
              <div className="flex items-center justify-between px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200">
                <div className="flex items-center space-x-3">
                  <CreditCard className="w-5 h-5" />
                  <span className="text-sm font-medium">Payments</span>
                </div>
                <ChevronDown className="w-4 h-4" />
              </div>
              <div className="flex items-center justify-between px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200">
                <div className="flex items-center space-x-3">
                  <FileBarChart className="w-5 h-5" />
                  <span className="text-sm font-medium">Reports</span>
                </div>
                <ChevronDown className="w-4 h-4" />
              </div>
              <div className="flex items-center justify-between px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200">
                <div className="flex items-center space-x-3">
                  <BarChart3 className="w-5 h-5" />
                  <span className="text-sm font-medium">Analytics</span>
                </div>
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </nav>
        </div>

        <div className="absolute bottom-4 md:bottom-6 left-0 right-0 flex justify-center p-4 md:p-6 border-t border-slate-700/50 bg-gradient-to-t from-slate-900 to-transparent backdrop-blur-sm">
          <div className="flex items-center space-x-2 md:space-x-3">
            <div className="relative group flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full opacity-50 group-hover:opacity-100 blur-md transition-opacity duration-300"></div>
              <div className="relative w-9 h-9 md:w-11 md:h-11 bg-white rounded-full ring-2 ring-slate-700 shadow-lg group-hover:ring-4 group-hover:ring-violet-500/50 transition-all duration-300">
                <img src={businessInfo.logoUrl} alt="Business Logo" className="absolute inset-0 m-auto max-h-[70%] max-w-[70%] object-contain" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs md:text-sm font-bold text-white bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent truncate">
                {user?.name || "User"}
              </div>
              <div className="text-xs text-slate-400 truncate">{user?.email || "email@example.com"}</div>
            </div>
            <button onClick={handleLogout} className="group text-slate-400 hover:text-white hover:bg-gradient-to-r hover:from-red-600/20 hover:to-red-700/20 p-2 md:p-2.5 rounded-xl transition-all duration-300 border border-transparent hover:border-red-500/30 flex-shrink-0">
              <LogOut className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-300" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Content Area ────────────────────────────────────────────── */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? "ml-0 lg:ml-72" : "ml-2 md:ml-16"}`}>
        <div className="flex flex-col h-screen">
          <AppHeader
            actions={headerActions}
            mobileActions={mobileDashboardActions}
            onSettingsOpen={() => setShowSettings(true)}
          />

          {/* ── Scrollable Main Content ──────────────────────────────── */}
          <div className="flex-1 overflow-y-auto">
            {/* ── Settings Modal ──────────────────────────────────────── */}
            {showSettings && <BusinessSettingsModal onClose={() => setShowSettings(false)} />}

            {/* ── Shared Modals ────────────────────────────────────────── */}
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

            {/* ── Saved Invoices List Modal ────────────────────────────── */}
            {showInvoicesList && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
                  <div className="p-4 border-b flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Saved Invoices</h2>
                    <button onClick={() => setShowInvoicesList(false)} className="text-gray-500 hover:text-gray-700">✕</button>
                  </div>
                  <div className="overflow-auto p-4">
                    {savedInvoices.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">No saved invoices yet</div>
                    ) : (
                      <div className="space-y-2">
                        {savedInvoices.map((invoice) => (
                          <div key={invoice.id} onClick={() => loadInvoice(invoice)} className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-semibold text-lg">{invoice.invoiceNumber || "N/A"}</div>
                                <div className="text-sm text-gray-600 mt-1">Client: {invoice.customer?.name || "N/A"}</div>
                                <div className="text-sm text-gray-600">Event: {invoice.event?.type || "N/A"}</div>
                                <div className="text-sm text-gray-600">Location: {invoice.event?.location || "N/A"}</div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-semibold text-violet-600">R{invoice.totals?.total?.toFixed(2) || "0.00"}</div>
                                <div className="text-sm text-gray-500">
                                  {invoice.dates?.invoiceDate ? new Date(invoice.dates.invoiceDate).toLocaleDateString("en-ZA") : "N/A"}
                                </div>
                                <div className={`text-xs mt-1 px-2 py-1 rounded ${invoice.status === "paid" ? "bg-green-100 text-green-700" : invoice.status === "pending" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}`}>
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

            {/* ── Invoice Preview Modal ─────────────────────────────────── */}
            {showPreview && (
              <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#e2e8f0] bg-[#f8fafc] flex-shrink-0">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 bg-[#0f172a] rounded-lg flex items-center justify-center">
                        <Eye className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h2 className="text-sm font-semibold text-[#1e293b]">Invoice Preview</h2>
                        <p className="text-xs text-[#64748b]">{invoiceNumber || "Draft"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={handlePrint} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-medium rounded-lg transition-colors">
                        <Printer className="w-3.5 h-3.5" />
                        Print
                      </button>
                      <button onClick={handleSavePDF} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#059669] hover:bg-[#047857] text-white text-xs font-medium rounded-lg transition-colors">
                        <Download className="w-3.5 h-3.5" />
                        Save PDF
                      </button>
                      <button onClick={() => setShowPreview(false)} className="p-1.5 text-[#64748b] hover:text-[#1e293b] hover:bg-[#e2e8f0] rounded-lg transition-all">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto bg-[#e2e8f0] p-6">
                    <div className="mx-auto bg-white shadow-xl" style={{ width: "210mm", minHeight: "297mm" }}>
                      <TemplateRenderer {...templateProps} />
                    </div>
                  </div>
                </div>
              </div>
            )}
             {showAIWindow && (
                     <AIInvoiceWindow
                       user={user}
                       businessInfo={businessInfo}
                       documentType={documentType}
                       onExit={() => setShowAIWindow(false)}
                       industry="photography"
                       TemplateRenderer={TemplateRenderer}
                     />
                   )}
            {/* ── Alternate Views ──────────────────────────────────────── */}
            {activeView === "templates" && <Templates user={user} />}
            {activeView === "home" && (
                        <div className="flex-1 overflow-y-auto p-4">
                          <HomeView
                            user={user}
                            onNavigate={(view, docType) => {
                              if (docType) setDocumentType(docType);
                              setActiveView(view);
                            }}
                            onGoToDashboard={() => setActiveView("quote")}
                            onSidebarToggle={() => setSidebarOpen((p) => !p)}
                            sidebarOpen={sidebarOpen}
                          />
                        </div>
                      )}

            {/* ── Invoice Builder ──────────────────────────────────────── */}
            {activeView === "invoice" && (
              <div className="flex flex-1 overflow-hidden min-h-0" style={{ height: "calc(100vh - 60px)" }}>
                {/* ── LEFT: Form panel ─────────────────────────────────── */}
                <div className="flex-1 overflow-y-auto">
                  <div className="grid grid-cols-1 gap-6 px-4 sm:px-6 lg:px-8 xl:px-12 py-6">
                    {/* Mobile View Invoice Button */}
                    <button
                      onClick={() => setShowInvoice(!showInvoice)}
                      className="xl:hidden w-full mb-4 flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 text-gray-800 rounded-lg hover:bg-violet-100 transition-colors"
                    >
                      <FileText className="w-5 h-5" />
                      {showInvoice ? "Hide Invoice" : "View Invoice"}
                    </button>

                    {/* Manual / AI Tab switcher */}
                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm pt-2 sm:pt-6">
                      <div className="flex border-b border-slate-200">
                        <button
                          onClick={() => setInputMode("manual")}
                          className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${inputMode === "manual" ? "bg-white text-violet-600 border-b-2 border-violet-600" : "bg-gray-50 text-gray-600 hover:bg-gray-100"}`}
                        >
                          📝 Manual Entry
                        </button>
                        <button
                        onClick={() => setShowAIWindow(true)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ml-auto mr-3 my-auto
    bg-gradient-to-r from-[#7c3aed] to-[#5b21b6]
    text-white shadow-md shadow-[#7c3aed]/30
    hover:shadow-lg hover:shadow-[#7c3aed]/40 hover:scale-[1.02]
    active:scale-[0.98]"
                      >
                        <Sparkles className="w-4 h-4" />
                        AI Mode
                      </button>
                      </div>
                      
                    </div>

                    {inputMode === "manual" && (
                      <>
                        {/* Payment status banner */}
                        <div className="bg-violet-50 border border-violet-200 rounded-lg px-4 py-3 flex items-center space-x-3">
                          <div className="w-2 h-2 bg-violet-500 rounded-full"></div>
                          <span className="text-violet-700 text-sm font-medium">Pending Payment</span>
                          <span className="text-violet-600">Due in 7 days</span>
                        </div>

                        {/* Summary cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <div className="text-sm text-gray-500 mb-1">Total Amount</div>
                            <div className="text-2xl font-semibold text-violet-600">R{total.toFixed(2)}</div>
                          </div>
                          <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <div className="text-sm text-gray-500 mb-1">Paid</div>
                            <div className="text-2xl font-semibold text-green-600">R{paymentStatus.totalPaid.toFixed(2)}</div>
                          </div>
                          <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <div className="text-sm text-gray-500 mb-1">Balance Due</div>
                            <div className="text-2xl font-semibold text-red-600">R{total.toFixed(2)}</div>
                          </div>
                        </div>

                        {/* Multi-step form */}
                        <PhotographyMultiStepForm
                          customerName={customerName}
                          setCustomerName={setCustomerName}
                          customerId={customerId}
                          setCustomerId={setCustomerId}
                          customerEmail={customerEmail}
                          setCustomerEmail={setCustomerEmail}
                          customerPhone={customerPhone}
                          setCustomerPhone={setCustomerPhone}
                          customerAddress={customerAddress}
                          setCustomerAddress={setCustomerAddress}
                          eventDate={eventDate}
                          setEventDate={setEventDate}
                          eventType={eventType}
                          setEventType={setEventType}
                          eventLocation={eventLocation}
                          setEventLocation={setEventLocation}
                          items={items}
                          newItem={newItem}
                          setNewItem={setNewItem}
                          handleAddItem={handleAddItem}
                        />

                        {/* Payment Terms */}
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">Payment Terms</h2>
                          </div>
                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between py-2 border-b">
                              <span className="text-gray-600">Payment Method:</span>
                              <span className="font-medium">EFT/Card/Cash</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                              <span className="text-gray-600">Deposit Required:</span>
                              <span className="font-medium">50% Upfront</span>
                            </div>
                            <div className="flex justify-between py-2">
                              <span className="text-gray-600">Balance Due:</span>
                              <span className="font-medium">Day of Event</span>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* ── RIGHT: Live preview panel ─────────────────────────── */}
                <div className="hidden xl:flex w-[420px] flex-shrink-0 flex-col border-l border-slate-200 bg-slate-100 overflow-hidden">
                  {/* Panel header */}
                  <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 flex-shrink-0">
                    <TemplateSelector
                      selectedTemplate={selectedTemplate}
                      onTemplateChange={setSelectedTemplate}
                    />
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={handlePrint}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <Printer className="w-3 h-3" />
                        Print
                      </button>
                      <button
                        onClick={handleSavePDF}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-violet-600 text-white text-xs font-medium rounded-lg hover:bg-violet-700 transition-colors"
                      >
                        <Download className="w-3 h-3" />
                        PDF
                      </button>
                    </div>
                  </div>

                  {/* Scrollable preview canvas */}
                  <div className="flex-1 overflow-y-auto p-4">
                    <div
                      className="bg-white shadow-lg rounded origin-top"
                      style={{
                        width: "210mm",
                        minHeight: "297mm",
                        transform: "scale(0.44)",
                        transformOrigin: "top left",
                        marginBottom: `calc((297mm * 0.44) - 297mm)`,
                      }}
                    >
                      <TemplateRenderer {...templateProps} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Print / PDF Preview (hidden on-screen) ────────────────────── */}
      <div
        id="print-area"
        className="hidden print:block bg-white shadow-2xl origin-top"
        style={{
          width: "210mm",
          minHeight: "297mm",
          transform: "scale(0.75)",
          transformOrigin: "top center",
        }}
      >
        <TemplateRenderer {...templateProps} />
      </div>
    </div>
  );
};

export default PhotographyDashboard;
