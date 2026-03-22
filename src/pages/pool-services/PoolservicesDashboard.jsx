import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import HomeView from "../HomeView";
import BusinessSettingsModal from "../BusinessSettingsModal";
import AppHeader from "../AppHeader";
import { serverTimestamp } from "firebase/firestore";
import logo from "../../assets/img/solidflo-logo.png";
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
import { Printer, Download, Sparkles, Trash2, HardHat } from "lucide-react";
import { db } from "../../firebase";
import CustomerModal from "../CustomerModal";
import CustomersListModal from "../CustomersListModal";
import HistoryView from "./HistoryView";
import NotesView from "./NotesView";
import SignatureStamp from "../SignatureStamp";
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
  TrendingDown,
  CreditCard,
  Receipt,
  Wallet,
  ClipboardList,
  DollarSign,
  Building,
  Calculator,
  ArrowRight,
  MapPin,
  Wrench,
  Eye,
  Layers,
} from "lucide-react";

// ─── Number generation ──────────────────────────────────────────────────────
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
  const nextNumber = lastNumber + 1;
  return `${prefix}-${year}-${String(nextNumber).padStart(4, "0")}`;
};

const functions = getFunctions();

// ─── Design tokens ───────────────────────────────────────────────────────────
const inputCls =
  "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md bg-white text-[#1e293b] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-[#2563eb] transition-colors";
const labelCls =
  "block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5";
const selectCls =
  "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md bg-white text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-[#2563eb] transition-colors";

// ─── Stat card ───────────────────────────────────────────────────────────────
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

const statusBadge = (s) =>
  s === "paid"
    ? "bg-[#dcfce7] text-[#166534]"
    : s === "partially_paid"
      ? "bg-[#fef3c7] text-[#92400e]"
      : s === "pending"
        ? "bg-[#dbeafe] text-[#1e40af]"
        : "bg-[#fef2f2] text-[#991b1b]";

