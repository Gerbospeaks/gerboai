import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { serverTimestamp } from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth";
import logo from "../../assets/img/solidflo-logo.png";
import Templates from "./Templates";
import TemplateSelector, { TemplateRenderer } from './TemplateSelector';
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
import {
  Printer,
  Download,
  Sparkles,
  ChevronDown,
  ChevronLeft,
  Home,
  Settings,
  Users,
  Calendar,
  FileText,
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
  Building,
  ClipboardList,
  Package,
  Upload,
  RefreshCw,
} from "lucide-react";
import { db } from "../../firebase";
import CustomerModal from "../CustomerModal";
import CustomersListModal from "../CustomersListModal";
import FinancialOverview from "../FinancialOverview";
import SignatureStamp from '../SignatureStamp';

// Generate Invoice Number
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

// Generate Quote Number
const generateQuoteNumber = async (userId) => {
  const db = getFirestore();
  const year = new Date().getFullYear();
  const quotesRef = collection(db, "users", userId, "quotations");
  const q = query(quotesRef, orderBy("createdAt", "desc"), limit(1));
  const snapshot = await getDocs(q);
  let lastNumber = 100;
  if (!snapshot.empty) {
    const lastQuote = snapshot.docs[0].data();
    const match = lastQuote.quoteNumber?.match(/(\d+)$/);
    if (match) lastNumber = Number(match[1]);
  }
  return `QUO-${year}-${String(lastNumber + 1).padStart(4, "0")}`;
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
  const [activeView, setActiveView] = useState("invoice");
  const [activeTemplate, setActiveTemplate] = useState("classic");
  
  // Quote-specific states
  const [isQuoteMode, setIsQuoteMode] = useState(false);
  const [quoteId, setQuoteId] = useState(null);
  const [savedQuotes, setSavedQuotes] = useState([]);
  const [showQuotesList, setShowQuotesList] = useState(false);
  const [showConvertButton, setShowConvertButton] = useState(false);
  
  const [customerName, setCustomerName] = useState("Zoey Mor");
  const [customerId, setCustomerId] = useState("CUST-2026-5678");
  const [customerEmail, setCustomerEmail] = useState("jane.doe@example.com");
  const [customerPhone, setCustomerPhone] = useState("082 765 4321");
  const [selectedTemplate, setSelectedTemplate] = useState('professional');
  const [customerAddress, setCustomerAddress] = useState(
    "456 Oak Avenue, Pretoria, 0002"
  );
  const [propertyType, setPropertyType] = useState("Residential");
  const [propertySize, setPropertySize] = useState("120");
  const [propertyRooms, setPropertyRooms] = useState("3");
  const [propertyBathrooms, setPropertyBathrooms] = useState("2");
  const [propertyFloors, setPropertyFloors] = useState("1");
  const [serviceFrequency, setServiceFrequency] = useState("Weekly");
  const [stampSettings, setStampSettings] = useState({
    text: "APPROVED",
  color: "#d32f2f",
  showDate: false,
  enabled: false
  });
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
  const [newItem, setNewItem] = useState({
    description: "",
    rate: "",
    qty: "",
    type: "Service",
  });

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const vat = subtotal * 0.15;
  const total = subtotal + vat;

  useEffect(() => {
    if (!user?.uid) return;
    const loadNumber = async () => {
      if (isQuoteMode) {
        const next = await generateQuoteNumber(user.uid);
        setInvoiceNumber(next);
      } else {
        const next = await generateInvoiceNumber(user.uid);
        setInvoiceNumber(next);
      }
    };
    loadNumber();
    loadSavedInvoices();
    loadSavedQuotes();
    loadCustomers();
    loadSavedCustomers();
  }, [user, isQuoteMode]);

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
      const q = query(
        collection(db, "users", user.uid, "clients"),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      const customersData = [];
      querySnapshot.forEach((doc) => {
        customersData.push({ id: doc.id, ...doc.data() });
      });
      setCustomers(customersData);
    } catch (error) {
      console.error("Error loading customers:", error);
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

  const loadSavedQuotes = async () => {
    if (!user?.uid) return;
    const db = getFirestore();
    const quotesRef = collection(db, "users", user.uid, "quotations");
    const q = query(quotesRef, orderBy("createdAt", "desc"), limit(50));
    const snapshot = await getDocs(q);
    const quotes = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setSavedQuotes(quotes);
  };

  const loadSavedCustomers = async () => {
    if (!user?.uid) return;
    const db = getFirestore();
    const customersRef = collection(db, "users", user.uid, "clients");
    const q = query(customersRef, orderBy("createdAt", "desc"), limit(50));
    const snapshot = await getDocs(q);
    const custs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setSavedCustomers(custs.filter((c) => !c._placeholder));
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
    setIsQuoteMode(false);
    setInvoiceId(invoice.id);
    setQuoteId(null);
    setShowConvertButton(false);
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
    setActiveView("invoice");
  };

  const loadQuote = (quote) => {
    setIsQuoteMode(true);
    setQuoteId(quote.id);
    setInvoiceId(null);
    setShowConvertButton(true);
    setInvoiceNumber(quote.quoteNumber || "");
    setCustomerName(quote.customer?.name || "");
    setCustomerEmail(quote.customer?.email || "");
    setCustomerPhone(quote.customer?.phone || "");
    setCustomerAddress(quote.customer?.address || "");
    setCustomerId(quote.customer?.customerId || "");
    setPropertyType(quote.property?.type || "");
    setPropertySize(quote.property?.size || "");
    setPropertyRooms(quote.property?.rooms || "");
    setPropertyBathrooms(quote.property?.bathrooms || "");
    setPropertyFloors(quote.property?.floors || "");
    setServiceFrequency(quote.property?.serviceFrequency || "");
    setItems(quote.items || []);
    setShowQuotesList(false);
    setActiveView("invoice");
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

  const handleSaveInvoice = async () => {
    if (!user?.uid) return;
    const db = getFirestore();
    let numberToUse = invoiceNumber;
    
    if (isQuoteMode) {
      // Saving as Quote
      if (!quoteId) {
        numberToUse = await generateQuoteNumber(user.uid);
        setInvoiceNumber(numberToUse);
      }
      const quoteData = {
        quoteNumber: numberToUse,
        locked: true,
        status: "pending",
        dates: {
          quoteDate: new Date().toISOString(),
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
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
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      if (quoteId) {
        await updateDoc(doc(db, "users", user.uid, "quotations", quoteId), {
          ...quoteData,
          updatedAt: serverTimestamp(),
        });
      } else {
        const ref = await addDoc(
          collection(db, "users", user.uid, "quotations"),
          quoteData
        );
        setQuoteId(ref.id);
        setShowConvertButton(true);
      }
      alert("Quote saved successfully");
      loadSavedQuotes();
    } else {
      // Saving as Invoice
      if (!invoiceId) {
        numberToUse = await generateInvoiceNumber(user.uid);
        setInvoiceNumber(numberToUse);
      }
      const invoiceData = {
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
      };
      
      if (invoiceId) {
        await updateDoc(doc(db, "users", user.uid, "invoices", invoiceId), {
          ...invoiceData,
          updatedAt: serverTimestamp(),
        });
      } else {
        const ref = await addDoc(
          collection(db, "users", user.uid, "invoices"),
          invoiceData
        );
        setInvoiceId(ref.id);
      }
      alert("Invoice saved successfully");
      loadSavedInvoices();
    }
  };

  const handleConvertToInvoice = async () => {
    if (!user?.uid || !quoteId) {
      alert("Please save the quote first");
      return;
    }
    
    if (!window.confirm("Are you sure you want to convert this quote to an invoice?")) {
      return;
    }

    try {
      const db = getFirestore();
      const invoiceNumber = await generateInvoiceNumber(user.uid);
      
      const invoiceData = {
        invoiceNumber,
        locked: true,
        status: "pending",
        convertedFromQuote: quoteId,
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
      };

      const ref = await addDoc(
        collection(db, "users", user.uid, "invoices"),
        invoiceData
      );

      // Update quote status
      await updateDoc(doc(db, "users", user.uid, "quotations", quoteId), {
        status: "converted",
        convertedToInvoice: ref.id,
        updatedAt: serverTimestamp(),
      });

      setIsQuoteMode(false);
      setInvoiceId(ref.id);
      setQuoteId(null);
      setInvoiceNumber(invoiceNumber);
      setShowConvertButton(false);
      
      alert("Quote converted to invoice successfully!");
      loadSavedInvoices();
      loadSavedQuotes();
    } catch (error) {
      console.error("Error converting quote:", error);
      alert("Failed to convert quote to invoice");
    }
  };

  const handleNewInvoice = () => {
    setActiveView("invoice");
    setIsQuoteMode(false);
    setInvoiceId(null);
    setQuoteId(null);
    setShowConvertButton(false);
    setInvoiceNumber("");
    setCustomerName("Zoey Mor");
    setCustomerId("CUST-2026-5678");
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

  const handleNewQuote = () => {
    setActiveView("invoice");
    setIsQuoteMode(true);
    setInvoiceId(null);
    setQuoteId(null);
    setShowConvertButton(false);
    setInvoiceNumber("");
    setCustomerName("Zoey Mor");
    setCustomerId("CUST-2026-5678");
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
        const next = await generateQuoteNumber(user.uid);
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
    if (!user?.uid) return null;
    const db = getFirestore();
    
    if (isQuoteMode && quoteId) {
      const snap = await getDoc(doc(db, "users", user.uid, "quotations", quoteId));
      return snap.exists() ? snap.data() : null;
    } else if (invoiceId) {
      const snap = await getDoc(doc(db, "users", user.uid, "invoices", invoiceId));
      return snap.exists() ? snap.data() : null;
    }
    return null;
  };

  const handleSavePDF = async () => {
    const savedDoc = await loadInvoiceForExport();
    if (!savedDoc) {
      alert(`Please save the ${isQuoteMode ? 'quote' : 'invoice'} before exporting PDF`);
      return;
    }
    
    if (isQuoteMode) {
      setInvoiceNumber(savedDoc.quoteNumber);
    } else {
      setInvoiceNumber(savedDoc.invoiceNumber);
    }
    
    setItems(savedDoc.items);
    setCustomerName(savedDoc.customer.name);
    setCustomerEmail(savedDoc.customer.email);
    setCustomerPhone(savedDoc.customer.phone);
    setCustomerAddress(savedDoc.customer.address);
    setPropertyType(savedDoc.property.type);
    setPropertySize(savedDoc.property.size);
    setPropertyRooms(savedDoc.property.rooms);
    setTimeout(() => window.print(), 300);
  };

  return (
    <div className="flex h-screen bg-gray-300">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      <div
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed lg:relative lg:translate-x-0 z-50 w-64 bg-gray-800 border-r border-gray-200 transition-transform duration-300 h-full print:hidden`}
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
              <div
                onClick={() => setActiveView("financial-overview")}
                className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-slate-800 rounded-lg cursor-pointer"
              >
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
                  <div
                    onClick={handleNewInvoice}
                    className="px-3 py-2 text-sm text-white bg-slate-800 rounded-lg cursor-pointer"
                  >
                    Create Invoice
                  </div>
                  <div
                    onClick={() => setShowInvoicesList(!showInvoicesList)}
                    className="px-3 py-2 text-sm text-gray-400 hover:bg-slate-800 rounded-lg cursor-pointer"
                  >
                    All Invoices ({savedInvoices.length})
                  </div>
                  <div className="px-3 py-2 text-sm text-gray-400 hover:bg-slate-800 rounded-lg cursor-pointer">
                    Scheduled
                  </div>
                </div>
              </div>

              <div className="mt-2">
                <div className="flex items-center justify-between px-3 py-2 text-gray-300 hover:bg-slate-800 rounded-lg cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <Receipt className="w-5 h-5" />
                    <span>Quotes</span>
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </div>

                <div className="ml-8 mt-1 space-y-1">
                  <div
                    onClick={handleNewQuote}
                    className="px-3 py-2 text-sm text-white bg-slate-800 rounded-lg cursor-pointer"
                  >
                    Create Quote
                  </div>
                  <div
                    onClick={() => setShowQuotesList(!showQuotesList)}
                    className="px-3 py-2 text-sm text-gray-400 hover:bg-slate-800 rounded-lg cursor-pointer"
                  >
                    All Quotes ({savedQuotes.length})
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

              <div className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-slate-800 rounded-lg cursor-pointer">
                <Building className="w-5 h-5" />
                <span>Properties</span>
              </div>
              <div
                onClick={() => setActiveView("templates")}
                className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                <FileText className="w-5 h-5" />
                <span>Invoice Templates</span>
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

      <div className="flex-1 overflow-auto">
        <div className="sticky top-0 z-40 flex flex-col">
          <div className="bg-gray-300 border-b border-gray-200 px-4 lg:px-6 py-4">
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
                  {isQuoteMode ? 'Quote' : 'Invoice'} #{invoiceNumber || "— not saved yet —"}
                </h1>
                <TemplateSelector
                  user={user}
                  selectedTemplate={activeTemplate}
                  onTemplateChange={setActiveTemplate}
                />
              </div>

              <div className="hidden lg:flex items-center space-x-3 print:hidden">
                {showConvertButton && (
                  <button
                    onClick={handleConvertToInvoice}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Convert to Invoice
                  </button>
                )}
                <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-300">
                  <CheckSquare className="w-4 h-4" />
                  <span>Mark Complete</span>
                </button>
                <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-300">
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={handleSaveInvoice}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save {isQuoteMode ? 'Quote' : 'Invoice'}
                </button>
                <button
                  onClick={isQuoteMode ? handleNewQuote : handleNewInvoice}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Plus className="w-4 h-4" />
                  New
                </button>
                <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <Send className="w-4 h-4" />
                  <span>Send</span>
                </button>
                <button
                  onClick={handleSavePDF}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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

              <button
                onClick={handleLogout}
                className="lg:hidden p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors print:hidden"
              >
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>

          <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 print:hidden">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {showConvertButton && (
                <button
                  onClick={handleConvertToInvoice}
                  className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 whitespace-nowrap text-sm"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>To Invoice</span>
                </button>
              )}
              <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-300 whitespace-nowrap text-sm">
                <CheckSquare className="w-4 h-4" />
                <span>Complete</span>
              </button>
              <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-300 whitespace-nowrap text-sm">
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </button>
              <button className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 whitespace-nowrap text-sm">
                <Send className="w-4 h-4" />
                <span>Send</span>
              </button>
              <button
                onClick={handleSavePDF}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap text-sm"
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

          <div className="bg-gray-800 border-b border-gray-200 px-4 lg:px-6 overflow-x-auto print:hidden">
            <div className="flex space-x-4 lg:space-x-8 min-w-max">
              {[isQuoteMode ? "Quote" : "Invoice", "Services", "History", "Notes"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 border-b-2 ${
                    activeTab === tab || (tab === "Quote" && isQuoteMode) || (tab === "Invoice" && !isQuoteMode)
                      ? "border-blue-400 text-white"
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
          {/* Settings Modal */}
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
                          <div className="w-24 h-24 border-2 border-dashed rounded-lg flex items-center justify-center bg-gray-300">
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
                            {businessInfo.logoUrl ? "Change Logo" : "Upload Logo"}
                          </label>
                          <p className="text-xs text-gray-500 mt-2">
                            Recommended: Square image, max 5MB
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Business Name</label>
                      <input
                        type="text"
                        value={businessInfo.businessName}
                        onChange={(e) => setBusinessInfo({...businessInfo, businessName: e.target.value})}
                        className="w-full px-4 py-2 border rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Address Line 1</label>
                      <input
                        type="text"
                        value={businessInfo.addressLine1}
                        onChange={(e) => setBusinessInfo({...businessInfo, addressLine1: e.target.value})}
                        className="w-full px-4 py-2 border rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Address Line 2</label>
                      <input
                        type="text"
                        value={businessInfo.addressLine2}
                        onChange={(e) => setBusinessInfo({...businessInfo, addressLine2: e.target.value})}
                        className="w-full px-4 py-2 border rounded-lg"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">City</label>
                        <input
                          type="text"
                          value={businessInfo.city}
                          onChange={(e) => setBusinessInfo({...businessInfo, city: e.target.value})}
                          className="w-full px-4 py-2 border rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Postal Code</label>
                        <input
                          type="text"
                          value={businessInfo.postalCode}
                          onChange={(e) => setBusinessInfo({...businessInfo, postalCode: e.target.value})}
                          className="w-full px-4 py-2 border rounded-lg"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Primary Phone</label>
                      <input
                        type="tel"
                        value={businessInfo.primaryPhone}
                        onChange={(e) => setBusinessInfo({...businessInfo, primaryPhone: e.target.value})}
                        className="w-full px-4 py-2 border rounded-lg"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Secondary Phone (Optional)</label>
                      <input
                        type="tel"
                        value={businessInfo.secondaryPhone}
                        onChange={(e) => setBusinessInfo({...businessInfo, secondaryPhone: e.target.value})}
                        className="w-full px-4 py-2 border rounded-lg"
                      />
                    </div>

                    <div className="border-t pt-4 mt-6">
                      <h3 className="text-lg font-semibold mb-4">Bank Details</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Bank Name</label>
                          <input
                            type="text"
                            value={businessInfo.bankName}
                            onChange={(e) => setBusinessInfo({...businessInfo, bankName: e.target.value})}
                            className="w-full px-4 py-2 border rounded-lg"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Account Holder</label>
                          <input
                            type="text"
                            value={businessInfo.accountHolder}
                            onChange={(e) => setBusinessInfo({...businessInfo, accountHolder: e.target.value})}
                            className="w-full px-4 py-2 border rounded-lg"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Account Number</label>
                          <input
                            type="text"
                            value={businessInfo.accountNumber}
                            onChange={(e) => setBusinessInfo({...businessInfo, accountNumber: e.target.value})}
                            className="w-full px-4 py-2 border rounded-lg"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Branch Code</label>
                          <input
                            type="text"
                            value={businessInfo.branchCode}
                            onChange={(e) => setBusinessInfo({...businessInfo, branchCode: e.target.value})}
                            className="w-full px-4 py-2 border rounded-lg"
                          />
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

                            <div className="mt-4 p-6 bg-gray-300 rounded-lg border-2 border-dashed border-gray-300">
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
                      className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
                    >
                      Save Business Information
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Customer Modals */}
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

          {/* Invoices List Modal */}
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
                    <div className="text-center py-8 text-gray-500">No saved invoices yet</div>
                  ) : (
                    <div className="space-y-2">
                      {savedInvoices.map((inv) => (
                        <div
                          key={inv.id}
                          onClick={() => loadInvoice(inv)}
                          className="border rounded-lg p-4 hover:bg-gray-300 cursor-pointer transition-colors"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-semibold text-lg">{inv.invoiceNumber || "N/A"}</div>
                              <div className="text-sm text-gray-600 mt-1">Customer: {inv.customer?.name || "N/A"}</div>
                              <div className="text-sm text-gray-600">Property: {inv.property?.type || "N/A"} - {inv.property?.size || ""}m²</div>
                              <div className="text-sm text-gray-600">Frequency: {inv.property?.serviceFrequency || "N/A"}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-semibold text-blue-600">R{inv.totals?.total?.toFixed(2) || "0.00"}</div>
                              <div className="text-sm text-gray-500">
                                {inv.dates?.serviceDate ? new Date(inv.dates.serviceDate).toLocaleDateString("en-ZA") : "N/A"}
                              </div>
                              <div className={`text-xs mt-1 px-2 py-1 rounded ${
                                inv.status === "completed" ? "bg-green-100 text-green-700" :
                                inv.status === "pending" ? "bg-blue-100 text-blue-700" :
                                "bg-gray-100 text-gray-700"
                              }`}>
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

          {/* Quotes List Modal */}
          {showQuotesList && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
                <div className="p-4 border-b flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Saved Quotes</h2>
                  <button
                    onClick={() => setShowQuotesList(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
                <div className="overflow-auto p-4">
                  {savedQuotes.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No saved quotes yet</div>
                  ) : (
                    <div className="space-y-2">
                      {savedQuotes.map((quote) => (
                        <div
                          key={quote.id}
                          onClick={() => loadQuote(quote)}
                          className="border rounded-lg p-4 hover:bg-gray-300 cursor-pointer transition-colors"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-semibold text-lg">{quote.quoteNumber || "N/A"}</div>
                              <div className="text-sm text-gray-600 mt-1">Customer: {quote.customer?.name || "N/A"}</div>
                              <div className="text-sm text-gray-600">Property: {quote.property?.type || "N/A"} - {quote.property?.size || ""}m²</div>
                              <div className="text-sm text-gray-600">Frequency: {quote.property?.serviceFrequency || "N/A"}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-semibold text-purple-600">R{quote.totals?.total?.toFixed(2) || "0.00"}</div>
                              <div className="text-sm text-gray-500">
                                {quote.dates?.quoteDate ? new Date(quote.dates.quoteDate).toLocaleDateString("en-ZA") : "N/A"}
                              </div>
                              <div className={`text-xs mt-1 px-2 py-1 rounded ${
                                quote.status === "converted" ? "bg-green-100 text-green-700" :
                                quote.status === "pending" ? "bg-purple-100 text-purple-700" :
                                "bg-gray-100 text-gray-700"
                              }`}>
                                {quote.status || "unknown"}
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

          {/* Mobile Invoice Toggle Button */}
          <button
            onClick={() => setShowInvoice(!showInvoice)}
            className="lg:hidden w-full mb-4 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FileText className="w-5 h-5" />
            {showInvoice ? `Hide ${isQuoteMode ? 'Quote' : 'Invoice'}` : `View ${isQuoteMode ? 'Quote' : 'Invoice'}`}
          </button>

          {/* Templates View */}
          {activeView === "templates" && <Templates user={user} />}
                  
          {/* Financial Overview */}
          {activeView === "financial-overview" && <FinancialOverview user={user} />}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {activeView === "invoice" && (
              <>
                {/* Left Panel - Form */}
                <div className={`${showInvoice ? "hidden" : "block"} space-y-6 lg:block print:hidden max-h-[calc(100vh-120px)] overflow-y-auto`}>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-blue-700 font-medium">{isQuoteMode ? 'Quote' : 'Scheduled'}</span>
                    <span className="text-blue-600">
                      {isQuoteMode ? 'Valid Until: ' : 'Service Date: '}
                      {new Date(isQuoteMode ? Date.now() + 30 * 24 * 60 * 60 * 1000 : Date.now()).toLocaleDateString("en-ZA")}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="text-sm text-gray-500 mb-1">Total Amount</div>
                      <div className="text-2xl font-semibold text-blue-600">R{total.toFixed(2)}</div>
                    </div>
                    {!isQuoteMode && (
                      <>
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                          <div className="text-sm text-gray-500 mb-1">Paid</div>
                          <div className="text-2xl font-semibold text-green-600">R0.00</div>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                          <div className="text-sm text-gray-500 mb-1">Balance Due</div>
                          <div className="text-2xl font-semibold text-red-600">R{total.toFixed(2)}</div>
                        </div>
                      </>
                    )}
                    {isQuoteMode && (
                      <div className="bg-white p-4 rounded-lg border border-gray-200 col-span-2">
                        <div className="text-sm text-gray-500 mb-1">Quote Status</div>
                        <div className="text-lg font-semibold text-purple-600">Pending</div>
                      </div>
                    )}
                  </div>

                  {/* Customer Information */}
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
                        <input
                          type="text"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
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
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          className="w-full px-4 py-2 border rounded"
                        />
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Phone</div>
                        <input
                          type="text"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          className="w-full px-4 py-2 border rounded"
                        />
                      </div>
                      <div className="col-span-1 sm:col-span-2">
                        <div className="text-sm text-gray-500">Address</div>
                        <input
                          type="text"
                          value={customerAddress}
                          onChange={(e) => setCustomerAddress(e.target.value)}
                          className="w-full px-4 py-2 border rounded"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Property Information */}
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
                        <select
                          value={propertyType}
                          onChange={(e) => setPropertyType(e.target.value)}
                          className="w-full px-4 py-2 border rounded"
                        >
                          <option>Residential</option>
                          <option>Commercial</option>
                          <option>Office</option>
                        </select>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Size (m²)</div>
                        <input
                          type="text"
                          value={propertySize}
                          onChange={(e) => setPropertySize(e.target.value)}
                          className="w-full px-4 py-2 border rounded"
                        />
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Rooms</div>
                        <input
                          type="text"
                          value={propertyRooms}
                          onChange={(e) => setPropertyRooms(e.target.value)}
                          className="w-full px-4 py-2 border rounded"
                        />
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Bathrooms</div>
                        <input
                          type="text"
                          value={propertyBathrooms}
                          onChange={(e) => setPropertyBathrooms(e.target.value)}
                          className="w-full px-4 py-2 border rounded"
                        />
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Floors</div>
                        <input
                          type="text"
                          value={propertyFloors}
                          onChange={(e) => setPropertyFloors(e.target.value)}
                          className="w-full px-4 py-2 border rounded"
                        />
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Service Frequency</div>
                        <select
                          value={serviceFrequency}
                          onChange={(e) => setServiceFrequency(e.target.value)}
                          className="w-full px-4 py-2 border rounded"
                        >
                          <option>One-Time</option>
                          <option>Weekly</option>
                          <option>Bi-Weekly</option>
                          <option>Monthly</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Add Service/Item */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                    <h2 className="text-lg font-semibold mb-4">Add Service/Item</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                      <select
                        value={newItem.type}
                        onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
                        className="px-4 py-2 border rounded"
                      >
                        <option value="Service">Service</option>
                        <option value="Supplies">Supplies</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Description"
                        value={newItem.description}
                        onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                        className="px-4 py-2 border rounded"
                      />
                      <input
                        type="number"
                        placeholder="Rate"
                        value={newItem.rate}
                        onChange={(e) => setNewItem({ ...newItem, rate: e.target.value })}
                        className="px-4 py-2 border rounded"
                      />
                      <input
                        type="number"
                        placeholder="Qty"
                        value={newItem.qty}
                        onChange={(e) => setNewItem({ ...newItem, qty: e.target.value })}
                        className="px-4 py-2 border rounded"
                      />
                      <button
                        onClick={handleAddItem}
                        className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Payment Terms */}
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
                        <span className="font-medium">{isQuoteMode ? 'Quote Valid 30 Days' : 'Due on Completion'}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600">Service Guarantee:</span>
                        <span className="font-medium">7 Day Satisfaction Guarantee</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Panel - Invoice/Quote Preview */}
                <div
                  className={`${!showInvoice ? "hidden" : "block"} lg:block mx-auto bg-white shadow-lg overflow-hidden`}
                  style={{width: "100%", maxWidth: "210mm", minHeight: "297mm"}}
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
                    jobCardNumber={invoiceNumber}
                    customerName={customerName}
                    customerEmail={customerEmail}
                    customerPhone={customerPhone}
                    customerAddress={customerAddress}
                    propertyType={propertyType}
                    propertySize={propertySize}
                    propertyRooms={propertyRooms}
                    propertyBathrooms={propertyBathrooms}
                    propertyFloors={propertyFloors}
                    serviceFrequency={serviceFrequency}
                    items={items}
                    subtotal={subtotal}
                    vat={vat}
                    total={total}
                  />
                </div>

                {/* Print Styles */}
                <style>{`
                  .logo img {
                    height: 60px;
                    width: auto;
                  }
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
                    nav, [class*="sidebar"], [class*="bg-gray-800"], button:not([style]) {
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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CleaningDashboard;
