import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import HomeView from "../HomeView";
import BusinessSettingsModal from "../BusinessSettingsModal";
import AppHeader from "../AppHeader";
import SubUserManagement from "../SubUserManagement";
import { serverTimestamp } from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth";
import FinancialOverview from "../FinancialOverview";
import uploadLogoToR2 from "../../utils/uploadLogoToR2";
import Templates from "./Templates";
import ServiceMarketplaceView from "../ServiceMarketplaceView";
import ServiceRequestsView from "../ServiceRequestsView";
import PurchaseOrders from "../PurchaseOrders";
import { useLocation } from "react-router-dom";
import ElectricalSidebar from "./ElectricalSidebar";
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
import { Printer, Download, Sparkles, Zap } from "lucide-react";
import { db } from "../../firebase";
import CustomerModal from "../CustomerModal";
import CustomersListModal from "../CustomersListModal";
import HistoryView from "./HistoryView";
import NotesView from "./NotesView";
import AIInvoiceWindow from '../AIInvoiceWindow';
import ElectricalScheduleView from "./ElectricalScheduleView";
import ElectricalReportsView  from "./ElectricalReportsView";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Users,
  Calendar,
  X,
  FileText,
  Plus,
  Send,
  Save,
  LogOut,
  CheckSquare,
  CreditCard,
  Receipt,
  Wallet,
  ClipboardList,
  DollarSign,
  Building,
  MapPin,
  Wrench,
} from "lucide-react";

