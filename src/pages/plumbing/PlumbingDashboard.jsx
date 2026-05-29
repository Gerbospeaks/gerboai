import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import HomeView from "../HomeView";
import BusinessSettingsModal from "../BusinessSettingsModal";
import AppHeader from "../AppHeader";
import StampSignatureModal from "../StampSignatureModal";
import { POTemplateRenderer } from "../Purchaseordertemplates";
import SubUserManagement from "../SubUserManagement";
import { serverTimestamp } from "firebase/firestore";
import logo from "../../assets/img/solidflo-logo.png";
import { getAuth, signOut } from "firebase/auth";
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
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Printer, Download } from "lucide-react";
import { db } from "../../firebase";
import CustomerModal from "../CustomerModal";
import CustomersListModal from "../CustomersListModal";
import SignatureStamp from "../SignatureStamp";
import { usePermissions } from "../../hooks/usePermissions";
import Templates from "./Templates";
import ServiceMarketplaceView from "../ServiceMarketplaceView";
import ServiceRequestsView from "../ServiceRequestsView";
import PurchaseOrders from "../PurchaseOrders";
import { useLocation } from "react-router-dom";
import PlumbingMultiStepForm from "./PlumbingMultiStepForm";
import AIInvoiceWindow from '../AIInvoiceWindow';
import StampOverlay from "../StampOverlay";
import uploadLogoToR2 from "../../utils/uploadLogoToR2";
import TemplateSelector, { TemplateRenderer } from "./TemplateSelector";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Home,
  Settings,
  Sparkles,
  Users,
  Calendar,
  DollarSign,
  Wallet,
  FileText,
  Wrench,
  FileBarChart,
  Stamp,
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
  PieChart,
  Droplets,
  ClipboardList,
  Package,
  Eye,
  X,
  MapPin,
  Upload,
} from "lucide-react";

const generateJobCardNumber = async (userId) => {
  const db = getFirestore();
  const year = new Date().getFullYear();

  const jobCardsRef = collection(db, "users", userId, "invoices");
  const q = query(jobCardsRef, orderBy("createdAt", "desc"), limit(1));
  const snapshot = await getDocs(q);

  let lastNumber = 1000;

  if (!snapshot.empty) {
    const lastJobCard = snapshot.docs[0].data();
    const match = lastJobCard.jobCardNumber?.match(/(\d+)$/);
    if (match) {
      lastNumber = Number(match[1]);
    }
  }

  const nextNumber = lastNumber + 1;
  return `PB-${year}-${String(nextNumber).padStart(4, "0")}`;
};

const functions = getFunctions();

const PlumbingDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [inputMode, setInputMode] = useState("manual");
  const [documentType, setDocumentType] = useState("invoice");
  const [useAI, setUseAI] = useState(false);
  const [activeTab, setActiveTab] = useState("WorkOrder");
  const [showJobCard, setShowJobCard] = useState(false);
  const { user, authUser } = useAuth();
  const [jobCardNumber, setJobCardNumber] = useState("");
  const [jobCardId, setJobCardId] = useState(null);
  const [savedJobCards, setSavedJobCards] = useState([]);
  const [showJobCardsList, setShowJobCardsList] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCustomersList, setShowCustomersList] = useState(false);
  const [savedCustomers, setSavedCustomers] = useState([]);
  const [activeTemplate, setActiveTemplate] = useState("classic");
  const [activeView, setActiveView] = useState("home");
  const [showCustomersListModal, setShowCustomersListModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("professional");
  const [customers, setCustomers] = useState([]);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isInvoicingOpen, setIsInvoicingOpen] = useState(false);
  const [isClientsOpen, setIsClientsOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const { can, isAdmin } = usePermissions();
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showAIWindow, setShowAIWindow] = useState(false);
  const [aiWindowOpen, setAiWindowOpen] = useState(false);
  const [aiDocType, setAiDocType] = useState('invoice');
  const [stampSettings, setStampSettings] = useState({
    text: "APPROVED",
    color: "#d32f2f",
    showDate: false,
    enabled: false,
  });
