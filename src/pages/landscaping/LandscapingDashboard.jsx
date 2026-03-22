import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import BusinessSettingsModal from "../BusinessSettingsModal";
import AppHeader from "../AppHeader";
import { serverTimestamp } from "firebase/firestore";
import Templates from "./Templates";
import PurchaseOrders from "../PurchaseOrders";
import { useLocation } from "react-router-dom";
import AIInvoiceWindow from "../AIInvoiceWindow";
import TemplateSelector, { TemplateRenderer } from "./TemplateSelector";
import { getAuth, signOut } from "firebase/auth";
import FinancialOverview from "../FinancialOverview";
import LandscapingMultiStepForm from "./LandscapingMultiStepForm";
import LandscapingSidebar from "./LandscapingSidebar";
import PropertiesView from "./PropertiesView";
import MaterialsInventoryView from "./MaterialsInventoryView";
import AppointmentsView from "./AppointmentsView";
import CrewEquipmentView from "./CrewEquipmentView";
import PlantLibraryView from "./PlantLibraryView";
import IrrigationView from "./IrrigationView";
import { getFunctions } from "firebase/functions";
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
import { db } from "../../firebase";
import CustomerModal from "../CustomerModal";
import CustomersListModal from "../CustomersListModal";
import {
  Home,
  Save,
  Settings,
  Users,
  FileText,
  Sparkles,
  BarChart3,
  Plus,
  Send,
  X,
  CheckSquare,
  TrendingUp,
  TrendingDown,
  Receipt,
  Wallet,
  Flower2,
  ClipboardList,
  MapPin,
  Eye,
  ArrowRight,
} from "lucide-react";

// ─── Number generator ─────────────────────────────────────────────────────────
const generateJobCardNumber = async (userId) => {
  const db = getFirestore();
  const year = new Date().getFullYear();
  const jobCardsRef = collection(db, "users", userId, "invoices");
  const q = query(jobCardsRef, orderBy("createdAt", "desc"), limit(1));
  const snapshot = await getDocs(q);
  let lastNumber = 891;
  if (!snapshot.empty) {
    const match = snapshot.docs[0].data().jobCardNumber?.match(/(\d+)$/);
    if (match) lastNumber = Number(match[1]);
  }
  return `LW-${year}-${String(lastNumber + 1).padStart(4, "0")}`;
};

getFunctions();

// ─── Design tokens ────────────────────────────────────────────────────────────
const inputCls =
  "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md bg-white text-[#1e293b] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-[#059669] transition-colors";

const LandscapingDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [inputMode, setInputMode] = useState("manual");
  const [documentType, setDocumentType] = useState("invoice");
  const [activeView, setActiveView] = useState("home");
  const { user } = useAuth();
  const [showAIWindow, setShowAIWindow] = useState(false);
  const [jobCardNumber, setJobCardNumber] = useState("");
  const [jobCardId, setJobCardId] = useState(null);
  const [savedJobCards, setSavedJobCards] = useState([]);
  const [savedCustomers, setSavedCustomers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [invoices, setInvoices] = useState([]);

  // Modals
  const [showSettings, setShowSettings] = useState(false);
  const [showCustomersListModal, setShowCustomersListModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showJobCardsList, setShowJobCardsList] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showInvoicesList, setShowInvoicesList] = useState(false);

  // Misc
  const [selectedTemplate, setSelectedTemplate] = useState("professional");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
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
  const [customerName, setCustomerName] = useState("Sarah Johnson");
  const [customerId, setCustomerId] = useState("CUST-2026-1234");
  const [customerEmail, setCustomerEmail] = useState(
    "sarah.johnson@example.com",
  );
  const [customerPhone, setCustomerPhone] = useState("082 123 4567");
  const [customerAddress, setCustomerAddress] = useState(
    "123 Oak Street, Cape Town, 8001",
  );

  // ── Property fields ──────────────────────────────────────────────────────
  const [propertyType, setPropertyType] = useState("Residential Garden");
  const [propertySize, setPropertySize] = useState("500 sqm");
  const [propertyAddress, setPropertyAddress] = useState(
    "123 Oak Street, Cape Town, 8001",
  );
  const [accessDetails, setAccessDetails] = useState(
    "Side gate access available",
  );

  // ── Items ────────────────────────────────────────────────────────────────
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({
    description: "",
    rate: "",
    qty: "",
    type: "Labor",
  });

  // ── Business info ────────────────────────────────────────────────────────
  const [businessInfo, setBusinessInfo] = useState({
    businessName: "GREEN PARADISE LANDSCAPING",
    addressLine1: "15 GARDEN ROAD",
    addressLine2: "CLAREMONT",
    city: "CAPE TOWN",
    postalCode: "7708",
    primaryPhone: "082 514 4509",
    secondaryPhone: "084 583 9929",
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
      // Only auto-open on large screens
      if (w >= 1024) setSidebarOpen(true);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!user?.uid) return;
    generateJobCardNumber(user.uid).then(setJobCardNumber);
    loadSavedJobCards();
  }, [user]);

  useEffect(() => {
    if (user?.uid) {
      loadBusinessInfo();
      loadCustomers();
      fetchBusinessStats();
    }
  }, [user]);

  useEffect(() => {
    if (!jobCardId)
      setPaymentStatus({ totalPaid: 0, balanceDue: total, status: "pending" });
  }, [total, jobCardId]);

  // Keep showInvoicesList in sync with showJobCardsList (sidebar calls setShowJobCardsList)
  useEffect(() => {
    setShowInvoicesList(showJobCardsList);
  }, [showJobCardsList]);

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
          new Date(b.dates?.serviceDate || 0) -
          new Date(a.dates?.serviceDate || 0),
      );
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

  const loadSavedJobCards = async () => {
    if (!user?.uid) return;
    const db = getFirestore();
    const snap = await getDocs(
      query(
        collection(db, "users", user.uid, "invoices"),
        orderBy("createdAt", "desc"),
        limit(50),
      ),
    );
    setSavedJobCards(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
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

  // ── Job card loader ───────────────────────────────────────────────────────
  const loadJobCard = (jc) => {
    setJobCardId(jc.id);
    setJobCardNumber(jc.jobCardNumber || "");
    setCustomerName(jc.customer?.name || "");
    setCustomerEmail(jc.customer?.email || "");
    setCustomerPhone(jc.customer?.phone || "");
    setCustomerAddress(jc.customer?.address || "");
    setCustomerId(jc.customer?.customerId || "");
    setPropertyType(jc.property?.type || "");
    setPropertySize(jc.property?.size || "");
    setPropertyAddress(jc.property?.address || "");
    setAccessDetails(jc.property?.accessDetails || "");
    setItems(jc.items || []);
    setPaymentStatus({
      totalPaid: jc.totals?.paid || 0,
      balanceDue: jc.totals?.due || jc.totals?.total || 0,
      status: jc.status || "pending",
    });
    setShowJobCardsList(false);
    setShowInvoicesList(false);
    setActiveView("invoice");
  };

  // ── AI extractor ──────────────────────────────────────────────────────────
  const handleAIDataExtracted = (data) => {
    if (data.customer.name) setCustomerName(data.customer.name);
    if (data.customer.email) setCustomerEmail(data.customer.email);
    if (data.customer.phone) setCustomerPhone(data.customer.phone);
    if (data.customer.address) setCustomerAddress(data.customer.address);
    if (data.customer.customerId) setCustomerId(data.customer.customerId);
    if (data.property.type) setPropertyType(data.property.type);
    if (data.property.size) setPropertySize(data.property.size);
    if (data.property.address) setPropertyAddress(data.property.address);
    if (data.property.accessDetails)
      setAccessDetails(data.property.accessDetails);
    if (data.items?.length > 0) setItems(data.items);
    alert(
      "✅ Landscaping work order data extracted and populated successfully!",
    );
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
        type: newItem.type || "Labor",
        rate,
        qty,
        amount: rate * qty,
      },
    ]);
    setNewItem({ description: "", rate: "", qty: "", type: "Labor" });
  };

  const handleRemoveItem = (index) =>
    setItems((prev) => prev.filter((_, i) => i !== index));

  // ── Payload builder ───────────────────────────────────────────────────────
  const buildPayload = (numberToUse) => ({
    jobCardNumber: numberToUse,
    locked: true,
    status: "pending",
    documentType,
    dates: { serviceDate: new Date().toISOString(), completedDate: null },
    customer: {
      name: customerName,
      email: customerEmail,
      phone: customerPhone,
      address: customerAddress,
      customerId,
    },
    property: {
      type: propertyType,
      size: propertySize,
      address: propertyAddress,
      accessDetails,
    },
    items,
    totals: { subtotal, vat, total, paid: 0, due: total },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // ── Save handler ──────────────────────────────────────────────────────────
  const handleSaveJobCard = async () => {
    if (!user?.uid) return;
    const db = getFirestore();
    let numberToUse = jobCardNumber;
    if (!jobCardId) {
      numberToUse = await generateJobCardNumber(user.uid);
      setJobCardNumber(numberToUse);
    }
    const data = buildPayload(numberToUse);
    if (jobCardId) {
      await updateDoc(doc(db, "users", user.uid, "invoices", jobCardId), {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } else {
      const ref = await addDoc(
        collection(db, "users", user.uid, "invoices"),
        data,
      );
      setJobCardId(ref.id);
    }
    alert("Work order saved and locked");
    loadSavedJobCards();
    fetchBusinessStats();
  };

  // ── Convert to invoice ────────────────────────────────────────────────────
  const handleConvertToInvoice = async () => {
    if (!user?.uid || !jobCardId) {
      alert("Please save the job card first before converting to invoice");
      return;
    }
    if (!window.confirm("Convert this job card to an invoice?")) return;
    try {
      const db = getFirestore();
      const newInvoiceNumber = await generateJobCardNumber(user.uid);
      const invoiceData = buildPayload(newInvoiceNumber);
      invoiceData.documentType = "invoice";
      invoiceData.convertedFromJobCard = jobCardId;
      invoiceData.convertedFromJobCardNumber = jobCardNumber;
      invoiceData.convertedAt = serverTimestamp();
      const invoiceRef = await addDoc(
        collection(db, "users", user.uid, "invoices"),
        invoiceData,
      );
      await updateDoc(doc(db, "users", user.uid, "invoices", jobCardId), {
        convertedToInvoice: true,
        convertedToInvoiceId: invoiceRef.id,
        convertedToInvoiceNumber: newInvoiceNumber,
        convertedAt: serverTimestamp(),
        status: "converted",
      });
      setDocumentType("invoice");
      setJobCardId(invoiceRef.id);
      setJobCardNumber(newInvoiceNumber);
      alert(`Job card successfully converted to Invoice ${newInvoiceNumber}`);
      loadSavedJobCards();
    } catch (_) {
      alert("Failed to convert job card to invoice");
    }
  };

  // ── New job card ──────────────────────────────────────────────────────────
  const handleNewJobCard = () => {
    setJobCardId(null);
    setJobCardNumber("");
    setCustomerName("Sarah Johnson");
    setCustomerId("CUST-2026-1234");
    setCustomerEmail("sarah.johnson@example.com");
    setCustomerPhone("082 123 4567");
    setCustomerAddress("123 Oak Street, Cape Town, 8001");
    setPropertyType("Residential Garden");
    setPropertySize("500 sqm");
    setPropertyAddress("123 Oak Street, Cape Town, 8001");
    setAccessDetails("Side gate access available");
    setItems([]);
    generateJobCardNumber(user?.uid).then(setJobCardNumber);
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
    if (!jobCardId) {
      alert("Please save the work order before exporting PDF");
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
      jobCardId && {
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
      onClick: handleNewJobCard,
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
      onClick: handleSaveJobCard,
      className:
        "flex items-center gap-1.5 px-3 py-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium rounded-md transition-colors whitespace-nowrap",
    },
  ].filter(Boolean);

  const mobileDashboardActions = [
    documentType === "quote" &&
      jobCardId && {
        label: "To Invoice",
        icon: FileText,
        onClick: handleConvertToInvoice,
        className:
          "flex items-center gap-1.5 px-3 py-2 bg-[#7c3aed] text-white rounded-md text-xs font-medium active:scale-95 whitespace-nowrap",
      },
    {
      label: "Save",
      icon: Save,
      onClick: handleSaveJobCard,
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
    jobCardNumber,
    customerName,
    customerEmail,
    customerPhone,
    customerAddress,
    propertyType,
    propertySize,
    propertyAddress,
    accessDetails,
    items,
    subtotal,
    vat,
    total,
    merchantCode: "GPL-12345",
    serviceType: "LANDSCAPING",
    documentType: "landscaping",
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
            className={`flex items-center gap-0.5 text-xs font-semibold ${
              trend > 0 ? "text-[#059669]" : "text-[#dc2626]"
            }`}
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
          title="Work Orders"
          value={stats.totalInvoices}
          icon={FileText}
          iconBg="bg-[#f0fdf4]"
          iconColor="text-[#059669]"
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
          iconBg="bg-[#eff6ff]"
          iconColor="text-[#2563eb]"
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
                <p className="text-xs text-[#94a3b8]">
                  Outstanding work orders
                </p>
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
                label: "New Work Order",
                icon: FileText,
                onClick: () => {
                  handleNewJobCard();
                  setActiveView("invoice");
                },
                bg: "bg-[#f0fdf4]",
                hover: "hover:bg-[#dcfce7]",
                border: "border-[#bbf7d0]",
                iconBg: "bg-[#059669]",
                text: "text-[#166534]",
              },
              {
                label: "New Quote",
                icon: Receipt,
                onClick: () => {
                  setDocumentType("quote");
                  handleNewJobCard();
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
                bg: "bg-[#eff6ff]",
                hover: "hover:bg-[#dbeafe]",
                border: "border-[#bfdbfe]",
                iconBg: "bg-[#2563eb]",
                text: "text-[#1e40af]",
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
            Recent Work Orders
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
                <Flower2 className="w-5 h-5 text-[#94a3b8]" />
              </div>
              <p className="text-sm font-medium text-[#374151] mb-1">
                No work orders yet
              </p>
              <p className="text-xs text-[#94a3b8] mb-3">
                Create your first work order to get started
              </p>
              <button
                onClick={() => {
                  handleNewJobCard();
                  setActiveView("invoice");
                }}
                className="px-4 py-1.5 bg-[#059669] hover:bg-[#047857] text-white rounded-lg text-xs font-medium transition-colors"
              >
                Create Work Order
              </button>
            </div>
          ) : (
            invoices.slice(0, 8).map((inv) => (
              <div
                key={inv.id}
                onClick={() => loadJobCard(inv)}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-[#f8fafc] cursor-pointer transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-[#1e293b] truncate">
                      {inv.jobCardNumber || inv.id}
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
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      {inv.property?.type || "No property"}
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

      {/* AI Window */}
      {showAIWindow && (
        <AIInvoiceWindow
          user={user}
          businessInfo={businessInfo}
          documentType={documentType}
          onExit={() => setShowAIWindow(false)}
          industry="landscaping"
        />
      )}

      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* ── Unified Sidebar ─────────────────────────────────────────── */}
        <LandscapingSidebar
          user={user}
          activeView={activeView}
          setActiveView={setActiveView}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          setShowSettings={setShowSettings}
          handleNewJobCard={handleNewJobCard}
          handleLogout={handleLogout}
          businessInfo={businessInfo}
          savedJobCards={savedJobCards}
          savedCustomers={savedCustomers}
          showJobCardsList={showJobCardsList}
          setShowJobCardsList={setShowJobCardsList}
          setShowCustomersListModal={setShowCustomersListModal}
          handleAddNewCustomer={handleAddNewCustomer}
        />

        {/* ── Main content ───────────────────────────────────────────── */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          <AppHeader
            actions={activeView === "invoice" ? headerActions : []}
            mobileActions={
              activeView === "invoice" ? mobileDashboardActions : []
            }
            onSettingsOpen={() => setShowSettings(true)}
          />

          {/* ── Modals ─────────────────────────────────────────────── */}
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

          {/* All work orders modal */}
          {showInvoicesList && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden border border-[#e2e8f0]">
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0] bg-[#f8fafc]">
                  <div>
                    <h2 className="text-base font-semibold text-[#1e293b]">
                      All Work Orders
                    </h2>
                    <p className="text-xs text-[#64748b] mt-0.5">
                      {savedJobCards.length} records
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowInvoicesList(false);
                      setShowJobCardsList(false);
                    }}
                    className="p-1.5 text-[#64748b] hover:text-[#1e293b] hover:bg-[#e2e8f0] rounded-lg transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {savedJobCards.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <Flower2 className="w-10 h-10 text-[#cbd5e1] mb-3" />
                      <p className="text-sm text-[#94a3b8]">No records found</p>
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead>
                        <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                          {[
                            "Number",
                            "Client",
                            "Property",
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
                        {savedJobCards.map((jc) => (
                          <tr
                            key={jc.id}
                            onClick={() => loadJobCard(jc)}
                            className="border-b border-[#f1f5f9] hover:bg-[#f8fafc] cursor-pointer transition-colors"
                          >
                            <td className="px-5 py-3 text-sm font-semibold text-[#059669]">
                              {jc.jobCardNumber || "N/A"}
                            </td>
                            <td className="px-5 py-3 text-sm text-[#374151]">
                              {jc.customer?.name || "N/A"}
                            </td>
                            <td className="px-5 py-3 text-sm text-[#374151]">
                              {jc.property?.type || "N/A"}
                              {jc.property?.size
                                ? ` · ${jc.property.size}`
                                : ""}
                            </td>
                            <td className="px-5 py-3 text-sm font-semibold text-[#1e293b]">
                              {formatCurrency(jc.totals?.total || 0)}
                            </td>
                            <td className="px-5 py-3">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${statusBadge(jc.status)}`}
                              >
                                {jc.status === "partially_paid"
                                  ? "Partial"
                                  : jc.status || "Pending"}
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
                        {documentType === "quote" ? "Quote" : "Work Order"}{" "}
                        Preview
                      </h2>
                      <p className="text-xs text-[#64748b]">
                        {jobCardNumber || "Draft"}
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

          {/* ── Views ─────────────────────────────────────────────── */}

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

          {activeView === "purchase-orders" && (
            <div className="flex-1 overflow-y-auto p-6">
              <PurchaseOrders user={user} />
            </div>
          )}

          {/* ── New views ── */}
          {activeView === "properties" && (
            <div className="flex-1 overflow-y-auto px-4 md:px-6 py-5">
              <PropertiesView user={user} />
            </div>
          )}

          {activeView === "inventory" && (
            <div className="flex-1 overflow-y-auto px-4 md:px-6 py-5">
              <MaterialsInventoryView user={user} />
            </div>
          )}

          {activeView === "appointments" && (
            <div className="flex-1 overflow-y-auto px-4 md:px-6 py-5">
              <AppointmentsView user={user} />
            </div>
          )}

          {activeView === "crew" && (
            <div className="flex-1 overflow-y-auto px-4 md:px-6 py-5">
              <CrewEquipmentView user={user} defaultTab="crew" />
            </div>
          )}

          {activeView === "equipment" && (
            <div className="flex-1 overflow-y-auto px-4 md:px-6 py-5">
              <CrewEquipmentView user={user} defaultTab="equipment" />
            </div>
          )}

          {/* ── Plant Library ── */}
          {activeView === "plant-library" && (
            <div className="flex-1 overflow-y-auto px-4 md:px-6 py-5">
              <PlantLibraryView user={user} />
            </div>
          )}

          {/* ── Irrigation ── */}
          {activeView === "irrigation" && (
            <div className="flex-1 overflow-y-auto px-4 md:px-6 py-5">
              <IrrigationView user={user} />
            </div>
          )}

          {/* Coming-soon placeholder for remaining sidebar items */}
          {[
            "report-jobs",
            "report-revenue",
            "report-materials",
            "analytics-jobs",
            "analytics-revenue",
            "analytics-customers",
            "work-orders-active",
          ].includes(activeView) && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center py-20 px-6">
                <div className="w-16 h-16 bg-[#f0fdf4] rounded-full flex items-center justify-center mx-auto mb-4">
                  <ClipboardList className="w-7 h-7 text-[#059669]" />
                </div>
                <h3 className="text-base font-semibold text-[#1e293b] mb-2 capitalize">
                  {activeView.replace(/-/g, " ")}
                </h3>
                <p className="text-sm text-[#64748b] max-w-xs mx-auto">
                  This section is coming soon. We're building something great
                  here.
                </p>
              </div>
            </div>
          )}

          {/* ── Work order builder — split layout ──────────────────────── */}
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
                        iconBg: "bg-[#f0fdf4]",
                        iconColor: "text-[#059669]",
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
                        className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all border-b-2 -mb-px ${
                          inputMode === "manual"
                            ? "border-[#059669] text-[#059669] bg-white"
                            : "border-transparent text-[#64748b] hover:text-[#374151]"
                        }`}
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
                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ml-auto mr-3 my-auto bg-gradient-to-r from-[#7c3aed] to-[#5b21b6] text-white shadow-md shadow-[#7c3aed]/30 hover:shadow-lg hover:shadow-[#7c3aed]/40 hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <Sparkles className="w-4 h-4" />
                        AI Mode
                      </button>
                    </div>

                    {inputMode === "manual" && (
                      <div className="p-6">
                        <LandscapingMultiStepForm
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
                          propertyType={propertyType}
                          setPropertyType={setPropertyType}
                          propertySize={propertySize}
                          setPropertySize={setPropertySize}
                          propertyAddress={propertyAddress}
                          setPropertyAddress={setPropertyAddress}
                          accessDetails={accessDetails}
                          setAccessDetails={setAccessDetails}
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
                        ["Payment Method", "Cash / Card / EFT"],
                        ["Payment Terms", "Due on Completion"],
                        ["Warranty", "90 Days Parts & Labor"],
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

export default LandscapingDashboard;
