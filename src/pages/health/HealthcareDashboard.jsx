import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import HomeView from "../HomeView";
import BusinessSettingsModal from "../BusinessSettingsModal";
import AppHeader from "../AppHeader";
import { serverTimestamp } from "firebase/firestore";
import logo from "../../assets/img/solidflo-logo.png";
import { getAuth, signOut } from "firebase/auth";
import FinancialOverview from "../FinancialOverview";
import Templates from "./Templates";
import { useLocation } from "react-router-dom";
import MedicalAIExtractor from "./MedicalAIExtractor";
import MedicalMultiStepForm from "./MedicalMultiStepForm";
import TemplateSelector, { TemplateRenderer } from "./TemplateSelector";
import { getFunctions, httpsCallable } from "firebase/functions";
import PaymentProcessor from "../../components/dashboard/PaymentProcessor";
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
import uploadLogoToR2 from "../../utils/uploadLogoToR2";
import { Printer, Download, Sparkles } from "lucide-react";
import { db } from "../../firebase";
import PatientModal from "./PatientModal";
import PracticeOverview from "./PracticeOverview";
import PatientsListModal from "./PatientsListModal";
import PendingPayments from "./PendingPayments";
import AppointmentsCalendar from "./AppointmentsCalendar";
import SickNoteModal from "./SickNoteModal";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Home,
  Settings,
  Users,
  Save,
  Calendar,
  FileText,
  X,
  BarChart3,
  Plus,
  Send,
  LogOut,
  Eye,
  CheckSquare,
  TrendingUp,
  CreditCard,
  Receipt,
  Wallet,
  ClipboardList,
  Stethoscope,
  DollarSign,
  Pill,
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

const functions = getFunctions();

