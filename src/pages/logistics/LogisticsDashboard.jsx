import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import HomeView from "../HomeView";
import BusinessSettingsModal from "../BusinessSettingsModal";
import AppHeader from "../AppHeader";
import { serverTimestamp } from "firebase/firestore";
import logo from "../../assets/img/solidflo-logo.png";
import FinancialOverview from "../FinancialOverview";
import Templates from "./Templates";
import { useLocation } from "react-router-dom";
import AIInvoiceExtractor from "../AIInvoiceExtractor";
import TemplateSelector, { TemplateRenderer } from "./TemplateSelector";
import { getAuth, signOut } from "firebase/auth";
import FreightMultiStepForm from "./FreightMultiStepForm";
import { getFunctions, httpsCallable } from "firebase/functions";
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
import uploadLogoToR2 from "../../utils/uploadLogoToR2";
import CustomersListModal from "../CustomersListModal";
import InTransitModal from "./InTransitModal";
import WaybillStickerModal from "./WaybillStickerModal";
import SignatureStamp from "../SignatureStamp";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Home,
  Save,
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
const functions = getFunctions();
const LogisticsDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [inputMode, setInputMode] = useState("manual");
  const [documentType, setDocumentType] = useState("invoice");
  const [useAI, setUseAI] = useState(false);
  const [activeTab, setActiveTab] = useState("Waybill");
  const [showWaybill, setShowWaybill] = useState(false);
  const { user, authUser } = useAuth();
  const [waybillNumber, setWaybillNumber] = useState("");
  const [waybillId, setWaybillId] = useState(null);
  const [savedWaybills, setSavedWaybills] = useState([]);
  const [showWaybillsList, setShowWaybillsList] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCustomersList, setShowCustomersList] = useState(false);
  const [savedCustomers, setSavedCustomers] = useState([]);
  const [activeView, setActiveView] = useState("home");
  const [activeTemplate, setActiveTemplate] = useState("classic");
  const [showCustomersListModal, setShowCustomersListModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("professional");
  const [customers, setCustomers] = useState([]);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] =
    useState(null);
  const [showInTransitModal, setShowInTransitModal] = useState(false);
  const [showWaybillSticker, setShowWaybillSticker] = useState(false);
  const [savedWaybillData, setSavedWaybillData] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isInvoicingOpen, setIsInvoicingOpen] = useState(false);
  const [isClientsOpen, setIsClientsOpen] = useState(false);
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
  const [paymentStatus, setPaymentStatus] = useState({
    totalPaid: 0,
    balanceDue: 0,
    status: "pending",
  });
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
  const location = useLocation();

