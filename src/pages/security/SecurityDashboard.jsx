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
import TemplateSelector, { TemplateRenderer } from "./TemplateSelector";
import uploadLogoToR2 from "../../utils/uploadLogoToR2";
import { getAuth, signOut } from "firebase/auth";
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
// ─── PLACEHOLDER VIEWS ───────────────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════════════

// ─── Guards View ─────────────────────────────────────────────────────────────
const GuardsView = () => {
  const guards = [
    {
      id: "GRD-001",
      name: "James Mokoena",
      site: "Sandton City Mall",
      shift: "06:00–18:00",
      status: "On Duty",
      psira: "PSIRA-A12345",
      phone: "082 111 2233",
      rating: 4.8,
    },
    {
      id: "GRD-002",
      name: "Thabo Dlamini",
      site: "Hyde Park Office Park",
      shift: "18:00–06:00",
      status: "On Duty",
      psira: "PSIRA-B23456",
      phone: "083 222 3344",
      rating: 4.6,
    },
    {
      id: "GRD-003",
      name: "Sipho Nkosi",
      site: "Rosebank Tower",
      shift: "06:00–18:00",
      status: "Off Duty",
      psira: "PSIRA-C34567",
      phone: "084 333 4455",
      rating: 4.9,
    },
    {
      id: "GRD-004",
      name: "Lungelo Zulu",
      site: "Unassigned",
      shift: "—",
      status: "Leave",
      psira: "PSIRA-D45678",
      phone: "085 444 5566",
      rating: 4.3,
    },
    {
      id: "GRD-005",
      name: "Bongani Cele",
      site: "Menlyn Park",
      shift: "12:00–24:00",
      status: "On Duty",
      psira: "PSIRA-E56789",
      phone: "081 555 6677",
      rating: 4.7,
    },
  ];
  const [search, setSearch] = useState("");
  const filtered = guards.filter(
    (g) =>
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.site.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-6 py-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1e293b]">Security Guards</h1>
          <p className="text-sm text-[#64748b] mt-0.5">
            Manage your guard roster and assignments
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
          <Plus className="w-4 h-4" />
          Add Guard
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: "Total Guards",
            value: "24",
            icon: UserCheck,
            bg: "bg-[#eff6ff]",
            color: "text-[#2563eb]",
          },
          {
            label: "On Duty",
            value: "18",
            icon: CheckCircle,
            bg: "bg-[#f0fdf4]",
            color: "text-[#059669]",
          },
          {
            label: "Off Duty",
            value: "4",
            icon: Clock,
            bg: "bg-[#f8fafc]",
            color: "text-[#64748b]",
          },
          {
            label: "On Leave",
            value: "2",
            icon: Calendar,
            bg: "bg-[#fef9c3]",
            color: "text-[#ca8a04]",
          },
        ].map(({ label, value, icon: Icon, bg, color }) => (
          <div
            key={label}
            className="bg-white rounded-xl p-4 border border-[#e2e8f0] shadow-sm"
          >
            <div
              className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center mb-2`}
            >
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className="text-xl font-bold text-[#1e293b]">{value}</p>
            <p className="text-xs text-[#64748b]">{label}</p>
          </div>
        ))}
      </div>

      {/* Search & table */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-[#e2e8f0] bg-[#f8fafc]">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search guards…"
              className="w-full pl-9 pr-3 py-1.5 text-sm border border-[#e2e8f0] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
            />
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[#64748b] border border-[#e2e8f0] rounded-lg hover:bg-[#f1f5f9]">
            <Filter className="w-3.5 h-3.5" />
            Filter
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#e2e8f0]">
                {[
                  "Guard ID",
                  "Name",
                  "Assigned Site",
                  "Shift",
                  "PSIRA",
                  "Contact",
                  "Rating",
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
              {filtered.map((g) => (
                <tr
                  key={g.id}
                  className="border-b border-[#f1f5f9] hover:bg-[#f8fafc] transition-colors"
                >
                  <td className="px-4 py-3 text-xs font-mono text-[#64748b]">
                    {g.id}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-gradient-to-br from-[#2563eb] to-[#7c3aed] rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">
                          {g.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-[#1e293b]">
                        {g.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#374151]">{g.site}</td>
                  <td className="px-4 py-3 text-sm text-[#374151] whitespace-nowrap">
                    {g.shift}
                  </td>
                  <td className="px-4 py-3 text-xs text-[#64748b] font-mono">
                    {g.psira}
                  </td>
                  <td className="px-4 py-3 text-sm text-[#374151]">
                    {g.phone}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-[#f59e0b] fill-[#f59e0b]" />
                      <span className="text-sm font-semibold text-[#1e293b]">
                        {g.rating}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${g.status === "On Duty" ? "bg-[#dcfce7] text-[#166534]" : g.status === "Leave" ? "bg-[#fef3c7] text-[#92400e]" : "bg-[#f1f5f9] text-[#475569]"}`}
                    >
                      {g.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 text-[#64748b] hover:text-[#2563eb] hover:bg-[#eff6ff] rounded-lg transition-all">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1.5 text-[#64748b] hover:text-[#dc2626] hover:bg-[#fef2f2] rounded-lg transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ─── Clients View ─────────────────────────────────────────────────────────────
const ClientsView = () => {
  const clients = [
    {
      id: "CLT-001",
      name: "ABC Corporation",
      contact: "Sarah Johnson",
      email: "security@abccorp.co.za",
      phone: "011 234 5678",
      sites: 3,
      guards: 8,
      contract: "2024-01-01",
      value: "R 48 000/mo",
      status: "Active",
    },
    {
      id: "CLT-002",
      name: "Sandton Properties",
      contact: "Michael van der Berg",
      email: "ops@sandtonprop.co.za",
      phone: "011 345 6789",
      sites: 5,
      guards: 12,
      contract: "2023-06-15",
      value: "R 72 000/mo",
      status: "Active",
    },
    {
      id: "CLT-003",
      name: "Rosebank Holdings",
      contact: "Nomvula Khumalo",
      email: "admin@rosebankhold.co.za",
      phone: "011 456 7890",
      sites: 2,
      guards: 4,
      contract: "2024-03-01",
      value: "R 24 000/mo",
      status: "Active",
    },
    {
      id: "CLT-004",
      name: "Menlyn Retail Group",
      contact: "Pieter Botha",
      email: "facilities@menlyn.co.za",
      phone: "012 567 8901",
      sites: 1,
      guards: 6,
      contract: "2024-02-01",
      value: "R 36 000/mo",
      status: "Pending",
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-6 py-5 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1e293b]">Clients</h1>
          <p className="text-sm text-[#64748b] mt-0.5">
            Manage client contracts and relationships
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
          <Plus className="w-4 h-4" />
          Add Client
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: "Total Clients",
            value: "11",
            icon: Users,
            bg: "bg-[#eff6ff]",
            color: "text-[#2563eb]",
          },
          {
            label: "Active Contracts",
            value: "9",
            icon: CheckCircle,
            bg: "bg-[#f0fdf4]",
            color: "text-[#059669]",
          },
          {
            label: "Monthly Revenue",
            value: "R 312k",
            icon: DollarSign,
            bg: "bg-[#f0fdf4]",
            color: "text-[#059669]",
          },
          {
            label: "Sites Covered",
            value: "34",
            icon: Building,
            bg: "bg-[#faf5ff]",
            color: "text-[#7c3aed]",
          },
        ].map(({ label, value, icon: Icon, bg, color }) => (
          <div
            key={label}
            className="bg-white rounded-xl p-4 border border-[#e2e8f0] shadow-sm"
          >
            <div
              className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center mb-2`}
            >
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className="text-xl font-bold text-[#1e293b]">{value}</p>
            <p className="text-xs text-[#64748b]">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4">
        {clients.map((c) => (
          <div
            key={c.id}
            className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#2563eb] to-[#7c3aed] rounded-xl flex items-center justify-center flex-shrink-0">
                  <Building className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-[#1e293b]">
                      {c.name}
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${c.status === "Active" ? "bg-[#dcfce7] text-[#166534]" : "bg-[#fef3c7] text-[#92400e]"}`}
                    >
                      {c.status}
                    </span>
                  </div>
                  <p className="text-sm text-[#64748b]">
                    {c.contact} · {c.phone}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-[#059669]">{c.value}</p>
                <p className="text-xs text-[#94a3b8]">
                  Contract since {c.contract}
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-6 border-t border-[#f1f5f9] pt-3">
              <div className="flex items-center gap-1.5 text-sm text-[#64748b]">
                <Building className="w-4 h-4" />
                <span>{c.sites} Sites</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-[#64748b]">
                <UserCheck className="w-4 h-4" />
                <span>{c.guards} Guards</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-[#64748b]">
                <Mail className="w-4 h-4" />
                <span>{c.email}</span>
              </div>
              <div className="ml-auto flex gap-2">
                <button className="px-3 py-1.5 text-xs font-medium text-[#2563eb] border border-[#bfdbfe] bg-[#eff6ff] rounded-lg hover:bg-[#dbeafe] transition-colors">
                  View Details
                </button>
                <button className="px-3 py-1.5 text-xs font-medium text-white bg-[#2563eb] rounded-lg hover:bg-[#1d4ed8] transition-colors">
                  Manage
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Sites View ───────────────────────────────────────────────────────────────
const SitesView = () => {
  const sites = [
    {
      id: "SIT-001",
      name: "Sandton City Mall",
      client: "ABC Corporation",
      address: "Sandton City, Johannesburg, 2196",
      guards: 4,
      risk: "High",
      type: "Retail",
      incidents: 2,
      lastPatrol: "14 min ago",
    },
    {
      id: "SIT-002",
      name: "Hyde Park Office Park",
      client: "Sandton Properties",
      address: "Hyde Park, Johannesburg, 2196",
      guards: 2,
      risk: "Medium",
      type: "Commercial",
      incidents: 0,
      lastPatrol: "6 min ago",
    },
    {
      id: "SIT-003",
      name: "Rosebank Tower",
      client: "Rosebank Holdings",
      address: "Rosebank, Johannesburg, 2196",
      guards: 3,
      risk: "Low",
      type: "Commercial",
      incidents: 1,
      lastPatrol: "22 min ago",
    },
    {
      id: "SIT-004",
      name: "Menlyn Park",
      client: "Menlyn Retail Group",
      address: "Menlyn, Pretoria, 0181",
      guards: 6,
      risk: "High",
      type: "Retail",
      incidents: 0,
      lastPatrol: "9 min ago",
    },
    {
      id: "SIT-005",
      name: "Midrand Business Hub",
      client: "Sandton Properties",
      address: "Midrand, Johannesburg, 1685",
      guards: 2,
      risk: "Low",
      type: "Industrial",
      incidents: 0,
      lastPatrol: "31 min ago",
    },
  ];
  const riskColor = {
    High: "bg-[#fef2f2] text-[#dc2626]",
    Medium: "bg-[#fef3c7] text-[#d97706]",
    Low: "bg-[#dcfce7] text-[#166534]",
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-6 py-5 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1e293b]">Sites</h1>
          <p className="text-sm text-[#64748b] mt-0.5">
            All secured locations under your management
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
          <Plus className="w-4 h-4" />
          Add Site
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: "Total Sites",
            value: "34",
            icon: Building,
            bg: "bg-[#eff6ff]",
            color: "text-[#2563eb]",
          },
          {
            label: "High Risk",
            value: "8",
            icon: AlertTriangle,
            bg: "bg-[#fef2f2]",
            color: "text-[#dc2626]",
          },
          {
            label: "Patrols Today",
            value: "142",
            icon: Navigation,
            bg: "bg-[#f0fdf4]",
            color: "text-[#059669]",
          },
          {
            label: "Alerts Active",
            value: "3",
            icon: Bell,
            bg: "bg-[#fef3c7]",
            color: "text-[#d97706]",
          },
        ].map(({ label, value, icon: Icon, bg, color }) => (
          <div
            key={label}
            className="bg-white rounded-xl p-4 border border-[#e2e8f0] shadow-sm"
          >
            <div
              className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center mb-2`}
            >
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className="text-xl font-bold text-[#1e293b]">{value}</p>
            <p className="text-xs text-[#64748b]">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {sites.map((s) => (
          <div
            key={s.id}
            className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#f0f9ff] border border-[#bae6fd] rounded-xl flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-[#0284c7]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1e293b]">{s.name}</h3>
                  <p className="text-xs text-[#64748b]">{s.client}</p>
                </div>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-xs font-semibold ${riskColor[s.risk]}`}
              >
                {s.risk} Risk
              </span>
            </div>
            <p className="text-xs text-[#94a3b8] mb-3 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {s.address}
            </p>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="bg-[#f8fafc] rounded-lg p-2 text-center">
                <p className="text-sm font-bold text-[#1e293b]">{s.guards}</p>
                <p className="text-xs text-[#94a3b8]">Guards</p>
              </div>
              <div className="bg-[#f8fafc] rounded-lg p-2 text-center">
                <p className="text-sm font-bold text-[#1e293b]">
                  {s.incidents}
                </p>
                <p className="text-xs text-[#94a3b8]">Incidents</p>
              </div>
              <div className="bg-[#f8fafc] rounded-lg p-2 text-center">
                <p className="text-xs font-bold text-[#1e293b]">
                  {s.lastPatrol}
                </p>
                <p className="text-xs text-[#94a3b8]">Last Patrol</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 bg-[#f1f5f9] text-[#475569] rounded-full">
                {s.type}
              </span>
              <button className="ml-auto text-xs text-[#2563eb] font-medium hover:underline">
                View Site →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Patrol Routes View ───────────────────────────────────────────────────────
const PatrolRoutesView = () => {
  const routes = [
    {
      id: "RT-001",
      name: "Mall Perimeter Route",
      site: "Sandton City Mall",
      checkpoints: 8,
      duration: "45 min",
      frequency: "Every 2h",
      guard: "James Mokoena",
      lastRun: "13:00",
      status: "Active",
    },
    {
      id: "RT-002",
      name: "Office Block Alpha",
      site: "Hyde Park Office Park",
      checkpoints: 5,
      duration: "30 min",
      frequency: "Every 3h",
      guard: "Thabo Dlamini",
      lastRun: "12:30",
      status: "Active",
    },
    {
      id: "RT-003",
      name: "Basement & Parking",
      site: "Sandton City Mall",
      checkpoints: 12,
      duration: "60 min",
      frequency: "Every 1h",
      guard: "Bongani Cele",
      lastRun: "13:45",
      status: "Active",
    },
    {
      id: "RT-004",
      name: "Night Patrol Circuit",
      site: "Menlyn Park",
      checkpoints: 15,
      duration: "90 min",
      frequency: "Every 2h",
      guard: "Lungelo Zulu",
      lastRun: "06:00",
      status: "Inactive",
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-6 py-5 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1e293b]">Patrol Routes</h1>
          <p className="text-sm text-[#64748b] mt-0.5">
            Define and monitor guard patrol routes
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
          <Plus className="w-4 h-4" />
          New Route
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: "Active Routes",
            value: "18",
            icon: Navigation,
            bg: "bg-[#eff6ff]",
            color: "text-[#2563eb]",
          },
          {
            label: "Checkpoints",
            value: "142",
            icon: CheckCircle,
            bg: "bg-[#f0fdf4]",
            color: "text-[#059669]",
          },
          {
            label: "Patrols Today",
            value: "67",
            icon: Activity,
            bg: "bg-[#faf5ff]",
            color: "text-[#7c3aed]",
          },
          {
            label: "Avg Duration",
            value: "52 min",
            icon: Clock,
            bg: "bg-[#fff7ed]",
            color: "text-[#ea580c]",
          },
        ].map(({ label, value, icon: Icon, bg, color }) => (
          <div
            key={label}
            className="bg-white rounded-xl p-4 border border-[#e2e8f0] shadow-sm"
          >
            <div
              className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center mb-2`}
            >
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className="text-xl font-bold text-[#1e293b]">{value}</p>
            <p className="text-xs text-[#64748b]">{label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {routes.map((r) => (
          <div
            key={r.id}
            className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-[#0ea5e9] to-[#2563eb] rounded-xl flex items-center justify-center">
                  <Navigation className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-[#1e293b]">
                      {r.name}
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${r.status === "Active" ? "bg-[#dcfce7] text-[#166534]" : "bg-[#f1f5f9] text-[#475569]"}`}
                    >
                      {r.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#64748b]">{r.site}</p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-right">
                <div>
                  <p className="text-sm font-bold text-[#1e293b]">
                    {r.checkpoints}
                  </p>
                  <p className="text-xs text-[#94a3b8]">Checkpoints</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-[#1e293b]">
                    {r.duration}
                  </p>
                  <p className="text-xs text-[#94a3b8]">Duration</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-[#1e293b]">
                    {r.frequency}
                  </p>
                  <p className="text-xs text-[#94a3b8]">Frequency</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-[#1e293b]">
                    {r.lastRun}
                  </p>
                  <p className="text-xs text-[#94a3b8]">Last Run</p>
                </div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-[#f1f5f9] flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-[#64748b]">
                <UserCheck className="w-3.5 h-3.5" />
                <span>
                  Assigned to{" "}
                  <span className="font-semibold text-[#374151]">
                    {r.guard}
                  </span>
                </span>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1 text-xs font-medium text-[#2563eb] border border-[#bfdbfe] bg-[#eff6ff] rounded-lg hover:bg-[#dbeafe]">
                  Edit Route
                </button>
                <button className="px-3 py-1 text-xs font-medium text-white bg-[#059669] rounded-lg hover:bg-[#047857]">
                  View Map
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Schedules View ───────────────────────────────────────────────────────────
const SchedulesView = () => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const shifts = [
    {
      guard: "James Mokoena",
      days: [1, 1, 1, 1, 1, 0, 0],
      shift: "06:00–18:00",
      site: "Sandton City",
    },
    {
      guard: "Thabo Dlamini",
      days: [0, 0, 0, 0, 0, 1, 1],
      shift: "18:00–06:00",
      site: "Hyde Park",
    },
    {
      guard: "Sipho Nkosi",
      days: [1, 1, 1, 1, 1, 1, 0],
      shift: "06:00–18:00",
      site: "Rosebank Tower",
    },
    {
      guard: "Lungelo Zulu",
      days: [0, 1, 1, 1, 1, 1, 1],
      shift: "12:00–24:00",
      site: "Menlyn Park",
    },
    {
      guard: "Bongani Cele",
      days: [1, 0, 1, 0, 1, 0, 1],
      shift: "18:00–06:00",
      site: "Midrand Hub",
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-6 py-5 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1e293b]">Schedules</h1>
          <p className="text-sm text-[#64748b] mt-0.5">
            Weekly guard shift scheduling
          </p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-[#e2e8f0] text-[#374151] text-sm font-medium rounded-lg hover:bg-[#f8fafc] transition-colors">
            <Calendar className="w-4 h-4" />
            This Week
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
            <Plus className="w-4 h-4" />
            Create Schedule
          </button>
        </div>
      </div>

      <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                <th className="px-5 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wide min-w-[180px]">
                  Guard
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wide">
                  Site
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wide">
                  Shift
                </th>
                {days.map((d) => (
                  <th
                    key={d}
                    className="px-3 py-3 text-center text-xs font-semibold text-[#64748b] uppercase tracking-wide w-16"
                  >
                    {d}
                  </th>
                ))}
                <th className="px-3 py-3 text-center text-xs font-semibold text-[#64748b] uppercase tracking-wide">
                  Hrs
                </th>
              </tr>
            </thead>
            <tbody>
              {shifts.map((s, i) => (
                <tr
                  key={i}
                  className="border-b border-[#f1f5f9] hover:bg-[#f8fafc]"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-gradient-to-br from-[#2563eb] to-[#7c3aed] rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">
                          {s.guard
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-[#1e293b]">
                        {s.guard}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-sm text-[#374151]">{s.site}</td>
                  <td className="px-3 py-3 text-xs font-mono text-[#64748b] whitespace-nowrap">
                    {s.shift}
                  </td>
                  {s.days.map((on, di) => (
                    <td key={di} className="px-3 py-3 text-center">
                      <div
                        className={`w-7 h-7 rounded-lg mx-auto flex items-center justify-center ${on ? "bg-[#2563eb]" : "bg-[#f1f5f9]"}`}
                      >
                        {on ? (
                          <CheckCircle className="w-3.5 h-3.5 text-white" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#cbd5e1]" />
                        )}
                      </div>
                    </td>
                  ))}
                  <td className="px-3 py-3 text-center text-sm font-bold text-[#1e293b]">
                    {s.days.reduce((a, b) => a + b, 0) * 12}h
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Coverage summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Guards Scheduled", value: "22 / 24" },
          { label: "Total Hours This Week", value: "1,344" },
          { label: "Uncovered Shifts", value: "3" },
          { label: "Overtime Hours", value: "48" },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="bg-white rounded-xl p-4 border border-[#e2e8f0] shadow-sm text-center"
          >
            <p className="text-xl font-bold text-[#1e293b]">{value}</p>
            <p className="text-xs text-[#64748b] mt-0.5">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Invoices View ────────────────────────────────────────────────────────────
const InvoicesView = () => {
  const invoices = [
    {
      id: "INV-2024-0142",
      client: "ABC Corporation",
      amount: "R 48 000.00",
      date: "2024-05-01",
      due: "2024-05-30",
      status: "Paid",
    },
    {
      id: "INV-2024-0141",
      client: "Sandton Properties",
      amount: "R 72 000.00",
      date: "2024-05-01",
      due: "2024-05-30",
      status: "Outstanding",
    },
    {
      id: "INV-2024-0140",
      client: "Rosebank Holdings",
      amount: "R 24 000.00",
      date: "2024-04-01",
      due: "2024-04-30",
      status: "Paid",
    },
    {
      id: "INV-2024-0139",
      client: "Menlyn Retail Group",
      amount: "R 36 000.00",
      date: "2024-04-01",
      due: "2024-04-30",
      status: "Overdue",
    },
    {
      id: "INV-2024-0138",
      client: "ABC Corporation",
      amount: "R 48 000.00",
      date: "2024-03-01",
      due: "2024-03-30",
      status: "Paid",
    },
  ];
  const statusStyle = {
    Paid: "bg-[#dcfce7] text-[#166534]",
    Outstanding: "bg-[#eff6ff] text-[#1d4ed8]",
    Overdue: "bg-[#fef2f2] text-[#dc2626]",
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-6 py-5 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1e293b]">Invoices</h1>
          <p className="text-sm text-[#64748b] mt-0.5">
            Billing and payment management
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
          <Plus className="w-4 h-4" />
          Create Invoice
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: "Total Invoiced",
            value: "R 312k",
            icon: Receipt,
            bg: "bg-[#eff6ff]",
            color: "text-[#2563eb]",
          },
          {
            label: "Paid This Month",
            value: "R 192k",
            icon: CheckCircle,
            bg: "bg-[#f0fdf4]",
            color: "text-[#059669]",
          },
          {
            label: "Outstanding",
            value: "R 72k",
            icon: Clock,
            bg: "bg-[#eff6ff]",
            color: "text-[#2563eb]",
          },
          {
            label: "Overdue",
            value: "R 36k",
            icon: AlertTriangle,
            bg: "bg-[#fef2f2]",
            color: "text-[#dc2626]",
          },
        ].map(({ label, value, icon: Icon, bg, color }) => (
          <div
            key={label}
            className="bg-white rounded-xl p-4 border border-[#e2e8f0] shadow-sm"
          >
            <div
              className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center mb-2`}
            >
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className="text-xl font-bold text-[#1e293b]">{value}</p>
            <p className="text-xs text-[#64748b]">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#e2e8f0] bg-[#f8fafc]">
          <h3 className="text-sm font-semibold text-[#1e293b]">
            Recent Invoices
          </h3>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#e2e8f0]">
              {[
                "Invoice #",
                "Client",
                "Amount",
                "Date",
                "Due Date",
                "Status",
                "",
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
            {invoices.map((inv) => (
              <tr
                key={inv.id}
                className="border-b border-[#f1f5f9] hover:bg-[#f8fafc] transition-colors"
              >
                <td className="px-4 py-3 text-sm font-semibold text-[#2563eb]">
                  {inv.id}
                </td>
                <td className="px-4 py-3 text-sm text-[#374151]">
                  {inv.client}
                </td>
                <td className="px-4 py-3 text-sm font-bold text-[#1e293b]">
                  {inv.amount}
                </td>
                <td className="px-4 py-3 text-sm text-[#64748b]">{inv.date}</td>
                <td className="px-4 py-3 text-sm text-[#64748b]">{inv.due}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-semibold ${statusStyle[inv.status]}`}
                  >
                    {inv.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button className="p-1.5 text-[#64748b] hover:text-[#2563eb] hover:bg-[#eff6ff] rounded-lg">
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1.5 text-[#64748b] hover:text-[#059669] hover:bg-[#f0fdf4] rounded-lg">
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── Reports View ─────────────────────────────────────────────────────────────
const ReportsView = () => {
  const reports = [
    {
      title: "Monthly Activity Report",
      desc: "May 2024 — All Sites",
      date: "2024-05-31",
      type: "Activity",
      size: "1.2 MB",
    },
    {
      title: "Guard Performance Report",
      desc: "Q2 2024",
      date: "2024-06-01",
      type: "Performance",
      size: "840 KB",
    },
    {
      title: "Incident Summary Report",
      desc: "April 2024",
      date: "2024-04-30",
      type: "Incident",
      size: "620 KB",
    },
    {
      title: "Site Risk Assessment",
      desc: "Sandton City Mall",
      date: "2024-05-15",
      type: "Risk",
      size: "3.4 MB",
    },
  ];
  const typeColor = {
    Activity: "bg-[#eff6ff] text-[#2563eb]",
    Performance: "bg-[#f0fdf4] text-[#059669]",
    Incident: "bg-[#fef2f2] text-[#dc2626]",
    Risk: "bg-[#fef3c7] text-[#d97706]",
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-6 py-5 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1e293b]">Reports</h1>
          <p className="text-sm text-[#64748b] mt-0.5">
            Activity, guard performance & incident reports
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
          <Plus className="w-4 h-4" />
          Generate Report
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: "Reports This Month",
            value: "28",
            icon: FileBarChart,
            bg: "bg-[#eff6ff]",
            color: "text-[#2563eb]",
          },
          {
            label: "Activity Reports",
            value: "14",
            icon: Activity,
            bg: "bg-[#f0fdf4]",
            color: "text-[#059669]",
          },
          {
            label: "Guard Reports",
            value: "8",
            icon: UserCheck,
            bg: "bg-[#faf5ff]",
            color: "text-[#7c3aed]",
          },
          {
            label: "Incident Reports",
            value: "6",
            icon: AlertTriangle,
            bg: "bg-[#fef2f2]",
            color: "text-[#dc2626]",
          },
        ].map(({ label, value, icon: Icon, bg, color }) => (
          <div
            key={label}
            className="bg-white rounded-xl p-4 border border-[#e2e8f0] shadow-sm"
          >
            <div
              className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center mb-2`}
            >
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className="text-xl font-bold text-[#1e293b]">{value}</p>
            <p className="text-xs text-[#64748b]">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-3">
        {reports.map((r, i) => (
          <div
            key={i}
            className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl flex items-center justify-center">
                <FileBarChart className="w-5 h-5 text-[#64748b]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#1e293b]">{r.title}</h3>
                <p className="text-xs text-[#64748b]">
                  {r.desc} · {r.size}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span
                className={`px-2 py-0.5 rounded text-xs font-semibold ${typeColor[r.type]}`}
              >
                {r.type}
              </span>
              <span className="text-xs text-[#94a3b8]">{r.date}</span>
              <div className="flex gap-1.5">
                <button className="p-1.5 text-[#64748b] hover:text-[#2563eb] hover:bg-[#eff6ff] rounded-lg transition-all">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="p-1.5 text-[#64748b] hover:text-[#059669] hover:bg-[#f0fdf4] rounded-lg transition-all">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Shift Calendar View ──────────────────────────────────────────────────────
const ShiftCalendarView = () => {
  const hours = [
    "06:00",
    "08:00",
    "10:00",
    "12:00",
    "14:00",
    "16:00",
    "18:00",
    "20:00",
    "22:00",
    "00:00",
  ];
  const days = [
    "Mon 27",
    "Tue 28",
    "Wed 29",
    "Thu 30",
    "Fri 31",
    "Sat 1",
    "Sun 2",
  ];
  const shifts = [
    {
      guard: "James M.",
      day: 0,
      start: 0,
      span: 3,
      color: "bg-[#dbeafe] border-[#93c5fd] text-[#1d4ed8]",
    },
    {
      guard: "Thabo D.",
      day: 1,
      start: 3,
      span: 3,
      color: "bg-[#dcfce7] border-[#86efac] text-[#166534]",
    },
    {
      guard: "Sipho N.",
      day: 0,
      start: 5,
      span: 3,
      color: "bg-[#f3e8ff] border-[#c4b5fd] text-[#6d28d9]",
    },
    {
      guard: "Bongani C.",
      day: 2,
      start: 1,
      span: 4,
      color: "bg-[#fef3c7] border-[#fcd34d] text-[#92400e]",
    },
    {
      guard: "Lungelo Z.",
      day: 3,
      start: 4,
      span: 3,
      color: "bg-[#fee2e2] border-[#fca5a5] text-[#991b1b]",
    },
    {
      guard: "James M.",
      day: 4,
      start: 0,
      span: 3,
      color: "bg-[#dbeafe] border-[#93c5fd] text-[#1d4ed8]",
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-6 py-5 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1e293b]">Shift Calendar</h1>
          <p className="text-sm text-[#64748b] mt-0.5">
            Week of 27 May – 2 June 2024
          </p>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-2 border border-[#e2e8f0] text-[#374151] text-sm rounded-lg hover:bg-[#f8fafc]">
            ← Prev
          </button>
          <button className="px-3 py-2 bg-[#2563eb] text-white text-sm rounded-lg hover:bg-[#1d4ed8]">
            Today
          </button>
          <button className="px-3 py-2 border border-[#e2e8f0] text-[#374151] text-sm rounded-lg hover:bg-[#f8fafc]">
            Next →
          </button>
        </div>
      </div>

      <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748b] w-20">
                  Time
                </th>
                {days.map((d) => (
                  <th
                    key={d}
                    className="px-3 py-3 text-center text-xs font-semibold text-[#64748b] uppercase"
                  >
                    {d}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {hours.map((h, hi) => (
                <tr key={h} className="border-b border-[#f1f5f9]">
                  <td className="px-4 py-3 text-xs text-[#94a3b8] font-mono whitespace-nowrap">
                    {h}
                  </td>
                  {days.map((d, di) => {
                    const shift = shifts.find(
                      (s) => s.day === di && s.start === hi,
                    );
                    return (
                      <td key={di} className="px-1 py-1 relative h-10">
                        {shift && (
                          <div
                            className={`absolute inset-x-1 rounded-lg border px-2 py-1 text-xs font-semibold cursor-pointer hover:opacity-80 transition-opacity ${shift.color}`}
                            style={{
                              height: `${shift.span * 40}px`,
                              zIndex: 10,
                            }}
                          >
                            {shift.guard}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ─── Analytics View ───────────────────────────────────────────────────────────
const AnalyticsView = () => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const incidents = [12, 8, 15, 6, 9, 4];
  const maxInc = Math.max(...incidents);

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-6 py-5 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1e293b]">Analytics</h1>
          <p className="text-sm text-[#64748b] mt-0.5">
            Performance metrics and trends
          </p>
        </div>
        <select className="px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg text-[#374151] bg-white focus:outline-none focus:ring-2 focus:ring-[#2563eb]">
          <option>Last 6 Months</option>
          <option>Last 12 Months</option>
          <option>This Year</option>
        </select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: "Response Time",
            value: "4.2 min",
            sub: "Avg. incident response",
            icon: Zap,
            bg: "bg-[#fff7ed]",
            color: "text-[#ea580c]",
            trend: -12,
          },
          {
            label: "Patrol Compliance",
            value: "96.4%",
            sub: "Routes completed on time",
            icon: CheckCircle,
            bg: "bg-[#f0fdf4]",
            color: "text-[#059669]",
            trend: 3,
          },
          {
            label: "Guard Attendance",
            value: "98.1%",
            sub: "Present for shifts",
            icon: UserCheck,
            bg: "bg-[#eff6ff]",
            color: "text-[#2563eb]",
            trend: 1,
          },
          {
            label: "Client Satisfaction",
            value: "4.7 / 5",
            sub: "Average rating",
            icon: Star,
            bg: "bg-[#fef9c3]",
            color: "text-[#ca8a04]",
            trend: -5,
          },
        ].map(({ label, value, sub, icon: Icon, bg, color, trend }) => (
          <div
            key={label}
            className="bg-white rounded-xl p-4 border border-[#e2e8f0] shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <div
                className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center`}
              >
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <span
                className={`text-xs font-semibold flex items-center gap-0.5 ${trend < 0 ? "text-[#059669]" : "text-[#dc2626]"}`}
              >
                {trend < 0 ? (
                  <TrendingDown className="w-3 h-3" />
                ) : (
                  <TrendingUp className="w-3 h-3" />
                )}
                {Math.abs(trend)}%
              </span>
            </div>
            <p className="text-xl font-bold text-[#1e293b]">{value}</p>
            <p className="text-xs text-[#64748b]">{label}</p>
            <p className="text-xs text-[#94a3b8] mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Incident trend chart */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-[#1e293b] mb-4">
          Incident Trend (2024)
        </h3>
        <div className="flex items-end gap-3 h-40">
          {incidents.map((v, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
              <span className="text-xs font-bold text-[#374151]">{v}</span>
              <div
                className="w-full rounded-t-lg bg-gradient-to-t from-[#2563eb] to-[#60a5fa] transition-all duration-500"
                style={{ height: `${(v / maxInc) * 120}px` }}
              />
              <span className="text-xs text-[#94a3b8]">{months[i]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Incident breakdown */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-[#1e293b] mb-4">
            Incidents by Type
          </h3>
          <div className="space-y-3">
            {[
              {
                type: "Theft / Attempted Theft",
                count: 14,
                pct: 37,
                color: "bg-[#dc2626]",
              },
              {
                type: "Trespassing",
                count: 10,
                pct: 26,
                color: "bg-[#d97706]",
              },
              { type: "Vandalism", count: 8, pct: 21, color: "bg-[#7c3aed]" },
              {
                type: "Suspicious Activity",
                count: 6,
                pct: 16,
                color: "bg-[#0284c7]",
              },
            ].map(({ type, count, pct, color }) => (
              <div key={type}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-[#374151]">{type}</span>
                  <span className="text-xs font-semibold text-[#1e293b]">
                    {count} ({pct}%)
                  </span>
                </div>
                <div className="w-full bg-[#f1f5f9] rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${color} transition-all`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-[#1e293b] mb-4">
            Top Performing Guards
          </h3>
          <div className="space-y-3">
            {[
              { name: "James Mokoena", score: 98, patrols: 142, incidents: 0 },
              { name: "Sipho Nkosi", score: 96, patrols: 138, incidents: 1 },
              { name: "Bongani Cele", score: 94, patrols: 129, incidents: 0 },
              { name: "Thabo Dlamini", score: 91, patrols: 121, incidents: 2 },
            ].map(({ name, score, patrols, incidents }, i) => (
              <div key={name} className="flex items-center gap-3">
                <span className="text-xs font-bold text-[#94a3b8] w-4">
                  {i + 1}
                </span>
                <div className="w-8 h-8 bg-gradient-to-br from-[#2563eb] to-[#7c3aed] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">
                    {name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1e293b] truncate">
                    {name}
                  </p>
                  <p className="text-xs text-[#94a3b8]">
                    {patrols} patrols · {incidents} incidents
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-[#059669]">{score}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Business Overview View ───────────────────────────────────────────────────
const BusinessOverviewView = () => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const revenue = [210000, 228000, 252000, 240000, 312000, 295000];
  const maxRev = Math.max(...revenue);

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-6 py-5 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1e293b]">
            Business Overview
          </h1>
          <p className="text-sm text-[#64748b] mt-0.5">
            Financial performance and business metrics
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-[#e2e8f0] text-[#374151] text-sm rounded-lg hover:bg-[#f8fafc]">
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: "Monthly Revenue",
            value: "R 312 000",
            icon: DollarSign,
            bg: "bg-[#f0fdf4]",
            color: "text-[#059669]",
            trend: -5,
          },
          {
            label: "Active Contracts",
            value: "9",
            icon: FileText,
            bg: "bg-[#eff6ff]",
            color: "text-[#2563eb]",
            trend: 12,
          },
          {
            label: "Guards Deployed",
            value: "22",
            icon: UserCheck,
            bg: "bg-[#faf5ff]",
            color: "text-[#7c3aed]",
            trend: 8,
          },
          {
            label: "Sites Secured",
            value: "34",
            icon: Building,
            bg: "bg-[#fff7ed]",
            color: "text-[#ea580c]",
            trend: 18,
          },
        ].map(({ label, value, icon: Icon, bg, color, trend }) => (
          <div
            key={label}
            className="bg-white rounded-xl p-4 border border-[#e2e8f0] shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <div
                className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center`}
              >
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <span
                className={`text-xs font-semibold flex items-center gap-0.5 ${trend > 0 ? "text-[#059669]" : "text-[#dc2626]"}`}
              >
                <TrendingUp className="w-3 h-3" />
                {trend}%
              </span>
            </div>
            <p className="text-lg font-bold text-[#1e293b]">{value}</p>
            <p className="text-xs text-[#64748b]">{label}</p>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-semibold text-[#1e293b]">
            Monthly Revenue (2024)
          </h3>
          <span className="text-xs text-[#64748b]">
            YTD: <span className="font-bold text-[#059669]">R 1 537 000</span>
          </span>
        </div>
        <div className="flex items-end gap-4 h-48">
          {revenue.map((v, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
              <span className="text-xs font-bold text-[#374151]">
                R{(v / 1000).toFixed(0)}k
              </span>
              <div
                className="w-full rounded-t-lg bg-gradient-to-t from-[#059669] to-[#34d399]"
                style={{ height: `${(v / maxRev) * 160}px` }}
              />
              <span className="text-xs text-[#94a3b8]">{months[i]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Two-column metrics */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-[#1e293b] mb-4">
            Revenue by Client
          </h3>
          <div className="space-y-3">
            {[
              { client: "Sandton Properties", value: "R 72 000", pct: 60 },
              { client: "ABC Corporation", value: "R 48 000", pct: 40 },
              { client: "Rosebank Holdings", value: "R 24 000", pct: 20 },
              { client: "Menlyn Retail Group", value: "R 36 000", pct: 30 },
            ].map(({ client, value, pct }) => (
              <div key={client}>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-[#374151] truncate">
                    {client}
                  </span>
                  <span className="text-xs font-semibold text-[#1e293b] ml-2 whitespace-nowrap">
                    {value}
                  </span>
                </div>
                <div className="w-full bg-[#f1f5f9] rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full bg-gradient-to-r from-[#2563eb] to-[#7c3aed]"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-[#1e293b] mb-4">
            Key Business Metrics
          </h3>
          <div className="space-y-3">
            {[
              { label: "Contract Renewal Rate", value: "94%" },
              { label: "Average Contract Value", value: "R 45 000/mo" },
              { label: "Outstanding Invoices", value: "R 108 000" },
              { label: "Operating Costs (Est.)", value: "R 198 000/mo" },
              { label: "Net Margin (Est.)", value: "36.5%" },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="flex justify-between items-center py-2 border-b border-[#f1f5f9]"
              >
                <span className="text-sm text-[#64748b]">{label}</span>
                <span className="text-sm font-bold text-[#1e293b]">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

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
  const [selectedTemplate, setSelectedTemplate] = useState("professional");
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
  };

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
                  setActiveView("invoice");
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
                onClick: () => {},
                bg: "bg-[#eff6ff]",
                hover: "hover:bg-[#dbeafe]",
                border: "border-[#bfdbfe]",
                iconBg: "bg-[#2563eb]",
                text: "text-[#1e40af]",
              },
              {
                label: "Sites",
                icon: Building,
                onClick: () => {},
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
                  setActiveView("invoice");
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
          industry="security"
          TemplateRenderer={TemplateRenderer}
        />
      )}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* ── Sidebar backdrop (mobile) ─────────────────────────────────── */}
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
                onClick: () => setActiveView("home"),
                title: "Home",
                color: "text-[#38bdf8]",
              },
              {
                icon: Settings,
                onClick: () => setShowSettings(true),
                title: "Settings",
                color: "text-[#64748b]",
              },
              {
                icon: TrendingUp,
                onClick: () => {},
                title: "Overview",
                color: "text-[#64748b]",
              },
              {
                icon: AlertTriangle,
                onClick: () => {
                  handleNewIncident();
                  setActiveView("invoice");
                },
                title: "Incident Reports",
                color: "text-[#64748b]",
              },
              {
                icon: UserCheck,
                onClick: () => setActiveView('guards'),
                title: "Security Guards",
                color: "text-[#64748b]",
              },
              {
                icon: Users,
                onClick: () => setActiveView('clients'),
                title: "Clients",
                color: "text-[#64748b]",
              },
              {
                icon: Building,
                onClick: () => setActiveView('sites'),
                title: "Sites",
                color: "text-[#64748b]",
              },
              {
                icon: MapPin,
                onClick: () => setActiveView('patrols'),
                title: "Patrol Routes",
                color: "text-[#64748b]",
              },
              {
                icon: Clock,
                onClick: () => {},
                title: "Schedules",
                color: "text-[#64748b]",
              },
              {
                icon: Receipt,
                onClick: () => setActiveView('invoices'),
                title: "Invoices",
                color: "text-[#64748b]",
              },
              {
                icon: FileBarChart,
                onClick: () => setActiveView('reports'),
                title: "Reports",
                color: "text-[#64748b]",
              },
              {
                icon: Calendar,
                onClick: () => setActiveView('calendar'),
                title: "Shift Calendar",
                color: "text-[#64748b]",
              },
            ].map(({ icon: Icon, onClick, title, color }) => (
              <button
                key={title}
                onClick={onClick}
                title={title}
                className={`group p-2 ${color} hover:text-white hover:bg-[#1e293b] rounded-lg transition-all w-10 h-10 flex items-center justify-center`}
              >
                <Icon className="w-5 h-5" />
              </button>
            ))}
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
            <div
              onClick={() => {
                setActiveView("home");
                setSidebarOpen(false);
              }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all text-sm font-medium ${activeView === "home" ? "bg-[#1e3a5f] text-[#38bdf8]" : "text-[#94a3b8] hover:text-white hover:bg-[#1e293b]"}`}
            >
              <Home className="w-4 h-4 flex-shrink-0" />
              Home
            </div>
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
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-sm font-medium text-[#94a3b8] hover:text-white hover:bg-[#1e293b]">
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
                        setActiveView("invoice");
                        if (isMobile) setSidebarOpen(false);
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

              {/* Static nav items */}
              {[
                { label: "Security Guards", icon: UserCheck, onClick: () => setActiveView('guards') },
                { label: "Clients", icon: Users, onClick: () => setActiveView('clients') },
                { label: "Sites", icon: Building, onClick: () => setActiveView('sites') },
                { label: "Patrol Routes", icon: MapPin, onClick: () => setActiveView('patrols') },
              ].map(({ label, icon: Icon, onClick }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#94a3b8] hover:text-white hover:bg-[#1e293b] transition-all cursor-default opacity-60"
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {label}
                </div>
              ))}

              {/* Schedules dropdown */}
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
              </div>

              {/* Invoices dropdown */}
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
              </div>

              <div
                onClick={() => {
                  setActiveView("templates");
                  setSidebarOpen(false);
                }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-sm font-medium text-[#94a3b8] hover:text-white hover:bg-[#1e293b] transition-all"
              >
                <FileText className="w-4 h-4 flex-shrink-0" />
                Invoice Templates
              </div>

              {[
                { label: "Reports", icon: FileBarChart, onClick: () => setActiveView('reports') },
                { label: "Shift Calendar", icon: Calendar, onClick: () => setActiveView('calendar') },
                { label: "Analytics", icon: BarChart3, onClick: () => setActiveView('analytics') },
              ].map(({ label, icon: Icon, onClick }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#94a3b8] hover:text-white hover:bg-[#1e293b] transition-all cursor-default opacity-60"
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {label}
                </div>
              ))}
            </div>
          </nav>

          {/* Sidebar footer */}
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

          {/* ── Modals ──────────────────────────────────────────────────── */}
          {showSettings && (
            <BusinessSettingsModal onClose={() => setShowSettings(false)} />
          )}

          {/* ── Incidents list modal ───────────────────────────────────── */}
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
                              {incident.incidentDate || "N/A"}{" "}
                              {incident.incidentTime
                                ? `@ ${incident.incidentTime}`
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

          {/* ── Preview modal ─────────────────────────────────────────────── */}
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
                    style={{ width: "210mm", minHeight: "297mm" }}
                  >
                    <TemplateRenderer {...templateProps} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Views ───────────────────────────────────────────────────── */}
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

          {/* ── Incident report builder ──────────────────────────────────── */}
          {activeView === "invoice" && (
            <div className="flex-1 overflow-hidden flex min-h-0">
              {/* ── LEFT: Form panel ───────────────────────────────────── */}
              <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 min-w-0">
                <div className="space-y-5">
                  {/* Status banner */}
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

                  {/* Summary cards */}
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

                  {/* Main form */}
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

                  {/* Save button */}
                  <button
                    onClick={handleSaveIncident}
                    className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-xl font-medium transition-colors shadow-sm"
                  >
                    <Save className="w-4 h-4" />
                    Save Incident Report
                  </button>
                </div>
              </div>

              {/* ── RIGHT: Live preview panel (xl only) ──────────────────── */}
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

export default SecurityDashboard;
