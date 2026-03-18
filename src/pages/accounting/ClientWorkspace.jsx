import React, { useState, useEffect, useCallback } from "react";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  getDocs,
} from "firebase/firestore";
import {
  Users,
  Search,
  ChevronRight,
  X,
  Scale,
  BookOpen,
  Landmark,
  BarChart3,
  DollarSign,
  ArrowLeft,
  Building2,
  Mail,
  Package,
  Phone,
  MapPin,
} from "lucide-react";
import ChartOfAccounts from "./ChartOfAccounts";
import BankingView from "./BankingView";
import ReportsView from "./ReportsView";
import PayrollView from "./PayrollView";
import FixedAssetRegister from "./FixedAssetRegister";
import TrialBalance from "./TrialBalance";
import JournalEntries from "./JournalEntries";
// ── Tab definitions ───────────────────────────────────────────────────────────
const WORKSPACE_TABS = [
  { id: "chart-of-accounts", label: "Chart of Accounts", icon: BookOpen },
  { id: "banking", label: "Banking", icon: Landmark },
  { id: "reports", label: "Reports", icon: BarChart3 },
  { id: "payroll", label: "Payroll", icon: DollarSign },
  { id: "fixed-assets", label: "Fixed Assets", icon: Package },
  { id: "trial-balance", label: "Trial Balance", icon: Scale },
   { id: "journals", label: "Journal Entries", icon: BookOpen }
];

// Map sidebar activeView values → workspace tab + sub-tab
const VIEW_TO_TAB = {
  "chart-of-accounts": { tab: "chart-of-accounts" },
  "bank-accounts": { tab: "banking", sub: "bank-accounts" },
  transactions: { tab: "banking", sub: "transactions" },
  reconciliation: { tab: "banking", sub: "reconciliation" },
  "report-pnl": { tab: "reports", sub: "report-pnl" },
  "report-balance": { tab: "reports", sub: "report-balance" },
  "report-cashflow": { tab: "reports", sub: "report-cashflow" },
  "report-tax": { tab: "reports", sub: "report-tax" },
  payroll: { tab: "payroll" },
};

// ── Initials helper ───────────────────────────────────────────────────────────
const initials = (name = "") =>
  name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

const AVATAR_COLORS = [
  "bg-[#2563eb]",
  "bg-[#059669]",
  "bg-[#7c3aed]",
  "bg-[#ea580c]",
  "bg-[#0891b2]",
  "bg-[#d97706]",
  "bg-[#dc2626]",
  "bg-[#0d9488]",
];
const avatarColor = (name = "") =>
  AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

// ══════════════════════════════════════════════════════════════════════════════
// MAIN EXPORT
// ══════════════════════════════════════════════════════════════════════════════
export default function ClientWorkspace({
  user,
  defaultView = "chart-of-accounts",
}) {
  const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [selectedClient, setSelectedClient] = useState(null);
  const [search, setSearch] = useState("");

  // Resolve initial tab from the sidebar view that launched us
  const resolved = VIEW_TO_TAB[defaultView] || { tab: "chart-of-accounts" };
  const [activeTab, setActiveTab] = useState(resolved.tab);
  const [activeSub, setActiveSub] = useState(resolved.sub || null);

  // When the parent changes defaultView (user clicks a different sidebar item),
  // update our active tab even if a client is already selected.
  useEffect(() => {
    const r = VIEW_TO_TAB[defaultView] || { tab: "chart-of-accounts" };
    setActiveTab(r.tab);
    setActiveSub(r.sub || null);
  }, [defaultView]);

  const db = getFirestore();

  // ── Load clients ────────────────────────────────────────────────────────────
  const loadClients = useCallback(async () => {
    if (!user?.uid) return;
    setLoadingClients(true);
    try {
      const q = query(
        collection(db, "users", user.uid, "clients"),
        orderBy("createdAt", "desc"),
      );
      const snap = await getDocs(q);
      setClients(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } finally {
      setLoadingClients(false);
    }
  }, [user, db]);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  // ── Filter ──────────────────────────────────────────────────────────────────
  const filtered = clients.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.address?.toLowerCase().includes(q)
    );
  });

  // ── If no client selected → show picker ─────────────────────────────────────
  if (!selectedClient) {
    return (
      <div className="flex-1 overflow-y-auto">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white border-b border-[#e2e8f0] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#eff6ff] rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-[#2563eb]" />
            </div>
            <div>
              <h1 className="text-base font-bold text-[#1e293b]">
                Select a Client
              </h1>
              <p className="text-xs text-[#64748b]">
                Choose a client to view their{" "}
                {WORKSPACE_TABS.find((t) => t.id === resolved.tab)?.label}
              </p>
            </div>
          </div>
          <span className="text-xs text-[#94a3b8] bg-[#f1f5f9] px-2.5 py-1 rounded-full">
            {clients.length} client{clients.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-6 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search clients by name, email or address…"
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-[#e2e8f0] rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
            />
          </div>

          {/* Client grid */}
          {loadingClients ? (
            <div className="text-center py-16 text-[#94a3b8] text-sm">
              Loading clients…
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-14 h-14 bg-[#f1f5f9] rounded-2xl flex items-center justify-center mb-4">
                <Users className="w-7 h-7 text-[#cbd5e1]" />
              </div>
              <p className="text-sm font-medium text-[#94a3b8]">
                No clients found
              </p>
              <p className="text-xs text-[#cbd5e1] mt-1">
                Add clients using the Customers section, then come back here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((client) => (
                <ClientCard
                  key={client.id}
                  client={client}
                  onSelect={() => {
                    setSearch("");
                    setSelectedClient(client);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Client selected → show workspace ────────────────────────────────────────
  return (
    <div className="flex-1 overflow-hidden flex flex-col min-h-0">
      {/* Client context bar */}
      <div className="flex-shrink-0 bg-white border-b border-[#e2e8f0] px-5 py-3 flex items-center gap-3">
        <button
          onClick={() => setSelectedClient(null)}
          className="p-1.5 text-[#64748b] hover:text-[#1e293b] hover:bg-[#f1f5f9] rounded-lg transition-all flex-shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        {/* Avatar */}
        <div
          className={`w-8 h-8 ${avatarColor(selectedClient.name)} rounded-full flex items-center justify-center flex-shrink-0`}
        >
          <span className="text-xs font-bold text-white">
            {initials(selectedClient.name)}
          </span>
        </div>

        {/* Client info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#1e293b] truncate">
            {selectedClient.name}
          </p>
          <p className="text-xs text-[#64748b] truncate">
            {selectedClient.email || selectedClient.address || "—"}
          </p>
        </div>

        {/* Change client button */}
        <button
          onClick={() => setSelectedClient(null)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#64748b] border border-[#e2e8f0] rounded-lg hover:bg-[#f8fafc] transition-colors flex-shrink-0"
        >
          <Users className="w-3.5 h-3.5" />
          Change Client
        </button>
      </div>

      {/* Workspace tab bar */}
      <div className="flex-shrink-0 bg-white border-b border-[#e2e8f0] px-5">
        <div className="flex gap-0">
          {WORKSPACE_TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => {
                setActiveTab(id);
                setActiveSub(null);
              }}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all -mb-px ${
                activeTab === id
                  ? "border-[#2563eb] text-[#2563eb]"
                  : "border-transparent text-[#64748b] hover:text-[#374151]"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        {activeTab === "chart-of-accounts" && (
          <div className="flex-1 overflow-y-auto p-6">
            <ChartOfAccounts
              user={user}
              clientId={selectedClient.id}
              clientName={selectedClient.name}
            />
          </div>
        )}

        {activeTab === "banking" && (
          <BankingView
            user={user}
            clientId={selectedClient.id}
            clientName={selectedClient.name}
            defaultTab={activeSub || "bank-accounts"}
          />
        )}

        {activeTab === "reports" && (
          <ReportsView
            user={user}
            clientId={selectedClient.id}
            clientName={selectedClient.name}
            defaultTab={activeSub || "report-pnl"}
          />
        )}

        {activeTab === "payroll" && (
          <PayrollView
            user={user}
            clientId={selectedClient.id}
            clientName={selectedClient.name}
          />
        )}
        {activeTab === "fixed-assets" && (
          <div className="flex-1 overflow-y-auto p-6">
            <FixedAssetRegister
              user={user}
              clientId={selectedClient.id}
              clientName={selectedClient.name}
            />
          </div>
        )}
        {activeTab === "trial-balance" && (
  <div className="flex-1 overflow-y-auto p-6">
    <TrialBalance
      user={user}
      clientId={selectedClient.id}
      clientName={selectedClient.name}
    />
  </div>
)}          
        {activeTab === "journals" && (
  <div className="flex-1 overflow-hidden flex flex-col min-h-0">
    <JournalEntries
      user={user}
      clientId={selectedClient.id}
      clientName={selectedClient.name}
    />
  </div>
)}
      </div>
    </div>
  );
}

// ── Client card ───────────────────────────────────────────────────────────────
function ClientCard({ client, onSelect }) {
  return (
    <button
      onClick={onSelect}
      className="group bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-sm hover:shadow-md hover:border-[#2563eb] transition-all text-left w-full"
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-11 h-11 ${avatarColor(client.name)} rounded-xl flex items-center justify-center flex-shrink-0`}
        >
          <span className="text-sm font-bold text-white">
            {initials(client.name)}
          </span>
        </div>
        <ChevronRight className="w-4 h-4 text-[#cbd5e1] group-hover:text-[#2563eb] transition-colors mt-1" />
      </div>

      <h3 className="text-sm font-semibold text-[#1e293b] mb-2 leading-snug">
        {client.name}
      </h3>

      <div className="space-y-1.5">
        {client.email && (
          <div className="flex items-center gap-1.5 text-xs text-[#64748b]">
            <Mail className="w-3 h-3 flex-shrink-0 text-[#94a3b8]" />
            <span className="truncate">{client.email}</span>
          </div>
        )}
        {client.phone && (
          <div className="flex items-center gap-1.5 text-xs text-[#64748b]">
            <Phone className="w-3 h-3 flex-shrink-0 text-[#94a3b8]" />
            <span className="truncate">{client.phone}</span>
          </div>
        )}
        {client.address && (
          <div className="flex items-center gap-1.5 text-xs text-[#64748b]">
            <MapPin className="w-3 h-3 flex-shrink-0 text-[#94a3b8]" />
            <span className="truncate">{client.address}</span>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-[#f1f5f9]">
        <span className="text-xs text-[#2563eb] font-medium group-hover:underline">
          Open workspace →
        </span>
      </div>
    </button>
  );
}
