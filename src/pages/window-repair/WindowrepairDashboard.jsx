import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import HomeView from "../HomeView";
import BusinessSettingsModal from "../BusinessSettingsModal";
import AppHeader from "../AppHeader";
import { serverTimestamp } from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth";
import FinancialOverview from "../FinancialOverview";
import uploadLogoToR2 from "../../utils/uploadLogoToR2";
import Templates from "./Templates";
import PurchaseOrders from "../PurchaseOrders";
import { useLocation } from "react-router-dom";
import TemplateSelector, { TemplateRenderer } from "./TemplateSelector";
import PaymentProcessor from "../../components/dashboard/PaymentProcessor";
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
import {
  Printer,
  Download,
  Sparkles,
  Trash2,
  Wrench,
  TrendingDown,
  ArrowRight,
} from "lucide-react";
import { db } from "../../firebase";
import CustomerModal from "../CustomerModal";
import CustomersListModal from "../CustomersListModal";
import HistoryView from "./HistoryView";
import NotesView from "./NotesView";
import AIInvoiceWindow from '../AIInvoiceWindow';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Home,
  Settings,
  Users,
  Calendar,
  X,
  FileText,
  BarChart3,
  Menu,
  Plus,
  Send,
  Save,
  Edit,
  LogOut,
  CheckSquare,
  TrendingUp,
  CreditCard,
  Receipt,
  Wallet,
  DollarSign,
  Eye,
  Grid3x3,
  ClipboardList,
} from "lucide-react";

const generateQuoteNumber = async (userId, documentType) => {
  const db = getFirestore();
  const year = new Date().getFullYear();
  const collectionName = documentType === "quote" ? "quotes" : "invoices";
  const prefix = documentType === "quote" ? "QTE" : "INV";
  const quotesRef = collection(db, "users", userId, collectionName);
  const q = query(quotesRef, orderBy("createdAt", "desc"), limit(1));
  const snapshot = await getDocs(q);
  let lastNumber = 1000;
  if (!snapshot.empty) {
    const lastQuote = snapshot.docs[0].data();
    const match = lastQuote.quoteNumber?.match(/(\d+)$/);
    if (match) lastNumber = Number(match[1]);
  }
  return `${prefix}-${year}-${String(lastNumber + 1).padStart(4, "0")}`;
};

const functions = getFunctions();

