import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import HomeView from "../HomeView";
import BusinessSettingsModal from "../BusinessSettingsModal";
import AppHeader from "../AppHeader";
import SubUserManagement from "../SubUserManagement";
import { serverTimestamp } from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth";
import FinancialOverview from "../FinancialOverview";
import Templates from "./Templates";
import ServiceMarketplaceView from "../ServiceMarketplaceView";
import ServiceRequestsView from "../ServiceRequestsView";
import PurchaseOrders from "../PurchaseOrders";
import { useLocation } from "react-router-dom";
import MedicalAIExtractor from "./MedicalAIExtractor";
import MedicalMultiStepForm from "./MedicalMultiStepForm";
import TemplateSelector, { TemplateRenderer } from "./TemplateSelector";
import { getFunctions } from "firebase/functions";
import PaymentProcessor from "../../components/dashboard/PaymentProcessor";
import AIInvoiceWindow from "../AIInvoiceWindow";
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
import PatientModal from "./PatientModal";
import PracticeOverview from "./PracticeOverview";
import PatientsListModal from "./PatientsListModal";
import PendingPayments from "./PendingPayments";
import AppointmentsCalendar from "./AppointmentsCalendar";
import SickNoteModal from "./SickNoteModal";
import HealthSidebar from "./HealthSidebar";
import Prescriptions from "./Prescriptions";
import TreatmentPlans from "./TreatmentPlans";
import MedicalRecords from "./MedicalRecords";
import PatientVitals from "./PatientVitals";
import {
  Eye,
  Save,
  Plus,
  Send,
  X,
  CreditCard,
  Receipt,
  Wallet,
  DollarSign,
  CheckSquare,
} from "lucide-react";

// ── Generate invoice number ────────────────────────────────────────────────
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
    if (match) lastNumber = Number(match[1]);
  }
  return `INV-${year}-${String(lastNumber + 1).padStart(4, "0")}`;
};

getFunctions(); // initialise

// ── Status badge helper ────────────────────────────────────────────────────
const statusBadge = (s) =>
  s === "paid"
    ? "bg-[#dcfce7] text-[#166534]"
    : s === "partially_paid"
    ? "bg-[#fef3c7] text-[#92400e]"
    : s === "pending"
    ? "bg-[#dbeafe] text-[#1e40af]"
    : "bg-[#f1f5f9] text-[#475569]";

