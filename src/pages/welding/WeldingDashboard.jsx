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
import { useNavigate, useLocation } from "react-router-dom";
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
import { Printer, Download, Sparkles, Trash2 } from "lucide-react";
import { db } from "../../firebase";
import CustomerModal from "../CustomerModal";
import CustomersListModal from "../CustomersListModal";
import HistoryView from "./HistoryView";
import NotesView from "./NotesView";
import AIInvoiceExtractor from "../AIInvoiceExtractor";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Home,
  Settings,
  Users,
  Calendar,
  Eye,
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
  MapPin,
  Wrench,
  Flame,
  Shield,
  ArrowRight,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
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

const WeldingDashboard = () => {
  const navigate = useNavigate();

  // ── step navigation ──────────────────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // ── layout / sidebar ─────────────────────────────────────────────────────
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // ── auth ─────────────────────────────────────────────────────────────────
  const { user, authUser } = useAuth();

  // ── quote / invoice state ────────────────────────────────────────────────
  const [quoteNumber, setQuoteNumber] = useState("");
  const [quoteId, setQuoteId] = useState(null);
  const [savedQuotes, setSavedQuotes] = useState([]);
  const [showQuotesList, setShowQuotesList] = useState(false);
  const [documentType, setDocumentType] = useState("quote");
  const [showPreview, setShowPreview] = useState(false);

  // ── views / modals ───────────────────────────────────────────────────────
  const [showSettings, setShowSettings] = useState(false);
  const [activeView, setActiveView] = useState("home");
  const [showCustomersListModal, setShowCustomersListModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showInvoicesList, setShowInvoicesList] = useState(false);

  // ── customers ────────────────────────────────────────────────────────────
  const [customers, setCustomers] = useState([]);
  const [savedCustomers, setSavedCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isClientsOpen, setIsClientsOpen] = useState(false);

  // ── project detail fields ────────────────────────────────────────────────
  const [projectType, setProjectType] = useState("Structural Welding");
  const [materialType, setMaterialType] = useState("Mild Steel");
  const [materialThickness, setMaterialThickness] = useState("10");
  const [urgencyLevel, setUrgencyLevel] = useState("Standard");
  const [weldingProcess, setWeldingProcess] = useState("MIG/GMAW");
  const [projectScale, setProjectScale] = useState("Medium");
  const [estimatedHours, setEstimatedHours] = useState("40");
  const [certificationRequired, setCertificationRequired] = useState("Yes");

  // ── template & input mode ────────────────────────────────────────────────
  const [selectedTemplate, setSelectedTemplate] = useState("professional");
  const [inputMode, setInputMode] = useState("manual");

  // ── payment ──────────────────────────────────────────────────────────────
  const [selectedQuoteForPayment, setSelectedQuoteForPayment] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState({
    totalPaid: 0,
    balanceDue: 0,
    status: "pending",
  });

  // ── stamp ────────────────────────────────────────────────────────────────
  const [stampSettings, setStampSettings] = useState({
    text: "PAID",
    color: "#22c55e",
    showDate: true,
    enabled: true,
  });

  // ── stats ────────────────────────────────────────────────────────────────
  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalQuotes: 0,
    totalInvoiced: 0,
    totalClients: 0,
    pendingPayments: 0,
    loading: true,
  });
  const [invoices, setInvoices] = useState([]);

  const location = useLocation();
  useEffect(() => {
    if (location.state?.activeView) setActiveView(location.state.activeView);
  }, [location.state]);

  // ── client / project fields ──────────────────────────────────────────────
  const [customerName, setCustomerName] = useState("ABC Manufacturing Ltd");
  const [customerEmail, setCustomerEmail] = useState(
    "procurement@abcmfg.co.za",
  );
  const [customerPhone, setCustomerPhone] = useState("+27 11 456 7890");
  const [projectAddress, setProjectAddress] = useState(
    "Industrial Park, 123 Factory Road, Germiston, 1401",
  );

  // ── business info ────────────────────────────────────────────────────────
  const [businessInfo, setBusinessInfo] = useState({
    businessName: "PRECISION WELDING SERVICES",
    addressLine1: "45 Industrial Avenue",
    addressLine2: "Benoni",
    city: "Johannesburg",
    postalCode: "1501",
    primaryPhone: "+27 11 888 0001",
    secondaryPhone: "+27 11 888 0002",
    email: "info@precisionwelding.co.za",
    website: "www.precisionwelding.co.za",
    registrationNumber: "2022/045678/07",
    vatNumber: "4567890123",
    logoUrl: "",
    bankName: "FNB",
    branchName: "Main Branch",
    accountNumber: "62146991441",
  });
  const [loading, setLoading] = useState(true);

  // ── line-item state ──────────────────────────────────────────────────────
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({
    description: "",
    rate: "",
    qty: "",
    workCategory: "Structural Welding",
    taxRate: "15",
    urgency: "Standard",
    phase: "Phase 1",
  });

  // ── derived totals ───────────────────────────────────────────────────────
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const totalTax = items.reduce((sum, item) => sum + item.taxAmount, 0);
  const total = subtotal + totalTax;

  // ── step definitions ─────────────────────────────────────────────────────
  const steps = [
    { number: 1, title: "Client Info", icon: Users },
    { number: 2, title: "Project Details", icon: Flame },
    { number: 3, title: "Welding Work", icon: Shield },
    { number: 4, title: "Schedule & Payment", icon: Calendar },
  ];

  // ── design tokens ─────────────────────────────────────────────────────────
  const inputCls =
    "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md bg-white text-[#1e293b] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#ea580c] focus:border-[#ea580c] transition-colors";
  const labelCls =
    "block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5";
  const selectCls =
    "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md bg-white text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#ea580c] focus:border-[#ea580c] transition-colors";

  // ============================================================================
  // Effects
  // ============================================================================
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
      fetchBusinessStats();
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

  // ============================================================================
  // Data loaders
  // ============================================================================
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
      invoicesSnap.forEach((d) => {
        const data = d.data();
        invoiceCount++;
        const amount = parseFloat(data.totals?.total || data.total || 0);
        totalInvoiced += amount;
        if (["pending", "unpaid", "partially_paid"].includes(data.status))
          pendingPayments += parseFloat(
            data.totals?.due || data.totals?.total || data.total || 0,
          );
        invoicesList.push({ id: d.id, ...data });
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

  // ============================================================================
  // Handlers – customers
  // ============================================================================
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
    setProjectAddress(customer.address || "");
  };
  const handleCustomerSaved = () => loadCustomers();

  // ============================================================================
  // Handlers – quote / invoice CRUD
  // ============================================================================
  const loadQuote = (quote) => {
    setQuoteId(quote.id);
    setQuoteNumber(quote.quoteNumber || "");
    setCustomerName(quote.customer?.name || "");
    setCustomerEmail(quote.customer?.email || "");
    setCustomerPhone(quote.customer?.phone || "");
    setProjectAddress(quote.customer?.address || "");
    setWeldingProcess(quote.projectDetails?.weldingProcess || "");
    setProjectScale(quote.projectDetails?.scale || "");
    setEstimatedHours(quote.projectDetails?.estimatedHours || "");
    setCertificationRequired(quote.projectDetails?.certification || "");
    setItems(quote.items || []);
    setShowQuotesList(false);
    setProjectType(quote.projectDetails?.type || "");
    setMaterialType(quote.projectDetails?.materialType || "");
    setMaterialThickness(quote.projectDetails?.materialThickness || "");
    setUrgencyLevel(quote.projectDetails?.urgency || "");
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
      address: projectAddress,
    },
    projectDetails: {
      type: projectType,
      materialType,
      materialThickness,
      urgency: urgencyLevel,
      weldingProcess,
      scale: projectScale,
      estimatedHours,
      certification: certificationRequired,
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
    fetchBusinessStats();
  };

  const handleConvertToInvoice = async () => {
    if (!user?.uid) return;
    if (!quoteId) {
      alert("Please save the quote first before converting to invoice");
      return;
    }
    if (!window.confirm("Convert this quote to an invoice?")) return;
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

  // ============================================================================
  // Handlers – new document
  // ============================================================================
  const handleNewDocument = () => {
    setQuoteId(null);
    setQuoteNumber("");
    setCustomerName("ABC Manufacturing Ltd");
    setCustomerEmail("procurement@abcmfg.co.za");
    setCustomerPhone("+27 11 456 7890");
    setProjectAddress("Industrial Park, 123 Factory Road, Germiston, 1401");
    setWeldingProcess("MIG/GMAW");
    setProjectScale("Medium");
    setEstimatedHours("40");
    setCertificationRequired("Yes");
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

  // ============================================================================
  // Handlers – line items
  // ============================================================================
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
        workCategory: newItem.workCategory || "Structural Welding",
        rate,
        qty,
        amount,
        taxRate,
        taxAmount,
        totalAmount: amount + taxAmount,
        urgency: newItem.urgency || "Standard",
        phase: newItem.phase || "Phase 1",
      },
    ]);
    setNewItem({
      description: "",
      rate: "",
      qty: "",
      workCategory: "Structural Welding",
      taxRate: "15",
      urgency: "Standard",
      phase: "Phase 1",
    });
  };

  const handleRemoveItem = (index) =>
    setItems((prev) => prev.filter((_, i) => i !== index));

  // ============================================================================
  // Handlers – payment
  // ============================================================================
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
  };

  // ============================================================================
  // Handlers – settings / logo / print / PDF
  // ============================================================================
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

  const printStyles = `@media print { * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } html,body { margin:0!important;padding:0!important;width:210mm!important;background:white!important; } body * { visibility:hidden!important; } #print-area,#print-area * { visibility:visible!important; } #print-area { display:block!important;position:absolute!important;left:0!important;top:0!important;width:210mm!important;min-height:297mm!important;margin:0!important;padding:0!important;background:white!important; } @page { size:A4 portrait;margin:40px!important; } }`;

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
    setProjectAddress(savedQuote.customer.address);
    setTimeout(() => window.print(), 300);
  };

  const handleAIDataExtracted = (extractedData) => {
    if (extractedData.customer?.name)
      setCustomerName(extractedData.customer.name);
    if (extractedData.customer?.email)
      setCustomerEmail(extractedData.customer.email);
    if (extractedData.customer?.phone)
      setCustomerPhone(extractedData.customer.phone);
    if (extractedData.customer?.address)
      setProjectAddress(extractedData.customer.address);
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

  // ── Header actions ─────────────────────────────────────────────────────────
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
    {
      label: "Logout",
      icon: LogOut,
      onClick: handleLogout,
      className:
        "flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#f1f5f9] text-[#64748b] border border-[#e2e8f0] text-sm font-medium rounded-md transition-colors whitespace-nowrap",
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

  // ── Helpers ────────────────────────────────────────────────────────────────
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

  // ── Stat card ──────────────────────────────────────────────────────────────
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

  // ── Shared template props ──────────────────────────────────────────────────
  const templateProps = {
    templateId: selectedTemplate,
    businessInfo,
    loading,
    jobCardNumber: quoteNumber,
    customerName,
    customerEmail,
    customerPhone,
    customerAddress: projectAddress,
    equipmentType: projectType,
    equipmentManufacturer: materialType,
    equipmentModel: weldingProcess,
    equipmentSerial: `W-${materialThickness}mm`,
    equipmentId: `WLD-${projectScale}`,
    equipmentLocation: projectAddress,
    serviceCode: quoteNumber,
    serviceType: "WELDING SERVICE",
    items,
    subtotal,
    vat: totalTax,
    total,
    documentType,
    stampText: stampSettings.text,
    stampColor: stampSettings.color,
    showStampDate: stampSettings.showDate,
    showStamp: stampSettings.enabled && paymentStatus.status === "paid",
    paymentStatus,
  };

  // ── Home view ──────────────────────────────────────────────────────────────
  const HomeViewLocal = () => (
    <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-4">
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
          iconBg="bg-[#fff7ed]"
          iconColor="text-[#ea580c]"
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
          iconBg="bg-[#faf5ff]"
          iconColor="text-[#7c3aed]"
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
                label: "New Quote",
                icon: FileText,
                onClick: () => {
                  handleNewQuote();
                  setActiveView("quote");
                },
                bg: "bg-[#fff7ed]",
                hover: "hover:bg-[#ffedd5]",
                border: "border-[#fed7aa]",
                iconBg: "bg-[#ea580c]",
                text: "text-[#9a3412]",
              },
              {
                label: "New Invoice",
                icon: Receipt,
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
                label: "Customers",
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
            Recent Quotes & Invoices
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
                <Flame className="w-5 h-5 text-[#94a3b8]" />
              </div>
              <p className="text-sm font-medium text-[#374151] mb-1">
                No quotes yet
              </p>
              <p className="text-xs text-[#94a3b8] mb-3">
                Create your first welding quote to get started
              </p>
              <button
                onClick={() => {
                  handleNewQuote();
                  setActiveView("quote");
                }}
                className="px-4 py-1.5 bg-[#ea580c] hover:bg-[#c2410c] text-white rounded-lg text-xs font-medium transition-colors"
              >
                Create Quote
              </button>
            </div>
          ) : (
            invoices.slice(0, 8).map((invoice) => (
              <div
                key={invoice.id}
                onClick={() => loadQuote(invoice)}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-[#f8fafc] cursor-pointer transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-[#1e293b] truncate">
                      {invoice.quoteNumber || invoice.id}
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
                    {invoice.projectDetails?.type && (
                      <span className="flex items-center gap-1 truncate">
                        <Flame className="w-3 h-3 flex-shrink-0" />
                        {invoice.projectDetails.type}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right ml-4 flex-shrink-0">
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
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  // ── RENDER ─────────────────────────────────────────────────────────────────
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
        {/* ── Sidebar ─────────────────────────────────────────────────────── */}
        {sidebarOpen && isMobile && (
          <div
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <div
          className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} fixed z-50 w-64 bg-gradient-to-b from-stone-900 via-stone-800 to-stone-900 border-r border-stone-700/50 transition-transform duration-300 h-full print:hidden shadow-2xl overflow-y-auto lg:relative lg:translate-x-0 lg:flex-shrink-0`}
        >
          <div className="p-4 md:p-5">
            {/* Sidebar header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-1 rounded-xl">
                  <img
                    src={logo}
                    alt="Logo"
                    className="w-10 h-8 object-contain rounded-lg bg-white/10"
                  />
                </div>
                <div>
                  <p className="text-xs font-bold text-white truncate max-w-[120px]">
                    {businessInfo.businessName}
                  </p>
                  <p className="text-xs text-orange-400">Welding</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-1.5 text-stone-400 hover:text-white hover:bg-stone-700/50 rounded-lg transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <nav className="space-y-1">
              <div
                onClick={() => {
                  setActiveView("home");
                  if (isMobile) setSidebarOpen(false);
                }}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all border ${activeView === "home" ? "bg-stone-700/60 text-white border-stone-600" : "text-orange-300 hover:text-white hover:bg-stone-700/30 border-transparent hover:border-orange-500/30"}`}
              >
                <Home className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-semibold">Home</span>
              </div>

              <div
                onClick={() => {
                  setShowSettings(true);
                  if (isMobile) setSidebarOpen(false);
                }}
                className="group flex items-center gap-3 px-3 py-2.5 text-orange-300 hover:text-white hover:bg-stone-700/30 rounded-xl cursor-pointer transition-all border border-transparent hover:border-orange-500/30"
              >
                <Settings className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-semibold">Settings</span>
              </div>

              <div className="pt-3 mt-3 border-t border-stone-700/50">
                <div
                  onClick={() => {
                    setActiveView("financial-overview");
                    if (isMobile) setSidebarOpen(false);
                  }}
                  className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all border ${activeView === "financial-overview" ? "bg-stone-700/60 text-white border-stone-600" : "text-orange-300 hover:text-white hover:bg-stone-700/30 border-transparent hover:border-orange-500/30"}`}
                >
                  <TrendingUp className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs font-semibold">
                    Financial Dashboard
                  </span>
                </div>

                {/* Quotes & Invoices */}
                <div className="mt-1">
                  <div className="group flex items-center justify-between px-3 py-2.5 text-orange-300 hover:text-white hover:bg-stone-700/30 rounded-xl cursor-pointer transition-all border border-transparent hover:border-orange-500/30">
                    <div className="flex items-center gap-3">
                      <Receipt className="w-4 h-4 flex-shrink-0" />
                      <span className="text-xs font-semibold">
                        Quotes & Invoices
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" />
                  </div>
                  <div className="ml-5 mt-1 space-y-0.5 border-l border-stone-700/50 pl-3">
                    <div
                      onClick={() => {
                        handleNewQuote();
                        setActiveView("quote");
                        if (isMobile) setSidebarOpen(false);
                      }}
                      className="flex items-center gap-2 px-2 py-2 text-orange-400 hover:text-white hover:bg-stone-700/30 rounded-lg cursor-pointer transition-all text-xs"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0" />{" "}
                      Create Quote
                    </div>
                    <div
                      onClick={() => {
                        handleNewInvoice();
                        setActiveView("quote");
                        if (isMobile) setSidebarOpen(false);
                      }}
                      className="flex items-center gap-2 px-2 py-2 text-orange-400 hover:text-white hover:bg-stone-700/30 rounded-lg cursor-pointer transition-all text-xs"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />{" "}
                      Create Invoice
                    </div>
                    <div
                      onClick={() => {
                        setShowQuotesList(!showQuotesList);
                        if (isMobile) setSidebarOpen(false);
                      }}
                      className="flex items-center justify-between px-2 py-2 text-orange-400 hover:text-white hover:bg-stone-700/30 rounded-lg cursor-pointer transition-all text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500 flex-shrink-0" />
                        All {documentType === "quote" ? "Quotes" : "Invoices"}
                      </div>
                      <span className="bg-orange-600 text-white px-1.5 py-0.5 rounded text-xs font-bold">
                        {savedQuotes.length}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Clients */}
                <div className="mt-1">
                  <div
                    onClick={() => setIsClientsOpen(!isClientsOpen)}
                    className="group flex items-center justify-between px-3 py-2.5 text-orange-300 hover:text-white hover:bg-stone-700/30 rounded-xl cursor-pointer transition-all border border-transparent hover:border-amber-500/30"
                  >
                    <div className="flex items-center gap-3">
                      <Users className="w-4 h-4 flex-shrink-0" />
                      <span className="text-xs font-semibold">Clients</span>
                    </div>
                    <ChevronDown
                      className={`w-3.5 h-3.5 flex-shrink-0 transition-transform duration-300 ${isClientsOpen ? "rotate-180" : ""}`}
                    />
                  </div>
                  <div
                    className={`ml-5 mt-1 space-y-0.5 border-l border-stone-700/50 pl-3 overflow-hidden transition-all duration-300 ${isClientsOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}
                  >
                    <div
                      onClick={() => {
                        handleAddNewCustomer();
                        if (isMobile) setSidebarOpen(false);
                      }}
                      className="flex items-center gap-2 px-2 py-2 text-orange-400 hover:text-white hover:bg-stone-700/30 rounded-lg cursor-pointer transition-all text-xs"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />{" "}
                      Add Client
                    </div>
                    <div
                      onClick={() => {
                        setShowCustomersListModal(true);
                        if (isMobile) setSidebarOpen(false);
                      }}
                      className="flex items-center justify-between px-2 py-2 text-orange-400 hover:text-white hover:bg-stone-700/30 rounded-lg cursor-pointer transition-all text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />{" "}
                        All Clients
                      </div>
                      <span className="bg-amber-600 text-white px-1.5 py-0.5 rounded text-xs font-bold">
                        {savedCustomers.length}
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => {
                    setActiveView("templates");
                    if (isMobile) setSidebarOpen(false);
                  }}
                  className={`group flex items-center gap-3 px-3 py-2.5 mt-1 rounded-xl cursor-pointer transition-all border ${activeView === "templates" ? "bg-stone-700/60 text-white border-stone-600" : "text-orange-300 hover:text-white hover:bg-stone-700/30 border-transparent hover:border-orange-500/30"}`}
                >
                  <FileText className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs font-semibold">
                    Invoice Templates
                  </span>
                </div>

                <div
                  onClick={() => {
                    setActiveView("schedule");
                    if (isMobile) setSidebarOpen(false);
                  }}
                  className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all border ${activeView === "schedule" ? "bg-stone-700/60 text-white border-stone-600" : "text-orange-300 hover:text-white hover:bg-stone-700/30 border-transparent hover:border-orange-500/30"}`}
                >
                  <Calendar className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs font-semibold">Schedule</span>
                </div>
              </div>
            </nav>
          </div>

          {/* Sidebar user profile */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-stone-700/50 bg-gradient-to-t from-stone-900 to-transparent">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white rounded-full ring-2 ring-stone-700 shadow flex-shrink-0 overflow-hidden">
                <img
                  src={businessInfo.logoUrl}
                  alt="Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-white truncate">
                  {user?.name || "User"}
                </div>
                <div className="text-xs text-orange-400 truncate">
                  {user?.email || "email@example.com"}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="text-stone-400 hover:text-white p-1.5 rounded-lg hover:bg-stone-700/50 transition-all flex-shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Main content ─────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          <AppHeader
            actions={headerActions}
            mobileActions={mobileDashboardActions}
            onSettingsOpen={() => setShowSettings(true)}
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

          {/* Saved quotes modal */}
          {showQuotesList && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden border border-[#e2e8f0]">
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0] bg-[#f8fafc]">
                  <div>
                    <h2 className="text-base font-semibold text-[#1e293b]">
                      Saved {documentType === "quote" ? "Quotes" : "Invoices"}
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
                            "Project Type",
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
                            onClick={() => {
                              loadQuote(quote);
                              setShowQuotesList(false);
                            }}
                            className="border-b border-[#f1f5f9] hover:bg-[#f8fafc] cursor-pointer transition-colors"
                          >
                            <td className="px-5 py-3 text-sm font-semibold text-[#ea580c]">
                              {quote.quoteNumber || "N/A"}
                            </td>
                            <td className="px-5 py-3 text-sm text-[#374151]">
                              {quote.customer?.name || "N/A"}
                            </td>
                            <td className="px-5 py-3 text-sm text-[#374151]">
                              {quote.projectDetails?.type || "N/A"}
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

          {/* All invoices modal */}
          {showInvoicesList && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden border border-[#e2e8f0]">
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0] bg-[#f8fafc]">
                  <div>
                    <h2 className="text-base font-semibold text-[#1e293b]">
                      All Quotes & Invoices
                    </h2>
                    <p className="text-xs text-[#64748b] mt-0.5">
                      {savedQuotes.length} records
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
                            "Project Type",
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
                            onClick={() => {
                              loadQuote(quote);
                              setShowInvoicesList(false);
                            }}
                            className="border-b border-[#f1f5f9] hover:bg-[#f8fafc] cursor-pointer transition-colors"
                          >
                            <td className="px-5 py-3 text-sm font-semibold text-[#ea580c]">
                              {quote.quoteNumber || "N/A"}
                            </td>
                            <td className="px-5 py-3 text-sm text-[#374151]">
                              {quote.customer?.name || "N/A"}
                            </td>
                            <td className="px-5 py-3 text-sm text-[#374151]">
                              {quote.projectDetails?.type || "N/A"}
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

          {/* Invoice Preview Modal */}
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
                    style={{ width: "210mm", minHeight: "297mm" }}
                  >
                    <TemplateRenderer {...templateProps} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Views ───────────────────────────────────────────────────────── */}
          {activeView === "home" && <HomeViewLocal />}
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

          {/* ── Quote / Invoice Builder ────────────────────────────────────── */}
          {activeView === "quote" && (
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
                        icon: DollarSign,
                        iconBg: "bg-[#fff7ed]",
                        iconColor: "text-[#ea580c]",
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

                  {/* Main card */}
                  <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
                    {/* Input mode tabs */}
                    <div className="flex border-b border-[#e2e8f0] bg-[#f8fafc]">
                      <button
                        onClick={() => setInputMode("manual")}
                        className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all border-b-2 -mb-px ${inputMode === "manual" ? "border-[#ea580c] text-[#ea580c] bg-white" : "border-transparent text-[#64748b] hover:text-[#374151]"}`}
                      >
                        <Edit className="w-4 h-4" /> Manual Entry
                      </button>
                      <button
                        onClick={() => setInputMode("ai")}
                        className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all border-b-2 -mb-px ${inputMode === "ai" ? "border-[#7c3aed] text-[#7c3aed] bg-white" : "border-transparent text-[#64748b] hover:text-[#374151]"}`}
                      >
                        <Sparkles className="w-4 h-4" /> AI Assistant
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
                      <>
                        {/* Step indicator */}
                        <div className="px-6 py-4 border-b border-[#e2e8f0] bg-[#f8fafc]">
                          <div className="flex items-center gap-0">
                            {steps.map((step, idx) => (
                              <React.Fragment key={step.number}>
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${currentStep === step.number ? "bg-[#ea580c] text-white" : currentStep > step.number ? "bg-[#dcfce7] text-[#059669] ring-1 ring-[#059669]" : "bg-[#e2e8f0] text-[#94a3b8]"}`}
                                  >
                                    {currentStep > step.number
                                      ? "✓"
                                      : step.number}
                                  </div>
                                  <span
                                    className={`text-xs font-medium hidden sm:block ${currentStep === step.number ? "text-[#ea580c]" : currentStep > step.number ? "text-[#059669]" : "text-[#94a3b8]"}`}
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
                                    placeholder: "ABC Manufacturing Ltd",
                                    required: true,
                                  },
                                  {
                                    label: "Email",
                                    value: customerEmail,
                                    set: setCustomerEmail,
                                    type: "email",
                                    placeholder: "procurement@company.co.za",
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
                                    Project Address{" "}
                                    <span className="text-[#dc2626] normal-case tracking-normal font-normal">
                                      *
                                    </span>
                                  </label>
                                  <input
                                    type="text"
                                    value={projectAddress}
                                    onChange={(e) =>
                                      setProjectAddress(e.target.value)
                                    }
                                    placeholder="45 Corporate Boulevard, Sandton, Johannesburg, 2196"
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
                                  <Flame className="w-5 h-5 text-[#ea580c]" />
                                </div>
                                <div>
                                  <h2 className="text-base font-semibold text-[#1e293b]">
                                    Project Details
                                  </h2>
                                  <p className="text-xs text-[#64748b]">
                                    Provide specifications for an accurate quote
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
                                    <option value="Structural Welding">
                                      Structural Welding
                                    </option>
                                    <option value="Pipe Welding">
                                      Pipe Welding
                                    </option>
                                    <option value="Custom Fabrication">
                                      Custom Fabrication
                                    </option>
                                    <option value="Metal Repairs">
                                      Metal Repairs
                                    </option>
                                    <option value="Industrial">
                                      Industrial
                                    </option>
                                  </select>
                                </div>
                                <div>
                                  <label className={labelCls}>
                                    Material Type
                                  </label>
                                  <select
                                    value={materialType}
                                    onChange={(e) =>
                                      setMaterialType(e.target.value)
                                    }
                                    className={selectCls}
                                  >
                                    <option value="Mild Steel">
                                      Mild Steel
                                    </option>
                                    <option value="Stainless Steel">
                                      Stainless Steel
                                    </option>
                                    <option value="Aluminium">Aluminium</option>
                                    <option value="Cast Iron">Cast Iron</option>
                                    <option value="Galvanized Steel">
                                      Galvanized Steel
                                    </option>
                                  </select>
                                </div>
                                <div>
                                  <label className={labelCls}>
                                    Material Thickness (mm)
                                  </label>
                                  <input
                                    type="number"
                                    value={materialThickness}
                                    onChange={(e) =>
                                      setMaterialThickness(e.target.value)
                                    }
                                    placeholder="10"
                                    className={inputCls}
                                  />
                                </div>
                                <div>
                                  <label className={labelCls}>
                                    Urgency Level
                                  </label>
                                  <select
                                    value={urgencyLevel}
                                    onChange={(e) =>
                                      setUrgencyLevel(e.target.value)
                                    }
                                    className={selectCls}
                                  >
                                    <option value="Standard">Standard</option>
                                    <option value="Priority">Priority</option>
                                    <option value="Emergency">Emergency</option>
                                  </select>
                                </div>
                                <div>
                                  <label className={labelCls}>
                                    Welding Process
                                  </label>
                                  <select
                                    value={weldingProcess}
                                    onChange={(e) =>
                                      setWeldingProcess(e.target.value)
                                    }
                                    className={selectCls}
                                  >
                                    <option value="MIG/GMAW">MIG/GMAW</option>
                                    <option value="TIG/GTAW">TIG/GTAW</option>
                                    <option value="Stick/SMAW">
                                      Stick/SMAW
                                    </option>
                                    <option value="Flux-Cored">
                                      Flux-Cored
                                    </option>
                                    <option value="Submerged Arc">
                                      Submerged Arc
                                    </option>
                                  </select>
                                </div>
                                <div>
                                  <label className={labelCls}>
                                    Project Scale
                                  </label>
                                  <select
                                    value={projectScale}
                                    onChange={(e) =>
                                      setProjectScale(e.target.value)
                                    }
                                    className={selectCls}
                                  >
                                    <option value="Small">Small</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Large">Large</option>
                                    <option value="Enterprise">
                                      Enterprise
                                    </option>
                                  </select>
                                </div>
                                <div>
                                  <label className={labelCls}>
                                    Estimated Hours
                                  </label>
                                  <input
                                    type="number"
                                    value={estimatedHours}
                                    onChange={(e) =>
                                      setEstimatedHours(e.target.value)
                                    }
                                    placeholder="40"
                                    className={inputCls}
                                  />
                                </div>
                                <div>
                                  <label className={labelCls}>
                                    Certification Required
                                  </label>
                                  <select
                                    value={certificationRequired}
                                    onChange={(e) =>
                                      setCertificationRequired(e.target.value)
                                    }
                                    className={selectCls}
                                  >
                                    <option value="Yes">Yes</option>
                                    <option value="No">No</option>
                                    <option value="Optional">Optional</option>
                                  </select>
                                </div>
                              </div>

                              <div className="mt-5 p-4 bg-[#fff7ed] border border-[#fed7aa] rounded-xl">
                                <h3 className="text-sm font-semibold text-[#9a3412] mb-2 flex items-center gap-2">
                                  <MapPin className="w-4 h-4" /> Project Summary
                                </h3>
                                <div className="text-xs text-[#c2410c] space-y-1">
                                  <p>
                                    <span className="font-semibold">Type:</span>{" "}
                                    {projectType} |{" "}
                                    <span className="font-semibold">
                                      Process:
                                    </span>{" "}
                                    {weldingProcess}
                                  </p>
                                  <p>
                                    <span className="font-semibold">
                                      Material:
                                    </span>{" "}
                                    {materialType} ({materialThickness}mm) |{" "}
                                    <span className="font-semibold">
                                      Scale:
                                    </span>{" "}
                                    {projectScale}
                                  </p>
                                  <p>
                                    <span className="font-semibold">
                                      Est. Hours:
                                    </span>{" "}
                                    {estimatedHours}h |{" "}
                                    <span className="font-semibold">
                                      Urgency:
                                    </span>{" "}
                                    {urgencyLevel}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Step 3 – Welding Work items */}
                          {currentStep === 3 && (
                            <div>
                              <div className="flex items-center gap-3 mb-5">
                                <div className="w-9 h-9 bg-[#f8fafc] rounded-lg flex items-center justify-center">
                                  <Wrench className="w-5 h-5 text-[#475569]" />
                                </div>
                                <div>
                                  <h2 className="text-base font-semibold text-[#1e293b]">
                                    Welding Work Items
                                  </h2>
                                  <p className="text-xs text-[#64748b]">
                                    Add work items and materials to the quote
                                  </p>
                                </div>
                              </div>

                              {/* Add item form */}
                              <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-5 mb-5">
                                <h3 className="text-sm font-semibold text-[#374151] mb-4 flex items-center gap-2">
                                  <Plus className="w-4 h-4 text-[#ea580c]" />{" "}
                                  Add Work Item
                                </h3>
                                <div className="grid grid-cols-1 gap-3">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                                        <option value="Structural Welding">
                                          Structural Welding
                                        </option>
                                        <option value="Pipe Welding">
                                          Pipe Welding
                                        </option>
                                        <option value="TIG/GTAW Welding">
                                          TIG/GTAW Welding
                                        </option>
                                        <option value="MIG/GMAW Welding">
                                          MIG/GMAW Welding
                                        </option>
                                        <option value="Stick/SMAW Welding">
                                          Stick/SMAW Welding
                                        </option>
                                        <option value="Fabrication & Assembly">
                                          Fabrication & Assembly
                                        </option>
                                        <option value="Metal Repairs">
                                          Metal Repairs
                                        </option>
                                        <option value="Custom Metalwork">
                                          Custom Metalwork
                                        </option>
                                        <option value="On-site Welding">
                                          On-site Welding
                                        </option>
                                        <option value="Inspection & Testing">
                                          Inspection & Testing
                                        </option>
                                        <option value="Heat Treatment">
                                          Heat Treatment
                                        </option>
                                        <option value="Equipment Rental">
                                          Equipment Rental
                                        </option>
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
                                        <option value="Phase 1">Phase 1</option>
                                        <option value="Phase 2">Phase 2</option>
                                        <option value="Phase 3">Phase 3</option>
                                        <option value="Phase 4">Phase 4</option>
                                        <option value="Ongoing">Ongoing</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div>
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
                                      <label className={labelCls}>
                                        Qty / Units
                                      </label>
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
                                      <label className={labelCls}>
                                        VAT (%)
                                      </label>
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
                                        className="w-full flex items-center justify-center gap-1.5 px-4 py-2 bg-[#ea580c] hover:bg-[#c2410c] text-white text-sm font-medium rounded-md transition-colors"
                                      >
                                        <Plus className="w-4 h-4" /> Add
                                      </button>
                                    </div>
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
                                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-[#fff7ed] text-[#c2410c]">
                                                {item.workCategory || "General"}
                                              </span>
                                            </td>
                                            <td className="px-4 py-3">
                                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-[#eff6ff] text-[#1d4ed8]">
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
                                                <Trash2 className="w-3.5 h-3.5" />
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
                                        <span className="text-[#ea580c]">
                                          R{total.toFixed(2)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="border-2 border-dashed border-[#e2e8f0] rounded-xl py-12 text-center">
                                  <Flame className="w-8 h-8 text-[#cbd5e1] mx-auto mb-3" />
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
                                    Review quote details and payment terms
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
                                    bg: "bg-[#fff7ed]",
                                    border: "border-[#fed7aa]",
                                    text: "text-[#ea580c]",
                                    iconBg: "bg-[#ea580c]",
                                  },
                                  {
                                    label: "Work Items",
                                    value: items.length,
                                    icon: ClipboardList,
                                    bg: "bg-[#f0fdf4]",
                                    border: "border-[#bbf7d0]",
                                    text: "text-[#059669]",
                                    iconBg: "bg-[#059669]",
                                  },
                                  {
                                    label: "VAT Amount",
                                    value: `R${totalTax.toFixed(2)}`,
                                    icon: Receipt,
                                    bg: "bg-[#faf5ff]",
                                    border: "border-[#e9d5ff]",
                                    text: "text-[#7c3aed]",
                                    iconBg: "bg-[#7c3aed]",
                                  },
                                ].map(
                                  ({
                                    label,
                                    value,
                                    icon: Icon,
                                    bg,
                                    border,
                                    text,
                                    iconBg,
                                  }) => (
                                    <div
                                      key={label}
                                      className={`${bg} border ${border} rounded-xl p-4`}
                                    >
                                      <div className="flex items-center justify-between mb-2">
                                        <span
                                          className={`text-xs font-semibold ${text}`}
                                        >
                                          {label}
                                        </span>
                                        <div
                                          className={`w-7 h-7 ${iconBg} rounded-lg flex items-center justify-center`}
                                        >
                                          <Icon className="w-3.5 h-3.5 text-white" />
                                        </div>
                                      </div>
                                      <div
                                        className={`text-xl font-bold ${text}`}
                                      >
                                        {value}
                                      </div>
                                    </div>
                                  ),
                                )}
                              </div>


                              {/* Quote summary */}
                              <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-5 mb-5">
                                <h3 className="text-sm font-semibold text-[#374151] mb-4">
                                  Quote Summary
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                  <div>
                                    <h4 className="text-xs font-semibold text-[#64748b] uppercase tracking-wide mb-2 flex items-center gap-1.5">
                                      <Users className="w-3 h-3" /> Client
                                      Details
                                    </h4>
                                    <div className="text-sm text-[#374151] space-y-0.5">
                                      <p className="font-semibold text-[#1e293b]">
                                        {customerName}
                                      </p>
                                      <p>{customerEmail}</p>
                                      <p>{customerPhone}</p>
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="text-xs font-semibold text-[#64748b] uppercase tracking-wide mb-2 flex items-center gap-1.5">
                                      <Building className="w-3 h-3" /> Project
                                      Details
                                    </h4>
                                    <div className="text-sm text-[#374151] space-y-0.5">
                                      <p className="font-semibold text-[#1e293b]">
                                        {projectType}
                                      </p>
                                      <p>
                                        {materialType} · {materialThickness}mm ·{" "}
                                        {weldingProcess}
                                      </p>
                                      <p>
                                        {projectScale} scale · {estimatedHours}h
                                        estimated
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {quoteId && (
                                <button
                                  onClick={handleProcessPayment}
                                  className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-[#059669] hover:bg-[#047857] text-white rounded-xl font-medium transition-colors shadow-sm"
                                >
                                  <CreditCard className="w-4 h-4" /> Process
                                  Payment
                                </button>
                              )}

                              {!quoteId && (
                                <div className="flex items-center gap-2 px-4 py-3 bg-[#fff7ed] border border-[#fed7aa] rounded-lg text-sm text-[#9a3412]">
                                  <Receipt className="w-4 h-4 flex-shrink-0" />{" "}
                                  Save the {documentType} first to process
                                  payment
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
                              className="flex items-center gap-1.5 px-4 py-2 bg-[#ea580c] hover:bg-[#c2410c] text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
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
                  <TemplateSelector />
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handlePrint}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-[#e2e8f0] text-[#374151] text-xs font-medium rounded-lg hover:bg-[#f1f5f9] transition-colors"
                    >
                      <Printer className="w-3 h-3" /> Print
                    </button>
                    <button
                      onClick={handleSavePDF}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-[#059669] text-white text-xs font-medium rounded-lg hover:bg-[#047857] transition-colors"
                    >
                      <Download className="w-3 h-3" /> PDF
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

export default WeldingDashboard;
