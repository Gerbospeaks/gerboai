import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import HomeView from "../HomeView";
import { serverTimestamp } from "firebase/firestore";
import logo from "../../assets/img/solidflo-logo.png";
import { getAuth, signOut } from "firebase/auth";
import FinancialOverview from "../FinancialOverview";
import Templates from "./Templates";
import AIInvoiceExtractor from "../AIInvoiceExtractor";
import TemplateSelector, { TemplateRenderer } from "./TemplateSelector";
import SignatureStamp from "../SignatureStamp";
import LegalMultiStepForm from "./LegalMultiStepForm";
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
import uploadLogoToR2 from "../../utils/uploadLogoToR2";
import CustomersListModal from "../CustomersListModal";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Home,
  Settings,
  Users,
  Sparkles,
  Calendar,
  FileText,
  Briefcase,
  DollarSign,
  Save,
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
  Scale,
  Gavel,
  BookOpen,
  FolderOpen,
  Upload,
  Building,
  UserCheck,
} from "lucide-react";

const generateInvoiceNumber = async (userId, documentType) => {
  const db = getFirestore();
  const year = new Date().getFullYear();

  const collectionName = documentType === "estimate" ? "estimates" : "invoices";
  const prefix = documentType === "estimate" ? "EST" : "INV";

  const invoicesRef = collection(db, "users", userId, collectionName);
  const q = query(invoicesRef, orderBy("createdAt", "desc"), limit(1));
  const snapshot = await getDocs(q);

  let lastNumber = 1000;

  if (!snapshot.empty) {
    const lastInvoice = snapshot.docs[0].data();
    const match = lastInvoice.invoiceNumber?.match(/(\d+)$/);

    if (match) {
      lastNumber = Number(match[1]);
    }
  }

  const nextNumber = lastNumber + 1;
  return `${prefix}-${year}-${String(nextNumber).padStart(4, "0")}`;
};

