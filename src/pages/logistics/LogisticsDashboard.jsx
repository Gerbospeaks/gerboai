import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { serverTimestamp } from "firebase/firestore";
import logo from "../../assets/img/solidflo-logo.png";
import FinancialOverview from "../FinancialOverview";
import Templates from "./Templates"; 
import AIInvoiceExtractor from "../AIInvoiceExtractor";
import TemplateSelector, { TemplateRenderer } from "./TemplateSelector";
import { getAuth, signOut } from "firebase/auth";
import FreightMultiStepForm from "./FreightMultiStepForm";
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
import { uploadLogoToR2 } from '../../utils/cloudflareUpload';
import CustomersListModal from "../CustomersListModal";
import InTransitModal from "./InTransitModal";
import WaybillStickerModal from "./WaybillStickerModal";
import SignatureStamp from "../SignatureStamp";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Home,
  Settings,
   Sparkles,
  Users,
  Calendar,
  FileText,
  Wrench,
  FileBarChart,
  BarChart3,
  Menu,
  X,
  Plus,
  Send,
  Edit,
  LogOut,
  CheckSquare,
  TrendingUp,
  CreditCard,
  Receipt,
  Wallet,
  PieChart,
  Truck,
  ClipboardList,
  Package,
  MapPin,
  Upload,
} from "lucide-react";

const generateWaybillNumber = async (userId) => {
  const db = getFirestore();
  const year = new Date().getFullYear();

  const waybillsRef = collection(db, "users", userId, "waybills");
  const q = query(waybillsRef, orderBy("createdAt", "desc"), limit(1));
  const snapshot = await getDocs(q);

  let lastNumber = 891;

  if (!snapshot.empty) {
    const lastWaybill = snapshot.docs[0].data();
    const match = lastWaybill.waybillNumber?.match(/(\d+)$/);

    if (match) {
      lastNumber = Number(match[1]);
    }
  }

  const nextNumber = lastNumber + 1;
  return `WB-${year}-${String(nextNumber).padStart(4, "0")}`;
};

const LogisticsDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
const [inputMode, setInputMode] = useState("manual");
const [documentType, setDocumentType] = useState("invoice"); 
const [useAI, setUseAI] = useState(false);
  const [activeTab, setActiveTab] = useState("Waybill");
  const [showWaybill, setShowWaybill] = useState(false);
  const { user } = useAuth();
  const [waybillNumber, setWaybillNumber] = useState("");
  const [waybillId, setWaybillId] = useState(null);
  const [savedWaybills, setSavedWaybills] = useState([]);
  const [showWaybillsList, setShowWaybillsList] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCustomersList, setShowCustomersList] = useState(false);
  const [savedCustomers, setSavedCustomers] = useState([]);
  const [activeView, setActiveView] = useState("invoice");
  const [activeTemplate, setActiveTemplate] = useState("classic");
  const [showCustomersListModal, setShowCustomersListModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("professional");
  const [customers, setCustomers] = useState([]);
  const [showInTransitModal, setShowInTransitModal] = useState(false);
  const [showWaybillSticker, setShowWaybillSticker] = useState(false);
  const [savedWaybillData, setSavedWaybillData] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [stampSettings, setStampSettings] = useState({
    text: "APPROVED",
    color: "#d32f2f",
    showDate: false,
    enabled: false,
  });
  useEffect(() => {
    if (!user?.uid) return;

    const loadWaybillNumber = async () => {
      const nextWaybill = await generateWaybillNumber(user.uid);
      setWaybillNumber(nextWaybill);
    };

    loadWaybillNumber();
    loadSavedWaybills();
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
      console.error("Error loading customers:", error);
    }
  };
  const handleViewWaybillDetails = (waybill) => {
    // Close the in-transit modal
    setShowInTransitModal(false);

    // Load the waybill data into the form
    loadWaybill(waybill);

    // Switch to invoice view
    setActiveView("invoice");
  };

  const handlePrintWaybillLabel = (waybill) => {
    setSavedWaybillData(waybill);
    setShowWaybillSticker(true);
  };
  const loadSavedWaybills = async () => {
    if (!user?.uid) return;

    const db = getFirestore();
    const waybillsRef = collection(db, "users", user.uid, "waybills");
    const q = query(waybillsRef, orderBy("createdAt", "desc"), limit(50));
    const snapshot = await getDocs(q);

    const bills = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setSavedWaybills(bills);
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
    setSenderName(customer.name || "");
    setSenderEmail(customer.email || "");
    setSenderPhone(customer.phone || "");
    setSenderAddress(customer.address || "");
    setCustomerId(customer.customerId || "");
  };
const handleAIDataExtracted = (extractedData) => {
  // Sender info
  if (extractedData.sender.name) setSenderName(extractedData.sender.name);
  if (extractedData.sender.email) setSenderEmail(extractedData.sender.email);
  if (extractedData.sender.phone) setSenderPhone(extractedData.sender.phone);
  if (extractedData.sender.address) setSenderAddress(extractedData.sender.address);
  if (extractedData.sender.customerId) setCustomerId(extractedData.sender.customerId);

  // Receiver info
  if (extractedData.receiver.name) setReceiverName(extractedData.receiver.name);
  if (extractedData.receiver.email) setReceiverEmail(extractedData.receiver.email);
  if (extractedData.receiver.phone) setReceiverPhone(extractedData.receiver.phone);
  if (extractedData.receiver.address) setReceiverAddress(extractedData.receiver.address);

  // Shipment info
  if (extractedData.shipment.origin) setOrigin(extractedData.shipment.origin);
  if (extractedData.shipment.destination) setDestination(extractedData.shipment.destination);
  if (extractedData.shipment.cargoType) setCargoType(extractedData.shipment.cargoType);
  if (extractedData.shipment.weight) setWeight(extractedData.shipment.weight);
  if (extractedData.shipment.dimensions) setDimensions(extractedData.shipment.dimensions);
  if (extractedData.shipment.trackingNumber) setTrackingNumber(extractedData.shipment.trackingNumber);

  // Items
  if (extractedData.items && extractedData.items.length > 0) {
    setItems(extractedData.items);
  }

  alert("✅ Waybill data extracted and populated successfully!");
};
  const handleCustomerSaved = () => {
    loadCustomers();
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadWaybill = (waybill) => {
    setWaybillId(waybill.id);
    setWaybillNumber(waybill.waybillNumber || "");
    setSenderName(waybill.sender?.name || "");
    setSenderEmail(waybill.sender?.email || "");
    setSenderPhone(waybill.sender?.phone || "");
    setSenderAddress(waybill.sender?.address || "");
    setCustomerId(waybill.sender?.customerId || "");
    setReceiverName(waybill.receiver?.name || "");
    setReceiverEmail(waybill.receiver?.email || "");
    setReceiverPhone(waybill.receiver?.phone || "");
    setReceiverAddress(waybill.receiver?.address || "");
    setOrigin(waybill.shipment?.origin || "");
    setDestination(waybill.shipment?.destination || "");
    setCargoType(waybill.shipment?.cargoType || "");
    setWeight(waybill.shipment?.weight || "");
    setDimensions(waybill.shipment?.dimensions || "");
    setTrackingNumber(waybill.shipment?.trackingNumber || "");
    setItems(waybill.items || []);
    setShowWaybillsList(false);
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

    if (!senderName || !senderEmail) {
      alert("Please enter sender name and email");
      return;
    }

    try {
      const db = getFirestore();
      const customerData = {
        name: senderName,
        email: senderEmail,
        phone: senderPhone,
        address: senderAddress,
        customerId: customerId || `CUST-${Date.now()}`,
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

  const loadWaybillForExport = async () => {
    if (!user?.uid || !waybillId) return null;

    const db = getFirestore();
    const snap = await getDoc(
      doc(db, "users", user.uid, "waybills", waybillId),
    );

    return snap.exists() ? snap.data() : null;
  };

  const handleSavePDF = async () => {
    const savedWaybill = await loadWaybillForExport();

    if (!savedWaybill) {
      alert("Please save the waybill before exporting PDF");
      return;
    }

    setWaybillNumber(savedWaybill.waybillNumber);
    setItems(savedWaybill.items);
    setSenderName(savedWaybill.sender.name);
    setSenderEmail(savedWaybill.sender.email);
    setSenderPhone(savedWaybill.sender.phone);
    setSenderAddress(savedWaybill.sender.address);
    setReceiverName(savedWaybill.receiver.name);
    setReceiverEmail(savedWaybill.receiver.email);
    setReceiverPhone(savedWaybill.receiver.phone);
    setReceiverAddress(savedWaybill.receiver.address);
    setOrigin(savedWaybill.shipment.origin);
    setDestination(savedWaybill.shipment.destination);

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
      type: newItem.type || "Freight",
      rate,
      qty,
      amount: rate * qty,
    };

    setItems((prev) => [...prev, item]);
    setNewItem({ description: "", rate: "", qty: "", type: "Freight" });
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

  const [senderName, setSenderName] = useState("John Smith");
  const [customerId, setCustomerId] = useState("CUST-2026-1234");
  const [senderEmail, setSenderEmail] = useState("john.smith@example.com");
  const [senderPhone, setSenderPhone] = useState("082 123 4567");
  const [senderAddress, setSenderAddress] = useState(
    "123 Main Street, Pretoria, 0001",
  );

  const [receiverName, setReceiverName] = useState("Jane Doe");
  const [receiverEmail, setReceiverEmail] = useState("jane.doe@example.com");
  const [receiverPhone, setReceiverPhone] = useState("083 987 6543");
  const [receiverAddress, setReceiverAddress] = useState(
    "456 Oak Avenue, Johannesburg, 2000",
  );

  const [origin, setOrigin] = useState("Pretoria");
  const [destination, setDestination] = useState("Johannesburg");
  const [cargoType, setCargoType] = useState("General Cargo");
  const [weight, setWeight] = useState("500");
  const [dimensions, setDimensions] = useState("100x80x60 cm");
  const [trackingNumber, setTrackingNumber] = useState("TRK" + Date.now());

  const [businessInfo, setBusinessInfo] = useState({
    businessName: "SOLIDFLO LOGISTICS",
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
  if (!file || !user?.uid) return;

  if (!file.type.startsWith('image/')) {
    alert('Please upload an image file');
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    alert('Image size should be less than 5MB');
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
      uploading: false 
    });

    // Save to Firebase Firestore
    const db = getFirestore();
    const docRef = doc(db, 'users', user.uid, 'settings', 'businessInfo');
    await updateDoc(docRef, { 
      logoUrl: logoUrl,
      updatedAt: new Date().toISOString()
    });

    alert('Logo uploaded successfully!');
  } catch (error) {
    console.error('Error uploading logo:', error);
    alert('Failed to upload logo: ' + error.message);
    setBusinessInfo({ ...businessInfo, uploading: false });
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
    type: "Freight",
  });

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const vat = subtotal * 0.15;
  const total = subtotal + vat;

  const buildWaybillPayload = (numberToUse) => ({
    waybillNumber: numberToUse,
    locked: true,
    status: "pending",

    dates: {
      shipmentDate: new Date().toISOString(),
      deliveredDate: null,
    },

    sender: {
      name: senderName,
      email: senderEmail,
      phone: senderPhone,
      address: senderAddress,
      customerId,
    },

    receiver: {
      name: receiverName,
      email: receiverEmail,
      phone: receiverPhone,
      address: receiverAddress,
    },

    shipment: {
      origin,
      destination,
      cargoType,
      weight,
      dimensions,
      trackingNumber,
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

  const handleSaveWaybill = async () => {
    if (!user?.uid) return;

    const db = getFirestore();
    let numberToUse = waybillNumber;

    if (!waybillId) {
      numberToUse = await generateWaybillNumber(user.uid);
      setWaybillNumber(numberToUse);
    }

    const waybillData = buildWaybillPayload(numberToUse);

    if (waybillId) {
      await updateDoc(doc(db, "users", user.uid, "waybills", waybillId), {
        ...waybillData,
        updatedAt: serverTimestamp(),
      });
    } else {
      const ref = await addDoc(
        collection(db, "users", user.uid, "waybills"),
        waybillData,
      );
      setWaybillId(ref.id);
    }

    // Save the waybill data for the sticker
    setSavedWaybillData(waybillData);

    alert("Waybill saved and locked");
    loadSavedWaybills();

    // Show the sticker modal after saving
    setShowWaybillSticker(true);
  };

  const handleNewWaybill = () => {
    setWaybillId(null);
    setWaybillNumber("");
    setSenderName("John Smith");
    setCustomerId("CUST-2026-1234");
    setSenderEmail("john.smith@example.com");
    setSenderPhone("082 123 4567");
    setSenderAddress("123 Main Street, Pretoria, 0001");
    setReceiverName("Jane Doe");
    setReceiverEmail("jane.doe@example.com");
    setReceiverPhone("083 987 6543");
    setReceiverAddress("456 Oak Avenue, Johannesburg, 2000");
    setOrigin("Pretoria");
    setDestination("Johannesburg");
    setCargoType("General Cargo");
    setWeight("500");
    setDimensions("100x80x60 cm");
    setTrackingNumber("TRK" + Date.now());
    setItems([]);

    const loadNewNumber = async () => {
      if (user?.uid) {
        const nextWaybill = await generateWaybillNumber(user.uid);
        setWaybillNumber(nextWaybill);
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
    sidebarOpen ? "hidden" : "block"
  } fixed z-40 w-16 bg-gradient-to-b from-slate-900 to-slate-800 border-r border-slate-700 h-full print:hidden transition-all duration-300 shadow-xl`}
>
  <div className="flex flex-col items-center py-4 space-y-4">
    {/* Toggle Button */}
    <button
      onClick={() => setSidebarOpen(true)}
      className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-200"
      title="Expand Sidebar"
    >
      <ChevronRight className="w-6 h-6" />
    </button>

    {/* Logo */}
    <div className="w-10 h-10 mb-2">
      <img
        src={logo}
        alt="Logo"
        className="w-full h-full object-contain rounded-lg"
      />
    </div>

    <div className="w-10 border-t border-slate-600"></div>

    {/* Icon Navigation */}
    <div className="flex flex-col items-center space-y-3 w-full px-2">
      <button
        className="p-2 text-slate-400 hover:text-white hover:bg-blue-600/80 rounded-lg transition-all duration-200 w-10 h-10 flex items-center justify-center group"
        title="Home"
      >
        <Home className="w-5 h-5" />
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
        title="Business Overview"
      >
        <TrendingUp className="w-5 h-5" />
      </button>

      <button
        onClick={() => {
          handleNewWaybill();
          setActiveView("invoice");
        }}
        className="p-2 text-slate-400 hover:text-white hover:bg-blue-600/80 rounded-lg transition-all duration-200 w-10 h-10 flex items-center justify-center group"
        title="Waybills"
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
        title="Fleet"
      >
        <Truck className="w-5 h-5" />
      </button>

      <button
        className="p-2 text-slate-400 hover:text-white hover:bg-blue-600/80 rounded-lg transition-all duration-200 w-10 h-10 flex items-center justify-center group"
        title="Tracking"
      >
        <MapPin className="w-5 h-5" />
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
        title="Reports"
      >
        <FileBarChart className="w-5 h-5" />
      </button>

      <button
        className="p-2 text-slate-400 hover:text-white hover:bg-blue-600/80 rounded-lg transition-all duration-200 w-10 h-10 flex items-center justify-center group"
        title="Schedule"
      >
        <Calendar className="w-5 h-5" />
      </button>
    </div>
  </div>

  {/* User Icon at Bottom */}
  <div className="absolute bottom-4 left-0 right-0 flex justify-center">
    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full ring-2 ring-slate-700 shadow-lg flex items-center justify-center">
      <span className="text-white font-bold text-sm">
        {user?.name?.charAt(0) || "U"}
      </span>
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
        <span className="text-sm font-medium">Home</span>
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
          <span className="text-sm font-medium">Business Overview</span>
        </div>

        {/* Waybills Section */}
        <div className="mt-2">
          <div className="flex items-center justify-between px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200">
            <div className="flex items-center space-x-3">
              <ClipboardList className="w-5 h-5" />
              <span className="text-sm font-medium">Waybills</span>
            </div>
            <ChevronDown className="w-4 h-4" />
          </div>

          <div className="ml-4 mt-1 space-y-1 border-l-2 border-slate-700/50 pl-4">
            <div
              onClick={() => {
                handleNewWaybill();
                setActiveView("invoice");
              }}
              className="px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700/30 rounded-lg cursor-pointer transition-all duration-200"
            >
              Create Invoice
            </div>
            <div
              onClick={() => setShowWaybillsList(!showWaybillsList)}
              className="px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700/30 rounded-lg cursor-pointer transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <span>All Waybills</span>
                <span className=" text-blue-300 px-2 py-0.5 rounded-full text-xs font-semibold">
                  {savedWaybills.length}
                </span>
              </div>
            </div>
            <div
              onClick={() => setShowInTransitModal(true)}
              className="px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700/30 rounded-lg cursor-pointer transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <span>In Transit</span>
                <span className="bg-amber-600/30 text-amber-300 px-2 py-0.5 rounded-full text-xs font-semibold">
                  0
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Customers Section */}
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
          <Truck className="w-5 h-5" />
          <span className="text-sm font-medium">Fleet</span>
        </div>

        <div className="flex items-center space-x-3 px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200">
          <MapPin className="w-5 h-5" />
          <span className="text-sm font-medium">Tracking</span>
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

        <div className="flex items-center space-x-3 px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200">
          <Calendar className="w-5 h-5" />
          <span className="text-sm font-medium">Schedule</span>
        </div>
      </div>
    </nav>
  </div>

  <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700 bg-slate-900/50 backdrop-blur-sm">
    <div className="flex items-center space-x-3">
      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full ring-2 ring-slate-700 shadow-lg flex items-center justify-center">
        <span className="text-white font-bold text-sm">
          {user?.name?.charAt(0) || "U"}
        </span>
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
        title="Logout"
      >
        <LogOut className="w-4 h-4" />
      </button>
    </div>
  </div>
</div>
      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
      <div className="flex-1 overflow-auto h-screen border-b-[25px] border-gray-800">
        <div className="sticky top-0 z-40 flex flex-col">
          <div className="bg-gray-300 border-b border-gray-200 px-4 lg:px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 lg:space-x-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                
                </button>
               
                <h1 className="text-base lg:text-xl font-semibold">
                  Waybill #{waybillNumber || "— not saved yet —"}
                </h1>
                
              </div>

              <div className="hidden lg:flex items-center space-x-3 print:hidden">
                <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-800">
                  <CheckSquare className="w-4 h-4" />
                  <span>Mark Delivered</span>
                </button>
                <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-800">
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={handleSaveWaybill}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-gray-800 rounded-lg hover:bg-orange-700"
                >
                  Save Waybill
                </button>

                <button
                  onClick={handleNewWaybill}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-gray-800 rounded-lg hover:bg-green-700"
                >
                  <Plus className="w-4 h-4" />
                  New
                </button>

                <button className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-gray-800 rounded-lg hover:bg-orange-700">
                  <Send className="w-4 h-4" />
                  <span>Send</span>
                </button>
                <button
                  onClick={handleSavePDF}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-gray-800 rounded-lg hover:bg-orange-700"
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
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-gray-800 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Log Out
                </button>
              </div>

              {/* Mobile Action Buttons */}
              <button
                onClick={handleLogout}
                className="lg:hidden p-2 bg-red-600 text-gray-800 rounded-lg hover:bg-red-700 transition-colors print:hidden"
              >
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>

          {/* Mobile Action Buttons Bar */}
          <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 print:hidden">
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-800 whitespace-nowrap text-sm">
                <CheckSquare className="w-4 h-4" />
                <span>Delivered</span>
              </button>
              <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-800 whitespace-nowrap text-sm">
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </button>
              <button className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-gray-800 rounded-lg hover:bg-orange-700 whitespace-nowrap text-sm">
                <Send className="w-4 h-4" />
                <span>Send</span>
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-gray-800 rounded-lg hover:bg-orange-700 transition-colors whitespace-nowrap text-sm"
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

          <div className="bg-gray-50 border-b border-gray-200 px-4 lg:px-6 overflow-x-auto print:hidden">
            <div className="flex space-x-4 lg:space-x-8 min-w-max">
              {["Waybill", "Cargo", "History", "Notes"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
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
          {/* Business Settings Modal */}
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
                    {/* Logo Upload Section */}
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
                        placeholder="SolidFlo Logistics"
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
          {/* Customer Modal */}
          <CustomerModal
            showModal={showCustomerModal}
            setShowModal={setShowCustomerModal}
            existingCustomer={selectedCustomer}
            onCustomerSaved={handleCustomerSaved}
          />
          {/* Waybill Sticker Modal */}
          <WaybillStickerModal
            isOpen={showWaybillSticker}
            onClose={() => setShowWaybillSticker(false)}
            waybillData={savedWaybillData}
            businessInfo={businessInfo}
          />{" "}
          {/* In Transit Modal */}
          <InTransitModal
            isOpen={showInTransitModal}
            onClose={() => setShowInTransitModal(false)}
            user={user}
            onViewDetails={handleViewWaybillDetails}
            onPrintLabel={handlePrintWaybillLabel}
          />
          {/* Saved Waybills List Modal */}
          {showWaybillsList && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
                <div className="p-4 border-b flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Saved Waybills</h2>
                  <button
                    onClick={() => setShowWaybillsList(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <div className="overflow-auto p-4">
                  {savedWaybills.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No saved waybills yet
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {savedWaybills.map((bill) => (
                        <div
                          key={bill.id}
                          onClick={() => loadWaybill(bill)}
                          className="border rounded-lg p-4 hover:bg-gray-800 cursor-pointer transition-colors"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-semibold text-lg">
                                {bill.waybillNumber || "N/A"}
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                Sender: {bill.sender?.name || "N/A"}
                              </div>
                              <div className="text-sm text-gray-600">
                                Receiver: {bill.receiver?.name || "N/A"}
                              </div>
                              <div className="text-sm text-gray-600">
                                Route: {bill.shipment?.origin || ""} →{" "}
                                {bill.shipment?.destination || "N/A"}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-semibold text-orange-600">
                                R{bill.totals?.total?.toFixed(2) || "0.00"}
                              </div>
                              <div className="text-sm text-gray-500">
                                {bill.dates?.shipmentDate
                                  ? new Date(
                                      bill.dates.shipmentDate,
                                    ).toLocaleDateString("en-ZA")
                                  : "N/A"}
                              </div>
                              <button
                                onClick={() => {
                                  setSavedWaybillData(bill);
                                  setShowWaybillSticker(true);
                                }}
                                className="text-gray-800 bg-gray-600 hover:text-blue-800 text-sm px-2 py-1 rounded"
                              >
                                Print Label
                              </button>
                              <div
                                className={`text-xs mt-1 px-2 py-1 rounded ${
                                  bill.status === "delivered"
                                    ? "bg-green-100 text-green-700"
                                    : bill.status === "pending"
                                      ? "bg-blue-100 text-blue-700"
                                      : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {bill.status || "unknown"}
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
          {activeView === "invoice" && (
            <>
              {/* Mobile View Waybill Button */}
              <button
                onClick={() => setShowWaybill(!showWaybill)}
                className="lg:hidden w-full mb-4 flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 text-gray-800 rounded-lg hover:bg-orange-700 transition-colors"
              >
                <FileText className="w-5 h-5" />
                {showWaybill ? "Hide Waybill" : "View Waybill"}
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div
                  className={`${
                    showWaybill ? "hidden" : "block"
                  } space-y-6 lg:block print:hidden max-h-[calc(100vh-120px)] overflow-y-auto`}
                >
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                      <div className="flex border-b">
                                        <button
                                          onClick={() => setInputMode("manual")}
                                          className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                                            inputMode === "manual"
                                              ? "bg-white text-blue-600 border-b-2 border-blue-600"
                                              : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                                          }`}
                                        >
                                          📝 Manual Entry
                                        </button>
                                        <button
                                          onClick={() => setInputMode("ai")}
                                          className={`flex-1 px-6 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                                            inputMode === "ai"
                                              ? "bg-white text-purple-600 border-b-2 border-purple-600"
                                              : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                                          }`}
                                        >
                                          <Sparkles className="w-4 h-4" />
                                          AI Assistant
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
                                          <div className="text-sm text-gray-600">
                                            Fill out the forms below to create your {documentType}
                                            .
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                     {inputMode === "manual" && (
                    <>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-blue-700 text-sm font-medium">
                      In Transit
                    </span>
                    <span className="text-blue-600">Shipped Today</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="text-sm text-gray-500 mb-1">
                        Total Amount
                      </div>
                      <div className="text-2xl font-semibold text-orange-600">
                        R{total.toFixed(2)}
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="text-sm text-gray-500 mb-1">Paid</div>
                      <div className="text-2xl font-semibold text-green-600">
                        R0.00
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="text-sm text-gray-500 mb-1">
                        Balance Due
                      </div>
                      <div className="text-2xl font-semibold text-red-600">
                        R{total.toFixed(2)}
                      </div>
                    </div>
                  </div>

                 {inputMode === "manual" && (
  <FreightMultiStepForm
    // Sender Info Props
    senderName={senderName}
    setSenderName={setSenderName}
    customerId={customerId}
    setCustomerId={setCustomerId}
    senderEmail={senderEmail}
    setSenderEmail={setSenderEmail}
    senderPhone={senderPhone}
    setSenderPhone={setSenderPhone}
    senderAddress={senderAddress}
    setSenderAddress={setSenderAddress}
    // Receiver Info Props
    receiverName={receiverName}
    setReceiverName={setReceiverName}
    receiverEmail={receiverEmail}
    setReceiverEmail={setReceiverEmail}
    receiverPhone={receiverPhone}
    setReceiverPhone={setReceiverPhone}
    receiverAddress={receiverAddress}
    setReceiverAddress={setReceiverAddress}
    // Shipment Info Props
    origin={origin}
    setOrigin={setOrigin}
    destination={destination}
    setDestination={setDestination}
    cargoType={cargoType}
    setCargoType={setCargoType}
    weight={weight}
    setWeight={setWeight}
    dimensions={dimensions}
    setDimensions={setDimensions}
    trackingNumber={trackingNumber}
    setTrackingNumber={setTrackingNumber}
    // Items Props
    items={items}
    newItem={newItem}
    setNewItem={setNewItem}
    handleAddItem={handleAddItem}
  />
)}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold">Payment Terms</h2>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">Payment Method:</span>
                        <span className="text-sm font-medium">Cash/Card/EFT</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">Payment Terms:</span>
                        <span className="text-sm font-medium">Due on Delivery</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600">Insurance:</span>
                        <span className="text-sm font-medium">
                          Optional Coverage Available
                        </span>
                      </div>
                    </div>
                  </div>
                  </>)}
                </div>

                <div
                  className={`${
                    !showWaybill ? "hidden" : "block"
                  } lg:block mx-auto bg-white shadow-lg overflow-hidden`}
                  style={{
                    width: "100%",
                    maxWidth: "210mm",
                    maxHeight: "90vh",
                  }}
                >
                  {activeView === "invoice" && (
                    <>
                      {/* Add Template Selector */}
                      <div className="mb-4">
                        <TemplateSelector
                          user={user}
                          selectedTemplate={selectedTemplate}
                          onTemplateChange={setSelectedTemplate}
                        />
                      </div>

                      {/* Use Template Renderer instead of hardcoded waybill */}
                      <TemplateRenderer
                        templateId={selectedTemplate}
                        businessInfo={businessInfo}
                        loading={loading}
                        jobCardNumber={waybillNumber}
                        trackingNumber={trackingNumber}
                        senderName={senderName}
                        senderEmail={senderEmail}
                        senderPhone={senderPhone}
                        senderAddress={senderAddress}
                        receiverName={receiverName}
                        receiverEmail={receiverEmail}
                        receiverPhone={receiverPhone}
                        receiverAddress={receiverAddress}
                        origin={origin}
                        destination={destination}
                        cargoType={cargoType}
                        weight={weight}
                        dimensions={dimensions}
                        items={items}
                        subtotal={subtotal}
                        vat={vat}
                        total={total}
                        documentType="freight"
                        serviceType="FREIGHT"
                      />
                    </>
                  )}
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
                  background: white !important;
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
                
                /* Hide all navigation and headers */
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
                
                /* Show only the waybill section */
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
                
                /* Waybill container styling */
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
                
                /* Ensure table displays */
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

export default LogisticsDashboard;
