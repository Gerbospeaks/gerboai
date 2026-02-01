import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { serverTimestamp } from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth";
import logo from "../../assets/img/solidflo-logo.png";
import Templates from "./Templates";
import AIInvoiceExtractor from "../AIInvoiceExtractor";
import TemplateSelector, { TemplateRenderer } from "./TemplateSelector";
import  uploadLogoToR2 from "../../utils/uploadLogoToR2";
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
  ChevronRight,
  Home,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Clock,
  Settings,
  Users,
  X,
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
import SignatureStamp from "../SignatureStamp";
import MultiStepForm from "./MultiStepForm";

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
  const [inputMode, setInputMode] = useState("manual");
  const [documentType, setDocumentType] = useState("invoice");
  const [useAI, setUseAI] = useState(false);
  const [activeTab, setActiveTab] = useState("Invoice");
  const [showInvoice, setShowInvoice] = useState(false);
  const {user, authUser} = useAuth();
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
  const [paymentMethod, setPaymentMethod] = useState("Cash/Card/EFT");
  const [paymentTerms, setPaymentTerms] = useState("Due on Completion");
  const [serviceGuarantee, setServiceGuarantee] = useState("7 Day Satisfaction Guarantee");
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
  const [selectedTemplate, setSelectedTemplate] = useState("professional");
  const [customerAddress, setCustomerAddress] = useState(
    "456 Oak Avenue, Pretoria, 0002",
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
    enabled: false,
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
        orderBy("createdAt", "desc"),
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
    if (extractedData.customer.customerId)
      setCustomerId(extractedData.customer.customerId);

    // Property info (specific to CleaningDashboard)
    if (extractedData.property) {
      if (extractedData.property.type)
        setPropertyType(extractedData.property.type);
      if (extractedData.property.size)
        setPropertySize(extractedData.property.size);
      if (extractedData.property.rooms)
        setPropertyRooms(extractedData.property.rooms);
      if (extractedData.property.bathrooms)
        setPropertyBathrooms(extractedData.property.bathrooms);
      if (extractedData.property.floors)
        setPropertyFloors(extractedData.property.floors);
      if (extractedData.property.serviceFrequency)
        setServiceFrequency(extractedData.property.serviceFrequency);
    }

    // Items
    if (extractedData.items && extractedData.items.length > 0) {
      setItems(extractedData.items);
    }

    alert("✅ Data extracted and populated successfully!");
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
     setBusinessInfo(prev => ({ ...prev, uploading: true }));
 
     // ✅ Upload to Cloudflare R2 (Worker handles userId)
     const logoUrl = await uploadLogoToR2(file, authUser);
 
     setBusinessInfo(prev => ({
       ...prev,
       logoUrl,
       uploading: false,
     }));
 
     // Save URL to Firestore
     const db = getFirestore();
     const docRef = doc(db, "users", user.uid, "settings", "businessInfo");
 
     await setDoc(docRef, {
   logoUrl,
   updatedAt: new Date().toISOString(),
 }, { merge: true });
 
     alert("Logo uploaded successfully!");
   } catch (error) {
     console.error("Error uploading logo:", error);
     alert("Failed to upload logo: " + error.message);
     setBusinessInfo(prev => ({ ...prev, uploading: false }));
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
          validUntil: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000,
          ).toISOString(),
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
          quoteData,
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
          invoiceData,
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

    if (
      !window.confirm(
        "Are you sure you want to convert this quote to an invoice?",
      )
    ) {
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
        invoiceData,
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
const handleSavePDFAlternative = async () => {
  const element = document.getElementById('print-area');
  
  if (!element) {
    alert('Invoice preview not found');
    return;
  }

  try {
    // Dynamic imports
    const html2canvas = (await import('html2canvas')).default;
    const { jsPDF } = await import('jspdf');
    
    // Capture the element as canvas
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });
    
    // Convert to PDF
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    pdf.save(`${isQuoteMode ? 'Quote' : 'Invoice'}_${invoiceNumber || 'draft'}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Failed to generate PDF. Please try again.');
  }
};
 const handlePrint = () => {
  // Add print styles to document
  const styleSheet = document.createElement("style");
  styleSheet.textContent = printStyles;
  document.head.appendChild(styleSheet);
  
  // Trigger print
  window.print();
  
  // Clean up (remove after print dialog closes)
  setTimeout(() => {
    document.head.removeChild(styleSheet);
  }, 1000);
};
const printStyles = `
  @media print {
    /* Hide everything except the print area */
    body * {
      visibility: hidden !important;
    }
    
    #print-area,
    #print-area * {
      visibility: visible !important;
    }
    
    /* Reset page margins and size */
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
    
    /* Position print area to fill the page */
    #print-area {
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
    }
    
    /* Ensure colors print correctly */
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    
    /* Remove any borders or shadows */
    .shadow-lg, .rounded-lg {
      border: none !important;
      box-shadow: none !important;
    }
    
    /* Prevent page breaks inside elements */
    table, tr, td, th, div {
      page-break-inside: avoid !important;
    }
  }
