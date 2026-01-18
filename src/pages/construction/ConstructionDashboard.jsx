import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { serverTimestamp } from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth";
import FinancialOverview from "../FinancialOverview";
import Templates from "./Templates";
import TemplateSelector, { TemplateRenderer } from "./TemplateSelector";
import logo from "../../assets/img/solidflo-logo.png";
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
import ClientModal from "./ClientModal";
import ClientsListModal from "../ClientsListModal";
import SignatureStamp from "../SignatureStamp";
import {
  ChevronDown,
  ChevronLeft,
  Home,
  Settings,
  Users,
  Calendar,
  FileText,
  HardHat,
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
  Building2,
  ClipboardList,
  Package,
  Hammer,
  Upload,
  MapPin,
  Ruler,
} from "lucide-react";

const generateQuoteNumber = async (userId) => {
  const db = getFirestore();
  const year = new Date().getFullYear();

  const quotesRef = collection(db, "users", userId, "quotations"); // Changed from "quotes"
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
  return `QT-${year}-${String(nextNumber).padStart(4, "0")}`;
};
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
const ConstructionDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Quote");
  const [showQuote, setShowQuote] = useState(false);
  const { user } = useAuth();
  const [quoteNumber, setQuoteNumber] = useState("");
  const [quoteId, setQuoteId] = useState(null);
  const [savedQuotes, setSavedQuotes] = useState([]);
  const [showQuotesList, setShowQuotesList] = useState(false);
  const [savedInvoices, setSavedInvoices] = useState([]);
  const [showInvoicesList, setShowInvoicesList] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showClientsList, setShowClientsList] = useState(false);
  const [activeView, setActiveView] = useState("invoice");
  const [activeTemplate, setActiveTemplate] = useState("classic");
  const [savedClients, setSavedClients] = useState([]);
  const [showClientsListModal, setShowClientsListModal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [clients, setClients] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("professional");
  const [selectedClient, setSelectedClient] = useState(null);
  const [documentType, setDocumentType] = useState("invoice"); // 'invoice' or 'quote'
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [stampSettings, setStampSettings] = useState({
    text: "APPROVED",
    color: "#d32f2f",
    showDate: true,
    enabled: true,
  });
  useEffect(() => {
    if (!user?.uid) return;

    const loadDocumentNumber = async () => {
      if (documentType === "quote") {
        const nextQuote = await generateQuoteNumber(user.uid);
        setQuoteNumber(nextQuote);
      } else {
        const nextInvoice = await generateInvoiceNumber(user.uid);
        setQuoteNumber(nextInvoice);
      }
    };

    loadDocumentNumber();
    loadSavedQuotes();
    loadSavedInvoices();  
  }, [user, documentType]);

  const loadClients = async () => {
    try {
      const q = query(
        collection(db, "users", user.uid, "clients"),
        orderBy("createdAt", "desc"),
      );
      const querySnapshot = await getDocs(q);
      const clientsData = [];

      querySnapshot.forEach((doc) => {
        clientsData.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      setClients(clientsData);
    } catch (error) {
      console.error("Error loading clients:", error);
    }
  };

  const loadSavedQuotes = async () => {
    if (!user?.uid) return;

    const db = getFirestore();
    const quotesRef = collection(db, "users", user.uid, "quotes");
    const q = query(quotesRef, orderBy("createdAt", "desc"), limit(50));
    const snapshot = await getDocs(q);

    const quotes = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setSavedQuotes(quotes);
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

  const handleAddNewClient = () => {
    setSelectedClient(null);
    setShowClientModal(true);
  };

  const handleEditClient = (client) => {
    setSelectedClient(client);
    setShowClientModal(true);
  };

  const loadClient = (client) => {
    setClientName(client.name || "");
    setClientEmail(client.email || "");
    setClientPhone(client.phone || "");
    setClientAddress(client.address || "");
    setClientId(client.clientId || "");
    setClientCompany(client.company || "");
    setClientType(client.clientType || "Residential");
  };

  const handleClientSaved = () => {
    loadClients();
  };

  useEffect(() => {
    loadClients();
  }, []);

  const loadQuote = (quote) => {
    setQuoteId(quote.id);
    setQuoteNumber(quote.quoteNumber || "");
    setClientName(quote.client?.name || "");
    setClientEmail(quote.client?.email || "");
    setClientPhone(quote.client?.phone || "");
    setClientAddress(quote.client?.address || "");
    setClientId(quote.client?.clientId || "");
    setClientCompany(quote.client?.company || "");
    setClientType(quote.client?.clientType || "Residential");
    setProjectName(quote.project?.name || "");
    setProjectAddress(quote.project?.address || "");
    setProjectType(quote.project?.type || "");
    setProjectSize(quote.project?.size || "");
    setProjectDuration(quote.project?.duration || "");
    setProjectStartDate(quote.project?.startDate || "");
    setItems(quote.items || []);
    setShowQuotesList(false);
  };

  const loadSavedClients = async () => {
    if (!user?.uid) return;

    const db = getFirestore();
    const clientsRef = collection(db, "users", user.uid, "clients");
    const q = query(clientsRef, orderBy("createdAt", "desc"), limit(50));
    const snapshot = await getDocs(q);

    const clients = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setSavedClients(clients.filter((c) => !c._placeholder));
  };

  const handleSaveClient = async () => {
    if (!user?.uid) return;

    if (!clientName || !clientPhone) {
      alert("Please enter client name and phone number");
      return;
    }

    try {
      const db = getFirestore();
      const clientData = {
        name: clientName,
        email: clientEmail,
        phone: clientPhone,
        address: clientAddress,
        clientId: clientId || `CLI-${Date.now()}`,
        company: clientCompany,
        clientType,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(collection(db, "users", user.uid, "clients"), clientData);
      alert("Client saved successfully!");
      loadSavedClients();
    } catch (error) {
      console.error("Error saving client:", error);
      alert("Failed to save client");
    }
  };

  const loadQuoteForExport = async () => {
    if (!user?.uid || !quoteId) return null;

    const db = getFirestore();
    const snap = await getDoc(doc(db, "users", user.uid, "quotes", quoteId));

    return snap.exists() ? snap.data() : null;
  };

  const handleSavePDF = async () => {
    const savedQuote = await loadQuoteForExport();

    if (!savedQuote) {
      alert("Please save the quote before exporting PDF");
      return;
    }

    setQuoteNumber(savedQuote.quoteNumber);
    setItems(savedQuote.items);
    setClientName(savedQuote.client.name);
    setClientEmail(savedQuote.client.email);
    setClientPhone(savedQuote.client.phone);
    setClientAddress(savedQuote.client.address);
    setProjectName(savedQuote.project.name);
    setProjectAddress(savedQuote.project.address);

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

  const [clientName, setClientName] = useState("John Construction Ltd");
  const [clientId, setClientId] = useState("CLI-2026-1234");
  const [clientEmail, setClientEmail] = useState("john@construction.com");
  const [clientPhone, setClientPhone] = useState("082 123 4567");
  const [clientAddress, setClientAddress] = useState(
    "123 Main Street, Pretoria, 0001",
  );
  const [clientCompany, setClientCompany] = useState("John Construction Ltd");
  const [clientType, setClientType] = useState("Commercial");
  const [projectName, setProjectName] = useState("Office Building Renovation");
  const [projectAddress, setProjectAddress] = useState(
    "456 Business Park, Sandton, 2196",
  );
  const [projectType, setProjectType] = useState("Renovation");
  const [projectSize, setProjectSize] = useState("500 sqm");
  const [projectDuration, setProjectDuration] = useState("3 months");
  const [projectStartDate, setProjectStartDate] = useState("2026-02-01");

  const [companyInfo, setCompanyInfo] = useState({
    companyName: "PREMIER CONSTRUCTION SERVICES",
    addressLine1: "9-10 CNR THIRD & INDUSTRIAL AVENUE",
    addressLine2: "BUSINESS PARK",
    city: "JOHANNESBURG",
    postalCode: "2000",
    primaryPhone: "011 234 5678",
    secondaryPhone: "082 345 6789",
    registrationNumber: "CK2023/123456/23",
    vatNumber: "4123456789",
    logoUrl: "",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.uid) {
      loadCompanyInfo();
    }
  }, [user]);

  useEffect(() => {
    const fetchCompanyInfo = async () => {
      if (!user?.uid) return;

      try {
        const db = getFirestore();
        const docRef = doc(db, "users", user.uid, "settings", "companyInfo");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setCompanyInfo(docSnap.data());
        } else {
          console.log("No company info found");
        }
      } catch (error) {
        console.error("Error fetching company info:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyInfo();
  }, [user]);

  const loadCompanyInfo = async () => {
    if (!user?.uid) return;

    try {
      const db = getFirestore();
      const docRef = doc(db, "users", user.uid, "settings", "companyInfo");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setCompanyInfo(docSnap.data());
      }
    } catch (error) {
      console.error("Error loading company info:", error);
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

      setCompanyInfo({ ...companyInfo, logoUrl: downloadURL });
      alert("Logo uploaded successfully!");
    } catch (error) {
      console.error("Error uploading logo:", error);
      alert("Failed to upload logo");
    }
  };

  const handleSaveCompanyInfo = async () => {
    if (!user?.uid) return;

    try {
      const db = getFirestore();
      const docRef = doc(db, "users", user.uid, "settings", "companyInfo");
      await setDoc(docRef, companyInfo);
      alert("Company information saved successfully!");
      setShowSettings(false);
    } catch (error) {
      console.error("Error saving company info:", error);
      alert("Failed to save company information");
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

  const buildQuotePayload = (numberToUse) => ({
    [documentType === "quote" ? "quoteNumber" : "invoiceNumber"]: numberToUse,
    documentType: documentType,
    locked: true,
    status: "pending",

    dates: {
      [documentType === "quote" ? "quoteDate" : "invoiceDate"]:
        new Date().toISOString(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      startDate: projectStartDate,
    },

    client: {
      name: clientName,
      email: clientEmail,
      phone: clientPhone,
      address: clientAddress,
      clientId,
      company: clientCompany,
      clientType,
    },

    project: {
      name: projectName,
      address: projectAddress,
      type: projectType,
      size: projectSize,
      duration: projectDuration,
      startDate: projectStartDate,
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

  const handleSaveQuote = async () => {
    if (!user?.uid) return;

    const db = getFirestore();
    let numberToUse = quoteNumber;
    const collectionName = documentType === "quote" ? "quotations" : "invoices";

    if (!quoteId) {
      if (documentType === "quote") {
        numberToUse = await generateQuoteNumber(user.uid);
      } else {
        numberToUse = await generateInvoiceNumber(user.uid);
      }
      setQuoteNumber(numberToUse);
    }

    const documentData = buildQuotePayload(numberToUse);

    if (quoteId) {
      await updateDoc(doc(db, "users", user.uid, collectionName, quoteId), {
        ...documentData,
        updatedAt: serverTimestamp(),
      });
    } else {
      const ref = await addDoc(
        collection(db, "users", user.uid, collectionName),
        documentData,
      );
      setQuoteId(ref.id);
    }

    alert(`${documentType === "quote" ? "Quote" : "Invoice"} saved and locked`);

    if (documentType === "quote") {
      setShowConvertModal(true);
    }

    loadSavedQuotes();
  };
  const handleConvertToInvoice = async () => {
    if (!user?.uid || !quoteId) return;

    try {
      const db = getFirestore();

      const invoiceNumber = await generateInvoiceNumber(user.uid);

      const quoteRef = doc(db, "users", user.uid, "quotations", quoteId);
      const quoteSnap = await getDoc(quoteRef);

      if (!quoteSnap.exists()) {
        alert("Quote not found");
        return;
      }

      const quoteData = quoteSnap.data();

      const invoiceData = {
        ...quoteData,
        invoiceNumber: invoiceNumber,
        documentType: "invoice",
        convertedFrom: quoteId,
        originalQuoteNumber: quoteData.quoteNumber,
        dates: {
          ...quoteData.dates,
          invoiceDate: new Date().toISOString(),
          convertedDate: new Date().toISOString(),
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      delete invoiceData.quoteNumber;
      delete invoiceData.quoteDate;

      const invoiceRef = await addDoc(
        collection(db, "users", user.uid, "invoices"),
        invoiceData,
      );

      await updateDoc(quoteRef, {
        convertedToInvoice: true,
        invoiceId: invoiceRef.id,
        invoiceNumber: invoiceNumber,
        updatedAt: serverTimestamp(),
      });

      alert(`Quote converted to Invoice ${invoiceNumber} successfully!`);

      setDocumentType("invoice");
      setQuoteId(invoiceRef.id);
      setQuoteNumber(invoiceNumber);
      setShowConvertModal(false);
    } catch (error) {
      console.error("Error converting quote to invoice:", error);
      alert("Failed to convert quote to invoice");
    }
  };

  const handleNewQuote = () => {
    setActiveView("invoice");
    setDocumentType("quote"); // Added this line
    setQuoteId(null);
    setQuoteNumber("");
    setClientName("John Construction Ltd");
    setClientId("CLI-2026-1234");
    setClientEmail("john@construction.com");
    setClientPhone("082 123 4567");
    setClientAddress("123 Main Street, Pretoria, 0001");
    setClientCompany("John Construction Ltd");
    setClientType("Commercial");
    setProjectName("Office Building Renovation");
    setProjectAddress("456 Business Park, Sandton, 2196");
    setProjectType("Renovation");
    setProjectSize("500 sqm");
    setProjectDuration("3 months");
    setProjectStartDate("2026-02-01");
    setItems([]);

    const loadNewNumber = async () => {
      if (user?.uid) {
        const nextQuote = await generateQuoteNumber(user.uid);
        setQuoteNumber(nextQuote);
      }
    };
    loadNewNumber();
  };

  const handleNewInvoice = () => {
    setActiveView("invoice");
    setDocumentType("invoice");
    setQuoteId(null);
    setQuoteNumber("");
    setClientName("John Construction Ltd");
    setClientId("CLI-2026-1234");
    setClientEmail("john@construction.com");
    setClientPhone("082 123 4567");
    setClientAddress("123 Main Street, Pretoria, 0001");
    setClientCompany("John Construction Ltd");
    setClientType("Commercial");
    setProjectName("Office Building Renovation");
    setProjectAddress("456 Business Park, Sandton, 2196");
    setProjectType("Renovation");
    setProjectSize("500 sqm");
    setProjectDuration("3 months");
    setProjectStartDate("2026-02-01");
    setItems([]);

    const loadNewNumber = async () => {
      if (user?.uid) {
        const nextInvoice = await generateInvoiceNumber(user.uid);
        setQuoteNumber(nextInvoice);
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
                onClick={() => setActiveView("financial-overview")}
                className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                <TrendingUp className="w-5 h-5" />
                <span>Business Overview</span>
              </div>

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
                  <div className="px-3 py-2 text-sm text-gray-400 hover:bg-slate-800 rounded-lg cursor-pointer">
                    Pending Approval
                  </div>
                </div>
              </div>
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
                    onClick={handleNewInvoice}
                    className="px-3 py-2 text-sm text-white bg-slate-800 rounded-lg cursor-pointer"
                  >
                    Create Invoice
                  </div>
                  <div  onClick={() => setShowInvoicesList(!showInvoicesList)}
                  className="px-3 py-2 text-sm text-gray-400 hover:bg-slate-800 rounded-lg cursor-pointer">
                    All Invoices({savedInvoices.length})
                  </div>
                  <div className="px-3 py-2 text-sm text-gray-400 hover:bg-slate-800 rounded-lg cursor-pointer">
                    Pending Payment
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-slate-800 rounded-lg cursor-pointer mt-2">
                <Users className="w-5 h-5" />
                <span>Clients</span>
              </div>
              <div className="ml-8 mt-1 space-y-1">
                <div
                  onClick={handleAddNewClient}
                  className="flex items-center space-x-3 px-3 py-2 text-gray-400 hover:bg-slate-800 rounded-lg cursor-pointer mt-2"
                >
                  <span>Add Client</span>
                </div>
                <div
                  onClick={() => setShowClientsListModal(true)}
                  className="px-3 py-2 text-sm text-gray-400 hover:bg-slate-800 rounded-lg cursor-pointer"
                >
                  All Clients ({savedClients.length})
                </div>
              </div>

              <div className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-slate-800 rounded-lg cursor-pointer">
                <Building2 className="w-5 h-5" />
                <span>Projects</span>
              </div>
              <div
                onClick={() => setActiveView("templates")}
                className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                <FileText className="w-5 h-5" />
                <span>Invoice Templates</span>
              </div>
 {/* 
              <div className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-slate-800 rounded-lg cursor-pointer">
                <Package className="w-5 h-5" />
                <span>Materials</span>
              </div>

              <div className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-slate-800 rounded-lg cursor-pointer">
                <Hammer className="w-5 h-5" />
                <span>Equipment</span>
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
 */}
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
                  {documentType === "quote" ? "Quote" : "Invoice"} #
                  {quoteNumber || "— not saved yet —"}
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
                  <span>Approve</span>
                </button>
                <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-300">
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={handleSaveQuote}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                  Save {documentType === "quote" ? "Quote" : "Invoice"}
                </button>

                <button
                  onClick={
                    documentType === "quote" ? handleNewQuote : handleNewInvoice
                  }
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Plus className="w-4 h-4" />
                  New {documentType === "quote" ? "Quote" : "Invoice"}
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
              <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-300 whitespace-nowrap text-sm">
                <CheckSquare className="w-4 h-4" />
                <span>Approve</span>
              </button>
              <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-300 whitespace-nowrap text-sm">
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

          <div className="bg-gray-800 border-b border-gray-200 px-4 lg:px-6 overflow-x-auto print:hidden">
            <div className="flex space-x-4 lg:space-x-8 min-w-max">
              {[
                documentType === "quote" ? "Quote" : "Invoice",
                "Materials",
                "Timeline",
                "Notes",
              ].map((tab) => (
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
          {/* Company Settings Modal */}
          {showSettings && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                <div className="p-4 border-b flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Company Settings</h2>
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
                        Company Logo
                      </label>
                      <div className="flex items-center gap-4">
                        {companyInfo.logoUrl ? (
                          <img
                            src={companyInfo.logoUrl}
                            alt="Company Logo"
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
                            {companyInfo.logoUrl
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
                        Company Name
                      </label>
                      <input
                        type="text"
                        value={companyInfo.companyName}
                        onChange={(e) =>
                          setCompanyInfo({
                            ...companyInfo,
                            companyName: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border rounded-lg"
                        placeholder="Premier Construction Services"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Registration Number
                      </label>
                      <input
                        type="text"
                        value={companyInfo.registrationNumber}
                        onChange={(e) =>
                          setCompanyInfo({
                            ...companyInfo,
                            registrationNumber: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border rounded-lg"
                        placeholder="CK2023/123456/23"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        VAT Number
                      </label>
                      <input
                        type="text"
                        value={companyInfo.vatNumber}
                        onChange={(e) =>
                          setCompanyInfo({
                            ...companyInfo,
                            vatNumber: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border rounded-lg"
                        placeholder="4123456789"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Address Line 1
                      </label>
                      <input
                        type="text"
                        value={companyInfo.addressLine1}
                        onChange={(e) =>
                          setCompanyInfo({
                            ...companyInfo,
                            addressLine1: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border rounded-lg"
                        placeholder="9-10 CNR THIRD & INDUSTRIAL AVENUE"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Address Line 2
                      </label>
                      <input
                        type="text"
                        value={companyInfo.addressLine2}
                        onChange={(e) =>
                          setCompanyInfo({
                            ...companyInfo,
                            addressLine2: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border rounded-lg"
                        placeholder="BUSINESS PARK"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          City
                        </label>
                        <input
                          type="text"
                          value={companyInfo.city}
                          onChange={(e) =>
                            setCompanyInfo({
                              ...companyInfo,
                              city: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border rounded-lg"
                          placeholder="JOHANNESBURG"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Postal Code
                        </label>
                        <input
                          type="text"
                          value={companyInfo.postalCode}
                          onChange={(e) =>
                            setCompanyInfo({
                              ...companyInfo,
                              postalCode: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border rounded-lg"
                          placeholder="2000"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Primary Phone *
                      </label>
                      <input
                        type="tel"
                        value={companyInfo.primaryPhone}
                        onChange={(e) =>
                          setCompanyInfo({
                            ...companyInfo,
                            primaryPhone: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border rounded-lg"
                        placeholder="011 234 5678"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Secondary Phone (Optional)
                      </label>
                      <input
                        type="tel"
                        value={companyInfo.secondaryPhone}
                        onChange={(e) =>
                          setCompanyInfo({
                            ...companyInfo,
                            secondaryPhone: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border rounded-lg"
                        placeholder="082 345 6789"
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
                            value={companyInfo.bankName}
                            onChange={(e) =>
                              setCompanyInfo({
                                ...companyInfo,
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
                            value={companyInfo.accountHolder}
                            onChange={(e) =>
                              setCompanyInfo({
                                ...companyInfo,
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
                            value={companyInfo.accountNumber}
                            onChange={(e) =>
                              setCompanyInfo({
                                ...companyInfo,
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
                            value={companyInfo.branchCode}
                            onChange={(e) =>
                              setCompanyInfo({
                                ...companyInfo,
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
                            <div className="mt-4 p-6 bg-gray-300 rounded-lg border-2 border-dashed border-gray-300">
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
                      onClick={handleSaveCompanyInfo}
                      className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700"
                    >
                      Save Company Information
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <ClientsListModal
            showModal={showClientsListModal}
            setShowModal={setShowClientsListModal}
            clients={clients}
            onLoadClient={loadClient}
            onEditClient={handleEditClient}
            onAddNewClient={handleAddNewClient}
          />

          <ClientModal
            showModal={showClientModal}
            setShowModal={setShowClientModal}
            existingClient={selectedClient}
            onClientSaved={handleClientSaved}
          />

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
                                Client: {quote.client?.name || "N/A"}
                              </div>
                              <div className="text-sm text-gray-600">
                                Project: {quote.project?.name || "N/A"}
                              </div>
                              <div className="text-sm text-gray-600">
                                Location: {quote.project?.address || "N/A"}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-semibold text-orange-600">
                                R{quote.totals?.total?.toFixed(2) || "0.00"}
                              </div>
                              <div className="text-sm text-gray-500">
                                {quote.dates?.quoteDate
                                  ? new Date(
                                      quote.dates.quoteDate,
                                    ).toLocaleDateString("en-ZA")
                                  : "N/A"}
                              </div>
                              <div
                                className={`text-xs mt-1 px-2 py-1 rounded ${
                                  quote.status === "approved"
                                    ? "bg-green-100 text-green-700"
                                    : quote.status === "pending"
                                      ? "bg-blue-100 text-blue-700"
                                      : "bg-gray-100 text-gray-700"
                                }`}
                              >
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
          {showConvertModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg max-w-md w-full p-6">
                <h2 className="text-xl font-semibold mb-4">
                  Quote Saved Successfully!
                </h2>
                <p className="text-gray-600 mb-6">
                  Would you like to convert this quote to an invoice?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleConvertToInvoice}
                    className="flex-1 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
                  >
                    Convert to Invoice
                  </button>
                  <button
                    onClick={() => setShowConvertModal(false)}
                    className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                  >
                    Later
                  </button>
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
              <button
                onClick={() => setShowQuote(!showQuote)}
                className="lg:hidden w-full mb-4 flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <FileText className="w-5 h-5" />
                {showQuote ? "Hide Quote" : "View Quote"}
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div
                  className={`${
                    showQuote ? "hidden" : "block"
                  } space-y-6 lg:block print:hidden max-h-[calc(100vh-120px)] overflow-y-auto`}
                >
                  <div className="bg-orange-50 border border-orange-200 rounded-lg px-4 py-3 flex items-center space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-orange-700 font-medium">Draft</span>
                    <span className="text-orange-600">Created Today</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="text-sm text-gray-500 mb-1">
                        {documentType === "quote" ? "Quote" : "Invoice"} Amount
                      </div>
                      <div className="text-2xl font-semibold text-orange-600">
                        R{total.toFixed(2)}
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="text-sm text-gray-500 mb-1">Duration</div>
                      <div className="text-2xl font-semibold text-blue-600">
                        {projectDuration}
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="text-sm text-gray-500 mb-1">
                        Valid Until
                      </div>
                      <div className="text-lg font-semibold text-gray-700">
                        {new Date(
                          Date.now() + 30 * 24 * 60 * 60 * 1000,
                        ).toLocaleDateString("en-ZA")}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold flex items-center space-x-2">
                        <Users className="w-5 h-5" />
                        <span>Client Information</span>
                      </h2>
                      <button className="flex items-center space-x-2 text-orange-600 hover:text-orange-700">
                        <Edit className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-500">Client Name</div>
                        <input
                          type="text"
                          value={clientName}
                          onChange={(e) => setClientName(e.target.value)}
                          className="w-full px-4 py-2 border rounded"
                        />
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Client Type</div>
                        <select
                          value={clientType}
                          onChange={(e) => setClientType(e.target.value)}
                          className="w-full px-4 py-2 border rounded"
                        >
                          <option value="Residential">Residential</option>
                          <option value="Commercial">Commercial</option>
                          <option value="Industrial">Industrial</option>
                          <option value="Government">Government</option>
                        </select>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">
                          Company Name
                        </div>
                        <input
                          type="text"
                          value={clientCompany}
                          onChange={(e) => setClientCompany(e.target.value)}
                          className="w-full px-4 py-2 border rounded"
                        />
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Client ID</div>
                        <input
                          type="text"
                          value={clientId}
                          onChange={(e) => setClientId(e.target.value)}
                          className="w-full px-4 py-2 border rounded"
                        />
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Email</div>
                        <input
                          type="text"
                          value={clientEmail}
                          onChange={(e) => setClientEmail(e.target.value)}
                          className="w-full px-4 py-2 border rounded"
                        />
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Phone</div>
                        <input
                          type="text"
                          value={clientPhone}
                          onChange={(e) => setClientPhone(e.target.value)}
                          className="w-full px-4 py-2 border rounded"
                        />
                      </div>
                      <div className="col-span-1 sm:col-span-2">
                        <div className="text-sm text-gray-500">Address</div>
                        <input
                          type="text"
                          value={clientAddress}
                          onChange={(e) => setClientAddress(e.target.value)}
                          className="w-full px-4 py-2 border rounded"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold flex items-center space-x-2">
                        <Building2 className="w-5 h-5" />
                        <span>Project Information</span>
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="col-span-1 sm:col-span-2">
                        <div className="text-sm text-gray-500">
                          Project Name
                        </div>
                        <input
                          type="text"
                          value={projectName}
                          onChange={(e) => setProjectName(e.target.value)}
                          className="w-full px-4 py-2 border rounded"
                        />
                      </div>
                      <div className="col-span-1 sm:col-span-2">
                        <div className="text-sm text-gray-500">
                          Project Address
                        </div>
                        <input
                          type="text"
                          value={projectAddress}
                          onChange={(e) => setProjectAddress(e.target.value)}
                          className="w-full px-4 py-2 border rounded"
                        />
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">
                          Project Type
                        </div>
                        <select
                          value={projectType}
                          onChange={(e) => setProjectType(e.target.value)}
                          className="w-full px-4 py-2 border rounded"
                        >
                          <option value="">Select Type</option>
                          <option value="New Build">New Build</option>
                          <option value="Renovation">Renovation</option>
                          <option value="Extension">Extension</option>
                          <option value="Repairs">Repairs</option>
                          <option value="Maintenance">Maintenance</option>
                        </select>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">
                          Project Size
                        </div>
                        <input
                          type="text"
                          value={projectSize}
                          onChange={(e) => setProjectSize(e.target.value)}
                          className="w-full px-4 py-2 border rounded"
                          placeholder="e.g., 500 sqm"
                        />
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Duration</div>
                        <input
                          type="text"
                          value={projectDuration}
                          onChange={(e) => setProjectDuration(e.target.value)}
                          className="w-full px-4 py-2 border rounded"
                          placeholder="e.g., 3 months"
                        />
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Start Date</div>
                        <input
                          type="date"
                          value={projectStartDate}
                          onChange={(e) => setProjectStartDate(e.target.value)}
                          className="w-full px-4 py-2 border rounded"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                    <h2 className="text-lg font-semibold mb-4">
                      Add Line Item
                    </h2>

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
                        <option value="Equipment">Equipment</option>
                        <option value="Subcontractor">Subcontractor</option>
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
                      <h2 className="text-lg font-semibold">
                        Terms & Conditions
                      </h2>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">Payment Terms:</span>
                        <span className="font-medium">
                          50% Deposit, Balance on Completion
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">Quote Valid:</span>
                        <span className="font-medium">30 Days</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600">Warranty:</span>
                        <span className="font-medium">
                          12 Months Workmanship
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quote Preview/Print Section */}
                <div
                  className={`${
                    !showQuote ? "hidden" : "block"
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
                        businessInfo={companyInfo}
                        loading={loading}
                        jobCardNumber={quoteNumber}
                        customerName={clientName}
                        customerCompany={clientCompany}
                        customerEmail={clientEmail}
                        customerPhone={clientPhone}
                        customerAddress={clientAddress}
                        projectName={projectName}
                        projectAddress={projectAddress}
                        projectType={projectType}
                        projectSize={projectSize}
                        projectDuration={projectDuration}
                        projectStartDate={projectStartDate}
                        items={items}
                        subtotal={subtotal}
                        vat={vat}
                        total={total}
                        
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
                    
                    nav,
                    [class*="sidebar"],
                    [class*="bg-gray-800"],
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
  );
};

export default ConstructionDashboard;
