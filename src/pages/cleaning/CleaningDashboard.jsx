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
import { getFunctions, httpsCallable } from "firebase/functions";
import CleaningSidebar from "./CleaningSidebar";
import Templates from "./Templates";
import { useLocation } from "react-router-dom";
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

    if (match) {
      lastNumber = Number(match[1]);
    }
  }

  const nextNumber = lastNumber + 1;
  return `${prefix}-${year}-${String(nextNumber).padStart(4, "0")}`;
};
const functions = getFunctions();
const CleaningDashboard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Quote");
  const { user, authUser } = useAuth();
  const [quoteNumber, setQuoteNumber] = useState("");
  const [quoteId, setQuoteId] = useState(null);
  const [savedQuotes, setSavedQuotes] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [showQuotesList, setShowQuotesList] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeView, setActiveView] = useState("quote");
  const [currentQuoteId, setCurrentQuoteId] = useState(null);
  const [savedCustomers, setSavedCustomers] = useState([]);
  const [showCustomersListModal, setShowCustomersListModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("professional");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [inputMode, setInputMode] = useState("manual");
  const [isClientsOpen, setIsClientsOpen] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedQuoteForPayment, setSelectedQuoteForPayment] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isQuotesInvoicesOpen, setIsQuotesInvoicesOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (location.state?.activeView) {
      setActiveView(location.state.activeView);
    }
  }, [location.state]);
  const [stampSettings, setStampSettings] = useState({
    text: "PAID",
    color: "#22c55e",
    showDate: true,
    enabled: true,
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

  const [documentType, setDocumentType] = useState("quote");

  const handleAIDataExtracted = (extractedData) => {
    if (extractedData.customer.name)
      setCustomerName(extractedData.customer.name);
    if (extractedData.customer.email)
      setCustomerEmail(extractedData.customer.email);
    if (extractedData.customer.phone)
      setCustomerPhone(extractedData.customer.phone);
    if (extractedData.customer.address)
      setPropertyAddress(extractedData.customer.address);

    if (extractedData.items && extractedData.items.length > 0) {
      setItems(extractedData.items);
    }

    alert("✨ Data extracted and populated successfully!");
  };
  const handleTestEmail = async () => {
    if (!businessInfo.emailPassword) {
      alert("⚠️ Please enter your email app password first.");
      return;
    }

    const userEmail = user?.email || authUser?.email;

    if (!userEmail) {
      alert("⚠️ Could not find your email address. Please log in again.");
      return;
    }

    try {
      const testEmailData = {
        userId: user.uid,
        to: userEmail, // Send test to self
        subject: "✅ Test Email - Email Configuration Successful",
        message: `
Hello,

This is a test email from your construction quote/invoice system.

✓ Your email configuration is working correctly!

Account Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Business: ${businessInfo.businessName}
Email: ${userEmail}
Provider: ${businessInfo.emailProvider || "Gmail"}
Date: ${new Date().toLocaleString()}

You can now send quotes and invoices to your clients from this email address.

Best regards,
Your Construction Quote System
      `.trim(),
        documentType: "test",
        documentNumber: "TEST-001",
      };

      const sendEmail = httpsCallable(functions, "sendQuoteEmail");
      await sendEmail(testEmailData);

      alert(
        `✅ Test email sent successfully!\n\nCheck your inbox at: ${userEmail}`,
      );
    } catch (error) {
      console.error("Test email error:", error);

      let errorMsg = "❌ Test email failed!\n\n";
      if (error.message.includes("Invalid login")) {
        errorMsg +=
          "Your app password is incorrect. Please check and try again.\n\nMake sure you're using an APP PASSWORD, not your regular password.";
      } else {
        errorMsg += `Error: ${error.message}\n\nPlease check your app password and try again.`;
      }

      alert(errorMsg);
    }
  };
  useEffect(() => {
    if (!user?.uid) return;

    const loadQuoteNumber = async () => {
      const nextQuote = await generateQuoteNumber(user.uid, documentType);
      setQuoteNumber(nextQuote);
    };

    loadQuoteNumber();
    loadSavedQuotes();
  }, [user, documentType]);

  // Responsive detection
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);

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
    { number: 1, title: "Client Info", icon: Users },
    { number: 2, title: "Property Details", icon: HomeIcon },
    { number: 3, title: "Services", icon: ClipboardList },
    { number: 4, title: "Schedule & Payment", icon: Calendar },
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
        const quoteData = quoteDoc.data();
        setSelectedQuoteForPayment({
          id: quoteId,
          ...quoteData,
        });
        setShowPaymentModal(true);
      } else {
        alert("Quote not found. Please save the quote first.");
      }
    } catch (error) {
      console.error("Error loading quote:", error);
      alert("Failed to load quote for payment");
    }
  };

  const loadPaymentStatus = async () => {
    if (!user?.uid || !quoteId) {
      setPaymentStatus({
        totalPaid: 0,
        balanceDue: total,
        status: "pending",
      });
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
      console.error("Error loading payment status:", error);
      setPaymentStatus({
        totalPaid: 0,
        balanceDue: total,
        status: "pending",
      });
    }
  };

  const handlePaymentComplete = () => {
    loadSavedQuotes();
    loadPaymentStatus();
    setShowPaymentModal(false);
  };

  const loadSavedQuotes = async () => {
    if (!user?.uid) return;

    const db = getFirestore();
    const collectionName = documentType === "quote" ? "quotes" : "invoices";
    const quotesRef = collection(db, "users", user.uid, collectionName);
    const q = query(quotesRef, orderBy("createdAt", "desc"), limit(50));
    const snapshot = await getDocs(q);

    const quotes = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setSavedQuotes(quotes);
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

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    loadPaymentStatus();
  }, [quoteId, user?.uid, documentType]);

  const loadQuote = (quote) => {
    setQuoteId(quote.id);
    setQuoteNumber(quote.quoteNumber || "");
    setCustomerName(quote.customer?.name || "");
    setCustomerEmail(quote.customer?.email || "");
    setCustomerPhone(quote.customer?.phone || "");
    setPropertyAddress(quote.customer?.address || "");
    setPropertyType(quote.propertyDetails?.type || "");
    setPropertySize(quote.propertyDetails?.size || "");
    setRooms(quote.propertyDetails?.rooms || "");
    setBathrooms(quote.propertyDetails?.bathrooms || "");
    setItems(quote.items || []);
    setShowQuotesList(false);
    setPaymentStatus({
      totalPaid: quote.totals?.paid || 0,
      balanceDue: quote.totals?.due || quote.totals?.total || 0,
      status: quote.status || "pending",
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

  const loadQuoteForExport = async () => {
    if (!user?.uid || !quoteId) return null;

    const db = getFirestore();
    const collectionName = documentType === "quote" ? "quotes" : "invoices";
    const snap = await getDoc(
      doc(db, "users", user.uid, collectionName, quoteId),
    );

    return snap.exists() ? snap.data() : null;
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

    setTimeout(() => {
      window.print();
    }, 300);
  };

  const handleAddItem = () => {
    if (!newItem.description || !newItem.qty) return;

    const rate = Number(newItem.rate) || 0;
    const qty = Number(newItem.qty);
    const taxRate = Number(newItem.taxRate) || 0;

    const amount = rate * qty;
    const taxAmount = amount * (taxRate / 100);
    const totalAmount = amount + taxAmount;

    const item = {
      description: newItem.description,
      serviceType: newItem.serviceType || "Standard Cleaning",
      rate,
      qty,
      amount,
      taxRate,
      taxAmount,
      totalAmount,
      frequency: newItem.frequency || "One-time",
    };

    setItems((prev) => [...prev, item]);
    setNewItem({
      description: "",
      rate: "",
      qty: "",
      serviceType: "Standard Cleaning",
      taxRate: "15",
      frequency: "One-time",
    });
  };

  const [customerName, setCustomerName] = useState("Johnson Residence");
  const [customerEmail, setCustomerEmail] = useState("johnson@email.com");
  const [customerPhone, setCustomerPhone] = useState("+27 82 123 4567");
  const [propertyAddress, setPropertyAddress] = useState(
    "123 Sunset Avenue, Sandton, Johannesburg, 2196",
  );
  const [propertyType, setPropertyType] = useState("Residential");
  const [propertySize, setPropertySize] = useState("200");
  const [rooms, setRooms] = useState("4");
  const [bathrooms, setBathrooms] = useState("2");

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

  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({
    description: "",
    rate: "",
    qty: "",
    serviceType: "Standard Cleaning",
    taxRate: "15",
    frequency: "One-time",
  });

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const totalTax = items.reduce((sum, item) => sum + item.taxAmount, 0);
  const total = subtotal + totalTax;

  useEffect(() => {
    if (!quoteId) {
      setPaymentStatus({
        totalPaid: 0,
        balanceDue: total,
        status: "pending",
      });
    }
  }, [total, quoteId]);

  const buildQuotePayload = (numberToUse) => ({
    quoteNumber: numberToUse,
    locked: true,
    status: "pending",
    documentType: documentType,

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

    propertyDetails: {
      type: propertyType,
      size: propertySize,
      rooms: rooms,
      bathrooms: bathrooms,
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

    if (
      !window.confirm(
        "Convert this quote to an invoice? This will create a new invoice with the same details.",
      )
    ) {
      return;
    }

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

  const handleNewQuote = () => {
    setDocumentType("quote");
    handleNewDocument();
  };

  const handleNewInvoice = () => {
    setDocumentType("invoice");
    handleNewDocument();
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
    setItems([]);

    const loadNewNumber = async () => {
      if (user?.uid) {
        const nextQuote = await generateQuoteNumber(user.uid, documentType);
        setQuoteNumber(nextQuote);
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
  const headerActions = [
    documentType === "quote" &&
      quoteId && {
        label: "Convert to Invoice",
        icon: FileText,
        onClick: handleConvertToInvoice,
        className:
          "flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-sm font-semibold rounded-lg hover:from-purple-700 transition-colors shadow-sm whitespace-nowrap",
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
      onClick: handleSaveQuote,
      className:
        "flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-600 to-amber-700 text-white text-sm font-semibold rounded-lg hover:from-amber-700 transition-colors shadow-sm whitespace-nowrap",
    },
    {
      label: "Logout",
      icon: LogOut,
      onClick: handleLogout,
      className:
        "flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-semibold rounded-lg hover:from-red-700 transition-colors shadow-sm whitespace-nowrap",
    },
  ].filter(Boolean);

  const mobileDashboardActions = [
    documentType === "quote" &&
      quoteId && {
        label: "To Invoice",
        icon: FileText,
        onClick: handleConvertToInvoice,
        className:
          "flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg text-xs font-semibold shadow-lg transition-all active:scale-95 whitespace-nowrap",
      },
    {
      label: "Save",
      icon: Save,
      onClick: handleSaveQuote,
      className:
        "flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-stone-600 to-stone-700 text-white rounded-lg text-xs font-semibold shadow-lg transition-all active:scale-95 whitespace-nowrap",
    },
    {
      label: "Send",
      icon: Send,
      className:
        "flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg text-xs font-semibold shadow-lg transition-all active:scale-95 whitespace-nowrap",
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
    <div className="flex h-screen w-screen bg-[#f4f5f7] overflow-hidden">
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
        savedCustomers={savedCustomers}
        handleLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-300`}
      >
        <div className="flex flex-col h-screen">
          <AppHeader
            actions={headerActions}
            mobileActions={mobileDashboardActions}
            onSettingsOpen={() => setShowSettings(true)}
          />

          {/* ── Scrollable Main Content ──────────────────────────────── */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {/* Settings Modal */}
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

              {showQuotesList && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
                    <div className="p-4 border-b flex items-center justify-between">
                      <h2 className="text-xl font-semibold">
                        Saved {documentType === "quote" ? "Quotes" : "Invoices"}
                      </h2>
                      <button
                        onClick={() => setShowQuotesList(false)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="overflow-auto p-4">
                      {savedQuotes.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          No saved{" "}
                          {documentType === "quote" ? "quotes" : "invoices"} yet
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {savedQuotes.map((quote) => (
                            <div
                              key={quote.id}
                              onClick={() => loadQuote(quote)}
                              className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="font-semibold text-lg">
                                    {quote.quoteNumber || "N/A"}
                                  </div>
                                  <div className="text-sm text-gray-600 mt-1">
                                    Client: {quote.customer?.name || "N/A"}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    Email: {quote.customer?.email || "N/A"}
                                  </div>
                                </div>

                                <div className="text-right">
                                  <div className="text-lg font-semibold text-orange-600">
                                    R{quote.totals?.total?.toFixed(2) || "0.00"}
                                  </div>
                                  {quote.totals?.paid > 0 && (
                                    <div className="text-sm text-emerald-600 font-semibold">
                                      Paid: R{quote.totals.paid.toFixed(2)}
                                    </div>
                                  )}
                                  {quote.totals?.due > 0 && (
                                    <div className="text-sm text-rose-600 font-semibold">
                                      Due: R{quote.totals.due.toFixed(2)}
                                    </div>
                                  )}
                                  <div
                                    className={`text-xs mt-1 px-2 py-1 rounded ${
                                      quote.status === "paid"
                                        ? "bg-emerald-100 text-emerald-700"
                                        : quote.status === "partially_paid"
                                          ? "bg-amber-100 text-amber-700"
                                          : quote.status === "pending"
                                            ? "bg-blue-100 text-blue-700"
                                            : "bg-gray-100 text-gray-700"
                                    }`}
                                  >
                                    {quote.status === "paid"
                                      ? "Paid"
                                      : quote.status === "partially_paid"
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
              {activeView === "financial-overview" && (
                <FinancialOverview user={user} />
              )}
              {activeView === "history-view" && <HistoryView user={user} />}
              {activeView === "notes-view" && <NotesView user={user} />}
              {activeView === "templates" && <Templates user={user} />}
              {activeView === "home" && <HomeView user={user} />}

              {activeView === "quote" && (
                <>
                  <div className="grid grid-cols-1 gap-6 px-4 sm:px-6 lg:px-8 xl:px-12">
                    <div className="space-y-6">
                      {/* Tab Navigation */}
                      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm pt-2 sm:pt-6">
                        <div className="flex border-b border-slate-200">
                          <button
                            onClick={() => setInputMode("manual")}
                            className={`flex-1 px-2 sm:px-6 py-2 sm:py-4 font-semibold text-xs sm:text-base transition-all duration-200 ${inputMode === "manual" ? "bg-white text-blue-600 border-b-2 border-blue-600 shadow-sm" : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`}
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
                            onClick={() => setInputMode("ai")}
                            className={`flex-1 px-2 sm:px-6 py-2 sm:py-4 font-semibold text-xs sm:text-base transition-all duration-200 ${inputMode === "ai" ? "bg-white text-purple-600 border-b-2 border-purple-600 shadow-sm" : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`}
                          >
                            <span className="flex items-center justify-center gap-1 sm:gap-2">
                              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                              <span className="hidden sm:inline">
                                AI Assistant
                              </span>
                              <span className="sm:hidden">AI</span>
                            </span>
                          </button>
                        </div>

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
                          {/* Summary Cards */}
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
                              <div className="text-base sm:text-lg md:text-2xl font-bold text-orange-900">
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
                                className={`text-lg sm:text-2xl font-bold ${
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
                                className={`text-lg sm:text-2xl font-bold ${
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

                          {/* Payment Status Banner */}
                          {quoteId && (
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
                                      <CheckSquare className="w-6 h-6 text-emerald-600" />
                                    </div>
                                    <div>
                                      <div className="font-bold text-emerald-900">
                                        {documentType === "quote"
                                          ? "Quote"
                                          : "Invoice"}{" "}
                                        Fully Paid
                                      </div>
                                      <div className="text-sm text-emerald-700">
                                        Payment complete - Thank you!
                                      </div>
                                    </div>
                                  </>
                                ) : paymentStatus.status ===
                                  "partially_paid" ? (
                                  <>
                                    <div className="w-10 h-10 bg-amber-200 rounded-full flex items-center justify-center">
                                      <CreditCard className="w-6 h-6 text-amber-600" />
                                    </div>
                                    <div>
                                      <div className="font-bold text-amber-900">
                                        Partial Payment Received
                                      </div>
                                      <div className="text-sm text-amber-700">
                                        R{paymentStatus.totalPaid.toFixed(2)}{" "}
                                        paid • R
                                        {paymentStatus.balanceDue.toFixed(2)}{" "}
                                        remaining
                                      </div>
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <div className="w-10 h-10 bg-rose-200 rounded-full flex items-center justify-center">
                                      <Wallet className="w-6 h-6 text-rose-600" />
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

                          {/* Stepped Form */}
                          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            {/* Step 1: Client Info */}
                            {currentStep === 1 && (
                              <div className="p-8">
                                <div className="mb-8">
                                  <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                                    <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                                      <Users className="w-6 h-6 text-cyan-600" />
                                    </div>
                                    Client Information
                                  </h2>
                                  <p className="text-slate-600 mt-2 ml-13">
                                    Enter client details
                                  </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                  <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                      Client Name{" "}
                                      <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                      type="text"
                                      value={customerName}
                                      onChange={(e) =>
                                        setCustomerName(e.target.value)
                                      }
                                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all bg-white hover:border-slate-400"
                                      placeholder="Enter client name"
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
                                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all bg-white hover:border-slate-400"
                                      placeholder="contact@example.com"
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
                                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all bg-white hover:border-slate-400"
                                      placeholder="+27 82 123 4567"
                                    />
                                  </div>
                                  <div className="col-span-1 sm:col-span-2">
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                      Property Address{" "}
                                      <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                      type="text"
                                      value={propertyAddress}
                                      onChange={(e) =>
                                        setPropertyAddress(e.target.value)
                                      }
                                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all bg-white hover:border-slate-400"
                                      placeholder="123 Sunset Avenue, Sandton, Johannesburg, 2196"
                                    />
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Step 2: Property Details */}
                            {currentStep === 2 && (
                              <div className="p-8">
                                <div className="mb-8">
                                  <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                                    <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                                      <HomeIcon className="w-6 h-6 text-teal-600" />
                                    </div>
                                    Property Details
                                  </h2>
                                  <p className="text-slate-600 mt-2 ml-13">
                                    Enter property information for accurate
                                    quote
                                  </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                  <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                      Property Type
                                    </label>
                                    <select
                                      value={propertyType}
                                      onChange={(e) =>
                                        setPropertyType(e.target.value)
                                      }
                                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all bg-white hover:border-slate-400"
                                    >
                                      <option value="Residential">
                                        Residential
                                      </option>
                                      <option value="Commercial">
                                        Commercial
                                      </option>
                                      <option value="Office">Office</option>
                                      <option value="Retail">Retail</option>
                                      <option value="Industrial">
                                        Industrial
                                      </option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                      Property Size (sqm)
                                    </label>
                                    <input
                                      type="number"
                                      value={propertySize}
                                      onChange={(e) =>
                                        setPropertySize(e.target.value)
                                      }
                                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all bg-white hover:border-slate-400"
                                      placeholder="200"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                      Number of Rooms
                                    </label>
                                    <input
                                      type="number"
                                      value={rooms}
                                      onChange={(e) => setRooms(e.target.value)}
                                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all bg-white hover:border-slate-400"
                                      placeholder="4"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                      Number of Bathrooms
                                    </label>
                                    <input
                                      type="number"
                                      value={bathrooms}
                                      onChange={(e) =>
                                        setBathrooms(e.target.value)
                                      }
                                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all bg-white hover:border-slate-400"
                                      placeholder="2"
                                    />
                                  </div>
                                </div>

                                {/* Property Summary Card */}
                                <div className="mt-6 p-4 bg-gradient-to-br from-cyan-50 to-teal-50 border border-cyan-200 rounded-lg">
                                  <h3 className="font-semibold text-cyan-900 mb-2 flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    Property Summary
                                  </h3>
                                  <div className="text-sm text-cyan-800 space-y-1">
                                    <p>
                                      <span className="font-medium">Type:</span>{" "}
                                      {propertyType}
                                    </p>
                                    <p>
                                      <span className="font-medium">Size:</span>{" "}
                                      {propertySize} sqm
                                    </p>
                                    <p>
                                      <span className="font-medium">
                                        Rooms:
                                      </span>{" "}
                                      {rooms} | Bathrooms: {bathrooms}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Step 3: Services */}
                            {currentStep === 3 && (
                              <div className="p-8">
                                <div className="mb-8">
                                  <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                      <ClipboardList className="w-6 h-6 text-purple-600" />
                                    </div>
                                    Cleaning Services
                                  </h2>
                                  <p className="text-slate-600 mt-2 ml-13">
                                    Add cleaning services to the quote
                                  </p>
                                </div>

                                {/* Add Service Form */}
                                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 mb-6 border border-slate-200">
                                  <h3 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
                                    <Plus className="w-5 h-5 text-cyan-600" />
                                    Add New Service
                                  </h3>
                                  <div className="grid grid-cols-1 gap-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                      <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                          Service Type
                                        </label>
                                        <select
                                          value={newItem.serviceType}
                                          onChange={(e) =>
                                            setNewItem({
                                              ...newItem,
                                              serviceType: e.target.value,
                                            })
                                          }
                                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all bg-white text-sm font-medium hover:border-slate-400"
                                        >
                                          <option value="Standard Cleaning">
                                            Standard Cleaning
                                          </option>
                                          <option value="Deep Cleaning">
                                            Deep Cleaning
                                          </option>
                                          <option value="Move In/Out Cleaning">
                                            Move In/Out Cleaning
                                          </option>
                                          <option value="Office Cleaning">
                                            Office Cleaning
                                          </option>
                                          <option value="Carpet Cleaning">
                                            Carpet Cleaning
                                          </option>
                                          <option value="Window Cleaning">
                                            Window Cleaning
                                          </option>
                                          <option value="Post-Construction">
                                            Post-Construction
                                          </option>
                                          <option value="Specialized Service">
                                            Specialized Service
                                          </option>
                                        </select>
                                      </div>

                                      <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                          Frequency
                                        </label>
                                        <select
                                          value={newItem.frequency}
                                          onChange={(e) =>
                                            setNewItem({
                                              ...newItem,
                                              frequency: e.target.value,
                                            })
                                          }
                                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all bg-white text-sm font-medium hover:border-slate-400"
                                        >
                                          <option value="One-time">
                                            One-time
                                          </option>
                                          <option value="Weekly">Weekly</option>
                                          <option value="Bi-weekly">
                                            Bi-weekly
                                          </option>
                                          <option value="Monthly">
                                            Monthly
                                          </option>
                                          <option value="Quarterly">
                                            Quarterly
                                          </option>
                                        </select>
                                      </div>
                                    </div>

                                    <div>
                                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Description
                                      </label>
                                      <input
                                        type="text"
                                        placeholder="Service description / Details"
                                        value={newItem.description}
                                        onChange={(e) =>
                                          setNewItem({
                                            ...newItem,
                                            description: e.target.value,
                                          })
                                        }
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all bg-white hover:border-slate-400"
                                      />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                                      <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                          Rate (R)
                                        </label>
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
                                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all bg-white hover:border-slate-400"
                                        />
                                      </div>

                                      <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                          Quantity
                                        </label>
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
                                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all bg-white hover:border-slate-400"
                                        />
                                      </div>

                                      <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
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
                                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all bg-white hover:border-slate-400"
                                        />
                                      </div>

                                      <div className="flex items-end">
                                        <button
                                          onClick={handleAddItem}
                                          className="w-full bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-lg px-4 py-2 hover:from-cyan-700 hover:to-teal-700 flex items-center justify-center gap-2 transition-all font-semibold shadow-md hover:shadow-lg"
                                        >
                                          <Plus className="w-4 h-4" />
                                          Add Service
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Services List */}
                                {items.length > 0 ? (
                                  <div className="mb-6">
                                    <h3 className="text-lg font-bold text-slate-900 mb-4">
                                      Services Added ({items.length})
                                    </h3>
                                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                                      <table className="w-full">
                                        <thead>
                                          <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                                            <th className="px-4 py-4 text-left text-sm font-bold text-slate-700">
                                              Service
                                            </th>
                                            <th className="px-4 py-4 text-left text-sm font-bold text-slate-700">
                                              Type
                                            </th>
                                            <th className="px-4 py-4 text-left text-sm font-bold text-slate-700">
                                              Frequency
                                            </th>
                                            <th className="px-4 py-4 text-right text-sm font-bold text-slate-700">
                                              Rate
                                            </th>
                                            <th className="px-4 py-4 text-right text-sm font-bold text-slate-700">
                                              Qty
                                            </th>
                                            <th className="px-4 py-4 text-right text-sm font-bold text-slate-700">
                                              VAT
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
                                              <td className="px-4 py-4 text-sm font-medium text-slate-700">
                                                {item.description}
                                              </td>
                                              <td className="px-4 py-4 text-sm">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-cyan-100 text-cyan-700">
                                                  {item.serviceType ||
                                                    "Standard Cleaning"}
                                                </span>
                                              </td>
                                              <td className="px-4 py-4 text-sm">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-700">
                                                  {item.frequency || "One-time"}
                                                </span>
                                              </td>
                                              <td className="px-4 py-4 text-sm text-right text-slate-700">
                                                R{item.rate.toFixed(2)}
                                              </td>
                                              <td className="px-4 py-4 text-sm text-right text-slate-700">
                                                {item.qty}
                                              </td>
                                              <td className="px-4 py-4 text-sm text-right text-slate-700">
                                                R{item.taxAmount.toFixed(2)}
                                              </td>
                                              <td className="px-4 py-4 text-sm text-right font-bold text-slate-900">
                                                R{item.totalAmount.toFixed(2)}
                                              </td>
                                              <td className="px-4 py-4 text-center">
                                                <button
                                                  onClick={() =>
                                                    handleRemoveItem(index)
                                                  }
                                                  className="text-rose-600 hover:text-rose-700 text-sm font-semibold hover:bg-rose-50 px-3 py-1 rounded-lg transition-all flex items-center gap-1 mx-auto"
                                                >
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
                                      <ClipboardList className="w-8 h-8 text-slate-400" />
                                    </div>
                                    <p className="text-slate-700 font-semibold text-lg">
                                      No services added yet
                                    </p>
                                    <p className="text-sm text-slate-500 mt-2">
                                      Add cleaning services using the form above
                                    </p>
                                  </div>
                                )}

                                {/* Total Summary */}
                                {items.length > 0 && (
                                  <div className="bg-gradient-to-br from-cyan-50 to-teal-50 rounded-xl p-6 border border-cyan-200">
                                    <div className="space-y-3">
                                      <div className="flex justify-between items-center">
                                        <span className="text-slate-700 font-medium">
                                          Subtotal:
                                        </span>
                                        <span className="font-bold text-slate-900 text-lg">
                                          R{subtotal.toFixed(2)}
                                        </span>
                                      </div>
                                      <div className="flex justify-between items-center">
                                        <span className="text-slate-700 font-medium">
                                          VAT (15%):
                                        </span>
                                        <span className="font-bold text-slate-900 text-lg">
                                          R{totalTax.toFixed(2)}
                                        </span>
                                      </div>
                                      <div className="flex justify-between items-center text-lg font-bold pt-4 border-t-2 border-cyan-300">
                                        <span className="text-slate-900">
                                          Total:
                                        </span>
                                        <span className="text-cyan-700 text-2xl">
                                          R{total.toFixed(2)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Step 4: Schedule & Payment */}
                            {currentStep === 4 && (
                              <div className="p-8">
                                <div className="mb-8">
                                  <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                                      <Calendar className="w-6 h-6 text-emerald-600" />
                                    </div>
                                    Schedule & Payment Terms
                                  </h2>
                                  <p className="text-slate-600 mt-2 ml-13">
                                    Review quote details and schedule
                                    information
                                  </p>
                                </div>

                                {/* Quote Summary Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                  <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-6 rounded-xl border border-cyan-200">
                                    <div className="flex items-center justify-between mb-3">
                                      <span className="text-sm font-semibold text-cyan-700">
                                        Quote Total
                                      </span>
                                      <DollarSign className="w-5 h-5 text-cyan-600" />
                                    </div>
                                    <div className="text-3xl font-bold text-cyan-900">
                                      R{total.toFixed(2)}
                                    </div>
                                  </div>

                                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-xl border border-emerald-200">
                                    <div className="flex items-center justify-between mb-3">
                                      <span className="text-sm font-semibold text-emerald-700">
                                        Services Count
                                      </span>
                                      <ClipboardList className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <div className="text-3xl font-bold text-emerald-900">
                                      {items.length}
                                    </div>
                                  </div>

                                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                                    <div className="flex items-center justify-between mb-3">
                                      <span className="text-sm font-semibold text-purple-700">
                                        VAT Amount
                                      </span>
                                      <Receipt className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <div className="text-3xl font-bold text-purple-900">
                                      R{totalTax.toFixed(2)}
                                    </div>
                                  </div>
                                </div>

                                {/* Payment Terms Section */}
                                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm mb-6">
                                  <div className="flex items-center gap-3 mb-5">
                                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                      <CreditCard className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900">
                                      Payment Information
                                    </h3>
                                  </div>

                                  <div className="space-y-3">
                                    <div className="flex justify-between items-center py-3 border-b border-slate-100">
                                      <span className="text-slate-600 font-medium">
                                        Payment Due:
                                      </span>
                                      <span className="font-bold text-slate-900">
                                        Upon Completion
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center py-3 border-b border-slate-100">
                                      <span className="text-slate-600 font-medium">
                                        Payment Methods:
                                      </span>
                                      <span className="font-bold text-slate-900">
                                        Bank Transfer, Card, Cash
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center py-3 border-b border-slate-100">
                                      <span className="text-slate-600 font-medium">
                                        Quote Valid For:
                                      </span>
                                      <span className="font-bold text-slate-900">
                                        30 Days
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center py-3">
                                      <span className="text-slate-600 font-medium">
                                        Currency:
                                      </span>
                                      <span className="font-bold text-slate-900">
                                        ZAR (South African Rand)
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Property & Client Summary */}
                                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200">
                                  <h3 className="text-lg font-bold text-slate-900 mb-4">
                                    Quote Summary
                                  </h3>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                      <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                        <Users className="w-4 h-4" />
                                        Client Details:
                                      </h4>
                                      <div className="text-sm text-slate-600 space-y-1">
                                        <p className="font-semibold text-slate-900">
                                          {customerName}
                                        </p>
                                        <p>{customerEmail}</p>
                                        <p>{customerPhone}</p>
                                      </div>
                                    </div>
                                    <div>
                                      <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                        <MapPin className="w-4 h-4" />
                                        Property Details:
                                      </h4>
                                      <div className="text-sm text-slate-600 space-y-1">
                                        <p className="font-semibold text-slate-900">
                                          {propertyAddress}
                                        </p>
                                        <p>
                                          <span className="font-semibold">
                                            Type:
                                          </span>{" "}
                                          {propertyType}
                                        </p>
                                        <p>
                                          <span className="font-semibold">
                                            Size:
                                          </span>{" "}
                                          {propertySize} sqm
                                        </p>
                                        <p>
                                          <span className="font-semibold">
                                            Rooms:
                                          </span>{" "}
                                          {rooms} | Bathrooms: {bathrooms}
                                        </p>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="mt-6 pt-6 border-t border-slate-300">
                                    <h4 className="text-sm font-semibold text-slate-700 mb-2">
                                      Quote Details:
                                    </h4>
                                    <div className="text-sm text-slate-600 space-y-1">
                                      <p>
                                        <span className="font-semibold">
                                          Number:
                                        </span>{" "}
                                        {quoteNumber}
                                      </p>
                                      <p>
                                        <span className="font-semibold">
                                          Date:
                                        </span>{" "}
                                        {new Date().toLocaleDateString()}
                                      </p>
                                      <p>
                                        <span className="font-semibold">
                                          Type:
                                        </span>{" "}
                                        {documentType === "quote"
                                          ? "Quote"
                                          : "Invoice"}
                                      </p>
                                      <p>
                                        <span className="font-semibold">
                                          Status:
                                        </span>{" "}
                                        <span className="text-amber-600 font-bold">
                                          Pending
                                        </span>
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {/* Action Buttons */}
                                {quoteId && (
                                  <div className="mt-6 flex gap-3">
                                    <button
                                      onClick={handleProcessPayment}
                                      className="flex-1 group flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-emerald-500/50 hover:scale-105"
                                    >
                                      <CreditCard className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                                      Process Payment
                                    </button>
                                  </div>
                                )}
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
                                <span className="hidden sm:inline">
                                  Previous
                                </span>
                              </button>

                              <div className="text-sm text-slate-600 font-bold bg-white px-4 py-2 rounded-lg border border-slate-200">
                                Step {currentStep} of {totalSteps}
                              </div>

                              {currentStep < totalSteps ? (
                                <button
                                  onClick={handleNext}
                                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-lg font-semibold hover:from-cyan-700 hover:to-teal-700 transition-all shadow-md hover:shadow-lg"
                                >
                                  <span className="hidden sm:inline">Next</span>
                                  <ChevronRight className="w-5 h-5" />
                                </button>
                              ) : (
                                <button
                                  onClick={handleSaveQuote}
                                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg font-semibold hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-md hover:shadow-lg"
                                >
                                  <Save className="w-5 h-5" />
                                  Save{" "}
                                  {documentType === "quote"
                                    ? "Quote"
                                    : "Invoice"}
                                </button>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Quote/Invoice Preview - This remains at the end */}
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
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CleaningDashboard;
