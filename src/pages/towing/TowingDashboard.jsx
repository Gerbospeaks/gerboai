import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import HomeView from "../HomeView";
import { serverTimestamp } from "firebase/firestore";
import logo from "../../assets/img/solidflo-logo.png";
import v8logo from "../../assets/img/v8-logo.png";
import { getAuth, signOut } from "firebase/auth";
import FinancialOverview from "../FinancialOverview";
import Vehicles from "./Vehicles";
import PartsInventory from "./PartsInventory";
import uploadLogoToR2 from "../../utils/uploadLogoToR2";
import Templates from "./Templates";
import TemplateSelector, { TemplateRenderer } from "./TemplateSelector";
import PaymentProcessor from "../../components/dashboard/PaymentProcessor";
import PaymentReceipt from "../../components/dashboard/PaymentReceipt";
import { getFunctions, httpsCallable } from 'firebase/functions';
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
import { Printer, Download, Sparkles } from "lucide-react";
import { db } from "../../firebase";
import CustomerModal from "../CustomerModal";
import CustomersListModal from "../CustomersListModal";
import HistoryView from "./HistoryView";
import NotesView from "./NotesView";
import { logHistory } from "./historyLogger";
import SignatureStamp from "./SignatureStamp";
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
  Wallet,
  PieChart,
  Car,
  ClipboardList,
  Package,
  Tool,
  Upload,
  Eye,
  EyeOff,
  Search,
  Filter,
  MoreVertical,
} from "lucide-react";

const generateServiceCallNumber = async (userId, documentType) => {
  const db = getFirestore();
  const year = new Date().getFullYear();

  const collectionName = documentType === "quote" ? "quotations" : "invoices";
  const prefix = documentType === "quote" ? "QT" : "JC";

  const jobCardsRef = collection(db, "users", userId, collectionName);
  const q = query(jobCardsRef, orderBy("createdAt", "desc"), limit(1));
  const snapshot = await getDocs(q);

  let lastNumber = 891;

  if (!snapshot.empty) {
    const lastJobCard = snapshot.docs[0].data();
    const match = lastJobCard.jobCardNumber?.match(/(\d+)$/);

    if (match) {
      lastNumber = Number(match[1]);
    }
  }

  const nextNumber = lastNumber + 1;
  return `${prefix}-${year}-${String(nextNumber).padStart(4, "0")}`;
};
const functions = getFunctions();
const TowingDashboard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("JobCard");
  const [showJobCard, setShowJobCard] = useState(false);
  const { user, authUser } = useAuth();
  const [jobCardNumber, setJobCardNumber] = useState("");
  const [jobCardId, setJobCardId] = useState(null);
  const [savedJobCards, setSavedJobCards] = useState([]);
  const [showJobCardsList, setShowJobCardsList] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCustomersList, setShowCustomersList] = useState(false);
  const [activeView, setActiveView] = useState("home");
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
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState(null);
  const [towLocation, setTowLocation] = useState(""); // Pickup location
const [destination, setDestination] = useState(""); // Drop-off location
const [towDistance, setTowDistance] = useState(""); // Distance in km
const [towType, setTowType] = useState("Flatbed"); // Type of tow
const [vehicleCondition, setVehicleCondition] = useState(""); // Driveable/Non-driveable
const [incidentType, setIncidentType] = useState("");
  const [useAI, setUseAI] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  const [stampSettings, setStampSettings] = useState({
    text: "APPROVED",
    color: "#d32f2f",
    showDate: false,
    enabled: false,
  });

  const handleRemoveItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const [paymentStatus, setPaymentStatus] = useState({
    totalPaid: 0,
    balanceDue: 0,
    status: "pending",
  });

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const [documentType, setDocumentType] = useState("invoice");

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

    if (extractedData.items && extractedData.items.length > 0) {
      setItems(extractedData.items);
    }

    alert("✅ Data extracted and populated successfully!");
  };
