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
import { useLocation } from "react-router-dom";
import TemplateSelector, { TemplateRenderer } from "./TemplateSelector";
import PaymentProcessor from "../../components/dashboard/PaymentProcessor";
import { getFunctions, httpsCallable } from "firebase/functions";
import ConstructionSidebar from "./ConstructionSidebar";
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
  HardHat,
} from "lucide-react";
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

const ConstructionDashboard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const { user, authUser } = useAuth();
  const [activeTab, setActiveTab] = useState("Quote");
  const [quoteNumber, setQuoteNumber] = useState("");
  const [quoteId, setQuoteId] = useState(null);
  const [savedQuotes, setSavedQuotes] = useState([]);
  const [showQuotesList, setShowQuotesList] = useState(false);
  const [documentType, setDocumentType] = useState("quote");
  const location = useLocation();
  const [showPreview, setShowPreview] = useState(false);
  useEffect(() => {
    if (location.state?.activeView) setActiveView(location.state.activeView);
  }, [location.state]);

  const [showSettings, setShowSettings] = useState(false);
  const [activeView, setActiveView] = useState("home");
  const [showCustomersListModal, setShowCustomersListModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [savedCustomers, setSavedCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState("professional");
  const [inputMode, setInputMode] = useState("manual");
  const [selectedQuoteForPayment, setSelectedQuoteForPayment] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState({
    totalPaid: 0,
    balanceDue: 0,
    status: "pending",
  });
  const [isQuotesInvoicesOpen2, setIsQuotesInvoicesOpen2] = useState(false);
  const [isClientsOpen, setIsClientsOpen] = useState(false);
  const [stampSettings, setStampSettings] = useState({
    text: "PAID",
    color: "#22c55e",
    showDate: true,
    enabled: true,
  });
  const [customerName, setCustomerName] = useState("Meridian Developments");
  const [customerEmail, setCustomerEmail] = useState("projects@meridian.co.za");
  const [customerPhone, setCustomerPhone] = useState("+27 11 234 5678");
  const [propertyAddress, setPropertyAddress] = useState(
    "45 Corporate Boulevard, Sandton, Johannesburg, 2196",
  );
  const [siteType, setSiteType] = useState("Commercial");
  const [siteSize, setSiteSize] = useState("1200");
  const [floors, setFloors] = useState("3");
  const [phases, setPhases] = useState("2");
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
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({
    description: "",
    rate: "",
    qty: "",
    workCategory: "Foundation Work",
    taxRate: "15",
    phase: "Phase 1",
  });

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const totalTax = items.reduce((sum, item) => sum + item.taxAmount, 0);
  const total = subtotal + totalTax;

  const steps = [
    { number: 1, title: "Client Info", icon: Users },
    { number: 2, title: "Site Details", icon: Building },
    { number: 3, title: "Scope of Work", icon: Wrench },
    { number: 4, title: "Schedule & Payment", icon: Calendar },
  ];

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
  const handleCustomerSaved = () => {
    loadCustomers();
  };

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
    siteDetails: { type: siteType, size: siteSize, floors, phases },
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

  const handleSaveBusinessInfo = async () => {
    if (!user?.uid) return;
    try {
      const db = getFirestore();
      await setDoc(doc(db, "users", user.uid, "settings", "businessInfo"), {
        ...businessInfo,
        stampSettings,
      });
      alert("Business information saved successfully!");
      setShowSettings(false);
    } catch (error) {
      alert("Failed to save business information");
    }
  };

  const printStyles = `
    @media print {
      body * { visibility: hidden !important; }
      #print-area, #print-area * { visibility: visible !important; }
      #print-area { display: block !important; position: absolute !important; left: 0 !important; top: 0 !important; width: 210mm !important; min-height: 297mm !important; margin: 0 !important; padding: 10mm !important; box-sizing: border-box !important; background: white !important; }
      @page { size: A4 portrait; margin: 0; }
      html, body { margin: 0 !important; padding: 0 !important; width: 210mm !important; background: white !important; }
      * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
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

  // ── Shared input class ───────────────────────────────────────────────────
  const inputCls =
    "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md bg-white text-[#1e293b] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-[#2563eb] transition-colors";
  const labelCls =
    "block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5";
  const selectCls =
    "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md bg-white text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-[#2563eb] transition-colors";

  // ── Sidebar nav item ─────────────────────────────────────────────────────
  const NavItem = ({
    icon: Icon,
    label,
    onClick,
    accent = "blue",
    active = false,
  }) => {
    const accentMap = {
      blue: "hover:bg-[#1e3a5f]",
      purple: "hover:bg-[#2d1f4a]",
      green: "hover:bg-[#1a3a2d]",
      pink: "hover:bg-[#3a1f2d]",
    };
    return (
      <div
        onClick={onClick}
        className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-150 ${active ? "bg-[#253347] text-white" : `text-[#94a3b8] ${accentMap[accent]} hover:text-white`}`}
      >
        <Icon className="w-4 h-4 flex-shrink-0" />
        <span className="text-sm font-medium truncate">{label}</span>
      </div>
    );
  };

  return (
    <div className="flex h-screen w-screen bg-[#f0f2f5] overflow-hidden">
      <ConstructionSidebar
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
        savedCustomers={savedCustomers}
        handleLogout={handleLogout}
      />
      {/* ── Main Content Area ────────────────────────────────────────────── */}
      <div
        className={`flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-300`}
      >
        <AppHeader
          actions={headerActions}
          mobileActions={mobileDashboardActions}
          onSettingsOpen={() => setShowSettings(true)}
        />

        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
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

            {/* Saved Quotes List Modal */}
            {showQuotesList && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col shadow-2xl border border-[#e2e8f0]">
                  <div className="px-6 py-4 border-b border-[#e2e8f0] flex items-center justify-between bg-[#f8fafc]">
                    <h2 className="text-base font-semibold text-[#1e293b]">
                      Saved {documentType === "quote" ? "Quotes" : "Invoices"}
                      <span className="ml-2 text-xs font-normal text-[#64748b] bg-[#e2e8f0] px-2 py-0.5 rounded-full">
                        {savedQuotes.length}
                      </span>
                    </h2>
                    <button
                      onClick={() => setShowQuotesList(false)}
                      className="p-1.5 text-[#64748b] hover:text-[#1e293b] hover:bg-[#e2e8f0] rounded-lg transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="overflow-auto">
                    {savedQuotes.length === 0 ? (
                      <div className="text-center py-16 text-[#94a3b8]">
                        <Receipt className="w-10 h-10 mx-auto mb-3 opacity-40" />
                        <p className="text-sm font-medium">
                          No saved{" "}
                          {documentType === "quote" ? "quotes" : "invoices"} yet
                        </p>
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
                              "Balance",
                              "Status",
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
                          {savedQuotes.map((quote) => (
                            <tr
                              key={quote.id}
                              onClick={() => loadQuote(quote)}
                              className="border-b border-[#f1f5f9] hover:bg-[#f8fafc] cursor-pointer transition-colors"
                            >
                              <td className="px-4 py-3 text-sm font-semibold text-[#2563eb]">
                                {quote.quoteNumber || "N/A"}
                              </td>
                              <td className="px-4 py-3 text-sm text-[#374151]">
                                {quote.customer?.name || "N/A"}
                              </td>
                              <td className="px-4 py-3 text-sm font-semibold text-[#1e293b]">
                                R{quote.totals?.total?.toFixed(2) || "0.00"}
                              </td>
                              <td className="px-4 py-3 text-sm text-[#059669] font-medium">
                                R{(quote.totals?.paid || 0).toFixed(2)}
                              </td>
                              <td className="px-4 py-3 text-sm text-[#dc2626] font-medium">
                                R{(quote.totals?.due || 0).toFixed(2)}
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${quote.status === "paid" ? "bg-[#dcfce7] text-[#166534]" : quote.status === "partially_paid" ? "bg-[#fef3c7] text-[#92400e]" : "bg-[#dbeafe] text-[#1e40af]"}`}
                                >
                                  {quote.status === "paid"
                                    ? "Paid"
                                    : quote.status === "partially_paid"
                                      ? "Partial"
                                      : "Pending"}
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
            {/* ── Invoice Preview Modal ─────────────────────────────────────── */}
            {showPreview && (
              <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden">
                  {/* Modal header */}
                  <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#e2e8f0] bg-[#f8fafc] flex-shrink-0">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 bg-[#0f172a] rounded-lg flex items-center justify-center">
                        <Eye className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h2 className="text-sm font-semibold text-[#1e293b]">
                          {documentType === "quote" ? "Quote" : "Invoice"}{" "}
                          Preview
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

                  {/* Scrollable canvas area */}
                  <div className="flex-1 overflow-y-auto bg-[#e2e8f0] p-6">
                    <div
                      className="mx-auto bg-white shadow-xl"
                      style={{ width: "210mm", minHeight: "297mm" }}
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
                </div>
              </div>
            )}
            {/* ── Alternate views ──────────────────────────────────────────── */}
            {activeView === "financial-overview" && (
              <FinancialOverview user={user} />
            )}
            {activeView === "history-view" && <HistoryView user={user} />}
            {activeView === "notes-view" && <NotesView user={user} />}
            {activeView === "templates" && <Templates user={user} />}
            {activeView === "home" && <HomeView user={user} />}

            {/* ── Quote / Invoice Builder ──────────────────────────────────── */}
            {activeView === "quote" && (
              <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-5xl mx-auto">
                {/* ── Summary stat cards ──────────────────────────────────── */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {[
                    {
                      label: "Total Amount",
                      value: `R${total.toFixed(2)}`,
                      icon: DollarSign,
                      color: "text-[#1e293b]",
                      iconBg: "bg-[#eff6ff]",
                      iconColor: "text-[#2563eb]",
                    },
                    {
                      label: "Paid",
                      value: `R${paymentStatus.totalPaid.toFixed(2)}`,
                      icon: CheckSquare,
                      color:
                        paymentStatus.totalPaid > 0
                          ? "text-[#059669]"
                          : "text-[#94a3b8]",
                      iconBg:
                        paymentStatus.totalPaid > 0
                          ? "bg-[#dcfce7]"
                          : "bg-[#f1f5f9]",
                      iconColor:
                        paymentStatus.totalPaid > 0
                          ? "text-[#059669]"
                          : "text-[#94a3b8]",
                    },
                    {
                      label: "Balance Due",
                      value: `R${paymentStatus.balanceDue.toFixed(2)}`,
                      icon: Wallet,
                      color:
                        paymentStatus.balanceDue <= 0
                          ? "text-[#059669]"
                          : "text-[#dc2626]",
                      iconBg:
                        paymentStatus.balanceDue <= 0
                          ? "bg-[#dcfce7]"
                          : "bg-[#fef2f2]",
                      iconColor:
                        paymentStatus.balanceDue <= 0
                          ? "text-[#059669]"
                          : "text-[#dc2626]",
                    },
                  ].map(
                    ({
                      label,
                      value,
                      icon: Icon,
                      color,
                      iconBg,
                      iconColor,
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
                        <div className={`text-xl font-bold ${color}`}>
                          {value}
                        </div>
                      </div>
                    ),
                  )}
                </div>

                {/* ── Payment status banner ────────────────────────────────── */}
                {quoteId && (
                  <div
                    className={`mb-6 px-5 py-3.5 rounded-xl border flex items-center justify-between ${paymentStatus.status === "paid" ? "bg-[#f0fdf4] border-[#bbf7d0]" : paymentStatus.status === "partially_paid" ? "bg-[#fffbeb] border-[#fde68a]" : "bg-[#fff7ed] border-[#fed7aa]"}`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${paymentStatus.status === "paid" ? "bg-[#dcfce7]" : paymentStatus.status === "partially_paid" ? "bg-[#fef3c7]" : "bg-[#ffedd5]"}`}
                      >
                        {paymentStatus.status === "paid" ? (
                          <CheckSquare className="w-4 h-4 text-[#059669]" />
                        ) : paymentStatus.status === "partially_paid" ? (
                          <CreditCard className="w-4 h-4 text-[#d97706]" />
                        ) : (
                          <Wallet className="w-4 h-4 text-[#ea580c]" />
                        )}
                      </div>
                      <div>
                        <div
                          className={`text-sm font-semibold ${paymentStatus.status === "paid" ? "text-[#166534]" : paymentStatus.status === "partially_paid" ? "text-[#92400e]" : "text-[#9a3412]"}`}
                        >
                          {paymentStatus.status === "paid"
                            ? "Fully Paid"
                            : paymentStatus.status === "partially_paid"
                              ? `Partial Payment — R${paymentStatus.totalPaid.toFixed(2)} paid, R${paymentStatus.balanceDue.toFixed(2)} remaining`
                              : `Payment Pending — R${paymentStatus.balanceDue.toFixed(2)} due`}
                        </div>
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

                {/* ── Main card ────────────────────────────────────────────── */}
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
                    <>
                      {/* ── Step indicator ──────────────────────────────────── */}
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
                                  className={`flex-1 h-px mx-3 ${currentStep > step.number ? "bg-[#059669]" : "bg-[#e2e8f0]"}`}
                                />
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>

                      {/* ── Step content ─────────────────────────────────────── */}
                      <div className="p-6">
                        {/* Step 1 – Client Info */}
                        {currentStep === 1 && (
                          <div>
                            <div className="flex items-center gap-3 mb-6">
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
                              <div>
                                <label className={labelCls}>
                                  Client / Company Name{" "}
                                  <span className="text-[#dc2626] normal-case tracking-normal font-normal">
                                    *
                                  </span>
                                </label>
                                <input
                                  type="text"
                                  value={customerName}
                                  onChange={(e) =>
                                    setCustomerName(e.target.value)
                                  }
                                  className={inputCls}
                                  placeholder="Meridian Developments"
                                />
                              </div>
                              <div>
                                <label className={labelCls}>
                                  Email{" "}
                                  <span className="text-[#dc2626] normal-case tracking-normal font-normal">
                                    *
                                  </span>
                                </label>
                                <input
                                  type="email"
                                  value={customerEmail}
                                  onChange={(e) =>
                                    setCustomerEmail(e.target.value)
                                  }
                                  className={inputCls}
                                  placeholder="projects@company.co.za"
                                />
                              </div>
                              <div>
                                <label className={labelCls}>
                                  Phone{" "}
                                  <span className="text-[#dc2626] normal-case tracking-normal font-normal">
                                    *
                                  </span>
                                </label>
                                <input
                                  type="tel"
                                  value={customerPhone}
                                  onChange={(e) =>
                                    setCustomerPhone(e.target.value)
                                  }
                                  className={inputCls}
                                  placeholder="+27 11 234 5678"
                                />
                              </div>
                              <div>
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
                                  className={inputCls}
                                  placeholder="45 Corporate Boulevard, Sandton"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Step 2 – Site Details */}
                        {currentStep === 2 && (
                          <div>
                            <div className="flex items-center gap-3 mb-6">
                              <div className="w-9 h-9 bg-[#fff7ed] rounded-lg flex items-center justify-center">
                                <Building className="w-5 h-5 text-[#ea580c]" />
                              </div>
                              <div>
                                <h2 className="text-base font-semibold text-[#1e293b]">
                                  Site Details
                                </h2>
                                <p className="text-xs text-[#64748b]">
                                  Provide site specifications for an accurate
                                  quote
                                </p>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className={labelCls}>
                                  Site / Project Type
                                </label>
                                <select
                                  value={siteType}
                                  onChange={(e) => setSiteType(e.target.value)}
                                  className={selectCls}
                                >
                                  {[
                                    "Commercial",
                                    "Residential",
                                    "Industrial",
                                    "Infrastructure",
                                    "Renovation",
                                    "Government",
                                  ].map((o) => (
                                    <option key={o}>{o}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className={labelCls}>
                                  Site Area (sqm)
                                </label>
                                <input
                                  type="number"
                                  value={siteSize}
                                  onChange={(e) => setSiteSize(e.target.value)}
                                  className={inputCls}
                                  placeholder="1200"
                                />
                              </div>
                              <div>
                                <label className={labelCls}>
                                  Number of Floors
                                </label>
                                <input
                                  type="number"
                                  value={floors}
                                  onChange={(e) => setFloors(e.target.value)}
                                  className={inputCls}
                                  placeholder="3"
                                />
                              </div>
                              <div>
                                <label className={labelCls}>
                                  Number of Phases
                                </label>
                                <input
                                  type="number"
                                  value={phases}
                                  onChange={(e) => setPhases(e.target.value)}
                                  className={inputCls}
                                  placeholder="2"
                                />
                              </div>
                            </div>
                            {/* Site summary */}
                            <div className="mt-5 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg p-4">
                              <h3 className="text-xs font-semibold text-[#374151] uppercase tracking-wide flex items-center gap-2 mb-3">
                                <MapPin className="w-3.5 h-3.5 text-[#64748b]" />
                                Site Summary
                              </h3>
                              <div className="grid grid-cols-3 gap-4 text-sm">
                                {[
                                  ["Type", siteType],
                                  ["Area", `${siteSize} sqm`],
                                  ["Floors / Phases", `${floors} / ${phases}`],
                                ].map(([k, v]) => (
                                  <div key={k}>
                                    <div className="text-[#94a3b8] text-xs mb-0.5">
                                      {k}
                                    </div>
                                    <div className="font-semibold text-[#1e293b]">
                                      {v}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Step 3 – Scope of Work */}
                        {currentStep === 3 && (
                          <div>
                            <div className="flex items-center gap-3 mb-6">
                              <div className="w-9 h-9 bg-[#f1f5f9] rounded-lg flex items-center justify-center">
                                <Wrench className="w-5 h-5 text-[#475569]" />
                              </div>
                              <div>
                                <h2 className="text-base font-semibold text-[#1e293b]">
                                  Scope of Work
                                </h2>
                                <p className="text-xs text-[#64748b]">
                                  Add work items and materials to the quote
                                </p>
                              </div>
                            </div>

                            {/* Add item form */}
                            <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-5 mb-5">
                              <h3 className="text-sm font-semibold text-[#374151] mb-4 flex items-center gap-2">
                                <Plus className="w-4 h-4 text-[#2563eb]" />
                                Add Work Item
                              </h3>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
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
                                    {[
                                      "Foundation Work",
                                      "Structural Steel",
                                      "Concrete & Masonry",
                                      "Electrical",
                                      "Plumbing",
                                      "Roofing",
                                      "Finishing & Plastering",
                                      "Earthworks",
                                      "Landscaping",
                                      "Site Preparation",
                                      "HVAC",
                                      "Windows & Doors",
                                      "Painting",
                                      "Tiling & Flooring",
                                      "Materials Supply",
                                    ].map((o) => (
                                      <option key={o}>{o}</option>
                                    ))}
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
                                    {[
                                      "Phase 1",
                                      "Phase 2",
                                      "Phase 3",
                                      "Phase 4",
                                      "Ongoing",
                                    ].map((o) => (
                                      <option key={o}>{o}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                              <div className="mb-3">
                                <label className={labelCls}>Description</label>
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
                                  <label className={labelCls}>Quantity</label>
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
                                <div className="flex items-end">
                                  <button
                                    onClick={handleAddItem}
                                    className="w-full flex items-center justify-center gap-1.5 px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium rounded-md transition-colors"
                                  >
                                    <Plus className="w-4 h-4" />
                                    Add
                                  </button>
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
                                            className="px-4 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wide whitespace-nowrap"
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
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#eff6ff] text-[#1d4ed8]">
                                              {item.workCategory || "General"}
                                            </span>
                                          </td>
                                          <td className="px-4 py-3">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#f0fdf4] text-[#166534]">
                                              {item.phase || "Phase 1"}
                                            </span>
                                          </td>
                                          <td className="px-4 py-3 text-sm text-[#374151] text-right">
                                            R{item.rate.toFixed(2)}
                                          </td>
                                          <td className="px-4 py-3 text-sm text-[#374151] text-right">
                                            {item.qty}
                                          </td>
                                          <td className="px-4 py-3 text-sm text-[#374151] text-right">
                                            R{item.taxAmount.toFixed(2)}
                                          </td>
                                          <td className="px-4 py-3 text-sm font-semibold text-[#1e293b] text-right">
                                            R{item.totalAmount.toFixed(2)}
                                          </td>
                                          <td className="px-4 py-3 text-center">
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
                                {/* Totals */}
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
                              <div className="border-2 border-dashed border-[#e2e8f0] rounded-xl py-12 text-center mb-5">
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
                            <div className="flex items-center gap-3 mb-6">
                              <div className="w-9 h-9 bg-[#f0fdf4] rounded-lg flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-[#059669]" />
                              </div>
                              <div>
                                <h2 className="text-base font-semibold text-[#1e293b]">
                                  Schedule & Payment Terms
                                </h2>
                                <p className="text-xs text-[#64748b]">
                                  Review quote details, milestones, and payment
                                  terms
                                </p>
                              </div>
                            </div>

                            {/* Summary stats */}
                            <div className="grid grid-cols-3 gap-4 mb-6">
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
                                    className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm"
                                  >
                                    <div
                                      className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center mb-3`}
                                    >
                                      <Icon className={`w-4 h-4 ${color}`} />
                                    </div>
                                    <div className="text-xs text-[#64748b] mb-1">
                                      {label}
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

                            {/* Payment terms table */}
                            <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden shadow-sm mb-5">
                              <div className="px-5 py-3.5 border-b border-[#e2e8f0] bg-[#f8fafc] flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-[#64748b]" />
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
                                  ["Currency", "ZAR (South African Rand)"],
                                ].map(([k, v]) => (
                                  <div
                                    key={k}
                                    className="flex items-center justify-between px-5 py-3 text-sm"
                                  >
                                    <span className="text-[#64748b]">{k}</span>
                                    <span className="font-medium text-[#1e293b]">
                                      {v}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Client & Site summary */}
                            <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-5 mb-5">
                              <h3 className="text-sm font-semibold text-[#374151] mb-4">
                                Quote Summary
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                                <div>
                                  <div className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wide mb-2 flex items-center gap-1.5">
                                    <Users className="w-3.5 h-3.5" />
                                    Client
                                  </div>
                                  <div className="font-semibold text-[#1e293b]">
                                    {customerName}
                                  </div>
                                  <div className="text-[#64748b] mt-0.5">
                                    {customerEmail}
                                  </div>
                                  <div className="text-[#64748b]">
                                    {customerPhone}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wide mb-2 flex items-center gap-1.5">
                                    <Building className="w-3.5 h-3.5" />
                                    Site
                                  </div>
                                  <div className="font-semibold text-[#1e293b]">
                                    {propertyAddress}
                                  </div>
                                  <div className="text-[#64748b] mt-0.5">
                                    {siteType} · {siteSize} sqm · {floors}{" "}
                                    floors · {phases} phases
                                  </div>
                                </div>
                              </div>
                              <div className="mt-4 pt-4 border-t border-[#e2e8f0] grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                                {[
                                  ["Number", quoteNumber],
                                  ["Date", new Date().toLocaleDateString()],
                                  [
                                    "Type",
                                    documentType === "quote"
                                      ? "Quote"
                                      : "Invoice",
                                  ],
                                  ["Status", "Pending"],
                                ].map(([k, v]) => (
                                  <div key={k}>
                                    <div className="text-xs text-[#94a3b8] mb-0.5">
                                      {k}
                                    </div>
                                    <div
                                      className={`font-semibold ${k === "Status" ? "text-[#d97706]" : "text-[#1e293b]"}`}
                                    >
                                      {v}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {quoteId && (
                              <button
                                onClick={handleProcessPayment}
                                className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-[#059669] hover:bg-[#047857] text-white rounded-xl font-medium transition-colors shadow-sm"
                              >
                                <CreditCard className="w-4 h-4" />
                                Process Payment
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* ── Step nav bar ──────────────────────────────────── */}
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
                            <Save className="w-4 h-4" />
                            Save{" "}
                            {documentType === "quote" ? "Quote" : "Invoice"}
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Print area */}
      <div
        id="print-area"
        className="hidden print:block bg-white"
        style={{ width: "210mm", minHeight: "297mm" }}
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
  );
};

export default ConstructionDashboard;
