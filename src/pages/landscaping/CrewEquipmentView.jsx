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
  Users,
  Truck,
  Plus,
  Edit2,
  Trash2,
  X,
  Phone,
  Mail,
  AlertCircle,
  Wrench,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Shovel,
} from "lucide-react";

const inputCls =
  "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md bg-white text-[#1e293b] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-[#059669] transition-colors";
const labelCls =
  "block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5";

// ── Crew constants ──────────────────────────────────────────────────────────
const CREW_ROLES = [
  "Landscaper",
  "Garden Supervisor",
  "Irrigation Technician",
  "Tree Surgeon",
  "Horticulturist",
  "Driver",
  "Labourer",
  "Foreman",
  "Pest Control Tech",
  "Other",
];

const CREW_STATUS = {
  active: { label: "Active", cls: "bg-[#dcfce7] text-[#166534]" },
  "on-leave": { label: "On Leave", cls: "bg-[#fef3c7] text-[#92400e]" },
  inactive: { label: "Inactive", cls: "bg-[#f1f5f9] text-[#64748b]" },
};

const EMPTY_CREW = {
  name: "",
  role: "Landscaper",
  phone: "",
  email: "",
  startDate: "",
  idNumber: "",
  notes: "",
  status: "active",
};

// ── Equipment constants ─────────────────────────────────────────────────────
const EQUIP_TYPES = [
  "Lawn Mower",
  "Ride-On Mower",
  "Chainsaw",
  "Hedge Trimmer",
  "Blower",
  "Brush Cutter",
  "Sprayer",
  "Aerator",
  "Excavator",
  "Chipper/Shredder",
  "Water Pump",
  "Generator",
  "Trailer",
  "Bakkie / Vehicle",
  "Hand Tools",
  "Other",
];

const EQUIP_STATUS = {
  operational: { label: "Operational", cls: "bg-[#dcfce7] text-[#166534]", icon: CheckCircle2 },
  "needs-service": { label: "Needs Service", cls: "bg-[#fef3c7] text-[#92400e]", icon: AlertTriangle },
  "in-repair": { label: "In Repair", cls: "bg-[#dbeafe] text-[#1e40af]", icon: Wrench },
  "out-of-service": { label: "Out of Service", cls: "bg-[#fef2f2] text-[#991b1b]", icon: XCircle },
};

const EMPTY_EQUIP = {
  name: "",
  type: "Lawn Mower",
  serialNumber: "",
  status: "operational",
  lastService: "",
  nextService: "",
  assignedTo: "",
  notes: "",
};

