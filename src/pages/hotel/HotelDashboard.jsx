import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import HomeView from "../HomeView";
import BusinessSettingsModal from "../BusinessSettingsModal";
import AppHeader from "../AppHeader";
import { serverTimestamp } from "firebase/firestore";
import logo from "../../assets/img/solidflo-logo.png";
import { getAuth, signOut } from "firebase/auth";
import FinancialOverview from "../FinancialOverview";
import HospitalityMultiStepForm from "./HospitalityMultiStepForm";
import { getFunctions, httpsCallable } from "firebase/functions";
import CheckInOutModal, {
  createCheckInFromInvoice,
  createCheckInFromGuest,
} from "./CheckInOutModal";
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
import GuestModal from "./GuestModal";
import uploadLogoToR2 from "../../utils/uploadLogoToR2";
import Templates from "./Templates";
import { useLocation } from "react-router-dom";
import HotelAIExtractor from "./HotelAIExtractor";
import TemplateSelector, { TemplateRenderer } from "./TemplateSelector";
import GuestsListModal from "./GuestsListModal";
import SignatureStamp from "../SignatureStamp";
import PaymentProcessor from "../../components/dashboard/PaymentProcessor";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Home,
  Sparkles,
  Settings,
  Users,
  Calendar,
  FileText,
  Hotel,
  FileBarChart,
  BarChart3,
  Menu,
  Plus,
  Send,
  Save,
  X,
  Edit,
  LogOut,
  CheckSquare,
  TrendingUp,
  CreditCard,
  Receipt,
  Bed,
  DoorOpen,
  Utensils,
  Upload,
  MapPin,
  Package,
  Wallet,
} from "lucide-react";

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
const functions = getFunctions();
const HotelDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [inputMode, setInputMode] = useState("manual");
  const [documentType, setDocumentType] = useState("invoice");
  const [useAI, setUseAI] = useState(false);
  const [activeTab, setActiveTab] = useState("Invoice");
  const [showInvoice, setShowInvoice] = useState(false);
  const { user, authUser } = useAuth();
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceId, setInvoiceId] = useState(null);
  const [savedInvoices, setSavedInvoices] = useState([]);
  const [showInvoicesList, setShowInvoicesList] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showGuestsList, setShowGuestsList] = useState(false);
  const [activeView, setActiveView] = useState("home");
  const [savedGuests, setSavedGuests] = useState([]);
  const [activeTemplate, setActiveTemplate] = useState("classic");
  const [showGuestsListModal, setShowGuestsListModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("professional");
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [showCheckInOutModal, setShowCheckInOutModal] = useState(false);
  const [autoCreateCheckIn, setAutoCreateCheckIn] = useState(true);
  const [guests, setGuests] = useState([]);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isInvoicingOpen, setIsInvoicingOpen] = useState(false);
  const [isClientsOpen, setIsClientsOpen] = useState(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] =
    useState(null);
  const [stampSettings, setStampSettings] = useState({
    text: "APPROVED",
    color: "#d32f2f",
    showDate: false,
    enabled: false,
  });

  // Payment Status State
  const [paymentStatus, setPaymentStatus] = useState({
    totalPaid: 0,
    balanceDue: 0,
    status: "pending",
  });
const location = useLocation();

