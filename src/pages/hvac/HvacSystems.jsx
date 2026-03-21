import React, { useState, useEffect } from "react";
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import {
  Wind,
  Plus,
  Edit2,
  Trash2,
  X,
  Search,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
} from "lucide-react";

const SYSTEM_TYPES = [
  "Split Air Conditioner",
  "Cassette Unit",
  "Ducted System",
  "VRF/VRV System",
  "Chiller",
  "Air Handling Unit",
  "Fan Coil Unit",
  "Packaged Unit",
  "Heat Pump",
  "Evaporative Cooler",
  "Other",
];
const STATUS_OPTIONS = [
  "Active",
  "Needs Service",
  "Under Repair",
  "Decommissioned",
];

const statusConfig = {
  Active: { color: "bg-[#dcfce7] text-[#166534]", icon: CheckCircle },
  "Needs Service": {
    color: "bg-[#fef3c7] text-[#92400e]",
    icon: AlertTriangle,
  },
  "Under Repair": { color: "bg-[#dbeafe] text-[#1e40af]", icon: Clock },
  Decommissioned: { color: "bg-[#fef2f2] text-[#991b1b]", icon: XCircle },
};

const inputCls =
  "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md bg-white text-[#1e293b] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#0891b2] focus:border-[#0891b2] transition-colors";
const labelCls =
  "block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5";
const selectCls =
  "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md bg-white text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#0891b2] focus:border-[#0891b2] transition-colors";

const EMPTY_FORM = {
  type: "Split Air Conditioner",
  brand: "",
  model: "",
  serialNumber: "",
  capacity: "",
  refrigerantType: "",
  clientName: "",
  location: "",
  installDate: "",
  lastServiceDate: "",
  nextServiceDate: "",
  status: "Active",
  notes: "",
};

