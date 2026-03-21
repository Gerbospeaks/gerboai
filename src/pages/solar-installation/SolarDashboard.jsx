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
import { Printer, Download, Sparkles, Trash2, Sun } from "lucide-react";
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
  FileBarChart,
  MapPin,
  Eye,
  Wrench,
  ArrowRight,
  Zap,
  Battery,
} from "lucide-react";

// ─── Number generation ────────────────────────────────────────────────────────
const generateQuoteNumber = async (userId, documentType) => {
  const db = getFirestore();
  const year = new Date().getFullYear();
  const collectionName = documentType === "quote" ? "quotes" : "invoices";
  const prefix = documentType === "quote" ? "SQ" : "SI";
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

// ─── Design tokens ────────────────────────────────────────────────────────────
const inputCls =
  "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md bg-white text-[#1e293b] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-[#2563eb] transition-colors";
const labelCls =
  "block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5";
const selectCls =
  "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md bg-white text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-[#2563eb] transition-colors";

// ─── Stat card ────────────────────────────────────────────────────────────────
const StatCard = ({ title, value, icon: Icon, iconBg, iconColor, subtitle, loading: l, trend }) => (
  <div className="bg-white rounded-xl p-4 border border-[#e2e8f0] shadow-sm flex flex-col justify-between">
    <div className="flex items-center justify-between mb-3">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconBg}`}>
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </div>
      {trend !== undefined && (
        <span className={`flex items-center gap-0.5 text-xs font-semibold ${trend > 0 ? "text-[#059669]" : "text-[#dc2626]"}`}>
          {trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
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
          {subtitle && <p className="text-xs text-[#94a3b8] mt-0.5">{subtitle}</p>}
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

const formatCurrency = (n) =>
  `R${Number(n).toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// ─── Step indicator ────────────────────────────────────────────────────────────
const StepIndicator = ({ steps, currentStep }) => (
  <div className="flex items-center px-6 py-4 bg-[#f8fafc] border-b border-[#e2e8f0]">
    {steps.map((step, idx) => {
      const done = currentStep > step.number;
      const active = currentStep === step.number;
      const Icon = step.icon;
      return (
        <React.Fragment key={step.number}>
          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
              ${done ? "bg-[#dcfce7] ring-2 ring-[#059669] text-[#059669]" : active ? "bg-[#2563eb] text-white" : "bg-[#e2e8f0] text-[#94a3b8]"}`}>
              {done ? <CheckSquare className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
            </div>
            <span className={`text-xs font-semibold hidden sm:block ${active ? "text-[#2563eb]" : done ? "text-[#059669]" : "text-[#94a3b8]"}`}>
              {step.title}
            </span>
          </div>
          {idx < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mx-2 transition-all ${done ? "bg-[#059669]" : "bg-[#e2e8f0]"}`} />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

// ═════════════════════════════════════════════════════════════════════════════
const SolarDashboard = () => {
  // ── step navigation ────────────────────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  const [aiWindowOpen, setAiWindowOpen] = useState(false);
  const [aiDocType, setAiDocType] = useState('invoice');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // ── auth ──────────────────────────────────────────────────────────────────
  const { user, authUser } = useAuth();

  // ── quote / invoice state ──────────────────────────────────────────────────
  const [quoteNumber, setQuoteNumber] = useState("");
  const [quoteId, setQuoteId] = useState(null);
  const [savedQuotes, setSavedQuotes] = useState([]);
  const [showQuotesList, setShowQuotesList] = useState(false);
  const [documentType, setDocumentType] = useState("quote");

  // ── views / modals ─────────────────────────────────────────────────────────
  const [showSettings, setShowSettings] = useState(false);
  const [activeView, setActiveView] = useState("home");
  const [showCustomersListModal, setShowCustomersListModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [inputMode, setInputMode] = useState("manual");
  const [isInvoicingOpen, setIsInvoicingOpen] = useState(false);
  const [isClientsOpen, setIsClientsOpen] = useState(false);
  const [showAIWindow, setShowAIWindow] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [savedCustomers, setSavedCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedQuoteForPayment, setSelectedQuoteForPayment] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState({ totalPaid: 0, balanceDue: 0, status: "pending" });

  // ── stamp ──────────────────────────────────────────────────────────────────
  const [stampSettings, setStampSettings] = useState({ text: "PAID", color: "#22c55e", showDate: true, enabled: true });

  // ── template ───────────────────────────────────────────────────────────────
  const [selectedTemplate, setSelectedTemplate] = useState("professional");

  // ── stats ──────────────────────────────────────────────────────────────────
  const [stats, setStats] = useState({ totalQuotes: 0, totalRevenue: 0, totalClients: 0, pendingPayments: 0, loading: true });

  // ── client fields ──────────────────────────────────────────────────────────
  const [customerName, setCustomerName] = useState("Green Energy Solutions");
  const [customerEmail, setCustomerEmail] = useState("info@greenenergy.co.za");
  const [customerPhone, setCustomerPhone] = useState("+27 11 234 5678");
  const [propertyAddress, setPropertyAddress] = useState("45 Sunset Avenue, Sandton, Johannesburg, 2196");

  // ── site / property fields ─────────────────────────────────────────────────
  const [propertyType, setPropertyType] = useState("Residential");
  const [propertySize, setPropertySize] = useState("150");
  const [powerRating, setPowerRating] = useState("5");
  const [urgencyLevel, setUrgencyLevel] = useState("Standard");

  // ── solar-specific fields ──────────────────────────────────────────────────
  const [systemSize, setSystemSize] = useState("5");
  const [panelType, setPanelType] = useState("Monocrystalline");
  const [inverterType, setInverterType] = useState("Hybrid");
  const [batteryStorage, setBatteryStorage] = useState("10");
  const [roofType, setRoofType] = useState("Tile");
  const [roofOrientation, setRoofOrientation] = useState("North");
  const [roofPitch, setRoofPitch] = useState("30");
  const [shadingAnalysis, setShadingAnalysis] = useState("Minimal");

  // ── business info ──────────────────────────────────────────────────────────
  const [businessInfo, setBusinessInfo] = useState({
    businessName: "SOLARTECH INSTALLATIONS",
    addressLine1: "12 Solar Park Drive",
    addressLine2: "Midrand",
    city: "Johannesburg",
    postalCode: "1685",
    primaryPhone: "+27 11 555 0001",
    secondaryPhone: "+27 11 555 0002",
    email: "info@solartech.co.za",
    website: "www.solartech.co.za",
    registrationNumber: "2023/123456/07",
    vatNumber: "4567891234",
    logoUrl: "",
  });
  const [loading, setLoading] = useState(true);

  // ── line items ─────────────────────────────────────────────────────────────
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ description: "", rate: "", qty: "", workCategory: "Solar Panels", taxRate: "15", urgency: "Standard" });

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const totalTax = items.reduce((sum, item) => sum + item.taxAmount, 0);
  const total = subtotal + totalTax;

  const steps = [
    { number: 1, title: "Client Info", icon: Users },
    { number: 2, title: "Site Details", icon: Building },
    { number: 3, title: "Solar System", icon: Sun },
    { number: 4, title: "Review", icon: Calendar },
  ];

  const location = useLocation();
  useEffect(() => {
    if (location.state?.activeView) setActiveView(location.state.activeView);
  }, [location.state]);

  // ── Effects ────────────────────────────────────────────────────────────────
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

  useEffect(() => { loadCustomers(); }, []);
  useEffect(() => { loadPaymentStatus(); }, [quoteId, user?.uid, documentType]);
  useEffect(() => { if (user?.uid) { loadBusinessInfo(); fetchStats(); } }, [user]);

  useEffect(() => {
    const fetchBusinessInfo = async () => {
      if (!user?.uid) return;
      try {
        const db = getFirestore();
        const docRef = doc(db, "users", user.uid, "settings", "businessInfo");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) setBusinessInfo(docSnap.data());
      } catch (error) { console.error("Error fetching business info:", error); }
      finally { setLoading(false); }
    };
    fetchBusinessInfo();
  }, [user]);

  useEffect(() => {
    if (!quoteId) setPaymentStatus({ totalPaid: 0, balanceDue: total, status: "pending" });
  }, [total, quoteId]);

  // ── Fetch stats ────────────────────────────────────────────────────────────
  const fetchStats = async () => {
    if (!user?.uid) return;
    try {
      const db = getFirestore();
      const [quotesSnap, invoicesSnap] = await Promise.all([
        getDocs(collection(db, "users", user.uid, "quotes")),
        getDocs(collection(db, "users", user.uid, "invoices")),
      ]);
      let totalRevenue = 0, pendingPayments = 0;
      [...quotesSnap.docs, ...invoicesSnap.docs].forEach((d) => {
        const data = d.data();
        totalRevenue += parseFloat(data.totals?.total || 0);
        if (["pending", "partially_paid"].includes(data.status))
          pendingPayments += parseFloat(data.totals?.due || data.totals?.total || 0);
      });
      let clientCount = 0;
      try {
        const cSnap = await getDocs(collection(db, "users", user.uid, "clients"));
        clientCount = cSnap.docs.length;
      } catch (_) {}
      setStats({ totalQuotes: quotesSnap.docs.length + invoicesSnap.docs.length, totalRevenue, totalClients: clientCount, pendingPayments, loading: false });
    } catch (e) { setStats((p) => ({ ...p, loading: false })); }
  };

  // ── Data loaders ───────────────────────────────────────────────────────────
  const loadCustomers = async () => {
    try {
      const q = query(collection(db, "users", user.uid, "clients"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setCustomers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (error) { console.error("Error loading customers:", error); }
  };

  const loadSavedQuotes = async () => {
    if (!user?.uid) return;
    const db = getFirestore();
    const collectionName = documentType === "quote" ? "quotes" : "invoices";
    const q = query(collection(db, "users", user.uid, collectionName), orderBy("createdAt", "desc"), limit(50));
    const snapshot = await getDocs(q);
    setSavedQuotes(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  const loadSavedCustomers = async () => {
    if (!user?.uid) return;
    const db = getFirestore();
    const q = query(collection(db, "users", user.uid, "clients"), orderBy("createdAt", "desc"), limit(50));
    const snapshot = await getDocs(q);
    setSavedCustomers(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })).filter((c) => !c._placeholder));
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
    } catch (error) { console.error("Error loading business info:", error); }
  };

  const loadPaymentStatus = async () => {
    if (!user?.uid || !quoteId) { setPaymentStatus({ totalPaid: 0, balanceDue: total, status: "pending" }); return; }
    try {
      const collectionName = documentType === "quote" ? "quotes" : "invoices";
      const quoteDoc = await getDoc(doc(db, "users", user.uid, collectionName, quoteId));
      if (quoteDoc.exists()) {
        const data = quoteDoc.data();
        setPaymentStatus({ totalPaid: data.totals?.paid || 0, balanceDue: data.totals?.due || data.totals?.total || 0, status: data.status || "pending" });
      } else { setPaymentStatus({ totalPaid: 0, balanceDue: total, status: "pending" }); }
    } catch (error) { setPaymentStatus({ totalPaid: 0, balanceDue: total, status: "pending" }); }
  };

  const loadQuoteForExport = async () => {
    if (!user?.uid || !quoteId) return null;
    const db = getFirestore();
    const collectionName = documentType === "quote" ? "quotes" : "invoices";
    const snap = await getDoc(doc(db, "users", user.uid, collectionName, quoteId));
    return snap.exists() ? snap.data() : null;
  };

  // ── Handlers – customers ───────────────────────────────────────────────────
  const handleAddNewCustomer = () => { setSelectedCustomer(null); setShowCustomerModal(true); };
  const handleEditCustomer = (customer) => { setSelectedCustomer(customer); setShowCustomerModal(true); };
  const loadCustomer = (customer) => {
    setCustomerName(customer.name || "");
    setCustomerEmail(customer.email || "");
    setCustomerPhone(customer.phone || "");
    setPropertyAddress(customer.address || "");
  };
  const handleCustomerSaved = () => { loadCustomers(); };

  // ── Handlers – quote / invoice CRUD ───────────────────────────────────────
  const loadQuote = (quote) => {
    setQuoteId(quote.id);
    setQuoteNumber(quote.quoteNumber || "");
    setCustomerName(quote.customer?.name || "");
    setCustomerEmail(quote.customer?.email || "");
    setCustomerPhone(quote.customer?.phone || "");
    setPropertyAddress(quote.customer?.address || "");
    setSystemSize(quote.solarDetails?.systemSize || "5");
    setPanelType(quote.solarDetails?.panelType || "Monocrystalline");
    setInverterType(quote.solarDetails?.inverterType || "Hybrid");
    setBatteryStorage(quote.solarDetails?.batteryStorage || "10");
    setRoofType(quote.solarDetails?.roofType || "Tile");
    setRoofOrientation(quote.solarDetails?.roofOrientation || "North");
    setRoofPitch(quote.solarDetails?.roofPitch || "30");
    setShadingAnalysis(quote.solarDetails?.shadingAnalysis || "Minimal");
    setItems(quote.items || []);
    setShowQuotesList(false);
    setPropertyType(quote.propertyDetails?.type || "");
    setPropertySize(quote.propertyDetails?.size || "");
    setPowerRating(quote.propertyDetails?.powerRating || "");
    setUrgencyLevel(quote.propertyDetails?.urgency || "");
    setPaymentStatus({ totalPaid: quote.totals?.paid || 0, balanceDue: quote.totals?.due || quote.totals?.total || 0, status: quote.status || "pending" });
    setActiveView("quote");
  };

  const buildQuotePayload = (numberToUse) => ({
    quoteNumber: numberToUse,
    locked: true,
    status: "pending",
    documentType,
    dates: { quoteDate: new Date().toISOString(), validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() },
    customer: { name: customerName, email: customerEmail, phone: customerPhone, address: propertyAddress },
    propertyDetails: { type: propertyType, size: propertySize, powerRating, urgency: urgencyLevel },
    solarDetails: { systemSize, panelType, inverterType, batteryStorage, roofType, roofOrientation, roofPitch, shadingAnalysis },
    items,
    totals: { subtotal, tax: totalTax, total, paid: 0, due: total },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const handleSaveQuote = async () => {
    if (!user?.uid) return;
    const db = getFirestore();
    let numberToUse = quoteNumber;
    if (!quoteId) { numberToUse = await generateQuoteNumber(user.uid, documentType); setQuoteNumber(numberToUse); }
    const quoteData = buildQuotePayload(numberToUse);
    const collectionName = documentType === "quote" ? "quotes" : "invoices";
    if (quoteId) {
      await updateDoc(doc(db, "users", user.uid, collectionName, quoteId), { ...quoteData, updatedAt: serverTimestamp() });
    } else {
      const ref = await addDoc(collection(db, "users", user.uid, collectionName), quoteData);
      setQuoteId(ref.id);
    }
    alert(`${documentType === "quote" ? "Quote" : "Invoice"} saved successfully`);
    loadSavedQuotes();
    fetchStats();
  };

  const handleConvertToInvoice = async () => {
    if (!user?.uid || !quoteId) { alert("Please save the quote first before converting to invoice"); return; }
    if (!window.confirm("Convert this quote to an invoice?")) return;
    try {
      const db = getFirestore();
      const newInvoiceNumber = await generateQuoteNumber(user.uid, "invoice");
      const invoiceData = buildQuotePayload(newInvoiceNumber);
      invoiceData.documentType = "invoice";
      invoiceData.convertedFromQuote = quoteId;
      invoiceData.convertedFromQuoteNumber = quoteNumber;
      invoiceData.convertedAt = serverTimestamp();
      const invoiceRef = await addDoc(collection(db, "users", user.uid, "invoices"), invoiceData);
      await updateDoc(doc(db, "users", user.uid, "quotes", quoteId), { convertedToInvoice: true, convertedToInvoiceId: invoiceRef.id, convertedToInvoiceNumber: newInvoiceNumber, convertedAt: serverTimestamp(), status: "converted" });
      setDocumentType("invoice");
      setQuoteId(invoiceRef.id);
      setQuoteNumber(newInvoiceNumber);
      alert(`Quote successfully converted to Invoice ${newInvoiceNumber}`);
      loadSavedQuotes();
    } catch (error) { alert("Failed to convert quote to invoice"); }
  };

  const handleNewDocument = () => {
    setQuoteId(null);
    setQuoteNumber("");
    setCustomerName("Green Energy Solutions");
    setCustomerEmail("info@greenenergy.co.za");
    setCustomerPhone("+27 11 234 5678");
    setPropertyAddress("45 Sunset Avenue, Sandton, Johannesburg, 2196");
    setSystemSize("5"); setPanelType("Monocrystalline"); setInverterType("Hybrid"); setBatteryStorage("10");
    setRoofType("Tile"); setRoofOrientation("North"); setRoofPitch("30"); setShadingAnalysis("Minimal");
    setItems([]);
    setCurrentStep(1);
    const loadNewNumber = async () => {
      if (user?.uid) { const next = await generateQuoteNumber(user.uid, documentType); setQuoteNumber(next); }
    };
    loadNewNumber();
  };

  const handleNewQuote = () => { setDocumentType("quote"); handleNewDocument(); };
  const handleNewInvoice = () => { setDocumentType("invoice"); handleNewDocument(); };

  // ── Handlers – line items ──────────────────────────────────────────────────
  const handleAddItem = () => {
    if (!newItem.description || !newItem.qty) return;
    const rate = Number(newItem.rate) || 0;
    const qty = Number(newItem.qty);
    const taxRate = Number(newItem.taxRate) || 0;
    const amount = rate * qty;
    const taxAmount = amount * (taxRate / 100);
    setItems((prev) => [...prev, { description: newItem.description, workCategory: newItem.workCategory || "Solar Panels", rate, qty, amount, taxRate, taxAmount, totalAmount: amount + taxAmount, urgency: newItem.urgency || "Standard" }]);
    setNewItem({ description: "", rate: "", qty: "", workCategory: "Solar Panels", taxRate: "15", urgency: "Standard" });
  };

  const handleRemoveItem = (index) => { setItems((prev) => prev.filter((_, i) => i !== index)); };

  // ── Handlers – payment ─────────────────────────────────────────────────────
  const handleProcessPayment = async () => {
    if (!quoteId || !user?.uid) { alert("Please save the quote before processing payment"); return; }
    try {
      const collectionName = documentType === "quote" ? "quotes" : "invoices";
      const quoteDoc = await getDoc(doc(db, "users", user.uid, collectionName, quoteId));
      if (quoteDoc.exists()) { setSelectedQuoteForPayment({ id: quoteId, ...quoteDoc.data() }); setShowPaymentModal(true); }
      else { alert("Quote not found. Please save the quote first."); }
    } catch (error) { alert("Failed to load quote for payment"); }
  };

  const handlePaymentComplete = () => { loadSavedQuotes(); loadPaymentStatus(); setShowPaymentModal(false); fetchStats(); };

  // ── Print / PDF ────────────────────────────────────────────────────────────
  const printStyles = `@media print { body * { visibility: hidden !important; } #print-area, #print-area * { visibility: visible !important; } #print-area { display: block !important; position: absolute !important; left: 0 !important; top: 0 !important; width: 210mm !important; min-height: 297mm !important; margin: 0 !important; padding: 10mm !important; box-sizing: border-box !important; background: white !important; } @page { size: A4 portrait; margin: 0; } html, body { margin: 0 !important; padding: 0 !important; width: 210mm !important; background: white !important; } * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } }`;

  const handlePrint = () => {
    const s = document.createElement("style");
    s.textContent = printStyles;
    document.head.appendChild(s);
    window.print();
    setTimeout(() => document.head.removeChild(s), 1000);
  };

  const handleSavePDF = async () => {
    const saved = await loadQuoteForExport();
    if (!saved) { alert(`Please save the ${documentType} before exporting PDF`); return; }
    setQuoteNumber(saved.quoteNumber);
    setItems(saved.items);
    setCustomerName(saved.customer.name);
    setCustomerEmail(saved.customer.email);
    setCustomerPhone(saved.customer.phone);
    setPropertyAddress(saved.customer.address);
    setTimeout(() => window.print(), 300);
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
      alert("Failed to upload logo: " + error.message);
      setBusinessInfo((prev) => ({ ...prev, uploading: false }));
    }
  };

  const handleSaveBusinessInfo = async () => {
    if (!user?.uid) return;
    try {
      const db = getFirestore();
      await setDoc(doc(db, "users", user.uid, "settings", "businessInfo"), { ...businessInfo, stampSettings });
      alert("Business information saved successfully!");
      setShowSettings(false);
    } catch (error) { alert("Failed to save business information"); }
  };

  const handleAIDataExtracted = (extractedData) => {
    if (extractedData.customer?.name) setCustomerName(extractedData.customer.name);
    if (extractedData.customer?.email) setCustomerEmail(extractedData.customer.email);
    if (extractedData.customer?.phone) setCustomerPhone(extractedData.customer.phone);
    if (extractedData.customer?.address) setPropertyAddress(extractedData.customer.address);
    if (extractedData.items?.length > 0) setItems(extractedData.items);
    alert("✨ Data extracted and populated successfully!");
  };

  const handleNext = () => { if (currentStep < totalSteps) setCurrentStep(currentStep + 1); };
  const handlePrevious = () => { if (currentStep > 1) setCurrentStep(currentStep - 1); };
  const handleLogout = async () => { try { await signOut(getAuth()); } catch (error) { console.error(error); } };

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
    documentType === "quote" && quoteId && {
      label: "Convert to Invoice", icon: FileText, onClick: handleConvertToInvoice,
      className: "flex items-center gap-1.5 px-3 py-1.5 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm font-medium rounded-md transition-colors whitespace-nowrap",
    },
    { label: "Preview", icon: Eye, onClick: () => setShowPreview(true), className: "flex items-center gap-1.5 px-3 py-1.5 bg-[#0f172a] hover:bg-[#1e293b] text-white text-sm font-medium rounded-md transition-colors whitespace-nowrap" },
    { label: "Print", icon: Printer, onClick: handlePrint, variant: "secondary" },
    { label: "New", icon: Plus, onClick: documentType === "quote" ? handleNewQuote : handleNewInvoice, className: "flex items-center gap-1.5 px-3 py-1.5 bg-[#059669] hover:bg-[#047857] text-white text-sm font-medium rounded-md transition-colors whitespace-nowrap" },
    { label: "Send", icon: Send, className: "flex items-center gap-1.5 px-3 py-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium rounded-md transition-colors whitespace-nowrap" },
    { label: "Save PDF", icon: Download, onClick: handleSavePDF, className: "flex items-center gap-1.5 px-3 py-1.5 bg-[#0891b2] hover:bg-[#0e7490] text-white text-sm font-medium rounded-md transition-colors whitespace-nowrap" },
    { label: "Save", icon: Save, onClick: handleSaveQuote, className: "flex items-center gap-1.5 px-3 py-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium rounded-md transition-colors whitespace-nowrap" },
   
  ].filter(Boolean);

  const mobileDashboardActions = [
    documentType === "quote" && quoteId && {
      label: "To Invoice", icon: FileText, onClick: handleConvertToInvoice,
      className: "flex items-center gap-1.5 px-3 py-2 bg-[#7c3aed] text-white rounded-md text-xs font-medium active:scale-95 whitespace-nowrap",
    },
    { label: "Save", icon: Save, onClick: handleSaveQuote, className: "flex items-center gap-1.5 px-3 py-2 bg-[#2563eb] text-white rounded-md text-xs font-medium active:scale-95 whitespace-nowrap" },
    { label: "Send", icon: Send, className: "flex items-center gap-1.5 px-3 py-2 bg-[#059669] text-white rounded-md text-xs font-medium active:scale-95 whitespace-nowrap" },
    { label: "PDF", icon: Download, onClick: handleSavePDF, className: "flex items-center gap-1.5 px-3 py-2 bg-[#0891b2] text-white rounded-md text-xs font-medium active:scale-95 whitespace-nowrap" },
    { label: "Print", icon: Printer, onClick: handlePrint, className: "flex items-center gap-1.5 px-3 py-2 bg-white border border-[#e2e8f0] text-[#374151] rounded-md text-xs font-medium active:scale-95 whitespace-nowrap" },
  ].filter(Boolean);

  // ── Home view ──────────────────────────────────────────────────────────────
  const HomeViewLocal = () => (
    <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="Quotes & Invoices" value={stats.totalQuotes} icon={FileText} iconBg="bg-[#eff6ff]" iconColor="text-[#2563eb]" subtitle="All time" loading={stats.loading} trend={12} />
        <StatCard title="Revenue" value={formatCurrency(stats.totalRevenue)} icon={TrendingUp} iconBg="bg-[#f0fdf4]" iconColor="text-[#059669]" subtitle="Total invoiced" loading={stats.loading} trend={8} />
        <StatCard title="Clients" value={stats.totalClients} icon={Users} iconBg="bg-[#fff7ed]" iconColor="text-[#ea580c]" subtitle="Active" loading={stats.loading} />
        <StatCard title="Solar Systems" value="—" icon={Sun} iconBg="bg-[#fefce8]" iconColor="text-[#ca8a04]" subtitle="Installed" loading={stats.loading} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 bg-[#fff7ed] rounded-lg flex items-center justify-center flex-shrink-0">
            <Receipt className="w-5 h-5 text-[#ea580c]" />
          </div>
          <div>
            <p className="text-xs text-[#64748b] mb-0.5">Pending Payments</p>
            {stats.loading ? <div className="h-6 bg-[#f1f5f9] rounded animate-pulse w-32" /> : (
              <>
                <p className="text-xl font-bold text-[#ea580c]">{formatCurrency(stats.pendingPayments)}</p>
                <p className="text-xs text-[#94a3b8]">Outstanding balance</p>
              </>
            )}
          </div>
        </div>

        <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-widest mb-3">Quick Actions</p>
          <div className="flex flex-col sm:flex-row gap-2">
            {[
              { label: "New Quote", icon: FileText, onClick: () => { handleNewQuote(); setActiveView("quote"); }, bg: "bg-[#eff6ff]", hover: "hover:bg-[#dbeafe]", border: "border-[#bfdbfe]", iconBg: "bg-[#2563eb]", text: "text-[#1e40af]" },
              { label: "New Invoice", icon: Receipt, onClick: () => { handleNewInvoice(); setActiveView("quote"); }, bg: "bg-[#f0fdf4]", hover: "hover:bg-[#dcfce7]", border: "border-[#bbf7d0]", iconBg: "bg-[#059669]", text: "text-[#166534]" },
              { label: "Clients", icon: Users, onClick: () => setShowCustomersListModal(true), bg: "bg-[#fefce8]", hover: "hover:bg-[#fef9c3]", border: "border-[#fde68a]", iconBg: "bg-[#ca8a04]", text: "text-[#854d0e]" },
            ].map(({ label, icon: Icon, onClick, bg, hover, border, iconBg, text }) => (
              <button key={label} onClick={onClick} className={`flex-1 flex items-center justify-between px-3 py-2.5 ${bg} ${hover} border ${border} rounded-lg transition-all group`}>
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 ${iconBg} rounded flex items-center justify-center flex-shrink-0`}><Icon className="w-3 h-3 text-white" /></div>
                  <span className={`text-xs font-semibold ${text}`}>{label}</span>
                </div>
                <ArrowRight className={`w-3 h-3 ${text} opacity-60 group-hover:translate-x-0.5 transition-transform`} />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#e2e8f0] bg-[#f8fafc]">
          <h3 className="text-sm font-semibold text-[#1e293b]">Recent {documentType === "quote" ? "Quotes" : "Invoices"}</h3>
          <button onClick={() => setShowQuotesList(true)} className="text-xs text-[#2563eb] hover:text-[#1d4ed8] font-medium">View all</button>
        </div>
        <div className="divide-y divide-[#f1f5f9]">
          {stats.loading ? (
            [1, 2, 3].map((i) => <div key={i} className="h-14 bg-[#f8fafc] animate-pulse m-3 rounded-lg" />)
          ) : savedQuotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-10 h-10 mb-3 bg-[#f1f5f9] rounded-full flex items-center justify-center">
                <Zap className="w-5 h-5 text-[#94a3b8]" />
              </div>
              <p className="text-sm font-medium text-[#374151] mb-1">No quotes yet</p>
              <p className="text-xs text-[#94a3b8] mb-3">Create your first solar quote to get started</p>
              <button onClick={() => { handleNewQuote(); setActiveView("quote"); }} className="px-4 py-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-lg text-xs font-medium transition-colors">
                Create Quote
              </button>
            </div>
          ) : (
            savedQuotes.slice(0, 8).map((quote) => (
              <div key={quote.id} onClick={() => loadQuote(quote)} className="flex items-center justify-between px-5 py-3.5 hover:bg-[#f8fafc] cursor-pointer transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-[#1e293b] truncate">{quote.quoteNumber || quote.id}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold flex-shrink-0 ${statusBadge(quote.status)}`}>
                      {quote.status === "partially_paid" ? "Partial" : quote.status || "Pending"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[#64748b]">
                    <span className="flex items-center gap-1 truncate"><Users className="w-3 h-3 flex-shrink-0" />{quote.customer?.name || "No client"}</span>
                    <span className="flex items-center gap-1 truncate"><Zap className="w-3 h-3 flex-shrink-0" />{quote.solarDetails?.systemSize || "—"}kW System</span>
                  </div>
                </div>
                <div className="text-right ml-4 flex-shrink-0">
                  <div className="text-sm font-bold text-[#1e293b]">{formatCurrency(quote.totals?.total || 0)}</div>
                  {quote.totals?.due > 0 && quote.totals?.due < quote.totals?.total && (
                    <div className="text-xs text-[#d97706]">Due: {formatCurrency(quote.totals.due)}</div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="h-screen w-full overflow-hidden flex flex-col bg-[#f0f2f5]">
      {/* Print area */}
      <div id="print-area" className="hidden print:block bg-white" style={{ width: "210mm", minHeight: "297mm" }}>
        <TemplateRenderer {...templateProps} />
      </div>
        {showAIWindow && (
  <AIInvoiceWindow
    user={user}
    businessInfo={businessInfo}
    documentType={documentType}
    onExit={() => setShowAIWindow(false)}
    onNavigateTo={(view) => {
    setAiWindowOpen(false);
    setActiveView(view); 
  }}
  />
)}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* ── Sidebar backdrop ──────────────────────────────────────────────── */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* ── Collapsed Sidebar ─────────────────────────────────────────────── */}
        <div className={`${sidebarOpen ? "hidden" : "hidden md:flex"} fixed z-40 w-16 bg-[#0f172a] border-r border-[#1e293b] h-full flex-col items-center py-4 space-y-3 print:hidden`}>
          <button onClick={() => setSidebarOpen(true)} className="p-2 text-[#64748b] hover:text-white hover:bg-[#1e293b] rounded-lg transition-all">
            <ChevronRight className="w-5 h-5" />
          </button>
          <div className="w-9 h-9 rounded-lg overflow-hidden flex items-center justify-center">
            <img src={logo} className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col items-center space-y-2 w-full px-2 pt-2">
            {[
              { icon: Home, onClick: () => setActiveView("home"), title: "Home", color: "text-[#38bdf8]" },
              { icon: Settings, onClick: () => setShowSettings(true), title: "Settings", color: "text-[#64748b]" },
              { icon: TrendingUp, onClick: () => setActiveView("financial-overview"), title: "Financial", color: "text-[#64748b]" },
              { icon: Receipt, onClick: () => { handleNewQuote(); setActiveView("quote"); }, title: "Quotes", color: "text-[#64748b]" },
              { icon: Users, onClick: () => setShowCustomersListModal(true), title: "Clients", color: "text-[#64748b]" },
              { icon: Sun, onClick: () => {}, title: "Solar Systems", color: "text-[#64748b]" },
              { icon: BarChart3, onClick: () => setActiveView("reports"), title: "Reports", color: "text-[#64748b]" },
            ].map(({ icon: Icon, onClick, title, color }) => (
              <button key={title} onClick={onClick} title={title} className={`group p-2 ${color} hover:text-white hover:bg-[#1e293b] rounded-lg transition-all w-10 h-10 flex items-center justify-center`}>
                <Icon className="w-5 h-5" />
              </button>
            ))}
          </div>
          <div className="absolute bottom-4">
            <div className="w-9 h-9 bg-[#1e293b] rounded-full flex items-center justify-center ring-1 ring-[#334155]">
              {businessInfo.logoUrl ? <img src={businessInfo.logoUrl} className="w-6 h-6 object-contain" /> : <Sun className="w-4 h-4 text-[#64748b]" />}
            </div>
          </div>
        </div>

        {/* ── Expanded Sidebar ──────────────────────────────────────────────── */}
        <div className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} fixed z-50 w-64 bg-[#0f172a] border-r border-[#1e293b] transition-transform duration-300 h-full print:hidden shadow-2xl overflow-y-auto flex flex-col`}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#1e293b]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg overflow-hidden"><img src={logo} className="w-full h-full object-contain" /></div>
              <span className="text-sm font-bold text-white truncate">{businessInfo.businessName || "SolarTech"}</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="p-1.5 text-[#64748b] hover:text-white hover:bg-[#1e293b] rounded-lg transition-all">
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 p-3 space-y-1">
            {[
              { label: "Home", icon: Home, view: "home", active: activeView === "home" },
            ].map(({ label, icon: Icon, view, active }) => (
              <div key={label} onClick={() => { setActiveView(view); setSidebarOpen(false); }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all text-sm font-medium ${active ? "bg-[#1e3a5f] text-[#38bdf8]" : "text-[#94a3b8] hover:text-white hover:bg-[#1e293b]"}`}>
                <Icon className="w-4 h-4 flex-shrink-0" />{label}
              </div>
            ))}

            <div onClick={() => { setShowSettings(true); setSidebarOpen(false); }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all text-sm font-medium text-[#94a3b8] hover:text-white hover:bg-[#1e293b]">
              <Settings className="w-4 h-4 flex-shrink-0" />Settings
            </div>

            <div className="pt-3 border-t border-[#1e293b] space-y-1">
              <div onClick={() => { setActiveView("financial-overview"); setSidebarOpen(false); }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-sm font-medium text-[#94a3b8] hover:text-white hover:bg-[#1e293b] transition-all">
                <TrendingUp className="w-4 h-4 flex-shrink-0" />Financial Dashboard
              </div>

              {/* Quotes & Invoices dropdown */}
              <div>
                <div onClick={() => setIsInvoicingOpen(!isInvoicingOpen)}
                  className="flex items-center justify-between px-3 py-2.5 text-[#94a3b8] hover:text-white hover:bg-[#1e293b] rounded-lg cursor-pointer transition-all text-sm font-medium">
                  <div className="flex items-center gap-3"><Receipt className="w-4 h-4 flex-shrink-0" />Quotes &amp; Invoices</div>
                  <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${isInvoicingOpen ? "rotate-180" : ""}`} />
                </div>
                <div className={`ml-4 mt-1 space-y-0.5 border-l border-[#1e293b] pl-3 overflow-hidden transition-all duration-200 ${isInvoicingOpen ? "max-h-48 opacity-100" : "max-h-0 opacity-0"}`}>
                  {[
                    { label: "Create Quote", dot: "bg-[#2563eb]", onClick: () => { handleNewQuote(); setActiveView("quote"); if (isMobile) setSidebarOpen(false); } },
                    { label: "Create Invoice", dot: "bg-[#059669]", onClick: () => { handleNewInvoice(); setActiveView("quote"); if (isMobile) setSidebarOpen(false); } },
                    { label: `All ${documentType === "quote" ? "Quotes" : "Invoices"}`, dot: "bg-[#7c3aed]", badge: savedQuotes.length, onClick: () => { setShowQuotesList(!showQuotesList); if (isMobile) setSidebarOpen(false); } },
                  ].map(({ label, dot, badge, onClick }) => (
                    <div key={label} onClick={onClick} className="flex items-center justify-between py-2 px-2 text-xs text-[#64748b] hover:text-white hover:bg-[#1e293b] rounded-lg cursor-pointer transition-all">
                      <div className="flex items-center gap-2"><div className={`w-1.5 h-1.5 rounded-full ${dot}`} />{label}</div>
                      {badge !== undefined && <span className="bg-[#2563eb] text-white px-1.5 py-0.5 rounded text-xs font-bold">{badge}</span>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Clients dropdown */}
              <div>
                <div onClick={() => setIsClientsOpen(!isClientsOpen)}
                  className="flex items-center justify-between px-3 py-2.5 text-[#94a3b8] hover:text-white hover:bg-[#1e293b] rounded-lg cursor-pointer transition-all text-sm font-medium">
                  <div className="flex items-center gap-3"><Users className="w-4 h-4 flex-shrink-0" />Clients</div>
                  <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${isClientsOpen ? "rotate-180" : ""}`} />
                </div>
                <div className={`ml-4 mt-1 space-y-0.5 border-l border-[#1e293b] pl-3 overflow-hidden transition-all duration-200 ${isClientsOpen ? "max-h-32 opacity-100" : "max-h-0 opacity-0"}`}>
                  {[
                    { label: "Add Client", dot: "bg-[#059669]", onClick: () => { handleAddNewCustomer(); if (isMobile) setSidebarOpen(false); } },
                    { label: "All Clients", dot: "bg-[#2563eb]", badge: savedCustomers.length, onClick: () => { setShowCustomersListModal(true); if (isMobile) setSidebarOpen(false); } },
                  ].map(({ label, dot, badge, onClick }) => (
                    <div key={label} onClick={onClick} className="flex items-center justify-between py-2 px-2 text-xs text-[#64748b] hover:text-white hover:bg-[#1e293b] rounded-lg cursor-pointer transition-all">
                      <div className="flex items-center gap-2"><div className={`w-1.5 h-1.5 rounded-full ${dot}`} />{label}</div>
                      {badge !== undefined && <span className="bg-[#7c3aed] text-white px-1.5 py-0.5 rounded text-xs font-bold">{badge}</span>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Static items */}
              {[
                { label: "Schedule", icon: Calendar, onClick: () => { setActiveView("schedule"); setSidebarOpen(false); } },
                { label: "Reports", icon: BarChart3, onClick: () => { setActiveView("reports"); setSidebarOpen(false); } },
                { label: "Templates", icon: FileText, onClick: () => { setActiveView("templates"); setSidebarOpen(false); } },
              ].map(({ label, icon: Icon, onClick }) => (
                <div key={label} onClick={onClick} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#94a3b8] hover:text-white hover:bg-[#1e293b] transition-all cursor-pointer">
                  <Icon className="w-4 h-4 flex-shrink-0" />{label}
                </div>
              ))}
            </div>
          </nav>

          {/* Sidebar footer */}
          <div className="p-4 border-t border-[#1e293b]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#1e293b] rounded-full flex items-center justify-center ring-1 ring-[#334155] flex-shrink-0">
                {businessInfo.logoUrl ? <img src={businessInfo.logoUrl} className="w-6 h-6 object-contain" /> : <Sun className="w-4 h-4 text-[#64748b]" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-white truncate">{user?.name || "User"}</div>
                <div className="text-xs text-[#64748b] truncate">{user?.email || "email@example.com"}</div>
              </div>
              <button onClick={handleLogout} className="p-1.5 text-[#64748b] hover:text-[#ef4444] hover:bg-[#1e293b] rounded-lg transition-all">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Main content ───────────────────────────────────────────────────── */}
        <div className={`flex-1 overflow-hidden flex flex-col min-h-0 transition-all duration-300 ${sidebarOpen ? "ml-0 lg:ml-64" : "ml-0 md:ml-16"}`}>
          <AppHeader actions={headerActions} mobileActions={mobileDashboardActions} onSettingsOpen={() => setShowSettings(true)} />

          {/* ── Modals ──────────────────────────────────────────────────────── */}
          {showSettings && <BusinessSettingsModal onClose={() => setShowSettings(false)} />}
          <CustomersListModal showModal={showCustomersListModal} setShowModal={setShowCustomersListModal} customers={customers} onLoadCustomer={loadCustomer} onEditCustomer={handleEditCustomer} onAddNewCustomer={handleAddNewCustomer} />
          <CustomerModal showModal={showCustomerModal} setShowModal={setShowCustomerModal} existingCustomer={selectedCustomer} onCustomerSaved={handleCustomerSaved} />
          {showPaymentModal && selectedQuoteForPayment && (
            <PaymentProcessor showModal={showPaymentModal} setShowModal={setShowPaymentModal} invoice={selectedQuoteForPayment} onPaymentComplete={handlePaymentComplete} user={user} businessInfo={businessInfo} />
          )}

          {/* ── Quotes list modal ────────────────────────────────────────────── */}
          {showQuotesList && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden border border-[#e2e8f0]">
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0] bg-[#f8fafc]">
                  <div>
                    <h2 className="text-base font-semibold text-[#1e293b]">Saved {documentType === "quote" ? "Quotes" : "Invoices"}</h2>
                    <p className="text-xs text-[#64748b] mt-0.5">{savedQuotes.length} records</p>
                  </div>
                  <button onClick={() => setShowQuotesList(false)} className="p-1.5 text-[#64748b] hover:text-[#1e293b] hover:bg-[#e2e8f0] rounded-lg transition-all"><X className="w-4 h-4" /></button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {savedQuotes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <Zap className="w-10 h-10 text-[#cbd5e1] mb-3" />
                      <p className="text-sm text-[#94a3b8]">No records found</p>
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead>
                        <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                          {["Number", "Client", "System", "Total", "Paid", "Status"].map((h) => (
                            <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wide">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {savedQuotes.map((quote) => (
                          <tr key={quote.id} onClick={() => loadQuote(quote)} className="border-b border-[#f1f5f9] hover:bg-[#f8fafc] cursor-pointer transition-colors">
                            <td className="px-5 py-3 text-sm font-semibold text-[#2563eb]">{quote.quoteNumber || "N/A"}</td>
                            <td className="px-5 py-3 text-sm text-[#374151]">{quote.customer?.name || "N/A"}</td>
                            <td className="px-5 py-3 text-sm text-[#374151]">{quote.solarDetails?.systemSize || "—"}kW</td>
                            <td className="px-5 py-3 text-sm font-semibold text-[#1e293b]">{formatCurrency(quote.totals?.total || 0)}</td>
                            <td className="px-5 py-3 text-sm font-semibold text-[#059669]">{quote.totals?.paid > 0 ? formatCurrency(quote.totals.paid) : "—"}</td>
                            <td className="px-5 py-3">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${statusBadge(quote.status)}`}>
                                {quote.status === "partially_paid" ? "Partial" : quote.status || "Pending"}
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

          {/* ── Preview modal ────────────────────────────────────────────────── */}
          {showPreview && (
            <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#e2e8f0] bg-[#f8fafc] flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-[#0f172a] rounded-lg flex items-center justify-center"><Eye className="w-4 h-4 text-white" /></div>
                    <div>
                      <h2 className="text-sm font-semibold text-[#1e293b]">{documentType === "quote" ? "Quote" : "Invoice"} Preview</h2>
                      <p className="text-xs text-[#64748b]">{quoteNumber || "Draft"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={handlePrint} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-medium rounded-lg transition-colors"><Printer className="w-3.5 h-3.5" />Print</button>
                    <button onClick={handleSavePDF} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#059669] hover:bg-[#047857] text-white text-xs font-medium rounded-lg transition-colors"><Download className="w-3.5 h-3.5" />Save PDF</button>
                    <button onClick={() => setShowPreview(false)} className="p-1.5 text-[#64748b] hover:text-[#1e293b] hover:bg-[#e2e8f0] rounded-lg transition-all"><X className="w-4 h-4" /></button>
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

          {/* ── Alternate views ──────────────────────────────────────────────── */}
          {activeView === "financial-overview" && <div className="flex-1 overflow-y-auto p-4"><FinancialOverview user={user} /></div>}
          {activeView === "history-view" && <div className="flex-1 overflow-y-auto p-4"><HistoryView user={user} /></div>}
          {activeView === "notes-view" && <div className="flex-1 overflow-y-auto p-4"><NotesView user={user} /></div>}
          {activeView === "templates" && <div className="flex-1 overflow-y-auto p-4"><Templates user={user} /></div>}
          {activeView === "home" && <HomeViewLocal />}

          {/* ── Quote / Invoice builder ───────────────────────────────────────── */}
          {activeView === "quote" && (
            <div className="flex-1 overflow-hidden flex min-h-0">
              {/* ── LEFT: Form ─────────────────────────────────────────────── */}
              <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 min-w-0">
                <div className="space-y-5">

                  {/* Summary stat cards */}
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: "Total Amount", value: formatCurrency(total), icon: DollarSign, iconBg: "bg-[#eff6ff]", iconColor: "text-[#2563eb]", textColor: "text-[#1e293b]" },
                      { label: "Paid", value: formatCurrency(paymentStatus.totalPaid), icon: CheckSquare, iconBg: paymentStatus.totalPaid > 0 ? "bg-[#dcfce7]" : "bg-[#f1f5f9]", iconColor: paymentStatus.totalPaid > 0 ? "text-[#059669]" : "text-[#94a3b8]", textColor: paymentStatus.totalPaid > 0 ? "text-[#059669]" : "text-[#1e293b]" },
                      { label: "Balance Due", value: formatCurrency(paymentStatus.balanceDue), icon: Wallet, iconBg: paymentStatus.balanceDue <= 0 ? "bg-[#dcfce7]" : "bg-[#fef2f2]", iconColor: paymentStatus.balanceDue <= 0 ? "text-[#059669]" : "text-[#dc2626]", textColor: paymentStatus.balanceDue <= 0 ? "text-[#059669]" : "text-[#dc2626]" },
                    ].map(({ label, value, icon: Icon, iconBg, iconColor, textColor }) => (
                      <div key={label} className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-semibold text-[#64748b] uppercase tracking-wide">{label}</span>
                          <div className={`w-8 h-8 ${iconBg} rounded-lg flex items-center justify-center`}><Icon className={`w-4 h-4 ${iconColor}`} /></div>
                        </div>
                        <div className={`text-xl font-bold ${textColor}`}>{value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Payment status banner */}
                  {quoteId && (
                    <div className={`px-5 py-3.5 rounded-xl border flex items-center justify-between ${paymentStatus.status === "paid" ? "bg-[#f0fdf4] border-[#bbf7d0]" : paymentStatus.status === "partially_paid" ? "bg-[#fffbeb] border-[#fde68a]" : "bg-[#fff7ed] border-[#fed7aa]"}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${paymentStatus.status === "paid" ? "bg-[#dcfce7]" : paymentStatus.status === "partially_paid" ? "bg-[#fef3c7]" : "bg-[#ffedd5]"}`}>
                          <CreditCard className={`w-4 h-4 ${paymentStatus.status === "paid" ? "text-[#059669]" : paymentStatus.status === "partially_paid" ? "text-[#d97706]" : "text-[#ea580c]"}`} />
                        </div>
                        <div className={`text-sm font-semibold ${paymentStatus.status === "paid" ? "text-[#166534]" : paymentStatus.status === "partially_paid" ? "text-[#92400e]" : "text-[#9a3412]"}`}>
                          {paymentStatus.status === "paid" ? `${documentType === "quote" ? "Quote" : "Invoice"} Fully Paid` : paymentStatus.status === "partially_paid" ? `${formatCurrency(paymentStatus.totalPaid)} paid · ${formatCurrency(paymentStatus.balanceDue)} remaining` : `Payment Pending — ${formatCurrency(paymentStatus.balanceDue)} due`}
                        </div>
                      </div>
                      {paymentStatus.status !== "paid" && (
                        <button onClick={handleProcessPayment} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#e2e8f0] text-[#374151] text-sm font-medium rounded-lg hover:bg-[#f8fafc] transition-colors shadow-sm">
                          <CreditCard className="w-4 h-4" />Record Payment
                        </button>
                      )}
                    </div>
                  )}

                  {/* Input mode tabs */}
                  <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden shadow-sm">
                    <div className="flex border-b border-[#e2e8f0]">
                      <button onClick={() => setInputMode("manual")} className={`flex-1 px-5 py-3 text-sm font-semibold transition-all flex items-center justify-center gap-2 ${inputMode === "manual" ? "bg-white text-[#2563eb] border-b-2 border-[#2563eb]" : "bg-[#f8fafc] text-[#64748b] hover:text-[#374151]"}`}>
                        <Edit className="w-4 h-4" />Manual Entry
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

                  {/* Stepped form */}
                  {inputMode === "manual" && (
                    <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
                      <StepIndicator steps={steps} currentStep={currentStep} />

                      {/* ── Step 1: Client Info ──────────────────────────────── */}
                      {currentStep === 1 && (
                        <div className="p-6">
                          <div className="flex items-center gap-3 mb-5">
                            <div className="w-8 h-8 bg-[#eff6ff] rounded-lg flex items-center justify-center"><Users className="w-4 h-4 text-[#2563eb]" /></div>
                            <div>
                              <h2 className="text-base font-semibold text-[#1e293b]">Client Information</h2>
                              <p className="text-xs text-[#64748b]">Enter client / contractor details</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className={labelCls}>Client / Company Name <span className="text-[#dc2626]">*</span></label>
                              <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className={inputCls} placeholder="Green Energy Solutions" />
                            </div>
                            <div>
                              <label className={labelCls}>Email <span className="text-[#dc2626]">*</span></label>
                              <input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} className={inputCls} placeholder="info@company.co.za" />
                            </div>
                            <div>
                              <label className={labelCls}>Phone <span className="text-[#dc2626]">*</span></label>
                              <input type="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className={inputCls} placeholder="+27 11 234 5678" />
                            </div>
                            <div className="sm:col-span-2">
                              <label className={labelCls}>Property Address <span className="text-[#dc2626]">*</span></label>
                              <input type="text" value={propertyAddress} onChange={(e) => setPropertyAddress(e.target.value)} className={inputCls} placeholder="45 Sunset Avenue, Sandton, Johannesburg" />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* ── Step 2: Site Details ─────────────────────────────── */}
                      {currentStep === 2 && (
                        <div className="p-6">
                          <div className="flex items-center gap-3 mb-5">
                            <div className="w-8 h-8 bg-[#eff6ff] rounded-lg flex items-center justify-center"><Building className="w-4 h-4 text-[#2563eb]" /></div>
                            <div>
                              <h2 className="text-base font-semibold text-[#1e293b]">Site Details</h2>
                              <p className="text-xs text-[#64748b]">Provide site specifications for an accurate quote</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className={labelCls}>Property / Building Type</label>
                              <select value={roofType} onChange={(e) => setRoofType(e.target.value)} className={selectCls}>
                                {["Commercial","Residential","Industrial","Infrastructure","Renovation","Government"].map((o) => <option key={o} value={o}>{o}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className={labelCls}>Property Area (sqm)</label>
                              <input type="number" value={roofOrientation} onChange={(e) => setRoofOrientation(e.target.value)} className={inputCls} placeholder="1200" />
                            </div>
                            <div>
                              <label className={labelCls}>Power Rating (Amps)</label>
                              <input type="number" value={roofPitch} onChange={(e) => setRoofPitch(e.target.value)} className={inputCls} placeholder="3" />
                            </div>
                            <div>
                              <label className={labelCls}>Shading Analysis</label>
                              <input type="text" value={shadingAnalysis} onChange={(e) => setShadingAnalysis(e.target.value)} className={inputCls} placeholder="Minimal" />
                            </div>
                          </div>
                          <div className="mt-5 p-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg">
                            <h3 className="text-xs font-semibold text-[#374151] uppercase tracking-wide mb-3 flex items-center gap-2"><MapPin className="w-3.5 h-3.5" />Site Summary</h3>
                            <div className="grid grid-cols-2 gap-2 text-xs text-[#64748b]">
                              {[["Type", roofType], ["Area", `${roofOrientation} sqm`], ["Power", `${roofPitch} A`], ["Shading", shadingAnalysis]].map(([k, v]) => (
                                <div key={k}><span className="font-semibold text-[#374151]">{k}:</span> {v}</div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* ── Step 3: Solar System / Line Items ────────────────── */}
                      {currentStep === 3 && (
                        <div className="p-6">
                          <div className="flex items-center gap-3 mb-5">
                            <div className="w-8 h-8 bg-[#fefce8] rounded-lg flex items-center justify-center"><Sun className="w-4 h-4 text-[#ca8a04]" /></div>
                            <div>
                              <h2 className="text-base font-semibold text-[#1e293b]">Solar System Design</h2>
                              <p className="text-xs text-[#64748b]">Add work items and materials to the quote</p>
                            </div>
                          </div>

                          {/* Add item form */}
                          <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-5 mb-5">
                            <h3 className="text-sm font-semibold text-[#374151] mb-4 flex items-center gap-2"><Plus className="w-4 h-4 text-[#2563eb]" />Add Work Item</h3>
                            <div className="grid grid-cols-1 gap-3">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <label className={labelCls}>Category</label>
                                  <select value={newItem.workCategory} onChange={(e) => setNewItem({ ...newItem, workCategory: e.target.value })} className={selectCls}>
                                    {["Solar Panels","Inverter","Battery Storage","Mounting System","Wiring & Conduit","Monitoring System","Grid Connection","Installation Labor","Materials Supply","Other"].map((o) => <option key={o} value={o}>{o}</option>)}
                                  </select>
                                </div>
                                <div>
                                  <label className={labelCls}>Urgency</label>
                                  <select value={newItem.urgency} onChange={(e) => setNewItem({ ...newItem, urgency: e.target.value })} className={selectCls}>
                                    {["Standard","Urgent","Emergency"].map((o) => <option key={o} value={o}>{o}</option>)}
                                  </select>
                                </div>
                              </div>
                              <div>
                                <label className={labelCls}>Description</label>
                                <input type="text" placeholder="Work item / material description" value={newItem.description} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} className={inputCls} />
                              </div>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <div>
                                  <label className={labelCls}>Rate (R)</label>
                                  <input type="number" placeholder="0.00" value={newItem.rate} onChange={(e) => setNewItem({ ...newItem, rate: e.target.value })} className={inputCls} />
                                </div>
                                <div>
                                  <label className={labelCls}>Qty</label>
                                  <input type="number" placeholder="1" value={newItem.qty} onChange={(e) => setNewItem({ ...newItem, qty: e.target.value })} className={inputCls} />
                                </div>
                                <div>
                                  <label className={labelCls}>VAT (%)</label>
                                  <input type="number" placeholder="15" value={newItem.taxRate} onChange={(e) => setNewItem({ ...newItem, taxRate: e.target.value })} className={inputCls} />
                                </div>
                                <div className="flex items-end">
                                  <button onClick={handleAddItem} className="w-full px-3 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-1.5">
                                    <Plus className="w-4 h-4" />Add
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Items table */}
                          {items.length > 0 ? (
                            <>
                              <div className="border border-[#e2e8f0] rounded-xl overflow-hidden mb-4">
                                <table className="w-full">
                                  <thead>
                                    <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                                      {["Description","Category","Rate","Qty","VAT","Total",""].map((h) => (
                                        <th key={h} className={`px-4 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wide ${!h || h === "" ? "w-10" : ""}`}>{h}</th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-[#f1f5f9]">
                                    {items.map((item, index) => (
                                      <tr key={index} className="hover:bg-[#f8fafc] transition-colors">
                                        <td className="px-4 py-3 text-sm text-[#374151]">{item.description}</td>
                                        <td className="px-4 py-3 text-sm">
                                          <span className="px-2 py-0.5 bg-[#eff6ff] text-[#1e40af] text-xs font-semibold rounded">{item.workCategory}</span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-[#374151]">{formatCurrency(item.rate)}</td>
                                        <td className="px-4 py-3 text-sm text-[#374151]">{item.qty}</td>
                                        <td className="px-4 py-3 text-sm text-[#374151]">{formatCurrency(item.taxAmount)}</td>
                                        <td className="px-4 py-3 text-sm font-semibold text-[#1e293b]">{formatCurrency(item.totalAmount)}</td>
                                        <td className="px-4 py-3 text-center">
                                          <button onClick={() => handleRemoveItem(index)} className="p-1.5 text-[#94a3b8] hover:text-[#dc2626] hover:bg-[#fef2f2] rounded-lg transition-all">
                                            <X className="w-3.5 h-3.5" />
                                          </button>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                              <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-lg px-5 py-4">
                                <div className="space-y-2 text-sm">
                                  {[["Subtotal", formatCurrency(subtotal), false], ["VAT", formatCurrency(totalTax), false], ["Total", formatCurrency(total), true]].map(([k, v, bold]) => (
                                    <div key={k} className={`flex justify-between items-center ${bold ? "pt-2 border-t border-[#e2e8f0]" : ""}`}>
                                      <span className={bold ? "font-bold text-[#1e293b]" : "text-[#64748b]"}>{k}</span>
                                      <span className={bold ? "font-bold text-[#2563eb] text-base" : "font-semibold text-[#1e293b]"}>{v}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </>
                          ) : (
                            <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-[#e2e8f0] rounded-xl">
                              <div className="w-10 h-10 bg-[#f1f5f9] rounded-full flex items-center justify-center mb-3"><Zap className="w-5 h-5 text-[#94a3b8]" /></div>
                              <p className="text-sm font-medium text-[#374151] mb-1">No items added yet</p>
                              <p className="text-xs text-[#94a3b8]">Add solar system components using the form above</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* ── Step 4: Review ───────────────────────────────────── */}
                      {currentStep === 4 && (
                        <div className="p-6">
                          <div className="flex items-center gap-3 mb-5">
                            <div className="w-8 h-8 bg-[#f0fdf4] rounded-lg flex items-center justify-center"><Calendar className="w-4 h-4 text-[#059669]" /></div>
                            <div>
                              <h2 className="text-base font-semibold text-[#1e293b]">Schedule &amp; Payment Terms</h2>
                              <p className="text-xs text-[#64748b]">Review quote details and payment terms</p>
                            </div>
                          </div>

                          {/* Summary stat cards */}
                          <div className="grid grid-cols-3 gap-3 mb-5">
                            {[
                              { label: "Project Total", value: formatCurrency(total), icon: DollarSign, bg: "bg-[#eff6ff]", color: "text-[#2563eb]" },
                              { label: "Work Items", value: items.length, icon: ClipboardList, bg: "bg-[#f0fdf4]", color: "text-[#059669]" },
                              { label: "VAT Amount", value: formatCurrency(totalTax), icon: Receipt, bg: "bg-[#faf5ff]", color: "text-[#7c3aed]" },
                            ].map(({ label, value, icon: Icon, bg, color }) => (
                              <div key={label} className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs font-semibold text-[#64748b]">{label}</span>
                                  <div className={`w-7 h-7 ${bg} rounded-lg flex items-center justify-center`}><Icon className={`w-3.5 h-3.5 ${color}`} /></div>
                                </div>
                                <div className={`text-lg font-bold ${color}`}>{value}</div>
                              </div>
                            ))}
                          </div>

                          {/* Payment terms */}
                          <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden shadow-sm mb-4">
                            <div className="px-5 py-3.5 border-b border-[#e2e8f0] bg-[#f8fafc]">
                              <span className="text-sm font-semibold text-[#374151]">Payment Information</span>
                            </div>
                            <div className="divide-y divide-[#f1f5f9]">
                              {[
                                ["Payment Schedule", "Milestone-Based"],
                                ["Payment Methods", "Bank Transfer, Card, EFT"],
                                ["Quote Valid For", "30 Days"],
                                ["Currency", "ZAR (South African Rand)"],
                                ["Total Due", formatCurrency(total)],
                              ].map(([k, v]) => (
                                <div key={k} className="flex items-center justify-between px-5 py-3 text-sm">
                                  <span className="text-[#64748b]">{k}</span>
                                  <span className={`font-semibold ${k === "Total Due" ? "text-[#2563eb]" : "text-[#1e293b]"}`}>{v}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Quote summary */}
                          <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-5">
                            <h3 className="text-xs font-semibold text-[#374151] uppercase tracking-wide mb-4">Quote Summary</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
                              <div>
                                <h4 className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wide mb-2 flex items-center gap-1.5"><Users className="w-3 h-3" />Client</h4>
                                <p className="font-semibold text-[#1e293b]">{customerName}</p>
                                <p className="text-[#64748b]">{customerEmail}</p>
                                <p className="text-[#64748b]">{customerPhone}</p>
                                <p className="text-[#64748b] mt-1">{propertyAddress}</p>
                              </div>
                              <div>
                                <h4 className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wide mb-2 flex items-center gap-1.5"><Zap className="w-3 h-3" />Solar System</h4>
                                <p className="text-[#64748b]"><span className="font-semibold text-[#374151]">Type:</span> {roofType}</p>
                                <p className="text-[#64748b]"><span className="font-semibold text-[#374151]">System Size:</span> {systemSize}kW</p>
                                <p className="text-[#64748b]"><span className="font-semibold text-[#374151]">Panel Type:</span> {panelType}</p>
                                <p className="text-[#64748b]"><span className="font-semibold text-[#374151]">Battery:</span> {batteryStorage}kWh</p>
                              </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-[#e2e8f0] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-[#64748b]">
                              {[["Number", quoteNumber], ["Date", new Date().toLocaleDateString()], ["Type", documentType === "quote" ? "Quote" : "Invoice"], ["Status", "Pending"]].map(([k, v]) => (
                                <div key={k}><span className="font-semibold text-[#374151] block">{k}</span>{v}</div>
                              ))}
                            </div>
                          </div>

                          {quoteId && (
                            <button onClick={handleProcessPayment} className="mt-4 flex items-center justify-center gap-2 w-full px-6 py-3 bg-[#059669] hover:bg-[#047857] text-white rounded-xl font-medium transition-colors shadow-sm">
                              <CreditCard className="w-4 h-4" />Process Payment
                            </button>
                          )}
                          {!quoteId && (
                            <div className="mt-4 flex items-center gap-2 px-4 py-3 bg-[#fff7ed] border border-[#fed7aa] rounded-lg text-sm text-[#9a3412]">
                              <Receipt className="w-4 h-4 flex-shrink-0" />Save the {documentType} first to process payment
                            </div>
                          )}
                        </div>
                      )}

                      {/* ── Step navigation ──────────────────────────────────── */}
                      <div className="px-6 py-4 bg-[#f8fafc] border-t border-[#e2e8f0] flex justify-between items-center">
                        <button onClick={handlePrevious} disabled={currentStep === 1}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${currentStep === 1 ? "bg-[#f1f5f9] text-[#94a3b8] cursor-not-allowed" : "bg-white border border-[#e2e8f0] text-[#374151] hover:bg-[#f8fafc] shadow-sm"}`}>
                          <ChevronLeft className="w-4 h-4" /><span className="hidden sm:inline">Previous</span>
                        </button>

                        <div className="text-xs font-semibold text-[#64748b] bg-white px-3 py-1.5 rounded-lg border border-[#e2e8f0]">
                          Step {currentStep} of {totalSteps}
                        </div>

                        {currentStep < totalSteps ? (
                          <button onClick={handleNext} className="flex items-center gap-2 px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
                            <span className="hidden sm:inline">Next</span><ChevronRight className="w-4 h-4" />
                          </button>
                        ) : (
                          <button onClick={handleSaveQuote} className="flex items-center gap-2 px-4 py-2 bg-[#059669] hover:bg-[#047857] text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
                            <Save className="w-4 h-4" />Save {documentType === "quote" ? "Quote" : "Invoice"}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ── RIGHT: Live preview panel (xl only) ───────────────────────── */}
              <div className="hidden xl:flex w-[420px] flex-shrink-0 flex-col border-l border-[#e2e8f0] bg-[#e8eaed] overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-[#f8fafc] border-b border-[#e2e8f0] flex-shrink-0">
                  <TemplateSelector user={user} selectedTemplate={selectedTemplate} onTemplateChange={setSelectedTemplate} />
                  <div className="flex items-center gap-1.5">
                    <button onClick={handlePrint} className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-[#e2e8f0] text-[#374151] text-xs font-medium rounded-lg hover:bg-[#f1f5f9] transition-colors">
                      <Printer className="w-3 h-3" />Print
                    </button>
                    <button onClick={handleSavePDF} className="flex items-center gap-1 px-2.5 py-1.5 bg-[#059669] text-white text-xs font-medium rounded-lg hover:bg-[#047857] transition-colors">
                      <Download className="w-3 h-3" />PDF
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  <div
                    className="bg-white shadow-lg rounded origin-top"
                    style={{ width: "210mm", minHeight: "297mm", transform: "scale(0.44)", transformOrigin: "top left", marginBottom: `calc((297mm * 0.44) - 297mm)` }}
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

export default SolarDashboard;
