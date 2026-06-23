import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import HomeView from "../HomeView";
import SolidFloAgent from "../../components/SolidFloAgent/SolidFloAgent";
import BusinessSettingsModal from "../BusinessSettingsModal";
import AppHeader from "../AppHeader";
import StampSignatureModal from "../StampSignatureModal";
import { POTemplateRenderer } from "../Purchaseordertemplates";
import HVACSidebar from "./HVACSidebar";
import SubUserManagement from "../SubUserManagement";
import { serverTimestamp } from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth";
import logo from "../../assets/img/solidflo-logo.png";
import FinancialOverview from "../FinancialOverview";
import { usePermissions } from "../../hooks/usePermissions";
import Templates from "./Templates";
import ServiceMarketplaceView from "../ServiceMarketplaceView";
import ServiceRequestsView from "../ServiceRequestsView";
import PurchaseOrders from "../PurchaseOrders";
import { useLocation } from "react-router-dom";
import HvacAIExtractor from "./HvacAIExtractor";
import TemplateSelector, { TemplateRenderer } from "./TemplateSelector";
import uploadLogoToR2 from "../../utils/uploadLogoToR2";
import HVACMultiStepForm from "./HVACMultiStepForm";
import AIInvoiceWindow from "../AIInvoiceWindow";
import StampOverlay from "../StampOverlay";
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
import { db } from "../../firebase";
import CustomerModal from "../CustomerModal";
import CustomersListModal from "../CustomersListModal";
import { Printer, Download } from "lucide-react";
import HvacSystems from "./HvacSystems";
import PartsInventory from "./PartsInventory";
import MaintenanceSchedule from "./MaintenanceSchedule";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Home,
  Stamp,
  Settings,
  Sparkles,
  Users,
  Save,
  Calendar,
  FileText,
  DollarSign,
  Wrench,
  Menu,
  Plus,
  X,
  Send,
  LogOut,
  CheckSquare,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Receipt,
  Wallet,
  ClipboardList,
  Package,
  Eye,
  Wind,
  ArrowRight,
} from "lucide-react";

// ─── Number generators ────────────────────────────────────────────────────────
const generateServiceNumber = async (userId) => {
  const db = getFirestore();
  const year = new Date().getFullYear();
  const servicesRef = collection(db, "users", userId, "invoices");
  const q = query(servicesRef, orderBy("createdAt", "desc"), limit(1));
  const snapshot = await getDocs(q);
  let lastNumber = 1000;
  if (!snapshot.empty) {
    const match = snapshot.docs[0].data().serviceNumber?.match(/(\d+)$/);
    if (match) lastNumber = Number(match[1]);
  }
  return `HVAC-${year}-${String(lastNumber + 1).padStart(4, "0")}`;
};

const generateQuoteNumber = async (userId) => {
  const db = getFirestore();
  const year = new Date().getFullYear();
  const quotesRef = collection(db, "users", userId, "quotations");
  const q = query(quotesRef, orderBy("createdAt", "desc"), limit(1));
  const snapshot = await getDocs(q);
  let lastNumber = 1000;
  if (!snapshot.empty) {
    const match = snapshot.docs[0].data().quoteNumber?.match(/(\d+)$/);
    if (match) lastNumber = Number(match[1]);
  }
  return `QT-${year}-${String(lastNumber + 1).padStart(4, "0")}`;
};

const functions = getFunctions();

// ─── Design tokens (matching MechanicsDashboard) ─────────────────────────────
const inputCls =
  "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md bg-white text-[#1e293b] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#0891b2] focus:border-[#0891b2] transition-colors";
const labelCls =
  "block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5";
const selectCls =
  "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md bg-white text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#0891b2] focus:border-[#0891b2] transition-colors";
