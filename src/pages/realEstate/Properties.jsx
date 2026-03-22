import React, { useState, useEffect } from "react";
import {
  Building2,
  Plus,
  Search,
  Bed,
  Bath,
  Square,
  Eye,
  Edit,
  Trash2,
  X,
  Home,
  TrendingUp,
  CheckCircle,
  Clock,
  MoreVertical,
  User,
} from "lucide-react";
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

const statusConfig = {
  available: {
    label: "Available",
    bg: "bg-[#dcfce7]",
    text: "text-[#166534]",
    dot: "bg-[#059669]",
  },
  under_offer: {
    label: "Under Offer",
    bg: "bg-[#fef3c7]",
    text: "text-[#92400e]",
    dot: "bg-[#d97706]",
  },
  sold: {
    label: "Sold",
    bg: "bg-[#dbeafe]",
    text: "text-[#1e40af]",
    dot: "bg-[#2563eb]",
  },
  let: {
    label: "Let",
    bg: "bg-[#f3e8ff]",
    text: "text-[#6b21a8]",
    dot: "bg-[#7c3aed]",
  },
  withdrawn: {
    label: "Withdrawn",
    bg: "bg-[#fee2e2]",
    text: "text-[#991b1b]",
    dot: "bg-[#dc2626]",
  },
};

const propertyTypes = [
  "Residential Sale",
  "Residential Letting",
  "Commercial Sale",
  "Commercial Letting",
  "Land",
  "New Build",
];

const EMPTY_FORM = {
  address: "",
  type: "Residential Sale",
  status: "available",
  price: "",
  bedrooms: "",
  bathrooms: "",
  size: "",
  description: "",
  clientName: "",
  clientEmail: "",
};

const fmt = (n) =>
  `£${Number(n || 0).toLocaleString("en-GB", { minimumFractionDigits: 0 })}`;

