import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import HomeView from "../HomeView";
import SolidFloAgent from "../../components/SolidFloAgent/SolidFloAgent";
import BusinessSettingsModal from "../BusinessSettingsModal";
import AppHeader from "../AppHeader";
import StampSignatureModal from "../StampSignatureModal";
import { POTemplateRenderer } from "../Purchaseordertemplates";
import SubUserManagement from "../SubUserManagement";
import { serverTimestamp } from "firebase/firestore";
import logo from "../../assets/img/solidflo-logo.png";
import SecurityIncidentMultiStepForm from "./SecurityIncidentMultiStepForm";
import { usePermissions } from "../../hooks/usePermissions";
import Templates from "./Templates";
import ServiceMarketplaceView from "../ServiceMarketplaceView";
import ServiceRequestsView from "../ServiceRequestsView";
import { useLocation } from "react-router-dom";
import TemplateSelector, { TemplateRenderer } from "./TemplateSelector";
import uploadLogoToR2 from "../../utils/uploadLogoToR2";
import { getAuth, signOut } from "firebase/auth";
import StampOverlay from "../StampOverlay";
import AIInvoiceWindow from "../AIInvoiceWindow";
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
  Stamp,
  Shield,
  FileBarChart,
  BarChart3,
  X,
  Plus,
  Send,
  LogOut,
  TrendingUp,
  TrendingDown,
  Receipt,
  AlertTriangle,
  MapPin,
  Save,
  Eye,
  Clock,
  UserCheck,
  Building,
  ArrowRight,
  CheckSquare,
  AlertCircle,
  Phone,
  Mail,
  Star,
  Activity,
  DollarSign,
  Zap,
  CheckCircle,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Navigation,
  Layers,
  PieChart,
  Bell,
  Badge,
} from "lucide-react";

// ── Page imports ─────────────────────────────────────────────────────────────
import GuardsPage from "./GuardsPage";
import ClientsPage from "./ClientsPage";
import SitesPage from "./SitesPage";
import PatrolRoutesPage from "./PatrolRoutesPage";
import SchedulesPage from "./SchedulesPage";
import InvoicesPage from "./InvoicesPage";
import ReportsPage from "./ReportsPage";
import AnalyticsPage from "./AnalyticsPage";
import BusinessOverviewPage from "./BusinessOverviewPage";
import ShiftCalendarPage from "./ShiftCalendarPage";

// ─── Number generation ────────────────────────────────────────────────────────
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
    if (match) lastNumber = Number(match[1]);
  }
  const nextNumber = lastNumber + 1;
  return `INC-${year}-${String(nextNumber).padStart(4, "0")}`;
};

// ─── Design tokens ────────────────────────────────────────────────────────────
const inputCls =
  "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md bg-white text-[#1e293b] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-[#2563eb] transition-colors";
const labelCls =
  "block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5";

// ─── Status badge helper ──────────────────────────────────────────────────────
const statusBadge = (s) =>
  s === "resolved"
    ? "bg-[#dcfce7] text-[#166534]"
    : s === "under_investigation"
      ? "bg-[#fef3c7] text-[#92400e]"
      : s === "closed"
        ? "bg-[#f1f5f9] text-[#475569]"
        : "bg-[#fef2f2] text-[#991b1b]";

const statusLabel = (s) =>
  s === "under_investigation"
    ? "Investigating"
    : s === "resolved"
      ? "Resolved"
      : s === "closed"
        ? "Closed"
        : "Open";