useEffect(() => {
  if (location.state?.activeView) {
    setActiveView(location.state.activeView);
  }
}, [location.state]);
  useEffect(() => {
    if (!user?.uid) return;

    const loadInvoiceNumber = async () => {
      const nextInvoice = await generateInvoiceNumber(user.uid);
      setInvoiceNumber(nextInvoice);
    };

    loadInvoiceNumber();
    loadSavedInvoices();
  }, [user]);

  const loadGuests = async () => {
    try {
      const q = query(
        collection(db, "users", user.uid, "guests"),
        orderBy("createdAt", "desc"),
      );
      const querySnapshot = await getDocs(q);
      const guestsData = [];

      querySnapshot.forEach((doc) => {
        guestsData.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      setGuests(guestsData);
    } catch (error) {
      console.error("Error loading guests:", error);
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

  const handleAddNewGuest = () => {
    setSelectedGuest(null);
    setShowGuestModal(true);
  };

  const handleEditGuest = (guest) => {
    setSelectedGuest(guest);
    setShowGuestModal(true);
  };

  const loadGuest = (guest) => {
    setGuestName(guest.name || "");
    setGuestEmail(guest.email || "");
    setGuestPhone(guest.phone || "");
    setGuestAddress(guest.address || "");
    setGuestId(guest.guestId || "");
    setGuestDOB(guest.dateOfBirth || "");
    setGuestNationality(guest.nationality || "");
    setIdType(guest.idType || "ID Document");
    setIdNumber(guest.idNumber || "");
  };
  const handleAIDataExtracted = (extractedData) => {
    // Guest info
    if (extractedData.guest.name) setGuestName(extractedData.guest.name);
    if (extractedData.guest.email) setGuestEmail(extractedData.guest.email);
    if (extractedData.guest.phone) setGuestPhone(extractedData.guest.phone);
    if (extractedData.guest.address)
      setGuestAddress(extractedData.guest.address);
    if (extractedData.guest.guestId) setGuestId(extractedData.guest.guestId);
    if (extractedData.guest.dateOfBirth)
      setGuestDOB(extractedData.guest.dateOfBirth);
    if (extractedData.guest.nationality)
      setGuestNationality(extractedData.guest.nationality);
    if (extractedData.guest.idType) setIdType(extractedData.guest.idType);
    if (extractedData.guest.idNumber) setIdNumber(extractedData.guest.idNumber);

    // Booking info
    if (extractedData.booking.roomNumber)
      setRoomNumber(extractedData.booking.roomNumber);
    if (extractedData.booking.roomType)
      setRoomType(extractedData.booking.roomType);
    if (extractedData.booking.checkInDate)
      setCheckInDate(extractedData.booking.checkInDate);
    if (extractedData.booking.checkOutDate)
      setCheckOutDate(extractedData.booking.checkOutDate);
    if (extractedData.booking.numberOfGuests)
      setNumberOfGuests(extractedData.booking.numberOfGuests);
    if (extractedData.booking.numberOfNights)
      setNumberOfNights(extractedData.booking.numberOfNights);
    if (extractedData.booking.specialRequests)
      setSpecialRequests(extractedData.booking.specialRequests);

    // Items
    if (extractedData.items && extractedData.items.length > 0) {
      setItems(extractedData.items);
    }

    alert("✅ Hotel booking data extracted and populated successfully!");
  };
  const handleTestEmail = async () => {
    if (!propertyInfo.emailPassword) {
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
Business: ${propertyInfo.businessName}
Email: ${userEmail}
Provider: ${propertyInfo.emailProvider || "Gmail"}
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
  const handleGuestSaved = () => {
    loadGuests();
  };

  useEffect(() => {
    loadGuests();
  }, []);

  const loadInvoice = (invoice) => {
    setInvoiceId(invoice.id);
    setInvoiceNumber(invoice.invoiceNumber || "");
    setGuestName(invoice.guest?.name || "");
    setGuestEmail(invoice.guest?.email || "");
    setGuestPhone(invoice.guest?.phone || "");
    setGuestAddress(invoice.guest?.address || "");
    setGuestId(invoice.guest?.guestId || "");
    setGuestDOB(invoice.guest?.dateOfBirth || "");
    setGuestNationality(invoice.guest?.nationality || "");
    setIdType(invoice.guest?.idType || "ID Document");
    setIdNumber(invoice.guest?.idNumber || "");
    setRoomNumber(invoice.booking?.roomNumber || "");
    setRoomType(invoice.booking?.roomType || "");
    setCheckInDate(invoice.booking?.checkInDate || "");
    setCheckOutDate(invoice.booking?.checkOutDate || "");
    setNumberOfGuests(invoice.booking?.numberOfGuests || "");
    setNumberOfNights(invoice.booking?.numberOfNights || "");
    setSpecialRequests(invoice.booking?.specialRequests || "");
    setItems(invoice.items || []);
    setShowInvoicesList(false);
    // Load payment status
    setPaymentStatus({
      totalPaid: invoice.totals?.paid || 0,
      balanceDue: invoice.totals?.due || invoice.totals?.total || 0,
      status: invoice.status || "pending",
    });
  };

  const loadSavedGuests = async () => {
    if (!user?.uid) return;

    const db = getFirestore();
    const guestsRef = collection(db, "users", user.uid, "guests");
    const q = query(guestsRef, orderBy("createdAt", "desc"), limit(50));
    const snapshot = await getDocs(q);

    const guests = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setSavedGuests(guests.filter((g) => !g._placeholder));
  };

  const handleSaveGuest = async () => {
    if (!user?.uid) return;

    if (!guestName || !guestPhone) {
      alert("Please enter guest name and phone number");
      return;
    }

    try {
      const db = getFirestore();
      const guestData = {
        name: guestName,
        email: guestEmail,
        phone: guestPhone,
        address: guestAddress,
        guestId: guestId || `GST-${Date.now()}`,
        dateOfBirth: guestDOB,
        nationality: guestNationality,
        idType,
        idNumber,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(collection(db, "users", user.uid, "guests"), guestData);
      alert("Guest saved successfully!");
      loadSavedGuests();
    } catch (error) {
      console.error("Error saving guest:", error);
      alert("Failed to save guest");
    }
  };

  const loadInvoiceForExport = async () => {
    if (!user?.uid || !invoiceId) return null;

    const db = getFirestore();
    const snap = await getDoc(
      doc(db, "users", user.uid, "invoices", invoiceId),
    );

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
    setGuestName(savedInvoice.guest.name);
    setGuestEmail(savedInvoice.guest.email);
    setGuestPhone(savedInvoice.guest.phone);
    setGuestAddress(savedInvoice.guest.address);
    setRoomNumber(savedInvoice.booking.roomNumber);
    setRoomType(savedInvoice.booking.roomType);

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
      type: newItem.type || "Room Charge",
      rate,
      qty,
      amount: rate * qty,
    };

    setItems((prev) => [...prev, item]);
    setNewItem({ description: "", rate: "", qty: "", type: "Room Charge" });
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

  const [guestName, setGuestName] = useState("John Smith");
  const [guestId, setGuestId] = useState("GST-2026-1234");
  const [guestEmail, setGuestEmail] = useState("john.smith@example.com");
  const [guestPhone, setGuestPhone] = useState("082 123 4567");
  const [guestAddress, setGuestAddress] = useState(
    "456 Oak Street, Cape Town, 8001",
  );
  const [guestDOB, setGuestDOB] = useState("1985-05-15");
  const [guestNationality, setGuestNationality] = useState("South African");
  const [idType, setIdType] = useState("ID Document");
  const [idNumber, setIdNumber] = useState("8505155678901");
  const [roomNumber, setRoomNumber] = useState("205");
  const [roomType, setRoomType] = useState("Deluxe Double Room");
  const [checkInDate, setCheckInDate] = useState("2026-01-10");
  const [checkOutDate, setCheckOutDate] = useState("2026-01-15");
  const [numberOfGuests, setNumberOfGuests] = useState("2");
  const [numberOfNights, setNumberOfNights] = useState("5");
  const [specialRequests, setSpecialRequests] = useState(
    "Late check-in requested",
  );

  const [propertyInfo, setPropertyInfo] = useState({
    propertyName: "GRAND HOTEL & SPA",
    addressLine1: "123 BEACH ROAD",
    addressLine2: "WATERFRONT DISTRICT",
    city: "CAPE TOWN",
    postalCode: "8001",
    primaryPhone: "021 123 4567",
    secondaryPhone: "082 987 6543",
    email: "info@grandhotel.co.za",
    website: "www.grandhotel.co.za",
    registrationNumber: "REG123456",
    vatNumber: "VAT456789",
    logoUrl: "",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.uid) {
      loadPropertyInfo();
    }
  }, [user]);

  useEffect(() => {
    const fetchPropertyInfo = async () => {
      if (!user?.uid) return;

      try {
        const db = getFirestore();
        const docRef = doc(db, "users", user.uid, "settings", "propertyInfo");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setPropertyInfo(docSnap.data());
        } else {
          console.log("No property info found");
        }
      } catch (error) {
        console.error("Error fetching property info:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyInfo();
  }, [user]);

  const loadPropertyInfo = async () => {
    if (!user?.uid) return;

    try {
      const db = getFirestore();
      const docRef = doc(db, "users", user.uid, "settings", "propertyInfo");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setPropertyInfo(docSnap.data());
      }
    } catch (error) {
      console.error("Error loading property info:", error);
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
      setPropertyInfo((prev) => ({ ...prev, uploading: true }));

      // ✅ Upload to Cloudflare R2 (Worker handles userId)
      const logoUrl = await uploadLogoToR2(file, authUser);

      setPropertyInfo((prev) => ({
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
      setPropertyInfo((prev) => ({ ...prev, uploading: false }));
    }
  };

  const handleSavePropertyInfo = async () => {
    if (!user?.uid) return;

    try {
      const db = getFirestore();
      const docRef = doc(db, "users", user.uid, "settings", "propertyInfo");
      await setDoc(docRef, propertyInfo);
      alert("Property information saved successfully!");
      setShowSettings(false);
    } catch (error) {
      console.error("Error saving property info:", error);
      alert("Failed to save property information");
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
    type: "Room Charge",
  });

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const vat = subtotal * 0.15;
  const total = subtotal + vat;

  // Load payment status when invoice changes
  const loadPaymentStatus = async () => {
    if (!user?.uid || !invoiceId) {
      setPaymentStatus({
        totalPaid: 0,
        balanceDue: total,
        status: "pending",
      });
      return;
    }

    try {
      const db = getFirestore();
      const invoiceDoc = await getDoc(
        doc(db, "users", user.uid, "invoices", invoiceId),
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

  useEffect(() => {
    loadPaymentStatus();
  }, [invoiceId, user?.uid]);

  useEffect(() => {
    if (!invoiceId) {
      setPaymentStatus({
        totalPaid: 0,
        balanceDue: total,
        status: "pending",
      });
    }
  }, [total, invoiceId]);

  // Handle Process Payment
  const handleProcessPayment = async () => {
    if (!invoiceId || !user?.uid) {
      alert("Please save the invoice before processing payment");
      return;
    }

    try {
      const db = getFirestore();
      const invoiceDoc = await getDoc(
        doc(db, "users", user.uid, "invoices", invoiceId),
      );

      if (invoiceDoc.exists()) {
        const invoiceData = invoiceDoc.data();
        setSelectedInvoiceForPayment({
          id: invoiceId,
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

  // Handle Payment Complete
  const handlePaymentComplete = () => {
    loadSavedInvoices();
    loadPaymentStatus();
    setShowPaymentModal(false);
  };

  const buildInvoicePayload = (numberToUse) => ({
    invoiceNumber: numberToUse,
    locked: true,
    status: "pending",

    dates: {
      invoiceDate: new Date().toISOString(),
      checkInDate,
      checkOutDate,
    },

    guest: {
      name: guestName,
      email: guestEmail,
      phone: guestPhone,
      address: guestAddress,
      guestId,
      dateOfBirth: guestDOB,
      nationality: guestNationality,
      idType,
      idNumber,
    },

    booking: {
      roomNumber,
      roomType,
      checkInDate,
      checkOutDate,
      numberOfGuests,
      numberOfNights,
      specialRequests,
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

    try {
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

      // Automatically create check-in from invoice if enabled
      if (autoCreateCheckIn && !invoiceId) {
        // Only on new invoices
        const checkInCreated = await createCheckInFromInvoice(
          user.uid,
          invoiceData,
        );
        if (checkInCreated) {
          alert("Invoice saved and check-in created successfully!");
        } else {
          alert("Invoice saved but failed to create check-in");
        }
      } else {
        alert("Invoice saved and locked");
      }

      loadSavedInvoices();
    } catch (error) {
      console.error("Error saving invoice:", error);
      alert("Failed to save invoice");
    }
  };

  const handleNewInvoice = () => {
    setInvoiceId(null);
    setInvoiceNumber("");
    setGuestName("John Smith");
    setGuestId("GST-2026-1234");
    setGuestEmail("john.smith@example.com");
    setGuestPhone("082 123 4567");
    setGuestAddress("456 Oak Street, Cape Town, 8001");
    setGuestDOB("1985-05-15");
    setGuestNationality("South African");
    setIdType("ID Document");
    setIdNumber("8505155678901");
    setRoomNumber("205");
    setRoomType("Deluxe Double Room");
    setCheckInDate("2026-01-10");
    setCheckOutDate("2026-01-15");
    setNumberOfGuests("2");
    setNumberOfNights("5");
    setSpecialRequests("");
    setItems([]);

    const loadNewNumber = async () => {
      if (user?.uid) {
        const nextInvoice = await generateInvoiceNumber(user.uid);
        setInvoiceNumber(nextInvoice);
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
  documentType === "quote" && invoiceId && {
    label: "Convert to Invoice", icon: FileText,
    className: "flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-sm font-semibold rounded-lg hover:from-purple-700 transition-colors shadow-sm whitespace-nowrap"
  },
  { label: "Print",    icon: Printer,  onClick: handlePrint,        variant: "secondary" },
  { label: "New",      icon: Plus,     onClick: handleNewInvoice,
    className: "flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-sm font-semibold rounded-lg hover:from-emerald-700 transition-colors shadow-sm whitespace-nowrap" },
  { label: "Send",     icon: Send,
    className: "flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold rounded-lg hover:from-blue-700 transition-colors shadow-sm whitespace-nowrap" },
  { label: "Save PDF", icon: Download, onClick: handleSavePDF,
    className: "flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-600 to-orange-700 text-white text-sm font-semibold rounded-lg hover:from-orange-700 transition-colors shadow-sm whitespace-nowrap" },
  { label: "Save",     icon: Save,     onClick: handleSaveInvoice,
    className: "flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-600 to-amber-700 text-white text-sm font-semibold rounded-lg hover:from-amber-700 transition-colors shadow-sm whitespace-nowrap" },
  { label: "Logout",   icon: LogOut,   onClick: handleLogout,
    className: "flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-semibold rounded-lg hover:from-red-700 transition-colors shadow-sm whitespace-nowrap" },
].filter(Boolean);

const mobileDashboardActions = [
  documentType === "quote" && invoiceId && {
    label: "To Invoice", icon: FileText,
    className: "flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg text-xs font-semibold shadow-lg transition-all active:scale-95 whitespace-nowrap"
  },
  { label: "Save",  icon: Save,     onClick: handleSaveInvoice,
    className: "flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-stone-600 to-stone-700 text-white rounded-lg text-xs font-semibold shadow-lg transition-all active:scale-95 whitespace-nowrap" },
  { label: "Send",  icon: Send,  
    className: "flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg text-xs font-semibold shadow-lg transition-all active:scale-95 whitespace-nowrap" },
  { label: "PDF",   icon: Download, onClick: handleSavePDF,
    className: "flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg text-xs font-semibold shadow-lg transition-all active:scale-95 whitespace-nowrap" },
  { label: "Print", icon: Printer,  onClick: handlePrint,
    className: "flex items-center gap-1.5 px-3 py-2 bg-white border-2 border-slate-200 text-slate-700 rounded-lg text-xs font-semibold shadow-sm transition-all active:scale-95 whitespace-nowrap" },
].filter(Boolean);
 
  return (
    <div className="flex h-screen bg-gray-300 overflow-hidden">
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
              className="p-2 text-slate-400 hover:text-white hover:bg-blue-600/80 rounded-lg transition-all duration-200 w-10 h-10 flex items-center justify-center group"
              title="Property Overview"
            >
              <TrendingUp className="w-5 h-5" />
            </button>

            <button
              className="p-2 text-slate-400 hover:text-white hover:bg-blue-600/80 rounded-lg transition-all duration-200 w-10 h-10 flex items-center justify-center group"
              title="Invoices"
            >
              <Receipt className="w-5 h-5" />
            </button>

            <button
              className="p-2 text-slate-400 hover:text-white hover:bg-blue-600/80 rounded-lg transition-all duration-200 w-10 h-10 flex items-center justify-center group"
              title="Guests"
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
              title="Reservations"
            >
              <Calendar className="w-5 h-5" />
            </button>

            <button
              className="p-2 text-slate-400 hover:text-white hover:bg-blue-600/80 rounded-lg transition-all duration-200 w-10 h-10 flex items-center justify-center group"
              title="Room Management"
            >
              <Bed className="w-5 h-5" />
            </button>

            <button
              onClick={() => setShowCheckInOutModal(true)}
              className="p-2 text-slate-400 hover:text-white hover:bg-blue-600/80 rounded-lg transition-all duration-200 w-10 h-10 flex items-center justify-center group"
              title="Check-In/Out"
            >
              <DoorOpen className="w-5 h-5" />
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
              title="Analytics"
            >
              <BarChart3 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* User Icon at Bottom */}
        <div className="absolute bottom-4 md:bottom-6 left-0 right-0 flex justify-center">
          <div className="relative group">
            <div className="absolute inset-0 rounded-full opacity-50 group-hover:opacity-100 blur-md transition-opacity duration-300"></div>
            <div className="relative w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-full flex items-center justify-center ring-2 ring-cyan-700 shadow-lg group-hover:ring-4 group-hover:ring-cyan-500/50 transition-all duration-300">
              <img src={propertyInfo.logoUrl} alt="" />
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Sidebar (Full Width) */}
      <div
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed z-50 w-64 bg-gradient-to-b from-slate-900 to-slate-800 border-r border-slate-700 transition-transform duration-300 h-full print:hidden shadow-2xl overflow-y-auto`}
      >
        <div className="p-4 md:p-6">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <div className="flex items-center space-x-3 min-w-0">
              <img
                src={logo}
                alt="Business Logo"
                className="w-16 h-12 object-contain rounded-lg flex-shrink-0"
              />
            </div>
            {/* Close Button */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-200 flex-shrink-0"
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
              <Settings className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium truncate">Settings</span>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-700/50">
              <div className="flex items-center space-x-3 px-3 py-2.5 text-slate-300 hover:text-white hover:bg-blue-600/20 hover:border-l-4 hover:border-blue-500 rounded-lg cursor-pointer transition-all duration-200">
                <TrendingUp className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium truncate">
                  Property Overview
                </span>
              </div>

              {/* Invoices Section */}
              <div className="mt-2">
                <div className="flex items-center justify-between px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200">
                  <div className="flex items-center space-x-3 min-w-0">
                    <Receipt className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm font-medium truncate">
                      Invoices
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 flex-shrink-0" />
                </div>

                <div className="ml-4 mt-1 space-y-1 border-l-2 border-slate-700/50 pl-4">
                  <div
                    onClick={() => {
                      handleNewInvoice();
                      setSidebarOpen(false);
                      setActiveView("invoice");
                    }}
                    className="px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700/30 rounded-lg cursor-pointer transition-all duration-200 truncate"
                  >
                    Create Invoice
                  </div>
                  <div
                    onClick={() => {
                      setShowInvoicesList(!showInvoicesList);
                      setSidebarOpen(false);
                    }}
                    className="px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700/30 rounded-lg cursor-pointer transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate">All Invoices</span>
                      <span className="text-blue-300 px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ml-2">
                        {savedInvoices.length}
                      </span>
                    </div>
                  </div>
                  <div className="px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700/30 rounded-lg cursor-pointer transition-all duration-200">
                    <div className="flex items-center justify-between">
                      <span className="truncate">Pending Payment</span>
                      <span className="bg-amber-600/30 text-amber-300 px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ml-2">
                        0
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Guests Section */}
              <div className="mt-2">
                <div className="flex items-center justify-between px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200">
                  <div className="flex items-center space-x-3 min-w-0">
                    <Users className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm font-medium truncate">Guests</span>
                  </div>
                  <ChevronDown className="w-4 h-4 flex-shrink-0" />
                </div>

                <div className="ml-4 mt-1 space-y-1 border-l-2 border-slate-700/50 pl-4">
                  <div
                    onClick={handleAddNewGuest}
                    className="px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700/30 rounded-lg cursor-pointer transition-all duration-200 truncate"
                  >
                    Add Guest
                  </div>
                  <div
                    onClick={() => {
                      setShowGuestsListModal(true);
                      setSidebarOpen(false);
                    }}
                    className="px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700/30 rounded-lg cursor-pointer transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate">All Guests</span>
                      <span className="text-blue-300 px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ml-2">
                        {savedGuests.length}
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
                <FileText className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium truncate">
                  Invoice Templates
                </span>
              </div>

              <div className="flex items-center space-x-3 px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200">
                <Calendar className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium truncate">
                  Reservations
                </span>
              </div>

              <div className="flex items-center space-x-3 px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200">
                <Bed className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium truncate">
                  Room Management
                </span>
              </div>

              <div
                onClick={() => setShowCheckInOutModal(true)}
                className="flex items-center space-x-3 px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200"
              >
                <DoorOpen className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium truncate">
                  Check-In/Out
                </span>
              </div>

              <div className="flex items-center justify-between px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200">
                <div className="flex items-center space-x-3 min-w-0">
                  <CreditCard className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-medium truncate">Payments</span>
                </div>
                <ChevronDown className="w-4 h-4 flex-shrink-0" />
              </div>

              <div className="flex items-center justify-between px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200">
                <div className="flex items-center space-x-3 min-w-0">
                  <FileBarChart className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-medium truncate">Reports</span>
                </div>
                <ChevronDown className="w-4 h-4 flex-shrink-0" />
              </div>

              <div className="flex items-center justify-between px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200">
                <div className="flex items-center space-x-3 min-w-0">
                  <BarChart3 className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-medium truncate">
                    Analytics
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 flex-shrink-0" />
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
                  src={propertyInfo.logoUrl}
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
        className={`flex-1 transition-all duration-300 ${sidebarOpen ? "ml-0 lg:ml-72" : "ml-2 md:ml-20"}`}
      >
        <div className="flex flex-col h-full">
               <AppHeader
  actions={headerActions}
  mobileActions={mobileDashboardActions}
  onSettingsOpen={() => setShowSettings(true)}
/>
   

          {/* Main Content Area - Now properly scrollable */}
          <div className="flex-1 overflow-y-auto p-3 md:p-4 lg:p-6">
            {/* Property Settings Modal */}
            {showSettings && (
             <BusinessSettingsModal onClose={() => setShowSettings(false)} />
            )}

            <GuestsListModal
              showModal={showGuestsListModal}
              setShowModal={setShowGuestsListModal}
              guests={guests}
              onLoadGuest={loadGuest}
              onEditGuest={handleEditGuest}
              onAddNewGuest={handleAddNewGuest}
            />

            <GuestModal
              showModal={showGuestModal}
              setShowModal={setShowGuestModal}
              existingGuest={selectedGuest}
              onGuestSaved={handleGuestSaved}
            />
            <CheckInOutModal
              showModal={showCheckInOutModal}
              setShowModal={setShowCheckInOutModal}
              user={user}
            />

            {/* Payment Processor Modal */}
            {showPaymentModal && selectedInvoiceForPayment && (
              <PaymentProcessor
                showModal={showPaymentModal}
                setShowModal={setShowPaymentModal}
                invoice={selectedInvoiceForPayment}
                onPaymentComplete={handlePaymentComplete}
                user={user}
                businessInfo={propertyInfo}
              />
            )}

            {/* Saved Invoices List Modal */}
            {showInvoicesList && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-3 md:p-4">
                <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
                  <div className="p-3 md:p-4 border-b flex items-center justify-between flex-shrink-0">
                    <h2 className="text-lg md:text-xl font-semibold">
                      Saved Invoices
                    </h2>
                    <button
                      onClick={() => setShowInvoicesList(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="overflow-auto p-3 md:p-4">
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
                            className="border rounded-lg p-3 md:p-4 hover:bg-gray-800 cursor-pointer transition-colors"
                          >
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                              <div className="min-w-0">
                                <div className="font-semibold text-base md:text-lg truncate">
                                  {invoice.invoiceNumber || "N/A"}
                                </div>
                                <div className="text-sm text-gray-600 mt-1 truncate">
                                  Guest: {invoice.guest?.name || "N/A"}
                                </div>
                                <div className="text-sm text-gray-600 truncate">
                                  Room: {invoice.booking?.roomNumber || "N/A"} -{" "}
                                  {invoice.booking?.roomType || "N/A"}
                                </div>
                                <div className="text-sm text-gray-600 truncate">
                                  Check-in:{" "}
                                  {invoice.booking?.checkInDate || "N/A"}
                                </div>
                              </div>
                              <div className="text-left sm:text-right flex-shrink-0">
                                <div className="text-lg font-semibold text-blue-600">
                                  R{invoice.totals?.total?.toFixed(2) || "0.00"}
                                </div>
                                {invoice.totals?.paid > 0 && (
                                  <div className="text-sm text-emerald-600 font-semibold">
                                    Paid: R{invoice.totals.paid.toFixed(2)}
                                  </div>
                                )}
                                {invoice.totals?.due > 0 && (
                                  <div className="text-sm text-rose-600 font-semibold">
                                    Due: R{invoice.totals.due.toFixed(2)}
                                  </div>
                                )}
                                <div className="text-sm text-gray-500">
                                  {invoice.dates?.invoiceDate
                                    ? new Date(
                                        invoice.dates.invoiceDate,
                                      ).toLocaleDateString("en-ZA")
                                    : "N/A"}
                                </div>
                                <div
                                  className={`text-xs mt-1 px-2 py-1 rounded inline-block ${
                                    invoice.status === "paid"
                                      ? "bg-green-100 text-green-700"
                                      : invoice.status === "partially_paid"
                                        ? "bg-amber-100 text-amber-700"
                                        : invoice.status === "pending"
                                          ? "bg-blue-100 text-blue-700"
                                          : "bg-gray-100 text-gray-700"
                                  }`}
                                >
                                  {invoice.status === "paid"
                                    ? "Paid"
                                    : invoice.status === "partially_paid"
                                      ? "Partial"
                                      : "Pending"}
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
                <button
                  onClick={() => setShowInvoice(!showInvoice)}
                  className="lg:hidden w-full mb-4 flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 text-gray-800 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FileText className="w-5 h-5" />
                  {showInvoice ? "Hide Invoice" : "View Invoice"}
                </button>

                <div className="grid grid-cols-1 gap-4 md:gap-6">
                  <div
                    className={`${
                      showInvoice ? "hidden" : "block"
                    } space-y-4 md:space-y-6 lg:block print:hidden`}
                  >
                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm pt-2 sm:pt-6">
                      <div className="flex border-b border-slate-200">
                        <button
                          onClick={() => setInputMode("manual")}
                          className={`flex-1 px-4 md:px-6 py-3 text-sm font-medium transition-colors ${
                            inputMode === "manual"
                              ? "bg-white text-blue-600 border-b-2 border-blue-600"
                              : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          📝 Manual Entry
                        </button>
                        <button
                          onClick={() => setInputMode("ai")}
                          className={`flex-1 px-4 md:px-6 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
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
                      <div className="p-4 md:p-6">
                        {inputMode === "ai" ? (
                          <HotelAIExtractor
                            onDataExtracted={handleAIDataExtracted}
                            documentType={documentType}
                          />
                        ) : null}
                      </div>
                    </div>
                    {inputMode === "manual" && (
                      <>
                        {/* Payment Status Summary Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                          <div className="bg-white p-3 md:p-4 rounded-lg border border-gray-200">
                            <div className="text-xs md:text-sm text-gray-500 mb-1">
                              Invoice Amount
                            </div>
                            <div className="text-xl md:text-2xl font-semibold text-blue-600">
                              R{total.toFixed(2)}
                            </div>
                          </div>
                          <div
                            className={`p-3 md:p-4 rounded-lg border transition-all ${
                              paymentStatus.totalPaid > 0
                                ? "bg-emerald-50 border-emerald-200"
                                : "bg-white border-gray-200"
                            }`}
                          >
                            <div
                              className={`text-xs md:text-sm mb-1 ${
                                paymentStatus.totalPaid > 0
                                  ? "text-emerald-700"
                                  : "text-gray-500"
                              }`}
                            >
                              Paid
                            </div>
                            <div
                              className={`text-xl md:text-2xl font-semibold ${
                                paymentStatus.totalPaid > 0
                                  ? "text-emerald-600"
                                  : "text-gray-600"
                              }`}
                            >
                              R{paymentStatus.totalPaid.toFixed(2)}
                            </div>
                          </div>
                          <div
                            className={`p-3 md:p-4 rounded-lg border transition-all ${
                              paymentStatus.balanceDue <= 0
                                ? "bg-emerald-50 border-emerald-200"
                                : paymentStatus.totalPaid > 0
                                  ? "bg-amber-50 border-amber-200"
                                  : "bg-rose-50 border-rose-200"
                            }`}
                          >
                            <div
                              className={`text-xs md:text-sm mb-1 ${
                                paymentStatus.balanceDue <= 0
                                  ? "text-emerald-700"
                                  : paymentStatus.totalPaid > 0
                                    ? "text-amber-700"
                                    : "text-rose-700"
                              }`}
                            >
                              Balance Due
                            </div>
                            <div
                              className={`text-xl md:text-2xl font-semibold ${
                                paymentStatus.balanceDue <= 0
                                  ? "text-emerald-600"
                                  : paymentStatus.totalPaid > 0
                                    ? "text-amber-600"
                                    : "text-rose-600"
                              }`}
                            >
                              R{paymentStatus.balanceDue.toFixed(2)}
                            </div>
                          </div>
                        </div>

                        {/* Payment Status Banner */}
                        {invoiceId && (
                          <div
                            className={`p-4 rounded-xl border-2 flex items-center justify-between ${
                              paymentStatus.status === "paid"
                                ? "bg-emerald-50 border-emerald-300"
                                : paymentStatus.status === "partially_paid"
                                  ? "bg-amber-50 border-amber-300"
                                  : "bg-rose-50 border-rose-300"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {paymentStatus.status === "paid" ? (
                                <>
                                  <div className="w-10 h-10 bg-emerald-200 rounded-full flex items-center justify-center">
                                    <CheckSquare className="w-6 h-6 text-emerald-600" />
                                  </div>
                                  <div>
                                    <div className="font-bold text-emerald-900">
                                      Invoice Fully Paid
                                    </div>
                                    <div className="text-sm text-emerald-700">
                                      Payment complete - Thank you!
                                    </div>
                                  </div>
                                </>
                              ) : paymentStatus.status === "partially_paid" ? (
                                <>
                                  <div className="w-10 h-10 bg-amber-200 rounded-full flex items-center justify-center">
                                    <Wallet className="w-6 h-6 text-amber-600" />
                                  </div>
                                  <div>
                                    <div className="font-bold text-amber-900">
                                      Partial Payment Received
                                    </div>
                                    <div className="text-sm text-amber-700">
                                      R{paymentStatus.totalPaid.toFixed(2)} paid
                                      • R{paymentStatus.balanceDue.toFixed(2)}{" "}
                                      remaining
                                    </div>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="w-10 h-10 bg-rose-200 rounded-full flex items-center justify-center">
                                    <CreditCard className="w-6 h-6 text-rose-600" />
                                  </div>
                                  <div>
                                    <div className="font-bold text-rose-900">
                                      Payment Pending
                                    </div>
                                    <div className="text-sm text-rose-700">
                                      Full amount due: R
                                      {paymentStatus.balanceDue.toFixed(2)}
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>

                            {paymentStatus.status !== "paid" && (
                              <button
                                onClick={handleProcessPayment}
                                className="px-4 py-2 bg-white border-2 border-current rounded-lg font-bold hover:bg-opacity-90 transition-all flex items-center gap-2"
                              >
                                <CreditCard className="w-4 h-4" />
                                Record Payment
                              </button>
                            )}
                          </div>
                        )}

                        {inputMode === "manual" && (
                          <HospitalityMultiStepForm
                            // Guest Info Props
                            guestName={guestName}
                            setGuestName={setGuestName}
                            guestId={guestId}
                            setGuestId={setGuestId}
                            guestEmail={guestEmail}
                            setGuestEmail={setGuestEmail}
                            guestPhone={guestPhone}
                            setGuestPhone={setGuestPhone}
                            guestAddress={guestAddress}
                            setGuestAddress={setGuestAddress}
                            guestDOB={guestDOB}
                            setGuestDOB={setGuestDOB}
                            guestNationality={guestNationality}
                            setGuestNationality={setGuestNationality}
                            idType={idType}
                            setIdType={setIdType}
                            idNumber={idNumber}
                            setIdNumber={setIdNumber}
                            // Booking Info Props
                            roomNumber={roomNumber}
                            setRoomNumber={setRoomNumber}
                            roomType={roomType}
                            setRoomType={setRoomType}
                            checkInDate={checkInDate}
                            setCheckInDate={setCheckInDate}
                            checkOutDate={checkOutDate}
                            setCheckOutDate={setCheckOutDate}
                            numberOfGuests={numberOfGuests}
                            setNumberOfGuests={setNumberOfGuests}
                            numberOfNights={numberOfNights}
                            setNumberOfNights={setNumberOfNights}
                            specialRequests={specialRequests}
                            setSpecialRequests={setSpecialRequests}
                            // Modal Props
                            showGuestsListModal={showGuestsListModal}
                            setShowGuestsListModal={setShowGuestsListModal}
                            // Items Props
                            items={items}
                            newItem={newItem}
                            setNewItem={setNewItem}
                            handleAddItem={handleAddItem}
                          />
                        )}

                        <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h2 className="text-base md:text-lg font-semibold">
                              Terms & Conditions
                            </h2>
                          </div>

                          <div className="space-y-3 text-sm">
                            <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b gap-1">
                              <span className="text-gray-600">
                                Payment Terms:
                              </span>
                              <span className="font-medium">
                                Due upon check-out
                              </span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b gap-1">
                              <span className="text-gray-600">
                                Cancellation Policy:
                              </span>
                              <span className="font-medium">
                                48 hours notice
                              </span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between py-2 gap-1">
                              <span className="text-gray-600">
                                Check-in / Check-out:
                              </span>
                              <span className="font-medium">
                                2:00 PM / 11:00 AM
                              </span>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Invoice Preview/Print Section */}
                  <div
                    id="print-area"
                    className={`${!showInvoice ? "hidden lg:block" : "block"} mx-auto bg-white print:block w-full`}
                    style={{ maxWidth: "210mm" }}
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

                        {/* Use Template Renderer instead of hardcoded invoice */}
                        <TemplateRenderer
                          templateId={selectedTemplate}
                          businessInfo={propertyInfo}
                          loading={loading}
                          jobCardNumber={invoiceNumber}
                          customerName={guestName}
                          customerEmail={guestEmail}
                          customerPhone={guestPhone}
                          customerAddress={guestAddress}
                          guestId={guestId}
                          guestDOB={guestDOB}
                          guestNationality={guestNationality}
                          idType={idType}
                          idNumber={idNumber}
                          roomNumber={roomNumber}
                          roomType={roomType}
                          checkInDate={checkInDate}
                          checkOutDate={checkOutDate}
                          numberOfGuests={numberOfGuests}
                          numberOfNights={numberOfNights}
                          items={items}
                          subtotal={subtotal}
                          vat={vat}
                          total={total}
                          documentType="hospitality"
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

export default HotelDashboard;
