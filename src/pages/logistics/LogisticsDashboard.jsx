import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { serverTimestamp } from "firebase/firestore";
import logo from '../../assets/img/solidflo-logo.png';
import Templates from "./Templates";
import { TemplateSelector, TemplateRenderer } from "./TemplateSelector";
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
import {
  ChevronDown,
  ChevronLeft,
  Home,
  Settings,
  Users,
  Calendar,
  FileText,
  Wrench,
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
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

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

    setSavedCustomers(customers.filter(c => !c._placeholder));
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

  const loadWaybillForExport = async () => {
    if (!user?.uid || !waybillId) return null;

    const db = getFirestore();
    const snap = await getDoc(
      doc(db, "users", user.uid, "waybills", waybillId)
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
  const [senderAddress, setSenderAddress] = useState("123 Main Street, Pretoria, 0001");
  
  const [receiverName, setReceiverName] = useState("Jane Doe");
  const [receiverEmail, setReceiverEmail] = useState("jane.doe@example.com");
  const [receiverPhone, setReceiverPhone] = useState("083 987 6543");
  const [receiverAddress, setReceiverAddress] = useState("456 Oak Avenue, Johannesburg, 2000");
  
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

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    try {
      const storage = getStorage();
      const storageRef = ref(storage, `users/${user.uid}/logo/${file.name}`);

      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      setBusinessInfo({ ...businessInfo, logoUrl: downloadURL });
      alert("Logo uploaded successfully!");
    } catch (error) {
      console.error("Error uploading logo:", error);
      alert("Failed to upload logo");
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
        waybillData
      );
      setWaybillId(ref.id);
    }

    alert("Waybill saved and locked");
    loadSavedWaybills();
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
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed lg:relative lg:translate-x-0 z-50 w-64 bg-slate-900 border-r border-gray-200 transition-transform duration-300 h-full print:hidden`}
      >
        <div className="p-4">
          <div className="flex items-center space-x-2 mb-8">
             <img
                 src={logo}
                 alt="Business Logo"
                 className="w-16 h-12 object-contain rounded-lg"
               />
          </div>

          <nav className="space-y-1">
            <div className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-slate-800 rounded-lg cursor-pointer">
              <Home className="w-5 h-5" />
              <span>Home</span>
            </div>
            <div
              onClick={() => setShowSettings(true)}
              className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-slate-800 rounded-lg cursor-pointer"
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </div>

            <div className="pt-4">
              <div className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-slate-800 rounded-lg cursor-pointer">
                <TrendingUp className="w-5 h-5" />
                <span>Business Overview</span>
              </div>

              <div className="mt-2">
                <div className="flex items-center justify-between px-3 py-2 text-gray-300 hover:bg-slate-800 rounded-lg cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <ClipboardList className="w-5 h-5" />
                    <span>Waybills</span>
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </div>

                <div className="ml-8 mt-1 space-y-1">
                  <div
                    onClick={handleNewWaybill}
                    className="px-3 py-2 text-sm text-white bg-slate-800 rounded-lg cursor-pointer"
                  >
                    Create Waybill
                  </div>
                  <div
                    onClick={() => setShowWaybillsList(!showWaybillsList)}
                    className="px-3 py-2 text-sm text-gray-400 hover:bg-slate-800 rounded-lg cursor-pointer"
                  >
                    All Waybills ({savedWaybills.length})
                  </div>
                  <div className="px-3 py-2 text-sm text-gray-400 hover:bg-slate-800 rounded-lg cursor-pointer">
                    In Transit
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-slate-800 rounded-lg cursor-pointer mt-2">
                <Users className="w-5 h-5" />
                <span>Customers</span>
              </div>
               <div className="ml-8 mt-1 space-y-1">
                  <div 
                    onClick={handleAddNewCustomer}
                    className="flex items-center space-x-3 px-3 py-2 text-gray-400 hover:bg-slate-800 rounded-lg cursor-pointer mt-2"
                  >
                    <span>Add Customer</span>
                  </div>
                  <div
                    onClick={() => setShowCustomersListModal(true)}
                    className="px-3 py-2 text-sm text-gray-400 hover:bg-slate-800 rounded-lg cursor-pointer"
                  >
                    All Customers ({savedCustomers.length})
                  </div>
                </div>
                 <div
                                onClick={() => setActiveView("templates")}
                                className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-slate-800 rounded-lg cursor-pointer"
                              >
                                <FileText className="w-5 h-5" />
                                <span>Invoice Templates</span>
                              </div>
              
              <div className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-slate-800 rounded-lg cursor-pointer">
                <Truck className="w-5 h-5" />
                <span>Fleet</span>
              </div>

              <div className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-slate-800 rounded-lg cursor-pointer">
                <MapPin className="w-5 h-5" />
                <span>Tracking</span>
              </div>

              <div className="flex items-center justify-between px-3 py-2 text-gray-300 hover:bg-slate-800 rounded-lg cursor-pointer">
                <div className="flex items-center space-x-3">
                  <Receipt className="w-5 h-5" />
                  <span>Invoices</span>
                </div>
                <ChevronDown className="w-4 h-4" />
              </div>

              <div className="flex items-center justify-between px-3 py-2 text-gray-300 hover:bg-slate-800 rounded-lg cursor-pointer">
                <div className="flex items-center space-x-3">
                  <CreditCard className="w-5 h-5" />
                  <span>Payments</span>
                </div>
                <ChevronDown className="w-4 h-4" />
              </div>

              <div className="flex items-center justify-between px-3 py-2 text-gray-300 hover:bg-slate-800 rounded-lg cursor-pointer">
                <div className="flex items-center space-x-3">
                  <FileBarChart className="w-5 h-5" />
                  <span>Reports</span>
                </div>
                <ChevronDown className="w-4 h-4" />
              </div>

              <div className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-slate-800 rounded-lg cursor-pointer">
                <Calendar className="w-5 h-5" />
                <span>Schedule</span>
              </div>

              <div className="flex items-center justify-between px-3 py-2 text-gray-300 hover:bg-slate-800 rounded-lg cursor-pointer">
                <div className="flex items-center space-x-3">
                  <BarChart3 className="w-5 h-5" />
                  <span>Analytics</span>
                </div>
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700 bg-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-600 rounded-full"></div>
            <div className="flex-1">
              <div className="text-sm font-medium text-white">
                {user?.name || "User"}
              </div>
              <div className="text-xs text-gray-400">
                {user?.email || "email@example.com"}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-white"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className ="sticky top-0 z-40">
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
                Waybill #{waybillNumber || "— not saved yet —"}
              </h1>
              <TemplateSelector
                              user={user}
                              selectedTemplate={activeTemplate}
                              onTemplateChange={setActiveTemplate}
                            />
            </div>

            <div className="hidden lg:flex items-center space-x-3 print:hidden">
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <CheckSquare className="w-4 h-4" />
                <span>Mark Delivered</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </button>
              <button
                onClick={handleSaveWaybill}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                Save Waybill
              </button>

              <button
                onClick={handleNewWaybill}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Plus className="w-4 h-4" />
                New
              </button>

              <button className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
                <Send className="w-4 h-4" />
                <span>Send</span>
              </button>
              <button
                onClick={handleSavePDF}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                Save as PDF
              </button>

              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Log Out
              </button>
            </div>

            {/* Mobile Action Buttons */}
            <button
              onClick={handleLogout}
              className="lg:hidden p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors print:hidden"
            >
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>

        {/* Mobile Action Buttons Bar */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 print:hidden">
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 whitespace-nowrap text-sm">
              <CheckSquare className="w-4 h-4" />
              <span>Delivered</span>
            </button>
            <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 whitespace-nowrap text-sm">
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </button>
            <button className="flex items-center gap-2 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 whitespace-nowrap text-sm">
              <Send className="w-4 h-4" />
              <span>Send</span>
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors whitespace-nowrap text-sm"
            >
              <Download className="w-4 h-4" />
              <span>Save PDF</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors whitespace-nowrap text-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>
          </div>
        </div>

        <div className="bg-slate-900 border-b border-gray-200 px-4 lg:px-6 overflow-x-auto print:hidden">
          <div className="flex space-x-4 lg:space-x-8 min-w-max">
            {["Waybill", "Cargo", "History", "Notes"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 border-b-2 ${
                  activeTab === tab
                    ? "border-orange-400 text-white"
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
                          <div className="w-24 h-24 border-2 border-dashed rounded-lg flex items-center justify-center bg-gray-50">
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
                            className="inline-block px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 cursor-pointer"
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

                    <button
                      onClick={handleSaveBusinessInfo}
                      className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700"
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
                          className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
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
                                Route: {bill.shipment?.origin || ""} → {bill.shipment?.destination || "N/A"}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-semibold text-orange-600">
                                R{bill.totals?.total?.toFixed(2) || "0.00"}
                              </div>
                              <div className="text-sm text-gray-500">
                                {bill.dates?.shipmentDate
                                  ? new Date(
                                      bill.dates.shipmentDate
                                    ).toLocaleDateString("en-ZA")
                                  : "N/A"}
                              </div>
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
           {activeView === "templates" && <Templates user={user} />}
                     {activeView === "invoice" && (
                       <>
          {/* Mobile View Waybill Button */}
          <button
            onClick={() => setShowWaybill(!showWaybill)}
            className="lg:hidden w-full mb-4 flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <FileText className="w-5 h-5" />
            {showWaybill ? "Hide Waybill" : "View Waybill"}
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div
              className={`${
                showWaybill ? "hidden" : "block"
              } space-y-6 lg:block print:hidden`}
            >
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-blue-700 font-medium">In Transit</span>
                <span className="text-blue-600">Shipped Today</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="text-sm text-gray-500 mb-1">Total Amount</div>
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
                    <span>Sender Information</span>
                  </h2>
                  <button className="flex items-center space-x-2 text-orange-600 hover:text-orange-700">
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Sender Name</div>
                    <input
                      type="text"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      className="w-full px-4 py-2 border rounded"
                    />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Customer ID</div>
                    <input
                      type="text"
                      value={customerId}
                      onChange={(e) => setCustomerId(e.target.value)}
                      className="w-full px-4 py-2 border rounded"
                    />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Email</div>
                    <input
                      type="text"
                      value={senderEmail}
                      onChange={(e) => setSenderEmail(e.target.value)}
                      className="w-full px-4 py-2 border rounded"
                    />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Phone</div>
                    <input
                      type="text"
                      value={senderPhone}
                      onChange={(e) => setSenderPhone(e.target.value)}
                      className="w-full px-4 py-2 border rounded"
                    />
                  </div>
                  <div className="col-span-1 sm:col-span-2">
                    <div className="text-sm text-gray-500">Address</div>
                    <input
                      type="text"
                      value={senderAddress}
                      onChange={(e) => setSenderAddress(e.target.value)}
                      className="w-full px-4 py-2 border rounded"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>Receiver Information</span>
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Receiver Name</div>
                    <input
                      type="text"
                      value={receiverName}
                      onChange={(e) => setReceiverName(e.target.value)}
                      className="w-full px-4 py-2 border rounded"
                    />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Email</div>
                    <input
                      type="text"
                      value={receiverEmail}
                      onChange={(e) => setReceiverEmail(e.target.value)}
                      className="w-full px-4 py-2 border rounded"
                    />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Phone</div>
                    <input
                      type="text"
                      value={receiverPhone}
                      onChange={(e) => setReceiverPhone(e.target.value)}
                      className="w-full px-4 py-2 border rounded"
                    />
                  </div>
                  <div className="col-span-1 sm:col-span-2">
                    <div className="text-sm text-gray-500">Address</div>
                    <input
                      type="text"
                      value={receiverAddress}
                      onChange={(e) => setReceiverAddress(e.target.value)}
                      className="w-full px-4 py-2 border rounded"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center space-x-2">
                    <Package className="w-5 h-5" />
                    <span>Shipment Information</span>
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Origin</div>
                    <input
                      type="text"
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value)}
                      className="w-full px-4 py-2 border rounded"
                    />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Destination</div>
                    <input
                      type="text"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="w-full px-4 py-2 border rounded"
                    />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Cargo Type</div>
                    <input
                      type="text"
                      value={cargoType}
                      onChange={(e) => setCargoType(e.target.value)}
                      className="w-full px-4 py-2 border rounded"
                    />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Weight (kg)</div>
                    <input
                      type="text"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="w-full px-4 py-2 border rounded"
                    />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Dimensions</div>
                    <input
                      type="text"
                      value={dimensions}
                      onChange={(e) => setDimensions(e.target.value)}
                      className="w-full px-4 py-2 border rounded"
                    />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Tracking Number</div>
                    <input
                      type="text"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      className="w-full px-4 py-2 border rounded"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">Add Service/Charge</h2>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                  <select
                    value={newItem.type}
                    onChange={(e) =>
                      setNewItem({ ...newItem, type: e.target.value })
                    }
                    className="px-4 py-2 border rounded"
                  >
                    <option value="Freight">Freight</option>
                    <option value="Insurance">Insurance</option>
                    <option value="Handling">Handling</option>
                    <option value="Storage">Storage</option>
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
                    className="bg-orange-600 text-white rounded-lg px-4 py-2 hover:bg-orange-700 flex items-center justify-center gap-2"
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
                    <span className="font-medium">Due on Delivery</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Insurance:</span>
                    <span className="font-medium">Optional Coverage Available</span>
                  </div>
                </div>
              </div>
            </div>

            <div
              className={`${
                !showWaybill ? "hidden" : "block"
              } lg:block mx-auto bg-white shadow-lg overflow-hidden`}
              style={{
                width: "100%",
                maxWidth: "210mm",
                minHeight: "297mm",
              }}
            >
              <div className="bg-white" style={{ padding: "15mm 20mm" }}>
                {/* Header Section */}
                <div className="border-b-2 border-black pb-4 mb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        {loading ? (
                          <div className="w-16 h-16 bg-gray-200 animate-pulse rounded"></div>
                        ) : businessInfo.logoUrl ? (
                          <img
                            src={businessInfo.logoUrl}
                            alt="Business Logo"
                            className="w-16 h-16 object-contain"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.nextSibling.style.display = "flex";
                            }}
                          />
                        ) : (
                          <div className="w-12 h-12 bg-white rounded flex items-center justify-center">
                          </div>
                        )}
                        <div>
                          <div className="text-xl font-bold">
                            {businessInfo.businessName.split(" ")[0]}
                          </div>
                          <div className="text-sm font-semibold">
                            {businessInfo.businessName
                              .split(" ")
                              .slice(1)
                              .join(" ")}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs leading-relaxed">
                        <div>{businessInfo.addressLine1}</div>
                        <div>{businessInfo.addressLine2}</div>
                        <div>
                          {businessInfo.city} {businessInfo.postalCode}
                        </div>
                        <div className="mt-1">
                          T: {businessInfo.primaryPhone}
                          {businessInfo.secondaryPhone &&
                            `, ${businessInfo.secondaryPhone}`}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-3xl font-bold mb-4">WAYBILL</div>
                      <div className="text-xs space-y-1">
                        <div className="flex justify-between gap-8">
                          <span className="font-semibold">WAYBILL NO.</span>
                          <span>{waybillNumber}</span>
                        </div>
                        <div className="flex justify-between gap-8">
                          <span className="font-semibold">DATE</span>
                          <span>{new Date().toLocaleDateString("en-ZA")}</span>
                        </div>
                        <div className="flex justify-between gap-8">
                          <span className="font-semibold">TRACKING NO.</span>
                          <span>{trackingNumber}</span>
                        </div>
                        <div className="flex justify-between gap-8">
                          <span className="font-semibold">SERVICE TYPE</span>
                          <span>FREIGHT</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Three Column Section */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {/* Sender */}
                  <div className="bg-gray-200 p-3">
                    <div className="font-bold text-xs mb-2 bg-gray-400 px-2 py-1">
                      SENDER
                    </div>
                    <div className="text-xs space-y-1">
                      <div>
                        <div>{senderName}</div>
                      </div>
                      <div>
                        <div className="h-16 overflow-hidden text-xs leading-tight">
                          {senderAddress}
                        </div>
                      </div>
                      <div>
                        <div>{senderEmail}</div>
                      </div>
                      <div>
                        <div>{senderPhone}</div>
                      </div>
                    </div>
                  </div>

                  {/* Receiver */}
                  <div className="bg-gray-200 p-3">
                    <div className="font-bold text-xs mb-2 bg-gray-400 px-2 py-1">
                      RECEIVER
                    </div>
                    <div className="text-xs space-y-1">
                      <div>
                        <div>{receiverName}</div>
                      </div>
                      <div>
                        <div className="h-16 overflow-hidden text-xs leading-tight">
                          {receiverAddress}
                        </div>
                      </div>
                      <div>
                        <div>{receiverEmail}</div>
                      </div>
                      <div>
                        <div>{receiverPhone}</div>
                      </div>
                    </div>
                  </div>

                  {/* Shipment Details */}
                  <div className="bg-gray-200 p-3">
                    <div className="font-bold text-xs mb-2 bg-gray-400 px-2 py-1">
                      SHIPMENT DETAILS
                    </div>
                    <div className="text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="font-semibold">Origin:</span>
                        <span>{origin}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold">Destination:</span>
                        <span>{destination}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold">Cargo Type:</span>
                        <span>{cargoType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold">Weight:</span>
                        <span>{weight} kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold">Dimensions:</span>
                        <span className="text-[9px]">{dimensions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold">Tracking:</span>
                        <span className="text-[9px]">{trackingNumber}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Items Table */}
                <div className="mb-4">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gray-300">
                        <th className="text-left px-2 py-1 font-bold">
                          SERVICE DESCRIPTION
                        </th>
                        <th className="text-center px-2 py-1 font-bold">
                          QUANTITY
                        </th>
                        <th className="text-right px-2 py-1 font-bold">
                          UNIT PRICE
                        </th>
                        <th className="text-right px-2 py-1 font-bold">
                          NET PRICE
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, index) => (
                        <tr key={index} className="border-b">
                          <td className="px-2 py-2">{item.description}</td>
                          <td className="text-center px-2 py-2">{item.qty}</td>
                          <td className="text-right px-2 py-2">
                            R {item.rate.toFixed(2)}
                          </td>
                          <td className="text-right px-2 py-2">
                            R {item.amount.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <div className="flex justify-end mb-6">
                  <div className="w-64 text-xs">
                    <div className="flex justify-between py-1">
                      <span>Subtotal:</span>
                      <span>R {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>VAT:</span>
                      <span>R {vat.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-2 font-bold bg-gray-800 text-white px-2">
                      <span>TOTAL:</span>
                      <span>R {total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Signatures */}
                <div className="grid grid-cols-3 gap-4 mb-6 text-xs">
                  <div>
                    <div className="font-semibold mb-1">SENDER SIGNATURE</div>
                    <div className="border-b border-black h-8"></div>
                  </div>
                  <div>
                    <div className="font-semibold mb-1">DRIVER SIGNATURE</div>
                    <div className="border-b border-black h-8"></div>
                  </div>
                  <div>
                    <div className="font-semibold mb-1">RECEIVER SIGNATURE</div>
                    <div className="border-b border-black h-8"></div>
                  </div>
                </div>

                {/* Banking Details */}
                <div className="bg-red-50 border border-red-200 p-3 mb-4">
                  <div className="text-red-600 font-bold text-xs mb-2">
                    BANKING DETAILS
                  </div>
                  <div className="text-xs space-y-1">
                    <div>
                      <span className="font-semibold">Bank Name:</span> FNB
                    </div>
                    <div>
                      <span className="font-semibold">Account Holder:</span> SOLIDFLO LOGISTICS
                    </div>
                    <div>
                      <span className="font-semibold">Branch Name:</span>{" "}
                      LIFESTYLE CENTURION
                    </div>
                    <div>
                      <span className="font-semibold">Account Number:</span>{" "}
                      62146991441
                    </div>
                  </div>
                </div>

                {/* Footer Note */}
                <div className="text-center text-xs text-red-600 italic">
                  NB: All shipments are insured. Standard terms and conditions apply.
                </div>
              </div>
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
                [class*="bg-slate-900"],
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
          </>)} 
        </div>
      </div>
    </div>
  );
};

export default LogisticsDashboard;