`;
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
      const snap = await getDoc(
        doc(db, "users", user.uid, "quotations", quoteId),
      );
      return snap.exists() ? snap.data() : null;
    } else if (invoiceId) {
      const snap = await getDoc(
        doc(db, "users", user.uid, "invoices", invoiceId),
      );
      return snap.exists() ? snap.data() : null;
    }
    return null;
  };

  const handleSavePDF = async () => {
    const savedDoc = await loadInvoiceForExport();
    if (!savedDoc) {
      alert(
        `Please save the ${isQuoteMode ? "quote" : "invoice"} before exporting PDF`,
      );
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
          <div className="w-10 h-10 mb-2 relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
            <img
              src={logo}
              alt="Logo"
              className="relative w-full h-full object-contain rounded-2xl shadow-lg"
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
              className="p-2 text-slate-400 hover:text-white hover:bg-blue-600/80 rounded-lg transition-all duration-200 w-10 h-10 flex items-center justify-center group"
              title="Invoices"
            >
              <ClipboardList className="w-5 h-5" />
            </button>

            <button
              className="p-2 text-slate-400 hover:text-white hover:bg-blue-600/80 rounded-lg transition-all duration-200 w-10 h-10 flex items-center justify-center group"
              title="Quotes"
            >
              <Receipt className="w-5 h-5" />
            </button>

            <button
              className="p-2 text-slate-400 hover:text-white hover:bg-blue-600/80 rounded-lg transition-all duration-200 w-10 h-10 flex items-center justify-center group"
              title="Customers"
            >
              <Users className="w-5 h-5" />
            </button>

            <button
              className="p-2 text-slate-400 hover:text-white hover:bg-blue-600/80 rounded-lg transition-all duration-200 w-10 h-10 flex items-center justify-center group"
              title="Properties"
            >
              <Building className="w-5 h-5" />
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
              title="Supplies"
            >
              <Package className="w-5 h-5" />
            </button>

            <button
              className="p-2 text-slate-400 hover:text-white hover:bg-blue-600/80 rounded-lg transition-all duration-200 w-10 h-10 flex items-center justify-center group"
              title="Analytics"
            >
              <BarChart3 className="w-5 h-5" />
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
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <img
                src={logo}
                alt="Business Logo"
                className="relative w-20 h-16 object-contain rounded-2xl  shadow-lg"
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

              {/* Invoices Section */}
              <div className="mt-2">
                <div className="flex items-center justify-between px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200">
                  <div className="flex items-center space-x-3">
                    <ClipboardList className="w-5 h-5" />
                    <span className="text-sm font-medium">Invoices</span>
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </div>

                <div className="ml-4 mt-1 space-y-1 border-l-2 border-slate-700/50 pl-4">
                  <div
                    onClick={handleNewInvoice}
                    className="px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700/30 rounded-lg cursor-pointer transition-all duration-200"
                  >
                    Create Invoice
                  </div>
                  <div
                    onClick={() => setShowInvoicesList(!showInvoicesList)}
                    className="px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700/30 rounded-lg cursor-pointer transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <span>All Invoices</span>
                      <span className="text-blue-300 px-2 py-0.5 rounded-full text-xs font-semibold">
                        {savedInvoices.length}
                      </span>
                    </div>
                  </div>
                  <div className="px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700/30 rounded-lg cursor-pointer transition-all duration-200">
                    Scheduled
                  </div>
                </div>
              </div>

              {/* Quotes Section */}
              <div className="mt-2">
                <div className="flex items-center justify-between px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200">
                  <div className="flex items-center space-x-3">
                    <Receipt className="w-5 h-5" />
                    <span className="text-sm font-medium">Quotes</span>
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </div>

                <div className="ml-4 mt-1 space-y-1 border-l-2 border-slate-700/50 pl-4">
                  <div
                    onClick={handleNewQuote}
                    className="px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700/30 rounded-lg cursor-pointer transition-all duration-200"
                  >
                    Create Quote
                  </div>
                  <div
                    onClick={() => setShowQuotesList(!showQuotesList)}
                    className="px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700/30 rounded-lg cursor-pointer transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <span>All Quotes</span>
                      <span className=" text-blue-300 px-2 py-0.5 rounded-full text-xs font-semibold">
                        {savedQuotes.length}
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

              <div className="flex items-center space-x-3 px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200 mt-2">
                <Building className="w-5 h-5" />
                <span className="text-sm font-medium">Properties</span>
              </div>

              <div
                onClick={() => setActiveView("templates")}
                className="flex items-center space-x-3 px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200"
              >
                <FileText className="w-5 h-5" />
                <span className="text-sm font-medium">Invoice Templates</span>
              </div>

              <div className="flex items-center space-x-3 px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200">
                <Package className="w-5 h-5" />
                <span className="text-sm font-medium">Supplies</span>
              </div>

              <div className="flex items-center justify-between px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200">
                <div className="flex items-center space-x-3">
                  <BarChart3 className="w-5 h-5" />
                  <span className="text-sm font-medium">Analytics</span>
                </div>
                <ChevronDown className="w-4 h-4" />
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

      <div
        className={`flex-1 transition-all duration-300 ml-16 lg:ml-64`}
      >
        <div className="flex-1 overflow-auto">
          <div className="sticky top-0 z-40 flex flex-col">
            <div className="bg-gray-300 backdrop-blur-xl border-b border-gray-200/50 px-4 lg:px-8 py-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-2.5 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-105 lg:hidden"
                  >
                    <Menu className="w-5 h-5" />
                  </button>

                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full animate-pulse ${
                        isQuoteMode ? "bg-purple-500" : "bg-blue-500"
                      }`}
                    ></div>
                    <h1 className="text-lg lg:text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                      {isQuoteMode ? "Quote" : "Invoice"} #
                      {invoiceNumber || "— not saved yet —"}
                    </h1>
                  </div>
                </div>

                {/* Enhanced Action Buttons */}
                <div className="hidden lg:flex items-center gap-2">
                  {showConvertButton && (
                    <button
                      onClick={handleConvertToInvoice}
                      className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 font-medium"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Convert to Invoice
                    </button>
                  )}
                  <button className="flex items-center gap-2 px-4 py-2.5 border-2 border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 hover:scale-105 font-medium">
                    <CheckSquare className="w-4 h-4" />
                    <span>Complete</span>
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2.5 border-2 border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 hover:scale-105 font-medium">
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={handleSaveInvoice}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 font-medium"
                  >
                    Save {isQuoteMode ? "Quote" : "Invoice"}
                  </button>
                  <button
                    onClick={isQuoteMode ? handleNewQuote : handleNewInvoice}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    New
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 font-medium">
                    <Send className="w-4 h-4" />
                    <span>Send</span>
                  </button>
                  <button
                    onClick={handleSavePDFAlternative}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 font-medium"
                  >
                    <Download className="w-4 h-4" />
                    PDF
                  </button>
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-xl hover:from-slate-700 hover:to-slate-800 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 font-medium"
                  >
                    <Printer className="w-4 h-4" />
                    Print
                  </button>
                </div>

                <button
                  onClick={handleLogout}
                  className="lg:hidden p-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 print:hidden">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {showConvertButton && (
                  <button
                    onClick={handleConvertToInvoice}
                    className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-gray-800 rounded-lg hover:bg-purple-700 whitespace-nowrap text-sm"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>To Invoice</span>
                  </button>
                )}
                <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-800 whitespace-nowrap text-sm">
                  <CheckSquare className="w-4 h-4" />
                  <span>Complete</span>
                </button>
                <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-800 whitespace-nowrap text-sm">
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button className="flex items-center gap-2 px-3 py-2 bg-gray-50 text-gray-800 rounded-lg hover:bg-blue-700 whitespace-nowrap text-sm">
                  <Send className="w-4 h-4" />
                  <span>Send</span>
                </button>
                <button
                  onClick={handleSavePDF}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-50 text-gray-800 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap text-sm"
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
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Primary Phone
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
                        className="w-full bg-gray-50 text-gray-800 py-3 rounded-lg hover:bg-blue-700"
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
                <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                  <div className="p-4 border-b flex items-center justify-between bg-gray-50">
                    <h2 className="text-xl font-semibold text-gray-800">
                      Saved Invoices
                    </h2>
                    <button
                      onClick={() => setShowInvoicesList(false)}
                      className="text-gray-500 hover:text-gray-700 text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="overflow-auto flex-1 p-4">
                    {savedInvoices.length === 0 ? (
                      <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                          <p className="text-gray-500 text-lg">
                            No saved invoices yet
                          </p>
                          <p className="text-gray-400 text-sm mt-2">
                            Create your first invoice to get started
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse bg-white min-w-[800px]">
                          <thead>
                            <tr className="bg-gray-800 text-white">
                              <th className="text-left py-3 px-4 font-semibold text-sm">
                                Invoice #
                              </th>
                              <th className="text-left py-3 px-4 font-semibold text-sm">
                                Customer
                              </th>
                              <th className="text-left py-3 px-4 font-semibold text-sm">
                                Property
                              </th>
                              <th className="text-left py-3 px-4 font-semibold text-sm">
                                Service Date
                              </th>
                              <th className="text-left py-3 px-4 font-semibold text-sm">
                                Frequency
                              </th>
                              <th className="text-right py-3 px-4 font-semibold text-sm">
                                Amount
                              </th>
                              <th className="text-center py-3 px-4 font-semibold text-sm">
                                Status
                              </th>
                              <th className="text-center py-3 px-4 font-semibold text-sm">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {savedInvoices.map((inv, index) => (
                              <tr
                                key={inv.id}
                                className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                                }`}
                              >
                                <td className="py-3 px-4">
                                  <span className="font-semibold text-gray-900">
                                    {inv.invoiceNumber || "N/A"}
                                  </span>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex flex-col">
                                    <span className="text-sm font-medium text-gray-900">
                                      {inv.customer?.name || "N/A"}
                                    </span>
                                    {inv.customer?.email && (
                                      <span className="text-xs text-gray-500 mt-0.5">
                                        {inv.customer.email}
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex flex-col">
                                    <span className="text-sm text-gray-900">
                                      {inv.property?.type || "N/A"}
                                    </span>
                                    {inv.property?.size && (
                                      <span className="text-xs text-gray-500 mt-0.5">
                                        {inv.property.size}m²
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-700">
                                  {inv.dates?.serviceDate
                                    ? new Date(
                                        inv.dates.serviceDate,
                                      ).toLocaleDateString("en-ZA")
                                    : "N/A"}
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-700">
                                  {inv.property?.serviceFrequency || "N/A"}
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <span className="font-bold text-blue-600 text-base">
                                    R{inv.totals?.total?.toFixed(2) || "0.00"}
                                  </span>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex justify-center">
                                    <span
                                      className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${
                                        inv.status === "completed"
                                          ? "bg-green-500"
                                          : inv.status === "paid"
                                            ? "bg-green-500"
                                            : inv.status === "sent"
                                              ? "bg-blue-500"
                                              : inv.status === "pending"
                                                ? "bg-blue-500"
                                                : inv.status === "overdue"
                                                  ? "bg-red-500"
                                                  : inv.status === "draft"
                                                    ? "bg-gray-500"
                                                    : "bg-gray-500"
                                      }`}
                                    >
                                      {inv.status || "unknown"}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex justify-center gap-2">
                                    <button
                                      onClick={() => loadInvoice(inv)}
                                      className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors text-sm font-medium"
                                    >
                                      Load
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        // Add view/preview functionality here
                                        console.log("View invoice:", inv);
                                      }}
                                      className="px-3 py-1.5 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors text-sm font-medium"
                                    >
                                      View
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Quotes List Modal */}
            {showQuotesList && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                  <div className="p-4 border-b flex items-center justify-between bg-gray-50">
                    <h2 className="text-xl font-semibold text-gray-800">
                      Saved Quotes
                    </h2>
                    <button
                      onClick={() => setShowQuotesList(false)}
                      className="text-gray-500 hover:text-gray-700 text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="overflow-auto flex-1 p-4">
                    {savedQuotes.length === 0 ? (
                      <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                          <p className="text-gray-500 text-lg">
                            No saved quotes yet
                          </p>
                          <p className="text-gray-400 text-sm mt-2">
                            Create your first quote to get started
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse bg-white min-w-[800px]">
                          <thead>
                            <tr className="bg-gray-800 text-white">
                              <th className="text-left py-3 px-4 font-semibold text-sm">
                                Quote #
                              </th>
                              <th className="text-left py-3 px-4 font-semibold text-sm">
                                Customer
                              </th>
                              <th className="text-left py-3 px-4 font-semibold text-sm">
                                Property
                              </th>
                              <th className="text-left py-3 px-4 font-semibold text-sm">
                                Quote Date
                              </th>
                              <th className="text-left py-3 px-4 font-semibold text-sm">
                                Frequency
                              </th>
                              <th className="text-right py-3 px-4 font-semibold text-sm">
                                Amount
                              </th>
                              <th className="text-center py-3 px-4 font-semibold text-sm">
                                Status
                              </th>
                              <th className="text-center py-3 px-4 font-semibold text-sm">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {savedQuotes.map((quote, index) => (
                              <tr
                                key={quote.id}
                                className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                                }`}
                              >
                                <td className="py-3 px-4">
                                  <span className="font-semibold text-gray-900">
                                    {quote.quoteNumber || "N/A"}
                                  </span>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex flex-col">
                                    <span className="text-sm font-medium text-gray-900">
                                      {quote.customer?.name || "N/A"}
                                    </span>
                                    {quote.customer?.email && (
                                      <span className="text-xs text-gray-500 mt-0.5">
                                        {quote.customer.email}
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex flex-col">
                                    <span className="text-sm text-gray-900">
                                      {quote.property?.type || "N/A"}
                                    </span>
                                    {quote.property?.size && (
                                      <span className="text-xs text-gray-500 mt-0.5">
                                        {quote.property.size}m²
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-700">
                                  {quote.dates?.quoteDate
                                    ? new Date(
                                        quote.dates.quoteDate,
                                      ).toLocaleDateString("en-ZA")
                                    : "N/A"}
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-700">
                                  {quote.property?.serviceFrequency || "N/A"}
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <span className="font-bold text-purple-600 text-base">
                                    R{quote.totals?.total?.toFixed(2) || "0.00"}
                                  </span>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex justify-center">
                                    <span
                                      className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${
                                        quote.status === "converted"
                                          ? "bg-green-500"
                                          : quote.status === "accepted"
                                            ? "bg-green-500"
                                            : quote.status === "sent"
                                              ? "bg-blue-500"
                                              : quote.status === "pending"
                                                ? "bg-purple-500"
                                                : quote.status === "rejected"
                                                  ? "bg-red-500"
                                                  : quote.status === "expired"
                                                    ? "bg-orange-500"
                                                    : quote.status === "draft"
                                                      ? "bg-gray-500"
                                                      : "bg-gray-500"
                                      }`}
                                    >
                                      {quote.status || "unknown"}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex justify-center gap-2">
                                    <button
                                      onClick={() => loadQuote(quote)}
                                      className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition-colors text-sm font-medium"
                                    >
                                      Load
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        // Add view/preview functionality here
                                        console.log("View quote:", quote);
                                      }}
                                      className="px-3 py-1.5 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors text-sm font-medium"
                                    >
                                      View
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Mobile Invoice Toggle Button */}
           {!showInvoice && (
            <button onClick={() => setShowInvoice(true)} className="lg:hidden w-full mb-4 flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 text-gray-800 rounded-lg hover:bg-blue-700 transition-colors">
              <FileText className="w-5 h-5" />
              View {isQuoteMode ? "Quote" : "Invoice"}
            </button>
          )}

            {/* Templates View */}
            {activeView === "templates" && <Templates user={user} />}

            {/* Financial Overview */}
            {activeView === "financial-overview" && (
              <FinancialOverview user={user} />
            )}

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 ">
              {activeView === "invoice" && (
                <>
                  {/* Left Panel - Form */}
                  <div
                    className={`${showInvoice ? "hidden" : "block"} space-y-6 lg:block print:hidden min-h-[calc(297mm)] overflow-y-auto`}
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
                            Fill out the forms below to create your{" "}
                            {documentType}.
                          </div>
                        )}
                      </div>
                    </div>
                    {inputMode === "manual" && (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="bg-white p-6 rounded-2xl border-2 border-blue-100 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
                            <div className="text-sm text-gray-600 mb-2 font-semibold flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-blue-600" />
                              Total Amount
                            </div>
                            <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                              R{total.toFixed(2)}
                            </div>
                          </div>
                          {!isQuoteMode && (
                            <>
                              <div className="bg-white p-6 rounded-2xl border-2 border-green-100 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
                                <div className="text-sm text-gray-600 mb-2 font-semibold flex items-center gap-2">
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                  Paid
                                </div>
                                <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                  R0.00
                                </div>
                              </div>
                              <div className="bg-white p-6 rounded-2xl border-2 border-red-100 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
                                <div className="text-sm text-gray-600 mb-2 font-semibold flex items-center gap-2">
                                  <AlertCircle className="w-4 h-4 text-red-600" />
                                  Balance Due
                                </div>
                                <div className="text-3xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
                                  R{total.toFixed(2)}
                                </div>
                              </div>
                            </>
                          )}
                          {isQuoteMode && (
                            <div className="bg-white p-6 rounded-2xl border-2 border-purple-100 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 col-span-2">
                              <div className="text-sm text-gray-600 mb-2 font-semibold flex items-center gap-2">
                                <Clock className="w-4 h-4 text-purple-600" />
                                Quote Status
                              </div>
                              <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                Pending
                              </div>
                            </div>
                          )}
                        </div>

                        {inputMode === "manual" && (
                          <MultiStepForm
                            // Customer Info Props
                            customerName={customerName}
                            setCustomerName={setCustomerName}
                            customerId={customerId}
                            setCustomerId={setCustomerId}
                            customerEmail={customerEmail}
                            setCustomerEmail={setCustomerEmail}
                            customerPhone={customerPhone}
                            setCustomerPhone={setCustomerPhone}
                            customerAddress={customerAddress}
                            setCustomerAddress={setCustomerAddress}
                            // Property Info Props
                            propertyType={propertyType}
                            setPropertyType={setPropertyType}
                            propertySize={propertySize}
                            setPropertySize={setPropertySize}
                            propertyRooms={propertyRooms}
                            setPropertyRooms={setPropertyRooms}
                            propertyBathrooms={propertyBathrooms}
                            setPropertyBathrooms={setPropertyBathrooms}
                            propertyFloors={propertyFloors}
                            setPropertyFloors={setPropertyFloors}
                            serviceFrequency={serviceFrequency}
                            setServiceFrequency={setServiceFrequency}
                            // Items Props
                            items={items}
                            newItem={newItem}
                            setNewItem={setNewItem}
                            handleAddItem={handleAddItem}

                            paymentMethod={paymentMethod}
                            setPaymentMethod={setPaymentMethod}
                            paymentTerms={paymentTerms}
                            setPaymentTerms={setPaymentTerms}
                            serviceGuarantee={serviceGuarantee}
                            setServiceGuarantee={setServiceGuarantee}
                            isQuoteMode={isQuoteMode}
                          />
                        )}
                       
                      </>
                    )}
                  </div>

                  {/* Right Panel - Invoice/Quote Preview */}
                  <div
                    id="print-area"
                    className={`${!showInvoice ? "hidden" : "block"} lg:block mx-auto bg-white`}
                    style={{ width: "210mm", minHeight: "297mm" }}
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
                      showStamp={stampSettings.enabled} // Add this
                      stampText={stampSettings.text} // Add this
                      stampColor={stampSettings.color} // Add this
                      showStampDate={stampSettings.showDate} // Add this
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
                    nav, [class*="sidebar"], [class*="bg-gray-50"], button:not([style]) {
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
    </div>
  );
};

export default CleaningDashboard;
