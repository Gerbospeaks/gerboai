import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useCurrency as useAppCurrency } from "../../contexts/CurrencyContext";
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
import { getAuth, signOut } from "firebase/auth";
import FinancialOverview from "../FinancialOverview";
import uploadLogoToR2 from "../../utils/uploadLogoToR2";
import CarpentrySidebar from "./CarpentrySidebar";
import { usePermissions } from "../../hooks/usePermissions";
import Templates from "./Templates";
import StampOverlay, { AllPagesStampOverlay } from "../StampOverlay";
import ServiceMarketplaceView from "../ServiceMarketplaceView";
import ServiceRequestsView from "../ServiceRequestsView";
import PurchaseOrders from "../PurchaseOrders";
import { useLocation } from "react-router-dom";
import TemplateSelector, { TemplateRenderer } from "./TemplateSelector";
import PaymentProcessor from "../../components/dashboard/PaymentProcessor";
import { getFunctions, httpsCallable } from "firebase/functions";
import jsPDF from "jspdf"; 
import html2canvas from "html2canvas"; 

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
  Stamp,
  Hammer,
  Eye, // ✅ ADDED
  TrendingUp, // ✅ ADDED
  TrendingDown, // ✅ ADDED
} from "lucide-react";
import { db } from "../../firebase";
import CustomerModal from "../CustomerModal";
import CustomersListModal from "../CustomersListModal";
import HistoryView from "./HistoryView";
import NotesView from "./NotesView";
import AIInvoiceWindow from "../AIInvoiceWindow";
import InventoryView from "./InventoryView";
import ScheduleView from "./ScheduleView";
import ProjectsView from "./ProjectsView";
import {
  ChevronLeft,
  ChevronRight,
  Users,
  X,
  FileText,
  Plus,
  Send,
  Save,
  CheckSquare,
  CreditCard,
  Receipt,
  Wallet,
  ClipboardList,
  DollarSign,
  Building,
  Calendar,
  MapPin,
  Wrench,
} from "lucide-react";

// ✅ ADDED — matches MechanicsDashboard
const WORKER_URL = process.env.REACT_APP_API_URL;

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

// ✅ ADDED — doc-type → Firestore folder map (mirrors MechanicsDashboard)
const DOC_CONFIG = {
  invoice: { prefix: "INV", folder: "invoices" },
  quote: { prefix: "QTE", folder: "quotes" },
};

const CarpentryDashboard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPreview, setShowPreview] = useState(false);
  const totalSteps = 4;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { user, authUser } = useAuth();
const mobileNavPad = "pb-24 lg:pb-6";
  const handleQuickCreate = ({ view, action }) => {
    if (action === "newInvoice") {
      handleNewInvoice();
      setActiveView("invoice");
    }
    if (action === "newQuote") {
      handleNewQuote();
      setActiveView("invoice");
    }
    if (action === "newCustomer") {
      handleAddNewCustomer();
    }
    if (view && !action) {
      setActiveView(view);
    }
  };