// ── Generate quote/invoice number ─────────────────────────────────────────────
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
function AddClientRedirect({ onMount }) {
  useEffect(() => { onMount(); }, []);
  return (
    <div className="flex-1 flex items-center justify-center text-sm text-[#94a3b8]">
      Opening client form…
    </div>
  );
}
const ElectricalDashboard = () => {
  // ── Step state ────────────────────────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  const [aiWindowOpen, setAiWindowOpen] = useState(false);
  const [aiDocType, setAiDocType] = useState('invoice');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState("quote");
  const [showPreview, setShowPreview] = useState(false);
  const [showQuotesList, setShowQuotesList] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCustomersListModal, setShowCustomersListModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [inputMode, setInputMode] = useState("manual");
  const [isMobile, setIsMobile] = useState(false);
  const [showAIWindow, setShowAIWindow] = useState(false);
  const { user, authUser } = useAuth();
  const location = useLocation();

  // ── Document state ────────────────────────────────────────────────────────
  const [documentType, setDocumentType] = useState("quote");
  const [quoteNumber, setQuoteNumber] = useState("");
  const [quoteId, setQuoteId] = useState(null);
  const [savedQuotes, setSavedQuotes] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("professional");

  // ── Customer state ────────────────────────────────────────────────────────
  const [customers, setCustomers] = useState([]);
  const [savedCustomers, setSavedCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedQuoteForPayment, setSelectedQuoteForPayment] = useState(null);

  // ── Form fields ───────────────────────────────────────────────────────────
  const [customerName, setCustomerName] = useState("Meridian Developments");
  const [customerEmail, setCustomerEmail] = useState("projects@meridian.co.za");
  const [customerPhone, setCustomerPhone] = useState("+27 11 234 5678");
  const [propertyAddress, setPropertyAddress] = useState(
    "45 Corporate Boulevard, Sandton, Johannesburg, 2196"
  );

  // ── Electrical-specific property fields ──────────────────────────────────
  const [siteType, setSiteType] = useState("Commercial");
  const [siteSize, setSiteSize] = useState("850");
  const [powerRating, setPowerRating] = useState("400");
  const [urgencyLevel, setUrgencyLevel] = useState("Standard");

  // ── Items ─────────────────────────────────────────────────────────────────
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({
    description: "",
    rate: "",
    qty: "",
    workCategory: "Electrical Installation",
    taxRate: "15",
    urgency: "Standard",
  });

  // ── Payment / stamp ───────────────────────────────────────────────────────
  const [paymentStatus, setPaymentStatus] = useState({
    totalPaid: 0,
    balanceDue: 0,
    status: "pending",
  });
  const [stampSettings, setStampSettings] = useState({
    text: "PAID",
    color: "#22c55e",
    showDate: true,
    enabled: true,
  });

  // ── Business info ─────────────────────────────────────────────────────────
  const [businessInfo, setBusinessInfo] = useState({
    businessName: "VOLT ELECTRICAL SERVICES",
    addressLine1: "18 Circuit Road",
    addressLine2: "Midrand",
    city: "Johannesburg",
    postalCode: "1685",
    primaryPhone: "+27 11 888 0001",
    secondaryPhone: "+27 11 888 0002",
    email: "info@voltelectrical.co.za",
    website: "www.voltelectrical.co.za",
    registrationNumber: "2022/045678/07",
    vatNumber: "4567891230",
    logoUrl: "",
  });
  const [loading, setLoading] = useState(true);

  // ── Design tokens (yellow/amber accent for electrical) ────────────────────
  const inputCls =
    "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md bg-white text-[#1e293b] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#d97706] focus:border-[#d97706] transition-colors";
  const labelCls =
    "block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5";
  const selectCls =
    "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md bg-white text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#d97706] focus:border-[#d97706] transition-colors";

  // ── Derived totals ────────────────────────────────────────────────────────
  const subtotal = items.reduce((s, i) => s + i.amount, 0);
  const totalTax = items.reduce((s, i) => s + i.taxAmount, 0);
  const total = subtotal + totalTax;

  // ── Steps config ──────────────────────────────────────────────────────────
  const steps = [
    { number: 1, title: "Client Info", icon: Users },
    { number: 2, title: "Property", icon: Building },
    { number: 3, title: "Electrical Work", icon: Zap },
    { number: 4, title: "Schedule", icon: Calendar },
  ];

  // ── Effects ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (location.state?.activeView) setActiveView(location.state.activeView);
  }, [location.state]);

  useEffect(() => {
    if (!user?.uid) return;
    generateQuoteNumber(user.uid, documentType).then(setQuoteNumber);
    loadSavedQuotes();
  }, [user, documentType]);

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
    if (user?.uid) {
      loadBusinessInfo();
      loadCustomers();
    }
  }, [user]);

  useEffect(() => {
    loadPaymentStatus();
  }, [quoteId, user?.uid, documentType]);

  useEffect(() => {
    if (!quoteId)
      setPaymentStatus({ totalPaid: 0, balanceDue: total, status: "pending" });
  }, [total, quoteId]);

  // ── Loaders ───────────────────────────────────────────────────────────────
  const loadBusinessInfo = async () => {
    if (!user?.uid) return;
    try {
      const db = getFirestore();
      const snap = await getDoc(
        doc(db, "users", user.uid, "settings", "businessInfo")
      );
      if (snap.exists()) {
        const d = snap.data();
        setBusinessInfo(d);
        if (d.stampSettings) setStampSettings(d.stampSettings);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomers = async () => {
    try {
      const q = query(
        collection(db, "users", user.uid, "clients"),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      setCustomers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
    }
  };

  const loadSavedQuotes = async () => {
    if (!user?.uid) return;
    const db = getFirestore();
    const col = documentType === "quote" ? "quotes" : "invoices";
    const q = query(
      collection(db, "users", user.uid, col),
      orderBy("createdAt", "desc"),
      limit(50)
    );
    const snap = await getDocs(q);
    setSavedQuotes(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  const loadPaymentStatus = async () => {
    if (!user?.uid || !quoteId) {
      setPaymentStatus({ totalPaid: 0, balanceDue: total, status: "pending" });
      return;
    }
    try {
      const col = documentType === "quote" ? "quotes" : "invoices";
      const snap = await getDoc(doc(db, "users", user.uid, col, quoteId));
      if (snap.exists()) {
        const d = snap.data();
        setPaymentStatus({
          totalPaid: d.totals?.paid || 0,
          balanceDue: d.totals?.due || d.totals?.total || 0,
          status: d.status || "pending",
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleNext = () => {
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };
  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };
  const handleRemoveItem = (i) =>
    setItems((prev) => prev.filter((_, idx) => idx !== i));

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
        workCategory: newItem.workCategory || "Electrical Installation",
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
      workCategory: "Electrical Installation",
      taxRate: "15",
      urgency: "Standard",
    });
  };

  const handleAIDataExtracted = (data) => {
    if (data.customer?.name) setCustomerName(data.customer.name);
    if (data.customer?.email) setCustomerEmail(data.customer.email);
    if (data.customer?.phone) setCustomerPhone(data.customer.phone);
    if (data.customer?.address) setPropertyAddress(data.customer.address);
    if (data.items?.length > 0) setItems(data.items);
    alert("✨ Data extracted and populated successfully!");
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
    propertyDetails: {
      type: siteType,
      size: siteSize,
      powerRating,
      urgency: urgencyLevel,
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
    const col = documentType === "quote" ? "quotes" : "invoices";
    if (quoteId) {
      await updateDoc(doc(db, "users", user.uid, col, quoteId), {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } else {
      const ref = await addDoc(collection(db, "users", user.uid, col), data);
      setQuoteId(ref.id);
    }
    alert(
      `${documentType === "quote" ? "Quote" : "Invoice"} saved successfully`
    );
    loadSavedQuotes();
  };

  const handleConvertToInvoice = async () => {
    if (!user?.uid || !quoteId) {
      alert("Please save the quote first");
      return;
    }
    if (!window.confirm("Convert this quote to an invoice?")) return;
    try {
      const db = getFirestore();
      const newNumber = await generateQuoteNumber(user.uid, "invoice");
      const data = buildQuotePayload(newNumber);
      data.documentType = "invoice";
      data.convertedFromQuote = quoteId;
      data.convertedFromQuoteNumber = quoteNumber;
      data.convertedAt = serverTimestamp();
      const ref = await addDoc(
        collection(db, "users", user.uid, "invoices"),
        data
      );
      await updateDoc(doc(db, "users", user.uid, "quotes", quoteId), {
        convertedToInvoice: true,
        convertedToInvoiceId: ref.id,
        convertedToInvoiceNumber: newNumber,
        convertedAt: serverTimestamp(),
        status: "converted",
      });
      setDocumentType("invoice");
      setQuoteId(ref.id);
      setQuoteNumber(newNumber);
      alert(`Converted to Invoice ${newNumber}`);
      loadSavedQuotes();
    } catch (e) {
      alert("Failed to convert quote to invoice");
    }
  };

  const handleNewDocument = () => {
    setQuoteId(null);
    setQuoteNumber("");
    setCustomerName("Meridian Developments");
    setCustomerEmail("projects@meridian.co.za");
    setCustomerPhone("+27 11 234 5678");
    setPropertyAddress("45 Corporate Boulevard, Sandton, Johannesburg, 2196");
    setSiteType("Commercial");
    setSiteSize("850");
    setPowerRating("400");
    setUrgencyLevel("Standard");
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
    const col = documentType === "quote" ? "quotes" : "invoices";
    const snap = await getDoc(doc(db, "users", user.uid, col, quoteId));
    if (snap.exists()) {
      setSelectedQuoteForPayment({ id: quoteId, ...snap.data() });
      setShowPaymentModal(true);
    } else {
      alert("Quote not found. Please save first.");
    }
  };

  const handlePaymentComplete = () => {
    loadSavedQuotes();
    loadPaymentStatus();
    setShowPaymentModal(false);
  };

  const loadQuote = (quote) => {
    setQuoteId(quote.id);
    setQuoteNumber(quote.quoteNumber || "");
    setCustomerName(quote.customer?.name || "");
    setCustomerEmail(quote.customer?.email || "");
    setCustomerPhone(quote.customer?.phone || "");
    setPropertyAddress(quote.customer?.address || "");
    setSiteType(quote.propertyDetails?.type || "");
    setSiteSize(quote.propertyDetails?.size || "");
    setPowerRating(quote.propertyDetails?.powerRating || "");
    setUrgencyLevel(quote.propertyDetails?.urgency || "");
    setItems(quote.items || []);
    setShowQuotesList(false);
    setPaymentStatus({
      totalPaid: quote.totals?.paid || 0,
      balanceDue: quote.totals?.due || quote.totals?.total || 0,
      status: quote.status || "pending",
    });
  };

  const loadCustomer = (c) => {
    setCustomerName(c.name || "");
    setCustomerEmail(c.email || "");
    setCustomerPhone(c.phone || "");
    setPropertyAddress(c.address || "");
  };

  const handleLogout = async () => {
    try {
      await signOut(getAuth());
    } catch (e) {
      console.error(e);
    }
  };
const handleAddNewCustomer = () => {
  setSelectedCustomer(null);
  setShowCustomerModal(true);
};
  const printStyles = `@media print { * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } html,body { margin:0!important;padding:0!important;width:210mm!important;background:white!important; } body * { visibility:hidden!important; } #print-area,#print-area * { visibility:visible!important; } #print-area { display:block!important;position:absolute!important;left:0!important;top:0!important;width:210mm!important;min-height:297mm!important;margin:0!important;padding:0!important;background:white!important; } @page { size:A4 portrait;margin:0; } }`;

  const handlePrint = () => {
    const s = document.createElement("style");
    s.textContent = printStyles;
    document.head.appendChild(s);
    window.print();
    setTimeout(() => document.head.removeChild(s), 1000);
  };

  const handleSavePDF = async () => {
    if (!user?.uid || !quoteId) {
      alert(`Please save the ${documentType} before exporting PDF`);
      return;
    }
    const col = documentType === "quote" ? "quotes" : "invoices";
    const snap = await getDoc(doc(db, "users", user.uid, col, quoteId));
    if (!snap.exists()) { alert("Please save first"); return; }
    const saved = snap.data();
    setQuoteNumber(saved.quoteNumber);
    setItems(saved.items);
    setCustomerName(saved.customer.name);
    setCustomerEmail(saved.customer.email);
    setCustomerPhone(saved.customer.phone);
    setPropertyAddress(saved.customer.address);
    setTimeout(() => window.print(), 300);
  };

  // ── Shared template props ─────────────────────────────────────────────────
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
    {
      label: "Preview",
      icon: Eye,
      onClick: () => setShowPreview(true),
      className:
        "flex items-center gap-1.5 px-3 py-1.5 bg-[#0f172a] hover:bg-[#1e293b] text-white text-sm font-medium rounded-md transition-colors whitespace-nowrap",
    },
    { label: "Print", icon: Printer, onClick: handlePrint, variant: "secondary" },
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
        "flex items-center gap-1.5 px-3 py-1.5 bg-[#d97706] hover:bg-[#b45309] text-white text-sm font-medium rounded-md transition-colors whitespace-nowrap",
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
        "flex items-center gap-1.5 px-3 py-2 bg-[#d97706] text-white rounded-md text-xs font-medium active:scale-95 whitespace-nowrap",
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

  // ── Status badge helper ───────────────────────────────────────────────────
  const statusBadge = (s) =>
    s === "paid"
      ? "bg-[#dcfce7] text-[#166534]"
      : s === "partially_paid"
      ? "bg-[#fef3c7] text-[#92400e]"
      : s === "pending"
      ? "bg-[#dbeafe] text-[#1e40af]"
      : "bg-[#fef2f2] text-[#991b1b]";

  // ── RENDER ────────────────────────────────────────────────────────────────
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
    industry="electrical"
    TemplateRenderer={TemplateRenderer}
    onNavigateTo={(view) => {
    setAiWindowOpen(false);
    setActiveView(view); 
  }}
  />
)}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* ── Sidebar ───────────────────────────────────────────────────── */}
        <ElectricalSidebar
          user={user}
  activeView={activeView}
  setActiveView={setActiveView}
  sidebarOpen={sidebarOpen}
  setSidebarOpen={setSidebarOpen}
  setShowSettings={setShowSettings}
  handleNewInvoice={handleNewInvoice}
  handleNewQuote={handleNewQuote}
  businessInfo={businessInfo}
  savedQuotes={savedQuotes}
  savedCustomers={customers}
  handleLogout={handleLogout}
  documentType={documentType}
  setShowQuotesList={setShowQuotesList}
  setShowCustomersListModal={setShowCustomersListModal}
  handleAddNewCustomer={handleAddNewCustomer}
  newRequestCount={0}
        />

        {/* ── Main content ──────────────────────────────────────────────── */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          <AppHeader
            actions={headerActions}
            mobileActions={mobileDashboardActions}
            onSettingsOpen={() => setShowSettings(true)}
          />

          {/* ── Modals ──────────────────────────────────────────────────── */}
          {showSettings && (
            <BusinessSettingsModal onClose={() => setShowSettings(false)} />
          )}
          <CustomersListModal
            showModal={showCustomersListModal}
            setShowModal={setShowCustomersListModal}
            customers={customers}
            onLoadCustomer={loadCustomer}
            onEditCustomer={(c) => { setSelectedCustomer(c); setShowCustomerModal(true); }}
            onAddNewCustomer={() => { setSelectedCustomer(null); setShowCustomerModal(true); }}
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

          {/* ── Quotes list modal ──────────────────────────────────────── */}
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
                          {["Number", "Client", "Total", "Paid", "Status"].map((h) => (
                            <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wide">{h}</th>
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
                            <td className="px-5 py-3 text-sm font-semibold text-[#d97706]">
                              {q.quoteNumber || "N/A"}
                            </td>
                            <td className="px-5 py-3 text-sm text-[#374151]">
                              {q.customer?.name || "N/A"}
                            </td>
                            <td className="px-5 py-3 text-sm font-semibold text-[#1e293b]">
                              R{q.totals?.total?.toFixed(2) || "0.00"}
                            </td>
                            <td className="px-5 py-3 text-sm text-[#059669] font-medium">
                              R{q.totals?.paid?.toFixed(2) || "0.00"}
                            </td>
                            <td className="px-5 py-3">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${statusBadge(q.status)}`}>
                                {q.status === "partially_paid" ? "Partial" : q.status || "Pending"}
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

          {/* ── Fullscreen preview modal ───────────────────────────────── */}
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
                      <p className="text-xs text-[#64748b]">{quoteNumber || "Draft"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={handlePrint} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-medium rounded-lg transition-colors">
                      <Printer className="w-3.5 h-3.5" />Print
                    </button>
                    <button onClick={handleSavePDF} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#059669] hover:bg-[#047857] text-white text-xs font-medium rounded-lg transition-colors">
                      <Download className="w-3.5 h-3.5" />Save PDF
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

          {/* ── Non-quote views ────────────────────────────────────────── */}
          {activeView === "financial-overview" && <div className="flex-1 overflow-y-auto p-4"><FinancialOverview user={user} /></div>}
          {activeView === "history-view" && <div className="flex-1 overflow-y-auto p-4"><HistoryView user={user} /></div>}
          {activeView === "notes-view" && <div className="flex-1 overflow-y-auto p-4"><NotesView user={user} /></div>}
          {activeView === "templates" && <div className="flex-1 overflow-y-auto p-4"><Templates user={user} /></div>}
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
           {activeView === "purchase-orders" && (
  <div className="flex-1 overflow-y-auto p-6">
    <PurchaseOrders user={user} />
  </div>
)}
    {activeView === "schedule" && (
  <div className="flex-1 overflow-y-auto p-6">
    <ElectricalScheduleView user={user} />
  </div>
)}
 
{activeView === "reports" && (
  <div className="flex-1 overflow-y-auto p-6">
    <ElectricalReportsView user={user} />
  </div>
)}
 
{activeView === "quotes-list" && (
  <div className="flex-1 overflow-y-auto p-6">
    <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden max-w-5xl mx-auto">
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0] bg-[#f8fafc]">
        <div>
          <h2 className="text-base font-semibold text-[#1e293b]">
            All {documentType === "invoice" ? "Invoices" : "Quotes"}
          </h2>
          <p className="text-xs text-[#64748b] mt-0.5">{savedQuotes.length} records</p>
        </div>
        <button
          onClick={() => { handleNewQuote(); setActiveView("quote"); }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#d97706] hover:bg-[#b45309] text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />New Quote
        </button>
      </div>
      {savedQuotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Receipt className="w-10 h-10 text-[#cbd5e1] mb-3" />
          <p className="text-sm text-[#94a3b8]">No records found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                {["Number", "Client", "Property Type", "Power (A)", "Urgency", "Total", "Paid", "Status", "Date"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {savedQuotes.map(q => {
                const urgency = q.propertyDetails?.urgency || "Standard";
                const urgencyCls =
                  urgency === "Emergency" ? "bg-[#fef2f2] text-[#991b1b]"
                  : urgency === "Urgent"  ? "bg-[#fff7ed] text-[#9a3412]"
                  : "bg-[#f1f5f9] text-[#475569]";
                return (
                  <tr
                    key={q.id}
                    onClick={() => { loadQuote(q); setActiveView("quote"); }}
                    className="border-b border-[#f1f5f9] hover:bg-[#f8fafc] cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 text-sm font-semibold text-[#d97706]">{q.quoteNumber || "N/A"}</td>
                    <td className="px-4 py-3 text-sm text-[#374151]">{q.customer?.name || "N/A"}</td>
                    <td className="px-4 py-3 text-xs text-[#64748b]">{q.propertyDetails?.type || "—"}</td>
                    <td className="px-4 py-3 text-sm text-[#374151]">{q.propertyDetails?.powerRating ? `${q.propertyDetails.powerRating}A` : "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${urgencyCls}`}>{urgency}</span>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-[#1e293b]">R{q.totals?.total?.toFixed(2) || "0.00"}</td>
                    <td className="px-4 py-3 text-sm text-[#059669] font-medium">R{q.totals?.paid?.toFixed(2) || "0.00"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${statusBadge(q.status)}`}>
                        {q.status === "partially_paid" ? "Partial" : q.status || "Pending"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#64748b] whitespace-nowrap">
                      {q.dates?.quoteDate ? new Date(q.dates.quoteDate).toLocaleDateString("en-ZA") : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  </div>
)}
 
{activeView === "clients" && (
  <div className="flex-1 overflow-y-auto p-6">
    <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden max-w-5xl mx-auto">
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0] bg-[#f8fafc]">
        <div>
          <h2 className="text-base font-semibold text-[#1e293b]">All Clients</h2>
          <p className="text-xs text-[#64748b] mt-0.5">{customers.length} clients</p>
        </div>
        <button
          onClick={handleAddNewCustomer}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#d97706] hover:bg-[#b45309] text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />Add Client
        </button>
      </div>
      {customers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Users className="w-10 h-10 text-[#cbd5e1] mb-3" />
          <p className="text-sm text-[#94a3b8]">No clients yet</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                {["Name", "Email", "Phone", "Address", ""].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {customers.map(c => (
                <tr key={c.id} className="border-b border-[#f1f5f9] hover:bg-[#f8fafc] transition-colors">
                  <td className="px-5 py-3 text-sm font-semibold text-[#1e293b]">{c.name || "—"}</td>
                  <td className="px-5 py-3 text-sm text-[#64748b]">{c.email || "—"}</td>
                  <td className="px-5 py-3 text-sm text-[#64748b]">{c.phone || "—"}</td>
                  <td className="px-5 py-3 text-sm text-[#64748b]">{c.address || "—"}</td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => { setSelectedCustomer(c); setShowCustomerModal(true); }}
                      className="text-xs text-[#d97706] hover:underline font-medium"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
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
{activeView === "addClient" && (
  <AddClientRedirect
    onMount={() => {
      setSelectedCustomer(null);
      setShowCustomerModal(true);
      setActiveView("clients");
    }}
  />
)}
          {/* ── Quote / Invoice view — split layout ─────────────────────── */}
          {activeView === "quote" && (
            <div className="flex-1 overflow-hidden flex min-h-0">

              {/* ── LEFT: Form panel ──────────────────────────────────── */}
              <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 min-w-0">
                <div className="space-y-5">

                  {/* ── Summary stat cards ─────────────────────────────── */}
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      {
                        label: "Total Amount",
                        value: `R${total.toFixed(2)}`,
                        icon: DollarSign,
                        iconBg: "bg-[#fef3c7]",
                        iconColor: "text-[#d97706]",
                        textColor: "text-[#1e293b]",
                      },
                      {
                        label: "Paid",
                        value: `R${paymentStatus.totalPaid.toFixed(2)}`,
                        icon: CheckSquare,
                        iconBg: paymentStatus.totalPaid > 0 ? "bg-[#dcfce7]" : "bg-[#f1f5f9]",
                        iconColor: paymentStatus.totalPaid > 0 ? "text-[#059669]" : "text-[#94a3b8]",
                        textColor: paymentStatus.totalPaid > 0 ? "text-[#059669]" : "text-[#1e293b]",
                      },
                      {
                        label: "Balance Due",
                        value: `R${paymentStatus.balanceDue.toFixed(2)}`,
                        icon: Wallet,
                        iconBg: paymentStatus.balanceDue <= 0 ? "bg-[#dcfce7]" : "bg-[#fef2f2]",
                        iconColor: paymentStatus.balanceDue <= 0 ? "text-[#059669]" : "text-[#dc2626]",
                        textColor: paymentStatus.balanceDue <= 0 ? "text-[#059669]" : "text-[#dc2626]",
                      },
                    ].map(({ label, value, icon: Icon, iconBg, iconColor, textColor }) => (
                      <div key={label} className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-semibold text-[#64748b] uppercase tracking-wide">{label}</span>
                          <div className={`w-8 h-8 ${iconBg} rounded-lg flex items-center justify-center`}>
                            <Icon className={`w-4 h-4 ${iconColor}`} />
                          </div>
                        </div>
                        <div className={`text-xl font-bold ${textColor}`}>{value}</div>
                      </div>
                    ))}
                  </div>

                  {/* ── Payment status banner ──────────────────────────── */}
                  {quoteId && (
                    <div className={`px-5 py-3.5 rounded-xl border flex items-center justify-between ${
                      paymentStatus.status === "paid" ? "bg-[#f0fdf4] border-[#bbf7d0]"
                      : paymentStatus.status === "partially_paid" ? "bg-[#fffbeb] border-[#fde68a]"
                      : "bg-[#fff7ed] border-[#fed7aa]"
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          paymentStatus.status === "paid" ? "bg-[#dcfce7]"
                          : paymentStatus.status === "partially_paid" ? "bg-[#fef3c7]"
                          : "bg-[#ffedd5]"
                        }`}>
                          <CreditCard className={`w-4 h-4 ${
                            paymentStatus.status === "paid" ? "text-[#059669]"
                            : paymentStatus.status === "partially_paid" ? "text-[#d97706]"
                            : "text-[#d97706]"
                          }`} />
                        </div>
                        <div className={`text-sm font-semibold ${
                          paymentStatus.status === "paid" ? "text-[#166534]"
                          : paymentStatus.status === "partially_paid" ? "text-[#92400e]"
                          : "text-[#9a3412]"
                        }`}>
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
                          <CreditCard className="w-4 h-4" />Record Payment
                        </button>
                      )}
                    </div>
                  )}

                  {/* ── Main form card ────────────────────────────────── */}
                  <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">

                    {/* Input mode tabs */}
                    <div className="flex border-b border-[#e2e8f0] bg-[#f8fafc]">
                      <button
                        onClick={() => setInputMode("manual")}
                        className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all border-b-2 -mb-px ${
                          inputMode === "manual"
                            ? "border-[#d97706] text-[#d97706] bg-white"
                            : "border-transparent text-[#64748b] hover:text-[#374151]"
                        }`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
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

                    

                    {inputMode === "manual" && (
                      <>
                        {/* Step indicator */}
                        <div className="px-6 py-4 border-b border-[#e2e8f0] bg-[#f8fafc]">
                          <div className="flex items-center gap-0">
                            {steps.map((step, idx) => (
                              <React.Fragment key={step.number}>
                                <div className="flex items-center gap-2">
                                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                    currentStep === step.number ? "bg-[#d97706] text-white"
                                    : currentStep > step.number ? "bg-[#dcfce7] text-[#059669] ring-1 ring-[#059669]"
                                    : "bg-[#e2e8f0] text-[#94a3b8]"
                                  }`}>
                                    {currentStep > step.number ? "✓" : step.number}
                                  </div>
                                  <span className={`text-xs font-medium hidden sm:block ${
                                    currentStep === step.number ? "text-[#d97706]"
                                    : currentStep > step.number ? "text-[#059669]"
                                    : "text-[#94a3b8]"
                                  }`}>
                                    {step.title}
                                  </span>
                                </div>
                                {idx < steps.length - 1 && (
                                  <div className={`flex-1 h-px mx-2 ${currentStep > step.number ? "bg-[#059669]" : "bg-[#e2e8f0]"}`} />
                                )}
                              </React.Fragment>
                            ))}
                          </div>
                        </div>

                        {/* Step content */}
                        <div className="p-6">

                          {/* ── Step 1: Client Info ─────────────────────── */}
                          {currentStep === 1 && (
                            <div>
                              <div className="flex items-center gap-3 mb-5">
                                <div className="w-9 h-9 bg-[#fef3c7] rounded-lg flex items-center justify-center">
                                  <Users className="w-5 h-5 text-[#d97706]" />
                                </div>
                                <div>
                                  <h2 className="text-base font-semibold text-[#1e293b]">Client Information</h2>
                                  <p className="text-xs text-[#64748b]">Enter client / contractor details</p>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                  <label className={labelCls}>Client / Company Name <span className="text-[#dc2626] normal-case tracking-normal font-normal">*</span></label>
                                  <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Meridian Developments" className={inputCls} />
                                </div>
                                <div>
                                  <label className={labelCls}>Email <span className="text-[#dc2626] normal-case tracking-normal font-normal">*</span></label>
                                  <input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="projects@company.co.za" className={inputCls} />
                                </div>
                                <div>
                                  <label className={labelCls}>Phone <span className="text-[#dc2626] normal-case tracking-normal font-normal">*</span></label>
                                  <input type="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="+27 11 234 5678" className={inputCls} />
                                </div>
                                <div>
                                  <label className={labelCls}>Property Address <span className="text-[#dc2626] normal-case tracking-normal font-normal">*</span></label>
                                  <input type="text" value={propertyAddress} onChange={(e) => setPropertyAddress(e.target.value)} placeholder="45 Corporate Boulevard, Sandton" className={inputCls} />
                                </div>
                              </div>
                            </div>
                          )}

                          {/* ── Step 2: Property Details ────────────────── */}
                          {currentStep === 2 && (
                            <div>
                              <div className="flex items-center gap-3 mb-5">
                                <div className="w-9 h-9 bg-[#eff6ff] rounded-lg flex items-center justify-center">
                                  <Building className="w-5 h-5 text-[#2563eb]" />
                                </div>
                                <div>
                                  <h2 className="text-base font-semibold text-[#1e293b]">Property Details</h2>
                                  <p className="text-xs text-[#64748b]">Electrical site specifications</p>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                  <label className={labelCls}>Property / Building Type</label>
                                  <select value={siteType} onChange={(e) => setSiteType(e.target.value)} className={selectCls}>
                                    {["Commercial", "Residential", "Industrial", "Infrastructure", "Renovation", "Government"].map((o) => (
                                      <option key={o}>{o}</option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className={labelCls}>Property Area (sqm)</label>
                                  <input type="number" value={siteSize} onChange={(e) => setSiteSize(e.target.value)} placeholder="850" className={inputCls} />
                                </div>
                                <div>
                                  <label className={labelCls}>Power Rating (Amps)</label>
                                  <input type="number" value={powerRating} onChange={(e) => setPowerRating(e.target.value)} placeholder="400" className={inputCls} />
                                </div>
                                <div>
                                  <label className={labelCls}>Urgency Level</label>
                                  <select value={urgencyLevel} onChange={(e) => setUrgencyLevel(e.target.value)} className={selectCls}>
                                    {["Standard", "Urgent", "Emergency", "Planned"].map((o) => (
                                      <option key={o}>{o}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>

                              {/* Property summary */}
                              <div className="mt-4 p-3.5 bg-[#fef3c7] border border-[#fde68a] rounded-lg">
                                <div className="flex items-center gap-2 text-[#d97706] text-sm font-semibold mb-1">
                                  <Zap className="w-4 h-4" />
                                  Property Summary
                                </div>
                                <div className="text-xs text-[#92400e] space-y-0.5">
                                  <p><span className="font-semibold">Type:</span> {siteType} · <span className="font-semibold">Area:</span> {siteSize} sqm</p>
                                  <p><span className="font-semibold">Power Rating:</span> {powerRating}A · <span className="font-semibold">Urgency:</span> {urgencyLevel}</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* ── Step 3: Electrical Work ─────────────────── */}
                          {currentStep === 3 && (
                            <div>
                              <div className="flex items-center gap-3 mb-5">
                                <div className="w-9 h-9 bg-[#fef3c7] rounded-lg flex items-center justify-center">
                                  <Zap className="w-5 h-5 text-[#d97706]" />
                                </div>
                                <div>
                                  <h2 className="text-base font-semibold text-[#1e293b]">Electrical Work</h2>
                                  <p className="text-xs text-[#64748b]">Add work items and materials to the {documentType}</p>
                                </div>
                              </div>

                              {/* Add item form */}
                              <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-5 mb-5">
                                <h3 className="text-sm font-semibold text-[#374151] mb-4 flex items-center gap-2">
                                  <Plus className="w-4 h-4 text-[#d97706]" />
                                  Add Electrical Work Item
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                                  <div>
                                    <label className={labelCls}>Work Category</label>
                                    <select value={newItem.workCategory} onChange={(e) => setNewItem({ ...newItem, workCategory: e.target.value })} className={selectCls}>
                                      {["Electrical Installation", "Distribution Board", "Wiring & Cabling", "Lighting", "Solar & Renewables", "Generator & UPS", "Fire Alarm Systems", "CCTV & Security", "Data & Networking", "Earthing & Bonding", "Fault Finding", "Compliance Certificate", "Inspection & Testing", "Materials Supply"].map((o) => (
                                        <option key={o}>{o}</option>
                                      ))}
                                    </select>
                                  </div>
                                  <div>
                                    <label className={labelCls}>Urgency</label>
                                    <select value={newItem.urgency} onChange={(e) => setNewItem({ ...newItem, urgency: e.target.value })} className={selectCls}>
                                      {["Standard", "Urgent", "Emergency", "Planned"].map((o) => (
                                        <option key={o}>{o}</option>
                                      ))}
                                    </select>
                                  </div>
                                </div>
                                <div className="mb-3">
                                  <label className={labelCls}>Description</label>
                                  <input type="text" placeholder="Work item / material description" value={newItem.description} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} className={inputCls} />
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                  <div>
                                    <label className={labelCls}>Unit Rate (R)</label>
                                    <input type="number" placeholder="0.00" value={newItem.rate} onChange={(e) => setNewItem({ ...newItem, rate: e.target.value })} className={inputCls} />
                                  </div>
                                  <div>
                                    <label className={labelCls}>Quantity</label>
                                    <input type="number" placeholder="1" value={newItem.qty} onChange={(e) => setNewItem({ ...newItem, qty: e.target.value })} className={inputCls} />
                                  </div>
                                  <div>
                                    <label className={labelCls}>VAT %</label>
                                    <input type="number" placeholder="15" value={newItem.taxRate} onChange={(e) => setNewItem({ ...newItem, taxRate: e.target.value })} className={inputCls} />
                                  </div>
                                  <div className="flex items-end">
                                    <button onClick={handleAddItem} className="w-full flex items-center justify-center gap-1.5 px-4 py-2 bg-[#d97706] hover:bg-[#b45309] text-white text-sm font-medium rounded-md transition-colors">
                                      <Plus className="w-4 h-4" />Add
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Items table */}
                              {items.length > 0 ? (
                                <div className="border border-[#e2e8f0] rounded-xl overflow-hidden mb-5">
                                  <div className="px-4 py-3 bg-[#f8fafc] border-b border-[#e2e8f0] flex items-center justify-between">
                                    <span className="text-sm font-semibold text-[#374151]">Work Items</span>
                                    <span className="text-xs text-[#64748b] bg-[#e2e8f0] px-2 py-0.5 rounded-full">{items.length} items</span>
                                  </div>
                                  <div className="overflow-x-auto">
                                    <table className="w-full">
                                      <thead>
                                        <tr className="border-b border-[#e2e8f0]">
                                          {["Description", "Category", "Urgency", "Rate", "Qty", "VAT", "Total", ""].map((h) => (
                                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wide whitespace-nowrap">{h}</th>
                                          ))}
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {items.map((item, i) => (
                                          <tr key={i} className="border-b border-[#f1f5f9] hover:bg-[#f8fafc] transition-colors">
                                            <td className="px-4 py-3 text-sm font-medium text-[#374151]">{item.description}</td>
                                            <td className="px-4 py-3">
                                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-[#fef3c7] text-[#92400e]">
                                                {item.workCategory || "Electrical"}
                                              </span>
                                            </td>
                                            <td className="px-4 py-3">
                                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                                                item.urgency === "Emergency" ? "bg-[#fef2f2] text-[#991b1b]"
                                                : item.urgency === "Urgent" ? "bg-[#fff7ed] text-[#9a3412]"
                                                : "bg-[#f0fdf4] text-[#166534]"
                                              }`}>
                                                {item.urgency || "Standard"}
                                              </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-[#374151]">R{item.rate.toFixed(2)}</td>
                                            <td className="px-4 py-3 text-sm text-[#374151]">{item.qty}</td>
                                            <td className="px-4 py-3 text-sm text-[#374151]">R{item.taxAmount.toFixed(2)}</td>
                                            <td className="px-4 py-3 text-sm font-semibold text-[#1e293b]">R{item.totalAmount.toFixed(2)}</td>
                                            <td className="px-4 py-3">
                                              <button onClick={() => handleRemoveItem(i)} className="p-1.5 text-[#94a3b8] hover:text-[#dc2626] hover:bg-[#fef2f2] rounded-lg transition-all">
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
                                        <span className="font-medium text-[#374151]">R{subtotal.toFixed(2)}</span>
                                      </div>
                                      <div className="flex justify-between w-48 text-[#64748b]">
                                        <span>VAT (15%)</span>
                                        <span className="font-medium text-[#374151]">R{totalTax.toFixed(2)}</span>
                                      </div>
                                      <div className="flex justify-between w-48 pt-2 border-t border-[#e2e8f0] font-semibold text-[#1e293b]">
                                        <span>Total</span>
                                        <span className="text-[#d97706]">R{total.toFixed(2)}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="border-2 border-dashed border-[#e2e8f0] rounded-xl py-12 text-center">
                                  <Zap className="w-8 h-8 text-[#cbd5e1] mx-auto mb-3" />
                                  <p className="text-sm font-medium text-[#94a3b8]">No work items added yet</p>
                                  <p className="text-xs text-[#cbd5e1] mt-1">Use the form above to add electrical items</p>
                                </div>
                              )}
                            </div>
                          )}

                          {/* ── Step 4: Schedule & Payment ──────────────── */}
                          {currentStep === 4 && (
                            <div>
                              <div className="flex items-center gap-3 mb-5">
                                <div className="w-9 h-9 bg-[#f0fdf4] rounded-lg flex items-center justify-center">
                                  <Calendar className="w-5 h-5 text-[#059669]" />
                                </div>
                                <div>
                                  <h2 className="text-base font-semibold text-[#1e293b]">Schedule & Payment Terms</h2>
                                  <p className="text-xs text-[#64748b]">Review and process payment</p>
                                </div>
                              </div>

                              {/* Summary cards */}
                              <div className="grid grid-cols-3 gap-3 mb-5">
                                {[
                                  { label: "Project Total", value: `R${total.toFixed(2)}`, icon: DollarSign, bg: "bg-[#fef3c7]", color: "text-[#d97706]" },
                                  { label: "Work Items", value: items.length, icon: ClipboardList, bg: "bg-[#f0fdf4]", color: "text-[#059669]" },
                                  { label: "VAT Amount", value: `R${totalTax.toFixed(2)}`, icon: Receipt, bg: "bg-[#faf5ff]", color: "text-[#7c3aed]" },
                                ].map(({ label, value, icon: Icon, bg, color }) => (
                                  <div key={label} className={`${bg} border border-[#e2e8f0] rounded-xl p-4`}>
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-xs font-semibold text-[#64748b]">{label}</span>
                                      <Icon className={`w-4 h-4 ${color}`} />
                                    </div>
                                    <div className={`text-xl font-bold ${color}`}>{value}</div>
                                  </div>
                                ))}
                              </div>

                              {/* Payment info table */}
                              <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden shadow-sm mb-5">
                                <div className="px-5 py-3.5 border-b border-[#e2e8f0] bg-[#f8fafc]">
                                  <span className="text-sm font-semibold text-[#374151]">Payment Information</span>
                                </div>
                                <div className="divide-y divide-[#f1f5f9]">
                                  {[
                                    ["Payment Due", "Upon Completion"],
                                    ["Payment Methods", "Bank Transfer, Card, EFT"],
                                    ["Quote Valid For", "30 Days"],
                                    ["Currency", "ZAR (South African Rand)"],
                                    ["Total Due", `R${total.toFixed(2)}`],
                                  ].map(([k, v]) => (
                                    <div key={k} className="flex items-center justify-between px-5 py-3 text-sm">
                                      <span className="text-[#64748b]">{k}</span>
                                      <span className={`font-semibold ${k === "Total Due" ? "text-[#d97706]" : "text-[#1e293b]"}`}>{v}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Quote summary */}
                              <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-5 mb-5">
                                <h3 className="text-sm font-semibold text-[#374151] mb-4">Quote Summary</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
                                  <div>
                                    <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wide mb-2">Client</p>
                                    <p className="font-semibold text-[#1e293b]">{customerName}</p>
                                    <p className="text-[#64748b]">{customerEmail}</p>
                                    <p className="text-[#64748b]">{customerPhone}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wide mb-2">Property</p>
                                    <p className="font-semibold text-[#1e293b]">{propertyAddress}</p>
                                    <p className="text-[#64748b]">{siteType} · {siteSize} sqm · {powerRating}A · {urgencyLevel}</p>
                                  </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-[#e2e8f0] grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                                  {[
                                    ["Number", quoteNumber],
                                    ["Date", new Date().toLocaleDateString()],
                                    ["Type", documentType === "quote" ? "Quote" : "Invoice"],
                                    ["Status", "Pending"],
                                  ].map(([k, v]) => (
                                    <div key={k}>
                                      <div className="text-xs text-[#94a3b8] mb-0.5">{k}</div>
                                      <div className={`font-semibold ${k === "Status" ? "text-[#d97706]" : "text-[#1e293b]"}`}>{v}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {quoteId ? (
                                <button
                                  onClick={handleProcessPayment}
                                  className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-[#059669] hover:bg-[#047857] text-white rounded-xl font-medium transition-colors shadow-sm"
                                >
                                  <CreditCard className="w-4 h-4" />Process Payment
                                </button>
                              ) : (
                                <div className="flex items-center gap-2 px-4 py-3 bg-[#fef3c7] border border-[#fde68a] rounded-lg text-sm text-[#92400e]">
                                  <Receipt className="w-4 h-4 flex-shrink-0" />
                                  Save the {documentType} first to process payment
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* ── Step nav bar ────────────────────────────────── */}
                        <div className="px-6 py-4 bg-[#f8fafc] border-t border-[#e2e8f0] flex items-center justify-between">
                          <button
                            onClick={handlePrevious}
                            disabled={currentStep === 1}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                              currentStep === 1
                                ? "bg-[#f1f5f9] text-[#cbd5e1] cursor-not-allowed"
                                : "bg-white border border-[#e2e8f0] text-[#374151] hover:bg-[#f8fafc] shadow-sm"
                            }`}
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
                              className="flex items-center gap-1.5 px-4 py-2 bg-[#d97706] hover:bg-[#b45309] text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
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
                              Save {documentType === "quote" ? "Quote" : "Invoice"}
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* ── RIGHT: Live preview panel ──────────────────────────── */}
              <div className="hidden xl:flex w-[420px] flex-shrink-0 flex-col border-l border-[#e2e8f0] bg-[#e8eaed] overflow-hidden">
                {/* Panel header */}
                <div className="flex items-center justify-between px-4 py-3 bg-[#f8fafc] border-b border-[#e2e8f0] flex-shrink-0">
                  <TemplateSelector/>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handlePrint}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-[#e2e8f0] text-[#374151] text-xs font-medium rounded-lg hover:bg-[#f1f5f9] transition-colors"
                    >
                      <Printer className="w-3 h-3" />Print
                    </button>
                    <button
                      onClick={handleSavePDF}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-[#d97706] text-white text-xs font-medium rounded-lg hover:bg-[#b45309] transition-colors"
                    >
                      <Download className="w-3 h-3" />PDF
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
  );
};

export default ElectricalDashboard;
