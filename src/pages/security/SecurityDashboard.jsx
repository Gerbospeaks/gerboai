import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import HomeView from "../HomeView";
import BusinessSettingsModal from "../BusinessSettingsModal";
import AppHeader from "../AppHeader";
import { serverTimestamp } from "firebase/firestore";
import logo from "../../assets/img/solidflo-logo.png";
import SecurityIncidentMultiStepForm from "./SecurityIncidentMultiStepForm";
import Templates from "./Templates";
import { useLocation } from "react-router-dom";
import AIInvoiceExtractor from "../AIInvoiceExtractor";
import TemplateSelector, { TemplateRenderer } from "./TemplateSelector";
import uploadLogoToR2 from "../../utils/uploadLogoToR2";
import { getAuth, signOut } from "firebase/auth";
import SignatureStamp from "../SignatureStamp";
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
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Home,
  Settings,
  Users,
  Calendar,
  FileText,
  Shield,
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
  AlertTriangle,
  MapPin,
  Save,
  Clock,
  UserCheck,
  Building,
  Upload,
} from "lucide-react";

const generateIncidentNumber = async (userId) => {
  const db = getFirestore();
  const year = new Date().getFullYear();

  const incidentsRef = collection(db, "users", userId, "incidents");
  const q = query(incidentsRef, orderBy("createdAt", "desc"), limit(1));
  const snapshot = await getDocs(q);

  let lastNumber = 1000;

  if (!snapshot.empty) {
    const lastIncident = snapshot.docs[0].data();
    const match = lastIncident.incidentNumber?.match(/(\d+)$/);

    if (match) {
      lastNumber = Number(match[1]);
    }
  }

  const nextNumber = lastNumber + 1;
  return `INC-${year}-${String(nextNumber).padStart(4, "0")}`;
};
const functions = getFunctions();
const SecurityDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [inputMode, setInputMode] = useState("manual");
  const [documentType, setDocumentType] = useState("invoice");
  const [useAI, setUseAI] = useState(false);
  const [activeTab, setActiveTab] = useState("IncidentReport");
  const [showIncidentReport, setShowIncidentReport] = useState(false);
  const { user, authUser } = useAuth();
  const [incidentNumber, setIncidentNumber] = useState("");
  const [incidentId, setIncidentId] = useState(null);
  const [savedIncidents, setSavedIncidents] = useState([]);
  const [showIncidentsList, setShowIncidentsList] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeView, setActiveView] = useState("home");
  const [isInvoicingOpen, setIsInvoicingOpen] = useState(false);
  const [isClientsOpen, setIsClientsOpen] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState("classic");
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] =
    useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState("professional");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [stampSettings, setStampSettings] = useState({
    text: "APPROVED",
    color: "#d32f2f",
    showDate: false,
    enabled: false,
  });
  useEffect(() => {
    if (!user?.uid) return;

    const loadIncidentNumber = async () => {
      const nextIncident = await generateIncidentNumber(user.uid);
      setIncidentNumber(nextIncident);
    };

    loadIncidentNumber();
    loadSavedIncidents();
  }, [user]);

  const loadSavedIncidents = async () => {
    if (!user?.uid) return;

    const db = getFirestore();
    const incidentsRef = collection(db, "users", user.uid, "incidents");
    const q = query(incidentsRef, orderBy("createdAt", "desc"), limit(50));
    const snapshot = await getDocs(q);

    const incidents = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setSavedIncidents(incidents);
  };
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
  const loadIncident = (incident) => {
    setIncidentId(incident.id);
    setIncidentNumber(incident.incidentNumber || "");
    setClientName(incident.client?.name || "");
    setClientContact(incident.client?.contact || "");
    setClientEmail(incident.client?.email || "");
    setSiteName(incident.site?.name || "");
    setSiteAddress(incident.site?.address || "");
    setGuardName(incident.guard?.name || "");
    setGuardId(incident.guard?.guardId || "");
    setIncidentType(incident.incidentType || "Theft");
    setIncidentDate(incident.incidentDate || "");
    setIncidentTime(incident.incidentTime || "");
    setIncidentDescription(incident.description || "");
    setActionsTaken(incident.actionsTaken || "");
    setWitnessName(incident.witness?.name || "");
    setWitnessContact(incident.witness?.contact || "");
    setShowIncidentsList(false);
  };
  const handleProcessPayment = async () => {
    if (!incidentId || !user?.uid) {
      alert("Please save the invoice before processing payment");
      return;
    }

    try {
      const collectionName =
        documentType === "estimate" ? "estimates" : "invoices";
      const invoiceDoc = await getDoc(
        doc(db, "users", user.uid, collectionName, incidentId),
      );

      if (invoiceDoc.exists()) {
        const invoiceData = invoiceDoc.data();
        setSelectedInvoiceForPayment({
          id: incidentId,
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
    if (!user?.uid || !incidentId) {
      setPaymentStatus({
        totalPaid: 0,
        balanceDue: 0, // ✅ Use 0 as default
        status: "pending",
      });
      return;
    }

    try {
      const collectionName =
        documentType === "estimate" ? "estimates" : "invoices";
      const invoiceDoc = await getDoc(
        doc(db, "users", user.uid, collectionName, incidentId),
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
          balanceDue: 0, // ✅ Use 0 since no invoice exists
          status: "pending",
        });
      }
    } catch (error) {
      console.error("Error loading payment status:", error);
      setPaymentStatus({
        totalPaid: 0,
        balanceDue: 0, // ✅ Use 0 on error
        status: "pending",
      });
    }
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
  const handlePaymentComplete = () => {
    loadSavedIncidents();
    loadPaymentStatus();
    setShowPaymentModal(false);
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

  const [clientName, setClientName] = useState("ABC Corporation");
  const [clientContact, setClientContact] = useState("011 234 5678");
  const [clientEmail, setClientEmail] = useState("security@abccorp.co.za");
  const [siteName, setSiteName] = useState("Head Office");
  const [siteAddress, setSiteAddress] = useState(
    "123 Business Park, Sandton, 2196",
  );
  const [guardName, setGuardName] = useState("John Doe");
  const [guardId, setGuardId] = useState("GRD-2024-0012");
  const [incidentType, setIncidentType] = useState("Theft");
  const [incidentDate, setIncidentDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [incidentTime, setIncidentTime] = useState(
    new Date().toTimeString().slice(0, 5),
  );
  const [incidentDescription, setIncidentDescription] = useState("");
  const [actionsTaken, setActionsTaken] = useState("");
  const [witnessName, setWitnessName] = useState("");
  const [witnessContact, setWitnessContact] = useState("");

  const [businessInfo, setBusinessInfo] = useState({
    businessName: "ELITE SECURITY SERVICES",
    addressLine1: "45 SECURITY AVENUE",
    addressLine2: "MIDRAND",
    city: "JOHANNESBURG",
    postalCode: "1685",
    primaryPhone: "011 555 0100",
    secondaryPhone: "082 555 0200",
    logoUrl: "",
    psiraReg: "PSIRA-123456",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.uid) {
      loadBusinessInfo();
    }
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
    } finally {
      setLoading(false);
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

  const buildIncidentPayload = (numberToUse) => ({
    incidentNumber: numberToUse,
    status: "under_investigation",

    client: {
      name: clientName,
      contact: clientContact,
      email: clientEmail,
    },

    site: {
      name: siteName,
      address: siteAddress,
    },

    guard: {
      name: guardName,
      guardId: guardId,
    },

    incidentType,
    incidentDate,
    incidentTime,
    description: incidentDescription,
    actionsTaken,

    witness: {
      name: witnessName,
      contact: witnessContact,
    },

    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const handleSaveIncident = async () => {
    if (!user?.uid) return;

    const db = getFirestore();
    let numberToUse = incidentNumber;

    if (!incidentId) {
      numberToUse = await generateIncidentNumber(user.uid);
      setIncidentNumber(numberToUse);
    }

    const incidentData = buildIncidentPayload(numberToUse);

    if (incidentId) {
      await updateDoc(doc(db, "users", user.uid, "incidents", incidentId), {
        ...incidentData,
        updatedAt: serverTimestamp(),
      });
    } else {
      const ref = await addDoc(
        collection(db, "users", user.uid, "incidents"),
        incidentData,
      );
      setIncidentId(ref.id);
    }

    alert("Incident report saved");
    loadSavedIncidents();
  };

  const handleNewIncident = () => {
    setIncidentId(null);
    setIncidentNumber("");
    setClientName("ABC Corporation");
    setClientContact("011 234 5678");
    setClientEmail("security@abccorp.co.za");
    setSiteName("Head Office");
    setSiteAddress("123 Business Park, Sandton, 2196");
    setGuardName("John Doe");
    setGuardId("GRD-2024-0012");
    setIncidentType("Theft");
    setIncidentDate(new Date().toISOString().split("T")[0]);
    setIncidentTime(new Date().toTimeString().slice(0, 5));
    setIncidentDescription("");
    setActionsTaken("");
    setWitnessName("");
    setWitnessContact("");

    const loadNewNumber = async () => {
      if (user?.uid) {
        const nextIncident = await generateIncidentNumber(user.uid);
        setIncidentNumber(nextIncident);
      }
    };
    loadNewNumber();
  };

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };
const headerActions = [
  documentType === "quote" && incidentId && {
    label: "Convert to Invoice", icon: FileText,
    className: "flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-sm font-semibold rounded-lg hover:from-purple-700 transition-colors shadow-sm whitespace-nowrap"
  },
  { label: "Print",    icon: Printer,  onClick: handlePrint,        variant: "secondary" },
  { label: "New",      icon: Plus,     onClick: documentType === "quote" ? handleNewIncident : handleNewIncident,
    className: "flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-sm font-semibold rounded-lg hover:from-emerald-700 transition-colors shadow-sm whitespace-nowrap" },
  { label: "Send",     icon: Send,
    className: "flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold rounded-lg hover:from-blue-700 transition-colors shadow-sm whitespace-nowrap" },
  { label: "Save PDF", icon: Download,
    className: "flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-600 to-orange-700 text-white text-sm font-semibold rounded-lg hover:from-orange-700 transition-colors shadow-sm whitespace-nowrap" },
  { label: "Save",     icon: Save,     onClick: handleSaveIncident,
    className: "flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-600 to-amber-700 text-white text-sm font-semibold rounded-lg hover:from-amber-700 transition-colors shadow-sm whitespace-nowrap" },
  { label: "Logout",   icon: LogOut,   onClick: handleLogout,
    className: "flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-semibold rounded-lg hover:from-red-700 transition-colors shadow-sm whitespace-nowrap" },
].filter(Boolean);

const mobileDashboardActions = [
  documentType === "quote" && incidentId && {
    label: "To Invoice", icon: FileText,
    className: "flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg text-xs font-semibold shadow-lg transition-all active:scale-95 whitespace-nowrap"
  },
  { label: "Save",  icon: Save,     onClick: handleSaveIncident,
    className: "flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-stone-600 to-stone-700 text-white rounded-lg text-xs font-semibold shadow-lg transition-all active:scale-95 whitespace-nowrap" },
  { label: "Send",  icon: Send,  
    className: "flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg text-xs font-semibold shadow-lg transition-all active:scale-95 whitespace-nowrap" },
  { label: "PDF",   icon: Download, 
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
          <div className="w-10 h-10 mb-2">
            <img
              src={logo}
              alt="Logo"
              className="w-full h-full object-contain rounded-lg"
            />
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
              title="Business Overview"
            >
              <TrendingUp className="w-5 h-5" />
            </button>

            <button
              className="p-2 text-slate-400 hover:text-white hover:bg-blue-600/80 rounded-lg transition-all duration-200 w-10 h-10 flex items-center justify-center group"
              title="Incident Reports"
            >
              <AlertTriangle className="w-5 h-5" />
            </button>

            <button
              className="p-2 text-slate-400 hover:text-white hover:bg-blue-600/80 rounded-lg transition-all duration-200 w-10 h-10 flex items-center justify-center group"
              title="Security Guards"
            >
              <UserCheck className="w-5 h-5" />
            </button>

            <button
              className="p-2 text-slate-400 hover:text-white hover:bg-blue-600/80 rounded-lg transition-all duration-200 w-10 h-10 flex items-center justify-center group"
              title="Clients"
            >
              <Users className="w-5 h-5" />
            </button>

            <button
              className="p-2 text-slate-400 hover:text-white hover:bg-blue-600/80 rounded-lg transition-all duration-200 w-10 h-10 flex items-center justify-center group"
              title="Sites"
            >
              <Building className="w-5 h-5" />
            </button>

            <button
              className="p-2 text-slate-400 hover:text-white hover:bg-blue-600/80 rounded-lg transition-all duration-200 w-10 h-10 flex items-center justify-center group"
              title="Patrol Routes"
            >
              <MapPin className="w-5 h-5" />
            </button>

            <button
              className="p-2 text-slate-400 hover:text-white hover:bg-blue-600/80 rounded-lg transition-all duration-200 w-10 h-10 flex items-center justify-center group"
              title="Schedules"
            >
              <Clock className="w-5 h-5" />
            </button>

            <button
              className="p-2 text-slate-400 hover:text-white hover:bg-blue-600/80 rounded-lg transition-all duration-200 w-10 h-10 flex items-center justify-center group"
              title="Invoices"
            >
              <Receipt className="w-5 h-5" />
            </button>

            <button
              className="p-2 text-slate-400 hover:text-white hover:bg-blue-600/80 rounded-lg transition-all duration-200 w-10 h-10 flex items-center justify-center group"
              title="Reports"
            >
              <FileBarChart className="w-5 h-5" />
            </button>

            <button
              className="p-2 text-slate-400 hover:text-white hover:bg-blue-600/80 rounded-lg transition-all duration-200 w-10 h-10 flex items-center justify-center group"
              title="Calendar"
            >
              <Calendar className="w-5 h-5" />
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
              <div className="flex items-center space-x-3 px-3 py-2.5 text-slate-300 hover:text-white hover:bg-blue-600/20 hover:border-l-4 hover:border-blue-500 rounded-lg cursor-pointer transition-all duration-200">
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm font-medium">Business Overview</span>
              </div>

              {/* Incident Reports Section */}
              <div className="mt-2">
                <div className="flex items-center justify-between px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200">
                  <div className="flex items-center space-x-3 md:space-x-4">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="text-sm font-medium">
                      Incident Reports
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </div>

                <div className="ml-4 mt-1 space-y-1 border-l-2 border-slate-700/50 pl-4">
                  <div
                    onClick={handleNewIncident}
                    className="px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700/30 rounded-lg cursor-pointer transition-all duration-200"
                  >
                    New Incident Report
                  </div>
                  <div
                    onClick={() => {
                      setShowIncidentsList(!showIncidentsList);
                      setSidebarOpen(false);
                    }}
                    className="px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700/30 rounded-lg cursor-pointer transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <span>All Incidents</span>
                      <span className=" text-blue-300 px-2 py-0.5 rounded-full text-xs font-semibold">
                        {savedIncidents.length}
                      </span>
                    </div>
                  </div>
                  <div className="px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700/30 rounded-lg cursor-pointer transition-all duration-200">
                    <div className="flex items-center justify-between">
                      <span>Under Investigation</span>
                      <span className="bg-amber-600/30 text-amber-300 px-2 py-0.5 rounded-full text-xs font-semibold">
                        0
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200 mt-2">
                <UserCheck className="w-5 h-5" />
                <span className="text-sm font-medium">Security Guards</span>
              </div>

              <div className="flex items-center space-x-3 px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200">
                <Users className="w-5 h-5" />
                <span className="text-sm font-medium">Clients</span>
              </div>

              <div className="flex items-center space-x-3 px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200">
                <Building className="w-5 h-5" />
                <span className="text-sm font-medium">Sites</span>
              </div>

              <div className="flex items-center space-x-3 px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200">
                <MapPin className="w-5 h-5" />
                <span className="text-sm font-medium">Patrol Routes</span>
              </div>

              {/* Schedules Section */}
              <div className="mt-2">
                <div className="flex items-center justify-between px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200">
                  <div className="flex items-center space-x-3 md:space-x-4">
                    <Clock className="w-5 h-5" />
                    <span className="text-sm font-medium">Schedules</span>
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </div>
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

              {/* Reports Section */}
              <div className="mt-2">
                <div className="flex items-center justify-between px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200">
                  <div className="flex items-center space-x-3 md:space-x-4">
                    <FileBarChart className="w-5 h-5" />
                    <span className="text-sm font-medium">Reports</span>
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>

              <div className="flex items-center space-x-3 px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200">
                <Calendar className="w-5 h-5" />
                <span className="text-sm font-medium">Shift Calendar</span>
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
      <div className={`flex-1 transition-all duration-300 ml-16 lg:ml-64`}>
        <div className="flex-1 overflow-auto">
               <AppHeader
  actions={headerActions}
  mobileActions={mobileDashboardActions}
  onSettingsOpen={() => setShowSettings(true)}
/>
   

          <div className="flex-1 overflow-y-auto pr-4 md:pr-6 lg:pr-8">
            {showSettings && (
              <BusinessSettingsModal onClose={() => setShowSettings(false)} />
            )}

            {showIncidentsList && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
                  <div className="p-4 border-b flex items-center justify-between">
                    <h2 className="text-xl font-semibold">
                      Saved Incident Reports
                    </h2>
                    <button
                      onClick={() => setShowIncidentsList(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="overflow-auto p-4">
                    {savedIncidents.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No saved incident reports yet
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {savedIncidents.map((incident) => (
                          <div
                            key={incident.id}
                            onClick={() => loadIncident(incident)}
                            className="border rounded-lg p-4 hover:bg-gray-800 cursor-pointer transition-colors"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-semibold text-lg">
                                  {incident.incidentNumber || "N/A"}
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                  Type: {incident.incidentType || "N/A"}
                                </div>
                                <div className="text-sm text-gray-600">
                                  Client: {incident.client?.name || "N/A"}
                                </div>
                                <div className="text-sm text-gray-600">
                                  Site: {incident.site?.name || "N/A"}
                                </div>
                                <div className="text-sm text-gray-600">
                                  Guard: {incident.guard?.name || "N/A"}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm text-gray-500">
                                  {incident.incidentDate || "N/A"} at{" "}
                                  {incident.incidentTime || "N/A"}
                                </div>
                                <div
                                  className={`text-xs mt-1 px-2 py-1 rounded ${
                                    incident.status === "resolved"
                                      ? "bg-green-100 text-green-700"
                                      : incident.status ===
                                          "under_investigation"
                                        ? "bg-yellow-100 text-yellow-700"
                                        : "bg-red-100 text-red-700"
                                  }`}
                                >
                                  {incident.status?.replace("_", " ") ||
                                    "unknown"}
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
            {activeView === "home" && <HomeView user={user} />}
            {activeView === "invoice" && (
              <>
                <button
                  onClick={() => setShowIncidentReport(!showIncidentReport)}
                  className="lg:hidden w-full mb-4 flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 text-gray-800 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FileText className="w-5 h-5" />
                  {showIncidentReport ? "Hide Report" : "View Report"}
                </button>

                <div className="grid grid-cols-1 gap-6 px-4 sm:px-6 lg:px-8 xl:px-12">
                  <div
                    className={`${
                      showIncidentReport ? "hidden" : "block"
                    } space-y-6 lg:block print:hidden max-h-[calc(100vh-120px)] overflow-y-auto`}
                  >
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 flex items-center space-x-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-yellow-700 text-sm font-medium">
                        Under Investigation
                      </span>
                      <span className="text-yellow-600">Reported Today</span>
                    </div>

                    <SecurityIncidentMultiStepForm
                      // Client Info Props
                      clientName={clientName}
                      setClientName={setClientName}
                      clientContact={clientContact}
                      setClientContact={setClientContact}
                      clientEmail={clientEmail}
                      setClientEmail={setClientEmail}
                      // Site Info Props
                      siteName={siteName}
                      setSiteName={setSiteName}
                      siteAddress={siteAddress}
                      setSiteAddress={setSiteAddress}
                      // Guard Info Props
                      guardName={guardName}
                      setGuardName={setGuardName}
                      guardId={guardId}
                      setGuardId={setGuardId}
                      // Incident Details Props
                      incidentType={incidentType}
                      setIncidentType={setIncidentType}
                      incidentDate={incidentDate}
                      setIncidentDate={setIncidentDate}
                      incidentTime={incidentTime}
                      setIncidentTime={setIncidentTime}
                      incidentDescription={incidentDescription}
                      setIncidentDescription={setIncidentDescription}
                      actionsTaken={actionsTaken}
                      setActionsTaken={setActionsTaken}
                      // Witness Info Props
                      witnessName={witnessName}
                      setWitnessName={setWitnessName}
                      witnessContact={witnessContact}
                      setWitnessContact={setWitnessContact}
                    />
                  </div>

                  <div
                    id="print-area"
                    className={`${!showIncidentReport ? "hidden lg:block" : "block"} mx-auto bg-white print:block`}
                    style={{ width: "210mm", minHeight: "297mm" }}
                  >
                    <>
                      {/* Add Template Selector */}
                      <div className="mb-4 print:hidden">
                        <TemplateSelector
                          user={user}
                          selectedTemplate={selectedTemplate}
                          onTemplateChange={setSelectedTemplate}
                        />
                      </div>

                      {/* Use Template Renderer instead of hardcoded incident report */}
                      <TemplateRenderer
                        templateId={selectedTemplate}
                        businessInfo={businessInfo}
                        loading={loading}
                        // Map incident data to template props
                        jobCardNumber={incidentNumber}
                        customerName={clientName}
                        customerEmail={clientEmail}
                        customerPhone={clientContact}
                        customerAddress={siteAddress}
                        // Vehicle details (use incident data or defaults)
                        vehicleReg={siteName}
                        vehicleMake={incidentType}
                        vehicleModel="N/A"
                        vehicleYear="N/A"
                        vehicleVin="N/A"
                        vehicleMileage="N/A"
                        // Items array with incident details
                        items={[
                          {
                            description: `Incident Type: ${incidentType}`,
                            qty: 1,
                            rate: 0,
                            amount: 0,
                          },
                          {
                            description: `Description: ${incidentDescription || "N/A"}`,
                            qty: 1,
                            rate: 0,
                            amount: 0,
                          },
                          {
                            description: `Actions Taken: ${actionsTaken || "N/A"}`,
                            qty: 1,
                            rate: 0,
                            amount: 0,
                          },
                        ]}
                        // Financial totals (all zero for incident reports)
                        subtotal={0}
                        vat={0}
                        total={0}
                        // Stamp settings
                        showStamp={stampSettings?.enabled || false}
                        stampText={stampSettings?.text || "APPROVED"}
                        stampColor={stampSettings?.color || "#d32f2f"}
                        showStampDate={stampSettings?.showDate || false}
                      />
                    </>
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

export default SecurityDashboard;