const [showStampModal, setShowStampModal] = useState(false);
const [stampConfig, setStampConfig] = useState(null);
  const [quoteNumber, setQuoteNumber] = useState("");
  const [quoteId, setQuoteId] = useState(null);
  const [savedQuotes, setSavedQuotes] = useState([]);
  const [showQuotesList, setShowQuotesList] = useState(false);
  const [documentType, setDocumentType] = useState("quote");
  const [showSettings, setShowSettings] = useState(false);
  const [activeView, setActiveView] = useState("home");
  const [showCustomersListModal, setShowCustomersListModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [savedCustomers, setSavedCustomers] = useState([]); // ✅ ADDED
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState("professional");
  const [inputMode, setInputMode] = useState("manual");
  const [selectedQuoteForPayment, setSelectedQuoteForPayment] = useState(null);
  const { can, isAdmin } = usePermissions();
  const [showUserManagement, setShowUserManagement] = useState(false); // ✅ ADDED
  const [isSavingPDF, setIsSavingPDF] = useState(false); // ✅ ADDED
  const [pdfViewer, setPdfViewer] = useState(null); // ✅ ADDED
  const [invoices, setInvoices] = useState([]); // ✅ ADDED
  const [paymentStatus, setPaymentStatus] = useState({
    totalPaid: 0,
    balanceDue: 0,
    status: "pending",
  });
  // ✅ ADDED — business stats (mirrors MechanicsDashboard)
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
  const [showAIWindow, setShowAIWindow] = useState(false);
  const location = useLocation();
  useEffect(() => {
    if (location.state?.activeView) setActiveView(location.state.activeView);
  }, [location.state]);

  // ── Design tokens ─────────────────────────────────────────────────────────
  const inputCls =
    "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md bg-white text-[#1e293b] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-[#2563eb] transition-colors";
  const labelCls =
    "block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5";
  const selectCls =
    "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md bg-white text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-[#2563eb] transition-colors";

  // ── State ─────────────────────────────────────────────────────────────────
  const [customerName, setCustomerName] = useState("Smith Residence");
  const [customerEmail, setCustomerEmail] = useState("john.smith@email.com");
  const [customerPhone, setCustomerPhone] = useState("+27 82 123 4567");
  const [propertyAddress, setPropertyAddress] = useState(
    "15 Oak Street, Sandton, Johannesburg, 2196",
  );
  const [projectType, setProjectType] = useState("Kitchen Cabinetry");
  const [projectSize, setProjectSize] = useState("15");
  const [woodType, setWoodType] = useState("Oak");
  const [finishType, setFinishType] = useState("Varnish");
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({
    description: "",
    rate: "",
    qty: "",
    workCategory: "Custom Cabinetry",
    taxRate: "15",
    phase: "Phase 1",
  });
  const [businessInfo, setBusinessInfo] = useState({
    businessName: "MASTER CARPENTRY CO.",
    addressLine1: "12 Workshop Lane",
    addressLine2: "Randburg",
    city: "Johannesburg",
    postalCode: "2194",
    primaryPhone: "+27 11 888 0001",
    secondaryPhone: "+27 11 888 0002",
    email: "info@mastercarpentry.co.za",
    website: "www.mastercarpentry.co.za",
    registrationNumber: "2023/098765/07",
    vatNumber: "4567891234",
    logoUrl: "",
  });
  const [loading, setLoading] = useState(true);
  const [logoBase64, setLogoBase64] = useState(""); // ✅ ADDED

  const subtotal = items.reduce((s, i) => s + i.amount, 0);
  const totalTax = items.reduce((s, i) => s + i.taxAmount, 0);
  const total = subtotal + totalTax;
const bottomNavItems = [
  { view: "home",               icon: Hammer,        label: "Home"      },
  { view: "quote",              icon: FileText,       label: "Quote"     },
  { view: "projects",           icon: ClipboardList,  label: "Projects"  },
  { view: "inventory",          icon: Wrench,         label: "Inventory" },
  { view: "financial-overview", icon: DollarSign,     label: "Finance"   },
];
  const steps = [
    { number: 1, title: "Client Info", icon: Users },
    { number: 2, title: "Project Details", icon: Hammer },
    { number: 3, title: "Items & Materials", icon: Wrench },
    { number: 4, title: "Schedule & Payment", icon: Calendar },
  ];

  const handleNext = () => {
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };
  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };
  const handleRemoveItem = (index) =>
    setItems((prev) => prev.filter((_, i) => i !== index));

  useEffect(() => {
    if (!user?.uid) return;
    const load = async () => {
      const n = await generateQuoteNumber(user.uid, documentType);
      setQuoteNumber(n);
    };
    load();
    loadSavedQuotes();
  }, [user, documentType]);

  // ✅ ADDED — fetch business stats on mount (mirrors MechanicsDashboard)
  useEffect(() => {
    if (user?.uid) fetchBusinessStats();
  }, [user]);

  // ✅ ADDED — full stats fetch matching MechanicsDashboard
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
      invoicesSnap.forEach((docSnap) => {
        const d = docSnap.data();
        invoiceCount++;
        const amount = parseFloat(d.totals?.total || d.total || 0);
        totalInvoiced += amount;
        if (["pending", "unpaid", "partially_paid"].includes(d.status))
          pendingPayments += parseFloat(
            d.totals?.due || d.totals?.total || d.total || 0,
          );
        invoicesList.push({ id: docSnap.id, ...d });
      });
      invoicesList.sort((a, b) => {
        const t = (x) => {
          const v =
            x.dates?.quoteDate || x.createdAt?.toDate?.() || new Date(0);
          return typeof v === "string"
            ? new Date(v).getTime()
            : v.getTime?.() || 0;
        };
        return t(b) - t(a);
      });
      setInvoices(invoicesList);

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
        setSavedCustomers(cSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
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
  useEffect(() => {
    if (!quoteId)
      setPaymentStatus({ totalPaid: 0, balanceDue: total, status: "pending" });
  }, [total, quoteId]);

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

  const loadSavedQuotes = async () => {
    if (!user?.uid) return;
    const db = getFirestore();
    const col = documentType === "quote" ? "quotes" : "invoices";
    const q = query(
      collection(db, "users", user.uid, col),
      orderBy("createdAt", "desc"),
      limit(50),
    );
    const snap = await getDocs(q);
    setSavedQuotes(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

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
        // ✅ ADDED — load logo as base64 (mirrors MechanicsDashboard)
        if (d.logoUrl) {
          const b64 = await toBase64(d.logoUrl);
          setLogoBase64(b64);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // ✅ ADDED — base64 helper (mirrors MechanicsDashboard)
  const toBase64 = (url) =>
    fetch(url, { mode: "cors" })
      .then((r) => r.blob())
      .then(
        (blob) =>
          new Promise((res, rej) => {
            const reader = new FileReader();
            reader.onload = () => res(reader.result);
            reader.onerror = rej;
            reader.readAsDataURL(blob);
          }),
      )
      .catch(() => url);

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

  const loadQuoteForExport = async () => {
    if (!user?.uid || !quoteId) return null;
    const db = getFirestore();
    const col = documentType === "quote" ? "quotes" : "invoices";
    const snap = await getDoc(doc(db, "users", user.uid, col, quoteId));
    return snap.exists() ? snap.data() : null;
  };

  // ✅ ADDED — blob download helper (mirrors MechanicsDashboard)
  const downloadPDF = async (url, fileName) => {
    try {
      const res = await fetch(url, { mode: "cors" });
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = fileName || "document.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Download failed:", err);
      alert("Download failed: " + err.message);
    }
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
    setPropertyAddress(c.address || "");
  };

  const loadQuote = (quote) => {
    setQuoteId(quote.id);
    setQuoteNumber(quote.quoteNumber || "");
    setCustomerName(quote.customer?.name || "");
    setCustomerEmail(quote.customer?.email || "");
    setCustomerPhone(quote.customer?.phone || "");
    setPropertyAddress(quote.customer?.address || "");
    setProjectType(quote.projectDetails?.type || "");
    setProjectSize(quote.projectDetails?.size || "");
    setWoodType(quote.projectDetails?.woodType || "");
    setFinishType(quote.projectDetails?.finishType || "");
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
    projectDetails: {
      type: projectType,
      size: projectSize,
      woodType,
      finishType,
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
      `${documentType === "quote" ? "Quote" : "Invoice"} saved successfully`,
    );
    loadSavedQuotes();
    fetchBusinessStats(); // ✅ ADDED — refresh stats after save
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
        data,
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
      alert("Failed to convert");
    }
  };

  const handleNewDocument = () => {
    setQuoteId(null);
    setQuoteNumber("");
    setCustomerName("Smith Residence");
    setCustomerEmail("john.smith@email.com");
    setCustomerPhone("+27 82 123 4567");
    setPropertyAddress("15 Oak Street, Sandton, Johannesburg, 2196");
    setProjectType("Kitchen Cabinetry");
    setProjectSize("15");
    setWoodType("Oak");
    setFinishType("Varnish");
    setItems([]);
    setCurrentStep(1);
    const load = async () => {
      if (user?.uid) {
        const n = await generateQuoteNumber(user.uid, documentType);
        setQuoteNumber(n);
      }
    };
    load();
  };
  const handleNewQuote = () => {
    setDocumentType("quote");
    handleNewDocument();
  };
  const handleNewInvoice = () => {
    setDocumentType("invoice");
    handleNewDocument();
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
        workCategory: newItem.workCategory || "Custom Cabinetry",
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
      workCategory: "Custom Cabinetry",
      taxRate: "15",
      phase: "Phase 1",
    });
  };

  const handleProcessPayment = async () => {
    if (!quoteId || !user?.uid) {
      alert("Please save the quote before processing payment");
      return;
    }
    try {
      const col = documentType === "quote" ? "quotes" : "invoices";
      const snap = await getDoc(doc(db, "users", user.uid, col, quoteId));
      if (snap.exists()) {
        setSelectedQuoteForPayment({ id: quoteId, ...snap.data() });
        setShowPaymentModal(true);
      } else alert("Quote not found. Please save first.");
    } catch (e) {
      alert("Failed to load quote for payment");
    }
  };

  const handlePaymentComplete = () => {
    loadSavedQuotes();
    loadPaymentStatus();
    setShowPaymentModal(false);
  };

  const printStyles = `@media print { * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } html,body { margin:0!important;padding:0!important;width:210mm!important;background:white!important; } body * { visibility:hidden!important; } #print-area,#print-area * { visibility:visible!important; } #print-area { display:block!important;position:absolute!important;left:0!important;top:0!important;width:210mm!important;min-height:297mm!important;margin:0!important;padding:0!important;background:white!important; } @page { size:A4 portrait;margin:40px!important; } }`;

  const handlePrint = () => {
    const s = document.createElement("style");
    s.textContent = printStyles;
    document.head.appendChild(s);
    requestAnimationFrame(() => {
      setTimeout(() => {
        window.print();
      }, 300);
    });
    window.onafterprint = () => {
      document.head.removeChild(s);
      window.onafterprint = null;
    };
  };

  // ✅ REPLACED — full R2 upload + Firestore patch (mirrors MechanicsDashboard)
  const handleSavePDF = async () => {
    setIsSavingPDF(true);
    try {
      const printArea = document.getElementById("print-area");
      if (!printArea) throw new Error("Print area not found");

      const prevStyle = printArea.getAttribute("style") || "";
      printArea.style.cssText = `
        display: block !important;
        position: fixed;
        top: 0;
        left: -9999px;
        width: 794px;
        min-height: 1123px;
        background: white;
        z-index: 9999;
        visibility: visible;
      `;
      printArea.classList.remove("hidden");
      await new Promise((resolve) => setTimeout(resolve, 300));

      const images = printArea.querySelectorAll("img");
      await Promise.all(
        Array.from(images).map(
          (img) =>
            new Promise((resolve) => {
              if (!img.src || img.src.startsWith("data:")) {
                resolve();
                return;
              }
              fetch(img.src, { mode: "cors" })
                .then((r) => r.blob())
                .then((blob) => {
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    img.src = e.target.result;
                    resolve();
                  };
                  reader.onerror = resolve;
                  reader.readAsDataURL(blob);
                })
                .catch(resolve);
            }),
        ),
      );

      const canvas = await html2canvas(printArea, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
        width: 794,
        windowWidth: 794,
      });

      printArea.classList.add("hidden");
      printArea.setAttribute("style", prevStyle);

      const prefix = documentType === "quote" ? "Quote" : "Invoice";
      const number = quoteNumber || "draft";
      const fileName = `${prefix}-${number}.pdf`;

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = (canvas.height * pageWidth) / canvas.width;
      pdf.addImage(
        canvas.toDataURL("image/jpeg", 0.95),
        "JPEG",
        0,
        0,
        pageWidth,
        pageHeight,
      );
      const pdfBlob = pdf.output("blob");

      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) {
        alert("You must be logged in to save.");
        return;
      }

      const token = await currentUser.getIdToken();
      const uploadRes = await fetch(`${WORKER_URL}/upload-pdf`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/pdf",
          "X-File-Name": fileName,
        },
        body: pdfBlob,
      });

      if (!uploadRes.ok)
        throw new Error(`Upload failed: ${await uploadRes.text()}`);
      const { publicUrl, key } = await uploadRes.json();

      const docType = documentType === "quote" ? "quote" : "invoice";
      const folder = DOC_CONFIG[docType]?.folder ?? docType;
      const firestoreDb = getFirestore();

      await setDoc(doc(firestoreDb, "users", user.uid, folder, number), {
        fileName,
        downloadUrl: publicUrl,
        r2Key: key,
        docType,
        docNumber: number,
        generatedAt: serverTimestamp(),
        customerName,
        total,
      });

      const collectionName = documentType === "quote" ? "quotes" : "invoices";
      let activeQuoteId = quoteId;

      if (!activeQuoteId) {
        await addDoc(
          collection(firestoreDb, "users", user.uid, collectionName),
          buildQuotePayload(quoteNumber),
        );
        // Re-fetch to get the newly saved doc id
        const freshSnap = await getDocs(
          query(
            collection(firestoreDb, "users", user.uid, collectionName),
            orderBy("createdAt", "desc"),
            limit(1),
          ),
        );
        if (!freshSnap.empty) {
          activeQuoteId = freshSnap.docs[0].id;
          setQuoteId(activeQuoteId);
        }
        loadSavedQuotes();
      }

      if (activeQuoteId) {
        await updateDoc(
          doc(firestoreDb, "users", user.uid, collectionName, activeQuoteId),
          {
            downloadUrl: publicUrl,
          },
        );
        setInvoices((prev) =>
          prev.map((inv) =>
            inv.id === activeQuoteId ? { ...inv, downloadUrl: publicUrl } : inv,
          ),
        );
      }

      alert("✅ Saved as PDF successfully!");
    } catch (err) {
      console.error("PDF save error:", err);
      alert("Failed to save PDF: " + err.message);
    } finally {
      setIsSavingPDF(false);
    }
  };

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

  const handleLogout = async () => {
    try {
      await signOut(getAuth());
    } catch (e) {
      console.error(e);
    }
  };

  const { formatCurrency: formatVisitorCurrency } = useAppCurrency();
  const formatCurrency = (n) => formatVisitorCurrency(n, "ZAR");

  // ── Shared template props ──────────────────────────────────────────────────
  const templateProps = {
    templateId: selectedTemplate,
    businessInfo: {
      ...businessInfo,
      logoUrl: logoBase64 || businessInfo.logoUrl,
    }, // ✅ use base64
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
    stampConfig,
  };

  // ── Status badge helper ───────────────────────────────────────────────────
  const statusBadge = (s) =>
    s === "paid"
      ? "bg-[#dcfce7] text-[#166534]"
      : s === "partially_paid"
        ? "bg-[#fef3c7] text-[#92400e]"
        : s === "pending"
          ? "bg-[#dbeafe] text-[#1e40af]"
          : "bg-[#fef2f2] text-[#991b1b]";

  // ✅ ADDED — Stat card component (mirrors MechanicsDashboard HomeViewLocal)
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
    // ✅ ADDED — Team button
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
    
    // ✅ FIXED — now has isSavingPDF state + disabled styling
    {
      label: isSavingPDF ? "Saving..." : "Save PDF",
      icon: Download,
      onClick: handleSavePDF,
      disabled: isSavingPDF,
      className: `flex items-center gap-1.5 px-3 py-1.5 text-white text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
        isSavingPDF
          ? "bg-[#64748b] cursor-not-allowed"
          : "bg-[#0891b2] hover:bg-[#0e7490]"
      }`,
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
    {
      label: "Save",
      icon: Save,
      onClick: handleSaveQuote,
      className:
        "flex items-center gap-1.5 px-3 py-2 bg-[#2563eb] text-white rounded-md text-xs font-medium active:scale-95 whitespace-nowrap",
    },
    
    // ✅ FIXED — isSavingPDF state wired up
    {
      label: isSavingPDF ? "Saving..." : "PDF",
      icon: Download,
      onClick: handleSavePDF,
      disabled: isSavingPDF,
      className: `flex items-center gap-1.5 px-3 py-2 text-white rounded-md text-xs font-medium active:scale-95 whitespace-nowrap ${isSavingPDF ? "bg-[#64748b]" : "bg-[#0891b2]"}`,
    },
    {
      label: "Print",
      icon: Printer,
      onClick: handlePrint,
      className:
        "flex items-center gap-1.5 px-3 py-2 bg-white border border-[#e2e8f0] text-[#374151] rounded-md text-xs font-medium active:scale-95 whitespace-nowrap",
    },
  ].filter(Boolean);

  // ── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <div className="h-[100dvh] w-full overflow-hidden flex flex-col bg-[#f0f2f5]">
      {/* Print area */}
      <div
        id="print-area"
        className="hidden print:block bg-white"
        style={{ position: "relative", width: "210mm", minHeight: "297mm" }}
      >
        <TemplateRenderer {...templateProps} />
        <AllPagesStampOverlay
  stampConfig={stampConfig}
  businessInfo={businessInfo}
