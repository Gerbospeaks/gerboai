import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import HomeView from "../HomeView";
import { serverTimestamp } from "firebase/firestore";
import logo from '../../assets/img/solidflo-logo.png';
import { getAuth, signOut } from "firebase/auth";
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
import CustomerModal from '../CustomerModal';
import CustomersListModal from '../CustomersListModal';
import SignatureStamp from '../SignatureStamp';
import Templates from "./Templates"; 
import PlumbingMultiStepForm from "./PlumbingMultiStepForm";
import AIInvoiceExtractor from "../AIInvoiceExtractor";
import  uploadLogoToR2 from '../../utils/uploadLogoToR2';
import TemplateSelector, { TemplateRenderer } from './TemplateSelector';
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
  PieChart,
  Droplets,
  ClipboardList,
  Package,
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

const PlumbingDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
const [inputMode, setInputMode] = useState("manual");
const [documentType, setDocumentType] = useState("invoice"); 
const [useAI, setUseAI] = useState(false);
  const [activeTab, setActiveTab] = useState("WorkOrder");
  const [showJobCard, setShowJobCard] = useState(false);
  const {user, authUser} = useAuth();
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
  const [selectedTemplate, setSelectedTemplate] = useState('professional');
  const [customers, setCustomers] = useState([]);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isInvoicingOpen, setIsInvoicingOpen] = useState(false);
  const [isClientsOpen, setIsClientsOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
const [stampSettings, setStampSettings] = useState({
    text: "APPROVED",
  color: "#d32f2f",
  showDate: false,
  enabled: false
  });
  useEffect(() => {
    if (!user?.uid) return;

    const loadJobCardNumber = async () => {
      const nextJobCard = await generateJobCardNumber(user.uid);
      setJobCardNumber(nextJobCard);
    };

    loadJobCardNumber();
    loadSavedJobCards();
  }, [user]);
const [paymentStatus, setPaymentStatus] = useState({
    totalPaid: 0,
    balanceDue: 0,
    status: "pending",
  });
  const loadCustomers = async () => {
    try {
      const q = query(collection(db, "users", user.uid, "clients"), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const customersData = [];
      
      querySnapshot.forEach((doc) => {
        customersData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setCustomers(customersData);
    } catch (error) {
      console.error('Error loading customers:', error);
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
        const invoiceData = invoiceDoc.data();
        setSelectedInvoiceForPayment({
          id: jobCardId,
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
    if (!user?.uid || !jobCardId) {
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
      setPaymentStatus({
        totalPaid: 0,
        balanceDue: total,
        status: "pending",
      });
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
    const jobCardsRef = collection(db, "users", user.uid, "invoices");
    const q = query(jobCardsRef, orderBy("createdAt", "desc"), limit(50));
    const snapshot = await getDocs(q);

    const cards = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setSavedJobCards(cards);
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
    setCustomerAddress(customer.address || "");
    setCustomerId(customer.customerId || "");
  };

  const handleCustomerSaved = () => {
    loadCustomers();
  };

  useEffect(() => {
    loadCustomers();
  }, []);
const handleConvertToInvoice = async () => {
    if (!user?.uid) return;
    if (!jobCardId) {
      alert("Please save the job card first before converting to invoice");
      return;
    }
    if (!window.confirm("Convert this job card to an invoice? This will create a new invoice with the same details.")) return;

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

    setSavedCustomers(customers.filter(c => !c._placeholder));
  };

  const handleSaveCustomer = async () => {
    if (!user?.uid) return;
    
    if (!customerName || !customerEmail) {
      alert("Please enter customer name and email");
      return;
    }

    try {
      const db = getFirestore();
      const customerData = {
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
        address: customerAddress,
        customerId: customerId || `CUST-${Date.now()}`,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await addDoc(collection(db, "users", user.uid, "clients"), customerData);
      alert("Customer saved successfully!");
      loadSavedCustomers();
    } catch (error) {
      console.error("Error saving customer:", error);
      alert("Failed to save customer");
    }
  };

  const loadJobCardForExport = async () => {
    if (!user?.uid || !jobCardId) return null;

    const db = getFirestore();
    const snap = await getDoc(
      doc(db, "users", user.uid, "invoices", jobCardId)
    );

    return snap.exists() ? snap.data() : null;
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

    setTimeout(() => {
      window.print();
    }, 300);
  };

  const handleAddItem = () => {
    if (!newItem.description || !newItem.qty) return;

    const rate = Number(newItem.rate) || 0;
    const qty = Number(newItem.qty);

    const item = {
      description: newItem.description,
      type: newItem.type || "Labor",
      rate,
      qty,
      amount: rate * qty,
    };

    setItems((prev) => [...prev, item]);
    setNewItem({ description: "", rate: "", qty: "", type: "Labor" });
  };
const handleAIDataExtracted = (extractedData) => {
  // Customer info
  if (extractedData.customer.name) setCustomerName(extractedData.customer.name);
  if (extractedData.customer.email) setCustomerEmail(extractedData.customer.email);
  if (extractedData.customer.phone) setCustomerPhone(extractedData.customer.phone);
  if (extractedData.customer.address) setCustomerAddress(extractedData.customer.address);
  if (extractedData.customer.customerId) setCustomerId(extractedData.customer.customerId);

  // Property info
  if (extractedData.property.type) setPropertyType(extractedData.property.type);
  if (extractedData.property.address) setPropertyAddress(extractedData.property.address);
  if (extractedData.property.accessDetails) setAccessDetails(extractedData.property.accessDetails);
  if (typeof extractedData.property.emergencyService === 'boolean') {
    setEmergencyService(extractedData.property.emergencyService);
  }

  // Items
  if (extractedData.items && extractedData.items.length > 0) {
    setItems(extractedData.items);
  }

  alert("✅ Plumbing work order data extracted and populated successfully!");
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

  const [customerName, setCustomerName] = useState("John Smith");
  const [customerId, setCustomerId] = useState("CUST-2026-5678");
  const [customerEmail, setCustomerEmail] = useState("john.smith@example.com");
  const [customerPhone, setCustomerPhone] = useState("082 987 6543");
  const [customerAddress, setCustomerAddress] = useState("456 Water Street, Manchester, M1 2AB");
  
  // Property Details
  const [propertyType, setPropertyType] = useState("Residential");
  const [propertyAddress, setPropertyAddress] = useState("456 Water Street, Manchester, M1 2AB");
  const [accessDetails, setAccessDetails] = useState("Key available from main office");
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
  
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }
  
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }
  
    try {
      setBusinessInfo(prev => ({ ...prev, uploading: true }));
  
      // ✅ Upload to Cloudflare R2 (Worker handles userId)
      const logoUrl = await uploadLogoToR2(file, authUser);
  
      setBusinessInfo(prev => ({
        ...prev,
        logoUrl,
        uploading: false,
      }));
  
      // Save URL to Firestore
      const db = getFirestore();
      const docRef = doc(db, "users", user.uid, "settings", "businessInfo");
  
      await setDoc(docRef, {
    logoUrl,
    updatedAt: new Date().toISOString(),
  }, { merge: true });
  
      alert("Logo uploaded successfully!");
    } catch (error) {
      console.error("Error uploading logo:", error);
      alert("Failed to upload logo: " + error.message);
      setBusinessInfo(prev => ({ ...prev, uploading: false }));
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
    
    /* Position print area to fill the page */
    #print-area {
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
    
    /* Ensure colors print correctly */
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    
    /* Remove any borders or shadows */
    .shadow-lg, .rounded-lg {
      border: none !important;
      box-shadow: none !important;
    }
    
    /* Prevent page breaks inside elements */
    table, tr, td, th, div {
      page-break-inside: avoid !important;
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
    qty: "",
    type: "Labor",
  });

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const vat = subtotal * 0.20;
  const total = subtotal + vat;

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
      accessDetails: accessDetails,
      emergencyService: emergencyService,
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
        jobCardData
      );
      setJobCardId(ref.id);
    }

    alert("Work order saved and locked");
    loadSavedJobCards();
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
        const nextJobCard = await generateJobCardNumber(user.uid);
        setJobCardNumber(nextJobCard);
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
    <div className="flex h-screen bg-gray-300">
   {/* Mobile Sidebar Backdrop */}
{sidebarOpen && (
  <div
    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
    onClick={() => setSidebarOpen(false)}
  ></div>
)}

{/* Collapsed Sidebar (Icon Only) */}
<div
  className={`${
    sidebarOpen ? "hidden" : "hidden md:block"
  } fixed z-40 w-16 bg-gradient-to-b from-slate-900 to-slate-800 border-r border-slate-700 h-full print:hidden transition-all duration-300 shadow-xl`}
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
  onClick={() => setActiveView("home")}  // ADD THIS
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
        className="p-2 text-slate-400 hover:text-white hover:bg-blue-600/80 rounded-lg transition-all duration-200 w-10 h-10 flex items-center justify-center group"
        title="Business Overview"
      >
        <TrendingUp className="w-5 h-5" />
      </button>

      <button
        onClick={handleNewJobCard}
        className="p-2 text-slate-400 hover:text-white hover:bg-blue-600/80 rounded-lg transition-all duration-200 w-10 h-10 flex items-center justify-center group"
        title="Work Orders"
      >
        <ClipboardList className="w-5 h-5" />
      </button>

      <button
        onClick={() => setShowCustomersListModal(true)}
        className="p-2 text-slate-400 hover:text-white hover:bg-blue-600/80 rounded-lg transition-all duration-200 w-10 h-10 flex items-center justify-center group"
        title="Customers"
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
        title="Properties"
      >
        <MapPin className="w-5 h-5" />
      </button>

      <button
        className="p-2 text-slate-400 hover:text-white hover:bg-blue-600/80 rounded-lg transition-all duration-200 w-10 h-10 flex items-center justify-center group"
        title="Parts Inventory"
      >
        <Package className="w-5 h-5" />
      </button>

      <button
        className="p-2 text-slate-400 hover:text-white hover:bg-blue-600/80 rounded-lg transition-all duration-200 w-10 h-10 flex items-center justify-center group"
        title="Invoices"
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
        title="Appointments"
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
  } fixed z-50 w-64 bg-gradient-to-b from-slate-900 to-slate-800 border-r border-slate-700 transition-transform duration-300 h-full print:hidden shadow-2xl`}
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
  onClick={() => setActiveView("home")}  // ADD THIS
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
        <div className="flex items-center space-x-3 px-3 py-2.5 text-slate-300 hover:text-white hover:bg-blue-600/20 hover:border-l-4 hover:border-blue-500 rounded-lg cursor-pointer transition-all duration-200">
          <TrendingUp className="w-5 h-5" />
          <span className="text-sm font-medium">Business Overview</span>
        </div>

        <div className="mt-2">
          <div className="flex items-center justify-between px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200">
            <div className="flex items-center space-x-3 md:space-x-4">
              <ClipboardList className="w-5 h-5" />
              <span className="text-sm font-medium">Work Orders</span>
            </div>
            <ChevronDown className="w-4 h-4" />
          </div>

          <div className="ml-4 mt-1 space-y-1 border-l-2 border-slate-700/50 pl-4">
            <div
              onClick={handleNewJobCard}
              className="px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700/30 rounded-lg cursor-pointer transition-all duration-200"
            >
              Create Work Order
            </div>
            <div
              onClick={() => setShowJobCardsList(!showJobCardsList)}
              className="px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700/30 rounded-lg cursor-pointer transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <span>All Work Orders</span>
                <span className=" text-blue-300 px-2 py-0.5 rounded-full text-xs font-semibold">
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
            <div className="flex items-center space-x-3 md:space-x-4">
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
              onClick={() => setShowCustomersListModal(true)}
              className="px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700/30 rounded-lg cursor-pointer transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <span>All Customers</span>
                <span className=" text-blue-300 px-2 py-0.5 rounded-full text-xs font-semibold">
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
          <MapPin className="w-5 h-5" />
          <span className="text-sm font-medium">Properties</span>
        </div>

        <div className="flex items-center space-x-3 px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200">
          <Package className="w-5 h-5" />
          <span className="text-sm font-medium">Parts Inventory</span>
        </div>

        <div className="flex items-center justify-between px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200">
          <div className="flex items-center space-x-3 md:space-x-4">
            <Receipt className="w-5 h-5" />
            <span className="text-sm font-medium">Invoices</span>
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
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? "lg:ml-64" : "ml-0 md:ml-16"}`}>
      <div className="flex-1 overflow-auto h-screen border-b-[25px] border-gray-800">
        <div className="sticky top-0 z-40 flex flex-col">
        <div className="flex-shrink-0 bg-white/80 backdrop-blur-md border-b border-slate-200 px-3 md:px-4 lg:px-8 py-3 md:py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 lg:space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
               
              </button>
            
              <h1 className="text-base lg:text-xl font-semibold">
                Work Order #{jobCardNumber || "— not saved yet —"}
              </h1>
             
              {emergencyService && (
                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded">
                  EMERGENCY
                </span>
              )}
            </div>

            <div className="hidden lg:flex items-center space-x-3 print:hidden">
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-800">
                <CheckSquare className="w-4 h-4" />
                <span>Mark Complete</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-800">
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </button>
              <button
                onClick={handleSaveJobCard}
                className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-800 rounded-lg hover:bg-blue-700"
              >
                Save Work Order
              </button>

              <button
                onClick={handleNewJobCard}
                className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-800 rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                New
              </button>

              <button className="flex items-center space-x-2 px-4 py-2 bg-gray-50 text-gray-800 rounded-lg hover:bg-blue-700">
                <Send className="w-4 h-4" />
                <span>Send</span>
              </button>
              <button
                onClick={handleSavePDF}
                className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-800 rounded-lg hover:bg-blue-700"
              >
                Save as PDF
              </button>

              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
               <button
                                onClick={handleLogout}
                                className="group flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-red-500/50 hover:scale-105 whitespace-nowrap"
                              >
                                <LogOut className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-300" />
                                Logout
                              </button>
                            </div>
              
                            {/* Mobile logout */}
                            <button
                              onClick={handleLogout}
                              className="lg:hidden p-2 md:p-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg print:hidden flex-shrink-0"
                            >
                              <LogOut className="w-4 h-4 md:w-5 md:h-5" />
                            </button>
          </div>
        </div>
        </div>
        {/* Mobile Action Buttons Bar */}
        <div className="flex-shrink-0 lg:hidden bg-white/90 backdrop-blur-md px-3 md:px-4 py-2.5 md:py-3 print:hidden border-b border-slate-200 overflow-x-auto">
          <div className="flex gap-2 min-w-max pb-1 pr-3">
            {documentType === "quote" && jobCardId && (
              <button onClick={handleConvertToInvoice} className="group flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 md:py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg md:rounded-xl hover:from-purple-700 hover:to-purple-800 whitespace-nowrap text-xs md:text-sm font-semibold shadow-lg transition-all duration-300 active:scale-95">
                <FileText className="w-3.5 h-3.5 md:w-4 md:h-4 group-hover:rotate-12 transition-transform duration-300" />
                <span>To Invoice</span>
              </button>
            )}
            <button onClick={handleSaveJobCard} className="group flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 md:py-2.5 bg-gradient-to-r from-stone-600 to-stone-700 text-white rounded-lg md:rounded-xl hover:from-stone-700 hover:to-stone-800 whitespace-nowrap text-xs md:text-sm font-semibold shadow-lg transition-all duration-300 active:scale-95">
              <Save className="w-3.5 h-3.5 md:w-4 md:h-4 group-hover:scale-110 transition-transform duration-300" />
              Save
            </button>
            <button className="group flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 md:py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg md:rounded-xl hover:from-amber-700 hover:to-orange-700 whitespace-nowrap text-xs md:text-sm font-semibold shadow-lg transition-all duration-300 active:scale-95">
              <Send className="w-3.5 h-3.5 md:w-4 md:h-4 group-hover:translate-x-1 transition-transform duration-300" />
              <span>Send</span>
            </button>
            <button onClick={handlePrint} className="group flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 md:py-2.5 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg md:rounded-xl hover:from-orange-700 hover:to-orange-800 whitespace-nowrap text-xs md:text-sm font-semibold shadow-lg transition-all duration-300 active:scale-95">
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
                 <div className="flex-1 overflow-y-auto pr-4 md:pr-6 lg:pr-8">
          {/* Business Settings Modal */}
          {showSettings && (
                       <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 md:p-4 animate-fadeIn overflow-y-auto">
                         <div className="bg-white rounded-xl md:rounded-2xl max-w-2xl w-full max-h-[95vh] md:max-h-[90vh] overflow-hidden flex flex-col shadow-2xl transform transition-all duration-300 animate-slideUp my-auto">
                           <div className="p-4 md:p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-purple-50 flex-shrink-0">
                             <div className="flex items-center justify-between">
                               <div className="flex items-center space-x-2 md:space-x-3">
                                 <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                                   <Settings className="w-4 h-4 md:w-5 md:h-5 text-white" />
                                 </div>
                                 <h2 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                                   Business Settings
                                 </h2>
                               </div>
                               <button
                                 onClick={() => setShowSettings(false)}
                                 className="group p-1.5 md:p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all duration-300"
                               >
                                 <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                               </button>
                             </div>
                           </div>
         
                           <div className="overflow-auto p-4 md:p-6 bg-gradient-to-b from-slate-300 to-slate-400 flex-1">
                             <div className="space-y-4 md:space-y-6">
                               {/* Logo Upload */}
                               <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 border-2 border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
                                 <label className="block text-sm font-bold text-slate-700 mb-3">
                                   Business Logo
                                 </label>
                                 <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6">
                                   {businessInfo.logoUrl ? (
                                     <div className="relative group">
                                       <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl opacity-20 group-hover:opacity-40 blur-xl transition-opacity duration-300"></div>
                                       <img
                                         src={businessInfo.logoUrl}
                                         alt="Business Logo"
                                         className="relative w-20 h-20 md:w-24 md:h-24 object-contain border-2 border-slate-200 rounded-xl shadow-lg"
                                       />
                                     </div>
                                   ) : (
                                     <div className="w-20 h-20 md:w-24 md:h-24 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 hover:border-blue-400 transition-all duration-300">
                                       <Upload className="w-6 h-6 md:w-8 md:h-8 text-slate-400" />
                                     </div>
                                   )}
         
                                   <div className="flex-1 text-center sm:text-left">
                                     <input
                                       type="file"
                                       accept="image/*"
                                       onChange={handleLogoUpload}
                                       className="hidden"
                                       id="logo-upload"
                                     />
                                     <label
                                       htmlFor="logo-upload"
                                       className="inline-block px-4 md:px-5 py-2 md:py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg md:rounded-xl hover:from-blue-700 hover:to-purple-700 cursor-pointer font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-sm md:text-base"
                                     >
                                       {businessInfo.logoUrl
                                         ? "Change Logo"
                                         : "Upload Logo"}
                                     </label>
                                     <p className="text-xs text-slate-500 mt-2 md:mt-3 flex items-center justify-center sm:justify-start space-x-1">
                                       <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                                       <span>Recommended: Square image, max 5MB</span>
                                     </p>
                                   </div>
                                 </div>
                               </div>
         
                               {/* Business Name */}
                               <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 border-2 border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
                                 <label className="block text-sm font-bold text-slate-700 mb-2 md:mb-3">
                                   Business Name
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
                                   className="w-full px-3 md:px-4 py-2 md:py-3 border-2 border-slate-200 rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 font-medium text-sm md:text-base"
                                   placeholder="Solidflo Invoicing Saas"
                                 />
                               </div>
         
                               {/* Address Fields */}
                               <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 border-2 border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
                                 <label className="block text-sm font-bold text-slate-700 mb-2 md:mb-3">
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
                                   className="w-full px-3 md:px-4 py-2 md:py-3 border-2 border-slate-200 rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-sm md:text-base"
                                   placeholder="9-10 CNR THIRD & ARKWRIGHT AVENUE"
                                 />
                               </div>
         
                               <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 border-2 border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
                                 <label className="block text-sm font-bold text-slate-700 mb-2 md:mb-3">
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
                                   className="w-full px-3 md:px-4 py-2 md:py-3 border-2 border-slate-200 rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-sm md:text-base"
                                   placeholder="WYNBERG"
                                 />
                               </div>
         
                               {/* City and Postal Code */}
                               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                                 <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 border-2 border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
                                   <label className="block text-sm font-bold text-slate-700 mb-2 md:mb-3">
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
                                     className="w-full px-3 md:px-4 py-2 md:py-3 border-2 border-slate-200 rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-sm md:text-base"
                                     placeholder="SANDTON"
                                   />
                                 </div>
         
                                 <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 border-2 border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
                                   <label className="block text-sm font-bold text-slate-700 mb-2 md:mb-3">
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
                                     className="w-full px-3 md:px-4 py-2 md:py-3 border-2 border-slate-200 rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-sm md:text-base"
                                     placeholder="2090"
                                   />
                                 </div>
                               </div>
         
                               {/* Phone Numbers */}
                               <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 border-2 border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
                                 <label className="block text-sm font-bold text-slate-700 mb-2 md:mb-3">
                                   Primary Phone <span className="text-red-500">*</span>
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
                                   className="w-full px-3 md:px-4 py-2 md:py-3 border-2 border-slate-200 rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-sm md:text-base"
                                   placeholder="082 514 4509"
                                   required
                                 />
                               </div>
         
                               <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 border-2 border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
                                 <label className="block text-sm font-bold text-slate-700 mb-2 md:mb-3">
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
                                   className="w-full px-3 md:px-4 py-2 md:py-3 border-2 border-slate-200 rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-sm md:text-base"
                                   placeholder="084 583 9929"
                                 />
                               </div>
         
                               {/* Bank Details Section */}
                               <div className="border-t-2 border-slate-200 pt-4 md:pt-6 mt-4 md:mt-6">
                                 <div className="flex items-center space-x-2 md:space-x-3 mb-4 md:mb-6">
                                   <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl flex items-center justify-center shadow-lg">
                                     <CreditCard className="w-4 h-4 md:w-5 md:h-5 text-white" />
                                   </div>
                                   <h3 className="text-lg md:text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                                     Bank Details
                                   </h3>
                                 </div>
         
                                 <div className="space-y-3 md:space-y-4">
                                   <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 border-2 border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
                                     <label className="block text-sm font-bold text-slate-700 mb-2 md:mb-3">
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
                                       className="w-full px-3 md:px-4 py-2 md:py-3 border-2 border-slate-200 rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-sm md:text-base"
                                     />
                                   </div>
         
                                   <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 border-2 border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
                                     <label className="block text-sm font-bold text-slate-700 mb-2 md:mb-3">
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
                                       className="w-full px-3 md:px-4 py-2 md:py-3 border-2 border-slate-200 rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-sm md:text-base"
                                     />
                                   </div>
         
                                   <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 border-2 border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
                                     <label className="block text-sm font-bold text-slate-700 mb-2 md:mb-3">
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
                                       className="w-full px-3 md:px-4 py-2 md:py-3 border-2 border-slate-200 rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-sm md:text-base"
                                     />
                                   </div>
         
                                   <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 border-2 border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
                                     <label className="block text-sm font-bold text-slate-700 mb-2 md:mb-3">
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
                                       className="w-full px-3 md:px-4 py-2 md:py-3 border-2 border-slate-200 rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-sm md:text-base"
                                     />
                                   </div>
                                 </div>
                               </div>
         
                               {/* Stamp Settings */}
                               <div className="border-t-2 border-slate-200 pt-4 md:pt-6 mt-4 md:mt-6">
                                 <div className="flex items-center space-x-2 md:space-x-3 mb-4 md:mb-6">
                                   <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center shadow-lg">
                                     <CheckSquare className="w-4 h-4 md:w-5 md:h-5 text-white" />
                                   </div>
                                   <h3 className="text-lg md:text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                                     📋 Invoice Stamp Settings
                                   </h3>
                                 </div>
         
                                 <div className="space-y-3 md:space-y-4">
                                   <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 border-2 border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
                                     <label className="flex items-center space-x-2 md:space-x-3 cursor-pointer group">
                                       <input
                                         type="checkbox"
                                         checked={stampSettings.enabled}
                                         onChange={(e) =>
                                           setStampSettings({
                                             ...stampSettings,
                                             enabled: e.target.checked,
                                           })
                                         }
                                         className="w-4 h-4 md:w-5 md:h-5 rounded-lg border-2 border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer transition-all duration-300"
                                       />
                                       <span className="text-xs md:text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors duration-300">
                                         Show approval stamp on invoices and quotes
                                       </span>
                                     </label>
                                   </div>
         
                                   {stampSettings.enabled && (
                                     <>
                                       <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 border-2 border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
                                         <label className="block text-sm font-bold text-slate-700 mb-2 md:mb-3">
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
                                           className="w-full px-3 md:px-4 py-2 md:py-3 border-2 border-slate-200 rounded-lg md:rounded-xl uppercase focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 font-bold text-sm md:text-base"
                                           placeholder="APPROVED"
                                           maxLength={15}
                                         />
                                         <p className="text-xs text-slate-500 mt-2 flex items-center space-x-1">
                                           <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                                           <span>Max 15 characters</span>
                                         </p>
                                       </div>
         
         
                                       <div className="bg-white rounded-xl p-6 border-2 border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
                                         <label className="block text-sm font-bold text-slate-700 mb-3">
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
                                           className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 font-semibold cursor-pointer"
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
         
                                       <div className="bg-white rounded-xl p-6 border-2 border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
                                         <label className="flex items-center space-x-3 cursor-pointer group">
                                           <input
                                             type="checkbox"
                                             checked={stampSettings.showDate}
                                             onChange={(e) =>
                                               setStampSettings({
                                                 ...stampSettings,
                                                 showDate: e.target.checked,
                                               })
                                             }
                                             className="w-5 h-5 rounded-lg border-2 border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer transition-all duration-300"
                                           />
                                           <span className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors duration-300">
                                             Include date on stamp
                                           </span>
                                         </label>
                                       </div>
         
                                       {/* Preview */}
                                       <div className="mt-6 p-8 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border-2 border-dashed border-slate-300">
                                         <p className="text-sm font-bold mb-6 text-center text-slate-600">
                                           Stamp Preview:
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
                                 className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] text-lg"
                               >
                                 💾 Save Business Information
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

          {/* Saved Work Orders List Modal */}
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
                          className="border rounded-lg p-4 hover:bg-gray-800 cursor-pointer transition-colors"
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
                                Property: {card.property?.type || ""} - {card.property?.address || "N/A"}
                              </div>
                              {card.property?.emergencyService && (
                                <span className="inline-block px-2 py-1 bg-red-100 text-red-700 text-xs rounded mt-1">
                                  EMERGENCY
                                </span>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-semibold text-blue-600">
                                R{card.totals?.total?.toFixed(2) || "0.00"}
                              </div>
                              <div className="text-sm text-gray-500">
                                {card.dates?.serviceDate
                                  ? new Date(
                                      card.dates.serviceDate
                                    ).toLocaleDateString("en-GB")
                                  : "N/A"}
                              </div>
                              <div
                                className={`text-xs mt-1 px-2 py-1 rounded ${
                                  card.status === "completed"
                                    ? "bg-green-100 text-green-700"
                                    : card.status === "pending"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-gray-100 text-gray-700"
                                }`}
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
            {activeView === "templates" && <Templates user={user} />}
            {activeView === "home" && <HomeView user={user} />}
                     {activeView === "invoice" && (
                       <>
          {/* Mobile View Work Order Button */}
          <button
            onClick={() => setShowJobCard(!showJobCard)}
            className="lg:hidden w-full mb-4 flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 text-gray-800 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FileText className="w-5 h-5" />
            {showJobCard ? "Hide Work Order" : "View Work Order"}
          </button>

          <div className="grid grid-cols-1 gap-6 px-4 sm:px-6 lg:px-8 xl:px-12">
            <div
              className={`${
                showJobCard ? "hidden" : "block"
              } space-y-6 lg:block print:hidden max-h-[calc(100vh-120px)] overflow-y-auto`}
            >
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
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-blue-700 text-sm font-medium">In Progress</span>
                <span className="text-blue-600">Started Today</span>
              </div>

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

            {/* Multi-Step Form */}
    <PlumbingMultiStepForm
      // Customer Info Props
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
      // Property Info Props
      propertyType={propertyType}
      setPropertyType={setPropertyType}
      propertyAddress={propertyAddress}
      setPropertyAddress={setPropertyAddress}
      accessDetails={accessDetails}
      setAccessDetails={setAccessDetails}
      emergencyService={emergencyService}
      setEmergencyService={setEmergencyService}
      // Items Props
      items={items}
      setItems={setItems}
      newItem={newItem}
      setNewItem={setNewItem}
      handleAddItem={handleAddItem}
    />

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Payment Terms</h2>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="text-sm font-medium">Cash/Card/Bank Transfer</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Payment Terms:</span>
                    <span className="text-sm font-medium">Due on Completion</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Warranty:</span>
                    <span className="text-sm font-medium">12 Months Parts & Labor</span>
                  </div>
                </div>
              </div>
              </>)}
            </div>

            <div
  id="print-area"
  className={`${!showJobCard ? "hidden lg:block" : "block"} mx-auto bg-white print:block`}
  style={{ width: "210mm", minHeight: "297mm" }}
>
              {activeView === 'invoice' && (
  <>
    {/* Add Template Selector */}
    <div className="mb-4 print:hidden">
      <TemplateSelector 
        user={user} 
        selectedTemplate={selectedTemplate}
        onTemplateChange={setSelectedTemplate}
      />
    </div>

    {/* Use Template Renderer instead of hardcoded invoice */}
    <TemplateRenderer
      templateId={selectedTemplate}
      businessInfo={businessInfo}
      loading={loading}
      jobCardNumber={jobCardNumber}
      customerName={customerName}
      customerEmail={customerEmail}
      customerPhone={customerPhone}
      customerAddress={customerAddress}
      propertyType={propertyType}
      propertyAddress={propertyAddress}
      accessDetails={accessDetails}
      emergencyService={emergencyService}
      items={items}
      subtotal={subtotal}
      vat={vat}
      total={total}
      documentType="plumbing"
      serviceType="PLUMBING"
    />
  </>
)}
            </div>

           
          </div>
         </>)}  
        </div>
      </div>
      </div>
    </div>
  );
};

export default PlumbingDashboard;