// ── Healthcare Sidebar ─────────────────────────────────────────────────────
const HealthcareSidebar = ({
  user,
  activeView,
  setActiveView,
  sidebarOpen,
  setSidebarOpen,
  setShowSettings,
  handleNewInvoice,
  facilityInfo,
  savedInvoices,
  savedPatients,
  handleLogout,
  setShowPatientsListModal,
  handleAddNewPatient,
  setShowInvoicesList,
}) => {
  const [isInvoicingOpen, setIsInvoicingOpen] = useState(false);
  const [isPatientsOpen, setIsPatientsOpen] = useState(false);

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Collapsed icon rail — only visible on md+ when sidebar is closed */}
      <div
        className={`${sidebarOpen ? "hidden" : "hidden md:flex"} fixed z-40 w-16 bg-[#0f172a] border-r border-[#1e293b] h-full print:hidden flex-col items-center py-4 space-y-4`}
      >
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 text-[#64748b] hover:text-white hover:bg-[#1e293b] rounded-lg transition-all"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
        <div className="w-9 h-9 rounded-xl overflow-hidden">
          <img src={logo} className="w-full h-full object-contain p-1" alt="" />
        </div>
        <div className="flex flex-col items-center gap-3 w-full px-2">
          {[
            { icon: Home, title: "Home", action: () => setActiveView("home") },
            {
              icon: Settings,
              title: "Settings",
              action: () => setShowSettings(true),
            },
            {
              icon: TrendingUp,
              title: "Practice Overview",
              action: () => setActiveView("practice-overview"),
            },
            {
              icon: Receipt,
              title: "Invoices",
              action: () => {
                handleNewInvoice();
                setActiveView("invoice");
              },
            },
            {
              icon: Users,
              title: "Patients",
              action: () => setShowPatientsListModal(true),
            },
            {
              icon: Calendar,
              title: "Appointments",
              action: () => setActiveView("appointments"),
            },
            { icon: Stethoscope, title: "Medical Records", action: () => {} },
            { icon: Pill, title: "Prescriptions", action: () => {} },
          ].map(({ icon: Icon, title, action }) => (
            <button
              key={title}
              onClick={action}
              title={title}
              className="p-2 text-[#475569] hover:text-white hover:bg-[#1e293b] rounded-lg transition-all w-10 h-10 flex items-center justify-center"
            >
              <Icon className="w-5 h-5" />
            </button>
          ))}
        </div>
        <div className="absolute bottom-5 left-0 right-0 flex justify-center">
          <div className="w-9 h-9 bg-[#1e293b] rounded-full flex items-center justify-center ring-1 ring-[#334155]">
            <img
              src={facilityInfo.logoUrl}
              className="w-5 h-5 object-contain"
              alt=""
            />
          </div>
        </div>
      </div>

      {/* Expanded sidebar */}
      <div
        className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} fixed z-50 w-64 bg-[#0f172a] border-r border-[#1e293b] transition-transform duration-300 h-full print:hidden shadow-2xl overflow-y-auto flex flex-col`}
      >
        <div className="p-4 flex-1">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg overflow-hidden">
                <img
                  src={logo}
                  className="w-full h-full object-contain"
                  alt=""
                />
              </div>
              <span className="text-sm font-semibold text-white">SolidFlo</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 text-[#475569] hover:text-white hover:bg-[#1e293b] rounded-lg transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Nav */}
          <nav className="space-y-1">
            <div
              onClick={() => {
                setActiveView("home");
                setSidebarOpen(false);
              }}
              className="flex items-center gap-2.5 px-3 py-2.5 text-[#94a3b8] hover:text-white hover:bg-[#1e293b] rounded-lg cursor-pointer transition-all text-sm font-medium"
            >
              <Home className="w-4 h-4 flex-shrink-0" />
              Home
            </div>
            <div
              onClick={() => {
                setShowSettings(true);
                setSidebarOpen(false);
              }}
              className="flex items-center gap-2.5 px-3 py-2.5 text-[#94a3b8] hover:text-white hover:bg-[#1e293b] rounded-lg cursor-pointer transition-all text-sm font-medium"
            >
              <Settings className="w-4 h-4 flex-shrink-0" />
              Settings
            </div>

            <div className="pt-3 mt-3 border-t border-[#1e293b] space-y-1">
              <div
                onClick={() => {
                  setActiveView("practice-overview");
                  setSidebarOpen(false);
                }}
                className="flex items-center gap-2.5 px-3 py-2.5 text-[#94a3b8] hover:text-white hover:bg-[#1e293b] rounded-lg cursor-pointer transition-all text-sm font-medium"
              >
                <TrendingUp className="w-4 h-4 flex-shrink-0" />
                Practice Overview
              </div>

              {/* Invoices dropdown */}
              <div>
                <div
                  onClick={() => setIsInvoicingOpen(!isInvoicingOpen)}
                  className="flex items-center justify-between px-3 py-2.5 text-[#94a3b8] hover:text-white hover:bg-[#1e293b] rounded-lg cursor-pointer transition-all text-sm font-medium"
                >
                  <div className="flex items-center gap-2.5">
                    <Receipt className="w-4 h-4 flex-shrink-0" />
                    Invoices
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${isInvoicingOpen ? "rotate-180" : ""}`}
                  />
                </div>
                <div
                  className={`ml-5 mt-1 space-y-0.5 border-l border-[#1e293b] pl-3 overflow-hidden transition-all duration-200 ${isInvoicingOpen ? "max-h-48 opacity-100" : "max-h-0 opacity-0"}`}
                >
                  <div
                    onClick={() => {
                      handleNewInvoice();
                      setActiveView("invoice");
                      setSidebarOpen(false);
                    }}
                    className="px-2 py-2 text-xs text-[#475569] hover:text-white hover:bg-[#1e293b] rounded-md cursor-pointer transition-all flex items-center gap-2"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-[#3b82f6]" />
                    Create Invoice
                  </div>
                  <div
                    onClick={() => {
                      setShowInvoicesList(true);
                      setSidebarOpen(false);
                    }}
                    className="px-2 py-2 text-xs text-[#475569] hover:text-white hover:bg-[#1e293b] rounded-md cursor-pointer transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#7c3aed]" />
                      All Invoices
                    </div>
                    <span className="bg-[#3b82f6] text-white px-1.5 py-0.5 rounded text-xs font-bold">
                      {savedInvoices.length}
                    </span>
                  </div>
                  <div
                    onClick={() => {
                      setActiveView("pending");
                      setSidebarOpen(false);
                    }}
                    className="px-2 py-2 text-xs text-[#475569] hover:text-white hover:bg-[#1e293b] rounded-md cursor-pointer transition-all flex items-center gap-2"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
                    Pending Payment
                  </div>
                </div>
              </div>

              {/* Patients dropdown */}
              <div>
                <div
                  onClick={() => setIsPatientsOpen(!isPatientsOpen)}
                  className="flex items-center justify-between px-3 py-2.5 text-[#94a3b8] hover:text-white hover:bg-[#1e293b] rounded-lg cursor-pointer transition-all text-sm font-medium"
                >
                  <div className="flex items-center gap-2.5">
                    <Users className="w-4 h-4 flex-shrink-0" />
                    Patients
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${isPatientsOpen ? "rotate-180" : ""}`}
                  />
                </div>
                <div
                  className={`ml-5 mt-1 space-y-0.5 border-l border-[#1e293b] pl-3 overflow-hidden transition-all duration-200 ${isPatientsOpen ? "max-h-32 opacity-100" : "max-h-0 opacity-0"}`}
                >
                  <div
                    onClick={() => {
                      handleAddNewPatient();
                      setSidebarOpen(false);
                    }}
                    className="px-2 py-2 text-xs text-[#475569] hover:text-white hover:bg-[#1e293b] rounded-md cursor-pointer transition-all flex items-center gap-2"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
                    Add Patient
                  </div>
                  <div
                    onClick={() => {
                      setShowPatientsListModal(true);
                      setSidebarOpen(false);
                    }}
                    className="px-2 py-2 text-xs text-[#475569] hover:text-white hover:bg-[#1e293b] rounded-md cursor-pointer transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#2563eb]" />
                      All Patients
                    </div>
                    <span className="bg-[#2563eb] text-white px-1.5 py-0.5 rounded text-xs font-bold">
                      {savedPatients.length}
                    </span>
                  </div>
                </div>
              </div>

              {[
                { icon: Calendar, label: "Appointments", view: "appointments" },
                {
                  icon: Stethoscope,
                  label: "Medical Records",
                  view: "records",
                },
                { icon: Pill, label: "Prescriptions", view: "prescriptions" },
                { icon: FileText, label: "Templates", view: "templates" },
              ].map(({ icon: Icon, label, view }) => (
                <div
                  key={label}
                  onClick={() => {
                    setActiveView(view);
                    setSidebarOpen(false);
                  }}
                  className="flex items-center gap-2.5 px-3 py-2.5 text-[#94a3b8] hover:text-white hover:bg-[#1e293b] rounded-lg cursor-pointer transition-all text-sm font-medium"
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {label}
                </div>
              ))}
            </div>
          </nav>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#1e293b]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#1e293b] rounded-full flex items-center justify-center ring-1 ring-[#334155] flex-shrink-0">
              <img
                src={facilityInfo.logoUrl}
                alt=""
                className="max-h-[65%] max-w-[65%] object-contain"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-white truncate">
                {user?.name || "User"}
              </div>
              <div className="text-xs text-[#475569] truncate">
                {user?.email || "email@example.com"}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-[#475569] hover:text-[#ef4444] hover:bg-[#1e293b] rounded-lg transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// ── Main Dashboard ─────────────────────────────────────────────────────────
const HealthcareDashboard = () => {
  // ── UI state ───────────────────────────────────────────────────────────────
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [inputMode, setInputMode] = useState("manual");
  const [documentType, setDocumentType] = useState("invoice");
  const [activeView, setActiveView] = useState("home");
  const [showPreview, setShowPreview] = useState(false);
  const [showInvoicesList, setShowInvoicesList] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showPatientsListModal, setShowPatientsListModal] = useState(false);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSickNoteModal, setShowSickNoteModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // ── Auth ───────────────────────────────────────────────────────────────────
  const { user, authUser } = useAuth();
  const location = useLocation();

  // ── Document state ─────────────────────────────────────────────────────────
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceId, setInvoiceId] = useState(null);
  const [savedInvoices, setSavedInvoices] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("professional");

  // ── Patient state ──────────────────────────────────────────────────────────
  const [patients, setPatients] = useState([]);
  const [savedPatients, setSavedPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] =
    useState(null);

  // ── Patient form fields ────────────────────────────────────────────────────
  const [patientName, setPatientName] = useState("Sarah Johnson");
  const [patientId, setPatientId] = useState("PAT-2026-1234");
  const [patientEmail, setPatientEmail] = useState("sarah.johnson@example.com");
  const [patientPhone, setPatientPhone] = useState("082 123 4567");
  const [patientAddress, setPatientAddress] = useState(
    "123 Main Street, Pretoria, 0001",
  );
  const [patientDOB, setPatientDOB] = useState("1985-05-15");
  const [patientGender, setPatientGender] = useState("Female");
  const [insuranceProvider, setInsuranceProvider] =
    useState("Discovery Health");
  const [insuranceNumber, setInsuranceNumber] = useState("DH123456789");
  const [diagnosis, setDiagnosis] = useState("Annual Health Checkup");
  const [treatmentPlan, setTreatmentPlan] = useState(
    "Routine examination and blood work",
  );
  const [prescription, setPrescription] = useState("");

  // ── Items ──────────────────────────────────────────────────────────────────
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({
    description: "",
    rate: "",
    qty: "",
    type: "Service",
  });

  // ── Payment / stamp ────────────────────────────────────────────────────────
  const [paymentStatus, setPaymentStatus] = useState({
    totalPaid: 0,
    balanceDue: 0,
    status: "pending",
  });
  const [stampSettings, setStampSettings] = useState({
    text: "APPROVED",
    color: "#d32f2f",
    showDate: false,
    enabled: false,
  });

  // ── Facility info ──────────────────────────────────────────────────────────
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

  // Design tokens
  const inputCls =
    "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md bg-white text-[#1e293b] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-colors";
  const labelCls =
    "block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5";

  // Derived totals
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const vat = subtotal * 0.15;
  const total = subtotal + vat;

  // ── Effects ────────────────────────────────────────────────────────────────
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
      setIsMobile(w < 768);
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
  useEffect(() => {
    loadPaymentStatus();
  }, [invoiceId, user?.uid]);
  useEffect(() => {
    if (!invoiceId)
      setPaymentStatus({ totalPaid: 0, balanceDue: total, status: "pending" });
  }, [total, invoiceId]);

  // ── Loaders ────────────────────────────────────────────────────────────────
  const loadFacilityInfo = async () => {
    if (!user?.uid) return;
    try {
      const db = getFirestore();
      const snap = await getDoc(
        doc(db, "users", user.uid, "settings", "facilityInfo"),
      );
      if (snap.exists()) setFacilityInfo(snap.data());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadPatients = async () => {
    try {
      const q = query(
        collection(db, "users", user.uid, "patients"),
        orderBy("createdAt", "desc"),
      );
      const snap = await getDocs(q);
      setPatients(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
    }
  };

  const loadSavedInvoices = async () => {
    if (!user?.uid) return;
    const db = getFirestore();
    const q = query(
      collection(db, "users", user.uid, "invoices"),
      orderBy("createdAt", "desc"),
      limit(50),
    );
    const snap = await getDocs(q);
    setSavedInvoices(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  const loadPaymentStatus = async () => {
    if (!user?.uid || !invoiceId) {
      setPaymentStatus({ totalPaid: 0, balanceDue: total, status: "pending" });
      return;
    }
    try {
      const snap = await getDoc(
        doc(db, "users", user.uid, "invoices", invoiceId),
      );
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

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleAddNewPatient = () => {
    setSelectedPatient(null);
    setShowPatientModal(true);
  };
  const handleEditPatient = (p) => {
    setSelectedPatient(p);
    setShowPatientModal(true);
  };

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
    if (data.medical?.treatmentPlan)
      setTreatmentPlan(data.medical.treatmentPlan);
    if (data.medical?.prescription) setPrescription(data.medical.prescription);
    if (data.items?.length > 0) setItems(data.items);
    alert("✅ Medical data extracted and populated successfully!");
  };

  const buildInvoicePayload = (numberToUse) => ({
    invoiceNumber: numberToUse,
    locked: true,
    status: paymentStatus.status || "pending",
    dates: { serviceDate: new Date().toISOString(), completedDate: null },
    patient: {
      name: patientName,
      email: patientEmail,
      phone: patientPhone,
      address: patientAddress,
      patientId,
      dateOfBirth: patientDOB,
      gender: patientGender,
      insuranceProvider,
      insuranceNumber,
    },
    medical: { diagnosis, treatmentPlan, prescription },
    items,
    totals: {
      subtotal,
      vat,
      total,
      paid: paymentStatus.totalPaid || 0,
      due: paymentStatus.balanceDue || total,
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
    const data = buildInvoicePayload(numberToUse);
    if (invoiceId) {
      await updateDoc(doc(db, "users", user.uid, "invoices", invoiceId), {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } else {
      const ref = await addDoc(
        collection(db, "users", user.uid, "invoices"),
        data,
      );
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
  };

  const handleAddItem = () => {
    if (!newItem.description || !newItem.qty) return;
    const rate = Number(newItem.rate) || 0;
    const qty = Number(newItem.qty);
    setItems((prev) => [
      ...prev,
      {
        description: newItem.description,
        type: newItem.type || "Service",
        rate,
        qty,
        amount: rate * qty,
      },
    ]);
    setNewItem({ description: "", rate: "", qty: "", type: "Service" });
  };

  const handleProcessPayment = async () => {
    if (!invoiceId || !user?.uid) {
      alert("Please save the invoice before processing payment");
      return;
    }
    try {
      const snap = await getDoc(
        doc(db, "users", user.uid, "invoices", invoiceId),
      );
      if (snap.exists()) {
        setSelectedInvoiceForPayment({ id: invoiceId, ...snap.data() });
        setShowPaymentModal(true);
      } else {
        alert("Invoice not found. Please save the invoice first.");
      }
    } catch (e) {
      alert("Failed to load invoice for payment");
    }
  };

  const handlePaymentComplete = () => {
    loadSavedInvoices();
    loadPaymentStatus();
    setShowPaymentModal(false);
  };

  const handleSavePDF = async () => {
    if (!user?.uid || !invoiceId) {
      alert("Please save the invoice before exporting PDF");
      return;
    }
    const snap = await getDoc(
      doc(db, "users", user.uid, "invoices", invoiceId),
    );
    if (!snap.exists()) {
      alert("Please save first");
      return;
    }
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
    try {
      await signOut(getAuth());
    } catch (e) {
      console.error(e);
    }
  };

  // Status badge helper
  const statusBadge = (s) =>
    s === "paid"
      ? "bg-[#dcfce7] text-[#166534]"
      : s === "partially_paid"
        ? "bg-[#fef3c7] text-[#92400e]"
        : s === "pending"
          ? "bg-[#dbeafe] text-[#1e40af]"
          : "bg-[#f1f5f9] text-[#475569]";

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
    {
      label: "Preview",
      icon: Eye,
      onClick: () => setShowPreview(true),
      className:
        "flex items-center gap-1.5 px-3 py-1.5 bg-[#0f172a] hover:bg-[#1e293b] text-white text-sm font-medium rounded-md transition-colors whitespace-nowrap",
    },
    {
      label: "Print",
      icon: Printer,
      onClick: handlePrint,
      variant: "secondary",
    },
    {
      label: "New",
      icon: Plus,
      onClick: handleNewInvoice,
      className:
        "flex items-center gap-1.5 px-3 py-1.5 bg-[#059669] hover:bg-[#047857] text-white text-sm font-medium rounded-md transition-colors whitespace-nowrap",
    },
    {
      label: "Send",
      icon: Send,
      className:
        "flex items-center gap-1.5 px-3 py-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium rounded-md transition-colors whitespace-nowrap",
    },
    {
      label: "Save PDF",
      icon: Download,
      onClick: handleSavePDF,
      className:
        "flex items-center gap-1.5 px-3 py-1.5 bg-[#0891b2] hover:bg-[#0e7490] text-white text-sm font-medium rounded-md transition-colors whitespace-nowrap",
    },
    {
      label: "Save",
      icon: Save,
      onClick: handleSaveInvoice,
      className:
        "flex items-center gap-1.5 px-3 py-1.5 bg-[#3b82f6] hover:bg-[#2563eb] text-white text-sm font-medium rounded-md transition-colors whitespace-nowrap",
    },
    
  ];

  const mobileDashboardActions = [
    {
      label: "Save",
      icon: Save,
      onClick: handleSaveInvoice,
      className:
        "flex items-center gap-1.5 px-3 py-2 bg-[#3b82f6] text-white rounded-md text-xs font-medium active:scale-95 whitespace-nowrap",
    },
    {
      label: "Send",
      icon: Send,
      className:
        "flex items-center gap-1.5 px-3 py-2 bg-[#059669] text-white rounded-md text-xs font-medium active:scale-95 whitespace-nowrap",
    },
    {
      label: "PDF",
      icon: Download,
      onClick: handleSavePDF,
      className:
        "flex items-center gap-1.5 px-3 py-2 bg-[#0891b2] text-white rounded-md text-xs font-medium active:scale-95 whitespace-nowrap",
    },
    {
      label: "Print",
      icon: Printer,
      onClick: handlePrint,
      className:
        "flex items-center gap-1.5 px-3 py-2 bg-white border border-[#e2e8f0] text-[#374151] rounded-md text-xs font-medium active:scale-95 whitespace-nowrap",
    },
  ];

  return (
    <div className="h-screen w-full overflow-hidden flex flex-col bg-[#f0f2f5]">
      {/* Print area */}
      <div
        id="print-area"
        className="hidden print:block bg-white"
        style={{ width: "210mm", minHeight: "297mm" }}
      >
        <TemplateRenderer {...templateProps} />
      </div>

      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* ── Sidebar ────────────────────────────────────────────────────── */}
        <HealthcareSidebar
          user={user}
          activeView={activeView}
          setActiveView={setActiveView}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          setShowSettings={setShowSettings}
          handleNewInvoice={handleNewInvoice}
          facilityInfo={facilityInfo}
          savedInvoices={savedInvoices}
          savedPatients={savedPatients}
          handleLogout={handleLogout}
          setShowPatientsListModal={setShowPatientsListModal}
          handleAddNewPatient={handleAddNewPatient}
          setShowInvoicesList={setShowInvoicesList}
        />

        {/* ── Main content ─────────────────────────────────────────────────
            KEY FIX: Add dynamic left margin to compensate for the fixed sidebar.
            - On mobile (< md): no margin — sidebar slides over as an overlay
            - On md+ with sidebar collapsed: ml-16 (matches icon rail width w-16)
            - On md+ with sidebar open:     ml-64 (matches expanded sidebar w-64)
            The transition-all keeps it smooth when toggling.
        ──────────────────────────────────────────────────────────────────── */}
        <div
          className={`flex-1 overflow-hidden flex flex-col min-h-0 transition-all duration-300 ${
            sidebarOpen ? "md:ml-64" : "md:ml-16"
          }`}
        >
          <AppHeader
            actions={headerActions}
            mobileActions={mobileDashboardActions}
            onSettingsOpen={() => setShowSettings(true)}
          />

          {/* ── Modals ──────────────────────────────────────────────────── */}
          {showSettings && (
            <BusinessSettingsModal onClose={() => setShowSettings(false)} />
          )}
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

          {/* ── Invoices list modal ────────────────────────────────────── */}
          {showInvoicesList && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden border border-[#e2e8f0]">
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0] bg-[#f8fafc]">
                  <div>
                    <h2 className="text-base font-semibold text-[#1e293b]">
                      All Invoices
                    </h2>
                    <p className="text-xs text-[#64748b] mt-0.5">
                      {savedInvoices.length} records
                    </p>
                  </div>
                  <button
                    onClick={() => setShowInvoicesList(false)}
                    className="p-1.5 text-[#64748b] hover:text-[#1e293b] hover:bg-[#e2e8f0] rounded-lg transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {savedInvoices.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16">
                      <Receipt className="w-10 h-10 text-[#cbd5e1] mb-3" />
                      <p className="text-sm text-[#94a3b8]">
                        No invoices found
                      </p>
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead>
                        <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                          {[
                            "Invoice #",
                            "Patient",
                            "Diagnosis",
                            "Insurance",
                            "Total",
                            "Status",
                          ].map((h) => (
                            <th
                              key={h}
                              className="px-5 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wide"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {savedInvoices.map((inv) => (
                          <tr
                            key={inv.id}
                            onClick={() => loadInvoice(inv)}
                            className="border-b border-[#f1f5f9] hover:bg-[#f8fafc] cursor-pointer transition-colors"
                          >
                            <td className="px-5 py-3 text-sm font-semibold text-[#3b82f6]">
                              {inv.invoiceNumber || "N/A"}
                            </td>
                            <td className="px-5 py-3 text-sm text-[#374151]">
                              {inv.patient?.name || "N/A"}
                            </td>
                            <td className="px-5 py-3 text-sm text-[#64748b]">
                              {inv.medical?.diagnosis || "N/A"}
                            </td>
                            <td className="px-5 py-3 text-sm text-[#64748b]">
                              {inv.patient?.insuranceProvider || "N/A"}
                            </td>
                            <td className="px-5 py-3 text-sm font-semibold text-[#1e293b]">
                              R{inv.totals?.total?.toFixed(2) || "0.00"}
                            </td>
                            <td className="px-5 py-3">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${statusBadge(inv.status)}`}
                              >
                                {inv.status === "partially_paid"
                                  ? "Partial"
                                  : inv.status || "Pending"}
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
                      <h2 className="text-sm font-semibold text-[#1e293b]">
                        Invoice Preview
                      </h2>
                      <p className="text-xs text-[#64748b]">
                        {invoiceNumber || "Draft"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrint}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-medium rounded-lg transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Print
                    </button>
                    <button
                      onClick={handleSavePDF}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#059669] hover:bg-[#047857] text-white text-xs font-medium rounded-lg transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Save PDF
                    </button>
                    <button
                      onClick={() => setShowPreview(false)}
                      className="p-1.5 text-[#64748b] hover:text-[#1e293b] hover:bg-[#e2e8f0] rounded-lg transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto bg-[#e2e8f0] p-6">
                  <div
                    className="mx-auto bg-white shadow-xl"
                    style={{ width: "210mm", minHeight: "297mm" }}
                  >
                    <TemplateRenderer {...templateProps} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Non-invoice views ──────────────────────────────────────── */}
          {activeView === "practice-overview" && (
            <div className="flex-1 overflow-y-auto p-4">
              <PracticeOverview
                onAddNewPatient={handleAddNewPatient}
                user={user}
              />
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
          {activeView === "home" && (
            <div className="flex-1 overflow-y-auto p-4">
              <HomeView onCreateNewInvoice={handleNewInvoice} user={user} />
            </div>
          )}

          {/* ── Invoice view — split layout ────────────────────────────── */}
          {activeView === "invoice" && (
            <div className="flex-1 overflow-hidden flex min-h-0">
              {/* ── LEFT: Form panel ─────────────────────────────────── */}
              <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 min-w-0">
                <div className="space-y-5">
                  {/* ── Summary stat cards ────────────────────────────── */}
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      {
                        label: "Total Amount",
                        value: `R${total.toFixed(2)}`,
                        icon: DollarSign,
                        iconBg: "bg-[#dbeafe]",
                        iconColor: "text-[#2563eb]",
                        textColor: "text-[#1e293b]",
                      },
                      {
                        label: "Paid",
                        value: `R${paymentStatus.totalPaid.toFixed(2)}`,
                        icon: CheckSquare,
                        iconBg:
                          paymentStatus.totalPaid > 0
                            ? "bg-[#dcfce7]"
                            : "bg-[#f1f5f9]",
                        iconColor:
                          paymentStatus.totalPaid > 0
                            ? "text-[#059669]"
                            : "text-[#94a3b8]",
                        textColor:
                          paymentStatus.totalPaid > 0
                            ? "text-[#059669]"
                            : "text-[#1e293b]",
                      },
                      {
                        label: "Balance Due",
                        value: `R${paymentStatus.balanceDue.toFixed(2)}`,
                        icon: Wallet,
                        iconBg:
                          paymentStatus.balanceDue <= 0
                            ? "bg-[#dcfce7]"
                            : "bg-[#fef2f2]",
                        iconColor:
                          paymentStatus.balanceDue <= 0
                            ? "text-[#059669]"
                            : "text-[#dc2626]",
                        textColor:
                          paymentStatus.balanceDue <= 0
                            ? "text-[#059669]"
                            : "text-[#dc2626]",
                      },
                    ].map(
                      ({
                        label,
                        value,
                        icon: Icon,
                        iconBg,
                        iconColor,
                        textColor,
                      }) => (
                        <div
                          key={label}
                          className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-semibold text-[#64748b] uppercase tracking-wide">
                              {label}
                            </span>
                            <div
                              className={`w-8 h-8 ${iconBg} rounded-lg flex items-center justify-center`}
                            >
                              <Icon className={`w-4 h-4 ${iconColor}`} />
                            </div>
                          </div>
                          <div className={`text-xl font-bold ${textColor}`}>
                            {value}
                          </div>
                        </div>
                      ),
                    )}
                  </div>

                  {/* ── Payment status banner ──────────────────────────── */}
                  {invoiceId && (
                    <div
                      className={`px-5 py-3.5 rounded-xl border flex items-center justify-between ${
                        paymentStatus.status === "paid"
                          ? "bg-[#f0fdf4] border-[#bbf7d0]"
                          : paymentStatus.status === "partially_paid"
                            ? "bg-[#fffbeb] border-[#fde68a]"
                            : "bg-[#eff6ff] border-[#bfdbfe]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            paymentStatus.status === "paid"
                              ? "bg-[#dcfce7]"
                              : paymentStatus.status === "partially_paid"
                                ? "bg-[#fef3c7]"
                                : "bg-[#dbeafe]"
                          }`}
                        >
                          <CreditCard
                            className={`w-4 h-4 ${
                              paymentStatus.status === "paid"
                                ? "text-[#059669]"
                                : paymentStatus.status === "partially_paid"
                                  ? "text-[#d97706]"
                                  : "text-[#2563eb]"
                            }`}
                          />
                        </div>
                        <div
                          className={`text-sm font-semibold ${
                            paymentStatus.status === "paid"
                              ? "text-[#166534]"
                              : paymentStatus.status === "partially_paid"
                                ? "text-[#92400e]"
                                : "text-[#1e40af]"
                          }`}
                        >
                          {paymentStatus.status === "paid"
                            ? "Invoice Fully Paid"
                            : paymentStatus.status === "partially_paid"
                              ? `R${paymentStatus.totalPaid.toFixed(2)} paid · R${paymentStatus.balanceDue.toFixed(2)} remaining`
                              : `Payment Pending — R${paymentStatus.balanceDue.toFixed(2)} due`}
                        </div>
                      </div>
                      {paymentStatus.status !== "paid" && (
                        <button
                          onClick={handleProcessPayment}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#e2e8f0] text-[#374151] text-sm font-medium rounded-lg hover:bg-[#f8fafc] transition-colors shadow-sm"
                        >
                          <CreditCard className="w-4 h-4" />
                          Record Payment
                        </button>
                      )}
                    </div>
                  )}

                  {/* ── Main form card ──────────────────────────────────── */}
                  <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
                    {/* Input mode tabs */}
                    <div className="flex border-b border-[#e2e8f0] bg-[#f8fafc]">
                      <button
                        onClick={() => setInputMode("manual")}
                        className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all border-b-2 -mb-px ${
                          inputMode === "manual"
                            ? "border-[#3b82f6] text-[#3b82f6] bg-white"
                            : "border-transparent text-[#64748b] hover:text-[#374151]"
                        }`}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                        Manual Entry
                      </button>
                      <button
                        onClick={() => setInputMode("ai")}
                        className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all border-b-2 -mb-px ${
                          inputMode === "ai"
                            ? "border-[#7c3aed] text-[#7c3aed] bg-white"
                            : "border-transparent text-[#64748b] hover:text-[#374151]"
                        }`}
                      >
                        <Sparkles className="w-4 h-4" />
                        AI Assistant
                      </button>
                    </div>

                    {inputMode === "ai" && (
                      <div className="p-6 border-b border-[#e2e8f0]">
                        <MedicalAIExtractor
                          onDataExtracted={handleAIDataExtracted}
                          documentType={documentType}
                        />
                      </div>
                    )}

                    {inputMode === "manual" && (
                      <div className="p-6">
                        <MedicalMultiStepForm
                          patientName={patientName}
                          setPatientName={setPatientName}
                          patientId={patientId}
                          setPatientId={setPatientId}
                          patientEmail={patientEmail}
                          setPatientEmail={setPatientEmail}
                          patientPhone={patientPhone}
                          setPatientPhone={setPatientPhone}
                          patientDOB={patientDOB}
                          setPatientDOB={setPatientDOB}
                          patientGender={patientGender}
                          setPatientGender={setPatientGender}
                          patientAddress={patientAddress}
                          setPatientAddress={setPatientAddress}
                          insuranceProvider={insuranceProvider}
                          setInsuranceProvider={setInsuranceProvider}
                          insuranceNumber={insuranceNumber}
                          setInsuranceNumber={setInsuranceNumber}
                          diagnosis={diagnosis}
                          setDiagnosis={setDiagnosis}
                          treatmentPlan={treatmentPlan}
                          setTreatmentPlan={setTreatmentPlan}
                          prescription={prescription}
                          setPrescription={setPrescription}
                          showSickNoteModal={showSickNoteModal}
                          setShowSickNoteModal={setShowSickNoteModal}
                          items={items}
                          newItem={newItem}
                          setNewItem={setNewItem}
                          handleAddItem={handleAddItem}
                        />
                      </div>
                    )}
                  </div>

                 

                  {/* ── Process payment button ──────────────────────────── */}
                  {invoiceId && paymentStatus.status !== "paid" && (
                    <button
                      onClick={handleProcessPayment}
                      className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-xl font-medium transition-colors shadow-sm"
                    >
                      <CreditCard className="w-4 h-4" />
                      Process Payment
                    </button>
                  )}
                </div>
              </div>

              {/* ── RIGHT: Live preview panel ──────────────────────────── */}
              <div className="hidden xl:flex w-[420px] flex-shrink-0 flex-col border-l border-[#e2e8f0] bg-[#e8eaed] overflow-hidden">
                {/* Panel header */}
                <div className="flex items-center justify-between px-4 py-3 bg-[#f8fafc] border-b border-[#e2e8f0] flex-shrink-0">
                  <TemplateSelector
                    selectedTemplate={selectedTemplate}
                    onTemplateChange={setSelectedTemplate}
                  />
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handlePrint}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-[#e2e8f0] text-[#374151] text-xs font-medium rounded-lg hover:bg-[#f1f5f9] transition-colors"
                    >
                      <Printer className="w-3 h-3" />
                      Print
                    </button>
                    <button
                      onClick={handleSavePDF}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-[#3b82f6] text-white text-xs font-medium rounded-lg hover:bg-[#2563eb] transition-colors"
                    >
                      <Download className="w-3 h-3" />
                      PDF
                    </button>
                  </div>
                </div>

                {/* Scrollable preview canvas */}
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
