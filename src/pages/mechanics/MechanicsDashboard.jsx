import { getAuth, signOut } from "firebase/auth";
import JobCardTemplate from "./JobCardTemplate";
import LetterheadEditor from "../../components/LetterheadEditor";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  limit,
  deleteDoc,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  increment,
  runTransaction,
} from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import {
  ArrowRight,
  Building2,
  Car,
  Stamp,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Download,
  Eye,
  ClipboardList,
  FileText,
  MapPin,
  Package,
  Plus,
  Printer,
  Receipt,
  Save,
  Send,
  Trash2,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Truck,
  Users,
  Wallet,
  Wrench,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "../../assets/img/solidflo-logo.png";
import PaymentProcessor from "../../components/dashboard/PaymentProcessor";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../firebase";
import uploadLogoToR2 from "../../utils/uploadLogoToR2";
import HomeView from "../HomeView";
import SolidFloAgent from "../../components/SolidFloAgent/SolidFloAgent";
import AIInvoiceWindow from "../AIInvoiceWindow";
import AppHeader from "../AppHeader";
import StampPaywallModal from "../StampPaywallModal";
import StampSignatureModal from "../StampSignatureModal";
import { POTemplateRenderer } from "../Purchaseordertemplates";
import SubUserManagement from "../SubUserManagement";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import BusinessSettingsModal from "../BusinessSettingsModal";
import CustomerModal from "../CustomerModal";
import CustomersListModal from "../CustomersListModal";
import FinancialOverview from "../FinancialOverview";
import ReportsView from "./ReportsView";
import HistoryView from "./HistoryView";
import MechanicsSidebar from "./MechanicsSidebar";
import NotesView from "./NotesView";
import PartsInventory from "./PartsInventory";
import { usePermissions } from "../../hooks/usePermissions";
import Templates from "./Templates";
import ServiceMarketplaceView from "../ServiceMarketplaceView";
import ServiceRequestsView from "../ServiceRequestsView";
import PurchaseOrders from "../PurchaseOrders";
import StampOverlay, { AllPagesStampOverlay } from "../StampOverlay";
import TemplateSelector, { TemplateRenderer } from "./TemplateSelector";
import Vehicles from "./Vehicles";
const WORKER_URL = process.env.REACT_APP_API_URL;
// Counter doc lives at users/{uid}/counters/{quotations|invoices}. The first
// time it's used for an existing account it's seeded from whatever the
// highest existing jobCardNumber is, so numbering picks up where the old
// scheme left off instead of colliding with real quotes/invoices.
const initializeCounterIfNeeded = async (db, userId, collectionName, counterRef) => {
  const counterSnap = await getDoc(counterRef);
  if (counterSnap.exists()) return counterSnap.data().value || 891;

  const snapshot = await getDocs(collection(db, "users", userId, collectionName));
  let maxNumber = 891;
  snapshot.forEach((docSnap) => {
    const match = docSnap.data()?.jobCardNumber?.match(/(\d+)$/);
    if (match) {
      const n = Number(match[1]);
      if (n > maxNumber) maxNumber = n;
    }
  });
  await setDoc(
    counterRef,
    { value: maxNumber, updatedAt: serverTimestamp() },
    { merge: true },
  );
  return maxNumber;
};

// Atomically reserves the next quote/invoice number. Uses a Firestore
// transaction on a dedicated counter doc rather than "read the most recent
// doc and add 1" — the old approach could return the same number twice
// (e.g. if createdAt hadn't resolved yet, or the latest doc's number didn't
// parse), and since that number becomes the document ID, a repeat number
// meant the new save silently overwrote an existing quote instead of
// creating a new one.
const generateJobCardNumber = async (userId, documentType) => {
  const db = getFirestore();
  const year = new Date().getFullYear();
  const collectionName = documentType === "quote" ? "quotations" : "invoices";
  const prefix = documentType === "quote" ? "QT" : "JC";
  const counterRef = doc(db, "users", userId, "counters", collectionName);

  await initializeCounterIfNeeded(db, userId, collectionName, counterRef);

  const nextNumber = await runTransaction(db, async (transaction) => {
    const counterSnap = await transaction.get(counterRef);
    const current = counterSnap.exists() ? counterSnap.data().value || 891 : 891;
    const next = current + 1;
    transaction.set(
      counterRef,
      { value: next, updatedAt: serverTimestamp() },
      { merge: true },
    );
    return next;
  });

  return `${prefix}-${year}-${String(nextNumber).padStart(4, "0")}`;
};

// Read-only preview of the next number, used purely for display (e.g. before
// the user has actually saved). Does NOT reserve/increment the counter, so
// just opening the form or switching tabs doesn't burn numbers.
const peekNextJobCardNumber = async (userId, documentType) => {
  const db = getFirestore();
  const year = new Date().getFullYear();
  const collectionName = documentType === "quote" ? "quotations" : "invoices";
  const prefix = documentType === "quote" ? "QT" : "JC";
  const counterRef = doc(db, "users", userId, "counters", collectionName);
  const current = await initializeCounterIfNeeded(db, userId, collectionName, counterRef);
  return `${prefix}-${year}-${String(current + 1).padStart(4, "0")}`;
};

const functions = getFunctions();

const MechanicsDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState("home");
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const handleQuickCreate = ({ view, action }) => {
    if (action === "newInvoice") handleNewInvoice();
    if (action === "newQuote") handleNewQuote();
    if (action === "newCustomer") handleAddNewCustomer();
    if (view) setActiveView(view);
  };
  const FREE_STAMP_LIMIT = 5;
  const [showStampModal, setShowStampModal] = useState(false);
  const [stampConfig, setStampConfig] = useState(null);
  const [stampUnlocked, setStampUnlocked] = useState(false);
  const [stampUsageCount, setStampUsageCount] = useState(0);
  const [showStampPaywall, setShowStampPaywall] = useState(false);
const mobileNavPad = "pb-24 lg:pb-6";
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState("JobCard");
  const [showJobCard, setShowJobCard] = useState(false);
  const { user, authUser } = useAuth();
  const [technicianName, setTechnicianName] = useState("");
  const [bayNumber, setBayNumber] = useState("");
  const [estimatedHours, setEstimatedHours] = useState("");
  const [faultDescription, setFaultDescription] = useState("");
  const [diagnosisNotes, setDiagnosisNotes] = useState("");
  const [workPerformed, setWorkPerformed] = useState("");
  const [customerApproved, setCustomerApproved] = useState(false);
  const [partsChecklist, setPartsChecklist] = useState([]);
  const [jobCardNumber, setJobCardNumber] = useState("");
  const [jobCardId, setJobCardId] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const [savedJobCards, setSavedJobCards] = useState([]);
  const [showJobCardsList, setShowJobCardsList] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCustomersList, setShowCustomersList] = useState(false);
  const [currentJobCardId, setCurrentJobCardId] = useState(null);
  const [savedCustomers, setSavedCustomers] = useState([]);
  const [showCustomersListModal, setShowCustomersListModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [activeTemplate, setActiveTemplate] = useState("classic");
  const [selectedTemplate, setSelectedTemplate] = useState("professional");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [inputMode, setInputMode] = useState("manual");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isInvoicingOpen, setIsInvoicingOpen] = useState(false);
  const [isClientsOpen, setIsClientsOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isSavingPDF, setIsSavingPDF] = useState(false);
  const [savedDocId, setSavedDocId] = useState(null);
  const [savedDocType, setSavedDocType] = useState(null);
  const { can, isAdmin } = usePermissions();
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] =
    useState(null);
  const [useAI, setUseAI] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [vatRate, setVatRate] = useState(0);
  const [isTablet, setIsTablet] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalQuotes: 0,
    totalInvoiced: 0,
    totalClients: 0,
    pendingPayments: 0,
    loading: true,
  });
  const [pdfViewer, setPdfViewer] = useState(null);
  const [aiWindowOpen, setAiWindowOpen] = useState(false);
  const [aiDocType, setAiDocType] = useState("invoice");
  const [showAIWindow, setShowAIWindow] = useState(false);
  const [poNumber, setPoNumber] = useState("");
  const [poDate, setPoDate] = useState(new Date().toLocaleDateString("en-ZA"));
  const [deliveryDate, setDeliveryDate] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [supplierContact, setSupplierContact] = useState("");
  const [supplierEmail, setSupplierEmail] = useState("");
  const [supplierPhone, setSupplierPhone] = useState("");
  const [supplierAddress, setSupplierAddress] = useState("");
  const [deliveryName, setDeliveryName] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [poItems, setPoItems] = useState([
    { description: "", qty: 1, unit: "ea", unitPrice: 0, amount: 0 },
  ]);
  const [notes, setNotes] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("30 Days");
  const [shippingMethod, setShippingMethod] = useState("");
  const [stampSettings, setStampSettings] = useState("");
  const [paymentStatus, setPaymentStatus] = useState({
    totalPaid: 0,
    balanceDue: 0,
    status: "pending",
  });
  const [documentType, setDocumentType] = useState("invoice");
  const DOC_CONFIG = {
    invoice: { prefix: "Inv", folder: "invoices" },
    quote: { prefix: "QT", folder: "quotes" },
    purchase_order: { prefix: "PO", folder: "purchase_orders" },
    sick_note: { prefix: "SN", folder: "sick_notes" },
    jobcard: { prefix: "JC", folder: "jobcards" },
    waybill: { prefix: "WB", folder: "waybills" },
  };
  const location = useLocation();
  useEffect(() => {
    if (location.state?.activeView) setActiveView(location.state.activeView);
  }, [location.state]);
  const [newPoItem, setNewPoItem] = useState({
    description: "",
    qty: 1,
    unit: "ea",
    unitPrice: 0,
  });

  const handleAddPoItem = () => {
    if (!newPoItem.description || !newPoItem.qty) return;
    const unitPrice = Number(newPoItem.unitPrice) || 0;
    const qty = Number(newPoItem.qty);
    setPoItems((prev) => [
      ...prev.filter((i) => i.description),
      {
        description: newPoItem.description,
        qty,
        unit: newPoItem.unit,
        unitPrice,
        amount: unitPrice * qty,
      },
    ]);
    setNewPoItem({ description: "", qty: 1, unit: "ea", unitPrice: 0 });
  };
  const dirtySet = (setter) => (val) => {
    setter(val);
    setIsDirty(true);
  };
  const handleSavePO = async () => {
    if (!user?.uid) return;
    try {
      const db = getFirestore();
      const poData = {
        poNumber,
        poDate,
        deliveryDate,
        supplierName,
        supplierContact,
        supplierEmail,
        supplierPhone,
        supplierAddress,
        deliveryName,
        deliveryAddress,
        items: poItems.filter((i) => i.description),
        totals: { subtotal: poSubtotal, vat: poVat, total: poTotal },
        notes,
        paymentTerms,
        shippingMethod,
        status: "pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(
        doc(db, "users", user.uid, "purchaseOrders", poNumber),
        poData,
        { merge: true },
      );

      alert("Purchase Order saved successfully!");
    } catch (error) {
      alert("Failed to save Purchase Order");
    }
  };
  const poSubtotal = poItems.reduce(
    (sum, item) => sum + Number(item.amount),
    0,
  );
  const poVat = poSubtotal * 0.15;
  const poTotal = poSubtotal + poVat;
  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleAIDataExtracted = (extractedData) => {
    if (extractedData.customer.name)
      setCustomerName(extractedData.customer.name);
    if (extractedData.customer.email)
      setCustomerEmail(extractedData.customer.email);
    if (extractedData.customer.phone)
      setCustomerPhone(extractedData.customer.phone);
    if (extractedData.customer.address)
      setCustomerAddress(extractedData.customer.address);
    if (extractedData.customer.merchant_code)
      setCustomerId(extractedData.customer.merchant_code);
    if (extractedData.billTo.name) setBillName(extractedData.billTo.name);
    if (extractedData.billTo.email) setBillEmail(extractedData.billTo.email);
    if (extractedData.billTo.phone) setBillPhone(extractedData.billTo.phone);
    if (extractedData.billTo.address)
      setBillAddress(extractedData.billTo.address);
    if (extractedData.vehicle.make) setVehicleMake(extractedData.vehicle.make);
    if (extractedData.vehicle.model)
      setVehicleModel(extractedData.vehicle.model);
    if (extractedData.vehicle.year) setVehicleYear(extractedData.vehicle.year);
    if (extractedData.vehicle.registration)
      setVehicleReg(extractedData.vehicle.registration);
    if (extractedData.vehicle.vin) setVehicleVin(extractedData.vehicle.vin);
    if (extractedData.vehicle.mileage)
      setVehicleMileage(extractedData.vehicle.mileage);
    if (extractedData.vehicle.preAuth)
      setPreAuth(extractedData.vehicle.preAuth);
    if (extractedData.vehicle.authCode)
      setAuthCode(extractedData.vehicle.authCode);
    if (extractedData.items?.length > 0) setItems(extractedData.items);
    alert("✅ Data extracted and populated successfully!");
  };

  const handleNext = () => {
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };
  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  useEffect(() => {
    if (!user?.uid) return;
    const loadJobCardNumber = async () => {
      const nextJobCard = await peekNextJobCardNumber(user.uid, documentType);
      setJobCardNumber(nextJobCard);
    };
    loadJobCardNumber();
    loadSavedJobCards();
  }, [user, documentType]);

  useEffect(() => {
    if (user?.uid) fetchBusinessStats();
  }, [user]);

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
      invoicesSnap.forEach((doc) => {
        const d = doc.data();
        invoiceCount++;
        const amount = parseFloat(d.totals?.total || d.total || 0);
        totalInvoiced += amount;
        if (["pending", "unpaid", "partially_paid"].includes(d.status))
          pendingPayments += parseFloat(
            d.totals?.due || d.totals?.total || d.total || 0,
          );
        invoicesList.push({ id: doc.id, ...d });
      });
      invoicesList.sort((a, b) => {
        const t = (x) => {
          const v =
            x.dates?.invoiceDate ||
            x.dates?.quoteDate ||
            x.createdAt?.toDate?.() ||
            new Date(0);
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
          collection(db, "users", user.uid, "quotations"),
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
  if (!user?.uid) return;
  const checkStampAccess = async () => {
    try {
      const db = getFirestore();
      const snap = await getDoc(doc(db, "users", user.uid, "settings", "features"));
      if (snap.exists()) {
        const data = snap.data();
        setStampUnlocked(data.stampSignatureUnlocked === true);
        setStampUsageCount(data.stampUsageCount || 0);
      }
    } catch (err) {
      console.error("Error checking stamp access:", err);
    }
  };
  checkStampAccess();
}, [user]);
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
const handleStampButtonClick = () => {
  if (stampUnlocked || stampUsageCount < FREE_STAMP_LIMIT) {
    setShowStampModal(true);
  } else {
    setShowStampPaywall(true);
  }
};
  const handleProcessPayment = async () => {
    if (!jobCardId || !user?.uid) {
      alert("Please save the invoice before processing payment");
      return;
    }
    try {
      const collectionName =
        documentType === "quote" ? "quotations" : "invoices";
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
      alert("Failed to load invoice for payment");
    }
  };
const handleUnlockStamp = async () => {
  const auth = getAuth();
  const token = await auth.currentUser.getIdToken();
  const res = await fetch(`${WORKER_URL}/purchase-feature`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ feature: "stamp_signature" }),
  });
  if (!res.ok) throw new Error(await res.text());

  setStampUnlocked(true);
  setShowStampPaywall(false);
  setShowStampModal(true);
};
  const loadPaymentStatus = async () => {
    if (!user?.uid || !jobCardId) {
      setPaymentStatus({ totalPaid: 0, balanceDue: total, status: "pending" });
      return;
    }
    try {
      const collectionName =
        documentType === "quote" ? "quotations" : "invoices";
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
      setPaymentStatus({ totalPaid: 0, balanceDue: total, status: "pending" });
    }
  };

  const handlePaymentComplete = () => {
    loadSavedJobCards();
    loadPaymentStatus();
    setShowPaymentModal(false);
  };

  const loadSavedJobCards = async () => {
    if (!user?.uid) return;
    const db = getFirestore();
    const collectionName = documentType === "quote" ? "quotations" : "invoices";
    const jobCardsRef = collection(db, "users", user.uid, collectionName);
    const q = query(jobCardsRef, orderBy("createdAt", "desc"), limit(50));
    const snapshot = await getDocs(q);

    const cards = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    cards.sort((a, b) => {
      const getTime = (card) => {
        const t = card.updatedAt || card.createdAt;
        if (!t) return 0;
        if (t.toDate) return t.toDate().getTime();
        if (t.seconds) return t.seconds * 1000;
        return new Date(t).getTime();
      };
      return getTime(b) - getTime(a);
    });

    setSavedJobCards(cards);
  };
  const handleAddNewCustomer = () => {
    setSelectedCustomer(null);
    setShowCustomerModal(true);
  };
  const handleDeleteJobCard = async (e, cardId) => {
    e.stopPropagation(); // prevent row click from loading the card
    if (
      !window.confirm(
        "Are you sure you want to delete this record? This cannot be undone.",
      )
    )
      return;
    try {
      const db = getFirestore();
      const collectionName =
        documentType === "quote" ? "quotations" : "invoices";
      await deleteDoc(doc(db, "users", user.uid, collectionName, cardId));
      setSavedJobCards((prev) => prev.filter((c) => c.id !== cardId));
      setInvoices((prev) => prev.filter((inv) => inv.id !== cardId));
      // if the deleted card is currently open, reset the form
      if (jobCardId === cardId) handleNewJobCard();
    } catch (error) {
      alert("Failed to delete record: " + error.message);
    }
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
    setCustomerId(customer.merchant_code || "");
    setBillName(customer.name || "");
    setBillEmail(customer.email || "");
    setBillPhone(customer.phone || "");
    setBillAddress(customer.address || "");
    setIsDirty(true);
  };

  const handleCustomerSaved = () => {
    loadCustomers();
  };

  useEffect(() => {
    loadCustomers();
  }, []);
  useEffect(() => {
    loadPaymentStatus();
  }, [jobCardId, user?.uid, documentType]);

  const loadJobCard = (jobCard) => {
    setJobCardId(jobCard.id);
    setJobCardNumber(jobCard.jobCardNumber || "");
    setDocumentType(jobCard.documentType || "invoice");
    setCustomerName(jobCard.customer?.name || "");
    setCustomerEmail(jobCard.customer?.email || "");
    setCustomerPhone(jobCard.customer?.phone || "");
    setCustomerAddress(jobCard.customer?.address || "");
    setCustomerId(jobCard.customer?.merchant_code || "");
    setBillName(jobCard.billTo?.name || "");
    setBillEmail(jobCard.billTo?.email || "");
    setBillPhone(jobCard.billTo?.phone || "");
    setBillAddress(jobCard.billTo?.address || "");
    setVehicleMake(jobCard.vehicle?.make || "");
    setVehicleModel(jobCard.vehicle?.model || "");
    setVehicleYear(jobCard.vehicle?.year || "");
    setVehicleReg(jobCard.vehicle?.registration || "");
    setVehicleVin(jobCard.vehicle?.vin || "");
    setPreAuth(jobCard.vehicle?.preAuth || "");
    setAuthCode(jobCard.vehicle?.authCode || "");
    setVehicleMileage(jobCard.vehicle?.mileage || "");
    setItems(jobCard.items || []);
    setShowJobCardsList(false);
    setPaymentStatus({
      totalPaid: jobCard.totals?.paid || 0,
      balanceDue: jobCard.totals?.due || jobCard.totals?.total || 0,
      status: jobCard.status || "pending",
    });
    setIsDirty(false);
    setActiveView("invoice");
  };

  const loadSavedCustomers = async () => {
    if (!user?.uid) return;
    const db = getFirestore();
    const customersRef = collection(db, "users", user.uid, "clients");
    const q = query(customersRef, orderBy("createdAt", "desc"), limit(50));
    const snapshot = await getDocs(q);
    setSavedCustomers(
      snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((c) => !c._placeholder),
    );
  };

  const loadJobCardForExport = async () => {
    if (!user?.uid || !jobCardId) return null;
    const db = getFirestore();
    const collectionName = documentType === "quote" ? "quotations" : "invoices";
    const snap = await getDoc(
      doc(db, "users", user.uid, collectionName, jobCardId),
    );
    return snap.exists() ? snap.data() : null;
  };

  const handleSavePDF = async () => {
    setIsSavingPDF(true);
    try {
      // ── 1. Grab the already-rendered, already-styled print area ──────────
      const printArea = document.getElementById("print-area");
      if (!printArea) throw new Error("Print area not found");

      // Temporarily make it visible for html2canvas (but off-screen)
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
      // Remove the Tailwind hidden class temporarily
      printArea.classList.remove("hidden");

      // Give browser a frame to paint
      await new Promise((resolve) => setTimeout(resolve, 300));

      // ── 2. Fix CORS for logo images ───────────────────────────────────────
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

      // ── 3. Capture ────────────────────────────────────────────────────────
      const canvas = await html2canvas(printArea, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
        width: 794,
        windowWidth: 794,
      });

      // ── 4. Restore original hidden state ──────────────────────────────────
      printArea.classList.add("hidden");
      printArea.setAttribute("style", prevStyle);

      // ── 5. Build PDF ──────────────────────────────────────────────────────
      const prefix =
        activeView === "purchase-orders"
          ? "PO"
          : documentType === "quote"
            ? "Quote"
            : "Invoice";

      const number =
        activeView === "purchase-orders"
          ? poNumber || "draft"
          : jobCardNumber || "draft";

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

      // ── 6. Upload to R2 ───────────────────────────────────────────────────
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

      // ── 7. Save to Firestore ──────────────────────────────────────────────
      const docType =
        activeView === "purchase-orders"
          ? "purchase_order"
          : documentType === "quote"
            ? "quote"
            : "invoice";

      const folder = DOC_CONFIG[docType]?.folder ?? docType;
      const firestoreDb = getFirestore();
      if (!jobCardId || isDirty) {
        setIsDirty(false);
      } else {
        if (jobCardId) {
          await setDoc(doc(firestoreDb, "users", user.uid, folder, number), {
            fileName,
            downloadUrl: publicUrl,
            r2Key: key,
            docType,
            docNumber: number,
            generatedAt: serverTimestamp(),
            customerName,
            vehicleReg,
            total,
          });
        }
      }

      const collectionName =
        activeView === "purchase-orders"
          ? "purchaseOrders"
          : documentType === "quote"
            ? "quotations"
            : "invoices";

      // ── Ensure the invoice doc exists before patching downloadUrl ─────────
      let activeJobCardId = jobCardId;

      if (!activeJobCardId && activeView !== "purchase-orders") {
        // ✅ use the job card number as the ID
        await setDoc(
          doc(firestoreDb, "users", user.uid, collectionName, jobCardNumber),
          buildJobCardPayload(jobCardNumber),
        );
        activeJobCardId = jobCardNumber;
        setJobCardId(jobCardNumber);
        loadSavedJobCards();
      }

      // Patch downloadUrl so the Recent list shows the View/Save buttons
      if (activeJobCardId) {
        await updateDoc(
          doc(firestoreDb, "users", user.uid, collectionName, activeJobCardId),
          { downloadUrl: publicUrl },
        );
        setInvoices((prev) =>
          prev.map((inv) =>
            inv.id === activeJobCardId
              ? { ...inv, downloadUrl: publicUrl }
              : inv,
          ),
        );
      }

      alert("✅ Invoice saved as PDF successfully!");
    } catch (err) {
      console.error("PDF save error:", err);
      alert("Failed to save PDF: " + err.message);
    } finally {
      setIsSavingPDF(false);
    }
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
  const handleRemoveItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };
  const handleUpdateItem = (index, field, value) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const updated = { ...item, [field]: value };
        // Recalculate amount whenever rate or qty changes
        if (field === "rate" || field === "qty") {
          updated.amount = Number(updated.rate) * Number(updated.qty);
        }
        return updated;
      }),
    );
  };
  // State
  const [customerName, setCustomerName] = useState("John Smith");
  const [merchant_code, setCustomerId] = useState("V*R-9890");
  const [customerEmail, setCustomerEmail] = useState("john.smith@example.com");
  const [customerPhone, setCustomerPhone] = useState("082 123 4567");
  const [customerAddress, setCustomerAddress] = useState(
    "123 Main Street, Pretoria, 0001",
  );
  const [billName, setBillName] = useState("John Smith");
  const [billEmail, setBillEmail] = useState("john.smith@example.com");
  const [billPhone, setBillPhone] = useState("082 123 4567");
  const [billAddress, setBillAddress] = useState(
    "123 Main Street, Pretoria, 0001",
  );
  const [vehicleMake, setVehicleMake] = useState("Toyota");
  const [vehicleModel, setVehicleModel] = useState("Hilux");
  const [vehicleYear, setVehicleYear] = useState("2020");
  const [vehicleReg, setVehicleReg] = useState("ABC 123 GP");
  const [vehicleVin, setVehicleVin] = useState("1HGBH41JXMN109186");
  const [vehicleMileage, setVehicleMileage] = useState("45000");
  const [preAuth, setPreAuth] = useState("AUTH123");
  const [authCode, setAuthCode] = useState("456789");

  const [businessInfo, setBusinessInfo] = useState({
    businessName: "V8 POWERED AUTO SERVICE",
    addressLine1: "9-10 CNR THIRD & ARKWRIGHT AVENUE",
    addressLine2: "WYNBERG",
    city: "SANDTON",
    postalCode: "2090",
    primaryPhone: "082 514 4509",
    secondaryPhone: "084 583 9929",
    logoUrl: "",
  });
  const [loading, setLoading] = useState(true);

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
        if (data.logoUrl) {
          const b64 = await toBase64(data.logoUrl);
          setLogoBase64(b64);
        }
      }
    } catch (error) {
      console.error("Error loading business info:", error);
    }
  };
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
      .catch(() => url); // fall back to original URL if CORS fails

  const [logoBase64, setLogoBase64] = useState("");
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
      const b64 = await toBase64(logoUrl);
      setBusinessInfo((prev) => ({ ...prev, logoUrl, uploading: false }));
      const db = getFirestore();
      await setDoc(
        doc(db, "users", user.uid, "settings", "businessInfo"),
        { logoUrl, updatedAt: new Date().toISOString() },
        { merge: true },
      );
      alert("Logo uploaded successfully!");
      setLogoBase64(b64);
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

  const printStyles = `@media print { 
  * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } 
  html,body { margin:0!important;padding:0!important;width:210mm!important;background:white!important; } 
  body * { visibility:hidden!important; } 
  #print-area,#print-area * { visibility:visible!important; } 
  #print-area { display:block!important;position:absolute!important;left:0!important;top:0!important;width:210mm!important;min-height:297mm!important;margin:0!important;padding:0!important;background:white!important; } 
  #jobcard-printable { padding: 40px 0 !important; box-sizing: border-box !important; width: 210mm !important; }
  #jobcard-printable * { box-sizing: border-box !important; }
  @page { size:A4 portrait; margin: 40px 0 !important; } 
}`;
  const handlePrint = () => {
    const styleSheet = document.createElement("style");
    styleSheet.textContent = printStyles;
    document.head.appendChild(styleSheet);

    // Wait for styles to apply and DOM to repaint
    requestAnimationFrame(() => {
      setTimeout(() => {
        window.print();
      }, 300);
    });

    // Clean up stylesheet after printing is done
    window.onafterprint = () => {
      document.head.removeChild(styleSheet);
      window.onafterprint = null;
    };
  };
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({
    description: "",
    rate: "",
    qty: "",
    type: "Labor",
  });