const LegalDashboard = () => {
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
  const [activeView, setActiveView] = useState("home");
  const [showCustomersList, setShowCustomersList] = useState(false);
  const [savedCustomers, setSavedCustomers] = useState([]);
  const [showCustomersListModal, setShowCustomersListModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] =
    useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState("classic");
  const [selectedTemplate, setSelectedTemplate] = useState("professional");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isInvoicingOpen, setIsInvoicingOpen] = useState(false);
  const [isClientsOpen, setIsClientsOpen] = useState(false);
  const [stampSettings, setStampSettings] = useState({
    text: "APPROVED",
    color: "#d32f2f",
    showDate: false,
    enabled: false,
  });
  useEffect(() => {
    if (!user?.uid) return;

    const loadInvoiceNumber = async () => {
      const nextInvoice = await generateInvoiceNumber(user.uid);
      setInvoiceNumber(nextInvoice);
    };

    loadInvoiceNumber();
    loadSavedInvoices();
  }, [user]);

  const loadCustomers = async () => {
    try {
      const q = query(
        collection(db, "users", user.uid, "clients"),
        orderBy("createdAt", "desc"),
      );
      const querySnapshot = await getDocs(q);
      const customersData = [];

      querySnapshot.forEach((doc) => {
        customersData.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      setCustomers(customersData);
    } catch (error) {
      console.error("Error loading clients:", error);
    }
  };

  const handleProcessPayment = async () => {
    if (!invoiceId || !user?.uid) {
      alert("Please save the invoice before processing payment");
      return;
    }

    try {
      const collectionName =
        documentType === "estimate" ? "estimates" : "invoices";
      const invoiceDoc = await getDoc(
        doc(db, "users", user.uid, collectionName, invoiceId),
      );

      if (invoiceDoc.exists()) {
        const invoiceData = invoiceDoc.data();
        setSelectedInvoiceForPayment({
          id: invoiceId,
          ...invoiceData,
        });
        setShowPaymentModal(true);
      } else {
        alert("Invoice not found. Please save the invoice first.");
      }
    } catch (error) {
      console.error("Error loading invoice:", error);
      alert("Failed to load invoice for payment");
    }
  };

  const loadPaymentStatus = async () => {
    if (!user?.uid || !invoiceId) {
      setPaymentStatus({
        totalPaid: 0,
        balanceDue: total,
        status: "pending",
      });
      return;
    }

    try {
      const collectionName =
        documentType === "estimate" ? "estimates" : "invoices";
      const invoiceDoc = await getDoc(
        doc(db, "users", user.uid, collectionName, invoiceId),
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
      setPaymentStatus({
        totalPaid: 0,
        balanceDue: total,
        status: "pending",
      });
    }
  };

  const handlePaymentComplete = () => {
    loadSavedInvoices();
    loadPaymentStatus();
    setShowPaymentModal(false);
  };
  const loadSavedInvoices = async () => {
    if (!user?.uid) return;

    const db = getFirestore();
    const invoicesRef = collection(db, "users", user.uid, "invoices");
    const q = query(invoicesRef, orderBy("createdAt", "desc"), limit(50));
    const snapshot = await getDocs(q);

    const invoices = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setSavedInvoices(invoices);
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
    setClientName(customer.name || "");
    setClientEmail(customer.email || "");
    setClientPhone(customer.phone || "");
    setClientAddress(customer.address || "");
    setClientId(customer.customerId || "");
  };

  const handleCustomerSaved = () => {
    loadCustomers();
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadInvoice = (invoice) => {
    setInvoiceId(invoice.id);
    setInvoiceNumber(invoice.invoiceNumber || "");
    setClientName(invoice.client?.name || "");
    setClientEmail(invoice.client?.email || "");
    setClientPhone(invoice.client?.phone || "");
    setClientAddress(invoice.client?.address || "");
    setClientId(invoice.client?.clientId || "");
    setCaseType(invoice.case?.type || "");
    setCaseNumber(invoice.case?.caseNumber || "");
    setMatterDescription(invoice.case?.matterDescription || "");
    setItems(invoice.items || []);
    setShowInvoicesList(false);
  };
  const [paymentStatus, setPaymentStatus] = useState({
    totalPaid: 0,
    balanceDue: 0,
    status: "pending",
  });
  const handleAIDataExtracted = (extractedData) => {
    // Client info
    if (extractedData.client.name) setClientName(extractedData.client.name);
    if (extractedData.client.email) setClientEmail(extractedData.client.email);
    if (extractedData.client.phone) setClientPhone(extractedData.client.phone);
    if (extractedData.client.address)
      setClientAddress(extractedData.client.address);
    if (extractedData.client.clientId)
      setClientId(extractedData.client.clientId);

    // Case info
    if (extractedData.case.type) setCaseType(extractedData.case.type);
    if (extractedData.case.caseNumber)
      setCaseNumber(extractedData.case.caseNumber);
    if (extractedData.case.matterDescription)
      setMatterDescription(extractedData.case.matterDescription);

    // Items
    if (extractedData.items && extractedData.items.length > 0) {
      setItems(extractedData.items);
    }

    alert("✅ Legal invoice data extracted and populated successfully!");
  };
  const loadSavedCustomers = async () => {
    if (!user?.uid) return;

    const db = getFirestore();
    const customersRef = collection(db, "users", user.uid, "clients");
    const q = query(customersRef, orderBy("createdAt", "desc"), limit(50));
    const snapshot = await getDocs(q);

    const customers = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setSavedCustomers(customers.filter((c) => !c._placeholder));
  };

  const handleSaveCustomer = async () => {
    if (!user?.uid) return;

    if (!clientName || !clientEmail) {
      alert("Please enter client name and email");
      return;
    }

    try {
      const db = getFirestore();
      const customerData = {
        name: clientName,
        email: clientEmail,
        phone: clientPhone,
        address: clientAddress,
        customerId: clientId || `CLIENT-${Date.now()}`,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(collection(db, "users", user.uid, "clients"), customerData);
      alert("Client saved successfully!");
      loadSavedCustomers();
    } catch (error) {
      console.error("Error saving client:", error);
      alert("Failed to save client");
    }
  };

  const loadInvoiceForExport = async () => {
    if (!user?.uid || !invoiceId) return null;

    const db = getFirestore();
    const snap = await getDoc(
      doc(db, "users", user.uid, "invoices", invoiceId),
    );

    return snap.exists() ? snap.data() : null;
  };

  const handleSavePDF = async () => {
    const savedInvoice = await loadInvoiceForExport();

    if (!savedInvoice) {
      alert("Please save the invoice before exporting PDF");
      return;
    }

    setInvoiceNumber(savedInvoice.invoiceNumber);
    setItems(savedInvoice.items);
    setClientName(savedInvoice.client.name);
    setClientEmail(savedInvoice.client.email);
    setClientPhone(savedInvoice.client.phone);
    setClientAddress(savedInvoice.client.address);
    setCaseType(savedInvoice.case.type);
    setCaseNumber(savedInvoice.case.caseNumber);
    setMatterDescription(savedInvoice.case.matterDescription);

    setTimeout(() => {
      window.print();
    }, 300);
  };

  const handleAddItem = () => {
    if (!newItem.description || !newItem.hours) return;

    const rate = Number(newItem.rate) || 0;
    const hours = Number(newItem.hours);

    const item = {
      description: newItem.description,
      type: newItem.type || "Legal Services",
      rate,
      hours,
      amount: rate * hours,
    };

    setItems((prev) => [...prev, item]);
    setNewItem({
      description: "",
      rate: "",
      hours: "",
      type: "Legal Services",
    });
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [clientName, setClientName] = useState("John Smith");
  const [clientId, setClientId] = useState("CLIENT-2026-1234");
  const [clientEmail, setClientEmail] = useState("john.smith@example.com");
  const [clientPhone, setClientPhone] = useState("082 123 4567");
  const [clientAddress, setClientAddress] = useState(
    "123 Legal Street, Cape Town, 8001",
  );

  // Case Details
  const [caseType, setCaseType] = useState("Commercial Litigation");
  const [caseNumber, setCaseNumber] = useState("CASE-2026-001");
  const [matterDescription, setMatterDescription] = useState(
    "Contract dispute regarding service agreement",
  );

  const [businessInfo, setBusinessInfo] = useState({
    businessName: "SMITH & ASSOCIATES ATTORNEYS",
    addressLine1: "15 LEGAL AVENUE",
    addressLine2: "CAPE TOWN CBD",
    city: "CAPE TOWN",
    postalCode: "8001",
    primaryPhone: "021 123 4567",
    secondaryPhone: "021 123 4568",
    logoUrl: "",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.uid) {
      loadBusinessInfo();
    }
  }, [user]);

  useEffect(() => {
    const fetchBusinessInfo = async () => {
      if (!user?.uid) return;

      try {
        const db = getFirestore();
        const docRef = doc(db, "users", user.uid, "settings", "businessInfo");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setBusinessInfo(docSnap.data());
        } else {
          console.log("No business info found");
        }
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
        setBusinessInfo(docSnap.data());
      }
    } catch (error) {
      console.error("Error loading business info:", error);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user?.uid || !authUser) return;

    console.log("File type:", file.type);
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

      // ✅ Upload to Cloudflare R2 (Worker handles userId)
      const logoUrl = await uploadLogoToR2(file, authUser);

      setBusinessInfo((prev) => ({
        ...prev,
        logoUrl,
        uploading: false,
      }));

      // Save URL to Firestore
      const db = getFirestore();
      const docRef = doc(db, "users", user.uid, "settings", "businessInfo");

      await setDoc(
        docRef,
        {
          logoUrl,
          updatedAt: new Date().toISOString(),
        },
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
      const docRef = doc(db, "users", user.uid, "settings", "businessInfo");
      await setDoc(docRef, businessInfo);
      alert("Business information saved successfully!");
      setShowSettings(false);
    } catch (error) {
      console.error("Error saving business info:", error);
      alert("Failed to save business information");
    }
  };

  const handlePrint = () => {
    // Add print styles to document
    const styleSheet = document.createElement("style");
    styleSheet.textContent = printStyles;
    document.head.appendChild(styleSheet);

    // Trigger print
    window.print();

    // Clean up (remove after print dialog closes)
    setTimeout(() => {
      document.head.removeChild(styleSheet);
    }, 1000);
  };
  const printStyles = `
  @media print {
    /* Hide everything except the print area */
    body * {
      visibility: hidden !important;
    }
    
    #print-area,
    #print-area * {
      visibility: visible !important;
    }
    
    /* Force print area to display even if hidden */
    #print-area {
      display: block !important;
      position: absolute !important;
      left: 0 !important;
      top: 0 !important;
      width: 210mm !important;
      min-height: 297mm !important;
      margin: 0 !important;
      padding: 10mm !important;
      box-sizing: border-box !important;
      background: white !important;
      box-shadow: none !important;
    }
    
    /* Reset page margins and size */
    @page {
      size: A4 portrait;
      margin: 0;
    }
    
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      width: 210mm !important;
      height: 297mm !important;
      background: white !important;
    }
    
    /* Ensure colors print correctly */
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    
    /* Logo sizing */
    .logo img {
      height: 60px;
      width: auto;
    }
    
    /* Remove any borders or shadows */
    .shadow-lg, .rounded-lg, .shadow-xl, .shadow-2xl {
      border: none !important;
      box-shadow: none !important;
    }
    
    /* Prevent page breaks inside elements */
    table, tr, td, th, div {
      page-break-inside: avoid !important;
    }
    
    /* Ensure tables print correctly */
    table {
      width: 100% !important;
      border-collapse: collapse !important;
    }
  }
`;

  const handleSave = () => {
    window.print();
  };

  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({
    description: "",
    rate: "",
    hours: "",
    type: "Legal Services",
  });

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const vat = subtotal * 0.15;
  const total = subtotal + vat;

  const buildInvoicePayload = (numberToUse) => ({
    invoiceNumber: numberToUse,
    locked: true,
    status: "pending",

    dates: {
      invoiceDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    },

    client: {
      name: clientName,
      email: clientEmail,
      phone: clientPhone,
      address: clientAddress,
      clientId,
    },

    case: {
      type: caseType,
      caseNumber: caseNumber,
      matterDescription: matterDescription,
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
      await updateDoc(doc(db, "users", user.uid, "invoices", invoiceId), {
        ...invoiceData,
        updatedAt: serverTimestamp(),
      });
    } else {
      const ref = await addDoc(
        collection(db, "users", user.uid, "invoices"),
        invoiceData,
      );
      setInvoiceId(ref.id);
    }

    alert("Invoice saved and locked");
    loadSavedInvoices();
  };
  const handleConvertToInvoice = async () => {
    if (!user?.uid) return;

    if (!invoiceId) {
      alert("Please save the estimate first before converting to invoice");
      return;
    }

    if (
      !window.confirm(
        "Convert this estimate to an invoice? This will create a new invoice with the same details.",
      )
    ) {
      return;
    }

    try {
      const db = getFirestore();

      const newInvoiceNumber = await generateInvoiceNumber(user.uid, "invoice");

      const invoiceData = buildInvoicePayload(newInvoiceNumber);
      invoiceData.documentType = "invoice";
      invoiceData.convertedFromEstimate = invoiceId;
      invoiceData.convertedFromEstimateNumber = invoiceNumber;
      invoiceData.convertedAt = serverTimestamp();

      const invoiceRef = await addDoc(
        collection(db, "users", user.uid, "invoices"),
        invoiceData,
      );

      await updateDoc(doc(db, "users", user.uid, "estimates", invoiceId), {
        convertedToInvoice: true,
        convertedToInvoiceId: invoiceRef.id,
        convertedToInvoiceNumber: newInvoiceNumber,
        convertedAt: serverTimestamp(),
        status: "converted",
      });

      setDocumentType("invoice");
      setInvoiceId(invoiceRef.id);
      setInvoiceNumber(newInvoiceNumber);

      alert(`Estimate successfully converted to Invoice ${newInvoiceNumber}`);
      loadSavedInvoices();
    } catch (error) {
      console.error("Error converting estimate to invoice:", error);
      alert("Failed to convert estimate to invoice");
    }
  };
  const handleNewEstimate = () => {
    setDocumentType("estimate");
    handleNewInvoice();
  };

  const handleNewInvoiceDoc = () => {
    setDocumentType("invoice");
    handleNewInvoice();
  };
  const handleNewInvoice = () => {
    setInvoiceId(null);
    setInvoiceNumber("");
    setClientName("John Smith");
    setClientId("CLIENT-2026-1234");
    setClientEmail("john.smith@example.com");
    setClientPhone("082 123 4567");
    setClientAddress("123 Legal Street, Cape Town, 8001");
    setCaseType("Commercial Litigation");
    setCaseNumber("CASE-2026-001");
    setMatterDescription("Contract dispute regarding service agreement");
    setItems([]);

    const loadNewNumber = async () => {
      if (user?.uid) {
        const nextInvoice = await generateInvoiceNumber(user.uid);
        setInvoiceNumber(nextInvoice);
      }
    };
    loadNewNumber();
  };

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      console.log("Logged out successfully");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-gradient-to-br from-amber-50 via-orange-50 to-stone-50 overflow-hidden">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Collapsed Sidebar (Icon Only) */}
      <div
        className={`${
          sidebarOpen ? "hidden" : "hidden md:block"
        } fixed z-40 w-16 md:w-20 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700/50 h-full print:hidden transition-all duration-300 shadow-2xl`}
      >
        <div className="flex flex-col items-center py-4 md:py-6 space-y-4 md:space-y-6">
          {/* Toggle Button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="group p-2 md:p-3 text-slate-400 hover:text-white hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-700 rounded-xl transition-all duration-300 shadow-lg hover:shadow-blue-500/50 hover:scale-110"
            title="Expand Sidebar"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6 group-hover:animate-pulse" />
          </button>

          {/* Logo */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300"></div>
            <div className="relative w-10 h-10 md:w-12 md:h-12 mb-2 md:mb-4  rounded-xl p-1 shadow-lg">
              <img src={logo} alt="" />
            </div>
          </div>

          <div className="w-10 border-t border-slate-600"></div>

          {/* Icon Navigation */}
          <div className="flex flex-col items-center space-y-3 md:space-y-4 w-full px-2 md:px-3">
            <button
              onClick={() => setActiveView("home")} // ADD THIS
              className="group relative p-2 md:p-3 text-cyan-400 hover:text-white rounded-xl transition-all duration-300 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center overflow-hidden"
              title="Home"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-stone-600 to-stone-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Home className="w-5 h-5 md:w-6 md:h-6 relative z-10 group-hover:scale-110 transition-transform duration-300" />
            </button>

            <button
              onClick={() => setShowSettings(true)}
              className="p-2 text-slate-400 hover:text-white hover:bg-blue-600/80 rounded-lg transition-all duration-200 w-10 h-10 flex items-center justify-center group"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>

            <button
              onClick={() => setActiveView("financial-overview")}
              className="p-2 text-slate-400 hover:text-white hover:bg-blue-600/80 rounded-lg transition-all duration-200 w-10 h-10 flex items-center justify-center group"
              title="Practice Overview"
            >
              <TrendingUp className="w-5 h-5" />
            </button>

            <button
              onClick={() => {
                handleNewInvoice();
                setActiveView("invoice");
              }}
              className="p-2 text-slate-400 hover:text-white hover:bg-blue-600/80 rounded-lg transition-all duration-200 w-10 h-10 flex items-center justify-center group"
              title="Cases"
            >
              <FolderOpen className="w-5 h-5" />
            </button>

            <button
              onClick={() => setShowCustomersListModal(true)}
              className="p-2 text-slate-400 hover:text-white hover:bg-blue-600/80 rounded-lg transition-all duration-200 w-10 h-10 flex items-center justify-center group"
              title="Clients"
            >
              <Users className="w-5 h-5" />
            </button>

            <button
              onClick={() => setActiveView("templates")}
              className="p-2 text-slate-400 hover:text-white hover:bg-blue-600/80 rounded-lg transition-all duration-200 w-10 h-10 flex items-center justify-center group"
              title="Invoice Templates"
            >
              <FileText className="w-5 h-5" />
            </button>

            <button
              className="p-2 text-slate-400 hover:text-white hover:bg-blue-600/80 rounded-lg transition-all duration-200 w-10 h-10 flex items-center justify-center group"
              title="Court Dates"
            >
              <Scale className="w-5 h-5" />
            </button>

            <button
              className="p-2 text-slate-400 hover:text-white hover:bg-blue-600/80 rounded-lg transition-all duration-200 w-10 h-10 flex items-center justify-center group"
              title="Legal Research"
            >
              <BookOpen className="w-5 h-5" />
            </button>

            <button
              className="p-2 text-slate-400 hover:text-white hover:bg-blue-600/80 rounded-lg transition-all duration-200 w-10 h-10 flex items-center justify-center group"
              title="Billing"
            >
              <Receipt className="w-5 h-5" />
            </button>

            <button
              className="p-2 text-slate-400 hover:text-white hover:bg-blue-600/80 rounded-lg transition-all duration-200 w-10 h-10 flex items-center justify-center group"
              title="Payments"
            >
              <CreditCard className="w-5 h-5" />
            </button>

            <button
              className="p-2 text-slate-400 hover:text-white hover:bg-blue-600/80 rounded-lg transition-all duration-200 w-10 h-10 flex items-center justify-center group"
              title="Reports"
            >
              <FileBarChart className="w-5 h-5" />
            </button>

            <button
              className="p-2 text-slate-400 hover:text-white hover:bg-blue-600/80 rounded-lg transition-all duration-200 w-10 h-10 flex items-center justify-center group"
              title="Calendar"
            >
              <Calendar className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* User Icon at Bottom */}
        <div className="absolute bottom-4 md:bottom-6 left-0 right-0 flex justify-center">
          <div className="relative group">
            <div className="absolute inset-0 rounded-full opacity-50 group-hover:opacity-100 blur-md transition-opacity duration-300"></div>
            <div className="relative w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-full flex items-center justify-center ring-2 ring-cyan-700 shadow-lg group-hover:ring-4 group-hover:ring-cyan-500/50 transition-all duration-300">
              <img src={businessInfo.logoUrl} alt="" />
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Sidebar (Full Width) */}
      <div
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed z-50 w-64 md:w-72 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700/50 transition-transform duration-300 h-full print:hidden shadow-2xl overflow-y-auto`}
      >
        <div className="p-4 md:p-6">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <div className="flex items-center space-x-3 md:space-x-4">
              <img
                src={logo}
                alt="Business Logo"
                className="w-16 h-12 object-contain rounded-lg"
              />
            </div>
            {/* Close Button */}
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
              onClick={() => setActiveView("home")} // ADD THIS
              className="group flex items-center space-x-2 md:space-x-3 px-3 md:px-4 py-2.5 md:py-3 text-cyan-300 hover:text-white hover:bg-gradient-to-r hover:from-stone-600/20 hover:to-stone-700/20 rounded-xl cursor-pointer transition-all duration-300 border border-transparent hover:border-cyan-500/30"
            >
              <Home className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
              <span className="text-xs md:text-sm font-semibold">Home</span>
            </div>
            <div
              onClick={() => setShowSettings(true)}
              className="flex items-center space-x-3 px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200"
            >
              <Settings className="w-5 h-5" />
              <span className="text-sm font-medium">Settings</span>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-700/50">
              <div
                onClick={() => setActiveView("financial-overview")}
                className="flex items-center space-x-3 px-3 py-2.5 text-slate-300 hover:text-white hover:bg-blue-600/20 hover:border-l-4 hover:border-blue-500 rounded-lg cursor-pointer transition-all duration-200"
              >
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm font-medium">Practice Overview</span>
              </div>

              {/* Cases Section */}
              <div className="mt-2 md:mt-3">
                <div
                  onClick={() => setIsInvoicingOpen(!isInvoicingOpen)}
                  className="group flex items-center justify-between px-3 md:px-4 py-2.5 md:py-3 text-slate-300 hover:text-white hover:bg-gradient-to-r hover:from-orange-600/20 hover:to-orange-700/20 rounded-xl cursor-pointer transition-all duration-300 border border-transparent hover:border-orange-500/30"
                >
                  <div className="flex items-center space-x-2 md:space-x-3 min-w-0">
                    <Receipt className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                    <span className="text-xs md:text-sm font-semibold truncate">
                      Cases
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 flex-shrink-0 transition-transform duration-300 ${
                      isInvoicingOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>

                {/* Conditional rendering with animation */}
                <div
                  className={`ml-4 md:ml-6 mt-1.5 md:mt-2 space-y-1 border-l-2 border-slate-700/50 pl-3 md:pl-4 overflow-hidden transition-all duration-300 ${
                    isInvoicingOpen
                      ? "max-h-96 opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <div
                    onClick={() => {
                      handleNewEstimate();
                      setActiveView("invoice");
                      if (isMobile) setSidebarOpen(false);
                    }}
                    className="group px-2 md:px-3 py-2 md:py-2.5 text-xs md:text-sm text-slate-400 hover:text-white hover:bg-slate-700/30 rounded-lg cursor-pointer transition-all duration-300 flex items-center space-x-2"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0 group-hover:scale-150 transition-transform duration-300"></div>
                    <span className="truncate">Create Estimate</span>
                  </div>
                  <div
                    onClick={() => {
                      handleNewInvoiceDoc();
                      setActiveView("invoice");
                      if (isMobile) setSidebarOpen(false);
                    }}
                    className="group px-2 md:px-3 py-2 md:py-2.5 text-xs md:text-sm text-slate-400 hover:text-white hover:bg-slate-700/30 rounded-lg cursor-pointer transition-all duration-300 flex items-center space-x-2"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0 group-hover:scale-150 transition-transform duration-300"></div>
                    <span className="truncate">Create Invoice</span>
                  </div>
                  <div
                    onClick={() => {
                      setShowInvoicesList(!showInvoicesList);
                      if (isMobile) setSidebarOpen(false);
                    }}
                    className="group px-2 md:px-3 py-2 md:py-2.5 text-xs md:text-sm text-slate-400 hover:text-white hover:bg-slate-700/30 rounded-lg cursor-pointer transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 min-w-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500 flex-shrink-0 group-hover:scale-150 transition-transform duration-300"></div>
                        <span className="truncate">
                          All{" "}
                          {documentType === "estimate"
                            ? "Estimates"
                            : "Invoices"}
                        </span>
                      </div>
                      <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-2 py-0.5 md:px-2.5 md:py-1 rounded-full text-xs font-bold shadow-lg flex-shrink-0 ml-2">
                        {savedInvoices.length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Clients Section */}
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
                      isClientsOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>

                {/* Conditional rendering with animation */}
                <div
                  className={`ml-4 md:ml-6 mt-1.5 md:mt-2 space-y-1 border-l-2 border-slate-700/50 pl-3 md:pl-4 overflow-hidden transition-all duration-300 ${
                    isClientsOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
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

              <div
                onClick={() => setActiveView("templates")}
                className="flex items-center space-x-3 px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200 mt-2"
              >
                <FileText className="w-5 h-5" />
                <span className="text-sm font-medium">Invoice Templates</span>
              </div>

              <div className="flex items-center space-x-3 px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200">
                <Scale className="w-5 h-5" />
                <span className="text-sm font-medium">Court Dates</span>
              </div>

              <div className="flex items-center space-x-3 px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200">
                <BookOpen className="w-5 h-5" />
                <span className="text-sm font-medium">Legal Research</span>
              </div>

              <div className="flex items-center justify-between px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200">
                <div className="flex items-center space-x-3 md:space-x-4">
                  <Receipt className="w-5 h-5" />
                  <span className="text-sm font-medium">Billing</span>
                </div>
                <ChevronDown className="w-4 h-4" />
              </div>

              <div className="flex items-center justify-between px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200">
                <div className="flex items-center space-x-3 md:space-x-4">
                  <CreditCard className="w-5 h-5" />
                  <span className="text-sm font-medium">Payments</span>
                </div>
                <ChevronDown className="w-4 h-4" />
              </div>

              <div className="flex items-center justify-between px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200">
                <div className="flex items-center space-x-3 md:space-x-4">
                  <FileBarChart className="w-5 h-5" />
                  <span className="text-sm font-medium">Reports</span>
                </div>
                <ChevronDown className="w-4 h-4" />
              </div>

              <div className="flex items-center space-x-3 px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200">
                <Calendar className="w-5 h-5" />
                <span className="text-sm font-medium">Calendar</span>
              </div>
            </div>
          </nav>
        </div>

        <div className="absolute bottom-4 md:bottom-6 left-0 right-0 flex justify-center p-4 md:p-6 border-t border-slate-700/50 bg-gradient-to-t from-slate-900 to-transparent backdrop-blur-sm">
          <div className="flex items-center space-x-2 md:space-x-3">
            <div className="relative group flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full opacity-50 group-hover:opacity-100 blur-md transition-opacity duration-300"></div>
              <div className="relative w-9 h-9 md:w-11 md:h-11 bg-white rounded-full ring-2 ring-slate-700 shadow-lg group-hover:ring-4 group-hover:ring-blue-500/50 transition-all duration-300">
                <img
                  src={businessInfo.logoUrl}
                  alt="Business Logo"
                  className="absolute inset-0 m-auto max-h-[70%] max-w-[70%] object-contain"
                />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs md:text-sm font-bold text-white bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent truncate">
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

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300 ${sidebarOpen ? "lg:ml-64" : "ml-0 md:ml-16"}`}>
        <div className="flex-1 overflow-auto h-screen border-b-[25px] border-gray-800">
        <div className="flex flex-col h-screen">
          <div className="flex-shrink-0 bg-white/80 backdrop-blur-md border-b border-slate-200 px-3 md:px-4 lg:px-8 py-3 md:py-4 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center space-x-2 lg:space-x-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <Menu className="w-5 h-5" />
                </button>

                <h1 className="text-base lg:text-xl font-semibold">
                  Invoice #{invoiceNumber || "— not saved yet —"}
                </h1>
              </div>

              <div className="hidden lg:flex items-center space-x-2 print:hidden flex-shrink-0">
                {documentType === "estimate" && invoiceId && (
                  <button
                    onClick={handleConvertToInvoice}
                    className="group flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-purple-500/50 hover:scale-105 whitespace-nowrap"
                  >
                    <FileText className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
                    Convert to Invoice
                  </button>
                )}

                <button
                  onClick={handlePrint}
                  className="group flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-slate-200 text-slate-700 rounded-xl hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100 hover:border-slate-300 transition-all duration-300 font-semibold shadow-sm hover:shadow-md whitespace-nowrap"
                >
                  <Printer className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                  Print
                </button>

                <button
                  onClick={
                    documentType === "estimate"
                      ? handleNewEstimate
                      : handleNewInvoiceDoc
                  }
                  className="group flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-emerald-500/50 hover:scale-105 whitespace-nowrap"
                >
                  <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                  New
                </button>

                <button className="group flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-blue-500/50 hover:scale-105 whitespace-nowrap">
                  <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                  <span>Send</span>
                </button>

                <button
                  onClick={handleSavePDF}
                  className="group flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-xl hover:from-orange-700 hover:to-orange-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-orange-500/50 hover:scale-105 whitespace-nowrap"
                >
                  <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform duration-300" />
                  Save PDF
                </button>

                <button
                  onClick={handleSaveInvoice}
                  className="group flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl hover:from-amber-700 hover:to-amber-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-amber-500/50 hover:scale-105 whitespace-nowrap"
                >
                  <Save className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                  Save
                </button>

                <button
                                  onClick={handleLogout}
                                  className="group flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-red-500/50 hover:scale-105 whitespace-nowrap"
                                >
                                  <LogOut className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-300" />
                                  Logout
                                </button>
                              </div>
                
                              {/* Mobile Logout Button */}
                              <button
                                onClick={handleLogout}
                                className="lg:hidden p-2 md:p-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg print:hidden flex-shrink-0"
                              >
                                <LogOut className="w-4 h-4 md:w-5 md:h-5" />
                              </button>
            </div>
          </div>

          {/* Mobile Action Buttons Bar */}
          <div className="flex-shrink-0 lg:hidden bg-white/90 backdrop-blur-md px-3 md:px-4 py-2.5 md:py-3 print:hidden border-b border-slate-200 overflow-x-auto">
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-800 whitespace-nowrap text-sm">
                <CheckSquare className="w-4 h-4" />
                <span>Mark Paid</span>
              </button>
              <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-800 whitespace-nowrap text-sm">
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </button>
              <button className="flex items-center gap-2 px-3 py-2 bg-gray-50 text-gray-800 rounded-lg hover:bg-blue-700 whitespace-nowrap text-sm">
                <Send className="w-4 h-4" />
                <span>Send</span>
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-3 py-2 bg-gray-50 text-gray-800 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap text-sm"
              >
                <Download className="w-4 h-4" />
                <span>Save PDF</span>
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-gray-800 rounded-lg hover:bg-gray-700 transition-colors whitespace-nowrap text-sm"
              >
                <Printer className="w-4 h-4" />
                <span>Print</span>
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {/* Business Settings Modal */}
            {showSettings && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                  <div className="p-4 border-b flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Firm Settings</h2>
                    <button
                      onClick={() => setShowSettings(false)}
                      className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="overflow-auto p-6">
                    <div className="space-y-4">
                      {/* Logo Upload Section */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Firm Logo
                        </label>
                        <div className="flex items-center gap-4">
                          {businessInfo.logoUrl ? (
                            <img
                              src={businessInfo.logoUrl}
                              alt="Firm Logo"
                              className="w-24 h-24 object-contain border rounded-lg"
                            />
                          ) : (
                            <div className="w-24 h-24 border-2 border-dashed rounded-lg flex items-center justify-center bg-gray-800">
                              <Upload className="w-8 h-8 text-gray-400" />
                            </div>
                          )}

                          <div className="flex-1">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleLogoUpload}
                              className="hidden"
                              id="logo-upload"
                            />
                            <label
                              htmlFor="logo-upload"
                              className="inline-block px-4 py-2 bg-gray-600 text-gray-800 rounded-lg hover:bg-gray-700 cursor-pointer"
                            >
                              {businessInfo.logoUrl
                                ? "Change Logo"
                                : "Upload Logo"}
                            </label>
                            <p className="text-xs text-gray-500 mt-2">
                              Recommended: Square image, max 5MB
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Firm Name
                        </label>
                        <input
                          type="text"
                          value={businessInfo.businessName}
                          onChange={(e) =>
                            setBusinessInfo({
                              ...businessInfo,
                              businessName: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border rounded-lg"
                          placeholder="Smith & Associates Attorneys"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Address Line 1
                        </label>
                        <input
                          type="text"
                          value={businessInfo.addressLine1}
                          onChange={(e) =>
                            setBusinessInfo({
                              ...businessInfo,
                              addressLine1: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border rounded-lg"
                          placeholder="15 LEGAL AVENUE"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Address Line 2
                        </label>
                        <input
                          type="text"
                          value={businessInfo.addressLine2}
                          onChange={(e) =>
                            setBusinessInfo({
                              ...businessInfo,
                              addressLine2: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border rounded-lg"
                          placeholder="CAPE TOWN CBD"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            City
                          </label>
                          <input
                            type="text"
                            value={businessInfo.city}
                            onChange={(e) =>
                              setBusinessInfo({
                                ...businessInfo,
                                city: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2 border rounded-lg"
                            placeholder="CAPE TOWN"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Postal Code
                          </label>
                          <input
                            type="text"
                            value={businessInfo.postalCode}
                            onChange={(e) =>
                              setBusinessInfo({
                                ...businessInfo,
                                postalCode: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2 border rounded-lg"
                            placeholder="8001"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Primary Phone *
                        </label>
                        <input
                          type="tel"
                          value={businessInfo.primaryPhone}
                          onChange={(e) =>
                            setBusinessInfo({
                              ...businessInfo,
                              primaryPhone: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border rounded-lg"
                          placeholder="021 123 4567"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Secondary Phone (Optional)
                        </label>
                        <input
                          type="tel"
                          value={businessInfo.secondaryPhone}
                          onChange={(e) =>
                            setBusinessInfo({
                              ...businessInfo,
                              secondaryPhone: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border rounded-lg"
                          placeholder="021 123 4568"
                        />
                      </div>
                      <div className="border-t pt-4 mt-6">
                        <h3 className="text-lg font-semibold mb-4">
                          Bank Details
                        </h3>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Bank Name
                            </label>
                            <input
                              type="text"
                              value={businessInfo.bankName}
                              onChange={(e) =>
                                setBusinessInfo({
                                  ...businessInfo,
                                  bankName: e.target.value,
                                })
                              }
                              className="w-full px-4 py-2 border rounded-lg"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Account Holder
                            </label>
                            <input
                              type="text"
                              value={businessInfo.accountHolder}
                              onChange={(e) =>
                                setBusinessInfo({
                                  ...businessInfo,
                                  accountHolder: e.target.value,
                                })
                              }
                              className="w-full px-4 py-2 border rounded-lg"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Account Number
                            </label>
                            <input
                              type="text"
                              value={businessInfo.accountNumber}
                              onChange={(e) =>
                                setBusinessInfo({
                                  ...businessInfo,
                                  accountNumber: e.target.value,
                                })
                              }
                              className="w-full px-4 py-2 border rounded-lg"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Branch Code
                            </label>
                            <input
                              type="text"
                              value={businessInfo.branchCode}
                              onChange={(e) =>
                                setBusinessInfo({
                                  ...businessInfo,
                                  branchCode: e.target.value,
                                })
                              }
                              className="w-full px-4 py-2 border rounded-lg"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="border-t pt-6 mt-6">
                        <h3 className="text-lg font-semibold mb-4">
                          📋 Invoice Stamp Settings
                        </h3>

                        <div className="space-y-4">
                          <div>
                            <label className="flex items-center space-x-2 mb-4">
                              <input
                                type="checkbox"
                                checked={stampSettings.enabled}
                                onChange={(e) =>
                                  setStampSettings({
                                    ...stampSettings,
                                    enabled: e.target.checked,
                                  })
                                }
                                className="w-4 h-4 rounded"
                              />
                              <span className="text-sm font-medium">
                                Show approval stamp on invoices and quotes
                              </span>
                            </label>
                          </div>

                          {stampSettings.enabled && (
                            <>
                              <div>
                                <label className="block text-sm font-medium mb-2">
                                  Stamp Text
                                </label>
                                <input
                                  type="text"
                                  value={stampSettings.text}
                                  onChange={(e) =>
                                    setStampSettings({
                                      ...stampSettings,
                                      text: e.target.value.toUpperCase(),
                                    })
                                  }
                                  className="w-full px-4 py-2 border rounded-lg uppercase"
                                  placeholder="APPROVED"
                                  maxLength={15}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                  Max 15 characters
                                </p>
                              </div>

                              <div>
                                <label className="block text-sm font-medium mb-2">
                                  Stamp Color
                                </label>
                                <select
                                  value={stampSettings.color}
                                  onChange={(e) =>
                                    setStampSettings({
                                      ...stampSettings,
                                      color: e.target.value,
                                    })
                                  }
                                  className="w-full px-4 py-2 border rounded-lg"
                                >
                                  <option value="#d32f2f">
                                    🔴 Red (Traditional)
                                  </option>
                                  <option value="#1976d2">
                                    🔵 Blue (Professional)
                                  </option>
                                  <option value="#388e3c">
                                    🟢 Green (Approved)
                                  </option>
                                  <option value="#7b1fa2">
                                    🟣 Purple (Premium)
                                  </option>
                                  <option value="#000000">
                                    ⚫ Black (Formal)
                                  </option>
                                  <option value="#f57c00">
                                    🟠 Orange (Attention)
                                  </option>
                                </select>
                              </div>

                              <div>
                                <label className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    checked={stampSettings.showDate}
                                    onChange={(e) =>
                                      setStampSettings({
                                        ...stampSettings,
                                        showDate: e.target.checked,
                                      })
                                    }
                                    className="w-4 h-4 rounded"
                                  />
                                  <span className="text-sm font-medium">
                                    Include date on stamp
                                  </span>
                                </label>
                              </div>

                              {/* Preview */}
                              <div className="mt-4 p-6 bg-gray-800 rounded-lg border-2 border-dashed border-gray-300">
                                <p className="text-sm font-medium mb-4 text-center text-gray-600">
                                  Preview:
                                </p>
                                <div className="flex justify-center">
                                  <SignatureStamp
                                    text={stampSettings.text}
                                    color={stampSettings.color}
                                    showDate={stampSettings.showDate}
                                    rotation={-5}
                                    size="medium"
                                  />
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={handleSaveBusinessInfo}
                        className="w-full bg-gray-50 text-gray-800 py-3 rounded-lg hover:bg-blue-700"
                      >
                        Save Firm Information
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <CustomersListModal
              showModal={showCustomersListModal}
              setShowModal={setShowCustomersListModal}
              customers={customers}
              onLoadCustomer={loadCustomer}
              onEditCustomer={handleEditCustomer}
              onAddNewCustomer={handleAddNewCustomer}
            />
            {/* Customer Modal */}
            <CustomerModal
              showModal={showCustomerModal}
              setShowModal={setShowCustomerModal}
              existingCustomer={selectedCustomer}
              onCustomerSaved={handleCustomerSaved}
            />
            {/* Saved Invoices List Modal */}
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
                            className="border rounded-lg p-4 hover:bg-gray-800 cursor-pointer transition-colors"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-semibold text-lg">
                                  {invoice.invoiceNumber || "N/A"}
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                  Client: {invoice.client?.name || "N/A"}
                                </div>
                                <div className="text-sm text-gray-600">
                                  Case: {invoice.case?.type || "N/A"}
                                </div>
                                <div className="text-sm text-gray-600">
                                  Case #: {invoice.case?.caseNumber || "N/A"}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-semibold text-blue-600">
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
                                  className={`text-xs mt-1 px-2 py-1 rounded ${
                                    invoice.status === "paid"
                                      ? "bg-green-100 text-green-700"
                                      : invoice.status === "pending"
                                        ? "bg-blue-100 text-blue-700"
                                        : "bg-gray-100 text-gray-700"
                                  }`}
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
            {activeView === "financial-overview" && (
              <FinancialOverview user={user} />
            )}
            {activeView === "templates" && <Templates user={user} />}
            {activeView === "home" && <HomeView user={user} />}
            {activeView === "invoice" && (
            
                <div className="grid grid-cols-1 gap-6 px-4 sm:px-6 lg:px-8 xl:px-12">
                  <div className="space-y-6">
                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm pt-2 sm:pt-6">
                      <div className="flex border-b border-slate-200">
                        <button
                          onClick={() => setInputMode("manual")}
                          className={`flex-1 px-6 py-4 font-semibold transition-all duration-200 ${
                            inputMode === "manual"
                              ? "bg-white text-blue-600 border-b-2 border-blue-600 shadow-sm"
                              : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                          }`}
                        >
                          <span className="flex items-center justify-center gap-2">
                            <Edit className="w-5 h-5" />
                            Manual Entry
                          </span>
                        </button>
                        <button
                          onClick={() => setInputMode("ai")}
                          className={`flex-1 px-6 py-4 font-semibold transition-all duration-200 ${
                            inputMode === "ai"
                              ? "bg-white text-purple-600 border-b-2 border-purple-600 shadow-sm"
                              : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                          }`}
                        >
                          <span className="flex items-center justify-center gap-2">
                            <Sparkles className="w-5 h-5" />
                            AI Assistant
                          </span>
                        </button>
                      </div>

                      {/* Tab Content */}
                      <div className="p-6">
                        {inputMode === "ai" ? (
                          <AIInvoiceExtractor
                            onDataExtracted={handleAIDataExtracted}
                            documentType={documentType}
                          />
                        ) : null}
                      </div>
                    </div>
                    {inputMode === "manual" && (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-3 rounded-xl border border-orange-200 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                              <div className="text-sm font-medium text-orange-700">
                                Total Amount
                              </div>
                              <div className="w-8 h-8 bg-orange-200 rounded-lg flex items-center justify-center">
                                <DollarSign className="w-5 h-5 text-orange-600" />
                              </div>
                            </div>
                            <div className="text-2xl font-bold text-orange-900">
                              R{total.toFixed(2)}
                            </div>
                          </div>

                          <div
                            className={`bg-gradient-to-br p-3 rounded-xl border shadow-sm transition-all ${
                              paymentStatus.totalPaid > 0
                                ? "from-emerald-100 to-emerald-300 border-emerald-600"
                                : "from-slate-100 to-slate-300 border-slate-300"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div
                                className={`text-sm font-medium ${
                                  paymentStatus.totalPaid > 0
                                    ? "text-emerald-700"
                                    : "text-slate-600"
                                }`}
                              >
                                Paid
                              </div>
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                  paymentStatus.totalPaid > 0
                                    ? "bg-emerald-200"
                                    : "bg-slate-200"
                                }`}
                              >
                                <CheckSquare
                                  className={`w-5 h-5 ${
                                    paymentStatus.totalPaid > 0
                                      ? "text-emerald-600"
                                      : "text-slate-400"
                                  }`}
                                />
                              </div>
                            </div>
                            <div
                              className={`text-2xl font-bold ${
                                paymentStatus.totalPaid > 0
                                  ? "text-emerald-900"
                                  : "text-slate-900"
                              }`}
                            >
                              R{paymentStatus.totalPaid.toFixed(2)}
                            </div>
                          </div>

                          <div
                            className={`bg-gradient-to-br p-3 rounded-xl border shadow-sm transition-all ${
                              paymentStatus.balanceDue <= 0
                                ? "from-emerald-100 to-emerald-300 border-emerald-600"
                                : paymentStatus.totalPaid > 0
                                  ? "from-amber-100 to-amber-300 border-amber-300"
                                  : "from-rose-50 to-rose-100 border-rose-200"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div
                                className={`text-sm font-medium ${
                                  paymentStatus.balanceDue <= 0
                                    ? "text-emerald-700"
                                    : paymentStatus.totalPaid > 0
                                      ? "text-amber-700"
                                      : "text-rose-700"
                                }`}
                              >
                                Balance Due
                              </div>
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                  paymentStatus.balanceDue <= 0
                                    ? "bg-emerald-200"
                                    : paymentStatus.totalPaid > 0
                                      ? "bg-amber-200"
                                      : "bg-rose-200"
                                }`}
                              >
                                <Wallet
                                  className={`w-5 h-5 ${
                                    paymentStatus.balanceDue <= 0
                                      ? "text-emerald-600"
                                      : paymentStatus.totalPaid > 0
                                        ? "text-amber-600"
                                        : "text-rose-600"
                                  }`}
                                />
                              </div>
                            </div>
                            <div
                              className={`text-2xl font-bold ${
                                paymentStatus.balanceDue <= 0
                                  ? "text-emerald-900"
                                  : paymentStatus.totalPaid > 0
                                    ? "text-amber-900"
                                    : "text-rose-900"
                              }`}
                            >
                              R{paymentStatus.balanceDue.toFixed(2)}
                            </div>
                          </div>
                        </div>

                        {inputMode === "manual" && (
                          <LegalMultiStepForm
                            // Client Info Props
                            clientName={clientName}
                            setClientName={setClientName}
                            clientId={clientId}
                            setClientId={setClientId}
                            clientEmail={clientEmail}
                            setClientEmail={setClientEmail}
                            clientPhone={clientPhone}
                            setClientPhone={setClientPhone}
                            clientAddress={clientAddress}
                            setClientAddress={setClientAddress}
                            // Case Info Props
                            caseType={caseType}
                            setCaseType={setCaseType}
                            caseNumber={caseNumber}
                            setCaseNumber={setCaseNumber}
                            matterDescription={matterDescription}
                            setMatterDescription={setMatterDescription}
                            // Items Props
                            items={items}
                            newItem={newItem}
                            setNewItem={setNewItem}
                            handleAddItem={handleAddItem}
                          />
                        )}

                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">
                              Payment Terms
                            </h2>
                          </div>

                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between py-2 border-b">
                              <span className="text-gray-600">
                                Payment Method:
                              </span>
                              <span className="text-sm font-medium">
                                EFT/Bank Transfer
                              </span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                              <span className="text-gray-600">
                                Payment Terms:
                              </span>
                              <span className="text-sm font-medium">
                                Due Within 30 Days
                              </span>
                            </div>
                            <div className="flex justify-between py-2">
                              <span className="text-gray-600">
                                Late Payment:
                              </span>
                              <span className="text-sm font-medium">
                                Interest at Prime + 2%
                              </span>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

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
                    {/* Use Template Renderer instead of hardcoded invoice */}
                    <TemplateRenderer
                      templateId={selectedTemplate}
                      businessInfo={businessInfo}
                      loading={loading}
                      jobCardNumber={invoiceNumber}
                      customerName={clientName}
                      customerEmail={clientEmail}
                      customerPhone={clientPhone}
                      customerAddress={clientAddress}
                      caseNumber={caseNumber}
                      caseType={caseType}
                      matterDescription={matterDescription}
                      items={items}
                      subtotal={subtotal}
                      vat={vat}
                      total={total}
                      documentType="legal"
                      serviceType="LEGAL"
                      stampSettings={stampSettings}
                      showStamp={stampSettings.enabled}
                      showStampDate={stampSettings.showDate}
                      stampText={stampSettings.text}
                      stampColor={stampSettings.color}
                      paymentStatus={paymentStatus}
                    />
                  </div>
                </div>
             
            )}
          </div>
        </div>
       </div>
      </div>
    </div>
  );
};

export default LegalDashboard;
