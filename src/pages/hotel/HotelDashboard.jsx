import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import HomeView from "../HomeView";
import BusinessSettingsModal from "../BusinessSettingsModal";
import AppHeader from "../AppHeader";
import SubUserManagement from "../SubUserManagement";
import { serverTimestamp } from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth";
import FinancialOverview from "../FinancialOverview";
import HospitalityMultiStepForm from "./HospitalityMultiStepForm";
import { getFunctions } from "firebase/functions";
import AIInvoiceWindow from "../AIInvoiceWindow";
import CheckInOutModal, { createCheckInFromInvoice } from "./CheckInOutModal";
import {
  getFirestore,
  collection,
  query,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
import { Printer, Download, Sparkles } from "lucide-react";
import { db } from "../../firebase";
import GuestModal from "./GuestModal";
import Templates from "./Templates";
import ServiceMarketplaceView from "../ServiceMarketplaceView";
import ServiceRequestsView from "../ServiceRequestsView";
import PurchaseOrders from "../PurchaseOrders";
import { useLocation } from "react-router-dom";
import HotelAIExtractor from "./HotelAIExtractor";
import TemplateSelector, { TemplateRenderer } from "./TemplateSelector";
import GuestsListModal from "./GuestsListModal";
import PaymentProcessor from "../../components/dashboard/PaymentProcessor";

// ── New sidebar + new pages ────────────────────────────────────────────────
import HotelSidebar   from "./HotelSidebar";
import RoomManagement from "./RoomManagement";
import Reservations   from "./Reservations";
import RestaurantBar  from "./RestaurantBar";

import {
  Eye, Save, Plus, Send, X,
  CreditCard, Receipt, Wallet, DollarSign, CheckSquare,
} from "lucide-react";

// ── Generate invoice number ────────────────────────────────────────────────
const generateInvoiceNumber = async (userId) => {
  const db = getFirestore();
  const year = new Date().getFullYear();
  const q = query(
    collection(db, "users", userId, "invoices"),
    orderBy("createdAt", "desc"),
    limit(1),
  );
  const snapshot = await getDocs(q);
  let lastNumber = 1000;
  if (!snapshot.empty) {
    const match = snapshot.docs[0].data().invoiceNumber?.match(/(\d+)$/);
    if (match) lastNumber = Number(match[1]);
  }
  return `INV-${year}-${String(lastNumber + 1).padStart(4, "0")}`;
};

getFunctions();

const statusBadge = (s) =>
  s === "paid"
    ? "bg-[#dcfce7] text-[#166534]"
    : s === "partially_paid"
    ? "bg-[#fef3c7] text-[#92400e]"
    : "bg-[#dbeafe] text-[#1e40af]";

// ── Main Dashboard ─────────────────────────────────────────────────────────
const HotelDashboard = () => {
  // ── UI state ───────────────────────────────────────────────────────────
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [inputMode, setInputMode] = useState("manual");
  const [documentType, setDocumentType] = useState("invoice");
  const [activeView, setActiveView] = useState("home");
  const [showPreview, setShowPreview] = useState(false);
  const [showInvoicesList, setShowInvoicesList] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showGuestsListModal, setShowGuestsListModal] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [showCheckInOutModal, setShowCheckInOutModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showAIWindow, setShowAIWindow] = useState(false);
  const [autoCreateCheckIn] = useState(true);
  const { user } = useAuth();
  const location = useLocation();

  // ── Document state ─────────────────────────────────────────────────────
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceId, setInvoiceId] = useState(null);
  const [savedInvoices, setSavedInvoices] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("professional");

  // ── Guest state ────────────────────────────────────────────────────────
  const [guests, setGuests] = useState([]);
  const [savedGuests, setSavedGuests] = useState([]);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState(null);

  // ── Guest form fields ──────────────────────────────────────────────────
  const [guestName, setGuestName]           = useState("John Smith");
  const [guestId, setGuestId]               = useState("GST-2026-1234");
  const [guestEmail, setGuestEmail]         = useState("john.smith@example.com");
  const [guestPhone, setGuestPhone]         = useState("082 123 4567");
  const [guestAddress, setGuestAddress]     = useState("456 Oak Street, Cape Town, 8001");
  const [guestDOB, setGuestDOB]             = useState("1985-05-15");
  const [guestNationality, setGuestNationality] = useState("South African");
  const [idType, setIdType]                 = useState("ID Document");
  const [idNumber, setIdNumber]             = useState("8505155678901");
  const [roomNumber, setRoomNumber]         = useState("205");
  const [roomType, setRoomType]             = useState("Deluxe Double Room");
  const [checkInDate, setCheckInDate]       = useState("2026-01-10");
  const [checkOutDate, setCheckOutDate]     = useState("2026-01-15");
  const [numberOfGuests, setNumberOfGuests] = useState("2");
  const [numberOfNights, setNumberOfNights] = useState("5");
  const [specialRequests, setSpecialRequests] = useState("Late check-in requested");

  // ── Items ──────────────────────────────────────────────────────────────
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ description: "", rate: "", qty: "", type: "Room Charge" });

  // ── Payment / stamp ────────────────────────────────────────────────────
  const [paymentStatus, setPaymentStatus] = useState({ totalPaid: 0, balanceDue: 0, status: "pending" });
  const [stampSettings] = useState({ text: "APPROVED", color: "#d32f2f", showDate: false, enabled: false });

  // ── Property info ──────────────────────────────────────────────────────
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

  // Derived totals
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const vat = subtotal * 0.15;
  const total = subtotal + vat;

  // ── Effects ────────────────────────────────────────────────────────────
  useEffect(() => { if (location.state?.activeView) setActiveView(location.state.activeView); }, [location.state]);
  useEffect(() => {
    if (!user?.uid) return;
    generateInvoiceNumber(user.uid).then(setInvoiceNumber);
    loadSavedInvoices();
  }, [user]);
  useEffect(() => {
    const handleResize = () => setSidebarOpen(window.innerWidth >= 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  useEffect(() => { if (user?.uid) { loadPropertyInfo(); loadGuests(); } }, [user]);
  useEffect(() => { loadPaymentStatus(); }, [invoiceId, user?.uid]);
  useEffect(() => {
    if (!invoiceId) setPaymentStatus({ totalPaid: 0, balanceDue: total, status: "pending" });
  }, [total, invoiceId]);

  // ── Loaders ────────────────────────────────────────────────────────────
  const loadPropertyInfo = async () => {
    if (!user?.uid) return;
    try {
      const db = getFirestore();
      const snap = await getDoc(doc(db, "users", user.uid, "settings", "propertyInfo"));
      if (snap.exists()) setPropertyInfo(snap.data());
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const loadGuests = async () => {
    try {
      const q = query(collection(db, "users", user.uid, "guests"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setGuests(list);
      setSavedGuests(list);
    } catch (e) { console.error(e); }
  };

  const loadSavedInvoices = async () => {
    if (!user?.uid) return;
    const db = getFirestore();
    const q = query(collection(db, "users", user.uid, "invoices"), orderBy("createdAt", "desc"), limit(50));
    const snap = await getDocs(q);
    setSavedInvoices(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  const loadPaymentStatus = async () => {
    if (!user?.uid || !invoiceId) {
      setPaymentStatus({ totalPaid: 0, balanceDue: total, status: "pending" });
      return;
    }
    try {
      const snap = await getDoc(doc(db, "users", user.uid, "invoices", invoiceId));
      if (snap.exists()) {
        const d = snap.data();
        setPaymentStatus({ totalPaid: d.totals?.paid || 0, balanceDue: d.totals?.due || d.totals?.total || 0, status: d.status || "pending" });
      }
    } catch (e) { console.error(e); }
  };

  // ── Handlers ───────────────────────────────────────────────────────────
  const handleAddNewGuest = () => { setSelectedGuest(null); setShowGuestModal(true); };
  const handleEditGuest   = (g) => { setSelectedGuest(g); setShowGuestModal(true); };

  const loadGuest = (g) => {
    setGuestName(g.name || "");
    setGuestEmail(g.email || "");
    setGuestPhone(g.phone || "");
    setGuestAddress(g.address || "");
    setGuestId(g.guestId || "");
    setGuestDOB(g.dateOfBirth || "");
    setGuestNationality(g.nationality || "");
    setIdType(g.idType || "ID Document");
    setIdNumber(g.idNumber || "");
  };

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
    setPaymentStatus({ totalPaid: invoice.totals?.paid || 0, balanceDue: invoice.totals?.due || invoice.totals?.total || 0, status: invoice.status || "pending" });
    setActiveView("invoice");
  };

  const handleAIDataExtracted = (data) => {
    if (data.guest?.name)             setGuestName(data.guest.name);
    if (data.guest?.email)            setGuestEmail(data.guest.email);
    if (data.guest?.phone)            setGuestPhone(data.guest.phone);
    if (data.guest?.address)          setGuestAddress(data.guest.address);
    if (data.guest?.guestId)          setGuestId(data.guest.guestId);
    if (data.guest?.dateOfBirth)      setGuestDOB(data.guest.dateOfBirth);
    if (data.guest?.nationality)      setGuestNationality(data.guest.nationality);
    if (data.guest?.idType)           setIdType(data.guest.idType);
    if (data.guest?.idNumber)         setIdNumber(data.guest.idNumber);
    if (data.booking?.roomNumber)     setRoomNumber(data.booking.roomNumber);
    if (data.booking?.roomType)       setRoomType(data.booking.roomType);
    if (data.booking?.checkInDate)    setCheckInDate(data.booking.checkInDate);
    if (data.booking?.checkOutDate)   setCheckOutDate(data.booking.checkOutDate);
    if (data.booking?.numberOfGuests) setNumberOfGuests(data.booking.numberOfGuests);
    if (data.booking?.numberOfNights) setNumberOfNights(data.booking.numberOfNights);
    if (data.booking?.specialRequests)setSpecialRequests(data.booking.specialRequests);
    if (data.items?.length > 0)       setItems(data.items);
    alert("✅ Hotel booking data extracted and populated successfully!");
  };

  const buildInvoicePayload = (num) => ({
    invoiceNumber: num, locked: true,
    status: paymentStatus.status || "pending",
    dates: { invoiceDate: new Date().toISOString(), checkInDate, checkOutDate },
    guest: { name: guestName, email: guestEmail, phone: guestPhone, address: guestAddress, guestId, dateOfBirth: guestDOB, nationality: guestNationality, idType, idNumber },
    booking: { roomNumber, roomType, checkInDate, checkOutDate, numberOfGuests, numberOfNights, specialRequests },
    items,
    totals: { subtotal, vat, total, paid: paymentStatus.totalPaid || 0, due: paymentStatus.balanceDue || total },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const handleSaveInvoice = async () => {
    if (!user?.uid) return;
    const db = getFirestore();
    let num = invoiceNumber;
    if (!invoiceId) { num = await generateInvoiceNumber(user.uid); setInvoiceNumber(num); }
    const data = buildInvoicePayload(num);
    try {
      if (invoiceId) {
        await updateDoc(doc(db, "users", user.uid, "invoices", invoiceId), { ...data, updatedAt: serverTimestamp() });
        alert("Invoice saved and locked");
      } else {
        const ref = await addDoc(collection(db, "users", user.uid, "invoices"), data);
        setInvoiceId(ref.id);
        if (autoCreateCheckIn) {
          const ok = await createCheckInFromInvoice(user.uid, data);
          alert(ok ? "Invoice saved and check-in created!" : "Invoice saved but check-in failed");
        } else {
          alert("Invoice saved and locked");
        }
      }
      loadSavedInvoices();
    } catch (e) { console.error(e); alert("Failed to save invoice"); }
  };

  const handleNewInvoice = () => {
    setInvoiceId(null); setInvoiceNumber("");
    setGuestName("John Smith"); setGuestId("GST-2026-1234");
    setGuestEmail("john.smith@example.com"); setGuestPhone("082 123 4567");
    setGuestAddress("456 Oak Street, Cape Town, 8001"); setGuestDOB("1985-05-15");
    setGuestNationality("South African"); setIdType("ID Document");
    setIdNumber("8505155678901"); setRoomNumber("205");
    setRoomType("Deluxe Double Room"); setCheckInDate("2026-01-10");
    setCheckOutDate("2026-01-15"); setNumberOfGuests("2");
    setNumberOfNights("5"); setSpecialRequests("");
    setItems([]); setPaymentStatus({ totalPaid: 0, balanceDue: 0, status: "pending" });
    if (user?.uid) generateInvoiceNumber(user.uid).then(setInvoiceNumber);
    setActiveView("invoice");
  };

  const handleAddItem = () => {
    if (!newItem.description || !newItem.qty) return;
    const rate = Number(newItem.rate) || 0;
    const qty  = Number(newItem.qty);
    setItems((prev) => [...prev, { description: newItem.description, type: newItem.type || "Room Charge", rate, qty, amount: rate * qty }]);
    setNewItem({ description: "", rate: "", qty: "", type: "Room Charge" });
  };

  const handleProcessPayment = async () => {
    if (!invoiceId || !user?.uid) { alert("Please save the invoice before processing payment"); return; }
    try {
      const snap = await getDoc(doc(db, "users", user.uid, "invoices", invoiceId));
      if (snap.exists()) { setSelectedInvoiceForPayment({ id: invoiceId, ...snap.data() }); setShowPaymentModal(true); }
      else alert("Invoice not found. Please save first.");
    } catch (e) { alert("Failed to load invoice for payment"); }
  };

  const handlePaymentComplete = () => { loadSavedInvoices(); loadPaymentStatus(); setShowPaymentModal(false); };

  const handleSavePDF = async () => {
    if (!user?.uid || !invoiceId) { alert("Please save the invoice before exporting PDF"); return; }
    const snap = await getDoc(doc(db, "users", user.uid, "invoices", invoiceId));
    if (!snap.exists()) { alert("Please save first"); return; }
    const saved = snap.data();
    setInvoiceNumber(saved.invoiceNumber); setItems(saved.items);
    setGuestName(saved.guest.name); setGuestEmail(saved.guest.email);
    setGuestPhone(saved.guest.phone); setGuestAddress(saved.guest.address);
    setRoomNumber(saved.booking.roomNumber); setRoomType(saved.booking.roomType);
    setTimeout(() => window.print(), 300);
  };

  const printStyles = `@media print { * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } html,body { margin:0!important;padding:0!important;width:210mm!important;background:white!important; } body * { visibility:hidden!important; } #print-area,#print-area * { visibility:visible!important; } #print-area { display:block!important;position:absolute!important;left:0!important;top:0!important;width:210mm!important;min-height:297mm!important;margin:0!important;padding:0!important;background:white!important; } @page { size:A4 portrait;margin:0; } }`;

  const handlePrint = () => {
    const s = document.createElement("style");
    s.textContent = printStyles;
    document.head.appendChild(s);
    window.print();
    setTimeout(() => document.head.removeChild(s), 1000);
  };

  const handleLogout = async () => { try { await signOut(getAuth()); } catch (e) { console.error(e); } };

  const templateProps = {
    templateId: selectedTemplate, businessInfo: propertyInfo, loading,
    jobCardNumber: invoiceNumber, customerName: guestName, customerEmail: guestEmail,
    customerPhone: guestPhone, customerAddress: guestAddress,
    guestId, guestDOB, guestNationality, idType, idNumber,
    roomNumber, roomType, checkInDate, checkOutDate, numberOfGuests, numberOfNights,
    items, subtotal, vat, total, documentType: "hospitality",
    showStamp: stampSettings.enabled, stampText: stampSettings.text,
    stampColor: stampSettings.color, showStampDate: stampSettings.showDate,
    paymentStatus,
  };

  const headerActions = [
    { label: "Preview",  icon: Eye,      onClick: () => setShowPreview(true), className: "flex items-center gap-1.5 px-3 py-1.5 bg-[#0f172a] hover:bg-[#1e293b] text-white text-sm font-medium rounded-md transition-colors whitespace-nowrap" },
    { label: "Print",    icon: Printer,  onClick: handlePrint,                className: "flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#e2e8f0] text-[#374151] text-sm font-medium rounded-md transition-colors whitespace-nowrap" },
    { label: "New",      icon: Plus,     onClick: handleNewInvoice,           className: "flex items-center gap-1.5 px-3 py-1.5 bg-[#059669] hover:bg-[#047857] text-white text-sm font-medium rounded-md transition-colors whitespace-nowrap" },
    { label: "Send",     icon: Send,                                          className: "flex items-center gap-1.5 px-3 py-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium rounded-md transition-colors whitespace-nowrap" },
    { label: "Save PDF", icon: Download, onClick: handleSavePDF,             className: "flex items-center gap-1.5 px-3 py-1.5 bg-[#0891b2] hover:bg-[#0e7490] text-white text-sm font-medium rounded-md transition-colors whitespace-nowrap" },
    { label: "Save",     icon: Save,     onClick: handleSaveInvoice,          className: "flex items-center gap-1.5 px-3 py-1.5 bg-[#d97706] hover:bg-[#b45309] text-white text-sm font-medium rounded-md transition-colors whitespace-nowrap" },
  ];

  const mobileDashboardActions = [
    { label: "Save",  icon: Save,     onClick: handleSaveInvoice, className: "flex items-center gap-1.5 px-3 py-2 bg-[#d97706] text-white rounded-md text-xs font-medium active:scale-95 whitespace-nowrap" },
    { label: "Send",  icon: Send,                                 className: "flex items-center gap-1.5 px-3 py-2 bg-[#059669] text-white rounded-md text-xs font-medium active:scale-95 whitespace-nowrap" },
    { label: "PDF",   icon: Download, onClick: handleSavePDF,    className: "flex items-center gap-1.5 px-3 py-2 bg-[#0891b2] text-white rounded-md text-xs font-medium active:scale-95 whitespace-nowrap" },
    { label: "Print", icon: Printer,  onClick: handlePrint,      className: "flex items-center gap-1.5 px-3 py-2 bg-white border border-[#e2e8f0] text-[#374151] rounded-md text-xs font-medium active:scale-95 whitespace-nowrap" },
  ];

  return (
    <div className="h-screen w-full overflow-hidden flex flex-col bg-[#f0f2f5]">
      {/* Print area */}
      <div id="print-area" className="hidden print:block bg-white" style={{ width: "210mm", minHeight: "297mm" }}>
        <TemplateRenderer {...templateProps} />
      </div>

      {/* AI window */}
      {showAIWindow && (
        <AIInvoiceWindow user={user} 
        businessInfo={propertyInfo} 
        documentType={documentType} 
        onExit={() => setShowAIWindow(false)} 
        industry="hotel"
        TemplateRenderer={TemplateRenderer}
        />
      )}

      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* ── New HotelSidebar ────────────────────────────────────────── */}
        <HotelSidebar
          user={user}
          activeView={activeView}
          setActiveView={setActiveView}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          setShowSettings={setShowSettings}
          handleNewInvoice={handleNewInvoice}
          handleAddNewGuest={handleAddNewGuest}
          propertyInfo={propertyInfo}
          savedInvoices={savedInvoices}
          savedGuests={savedGuests}
          setShowInvoicesList={setShowInvoicesList}
          setShowGuestsListModal={setShowGuestsListModal}
          setShowCheckInOutModal={setShowCheckInOutModal}
          handleLogout={handleLogout}
        />

        {/* ── Main content ─────────────────────────────────────────────
            - Mobile (<md):   no margin — sidebar is an overlay
            - md+ collapsed:  ml-16 (icon rail)
            - md+ expanded:   ml-64 (full panel)
        ─────────────────────────────────────────────────────────────── */}
        <div className={`flex-1 overflow-hidden flex flex-col min-h-0 transition-all duration-300 ${sidebarOpen ? "md:ml-2" : "md:ml-4"}`}>
          <AppHeader
            actions={headerActions}
            mobileActions={mobileDashboardActions}
            onSettingsOpen={() => setShowSettings(true)}
          />

          {/* ── Modals ────────────────────────────────────────────────── */}
          {showSettings && <BusinessSettingsModal onClose={() => setShowSettings(false)} />}

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
            onGuestSaved={loadGuests}
          />
          <CheckInOutModal
            showModal={showCheckInOutModal}
            setShowModal={setShowCheckInOutModal}
            user={user}
          />
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

          {/* ── Invoices list modal ───────────────────────────────────── */}
          {showInvoicesList && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden border border-[#e2e8f0]">
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0] bg-[#f8fafc]">
                  <div>
                    <h2 className="text-base font-semibold text-[#1e293b]">All Invoices</h2>
                    <p className="text-xs text-[#64748b] mt-0.5">{savedInvoices.length} records</p>
                  </div>
                  <button onClick={() => setShowInvoicesList(false)} className="p-1.5 text-[#64748b] hover:text-[#1e293b] hover:bg-[#e2e8f0] rounded-lg transition-all">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {savedInvoices.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16">
                      <Receipt className="w-10 h-10 text-[#cbd5e1] mb-3" />
                      <p className="text-sm text-[#94a3b8]">No invoices found</p>
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead>
                        <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                          {["Invoice #", "Guest", "Room", "Check-In", "Total", "Status"].map((h) => (
                            <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wide">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {savedInvoices.map((inv) => (
                          <tr key={inv.id} onClick={() => loadInvoice(inv)} className="border-b border-[#f1f5f9] hover:bg-[#f8fafc] cursor-pointer transition-colors">
                            <td className="px-5 py-3 text-sm font-semibold text-[#d97706]">{inv.invoiceNumber || "N/A"}</td>
                            <td className="px-5 py-3 text-sm text-[#374151]">{inv.guest?.name || "N/A"}</td>
                            <td className="px-5 py-3 text-sm text-[#64748b]">{inv.booking?.roomNumber || "N/A"} — {inv.booking?.roomType || "N/A"}</td>
                            <td className="px-5 py-3 text-sm text-[#64748b]">{inv.booking?.checkInDate || "N/A"}</td>
                            <td className="px-5 py-3 text-sm font-semibold text-[#1e293b]">R{inv.totals?.total?.toFixed(2) || "0.00"}</td>
                            <td className="px-5 py-3">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${statusBadge(inv.status)}`}>
                                {inv.status === "partially_paid" ? "Partial" : inv.status || "Pending"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Preview modal ─────────────────────────────────────────── */}
          {showPreview && (
            <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#e2e8f0] bg-[#f8fafc] flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-[#0f172a] rounded-lg flex items-center justify-center">
                      <Eye className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold text-[#1e293b]">Invoice Preview</h2>
                      <p className="text-xs text-[#64748b]">{invoiceNumber || "Draft"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={handlePrint} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-medium rounded-lg transition-colors">
                      <Printer className="w-3.5 h-3.5" /> Print
                    </button>
                    <button onClick={handleSavePDF} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#059669] hover:bg-[#047857] text-white text-xs font-medium rounded-lg transition-colors">
                      <Download className="w-3.5 h-3.5" /> Save PDF
                    </button>
                    <button onClick={() => setShowPreview(false)} className="p-1.5 text-[#64748b] hover:text-[#1e293b] hover:bg-[#e2e8f0] rounded-lg transition-all">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto bg-[#e2e8f0] p-6">
                  <div className="mx-auto bg-white shadow-xl" style={{ width: "210mm", minHeight: "297mm" }}>
                    <TemplateRenderer {...templateProps} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── View router ───────────────────────────────────────────── */}
         {activeView === "home" && (
                     <div className="flex-1 overflow-y-auto p-4">
                       <HomeView
                         user={user}
                         onNavigate={(view, docType) => {
                           if (docType) setDocumentType(docType);
                           setActiveView(view);
                         }}
                         onGoToDashboard={() => setActiveView("quote")}
                         onSidebarToggle={() => setSidebarOpen((p) => !p)}
                         sidebarOpen={sidebarOpen}
                       />
                     </div>
                   )}
          {activeView === "financial-overview" && (
            <div className="flex-1 overflow-y-auto p-4">
              <FinancialOverview user={user} />
            </div>
          )}
          {activeView === "templates" && (
            <div className="flex-1 overflow-y-auto p-4">
              <Templates user={user} />
            </div>
          )}
          {activeView === "purchase-orders" && (
            <div className="flex-1 overflow-y-auto p-6">
              <PurchaseOrders user={user} />
            </div>
          )}
          {/* ── New pages ── */}
          {activeView === "rooms" && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <RoomManagement user={user} />
            </div>
          )}
          {activeView === "reservations" && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <Reservations user={user} />
            </div>
          )}
          {activeView === "restaurant" && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <RestaurantBar user={user} />
            </div>
          )}
          {/* Stubs for remaining sidebar items */}
          {["overview", "payment-process", "payment-history", "refunds",
            "report-occupancy", "report-revenue", "report-guests",
            "analytics-bookings", "analytics-revenue", "analytics-guests",
            "reviews", "invoices-pending"].includes(activeView) && (
            <div className="flex-1 overflow-y-auto p-4 flex items-center justify-center">
              <div className="text-center">
                <p className="text-[#94a3b8] text-sm font-medium capitalize">{activeView.replace(/-/g, " ")} — coming soon</p>
              </div>
            </div>
          )}
{activeView === "marketplace" && (
  <div className="flex-1 overflow-y-auto p-6">
    <ServiceMarketplaceView user={user} businessInfo={propertyInfo} />
  </div>
)}

{activeView === "incoming-requests" && (
  <div className="flex-1 overflow-y-auto p-6">
    <ServiceRequestsView user={user} businessInfo={propertyInfo} />
  </div>
)}
          {/* ── Invoice split layout ──────────────────────────────────── */}
          {activeView === "invoice" && (
            <div className="flex-1 overflow-hidden flex min-h-0">
              {/* LEFT: Form */}
              <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 min-w-0">
                <div className="space-y-5">
                  {/* Stat cards */}
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: "Invoice Amount", value: `R${total.toFixed(2)}`,                   icon: DollarSign, iconBg: "bg-[#fef3c7]", iconColor: "text-[#d97706]", textColor: "text-[#1e293b]" },
                      { label: "Paid",           value: `R${paymentStatus.totalPaid.toFixed(2)}`, icon: CheckSquare, iconBg: paymentStatus.totalPaid > 0 ? "bg-[#dcfce7]" : "bg-[#f1f5f9]", iconColor: paymentStatus.totalPaid > 0 ? "text-[#059669]" : "text-[#94a3b8]", textColor: paymentStatus.totalPaid > 0 ? "text-[#059669]" : "text-[#1e293b]" },
                      { label: "Balance Due",    value: `R${paymentStatus.balanceDue.toFixed(2)}`,icon: Wallet, iconBg: paymentStatus.balanceDue <= 0 ? "bg-[#dcfce7]" : "bg-[#fef2f2]", iconColor: paymentStatus.balanceDue <= 0 ? "text-[#059669]" : "text-[#dc2626]", textColor: paymentStatus.balanceDue <= 0 ? "text-[#059669]" : "text-[#dc2626]" },
                    ].map(({ label, value, icon: Icon, iconBg, iconColor, textColor }) => (
                      <div key={label} className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-semibold text-[#64748b] uppercase tracking-wide">{label}</span>
                          <div className={`w-8 h-8 ${iconBg} rounded-lg flex items-center justify-center`}>
                            <Icon className={`w-4 h-4 ${iconColor}`} />
                          </div>
                        </div>
                        <div className={`text-xl font-bold ${textColor}`}>{value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Payment banner */}
                  {invoiceId && (
                    <div className={`px-5 py-3.5 rounded-xl border flex items-center justify-between ${
                      paymentStatus.status === "paid" ? "bg-[#f0fdf4] border-[#bbf7d0]"
                      : paymentStatus.status === "partially_paid" ? "bg-[#fffbeb] border-[#fde68a]"
                      : "bg-[#fff7ed] border-[#fed7aa]"
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${paymentStatus.status === "paid" ? "bg-[#dcfce7]" : paymentStatus.status === "partially_paid" ? "bg-[#fef3c7]" : "bg-[#ffedd5]"}`}>
                          <CreditCard className={`w-4 h-4 ${paymentStatus.status === "paid" ? "text-[#059669]" : paymentStatus.status === "partially_paid" ? "text-[#d97706]" : "text-[#ea580c]"}`} />
                        </div>
                        <div className={`text-sm font-semibold ${paymentStatus.status === "paid" ? "text-[#166534]" : paymentStatus.status === "partially_paid" ? "text-[#92400e]" : "text-[#9a3412]"}`}>
                          {paymentStatus.status === "paid"
                            ? "Invoice Fully Paid"
                            : paymentStatus.status === "partially_paid"
                            ? `R${paymentStatus.totalPaid.toFixed(2)} paid · R${paymentStatus.balanceDue.toFixed(2)} remaining`
                            : `Payment Pending — R${paymentStatus.balanceDue.toFixed(2)} due on check-out`}
                        </div>
                      </div>
                      {paymentStatus.status !== "paid" && (
                        <button onClick={handleProcessPayment} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#e2e8f0] text-[#374151] text-sm font-medium rounded-lg hover:bg-[#f8fafc] transition-colors shadow-sm">
                          <CreditCard className="w-4 h-4" /> Record Payment
                        </button>
                      )}
                    </div>
                  )}

                  {/* Form card */}
                  <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
                    <div className="flex border-b border-[#e2e8f0] bg-[#f8fafc]">
                      <button
                        onClick={() => setInputMode("manual")}
                        className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all border-b-2 -mb-px ${inputMode === "manual" ? "border-[#d97706] text-[#d97706] bg-white" : "border-transparent text-[#64748b] hover:text-[#374151]"}`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Manual Entry
                      </button>
                      <button
                        onClick={() => setShowAIWindow(true)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ml-auto mr-3 my-auto bg-gradient-to-r from-[#7c3aed] to-[#5b21b6] text-white shadow-md shadow-[#7c3aed]/30 hover:shadow-lg hover:shadow-[#7c3aed]/40 hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <Sparkles className="w-4 h-4" /> AI Mode
                      </button>
                    </div>

                    {inputMode === "ai" && (
                      <div className="p-6 border-b border-[#e2e8f0]">
                        <HotelAIExtractor onDataExtracted={handleAIDataExtracted} documentType={documentType} />
                      </div>
                    )}

                    {inputMode === "manual" && (
                      <div className="p-6">
                        <HospitalityMultiStepForm
                          guestName={guestName} setGuestName={setGuestName}
                          guestId={guestId} setGuestId={setGuestId}
                          guestEmail={guestEmail} setGuestEmail={setGuestEmail}
                          guestPhone={guestPhone} setGuestPhone={setGuestPhone}
                          guestAddress={guestAddress} setGuestAddress={setGuestAddress}
                          guestDOB={guestDOB} setGuestDOB={setGuestDOB}
                          guestNationality={guestNationality} setGuestNationality={setGuestNationality}
                          idType={idType} setIdType={setIdType}
                          idNumber={idNumber} setIdNumber={setIdNumber}
                          roomNumber={roomNumber} setRoomNumber={setRoomNumber}
                          roomType={roomType} setRoomType={setRoomType}
                          checkInDate={checkInDate} setCheckInDate={setCheckInDate}
                          checkOutDate={checkOutDate} setCheckOutDate={setCheckOutDate}
                          numberOfGuests={numberOfGuests} setNumberOfGuests={setNumberOfGuests}
                          numberOfNights={numberOfNights} setNumberOfNights={setNumberOfNights}
                          specialRequests={specialRequests} setSpecialRequests={setSpecialRequests}
                          showGuestsListModal={showGuestsListModal} setShowGuestsListModal={setShowGuestsListModal}
                          items={items} newItem={newItem} setNewItem={setNewItem} handleAddItem={handleAddItem}
                        />
                      </div>
                    )}
                  </div>

                  {invoiceId && paymentStatus.status !== "paid" && (
                    <button onClick={handleProcessPayment} className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-[#d97706] hover:bg-[#b45309] text-white rounded-xl font-medium transition-colors shadow-sm">
                      <CreditCard className="w-4 h-4" /> Process Payment
                    </button>
                  )}
                </div>
              </div>

              {/* RIGHT: Live preview */}
              <div className="hidden xl:flex w-[420px] flex-shrink-0 flex-col border-l border-[#e2e8f0] bg-[#e8eaed] overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-[#f8fafc] border-b border-[#e2e8f0] flex-shrink-0">
                  <TemplateSelector selectedTemplate={selectedTemplate} onTemplateChange={setSelectedTemplate} />
                  <div className="flex items-center gap-1.5">
                    <button onClick={handlePrint} className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-[#e2e8f0] text-[#374151] text-xs font-medium rounded-lg hover:bg-[#f1f5f9] transition-colors">
                      <Printer className="w-3 h-3" /> Print
                    </button>
                    <button onClick={handleSavePDF} className="flex items-center gap-1 px-2.5 py-1.5 bg-[#d97706] text-white text-xs font-medium rounded-lg hover:bg-[#b45309] transition-colors">
                      <Download className="w-3 h-3" /> PDF
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="bg-white shadow-lg rounded origin-top" style={{ width: "210mm", minHeight: "297mm", transform: "scale(0.44)", transformOrigin: "top left", marginBottom: `calc((297mm * 0.44) - 297mm)` }}>
                    <TemplateRenderer {...templateProps} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HotelDashboard;