/>
      </div>

      {showAIWindow && (
        <AIInvoiceWindow
          user={user}
          businessInfo={businessInfo}
          documentType={documentType}
          onExit={() => setShowAIWindow(false)}
          industry="carpentry"
          onNavigateTo={(view) => {
            setActiveView(view);
          }}
          TemplateRenderer={TemplateRenderer}
        />
      )}

      <div className="flex-1 flex overflow-hidden min-h-0 md:gap-3">
        {/* Sidebar */}
        <CarpentrySidebar
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
          savedCustomers={savedCustomers} // ✅ now populated
          handleLogout={handleLogout}
          showQuotesList={showQuotesList}
          setShowQuotesList={setShowQuotesList}
          setShowCustomersListModal={setShowCustomersListModal}
          handleAddNewCustomer={handleAddNewCustomer}
          documentType={documentType}
          newRequestCount={0}
          isAdmin={isAdmin} // ✅ ADDED
        />

        {/* Main content */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          <AppHeader
            actions={headerActions}
            mobileActions={mobileDashboardActions}
            dashboardType="carpentry"
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            onQuickCreate={handleQuickCreate}
            onSettingsOpen={() => setShowSettings(true)}
            onTeamOpen={() => setShowUserManagement(true)} // ✅ ADDED
            plan="pro"
            showConvertButton={
              documentType === "quote" && !!quoteId && activeView === "quote"
            } // ✅ ADDED
            onConvert={handleConvertToInvoice} // ✅ ADDED
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

          {/* ✅ ADDED — SubUserManagement modal */}
          {showUserManagement && (
            <SubUserManagement onClose={() => setShowUserManagement(false)} />
          )}

          {/* Quotes list modal */}
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
                            "Total",
                            "Paid",
                            "Status",
                            "PDF",
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
                            <td className="px-5 py-3 text-sm font-semibold text-[#1e293b]">
                              R{q.totals?.total?.toFixed(2) || "0.00"}
                            </td>
                            <td className="px-5 py-3 text-sm text-[#059669] font-medium">
                              R{q.totals?.paid?.toFixed(2) || "0.00"}
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
                            {/* ✅ ADDED — PDF view/download column (mirrors MechanicsDashboard) */}
                            <td
                              className="px-5 py-3"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {q.downloadUrl ? (
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setPdfViewer({
                                        url: q.downloadUrl,
                                        fileName:
                                          (q.quoteNumber || q.id) + ".pdf",
                                      });
                                    }}
                                    className="flex items-center gap-1 px-2 py-1.5 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] hover:bg-[#eff6ff] hover:border-[#bfdbfe] text-[#64748b] hover:text-[#2563eb] transition-all text-xs font-semibold"
                                  >
                                    <Eye className="w-3 h-3" /> View
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      downloadPDF(
                                        q.downloadUrl,
                                        (q.quoteNumber || q.id) + ".pdf",
                                      );
                                    }}
                                    className="flex items-center gap-1 px-2 py-1.5 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] hover:bg-[#f0fdf4] hover:border-[#bbf7d0] text-[#64748b] hover:text-[#059669] transition-all text-xs font-semibold"
                                  >
                                    <Download className="w-3 h-3" /> Save
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    loadQuote(q);
                                    setShowQuotesList(false);
                                    handleSavePDF();
                                  }}
                                  title="Generate PDF"
                                  className="flex items-center gap-1 px-2 py-1.5 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] hover:bg-[#f0fdf4] hover:border-[#bbf7d0] text-[#94a3b8] hover:text-[#059669] transition-all text-xs font-semibold"
                                >
                                  <Download className="w-3 h-3" /> PDF
                                </button>
                              )}
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
                      <Printer className="w-3.5 h-3.5" /> Print
                    </button>
                    <button
                      onClick={handleSavePDF}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#059669] hover:bg-[#047857] text-white text-xs font-medium rounded-lg transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" /> Save PDF
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
                    style={{position: "relative", width: "210mm", minHeight: "297mm" }}
                  >
                    <TemplateRenderer {...templateProps} />
                    <AllPagesStampOverlay
  stampConfig={stampConfig}
  businessInfo={businessInfo}
