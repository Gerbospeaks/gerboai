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
import AccountingSidebar from "./AccountingSidebar";
import ClientWorkspace from "./ClientWorkspace";
import ExpensesView from "./ExpensesView";
import CreditNotesView from "./CreditNotesView";
import { useLocation } from "react-router-dom";
import TemplateSelector, { TemplateRenderer } from "./TemplateSelector";
import PaymentProcessor from "../../components/dashboard/PaymentProcessor";
import { getFunctions, httpsCallable } from "firebase/functions";
import DebtorsAgeAnalysis from "./DebtorsAgeAnalysis";
import RecurringInvoices from "./RecurringInvoices";
import Templates from "./Templates";
import PurchaseOrders from "../PurchaseOrders";
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
import { Printer, Download, Sparkles } from "lucide-react";
import { db } from "../../firebase";
import CustomerModal from "../CustomerModal";
import CustomersListModal from "../CustomersListModal";
import HistoryView from "./HistoryView";
import NotesView from "./NotesView";
import AIInvoiceWindow from "../AIInvoiceWindow";
import { getDashboardActions } from "../../utils/dashboardActions";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Users,
  X,
  FileText,
  Plus,
  Send,
  Save,
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
  ArrowRight,
} from "lucide-react";

const generateInvoiceNumber = async (userId, documentType) => {
  const db = getFirestore();
  const year = new Date().getFullYear();
  const collectionName = documentType === "estimate" ? "estimates" : "invoices";
  const prefix = documentType === "estimate" ? "EST" : "INV";
  const invoicesRef = collection(db, "users", userId, collectionName);
  const q = query(invoicesRef, orderBy("createdAt", "desc"), limit(1));
  const snapshot = await getDocs(q);
  let lastNumber = 1000;
  if (!snapshot.empty) {
    const lastInvoice = snapshot.docs[0].data();
    const match = lastInvoice.invoiceNumber?.match(/(\d+)$/);
    if (match) lastNumber = Number(match[1]);
  }
  const nextNumber = lastNumber + 1;
  return `${prefix}-${year}-${String(nextNumber).padStart(4, "0")}`;
};

