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
  getDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import {
  FileText,
  Plus,
  Search,
  Eye,
  Printer,
  Download,
  X,
  Save,
  Send,
  ChevronLeft,
  CheckCircle,
  AlertCircle,
  Ban,
  DollarSign,
  Receipt,
  ArrowLeftRight,
  Clock,
  Users,
  Building,
  Wallet,
  CreditCard,
  Trash2,
  Link2,
} from "lucide-react";

// ── Shared design tokens (matching AccountingDashboard) ───────────────────────
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

// ── CN number generator ───────────────────────────────────────────────────────
const generateCNNumber = async (db, uid) => {
  const year = new Date().getFullYear();
  const q = query(
    collection(db, "users", uid, "creditNotes"),
    orderBy("createdAt", "desc"),
    limit(1),
  );
  const snap = await getDocs(q);
  let last = 1000;
  if (!snap.empty) {
    const match = snap.docs[0].data().cnNumber?.match(/(\d+)$/);
    if (match) last = Number(match[1]);
  }
  return `CN-${year}-${String(last + 1).padStart(4, "0")}`;
};

// ── Status badge helper ───────────────────────────────────────────────────────
const STATUS_META = {
  draft: { label: "Draft", cls: "bg-[#f1f5f9] text-[#64748b]", icon: Clock },
  issued: { label: "Issued", cls: "bg-[#dbeafe] text-[#1e40af]", icon: Send },
  applied: {
    label: "Applied",
    cls: "bg-[#dcfce7] text-[#166534]",
    icon: CheckCircle,
  },
  voided: { label: "Voided", cls: "bg-[#fef2f2] text-[#991b1b]", icon: Ban },
};

