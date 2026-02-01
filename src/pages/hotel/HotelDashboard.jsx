import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { serverTimestamp } from "firebase/firestore";
import logo from '../../assets/img/solidflo-logo.png';
import { getAuth, signOut } from "firebase/auth";
import FinancialOverview from "../FinancialOverview";
import HospitalityMultiStepForm from "./HospitalityMultiStepForm";  
import CheckInOutModal, { createCheckInFromInvoice, createCheckInFromGuest } from './CheckInOutModal';
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
import GuestModal from './GuestModal';
import  uploadLogoToR2 from '../../utils/uploadLogoToR2';
import Templates from "./Templates"; 
import HotelAIExtractor from "./HotelAIExtractor";
import TemplateSelector, { TemplateRenderer } from './TemplateSelector';
import GuestsListModal from './GuestsListModal';
import SignatureStamp from '../SignatureStamp';
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

const HotelDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
const [inputMode, setInputMode] = useState("manual");
const [documentType, setDocumentType] = useState("invoice"); 
const [useAI, setUseAI] = useState(false);
  const [activeTab, setActiveTab] = useState("Invoice");
  const [showInvoice, setShowInvoice] = useState(false);
  const { user } = useAuth();
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceId, setInvoiceId] = useState(null);
  const [savedInvoices, setSavedInvoices] = useState([]);
  const [showInvoicesList, setShowInvoicesList] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showGuestsList, setShowGuestsList] = useState(false);
  const [activeView, setActiveView] = useState("invoice");
  const [savedGuests, setSavedGuests] = useState([]);
  const [activeTemplate, setActiveTemplate] = useState("classic");
  const [showGuestsListModal, setShowGuestsListModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('professional');
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [showCheckInOutModal, setShowCheckInOutModal] = useState(false);
  const [autoCreateCheckIn, setAutoCreateCheckIn] = useState(true);
  const [guests, setGuests] = useState([]);
  const [selectedGuest, setSelectedGuest] = useState(null);
const [stampSettings, setStampSettings] = useState({
   text: "APPROVED",
  color: "#d32f2f",
  showDate: false,
  enabled: false
  });
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
      const q = query(collection(db, "users", user.uid, "guests"), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const guestsData = [];
      
      querySnapshot.forEach((doc) => {
        guestsData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setGuests(guestsData);
    } catch (error) {
      console.error('Error loading guests:', error);
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
  if (extractedData.guest.address) setGuestAddress(extractedData.guest.address);
  if (extractedData.guest.guestId) setGuestId(extractedData.guest.guestId);
  if (extractedData.guest.dateOfBirth) setGuestDOB(extractedData.guest.dateOfBirth);
  if (extractedData.guest.nationality) setGuestNationality(extractedData.guest.nationality);
  if (extractedData.guest.idType) setIdType(extractedData.guest.idType);
  if (extractedData.guest.idNumber) setIdNumber(extractedData.guest.idNumber);

  // Booking info
  if (extractedData.booking.roomNumber) setRoomNumber(extractedData.booking.roomNumber);
  if (extractedData.booking.roomType) setRoomType(extractedData.booking.roomType);
  if (extractedData.booking.checkInDate) setCheckInDate(extractedData.booking.checkInDate);
  if (extractedData.booking.checkOutDate) setCheckOutDate(extractedData.booking.checkOutDate);
  if (extractedData.booking.numberOfGuests) setNumberOfGuests(extractedData.booking.numberOfGuests);
  if (extractedData.booking.numberOfNights) setNumberOfNights(extractedData.booking.numberOfNights);
  if (extractedData.booking.specialRequests) setSpecialRequests(extractedData.booking.specialRequests);

  // Items
  if (extractedData.items && extractedData.items.length > 0) {
    setItems(extractedData.items);
  }

  alert("✅ Hotel booking data extracted and populated successfully!");
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

    setSavedGuests(guests.filter(g => !g._placeholder));
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
        updatedAt: serverTimestamp()
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
      doc(db, "users", user.uid, "invoices", invoiceId)
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
  const [guestAddress, setGuestAddress] = useState("456 Oak Street, Cape Town, 8001");
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
  const [specialRequests, setSpecialRequests] = useState("Late check-in requested");

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

      setPropertyInfo({ ...propertyInfo, logoUrl: downloadURL });
      alert("Logo uploaded successfully!");
    } catch (error) {
      console.error("Error uploading logo:", error);
      alert("Failed to upload logo");
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
        invoiceData
      );
      setInvoiceId(ref.id);
    }

    // Automatically create check-in from invoice if enabled
    if (autoCreateCheckIn && !invoiceId) { // Only on new invoices
      const checkInCreated = await createCheckInFromInvoice(user.uid, invoiceData);
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
        title="Dashboard"
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
  <div className="absolute bottom-4 left-0 right-0 flex justify-center">
    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full ring-2 ring-slate-700 shadow-lg flex items-center justify-center">
      <span className="text-white font-bold text-sm">
        {user?.name?.charAt(0) || "M"}
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
        <span className="text-sm font-medium">Dashboard</span>
      </div>
      <div
        onClick={() => setShowSettings(true)}
        className="flex items-center space-x-3 px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200"
      >
        <Settings className="w-5 h-5" />
        <span className="text-sm font-medium">Settings</span>
      </div>

      <div className="pt-4 mt-4 border-t border-slate-700/50">
        <div className="flex items-center space-x-3 px-3 py-2.5 text-slate-300 hover:text-white hover:bg-blue-600/20 hover:border-l-4 hover:border-blue-500 rounded-lg cursor-pointer transition-all duration-200">
          <TrendingUp className="w-5 h-5" />
          <span className="text-sm font-medium">Property Overview</span>
        </div>

        {/* Invoices Section */}
        <div className="mt-2">
          <div className="flex items-center justify-between px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200">
            <div className="flex items-center space-x-3">
              <Receipt className="w-5 h-5" />
              <span className="text-sm font-medium">Invoices</span>
            </div>
            <ChevronDown className="w-4 h-4" />
          </div>

          <div className="ml-4 mt-1 space-y-1 border-l-2 border-slate-700/50 pl-4">
            <div
              onClick={() => {
                handleNewInvoice();
                setActiveView("invoice");
              }}
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
                <span className=" text-blue-300 px-2 py-0.5 rounded-full text-xs font-semibold">
                  {savedInvoices.length}
                </span>
              </div>
            </div>
            <div className="px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700/30 rounded-lg cursor-pointer transition-all duration-200">
              <div className="flex items-center justify-between">
                <span>Pending Payment</span>
                <span className="bg-amber-600/30 text-amber-300 px-2 py-0.5 rounded-full text-xs font-semibold">
                  0
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Guests Section */}
        <div className="mt-2">
          <div className="flex items-center justify-between px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200">
            <div className="flex items-center space-x-3">
              <Users className="w-5 h-5" />
              <span className="text-sm font-medium">Guests</span>
            </div>
            <ChevronDown className="w-4 h-4" />
          </div>

          <div className="ml-4 mt-1 space-y-1 border-l-2 border-slate-700/50 pl-4">
            <div
              onClick={handleAddNewGuest}
              className="px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700/30 rounded-lg cursor-pointer transition-all duration-200"
            >
              Add Guest
            </div>
            <div
              onClick={() => setShowGuestsListModal(true)}
              className="px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700/30 rounded-lg cursor-pointer transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <span>All Guests</span>
                <span className=" text-blue-300 px-2 py-0.5 rounded-full text-xs font-semibold">
                  {savedGuests.length}
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
          <Calendar className="w-5 h-5" />
          <span className="text-sm font-medium">Reservations</span>
        </div>

        <div className="flex items-center space-x-3 px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200">
          <Bed className="w-5 h-5" />
          <span className="text-sm font-medium">Room Management</span>
        </div>

        <div
          onClick={() => setShowCheckInOutModal(true)}
          className="flex items-center space-x-3 px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200"
        >
          <DoorOpen className="w-5 h-5" />
          <span className="text-sm font-medium">Check-In/Out</span>
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
          {user?.name?.charAt(0) || "M"}
        </span>
      </div>
      <div className="flex-1">
        <div className="text-sm font-semibold text-white">
          {user?.name || "Manager"}
        </div>
        <div className="text-xs text-slate-400">
          {user?.email || "manager@hotel.com"}
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
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
      <div className="flex-1 overflow-auto">
        <div className="sticky top-0 z-40 flex flex-col">
        <div className="bg-gray-300 border-red-200 px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 lg:space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
              
              </button>
             
              <h1 className="text-base lg:text-xl font-semibold">
                Invoice #{invoiceNumber || "— not saved yet —"}
              </h1>
              
            </div>

            <div className="hidden lg:flex items-center space-x-3 print:hidden">
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-800">
                <CheckSquare className="w-4 h-4" />
                <span>Mark Paid</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-800">
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </button>
              <button
                onClick={handleSaveInvoice}
                className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-800 rounded-lg hover:bg-blue-700"
              >
                Save Invoice
              </button>

              <button
                onClick={handleNewInvoice}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-gray-800 rounded-lg hover:bg-green-700"
              >
                <Plus className="w-4 h-4" />
                New
              </button>

              <button className="flex items-center space-x-2 px-4 py-2 bg-gray-50 text-gray-800 rounded-lg hover:bg-blue-700">
                <Send className="w-4 h-4" />
                <span>Send</span>
              </button>
              <button
                onClick={handleSavePDF}
                className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-800 rounded-lg hover:bg-blue-700"
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

            <button
              onClick={handleLogout}
              className="lg:hidden p-2 bg-red-600 text-gray-800 rounded-lg hover:bg-red-700 transition-colors print:hidden"
            >
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>

        {/* Mobile action buttons */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 print:hidden">
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-800 whitespace-nowrap text-sm">
              <CheckSquare className="w-4 h-4" />
              <span>Mark Paid</span>
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
              onClick={handleSave}
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

        {/* Tabs */}
        <div className="bg-gray-50 border-b border-gray-200 px-4 lg:px-6 overflow-x-auto print:hidden">
          <div className="flex space-x-4 lg:space-x-8 min-w-max">
            {["Invoice", "Guest Details", "Booking", "Notes"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 border-b-2 ${
                  activeTab === tab
                    ? "border-blue-400 text-gray-800"
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
          {/* Property Settings Modal */}
          {showSettings && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                <div className="p-4 border-b flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Property Settings</h2>
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
                        Property Logo
                      </label>
                      <div className="flex items-center gap-4">
                        {propertyInfo.logoUrl ? (
                          <img
                            src={propertyInfo.logoUrl}
                            alt="Property Logo"
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
                            {propertyInfo.logoUrl ? "Change Logo" : "Upload Logo"}
                          </label>
                          <p className="text-xs text-gray-500 mt-2">
                            Recommended: Square image, max 5MB
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Property Name
                      </label>
                      <input
                        type="text"
                        value={propertyInfo.propertyName}
                        onChange={(e) =>
                          setPropertyInfo({
                            ...propertyInfo,
                            propertyName: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border rounded-lg"
                        placeholder="Grand Hotel & Spa"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Registration Number
                      </label>
                      <input
                        type="text"
                        value={propertyInfo.registrationNumber}
                        onChange={(e) =>
                          setPropertyInfo({
                            ...propertyInfo,
                            registrationNumber: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border rounded-lg"
                        placeholder="REG123456"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        VAT Number
                      </label>
                      <input
                        type="text"
                        value={propertyInfo.vatNumber}
                        onChange={(e) =>
                          setPropertyInfo({
                            ...propertyInfo,
                            vatNumber: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border rounded-lg"
                        placeholder="VAT456789"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Address Line 1
                      </label>
                      <input
                        type="text"
                        value={propertyInfo.addressLine1}
                        onChange={(e) =>
                          setPropertyInfo({
                            ...propertyInfo,
                            addressLine1: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border rounded-lg"
                        placeholder="123 BEACH ROAD"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Address Line 2
                      </label>
                      <input
                        type="text"
                        value={propertyInfo.addressLine2}
                        onChange={(e) =>
                          setPropertyInfo({
                            ...propertyInfo,
                            addressLine2: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border rounded-lg"
                        placeholder="WATERFRONT DISTRICT"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          City
                        </label>
                        <input
                          type="text"
                          value={propertyInfo.city}
                          onChange={(e) =>
                            setPropertyInfo({
                              ...propertyInfo,
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
                          value={propertyInfo.postalCode}
                          onChange={(e) =>
                            setPropertyInfo({
                              ...propertyInfo,
                              postalCode: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border rounded-lg"
                          placeholder="8001"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Primary Phone *
                      </label>
                      <input
                        type="tel"
                        value={propertyInfo.primaryPhone}
                        onChange={(e) =>
                          setPropertyInfo({
                            ...propertyInfo,
                            primaryPhone: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border rounded-lg"
                        placeholder="021 123 4567"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Secondary Phone (Optional)
                      </label>
                      <input
                        type="tel"
                        value={propertyInfo.secondaryPhone}
                        onChange={(e) =>
                          setPropertyInfo({
                            ...propertyInfo,
                            secondaryPhone: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border rounded-lg"
                        placeholder="082 987 6543"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={propertyInfo.email}
                        onChange={(e) =>
                          setPropertyInfo({
                            ...propertyInfo,
                            email: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border rounded-lg"
                        placeholder="info@grandhotel.co.za"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Website
                      </label>
                      <input
                        type="text"
                        value={propertyInfo.website}
                        onChange={(e) =>
                          setPropertyInfo({
                            ...propertyInfo,
                            website: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border rounded-lg"
                        placeholder="www.grandhotel.co.za"
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
                            value={propertyInfo.bankName}
                            onChange={(e) =>
                              setPropertyInfo({
                                ...propertyInfo,
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
                            value={propertyInfo.accountHolder}
                            onChange={(e) =>
                              setPropertyInfo({
                                ...propertyInfo,
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
                            value={propertyInfo.accountNumber}
                            onChange={(e) =>
                              setPropertyInfo({
                                ...propertyInfo,
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
                            value={propertyInfo.branchCode}
                            onChange={(e) =>
                              setPropertyInfo({
                                ...propertyInfo,
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
 <div className="border-t pt-6 mt-6">
  <h3 className="text-lg font-semibold mb-4">⚙️ Check-In Settings</h3>
  
  <div className="space-y-4">
    <div>
      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={autoCreateCheckIn}
          onChange={(e) => setAutoCreateCheckIn(e.target.checked)}
          className="w-4 h-4 rounded"
        />
        <span className="text-sm font-medium">Automatically create check-in when saving new invoices</span>
      </label>
      <p className="text-xs text-gray-500 mt-1 ml-6">
        When enabled, a pending check-in will be automatically created whenever you save a new invoice with booking details.
      </p>
    </div>
  </div>
</div>
                    <button
                      onClick={handleSavePropertyInfo}
                      className="w-full bg-gray-50 text-gray-800 py-3 rounded-lg hover:bg-blue-700"
                    >
                      Save Property Information
                    </button>
                  </div>
                </div>
              </div>
            </div>
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
                          className="border rounded-lg p-4 hover:bg-gray-800 cursor-pointer transition-colors"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-semibold text-lg">
                                {invoice.invoiceNumber || "N/A"}
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                Guest: {invoice.guest?.name || "N/A"}
                              </div>
                              <div className="text-sm text-gray-600">
                                Room: {invoice.booking?.roomNumber || "N/A"} - {invoice.booking?.roomType || "N/A"}
                              </div>
                              <div className="text-sm text-gray-600">
                                Check-in: {invoice.booking?.checkInDate || "N/A"}
                              </div>
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
            {activeView === "financial-overview" && (
            <FinancialOverview user={user} />
          )}
           {activeView === "templates" && <Templates user={user} />}
                     {activeView === "invoice" && (
                       <>
          <button
            onClick={() => setShowInvoice(!showInvoice)}
            className="lg:hidden w-full mb-4 flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 text-gray-800 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FileText className="w-5 h-5" />
            {showInvoice ? "Hide Invoice" : "View Invoice"}
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div
              className={`${
                showInvoice ? "hidden" : "block"
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
                                          <HotelAIExtractor
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
                  <div className="text-sm text-gray-500 mb-1">Invoice Amount</div>
                  <div className="text-2xl font-semibold text-blue-600">
                    R{total.toFixed(2)}
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="text-sm text-gray-500 mb-1">Nights</div>
                  <div className="text-2xl font-semibold text-green-600">
                    {numberOfNights}
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="text-sm text-gray-500 mb-1">Room</div>
                  <div className="text-lg font-semibold text-gray-700">
                    {roomNumber}
                  </div>
                </div>
              </div>

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

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Terms & Conditions</h2>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Payment Terms:</span>
                    <span className="text-sm font-medium">Due upon check-out</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Cancellation Policy:</span>
                    <span className="text-sm font-medium">48 hours notice</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Check-in / Check-out:</span>
                    <span className="text-sm font-medium">2:00 PM / 11:00 AM</span>
                  </div>
                </div>
              </div>
              </>)}
            </div>

            {/* Invoice Preview/Print Section */}
            <div
  id="print-area"
  className={`${!showInvoice ? "hidden lg:block" : "block"} mx-auto bg-white print:block`}
  style={{ width: "210mm", minHeight: "297mm" }}
>
          {activeView === 'invoice' && (
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
          </>)}
        </div>
      </div>
      </div>
    </div>
  );
};

export default HotelDashboard;