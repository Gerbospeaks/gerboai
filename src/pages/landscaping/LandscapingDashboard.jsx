import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { serverTimestamp } from "firebase/firestore";
import logo from '../../assets/img/solidflo.png';
import Templates from "./Templates"; 
import AIInvoiceExtractor from "../AIInvoiceExtractor";
import TemplateSelector, { TemplateRenderer } from './TemplateSelector';
import { uploadLogoToR2 } from '../../utils/cloudflareUpload';
import { getAuth, signOut } from "firebase/auth";
import FinancialOverview from "../FinancialOverview";
import SignatureStamp from '../SignatureStamp';
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
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Home,
  Settings,
  Users,
  Calendar,
  FileText,
   Sparkles,
  Wrench,
  FileBarChart,
  BarChart3,
  Menu,
  Plus,
  Send,
  Edit,
  LogOut,
  X,
  CheckSquare,
  TrendingUp,
  CreditCard,
  Receipt,
  Wallet,
  PieChart,
  Flower2,
  ClipboardList,
  Package,
  Tool,
  Upload,
  Trees,
  MapPin,
} from "lucide-react";

const generateJobCardNumber = async (userId) => {
  const db = getFirestore();
  const year = new Date().getFullYear();

  const jobCardsRef = collection(db, "users", userId, "invoices");
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
  return `LW-${year}-${String(nextNumber).padStart(4, "0")}`;
};

const LandscapingDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
const [inputMode, setInputMode] = useState("manual");
const [documentType, setDocumentType] = useState("invoice"); 
const [useAI, setUseAI] = useState(false);
  const [activeTab, setActiveTab] = useState("WorkOrder");
  const [showJobCard, setShowJobCard] = useState(false);
  const { user } = useAuth();
  const [jobCardNumber, setJobCardNumber] = useState("");
  const [jobCardId, setJobCardId] = useState(null);
  const [savedJobCards, setSavedJobCards] = useState([]);
  const [showJobCardsList, setShowJobCardsList] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCustomersList, setShowCustomersList] = useState(false);
  const [savedCustomers, setSavedCustomers] = useState([]);
  const [activeView, setActiveView] = useState("invoice");
  const [activeTemplate, setActiveTemplate] = useState("classic");
  const [showCustomersListModal, setShowCustomersListModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('professional');
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customers, setCustomers] = useState([]);
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
const handleAIDataExtracted = (extractedData) => {
  // Customer info
  if (extractedData.customer.name) setCustomerName(extractedData.customer.name);
  if (extractedData.customer.email) setCustomerEmail(extractedData.customer.email);
  if (extractedData.customer.phone) setCustomerPhone(extractedData.customer.phone);
  if (extractedData.customer.address) setCustomerAddress(extractedData.customer.address);
  if (extractedData.customer.customerId) setCustomerId(extractedData.customer.customerId);

  // Property info
  if (extractedData.property.type) setPropertyType(extractedData.property.type);
  if (extractedData.property.size) setPropertySize(extractedData.property.size);
  if (extractedData.property.address) setPropertyAddress(extractedData.property.address);
  if (extractedData.property.accessDetails) setAccessDetails(extractedData.property.accessDetails);

  // Items
  if (extractedData.items && extractedData.items.length > 0) {
    setItems(extractedData.items);
  }

  alert("✅ Landscaping work order data extracted and populated successfully!");
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
    setCustomerId(jobCard.customer?.customerId || "");
    setPropertyType(jobCard.property?.type || "");
    setPropertySize(jobCard.property?.size || "");
    setPropertyAddress(jobCard.property?.address || "");
    setAccessDetails(jobCard.property?.accessDetails || "");
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
    setPropertySize(savedJobCard.property.size);
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

  const [customerName, setCustomerName] = useState("Sarah Johnson");
  const [customerId, setCustomerId] = useState("CUST-2026-1234");
  const [customerEmail, setCustomerEmail] = useState("sarah.johnson@example.com");
  const [customerPhone, setCustomerPhone] = useState("082 123 4567");
  const [customerAddress, setCustomerAddress] = useState("123 Oak Street, Cape Town, 8001");
  
  // Property Details
  const [propertyType, setPropertyType] = useState("Residential Garden");
  const [propertySize, setPropertySize] = useState("500 sqm");
  const [propertyAddress, setPropertyAddress] = useState("123 Oak Street, Cape Town, 8001");
  const [accessDetails, setAccessDetails] = useState("Side gate access available");

  const [businessInfo, setBusinessInfo] = useState({
    businessName: "GREEN PARADISE LANDSCAPING",
    addressLine1: "15 GARDEN ROAD",
    addressLine2: "CLAREMONT",
    city: "CAPE TOWN",
    postalCode: "7708",
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
    type: "Labor",
  });

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const vat = subtotal * 0.15;
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
      size: propertySize,
      address: propertyAddress,
      accessDetails: accessDetails,
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
    setCustomerName("Sarah Johnson");
    setCustomerId("CUST-2026-1234");
    setCustomerEmail("sarah.johnson@example.com");
    setCustomerPhone("082 123 4567");
    setCustomerAddress("123 Oak Street, Cape Town, 8001");
    setPropertyType("Residential Garden");
    setPropertySize("500 sqm");
    setPropertyAddress("123 Oak Street, Cape Town, 8001");
    setAccessDetails("Side gate access available");
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
    <div className="flex h-screen bg-gray-800">
     
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
  } fixed z-40 w-16 bg-green-900 border-r border-gray-200 h-full print:hidden transition-all duration-300`}
>
  <div className="flex flex-col items-center py-4 space-y-4">
    {/* Toggle Button */}
    <button
      onClick={() => setSidebarOpen(true)}
      className="p-2 text-gray-300 hover:bg-green-800 rounded-lg transition-colors"
      title="Expand Sidebar"
    >
      <ChevronRight className="w-6 h-6" />
    </button>

    {/* Logo */}
    <div className="w-10 h-10">
      <img
        src={logo}
        alt="Logo"
        className="w-full h-full object-contain rounded-lg"
      />
    </div>

    <div className="w-full border-t border-green-700"></div>

    {/* Icon Navigation */}
    <div className="flex flex-col items-center space-y-3 w-full">
      <button
        className="p-2 text-gray-300 hover:bg-green-800 rounded-lg transition-colors w-10 h-10 flex items-center justify-center"
        title="Home"
      >
        <Home className="w-5 h-5" />
      </button>
      
      <button
        onClick={() => setShowSettings(true)}
        className="p-2 text-gray-300 hover:bg-green-800 rounded-lg transition-colors w-10 h-10 flex items-center justify-center"
        title="Settings"
      >
        <Settings className="w-5 h-5" />
      </button>

      <button
        onClick={() => setActiveView("financial-overview")}
        className="p-2 text-gray-300 hover:bg-green-800 rounded-lg transition-colors w-10 h-10 flex items-center justify-center"
        title="Business Overview"
      >
        <TrendingUp className="w-5 h-5" />
      </button>

      <button
        onClick={() => {
          handleNewJobCard();
          setActiveView("invoice");
        }}
        className="p-2 text-gray-300 hover:bg-green-800 rounded-lg transition-colors w-10 h-10 flex items-center justify-center"
        title="Work Orders"
      >
        <ClipboardList className="w-5 h-5" />
      </button>

      <button
        onClick={() => setShowCustomersListModal(true)}
        className="p-2 text-gray-300 hover:bg-green-800 rounded-lg transition-colors w-10 h-10 flex items-center justify-center"
        title="Customers"
      >
        <Users className="w-5 h-5" />
      </button>

      <button
        onClick={() => setActiveView("templates")}
        className="p-2 text-gray-300 hover:bg-green-800 rounded-lg transition-colors w-10 h-10 flex items-center justify-center"
        title="Invoice Templates"
      >
        <FileText className="w-5 h-5" />
      </button>

      <button
        className="p-2 text-gray-300 hover:bg-green-800 rounded-lg transition-colors w-10 h-10 flex items-center justify-center"
        title="Properties"
      >
        <MapPin className="w-5 h-5" />
      </button>

      <button
        className="p-2 text-gray-300 hover:bg-green-800 rounded-lg transition-colors w-10 h-10 flex items-center justify-center"
        title="Materials Inventory"
      >
        <Package className="w-5 h-5" />
      </button>

      <button
        className="p-2 text-gray-300 hover:bg-green-800 rounded-lg transition-colors w-10 h-10 flex items-center justify-center"
        title="Reports"
      >
        <FileBarChart className="w-5 h-5" />
      </button>

      <button
        className="p-2 text-gray-300 hover:bg-green-800 rounded-lg transition-colors w-10 h-10 flex items-center justify-center"
        title="Appointments"
      >
        <Calendar className="w-5 h-5" />
      </button>

      <button
        className="p-2 text-gray-300 hover:bg-green-800 rounded-lg transition-colors w-10 h-10 flex items-center justify-center"
        title="Analytics"
      >
        <BarChart3 className="w-5 h-5" />
      </button>
    </div>
  </div>

  {/* User Icon at Bottom */}
  <div className="absolute bottom-4 left-0 right-0 flex justify-center">
    <div className="w-10 h-10 bg-green-600 rounded-full"></div>
  </div>
</div>

{/* Expanded Sidebar (Full Width) */}
<div
  className={`${
    sidebarOpen ? "translate-x-0" : "-translate-x-full"
  } fixed z-50 w-64 bg-green-900 border-r border-gray-200 transition-transform duration-300 h-full print:hidden`}
>
  <div className="p-4">
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center space-x-2">
        <img
          src={logo}
          alt="Business Logo"
          className="w-16 h-12 object-contain rounded-lg"
        />
      </div>
      {/* Close Button */}
      <button
        onClick={() => setSidebarOpen(false)}
        className="p-1.5 text-gray-300 hover:bg-green-800 rounded-lg transition-colors"
        title="Collapse Sidebar"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
    </div>

    <nav className="space-y-1">
      <div className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-green-800 rounded-lg cursor-pointer">
        <Home className="w-5 h-5" />
        <span>Home</span>
      </div>
      <div
        onClick={() => setShowSettings(true)}
        className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-green-800 rounded-lg cursor-pointer"
      >
        <Settings className="w-5 h-5" />
        <span>Settings</span>
      </div>

      <div className="pt-4">
        <div
          onClick={() => setActiveView("financial-overview")}
          className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-green-800 rounded-lg cursor-pointer"
        >
          <TrendingUp className="w-5 h-5" />
          <span>Business Overview</span>
        </div>

        <div className="mt-2">
          <div className="flex items-center justify-between px-3 py-2 text-gray-300 hover:bg-green-800 rounded-lg cursor-pointer">
            <div className="flex items-center space-x-3">
              <ClipboardList className="w-5 h-5" />
              <span>Work Orders</span>
            </div>
            <ChevronDown className="w-4 h-4" />
          </div>

          <div className="ml-8 mt-1 space-y-1">
            <div
              onClick={() => {
                handleNewJobCard();
                setActiveView("invoice");
              }}
              className="px-3 py-2 text-sm text-gray-800 bg-green-800 rounded-lg cursor-pointer"
            >
              Create Work Order
            </div>
            <div
              onClick={() => setShowJobCardsList(!showJobCardsList)}
              className="px-3 py-2 text-sm text-gray-400 hover:bg-green-800 rounded-lg cursor-pointer"
            >
              All Work Orders ({savedJobCards.length})
            </div>
            <div className="px-3 py-2 text-sm text-gray-400 hover:bg-green-800 rounded-lg cursor-pointer">
              In Progress
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-green-800 rounded-lg cursor-pointer mt-2">
          <Users className="w-5 h-5" />
          <span>Customers</span>
        </div>
        <div className="ml-8 mt-1 space-y-1">
          <div
            onClick={handleAddNewCustomer}
            className="flex items-center space-x-3 px-3 py-2 text-gray-400 hover:bg-green-800 rounded-lg cursor-pointer mt-2"
          >
            <span>Add Customer</span>
          </div>
          <div
            onClick={() => setShowCustomersListModal(true)}
            className="px-3 py-2 text-sm text-gray-400 hover:bg-green-800 rounded-lg cursor-pointer"
          >
            All Customers ({savedCustomers.length})
          </div>
        </div>

        <div
          onClick={() => setActiveView("templates")}
          className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-green-800 rounded-lg cursor-pointer"
        >
          <FileText className="w-5 h-5" />
          <span>Invoice Templates</span>
        </div>

        <div className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-green-800 rounded-lg cursor-pointer">
          <MapPin className="w-5 h-5" />
          <span>Properties</span>
        </div>

        <div className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-green-800 rounded-lg cursor-pointer">
          <Package className="w-5 h-5" />
          <span>Materials Inventory</span>
        </div>

        <div className="flex items-center justify-between px-3 py-2 text-gray-300 hover:bg-green-800 rounded-lg cursor-pointer">
          <div className="flex items-center space-x-3">
            <FileBarChart className="w-5 h-5" />
            <span>Reports</span>
          </div>
          <ChevronDown className="w-4 h-4" />
        </div>

        <div className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-green-800 rounded-lg cursor-pointer">
          <Calendar className="w-5 h-5" />
          <span>Appointments</span>
        </div>

        <div className="flex items-center justify-between px-3 py-2 text-gray-300 hover:bg-green-800 rounded-lg cursor-pointer">
          <div className="flex items-center space-x-3">
            <BarChart3 className="w-5 h-5" />
            <span>Analytics</span>
          </div>
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
    </nav>
  </div>

  <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-green-700 bg-green-800">
    <div className="flex items-center space-x-3">
      <div className="w-10 h-10 bg-green-600 rounded-full"></div>
      <div className="flex-1">
        <div className="text-sm font-medium text-gray-800">
          {user?.name || "User"}
        </div>
        <div className="text-xs text-gray-400">
          {user?.email || "email@example.com"}
        </div>
      </div>
      <button
        onClick={handleLogout}
        className="text-gray-400 hover:text-gray-800"
      >
        <LogOut className="w-4 h-4" />
      </button>
    </div>
  </div>
</div>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
      <div className="flex-1 overflow-auto">
        <div className="sticky top-0 z-40 flex flex-col">
        <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 lg:space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <Menu className="w-5 h-5" />
              </button>
              <ChevronLeft className="hidden lg:block w-5 h-5 text-gray-400" />
              <h1 className="text-base lg:text-xl font-semibold">
                Work Order #{jobCardNumber || "— not saved yet —"}
              </h1>
             
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
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-gray-800 rounded-lg hover:bg-green-700"
              >
                Save Work Order
              </button>

              <button
                onClick={handleNewJobCard}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-gray-800 rounded-lg hover:bg-green-700"
              >
                <Plus className="w-4 h-4" />
                New
              </button>

              <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-gray-800 rounded-lg hover:bg-green-700">
                <Send className="w-4 h-4" />
                <span>Send</span>
              </button>
              <button
                onClick={handleSavePDF}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-gray-800 rounded-lg hover:bg-green-700"
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
              <span>Complete</span>
            </button>
            <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-800 whitespace-nowrap text-sm">
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </button>
            <button className="flex items-center gap-2 px-3 py-2 bg-green-600 text-gray-800 rounded-lg hover:bg-green-700 whitespace-nowrap text-sm">
              <Send className="w-4 h-4" />
              <span>Send</span>
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-3 py-2 bg-green-600 text-gray-800 rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap text-sm"
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

        <div className="bg-green-900 border-b border-gray-200 px-4 lg:px-6 overflow-x-auto print:hidden">
          <div className="flex space-x-4 lg:space-x-8 min-w-max">
            {["WorkOrder", "Materials", "History", "Notes"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 border-b-2 ${
                  activeTab === tab
                    ? "border-green-400 text-gray-800"
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
                        placeholder="Green Paradise Landscaping"
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
                        placeholder="15 GARDEN ROAD"
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
                        placeholder="CLAREMONT"
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
                          placeholder="7708"
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
                    </div>
<div className="border-t pt-6 mt-6">
  <h3 className="text-lg font-semibold mb-4">📋 Invoice Stamp Settings</h3>
  
  <div className="space-y-4">
    <div>
      <label className="flex items-center space-x-2 mb-4">
        <input
          type="checkbox"
          checked={stampSettings.enabled}
          onChange={(e) => setStampSettings({...stampSettings, enabled: e.target.checked})}
          className="w-4 h-4 rounded"
        />
        <span className="text-sm font-medium">Show approval stamp on invoices and quotes</span>
      </label>
    </div>

    {stampSettings.enabled && (
      <>
        <div>
          <label className="block text-sm font-medium mb-2">Stamp Text</label>
          <input
            type="text"
            value={stampSettings.text}
            onChange={(e) => setStampSettings({...stampSettings, text: e.target.value.toUpperCase()})}
            className="w-full px-4 py-2 border rounded-lg uppercase"
            placeholder="APPROVED"
            maxLength={15}
          />
          <p className="text-xs text-gray-500 mt-1">Max 15 characters</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Stamp Color</label>
          <select
            value={stampSettings.color}
            onChange={(e) => setStampSettings({...stampSettings, color: e.target.value})}
            className="w-full px-4 py-2 border rounded-lg"
          >
            <option value="#d32f2f">🔴 Red (Traditional)</option>
            <option value="#1976d2">🔵 Blue (Professional)</option>
            <option value="#388e3c">🟢 Green (Approved)</option>
            <option value="#7b1fa2">🟣 Purple (Premium)</option>
            <option value="#000000">⚫ Black (Formal)</option>
            <option value="#f57c00">🟠 Orange (Attention)</option>
          </select>
        </div>

        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={stampSettings.showDate}
              onChange={(e) => setStampSettings({...stampSettings, showDate: e.target.checked})}
              className="w-4 h-4 rounded"
            />
            <span className="text-sm font-medium">Include date on stamp</span>
          </label>
        </div>

        {/* Preview */}
        <div className="mt-4 p-6 bg-gray-800 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-sm font-medium mb-4 text-center text-gray-600">Preview:</p>
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
                      className="w-full bg-green-600 text-gray-800 py-3 rounded-lg hover:bg-green-700"
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
                                Property: {card.property?.type || "N/A"}
                              </div>
                              <div className="text-sm text-gray-600">
                                Size: {card.property?.size || "N/A"}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-semibold text-green-600">
                                R{card.totals?.total?.toFixed(2) || "0.00"}
                              </div>
                              <div className="text-sm text-gray-500">
                                {card.dates?.serviceDate
                                  ? new Date(
                                      card.dates.serviceDate
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
           {activeView === "templates" && <Templates user={user} />}
                     {activeView === "invoice" && (
                       <>
          {/* Mobile View Work Order Button */}
          <button
            onClick={() => setShowJobCard(!showJobCard)}
            className="lg:hidden w-full mb-4 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-gray-800 rounded-lg hover:bg-green-700 transition-colors"
          >
            <FileText className="w-5 h-5" />
            {showJobCard ? "Hide Work Order" : "View Work Order"}
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div
              className={`${
                showJobCard ? "hidden" : "block"
              } space-y-6 lg:block print:hidden max-h-[calc(100vh-120px)] overflow-y-auto`}
            >
             <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                      <div className="flex border-b">
                                        <button
                                          onClick={() => setInputMode("manual")}
                                          className={`flex-1 px-6 py-3 font-medium transition-colors ${
                                            inputMode === "manual"
                                              ? "bg-white text-blue-600 border-b-2 border-blue-600"
                                              : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                                          }`}
                                        >
                                          📝 Manual Entry
                                        </button>
                                        <button
                                          onClick={() => setInputMode("ai")}
                                          className={`flex-1 px-6 py-3 font-medium transition-colors flex items-center justify-center gap-2 ${
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="text-sm text-gray-500 mb-1">Total Amount</div>
                  <div className="text-2xl font-semibold text-green-600">
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
                  <div className="text-sm text-gray-500 mb-1">Balance Due</div>
                  <div className="text-2xl font-semibold text-red-600">
                    R{total.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>Customer Information</span>
                  </h2>
                  <button className="flex items-center space-x-2 text-green-600 hover:text-green-700">
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Customer Name</div>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Customer ID</div>
                    <input
                      type="text"
                      value={customerId}
                      onChange={(e) => setCustomerId(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Email</div>
                    <input
                      type="text"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Phone</div>
                    <input
                      type="text"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="col-span-1 sm:col-span-2">
                    <div className="text-sm text-gray-500">Address</div>
                    <input
                      type="text"
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center space-x-2">
                    <MapPin className="w-5 h-5" />
                    <span>Property Information</span>
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Property Type</div>
                    <input
                      type="text"
                      value={propertyType}
                      onChange={(e) => setPropertyType(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Residential Garden"
                    />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Property Size</div>
                    <input
                      type="text"
                      value={propertySize}
                      onChange={(e) => setPropertySize(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., 500 sqm"
                    />
                  </div>
                  <div className="col-span-1 sm:col-span-2">
                    <div className="text-sm text-gray-500">Property Address</div>
                    <input
                      type="text"
                      value={propertyAddress}
                      onChange={(e) => setPropertyAddress(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="col-span-1 sm:col-span-2">
                    <div className="text-sm text-gray-500">Access Details</div>
                    <input
                      type="text"
                      value={accessDetails}
                      onChange={(e) => setAccessDetails(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Side gate access available"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">Add Service/Material</h2>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                  <select
                    value={newItem.type}
                    onChange={(e) =>
                      setNewItem({ ...newItem, type: e.target.value })
                    }
                    className="px-4 py-2 border rounded"
                  >
                    <option value="Labor">Labor</option>
                    <option value="Materials">Materials</option>
                    <option value="Plants">Plants</option>
                  </select>

                  <input
                    type="text"
                    placeholder="Description"
                    value={newItem.description}
                    onChange={(e) =>
                      setNewItem({ ...newItem, description: e.target.value })
                    }
                    className="px-4 py-2 border rounded"
                  />

                  <input
                    type="number"
                    placeholder="Rate"
                    value={newItem.rate}
                    onChange={(e) =>
                      setNewItem({ ...newItem, rate: e.target.value })
                    }
                    className="px-4 py-2 border rounded"
                  />

                  <input
                    type="number"
                    placeholder="Qty"
                    value={newItem.qty}
                    onChange={(e) =>
                      setNewItem({ ...newItem, qty: e.target.value })
                    }
                    className="px-4 py-2 border rounded"
                  />

                  <button
                    onClick={handleAddItem}
                    className="bg-green-600 text-gray-800 rounded-lg px-4 py-2 hover:bg-green-700 flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Payment Terms</h2>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="font-medium">Cash/Card/EFT</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Payment Terms:</span>
                    <span className="font-medium">Due on Completion</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Warranty:</span>
                    <span className="font-medium">90 Days on Workmanship</span>
                  </div>
                </div>
              </div>
              </>)}
            </div>

            <div
              className={`${
                !showJobCard ? "hidden" : "block"
              } lg:block mx-auto bg-white shadow-lg overflow-y-auto`}
              style={{
                width: "100%",
                maxWidth: "210mm",
                maxHeight: "90vh",
              }}
            >
             {activeView === 'invoice' && (
  <>
    {/* Add Template Selector */}
    <div className="mb-4">
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
      propertySize={propertySize}
      propertyAddress={propertyAddress}
      accessDetails={accessDetails}
      items={items}
      subtotal={subtotal}
      vat={vat}
      total={total}
      merchantCode="GPL-12345"
      serviceType="LANDSCAPING"
      documentType="landscaping"
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
                [class*="bg-green-900"],
                button:not([style]) {
                  display: none !important;
                }
                
                .space-y-6 {
                  display: none !important;
                }
                
                /* Show only the invoice section */
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
                
                /* Invoice container styling */
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
                </>)}
        </div>
      </div>
      </div>
    </div>
  );
};

export default LandscapingDashboard;