useEffect(() => {
  if (location.state?.activeView) {
    setActiveView(location.state.activeView);
  }
}, [location.state]);
  const handleViewWaybillDetails = (waybill) => {
    // Close the in-transit modal
    setShowInTransitModal(false);

    // Load the waybill data into the form
    loadWaybill(waybill);

    // Switch to invoice view
    setActiveView("invoice");
  };
  const handleProcessPayment = async () => {
    if (!waybillId || !user?.uid) {
      alert("Please save the invoice before processing payment");
      return;
    }

    try {
      const collectionName =
        documentType === "estimate" ? "estimates" : "invoices";
      const invoiceDoc = await getDoc(
        doc(db, "users", user.uid, collectionName, waybillId),
      );

      if (invoiceDoc.exists()) {
        const invoiceData = invoiceDoc.data();
        setSelectedInvoiceForPayment({
          id: waybillId,
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
    if (!user?.uid || !waybillId) {
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
        doc(db, "users", user.uid, collectionName, waybillId),
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
    loadSavedWaybills();
    loadPaymentStatus();
    setShowPaymentModal(false);
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
  const handleConvertToInvoice = async () => {
    if (!user?.uid) return;
    if (!waybillId) {
      alert("Please save the waybill first before converting to invoice");
      return;
    }
    if (
      !window.confirm(
        "Convert this waybill to an invoice? This will create a new invoice with the same details.",
      )
    )
      return;

    try {
      const db = getFirestore();
      const newInvoiceNumber = await generateWaybillNumber(user.uid, "invoice");

      const invoiceData = buildWaybillPayload(newInvoiceNumber);
      invoiceData.documentType = "invoice";
      invoiceData.convertedFromWaybill = waybillId;
      invoiceData.convertedFromWaybillNumber = waybillNumber;
      invoiceData.convertedAt = serverTimestamp();

      const invoiceRef = await addDoc(
        collection(db, "users", user.uid, "invoices"),
        invoiceData,
      );

      await updateDoc(doc(db, "users", user.uid, "waybills", waybillId), {
        convertedToInvoice: true,
        convertedToInvoiceId: invoiceRef.id,
        convertedToInvoiceNumber: newInvoiceNumber,
        convertedAt: serverTimestamp(),
        status: "converted",
      });

      setDocumentType("invoice");
      setWaybillId(invoiceRef.id);
      setWaybillNumber(newInvoiceNumber);

      alert(`Waybill successfully converted to Invoice ${newInvoiceNumber}`);
      loadSavedWaybills();
    } catch (error) {
      console.error("Error converting waybill to invoice:", error);
      alert("Failed to convert waybill to invoice");
    }
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
    if (extractedData.sender.address)
      setSenderAddress(extractedData.sender.address);
    if (extractedData.sender.customerId)
      setCustomerId(extractedData.sender.customerId);

    // Receiver info
    if (extractedData.receiver.name)
      setReceiverName(extractedData.receiver.name);
    if (extractedData.receiver.email)
      setReceiverEmail(extractedData.receiver.email);
    if (extractedData.receiver.phone)
      setReceiverPhone(extractedData.receiver.phone);
    if (extractedData.receiver.address)
      setReceiverAddress(extractedData.receiver.address);

    // Shipment info
    if (extractedData.shipment.origin) setOrigin(extractedData.shipment.origin);
    if (extractedData.shipment.destination)
      setDestination(extractedData.shipment.destination);
    if (extractedData.shipment.cargoType)
      setCargoType(extractedData.shipment.cargoType);
    if (extractedData.shipment.weight) setWeight(extractedData.shipment.weight);
    if (extractedData.shipment.dimensions)
      setDimensions(extractedData.shipment.dimensions);
    if (extractedData.shipment.trackingNumber)
      setTrackingNumber(extractedData.shipment.trackingNumber);

    // Items
    if (extractedData.items && extractedData.items.length > 0) {
      setItems(extractedData.items);
    }

    alert("✅ Waybill data extracted and populated successfully!");
  };
  const handleTestEmail = async () => {
    if (!businessInfo.emailPassword) {
      alert("⚠️ Please enter your email app password first.");
      return;
    }

    const userEmail = user?.email || authUser?.email;

    if (!userEmail) {
      alert("⚠️ Could not find your email address. Please log in again.");
      return;
    }

    try {
      const testEmailData = {
        userId: user.uid,
        to: userEmail, // Send test to self
        subject: "✅ Test Email - Email Configuration Successful",
        message: `
Hello,

This is a test email from your construction quote/invoice system.

✓ Your email configuration is working correctly!

Account Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Business: ${businessInfo.businessName}
Email: ${userEmail}
Provider: ${businessInfo.emailProvider || "Gmail"}
Date: ${new Date().toLocaleString()}

You can now send quotes and invoices to your clients from this email address.

Best regards,
Your Construction Quote System
      `.trim(),
        documentType: "test",
        documentNumber: "TEST-001",
      };

      const sendEmail = httpsCallable(functions, "sendQuoteEmail");
      await sendEmail(testEmailData);

      alert(
        `✅ Test email sent successfully!\n\nCheck your inbox at: ${userEmail}`,
      );
    } catch (error) {
      console.error("Test email error:", error);

      let errorMsg = "❌ Test email failed!\n\n";
      if (error.message.includes("Invalid login")) {
        errorMsg +=
          "Your app password is incorrect. Please check and try again.\n\nMake sure you're using an APP PASSWORD, not your regular password.";
      } else {
        errorMsg += `Error: ${error.message}\n\nPlease check your app password and try again.`;
      }

      alert(errorMsg);
    }
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

      // ✅ Upload to Cloudflare R2 (Worker handles userId)
      const logoUrl = await uploadLogoToR2(file, authUser);

      setBusinessInfo((prev) => ({
        ...prev,
        logoUrl,
        uploading: false,
      }));

      // Save URL to Firestore
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
      await setDoc(docRef, businessInfo);
      alert("Business information saved successfully!");
      setShowSettings(false);
    } catch (error) {
      console.error("Error saving business info:", error);
      alert("Failed to save business information");
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
    
    /* Force print area to display even if hidden */
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
    
    /* Ensure colors print correctly */
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    
    /* Logo sizing */
    .logo img {
      height: 60px;
      width: auto;
    }
    
    /* Remove any borders or shadows */
    .shadow-lg, .rounded-lg, .shadow-xl, .shadow-2xl {
      border: none !important;
      box-shadow: none !important;
    }
    
    /* Prevent page breaks inside elements */
    table, tr, td, th, div {
      page-break-inside: avoid !important;
    }
    
    /* Ensure tables print correctly */
    table {
      width: 100% !important;
      border-collapse: collapse !important;
    }
  }
`;

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
  const headerActions = [
    documentType === "quote" && waybillId && {
      label: "Convert to Invoice", icon: FileText, onClick: handleConvertToInvoice,
      className: "flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-sm font-semibold rounded-lg hover:from-purple-700 transition-colors shadow-sm whitespace-nowrap"
    },
    { label: "Print",    icon: Printer,  onClick: handlePrint,        variant: "secondary" },
    { label: "New",      icon: Plus,     onClick: documentType === "quote" ? handleNewWaybill : handleNewWaybill,
      className: "flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-sm font-semibold rounded-lg hover:from-emerald-700 transition-colors shadow-sm whitespace-nowrap" },
    { label: "Send",     icon: Send,
      className: "flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold rounded-lg hover:from-blue-700 transition-colors shadow-sm whitespace-nowrap" },
    { label: "Save PDF", icon: Download, onClick: handleSavePDF,
      className: "flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-600 to-orange-700 text-white text-sm font-semibold rounded-lg hover:from-orange-700 transition-colors shadow-sm whitespace-nowrap" },
    { label: "Save",     icon: Save,     onClick: handleSaveWaybill,
      className: "flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-600 to-amber-700 text-white text-sm font-semibold rounded-lg hover:from-amber-700 transition-colors shadow-sm whitespace-nowrap" },
    { label: "Logout",   icon: LogOut,   onClick: handleLogout,
      className: "flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-semibold rounded-lg hover:from-red-700 transition-colors shadow-sm whitespace-nowrap" },
  ].filter(Boolean);
  
  const mobileDashboardActions = [
    documentType === "quote" && waybillId && {
      label: "To Invoice", icon: FileText, onClick: handleConvertToInvoice,
      className: "flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg text-xs font-semibold shadow-lg transition-all active:scale-95 whitespace-nowrap"
    },
    { label: "Save",  icon: Save,     onClick: handleSaveWaybill,
      className: "flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-stone-600 to-stone-700 text-white rounded-lg text-xs font-semibold shadow-lg transition-all active:scale-95 whitespace-nowrap" },
    { label: "Send",  icon: Send,  
      className: "flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg text-xs font-semibold shadow-lg transition-all active:scale-95 whitespace-nowrap" },
    { label: "PDF",   icon: Download, onClick: handleSavePDF,
      className: "flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg text-xs font-semibold shadow-lg transition-all active:scale-95 whitespace-nowrap" },
    { label: "Print", icon: Printer,  onClick: handlePrint,
      className: "flex items-center gap-1.5 px-3 py-2 bg-white border-2 border-slate-200 text-slate-700 rounded-lg text-xs font-semibold shadow-sm transition-all active:scale-95 whitespace-nowrap" },
  ].filter(Boolean);
   

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
          sidebarOpen ? "hidden" : "hidden md:block"
        } fixed z-40 w-16 bg-gradient-to-b from-slate-900 to-slate-800 border-r border-slate-700 h-full print:hidden transition-all duration-300 shadow-xl`}
      >
        <div className="flex flex-col items-center py-4 md:py-6 space-y-4 md:space-y-6">
          {/* Toggle Button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="group p-2 md:p-3 text-slate-400 hover:text-white hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-700 rounded-xl transition-all duration-300 shadow-lg hover:shadow-blue-500/50 hover:scale-110"
            title="Expand Sidebar"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6 group-hover:animate-pulse" />
          </button>

          {/* Logo */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300"></div>
            <div className="relative w-10 h-10 md:w-12 md:h-12 mb-2 md:mb-4  rounded-xl p-1 shadow-lg">
              <img src={logo} alt="" />
            </div>
          </div>

          <div className="w-10 border-t border-slate-600"></div>

          {/* Icon Navigation */}
          <div className="flex flex-col items-center space-y-3 md:space-y-4 w-full px-2 md:px-3">
            <button
              onClick={() => setActiveView("home")} // ADD THIS
              className="group relative p-2 md:p-3 text-cyan-400 hover:text-white rounded-xl transition-all duration-300 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center overflow-hidden"
              title="Home"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-stone-600 to-stone-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Home className="w-5 h-5 md:w-6 md:h-6 relative z-10 group-hover:scale-110 transition-transform duration-300" />
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
        <div className="absolute bottom-4 md:bottom-6 left-0 right-0 flex justify-center">
          <div className="relative group">
            <div className="absolute inset-0 rounded-full opacity-50 group-hover:opacity-100 blur-md transition-opacity duration-300"></div>
            <div className="relative w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-full flex items-center justify-center ring-2 ring-cyan-700 shadow-lg group-hover:ring-4 group-hover:ring-cyan-500/50 transition-all duration-300">
              <img src={businessInfo.logoUrl} alt="" />
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Sidebar (Full Width) */}
      <div
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed z-50 w-64 bg-gradient-to-b from-slate-900 to-slate-800 border-r border-slate-700 transition-transform duration-300 h-full print:hidden shadow-2xl`}
      >
        <div className="p-4 md:p-6">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <div className="flex items-center space-x-3 md:space-x-4">
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
            <div
              onClick={() => {
                setActiveView("home");
                setSidebarOpen(false);
              }}
              className="group flex items-center space-x-2 md:space-x-3 px-3 md:px-4 py-2.5 md:py-3 text-cyan-300 hover:text-white hover:bg-gradient-to-r hover:from-stone-600/20 hover:to-stone-700/20 rounded-xl cursor-pointer transition-all duration-300 border border-transparent hover:border-cyan-500/30"
            >
              <Home className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
              <span className="text-xs md:text-sm font-semibold">Home</span>
            </div>
            <div
              onClick={() => {
                setShowSettings(true);
                setSidebarOpen(false);
              }}
              className="flex items-center space-x-3 px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200"
            >
              <Settings className="w-5 h-5" />
              <span className="text-sm font-medium">Settings</span>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-700/50">
              <div
                onClick={() => {
                  setActiveView("financial-overview");
                  setSidebarOpen(false);
                }}
                className="flex items-center space-x-3 px-3 py-2.5 text-slate-300 hover:text-white hover:bg-blue-600/20 hover:border-l-4 hover:border-blue-500 rounded-lg cursor-pointer transition-all duration-200"
              >
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm font-medium">Business Overview</span>
              </div>

              {/* Waybills Section */}
              <div className="mt-2">
                <div className="flex items-center justify-between px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200">
                  <div className="flex items-center space-x-3 md:space-x-4">
                    <ClipboardList className="w-5 h-5" />
                    <span className="text-sm font-medium">Waybills</span>
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </div>

                <div className="ml-4 mt-1 space-y-1 border-l-2 border-slate-700/50 pl-4">
                  <div
                    onClick={() => {
                      handleNewWaybill();
                      setSidebarOpen(false);
                      setActiveView("invoice");
                    }}
                    className="px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700/30 rounded-lg cursor-pointer transition-all duration-200"
                  >
                    Create Invoice
                  </div>
                  <div
                    onClick={() => {
                      setShowWaybillsList(!showWaybillsList);
                      setSidebarOpen(false);
                    }}
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
                    onClick={() => {
                      setShowInTransitModal(true);
                      setSidebarOpen(false);
                    }}
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
                  <div className="flex items-center space-x-3 md:space-x-4">
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
                    onClick={() => {
                      setShowCustomersListModal(true);
                      setSidebarOpen(false);
                    }}
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
                onClick={() => {
                  setActiveView("templates");
                  setSidebarOpen(false);
                }}
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
                <div className="flex items-center space-x-3 md:space-x-4">
                  <Receipt className="w-5 h-5" />
                  <span className="text-sm font-medium">Invoices</span>
                </div>
                <ChevronDown className="w-4 h-4" />
              </div>

              <div className="flex items-center justify-between px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200">
                <div className="flex items-center space-x-3 md:space-x-4">
                  <CreditCard className="w-5 h-5" />
                  <span className="text-sm font-medium">Payments</span>
                </div>
                <ChevronDown className="w-4 h-4" />
              </div>

              <div className="flex items-center justify-between px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200">
                <div className="flex items-center space-x-3 md:space-x-4">
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
      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300 ${sidebarOpen ? "lg:ml-64" : "ml-0 md:ml-16"}`}
      >
        <div className="flex-1 overflow-auto h-screen border-b-[25px] border-gray-800">
               <AppHeader
  actions={headerActions}
  mobileActions={mobileDashboardActions}
  onSettingsOpen={() => setShowSettings(true)}
/>
   
          {/* ── Scrollable Main Content ──────────────────────────────── */}
          <div className="flex-1 overflow-y-auto pr-4 md:pr-6 lg:pr-8">
            {/* Business Settings Modal */}
            {showSettings && (
             <BusinessSettingsModal onClose={() => setShowSettings(false)} />
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
            {activeView === "home" && <HomeView user={user} />}
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

                <div className="grid grid-cols-1 gap-6 px-4 sm:px-6 lg:px-8 xl:px-12">
                  <div
                    className={`${
                      showWaybill ? "hidden" : "block"
                    } space-y-6 lg:block print:hidden max-h-[calc(100vh-120px)] overflow-y-auto`}
                  >
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

                      {/* Tab Content */}
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
                        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex items-center space-x-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-blue-700 text-sm font-medium">
                            In Transit
                          </span>
                          <span className="text-blue-600">Shipped Today</span>
                        </div>

                        <div className="grid grid-cols-3 sm:grid-cols-3 gap-4">
                          <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <div className="text-sm text-gray-500 mb-1">
                              Total Amount
                            </div>
                            <div className="text-2xl font-semibold text-orange-600">
                              R{total.toFixed(2)}
                            </div>
                          </div>
                          <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <div className="text-sm text-gray-500 mb-1">
                              Paid
                            </div>
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
                            <h2 className="text-lg font-semibold">
                              Payment Terms
                            </h2>
                          </div>

                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between py-2 border-b">
                              <span className="text-gray-600">
                                Payment Method:
                              </span>
                              <span className="text-sm font-medium">
                                Cash/Card/EFT
                              </span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                              <span className="text-gray-600">
                                Payment Terms:
                              </span>
                              <span className="text-sm font-medium">
                                Due on Delivery
                              </span>
                            </div>
                            <div className="flex justify-between py-2">
                              <span className="text-gray-600">Insurance:</span>
                              <span className="text-sm font-medium">
                                Optional Coverage Available
                              </span>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <div
                    id="print-area"
                    className={`${!showWaybill ? "hidden lg:block" : "block"} mx-auto bg-white print:block`}
                    style={{ width: "210mm", minHeight: "297mm" }}
                  >
                    {activeView === "invoice" && (
                      <>
                        {/* Add Template Selector */}
                        <div className="mb-4 print:hidden">
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
                          stampText={stampSettings.text}
                          stampColor={stampSettings.color}
                          showStampDate={stampSettings.showDate}
                          showStamp={stampSettings.enabled}
                        />
                      </>
                    )}
                  </div>
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
