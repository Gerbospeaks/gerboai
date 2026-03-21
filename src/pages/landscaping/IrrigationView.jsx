import React, { useState, useEffect } from "react";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import {
  Droplets,
  Plus,
  Edit2,
  Trash2,
  X,
  Search,
  AlertTriangle,
  AlertCircle,
  Wrench,
  CheckCircle2,
  XCircle,
  MapPin,
  Clock,
  BarChart3,
  Zap,
  ChevronDown,
  ChevronRight,
  Calendar,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────
const ZONE_TYPES = [
  "Drip Irrigation",
  "Sprinkler",
  "Micro-spray",
  "Soaker Hose",
  "Flood / Furrow",
  "Subsurface",
  "Other",
];

const CONTROLLER_BRANDS = [
  "Hunter",
  "Rain Bird",
  "Orbit",
  "Toro",
  "Irritrol",
  "Galcon",
  "Netafim",
  "K-Rain",
  "Custom / Other",
];

const EQUIP_TYPES = [
  "Controller / Timer",
  "Pump",
  "Filter",
  "Pressure Regulator",
  "Backflow Preventer",
  "Valve",
  "Sensor (Rain/Soil)",
  "Fertiliser Injector",
  "Other",
];

const EQUIP_STATUS = {
  operational: {
    label: "Operational",
    cls: "bg-[#dcfce7] text-[#166534]",
    icon: CheckCircle2,
  },
  "needs-service": {
    label: "Needs Service",
    cls: "bg-[#fef3c7] text-[#92400e]",
    icon: AlertTriangle,
  },
  "in-repair": {
    label: "In Repair",
    cls: "bg-[#dbeafe] text-[#1e40af]",
    icon: Wrench,
  },
  faulty: {
    label: "Faulty",
    cls: "bg-[#fef2f2] text-[#991b1b]",
    icon: XCircle,
  },
};

const ZONE_STATUS = {
  active: { label: "Active", cls: "bg-[#dcfce7] text-[#166534]" },
  paused: { label: "Paused", cls: "bg-[#fef3c7] text-[#92400e]" },
  fault: { label: "Fault", cls: "bg-[#fef2f2] text-[#991b1b]" },
  inactive: { label: "Inactive", cls: "bg-[#f1f5f9] text-[#64748b]" },
};

const LOG_TYPES = {
  maintenance: {
    label: "Maintenance",
    cls: "bg-[#dbeafe] text-[#1e40af]",
    icon: Wrench,
  },
  usage: {
    label: "Water Usage",
    cls: "bg-[#f0fdfa] text-[#0e7490]",
    icon: Droplets,
  },
  fault: {
    label: "Fault",
    cls: "bg-[#fef2f2] text-[#991b1b]",
    icon: AlertTriangle,
  },
  inspection: {
    label: "Inspection",
    cls: "bg-[#f0fdf4] text-[#166534]",
    icon: CheckCircle2,
  },
};

const inputCls =
  "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md bg-white text-[#1e293b] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-[#059669] transition-colors";
const labelCls =
  "block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5";

// ─── Empty forms ──────────────────────────────────────────────────────────────
const EMPTY_ZONE = {
  name: "",
  property: "",
  type: "Drip Irrigation",
  status: "active",
  area: "",
  flowRate: "",
  scheduledDays: [],
  scheduledTime: "06:00",
  durationMins: "30",
  notes: "",
};

const EMPTY_EQUIP = {
  name: "",
  type: "Controller / Timer",
  brand: "Hunter",
  model: "",
  serialNumber: "",
  property: "",
  status: "operational",
  installDate: "",
  lastService: "",
  nextService: "",
  notes: "",
};

const EMPTY_LOG = {
  date: new Date().toISOString().split("T")[0],
  type: "maintenance",
  zone: "",
  property: "",
  description: "",
  technician: "",
  waterUsageLitres: "",
  cost: "",
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatZAR = (n) =>
  new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(
    Number(n) || 0,
  );

function PillSelector({ options, selected, onChange }) {
  const toggle = (opt) =>
    onChange(
      selected.includes(opt)
        ? selected.filter((o) => o !== opt)
        : [...selected, opt],
    );
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => toggle(opt)}
          className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
            selected.includes(opt)
              ? "bg-[#059669] text-white border-[#059669]"
              : "bg-white text-[#64748b] border-[#d1d5db] hover:border-[#059669] hover:text-[#059669]"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function DeleteConfirmModal({
  item,
  label,
  nameField = "name",
  onConfirm,
  onCancel,
  deleting,
}) {
  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
        <div className="w-12 h-12 bg-[#fef2f2] rounded-full flex items-center justify-center mb-4 mx-auto">
          <Trash2 className="w-5 h-5 text-[#dc2626]" />
        </div>
        <h3 className="text-sm font-semibold text-[#1e293b] text-center mb-1">
          Delete {label}
        </h3>
        <p className="text-xs text-[#64748b] text-center mb-5 leading-relaxed">
          Delete{" "}
          <span className="font-semibold text-[#1e293b]">
            {item?.[nameField]}
          </span>
          ? This cannot be undone.
        </p>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2 text-sm text-[#374151] bg-[#f1f5f9] hover:bg-[#e2e8f0] rounded-lg font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 py-2 text-sm text-white bg-[#dc2626] hover:bg-[#b91c1c] rounded-lg font-medium disabled:opacity-50"
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ZONES PANEL
// ══════════════════════════════════════════════════════════════════════════════
function ZonesPanel({ user }) {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState(EMPTY_ZONE);
  const [errors, setErrors] = useState({});

  const db = getFirestore();

  const load = async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const snap = await getDocs(
        query(
          collection(db, "users", user.uid, "irrigationZones"),
          orderBy("createdAt", "desc"),
        ),
      );
      setZones(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (_) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [user]);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_ZONE);
    setErrors({});
    setShowModal(true);
  };
  const openEdit = (z) => {
    setEditing(z);
    setForm({
      name: z.name || "",
      property: z.property || "",
      type: z.type || "Drip Irrigation",
      status: z.status || "active",
      area: z.area || "",
      flowRate: z.flowRate || "",
      scheduledDays: z.scheduledDays || [],
      scheduledTime: z.scheduledTime || "06:00",
      durationMins: z.durationMins || "30",
      notes: z.notes || "",
    });
    setErrors({});
    setShowModal(true);
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Zone name is required";
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length) return setErrors(e);
    setSaving(true);
    try {
      if (editing) {
        await updateDoc(
          doc(db, "users", user.uid, "irrigationZones", editing.id),
          { ...form, updatedAt: serverTimestamp() },
        );
      } else {
        await addDoc(collection(db, "users", user.uid, "irrigationZones"), {
          ...form,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      setShowModal(false);
      load();
    } catch (_) {
      alert("Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      await deleteDoc(
        doc(db, "users", user.uid, "irrigationZones", deleteConfirm.id),
      );
      load();
    } catch (_) {
      alert("Failed to delete.");
    } finally {
      setDeleting(false);
      setDeleteConfirm(null);
    }
  };

  const filtered = zones.filter((z) =>
    [z.name, z.property, z.type].some((v) =>
      v?.toLowerCase().includes(search.toLowerCase()),
    ),
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search zones, properties…"
            className="w-full pl-9 pr-4 py-2 text-sm border border-[#e2e8f0] rounded-lg bg-white text-[#1e293b] placeholder-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#059669]"
          />
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#059669] hover:bg-[#047857] text-white text-xs font-medium rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Zone
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-52 bg-[#f1f5f9] rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 text-center bg-white rounded-xl border border-[#e2e8f0]">
          <Droplets className="w-10 h-10 text-[#cbd5e1] mb-3" />
          <p className="text-sm font-medium text-[#374151] mb-1">
            {search ? "No matching zones" : "No irrigation zones yet"}
          </p>
          <p className="text-xs text-[#94a3b8] mb-4">
            Add your first zone to get started
          </p>
          {!search && (
            <button
              onClick={openAdd}
              className="px-4 py-1.5 bg-[#059669] text-white rounded-lg text-xs font-medium"
            >
              Add Zone
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((z) => {
            const sc = ZONE_STATUS[z.status] || ZONE_STATUS.active;
            return (
              <div
                key={z.id}
                className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="bg-gradient-to-r from-[#f0fdfa] to-[#f8fafc] px-4 pt-4 pb-3 border-b border-[#e2e8f0]">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 bg-[#ccfbf1] rounded-lg flex items-center justify-center flex-shrink-0">
                        <Droplets className="w-4 h-4 text-[#0891b2]" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-[#1e293b] truncate">
                          {z.name}
                        </h4>
                        <span className="text-xs text-[#0891b2] font-medium">
                          {z.type}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-semibold flex-shrink-0 ${sc.cls}`}
                    >
                      {sc.label}
                    </span>
                  </div>
                </div>

                <div className="px-4 py-3 space-y-2 text-xs text-[#64748b]">
                  {z.property && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-[#94a3b8]" />
                      <span>{z.property}</span>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    {z.area && (
                      <div>
                        <span className="text-[#94a3b8]">Area: </span>
                        <span className="font-medium text-[#374151]">
                          {z.area}
                        </span>
                      </div>
                    )}
                    {z.flowRate && (
                      <div>
                        <span className="text-[#94a3b8]">Flow: </span>
                        <span className="font-medium text-[#374151]">
                          {z.flowRate}
                        </span>
                      </div>
                    )}
                  </div>
                  {z.scheduledDays?.length > 0 && (
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-[#94a3b8]" />
                      <span>
                        {z.scheduledDays.join(", ")} at {z.scheduledTime} ·{" "}
                        {z.durationMins} min
                      </span>
                    </div>
                  )}
                  {z.notes && (
                    <p className="italic text-[#94a3b8] line-clamp-2">
                      {z.notes}
                    </p>
                  )}
                </div>

                <div className="px-4 pb-3 flex gap-2 border-t border-[#f1f5f9] pt-3">
                  <button
                    onClick={() => openEdit(z)}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-[#374151] bg-[#f1f5f9] hover:bg-[#e2e8f0] rounded-lg font-medium"
                  >
                    <Edit2 className="w-3 h-3" />
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(z)}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-[#dc2626] bg-[#fef2f2] hover:bg-[#fee2e2] rounded-lg font-medium"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Zone Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#e2e8f0] bg-[#f8fafc] flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-[#f0fdfa] rounded-lg flex items-center justify-center">
                  <Droplets className="w-4 h-4 text-[#0891b2]" />
                </div>
                <h3 className="text-sm font-semibold text-[#1e293b]">
                  {editing ? "Edit Zone" : "Add Irrigation Zone"}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-[#64748b] hover:bg-[#e2e8f0] rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className={labelCls}>Zone Name *</label>
                  <input
                    value={form.name}
                    onChange={(e) => {
                      setForm((f) => ({ ...f, name: e.target.value }));
                      setErrors((er) => ({ ...er, name: undefined }));
                    }}
                    placeholder="e.g. Front Lawn Zone A"
                    className={`${inputCls} ${errors.name ? "border-[#dc2626]" : ""}`}
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-[#dc2626] flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className={labelCls}>Zone Type</label>
                  <select
                    value={form.type}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, type: e.target.value }))
                    }
                    className={inputCls}
                  >
                    {ZONE_TYPES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelCls}>Status</label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, status: e.target.value }))
                    }
                    className={inputCls}
                  >
                    {Object.entries(ZONE_STATUS).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className={labelCls}>Property / Site</label>
                  <input
                    value={form.property}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, property: e.target.value }))
                    }
                    placeholder="Property name or address"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>Coverage Area</label>
                  <input
                    value={form.area}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, area: e.target.value }))
                    }
                    placeholder="e.g. 120 sqm"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>Flow Rate</label>
                  <input
                    value={form.flowRate}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, flowRate: e.target.value }))
                    }
                    placeholder="e.g. 4 L/min"
                    className={inputCls}
                  />
                </div>

                <div className="col-span-2">
                  <label className={labelCls}>Scheduled Days</label>
                  <div className="mt-1">
                    <PillSelector
                      options={DAYS}
                      selected={form.scheduledDays}
                      onChange={(v) =>
                        setForm((f) => ({ ...f, scheduledDays: v }))
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Start Time</label>
                  <input
                    type="time"
                    value={form.scheduledTime}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, scheduledTime: e.target.value }))
                    }
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>Duration (minutes)</label>
                  <input
                    type="number"
                    min="1"
                    value={form.durationMins}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, durationMins: e.target.value }))
                    }
                    placeholder="30"
                    className={inputCls}
                  />
                </div>

                <div className="col-span-2">
                  <label className={labelCls}>Notes</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, notes: e.target.value }))
                    }
                    rows={2}
                    placeholder="Valve location, pipe size, special notes…"
                    className={inputCls}
                  />
                </div>
              </div>
            </div>

            <div className="px-5 py-4 border-t border-[#e2e8f0] flex justify-end gap-2 bg-[#f8fafc] flex-shrink-0">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-[#374151] bg-[#f1f5f9] hover:bg-[#e2e8f0] rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 text-sm text-white bg-[#059669] hover:bg-[#047857] rounded-lg font-medium disabled:opacity-50"
              >
                {saving ? "Saving…" : editing ? "Update Zone" : "Add Zone"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <DeleteConfirmModal
          item={deleteConfirm}
          label="Zone"
          onConfirm={handleDelete}
          onCancel={() => setDeleteConfirm(null)}
          deleting={deleting}
        />
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// EQUIPMENT PANEL
// ══════════════════════════════════════════════════════════════════════════════
function EquipmentPanel({ user }) {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState(EMPTY_EQUIP);
  const [errors, setErrors] = useState({});

  const db = getFirestore();

  const load = async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const snap = await getDocs(
        query(
          collection(db, "users", user.uid, "irrigationEquipment"),
          orderBy("createdAt", "desc"),
        ),
      );
      setEquipment(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (_) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [user]);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_EQUIP);
    setErrors({});
    setShowModal(true);
  };
  const openEdit = (e) => {
    setEditing(e);
    setForm({
      name: e.name || "",
      type: e.type || "Controller / Timer",
      brand: e.brand || "Hunter",
      model: e.model || "",
      serialNumber: e.serialNumber || "",
      property: e.property || "",
      status: e.status || "operational",
      installDate: e.installDate || "",
      lastService: e.lastService || "",
      nextService: e.nextService || "",
      notes: e.notes || "",
    });
    setErrors({});
    setShowModal(true);
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Equipment name is required";
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length) return setErrors(e);
    setSaving(true);
    try {
      if (editing) {
        await updateDoc(
          doc(db, "users", user.uid, "irrigationEquipment", editing.id),
          { ...form, updatedAt: serverTimestamp() },
        );
      } else {
        await addDoc(collection(db, "users", user.uid, "irrigationEquipment"), {
          ...form,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      setShowModal(false);
      load();
    } catch (_) {
      alert("Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      await deleteDoc(
        doc(db, "users", user.uid, "irrigationEquipment", deleteConfirm.id),
      );
      load();
    } catch (_) {
      alert("Failed to delete.");
    } finally {
      setDeleting(false);
      setDeleteConfirm(null);
    }
  };

  const needsServiceSoon = (e) => {
    if (!e.nextService) return false;
    return (new Date(e.nextService) - new Date()) / (1000 * 60 * 60 * 24) <= 14;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-[#64748b]">
          {equipment.length} items ·{" "}
          {equipment.filter((e) => e.status === "operational").length}{" "}
          operational
        </p>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#059669] hover:bg-[#047857] text-white text-xs font-medium rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Equipment
        </button>
      </div>

      <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="space-y-px">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 bg-[#f8fafc] animate-pulse" />
            ))}
          </div>
        ) : equipment.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <Zap className="w-10 h-10 text-[#cbd5e1] mb-3" />
            <p className="text-sm font-medium text-[#374151] mb-1">
              No equipment yet
            </p>
            <p className="text-xs text-[#94a3b8] mb-4">
              Track your controllers, pumps and sensors
            </p>
            <button
              onClick={openAdd}
              className="px-4 py-1.5 bg-[#059669] text-white rounded-lg text-xs font-medium"
            >
              Add Equipment
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                  {[
                    "Equipment",
                    "Type",
                    "Brand/Model",
                    "Property",
                    "Last Service",
                    "Next Service",
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
              <tbody className="divide-y divide-[#f1f5f9]">
                {equipment.map((e) => {
                  const sc = EQUIP_STATUS[e.status] || EQUIP_STATUS.operational;
                  const StatusIcon = sc.icon;
                  const soon = needsServiceSoon(e);
                  return (
                    <tr
                      key={e.id}
                      className={`hover:bg-[#f8fafc] transition-colors ${soon ? "bg-[#fffbeb]" : ""}`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-[#f0fdfa] rounded-lg flex items-center justify-center flex-shrink-0">
                            <Zap className="w-4 h-4 text-[#0891b2]" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[#1e293b]">
                              {e.name}
                            </p>
                            {e.serialNumber && (
                              <p className="text-xs text-[#94a3b8]">
                                S/N: {e.serialNumber}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 bg-[#f1f5f9] rounded text-xs font-medium text-[#374151]">
                          {e.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-[#374151]">
                        {[e.brand, e.model].filter(Boolean).join(" · ") || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#374151]">
                        {e.property || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#64748b]">
                        {e.lastService
                          ? new Date(e.lastService).toLocaleDateString("en-ZA")
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {e.nextService ? (
                          <span
                            className={`font-medium ${soon ? "text-[#d97706]" : "text-[#374151]"}`}
                          >
                            {soon && (
                              <AlertTriangle className="w-3 h-3 inline mr-1" />
                            )}
                            {new Date(e.nextService).toLocaleDateString(
                              "en-ZA",
                            )}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${sc.cls}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button
                            onClick={() => openEdit(e)}
                            className="p-1.5 text-[#64748b] hover:bg-[#f1f5f9] rounded-lg"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(e)}
                            className="p-1.5 text-[#64748b] hover:text-[#dc2626] hover:bg-[#fef2f2] rounded-lg"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Equipment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#e2e8f0] bg-[#f8fafc] flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-[#f0fdfa] rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-[#0891b2]" />
                </div>
                <h3 className="text-sm font-semibold text-[#1e293b]">
                  {editing ? "Edit Equipment" : "Add Equipment"}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-[#64748b] hover:bg-[#e2e8f0] rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className={labelCls}>Equipment Name *</label>
                  <input
                    value={form.name}
                    onChange={(e) => {
                      setForm((f) => ({ ...f, name: e.target.value }));
                      setErrors((er) => ({ ...er, name: undefined }));
                    }}
                    placeholder="e.g. Main Controller Unit 1"
                    className={`${inputCls} ${errors.name ? "border-[#dc2626]" : ""}`}
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-[#dc2626] flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.name}
                    </p>
                  )}
                </div>
                <div>
                  <label className={labelCls}>Equipment Type</label>
                  <select
                    value={form.type}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, type: e.target.value }))
                    }
                    className={inputCls}
                  >
                    {EQUIP_TYPES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Status</label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, status: e.target.value }))
                    }
                    className={inputCls}
                  >
                    {Object.entries(EQUIP_STATUS).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Brand</label>
                  <select
                    value={form.brand}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, brand: e.target.value }))
                    }
                    className={inputCls}
                  >
                    {CONTROLLER_BRANDS.map((b) => (
                      <option key={b}>{b}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Model</label>
                  <input
                    value={form.model}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, model: e.target.value }))
                    }
                    placeholder="Model number"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Serial Number</label>
                  <input
                    value={form.serialNumber}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, serialNumber: e.target.value }))
                    }
                    placeholder="Serial / asset no."
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Property / Site</label>
                  <input
                    value={form.property}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, property: e.target.value }))
                    }
                    placeholder="Where installed"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Install Date</label>
                  <input
                    type="date"
                    value={form.installDate}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, installDate: e.target.value }))
                    }
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Last Service</label>
                  <input
                    type="date"
                    value={form.lastService}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, lastService: e.target.value }))
                    }
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Next Service</label>
                  <input
                    type="date"
                    value={form.nextService}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, nextService: e.target.value }))
                    }
                    className={inputCls}
                  />
                </div>
                <div className="col-span-2">
                  <label className={labelCls}>Notes</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, notes: e.target.value }))
                    }
                    rows={2}
                    placeholder="Configuration, zone count, wiring notes…"
                    className={inputCls}
                  />
                </div>
              </div>
            </div>

            <div className="px-5 py-4 border-t border-[#e2e8f0] flex justify-end gap-2 bg-[#f8fafc] flex-shrink-0">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-[#374151] bg-[#f1f5f9] hover:bg-[#e2e8f0] rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 text-sm text-white bg-[#059669] hover:bg-[#047857] rounded-lg font-medium disabled:opacity-50"
              >
                {saving ? "Saving…" : editing ? "Update" : "Add Equipment"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <DeleteConfirmModal
          item={deleteConfirm}
          label="Equipment"
          onConfirm={handleDelete}
          onCancel={() => setDeleteConfirm(null)}
          deleting={deleting}
        />
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// LOGS PANEL
// ══════════════════════════════════════════════════════════════════════════════
function LogsPanel({ user }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState(EMPTY_LOG);
  const [errors, setErrors] = useState({});
  const [filterType, setFilterType] = useState("all");

  const db = getFirestore();

  const load = async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const snap = await getDocs(
        query(
          collection(db, "users", user.uid, "irrigationLogs"),
          orderBy("date", "desc"),
        ),
      );
      setLogs(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (_) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [user]);

  const openAdd = () => {
    setEditing(null);
    setForm({ ...EMPTY_LOG, date: new Date().toISOString().split("T")[0] });
    setErrors({});
    setShowModal(true);
  };
  const openEdit = (l) => {
    setEditing(l);
    setForm({
      date: l.date || "",
      type: l.type || "maintenance",
      zone: l.zone || "",
      property: l.property || "",
      description: l.description || "",
      technician: l.technician || "",
      waterUsageLitres: l.waterUsageLitres ?? "",
      cost: l.cost ?? "",
    });
    setErrors({});
    setShowModal(true);
  };

  const validate = () => {
    const e = {};
    if (!form.description.trim()) e.description = "Description is required";
    if (!form.date) e.date = "Date is required";
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length) return setErrors(e);
    setSaving(true);
    const payload = {
      ...form,
      waterUsageLitres:
        form.waterUsageLitres !== "" ? Number(form.waterUsageLitres) : null,
      cost: form.cost !== "" ? Number(form.cost) : null,
    };
    try {
      if (editing) {
        await updateDoc(
          doc(db, "users", user.uid, "irrigationLogs", editing.id),
          { ...payload, updatedAt: serverTimestamp() },
        );
      } else {
        await addDoc(collection(db, "users", user.uid, "irrigationLogs"), {
          ...payload,
          createdAt: serverTimestamp(),
        });
      }
      setShowModal(false);
      load();
    } catch (_) {
      alert("Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      await deleteDoc(
        doc(db, "users", user.uid, "irrigationLogs", deleteConfirm.id),
      );
      load();
    } catch (_) {
      alert("Failed to delete.");
    } finally {
      setDeleting(false);
      setDeleteConfirm(null);
    }
  };

  const filtered =
    filterType === "all" ? logs : logs.filter((l) => l.type === filterType);

  const totalWater = logs
    .filter((l) => l.type === "usage" && l.waterUsageLitres)
    .reduce((s, l) => s + Number(l.waterUsageLitres), 0);
  const totalMaintCost = logs
    .filter((l) => l.cost)
    .reduce((s, l) => s + Number(l.cost), 0);

  return (
    <div className="space-y-4">
      {/* Summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "Total Logs",
            value: logs.length,
            color: "text-[#1e293b]",
            bg: "bg-[#f0fdfa]",
            icon: Calendar,
            ic: "text-[#0891b2]",
          },
          {
            label: "Maintenance",
            value: logs.filter((l) => l.type === "maintenance").length,
            color: "text-[#1e40af]",
            bg: "bg-[#dbeafe]",
            icon: Wrench,
            ic: "text-[#1e40af]",
          },
          {
            label: "Water Logged",
            value: `${totalWater.toLocaleString()} L`,
            color: "text-[#0891b2]",
            bg: "bg-[#f0fdfa]",
            icon: Droplets,
            ic: "text-[#0891b2]",
          },
          {
            label: "Maint. Costs",
            value: formatZAR(totalMaintCost),
            color: "text-[#059669]",
            bg: "bg-[#f0fdf4]",
            icon: BarChart3,
            ic: "text-[#059669]",
          },
        ].map(({ label, value, color, bg, icon: Icon, ic }) => (
          <div
            key={label}
            className="bg-white border border-[#e2e8f0] rounded-xl p-3 shadow-sm"
          >
            <div
              className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center mb-2`}
            >
              <Icon className={`w-4 h-4 ${ic}`} />
            </div>
            <p className="text-xs text-[#64748b] mb-0.5">{label}</p>
            <p className={`text-sm font-bold ${color} truncate`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        {/* Filter pills */}
        <div className="flex gap-1 bg-[#f1f5f9] p-1 rounded-lg">
          {[
            { key: "all", label: "All" },
            ...Object.entries(LOG_TYPES).map(([k, v]) => ({
              key: k,
              label: v.label,
            })),
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilterType(key)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${filterType === key ? "bg-white text-[#1e293b] shadow-sm" : "text-[#64748b] hover:text-[#374151]"}`}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#059669] hover:bg-[#047857] text-white text-xs font-medium rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Log
        </button>
      </div>

      {/* Log timeline */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 bg-[#f1f5f9] rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 text-center bg-white rounded-xl border border-[#e2e8f0]">
          <BarChart3 className="w-10 h-10 text-[#cbd5e1] mb-3" />
          <p className="text-sm font-medium text-[#374151] mb-1">No logs yet</p>
          <p className="text-xs text-[#94a3b8] mb-4">
            Start logging maintenance, water usage and faults
          </p>
          <button
            onClick={openAdd}
            className="px-4 py-1.5 bg-[#059669] text-white rounded-lg text-xs font-medium"
          >
            Add First Log
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((l) => {
            const lc = LOG_TYPES[l.type] || LOG_TYPES.maintenance;
            const LogIcon = lc.icon;
            return (
              <div
                key={l.id}
                className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-0">
                  {/* Left color bar */}
                  <div
                    className={`w-1 self-stretch flex-shrink-0 ${
                      l.type === "maintenance"
                        ? "bg-[#2563eb]"
                        : l.type === "usage"
                          ? "bg-[#0891b2]"
                          : l.type === "fault"
                            ? "bg-[#dc2626]"
                            : "bg-[#059669]"
                    }`}
                  />

                  <div className="flex-1 flex items-start justify-between gap-4 px-4 py-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${lc.cls}`}
                      >
                        <LogIcon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center flex-wrap gap-2 mb-0.5">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-semibold ${lc.cls}`}
                          >
                            {lc.label}
                          </span>
                          {l.zone && (
                            <span className="text-xs text-[#64748b]">
                              Zone: {l.zone}
                            </span>
                          )}
                          {l.property && (
                            <span className="flex items-center gap-1 text-xs text-[#64748b]">
                              <MapPin className="w-3 h-3" />
                              {l.property}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-[#1e293b] leading-relaxed">
                          {l.description}
                        </p>
                        <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1 text-xs text-[#94a3b8]">
                          {l.technician && <span>By: {l.technician}</span>}
                          {l.waterUsageLitres && (
                            <span className="text-[#0891b2] font-medium">
                              {Number(l.waterUsageLitres).toLocaleString()} L
                            </span>
                          )}
                          {l.cost && (
                            <span className="text-[#059669] font-medium">
                              {formatZAR(l.cost)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-[#94a3b8] whitespace-nowrap">
                        {l.date
                          ? new Date(l.date + "T00:00:00").toLocaleDateString(
                              "en-ZA",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )
                          : ""}
                      </span>
                      <button
                        onClick={() => openEdit(l)}
                        className="p-1.5 text-[#64748b] hover:bg-[#f1f5f9] rounded-lg"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(l)}
                        className="p-1.5 text-[#64748b] hover:text-[#dc2626] hover:bg-[#fef2f2] rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Log Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#e2e8f0] bg-[#f8fafc] flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-[#f0fdfa] rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-[#0891b2]" />
                </div>
                <h3 className="text-sm font-semibold text-[#1e293b]">
                  {editing ? "Edit Log" : "Add Log Entry"}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-[#64748b] hover:bg-[#e2e8f0] rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Log Type</label>
                  <select
                    value={form.type}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, type: e.target.value }))
                    }
                    className={inputCls}
                  >
                    {Object.entries(LOG_TYPES).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Date *</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => {
                      setForm((f) => ({ ...f, date: e.target.value }));
                      setErrors((er) => ({ ...er, date: undefined }));
                    }}
                    className={`${inputCls} ${errors.date ? "border-[#dc2626]" : ""}`}
                  />
                  {errors.date && (
                    <p className="mt-1 text-xs text-[#dc2626] flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.date}
                    </p>
                  )}
                </div>

                <div>
                  <label className={labelCls}>Zone</label>
                  <input
                    value={form.zone}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, zone: e.target.value }))
                    }
                    placeholder="Zone name"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Property / Site</label>
                  <input
                    value={form.property}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, property: e.target.value }))
                    }
                    placeholder="Property name"
                    className={inputCls}
                  />
                </div>

                <div className="col-span-2">
                  <label className={labelCls}>Description *</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => {
                      setForm((f) => ({ ...f, description: e.target.value }));
                      setErrors((er) => ({ ...er, description: undefined }));
                    }}
                    rows={3}
                    placeholder="What was done / observed / measured…"
                    className={`${inputCls} ${errors.description ? "border-[#dc2626]" : ""}`}
                  />
                  {errors.description && (
                    <p className="mt-1 text-xs text-[#dc2626] flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.description}
                    </p>
                  )}
                </div>

                <div>
                  <label className={labelCls}>Technician</label>
                  <input
                    value={form.technician}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, technician: e.target.value }))
                    }
                    placeholder="Who performed the work"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Cost (R)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.cost}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, cost: e.target.value }))
                    }
                    placeholder="0.00"
                    className={inputCls}
                  />
                </div>

                {form.type === "usage" && (
                  <div className="col-span-2">
                    <label className={labelCls}>Water Usage (Litres)</label>
                    <input
                      type="number"
                      min="0"
                      value={form.waterUsageLitres}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          waterUsageLitres: e.target.value,
                        }))
                      }
                      placeholder="e.g. 2500"
                      className={inputCls}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="px-5 py-4 border-t border-[#e2e8f0] flex justify-end gap-2 bg-[#f8fafc] flex-shrink-0">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-[#374151] bg-[#f1f5f9] hover:bg-[#e2e8f0] rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 text-sm text-white bg-[#059669] hover:bg-[#047857] rounded-lg font-medium disabled:opacity-50"
              >
                {saving ? "Saving…" : editing ? "Update Log" : "Add Log"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <DeleteConfirmModal
          item={deleteConfirm}
          label="Log Entry"
          nameField="description"
          onConfirm={handleDelete}
          onCancel={() => setDeleteConfirm(null)}
          deleting={deleting}
        />
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN EXPORT — 3-tab container
// ══════════════════════════════════════════════════════════════════════════════
export default function IrrigationView({ user, defaultTab = "zones" }) {
  const [tab, setTab] = useState(defaultTab);

  const TABS = [
    { key: "zones", label: "Zones", icon: Droplets },
    { key: "equipment", label: "Equipment & Controllers", icon: Zap },
    { key: "logs", label: "Water & Maintenance Logs", icon: BarChart3 },
  ];

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div>
        <h2 className="text-lg font-bold text-[#1e293b]">Irrigation</h2>
        <p className="text-xs text-[#64748b] mt-0.5">
          Manage zones, equipment, water usage and maintenance history
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#f1f5f9] p-1 rounded-xl overflow-x-auto">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
              tab === key
                ? "bg-white text-[#1e293b] shadow-sm"
                : "text-[#64748b] hover:text-[#374151]"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Panel */}
      {tab === "zones" && <ZonesPanel user={user} />}
      {tab === "equipment" && <EquipmentPanel user={user} />}
      {tab === "logs" && <LogsPanel user={user} />}
    </div>
  );
}