const StatusBadge = ({ status }) => {
  const meta = STATUS_META[status] || STATUS_META.draft;
  const Icon = meta.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold ${meta.cls}`}
    >
      <Icon className="w-3 h-3" />
      {meta.label}
    </span>
  );
};

// ── Print styles ──────────────────────────────────────────────────────────────
const PRINT_STYLES = `@media print { * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } html,body { margin:0!important;padding:0!important;width:210mm!important;background:white!important; } body * { visibility:hidden!important; } #cn-print-area,#cn-print-area * { visibility:visible!important; } #cn-print-area { display:block!important;position:absolute!important;left:0!important;top:0!important;width:210mm!important;min-height:297mm!important;margin:0!important;padding:0!important;background:white!important; } @page { size:A4 portrait;margin:40px!important; } }`;

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
export default function CreditNotesView({ user, businessInfo }) {
  const [view, setView] = useState("list"); // list | create | detail
  const [creditNotes, setCreditNotes] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedCN, setSelectedCN] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const db = getFirestore();

  // ── Load data ───────────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const [cnSnap, invSnap] = await Promise.all([
        getDocs(
          query(
            collection(db, "users", user.uid, "creditNotes"),
            orderBy("createdAt", "desc"),
          ),
        ),
        getDocs(
          query(
            collection(db, "users", user.uid, "invoices"),
            orderBy("createdAt", "desc"),
            limit(200),
          ),
        ),
      ]);
      setCreditNotes(cnSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setInvoices(invSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } finally {
      setLoading(false);
    }
  }, [user, db]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Filtered list ───────────────────────────────────────────────────────────
  const filtered = creditNotes.filter((cn) => {
    const q = search.toLowerCase();
    return (
      (cn.cnNumber?.toLowerCase().includes(q) ||
        cn.customerName?.toLowerCase().includes(q) ||
        cn.reason?.toLowerCase().includes(q)) &&
      (filterStatus === "all" || cn.status === filterStatus)
    );
  });

  const totalIssued = creditNotes
    .filter((cn) => cn.status === "issued")
    .reduce((s, cn) => s + (cn.totals?.total || 0), 0);
  const totalApplied = creditNotes
    .filter((cn) => cn.status === "applied")
    .reduce((s, cn) => s + (cn.totals?.total || 0), 0);
  const totalDraft = creditNotes.filter((cn) => cn.status === "draft").length;

  const handlePrint = () => {
    const s = document.createElement("style");
    s.textContent = PRINT_STYLES;
    document.head.appendChild(s);
    window.print();
    setTimeout(() => document.head.removeChild(s), 1000);
  };

  // ── VIEWS ───────────────────────────────────────────────────────────────────
  if (view === "create") {
    return (
      <CreateCreditNote
        user={user}
        db={db}
        invoices={invoices}
        businessInfo={businessInfo}
        onSaved={() => {
          loadData();
          setView("list");
        }}
        onBack={() => setView("list")}
      />
    );
  }

  if (view === "detail" && selectedCN) {
    return (
      <CreditNoteDetail
        user={user}
        db={db}
        cn={selectedCN}
        invoices={invoices}
        businessInfo={businessInfo}
        onBack={() => {
          setSelectedCN(null);
          setView("list");
        }}
        onRefresh={async () => {
          const snap = await getDoc(
            doc(db, "users", user.uid, "creditNotes", selectedCN.id),
          );
          if (snap.exists()) setSelectedCN({ id: snap.id, ...snap.data() });
          loadData();
        }}
        onPrint={handlePrint}
      />
    );
  }

  // ── LIST VIEW ───────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 overflow-y-auto p-6">
      {/* Print area */}
      <div id="cn-print-area" className="hidden print:block" />

      <div className="max-w-5xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#fef2f2] rounded-lg flex items-center justify-center">
              <Receipt className="w-5 h-5 text-[#dc2626]" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#1e293b]">Credit Notes</h1>
              <p className="text-xs text-[#64748b]">
                {creditNotes.length} total
              </p>
            </div>
          </div>
          <button
            onClick={() => setView("create")}
            className="flex items-center gap-2 px-4 py-2 bg-[#dc2626] hover:bg-[#b91c1c] text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Credit Note
          </button>
        </div>

        {/* KPI tiles */}
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              label: "Drafts",
              value: totalDraft,
              suffix: "notes",
              icon: Clock,
              bg: "bg-[#f8fafc]",
              color: "text-[#64748b]",
            },
            {
              label: "Issued",
              value: `R${fmt(totalIssued)}`,
              suffix: "pending",
              icon: AlertCircle,
              bg: "bg-[#fff7ed]",
              color: "text-[#ea580c]",
            },
            {
              label: "Applied",
              value: `R${fmt(totalApplied)}`,
              suffix: "credited",
              icon: CheckCircle,
              bg: "bg-[#f0fdf4]",
              color: "text-[#059669]",
            },
          ].map(({ label, value, suffix, icon: Icon, bg, color }) => (
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
              <div className="text-xs text-[#94a3b8] mt-0.5">{suffix}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center bg-white border border-[#e2e8f0] rounded-xl px-4 py-3 shadow-sm">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by CN number, client or reason…"
              className="w-full pl-9 pr-3 py-2 text-sm border border-[#e2e8f0] rounded-lg bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
            />
          </div>
          <div className="flex gap-1.5">
            {["all", "draft", "issued", "applied", "voided"].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${
                  filterStatus === s
                    ? "bg-[#dc2626] text-white"
                    : "bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0]"
                }`}
              >
                {s === "all" ? "All" : STATUS_META[s]?.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-16 text-[#94a3b8] text-sm">
            Loading credit notes…
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white border border-[#e2e8f0] rounded-xl">
            <Receipt className="w-10 h-10 text-[#cbd5e1] mb-3" />
            <p className="text-sm font-medium text-[#94a3b8]">
              No credit notes found
            </p>
            <p className="text-xs text-[#cbd5e1] mt-1">
              Create your first credit note using the button above
            </p>
          </div>
        ) : (
          <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#e2e8f0] bg-[#f8fafc]">
                  {[
                    "CN Number",
                    "Client",
                    "Linked Invoice",
                    "Reason",
                    "Date",
                    "Amount",
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
                {filtered.map((cn) => (
                  <tr
                    key={cn.id}
                    onClick={() => {
                      setSelectedCN(cn);
                      setView("detail");
                    }}
                    className="border-b border-[#f8fafc] hover:bg-[#f8fafc] cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 text-sm font-bold text-[#dc2626]">
                      {cn.cnNumber}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-[#1e293b]">
                      {cn.customerName || "—"}
                    </td>
                    <td className="px-4 py-3">
                      {cn.linkedInvoiceNumber ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-[#2563eb]">
                          <Link2 className="w-3 h-3" />
                          {cn.linkedInvoiceNumber}
                        </span>
                      ) : (
                        <span className="text-xs text-[#94a3b8]">
                          Standalone
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#64748b] max-w-[160px] truncate">
                      {cn.reason || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#64748b]">
                      {fmtDate(cn.dates?.cnDate)}
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-[#1e293b]">
                      R{fmt(cn.totals?.total)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={cn.status} />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCN(cn);
                          setView("detail");
                        }}
                        className="p-1.5 text-[#94a3b8] hover:text-[#2563eb] hover:bg-[#eff6ff] rounded-lg transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// CREATE CREDIT NOTE
// ══════════════════════════════════════════════════════════════════════════════
function CreateCreditNote({
  user,
  db,
  invoices,
  businessInfo,
  onSaved,
  onBack,
}) {
  const [cnNumber, setCnNumber] = useState("");
  const [linkedInv, setLinkedInv] = useState("");
  const [reason, setReason] = useState("");
  const [cnDate, setCnDate] = useState(today());
  const [expiryDate, setExpiryDate] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({
    description: "",
    qty: "",
    rate: "",
    taxRate: "15",
  });
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const go = async () => {
      const n = await generateCNNumber(db, user.uid);
      setCnNumber(n);

      // Pre-fill from invoice if launched via "Credit note" button
      if (window.__creditNoteSource) {
        const inv = window.__creditNoteSource;
        window.__creditNoteSource = null;

        // handleLinkInvoice needs invoices to be loaded first.
        // We set the linkedInv id and fill fields manually here
        // because invoices prop is already passed in.
        setLinkedInv(inv.id || "");
        setCustomerName(inv.customer?.name || "");
        setCustomerEmail(inv.customer?.email || "");
        setCustomerAddress(inv.customer?.address || "");
        setReason(`Credit note for invoice ${inv.invoiceNumber}`);
        if (inv.items?.length > 0) {
          setItems(
            inv.items.map((it) => ({
              description: it.description,
              qty: it.qty,
              rate: it.rate,
              taxRate: it.taxRate || 15,
              amount: it.amount,
              taxAmount: it.taxAmount,
              totalAmount: it.totalAmount,
            })),
          );
        }
      }
    };
    go();
  }, []);

  // Auto-fill from linked invoice
  const handleLinkInvoice = (invId) => {
    setLinkedInv(invId);
    if (!invId) return;
    const inv = invoices.find((i) => i.id === invId);
    if (!inv) return;
    setCustomerName(inv.customer?.name || "");
    setCustomerEmail(inv.customer?.email || "");
    setCustomerAddress(inv.customer?.address || "");
    // Pre-fill items from invoice
    if (inv.items?.length > 0) {
      setItems(
        inv.items.map((it) => ({
          description: it.description,
          qty: it.qty,
          rate: it.rate,
          taxRate: it.taxRate || 15,
          amount: it.amount,
          taxAmount: it.taxAmount,
          totalAmount: it.totalAmount,
        })),
      );
    }
  };

  const handleAddItem = () => {
    if (!newItem.description || !newItem.qty || !newItem.rate) return;
    const rate = Number(newItem.rate);
    const qty = Number(newItem.qty);
    const taxRate = Number(newItem.taxRate) || 0;
    const amount = rate * qty;
    const tax = amount * (taxRate / 100);
    setItems((p) => [
      ...p,
      {
        description: newItem.description,
        qty,
        rate,
        taxRate,
        amount,
        taxAmount: tax,
        totalAmount: amount + tax,
      },
    ]);
    setNewItem({ description: "", qty: "", rate: "", taxRate: "15" });
  };

  const handleRemoveItem = (i) =>
    setItems((p) => p.filter((_, idx) => idx !== i));

  const subtotal = items.reduce((s, it) => s + it.amount, 0);
  const totalTax = items.reduce((s, it) => s + it.taxAmount, 0);
  const total = subtotal + totalTax;

  const linkedInvoice = invoices.find((i) => i.id === linkedInv);

  const handleSave = async (status = "draft") => {
    if (!reason.trim()) {
      alert("Please enter a reason for this credit note.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        cnNumber,
        status,
        reason,
        customerName,
        customerEmail,
        customerAddress,
        linkedInvoiceId: linkedInv || null,
        linkedInvoiceNumber: linkedInvoice?.invoiceNumber || null,
        notes,
        dates: { cnDate, expiryDate: expiryDate || null },
        items,
        totals: { subtotal, tax: totalTax, total },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await addDoc(collection(db, "users", user.uid, "creditNotes"), payload);
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 overflow-hidden flex min-h-0">
      {/* ── Left form panel ── */}
      <div className="flex-1 overflow-y-auto px-6 py-6 min-w-0">
        <div className="max-w-2xl mx-auto space-y-5">
          {/* Back + title */}
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-1.5 text-[#64748b] hover:text-[#1e293b] hover:bg-[#f1f5f9] rounded-lg transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base font-bold text-[#1e293b]">
                New Credit Note
              </h1>
              <p className="text-xs text-[#64748b] font-mono">{cnNumber}</p>
            </div>
          </div>

          {/* CN meta card */}
          <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm p-5 space-y-4">
            <SectionTitle
              icon={FileText}
              label="Credit Note Details"
              color="text-[#dc2626]"
              bg="bg-[#fef2f2]"
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>CN Number</label>
                <input
                  className={inputCls}
                  value={cnNumber}
                  onChange={(e) => setCnNumber(e.target.value)}
                />
              </div>
              <div>
                <label className={labelCls}>Issue Date</label>
                <input
                  type="date"
                  className={inputCls}
                  value={cnDate}
                  onChange={(e) => setCnDate(e.target.value)}
                />
              </div>
              <div>
                <label className={labelCls}>Expiry Date (optional)</label>
                <input
                  type="date"
                  className={inputCls}
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                />
              </div>
              <div>
                <label className={labelCls}>Link to Invoice (optional)</label>
                <select
                  className={selectCls}
                  value={linkedInv}
                  onChange={(e) => handleLinkInvoice(e.target.value)}
                >
                  <option value="">— Standalone credit note —</option>
                  {invoices.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.invoiceNumber} — {inv.customer?.name} (R
                      {fmt(inv.totals?.total)})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={labelCls}>Reason for Credit Note *</label>
              <textarea
                className={inputCls}
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Goods returned due to damage, Duplicate invoice, Pricing error…"
              />
            </div>
          </div>

          {/* Client info */}
          <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm p-5 space-y-4">
            <SectionTitle
              icon={Users}
              label="Client Information"
              color="text-[#2563eb]"
              bg="bg-[#eff6ff]"
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Client Name</label>
                <input
                  className={inputCls}
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="ABC Corporation"
                />
              </div>
              <div>
                <label className={labelCls}>Email</label>
                <input
                  type="email"
                  className={inputCls}
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="contact@example.com"
                />
              </div>
              <div className="col-span-2">
                <label className={labelCls}>Address</label>
                <input
                  className={inputCls}
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="123 Business Park, Johannesburg"
                />
              </div>
            </div>
          </div>

          {/* Line items */}
          <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-[#e2e8f0]">
              <SectionTitle
                icon={FileText}
                label="Line Items"
                color="text-[#7c3aed]"
                bg="bg-[#faf5ff]"
              />
            </div>

            {/* Add item row */}
            <div className="p-5 border-b border-[#e2e8f0] bg-[#f8fafc]">
              <div className="grid grid-cols-6 gap-3">
                <div className="col-span-2">
                  <label className={labelCls}>Description</label>
                  <input
                    className={inputCls}
                    value={newItem.description}
                    onChange={(e) =>
                      setNewItem((p) => ({ ...p, description: e.target.value }))
                    }
                    placeholder="Service / Product"
                  />
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
                <div className="flex flex-col justify-end">
                  <button
                    onClick={handleAddItem}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium rounded-md transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Items table */}
            {items.length === 0 ? (
              <div className="py-12 text-center">
                <FileText className="w-8 h-8 text-[#cbd5e1] mx-auto mb-2" />
                <p className="text-sm text-[#94a3b8]">No items added yet</p>
              </div>
            ) : (
              <>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#e2e8f0]">
                      {["Description", "Rate", "Qty", "Tax", "Total", ""].map(
                        (h) => (
                          <th
                            key={h}
                            className="px-4 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wide"
                          >
                            {h}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it, i) => (
                      <tr
                        key={i}
                        className="border-b border-[#f8fafc] hover:bg-[#f8fafc] transition-colors"
                      >
                        <td className="px-4 py-3 text-sm font-medium text-[#1e293b]">
                          {it.description}
                        </td>
                        <td className="px-4 py-3 text-sm text-[#374151]">
                          R{fmt(it.rate)}
                        </td>
                        <td className="px-4 py-3 text-sm text-[#374151]">
                          {it.qty}
                        </td>
                        <td className="px-4 py-3 text-sm text-[#374151]">
                          R{fmt(it.taxAmount)}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-[#1e293b]">
                          R{fmt(it.totalAmount)}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleRemoveItem(i)}
                            className="p-1.5 text-[#94a3b8] hover:text-[#dc2626] hover:bg-[#fef2f2] rounded-lg transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {/* Totals */}
                <div className="px-4 py-3 bg-[#f8fafc] border-t border-[#e2e8f0]">
                  <div className="flex flex-col items-end gap-1 text-sm">
                    <div className="flex justify-between w-52 text-[#64748b]">
                      <span>Subtotal</span>
                      <span className="font-medium text-[#374151]">
                        R{fmt(subtotal)}
                      </span>
                    </div>
                    <div className="flex justify-between w-52 text-[#64748b]">
                      <span>VAT</span>
                      <span className="font-medium text-[#374151]">
                        R{fmt(totalTax)}
                      </span>
                    </div>
                    <div className="flex justify-between w-52 pt-2 border-t border-[#e2e8f0] font-bold text-[#1e293b]">
                      <span>Credit Total</span>
                      <span className="text-[#dc2626]">R{fmt(total)}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Notes */}
          <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm p-5">
            <label className={labelCls}>Internal Notes (optional)</label>
            <textarea
              className={inputCls}
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes visible on the credit note…"
            />
          </div>

          {/* Action bar */}
          <div className="flex items-center justify-between bg-white border border-[#e2e8f0] rounded-xl shadow-sm px-5 py-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 border border-[#e2e8f0] text-[#64748b] hover:bg-[#f8fafc] text-sm font-medium rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Cancel
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowPreview(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#0f172a] hover:bg-[#1e293b] text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Eye className="w-4 h-4" />
                Preview
              </button>
              <button
                onClick={() => handleSave("draft")}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 border border-[#e2e8f0] text-[#374151] hover:bg-[#f8fafc] text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                Save Draft
              </button>
              <button
                onClick={() => handleSave("issued")}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-[#dc2626] hover:bg-[#b91c1c] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {saving ? "Saving…" : "Issue Credit Note"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right preview panel ── */}
      <div className="hidden xl:flex w-[420px] flex-shrink-0 flex-col border-l border-[#e2e8f0] bg-[#e8eaed] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-[#f8fafc] border-b border-[#e2e8f0]">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-[#fef2f2] text-[#dc2626] border border-[#fecaca] uppercase tracking-wide">
            <Receipt className="w-3 h-3" />
            Credit Note Preview
          </span>
          <span className="text-xs text-[#94a3b8] font-mono">{cnNumber}</span>
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
            <CreditNoteDocument
              businessInfo={businessInfo}
              cnNumber={cnNumber}
              cnDate={cnDate}
              expiryDate={expiryDate}
              reason={reason}
              customerName={customerName}
              customerEmail={customerEmail}
              customerAddress={customerAddress}
              linkedInvoiceNumber={linkedInvoice?.invoiceNumber}
              items={items}
              subtotal={subtotal}
              totalTax={totalTax}
              total={total}
              notes={notes}
              status="draft"
            />
          </div>
        </div>
      </div>

      {/* Fullscreen preview modal */}
      {showPreview && (
        <PreviewModal
          onClose={() => setShowPreview(false)}
          cnNumber={cnNumber}
          businessInfo={businessInfo}
          cnDate={cnDate}
          expiryDate={expiryDate}
          reason={reason}
          customerName={customerName}
          customerEmail={customerEmail}
          customerAddress={customerAddress}
          linkedInvoiceNumber={linkedInvoice?.invoiceNumber}
          items={items}
          subtotal={subtotal}
          totalTax={totalTax}
          total={total}
          notes={notes}
          status="draft"
        />
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// CREDIT NOTE DETAIL / MANAGEMENT
// ══════════════════════════════════════════════════════════════════════════════
function CreditNoteDetail({
  user,
  db,
  cn,
  invoices,
  businessInfo,
  onBack,
  onRefresh,
  onPrint,
}) {
  const [applying, setApplying] = useState(false);
  const [voiding, setVoiding] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const linkedInvoice = invoices.find((i) => i.id === cn.linkedInvoiceId);

  const handleApply = async () => {
    if (cn.status !== "issued") {
      alert("Only issued credit notes can be applied.");
      return;
    }
    if (!cn.linkedInvoiceId) {
      alert("This credit note is not linked to an invoice. Link it first.");
      return;
    }
    if (
      !window.confirm(
        `Apply R${fmt(cn.totals?.total)} credit to invoice ${cn.linkedInvoiceNumber}?`,
      )
    )
      return;

    setApplying(true);
    try {
      const invRef = doc(db, "users", user.uid, "invoices", cn.linkedInvoiceId);
      const invSnap = await getDoc(invRef);
      if (!invSnap.exists()) {
        alert("Linked invoice not found.");
        return;
      }

      const invData = invSnap.data();
      const currentDue = invData.totals?.due || invData.totals?.total || 0;
      const creditAmt = cn.totals?.total || 0;
      const newDue = Math.max(0, currentDue - creditAmt);
      const newPaid = (invData.totals?.paid || 0) + creditAmt;
      const newStatus = newDue <= 0 ? "paid" : "partially_paid";

      // Update invoice
      await updateDoc(invRef, {
        "totals.due": newDue,
        "totals.paid": newPaid,
        status: newStatus,
        creditApplied: (invData.creditApplied || 0) + creditAmt,
        updatedAt: serverTimestamp(),
      });

      // Update credit note
      await updateDoc(doc(db, "users", user.uid, "creditNotes", cn.id), {
        status: "applied",
        appliedAt: serverTimestamp(),
        appliedToInvoiceBalance: newDue,
        updatedAt: serverTimestamp(),
      });

      onRefresh();
      alert(
        `Credit note applied. Invoice ${cn.linkedInvoiceNumber} balance reduced to R${fmt(newDue)}.`,
      );
    } finally {
      setApplying(false);
    }
  };

  const handleVoid = async () => {
    if (!window.confirm("Void this credit note? This cannot be undone."))
      return;
    setVoiding(true);
    try {
      await updateDoc(doc(db, "users", user.uid, "creditNotes", cn.id), {
        status: "voided",
        voidedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      onRefresh();
    } finally {
      setVoiding(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-5xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 text-[#64748b] hover:text-[#1e293b] hover:bg-[#f1f5f9] rounded-lg transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-base font-bold text-[#1e293b]">
                {cn.cnNumber}
              </h1>
              <StatusBadge status={cn.status} />
            </div>
            <p className="text-xs text-[#64748b] mt-0.5">
              Issued {fmtDate(cn.dates?.cnDate)}
              {cn.linkedInvoiceNumber &&
                ` · Linked to ${cn.linkedInvoiceNumber}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPreview(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0f172a] hover:bg-[#1e293b] text-white text-xs font-medium rounded-lg transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              Preview
            </button>
            <button
              onClick={onPrint}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-[#e2e8f0] text-[#374151] hover:bg-[#f8fafc] text-xs font-medium rounded-lg transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Print
            </button>
          </div>
        </div>

        {/* Linked invoice status */}
        {linkedInvoice && (
          <div className="px-5 py-4 bg-[#eff6ff] border border-[#bfdbfe] rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link2 className="w-4 h-4 text-[#2563eb]" />
              <div>
                <p className="text-sm font-semibold text-[#1e40af]">
                  Linked to {linkedInvoice.invoiceNumber}
                </p>
                <p className="text-xs text-[#3b82f6] mt-0.5">
                  {linkedInvoice.customer?.name} · Invoice total R
                  {fmt(linkedInvoice.totals?.total)} · Balance due R
                  {fmt(
                    linkedInvoice.totals?.due || linkedInvoice.totals?.total,
                  )}
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-[#2563eb]">
              R{fmt(linkedInvoice.totals?.due || linkedInvoice.totals?.total)}{" "}
              due
            </span>
          </div>
        )}

        {/* KPI summary */}
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              label: "Credit Amount",
              value: `R${fmt(cn.totals?.total)}`,
              icon: DollarSign,
              bg: "bg-[#fef2f2]",
              color: "text-[#dc2626]",
            },
            {
              label: "Subtotal",
              value: `R${fmt(cn.totals?.subtotal)}`,
              icon: FileText,
              bg: "bg-[#f8fafc]",
              color: "text-[#64748b]",
            },
            {
              label: "VAT",
              value: `R${fmt(cn.totals?.tax)}`,
              icon: Receipt,
              bg: "bg-[#fff7ed]",
              color: "text-[#ea580c]",
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

        {/* Detail card */}
        <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
          {/* Client + reason */}
          <div className="grid grid-cols-2 divide-x divide-[#f1f5f9]">
            <div className="p-5">
              <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wide mb-3">
                Client
              </p>
              <p className="text-sm font-semibold text-[#1e293b]">
                {cn.customerName || "—"}
              </p>
              <p className="text-xs text-[#64748b] mt-1">{cn.customerEmail}</p>
              <p className="text-xs text-[#94a3b8] mt-0.5">
                {cn.customerAddress}
              </p>
            </div>
            <div className="p-5">
              <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wide mb-3">
                Reason
              </p>
              <p className="text-sm text-[#374151]">{cn.reason || "—"}</p>
              {cn.notes && (
                <p className="text-xs text-[#94a3b8] mt-2 italic">{cn.notes}</p>
              )}
            </div>
          </div>

          {/* Items */}
          <div className="border-t border-[#f1f5f9]">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#e2e8f0] bg-[#f8fafc]">
                  {["Description", "Rate", "Qty", "VAT", "Total"].map((h) => (
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
                {(cn.items || []).map((it, i) => (
                  <tr
                    key={i}
                    className="border-b border-[#f8fafc] hover:bg-[#f8fafc] transition-colors"
                  >
                    <td className="px-5 py-3 text-sm font-medium text-[#1e293b]">
                      {it.description}
                    </td>
                    <td className="px-5 py-3 text-sm text-[#374151]">
                      R{fmt(it.rate)}
                    </td>
                    <td className="px-5 py-3 text-sm text-[#374151]">
                      {it.qty}
                    </td>
                    <td className="px-5 py-3 text-sm text-[#374151]">
                      R{fmt(it.taxAmount)}
                    </td>
                    <td className="px-5 py-3 text-sm font-semibold text-[#dc2626]">
                      R{fmt(it.totalAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-5 py-3 bg-[#f8fafc] border-t border-[#e2e8f0] flex justify-end">
              <div className="flex flex-col items-end gap-1 text-sm w-52">
                <div className="flex justify-between w-full text-[#64748b]">
                  <span>Subtotal</span>
                  <span className="font-medium">
                    R{fmt(cn.totals?.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between w-full text-[#64748b]">
                  <span>VAT</span>
                  <span className="font-medium">R{fmt(cn.totals?.tax)}</span>
                </div>
                <div className="flex justify-between w-full pt-2 border-t border-[#e2e8f0] font-bold text-[#dc2626]">
                  <span>Credit Total</span>
                  <span>R{fmt(cn.totals?.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        {cn.status !== "voided" && (
          <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm px-5 py-4 flex items-center justify-between">
            <div className="text-sm text-[#64748b]">
              {cn.status === "applied" && (
                <span className="flex items-center gap-1.5 text-[#059669] font-medium">
                  <CheckCircle className="w-4 h-4" />
                  Applied on {fmtDate(cn.appliedAt?.toDate?.() || cn.appliedAt)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {cn.status !== "applied" && (
                <button
                  onClick={handleVoid}
                  disabled={voiding}
                  className="flex items-center gap-1.5 px-4 py-2 border border-[#e2e8f0] text-[#dc2626] hover:bg-[#fef2f2] text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  <Ban className="w-4 h-4" />
                  {voiding ? "Voiding…" : "Void"}
                </button>
              )}
              {cn.status === "issued" && cn.linkedInvoiceId && (
                <button
                  onClick={handleApply}
                  disabled={applying}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#059669] hover:bg-[#047857] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  <ArrowLeftRight className="w-4 h-4" />
                  {applying ? "Applying…" : "Apply to Invoice"}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Preview modal */}
      {showPreview && (
        <PreviewModal
          onClose={() => setShowPreview(false)}
          cnNumber={cn.cnNumber}
          businessInfo={businessInfo}
          cnDate={cn.dates?.cnDate}
          expiryDate={cn.dates?.expiryDate}
          reason={cn.reason}
          customerName={cn.customerName}
          customerEmail={cn.customerEmail}
          customerAddress={cn.customerAddress}
          linkedInvoiceNumber={cn.linkedInvoiceNumber}
          items={cn.items || []}
          subtotal={cn.totals?.subtotal}
          totalTax={cn.totals?.tax}
          total={cn.totals?.total}
          notes={cn.notes}
          status={cn.status}
        />
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PRINTABLE CREDIT NOTE DOCUMENT
// ══════════════════════════════════════════════════════════════════════════════
function CreditNoteDocument({
  businessInfo,
  cnNumber,
  cnDate,
  expiryDate,
  reason,
  customerName,
  customerEmail,
  customerAddress,
  linkedInvoiceNumber,
  items,
  subtotal,
  totalTax,
  total,
  notes,
  status,
}) {
  const bi = businessInfo || {};
  return (
    <div
      style={{
        fontFamily: "sans-serif",
        padding: "40px",
        color: "#1e293b",
        background: "#fff",
        minHeight: "297mm",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "36px",
        }}
      >
        <div>
          {bi.logoUrl && (
            <img
              src={bi.logoUrl}
              alt="logo"
              style={{
                height: "48px",
                marginBottom: "12px",
                objectFit: "contain",
              }}
            />
          )}
          <div style={{ fontSize: "18px", fontWeight: 700, color: "#1e293b" }}>
            {bi.businessName || "Your Business"}
          </div>
          <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
            {bi.addressLine1}
            {bi.addressLine2 ? `, ${bi.addressLine2}` : ""}
          </div>
          <div style={{ fontSize: "12px", color: "#64748b" }}>
            {bi.city}
            {bi.postalCode ? `, ${bi.postalCode}` : ""}
          </div>
          {bi.vatNumber && (
            <div style={{ fontSize: "12px", color: "#64748b" }}>
              VAT: {bi.vatNumber}
            </div>
          )}
        </div>
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              fontSize: "28px",
              fontWeight: 800,
              color: "#dc2626",
              letterSpacing: "-0.5px",
            }}
          >
            CREDIT NOTE
          </div>
          <div
            style={{
              fontSize: "14px",
              fontWeight: 700,
              color: "#374151",
              marginTop: "4px",
            }}
          >
            {cnNumber}
          </div>
          <div style={{ fontSize: "12px", color: "#64748b", marginTop: "8px" }}>
            Date: {fmtDate(cnDate)}
          </div>
          {expiryDate && (
            <div style={{ fontSize: "12px", color: "#64748b" }}>
              Expiry: {fmtDate(expiryDate)}
            </div>
          )}
          {linkedInvoiceNumber && (
            <div
              style={{ fontSize: "12px", color: "#2563eb", marginTop: "4px" }}
            >
              Re Invoice: {linkedInvoiceNumber}
            </div>
          )}
          {status === "applied" && (
            <div
              style={{
                marginTop: "8px",
                display: "inline-block",
                padding: "3px 10px",
                background: "#dcfce7",
                color: "#166534",
                borderRadius: "4px",
                fontSize: "11px",
                fontWeight: 700,
              }}
            >
              APPLIED
            </div>
          )}
          {status === "voided" && (
            <div
              style={{
                marginTop: "8px",
                display: "inline-block",
                padding: "3px 10px",
                background: "#fef2f2",
                color: "#991b1b",
                borderRadius: "4px",
                fontSize: "11px",
                fontWeight: 700,
              }}
            >
              VOIDED
            </div>
          )}
        </div>
      </div>

      {/* Reason banner */}
      {reason && (
        <div
          style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "8px",
            padding: "12px 16px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              fontWeight: 700,
              color: "#991b1b",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "4px",
            }}
          >
            Reason for Credit
          </div>
          <div style={{ fontSize: "13px", color: "#374151" }}>{reason}</div>
        </div>
      )}

      {/* Bill to */}
      <div style={{ marginBottom: "28px" }}>
        <div
          style={{
            fontSize: "11px",
            fontWeight: 700,
            color: "#64748b",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: "6px",
          }}
        >
          Credit Issued To
        </div>
        <div style={{ fontSize: "14px", fontWeight: 600, color: "#1e293b" }}>
          {customerName || "—"}
        </div>
        {customerEmail && (
          <div style={{ fontSize: "12px", color: "#64748b" }}>
            {customerEmail}
          </div>
        )}
        {customerAddress && (
          <div style={{ fontSize: "12px", color: "#64748b" }}>
            {customerAddress}
          </div>
        )}
      </div>

      {/* Items table */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: "24px",
        }}
      >
        <thead>
          <tr
            style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}
          >
            {["Description", "Rate", "Qty", "VAT", "Total"].map((h) => (
              <th
                key={h}
                style={{
                  padding: "10px 12px",
                  textAlign: h === "Description" ? "left" : "right",
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#64748b",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((it, i) => (
            <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
              <td
                style={{
                  padding: "10px 12px",
                  fontSize: "13px",
                  color: "#1e293b",
                }}
              >
                {it.description}
              </td>
              <td
                style={{
                  padding: "10px 12px",
                  fontSize: "13px",
                  color: "#374151",
                  textAlign: "right",
                }}
              >
                R{fmt(it.rate)}
              </td>
              <td
                style={{
                  padding: "10px 12px",
                  fontSize: "13px",
                  color: "#374151",
                  textAlign: "right",
                }}
              >
                {it.qty}
              </td>
              <td
                style={{
                  padding: "10px 12px",
                  fontSize: "13px",
                  color: "#374151",
                  textAlign: "right",
                }}
              >
                R{fmt(it.taxAmount)}
              </td>
              <td
                style={{
                  padding: "10px 12px",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#dc2626",
                  textAlign: "right",
                }}
              >
                R{fmt(it.totalAmount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "28px",
        }}
      >
        <div style={{ width: "220px" }}>
          {[
            ["Subtotal", `R${fmt(subtotal)}`],
            ["VAT", `R${fmt(totalTax)}`],
          ].map(([k, v]) => (
            <div
              key={k}
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "13px",
                color: "#64748b",
                marginBottom: "4px",
              }}
            >
              <span>{k}</span>
              <span>{v}</span>
            </div>
          ))}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "15px",
              fontWeight: 800,
              color: "#dc2626",
              borderTop: "2px solid #e2e8f0",
              paddingTop: "8px",
            }}
          >
            <span>Credit Total</span>
            <span>R{fmt(total)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {notes && (
        <div
          style={{
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            padding: "12px 16px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              fontWeight: 700,
              color: "#64748b",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "4px",
            }}
          >
            Notes
          </div>
          <div style={{ fontSize: "13px", color: "#374151" }}>{notes}</div>
        </div>
      )}

      {/* Footer */}
      <div
        style={{
          borderTop: "1px solid #e2e8f0",
          paddingTop: "20px",
          marginTop: "40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ fontSize: "11px", color: "#94a3b8" }}>
          {bi.businessName} · {bi.email || ""} · {bi.phone || ""}
        </div>
        <div style={{ fontSize: "11px", color: "#94a3b8" }}>
          {bi.vatNumber ? `VAT Reg: ${bi.vatNumber}` : ""}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PREVIEW MODAL
// ══════════════════════════════════════════════════════════════════════════════
function PreviewModal({
  onClose,
  cnNumber,
  businessInfo,
  cnDate,
  expiryDate,
  reason,
  customerName,
  customerEmail,
  customerAddress,
  linkedInvoiceNumber,
  items,
  subtotal,
  totalTax,
  total,
  notes,
  status,
}) {
  // Close on Escape key
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handlePrint = () => {
    const s = document.createElement("style");
    s.textContent = PRINT_STYLES;
    document.head.appendChild(s);
    window.print();
    setTimeout(() => document.head.removeChild(s), 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-y-auto py-8">
      <div className="relative w-full max-w-3xl mx-4">
        {/* Modal toolbar */}
        <div className="flex items-center justify-between bg-[#0f172a] text-white px-5 py-3 rounded-t-xl">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-[#f87171]" />
            <span className="text-sm font-semibold">{cnNumber}</span>
            <StatusBadge status={status} />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-lg transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Print
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Document */}
        <div
          id="cn-print-area"
          className="bg-white rounded-b-xl shadow-2xl overflow-hidden"
        >
          <CreditNoteDocument
            businessInfo={businessInfo}
            cnNumber={cnNumber}
            cnDate={cnDate}
            expiryDate={expiryDate}
            reason={reason}
            customerName={customerName}
            customerEmail={customerEmail}
            customerAddress={customerAddress}
            linkedInvoiceNumber={linkedInvoiceNumber}
            items={items}
            subtotal={subtotal}
            totalTax={totalTax}
            total={total}
            notes={notes}
            status={status}
          />
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SECTION TITLE HELPER
// ══════════════════════════════════════════════════════════════════════════════
function SectionTitle({ icon: Icon, label, color, bg }) {
  return (
    <div className="flex items-center gap-2 mb-1">
      <div
        className={`w-6 h-6 ${bg} rounded-md flex items-center justify-center`}
      >
        <Icon className={`w-3.5 h-3.5 ${color}`} />
      </div>
      <span className="text-sm font-bold text-[#1e293b]">{label}</span>
    </div>
  );
}
