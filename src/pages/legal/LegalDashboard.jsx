import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import HomeView from "../HomeView";
import BusinessSettingsModal from "../BusinessSettingsModal";
import AppHeader from "../AppHeader";
import { serverTimestamp } from "firebase/firestore";
import logo from "../../assets/img/solidflo-logo.png";
import { getAuth, signOut } from "firebase/auth";
import FinancialOverview from "../FinancialOverview";
import Templates from "./Templates";
import { useLocation } from "react-router-dom";
import AIInvoiceExtractor from "../AIInvoiceExtractor";
import TemplateSelector, { TemplateRenderer } from "./TemplateSelector";
import LegalMultiStepForm from "./LegalMultiStepForm";
import uploadLogoToR2 from "../../utils/uploadLogoToR2";
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
import { Printer, Download } from "lucide-react";
import { db } from "../../firebase";
import CustomerModal from "../CustomerModal";
import CustomersListModal from "../CustomersListModal";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Home,
  Settings,
  Users,
  Sparkles,
  Calendar,
  FileText,
  DollarSign,
  Save,
  X,
  FileBarChart,
  Plus,
  Send,
  LogOut,
  CheckSquare,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Receipt,
  Wallet,
  Scale,
  Eye,
  BookOpen,
  FolderOpen,
  ArrowRight,
} from "lucide-react";

// ─── Number generator ─────────────────────────────────────────────────────────
const generateInvoiceNumber = async (userId, documentType = "invoice") => {
  const db = getFirestore();
  const year = new Date().getFullYear();
  const collectionName = documentType === "estimate" ? "estimates" : "invoices";
  const prefix = documentType === "estimate" ? "EST" : "INV";
  const invoicesRef = collection(db, "users", userId, collectionName);
  const q = query(invoicesRef, orderBy("createdAt", "desc"), limit(1));
  const snapshot = await getDocs(q);
  let lastNumber = 1000;
  if (!snapshot.empty) {
    const match = snapshot.docs[0].data().invoiceNumber?.match(/(\d+)$/);
    if (match) lastNumber = Number(match[1]);
  }
  return `${prefix}-${year}-${String(lastNumber + 1).padStart(4, "0")}`;
};

const functions = getFunctions();

// ─── Design tokens ────────────────────────────────────────────────────────────
const inputCls =
  "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md bg-white text-[#1e293b] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-[#7c3aed] transition-colors";
const labelCls =
  "block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5";
const selectCls =
  "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md bg-white text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-[#7c3aed] transition-colors";

const LegalDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [inputMode, setInputMode] = useState("manual");
  const [documentType, setDocumentType] = useState("invoice");
  const [activeView, setActiveView] = useState("home");
  const { user, authUser } = useAuth();

  // Doc numbers & IDs
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceId, setInvoiceId] = useState(null);

  // Lists
  const [savedInvoices, setSavedInvoices] = useState([]);
  const [savedCustomers, setSavedCustomers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [invoices, setInvoices] = useState([]);

  // Modals
  const [showSettings, setShowSettings] = useState(false);
  const [showCustomersListModal, setShowCustomersListModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showInvoicesList, setShowInvoicesList] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showAllInvoices, setShowAllInvoices] = useState(false);

  // Sidebar accordions
  const [isCasesOpen, setIsCasesOpen] = useState(false);
  const [isClientsOpen, setIsClientsOpen] = useState(false);

  // Misc
  const [selectedTemplate, setSelectedTemplate] = useState("professional");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);

  const [stampSettings] = useState({
    text: "APPROVED",
    color: "#d32f2f",
    showDate: false,
    enabled: false,
  });

  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalEstimates: 0,
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

  // ── Client fields ────────────────────────────────────────────────────────
  const [clientName, setClientName] = useState("John Smith");
  const [clientId, setClientId] = useState("CLIENT-2026-1234");
  const [clientEmail, setClientEmail] = useState("john.smith@example.com");
  const [clientPhone, setClientPhone] = useState("082 123 4567");
  const [clientAddress, setClientAddress] = useState(
    "123 Legal Street, Cape Town, 8001",
  );

  // ── Case fields ──────────────────────────────────────────────────────────
  const [caseType, setCaseType] = useState("Commercial Litigation");
  const [caseNumber, setCaseNumber] = useState("CASE-2026-001");
  const [matterDescription, setMatterDescription] = useState(
    "Contract dispute regarding service agreement",
  );

  // ── Items ────────────────────────────────────────────────────────────────
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({
    description: "",
    rate: "",
    hours: "",
    type: "Legal Services",
  });

  // ── Business info ────────────────────────────────────────────────────────
  const [businessInfo, setBusinessInfo] = useState({
    businessName: "SMITH & ASSOCIATES ATTORNEYS",
    addressLine1: "15 LEGAL AVENUE",
    addressLine2: "CAPE TOWN CBD",
    city: "CAPE TOWN",
    postalCode: "8001",
    primaryPhone: "021 123 4567",
    secondaryPhone: "021 123 4568",
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
    generateInvoiceNumber(user.uid, documentType).then(setInvoiceNumber);
    loadSavedInvoices();
  }, [user, documentType]);

  useEffect(() => {
    if (user?.uid) {
      loadBusinessInfo();
      loadCustomers();
      fetchBusinessStats();
    }
  }, [user]);

  useEffect(() => {
    if (!invoiceId)
      setPaymentStatus({ totalPaid: 0, balanceDue: total, status: "pending" });
  }, [total, invoiceId]);

  // ── Data loaders ──────────────────────────────────────────────────────────
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
        totalInvoiced += parseFloat(d.totals?.total || 0);
        if (["pending", "unpaid", "partially_paid"].includes(d.status))
          pendingPayments += parseFloat(d.totals?.due || d.totals?.total || 0);
        invoicesList.push({ id: doc.id, ...d });
      });
      invoicesList.sort(
        (a, b) =>
          new Date(b.dates?.invoiceDate || 0) -
          new Date(a.dates?.invoiceDate || 0),
      );
      setInvoices(invoicesList);

      let estimateCount = 0,
        clientCount = 0;
      try {
        estimateCount = (
          await getDocs(collection(db, "users", user.uid, "estimates"))
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
        totalEstimates: estimateCount,
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

  const loadSavedInvoices = async () => {
    if (!user?.uid) return;
    const db = getFirestore();
    const snap = await getDocs(
      query(
        collection(db, "users", user.uid, "invoices"),
        orderBy("createdAt", "desc"),
        limit(50),
      ),
    );
    setSavedInvoices(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
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
    setClientName(c.name || "");
    setClientEmail(c.email || "");
    setClientPhone(c.phone || "");
    setClientAddress(c.address || "");
    setClientId(c.customerId || "");
  };

  // ── Invoice loader ────────────────────────────────────────────────────────
  const loadInvoice = (inv) => {
    setInvoiceId(inv.id);
    setInvoiceNumber(inv.invoiceNumber || "");
    setClientName(inv.client?.name || "");
    setClientEmail(inv.client?.email || "");
    setClientPhone(inv.client?.phone || "");
    setClientAddress(inv.client?.address || "");
    setClientId(inv.client?.clientId || "");
    setCaseType(inv.case?.type || "");
    setCaseNumber(inv.case?.caseNumber || "");
    setMatterDescription(inv.case?.matterDescription || "");
    setItems(inv.items || []);
    setPaymentStatus({
      totalPaid: inv.totals?.paid || 0,
      balanceDue: inv.totals?.due || inv.totals?.total || 0,
      status: inv.status || "pending",
    });
    setShowInvoicesList(false);
    setShowAllInvoices(false);
    setActiveView("invoice");
  };

  // ── AI extractor ──────────────────────────────────────────────────────────
  const handleAIDataExtracted = (data) => {
    if (data.client.name) setClientName(data.client.name);
    if (data.client.email) setClientEmail(data.client.email);
    if (data.client.phone) setClientPhone(data.client.phone);
    if (data.client.address) setClientAddress(data.client.address);
    if (data.client.clientId) setClientId(data.client.clientId);
    if (data.case.type) setCaseType(data.case.type);
    if (data.case.caseNumber) setCaseNumber(data.case.caseNumber);
    if (data.case.matterDescription)
      setMatterDescription(data.case.matterDescription);
    if (data.items?.length > 0) setItems(data.items);
    alert("✅ Legal invoice data extracted and populated successfully!");
  };

  // ── Item handler ──────────────────────────────────────────────────────────
  const handleAddItem = () => {
    if (!newItem.description || !newItem.hours) return;
    const rate = Number(newItem.rate) || 0;
    const hours = Number(newItem.hours);
    setItems((prev) => [
      ...prev,
      {
        description: newItem.description,
        type: newItem.type || "Legal Services",
        rate,
        hours,
        qty: hours,
        amount: rate * hours,
      },
    ]);
    setNewItem({
      description: "",
      rate: "",
      hours: "",
      type: "Legal Services",
    });
  };

  const handleRemoveItem = (index) =>
    setItems((prev) => prev.filter((_, i) => i !== index));

  // ── Payload builder ───────────────────────────────────────────────────────
  const buildPayload = (numberToUse) => ({
    invoiceNumber: numberToUse,
    locked: true,
    status: "pending",
    documentType,
    dates: {
      invoiceDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    client: {
      name: clientName,
      email: clientEmail,
      phone: clientPhone,
      address: clientAddress,
      clientId,
    },
    case: { type: caseType, caseNumber, matterDescription },
    items,
    totals: { subtotal, vat, total, paid: 0, due: total },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // ── Save handler ──────────────────────────────────────────────────────────
  const handleSaveInvoice = async () => {
    if (!user?.uid) return;
    const db = getFirestore();
    let numberToUse = invoiceNumber;
    if (!invoiceId) {
      numberToUse = await generateInvoiceNumber(user.uid, documentType);
      setInvoiceNumber(numberToUse);
    }
    const data = buildPayload(numberToUse);
    if (invoiceId) {
      await updateDoc(doc(db, "users", user.uid, "invoices", invoiceId), {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } else {
      const ref = await addDoc(
        collection(db, "users", user.uid, "invoices"),
        data,
      );
      setInvoiceId(ref.id);
    }
    alert(
      `${documentType === "estimate" ? "Estimate" : "Invoice"} saved and locked`,
    );
    loadSavedInvoices();
    fetchBusinessStats();
  };

  // ── Convert to invoice ────────────────────────────────────────────────────
  const handleConvertToInvoice = async () => {
    if (!user?.uid || !invoiceId) {
      alert("Please save the estimate first before converting to invoice");
      return;
    }
    if (!window.confirm("Convert this estimate to an invoice?")) return;
    try {
      const db = getFirestore();
      const newInvoiceNumber = await generateInvoiceNumber(user.uid, "invoice");
      const invoiceData = buildPayload(newInvoiceNumber);
      invoiceData.documentType = "invoice";
      invoiceData.convertedFromEstimate = invoiceId;
      invoiceData.convertedFromEstimateNumber = invoiceNumber;
      invoiceData.convertedAt = serverTimestamp();
      const invoiceRef = await addDoc(
        collection(db, "users", user.uid, "invoices"),
        invoiceData,
      );
      await updateDoc(doc(db, "users", user.uid, "estimates", invoiceId), {
        convertedToInvoice: true,
        convertedToInvoiceId: invoiceRef.id,
        convertedToInvoiceNumber: newInvoiceNumber,
        convertedAt: serverTimestamp(),
        status: "converted",
      });
      setDocumentType("invoice");
      setInvoiceId(invoiceRef.id);
      setInvoiceNumber(newInvoiceNumber);
      alert(`Estimate successfully converted to Invoice ${newInvoiceNumber}`);
      loadSavedInvoices();
    } catch (_) {
      alert("Failed to convert estimate to invoice");
    }
  };

  // ── New doc handlers ──────────────────────────────────────────────────────
  const resetFields = () => {
    setInvoiceId(null);
    setInvoiceNumber("");
    setClientName("John Smith");
    setClientId("CLIENT-2026-1234");
    setClientEmail("john.smith@example.com");
    setClientPhone("082 123 4567");
    setClientAddress("123 Legal Street, Cape Town, 8001");
    setCaseType("Commercial Litigation");
    setCaseNumber("CASE-2026-001");
    setMatterDescription("Contract dispute regarding service agreement");
    setItems([]);
  };

  const handleNewEstimate = () => {
    setDocumentType("estimate");
    resetFields();
    generateInvoiceNumber(user?.uid, "estimate").then(setInvoiceNumber);
  };
  const handleNewInvoiceDoc = () => {
    setDocumentType("invoice");
    resetFields();
    generateInvoiceNumber(user?.uid, "invoice").then(setInvoiceNumber);
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
    if (!invoiceId) {
      alert("Please save the invoice before exporting PDF");
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
        "flex items-center gap-1.5 px-3 py-1.5 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm font-medium rounded-md transition-colors whitespace-nowrap",
    },
    {
      label: "Logout",
      icon: LogOut,
      onClick: handleLogout,
      className:
        "flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#f1f5f9] text-[#64748b] border border-[#e2e8f0] text-sm font-medium rounded-md transition-colors whitespace-nowrap",
    },
  ].filter(Boolean);

  const mobileDashboardActions = [
    documentType === "estimate" &&
      invoiceId && {
        label: "To Invoice",
        icon: FileText,
        onClick: handleConvertToInvoice,
        className:
          "flex items-center gap-1.5 px-3 py-2 bg-[#7c3aed] text-white rounded-md text-xs font-medium active:scale-95 whitespace-nowrap",
      },
    {
      label: "Save",
      icon: Save,
      onClick: handleSaveInvoice,
      className:
        "flex items-center gap-1.5 px-3 py-2 bg-[#7c3aed] text-white rounded-md text-xs font-medium active:scale-95 whitespace-nowrap",
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
          ? "bg-[#ede9fe] text-[#5b21b6]"
          : "bg-[#fef2f2] text-[#991b1b]";

  // ── Template props ────────────────────────────────────────────────────────
  const templateProps = {
    templateId: selectedTemplate,
    businessInfo,
    loading,
    jobCardNumber: invoiceNumber,
    customerName: clientName,
    customerEmail: clientEmail,
    customerPhone: clientPhone,
    customerAddress: clientAddress,
    caseNumber,
    caseType,
    matterDescription,
    items,
    subtotal,
    vat,
    total,
    documentType: "legal",
    serviceType: "LEGAL",
    stampSettings,
    showStamp: stampSettings.enabled,
    showStampDate: stampSettings.showDate,
    stampText: stampSettings.text,
    stampColor: stampSettings.color,
    paymentStatus,
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
          iconBg="bg-[#ede9fe]"
          iconColor="text-[#7c3aed]"
          subtitle="All time"
          loading={stats.loading}
          trend={12}
        />
        <StatCard
          title="Estimates"
          value={stats.totalEstimates}
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
                  handleNewInvoiceDoc();
                  setActiveView("invoice");
                },
                bg: "bg-[#ede9fe]",
                hover: "hover:bg-[#ddd6fe]",
                border: "border-[#c4b5fd]",
                iconBg: "bg-[#7c3aed]",
                text: "text-[#5b21b6]",
              },
              {
                label: "New Estimate",
                icon: Receipt,
                onClick: () => {
                  handleNewEstimate();
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
            onClick={() => setShowAllInvoices(true)}
            className="text-xs text-[#7c3aed] hover:text-[#6d28d9] font-medium"
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
                <Scale className="w-5 h-5 text-[#94a3b8]" />
              </div>
              <p className="text-sm font-medium text-[#374151] mb-1">
                No invoices yet
              </p>
              <p className="text-xs text-[#94a3b8] mb-3">
                Create your first invoice to get started
              </p>
              <button
                onClick={() => {
                  handleNewInvoiceDoc();
                  setActiveView("invoice");
                }}
                className="px-4 py-1.5 bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-lg text-xs font-medium transition-colors"
              >
                Create Invoice
              </button>
            </div>
          ) : (
            invoices.slice(0, 8).map((inv) => (
              <div
                key={inv.id}
                onClick={() => loadInvoice(inv)}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-[#f8fafc] cursor-pointer transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-[#1e293b] truncate">
                      {inv.invoiceNumber || inv.id}
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
                      {inv.client?.name || "No client"}
                    </span>
                    <span className="flex items-center gap-1 truncate">
                      <Scale className="w-3 h-3 flex-shrink-0" />
                      {inv.case?.type || "No case"}
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
        style={{ width: "210mm", minHeight: "297mm" }}
      >
        <TemplateRenderer {...templateProps} />
      </div>

      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* ── Sidebar ───────────────────────────────────────────────────── */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Collapsed sidebar */}
        <div
          className={`${sidebarOpen ? "hidden" : "hidden md:flex"} fixed z-40 w-16 bg-gradient-to-b from-slate-900 to-slate-800 border-r border-slate-700 h-full print:hidden flex-col items-center py-4 space-y-3 shadow-xl`}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-slate-400 hover:text-white hover:bg-violet-600/80 rounded-xl transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <div className="w-10 h-10">
            <img
              src={logo}
              alt="Logo"
              className="w-full h-full object-contain rounded-lg"
            />
          </div>
          <div className="w-10 border-t border-slate-600" />
          {[
            { icon: Home, title: "Home", action: () => setActiveView("home") },
            {
              icon: Settings,
              title: "Settings",
              action: () => setShowSettings(true),
            },
            {
              icon: TrendingUp,
              title: "Practice Overview",
              action: () => setActiveView("financial-overview"),
            },
            {
              icon: FolderOpen,
              title: "Cases",
              action: () => {
                handleNewInvoiceDoc();
                setActiveView("invoice");
              },
            },
            {
              icon: Users,
              title: "Clients",
              action: () => setShowCustomersListModal(true),
            },
            {
              icon: FileText,
              title: "Templates",
              action: () => setActiveView("templates"),
            },
            { icon: Scale, title: "Court Dates" },
            { icon: BookOpen, title: "Legal Research" },
            { icon: Receipt, title: "Billing" },
            { icon: Calendar, title: "Calendar" },
          ].map(({ icon: Icon, title, action }) => (
            <button
              key={title}
              onClick={action}
              className="p-2 text-slate-400 hover:text-white hover:bg-violet-600/80 rounded-lg transition-all w-10 h-10 flex items-center justify-center"
              title={title}
            >
              <Icon className="w-5 h-5" />
            </button>
          ))}
        </div>

        {/* Expanded sidebar */}
        <div
          className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} fixed z-50 w-64 bg-gradient-to-b from-slate-900 to-slate-800 border-r border-slate-700 transition-transform duration-300 h-full print:hidden shadow-2xl overflow-y-auto flex flex-col`}
        >
          <div className="p-4 md:p-5 flex-1">
            <div className="flex items-center justify-between mb-6">
              <img
                src={logo}
                alt="Logo"
                className="w-16 h-12 object-contain rounded-lg"
              />
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>

            <nav className="space-y-1">
              {[
                {
                  label: "Home",
                  icon: Home,
                  action: () => {
                    setActiveView("home");
                    setSidebarOpen(false);
                  },
                },
                {
                  label: "Settings",
                  icon: Settings,
                  action: () => {
                    setShowSettings(true);
                    setSidebarOpen(false);
                  },
                },
              ].map(({ label, icon: Icon, action }) => (
                <div
                  key={label}
                  onClick={action}
                  className="flex items-center space-x-3 px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all"
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{label}</span>
                </div>
              ))}

              <div className="pt-3 mt-3 border-t border-slate-700/50 space-y-1">
                <div
                  onClick={() => {
                    setActiveView("financial-overview");
                    setSidebarOpen(false);
                  }}
                  className="flex items-center space-x-3 px-3 py-2.5 text-slate-300 hover:text-white hover:bg-violet-600/20 rounded-lg cursor-pointer transition-all"
                >
                  <TrendingUp className="w-5 h-5" />
                  <span className="text-sm font-medium">Practice Overview</span>
                </div>

                {/* Cases */}
                <div>
                  <div
                    onClick={() => setIsCasesOpen(!isCasesOpen)}
                    className="flex items-center justify-between px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all"
                  >
                    <div className="flex items-center space-x-3">
                      <FolderOpen className="w-5 h-5" />
                      <span className="text-sm font-medium">Cases</span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-300 ${isCasesOpen ? "rotate-180" : ""}`}
                    />
                  </div>
                  <div
                    className={`ml-4 mt-1 space-y-1 border-l-2 border-slate-700/50 pl-4 overflow-hidden transition-all duration-300 ${isCasesOpen ? "max-h-48 opacity-100" : "max-h-0 opacity-0"}`}
                  >
                    <div
                      onClick={() => {
                        handleNewEstimate();
                        setSidebarOpen(false);
                        setActiveView("invoice");
                      }}
                      className="px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700/30 rounded-lg cursor-pointer transition-all"
                    >
                      Create Estimate
                    </div>
                    <div
                      onClick={() => {
                        handleNewInvoiceDoc();
                        setSidebarOpen(false);
                        setActiveView("invoice");
                      }}
                      className="px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700/30 rounded-lg cursor-pointer transition-all"
                    >
                      Create Invoice
                    </div>
                    <div
                      onClick={() => {
                        setShowAllInvoices(true);
                        setSidebarOpen(false);
                      }}
                      className="px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700/30 rounded-lg cursor-pointer transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span>All Invoices</span>
                        <span className="text-blue-300 px-2 py-0.5 rounded-full text-xs font-semibold">
                          {savedInvoices.length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Clients */}
                <div>
                  <div
                    onClick={() => setIsClientsOpen(!isClientsOpen)}
                    className="flex items-center justify-between px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all"
                  >
                    <div className="flex items-center space-x-3">
                      <Users className="w-5 h-5" />
                      <span className="text-sm font-medium">Clients</span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-300 ${isClientsOpen ? "rotate-180" : ""}`}
                    />
                  </div>
                  <div
                    className={`ml-4 mt-1 space-y-1 border-l-2 border-slate-700/50 pl-4 overflow-hidden transition-all duration-300 ${isClientsOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}
                  >
                    <div
                      onClick={() => {
                        handleAddNewCustomer();
                        setSidebarOpen(false);
                      }}
                      className="px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700/30 rounded-lg cursor-pointer transition-all"
                    >
                      Add Client
                    </div>
                    <div
                      onClick={() => {
                        setShowCustomersListModal(true);
                        setSidebarOpen(false);
                      }}
                      className="px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700/30 rounded-lg cursor-pointer transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span>All Clients</span>
                        <span className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                          {savedCustomers.length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {[
                  {
                    label: "Invoice Templates",
                    icon: FileText,
                    action: () => {
                      setActiveView("templates");
                      setSidebarOpen(false);
                    },
                  },
                  { label: "Court Dates", icon: Scale },
                  { label: "Legal Research", icon: BookOpen },
                  { label: "Billing", icon: Receipt },
                  { label: "Calendar", icon: Calendar },
                ].map(({ label, icon: Icon, action }) => (
                  <div
                    key={label}
                    onClick={action}
                    className="flex items-center space-x-3 px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all"
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{label}</span>
                  </div>
                ))}
              </div>
            </nav>
          </div>

          {/* Sidebar footer */}
          <div className="p-4 border-t border-slate-700/50 bg-gradient-to-t from-slate-900 to-transparent">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-white rounded-full ring-2 ring-slate-700 shadow-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                {businessInfo.logoUrl ? (
                  <img
                    src={businessInfo.logoUrl}
                    alt="Logo"
                    className="max-h-[70%] max-w-[70%] object-contain"
                  />
                ) : (
                  <Scale className="w-4 h-4 text-violet-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-white truncate">
                  {user?.name || "User"}
                </div>
                <div className="text-xs text-slate-400 truncate">
                  {user?.email || "email@example.com"}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="text-slate-400 hover:text-white hover:bg-red-600/20 p-2 rounded-xl transition-all flex-shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Main content ───────────────────────────────────────────────── */}
        <div
          className={`flex-1 overflow-hidden flex flex-col min-h-0 transition-all duration-300 ${sidebarOpen ? "ml-0 lg:ml-64" : "ml-0 md:ml-16"}`}
        >
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

          {/* All invoices modal */}
          {showAllInvoices && (
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
                    onClick={() => setShowAllInvoices(false)}
                    className="p-1.5 text-[#64748b] hover:text-[#1e293b] hover:bg-[#e2e8f0] rounded-lg transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {savedInvoices.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <Scale className="w-10 h-10 text-[#cbd5e1] mb-3" />
                      <p className="text-sm text-[#94a3b8]">No records found</p>
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead>
                        <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                          {[
                            "Number",
                            "Client",
                            "Case Type",
                            "Case #",
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
                        {savedInvoices.map((inv) => (
                          <tr
                            key={inv.id}
                            onClick={() => loadInvoice(inv)}
                            className="border-b border-[#f1f5f9] hover:bg-[#f8fafc] cursor-pointer transition-colors"
                          >
                            <td className="px-5 py-3 text-sm font-semibold text-[#7c3aed]">
                              {inv.invoiceNumber || "N/A"}
                            </td>
                            <td className="px-5 py-3 text-sm text-[#374151]">
                              {inv.client?.name || "N/A"}
                            </td>
                            <td className="px-5 py-3 text-sm text-[#374151]">
                              {inv.case?.type || "N/A"}
                            </td>
                            <td className="px-5 py-3 text-sm text-[#374151]">
                              {inv.case?.caseNumber || "N/A"}
                            </td>
                            <td className="px-5 py-3 text-sm font-semibold text-[#1e293b]">
                              {formatCurrency(inv.totals?.total || 0)}
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

          {/* ── Views ─────────────────────────────────────────────────── */}
          {activeView === "home" && <HomeViewLocal />}
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

          {/* ── Invoice builder — split layout ──────────────────────────── */}
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
                        iconBg: "bg-[#ede9fe]",
                        iconColor: "text-[#7c3aed]",
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
                        className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all border-b-2 -mb-px ${inputMode === "manual" ? "border-[#7c3aed] text-[#7c3aed] bg-white" : "border-transparent text-[#64748b] hover:text-[#374151]"}`}
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
                        onClick={() => setInputMode("ai")}
                        className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all border-b-2 -mb-px ${inputMode === "ai" ? "border-[#7c3aed] text-[#7c3aed] bg-white" : "border-transparent text-[#64748b] hover:text-[#374151]"}`}
                      >
                        <Sparkles className="w-4 h-4" />
                        AI Assistant
                      </button>
                    </div>

                    {inputMode === "ai" && (
                      <div className="p-6 border-b border-[#e2e8f0]">
                        <AIInvoiceExtractor
                          onDataExtracted={handleAIDataExtracted}
                          documentType={documentType}
                        />
                      </div>
                    )}

                    {inputMode === "manual" && (
                      <div className="p-6">
                        <LegalMultiStepForm
                          clientName={clientName}
                          setClientName={setClientName}
                          clientId={clientId}
                          setClientId={setClientId}
                          clientEmail={clientEmail}
                          setClientEmail={setClientEmail}
                          clientPhone={clientPhone}
                          setClientPhone={setClientPhone}
                          clientAddress={clientAddress}
                          setClientAddress={setClientAddress}
                          caseType={caseType}
                          setCaseType={setCaseType}
                          caseNumber={caseNumber}
                          setCaseNumber={setCaseNumber}
                          matterDescription={matterDescription}
                          setMatterDescription={setMatterDescription}
                          items={items}
                          newItem={newItem}
                          setNewItem={setNewItem}
                          handleAddItem={handleAddItem}
                        />
                      </div>
                    )}
                  </div>

                  {/* Payment terms card */}
                  <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
                    <div className="px-5 py-3.5 border-b border-[#e2e8f0] bg-[#f8fafc]">
                      <span className="text-sm font-semibold text-[#374151]">
                        Payment Terms
                      </span>
                    </div>
                    <div className="divide-y divide-[#f1f5f9]">
                      {[
                        ["Payment Method", "EFT / Bank Transfer"],
                        ["Payment Terms", "Due Within 30 Days"],
                        ["Late Payment", "Interest at Prime + 2%"],
                      ].map(([k, v]) => (
                        <div
                          key={k}
                          className="flex items-center justify-between px-5 py-3 text-sm"
                        >
                          <span className="text-[#64748b]">{k}</span>
                          <span className="font-semibold text-[#1e293b]">
                            {v}
                          </span>
                        </div>
                      ))}
                    </div>
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
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-[#7c3aed] text-white text-xs font-medium rounded-lg hover:bg-[#6d28d9] transition-colors"
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

export default LegalDashboard;