// ─── Stat card ────────────────────────────────────────────────────────────────
const StatCard = ({
  title,
  value,
  icon: Icon,
  iconBg,
  iconColor,
  subtitle,
  loading: l,
  trend,
}) => (
  <div className="bg-white rounded-xl p-4 border border-[#e2e8f0] shadow-sm flex flex-col justify-between">
    <div className="flex items-center justify-between mb-3">
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconBg}`}
      >
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </div>
      {trend !== undefined && (
        <span
          className={`flex items-center gap-0.5 text-xs font-semibold ${trend > 0 ? "text-[#dc2626]" : "text-[#059669]"}`}
        >
          {trend > 0 ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          {Math.abs(trend)}%
        </span>
      )}
    </div>
    <div>
      <p className="text-xs text-[#64748b] mb-0.5">{title}</p>
      {l ? (
        <div className="h-6 bg-[#f1f5f9] rounded animate-pulse" />
      ) : (
        <>
          <p className="text-lg font-bold text-[#1e293b] truncate">{value}</p>
          {subtitle && (
            <p className="text-xs text-[#94a3b8] mt-0.5">{subtitle}</p>
          )}
        </>
      )}
    </div>
  </div>
);

// ════════════════════════════════════════════════════════════════════════════
// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════════════
const SecurityDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { user, authUser } = useAuth();
  const [aiWindowOpen, setAiWindowOpen] = useState(false);
  const [aiDocType, setAiDocType] = useState("invoice");
  const [documentType, setDocumentType] = useState("invoice");
  const [incidentNumber, setIncidentNumber] = useState("");
  const [incidentId, setIncidentId] = useState(null);
  const [savedIncidents, setSavedIncidents] = useState([]);
  const [showIncidentsList, setShowIncidentsList] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeView, setActiveView] = useState("home");
  const [showPreview, setShowPreview] = useState(false);
  const [showAIWindow, setShowAIWindow] = useState(false);
  const [isIncidentsOpen, setIsIncidentsOpen] = useState(false);
  const [isSchedulesOpen, setIsSchedulesOpen] = useState(false);
  const [isInvoicesOpen, setIsInvoicesOpen] = useState(false);
  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const { can, isAdmin } = usePermissions();
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("professional");
  const [showStampModal, setShowStampModal] = useState(false);
const [stampConfig, setStampConfig] = useState(null);
  const [stampSettings, setStampSettings] = useState({
    text: "APPROVED",
    color: "#d32f2f",
    showDate: false,
    enabled: false,
  });
  const [stats, setStats] = useState({
    total: 0,
    investigating: 0,
    resolved: 0,
    sites: 0,
    loading: true,
  });
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
  const location = useLocation();

  useEffect(() => {
    if (location.state?.activeView) setActiveView(location.state.activeView);
  }, [location.state]);
  useEffect(() => {
    if (!user?.uid) return;
    const loadIncidentNumber = async () => {
      const next = await generateIncidentNumber(user.uid);
      setIncidentNumber(next);
    };
    loadIncidentNumber();
    loadSavedIncidents();
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
      loadBusinessInfo();
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    if (!user?.uid) return;
    try {
      const db = getFirestore();
      const snap = await getDocs(
        collection(db, "users", user.uid, "incidents"),
      );
      let investigating = 0,
        resolved = 0;
      snap.forEach((d) => {
        const s = d.data().status;
        if (s === "under_investigation") investigating++;
        if (s === "resolved") resolved++;
      });
      setStats({
        total: snap.docs.length,
        investigating,
        resolved,
        sites: 0,
        loading: false,
      });
    } catch {
      setStats((p) => ({ ...p, loading: false }));
    }
  };

  const loadSavedIncidents = async () => {
    if (!user?.uid) return;
    const db = getFirestore();
    const q = query(
      collection(db, "users", user.uid, "incidents"),
      orderBy("createdAt", "desc"),
      limit(50),
    );
    const snapshot = await getDocs(q);
    setSavedIncidents(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  const loadBusinessInfo = async () => {
    if (!user?.uid) return;
    try {
      const db = getFirestore();
      const docRef = doc(db, "users", user.uid, "settings", "businessInfo");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) setBusinessInfo(docSnap.data());
    } catch {
    } finally {
      setLoading(false);
    }
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
    setActiveView("invoice");
  };

  const buildIncidentPayload = (numberToUse) => ({
    incidentNumber: numberToUse,
    status: "under_investigation",
    client: { name: clientName, contact: clientContact, email: clientEmail },
    site: { name: siteName, address: siteAddress },
    guard: { name: guardName, guardId },
    incidentType,
    incidentDate,
    incidentTime,
    description: incidentDescription,
    actionsTaken,
    witness: { name: witnessName, contact: witnessContact },
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
    fetchStats();
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
        const next = await generateIncidentNumber(user.uid);
        setIncidentNumber(next);
      }
    };
    loadNewNumber();
  };

  const printStyles = `@media print { body * { visibility: hidden !important; } #print-area, #print-area * { visibility: visible !important; } #print-area { display: block !important; position: absolute !important; left: 0 !important; top: 0 !important; width: 210mm !important; min-height: 297mm !important; margin: 0 !important; padding: 10mm !important; box-sizing: border-box !important; background: white !important; } @page { size: A4 portrait; margin: 0; } html, body { margin: 0 !important; padding: 0 !important; width: 210mm !important; background: white !important; } * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } }`;
  const handlePrint = () => {
    const s = document.createElement("style");
    s.textContent = printStyles;
    document.head.appendChild(s);
    window.print();
    setTimeout(() => document.head.removeChild(s), 1000);
  };

  const handleSaveBusinessInfo = async () => {
    if (!user?.uid) return;
    try {
      const db = getFirestore();
      await setDoc(
        doc(db, "users", user.uid, "settings", "businessInfo"),
        businessInfo,
      );
      alert("Business information saved!");
      setShowSettings(false);
    } catch {
      alert("Failed to save business information");
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
      const logoUrl = await uploadLogoToR2(file, authUser);
      setBusinessInfo((prev) => ({ ...prev, logoUrl, uploading: false }));
      const db = getFirestore();
      await setDoc(
        doc(db, "users", user.uid, "settings", "businessInfo"),
        { logoUrl, updatedAt: new Date().toISOString() },
        { merge: true },
      );
      alert("Logo uploaded successfully!");
    } catch (error) {
      alert("Failed to upload logo: " + error.message);
      setBusinessInfo((prev) => ({ ...prev, uploading: false }));
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(getAuth());
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const templateProps = {
    templateId: selectedTemplate,
    businessInfo,
    loading,
    jobCardNumber: incidentNumber,
    customerName: clientName,
    customerEmail: clientEmail,
    customerPhone: clientContact,
    customerAddress: siteAddress,
    vehicleReg: siteName,
    vehicleMake: incidentType,
    vehicleModel: "N/A",
    vehicleYear: "N/A",
    vehicleVin: "N/A",
    vehicleMileage: "N/A",
    items: [
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
    ],
    subtotal: 0,
    vat: 0,
    total: 0,
    showStamp: stampSettings?.enabled || false,
    stampText: stampSettings?.text || "APPROVED",
    stampColor: stampSettings?.color || "#d32f2f",
    showStampDate: stampSettings?.showDate || false,
    stampConfig,
  };

  const headerActions = [
    isAdmin && {
      label: "Team",
      icon: Users,
      onClick: () => setShowUserManagement(true),
      className:
        "flex items-center gap-1.5 px-3 py-1.5 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm font-medium rounded-md transition-colors whitespace-nowrap",
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
      onClick: handleNewIncident,
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
      className:
        "flex items-center gap-1.5 px-3 py-1.5 bg-[#0891b2] hover:bg-[#0e7490] text-white text-sm font-medium rounded-md transition-colors whitespace-nowrap",
    },
    {
      label: "Save",
      icon: Save,
      onClick: handleSaveIncident,
      className:
        "flex items-center gap-1.5 px-3 py-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium rounded-md transition-colors whitespace-nowrap",
    },
  ].filter(Boolean);

  const mobileDashboardActions = [
    {
      label: "Save",
      icon: Save,
      onClick: handleSaveIncident,
      className:
        "flex items-center gap-1.5 px-3 py-2 bg-[#2563eb] text-white rounded-md text-xs font-medium active:scale-95 whitespace-nowrap",
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

  // ── Sidebar nav helper ────────────────────────────────────────────────────
  const navigate = (view) => {
    setActiveView(view);
    if (isMobile) setSidebarOpen(false);
  };

  // ── Home view ─────────────────────────────────────────────────────────────
  const HomeViewLocal = () => (
    <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          title="Total Incidents"
          value={stats.total}
          icon={AlertTriangle}
          iconBg="bg-[#fef2f2]"
          iconColor="text-[#dc2626]"
          subtitle="All time"
          loading={stats.loading}
          trend={5}
        />
        <StatCard
          title="Investigating"
          value={stats.investigating}
          icon={AlertCircle}
          iconBg="bg-[#fffbeb]"
          iconColor="text-[#d97706]"
          subtitle="Active cases"
          loading={stats.loading}
        />
        <StatCard
          title="Resolved"
          value={stats.resolved}
          icon={CheckSquare}
          iconBg="bg-[#f0fdf4]"
          iconColor="text-[#059669]"
          subtitle="Closed cases"
          loading={stats.loading}
          trend={-8}
        />
        <StatCard
          title="Guards"
          value="—"
          icon={UserCheck}
          iconBg="bg-[#eff6ff]"
          iconColor="text-[#2563eb]"
          subtitle="On duty"
          loading={stats.loading}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 bg-[#fef2f2] rounded-lg flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-[#dc2626]" />
          </div>
          <div>
            <p className="text-xs text-[#64748b] mb-0.5">Under Investigation</p>
            {stats.loading ? (
              <div className="h-6 bg-[#f1f5f9] rounded animate-pulse w-20" />
            ) : (
              <>
                <p className="text-xl font-bold text-[#dc2626]">
                  {stats.investigating}
                </p>
                <p className="text-xs text-[#94a3b8]">
                  Require immediate attention
                </p>
              </>
            )}
          </div>
        </div>

        <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-widest mb-3">
            Quick Actions
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            {[
              {
                label: "New Report",
                icon: AlertTriangle,
                onClick: () => {
                  handleNewIncident();
                  navigate("invoice");
                },
                bg: "bg-[#fef2f2]",
                hover: "hover:bg-[#fee2e2]",
                border: "border-[#fecaca]",
                iconBg: "bg-[#dc2626]",
                text: "text-[#991b1b]",
              },
              {
                label: "Guards",
                icon: UserCheck,
                onClick: () => navigate("guards"),
                bg: "bg-[#eff6ff]",
                hover: "hover:bg-[#dbeafe]",
                border: "border-[#bfdbfe]",
                iconBg: "bg-[#2563eb]",
                text: "text-[#1e40af]",
              },
              {
                label: "Sites",
                icon: Building,
                onClick: () => navigate("sites"),
                bg: "bg-[#f0fdf4]",
                hover: "hover:bg-[#dcfce7]",
                border: "border-[#bbf7d0]",
                iconBg: "bg-[#059669]",
                text: "text-[#166534]",
              },
            ].map(
              ({
                label,
                icon: Icon,
                onClick,
                bg,
                hover,
                border,
                iconBg,
                text,
              }) => (
                <button
                  key={label}
                  onClick={onClick}
                  className={`flex-1 flex items-center justify-between px-3 py-2.5 ${bg} ${hover} border ${border} rounded-lg transition-all group`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-6 h-6 ${iconBg} rounded flex items-center justify-center flex-shrink-0`}
                    >
                      <Icon className="w-3 h-3 text-white" />
                    </div>
                    <span className={`text-xs font-semibold ${text}`}>
                      {label}
                    </span>
                  </div>
                  <ArrowRight
                    className={`w-3 h-3 ${text} opacity-60 group-hover:translate-x-0.5 transition-transform`}
                  />
                </button>
              ),
            )}
          </div>
        </div>
      </div>

      {/* Recent incidents */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#e2e8f0] bg-[#f8fafc]">
          <h3 className="text-sm font-semibold text-[#1e293b]">
            Recent Incidents
          </h3>
          <button
            onClick={() => setShowIncidentsList(true)}
            className="text-xs text-[#2563eb] hover:text-[#1d4ed8] font-medium"
          >
            View all
          </button>
        </div>
        <div className="divide-y divide-[#f1f5f9]">
          {stats.loading ? (
            [1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-14 bg-[#f8fafc] animate-pulse m-3 rounded-lg"
              />
            ))
          ) : savedIncidents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-10 h-10 mb-3 bg-[#f1f5f9] rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-[#94a3b8]" />
              </div>
              <p className="text-sm font-medium text-[#374151] mb-1">
                No incident reports yet
              </p>
              <p className="text-xs text-[#94a3b8] mb-3">
                Create your first incident report
              </p>
              <button
                onClick={() => {
                  handleNewIncident();
                  navigate("invoice");
                }}
                className="px-4 py-1.5 bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded-lg text-xs font-medium transition-colors"
              >
                New Report
              </button>
            </div>
          ) : (
            savedIncidents.slice(0, 8).map((incident) => (
              <div
                key={incident.id}
                onClick={() => loadIncident(incident)}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-[#f8fafc] cursor-pointer transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-[#1e293b] truncate">
                      {incident.incidentNumber || incident.id}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-semibold flex-shrink-0 ${statusBadge(incident.status)}`}
                    >
                      {statusLabel(incident.status)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[#64748b]">
                    <span className="flex items-center gap-1 truncate">
                      <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                      {incident.incidentType || "—"}
                    </span>
                    <span className="flex items-center gap-1 truncate">
                      <Building className="w-3 h-3 flex-shrink-0" />
                      {incident.site?.name || "—"}
                    </span>
                    <span className="flex items-center gap-1 truncate">
                      <UserCheck className="w-3 h-3 flex-shrink-0" />
                      {incident.guard?.name || "—"}
                    </span>
                  </div>
                </div>
                <div className="text-right ml-4 flex-shrink-0">
                  <div className="text-xs text-[#64748b]">
                    {incident.incidentDate || "—"}
                  </div>
                  <div className="text-xs text-[#94a3b8]">
                    {incident.incidentTime || ""}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  // ═════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═════════════════════════════════════════════════════════════════════════
  return (
    <div className="h-screen w-full overflow-hidden flex flex-col bg-[#f0f2f5]">
      {/* Print area */}
      <div
        id="print-area"
        className="hidden print:block bg-white"
        style={{ position: "relative", width: "210mm", minHeight: "297mm" }}
      >
        <TemplateRenderer {...templateProps} />
        <StampOverlay stampConfig={stampConfig} pageNumber={1} businessInfo={businessInfo} />
      </div>
      {showAIWindow && (
        <AIInvoiceWindow
          user={user}
          businessInfo={businessInfo}
          documentType={documentType}
          onExit={() => setShowAIWindow(false)}
          industry="security"
          TemplateRenderer={TemplateRenderer}
        />
      )}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Sidebar backdrop (mobile) */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── Collapsed Sidebar ─────────────────────────────────────────── */}
        <div
          className={`${sidebarOpen ? "hidden" : "hidden md:flex"} fixed z-40 w-16 bg-[#0f172a] border-r border-[#1e293b] h-full flex-col items-center py-4 space-y-3 print:hidden`}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-[#64748b] hover:text-white hover:bg-[#1e293b] rounded-lg transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <div className="w-9 h-9 rounded-lg overflow-hidden flex items-center justify-center">
            <img src={logo} className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col items-center space-y-2 w-full px-2 pt-2">
            {[
              {
                icon: Home,
                view: "home",
                title: "Home",
                color: "text-[#38bdf8]",
              },
              {
                icon: Settings,
                view: null,
                title: "Settings",
                color: "text-[#64748b]",
                onClick: () => setShowSettings(true),
              },
              {
                icon: TrendingUp,
                view: "overview",
                title: "Overview",
                color: "text-[#64748b]",
              },
              {
                icon: AlertTriangle,
                view: null,
                title: "Incident Reports",
                color: "text-[#64748b]",
                onClick: () => {
                  handleNewIncident();
                  navigate("invoice");
                },
              },
              {
                icon: UserCheck,
                view: "guards",
                title: "Security Guards",
                color: "text-[#64748b]",
              },
              {
                icon: Users,
                view: "clients",
                title: "Clients",
                color: "text-[#64748b]",
              },
              {
                icon: Building,
                view: "sites",
                title: "Sites",
                color: "text-[#64748b]",
              },
              {
                icon: MapPin,
                view: "patrols",
                title: "Patrol Routes",
                color: "text-[#64748b]",
              },
              {
                icon: Clock,
                view: "schedules",
                title: "Schedules",
                color: "text-[#64748b]",
              },
              {
                icon: Receipt,
                view: "invoices",
                title: "Invoices",
                color: "text-[#64748b]",
              },
              {
                icon: FileBarChart,
                view: "reports",
                title: "Reports",
                color: "text-[#64748b]",
              },
              {
                icon: Calendar,
                view: "calendar",
                title: "Shift Calendar",
                color: "text-[#64748b]",
              },
              {
                icon: BarChart3,
                view: "analytics",
                title: "Analytics",
                color: "text-[#64748b]",
              },
            ].map(
              ({ icon: Icon, view, title, color, onClick: customOnClick }) => (
                <button
                  key={title}
                  onClick={
                    customOnClick || (view ? () => navigate(view) : undefined)
                  }
                  title={title}
                  className={`group p-2 ${activeView === view ? "text-[#38bdf8] bg-[#1e3a5f]" : color} hover:text-white hover:bg-[#1e293b] rounded-lg transition-all w-10 h-10 flex items-center justify-center`}
                >
                  <Icon className="w-5 h-5" />
                </button>
              ),
            )}
          </div>
          <div className="absolute bottom-4">
            <div className="w-9 h-9 bg-[#1e293b] rounded-full flex items-center justify-center ring-1 ring-[#334155]">
              {businessInfo.logoUrl ? (
                <img
                  src={businessInfo.logoUrl}
                  className="w-6 h-6 object-contain"
                />
              ) : (
                <Shield className="w-4 h-4 text-[#64748b]" />
              )}
            </div>
          </div>
        </div>

        {/* ── Expanded Sidebar ──────────────────────────────────────────── */}
        <div
          className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} fixed z-50 w-64 bg-[#0f172a] border-r border-[#1e293b] transition-transform duration-300 h-full print:hidden shadow-2xl overflow-y-auto flex flex-col`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#1e293b]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg overflow-hidden">
                <img src={logo} className="w-full h-full object-contain" />
              </div>
              <span className="text-sm font-bold text-white truncate">
                {businessInfo.businessName || "Elite Security"}
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 text-[#64748b] hover:text-white hover:bg-[#1e293b] rounded-lg transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 p-3 space-y-1">
            {/* Home */}
            <div
              onClick={() => navigate("home")}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all text-sm font-medium ${activeView === "home" ? "bg-[#1e3a5f] text-[#38bdf8]" : "text-[#94a3b8] hover:text-white hover:bg-[#1e293b]"}`}
            >
              <Home className="w-4 h-4 flex-shrink-0" />
              Home
            </div>
            {/* Settings */}
            <div
              onClick={() => {
                setShowSettings(true);
                setSidebarOpen(false);
              }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all text-sm font-medium text-[#94a3b8] hover:text-white hover:bg-[#1e293b]"
            >
              <Settings className="w-4 h-4 flex-shrink-0" />
              Settings
            </div>

            <div className="pt-3 border-t border-[#1e293b] space-y-1">
              {/* Business Overview */}
              <div
                onClick={() => navigate("overview")}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-sm font-medium transition-all ${activeView === "overview" ? "bg-[#1e3a5f] text-[#38bdf8]" : "text-[#94a3b8] hover:text-white hover:bg-[#1e293b]"}`}
              >
                <TrendingUp className="w-4 h-4 flex-shrink-0" />
                Business Overview
              </div>

              {/* Incident Reports dropdown */}
              <div>
                <div
                  onClick={() => setIsIncidentsOpen(!isIncidentsOpen)}
                  className="flex items-center justify-between px-3 py-2.5 text-[#94a3b8] hover:text-white hover:bg-[#1e293b] rounded-lg cursor-pointer transition-all text-sm font-medium"
                >
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    Incident Reports
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${isIncidentsOpen ? "rotate-180" : ""}`}
                  />
                </div>
                <div
                  className={`ml-4 mt-1 space-y-0.5 border-l border-[#1e293b] pl-3 overflow-hidden transition-all duration-200 ${isIncidentsOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}
                >
                  {[
                    {
                      label: "New Report",
                      dot: "bg-[#dc2626]",
                      onClick: () => {
                        handleNewIncident();
                        navigate("invoice");
                      },
                    },
                    {
                      label: "All Incidents",
                      dot: "bg-[#7c3aed]",
                      badge: savedIncidents.length,
                      onClick: () => {
                        setShowIncidentsList(!showIncidentsList);
                        if (isMobile) setSidebarOpen(false);
                      },
                    },
                    {
                      label: "Under Investigation",
                      dot: "bg-[#d97706]",
                      badge: stats.investigating,
                      onClick: () => {},
                    },
                    {
                      label: "Resolved",
                      dot: "bg-[#059669]",
                      onClick: () => {},
                    },
                  ].map(({ label, dot, badge, onClick }) => (
                    <div
                      key={label}
                      onClick={onClick}
                      className="flex items-center justify-between py-2 px-2 text-xs text-[#64748b] hover:text-white hover:bg-[#1e293b] rounded-lg cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                        {label}
                      </div>
                      {badge !== undefined && (
                        <span className="bg-[#2563eb] text-white px-1.5 py-0.5 rounded text-xs font-bold">
                          {badge}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Direct nav items */}
              {[
                { label: "Security Guards", icon: UserCheck, view: "guards" },
                { label: "Clients", icon: Users, view: "clients" },
                { label: "Sites", icon: Building, view: "sites" },
                { label: "Patrol Routes", icon: MapPin, view: "patrols" },
              ].map(({ label, icon: Icon, view }) => (
                <div
                  key={label}
                  onClick={() => navigate(view)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-all ${activeView === view ? "bg-[#1e3a5f] text-[#38bdf8]" : "text-[#94a3b8] hover:text-white hover:bg-[#1e293b]"}`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {label}
                </div>
              ))}

              {/* Schedules */}
              <div>
                <div
                  onClick={() => setIsSchedulesOpen(!isSchedulesOpen)}
                  className="flex items-center justify-between px-3 py-2.5 text-[#94a3b8] hover:text-white hover:bg-[#1e293b] rounded-lg cursor-pointer transition-all text-sm font-medium"
                >
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 flex-shrink-0" />
                    Schedules
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${isSchedulesOpen ? "rotate-180" : ""}`}
                  />
                </div>
                <div
                  className={`ml-4 mt-1 space-y-0.5 border-l border-[#1e293b] pl-3 overflow-hidden transition-all duration-200 ${isSchedulesOpen ? "max-h-24 opacity-100" : "max-h-0 opacity-0"}`}
                >
                  {[
                    {
                      label: "Weekly Schedule",
                      dot: "bg-[#2563eb]",
                      onClick: () => navigate("schedules"),
                    },
                    {
                      label: "Shift Calendar",
                      dot: "bg-[#7c3aed]",
                      onClick: () => navigate("calendar"),
                    },
                  ].map(({ label, dot, onClick }) => (
                    <div
                      key={label}
                      onClick={onClick}
                      className="flex items-center gap-2 py-2 px-2 text-xs text-[#64748b] hover:text-white hover:bg-[#1e293b] rounded-lg cursor-pointer transition-all"
                    >
                      <div className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                      {label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Invoices */}
              <div>
                <div
                  onClick={() => setIsInvoicesOpen(!isInvoicesOpen)}
                  className="flex items-center justify-between px-3 py-2.5 text-[#94a3b8] hover:text-white hover:bg-[#1e293b] rounded-lg cursor-pointer transition-all text-sm font-medium"
                >
                  <div className="flex items-center gap-3">
                    <Receipt className="w-4 h-4 flex-shrink-0" />
                    Invoices
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${isInvoicesOpen ? "rotate-180" : ""}`}
                  />
                </div>
                <div
                  className={`ml-4 mt-1 space-y-0.5 border-l border-[#1e293b] pl-3 overflow-hidden transition-all duration-200 ${isInvoicesOpen ? "max-h-24 opacity-100" : "max-h-0 opacity-0"}`}
                >
                  {[
                    {
                      label: "All Invoices",
                      dot: "bg-[#2563eb]",
                      onClick: () => navigate("invoices"),
                    },
                    {
                      label: "Invoice Templates",
                      dot: "bg-[#7c3aed]",
                      onClick: () => navigate("templates"),
                    },
                  ].map(({ label, dot, onClick }) => (
                    <div
                      key={label}
                      onClick={onClick}
                      className="flex items-center gap-2 py-2 px-2 text-xs text-[#64748b] hover:text-white hover:bg-[#1e293b] rounded-lg cursor-pointer transition-all"
                    >
                      <div className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                      {label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Reports, Calendar, Analytics */}
              {[
                { label: "Reports", icon: FileBarChart, view: "reports" },
                { label: "Shift Calendar", icon: Calendar, view: "calendar" },
                { label: "Analytics", icon: BarChart3, view: "analytics" },
              ].map(({ label, icon: Icon, view }) => (
                <div
                  key={label}
                  onClick={() => navigate(view)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-all ${activeView === view ? "bg-[#1e3a5f] text-[#38bdf8]" : "text-[#94a3b8] hover:text-white hover:bg-[#1e293b]"}`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {label}
                </div>
              ))}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-[#1e293b]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#1e293b] rounded-full flex items-center justify-center ring-1 ring-[#334155] flex-shrink-0">
                {businessInfo.logoUrl ? (
                  <img
                    src={businessInfo.logoUrl}
                    className="w-6 h-6 object-contain"
                  />
                ) : (
                  <Shield className="w-4 h-4 text-[#64748b]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-white truncate">
                  {user?.name || "User"}
                </div>
                <div className="text-xs text-[#64748b] truncate">
                  {user?.email || "email@example.com"}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 text-[#64748b] hover:text-[#ef4444] hover:bg-[#1e293b] rounded-lg transition-all"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Main content ──────────────────────────────────────────────── */}
        <div
          className={`flex-1 overflow-hidden flex flex-col min-h-0 transition-all duration-300 ${sidebarOpen ? "ml-0 lg:ml-64" : "ml-0 md:ml-16"}`}
        >
          <AppHeader
            actions={headerActions}
            mobileActions={mobileDashboardActions}
            onSettingsOpen={() => setShowSettings(true)}
          />

          {/* Modals */}
          {showSettings && (
            <BusinessSettingsModal onClose={() => setShowSettings(false)} />
          )}
{showStampModal && (
  <StampSignatureModal
    isOpen={showStampModal}
    onClose={() => setShowStampModal(false)}
    onConfirm={(cfg) => {
      setStampConfig(cfg);
      setShowStampModal(false);
    }}
    previewContent={
      activeView === "purchase-orders"
        ? <POTemplateRenderer  />
        : <TemplateRenderer {...templateProps} />
    }
    businessInfo={businessInfo}
    existingConfig={stampConfig}
  />
)}
          {/* Incidents list modal */}
          {showIncidentsList && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden border border-[#e2e8f0]">
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0] bg-[#f8fafc]">
                  <div>
                    <h2 className="text-base font-semibold text-[#1e293b]">
                      Incident Reports
                    </h2>
                    <p className="text-xs text-[#64748b] mt-0.5">
                      {savedIncidents.length} records
                    </p>
                  </div>
                  <button
                    onClick={() => setShowIncidentsList(false)}
                    className="p-1.5 text-[#64748b] hover:text-[#1e293b] hover:bg-[#e2e8f0] rounded-lg transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {savedIncidents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <AlertTriangle className="w-10 h-10 text-[#cbd5e1] mb-3" />
                      <p className="text-sm text-[#94a3b8]">
                        No incident reports found
                      </p>
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead>
                        <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                          {[
                            "Number",
                            "Type",
                            "Client",
                            "Site",
                            "Guard",
                            "Date & Time",
                            "Status",
                          ].map((h) => (
                            <th
                              key={h}
                              className="px-4 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wide"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {savedIncidents.map((incident) => (
                          <tr
                            key={incident.id}
                            onClick={() => {
                              loadIncident(incident);
                              setShowIncidentsList(false);
                            }}
                            className="border-b border-[#f1f5f9] hover:bg-[#f8fafc] cursor-pointer transition-colors"
                          >
                            <td className="px-4 py-3 text-sm font-semibold text-[#2563eb]">
                              {incident.incidentNumber || "N/A"}
                            </td>
                            <td className="px-4 py-3 text-sm text-[#374151]">
                              {incident.incidentType || "N/A"}
                            </td>
                            <td className="px-4 py-3 text-sm text-[#374151]">
                              {incident.client?.name || "N/A"}
                            </td>
                            <td className="px-4 py-3 text-sm text-[#374151]">
                              {incident.site?.name || "N/A"}
                            </td>
                            <td className="px-4 py-3 text-sm text-[#374151]">
                              {incident.guard?.name || "N/A"}
                            </td>
                            <td className="px-4 py-3 text-sm text-[#374151]">
                              {incident.incidentDate || "N/A"}
                              {incident.incidentTime
                                ? ` @ ${incident.incidentTime}`
                                : ""}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${statusBadge(incident.status)}`}
                              >
                                {statusLabel(incident.status)}
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

          {/* Preview modal */}
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
                        Incident Report Preview
                      </h2>
                      <p className="text-xs text-[#64748b]">
                        {incidentNumber || "Draft"}
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
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#059669] hover:bg-[#047857] text-white text-xs font-medium rounded-lg transition-colors">
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
                    style={{ position: "relative", width: "210mm", minHeight: "297mm" }}
                  >
                    <TemplateRenderer {...templateProps} />
                    <StampOverlay stampConfig={stampConfig} pageNumber={1} businessInfo={businessInfo} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── View Router ──────────────────────────────────────────────── */}
          {activeView === "templates" && (
            <div className="flex-1 overflow-y-auto p-4">
              <Templates user={user} />
            </div>
          )}

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
          {activeView === "marketplace" && (
  <div className="flex-1 overflow-y-auto p-6">
    <ServiceMarketplaceView user={user} businessInfo={businessInfo} />
  </div>
)}

{activeView === "incoming-requests" && (
  <div className="flex-1 overflow-y-auto p-6">
    <ServiceRequestsView user={user} businessInfo={businessInfo} />
  </div>
)}
          {/* Incident report builder */}
          {activeView === "invoice" && (
            <div className="flex-1 overflow-hidden flex min-h-0">
              <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 min-w-0">
                <div className="space-y-5">
                  <div className="flex items-center gap-3 px-5 py-3.5 bg-[#fffbeb] border border-[#fde68a] rounded-xl">
                    <div className="w-8 h-8 bg-[#fef3c7] rounded-full flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-4 h-4 text-[#d97706]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#92400e]">
                        Under Investigation
                      </p>
                      <p className="text-xs text-[#b45309]">
                        Incident reported — {incidentDate || "today"} at{" "}
                        {incidentTime || "—"}
                      </p>
                    </div>
                    {incidentId && (
                      <span className="ml-auto text-xs font-bold text-[#b45309] bg-[#fef3c7] px-2.5 py-1 rounded-lg">
                        {incidentNumber}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    {[
                      {
                        label: "Incident Type",
                        value: incidentType || "—",
                        icon: AlertTriangle,
                        iconBg: "bg-[#fef2f2]",
                        iconColor: "text-[#dc2626]",
                      },
                      {
                        label: "Guard on Duty",
                        value: guardName || "—",
                        icon: UserCheck,
                        iconBg: "bg-[#eff6ff]",
                        iconColor: "text-[#2563eb]",
                      },
                      {
                        label: "Site",
                        value: siteName || "—",
                        icon: Building,
                        iconBg: "bg-[#f0fdf4]",
                        iconColor: "text-[#059669]",
                      },
                    ].map(({ label, value, icon: Icon, iconBg, iconColor }) => (
                      <div
                        key={label}
                        className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-[#64748b] uppercase tracking-wide">
                            {label}
                          </span>
                          <div
                            className={`w-7 h-7 ${iconBg} rounded-lg flex items-center justify-center`}
                          >
                            <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
                          </div>
                        </div>
                        <p className="text-sm font-bold text-[#1e293b] truncate">
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
                    <SecurityIncidentMultiStepForm
                      clientName={clientName}
                      setClientName={setClientName}
                      clientContact={clientContact}
                      setClientContact={setClientContact}
                      clientEmail={clientEmail}
                      setClientEmail={setClientEmail}
                      siteName={siteName}
                      setSiteName={setSiteName}
                      siteAddress={siteAddress}
                      setSiteAddress={setSiteAddress}
                      guardName={guardName}
                      setGuardName={setGuardName}
                      guardId={guardId}
                      setGuardId={setGuardId}
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
                      witnessName={witnessName}
                      setWitnessName={setWitnessName}
                      witnessContact={witnessContact}
                      setWitnessContact={setWitnessContact}
                    />
                  </div>

                  <button
                    onClick={handleSaveIncident}
                    className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-xl font-medium transition-colors shadow-sm"
                  >
                    <Save className="w-4 h-4" />
                    Save Incident Report
                  </button>
                </div>
              </div>

              {/* Live preview panel (xl only) */}
              <div className="hidden xl:flex w-[420px] flex-shrink-0 flex-col border-l border-[#e2e8f0] bg-[#e8eaed] overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-[#f8fafc] border-b border-[#e2e8f0] flex-shrink-0">
                  <TemplateSelector
                    user={user}
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
                    <button className="flex items-center gap-1 px-2.5 py-1.5 bg-[#059669] text-white text-xs font-medium rounded-lg hover:bg-[#047857] transition-colors">
                      <Download className="w-3 h-3" />
                      PDF
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  <div
                    className="bg-white shadow-lg rounded origin-top"
                    style={{
                      position: "relative",
                      width: "210mm",
                      minHeight: "297mm",
                      transform: "scale(0.44)",
                      transformOrigin: "top left",
                      marginBottom: `calc((297mm * 0.44) - 297mm)`,
                    }}
                  >
                    <TemplateRenderer {...templateProps} />
                    <StampOverlay stampConfig={stampConfig} pageNumber={1} businessInfo={businessInfo} />
                  </div>
                </div>
                {/* ── Stamp button footer ── */}
<div className="flex-shrink-0 px-4 py-3 bg-[#f8fafc] border-t border-[#e2e8f0]">
  <button
    onClick={() => setShowStampModal(true)}
    className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-[#ce1414] hover:bg-[#b01212] text-white text-sm font-medium rounded-lg transition-colors"
  >
    <Stamp className="w-4 h-4" />
    Stamp &amp; Signature
  </button>
</div>
              </div>
            </div>
          )}

          {/* ── Firebase-connected page views ────────────────────────────── */}
          {activeView === "guards" && <GuardsPage user={user} />}
          {activeView === "clients" && <ClientsPage user={user} />}
          {activeView === "sites" && <SitesPage user={user} />}
          {activeView === "patrols" && <PatrolRoutesPage user={user} />}
          {activeView === "schedules" && <SchedulesPage user={user} />}
          {activeView === "invoices" && <InvoicesPage user={user} />}
          {activeView === "reports" && <ReportsPage user={user} />}
          {activeView === "analytics" && <AnalyticsPage user={user} />}
          {activeView === "overview" && <BusinessOverviewPage user={user} />}
          {activeView === "calendar" && <ShiftCalendarPage user={user} />}
        </div>
      </div>
     <SolidFloAgent industry="security" /></div>
  );
};

export default SecurityDashboard;
