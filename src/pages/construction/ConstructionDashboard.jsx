import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { serverTimestamp } from "firebase/firestore";
import logo from "../../assets/img/solidflo-logo.png";
import { getAuth, signOut } from "firebase/auth";
import FinancialOverview from "../FinancialOverview";
import uploadLogoToR2 from "../../utils/uploadLogoToR2";
import Templates from "./Templates";
import TemplateSelector, { TemplateRenderer } from "./TemplateSelector";
import PaymentProcessor from "../../components/dashboard/PaymentProcessor";
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
import { Printer, Download, Sparkles, Trash2, Home as HomeIcon, HardHat } from "lucide-react";
import { db } from "../../firebase";
import CustomerModal from "../CustomerModal";
import CustomersListModal from "../CustomersListModal";
import HistoryView from "./HistoryView";
import NotesView from "./NotesView";
import SignatureStamp from "../SignatureStamp";
import AIInvoiceExtractor from "../AIInvoiceExtractor";
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
  Menu,
  Plus,
  Send,
  Save,
  Edit,
  LogOut,
  CheckSquare,
  TrendingUp,
  CreditCard,
  Receipt,
  Wallet,
  PieChart,
  ClipboardList,
  Upload,
  DollarSign,
  Building,
  FileBarChart,
  Calculator,
  Briefcase,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  MapPin,
  Clock,
  Wrench,
  Layers,
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
    if (match) {
      lastNumber = Number(match[1]);
    }
  }

  const nextNumber = lastNumber + 1;
  return `${prefix}-${year}-${String(nextNumber).padStart(4, "0")}`;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