// ─── Mobile Bottom Nav ────────────────────────────────────────────────────────
const MobileBottomNav = ({
  activeView,
  setActiveView,
  handleNewInvoice,
  handleNewQuote,
  setShowCustomersListModal,
}) => {
  const navItems = [
    {
      icon: Home,
      label: "Home",
      action: () => setActiveView("home"),
      active: activeView === "home",
    },
    {
      icon: Receipt,
      label: "Invoices",
      action: () => setActiveView("invoice"),
      active: activeView === "invoice" ,
    },
    {
      icon: Plus,
      label: "New",
      action: () => {
        handleNewInvoice();
        setActiveView("invoice");
      },
      active: false,
      isPrimary: true,
    },
    {
      icon: ClipboardList,
      label: "Quotes",
      action: () => {
        handleNewQuote();
        setActiveView("invoice");
      },
      active: false,
    },
    {
      icon: Users,
      label: "Clients",
      action: () => setShowCustomersListModal(true),
      active: false,
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-b from-slate-900 to-slate-950 border-t border-slate-700/60 print:hidden">
      <div className="flex items-center justify-around px-2 py-1 pb-safe">
        {navItems.map(({ icon: Icon, label, action, active, isPrimary }) =>
          isPrimary ? (
            <button
              key={label}
              onClick={action}
              className="flex flex-col items-center justify-center -mt-5"
            >
              <div className="w-14 h-14 bg-[#0891b2] hover:bg-[#0e7490] rounded-full flex items-center justify-center shadow-lg shadow-[#0891b2]/40 border-4 border-slate-950 transition-all active:scale-95">
                <Icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-[10px] text-[#0891b2] font-semibold mt-0.5">
                {label}
              </span>
            </button>
          ) : (
            <button
              key={label}
              onClick={action}
              className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all active:scale-95 min-w-[56px]"
            >
              <div className="relative w-6 h-6 flex items-center justify-center">
                {active && (
                  <span className="absolute inset-0 bg-[#0891b2]/15 rounded-lg" />
                )}
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    active ? "text-[#0891b2]" : "text-slate-500"
                  }`}
                />
              </div>
              <span
                className={`text-[10px] font-medium transition-colors ${
                  active ? "text-[#0891b2]" : "text-slate-500"
                }`}
              >
                {label}
              </span>
            </button>
          )
        )}
      </div>
    </div>
  );
};
const HvacDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [inputMode, setInputMode] = useState("manual");
  const [documentType, setDocumentType] = useState("invoice");
  const [activeView, setActiveView] = useState("home");
  const { user, authUser } = useAuth();
  const [aiWindowOpen, setAiWindowOpen] = useState(false);
  const [aiDocType, setAiDocType] = useState("invoice");
  const [serviceNumber, setServiceNumber] = useState("");
  const [quoteNumber, setQuoteNumber] = useState("");
  const [serviceId, setServiceId] = useState(null);
  const [quoteId, setQuoteId] = useState(null);
  const [showAIWindow, setShowAIWindow] = useState(false);
  const [savedServices, setSavedServices] = useState([]);
  const [savedQuotes, setSavedQuotes] = useState([]);
  const [savedCustomers, setSavedCustomers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const { can, isAdmin } = usePermissions();
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showCustomersListModal, setShowCustomersListModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showServicesList, setShowServicesList] = useState(false);
  const [showQuotesList, setShowQuotesList] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showInvoicesList, setShowInvoicesList] = useState(false);

  // Sidebar accordions
  const [isQuotesOpen, setIsQuotesOpen] = useState(false);
  const [isInvoicesOpen, setIsInvoicesOpen] = useState(false);
  const [isClientsOpen, setIsClientsOpen] = useState(false);
  const [showStampModal, setShowStampModal] = useState(false);
const [stampConfig, setStampConfig] = useState(null);
  // Misc
  const [selectedTemplate, setSelectedTemplate] = useState("professional");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] =
    useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalQuotes: 0,
    totalInvoiced: 0,
    totalClients: 0,
    pendingPayments: 0,
    loading: true,
  });

  const [paymentStatus, setPaymentStatus] = useState({
    totalPaid: 0,
    balanceDue: 0,
    status: "pending",
  });

  // ── Customer fields ──────────────────────────────────────────────────────
  const [customerName, setCustomerName] = useState("ABC Property Management");
  const [customerId, setCustomerId] = useState("CUST-2026-1234");
  const [customerEmail, setCustomerEmail] = useState("contact@abcproperty.com");
  const [customerPhone, setCustomerPhone] = useState("082 123 4567");
  const [customerAddress, setCustomerAddress] = useState(
    "123 Business Park, Johannesburg, 2001",
  );

  // ── HVAC System fields ───────────────────────────────────────────────────
  const [systemType, setSystemType] = useState("Split Air Conditioner");
  const [systemBrand, setSystemBrand] = useState("Daikin");
  const [systemModel, setSystemModel] = useState("FTXS35K");
  const [systemSerial, setSystemSerial] = useState("DKN12345XYZ789");
  const [systemCapacity, setSystemCapacity] = useState("3.5kW / 12000 BTU");
  const [systemLocation, setSystemLocation] = useState(
    "Main Office - Reception Area",
  );

  // ── Items ────────────────────────────────────────────────────────────────
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({
    description: "",
    rate: "",
    qty: "",
    type: "Service",
  });

  // ── Business info ────────────────────────────────────────────────────────
  const [businessInfo, setBusinessInfo] = useState({
    businessName: "ELITE HVAC SERVICES",
    addressLine1: "45 COOLING STREET",
    addressLine2: "INDUSTRIAL PARK",
    city: "JOHANNESBURG",
    postalCode: "2001",
    primaryPhone: "011 234 5678",
    secondaryPhone: "082 345 6789",
    logoUrl: "",
  });

  const location = useLocation();

  // ── Computed totals ──────────────────────────────────────────────────────
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const vat = subtotal * 0.15;
  const total = subtotal + vat;

  // ── Effects ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (location.state?.activeView) setActiveView(location.state.activeView);
  }, [location.state]);

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      setIsMobile(w < 768);
      setSidebarOpen(w >= 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!user?.uid) return;
    const load = async () => {
      const n = await generateServiceNumber(user.uid);
      setServiceNumber(n);
    };
    load();
    loadSavedServices();
  }, [user]);

  useEffect(() => {
    if (!user?.uid) return;
    const load = async () => {
      const n =
        documentType === "quote"
          ? await generateQuoteNumber(user.uid)
          : await generateServiceNumber(user.uid);
      setQuoteNumber(n);
    };
    load();
    loadSavedQuotes();
  }, [user, documentType]);

  useEffect(() => {
    if (user?.uid) {
      loadBusinessInfo();
      loadCustomers();
      fetchBusinessStats();
    }
  }, [user]);

  useEffect(() => {
    if (!serviceId)
      setPaymentStatus({ totalPaid: 0, balanceDue: total, status: "pending" });
  }, [total, serviceId]);

  // ── Data loaders ─────────────────────────────────────────────────────────
  const fetchBusinessStats = async () => {
    if (!user?.uid) return;
    try {
      const db = getFirestore();
      const invoicesSnap = await getDocs(
        collection(db, "users", user.uid, "invoices"),
      );
      let totalInvoiced = 0,
        pendingPayments = 0;
      const invoicesList = [];
      invoicesSnap.forEach((doc) => {
        const d = doc.data();
        const amount = parseFloat(d.totals?.total || 0);
        totalInvoiced += amount;
        if (["pending", "unpaid", "partially_paid"].includes(d.status))
          pendingPayments += parseFloat(d.totals?.due || d.totals?.total || 0);
        invoicesList.push({ id: doc.id, ...d });
      });
      invoicesList.sort((a, b) => {
        const t = (x) => new Date(x.dates?.serviceDate || 0).getTime();
        return t(b) - t(a);
      });
      setInvoices(invoicesList);

      let quoteCount = 0,
        clientCount = 0;
      try {
        quoteCount = (
          await getDocs(collection(db, "users", user.uid, "quotations"))
        ).docs.length;
      } catch (_) {}
      try {
        const cSnap = await getDocs(
          collection(db, "users", user.uid, "clients"),
        );
        clientCount = cSnap.docs.length;
        setSavedCustomers(cSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (_) {}

      setStats({
        totalInvoices: invoicesSnap.docs.length,
        totalQuotes: quoteCount,
        totalInvoiced,
        totalClients: clientCount,
        pendingPayments,
        loading: false,
      });
    } catch (_) {
      setStats((p) => ({ ...p, loading: false }));
    }
  };

  const loadBusinessInfo = async () => {
    if (!user?.uid) return;
    try {
      const db = getFirestore();
      const snap = await getDoc(
        doc(db, "users", user.uid, "settings", "businessInfo"),
      );
      if (snap.exists()) setBusinessInfo(snap.data());
    } catch (_) {
    } finally {
      setLoading(false);
    }
  };

  const loadCustomers = async () => {
    try {
      const q = query(
        collection(db, "users", user.uid, "clients"),
        orderBy("createdAt", "desc"),
      );
      const snap = await getDocs(q);
      setCustomers(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    } catch (_) {}
  };

  const loadSavedServices = async () => {
    if (!user?.uid) return;
    const db = getFirestore();
    const snap = await getDocs(
      query(
        collection(db, "users", user.uid, "invoices"),
        orderBy("createdAt", "desc"),
        limit(50),
      ),
    );
    setSavedServices(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  const loadSavedQuotes = async () => {
    if (!user?.uid) return;
    const db = getFirestore();
    const snap = await getDocs(
      query(
        collection(db, "users", user.uid, "quotations"),
        orderBy("createdAt", "desc"),
        limit(50),
      ),
    );
    setSavedQuotes(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  // ── Customer handlers ─────────────────────────────────────────────────────
  const handleAddNewCustomer = () => {
    setSelectedCustomer(null);
    setShowCustomerModal(true);
  };
  const handleEditCustomer = (c) => {
    setSelectedCustomer(c);
    setShowCustomerModal(true);
  };
  const handleCustomerSaved = () => loadCustomers();

  const loadCustomer = (c) => {
    setCustomerName(c.name || "");
    setCustomerEmail(c.email || "");
    setCustomerPhone(c.phone || "");
    setCustomerAddress(c.address || "");
    setCustomerId(c.customerId || "");
  };

  // ── Service/Quote loaders ─────────────────────────────────────────────────
  const loadService = (s) => {
    setServiceId(s.id);
    setServiceNumber(s.serviceNumber || "");
    setCustomerName(s.customer?.name || "");
    setCustomerEmail(s.customer?.email || "");
    setCustomerPhone(s.customer?.phone || "");
    setCustomerAddress(s.customer?.address || "");
    setCustomerId(s.customer?.customerId || "");
    setSystemType(s.system?.type || "");
    setSystemBrand(s.system?.brand || "");
    setSystemModel(s.system?.model || "");
    setSystemSerial(s.system?.serialNumber || "");
    setSystemCapacity(s.system?.capacity || "");
    setSystemLocation(s.system?.location || "");
    setItems(s.items || []);
    setPaymentStatus({
      totalPaid: s.totals?.paid || 0,
      balanceDue: s.totals?.due || s.totals?.total || 0,
      status: s.status || "pending",
    });
    setShowServicesList(false);
    setActiveView("invoice");
  };

  const loadQuote = (q) => {
    setQuoteId(q.id);
    setQuoteNumber(q.quoteNumber || "");
    setCustomerName(q.customer?.name || "");
    setCustomerEmail(q.customer?.email || "");
    setCustomerPhone(q.customer?.phone || "");
    setCustomerAddress(q.customer?.address || "");
    setCustomerId(q.customer?.customerId || "");
    setSystemType(q.system?.type || "");
    setSystemBrand(q.system?.brand || "");
    setSystemModel(q.system?.model || "");
    setSystemSerial(q.system?.serialNumber || "");
    setSystemCapacity(q.system?.capacity || "");
    setSystemLocation(q.system?.location || "");
    setItems(q.items || []);
    setShowQuotesList(false);
    setActiveView("invoice");
  };

  // ── AI extractor ──────────────────────────────────────────────────────────
  const handleAIDataExtracted = (data) => {
    if (data.customer.name) setCustomerName(data.customer.name);
    if (data.customer.email) setCustomerEmail(data.customer.email);
    if (data.customer.phone) setCustomerPhone(data.customer.phone);
    if (data.customer.address) setCustomerAddress(data.customer.address);
    if (data.customer.customerId) setCustomerId(data.customer.customerId);
    if (data.system.type) setSystemType(data.system.type);
    if (data.system.brand) setSystemBrand(data.system.brand);
    if (data.system.model) setSystemModel(data.system.model);
    if (data.system.serialNumber) setSystemSerial(data.system.serialNumber);
    if (data.system.capacity) setSystemCapacity(data.system.capacity);
    if (data.system.location) setSystemLocation(data.system.location);
    if (data.items?.length > 0) setItems(data.items);
    alert("✅ HVAC service data extracted and populated successfully!");
  };

  // ── Item handlers ─────────────────────────────────────────────────────────
  const handleAddItem = () => {
    if (!newItem.description || !newItem.qty) return;
    const rate = Number(newItem.rate) || 0;
    const qty = Number(newItem.qty);
    setItems((prev) => [
      ...prev,
      {
        description: newItem.description,
        type: newItem.type || "Service",
        rate,
        qty,
        amount: rate * qty,
      },
    ]);
    setNewItem({ description: "", rate: "", qty: "", type: "Service" });
  };

  const handleRemoveItem = (index) =>
    setItems((prev) => prev.filter((_, i) => i !== index));

  // ── Payload builder ───────────────────────────────────────────────────────
  const buildPayload = (numberToUse) => ({
    [documentType === "quote" ? "quoteNumber" : "serviceNumber"]: numberToUse,
    documentType,
    locked: true,
    status: "pending",
    dates: { serviceDate: new Date().toISOString(), completedDate: null },
    customer: {
      name: customerName,
      email: customerEmail,
      phone: customerPhone,
      address: customerAddress,
      customerId,
    },
    system: {
      type: systemType,
      brand: systemBrand,
      model: systemModel,
      serialNumber: systemSerial,
      capacity: systemCapacity,
      location: systemLocation,
    },
    items,
    totals: { subtotal, vat, total, paid: 0, due: total },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // ── Save handlers ─────────────────────────────────────────────────────────
  const handleSaveQuote = async () => {
    if (!user?.uid) return;
    const db = getFirestore();
    const collectionName = documentType === "quote" ? "quotations" : "invoices";
    let numberToUse = quoteNumber;
    if (!quoteId) {
      numberToUse =
        documentType === "quote"
          ? await generateQuoteNumber(user.uid)
          : await generateServiceNumber(user.uid);
      setQuoteNumber(numberToUse);
    }
    const data = buildPayload(numberToUse);
    if (quoteId) {
      await updateDoc(doc(db, "users", user.uid, collectionName, quoteId), {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } else {
      const ref = await addDoc(
        collection(db, "users", user.uid, collectionName),
        data,
      );
      setQuoteId(ref.id);
    }
    alert(`${documentType === "quote" ? "Quote" : "Invoice"} saved and locked`);
    if (documentType === "quote") setShowConvertModal(true);
    loadSavedQuotes();
    fetchBusinessStats();
  };

  // ── Convert to invoice ────────────────────────────────────────────────────
  const handleConvertToInvoice = async () => {
    if (!user?.uid || !quoteId) return;
    try {
      const db = getFirestore();
      const invoiceNumber = await generateServiceNumber(user.uid);
      const quoteRef = doc(db, "users", user.uid, "quotations", quoteId);
      const quoteSnap = await getDoc(quoteRef);
      if (!quoteSnap.exists()) {
        alert("Quote not found");
        return;
      }
      const quoteData = quoteSnap.data();
      const invoiceData = {
        ...quoteData,
        serviceNumber: invoiceNumber,
        documentType: "invoice",
        convertedFrom: quoteId,
        originalQuoteNumber: quoteData.quoteNumber,
        dates: { ...quoteData.dates, invoiceDate: new Date().toISOString() },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      delete invoiceData.quoteNumber;
      const invoiceRef = await addDoc(
        collection(db, "users", user.uid, "invoices"),
        invoiceData,
      );
      await updateDoc(quoteRef, {
        convertedToInvoice: true,
        serviceId: invoiceRef.id,
        invoiceNumber,
        updatedAt: serverTimestamp(),
      });
      alert(`Quote converted to Invoice ${invoiceNumber} successfully!`);
      setDocumentType("invoice");
      setQuoteId(invoiceRef.id);
      setQuoteNumber(invoiceNumber);
      setShowConvertModal(false);
    } catch (_) {
      alert("Failed to convert quote to invoice");
    }
  };

  // ── New doc handlers ──────────────────────────────────────────────────────
  const resetFields = () => {
    setServiceId(null);
    setQuoteId(null);
    setCustomerName("ABC Property Management");
    setCustomerId("CUST-2026-1234");
    setCustomerEmail("contact@abcproperty.com");
    setCustomerPhone("082 123 4567");
    setCustomerAddress("123 Business Park, Johannesburg, 2001");
    setSystemType("Split Air Conditioner");
    setSystemBrand("Daikin");
    setSystemModel("FTXS35K");
    setSystemSerial("DKN12345XYZ789");
    setSystemCapacity("3.5kW / 12000 BTU");
    setSystemLocation("Main Office - Reception Area");
    setItems([]);
  };

  const handleNewInvoice = () => {
    setDocumentType("invoice");
    resetFields();
    generateServiceNumber(user?.uid).then(setServiceNumber);
  };
  const handleNewQuote = () => {
    setDocumentType("quote");
    resetFields();
    generateQuoteNumber(user?.uid).then(setQuoteNumber);
  };

  // ── Print / PDF ───────────────────────────────────────────────────────────
  const printStyles = `@media print { * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } html,body { margin:0!important;padding:0!important;width:210mm!important;background:white!important; } body * { visibility:hidden!important; } #print-area,#print-area * { visibility:visible!important; } #print-area { display:block!important;position:absolute!important;left:0!important;top:0!important;width:210mm!important;min-height:297mm!important;margin:0!important;padding:0!important;background:white!important; } @page { size:A4 portrait;margin:40px!important; } }`;

  const handlePrint = () => {
    const s = document.createElement("style");
    s.textContent = printStyles;
    document.head.appendChild(s);
    window.print();
    setTimeout(() => document.head.removeChild(s), 1000);
  };

  const handleSavePDF = async () => {
    if (!serviceId && !quoteId) {
      alert("Please save the document before exporting PDF");
      return;
    }
    setTimeout(() => window.print(), 300);
  };

  // ── Logout ────────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    try {
      await signOut(getAuth());
    } catch (_) {}
  };

  // ── Header actions ────────────────────────────────────────────────────────
  const headerActions = [
    documentType === "quote" &&
      quoteId && {
        label: "Convert to Invoice",
        icon: FileText,
        onClick: handleConvertToInvoice,
        className:
          "flex items-center gap-1.5 px-3 py-1.5 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm font-medium rounded-md transition-colors whitespace-nowrap",
      },
    isAdmin && {
      label: "Team",
      icon: Users,
      onClick: () => setShowUserManagement(true),
      className:
        "flex items-center gap-1.5 px-3 py-1.5 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm font-medium rounded-md transition-colors whitespace-nowrap",
    },
    {
      label: "Preview",
      icon: Eye,
      onClick: () => setShowPreview(true),
      className:
        "flex items-center gap-1.5 px-3 py-1.5 bg-[#0f172a] hover:bg-[#1e293b] text-white text-sm font-medium rounded-md transition-colors whitespace-nowrap",
    },
    {
      label: "Print",
      icon: Printer,
      onClick: handlePrint,
      variant: "secondary",
    },
    {
      label: "New",
      icon: Plus,
      onClick: documentType === "quote" ? handleNewQuote : handleNewInvoice,
      className:
        "flex items-center gap-1.5 px-3 py-1.5 bg-[#059669] hover:bg-[#047857] text-white text-sm font-medium rounded-md transition-colors whitespace-nowrap",
    },
    {
      label: "Send",
      icon: Send,
      className:
        "flex items-center gap-1.5 px-3 py-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium rounded-md transition-colors whitespace-nowrap",
    },
    {
      label: "Save PDF",
      icon: Download,
      onClick: handleSavePDF,
      className:
        "flex items-center gap-1.5 px-3 py-1.5 bg-[#0891b2] hover:bg-[#0e7490] text-white text-sm font-medium rounded-md transition-colors whitespace-nowrap",
    },
    {
      label: "Save",
      icon: Save,
      onClick: handleSaveQuote,
      className:
        "flex items-center gap-1.5 px-3 py-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium rounded-md transition-colors whitespace-nowrap",
    },
  ].filter(Boolean);

  const mobileDashboardActions = [
    documentType === "quote" &&
      quoteId && {
        label: "To Invoice",
        icon: FileText,
        onClick: handleConvertToInvoice,
        className:
          "flex items-center gap-1.5 px-3 py-2 bg-[#7c3aed] text-white rounded-md text-xs font-medium active:scale-95 whitespace-nowrap",
      },
    {
      label: "Save",
      icon: Save,
      onClick: handleSaveQuote,
      className:
        "flex items-center gap-1.5 px-3 py-2 bg-[#2563eb] text-white rounded-md text-xs font-medium active:scale-95 whitespace-nowrap",
    },
    {
      label: "Send",
      icon: Send,
      className:
        "flex items-center gap-1.5 px-3 py-2 bg-[#059669] text-white rounded-md text-xs font-medium active:scale-95 whitespace-nowrap",
    },
    {
      label: "PDF",
      icon: Download,
      onClick: handleSavePDF,
      className:
        "flex items-center gap-1.5 px-3 py-2 bg-[#0891b2] text-white rounded-md text-xs font-medium active:scale-95 whitespace-nowrap",
    },
    {
      label: "Print",
      icon: Printer,
      onClick: handlePrint,
      className:
        "flex items-center gap-1.5 px-3 py-2 bg-white border border-[#e2e8f0] text-[#374151] rounded-md text-xs font-medium active:scale-95 whitespace-nowrap",
    },
  ].filter(Boolean);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const formatCurrency = (n) =>
    new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
    }).format(n);

  const statusBadge = (s) =>
    s === "paid"
      ? "bg-[#dcfce7] text-[#166534]"
      : s === "partially_paid"
        ? "bg-[#fef3c7] text-[#92400e]"
        : s === "pending"
          ? "bg-[#dbeafe] text-[#1e40af]"
          : "bg-[#fef2f2] text-[#991b1b]";

  // ── Template props ────────────────────────────────────────────────────────
  const templateProps = {
    templateId: selectedTemplate,
    businessInfo,
    loading,
    jobCardNumber: documentType === "quote" ? quoteNumber : serviceNumber,
    customerName,
    customerEmail,
    customerPhone,
    customerAddress,
    equipmentType: systemType,
    equipmentManufacturer: systemBrand,
    equipmentModel: systemModel,
    equipmentSerial: systemSerial,
    equipmentId: systemCapacity,
    equipmentLocation: systemLocation,
    items,
    subtotal,
    vat,
    total,
    serviceCode: "HVAC-12345",
    serviceType: "HVAC",
    documentType,
    paymentStatus,
    stampConfig,
  };

  // ── Stat card ─────────────────────────────────────────────────────────────
  const StatCard = ({
    title,
    value,
    icon: Icon,
    iconBg,
    iconColor,
    subtitle,
    loading: l,
    trend,
  }) => (
    <div className="bg-white rounded-xl p-4 border border-[#e2e8f0] shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconBg}`}
        >
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
        {trend !== undefined && (
          <span
            className={`flex items-center gap-0.5 text-xs font-semibold ${trend > 0 ? "text-[#059669]" : "text-[#dc2626]"}`}
          >
            {trend > 0 ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div>
        <p className="text-xs text-[#64748b] mb-0.5">{title}</p>
        {l ? (
          <div className="h-6 bg-[#f1f5f9] rounded animate-pulse" />
        ) : (
          <>
            <p className="text-lg font-bold text-[#1e293b] truncate">{value}</p>
            {subtitle && (
              <p className="text-xs text-[#94a3b8] mt-0.5">{subtitle}</p>
            )}
          </>
        )}
      </div>
    </div>
  );

  // ── Home view ─────────────────────────────────────────────────────────────
  const HomeViewLocal = () => (
    <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          title="Invoices"
          value={stats.totalInvoices}
          icon={FileText}
          iconBg="bg-[#eff6ff]"
          iconColor="text-[#2563eb]"
          subtitle="All time"
          loading={stats.loading}
          trend={12}
        />
        <StatCard
          title="Quotes"
          value={stats.totalQuotes}
          icon={Receipt}
          iconBg="bg-[#f0fdfa]"
          iconColor="text-[#0891b2]"
          subtitle="Generated"
          loading={stats.loading}
        />
        <StatCard
          title="Revenue"
          value={formatCurrency(stats.totalInvoiced)}
          icon={TrendingUp}
          iconBg="bg-[#f0fdf4]"
          iconColor="text-[#059669]"
          subtitle="Total invoiced"
          loading={stats.loading}
          trend={8}
        />
        <StatCard
          title="Clients"
          value={stats.totalClients}
          icon={Users}
          iconBg="bg-[#fff7ed]"
          iconColor="text-[#ea580c]"
          subtitle="Active"
          loading={stats.loading}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 bg-[#fff7ed] rounded-lg flex items-center justify-center flex-shrink-0">
            <Receipt className="w-5 h-5 text-[#ea580c]" />
          </div>
          <div>
            <p className="text-xs text-[#64748b] mb-0.5">Pending Payments</p>
            {stats.loading ? (
              <div className="h-6 bg-[#f1f5f9] rounded animate-pulse w-32" />
            ) : (
              <>
                <p className="text-xl font-bold text-[#ea580c]">
                  {formatCurrency(stats.pendingPayments)}
                </p>
                <p className="text-xs text-[#94a3b8]">Outstanding invoices</p>
              </>
            )}
          </div>
        </div>

        <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-widest mb-3">
            Quick Actions
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            {[
              {
                label: "New Invoice",
                icon: FileText,
                onClick: () => {
                  handleNewInvoice();
                  setActiveView("invoice");
                },
                bg: "bg-[#eff6ff]",
                hover: "hover:bg-[#dbeafe]",
                border: "border-[#bfdbfe]",
                iconBg: "bg-[#2563eb]",
                text: "text-[#1e40af]",
              },
              {
                label: "New Quote",
                icon: Receipt,
                onClick: () => {
                  handleNewQuote();
                  setActiveView("invoice");
                },
                bg: "bg-[#f0fdfa]",
                hover: "hover:bg-[#ccfbf1]",
                border: "border-[#99f6e4]",
                iconBg: "bg-[#0891b2]",
                text: "text-[#0e7490]",
              },
              {
                label: "Clients",
                icon: Users,
                onClick: () => setShowCustomersListModal(true),
                bg: "bg-[#f0fdf4]",
                hover: "hover:bg-[#dcfce7]",
                border: "border-[#bbf7d0]",
                iconBg: "bg-[#059669]",
                text: "text-[#166534]",
              },
            ].map(
              ({
                label,
                icon: Icon,
                onClick,
                bg,
                hover,
                border,
                iconBg,
                text,
              }) => (
                <button
                  key={label}
                  onClick={onClick}
                  className={`flex-1 flex items-center justify-between px-3 py-2.5 ${bg} ${hover} border ${border} rounded-lg transition-all group`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-6 h-6 ${iconBg} rounded flex items-center justify-center flex-shrink-0`}
                    >
                      <Icon className="w-3 h-3 text-white" />
                    </div>
                    <span className={`text-xs font-semibold ${text}`}>
                      {label}
                    </span>
                  </div>
                  <ArrowRight
                    className={`w-3 h-3 ${text} opacity-60 group-hover:translate-x-0.5 transition-transform`}
                  />
                </button>
              ),
            )}
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#e2e8f0] bg-[#f8fafc]">
          <h3 className="text-sm font-semibold text-[#1e293b]">
            Recent Invoices
          </h3>
          <button
            onClick={() => setShowInvoicesList(true)}
            className="text-xs text-[#2563eb] hover:text-[#1d4ed8] font-medium"
          >
            View all
          </button>
        </div>
        <div className="divide-y divide-[#f1f5f9]">
          {stats.loading ? (
            [1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-14 bg-[#f8fafc] animate-pulse m-3 rounded-lg"
              />
            ))
          ) : invoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-10 h-10 mb-3 bg-[#f1f5f9] rounded-full flex items-center justify-center">
                <FileText className="w-5 h-5 text-[#94a3b8]" />
              </div>
              <p className="text-sm font-medium text-[#374151] mb-1">
                No invoices yet
              </p>
              <p className="text-xs text-[#94a3b8] mb-3">
                Create your first invoice to get started
              </p>
              <button
                onClick={() => {
                  handleNewInvoice();
                  setActiveView("invoice");
                }}
                className="px-4 py-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-lg text-xs font-medium transition-colors"
              >
                Create Invoice
              </button>
            </div>
          ) : (
            invoices.slice(0, 8).map((inv) => (
              <div
                key={inv.id}
                onClick={() => loadService(inv)}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-[#f8fafc] cursor-pointer transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-[#1e293b] truncate">
                      {inv.serviceNumber || inv.id}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-semibold flex-shrink-0 ${statusBadge(inv.status)}`}
                    >
                      {inv.status === "partially_paid"
                        ? "Partial"
                        : inv.status || "Draft"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[#64748b]">
                    <span className="flex items-center gap-1 truncate">
                      <Users className="w-3 h-3 flex-shrink-0" />
                      {inv.customer?.name || "No customer"}
                    </span>
                    <span className="flex items-center gap-1 truncate">
                      <Wind className="w-3 h-3 flex-shrink-0" />
                      {[inv.system?.brand, inv.system?.model]
                        .filter(Boolean)
                        .join(" ") || "No system"}
                    </span>
                  </div>
                </div>
                <div className="text-right ml-4 flex-shrink-0">
                  <div className="text-sm font-bold text-[#1e293b]">
                    {formatCurrency(inv.totals?.total || 0)}
                  </div>
                  {inv.totals?.due > 0 &&
                    inv.totals?.due < inv.totals?.total && (
                      <div className="text-xs text-[#d97706]">
                        Due: {formatCurrency(inv.totals.due)}
                      </div>
                    )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div className="h-screen w-full overflow-hidden flex flex-col bg-[#f0f2f5]">
      {/* Print area */}
      <div
        id="print-area"
        className="hidden print:block bg-white"
        style={{ position: "relative", width: "210mm", minHeight: "297mm" }}
      >
        <TemplateRenderer {...templateProps} />
        <StampOverlay stampConfig={stampConfig} pageNumber={1} businessInfo={businessInfo} />
      </div>
      {showAIWindow && (
        <AIInvoiceWindow
          user={user}
          businessInfo={businessInfo}
          documentType={documentType}
          onExit={() => setShowAIWindow(false)}
          industry="hvac"
          TemplateRenderer={TemplateRenderer}
        />
      )}
      <div className="flex-1 flex overflow-hidden min-h-0">
       <HVACSidebar
  user={user}
  activeView={activeView}
  setActiveView={setActiveView}
  sidebarOpen={sidebarOpen}
  setSidebarOpen={setSidebarOpen}
  setShowSettings={setShowSettings}
  handleNewQuote={handleNewQuote}
  handleNewService={handleNewInvoice}
  handleAddNewCustomer={handleAddNewCustomer}
  businessInfo={businessInfo}
  savedQuotes={savedQuotes}
  savedServices={savedServices}
  savedCustomers={savedCustomers}
  showServicesList={showInvoicesList}
  setShowServicesList={setShowInvoicesList}
  showQuotesList={showQuotesList}
  setShowQuotesList={setShowQuotesList}
  setShowCustomersListModal={setShowCustomersListModal}
  handleLogout={handleLogout}
  newRequestCount={0}
/>

        {/* ── Main content ───────────────────────────────────────────────── */}
       <div className={`flex-1 overflow-hidden flex flex-col min-h-0 transition-all duration-300 ${sidebarOpen ? "md:ml-2" : "md:ml-4"}`}>
          <AppHeader
            actions={headerActions}
            mobileActions={mobileDashboardActions}
            onSettingsOpen={() => setShowSettings(true)}
          />
          {/* ── Modals ─────────────────────────────────────────────────── */}
          {showSettings && (
            <BusinessSettingsModal onClose={() => setShowSettings(false)} />
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
          {/* Convert to invoice modal */}
          {showConvertModal && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-[#e2e8f0]">
                <h2 className="text-base font-semibold text-[#1e293b] mb-2">
                  Quote Saved Successfully!
                </h2>
                <p className="text-sm text-[#64748b] mb-5">
                  Would you like to convert this quote to an invoice?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleConvertToInvoice}
                    className="flex-1 bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Convert to Invoice
                  </button>
                  <button
                    onClick={() => setShowConvertModal(false)}
                    className="flex-1 bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#374151] px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Later
                  </button>
                </div>
              </div>
            </div>
          )}
          {showStampModal && (
  <StampSignatureModal
    isOpen={showStampModal}
    onClose={() => setShowStampModal(false)}
    onConfirm={(cfg) => {
      setStampConfig(cfg);
      setShowStampModal(false);
    }}
    previewContent={
      activeView === "purchase-orders"
        ? <POTemplateRenderer  />
        : <TemplateRenderer {...templateProps} />
    }
    businessInfo={businessInfo}
    existingConfig={stampConfig}
  />
)}
          {/* All invoices modal */}
          {showInvoicesList && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden border border-[#e2e8f0]">
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0] bg-[#f8fafc]">
                  <div>
                    <h2 className="text-base font-semibold text-[#1e293b]">
                      All {documentType === "quote" ? "Quotes" : "Invoices"}
                    </h2>
                    <p className="text-xs text-[#64748b] mt-0.5">
                      {savedServices.length} records
                    </p>
                  </div>
                  <button
                    onClick={() => setShowInvoicesList(false)}
                    className="p-1.5 text-[#64748b] hover:text-[#1e293b] hover:bg-[#e2e8f0] rounded-lg transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {savedServices.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <Receipt className="w-10 h-10 text-[#cbd5e1] mb-3" />
                      <p className="text-sm text-[#94a3b8]">No records found</p>
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead>
                        <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                          {[
                            "Number",
                            "Client",
                            "System",
                            "Total",
                            "Status",
                          ].map((h) => (
                            <th
                              key={h}
                              className="px-5 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wide"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {savedServices.map((s) => (
                          <tr
                            key={s.id}
                            onClick={() => {
                              loadService(s);
                              setShowInvoicesList(false);
                            }}
                            className="border-b border-[#f1f5f9] hover:bg-[#f8fafc] cursor-pointer transition-colors"
                          >
                            <td className="px-5 py-3 text-sm font-semibold text-[#2563eb]">
                              {s.serviceNumber || "N/A"}
                            </td>
                            <td className="px-5 py-3 text-sm text-[#374151]">
                              {s.customer?.name || "N/A"}
                            </td>
                            <td className="px-5 py-3 text-sm text-[#374151]">
                              {[s.system?.brand, s.system?.model]
                                .filter(Boolean)
                                .join(" ") || "N/A"}
                            </td>
                            <td className="px-5 py-3 text-sm font-semibold text-[#1e293b]">
                              {formatCurrency(s.totals?.total || 0)}
                            </td>
                            <td className="px-5 py-3">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${statusBadge(s.status)}`}
                              >
                                {s.status === "partially_paid"
                                  ? "Partial"
                                  : s.status || "Pending"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}
          {/* Preview modal */}
          {showPreview && (
            <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#e2e8f0] bg-[#f8fafc] flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-[#0f172a] rounded-lg flex items-center justify-center">
                      <Eye className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold text-[#1e293b]">
                        {documentType === "quote" ? "Quote" : "Invoice"} Preview
                      </h2>
                      <p className="text-xs text-[#64748b]">
                        {quoteNumber || "Draft"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrint}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-medium rounded-lg transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Print
                    </button>
                    <button
                      onClick={handleSavePDF}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#059669] hover:bg-[#047857] text-white text-xs font-medium rounded-lg transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Save PDF
                    </button>
                    <button
                      onClick={() => setShowPreview(false)}
                      className="p-1.5 text-[#64748b] hover:text-[#1e293b] hover:bg-[#e2e8f0] rounded-lg transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto bg-[#e2e8f0] p-6">
                  <div
                    className="mx-auto bg-white shadow-xl"
                    style={{ position: "relative", width: "210mm", minHeight: "297mm" }}
                  >
                    <TemplateRenderer {...templateProps} />
                    <StampOverlay stampConfig={stampConfig} pageNumber={1} businessInfo={businessInfo} />
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* ── Views ─────────────────────────────────────────────────── */}
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
          {activeView === "templates" && (
            <div className="flex-1 overflow-y-auto p-4">
              <Templates user={user} />
            </div>
          )}
          {activeView === "financial-overview" && (
            <div className="flex-1 overflow-y-auto p-4">
              <FinancialOverview user={user} />
            </div>
          )}
          {activeView === "purchase-orders" && (
            <div className="flex-1 overflow-y-auto p-6">
              <PurchaseOrders user={user} />
            </div>
          )}{" "}
          {activeView === "hvac-systems" && (
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              <HvacSystems user={user} />
            </div>
          )}
          {activeView === "inventory" && (
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              <PartsInventory user={user} />
            </div>
          )}
          {activeView === "schedule" && (
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              <MaintenanceSchedule user={user} />
            </div>
          )}
          {activeView === "marketplace" && (
  <div className="flex-1 overflow-y-auto p-6">
    <ServiceMarketplaceView user={user} businessInfo={businessInfo} />
  </div>
)}

{activeView === "incoming-requests" && (
  <div className="flex-1 overflow-y-auto p-6">
    <ServiceRequestsView user={user} businessInfo={businessInfo} />
  </div>
)}
          {/* ── Invoice builder — split layout ─────────────────────────── */}
          {activeView === "invoice" && (
            <div className="flex-1 overflow-hidden flex min-h-0">
              {/* LEFT: Form panel */}
              <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 min-w-0">
                <div className="space-y-5">
                  {/* Summary stat cards */}
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      {
                        label: "Total Amount",
                        value: `R${total.toFixed(2)}`,
                        icon: Receipt,
                        iconBg: "bg-[#eff6ff]",
                        iconColor: "text-[#2563eb]",
                        textColor: "text-[#1e293b]",
                      },
                      {
                        label: "Paid",
                        value: `R${paymentStatus.totalPaid.toFixed(2)}`,
                        icon: CheckSquare,
                        iconBg:
                          paymentStatus.totalPaid > 0
                            ? "bg-[#dcfce7]"
                            : "bg-[#f1f5f9]",
                        iconColor:
                          paymentStatus.totalPaid > 0
                            ? "text-[#059669]"
                            : "text-[#94a3b8]",
                        textColor:
                          paymentStatus.totalPaid > 0
                            ? "text-[#059669]"
                            : "text-[#1e293b]",
                      },
                      {
                        label: "Balance Due",
                        value: `R${paymentStatus.balanceDue.toFixed(2)}`,
                        icon: Wallet,
                        iconBg:
                          paymentStatus.balanceDue <= 0
                            ? "bg-[#dcfce7]"
                            : "bg-[#fef2f2]",
                        iconColor:
                          paymentStatus.balanceDue <= 0
                            ? "text-[#059669]"
                            : "text-[#dc2626]",
                        textColor:
                          paymentStatus.balanceDue <= 0
                            ? "text-[#059669]"
                            : "text-[#dc2626]",
                      },
                    ].map(
                      ({
                        label,
                        value,
                        icon: Icon,
                        iconBg,
                        iconColor,
                        textColor,
                      }) => (
                        <div
                          key={label}
                          className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-semibold text-[#64748b] uppercase tracking-wide">
                              {label}
                            </span>
                            <div
                              className={`w-8 h-8 ${iconBg} rounded-lg flex items-center justify-center`}
                            >
                              <Icon className={`w-4 h-4 ${iconColor}`} />
                            </div>
                          </div>
                          <div className={`text-xl font-bold ${textColor}`}>
                            {value}
                          </div>
                        </div>
                      ),
                    )}
                  </div>

                  {/* Main input card */}
                  <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
                    {/* Input mode tabs */}
                    <div className="flex border-b border-[#e2e8f0] bg-[#f8fafc]">
                      <button
                        onClick={() => setInputMode("manual")}
                        className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all border-b-2 -mb-px ${inputMode === "manual" ? "border-[#0891b2] text-[#0891b2] bg-white" : "border-transparent text-[#64748b] hover:text-[#374151]"}`}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                        Manual Entry
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

                    {inputMode === "ai" && (
                      <div className="p-6 border-b border-[#e2e8f0]">
                        <HvacAIExtractor
                          onDataExtracted={handleAIDataExtracted}
                          documentType={documentType}
                        />
                      </div>
                    )}

                    {inputMode === "manual" && (
                      <div className="p-6">
                        <HVACMultiStepForm
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
                          systemType={systemType}
                          setSystemType={setSystemType}
                          systemBrand={systemBrand}
                          setSystemBrand={setSystemBrand}
                          systemModel={systemModel}
                          setSystemModel={setSystemModel}
                          systemSerial={systemSerial}
                          setSystemSerial={setSystemSerial}
                          systemCapacity={systemCapacity}
                          setSystemCapacity={setSystemCapacity}
                          systemLocation={systemLocation}
                          setSystemLocation={setSystemLocation}
                          items={items}
                          newItem={newItem}
                          setNewItem={setNewItem}
                          handleAddItem={handleAddItem}
                          handleRemoveItem={handleRemoveItem}
                          onSave={handleSaveQuote}
                          documentType={documentType}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* RIGHT: Live preview panel */}
              <div className="hidden xl:flex w-[420px] flex-shrink-0 flex-col border-l border-[#e2e8f0] bg-[#e8eaed] overflow-hidden">
                {/* Panel header */}
                <div className="flex items-center justify-between px-4 py-3 bg-[#f8fafc] border-b border-[#e2e8f0] flex-shrink-0">
                  <TemplateSelector
                    user={user}
                    selectedTemplate={selectedTemplate}
                    onTemplateChange={setSelectedTemplate}
                  />
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handlePrint}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-[#e2e8f0] text-[#374151] text-xs font-medium rounded-lg hover:bg-[#f1f5f9] transition-colors"
                    >
                      <Printer className="w-3 h-3" />
                      Print
                    </button>
                    <button
                      onClick={handleSavePDF}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-[#0891b2] text-white text-xs font-medium rounded-lg hover:bg-[#0e7490] transition-colors"
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
                      position: "relative",
                      width: "210mm",
                      minHeight: "297mm",
                      transform: "scale(0.44)",
                      transformOrigin: "top left",
                      marginBottom: `calc((297mm * 0.44) - 297mm)`,
                    }}
                  >
                    <TemplateRenderer {...templateProps} />
                    <StampOverlay stampConfig={stampConfig} pageNumber={1} businessInfo={businessInfo} />

                  </div>
                </div>
                {/* ── Stamp button footer ── */}
<div className="flex-shrink-0 px-4 py-3 bg-[#f8fafc] border-t border-[#e2e8f0]">
  <button
    onClick={() => setShowStampModal(true)}
    className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-[#ce1414] hover:bg-[#b01212] text-white text-sm font-medium rounded-lg transition-colors"
  >
    <Stamp className="w-4 h-4" />
    Stamp &amp; Signature
  </button>
</div>
              </div>
            </div>
          )}
        </div>
      </div>
       <MobileBottomNav
      activeView={activeView}
      setActiveView={setActiveView}
      handleNewInvoice={handleNewInvoice}
      handleNewQuote={handleNewQuote}
      setShowCustomersListModal={setShowCustomersListModal}
    />
    <SolidFloAgent industry="hvac" />
    </div>
  );
};

export default HvacDashboard;
