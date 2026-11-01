import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import HomeView from "../HomeView";
import SolidFloAgent from "../../components/SolidFloAgent/SolidFloAgent";
import BusinessSettingsModal from "../BusinessSettingsModal";
import AppHeader from "../AppHeader";
import StampPaywallModal from "../StampPaywallModal";
import StampSignatureModal from "../StampSignatureModal";
import { POTemplateRenderer } from "../Purchaseordertemplates";
import SubUserManagement from "../SubUserManagement";
import { serverTimestamp } from "firebase/firestore";
import logo from "../../assets/img/solidflo-logo.png";
import { usePermissions } from "../../hooks/usePermissions";
import Templates from "./Templates";
import ServiceMarketplaceView from "../ServiceMarketplaceView";
import ServiceRequestsView from "../ServiceRequestsView";
import PurchaseOrders from "../PurchaseOrders";
import { useLocation } from "react-router-dom";
import AIInvoiceWindow from "../AIInvoiceWindow";
import TemplateSelector, { TemplateRenderer } from "./TemplateSelector";
import { getAuth, signOut } from "firebase/auth";
import SignatureStamp from "../SignatureStamp";
import StampOverlay, { AllPagesStampOverlay } from "../StampOverlay";
import TechnologyMultiStepForm from "./TechnologyMultiStepForm";
import TechnologySidebar from "./TechnologySidebar";
import DeploymentsView from "./DeploymentsView";
import DomainsView from "./DomainsView";
import DatabasesView from "./DatabasesView";
import IntegrationsView from "./IntegrationsView";
import { getFunctions, httpsCallable } from "firebase/functions";
import {
  getFirestore,
  collection,
  query,
  addDoc,
  updateDoc,
  doc,
  where,
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
  Stamp,
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
  Lock,
} from "lucide-react";

// ── Plan gating – import from the separate planGating.js file ────────────────
import {
  PlanProvider,
  usePlan,
  UpgradeModal,
  PLANS,
  PLAN_ORDER,
} from "./planGating";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
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
  return `INV-${year}-${String(lastNumber + 1).padStart(4, "0")}`;
};

const functions = getFunctions();

// ─────────────────────────────────────────────────────────────────────────────
// Small plan badge shown in sidebar/header
// ─────────────────────────────────────────────────────────────────────────────
const PlanBadge = () => {
  const { currentPlan } = usePlan();
  const colours = {
    starter: {
      bg: "rgba(100,116,139,0.25)",
      text: "#94a3b8",
      border: "rgba(100,116,139,0.3)",
    },
    growth: {
      bg: "rgba(201,168,76,0.18)",
      text: "#C9A84C",
      border: "rgba(201,168,76,0.4)",
    },
    elite: {
      bg: "rgba(139,92,246,0.18)",
      text: "#a78bfa",
      border: "rgba(139,92,246,0.4)",
    },
  };
  const c = colours[currentPlan] ?? colours.starter;
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        padding: "2px 8px",
        borderRadius: 99,
        border: `1px solid ${c.border}`,
        background: c.bg,
        color: c.text,
        whiteSpace: "nowrap",
      }}
    >
      {PLANS[currentPlan]?.label ?? currentPlan}
    </span>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Gated sidebar item – shows a lock icon if the user lacks access