const handleTestEmail = async () => {
  if (!businessInfo.emailPassword) {
    alert('⚠️ Please enter your email app password first.');
    return;
  }

  const userEmail = user?.email || authUser?.email;
  
  if (!userEmail) {
    alert('⚠️ Could not find your email address. Please log in again.');
    return;
  }

  try {
    const testEmailData = {
      userId: user.uid,
      to: userEmail, // Send test to self
      subject: '✅ Test Email - Email Configuration Successful',
      message: `
Hello,

This is a test email from your construction quote/invoice system.

✓ Your email configuration is working correctly!

Account Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Business: ${businessInfo.businessName}
Email: ${userEmail}
Provider: ${businessInfo.emailProvider || 'Gmail'}
Date: ${new Date().toLocaleString()}

You can now send quotes and invoices to your clients from this email address.

Best regards,
Your Construction Quote System
      `.trim(),
      documentType: 'test',
      documentNumber: 'TEST-001',
    };

    const sendEmail = httpsCallable(functions, 'sendQuoteEmail');
    await sendEmail(testEmailData);
    
    alert(`✅ Test email sent successfully!\n\nCheck your inbox at: ${userEmail}`);
  } catch (error) {
    console.error('Test email error:', error);
    
    let errorMsg = '❌ Test email failed!\n\n';
    if (error.message.includes('Invalid login')) {
      errorMsg += 'Your app password is incorrect. Please check and try again.\n\nMake sure you\'re using an APP PASSWORD, not your regular password.';
    } else {
      errorMsg += `Error: ${error.message}\n\nPlease check your app password and try again.`;
    }
    
    alert(errorMsg);
  }
};
  useEffect(() => {
    if (!user?.uid) return;

    const loadJobCardNumber = async () => {
      const nextJobCard = await generateServiceCallNumber(user.uid, documentType);
      setJobCardNumber(nextJobCard);
    };

    loadJobCardNumber();
    loadSavedJobCards();
  }, [user, documentType]);

  // Responsive detection
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      
      // Auto-open sidebar on desktop
      if (width >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const steps = [
  { number: 1, title: "Customer Info", icon: Users },
  { number: 2, title: "Bill To", icon: Users },
  { number: 3, title: "Vehicle & Tow Details", icon: Car }, // CHANGED
  { number: 4, title: "Service Charges", icon: FileText }, // CHANGED
  { number: 5, title: "Payment Terms", icon: CreditCard },
];

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
      console.error("Error loading customers:", error);
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
    const collectionName = documentType === "quote" ? "quotations" : "invoices";
    const jobCardsRef = collection(db, "users", user.uid, collectionName);
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
    setCustomerId(customer.merchant_code || "");
    setBillName(customer.name || "");
    setBillEmail(customer.email || "");
    setBillPhone(customer.phone || "");
    setBillAddress(customer.address || "");
    setCustomerId(customer.merchant_code || "");
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
    setCustomerName(jobCard.customer?.name || "");
    setCustomerEmail(jobCard.customer?.email || "");
    setCustomerPhone(jobCard.customer?.phone || "");
    setCustomerAddress(jobCard.customer?.address || "");
    setCustomerId(jobCard.customer?.merchant_code || "");
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
        merchant_code: merchant_code || `CUST-${Date.now()}`,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
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
    const collectionName = documentType === "quote" ? "quotations" : "invoices";
    const snap = await getDoc(
      doc(db, "users", user.uid, collectionName, jobCardId),
    );

    return snap.exists() ? snap.data() : null;
  };

  const handleSavePDF = async () => {
    const savedJobCard = await loadJobCardForExport();

    if (!savedJobCard) {
      alert(`Please save the ${documentType} before exporting PDF`);
      return;
    }

    setJobCardNumber(savedJobCard.jobCardNumber);
    setItems(savedJobCard.items);
    setCustomerName(savedJobCard.customer.name);
    setCustomerEmail(savedJobCard.customer.email);
    setCustomerPhone(savedJobCard.customer.phone);
    setCustomerAddress(savedJobCard.customer.address);
    setVehicleMake(savedJobCard.vehicle.make);
    setVehicleModel(savedJobCard.vehicle.model);
    setVehicleYear(savedJobCard.vehicle.year);
    setVehicleReg(savedJobCard.vehicle.registration);

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

  const [customerName, setCustomerName] = useState("");
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
  const [vehicleMake, setVehicleMake] = useState("");
  const [vehicleModel, setVehicleModel] = useState("Hilux");
  const [vehicleYear, setVehicleYear] = useState("2020");
  const [vehicleReg, setVehicleReg] = useState("ABC 123 GP");
  const [vehicleVin, setVehicleVin] = useState("1HGBH41JXMN109186");
  const [vehicleMileage, setVehicleMileage] = useState("45000");
  const [preAuth, setPreAuth] = useState("AUTH123");
  const [authCode, setAuthCode] = useState("456789");

  const [businessInfo, setBusinessInfo] = useState({
    businessName: "YOUR TOWING COMPANY NAME",
    addressLine1: "9-10 CNR THIRD & ARKWRIGHT AVENUE",
    addressLine2: "WYNBERG",
    city: "SANDTON",
    postalCode: "2090",
    primaryPhone: "082 514 4509",
    secondaryPhone: "084 583 9929",
    logoUrl: "",
  });

  const tabViewMap = {
    JobCard: "invoice",
    Parts: "parts-inventory",
    History: "history-view",
    Notes: "notes-view",
  };

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
        const data = docSnap.data();
        setBusinessInfo(docSnap.data());
        if (data.stampSettings) {
          setStampSettings(data.stampSettings);
        }
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
      setBusinessInfo((prev) => ({ ...prev, uploading: true }));

      const logoUrl = await uploadLogoToR2(file, authUser);

      setBusinessInfo((prev) => ({
        ...prev,
        logoUrl,
        uploading: false,
      }));

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
      await setDoc(docRef, { ...businessInfo, stampSettings });
      alert("Business information saved successfully!");
      setShowSettings(false);
    } catch (error) {
      console.error("Error saving business info:", error);
      alert("Failed to save business information");
    }
  };

  const handlePrint = () => {
    const styleSheet = document.createElement("style");
    styleSheet.textContent = printStyles;
    document.head.appendChild(styleSheet);

    window.print();

    setTimeout(() => {
      document.head.removeChild(styleSheet);
    }, 1000);
  };

  const printStyles = `
    @media print {
      body * {
        visibility: hidden !important;
      }
      
      #print-area,
      #print-area * {
        visibility: visible !important;
      }
      
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
        transform: none !important;
      }
      
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
      
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
      }
      
      .logo img {
        height: 60px;
        width: auto;
      }
      
      .shadow-lg, .rounded-lg, .shadow-xl, .shadow-2xl {
        border: none !important;
        box-shadow: none !important;
      }
      
      table, tr, td, th, div {
        page-break-inside: avoid !important;
      }
      
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
    qty: "",
    type: "Labor",
  });

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const vat = subtotal * 0.0;
  const total = subtotal + vat;

  useEffect(() => {
    if (!jobCardId) {
      setPaymentStatus({
        totalPaid: 0,
        balanceDue: total,
        status: "pending",
      });
    }
  }, [total, jobCardId]);

  const buildJobCardPayload = (numberToUse) => ({
  jobCardNumber: numberToUse,
  locked: true,
  status: "pending",
  documentType: documentType,

  dates: {
    serviceDate: new Date().toISOString(),
    completedDate: null,
  },

  customer: {
    name: customerName,
    email: customerEmail,
    phone: customerPhone,
    address: customerAddress,
    merchant_code: merchant_code,
  },

  vehicle: {
    make: vehicleMake,
    model: vehicleModel,
    year: vehicleYear,
    registration: vehicleReg,
    vin: vehicleVin,
    mileage: vehicleMileage,
  },

  // ADD THIS SECTION:
  towingDetails: {
    pickupLocation: towLocation,
    destination: destination,
    distance: towDistance,
    towType: towType,
    vehicleCondition: vehicleCondition,
    incidentType: incidentType,
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
      numberToUse = await generateServiceCallNumber(user.uid, documentType);
      setJobCardNumber(numberToUse);
    }

    const jobCardData = buildJobCardPayload(numberToUse);

    const collectionName = documentType === "quote" ? "quotations" : "invoices";

    if (jobCardId) {
      await updateDoc(doc(db, "users", user.uid, collectionName, jobCardId), {
        ...jobCardData,
        updatedAt: serverTimestamp(),
      });
    } else {
      const ref = await addDoc(
        collection(db, "users", user.uid, collectionName),
        jobCardData,
      );
      setJobCardId(ref.id);
    }

    alert(
      `${documentType === "quote" ? "Quote" : "Job card"} saved and locked`,
    );
    loadSavedJobCards();
  };

  const handleConvertToInvoice = async () => {
    if (!user?.uid) return;

    if (!jobCardId) {
      alert("Please save the quote first before converting to invoice");
      return;
    }

    if (
      !window.confirm(
        "Convert this quote to an invoice? This will create a new invoice with the same details.",
      )
    ) {
      return;
    }

    try {
      const db = getFirestore();

      const newInvoiceNumber = await generateServiceCallNumber(user.uid, "invoice");

      const invoiceData = buildJobCardPayload(newInvoiceNumber);
      invoiceData.documentType = "invoice";
      invoiceData.convertedFromQuote = jobCardId;
      invoiceData.convertedFromQuoteNumber = jobCardNumber;
      invoiceData.convertedAt = serverTimestamp();

      const invoiceRef = await addDoc(
        collection(db, "users", user.uid, "invoices"),
        invoiceData,
      );

      await updateDoc(doc(db, "users", user.uid, "quotations", jobCardId), {
        convertedToInvoice: true,
        convertedToInvoiceId: invoiceRef.id,
        convertedToInvoiceNumber: newInvoiceNumber,
        convertedAt: serverTimestamp(),
        status: "converted",
      });

      setDocumentType("invoice");
      setJobCardId(invoiceRef.id);
      setJobCardNumber(newInvoiceNumber);

      alert(`Quote successfully converted to Invoice ${newInvoiceNumber}`);
      loadSavedJobCards();
    } catch (error) {
      console.error("Error converting quote to invoice:", error);
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

    const loadNewNumber = async () => {
      if (user?.uid) {
        const nextJobCard = await generateServiceCallNumber(user.uid, documentType);
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
    <div className="flex h-screen w-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-hidden">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Collapsed Sidebar (Icon Only) - Enhanced for Mobile */}
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

          {/* Icon Navigation - Simplified for mobile */}
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
              className="group relative p-2 md:p-3 text-slate-400 hover:text-white rounded-xl transition-all duration-300 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center overflow-hidden"
              title="Settings"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Settings className="w-5 h-5 md:w-6 md:h-6 relative z-10 group-hover:rotate-90 transition-transform duration-500" />
            </button>

            {/* More compact icons for mobile */}
            {!isMobile && (
              <>
                <button
                  onClick={() => setActiveView("financial-overview")}
                  className="group relative p-2 md:p-3 text-slate-400 hover:text-white rounded-xl transition-all duration-300 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center overflow-hidden"
                  title="Business Overview"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <TrendingUp className="w-5 h-5 md:w-6 md:h-6 relative z-10 group-hover:scale-110 transition-transform duration-300" />
                </button>

                <button
                  onClick={() => {
                    handleNewInvoice();
                    setActiveView("invoice");
                  }}
                  className="group relative p-2 md:p-3 text-slate-400 hover:text-white rounded-xl transition-all duration-300 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center overflow-hidden"
                  title="Job Cards"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <ClipboardList className="w-5 h-5 md:w-6 md:h-6 relative z-10 group-hover:scale-110 transition-transform duration-300" />
                </button>

                <button
                  onClick={() => setShowCustomersListModal(true)}
                  className="group relative p-2 md:p-3 text-slate-400 hover:text-white rounded-xl transition-all duration-300 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center overflow-hidden"
                  title="Customers"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <Users className="w-5 h-5 md:w-6 md:h-6 relative z-10 group-hover:scale-110 transition-transform duration-300" />
                </button>
              </>
            )}
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

      {/* Expanded Sidebar - Improved Mobile Layout */}
      <div
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed z-50 w-64 md:w-72 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700/50 transition-transform duration-300 h-full print:hidden shadow-2xl overflow-y-auto`}
      >
        <div className="p-4 md:p-6">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl opacity-20 group-hover:opacity-40 blur-xl transition-opacity duration-300"></div>
                <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 p-1 rounded-xl shadow-lg">
                  <img
                    src={logo}
                    alt="Business Logo"
                    className="w-12 h-10 md:w-16 md:h-12 object-contain rounded-lg bg-white/10"
                  />
                </div>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="group p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-xl transition-all duration-300 hover:rotate-90"
              title="Collapse Sidebar"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>

          <nav className="space-y-1.5 md:space-y-2">
            {/* Home */}
            <div
  onClick={() => {setActiveView("home"); setSidebarOpen(false);}}
  className="group flex items-center space-x-2 md:space-x-3 px-3 md:px-4 py-2.5 md:py-3 text-cyan-300 hover:text-white hover:bg-gradient-to-r hover:from-stone-600/20 hover:to-stone-700/20 rounded-xl cursor-pointer transition-all duration-300 border border-transparent hover:border-cyan-500/30"
