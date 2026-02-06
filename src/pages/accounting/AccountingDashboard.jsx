import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import HomeView from "../HomeView";
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
import { Printer, Download, Sparkles } from "lucide-react";
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

const AccountingDashboard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Invoice");
  const { user, authUser } = useAuth();
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceId, setInvoiceId] = useState(null);
  const [savedInvoices, setSavedInvoices] = useState([]);
  const [showInvoicesList, setShowInvoicesList] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeView, setActiveView] = useState("home");
  const [currentInvoiceId, setCurrentInvoiceId] = useState(null);
  const [savedCustomers, setSavedCustomers] = useState([]);
  const [showCustomersListModal, setShowCustomersListModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("professional");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [inputMode, setInputMode] = useState("manual");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isInvoicingOpen, setIsInvoicingOpen] = useState(false);
  const [isClientsOpen, setIsClientsOpen] = useState(false);

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
    if (extractedData.customer.tax_id) setTaxId(extractedData.customer.tax_id);

    if (extractedData.billTo.name) setBillName(extractedData.billTo.name);
    if (extractedData.billTo.email) setBillEmail(extractedData.billTo.email);
    if (extractedData.billTo.phone) setBillPhone(extractedData.billTo.phone);
    if (extractedData.billTo.address)
      setBillAddress(extractedData.billTo.address);

    if (extractedData.items && extractedData.items.length > 0) {
      setItems(extractedData.items);
    }

    alert("✅ Data extracted and populated successfully!");
  };

  useEffect(() => {
    if (!user?.uid) return;

    const loadInvoiceNumber = async () => {
      const nextInvoice = await generateInvoiceNumber(user.uid, documentType);
      setInvoiceNumber(nextInvoice);
    };

    loadInvoiceNumber();
    loadSavedInvoices();
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
    { number: 2, title: "Billing Details", icon: Building },
    { number: 3, title: "Line Items", icon: FileText },
    { number: 4, title: "Payment Terms", icon: CreditCard },
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
    const collectionName =
      documentType === "estimate" ? "estimates" : "invoices";
    const invoicesRef = collection(db, "users", user.uid, collectionName);
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
    setCustomerName(customer.name || "");
    setCustomerEmail(customer.email || "");
    setCustomerPhone(customer.phone || "");
    setCustomerAddress(customer.address || "");
    setTaxId(customer.tax_id || "");
    setBillName(customer.name || "");
    setBillEmail(customer.email || "");
    setBillPhone(customer.phone || "");
    setBillAddress(customer.address || "");
  };

  const handleCustomerSaved = () => {
    loadCustomers();
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    loadPaymentStatus();
  }, [invoiceId, user?.uid, documentType]);

  const loadInvoice = (invoice) => {
    setInvoiceId(invoice.id);
    setInvoiceNumber(invoice.invoiceNumber || "");
    setCustomerName(invoice.customer?.name || "");
    setCustomerEmail(invoice.customer?.email || "");
    setCustomerPhone(invoice.customer?.phone || "");
    setCustomerAddress(invoice.customer?.address || "");
    setTaxId(invoice.customer?.tax_id || "");
    setItems(invoice.items || []);
    setShowInvoicesList(false);
    setPaymentStatus({
      totalPaid: invoice.totals?.paid || 0,
      balanceDue: invoice.totals?.due || invoice.totals?.total || 0,
      status: invoice.status || "pending",
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

  const loadInvoiceForExport = async () => {
    if (!user?.uid || !invoiceId) return null;

    const db = getFirestore();
    const collectionName =
      documentType === "estimate" ? "estimates" : "invoices";
    const snap = await getDoc(
      doc(db, "users", user.uid, collectionName, invoiceId),
    );

    return snap.exists() ? snap.data() : null;
  };

  const handleSavePDF = async () => {
    const savedInvoice = await loadInvoiceForExport();

    if (!savedInvoice) {
      alert(`Please save the ${documentType} before exporting PDF`);
      return;
    }

    setInvoiceNumber(savedInvoice.invoiceNumber);
    setItems(savedInvoice.items);
    setCustomerName(savedInvoice.customer.name);
    setCustomerEmail(savedInvoice.customer.email);
    setCustomerPhone(savedInvoice.customer.phone);
    setCustomerAddress(savedInvoice.customer.address);

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
      category: newItem.category || "Service",
      rate,
      qty,
      amount,
      taxRate,
      taxAmount,
      totalAmount,
    };

    setItems((prev) => [...prev, item]);
    setNewItem({
      description: "",
      rate: "",
      qty: "",
      category: "Service",
      taxRate: "15",
    });
  };

  const [customerName, setCustomerName] = useState("ABC Corporation");
  const [taxId, setTaxId] = useState("TAX-123-456-789");
  const [customerEmail, setCustomerEmail] = useState("contact@abccorp.com");
  const [customerPhone, setCustomerPhone] = useState("+27 11 123 4567");
  const [customerAddress, setCustomerAddress] = useState(
    "123 Business Park, Sandton, Johannesburg, 2196",
  );
  const [billName, setBillName] = useState("ABC Corporation");
  const [billEmail, setBillEmail] = useState("billing@abccorp.com");
  const [billPhone, setBillPhone] = useState("+27 11 123 4567");
  const [billAddress, setBillAddress] = useState(
    "123 Business Park, Sandton, Johannesburg, 2196",
  );

  const [businessInfo, setBusinessInfo] = useState({
    businessName: "PROFESSIONAL ACCOUNTING SERVICES",
    addressLine1: "456 Financial Plaza",
    addressLine2: "Rosebank",
    city: "Johannesburg",
    postalCode: "2196",
    primaryPhone: "+27 11 555 0001",
    secondaryPhone: "+27 11 555 0002",
    email: "info@proaccounting.co.za",
    website: "www.proaccounting.co.za",
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
    category: "Service",
    taxRate: "15",
  });

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const totalTax = items.reduce((sum, item) => sum + item.taxAmount, 0);
  const total = subtotal + totalTax;

  useEffect(() => {
    if (!invoiceId) {
      setPaymentStatus({
        totalPaid: 0,
        balanceDue: total,
        status: "pending",
      });
    }
  }, [total, invoiceId]);

  const buildInvoicePayload = (numberToUse) => ({
    invoiceNumber: numberToUse,
    locked: true,
    status: "pending",
    documentType: documentType,

    dates: {
      invoiceDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    },

    customer: {
      name: customerName,
      email: customerEmail,
      phone: customerPhone,
      address: customerAddress,
      tax_id: taxId,
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

  const handleSaveInvoice = async () => {
    if (!user?.uid) return;

    const db = getFirestore();
    let numberToUse = invoiceNumber;

    if (!invoiceId) {
      numberToUse = await generateInvoiceNumber(user.uid, documentType);
      setInvoiceNumber(numberToUse);
    }

    const invoiceData = buildInvoicePayload(numberToUse);

    const collectionName =
      documentType === "estimate" ? "estimates" : "invoices";

    if (invoiceId) {
      await updateDoc(doc(db, "users", user.uid, collectionName, invoiceId), {
        ...invoiceData,
        updatedAt: serverTimestamp(),
      });
    } else {
      const ref = await addDoc(
        collection(db, "users", user.uid, collectionName),
        invoiceData,
      );
      setInvoiceId(ref.id);
    }

    alert(
      `${documentType === "estimate" ? "Estimate" : "Invoice"} saved successfully`,
    );
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
    setCustomerName("ABC Corporation");
    setTaxId("TAX-123-456-789");
    setCustomerEmail("contact@abccorp.com");
    setCustomerPhone("+27 11 123 4567");
    setCustomerAddress("123 Business Park, Sandton, Johannesburg, 2196");
    setItems([]);

    const loadNewNumber = async () => {
      if (user?.uid) {
        const nextInvoice = await generateInvoiceNumber(user.uid, documentType);
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
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-6">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Collapsed Sidebar */}
      <div
        className={`${
          sidebarOpen ? "hidden" : "hidden md:block"
        } fixed z-40 w-16 md:w-20 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700/50 h-full print:hidden transition-all duration-300 shadow-2xl`}
      >
        <div className="flex flex-col items-center py-4 md:py-6 space-y-4 md:space-y-6 ">
          <button
            onClick={() => setSidebarOpen(true)}
            className="group p-2 md:p-3 text-slate-400 hover:text-white hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-700 rounded-xl transition-all duration-300 shadow-lg hover:shadow-blue-500/50 hover:scale-110"
            title="Expand Sidebar"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6 group-hover:animate-pulse" />
          </button>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300"></div>
            <div className="relative w-10 h-10 md:w-12 md:h-12 mb-2 md:mb-4  rounded-xl p-1 shadow-lg">
              <img src={logo} alt="" />
            </div>
          </div>

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

            {!isMobile && (
              <>
                <button
                  onClick={() => setActiveView("financial-overview")}
                  className="group relative p-2 md:p-3 text-slate-400 hover:text-white rounded-xl transition-all duration-300 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center overflow-hidden"
                  title="Financial Dashboard"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <TrendingUp className="w-5 h-5 md:w-6 md:h-6 relative z-10 group-hover:scale-110 transition-transform duration-300" />
                </button>

                <button
                  onClick={() => {
                    handleNewInvoiceDoc();
                    setActiveView("invoice");
                  }}
                  className="group relative p-2 md:p-3 text-slate-400 hover:text-white rounded-xl transition-all duration-300 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center overflow-hidden"
                  title="Invoices"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <Receipt className="w-5 h-5 md:w-6 md:h-6 relative z-10 group-hover:scale-110 transition-transform duration-300" />
                </button>

                <button
                  onClick={() => setShowCustomersListModal(true)}
                  className="group relative p-2 md:p-3 text-slate-400 hover:text-white rounded-xl transition-all duration-300 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center overflow-hidden"
                  title="Clients"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <Users className="w-5 h-5 md:w-6 md:h-6 relative z-10 group-hover:scale-110 transition-transform duration-300" />
                </button>
              </>
            )}
          </div>
        </div>

        <div className="absolute bottom-4 md:bottom-6 left-0 right-0 flex justify-center">
          <div className="relative group">
            <div className="absolute inset-0 rounded-full opacity-50 group-hover:opacity-100 blur-md transition-opacity duration-300"></div>
            <div className="relative w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-full flex items-center justify-center ring-2 ring-cyan-700 shadow-lg group-hover:ring-4 group-hover:ring-cyan-500/50 transition-all duration-300">
              <img src={businessInfo.logoUrl} alt="" />
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Sidebar */}
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
                <div className="relative  p-1 rounded-xl shadow-lg">
                 <img src={logo} alt="Company Logo" className="w-8 h-8 md:w-10 md:h-10" />
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
            <div
  onClick={() => setActiveView("home")}  // ADD THIS
  className="group flex items-center space-x-2 md:space-x-3 px-3 md:px-4 py-2.5 md:py-3 text-cyan-300 hover:text-white hover:bg-gradient-to-r hover:from-stone-600/20 hover:to-stone-700/20 rounded-xl cursor-pointer transition-all duration-300 border border-transparent hover:border-cyan-500/30"
>
  <Home className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
  <span className="text-xs md:text-sm font-semibold">Home</span>
</div>

            <div
              onClick={() => setShowSettings(true)}
              className="group flex items-center space-x-2 md:space-x-3 px-3 md:px-4 py-2.5 md:py-3 text-slate-300 hover:text-white hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-purple-700/20 rounded-xl cursor-pointer transition-all duration-300 border border-transparent hover:border-purple-500/30"
            >
              <Settings className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0 group-hover:rotate-90 transition-transform duration-500" />
              <span className="text-xs md:text-sm font-semibold">Settings</span>
            </div>

            <div className="pt-3 md:pt-4 mt-3 md:mt-4 border-t border-slate-700/50">
              <div
                onClick={() => setActiveView("financial-overview")}
                className="group flex items-center space-x-2 md:space-x-3 px-3 md:px-4 py-2.5 md:py-3 text-slate-300 hover:text-white hover:bg-gradient-to-r hover:from-emerald-600/20 hover:to-emerald-700/20 rounded-xl cursor-pointer transition-all duration-300 border border-transparent hover:border-emerald-500/30"
              >
                <TrendingUp className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                <span className="text-xs md:text-sm font-semibold truncate">
                  Financial Dashboard
                </span>
              </div>

              <div className="mt-2 md:mt-3">
                <div
                  onClick={() => setIsInvoicingOpen(!isInvoicingOpen)}
                  className="group flex items-center justify-between px-3 md:px-4 py-2.5 md:py-3 text-slate-300 hover:text-white hover:bg-gradient-to-r hover:from-orange-600/20 hover:to-orange-700/20 rounded-xl cursor-pointer transition-all duration-300 border border-transparent hover:border-orange-500/30"
                >
                  <div className="flex items-center space-x-2 md:space-x-3 min-w-0">
                    <Receipt className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                    <span className="text-xs md:text-sm font-semibold truncate">
                      Invoicing
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

              {!isMobile && (
                <>
                  <div
                    onClick={() => setActiveView("templates")}
                    className="group flex items-center space-x-2 md:space-x-3 px-3 md:px-4 py-2.5 md:py-3 text-slate-300 hover:text-white hover:bg-gradient-to-r hover:from-indigo-600/20 hover:to-indigo-700/20 rounded-xl cursor-pointer transition-all duration-300 mt-2 border border-transparent hover:border-indigo-500/30"
                  >
                    <FileText className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                    <span className="text-xs md:text-sm font-semibold truncate">
                      Invoice Templates
                    </span>
                  </div>

                  <div
                    onClick={() => setActiveView("reports")}
                    className="group flex items-center space-x-2 md:space-x-3 px-3 md:px-4 py-2.5 md:py-3 text-slate-300 hover:text-white hover:bg-gradient-to-r hover:from-cyan-600/20 hover:to-cyan-700/20 rounded-xl cursor-pointer transition-all duration-300 border border-transparent hover:border-cyan-500/30"
                  >
                    <BarChart3 className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                    <span className="text-xs md:text-sm font-semibold truncate">
                      Reports
                    </span>
                  </div>

                  <div
                    onClick={() => setActiveView("expenses")}
                    className="group flex items-center space-x-2 md:space-x-3 px-3 md:px-4 py-2.5 md:py-3 text-slate-300 hover:text-white hover:bg-gradient-to-r hover:from-rose-600/20 hover:to-rose-700/20 rounded-xl cursor-pointer transition-all duration-300 border border-transparent hover:border-rose-500/30"
                  >
                    <TrendingDown className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                    <span className="text-xs md:text-sm font-semibold truncate">
                      Expenses
                    </span>
                  </div>
                </>
              )}
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

      {/* Main Content Area */}
      <div
        className={`flex-1 transition-all duration-300 ${sidebarOpen ? "ml-0 lg:ml-72" : "ml-2 md:ml-20"}`}
      >
        <div className="flex flex-col h-screen">
          {/* Header */}
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
                  <div className="hidden sm:flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-xl shadow-lg flex-shrink-0">
                    <img
                      src={businessInfo.logoUrl}
                      className="w-4 h-4 md:w-5 md:h-5 text-white"
                    />
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-sm md:text-lg lg:text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent truncate">
                      {documentType === "estimate" ? "Estimate" : "Invoice"} #
                      {invoiceNumber || "—"}
                    </h1>
                    <p className="text-xs text-slate-500 hidden md:block truncate">
                      Create and manage your{" "}
                      {documentType === "estimate" ? "estimates" : "invoices"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Desktop Action Buttons */}
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

          {/* Mobile Action Bar */}
          <div className="flex-shrink-0 lg:hidden bg-white/90 backdrop-blur-md px-3 md:px-4 py-2.5 md:py-3 print:hidden border-b border-slate-200 overflow-x-auto">
            <div className="flex gap-2 min-w-max pb-1">
              {documentType === "estimate" && invoiceId && (
                <button
                  onClick={handleConvertToInvoice}
                  className="group flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 md:py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg md:rounded-xl hover:from-purple-700 hover:to-purple-800 whitespace-nowrap text-xs md:text-sm font-semibold shadow-lg transition-all duration-300 active:scale-95"
                >
                  <FileText className="w-3.5 h-3.5 md:w-4 md:h-4 group-hover:rotate-12 transition-transform duration-300" />
                  <span>To Invoice</span>
                </button>
              )}
              <button
                onClick={handleProcessPayment}
                disabled={!invoiceId}
                className={`group flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 md:py-2.5 rounded-lg md:rounded-xl whitespace-nowrap text-xs md:text-sm font-semibold shadow-lg transition-all duration-300 active:scale-95 ${
                  !invoiceId
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:from-emerald-700 hover:to-emerald-800"
                }`}
              >
                <CreditCard className="w-3.5 h-3.5 md:w-4 md:h-4" />
                Payment
              </button>
              <button
                onClick={handleSaveInvoice}
                className="group flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 md:py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-lg md:rounded-xl hover:from-amber-700 hover:to-amber-800 whitespace-nowrap text-xs md:text-sm font-semibold shadow-lg transition-all duration-300 active:scale-95"
              >
                <Save className="w-3.5 h-3.5 md:w-4 md:h-4 group-hover:scale-110 transition-transform duration-300" />
                Save
              </button>

              <button className="group flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 md:py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg md:rounded-xl hover:from-blue-700 hover:to-blue-800 whitespace-nowrap text-xs md:text-sm font-semibold shadow-lg transition-all duration-300 active:scale-95">
                <Send className="w-3.5 h-3.5 md:w-4 md:h-4 group-hover:translate-x-1 transition-transform duration-300" />
                <span>Send</span>
              </button>

              <button
                onClick={handleSavePDF}
                className="group flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 md:py-2.5 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg md:rounded-xl hover:from-orange-700 hover:to-orange-800 whitespace-nowrap text-xs md:text-sm font-semibold shadow-lg transition-all duration-300 active:scale-95"
              >
                <Download className="w-3.5 h-3.5 md:w-4 md:h-4 group-hover:translate-y-0.5 transition-transform duration-300" />
                <span>PDF</span>
              </button>

              <button
                onClick={handlePrint}
                className="group flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 md:py-2.5 bg-white border-2 border-slate-200 text-slate-700 rounded-lg md:rounded-xl hover:bg-slate-50 whitespace-nowrap text-xs md:text-sm font-semibold shadow-sm transition-all duration-300 active:scale-95"
              >
                <Printer className="w-3.5 h-3.5 md:w-4 md:h-4 group-hover:scale-110 transition-transform duration-300" />
                <span>Print</span>
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
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

                  <div className="overflow-auto p-4 md:p-6 bg-gradient-to-b from-slate-50 to-white flex-1">
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

                      {/* Business Information Fields */}
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
                          placeholder="Professional Accounting Services"
                        />
                      </div>

                      {/* Additional fields similar to above */}
                      <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 border-2 border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
                        <label className="block text-sm font-bold text-slate-700 mb-2 md:mb-3">
                          Registration Number
                        </label>
                        <input
                          type="text"
                          value={businessInfo.registrationNumber}
                          onChange={(e) =>
                            setBusinessInfo({
                              ...businessInfo,
                              registrationNumber: e.target.value,
                            })
                          }
                          className="w-full px-3 md:px-4 py-2 md:py-3 border-2 border-slate-200 rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-sm md:text-base"
                          placeholder="2024/123456/07"
                        />
                      </div>

                      <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 border-2 border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
                        <label className="block text-sm font-bold text-slate-700 mb-2 md:mb-3">
                          VAT Number
                        </label>
                        <input
                          type="text"
                          value={businessInfo.vatNumber}
                          onChange={(e) =>
                            setBusinessInfo({
                              ...businessInfo,
                              vatNumber: e.target.value,
                            })
                          }
                          className="w-full px-3 md:px-4 py-2 md:py-3 border-2 border-slate-200 rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-sm md:text-base"
                          placeholder="4123456789"
                        />
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

            {showInvoicesList && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
                  <div className="p-4 border-b flex items-center justify-between">
                    <h2 className="text-xl font-semibold">
                      Saved{" "}
                      {documentType === "estimate" ? "Estimates" : "Invoices"}
                    </h2>
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
                        No saved{" "}
                        {documentType === "estimate" ? "estimates" : "invoices"}{" "}
                        yet
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {savedInvoices.map((invoice) => (
                          <div
                            key={invoice.id}
                            onClick={() => loadInvoice(invoice)}
                            className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="font-semibold text-lg">
                                  {invoice.invoiceNumber || "N/A"}
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                  Client: {invoice.customer?.name || "N/A"}
                                </div>
                                <div className="text-sm text-gray-600">
                                  Email: {invoice.customer?.email || "N/A"}
                                </div>
                              </div>

                              <div className="text-right">
                                <div className="text-lg font-semibold text-orange-600">
                                  R{invoice.totals?.total?.toFixed(2) || "0.00"}
                                </div>
                                {invoice.totals?.paid > 0 && (
                                  <div className="text-sm text-emerald-600 font-semibold">
                                    Paid: R{invoice.totals.paid.toFixed(2)}
                                  </div>
                                )}
                                {invoice.totals?.due > 0 && (
                                  <div className="text-sm text-rose-600 font-semibold">
                                    Due: R{invoice.totals.due.toFixed(2)}
                                  </div>
                                )}
                                <div
                                  className={`text-xs mt-1 px-2 py-1 rounded ${
                                    invoice.status === "paid"
                                      ? "bg-emerald-100 text-emerald-700"
                                      : invoice.status === "partially_paid"
                                        ? "bg-amber-100 text-amber-700"
                                        : invoice.status === "pending"
                                          ? "bg-blue-100 text-blue-700"
                                          : "bg-gray-100 text-gray-700"
                                  }`}
                                >
                                  {invoice.status === "paid"
                                    ? "Paid"
                                    : invoice.status === "partially_paid"
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
            {activeView === "history-view" && <HistoryView user={user} />}
            {activeView === "notes-view" && <NotesView user={user} />}
            {activeView === "templates" && <Templates user={user} />}
            {activeView === "home" && <HomeView user={user} />}
            {activeView === "invoice" && (
              <div className="grid grid-cols-1 gap-6 px-4 sm:px-6 lg:px-8 xl:px-12">
                <div className="space-y-6">
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

                      {/* Payment Status Banner */}
                      {invoiceId && (
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
                                  <CreditCard className="w-6 h-6 text-amber-600" />
                                </div>
                                <div>
                                  <div className="font-bold text-amber-900">
                                    Partial Payment Received
                                  </div>
                                  <div className="text-sm text-amber-700">
                                    R{paymentStatus.totalPaid.toFixed(2)} paid •
                                    R{paymentStatus.balanceDue.toFixed(2)}{" "}
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
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                  <Users className="w-6 h-6 text-blue-600" />
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
                                  Company Name{" "}
                                  <span className="text-rose-500">*</span>
                                </label>
                                <input
                                  type="text"
                                  value={customerName}
                                  onChange={(e) =>
                                    setCustomerName(e.target.value)
                                  }
                                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white hover:border-slate-400"
                                  placeholder="Enter company  name"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                  Tax ID
                                </label>
                                <input
                                  type="text"
                                  value={taxId}
                                  onChange={(e) => setTaxId(e.target.value)}
                                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white hover:border-slate-400"
                                  placeholder="TAX-123-456-789"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                  Email <span className="text-rose-500">*</span>
                                </label>
                                <input
                                  type="email"
                                  value={customerEmail}
                                  onChange={(e) =>
                                    setCustomerEmail(e.target.value)
                                  }
                                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white hover:border-slate-400"
                                  placeholder="contact@example.com"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                  Phone <span className="text-rose-500">*</span>
                                </label>
                                <input
                                  type="tel"
                                  value={customerPhone}
                                  onChange={(e) =>
                                    setCustomerPhone(e.target.value)
                                  }
                                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white hover:border-slate-400"
                                  placeholder="+27 11 123 4567"
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
                                  placeholder="123 Business Park, Sandton, Johannesburg, 2196"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Step 2: Billing Details */}
                        {currentStep === 2 && (
                          <div className="p-8">
                            <div className="mb-8">
                              <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                                  <Building className="w-6 h-6 text-emerald-600" />
                                </div>
                                Billing Details
                              </h2>
                              <p className="text-slate-600 mt-2 ml-13">
                                Enter billing contact information
                              </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                              <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                  Billing Contact Name
                                </label>
                                <input
                                  type="text"
                                  value={billName}
                                  onChange={(e) => setBillName(e.target.value)}
                                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white hover:border-slate-400"
                                  placeholder="Billing contact name"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                  Billing Email
                                </label>
                                <input
                                  type="email"
                                  value={billEmail}
                                  onChange={(e) => setBillEmail(e.target.value)}
                                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white hover:border-slate-400"
                                  placeholder="billing@example.com"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                  Billing Phone
                                </label>
                                <input
                                  type="tel"
                                  value={billPhone}
                                  onChange={(e) => setBillPhone(e.target.value)}
                                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white hover:border-slate-400"
                                  placeholder="+27 11 123 4567"
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
                                  placeholder="Billing address if different from company address"
                                />
                              </div>
                            </div>

                            {/* Quick Copy Option */}
                            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                              <button
                                onClick={() => {
                                  setBillName(customerName);
                                  setBillEmail(customerEmail);
                                  setBillPhone(customerPhone);
                                  setBillAddress(customerAddress);
                                }}
                                className="flex items-center gap-2 text-blue-700 hover:text-blue-800 font-semibold transition-colors"
                              >
                                <Users className="w-4 h-4" />
                                Copy from Client Information
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Step 3: Line Items */}
                        {currentStep === 3 && (
                          <div className="p-8">
                            <div className="mb-8">
                              <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                  <FileText className="w-6 h-6 text-purple-600" />
                                </div>
                                Line Items
                              </h2>
                              <p className="text-slate-600 mt-2 ml-13">
                                Add products or services to the invoice
                              </p>
                            </div>

                            {/* Add Item Form */}
                            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 mb-6 border border-slate-200">
                              <h3 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
                                <Plus className="w-5 h-5 text-blue-600" />
                                Add New Item
                              </h3>
                              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                                <div className="sm:col-span-5">
                                  <input
                                    type="text"
                                    placeholder="Description / Service"
                                    value={newItem.description}
                                    onChange={(e) =>
                                      setNewItem({
                                        ...newItem,
                                        description: e.target.value,
                                      })
                                    }
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white hover:border-slate-400"
                                  />
                                </div>

                                <div className="sm:col-span-2">
                                  <select
                                    value={newItem.category}
                                    onChange={(e) =>
                                      setNewItem({
                                        ...newItem,
                                        category: e.target.value,
                                      })
                                    }
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-sm font-medium hover:border-slate-400"
                                  >
                                    <option value="Service">Service</option>
                                    <option value="Product">Product</option>
                                    <option value="Consulting">
                                      Consulting
                                    </option>
                                    <option value="Other">Other</option>
                                  </select>
                                </div>

                                <div className="sm:col-span-2">
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
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white hover:border-slate-400"
                                  />
                                </div>

                                <div className="sm:col-span-1">
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
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white hover:border-slate-400"
                                  />
                                </div>

                                <div className="sm:col-span-2">
                                  <button
                                    onClick={handleAddItem}
                                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg px-4 py-2 hover:from-blue-700 hover:to-blue-800 flex items-center justify-center gap-2 transition-all font-semibold shadow-md hover:shadow-lg"
                                  >
                                    <Plus className="w-4 h-4" />
                                    Add
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Items List */}
                            {items.length > 0 ? (
                              <div className="mb-6">
                                <h3 className="text-lg font-bold text-slate-900 mb-4">
                                  Items Added ({items.length})
                                </h3>
                                <div className="overflow-x-auto rounded-xl border border-slate-200">
                                  <table className="w-full">
                                    <thead>
                                      <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                                        <th className="px-4 py-4 text-left text-sm font-bold text-slate-700">
                                          Description
                                        </th>
                                        <th className="px-4 py-4 text-left text-sm font-bold text-slate-700">
                                          Category
                                        </th>
                                        <th className="px-4 py-4 text-right text-sm font-bold text-slate-700">
                                          Rate
                                        </th>
                                        <th className="px-4 py-4 text-right text-sm font-bold text-slate-700">
                                          Qty
                                        </th>
                                        <th className="px-4 py-4 text-right text-sm font-bold text-slate-700">
                                          Tax
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
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                                              {item.category || "Service"}
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
                                  Add products or services using the form above
                                </p>
                              </div>
                            )}

                            {/* Total Summary */}
                            {items.length > 0 && (
                              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
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

                        {/* Step 4: Payment Terms */}
                        {currentStep === 4 && (
                          <div className="p-8">
                            <div className="mb-8">
                              <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                                  <CreditCard className="w-6 h-6 text-emerald-600" />
                                </div>
                                Payment Terms & Summary
                              </h2>
                              <p className="text-slate-600 mt-2 ml-13">
                                Review invoice details and payment information
                              </p>
                            </div>

                            {/* Invoice Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                                <div className="flex items-center justify-between mb-3">
                                  <span className="text-sm font-semibold text-blue-700">
                                    Invoice Total
                                  </span>
                                  <DollarSign className="w-5 h-5 text-blue-600" />
                                </div>
                                <div className="text-3xl font-bold text-blue-900">
                                  R{total.toFixed(2)}
                                </div>
                              </div>

                              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-xl border border-emerald-200">
                                <div className="flex items-center justify-between mb-3">
                                  <span className="text-sm font-semibold text-emerald-700">
                                    Items Count
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
                                    Tax Amount
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
                                    Net 30 Days
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
                                    Late Payment Fee:
                                  </span>
                                  <span className="font-bold text-slate-900">
                                    2% per month
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

                            {/* Client Summary */}
                            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200">
                              <h3 className="text-lg font-bold text-slate-900 mb-4">
                                Invoice Summary
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                  <h4 className="text-sm font-semibold text-slate-700 mb-2">
                                    Bill To:
                                  </h4>
                                  <div className="text-sm text-slate-600 space-y-1">
                                    <p className="font-semibold text-slate-900">
                                      {customerName}
                                    </p>
                                    <p>{customerEmail}</p>
                                    <p>{customerPhone}</p>
                                    <p>{customerAddress}</p>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="text-sm font-semibold text-slate-700 mb-2">
                                    Invoice Details:
                                  </h4>
                                  <div className="text-sm text-slate-600 space-y-1">
                                    <p>
                                      <span className="font-semibold">
                                        Number:
                                      </span>{" "}
                                      {invoiceNumber}
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
                                      {documentType === "estimate"
                                        ? "Estimate"
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
                            </div>

                            {/* Action Buttons */}
                            {invoiceId && (
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
                              onClick={handleSaveInvoice}
                              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg font-semibold hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-md hover:shadow-lg"
                            >
                              <Save className="w-5 h-5" />
                              Save{" "}
                              {documentType === "estimate"
                                ? "Estimate"
                                : "Invoice"}
                            </button>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Invoice Preview - This remains at the end */}
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
                    invoiceNumber={invoiceNumber}
                    customerName={customerName}
                    billName={billName}
                    billEmail={billEmail}
                    billPhone={billPhone}
                    billAddress={billAddress}
                    customerEmail={customerEmail}
                    customerPhone={customerPhone}
                    customerAddress={customerAddress}
                    taxId={taxId}
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

export default AccountingDashboard;