// ─────────────────────────────────────────────────────────────────────────────
const SidebarItem = ({
  icon: Icon,
  label,
  featureKey,
  featureLabel,
  onClick,
  children,
  className = "",
}) => {
  const { canAccess, requirePlan } = usePlan();
  const locked = !canAccess(featureKey);

  const handleClick = () => {
    requirePlan(featureKey, onClick, featureLabel ?? label);
  };

  return (
    <div
      onClick={handleClick}
      className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 ${
        locked
          ? "text-slate-500 hover:bg-slate-700/30"
          : "text-slate-300 hover:text-white hover:bg-slate-700/50"
      } ${className}`}
    >
      <div className="flex items-center space-x-3">
        <Icon className="w-5 h-5" />
        <span className="text-sm font-medium">{label}</span>
      </div>
      {locked ? (
        <Lock className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
      ) : (
        children
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Inner dashboard – consumes the plan context
// ─────────────────────────────────────────────────────────────────────────────
const TechnologyDashboardInner = () => {
  const { requirePlan, canAccess, currentPlan } = usePlan();
  const mobileNavPad = "pb-24 lg:pb-6";
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
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] =
    useState(null);
  const [showStampModal, setShowStampModal] = useState(false);
  const [stampConfig, setStampConfig] = useState(null);
  const { can, isAdmin } = usePermissions();
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [isInvoicingOpen, setIsInvoicingOpen] = useState(false);
  const [isClientsOpen, setIsClientsOpen] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showAIWindow, setShowAIWindow] = useState(false);
  const [savedProjects, setSavedProjects] = useState([]);
  const [savedClients, setSavedClients] = useState([]);
  const [showProjectsList, setShowProjectsList] = useState(false);
  const [showClientsModal, setShowClientsModal] = useState(false);
  const [stampSettings, setStampSettings] = useState({
    text: "APPROVED",
    color: "#d32f2f",
    showDate: false,
    enabled: false,
  });
  const [paymentStatus, setPaymentStatus] = useState({
    totalPaid: 0,
    balanceDue: 0,
    status: "pending",
  });

  const [customerName, setCustomerName] = useState("Sarah Johnson");
  const [customerId, setCustomerId] = useState("CUST-2026-5678");
  const [customerEmail, setCustomerEmail] = useState(
    "sarah.johnson@example.com",
  );
  const [customerPhone, setCustomerPhone] = useState("082 456 7890");
  const [customerAddress, setCustomerAddress] = useState(
    "456 Oak Avenue, Johannesburg, 2000",
  );
  const [projectDate, setProjectDate] = useState("2026-06-15");
  const [projectName, setProjectName] = useState("Website Redesign");
  const [projectScope, setProjectScope] = useState(
    "Full-stack development & deployment",
  );

  const [businessInfo, setBusinessInfo] = useState({
    businessName: "PERFECT MOMENTS TECHNOLOGY",
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
    type: "Technology",
  });
  const handleAddNewClient = () => {
    setShowClientsModal(true);
  };
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const vat = subtotal * 0.15;
  const total = subtotal + vat;

  const location = useLocation();

  const templateProps = {
    templateId: selectedTemplate,
    businessInfo,
    loading,
    jobCardNumber: invoiceNumber,
    customerName,
    customerEmail,
    customerPhone,
    customerAddress,
    projectName,
    projectDate,
    projectScope,
    documentType,
    items,
    subtotal,
    vat,
    total,
    serviceType: "TECHNOLOGY",
    showStamp: stampSettings?.enabled || false,
    stampText: stampSettings?.text || "APPROVED",
    stampColor: stampSettings?.color || "#d32f2f",
    showStampDate: stampSettings?.showDate || false,
    stampConfig,
  };
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "projects"), where("uid", "==", user.uid));
    getDocs(q).then((snap) =>
      setSavedProjects(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    );
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "clients"), where("uid", "==", user.uid));
    getDocs(q).then((snap) =>
      setSavedClients(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    );
  }, [user]);
  // ── Effects ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user?.uid) return;
    generateInvoiceNumber(user.uid).then(setInvoiceNumber);
    loadSavedInvoices();
  }, [user]);

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    if (location.state?.activeView) setActiveView(location.state.activeView);
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
    const handleResize = () => setSidebarOpen(window.innerWidth >= 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ── Data loaders ───────────────────────────────────────────────────────────
  const loadCustomers = async () => {
    try {
      const q = query(
        collection(db, "customers"),
        orderBy("createdAt", "desc"),
      );
      const snap = await getDocs(q);
      setCustomers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error("Error loading customers:", e);
    }
  };

  const loadSavedInvoices = async () => {
    if (!user?.uid) return;
    const db = getFirestore();
    const q = query(
      collection(db, "users", user.uid, "invoices"),
      orderBy("createdAt", "desc"),
      limit(50),
    );
    const snap = await getDocs(q);
    setSavedInvoices(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  const loadSavedCustomers = async () => {
    if (!user?.uid) return;
    const db = getFirestore();
    const q = query(
      collection(db, "users", user.uid, "clients"),
      orderBy("createdAt", "desc"),
      limit(50),
    );
    const snap = await getDocs(q);
    setSavedCustomers(
      snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((c) => !c._placeholder),
    );
  };

  const loadBusinessInfo = async () => {
    if (!user?.uid) return;
    try {
      const db = getFirestore();
      const docSnap = await getDoc(
        doc(db, "users", user.uid, "settings", "businessInfo"),
      );
      if (docSnap.exists()) setBusinessInfo(docSnap.data());
    } catch (e) {
      console.error("Error loading business info:", e);
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
        const data = snap.data();
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
    } catch (e) {
      console.error("Error loading payment status:", e);
      setPaymentStatus({ totalPaid: 0, balanceDue: total, status: "pending" });
    }
  };

  const loadInvoiceForExport = async () => {
    if (!user?.uid || !invoiceId) return null;
    const snap = await getDoc(
      doc(getFirestore(), "users", user.uid, "invoices", invoiceId),
    );
    return snap.exists() ? snap.data() : null;
  };

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleAddNewCustomer = () => {
    setSelectedCustomer(null);
    setShowCustomerModal(true);
  };
  const handleEditCustomer = (c) => {
    setSelectedCustomer(c);
    setShowCustomerModal(true);
  };
  const handleCustomerSaved = () => loadCustomers();

  const loadCustomer = (customer) => {
    setCustomerName(customer.name || "");
    setCustomerEmail(customer.email || "");
    setCustomerPhone(customer.phone || "");
    setCustomerAddress(customer.address || "");
    setCustomerId(customer.customerId || "");
  };

  const loadInvoice = (invoice) => {
    setInvoiceId(invoice.id);
    setInvoiceNumber(invoice.invoiceNumber || "");
    setDocumentType(invoice.documentType || "invoice");
    setCustomerName(invoice.customer?.name || "");
    setCustomerEmail(invoice.customer?.email || "");
    setCustomerPhone(invoice.customer?.phone || "");
    setCustomerAddress(invoice.customer?.address || "");
    setCustomerId(invoice.customer?.customerId || "");
    setProjectDate(invoice.project?.date || "");
    setProjectName(invoice.project?.name || "");
    setProjectScope(invoice.project?.scope || "");
    setItems(invoice.items || []);
    setShowInvoicesList(false);
  };

  const buildInvoicePayload = (numberToUse) => ({
    invoiceNumber: numberToUse,
    documentType, // ← carries "quote" or "invoice"
    locked: true,
    status: documentType === "quote" ? "draft" : "pending",
    dates: { invoiceDate: new Date().toISOString(), dueDate: null },
    customer: {
      name: customerName,
      email: customerEmail,
      phone: customerPhone,
      address: customerAddress,
      customerId,
    },
    project: { date: projectDate, name: projectName, scope: projectScope },
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
    const payload = buildInvoicePayload(numberToUse);
    if (invoiceId) {
      await updateDoc(doc(db, "users", user.uid, "invoices", invoiceId), {
        ...payload,
        updatedAt: serverTimestamp(),
      });
    } else {
      const r = await addDoc(
        collection(db, "users", user.uid, "invoices"),
        payload,
      );
      setInvoiceId(r.id);
    }
    alert("Invoice saved successfully");
    loadSavedInvoices();
  };

  const handleConvertToInvoice = async () => {
    if (!user?.uid || !invoiceId) {
      alert("Please save the quote first.");
      return;
    }
    if (!window.confirm("Convert this quote to an invoice?")) return;
    try {
      const db = getFirestore();
      const newNum = await generateInvoiceNumber(user.uid);
      const payload = {
        ...buildInvoicePayload(newNum),
        documentType: "invoice",
        convertedFromQuote: invoiceId,
        convertedFromQuoteNumber: invoiceNumber,
        convertedAt: serverTimestamp(),
      };
      const invoiceRef = await addDoc(
        collection(db, "users", user.uid, "invoices"),
        payload,
      );
      await updateDoc(doc(db, "users", user.uid, "quotes", invoiceId), {
        convertedToInvoice: true,
        convertedToInvoiceId: invoiceRef.id,
        convertedToInvoiceNumber: newNum,
        convertedAt: serverTimestamp(),
        status: "converted",
      });
      setDocumentType("invoice");
      setInvoiceId(invoiceRef.id);
      setInvoiceNumber(newNum);
      alert(`Converted to Invoice ${newNum}`);
      loadSavedInvoices();
    } catch (e) {
      console.error(e);
      alert("Failed to convert.");
    }
  };

  const handleProcessPayment = async () => {
    if (!invoiceId || !user?.uid) {
      alert("Please save the invoice first.");
      return;
    }
    try {
      const col = documentType === "estimate" ? "estimates" : "invoices";
      const snap = await getDoc(doc(db, "users", user.uid, col, invoiceId));
      if (snap.exists()) {
        setSelectedInvoiceForPayment({ id: invoiceId, ...snap.data() });
        setShowPaymentModal(true);
      } else alert("Invoice not found.");
    } catch (e) {
      console.error(e);
      alert("Failed to load invoice.");
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
    setCustomerName("");
    setCustomerId("");
    setCustomerEmail("");
    setCustomerPhone("");
    setCustomerAddress("");
    setProjectDate(new Date().toISOString().split("T")[0]);
    setProjectName("");
    setProjectScope("");
    setItems([]);
    if (user?.uid) generateInvoiceNumber(user.uid).then(setInvoiceNumber);
  };

  const handleAddItem = () => {
    if (!newItem.description || !newItem.qty) return;
    const rate = Number(newItem.rate) || 0;
    const qty = Number(newItem.qty);
    setItems((prev) => [
      ...prev,
      {
        description: newItem.description,
        type: newItem.type || "Technology",
        rate,
        qty,
        amount: rate * qty,
      },
    ]);
    setNewItem({ description: "", rate: "", qty: "", type: "Technology" });
  };

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
      alert("Logo uploaded!");
    } catch (e) {
      console.error(e);
      alert("Failed to upload logo: " + e.message);
      setBusinessInfo((prev) => ({ ...prev, uploading: false }));
    }
  };

  const handleSaveBusinessInfo = async () => {
    if (!user?.uid) return;
    try {
      await setDoc(
        doc(getFirestore(), "users", user.uid, "settings", "businessInfo"),
        businessInfo,
      );
      alert("Business information saved!");
      setShowSettings(false);
    } catch (e) {
      console.error(e);
      alert("Failed to save.");
    }
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
      alert("Please save the invoice before exporting PDF");
      return;
    }
    setInvoiceNumber(saved.invoiceNumber);
    setItems(saved.items);
    setCustomerName(saved.customer.name);
    setCustomerEmail(saved.customer.email);
    setCustomerPhone(saved.customer.phone);
    setCustomerAddress(saved.customer.address);
    setProjectDate(saved.project?.date || "");
    setProjectName(saved.project?.name || "");
    setProjectScope(saved.project?.scope || "");
    setTimeout(() => window.print(), 300);
  };

  const handleAIDataExtracted = (data) => {
    if (data.customer?.name) setCustomerName(data.customer.name);
    if (data.customer?.email) setCustomerEmail(data.customer.email);
    if (data.customer?.phone) setCustomerPhone(data.customer.phone);
    if (data.customer?.address) setCustomerAddress(data.customer.address);
    if (data.customer?.customerId) setCustomerId(data.customer.customerId);
    if (data.project?.date) setProjectDate(data.project.date);
    if (data.project?.name) setProjectName(data.project.name);
    if (data.project?.scope) setProjectScope(data.project.scope);
    if (data.items?.length > 0) setItems(data.items);
    alert("✅ AI data populated!");
  };

  const handleLogout = async () => {
    try {
      await signOut(getAuth());
    } catch (e) {
      console.error(e);
    }
  };

  // ── Header actions with plan gating ───────────────────────────────────────
  const headerActions = [
    documentType === "quote" &&
      invoiceId && {
        label: "Convert to Invoice",
        icon: FileText,
        onClick: () =>
          requirePlan(
            "convertToInvoice",
            handleConvertToInvoice,
            "Convert to Invoice",
          ),
        className:
          "flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-sm font-semibold rounded-lg hover:from-purple-700 transition-colors shadow-sm whitespace-nowrap",
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
      onClick: () =>
        requirePlan(
          "previewInvoice",
          () => setShowPreview(true),
          "Invoice Preview",
        ),
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
      onClick: handleNewInvoice,
      className:
        "flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-sm font-semibold rounded-lg hover:from-emerald-700 transition-colors shadow-sm whitespace-nowrap",
    },
    {
      label: "Send",
      icon: Send,
      onClick: () =>
        requirePlan(
          "sendInvoice",
          () => {
            /* send logic */
          },
          "Send Invoice",
        ),
      className:
        "flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold rounded-lg hover:from-blue-700 transition-colors shadow-sm whitespace-nowrap",
    },
    {
      label: "Save PDF",
      icon: Download,
      onClick: () => requirePlan("savePDF", handleSavePDF, "Save PDF"),
      className:
        "flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-600 to-orange-700 text-white text-sm font-semibold rounded-lg hover:from-orange-700 transition-colors shadow-sm whitespace-nowrap",
    },
    {
      label: "Save",
      icon: Save,
      onClick: handleSaveInvoice,
      className:
        "flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-violet-600 to-violet-700 text-white text-sm font-semibold rounded-lg hover:from-violet-700 transition-colors shadow-sm whitespace-nowrap",
    },
    {
      label: "Logout",
      icon: LogOut,
      onClick: handleLogout,
      className:
        "flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-semibold rounded-lg hover:from-red-700 transition-colors shadow-sm whitespace-nowrap",
    },
  ].filter(Boolean);

  const mobileDashboardActions = [
    documentType === "quote" &&
      invoiceId && {
        label: "To Invoice",
        icon: FileText,
        onClick: () =>
          requirePlan(
            "convertToInvoice",
            handleConvertToInvoice,
            "Convert to Invoice",
          ),
        className:
          "flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg text-xs font-semibold shadow-lg transition-all active:scale-95 whitespace-nowrap",
      },
    {
      label: "Save",
      icon: Save,
      onClick: handleSaveInvoice,
      className:
        "flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-violet-600 to-violet-700 text-white rounded-lg text-xs font-semibold shadow-lg transition-all active:scale-95 whitespace-nowrap",
    },
    {
      label: "Send",
      icon: Send,
      onClick: () => requirePlan("sendInvoice", () => {}, "Send Invoice"),
      className:
        "flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-xs font-semibold shadow-lg transition-all active:scale-95 whitespace-nowrap",
    },
    {
      label: "PDF",
      icon: Download,
      onClick: () => requirePlan("savePDF", handleSavePDF, "Save PDF"),
      className:
        "flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg text-xs font-semibold shadow-lg transition-all active:scale-95 whitespace-nowrap",
    },
    {
      label: "Print",
      icon: Printer,
      onClick: handlePrint,
      className:
        "flex items-center gap-1.5 px-3 py-2 bg-white border-2 border-slate-200 text-slate-700 rounded-lg text-xs font-semibold shadow-sm transition-all active:scale-95 whitespace-nowrap",
    },
  ].filter(Boolean);

  return (
    <div className="h-screen w-full overflow-hidden flex flex-col bg-[#f0f2f5]">
      {/* Print area */}
      <div
        id="print-area"
        className="hidden print:block bg-white"
        style={{ width: "210mm", minHeight: "297mm" }}
      >
        {activeView === "purchase-orders" ? (
          <div id="po-printable" style={{ position: "relative" }}>
            <StampOverlay
              stampConfig={stampConfig}
              pageNumber={1}
              businessInfo={businessInfo}
            />
          </div>
        ) : (
          <div id="invoice-printable" style={{ position: "relative" }}>
            <TemplateRenderer {...templateProps} />
            <StampOverlay
              stampConfig={stampConfig}
              pageNumber={1}
              businessInfo={businessInfo}
            />
          </div>
        )}
        {documentType === "jobcard" && (
          <div
            id="jobcard-printable"
            style={{
              pageBreakBefore: "always",
              breakBefore: "page",
              padding: "40px 0",
              boxSizing: "border-box",
              width: "210mm",
            }}
          ></div>
        )}
      </div>
      {showAIWindow && (
        <AIInvoiceWindow
          user={user}
          businessInfo={businessInfo}
          documentType={documentType}
          onExit={() => setShowAIWindow(false)}
          onNavigateTo={(view) => {
            setActiveView(view);
          }}
          industry="mechanics"
          TemplateRenderer={TemplateRenderer}
        />
      )}
      <div className="flex-1 flex overflow-hidden min-h-0 md:gap-3">
        <TechnologySidebar
          user={user} // from AuthContext
          activeView={activeView}
          setActiveView={setActiveView}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          setShowSettings={setShowSettings}
          handleLogout={handleLogout}
          businessInfo={businessInfo} // { name, logoUrl }
          savedProjects={savedProjects} // array
          savedClients={savedClients} // array
          showProjectsList={showProjectsList}
          setShowProjectsList={setShowProjectsList}
          setShowClientsModal={setShowClientsModal}
          handleAddNewClient={handleAddNewClient}
          newRequestCount={0}
        />
        {/* ── Main Content Area ────────────────────────────────────────────── */}

        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          <AppHeader
            actions={headerActions}
            mobileActions={mobileDashboardActions}
            onSettingsOpen={() => setShowSettings(true)}
          />

          <div className="flex-1 overflow-y-auto">
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
            {showStampModal && (
              <StampSignatureModal
                isOpen={showStampModal}
                onClose={() => setShowStampModal(false)}
                onConfirm={(cfg) => {
                  setStampConfig(cfg);
                  setShowStampModal(false);
                }}
                previewContent={
                  activeView === "purchase-orders" ? (
                    <POTemplateRenderer />
                  ) : (
                    <TemplateRenderer {...templateProps} />
                  )
                }
                businessInfo={businessInfo}
                existingConfig={stampConfig}
              />
            )}
            {showInvoicesList && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
                  <div className="p-4 border-b flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Saved Invoices</h2>
                    <button
                      onClick={() => setShowInvoicesList(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="overflow-auto p-4">
                    {savedInvoices.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No saved invoices yet
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {savedInvoices.map((invoice) => (
                          <div
                            key={invoice.id}
                            onClick={() => loadInvoice(invoice)}
                            className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-semibold text-lg">
                                  {invoice.invoiceNumber || "N/A"}
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                  Client: {invoice.customer?.name || "N/A"}
                                </div>
                                <div className="text-sm text-gray-600">
                                  Event: {invoice.event?.type || "N/A"}
                                </div>
                                <div className="text-sm text-gray-600">
                                  Location: {invoice.event?.location || "N/A"}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-semibold text-violet-600">
                                  R{invoice.totals?.total?.toFixed(2) || "0.00"}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {invoice.dates?.invoiceDate
                                    ? new Date(
                                        invoice.dates.invoiceDate,
                                      ).toLocaleDateString("en-ZA")
                                    : "N/A"}
                                </div>
                                <div
                                  className={`text-xs mt-1 px-2 py-1 rounded ${invoice.status === "paid" ? "bg-green-100 text-green-700" : invoice.status === "pending" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}`}
                                >
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
                          Invoice Preview
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
                        onClick={() =>
                          requirePlan("savePDF", handleSavePDF, "Save PDF")
                        }
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
                      style={{
                        position: "relative",
                        width: "210mm",
                        minHeight: "297mm",
                      }}
                    >
                      <TemplateRenderer {...templateProps} />
                      <StampOverlay
                        stampConfig={stampConfig}
                        pageNumber={1}
                        businessInfo={businessInfo}
                      />
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

            {showAIWindow && (
              <AIInvoiceWindow
                user={user}
                businessInfo={businessInfo}
                documentType={documentType}
                onExit={() => setShowAIWindow(false)}
                industry="technology"
                TemplateRenderer={TemplateRenderer}
              />
            )}

            {activeView === "templates" && <Templates user={user} />}
            {activeView === "deployments" && <DeploymentsView user={user} />}
            {activeView === "domains" && (
              <DomainsView user={user} businessInfo={businessInfo} />
            )}
            {activeView === "databases" && <DatabasesView user={user} />}
            {activeView === "integrations" && <IntegrationsView user={user} />}
            {activeView === "home" && (
              <div className="flex-1 overflow-y-auto p-4">
                <HomeView
                  user={user}
                  onNavigate={(view, docType) => {
                    if (docType) setDocumentType(docType);
                    setActiveView(view);
                  }}
                  onOpenAI={(type) => {
    setDocumentType(type);   // so the AI window opens on the right tab
    setShowAIWindow(true);
  }}
                  onGoToDashboard={() => setActiveView("quote")}
                  onSidebarToggle={() => setSidebarOpen((p) => !p)}
                  sidebarOpen={sidebarOpen}
                />
              </div>
            )}
            {activeView === "marketplace" && (
              <div className="flex-1 overflow-y-auto p-6">
                <ServiceMarketplaceView
                  user={user}
                  businessInfo={businessInfo}
                />
              </div>
            )}

            {activeView === "incoming-requests" && (
              <div className="flex-1 overflow-y-auto p-6">
                <ServiceRequestsView user={user} businessInfo={businessInfo} />
              </div>
            )}

            {activeView === "invoice" && (
              <div
                className="flex flex-1 overflow-hidden min-h-0"
                style={{ height: "calc(100vh - 60px)" }}
              >
                {/* Form panel */}
                <div className="flex-1 overflow-y-auto">
                  <div className="grid grid-cols-1 gap-6 px-4 sm:px-6 lg:px-8 xl:px-12 py-6">
                    <button
                      onClick={() => setShowInvoice(!showInvoice)}
                      className="xl:hidden w-full mb-4 flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 text-gray-800 rounded-lg hover:bg-violet-100 transition-colors"
                    >
                      <FileText className="w-5 h-5" />
                      {showInvoice ? "Hide Invoice" : "View Invoice"}
                    </button>

                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm pt-2 sm:pt-6">
                      <div className="flex border-b border-slate-200">
                        <button
                          onClick={() => setInputMode("manual")}
                          className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${inputMode === "manual" ? "bg-white text-violet-600 border-b-2 border-violet-600" : "bg-gray-50 text-gray-600 hover:bg-gray-100"}`}
                        >
                          📝 Manual Entry
                        </button>
                        <button
                          onClick={() =>
                            requirePlan(
                              "aiMode",
                              () => setShowAIWindow(true),
                              "AI Mode",
                            )
                          }
                          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ml-auto mr-3 my-auto bg-gradient-to-r from-[#7c3aed] to-[#5b21b6] text-white shadow-md shadow-[#7c3aed]/30 hover:shadow-lg hover:shadow-[#7c3aed]/40 hover:scale-[1.02] active:scale-[0.98]"
                        >
                          <Sparkles className="w-4 h-4" />
                          AI Mode
                          {!canAccess("aiMode") && (
                            <Lock className="w-3 h-3 opacity-70" />
                          )}
                        </button>
                      </div>
                    </div>
                    {documentType === "quote" && invoiceId && (
                      <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-amber-800">
                            Quote ready to convert
                          </p>
                          <p className="text-xs text-amber-600 mt-0.5">
                            {invoiceNumber} · R{total.toFixed(2)}
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            requirePlan(
                              "convertToInvoice",
                              handleConvertToInvoice,
                              "Convert to Invoice",
                            )
                          }
                          className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap"
                        >
                          <FileText className="w-4 h-4" />
                          Convert →
                        </button>
                      </div>
                    )}
                    {inputMode === "manual" && (
                      <>
                        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-1 w-fit">
                          {["quote", "invoice"].map((type) => (
                            <button
                              key={type}
                              onClick={() => setDocumentType(type)}
                              className={`px-5 py-2 rounded-lg text-sm font-semibold capitalize transition-all duration-200 ${
                                documentType === type
                                  ? "bg-violet-600 text-white shadow-sm"
                                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                              }`}
                            >
                              {type === "quote" ? "📋 Quote" : "🧾 Invoice"}
                            </button>
                          ))}
                        </div>
                        <div className="bg-violet-50 border border-violet-200 rounded-lg px-4 py-3 flex items-center space-x-3">
                          <div className="w-2 h-2 bg-violet-500 rounded-full"></div>
                          <span className="text-violet-700 text-sm font-medium">
                            Pending Payment
                          </span>
                          <span className="text-violet-600">Due in 7 days</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <div className="text-sm text-gray-500 mb-1">
                              Total Amount
                            </div>
                            <div className="text-2xl font-semibold text-violet-600">
                              R{total.toFixed(2)}
                            </div>
                          </div>
                          <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <div className="text-sm text-gray-500 mb-1">
                              Paid
                            </div>
                            <div className="text-2xl font-semibold text-green-600">
                              R{paymentStatus.totalPaid.toFixed(2)}
                            </div>
                          </div>
                          <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <div className="text-sm text-gray-500 mb-1">
                              Balance Due
                            </div>
                            <div className="text-2xl font-semibold text-red-600">
                              R{total.toFixed(2)}
                            </div>
                          </div>
                        </div>

                        <TechnologyMultiStepForm
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
                          projectDate={projectDate}
                          setProjectDate={setProjectDate}
                          projectName={projectName}
                          setProjectName={setProjectName}
                          projectScope={projectScope}
                          setProjectScope={setProjectScope}
                          items={items}
                          newItem={newItem}
                          setNewItem={setNewItem}
                          handleAddItem={handleAddItem}
                          documentType={documentType}
                        />
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                          <h2 className="text-lg font-semibold mb-4">
                            Payment Terms
                          </h2>
                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between py-2 border-b">
                              <span className="text-gray-600">
                                Payment Method:
                              </span>
                              <span className="font-medium">
                                EFT / Card / PayFast
                              </span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                              <span className="text-gray-600">
                                Deposit Required:
                              </span>
                              <span className="font-medium">
                                50% on Acceptance
                              </span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                              <span className="text-gray-600">
                                Balance Due:
                              </span>
                              <span className="font-medium">
                                On Project Completion
                              </span>
                            </div>
                            <div className="flex justify-between py-2">
                              <span className="text-gray-600">
                                Quote Valid For:
                              </span>
                              <span className="font-medium">30 Days</span>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Live preview panel */}
                <div className="hidden xl:flex w-[420px] flex-shrink-0 flex-col border-l border-slate-200 bg-slate-100 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 flex-shrink-0">
                    <TemplateSelector
                      selectedTemplate={selectedTemplate}
                      onTemplateChange={(t) =>
                        requirePlan(
                          "templates",
                          () => setSelectedTemplate(t),
                          "Invoice Templates",
                        )
                      }
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
                        onClick={() =>
                          requirePlan("savePDF", handleSavePDF, "Save PDF")
                        }
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-violet-600 text-white text-xs font-medium rounded-lg hover:bg-violet-700 transition-colors"
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
                        position: "relative",
                        width: "210mm",
                        minHeight: "297mm",
                        transform: "scale(0.44)",
                        transformOrigin: "top left",
                        marginBottom: `calc((297mm * 0.44) - 297mm)`,
                      }}
                    >
                      <TemplateRenderer {...templateProps} />
                      <StampOverlay
                        stampConfig={stampConfig}
                        pageNumber={1}
                        businessInfo={businessInfo}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <SolidFloAgent industry="technology" />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Exported component – wraps the dashboard in the plan provider
// ─────────────────────────────────────────────────────────────────────────────
const TechnologyDashboard = () => (
  // Replace initialPlan with the value fetched from your auth/firestore
  // e.g. initialPlan={user?.plan ?? "starter"}
  <PlanProvider initialPlan="starter">
    <TechnologyDashboardInner />
  </PlanProvider>
);

export default TechnologyDashboard;
