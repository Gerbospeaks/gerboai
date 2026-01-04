import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { serverTimestamp } from "firebase/firestore";
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
import { Printer, Download, Sparkles, ChevronDown, ChevronLeft, Home, Settings, Users, Calendar, FileText, FileBarChart, BarChart3, Menu, Plus, Send, Edit, LogOut, CheckSquare, TrendingUp, CreditCard, Receipt, Building, ClipboardList, Package, Upload } from "lucide-react";
import { db } from "../firebase";
import CustomerModal from './CustomerModal';
import CustomersListModal from './CustomersListModal';

const generateInvoiceNumber = async (userId) => {
  const db = getFirestore();
  const year = new Date().getFullYear();
  const invoicesRef = collection(db, "users", userId, "invoices");
  const q = query(invoicesRef, orderBy("createdAt", "desc"), limit(1));
  const snapshot = await getDocs(q);
  let lastNumber = 100;
  if (!snapshot.empty) {
    const lastInvoice = snapshot.docs[0].data();
    const match = lastInvoice.invoiceNumber?.match(/(\d+)$/);
    if (match) lastNumber = Number(match[1]);
  }
  return `INV-${year}-${String(lastNumber + 1).padStart(4, "0")}`;
};

const CleaningDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Invoice");
  const [showInvoice, setShowInvoice] = useState(false);
  const { user } = useAuth();
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceId, setInvoiceId] = useState(null);
  const [savedInvoices, setSavedInvoices] = useState([]);
  const [showInvoicesList, setShowInvoicesList] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCustomersListModal, setShowCustomersListModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [savedCustomers, setSavedCustomers] = useState([]);

  const [customerName, setCustomerName] = useState("Jane Doe");
  const [customerId, setCustomerId] = useState("CUST-2024-5678");
  const [customerEmail, setCustomerEmail] = useState("jane.doe@example.com");
  const [customerPhone, setCustomerPhone] = useState("082 765 4321");
  const [customerAddress, setCustomerAddress] = useState("456 Oak Avenue, Pretoria, 0002");
  const [propertyType, setPropertyType] = useState("Residential");
  const [propertySize, setPropertySize] = useState("120");
  const [propertyRooms, setPropertyRooms] = useState("3");
  const [propertyBathrooms, setPropertyBathrooms] = useState("2");
  const [propertyFloors, setPropertyFloors] = useState("1");
  const [serviceFrequency, setServiceFrequency] = useState("Weekly");

  const [businessInfo, setBusinessInfo] = useState({
    businessName: "SPARKLE CLEAN SERVICES",
    addressLine1: "78 CLEANING STREET",
    addressLine2: "HATFIELD",
    city: "PRETORIA",
    postalCode: "0028",
    primaryPhone: "012 345 6789",
    secondaryPhone: "082 987 6543",
    logoUrl: "",
  });
  const [loading, setLoading] = useState(true);

  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ description: "", rate: "", qty: "", type: "Service" });

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const vat = subtotal * 0.15;
  const total = subtotal + vat;

  useEffect(() => {
    if (!user?.uid) return;
    const loadNumber = async () => {
      const next = await generateInvoiceNumber(user.uid);
      setInvoiceNumber(next);
    };
    loadNumber();
    loadSavedInvoices();
    loadCustomers();
    loadSavedCustomers();
  }, [user]);

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

  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const loadCustomers = async () => {
    if (!user?.uid) return;
    try {
      const q = query(collection(db, "users", user.uid, "clients"), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const customersData = [];
      querySnapshot.forEach((doc) => {
        customersData.push({ id: doc.id, ...doc.data() });
      });
      setCustomers(customersData);
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  };

  const loadSavedInvoices = async () => {
    if (!user?.uid) return;
    const db = getFirestore();
    const invoicesRef = collection(db, "users", user.uid, "invoices");
    const q = query(invoicesRef, orderBy("createdAt", "desc"), limit(50));
    const snapshot = await getDocs(q);
    const invs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setSavedInvoices(invs);
  };

  const loadSavedCustomers = async () => {
    if (!user?.uid) return;
    const db = getFirestore();
    const customersRef = collection(db, "users", user.uid, "clients");
    const q = query(customersRef, orderBy("createdAt", "desc"), limit(50));
    const snapshot = await getDocs(q);
    const custs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setSavedCustomers(custs.filter(c => !c._placeholder));
  };

  const loadBusinessInfo = async () => {
    if (!user?.uid) return;
    try {
      const db = getFirestore();
      const docRef = doc(db, "users", user.uid, "settings", "businessInfo");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) setBusinessInfo(docSnap.data());
    } catch (error) {
      console.error("Error loading business info:", error);
    }
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
    loadSavedCustomers();
  };

  const loadInvoice = (invoice) => {
    setInvoiceId(invoice.id);
    setInvoiceNumber(invoice.invoiceNumber || "");
    setCustomerName(invoice.customer?.name || "");
    setCustomerEmail(invoice.customer?.email || "");
    setCustomerPhone(invoice.customer?.phone || "");
    setCustomerAddress(invoice.customer?.address || "");
    setCustomerId(invoice.customer?.customerId || "");
    setPropertyType(invoice.property?.type || "");
    setPropertySize(invoice.property?.size || "");
    setPropertyRooms(invoice.property?.rooms || "");
    setPropertyBathrooms(invoice.property?.bathrooms || "");
    setPropertyFloors(invoice.property?.floors || "");
    setServiceFrequency(invoice.property?.serviceFrequency || "");
    setItems(invoice.items || []);
    setShowInvoicesList(false);
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

  const handleAddItem = () => {
    if (!newItem.description || !newItem.qty) return;
    const rate = Number(newItem.rate) || 0;
    const qty = Number(newItem.qty);
    const item = {
      description: newItem.description,
      type: newItem.type || "Service",
      rate,
      qty,
      amount: rate * qty,
    };
    setItems((prev) => [...prev, item]);
    setNewItem({ description: "", rate: "", qty: "", type: "Service" });
  };

  const buildInvoicePayload = (numberToUse) => ({
    invoiceNumber: numberToUse,
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
      rooms: propertyRooms,
      bathrooms: propertyBathrooms,
      floors: propertyFloors,
      serviceFrequency: serviceFrequency,
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
      const ref = await addDoc(collection(db, "users", user.uid, "invoices"), invoiceData);
      setInvoiceId(ref.id);
    }
    alert("Invoice saved successfully");
    loadSavedInvoices();
  };

  const handleNewInvoice = () => {
    setInvoiceId(null);
    setInvoiceNumber("");
    setCustomerName("Jane Doe");
    setCustomerId("CUST-2024-5678");
    setCustomerEmail("jane.doe@example.com");
    setCustomerPhone("082 765 4321");
    setCustomerAddress("456 Oak Avenue, Pretoria, 0002");
    setPropertyType("Residential");
    setPropertySize("120");
    setPropertyRooms("3");
    setPropertyBathrooms("2");
    setPropertyFloors("1");
    setServiceFrequency("Weekly");
    setItems([]);
    const loadNewNumber = async () => {
      if (user?.uid) {
        const next = await generateInvoiceNumber(user.uid);
        setInvoiceNumber(next);
      }
    };
    loadNewNumber();
  };

  const handlePrint = () => window.print();
  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const loadInvoiceForExport = async () => {
    if (!user?.uid || !invoiceId) return null;
    const db = getFirestore();
    const snap = await getDoc(doc(db, "users", user.uid, "invoices", invoiceId));
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
    setCustomerName(savedInvoice.customer.name);
    setCustomerEmail(savedInvoice.customer.email);
    setCustomerPhone(savedInvoice.customer.phone);
    setCustomerAddress(savedInvoice.customer.address);
    setPropertyType(savedInvoice.property.type);
    setPropertySize(savedInvoice.property.size);
    setPropertyRooms(savedInvoice.property.rooms);
    setTimeout(() => window.print(), 300);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)}></div>
      )}

      <div className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} fixed lg:relative lg:translate-x-0 z-50 w-64 bg-slate-900 border-r border-gray-200 transition-transform duration-300 h-full print:hidden`}>
        <div className="p-4">
          <div className="flex items-center space-x-2 mb-8">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-lg text-white">Cleaning Pro</span>
            <ChevronDown className="w-4 h-4 ml-auto text-gray-400" />
          </div>

          <nav className="space-y-1">
            <div className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-slate-800 rounded-lg cursor-pointer">
              <Home className="w-5 h-5" />
              <span>Home</span>
            </div>
            <div onClick={() => setShowSettings(true)} className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-slate-800 rounded-lg cursor-pointer">
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
                    <span>Invoices</span>
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </div>

                <div className="ml-8 mt-1 space-y-1">
                  <div onClick={handleNewInvoice} className="px-3 py-2 text-sm text-white bg-slate-800 rounded-lg cursor-pointer">
                    Create Invoice
                  </div>
                  <div onClick={() => setShowInvoicesList(!showInvoicesList)} className="px-3 py-2 text-sm text-gray-400 hover:bg-slate-800 rounded-lg cursor-pointer">
                    All Invoices ({savedInvoices.length})
                  </div>
                  <div className="px-3 py-2 text-sm text-gray-400 hover:bg-slate-800 rounded-lg cursor-pointer">
                    Scheduled
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-slate-800 rounded-lg cursor-pointer mt-2">
                <Users className="w-5 h-5" />
                <span>Customers</span>
              </div>
              <div className="ml-8 mt-1 space-y-1">
                <div onClick={handleAddNewCustomer} className="flex items-center space-x-3 px-3 py-2 text-gray-400 hover:bg-slate-800 rounded-lg cursor-pointer mt-2">
                  <span>Add Customer</span>
                </div>
                <div onClick={() => setShowCustomersListModal(true)} className="px-3 py-2 text-sm text-gray-400 hover:bg-slate-800 rounded-lg cursor-pointer">
                  All Customers ({savedCustomers.length})
                </div>
              </div>

              <div className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-slate-800 rounded-lg cursor-pointer">
                <Building className="w-5 h-5" />
                <span>Properties</span>
              </div>

              <div className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-slate-800 rounded-lg cursor-pointer">
                <Package className="w-5 h-5" />
                <span>Supplies</span>
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
            <div className="w-10 h-10 bg-blue-600 rounded-full"></div>
            <div className="flex-1">
              <div className="text-sm font-medium text-white">{user?.name || "User"}</div>
              <div className="text-xs text-gray-400">{user?.email || "email@example.com"}</div>
            </div>
            <button onClick={handleLogout} className="text-gray-400 hover:text-white">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 lg:space-x-4">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg">
                <Menu className="w-5 h-5" />
              </button>
              <ChevronLeft className="hidden lg:block w-5 h-5 text-gray-400" />
              <h1 className="text-base lg:text-xl font-semibold">
                Invoice #{invoiceNumber || "— not saved yet —"}
              </h1>
            </div>

            <div className="hidden lg:flex items-center space-x-3 print:hidden">
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <CheckSquare className="w-4 h-4" />
                <span>Mark Complete</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </button>
              <button onClick={handleSaveInvoice} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Save Invoice
              </button>
              <button onClick={handleNewInvoice} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                <Plus className="w-4 h-4" />
                New
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Send className="w-4 h-4" />
                <span>Send</span>
              </button>
              <button onClick={handleSavePDF} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Save as PDF
              </button>
              <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                <Printer className="w-4 h-4" />
                Print
              </button>
              <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                Log Out
              </button>
            </div>

            <button onClick={handleLogout} className="lg:hidden p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors print:hidden">
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>

        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 print:hidden">
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 whitespace-nowrap text-sm">
              <CheckSquare className="w-4 h-4" />
              <span>Complete</span>
            </button>
            <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 whitespace-nowrap text-sm">
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </button>
            <button className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 whitespace-nowrap text-sm">
              <Send className="w-4 h-4" />
              <span>Send</span>
            </button>
            <button onClick={handleSavePDF} className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap text-sm">
              <Download className="w-4 h-4" />
              <span>Save PDF</span>
            </button>
            <button onClick={handlePrint} className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors whitespace-nowrap text-sm">
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>
          </div>
        </div>

        <div className="bg-slate-900 border-b border-gray-200 px-4 lg:px-6 overflow-x-auto print:hidden">
          <div className="flex space-x-4 lg:space-x-8 min-w-max">
            {["Invoice", "Services", "History", "Notes"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 border-b-2 ${activeTab === tab ? "border-blue-400 text-white" : "border-transparent text-gray-400 hover:text-gray-200"}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 lg:p-6">
          {showSettings && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                <div className="p-4 border-b flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Business Settings</h2>
                  <button onClick={() => setShowSettings(false)} className="text-gray-500 hover:text-gray-700 text-2xl">
                    ✕
                  </button>
                </div>

                <div className="overflow-auto p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Business Logo</label>
                      <div className="flex items-center gap-4">
                        {businessInfo.logoUrl ? (
                          <img src={businessInfo.logoUrl} alt="Business Logo" className="w-24 h-24 object-contain border rounded-lg" />
                        ) : (
                          <div className="w-24 h-24 border-2 border-dashed rounded-lg flex items-center justify-center bg-gray-50">
                            <Upload className="w-8 h-8 text-gray-400" />
                          </div>
                        )}

                        <div className="flex-1">
                          <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" id="logo-upload" />
                          <label htmlFor="logo-upload" className="inline-block px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 cursor-pointer">
                            {businessInfo.logoUrl ? "Change Logo" : "Upload Logo"}
                          </label>
                          <p className="text-xs text-gray-500 mt-2">Recommended: Square image, max 5MB</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Business Name</label>
                      <input type="text" value={businessInfo.businessName} onChange={(e) => setBusinessInfo({ ...businessInfo, businessName: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Address Line 1</label>
                      <input type="text" value={businessInfo.addressLine1} onChange={(e) => setBusinessInfo({ ...businessInfo, addressLine1: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Address Line 2</label>
                      <input type="text" value={businessInfo.addressLine2} onChange={(e) => setBusinessInfo({ ...businessInfo, addressLine2: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">City</label>
                        <input type="text" value={businessInfo.city} onChange={(e) => setBusinessInfo({ ...businessInfo, city: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Postal Code</label>
                        <input type="text" value={businessInfo.postalCode} onChange={(e) => setBusinessInfo({ ...businessInfo, postalCode: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Primary Phone</label>
                      <input type="tel" value={businessInfo.primaryPhone} onChange={(e) => setBusinessInfo({ ...businessInfo, primaryPhone: e.target.value })} className="w-full px-4 py-2 border rounded-lg" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Secondary Phone (Optional)</label>
                      <input type="tel" value={businessInfo.secondaryPhone} onChange={(e) => setBusinessInfo({ ...businessInfo, secondaryPhone: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
                    </div>
                    <button onClick={handleSaveBusinessInfo} className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700">
                      Save Business Information
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <CustomersListModal showModal={showCustomersListModal} setShowModal={setShowCustomersListModal} customers={customers} onLoadCustomer={loadCustomer} onEditCustomer={handleEditCustomer} onAddNewCustomer={handleAddNewCustomer} />
          <CustomerModal showModal={showCustomerModal} setShowModal={setShowCustomerModal} existingCustomer={selectedCustomer} onCustomerSaved={handleCustomerSaved} />

          {showInvoicesList && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
                <div className="p-4 border-b flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Saved Invoices</h2>
                  <button onClick={() => setShowInvoicesList(false)} className="text-gray-500 hover:text-gray-700">✕</button>
                </div>
                <div className="overflow-auto p-4">
                  {savedInvoices.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No saved invoices yet</div>
                  ) : (
                    <div className="space-y-2">
                      {savedInvoices.map((inv) => (
                        <div key={inv.id} onClick={() => loadInvoice(inv)} className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-semibold text-lg">{inv.invoiceNumber || "N/A"}</div>
                              <div className="text-sm text-gray-600 mt-1">Customer: {inv.customer?.name || "N/A"}</div>
                              <div className="text-sm text-gray-600">Property: {inv.property?.type || "N/A"} - {inv.property?.size || ""}m²</div>
                              <div className="text-sm text-gray-600">Frequency: {inv.property?.serviceFrequency || "N/A"}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-semibold text-blue-600">R{inv.totals?.total?.toFixed(2) || "0.00"}</div>
                              <div className="text-sm text-gray-500">{inv.dates?.serviceDate ? new Date(inv.dates.serviceDate).toLocaleDateString("en-ZA") : "N/A"}</div>
                              <div className={`text-xs mt-1 px-2 py-1 rounded ${inv.status === "completed" ? "bg-green-100 text-green-700" : inv.status === "pending" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}`}>
                                {inv.status || "unknown"}
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

          <button onClick={() => setShowInvoice(!showInvoice)} className="lg:hidden w-full mb-4 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <FileText className="w-5 h-5" />
            {showInvoice ? "Hide Invoice" : "View Invoice"}
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${showInvoice ? "hidden" : "block"} space-y-6 lg:block print:hidden`}>
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-blue-700 font-medium">Scheduled</span>
                <span className="text-blue-600">Service Date: {new Date().toLocaleDateString("en-ZA")}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="text-sm text-gray-500 mb-1">Total Amount</div>
                  <div className="text-2xl font-semibold text-blue-600">R{total.toFixed(2)}</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="text-sm text-gray-500 mb-1">Paid</div>
                  <div className="text-2xl font-semibold text-green-600">R0.00</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="text-sm text-gray-500 mb-1">Balance Due</div>
                  <div className="text-2xl font-semibold text-red-600">R{total.toFixed(2)}</div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>Customer Information</span>
                  </h2>
                  <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700">
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Customer Name</div>
                    <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full px-4 py-2 border rounded" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Customer ID</div>
                    <input type="text" value={customerId} onChange={(e) => setCustomerId(e.target.value)} className="w-full px-4 py-2 border rounded" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Email</div>
                    <input type="text" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} className="w-full px-4 py-2 border rounded" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Phone</div>
                    <input type="text" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="w-full px-4 py-2 border rounded" />
                  </div>
                  <div className="col-span-1 sm:col-span-2">
                    <div className="text-sm text-gray-500">Address</div>
                    <input type="text" value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} className="w-full px-4 py-2 border rounded" />
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center space-x-2">
                    <Building className="w-5 h-5" />
                    <span>Property Information</span>
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Property Type</div>
                    <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)} className="w-full px-4 py-2 border rounded">
                      <option>Residential</option>
                      <option>Commercial</option>
                      <option>Office</option>
                    </select>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Size (m²)</div>
                    <input type="text" value={propertySize} onChange={(e) => setPropertySize(e.target.value)} className="w-full px-4 py-2 border rounded" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Rooms</div>
                    <input type="text" value={propertyRooms} onChange={(e) => setPropertyRooms(e.target.value)} className="w-full px-4 py-2 border rounded" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Bathrooms</div>
                    <input type="text" value={propertyBathrooms} onChange={(e) => setPropertyBathrooms(e.target.value)} className="w-full px-4 py-2 border rounded" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Floors</div>
                    <input type="text" value={propertyFloors} onChange={(e) => setPropertyFloors(e.target.value)} className="w-full px-4 py-2 border rounded" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Service Frequency</div>
                    <select value={serviceFrequency} onChange={(e) => setServiceFrequency(e.target.value)} className="w-full px-4 py-2 border rounded">
                      <option>One-Time</option>
                      <option>Weekly</option>
                      <option>Bi-Weekly</option>
                      <option>Monthly</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">Add Service/Item</h2>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                  <select value={newItem.type} onChange={(e) => setNewItem({ ...newItem, type: e.target.value })} className="px-4 py-2 border rounded">
                    <option value="Service">Service</option>
                    <option value="Supplies">Supplies</option>
                  </select>
                  <input type="text" placeholder="Description" value={newItem.description} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} className="px-4 py-2 border rounded" />
                  <input type="number" placeholder="Rate" value={newItem.rate} onChange={(e) => setNewItem({ ...newItem, rate: e.target.value })} className="px-4 py-2 border rounded" />
                  <input type="number" placeholder="Qty" value={newItem.qty} onChange={(e) => setNewItem({ ...newItem, qty: e.target.value })} className="px-4 py-2 border rounded" />
                  <button onClick={handleAddItem} className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 flex items-center justify-center gap-2">
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
                    <span className="text-gray-600">Service Guarantee:</span>
                    <span className="font-medium">7 Day Satisfaction Guarantee</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={`${!showInvoice ? "hidden" : "block"} lg:block mx-auto bg-white shadow-lg overflow-hidden`} style={{ width: "100%", maxWidth: "210mm", minHeight: "297mm" }}>
              <div className="bg-white" style={{ padding: "15mm 20mm" }}>
                <div className="border-b-2 border-black pb-4 mb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        {loading ? (
                          <div className="w-16 h-16 bg-gray-200 animate-pulse rounded"></div>
                        ) : businessInfo.logoUrl ? (
                          <img src={businessInfo.logoUrl} alt="Business Logo" className="w-16 h-16 object-contain" />
                        ) : (
                          <div className="w-12 h-12 bg-white rounded flex items-center justify-center"></div>
                        )}
                        <div>
                          <div className="text-xl font-bold">{businessInfo.businessName.split(" ")[0]} {businessInfo.businessName.split(" ")[1]}</div>
                          <div className="text-sm font-semibold">{businessInfo.businessName.split(" ").slice(2).join(" ")}</div>
                        </div>
                      </div>
                      <div className="text-xs leading-relaxed">
                        <div>{businessInfo.addressLine1}</div>
                        <div>{businessInfo.addressLine2}</div>
                        <div>{businessInfo.city} {businessInfo.postalCode}</div>
                        <div className="mt-1">T: {businessInfo.primaryPhone}{businessInfo.secondaryPhone && `, ${businessInfo.secondaryPhone}`}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold mb-4">INVOICE</div>
                      <div className="text-xs space-y-1">
                        <div className="flex justify-between gap-8">
                          <span className="font-semibold">INVOICE NO.</span>
                          <span>{invoiceNumber}</span>
                        </div>
                        <div className="flex justify-between gap-8">
                          <span className="font-semibold">DATE</span>
                          <span>{new Date().toLocaleDateString("en-ZA")}</span>
                        </div>
                        <div className="flex justify-between gap-8">
                          <span className="font-semibold">SERVICE TYPE</span>
                          <span>CLEANING</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="bg-gray-200 p-3">
                    <div className="font-bold text-xs mb-2 bg-gray-400 px-2 py-1">INVOICE TO</div>
                    <div className="text-xs space-y-1">
                      <div>{customerName}</div>
                      <div className="h-16 overflow-hidden text-xs leading-tight">{customerAddress}</div>
                      <div>{customerEmail}</div>
                      <div>{customerPhone}</div>
                    </div>
                  </div>

                  <div className="bg-gray-200 p-3">
                    <div className="font-bold text-xs mb-2 bg-gray-400 px-2 py-1">BILL TO</div>
                    <div className="text-xs space-y-1">
                      <div>{customerName}</div>
                      <div className="h-16 overflow-hidden text-xs leading-tight">{customerAddress}</div>
                      <div>{customerEmail}</div>
                      <div>{customerPhone}</div>
                    </div>
                  </div>

                  <div className="bg-gray-200 p-3">
                    <div className="font-bold text-xs mb-2 bg-gray-400 px-2 py-1">PROPERTY DETAILS</div>
                    <div className="text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="font-semibold">Type:</span>
                        <span>{propertyType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold">Size:</span>
                        <span>{propertySize}m²</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold">Rooms:</span>
                        <span>{propertyRooms}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold">Bathrooms:</span>
                        <span>{propertyBathrooms}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold">Floors:</span>
                        <span>{propertyFloors}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold">Frequency:</span>
                        <span className="text-[9px]">{serviceFrequency}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gray-300">
                        <th className="text-left px-2 py-1 font-bold">SERVICE DESCRIPTION</th>
                        <th className="text-center px-2 py-1 font-bold">QUANTITY</th>
                        <th className="text-right px-2 py-1 font-bold">UNIT PRICE</th>
                        <th className="text-right px-2 py-1 font-bold">NET PRICE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, index) => (
                        <tr key={index} className="border-b">
                          <td className="px-2 py-2">{item.description}</td>
                          <td className="text-center px-2 py-2">{item.qty}</td>
                          <td className="text-right px-2 py-2">R {item.rate.toFixed(2)}</td>
                          <td className="text-right px-2 py-2">R {item.amount.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

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

                <div className="grid grid-cols-3 gap-4 mb-6 text-xs">
                  <div>
                    <div className="font-semibold mb-1">SERVICE PROVIDER SIGNATURE</div>
                    <div className="border-b border-black h-8"></div>
                  </div>
                  <div>
                    <div className="font-semibold mb-1">CLIENT SIGNATURE</div>
                    <div className="border-b border-black h-8"></div>
                  </div>
                  <div>
                    <div className="font-semibold mb-1">CONTACT NUMBER:</div>
                    <div className="border-b border-black h-8"></div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 p-3 mb-4">
                  <div className="text-blue-600 font-bold text-xs mb-2">BANKING DETAILS</div>
                  <div className="text-xs space-y-1">
                    <div><span className="font-semibold">Bank Name:</span> FNB</div>
                    <div><span className="font-semibold">Account Holder:</span> SPARKLE CLEAN SERVICES</div>
                    <div><span className="font-semibold">Branch Name:</span> HATFIELD</div>
                    <div><span className="font-semibold">Account Number:</span> 62876543210</div>
                  </div>
                </div>

                <div className="text-center text-xs text-blue-600 italic">
                  7 Day Satisfaction Guarantee - Quality Cleaning Services
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
                div[class*="border-b"][class*="border-gray"] {
                  display: none !important;
                }
                nav, [class*="sidebar"], [class*="bg-slate-900"], button:not([style]) {
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
        </div>
      </div>
    </div>
  );
};

export default CleaningDashboard;