/>
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

          {/* ✅ ADDED — HomeView with stats panel (mirrors MechanicsDashboard) */}
          {activeView === "home" && (
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
                    <p className="text-xs text-[#64748b] mb-0.5">
                      Pending Payments
                    </p>
                    {stats.loading ? (
                      <div className="h-6 bg-[#f1f5f9] rounded animate-pulse w-32" />
                    ) : (
                      <>
                        <p className="text-xl font-bold text-[#ea580c]">
                          {formatCurrency(stats.pendingPayments)}
                        </p>
                        <p className="text-xs text-[#94a3b8]">
                          Outstanding invoices
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
                        label: "Customers",
                        icon: Users,
                        onClick: () => setShowCustomersListModal(true),
                        bg: "bg-[#f0fdf4]",
                        hover: "hover:bg-[#dcfce7]",
                        border: "border-[#bbf7d0]",
                        iconBg: "bg-[#059669]",
                        text: "text-[#166534]",
                      },
                      {
                        label: "Team",
                        icon: Users,
                        onClick: () => setShowUserManagement(true),
                        bg: "bg-[#faf5ff]",
                        hover: "hover:bg-[#ede9fe]",
                        border: "border-[#ddd6fe]",
                        iconBg: "bg-[#7c3aed]",
                        text: "text-[#5b21b6]",
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
                        </button>
                      ),
                    )}
                  </div>
                </div>
              </div>

              {/* ✅ ADDED — Recent invoices list with View/Save PDF buttons */}
              <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#e2e8f0] bg-[#f8fafc]">
                  <h3 className="text-sm font-semibold text-[#1e293b]">
                    Recent Invoices & Quotes
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
                        No invoices yet
                      </p>
                      <p className="text-xs text-[#94a3b8] mb-3">
                        Create your first invoice to get started
                      </p>
                      <button
                        onClick={() => {
                          handleNewInvoice();
                          setActiveView("quote");
                        }}
                        className="px-4 py-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-lg text-xs font-medium transition-colors"
                      >
                        Create Invoice
                      </button>
                    </div>
                  ) : (
                    invoices.slice(0, 8).map((invoice) => (
                      <div
                        key={invoice.id}
                        className="flex items-center justify-between px-5 py-3.5 hover:bg-[#f8fafc] cursor-pointer transition-colors"
                      >
                        <div
                          className="flex-1 min-w-0"
                          onClick={() => loadQuote(invoice)}
                        >
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-sm font-semibold text-[#1e293b] truncate">
                              {invoice.quoteNumber ||
                                invoice.invoiceNumber ||
                                invoice.id}
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
                              <Hammer className="w-3 h-3 flex-shrink-0" />
                              {invoice.projectDetails?.type ||
                                "No project type"}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                          <div className="text-right">
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
                          {invoice.downloadUrl ? (
                            <div className="flex items-center gap-1.5">
                              <a
                                href={invoice.downloadUrl}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] hover:bg-[#eff6ff] hover:border-[#bfdbfe] text-[#64748b] hover:text-[#2563eb] transition-all text-xs font-semibold"
                              >
                                <Eye className="w-3 h-3" />
                                {!isMobile && <span>View</span>}
                              </a>
                              <a
                                href={invoice.downloadUrl}
                                download
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] hover:bg-[#f0fdf4] hover:border-[#bbf7d0] text-[#64748b] hover:text-[#059669] transition-all text-xs font-semibold"
                              >
                                <Download className="w-3 h-3" />
                                {!isMobile && <span>Save</span>}
                              </a>
                            </div>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                loadQuote(invoice);
                                handleSavePDF();
                              }}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] hover:bg-[#f0fdf4] hover:border-[#bbf7d0] text-[#94a3b8] hover:text-[#059669] transition-all text-xs font-semibold"
                            >
                              <Download className="w-3 h-3" />
                              {!isMobile && <span>PDF</span>}
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeView === "purchase-orders" && (
            <div className="flex-1 overflow-y-auto p-6">
              <PurchaseOrders user={user} />
            </div>
          )}
          {activeView === "inventory" && (
            <div className="flex-1 overflow-y-auto p-6">
              <InventoryView user={user} />
            </div>
          )}
          {activeView === "schedule" && (
            <div className="flex-1 overflow-y-auto p-6">
              <ScheduleView user={user} />
            </div>
          )}
          {(activeView === "projects" ||
            activeView === "work-orders" ||
            activeView === "materials") && (
            <div className="flex-1 overflow-y-auto p-6">
              <ProjectsView user={user} defaultTab={activeView} />
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

          {/* ── Quote/Invoice builder ───────────────────────────────────────── */}
          {activeView === "quote" && (
            <div className="flex-1 overflow-hidden flex min-h-0">
              {/* LEFT: Form panel */}
              <div className={`flex-1 overflow-y-auto px-4 sm:px-6 pt-6 min-w-0 ${mobileNavPad}`}>
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
                          <CreditCard className="w-4 h-4" /> Record Payment
                        </button>
                      )}
                    </div>
                  )}

                  {/* Main form card */}
                  <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
                    {/* Input mode / AI button */}
                    <div className="flex border-b border-[#e2e8f0] bg-[#f8fafc]">
                      <button
                        onClick={() => setInputMode("manual")}
                        className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all border-b-2 -mb-px ${inputMode === "manual" ? "border-[#2563eb] text-[#2563eb] bg-white" : "border-transparent text-[#64748b] hover:text-[#374151]"}`}
                      >
                        Manual Entry
                      </button>
                      <button
                        onClick={() => setShowAIWindow(true)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ml-auto mr-3 my-auto bg-gradient-to-r from-[#7c3aed] to-[#5b21b6] text-white shadow-md shadow-[#7c3aed]/30 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <Sparkles className="w-4 h-4" /> AI Mode
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
                                    placeholder: "Smith Residence",
                                    required: true,
                                  },
                                  {
                                    label: "Email",
                                    value: customerEmail,
                                    set: setCustomerEmail,
                                    type: "email",
                                    placeholder: "client@email.com",
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
                                    placeholder="45 Corporate Boulevard, Sandton"
                                    className={inputCls}
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Step 2 – Project Details */}
                          {currentStep === 2 && (
                            <div>
                              <div className="flex items-center gap-3 mb-5">
                                <div className="w-9 h-9 bg-[#fff7ed] rounded-lg flex items-center justify-center">
                                  <Hammer className="w-5 h-5 text-[#ea580c]" />
                                </div>
                                <div>
                                  <h2 className="text-base font-semibold text-[#1e293b]">
                                    Project Details
                                  </h2>
                                  <p className="text-xs text-[#64748b]">
                                    Provide project specifications
                                  </p>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                  <label className={labelCls}>
                                    Project Type
                                  </label>
                                  <select
                                    value={projectType}
                                    onChange={(e) =>
                                      setProjectType(e.target.value)
                                    }
                                    className={selectCls}
                                  >
                                    <option>Kitchen Cabinetry</option>
                                    <option>Bedroom Furniture</option>
                                    <option>Built-in Wardrobes</option>
                                    <option>Custom Shelving</option>
                                    <option>Decking</option>
                                    <option>Doors & Frames</option>
                                    <option>Flooring</option>
                                    <option>Ceilings</option>
                                    <option>Custom Furniture</option>
                                  </select>
                                </div>
                                <div>
                                  <label className={labelCls}>Area (sqm)</label>
                                  <input
                                    type="number"
                                    value={projectSize}
                                    onChange={(e) =>
                                      setProjectSize(e.target.value)
                                    }
                                    placeholder="15"
                                    className={inputCls}
                                  />
                                </div>
                                <div>
                                  <label className={labelCls}>Wood Type</label>
                                  <select
                                    value={woodType}
                                    onChange={(e) =>
                                      setWoodType(e.target.value)
                                    }
                                    className={selectCls}
                                  >
                                    <option>Oak</option>
                                    <option>Pine</option>
                                    <option>Meranti</option>
                                    <option>Sapele</option>
                                    <option>MDF</option>
                                    <option>Plywood</option>
                                    <option>Melamine</option>
                                  </select>
                                </div>
                                <div>
                                  <label className={labelCls}>
                                    Finish Type
                                  </label>
                                  <select
                                    value={finishType}
                                    onChange={(e) =>
                                      setFinishType(e.target.value)
                                    }
                                    className={selectCls}
                                  >
                                    <option>Varnish</option>
                                    <option>Stain & Varnish</option>
                                    <option>Paint</option>
                                    <option>Oil Finish</option>
                                    <option>Lacquer</option>
                                    <option>Natural/Unfinished</option>
                                  </select>
                                </div>
                              </div>
                              <div className="mt-4 p-3.5 bg-[#fff7ed] border border-[#fed7aa] rounded-lg">
                                <div className="flex items-center gap-2 text-sm text-[#9a3412]">
                                  <MapPin className="w-4 h-4 flex-shrink-0" />
                                  <span>
                                    <span className="font-semibold">
                                      {projectType}
                                    </span>{" "}
                                    · {projectSize} sqm · {woodType} ·{" "}
                                    {finishType}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Step 3 – Items & Materials */}
                          {currentStep === 3 && (
                            <div>
                              <div className="flex items-center gap-3 mb-5">
                                <div className="w-9 h-9 bg-[#f8fafc] rounded-lg flex items-center justify-center">
                                  <Wrench className="w-5 h-5 text-[#475569]" />
                                </div>
                                <div>
                                  <h2 className="text-base font-semibold text-[#1e293b]">
                                    Items & Materials
                                  </h2>
                                  <p className="text-xs text-[#64748b]">
                                    Add work items and materials
                                  </p>
                                </div>
                              </div>
                              <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-5 mb-5">
                                <h3 className="text-sm font-semibold text-[#374151] mb-4 flex items-center gap-2">
                                  <Plus className="w-4 h-4 text-[#2563eb]" />{" "}
                                  Add Work Item
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                                  <div className="sm:col-span-2">
                                    <label className={labelCls}>
                                      Description
                                    </label>
                                    <input
                                      type="text"
                                      placeholder="Work item description"
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
                                      value={newItem.workCategory}
                                      onChange={(e) =>
                                        setNewItem({
                                          ...newItem,
                                          workCategory: e.target.value,
                                        })
                                      }
                                      className={selectCls}
                                    >
                                      <option>Custom Cabinetry</option>
                                      <option>Installation</option>
                                      <option>Materials</option>
                                      <option>Hardware</option>
                                      <option>Finishing</option>
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
                                      <option>Phase 1</option>
                                      <option>Phase 2</option>
                                      <option>Phase 3</option>
                                      <option>Final</option>
                                    </select>
                                  </div>
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
                                    <label className={labelCls}>VAT %</label>
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
                                  className="flex items-center gap-1.5 px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium rounded-md transition-colors"
                                >
                                  <Plus className="w-4 h-4" /> Add Item
                                </button>
                              </div>
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
                                        {items.map((item, i) => (
                                          <tr
                                            key={i}
                                            className="border-b border-[#f1f5f9] hover:bg-[#f8fafc] transition-colors"
                                          >
                                            <td className="px-4 py-3 text-sm font-medium text-[#374151]">
                                              {item.description}
                                            </td>
                                            <td className="px-4 py-3">
                                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-[#fff7ed] text-[#c2410c]">
                                                {item.workCategory || "General"}
                                              </span>
                                            </td>
                                            <td className="px-4 py-3">
                                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-[#faf5ff] text-[#7c3aed]">
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
                                    Use the form above to add items
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
                                    Review and process payment
                                  </p>
                                </div>
                              </div>
                              <div className="grid grid-cols-3 gap-3 mb-5">
                                {[
                                  {
                                    label: "Project Total",
                                    value: `R${total.toFixed(2)}`,
                                    icon: DollarSign,
                                    bg: "bg-[#eff6ff]",
                                    color: "text-[#2563eb]",
                                  },
                                  {
                                    label: "Work Items",
                                    value: items.length,
                                    icon: ClipboardList,
                                    bg: "bg-[#f0fdf4]",
                                    color: "text-[#059669]",
                                  },
                                  {
                                    label: "VAT Amount",
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
                                    ["Payment Schedule", "Milestone-Based"],
                                    [
                                      "Payment Methods",
                                      "Bank Transfer, Card, EFT",
                                    ],
                                    ["Quote Valid For", "30 Days"],
                                    ["Currency", "USD (US Dollar  ($ / USD))"],
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
                              {quoteId ? (
                                <button
                                  onClick={handleProcessPayment}
                                  className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-[#059669] hover:bg-[#047857] text-white rounded-xl font-medium transition-colors shadow-sm"
                                >
                                  <CreditCard className="w-4 h-4" /> Process
                                  Payment
                                </button>
                              ) : (
                                <div className="flex items-center gap-2 px-4 py-3 bg-[#fff7ed] border border-[#fed7aa] rounded-lg text-sm text-[#9a3412]">
                                  <Receipt className="w-4 h-4 flex-shrink-0" />{" "}
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
                              <Save className="w-4 h-4" /> Save{" "}
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
                  <div className="flex items-center gap-2">
                    <TemplateSelector
                      user={user}
                      selectedTemplate={selectedTemplate}
                      onTemplateChange={setSelectedTemplate}
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handlePrint}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-[#e2e8f0] text-[#374151] text-xs font-medium rounded-lg hover:bg-[#f1f5f9] transition-colors"
                    >
                      <Printer className="w-3 h-3" /> Print
                    </button>
                    {/* ✅ FIXED — isSavingPDF state wired into preview panel button */}
                    <button
                      onClick={handleSavePDF}
                      disabled={isSavingPDF}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-[#059669] text-white text-xs font-medium rounded-lg hover:bg-[#047857] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Download className="w-3 h-3" />
                      {isSavingPDF ? "Saving..." : "PDF"}
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
                    <AllPagesStampOverlay
  stampConfig={stampConfig}
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
        </div>
      </div>

      {/* ✅ ADDED — PDF viewer modal (mirrors MechanicsDashboard) */}
      {pdfViewer && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0,0,0,0.75)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setPdfViewer(null)}
        >
          <div
            style={{
              width: "90vw",
              maxWidth: 900,
              height: "90vh",
              background: "#fff",
              borderRadius: 12,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 18px",
                background: "#0f172a",
                flexShrink: 0,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "#2563eb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Eye style={{ color: "#fff", width: 14, height: 14 }} />
                </div>
                <div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#fff",
                    }}
                  >
                    {pdfViewer.fileName}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 11,
                      color: "rgba(255,255,255,0.45)",
                    }}
                  >
                    PDF Preview
                  </p>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button
                  onClick={() => downloadPDF(pdfViewer.url, pdfViewer.fileName)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "6px 14px",
                    borderRadius: 7,
                    background: "#059669",
                    border: "none",
                    color: "#fff",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  <Download style={{ width: 13, height: 13 }} /> Download
                </button>
                <button
                  onClick={() => setPdfViewer(null)}
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    border: "none",
                    color: "#fff",
                    cursor: "pointer",
                    borderRadius: 7,
                    width: 32,
                    height: 32,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <X style={{ width: 16, height: 16 }} />
                </button>
              </div>
            </div>
            <div style={{ flex: 1, background: "#e2e8f0", overflow: "hidden" }}>
              <iframe
                src={`${pdfViewer.url}#toolbar=0&navpanes=0&scrollbar=1`}
                style={{ width: "100%", height: "100%", border: "none" }}
                title="PDF Preview"
              />
            </div>
          </div>
        </div>
      )}
      {/* ── Mobile bottom nav ── */}
<div className="md:hidden flex-shrink-0 flex items-stretch bg-white border-t border-[#e2e8f0] z-40">
  {bottomNavItems.map(({ view, icon: Icon, label }) => (
    <button
      key={view}
      onClick={() => setActiveView(view)}
      className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-[10px] font-medium transition-colors relative
        ${activeView === view
          ? "text-[#2563eb]"
          : "text-[#94a3b8] active:text-[#2563eb]"
        }`}
    >
      {activeView === view && (
        <span className="absolute top-0 left-1/2 -translate-x-1/2 w-7 h-0.5 bg-[#2563eb] rounded-b" />
      )}
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </button>
  ))}
</div>
<SolidFloAgent industry="carpentry" />
    </div>
  );
};

export default CarpentryDashboard;