export default function Properties({ user }) {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [viewProperty, setViewProperty] = useState(null);
  const [menuOpen, setMenuOpen] = useState(null);

  useEffect(() => {
    if (user?.uid) load();
  }, [user]);

  const load = async () => {
    setLoading(true);
    try {
      const db = getFirestore();
      const q = query(
        collection(db, "users", user.uid, "properties"),
        orderBy("createdAt", "desc"),
      );
      const snap = await getDocs(q);
      setProperties(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditingProperty(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };
  const openEdit = (p) => {
    setEditingProperty(p);
    setForm({ ...EMPTY_FORM, ...p });
    setShowModal(true);
    setMenuOpen(null);
  };

  const handleSave = async () => {
    if (!form.address || !form.price)
      return alert("Address and price are required");
    setSaving(true);
    try {
      const db = getFirestore();
      const data = {
        ...form,
        price: Number(form.price),
        bedrooms: Number(form.bedrooms) || 0,
        bathrooms: Number(form.bathrooms) || 0,
        updatedAt: serverTimestamp(),
      };
      if (editingProperty) {
        await updateDoc(
          doc(db, "users", user.uid, "properties", editingProperty.id),
          data,
        );
      } else {
        await addDoc(collection(db, "users", user.uid, "properties"), {
          ...data,
          createdAt: serverTimestamp(),
        });
      }
      setShowModal(false);
      load();
    } catch (e) {
      alert("Failed to save property");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this property?")) return;
    await deleteDoc(doc(getFirestore(), "users", user.uid, "properties", id));
    setMenuOpen(null);
    load();
  };

  const filtered = properties.filter((p) => {
    const s = search.toLowerCase();
    return (
      (!search ||
        p.address?.toLowerCase().includes(s) ||
        p.clientName?.toLowerCase().includes(s)) &&
      (filterStatus === "all" || p.status === filterStatus) &&
      (filterType === "all" || p.type === filterType)
    );
  });

  const stats = {
    total: properties.length,
    available: properties.filter((p) => p.status === "available").length,
    underOffer: properties.filter((p) => p.status === "under_offer").length,
    totalValue: properties.reduce((s, p) => s + (Number(p.price) || 0), 0),
  };

  const Field = ({ label, children }) => (
    <div>
      <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );

  const inputCls =
    "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] bg-white";

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-4">
      {/* ── Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: "Total Properties",
            value: stats.total,
            icon: Building2,
            iconBg: "bg-[#eff6ff]",
            iconColor: "text-[#2563eb]",
          },
          {
            label: "Available",
            value: stats.available,
            icon: CheckCircle,
            iconBg: "bg-[#f0fdf4]",
            iconColor: "text-[#059669]",
          },
          {
            label: "Under Offer",
            value: stats.underOffer,
            icon: Clock,
            iconBg: "bg-[#fffbeb]",
            iconColor: "text-[#d97706]",
          },
          {
            label: "Portfolio Value",
            value: fmt(stats.totalValue),
            icon: TrendingUp,
            iconBg: "bg-[#faf5ff]",
            iconColor: "text-[#7c3aed]",
          },
        ].map(({ label, value, icon: Icon, iconBg, iconColor }) => (
          <div
            key={label}
            className="bg-white rounded-xl p-4 border border-[#e2e8f0] shadow-sm"
          >
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconBg} mb-3`}
            >
              <Icon className={`w-4 h-4 ${iconColor}`} />
            </div>
            <p className="text-xs text-[#64748b] mb-0.5">{label}</p>
            <p className="text-lg font-bold text-[#1e293b]">{value}</p>
          </div>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search address or client…"
              className="w-full pl-9 pr-3 py-2 text-sm border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={inputCls + " sm:w-40"}
          >
            <option value="all">All Statuses</option>
            {Object.entries(statusConfig).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className={inputCls + " sm:w-48"}
          >
            <option value="all">All Types</option>
            {propertyTypes.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Add Property
          </button>
        </div>
      </div>

      {/* ── Grid ── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-56 bg-white rounded-xl animate-pulse border border-[#e2e8f0]"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-[#e2e8f0]">
          <Building2 className="w-10 h-10 text-[#cbd5e1] mb-3" />
          <p className="text-sm font-medium text-[#374151] mb-1">
            No properties found
          </p>
          <p className="text-xs text-[#94a3b8] mb-4">
            Add your first property to get started
          </p>
          <button
            onClick={openAdd}
            className="px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium rounded-lg transition-colors"
          >
            Add Property
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((p) => {
            const sc = statusConfig[p.status] || statusConfig.available;
            return (
              <div
                key={p.id}
                className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow group"
              >
                <div className="bg-gradient-to-br from-[#0f172a] to-[#1e3a5f] px-4 py-5 relative">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <div className="relative">
                      <button
                        onClick={() =>
                          setMenuOpen(menuOpen === p.id ? null : p.id)
                        }
                        className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {menuOpen === p.id && (
                        <div className="absolute right-0 top-8 bg-white border border-[#e2e8f0] rounded-lg shadow-lg z-10 py-1 w-36">
                          <button
                            onClick={() => {
                              setViewProperty(p);
                              setMenuOpen(null);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#374151] hover:bg-[#f8fafc]"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View
                          </button>
                          <button
                            onClick={() => openEdit(p)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#374151] hover:bg-[#f8fafc]"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#dc2626] hover:bg-[#fef2f2]"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-white font-semibold text-sm mt-3 line-clamp-2 pr-2">
                    {p.address || "No address"}
                  </p>
                  <p className="text-white/60 text-xs mt-1">{p.type}</p>
                </div>

                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-[#1e293b]">
                      {fmt(p.price)}
                    </span>
                    <span
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${sc.bg} ${sc.text}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                      {sc.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-[#64748b]">
                    {p.bedrooms > 0 && (
                      <span className="flex items-center gap-1">
                        <Bed className="w-3.5 h-3.5" />
                        {p.bedrooms} bed
                      </span>
                    )}
                    {p.bathrooms > 0 && (
                      <span className="flex items-center gap-1">
                        <Bath className="w-3.5 h-3.5" />
                        {p.bathrooms} bath
                      </span>
                    )}
                    {p.size && (
                      <span className="flex items-center gap-1">
                        <Square className="w-3.5 h-3.5" />
                        {p.size}
                      </span>
                    )}
                  </div>
                  {p.clientName && (
                    <div className="flex items-center gap-2 pt-2 border-t border-[#f1f5f9]">
                      <div className="w-6 h-6 bg-[#eff6ff] rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-3 h-3 text-[#2563eb]" />
                      </div>
                      <span className="text-xs text-[#374151] truncate">
                        {p.clientName}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Add / Edit Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden border border-[#e2e8f0]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0] bg-[#f8fafc]">
              <h2 className="text-base font-semibold text-[#1e293b]">
                {editingProperty ? "Edit Property" : "Add Property"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-[#64748b] hover:text-[#1e293b] hover:bg-[#e2e8f0] rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <Field label="Property Address *">
                <input
                  value={form.address}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, address: e.target.value }))
                  }
                  placeholder="Full address"
                  className={inputCls}
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Type">
                  <select
                    value={form.type}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, type: e.target.value }))
                    }
                    className={inputCls}
                  >
                    {propertyTypes.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Status">
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, status: e.target.value }))
                    }
                    className={inputCls}
                  >
                    {Object.entries(statusConfig).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <Field label="Price / Rent (£) *">
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, price: e.target.value }))
                  }
                  placeholder="0"
                  className={inputCls}
                />
              </Field>
              <div className="grid grid-cols-3 gap-4">
                <Field label="Bedrooms">
                  <input
                    type="number"
                    value={form.bedrooms}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, bedrooms: e.target.value }))
                    }
                    placeholder="0"
                    className={inputCls}
                  />
                </Field>
                <Field label="Bathrooms">
                  <input
                    type="number"
                    value={form.bathrooms}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, bathrooms: e.target.value }))
                    }
                    placeholder="0"
                    className={inputCls}
                  />
                </Field>
                <Field label="Size">
                  <input
                    value={form.size}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, size: e.target.value }))
                    }
                    placeholder="1,200 sq ft"
                    className={inputCls}
                  />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Client Name">
                  <input
                    value={form.clientName}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, clientName: e.target.value }))
                    }
                    placeholder="Owner / Tenant"
                    className={inputCls}
                  />
                </Field>
                <Field label="Client Email">
                  <input
                    value={form.clientEmail}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, clientEmail: e.target.value }))
                    }
                    placeholder="email@example.com"
                    className={inputCls}
                  />
                </Field>
              </div>
              <Field label="Description">
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  rows={3}
                  placeholder="Property notes…"
                  className={inputCls + " resize-none"}
                />
              </Field>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-[#e2e8f0] bg-[#f8fafc]">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-[#d1d5db] text-[#374151] text-sm font-medium rounded-lg hover:bg-[#f1f5f9] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60"
              >
                {saving
                  ? "Saving…"
                  : editingProperty
                    ? "Save Changes"
                    : "Add Property"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── View Modal ── */}
      {viewProperty && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg border border-[#e2e8f0] overflow-hidden">
            <div className="bg-gradient-to-br from-[#0f172a] to-[#1e3a5f] px-6 py-6">
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <button
                  onClick={() => setViewProperty(null)}
                  className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <h2 className="text-white font-bold text-lg mt-4">
                {viewProperty.address}
              </h2>
              <p className="text-white/60 text-sm mt-1">{viewProperty.type}</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-[#1e293b]">
                  {fmt(viewProperty.price)}
                </span>
                <span
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${statusConfig[viewProperty.status]?.bg} ${statusConfig[viewProperty.status]?.text}`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${statusConfig[viewProperty.status]?.dot}`}
                  />
                  {statusConfig[viewProperty.status]?.label}
                </span>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-[#64748b]">
                {viewProperty.bedrooms > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Bed className="w-4 h-4" />
                    {viewProperty.bedrooms} Bedrooms
                  </span>
                )}
                {viewProperty.bathrooms > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Bath className="w-4 h-4" />
                    {viewProperty.bathrooms} Bathrooms
                  </span>
                )}
                {viewProperty.size && (
                  <span className="flex items-center gap-1.5">
                    <Square className="w-4 h-4" />
                    {viewProperty.size}
                  </span>
                )}
              </div>
              {viewProperty.description && (
                <p className="text-sm text-[#374151] bg-[#f8fafc] rounded-lg p-3 border border-[#e2e8f0]">
                  {viewProperty.description}
                </p>
              )}
              {viewProperty.clientName && (
                <div className="flex items-center gap-3 pt-3 border-t border-[#f1f5f9]">
                  <div className="w-8 h-8 bg-[#eff6ff] rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-[#2563eb]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1e293b]">
                      {viewProperty.clientName}
                    </p>
                    {viewProperty.clientEmail && (
                      <p className="text-xs text-[#64748b]">
                        {viewProperty.clientEmail}
                      </p>
                    )}
                  </div>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setViewProperty(null);
                    openEdit(viewProperty);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <Edit className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    handleDelete(viewProperty.id);
                    setViewProperty(null);
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-2 border border-[#fee2e2] bg-[#fef2f2] hover:bg-[#fee2e2] text-[#dc2626] text-sm font-medium rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
