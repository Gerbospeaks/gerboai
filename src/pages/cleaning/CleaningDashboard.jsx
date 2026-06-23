import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import HomeView from "../HomeView";
import SolidFloAgent from "../../components/SolidFloAgent/SolidFloAgent";
import BusinessSettingsModal from "../BusinessSettingsModal";
import AppHeader from "../AppHeader";
import StampSignatureModal from "../StampSignatureModal";
import { POTemplateRenderer } from "../Purchaseordertemplates";
import SubUserManagement from "../SubUserManagement";
import { serverTimestamp } from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth";
import FinancialOverview from "../FinancialOverview";
import uploadLogoToR2 from "../../utils/uploadLogoToR2";
import { getFunctions, httpsCallable } from "firebase/functions";
import CleaningSidebar from "./CleaningSidebar";
import { usePermissions } from "../../hooks/usePermissions";
import Templates from "./Templates";
import StampOverlay from "../StampOverlay";
import ServiceMarketplaceView from "../ServiceMarketplaceView";
import ServiceRequestsView from "../ServiceRequestsView";
import PurchaseOrders from "../PurchaseOrders";
import { useLocation } from "react-router-dom";
import TemplateSelector, { TemplateRenderer } from "./TemplateSelector";
import PaymentProcessor from "../../components/dashboard/PaymentProcessor";
import JobsView              from "./JobsView";
import JobCalendarView       from "./JobCalendarView";
import RecurringJobsView     from "./RecurringJobsView";
import ChecklistsView        from "./ChecklistsView";
import ChecklistTemplatesView from "./ChecklistTemplatesView";
import StaffView             from "./StaffView";
import StaffScheduleView     from "./StaffScheduleView";
import StaffAttendanceView   from "./StaffAttendanceView";
import StaffPerformanceView  from "./StaffPerformanceView";
import ServiceAreasView      from "./ServiceAreasView";
import SuppliesView          from "./SuppliesView";
import QualityControlView    from "./QualityControlView";
import FleetView             from "./FleetView";
import ScheduleView          from "./ScheduleView";
import ReviewsView           from "./ReviewsView";
import RemindersView         from "./RemindersView";
import BankingView           from "./BankingView";
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
  Home as HomeIcon,
} from "lucide-react";
import { db } from "../../firebase";
import CustomerModal from "../CustomerModal";
import CustomersListModal from "../CustomersListModal";
import HistoryView from "./HistoryView";
import NotesView from "./NotesView";
import AIInvoiceWindow from '../AIInvoiceWindow';
import {
  ChevronLeft,
  ChevronRight,
  Eye,
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
  Stamp,
  LogOut,
  CheckSquare,
  CreditCard,
  Receipt,
  Wallet,
  ClipboardList,
  DollarSign,
  MapPin,
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

const CleaningDashboard = () => {
  // ── Step state ────────────────────────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  const [showAIWindow, setShowAIWindow] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState("home");
  const [showPreview, setShowPreview] = useState(false);
  const [showQuotesList, setShowQuotesList] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCustomersListModal, setShowCustomersListModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [inputMode, setInputMode] = useState("manual");
  const [isMobile, setIsMobile] = useState(false);
  const [aiWindowOpen, setAiWindowOpen] = useState(false);
  const [aiDocType, setAiDocType] = useState('invoice');
  const { can, isAdmin } = usePermissions();
  const [showUserManagement, setShowUserManagement] = useState(false);
  // ── Auth ──────────────────────────────────────────────────────────────────
  const { user, authUser } = useAuth();
  const location = useLocation();
const [showStampModal, setShowStampModal] = useState(false);
const [stampConfig, setStampConfig] = useState(null);
  // ── Document state ────────────────────────────────────────────────────────
  const [documentType, setDocumentType] = useState("quote");
  const [quoteNumber, setQuoteNumber] = useState("");
  const [quoteId, setQuoteId] = useState(null);
  const [savedQuotes, setSavedQuotes] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("default");

  // ── Customer/client state ─────────────────────────────────────────────────
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedQuoteForPayment, setSelectedQuoteForPayment] = useState(null);

  // ── Quick create handler ──────────────────────────────────────────────────
  const handleQuickCreate = ({ view, action }) => {
    if (action === "newInvoice")  { handleNewInvoice();  setActiveView("quote"); }
    if (action === "newQuote")    { handleNewQuote();    setActiveView("quote"); }
    if (action === "newCustomer") {
      setSelectedCustomer(null);
      setShowCustomerModal(true);
    }
    if (view && !action) { setActiveView(view); }
  };

  // ── Form fields ───────────────────────────────────────────────────────────
  const [customerName, setCustomerName]       = useState("Johnson Residence");
  const [customerEmail, setCustomerEmail]     = useState("johnson@email.com");
  const [customerPhone, setCustomerPhone]     = useState("+27 82 123 4567");
  const [propertyAddress, setPropertyAddress] = useState(
    "123 Sunset Avenue, Sandton, Johannesburg, 2196",
  );
  const [propertyType, setPropertyType]   = useState("Residential");
  const [propertySize, setPropertySize]   = useState("200");
  const [rooms, setRooms]                 = useState("4");
  const [bathrooms, setBathrooms]         = useState("2");

  // ── Service scheduling fields ─────────────────────────────────────────────
  const [serviceDate, setServiceDate]     = useState("");
  const [serviceTime, setServiceTime]     = useState("09:00");
  const [serviceFrequency, setServiceFrequency] = useState("One-time");

  // ── Items ─────────────────────────────────────────────────────────────────
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({
    description: "",
    rate: "",
    qty: "",
    serviceType: "Standard Cleaning",
    taxRate: "15",
    frequency: "One-time",
  });

  // ── Payment / stamp ───────────────────────────────────────────────────────
  const [paymentStatus, setPaymentStatus] = useState({
    totalPaid: 0,
    balanceDue: 0,
    status: "pending",
  });

  // FIX: stampSettings was initialised as "" (string) but used as object
  const [stampSettings, setStampSettings] = useState({
    enabled: false,
    text: "APPROVED",
    color: "#d32f2f",
    showDate: false,
  });

  useEffect(() => {
    const loadStampSettings = async () => {
      if (!user?.uid) return;
      const docRef = doc(db, "users", user.uid, "settings", "businessInfo");
      const snap = await getDoc(docRef);
      if (snap.exists() && snap.data().stampSettings) {
        setStampSettings(snap.data().stampSettings);
      }
    };
    loadStampSettings();
  }, [user]);

  // ── Business info ─────────────────────────────────────────────────────────
  const [businessInfo, setBusinessInfo] = useState({
    businessName: "SPARKLE CLEAN SERVICES",
    addressLine1: "456 Commercial Plaza",
    addressLine2: "Rosebank",
    city: "Johannesburg",
    postalCode: "2196",
    primaryPhone: "+27 11 555 0001",
    secondaryPhone: "+27 11 555 0002",
    email: "info@sparkleclean.co.za",
    website: "www.sparkleclean.co.za",
    registrationNumber: "2024/123456/07",
    vatNumber: "4123456789",
    logoUrl: "",
    bankName: "",
    accountNumber: "",
    branchCode: "",
  });
  const [loading, setLoading] = useState(true);

  // ── Design tokens ─────────────────────────────────────────────────────────
  const inputCls =
    "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md bg-white text-[#1e293b] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#0891b2] focus:border-[#0891b2] transition-colors";
  const labelCls =
    "block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5";
  const selectCls =
    "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md bg-white text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#0891b2] focus:border-[#0891b2] transition-colors";

  // ── Derived totals ────────────────────────────────────────────────────────
  const subtotal = items.reduce((s, i) => s + i.amount, 0);
  const totalTax = items.reduce((s, i) => s + i.taxAmount, 0);
  const total    = subtotal + totalTax;

  // ── Steps config ──────────────────────────────────────────────────────────
  const steps = [
    { number: 1, title: "Client Info", icon: Users },
    { number: 2, title: "Property",    icon: HomeIcon },
    { number: 3, title: "Services",    icon: ClipboardList },
    { number: 4, title: "Schedule",    icon: Calendar },
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
        doc(db, "users", user.uid, "settings", "businessInfo"),
      );
      if (snap.exists()) {
        const d = snap.data();
        setBusinessInfo((prev) => ({ ...prev, ...d }));
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
          totalPaid:  d.totals?.paid || 0,
          balanceDue: d.totals?.due  || d.totals?.total || 0,
          status:     d.status || "pending",
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleNext     = () => { if (currentStep < totalSteps) setCurrentStep(currentStep + 1); };
  const handlePrevious = () => { if (currentStep > 1)          setCurrentStep(currentStep - 1); };

  const handleRemoveItem = (i) =>
    setItems((prev) => prev.filter((_, idx) => idx !== i));

  const handleAddItem = () => {
    if (!newItem.description || !newItem.qty) return;
    const rate      = Number(newItem.rate)    || 0;
    const qty       = Number(newItem.qty);
    const taxRate   = Number(newItem.taxRate) || 0;
    const amount    = rate * qty;
    const taxAmount = amount * (taxRate / 100);
    setItems((prev) => [
      ...prev,
      {
        description: newItem.description,
        serviceType: newItem.serviceType || "Standard Cleaning",
        rate,
        qty,
        amount,
        taxRate,
        taxAmount,
        totalAmount: amount + taxAmount,
        frequency: newItem.frequency || "One-time",
      },
    ]);
    setNewItem({
      description: "",
      rate: "",
      qty: "",
      serviceType: "Standard Cleaning",
      taxRate: "15",
      frequency: "One-time",
    });
  };

  const handleAIDataExtracted = (data) => {
    if (data.customer?.name)    setCustomerName(data.customer.name);
    if (data.customer?.email)   setCustomerEmail(data.customer.email);
    if (data.customer?.phone)   setCustomerPhone(data.customer.phone);
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
      quoteDate:  new Date().toISOString(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    customer: {
      name:    customerName,
      email:   customerEmail,
      phone:   customerPhone,
      address: propertyAddress,
    },
    propertyDetails: {
      type:      propertyType,
      size:      propertySize,
      rooms,
      bathrooms,
    },
    serviceSchedule: {
      date:      serviceDate,
      time:      serviceTime,
      frequency: serviceFrequency,
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
    const col  = documentType === "quote" ? "quotes" : "invoices";
    try {
      if (quoteId) {
        await updateDoc(doc(db, "users", user.uid, col, quoteId), {
          ...data,
          updatedAt: serverTimestamp(),
        });
      } else {
        const ref = await addDoc(collection(db, "users", user.uid, col), data);
        setQuoteId(ref.id);
      }
      alert(`${documentType === "quote" ? "Quote" : "Invoice"} saved successfully`);
      loadSavedQuotes();
    } catch (e) {
      console.error(e);
      alert("Failed to save. Please try again.");
    }
  };

  const handleConvertToInvoice = async () => {
    if (!user?.uid || !quoteId) {
      alert("Please save the quote first");
      return;
    }
    if (!window.confirm("Convert this quote to an invoice?")) return;
    try {
      const db        = getFirestore();
      const newNumber = await generateQuoteNumber(user.uid, "invoice");
      const data      = buildQuotePayload(newNumber);
      data.documentType            = "invoice";
      data.convertedFromQuote      = quoteId;
      data.convertedFromQuoteNumber = quoteNumber;
      data.convertedAt             = serverTimestamp();
      const ref = await addDoc(
        collection(db, "users", user.uid, "invoices"),
        data,
      );
      await updateDoc(doc(db, "users", user.uid, "quotes", quoteId), {
        convertedToInvoice:       true,
        convertedToInvoiceId:     ref.id,
        convertedToInvoiceNumber: newNumber,
        convertedAt:              serverTimestamp(),
        status:                   "converted",
      });
      setDocumentType("invoice");
      setQuoteId(ref.id);
      setQuoteNumber(newNumber);
      alert(`Converted to Invoice ${newNumber}`);
      loadSavedQuotes();
    } catch (e) {
      console.error(e);
      alert("Failed to convert quote to invoice");
    }
  };

  const handleNewDocument = () => {
    setQuoteId(null);
    setQuoteNumber("");
    setCustomerName("Johnson Residence");
    setCustomerEmail("johnson@email.com");
    setCustomerPhone("+27 82 123 4567");
    setPropertyAddress("123 Sunset Avenue, Sandton, Johannesburg, 2196");
    setPropertyType("Residential");
    setPropertySize("200");
    setRooms("4");
    setBathrooms("2");
    setServiceDate("");
    setServiceTime("09:00");
    setServiceFrequency("One-time");
    setItems([]);
    setCurrentStep(1);
    if (user?.uid)
      generateQuoteNumber(user.uid, documentType).then(setQuoteNumber);
  };

  const handleNewQuote   = () => { setDocumentType("quote");   handleNewDocument(); };
  const handleNewInvoice = () => { setDocumentType("invoice"); handleNewDocument(); };

  const handleProcessPayment = async () => {
    if (!quoteId || !user?.uid) {
      alert("Please save the quote before processing payment");
      return;
    }
    const col  = documentType === "quote" ? "quotes" : "invoices";
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

  // FIX: handler for adding a new customer from sidebar
  const handleAddNewCustomer = () => {
    setSelectedCustomer(null);
    setShowCustomerModal(true);
  };

  const loadQuote = (quote) => {
    setQuoteId(quote.id);
    setQuoteNumber(quote.quoteNumber || "");
    setCustomerName(quote.customer?.name    || "");
    setCustomerEmail(quote.customer?.email  || "");
    setCustomerPhone(quote.customer?.phone  || "");
    setPropertyAddress(quote.customer?.address || "");
    setPropertyType(quote.propertyDetails?.type      || "");
    setPropertySize(quote.propertyDetails?.size      || "");
    setRooms(quote.propertyDetails?.rooms            || "");
    setBathrooms(quote.propertyDetails?.bathrooms    || "");
    setServiceDate(quote.serviceSchedule?.date       || "");
    setServiceTime(quote.serviceSchedule?.time       || "09:00");
    setServiceFrequency(quote.serviceSchedule?.frequency || "One-time");
    setItems(quote.items || []);
    setShowQuotesList(false);
    setPaymentStatus({
      totalPaid:  quote.totals?.paid  || 0,
      balanceDue: quote.totals?.due   || quote.totals?.total || 0,
      status:     quote.status || "pending",
    });
    setActiveView("quote");
  };

  const loadCustomer = (c) => {
    setCustomerName(c.name    || "");
    setCustomerEmail(c.email  || "");
    setCustomerPhone(c.phone  || "");
    setPropertyAddress(c.address || "");
  };

  const handleLogout = async () => {
    try { await signOut(getAuth()); } catch (e) { console.error(e); }
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
    const col  = documentType === "quote" ? "quotes" : "invoices";
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

  // ── FIX: templateProps — aligned to what TemplateRenderer / template components expect ──
  const templateProps = {
    templateId:      selectedTemplate,
    businessInfo,
    loading,
    // Templates use jobCardNumber, not invoiceNumber
    jobCardNumber:   quoteNumber,
    invoiceNumber:   quoteNumber,   // keep for any component that uses this name
    customerName,
    billName:        customerName,
    billEmail:       customerEmail,
    billPhone:       customerPhone,
    billAddress:     propertyAddress,
    customerEmail,
    customerPhone,
    customerAddress: propertyAddress,
    // Service detail props expected by templates
    serviceLocation: propertyAddress,
    serviceDate:     serviceDate || new Date().toLocaleDateString("en-ZA"),
    serviceTime:     serviceTime || "09:00 AM",
    squareFootage:   propertySize,
    numberOfRooms:   rooms,
    propertyType,
    taxId: "",
    items,
    subtotal,
    totalTax,
    total,
    documentType,
    stampText:    stampSettings?.text    || "APPROVED",
    stampColor:   stampSettings?.color   || "#d32f2f",
    showStampDate: stampSettings?.showDate ?? false,
    showStamp:    stampSettings?.enabled ?? false,
    paymentStatus,
    stampConfig,
  };

  // ── Header actions ────────────────────────────────────────────────────────
  const headerActions = [
    documentType === "quote" && quoteId && {
      label: "Convert to Invoice",
      icon: FileText,
      onClick: handleConvertToInvoice,
      className:
        "flex items-center gap-1.5 px-3 py-1.5 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm font-medium rounded-md transition-colors whitespace-nowrap",
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

  // ── Status badge helper ───────────────────────────────────────────────────
  const statusBadge = (s) =>
    s === "paid"
      ? "bg-[#dcfce7] text-[#166534]"
      : s === "partially_paid"
        ? "bg-[#fef3c7] text-[#92400e]"
        : s === "pending"
          ? "bg-[#dbeafe] text-[#1e40af]"
          : "bg-[#fef2f2] text-[#991b1b]";
const bottomNavItems = [
  { view: "home",               icon: HomeIcon,      label: "Home"     },
  { view: "quote",              icon: FileText,       label: "Quote"    },
  { view: "jobs",               icon: ClipboardList,  label: "Jobs"     },
  { view: "staff",              icon: Users,          label: "Staff"    },
  { view: "financial-overview", icon: BarChart3,      label: "Finance"  },
];
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="h-[100dvh] w-full overflow-hidden flex flex-col bg-[#f0f2f5]">
      {/* Print area */}
      <div
        id="print-area"
        className="hidden print:block bg-white"
        style={{ position: "relative", width: "210mm", minHeight: "297mm" }}
      >
        <TemplateRenderer {...templateProps} />
        <StampOverlay stampConfig={stampConfig} pageNumber={1} businessInfo={businessInfo} />
      </div>
      {showAIWindow && (
  <AIInvoiceWindow
    user={user}
    businessInfo={businessInfo}
    documentType={documentType}
    onExit={() => setShowAIWindow(false)}
    industry="cleaning"
    TemplateRenderer={TemplateRenderer}
    onNavigateTo={(view) => {
    setAiWindowOpen(false);
    setActiveView(view); 
  }}
  />
)}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* ── Sidebar ───────────────────────────────────────────────────── */}
        {/* FIX: All required props are now passed to CleaningSidebar */}
        <CleaningSidebar
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
          // FIX: use customers state (was savedCustomers which was always empty)
          savedCustomers={customers}
          handleLogout={handleLogout}
          // FIX: pass showQuotesList controls so sidebar can open/toggle it
          showQuotesList={showQuotesList}
          setShowQuotesList={setShowQuotesList}
          // FIX: pass customers modal controls
          setShowCustomersListModal={setShowCustomersListModal}
          handleAddNewCustomer={handleAddNewCustomer}
          // FIX: pass documentType so sidebar label shows correct type
          documentType={documentType}
          newRequestCount={0}
        />

        {/* ── Main content ──────────────────────────────────────────────── */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          <AppHeader
            actions={headerActions}
            mobileActions={mobileDashboardActions}
            dashboardType="cleaning"
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            onQuickCreate={handleQuickCreate}
            onSettingsOpen={() => setShowSettings(true)}
            plan="pro"
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
            onEditCustomer={(c) => {
              setSelectedCustomer(c);
              setShowCustomerModal(true);
            }}
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
                  {/* FIX: was setShowQuotesList(true) — should be false to close */}
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
                          {["Number", "Client", "Total", "Paid", "Status"].map(
                            (h) => (
                              <th
                                key={h}
                                className="px-5 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wide"
                              >
                                {h}
                              </th>
                            ),
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {savedQuotes.map((q) => (
                          <tr
                            key={q.id}
                            onClick={() => loadQuote(q)}
                            className="border-b border-[#f1f5f9] hover:bg-[#f8fafc] cursor-pointer transition-colors"
                          >
                            <td className="px-5 py-3 text-sm font-semibold text-[#0891b2]">
                              {q.quoteNumber || "N/A"}
                            </td>
                            <td className="px-5 py-3 text-sm text-[#374151]">
                              {q.customer?.name || "N/A"}
                            </td>
                            <td className="px-5 py-3 text-sm font-semibold text-[#1e293b]">
                              R{Number(q.totals?.total || 0).toFixed(2)}
                            </td>
                            <td className="px-5 py-3 text-sm text-[#059669] font-medium">
                              R{Number(q.totals?.paid || 0).toFixed(2)}
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
                    style={{ position: "relative", width: "210mm", minHeight: "297mm" }}
                  >
                    <TemplateRenderer {...templateProps} />
                    <StampOverlay stampConfig={stampConfig} pageNumber={1} businessInfo={businessInfo} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Non-quote views ────────────────────────────────────────── */}
          {activeView === "financial-overview" && (
            <div className="flex-1 overflow-y-auto p-4">
              <FinancialOverview user={user} />
            </div>
          )}
          {activeView === "historyview" && (
            <div className="flex-1 overflow-y-auto p-4">
              <HistoryView user={user} />
            </div>
          )}
          {activeView === "notesview" && (
            <div className="flex-1 overflow-y-auto p-4">
              <NotesView user={user} />
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
          {activeView === "purchase-orders" && (
  <div className="flex-1 overflow-y-auto p-6">
    <PurchaseOrders user={user} />
  </div>
)}

          
          {/* FIX: was "historyview" — corrected to "history-view" */}
          {activeView === "history-view" && (
            <div className="flex-1 overflow-y-auto p-4">
              <HistoryView user={user} />
            </div>
          )}
 
          {/* FIX: was "notesview" — corrected to "notes-view" */}
          {activeView === "notes-view" && (
            <div className="flex-1 overflow-y-auto p-4">
              <NotesView user={user} />
            </div>
          )}
 
          {activeView === "schedule" && (
            <div className="flex-1 overflow-y-auto p-4">
              <ScheduleView user={user} businessInfo={businessInfo} />
            </div>
          )}
 
          {activeView === "reviews" && (
            <div className="flex-1 overflow-y-auto p-6">
              <ReviewsView user={user} />
            </div>
          )}
 
          {activeView === "client-ratings" && (
            <div className="flex-1 overflow-y-auto p-6">
              <ReviewsView user={user} />
            </div>
          )}
 
          {activeView === "reminders" && (
            <div className="flex-1 overflow-y-auto p-6">
              <RemindersView user={user} />
            </div>
          )}
 
          {/* ── Cleaning Operations views ──────────────────────────────── */}
          {activeView === "jobs" && (
            <div className="flex-1 overflow-y-auto p-6">
              <JobsView user={user} businessInfo={businessInfo} />
            </div>
          )}
 
          {activeView === "job-new" && (
            <div className="flex-1 overflow-y-auto p-6">
              <JobsView user={user} businessInfo={businessInfo} openNew />
            </div>
          )}
 
          {activeView === "job-calendar" && (
            <div className="flex-1 overflow-y-auto p-4">
              <JobCalendarView user={user} businessInfo={businessInfo} />
            </div>
          )}
            {activeView === "banking" && (
  <div className="flex-1 overflow-y-auto p-6">
    <BankingView user={user} />
  </div>
)}
          {activeView === "recurring-jobs" && (
            <div className="flex-1 overflow-y-auto p-6">
              <RecurringJobsView user={user} />
            </div>
          )}
 
          {activeView === "checklists" && (
            <div className="flex-1 overflow-y-auto p-6">
              <ChecklistsView user={user} />
            </div>
          )}
 
          {activeView === "checklist-templates" && (
            <div className="flex-1 overflow-y-auto p-6">
              <ChecklistTemplatesView user={user} />
            </div>
          )}
 
          {/* ── Staff views ────────────────────────────────────────────── */}
          {activeView === "staff" && (
            <div className="flex-1 overflow-y-auto p-6">
              <StaffView user={user} />
            </div>
          )}
 
          {activeView === "staff-new" && (
            <div className="flex-1 overflow-y-auto p-6">
              <StaffView user={user} openNew />
            </div>
          )}
 
          {activeView === "staff-schedule" && (
            <div className="flex-1 overflow-y-auto p-6">
              <StaffScheduleView user={user} />
            </div>
          )}
 
          {activeView === "staff-attendance" && (
            <div className="flex-1 overflow-y-auto p-6">
              <StaffAttendanceView user={user} />
            </div>
          )}
 
          {activeView === "staff-performance" && (
            <div className="flex-1 overflow-y-auto p-6">
              <StaffPerformanceView user={user} />
            </div>
          )}
 
          {/* ── Other operations views ─────────────────────────────────── */}
          {activeView === "service-areas" && (
            <div className="flex-1 overflow-y-auto p-6">
              <ServiceAreasView user={user} />
            </div>
          )}
 
          {activeView === "supplies" && (
            <div className="flex-1 overflow-y-auto p-6">
              <SuppliesView user={user} />
            </div>
          )}
 
          {activeView === "quality-control" && (
            <div className="flex-1 overflow-y-auto p-6">
              <QualityControlView user={user} />
            </div>
          )}
 
          {activeView === "fleet" && (
            <div className="flex-1 overflow-y-auto p-6">
              <FleetView user={user} />
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
          {/* ── Quote/Invoice view — split layout ─────────────────────── */}
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
                        iconBg: "bg-[#ecfeff]",
                        iconColor: "text-[#0891b2]",
                        textColor: "text-[#1e293b]",
                      },
                      {
                        label: "Paid",
                        value: `R${paymentStatus.totalPaid.toFixed(2)}`,
                        icon: CheckSquare,
                        iconBg:    paymentStatus.totalPaid > 0 ? "bg-[#dcfce7]" : "bg-[#f1f5f9]",
                        iconColor: paymentStatus.totalPaid > 0 ? "text-[#059669]" : "text-[#94a3b8]",
                        textColor: paymentStatus.totalPaid > 0 ? "text-[#059669]" : "text-[#1e293b]",
                      },
                      {
                        label: "Balance Due",
                        value: `R${paymentStatus.balanceDue.toFixed(2)}`,
                        icon: Wallet,
                        iconBg:    paymentStatus.balanceDue <= 0 ? "bg-[#dcfce7]" : "bg-[#fef2f2]",
                        iconColor: paymentStatus.balanceDue <= 0 ? "text-[#059669]" : "text-[#dc2626]",
                        textColor: paymentStatus.balanceDue <= 0 ? "text-[#059669]" : "text-[#dc2626]",
                      },
                    ].map(({ label, value, icon: Icon, iconBg, iconColor, textColor }) => (
                      <div
                        key={label}
                        className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-semibold text-[#64748b] uppercase tracking-wide">
                            {label}
                          </span>
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
                    <div
                      className={`px-5 py-3.5 rounded-xl border flex items-center justify-between ${
                        paymentStatus.status === "paid"
                          ? "bg-[#f0fdf4] border-[#bbf7d0]"
                          : paymentStatus.status === "partially_paid"
                            ? "bg-[#fffbeb] border-[#fde68a]"
                            : "bg-[#fff7ed] border-[#fed7aa]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            paymentStatus.status === "paid"
                              ? "bg-[#dcfce7]"
                              : paymentStatus.status === "partially_paid"
                                ? "bg-[#fef3c7]"
                                : "bg-[#ffedd5]"
                          }`}
                        >
                          <CreditCard
                            className={`w-4 h-4 ${
                              paymentStatus.status === "paid"
                                ? "text-[#059669]"
                                : paymentStatus.status === "partially_paid"
                                  ? "text-[#d97706]"
                                  : "text-[#ea580c]"
                            }`}
                          />
                        </div>
                        <div
                          className={`text-sm font-semibold ${
                            paymentStatus.status === "paid"
                              ? "text-[#166534]"
                              : paymentStatus.status === "partially_paid"
                                ? "text-[#92400e]"
                                : "text-[#9a3412]"
                          }`}
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

                  {/* ── Main form card ────────────────────────────────── */}
                  <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
                    {/* Input mode tabs */}
                    <div className="flex border-b border-[#e2e8f0] bg-[#f8fafc]">
                      <button
                        onClick={() => setInputMode("manual")}
                        className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all border-b-2 -mb-px ${
                          inputMode === "manual"
                            ? "border-[#0891b2] text-[#0891b2] bg-white"
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
                                  <div
                                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                      currentStep === step.number
                                        ? "bg-[#0891b2] text-white"
                                        : currentStep > step.number
                                          ? "bg-[#dcfce7] text-[#059669] ring-1 ring-[#059669]"
                                          : "bg-[#e2e8f0] text-[#94a3b8]"
                                    }`}
                                  >
                                    {currentStep > step.number ? "✓" : step.number}
                                  </div>
                                  <span
                                    className={`text-xs font-medium hidden sm:block ${
                                      currentStep === step.number
                                        ? "text-[#0891b2]"
                                        : currentStep > step.number
                                          ? "text-[#059669]"
                                          : "text-[#94a3b8]"
                                    }`}
                                  >
                                    {step.title}
                                  </span>
                                </div>
                                {idx < steps.length - 1 && (
                                  <div
                                    className={`flex-1 h-px mx-2 ${
                                      currentStep > step.number ? "bg-[#059669]" : "bg-[#e2e8f0]"
                                    }`}
                                  />
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
                                <div className="w-9 h-9 bg-[#ecfeff] rounded-lg flex items-center justify-center">
                                  <Users className="w-5 h-5 text-[#0891b2]" />
                                </div>
                                <div>
                                  <h2 className="text-base font-semibold text-[#1e293b]">Client Information</h2>
                                  <p className="text-xs text-[#64748b]">Enter client details for this {documentType}</p>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                  <label className={labelCls}>Client Name <span className="text-[#dc2626] normal-case tracking-normal font-normal">*</span></label>
                                  <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Johnson Residence" className={inputCls} />
                                </div>
                                <div>
                                  <label className={labelCls}>Email <span className="text-[#dc2626] normal-case tracking-normal font-normal">*</span></label>
                                  <input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="contact@example.com" className={inputCls} />
                                </div>
                                <div>
                                  <label className={labelCls}>Phone <span className="text-[#dc2626] normal-case tracking-normal font-normal">*</span></label>
                                  <input type="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="+27 82 123 4567" className={inputCls} />
                                </div>
                                <div>
                                  <label className={labelCls}>Property Address <span className="text-[#dc2626] normal-case tracking-normal font-normal">*</span></label>
                                  <input type="text" value={propertyAddress} onChange={(e) => setPropertyAddress(e.target.value)} placeholder="123 Sunset Avenue, Sandton" className={inputCls} />
                                </div>
                              </div>

                              {/* Quick-fill from saved customers */}
                              {customers.length > 0 && (
                                <div className="mt-4">
                                  <label className={labelCls}>Or select existing client</label>
                                  <select
                                    className={selectCls}
                                    defaultValue=""
                                    onChange={(e) => {
                                      const c = customers.find((c) => c.id === e.target.value);
                                      if (c) loadCustomer(c);
                                    }}
                                  >
                                    <option value="" disabled>Choose a client…</option>
                                    {customers.map((c) => (
                                      <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                  </select>
                                </div>
                              )}
                            </div>
                          )}

                          {/* ── Step 2: Property Details ────────────────── */}
                          {currentStep === 2 && (
                            <div>
                              <div className="flex items-center gap-3 mb-5">
                                <div className="w-9 h-9 bg-[#f0fdf4] rounded-lg flex items-center justify-center">
                                  <HomeIcon className="w-5 h-5 text-[#059669]" />
                                </div>
                                <div>
                                  <h2 className="text-base font-semibold text-[#1e293b]">Property Details</h2>
                                  <p className="text-xs text-[#64748b]">Enter property info for an accurate quote</p>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                  <label className={labelCls}>Property Type</label>
                                  <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)} className={selectCls}>
                                    <option>Residential</option>
                                    <option>Commercial</option>
                                    <option>Office</option>
                                    <option>Retail</option>
                                    <option>Industrial</option>
                                  </select>
                                </div>
                                <div>
                                  <label className={labelCls}>Property Size (sqm)</label>
                                  <input type="number" value={propertySize} onChange={(e) => setPropertySize(e.target.value)} placeholder="200" className={inputCls} />
                                </div>
                                <div>
                                  <label className={labelCls}>Number of Rooms</label>
                                  <input type="number" value={rooms} onChange={(e) => setRooms(e.target.value)} placeholder="4" className={inputCls} />
                                </div>
                                <div>
                                  <label className={labelCls}>Bathrooms</label>
                                  <input type="number" value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} placeholder="2" className={inputCls} />
                                </div>
                              </div>

                              {/* Property summary */}
                              <div className="mt-4 p-3.5 bg-[#ecfeff] border border-[#a5f3fc] rounded-lg">
                                <div className="flex items-center gap-2 text-[#0891b2] text-sm font-semibold mb-1">
                                  <MapPin className="w-4 h-4" />
                                  Property Summary
                                </div>
                                <div className="text-xs text-[#0e7490] space-y-0.5">
                                  <p><span className="font-semibold">Type:</span> {propertyType}</p>
                                  <p><span className="font-semibold">Size:</span> {propertySize} sqm · <span className="font-semibold">Rooms:</span> {rooms} · <span className="font-semibold">Bathrooms:</span> {bathrooms}</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* ── Step 3: Services ────────────────────────── */}
                          {currentStep === 3 && (
                            <div>
                              <div className="flex items-center gap-3 mb-5">
                                <div className="w-9 h-9 bg-[#faf5ff] rounded-lg flex items-center justify-center">
                                  <ClipboardList className="w-5 h-5 text-[#7c3aed]" />
                                </div>
                                <div>
                                  <h2 className="text-base font-semibold text-[#1e293b]">Cleaning Services</h2>
                                  <p className="text-xs text-[#64748b]">Add services to the {documentType}</p>
                                </div>
                              </div>

                              {/* Add service form */}
                              <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-5 mb-5">
                                <h3 className="text-sm font-semibold text-[#374151] mb-4 flex items-center gap-2">
                                  <Plus className="w-4 h-4 text-[#0891b2]" />
                                  Add New Service
                                </h3>
                                <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                                  <div className="sm:col-span-2">
                                    <label className={labelCls}>Description</label>
                                    <input type="text" placeholder="Service description / details" value={newItem.description} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} className={inputCls} />
                                  </div>
                                  <div>
                                    <label className={labelCls}>Service Type</label>
                                    <select value={newItem.serviceType} onChange={(e) => setNewItem({ ...newItem, serviceType: e.target.value })} className={selectCls}>
                                      <option>Standard Cleaning</option>
                                      <option>Deep Cleaning</option>
                                      <option>Move In/Out Cleaning</option>
                                      <option>Office Cleaning</option>
                                      <option>Carpet Cleaning</option>
                                      <option>Window Cleaning</option>
                                      <option>Post-Construction</option>
                                      <option>Specialized Service</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className={labelCls}>Frequency</label>
                                    <select value={newItem.frequency} onChange={(e) => setNewItem({ ...newItem, frequency: e.target.value })} className={selectCls}>
                                      <option>One-time</option>
                                      <option>Weekly</option>
                                      <option>Bi-weekly</option>
                                      <option>Monthly</option>
                                      <option>Quarterly</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className={labelCls}>Rate (R)</label>
                                    <input type="number" placeholder="0.00" value={newItem.rate} onChange={(e) => setNewItem({ ...newItem, rate: e.target.value })} className={inputCls} />
                                  </div>
                                  <div>
                                    <label className={labelCls}>Qty</label>
                                    <input type="number" placeholder="1" value={newItem.qty} onChange={(e) => setNewItem({ ...newItem, qty: e.target.value })} className={inputCls} />
                                  </div>
                                </div>
                                <div className="mt-3 flex items-center gap-3">
                                  <div className="w-24">
                                    <label className={labelCls}>VAT %</label>
                                    <input type="number" placeholder="15" value={newItem.taxRate} onChange={(e) => setNewItem({ ...newItem, taxRate: e.target.value })} className={inputCls} />
                                  </div>
                                  <div className="flex items-end pb-0.5">
                                    <button onClick={handleAddItem} className="flex items-center gap-1.5 px-4 py-2 bg-[#0891b2] hover:bg-[#0e7490] text-white text-sm font-medium rounded-md transition-colors">
                                      <Plus className="w-4 h-4" />
                                      Add Service
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Services table */}
                              {items.length > 0 ? (
                                <div className="border border-[#e2e8f0] rounded-xl overflow-hidden mb-5">
                                  <div className="px-4 py-3 bg-[#f8fafc] border-b border-[#e2e8f0] flex items-center justify-between">
                                    <span className="text-sm font-semibold text-[#374151]">Services Added</span>
                                    <span className="text-xs text-[#64748b] bg-[#e2e8f0] px-2 py-0.5 rounded-full">{items.length} items</span>
                                  </div>
                                  <div className="overflow-x-auto">
                                    <table className="w-full">
                                      <thead>
                                        <tr className="border-b border-[#e2e8f0]">
                                          {["Description", "Type", "Freq.", "Rate", "Qty", "VAT", "Amount", ""].map((h) => (
                                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wide">{h}</th>
                                          ))}
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {items.map((item, i) => (
                                          <tr key={i} className="border-b border-[#f1f5f9] hover:bg-[#f8fafc] transition-colors">
                                            <td className="px-4 py-3 text-sm font-medium text-[#374151]">{item.description}</td>
                                            <td className="px-4 py-3">
                                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-[#ecfeff] text-[#0e7490]">{item.serviceType || "Standard Cleaning"}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-[#f0fdf4] text-[#166534]">{item.frequency || "One-time"}</span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-[#374151]">R{Number(item.rate).toFixed(2)}</td>
                                            <td className="px-4 py-3 text-sm text-[#374151]">{item.qty}</td>
                                            <td className="px-4 py-3 text-sm text-[#374151]">R{Number(item.taxAmount).toFixed(2)}</td>
                                            <td className="px-4 py-3 text-sm font-semibold text-[#1e293b]">R{Number(item.totalAmount).toFixed(2)}</td>
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
                                        <span>VAT</span>
                                        <span className="font-medium text-[#374151]">R{totalTax.toFixed(2)}</span>
                                      </div>
                                      <div className="flex justify-between w-48 pt-2 border-t border-[#e2e8f0] font-semibold text-[#1e293b]">
                                        <span>Total</span>
                                        <span className="text-[#0891b2]">R{total.toFixed(2)}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="border-2 border-dashed border-[#e2e8f0] rounded-xl py-12 text-center">
                                  <ClipboardList className="w-8 h-8 text-[#cbd5e1] mx-auto mb-3" />
                                  <p className="text-sm font-medium text-[#94a3b8]">No services added yet</p>
                                  <p className="text-xs text-[#cbd5e1] mt-1">Use the form above to add cleaning services</p>
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

                              {/* Service schedule inputs */}
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
                                <div>
                                  <label className={labelCls}>Service Date</label>
                                  <input type="date" value={serviceDate} onChange={(e) => setServiceDate(e.target.value)} className={inputCls} />
                                </div>
                                <div>
                                  <label className={labelCls}>Service Time</label>
                                  <input type="time" value={serviceTime} onChange={(e) => setServiceTime(e.target.value)} className={inputCls} />
                                </div>
                                <div>
                                  <label className={labelCls}>Frequency</label>
                                  <select value={serviceFrequency} onChange={(e) => setServiceFrequency(e.target.value)} className={selectCls}>
                                    <option>One-time</option>
                                    <option>Weekly</option>
                                    <option>Bi-weekly</option>
                                    <option>Monthly</option>
                                    <option>Quarterly</option>
                                  </select>
                                </div>
                              </div>

                              {/* Payment info */}
                              <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden shadow-sm mb-5">
                                <div className="px-5 py-3.5 border-b border-[#e2e8f0] bg-[#f8fafc]">
                                  <span className="text-sm font-semibold text-[#374151]">Payment Information</span>
                                </div>
                                <div className="divide-y divide-[#f1f5f9]">
                                  {[
                                    ["Payment Due",     "Upon Completion"],
                                    ["Payment Methods", "Bank Transfer, Card, Cash"],
                                    ["Quote Valid For", "30 Days"],
                                    ["Currency",        "ZAR (South African Rand)"],
                                    ["Total Due",       `R${total.toFixed(2)}`],
                                  ].map(([k, v]) => (
                                    <div key={k} className="flex items-center justify-between px-5 py-3 text-sm">
                                      <span className="text-[#64748b]">{k}</span>
                                      <span className={`font-semibold ${k === "Total Due" ? "text-[#0891b2]" : "text-[#1e293b]"}`}>{v}</span>
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
                                    <p className="text-[#64748b]">{propertyType} · {propertySize} sqm · {rooms} rooms · {bathrooms} bathrooms</p>
                                  </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-[#e2e8f0] text-sm">
                                  <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wide mb-2">Quote Details</p>
                                  <div className="flex flex-wrap gap-x-6 gap-y-1 text-[#64748b]">
                                    <span><span className="font-semibold text-[#374151]">Number:</span> {quoteNumber}</span>
                                    <span><span className="font-semibold text-[#374151]">Date:</span> {new Date().toLocaleDateString()}</span>
                                    <span><span className="font-semibold text-[#374151]">Type:</span> {documentType === "quote" ? "Quote" : "Invoice"}</span>
                                    {serviceDate && <span><span className="font-semibold text-[#374151]">Service Date:</span> {serviceDate}</span>}
                                  </div>
                                </div>
                              </div>

                              {quoteId ? (
                                <button
                                  onClick={handleProcessPayment}
                                  className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-[#059669] hover:bg-[#047857] text-white rounded-xl font-medium transition-colors shadow-sm"
                                >
                                  <CreditCard className="w-4 h-4" />
                                  Process Payment
                                </button>
                              ) : (
                                <div className="flex items-center gap-2 px-4 py-3 bg-[#fff7ed] border border-[#fed7aa] rounded-lg text-sm text-[#9a3412]">
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
                              className="flex items-center gap-1.5 px-4 py-2 bg-[#0891b2] hover:bg-[#0e7490] text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
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
                      <Printer className="w-3 h-3" />
                      Print
                    </button>
                    <button
                      onClick={handleSavePDF}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-[#0891b2] text-white text-xs font-medium rounded-lg hover:bg-[#0e7490] transition-colors"
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
                      position: "relative",
                      width: "210mm",
                      minHeight: "297mm",
                      transform: "scale(0.44)",
                      transformOrigin: "top left",
                      marginBottom: `calc((297mm * 0.44) - 297mm)`,
                    }}
                  >
                    <TemplateRenderer {...templateProps} />
                    <StampOverlay stampConfig={stampConfig} pageNumber={1} businessInfo={businessInfo} />
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
      {/* ── Mobile bottom nav ── */}
<div className="md:hidden flex-shrink-0 flex items-stretch bg-white border-t border-[#e2e8f0] z-40">
  {bottomNavItems.map(({ view, icon: Icon, label }) => (
    <button
      key={view}
      onClick={() => setActiveView(view)}
      className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-[10px] font-medium transition-colors relative
        ${activeView === view
          ? "text-[#0891b2]"
          : "text-[#94a3b8] active:text-[#0891b2]"
        }`}
    >
      {activeView === view && (
        <span className="absolute top-0 left-1/2 -translate-x-1/2 w-7 h-0.5 bg-[#0891b2] rounded-b" />
      )}
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </button>
  ))}
</div>
<SolidFloAgent industry="cleaning" />
    </div>
  );
};

export default CleaningDashboard;
