import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { serverTimestamp } from "firebase/firestore";
import logo from "../../assets/img/solidflo-logo.png";
import v8logo from "../../assets/img/v8-logo.png";
import { getAuth, signOut } from "firebase/auth";
import FinancialOverview from "../FinancialOverview";
import Vehicles from "./Vehicles";
import PartsInventory from "./PartsInventory";
import { uploadLogoToR2 } from "../../utils/cloudflareUpload";
import Templates from "./Templates";
import TemplateSelector, { TemplateRenderer } from "./TemplateSelector";
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
} from "lucide-react";

const generateJobCardNumber = async (userId, documentType) => {
  const db = getFirestore();
  const year = new Date().getFullYear();

  // Use different collection based on document type
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

const MechanicsDashboard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("JobCard");
  const [showJobCard, setShowJobCard] = useState(false);
  const { user } = useAuth();
  const [jobCardNumber, setJobCardNumber] = useState("");
  const [jobCardId, setJobCardId] = useState(null);
  const [savedJobCards, setSavedJobCards] = useState([]);
  const [showJobCardsList, setShowJobCardsList] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCustomersList, setShowCustomersList] = useState(false);
  const [activeView, setActiveView] = useState("invoice");
  const [currentJobCardId, setCurrentJobCardId] = useState(null);
  const [savedCustomers, setSavedCustomers] = useState([]);
  const [showCustomersListModal, setShowCustomersListModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [activeTemplate, setActiveTemplate] = useState("classic");
  const [selectedTemplate, setSelectedTemplate] = useState("professional");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [inputMode, setInputMode] = useState("manual"); // 'manual' or 'ai'
  const [useAI, setUseAI] = useState(false);

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

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  // NEW: Document type state (quote or invoice)
  const [documentType, setDocumentType] = useState("invoice");
  const handleAIDataExtracted = (extractedData) => {
    // Customer info
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

    // Bill To info
    if (extractedData.billTo.name) setBillName(extractedData.billTo.name);
    if (extractedData.billTo.email) setBillEmail(extractedData.billTo.email);
    if (extractedData.billTo.phone) setBillPhone(extractedData.billTo.phone);
    if (extractedData.billTo.address)
      setBillAddress(extractedData.billTo.address);

    // Vehicle info
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

    // Items
    if (extractedData.items && extractedData.items.length > 0) {
      setItems(extractedData.items);
    }

    alert("✅ Data extracted and populated successfully!");
  };
  useEffect(() => {
    if (!user?.uid) return;

    const loadJobCardNumber = async () => {
      const nextJobCard = await generateJobCardNumber(user.uid, documentType);
      setJobCardNumber(nextJobCard);
    };

    loadJobCardNumber();
    loadSavedJobCards();
  }, [user, documentType]);
  const steps = [
    { number: 1, title: "Customer Info", icon: Users },
    { number: 2, title: "Vehicle Info", icon: Car },
    { number: 3, title: "Services/Parts", icon: FileText },
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
    if (!file || !user?.uid) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    try {
      // Show loading state
      setBusinessInfo({ ...businessInfo, uploading: true });

      // Upload to Cloudflare R2
      const logoUrl = await uploadLogoToR2(file, user.uid);

      // Update business info state
      setBusinessInfo({
        ...businessInfo,
        logoUrl: logoUrl,
        uploading: false,
      });

      // Save to Firebase Firestore
      const db = getFirestore();
      const docRef = doc(db, "users", user.uid, "settings", "businessInfo");
      await updateDoc(docRef, {
        logoUrl: logoUrl,
        updatedAt: new Date().toISOString(),
      });

      alert("Logo uploaded successfully!");
    } catch (error) {
      console.error("Error uploading logo:", error);
      alert("Failed to upload logo: " + error.message);
      setBusinessInfo({ ...businessInfo, uploading: false });
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
    window.print();
  };

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

  const buildJobCardPayload = (numberToUse) => ({
    jobCardNumber: numberToUse,
    locked: true,
    status: "pending",
    documentType: documentType, // NEW: Store document type

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
      numberToUse = await generateJobCardNumber(user.uid, documentType);
      setJobCardNumber(numberToUse);
    }

    const jobCardData = buildJobCardPayload(numberToUse);

    // NEW: Save to different collection based on document type
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

  // NEW: Convert Quote to Invoice
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

      // Generate new invoice number
      const newInvoiceNumber = await generateJobCardNumber(user.uid, "invoice");

      // Create invoice data from current quote
      const invoiceData = buildJobCardPayload(newInvoiceNumber);
      invoiceData.documentType = "invoice";
      invoiceData.convertedFromQuote = jobCardId;
      invoiceData.convertedFromQuoteNumber = jobCardNumber;
      invoiceData.convertedAt = serverTimestamp();

      // Save to invoices collection
      const invoiceRef = await addDoc(
        collection(db, "users", user.uid, "invoices"),
        invoiceData,
      );

      // Update quote to mark as converted
      await updateDoc(doc(db, "users", user.uid, "quotations", jobCardId), {
        convertedToInvoice: true,
        convertedToInvoiceId: invoiceRef.id,
        convertedToInvoiceNumber: newInvoiceNumber,
        convertedAt: serverTimestamp(),
        status: "converted",
      });

      // Switch to invoice mode
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

  // NEW: Handle creating new quote
  const handleNewQuote = () => {
    setDocumentType("quote");
    handleNewJobCard();
  };

  // NEW: Handle creating new invoice/job card
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
        const nextJobCard = await generateJobCardNumber(user.uid, documentType);
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
    <div className="flex h-screen bg-white">
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
    sidebarOpen ? "hidden" : "block"
  } fixed z-40 w-16 bg-gradient-to-b from-slate-900 to-slate-800 border-r border-slate-700 h-full print:hidden transition-all duration-300 shadow-xl`}
>
  <div className="flex flex-col items-center py-4 space-y-4">
    {/* Toggle Button */}
    <button
      onClick={() => setSidebarOpen(true)}
      className="p-2 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-200"
      title="Expand Sidebar"
    >
      <ChevronRight className="w-6 h-6" />
    </button>

    {/* Logo */}
    <div className="w-10 h-10 mb-4">
      <img
        src={logo}
        alt="Logo"
        className="w-full h-full object-contain rounded-lg"
      />
    </div>

    {/* Icon Navigation */}
    <div className="flex flex-col items-center space-y-3 w-full px-2">
      <button
        className="p-2 text-slate-300 hover:text-white hover:bg-blue-600/80 rounded-lg transition-all duration-200 w-10 h-10 flex items-center justify-center group"
        title="Home"
      >
        <Home className="w-5 h-5" />
      </button>

      <button
        onClick={() => setShowSettings(true)}
        className="p-2 text-slate-300 hover:text-white hover:bg-blue-600/80 rounded-lg transition-all duration-200 w-10 h-10 flex items-center justify-center group"
        title="Settings"
      >
        <Settings className="w-5 h-5" />
      </button>

      <button
        onClick={() => setActiveView("financial-overview")}
        className="p-2 text-slate-300 hover:text-white hover:bg-blue-600/80 rounded-lg transition-all duration-200 w-10 h-10 flex items-center justify-center group"
        title="Business Overview"
      >
        <TrendingUp className="w-5 h-5" />
      </button>

      <button
        onClick={() => {
          handleNewInvoice();
          setActiveView("invoice");
        }}
        className="p-2 text-slate-300 hover:text-white hover:bg-blue-600/80 rounded-lg transition-all duration-200 w-10 h-10 flex items-center justify-center group"
        title="Job Cards"
      >
        <ClipboardList className="w-5 h-5" />
      </button>

      <button
        onClick={() => setShowCustomersListModal(true)}
        className="p-2 text-slate-300 hover:text-white hover:bg-blue-600/80 rounded-lg transition-all duration-200 w-10 h-10 flex items-center justify-center group"
        title="Customers"
      >
        <Users className="w-5 h-5" />
      </button>

      <button
        onClick={() => setActiveView("templates")}
        className="p-2 text-slate-300 hover:text-white hover:bg-blue-600/80 rounded-lg transition-all duration-200 w-10 h-10 flex items-center justify-center group"
        title="Invoice Templates"
      >
        <FileText className="w-5 h-5" />
      </button>

      <button
        onClick={() => setActiveView("vehicles")}
        className="p-2 text-slate-300 hover:text-white hover:bg-blue-600/80 rounded-lg transition-all duration-200 w-10 h-10 flex items-center justify-center group"
        title="Vehicles"
      >
        <Car className="w-5 h-5" />
      </button>

      <button
        onClick={() => setActiveView("parts-inventory")}
        className="p-2 text-slate-300 hover:text-white hover:bg-blue-600/80 rounded-lg transition-all duration-200 w-10 h-10 flex items-center justify-center group"
        title="Parts Inventory"
      >
        <Package className="w-5 h-5" />
      </button>

      <button
        className="p-2 text-slate-300 hover:text-white hover:bg-blue-600/80 rounded-lg transition-all duration-200 w-10 h-10 flex items-center justify-center group"
        title="Payments"
      >
        <CreditCard className="w-5 h-5" />
      </button>
    </div>
  </div>

  {/* User Icon at Bottom */}
  <div className="absolute bottom-4 left-0 right-0 flex justify-center">
    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center ring-2 ring-slate-700 shadow-lg">
      <img src={v8logo} alt="" className="w-full h-full rounded-full" />
    </div>
  </div>
</div>

{/* Expanded Sidebar (Full Width) */}
<div
  className={`${
    sidebarOpen ? "translate-x-0" : "-translate-x-full"
  } fixed z-50 w-64 bg-gradient-to-b from-slate-900 to-slate-800 border-r border-slate-700 transition-transform duration-300 h-full print:hidden shadow-2xl`}
>
  <div className="p-4">
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center space-x-3">
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
      <div className="flex items-center space-x-3 px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200">
        <Home className="w-5 h-5" />
        <span className="font-medium">Home</span>
      </div>
      <div
        onClick={() => setShowSettings(true)}
        className="flex items-center space-x-3 px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200"
      >
        <Settings className="w-5 h-5" />
        <span className="font-medium">Settings</span>
      </div>

      <div className="pt-4 mt-4 border-t border-slate-700/50">
        <div
          onClick={() => setActiveView("financial-overview")}
          className="flex items-center space-x-3 px-3 py-2.5 text-slate-300 hover:text-white hover:bg-blue-600/20 hover:border-l-4 hover:border-blue-500 rounded-lg cursor-pointer transition-all duration-200"
        >
          <TrendingUp className="w-5 h-5" />
          <span className="font-medium">Business Overview</span>
        </div>

        <div className="mt-2">
          <div className="flex items-center justify-between px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200">
            <div className="flex items-center space-x-3">
              <ClipboardList className="w-5 h-5" />
              <span className="font-medium">Job Cards</span>
            </div>
            <ChevronDown className="w-4 h-4" />
          </div>

          <div className="ml-4 mt-1 space-y-1 border-l-2 border-slate-700/50 pl-4">
            <div
              onClick={() => {
                handleNewQuote();
                setActiveView("invoice");
              }}
              className="px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700/30 rounded-lg cursor-pointer transition-all duration-200"
            >
              Create Quote
            </div>
            <div
              onClick={() => {
                handleNewInvoice();
                setActiveView("invoice");
              }}
              className="px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700/30 rounded-lg cursor-pointer transition-all duration-200"
            >
              Create Invoice
            </div>
            <div
              onClick={() => setShowJobCardsList(!showJobCardsList)}
              className="px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700/30 rounded-lg cursor-pointer transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <span>All {documentType === "quote" ? "Quotes" : "Invoices"}</span>
                <span className="bg-blue-600/30 text-blue-300 px-2 py-0.5 rounded-full text-xs font-semibold">
                  {savedJobCards.length}
                </span>
              </div>
            </div>
            <div className="px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700/30 rounded-lg cursor-pointer transition-all duration-200">
              In Progress
            </div>
          </div>
        </div>

        <div className="mt-2">
          <div className="flex items-center justify-between px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200 mt-2">
            <div className="flex items-center space-x-3">
              <Users className="w-5 h-5" />
              <span className="font-medium">Customers</span>
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
                <span className="bg-blue-600/30 text-blue-300 px-2 py-0.5 rounded-full text-xs font-semibold">
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
          <span className="font-medium">Invoice Templates</span>
        </div>

        <div
          onClick={() => setActiveView("vehicles")}
          className="flex items-center space-x-3 px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200"
        >
          <Car className="w-5 h-5" />
          <span className="font-medium">Vehicles</span>
        </div>

        <div
          onClick={() => setActiveView("parts-inventory")}
          className="flex items-center space-x-3 px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200"
        >
          <Package className="w-5 h-5" />
          <span className="font-medium">Parts Inventory</span>
        </div>

        <div className="flex items-center justify-between px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200">
          <div className="flex items-center space-x-3">
            <CreditCard className="w-5 h-5" />
            <span className="font-medium">Payments</span>
          </div>
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
    </nav>
  </div>

  <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700 bg-slate-900/50 backdrop-blur-sm">
    <div className="flex items-center space-x-3">
      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center ring-2 ring-slate-700 shadow-lg">
        <img src={v8logo} alt="" className="w-full h-full rounded-full" />
      </div>
      <div className="flex-1">
        <div className="text-sm font-semibold text-white">
          {user?.name || "User"}
        </div>
        <div className="text-xs text-slate-400">
          {user?.email || "email@example.com"}
        </div>
      </div>
      <button
        onClick={handleLogout}
        className="text-slate-400 hover:text-white hover:bg-slate-700/50 p-2 rounded-lg transition-all duration-200"
      >
        <LogOut className="w-4 h-4" />
      </button>
    </div>
  </div>
</div>

      <div
        className={`flex-1 transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-16"}`}
      >
        <div className="flex-1 overflow-auto">
          <div className="sticky top-0 z-40 bg-white border-b border-white px-4 lg:px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 lg:space-x-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                ></button>

                <h1 className="text-base lg:text-xl font-semibold text-gray-500">
                  {documentType === "quote" ? "Quote" : "Invoice"} #
                  {jobCardNumber || "— not saved yet —"}
                </h1>
              </div>

              <div className="hidden lg:flex items-center space-x-3 print:hidden">
                <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-800 text-gray-500">
                  <CheckSquare className="w-4 h-4" />
                  <span>Mark Complete</span>
                </button>
                <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-800 text-gray-500">
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>

                {/* NEW: Convert to Invoice Button (only shows for quotes) */}
                {documentType === "quote" && jobCardId && (
                  <button
                    onClick={handleConvertToInvoice}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-800 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    Convert to Invoice
                  </button>
                )}

                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-4 py-2 bg-transparent text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  Print
                </button>

                <button
                  onClick={
                    documentType === "quote" ? handleNewQuote : handleNewInvoice
                  }
                  className="flex items-center gap-2 px-4 py-2 bg-green-300 text-gray-800 border border-gray-300 rounded-lg hover:bg-green-700"
                >
                  <Plus className="w-4 h-4" />
                  New
                </button>

                <button className="flex items-center space-x-2 px-4 py-2 bg-transparent border border-gray-300 text-gray-800 rounded-lg hover:bg-orange-700">
                  <Send className="w-4 h-4" />
                  <span>Send</span>
                </button>
                <button
                  onClick={handleSavePDF}
                  className="flex items-center gap-2 px-4 py-2 bg-transparent text-gray-800 border border-gray-300 rounded-lg hover:bg-orange-700"
                >
                  Save as PDF
                </button>
                <button
                  onClick={handleSaveJobCard}
                  className="flex items-center gap-2 px-4 py-2 bg-transparent text-gray-800 border border-gray-300 rounded-lg hover:bg-orange-700"
                >
                  Save
                </button>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-red-300 text-white border border-gray-300 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Log Out
                </button>
              </div>

              <button
                onClick={handleLogout}
                className="lg:hidden p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 border border-gray-300 transition-colors print:hidden"
              >
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>
          <div className="sticky top-0 z-40 flex flex-col">
            <div className="lg:hidden bg-white px-4 py-3 print:hidden">
              <div className="flex gap-2 overflow-x-auto pb-2">
                <button
                  onClick={handleConvertToInvoice}
                  className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-800 whitespace-nowrap text-sm"
                >
                  <CheckSquare className="w-4 h-4" />
                  <span>Convert to Invoice</span>
                </button>

                {/* NEW: Convert to Invoice Button for Mobile (only shows for quotes) */}
                {documentType === "quote" && jobCardId && (
                  <button
                    onClick={handleConvertToInvoice}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-50 text-gray-800 rounded-lg hover:bg-blue-700 whitespace-nowrap text-sm"
                  >
                    <FileText className="w-4 h-4" />
                    <span>To Invoice</span>
                  </button>
                )}

                <button
                  onClick={handleSaveJobCard}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-gray-800 rounded-lg hover:bg-orange-700"
                >
                  Save
                </button>
                <button className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-gray-800 rounded-lg hover:bg-orange-700 whitespace-nowrap text-sm">
                  <Send className="w-4 h-4" />
                  <span>Send</span>
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-3 py-2 bg-orange-300 text-gray-800 rounded-lg hover:bg-orange-700 transition-colors whitespace-nowrap text-sm"
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

            <div className="bg-gray-300  px-4 lg:px-6 overflow-x-auto print:hidden">
              <div className="flex space-x-4 lg:space-x-8 min-w-max">
                {["JobCard", "Parts", "History", "Notes"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveTab(tab);
                      if (tabViewMap[tab]) {
                        setActiveView(tabViewMap[tab]);
                      }
                    }}
                    className={`py-4 border-b-2 ${
                      activeTab === tab
                        ? "border-orange-400 text-gray-800"
                        : "border-transparent text-gray-400 hover:text-gray-200"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="p-4 lg:p-6">
            {showSettings && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                  <div className="p-4 border-b flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Business Settings</h2>
                    <button
                      onClick={() => setShowSettings(false)}
                      className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="overflow-auto p-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Business Logo
                        </label>
                        <div className="flex items-center gap-4">
                          {businessInfo.logoUrl ? (
                            <img
                              src={businessInfo.logoUrl}
                              alt="Business Logo"
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
                          className="w-full px-4 py-2 border rounded-lg"
                          placeholder="V8 Powered Auto Service"
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
                          placeholder="9-10 CNR THIRD & ARKWRIGHT AVENUE"
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
                          placeholder="WYNBERG"
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
                            placeholder="SANDTON"
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
                            placeholder="2090"
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
                          placeholder="082 514 4509"
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
                          placeholder="084 583 9929"
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
                      {/* Add this in your Business Settings modal, after phone fields */}
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
                        className="w-full bg-gray-600 text-gray-800 py-3 rounded-lg hover:bg-orange-700"
                      >
                        Save Business Information
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
                              <div>
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
                              <div className="text-right">
                                <div className="text-lg font-semibold text-orange-600">
                                  R{card.totals?.total?.toFixed(2) || "0.00"}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {card.dates?.serviceDate
                                    ? new Date(
                                        card.dates.serviceDate,
                                      ).toLocaleDateString("en-ZA")
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

            {activeView === "financial-overview" && (
              <FinancialOverview user={user} />
            )}
            {activeView === "parts-inventory" && <PartsInventory user={user} />}
            {activeView === "history-view" && <HistoryView user={user} />}
            {activeView === "notes-view" && <NotesView user={user} />}
            {activeView === "vehicles" && <Vehicles user={user} />}
            {activeView === "templates" && <Templates user={user} />}

            {activeView === "invoice" && (
              <>
                <button
                  onClick={() => setShowJobCard(!showJobCard)}
                  className="lg:hidden w-full mb-4 flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 text-gray-800 rounded-lg hover:bg-orange-100 transition-colors"
                >
                  <FileText className="w-5 h-5" />
                  {showJobCard
                    ? `Hide ${documentType === "quote" ? "Quote" : "Job Card"}`
                    : `View ${documentType === "quote" ? "Quote" : "Job Card"}`}
                </button>

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <div
    className={`${showJobCard ? "hidden" : "block"} space-y-6 lg:block print:hidden max-h-[calc(100vh)] overflow-y-auto`}
  >
    {/* Tab Navigation */}
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
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
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
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
        ) : (
          <div className="flex items-center gap-3 text-sm text-slate-600 bg-blue-50 p-4 rounded-lg border border-blue-100">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Fill out the forms below to create your {documentType}.</span>
          </div>
        )}
      </div>
    </div>

    {/* Manual forms always visible */}
    {inputMode === "manual" && (
      <>
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-5 rounded-xl border border-orange-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-orange-700">Total Amount</div>
              <div className="w-8 h-8 bg-orange-200 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="text-2xl font-bold text-orange-900">R{total.toFixed(2)}</div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-5 rounded-xl border border-emerald-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-emerald-700">Paid</div>
              <div className="w-8 h-8 bg-emerald-200 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="text-2xl font-bold text-emerald-900">R0.00</div>
          </div>

          <div className="bg-gradient-to-br from-rose-50 to-rose-100 p-5 rounded-xl border border-rose-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-rose-700">Balance Due</div>
              <div className="w-8 h-8 bg-rose-200 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="text-2xl font-bold text-rose-900">R{total.toFixed(2)}</div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              return (
                <React.Fragment key={step.number}>
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 ${
                        currentStep === step.number
                          ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white ring-4 ring-blue-100 shadow-lg"
                          : currentStep > step.number
                            ? "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-md"
                            : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      <StepIcon className="w-6 h-6" />
                    </div>
                    <span
                      className={`mt-3 text-sm font-semibold transition-colors ${
                        currentStep === step.number
                          ? "text-blue-600"
                          : currentStep > step.number
                            ? "text-emerald-600"
                            : "text-slate-400"
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-1.5 mx-4 rounded-full transition-all duration-300 ${
                        currentStep > step.number
                          ? "bg-gradient-to-r from-emerald-500 to-emerald-600"
                          : "bg-slate-200"
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

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
                  <h3 className="text-lg font-bold text-slate-900">INVOICE TO</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Customer Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white hover:border-slate-400"
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
                      onChange={(e) => setCustomerId(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white hover:border-slate-400"
                      placeholder="Customer ID"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Email <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white hover:border-slate-400"
                      placeholder="email@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Phone <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white hover:border-slate-400"
                      placeholder="082 123 4567"
                    />
                  </div>
                  <div className="col-span-1 sm:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white hover:border-slate-400"
                      placeholder="Street address, City, Postal Code"
                    />
                  </div>
                </div>
              </div>

              {/* Bill To Section */}
              <div>
                <div className="flex items-center gap-2 mb-5">
                  <div className="h-8 w-1 bg-emerald-600 rounded-full"></div>
                  <h3 className="text-lg font-bold text-slate-900">BILL TO</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Billing Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={billName}
                      onChange={(e) => setBillName(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white hover:border-slate-400"
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
                      onChange={(e) => setBillEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white hover:border-slate-400"
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
                      onChange={(e) => setBillPhone(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white hover:border-slate-400"
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
                      onChange={(e) => setBillAddress(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white hover:border-slate-400"
                      placeholder="Billing address if different"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Vehicle Information */}
          {currentStep === 2 && (
            <div className="p-8">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Car className="w-6 h-6 text-blue-600" />
                  </div>
                  Vehicle Information
                </h2>
                <p className="text-slate-600 mt-2 ml-13">
                  Enter vehicle details and authorization codes
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Make <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={vehicleMake}
                    onChange={(e) => setVehicleMake(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white hover:border-slate-400"
                    placeholder="Toyota"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Model <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={vehicleModel}
                    onChange={(e) => setVehicleModel(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white hover:border-slate-400"
                    placeholder="Hilux"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Year <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={vehicleYear}
                    onChange={(e) => setVehicleYear(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white hover:border-slate-400"
                    placeholder="2020"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Registration <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={vehicleReg}
                    onChange={(e) => setVehicleReg(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white hover:border-slate-400"
                    placeholder="ABC 123 GP"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    VIN
                  </label>
                  <input
                    type="text"
                    value={vehicleVin}
                    onChange={(e) => setVehicleVin(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white hover:border-slate-400"
                    placeholder="1HGBH41JXMN109186"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Mileage (km) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={vehicleMileage}
                    onChange={(e) => setVehicleMileage(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white hover:border-slate-400"
                    placeholder="45000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Pre Auth
                  </label>
                  <input
                    type="text"
                    value={preAuth}
                    onChange={(e) => setPreAuth(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white hover:border-slate-400"
                    placeholder="AUTH123"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Auth Code
                  </label>
                  <input
                    type="text"
                    value={authCode}
                    onChange={(e) => setAuthCode(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white hover:border-slate-400"
                    placeholder="456789"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Services/Parts */}
          {currentStep === 3 && (
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
                    onChange={(e) =>
                      setNewItem({
                        ...newItem,
                        type: e.target.value,
                      })
                    }
                    className="px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white font-medium hover:border-slate-400"
                  >
                    <option value="Labor">Labor</option>
                    <option value="Parts">Parts</option>
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
                    className="px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white hover:border-slate-400"
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
                    className="px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white hover:border-slate-400"
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
                    className="px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white hover:border-slate-400"
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
                            <td className="px-4 py-4 text-sm text-slate-700 font-medium">
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
                                onClick={() => handleRemoveItem(index)}
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
                      <span className="text-slate-700 font-medium">
                        Subtotal:
                      </span>
                      <span className="font-bold text-slate-900 text-lg">
                        R{subtotal.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-700 font-medium">
                        VAT (0%):
                      </span>
                      <span className="font-bold text-slate-900 text-lg">
                        R{vat.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-lg font-bold pt-4 border-t-2 border-blue-300">
                      <span className="text-slate-900">Total:</span>
                      <span className="text-blue-700 text-2xl">
                        R{total.toFixed(2)}
                      </span>
                    </div>
                  </div>
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
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg font-semibold hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-md hover:shadow-lg"
              >
                <Save className="w-5 h-5" />
                Save Invoice
              </button>
            )}
          </div>
        </div>

        {/* Payment Terms */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Payment Terms</h2>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center py-3 border-b border-slate-100">
              <span className="text-slate-600 font-medium">
                Payment Method:
              </span>
              <span className="font-bold text-slate-900">Cash/Card/EFT</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-slate-100">
              <span className="text-slate-600 font-medium">
                Payment Terms:
              </span>
              <span className="font-bold text-slate-900">
                Due on Completion
              </span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-slate-600 font-medium">Warranty:</span>
              <span className="font-bold text-slate-900">
                90 Days Parts & Labor
              </span>
            </div>
          </div>
        </div>
      </>
    )}
  </div>

  {/* Invoice Preview */}
  <div
    className={`${
      !showJobCard ? "hidden" : "block"
    } lg:block mx-auto bg-white shadow-lg max-h-[calc(100vh)] overflow-y-auto`}
    style={{
      width: "100%",
      maxWidth: "210mm",
      maxHeight: "297mm",
    }}
  >
    <div className="mb-4">
      <TemplateSelector
        user={user}
        selectedTemplate={selectedTemplate}
        onTemplateChange={setSelectedTemplate}
      />
    </div>

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

  <style>{`
    @media print {
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        background: gray !important;
        width: 100% !important;
        height: 100% !important;
      }
      
      @page {
        size: A4;
        margin: 0;
      }
      
      .print\\:hidden {
        display: none !important;
      }
      
      div[class*="border-b"][class*="border-gray"] {
        display: none !important;
      }
      
      nav,
      [class*="sidebar"],
      [class*="bg-gray-50"],
      button:not([style]) {
        display: none !important;
      }
      
      .space-y-6 {
        display: none !important;
      }
      
      .flex.h-screen {
        display: block !important;
        height: auto !important;
      }
      
      .flex-1 {
        display: block !important;
        overflow: visible !important;
      }
      
      .grid.grid-cols-1 {
        display: block !important;
        grid-template-columns: none !important;
      }
      
      div[style*="210mm"] {
        display: block !important;
        width: 210mm !important;
        height: auto !important;
        margin: 0 !important;
        padding: 0 !important;
        box-shadow: none !important;
        page-break-after: avoid !important;
      }
      
      .bg-white {
        background: white !important;
        box-shadow: none !important;
      }
      
      table {
        width: 100% !important;
        border-collapse: collapse !important;
      }
      
      tr, td, th {
        page-break-inside: avoid !important;
      }
    }
  `}</style>
</div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MechanicsDashboard;
