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
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Printer, Download } from "lucide-react";
import { db } from "../../firebase";
import PatientModal from "./PatientModal";
import PracticeOverview from "./PracticeOverview"; // Add this
import PatientsListModal from "./PatientsListModal";
import PendingPayments from "./PendingPayments";
import AppointmentsCalendar from "./AppointmentsCalendar";
import SignatureStamp from "../SignatureStamp";
import uploadLogoToR2 from "../../utils/uploadLogoToR2";
import SickNoteModal from "./SickNoteModal";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Home,
  Sparkles,
  Settings,
  Users,
  Save,
  Calendar,
  FileText,
  Activity,
  X,
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
  Heart,
  ClipboardList,
  Package,
  Stethoscope,
  Upload,
  Eye,
  Pill,
  UserCheck,
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
const HealthcareDashboard = () => {
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
  const [showPatientsList, setShowPatientsList] = useState(false);
  const [savedPatients, setSavedPatients] = useState([]);
  const [activeTemplate, setActiveTemplate] = useState("classic");
  const [showSickNoteModal, setShowSickNoteModal] = useState(false);
  const [showPatientsListModal, setShowPatientsListModal] = useState(false);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("professional");
  const [patients, setPatients] = useState([]);
  const [activeView, setActiveView] = useState("home");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isInvoicingOpen, setIsInvoicingOpen] = useState(false);
  const [isClientsOpen, setIsClientsOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Payment Processor States
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] =
    useState(null);
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
  const [showSickNote, setShowSickNote] = useState(false);
  const [dateFrom, setDateFrom] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [dateTo, setDateTo] = useState(
    new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  );
  const [doctorName, setDoctorName] = useState("Dr. Jane Smith");
  const [practiceNumber, setPracticeNumber] = useState("MP123456");
  const [additionalNotes, setAdditionalNotes] = useState("");
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

  const loadPatients = async () => {
    try {
      const q = query(
        collection(db, "users", user.uid, "patients"),
        orderBy("createdAt", "desc"),
      );
      const querySnapshot = await getDocs(q);
      const patientsData = [];

      querySnapshot.forEach((doc) => {
        patientsData.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      setPatients(patientsData);
    } catch (error) {
      console.error("Error loading patients:", error);
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

  const handleAddNewPatient = () => {
    setSelectedPatient(null);
    setShowPatientModal(true);
  };

  const handleEditPatient = (patient) => {
    setSelectedPatient(patient);
    setShowPatientModal(true);
  };

  const loadPatient = (patient) => {
    setPatientName(patient.name || "");
    setPatientEmail(patient.email || "");
    setPatientPhone(patient.phone || "");
    setPatientAddress(patient.address || "");
    setPatientId(patient.patientId || "");
    setPatientDOB(patient.dateOfBirth || "");
    setPatientGender(patient.gender || "");
    setInsuranceProvider(patient.insuranceProvider || "");
    setInsuranceNumber(patient.insuranceNumber || "");
  };

  const handlePatientSaved = () => {
    loadPatients();
  };
  const handleNewQuote = () => {
    setDocumentType("quote");
    handleNewInvoice();
  };

  useEffect(() => {
    loadPatients();
  }, []);
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({
    description: "",
    rate: "",
    qty: "",
    type: "Service",
  });
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

    // Load payment status
    setPaymentStatus({
      totalPaid: invoice.totals?.paid || 0,
      balanceDue: invoice.totals?.due || invoice.totals?.total || 0,
      status: invoice.status || "pending",
    });
  };
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const vat = subtotal * 0.15;
  const total = subtotal + vat;
  const handleAIDataExtracted = (extractedData) => {
    // Patient info
    if (extractedData.patient.name) setPatientName(extractedData.patient.name);
    if (extractedData.patient.email)
      setPatientEmail(extractedData.patient.email);
    if (extractedData.patient.phone)
      setPatientPhone(extractedData.patient.phone);
    if (extractedData.patient.address)
      setPatientAddress(extractedData.patient.address);
    if (extractedData.patient.patientId)
      setPatientId(extractedData.patient.patientId);
    if (extractedData.patient.dateOfBirth)
      setPatientDOB(extractedData.patient.dateOfBirth);
    if (extractedData.patient.gender)
      setPatientGender(extractedData.patient.gender);

    // Insurance info
    if (extractedData.insurance.provider)
      setInsuranceProvider(extractedData.insurance.provider);
    if (extractedData.insurance.number)
      setInsuranceNumber(extractedData.insurance.number);

    // Medical info
    if (extractedData.medical.diagnosis)
      setDiagnosis(extractedData.medical.diagnosis);
    if (extractedData.medical.treatmentPlan)
      setTreatmentPlan(extractedData.medical.treatmentPlan);
    if (extractedData.medical.prescription)
      setPrescription(extractedData.medical.prescription);

    // Items
    if (extractedData.items && extractedData.items.length > 0) {
      setItems(extractedData.items);
    }

    alert("✅ Medical data extracted and populated successfully!");
  };
  const handleTestEmail = async () => {
    if (!facilityInfo.emailPassword) {
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
Business: ${facilityInfo.businessName}
Email: ${userEmail}
Provider: ${facilityInfo.emailProvider || "Gmail"}
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
  // Payment Processor Functions
  const handleProcessPayment = async () => {
    if (!invoiceId || !user?.uid) {
      alert("Please save the invoice before processing payment");
      return;
    }

    try {
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

  const handlePaymentComplete = () => {
    loadSavedInvoices();
    loadPaymentStatus();
    setShowPaymentModal(false);
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

  const loadSavedPatients = async () => {
    if (!user?.uid) return;

    const db = getFirestore();
    const patientsRef = collection(db, "users", user.uid, "patients");
    const q = query(patientsRef, orderBy("createdAt", "desc"), limit(50));
    const snapshot = await getDocs(q);

    const patients = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setSavedPatients(patients.filter((p) => !p._placeholder));
  };

  const handleSavePatient = async () => {
    if (!user?.uid) return;

    if (!patientName || !patientPhone) {
      alert("Please enter patient name and phone number");
      return;
    }

    try {
      const db = getFirestore();
      const patientData = {
        name: patientName,
        email: patientEmail,
        phone: patientPhone,
        address: patientAddress,
        patientId: patientId || `PAT-${Date.now()}`,
        dateOfBirth: patientDOB,
        gender: patientGender,
        insuranceProvider,
        insuranceNumber,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(collection(db, "users", user.uid, "patients"), patientData);
      alert("Patient saved successfully!");
      loadSavedPatients();
    } catch (error) {
      console.error("Error saving patient:", error);
      alert("Failed to save patient");
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
    setPatientName(savedInvoice.patient.name);
    setPatientEmail(savedInvoice.patient.email);
    setPatientPhone(savedInvoice.patient.phone);
    setPatientAddress(savedInvoice.patient.address);
    setDiagnosis(savedInvoice.medical.diagnosis);
    setTreatmentPlan(savedInvoice.medical.treatmentPlan);

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

  useEffect(() => {
    if (user?.uid) {
      loadFacilityInfo();
    }
  }, [user]);

  useEffect(() => {
    const fetchFacilityInfo = async () => {
      if (!user?.uid) return;

      try {
        const db = getFirestore();
        const docRef = doc(db, "users", user.uid, "settings", "facilityInfo");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setFacilityInfo(docSnap.data());
        } else {
          console.log("No facility info found");
        }
      } catch (error) {
        console.error("Error fetching facility info:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFacilityInfo();
  }, [user]);

  const loadFacilityInfo = async () => {
    if (!user?.uid) return;

    try {
      const db = getFirestore();
      const docRef = doc(db, "users", user.uid, "settings", "facilityInfo");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setFacilityInfo(docSnap.data());
      }
    } catch (error) {
      console.error("Error loading facility info:", error);
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
      setFacilityInfo((prev) => ({ ...prev, uploading: true }));

      // ✅ Upload to Cloudflare R2 (Worker handles userId)
      const logoUrl = await uploadLogoToR2(file, authUser);

      setFacilityInfo((prev) => ({
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
      setFacilityInfo((prev) => ({ ...prev, uploading: false }));
    }
  };

  const handleSaveFacilityInfo = async () => {
    if (!user?.uid) return;

    try {
      const db = getFirestore();
      const docRef = doc(db, "users", user.uid, "settings", "facilityInfo");
      await setDoc(docRef, facilityInfo);
      alert("Facility information saved successfully!");
      setShowSettings(false);
    } catch (error) {
      console.error("Error saving facility info:", error);
      alert("Failed to save facility information");
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

  const buildInvoicePayload = (numberToUse) => ({
    invoiceNumber: numberToUse,
    locked: true,
    status: paymentStatus.status || "pending",

    dates: {
      serviceDate: new Date().toISOString(),
      completedDate: null,
    },

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

    medical: {
      diagnosis,
      treatmentPlan,
      prescription,
    },

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

    const invoiceData = buildInvoicePayload(numberToUse);

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

    alert("Invoice saved and locked");
    loadSavedInvoices();
  };
  const handleConvertToInvoice = async () => {
    if (!user?.uid) return;

    if (!invoiceId) {
      alert("Please save the quote first before converting to invoice");
      return;
    }

    if (
      !window.confirm(
        "Convert this quote to an invoice? This will create a new invoice with the same details.",
      )
    ) {
      return;
    }

    try {
      const db = getFirestore();

      const newInvoiceNumber = await generateInvoiceNumber(user.uid);

      const invoiceData = buildInvoicePayload(newInvoiceNumber);
      invoiceData.documentType = "invoice";
      invoiceData.convertedFromQuote = invoiceId;
      invoiceData.convertedFromQuoteNumber = invoiceNumber;
      invoiceData.convertedAt = serverTimestamp();

      const invoiceRef = await addDoc(
        collection(db, "users", user.uid, "invoices"),
        invoiceData,
      );

      await updateDoc(doc(db, "users", user.uid, "invoices", invoiceId), {
        convertedToInvoice: true,
        convertedToInvoiceId: invoiceRef.id,
        convertedToInvoiceNumber: newInvoiceNumber,
        convertedAt: serverTimestamp(),
        status: "converted",
      });

      setDocumentType("invoice");
      setInvoiceId(invoiceRef.id);
      setInvoiceNumber(newInvoiceNumber);

      alert(`Quote successfully converted to Invoice ${newInvoiceNumber}`);
      loadSavedInvoices();
    } catch (error) {
      console.error("Error converting quote to invoice:", error);
      alert("Failed to convert quote to invoice");
    }
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

    // Reset payment status
    setPaymentStatus({
      totalPaid: 0,
      balanceDue: 0,
      status: "pending",
    });

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
    documentType === "quote" &&
      invoiceId && {
        label: "Convert to Invoice",
        icon: FileText,
        onClick: handleConvertToInvoice,
        className:
          "flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-sm font-semibold rounded-lg hover:from-purple-700 transition-colors shadow-sm whitespace-nowrap",
      },

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
      onClick: documentType === "quote" ? handleNewQuote : handleNewInvoice,
      className:
        "flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-sm font-semibold rounded-lg hover:from-emerald-700 transition-colors shadow-sm whitespace-nowrap",
    },
    {
      label: "Send",
      icon: Send,
      className:
        "flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold rounded-lg hover:from-blue-700 transition-colors shadow-sm whitespace-nowrap",
    },
    {
      label: "Save PDF",
      icon: Download,
      onClick: handleSavePDF,
      className:
        "flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-600 to-orange-700 text-white text-sm font-semibold rounded-lg hover:from-orange-700 transition-colors shadow-sm whitespace-nowrap",
    },
    {
      label: "Save",
      icon: Save,
      onClick: handleSaveInvoice,
      className:
        "flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-600 to-amber-700 text-white text-sm font-semibold rounded-lg hover:from-amber-700 transition-colors shadow-sm whitespace-nowrap",
    },
    {
      label: "Logout",
      icon: LogOut,
      onClick: handleLogout,
      className:
        "flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-semibold rounded-lg hover:from-red-700 transition-colors shadow-sm whitespace-nowrap",
    },
  ].filter(Boolean);

  const mobileDashboardActions = [
    documentType === "quote" &&
      invoiceId && {
        label: "To Invoice",
        icon: FileText,
        onClick: handleConvertToInvoice,
        className:
          "flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg text-xs font-semibold shadow-lg transition-all active:scale-95 whitespace-nowrap",
      },
    {
      label: "Save",
      icon: Save,
      onClick: handleSaveInvoice,
      className:
        "flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-stone-600 to-stone-700 text-white rounded-lg text-xs font-semibold shadow-lg transition-all active:scale-95 whitespace-nowrap",
    },
    {
      label: "Send",
      icon: Send,
      className:
        "flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg text-xs font-semibold shadow-lg transition-all active:scale-95 whitespace-nowrap",
    },
    {
      label: "PDF",
      icon: Download,
      onClick: handleSavePDF,
      className:
        "flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg text-xs font-semibold shadow-lg transition-all active:scale-95 whitespace-nowrap",
    },
    {
      label: "Print",
      icon: Printer,
      onClick: handlePrint,
      className:
        "flex items-center gap-1.5 px-3 py-2 bg-white border-2 border-slate-200 text-slate-700 rounded-lg text-xs font-semibold shadow-sm transition-all active:scale-95 whitespace-nowrap",
    },
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
              onClick={() => setActiveView("practice-overview")}
              className="p-2 text-slate-400 hover:text-white hover:bg-blue-600/80 rounded-lg transition-all duration-200 w-10 h-10 flex items-center justify-center group"
              title="Practice Overview"
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
              onClick={() => setActiveView("templates")}
              className="p-2 text-slate-400 hover:text-white hover:bg-blue-600/80 rounded-lg transition-all duration-200 w-10 h-10 flex items-center justify-center group"
              title="Invoice Templates"
            >
              <FileText className="w-5 h-5" />
            </button>

            <button
              className="p-2 text-slate-400 hover:text-white hover:bg-blue-600/80 rounded-lg transition-all duration-200 w-10 h-10 flex items-center justify-center group"
              title="Patients"
            >
              <Users className="w-5 h-5" />
            </button>

            <button
              onClick={() => setActiveView("appointments")}
              className="p-2 text-slate-400 hover:text-white hover:bg-blue-600/80 rounded-lg transition-all duration-200 w-10 h-10 flex items-center justify-center group"
              title="Appointments"
            >
              <Calendar className="w-5 h-5" />
            </button>

            <button
              className="p-2 text-slate-400 hover:text-white hover:bg-blue-600/80 rounded-lg transition-all duration-200 w-10 h-10 flex items-center justify-center group"
              title="Medical Records"
            >
              <Stethoscope className="w-5 h-5" />
            </button>

            <button
              className="p-2 text-slate-400 hover:text-white hover:bg-blue-600/80 rounded-lg transition-all duration-200 w-10 h-10 flex items-center justify-center group"
              title="Prescriptions"
            >
              <Pill className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* User Icon at Bottom */}
        <div className="absolute bottom-4 md:bottom-6 left-0 right-0 flex justify-center">
          <div className="relative group">
            <div className="absolute inset-0 rounded-full opacity-50 group-hover:opacity-100 blur-md transition-opacity duration-300"></div>
            <div className="relative w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-full flex items-center justify-center ring-2 ring-cyan-700 shadow-lg group-hover:ring-4 group-hover:ring-cyan-500/50 transition-all duration-300">
              <img src={facilityInfo.logoUrl} alt="" />
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
                  setActiveView("practice-overview");
                  setSidebarOpen(false);
                }}
                className="flex items-center space-x-3 px-3 py-2.5 text-slate-300 hover:text-white hover:bg-blue-600/20 hover:border-l-4 hover:border-blue-500 rounded-lg cursor-pointer transition-all duration-200"
              >
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm font-medium">Practice Overview</span>
              </div>

              {/* Invoices Section */}
              <div className="mt-2">
                <div className="flex items-center justify-between px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200">
                  <div className="flex items-center space-x-3 md:space-x-4">
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
                      setSidebarOpen(false);
                    }}
                    className="px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700/30 rounded-lg cursor-pointer transition-all duration-200"
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
                      <span>All Invoices</span>
                      <span className=" text-blue-300 px-2 py-0.5 rounded-full text-xs font-semibold">
                        {savedInvoices.length}
                      </span>
                    </div>
                  </div>
                  <div
                    onClick={() => setActiveView("pending")}
                    className="px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700/30 rounded-lg cursor-pointer transition-all duration-200"
                  >
                    Pending Payment
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

              {/* Patients Section */}
              <div className="mt-2">
                <div className="flex items-center justify-between px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200">
                  <div className="flex items-center space-x-3 md:space-x-4">
                    <Users className="w-5 h-5" />
                    <span className="text-sm font-medium">Patients</span>
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </div>

                <div className="ml-4 mt-1 space-y-1 border-l-2 border-slate-700/50 pl-4">
                  <div
                    onClick={handleAddNewPatient}
                    className="px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700/30 rounded-lg cursor-pointer transition-all duration-200"
                  >
                    Add Patient
                  </div>
                  <div
                    onClick={() => {
                      setShowPatientsListModal(true);
                      setSidebarOpen(false);
                    }}
                    className="px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700/30 rounded-lg cursor-pointer transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <span>All Patients</span>
                      <span className=" text-blue-300 px-2 py-0.5 rounded-full text-xs font-semibold">
                        {savedPatients.length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div
                onClick={() => {
                  setActiveView("appointments");
                  setSidebarOpen(false);
                }}
                className="flex items-center space-x-3 px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200"
              >
                <Calendar className="w-5 h-5" />
                <span className="text-sm font-medium">Appointments</span>
              </div>

              <div className="flex items-center space-x-3 px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200">
                <Stethoscope className="w-5 h-5" />
                <span className="text-sm font-medium">Medical Records</span>
              </div>

              <div className="flex items-center space-x-3 px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200">
                <Pill className="w-5 h-5" />
                <span className="text-sm font-medium">Prescriptions</span>
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
                  src={facilityInfo.logoUrl}
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
        <div className="flex flex-col h-screen">
          <AppHeader
            actions={headerActions}
            mobileActions={mobileDashboardActions}
            onSettingsOpen={() => setShowSettings(true)}
          />

          <div className="flex-1 overflow-y-auto">
            {/* Facility Settings Modal */}
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
              onPatientSaved={handlePatientSaved}
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

            {/* Payment Processor Modal */}
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
                                  Patient: {invoice.patient?.name || "N/A"}
                                </div>
                                <div className="text-sm text-gray-600">
                                  Diagnosis:{" "}
                                  {invoice.medical?.diagnosis || "N/A"}
                                </div>
                                <div className="text-sm text-gray-600">
                                  Insurance:{" "}
                                  {invoice.patient?.insuranceProvider || "N/A"}
                                </div>
                              </div>
                              <div className="text-right">
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
                                <div
                                  className={`text-xs mt-1 px-2 py-1 rounded ${
                                    invoice.status === "paid"
                                      ? "bg-emerald-100 text-emerald-700"
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
            {/* ── Invoice Preview Modal ─────────────────────────────────────── */}
            {showPreview && (
              <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden">
                  {/* Modal header */}
                  <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#e2e8f0] bg-[#f8fafc] flex-shrink-0">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 bg-[#0f172a] rounded-lg flex items-center justify-center">
                        <Eye className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h2 className="text-sm font-semibold text-[#1e293b]">
                          {documentType === "quote" ? "Quote" : "Invoice"}{" "}
                          Preview
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

                  {/* Scrollable canvas area */}
                  <div className="flex-1 overflow-y-auto bg-[#e2e8f0] p-6">
                    <div
                      className="mx-auto bg-white shadow-xl"
                      style={{ width: "210mm", minHeight: "297mm" }}
                    >
                      <TemplateRenderer
                        templateId={selectedTemplate}
                        businessInfo={facilityInfo}
                        loading={loading}
                        invoiceNumber={invoiceNumber}
                        customerName={patientName}
                        customerEmail={patientEmail}
                        customerPhone={patientPhone}
                        customerAddress={patientAddress}
                        patientId={patientId}
                        patientDOB={patientDOB}
                        patientGender={patientGender}
                        insuranceProvider={insuranceProvider}
                        insuranceNumber={insuranceNumber}
                        diagnosis={diagnosis}
                        prescription={prescription}
                        items={items}
                        subtotal={subtotal}
                        vat={vat}
                        total={total}
                        serviceType="MEDICAL"
                        documentType="medical"
                        showStamp={stampSettings.enabled}
                        stampText={stampSettings.text}
                        stampColor={stampSettings.color}
                        showStampDate={stampSettings.showDate}
                        paymentStatus={paymentStatus}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeView === "practice-overview" && (
              <PracticeOverview
                onAddNewPatient={handleAddNewPatient}
                user={user}
              />
            )}
            {activeView === "appointments" && (
              <AppointmentsCalendar user={user} />
            )}
            {activeView === "financial-overview" && (
              <FinancialOverview user={user} />
            )}
            {activeView === "pending" && <PendingPayments user={user} />}
            {activeView === "templates" && <Templates user={user} />}
            {activeView === "home" && (
              <HomeView onCreateNewInvoice={handleNewInvoice} user={user} />
            )}
            {activeView === "invoice" && (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                  <div
                    className={`${
                      showInvoice ? "hidden" : "block"
                    } space-y-6 lg:block print:hidden max-h-[calc(100vh-120px)] overflow-y-auto`}
                  >
                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm pt-2 sm:pt-6">
                      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm pt-2 sm:pt-6">
                        <div className="flex border-b border-slate-200">
                          <button
                            onClick={() => setInputMode("manual")}
                            className={`flex-1 px-2 sm:px-6 py-2 sm:py-4 font-semibold text-xs sm:text-base transition-all duration-200 ${inputMode === "manual" ? "bg-white text-blue-600 border-b-2 border-blue-600 shadow-sm" : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`}
                          >
                            <span className="flex items-center justify-center gap-1 sm:gap-2">
                              <svg
                                className="w-4 h-4 sm:w-5 sm:h-5"
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
                              <span className="hidden sm:inline">
                                Manual Entry
                              </span>
                              <span className="sm:hidden">Manual</span>
                            </span>
                          </button>
                          <button
                            onClick={() => setInputMode("ai")}
                            className={`flex-1 px-2 sm:px-6 py-2 sm:py-4 font-semibold text-xs sm:text-base transition-all duration-200 ${inputMode === "ai" ? "bg-white text-purple-600 border-b-2 border-purple-600 shadow-sm" : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`}
                          >
                            <span className="flex items-center justify-center gap-1 sm:gap-2">
                              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                              <span className="hidden sm:inline">
                                AI Assistant
                              </span>
                              <span className="sm:hidden">AI</span>
                            </span>
                          </button>
                        </div>
                        <div className="p-3 sm:p-6">
                          {inputMode === "ai" && (
                            <MedicalAIExtractor
                              onDataExtracted={handleAIDataExtracted}
                              documentType={documentType}
                            />
                          )}
                        </div>
                      </div>

                      {/* Tab Content */}
                      <div className="p-6">
                        {inputMode === "ai" ? (
                          <MedicalAIExtractor
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
                        {/* Payment Status Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <div className="text-sm text-gray-500 mb-1">
                              Total Amount
                            </div>
                            <div className="text-2xl font-semibold text-blue-600">
                              R{total.toFixed(2)}
                            </div>
                          </div>
                          <div
                            className={`p-4 rounded-lg border transition-all ${
                              paymentStatus.totalPaid > 0
                                ? "bg-emerald-50 border-emerald-200"
                                : "bg-white border-gray-200"
                            }`}
                          >
                            <div className="text-sm text-gray-500 mb-1">
                              Paid
                            </div>
                            <div
                              className={`text-2xl font-semibold ${
                                paymentStatus.totalPaid > 0
                                  ? "text-emerald-600"
                                  : "text-gray-600"
                              }`}
                            >
                              R{paymentStatus.totalPaid.toFixed(2)}
                            </div>
                          </div>
                          <div
                            className={`p-4 rounded-lg border transition-all ${
                              paymentStatus.balanceDue <= 0
                                ? "bg-emerald-50 border-emerald-200"
                                : paymentStatus.totalPaid > 0
                                  ? "bg-amber-50 border-amber-200"
                                  : "bg-white border-gray-200"
                            }`}
                          >
                            <div className="text-sm text-gray-500 mb-1">
                              Balance Due
                            </div>
                            <div
                              className={`text-2xl font-semibold ${
                                paymentStatus.balanceDue <= 0
                                  ? "text-emerald-600"
                                  : paymentStatus.totalPaid > 0
                                    ? "text-amber-600"
                                    : "text-red-600"
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
                                    <CreditCard className="w-6 h-6 text-amber-600" />
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
                                    <Wallet className="w-6 h-6 text-rose-600" />
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
                          <MedicalMultiStepForm
                            // Patient Info Props
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
                            // Insurance Info Props
                            insuranceProvider={insuranceProvider}
                            setInsuranceProvider={setInsuranceProvider}
                            insuranceNumber={insuranceNumber}
                            setInsuranceNumber={setInsuranceNumber}
                            // Medical Info Props
                            diagnosis={diagnosis}
                            setDiagnosis={setDiagnosis}
                            treatmentPlan={treatmentPlan}
                            setTreatmentPlan={setTreatmentPlan}
                            prescription={prescription}
                            setPrescription={setPrescription}
                            // Sick Note Props
                            showSickNoteModal={showSickNoteModal}
                            setShowSickNoteModal={setShowSickNoteModal}
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
                                Cash/Card/Medical Aid
                              </span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                              <span className="text-gray-600">
                                Payment Terms:
                              </span>
                              <span className="text-sm font-medium">
                                Due on Service
                              </span>
                            </div>
                            <div className="flex justify-between py-2">
                              <span className="text-gray-600">
                                Refund Policy:
                              </span>
                              <span className="text-sm font-medium">
                                30 Days
                              </span>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <div
                    id="print-area"
                    className={`${!showInvoice ? "hidden lg:block" : "block"} mx-auto bg-white print:block`}
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

                        {/* Use Template Renderer instead of hardcoded invoice */}
                        <TemplateRenderer
                          templateId={selectedTemplate}
                          businessInfo={facilityInfo}
                          loading={loading}
                          invoiceNumber={invoiceNumber}
                          customerName={patientName}
                          customerEmail={patientEmail}
                          customerPhone={patientPhone}
                          customerAddress={patientAddress}
                          patientId={patientId}
                          patientDOB={patientDOB}
                          patientGender={patientGender}
                          insuranceProvider={insuranceProvider}
                          insuranceNumber={insuranceNumber}
                          diagnosis={diagnosis}
                          prescription={prescription}
                          items={items}
                          subtotal={subtotal}
                          vat={vat}
                          total={total}
                          serviceType="MEDICAL"
                          documentType="medical"
                          showStamp={stampSettings.enabled}
                          stampText={stampSettings.text}
                          stampColor={stampSettings.color}
                          showStampDate={stampSettings.showDate}
                          paymentStatus={paymentStatus}
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

export default HealthcareDashboard;
