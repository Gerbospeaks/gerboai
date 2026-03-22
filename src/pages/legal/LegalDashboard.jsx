import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import BusinessSettingsModal from "../BusinessSettingsModal";
import AppHeader from "../AppHeader";
import { serverTimestamp } from "firebase/firestore";
import logo from "../../assets/img/solidflo-logo.png";
import { getAuth, signOut } from "firebase/auth";
import FinancialOverview from "../FinancialOverview";
import Templates from "./Templates";
import PurchaseOrders from "../PurchaseOrders";
import { useLocation } from "react-router-dom";
import AIInvoiceWindow from "../AIInvoiceWindow";
import TemplateSelector, { TemplateRenderer } from "./TemplateSelector";
import LegalMultiStepForm from "./LegalMultiStepForm";
import LegalSidebar from "./LegalSidebar";
import { getFunctions } from "firebase/functions";
import HomeView from "../HomeView";
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
  deleteDoc,
  serverTimestamp as fst,
} from "firebase/firestore";
import { Printer, Download } from "lucide-react";
import { db } from "../../firebase";
import CustomerModal from "../CustomerModal";
import CustomersListModal from "../CustomersListModal";
import {
  Users,
  Sparkles,
  Calendar,
  FileText,
  DollarSign,
  Save,
  X,
  FileBarChart,
  Plus,
  Send,
  LogOut,
  CheckSquare,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Receipt,
  Wallet,
  Scale,
  Eye,
  BookOpen,
  ArrowRight,
  Search,
  Edit2,
  Trash2,
  Clock,
  MapPin,
  User,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Tag,
  ExternalLink,
  Star,
} from "lucide-react";

// ─── Helpers ───────────────────────────────────────────────────────────────────
const generateInvoiceNumber = async (userId, documentType = "invoice") => {
  const db = getFirestore();
  const year = new Date().getFullYear();
  const collectionName = documentType === "estimate" ? "estimates" : "invoices";
  const prefix = documentType === "estimate" ? "EST" : "INV";
  const q = query(
    collection(db, "users", userId, collectionName),
    orderBy("createdAt", "desc"),
    limit(1),
  );
  const snapshot = await getDocs(q);
  let lastNumber = 1000;
  if (!snapshot.empty) {
    const match = snapshot.docs[0].data().invoiceNumber?.match(/(\d+)$/);
    if (match) lastNumber = Number(match[1]);
  }
  return `${prefix}-${year}-${String(lastNumber + 1).padStart(4, "0")}`;
};

const functions = getFunctions();
const inp =
  "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-lg bg-white text-[#1e293b] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-[#7c3aed] transition-colors";
const formatCurrencyZAR = (n) =>
  new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(
    n || 0,
  );

// ─── COURT DATES CONSTANTS ─────────────────────────────────────────────────────
const COURT_TYPES = [
  "Hearing",
  "Trial",
  "Mention",
  "Pre-Trial Conference",
  "Motion",
  "Judgment",
  "Postponement",
  "Application",
  "Appeal",
  "Arbitration",
  "Mediation",
  "Consultation",
];
const CASE_TYPES_LIST = [
  "Commercial Litigation",
  "Family Law",
  "Criminal",
  "Labour",
  "Property",
  "Constitutional",
  "Corporate",
  "Insolvency",
  "Personal Injury",
  "Administrative",
  "Tax",
  "Immigration",
];
const COURTS_LIST = [
  "High Court",
  "Magistrate's Court",
  "Labour Court",
  "Constitutional Court",
  "Supreme Court of Appeal",
  "Land Claims Court",
  "Small Claims Court",
  "Family Court",
  "Equality Court",
];
const CD_STATUS = {
  upcoming: {
    label: "Upcoming",
    bg: "bg-[#ede9fe]",
    text: "text-[#5b21b6]",
    dot: "bg-[#7c3aed]",
  },
  completed: {
    label: "Completed",
    bg: "bg-[#dcfce7]",
    text: "text-[#166534]",
    dot: "bg-[#059669]",
  },
  postponed: {
    label: "Postponed",
    bg: "bg-[#fef3c7]",
    text: "text-[#92400e]",
    dot: "bg-[#d97706]",
  },
  cancelled: {
    label: "Cancelled",
    bg: "bg-[#fef2f2]",
    text: "text-[#991b1b]",
    dot: "bg-[#dc2626]",
  },
};
const CD_EMPTY = {
  caseNumber: "",
  caseName: "",
  clientName: "",
  courtName: "",
  courtRoom: "",
  division: "",
  date: "",
  time: "",
  type: "Hearing",
  caseType: "Commercial Litigation",
  judge: "",
  prosecutor: "",
  opposingCounsel: "",
  status: "upcoming",
  notes: "",
  outcome: "",
};

// ─── RESEARCH CONSTANTS ────────────────────────────────────────────────────────
const AREAS_OF_LAW = [
  "Constitutional Law",
  "Contract Law",
  "Delict / Tort",
  "Criminal Law",
  "Family Law",
  "Labour Law",
  "Property Law",
  "Company / Corporate",
  "Insolvency",
  "Administrative Law",
  "Tax Law",
  "Intellectual Property",
  "Immigration",
  "Environmental Law",
  "Competition Law",
  "Banking & Finance",
  "Insurance",
  "Consumer Protection",
  "International Law",
  "Evidence",
];
const SOURCE_TYPES = [
  "Case Law",
  "Legislation / Act",
  "Textbook",
  "Academic Article",
  "Practice Note",
  "Government Gazette",
  "Legal Opinion",
  "Treaty / Convention",
  "Regulation",
  "Other",
];
const RESEARCH_COURTS = [
  "Constitutional Court",
  "Supreme Court of Appeal",
  "High Court",
  "Labour Court",
  "Labour Appeal Court",
  "Magistrate's Court",
  "Land Claims Court",
  "Other",
];
const AREA_COLORS = {
  "Constitutional Law": "bg-[#ede9fe] text-[#5b21b6]",
  "Contract Law": "bg-[#dbeafe] text-[#1e40af]",
  "Criminal Law": "bg-[#fef2f2] text-[#991b1b]",
  "Family Law": "bg-[#fce7f3] text-[#9d174d]",
  "Labour Law": "bg-[#f0fdf4] text-[#166534]",
  "Property Law": "bg-[#fff7ed] text-[#92400e]",
  "Tax Law": "bg-[#fef3c7] text-[#92400e]",
  "Delict / Tort": "bg-[#f0fdfa] text-[#134e4a]",
};
const getAreaColor = (area) =>
  AREA_COLORS[area] || "bg-[#f1f5f9] text-[#374151]";
const RES_EMPTY = {
  title: "",
  areaOfLaw: "Constitutional Law",
  sourceType: "Case Law",
  citation: "",
  court: "",
  year: "",
  summary: "",
  keyPoints: "",
  caseNumber: "",
  clientName: "",
  url: "",
  relevance: "High",
  tags: "",
  notes: "",
};

// ─── CALENDAR CONSTANTS ────────────────────────────────────────────────────────
const EVENT_TYPES = {
  hearing: {
    label: "Hearing",
    color: "bg-[#7c3aed]",
    light: "bg-[#ede9fe]",
    text: "text-[#5b21b6]",
    dot: "bg-[#7c3aed]",
  },
  deadline: {
    label: "Deadline",
    color: "bg-[#dc2626]",
    light: "bg-[#fef2f2]",
    text: "text-[#991b1b]",
    dot: "bg-[#dc2626]",
  },
  appointment: {
    label: "Appointment",
    color: "bg-[#2563eb]",
    light: "bg-[#dbeafe]",
    text: "text-[#1e40af]",
    dot: "bg-[#2563eb]",
  },
  meeting: {
    label: "Meeting",
    color: "bg-[#059669]",
    light: "bg-[#dcfce7]",
    text: "text-[#166534]",
    dot: "bg-[#059669]",
  },
  reminder: {
    label: "Reminder",
    color: "bg-[#d97706]",
    light: "bg-[#fef3c7]",
    text: "text-[#92400e]",
    dot: "bg-[#d97706]",
  },
  filing: {
    label: "Filing Date",
    color: "bg-[#0891b2]",
    light: "bg-[#cffafe]",
    text: "text-[#155e75]",
    dot: "bg-[#0891b2]",
  },
  other: {
    label: "Other",
    color: "bg-[#64748b]",
    light: "bg-[#f1f5f9]",
    text: "text-[#374151]",
    dot: "bg-[#64748b]",
  },
};
const CAL_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const CAL_EMPTY = {
  title: "",
  type: "hearing",
  date: "",
  startTime: "",
  endTime: "",
  caseNumber: "",
  clientName: "",
  location: "",
  notes: "",
};

// ─── BILLING CONSTANTS ─────────────────────────────────────────────────────────
const BILLING_TYPES = [
  "Time",
  "Disbursement",
  "Fixed Fee",
  "Consultation",
  "Appearance",
  "Research",
  "Drafting",
  "Other",
];
const BILLER_RATES = {
  Partner: 3500,
  "Senior Associate": 2800,
  Associate: 2200,
  "Candidate Attorney": 1200,
  Custom: 0,
};
const BILL_STATUS = {
  unbilled: { label: "Unbilled", bg: "bg-[#fef3c7]", text: "text-[#92400e]" },
  billed: { label: "Billed", bg: "bg-[#dbeafe]", text: "text-[#1e40af]" },
  paid: { label: "Paid", bg: "bg-[#dcfce7]", text: "text-[#166534]" },
  written_off: {
    label: "Written Off",
    bg: "bg-[#f1f5f9]",
    text: "text-[#374151]",
  },
};
const DISB_TYPES = [
  "Filing Fees",
  "Sheriff Fees",
  "Advocate Fees",
  "Expert Witness",
  "Travel",
  "Postage",
  "Copying",
  "Court Transcripts",
  "Search Fees",
  "Commissioner of Oaths",
  "Other",
];
const BILL_EMPTY = {
  type: "Time",
  date: "",
  clientName: "",
  caseNumber: "",
  description: "",
  billerRole: "Associate",
  rate: 2200,
  hours: "",
  amount: 0,
  disbursementType: "",
  status: "unbilled",
  notes: "",
};