const handleStampConfirm = async (cfg) => {
  setStampConfig(cfg);
  setShowStampModal(false);

  if (stampUnlocked || !user?.uid) return; // unlimited once unlocked, nothing to count

  setStampUsageCount((prev) => prev + 1); // optimistic UI update

  try {
    const db = getFirestore();
    await setDoc(
      doc(db, "users", user.uid, "settings", "features"),
      { stampUsageCount: increment(1) }, // atomic server-side increment
      { merge: true },
    );
  } catch (err) {
    console.error("Failed to record stamp usage:", err);
  }
};
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const vat = subtotal * (vatRate / 100);
  const total = subtotal + vat;

  useEffect(() => {
    if (!jobCardId)
      setPaymentStatus({ totalPaid: 0, balanceDue: total, status: "pending" });
  }, [total, jobCardId]);

  const buildJobCardPayload = (numberToUse) => ({
    jobCardNumber: numberToUse || jobCardNumber,
    locked: true,
    status: "pending",
    documentType,
    dates: { serviceDate: new Date().toISOString(), completedDate: null },
    customer: {
      name: customerName,
      email: customerEmail,
      phone: customerPhone,
      address: customerAddress,
      merchant_code,
    },
    billTo: {
      name: billName,
      email: billEmail,
      phone: billPhone,
      address: billAddress,
    },
    vehicle: {
      make: vehicleMake,
      model: vehicleModel,
      year: vehicleYear,
      registration: vehicleReg,
      vin: vehicleVin,
      mileage: vehicleMileage,
      preAuth: preAuth,
      authCode: authCode,
    },
    items,
    vatRate,
    totals: { subtotal, vat, total, paid: 0, due: total },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    workshop: {
      technicianName,
      bayNumber,
      estimatedHours,
      faultDescription,
      diagnosisNotes,
      workPerformed,
      partsChecklist,
      customerApproved,
    },
  });

  const handleSaveJobCard = async () => {
    if (!user?.uid) return;
    if (jobCardId && !isDirty) {
      alert("No changes detected. Edit the invoice before saving again.");
      return;
    }
    const db = getFirestore();
    let numberToUse = jobCardNumber;

    if (!jobCardId) {
      numberToUse = await generateJobCardNumber(user.uid, documentType);
      setJobCardNumber(numberToUse);
    }

    const jobCardData = buildJobCardPayload(numberToUse);
    const collectionName = documentType === "quote" ? "quotations" : "invoices";

    const docId = jobCardId || numberToUse;

    await setDoc(
      doc(db, "users", user.uid, collectionName, docId),
      { ...jobCardData, updatedAt: serverTimestamp() },
      { merge: true },
    );

    setJobCardId(docId);
    setIsDirty(false);
    alert(
      `${documentType === "quote" ? "Quote" : "Job card"} saved — ${numberToUse}`,
    );
    loadSavedJobCards();
    fetchBusinessStats();
  };

  const handleConvertToInvoice = async () => {
    if (!user?.uid) return;
    if (!jobCardId) {
      alert("Please save the quote first before converting to invoice");
      return;
    }
    if (!window.confirm("Convert this quote to an invoice?")) return;
    try {
      const db = getFirestore();
      const newInvoiceNumber = await generateJobCardNumber(user.uid, "invoice");
      const invoiceData = buildJobCardPayload(newInvoiceNumber);
      invoiceData.documentType = "invoice";
      invoiceData.jobCardNumber = newInvoiceNumber; // ← explicitly set
      invoiceData.convertedFromQuote = jobCardId;
      invoiceData.convertedFromQuoteNumber = jobCardNumber;
      invoiceData.convertedAt = serverTimestamp();

      await setDoc(
        doc(db, "users", user.uid, "invoices", newInvoiceNumber),
        invoiceData,
      );

      await updateDoc(doc(db, "users", user.uid, "quotations", jobCardId), {
        convertedToInvoice: true,
        convertedToInvoiceId: newInvoiceNumber,
        convertedToInvoiceNumber: newInvoiceNumber,
        convertedAt: serverTimestamp(),
        status: "converted",
      });

      setDocumentType("invoice");
      setJobCardId(newInvoiceNumber);
      setJobCardNumber(newInvoiceNumber); // ← already there, confirm it's correct
      setIsDirty(false); // ← add this so no stale dirty flag
      alert(`Converted to Invoice ${newInvoiceNumber}`);
      loadSavedJobCards();
    } catch (error) {
      alert("Failed to convert quote to invoice");
    }
  };

  const handleNewQuote = () => {
    setDocumentType("quote");
    handleNewJobCard();
  };
  const handleNewInvoice = () => {
    setDocumentType("invoice");
    handleNewJobCard();
  };

  const handleNewJobCard = () => {
    setJobCardId(null);
    setIsDirty(false);
    setJobCardNumber("");
    setCustomerName("John Smith");
    setCustomerId("CUST-2026-1234");
    setCustomerEmail("john.smith@example.com");
    setCustomerPhone("082 123 4567");
    setCustomerAddress("123 Main Street, Pretoria, 0001");
    setVehicleMake("Toyota");
    setVehicleModel("Hilux");
    setVehicleYear("2020");
    setVehicleReg("ABC 123 GP");
    setVehicleVin("1HGBH41JXMN109186");
    setVehicleMileage("45000");
    setItems([]);
    setCurrentStep(1);
    const loadNewNumber = async () => {
      if (user?.uid) {
        const n = await peekNextJobCardNumber(user.uid, documentType);
        setJobCardNumber(n);
      }
    };
    loadNewNumber();
  };

  const handleLogout = async () => {
    try {
      await signOut(getAuth());
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // ── Design tokens ─────────────────────────────────────────────────────────
  const inputCls =
    "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md bg-white text-[#1e293b] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-[#2563eb] transition-colors";
  const labelCls =
    "block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5";
  const selectCls =
    "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md bg-white text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-[#2563eb] transition-colors";

  // ── Header action buttons ─────────────────────────────────────────────────
  const headerActions = [
    can("createQuote") &&
  documentType === "quote" &&
  jobCardId &&
  activeView === "invoice" && {
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
    activeView !== "purchase-orders" && {
      label: "New",
      icon: Plus,
      onClick: documentType === "quote" ? handleNewQuote : handleNewInvoice,
      className:
        "flex items-center gap-1.5 px-3 py-1.5 bg-[#059669] hover:bg-[#047857] text-white text-sm font-medium rounded-md transition-colors whitespace-nowrap",
    },
    {
      label: "Save",
      icon: Save,
      onClick: handleSaveJobCard,
      className:
        "flex items-center gap-1.5 px-3 py-1.5 bg-[#ea580c] hover:bg-[#c2410c] text-white text-sm font-medium rounded-md transition-colors whitespace-nowrap",
    },
    can("createInvoice") && {
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
    can("createInvoice") || can("createQuote")
      ? {
          label:
            activeView === "purchase-orders"
              ? "Save P.O."
              : documentType === "quote"
                ? "Save Quote"
                : "Save Invoice",
          icon: Save,
          onClick:
            activeView === "purchase-orders" ? handleSavePO : handleSaveJobCard,
          className:
            "flex items-center gap-1.5 px-3 py-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium rounded-md transition-colors whitespace-nowrap",
        }
      : null,
  ].filter(Boolean);

  const mobileDashboardActions = [
    documentType === "quote" &&
      jobCardId &&
      activeView !== "purchase-orders" && {
        label: "To Invoice",
        icon: FileText,
        onClick: handleConvertToInvoice,
        className:
          "flex items-center gap-1.5 px-3 py-2 bg-[#7c3aed] text-white rounded-md text-xs font-medium active:scale-95 whitespace-nowrap",
      },
    {
      label:
        activeView === "purchase-orders"
          ? "Save P.O."
          : documentType === "quote"
            ? "Save Quote"
            : "Save Invoice",
      icon: Save,
      onClick:
        activeView === "purchase-orders" ? handleSavePO : handleSaveJobCard,
      className:
        "flex items-center gap-1.5 px-3 py-2 bg-[#2563eb] text-white rounded-md text-xs font-medium active:scale-95 whitespace-nowrap",
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

  // ── Step definitions ──────────────────────────────────────────────────────
  const steps =
    documentType === "jobcard"
      ? [
          { number: 1, title: "Invoice To", icon: Users },
          { number: 2, title: "Bill To", icon: FileText },
          { number: 3, title: "Vehicle", icon: Car },
          { number: 4, title: "Workshop", icon: Wrench },
          { number: 5, title: "Services", icon: Package },
          { number: 6, title: "Sign-off", icon: CheckSquare },
        ]
      : activeView === "purchase-orders"
        ? [
            { number: 1, title: "Supplier", icon: Truck },
            { number: 2, title: "Delivery", icon: MapPin },
            { number: 3, title: "Items", icon: Package },
            { number: 4, title: "Summary", icon: FileText },
          ]
        : [
            { number: 1, title: "Invoice To", icon: Users },
            { number: 2, title: "Bill To", icon: FileText },
            { number: 3, title: "Vehicle", icon: Car },
            { number: 4, title: "Services", icon: Wrench },
            { number: 5, title: "Payment", icon: CreditCard },
          ];
  const totalSteps = steps.length;

  const templateProps = {
    templateId: selectedTemplate,
    loading,
    jobCardNumber,
    customerName,
    billName,
    billEmail,
    billPhone,
    billAddress,
    merchant_code,
    customerCompany: "",
    customerEmail,
    customerPhone,
    customerAddress,
    vehicleReg,
    vehicleMake,
    vehicleModel,
    vehicleYear,
    vehicleVin,
    vehicleMileage,
    preAuth,
    authCode,
    items,
    subtotal,
    vat,
    total,
    merchantCode: merchant_code,
    serviceType: "SERVICE",
    documentType,
    stampText: stampSettings.text,
    stampColor: stampSettings.color,
    showStampDate: stampSettings.showDate,
    showStamp: stampSettings.enabled,
    businessInfo: {
      ...businessInfo,
      logoUrl: logoBase64 || businessInfo.logoUrl,
    },
    stampConfig,
     totalPaid: paymentStatus.totalPaid,
  balanceDue: paymentStatus.balanceDue,
  paymentStatusLabel: paymentStatus.status,
  };
  const jobCardTemplateProps = {
    ...templateProps, // inherit all base template props
    technicianName,
    bayNumber,
    estimatedHours,
    faultDescription,
    diagnosisNotes,
    workPerformed,
    partsChecklist,
    customerApproved,
    sourceQuoteNumber: "",
  };
  const poTemplateProps = {
    templateId: selectedTemplate,
    businessInfo,
    poNumber,
    poDate,
    deliveryDate,
    supplierName,
    supplierContact,
    supplierEmail,
    supplierPhone,
    supplierAddress,
    deliveryName,
    deliveryAddress,
    items: poItems.filter((i) => i.description),
    subtotal: poSubtotal,
    vat: poVat,
    total: poTotal,
    notes,
    paymentTerms,
    shippingMethod,
  };
  // ── Home view ─────────────────────────────────────────────────────────────
  const HomeViewLocal = () => (
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
        {/* Pending payments */}
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

        {/* Quick actions */}
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
                  setActiveView("invoice");
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
                  setActiveView("invoice");
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
                  <ArrowRight
                    className={`w-3 h-3 ${text} opacity-60 group-hover:translate-x-0.5 transition-transform`}
                  />
                </button>
              ),
            )}
          </div>
        </div>
      </div>

      {/* Recent invoices */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#e2e8f0] bg-[#f8fafc]">
          <h3 className="text-sm font-semibold text-[#1e293b]">
            Recent Invoices
          </h3>
          <button
            onClick={() => setShowJobCardsList(true)}
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
                  setActiveView("invoice");
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
                {/* Left — click to load into editor */}
                <div
                  className="flex-1 min-w-0"
                  onClick={() => loadJobCard(invoice)}
                >
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-[#1e293b] truncate">
                      {invoice.jobCardNumber ||
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
                      <Car className="w-3 h-3 flex-shrink-0" />
                      {[
                        invoice.vehicle?.year,
                        invoice.vehicle?.make,
                        invoice.vehicle?.model,
                      ]
                        .filter(Boolean)
                        .join(" ") || "No vehicle"}
                    </span>
                  </div>
                </div>

                {/* Right — amount + view button */}
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

                  {/* View PDF button — only shows if PDF was saved */}
                  {invoice.downloadUrl ? (
                    <div className="flex items-center gap-1.5">
                      {/* View PDF */}
                      <a
                        href={invoice.downloadUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        title="View PDF"
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] hover:bg-[#eff6ff] hover:border-[#bfdbfe] text-[#64748b] hover:text-[#2563eb] transition-all text-xs font-semibold"
                      >
                        <Eye className="w-3 h-3" />
                        {!isMobile && <span>View</span>}
                      </a>

                      {/* Download PDF */}

                      <a
                        href={invoice.downloadUrl}
                        download
                        onClick={(e) => e.stopPropagation()}
                        title="Download PDF"
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] hover:bg-[#f0fdf4] hover:border-[#bbf7d0] text-[#64748b] hover:text-[#059669] transition-all text-xs font-semibold"
                      >
                        <Download className="w-3 h-3" />
                        {!isMobile && <span>Save</span>}
                      </a>
                    </div>
                  ) : (
                    /* No PDF yet — offer to generate one */
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        loadJobCard(invoice);
                        handleSavePDF();
                      }}
                      title="Save as PDF"
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
        {activeView === "purchase-orders" ? (
          <div id="po-printable" style={{ position: "relative" }}>
            <POTemplateRenderer {...poTemplateProps} />
            <StampOverlay
              stampConfig={stampConfig}
              pageNumber={1}
              businessInfo={businessInfo}
            />
          </div>
        ) : (
          <div id="invoice-printable" style={{ position: "relative" }}>
            <TemplateRenderer {...templateProps} />
           <AllPagesStampOverlay
  stampConfig={stampConfig}
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
          >
            <JobCardTemplate
              jobCardNumber={jobCardNumber}
              businessInfo={businessInfo}
              customer={{
                name: customerName,
                email: customerEmail,
                phone: customerPhone,
                address: customerAddress,
              }}
              vehicle={{
                make: vehicleMake,
                model: vehicleModel,
                year: vehicleYear,
                registration: vehicleReg,
                vin: vehicleVin,
                mileage: vehicleMileage,
              }}
              technicianName={technicianName}
              bayNumber={bayNumber}
              estimatedHours={estimatedHours}
              faultDescription={faultDescription}
              diagnosisNotes={diagnosisNotes}
              workPerformed={workPerformed}
              items={items}
              partsChecklist={partsChecklist}
              customerApproved={customerApproved}
              subtotal={subtotal}
              vat={vat}
              total={total}
              logoBase64={logoBase64}
              sourceQuoteNumber={""}
            />
            
          </div>
        )}
      </div>
      {showAIWindow && (
        <AIInvoiceWindow
          user={user}
          businessInfo={businessInfo}
          documentType={documentType}
          onExit={() => setShowAIWindow(false)}
          onNavigateTo={(view) => {
            setAiWindowOpen(false);
            setActiveView(view);
          }}
          industry="mechanics"
          TemplateRenderer={TemplateRenderer}
        />
      )}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Sidebar */}
        <MechanicsSidebar
          navigate={navigate}
          user={user}
          activeView={activeView}
          setActiveView={setActiveView}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          showSettings={showSettings}
          setShowSettings={setShowSettings}
          handleNewInvoice={() => {
            handleNewInvoice();
            setActiveView("invoice");
          }}
          handleNewQuote={() => {
            handleNewQuote();
            setActiveView("invoice");
          }}
          handleNewJobCard={() => {
            handleNewInvoice();
            setActiveView("invoice");
          }}
          businessInfo={businessInfo}
          savedJobCards={savedJobCards}
          savedCustomers={savedCustomers}
          documentType={documentType}
          showJobCardsList={showJobCardsList}
          setShowJobCardsList={setShowJobCardsList}
          showCustomersListModal={showCustomersListModal}
          setShowCustomersListModal={setShowCustomersListModal}
          handleAddNewCustomer={handleAddNewCustomer}
          handleLogout={handleLogout}
          isMobile={isMobile}
          logo={logo}
          newRequestCount={0}
          isAdmin={isAdmin}
        />

        {/* Main content */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          <AppHeader
            actions={headerActions}
            mobileActions={mobileDashboardActions}
            onSettingsOpen={() => setShowSettings(true)}
            onTeamOpen={() => setShowUserManagement(true)}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            showConvertButton={
              documentType === "quote" &&
              !!jobCardId &&
              activeView === "invoice"
            }
            onConvert={handleConvertToInvoice}
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
          {showUserManagement && (
            <SubUserManagement onClose={() => setShowUserManagement(false)} />
          )}
          {showPaymentModal && selectedInvoiceForPayment && (
            <PaymentProcessor
              showModal={showPaymentModal}
              setShowModal={setShowPaymentModal}
              invoice={selectedInvoiceForPayment}
              onPaymentComplete={handlePaymentComplete}
              user={user}
              businessInfo={businessInfo}
            />
          )}
          {showStampModal && (
            <StampSignatureModal
              isOpen={showStampModal}
              onClose={() => setShowStampModal(false)}
              onConfirm={handleStampConfirm}
              previewContent={
                activeView === "purchase-orders" ? (
                  <POTemplateRenderer {...poTemplateProps} />
                ) : (
                  <TemplateRenderer {...templateProps} />
                )
              }
              businessInfo={businessInfo}
              existingConfig={stampConfig}
            />
          )}
          {/* All job cards modal */}
          {showJobCardsList && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden border border-[#e2e8f0]">
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0] bg-[#f8fafc]">
                  <div>
                    <h2 className="text-base font-semibold text-[#1e293b]">
                      All {documentType === "quote" ? "Quotes" : "Invoices"}
                    </h2>
                    <p className="text-xs text-[#64748b] mt-0.5">
                      {savedJobCards.length} records
                    </p>
                  </div>
                  <button
                    onClick={() => setShowJobCardsList(false)}
                    className="p-1.5 text-[#64748b] hover:text-[#1e293b] hover:bg-[#e2e8f0] rounded-lg transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {savedJobCards.length === 0 ? (
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
                            "Vehicle",
                            "Total",
                            "Paid",
                            "Status",
                            "PDF",
                            "Delete",
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
                        {savedJobCards.map((card) => (
                          <tr
                            key={card.id}
                            onClick={() => {
                              loadJobCard(card);
                              setShowJobCardsList(false);
                            }}
                            className="border-b border-[#f1f5f9] hover:bg-[#f8fafc] cursor-pointer transition-colors"
                          >
                            <td className="px-5 py-3 text-sm font-semibold text-[#2563eb]">
                              {card.jobCardNumber || "N/A"}
                            </td>
                            <td className="px-5 py-3 text-sm text-[#374151]">
                              {card.customer?.name || "N/A"}
                            </td>
                            <td className="px-5 py-3 text-sm text-[#374151]">
                              {[
                                card.vehicle?.year,
                                card.vehicle?.make,
                                card.vehicle?.model,
                              ]
                                .filter(Boolean)
                                .join(" ") || "N/A"}
                            </td>
                            <td className="px-5 py-3 text-sm font-semibold text-[#1e293b]">
                              {formatCurrency(card.totals?.total || 0)}
                            </td>
                            <td className="px-5 py-3 text-sm text-[#059669] font-medium">
                              {formatCurrency(card.totals?.paid || 0)}
                            </td>
                            <td
                              className="px-5 py-3"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {card.documentType === "quote" && (
                                <button
                                  onClick={() => {
                                    loadJobCard(card);
                                    setDocumentType("jobcard"); // switch type
                                    setActiveView("invoice"); // reuse the form
                                  }}
                                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#fed7aa] bg-[#fff7ed] text-[#ea580c] hover:bg-[#ffedd5] text-xs font-semibold transition-all"
                                >
                                  <ClipboardList className="w-3 h-3" />
                                  Job Card
                                </button>
                              )}
                            </td>
                            <td className="px-5 py-3">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${statusBadge(card.status)}`}
                              >
                                {card.status === "partially_paid"
                                  ? "Partial"
                                  : card.status || "Pending"}
                              </span>
                            </td>
                            <td
                              className="px-5 py-3"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {card.downloadUrl ? (
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setPdfViewer({
                                        url: card.downloadUrl,
                                        fileName:
                                          (card.jobCardNumber || card.id) +
                                          ".pdf",
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
                                        card.downloadUrl,
                                        (card.jobCardNumber || card.id) +
                                          ".pdf",
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
                                    loadJobCard(card);
                                    setShowJobCardsList(false);
                                    handleSavePDF();
                                  }}
                                  title="Generate PDF"
                                  className="flex items-center gap-1 px-2 py-1.5 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] hover:bg-[#f0fdf4] hover:border-[#bbf7d0] text-[#94a3b8] hover:text-[#059669] transition-all text-xs font-semibold"
                                >
                                  <Download className="w-3 h-3" />
                                  PDF
                                </button>
                              )}
                            </td>
                            <td
                              className="px-5 py-3"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={(e) => handleDeleteJobCard(e, card.id)}
                                title="Delete"
                                className="flex items-center gap-1 px-2 py-1.5 rounded-lg border border-[#fee2e2] bg-[#fef2f2] hover:bg-[#fee2e2] text-[#dc2626] transition-all text-xs font-semibold"
                              >
                                <Trash2 className="w-3 h-3" />
                                Delete
                              </button>
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

          {/* ── Invoice Preview Modal (fullscreen, for header Preview button) ── */}
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
                    style={{
                      position: "relative",
                      width: "210mm",
                      minHeight: "297mm",
                    }}
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
          {showStampPaywall && (
  <StampPaywallModal
    isOpen={showStampPaywall}
    onClose={() => setShowStampPaywall(false)}
    onUnlock={handleUnlockStamp}
    price="R99"
    title="You've used all 5 free stamps"
    subtitle="Unlock unlimited stamping to keep going."
  />
)}
          {/* ── Views ──────────────────────────────────────────────────────── */}
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
          {activeView === "financial-overview" && (
            <div className="flex-1 overflow-y-auto p-4">
              <FinancialOverview user={user} />
            </div>
          )}
          {activeView === "parts-inventory" && (
            <div className="flex-1 overflow-y-auto p-4">
              <PartsInventory user={user} />
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
          {activeView === "vehicles" && (
            <div className="flex-1 overflow-y-auto p-4">
              <Vehicles user={user} />
            </div>
          )}
          {activeView === "templates" && (
            <div className="flex-1 overflow-y-auto p-4">
              <Templates user={user} />
            </div>
          )}
          {activeView === "letterheads" && <LetterheadEditor user={user} />}
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
          {activeView === "reports" && (
            <div className="flex-1 overflow-y-auto p-4">
              <ReportsView user={user} />
            </div>
          )}
          {/* ── Invoice / Job Card Builder — split layout ──────────────────── */}
          {(activeView === "invoice" || activeView === "purchase-orders") && (
            <div className="flex-1 overflow-hidden flex min-h-0">
              {/* ── LEFT: Form panel ───────────────────────────────────────── */}
              <div className={`flex-1 overflow-y-auto px-4 sm:px-6 pt-6 min-w-0 ${mobileNavPad}`}>
                <div className="space-y-5">
                  {/* Summary stat cards */}
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      {
                        label: "Total Amount",
                        value: `R${total.toFixed(2)}`,
                        icon: Receipt,
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
                  {jobCardId && (
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
                            ? "Invoice Fully Paid"
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

                  {/* Main card */}
                  <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
                    {/* Input mode tabs */}
                    <div className="flex border-b border-[#e2e8f0] bg-[#f8fafc]">
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
                        <div
                          onInput={() => setIsDirty(true)}
                          onChange={() => setIsDirty(true)}
                        >
                          {activeView === "purchase-orders" ? (
                            <>
                              {/* PO Step 1 – Supplier */}
                              {currentStep === 1 && (
                                <div>
                                  <div className="flex items-center gap-3 mb-5">
                                    <div className="w-9 h-9 bg-[#eff6ff] rounded-lg flex items-center justify-center">
                                      <Truck className="w-5 h-5 text-[#2563eb]" />
                                    </div>
                                    <div>
                                      <h2 className="text-base font-semibold text-[#1e293b]">
                                        Supplier Details
                                      </h2>
                                      <p className="text-xs text-[#64748b]">
                                        Vendor information for this purchase
                                        order
                                      </p>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {[
                                      {
                                        label: "Supplier Name",
                                        value: supplierName,
                                        set: setSupplierName,
                                        placeholder: "ABC Parts Supplier",
                                        required: true,
                                      },
                                      {
                                        label: "Contact Person",
                                        value: supplierContact,
                                        set: setSupplierContact,
                                        placeholder: "John Doe",
                                      },
                                      {
                                        label: "Email",
                                        value: supplierEmail,
                                        set: setSupplierEmail,
                                        placeholder: "supplier@example.com",
                                        type: "email",
                                      },
                                      {
                                        label: "Phone",
                                        value: supplierPhone,
                                        set: setSupplierPhone,
                                        placeholder: "011 123 4567",
                                        type: "tel",
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
                                            onChange={(e) =>
                                              set(e.target.value)
                                            }
                                            placeholder={placeholder}
                                            className={inputCls}
                                          />
                                        </div>
                                      ),
                                    )}
                                    <div className="col-span-1 sm:col-span-2">
                                      <label className={labelCls}>
                                        Supplier Address
                                      </label>
                                      <input
                                        type="text"
                                        value={supplierAddress}
                                        onChange={(e) =>
                                          setSupplierAddress(e.target.value)
                                        }
                                        placeholder="Street address, City, Postal Code"
                                        className={inputCls}
                                      />
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* PO Step 2 – Delivery */}
                              {currentStep === 2 && (
                                <div>
                                  <div className="flex items-center gap-3 mb-5">
                                    <div className="w-9 h-9 bg-[#f0fdf4] rounded-lg flex items-center justify-center">
                                      <MapPin className="w-5 h-5 text-[#059669]" />
                                    </div>
                                    <div>
                                      <h2 className="text-base font-semibold text-[#1e293b]">
                                        Delivery Details
                                      </h2>
                                      <p className="text-xs text-[#64748b]">
                                        Where and when to deliver
                                      </p>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {[
                                      {
                                        label: "Deliver To (Name)",
                                        value: deliveryName,
                                        set: setDeliveryName,
                                        placeholder: "Workshop / Company name",
                                      },
                                      {
                                        label: "P.O. Number",
                                        value: poNumber,
                                        set: setPoNumber,
                                        placeholder: "PO-2026-0001",
                                        required: true,
                                      },
                                      {
                                        label: "P.O. Date",
                                        value: poDate,
                                        set: setPoDate,
                                        placeholder: "DD/MM/YYYY",
                                        type: "date",
                                      },
                                      {
                                        label: "Delivery Date",
                                        value: deliveryDate,
                                        set: setDeliveryDate,
                                        placeholder: "DD/MM/YYYY",
                                        type: "date",
                                      },
                                      {
                                        label: "Payment Terms",
                                        value: paymentTerms,
                                        set: setPaymentTerms,
                                        placeholder: "30 Days",
                                      },
                                      {
                                        label: "Shipping Method",
                                        value: shippingMethod,
                                        set: setShippingMethod,
                                        placeholder: "Courier / Collection",
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
                                            onChange={(e) =>
                                              set(e.target.value)
                                            }
                                            placeholder={placeholder}
                                            className={inputCls}
                                          />
                                        </div>
                                      ),
                                    )}
                                    <div className="col-span-1 sm:col-span-2">
                                      <label className={labelCls}>
                                        Delivery Address
                                      </label>
                                      <input
                                        type="text"
                                        value={deliveryAddress}
                                        onChange={(e) =>
                                          setDeliveryAddress(e.target.value)
                                        }
                                        placeholder="Delivery address"
                                        className={inputCls}
                                      />
                                    </div>
                                  </div>
                                  <div className="mt-4 p-3.5 bg-[#eff6ff] border border-[#bfdbfe] rounded-lg">
                                    <button
                                      onClick={() => {
                                        setDeliveryName(
                                          businessInfo.businessName,
                                        );
                                        setDeliveryAddress(
                                          businessInfo.addressLine1,
                                        );
                                      }}
                                      className="flex items-center gap-2 text-[#2563eb] hover:text-[#1d4ed8] text-sm font-medium transition-colors"
                                    >
                                      <Building2 className="w-4 h-4" />
                                      Use My Business Address
                                    </button>
                                  </div>
                                </div>
                              )}

                              {/* PO Step 3 – Items */}
                              {currentStep === 3 && (
                                <div>
                                  <div className="flex items-center gap-3 mb-5">
                                    <div className="w-9 h-9 bg-[#f8fafc] rounded-lg flex items-center justify-center">
                                      <Package className="w-5 h-5 text-[#475569]" />
                                    </div>
                                    <div>
                                      <h2 className="text-base font-semibold text-[#1e293b]">
                                        Order Items
                                      </h2>
                                      <p className="text-xs text-[#64748b]">
                                        Add parts and items to order
                                      </p>
                                    </div>
                                  </div>

                                  {/* Add PO item form */}
                                  <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-5 mb-5">
                                    <h3 className="text-sm font-semibold text-[#374151] mb-4 flex items-center gap-2">
                                      <Plus className="w-4 h-4 text-[#2563eb]" />{" "}
                                      Add Item
                                    </h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                                      <div className="sm:col-span-2">
                                        <label className={labelCls}>
                                          Description
                                        </label>
                                        <input
                                          type="text"
                                          placeholder="Part / item name"
                                          value={newPoItem.description}
                                          onChange={(e) =>
                                            setNewPoItem({
                                              ...newPoItem,
                                              description: e.target.value,
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
                                          value={newPoItem.qty}
                                          onChange={(e) =>
                                            setNewPoItem({
                                              ...newPoItem,
                                              qty: e.target.value,
                                            })
                                          }
                                          className={inputCls}
                                        />
                                      </div>
                                      <div>
                                        <label className={labelCls}>Unit</label>
                                        <select
                                          value={newPoItem.unit}
                                          onChange={(e) =>
                                            setNewPoItem({
                                              ...newPoItem,
                                              unit: e.target.value,
                                            })
                                          }
                                          className={selectCls}
                                        >
                                          <option value="ea">ea</option>
                                          <option value="set">set</option>
                                          <option value="ltr">ltr</option>
                                          <option value="kg">kg</option>
                                          <option value="m">m</option>
                                        </select>
                                      </div>
                                      <div>
                                        <label className={labelCls}>
                                          Unit Price
                                        </label>
                                        <input
                                          type="number"
                                          placeholder="0.00"
                                          value={newPoItem.unitPrice}
                                          onChange={(e) =>
                                            setNewPoItem({
                                              ...newPoItem,
                                              unitPrice: e.target.value,
                                            })
                                          }
                                          className={inputCls}
                                        />
                                      </div>
                                    </div>
                                    <button
                                      onClick={handleAddPoItem}
                                      className="mt-3 flex items-center gap-1.5 px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium rounded-md transition-colors"
                                    >
                                      <Plus className="w-4 h-4" /> Add Item
                                    </button>
                                  </div>

                                  {/* PO items table */}
                                  {poItems.filter((i) => i.description).length >
                                  0 ? (
                                    <div className="border border-[#e2e8f0] rounded-xl overflow-hidden mb-5">
                                      <div className="px-4 py-3 bg-[#f8fafc] border-b border-[#e2e8f0] flex items-center justify-between">
                                        <span className="text-sm font-semibold text-[#374151]">
                                          Order Items
                                        </span>
                                        <span className="text-xs text-[#64748b] bg-[#e2e8f0] px-2 py-0.5 rounded-full">
                                          {
                                            poItems.filter((i) => i.description)
                                              .length
                                          }{" "}
                                          items
                                        </span>
                                      </div>
                                      <div className="overflow-x-auto">
                                        <table className="w-full">
                                          <thead>
                                            <tr className="border-b border-[#e2e8f0]">
                                              {[
                                                "Description",
                                                "Qty",
                                                "Unit",
                                                "Unit Price",
                                                "Amount",
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
                                                {/* Type */}
                                                <td className="px-4 py-2">
                                                  <select
                                                    value={item.type}
                                                    onChange={(e) =>
                                                      handleUpdateItem(
                                                        index,
                                                        "type",
                                                        e.target.value,
                                                      )
                                                    }
                                                    className="text-xs font-semibold rounded px-2 py-1 border border-[#e2e8f0] focus:outline-none focus:ring-1 focus:ring-[#2563eb] cursor-pointer
            bg-[#eff6ff] text-[#1d4ed8]"
                                                    style={{
                                                      background:
                                                        item.type === "Labor"
                                                          ? "#eff6ff"
                                                          : "#f0fdf4",
                                                      color:
                                                        item.type === "Labor"
                                                          ? "#1d4ed8"
                                                          : "#166534",
                                                    }}
                                                  >
                                                    <option value="Labor">
                                                      Labor
                                                    </option>
                                                    <option value="Parts">
                                                      Parts
                                                    </option>
                                                  </select>
                                                </td>

                                                {/* Description */}
                                                <td className="px-4 py-2">
                                                  <input
                                                    type="text"
                                                    value={item.description}
                                                    onChange={(e) =>
                                                      handleUpdateItem(
                                                        index,
                                                        "description",
                                                        e.target.value,
                                                      )
                                                    }
                                                    className="w-full text-sm font-medium text-[#374151] bg-transparent border border-transparent hover:border-[#e2e8f0] focus:border-[#2563eb] focus:outline-none focus:ring-1 focus:ring-[#2563eb] rounded px-2 py-1 transition-colors min-w-[140px]"
                                                  />
                                                </td>

                                                {/* Rate */}
                                                <td className="px-4 py-2">
                                                  <div className="flex items-center gap-0.5">
                                                    <span className="text-xs text-[#94a3b8]">
                                                      R
                                                    </span>
                                                    <input
                                                      type="number"
                                                      value={item.rate}
                                                      onChange={(e) =>
                                                        handleUpdateItem(
                                                          index,
                                                          "rate",
                                                          Number(
                                                            e.target.value,
                                                          ),
                                                        )
                                                      }
                                                      className="w-20 text-sm text-[#374151] bg-transparent border border-transparent hover:border-[#e2e8f0] focus:border-[#2563eb] focus:outline-none focus:ring-1 focus:ring-[#2563eb] rounded px-2 py-1 transition-colors"
                                                      min="0"
                                                      step="0.01"
                                                    />
                                                  </div>
                                                </td>

                                                {/* Qty */}
                                                <td className="px-4 py-2">
                                                  <input
                                                    type="number"
                                                    value={item.qty}
                                                    onChange={(e) =>
                                                      handleUpdateItem(
                                                        index,
                                                        "qty",
                                                        Number(e.target.value),
                                                      )
                                                    }
                                                    className="w-14 text-sm text-[#374151] bg-transparent border border-transparent hover:border-[#e2e8f0] focus:border-[#2563eb] focus:outline-none focus:ring-1 focus:ring-[#2563eb] rounded px-2 py-1 transition-colors"
                                                    min="1"
                                                    step="1"
                                                  />
                                                </td>

                                                {/* Amount — auto-calculated, read-only */}
                                                <td className="px-4 py-3 text-sm font-semibold text-[#1e293b] whitespace-nowrap">
                                                  R
                                                  {(
                                                    Number(item.rate) *
                                                    Number(item.qty)
                                                  ).toFixed(2)}
                                                </td>

                                                {/* Delete */}
                                                <td className="px-4 py-3">
                                                  <button
                                                    onClick={() =>
                                                      handleRemoveItem(index)
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
                                      {/* PO Totals */}
                                      <div className="px-4 py-3 bg-[#f8fafc] border-t border-[#e2e8f0]">
                                        <div className="flex flex-col items-end gap-1 text-sm">
                                          <div className="flex justify-between w-44 text-[#64748b]">
                                            <span>Subtotal</span>
                                            <span className="font-medium text-[#374151]">
                                              R{poSubtotal.toFixed(2)}
                                            </span>
                                          </div>
                                          <div className="flex justify-between w-44 text-[#64748b]">
                                            <span>VAT (15%)</span>
                                            <span className="font-medium text-[#374151]">
                                              R{poVat.toFixed(2)}
                                            </span>
                                          </div>
                                          <div className="flex justify-between w-44 pt-2 border-t border-[#e2e8f0] font-semibold text-[#1e293b]">
                                            <span>Total</span>
                                            <span className="text-[#2563eb]">
                                              R{poTotal.toFixed(2)}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="border-2 border-dashed border-[#e2e8f0] rounded-xl py-12 text-center">
                                      <Package className="w-8 h-8 text-[#cbd5e1] mx-auto mb-3" />
                                      <p className="text-sm font-medium text-[#94a3b8]">
                                        No items added yet
                                      </p>
                                      <p className="text-xs text-[#cbd5e1] mt-1">
                                        Use the form above to add order items
                                      </p>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* PO Step 4 – Summary */}
                              {currentStep === 4 && (
                                <div>
                                  <div className="flex items-center gap-3 mb-5">
                                    <div className="w-9 h-9 bg-[#faf5ff] rounded-lg flex items-center justify-center">
                                      <FileText className="w-5 h-5 text-[#7c3aed]" />
                                    </div>
                                    <div>
                                      <h2 className="text-base font-semibold text-[#1e293b]">
                                        Order Summary
                                      </h2>
                                      <p className="text-xs text-[#64748b]">
                                        Review and add notes
                                      </p>
                                    </div>
                                  </div>

                                  <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden shadow-sm mb-5">
                                    <div className="px-5 py-3.5 border-b border-[#e2e8f0] bg-[#f8fafc]">
                                      <span className="text-sm font-semibold text-[#374151]">
                                        Order Overview
                                      </span>
                                    </div>
                                    <div className="divide-y divide-[#f1f5f9]">
                                      {[
                                        ["P.O. Number", poNumber || "Not set"],
                                        ["Supplier", supplierName || "Not set"],
                                        [
                                          "Delivery Date",
                                          deliveryDate || "TBD",
                                        ],
                                        ["Payment Terms", paymentTerms],
                                        [
                                          "Items",
                                          `${poItems.filter((i) => i.description).length} items`,
                                        ],
                                        [
                                          "Order Total",
                                          `R${poTotal.toFixed(2)}`,
                                        ],
                                      ].map(([k, v]) => (
                                        <div
                                          key={k}
                                          className="flex items-center justify-between px-5 py-3 text-sm"
                                        >
                                          <span className="text-[#64748b]">
                                            {k}
                                          </span>
                                          <span
                                            className={`font-semibold ${k === "Order Total" ? "text-[#2563eb]" : "text-[#1e293b]"}`}
                                          >
                                            {v}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  <div>
                                    <label className={labelCls}>
                                      Notes / Special Instructions
                                    </label>
                                    <textarea
                                      value={notes}
                                      onChange={(e) => setNotes(e.target.value)}
                                      placeholder="Any special delivery instructions or notes..."
                                      rows={4}
                                      className={`${inputCls} resize-none`}
                                    />
                                  </div>
                                </div>
                              )}
                            </>
                          ) : (
                            <>
                              {/* Step 1 – Invoice To */}
                              {currentStep === 1 && (
                                <div>
                                  <div className="flex items-center gap-3 mb-5">
                                    <div className="w-9 h-9 bg-[#eff6ff] rounded-lg flex items-center justify-center">
                                      <Users className="w-5 h-5 text-[#2563eb]" />
                                    </div>
                                    <div>
                                      <h2 className="text-base font-semibold text-[#1e293b]">
                                        Invoice To
                                      </h2>
                                      <p className="text-xs text-[#64748b]">
                                        Client details for this job card
                                      </p>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {[
                                      {
                                        label: "Customer Name",
                                        value: customerName,
                                        set: setCustomerName,
                                        placeholder: "Enter customer name",
                                        required: true,
                                      },
                                      {
                                        label: "Customer ID",
                                        value: merchant_code,
                                        set: setCustomerId,
                                        placeholder: "Customer ID",
                                      },
                                      {
                                        label: "Email",
                                        value: customerEmail,
                                        set: setCustomerEmail,
                                        type: "email",
                                        placeholder: "email@example.com",
                                        required: true,
                                      },
                                      {
                                        label: "Phone",
                                        value: customerPhone,
                                        set: setCustomerPhone,
                                        type: "tel",
                                        placeholder: "082 123 4567",
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
                                            onChange={(e) =>
                                              set(e.target.value)
                                            }
                                            placeholder={placeholder}
                                            className={inputCls}
                                          />
                                        </div>
                                      ),
                                    )}
                                    <div className="col-span-1 sm:col-span-2">
                                      <label className={labelCls}>
                                        Address{" "}
                                        <span className="text-[#dc2626] normal-case tracking-normal font-normal">
                                          *
                                        </span>
                                      </label>
                                      <input
                                        type="text"
                                        value={customerAddress}
                                        onChange={(e) =>
                                          setCustomerAddress(e.target.value)
                                        }
                                        placeholder="Street address, City, Postal Code"
                                        className={inputCls}
                                      />
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Step 2 – Bill To */}
                              {currentStep === 2 && (
                                <div>
                                  <div className="flex items-center gap-3 mb-5">
                                    <div className="w-9 h-9 bg-[#f0fdf4] rounded-lg flex items-center justify-center">
                                      <FileText className="w-5 h-5 text-[#059669]" />
                                    </div>
                                    <div>
                                      <h2 className="text-base font-semibold text-[#1e293b]">
                                        Bill To
                                      </h2>
                                      <p className="text-xs text-[#64748b]">
                                        Billing contact (may differ from client)
                                      </p>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {[
                                      {
                                        label: "Billing Name",
                                        value: billName,
                                        set: setBillName,
                                        placeholder: "Billing contact name",
                                        required: true,
                                      },
                                      {
                                        label: "Email",
                                        value: billEmail,
                                        set: setBillEmail,
                                        placeholder: "billing@example.com",
                                        type: "email",
                                      },
                                      {
                                        label: "Phone",
                                        value: billPhone,
                                        set: setBillPhone,
                                        placeholder: "082 123 4567",
                                        type: "tel",
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
                                            onChange={(e) =>
                                              set(e.target.value)
                                            }
                                            placeholder={placeholder}
                                            className={inputCls}
                                          />
                                        </div>
                                      ),
                                    )}
                                    <div className="col-span-1 sm:col-span-2">
                                      <label className={labelCls}>
                                        Billing Address
                                      </label>
                                      <input
                                        type="text"
                                        value={billAddress}
                                        onChange={(e) =>
                                          setBillAddress(e.target.value)
                                        }
                                        placeholder="Billing address if different"
                                        className={inputCls}
                                      />
                                    </div>
                                  </div>
                                  <div className="mt-4 p-3.5 bg-[#eff6ff] border border-[#bfdbfe] rounded-lg">
                                    <button
                                      onClick={() => {
                                        setBillName(customerName);
                                        setBillEmail(customerEmail);
                                        setBillPhone(customerPhone);
                                        setBillAddress(customerAddress);
                                      }}
                                      className="flex items-center gap-2 text-[#2563eb] hover:text-[#1d4ed8] text-sm font-medium transition-colors"
                                    >
                                      <Users className="w-4 h-4" />
                                      Copy from Client Information
                                    </button>
                                  </div>
                                </div>
                              )}

                              {/* Step 3 – Vehicle */}
                              {currentStep === 3 && (
                                <div>
                                  <div className="flex items-center gap-3 mb-5">
                                    <div className="w-9 h-9 bg-[#f0f9ff] rounded-lg flex items-center justify-center">
                                      <Car className="w-5 h-5 text-[#0284c7]" />
                                    </div>
                                    <div>
                                      <h2 className="text-base font-semibold text-[#1e293b]">
                                        Vehicle Information
                                      </h2>
                                      <p className="text-xs text-[#64748b]">
                                        Enter vehicle details and authorization
                                        codes
                                      </p>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {[
                                      {
                                        label: "Make",
                                        value: vehicleMake,
                                        set: setVehicleMake,
                                        placeholder: "Toyota",
                                        required: true,
                                      },
                                      {
                                        label: "Model",
                                        value: vehicleModel,
                                        set: setVehicleModel,
                                        placeholder: "Hilux",
                                        required: true,
                                      },
                                      {
                                        label: "Year",
                                        value: vehicleYear,
                                        set: setVehicleYear,
                                        placeholder: "2020",
                                        required: true,
                                      },
                                      {
                                        label: "Registration",
                                        value: vehicleReg,
                                        set: setVehicleReg,
                                        placeholder: "ABC 123 GP",
                                        required: true,
                                      },
                                      {
                                        label: "VIN",
                                        value: vehicleVin,
                                        set: setVehicleVin,
                                        placeholder: "1HGBH41JXMN109186",
                                      },
                                      {
                                        label: "Mileage (km)",
                                        value: vehicleMileage,
                                        set: setVehicleMileage,
                                        placeholder: "45000",
                                        required: true,
                                      },
                                      {
                                        label: "Pre Auth",
                                        value: preAuth,
                                        set: setPreAuth,
                                        placeholder: "AUTH123",
                                      },
                                      {
                                        label: "Auth Code",
                                        value: authCode,
                                        set: setAuthCode,
                                        placeholder: "456789",
                                      },
                                    ].map(
                                      ({
                                        label,
                                        value,
                                        set,
                                        placeholder,
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
                                            type="text"
                                            value={value}
                                            onChange={(e) =>
                                              set(e.target.value)
                                            }
                                            placeholder={placeholder}
                                            className={inputCls}
                                          />
                                        </div>
                                      ),
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Step 4 – Services & Parts */}
                              {currentStep === 4 && (
                                <div>
                                  <div className="flex items-center gap-3 mb-5">
                                    <div className="w-9 h-9 bg-[#f8fafc] rounded-lg flex items-center justify-center">
                                      <Wrench className="w-5 h-5 text-[#475569]" />
                                    </div>
                                    <div>
                                      <h2 className="text-base font-semibold text-[#1e293b]">
                                        Services & Parts
                                      </h2>
                                      <p className="text-xs text-[#64748b]">
                                        Add services and parts to the invoice
                                      </p>
                                    </div>
                                  </div>

                                  {/* Add item form */}
                                  <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-5 mb-5">
                                    <h3 className="text-sm font-semibold text-[#374151] mb-4 flex items-center gap-2">
                                      <Plus className="w-4 h-4 text-[#2563eb]" />
                                      Add New Item
                                    </h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                                      <div>
                                        <label className={labelCls}>Type</label>
                                        <select
                                          value={newItem.type}
                                          onChange={(e) =>
                                            setNewItem({
                                              ...newItem,
                                              type: e.target.value,
                                            })
                                          }
                                          className={selectCls}
                                        >
                                          <option value="Labor">Labor</option>
                                          <option value="Parts">Parts</option>
                                        </select>
                                      </div>
                                      <div className="sm:col-span-2">
                                        <label className={labelCls}>
                                          Description
                                        </label>
                                        <input
                                          type="text"
                                          placeholder="Work description"
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
                                        <label className={labelCls}>
                                          Rate (R)
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
                                    </div>
                                    <button
                                      onClick={handleAddItem}
                                      className="mt-3 flex items-center gap-1.5 px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium rounded-md transition-colors"
                                    >
                                      <Plus className="w-4 h-4" />
                                      Add Item
                                    </button>
                                  </div>

                                  {/* Items table */}
                                  {items.length > 0 ? (
                                    <div className="border border-[#e2e8f0] rounded-xl overflow-hidden mb-5">
                                      <div className="px-4 py-3 bg-[#f8fafc] border-b border-[#e2e8f0] flex items-center justify-between">
                                        <span className="text-sm font-semibold text-[#374151]">
                                          Line Items
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
                                                "Type",
                                                "Description",
                                                "Rate",
                                                "Qty",
                                                "Amount",
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
                                                {/* Type */}
                                                <td className="px-4 py-2">
                                                  <select
                                                    value={item.type}
                                                    onChange={(e) =>
                                                      handleUpdateItem(
                                                        index,
                                                        "type",
                                                        e.target.value,
                                                      )
                                                    }
                                                    className="text-xs font-semibold rounded px-2 py-1 border border-[#e2e8f0] focus:outline-none focus:ring-1 focus:ring-[#2563eb] cursor-pointer
            bg-[#eff6ff] text-[#1d4ed8]"
                                                    style={{
                                                      background:
                                                        item.type === "Labor"
                                                          ? "#eff6ff"
                                                          : "#f0fdf4",
                                                      color:
                                                        item.type === "Labor"
                                                          ? "#1d4ed8"
                                                          : "#166534",
                                                    }}
                                                  >
                                                    <option value="Labor">
                                                      Labor
                                                    </option>
                                                    <option value="Parts">
                                                      Parts
                                                    </option>
                                                  </select>
                                                </td>

                                                {/* Description */}
                                                <td className="px-4 py-2">
                                                  <input
                                                    type="text"
                                                    value={item.description}
                                                    onChange={(e) =>
                                                      handleUpdateItem(
                                                        index,
                                                        "description",
                                                        e.target.value,
                                                      )
                                                    }
                                                    className="w-full text-sm font-medium text-[#374151] bg-transparent border border-transparent hover:border-[#e2e8f0] focus:border-[#2563eb] focus:outline-none focus:ring-1 focus:ring-[#2563eb] rounded px-2 py-1 transition-colors min-w-[140px]"
                                                  />
                                                </td>

                                                {/* Rate */}
                                                <td className="px-4 py-2">
                                                  <div className="flex items-center gap-0.5">
                                                    <span className="text-xs text-[#94a3b8]">
                                                      R
                                                    </span>
                                                    <input
                                                      type="number"
                                                      value={item.rate}
                                                      onChange={(e) =>
                                                        handleUpdateItem(
                                                          index,
                                                          "rate",
                                                          Number(
                                                            e.target.value,
                                                          ),
                                                        )
                                                      }
                                                      className="w-20 text-sm text-[#374151] bg-transparent border border-transparent hover:border-[#e2e8f0] focus:border-[#2563eb] focus:outline-none focus:ring-1 focus:ring-[#2563eb] rounded px-2 py-1 transition-colors"
                                                      min="0"
                                                      step="0.01"
                                                    />
                                                  </div>
                                                </td>

                                                {/* Qty */}
                                                <td className="px-4 py-2">
                                                  <input
                                                    type="number"
                                                    value={item.qty}
                                                    onChange={(e) =>
                                                      handleUpdateItem(
                                                        index,
                                                        "qty",
                                                        Number(e.target.value),
                                                      )
                                                    }
                                                    className="w-14 text-sm text-[#374151] bg-transparent border border-transparent hover:border-[#e2e8f0] focus:border-[#2563eb] focus:outline-none focus:ring-1 focus:ring-[#2563eb] rounded px-2 py-1 transition-colors"
                                                    min="1"
                                                    step="1"
                                                  />
                                                </td>

                                                {/* Amount — auto-calculated, read-only */}
                                                <td className="px-4 py-3 text-sm font-semibold text-[#1e293b] whitespace-nowrap">
                                                  R
                                                  {(
                                                    Number(item.rate) *
                                                    Number(item.qty)
                                                  ).toFixed(2)}
                                                </td>

                                                {/* Delete */}
                                                <td className="px-4 py-3">
                                                  <button
                                                    onClick={() =>
                                                      handleRemoveItem(index)
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
                                      {/* Totals footer */}
                                      {/* Totals footer */}
                                      <div className="px-4 py-3 bg-[#f8fafc] border-t border-[#e2e8f0]">
                                        <div className="flex flex-col items-end gap-1 text-sm">
                                          <div className="flex justify-between w-52 text-[#64748b]">
                                            <span>Subtotal</span>
                                            <span className="font-medium text-[#374151]">
                                              R{subtotal.toFixed(2)}
                                            </span>
                                          </div>
                                          <div className="flex items-center justify-between w-52 text-[#64748b]">
                                            <label className="flex items-center gap-1.5">
                                              <span>VAT</span>
                                              <div className="flex items-center border border-[#d1d5db] rounded-md overflow-hidden bg-white">
                                                <input
                                                  type="number"
                                                  min="0"
                                                  max="100"
                                                  step="0.5"
                                                  value={vatRate}
                                                  onChange={(e) =>
                                                    setVatRate(
                                                      Number(e.target.value),
                                                    )
                                                  }
                                                  className="w-12 px-1.5 py-0.5 text-xs text-center text-[#1e293b] focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
                                                />
                                                <span className="px-1.5 text-xs text-[#64748b] bg-[#f1f5f9] border-l border-[#d1d5db]">
                                                  %
                                                </span>
                                              </div>
                                            </label>
                                            <span className="font-medium text-[#374151]">
                                              R{vat.toFixed(2)}
                                            </span>
                                          </div>
                                          <div className="flex justify-between w-52 pt-2 border-t border-[#e2e8f0] font-semibold text-[#1e293b]">
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
                                        No items added yet
                                      </p>
                                      <p className="text-xs text-[#cbd5e1] mt-1">
                                        Use the form above to add services or
                                        parts
                                      </p>
                                    </div>
                                  )}
                                </div>
                              )}
                              {currentStep === 5 &&
                                documentType === "jobcard" && (
                                  <div>
                                    <div className="flex items-center gap-3 mb-5">
                                      <div className="w-9 h-9 bg-[#f0fdf4] rounded-lg flex items-center justify-center">
                                        <CheckSquare className="w-5 h-5 text-[#059669]" />
                                      </div>
                                      <div>
                                        <h2 className="text-base font-semibold text-[#1e293b]">
                                          Customer Sign-off
                                        </h2>
                                        <p className="text-xs text-[#64748b]">
                                          Confirm work authorisation and
                                          completion
                                        </p>
                                      </div>
                                    </div>

                                    {/* Parts checklist — auto-generated from line items */}
                                    <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4 mb-5">
                                      <p className="text-sm font-semibold text-[#374151] mb-3">
                                        Parts & Services Checklist
                                      </p>
                                      {items.map((item, i) => (
                                        <label
                                          key={i}
                                          className="flex items-center gap-3 py-2 border-b border-[#f1f5f9] cursor-pointer"
                                        >
                                          <input
                                            type="checkbox"
                                            checked={partsChecklist[i] ?? false}
                                            onChange={(e) => {
                                              const updated = [
                                                ...partsChecklist,
                                              ];
                                              updated[i] = e.target.checked;
                                              setPartsChecklist(updated);
                                            }}
                                            className="w-4 h-4 accent-[#059669]"
                                          />
                                          <span className="text-sm text-[#374151] flex-1">
                                            {item.description}
                                          </span>
                                          <span className="text-xs text-[#64748b]">
                                            {item.type} — R
                                            {item.amount?.toFixed(2)}
                                          </span>
                                        </label>
                                      ))}
                                    </div>

                                    {/* Approval toggle */}
                                    <div
                                      className={`flex items-center justify-between p-4 rounded-xl border ${
                                        customerApproved
                                          ? "bg-[#f0fdf4] border-[#bbf7d0]"
                                          : "bg-[#fff7ed] border-[#fed7aa]"
                                      }`}
                                    >
                                      <div>
                                        <p className="text-sm font-semibold text-[#1e293b]">
                                          Customer Authorisation
                                        </p>
                                        <p className="text-xs text-[#64748b] mt-0.5">
                                          {customerApproved
                                            ? "Customer has approved all work"
                                            : "Pending customer approval"}
                                        </p>
                                      </div>
                                      <button
                                        onClick={() =>
                                          setCustomerApproved((p) => !p)
                                        }
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                          customerApproved
                                            ? "bg-[#059669] text-white hover:bg-[#047857]"
                                            : "bg-white border border-[#e2e8f0] text-[#374151] hover:bg-[#f8fafc]"
                                        }`}
                                      >
                                        {customerApproved
                                          ? "✓ Approved"
                                          : "Mark Approved"}
                                      </button>
                                    </div>
                                  </div>
                                )}
                              {/* Step 5 – Payment */}
                              {currentStep === 6 && (
                                <div>
                                  <div className="flex items-center gap-3 mb-5">
                                    <div className="w-9 h-9 bg-[#faf5ff] rounded-lg flex items-center justify-center">
                                      <CreditCard className="w-5 h-5 text-[#7c3aed]" />
                                    </div>
                                    <div>
                                      <h2 className="text-base font-semibold text-[#1e293b]">
                                        Payment Terms
                                      </h2>
                                      <p className="text-xs text-[#64748b]">
                                        Review and process payment
                                      </p>
                                    </div>
                                  </div>

                                  <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden shadow-sm mb-5">
                                    <div className="px-5 py-3.5 border-b border-[#e2e8f0] bg-[#f8fafc]">
                                      <span className="text-sm font-semibold text-[#374151]">
                                        Payment Information
                                      </span>
                                    </div>
                                    <div className="divide-y divide-[#f1f5f9]">
                                      {[
                                        ["Payment Method", "Cash / Card / EFT"],
                                        ["Payment Terms", "Due on Completion"],
                                        ["Warranty", "90 Days Parts & Labor"],
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

                                  {jobCardId && (
                                    <button
                                      onClick={handleProcessPayment}
                                      className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-[#059669] hover:bg-[#047857] text-white rounded-xl font-medium transition-colors shadow-sm"
                                    >
                                      <CreditCard className="w-4 h-4" />
                                      Process Payment
                                    </button>
                                  )}

                                  {!jobCardId && (
                                    <div className="flex items-center gap-2 px-4 py-3 bg-[#fff7ed] border border-[#fed7aa] rounded-lg text-sm text-[#9a3412]">
                                      <Receipt className="w-4 h-4 flex-shrink-0" />
                                      Save the invoice first to process payment
                                    </div>
                                  )}
                                </div>
                              )}
                            </>
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
                            <button onClick={handleNext} className="...">
                              <span className="hidden sm:inline">Next</span>
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={
                                activeView === "purchase-orders"
                                  ? handleSavePO
                                  : handleSaveJobCard
                              }
                              className="flex items-center gap-1.5 px-4 py-2 bg-[#059669] hover:bg-[#047857] text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                            >
                              <Save className="w-4 h-4" />
                              {activeView === "purchase-orders"
                                ? "Save P.O."
                                : documentType === "quote"
                                  ? "Save Quote"
                                  : "Save Invoice"}
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* ── RIGHT: Live preview panel ──────────────────────────────── */}
              <div className="hidden xl:flex w-[380px] flex-shrink-0 flex-col border-l border-[#e2e8f0] bg-[#e8eaed] overflow-hidden">
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
                      disabled={isSavingPDF}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-[#059669] text-white text-xs font-medium rounded-lg hover:bg-[#047857] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Download className="w-3 h-3" />
                      {isSavingPDF ? "Saving..." : "PDF"}
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
                    {documentType === "jobcard" ? (
                      <JobCardTemplate {...jobCardTemplateProps} />
                    ) : activeView === "purchase-orders" ? (
                      <POTemplateRenderer {...poTemplateProps} />
                    ) : (
                      <TemplateRenderer {...templateProps} />
                    )}
                   <AllPagesStampOverlay
  stampConfig={stampConfig}
  businessInfo={businessInfo}
/>
                  </div>
                </div>

                {/* ── Stamp button footer ── */}
                <div className="flex-shrink-0 px-4 py-3 bg-[#f8fafc] border-t border-[#e2e8f0]">
                  <button
  onClick={handleStampButtonClick}
  className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-[#ce1414] hover:bg-[#b01212] text-white text-sm font-medium rounded-lg transition-colors"
>
  <Stamp className="w-4 h-4" />
  Stamp &amp; Signature
  {!stampUnlocked && (
    <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded text-[10px] font-semibold">
      {stampUsageCount < FREE_STAMP_LIMIT
        ? `${FREE_STAMP_LIMIT - stampUsageCount} free left`
        : "PRO"}
    </span>
  )}
</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
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
            {/* Header */}
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
                  <Eye
                    className="w-3.5 h-3.5"
                    style={{ color: "#fff", width: 14, height: 14 }}
                  />
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
                {/* Download from viewer */}
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
                  <Download style={{ width: 13, height: 13 }} />
                  Download
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

            {/* PDF iframe canvas */}
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
      <SolidFloAgent industry="mechanics" />
    </div>
  );
};

export default MechanicsDashboard;
