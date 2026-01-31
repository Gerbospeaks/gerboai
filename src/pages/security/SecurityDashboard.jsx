import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { serverTimestamp } from "firebase/firestore";
import logo from "../../assets/img/solidflo-logo.png";
import SecurityIncidentMultiStepForm from "./SecurityIncidentMultiStepForm";
import Templates from "./Templates";
import AIInvoiceExtractor from "../AIInvoiceExtractor";
import TemplateSelector, { TemplateRenderer } from "./TemplateSelector";
import { uploadLogoToR2 } from "../../utils/cloudflareUpload";
import { getAuth, signOut } from "firebase/auth";
import SignatureStamp from "../SignatureStamp";
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

const SecurityDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [inputMode, setInputMode] = useState("manual");
  const [documentType, setDocumentType] = useState("invoice");
  const [useAI, setUseAI] = useState(false);
  const [activeTab, setActiveTab] = useState("IncidentReport");
  const [showIncidentReport, setShowIncidentReport] = useState(false);
  const { user } = useAuth();
  const [incidentNumber, setIncidentNumber] = useState("");
  const [incidentId, setIncidentId] = useState(null);
  const [savedIncidents, setSavedIncidents] = useState([]);
  const [showIncidentsList, setShowIncidentsList] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeView, setActiveView] = useState("invoice");
  const [activeTemplate, setActiveTemplate] = useState("classic");
  const [selectedTemplate, setSelectedTemplate] = useState("professional");
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
      // Show loading state
      setBusinessInfo({ ...businessInfo, uploading: true });

      // Upload to Cloudflare R2
      const logoUrl = await uploadLogoToR2(file, user.uid);

      // Update business info state
      setBusinessInfo({
        ...businessInfo,
        logoUrl: logoUrl,
        uploading: false,
      });

      // Save to Firebase Firestore
      const db = getFirestore();
      const docRef = doc(db, "users", user.uid, "settings", "businessInfo");
      await updateDoc(docRef, {
        logoUrl: logoUrl,
        updatedAt: new Date().toISOString(),
      });

      alert("Logo uploaded successfully!");
    } catch (error) {
      console.error("Error uploading logo:", error);
      alert("Failed to upload logo: " + error.message);
      setBusinessInfo({ ...businessInfo, uploading: false });
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
              className="p-2 text-slate-400 hover:text-white hover:bg-blue-600/80 rounded-lg transition-all duration-200 w-10 h-10 flex items-center justify-center group relative"
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
              <div className="flex items-center space-x-3 px-3 py-2.5 text-slate-300 hover:text-white hover:bg-blue-600/20 hover:border-l-4 hover:border-blue-500 rounded-lg cursor-pointer transition-all duration-200">
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm font-medium">Business Overview</span>
              </div>

              {/* Incident Reports Section */}
              <div className="mt-2">
                <div className="flex items-center justify-between px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200">
                  <div className="flex items-center space-x-3">
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
                    onClick={() => setShowIncidentsList(!showIncidentsList)}
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
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5" />
                    <span className="text-sm font-medium">Schedules</span>
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </div>
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
              </div>

              <div
                onClick={() => setActiveView("templates")}
                className="flex items-center space-x-3 px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200 mt-2"
              >
                <FileText className="w-5 h-5" />
                <span className="text-sm font-medium">Invoice Templates</span>
              </div>

              {/* Reports Section */}
              <div className="mt-2">
                <div className="flex items-center justify-between px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200">
                  <div className="flex items-center space-x-3">
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

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700 bg-slate-900/50 backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full ring-2 ring-slate-700 shadow-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
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
          <div className="bg-gray-300 border-b border-gray-200 px-4 lg:px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 lg:space-x-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                ></button>

                <h1 className="text-base lg:text-xl font-semibold">
                  Incident Report #{incidentNumber || "— not saved yet —"}
                </h1>
              </div>

              <div className="hidden lg:flex items-center space-x-3 print:hidden">
                <button
                  onClick={handleSaveIncident}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-800 rounded-lg hover:bg-blue-700"
                >
                  Save Report
                </button>

                <button
                  onClick={handleNewIncident}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-gray-800 rounded-lg hover:bg-green-700"
                >
                  <Plus className="w-4 h-4" />
                  New
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
          <div className="sticky top-0 z-40 flex flex-col">
            <div className="bg-gray-50 border-b border-gray-200 px-4 lg:px-6 overflow-x-auto print:hidden">
              <div className="flex space-x-4 lg:space-x-8 min-w-max">
                {["IncidentReport", "Follow-up", "Photos", "Notes"].map(
                  (tab) => (
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
                  ),
                )}
              </div>
            </div>
          </div>
          <div className="p-4 lg:p-6">
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
                          PSIRA Registration Number
                        </label>
                        <input
                          type="text"
                          value={businessInfo.psiraReg}
                          onChange={(e) =>
                            setBusinessInfo({
                              ...businessInfo,
                              psiraReg: e.target.value,
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

                              {/* Preview */}
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
            {activeView === "invoice" && (
              <>
                <button
                  onClick={() => setShowIncidentReport(!showIncidentReport)}
                  className="lg:hidden w-full mb-4 flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 text-gray-800 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FileText className="w-5 h-5" />
                  {showIncidentReport ? "Hide Report" : "View Report"}
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
