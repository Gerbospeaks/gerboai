import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import HomeView from "../HomeView";
import BusinessSettingsModal from "../BusinessSettingsModal";
import AppHeader from "../AppHeader";
import SubUserManagement from "../SubUserManagement";
import { serverTimestamp } from "firebase/firestore";
import logo from "../../assets/img/solidflo-logo.png";
import { usePermissions } from "../../hooks/usePermissions";
import Templates from "./Templates";
import ServiceMarketplaceView from "../ServiceMarketplaceView";
import ServiceRequestsView from "../ServiceRequestsView";
import PurchaseOrders from "../PurchaseOrders";
import { useLocation } from "react-router-dom";
import AIInvoiceWindow from '../AIInvoiceWindow';
import FinancialOverview from "../FinancialOverview";
import TemplateSelector, { TemplateRenderer } from "./TemplateSelector";
import uploadLogoToR2 from "../../utils/uploadLogoToR2";
import { getAuth, signOut } from "firebase/auth";
import Properties from "./Properties";
import Listings from "./Listings";
import Commissions from "./Commissions";
import Reports from "./Reports";
import { getFunctions, httpsCallable } from "firebase/functions";
import RealEstateSidebar from "./RealEstateSidebar";
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
import RealEstateMultiStepForm from "./RealEstateMultiStepForm";
import CustomersListModal from "../CustomersListModal";
import {
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Home,
  Settings,
  Eye,
  X,
  Users,
  Save,
  Calendar,
  FileText,
  Building2,
  FileBarChart,
  BarChart3,
  Plus,
  Send,
  Edit,
  LogOut,
  CheckSquare,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Receipt,
  Wallet,
  Key,
  ClipboardList,
  MapPin,
  ArrowRight,
  DollarSign,
} from "lucide-react";

// ─── Number generation ────────────────────────────────────────────────────────
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
    if (match) lastNumber = Number(match[1]);
  }
  const nextNumber = lastNumber + 1;
  return `RE-${year}-${String(nextNumber).padStart(4, "0")}`;
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