// ─── SMALL SHARED SUB-COMPONENTS ──────────────────────────────────────────────
function Sec({ title, children }) {
  return (
    <div>
      <p className="text-xs font-bold text-[#94a3b8] uppercase tracking-widest mb-3">
        {title}
      </p>
      {children}
    </div>
  );
}
function Fld({ label, children, req }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[#374151] mb-1.5">
        {label}
        {req && <span className="text-[#dc2626] ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
function ModalShell({
  title,
  icon: Icon,
  iconColor = "text-[#7c3aed]",
  onClose,
  onSave,
  saving,
  canSave,
  children,
}) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-[#e2e8f0]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0] bg-[#f8fafc] flex-shrink-0">
          <div className="flex items-center gap-2">
            <Icon className={`w-5 h-5 ${iconColor}`} />
            <h2 className="text-base font-semibold text-[#1e293b]">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#64748b] hover:bg-[#e2e8f0] rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-5">{children}</div>
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-[#e2e8f0] bg-[#f8fafc] flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-[#64748b] hover:bg-[#e2e8f0] rounded-lg transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={saving || !canSave}
            className="px-5 py-2 bg-[#7c3aed] hover:bg-[#6d28d9] disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            {saving && (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// COURT DATES VIEW
// ═══════════════════════════════════════════════════════════════════════════════
function CourtDatesView({ user }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(CD_EMPTY);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [activeTab, setActiveTab] = useState("upcoming");
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const db = getFirestore();
  const todayStr = new Date().toISOString().split("T")[0];

  const load = async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const snap = await getDocs(
        query(
          collection(db, "users", user.uid, "courtDates"),
          orderBy("date", "asc"),
        ),
      );
      setEntries(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (_) {}
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, [user?.uid]);

  const sf = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const openAdd = () => {
    setEditing(null);
    setForm({ ...CD_EMPTY, date: todayStr });
    setShowModal(true);
  };
  const openEdit = (e) => {
    setEditing(e.id);
    setForm({ ...CD_EMPTY, ...e });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.caseNumber || !form.date || !form.courtName) return;
    setSaving(true);
    try {
      const payload = { ...form, updatedAt: serverTimestamp() };
      if (editing)
        await updateDoc(
          doc(db, "users", user.uid, "courtDates", editing),
          payload,
        );
      else
        await addDoc(collection(db, "users", user.uid, "courtDates"), {
          ...payload,
          createdAt: serverTimestamp(),
        });
      setShowModal(false);
      load();
    } catch (_) {}
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this court date?")) return;
    await deleteDoc(doc(db, "users", user.uid, "courtDates", id));
    load();
  };

  const filtered = entries.filter((e) => {
    const s = search.toLowerCase();
    const ms =
      !search ||
      [e.caseNumber, e.caseName, e.clientName, e.courtName].some((v) =>
        v?.toLowerCase().includes(s),
      );
    const mst = filterStatus === "all" || e.status === filterStatus;
    const mt =
      activeTab === "all" ||
      (activeTab === "upcoming" &&
        e.date >= todayStr &&
        e.status !== "cancelled" &&
        e.status !== "completed") ||
      (activeTab === "past" &&
        (e.date < todayStr ||
          e.status === "completed" ||
          e.status === "cancelled"));
    return ms && mst && mt;
  });

  const upcomingCount = entries.filter(
    (e) => e.date >= todayStr && e.status === "upcoming",
  ).length;
  const weekCount = entries.filter((e) => {
    const d = (new Date(e.date) - new Date()) / 86400000;
    return d >= 0 && d <= 7 && e.status === "upcoming";
  }).length;

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#ede9fe] rounded-lg flex items-center justify-center">
              <Scale className="w-5 h-5 text-[#7c3aed]" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#1e293b]">Court Dates</h1>
              <p className="text-xs text-[#64748b]">
                Hearings, trials and appearances
              </p>
            </div>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Court Date
          </button>
        </div>
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              label: "Total",
              value: entries.length,
              bg: "bg-[#f8fafc]",
              text: "text-[#1e293b]",
              border: "border-[#e2e8f0]",
            },
            {
              label: "Upcoming",
              value: upcomingCount,
              bg: "bg-[#ede9fe]",
              text: "text-[#7c3aed]",
              border: "border-[#c4b5fd]",
            },
            {
              label: "This Week",
              value: weekCount,
              bg: "bg-[#fef3c7]",
              text: "text-[#92400e]",
              border: "border-[#fde68a]",
            },
            {
              label: "Completed",
              value: entries.filter((e) => e.status === "completed").length,
              bg: "bg-[#f0fdf4]",
              text: "text-[#166534]",
              border: "border-[#bbf7d0]",
            },
          ].map(({ label, value, bg, text, border }) => (
            <div
              key={label}
              className={`${bg} border ${border} rounded-xl p-3`}
            >
              <p className="text-xs text-[#64748b] mb-1">{label}</p>
              <p className={`text-2xl font-bold ${text}`}>{value}</p>
            </div>
          ))}
        </div>
        {/* Filters */}
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-3 flex flex-wrap gap-2 items-center">
          <div className="flex items-center gap-2 flex-1 min-w-[180px] bg-[#f8fafc] border border-[#e2e8f0] rounded-lg px-3 py-2">
            <Search className="w-4 h-4 text-[#94a3b8] flex-shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search case, client, court…"
              className="flex-1 text-sm bg-transparent outline-none text-[#1e293b] placeholder-[#94a3b8]"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg bg-white text-[#374151] outline-none"
          >
            <option value="all">All Statuses</option>
            {Object.entries(CD_STATUS).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
        </div>
        {/* Tabs */}
        <div className="flex gap-1 bg-[#f1f5f9] p-1 rounded-lg w-fit">
          {[
            { key: "upcoming", label: "Upcoming" },
            { key: "past", label: "Past" },
            { key: "all", label: "All" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === key ? "bg-white text-[#1e293b] shadow-sm" : "text-[#64748b] hover:text-[#374151]"}`}
            >
              {label}
            </button>
          ))}
        </div>
        {/* List */}
        <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-[#7c3aed] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-12 h-12 bg-[#f1f5f9] rounded-full flex items-center justify-center mb-4">
                <Scale className="w-6 h-6 text-[#94a3b8]" />
              </div>
              <p className="text-sm font-semibold text-[#374151] mb-1">
                No court dates found
              </p>
              <p className="text-xs text-[#94a3b8] mb-4">
                {search
                  ? "Try adjusting your search"
                  : "Add your first court date"}
              </p>
              {!search && (
                <button
                  onClick={openAdd}
                  className="px-4 py-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Add Court Date
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-[#f1f5f9]">
              {filtered.map((e) => {
                const st = CD_STATUS[e.status] || CD_STATUS.upcoming;
                const isExp = expandedId === e.id;
                const isPast = e.date < todayStr;
                const d = new Date(e.date + "T00:00:00");
                return (
                  <div key={e.id}>
                    <div
                      className="flex items-start gap-3 px-5 py-4 cursor-pointer hover:bg-[#fafafa] transition-colors"
                      onClick={() => setExpandedId(isExp ? null : e.id)}
                    >
                      <div
                        className={`flex-shrink-0 w-12 text-center rounded-lg py-1.5 ${isPast ? "bg-[#f1f5f9]" : "bg-[#ede9fe]"}`}
                      >
                        <p
                          className={`text-[10px] font-bold ${isPast ? "text-[#64748b]" : "text-[#7c3aed]"}`}
                        >
                          {d
                            .toLocaleString("default", { month: "short" })
                            .toUpperCase()}
                        </p>
                        <p
                          className={`text-xl font-black leading-tight ${isPast ? "text-[#94a3b8]" : "text-[#5b21b6]"}`}
                        >
                          {d.getDate()}
                        </p>
                        <p
                          className={`text-[10px] ${isPast ? "text-[#94a3b8]" : "text-[#7c3aed]"}`}
                        >
                          {d.getFullYear()}
                        </p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-sm font-bold text-[#1e293b]">
                            {e.caseNumber}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-semibold ${st.bg} ${st.text}`}
                          >
                            {st.label}
                          </span>
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-[#f1f5f9] text-[#374151]">
                            {e.type}
                          </span>
                        </div>
                        {e.caseName && (
                          <p className="text-sm text-[#374151] font-medium mb-0.5 truncate">
                            {e.caseName}
                          </p>
                        )}
                        <div className="flex items-center gap-3 flex-wrap text-xs text-[#64748b]">
                          {e.clientName && (
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {e.clientName}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {e.courtName}
                            {e.division ? ` – ${e.division}` : ""}
                          </span>
                          {e.time && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {e.time}
                            </span>
                          )}
                          {e.courtRoom && <span>Room: {e.courtRoom}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={(ev) => {
                            ev.stopPropagation();
                            openEdit(e);
                          }}
                          className="p-1.5 text-[#64748b] hover:text-[#7c3aed] hover:bg-[#ede9fe] rounded-lg transition-all"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(ev) => {
                            ev.stopPropagation();
                            handleDelete(e.id);
                          }}
                          className="p-1.5 text-[#64748b] hover:text-[#dc2626] hover:bg-[#fef2f2] rounded-lg transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <ChevronDown
                          className={`w-4 h-4 text-[#94a3b8] transition-transform ${isExp ? "rotate-180" : ""}`}
                        />
                      </div>
                    </div>
                    {isExp && (
                      <div className="px-5 pb-4 grid grid-cols-1 md:grid-cols-2 gap-3 bg-[#f8fafc] border-t border-[#f1f5f9]">
                        <div className="pt-3 space-y-2">
                          {e.judge && (
                            <div className="flex gap-2">
                              <span className="text-xs text-[#94a3b8] w-32 flex-shrink-0">
                                Presiding Officer
                              </span>
                              <span className="text-xs font-medium text-[#374151]">
                                {e.judge}
                              </span>
                            </div>
                          )}
                          {e.opposingCounsel && (
                            <div className="flex gap-2">
                              <span className="text-xs text-[#94a3b8] w-32 flex-shrink-0">
                                Opposing Counsel
                              </span>
                              <span className="text-xs font-medium text-[#374151]">
                                {e.opposingCounsel}
                              </span>
                            </div>
                          )}
                          {e.caseType && (
                            <div className="flex gap-2">
                              <span className="text-xs text-[#94a3b8] w-32 flex-shrink-0">
                                Matter Type
                              </span>
                              <span className="text-xs font-medium text-[#374151]">
                                {e.caseType}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="pt-3 space-y-2">
                          {e.notes && (
                            <div>
                              <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wide mb-1">
                                Notes
                              </p>
                              <p className="text-sm text-[#374151] bg-white border border-[#e2e8f0] rounded-lg p-2">
                                {e.notes}
                              </p>
                            </div>
                          )}
                          {e.outcome && (
                            <div>
                              <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wide mb-1">
                                Outcome
                              </p>
                              <p className="text-sm text-[#374151] bg-white border border-[#e2e8f0] rounded-lg p-2">
                                {e.outcome}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      {showModal && (
        <ModalShell
          title={editing ? "Edit Court Date" : "Add Court Date"}
          icon={Scale}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          saving={saving}
          canSave={!!(form.caseNumber && form.date && form.courtName)}
        >
          <Sec title="Case Information">
            <div className="grid grid-cols-2 gap-3">
              <Fld label="Case Number" req>
                <input
                  value={form.caseNumber}
                  onChange={(e) => sf("caseNumber", e.target.value)}
                  placeholder="e.g. 2026/12345"
                  className={inp}
                />
              </Fld>
              <Fld label="Case Name">
                <input
                  value={form.caseName}
                  onChange={(e) => sf("caseName", e.target.value)}
                  placeholder="e.g. Smith v Jones"
                  className={inp}
                />
              </Fld>
              <Fld label="Client Name">
                <input
                  value={form.clientName}
                  onChange={(e) => sf("clientName", e.target.value)}
                  placeholder="Client name"
                  className={inp}
                />
              </Fld>
              <Fld label="Matter Type">
                <select
                  value={form.caseType}
                  onChange={(e) => sf("caseType", e.target.value)}
                  className={inp}
                >
                  {CASE_TYPES_LIST.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </Fld>
            </div>
          </Sec>
          <Sec title="Court Details">
            <div className="grid grid-cols-2 gap-3">
              <Fld label="Court" req>
                <select
                  value={form.courtName}
                  onChange={(e) => sf("courtName", e.target.value)}
                  className={inp}
                >
                  <option value="">Select court…</option>
                  {COURTS_LIST.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Fld>
              <Fld label="Division / Location">
                <input
                  value={form.division}
                  onChange={(e) => sf("division", e.target.value)}
                  placeholder="e.g. Western Cape Division"
                  className={inp}
                />
              </Fld>
              <Fld label="Court Room">
                <input
                  value={form.courtRoom}
                  onChange={(e) => sf("courtRoom", e.target.value)}
                  placeholder="e.g. Room 3"
                  className={inp}
                />
              </Fld>
              <Fld label="Type of Appearance">
                <select
                  value={form.type}
                  onChange={(e) => sf("type", e.target.value)}
                  className={inp}
                >
                  {COURT_TYPES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </Fld>
            </div>
          </Sec>
          <Sec title="Date & Time">
            <div className="grid grid-cols-3 gap-3">
              <Fld label="Date" req>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => sf("date", e.target.value)}
                  className={inp}
                />
              </Fld>
              <Fld label="Time">
                <input
                  type="time"
                  value={form.time}
                  onChange={(e) => sf("time", e.target.value)}
                  className={inp}
                />
              </Fld>
              <Fld label="Status">
                <select
                  value={form.status}
                  onChange={(e) => sf("status", e.target.value)}
                  className={inp}
                >
                  {Object.entries(CD_STATUS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </Fld>
            </div>
          </Sec>
          <Sec title="Personnel">
            <div className="grid grid-cols-2 gap-3">
              <Fld label="Presiding Officer">
                <input
                  value={form.judge}
                  onChange={(e) => sf("judge", e.target.value)}
                  placeholder="Judge / Magistrate name"
                  className={inp}
                />
              </Fld>
              <Fld label="Opposing Counsel">
                <input
                  value={form.opposingCounsel}
                  onChange={(e) => sf("opposingCounsel", e.target.value)}
                  placeholder="Opposing attorney"
                  className={inp}
                />
              </Fld>
              <Fld label="Prosecutor">
                <input
                  value={form.prosecutor}
                  onChange={(e) => sf("prosecutor", e.target.value)}
                  placeholder="State prosecutor"
                  className={inp}
                />
              </Fld>
            </div>
          </Sec>
          <Sec title="Notes & Outcome">
            <div className="space-y-3">
              <Fld label="Pre-Hearing Notes">
                <textarea
                  value={form.notes}
                  onChange={(e) => sf("notes", e.target.value)}
                  rows={3}
                  placeholder="Preparation notes, documents required, strategy…"
                  className={`${inp} resize-none`}
                />
              </Fld>
              <Fld label="Outcome / Result">
                <textarea
                  value={form.outcome}
                  onChange={(e) => sf("outcome", e.target.value)}
                  rows={2}
                  placeholder="Record what happened after the hearing…"
                  className={`${inp} resize-none`}
                />
              </Fld>
            </div>
          </Sec>
        </ModalShell>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// LEGAL RESEARCH VIEW
// ═══════════════════════════════════════════════════════════════════════════════
function LegalResearchView({ user }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(RES_EMPTY);
  const [search, setSearch] = useState("");
  const [filterArea, setFilterArea] = useState("all");
  const [filterSource, setFilterSource] = useState("all");
  const [expandedId, setExpandedId] = useState(null);
  const [saving, setSaving] = useState(false);
  const db = getFirestore();

  const load = async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const snap = await getDocs(
        query(
          collection(db, "users", user.uid, "research"),
          orderBy("createdAt", "desc"),
        ),
      );
      setEntries(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (_) {}
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, [user?.uid]);

  const sf = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const openAdd = () => {
    setEditing(null);
    setForm({ ...RES_EMPTY });
    setShowModal(true);
  };
  const openEdit = (e) => {
    setEditing(e.id);
    setForm({ ...RES_EMPTY, ...e });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title) return;
    setSaving(true);
    try {
      const payload = { ...form, updatedAt: serverTimestamp() };
      if (editing)
        await updateDoc(
          doc(db, "users", user.uid, "research", editing),
          payload,
        );
      else
        await addDoc(collection(db, "users", user.uid, "research"), {
          ...payload,
          createdAt: serverTimestamp(),
        });
      setShowModal(false);
      load();
    } catch (_) {}
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this research entry?")) return;
    await deleteDoc(doc(db, "users", user.uid, "research", id));
    load();
  };

  const filtered = entries.filter((e) => {
    const s = search.toLowerCase();
    const ms =
      !search ||
      [e.title, e.citation, e.summary, e.tags, e.caseNumber].some((v) =>
        v?.toLowerCase().includes(s),
      );
    return (
      ms &&
      (filterArea === "all" || e.areaOfLaw === filterArea) &&
      (filterSource === "all" || e.sourceType === filterSource)
    );
  });

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#f0fdfa] rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-[#0891b2]" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#1e293b]">
                Legal Research
              </h1>
              <p className="text-xs text-[#64748b]">
                Case law, statutes and research notes
              </p>
            </div>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Research
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              label: "Total Entries",
              value: entries.length,
              bg: "bg-[#f8fafc]",
              text: "text-[#1e293b]",
              border: "border-[#e2e8f0]",
            },
            {
              label: "High Relevance",
              value: entries.filter((e) => e.relevance === "High").length,
              bg: "bg-[#fef2f2]",
              text: "text-[#dc2626]",
              border: "border-[#fecaca]",
            },
            {
              label: "Case Law",
              value: entries.filter((e) => e.sourceType === "Case Law").length,
              bg: "bg-[#ede9fe]",
              text: "text-[#7c3aed]",
              border: "border-[#c4b5fd]",
            },
            {
              label: "Areas Covered",
              value: [...new Set(entries.map((e) => e.areaOfLaw))].length,
              bg: "bg-[#f0fdf4]",
              text: "text-[#059669]",
              border: "border-[#bbf7d0]",
            },
          ].map(({ label, value, bg, text, border }) => (
            <div
              key={label}
              className={`${bg} border ${border} rounded-xl p-3`}
            >
              <p className="text-xs text-[#64748b] mb-1">{label}</p>
              <p className={`text-2xl font-bold ${text}`}>{value}</p>
            </div>
          ))}
        </div>
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-3 flex flex-wrap gap-2 items-center">
          <div className="flex items-center gap-2 flex-1 min-w-[180px] bg-[#f8fafc] border border-[#e2e8f0] rounded-lg px-3 py-2">
            <Search className="w-4 h-4 text-[#94a3b8] flex-shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, citation, tags…"
              className="flex-1 text-sm bg-transparent outline-none text-[#1e293b] placeholder-[#94a3b8]"
            />
          </div>
          <select
            value={filterArea}
            onChange={(e) => setFilterArea(e.target.value)}
            className="px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg bg-white text-[#374151] outline-none"
          >
            <option value="all">All Areas</option>
            {AREAS_OF_LAW.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
          <select
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
            className="px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg bg-white text-[#374151] outline-none"
          >
            <option value="all">All Sources</option>
            {SOURCE_TYPES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        {loading ? (
          <div className="bg-white border border-[#e2e8f0] rounded-xl p-8 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-[#7c3aed] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-[#e2e8f0] rounded-xl flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 bg-[#f1f5f9] rounded-full flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6 text-[#94a3b8]" />
            </div>
            <p className="text-sm font-semibold text-[#374151] mb-1">
              No research entries found
            </p>
            <p className="text-xs text-[#94a3b8] mb-4">
              {search
                ? "Try adjusting your search"
                : "Start building your research library"}
            </p>
            {!search && (
              <button
                onClick={openAdd}
                className="px-4 py-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm font-medium rounded-lg transition-colors"
              >
                Add Research
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((e) => {
              const isExp = expandedId === e.id;
              const tags = e.tags
                ? e.tags
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean)
                : [];
              return (
                <div
                  key={e.id}
                  className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div
                    className="flex items-start gap-3 px-5 py-4 cursor-pointer"
                    onClick={() => setExpandedId(isExp ? null : e.id)}
                  >
                    <div
                      className={`flex-shrink-0 w-1.5 self-stretch rounded-full ${e.relevance === "High" ? "bg-[#dc2626]" : e.relevance === "Medium" ? "bg-[#d97706]" : "bg-[#94a3b8]"}`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-[#1e293b] mb-1">
                            {e.title}
                          </h3>
                          {e.citation && (
                            <p className="text-xs text-[#64748b] font-mono">
                              {e.citation}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={(ev) => {
                              ev.stopPropagation();
                              openEdit(e);
                            }}
                            className="p-1.5 text-[#64748b] hover:text-[#7c3aed] hover:bg-[#ede9fe] rounded-lg transition-all"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(ev) => {
                              ev.stopPropagation();
                              handleDelete(e.id);
                            }}
                            className="p-1.5 text-[#64748b] hover:text-[#dc2626] hover:bg-[#fef2f2] rounded-lg transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <ChevronDown
                            className={`w-4 h-4 text-[#94a3b8] transition-transform ${isExp ? "rotate-180" : ""}`}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-semibold ${getAreaColor(e.areaOfLaw)}`}
                        >
                          {e.areaOfLaw}
                        </span>
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-[#f1f5f9] text-[#374151]">
                          {e.sourceType}
                        </span>
                        {e.year && (
                          <span className="text-xs text-[#94a3b8]">
                            {e.year}
                          </span>
                        )}
                        {e.court && (
                          <span className="text-xs text-[#94a3b8]">
                            {e.court}
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${e.relevance === "High" ? "bg-[#fef2f2] text-[#991b1b]" : e.relevance === "Medium" ? "bg-[#fef3c7] text-[#92400e]" : "bg-[#f1f5f9] text-[#374151]"}`}
                        >
                          {e.relevance} Relevance
                        </span>
                      </div>
                      {e.summary && (
                        <p className="text-xs text-[#64748b] mt-2 line-clamp-2">
                          {e.summary}
                        </p>
                      )}
                      {tags.length > 0 && (
                        <div className="flex items-center gap-1 mt-2 flex-wrap">
                          <Tag className="w-3 h-3 text-[#94a3b8]" />
                          {tags.map((t) => (
                            <span
                              key={t}
                              className="px-1.5 py-0.5 bg-[#f8fafc] border border-[#e2e8f0] rounded text-xs text-[#64748b]"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  {isExp && (
                    <div className="px-5 pb-4 border-t border-[#f1f5f9] bg-[#f8fafc] space-y-3 pt-3">
                      {e.keyPoints && (
                        <div>
                          <p className="text-xs font-bold text-[#94a3b8] uppercase tracking-widest mb-2">
                            Key Points / Ratio Decidendi
                          </p>
                          <p className="text-sm text-[#374151] whitespace-pre-wrap bg-white border border-[#e2e8f0] rounded-lg p-3">
                            {e.keyPoints}
                          </p>
                        </div>
                      )}
                      {e.notes && (
                        <div>
                          <p className="text-xs font-bold text-[#94a3b8] uppercase tracking-widest mb-2">
                            Personal Notes
                          </p>
                          <p className="text-sm text-[#374151] whitespace-pre-wrap bg-white border border-[#e2e8f0] rounded-lg p-3">
                            {e.notes}
                          </p>
                        </div>
                      )}
                      {e.url && (
                        <a
                          href={e.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#ede9fe] text-[#7c3aed] text-xs font-medium rounded-lg hover:bg-[#ddd6fe] transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" /> View Source
                        </a>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      {showModal && (
        <ModalShell
          title={editing ? "Edit Research Entry" : "Add Research Entry"}
          icon={BookOpen}
          iconColor="text-[#0891b2]"
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          saving={saving}
          canSave={!!form.title}
        >
          <Sec title="Source Details">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Fld label="Title / Name" req>
                  <input
                    value={form.title}
                    onChange={(e) => sf("title", e.target.value)}
                    placeholder="e.g. Pharmaceutical Manufacturers v President of the RSA"
                    className={inp}
                  />
                </Fld>
              </div>
              <Fld label="Area of Law">
                <select
                  value={form.areaOfLaw}
                  onChange={(e) => sf("areaOfLaw", e.target.value)}
                  className={inp}
                >
                  {AREAS_OF_LAW.map((a) => (
                    <option key={a}>{a}</option>
                  ))}
                </select>
              </Fld>
              <Fld label="Source Type">
                <select
                  value={form.sourceType}
                  onChange={(e) => sf("sourceType", e.target.value)}
                  className={inp}
                >
                  {SOURCE_TYPES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </Fld>
              <Fld label="Citation / Reference">
                <input
                  value={form.citation}
                  onChange={(e) => sf("citation", e.target.value)}
                  placeholder="e.g. 2000 (2) SA 674 (CC)"
                  className={inp}
                />
              </Fld>
              <Fld label="Year">
                <input
                  value={form.year}
                  onChange={(e) => sf("year", e.target.value)}
                  placeholder="e.g. 2000"
                  className={inp}
                />
              </Fld>
              <Fld label="Court / Tribunal">
                <select
                  value={form.court}
                  onChange={(e) => sf("court", e.target.value)}
                  className={inp}
                >
                  <option value="">Select…</option>
                  {RESEARCH_COURTS.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Fld>
              <Fld label="Relevance">
                <select
                  value={form.relevance}
                  onChange={(e) => sf("relevance", e.target.value)}
                  className={inp}
                >
                  {["High", "Medium", "Low"].map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </Fld>
              <div className="col-span-2">
                <Fld label="Source URL">
                  <input
                    value={form.url}
                    onChange={(e) => sf("url", e.target.value)}
                    placeholder="https://saflii.org/…"
                    className={inp}
                  />
                </Fld>
              </div>
            </div>
          </Sec>
          <Sec title="Content">
            <div className="space-y-3">
              <Fld label="Summary">
                <textarea
                  value={form.summary}
                  onChange={(e) => sf("summary", e.target.value)}
                  rows={3}
                  placeholder="Brief summary…"
                  className={`${inp} resize-none`}
                />
              </Fld>
              <Fld label="Key Points / Ratio Decidendi">
                <textarea
                  value={form.keyPoints}
                  onChange={(e) => sf("keyPoints", e.target.value)}
                  rows={4}
                  placeholder="The legal principles established, key findings…"
                  className={`${inp} resize-none`}
                />
              </Fld>
              <Fld label="Personal Notes">
                <textarea
                  value={form.notes}
                  onChange={(e) => sf("notes", e.target.value)}
                  rows={2}
                  placeholder="How this applies to your current matters…"
                  className={`${inp} resize-none`}
                />
              </Fld>
            </div>
          </Sec>
          <Sec title="Links & Tags">
            <div className="grid grid-cols-2 gap-3">
              <Fld label="Linked Case Number">
                <input
                  value={form.caseNumber}
                  onChange={(e) => sf("caseNumber", e.target.value)}
                  placeholder="e.g. CASE-2026-001"
                  className={inp}
                />
              </Fld>
              <Fld label="Related Client">
                <input
                  value={form.clientName}
                  onChange={(e) => sf("clientName", e.target.value)}
                  placeholder="Client name"
                  className={inp}
                />
              </Fld>
              <div className="col-span-2">
                <Fld label="Tags (comma-separated)">
                  <input
                    value={form.tags}
                    onChange={(e) => sf("tags", e.target.value)}
                    placeholder="e.g. constitutional rights, section 36, proportionality"
                    className={inp}
                  />
                </Fld>
              </div>
            </div>
          </Sec>
        </ModalShell>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CALENDAR VIEW
// ═══════════════════════════════════════════════════════════════════════════════
function LegalCalendarView({ user }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(CAL_EMPTY);
  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const today = new Date();
  const [curYear, setCurYear] = useState(today.getFullYear());
  const [curMonth, setCurMonth] = useState(today.getMonth());
  const db = getFirestore();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const load = async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const snap = await getDocs(
        query(
          collection(db, "users", user.uid, "calendarEvents"),
          orderBy("date", "asc"),
        ),
      );
      setEvents(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (_) {}
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, [user?.uid]);

  const sf = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const openAdd = (date = "") => {
    setEditing(null);
    setForm({ ...CAL_EMPTY, date });
    setShowModal(true);
  };
  const openEdit = (e) => {
    setEditing(e.id);
    setForm({ ...CAL_EMPTY, ...e });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.date) return;
    setSaving(true);
    try {
      const payload = { ...form, updatedAt: serverTimestamp() };
      if (editing)
        await updateDoc(
          doc(db, "users", user.uid, "calendarEvents", editing),
          payload,
        );
      else
        await addDoc(collection(db, "users", user.uid, "calendarEvents"), {
          ...payload,
          createdAt: serverTimestamp(),
        });
      setShowModal(false);
      load();
    } catch (_) {}
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this event?")) return;
    await deleteDoc(doc(db, "users", user.uid, "calendarEvents", id));
    load();
  };

  const prevMonth = () => {
    if (curMonth === 0) {
      setCurMonth(11);
      setCurYear((y) => y - 1);
    } else setCurMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (curMonth === 11) {
      setCurMonth(0);
      setCurYear((y) => y + 1);
    } else setCurMonth((m) => m + 1);
  };

  const firstDay = new Date(curYear, curMonth, 1).getDay();
  const daysInMonth = new Date(curYear, curMonth + 1, 0).getDate();

  const eventsForDay = (d) => {
    const ds = `${curYear}-${String(curMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    return events.filter((e) => e.date === ds);
  };

  const selDateStr = selectedDate
    ? `${curYear}-${String(curMonth + 1).padStart(2, "0")}-${String(selectedDate).padStart(2, "0")}`
    : null;
  const selEvents = selectedDate ? eventsForDay(selectedDate) : [];
  const todayEvents = events.filter((e) => e.date === todayStr);
  const upcomingEvents = events
    .filter((e) => {
      const d = (new Date(e.date) - today) / 86400000;
      return d >= 0 && d <= 14;
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#ede9fe] rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-[#7c3aed]" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#1e293b]">Calendar</h1>
              <p className="text-xs text-[#64748b]">
                Hearings, deadlines and appointments
              </p>
            </div>
          </div>
          <button
            onClick={() => openAdd(todayStr)}
            className="flex items-center gap-2 px-4 py-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Event
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Calendar grid */}
          <div className="lg:col-span-2 bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#e2e8f0] bg-[#f8fafc]">
              <button
                onClick={prevMonth}
                className="p-1.5 text-[#64748b] hover:bg-[#e2e8f0] rounded-lg transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <h2 className="text-sm font-bold text-[#1e293b]">
                {MONTHS[curMonth]} {curYear}
              </h2>
              <button
                onClick={nextMonth}
                className="p-1.5 text-[#64748b] hover:bg-[#e2e8f0] rounded-lg transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-7 border-b border-[#e2e8f0]">
              {CAL_DAYS.map((d) => (
                <div
                  key={d}
                  className="py-2 text-center text-xs font-bold text-[#94a3b8] uppercase tracking-wide"
                >
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div
                  key={`e${i}`}
                  className="min-h-[72px] border-b border-r border-[#f1f5f9] bg-[#fafafa]"
                />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const ds = `${curYear}-${String(curMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const dayEvs = eventsForDay(day);
                const isToday = ds === todayStr;
                const isSel = selectedDate === day;
                const col = (firstDay + i) % 7;
                return (
                  <div
                    key={day}
                    onClick={() => setSelectedDate(isSel ? null : day)}
                    className={`min-h-[72px] border-b border-r border-[#f1f5f9] p-1.5 cursor-pointer transition-colors ${isSel ? "bg-[#f5f3ff]" : "hover:bg-[#fafafa]"} ${col === 6 ? "border-r-0" : ""}`}
                  >
                    <div
                      className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium mb-1 ${isToday ? "bg-[#7c3aed] text-white font-bold" : isSel ? "bg-[#ede9fe] text-[#7c3aed]" : "text-[#374151]"}`}
                    >
                      {day}
                    </div>
                    <div className="space-y-0.5">
                      {dayEvs.slice(0, 2).map((ev) => {
                        const cfg = EVENT_TYPES[ev.type] || EVENT_TYPES.other;
                        return (
                          <div
                            key={ev.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              openEdit(ev);
                            }}
                            className={`${cfg.light} ${cfg.text} text-[10px] font-medium px-1 py-0.5 rounded truncate leading-tight hover:opacity-80 transition-opacity`}
                          >
                            {ev.startTime ? `${ev.startTime} ` : ""}
                            {ev.title}
                          </div>
                        );
                      })}
                      {dayEvs.length > 2 && (
                        <div className="text-[10px] text-[#94a3b8] px-1">
                          +{dayEvs.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right panel */}
          <div className="space-y-4">
            {/* Selected day / today */}
            <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#e2e8f0] bg-[#f8fafc]">
                <h3 className="text-sm font-semibold text-[#1e293b]">
                  {selectedDate
                    ? `${MONTHS[curMonth]} ${selectedDate}, ${curYear}`
                    : "Today"}
                </h3>
                <button
                  onClick={() => openAdd(selDateStr || todayStr)}
                  className="p-1 text-[#7c3aed] hover:bg-[#ede9fe] rounded-lg transition-all"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {(selectedDate ? selEvents : todayEvents).length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-sm text-[#94a3b8]">No events</p>
                  <button
                    onClick={() => openAdd(selDateStr || todayStr)}
                    className="mt-2 text-xs text-[#7c3aed] hover:underline"
                  >
                    Add event
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-[#f1f5f9]">
                  {(selectedDate ? selEvents : todayEvents).map((ev) => {
                    const cfg = EVENT_TYPES[ev.type] || EVENT_TYPES.other;
                    return (
                      <div
                        key={ev.id}
                        className="px-4 py-3 flex items-start gap-3"
                      >
                        <div
                          className={`w-2 h-2 ${cfg.dot} rounded-full mt-1.5 flex-shrink-0`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#1e293b] truncate">
                            {ev.title}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-[#64748b] mt-0.5 flex-wrap">
                            <span
                              className={`px-1.5 py-0.5 rounded ${cfg.light} ${cfg.text} font-medium`}
                            >
                              {cfg.label}
                            </span>
                            {ev.startTime && (
                              <span className="flex items-center gap-0.5">
                                <Clock className="w-3 h-3" />
                                {ev.startTime}
                                {ev.endTime ? ` – ${ev.endTime}` : ""}
                              </span>
                            )}
                            {ev.location && (
                              <span className="flex items-center gap-0.5">
                                <MapPin className="w-3 h-3" />
                                {ev.location}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => openEdit(ev)}
                            className="p-1 text-[#64748b] hover:text-[#7c3aed] hover:bg-[#ede9fe] rounded transition-all"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDelete(ev.id)}
                            className="p-1 text-[#64748b] hover:text-[#dc2626] hover:bg-[#fef2f2] rounded transition-all"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Upcoming */}
            <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-[#e2e8f0] bg-[#f8fafc]">
                <h3 className="text-sm font-semibold text-[#1e293b]">
                  Next 14 Days
                </h3>
              </div>
              {upcomingEvents.length === 0 ? (
                <div className="py-6 text-center">
                  <p className="text-xs text-[#94a3b8]">Nothing scheduled</p>
                </div>
              ) : (
                <div className="divide-y divide-[#f1f5f9] max-h-64 overflow-y-auto">
                  {upcomingEvents.map((ev) => {
                    const cfg = EVENT_TYPES[ev.type] || EVENT_TYPES.other;
                    const d = new Date(ev.date + "T00:00:00");
                    return (
                      <div
                        key={ev.id}
                        className="px-4 py-2.5 flex items-start gap-2 hover:bg-[#fafafa] cursor-pointer transition-colors"
                        onClick={() => openEdit(ev)}
                      >
                        <div className="flex-shrink-0 text-center w-8">
                          <p className="text-[10px] font-bold text-[#94a3b8]">
                            {d
                              .toLocaleString("default", { month: "short" })
                              .toUpperCase()}
                          </p>
                          <p className="text-sm font-black text-[#374151] leading-tight">
                            {d.getDate()}
                          </p>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <div
                              className={`w-1.5 h-1.5 ${cfg.dot} rounded-full flex-shrink-0`}
                            />
                            <p className="text-xs font-semibold text-[#374151] truncate">
                              {ev.title}
                            </p>
                          </div>
                          <p className="text-xs text-[#94a3b8]">
                            {cfg.label}
                            {ev.startTime ? ` · ${ev.startTime}` : ""}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Legend */}
            <div className="bg-white border border-[#e2e8f0] rounded-xl p-4">
              <p className="text-xs font-bold text-[#94a3b8] uppercase tracking-widest mb-3">
                Event Types
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {Object.entries(EVENT_TYPES).map(([k, v]) => (
                  <div key={k} className="flex items-center gap-1.5">
                    <div
                      className={`w-2 h-2 ${v.dot} rounded-full flex-shrink-0`}
                    />
                    <span className="text-xs text-[#64748b]">{v.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden border border-[#e2e8f0]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0] bg-[#f8fafc] flex-shrink-0">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#7c3aed]" />
                <h2 className="text-base font-semibold text-[#1e293b]">
                  {editing ? "Edit Event" : "Add Event"}
                </h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-[#64748b] hover:bg-[#e2e8f0] rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <Fld label="Event Title" req>
                <input
                  value={form.title}
                  onChange={(e) => sf("title", e.target.value)}
                  placeholder="e.g. Bail application hearing"
                  className={inp}
                />
              </Fld>
              <div className="grid grid-cols-2 gap-3">
                <Fld label="Event Type">
                  <select
                    value={form.type}
                    onChange={(e) => sf("type", e.target.value)}
                    className={inp}
                  >
                    {Object.entries(EVENT_TYPES).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                </Fld>
                <Fld label="Date" req>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => sf("date", e.target.value)}
                    className={inp}
                  />
                </Fld>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Fld label="Start Time">
                  <input
                    type="time"
                    value={form.startTime}
                    onChange={(e) => sf("startTime", e.target.value)}
                    className={inp}
                  />
                </Fld>
                <Fld label="End Time">
                  <input
                    type="time"
                    value={form.endTime}
                    onChange={(e) => sf("endTime", e.target.value)}
                    className={inp}
                  />
                </Fld>
              </div>
              <Fld label="Location / Venue">
                <input
                  value={form.location}
                  onChange={(e) => sf("location", e.target.value)}
                  placeholder="e.g. Cape Town High Court, Room 3"
                  className={inp}
                />
              </Fld>
              <div className="grid grid-cols-2 gap-3">
                <Fld label="Case Number">
                  <input
                    value={form.caseNumber}
                    onChange={(e) => sf("caseNumber", e.target.value)}
                    placeholder="e.g. 2026/001"
                    className={inp}
                  />
                </Fld>
                <Fld label="Client Name">
                  <input
                    value={form.clientName}
                    onChange={(e) => sf("clientName", e.target.value)}
                    placeholder="Client name"
                    className={inp}
                  />
                </Fld>
              </div>
              <Fld label="Notes">
                <textarea
                  value={form.notes}
                  onChange={(e) => sf("notes", e.target.value)}
                  rows={3}
                  placeholder="Preparation notes, what to bring…"
                  className={`${inp} resize-none`}
                />
              </Fld>
            </div>
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-[#e2e8f0] bg-[#f8fafc] flex-shrink-0">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-[#64748b] hover:bg-[#e2e8f0] rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.title || !form.date}
                className="px-5 py-2 bg-[#7c3aed] hover:bg-[#6d28d9] disabled:opacity-50 text-white text-sm font-medium rounded-lg flex items-center gap-2"
              >
                {saving && (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// BILLING VIEW
// ═══════════════════════════════════════════════════════════════════════════════
function LegalBillingView({ user }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(BILL_EMPTY);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("entries");
  const db = getFirestore();

  const load = async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const snap = await getDocs(
        query(
          collection(db, "users", user.uid, "billingEntries"),
          orderBy("date", "desc"),
        ),
      );
      setEntries(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (_) {}
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, [user?.uid]);

  const sf = (k, v) =>
    setForm((p) => {
      const u = { ...p, [k]: v };
      if (k === "billerRole" && v !== "Custom") u.rate = BILLER_RATES[v];
      if (k === "hours" || k === "rate")
        u.amount = (parseFloat(u.hours) || 0) * (parseFloat(u.rate) || 0);
      return u;
    });

  const openAdd = (isDisb = false) => {
    setEditing(null);
    setForm({
      ...BILL_EMPTY,
      date: new Date().toISOString().split("T")[0],
      type: isDisb ? "Disbursement" : "Time",
    });
    setShowModal(true);
  };
  const openEdit = (e) => {
    setEditing(e.id);
    setForm({ ...BILL_EMPTY, ...e });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.date || !form.description || !form.clientName) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        amount: parseFloat(form.amount) || 0,
        updatedAt: serverTimestamp(),
      };
      if (editing)
        await updateDoc(
          doc(db, "users", user.uid, "billingEntries", editing),
          payload,
        );
      else
        await addDoc(collection(db, "users", user.uid, "billingEntries"), {
          ...payload,
          createdAt: serverTimestamp(),
        });
      setShowModal(false);
      load();
    } catch (_) {}
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this billing entry?")) return;
    await deleteDoc(doc(db, "users", user.uid, "billingEntries", id));
    load();
  };

  const handleMarkStatus = async (id, status) => {
    await updateDoc(doc(db, "users", user.uid, "billingEntries", id), {
      status,
      updatedAt: serverTimestamp(),
    });
    load();
  };

  const filtered = entries.filter((e) => {
    const s = search.toLowerCase();
    const ms =
      !search ||
      [e.clientName, e.caseNumber, e.description].some((v) =>
        v?.toLowerCase().includes(s),
      );
    const mst = filterStatus === "all" || e.status === filterStatus;
    const mt =
      filterType === "all" ||
      (filterType === "time" && e.type !== "Disbursement") ||
      (filterType === "disbursement" && e.type === "Disbursement");
    return ms && mst && mt;
  });

  const totalUnbilled = entries
    .filter((e) => e.status === "unbilled")
    .reduce((s, e) => s + parseFloat(e.amount || 0), 0);
  const totalBilled = entries
    .filter((e) => e.status === "billed")
    .reduce((s, e) => s + parseFloat(e.amount || 0), 0);
  const totalPaid = entries
    .filter((e) => e.status === "paid")
    .reduce((s, e) => s + parseFloat(e.amount || 0), 0);
  const totalHours = entries
    .filter((e) => e.type !== "Disbursement")
    .reduce((s, e) => s + parseFloat(e.hours || 0), 0);

  const clientSummary = entries.reduce((acc, e) => {
    const k = e.clientName || "Unknown";
    if (!acc[k]) acc[k] = { unbilled: 0, billed: 0, paid: 0, hours: 0 };
    acc[k][e.status] = (acc[k][e.status] || 0) + parseFloat(e.amount || 0);
    if (e.type !== "Disbursement") acc[k].hours += parseFloat(e.hours || 0);
    return acc;
  }, {});

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#fff7ed] rounded-lg flex items-center justify-center">
              <Receipt className="w-5 h-5 text-[#ea580c]" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#1e293b]">Billing</h1>
              <p className="text-xs text-[#64748b]">
                Time entries and disbursements
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => openAdd(true)}
              className="flex items-center gap-2 px-3 py-2 bg-[#f0fdf4] hover:bg-[#dcfce7] border border-[#bbf7d0] text-[#059669] text-sm font-medium rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" /> Disbursement
            </button>
            <button
              onClick={() => openAdd(false)}
              className="flex items-center gap-2 px-4 py-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Clock className="w-4 h-4" /> Log Time
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              label: "Unbilled",
              value: formatCurrencyZAR(totalUnbilled),
              icon: Wallet,
              bg: "bg-[#fef3c7]",
              iconBg: "bg-[#fde68a]",
              text: "text-[#92400e]",
              border: "border-[#fde68a]",
            },
            {
              label: "Billed",
              value: formatCurrencyZAR(totalBilled),
              icon: Receipt,
              bg: "bg-[#dbeafe]",
              iconBg: "bg-[#bfdbfe]",
              text: "text-[#1e40af]",
              border: "border-[#bfdbfe]",
            },
            {
              label: "Collected",
              value: formatCurrencyZAR(totalPaid),
              icon: CheckSquare,
              bg: "bg-[#dcfce7]",
              iconBg: "bg-[#bbf7d0]",
              text: "text-[#166534]",
              border: "border-[#bbf7d0]",
            },
            {
              label: "Total Hours",
              value: `${totalHours.toFixed(1)} hrs`,
              icon: Clock,
              bg: "bg-[#ede9fe]",
              iconBg: "bg-[#ddd6fe]",
              text: "text-[#5b21b6]",
              border: "border-[#c4b5fd]",
            },
          ].map(({ label, value, icon: Icon, bg, iconBg, text, border }) => (
            <div
              key={label}
              className={`${bg} border ${border} rounded-xl p-3 flex items-center gap-3`}
            >
              <div
                className={`w-9 h-9 ${iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}
              >
                <Icon className={`w-4 h-4 ${text}`} />
              </div>
              <div>
                <p className="text-xs text-[#64748b]">{label}</p>
                <p className={`text-sm font-bold ${text}`}>{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-[#f1f5f9] p-1 rounded-lg w-fit">
          {[
            { key: "entries", label: "Entries" },
            { key: "summary", label: "By Client" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === key ? "bg-white text-[#1e293b] shadow-sm" : "text-[#64748b] hover:text-[#374151]"}`}
            >
              {label}
            </button>
          ))}
        </div>

        {activeTab === "entries" && (
          <>
            <div className="bg-white border border-[#e2e8f0] rounded-xl p-3 flex flex-wrap gap-2 items-center">
              <div className="flex items-center gap-2 flex-1 min-w-[180px] bg-[#f8fafc] border border-[#e2e8f0] rounded-lg px-3 py-2">
                <Search className="w-4 h-4 text-[#94a3b8] flex-shrink-0" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search client, case, description…"
                  className="flex-1 text-sm bg-transparent outline-none text-[#1e293b] placeholder-[#94a3b8]"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg bg-white text-[#374151] outline-none"
              >
                <option value="all">All Statuses</option>
                {Object.entries(BILL_STATUS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.label}
                  </option>
                ))}
              </select>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg bg-white text-[#374151] outline-none"
              >
                <option value="all">All Types</option>
                <option value="time">Time Entries</option>
                <option value="disbursement">Disbursements</option>
              </select>
            </div>
            <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
              {loading ? (
                <div className="p-8 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-[#7c3aed] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-12 h-12 bg-[#f1f5f9] rounded-full flex items-center justify-center mb-4">
                    <Clock className="w-6 h-6 text-[#94a3b8]" />
                  </div>
                  <p className="text-sm font-semibold text-[#374151] mb-1">
                    No billing entries found
                  </p>
                  <p className="text-xs text-[#94a3b8] mb-4">
                    Start tracking your time and disbursements
                  </p>
                  <button
                    onClick={() => openAdd(false)}
                    className="px-4 py-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Log Time
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                        {[
                          "Date",
                          "Client / Case",
                          "Description",
                          "Type",
                          "Hours",
                          "Amount",
                          "Status",
                          "",
                        ].map((h) => (
                          <th
                            key={h}
                            className="px-4 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wide whitespace-nowrap"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((e) => {
                        const st =
                          BILL_STATUS[e.status] || BILL_STATUS.unbilled;
                        return (
                          <tr
                            key={e.id}
                            className="border-b border-[#f1f5f9] hover:bg-[#fafafa] transition-colors"
                          >
                            <td className="px-4 py-3 text-xs text-[#64748b] whitespace-nowrap">
                              {e.date
                                ? new Date(
                                    e.date + "T00:00:00",
                                  ).toLocaleDateString("en-ZA")
                                : "—"}
                            </td>
                            <td className="px-4 py-3 min-w-[140px]">
                              <p className="text-xs font-semibold text-[#374151] truncate max-w-[140px]">
                                {e.clientName || "—"}
                              </p>
                              {e.caseNumber && (
                                <p className="text-xs text-[#94a3b8]">
                                  {e.caseNumber}
                                </p>
                              )}
                            </td>
                            <td className="px-4 py-3 min-w-[160px]">
                              <p className="text-xs text-[#374151] line-clamp-2 max-w-[200px]">
                                {e.description}
                              </p>
                              {e.type === "Disbursement" &&
                                e.disbursementType && (
                                  <p className="text-xs text-[#94a3b8]">
                                    {e.disbursementType}
                                  </p>
                                )}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`px-2 py-0.5 rounded text-xs font-medium ${e.type === "Disbursement" ? "bg-[#f0fdfa] text-[#0e7490]" : "bg-[#ede9fe] text-[#5b21b6]"}`}
                              >
                                {e.type === "Disbursement" ? "Disb." : e.type}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs text-[#374151] whitespace-nowrap">
                              {e.type === "Disbursement"
                                ? "—"
                                : `${parseFloat(e.hours || 0).toFixed(1)}h`}
                            </td>
                            <td className="px-4 py-3 text-xs font-bold text-[#1e293b] whitespace-nowrap">
                              {formatCurrencyZAR(e.amount)}
                            </td>
                            <td className="px-4 py-3">
                              <select
                                value={e.status}
                                onChange={(ev) =>
                                  handleMarkStatus(e.id, ev.target.value)
                                }
                                className={`text-xs font-medium px-2 py-0.5 rounded border-0 outline-none cursor-pointer ${st.bg} ${st.text}`}
                              >
                                {Object.entries(BILL_STATUS).map(([k, v]) => (
                                  <option key={k} value={k}>
                                    {v.label}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-1">
                                <button
                                  onClick={() => openEdit(e)}
                                  className="p-1 text-[#64748b] hover:text-[#7c3aed] hover:bg-[#ede9fe] rounded transition-all"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => handleDelete(e.id)}
                                  className="p-1 text-[#64748b] hover:text-[#dc2626] hover:bg-[#fef2f2] rounded transition-all"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-[#f8fafc] border-t-2 border-[#e2e8f0]">
                        <td
                          colSpan={5}
                          className="px-4 py-3 text-xs font-bold text-[#374151] text-right"
                        >
                          Total Shown:
                        </td>
                        <td className="px-4 py-3 text-sm font-black text-[#7c3aed]">
                          {formatCurrencyZAR(
                            filtered.reduce(
                              (s, e) => s + parseFloat(e.amount || 0),
                              0,
                            ),
                          )}
                        </td>
                        <td colSpan={2} />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === "summary" && (
          <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
            {Object.keys(clientSummary).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Users className="w-10 h-10 text-[#cbd5e1] mb-3" />
                <p className="text-sm text-[#94a3b8]">No billing data yet</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                    {[
                      "Client",
                      "Hours",
                      "Unbilled",
                      "Billed",
                      "Paid",
                      "Total",
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
                  {Object.entries(clientSummary)
                    .sort(
                      (a, b) =>
                        b[1].unbilled +
                        b[1].billed +
                        b[1].paid -
                        (a[1].unbilled + a[1].billed + a[1].paid),
                    )
                    .map(([client, data]) => (
                      <tr
                        key={client}
                        className="border-b border-[#f1f5f9] hover:bg-[#fafafa]"
                      >
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-[#ede9fe] rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-bold text-[#7c3aed]">
                                {client.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="text-sm font-semibold text-[#374151]">
                              {client}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-sm text-[#374151]">
                          {data.hours.toFixed(1)}h
                        </td>
                        <td className="px-5 py-3 text-sm font-medium text-[#92400e]">
                          {formatCurrencyZAR(data.unbilled)}
                        </td>
                        <td className="px-5 py-3 text-sm font-medium text-[#1e40af]">
                          {formatCurrencyZAR(data.billed)}
                        </td>
                        <td className="px-5 py-3 text-sm font-medium text-[#166534]">
                          {formatCurrencyZAR(data.paid)}
                        </td>
                        <td className="px-5 py-3 text-sm font-bold text-[#1e293b]">
                          {formatCurrencyZAR(
                            data.unbilled + data.billed + data.paid,
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden border border-[#e2e8f0]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0] bg-[#f8fafc] flex-shrink-0">
              <div className="flex items-center gap-2">
                {form.type === "Disbursement" ? (
                  <Receipt className="w-5 h-5 text-[#059669]" />
                ) : (
                  <Clock className="w-5 h-5 text-[#7c3aed]" />
                )}
                <h2 className="text-base font-semibold text-[#1e293b]">
                  {editing
                    ? "Edit Entry"
                    : form.type === "Disbursement"
                      ? "Add Disbursement"
                      : "Log Time"}
                </h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-[#64748b] hover:bg-[#e2e8f0] rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Fld label="Entry Type">
                  <select
                    value={form.type}
                    onChange={(e) => sf("type", e.target.value)}
                    className={inp}
                  >
                    {BILLING_TYPES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </Fld>
                <Fld label="Date" req>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => sf("date", e.target.value)}
                    className={inp}
                  />
                </Fld>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Fld label="Client Name" req>
                  <input
                    value={form.clientName}
                    onChange={(e) => sf("clientName", e.target.value)}
                    placeholder="Client name"
                    className={inp}
                  />
                </Fld>
                <Fld label="Case Number">
                  <input
                    value={form.caseNumber}
                    onChange={(e) => sf("caseNumber", e.target.value)}
                    placeholder="e.g. CASE-2026-001"
                    className={inp}
                  />
                </Fld>
              </div>
              <Fld label="Description" req>
                <textarea
                  value={form.description}
                  onChange={(e) => sf("description", e.target.value)}
                  rows={2}
                  placeholder={
                    form.type === "Disbursement"
                      ? "e.g. Filing fee for application at High Court"
                      : "e.g. Drafting of founding affidavit"
                  }
                  className={`${inp} resize-none`}
                />
              </Fld>
              {form.type === "Disbursement" ? (
                <>
                  <Fld label="Disbursement Category">
                    <select
                      value={form.disbursementType}
                      onChange={(e) => sf("disbursementType", e.target.value)}
                      className={inp}
                    >
                      <option value="">Select category…</option>
                      {DISB_TYPES.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </Fld>
                  <Fld label="Amount (ZAR)" req>
                    <input
                      type="number"
                      value={form.amount}
                      onChange={(e) => sf("amount", e.target.value)}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className={inp}
                    />
                  </Fld>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-3">
                    <Fld label="Biller Role">
                      <select
                        value={form.billerRole}
                        onChange={(e) => sf("billerRole", e.target.value)}
                        className={inp}
                      >
                        {Object.keys(BILLER_RATES).map((r) => (
                          <option key={r}>{r}</option>
                        ))}
                      </select>
                    </Fld>
                    <Fld label="Rate (ZAR/hr)">
                      <input
                        type="number"
                        value={form.rate}
                        onChange={(e) => sf("rate", e.target.value)}
                        placeholder="0"
                        min="0"
                        step="50"
                        className={inp}
                      />
                    </Fld>
                    <Fld label="Hours">
                      <input
                        type="number"
                        value={form.hours}
                        onChange={(e) => sf("hours", e.target.value)}
                        placeholder="0.5"
                        min="0"
                        step="0.1"
                        className={inp}
                      />
                    </Fld>
                  </div>
                  <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-lg px-4 py-3 flex items-center justify-between">
                    <span className="text-sm text-[#64748b]">
                      Calculated Amount
                    </span>
                    <span className="text-lg font-bold text-[#7c3aed]">
                      {formatCurrencyZAR(
                        (parseFloat(form.rate) || 0) *
                          (parseFloat(form.hours) || 0),
                      )}
                    </span>
                  </div>
                </>
              )}
              <div className="grid grid-cols-2 gap-3">
                <Fld label="Status">
                  <select
                    value={form.status}
                    onChange={(e) => sf("status", e.target.value)}
                    className={inp}
                  >
                    {Object.entries(BILL_STATUS).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                </Fld>
              </div>
              <Fld label="Internal Notes">
                <textarea
                  value={form.notes}
                  onChange={(e) => sf("notes", e.target.value)}
                  rows={2}
                  placeholder="Internal notes (not shown on invoice)…"
                  className={`${inp} resize-none`}
                />
              </Fld>
            </div>
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-[#e2e8f0] bg-[#f8fafc] flex-shrink-0">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-[#64748b] hover:bg-[#e2e8f0] rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={
                  saving || !form.date || !form.description || !form.clientName
                }
                className="px-5 py-2 bg-[#7c3aed] hover:bg-[#6d28d9] disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                {saving && (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
const LegalDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [inputMode, setInputMode] = useState("manual");
  const [documentType, setDocumentType] = useState("invoice");
  const [activeView, setActiveView] = useState("home");
  const { user } = useAuth();
  const [showAIWindow, setShowAIWindow] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceId, setInvoiceId] = useState(null);
  const [savedInvoices, setSavedInvoices] = useState([]);
  const [savedCustomers, setSavedCustomers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [invoices, setInvoices] = useState([]);

  const [showSettings, setShowSettings] = useState(false);
  const [showCustomersListModal, setShowCustomersListModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showAllInvoices, setShowAllInvoices] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("professional");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);

  const [stampSettings] = useState({
    text: "APPROVED",
    color: "#d32f2f",
    showDate: false,
    enabled: false,
  });
  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalEstimates: 0,
    totalInvoiced: 0,
    totalClients: 0,
    pendingPayments: 0,
    loading: true,
  });
  const [paymentStatus, setPaymentStatus] = useState({
    totalPaid: 0,
    balanceDue: 0,
    status: "pending",
  });

  const [clientName, setClientName] = useState("John Smith");
  const [clientId, setClientId] = useState("CLIENT-2026-1234");
  const [clientEmail, setClientEmail] = useState("john.smith@example.com");
  const [clientPhone, setClientPhone] = useState("082 123 4567");
  const [clientAddress, setClientAddress] = useState(
    "123 Legal Street, Cape Town, 8001",
  );
  const [caseType, setCaseType] = useState("Commercial Litigation");
  const [caseNumber, setCaseNumber] = useState("CASE-2026-001");
  const [matterDescription, setMatterDescription] = useState(
    "Contract dispute regarding service agreement",
  );
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({
    description: "",
    rate: "",
    hours: "",
    type: "Legal Services",
  });
  const [businessInfo, setBusinessInfo] = useState({
    businessName: "SMITH & ASSOCIATES ATTORNEYS",
    addressLine1: "15 LEGAL AVENUE",
    addressLine2: "CAPE TOWN CBD",
    city: "CAPE TOWN",
    postalCode: "8001",
    primaryPhone: "021 123 4567",
    secondaryPhone: "021 123 4568",
    logoUrl: "",
  });

  const location = useLocation();
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const vat = subtotal * 0.15;
  const total = subtotal + vat;

  useEffect(() => {
    if (location.state?.activeView) setActiveView(location.state.activeView);
  }, [location.state]);
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
    if (!user?.uid) return;
    generateInvoiceNumber(user.uid, documentType).then(setInvoiceNumber);
    loadSavedInvoices();
  }, [user, documentType]);
  useEffect(() => {
    if (user?.uid) {
      loadBusinessInfo();
      loadCustomers();
      fetchBusinessStats();
    }
  }, [user]);
  useEffect(() => {
    if (!invoiceId)
      setPaymentStatus({ totalPaid: 0, balanceDue: total, status: "pending" });
  }, [total, invoiceId]);

  const fetchBusinessStats = async () => {
    if (!user?.uid) return;
    try {
      const db = getFirestore();
      const invoicesSnap = await getDocs(
        collection(db, "users", user.uid, "invoices"),
      );
      let totalInvoiced = 0,
        pendingPayments = 0;
      const invoicesList = [];
      invoicesSnap.forEach((d) => {
        const data = d.data();
        totalInvoiced += parseFloat(data.totals?.total || 0);
        if (["pending", "unpaid", "partially_paid"].includes(data.status))
          pendingPayments += parseFloat(
            data.totals?.due || data.totals?.total || 0,
          );
        invoicesList.push({ id: d.id, ...data });
      });
      invoicesList.sort(
        (a, b) =>
          new Date(b.dates?.invoiceDate || 0) -
          new Date(a.dates?.invoiceDate || 0),
      );
      setInvoices(invoicesList);
      let estimateCount = 0,
        clientCount = 0;
      try {
        estimateCount = (
          await getDocs(collection(db, "users", user.uid, "estimates"))
        ).docs.length;
      } catch (_) {}
      try {
        const cSnap = await getDocs(
          collection(db, "users", user.uid, "clients"),
        );
        clientCount = cSnap.docs.length;
        setSavedCustomers(cSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (_) {}
      setStats({
        totalInvoices: invoicesSnap.docs.length,
        totalEstimates: estimateCount,
        totalInvoiced,
        totalClients: clientCount,
        pendingPayments,
        loading: false,
      });
    } catch (_) {
      setStats((p) => ({ ...p, loading: false }));
    }
  };

  const loadBusinessInfo = async () => {
    if (!user?.uid) return;
    try {
      const db = getFirestore();
      const snap = await getDoc(
        doc(db, "users", user.uid, "settings", "businessInfo"),
      );
      if (snap.exists()) setBusinessInfo(snap.data());
    } catch (_) {
    } finally {
      setLoading(false);
    }
  };

  const loadCustomers = async () => {
    try {
      const snap = await getDocs(
        query(
          collection(db, "users", user.uid, "clients"),
          orderBy("createdAt", "desc"),
        ),
      );
      setCustomers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (_) {}
  };

  const loadSavedInvoices = async () => {
    if (!user?.uid) return;
    const snap = await getDocs(
      query(
        collection(getFirestore(), "users", user.uid, "invoices"),
        orderBy("createdAt", "desc"),
        limit(50),
      ),
    );
    setSavedInvoices(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  const handleAddNewCustomer = () => {
    setSelectedCustomer(null);
    setShowCustomerModal(true);
  };
  const handleEditCustomer = (c) => {
    setSelectedCustomer(c);
    setShowCustomerModal(true);
  };
  const handleCustomerSaved = () => loadCustomers();
  const loadCustomer = (c) => {
    setClientName(c.name || "");
    setClientEmail(c.email || "");
    setClientPhone(c.phone || "");
    setClientAddress(c.address || "");
    setClientId(c.customerId || "");
  };

  const loadInvoice = (inv) => {
    setInvoiceId(inv.id);
    setInvoiceNumber(inv.invoiceNumber || "");
    setClientName(inv.client?.name || "");
    setClientEmail(inv.client?.email || "");
    setClientPhone(inv.client?.phone || "");
    setClientAddress(inv.client?.address || "");
    setClientId(inv.client?.clientId || "");
    setCaseType(inv.case?.type || "");
    setCaseNumber(inv.case?.caseNumber || "");
    setMatterDescription(inv.case?.matterDescription || "");
    setItems(inv.items || []);
    setPaymentStatus({
      totalPaid: inv.totals?.paid || 0,
      balanceDue: inv.totals?.due || inv.totals?.total || 0,
      status: inv.status || "pending",
    });
    setShowAllInvoices(false);
    setActiveView("invoice");
  };

  const handleAddItem = () => {
    if (!newItem.description || !newItem.hours) return;
    const rate = Number(newItem.rate) || 0,
      hours = Number(newItem.hours);
    setItems((prev) => [
      ...prev,
      {
        description: newItem.description,
        type: newItem.type || "Legal Services",
        rate,
        hours,
        qty: hours,
        amount: rate * hours,
      },
    ]);
    setNewItem({
      description: "",
      rate: "",
      hours: "",
      type: "Legal Services",
    });
  };
  const handleRemoveItem = (index) =>
    setItems((prev) => prev.filter((_, i) => i !== index));

  const buildPayload = (num) => ({
    invoiceNumber: num,
    locked: true,
    status: "pending",
    documentType,
    dates: {
      invoiceDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    client: {
      name: clientName,
      email: clientEmail,
      phone: clientPhone,
      address: clientAddress,
      clientId,
    },
    case: { type: caseType, caseNumber, matterDescription },
    items,
    totals: { subtotal, vat, total, paid: 0, due: total },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const handleSaveInvoice = async () => {
    if (!user?.uid) return;
    const db = getFirestore();
    let num = invoiceNumber;
    if (!invoiceId) {
      num = await generateInvoiceNumber(user.uid, documentType);
      setInvoiceNumber(num);
    }
    const data = buildPayload(num);
    if (invoiceId)
      await updateDoc(doc(db, "users", user.uid, "invoices", invoiceId), {
        ...data,
        updatedAt: serverTimestamp(),
      });
    else {
      const ref = await addDoc(
        collection(db, "users", user.uid, "invoices"),
        data,
      );
      setInvoiceId(ref.id);
    }
    alert(
      `${documentType === "estimate" ? "Estimate" : "Invoice"} saved and locked`,
    );
    loadSavedInvoices();
    fetchBusinessStats();
  };

  const handleConvertToInvoice = async () => {
    if (!user?.uid || !invoiceId) {
      alert("Please save the estimate first");
      return;
    }
    if (!window.confirm("Convert this estimate to an invoice?")) return;
    try {
      const db = getFirestore();
      const newNum = await generateInvoiceNumber(user.uid, "invoice");
      const data = {
        ...buildPayload(newNum),
        documentType: "invoice",
        convertedFromEstimate: invoiceId,
        convertedFromEstimateNumber: invoiceNumber,
        convertedAt: serverTimestamp(),
      };
      const ref = await addDoc(
        collection(db, "users", user.uid, "invoices"),
        data,
      );
      await updateDoc(doc(db, "users", user.uid, "estimates", invoiceId), {
        convertedToInvoice: true,
        convertedToInvoiceId: ref.id,
        convertedToInvoiceNumber: newNum,
        convertedAt: serverTimestamp(),
        status: "converted",
      });
      setDocumentType("invoice");
      setInvoiceId(ref.id);
      setInvoiceNumber(newNum);
      alert(`Converted to Invoice ${newNum}`);
      loadSavedInvoices();
    } catch (_) {
      alert("Failed to convert");
    }
  };

  const resetFields = () => {
    setInvoiceId(null);
    setInvoiceNumber("");
    setClientName("John Smith");
    setClientId("CLIENT-2026-1234");
    setClientEmail("john.smith@example.com");
    setClientPhone("082 123 4567");
    setClientAddress("123 Legal Street, Cape Town, 8001");
    setCaseType("Commercial Litigation");
    setCaseNumber("CASE-2026-001");
    setMatterDescription("Contract dispute regarding service agreement");
    setItems([]);
  };
  const handleNewEstimate = () => {
    setDocumentType("estimate");
    resetFields();
    generateInvoiceNumber(user?.uid, "estimate").then(setInvoiceNumber);
  };
  const handleNewInvoiceDoc = () => {
    setDocumentType("invoice");
    resetFields();
    generateInvoiceNumber(user?.uid, "invoice").then(setInvoiceNumber);
  };

  const printStyles = `@media print { * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } html,body { margin:0!important;padding:0!important;width:210mm!important;background:white!important; } body * { visibility:hidden!important; } #print-area,#print-area * { visibility:visible!important; } #print-area { display:block!important;position:absolute!important;left:0!important;top:0!important;width:210mm!important;min-height:297mm!important;margin:0!important;padding:0!important;background:white!important; } @page { size:A4 portrait;margin:40px!important; } }`;
  const handlePrint = () => {
    const s = document.createElement("style");
    s.textContent = printStyles;
    document.head.appendChild(s);
    window.print();
    setTimeout(() => document.head.removeChild(s), 1000);
  };
  const handleSavePDF = () => {
    if (!invoiceId) {
      alert("Please save the invoice before exporting PDF");
      return;
    }
    setTimeout(() => window.print(), 300);
  };
  const handleLogout = async () => {
    try {
      await signOut(getAuth());
    } catch (_) {}
  };

  const statusBadge = (s) =>
    s === "paid"
      ? "bg-[#dcfce7] text-[#166534]"
      : s === "partially_paid"
        ? "bg-[#fef3c7] text-[#92400e]"
        : s === "pending"
          ? "bg-[#ede9fe] text-[#5b21b6]"
          : "bg-[#fef2f2] text-[#991b1b]";

  const templateProps = {
    templateId: selectedTemplate,
    businessInfo,
    loading,
    jobCardNumber: invoiceNumber,
    customerName: clientName,
    customerEmail: clientEmail,
    customerPhone: clientPhone,
    customerAddress: clientAddress,
    caseNumber,
    caseType,
    matterDescription,
    items,
    subtotal,
    vat,
    total,
    documentType: "legal",
    serviceType: "LEGAL",
    stampSettings,
    showStamp: stampSettings.enabled,
    showStampDate: stampSettings.showDate,
    stampText: stampSettings.text,
    stampColor: stampSettings.color,
    paymentStatus,
  };

  const headerActions = [
    documentType === "estimate" &&
      invoiceId && {
        label: "Convert to Invoice",
        icon: FileText,
        onClick: handleConvertToInvoice,
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
      onClick:
        documentType === "estimate" ? handleNewEstimate : handleNewInvoiceDoc,
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
        "flex items-center gap-1.5 px-3 py-1.5 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm font-medium rounded-md transition-colors whitespace-nowrap",
    },
  ].filter(Boolean);

  const mobileDashboardActions = [
    documentType === "estimate" &&
      invoiceId && {
        label: "To Invoice",
        icon: FileText,
        onClick: handleConvertToInvoice,
        className:
          "flex items-center gap-1.5 px-3 py-2 bg-[#7c3aed] text-white rounded-md text-xs font-medium active:scale-95 whitespace-nowrap",
      },
    {
      label: "Save",
      icon: Save,
      onClick: handleSaveInvoice,
      className:
        "flex items-center gap-1.5 px-3 py-2 bg-[#7c3aed] text-white rounded-md text-xs font-medium active:scale-95 whitespace-nowrap",
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
  ].filter(Boolean);

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
            className={`flex items-center gap-0.5 text-xs font-semibold ${trend > 0 ? "text-[#059669]" : "text-[#dc2626]"}`}
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

  const HomeViewLocal = () => (
    <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          title="Invoices"
          value={stats.totalInvoices}
          icon={FileText}
          iconBg="bg-[#ede9fe]"
          iconColor="text-[#7c3aed]"
          subtitle="All time"
          loading={stats.loading}
          trend={12}
        />
        <StatCard
          title="Estimates"
          value={stats.totalEstimates}
          icon={Receipt}
          iconBg="bg-[#f0fdfa]"
          iconColor="text-[#0891b2]"
          subtitle="Generated"
          loading={stats.loading}
        />
        <StatCard
          title="Revenue"
          value={formatCurrencyZAR(stats.totalInvoiced)}
          icon={TrendingUp}
          iconBg="bg-[#f0fdf4]"
          iconColor="text-[#059669]"
          subtitle="Total invoiced"
          loading={stats.loading}
          trend={8}
        />
        <StatCard
          title="Clients"
          value={stats.totalClients}
          icon={Users}
          iconBg="bg-[#fff7ed]"
          iconColor="text-[#ea580c]"
          subtitle="Active"
          loading={stats.loading}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 bg-[#fff7ed] rounded-lg flex items-center justify-center flex-shrink-0">
            <Receipt className="w-5 h-5 text-[#ea580c]" />
          </div>
          <div>
            <p className="text-xs text-[#64748b] mb-0.5">Pending Payments</p>
            {stats.loading ? (
              <div className="h-6 bg-[#f1f5f9] rounded animate-pulse w-32" />
            ) : (
              <>
                <p className="text-xl font-bold text-[#ea580c]">
                  {formatCurrencyZAR(stats.pendingPayments)}
                </p>
                <p className="text-xs text-[#94a3b8]">Outstanding invoices</p>
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
                label: "New Invoice",
                icon: FileText,
                onClick: () => {
                  handleNewInvoiceDoc();
                  setActiveView("invoice");
                },
                bg: "bg-[#ede9fe]",
                hover: "hover:bg-[#ddd6fe]",
                border: "border-[#c4b5fd]",
                iconBg: "bg-[#7c3aed]",
                text: "text-[#5b21b6]",
              },
              {
                label: "New Estimate",
                icon: Receipt,
                onClick: () => {
                  handleNewEstimate();
                  setActiveView("invoice");
                },
                bg: "bg-[#f0fdfa]",
                hover: "hover:bg-[#ccfbf1]",
                border: "border-[#99f6e4]",
                iconBg: "bg-[#0891b2]",
                text: "text-[#0e7490]",
              },
              {
                label: "Clients",
                icon: Users,
                onClick: () => setShowCustomersListModal(true),
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
      <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#e2e8f0] bg-[#f8fafc]">
          <h3 className="text-sm font-semibold text-[#1e293b]">
            Recent Invoices
          </h3>
          <button
            onClick={() => setShowAllInvoices(true)}
            className="text-xs text-[#7c3aed] hover:text-[#6d28d9] font-medium"
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
          ) : invoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-10 h-10 mb-3 bg-[#f1f5f9] rounded-full flex items-center justify-center">
                <Scale className="w-5 h-5 text-[#94a3b8]" />
              </div>
              <p className="text-sm font-medium text-[#374151] mb-1">
                No invoices yet
              </p>
              <p className="text-xs text-[#94a3b8] mb-3">
                Create your first invoice to get started
              </p>
              <button
                onClick={() => {
                  handleNewInvoiceDoc();
                  setActiveView("invoice");
                }}
                className="px-4 py-1.5 bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-lg text-xs font-medium transition-colors"
              >
                Create Invoice
              </button>
            </div>
          ) : (
            invoices.slice(0, 8).map((inv) => (
              <div
                key={inv.id}
                onClick={() => loadInvoice(inv)}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-[#f8fafc] cursor-pointer transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-[#1e293b] truncate">
                      {inv.invoiceNumber || inv.id}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-semibold flex-shrink-0 ${statusBadge(inv.status)}`}
                    >
                      {inv.status === "partially_paid"
                        ? "Partial"
                        : inv.status || "Draft"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[#64748b]">
                    <span className="flex items-center gap-1 truncate">
                      <Users className="w-3 h-3 flex-shrink-0" />
                      {inv.client?.name || "No client"}
                    </span>
                    <span className="flex items-center gap-1 truncate">
                      <Scale className="w-3 h-3 flex-shrink-0" />
                      {inv.case?.type || "No case"}
                    </span>
                  </div>
                </div>
                <div className="text-right ml-4 flex-shrink-0">
                  <div className="text-sm font-bold text-[#1e293b]">
                    {formatCurrencyZAR(inv.totals?.total || 0)}
                  </div>
                  {inv.totals?.due > 0 &&
                    inv.totals?.due < inv.totals?.total && (
                      <div className="text-xs text-[#d97706]">
                        Due: {formatCurrencyZAR(inv.totals.due)}
                      </div>
                    )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen w-full overflow-hidden flex flex-col bg-[#f0f2f5]">
      <div
        id="print-area"
        className="hidden print:block bg-white"
        style={{ width: "210mm", minHeight: "297mm" }}
      >
        <TemplateRenderer {...templateProps} />
      </div>
      {showAIWindow && (
        <AIInvoiceWindow
          user={user}
          businessInfo={businessInfo}
          documentType={documentType}
          onExit={() => setShowAIWindow(false)}
          industry="legal"
          TemplateRenderer={TemplateRenderer}
        />
      )}

      <div className="flex-1 flex overflow-hidden min-h-0">
        <LegalSidebar
          user={user}
          activeView={activeView}
          setActiveView={setActiveView}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          setShowSettings={setShowSettings}
          handleNewInvoice={handleNewInvoiceDoc}
          handleNewEstimate={handleNewEstimate}
          handleNewInvoiceDoc={handleNewInvoiceDoc}
          handleAddNewCustomer={handleAddNewCustomer}
          businessInfo={businessInfo}
          savedInvoices={savedInvoices}
          savedCustomers={savedCustomers}
          showInvoicesList={showAllInvoices}
          setShowInvoicesList={setShowAllInvoices}
          setShowCustomersListModal={setShowCustomersListModal}
          documentType={documentType}
          handleLogout={handleLogout}
        />

        <div
          className={`flex-1 overflow-hidden flex flex-col min-h-0 transition-all duration-300 ${sidebarOpen ? "md:ml-2" : "md:ml-4"}`}
        >
          <AppHeader
            actions={headerActions}
            mobileActions={mobileDashboardActions}
            onSettingsOpen={() => setShowSettings(true)}
          />

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
          <CustomerModal
            showModal={showCustomerModal}
            setShowModal={setShowCustomerModal}
            existingCustomer={selectedCustomer}
            onCustomerSaved={handleCustomerSaved}
          />

          {showAllInvoices && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden border border-[#e2e8f0]">
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0] bg-[#f8fafc]">
                  <div>
                    <h2 className="text-base font-semibold text-[#1e293b]">
                      All{" "}
                      {documentType === "estimate" ? "Estimates" : "Invoices"}
                    </h2>
                    <p className="text-xs text-[#64748b] mt-0.5">
                      {savedInvoices.length} records
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAllInvoices(false)}
                    className="p-1.5 text-[#64748b] hover:bg-[#e2e8f0] rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {savedInvoices.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <Scale className="w-10 h-10 text-[#cbd5e1] mb-3" />
                      <p className="text-sm text-[#94a3b8]">No records found</p>
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead>
                        <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                          {[
                            "Number",
                            "Client",
                            "Case Type",
                            "Case #",
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
                            <td className="px-5 py-3 text-sm font-semibold text-[#7c3aed]">
                              {inv.invoiceNumber || "N/A"}
                            </td>
                            <td className="px-5 py-3 text-sm text-[#374151]">
                              {inv.client?.name || "N/A"}
                            </td>
                            <td className="px-5 py-3 text-sm text-[#374151]">
                              {inv.case?.type || "N/A"}
                            </td>
                            <td className="px-5 py-3 text-sm text-[#374151]">
                              {inv.case?.caseNumber || "N/A"}
                            </td>
                            <td className="px-5 py-3 text-sm font-semibold text-[#1e293b]">
                              {formatCurrencyZAR(inv.totals?.total || 0)}
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
                        {documentType === "estimate" ? "Estimate" : "Invoice"}{" "}
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
                      className="p-1.5 text-[#64748b] hover:bg-[#e2e8f0] rounded-lg"
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

          {/* ── VIEWS ── */}
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
          {activeView === "templates" && (
            <div className="flex-1 overflow-y-auto p-4">
              <Templates user={user} />
            </div>
          )}
          {activeView === "financial-overview" && (
            <div className="flex-1 overflow-y-auto p-4">
              <FinancialOverview user={user} />
            </div>
          )}
          {activeView === "purchase-orders" && (
            <div className="flex-1 overflow-y-auto p-6">
              <PurchaseOrders user={user} />
            </div>
          )}

          {/* ── FULLY INLINED VIEWS — no imports needed ── */}
          {activeView === "court-dates" && <CourtDatesView user={user} />}
          {activeView === "legal-research" && <LegalResearchView user={user} />}
          {activeView === "calendar" && <LegalCalendarView user={user} />}
          {activeView === "billing" && <LegalBillingView user={user} />}

          {activeView === "payments" && (
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-9 h-9 bg-[#ede9fe] rounded-lg flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-[#7c3aed]" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-[#1e293b]">
                      Payments
                    </h1>
                    <p className="text-xs text-[#64748b]">
                      Payment records and trust account
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {[
                    {
                      label: "Total Received",
                      value: formatCurrencyZAR(
                        stats.totalInvoiced - stats.pendingPayments,
                      ),
                      icon: CheckSquare,
                      bg: "bg-[#f0fdf4]",
                      color: "text-[#059669]",
                    },
                    {
                      label: "Pending",
                      value: formatCurrencyZAR(stats.pendingPayments),
                      icon: Wallet,
                      bg: "bg-[#fff7ed]",
                      color: "text-[#ea580c]",
                    },
                    {
                      label: "Total Invoiced",
                      value: formatCurrencyZAR(stats.totalInvoiced),
                      icon: TrendingUp,
                      bg: "bg-[#ede9fe]",
                      color: "text-[#7c3aed]",
                    },
                  ].map(({ label, value, icon: Icon, bg, color }) => (
                    <div
                      key={label}
                      className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-[#64748b]">{label}</span>
                        <div
                          className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center`}
                        >
                          <Icon className={`w-4 h-4 ${color}`} />
                        </div>
                      </div>
                      <p className={`text-xl font-bold ${color}`}>{value}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
                  <div className="px-5 py-3.5 border-b border-[#e2e8f0] bg-[#f8fafc]">
                    <h3 className="text-sm font-semibold text-[#1e293b]">
                      Recent Payments
                    </h3>
                  </div>
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-10 h-10 bg-[#f1f5f9] rounded-full flex items-center justify-center mb-3">
                      <CreditCard className="w-5 h-5 text-[#94a3b8]" />
                    </div>
                    <p className="text-sm font-medium text-[#374151] mb-1">
                      No payments recorded
                    </p>
                    <p className="text-xs text-[#94a3b8]">
                      Payments will appear here once invoices are paid
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeView === "reports" && (
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-9 h-9 bg-[#f0fdf4] rounded-lg flex items-center justify-center">
                    <FileBarChart className="w-5 h-5 text-[#059669]" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-[#1e293b]">
                      Reports
                    </h1>
                    <p className="text-xs text-[#64748b]">
                      Practice performance and financial reports
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      title: "Revenue Report",
                      desc: "Monthly and annual revenue breakdown",
                      icon: TrendingUp,
                      bg: "bg-[#f0fdf4]",
                      color: "text-[#059669]",
                      onClick: () => setActiveView("financial-overview"),
                    },
                    {
                      title: "Invoice Summary",
                      desc: "All invoices by status and client",
                      icon: FileText,
                      bg: "bg-[#ede9fe]",
                      color: "text-[#7c3aed]",
                      onClick: () => setShowAllInvoices(true),
                    },
                    {
                      title: "Client Report",
                      desc: "Active clients and billing history",
                      icon: Users,
                      bg: "bg-[#fff7ed]",
                      color: "text-[#ea580c]",
                      onClick: () => setShowCustomersListModal(true),
                    },
                    {
                      title: "Outstanding Debt",
                      desc: "Unpaid and overdue invoices",
                      icon: Wallet,
                      bg: "bg-[#fef2f2]",
                      color: "text-[#dc2626]",
                      onClick: () => setActiveView("payments"),
                    },
                  ].map(({ title, desc, icon: Icon, bg, color, onClick }) => (
                    <button
                      key={title}
                      onClick={onClick}
                      className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-sm hover:shadow-md transition-all text-left group"
                    >
                      <div
                        className={`w-10 h-10 ${bg} rounded-lg flex items-center justify-center mb-3`}
                      >
                        <Icon className={`w-5 h-5 ${color}`} />
                      </div>
                      <h3 className="text-sm font-semibold text-[#1e293b] mb-1 group-hover:text-[#7c3aed] transition-colors">
                        {title}
                      </h3>
                      <p className="text-xs text-[#64748b]">{desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeView === "invoice" && (
            <div className="flex-1 overflow-hidden flex min-h-0">
              <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 min-w-0">
                <div className="space-y-5">
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      {
                        label: "Total Amount",
                        value: `R${total.toFixed(2)}`,
                        icon: Receipt,
                        iconBg: "bg-[#ede9fe]",
                        iconColor: "text-[#7c3aed]",
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
                  <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
                    <div className="flex border-b border-[#e2e8f0] bg-[#f8fafc]">
                      <button
                        onClick={() => setInputMode("manual")}
                        className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all border-b-2 -mb-px ${inputMode === "manual" ? "border-[#7c3aed] text-[#7c3aed] bg-white" : "border-transparent text-[#64748b] hover:text-[#374151]"}`}
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
                        onClick={() => setShowAIWindow(true)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ml-auto mr-3 my-auto bg-gradient-to-r from-[#7c3aed] to-[#5b21b6] text-white shadow-md shadow-[#7c3aed]/30 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <Sparkles className="w-4 h-4" /> AI Mode
                      </button>
                    </div>
                    {inputMode === "manual" && (
                      <div className="p-6">
                        <LegalMultiStepForm
                          clientName={clientName}
                          setClientName={setClientName}
                          clientId={clientId}
                          setClientId={setClientId}
                          clientEmail={clientEmail}
                          setClientEmail={setClientEmail}
                          clientPhone={clientPhone}
                          setClientPhone={setClientPhone}
                          clientAddress={clientAddress}
                          setClientAddress={setClientAddress}
                          caseType={caseType}
                          setCaseType={setCaseType}
                          caseNumber={caseNumber}
                          setCaseNumber={setCaseNumber}
                          matterDescription={matterDescription}
                          setMatterDescription={setMatterDescription}
                          items={items}
                          newItem={newItem}
                          setNewItem={setNewItem}
                          handleAddItem={handleAddItem}
                        />
                      </div>
                    )}
                  </div>
                  <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
                    <div className="px-5 py-3.5 border-b border-[#e2e8f0] bg-[#f8fafc]">
                      <span className="text-sm font-semibold text-[#374151]">
                        Payment Terms
                      </span>
                    </div>
                    <div className="divide-y divide-[#f1f5f9]">
                      {[
                        ["Payment Method", "EFT / Bank Transfer"],
                        ["Payment Terms", "Due Within 30 Days"],
                        ["Late Payment", "Interest at Prime + 2%"],
                      ].map(([k, v]) => (
                        <div
                          key={k}
                          className="flex items-center justify-between px-5 py-3 text-sm"
                        >
                          <span className="text-[#64748b]">{k}</span>
                          <span className="font-semibold text-[#1e293b]">
                            {v}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
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
                    <button
                      onClick={handleSavePDF}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-[#7c3aed] text-white text-xs font-medium rounded-lg hover:bg-[#6d28d9] transition-colors"
                    >
                      <Download className="w-3 h-3" />
                      PDF
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
                      marginBottom: "calc((297mm * 0.44) - 297mm)",
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

export default LegalDashboard;