// ── Main Dashboard ─────────────────────────────────────────────────────────
const HealthcareDashboard = () => {
  // ── UI state ───────────────────────────────────────────────────────────
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [inputMode, setInputMode] = useState("manual");
  const [activeView, setActiveView] = useState("home");
  const [showPreview, setShowPreview] = useState(false);
  const [showInvoicesList, setShowInvoicesList] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showPatientsListModal, setShowPatientsListModal] = useState(false);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSickNoteModal, setShowSickNoteModal] = useState(false);
  const [showAIWindow, setShowAIWindow] = useState(false);
  const [showNotificationsPanel, setShowNotificationsPanel] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const [aiWindowOpen, setAiWindowOpen] = useState(false);
    const [aiDocType, setAiDocType] = useState('invoice');
  // ── Document state ─────────────────────────────────────────────────────
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceId, setInvoiceId] = useState(null);
  const [savedInvoices, setSavedInvoices] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("professional");

  // ── Patient state ──────────────────────────────────────────────────────
  const [patients, setPatients] = useState([]);
  const [savedPatients, setSavedPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [documentType, setDocumentType] = useState("quote");
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState(null);

  // ── Patient form fields ────────────────────────────────────────────────
  const [patientName, setPatientName] = useState("Sarah Johnson");
  const [patientId, setPatientId] = useState("PAT-2026-1234");
  const [patientEmail, setPatientEmail] = useState("sarah.johnson@example.com");
  const [patientPhone, setPatientPhone] = useState("082 123 4567");
  const [patientAddress, setPatientAddress] = useState("123 Main Street, Pretoria, 0001");
  const [patientDOB, setPatientDOB] = useState("1985-05-15");
  const [patientGender, setPatientGender] = useState("Female");
  const [insuranceProvider, setInsuranceProvider] = useState("Discovery Health");
  const [insuranceNumber, setInsuranceNumber] = useState("DH123456789");
  const [diagnosis, setDiagnosis] = useState("Annual Health Checkup");
  const [treatmentPlan, setTreatmentPlan] = useState("Routine examination and blood work");
  const [prescription, setPrescription] = useState("");

  // ── Items ──────────────────────────────────────────────────────────────
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ description: "", rate: "", qty: "", type: "Service" });

  // ── Payment / stamp ────────────────────────────────────────────────────
  const [paymentStatus, setPaymentStatus] = useState({ totalPaid: 0, balanceDue: 0, status: "pending" });
  const [stampSettings] = useState({ text: "APPROVED", color: "#d32f2f", showDate: false, enabled: false });

  // ── Facility / doctor info ─────────────────────────────────────────────
  const [facilityInfo, setFacilityInfo] = useState({
    facilityName: "WELLNESS MEDICAL CENTER",
    addressLine1: "9-10 CNR THIRD & MAIN AVENUE",
    addressLine2: "MEDICAL PARK",
    city: "PRETORIA",
    postalCode: "0001",
    primaryPhone: "012 345 6789",
    secondaryPhone: "082 123 4567",
    practiceName: "Dr. John Smith & Associates",
    practiceNumber: "MP123456",
    logoUrl: "",
    bankName: "",
    accountHolder: "",
    accountNumber: "",
    branchCode: "",
  });
  const [loading, setLoading] = useState(true);

  // ── Doctor info (derived from facilityInfo or fetched separately) ──────
  const doctorInfo = {
    name: facilityInfo.practiceName || "Dr. John Smith",
    specialty: facilityInfo.specialty || "General Practitioner",
    practiceNumber: facilityInfo.practiceNumber || "",
    status: "available", // could be a separate state updated via presence/firestore
  };

  // ── Notifications state ────────────────────────────────────────────────
  // In production, fetch these from Firestore; here we derive pending-payment alerts
  const [notifications, setNotifications] = useState([]);

  // Build notifications from pending invoices whenever savedInvoices changes
  useEffect(() => {
    const pending = savedInvoices
      .filter((inv) => inv.status === "pending" || inv.status === "partially_paid")
      .slice(0, 5)
      .map((inv, i) => ({
        id: inv.id || i,
        message: `Payment ${inv.status === "partially_paid" ? "partial" : "pending"}: ${inv.invoiceNumber || "Invoice"} — R${inv.totals?.due?.toFixed(2) ?? "0.00"}`,
        type: inv.status === "partially_paid" ? "warning" : "alert",
        time: inv.createdAt?.toDate
          ? inv.createdAt.toDate().toLocaleDateString("en-ZA", { day: "numeric", month: "short" })
          : "",
        read: false,
      }));
    setNotifications(pending);
  }, [savedInvoices]);

  // Derived totals
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const vat = subtotal * 0.15;
  const total = subtotal + vat;

  // ── Effects ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (location.state?.activeView) setActiveView(location.state.activeView);
  }, [location.state]);

  useEffect(() => {
    if (!user?.uid) return;
    generateInvoiceNumber(user.uid).then(setInvoiceNumber);
    loadSavedInvoices();
  }, [user]);

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      setSidebarOpen(w >= 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (user?.uid) {
      loadFacilityInfo();
      loadPatients();
    }
  }, [user]);

  useEffect(() => { loadPaymentStatus(); }, [invoiceId, user?.uid]);
  useEffect(() => {
    if (!invoiceId) setPaymentStatus({ totalPaid: 0, balanceDue: total, status: "pending" });
  }, [total, invoiceId]);

  // ── Loaders ────────────────────────────────────────────────────────────
  const loadFacilityInfo = async () => {
    if (!user?.uid) return;
    try {
      const db = getFirestore();
      const snap = await getDoc(doc(db, "users", user.uid, "settings", "facilityInfo"));
      if (snap.exists()) setFacilityInfo(snap.data());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadPatients = async () => {
    try {
      const q = query(collection(db, "users", user.uid, "patients"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setPatients(list);
      setSavedPatients(list);
    } catch (e) {
      console.error(e);
    }
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
        setPaymentStatus({
          totalPaid: d.totals?.paid || 0,
          balanceDue: d.totals?.due || d.totals?.total || 0,
          status: d.status || "pending",
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  // ── Handlers ───────────────────────────────────────────────────────────
  const handleAddNewPatient = () => { setSelectedPatient(null); setShowPatientModal(true); };
  const handleEditPatient = (p) => { setSelectedPatient(p); setShowPatientModal(true); };

  const loadPatient = (p) => {
    setPatientName(p.name || "");
    setPatientEmail(p.email || "");
    setPatientPhone(p.phone || "");
    setPatientAddress(p.address || "");
    setPatientId(p.patientId || "");
    setPatientDOB(p.dateOfBirth || "");
    setPatientGender(p.gender || "");
    setInsuranceProvider(p.insuranceProvider || "");
    setInsuranceNumber(p.insuranceNumber || "");
  };

  const loadInvoice = (invoice) => {
    setInvoiceId(invoice.id);
    setInvoiceNumber(invoice.invoiceNumber || "");
    setPatientName(invoice.patient?.name || "");
    setPatientEmail(invoice.patient?.email || "");
    setPatientPhone(invoice.patient?.phone || "");
    setPatientAddress(invoice.patient?.address || "");
    setPatientId(invoice.patient?.patientId || "");
    setPatientDOB(invoice.patient?.dateOfBirth || "");
    setPatientGender(invoice.patient?.gender || "");
    setInsuranceProvider(invoice.patient?.insuranceProvider || "");
    setInsuranceNumber(invoice.patient?.insuranceNumber || "");
    setDiagnosis(invoice.medical?.diagnosis || "");
    setTreatmentPlan(invoice.medical?.treatmentPlan || "");
    setPrescription(invoice.medical?.prescription || "");
    setItems(invoice.items || []);
    setShowInvoicesList(false);
    setPaymentStatus({
      totalPaid: invoice.totals?.paid || 0,
      balanceDue: invoice.totals?.due || invoice.totals?.total || 0,
      status: invoice.status || "pending",
    });
    setActiveView("invoice");
  };

  const handleAIDataExtracted = (data) => {
    if (data.patient?.name) setPatientName(data.patient.name);
    if (data.patient?.email) setPatientEmail(data.patient.email);
    if (data.patient?.phone) setPatientPhone(data.patient.phone);
    if (data.patient?.address) setPatientAddress(data.patient.address);
    if (data.patient?.patientId) setPatientId(data.patient.patientId);
    if (data.patient?.dateOfBirth) setPatientDOB(data.patient.dateOfBirth);
    if (data.patient?.gender) setPatientGender(data.patient.gender);
    if (data.insurance?.provider) setInsuranceProvider(data.insurance.provider);
    if (data.insurance?.number) setInsuranceNumber(data.insurance.number);
    if (data.medical?.diagnosis) setDiagnosis(data.medical.diagnosis);
    if (data.medical?.treatmentPlan) setTreatmentPlan(data.medical.treatmentPlan);
    if (data.medical?.prescription) setPrescription(data.medical.prescription);
    if (data.items?.length > 0) setItems(data.items);
    alert("✅ Medical data extracted and populated successfully!");
  };

  const buildInvoicePayload = (numberToUse) => ({
    invoiceNumber: numberToUse,
    locked: true,
    status: paymentStatus.status || "pending",
    dates: { serviceDate: new Date().toISOString(), completedDate: null },
    patient: { name: patientName, email: patientEmail, phone: patientPhone, address: patientAddress, patientId, dateOfBirth: patientDOB, gender: patientGender, insuranceProvider, insuranceNumber },
    medical: { diagnosis, treatmentPlan, prescription },
    items,
    totals: { subtotal, vat, total, paid: paymentStatus.totalPaid || 0, due: paymentStatus.balanceDue || total },
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
    const data = buildInvoicePayload(numberToUse);
    if (invoiceId) {
      await updateDoc(doc(db, "users", user.uid, "invoices", invoiceId), { ...data, updatedAt: serverTimestamp() });
    } else {
      const ref = await addDoc(collection(db, "users", user.uid, "invoices"), data);
      setInvoiceId(ref.id);
    }
    alert("Invoice saved and locked");
    loadSavedInvoices();
  };

  const handleNewInvoice = () => {
    setInvoiceId(null);
    setInvoiceNumber("");
    setPatientName("Sarah Johnson");
    setPatientId("PAT-2026-1234");
    setPatientEmail("sarah.johnson@example.com");
    setPatientPhone("082 123 4567");
    setPatientAddress("123 Main Street, Pretoria, 0001");
    setPatientDOB("1985-05-15");
    setPatientGender("Female");
    setInsuranceProvider("Discovery Health");
    setInsuranceNumber("DH123456789");
    setDiagnosis("Annual Health Checkup");
    setTreatmentPlan("Routine examination and blood work");
    setPrescription("");
    setItems([]);
    setPaymentStatus({ totalPaid: 0, balanceDue: 0, status: "pending" });
    if (user?.uid) generateInvoiceNumber(user.uid).then(setInvoiceNumber);
    setActiveView("invoice");
  };

  const handleAddItem = () => {
    if (!newItem.description || !newItem.qty) return;
    const rate = Number(newItem.rate) || 0;
    const qty = Number(newItem.qty);
    setItems((prev) => [...prev, { description: newItem.description, type: newItem.type || "Service", rate, qty, amount: rate * qty }]);
    setNewItem({ description: "", rate: "", qty: "", type: "Service" });
  };

  const handleProcessPayment = async () => {
    if (!invoiceId || !user?.uid) { alert("Please save the invoice before processing payment"); return; }
    try {
      const snap = await getDoc(doc(db, "users", user.uid, "invoices", invoiceId));
      if (snap.exists()) { setSelectedInvoiceForPayment({ id: invoiceId, ...snap.data() }); setShowPaymentModal(true); }
      else alert("Invoice not found. Please save the invoice first.");
    } catch (e) { alert("Failed to load invoice for payment"); }
  };

  const handlePaymentComplete = () => { loadSavedInvoices(); loadPaymentStatus(); setShowPaymentModal(false); };

  const handleSavePDF = async () => {
    if (!user?.uid || !invoiceId) { alert("Please save the invoice before exporting PDF"); return; }
    const snap = await getDoc(doc(db, "users", user.uid, "invoices", invoiceId));
    if (!snap.exists()) { alert("Please save first"); return; }
    const saved = snap.data();
    setInvoiceNumber(saved.invoiceNumber);
    setItems(saved.items);
    setPatientName(saved.patient.name);
    setPatientEmail(saved.patient.email);
    setPatientPhone(saved.patient.phone);
    setPatientAddress(saved.patient.address);
    setDiagnosis(saved.medical.diagnosis);
    setTreatmentPlan(saved.medical.treatmentPlan);
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

  const handleLogout = async () => {
    try { await signOut(getAuth()); } catch (e) { console.error(e); }
  };

  // Mark all notifications read when panel opens
  const handleViewNotifications = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setShowNotificationsPanel(true);
  };

  // Shared template props
  const templateProps = {
    templateId: selectedTemplate,
    businessInfo: facilityInfo,
    loading,
    invoiceNumber,
    customerName: patientName,
    customerEmail: patientEmail,
    customerPhone: patientPhone,
    customerAddress: patientAddress,
    patientId,
    patientDOB,
    patientGender,
    insuranceProvider,
    insuranceNumber,
    diagnosis,
    prescription,
    items,
    subtotal,
    vat,
    total,
    serviceType: "MEDICAL",
    documentType: "medical",
    showStamp: stampSettings.enabled,
    stampText: stampSettings.text,
    stampColor: stampSettings.color,
    showStampDate: stampSettings.showDate,
    paymentStatus,
  };

  // Header actions
  const headerActions = [
    { label: "Preview", icon: Eye, onClick: () => setShowPreview(true), className: "flex items-center gap-1.5 px-3 py-1.5 bg-[#0f172a] hover:bg-[#1e293b] text-white text-sm font-medium rounded-md transition-colors whitespace-nowrap" },
    { label: "Print", icon: Printer, onClick: handlePrint, className: "flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#e2e8f0] text-[#374151] text-sm font-medium rounded-md transition-colors whitespace-nowrap" },
    { label: "New", icon: Plus, onClick: handleNewInvoice, className: "flex items-center gap-1.5 px-3 py-1.5 bg-[#059669] hover:bg-[#047857] text-white text-sm font-medium rounded-md transition-colors whitespace-nowrap" },
    { label: "Send", icon: Send, className: "flex items-center gap-1.5 px-3 py-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium rounded-md transition-colors whitespace-nowrap" },
    { label: "Save PDF", icon: Download, onClick: handleSavePDF, className: "flex items-center gap-1.5 px-3 py-1.5 bg-[#0891b2] hover:bg-[#0e7490] text-white text-sm font-medium rounded-md transition-colors whitespace-nowrap" },
    { label: "Save", icon: Save, onClick: handleSaveInvoice, className: "flex items-center gap-1.5 px-3 py-1.5 bg-[#3b82f6] hover:bg-[#2563eb] text-white text-sm font-medium rounded-md transition-colors whitespace-nowrap" },
  ];

  const mobileDashboardActions = [
    { label: "Save", icon: Save, onClick: handleSaveInvoice, className: "flex items-center gap-1.5 px-3 py-2 bg-[#3b82f6] text-white rounded-md text-xs font-medium active:scale-95 whitespace-nowrap" },
    { label: "Send", icon: Send, className: "flex items-center gap-1.5 px-3 py-2 bg-[#059669] text-white rounded-md text-xs font-medium active:scale-95 whitespace-nowrap" },
    { label: "PDF", icon: Download, onClick: handleSavePDF, className: "flex items-center gap-1.5 px-3 py-2 bg-[#0891b2] text-white rounded-md text-xs font-medium active:scale-95 whitespace-nowrap" },
    { label: "Print", icon: Printer, onClick: handlePrint, className: "flex items-center gap-1.5 px-3 py-2 bg-white border border-[#e2e8f0] text-[#374151] rounded-md text-xs font-medium active:scale-95 whitespace-nowrap" },
  ];

  return (
    <div className="h-screen w-full overflow-hidden flex flex-col bg-[#f0f2f5]">

      {/* Print area */}
      <div id="print-area" className="hidden print:block bg-white" style={{ width: "210mm", minHeight: "297mm" }}>
        <TemplateRenderer {...templateProps} />
      </div>
       {showAIWindow && (
        <AIInvoiceWindow
            user={user}
            businessInfo={facilityInfo}
            documentType={"medical"}
            onExit={() => setShowAIWindow(false)}
            industry="healthcare"
            TemplateRenderer={TemplateRenderer}
            onNavigateTo={(view) => {
            setAiWindowOpen(false);
            setActiveView(view); 
          }}
          />
        )}
      <div className="flex-1 flex overflow-hidden min-h-0">

        {/* ── New HealthSidebar ──────────────────────────────────────────── */}
        <HealthSidebar
          user={user}
          activeView={activeView}
          setActiveView={setActiveView}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          setShowSettings={setShowSettings}
          handleNewInvoice={handleNewInvoice}
          handleAddNewPatient={handleAddNewPatient}
          facilityInfo={facilityInfo}
          savedInvoices={savedInvoices}
          savedPatients={savedPatients}
          setShowInvoicesList={setShowInvoicesList}
          setShowPatientsListModal={setShowPatientsListModal}
          handleLogout={handleLogout}
          // ── New props ────────────────────────────────────────────────────
          doctorInfo={doctorInfo}
          notifications={notifications}
          onViewNotifications={handleViewNotifications}
          onViewVitals={() => setActiveView("medical-records")}
        />

        {/* ── Main content area ──────────────────────────────────────────── */}
        {/*
          Layout logic:
          - Mobile (<md):   sidebar is an overlay → no left margin
          - md+ collapsed:  icon rail is w-16  → ml-16
          - md+ expanded:   full panel is w-64  → ml-64
        */}
        <div
          className={`flex-1 overflow-hidden flex flex-col min-h-0 transition-all duration-300 ${
            sidebarOpen ? "md:ml-2" : "md:ml-4"
          }`}
        >
          <AppHeader
            actions={headerActions}
            mobileActions={mobileDashboardActions}
            onSettingsOpen={() => setShowSettings(true)}
          />

          {/* ── Modals ────────────────────────────────────────────────── */}
          {showSettings && <BusinessSettingsModal onClose={() => setShowSettings(false)} />}

          <PatientsListModal
            showModal={showPatientsListModal}
            setShowModal={setShowPatientsListModal}
            patients={patients}
            onLoadPatient={loadPatient}
            onEditPatient={handleEditPatient}
            onAddNewPatient={handleAddNewPatient}
          />

          <PatientModal
            showModal={showPatientModal}
            setShowModal={setShowPatientModal}
            existingPatient={selectedPatient}
            onPatientSaved={loadPatients}
          />

          <SickNoteModal
            isOpen={showSickNoteModal}
            onClose={() => setShowSickNoteModal(false)}
            facilityInfo={facilityInfo}
            patientName={patientName}
            patientId={patientId}
            patientDOB={patientDOB}
            diagnosis={diagnosis}
          />

          {showPaymentModal && selectedInvoiceForPayment && (
            <PaymentProcessor
              showModal={showPaymentModal}
              setShowModal={setShowPaymentModal}
              invoice={selectedInvoiceForPayment}
              onPaymentComplete={handlePaymentComplete}
              user={user}
              businessInfo={facilityInfo}
            />
          )}

          {/* ── Notifications panel ────────────────────────────────────── */}
          {showNotificationsPanel && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-end p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm border border-[#e2e8f0] flex flex-col overflow-hidden mt-14">
                <div className="flex items-center justify-between px-5 py-4 border-b border-[#e2e8f0] bg-[#f8fafc]">
                  <h2 className="text-sm font-semibold text-[#1e293b]">Notifications</h2>
                  <button onClick={() => setShowNotificationsPanel(false)} className="p-1.5 text-[#64748b] hover:text-[#1e293b] hover:bg-[#e2e8f0] rounded-lg transition-all">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto max-h-96">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <p className="text-sm text-[#94a3b8]">No notifications</p>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => { setShowNotificationsPanel(false); setActiveView("pending"); }}
                        className={`px-5 py-3.5 border-b border-[#f1f5f9] cursor-pointer hover:bg-[#f8fafc] transition-colors flex items-start gap-3 ${n.type === "alert" ? "border-l-2 border-l-[#ef4444]" : n.type === "warning" ? "border-l-2 border-l-[#f59e0b]" : "border-l-2 border-l-[#0e7490]"}`}
                      >
                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.type === "alert" ? "bg-[#ef4444]" : n.type === "warning" ? "bg-[#f59e0b]" : "bg-[#0e7490]"}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[#374151] leading-snug">{n.message}</p>
                          {n.time && <p className="text-xs text-[#94a3b8] mt-0.5">{n.time}</p>}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {notifications.length > 0 && (
                  <div className="px-5 py-3 border-t border-[#e2e8f0] bg-[#f8fafc]">
                    <button
                      onClick={() => { setShowNotificationsPanel(false); setActiveView("pending"); }}
                      className="text-xs text-[#2563eb] hover:text-[#1d4ed8] font-medium transition-colors"
                    >
                      View all pending payments →
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── All Invoices modal ─────────────────────────────────────── */}
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
                          {["Invoice #", "Patient", "Diagnosis", "Insurance", "Total", "Status"].map((h) => (
                            <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wide">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {savedInvoices.map((inv) => (
                          <tr key={inv.id} onClick={() => loadInvoice(inv)} className="border-b border-[#f1f5f9] hover:bg-[#f8fafc] cursor-pointer transition-colors">
                            <td className="px-5 py-3 text-sm font-semibold text-[#3b82f6]">{inv.invoiceNumber || "N/A"}</td>
                            <td className="px-5 py-3 text-sm text-[#374151]">{inv.patient?.name || "N/A"}</td>
                            <td className="px-5 py-3 text-sm text-[#64748b]">{inv.medical?.diagnosis || "N/A"}</td>
                            <td className="px-5 py-3 text-sm text-[#64748b]">{inv.patient?.insuranceProvider || "N/A"}</td>
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

          {/* ── Fullscreen preview modal ───────────────────────────────── */}
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
          {activeView === "practice-overview" && (
            <div className="flex-1 overflow-y-auto p-4">
              <PracticeOverview onAddNewPatient={handleAddNewPatient} user={user} />
            </div>
          )}
          {activeView === "appointments" && (
            <div className="flex-1 overflow-y-auto p-4">
              <AppointmentsCalendar user={user} />
            </div>
          )}
          {activeView === "financial-overview" && (
            <div className="flex-1 overflow-y-auto p-4">
              <FinancialOverview user={user} />
            </div>
          )}
          {activeView === "pending" && (
            <div className="flex-1 overflow-y-auto p-4">
              <PendingPayments user={user} />
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
          {activeView === "medical-records" && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <MedicalRecords user={user} />
            </div>
          )}
          {activeView === "vitals" && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <PatientVitals user={user} />
            </div>
          )}
          {activeView === "treatment-plans" && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <TreatmentPlans user={user} />
            </div>
          )}
          {activeView === "prescriptions" && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <Prescriptions user={user} />
            </div>
          )}
{activeView === "marketplace" && (
  <div className="flex-1 overflow-y-auto p-6">
    <ServiceMarketplaceView user={user} businessInfo={facilityInfo} />
  </div>
)}

{activeView === "incoming-requests" && (
  <div className="flex-1 overflow-y-auto p-6">
    <ServiceRequestsView user={user} businessInfo={facilityInfo} />
  </div>
)}
          {/* ── Invoice view — split layout ────────────────────────────── */}
          {activeView === "invoice" && (
            <div className="flex-1 overflow-hidden flex min-h-0">

              {/* LEFT: Form panel */}
              <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 min-w-0">
                <div className="space-y-5">

                  {/* Stat cards */}
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: "Total Amount", value: `R${total.toFixed(2)}`, icon: DollarSign, iconBg: "bg-[#dbeafe]", iconColor: "text-[#2563eb]", textColor: "text-[#1e293b]" },
                      { label: "Paid", value: `R${paymentStatus.totalPaid.toFixed(2)}`, icon: CheckSquare, iconBg: paymentStatus.totalPaid > 0 ? "bg-[#dcfce7]" : "bg-[#f1f5f9]", iconColor: paymentStatus.totalPaid > 0 ? "text-[#059669]" : "text-[#94a3b8]", textColor: paymentStatus.totalPaid > 0 ? "text-[#059669]" : "text-[#1e293b]" },
                      { label: "Balance Due", value: `R${paymentStatus.balanceDue.toFixed(2)}`, icon: Wallet, iconBg: paymentStatus.balanceDue <= 0 ? "bg-[#dcfce7]" : "bg-[#fef2f2]", iconColor: paymentStatus.balanceDue <= 0 ? "text-[#059669]" : "text-[#dc2626]", textColor: paymentStatus.balanceDue <= 0 ? "text-[#059669]" : "text-[#dc2626]" },
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

                  {/* Payment status banner */}
                  {invoiceId && (
                    <div className={`px-5 py-3.5 rounded-xl border flex items-center justify-between ${
                      paymentStatus.status === "paid" ? "bg-[#f0fdf4] border-[#bbf7d0]"
                      : paymentStatus.status === "partially_paid" ? "bg-[#fffbeb] border-[#fde68a]"
                      : "bg-[#eff6ff] border-[#bfdbfe]"
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          paymentStatus.status === "paid" ? "bg-[#dcfce7]"
                          : paymentStatus.status === "partially_paid" ? "bg-[#fef3c7]"
                          : "bg-[#dbeafe]"
                        }`}>
                          <CreditCard className={`w-4 h-4 ${
                            paymentStatus.status === "paid" ? "text-[#059669]"
                            : paymentStatus.status === "partially_paid" ? "text-[#d97706]"
                            : "text-[#2563eb]"
                          }`} />
                        </div>
                        <div className={`text-sm font-semibold ${
                          paymentStatus.status === "paid" ? "text-[#166534]"
                          : paymentStatus.status === "partially_paid" ? "text-[#92400e]"
                          : "text-[#1e40af]"
                        }`}>
                          {paymentStatus.status === "paid"
                            ? "Invoice Fully Paid"
                            : paymentStatus.status === "partially_paid"
                            ? `R${paymentStatus.totalPaid.toFixed(2)} paid · R${paymentStatus.balanceDue.toFixed(2)} remaining`
                            : `Payment Pending — R${paymentStatus.balanceDue.toFixed(2)} due`}
                        </div>
                      </div>
                      {paymentStatus.status !== "paid" && (
                        <button onClick={handleProcessPayment} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#e2e8f0] text-[#374151] text-sm font-medium rounded-lg hover:bg-[#f8fafc] transition-colors shadow-sm">
                          <CreditCard className="w-4 h-4" /> Record Payment
                        </button>
                      )}
                    </div>
                  )}

                  {/* Main form card */}
                  <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
                    {/* Tabs */}
                    <div className="flex border-b border-[#e2e8f0] bg-[#f8fafc]">
                      <button
                        onClick={() => setInputMode("manual")}
                        className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all border-b-2 -mb-px ${
                          inputMode === "manual"
                            ? "border-[#3b82f6] text-[#3b82f6] bg-white"
                            : "border-transparent text-[#64748b] hover:text-[#374151]"
                        }`}
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
                        <Sparkles className="w-4 h-4" />
                        AI Mode
                      </button>
                    </div>

                    {inputMode === "ai" && (
                      <div className="p-6 border-b border-[#e2e8f0]">
                        <MedicalAIExtractor onDataExtracted={handleAIDataExtracted} />
                      </div>
                    )}

                    {inputMode === "manual" && (
                      <div className="p-6">
                        <MedicalMultiStepForm
                          patientName={patientName} setPatientName={setPatientName}
                          patientId={patientId} setPatientId={setPatientId}
                          patientEmail={patientEmail} setPatientEmail={setPatientEmail}
                          patientPhone={patientPhone} setPatientPhone={setPatientPhone}
                          patientDOB={patientDOB} setPatientDOB={setPatientDOB}
                          patientGender={patientGender} setPatientGender={setPatientGender}
                          patientAddress={patientAddress} setPatientAddress={setPatientAddress}
                          insuranceProvider={insuranceProvider} setInsuranceProvider={setInsuranceProvider}
                          insuranceNumber={insuranceNumber} setInsuranceNumber={setInsuranceNumber}
                          diagnosis={diagnosis} setDiagnosis={setDiagnosis}
                          treatmentPlan={treatmentPlan} setTreatmentPlan={setTreatmentPlan}
                          prescription={prescription} setPrescription={setPrescription}
                          showSickNoteModal={showSickNoteModal} setShowSickNoteModal={setShowSickNoteModal}
                          items={items}
                          newItem={newItem} setNewItem={setNewItem}
                          handleAddItem={handleAddItem}
                        />
                      </div>
                    )}
                  </div>

                  {/* Process payment button */}
                  {invoiceId && paymentStatus.status !== "paid" && (
                    <button
                      onClick={handleProcessPayment}
                      className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-xl font-medium transition-colors shadow-sm"
                    >
                      <CreditCard className="w-4 h-4" /> Process Payment
                    </button>
                  )}
                </div>
              </div>

              {/* RIGHT: Live preview panel */}
              <div className="hidden xl:flex w-[420px] flex-shrink-0 flex-col border-l border-[#e2e8f0] bg-[#e8eaed] overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-[#f8fafc] border-b border-[#e2e8f0] flex-shrink-0">
                  <TemplateSelector selectedTemplate={selectedTemplate} onTemplateChange={setSelectedTemplate} />
                  <div className="flex items-center gap-1.5">
                    <button onClick={handlePrint} className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-[#e2e8f0] text-[#374151] text-xs font-medium rounded-lg hover:bg-[#f1f5f9] transition-colors">
                      <Printer className="w-3 h-3" /> Print
                    </button>
                    <button onClick={handleSavePDF} className="flex items-center gap-1 px-2.5 py-1.5 bg-[#3b82f6] text-white text-xs font-medium rounded-lg hover:bg-[#2563eb] transition-colors">
                      <Download className="w-3 h-3" /> PDF
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  <div
                    className="bg-white shadow-lg rounded origin-top"
                    style={{
                      width: "210mm",
                      minHeight: "297mm",
                      transform: "scale(0.44)",
                      transformOrigin: "top left",
                      marginBottom: `calc((297mm * 0.44) - 297mm)`,
                    }}
                  >
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

export default HealthcareDashboard;