>
  <Home className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
  <span className="text-xs md:text-sm font-semibold">Home</span>
</div>

            {/* Settings */}
            <div
              onClick={() => {setShowSettings(true); setSidebarOpen(false);}}
              className="group flex items-center space-x-2 md:space-x-3 px-3 md:px-4 py-2.5 md:py-3 text-slate-300 hover:text-white hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-purple-700/20 rounded-xl cursor-pointer transition-all duration-300 border border-transparent hover:border-purple-500/30"
            >
              <Settings className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0 group-hover:rotate-90 transition-transform duration-500" />
              <span className="text-xs md:text-sm font-semibold">Settings</span>
            </div>

            {/* Business Overview */}
            <div className="pt-3 md:pt-4 mt-3 md:mt-4 border-t border-slate-700/50">
              <div
                onClick={() => {setActiveView("financial-overview"); setSidebarOpen(false);}}
                className="group flex items-center space-x-2 md:space-x-3 px-3 md:px-4 py-2.5 md:py-3 text-slate-300 hover:text-white hover:bg-gradient-to-r hover:from-emerald-600/20 hover:to-emerald-700/20 rounded-xl cursor-pointer transition-all duration-300 border border-transparent hover:border-emerald-500/30"
              >
                <TrendingUp className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                <span className="text-xs md:text-sm font-semibold truncate">Towing Operations</span>
              </div>

              {/* Job Cards Section */}
              <div className="mt-2 md:mt-3">
                <div className="group flex items-center justify-between px-3 md:px-4 py-2.5 md:py-3 text-slate-300 hover:text-white hover:bg-gradient-to-r hover:from-orange-600/20 hover:to-orange-700/20 rounded-xl cursor-pointer transition-all duration-300 border border-transparent hover:border-orange-500/30">
                  <div className="flex items-center space-x-2 md:space-x-3 min-w-0">
                    <ClipboardList className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                    <span className="text-xs md:text-sm font-semibold truncate">Job Cards</span>
                  </div>
                  <ChevronDown className="w-4 h-4 flex-shrink-0 group-hover:translate-y-0.5 transition-transform duration-300" />
                </div>

                {/* Submenu - More compact on mobile */}
                <div className="ml-4 md:ml-6 mt-1.5 md:mt-2 space-y-1 border-l-2 border-slate-700/50 pl-3 md:pl-4">
                  <div
                    onClick={() => {
                      handleNewQuote();
                      setActiveView("invoice");
                      if (isMobile) setSidebarOpen(false);
                    }}
                    className="group px-2 md:px-3 py-2 md:py-2.5 text-xs md:text-sm text-slate-400 hover:text-white hover:bg-slate-700/30 rounded-lg cursor-pointer transition-all duration-300 flex items-center space-x-2"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0 group-hover:scale-150 transition-transform duration-300"></div>
                    <span className="truncate">Create Quote</span>
                  </div>
                  <div
                    onClick={() => {
                      handleNewInvoice();
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
                      setShowJobCardsList(!showJobCardsList);
                      if (isMobile) setSidebarOpen(false);
                    }}
                    className="group px-2 md:px-3 py-2 md:py-2.5 text-xs md:text-sm text-slate-400 hover:text-white hover:bg-slate-700/30 rounded-lg cursor-pointer transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 min-w-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500 flex-shrink-0 group-hover:scale-150 transition-transform duration-300"></div>
                       <span className="truncate">All {documentType === "quote" ? "Estimates" : "Service Calls"}</span>
                      </div>
                      <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-2 py-0.5 md:px-2.5 md:py-1 rounded-full text-xs font-bold shadow-lg flex-shrink-0 ml-2">
                        {savedJobCards.length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customers Section */}
              <div className="mt-2 md:mt-3">
                <div className="group flex items-center justify-between px-3 md:px-4 py-2.5 md:py-3 text-slate-300 hover:text-white hover:bg-gradient-to-r hover:from-pink-600/20 hover:to-pink-700/20 rounded-xl cursor-pointer transition-all duration-300 border border-transparent hover:border-pink-500/30">
                  <div className="flex items-center space-x-2 md:space-x-3 min-w-0">
                    <Users className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                    <span className="text-xs md:text-sm font-semibold truncate">Customers</span>
                  </div>
                  <ChevronDown className="w-4 h-4 flex-shrink-0 group-hover:translate-y-0.5 transition-transform duration-300" />
                </div>

                <div className="ml-4 md:ml-6 mt-1.5 md:mt-2 space-y-1 border-l-2 border-slate-700/50 pl-3 md:pl-4">
                  <div
                    onClick={() => {
                      handleAddNewCustomer();
                      if (isMobile) setSidebarOpen(false);
                    }}
                    className="group px-2 md:px-3 py-2 md:py-2.5 text-xs md:text-sm text-slate-400 hover:text-white hover:bg-slate-700/30 rounded-lg cursor-pointer transition-all duration-300 flex items-center space-x-2"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0 group-hover:scale-150 transition-transform duration-300"></div>
                    <span className="truncate">Add Customer</span>
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
                        <span className="truncate">All Customers</span>
                      </div>
                      <span className="bg-gradient-to-r from-pink-600 to-purple-600 text-white px-2 py-0.5 md:px-2.5 md:py-1 rounded-full text-xs font-bold shadow-lg flex-shrink-0 ml-2">
                        {savedCustomers.length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Menu Items - Hidden on mobile to save space */}
              {!isMobile && (
                <>
                  <div
                    onClick={() => {setActiveView("templates"); setSidebarOpen(false);}}
                    className="group flex items-center space-x-2 md:space-x-3 px-3 md:px-4 py-2.5 md:py-3 text-slate-300 hover:text-white hover:bg-gradient-to-r hover:from-indigo-600/20 hover:to-indigo-700/20 rounded-xl cursor-pointer transition-all duration-300 mt-2 border border-transparent hover:border-indigo-500/30"
                  >
                    <FileText className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                    <span className="text-xs md:text-sm font-semibold truncate">Invoice Templates</span>
                  </div>

                  <div
                    onClick={() => {setActiveView("vehicles"); setSidebarOpen(false);}}
                    className="group flex items-center space-x-2 md:space-x-3 px-3 md:px-4 py-2.5 md:py-3 text-slate-300 hover:text-white hover:bg-gradient-to-r hover:from-cyan-600/20 hover:to-cyan-700/20 rounded-xl cursor-pointer transition-all duration-300 border border-transparent hover:border-cyan-500/30"
                  >
                    <Car className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                    <span className="text-xs md:text-sm font-semibold truncate">Vehicles</span>
                  </div>

                 
                </>
              )}
            </div>
          </nav>
        </div>

        {/* User Profile at Bottom - Compact on mobile */}
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

      {/* Main Content Area */}
      <div
        className={`flex-1 transition-all duration-300 ${sidebarOpen ? "ml-0 lg:ml-72" : "ml-2 md:ml-20"}`}
      >
        <div className="flex flex-col h-screen">
         
                    {/* ── Scrollable Main Content ──────────────────────────────── */}
                   <div className="flex-1 overflow-y-auto pr-4 md:pr-6 lg:pr-8">
            {/* All your existing modals and content... */}
            {/* Settings Modal */}
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
                          placeholder="YOUR TOWING COMPANY NAME"
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
                         {/* Email Configuration Section */}
                         <div className="border-t-2 border-slate-200 pt-4 md:pt-6 mt-4 md:mt-6">
                           <div className="flex items-center space-x-2 md:space-x-3 mb-4 md:mb-6">
                             <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                               <Send className="w-4 h-4 md:w-5 md:h-5 text-white" />
                             </div>
                             <h3 className="text-lg md:text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                               Email Configuration
                             </h3>
                           </div>
                         
                           <div className="space-y-3 md:space-y-4">
                             <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                               <p className="text-sm text-blue-800">
                                 <strong>📧 Your Sending Email:</strong> {user?.email || authUser?.email}
                               </p>
                               <p className="text-xs text-blue-600 mt-2">
                                 Quotes and invoices will be sent from this email address.
                               </p>
                             </div>
                         
                             <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 border-2 border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
                               <label className="block text-sm font-bold text-slate-700 mb-2 md:mb-3">
                                 Email Provider
                               </label>
                               <select
                                 value={businessInfo.emailProvider || 'gmail'}
                                 onChange={(e) =>
                                   setBusinessInfo({
                                     ...businessInfo,
                                     emailProvider: e.target.value,
                                   })
                                 }
                                 className="w-full px-3 md:px-4 py-2 md:py-3 border-2 border-slate-200 rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-sm md:text-base"
                               >
                                 <option value="gmail">Gmail</option>
                                 <option value="outlook">Outlook/Hotmail</option>
                                 <option value="yahoo">Yahoo Mail</option>
                                 <option value="other">Other SMTP</option>
                               </select>
                             </div>
                         
                             <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 border-2 border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
                               <label className="block text-sm font-bold text-slate-700 mb-2 md:mb-3">
                                 Email App Password <span className="text-red-500">*</span>
                               </label>
                               <input
                                 type="password"
                                 value={businessInfo.emailPassword || ''}
                                 onChange={(e) =>
                                   setBusinessInfo({
                                     ...businessInfo,
                                     emailPassword: e.target.value,
                                   })
                                 }
                                 className="w-full px-3 md:px-4 py-2 md:py-3 border-2 border-slate-200 rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-sm md:text-base font-mono"
                                 placeholder="••••••••••••••••"
                               />
                               <p className="text-xs text-slate-500 mt-2">
                                 <strong>⚠️ Security Note:</strong> Use an App Password, not your regular login password
                               </p>
                             </div>
                         
                             {/* Gmail Setup Instructions */}
                             {(businessInfo.emailProvider === 'gmail' || !businessInfo.emailProvider) && (
                               <div className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 rounded-xl p-4">
                                 <h4 className="font-bold text-red-900 mb-2 flex items-center gap-2">
                                   <span>📖</span> How to Get Gmail App Password:
                                 </h4>
                                 <ol className="text-xs md:text-sm text-red-800 space-y-1 ml-4 list-decimal">
                                   <li>Go to <strong>myaccount.google.com</strong></li>
                                   <li>Click <strong>Security</strong> in the left menu</li>
                                   <li>Enable <strong>2-Step Verification</strong> (if not already enabled)</li>
                                   <li>Search for <strong>"App passwords"</strong> in the search bar</li>
                                   <li>Click <strong>App passwords</strong></li>
                                   <li>Enter your Google password if prompted</li>
                                   <li>In the "App name" field, type <strong>"Construction Quotes"</strong></li>
                                   <li>Click <strong>Create</strong></li>
                                   <li>Copy the 16-character password (shown in yellow box)</li>
                                   <li>Paste it in the field above</li>
                                 </ol>
                                 
                                  <a href="https://support.google.com/accounts/answer/185833"
                                   target="_blank"
                                   rel="noopener noreferrer"
                                   className="inline-block mt-3 text-xs md:text-sm text-blue-600 hover:text-blue-800 font-semibold underline">
                                 
                                   📺 View Video Tutorial →
                                 </a>
                               </div>
                             )}
                         
                             {/* Outlook Setup Instructions */}
                             {businessInfo.emailProvider === 'outlook' && (
                               <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-4">
                                 <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                                   <span>📖</span> How to Get Outlook App Password:
                                 </h4>
                                 <ol className="text-xs md:text-sm text-blue-800 space-y-1 ml-4 list-decimal">
                                   <li>Go to <strong>account.microsoft.com/security</strong></li>
                                   <li>Sign in with your Outlook account</li>
                                   <li>Click <strong>Advanced security options</strong></li>
                                   <li>Under "Additional security", click <strong>App passwords</strong></li>
                                   <li>Click <strong>Create a new app password</strong></li>
                                   <li>Copy the generated password</li>
                                   <li>Paste it in the field above</li>
                                 </ol>
                                 
                                  <a href="https://support.microsoft.com/en-us/account-billing/manage-app-passwords-for-two-step-verification-d6dc8c6d-4bf7-4851-ad95-6d07799387e9"
                                   target="_blank"
                                   rel="noopener noreferrer"
                                   className="inline-block mt-3 text-xs md:text-sm text-blue-600 hover:text-blue-800 font-semibold underline"
                                 >
                                   📺 View Microsoft Instructions →
                                 </a>
                               </div>
                             )}
                         
                             {/* Test Email Button */}
                             <button
                               onClick={handleTestEmail}
                               disabled={!businessInfo.emailPassword}
                               className={`w-full px-4 py-3 rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-2 ${
                                 !businessInfo.emailPassword
                                   ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                   : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'
                               }`}
                             >
                               <Send className="w-4 h-4" />
                               {businessInfo.emailPassword ? 'Send Test Email' : 'Enter App Password First'}
                             </button>
                           </div>
                         </div>{/* Email Configuration Section */}
                         <div className="border-t-2 border-slate-200 pt-4 md:pt-6 mt-4 md:mt-6">
                           <div className="flex items-center space-x-2 md:space-x-3 mb-4 md:mb-6">
                             <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                               <Send className="w-4 h-4 md:w-5 md:h-5 text-white" />
                             </div>
                             <h3 className="text-lg md:text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                               Email Configuration
                             </h3>
                           </div>
                         
                           <div className="space-y-3 md:space-y-4">
                             <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                               <p className="text-sm text-blue-800">
                                 <strong>📧 Your Sending Email:</strong> {user?.email || authUser?.email}
                               </p>
                               <p className="text-xs text-blue-600 mt-2">
                                 Quotes and invoices will be sent from this email address.
                               </p>
                             </div>
                         
                             <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 border-2 border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
                               <label className="block text-sm font-bold text-slate-700 mb-2 md:mb-3">
                                 Email Provider
                               </label>
                               <select
                                 value={businessInfo.emailProvider || 'gmail'}
                                 onChange={(e) =>
                                   setBusinessInfo({
                                     ...businessInfo,
                                     emailProvider: e.target.value,
                                   })
                                 }
                                 className="w-full px-3 md:px-4 py-2 md:py-3 border-2 border-slate-200 rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-sm md:text-base"
                               >
                                 <option value="gmail">Gmail</option>
                                 <option value="outlook">Outlook/Hotmail</option>
                                 <option value="yahoo">Yahoo Mail</option>
                                 <option value="other">Other SMTP</option>
                               </select>
                             </div>
                         
                             <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 border-2 border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
                               <label className="block text-sm font-bold text-slate-700 mb-2 md:mb-3">
                                 Email App Password <span className="text-red-500">*</span>
                               </label>
                               <input
                                 type="password"
                                 value={businessInfo.emailPassword || ''}
                                 onChange={(e) =>
                                   setBusinessInfo({
                                     ...businessInfo,
                                     emailPassword: e.target.value,
                                   })
                                 }
                                 className="w-full px-3 md:px-4 py-2 md:py-3 border-2 border-slate-200 rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-sm md:text-base font-mono"
                                 placeholder="••••••••••••••••"
                               />
                               <p className="text-xs text-slate-500 mt-2">
                                 <strong>⚠️ Security Note:</strong> Use an App Password, not your regular login password
                               </p>
                             </div>
                         
                             {/* Gmail Setup Instructions */}
                             {(businessInfo.emailProvider === 'gmail' || !businessInfo.emailProvider) && (
                               <div className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 rounded-xl p-4">
                                 <h4 className="font-bold text-red-900 mb-2 flex items-center gap-2">
                                   <span>📖</span> How to Get Gmail App Password:
                                 </h4>
                                 <ol className="text-xs md:text-sm text-red-800 space-y-1 ml-4 list-decimal">
                                   <li>Go to <strong>myaccount.google.com</strong></li>
                                   <li>Click <strong>Security</strong> in the left menu</li>
                                   <li>Enable <strong>2-Step Verification</strong> (if not already enabled)</li>
                                   <li>Search for <strong>"App passwords"</strong> in the search bar</li>
                                   <li>Click <strong>App passwords</strong></li>
                                   <li>Enter your Google password if prompted</li>
                                   <li>In the "App name" field, type <strong>"Construction Quotes"</strong></li>
                                   <li>Click <strong>Create</strong></li>
                                   <li>Copy the 16-character password (shown in yellow box)</li>
                                   <li>Paste it in the field above</li>
                                 </ol>
                                 
                                  <a href="https://support.google.com/accounts/answer/185833"
                                   target="_blank"
                                   rel="noopener noreferrer"
                                   className="inline-block mt-3 text-xs md:text-sm text-blue-600 hover:text-blue-800 font-semibold underline">
                                 
                                   📺 View Video Tutorial →
                                 </a>
                               </div>
                             )}
                         
                             {/* Outlook Setup Instructions */}
                             {businessInfo.emailProvider === 'outlook' && (
                               <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-4">
                                 <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                                   <span>📖</span> How to Get Outlook App Password:
                                 </h4>
                                 <ol className="text-xs md:text-sm text-blue-800 space-y-1 ml-4 list-decimal">
                                   <li>Go to <strong>account.microsoft.com/security</strong></li>
                                   <li>Sign in with your Outlook account</li>
                                   <li>Click <strong>Advanced security options</strong></li>
                                   <li>Under "Additional security", click <strong>App passwords</strong></li>
                                   <li>Click <strong>Create a new app password</strong></li>
                                   <li>Copy the generated password</li>
                                   <li>Paste it in the field above</li>
                                 </ol>
                                 
                                  <a href="https://support.microsoft.com/en-us/account-billing/manage-app-passwords-for-two-step-verification-d6dc8c6d-4bf7-4851-ad95-6d07799387e9"
                                   target="_blank"
                                   rel="noopener noreferrer"
                                   className="inline-block mt-3 text-xs md:text-sm text-blue-600 hover:text-blue-800 font-semibold underline"
                                 >
                                   📺 View Microsoft Instructions →
                                 </a>
                               </div>
                             )}
                         
                             {/* Test Email Button */}
                             <button
                               onClick={handleTestEmail}
                               disabled={!businessInfo.emailPassword}
                               className={`w-full px-4 py-3 rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-2 ${
                                 !businessInfo.emailPassword
                                   ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                   : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'
                               }`}
                             >
                               <Send className="w-4 h-4" />
                               {businessInfo.emailPassword ? 'Send Test Email' : 'Enter App Password First'}
                             </button>
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

            <CustomerModal
              showModal={showCustomerModal}
              setShowModal={setShowCustomerModal}
              existingCustomer={selectedCustomer}
              onCustomerSaved={handleCustomerSaved}
            />
            {/* Payment Processor Modal */}
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
            {showJobCardsList && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
                  <div className="p-4 border-b flex items-center justify-between">
                    <h2 className="text-xl font-semibold">
                      Saved {documentType === "quote" ? "Quotes" : "Job Cards"}
                    </h2>
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
                        No saved{" "}
                        {documentType === "quote" ? "quotes" : "job cards"} yet
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
                              <div
                                onClick={() => loadJobCard(card)}
                                className="flex-1 cursor-pointer"
                              >
                                <div className="font-semibold text-lg">
                                  {card.jobCardNumber || "N/A"}
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                  Customer: {card.customer?.name || "N/A"}
                                </div>
                                <div className="text-sm text-gray-600">
                                  Vehicle: {card.vehicle?.year || ""}{" "}
                                  {card.vehicle?.make || ""}{" "}
                                  {card.vehicle?.model || "N/A"}
                                </div>
                                <div className="text-sm text-gray-600">
                                  Registration:{" "}
                                  {card.vehicle?.registration || "N/A"}
                                </div>
                              </div>
                              <div className="flex gap-2 ml-4"></div>

                              <div className="text-right">
                                <div className="text-lg font-semibold text-orange-600">
                                  R{card.totals?.total?.toFixed(2) || "0.00"}
                                </div>
                                {card.totals?.paid > 0 && (
                                  <div className="text-sm text-emerald-600 font-semibold">
                                    Paid: R{card.totals.paid.toFixed(2)}
                                  </div>
                                )}
                                {card.totals?.due > 0 && (
                                  <div className="text-sm text-rose-600 font-semibold">
                                    Due: R{card.totals.due.toFixed(2)}
                                  </div>
                                )}
                                <div
                                  className={`text-xs mt-1 px-2 py-1 rounded ${
                                    card.status === "paid"
                                      ? "bg-emerald-100 text-emerald-700"
                                      : card.status === "partially_paid"
                                        ? "bg-amber-100 text-amber-700"
                                        : card.status === "pending"
                                          ? "bg-blue-100 text-blue-700"
                                          : "bg-gray-100 text-gray-700"
                                  }`}
                                >
                                  {card.status === "paid"
                                    ? "Paid"
                                    : card.status === "partially_paid"
                                      ? "Partial"
                                      : "Pending"}
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
            {activeView === "parts-inventory" && <PartsInventory user={user} />}
            {activeView === "history-view" && <HistoryView user={user} />}
            {activeView === "notes-view" && <NotesView user={user} />}
            {activeView === "vehicles" && <Vehicles user={user} />}
             {activeView === "templates" && <Templates user={user} />}
            {activeView === "home" && <HomeView user={user} />}

            {activeView === "invoice" && (
              <>
               {/* Enhanced Header - Mobile Optimized */}
          <div className="flex-shrink-0 bg-white/80 backdrop-blur-md border-b border-slate-200 px-3 md:px-4 lg:px-8 py-3 md:py-4 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center space-x-2 md:space-x-4 min-w-0">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 hover:bg-slate-100 rounded-xl transition-all duration-300 lg:hidden flex-shrink-0"
                >
                  <Menu className="w-5 h-5" />
                </button>

                <div className="flex items-center space-x-2 md:space-x-3 min-w-0">
                  <div className="hidden sm:flex items-center justify-center w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg flex-shrink-0">
                    <FileText className="w-4 h-4 md:w-5 md:h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-sm md:text-lg lg:text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent truncate">
                      {documentType === "quote" ? "Quote" : "Invoice"} #
                      {jobCardNumber || "—"}
                    </h1>
                    <p className="text-xs text-slate-500 hidden md:block truncate">
                      Create and manage your{" "}
                      {documentType === "quote" ? "quotes" : "invoices"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Desktop Action Buttons - Hidden on mobile */}
              <div className="hidden lg:flex items-center space-x-2 print:hidden flex-shrink-0">
                {documentType === "quote" && jobCardId && (
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
                    documentType === "quote" ? handleNewQuote : handleNewInvoice
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
                  onClick={handleSaveJobCard}
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

          {/* Enhanced Mobile Action Bar - Better touch targets */}
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
          
                <button
                  onClick={() => setShowJobCard(!showJobCard)}
                  className="lg:hidden w-full mb-4 flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 text-gray-800 rounded-lg hover:bg-orange-100 transition-colors"
                >
                  <FileText className="w-5 h-5" />
                  {showJobCard
                    ? `Hide ${documentType === "quote" ? "Quote" : "Job Card"}`
                    : `View ${documentType === "quote" ? "Quote" : "Job Card"}`}
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 px-4 sm:px-6 lg:px-8 xl:px-12">
                  <div
                    className={`${showJobCard ? "hidden" : "block"} space-y-6 lg:block print:hidden max-h-[calc(100vh)]`}
                  >
                    {/* Tab Navigation */}
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
                            <svg
                              className="w-5 h-5"
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

                    {/* Manual forms always visible */}
                    {inputMode === "manual" && (
                      <>
                        {/* Summary Cards */}
                        <div className="grid grid-cols-3 sm:grid-cols-3 gap-4">
                          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-3 rounded-xl border border-orange-200 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                              <div className="text-sm font-medium text-orange-700">
                                Total Amount
                              </div>
                              <div className="w-8 h-8 bg-orange-200 rounded-lg flex items-center justify-center">
                                <svg
                                  className="w-5 h-5 text-orange-600"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                              </div>
                            </div>
                            <div className="text-2xl font-bold text-orange-900">
                              R{total.toFixed(2)}
                            </div>
                          </div>
                             <div
                              className={`bg-gradient-to-br p-3 rounded-xl border shadow-sm transition-all ${
                                paymentStatus.totalPaid > 0
                                  ? "from-emerald-100 to-emerald-300 border-emerald-200"
                                  : "from-slate-100 to-slate-300 border-slate-200"
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
                                  <svg
                                    className={`w-5 h-5 ${
                                      paymentStatus.totalPaid > 0
                                        ? "text-emerald-600"
                                        : "text-slate-400"
                                    }`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
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
                              {paymentStatus.totalPaid > 0 &&
                                paymentStatus.status === "partially_paid" && (
                                  <div className="mt-2 text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full inline-block">
                                    Partial Payment
                                  </div>
                                )}
                              {paymentStatus.status === "paid" && (
                                <div className="mt-2 text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full inline-block">
                                  ✓ Fully Paid
                                </div>
                              )}
                            </div>

                            {/* Balance Due Card - Dynamic */}
                            <div
                              className={`bg-gradient-to-br p-3 rounded-xl border shadow-sm transition-all ${
                                paymentStatus.balanceDue <= 0
                                  ? "from-emerald-100 to-emerald-300 border-emerald-600"
                                  : paymentStatus.totalPaid > 0
                                    ? "from-amber-50 to-amber-100 border-amber-200"
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
                                  {paymentStatus.balanceDue <= 0 ? (
                                    <svg
                                      className="w-5 h-5 text-emerald-600"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                      />
                                    </svg>
                                  ) : paymentStatus.totalPaid > 0 ? (
                                    <svg
                                      className="w-5 h-5 text-amber-600"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                      />
                                    </svg>
                                  ) : (
                                    <svg
                                      className="w-5 h-5 text-rose-600"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                      />
                                    </svg>
                                  )}
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
                              {paymentStatus.balanceDue <= 0 && (
                                <div className="mt-2 text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full inline-block">
                                  No Balance Due
                                </div>
                              )}
                            </div>
                        
                         
                        </div>
                        {/* Payment Status Banner */}
                        {jobCardId && (
                          <div
                            className={`p-4 rounded-xl border-2 flex items-center justify-between ${
                              paymentStatus.status === "paid"
                                ? "bg-emerald-50 border-emerald-300"
                                : paymentStatus.status === "partially_paid"
                                  ? "bg-amber-50 border-amber-300"
                                  : "bg-rose-50 border-rose-300"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {paymentStatus.status === "paid" ? (
                                <>
                                  <div className="w-10 h-10 bg-emerald-200 rounded-full flex items-center justify-center">
                                    <svg
                                      className="w-6 h-6 text-emerald-600"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                      />
                                    </svg>
                                  </div>
                                  <div>
                                    <div className="font-bold text-emerald-900">
                                      Invoice Fully Paid
                                    </div>
                                    <div className="text-sm text-emerald-700">
                                      Payment complete - Thank you!
                                    </div>
                                  </div>
                                </>
                              ) : paymentStatus.status === "partially_paid" ? (
                                <>
                                  <div className="w-10 h-10 bg-amber-200 rounded-full flex items-center justify-center">
                                    <svg
                                      className="w-6 h-6 text-amber-600"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                      />
                                    </svg>
                                  </div>
                                  <div>
                                    <div className="font-bold text-amber-900">
                                      Partial Payment Received
                                    </div>
                                    <div className="text-sm text-amber-700">
                                      R{paymentStatus.totalPaid.toFixed(2)} paid
                                      • R{paymentStatus.balanceDue.toFixed(2)}{" "}
                                      remaining
                                    </div>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="w-10 h-10 bg-rose-200 rounded-full flex items-center justify-center">
                                    <svg
                                      className="w-6 h-6 text-rose-600"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                      />
                                    </svg>
                                  </div>
                                  <div>
                                    <div className="font-bold text-rose-900">
                                      Payment Pending
                                    </div>
                                    <div className="text-sm text-rose-700">
                                      Full amount due: R
                                      {paymentStatus.balanceDue.toFixed(2)}
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>

                            {paymentStatus.status !== "paid" && (
                              <button
                                onClick={handleProcessPayment}
                                className="px-4 py-2 bg-white border-2 border-current rounded-lg font-bold hover:bg-opacity-90 transition-all flex items-center gap-2"
                              >
                                <CreditCard className="w-4 h-4" />
                                Record Payment
                              </button>
                            )}
                          </div>
                        )}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                          {/* Step 1: Customer Information */}
                          {currentStep === 1 && (
                            <div className="p-8">
                              <div className="mb-8">
                                <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Users className="w-6 h-6 text-blue-600" />
                                  </div>
                                  Customer Information
                                </h2>
                                <p className="text-slate-600 mt-2 ml-13">
                                  Enter customer and billing details
                                </p>
                              </div>

                              {/* Invoice To Section */}
                              <div className="mb-8">
                                <div className="flex items-center gap-2 mb-5">
                                  <div className="h-8 w-1 bg-blue-600 rounded-full"></div>
                                  <h3 className="text-lg font-bold text-slate-900">
                                    INVOICE TO
                                  </h3>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                  <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                      Customer Name{" "}
                                      <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                      type="text"
                                      value={customerName}
                                      onChange={(e) =>
                                        setCustomerName(e.target.value)
                                      }
                                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white hover:border-slate-400"
                                      placeholder="Enter customer name"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                      Customer ID
                                    </label>
                                    <input
                                      type="text"
                                      value={merchant_code}
                                      onChange={(e) =>
                                        setCustomerId(e.target.value)
                                      }
                                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white hover:border-slate-400"
                                      placeholder="Customer ID"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                      Email{" "}
                                      <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                      type="email"
                                      value={customerEmail}
                                      onChange={(e) =>
                                        setCustomerEmail(e.target.value)
                                      }
                                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white hover:border-slate-400"
                                      placeholder="email@example.com"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                      Phone{" "}
                                      <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                      type="tel"
                                      value={customerPhone}
                                      onChange={(e) =>
                                        setCustomerPhone(e.target.value)
                                      }
                                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white hover:border-slate-400"
                                      placeholder="082 123 4567"
                                    />
                                  </div>
                                  <div className="col-span-1 sm:col-span-2">
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                      Address{" "}
                                      <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                      type="text"
                                      value={customerAddress}
                                      onChange={(e) =>
                                        setCustomerAddress(e.target.value)
                                      }
                                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white hover:border-slate-400"
                                      placeholder="Street address, City, Postal Code"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                          {/* Step 2: Customer Information */}
                          {currentStep === 2 && (
                            <div className="p-8">
                              {/* Bill To Section */}
                              <div>
                                <div className="flex items-center gap-2 mb-5">
                                  <div className="h-8 w-1 bg-emerald-600 rounded-full"></div>
                                  <h3 className="text-lg font-bold text-slate-900">
                                    BILL TO
                                  </h3>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                  <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                      Billing Name{" "}
                                      <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                      type="text"
                                      value={billName}
                                      onChange={(e) =>
                                        setBillName(e.target.value)
                                      }
                                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white hover:border-slate-400"
                                      placeholder="Billing contact name"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                      Email
                                    </label>
                                    <input
                                      type="email"
                                      value={billEmail}
                                      onChange={(e) =>
                                        setBillEmail(e.target.value)
                                      }
                                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white hover:border-slate-400"
                                      placeholder="billing@example.com"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                      Phone
                                    </label>
                                    <input
                                      type="tel"
                                      value={billPhone}
                                      onChange={(e) =>
                                        setBillPhone(e.target.value)
                                      }
                                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white hover:border-slate-400"
                                      placeholder="082 123 4567"
                                    />
                                  </div>
                                  <div className="col-span-1 sm:col-span-2">
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                      Billing Address
                                    </label>
                                    <input
                                      type="text"
                                      value={billAddress}
                                      onChange={(e) =>
                                        setBillAddress(e.target.value)
                                      }
                                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white hover:border-slate-400"
                                      placeholder="Billing address if different"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                          {/* Step 3: Vehicle Information */}
                          {currentStep === 3 && (
                            <div className="p-8">
                              <div className="border-t-2 border-slate-200 pt-6 mt-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="h-8 w-1 bg-red-600 rounded-full"></div>
        <h3 className="text-lg font-bold text-slate-900">TOWING DETAILS</h3>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="col-span-2">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Pickup Location <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={towLocation}
            onChange={(e) => setTowLocation(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg..."
            placeholder="Street address where vehicle was picked up"
          />
        </div>
        
        <div className="col-span-2">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Destination <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg..."
            placeholder="Drop-off location"
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Distance (km) <span className="text-rose-500">*</span>
          </label>
          <input
            type="number"
            value={towDistance}
            onChange={(e) => setTowDistance(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg..."
            placeholder="50"
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Tow Type <span className="text-rose-500">*</span>
          </label>
          <select
            value={towType}
            onChange={(e) => setTowType(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg..."
          >
            <option value="Flatbed">Flatbed</option>
            <option value="Wheel Lift">Wheel Lift</option>
            <option value="Hook and Chain">Hook and Chain</option>
            <option value="Heavy Duty">Heavy Duty</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Vehicle Condition
          </label>
          <select
            value={vehicleCondition}
            onChange={(e) => setVehicleCondition(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg..."
          >
            <option value="">Select condition</option>
            <option value="Driveable">Driveable</option>
            <option value="Non-Driveable">Non-Driveable</option>
            <option value="Accident Damage">Accident Damage</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Incident Type
          </label>
          <select
            value={incidentType}
            onChange={(e) => setIncidentType(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg..."
          >
            <option value="">Select type</option>
            <option value="Breakdown">Breakdown</option>
            <option value="Accident">Accident</option>
            <option value="Repossession">Repossession</option>
            <option value="Police Impound">Police Impound</option>
            <option value="Parking Violation">Parking Violation</option>
          </select>
        </div>
      </div>
    </div>
  </div>
)}

                          {/* Step 4: Services/Parts */}
                          {currentStep === 4 && (
                            <div className="p-8">
                              <div className="mb-8">
                                <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <FileText className="w-6 h-6 text-blue-600" />
                                  </div>
                                  Services & Parts
                                </h2>
                                <p className="text-slate-600 mt-2 ml-13">
                                  Add services and parts to the invoice
                                </p>
                              </div>

                              {/* Add Item Form */}
                              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 mb-6 border border-slate-200">
                                <h3 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
                                  <Plus className="w-5 h-5 text-blue-600" />
                                  Add New Item
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                                  <select
  value={newItem.type}
  onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
  className="px-4 py-2 border border-slate-300 rounded-lg..."
>
  <option value="Towing">Towing Service</option>
  <option value="Recovery">Vehicle Recovery</option>
  <option value="Storage">Storage Fees</option>
  <option value="Additional">Additional Services</option>
</select>

                                  <input
                                    type="text"
                                    placeholder="Description"
                                    value={newItem.description}
                                    onChange={(e) =>
                                      setNewItem({
                                        ...newItem,
                                        description: e.target.value,
                                      })
                                    }
                                    className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white hover:border-slate-400"
                                  />

                                  <input
                                    type="number"
                                    placeholder="Rate"
                                    value={newItem.rate}
                                    onChange={(e) =>
                                      setNewItem({
                                        ...newItem,
                                        rate: e.target.value,
                                      })
                                    }
                                    className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white hover:border-slate-400"
                                  />

                                  <input
                                    type="number"
                                    placeholder="Qty"
                                    value={newItem.qty}
                                    onChange={(e) =>
                                      setNewItem({
                                        ...newItem,
                                        qty: e.target.value,
                                      })
                                    }
                                    className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white hover:border-slate-400"
                                  />

                                  <button
                                    onClick={handleAddItem}
                                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg px-4 py-3 hover:from-blue-700 hover:to-blue-800 flex items-center justify-center gap-2 transition-all font-semibold shadow-md hover:shadow-lg"
                                  >
                                    <Plus className="w-4 h-4" />
                                    Add
                                  </button>
                                </div>
                              </div>

                              {/* Items List */}
                              {items.length > 0 ? (
                                <div className="mb-6">
                                  <h3 className="text-lg font-bold text-slate-900 mb-4">
                                    Items Added
                                  </h3>
                                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                                    <table className="w-full">
                                      <thead>
                                        <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                                          <th className="px-4 py-4 text-left text-sm font-bold text-slate-700">
                                            Type
                                          </th>
                                          <th className="px-4 py-4 text-left text-sm font-bold text-slate-700">
                                            Description
                                          </th>
                                          <th className="px-4 py-4 text-right text-sm font-bold text-slate-700">
                                            Rate
                                          </th>
                                          <th className="px-4 py-4 text-right text-sm font-bold text-slate-700">
                                            Qty
                                          </th>
                                          <th className="px-4 py-4 text-right text-sm font-bold text-slate-700">
                                            Amount
                                          </th>
                                          <th className="px-4 py-4 text-center text-sm font-bold text-slate-700">
                                            Action
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody className="bg-white">
                                        {items.map((item, index) => (
                                          <tr
                                            key={index}
                                            className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                                          >
                                            <td className="px-4 py-4 text-sm">
                                              <span
                                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                                                  item.type === "Labor"
                                                    ? "bg-blue-100 text-blue-700"
                                                    : "bg-emerald-100 text-emerald-700"
                                                }`}
                                              >
                                                {item.type}
                                              </span>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-slate-700 text-sm font-medium">
                                              {item.description}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-right text-slate-700">
                                              R{item.rate.toFixed(2)}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-right text-slate-700">
                                              {item.qty}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-right font-bold text-slate-900">
                                              R{item.amount.toFixed(2)}
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                              <button
                                                onClick={() =>
                                                  handleRemoveItem(index)
                                                }
                                                className="text-rose-600 hover:text-rose-700 text-sm font-semibold hover:bg-rose-50 px-3 py-1 rounded-lg transition-all"
                                              >
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
                                    <FileText className="w-8 h-8 text-slate-400" />
                                  </div>
                                  <p className="text-slate-700 font-semibold text-lg">
                                    No items added yet
                                  </p>
                                  <p className="text-sm text-slate-500 mt-2">
                                    Add services or parts using the form above
                                  </p>
                                </div>
                              )}

                              {/* Total Summary */}
                              {items.length > 0 && (
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                                  <div className="space-y-3">
                                    <div className="flex justify-between items-center text-sm">
                                      <span className="text-slate-700 text-sm font-medium">
                                        Subtotal:
                                      </span>
                                      <span className="font-bold text-slate-900 text-lg">
                                        R{subtotal.toFixed(2)}
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                      <span className="text-slate-700 text-sm font-medium">
                                        VAT (0%):
                                      </span>
                                      <span className="font-bold text-slate-900 text-lg">
                                        R{vat.toFixed(2)}
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center text-lg font-bold pt-4 border-t-2 border-blue-300">
                                      <span className="text-slate-900">
                                        Total:
                                      </span>
                                      <span className="text-blue-700 text-2xl">
                                        R{total.toFixed(2)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                          {/* Step 5: Services/Parts */}
                          {currentStep === 5 && (
                            <div className="p-8">
                              <div className="mb-8">
                                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                                  <div className="flex items-center gap-3 mb-5">
                                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                      <CreditCard className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <h2 className="text-xl font-bold text-slate-900">
                                      Payment Terms
                                    </h2>
                                    <button
                                      onClick={handleProcessPayment}
                                      disabled={!jobCardId}
                                      className={`group flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 font-semibold shadow-lg ${
                                        !jobCardId
                                          ? "bg-gray-400 cursor-not-allowed"
                                          : "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:from-emerald-700 hover:to-emerald-800 hover:shadow-emerald-500/50 hover:scale-105"
                                      }`}
                                    >
                                      <CreditCard className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                                      Process Payment
                                    </button>
                                  </div>

                                  <div className="space-y-3 text-sm">
                                    <div className="flex justify-between items-center py-3 border-b border-slate-100">
                                      <span className="text-slate-600 text-sm font-medium">
                                        Payment Method:
                                      </span>
                                      <span className="font-bold text-slate-900">
                                        Cash/Card/EFT
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center py-3 border-b border-slate-100">
                                      <span className="text-slate-600 text-sm font-medium">
                                        Payment Terms:
                                      </span>
                                      <span className="font-bold text-slate-900">
                                        Due on Completion
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center py-3">
                                      <span className="text-slate-600 text-sm font-medium">
                                        Warranty:
                                      </span>
                                      <span className="font-bold text-slate-900">
                                        90 Days Parts & Labor
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                          {/* Navigation Buttons */}
                          <div className="px-8 py-5 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
                            <button
                              onClick={handlePrevious}
                              disabled={currentStep === 1}
                              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                                currentStep === 1
                                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                                  : "bg-white border-2 border-slate-300 text-slate-700 hover:bg-slate-100 hover:border-slate-400 shadow-sm"
                              }`}
                            >
                              <ChevronLeft className="w-5 h-5" />
                              Previous
                            </button>

                            <div className="text-sm text-slate-600 font-bold bg-white px-4 py-2 rounded-lg border border-slate-200">
                              Step {currentStep} of {totalSteps}
                            </div>

                            {currentStep < totalSteps ? (
                              <button
                                onClick={handleNext}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg"
                              >
                                Next
                                <ChevronRight className="w-5 h-5" />
                              </button>
                            ) : (
                              <button
                                onClick={handlePrint}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg font-semibold hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-md hover:shadow-lg"
                              >
                                <Save className="w-5 h-5" />
                                Save Invoice
                              </button>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Invoice Preview */}
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
                    <TemplateRenderer
                      templateId={selectedTemplate}
                      businessInfo={businessInfo}
                      loading={loading}
                      jobCardNumber={jobCardNumber}
                      customerName={customerName}
                      billName={billName}
                      billEmail={billEmail}
                      billPhone={billPhone}
                      billAddress={billAddress}
                      merchant_code={merchant_code}
                      customerCompany=""
                      customerEmail={customerEmail}
                      customerPhone={customerPhone}
                      customerAddress={customerAddress}
                      vehicleReg={vehicleReg}
                      vehicleMake={vehicleMake}
                      vehicleModel={vehicleModel}
                      vehicleYear={vehicleYear}
                      vehicleVin={vehicleVin}
                      vehicleMileage={vehicleMileage}
                      preAuth={preAuth}
                      authCode={authCode}
                      items={items}
                      subtotal={subtotal}
                      vat={vat}
                      total={total}
                      merchantCode="{merchant_code}"
                      serviceType="SERVICE"
                      documentType={documentType}
                      stampText={stampSettings.text}
                      stampColor={stampSettings.color}
                      showStampDate={stampSettings.showDate}
                      showStamp={stampSettings.enabled}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TowingDashboard;