const formatCurrency = (n, currency = "£") =>
  `${currency}${Number(n).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// ─── Main component ───────────────────────────────────────────────────────────
const RealEstateDashboard = () => {
  // ── Layout / sidebar ─────────────────────────────────────────────────────
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [inputMode, setInputMode] = useState("manual");

  // ── Auth ─────────────────────────────────────────────────────────────────
  const { user, authUser } = useAuth();
  const [aiWindowOpen, setAiWindowOpen] = useState(false);
  const [aiDocType, setAiDocType] = useState('invoice');
  const [documentType, setDocumentType] = useState("invoice");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceId, setInvoiceId] = useState(null);
  const [savedInvoices, setSavedInvoices] = useState([]);
  const [showInvoicesList, setShowInvoicesList] = useState(false);

  // ── Views / modals ───────────────────────────────────────────────────────
  const [showSettings, setShowSettings] = useState(false);
  const [activeView, setActiveView] = useState("home");
  const [showCustomersListModal, setShowCustomersListModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showAIWindow, setShowAIWindow] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [savedCustomers, setSavedCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState(null);

  // ── Sidebar dropdowns ────────────────────────────────────────────────────
  const [isInvoicingOpen, setIsInvoicingOpen] = useState(false);
  const [isClientsOpen, setIsClientsOpen] = useState(false);

  // ── Template & stamp ────────────────────────────────────────────────────
  const [selectedTemplate, setSelectedTemplate] = useState("professional");
  const [stampSettings, setStampSettings] = useState({ text: "APPROVED", color: "#d32f2f", showDate: false, enabled: false });

  // ── Payment ──────────────────────────────────────────────────────────────
  const [paymentStatus, setPaymentStatus] = useState({ totalPaid: 0, balanceDue: 0, status: "pending" });

  // ── Stats ─────────────────────────────────────────────────────────────────
  const [stats, setStats] = useState({ totalInvoices: 0, totalInvoiced: 0, totalClients: 0, pendingPayments: 0, loading: true });

  // ── Client fields ─────────────────────────────────────────────────────────
  const [clientName, setClientName] = useState("Sarah Johnson");
  const [clientId, setClientId] = useState("CLIENT-2026-5678");
  const [clientEmail, setClientEmail] = useState("sarah.johnson@example.com");
  const [clientPhone, setClientPhone] = useState("0161 234 5678");
  const [clientAddress, setClientAddress] = useState("123 High Street, Manchester, M1 1AB");

  // ── Property fields ───────────────────────────────────────────────────────
  const [propertyType, setPropertyType] = useState("Residential Sale");
  const [propertyAddress, setPropertyAddress] = useState("456 Oak Avenue, Manchester, M2 3CD");
  const [propertySize, setPropertySize] = useState("2,500 sq ft");
  const [propertyBedrooms, setPropertyBedrooms] = useState("4");
  const [propertyBathrooms, setPropertyBathrooms] = useState("3");

  // ── Business info ─────────────────────────────────────────────────────────
  const [businessInfo, setBusinessInfo] = useState({
    businessName: "PRIME PROPERTY SERVICES",
    addressLine1: "25 MARKET STREET",
    addressLine2: "CITY CENTRE",
    city: "MANCHESTER",
    postalCode: "M1 1WR",
    primaryPhone: "0161 234 5678",
    secondaryPhone: "07700 900123",
    logoUrl: "",
  });
  const [loading, setLoading] = useState(true);

  // ── Line items ────────────────────────────────────────────────────────────
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ description: "", rate: "", qty: "", type: "Service" });

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const vat = subtotal * 0.2;
  const total = subtotal + vat;

  const location = useLocation();
  useEffect(() => {
    if (location.state?.activeView) setActiveView(location.state.activeView);
  }, [location.state]);

  // ── Effects ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user?.uid) return;
    const loadInvoiceNumber = async () => {
      const next = await generateInvoiceNumber(user.uid);
      setInvoiceNumber(next);
    };
    loadInvoiceNumber();
    loadSavedInvoices();
  }, [user]);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setSidebarOpen(width >= 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => { loadCustomers(); }, []);
  useEffect(() => { loadPaymentStatus(); }, [invoiceId, user?.uid]);
  useEffect(() => { if (user?.uid) { loadBusinessInfo(); fetchStats(); } }, [user]);

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
    if (!invoiceId) setPaymentStatus({ totalPaid: 0, balanceDue: total, status: "pending" });
  }, [total, invoiceId]);

  // ── Fetch stats ───────────────────────────────────────────────────────────
  const fetchStats = async () => {
    if (!user?.uid) return;
    try {
      const db = getFirestore();
      const invoicesSnap = await getDocs(collection(db, "users", user.uid, "invoices"));
      let totalInvoiced = 0, pendingPayments = 0;
      invoicesSnap.forEach((d) => {
        const data = d.data();
        totalInvoiced += parseFloat(data.totals?.total || 0);
        if (["pending", "partially_paid"].includes(data.status))
          pendingPayments += parseFloat(data.totals?.due || data.totals?.total || 0);
      });
      let clientCount = 0;
      try {
        const cSnap = await getDocs(collection(db, "users", user.uid, "clients"));
        clientCount = cSnap.docs.length;
      } catch (_) {}
      setStats({ totalInvoices: invoicesSnap.docs.length, totalInvoiced, totalClients: clientCount, pendingPayments, loading: false });
    } catch (e) {
      setStats((p) => ({ ...p, loading: false }));
    }
  };

  // ── Data loaders ──────────────────────────────────────────────────────────
  const loadCustomers = async () => {
    try {
      const q = query(collection(db, "users", user.uid, "clients"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setCustomers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (error) {
      console.error("Error loading customers:", error);
    }
  };

  const loadSavedInvoices = async () => {
    if (!user?.uid) return;
    const db = getFirestore();
    const q = query(collection(db, "users", user.uid, "invoices"), orderBy("createdAt", "desc"), limit(50));
    const snapshot = await getDocs(q);
    setSavedInvoices(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
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
      const invoiceDoc = await getDoc(doc(db, "users", user.uid, "invoices", invoiceId));
      if (invoiceDoc.exists()) {
        const data = invoiceDoc.data();
        setPaymentStatus({ totalPaid: data.totals?.paid || 0, balanceDue: data.totals?.due || data.totals?.total || 0, status: data.status || "pending" });
      } else {
        setPaymentStatus({ totalPaid: 0, balanceDue: total, status: "pending" });
      }
    } catch (error) {
      setPaymentStatus({ totalPaid: 0, balanceDue: total, status: "pending" });
    }
  };

  const loadInvoiceForExport = async () => {
    if (!user?.uid || !invoiceId) return null;
    const db = getFirestore();
    const snap = await getDoc(doc(db, "users", user.uid, "invoices", invoiceId));
    return snap.exists() ? snap.data() : null;
  };

  // ── Handlers – customers ──────────────────────────────────────────────────
  const handleAddNewCustomer = () => { setSelectedCustomer(null); setShowCustomerModal(true); };
  const handleEditCustomer = (customer) => { setSelectedCustomer(customer); setShowCustomerModal(true); };
  const loadCustomer = (customer) => {
    setClientName(customer.name || "");
    setClientEmail(customer.email || "");
    setClientPhone(customer.phone || "");
    setClientAddress(customer.address || "");
    setClientId(customer.customerId || "");
  };
  const handleCustomerSaved = () => { loadCustomers(); };

  // ── Handlers – invoice CRUD ───────────────────────────────────────────────
  const loadInvoice = (invoice) => {
    setInvoiceId(invoice.id);
    setInvoiceNumber(invoice.invoiceNumber || "");
    setClientName(invoice.client?.name || "");
    setClientEmail(invoice.client?.email || "");
    setClientPhone(invoice.client?.phone || "");
    setClientAddress(invoice.client?.address || "");
    setClientId(invoice.client?.clientId || "");
    setPropertyType(invoice.property?.type || "");
    setPropertyAddress(invoice.property?.address || "");
    setPropertySize(invoice.property?.size || "");
    setPropertyBedrooms(invoice.property?.bedrooms || "");
    setPropertyBathrooms(invoice.property?.bathrooms || "");
    setItems(invoice.items || []);
    setShowInvoicesList(false);
    setActiveView("invoice");
  };

  const buildInvoicePayload = (numberToUse) => ({
    invoiceNumber: numberToUse,
    locked: true,
    status: "pending",
    dates: { issueDate: new Date().toISOString(), dueDate: null },
    client: { name: clientName, email: clientEmail, phone: clientPhone, address: clientAddress, clientId },
    property: { type: propertyType, address: propertyAddress, size: propertySize, bedrooms: propertyBedrooms, bathrooms: propertyBathrooms },
    items,
    totals: { subtotal, vat, total, paid: 0, due: total },
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
      await updateDoc(doc(db, "users", user.uid, "invoices", invoiceId), { ...invoiceData, updatedAt: serverTimestamp() });
    } else {
      const ref = await addDoc(collection(db, "users", user.uid, "invoices"), invoiceData);
      setInvoiceId(ref.id);
    }
    alert("Invoice saved and locked");
    loadSavedInvoices();
    fetchStats();
  };

  const handleConvertToInvoice = async () => {
    if (!user?.uid || !invoiceId) { alert("Please save the quote first before converting to invoice"); return; }
    if (!window.confirm("Convert this quote to an invoice?")) return;
    try {
      const db = getFirestore();
      const newInvoiceNumber = await generateInvoiceNumber(user.uid);
      const invoiceData = buildInvoicePayload(newInvoiceNumber);
      invoiceData.documentType = "invoice";
      invoiceData.convertedFromQuote = invoiceId;
      invoiceData.convertedFromQuoteNumber = invoiceNumber;
      invoiceData.convertedAt = serverTimestamp();
      const invoiceRef = await addDoc(collection(db, "users", user.uid, "invoices"), invoiceData);
      await updateDoc(doc(db, "users", user.uid, "invoices", invoiceId), { convertedToInvoice: true, convertedToInvoiceId: invoiceRef.id, convertedToInvoiceNumber: newInvoiceNumber, convertedAt: serverTimestamp(), status: "converted" });
      setDocumentType("invoice");
      setInvoiceId(invoiceRef.id);
      setInvoiceNumber(newInvoiceNumber);
      alert(`Quote successfully converted to Invoice ${newInvoiceNumber}`);
      loadSavedInvoices();
    } catch (error) { alert("Failed to convert quote to invoice"); }
  };

  const handleNewInvoice = () => {
    setInvoiceId(null);
    setInvoiceNumber("");
    setClientName("Sarah Johnson");
    setClientId("CLIENT-2026-5678");
    setClientEmail("sarah.johnson@example.com");
    setClientPhone("0161 234 5678");
    setClientAddress("123 High Street, Manchester, M1 1AB");
    setPropertyType("Residential Sale");
    setPropertyAddress("456 Oak Avenue, Manchester, M2 3CD");
    setPropertySize("2,500 sq ft");
    setPropertyBedrooms("4");
    setPropertyBathrooms("3");
    setItems([]);
    const loadNewNumber = async () => {
      if (user?.uid) { const next = await generateInvoiceNumber(user.uid); setInvoiceNumber(next); }
    };
    loadNewNumber();
  };

  // ── Handlers – line items ─────────────────────────────────────────────────
  const handleAddItem = () => {
    if (!newItem.description || !newItem.qty) return;
    const rate = Number(newItem.rate) || 0;
    const qty = Number(newItem.qty);
    setItems((prev) => [...prev, { description: newItem.description, type: newItem.type || "Service", rate, qty, amount: rate * qty }]);
    setNewItem({ description: "", rate: "", qty: "", type: "Service" });
  };

  // ── Handlers – payment ────────────────────────────────────────────────────
  const handleProcessPayment = async () => {
    if (!invoiceId || !user?.uid) { alert("Please save the invoice before processing payment"); return; }
    try {
      const invoiceDoc = await getDoc(doc(db, "users", user.uid, "invoices", invoiceId));
      if (invoiceDoc.exists()) { setSelectedInvoiceForPayment({ id: invoiceId, ...invoiceDoc.data() }); setShowPaymentModal(true); }
      else { alert("Invoice not found. Please save the invoice first."); }
    } catch (error) { alert("Failed to load invoice for payment"); }
  };
  const handlePaymentComplete = () => { loadSavedInvoices(); loadPaymentStatus(); setShowPaymentModal(false); fetchStats(); };

  // ── Handlers – print / PDF / settings ────────────────────────────────────
  const printStyles = `@media print { body * { visibility: hidden !important; } #print-area, #print-area * { visibility: visible !important; } #print-area { display: block !important; position: absolute !important; left: 0 !important; top: 0 !important; width: 210mm !important; min-height: 297mm !important; margin: 0 !important; padding: 10mm !important; box-sizing: border-box !important; background: white !important; } @page { size: A4 portrait; margin: 0; } html, body { margin: 0 !important; padding: 0 !important; width: 210mm !important; background: white !important; } * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } }`;

  const handlePrint = () => {
    const s = document.createElement("style");
    s.textContent = printStyles;
    document.head.appendChild(s);
    window.print();
    setTimeout(() => document.head.removeChild(s), 1000);
  };

  const handleSavePDF = async () => {
    const saved = await loadInvoiceForExport();
    if (!saved) { alert("Please save the invoice before exporting PDF"); return; }
    setInvoiceNumber(saved.invoiceNumber);
    setItems(saved.items);
    setClientName(saved.client.name);
    setClientEmail(saved.client.email);
    setClientPhone(saved.client.phone);
    setClientAddress(saved.client.address);
    setPropertyType(saved.property.type);
    setPropertyAddress(saved.property.address);
    setTimeout(() => window.print(), 300);
  };

  const handleSaveBusinessInfo = async () => {
    if (!user?.uid) return;
    try {
      const db = getFirestore();
      await setDoc(doc(db, "users", user.uid, "settings", "businessInfo"), businessInfo);
      alert("Business information saved successfully!");
      setShowSettings(false);
    } catch (error) { alert("Failed to save business information"); }
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

  const handleLogout = async () => {
    try { await signOut(getAuth()); } catch (error) { console.error("Error logging out:", error); }
  };

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
    propertyType,
    propertySize,
    propertyBedrooms,
    propertyBathrooms,
    propertyAddress,
    items,
    subtotal,
    vat,
    total,
    documentType: "realestate",
    serviceType: "REAL ESTATE",
    currency: "£",
    locale: "en-GB",
    showStamp: stampSettings.enabled,
    stampText: stampSettings.text,
    stampColor: stampSettings.color,
    showStampDate: stampSettings.showDate,
  };

  // ── Header actions ────────────────────────────────────────────────────────
  const headerActions = [
    documentType === "quote" && invoiceId && {
      label: "Convert to Invoice", icon: FileText, onClick: handleConvertToInvoice,
      className: "flex items-center gap-1.5 px-3 py-1.5 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm font-medium rounded-md transition-colors whitespace-nowrap",
    },
    { label: "Preview", icon: Eye, onClick: () => setShowPreview(true), className: "flex items-center gap-1.5 px-3 py-1.5 bg-[#0f172a] hover:bg-[#1e293b] text-white text-sm font-medium rounded-md transition-colors whitespace-nowrap" },
    { label: "Print", icon: Printer, onClick: handlePrint, variant: "secondary" },
    { label: "New", icon: Plus, onClick: handleNewInvoice, className: "flex items-center gap-1.5 px-3 py-1.5 bg-[#059669] hover:bg-[#047857] text-white text-sm font-medium rounded-md transition-colors whitespace-nowrap" },
    { label: "Send", icon: Send, className: "flex items-center gap-1.5 px-3 py-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium rounded-md transition-colors whitespace-nowrap" },
    { label: "Save PDF", icon: Download, onClick: handleSavePDF, className: "flex items-center gap-1.5 px-3 py-1.5 bg-[#0891b2] hover:bg-[#0e7490] text-white text-sm font-medium rounded-md transition-colors whitespace-nowrap" },
    { label: "Save", icon: Save, onClick: handleSaveInvoice, className: "flex items-center gap-1.5 px-3 py-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium rounded-md transition-colors whitespace-nowrap" },
   
  ].filter(Boolean);

  const mobileDashboardActions = [
    documentType === "quote" && invoiceId && {
      label: "To Invoice", icon: FileText, onClick: handleConvertToInvoice,
      className: "flex items-center gap-1.5 px-3 py-2 bg-[#7c3aed] text-white rounded-md text-xs font-medium active:scale-95 whitespace-nowrap",
    },
    { label: "Save", icon: Save, onClick: handleSaveInvoice, className: "flex items-center gap-1.5 px-3 py-2 bg-[#2563eb] text-white rounded-md text-xs font-medium active:scale-95 whitespace-nowrap" },
    { label: "Send", icon: Send, className: "flex items-center gap-1.5 px-3 py-2 bg-[#059669] text-white rounded-md text-xs font-medium active:scale-95 whitespace-nowrap" },
    { label: "PDF", icon: Download, onClick: handleSavePDF, className: "flex items-center gap-1.5 px-3 py-2 bg-[#0891b2] text-white rounded-md text-xs font-medium active:scale-95 whitespace-nowrap" },
    { label: "Print", icon: Printer, onClick: handlePrint, className: "flex items-center gap-1.5 px-3 py-2 bg-white border border-[#e2e8f0] text-[#374151] rounded-md text-xs font-medium active:scale-95 whitespace-nowrap" },
  ].filter(Boolean);

  // ── Home view ─────────────────────────────────────────────────────────────
  const HomeViewLocal = () => (
    <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="Invoices" value={stats.totalInvoices} icon={FileText} iconBg="bg-[#eff6ff]" iconColor="text-[#2563eb]" subtitle="All time" loading={stats.loading} trend={12} />
        <StatCard title="Revenue" value={formatCurrency(stats.totalInvoiced)} icon={TrendingUp} iconBg="bg-[#f0fdf4]" iconColor="text-[#059669]" subtitle="Total invoiced" loading={stats.loading} trend={8} />
        <StatCard title="Clients" value={stats.totalClients} icon={Users} iconBg="bg-[#fff7ed]" iconColor="text-[#ea580c]" subtitle="Active" loading={stats.loading} />
        <StatCard title="Properties" value="—" icon={Building2} iconBg="bg-[#faf5ff]" iconColor="text-[#7c3aed]" subtitle="Listed" loading={stats.loading} />
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
                <p className="text-xs text-[#94a3b8]">Outstanding invoices</p>
              </>
            )}
          </div>
        </div>

        <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-widest mb-3">Quick Actions</p>
          <div className="flex flex-col sm:flex-row gap-2">
            {[
              { label: "New Invoice", icon: FileText, onClick: () => { handleNewInvoice(); setActiveView("invoice"); }, bg: "bg-[#eff6ff]", hover: "hover:bg-[#dbeafe]", border: "border-[#bfdbfe]", iconBg: "bg-[#2563eb]", text: "text-[#1e40af]" },
              { label: "Clients", icon: Users, onClick: () => setShowCustomersListModal(true), bg: "bg-[#f0fdf4]", hover: "hover:bg-[#dcfce7]", border: "border-[#bbf7d0]", iconBg: "bg-[#059669]", text: "text-[#166534]" },
              { label: "Properties", icon: Building2, onClick: () => {}, bg: "bg-[#faf5ff]", hover: "hover:bg-[#ede9fe]", border: "border-[#ddd6fe]", iconBg: "bg-[#7c3aed]", text: "text-[#5b21b6]" },
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

      {/* Recent invoices */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#e2e8f0] bg-[#f8fafc]">
          <h3 className="text-sm font-semibold text-[#1e293b]">Recent Invoices</h3>
          <button onClick={() => setShowInvoicesList(true)} className="text-xs text-[#2563eb] hover:text-[#1d4ed8] font-medium">View all</button>
        </div>
        <div className="divide-y divide-[#f1f5f9]">
          {stats.loading ? (
            [1, 2, 3].map((i) => <div key={i} className="h-14 bg-[#f8fafc] animate-pulse m-3 rounded-lg" />)
          ) : savedInvoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-10 h-10 mb-3 bg-[#f1f5f9] rounded-full flex items-center justify-center">
                <FileText className="w-5 h-5 text-[#94a3b8]" />
              </div>
              <p className="text-sm font-medium text-[#374151] mb-1">No invoices yet</p>
              <p className="text-xs text-[#94a3b8] mb-3">Create your first invoice to get started</p>
              <button onClick={() => { handleNewInvoice(); setActiveView("invoice"); }} className="px-4 py-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-lg text-xs font-medium transition-colors">
                Create Invoice
              </button>
            </div>
          ) : (
            savedInvoices.slice(0, 8).map((invoice) => (
              <div key={invoice.id} onClick={() => loadInvoice(invoice)} className="flex items-center justify-between px-5 py-3.5 hover:bg-[#f8fafc] cursor-pointer transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-[#1e293b] truncate">{invoice.invoiceNumber || invoice.id}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold flex-shrink-0 ${statusBadge(invoice.status)}`}>
                      {invoice.status === "partially_paid" ? "Partial" : invoice.status || "Draft"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[#64748b]">
                    <span className="flex items-center gap-1 truncate"><Users className="w-3 h-3 flex-shrink-0" />{invoice.client?.name || "No client"}</span>
                    <span className="flex items-center gap-1 truncate"><Building2 className="w-3 h-3 flex-shrink-0" />{invoice.property?.type || "No property"}</span>
                  </div>
                </div>
                <div className="text-right ml-4 flex-shrink-0">
                  <div className="text-sm font-bold text-[#1e293b]">{formatCurrency(invoice.totals?.total || 0)}</div>
                  {invoice.totals?.due > 0 && invoice.totals?.due < invoice.totals?.total && (
                    <div className="text-xs text-[#d97706]">Due: {formatCurrency(invoice.totals.due)}</div>
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
      <div id="print-area" className="hidden print:block bg-white" style={{ width: "210mm", minHeight: "297mm" }}>
        <TemplateRenderer {...templateProps} />
      </div>
        {showAIWindow && (
                <AIInvoiceWindow
                  user={user}
                  businessInfo={businessInfo}
                  documentType={documentType}
                  onExit={() => setShowAIWindow(false)}
                  industry="realestate"
                  TemplateRenderer={TemplateRenderer}
                />
              )}
      <div className="flex-1 flex overflow-hidden min-h-0">
      <RealEstateSidebar
  user={user}
  activeView={activeView}
  setActiveView={setActiveView}
  sidebarOpen={sidebarOpen}
  setSidebarOpen={setSidebarOpen}
  stats={stats}
  businessInfo={businessInfo}
  savedInvoices={savedInvoices}
  savedCustomers={savedCustomers}
  showInvoicesList={showInvoicesList}
  setShowInvoicesList={setShowInvoicesList}
  setShowSettings={setShowSettings}
  setShowCustomersListModal={setShowCustomersListModal}
  handleNewInvoice={handleNewInvoice}
  handleAddNewCustomer={handleAddNewCustomer}
  handleLogout={handleLogout} 
  newRequestCount={0}  
/>

        {/* ── Main content ──────────────────────────────────────────────────── */}
        <div className={`flex-1 overflow-hidden flex flex-col min-h-0 transition-all duration-300 ${sidebarOpen ? "ml-0 lg:ml-4" : "ml-0 md:ml-8"}`}>
          <AppHeader actions={headerActions} mobileActions={mobileDashboardActions} onSettingsOpen={() => setShowSettings(true)} />

          {/* ── Modals ────────────────────────────────────────────────────── */}
           {showSettings && (
            <BusinessSettingsModal onClose={() => setShowSettings(false)} />
          )}
          <CustomersListModal showModal={showCustomersListModal} setShowModal={setShowCustomersListModal} customers={customers} onLoadCustomer={loadCustomer} onEditCustomer={handleEditCustomer} onAddNewCustomer={handleAddNewCustomer} />
          <CustomerModal showModal={showCustomerModal} setShowModal={setShowCustomerModal} existingCustomer={selectedCustomer} onCustomerSaved={handleCustomerSaved} />

          {/* ── Invoices list modal ───────────────────────────────────────── */}
          {showInvoicesList && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden border border-[#e2e8f0]">
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0] bg-[#f8fafc]">
                  <div>
                    <h2 className="text-base font-semibold text-[#1e293b]">All Invoices</h2>
                    <p className="text-xs text-[#64748b] mt-0.5">{savedInvoices.length} records</p>
                  </div>
                  <button onClick={() => setShowInvoicesList(false)} className="p-1.5 text-[#64748b] hover:text-[#1e293b] hover:bg-[#e2e8f0] rounded-lg transition-all"><X className="w-4 h-4" /></button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {savedInvoices.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <Receipt className="w-10 h-10 text-[#cbd5e1] mb-3" />
                      <p className="text-sm text-[#94a3b8]">No invoices found</p>
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead>
                        <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                          {["Number", "Client", "Property", "Total", "Date", "Status"].map((h) => (
                            <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wide">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {savedInvoices.map((invoice) => (
                          <tr key={invoice.id} onClick={() => { loadInvoice(invoice); setShowInvoicesList(false); }} className="border-b border-[#f1f5f9] hover:bg-[#f8fafc] cursor-pointer transition-colors">
                            <td className="px-5 py-3 text-sm font-semibold text-[#2563eb]">{invoice.invoiceNumber || "N/A"}</td>
                            <td className="px-5 py-3 text-sm text-[#374151]">{invoice.client?.name || "N/A"}</td>
                            <td className="px-5 py-3 text-sm text-[#374151]">{invoice.property?.type || "N/A"}</td>
                            <td className="px-5 py-3 text-sm font-semibold text-[#1e293b]">{formatCurrency(invoice.totals?.total || 0)}</td>
                            <td className="px-5 py-3 text-sm text-[#374151]">{invoice.dates?.issueDate ? new Date(invoice.dates.issueDate).toLocaleDateString("en-GB") : "N/A"}</td>
                            <td className="px-5 py-3">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${statusBadge(invoice.status)}`}>
                                {invoice.status === "partially_paid" ? "Partial" : invoice.status || "Pending"}
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

          {/* ── Preview modal ──────────────────────────────────────────────── */}
          {showPreview && (
            <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#e2e8f0] bg-[#f8fafc] flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-[#0f172a] rounded-lg flex items-center justify-center"><Eye className="w-4 h-4 text-white" /></div>
                    <div>
                      <h2 className="text-sm font-semibold text-[#1e293b]">Invoice Preview</h2>
                      <p className="text-xs text-[#64748b]">{invoiceNumber || "Draft"}</p>
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
         {activeView === "financial-overview" && (
                     <div className="flex-1 overflow-y-auto p-4">
                       <FinancialOverview user={user} />
                     </div>
                   )}
          {/* ── Views ─────────────────────────────────────────────────────── */}
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
 {activeView === "properties" && <Properties user={user} />}
{activeView === "listings" && <Listings user={user} />}
{activeView === "commissions" && <Commissions user={user} />}
{activeView === "reports" && <Reports user={user} />}
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
          {/* ── Invoice builder ────────────────────────────────────────────── */}
          {activeView === "invoice" && (
            <div className="flex-1 overflow-hidden flex min-h-0">
              {/* ── LEFT: Form panel ─────────────────────────────────────── */}
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
                  {invoiceId && (
                    <div className={`px-5 py-3.5 rounded-xl border flex items-center justify-between ${paymentStatus.status === "paid" ? "bg-[#f0fdf4] border-[#bbf7d0]" : paymentStatus.status === "partially_paid" ? "bg-[#fffbeb] border-[#fde68a]" : "bg-[#fff7ed] border-[#fed7aa]"}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${paymentStatus.status === "paid" ? "bg-[#dcfce7]" : paymentStatus.status === "partially_paid" ? "bg-[#fef3c7]" : "bg-[#ffedd5]"}`}>
                          <CreditCard className={`w-4 h-4 ${paymentStatus.status === "paid" ? "text-[#059669]" : paymentStatus.status === "partially_paid" ? "text-[#d97706]" : "text-[#ea580c]"}`} />
                        </div>
                        <div className={`text-sm font-semibold ${paymentStatus.status === "paid" ? "text-[#166534]" : paymentStatus.status === "partially_paid" ? "text-[#92400e]" : "text-[#9a3412]"}`}>
                          {paymentStatus.status === "paid" ? "Invoice Fully Paid" : paymentStatus.status === "partially_paid" ? `${formatCurrency(paymentStatus.totalPaid)} paid · ${formatCurrency(paymentStatus.balanceDue)} remaining` : `Payment Pending — ${formatCurrency(paymentStatus.balanceDue)} due`}
                        </div>
                      </div>
                      {paymentStatus.status !== "paid" && (
                        <button onClick={handleProcessPayment} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#e2e8f0] text-[#374151] text-sm font-medium rounded-lg hover:bg-[#f8fafc] transition-colors shadow-sm">
                          <CreditCard className="w-4 h-4" />Record Payment
                        </button>
                      )}
                    </div>
                  )}

                  {/* Main card – RealEstateMultiStepForm */}
                  <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
                    <RealEstateMultiStepForm
                      clientName={clientName} setClientName={setClientName}
                      clientId={clientId} setClientId={setClientId}
                      clientEmail={clientEmail} setClientEmail={setClientEmail}
                      clientPhone={clientPhone} setClientPhone={setClientPhone}
                      clientAddress={clientAddress} setClientAddress={setClientAddress}
                      propertyType={propertyType} setPropertyType={setPropertyType}
                      propertySize={propertySize} setPropertySize={setPropertySize}
                      propertyBedrooms={propertyBedrooms} setPropertyBedrooms={setPropertyBedrooms}
                      propertyBathrooms={propertyBathrooms} setPropertyBathrooms={setPropertyBathrooms}
                      propertyAddress={propertyAddress} setPropertyAddress={setPropertyAddress}
                      items={items} setItems={setItems}
                      newItem={newItem} setNewItem={setNewItem}
                      handleAddItem={handleAddItem}
                    />
                  </div>

                

                  {invoiceId && (
                    <button onClick={handleProcessPayment} className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-[#059669] hover:bg-[#047857] text-white rounded-xl font-medium transition-colors shadow-sm">
                      <CreditCard className="w-4 h-4" />Process Payment
                    </button>
                  )}
                  {!invoiceId && (
                    <div className="flex items-center gap-2 px-4 py-3 bg-[#fff7ed] border border-[#fed7aa] rounded-lg text-sm text-[#9a3412]">
                      <Receipt className="w-4 h-4 flex-shrink-0" />Save the invoice first to process payment
                    </div>
                  )}
                </div>
              </div>

              {/* ── RIGHT: Live preview panel (xl only) ─────────────────────── */}
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

export default RealEstateDashboard;