const functions = getFunctions();
const VIEW_TO_DOC_TYPE = {
  invoice: "invoice",
  quote: "estimate",
  estimate: "estimate",
  jobcard: "estimate",
};
const AccountingDashboard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPreview, setShowPreview] = useState(false);
  const totalSteps = 4;
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, authUser } = useAuth();
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceId, setInvoiceId] = useState(null);
  const [savedInvoices, setSavedInvoices] = useState([]);
  const [showInvoicesList, setShowInvoicesList] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAIWindow, setShowAIWindow] = useState(false);
  const [activeView, setActiveView] = useState("home");
  const handleQuickCreate = ({ view, action }) => {
    if (action === "newInvoice") {
      handleNewInvoice("invoice");
      setActiveView("invoice");
    }
    if (action === "newQuote") {
      handleNewInvoice("estimate");
      setActiveView("invoice");
    }
    if (action === "newCustomer") {
      handleAddNewCustomer();
    }
    if (view && !action) {
      setActiveView(view);
    }
  };
  const [savedCustomers, setSavedCustomers] = useState([]);
  const [showCustomersListModal, setShowCustomersListModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("professional");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [inputMode, setInputMode] = useState("manual");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] =
    useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [documentType, setDocumentType] = useState("invoice");
  const [aiWindowOpen, setAiWindowOpen] = useState(false);
  const [aiDocType, setAiDocType] = useState("invoice");
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
  const openAI = (activeView) => {
    setAiDocType(VIEW_TO_DOC_TYPE[activeView] || "invoice");
    setAiWindowOpen(true);
  };

  // Wire up the handlers getDashboardActions expects
  const actions = getDashboardActions({
    handleNewInvoice: () => openAI("invoice"),
    handleNewQuote: () => openAI("quote"),
    handleNewEstimate: () => openAI("estimate"),
    handleNewJobcard: () => openAI("jobcard"),
  });
  const location = useLocation();
  useEffect(() => {
    if (location.state?.activeView) setActiveView(location.state.activeView);
  }, [location.state]);

  // ── Design tokens (matching MechanicsDashboard) ───────────────────────────
  const inputCls =
    "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md bg-white text-[#1e293b] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-[#2563eb] transition-colors";
  const labelCls =
    "block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5";
  const selectCls =
    "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md bg-white text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-[#2563eb] transition-colors";

  const handleNext = () => {
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };
  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleRemoveItem = (index) =>
    setItems((prev) => prev.filter((_, i) => i !== index));

  const handleAIDataExtracted = (extractedData) => {
    // Customer / sender fields
    if (extractedData.customer?.name)
      setCustomerName(extractedData.customer.name);
    if (extractedData.customer?.email)
      setCustomerEmail(extractedData.customer.email);
    if (extractedData.customer?.phone)
      setCustomerPhone(extractedData.customer.phone);
    if (extractedData.customer?.address)
      setCustomerAddress(extractedData.customer.address);
    if (extractedData.customer?.tax_id) setTaxId(extractedData.customer.tax_id);

    // Bill-to fields
    if (extractedData.billTo?.name) setBillName(extractedData.billTo.name);
    if (extractedData.billTo?.email) setBillEmail(extractedData.billTo.email);
    if (extractedData.billTo?.phone) setBillPhone(extractedData.billTo.phone);
    if (extractedData.billTo?.address)
      setBillAddress(extractedData.billTo.address);

    // Line items — already formatted by AIInvoiceChat
    if (extractedData.items?.length > 0) setItems(extractedData.items);

    // Document type (invoice vs estimate)
    if (extractedData.documentType) setDocumentType(extractedData.documentType);
  };

  useEffect(() => {
    if (!user?.uid) return;
    const load = async () => {
      const n = await generateInvoiceNumber(user.uid, documentType);
      setInvoiceNumber(n);
    };
    load();
    loadSavedInvoices();
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

  const steps = [
    { number: 1, title: "Client Info", icon: Users },
    { number: 2, title: "Bill To", icon: Building },
    { number: 3, title: "Line Items", icon: FileText },
    { number: 4, title: "Payment", icon: CreditCard },
  ];

  const loadCustomers = async () => {
    try {
      const q = query(
        collection(db, "users", user.uid, "clients"),
        orderBy("createdAt", "desc"),
      );
      const snap = await getDocs(q);
      setCustomers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
    }
  };

  const handleProcessPayment = async () => {
    if (!invoiceId || !user?.uid) {
      alert("Please save the invoice before processing payment");
      return;
    }
    try {
      const col = documentType === "estimate" ? "estimates" : "invoices";
      const snap = await getDoc(doc(db, "users", user.uid, col, invoiceId));
      if (snap.exists()) {
        setSelectedInvoiceForPayment({ id: invoiceId, ...snap.data() });
        setShowPaymentModal(true);
      } else alert("Invoice not found. Please save first.");
    } catch (e) {
      alert("Failed to load invoice for payment");
    }
  };

  const loadPaymentStatus = async () => {
    if (!user?.uid || !invoiceId) {
      setPaymentStatus({ totalPaid: 0, balanceDue: total, status: "pending" });
      return;
    }
    try {
      const col = documentType === "estimate" ? "estimates" : "invoices";
      const snap = await getDoc(doc(db, "users", user.uid, col, invoiceId));
      if (snap.exists()) {
        const d = snap.data();
        setPaymentStatus({
          totalPaid: d.totals?.paid || 0,
          balanceDue: d.totals?.due || d.totals?.total || 0,
          status: d.status || "pending",
        });
      } else
        setPaymentStatus({
          totalPaid: 0,
          balanceDue: total,
          status: "pending",
        });
    } catch (e) {
      setPaymentStatus({ totalPaid: 0, balanceDue: total, status: "pending" });
    }
  };

  const handlePaymentComplete = () => {
    loadSavedInvoices();
    loadPaymentStatus();
    setShowPaymentModal(false);
  };

  const loadSavedInvoices = async () => {
    if (!user?.uid) return;
    const db = getFirestore();
    const col = documentType === "estimate" ? "estimates" : "invoices";
    const q = query(
      collection(db, "users", user.uid, col),
      orderBy("createdAt", "desc"),
      limit(50),
    );
    const snap = await getDocs(q);
    setSavedInvoices(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  const handleAddNewCustomer = () => {
    setSelectedCustomer(null);
    setShowCustomerModal(true);
  };
  const handleEditCustomer = (c) => {
    setSelectedCustomer(c);
    setShowCustomerModal(true);
  };

  const loadCustomer = (c) => {
    setCustomerName(c.name || "");
    setCustomerEmail(c.email || "");
    setCustomerPhone(c.phone || "");
    setCustomerAddress(c.address || "");
    setTaxId(c.tax_id || "");
    setBillName(c.name || "");
    setBillEmail(c.email || "");
    setBillPhone(c.phone || "");
    setBillAddress(c.address || "");
  };

  useEffect(() => {
    loadCustomers();
  }, []);
  useEffect(() => {
    loadPaymentStatus();
  }, [invoiceId, user?.uid, documentType]);

  const loadInvoice = (invoice) => {
    setInvoiceId(invoice.id);
    setInvoiceNumber(invoice.invoiceNumber || "");
    setCustomerName(invoice.customer?.name || "");
    setCustomerEmail(invoice.customer?.email || "");
    setCustomerPhone(invoice.customer?.phone || "");
    setCustomerAddress(invoice.customer?.address || "");
    setTaxId(invoice.customer?.tax_id || "");
    setItems(invoice.items || []);
    setShowInvoicesList(false);
    setPaymentStatus({
      totalPaid: invoice.totals?.paid || 0,
      balanceDue: invoice.totals?.due || invoice.totals?.total || 0,
      status: invoice.status || "pending",
    });
  };

  const loadInvoiceForExport = async () => {
    if (!user?.uid || !invoiceId) return null;
    const db = getFirestore();
    const col = documentType === "estimate" ? "estimates" : "invoices";
    const snap = await getDoc(doc(db, "users", user.uid, col, invoiceId));
    return snap.exists() ? snap.data() : null;
  };

  const printStyles = `@media print { * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } html,body { margin:0!important;padding:0!important;width:210mm!important;background:white!important; } body * { visibility:hidden!important; } #print-area,#print-area * { visibility:visible!important; } #print-area { display:block!important;position:absolute!important;left:0!important;top:0!important;width:210mm!important;min-height:297mm!important;margin:0!important;padding:0!important;background:white!important; } @page { size:A4 portrait;margin:40px!important; } }`;

  const handlePrint = () => {
    const s = document.createElement("style");
    s.textContent = printStyles;
    document.head.appendChild(s);
    window.print();
    setTimeout(() => document.head.removeChild(s), 1000);
  };

  const handleSavePDF = async () => {
    const saved = await loadInvoiceForExport();
    if (!saved) {
      alert(`Please save the ${documentType} before exporting PDF`);
      return;
    }
    setInvoiceNumber(saved.invoiceNumber);
    setItems(saved.items);
    setCustomerName(saved.customer.name);
    setCustomerEmail(saved.customer.email);
    setCustomerPhone(saved.customer.phone);
    setCustomerAddress(saved.customer.address);
    setTimeout(() => window.print(), 300);
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
        category: newItem.category || "Service",
        rate,
        qty,
        amount,
        taxRate,
        taxAmount,
        totalAmount: amount + taxAmount,
      },
    ]);
    setNewItem({
      description: "",
      rate: "",
      qty: "",
      category: "Service",
      taxRate: "15",
    });
  };

  // ── State ─────────────────────────────────────────────────────────────────
  const [customerName, setCustomerName] = useState("ABC Corporation");
  const [taxId, setTaxId] = useState("TAX-123-456-789");
  const [customerEmail, setCustomerEmail] = useState("contact@abccorp.com");
  const [customerPhone, setCustomerPhone] = useState("+27 11 123 4567");
  const [customerAddress, setCustomerAddress] = useState(
    "123 Business Park, Sandton, Johannesburg, 2196",
  );
  const [billName, setBillName] = useState("ABC Corporation");
  const [billEmail, setBillEmail] = useState("billing@abccorp.com");
  const [billPhone, setBillPhone] = useState("+27 11 123 4567");
  const [billAddress, setBillAddress] = useState(
    "123 Business Park, Sandton, Johannesburg, 2196",
  );
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({
    description: "",
    rate: "",
    qty: "",
    category: "Service",
    taxRate: "15",
  });
  const [businessInfo, setBusinessInfo] = useState({
    businessName: "PROFESSIONAL ACCOUNTING SERVICES",
    addressLine1: "456 Financial Plaza",
    addressLine2: "Rosebank",
    city: "Johannesburg",
    postalCode: "2196",
    primaryPhone: "+27 11 555 0001",
    secondaryPhone: "+27 11 555 0002",
    email: "info@proaccounting.co.za",
    website: "www.proaccounting.co.za",
    registrationNumber: "2024/123456/07",
    vatNumber: "4123456789",
    logoUrl: "",
  });
  const [loading, setLoading] = useState(true);

  const subtotal = items.reduce((s, i) => s + i.amount, 0);
  const totalTax = items.reduce((s, i) => s + i.taxAmount, 0);
  const total = subtotal + totalTax;

  useEffect(() => {
    if (!invoiceId)
      setPaymentStatus({ totalPaid: 0, balanceDue: total, status: "pending" });
  }, [total, invoiceId]);

  useEffect(() => {
    if (user?.uid) loadBusinessInfo();
  }, [user]);

  useEffect(() => {
    const fetch = async () => {
      if (!user?.uid) return;
      try {
        const db = getFirestore();
        const snap = await getDoc(
          doc(db, "users", user.uid, "settings", "businessInfo"),
        );
        if (snap.exists()) setBusinessInfo(snap.data());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user]);

  const loadBusinessInfo = async () => {
    if (!user?.uid) return;
    try {
      const db = getFirestore();
      const snap = await getDoc(
        doc(db, "users", user.uid, "settings", "businessInfo"),
      );
      if (snap.exists()) {
        const d = snap.data();
        setBusinessInfo(d);
        if (d.stampSettings) setStampSettings(d.stampSettings);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const buildInvoicePayload = (numberToUse) => ({
    invoiceNumber: numberToUse,
    locked: true,
    status: "pending",
    documentType,
    dates: {
      invoiceDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    customer: {
      name: customerName,
      email: customerEmail,
      phone: customerPhone,
      address: customerAddress,
      tax_id: taxId,
    },
    items,
    totals: { subtotal, tax: totalTax, total, paid: 0, due: total },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const handleSaveInvoice = async () => {
    if (!user?.uid) return;
    const db = getFirestore();
    let numberToUse = invoiceNumber;
    if (!invoiceId) {
      numberToUse = await generateInvoiceNumber(user.uid, documentType);
      setInvoiceNumber(numberToUse);
    }
    const data = buildInvoicePayload(numberToUse);
    const col = documentType === "estimate" ? "estimates" : "invoices";
    if (invoiceId) {
      await updateDoc(doc(db, "users", user.uid, col, invoiceId), {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } else {
      const ref = await addDoc(collection(db, "users", user.uid, col), data);
      setInvoiceId(ref.id);
    }
    alert(
      `${documentType === "estimate" ? "Estimate" : "Invoice"} saved successfully`,
    );
    loadSavedInvoices();
  };

  const handleConvertToInvoice = async () => {
    if (!user?.uid || !invoiceId) {
      alert("Please save the estimate first");
      return;
    }
    if (!window.confirm("Convert this estimate to an invoice?")) return;
    try {
      const db = getFirestore();
      const newNumber = await generateInvoiceNumber(user.uid, "invoice");
      const data = buildInvoicePayload(newNumber);
      data.documentType = "invoice";
      data.convertedFromEstimate = invoiceId;
      data.convertedFromEstimateNumber = invoiceNumber;
      data.convertedAt = serverTimestamp();
      const ref = await addDoc(
        collection(db, "users", user.uid, "invoices"),
        data,
      );
      await updateDoc(doc(db, "users", user.uid, "estimates", invoiceId), {
        convertedToInvoice: true,
        convertedToInvoiceId: ref.id,
        convertedToInvoiceNumber: newNumber,
        convertedAt: serverTimestamp(),
        status: "converted",
      });
      setDocumentType("invoice");
      setInvoiceId(ref.id);
      setInvoiceNumber(newNumber);
      alert(`Converted to Invoice ${newNumber}`);
      loadSavedInvoices();
    } catch (e) {
      alert("Failed to convert");
    }
  };

  const handleNewEstimate = () => {
    setDocumentType("estimate");
    handleNewInvoice();
  };
  const handleNewInvoiceDoc = () => {
    setDocumentType("invoice");
    handleNewInvoice();
  };
  const handleNewInvoice = (type = documentType) => {
    setDocumentType(type); // update state for UI
    setInvoiceId(null);
    setInvoiceNumber("");
    setCustomerName("ABC Corporation");
    setTaxId("TAX-123-456-789");
    setCustomerEmail("contact@abccorp.com");
    setCustomerPhone("+27 11 123 4567");
    setCustomerAddress("123 Business Park, Sandton, Johannesburg, 2196");
    setItems([]);
    setCurrentStep(1);
    const load = async () => {
      if (user?.uid) {
        const n = await generateInvoiceNumber(user.uid, type); // ← uses the param, not stale state
        setInvoiceNumber(n);
      }
    };
    load();
  };

  const handleLogout = async () => {
    try {
      await signOut(getAuth());
    } catch (e) {
      console.error(e);
    }
  };

  // ── Shared template props ─────────────────────────────────────────────────
  const templateProps = {
    templateId: selectedTemplate,
    businessInfo,
    loading,
    invoiceNumber,
    customerName,
    billName,
    billEmail,
    billPhone,
    billAddress,
    customerEmail,
    customerPhone,
    customerAddress,
    taxId,
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
    documentType === "estimate" &&
      invoiceId && {
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
      onClick:
        documentType === "estimate" ? handleNewEstimate : handleNewInvoiceDoc,
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
      onClick: handleSaveInvoice,
      className:
        "flex items-center gap-1.5 px-3 py-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium rounded-md transition-colors whitespace-nowrap",
    },
  ].filter(Boolean);

  const mobileDashboardActions = [
    {
      label: "Save",
      icon: Save,
      onClick: handleSaveInvoice,
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
          industry="accounting"
          onNavigateTo={(view) => {
            setAiWindowOpen(false);
            setActiveView(view);
          }}
          TemplateRenderer={TemplateRenderer}
        />
      )}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Sidebar */}
        <AccountingSidebar
          user={user}
          activeView={activeView}
          setActiveView={setActiveView}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          setShowSettings={setShowSettings}
          handleNewInvoice={handleNewInvoiceDoc}
          handleNewQuote={handleNewEstimate}
          handleNewEstimate={handleNewEstimate}
          handleNewInvoiceDoc={handleNewInvoiceDoc}
          businessInfo={businessInfo}
          savedInvoices={savedInvoices}
          savedQuotes={savedInvoices}
          savedCustomers={customers}
          handleLogout={handleLogout}
          setShowInvoicesList={setShowInvoicesList}
          setShowCustomersListModal={setShowCustomersListModal}
          handleAddNewCustomer={handleAddNewCustomer}
        />

        {/* Main content */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          <AppHeader
            actions={headerActions}
            mobileActions={mobileDashboardActions}
            dashboardType="accounting"
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            onQuickCreate={handleQuickCreate}
            onSettingsOpen={() => setShowSettings(true)}
            plan="pro"
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
            onEditCustomer={handleEditCustomer}
            onAddNewCustomer={handleAddNewCustomer}
          />
          <CustomerModal
            showModal={showCustomerModal}
            setShowModal={setShowCustomerModal}
            existingCustomer={selectedCustomer}
            onCustomerSaved={loadCustomers}
          />
          {showPaymentModal && selectedInvoiceForPayment && (
            <PaymentProcessor
              showModal={showPaymentModal}
              setShowModal={setShowPaymentModal}
              invoice={selectedInvoiceForPayment}
              onPaymentComplete={handlePaymentComplete}
              user={user}
              businessInfo={businessInfo}
            />
          )}

          {/* Invoices list modal */}
          {showInvoicesList && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden border border-[#e2e8f0]">
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0] bg-[#f8fafc]">
                  <div>
                    <h2 className="text-base font-semibold text-[#1e293b]">
                      All{" "}
                      {documentType === "estimate" ? "Estimates" : "Invoices"}
                    </h2>
                    <p className="text-xs text-[#64748b] mt-0.5">
                      {savedInvoices.length} records
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
                  {savedInvoices.length === 0 ? (
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
                            "Total",
                            "Paid",
                            "Status",
                            "",
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
                        {savedInvoices.map((inv) => (
                          <tr
                            key={inv.id}
                            onClick={() => loadInvoice(inv)}
                            className="border-b border-[#f1f5f9] hover:bg-[#f8fafc] cursor-pointer transition-colors"
                          >
                            <td className="px-5 py-3 text-sm font-semibold text-[#2563eb]">
                              {inv.invoiceNumber || "N/A"}
                            </td>
                            <td className="px-5 py-3 text-sm text-[#374151]">
                              {inv.customer?.name || "N/A"}
                            </td>
                            <td className="px-5 py-3 text-sm font-semibold text-[#1e293b]">
                              R{inv.totals?.total?.toFixed(2) || "0.00"}
                            </td>
                            <td className="px-5 py-3 text-sm text-[#059669] font-medium">
                              R{inv.totals?.paid?.toFixed(2) || "0.00"}
                            </td>
                            <td className="px-5 py-3">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${statusBadge(inv.status)}`}
                              >
                                {inv.status === "partially_paid"
                                  ? "Partial"
                                  : inv.status || "Pending"}
                              </span>
                            </td>
                            <td
                              className="px-5 py-3"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={() => {
                                  setShowInvoicesList(false);
                                  setActiveView("credit-notes");
                                  // Pass the invoice as context so CreditNotesView can pre-fill it
                                  setTimeout(() => {
                                    window.__creditNoteSource = inv;
                                  }, 50);
                                }}
                                className="flex items-center gap-1 px-2.5 py-1 bg-[#fef2f2] hover:bg-[#fee2e2] text-[#dc2626] text-xs font-medium rounded-lg transition-colors"
                              >
                                <FileText className="w-3 h-3" />
                                Credit note
                              </button>
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

          {/* Fullscreen preview modal */}
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
                        {documentType === "estimate" ? "Estimate" : "Invoice"}{" "}
                        Preview
                      </h2>
                      <p className="text-xs text-[#64748b]">
                        {invoiceNumber || "Draft"}
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
          {activeView === "expenses" && (
            <div className="flex-1 overflow-y-auto p-4">
              <ExpensesView user={user} />
            </div>
          )}
          {activeView === "credit-notes" && (
            <div className="flex-1 overflow-y-auto p-6">
              <CreditNotesView user={user} />
            </div>
          )}
          {activeView === "templates" && (
            <div className="flex-1 overflow-y-auto p-4">
              <Templates user={user} />
            </div>
          )}
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
          {(activeView === "chart-of-accounts" ||
            activeView === "bank-accounts" ||
            activeView === "transactions" ||
            activeView === "reconciliation" ||
            activeView === "report-pnl" ||
            activeView === "report-balance" ||
            activeView === "report-cashflow" ||
            activeView === "report-tax" ||
            activeView === "payroll") && (
            <ClientWorkspace user={user} defaultView={activeView} />
          )}
          {activeView === "debtors-age" && (
            <div className="flex-1 overflow-y-auto p-6">
              <DebtorsAgeAnalysis user={user} />
            </div>
          )}
          {activeView === "recurring" && (
            <div className="flex-1 overflow-y-auto p-6">
              <RecurringInvoices user={user} />
            </div>
          )}
          {activeView === "purchase-orders" && (
            <div className="flex-1 overflow-y-auto p-6">
              <PurchaseOrders user={user} />
            </div>
          )}
          {/* ── Invoice view — split layout ─────────────────────────────────── */}
          {activeView === "invoice" && (
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
                  {invoiceId && (
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
                            ? "Invoice Fully Paid"
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

                  {/* Main form card */}
                  <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
                    {/* Input mode tabs */}
                    <div className="flex border-b border-[#e2e8f0] bg-[#f8fafc]">
                      <button
                        onClick={() => setInputMode("manual")}
                        className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all border-b-2 -mb-px ${inputMode === "manual" ? "border-[#2563eb] text-[#2563eb] bg-white" : "border-transparent text-[#64748b] hover:text-[#374151]"}`}
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
                                    Enter client details for this invoice
                                  </p>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[
                                  {
                                    label: "Company Name",
                                    value: customerName,
                                    set: setCustomerName,
                                    placeholder: "ABC Corporation",
                                    required: true,
                                  },
                                  {
                                    label: "Tax ID",
                                    value: taxId,
                                    set: setTaxId,
                                    placeholder: "TAX-123-456-789",
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
                                    placeholder: "+27 11 123 4567",
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
                                    Address{" "}
                                    <span className="text-[#dc2626] normal-case tracking-normal font-normal">
                                      *
                                    </span>
                                  </label>
                                  <input
                                    type="text"
                                    value={customerAddress}
                                    onChange={(e) =>
                                      setCustomerAddress(e.target.value)
                                    }
                                    placeholder="123 Business Park, Sandton, Johannesburg"
                                    className={inputCls}
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Step 2 – Bill To */}
                          {currentStep === 2 && (
                            <div>
                              <div className="flex items-center gap-3 mb-5">
                                <div className="w-9 h-9 bg-[#f0fdf4] rounded-lg flex items-center justify-center">
                                  <Building className="w-5 h-5 text-[#059669]" />
                                </div>
                                <div>
                                  <h2 className="text-base font-semibold text-[#1e293b]">
                                    Billing Details
                                  </h2>
                                  <p className="text-xs text-[#64748b]">
                                    Billing contact (may differ from client)
                                  </p>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[
                                  {
                                    label: "Billing Name",
                                    value: billName,
                                    set: setBillName,
                                    placeholder: "Billing contact name",
                                    required: true,
                                  },
                                  {
                                    label: "Email",
                                    value: billEmail,
                                    set: setBillEmail,
                                    type: "email",
                                    placeholder: "billing@example.com",
                                  },
                                  {
                                    label: "Phone",
                                    value: billPhone,
                                    set: setBillPhone,
                                    type: "tel",
                                    placeholder: "+27 11 123 4567",
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
                                    Billing Address
                                  </label>
                                  <input
                                    type="text"
                                    value={billAddress}
                                    onChange={(e) =>
                                      setBillAddress(e.target.value)
                                    }
                                    placeholder="Billing address if different"
                                    className={inputCls}
                                  />
                                </div>
                              </div>
                              <div className="mt-4 p-3.5 bg-[#eff6ff] border border-[#bfdbfe] rounded-lg">
                                <button
                                  onClick={() => {
                                    setBillName(customerName);
                                    setBillEmail(customerEmail);
                                    setBillPhone(customerPhone);
                                    setBillAddress(customerAddress);
                                  }}
                                  className="flex items-center gap-2 text-[#2563eb] hover:text-[#1d4ed8] text-sm font-medium transition-colors"
                                >
                                  <Users className="w-4 h-4" />
                                  Copy from Client Information
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Step 3 – Line Items */}
                          {currentStep === 3 && (
                            <div>
                              <div className="flex items-center gap-3 mb-5">
                                <div className="w-9 h-9 bg-[#faf5ff] rounded-lg flex items-center justify-center">
                                  <FileText className="w-5 h-5 text-[#7c3aed]" />
                                </div>
                                <div>
                                  <h2 className="text-base font-semibold text-[#1e293b]">
                                    Line Items
                                  </h2>
                                  <p className="text-xs text-[#64748b]">
                                    Add services or products to the invoice
                                  </p>
                                </div>
                              </div>

                              {/* Add item form */}
                              <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-5 mb-5">
                                <h3 className="text-sm font-semibold text-[#374151] mb-4 flex items-center gap-2">
                                  <Plus className="w-4 h-4 text-[#2563eb]" />
                                  Add New Item
                                </h3>
                                <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                                  <div className="sm:col-span-2">
                                    <label className={labelCls}>
                                      Description
                                    </label>
                                    <input
                                      type="text"
                                      placeholder="Service / Product"
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
                                    <label className={labelCls}>Category</label>
                                    <select
                                      value={newItem.category}
                                      onChange={(e) =>
                                        setNewItem({
                                          ...newItem,
                                          category: e.target.value,
                                        })
                                      }
                                      className={selectCls}
                                    >
                                      <option>Service</option>
                                      <option>Product</option>
                                      <option>Consulting</option>
                                      <option>Other</option>
                                    </select>
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
                                    <label className={labelCls}>Qty</label>
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
                                    <label className={labelCls}>Tax %</label>
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
                                </div>
                                <button
                                  onClick={handleAddItem}
                                  className="mt-3 flex items-center gap-1.5 px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium rounded-md transition-colors"
                                >
                                  <Plus className="w-4 h-4" />
                                  Add Item
                                </button>
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
                                            "Description",
                                            "Category",
                                            "Rate",
                                            "Qty",
                                            "Tax",
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
                                        {items.map((item, i) => (
                                          <tr
                                            key={i}
                                            className="border-b border-[#f1f5f9] hover:bg-[#f8fafc] transition-colors"
                                          >
                                            <td className="px-4 py-3 text-sm font-medium text-[#374151]">
                                              {item.description}
                                            </td>
                                            <td className="px-4 py-3">
                                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-[#eff6ff] text-[#1d4ed8]">
                                                {item.category}
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
                                                  handleRemoveItem(i)
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
                                        <span>VAT (15%)</span>
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
                                  <FileText className="w-8 h-8 text-[#cbd5e1] mx-auto mb-3" />
                                  <p className="text-sm font-medium text-[#94a3b8]">
                                    No items added yet
                                  </p>
                                  <p className="text-xs text-[#cbd5e1] mt-1">
                                    Use the form above to add services or
                                    products
                                  </p>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Step 4 – Payment Terms */}
                          {currentStep === 4 && (
                            <div>
                              <div className="flex items-center gap-3 mb-5">
                                <div className="w-9 h-9 bg-[#f0fdf4] rounded-lg flex items-center justify-center">
                                  <CreditCard className="w-5 h-5 text-[#059669]" />
                                </div>
                                <div>
                                  <h2 className="text-base font-semibold text-[#1e293b]">
                                    Payment Terms
                                  </h2>
                                  <p className="text-xs text-[#64748b]">
                                    Review and process payment
                                  </p>
                                </div>
                              </div>

                              {/* Invoice summary cards */}
                              <div className="grid grid-cols-3 gap-3 mb-5">
                                {[
                                  {
                                    label: "Invoice Total",
                                    value: `R${total.toFixed(2)}`,
                                    icon: DollarSign,
                                    bg: "bg-[#eff6ff]",
                                    color: "text-[#2563eb]",
                                  },
                                  {
                                    label: "Items",
                                    value: items.length,
                                    icon: ClipboardList,
                                    bg: "bg-[#f0fdf4]",
                                    color: "text-[#059669]",
                                  },
                                  {
                                    label: "Tax Amount",
                                    value: `R${totalTax.toFixed(2)}`,
                                    icon: Receipt,
                                    bg: "bg-[#faf5ff]",
                                    color: "text-[#7c3aed]",
                                  },
                                ].map(
                                  ({ label, value, icon: Icon, bg, color }) => (
                                    <div
                                      key={label}
                                      className={`${bg} border border-[#e2e8f0] rounded-xl p-4`}
                                    >
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-semibold text-[#64748b]">
                                          {label}
                                        </span>
                                        <Icon className={`w-4 h-4 ${color}`} />
                                      </div>
                                      <div
                                        className={`text-xl font-bold ${color}`}
                                      >
                                        {value}
                                      </div>
                                    </div>
                                  ),
                                )}
                              </div>

                              <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden shadow-sm mb-5">
                                <div className="px-5 py-3.5 border-b border-[#e2e8f0] bg-[#f8fafc]">
                                  <span className="text-sm font-semibold text-[#374151]">
                                    Payment Information
                                  </span>
                                </div>
                                <div className="divide-y divide-[#f1f5f9]">
                                  {[
                                    ["Payment Due", "Net 30 Days"],
                                    [
                                      "Payment Methods",
                                      "Bank Transfer, Card, Cash",
                                    ],
                                    ["Late Payment Fee", "2% per month"],
                                    ["Currency", "ZAR (South African Rand)"],
                                    ["Total Due", `R${total.toFixed(2)}`],
                                  ].map(([k, v]) => (
                                    <div
                                      key={k}
                                      className="flex items-center justify-between px-5 py-3 text-sm"
                                    >
                                      <span className="text-[#64748b]">
                                        {k}
                                      </span>
                                      <span
                                        className={`font-semibold ${k === "Total Due" ? "text-[#2563eb]" : "text-[#1e293b]"}`}
                                      >
                                        {v}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {invoiceId && (
                                <button
                                  onClick={handleProcessPayment}
                                  className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-[#059669] hover:bg-[#047857] text-white rounded-xl font-medium transition-colors shadow-sm"
                                >
                                  <CreditCard className="w-4 h-4" />
                                  Process Payment
                                </button>
                              )}
                              {!invoiceId && (
                                <div className="flex items-center gap-2 px-4 py-3 bg-[#fff7ed] border border-[#fed7aa] rounded-lg text-sm text-[#9a3412]">
                                  <Receipt className="w-4 h-4 flex-shrink-0" />
                                  Save the invoice first to process payment
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
                              onClick={handleSaveInvoice}
                              className="flex items-center gap-1.5 px-4 py-2 bg-[#059669] hover:bg-[#047857] text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                            >
                              <Save className="w-4 h-4" />
                              Save{" "}
                              {documentType === "estimate"
                                ? "Estimate"
                                : "Invoice"}
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
                  <div className="flex items-center gap-2">
                    {/* Document type badge — reads from documentType state */}
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide ${
                        documentType === "estimate"
                          ? "bg-[#faf5ff] text-[#7c3aed] border border-[#e9d5ff]"
                          : "bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe]"
                      }`}
                    >
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      {documentType === "estimate"
                        ? "Estimate Preview"
                        : "Invoice Preview"}
                    </span>
                    {invoiceNumber && (
                      <span className="text-xs text-[#94a3b8] font-mono">
                        {invoiceNumber}
                      </span>
                    )}
                  </div>
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

export default AccountingDashboard;