const ConstructionDashboard = () => {
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
  const [activeTab, setActiveTab] = useState("Quote");
  const [quoteNumber, setQuoteNumber] = useState("");
  const [quoteId, setQuoteId] = useState(null);
  const [savedQuotes, setSavedQuotes] = useState([]);
  const [showQuotesList, setShowQuotesList] = useState(false);
  const [documentType, setDocumentType] = useState("quote");

  // ── views / modals ───────────────────────────────────────────────────────
  const [showSettings, setShowSettings] = useState(false);
  const [activeView, setActiveView] = useState("quote");
  const [showCustomersListModal, setShowCustomersListModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // ── customers ────────────────────────────────────────────────────────────
  const [customers, setCustomers] = useState([]);
  const [savedCustomers, setSavedCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

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
const [isQuotesInvoicesOpen2, setIsQuotesInvoicesOpen2] = useState(false);
  const [isClientsOpen, setIsClientsOpen] = useState(false);
  // ── stamp ────────────────────────────────────────────────────────────────
  const [stampSettings, setStampSettings] = useState({
    text: "PAID",
    color: "#22c55e",
    showDate: true,
    enabled: true,
  });

  // ── client / site fields ─────────────────────────────────────────────────
  const [customerName, setCustomerName] = useState("Meridian Developments");
  const [customerEmail, setCustomerEmail] = useState("projects@meridian.co.za");
  const [customerPhone, setCustomerPhone] = useState("+27 11 234 5678");
  const [propertyAddress, setPropertyAddress] = useState(
    "45 Corporate Boulevard, Sandton, Johannesburg, 2196",
  );

  // ── site-detail fields ───────────────────────────────────────────────────
  const [siteType, setSiteType] = useState("Commercial");
  const [siteSize, setSiteSize] = useState("1200");
  const [floors, setFloors] = useState("3");
  const [phases, setPhases] = useState("2");

  // ── business info ────────────────────────────────────────────────────────
  const [businessInfo, setBusinessInfo] = useState({
    businessName: "APEX CONSTRUCTION CO.",
    addressLine1: "12 Industrial Park",
    addressLine2: "Kempton Park",
    city: "Johannesburg",
    postalCode: "1619",
    primaryPhone: "+27 11 777 0001",
    secondaryPhone: "+27 11 777 0002",
    email: "info@apexconstruction.co.za",
    website: "www.apexconstruction.co.za",
    registrationNumber: "2023/089412/07",
    vatNumber: "7891234567",
    logoUrl: "",
  });
  const [loading, setLoading] = useState(true);

  // ── line-item state ──────────────────────────────────────────────────────
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({
    description: "",
    rate: "",
    qty: "",
    workCategory: "Foundation Work",
    taxRate: "15",
    phase: "Phase 1",
  });

  // ── derived totals ───────────────────────────────────────────────────────
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const totalTax = items.reduce((sum, item) => sum + item.taxAmount, 0);
  const total = subtotal + totalTax;

  // ── step definitions ─────────────────────────────────────────────────────
  const steps = [
    { number: 1, title: "Client Info", icon: Users },
    { number: 2, title: "Site Details", icon: Building },
    { number: 3, title: "Scope of Work", icon: Wrench },
    { number: 4, title: "Schedule & Payment", icon: Calendar },
  ];

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

  // responsive
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

  useEffect(() => {
    if (user?.uid) loadBusinessInfo();
  }, [user]);

  // duplicate fetch kept for parity with original (sets loading = false)
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
    if (!quoteId) {
      setPaymentStatus({ totalPaid: 0, balanceDue: total, status: "pending" });
    }
  }, [total, quoteId]);

  // ============================================================================
  // Data loaders
  // ============================================================================
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

  const loadSavedCustomers = async () => {
    if (!user?.uid) return;
    const db = getFirestore();
    const customersRef = collection(db, "users", user.uid, "clients");
    const q = query(customersRef, orderBy("createdAt", "desc"), limit(50));
    const snapshot = await getDocs(q);
    const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    setSavedCustomers(list.filter((c) => !c._placeholder));
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
      const quoteDoc = await getDoc(doc(db, "users", user.uid, collectionName, quoteId));
      if (quoteDoc.exists()) {
        const data = quoteDoc.data();
        setPaymentStatus({
          totalPaid: data.totals?.paid || 0,
          balanceDue: data.totals?.due || data.totals?.total || 0,
          status: data.status || "pending",
        });
      } else {
        setPaymentStatus({ totalPaid: 0, balanceDue: total, status: "pending" });
      }
    } catch (error) {
      console.error("Error loading payment status:", error);
      setPaymentStatus({ totalPaid: 0, balanceDue: total, status: "pending" });
    }
  };

  const loadQuoteForExport = async () => {
    if (!user?.uid || !quoteId) return null;
    const db = getFirestore();
    const collectionName = documentType === "quote" ? "quotes" : "invoices";
    const snap = await getDoc(doc(db, "users", user.uid, collectionName, quoteId));
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
    setPropertyAddress(customer.address || "");
  };

  const handleCustomerSaved = () => { loadCustomers(); };

  // ============================================================================
  // Handlers – quote / invoice CRUD
  // ============================================================================
  const loadQuote = (quote) => {
    setQuoteId(quote.id);
    setQuoteNumber(quote.quoteNumber || "");
    setCustomerName(quote.customer?.name || "");
    setCustomerEmail(quote.customer?.email || "");
    setCustomerPhone(quote.customer?.phone || "");
    setPropertyAddress(quote.customer?.address || "");
    setSiteType(quote.siteDetails?.type || "");
    setSiteSize(quote.siteDetails?.size || "");
    setFloors(quote.siteDetails?.floors || "");
    setPhases(quote.siteDetails?.phases || "");
    setItems(quote.items || []);
    setShowQuotesList(false);
    setPaymentStatus({
      totalPaid: quote.totals?.paid || 0,
      balanceDue: quote.totals?.due || quote.totals?.total || 0,
      status: quote.status || "pending",
    });
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

    siteDetails: {
      type: siteType,
      size: siteSize,
      floors,
      phases,
    },

    items,

    totals: {
      subtotal,
      tax: totalTax,
      total,
      paid: 0,
      due: total,
    },

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

    alert(`${documentType === "quote" ? "Quote" : "Invoice"} saved successfully`);
    loadSavedQuotes();
  };

  const handleConvertToInvoice = async () => {
    if (!user?.uid) return;
    if (!quoteId) {
      alert("Please save the quote first before converting to invoice");
      return;
    }
    if (!window.confirm("Convert this quote to an invoice? This will create a new invoice with the same details.")) return;

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
      console.error("Error converting quote to invoice:", error);
      alert("Failed to convert quote to invoice");
    }
  };

  // ============================================================================
  // Handlers – new document
  // ============================================================================
  const handleNewDocument = () => {
    setQuoteId(null);
    setQuoteNumber("");
    setCustomerName("Meridian Developments");
    setCustomerEmail("projects@meridian.co.za");
    setCustomerPhone("+27 11 234 5678");
    setPropertyAddress("45 Corporate Boulevard, Sandton, Johannesburg, 2196");
    setSiteType("Commercial");
    setSiteSize("1200");
    setFloors("3");
    setPhases("2");
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
        workCategory: newItem.workCategory || "Foundation Work",
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
      workCategory: "Foundation Work",
      taxRate: "15",
      phase: "Phase 1",
    });
  };

  const handleRemoveItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

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
      const quoteDoc = await getDoc(doc(db, "users", user.uid, collectionName, quoteId));
      if (quoteDoc.exists()) {
        setSelectedQuoteForPayment({ id: quoteId, ...quoteDoc.data() });
        setShowPaymentModal(true);
      } else {
        alert("Quote not found. Please save the quote first.");
      }
    } catch (error) {
      console.error("Error loading quote:", error);
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
    if (!file.type.startsWith("image/")) { alert("Please upload an image file"); return; }
    if (file.size > 5 * 1024 * 1024) { alert("Image size should be less than 5MB"); return; }

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
      console.error("Error uploading logo:", error);
      alert("Failed to upload logo: " + error.message);
      setBusinessInfo((prev) => ({ ...prev, uploading: false }));
    }
  };

  const handleSaveBusinessInfo = async () => {
    if (!user?.uid) return;
    try {
      const db = getFirestore();
      await setDoc(
        doc(db, "users", user.uid, "settings", "businessInfo"),
        { ...businessInfo, stampSettings },
      );
      alert("Business information saved successfully!");
      setShowSettings(false);
    } catch (error) {
      console.error("Error saving business info:", error);
      alert("Failed to save business information");
    }
  };

  const printStyles = `
    @media print {
      body * { visibility: hidden !important; }
      #print-area, #print-area * { visibility: visible !important; }
      #print-area {
        display: block !important;
        position: absolute !important;
        left: 0 !important; top: 0 !important;
        width: 210mm !important; min-height: 297mm !important;
        margin: 0 !important; padding: 10mm !important;
        box-sizing: border-box !important;
        background: white !important;
        box-shadow: none !important; transform: none !important;
      }
      @page { size: A4 portrait; margin: 0; }
      html, body {
        margin: 0 !important; padding: 0 !important;
        width: 210mm !important; height: 297mm !important;
        background: white !important;
      }
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
      }
      .logo img { height: 60px; width: auto; }
      .shadow-lg, .rounded-lg, .shadow-xl, .shadow-2xl {
        border: none !important; box-shadow: none !important;
      }
      table, tr, td, th, div { page-break-inside: avoid !important; }
      table { width: 100% !important; border-collapse: collapse !important; }
    }
  `;

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
    setPropertyAddress(savedQuote.customer.address);
    setTimeout(() => window.print(), 300);
  };

  // ── AI extraction ────────────────────────────────────────────────────────
  const handleAIDataExtracted = (extractedData) => {
    if (extractedData.customer?.name) setCustomerName(extractedData.customer.name);
    if (extractedData.customer?.email) setCustomerEmail(extractedData.customer.email);
    if (extractedData.customer?.phone) setCustomerPhone(extractedData.customer.phone);
    if (extractedData.customer?.address) setPropertyAddress(extractedData.customer.address);
    if (extractedData.items?.length > 0) setItems(extractedData.items);
    alert("✨ Data extracted and populated successfully!");
  };

  // ── navigation ───────────────────────────────────────────────────────────
  const handleNext = () => { if (currentStep < totalSteps) setCurrentStep(currentStep + 1); };
  const handlePrevious = () => { if (currentStep > 1) setCurrentStep(currentStep - 1); };

  // ── logout ───────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    try { await signOut(getAuth()); } catch (error) { console.error("Error logging out:", error); }
  };

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div className="flex h-screen w-screen bg-gradient-to-br from-amber-50 via-orange-50 to-stone-50 overflow-hidden">
      {/* ── Mobile Sidebar Backdrop ──────────────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Collapsed Sidebar ────────────────────────────────────────────── */}
      <div
        className={`${sidebarOpen ? "hidden" : "hidden md:block"} fixed z-40 w-16 md:w-20 bg-gradient-to-b from-stone-900 via-stone-800 to-stone-900 border-r border-stone-700/50 h-full print:hidden transition-all duration-300 shadow-2xl`}
      >
        <div className="flex flex-col items-center py-4 md:py-6 space-y-4 md:space-y-6">
          {/* expand toggle */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="group p-2 md:p-3 text-amber-400 hover:text-white hover:bg-gradient-to-r hover:from-stone-600 hover:to-stone-700 rounded-xl transition-all duration-300 shadow-lg hover:shadow-amber-500/50 hover:scale-110"
            title="Expand Sidebar"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6 group-hover:animate-pulse" />
          </button>

          {/* brand icon */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300" />
            <div className="relative w-10 h-10 md:w-12 md:h-12 mb-2 md:mb-4 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-1 shadow-lg">
              <HardHat className="w-full h-full text-white p-1.5" />
            </div>
          </div>

          {/* icon nav */}
          <div className="flex flex-col items-center space-y-3 md:space-y-4 w-full px-2 md:px-3">
            <button className="group relative p-2 md:p-3 text-amber-400 hover:text-white rounded-xl transition-all duration-300 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center overflow-hidden" title="Home">
              <div className="absolute inset-0 bg-gradient-to-r from-stone-600 to-stone-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Home className="w-5 h-5 md:w-6 md:h-6 relative z-10 group-hover:scale-110 transition-transform duration-300" />
            </button>

            <button onClick={() => setShowSettings(true)} className="group relative p-2 md:p-3 text-amber-400 hover:text-white rounded-xl transition-all duration-300 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center overflow-hidden" title="Settings">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Settings className="w-5 h-5 md:w-6 md:h-6 relative z-10 group-hover:rotate-90 transition-transform duration-500" />
            </button>

            {!isMobile && (
              <>
                <button onClick={() => setActiveView("financial-overview")} className="group relative p-2 md:p-3 text-amber-400 hover:text-white rounded-xl transition-all duration-300 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center overflow-hidden" title="Financial Dashboard">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <TrendingUp className="w-5 h-5 md:w-6 md:h-6 relative z-10 group-hover:scale-110 transition-transform duration-300" />
                </button>

                <button onClick={() => { handleNewInvoice(); setActiveView("quote"); }} className="group relative p-2 md:p-3 text-amber-400 hover:text-white rounded-xl transition-all duration-300 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center overflow-hidden" title="Quotes & Invoices">
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-amber-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <Receipt className="w-5 h-5 md:w-6 md:h-6 relative z-10 group-hover:scale-110 transition-transform duration-300" />
                </button>

                <button onClick={() => setShowCustomersListModal(true)} className="group relative p-2 md:p-3 text-amber-400 hover:text-white rounded-xl transition-all duration-300 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center overflow-hidden" title="Clients">
                  <div className="absolute inset-0 bg-gradient-to-r from-sky-600 to-sky-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <Users className="w-5 h-5 md:w-6 md:h-6 relative z-10 group-hover:scale-110 transition-transform duration-300" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* avatar bottom */}
        <div className="absolute bottom-4 md:bottom-6 left-0 right-0 flex justify-center">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full opacity-50 group-hover:opacity-100 blur-md transition-opacity duration-300" />
            <div className="relative w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center ring-2 ring-stone-700 shadow-lg group-hover:ring-4 group-hover:ring-amber-500/50 transition-all duration-300">
              <HardHat className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Expanded Sidebar ─────────────────────────────────────────────── */}
      <div
        className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} fixed z-50 w-64 md:w-72 bg-gradient-to-b from-stone-900 via-stone-800 to-stone-900 border-r border-stone-700/50 transition-transform duration-300 h-full print:hidden shadow-2xl overflow-y-auto`}
      >
        <div className="p-4 md:p-6">
          {/* header */}
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl opacity-20 group-hover:opacity-40 blur-xl transition-opacity duration-300" />
                <div className="relative bg-gradient-to-br from-amber-500 to-orange-600 p-1 rounded-xl shadow-lg">
                  <HardHat className="w-12 h-10 md:w-16 md:h-12 text-white p-2" />
                </div>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="group p-2 text-amber-400 hover:text-white hover:bg-stone-700/50 rounded-xl transition-all duration-300 hover:rotate-90" title="Collapse Sidebar">
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>

          {/* nav */}
          <nav className="space-y-1.5 md:space-y-2">
            <div className="group flex items-center space-x-2 md:space-x-3 px-3 md:px-4 py-2.5 md:py-3 text-amber-300 hover:text-white hover:bg-gradient-to-r hover:from-stone-600/20 hover:to-stone-700/20 rounded-xl cursor-pointer transition-all duration-300 border border-transparent hover:border-amber-500/30">
              <Home className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
              <span className="text-xs md:text-sm font-semibold">Home</span>
            </div>

            <div onClick={() => setShowSettings(true)} className="group flex items-center space-x-2 md:space-x-3 px-3 md:px-4 py-2.5 md:py-3 text-amber-300 hover:text-white hover:bg-gradient-to-r hover:from-orange-600/20 hover:to-orange-700/20 rounded-xl cursor-pointer transition-all duration-300 border border-transparent hover:border-orange-500/30">
              <Settings className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0 group-hover:rotate-90 transition-transform duration-500" />
              <span className="text-xs md:text-sm font-semibold">Settings</span>
            </div>

            <div className="pt-3 md:pt-4 mt-3 md:mt-4 border-t border-stone-700/50">
              {/* Financial Dashboard */}
              <div onClick={() => setActiveView("financial-overview")} className="group flex items-center space-x-2 md:space-x-3 px-3 md:px-4 py-2.5 md:py-3 text-amber-300 hover:text-white hover:bg-gradient-to-r hover:from-emerald-600/20 hover:to-emerald-700/20 rounded-xl cursor-pointer transition-all duration-300 border border-transparent hover:border-emerald-500/30">
                <TrendingUp className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                <span className="text-xs md:text-sm font-semibold truncate">Financial Dashboard</span>
              </div>

              {/* Quotes & Invoices dropdown */}
             <div className="mt-2 md:mt-3">
  <div 
    onClick={() => setIsQuotesInvoicesOpen2(!isQuotesInvoicesOpen2)}
    className="group flex items-center justify-between px-3 md:px-4 py-2.5 md:py-3 text-amber-300 hover:text-white hover:bg-gradient-to-r hover:from-amber-600/20 hover:to-amber-700/20 rounded-xl cursor-pointer transition-all duration-300 border border-transparent hover:border-amber-500/30"
  >
    <div className="flex items-center space-x-2 md:space-x-3 min-w-0">
      <Receipt className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
      <span className="text-xs md:text-sm font-semibold truncate">Quotes & Invoices</span>
    </div>
    <ChevronDown 
      className={`w-4 h-4 flex-shrink-0 transition-transform duration-300 ${
        isQuotesInvoicesOpen2 ? 'rotate-180' : ''
      }`} 
    />
  </div>

  {/* Conditional rendering with animation */}
  <div 
    className={`ml-4 md:ml-6 mt-1.5 md:mt-2 space-y-1 border-l-2 border-stone-700/50 pl-3 md:pl-4 overflow-hidden transition-all duration-300 ${
      isQuotesInvoicesOpen2 ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
    }`}
  >
    <div 
      onClick={() => { 
        handleNewQuote(); 
        setActiveView("quote"); 
        if (isMobile) setSidebarOpen(false); 
      }} 
      className="group px-2 md:px-3 py-2 md:py-2.5 text-xs md:text-sm text-amber-400 hover:text-white hover:bg-stone-700/30 rounded-lg cursor-pointer transition-all duration-300 flex items-center space-x-2"
    >
      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0 group-hover:scale-150 transition-transform duration-300" />
      <span className="truncate">Create Quote</span>
    </div>
    <div 
      onClick={() => { 
        handleNewInvoice(); 
        setActiveView("quote"); 
        if (isMobile) setSidebarOpen(false); 
      }} 
      className="group px-2 md:px-3 py-2 md:py-2.5 text-xs md:text-sm text-amber-400 hover:text-white hover:bg-stone-700/30 rounded-lg cursor-pointer transition-all duration-300 flex items-center space-x-2"
    >
      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0 group-hover:scale-150 transition-transform duration-300" />
      <span className="truncate">Create Invoice</span>
    </div>
    <div 
      onClick={() => { 
        setShowQuotesList(!showQuotesList); 
        if (isMobile) setSidebarOpen(false); 
      }} 
      className="group px-2 md:px-3 py-2 md:py-2.5 text-xs md:text-sm text-amber-400 hover:text-white hover:bg-stone-700/30 rounded-lg cursor-pointer transition-all duration-300"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 min-w-0">
          <div className="w-1.5 h-1.5 rounded-full bg-purple-500 flex-shrink-0 group-hover:scale-150 transition-transform duration-300" />
          <span className="truncate">All {documentType === "quote" ? "Quotes" : "Invoices"}</span>
        </div>
        <span className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-2 py-0.5 md:px-2.5 md:py-1 rounded-full text-xs font-bold shadow-lg flex-shrink-0 ml-2">
          {savedQuotes.length}
        </span>
      </div>
    </div>
  </div>
</div>

              {/* Clients dropdown */}
              <div className="mt-2 md:mt-3">
  <div 
    onClick={() => setIsClientsOpen(!isClientsOpen)}
    className="group flex items-center justify-between px-3 md:px-4 py-2.5 md:py-3 text-slate-300 hover:text-white hover:bg-gradient-to-r hover:from-pink-600/20 hover:to-pink-700/20 rounded-xl cursor-pointer transition-all duration-300 border border-transparent hover:border-pink-500/30"
  >
    <div className="flex items-center space-x-2 md:space-x-3 min-w-0">
      <Users className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
      <span className="text-xs md:text-sm font-semibold truncate">
        Clients
      </span>
    </div>
    <ChevronDown 
      className={`w-4 h-4 flex-shrink-0 transition-transform duration-300 ${
        isClientsOpen ? 'rotate-180' : ''
      }`} 
    />
  </div>

  {/* Conditional rendering with animation */}
  <div 
    className={`ml-4 md:ml-6 mt-1.5 md:mt-2 space-y-1 border-l-2 border-slate-700/50 pl-3 md:pl-4 overflow-hidden transition-all duration-300 ${
      isClientsOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
    }`}
  >
    <div
      onClick={() => {
        handleAddNewCustomer();
        if (isMobile) setSidebarOpen(false);
      }}
      className="group px-2 md:px-3 py-2 md:py-2.5 text-xs md:text-sm text-slate-400 hover:text-white hover:bg-slate-700/30 rounded-lg cursor-pointer transition-all duration-300 flex items-center space-x-2"
    >
      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0 group-hover:scale-150 transition-transform duration-300"></div>
      <span className="truncate">Add Client</span>
    </div>
    <div
      onClick={() => {
        setShowCustomersListModal(true);
        if (isMobile) setSidebarOpen(false);
      }}
      className="group px-2 md:px-3 py-2 md:py-2.5 text-xs md:text-sm text-slate-400 hover:text-white hover:bg-slate-700/30 rounded-lg cursor-pointer transition-all duration-300"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 min-w-0">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0 group-hover:scale-150 transition-transform duration-300"></div>
          <span className="truncate">All Clients</span>
        </div>
        <span className="bg-gradient-to-r from-pink-600 to-purple-600 text-white px-2 py-0.5 md:px-2.5 md:py-1 rounded-full text-xs font-bold shadow-lg flex-shrink-0 ml-2">
          {savedCustomers.length}
        </span>
      </div>
    </div>
  </div>
</div>

              {/* Schedule / Reports (desktop only) */}
              {!isMobile && (
                <>
                  <div onClick={() => setActiveView("schedule")} className="group flex items-center space-x-2 md:space-x-3 px-3 md:px-4 py-2.5 md:py-3 text-amber-300 hover:text-white hover:bg-gradient-to-r hover:from-indigo-600/20 hover:to-indigo-700/20 rounded-xl cursor-pointer transition-all duration-300 mt-2 border border-transparent hover:border-indigo-500/30">
                    <Calendar className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                    <span className="text-xs md:text-sm font-semibold truncate">Schedule</span>
                  </div>
                  <div onClick={() => setActiveView("reports")} className="group flex items-center space-x-2 md:space-x-3 px-3 md:px-4 py-2.5 md:py-3 text-amber-300 hover:text-white hover:bg-gradient-to-r hover:from-blue-600/20 hover:to-blue-700/20 rounded-xl cursor-pointer transition-all duration-300 border border-transparent hover:border-blue-500/30">
                    <BarChart3 className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                    <span className="text-xs md:text-sm font-semibold truncate">Reports</span>
                  </div>
                </>
              )}
            </div>
          </nav>
        </div>

        {/* sidebar footer – user info + logout */}
        <div className="sticky bottom-0 left-0 right-0 p-4 md:p-6 border-t border-stone-700/50 bg-gradient-to-t from-stone-900 to-transparent backdrop-blur-sm">
          <div className="flex items-center space-x-2 md:space-x-3">
            <div className="relative group flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full opacity-50 group-hover:opacity-100 blur-md transition-opacity duration-300" />
              <div className="relative w-9 h-9 md:w-11 md:h-11 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center ring-2 ring-stone-700 shadow-lg group-hover:ring-4 group-hover:ring-amber-500/50 transition-all duration-300">
                <HardHat className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs md:text-sm font-bold text-white bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent truncate">{user?.name || "User"}</div>
              <div className="text-xs text-amber-400 truncate">{user?.email || "email@example.com"}</div>
            </div>
            <button onClick={handleLogout} className="group text-amber-400 hover:text-white hover:bg-gradient-to-r hover:from-red-600/20 hover:to-red-700/20 p-2 md:p-2.5 rounded-xl transition-all duration-300 border border-transparent hover:border-red-500/30 flex-shrink-0">
              <LogOut className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-300" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Content Area ────────────────────────────────────────────── */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? "ml-0 lg:ml-72" : "ml-2 md:ml-20"}`}>
        <div className="flex flex-col h-screen">
          {/* ── Header ──────────────────────────────────────────────────── */}
          <div className="flex-shrink-0 bg-white/80 backdrop-blur-md border-b border-slate-200 px-3 md:px-4 lg:px-8 py-3 md:py-4 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center space-x-2 md:space-x-4 min-w-0">
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-slate-100 rounded-xl transition-all duration-300 lg:hidden flex-shrink-0">
                  <Menu className="w-5 h-5" />
                </button>
                <div className="flex items-center space-x-2 md:space-x-3 min-w-0">
                  <div className="hidden sm:flex items-center justify-center w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg flex-shrink-0">
                    <HardHat className="w-4 h-4 md:w-5 md:h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-sm md:text-lg lg:text-2xl font-bold bg-gradient-to-r from-stone-800 to-orange-600 bg-clip-text text-transparent truncate">
                      {documentType === "quote" ? "Quote" : "Invoice"} #{quoteNumber || "—"}
                    </h1>
                    <p className="text-xs text-slate-500 hidden md:block truncate">
                      Create and manage construction {documentType === "quote" ? "quotes" : "invoices"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Desktop action buttons */}
              <div className="hidden lg:flex items-center space-x-2 print:hidden flex-shrink-0">
                {documentType === "quote" && quoteId && (
                  <button onClick={handleConvertToInvoice} className="group flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-purple-500/50 hover:scale-105 whitespace-nowrap">
                    <FileText className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
                    Convert to Invoice
                  </button>
                )}
                <button onClick={handlePrint} className="group flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-slate-200 text-slate-700 rounded-xl hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100 hover:border-slate-300 transition-all duration-300 font-semibold shadow-sm hover:shadow-md whitespace-nowrap">
                  <Printer className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                  Print
                </button>
                <button onClick={documentType === "quote" ? handleNewQuote : handleNewInvoice} className="group flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-emerald-500/50 hover:scale-105 whitespace-nowrap">
                  <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                  New
                </button>
                <button className="group flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl hover:from-amber-700 hover:to-orange-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-amber-500/50 hover:scale-105 whitespace-nowrap">
                  <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                  <span>Send</span>
                </button>
                <button onClick={handleSavePDF} className="group flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-xl hover:from-orange-700 hover:to-orange-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-orange-500/50 hover:scale-105 whitespace-nowrap">
                  <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform duration-300" />
                  Save PDF
                </button>
                <button onClick={handleSaveQuote} className="group flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-stone-600 to-stone-700 text-white rounded-xl hover:from-stone-700 hover:to-stone-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-stone-500/50 hover:scale-105 whitespace-nowrap">
                  <Save className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                  Save
                </button>
                <button onClick={handleLogout} className="group flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-red-500/50 hover:scale-105 whitespace-nowrap">
                  <LogOut className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-300" />
                  Logout
                </button>
              </div>

              {/* Mobile logout */}
              <button onClick={handleLogout} className="lg:hidden p-2 md:p-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg print:hidden flex-shrink-0">
                <LogOut className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>
          </div>

          {/* ── Mobile Action Bar ──────────────────────────────────────── */}
          <div className="flex-shrink-0 lg:hidden bg-white/90 backdrop-blur-md px-3 md:px-4 py-2.5 md:py-3 print:hidden border-b border-slate-200 overflow-x-auto">
            <div className="flex gap-2 min-w-max pb-1">
              {documentType === "quote" && quoteId && (
                <button onClick={handleConvertToInvoice} className="group flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 md:py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg md:rounded-xl hover:from-purple-700 hover:to-purple-800 whitespace-nowrap text-xs md:text-sm font-semibold shadow-lg transition-all duration-300 active:scale-95">
                  <FileText className="w-3.5 h-3.5 md:w-4 md:h-4 group-hover:rotate-12 transition-transform duration-300" />
                  <span>To Invoice</span>
                </button>
              )}
              <button onClick={handleProcessPayment} disabled={!quoteId} className={`group flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 md:py-2.5 rounded-lg md:rounded-xl whitespace-nowrap text-xs md:text-sm font-semibold shadow-lg transition-all duration-300 active:scale-95 ${!quoteId ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:from-emerald-700 hover:to-emerald-800"}`}>
                <CreditCard className="w-3.5 h-3.5 md:w-4 md:h-4" />
                Payment
              </button>
              <button onClick={handleSaveQuote} className="group flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 md:py-2.5 bg-gradient-to-r from-stone-600 to-stone-700 text-white rounded-lg md:rounded-xl hover:from-stone-700 hover:to-stone-800 whitespace-nowrap text-xs md:text-sm font-semibold shadow-lg transition-all duration-300 active:scale-95">
                <Save className="w-3.5 h-3.5 md:w-4 md:h-4 group-hover:scale-110 transition-transform duration-300" />
                Save
              </button>
              <button className="group flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 md:py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg md:rounded-xl hover:from-amber-700 hover:to-orange-700 whitespace-nowrap text-xs md:text-sm font-semibold shadow-lg transition-all duration-300 active:scale-95">
                <Send className="w-3.5 h-3.5 md:w-4 md:h-4 group-hover:translate-x-1 transition-transform duration-300" />
                <span>Send</span>
              </button>
              <button onClick={handleSavePDF} className="group flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 md:py-2.5 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg md:rounded-xl hover:from-orange-700 hover:to-orange-800 whitespace-nowrap text-xs md:text-sm font-semibold shadow-lg transition-all duration-300 active:scale-95">
                <Download className="w-3.5 h-3.5 md:w-4 md:h-4 group-hover:translate-y-0.5 transition-transform duration-300" />
                <span>PDF</span>
              </button>
              <button onClick={handlePrint} className="group flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 md:py-2.5 bg-white border-2 border-slate-200 text-slate-700 rounded-lg md:rounded-xl hover:bg-slate-50 whitespace-nowrap text-xs md:text-sm font-semibold shadow-sm transition-all duration-300 active:scale-95">
                <Printer className="w-3.5 h-3.5 md:w-4 md:h-4 group-hover:scale-110 transition-transform duration-300" />
                <span>Print</span>
              </button>
            </div>
          </div>

          {/* ── Scrollable Main Content ──────────────────────────────── */}
          <div className="flex-1 overflow-y-auto">
            {/* ── Settings Modal ──────────────────────────────────────── */}
            {showSettings && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 md:p-4 animate-fadeIn overflow-y-auto">
                <div className="bg-white rounded-xl md:rounded-2xl max-w-2xl w-full max-h-[95vh] md:max-h-[90vh] overflow-hidden flex flex-col shadow-2xl transform transition-all duration-300 animate-slideUp my-auto">
                  <div className="p-4 md:p-6 border-b border-slate-200 bg-gradient-to-r from-amber-50 to-orange-50 flex-shrink-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 md:space-x-3">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-amber-600 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                          <Settings className="w-4 h-4 md:w-5 md:h-5 text-white" />
                        </div>
                        <h2 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">Business Settings</h2>
                      </div>
                      <button onClick={() => setShowSettings(false)} className="group p-1.5 md:p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all duration-300">
                        <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                      </button>
                    </div>
                  </div>

                  <div className="overflow-auto p-4 md:p-6 bg-gradient-to-b from-slate-50 to-white flex-1">
                    <div className="space-y-4 md:space-y-6">
                      {/* Logo */}
                      <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 border-2 border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
                        <label className="block text-sm font-bold text-slate-700 mb-3">Company Logo</label>
                        <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6">
                          {businessInfo.logoUrl ? (
                            <div className="relative group">
                              <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl opacity-20 group-hover:opacity-40 blur-xl transition-opacity duration-300" />
                              <img src={businessInfo.logoUrl} alt="Company Logo" className="relative w-20 h-20 md:w-24 md:h-24 object-contain border-2 border-slate-200 rounded-xl shadow-lg" />
                            </div>
                          ) : (
                            <div className="w-20 h-20 md:w-24 md:h-24 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 hover:border-amber-400 transition-all duration-300">
                              <Upload className="w-6 h-6 md:w-8 md:h-8 text-slate-400" />
                            </div>
                          )}
                          <div className="flex-1 text-center sm:text-left">
                            <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" id="logo-upload" />
                            <label htmlFor="logo-upload" className="inline-block px-4 md:px-5 py-2 md:py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg md:rounded-xl hover:from-amber-700 hover:to-orange-700 cursor-pointer font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-sm md:text-base">
                              {businessInfo.logoUrl ? "Change Logo" : "Upload Logo"}
                            </label>
                            <p className="text-xs text-slate-500 mt-2 md:mt-3 flex items-center justify-center sm:justify-start space-x-1">
                              <span className="w-1 h-1 bg-amber-500 rounded-full" />
                              <span>Recommended: Square image, max 5MB</span>
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Company Name */}
                      <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 border-2 border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
                        <label className="block text-sm font-bold text-slate-700 mb-2 md:mb-3">Company Name</label>
                        <input type="text" value={businessInfo.businessName} onChange={(e) => setBusinessInfo({ ...businessInfo, businessName: e.target.value })} className="w-full px-3 md:px-4 py-2 md:py-3 border-2 border-slate-200 rounded-lg md:rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-300 font-medium text-sm md:text-base" placeholder="Apex Construction Co." />
                      </div>

                      {/* Registration */}
                      <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 border-2 border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
                        <label className="block text-sm font-bold text-slate-700 mb-2 md:mb-3">Registration Number</label>
                        <input type="text" value={businessInfo.registrationNumber} onChange={(e) => setBusinessInfo({ ...businessInfo, registrationNumber: e.target.value })} className="w-full px-3 md:px-4 py-2 md:py-3 border-2 border-slate-200 rounded-lg md:rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-300 text-sm md:text-base" placeholder="2023/089412/07" />
                      </div>

                      {/* VAT */}
                      <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 border-2 border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
                        <label className="block text-sm font-bold text-slate-700 mb-2 md:mb-3">VAT Number</label>
                        <input type="text" value={businessInfo.vatNumber} onChange={(e) => setBusinessInfo({ ...businessInfo, vatNumber: e.target.value })} className="w-full px-3 md:px-4 py-2 md:py-3 border-2 border-slate-200 rounded-lg md:rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-300 text-sm md:text-base" placeholder="7891234567" />
                      </div>

                      <button onClick={handleSaveBusinessInfo} className="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white py-4 rounded-xl hover:from-amber-700 hover:to-orange-700 transition-all duration-300 font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] text-lg">
                        ✨ Save Business Information
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Shared Modals ────────────────────────────────────────── */}
            <CustomersListModal showModal={showCustomersListModal} setShowModal={setShowCustomersListModal} customers={customers} onLoadCustomer={loadCustomer} onEditCustomer={handleEditCustomer} onAddNewCustomer={handleAddNewCustomer} />
            <CustomerModal showModal={showCustomerModal} setShowModal={setShowCustomerModal} existingCustomer={selectedCustomer} onCustomerSaved={handleCustomerSaved} />

            {showPaymentModal && selectedQuoteForPayment && (
              <PaymentProcessor showModal={showPaymentModal} setShowModal={setShowPaymentModal} invoice={selectedQuoteForPayment} onPaymentComplete={handlePaymentComplete} user={user} businessInfo={businessInfo} />
            )}

            {/* ── Saved Quotes / Invoices List Modal ──────────────────── */}
            {showQuotesList && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
                  <div className="p-4 border-b flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Saved {documentType === "quote" ? "Quotes" : "Invoices"}</h2>
                    <button onClick={() => setShowQuotesList(false)} className="text-gray-500 hover:text-gray-700">✕</button>
                  </div>
                  <div className="overflow-auto p-4">
                    {savedQuotes.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">No saved {documentType === "quote" ? "quotes" : "invoices"} yet</div>
                    ) : (
                      <div className="space-y-2">
                        {savedQuotes.map((quote) => (
                          <div key={quote.id} onClick={() => loadQuote(quote)} className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="font-semibold text-lg">{quote.quoteNumber || "N/A"}</div>
                                <div className="text-sm text-gray-600 mt-1">Client: {quote.customer?.name || "N/A"}</div>
                                <div className="text-sm text-gray-600">Email: {quote.customer?.email || "N/A"}</div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-semibold text-amber-600">R{quote.totals?.total?.toFixed(2) || "0.00"}</div>
                                {quote.totals?.paid > 0 && <div className="text-sm text-emerald-600 font-semibold">Paid: R{quote.totals.paid.toFixed(2)}</div>}
                                {quote.totals?.due > 0 && <div className="text-sm text-rose-600 font-semibold">Due: R{quote.totals.due.toFixed(2)}</div>}
                                <div className={`text-xs mt-1 px-2 py-1 rounded ${quote.status === "paid" ? "bg-emerald-100 text-emerald-700" : quote.status === "partially_paid" ? "bg-amber-100 text-amber-700" : quote.status === "pending" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}`}>
                                  {quote.status === "paid" ? "Paid" : quote.status === "partially_paid" ? "Partial" : "Pending"}
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

            {/* ── Alternate Views ──────────────────────────────────────── */}
            {activeView === "financial-overview" && <FinancialOverview user={user} />}
            {activeView === "history-view" && <HistoryView user={user} />}
            {activeView === "notes-view" && <NotesView user={user} />}
            {activeView === "templates" && <Templates user={user} />}

            {/* ── Quote / Invoice Builder ──────────────────────────────── */}
            {activeView === "quote" && (
              <div className="grid grid-cols-1 gap-6 px-4 sm:px-6 lg:px-8 xl:px-12">
                <div className="space-y-6">
                  {/* Tab: Manual / AI */}
                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm pt-2 sm:pt-6">
                    <div className="flex border-b border-slate-200">
                      <button onClick={() => setInputMode("manual")} className={`flex-1 px-6 py-4 font-semibold transition-all duration-200 ${inputMode === "manual" ? "bg-white text-amber-600 border-b-2 border-amber-600 shadow-sm" : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`}>
                        <span className="flex items-center justify-center gap-2">
                          <Edit className="w-5 h-5" />
                          Manual Entry
                        </span>
                      </button>
                      <button onClick={() => setInputMode("ai")} className={`flex-1 px-6 py-4 font-semibold transition-all duration-200 ${inputMode === "ai" ? "bg-white text-purple-600 border-b-2 border-purple-600 shadow-sm" : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`}>
                        <span className="flex items-center justify-center gap-2">
                          <Sparkles className="w-5 h-5" />
                          AI Assistant
                        </span>
                      </button>
                    </div>
                    <div className="p-6">
                      {inputMode === "ai" && <AIInvoiceExtractor onDataExtracted={handleAIDataExtracted} documentType={documentType} />}
                    </div>
                  </div>

                  {inputMode === "manual" && (
                    <>
                      {/* Summary Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-3 rounded-xl border border-amber-200 shadow-sm">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-sm font-medium text-amber-700">Total Amount</div>
                            <div className="w-8 h-8 bg-amber-200 rounded-lg flex items-center justify-center">
                              <DollarSign className="w-5 h-5 text-amber-600" />
                            </div>
                          </div>
                          <div className="text-2xl font-bold text-amber-900">R{total.toFixed(2)}</div>
                        </div>

                        <div className={`bg-gradient-to-br p-3 rounded-xl border shadow-sm transition-all ${paymentStatus.totalPaid > 0 ? "from-emerald-50 to-emerald-100 border-emerald-200" : "from-slate-50 to-slate-100 border-slate-200"}`}>
                          <div className="flex items-center justify-between mb-2">
                            <div className={`text-sm font-medium ${paymentStatus.totalPaid > 0 ? "text-emerald-700" : "text-slate-600"}`}>Paid</div>
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${paymentStatus.totalPaid > 0 ? "bg-emerald-200" : "bg-slate-200"}`}>
                              <CheckSquare className={`w-5 h-5 ${paymentStatus.totalPaid > 0 ? "text-emerald-600" : "text-slate-400"}`} />
                            </div>
                          </div>
                          <div className={`text-2xl font-bold ${paymentStatus.totalPaid > 0 ? "text-emerald-900" : "text-slate-900"}`}>R{paymentStatus.totalPaid.toFixed(2)}</div>
                        </div>

                        <div className={`bg-gradient-to-br p-3 rounded-xl border shadow-sm transition-all ${paymentStatus.balanceDue <= 0 ? "from-emerald-50 to-emerald-100 border-emerald-200" : paymentStatus.totalPaid > 0 ? "from-amber-50 to-amber-100 border-amber-200" : "from-rose-50 to-rose-100 border-rose-200"}`}>
                          <div className="flex items-center justify-between mb-2">
                            <div className={`text-sm font-medium ${paymentStatus.balanceDue <= 0 ? "text-emerald-700" : paymentStatus.totalPaid > 0 ? "text-amber-700" : "text-rose-700"}`}>Balance Due</div>
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${paymentStatus.balanceDue <= 0 ? "bg-emerald-200" : paymentStatus.totalPaid > 0 ? "bg-amber-200" : "bg-rose-200"}`}>
                              <Wallet className={`w-5 h-5 ${paymentStatus.balanceDue <= 0 ? "text-emerald-600" : paymentStatus.totalPaid > 0 ? "text-amber-600" : "text-rose-600"}`} />
                            </div>
                          </div>
                          <div className={`text-2xl font-bold ${paymentStatus.balanceDue <= 0 ? "text-emerald-900" : paymentStatus.totalPaid > 0 ? "text-amber-900" : "text-rose-900"}`}>R{paymentStatus.balanceDue.toFixed(2)}</div>
                        </div>
                      </div>

                      {/* Payment Status Banner */}
                      {quoteId && (
                        <div className={`p-4 rounded-xl border-2 flex items-center justify-between ${paymentStatus.status === "paid" ? "bg-emerald-50 border-emerald-300" : paymentStatus.status === "partially_paid" ? "bg-amber-50 border-amber-300" : "bg-rose-50 border-rose-300"}`}>
                          <div className="flex items-center gap-3">
                            {paymentStatus.status === "paid" ? (
                              <>
                                <div className="w-10 h-10 bg-emerald-200 rounded-full flex items-center justify-center"><CheckSquare className="w-6 h-6 text-emerald-600" /></div>
                                <div>
                                  <div className="font-bold text-emerald-900">{documentType === "quote" ? "Quote" : "Invoice"} Fully Paid</div>
                                  <div className="text-sm text-emerald-700">Payment complete – Thank you!</div>
                                </div>
                              </>
                            ) : paymentStatus.status === "partially_paid" ? (
                              <>
                                <div className="w-10 h-10 bg-amber-200 rounded-full flex items-center justify-center"><CreditCard className="w-6 h-6 text-amber-600" /></div>
                                <div>
                                  <div className="font-bold text-amber-900">Partial Payment Received</div>
                                  <div className="text-sm text-amber-700">R{paymentStatus.totalPaid.toFixed(2)} paid • R{paymentStatus.balanceDue.toFixed(2)} remaining</div>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="w-10 h-10 bg-rose-200 rounded-full flex items-center justify-center"><Wallet className="w-6 h-6 text-rose-600" /></div>
                                <div>
                                  <div className="font-bold text-rose-900">Payment Pending</div>
                                  <div className="text-sm text-rose-700">Full amount due: R{paymentStatus.balanceDue.toFixed(2)}</div>
                                </div>
                              </>
                            )}
                          </div>
                          {paymentStatus.status !== "paid" && (
                            <button onClick={handleProcessPayment} className="px-4 py-2 bg-white border-2 border-current rounded-lg font-bold hover:bg-opacity-90 transition-all flex items-center gap-2">
                              <CreditCard className="w-4 h-4" />
                              Record Payment
                            </button>
                          )}
                        </div>
                      )}

                      {/* ── Stepped Form ──────────────────────────────────── */}
                      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        {/* Step 1 – Client Information */}
                        {currentStep === 1 && (
                          <div className="p-8">
                            <div className="mb-8">
                              <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center"><Users className="w-6 h-6 text-amber-600" /></div>
                                Client Information
                              </h2>
                              <p className="text-slate-600 mt-2 ml-13">Enter client / contractor details</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                              <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Client / Company Name <span className="text-rose-500">*</span></label>
                                <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all bg-white hover:border-slate-400" placeholder="Meridian Developments" />
                              </div>
                              <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Email <span className="text-rose-500">*</span></label>
                                <input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all bg-white hover:border-slate-400" placeholder="projects@company.co.za" />
                              </div>
                              <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Phone <span className="text-rose-500">*</span></label>
                                <input type="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all bg-white hover:border-slate-400" placeholder="+27 11 234 5678" />
                              </div>
                              <div className="col-span-1 sm:col-span-2">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Site Address <span className="text-rose-500">*</span></label>
                                <input type="text" value={propertyAddress} onChange={(e) => setPropertyAddress(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all bg-white hover:border-slate-400" placeholder="45 Corporate Boulevard, Sandton, Johannesburg, 2196" />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Step 2 – Site Details */}
                        {currentStep === 2 && (
                          <div className="p-8">
                            <div className="mb-8">
                              <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center"><Building className="w-6 h-6 text-orange-600" /></div>
                                Site Details
                              </h2>
                              <p className="text-slate-600 mt-2 ml-13">Provide site specifications for an accurate quote</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                              <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Site / Project Type</label>
                                <select value={siteType} onChange={(e) => setSiteType(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all bg-white hover:border-slate-400">
                                  <option value="Commercial">Commercial</option>
                                  <option value="Residential">Residential</option>
                                  <option value="Industrial">Industrial</option>
                                  <option value="Infrastructure">Infrastructure</option>
                                  <option value="Renovation">Renovation</option>
                                  <option value="Government">Government</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Site Area (sqm)</label>
                                <input type="number" value={siteSize} onChange={(e) => setSiteSize(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all bg-white hover:border-slate-400" placeholder="1200" />
                              </div>
                              <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Number of Floors / Storeys</label>
                                <input type="number" value={floors} onChange={(e) => setFloors(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all bg-white hover:border-slate-400" placeholder="3" />
                              </div>
                              <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Number of Phases</label>
                                <input type="number" value={phases} onChange={(e) => setPhases(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all bg-white hover:border-slate-400" placeholder="2" />
                              </div>
                            </div>

                            {/* Site Summary Card */}
                            <div className="mt-6 p-4 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
                              <h3 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                Site Summary
                              </h3>
                              <div className="text-sm text-amber-800 space-y-1">
                                <p><span className="font-medium">Type:</span> {siteType}</p>
                                <p><span className="font-medium">Area:</span> {siteSize} sqm</p>
                                <p><span className="font-medium">Floors:</span> {floors} | Phases: {phases}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Step 3 – Scope of Work */}
                        {currentStep === 3 && (
                          <div className="p-8">
                            <div className="mb-8">
                              <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                                <div className="w-10 h-10 bg-stone-100 rounded-lg flex items-center justify-center"><Wrench className="w-6 h-6 text-stone-600" /></div>
                                Scope of Work
                              </h2>
                              <p className="text-slate-600 mt-2 ml-13">Add work items and materials to the quote</p>
                            </div>

                            {/* Add Work-Item Form */}
                            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 mb-6 border border-slate-200">
                              <h3 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
                                <Plus className="w-5 h-5 text-amber-600" />
                                Add Work Item
                              </h3>
                              <div className="grid grid-cols-1 gap-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Work Category</label>
                                    <select value={newItem.workCategory} onChange={(e) => setNewItem({ ...newItem, workCategory: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all bg-white text-sm font-medium hover:border-slate-400">
                                      <option value="Foundation Work">Foundation Work</option>
                                      <option value="Structural Steel">Structural Steel</option>
                                      <option value="Concrete & Masonry">Concrete & Masonry</option>
                                      <option value="Electrical">Electrical</option>
                                      <option value="Plumbing">Plumbing</option>
                                      <option value="Roofing">Roofing</option>
                                      <option value="Finishing & Plastering">Finishing & Plastering</option>
                                      <option value="Earthworks">Earthworks</option>
                                      <option value="Landscaping">Landscaping</option>
                                      <option value="Site Preparation">Site Preparation</option>
                                      <option value="HVAC">HVAC</option>
                                      <option value="Windows & Doors">Windows & Doors</option>
                                      <option value="Painting">Painting</option>
                                      <option value="Tiling & Flooring">Tiling & Flooring</option>
                                      <option value="Materials Supply">Materials Supply</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Phase</label>
                                    <select value={newItem.phase} onChange={(e) => setNewItem({ ...newItem, phase: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all bg-white text-sm font-medium hover:border-slate-400">
                                      <option value="Phase 1">Phase 1</option>
                                      <option value="Phase 2">Phase 2</option>
                                      <option value="Phase 3">Phase 3</option>
                                      <option value="Phase 4">Phase 4</option>
                                      <option value="Ongoing">Ongoing</option>
                                    </select>
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                                  <input type="text" placeholder="Work item / material description" value={newItem.description} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all bg-white hover:border-slate-400" />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                                  <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Unit Rate (R)</label>
                                    <input type="number" placeholder="Rate" value={newItem.rate} onChange={(e) => setNewItem({ ...newItem, rate: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all bg-white hover:border-slate-400" />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Quantity / Units</label>
                                    <input type="number" placeholder="Qty" value={newItem.qty} onChange={(e) => setNewItem({ ...newItem, qty: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all bg-white hover:border-slate-400" />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">VAT (%)</label>
                                    <input type="number" placeholder="15" value={newItem.taxRate} onChange={(e) => setNewItem({ ...newItem, taxRate: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all bg-white hover:border-slate-400" />
                                  </div>
                                  <div className="flex items-end">
                                    <button onClick={handleAddItem} className="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg px-4 py-2 hover:from-amber-700 hover:to-orange-700 flex items-center justify-center gap-2 transition-all font-semibold shadow-md hover:shadow-lg">
                                      <Plus className="w-4 h-4" />
                                      Add Item
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Work Items Table */}
                            {items.length > 0 ? (
                              <div className="mb-6">
                                <h3 className="text-lg font-bold text-slate-900 mb-4">Work Items ({items.length})</h3>
                                <div className="overflow-x-auto rounded-xl border border-slate-200">
                                  <table className="w-full">
                                    <thead>
                                      <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                                        <th className="px-4 py-4 text-left text-sm font-bold text-slate-700">Description</th>
                                        <th className="px-4 py-4 text-left text-sm font-bold text-slate-700">Category</th>
                                        <th className="px-4 py-4 text-left text-sm font-bold text-slate-700">Phase</th>
                                        <th className="px-4 py-4 text-right text-sm font-bold text-slate-700">Unit Rate</th>
                                        <th className="px-4 py-4 text-right text-sm font-bold text-slate-700">Qty</th>
                                        <th className="px-4 py-4 text-right text-sm font-bold text-slate-700">VAT</th>
                                        <th className="px-4 py-4 text-right text-sm font-bold text-slate-700">Total</th>
                                        <th className="px-4 py-4 text-center text-sm font-bold text-slate-700">Action</th>
                                      </tr>
                                    </thead>
                                    <tbody className="bg-white">
                                      {items.map((item, index) => (
                                        <tr key={index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                          <td className="px-4 py-4 text-sm font-medium text-slate-700">{item.description}</td>
                                          <td className="px-4 py-4 text-sm">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">{item.workCategory || "General"}</span>
                                          </td>
                                          <td className="px-4 py-4 text-sm">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700">{item.phase || "Phase 1"}</span>
                                          </td>
                                          <td className="px-4 py-4 text-sm text-right text-slate-700">R{item.rate.toFixed(2)}</td>
                                          <td className="px-4 py-4 text-sm text-right text-slate-700">{item.qty}</td>
                                          <td className="px-4 py-4 text-sm text-right text-slate-700">R{item.taxAmount.toFixed(2)}</td>
                                          <td className="px-4 py-4 text-sm text-right font-bold text-slate-900">R{item.totalAmount.toFixed(2)}</td>
                                          <td className="px-4 py-4 text-center">
                                            <button onClick={() => handleRemoveItem(index)} className="text-rose-600 hover:text-rose-700 text-sm font-semibold hover:bg-rose-50 px-3 py-1 rounded-lg transition-all flex items-center gap-1 mx-auto">
                                              <Trash2 className="w-3 h-3" />
                                              Remove
                                            </button>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            ) : (
                              <div className="text-center py-16 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border-2 border-dashed border-slate-300">
                                <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                  <Wrench className="w-8 h-8 text-slate-400" />
                                </div>
                                <p className="text-slate-700 font-semibold text-lg">No work items added yet</p>
                                <p className="text-sm text-slate-500 mt-2">Add items using the form above</p>
                              </div>
                            )}

                            {/* Totals */}
                            {items.length > 0 && (
                              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
                                <div className="space-y-3">
                                  <div className="flex justify-between items-center">
                                    <span className="text-slate-700 font-medium">Subtotal:</span>
                                    <span className="font-bold text-slate-900 text-lg">R{subtotal.toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-slate-700 font-medium">VAT (15%):</span>
                                    <span className="font-bold text-slate-900 text-lg">R{totalTax.toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between items-center text-lg font-bold pt-4 border-t-2 border-amber-300">
                                    <span className="text-slate-900">Total:</span>
                                    <span className="text-amber-700 text-2xl">R{total.toFixed(2)}</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Step 4 – Schedule & Payment */}
                        {currentStep === 4 && (
                          <div className="p-8">
                            <div className="mb-8">
                              <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center"><Calendar className="w-6 h-6 text-emerald-600" /></div>
                                Schedule & Payment Terms
                              </h2>
                              <p className="text-slate-600 mt-2 ml-13">Review quote details, milestones, and payment terms</p>
                            </div>

                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                              <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-xl border border-amber-200">
                                <div className="flex items-center justify-between mb-3">
                                  <span className="text-sm font-semibold text-amber-700">Project Total</span>
                                  <DollarSign className="w-5 h-5 text-amber-600" />
                                </div>
                                <div className="text-3xl font-bold text-amber-900">R{total.toFixed(2)}</div>
                              </div>
                              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-xl border border-emerald-200">
                                <div className="flex items-center justify-between mb-3">
                                  <span className="text-sm font-semibold text-emerald-700">Work Items</span>
                                  <ClipboardList className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div className="text-3xl font-bold text-emerald-900">{items.length}</div>
                              </div>
                              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                                <div className="flex items-center justify-between mb-3">
                                  <span className="text-sm font-semibold text-purple-700">VAT Amount</span>
                                  <Receipt className="w-5 h-5 text-purple-600" />
                                </div>
                                <div className="text-3xl font-bold text-purple-900">R{totalTax.toFixed(2)}</div>
                              </div>
                            </div>

                            {/* Payment Terms */}
                            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm mb-6">
                              <div className="flex items-center gap-3 mb-5">
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center"><CreditCard className="w-5 h-5 text-purple-600" /></div>
                                <h3 className="text-xl font-bold text-slate-900">Payment Information</h3>
                              </div>
                              <div className="space-y-3">
                                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                                  <span className="text-slate-600 font-medium">Payment Schedule:</span>
                                  <span className="font-bold text-slate-900">Milestone-Based</span>
                                </div>
                                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                                  <span className="text-slate-600 font-medium">Payment Methods:</span>
                                  <span className="font-bold text-slate-900">Bank Transfer, Card, EFT</span>
                                </div>
                                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                                  <span className="text-slate-600 font-medium">Quote Valid For:</span>
                                  <span className="font-bold text-slate-900">30 Days</span>
                                </div>
                                <div className="flex justify-between items-center py-3">
                                  <span className="text-slate-600 font-medium">Currency:</span>
                                  <span className="font-bold text-slate-900">ZAR (South African Rand)</span>
                                </div>
                              </div>
                            </div>

                            {/* Client & Site Summary */}
                            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200">
                              <h3 className="text-lg font-bold text-slate-900 mb-4">Quote Summary</h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                  <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2"><Users className="w-4 h-4" />Client Details:</h4>
                                  <div className="text-sm text-slate-600 space-y-1">
                                    <p className="font-semibold text-slate-900">{customerName}</p>
                                    <p>{customerEmail}</p>
                                    <p>{customerPhone}</p>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2"><Building className="w-4 h-4" />Site Details:</h4>
                                  <div className="text-sm text-slate-600 space-y-1">
                                    <p className="font-semibold text-slate-900">{propertyAddress}</p>
                                    <p><span className="font-semibold">Type:</span> {siteType}</p>
                                    <p><span className="font-semibold">Area:</span> {siteSize} sqm</p>
                                    <p><span className="font-semibold">Floors:</span> {floors} | Phases: {phases}</p>
                                  </div>
                                </div>
                              </div>

                              <div className="mt-6 pt-6 border-t border-slate-300">
                                <h4 className="text-sm font-semibold text-slate-700 mb-2">Quote Details:</h4>
                                <div className="text-sm text-slate-600 space-y-1">
                                  <p><span className="font-semibold">Number:</span> {quoteNumber}</p>
                                  <p><span className="font-semibold">Date:</span> {new Date().toLocaleDateString()}</p>
                                  <p><span className="font-semibold">Type:</span> {documentType === "quote" ? "Quote" : "Invoice"}</p>
                                  <p><span className="font-semibold">Status:</span> <span className="text-amber-600 font-bold">Pending</span></p>
                                </div>
                              </div>
                            </div>

                            {/* Process Payment button */}
                            {quoteId && (
                              <div className="mt-6 flex gap-3">
                                <button onClick={handleProcessPayment} className="flex-1 group flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-emerald-500/50 hover:scale-105">
                                  <CreditCard className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                                  Process Payment
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {/* ── Step Navigation Bar ──────────────────────────── */}
                        <div className="px-8 py-5 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
                          <button onClick={handlePrevious} disabled={currentStep === 1} className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${currentStep === 1 ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "bg-white border-2 border-slate-300 text-slate-700 hover:bg-slate-100 hover:border-slate-400 shadow-sm"}`}>
                            <ChevronLeft className="w-5 h-5" />
                            Previous
                          </button>

                          <div className="text-sm text-slate-600 font-bold bg-white px-4 py-2 rounded-lg border border-slate-200">Step {currentStep} of {totalSteps}</div>

                          {currentStep < totalSteps ? (
                            <button onClick={handleNext} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg font-semibold hover:from-amber-700 hover:to-orange-700 transition-all shadow-md hover:shadow-lg">
                              Next
                              <ChevronRight className="w-5 h-5" />
                            </button>
                          ) : (
                            <button onClick={handleSaveQuote} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg font-semibold hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-md hover:shadow-lg">
                              <Save className="w-5 h-5" />
                              Save {documentType === "quote" ? "Quote" : "Invoice"}
                            </button>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* ── Print / PDF Preview (hidden on-screen) ────────────── */}
                <div
                  id="print-area"
                  className="hidden print:block bg-white shadow-2xl origin-top"
                  style={{ width: "210mm", minHeight: "297mm", transform: "scale(0.75)", transformOrigin: "top center" }}
                >
                  <TemplateRenderer
                    templateId={selectedTemplate}
                    businessInfo={businessInfo}
                    loading={loading}
                    invoiceNumber={quoteNumber}
                    customerName={customerName}
                    billName={customerName}
                    billEmail={customerEmail}
                    billPhone={customerPhone}
                    billAddress={propertyAddress}
                    customerEmail={customerEmail}
                    customerPhone={customerPhone}
                    customerAddress={propertyAddress}
                    taxId=""
                    items={items}
                    subtotal={subtotal}
                    totalTax={totalTax}
                    total={total}
                    documentType={documentType}
                    stampText={stampSettings.text}
                    stampColor={stampSettings.color}
                    showStampDate={stampSettings.showDate}
                    showStamp={stampSettings.enabled}
                    paymentStatus={paymentStatus}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConstructionDashboard;