const [showStampModal, setShowStampModal] = useState(false);
const [stampConfig, setStampConfig] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState({
    totalPaid: 0,
    balanceDue: 0,
    status: "pending",
  });
  const [customerName, setCustomerName] = useState("John Smith");
  const [customerId, setCustomerId] = useState("CUST-2026-5678");
  const [customerEmail, setCustomerEmail] = useState("john.smith@example.com");
  const [customerPhone, setCustomerPhone] = useState("082 987 6543");
  const [customerAddress, setCustomerAddress] = useState(
    "456 Water Street, Manchester, M1 2AB",
  );
  const [propertyType, setPropertyType] = useState("Residential");
  const [propertyAddress, setPropertyAddress] = useState(
    "456 Water Street, Manchester, M1 2AB",
  );
  const [accessDetails, setAccessDetails] = useState(
    "Key available from main office",
  );
  const [emergencyService, setEmergencyService] = useState(false);
  const [businessInfo, setBusinessInfo] = useState({
    businessName: "AQUA FLOW PLUMBING SERVICES",
    addressLine1: "25 PIPELINE ROAD",
    addressLine2: "ANCOATS",
    city: "MANCHESTER",
    postalCode: "M4 3EQ",
    primaryPhone: "0161 234 5678",
    secondaryPhone: "07700 900123",
    logoUrl: "",
  });
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({
    description: "",
    rate: "",
    qty: "",
    type: "Labor",
  });
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const vat = subtotal * 0.2;
  const total = subtotal + vat;
  const location = useLocation();
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
    propertyAddress,
    accessDetails,
    emergencyService,
    items,
    subtotal,
    vat,
    total,
    documentType: "plumbing",
    serviceType: "PLUMBING",
    stampConfig,
  };

  // ============================================================================
  // Effects
  // ============================================================================
  useEffect(() => {
    if (!user?.uid) return;
    const loadJobCardNumber = async () => {
      const nextJobCard = await generateJobCardNumber(user.uid);
      setJobCardNumber(nextJobCard);
    };
    loadJobCardNumber();
    loadSavedJobCards();
  }, [user]);

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    if (location.state?.activeView) {
      setActiveView(location.state.activeView);
    }
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
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ============================================================================
  // Data loaders
  // ============================================================================
  const loadCustomers = async () => {
    try {
      const q = query(
        collection(db, "users", user.uid, "clients"),
        orderBy("createdAt", "desc"),
      );
      const querySnapshot = await getDocs(q);
      const customersData = [];
      querySnapshot.forEach((doc) =>
        customersData.push({ id: doc.id, ...doc.data() }),
      );
      setCustomers(customersData);
    } catch (error) {
      console.error("Error loading customers:", error);
    }
  };

  const loadSavedJobCards = async () => {
    if (!user?.uid) return;
    const db = getFirestore();
    const jobCardsRef = collection(db, "users", user.uid, "invoices");
    const q = query(jobCardsRef, orderBy("createdAt", "desc"), limit(50));
    const snapshot = await getDocs(q);
    setSavedJobCards(
      snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
    );
  };

  const loadSavedCustomers = async () => {
    if (!user?.uid) return;
    const db = getFirestore();
    const customersRef = collection(db, "users", user.uid, "clients");
    const q = query(customersRef, orderBy("createdAt", "desc"), limit(50));
    const snapshot = await getDocs(q);
    const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setSavedCustomers(list.filter((c) => !c._placeholder));
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
    if (!user?.uid || !jobCardId) {
      setPaymentStatus({ totalPaid: 0, balanceDue: total, status: "pending" });
      return;
    }
    try {
      const collectionName =
        documentType === "estimate" ? "estimates" : "invoices";
      const invoiceDoc = await getDoc(
        doc(db, "users", user.uid, collectionName, jobCardId),
      );
      if (invoiceDoc.exists()) {
        const data = invoiceDoc.data();
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
      console.error("Error loading payment status:", error);
      setPaymentStatus({ totalPaid: 0, balanceDue: total, status: "pending" });
    }
  };

  const loadJobCardForExport = async () => {
    if (!user?.uid || !jobCardId) return null;
    const db = getFirestore();
    const snap = await getDoc(
      doc(db, "users", user.uid, "invoices", jobCardId),
    );
    return snap.exists() ? snap.data() : null;
  };

  // ============================================================================
  // Handlers
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
    setCustomerAddress(customer.address || "");
    setCustomerId(customer.customerId || "");
  };

  const handleCustomerSaved = () => {
    loadCustomers();
  };

  const loadJobCard = (jobCard) => {
    setJobCardId(jobCard.id);
    setJobCardNumber(jobCard.jobCardNumber || "");
    setCustomerName(jobCard.customer?.name || "");
    setCustomerEmail(jobCard.customer?.email || "");
    setCustomerPhone(jobCard.customer?.phone || "");
    setCustomerAddress(jobCard.customer?.address || "");
    setCustomerId(jobCard.customer?.customerId || "");
    setPropertyType(jobCard.property?.type || "");
    setPropertyAddress(jobCard.property?.address || "");
    setAccessDetails(jobCard.property?.accessDetails || "");
    setEmergencyService(jobCard.property?.emergencyService || false);
    setItems(jobCard.items || []);
    setShowJobCardsList(false);
  };

  const buildJobCardPayload = (numberToUse) => ({
    jobCardNumber: numberToUse,
    locked: true,
    status: "pending",
    dates: {
      serviceDate: new Date().toISOString(),
      completedDate: null,
    },
    customer: {
      name: customerName,
      email: customerEmail,
      phone: customerPhone,
      address: customerAddress,
      customerId,
    },
    property: {
      type: propertyType,
      address: propertyAddress,
      accessDetails,
      emergencyService,
    },
    items,
    totals: {
      subtotal,
      vat,
      total,
      paid: 0,
      due: total,
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const handleSaveJobCard = async () => {
    if (!user?.uid) return;
    const db = getFirestore();
    let numberToUse = jobCardNumber;
    if (!jobCardId) {
      numberToUse = await generateJobCardNumber(user.uid);
      setJobCardNumber(numberToUse);
    }
    const jobCardData = buildJobCardPayload(numberToUse);
    if (jobCardId) {
      await updateDoc(doc(db, "users", user.uid, "invoices", jobCardId), {
        ...jobCardData,
        updatedAt: serverTimestamp(),
      });
    } else {
      const ref = await addDoc(
        collection(db, "users", user.uid, "invoices"),
        jobCardData,
      );
      setJobCardId(ref.id);
    }
    alert("Work order saved and locked");
    loadSavedJobCards();
  };

  const handleConvertToInvoice = async () => {
    if (!user?.uid) return;
    if (!jobCardId) {
      alert("Please save the job card first before converting to invoice");
      return;
    }
    if (
      !window.confirm(
        "Convert this job card to an invoice? This will create a new invoice with the same details.",
      )
    )
      return;
    try {
      const db = getFirestore();
      const newInvoiceNumber = await generateJobCardNumber(user.uid, "invoice");
      const invoiceData = buildJobCardPayload(newInvoiceNumber);
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
      alert(`Job Card successfully converted to Invoice ${newInvoiceNumber}`);
      loadSavedJobCards();
    } catch (error) {
      console.error("Error converting job card to invoice:", error);
      alert("Failed to convert job card to invoice");
    }
  };

  const handleProcessPayment = async () => {
    if (!jobCardId || !user?.uid) {
      alert("Please save the invoice before processing payment");
      return;
    }
    try {
      const collectionName =
        documentType === "estimate" ? "estimates" : "invoices";
      const invoiceDoc = await getDoc(
        doc(db, "users", user.uid, collectionName, jobCardId),
      );
      if (invoiceDoc.exists()) {
        setSelectedInvoiceForPayment({ id: jobCardId, ...invoiceDoc.data() });
        setShowPaymentModal(true);
      } else {
        alert("Invoice not found. Please save the invoice first.");
      }
    } catch (error) {
      console.error("Error loading invoice:", error);
      alert("Failed to load invoice for payment");
    }
  };

  const handlePaymentComplete = () => {
    loadSavedJobCards();
    loadPaymentStatus();
    setShowPaymentModal(false);
  };

  const handleNewJobCard = () => {
    setJobCardId(null);
    setJobCardNumber("");
    setCustomerName("John Smith");
    setCustomerId("CUST-2026-5678");
    setCustomerEmail("john.smith@example.com");
    setCustomerPhone("082 987 6543");
    setCustomerAddress("456 Water Street, Manchester, M1 2AB");
    setPropertyType("Residential");
    setPropertyAddress("456 Water Street, Manchester, M1 2AB");
    setAccessDetails("Key available from main office");
    setEmergencyService(false);
    setItems([]);
    const loadNewNumber = async () => {
      if (user?.uid) {
        const next = await generateJobCardNumber(user.uid);
        setJobCardNumber(next);
      }
    };
    loadNewNumber();
  };

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

  const handleAIDataExtracted = (extractedData) => {
    if (extractedData.customer?.name)
      setCustomerName(extractedData.customer.name);
    if (extractedData.customer?.email)
      setCustomerEmail(extractedData.customer.email);
    if (extractedData.customer?.phone)
      setCustomerPhone(extractedData.customer.phone);
    if (extractedData.customer?.address)
      setCustomerAddress(extractedData.customer.address);
    if (extractedData.customer?.customerId)
      setCustomerId(extractedData.customer.customerId);
    if (extractedData.property?.type)
      setPropertyType(extractedData.property.type);
    if (extractedData.property?.address)
      setPropertyAddress(extractedData.property.address);
    if (extractedData.property?.accessDetails)
      setAccessDetails(extractedData.property.accessDetails);
    if (typeof extractedData.property?.emergencyService === "boolean")
      setEmergencyService(extractedData.property.emergencyService);
    if (extractedData.items?.length > 0) setItems(extractedData.items);
    alert("✅ Plumbing work order data extracted and populated successfully!");
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
        businessInfo,
      );
      alert("Business information saved successfully!");
      setShowSettings(false);
    } catch (error) {
      console.error("Error saving business info:", error);
      alert("Failed to save business information");
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
    const savedJobCard = await loadJobCardForExport();
    if (!savedJobCard) {
      alert("Please save the work order before exporting PDF");
      return;
    }
    setJobCardNumber(savedJobCard.jobCardNumber);
    setItems(savedJobCard.items);
    setCustomerName(savedJobCard.customer.name);
    setCustomerEmail(savedJobCard.customer.email);
    setCustomerPhone(savedJobCard.customer.phone);
    setCustomerAddress(savedJobCard.customer.address);
    setPropertyType(savedJobCard.property.type);
    setPropertyAddress(savedJobCard.property.address);
    setTimeout(() => window.print(), 300);
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
      jobCardId && {
        label: "Convert to Invoice",
        icon: FileText,
        onClick: handleConvertToInvoice,
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
        "flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-sm font-semibold rounded-lg hover:from-emerald-700 transition-colors shadow-sm whitespace-nowrap",
    },
    {
      label: "Send",
      icon: Send,
      className:
        "flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold rounded-lg hover:from-blue-700 transition-colors shadow-sm whitespace-nowrap",
    },
    {
      label: "Save PDF",
      icon: Download,
      onClick: handleSavePDF,
      className:
        "flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-600 to-orange-700 text-white text-sm font-semibold rounded-lg hover:from-orange-700 transition-colors shadow-sm whitespace-nowrap",
    },
    {
      label: "Save",
      icon: Save,
      onClick: handleSaveJobCard,
      className:
        "flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-cyan-700 text-white text-sm font-semibold rounded-lg hover:from-cyan-700 transition-colors shadow-sm whitespace-nowrap",
    },
    
  ].filter(Boolean);

  const mobileDashboardActions = [
    documentType === "quote" &&
      jobCardId && {
        label: "To Invoice",
        icon: FileText,
        onClick: handleConvertToInvoice,
        className:
          "flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg text-xs font-semibold shadow-lg transition-all active:scale-95 whitespace-nowrap",
      },
    {
      label: "Save",
      icon: Save,
      onClick: handleSaveJobCard,
      className:
        "flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-cyan-600 to-cyan-700 text-white rounded-lg text-xs font-semibold shadow-lg transition-all active:scale-95 whitespace-nowrap",
    },
    {
      label: "Send",
      icon: Send,
      className:
        "flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-xs font-semibold shadow-lg transition-all active:scale-95 whitespace-nowrap",
    },
    {
      label: "PDF",
      icon: Download,
      onClick: handleSavePDF,
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
    <div className="flex h-screen w-screen bg-gradient-to-br from-cyan-50 via-slate-50 to-blue-50 overflow-hidden">
      {/* ── Mobile Sidebar Backdrop ──────────────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Collapsed Sidebar ────────────────────────────────────────────── */}
      <div
        className={`${sidebarOpen ? "hidden" : "hidden md:block"} fixed z-40 w-16 bg-gradient-to-b from-slate-900 to-slate-800 border-r border-slate-700 h-full print:hidden transition-all duration-300 shadow-xl`}
      >
        <div className="flex flex-col items-center py-4 md:py-6 space-y-4 md:space-y-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="group p-2 md:p-3 text-slate-400 hover:text-white hover:bg-gradient-to-r hover:from-cyan-600 hover:to-cyan-700 rounded-xl transition-all duration-300 shadow-lg hover:shadow-cyan-500/50 hover:scale-110"
            title="Expand Sidebar"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6 group-hover:animate-pulse" />
          </button>

          <div className="relative group">
            <div className="relative w-10 h-10 md:w-12 md:h-12 mb-2 md:mb-4 rounded-xl p-1 shadow-lg">
              <img src={logo} alt="" />
            </div>
          </div>

          <div className="w-10 border-t border-slate-600"></div>

          <div className="flex flex-col items-center space-y-3 md:space-y-4 w-full px-2 md:px-3">
            <button
              onClick={() => setActiveView("home")}
              className="group relative p-2 md:p-3 text-cyan-400 hover:text-white rounded-xl transition-all duration-300 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center overflow-hidden"
              title="Home"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-slate-600 to-slate-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Home className="w-5 h-5 md:w-6 md:h-6 relative z-10 group-hover:scale-110 transition-transform duration-300" />
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 text-slate-400 hover:text-white hover:bg-cyan-600/80 rounded-lg transition-all duration-200 w-10 h-10 flex items-center justify-center"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              className="p-2 text-slate-400 hover:text-white hover:bg-cyan-600/80 rounded-lg transition-all duration-200 w-10 h-10 flex items-center justify-center"
              title="Business Overview"
            >
              <TrendingUp className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                handleNewJobCard();
                setActiveView("invoice");
              }}
              className="p-2 text-slate-400 hover:text-white hover:bg-cyan-600/80 rounded-lg transition-all duration-200 w-10 h-10 flex items-center justify-center"
              title="Work Orders"
            >
              <ClipboardList className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowCustomersListModal(true)}
              className="p-2 text-slate-400 hover:text-white hover:bg-cyan-600/80 rounded-lg transition-all duration-200 w-10 h-10 flex items-center justify-center"
              title="Customers"
            >
              <Users className="w-5 h-5" />
            </button>
            <button
              onClick={() => setActiveView("templates")}
              className="p-2 text-slate-400 hover:text-white hover:bg-cyan-600/80 rounded-lg transition-all duration-200 w-10 h-10 flex items-center justify-center"
              title="Invoice Templates"
            >
              <FileText className="w-5 h-5" />
            </button>
            <button
              className="p-2 text-slate-400 hover:text-white hover:bg-cyan-600/80 rounded-lg transition-all duration-200 w-10 h-10 flex items-center justify-center"
              title="Properties"
            >
              <MapPin className="w-5 h-5" />
            </button>
            <button
              className="p-2 text-slate-400 hover:text-white hover:bg-cyan-600/80 rounded-lg transition-all duration-200 w-10 h-10 flex items-center justify-center"
              title="Parts Inventory"
            >
              <Package className="w-5 h-5" />
            </button>
            <button
              className="p-2 text-slate-400 hover:text-white hover:bg-cyan-600/80 rounded-lg transition-all duration-200 w-10 h-10 flex items-center justify-center"
              title="Invoices"
            >
              <Receipt className="w-5 h-5" />
            </button>
            <button
              className="p-2 text-slate-400 hover:text-white hover:bg-cyan-600/80 rounded-lg transition-all duration-200 w-10 h-10 flex items-center justify-center"
              title="Payments"
            >
              <CreditCard className="w-5 h-5" />
            </button>
            <button
              className="p-2 text-slate-400 hover:text-white hover:bg-cyan-600/80 rounded-lg transition-all duration-200 w-10 h-10 flex items-center justify-center"
              title="Appointments"
            >
              <Calendar className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="absolute bottom-4 md:bottom-6 left-0 right-0 flex justify-center">
          <div className="relative group">
            <div className="relative w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-full flex items-center justify-center ring-2 ring-cyan-700 shadow-lg group-hover:ring-4 group-hover:ring-cyan-500/50 transition-all duration-300">
              <img src={businessInfo.logoUrl} alt="" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Expanded Sidebar ─────────────────────────────────────────────── */}
      <div
        className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} fixed z-50 w-64 bg-gradient-to-b from-slate-900 to-slate-800 border-r border-slate-700 transition-transform duration-300 h-full print:hidden shadow-2xl overflow-y-auto`}
      >
        <div className="p-4 md:p-6">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <img
              src={logo}
              alt="Business Logo"
              className="w-16 h-12 object-contain rounded-lg"
            />
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-200"
              title="Collapse Sidebar"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>

          <nav className="space-y-1">
            <div
              onClick={() => {
                setActiveView("home");
                setSidebarOpen(false);
              }}
              className="group flex items-center space-x-2 md:space-x-3 px-3 md:px-4 py-2.5 md:py-3 text-cyan-300 hover:text-white hover:bg-gradient-to-r hover:from-slate-600/20 hover:to-slate-700/20 rounded-xl cursor-pointer transition-all duration-300 border border-transparent hover:border-cyan-500/30"
            >
              <Home className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
              <span className="text-xs md:text-sm font-semibold">Home</span>
            </div>
            <div
              onClick={() => {
                setShowSettings(true);
                setSidebarOpen(false);
              }}
              className="flex items-center space-x-3 px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200"
            >
              <Settings className="w-5 h-5" />
              <span className="text-sm font-medium">Settings</span>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-700/50">
              <div className="flex items-center space-x-3 px-3 py-2.5 text-slate-300 hover:text-white hover:bg-cyan-600/20 rounded-lg cursor-pointer transition-all duration-200">
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm font-medium">Business Overview</span>
              </div>

              <div className="mt-2">
                <div className="flex items-center justify-between px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200">
                  <div className="flex items-center space-x-3">
                    <ClipboardList className="w-5 h-5" />
                    <span className="text-sm font-medium">Work Orders</span>
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </div>
                <div className="ml-4 mt-1 space-y-1 border-l-2 border-slate-700/50 pl-4">
                  <div
                    onClick={() => {
                      handleNewJobCard();
                      setSidebarOpen(false);
                      setActiveView("invoice");
                    }}
                    className="px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700/30 rounded-lg cursor-pointer transition-all duration-200"
                  >
                    Create Work Order
                  </div>
                  <div
                    onClick={() => {
                      setShowJobCardsList(!showJobCardsList);
                      setSidebarOpen(false);
                    }}
                    className="px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700/30 rounded-lg cursor-pointer transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <span>All Work Orders</span>
                      <span className="text-cyan-300 px-2 py-0.5 rounded-full text-xs font-semibold">
                        {savedJobCards.length}
                      </span>
                    </div>
                  </div>
                  <div className="px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700/30 rounded-lg cursor-pointer transition-all duration-200">
                    In Progress
                  </div>
                  <div className="px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700/30 rounded-lg cursor-pointer transition-all duration-200">
                    Emergency Calls
                  </div>
                </div>
              </div>

              <div className="mt-2">
                <div className="flex items-center justify-between px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200">
                  <div className="flex items-center space-x-3">
                    <Users className="w-5 h-5" />
                    <span className="text-sm font-medium">Customers</span>
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </div>
                <div className="ml-4 mt-1 space-y-1 border-l-2 border-slate-700/50 pl-4">
                  <div
                    onClick={handleAddNewCustomer}
                    className="px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700/30 rounded-lg cursor-pointer transition-all duration-200"
                  >
                    Add Customer
                  </div>
                  <div
                    onClick={() => {
                      setShowCustomersListModal(true);
                      setSidebarOpen(false);
                    }}
                    className="px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700/30 rounded-lg cursor-pointer transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <span>All Customers</span>
                      <span className="text-cyan-300 px-2 py-0.5 rounded-full text-xs font-semibold">
                        {savedCustomers.length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div
                onClick={() => {
                  setActiveView("templates");
                  setSidebarOpen(false);
                }}
                className="flex items-center space-x-3 px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200 mt-2"
              >
                <FileText className="w-5 h-5" />
                <span className="text-sm font-medium">Invoice Templates</span>
              </div>
              <div className="flex items-center space-x-3 px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200">
                <MapPin className="w-5 h-5" />
                <span className="text-sm font-medium">Properties</span>
              </div>
              <div className="flex items-center space-x-3 px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200">
                <Package className="w-5 h-5" />
                <span className="text-sm font-medium">Parts Inventory</span>
              </div>
              <div className="flex items-center justify-between px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200">
                <div className="flex items-center space-x-3">
                  <Receipt className="w-5 h-5" />
                  <span className="text-sm font-medium">Invoices</span>
                </div>
                <ChevronDown className="w-4 h-4" />
              </div>
              <div className="flex items-center justify-between px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200">
                <div className="flex items-center space-x-3">
                  <CreditCard className="w-5 h-5" />
                  <span className="text-sm font-medium">Payments</span>
                </div>
                <ChevronDown className="w-4 h-4" />
              </div>
              <div className="flex items-center justify-between px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200">
                <div className="flex items-center space-x-3">
                  <FileBarChart className="w-5 h-5" />
                  <span className="text-sm font-medium">Reports</span>
                </div>
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </nav>
        </div>

        <div className="absolute bottom-4 md:bottom-6 left-0 right-0 flex justify-center p-4 md:p-6 border-t border-slate-700/50 bg-gradient-to-t from-slate-900 to-transparent backdrop-blur-sm">
          <div className="flex items-center space-x-2 md:space-x-3">
            <div className="relative group flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-teal-600 rounded-full opacity-50 group-hover:opacity-100 blur-md transition-opacity duration-300"></div>
              <div className="relative w-9 h-9 md:w-11 md:h-11 bg-white rounded-full ring-2 ring-slate-700 shadow-lg group-hover:ring-4 group-hover:ring-cyan-500/50 transition-all duration-300">
                <img
                  src={businessInfo.logoUrl}
                  alt="Business Logo"
                  className="absolute inset-0 m-auto max-h-[70%] max-w-[70%] object-contain"
                />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs md:text-sm font-bold text-white bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent truncate">
                {user?.name || "User"}
              </div>
              <div className="text-xs text-slate-400 truncate">
                {user?.email || "email@example.com"}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="group text-slate-400 hover:text-white hover:bg-gradient-to-r hover:from-red-600/20 hover:to-red-700/20 p-2 md:p-2.5 rounded-xl transition-all duration-300 border border-transparent hover:border-red-500/30 flex-shrink-0"
            >
              <LogOut className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-300" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Content Area ────────────────────────────────────────────── */}
      <div
        className={`flex-1 transition-all duration-300 ${sidebarOpen ? "ml-0 lg:ml-64" : "ml-2 md:ml-16"}`}
      >
        <div className="flex flex-col h-screen">
          <AppHeader
            actions={headerActions}
            mobileActions={mobileDashboardActions}
            onSettingsOpen={() => setShowSettings(true)}
          />

          {/* ── Scrollable Main Content ──────────────────────────────── */}
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
      activeView === "purchase-orders"
        ? <POTemplateRenderer  />
        : <TemplateRenderer {...templateProps} />
    }
    businessInfo={businessInfo}
    existingConfig={stampConfig}
  />
)}
            {/* ── Saved Work Orders List Modal ─────────────────────────── */}
            {showJobCardsList && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
                  <div className="p-4 border-b flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Saved Work Orders</h2>
                    <button
                      onClick={() => setShowJobCardsList(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="overflow-auto p-4">
                    {savedJobCards.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No saved work orders yet
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {savedJobCards.map((card) => (
                          <div
                            key={card.id}
                            onClick={() => loadJobCard(card)}
                            className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-semibold text-lg">
                                  {card.jobCardNumber || "N/A"}
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                  Customer: {card.customer?.name || "N/A"}
                                </div>
                                <div className="text-sm text-gray-600">
                                  Property: {card.property?.type || ""} -{" "}
                                  {card.property?.address || "N/A"}
                                </div>
                                {card.property?.emergencyService && (
                                  <span className="inline-block px-2 py-1 bg-red-100 text-red-700 text-xs rounded mt-1">
                                    EMERGENCY
                                  </span>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-semibold text-cyan-600">
                                  R{card.totals?.total?.toFixed(2) || "0.00"}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {card.dates?.serviceDate
                                    ? new Date(
                                        card.dates.serviceDate,
                                      ).toLocaleDateString("en-GB")
                                    : "N/A"}
                                </div>
                                <div
                                  className={`text-xs mt-1 px-2 py-1 rounded ${card.status === "completed" ? "bg-green-100 text-green-700" : card.status === "pending" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}`}
                                >
                                  {card.status || "unknown"}
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

            {/* ── Preview Modal ─────────────────────────────────────────── */}
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
                          Work Order Preview
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
                      style={{ position: "relative", width: "210mm", minHeight: "297mm" }}
                    >
                      <TemplateRenderer {...templateProps} />
                      <StampOverlay stampConfig={stampConfig} pageNumber={1} businessInfo={businessInfo} />
                    </div>
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
                       industry="plumbing"
                       TemplateRenderer={TemplateRenderer}
                     />
                   )}
            {/* ── Alternate Views ──────────────────────────────────────── */}
            {activeView === "templates" && <Templates user={user} />}
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

            {/* ── Invoice / Work Order Builder ─────────────────────────── */}
            {activeView === "invoice" && (
              <div
                className="flex flex-1 overflow-hidden min-h-0"
                style={{ height: "calc(100vh - 60px)" }}
              >
                {/* ── LEFT: Form panel ───────────────────────────────────── */}
                <div className="flex-1 overflow-y-auto">
                  <div className="grid grid-cols-1 gap-6 px-4 sm:px-6 lg:px-8 xl:px-12 py-6">
                    {/* Mobile toggle */}
                    <button
                      onClick={() => setShowJobCard(!showJobCard)}
                      className="xl:hidden w-full mb-4 flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 text-gray-800 rounded-lg hover:bg-cyan-100 transition-colors"
                    >
                      <FileText className="w-5 h-5" />
                      {showJobCard ? "Hide Work Order" : "View Work Order"}
                    </button>

                    {/* Manual / AI Tab switcher */}
                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm pt-2 sm:pt-6">
                      <div className="flex border-b border-slate-200">
                        <button
                          onClick={() => setInputMode("manual")}
                          className={`flex-1 px-2 sm:px-6 py-2 sm:py-4 font-semibold text-xs sm:text-base transition-all duration-200 ${inputMode === "manual" ? "bg-white text-cyan-600 border-b-2 border-cyan-600 shadow-sm" : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`}
                        >
                          <span className="flex items-center justify-center gap-1 sm:gap-2">
                            <svg
                              className="w-4 h-4 sm:w-5 sm:h-5"
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
                            <span className="hidden sm:inline">
                              Manual Entry
                            </span>
                            <span className="sm:hidden">Manual</span>
                          </span>
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
                      
                    </div>

                    {inputMode === "manual" && (
                      <>
                        {/* Status banner */}
                        <div className="bg-cyan-50 border border-cyan-200 rounded-lg px-4 py-3 flex items-center space-x-3">
                          <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                          <span className="text-cyan-700 text-sm font-medium">
                            In Progress
                          </span>
                          <span className="text-cyan-600">Started Today</span>
                        </div>

                        {/* Summary cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-3 rounded-xl border border-cyan-200 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                              <div className="text-sm font-medium text-cyan-700">
                                Total Amount
                              </div>
                              <div className="w-8 h-8 bg-cyan-200 rounded-lg flex items-center justify-center">
                                <DollarSign className="w-5 h-5 text-cyan-600" />
                              </div>
                            </div>
                            <div className="text-base sm:text-lg md:text-2xl font-bold text-cyan-900">
                              R{total.toFixed(2)}
                            </div>
                          </div>

                          <div
                            className={`bg-gradient-to-br p-3 rounded-xl border shadow-sm transition-all ${paymentStatus.totalPaid > 0 ? "from-emerald-100 to-emerald-300 border-emerald-600" : "from-slate-100 to-slate-300 border-slate-300"}`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div
                                className={`text-sm font-medium ${paymentStatus.totalPaid > 0 ? "text-emerald-700" : "text-slate-600"}`}
                              >
                                Paid
                              </div>
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center ${paymentStatus.totalPaid > 0 ? "bg-emerald-200" : "bg-slate-200"}`}
                              >
                                <CheckSquare
                                  className={`w-5 h-5 ${paymentStatus.totalPaid > 0 ? "text-emerald-600" : "text-slate-400"}`}
                                />
                              </div>
                            </div>
                            <div
                              className={`text-lg sm:text-2xl font-bold ${paymentStatus.totalPaid > 0 ? "text-emerald-900" : "text-slate-900"}`}
                            >
                              R{paymentStatus.totalPaid.toFixed(2)}
                            </div>
                          </div>

                          <div
                            className={`bg-gradient-to-br p-3 rounded-xl border shadow-sm transition-all ${paymentStatus.balanceDue <= 0 ? "from-emerald-100 to-emerald-300 border-emerald-600" : paymentStatus.totalPaid > 0 ? "from-amber-100 to-amber-300 border-amber-300" : "from-rose-50 to-rose-100 border-rose-200"}`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div
                                className={`text-sm font-medium ${paymentStatus.balanceDue <= 0 ? "text-emerald-700" : paymentStatus.totalPaid > 0 ? "text-amber-700" : "text-rose-700"}`}
                              >
                                Balance Due
                              </div>
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center ${paymentStatus.balanceDue <= 0 ? "bg-emerald-200" : paymentStatus.totalPaid > 0 ? "bg-amber-200" : "bg-rose-200"}`}
                              >
                                <Wallet
                                  className={`w-5 h-5 ${paymentStatus.balanceDue <= 0 ? "text-emerald-600" : paymentStatus.totalPaid > 0 ? "text-amber-600" : "text-rose-600"}`}
                                />
                              </div>
                            </div>
                            <div
                              className={`text-lg sm:text-2xl font-bold ${paymentStatus.balanceDue <= 0 ? "text-emerald-900" : paymentStatus.totalPaid > 0 ? "text-amber-900" : "text-rose-900"}`}
                            >
                              R{paymentStatus.balanceDue.toFixed(2)}
                            </div>
                          </div>
                        </div>

                        {/* Multi-step form */}
                        <PlumbingMultiStepForm
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
                          propertyAddress={propertyAddress}
                          setPropertyAddress={setPropertyAddress}
                          accessDetails={accessDetails}
                          setAccessDetails={setAccessDetails}
                          emergencyService={emergencyService}
                          setEmergencyService={setEmergencyService}
                          items={items}
                          setItems={setItems}
                          newItem={newItem}
                          setNewItem={setNewItem}
                          handleAddItem={handleAddItem}
                        />
                      </>
                    )}
                  </div>
                </div>

                {/* ── RIGHT: Live preview panel ─────────────────────────── */}
                <div className="hidden xl:flex w-[420px] flex-shrink-0 flex-col border-l border-slate-200 bg-slate-100 overflow-hidden">
                  {/* Panel header */}
                  <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 flex-shrink-0">
                    <TemplateSelector
                      selectedTemplate={selectedTemplate}
                      onTemplateChange={setSelectedTemplate}
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
                        onClick={handleSavePDF}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-cyan-600 text-white text-xs font-medium rounded-lg hover:bg-cyan-700 transition-colors"
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
      </div>

      {/* ── Print / PDF Preview (hidden on-screen) ────────────────────── */}
      <div
        id="print-area"
        className="hidden print:block bg-white shadow-2xl origin-top"
        style={{
          width: "210mm",
          minHeight: "297mm",
          transform: "scale(0.75)",
          transformOrigin: "top center",
        }}
      >
        <TemplateRenderer {...templateProps} />
      </div>
    </div>
  );
};

export default PlumbingDashboard;