// ─── Main component ───────────────────────────────────────────────────────────
const PoolServicesDashboard = () => {
  // ── Step navigation ──────────────────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  const [aiWindowOpen, setAiWindowOpen] = useState(false);
  const [aiDocType, setAiDocType] = useState('invoice');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // ── Auth ─────────────────────────────────────────────────────────────────
  const { user, authUser } = useAuth();

  // ── Quote / invoice state ────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("Quote");
  const [quoteNumber, setQuoteNumber] = useState("");
  const [quoteId, setQuoteId] = useState(null);
  const [savedQuotes, setSavedQuotes] = useState([]);
  const [showQuotesList, setShowQuotesList] = useState(false);
  const [documentType, setDocumentType] = useState("quote");
  const [showAIWindow, setShowAIWindow] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeView, setActiveView] = useState("home");
  const [showCustomersListModal, setShowCustomersListModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // ── Customers ────────────────────────────────────────────────────────────
  const [customers, setCustomers] = useState([]);
  const [savedCustomers, setSavedCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // ── Template & input mode ────────────────────────────────────────────────
  const [selectedTemplate, setSelectedTemplate] = useState("professional");
  const [inputMode, setInputMode] = useState("manual");

  // ── Payment ──────────────────────────────────────────────────────────────
  const [selectedQuoteForPayment, setSelectedQuoteForPayment] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState({
    totalPaid: 0,
    balanceDue: 0,
    status: "pending",
  });

  // ── Sidebar dropdowns ────────────────────────────────────────────────────
  const [isQuotesInvoicesOpen2, setIsQuotesInvoicesOpen2] = useState(false);
  const [isClientsOpen, setIsClientsOpen] = useState(false);

  // ── Stamp ────────────────────────────────────────────────────────────────
  const [stampSettings, setStampSettings] = useState({
    text: "PAID",
    color: "#22c55e",
    showDate: true,
    enabled: true,
  });

  const location = useLocation();
  useEffect(() => {
    if (location.state?.activeView) setActiveView(location.state.activeView);
  }, [location.state]);

  // ── Client / site fields ─────────────────────────────────────────────────
  const [customerName, setCustomerName] = useState("Meridian Developments");
  const [customerEmail, setCustomerEmail] = useState("projects@meridian.co.za");
  const [customerPhone, setCustomerPhone] = useState("+27 11 234 5678");
  const [propertyAddress, setPropertyAddress] = useState(
    "45 Corporate Boulevard, Sandton, Johannesburg, 2196",
  );

  // ── Site-detail fields ───────────────────────────────────────────────────
  const [siteType, setSiteType] = useState("Commercial");
  const [siteSize, setSiteSize] = useState("1200");
  const [floors, setFloors] = useState("3");
  const [phases, setPhases] = useState("2");

  // ── Business info ────────────────────────────────────────────────────────
  const [businessInfo, setBusinessInfo] = useState({
    businessName: "APEX CONSTRUCTION CO.",
    addressLine1: "12 Industrial Park",
    addressLine2: "Kempton Park",
    city: "Johannesburg",
    postalCode: "1619",
    primaryPhone: "+27 11 777 0001",
    secondaryPhone: "+27 11 777 0002",
    email: "info@apexconstruction.co.za",
    website: "www.apexconstruction.co.za",
    registrationNumber: "2023/089412/07",
    vatNumber: "7891234567",
    logoUrl: "",
  });
  const [loading, setLoading] = useState(true);

  // ── Line-item state ──────────────────────────────────────────────────────
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({
    description: "",
    rate: "",
    qty: "",
    workCategory: "Foundation Work",
    taxRate: "15",
    phase: "Phase 1",
  });

  // ── Stats ────────────────────────────────────────────────────────────────
  const [stats, setStats] = useState({
    totalQuotes: 0,
    totalInvoices: 0,
    totalInvoiced: 0,
    totalClients: 0,
    pendingPayments: 0,
    loading: true,
  });
  const [recentDocs, setRecentDocs] = useState([]);

  // ── Derived totals ───────────────────────────────────────────────────────
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const totalTax = items.reduce((sum, item) => sum + item.taxAmount, 0);
  const total = subtotal + totalTax;

  // ── Step definitions ─────────────────────────────────────────────────────
  const steps = [
    { number: 1, title: "Client Info", icon: Users },
    { number: 2, title: "Site Details", icon: Building },
    { number: 3, title: "Scope of Work", icon: Wrench },
    { number: 4, title: "Schedule & Payment", icon: Calendar },
  ];

  const formatCurrency = (n) =>
    new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
    }).format(n);

  // ── Effects ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user?.uid) return;
    const loadQuoteNumber = async () => {
      const next = await generateQuoteNumber(user.uid, documentType);
      setQuoteNumber(next);
    };
    loadQuoteNumber();
    loadSavedQuotes();
  }, [user, documentType]);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      setSidebarOpen(width >= 1024);
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
    if (user?.uid) {
      loadBusinessInfo();
      fetchStats();
    }
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
    if (!quoteId)
      setPaymentStatus({ totalPaid: 0, balanceDue: total, status: "pending" });
  }, [total, quoteId]);

  // ── Fetch stats ───────────────────────────────────────────────────────────
  const fetchStats = async () => {
    if (!user?.uid) return;
    try {
      const db = getFirestore();
      const invoicesSnap = await getDocs(
        collection(db, "users", user.uid, "invoices"),
      );
      let totalInvoiced = 0,
        pendingPayments = 0;
      const docs = [];
      invoicesSnap.forEach((d) => {
        const data = d.data();
        totalInvoiced += parseFloat(data.totals?.total || 0);
        if (["pending", "partially_paid"].includes(data.status))
          pendingPayments += parseFloat(
            data.totals?.due || data.totals?.total || 0,
          );
        docs.push({ id: d.id, ...data });
      });
      docs.sort((a, b) => {
        const t = (x) => x.createdAt?.toDate?.()?.getTime() || 0;
        return t(b) - t(a);
      });
      setRecentDocs(docs);

      let quoteCount = 0;
      try {
        const qSnap = await getDocs(
          collection(db, "users", user.uid, "quotes"),
        );
        quoteCount = qSnap.docs.length;
      } catch (_) {}

      let clientCount = 0;
      try {
        const cSnap = await getDocs(
          collection(db, "users", user.uid, "clients"),
        );
        clientCount = cSnap.docs.length;
      } catch (_) {}

      setStats({
        totalQuotes: quoteCount,
        totalInvoices: invoicesSnap.docs.length,
        totalInvoiced,
        totalClients: clientCount,
        pendingPayments,
        loading: false,
      });
    } catch (e) {
      setStats((p) => ({ ...p, loading: false }));
    }
  };

  // ── Data loaders ─────────────────────────────────────────────────────────
  const loadCustomers = async () => {
    try {
      const q = query(
        collection(db, "users", user.uid, "clients"),
        orderBy("createdAt", "desc"),
      );
      const snap = await getDocs(q);
      const data = [];
      snap.forEach((d) => data.push({ id: d.id, ...d.data() }));
      setCustomers(data);
    } catch (error) {
      console.error("Error loading customers:", error);
    }
  };

  const loadSavedQuotes = async () => {
    if (!user?.uid) return;
    const db = getFirestore();
    const collectionName = documentType === "quote" ? "quotes" : "invoices";
    const quotesRef = collection(db, "users", user.uid, collectionName);
    const q = query(quotesRef, orderBy("createdAt", "desc"), limit(50));
    const snapshot = await getDocs(q);
    setSavedQuotes(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  const loadSavedCustomers = async () => {
    if (!user?.uid) return;
    const db = getFirestore();
    const customersRef = collection(db, "users", user.uid, "clients");
    const q = query(customersRef, orderBy("createdAt", "desc"), limit(50));
    const snapshot = await getDocs(q);
    setSavedCustomers(
      snapshot.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((c) => !c._placeholder),
    );
  };

  const loadBusinessInfo = async () => {
    if (!user?.uid) return;
    try {
      const db = getFirestore();
      const docRef = doc(db, "users", user.uid, "settings", "businessInfo");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setBusinessInfo(data);
        if (data.stampSettings) setStampSettings(data.stampSettings);
      }
    } catch (error) {
      console.error("Error loading business info:", error);
    }
  };

  const loadPaymentStatus = async () => {
    if (!user?.uid || !quoteId) {
      setPaymentStatus({ totalPaid: 0, balanceDue: total, status: "pending" });
      return;
    }
    try {
      const collectionName = documentType === "quote" ? "quotes" : "invoices";
      const quoteDoc = await getDoc(
        doc(db, "users", user.uid, collectionName, quoteId),
      );
      if (quoteDoc.exists()) {
        const data = quoteDoc.data();
        setPaymentStatus({
          totalPaid: data.totals?.paid || 0,
          balanceDue: data.totals?.due || data.totals?.total || 0,
          status: data.status || "pending",
        });
      } else {
        setPaymentStatus({
          totalPaid: 0,
          balanceDue: total,
          status: "pending",
        });
      }
    } catch (error) {
      setPaymentStatus({ totalPaid: 0, balanceDue: total, status: "pending" });
    }
  };

  const loadQuoteForExport = async () => {
    if (!user?.uid || !quoteId) return null;
    const db = getFirestore();
    const collectionName = documentType === "quote" ? "quotes" : "invoices";
    const snap = await getDoc(
      doc(db, "users", user.uid, collectionName, quoteId),
    );
    return snap.exists() ? snap.data() : null;
  };

  // ── Handlers – customers ─────────────────────────────────────────────────
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
    setPropertyAddress(customer.address || "");
  };
  const handleCustomerSaved = () => {
    loadCustomers();
  };

  // ── Handlers – quote / invoice CRUD ─────────────────────────────────────
  const loadQuote = (quote) => {
    setQuoteId(quote.id);
    setQuoteNumber(quote.quoteNumber || "");
    setCustomerName(quote.customer?.name || "");
    setCustomerEmail(quote.customer?.email || "");
    setCustomerPhone(quote.customer?.phone || "");
    setPropertyAddress(quote.customer?.address || "");
    setSiteType(quote.siteDetails?.type || "");
    setSiteSize(quote.siteDetails?.size || "");
    setFloors(quote.siteDetails?.floors || "");
    setPhases(quote.siteDetails?.phases || "");
    setItems(quote.items || []);
    setShowQuotesList(false);
    setPaymentStatus({
      totalPaid: quote.totals?.paid || 0,
      balanceDue: quote.totals?.due || quote.totals?.total || 0,
      status: quote.status || "pending",
    });
    setActiveView("quote");
  };

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
    siteDetails: { type: siteType, size: siteSize, floors, phases },
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
    const quoteData = buildQuotePayload(numberToUse);
    const collectionName = documentType === "quote" ? "quotes" : "invoices";
    if (quoteId) {
      await updateDoc(doc(db, "users", user.uid, collectionName, quoteId), {
        ...quoteData,
        updatedAt: serverTimestamp(),
      });
    } else {
      const ref = await addDoc(
        collection(db, "users", user.uid, collectionName),
        quoteData,
      );
      setQuoteId(ref.id);
    }
    alert(
      `${documentType === "quote" ? "Quote" : "Invoice"} saved successfully`,
    );
    loadSavedQuotes();
    fetchStats();
  };

  const handleConvertToInvoice = async () => {
    if (!user?.uid) return;
    if (!quoteId) {
      alert("Please save the quote first before converting to invoice");
      return;
    }
    if (
      !window.confirm(
        "Convert this quote to an invoice? This will create a new invoice with the same details.",
      )
    )
      return;
    try {
      const db = getFirestore();
      const newInvoiceNumber = await generateQuoteNumber(user.uid, "invoice");
      const invoiceData = buildQuotePayload(newInvoiceNumber);
      invoiceData.documentType = "invoice";
      invoiceData.convertedFromQuote = quoteId;
      invoiceData.convertedFromQuoteNumber = quoteNumber;
      invoiceData.convertedAt = serverTimestamp();
      const invoiceRef = await addDoc(
        collection(db, "users", user.uid, "invoices"),
        invoiceData,
      );
      await updateDoc(doc(db, "users", user.uid, "quotes", quoteId), {
        convertedToInvoice: true,
        convertedToInvoiceId: invoiceRef.id,
        convertedToInvoiceNumber: newInvoiceNumber,
        convertedAt: serverTimestamp(),
        status: "converted",
      });
      setDocumentType("invoice");
      setQuoteId(invoiceRef.id);
      setQuoteNumber(newInvoiceNumber);
      alert(`Quote successfully converted to Invoice ${newInvoiceNumber}`);
      loadSavedQuotes();
    } catch (error) {
      alert("Failed to convert quote to invoice");
    }
  };

  // ── Handlers – new document ──────────────────────────────────────────────
  const handleNewDocument = () => {
    setQuoteId(null);
    setQuoteNumber("");
    setCustomerName("Meridian Developments");
    setCustomerEmail("projects@meridian.co.za");
    setCustomerPhone("+27 11 234 5678");
    setPropertyAddress("45 Corporate Boulevard, Sandton, Johannesburg, 2196");
    setSiteType("Commercial");
    setSiteSize("1200");
    setFloors("3");
    setPhases("2");
    setItems([]);
    setCurrentStep(1);
    const loadNewNumber = async () => {
      if (user?.uid) {
        const next = await generateQuoteNumber(user.uid, documentType);
        setQuoteNumber(next);
      }
    };
    loadNewNumber();
  };

  const handleNewQuote = () => {
    setDocumentType("quote");
    handleNewDocument();
  };
  const handleNewInvoice = () => {
    setDocumentType("invoice");
    handleNewDocument();
  };

  // ── Handlers – line items ────────────────────────────────────────────────
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
        workCategory: newItem.workCategory || "Foundation Work",
        rate,
        qty,
        amount,
        taxRate,
        taxAmount,
        totalAmount: amount + taxAmount,
        phase: newItem.phase || "Phase 1",
      },
    ]);
    setNewItem({
      description: "",
      rate: "",
      qty: "",
      workCategory: "Foundation Work",
      taxRate: "15",
      phase: "Phase 1",
    });
  };

  const handleRemoveItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Handlers – payment ───────────────────────────────────────────────────
  const handleProcessPayment = async () => {
    if (!quoteId || !user?.uid) {
      alert("Please save the quote before processing payment");
      return;
    }
    try {
      const collectionName = documentType === "quote" ? "quotes" : "invoices";
      const quoteDoc = await getDoc(
        doc(db, "users", user.uid, collectionName, quoteId),
      );
      if (quoteDoc.exists()) {
        setSelectedQuoteForPayment({ id: quoteId, ...quoteDoc.data() });
        setShowPaymentModal(true);
      } else {
        alert("Quote not found. Please save the quote first.");
      }
    } catch (error) {
      alert("Failed to load quote for payment");
    }
  };

  const handlePaymentComplete = () => {
    loadSavedQuotes();
    loadPaymentStatus();
    setShowPaymentModal(false);
    fetchStats();
  };

  // ── Handlers – settings / logo / print / PDF ─────────────────────────────
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user?.uid || !authUser) return;
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }
    try {
      setBusinessInfo((prev) => ({ ...prev, uploading: true }));
      const logoUrl = await uploadLogoToR2(file, authUser);
      setBusinessInfo((prev) => ({ ...prev, logoUrl, uploading: false }));
      const db = getFirestore();
      await setDoc(
        doc(db, "users", user.uid, "settings", "businessInfo"),
        { logoUrl, updatedAt: new Date().toISOString() },
        { merge: true },
      );
      alert("Logo uploaded successfully!");
    } catch (error) {
      alert("Failed to upload logo: " + error.message);
      setBusinessInfo((prev) => ({ ...prev, uploading: false }));
    }
  };

  const handleSaveBusinessInfo = async () => {
    if (!user?.uid) return;
    try {
      const db = getFirestore();
      await setDoc(doc(db, "users", user.uid, "settings", "businessInfo"), {
        ...businessInfo,
        stampSettings,
      });
      alert("Business information saved successfully!");
      setShowSettings(false);
    } catch (error) {
      alert("Failed to save business information");
    }
  };

  const printStyles = `@media print { body * { visibility: hidden !important; } #print-area, #print-area * { visibility: visible !important; } #print-area { display: block !important; position: absolute !important; left: 0 !important; top: 0 !important; width: 210mm !important; min-height: 297mm !important; margin: 0 !important; padding: 10mm !important; box-sizing: border-box !important; background: white !important; } @page { size: A4 portrait; margin: 0; } html, body { margin: 0 !important; padding: 0 !important; width: 210mm !important; height: 297mm !important; background: white !important; } * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } }`;

  const handlePrint = () => {
    const styleSheet = document.createElement("style");
    styleSheet.textContent = printStyles;
    document.head.appendChild(styleSheet);
    window.print();
    setTimeout(() => document.head.removeChild(styleSheet), 1000);
  };

  const handleSavePDF = async () => {
    const savedQuote = await loadQuoteForExport();
    if (!savedQuote) {
      alert(`Please save the ${documentType} before exporting PDF`);
      return;
    }
    setQuoteNumber(savedQuote.quoteNumber);
    setItems(savedQuote.items);
    setCustomerName(savedQuote.customer.name);
    setCustomerEmail(savedQuote.customer.email);
    setCustomerPhone(savedQuote.customer.phone);
    setPropertyAddress(savedQuote.customer.address);
    setTimeout(() => window.print(), 300);
  };

  // ── AI extraction ────────────────────────────────────────────────────────
  const handleAIDataExtracted = (extractedData) => {
    if (extractedData.customer?.name)
      setCustomerName(extractedData.customer.name);
    if (extractedData.customer?.email)
      setCustomerEmail(extractedData.customer.email);
    if (extractedData.customer?.phone)
      setCustomerPhone(extractedData.customer.phone);
    if (extractedData.customer?.address)
      setPropertyAddress(extractedData.customer.address);
    if (extractedData.items?.length > 0) setItems(extractedData.items);
    alert("✨ Data extracted and populated successfully!");
  };

  const handleNext = () => {
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };
  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleLogout = async () => {
    try {
      await signOut(getAuth());
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // ── Template props ────────────────────────────────────────────────────────
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

  // ── Header action buttons ─────────────────────────────────────────────────
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

  // ── Home view ─────────────────────────────────────────────────────────────
  const HomeViewLocal = () => (
    <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-4">
      {/* Stat cards */}
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

      {/* Pending + Quick actions */}
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
                  setActiveView("quote");
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
                  setActiveView("quote");
                },
                bg: "bg-[#f0fdfa]",
                hover: "hover:bg-[#ccfbf1]",
                border: "border-[#99f6e4]",
                iconBg: "bg-[#0d9488]",
                text: "text-[#0f766e]",
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

      {/* Recent documents */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#e2e8f0] bg-[#f8fafc]">
          <h3 className="text-sm font-semibold text-[#1e293b]">
            Recent Documents
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
          ) : recentDocs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-10 h-10 mb-3 bg-[#f1f5f9] rounded-full flex items-center justify-center">
                <FileText className="w-5 h-5 text-[#94a3b8]" />
              </div>
              <p className="text-sm font-medium text-[#374151] mb-1">
                No documents yet
              </p>
              <p className="text-xs text-[#94a3b8] mb-3">
                Create your first quote or invoice to get started
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
            recentDocs.slice(0, 8).map((doc) => (
              <div
                key={doc.id}
                onClick={() => loadQuote(doc)}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-[#f8fafc] cursor-pointer transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-[#1e293b] truncate">
                      {doc.quoteNumber || doc.id}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-semibold flex-shrink-0 ${statusBadge(doc.status)}`}
                    >
                      {doc.status === "partially_paid"
                        ? "Partial"
                        : doc.status || "Draft"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[#64748b]">
                    <span className="flex items-center gap-1 truncate">
                      <Users className="w-3 h-3 flex-shrink-0" />
                      {doc.customer?.name || "No client"}
                    </span>
                    <span className="flex items-center gap-1 truncate">
                      <Building className="w-3 h-3 flex-shrink-0" />
                      {doc.siteDetails?.type || "No site info"}
                    </span>
                  </div>
                </div>
                <div className="text-right ml-4 flex-shrink-0">
                  <div className="text-sm font-bold text-[#1e293b]">
                    {formatCurrency(doc.totals?.total || 0)}
                  </div>
                  {doc.totals?.due > 0 &&
                    doc.totals?.due < doc.totals?.total && (
                      <div className="text-xs text-[#d97706]">
                        Due: {formatCurrency(doc.totals.due)}
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

  // ═════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═════════════════════════════════════════════════════════════════════════
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
    industry="pool-services"
    onNavigateTo={(view) => {
    setAiWindowOpen(false);
    setActiveView(view); 
  }}
    TemplateRenderer={TemplateRenderer}   
  />
            )}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* ── Sidebar backdrop (mobile) ──────────────────────────────────── */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── Collapsed Sidebar ──────────────────────────────────────────── */}
        <div
          className={`${sidebarOpen ? "hidden" : "hidden md:flex"} fixed z-40 w-16 bg-[#0f172a] border-r border-[#1e293b] h-full flex-col items-center py-4 space-y-3 print:hidden`}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-[#64748b] hover:text-white hover:bg-[#1e293b] rounded-lg transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <div className="w-9 h-9 rounded-lg overflow-hidden flex items-center justify-center">
            <img src={logo} className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col items-center space-y-2 w-full px-2 pt-2">
            {[
              {
                icon: Home,
                onClick: () => setActiveView("home"),
                title: "Home",
                color: "text-[#38bdf8]",
              },
              {
                icon: Settings,
                onClick: () => setShowSettings(true),
                title: "Settings",
                color: "text-[#64748b]",
              },
              {
                icon: TrendingUp,
                onClick: () => setActiveView("financial-overview"),
                title: "Financial",
                color: "text-[#64748b]",
              },
              {
                icon: Receipt,
                onClick: () => {
                  handleNewInvoice();
                  setActiveView("quote");
                },
                title: "Quotes & Invoices",
                color: "text-[#64748b]",
              },
              {
                icon: Users,
                onClick: () => setShowCustomersListModal(true),
                title: "Clients",
                color: "text-[#64748b]",
              },
            ].map(({ icon: Icon, onClick, title, color }) => (
              <button
                key={title}
                onClick={onClick}
                title={title}
                className={`group relative p-2 ${color} hover:text-white hover:bg-[#1e293b] rounded-lg transition-all w-10 h-10 flex items-center justify-center`}
              >
                <Icon className="w-5 h-5" />
              </button>
            ))}
          </div>
          <div className="absolute bottom-4">
            <div className="w-9 h-9 bg-[#1e293b] rounded-full flex items-center justify-center ring-1 ring-[#334155]">
              {businessInfo.logoUrl ? (
                <img
                  src={businessInfo.logoUrl}
                  className="w-6 h-6 object-contain"
                />
              ) : (
                <HardHat className="w-4 h-4 text-[#64748b]" />
              )}
            </div>
          </div>
        </div>

        {/* ── Expanded Sidebar ───────────────────────────────────────────── */}
        <div
          className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} fixed z-50 w-64 md:w-64 bg-[#0f172a] border-r border-[#1e293b] transition-transform duration-300 h-full print:hidden shadow-2xl overflow-y-auto flex flex-col`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#1e293b]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg overflow-hidden">
                <img src={logo} className="w-full h-full object-contain" />
              </div>
              <span className="text-sm font-bold text-white truncate">
                {businessInfo.businessName || "Construction Co."}
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 text-[#64748b] hover:text-white hover:bg-[#1e293b] rounded-lg transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 p-3 space-y-1">
            {[
              {
                label: "Home",
                icon: Home,
                view: "home",
                color: "hover:bg-[#1e3a5f]",
                active: activeView === "home",
              },
              {
                label: "Settings",
                icon: Settings,
                onClick: () => {
                  setShowSettings(true);
                  setSidebarOpen(false);
                },
                color: "hover:bg-[#1e293b]",
              },
            ].map(({ label, icon: Icon, view, onClick, color, active }) => (
              <div
                key={label}
                onClick={
                  onClick ||
                  (() => {
                    setActiveView(view);
                    setSidebarOpen(false);
                  })
                }
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all text-sm font-medium ${active ? "bg-[#1e3a5f] text-[#38bdf8]" : `text-[#94a3b8] hover:text-white ${color}`}`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </div>
            ))}

            <div className="pt-3 border-t border-[#1e293b]">
              {/* Financial */}
              <div
                onClick={() => {
                  setActiveView("financial-overview");
                  setSidebarOpen(false);
                }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all text-sm font-medium mb-1 ${activeView === "financial-overview" ? "bg-[#1e3a5f] text-[#38bdf8]" : "text-[#94a3b8] hover:text-white hover:bg-[#1e293b]"}`}
              >
                <TrendingUp className="w-4 h-4 flex-shrink-0" />
                Financial Dashboard
              </div>

              {/* Quotes & Invoices dropdown */}
              <div>
                <div
                  onClick={() =>
                    setIsQuotesInvoicesOpen2(!isQuotesInvoicesOpen2)
                  }
                  className="flex items-center justify-between px-3 py-2.5 text-[#94a3b8] hover:text-white hover:bg-[#1e293b] rounded-lg cursor-pointer transition-all text-sm font-medium"
                >
                  <div className="flex items-center gap-3">
                    <Receipt className="w-4 h-4 flex-shrink-0" />
                    Quotes & Invoices
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${isQuotesInvoicesOpen2 ? "rotate-180" : ""}`}
                  />
                </div>
                <div
                  className={`ml-4 mt-1 space-y-0.5 border-l border-[#1e293b] pl-3 overflow-hidden transition-all duration-200 ${isQuotesInvoicesOpen2 ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}
                >
                  {[
                    {
                      label: "Create Quote",
                      dot: "bg-[#2563eb]",
                      onClick: () => {
                        handleNewQuote();
                        setActiveView("quote");
                        if (isMobile) setSidebarOpen(false);
                      },
                    },
                    {
                      label: "Create Invoice",
                      dot: "bg-[#059669]",
                      onClick: () => {
                        handleNewInvoice();
                        setActiveView("quote");
                        if (isMobile) setSidebarOpen(false);
                      },
                    },
                    {
                      label: `All ${documentType === "quote" ? "Quotes" : "Invoices"}`,
                      dot: "bg-[#7c3aed]",
                      badge: savedQuotes.length,
                      onClick: () => {
                        setShowQuotesList(!showQuotesList);
                        if (isMobile) setSidebarOpen(false);
                      },
                    },
                  ].map(({ label, dot, badge, onClick }) => (
                    <div
                      key={label}
                      onClick={onClick}
                      className="flex items-center justify-between py-2 px-2 text-xs text-[#64748b] hover:text-white hover:bg-[#1e293b] rounded-lg cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                        {label}
                      </div>
                      {badge !== undefined && (
                        <span className="bg-[#2563eb] text-white px-1.5 py-0.5 rounded text-xs font-bold">
                          {badge}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Clients dropdown */}
              <div className="mt-1">
                <div
                  onClick={() => setIsClientsOpen(!isClientsOpen)}
                  className="flex items-center justify-between px-3 py-2.5 text-[#94a3b8] hover:text-white hover:bg-[#1e293b] rounded-lg cursor-pointer transition-all text-sm font-medium"
                >
                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4 flex-shrink-0" />
                    Clients
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${isClientsOpen ? "rotate-180" : ""}`}
                  />
                </div>
                <div
                  className={`ml-4 mt-1 space-y-0.5 border-l border-[#1e293b] pl-3 overflow-hidden transition-all duration-200 ${isClientsOpen ? "max-h-32 opacity-100" : "max-h-0 opacity-0"}`}
                >
                  {[
                    {
                      label: "Add Client",
                      dot: "bg-[#059669]",
                      onClick: () => {
                        handleAddNewCustomer();
                        if (isMobile) setSidebarOpen(false);
                      },
                    },
                    {
                      label: "All Clients",
                      dot: "bg-[#2563eb]",
                      badge: savedCustomers.length,
                      onClick: () => {
                        setShowCustomersListModal(true);
                        if (isMobile) setSidebarOpen(false);
                      },
                    },
                  ].map(({ label, dot, badge, onClick }) => (
                    <div
                      key={label}
                      onClick={onClick}
                      className="flex items-center justify-between py-2 px-2 text-xs text-[#64748b] hover:text-white hover:bg-[#1e293b] rounded-lg cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                        {label}
                      </div>
                      {badge !== undefined && (
                        <span className="bg-[#7c3aed] text-white px-1.5 py-0.5 rounded text-xs font-bold">
                          {badge}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {!isMobile && (
                <div className="mt-1 space-y-0.5">
                  {[
                    { label: "Schedule", icon: Calendar, view: "schedule" },
                    { label: "Reports", icon: BarChart3, view: "reports" },
                  ].map(({ label, icon: Icon, view }) => (
                    <div
                      key={label}
                      onClick={() => {
                        setActiveView(view);
                        setSidebarOpen(false);
                      }}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all text-sm font-medium ${activeView === view ? "bg-[#1e3a5f] text-[#38bdf8]" : "text-[#94a3b8] hover:text-white hover:bg-[#1e293b]"}`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      {label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Sidebar footer */}
          <div className="p-4 border-t border-[#1e293b]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#1e293b] rounded-full flex items-center justify-center ring-1 ring-[#334155] flex-shrink-0">
                {businessInfo.logoUrl ? (
                  <img
                    src={businessInfo.logoUrl}
                    className="w-6 h-6 object-contain"
                  />
                ) : (
                  <HardHat className="w-4 h-4 text-[#64748b]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-white truncate">
                  {user?.name || "User"}
                </div>
                <div className="text-xs text-[#64748b] truncate">
                  {user?.email || "email@example.com"}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 text-[#64748b] hover:text-[#ef4444] hover:bg-[#1e293b] rounded-lg transition-all"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Main content ──────────────────────────────────────────────────── */}
        <div
          className={`flex-1 overflow-hidden flex flex-col min-h-0 transition-all duration-300 ${sidebarOpen ? "ml-0 lg:ml-64" : "ml-0 md:ml-16"}`}
        >
          <AppHeader
            actions={headerActions}
            mobileActions={mobileDashboardActions}
            onSettingsOpen={() => setShowSettings(true)}
          />

          {/* ── Modals ────────────────────────────────────────────────────── */}
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

          {/* ── Saved Quotes / Invoices List Modal ────────────────────────── */}
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
                            "Site",
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
                        {savedQuotes.map((quote) => (
                          <tr
                            key={quote.id}
                            onClick={() => loadQuote(quote)}
                            className="border-b border-[#f1f5f9] hover:bg-[#f8fafc] cursor-pointer transition-colors"
                          >
                            <td className="px-5 py-3 text-sm font-semibold text-[#2563eb]">
                              {quote.quoteNumber || "N/A"}
                            </td>
                            <td className="px-5 py-3 text-sm text-[#374151]">
                              {quote.customer?.name || "N/A"}
                            </td>
                            <td className="px-5 py-3 text-sm text-[#374151]">
                              {quote.siteDetails?.type || "N/A"}
                            </td>
                            <td className="px-5 py-3 text-sm font-semibold text-[#1e293b]">
                              {formatCurrency(quote.totals?.total || 0)}
                            </td>
                            <td className="px-5 py-3 text-sm text-[#059669] font-medium">
                              {formatCurrency(quote.totals?.paid || 0)}
                            </td>
                            <td className="px-5 py-3">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${statusBadge(quote.status)}`}
                              >
                                {quote.status === "partially_paid"
                                  ? "Partial"
                                  : quote.status || "Pending"}
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

          {/* ── Invoice Preview Modal ──────────────────────────────────────── */}
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

          {/* ── Alternate views ────────────────────────────────────────────── */}
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
          {activeView === "home" && <HomeViewLocal />}

          {/* ── Quote / Invoice Builder ────────────────────────────────────── */}
          {activeView === "quote" && (
            <div className="flex-1 overflow-hidden flex min-h-0">
              {/* ── LEFT: Form panel ─────────────────────────────────────── */}
              <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 min-w-0">
                <div className="space-y-5">
                  {/* Summary stat cards */}
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      {
                        label: "Total Amount",
                        value: `R${total.toFixed(2)}`,
                        icon: DollarSign,
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
                            ? "Quote Fully Paid"
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
                          {/* Step 1 – Client Information */}
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
                                    Enter client / contractor details
                                  </p>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[
                                  {
                                    label: "Client / Company Name",
                                    value: customerName,
                                    set: setCustomerName,
                                    placeholder: "Meridian Developments",
                                    required: true,
                                  },
                                  {
                                    label: "Email",
                                    value: customerEmail,
                                    set: setCustomerEmail,
                                    type: "email",
                                    placeholder: "projects@company.co.za",
                                    required: true,
                                  },
                                  {
                                    label: "Phone",
                                    value: customerPhone,
                                    set: setCustomerPhone,
                                    type: "tel",
                                    placeholder: "+27 11 234 5678",
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
                                    Site Address{" "}
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
                                    placeholder="45 Corporate Boulevard, Sandton, Johannesburg, 2196"
                                    className={inputCls}
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Step 2 – Site Details */}
                          {currentStep === 2 && (
                            <div>
                              <div className="flex items-center gap-3 mb-5">
                                <div className="w-9 h-9 bg-[#fff7ed] rounded-lg flex items-center justify-center">
                                  <Building className="w-5 h-5 text-[#ea580c]" />
                                </div>
                                <div>
                                  <h2 className="text-base font-semibold text-[#1e293b]">
                                    Site Details
                                  </h2>
                                  <p className="text-xs text-[#64748b]">
                                    Provide site specifications for an accurate
                                    quote
                                  </p>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                  <label className={labelCls}>
                                    Site / Project Type
                                  </label>
                                  <select
                                    value={siteType}
                                    onChange={(e) =>
                                      setSiteType(e.target.value)
                                    }
                                    className={selectCls}
                                  >
                                    {[
                                      "Commercial",
                                      "Residential",
                                      "Industrial",
                                      "Infrastructure",
                                      "Renovation",
                                      "Government",
                                    ].map((t) => (
                                      <option key={t} value={t}>
                                        {t}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                {[
                                  {
                                    label: "Site Area (sqm)",
                                    value: siteSize,
                                    set: setSiteSize,
                                    placeholder: "1200",
                                  },
                                  {
                                    label: "Number of Floors / Storeys",
                                    value: floors,
                                    set: setFloors,
                                    placeholder: "3",
                                  },
                                  {
                                    label: "Number of Phases",
                                    value: phases,
                                    set: setPhases,
                                    placeholder: "2",
                                  },
                                ].map(({ label, value, set, placeholder }) => (
                                  <div key={label}>
                                    <label className={labelCls}>{label}</label>
                                    <input
                                      type="number"
                                      value={value}
                                      onChange={(e) => set(e.target.value)}
                                      placeholder={placeholder}
                                      className={inputCls}
                                    />
                                  </div>
                                ))}
                              </div>
                              <div className="mt-4 p-3.5 bg-[#fff7ed] border border-[#fed7aa] rounded-lg">
                                <div className="flex items-center gap-2 text-sm text-[#9a3412] font-medium">
                                  <MapPin className="w-4 h-4" />
                                  <span>
                                    {siteType} · {siteSize} sqm · {floors} floor
                                    {floors !== "1" ? "s" : ""} · {phases} phase
                                    {phases !== "1" ? "s" : ""}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Step 3 – Scope of Work */}
                          {currentStep === 3 && (
                            <div>
                              <div className="flex items-center gap-3 mb-5">
                                <div className="w-9 h-9 bg-[#f8fafc] rounded-lg flex items-center justify-center">
                                  <Wrench className="w-5 h-5 text-[#475569]" />
                                </div>
                                <div>
                                  <h2 className="text-base font-semibold text-[#1e293b]">
                                    Scope of Work
                                  </h2>
                                  <p className="text-xs text-[#64748b]">
                                    Add work items and materials to the quote
                                  </p>
                                </div>
                              </div>

                              {/* Add item form */}
                              <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-5 mb-5">
                                <h3 className="text-sm font-semibold text-[#374151] mb-4 flex items-center gap-2">
                                  <Plus className="w-4 h-4 text-[#2563eb]" />
                                  Add New Item
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                                  <div>
                                    <label className={labelCls}>
                                      Work Category
                                    </label>
                                    <select
                                      value={newItem.workCategory}
                                      onChange={(e) =>
                                        setNewItem({
                                          ...newItem,
                                          workCategory: e.target.value,
                                        })
                                      }
                                      className={selectCls}
                                    >
                                      {[
                                        "Foundation Work",
                                        "Structural Steel",
                                        "Concrete & Masonry",
                                        "Electrical",
                                        "Plumbing",
                                        "Roofing",
                                        "Finishing & Plastering",
                                        "Earthworks",
                                        "Landscaping",
                                        "Site Preparation",
                                        "HVAC",
                                        "Windows & Doors",
                                        "Painting",
                                        "Tiling & Flooring",
                                        "Materials Supply",
                                      ].map((c) => (
                                        <option key={c} value={c}>
                                          {c}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                  <div>
                                    <label className={labelCls}>Phase</label>
                                    <select
                                      value={newItem.phase}
                                      onChange={(e) =>
                                        setNewItem({
                                          ...newItem,
                                          phase: e.target.value,
                                        })
                                      }
                                      className={selectCls}
                                    >
                                      {[
                                        "Phase 1",
                                        "Phase 2",
                                        "Phase 3",
                                        "Phase 4",
                                        "Ongoing",
                                      ].map((p) => (
                                        <option key={p} value={p}>
                                          {p}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                </div>
                                <div className="mb-3">
                                  <label className={labelCls}>
                                    Description
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="Work item / material description"
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
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                  <div>
                                    <label className={labelCls}>
                                      Unit Rate (R)
                                    </label>
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
                                      Add Item
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Items table */}
                              {items.length > 0 ? (
                                <div className="border border-[#e2e8f0] rounded-xl overflow-hidden mb-5">
                                  <div className="px-4 py-3 bg-[#f8fafc] border-b border-[#e2e8f0] flex items-center justify-between">
                                    <span className="text-sm font-semibold text-[#374151]">
                                      Work Items
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
                                            "Description",
                                            "Category",
                                            "Phase",
                                            "Rate",
                                            "Qty",
                                            "VAT",
                                            "Total",
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
                                                {item.workCategory || "General"}
                                              </span>
                                            </td>
                                            <td className="px-4 py-3">
                                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-[#fff7ed] text-[#9a3412]">
                                                {item.phase || "Phase 1"}
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
                                  {/* Totals footer */}
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
                                    No work items added yet
                                  </p>
                                  <p className="text-xs text-[#cbd5e1] mt-1">
                                    Use the form above to add services or
                                    materials
                                  </p>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Step 4 – Schedule & Payment */}
                          {currentStep === 4 && (
                            <div>
                              <div className="flex items-center gap-3 mb-5">
                                <div className="w-9 h-9 bg-[#f0fdf4] rounded-lg flex items-center justify-center">
                                  <Calendar className="w-5 h-5 text-[#059669]" />
                                </div>
                                <div>
                                  <h2 className="text-base font-semibold text-[#1e293b]">
                                    Schedule & Payment Terms
                                  </h2>
                                  <p className="text-xs text-[#64748b]">
                                    Review quote details, milestones, and
                                    payment terms
                                  </p>
                                </div>
                              </div>

                              {/* Summary cards */}
                              <div className="grid grid-cols-3 gap-3 mb-5">
                                {[
                                  {
                                    label: "Project Total",
                                    value: `R${total.toFixed(2)}`,
                                    icon: DollarSign,
                                    iconBg: "bg-[#eff6ff]",
                                    iconColor: "text-[#2563eb]",
                                    textColor: "text-[#1e293b]",
                                  },
                                  {
                                    label: "Work Items",
                                    value: items.length,
                                    icon: ClipboardList,
                                    iconBg: "bg-[#f0fdf4]",
                                    iconColor: "text-[#059669]",
                                    textColor: "text-[#1e293b]",
                                  },
                                  {
                                    label: "VAT Amount",
                                    value: `R${totalTax.toFixed(2)}`,
                                    icon: Calculator,
                                    iconBg: "bg-[#faf5ff]",
                                    iconColor: "text-[#7c3aed]",
                                    textColor: "text-[#1e293b]",
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
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs text-[#64748b] font-medium">
                                          {label}
                                        </span>
                                        <div
                                          className={`w-7 h-7 ${iconBg} rounded-lg flex items-center justify-center`}
                                        >
                                          <Icon
                                            className={`w-3.5 h-3.5 ${iconColor}`}
                                          />
                                        </div>
                                      </div>
                                      <div
                                        className={`text-xl font-bold ${textColor}`}
                                      >
                                        {value}
                                      </div>
                                    </div>
                                  ),
                                )}
                              </div>

                              {/* Payment info */}
                              <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden shadow-sm mb-5">
                                <div className="px-5 py-3.5 border-b border-[#e2e8f0] bg-[#f8fafc]">
                                  <span className="text-sm font-semibold text-[#374151]">
                                    Payment Information
                                  </span>
                                </div>
                                <div className="divide-y divide-[#f1f5f9]">
                                  {[
                                    ["Payment Schedule", "Milestone-Based"],
                                    [
                                      "Payment Methods",
                                      "Bank Transfer, Card, EFT",
                                    ],
                                    ["Quote Valid For", "30 Days"],
                                    ["Currency", "ZAR (South African Rand)"],
                                  ].map(([k, v]) => (
                                    <div
                                      key={k}
                                      className="flex items-center justify-between px-5 py-3 text-sm"
                                    >
                                      <span className="text-[#64748b]">
                                        {k}
                                      </span>
                                      <span className="font-semibold text-[#1e293b]">
                                        {v}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Quote summary */}
                              <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                  <div>
                                    <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wide mb-2">
                                      Client Details
                                    </p>
                                    <p className="text-sm font-bold text-[#1e293b]">
                                      {customerName}
                                    </p>
                                    <p className="text-xs text-[#64748b]">
                                      {customerEmail}
                                    </p>
                                    <p className="text-xs text-[#64748b]">
                                      {customerPhone}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wide mb-2">
                                      Site Details
                                    </p>
                                    <p className="text-sm font-bold text-[#1e293b]">
                                      {propertyAddress}
                                    </p>
                                    <p className="text-xs text-[#64748b]">
                                      {siteType} · {siteSize} sqm · {floors}{" "}
                                      floors · {phases} phases
                                    </p>
                                  </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-[#e2e8f0] grid grid-cols-2 gap-3 text-xs">
                                  {[
                                    ["Number", quoteNumber],
                                    ["Date", new Date().toLocaleDateString()],
                                    [
                                      "Type",
                                      documentType === "quote"
                                        ? "Quote"
                                        : "Invoice",
                                    ],
                                    ["Status", "Pending"],
                                  ].map(([k, v]) => (
                                    <div
                                      key={k}
                                      className="flex justify-between"
                                    >
                                      <span className="text-[#64748b]">
                                        {k}
                                      </span>
                                      <span className="font-semibold text-[#1e293b]">
                                        {v}
                                      </span>
                                    </div>
                                  ))}
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
                                <div className="mt-4 flex items-center gap-2 px-4 py-3 bg-[#fff7ed] border border-[#fed7aa] rounded-lg text-sm text-[#9a3412]">
                                  <Receipt className="w-4 h-4 flex-shrink-0" />
                                  Save the quote first to process payment
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Step nav bar */}
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

              {/* ── RIGHT: Live preview panel (xl only) ─────────────────────── */}
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

export default PoolServicesDashboard;
