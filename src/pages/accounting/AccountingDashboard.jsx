import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
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
import { Printer, Download, RefreshCw } from "lucide-react";
import { db } from "../../firebase";
import CustomerModal from '../CustomerModal';
import CustomersListModal from '../CustomersListModal';
import FinancialOverview from "../FinancialOverview";
import Templates from "./Templates";
import TemplateSelector, { TemplateRenderer } from './TemplateSelector';
import {
  ChevronDown,
  ChevronLeft,
  Home,
  Settings,
  Users,
  Calendar,
  FileText,
  Calculator,
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
  DollarSign,
  Briefcase,
  Upload,
  BookOpen,
} from "lucide-react";
import SignatureStamp from '../SignatureStamp';

// Generate Quote Number
const generateQuoteNumber = async (userId) => {
  const db = getFirestore();
  const year = new Date().getFullYear();

  const quotesRef = collection(db, "users", userId, "quotations");
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
  return `QTE-${year}-${String(nextNumber).padStart(4, "0")}`;
};

// Generate Invoice Number
const generateInvoiceNumber = async (userId) => {
  const db = getFirestore();
  const year = new Date().getFullYear();

  const invoicesRef = collection(db, "users", userId, "invoices");
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
  return `INV-${year}-${String(nextNumber).padStart(4, "0")}`;
};

const AccountingDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Invoice");
  const [showInvoice, setShowInvoice] = useState(false);
  const { user } = useAuth();
  const [documentNumber, setDocumentNumber] = useState("");
  const [documentId, setDocumentId] = useState(null);
  const [savedInvoices, setSavedInvoices] = useState([]);
  const [savedQuotes, setSavedQuotes] = useState([]);
  const [showInvoicesList, setShowInvoicesList] = useState(false);
  const [showQuotesList, setShowQuotesList] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [savedCustomers, setSavedCustomers] = useState([]);
  const [showCustomersListModal, setShowCustomersListModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [activeTemplate, setActiveTemplate] = useState("classic");
  const [activeView, setActiveView] = useState('invoice');
  const [selectedTemplate, setSelectedTemplate] = useState('contemporary');
  const [documentType, setDocumentType] = useState('invoice'); // 'invoice' or 'quote'
  const [showConvertButton, setShowConvertButton] = useState(false);
  const [stampSettings, setStampSettings] = useState({
    text: "APPROVED",
    color: "#d32f2f",
    showDate: true,
    enabled: true
  });

  useEffect(() => {
    if (!user?.uid) return;

    const loadDocumentNumber = async () => {
      if (documentType === 'quote') {
        const nextQuote = await generateQuoteNumber(user.uid);
        setDocumentNumber(nextQuote);
      } else {
        const nextInvoice = await generateInvoiceNumber(user.uid);
        setDocumentNumber(nextInvoice);
      }
    };

    loadDocumentNumber();
    loadSavedInvoices();
    loadSavedQuotes();
  }, [user, documentType]);

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

  const loadSavedInvoices = async () => {
    if (!user?.uid) return;

    const db = getFirestore();
    const invoicesRef = collection(db, "users", user.uid, "invoices");
    const q = query(invoicesRef, orderBy("createdAt", "desc"), limit(50));
    const snapshot = await getDocs(q);

    const invoices = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setSavedInvoices(invoices);
  };

  const loadSavedQuotes = async () => {
    if (!user?.uid) return;

    const db = getFirestore();
    const quotesRef = collection(db, "users", user.uid, "quotations");
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
    setCustomerAddress(customer.address || "");
    setCustomerId(customer.customerId || "");
  };

  const handleCustomerSaved = () => {
    loadCustomers();
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadInvoice = (invoice) => {
    setDocumentType('invoice');
    setDocumentId(invoice.id);
    setDocumentNumber(invoice.invoiceNumber || "");
    setCustomerName(invoice.customer?.name || "");
    setCustomerEmail(invoice.customer?.email || "");
    setCustomerPhone(invoice.customer?.phone || "");
    setCustomerAddress(invoice.customer?.address || "");
    setCustomerId(invoice.customer?.customerId || "");
    setInvoiceDate(invoice.dates?.invoiceDate || new Date().toISOString().split('T')[0]);
    setDueDate(invoice.dates?.dueDate || "");
    setPaymentTerms(invoice.payment?.terms || "Net 30");
    setItems(invoice.items || []);
    setShowInvoicesList(false);
    setShowConvertButton(false);
    setActiveView('invoice');
  };

  const loadQuote = (quote) => {
    setDocumentType('quote');
    setDocumentId(quote.id);
    setDocumentNumber(quote.quoteNumber || "");
    setCustomerName(quote.customer?.name || "");
    setCustomerEmail(quote.customer?.email || "");
    setCustomerPhone(quote.customer?.phone || "");
    setCustomerAddress(quote.customer?.address || "");
    setCustomerId(quote.customer?.customerId || "");
    setInvoiceDate(quote.dates?.quoteDate || new Date().toISOString().split('T')[0]);
    setDueDate(quote.dates?.validUntil || "");
    setPaymentTerms(quote.payment?.terms || "Net 30");
    setItems(quote.items || []);
    setShowQuotesList(false);
    setShowConvertButton(true);
    setActiveView('invoice');
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

  const loadDocumentForExport = async () => {
    if (!user?.uid || !documentId) return null;

    const db = getFirestore();
    const collectionName = documentType === 'quote' ? 'quotations' : 'invoices';
    const snap = await getDoc(
      doc(db, "users", user.uid, collectionName, documentId)
    );

    return snap.exists() ? snap.data() : null;
  };

  const handleSavePDF = async () => {
    const savedDocument = await loadDocumentForExport();

    if (!savedDocument) {
      alert(`Please save the ${documentType} before exporting PDF`);
      return;
    }

    if (documentType === 'quote') {
      setDocumentNumber(savedDocument.quoteNumber);
      setInvoiceDate(savedDocument.dates.quoteDate);
      setDueDate(savedDocument.dates.validUntil);
    } else {
      setDocumentNumber(savedDocument.invoiceNumber);
      setInvoiceDate(savedDocument.dates.invoiceDate);
      setDueDate(savedDocument.dates.dueDate);
    }
    
    setItems(savedDocument.items);
    setCustomerName(savedDocument.customer.name);
    setCustomerEmail(savedDocument.customer.email);
    setCustomerPhone(savedDocument.customer.phone);
    setCustomerAddress(savedDocument.customer.address);
    setPaymentTerms(savedDocument.payment.terms);

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
      type: newItem.type || "Service",
      rate,
      qty,
      amount: rate * qty,
    };

    setItems((prev) => [...prev, item]);
    setNewItem({ description: "", rate: "", qty: "", type: "Service" });
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

  const [customerName, setCustomerName] = useState("Acme Corporation");
  const [customerId, setCustomerId] = useState("CUST-2026-5678");
  const [customerEmail, setCustomerEmail] = useState("accounts@acmecorp.com");
  const [customerPhone, setCustomerPhone] = useState("011 234 5678");
  const [customerAddress, setCustomerAddress] = useState(
    "456 Business Park, Sandton, 2196"
  );
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("Net 30");

  const [businessInfo, setBusinessInfo] = useState({
    businessName: "PRECISION ACCOUNTING SERVICES",
    addressLine1: "123 Finance Street",
    addressLine2: "Rosebank",
    city: "Johannesburg",
    postalCode: "2196",
    primaryPhone: "011 789 0123",
    secondaryPhone: "082 456 7890",
    logoUrl: "",
    taxNumber: "VAT-9012345678",
    registrationNumber: "2026/123456/07",
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
    type: "Service",
  });

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const vat = subtotal * 0.15;
  const total = subtotal + vat;

  const buildDocumentPayload = (numberToUse) => {
    const basePayload = {
      locked: true,
      status: "pending",
      customer: {
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
        address: customerAddress,
        customerId,
      },
      payment: {
        terms: paymentTerms,
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

    if (documentType === 'quote') {
      return {
        ...basePayload,
        quoteNumber: numberToUse,
        dates: {
          quoteDate: invoiceDate,
          validUntil: dueDate,
        },
      };
    } else {
      return {
        ...basePayload,
        invoiceNumber: numberToUse,
        dates: {
          invoiceDate: invoiceDate,
          dueDate: dueDate,
        },
      };
    }
  };

  const handleSaveDocument = async () => {
    if (!user?.uid) return;

    const db = getFirestore();
    let numberToUse = documentNumber;

    if (!documentId) {
      if (documentType === 'quote') {
        numberToUse = await generateQuoteNumber(user.uid);
      } else {
        numberToUse = await generateInvoiceNumber(user.uid);
      }
      setDocumentNumber(numberToUse);
    }

    const documentData = buildDocumentPayload(numberToUse);
    const collectionName = documentType === 'quote' ? 'quotations' : 'invoices';

    try {
      if (documentId) {
        await updateDoc(doc(db, "users", user.uid, collectionName, documentId), {
          ...documentData,
          updatedAt: serverTimestamp(),
        });
      } else {
        const ref = await addDoc(
          collection(db, "users", user.uid, collectionName),
          documentData
        );
        setDocumentId(ref.id);
        
        // Show convert button after saving a quote
        if (documentType === 'quote') {
          setShowConvertButton(true);
        }
      }

      alert(`${documentType === 'quote' ? 'Quote' : 'Invoice'} saved successfully`);
      
      if (documentType === 'quote') {
        loadSavedQuotes();
      } else {
        loadSavedInvoices();
      }
    } catch (error) {
      console.error("Error saving document:", error);
      alert("Failed to save document");
    }
  };

  const handleConvertToInvoice = async () => {
    if (!documentId || documentType !== 'quote') {
      alert("Please save the quote first");
      return;
    }

    if (!window.confirm("Convert this quote to an invoice? This will create a new invoice.")) {
      return;
    }

    try {
      const db = getFirestore();
      
      // Generate new invoice number
      const newInvoiceNumber = await generateInvoiceNumber(user.uid);
      
      // Create invoice payload from current quote data
      const invoiceData = {
        invoiceNumber: newInvoiceNumber,
        locked: true,
        status: "pending",
        convertedFromQuote: documentNumber,
        dates: {
          invoiceDate: new Date().toISOString().split('T')[0],
          dueDate: dueDate,
        },
        customer: {
          name: customerName,
          email: customerEmail,
          phone: customerPhone,
          address: customerAddress,
          customerId,
        },
        payment: {
          terms: paymentTerms,
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

      // Save as new invoice
      const invoiceRef = await addDoc(
        collection(db, "users", user.uid, "invoices"),
        invoiceData
      );

      // Update quote status to converted
      await updateDoc(doc(db, "users", user.uid, "quotations", documentId), {
        status: "converted",
        convertedToInvoice: newInvoiceNumber,
        updatedAt: serverTimestamp(),
      });

      alert(`Quote converted to Invoice ${newInvoiceNumber} successfully!`);
      
      // Switch to invoice mode and load the new invoice
      setDocumentType('invoice');
      setDocumentId(invoiceRef.id);
      setDocumentNumber(newInvoiceNumber);
      setInvoiceDate(new Date().toISOString().split('T')[0]);
      setShowConvertButton(false);
      
      loadSavedInvoices();
      loadSavedQuotes();
    } catch (error) {
      console.error("Error converting quote to invoice:", error);
      alert("Failed to convert quote to invoice");
    }
  };

  const handleNewDocument = (type = 'invoice') => {
    setDocumentType(type);
    setActiveView('invoice');
    setDocumentId(null);
    setDocumentNumber("");
    setCustomerName("Acme Corporation");
    setCustomerId("CUST-2026-5678");
    setCustomerEmail("accounts@acmecorp.com");
    setCustomerPhone("011 234 5678");
    setCustomerAddress("456 Business Park, Sandton, 2196");
    setInvoiceDate(new Date().toISOString().split('T')[0]);
    setDueDate("");
    setPaymentTerms("Net 30");
    setItems([]);
    setShowConvertButton(false);

    const loadNewNumber = async () => {
      if (user?.uid) {
        if (type === 'quote') {
          const nextQuote = await generateQuoteNumber(user.uid);
          setDocumentNumber(nextQuote);
        } else {
          const nextInvoice = await generateInvoiceNumber(user.uid);
          setDocumentNumber(nextInvoice);
        }
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

      {/* Sidebar */}
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
              <span>Dashboard</span>
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
                onClick={() => setActiveView('financial-overview')}
                className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                <TrendingUp className="w-5 h-5" />
                <span>Financial Overview</span>
              </div>
              
              {/* Quotes Section */}
              <div className="mt-2">
                <div className="flex items-center justify-between px-3 py-2 text-gray-300 hover:bg-slate-800 rounded-lg cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5" />
                    <span>Quotes</span>
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </div>

                <div className="ml-8 mt-1 space-y-1">
                  <div
                    onClick={() => handleNewDocument('quote')}
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

              {/* Invoices Section */}
              <div className="mt-2">
                <div className="flex items-center justify-between px-3 py-2 text-gray-300 hover:bg-slate-800 rounded-lg cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <Receipt className="w-5 h-5" />
                    <span>Invoices</span>
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </div>

                <div className="ml-8 mt-1 space-y-1">
                  <div
                    onClick={() => handleNewDocument('invoice')}
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
                    Overdue
                  </div>
                </div>
              </div>
 <div className="mt-2">
                <div className="flex items-center justify-between px-3 py-2 text-gray-300 hover:bg-slate-800 rounded-lg cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <Receipt className="w-5 h-5" />
                    <span>Clients</span>
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </div>
               <div className="ml-8 mt-1 space-y-1">
                <div 
                  onClick={handleAddNewCustomer}
                  className="flex items-center space-x-3 px-3 py-2 text-gray-400 hover:bg-slate-800 rounded-lg cursor-pointer mt-2"
                >
                  <span>Add Client</span>
                </div>
                <div
                  onClick={() => setShowCustomersListModal(true)}
                  className="px-3 py-2 text-sm text-gray-400 hover:bg-slate-800 rounded-lg cursor-pointer"
                >
                  All Clients ({savedCustomers.length})
                </div>
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
                <BookOpen className="w-5 h-5" />
                <span>General Ledger</span>
              </div>

              <div className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-slate-800 rounded-lg cursor-pointer">
                <Briefcase className="w-5 h-5" />
                <span>Assets</span>
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

      {/* Main Content */}
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
                {documentType === 'quote' ? 'Quote' : 'Invoice'} #{documentNumber || "— not saved yet —"}
              </h1>
              <TemplateSelector
                user={user}
                selectedTemplate={activeTemplate}
                onTemplateChange={setActiveTemplate}
              />
            </div>

            <div className="hidden lg:flex items-center space-x-3 print:hidden">
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-300">
                <CheckSquare className="w-4 h-4" />
                <span>Mark Paid</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-300">
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </button>
              <button
                onClick={handleSaveDocument}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save {documentType === 'quote' ? 'Quote' : 'Invoice'}
              </button>

              {showConvertButton && documentType === 'quote' && (
                <button
                  onClick={handleConvertToInvoice}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <RefreshCw className="w-4 h-4" />
                  Convert to Invoice
                </button>
              )}

              <button
                onClick={() => handleNewDocument(documentType)}
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
            <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-300 whitespace-nowrap text-sm">
              <CheckSquare className="w-4 h-4" />
              <span>Mark Paid</span>
            </button>
            <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-300 whitespace-nowrap text-sm">
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </button>
            <button
              onClick={handleSaveDocument}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 whitespace-nowrap text-sm"
            >
              Save {documentType === 'quote' ? 'Quote' : 'Invoice'}
            </button>
            {showConvertButton && documentType === 'quote' && (
              <button
                onClick={handleConvertToInvoice}
                className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 whitespace-nowrap text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Convert
              </button>
            )}
            <button className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 whitespace-nowrap text-sm">
              <Send className="w-4 h-4" />
              <span>Send</span>
            </button>
            <button
              onClick={handleSave}
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
            {[documentType === 'quote' ? "Quote" : "Invoice", "Payments", "History", "Notes"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 border-b-2 ${
                  activeTab === tab
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
                        placeholder="Precision Accounting Services"
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
                        placeholder="123 Finance Street"
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
                        placeholder="Rosebank"
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
                          placeholder="Johannesburg"
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
                          placeholder="2196"
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
                        placeholder="011 789 0123"
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
                        placeholder="082 456 7890"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        VAT/Tax Number
                      </label>
                      <input
                        type="text"
                        value={businessInfo.taxNumber}
                        onChange={(e) =>
                          setBusinessInfo({
                            ...businessInfo,
                            taxNumber: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border rounded-lg"
                        placeholder="VAT-9012345678"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
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
                        className="w-full px-4 py-2 border rounded-lg"
                        placeholder="2026/123456/07"
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

          {/* Saved Invoices List Modal */}
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
                    <div className="text-center py-8 text-gray-500">
                      No saved invoices yet
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {savedInvoices.map((invoice) => (
                        <div
                          key={invoice.id}
                          onClick={() => loadInvoice(invoice)}
                          className="border rounded-lg p-4 hover:bg-gray-300 cursor-pointer transition-colors"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-semibold text-lg">
                                {invoice.invoiceNumber || "N/A"}
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                Client: {invoice.customer?.name || "N/A"}
                              </div>
                              <div className="text-sm text-gray-600">
                                Email: {invoice.customer?.email || "N/A"}
                              </div>
                              {invoice.convertedFromQuote && (
                                <div className="text-xs text-blue-600 mt-1">
                                  📝 Converted from {invoice.convertedFromQuote}
                                </div>
                              )}
                            </div>
                            
                            <div className="text-right">
                              <div className="text-lg font-semibold text-blue-600">
                                R{invoice.totals?.total?.toFixed(2) || "0.00"}
                              </div>
                              <div className="text-sm text-gray-500">
                                {invoice.dates?.invoiceDate
                                  ? new Date(
                                      invoice.dates.invoiceDate
                                    ).toLocaleDateString("en-ZA")
                                  : "N/A"}
                              </div>
                              <div
                                className={`text-xs mt-1 px-2 py-1 rounded ${
                                  invoice.status === "paid"
                                    ? "bg-green-100 text-green-700"
                                    : invoice.status === "pending"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {invoice.status || "unknown"}
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

          {/* Saved Quotes List Modal */}
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
                    <div className="text-center py-8 text-gray-500">
                      No saved quotes yet
                    </div>
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
                              <div className="font-semibold text-lg">
                                {quote.quoteNumber || "N/A"}
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                Client: {quote.customer?.name || "N/A"}
                              </div>
                              <div className="text-sm text-gray-600">
                                Email: {quote.customer?.email || "N/A"}
                              </div>
                              {quote.convertedToInvoice && (
                                <div className="text-xs text-green-600 mt-1">
                                  ✅ Converted to {quote.convertedToInvoice}
                                </div>
                              )}
                            </div>
                            
                            <div className="text-right">
                              <div className="text-lg font-semibold text-purple-600">
                                R{quote.totals?.total?.toFixed(2) || "0.00"}
                              </div>
                              <div className="text-sm text-gray-500">
                                {quote.dates?.quoteDate
                                  ? new Date(
                                      quote.dates.quoteDate
                                    ).toLocaleDateString("en-ZA")
                                  : "N/A"}
                              </div>
                              <div
                                className={`text-xs mt-1 px-2 py-1 rounded ${
                                  quote.status === "converted"
                                    ? "bg-green-100 text-green-700"
                                    : quote.status === "pending"
                                    ? "bg-purple-100 text-purple-700"
                                    : quote.status === "accepted"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {quote.status || "pending"}
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
          {activeView === 'financial-overview' && <FinancialOverview user={user} />}
          
          {/* Invoice/Quote Content - Only show when activeView is 'invoice' */}
          {activeView === 'invoice' && (
            <>
              {/* Mobile View Invoice Button */}
              <button
                onClick={() => setShowInvoice(!showInvoice)}
                className="lg:hidden w-full mb-4 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FileText className="w-5 h-5" />
                {showInvoice ? `Hide ${documentType === 'quote' ? 'Quote' : 'Invoice'}` : `View ${documentType === 'quote' ? 'Quote' : 'Invoice'}`}
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div
                  className={`${
                    showInvoice ? "hidden" : "block"
                  } space-y-6 lg:block print:hidden
                  max-h-[calc(100vh-120px)] overflow-y-auto`}
                >
                  <div className={`${
                    documentType === 'quote' ? 'bg-purple-50 border-purple-200' : 'bg-blue-50 border-blue-200'
                  } border rounded-lg px-4 py-3 flex items-center space-x-3`}>
                    <div className={`w-2 h-2 ${documentType === 'quote' ? 'bg-purple-500' : 'bg-blue-500'} rounded-full`}></div>
                    <span className={`${documentType === 'quote' ? 'text-purple-700' : 'text-blue-700'} font-medium`}>
                      {documentType === 'quote' ? 'Quote Pending' : 'Pending Payment'}
                    </span>
                    <span className={`${documentType === 'quote' ? 'text-purple-600' : 'text-blue-600'}`}>
                      {documentType === 'quote' ? `Valid Until: ${dueDate || 'Not set'}` : `Due: ${dueDate || 'Not set'}`}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="text-sm text-gray-500 mb-1">Total Amount</div>
                      <div className={`text-2xl font-semibold ${documentType === 'quote' ? 'text-purple-600' : 'text-blue-600'}`}>
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
                        <span>Client Information</span>
                      </h2>
                      <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700">
                        <Edit className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-500">Client Name</div>
                        <input
                          type="text"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="w-full px-4 py-2 border rounded"
                        />
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Client ID</div>
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

                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold flex items-center space-x-2">
                        <Calendar className="w-5 h-5" />
                        <span>{documentType === 'quote' ? 'Quote' : 'Invoice'} Details</span>
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-500">
                          {documentType === 'quote' ? 'Quote Date' : 'Invoice Date'}
                        </div>
                        <input
                          type="date"
                          value={invoiceDate}
                          onChange={(e) => setInvoiceDate(e.target.value)}
                          className="w-full px-4 py-2 border rounded"
                        />
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">
                          {documentType === 'quote' ? 'Valid Until' : 'Due Date'}
                        </div>
                        <input
                          type="date"
                          value={dueDate}
                          onChange={(e) => setDueDate(e.target.value)}
                          className="w-full px-4 py-2 border rounded"
                        />
                      </div>
                      <div className="col-span-1 sm:col-span-2">
                        <div className="text-sm text-gray-500">Payment Terms</div>
                        <select
                          value={paymentTerms}
                          onChange={(e) => setPaymentTerms(e.target.value)}
                          className="w-full px-4 py-2 border rounded"
                        >
                          <option value="Due on Receipt">Due on Receipt</option>
                          <option value="Net 15">Net 15</option>
                          <option value="Net 30">Net 30</option>
                          <option value="Net 60">Net 60</option>
                          <option value="Net 90">Net 90</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                    <h2 className="text-lg font-semibold mb-4">Add Line Item</h2>

                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                      <select
                        value={newItem.type}
                        onChange={(e) =>
                          setNewItem({ ...newItem, type: e.target.value })
                        }
                        className="px-4 py-2 border rounded"
                      >
                        <option value="Service">Service</option>
                        <option value="Consultation">Consultation</option>
                        <option value="Bookkeeping">Bookkeeping</option>
                        <option value="Tax Preparation">Tax Preparation</option>
                        <option value="Audit">Audit</option>
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
                        className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add
                      </button>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold">Payment Information</h2>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">Payment Method:</span>
                        <span className="font-medium">EFT/Card/Cash</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">Payment Terms:</span>
                        <span className="font-medium">{paymentTerms}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600">Late Fee:</span>
                        <span className="font-medium">2% per month</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className={`${
                    !showInvoice ? "hidden" : "block"
                  } lg:block mx-auto bg-white shadow-lg overflow-hidden`}
                  style={{
                    width: "100%",
                    maxWidth: "210mm",
                    minHeight: "297mm",
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
                    jobCardNumber={documentNumber}
                    customerName={customerName}
                    customerEmail={customerEmail}
                    customerPhone={customerPhone}
                    customerAddress={customerAddress}
                    invoiceDate={invoiceDate || ''}
                    dueDate={dueDate || ''}
                    paymentTerms={paymentTerms || ''}
                    items={items}
                    subtotal={subtotal}
                    vat={vat}
                    total={total}
                    documentType={documentType}
                  />
                </div>
              </div>

              <style>{`
                @media print {
                  * {
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                  }
                  
                  html, body {
                    margin: 0;
                    padding: 0;
                    background: white !important;
                    overflow: hidden !important;
                    width: 210mm;
                    height: 297mm;
                  }
                  
                  @page {
                    size: A4;
                    margin: 0;
                  }
                  
                  .print\\:hidden,
                  nav,
                  button,
                  [class*="sidebar"],
                  [class*="bg-indigo-950"],
                  [class*="border-b"] {
                    display: none !important;
                  }
                  
                  .space-y-6.lg\\:block {
                    display: none !important;
                  }
                  
                  .flex.h-screen.bg-gray-300,
                  .flex-1.overflow-auto {
                    overflow: hidden !important;
                  }
                  
                  .grid.grid-cols-1.lg\\:grid-cols-2 {
                    display: block !important;
                    grid-template-columns: 1fr !important;
                    overflow: hidden !important;
                  }
                  
                  .lg\\:block.mx-auto.bg-white.shadow-lg {
                    display: block !important;
                    box-shadow: none !important;
                    max-width: 210mm !important;
                    width: 210mm !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    overflow: hidden !important;
                  }
                  
                  .bg-white.rounded-lg {
                    page-break-inside: avoid;
                    break-inside: avoid;
                  }
                }
              `}</style>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountingDashboard;