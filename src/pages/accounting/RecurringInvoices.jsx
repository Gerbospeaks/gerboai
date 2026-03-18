import React, { useState, useEffect, useCallback } from "react";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import {
  RefreshCw,
  Plus,
  Edit2,
  Trash2,
  X,
  Search,
  Calendar,
  Play,
  Pause,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Send,
  Eye,
  ChevronDown,
  Users,
  DollarSign,
  Repeat,
  ArrowRight,
  MoreVertical,
  Zap,
} from "lucide-react";

// ── Design tokens ─────────────────────────────────────────────────────────────
const inputCls =
  "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md bg-white text-[#1e293b] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-[#2563eb] transition-colors";
const labelCls =
  "block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5";
const selectCls =
  "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md bg-white text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-[#2563eb] transition-colors";
const fmt = (n) =>
  Number(n || 0).toLocaleString("en-ZA", { minimumFractionDigits: 2 });
const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString("en-ZA") : "—";
const today = () => new Date().toISOString().split("T")[0];

// ── Frequency config ──────────────────────────────────────────────────────────
const FREQUENCIES = [
  { value: "weekly", label: "Weekly", days: 7, icon: "7d", color: "#0891b2" },
  {
    value: "fortnightly",
    label: "Fortnightly",
    days: 14,
    icon: "14d",
    color: "#7c3aed",
  },
  {
    value: "monthly",
    label: "Monthly",
    days: 30,
    icon: "1m",
    color: "#2563eb",
  },
  {
    value: "quarterly",
    label: "Quarterly",
    days: 90,
    icon: "3m",
    color: "#059669",
  },
  {
    value: "biannually",
    label: "Every 6 Months",
    days: 182,
    icon: "6m",
    color: "#d97706",
  },
  {
    value: "annually",
    label: "Annually",
    days: 365,
    icon: "1y",
    color: "#dc2626",
  },
];

const PAYMENT_TERMS = [
  { value: 7, label: "Net 7 days" },
  { value: 14, label: "Net 14 days" },
  { value: 30, label: "Net 30 days" },
  { value: 60, label: "Net 60 days" },
];

const TX_CATEGORIES = [
  "Service",
  "Product",
  "Consulting",
  "Retainer",
  "Subscription",
  "Other",
];

// ── Date helpers ──────────────────────────────────────────────────────────────
function addDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function addMonths(dateStr, months) {
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().split("T")[0];
}

function getNextDate(lastDate, frequency) {
  const freq = FREQUENCIES.find((f) => f.value === frequency);
  if (!freq) return addDays(lastDate, 30);
  if (frequency === "monthly") return addMonths(lastDate, 1);
  if (frequency === "quarterly") return addMonths(lastDate, 3);
  if (frequency === "biannually") return addMonths(lastDate, 6);
  if (frequency === "annually") return addMonths(lastDate, 12);
  return addDays(lastDate, freq.days);
}

function isDue(schedule) {
  if (schedule.status === "paused") return false;
  if (!schedule.nextRunDate) return false;
  return schedule.nextRunDate <= today();
}

function daysUntilNext(nextDate) {
  if (!nextDate) return null;
  const diff = Math.ceil(
    (new Date(nextDate) - new Date()) / (1000 * 60 * 60 * 24),
  );
  return diff;
}

// ── Generate invoice number ───────────────────────────────────────────────────
async function generateInvoiceNumber(db, uid) {
  const year = new Date().getFullYear();
  const q = query(
    collection(db, "users", uid, "invoices"),
    orderBy("createdAt", "desc"),
    limit(1),
  );
  const snap = await getDocs(q);
  let last = 1000;
  if (!snap.empty) {
    const match = snap.docs[0].data().invoiceNumber?.match(/(\d+)$/);
    if (match) last = Number(match[1]);
  }
  return `INV-${year}-${String(last + 1).padStart(4, "0")}`;
}

// ── Status helpers ────────────────────────────────────────────────────────────
const FreqBadge = ({ frequency }) => {
  const freq = FREQUENCIES.find((f) => f.value === frequency);
  if (!freq) return null;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold"
      style={{
        background: freq.color + "18",
        color: freq.color,
        border: `1px solid ${freq.color}40`,
      }}
    >
      <Repeat className="w-3 h-3" />
      {freq.label}
    </span>
  );
};

const StatusBadge = ({ status, nextDate }) => {
  if (status === "paused")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-[#f1f5f9] text-[#64748b]">
        <Pause className="w-3 h-3" />
        Paused
      </span>
    );
  if (isDue({ status, nextRunDate: nextDate }))
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-[#fff7ed] text-[#ea580c]">
        <Zap className="w-3 h-3" />
        Due Now
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-[#f0fdf4] text-[#059669]">
      <CheckCircle className="w-3 h-3" />
      Active
    </span>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
export default function RecurringInvoices({ user }) {
  const [schedules, setSchedules] = useState([]);
  const [clients, setClients] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [activeView, setActiveView] = useState("schedules"); // schedules | history
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState({});
  const [showPreview, setShowPreview] = useState(null);

  const db = getFirestore();

  const blankForm = () => ({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    clientAddress: "",
    frequency: "monthly",
    startDate: today(),
    nextRunDate: today(),
    endDate: "",
    paymentTermsDays: 30,
    autoSend: false,
    items: [],
    notes: "",
    status: "active",
  });

  const [form, setForm] = useState(blankForm());
  const [newItem, setNewItem] = useState({
    description: "",
    qty: "1",
    rate: "",
    taxRate: "15",
    category: "Service",
  });

  // ── Load ──────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const [schSnap, clientSnap, histSnap] = await Promise.all([
        getDocs(
          query(
            collection(db, "users", user.uid, "recurringSchedules"),
            orderBy("createdAt", "desc"),
          ),
        ),
        getDocs(
          query(collection(db, "users", user.uid, "clients"), orderBy("name")),
        ).catch(() => ({ docs: [] })),
        getDocs(
          query(
            collection(db, "users", user.uid, "recurringHistory"),
            orderBy("generatedAt", "desc"),
            limit(100),
          ),
        ),
      ]);
      setSchedules(schSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setClients(clientSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setHistory(histSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    load();
  }, [load]);

  // ── Item helpers ──────────────────────────────────────────────────────────
  const handleAddItem = () => {
    if (!newItem.description || !newItem.rate) return;
    const rate = Number(newItem.rate);
    const qty = Number(newItem.qty || 1);
    const taxRate = Number(newItem.taxRate || 0);
    const amount = rate * qty;
    const tax = amount * (taxRate / 100);
    setForm((p) => ({
      ...p,
      items: [
        ...p.items,
        {
          description: newItem.description,
          category: newItem.category,
          qty,
          rate,
          taxRate,
          amount,
          taxAmount: tax,
          totalAmount: amount + tax,
        },
      ],
    }));
    setNewItem({
      description: "",
      qty: "1",
      rate: "",
      taxRate: "15",
      category: "Service",
    });
  };

  const removeItem = (i) =>
    setForm((p) => ({ ...p, items: p.items.filter((_, idx) => idx !== i) }));

  const subtotal = form.items.reduce((s, i) => s + i.amount, 0);
  const totalTax = form.items.reduce((s, i) => s + i.taxAmount, 0);
  const total = subtotal + totalTax;

  // ── CRUD ──────────────────────────────────────────────────────────────────
  const openAdd = () => {
    setEditing(null);
    setForm(blankForm());
    setShowModal(true);
  };

  const openEdit = (sch) => {
    setEditing(sch);
    setForm({
      clientName: sch.clientName || "",
      clientEmail: sch.clientEmail || "",
      clientPhone: sch.clientPhone || "",
      clientAddress: sch.clientAddress || "",
      frequency: sch.frequency || "monthly",
      startDate: sch.startDate || today(),
      nextRunDate: sch.nextRunDate || today(),
      endDate: sch.endDate || "",
      paymentTermsDays: sch.paymentTermsDays || 30,
      autoSend: sch.autoSend || false,
      items: sch.items || [],
      notes: sch.notes || "",
      status: sch.status || "active",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.clientName.trim() || form.items.length === 0) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        subtotal,
        totalTax,
        total,
        updatedAt: serverTimestamp(),
      };
      if (editing) {
        await updateDoc(
          doc(db, "users", user.uid, "recurringSchedules", editing.id),
          payload,
        );
      } else {
        await addDoc(collection(db, "users", user.uid, "recurringSchedules"), {
          ...payload,
          createdAt: serverTimestamp(),
        });
      }
      setShowModal(false);
      load();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Delete this recurring schedule? All history will be kept.",
      )
    )
      return;
    await deleteDoc(doc(db, "users", user.uid, "recurringSchedules", id));
    load();
  };

  const handleTogglePause = async (sch) => {
    const newStatus = sch.status === "paused" ? "active" : "paused";
    await updateDoc(doc(db, "users", user.uid, "recurringSchedules", sch.id), {
      status: newStatus,
      updatedAt: serverTimestamp(),
    });
    load();
  };

  // ── Generate invoice from schedule ────────────────────────────────────────
  const handleGenerate = async (sch) => {
    if (!window.confirm(`Generate invoice for ${sch.clientName}?`)) return;
    setGenerating((p) => ({ ...p, [sch.id]: true }));
    try {
      const invoiceNumber = await generateInvoiceNumber(db, user.uid);
      const invoiceDate = today();
      const dueDate = addDays(invoiceDate, sch.paymentTermsDays || 30);

      // Create invoice
      await addDoc(collection(db, "users", user.uid, "invoices"), {
        invoiceNumber,
        documentType: "invoice",
        status: "pending",
        locked: true,
        recurringScheduleId: sch.id,
        customer: {
          name: sch.clientName,
          email: sch.clientEmail || "",
          phone: sch.clientPhone || "",
          address: sch.clientAddress || "",
        },
        dates: {
          invoiceDate: new Date(invoiceDate).toISOString(),
          dueDate: new Date(dueDate).toISOString(),
        },
        items: sch.items || [],
        totals: {
          subtotal: sch.subtotal || 0,
          tax: sch.totalTax || 0,
          total: sch.total || 0,
          paid: 0,
          due: sch.total || 0,
        },
        notes: sch.notes || "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Log to history
      await addDoc(collection(db, "users", user.uid, "recurringHistory"), {
        scheduleId: sch.id,
        clientName: sch.clientName,
        invoiceNumber,
        total: sch.total || 0,
        generatedAt: serverTimestamp(),
        frequency: sch.frequency,
      });

      // Advance next run date
      const nextRun = getNextDate(sch.nextRunDate || today(), sch.frequency);
      await updateDoc(
        doc(db, "users", user.uid, "recurringSchedules", sch.id),
        {
          nextRunDate: nextRun,
          lastRunDate: today(),
          runCount: (sch.runCount || 0) + 1,
          updatedAt: serverTimestamp(),
        },
      );

      load();
      alert(`Invoice ${invoiceNumber} created for ${sch.clientName}`);
    } finally {
      setGenerating((p) => ({ ...p, [sch.id]: false }));
    }
  };

  // ── Load client into form ─────────────────────────────────────────────────
  const loadClient = (clientId) => {
    const c = clients.find((cl) => cl.id === clientId);
    if (!c) return;
    setForm((p) => ({
      ...p,
      clientName: c.name || "",
      clientEmail: c.email || "",
      clientPhone: c.phone || "",
      clientAddress: c.address || "",
    }));
  };

  // ── Derived ───────────────────────────────────────────────────────────────
  const dueNow = schedules.filter((s) => isDue(s));
  const activeCount = schedules.filter((s) => s.status === "active").length;
  const totalMonthly = schedules
    .filter((s) => s.status === "active")
    .reduce((sum, s) => {
      const freq = FREQUENCIES.find((f) => f.value === s.frequency);
      if (!freq) return sum;
      const perMonth = (s.total || 0) * (30 / freq.days);
      return sum + perMonth;
    }, 0);

  const filtered = schedules.filter((s) => {
    const q = search.toLowerCase();
    const matchQ =
      s.clientName?.toLowerCase().includes(q) ||
      s.items?.some((i) => i.description?.toLowerCase().includes(q));
    const matchSt =
      filterStatus === "all" ||
      (filterStatus === "active" && s.status === "active" && !isDue(s)) ||
      (filterStatus === "due" && isDue(s)) ||
      (filterStatus === "paused" && s.status === "paused");
    return matchQ && matchSt;
  });

  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#eff6ff] rounded-lg flex items-center justify-center">
            <Repeat className="w-5 h-5 text-[#2563eb]" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#1e293b]">
              Recurring Invoices
            </h1>
            <p className="text-xs text-[#64748b]">
              {schedules.length} schedules · {dueNow.length} due now
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex bg-[#f1f5f9] rounded-lg p-0.5">
            {[
              { id: "schedules", label: "Schedules", icon: Repeat },
              { id: "history", label: "History", icon: FileText },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveView(id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  activeView === id
                    ? "bg-white text-[#1e293b] shadow-sm"
                    : "text-[#64748b] hover:text-[#374151]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Schedule
          </button>
        </div>
      </div>

      {/* ── KPI tiles ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: "Active Schedules",
            value: activeCount,
            icon: CheckCircle,
            bg: "bg-[#f0fdf4]",
            color: "text-[#059669]",
          },
          {
            label: "Due Now",
            value: dueNow.length,
            icon: Zap,
            bg: dueNow.length > 0 ? "bg-[#fff7ed]" : "bg-[#f8fafc]",
            color: dueNow.length > 0 ? "text-[#ea580c]" : "text-[#64748b]",
          },
          {
            label: "Monthly Revenue",
            value: `R${fmt(totalMonthly)}`,
            icon: DollarSign,
            bg: "bg-[#eff6ff]",
            color: "text-[#2563eb]",
          },
          {
            label: "Invoices Generated",
            value: history.length,
            icon: FileText,
            bg: "bg-[#faf5ff]",
            color: "text-[#7c3aed]",
          },
        ].map(({ label, value, icon: Icon, bg, color }) => (
          <div
            key={label}
            className={`${bg} border border-[#e2e8f0] rounded-xl p-4`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#64748b]">
                {label}
              </span>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <div className={`text-xl font-bold ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      {/* ── Due now banner ── */}
      {dueNow.length > 0 && (
        <div className="px-5 py-4 bg-[#fff7ed] border border-[#fed7aa] rounded-xl">
          <div className="flex items-center gap-3 mb-3">
            <Zap className="w-5 h-5 text-[#ea580c] flex-shrink-0" />
            <p className="text-sm font-semibold text-[#9a3412]">
              {dueNow.length} schedule{dueNow.length !== 1 ? "s are" : " is"}{" "}
              due — generate invoices now
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {dueNow.map((sch) => (
              <button
                key={sch.id}
                onClick={() => handleGenerate(sch)}
                disabled={generating[sch.id]}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#ea580c] hover:bg-[#c2410c] text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                <Play className="w-3 h-3" />
                {generating[sch.id]
                  ? "Generating…"
                  : `${sch.clientName} · R${fmt(sch.total)}`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── SCHEDULES VIEW ── */}
      {activeView === "schedules" && (
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-3 items-center bg-white border border-[#e2e8f0] rounded-xl px-4 py-3 shadow-sm">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by client or item…"
                className="w-full pl-9 pr-3 py-2 text-sm border border-[#e2e8f0] rounded-lg bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
              />
            </div>
            <div className="flex gap-1.5">
              {[
                { v: "all", label: "All" },
                { v: "due", label: "Due Now" },
                { v: "active", label: "Active" },
                { v: "paused", label: "Paused" },
              ].map(({ v, label }) => (
                <button
                  key={v}
                  onClick={() => setFilterStatus(v)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    filterStatus === v
                      ? "bg-[#2563eb] text-white"
                      : "bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Schedule cards */}
          {loading ? (
            <div className="text-center py-16 text-[#94a3b8] text-sm">
              Loading schedules…
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white border border-[#e2e8f0] rounded-xl">
              <Repeat className="w-10 h-10 text-[#cbd5e1] mb-3" />
              <p className="text-sm font-medium text-[#94a3b8]">
                No recurring schedules yet
              </p>
              <p className="text-xs text-[#cbd5e1] mt-1">
                Create your first recurring invoice to automate billing
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((sch) => {
                const daysLeft = daysUntilNext(sch.nextRunDate);
                const due = isDue(sch);
                const freq = FREQUENCIES.find((f) => f.value === sch.frequency);

                return (
                  <div
                    key={sch.id}
                    className={`bg-white border rounded-xl shadow-sm overflow-hidden transition-all ${
                      due ? "border-[#fed7aa]" : "border-[#e2e8f0]"
                    }`}
                  >
                    {/* Card header */}
                    <div
                      className={`px-5 py-4 flex items-center gap-4 ${due ? "bg-[#fffbeb]" : ""}`}
                    >
                      {/* Frequency indicator */}
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-sm"
                        style={{
                          background: (freq?.color || "#2563eb") + "18",
                          color: freq?.color || "#2563eb",
                        }}
                      >
                        {freq?.icon || "1m"}
                      </div>

                      {/* Client + description */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-[#1e293b]">
                            {sch.clientName}
                          </p>
                          <FreqBadge frequency={sch.frequency} />
                          <StatusBadge
                            status={sch.status}
                            nextDate={sch.nextRunDate}
                          />
                        </div>
                        <p className="text-xs text-[#64748b] mt-0.5 truncate">
                          {sch.items?.map((i) => i.description).join(", ") ||
                            "No items"}
                        </p>
                      </div>

                      {/* Amount + next run */}
                      <div className="text-right flex-shrink-0">
                        <p className="text-lg font-black text-[#1e293b]">
                          R{fmt(sch.total)}
                        </p>
                        <p
                          className={`text-xs mt-0.5 ${due ? "text-[#ea580c] font-semibold" : "text-[#64748b]"}`}
                        >
                          {due
                            ? "⚡ Due now"
                            : sch.status === "paused"
                              ? "Paused"
                              : daysLeft !== null
                                ? daysLeft <= 0
                                  ? "Due today"
                                  : `Next: ${fmtDate(sch.nextRunDate)} (${daysLeft}d)`
                                : "—"}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {(due || sch.status === "active") && (
                          <button
                            onClick={() => handleGenerate(sch)}
                            disabled={generating[sch.id]}
                            title="Generate invoice now"
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
                          >
                            {generating[sch.id] ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Play className="w-3.5 h-3.5" />
                            )}
                            {generating[sch.id] ? "…" : "Run"}
                          </button>
                        )}
                        <button
                          onClick={() => handleTogglePause(sch)}
                          title={sch.status === "paused" ? "Resume" : "Pause"}
                          className="p-1.5 text-[#94a3b8] hover:text-[#374151] hover:bg-[#f1f5f9] rounded-lg transition-all"
                        >
                          {sch.status === "paused" ? (
                            <Play className="w-4 h-4" />
                          ) : (
                            <Pause className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => openEdit(sch)}
                          className="p-1.5 text-[#94a3b8] hover:text-[#2563eb] hover:bg-[#eff6ff] rounded-lg transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(sch.id)}
                          className="p-1.5 text-[#94a3b8] hover:text-[#dc2626] hover:bg-[#fef2f2] rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Card footer — timeline */}
                    <div className="px-5 py-2.5 border-t border-[#f1f5f9] flex items-center justify-between bg-[#f8fafc]">
                      <div className="flex items-center gap-4 text-xs text-[#64748b]">
                        <span>Started {fmtDate(sch.startDate)}</span>
                        {sch.lastRunDate && (
                          <span>Last run {fmtDate(sch.lastRunDate)}</span>
                        )}
                        {sch.runCount > 0 && (
                          <span>
                            {sch.runCount} invoice
                            {sch.runCount !== 1 ? "s" : ""} generated
                          </span>
                        )}
                        {sch.endDate && (
                          <span>Ends {fmtDate(sch.endDate)}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-[#94a3b8]">
                        <span>Net {sch.paymentTermsDays || 30} days</span>
                        {sch.autoSend && (
                          <span className="flex items-center gap-1 text-[#059669]">
                            <Send className="w-3 h-3" />
                            Auto-send
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ── HISTORY VIEW ── */}
      {activeView === "history" && (
        <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 bg-[#f8fafc] border-b border-[#e2e8f0] flex items-center justify-between">
            <span className="text-sm font-semibold text-[#374151]">
              Generation History
            </span>
            <span className="text-xs text-[#64748b] bg-[#e2e8f0] px-2 py-0.5 rounded-full">
              {history.length} invoices
            </span>
          </div>
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <FileText className="w-10 h-10 text-[#cbd5e1] mb-3" />
              <p className="text-sm font-medium text-[#94a3b8]">
                No invoices generated yet
              </p>
              <p className="text-xs text-[#cbd5e1] mt-1">
                Run a schedule to generate your first recurring invoice
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#e2e8f0]">
                  {[
                    "Invoice #",
                    "Client",
                    "Frequency",
                    "Amount",
                    "Generated",
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
                {history.map((h) => (
                  <tr
                    key={h.id}
                    className="border-b border-[#f8fafc] hover:bg-[#f8fafc] transition-colors"
                  >
                    <td className="px-5 py-3 text-sm font-bold text-[#2563eb]">
                      {h.invoiceNumber}
                    </td>
                    <td className="px-5 py-3 text-sm font-medium text-[#1e293b]">
                      {h.clientName}
                    </td>
                    <td className="px-5 py-3">
                      <FreqBadge frequency={h.frequency} />
                    </td>
                    <td className="px-5 py-3 text-sm font-semibold text-[#1e293b]">
                      R{fmt(h.total)}
                    </td>
                    <td className="px-5 py-3 text-sm text-[#64748b]">
                      {h.generatedAt?.toDate
                        ? h.generatedAt.toDate().toLocaleDateString("en-ZA")
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ══ ADD / EDIT MODAL ══ */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl border border-[#e2e8f0] my-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#eff6ff] rounded-lg flex items-center justify-center">
                  <Repeat className="w-4 h-4 text-[#2563eb]" />
                </div>
                <h2 className="text-sm font-semibold text-[#1e293b]">
                  {editing
                    ? "Edit Recurring Schedule"
                    : "New Recurring Schedule"}
                </h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-[#64748b] hover:bg-[#f1f5f9] rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto max-h-[72vh]">
              {/* Client */}
              <Section label="Client">
                {clients.length > 0 && (
                  <div className="mb-3">
                    <label className={labelCls}>Load from saved clients</label>
                    <select
                      className={selectCls}
                      defaultValue=""
                      onChange={(e) => loadClient(e.target.value)}
                    >
                      <option value="">— Select a client —</option>
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className={labelCls}>Client Name *</label>
                    <input
                      className={inputCls}
                      value={form.clientName}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, clientName: e.target.value }))
                      }
                      placeholder="ABC Corporation"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Email</label>
                    <input
                      type="email"
                      className={inputCls}
                      value={form.clientEmail}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, clientEmail: e.target.value }))
                      }
                      placeholder="billing@client.co.za"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Phone</label>
                    <input
                      className={inputCls}
                      value={form.clientPhone}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, clientPhone: e.target.value }))
                      }
                      placeholder="+27 11 000 0000"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className={labelCls}>Address</label>
                    <input
                      className={inputCls}
                      value={form.clientAddress}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          clientAddress: e.target.value,
                        }))
                      }
                      placeholder="123 Business Park, Johannesburg"
                    />
                  </div>
                </div>
              </Section>

              {/* Schedule */}
              <Section label="Schedule">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div>
                    <label className={labelCls}>Frequency *</label>
                    <select
                      className={selectCls}
                      value={form.frequency}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, frequency: e.target.value }))
                      }
                    >
                      {FREQUENCIES.map((f) => (
                        <option key={f.value} value={f.value}>
                          {f.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>First Run Date</label>
                    <input
                      type="date"
                      className={inputCls}
                      value={form.nextRunDate}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          nextRunDate: e.target.value,
                          startDate: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label className={labelCls}>End Date (optional)</label>
                    <input
                      type="date"
                      className={inputCls}
                      value={form.endDate}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, endDate: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Payment Terms</label>
                    <select
                      className={selectCls}
                      value={form.paymentTermsDays}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          paymentTermsDays: Number(e.target.value),
                        }))
                      }
                    >
                      {PAYMENT_TERMS.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-3 pt-5">
                    <input
                      type="checkbox"
                      id="autoSend"
                      checked={form.autoSend}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, autoSend: e.target.checked }))
                      }
                      className="w-4 h-4 rounded border-[#d1d5db] text-[#2563eb] cursor-pointer"
                    />
                    <label
                      htmlFor="autoSend"
                      className="text-sm text-[#374151] cursor-pointer"
                    >
                      Auto-send via email
                    </label>
                  </div>
                </div>

                {/* Frequency visual badges */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {FREQUENCIES.map((f) => (
                    <button
                      key={f.value}
                      type="button"
                      onClick={() =>
                        setForm((p) => ({ ...p, frequency: f.value }))
                      }
                      className="px-3 py-1 rounded-lg text-xs font-bold transition-all border"
                      style={
                        form.frequency === f.value
                          ? {
                              background: f.color,
                              color: "#fff",
                              borderColor: f.color,
                            }
                          : {
                              background: f.color + "12",
                              color: f.color,
                              borderColor: f.color + "40",
                            }
                      }
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </Section>

              {/* Line items */}
              <Section label="Line Items *">
                {/* Add item */}
                <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4 mb-4">
                  <div className="grid grid-cols-6 gap-3">
                    <div className="col-span-2">
                      <label className={labelCls}>Description</label>
                      <input
                        className={inputCls}
                        value={newItem.description}
                        onChange={(e) =>
                          setNewItem((p) => ({
                            ...p,
                            description: e.target.value,
                          }))
                        }
                        placeholder="Monthly retainer"
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Category</label>
                      <select
                        className={selectCls}
                        value={newItem.category}
                        onChange={(e) =>
                          setNewItem((p) => ({
                            ...p,
                            category: e.target.value,
                          }))
                        }
                      >
                        {TX_CATEGORIES.map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Rate (R)</label>
                      <input
                        type="number"
                        className={inputCls}
                        value={newItem.rate}
                        onChange={(e) =>
                          setNewItem((p) => ({ ...p, rate: e.target.value }))
                        }
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Qty</label>
                      <input
                        type="number"
                        className={inputCls}
                        value={newItem.qty}
                        onChange={(e) =>
                          setNewItem((p) => ({ ...p, qty: e.target.value }))
                        }
                        placeholder="1"
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Tax %</label>
                      <input
                        type="number"
                        className={inputCls}
                        value={newItem.taxRate}
                        onChange={(e) =>
                          setNewItem((p) => ({ ...p, taxRate: e.target.value }))
                        }
                        placeholder="15"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleAddItem}
                    className="mt-3 flex items-center gap-1.5 px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium rounded-md transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Item
                  </button>
                </div>

                {/* Items list */}
                {form.items.length > 0 && (
                  <div className="border border-[#e2e8f0] rounded-xl overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[#e2e8f0] bg-[#f8fafc]">
                          {[
                            "Description",
                            "Category",
                            "Rate",
                            "Qty",
                            "Tax",
                            "Total",
                            "",
                          ].map((h) => (
                            <th
                              key={h}
                              className="px-3 py-2.5 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wide"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {form.items.map((it, i) => (
                          <tr
                            key={i}
                            className="border-b border-[#f8fafc] hover:bg-[#f8fafc] transition-colors"
                          >
                            <td className="px-3 py-2.5 text-sm font-medium text-[#1e293b]">
                              {it.description}
                            </td>
                            <td className="px-3 py-2.5 text-xs text-[#64748b]">
                              {it.category}
                            </td>
                            <td className="px-3 py-2.5 text-sm text-[#374151]">
                              R{fmt(it.rate)}
                            </td>
                            <td className="px-3 py-2.5 text-sm text-[#374151]">
                              {it.qty}
                            </td>
                            <td className="px-3 py-2.5 text-sm text-[#374151]">
                              R{fmt(it.taxAmount)}
                            </td>
                            <td className="px-3 py-2.5 text-sm font-semibold text-[#1e293b]">
                              R{fmt(it.totalAmount)}
                            </td>
                            <td className="px-3 py-2.5">
                              <button
                                onClick={() => removeItem(i)}
                                className="p-1 text-[#94a3b8] hover:text-[#dc2626] rounded transition-all"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {/* Totals */}
                    <div className="px-4 py-3 bg-[#f8fafc] border-t border-[#e2e8f0] flex flex-col items-end gap-1 text-sm">
                      <div className="flex justify-between w-44 text-[#64748b]">
                        <span>Subtotal</span>
                        <span className="font-medium text-[#374151]">
                          R{fmt(subtotal)}
                        </span>
                      </div>
                      <div className="flex justify-between w-44 text-[#64748b]">
                        <span>VAT</span>
                        <span className="font-medium text-[#374151]">
                          R{fmt(totalTax)}
                        </span>
                      </div>
                      <div className="flex justify-between w-44 pt-1.5 border-t border-[#e2e8f0] font-bold text-[#1e293b]">
                        <span>Total per invoice</span>
                        <span className="text-[#2563eb]">R{fmt(total)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </Section>

              {/* Notes */}
              <div>
                <label className={labelCls}>
                  Notes (appears on each generated invoice)
                </label>
                <textarea
                  className={inputCls}
                  rows={2}
                  value={form.notes}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, notes: e.target.value }))
                  }
                  placeholder="Payment terms, bank details, etc."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#e2e8f0]">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-[#64748b] hover:bg-[#f1f5f9] rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={
                  saving || !form.clientName.trim() || form.items.length === 0
                }
                className="px-5 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium rounded-lg disabled:opacity-50 transition-colors"
              >
                {saving
                  ? "Saving…"
                  : editing
                    ? "Update Schedule"
                    : "Create Schedule"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Section wrapper ───────────────────────────────────────────────────────────
function Section({ label, children }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-bold text-[#374151] uppercase tracking-wide">
          {label}
        </span>
        <div className="flex-1 h-px bg-[#e2e8f0]" />
      </div>
      {children}
    </div>
  );
}

// ── Inline Pause icon ─────────────────────────────────────────────────────────

