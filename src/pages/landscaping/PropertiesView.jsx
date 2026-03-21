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
  MapPin,
  Plus,
  Edit2,
  Trash2,
  X,
  Home,
  Building2,
  Leaf,
  Search,
  AlertCircle,
} from "lucide-react";

const inputCls =
  "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md bg-white text-[#1e293b] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-[#059669] transition-colors";
const labelCls =
  "block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5";

const PROPERTY_TYPES = [
  "Residential Garden",
  "Commercial Landscape",
  "Estate / Complex",
  "Corporate Campus",
  "Sports Facility",
  "Public Park",
  "Other",
];

const EMPTY_FORM = {
  name: "",
  type: "Residential Garden",
  address: "",
  size: "",
  clientName: "",
  accessDetails: "",
  notes: "",
  status: "active",
};

export default function PropertiesView({ user }) {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const db = getFirestore();

  const load = async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const snap = await getDocs(
        query(
          collection(db, "users", user.uid, "properties"),
          orderBy("createdAt", "desc"),
        ),
      );
      setProperties(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
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
    setForm(EMPTY_FORM);
    setErrors({});
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      name: p.name || "",
      type: p.type || "Residential Garden",
      address: p.address || "",
      size: p.size || "",
      clientName: p.clientName || "",
      accessDetails: p.accessDetails || "",
      notes: p.notes || "",
      status: p.status || "active",
    });
    setErrors({});
    setShowModal(true);
  };

  const validate = () => {
    const e = {};
    if (!form.address.trim()) e.address = "Address is required";
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length) return setErrors(e);
    setSaving(true);
    try {
      if (editing) {
        await updateDoc(doc(db, "users", user.uid, "properties", editing.id), {
          ...form,
          updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, "users", user.uid, "properties"), {
          ...form,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      setShowModal(false);
      load();
    } catch (_) {
      alert("Failed to save property. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      await deleteDoc(
        doc(db, "users", user.uid, "properties", deleteConfirm.id),
      );
      load();
    } catch (_) {
      alert("Failed to delete. Please try again.");
    } finally {
      setDeleting(false);
      setDeleteConfirm(null);
    }
  };

  const filtered = properties.filter((p) =>
    [p.name, p.address, p.clientName, p.type].some((v) =>
      v?.toLowerCase().includes(search.toLowerCase()),
    ),
  );

  const typeIcon = (type) => {
    if (type?.includes("Commercial") || type?.includes("Corporate"))
      return Building2;
    if (type?.includes("Park") || type?.includes("Estate")) return Leaf;
    return Home;
  };

  const statusColors = {
    active: "bg-[#dcfce7] text-[#166534]",
    inactive: "bg-[#f1f5f9] text-[#64748b]",
  };

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#1e293b]">Properties</h2>
          <p className="text-xs text-[#64748b] mt-0.5">
            {properties.length} registered{" "}
            {properties.length === 1 ? "property" : "properties"}
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#059669] hover:bg-[#047857] text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Property
        </button>
      </div>

      {/* ── Search ── */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, address, client or type…"
          className="w-full pl-9 pr-4 py-2 text-sm border border-[#e2e8f0] rounded-lg bg-white text-[#1e293b] placeholder-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-[#059669]"
        />
      </div>

      {/* ── Grid ── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-44 bg-[#f1f5f9] rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-xl border border-[#e2e8f0]">
          <div className="w-12 h-12 bg-[#f0fdf4] rounded-full flex items-center justify-center mb-3">
            <MapPin className="w-6 h-6 text-[#059669]" />
          </div>
          <p className="text-sm font-semibold text-[#1e293b] mb-1">
            {search ? "No matching properties" : "No properties yet"}
          </p>
          <p className="text-xs text-[#94a3b8] mb-4">
            {search
              ? "Try a different search term"
              : "Add your first property to get started"}
          </p>
          {!search && (
            <button
              onClick={openAdd}
              className="px-4 py-1.5 bg-[#059669] text-white rounded-lg text-xs font-medium"
            >
              Add Property
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((p) => {
            const Icon = typeIcon(p.type);
            return (
              <div
                key={p.id}
                className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Card header */}
                <div className="bg-gradient-to-r from-[#f0fdf4] to-[#f8fafc] px-4 pt-4 pb-3 border-b border-[#e2e8f0]">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 bg-[#dcfce7] rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-[#059669]" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-[#1e293b] truncate">
                          {p.name || p.address}
                        </h3>
                        <span className="text-xs text-[#059669] font-medium">
                          {p.type}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-semibold flex-shrink-0 ${
                        statusColors[p.status] || statusColors.active
                      }`}
                    >
                      {p.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                {/* Card body */}
                <div className="px-4 py-3 space-y-2 text-xs text-[#64748b]">
                  <div className="flex items-start gap-1.5">
                    <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0 text-[#94a3b8]" />
                    <span className="leading-relaxed">{p.address}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4">
                    {p.size && (
                      <div>
                        <span className="text-[#94a3b8]">Size: </span>
                        <span className="font-medium text-[#374151]">
                          {p.size}
                        </span>
                      </div>
                    )}
                    {p.clientName && (
                      <div>
                        <span className="text-[#94a3b8]">Client: </span>
                        <span className="font-medium text-[#374151]">
                          {p.clientName}
                        </span>
                      </div>
                    )}
                  </div>
                  {p.accessDetails && (
                    <div className="flex items-start gap-1.5">
                      <span className="text-[#94a3b8] flex-shrink-0">
                        Access:
                      </span>
                      <span>{p.accessDetails}</span>
                    </div>
                  )}
                  {p.notes && (
                    <p className="text-[#94a3b8] italic truncate">{p.notes}</p>
                  )}
                </div>

                {/* Card actions */}
                <div className="px-4 pb-3 flex items-center gap-2 border-t border-[#f1f5f9] pt-3">
                  <button
                    onClick={() => openEdit(p)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#374151] bg-[#f1f5f9] hover:bg-[#e2e8f0] rounded-lg transition-colors font-medium"
                  >
                    <Edit2 className="w-3 h-3" />
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(p)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#dc2626] bg-[#fef2f2] hover:bg-[#fee2e2] rounded-lg transition-colors font-medium"
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

      {/* ── Add / Edit Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#e2e8f0] bg-[#f8fafc]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-[#f0fdf4] rounded-lg flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-[#059669]" />
                </div>
                <h3 className="text-sm font-semibold text-[#1e293b]">
                  {editing ? "Edit Property" : "Add Property"}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-[#64748b] hover:text-[#1e293b] hover:bg-[#e2e8f0] rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              <div className="grid grid-cols-2 gap-4">
                {/* Name */}
                <div className="col-span-2">
                  <label className={labelCls}>Property Label / Name</label>
                  <input
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    placeholder="e.g. Johnson Front Garden"
                    className={inputCls}
                  />
                </div>

                {/* Type */}
                <div>
                  <label className={labelCls}>Property Type</label>
                  <select
                    value={form.type}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, type: e.target.value }))
                    }
                    className={inputCls}
                  >
                    {PROPERTY_TYPES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>

                {/* Size */}
                <div>
                  <label className={labelCls}>Size</label>
                  <input
                    value={form.size}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, size: e.target.value }))
                    }
                    placeholder="e.g. 500 sqm"
                    className={inputCls}
                  />
                </div>

                {/* Address */}
                <div className="col-span-2">
                  <label className={labelCls}>Address *</label>
                  <input
                    value={form.address}
                    onChange={(e) => {
                      setForm((f) => ({ ...f, address: e.target.value }));
                      setErrors((e2) => ({ ...e2, address: undefined }));
                    }}
                    placeholder="Full street address"
                    className={`${inputCls} ${
                      errors.address
                        ? "border-[#dc2626] ring-1 ring-[#dc2626]"
                        : ""
                    }`}
                  />
                  {errors.address && (
                    <p className="mt-1 text-xs text-[#dc2626] flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.address}
                    </p>
                  )}
                </div>

                {/* Client */}
                <div className="col-span-2">
                  <label className={labelCls}>Associated Client</label>
                  <input
                    value={form.clientName}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, clientName: e.target.value }))
                    }
                    placeholder="Client name"
                    className={inputCls}
                  />
                </div>

                {/* Access Details */}
                <div className="col-span-2">
                  <label className={labelCls}>Access Details</label>
                  <input
                    value={form.accessDetails}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, accessDetails: e.target.value }))
                    }
                    placeholder="e.g. Side gate, key with front desk"
                    className={inputCls}
                  />
                </div>

                {/* Notes */}
                <div className="col-span-2">
                  <label className={labelCls}>Notes</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, notes: e.target.value }))
                    }
                    rows={3}
                    placeholder="Additional notes…"
                    className={inputCls}
                  />
                </div>

                {/* Status */}
                <div>
                  <label className={labelCls}>Status</label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, status: e.target.value }))
                    }
                    className={inputCls}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="px-5 py-4 border-t border-[#e2e8f0] flex justify-end gap-2 bg-[#f8fafc]">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-[#374151] bg-[#f1f5f9] hover:bg-[#e2e8f0] rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 text-sm text-white bg-[#059669] hover:bg-[#047857] rounded-lg transition-colors font-medium disabled:opacity-50"
              >
                {saving
                  ? "Saving…"
                  : editing
                    ? "Update Property"
                    : "Add Property"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm ── */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
            <div className="w-12 h-12 bg-[#fef2f2] rounded-full flex items-center justify-center mb-4 mx-auto">
              <Trash2 className="w-5 h-5 text-[#dc2626]" />
            </div>
            <h3 className="text-sm font-semibold text-[#1e293b] text-center mb-1">
              Delete Property
            </h3>
            <p className="text-xs text-[#64748b] text-center mb-5 leading-relaxed">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-[#1e293b]">
                {deleteConfirm.name || deleteConfirm.address}
              </span>
              ? This cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2 text-sm text-[#374151] bg-[#f1f5f9] hover:bg-[#e2e8f0] rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2 text-sm text-white bg-[#dc2626] hover:bg-[#b91c1c] rounded-lg transition-colors font-medium disabled:opacity-50"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