export default function HvacSystems({ user }) {
  const [systems, setSystems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editingSystem, setEditingSystem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.uid) load();
  }, [user]);

  const load = async () => {
    setLoading(true);
    try {
      const db = getFirestore();
      const snap = await getDocs(
        query(
          collection(db, "users", user.uid, "hvacSystems"),
          orderBy("createdAt", "desc"),
        ),
      );
      setSystems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (_) {}
    setLoading(false);
  };

  const openAdd = () => {
    setEditingSystem(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };
  const openEdit = (s) => {
    setEditingSystem(s);
    setForm({ ...EMPTY_FORM, ...s });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.brand || !form.model)
      return alert("Brand and Model are required");
    setSaving(true);
    try {
      const db = getFirestore();
      const data = { ...form, updatedAt: serverTimestamp() };
      if (editingSystem) {
        await updateDoc(
          doc(db, "users", user.uid, "hvacSystems", editingSystem.id),
          data,
        );
      } else {
        await addDoc(collection(db, "users", user.uid, "hvacSystems"), {
          ...data,
          createdAt: serverTimestamp(),
        });
      }
      setShowModal(false);
      load();
    } catch (_) {
      alert("Error saving system");
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this system?")) return;
    await deleteDoc(doc(getFirestore(), "users", user.uid, "hvacSystems", id));
    load();
  };

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  const filtered = systems.filter((s) => {
    const hit =
      !search ||
      [s.brand, s.model, s.serialNumber, s.clientName, s.location]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase());
    const status = statusFilter === "All" || s.status === statusFilter;
    return hit && status;
  });

  const stats = {
    total: systems.length,
    active: systems.filter((s) => s.status === "Active").length,
    needsService: systems.filter((s) => s.status === "Needs Service").length,
    underRepair: systems.filter((s) => s.status === "Under Repair").length,
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#1e293b]">HVAC Systems</h2>
          <p className="text-xs text-[#64748b] mt-0.5">
            Manage all registered HVAC units
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-[#0891b2] hover:bg-[#0e7490] text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" /> Add System
        </button>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: "Total Systems",
            value: stats.total,
            bg: "bg-[#eff6ff]",
            ic: "text-[#2563eb]",
            val: "text-[#1e293b]",
          },
          {
            label: "Active",
            value: stats.active,
            bg: "bg-[#dcfce7]",
            ic: "text-[#059669]",
            val: "text-[#166534]",
          },
          {
            label: "Needs Service",
            value: stats.needsService,
            bg: "bg-[#fef3c7]",
            ic: "text-[#d97706]",
            val: "text-[#92400e]",
          },
          {
            label: "Under Repair",
            value: stats.underRepair,
            bg: "bg-[#dbeafe]",
            ic: "text-[#2563eb]",
            val: "text-[#1e40af]",
          },
        ].map(({ label, value, bg, ic, val }) => (
          <div
            key={label}
            className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm"
          >
            <div
              className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center mb-2`}
            >
              <Wind className={`w-4 h-4 ${ic}`} />
            </div>
            <p className="text-xs text-[#64748b]">{label}</p>
            <p className={`text-xl font-bold ${val}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by brand, model, serial, client…"
            className="w-full pl-9 pr-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2] bg-white text-[#1e293b] placeholder-[#9ca3af]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-[#d1d5db] rounded-md bg-white text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#0891b2]"
        >
          <option value="All">All Statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* ── Table ── */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-sm text-[#94a3b8]">
            Loading systems…
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Wind className="w-10 h-10 text-[#cbd5e1] mb-3" />
            <p className="text-sm font-medium text-[#374151]">
              No systems found
            </p>
            <p className="text-xs text-[#94a3b8] mb-4">
              Add your first HVAC unit to get started
            </p>
            <button
              onClick={openAdd}
              className="px-4 py-1.5 bg-[#0891b2] hover:bg-[#0e7490] text-white rounded-lg text-xs font-medium transition-colors"
            >
              Add System
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                  {[
                    "System",
                    "Client / Location",
                    "Serial",
                    "Next Service",
                    "Status",
                    "",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wide whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f5f9]">
                {filtered.map((s) => {
                  const cfg = statusConfig[s.status] || statusConfig["Active"];
                  const Icon = cfg.icon;
                  const overdue =
                    s.nextServiceDate && s.nextServiceDate < today;
                  return (
                    <tr
                      key={s.id}
                      className={`hover:bg-[#f8fafc] transition-colors ${overdue ? "bg-[#fffbeb]" : ""}`}
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-[#f0fdfa] rounded-lg flex items-center justify-center flex-shrink-0">
                            <Wind className="w-4 h-4 text-[#0891b2]" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-[#1e293b]">
                              {s.brand} {s.model}
                            </div>
                            <div className="text-xs text-[#64748b]">
                              {s.type}
                              {s.capacity ? ` • ${s.capacity}` : ""}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="text-sm text-[#374151]">
                          {s.clientName || "—"}
                        </div>
                        <div className="text-xs text-[#94a3b8]">
                          {s.location || "—"}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm font-mono text-[#374151]">
                        {s.serialNumber || "—"}
                      </td>
                      <td className="px-5 py-3.5">
                        {s.nextServiceDate ? (
                          <span
                            className={`text-sm font-medium ${overdue ? "text-[#dc2626]" : "text-[#374151]"}`}
                          >
                            {new Date(
                              s.nextServiceDate + "T00:00:00",
                            ).toLocaleDateString("en-ZA", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                            {overdue && (
                              <span className="block text-xs font-bold text-[#dc2626]">
                                OVERDUE
                              </span>
                            )}
                          </span>
                        ) : (
                          <span className="text-sm text-[#94a3b8]">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.color}`}
                        >
                          <Icon className="w-3 h-3" /> {s.status || "Active"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5 justify-end">
                          <button
                            onClick={() => openEdit(s)}
                            className="p-1.5 text-[#64748b] hover:text-[#0891b2] hover:bg-[#f0fdfa] rounded-lg transition-all"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(s.id)}
                            className="p-1.5 text-[#64748b] hover:text-[#dc2626] hover:bg-[#fef2f2] rounded-lg transition-all"
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

      {/* ── Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl my-8 border border-[#e2e8f0]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0] bg-[#f8fafc] rounded-t-xl">
              <div>
                <h2 className="text-sm font-semibold text-[#1e293b]">
                  {editingSystem ? "Edit HVAC System" : "Add HVAC System"}
                </h2>
                <p className="text-xs text-[#64748b] mt-0.5">
                  Fill in the system details below
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-[#64748b] hover:text-[#1e293b] hover:bg-[#e2e8f0] rounded-lg transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className={labelCls}>System Type</label>
                  <select
                    value={form.type}
                    onChange={set("type")}
                    className={selectCls}
                  >
                    {SYSTEM_TYPES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>

                {[
                  {
                    label: "Brand *",
                    key: "brand",
                    placeholder: "e.g. Daikin",
                  },
                  {
                    label: "Model *",
                    key: "model",
                    placeholder: "e.g. FTXS35K",
                  },
                  {
                    label: "Serial Number",
                    key: "serialNumber",
                    placeholder: "e.g. DKN12345XYZ",
                  },
                  {
                    label: "Capacity",
                    key: "capacity",
                    placeholder: "e.g. 3.5kW / 12 000 BTU",
                  },
                  {
                    label: "Refrigerant Type",
                    key: "refrigerantType",
                    placeholder: "e.g. R-32",
                  },
                  {
                    label: "Client Name",
                    key: "clientName",
                    placeholder: "e.g. ABC Property Mgmt",
                  },
                  {
                    label: "Installation Location",
                    key: "location",
                    placeholder: "e.g. Main Office – Reception",
                  },
                  { label: "Install Date", key: "installDate", type: "date" },
                  {
                    label: "Last Service Date",
                    key: "lastServiceDate",
                    type: "date",
                  },
                  {
                    label: "Next Service Date",
                    key: "nextServiceDate",
                    type: "date",
                  },
                ].map(({ label, key, placeholder, type = "text" }) => (
                  <div key={key}>
                    <label className={labelCls}>{label}</label>
                    <input
                      type={type}
                      value={form[key]}
                      onChange={set(key)}
                      placeholder={placeholder}
                      className={inputCls}
                    />
                  </div>
                ))}

                <div>
                  <label className={labelCls}>Status</label>
                  <select
                    value={form.status}
                    onChange={set("status")}
                    className={selectCls}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className={labelCls}>Notes</label>
                  <textarea
                    value={form.notes}
                    onChange={set("notes")}
                    rows={3}
                    placeholder="Any additional notes about this system…"
                    className={`${inputCls} resize-none`}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#e2e8f0] bg-[#f8fafc] rounded-b-xl">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium text-[#374151] bg-[#f1f5f9] hover:bg-[#e2e8f0] rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-white bg-[#0891b2] hover:bg-[#0e7490] rounded-lg transition-colors disabled:opacity-60"
              >
                {saving
                  ? "Saving…"
                  : editingSystem
                    ? "Update System"
                    : "Add System"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