const WindowrepairDashboard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, authUser } = useAuth();
  const [quoteNumber, setQuoteNumber] = useState("");
  const [quoteId, setQuoteId] = useState(null);
  const [savedQuotes, setSavedQuotes] = useState([]);
  const [showQuotesList, setShowQuotesList] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeView, setActiveView] = useState("home");
  const [showPreview, setShowPreview] = useState(false);
  const [savedCustomers, setSavedCustomers] = useState([]);
  const [showCustomersListModal, setShowCustomersListModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("professional");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [inputMode, setInputMode] = useState("manual");
  const [isClientsOpen, setIsClientsOpen] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedQuoteForPayment, setSelectedQuoteForPayment] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isQuotesInvoicesOpen, setIsQuotesInvoicesOpen] = useState(false);
  const [showAIWindow, setShowAIWindow] = useState(false);
  const [documentType, setDocumentType] = useState("quote");
  const [invoices, setInvoices] = useState([]);
  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalQuotes: 0,
    totalInvoiced: 0,
    totalClients: 0,
    pendingPayments: 0,
    loading: true,
  });
  const [stampSettings, setStampSettings] = useState({
    text: "PAID",
    color: "#22c55e",
    showDate: true,
    enabled: true,
  });
  const [paymentStatus, setPaymentStatus] = useState({
    totalPaid: 0,
    balanceDue: 0,
    status: "pending",
  });

  // Form state
  const [customerName, setCustomerName] = useState("Johnson Residence");
  const [customerEmail, setCustomerEmail] = useState("johnson@email.com");
  const [customerPhone, setCustomerPhone] = useState("+27 82 123 4567");
  const [propertyAddress, setPropertyAddress] = useState(
    "123 Sunset Avenue, Sandton, Johannesburg, 2196",
  );
  const [windowType, setWindowType] = useState("Standard Window");
  const [windowCount, setWindowCount] = useState("4");
  const [screenType, setScreenType] = useState("Fiberglass");
  const [frameCondition, setFrameCondition] = useState("Good");
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({
    description: "",
    rate: "",
    qty: "",
    serviceType: "Screen Repair",
    taxRate: "15",
    urgency: "Standard",
  });

  const [businessInfo, setBusinessInfo] = useState({
    businessName: "CLEARVIEW WINDOW REPAIR",
    addressLine1: "456 Commercial Plaza",
    addressLine2: "Rosebank",
    city: "Johannesburg",
    postalCode: "2196",
    primaryPhone: "+27 11 555 0001",
    secondaryPhone: "+27 11 555 0002",
    email: "info@clearviewrepair.co.za",
    website: "www.clearviewrepair.co.za",
    registrationNumber: "2024/123456/07",
    vatNumber: "4123456789",
    logoUrl: "",
  });
  const [loading, setLoading] = useState(true);

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const totalTax = items.reduce((sum, item) => sum + item.taxAmount, 0);
  const total = subtotal + totalTax;

  // ── Design tokens ──────────────────────────────────────────────────────────
  const inputCls =
    "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md bg-white text-[#1e293b] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-[#2563eb] transition-colors";
  const labelCls =
    "block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5";
  const selectCls =
    "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md bg-white text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-[#2563eb] transition-colors";

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

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user?.uid) return;
    const load = async () => {
      const next = await generateQuoteNumber(user.uid, documentType);
      setQuoteNumber(next);
    };
    load();
    loadSavedQuotes();
  }, [user, documentType]);

  useEffect(() => {
    if (user?.uid) {
      loadBusinessInfo();
      fetchBusinessStats();
    }
  }, [user]);

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
    loadCustomers();
  }, []);
  useEffect(() => {
    loadPaymentStatus();
  }, [quoteId, user?.uid, documentType]);
  useEffect(() => {
    if (!quoteId)
      setPaymentStatus({ totalPaid: 0, balanceDue: total, status: "pending" });
  }, [total, quoteId]);

  const location = useLocation();
  useEffect(() => {
    if (location.state?.activeView) setActiveView(location.state.activeView);
  }, [location.state]);

  // ── Data loaders ──────────────────────────────────────────────────────────
  const fetchBusinessStats = async () => {
    if (!user?.uid) return;
    try {
      const db = getFirestore();
      const invoicesSnap = await getDocs(
        collection(db, "users", user.uid, "invoices"),
      );
      let totalInvoiced = 0,
        pendingPayments = 0,
        invoiceCount = 0;
      const invoicesList = [];
      invoicesSnap.forEach((doc) => {
        const d = doc.data();
        invoiceCount++;
        totalInvoiced += parseFloat(d.totals?.total || 0);
        if (["pending", "unpaid", "partially_paid"].includes(d.status))
          pendingPayments += parseFloat(d.totals?.due || d.totals?.total || 0);
        invoicesList.push({ id: doc.id, ...d });
      });
      invoicesList.sort((a, b) => {
        const t = (x) => new Date(x.dates?.quoteDate || 0).getTime();
        return t(b) - t(a);
      });
      setInvoices(invoicesList);
      let quoteCount = 0;
      try {
        const q = await getDocs(collection(db, "users", user.uid, "quotes"));
        quoteCount = q.docs.length;
      } catch (_) {}
      let clientCount = 0;
      try {
        const c = await getDocs(collection(db, "users", user.uid, "clients"));
        clientCount = c.docs.length;
      } catch (_) {}
      setStats({
        totalInvoices: invoiceCount,
        totalQuotes: quoteCount,
        totalInvoiced,
        totalClients: clientCount,
        pendingPayments,
        loading: false,
      });
    } catch (e) {
      setStats((p) => ({ ...p, loading: false }));
    }
  };

  const loadCustomers = async () => {
    if (!user?.uid) return;
    try {
      const q = query(
        collection(db, "users", user.uid, "clients"),
        orderBy("createdAt", "desc"),
      );
      const snap = await getDocs(q);
      setCustomers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (_) {}
  };

  const loadBusinessInfo = async () => {
    if (!user?.uid) return;
    try {
      const db = getFirestore();
      const snap = await getDoc(
        doc(db, "users", user.uid, "settings", "businessInfo"),
      );
      if (snap.exists()) {
        const data = snap.data();
        setBusinessInfo(data);
        if (data.stampSettings) setStampSettings(data.stampSettings);
      }
    } catch (_) {}
    setLoading(false);
  };

  const loadSavedQuotes = async () => {
    if (!user?.uid) return;
    const db = getFirestore();
    const colName = documentType === "quote" ? "quotes" : "invoices";
    const snap = await getDocs(
      query(
        collection(db, "users", user.uid, colName),
        orderBy("createdAt", "desc"),
        limit(50),
      ),
    );
    setSavedQuotes(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  const loadPaymentStatus = async () => {
    if (!user?.uid || !quoteId) {
      setPaymentStatus({ totalPaid: 0, balanceDue: total, status: "pending" });
      return;
    }
    try {
      const colName = documentType === "quote" ? "quotes" : "invoices";
      const snap = await getDoc(doc(db, "users", user.uid, colName, quoteId));
      if (snap.exists()) {
        const d = snap.data();
        setPaymentStatus({
          totalPaid: d.totals?.paid || 0,
          balanceDue: d.totals?.due || d.totals?.total || 0,
          status: d.status || "pending",
        });
      }
    } catch (_) {}
  };

  const loadQuote = (quote) => {
    setQuoteId(quote.id);
    setQuoteNumber(quote.quoteNumber || "");
    setCustomerName(quote.customer?.name || "");
    setCustomerEmail(quote.customer?.email || "");
    setCustomerPhone(quote.customer?.phone || "");
    setPropertyAddress(quote.customer?.address || "");
    setWindowType(quote.windowDetails?.type || "");
    setWindowCount(quote.windowDetails?.count || "");
    setScreenType(quote.windowDetails?.screenType || "");
    setFrameCondition(quote.windowDetails?.frameCondition || "");
    setItems(quote.items || []);
    setPaymentStatus({
      totalPaid: quote.totals?.paid || 0,
      balanceDue: quote.totals?.due || quote.totals?.total || 0,
      status: quote.status || "pending",
    });
    setShowQuotesList(false);
    setActiveView("quote");
  };

  const loadCustomer = (customer) => {
    setCustomerName(customer.name || "");
    setCustomerEmail(customer.email || "");
    setCustomerPhone(customer.phone || "");
    setPropertyAddress(customer.address || "");
  };

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleNext = () => {
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };
  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleAIDataExtracted = (extractedData) => {
    if (extractedData.customer.name)
      setCustomerName(extractedData.customer.name);
    if (extractedData.customer.email)
      setCustomerEmail(extractedData.customer.email);
    if (extractedData.customer.phone)
      setCustomerPhone(extractedData.customer.phone);
    if (extractedData.customer.address)
      setPropertyAddress(extractedData.customer.address);
    if (extractedData.items?.length > 0) setItems(extractedData.items);
    alert("✨ Data extracted and populated successfully!");
  };

  const handleAddItem = () => {
    if (!newItem.description || !newItem.qty) return;
    const rate = Number(newItem.rate) || 0;
    const qty = Number(newItem.qty);
    const taxRate = Number(newItem.taxRate) || 0;
    const amount = rate * qty;
    const taxAmount = amount * (taxRate / 100);
    setItems((prev) => [
      ...prev,
      {
        description: newItem.description,
        serviceType: newItem.serviceType || "Screen Repair",
        rate,
        qty,
        amount,
        taxRate,
        taxAmount,
        totalAmount: amount + taxAmount,
        urgency: newItem.urgency || "Standard",
      },
    ]);
    setNewItem({
      description: "",
      rate: "",
      qty: "",
      serviceType: "Screen Repair",
      taxRate: "15",
      urgency: "Standard",
    });
  };

  const handleRemoveItem = (index) =>
    setItems((prev) => prev.filter((_, i) => i !== index));

  const buildQuotePayload = (numberToUse) => ({
    quoteNumber: numberToUse,
    locked: true,
    status: "pending",
    documentType,
    dates: {
      quoteDate: new Date().toISOString(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    customer: {
      name: customerName,
      email: customerEmail,
      phone: customerPhone,
      address: propertyAddress,
    },
    windowDetails: {
      type: windowType,
      count: windowCount,
      screenType,
      frameCondition,
    },
    items,
    totals: { subtotal, tax: totalTax, total, paid: 0, due: total },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const handleSaveQuote = async () => {
    if (!user?.uid) return;
    const db = getFirestore();
    let numberToUse = quoteNumber;
    if (!quoteId) {
      numberToUse = await generateQuoteNumber(user.uid, documentType);
      setQuoteNumber(numberToUse);
    }
    const data = buildQuotePayload(numberToUse);
    const colName = documentType === "quote" ? "quotes" : "invoices";
    if (quoteId) {
      await updateDoc(doc(db, "users", user.uid, colName, quoteId), {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } else {
      const ref = await addDoc(
        collection(db, "users", user.uid, colName),
        data,
      );
      setQuoteId(ref.id);
    }
    alert(
      `${documentType === "quote" ? "Quote" : "Invoice"} saved successfully`,
    );
    loadSavedQuotes();
    fetchBusinessStats();
  };

  const handleConvertToInvoice = async () => {
    if (!user?.uid || !quoteId) {
      alert("Please save the quote first.");
      return;
    }
    if (!window.confirm("Convert this quote to an invoice?")) return;
    try {
      const db = getFirestore();
      const newNumber = await generateQuoteNumber(user.uid, "invoice");
      const invoiceData = {
        ...buildQuotePayload(newNumber),
        documentType: "invoice",
        convertedFromQuote: quoteId,
        convertedAt: serverTimestamp(),
      };
      const ref = await addDoc(
        collection(db, "users", user.uid, "invoices"),
        invoiceData,
      );
      await updateDoc(doc(db, "users", user.uid, "quotes", quoteId), {
        convertedToInvoice: true,
        convertedToInvoiceId: ref.id,
        convertedAt: serverTimestamp(),
        status: "converted",
      });
      setDocumentType("invoice");
      setQuoteId(ref.id);
      setQuoteNumber(newNumber);
      alert(`Converted to Invoice ${newNumber}`);
      loadSavedQuotes();
    } catch (_) {
      alert("Failed to convert");
    }
  };

  const handleNewDocument = () => {
    setQuoteId(null);
    setQuoteNumber("");
    setCustomerName("Johnson Residence");
    setCustomerEmail("johnson@email.com");
    setCustomerPhone("+27 82 123 4567");
    setPropertyAddress("123 Sunset Avenue, Sandton, Johannesburg, 2196");
    setWindowType("Standard Window");
    setWindowCount("4");
    setScreenType("Fiberglass");
    setFrameCondition("Good");
    setItems([]);
    setCurrentStep(1);
    if (user?.uid)
      generateQuoteNumber(user.uid, documentType).then(setQuoteNumber);
  };
  const handleNewQuote = () => {
    setDocumentType("quote");
    handleNewDocument();
  };
  const handleNewInvoice = () => {
    setDocumentType("invoice");
    handleNewDocument();
  };

  const handleProcessPayment = async () => {
    if (!quoteId || !user?.uid) {
      alert("Please save the quote before processing payment");
      return;
    }
    const colName = documentType === "quote" ? "quotes" : "invoices";
    const snap = await getDoc(doc(db, "users", user.uid, colName, quoteId));
    if (snap.exists()) {
      setSelectedQuoteForPayment({ id: quoteId, ...snap.data() });
      setShowPaymentModal(true);
    }
  };

  const handlePaymentComplete = () => {
    loadSavedQuotes();
    loadPaymentStatus();
    setShowPaymentModal(false);
  };

  const handleSavePDF = async () => {
    if (!user?.uid || !quoteId) {
      alert(`Please save the ${documentType} before exporting PDF`);
      return;
    }
    const colName = documentType === "quote" ? "quotes" : "invoices";
    const snap = await getDoc(doc(db, "users", user.uid, colName, quoteId));
    if (snap.exists()) setTimeout(() => window.print(), 300);
  };

  const printStyles = `@media print { * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } html,body { margin:0!important;padding:0!important;width:210mm!important;background:white!important; } body * { visibility:hidden!important; } #print-area,#print-area * { visibility:visible!important; } #print-area { display:block!important;position:absolute!important;left:0!important;top:0!important;width:210mm!important;min-height:297mm!important;margin:0!important;padding:0!important;background:white!important; } @page { size:A4 portrait;margin:40px!important; } }`;

  const handlePrint = () => {
    const s = document.createElement("style");
    s.textContent = printStyles;
    document.head.appendChild(s);
    window.print();
    setTimeout(() => document.head.removeChild(s), 1000);
  };

  const handleLogout = async () => {
    try {
      await signOut(getAuth());
    } catch (_) {}
  };

  // ── Stat Card ─────────────────────────────────────────────────────────────
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

  // ── Step definitions ───────────────────────────────────────────────────────
  const steps = [
    { number: 1, title: "Client Info", icon: Users },
    { number: 2, title: "Window Details", icon: Grid3x3 },
    { number: 3, title: "Repair Services", icon: Wrench },
    { number: 4, title: "Schedule & Payment", icon: Calendar },
  ];

  // ── Template props ─────────────────────────────────────────────────────────
  const templateProps = {
    templateId: selectedTemplate,
    businessInfo,
    loading,
    invoiceNumber: quoteNumber,
    customerName,
    billName: customerName,
    billEmail: customerEmail,
    billPhone: customerPhone,
    billAddress: propertyAddress,
    customerEmail,
    customerPhone,
    customerAddress: propertyAddress,
    taxId: "",
    items,
    subtotal,
    totalTax,
    total,
    documentType,
    stampText: stampSettings.text,
    stampColor: stampSettings.color,
    showStampDate: stampSettings.showDate,
    showStamp: stampSettings.enabled,
    paymentStatus,
  };

  // ── Header actions ─────────────────────────────────────────────────────────
  const headerActions = [
    documentType === "quote" &&
      quoteId && {
        label: "Convert to Invoice",
        icon: FileText,
        onClick: handleConvertToInvoice,
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
      className:
        "flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#e2e8f0] text-[#374151] text-sm font-medium rounded-md hover:bg-[#f1f5f9] transition-colors whitespace-nowrap",
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

  // ── Home View ──────────────────────────────────────────────────────────────
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
          iconColor="text-[#0d9488]"
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
                <p className="text-xs text-[#94a3b8]">Outstanding quotes</p>
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
                label: "New Quote",
                icon: FileText,
                onClick: () => {
                  handleNewQuote();
                  setActiveView("quote");
                },
                bg: "bg-[#eff6ff]",
                hover: "hover:bg-[#dbeafe]",
                border: "border-[#bfdbfe]",
                iconBg: "bg-[#2563eb]",
                text: "text-[#1e40af]",
              },
              {
                label: "New Invoice",
                icon: Receipt,
                onClick: () => {
                  handleNewInvoice();
                  setActiveView("quote");
                },
                bg: "bg-[#f0fdfa]",
                hover: "hover:bg-[#ccfbf1]",
                border: "border-[#99f6e4]",
                iconBg: "bg-[#0d9488]",
                text: "text-[#0f766e]",
              },
              {
                label: "Customers",
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
            Recent Quotes & Invoices
          </h3>
          <button
            onClick={() => setShowQuotesList(true)}
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
                No quotes yet
              </p>
              <p className="text-xs text-[#94a3b8] mb-3">
                Create your first quote to get started
              </p>
              <button
                onClick={() => {
                  handleNewQuote();
                  setActiveView("quote");
                }}
                className="px-4 py-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-lg text-xs font-medium transition-colors"
              >
                Create Quote
              </button>
            </div>
          ) : (
            invoices.slice(0, 8).map((invoice) => (
              <div
                key={invoice.id}
                onClick={() => loadQuote(invoice)}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-[#f8fafc] cursor-pointer transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-[#1e293b] truncate">
                      {invoice.quoteNumber || invoice.id}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-semibold flex-shrink-0 ${statusBadge(invoice.status)}`}
                    >
                      {invoice.status === "partially_paid"
                        ? "Partial"
                        : invoice.status || "Draft"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[#64748b]">
                    <span className="flex items-center gap-1 truncate">
                      <Users className="w-3 h-3 flex-shrink-0" />
                      {invoice.customer?.name || "No customer"}
                    </span>
                    <span className="flex items-center gap-1 truncate">
                      <Grid3x3 className="w-3 h-3 flex-shrink-0" />
                      {invoice.windowDetails?.type || "N/A"}
                    </span>
                  </div>
                </div>
                <div className="text-right ml-4 flex-shrink-0">
                  <div className="text-sm font-bold text-[#1e293b]">
                    {formatCurrency(invoice.totals?.total || 0)}
                  </div>
                  {invoice.totals?.due > 0 &&
                    invoice.totals?.due < invoice.totals?.total && (
                      <div className="text-xs text-[#d97706]">
                        Due: {formatCurrency(invoice.totals.due)}
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

  // ── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <div className="h-screen w-full overflow-hidden flex flex-col bg-[#f0f2f5]">
      {/* Print area */}
      <div
        id="print-area"
        className="hidden print:block bg-white"
        style={{ width: "210mm", minHeight: "297mm" }}
      >
        <TemplateRenderer {...templateProps} />
      </div>
       {showAIWindow && (
  <AIInvoiceWindow
    user={user}
    businessInfo={businessInfo}
    documentType={documentType}
    onExit={() => setShowAIWindow(false)}
  />
)}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* ── Sidebar ──────────────────────────────────────────────────────── */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <div
          className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} fixed z-50 w-64 md:w-72 bg-[#0f172a] border-r border-[#1e293b] transition-transform duration-300 h-full print:hidden shadow-2xl overflow-y-auto lg:relative lg:translate-x-0 lg:flex-shrink-0`}
        >
          <div className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#1e3a5f] rounded-lg flex items-center justify-center">
                  <Grid3x3 className="w-5 h-5 text-[#60a5fa]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white leading-tight">
                    ClearView
                  </p>
                  <p className="text-xs text-[#64748b]">Window Repair</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 text-[#64748b] hover:text-white hover:bg-[#1e293b] rounded-lg transition-all lg:hidden"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            <nav className="space-y-1">
              {[
                {
                  label: "Home",
                  icon: Home,
                  view: "home",
                  color: "text-[#94a3b8]",
                  hoverBg: "hover:bg-[#1e293b]",
                },
                {
                  label: "Settings",
                  icon: Settings,
                  onClick: () => setShowSettings(true),
                  color: "text-[#94a3b8]",
                  hoverBg: "hover:bg-[#1e293b]",
                },
              ].map(({ label, icon: Icon, view, onClick, color, hoverBg }) => (
                <div
                  key={label}
                  onClick={
                    onClick ||
                    (() => {
                      setActiveView(view);
                      if (isMobile) setSidebarOpen(false);
                    })
                  }
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all ${hoverBg} ${activeView === view ? "bg-[#1e293b] text-white" : `${color} hover:text-white`}`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm font-medium">{label}</span>
                </div>
              ))}

              <div className="pt-3 mt-3 border-t border-[#1e293b]">
                <div
                  onClick={() => {
                    setActiveView("financial-overview");
                    if (isMobile) setSidebarOpen(false);
                  }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all hover:bg-[#1e293b] ${activeView === "financial-overview" ? "bg-[#1e293b] text-white" : "text-[#94a3b8] hover:text-white"}`}
                >
                  <TrendingUp className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm font-medium">
                    Financial Dashboard
                  </span>
                </div>

                {/* Quotes & Invoices accordion */}
                <div className="mt-1">
                  <div
                    onClick={() =>
                      setIsQuotesInvoicesOpen(!isQuotesInvoicesOpen)
                    }
                    className="flex items-center justify-between px-3 py-2.5 text-[#94a3b8] hover:text-white hover:bg-[#1e293b] rounded-lg cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <Receipt className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm font-medium">
                        Quotes & Invoices
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-300 ${isQuotesInvoicesOpen ? "rotate-180" : ""}`}
                    />
                  </div>
                  <div
                    className={`ml-6 mt-1 space-y-0.5 border-l border-[#1e293b] pl-3 overflow-hidden transition-all duration-300 ${isQuotesInvoicesOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}
                  >
                    {[
                      {
                        label: "Create Quote",
                        onClick: () => {
                          handleNewQuote();
                          setActiveView("quote");
                          if (isMobile) setSidebarOpen(false);
                        },
                      },
                      {
                        label: "Create Invoice",
                        onClick: () => {
                          handleNewInvoice();
                          setActiveView("quote");
                          if (isMobile) setSidebarOpen(false);
                        },
                      },
                      {
                        label: `All ${documentType === "quote" ? "Quotes" : "Invoices"} (${savedQuotes.length})`,
                        onClick: () => {
                          setShowQuotesList(true);
                          if (isMobile) setSidebarOpen(false);
                        },
                      },
                    ].map(({ label, onClick }) => (
                      <div
                        key={label}
                        onClick={onClick}
                        className="px-2 py-2 text-xs text-[#64748b] hover:text-white hover:bg-[#1e293b] rounded cursor-pointer transition-all"
                      >
                        {label}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Clients accordion */}
                <div className="mt-1">
                  <div
                    onClick={() => setIsClientsOpen(!isClientsOpen)}
                    className="flex items-center justify-between px-3 py-2.5 text-[#94a3b8] hover:text-white hover:bg-[#1e293b] rounded-lg cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <Users className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm font-medium">Clients</span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-300 ${isClientsOpen ? "rotate-180" : ""}`}
                    />
                  </div>
                  <div
                    className={`ml-6 mt-1 space-y-0.5 border-l border-[#1e293b] pl-3 overflow-hidden transition-all duration-300 ${isClientsOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}
                  >
                    {[
                      {
                        label: "Add Client",
                        onClick: () => {
                          setSelectedCustomer(null);
                          setShowCustomerModal(true);
                          if (isMobile) setSidebarOpen(false);
                        },
                      },
                      {
                        label: `All Clients (${savedCustomers.length})`,
                        onClick: () => {
                          setShowCustomersListModal(true);
                          if (isMobile) setSidebarOpen(false);
                        },
                      },
                    ].map(({ label, onClick }) => (
                      <div
                        key={label}
                        onClick={onClick}
                        className="px-2 py-2 text-xs text-[#64748b] hover:text-white hover:bg-[#1e293b] rounded cursor-pointer transition-all"
                      >
                        {label}
                      </div>
                    ))}
                  </div>
                </div>

                {!isMobile && (
                  <>
                    <div
                      onClick={() => {
                        setActiveView("schedule");
                        setSidebarOpen(false);
                      }}
                      className="flex items-center gap-3 px-3 py-2.5 text-[#94a3b8] hover:text-white hover:bg-[#1e293b] rounded-lg cursor-pointer transition-all mt-1"
                    >
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm font-medium">Schedule</span>
                    </div>
                    <div
                      onClick={() => {
                        setActiveView("reports");
                        setSidebarOpen(false);
                      }}
                      className="flex items-center gap-3 px-3 py-2.5 text-[#94a3b8] hover:text-white hover:bg-[#1e293b] rounded-lg cursor-pointer transition-all"
                    >
                      <BarChart3 className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm font-medium">Reports</span>
                    </div>
                  </>
                )}
              </div>
            </nav>
          </div>

          {/* Sidebar footer */}
          <div className="absolute bottom-0 left-0 right-0 border-t border-[#1e293b] p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0 ring-1 ring-[#1e293b]">
                {businessInfo.logoUrl ? (
                  <img
                    src={businessInfo.logoUrl}
                    alt=""
                    className="w-full h-full rounded-full object-contain"
                  />
                ) : (
                  <Grid3x3 className="w-4 h-4 text-[#64748b]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">
                  {user?.email || "user@example.com"}
                </p>
                <p className="text-xs text-[#64748b] truncate">
                  {businessInfo.businessName}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 text-[#64748b] hover:text-white hover:bg-[#1e293b] rounded-lg transition-all"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Main content ─────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          <AppHeader
            actions={headerActions}
            mobileActions={mobileDashboardActions}
            onSettingsOpen={() => setShowSettings(true)}
          />

          {/* Modals */}
          {showSettings && (
            <BusinessSettingsModal onClose={() => setShowSettings(false)} />
          )}
          <CustomersListModal
            showModal={showCustomersListModal}
            setShowModal={setShowCustomersListModal}
            customers={customers}
            onLoadCustomer={loadCustomer}
            onEditCustomer={(c) => {
              setSelectedCustomer(c);
              setShowCustomerModal(true);
            }}
            onAddNewCustomer={() => {
              setSelectedCustomer(null);
              setShowCustomerModal(true);
            }}
          />
          <CustomerModal
            showModal={showCustomerModal}
            setShowModal={setShowCustomerModal}
            existingCustomer={selectedCustomer}
            onCustomerSaved={loadCustomers}
          />
          {showPaymentModal && selectedQuoteForPayment && (
            <PaymentProcessor
              showModal={showPaymentModal}
              setShowModal={setShowPaymentModal}
              invoice={selectedQuoteForPayment}
              onPaymentComplete={handlePaymentComplete}
              user={user}
              businessInfo={businessInfo}
            />
          )}

          {/* All quotes modal */}
          {showQuotesList && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden border border-[#e2e8f0]">
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0] bg-[#f8fafc]">
                  <div>
                    <h2 className="text-base font-semibold text-[#1e293b]">
                      All {documentType === "quote" ? "Quotes" : "Invoices"}
                    </h2>
                    <p className="text-xs text-[#64748b] mt-0.5">
                      {savedQuotes.length} records
                    </p>
                  </div>
                  <button
                    onClick={() => setShowQuotesList(false)}
                    className="p-1.5 text-[#64748b] hover:text-[#1e293b] hover:bg-[#e2e8f0] rounded-lg transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {savedQuotes.length === 0 ? (
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
                            "Windows",
                            "Total",
                            "Paid",
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
                        {savedQuotes.map((q) => (
                          <tr
                            key={q.id}
                            onClick={() => loadQuote(q)}
                            className="border-b border-[#f1f5f9] hover:bg-[#f8fafc] cursor-pointer transition-colors"
                          >
                            <td className="px-5 py-3 text-sm font-semibold text-[#2563eb]">
                              {q.quoteNumber || "N/A"}
                            </td>
                            <td className="px-5 py-3 text-sm text-[#374151]">
                              {q.customer?.name || "N/A"}
                            </td>
                            <td className="px-5 py-3 text-sm text-[#374151]">
                              {q.windowDetails?.type || "N/A"}
                            </td>
                            <td className="px-5 py-3 text-sm font-semibold text-[#1e293b]">
                              {formatCurrency(q.totals?.total || 0)}
                            </td>
                            <td className="px-5 py-3 text-sm text-[#059669] font-medium">
                              {formatCurrency(q.totals?.paid || 0)}
                            </td>
                            <td className="px-5 py-3">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${statusBadge(q.status)}`}
                              >
                                {q.status === "partially_paid"
                                  ? "Partial"
                                  : q.status || "Pending"}
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

          {/* Invoice Preview Modal */}
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
                    style={{ width: "210mm", minHeight: "297mm" }}
                  >
                    <TemplateRenderer {...templateProps} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Views ──────────────────────────────────────────────────────── */}
          {activeView === "home" && <HomeViewLocal />}
          {activeView === "financial-overview" && (
            <div className="flex-1 overflow-y-auto p-4">
              <FinancialOverview user={user} />
            </div>
          )}
          {activeView === "history-view" && (
            <div className="flex-1 overflow-y-auto p-4">
              <HistoryView user={user} />
            </div>
          )}
          {activeView === "notes-view" && (
            <div className="flex-1 overflow-y-auto p-4">
              <NotesView user={user} />
            </div>
          )}
          {activeView === "templates" && (
            <div className="flex-1 overflow-y-auto p-4">
              <Templates user={user} />
            </div>
          )}

          {/* ── Quote / Invoice Builder ─────────────────────────────────────── */}
          {activeView === "quote" && (
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

                  {/* Payment status banner */}
                  {quoteId && (
                    <div
                      className={`px-5 py-3.5 rounded-xl border flex items-center justify-between ${paymentStatus.status === "paid" ? "bg-[#f0fdf4] border-[#bbf7d0]" : paymentStatus.status === "partially_paid" ? "bg-[#fffbeb] border-[#fde68a]" : "bg-[#fff7ed] border-[#fed7aa]"}`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${paymentStatus.status === "paid" ? "bg-[#dcfce7]" : paymentStatus.status === "partially_paid" ? "bg-[#fef3c7]" : "bg-[#ffedd5]"}`}
                        >
                          <CreditCard
                            className={`w-4 h-4 ${paymentStatus.status === "paid" ? "text-[#059669]" : paymentStatus.status === "partially_paid" ? "text-[#d97706]" : "text-[#ea580c]"}`}
                          />
                        </div>
                        <div
                          className={`text-sm font-semibold ${paymentStatus.status === "paid" ? "text-[#166534]" : paymentStatus.status === "partially_paid" ? "text-[#92400e]" : "text-[#9a3412]"}`}
                        >
                          {paymentStatus.status === "paid"
                            ? `${documentType === "quote" ? "Quote" : "Invoice"} Fully Paid`
                            : paymentStatus.status === "partially_paid"
                              ? `R${paymentStatus.totalPaid.toFixed(2)} paid · R${paymentStatus.balanceDue.toFixed(2)} remaining`
                              : `Payment Pending — R${paymentStatus.balanceDue.toFixed(2)} due`}
                        </div>
                      </div>
                      {paymentStatus.status !== "paid" && (
                        <button
                          onClick={handleProcessPayment}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#e2e8f0] text-[#374151] text-sm font-medium rounded-lg hover:bg-[#f8fafc] transition-colors shadow-sm"
                        >
                          <CreditCard className="w-4 h-4" />
                          Record Payment
                        </button>
                      )}
                    </div>
                  )}

                  {/* Main card */}
                  <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
                    {/* Input mode tabs */}
                    <div className="flex border-b border-[#e2e8f0] bg-[#f8fafc]">
                      <button
                        onClick={() => setInputMode("manual")}
                        className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all border-b-2 -mb-px ${inputMode === "manual" ? "border-[#2563eb] text-[#2563eb] bg-white" : "border-transparent text-[#64748b] hover:text-[#374151]"}`}
                      >
                        <Edit className="w-4 h-4" />
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

                    

                    {inputMode === "manual" && (
                      <>
                        {/* Step indicator */}
                        <div className="px-6 py-4 border-b border-[#e2e8f0] bg-[#f8fafc]">
                          <div className="flex items-center gap-0">
                            {steps.map((step, idx) => (
                              <React.Fragment key={step.number}>
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${currentStep === step.number ? "bg-[#2563eb] text-white" : currentStep > step.number ? "bg-[#dcfce7] text-[#059669] ring-1 ring-[#059669]" : "bg-[#e2e8f0] text-[#94a3b8]"}`}
                                  >
                                    {currentStep > step.number
                                      ? "✓"
                                      : step.number}
                                  </div>
                                  <span
                                    className={`text-xs font-medium hidden sm:block ${currentStep === step.number ? "text-[#2563eb]" : currentStep > step.number ? "text-[#059669]" : "text-[#94a3b8]"}`}
                                  >
                                    {step.title}
                                  </span>
                                </div>
                                {idx < steps.length - 1 && (
                                  <div
                                    className={`flex-1 h-px mx-2 ${currentStep > step.number ? "bg-[#059669]" : "bg-[#e2e8f0]"}`}
                                  />
                                )}
                              </React.Fragment>
                            ))}
                          </div>
                        </div>

                        {/* Step content */}
                        <div className="p-6">
                          {/* Step 1 – Client Info */}
                          {currentStep === 1 && (
                            <div>
                              <div className="flex items-center gap-3 mb-5">
                                <div className="w-9 h-9 bg-[#eff6ff] rounded-lg flex items-center justify-center">
                                  <Users className="w-5 h-5 text-[#2563eb]" />
                                </div>
                                <div>
                                  <h2 className="text-base font-semibold text-[#1e293b]">
                                    Client Information
                                  </h2>
                                  <p className="text-xs text-[#64748b]">
                                    Enter client and property details
                                  </p>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[
                                  {
                                    label: "Client Name",
                                    value: customerName,
                                    set: setCustomerName,
                                    placeholder: "Enter client name",
                                    required: true,
                                  },
                                  {
                                    label: "Email",
                                    value: customerEmail,
                                    set: setCustomerEmail,
                                    type: "email",
                                    placeholder: "contact@example.com",
                                    required: true,
                                  },
                                  {
                                    label: "Phone",
                                    value: customerPhone,
                                    set: setCustomerPhone,
                                    type: "tel",
                                    placeholder: "+27 82 123 4567",
                                    required: true,
                                  },
                                ].map(
                                  ({
                                    label,
                                    value,
                                    set,
                                    placeholder,
                                    type = "text",
                                    required,
                                  }) => (
                                    <div key={label}>
                                      <label className={labelCls}>
                                        {label}{" "}
                                        {required && (
                                          <span className="text-[#dc2626] normal-case tracking-normal font-normal">
                                            *
                                          </span>
                                        )}
                                      </label>
                                      <input
                                        type={type}
                                        value={value}
                                        onChange={(e) => set(e.target.value)}
                                        placeholder={placeholder}
                                        className={inputCls}
                                      />
                                    </div>
                                  ),
                                )}
                                <div className="col-span-1 sm:col-span-2">
                                  <label className={labelCls}>
                                    Property Address{" "}
                                    <span className="text-[#dc2626] normal-case tracking-normal font-normal">
                                      *
                                    </span>
                                  </label>
                                  <input
                                    type="text"
                                    value={propertyAddress}
                                    onChange={(e) =>
                                      setPropertyAddress(e.target.value)
                                    }
                                    placeholder="123 Sunset Avenue, Sandton, Johannesburg, 2196"
                                    className={inputCls}
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Step 2 – Window Details */}
                          {currentStep === 2 && (
                            <div>
                              <div className="flex items-center gap-3 mb-5">
                                <div className="w-9 h-9 bg-[#f0f9ff] rounded-lg flex items-center justify-center">
                                  <Grid3x3 className="w-5 h-5 text-[#0284c7]" />
                                </div>
                                <div>
                                  <h2 className="text-base font-semibold text-[#1e293b]">
                                    Window Details
                                  </h2>
                                  <p className="text-xs text-[#64748b]">
                                    Enter window and screen information for
                                    accurate quote
                                  </p>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                  <label className={labelCls}>
                                    Window Type
                                  </label>
                                  <select
                                    value={windowType}
                                    onChange={(e) =>
                                      setWindowType(e.target.value)
                                    }
                                    className={selectCls}
                                  >
                                    {[
                                      "Standard Window",
                                      "Sliding Window",
                                      "Bay Window",
                                      "Picture Window",
                                      "Casement Window",
                                      "Double-Hung Window",
                                      "Awning Window",
                                    ].map((t) => (
                                      <option key={t} value={t}>
                                        {t}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className={labelCls}>
                                    Number of Windows
                                  </label>
                                  <input
                                    type="number"
                                    value={windowCount}
                                    onChange={(e) =>
                                      setWindowCount(e.target.value)
                                    }
                                    placeholder="4"
                                    className={inputCls}
                                  />
                                </div>
                                <div>
                                  <label className={labelCls}>
                                    Screen Type
                                  </label>
                                  <select
                                    value={screenType}
                                    onChange={(e) =>
                                      setScreenType(e.target.value)
                                    }
                                    className={selectCls}
                                  >
                                    {[
                                      "Fiberglass",
                                      "Aluminum",
                                      "Pet-Resistant",
                                      "Solar",
                                      "Privacy",
                                      "Retractable",
                                    ].map((t) => (
                                      <option key={t} value={t}>
                                        {t}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className={labelCls}>
                                    Frame Condition
                                  </label>
                                  <select
                                    value={frameCondition}
                                    onChange={(e) =>
                                      setFrameCondition(e.target.value)
                                    }
                                    className={selectCls}
                                  >
                                    {[
                                      "Good",
                                      "Fair",
                                      "Needs Repair",
                                      "Replacement Required",
                                    ].map((t) => (
                                      <option key={t} value={t}>
                                        {t}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                              <div className="mt-4 p-3.5 bg-[#f0f9ff] border border-[#bae6fd] rounded-lg">
                                <h3 className="text-sm font-semibold text-[#0284c7] mb-2 flex items-center gap-2">
                                  <Grid3x3 className="w-4 h-4" />
                                  Window Summary
                                </h3>
                                <div className="text-xs text-[#0369a1] space-y-0.5">
                                  <p>
                                    <span className="font-semibold">Type:</span>{" "}
                                    {windowType}
                                  </p>
                                  <p>
                                    <span className="font-semibold">
                                      Count:
                                    </span>{" "}
                                    {windowCount} windows
                                  </p>
                                  <p>
                                    <span className="font-semibold">
                                      Screen:
                                    </span>{" "}
                                    {screenType} |{" "}
                                    <span className="font-semibold">
                                      Frame:
                                    </span>{" "}
                                    {frameCondition}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Step 3 – Repair Services */}
                          {currentStep === 3 && (
                            <div>
                              <div className="flex items-center gap-3 mb-5">
                                <div className="w-9 h-9 bg-[#f8fafc] rounded-lg flex items-center justify-center">
                                  <Wrench className="w-5 h-5 text-[#475569]" />
                                </div>
                                <div>
                                  <h2 className="text-base font-semibold text-[#1e293b]">
                                    Repair Services
                                  </h2>
                                  <p className="text-xs text-[#64748b]">
                                    Add window repair services to the quote
                                  </p>
                                </div>
                              </div>

                              {/* Add service form */}
                              <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-5 mb-5">
                                <h3 className="text-sm font-semibold text-[#374151] mb-4 flex items-center gap-2">
                                  <Plus className="w-4 h-4 text-[#2563eb]" />
                                  Add New Service
                                </h3>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                  <div>
                                    <label className={labelCls}>
                                      Service Type
                                    </label>
                                    <select
                                      value={newItem.serviceType}
                                      onChange={(e) =>
                                        setNewItem({
                                          ...newItem,
                                          serviceType: e.target.value,
                                        })
                                      }
                                      className={selectCls}
                                    >
                                      {[
                                        "Screen Repair",
                                        "Screen Replacement",
                                        "Frame Repair",
                                        "Track Cleaning",
                                        "Custom Screens",
                                        "Re-screening",
                                        "Emergency Repair",
                                        "Hardware Replacement",
                                      ].map((t) => (
                                        <option key={t} value={t}>
                                          {t}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                  <div>
                                    <label className={labelCls}>Urgency</label>
                                    <select
                                      value={newItem.urgency}
                                      onChange={(e) =>
                                        setNewItem({
                                          ...newItem,
                                          urgency: e.target.value,
                                        })
                                      }
                                      className={selectCls}
                                    >
                                      {[
                                        "Standard",
                                        "Urgent (24-48hrs)",
                                        "Emergency (Same Day)",
                                        "Scheduled",
                                      ].map((t) => (
                                        <option key={t} value={t}>
                                          {t}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                  <div className="col-span-2">
                                    <label className={labelCls}>
                                      Description
                                    </label>
                                    <input
                                      type="text"
                                      placeholder="Service description"
                                      value={newItem.description}
                                      onChange={(e) =>
                                        setNewItem({
                                          ...newItem,
                                          description: e.target.value,
                                        })
                                      }
                                      className={inputCls}
                                    />
                                  </div>
                                  <div>
                                    <label className={labelCls}>Rate (R)</label>
                                    <input
                                      type="number"
                                      placeholder="0.00"
                                      value={newItem.rate}
                                      onChange={(e) =>
                                        setNewItem({
                                          ...newItem,
                                          rate: e.target.value,
                                        })
                                      }
                                      className={inputCls}
                                    />
                                  </div>
                                  <div>
                                    <label className={labelCls}>Quantity</label>
                                    <input
                                      type="number"
                                      placeholder="1"
                                      value={newItem.qty}
                                      onChange={(e) =>
                                        setNewItem({
                                          ...newItem,
                                          qty: e.target.value,
                                        })
                                      }
                                      className={inputCls}
                                    />
                                  </div>
                                  <div>
                                    <label className={labelCls}>VAT (%)</label>
                                    <input
                                      type="number"
                                      placeholder="15"
                                      value={newItem.taxRate}
                                      onChange={(e) =>
                                        setNewItem({
                                          ...newItem,
                                          taxRate: e.target.value,
                                        })
                                      }
                                      className={inputCls}
                                    />
                                  </div>
                                  <div className="flex items-end">
                                    <button
                                      onClick={handleAddItem}
                                      className="w-full flex items-center justify-center gap-1.5 px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium rounded-md transition-colors"
                                    >
                                      <Plus className="w-4 h-4" />
                                      Add
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Items table */}
                              {items.length > 0 ? (
                                <div className="border border-[#e2e8f0] rounded-xl overflow-hidden mb-5">
                                  <div className="px-4 py-3 bg-[#f8fafc] border-b border-[#e2e8f0] flex items-center justify-between">
                                    <span className="text-sm font-semibold text-[#374151]">
                                      Line Items
                                    </span>
                                    <span className="text-xs text-[#64748b] bg-[#e2e8f0] px-2 py-0.5 rounded-full">
                                      {items.length} items
                                    </span>
                                  </div>
                                  <div className="overflow-x-auto">
                                    <table className="w-full">
                                      <thead>
                                        <tr className="border-b border-[#e2e8f0]">
                                          {[
                                            "Service",
                                            "Type",
                                            "Urgency",
                                            "Rate",
                                            "Qty",
                                            "VAT",
                                            "Amount",
                                            "",
                                          ].map((h) => (
                                            <th
                                              key={h}
                                              className="px-4 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wide"
                                            >
                                              {h}
                                            </th>
                                          ))}
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {items.map((item, index) => (
                                          <tr
                                            key={index}
                                            className="border-b border-[#f1f5f9] hover:bg-[#f8fafc] transition-colors"
                                          >
                                            <td className="px-4 py-3 text-sm font-medium text-[#374151]">
                                              {item.description}
                                            </td>
                                            <td className="px-4 py-3">
                                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-[#eff6ff] text-[#1d4ed8]">
                                                {item.serviceType ||
                                                  "Screen Repair"}
                                              </span>
                                            </td>
                                            <td className="px-4 py-3">
                                              <span
                                                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${item.urgency === "Emergency (Same Day)" ? "bg-[#fef2f2] text-[#991b1b]" : item.urgency?.startsWith("Urgent") ? "bg-[#fff7ed] text-[#9a3412]" : "bg-[#f0fdf4] text-[#166534]"}`}
                                              >
                                                {item.urgency || "Standard"}
                                              </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-[#374151]">
                                              R{item.rate.toFixed(2)}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-[#374151]">
                                              {item.qty}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-[#374151]">
                                              R{item.taxAmount.toFixed(2)}
                                            </td>
                                            <td className="px-4 py-3 text-sm font-semibold text-[#1e293b]">
                                              R{item.totalAmount.toFixed(2)}
                                            </td>
                                            <td className="px-4 py-3">
                                              <button
                                                onClick={() =>
                                                  handleRemoveItem(index)
                                                }
                                                className="p-1.5 text-[#94a3b8] hover:text-[#dc2626] hover:bg-[#fef2f2] rounded-lg transition-all"
                                              >
                                                <X className="w-3.5 h-3.5" />
                                              </button>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                  <div className="px-4 py-3 bg-[#f8fafc] border-t border-[#e2e8f0]">
                                    <div className="flex flex-col items-end gap-1 text-sm">
                                      <div className="flex justify-between w-48 text-[#64748b]">
                                        <span>Subtotal</span>
                                        <span className="font-medium text-[#374151]">
                                          R{subtotal.toFixed(2)}
                                        </span>
                                      </div>
                                      <div className="flex justify-between w-48 text-[#64748b]">
                                        <span>VAT</span>
                                        <span className="font-medium text-[#374151]">
                                          R{totalTax.toFixed(2)}
                                        </span>
                                      </div>
                                      <div className="flex justify-between w-48 pt-2 border-t border-[#e2e8f0] font-semibold text-[#1e293b]">
                                        <span>Total</span>
                                        <span className="text-[#2563eb]">
                                          R{total.toFixed(2)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="border-2 border-dashed border-[#e2e8f0] rounded-xl py-12 text-center">
                                  <Wrench className="w-8 h-8 text-[#cbd5e1] mx-auto mb-3" />
                                  <p className="text-sm font-medium text-[#94a3b8]">
                                    No services added yet
                                  </p>
                                  <p className="text-xs text-[#cbd5e1] mt-1">
                                    Use the form above to add window repair
                                    services
                                  </p>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Step 4 – Schedule & Payment */}
                          {currentStep === 4 && (
                            <div>
                              <div className="flex items-center gap-3 mb-5">
                                <div className="w-9 h-9 bg-[#faf5ff] rounded-lg flex items-center justify-center">
                                  <Calendar className="w-5 h-5 text-[#7c3aed]" />
                                </div>
                                <div>
                                  <h2 className="text-base font-semibold text-[#1e293b]">
                                    Schedule & Payment Terms
                                  </h2>
                                  <p className="text-xs text-[#64748b]">
                                    Review quote details and schedule
                                    information
                                  </p>
                                </div>
                              </div>

                              {/* Summary cards */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                                {[
                                  {
                                    label: "Quote Total",
                                    value: `R${total.toFixed(2)}`,
                                    icon: DollarSign,
                                    bg: "bg-[#eff6ff] border-[#bfdbfe]",
                                    text: "text-[#1e40af]",
                                  },
                                  {
                                    label: "Services Count",
                                    value: items.length,
                                    icon: ClipboardList,
                                    bg: "bg-[#f0fdf4] border-[#bbf7d0]",
                                    text: "text-[#166534]",
                                  },
                                  {
                                    label: "VAT Amount",
                                    value: `R${totalTax.toFixed(2)}`,
                                    icon: Receipt,
                                    bg: "bg-[#faf5ff] border-[#e9d5ff]",
                                    text: "text-[#6b21a8]",
                                  },
                                ].map(
                                  ({ label, value, icon: Icon, bg, text }) => (
                                    <div
                                      key={label}
                                      className={`${bg} border rounded-xl p-5 flex items-center justify-between`}
                                    >
                                      <div>
                                        <p
                                          className={`text-xs font-semibold ${text} mb-1`}
                                        >
                                          {label}
                                        </p>
                                        <p
                                          className={`text-2xl font-bold ${text}`}
                                        >
                                          {value}
                                        </p>
                                      </div>
                                      <Icon
                                        className={`w-6 h-6 ${text} opacity-50`}
                                      />
                                    </div>
                                  ),
                                )}
                              </div>

                              {/* Quote summary */}
                              <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-5">
                                <h3 className="text-sm font-semibold text-[#374151] mb-4">
                                  Quote Summary
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                  <div>
                                    <h4 className="text-xs font-semibold text-[#64748b] uppercase tracking-wide mb-2 flex items-center gap-1.5">
                                      <Users className="w-3.5 h-3.5" />
                                      Client Details
                                    </h4>
                                    <div className="text-sm text-[#374151] space-y-0.5">
                                      <p className="font-semibold text-[#1e293b]">
                                        {customerName}
                                      </p>
                                      <p>{customerEmail}</p>
                                      <p>{customerPhone}</p>
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="text-xs font-semibold text-[#64748b] uppercase tracking-wide mb-2 flex items-center gap-1.5">
                                      <Grid3x3 className="w-3.5 h-3.5" />
                                      Window Details
                                    </h4>
                                    <div className="text-sm text-[#374151] space-y-0.5">
                                      <p className="font-semibold text-[#1e293b]">
                                        {propertyAddress}
                                      </p>
                                      <p>
                                        <span className="font-semibold">
                                          Type:
                                        </span>{" "}
                                        {windowType} |{" "}
                                        <span className="font-semibold">
                                          Count:
                                        </span>{" "}
                                        {windowCount}
                                      </p>
                                      <p>
                                        <span className="font-semibold">
                                          Screen:
                                        </span>{" "}
                                        {screenType} |{" "}
                                        <span className="font-semibold">
                                          Frame:
                                        </span>{" "}
                                        {frameCondition}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-[#e2e8f0]">
                                  <div className="text-xs text-[#64748b] space-y-0.5">
                                    <p>
                                      <span className="font-semibold">
                                        Number:
                                      </span>{" "}
                                      {quoteNumber}
                                    </p>
                                    <p>
                                      <span className="font-semibold">
                                        Date:
                                      </span>{" "}
                                      {new Date().toLocaleDateString()} |{" "}
                                      <span className="font-semibold">
                                        Type:
                                      </span>{" "}
                                      {documentType === "quote"
                                        ? "Quote"
                                        : "Invoice"}{" "}
                                      |{" "}
                                      <span className="font-semibold">
                                        Status:
                                      </span>{" "}
                                      <span className="text-[#d97706] font-bold">
                                        Pending
                                      </span>
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {quoteId && (
                                <button
                                  onClick={handleProcessPayment}
                                  className="mt-5 flex items-center justify-center gap-2 w-full px-6 py-3 bg-[#059669] hover:bg-[#047857] text-white rounded-xl font-medium transition-colors shadow-sm"
                                >
                                  <CreditCard className="w-4 h-4" />
                                  Process Payment
                                </button>
                              )}
                              {!quoteId && (
                                <div className="mt-5 flex items-center gap-2 px-4 py-3 bg-[#fff7ed] border border-[#fed7aa] rounded-lg text-sm text-[#9a3412]">
                                  <Receipt className="w-4 h-4 flex-shrink-0" />
                                  Save the quote first to process payment
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Step nav */}
                        <div className="px-6 py-4 bg-[#f8fafc] border-t border-[#e2e8f0] flex items-center justify-between">
                          <button
                            onClick={handlePrevious}
                            disabled={currentStep === 1}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${currentStep === 1 ? "bg-[#f1f5f9] text-[#cbd5e1] cursor-not-allowed" : "bg-white border border-[#e2e8f0] text-[#374151] hover:bg-[#f8fafc] shadow-sm"}`}
                          >
                            <ChevronLeft className="w-4 h-4" />
                            <span className="hidden sm:inline">Previous</span>
                          </button>
                          <div className="text-xs font-medium text-[#64748b] bg-white border border-[#e2e8f0] px-3 py-1.5 rounded-lg">
                            Step {currentStep} of {totalSteps}
                          </div>
                          {currentStep < totalSteps ? (
                            <button
                              onClick={handleNext}
                              className="flex items-center gap-1.5 px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                            >
                              <span className="hidden sm:inline">Next</span>
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={handleSaveQuote}
                              className="flex items-center gap-1.5 px-4 py-2 bg-[#059669] hover:bg-[#047857] text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                            >
                              <Save className="w-4 h-4" />
                              Save{" "}
                              {documentType === "quote" ? "Quote" : "Invoice"}
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* RIGHT: Live preview panel */}
              <div className="hidden xl:flex w-[420px] flex-shrink-0 flex-col border-l border-[#e2e8f0] bg-[#e8eaed] overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-[#f8fafc] border-b border-[#e2e8f0] flex-shrink-0">
                  <TemplateSelector />
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
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-[#059669] text-white text-xs font-medium rounded-lg hover:bg-[#047857] transition-colors"
                    >
                      <Download className="w-3 h-3" />
                      PDF
                    </button>
                  </div>
                </div>
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
  );
};

export default WindowrepairDashboard;
