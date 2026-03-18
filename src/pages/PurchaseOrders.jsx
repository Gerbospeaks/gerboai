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
} from "firebase/firestore";
import {
  ShoppingBag,
  Plus,
  Edit2,
  Trash2,
  X,
  Search,
  CheckCircle,
  AlertCircle,
  Clock,
  Send,
  ChevronDown,
  ChevronRight,
  FileText,
  Truck,
  Package,
  DollarSign,
  Users,
  ArrowRight,
  Eye,
  Copy,
  MoreVertical,
  Calendar,
  Hash,
  Building2,
  Check,
  XCircle,
  RefreshCw,
  TrendingUp,
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
const addDays = (d, n) => {
  const dt = new Date(d);
  dt.setDate(dt.getDate() + n);
  return dt.toISOString().split("T")[0];
};

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_META = {
  draft: {
    label: "Draft",
    cls: "bg-[#f1f5f9] text-[#64748b]",
    icon: Clock,
    step: 0,
  },
  pending: {
    label: "Pending Approval",
    cls: "bg-[#fffbeb] text-[#d97706]",
    icon: AlertCircle,
    step: 1,
  },
  approved: {
    label: "Approved",
    cls: "bg-[#f0fdf4] text-[#059669]",
    icon: CheckCircle,
    step: 2,
  },
  sent: {
    label: "Sent to Supplier",
    cls: "bg-[#eff6ff] text-[#2563eb]",
    icon: Send,
    step: 3,
  },
  partial: {
    label: "Partially Received",
    cls: "bg-[#faf5ff] text-[#7c3aed]",
    icon: Package,
    step: 4,
  },
  received: {
    label: "Fully Received",
    cls: "bg-[#f0fdf4] text-[#059669]",
    icon: Truck,
    step: 5,
  },
  billed: {
    label: "Billed",
    cls: "bg-[#eff6ff] text-[#2563eb]",
    icon: FileText,
    step: 6,
  },
  cancelled: {
    label: "Cancelled",
    cls: "bg-[#fef2f2] text-[#dc2626]",
    icon: XCircle,
    step: -1,
  },
};

const PAYMENT_TERMS = [
  { value: 0, label: "Cash on delivery" },
  { value: 7, label: "Net 7 days" },
  { value: 14, label: "Net 14 days" },
  { value: 30, label: "Net 30 days" },
  { value: 60, label: "Net 60 days" },
];

const CATEGORIES = [
  "Raw Materials",
  "Office Supplies",
  "IT Equipment",
  "Machinery",
  "Vehicles",
  "Furniture",
  "Services",
  "Other",
];

// ── Generate PO number ────────────────────────────────────────────────────────
async function generatePONumber(db, uid) {
  const year = new Date().getFullYear();
  const q = query(
    collection(db, "users", uid, "purchaseOrders"),
    orderBy("createdAt", "desc"),
    limit(1),
  );
  const snap = await getDocs(q);
  let last = 1000;
  if (!snap.empty) {
    const match = snap.docs[0].data().poNumber?.match(/(\d+)$/);
    if (match) last = Number(match[1]);
  }
  return `PO-${year}-${String(last + 1).padStart(4, "0")}`;
}

// ── Status badge ──────────────────────────────────────────────────────────────
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

// ── Progress stepper ──────────────────────────────────────────────────────────
const STEPS = ["Draft", "Pending", "Approved", "Sent", "Received", "Billed"];
const POStepper = ({ status }) => {
  const current = STATUS_META[status]?.step ?? 0;
  if (status === "cancelled")
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-[#fef2f2] border border-[#fecaca] rounded-lg">
        <XCircle className="w-4 h-4 text-[#dc2626]" />
        <span className="text-xs font-semibold text-[#dc2626]">Cancelled</span>
      </div>
    );
  return (
    <div className="flex items-center gap-0 overflow-x-auto">
      {STEPS.map((step, i) => (
        <React.Fragment key={step}>
          <div className="flex flex-col items-center flex-shrink-0">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                i < current
                  ? "bg-[#059669] text-white"
                  : i === current
                    ? "bg-[#2563eb] text-white ring-2 ring-[#bfdbfe] ring-offset-1"
                    : "bg-[#e2e8f0] text-[#94a3b8]"
              }`}
            >
              {i < current ? "✓" : i + 1}
            </div>
            <span
              className={`text-[9px] mt-1 font-semibold whitespace-nowrap ${
                i === current
                  ? "text-[#2563eb]"
                  : i < current
                    ? "text-[#059669]"
                    : "text-[#94a3b8]"
              }`}
            >
              {step}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={`h-px w-6 mx-0.5 mb-3 flex-shrink-0 ${i < current ? "bg-[#059669]" : "bg-[#e2e8f0]"}`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT — reads/writes to users/{uid}/purchaseOrders (top-level)
// Props: user
// ══════════════════════════════════════════════════════════════════════════════
export default function PurchaseOrders({ user }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [expanded, setExpanded] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [showGRN, setShowGRN] = useState(null); // PO for GRN
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("orders"); // orders | suppliers | analytics

  const db = getFirestore();

  const blankForm = () => ({
    poNumber: "",
    supplierName: "",
    supplierEmail: "",
    supplierPhone: "",
    supplierAddress: "",
    supplierRef: "",
    orderDate: today(),
    expectedDate: addDays(today(), 14),
    paymentTermsDays: 30,
    deliveryAddress: "",
    notes: "",
    category: "Other",
    items: [
      {
        description: "",
        qty: "",
        unitPrice: "",
        taxRate: "15",
        unit: "units",
        category: "Other",
      },
    ],
  });

  const [form, setForm] = useState(blankForm());
  const [newItem, setNewItem] = useState({
    description: "",
    qty: "",
    unitPrice: "",
    taxRate: "15",
    unit: "units",
    category: "Other",
  });

  // ── Load ──────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const snap = await getDocs(
        query(
          collection(db, "users", user.uid, "purchaseOrders"),
          orderBy("createdAt", "desc"),
        ),
      );
      setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    load();
  }, [load]);

  // ── Item helpers ──────────────────────────────────────────────────────────
  const calcItem = (it) => {
    const qty = Number(it.qty || 0);
    const price = Number(it.unitPrice || 0);
    const taxRate = Number(it.taxRate || 0);
    const amount = qty * price;
    const tax = amount * (taxRate / 100);
    return {
      ...it,
      qty,
      unitPrice: price,
      taxRate,
      amount,
      taxAmount: tax,
      total: amount + tax,
    };
  };

  const formItems = (form.items || []).map(calcItem);
  const subtotal = formItems.reduce((s, i) => s + i.amount, 0);
  const totalTax = formItems.reduce((s, i) => s + i.taxAmount, 0);
  const totalAmount = subtotal + totalTax;

  const handleAddItem = () => {
    if (!newItem.description || !newItem.qty || !newItem.unitPrice) return;
    setForm((p) => ({
      ...p,
      items: [...p.items.filter((i) => i.description), calcItem(newItem)],
    }));
    setNewItem({
      description: "",
      qty: "",
      unitPrice: "",
      taxRate: "15",
      unit: "units",
      category: "Other",
    });
  };

  const updateFormItem = (i, field, value) =>
    setForm((p) => ({
      ...p,
      items: p.items.map((it, idx) =>
        idx === i ? { ...it, [field]: value } : it,
      ),
    }));

  const removeFormItem = (i) =>
    setForm((p) => ({ ...p, items: p.items.filter((_, idx) => idx !== i) }));

  // ── CRUD ──────────────────────────────────────────────────────────────────
  const openAdd = async () => {
    const num = await generatePONumber(db, user.uid);
    setEditing(null);
    setForm({ ...blankForm(), poNumber: num });
    setShowModal(true);
  };

  const openEdit = (po) => {
    setEditing(po);
    setForm({
      poNumber: po.poNumber || "",
      supplierName: po.supplierName || "",
      supplierEmail: po.supplierEmail || "",
      supplierPhone: po.supplierPhone || "",
      supplierAddress: po.supplierAddress || "",
      supplierRef: po.supplierRef || "",
      orderDate: po.orderDate || today(),
      expectedDate: po.expectedDate || addDays(today(), 14),
      paymentTermsDays: po.paymentTermsDays || 30,
      deliveryAddress: po.deliveryAddress || "",
      notes: po.notes || "",
      category: po.category || "Other",
      items: po.items || [],
    });
    setShowModal(true);
  };

  const handleSave = async (status = "draft") => {
    if (!form.supplierName.trim()) {
      alert("Supplier name is required.");
      return;
    }
    if (!form.items.length) {
      alert("Add at least one line item.");
      return;
    }
    setSaving(true);
    try {
      const items = form.items.map(calcItem);
      const sub = items.reduce((s, i) => s + i.amount, 0);
      const tax = items.reduce((s, i) => s + i.taxAmount, 0);
      const payload = {
        ...form,
        items,
        status,
        subtotal: sub,
        totalTax: tax,
        totalAmount: sub + tax,
        updatedAt: serverTimestamp(),
      };
      if (editing) {
        await updateDoc(
          doc(db, "users", user.uid, "purchaseOrders", editing.id),
          payload,
        );
      } else {
        await addDoc(collection(db, "users", user.uid, "purchaseOrders"), {
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

  const handleStatusChange = async (po, newStatus) => {
    await updateDoc(doc(db, "users", user.uid, "purchaseOrders", po.id), {
      status: newStatus,
      [`${newStatus}At`]: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    load();
  };

  const handleDelete = async (po) => {
    if (
      po.status === "approved" ||
      po.status === "sent" ||
      po.status === "received"
    ) {
      alert("Cannot delete an approved or received PO. Cancel it instead.");
      return;
    }
    if (!window.confirm("Delete this purchase order?")) return;
    await deleteDoc(doc(db, "users", user.uid, "purchaseOrders", po.id));
    load();
  };

  const handleDuplicate = async (po) => {
    const num = await generatePONumber(db, user.uid);
    await addDoc(collection(db, "users", user.uid, "purchaseOrders"), {
      ...po,
      id: undefined,
      poNumber: num,
      status: "draft",
      orderDate: today(),
      expectedDate: addDays(today(), 14),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    load();
  };

  // ── GRN (Goods Received Note) ─────────────────────────────────────────────
  const handleGRN = async (po, receivedQtys) => {
    const updatedItems = (po.items || []).map((item, i) => ({
      ...item,
      receivedQty: (item.receivedQty || 0) + Number(receivedQtys[i] || 0),
    }));
    const allReceived = updatedItems.every(
      (it) => (it.receivedQty || 0) >= Number(it.qty || 0),
    );
    const anyReceived = updatedItems.some((it) => (it.receivedQty || 0) > 0);
    const newStatus = allReceived
      ? "received"
      : anyReceived
        ? "partial"
        : po.status;

    await updateDoc(doc(db, "users", user.uid, "purchaseOrders", po.id), {
      items: updatedItems,
      status: newStatus,
      lastGRNDate: today(),
      updatedAt: serverTimestamp(),
    });
    setShowGRN(null);
    load();
  };

  // ── Derived stats ─────────────────────────────────────────────────────────
  const totalValue = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);
  const pendingCount = orders.filter((o) =>
    ["pending", "approved", "sent"].includes(o.status),
  ).length;
  const overdueCount = orders.filter(
    (o) =>
      ["sent", "approved"].includes(o.status) &&
      o.expectedDate &&
      o.expectedDate < today(),
  ).length;

  // ── Filter ────────────────────────────────────────────────────────────────
  const filtered = orders.filter((o) => {
    const q = search.toLowerCase();
    const matchQ =
      o.poNumber?.toLowerCase().includes(q) ||
      o.supplierName?.toLowerCase().includes(q) ||
      o.items?.some((i) => i.description?.toLowerCase().includes(q));
    const matchS = filterStatus === "all" || o.status === filterStatus;
    return matchQ && matchS;
  });

  // ── Build supplier summary ────────────────────────────────────────────────
  const supplierMap = orders.reduce((map, o) => {
    const name = o.supplierName || "Unknown";
    if (!map[name])
      map[name] = { name, orders: 0, totalValue: 0, lastOrder: "" };
    map[name].orders++;
    map[name].totalValue += o.totalAmount || 0;
    if (!map[name].lastOrder || o.orderDate > map[name].lastOrder)
      map[name].lastOrder = o.orderDate;
    return map;
  }, {});
  const suppliers = Object.values(supplierMap).sort(
    (a, b) => b.totalValue - a.totalValue,
  );

  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#fff7ed] rounded-lg flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-[#ea580c]" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#1e293b]">
              Purchase Orders
            </h1>
            <p className="text-xs text-[#64748b]">
              {orders.length} orders · {suppliers.length} suppliers
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-[#f1f5f9] rounded-lg p-0.5">
            {[
              { id: "orders", label: "Orders", icon: ShoppingBag },
              { id: "suppliers", label: "Suppliers", icon: Building2 },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  activeTab === id
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
            className="flex items-center gap-2 px-4 py-2 bg-[#ea580c] hover:bg-[#c2410c] text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New PO
          </button>
        </div>
      </div>

      {/* ── KPI tiles ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: "Total Orders",
            value: orders.length,
            icon: ShoppingBag,
            bg: "bg-[#fff7ed]",
            color: "text-[#ea580c]",
          },
          {
            label: "Pending / Active",
            value: pendingCount,
            icon: Clock,
            bg: pendingCount > 0 ? "bg-[#fffbeb]" : "bg-[#f8fafc]",
            color: pendingCount > 0 ? "text-[#d97706]" : "text-[#64748b]",
          },
          {
            label: "Overdue Delivery",
            value: overdueCount,
            icon: AlertCircle,
            bg: overdueCount > 0 ? "bg-[#fef2f2]" : "bg-[#f8fafc]",
            color: overdueCount > 0 ? "text-[#dc2626]" : "text-[#64748b]",
          },
          {
            label: "Total PO Value",
            value: `R${fmt(totalValue)}`,
            icon: DollarSign,
            bg: "bg-[#eff6ff]",
            color: "text-[#2563eb]",
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

      {/* ── Overdue alert ── */}
      {overdueCount > 0 && (
        <div className="px-5 py-3.5 bg-[#fef2f2] border border-[#fecaca] rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-[#dc2626] flex-shrink-0" />
          <p className="text-sm font-semibold text-[#991b1b]">
            {overdueCount} purchase order{overdueCount !== 1 ? "s are" : " is"}{" "}
            past the expected delivery date.
          </p>
          <button
            onClick={() => setFilterStatus("sent")}
            className="ml-auto text-xs font-semibold text-[#dc2626] underline whitespace-nowrap"
          >
            View overdue
          </button>
        </div>
      )}

      {/* ══ ORDERS TAB ══ */}
      {activeTab === "orders" && (
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-3 items-center bg-white border border-[#e2e8f0] rounded-xl px-4 py-3 shadow-sm">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by PO number, supplier or item…"
                className="w-full pl-9 pr-3 py-2 text-sm border border-[#e2e8f0] rounded-lg bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
              />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {[
                "all",
                "draft",
                "pending",
                "approved",
                "sent",
                "partial",
                "received",
                "billed",
                "cancelled",
              ].map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${
                    filterStatus === s
                      ? "bg-[#ea580c] text-white"
                      : "bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0]"
                  }`}
                >
                  {s === "all" ? "All" : STATUS_META[s]?.label || s}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-16 text-[#94a3b8] text-sm">
              Loading purchase orders…
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white border border-[#e2e8f0] rounded-xl">
              <ShoppingBag className="w-10 h-10 text-[#cbd5e1] mb-3" />
              <p className="text-sm font-medium text-[#94a3b8]">
                No purchase orders found
              </p>
              <p className="text-xs text-[#cbd5e1] mt-1">
                Create your first PO to start tracking procurement
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((po) => {
                const isExp = expanded[po.id];
                const isOver =
                  ["sent", "approved"].includes(po.status) &&
                  po.expectedDate &&
                  po.expectedDate < today();

                return (
                  <div
                    key={po.id}
                    className={`bg-white border rounded-xl shadow-sm overflow-hidden ${
                      isOver
                        ? "border-[#fecaca]"
                        : po.status === "cancelled"
                          ? "border-[#fecaca] opacity-60"
                          : po.status === "received" || po.status === "billed"
                            ? "border-[#bbf7d0]"
                            : "border-[#e2e8f0]"
                    }`}
                  >
                    {/* PO card header */}
                    <div
                      className="px-5 py-4 flex items-center gap-4 cursor-pointer hover:bg-[#f8fafc] transition-colors"
                      onClick={() =>
                        setExpanded((p) => ({ ...p, [po.id]: !p[po.id] }))
                      }
                    >
                      <div className="w-8 h-8 bg-[#fff7ed] rounded-lg flex items-center justify-center flex-shrink-0">
                        {isExp ? (
                          <ChevronDown className="w-4 h-4 text-[#ea580c]" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-[#ea580c]" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-[#ea580c] font-mono">
                            {po.poNumber}
                          </span>
                          <StatusBadge status={po.status} />
                          {isOver && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-[#fef2f2] text-[#dc2626]">
                              <AlertCircle className="w-3 h-3" />
                              Overdue
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-semibold text-[#1e293b] mt-0.5">
                          {po.supplierName}
                        </p>
                        <p className="text-xs text-[#64748b] truncate">
                          {(po.items || [])
                            .slice(0, 3)
                            .map((i) => i.description)
                            .join(", ")}
                          {(po.items || []).length > 3 &&
                            ` +${(po.items || []).length - 3} more`}
                        </p>
                      </div>

                      {/* Dates + amount */}
                      <div className="text-right flex-shrink-0 hidden sm:block">
                        <p className="text-xs text-[#94a3b8]">
                          Ordered {fmtDate(po.orderDate)}
                        </p>
                        <p
                          className={`text-xs mt-0.5 ${isOver ? "text-[#dc2626] font-semibold" : "text-[#64748b]"}`}
                        >
                          Expected {fmtDate(po.expectedDate)}
                        </p>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <p className="text-lg font-black text-[#1e293b]">
                          R{fmt(po.totalAmount)}
                        </p>
                        <p className="text-[10px] text-[#94a3b8] mt-0.5">
                          {(po.items || []).length} line
                          {(po.items || []).length !== 1 ? "s" : ""}
                        </p>
                      </div>

                      {/* Quick actions */}
                      <div
                        className="flex items-center gap-1 flex-shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {po.status === "draft" && (
                          <button
                            onClick={() => handleStatusChange(po, "pending")}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#d97706] hover:bg-[#b45309] text-white text-xs font-semibold rounded-lg transition-colors"
                          >
                            <Send className="w-3 h-3" />
                            Submit
                          </button>
                        )}
                        {po.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleStatusChange(po, "approved")}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#059669] hover:bg-[#047857] text-white text-xs font-semibold rounded-lg transition-colors"
                            >
                              <Check className="w-3 h-3" />
                              Approve
                            </button>
                            <button
                              onClick={() =>
                                handleStatusChange(po, "cancelled")
                              }
                              className="p-1.5 text-[#94a3b8] hover:text-[#dc2626] hover:bg-[#fef2f2] rounded-lg transition-all"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {po.status === "approved" && (
                          <button
                            onClick={() => handleStatusChange(po, "sent")}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-semibold rounded-lg transition-colors"
                          >
                            <Send className="w-3 h-3" />
                            Mark Sent
                          </button>
                        )}
                        {(po.status === "sent" || po.status === "partial") && (
                          <button
                            onClick={() => setShowGRN(po)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-xs font-semibold rounded-lg transition-colors"
                          >
                            <Truck className="w-3 h-3" />
                            Receive
                          </button>
                        )}
                        {po.status === "received" && (
                          <button
                            onClick={() => handleStatusChange(po, "billed")}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-semibold rounded-lg transition-colors"
                          >
                            <FileText className="w-3 h-3" />
                            Mark Billed
                          </button>
                        )}
                        {["draft", "pending"].includes(po.status) && (
                          <button
                            onClick={() => openEdit(po)}
                            className="p-1.5 text-[#94a3b8] hover:text-[#2563eb] hover:bg-[#eff6ff] rounded-lg transition-all"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDuplicate(po)}
                          title="Duplicate PO"
                          className="p-1.5 text-[#94a3b8] hover:text-[#059669] hover:bg-[#f0fdf4] rounded-lg transition-all"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        {["draft", "cancelled"].includes(po.status) && (
                          <button
                            onClick={() => handleDelete(po)}
                            className="p-1.5 text-[#94a3b8] hover:text-[#dc2626] hover:bg-[#fef2f2] rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Expanded PO detail */}
                    {isExp && (
                      <div className="border-t border-[#f1f5f9]">
                        {/* Stepper */}
                        <div className="px-5 py-3 bg-[#f8fafc] border-b border-[#f1f5f9]">
                          <POStepper status={po.status} />
                        </div>

                        {/* Supplier + delivery info */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-[#f1f5f9] border-b border-[#f1f5f9]">
                          {[
                            { label: "Supplier", value: po.supplierName },
                            {
                              label: "Supplier Ref",
                              value: po.supplierRef || "—",
                            },
                            {
                              label: "Payment Terms",
                              value: `Net ${po.paymentTermsDays || 30} days`,
                            },
                            {
                              label: "Delivery Address",
                              value: po.deliveryAddress || "—",
                            },
                          ].map(({ label, value }) => (
                            <div key={label} className="px-5 py-3">
                              <p className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-wide">
                                {label}
                              </p>
                              <p className="text-sm font-medium text-[#374151] mt-0.5 truncate">
                                {value}
                              </p>
                            </div>
                          ))}
                        </div>

                        {/* Line items table */}
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                              {[
                                "Description",
                                "Category",
                                "Unit",
                                "Qty",
                                "Unit Price",
                                "Tax",
                                "Amount",
                                "Received",
                              ].map((h) => (
                                <th
                                  key={h}
                                  className="px-4 py-2.5 text-left font-semibold text-[#64748b] uppercase tracking-wide"
                                >
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {(po.items || []).map((item, i) => {
                              const received = item.receivedQty || 0;
                              const pct =
                                Number(item.qty) > 0
                                  ? (received / Number(item.qty)) * 100
                                  : 0;
                              return (
                                <tr
                                  key={i}
                                  className="border-b border-[#f8fafc] last:border-0 hover:bg-[#f8fafc] transition-colors"
                                >
                                  <td className="px-4 py-3 font-medium text-[#1e293b]">
                                    {item.description}
                                  </td>
                                  <td className="px-4 py-3 text-[#64748b]">
                                    {item.category || "—"}
                                  </td>
                                  <td className="px-4 py-3 text-[#64748b]">
                                    {item.unit || "units"}
                                  </td>
                                  <td className="px-4 py-3 font-semibold text-[#374151]">
                                    {item.qty}
                                  </td>
                                  <td className="px-4 py-3 text-[#374151]">
                                    R{fmt(item.unitPrice)}
                                  </td>
                                  <td className="px-4 py-3 text-[#374151]">
                                    R{fmt(item.taxAmount || 0)}
                                  </td>
                                  <td className="px-4 py-3 font-bold text-[#1e293b]">
                                    R{fmt(item.total || item.amount)}
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                      <div className="w-16 bg-[#f1f5f9] rounded-full h-1.5">
                                        <div
                                          className={`h-1.5 rounded-full ${pct >= 100 ? "bg-[#059669]" : pct > 0 ? "bg-[#d97706]" : "bg-[#e2e8f0]"}`}
                                          style={{
                                            width: `${Math.min(100, pct)}%`,
                                          }}
                                        />
                                      </div>
                                      <span
                                        className={`font-semibold ${pct >= 100 ? "text-[#059669]" : pct > 0 ? "text-[#d97706]" : "text-[#94a3b8]"}`}
                                      >
                                        {received}/{item.qty}
                                      </span>
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
                                className="px-4 py-3 text-xs font-bold text-[#374151] uppercase tracking-wide"
                              >
                                Totals
                              </td>
                              <td className="px-4 py-3 text-xs font-bold text-[#374151]">
                                R{fmt(po.totalTax || 0)}
                              </td>
                              <td className="px-4 py-3 text-sm font-black text-[#1e293b]">
                                R{fmt(po.totalAmount)}
                              </td>
                              <td />
                            </tr>
                          </tfoot>
                        </table>

                        {/* Notes */}
                        {po.notes && (
                          <div className="px-5 py-3 bg-[#fffbeb] border-t border-[#fde68a]">
                            <p className="text-xs text-[#92400e]">
                              <span className="font-semibold">Notes: </span>
                              {po.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ══ SUPPLIERS TAB ══ */}
      {activeTab === "suppliers" && (
        <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 bg-[#f8fafc] border-b border-[#e2e8f0] flex items-center justify-between">
            <span className="text-sm font-semibold text-[#374151]">
              Supplier Summary
            </span>
            <span className="text-xs text-[#64748b]">
              {suppliers.length} suppliers
            </span>
          </div>
          {suppliers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Building2 className="w-10 h-10 text-[#cbd5e1] mb-3" />
              <p className="text-sm font-medium text-[#94a3b8]">
                No suppliers yet
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#e2e8f0]">
                  {[
                    "Supplier",
                    "Orders",
                    "Total Value",
                    "Last Order",
                    "Avg Order",
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
                {suppliers.map((s) => (
                  <tr
                    key={s.name}
                    className="border-b border-[#f8fafc] hover:bg-[#f8fafc] transition-colors"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#fff7ed] rounded-full flex items-center justify-center text-sm font-bold text-[#ea580c]">
                          {s.name[0]?.toUpperCase()}
                        </div>
                        <span className="text-sm font-semibold text-[#1e293b]">
                          {s.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-[#64748b]">
                      {s.orders}
                    </td>
                    <td className="px-5 py-3 text-sm font-bold text-[#1e293b]">
                      R{fmt(s.totalValue)}
                    </td>
                    <td className="px-5 py-3 text-sm text-[#64748b]">
                      {fmtDate(s.lastOrder)}
                    </td>
                    <td className="px-5 py-3 text-sm text-[#64748b]">
                      R{fmt(s.totalValue / s.orders)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ══ GRN MODAL ══ */}
      {showGRN && (
        <GRNModal
          po={showGRN}
          onConfirm={handleGRN}
          onClose={() => setShowGRN(null)}
        />
      )}

      {/* ══ CREATE / EDIT MODAL ══ */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl border border-[#e2e8f0] my-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#fff7ed] rounded-lg flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4 text-[#ea580c]" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-[#1e293b]">
                    {editing ? "Edit Purchase Order" : "New Purchase Order"}
                  </h2>
                  <p className="text-xs text-[#64748b] font-mono">
                    {form.poNumber}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-[#64748b] hover:bg-[#f1f5f9] rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto max-h-[72vh]">
              {/* Supplier */}
              <Section label="Supplier Details">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className={labelCls}>Supplier Name *</label>
                    <input
                      className={inputCls}
                      value={form.supplierName}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, supplierName: e.target.value }))
                      }
                      placeholder="ABC Suppliers (Pty) Ltd"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Email</label>
                    <input
                      type="email"
                      className={inputCls}
                      value={form.supplierEmail}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          supplierEmail: e.target.value,
                        }))
                      }
                      placeholder="orders@supplier.co.za"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Phone</label>
                    <input
                      className={inputCls}
                      value={form.supplierPhone}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          supplierPhone: e.target.value,
                        }))
                      }
                      placeholder="+27 11 000 0000"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Supplier Ref / Account #</label>
                    <input
                      className={inputCls}
                      value={form.supplierRef}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, supplierRef: e.target.value }))
                      }
                      placeholder="Supplier account number"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Supplier Address</label>
                    <input
                      className={inputCls}
                      value={form.supplierAddress}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          supplierAddress: e.target.value,
                        }))
                      }
                      placeholder="Supplier address"
                    />
                  </div>
                </div>
              </Section>

              {/* Order details */}
              <Section label="Order Details">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className={labelCls}>Order Date</label>
                    <input
                      type="date"
                      className={inputCls}
                      value={form.orderDate}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, orderDate: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Expected Delivery</label>
                    <input
                      type="date"
                      className={inputCls}
                      value={form.expectedDate}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, expectedDate: e.target.value }))
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
                  <div>
                    <label className={labelCls}>Category</label>
                    <select
                      className={selectCls}
                      value={form.category}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, category: e.target.value }))
                      }
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2 sm:col-span-4">
                    <label className={labelCls}>Delivery Address</label>
                    <input
                      className={inputCls}
                      value={form.deliveryAddress}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          deliveryAddress: e.target.value,
                        }))
                      }
                      placeholder="Deliver to address (if different from business address)"
                    />
                  </div>
                </div>
              </Section>

              {/* Line items */}
              <Section label="Line Items *">
                {/* Quick add row */}
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
                        placeholder="Item or service description"
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
                      <label className={labelCls}>Unit Price (R)</label>
                      <input
                        type="number"
                        className={inputCls}
                        value={newItem.unitPrice}
                        onChange={(e) =>
                          setNewItem((p) => ({
                            ...p,
                            unitPrice: e.target.value,
                          }))
                        }
                        placeholder="0.00"
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
                        className="flex items-center justify-center gap-1.5 px-3 py-2 bg-[#ea580c] hover:bg-[#c2410c] text-white text-sm font-medium rounded-md transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Add
                      </button>
                    </div>
                  </div>
                </div>

                {/* Items table */}
                {form.items.filter((i) => i.description).length > 0 && (
                  <div className="border border-[#e2e8f0] rounded-xl overflow-hidden">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-[#e2e8f0] bg-[#f8fafc]">
                          {[
                            "Description",
                            "Qty",
                            "Unit Price",
                            "Tax",
                            "Total",
                            "",
                          ].map((h) => (
                            <th
                              key={h}
                              className="px-4 py-2.5 text-left font-semibold text-[#64748b] uppercase tracking-wide"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {form.items
                          .filter((i) => i.description)
                          .map((it, i) => {
                            const c = calcItem(it);
                            return (
                              <tr
                                key={i}
                                className="border-b border-[#f8fafc] hover:bg-[#f8fafc] transition-colors"
                              >
                                <td className="px-4 py-2.5 font-medium text-[#1e293b]">
                                  {it.description}
                                </td>
                                <td className="px-4 py-2.5 text-[#374151]">
                                  {it.qty}
                                </td>
                                <td className="px-4 py-2.5 text-[#374151]">
                                  R{fmt(it.unitPrice)}
                                </td>
                                <td className="px-4 py-2.5 text-[#374151]">
                                  R{fmt(c.taxAmount)}
                                </td>
                                <td className="px-4 py-2.5 font-semibold text-[#1e293b]">
                                  R{fmt(c.total)}
                                </td>
                                <td className="px-4 py-2.5">
                                  <button
                                    onClick={() => removeFormItem(i)}
                                    className="p-1 text-[#94a3b8] hover:text-[#dc2626] rounded transition-all"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                    {/* Totals */}
                    <div className="px-4 py-3 bg-[#f8fafc] border-t border-[#e2e8f0] flex flex-col items-end gap-1 text-sm">
                      {[
                        ["Subtotal", subtotal],
                        ["VAT", totalTax],
                      ].map(([k, v]) => (
                        <div
                          key={k}
                          className="flex justify-between w-44 text-[#64748b]"
                        >
                          <span>{k}</span>
                          <span className="font-medium text-[#374151]">
                            R{fmt(v)}
                          </span>
                        </div>
                      ))}
                      <div className="flex justify-between w-44 pt-1.5 border-t border-[#e2e8f0] font-bold text-[#1e293b]">
                        <span>Total</span>
                        <span className="text-[#ea580c]">
                          R{fmt(totalAmount)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </Section>

              {/* Notes */}
              <div>
                <label className={labelCls}>Notes / Terms</label>
                <textarea
                  className={inputCls}
                  rows={2}
                  value={form.notes}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, notes: e.target.value }))
                  }
                  placeholder="Delivery instructions, special terms, etc."
                />
              </div>
            </div>

            <div className="flex items-center justify-between px-6 py-4 border-t border-[#e2e8f0]">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-[#64748b] hover:bg-[#f1f5f9] rounded-lg transition-colors"
              >
                Cancel
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSave("draft")}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 border border-[#e2e8f0] text-[#374151] hover:bg-[#f8fafc] text-sm font-medium rounded-lg transition-colors disabled:opacity-40"
                >
                  <Clock className="w-4 h-4" />
                  Save Draft
                </button>
                <button
                  onClick={() => handleSave("pending")}
                  disabled={saving || !form.supplierName.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-[#ea580c] hover:bg-[#c2410c] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-40"
                >
                  <Send className="w-4 h-4" />
                  {saving ? "Saving…" : "Submit for Approval"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// GRN MODAL (Goods Received Note)
// ══════════════════════════════════════════════════════════════════════════════
function GRNModal({ po, onConfirm, onClose }) {
  const [qtys, setQtys] = useState(
    (po.items || []).reduce((acc, it, i) => {
      acc[i] = Math.max(0, Number(it.qty || 0) - Number(it.receivedQty || 0));
      return acc;
    }, {}),
  );

  const fmt2 = (n) =>
    Number(n || 0).toLocaleString("en-ZA", { minimumFractionDigits: 2 });

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg border border-[#e2e8f0]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#faf5ff] rounded-lg flex items-center justify-center">
              <Truck className="w-4 h-4 text-[#7c3aed]" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#1e293b]">
                Goods Received Note
              </h2>
              <p className="text-xs text-[#64748b] font-mono">
                {po.poNumber} · {po.supplierName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#64748b] hover:bg-[#f1f5f9] rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-xs text-[#64748b]">
            Enter the quantities received in this delivery. Leave at 0 for items
            not received.
          </p>
          <div className="border border-[#e2e8f0] rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e2e8f0] bg-[#f8fafc]">
                  {[
                    "Item",
                    "Ordered",
                    "Previously Received",
                    "Receiving Now",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-2.5 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(po.items || []).map((item, i) => {
                  const alreadyReceived = Number(item.receivedQty || 0);
                  const outstanding = Number(item.qty || 0) - alreadyReceived;
                  return (
                    <tr
                      key={i}
                      className="border-b border-[#f8fafc] last:border-0"
                    >
                      <td className="px-4 py-3 font-medium text-[#1e293b]">
                        {item.description}
                      </td>
                      <td className="px-4 py-3 text-[#64748b]">{item.qty}</td>
                      <td className="px-4 py-3 text-[#059669]">
                        {alreadyReceived}
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min={0}
                          max={outstanding}
                          value={qtys[i] ?? 0}
                          onChange={(e) =>
                            setQtys((p) => ({ ...p, [i]: e.target.value }))
                          }
                          className="w-20 px-2 py-1 text-sm border border-[#d1d5db] rounded-md bg-white text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#7c3aed]"
                        />
                        {outstanding > 0 && (
                          <span className="ml-2 text-xs text-[#94a3b8]">
                            / {outstanding} outstanding
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#e2e8f0]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-[#64748b] hover:bg-[#f1f5f9] rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(po, qtys)}
            className="flex items-center gap-2 px-4 py-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Truck className="w-4 h-4" />
            Confirm Receipt
          </button>
        </div>
      </div>
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