// ── Delete Confirm shared component ─────────────────────────────────────────
function DeleteConfirmModal({ item, label, onConfirm, onCancel, deleting }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
        <div className="w-12 h-12 bg-[#fef2f2] rounded-full flex items-center justify-center mb-4 mx-auto">
          <Trash2 className="w-5 h-5 text-[#dc2626]" />
        </div>
        <h3 className="text-sm font-semibold text-[#1e293b] text-center mb-1">
          Delete {label}
        </h3>
        <p className="text-xs text-[#64748b] text-center mb-5 leading-relaxed">
          Delete{" "}
          <span className="font-semibold text-[#1e293b]">{item?.name}</span>?
          This cannot be undone.
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
// CREW PANEL
// ══════════════════════════════════════════════════════════════════════════════
function CrewPanel({ user }) {
  const [crew, setCrew] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState(EMPTY_CREW);
  const [errors, setErrors] = useState({});

  const db = getFirestore();

  const load = async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const snap = await getDocs(
        query(
          collection(db, "users", user.uid, "crew"),
          orderBy("createdAt", "desc")
        )
      );
      setCrew(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (_) {}
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [user]);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_CREW);
    setErrors({});
    setShowModal(true);
  };

  const openEdit = (m) => {
    setEditing(m);
    setForm({
      name: m.name || "",
      role: m.role || "Landscaper",
      phone: m.phone || "",
      email: m.email || "",
      startDate: m.startDate || "",
      idNumber: m.idNumber || "",
      notes: m.notes || "",
      status: m.status || "active",
    });
    setErrors({});
    setShowModal(true);
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length) return setErrors(e);
    setSaving(true);
    try {
      if (editing) {
        await updateDoc(doc(db, "users", user.uid, "crew", editing.id), {
          ...form, updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, "users", user.uid, "crew"), {
          ...form, createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
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
      await deleteDoc(doc(db, "users", user.uid, "crew", deleteConfirm.id));
      load();
    } catch (_) {
      alert("Failed to delete.");
    } finally {
      setDeleting(false);
      setDeleteConfirm(null);
    }
  };

  const active = crew.filter((c) => c.status === "active").length;

  const avatarInitials = (name) =>
    name
      ?.split(" ")
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "?";

  const avatarBg = [
    "bg-[#059669]", "bg-[#2563eb]", "bg-[#7c3aed]",
    "bg-[#d97706]", "bg-[#dc2626]", "bg-[#0891b2]",
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-[#64748b]">
          {crew.length} members · {active} active
        </p>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#059669] hover:bg-[#047857] text-white text-xs font-medium rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Member
        </button>
      </div>

      {/* Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-36 bg-[#f1f5f9] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : crew.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 text-center bg-white rounded-xl border border-[#e2e8f0]">
          <Users className="w-10 h-10 text-[#cbd5e1] mb-3" />
          <p className="text-sm font-medium text-[#374151] mb-1">No crew members yet</p>
          <p className="text-xs text-[#94a3b8] mb-4">Add your first team member</p>
          <button onClick={openAdd} className="px-4 py-1.5 bg-[#059669] text-white rounded-lg text-xs font-medium">
            Add Member
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {crew.map((m, i) => {
            const sc = CREW_STATUS[m.status] || CREW_STATUS.active;
            const bg = avatarBg[i % avatarBg.length];
            return (
              <div key={m.id} className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="px-4 pt-4 pb-3">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 ${bg} rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                      {avatarInitials(m.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-sm font-bold text-[#1e293b] truncate">{m.name}</h4>
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold flex-shrink-0 ${sc.cls}`}>
                          {sc.label}
                        </span>
                      </div>
                      <p className="text-xs text-[#059669] font-medium mt-0.5">{m.role}</p>
                    </div>
                  </div>

                  <div className="mt-3 space-y-1.5 text-xs text-[#64748b]">
                    {m.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-[#94a3b8]" />
                        <span>{m.phone}</span>
                      </div>
                    )}
                    {m.email && (
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-[#94a3b8]" />
                        <span className="truncate">{m.email}</span>
                      </div>
                    )}
                    {m.startDate && (
                      <div>
                        <span className="text-[#94a3b8]">Joined: </span>
                        <span className="font-medium text-[#374151]">
                          {new Date(m.startDate).toLocaleDateString("en-ZA")}
                        </span>
                      </div>
                    )}
                    {m.notes && <p className="italic text-[#94a3b8] truncate">{m.notes}</p>}
                  </div>
                </div>

                <div className="px-4 pb-3 flex gap-2 border-t border-[#f1f5f9] pt-3">
                  <button onClick={() => openEdit(m)} className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-[#374151] bg-[#f1f5f9] hover:bg-[#e2e8f0] rounded-lg font-medium">
                    <Edit2 className="w-3 h-3" />Edit
                  </button>
                  <button onClick={() => setDeleteConfirm(m)} className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-[#dc2626] bg-[#fef2f2] hover:bg-[#fee2e2] rounded-lg font-medium">
                    <Trash2 className="w-3 h-3" />Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#e2e8f0] bg-[#f8fafc]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-[#f0fdf4] rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4 text-[#059669]" />
                </div>
                <h3 className="text-sm font-semibold text-[#1e293b]">
                  {editing ? "Edit Crew Member" : "Add Crew Member"}
                </h3>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1.5 text-[#64748b] hover:bg-[#e2e8f0] rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className={labelCls}>Full Name *</label>
                  <input
                    value={form.name}
                    onChange={(e) => { setForm((f) => ({ ...f, name: e.target.value })); setErrors((er) => ({ ...er, name: undefined })); }}
                    placeholder="Full name"
                    className={`${inputCls} ${errors.name ? "border-[#dc2626]" : ""}`}
                  />
                  {errors.name && <p className="mt-1 text-xs text-[#dc2626] flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.name}</p>}
                </div>

                <div>
                  <label className={labelCls}>Role</label>
                  <select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} className={inputCls}>
                    {CREW_ROLES.map((r) => <option key={r}>{r}</option>)}
                  </select>
                </div>

                <div>
                  <label className={labelCls}>Status</label>
                  <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} className={inputCls}>
                    {Object.entries(CREW_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>

                <div>
                  <label className={labelCls}>Phone</label>
                  <input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="082 000 0000" className={inputCls} />
                </div>

                <div>
                  <label className={labelCls}>Email</label>
                  <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="email@example.com" className={inputCls} />
                </div>

                <div>
                  <label className={labelCls}>Start Date</label>
                  <input type="date" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} className={inputCls} />
                </div>

                <div>
                  <label className={labelCls}>ID Number</label>
                  <input value={form.idNumber} onChange={(e) => setForm((f) => ({ ...f, idNumber: e.target.value }))} placeholder="SA ID number" className={inputCls} />
                </div>

                <div className="col-span-2">
                  <label className={labelCls}>Notes</label>
                  <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={2} placeholder="Skills, certifications, notes…" className={inputCls} />
                </div>
              </div>
            </div>

            <div className="px-5 py-4 border-t border-[#e2e8f0] flex justify-end gap-2 bg-[#f8fafc]">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-[#374151] bg-[#f1f5f9] hover:bg-[#e2e8f0] rounded-lg font-medium">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm text-white bg-[#059669] hover:bg-[#047857] rounded-lg font-medium disabled:opacity-50">
                {saving ? "Saving…" : editing ? "Update" : "Add Member"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <DeleteConfirmModal
          item={deleteConfirm}
          label="Crew Member"
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
        query(collection(db, "users", user.uid, "equipment"), orderBy("createdAt", "desc"))
      );
      setEquipment(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (_) {}
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [user]);

  const openAdd = () => { setEditing(null); setForm(EMPTY_EQUIP); setErrors({}); setShowModal(true); };
  const openEdit = (e) => {
    setEditing(e);
    setForm({
      name: e.name || "", type: e.type || "Lawn Mower", serialNumber: e.serialNumber || "",
      status: e.status || "operational", lastService: e.lastService || "",
      nextService: e.nextService || "", assignedTo: e.assignedTo || "", notes: e.notes || "",
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
        await updateDoc(doc(db, "users", user.uid, "equipment", editing.id), { ...form, updatedAt: serverTimestamp() });
      } else {
        await addDoc(collection(db, "users", user.uid, "equipment"), { ...form, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      }
      setShowModal(false);
      load();
    } catch (_) { alert("Failed to save."); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      await deleteDoc(doc(db, "users", user.uid, "equipment", deleteConfirm.id));
      load();
    } catch (_) { alert("Failed to delete."); }
    finally { setDeleting(false); setDeleteConfirm(null); }
  };

  const needsServiceSoon = (e) => {
    if (!e.nextService) return false;
    const days = (new Date(e.nextService) - new Date()) / (1000 * 60 * 60 * 24);
    return days <= 14;
  };

  const operational = equipment.filter((e) => e.status === "operational").length;
  const needsAttention = equipment.filter(
    (e) => e.status === "needs-service" || e.status === "in-repair" || e.status === "out-of-service"
  ).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-[#64748b]">
          {equipment.length} items · {operational} operational
          {needsAttention > 0 && (
            <span className="ml-1 text-[#d97706] font-semibold">
              · {needsAttention} need attention
            </span>
          )}
        </p>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#059669] hover:bg-[#047857] text-white text-xs font-medium rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Equipment
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="space-y-px">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 bg-[#f8fafc] animate-pulse" />
            ))}
          </div>
        ) : equipment.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <Truck className="w-10 h-10 text-[#cbd5e1] mb-3" />
            <p className="text-sm font-medium text-[#374151] mb-1">No equipment yet</p>
            <p className="text-xs text-[#94a3b8] mb-4">Add your tools and machinery</p>
            <button onClick={openAdd} className="px-4 py-1.5 bg-[#059669] text-white rounded-lg text-xs font-medium">Add Equipment</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                  {["Equipment", "Type", "Serial No.", "Last Service", "Next Service", "Assigned To", "Status", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f5f9]">
                {equipment.map((e) => {
                  const sc = EQUIP_STATUS[e.status] || EQUIP_STATUS.operational;
                  const StatusIcon = sc.icon;
                  const soon = needsServiceSoon(e);
                  return (
                    <tr key={e.id} className={`hover:bg-[#f8fafc] transition-colors ${soon ? "bg-[#fffbeb]" : ""}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-[#f0fdf4] rounded-lg flex items-center justify-center flex-shrink-0">
                            <Shovel className="w-4 h-4 text-[#059669]" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[#1e293b]">{e.name}</p>
                            {e.notes && <p className="text-xs text-[#94a3b8] truncate max-w-[120px]">{e.notes}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 bg-[#f1f5f9] rounded text-xs font-medium text-[#374151]">{e.type}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-[#64748b]">{e.serialNumber || "—"}</td>
                      <td className="px-4 py-3 text-sm text-[#64748b]">
                        {e.lastService ? new Date(e.lastService).toLocaleDateString("en-ZA") : "—"}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {e.nextService ? (
                          <span className={`font-medium ${soon ? "text-[#d97706]" : "text-[#374151]"}`}>
                            {soon && <AlertTriangle className="w-3 h-3 inline mr-1" />}
                            {new Date(e.nextService).toLocaleDateString("en-ZA")}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#374151]">{e.assignedTo || "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${sc.cls}`}>
                          <StatusIcon className="w-3 h-3" />
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEdit(e)} className="p-1.5 text-[#64748b] hover:text-[#1e293b] hover:bg-[#f1f5f9] rounded-lg transition-colors" title="Edit">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setDeleteConfirm(e)} className="p-1.5 text-[#64748b] hover:text-[#dc2626] hover:bg-[#fef2f2] rounded-lg transition-colors" title="Delete">
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#e2e8f0] bg-[#f8fafc]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-[#f0fdf4] rounded-lg flex items-center justify-center">
                  <Truck className="w-4 h-4 text-[#059669]" />
                </div>
                <h3 className="text-sm font-semibold text-[#1e293b]">
                  {editing ? "Edit Equipment" : "Add Equipment"}
                </h3>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1.5 text-[#64748b] hover:bg-[#e2e8f0] rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className={labelCls}>Equipment Name *</label>
                  <input
                    value={form.name}
                    onChange={(e) => { setForm((f) => ({ ...f, name: e.target.value })); setErrors((er) => ({ ...er, name: undefined })); }}
                    placeholder="e.g. Honda Lawn Mower HRX217"
                    className={`${inputCls} ${errors.name ? "border-[#dc2626]" : ""}`}
                  />
                  {errors.name && <p className="mt-1 text-xs text-[#dc2626] flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.name}</p>}
                </div>

                <div>
                  <label className={labelCls}>Type</label>
                  <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className={inputCls}>
                    {EQUIP_TYPES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>

                <div>
                  <label className={labelCls}>Status</label>
                  <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} className={inputCls}>
                    {Object.entries(EQUIP_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>

                <div>
                  <label className={labelCls}>Serial Number</label>
                  <input value={form.serialNumber} onChange={(e) => setForm((f) => ({ ...f, serialNumber: e.target.value }))} placeholder="Serial / asset no." className={inputCls} />
                </div>

                <div>
                  <label className={labelCls}>Assigned To</label>
                  <input value={form.assignedTo} onChange={(e) => setForm((f) => ({ ...f, assignedTo: e.target.value }))} placeholder="Team member or team" className={inputCls} />
                </div>

                <div>
                  <label className={labelCls}>Last Service Date</label>
                  <input type="date" value={form.lastService} onChange={(e) => setForm((f) => ({ ...f, lastService: e.target.value }))} className={inputCls} />
                </div>

                <div>
                  <label className={labelCls}>Next Service Date</label>
                  <input type="date" value={form.nextService} onChange={(e) => setForm((f) => ({ ...f, nextService: e.target.value }))} className={inputCls} />
                </div>

                <div className="col-span-2">
                  <label className={labelCls}>Notes</label>
                  <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={2} placeholder="Condition notes, fuel type, etc." className={inputCls} />
                </div>
              </div>
            </div>

            <div className="px-5 py-4 border-t border-[#e2e8f0] flex justify-end gap-2 bg-[#f8fafc]">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-[#374151] bg-[#f1f5f9] hover:bg-[#e2e8f0] rounded-lg font-medium">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm text-white bg-[#059669] hover:bg-[#047857] rounded-lg font-medium disabled:opacity-50">
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
// MAIN EXPORT — tabbed container
// ══════════════════════════════════════════════════════════════════════════════
export default function CrewEquipmentView({ user, defaultTab = "crew" }) {
  const [tab, setTab] = useState(defaultTab);

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div>
        <h2 className="text-lg font-bold text-[#1e293b]">Crew & Equipment</h2>
        <p className="text-xs text-[#64748b] mt-0.5">
          Manage your team members and machinery
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#f1f5f9] p-1 rounded-lg w-fit">
        {[
          { key: "crew", label: "Crew Members", icon: Users },
          { key: "equipment", label: "Equipment", icon: Truck },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${
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
      {tab === "crew" ? (
        <CrewPanel user={user} />
      ) : (
        <EquipmentPanel user={user} />
      )}
    </div>
  );
}