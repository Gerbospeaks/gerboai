import React, { useState, useEffect } from "react";
import {
  Key,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  X,
  MoreVertical,
  User,
  Building2,
  Calendar,
  DollarSign,
  Tag,
  Clock,
  CheckCircle,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
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

const listingStatusConfig = {
  active: {
    label: "Active",
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
    label: "Sold / Let",
    bg: "bg-[#dbeafe]",
    text: "text-[#1e40af]",
    dot: "bg-[#2563eb]",
  },
  expired: {
    label: "Expired",
    bg: "bg-[#fee2e2]",
    text: "text-[#991b1b]",
    dot: "bg-[#dc2626]",
  },
  withdrawn: {
    label: "Withdrawn",
    bg: "bg-[#f1f5f9]",
    text: "text-[#475569]",
    dot: "bg-[#94a3b8]",
  },
};

const listingTypes = [
  "Sale",
  "Letting",
  "Commercial Sale",
  "Commercial Letting",
];

const EMPTY_FORM = {
  title: "",
  address: "",
  type: "Sale",
  status: "active",
  askingPrice: "",
  agentFeePercent: "",
  agentFeeFixed: "",
  listedDate: "",
  expiryDate: "",
  portalLinks: "",
  clientName: "",
  clientPhone: "",
  clientEmail: "",
  notes: "",
};

const fmt = (n) =>
  `£${Number(n || 0).toLocaleString("en-GB", { minimumFractionDigits: 0 })}`;
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-GB") : "—");

export default function Listings({ user }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingListing, setEditingListing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [viewListing, setViewListing] = useState(null);
  const [menuOpen, setMenuOpen] = useState(null);

  useEffect(() => {
    if (user?.uid) load();
  }, [user]);

  const load = async () => {
    setLoading(true);
    try {
      const db = getFirestore();
      const q = query(
        collection(db, "users", user.uid, "listings"),
        orderBy("createdAt", "desc"),
      );
      const snap = await getDocs(q);
      setListings(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditingListing(null);
    setForm({
      ...EMPTY_FORM,
      listedDate: new Date().toISOString().slice(0, 10),
    });
    setShowModal(true);
  };
  const openEdit = (l) => {
    setEditingListing(l);
    setForm({ ...EMPTY_FORM, ...l });
    setShowModal(true);
    setMenuOpen(null);
  };

  const handleSave = async () => {
    if (!form.address) return alert("Address is required");
    setSaving(true);
    try {
      const db = getFirestore();
      const data = {
        ...form,
        askingPrice: Number(form.askingPrice) || 0,
        updatedAt: serverTimestamp(),
      };
      if (editingListing) {
        await updateDoc(
          doc(db, "users", user.uid, "listings", editingListing.id),
          data,
        );
      } else {
        await addDoc(collection(db, "users", user.uid, "listings"), {
          ...data,
          createdAt: serverTimestamp(),
        });
      }
      setShowModal(false);
      load();
    } catch (e) {
      alert("Failed to save listing");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this listing?")) return;
    await deleteDoc(doc(getFirestore(), "users", user.uid, "listings", id));
    setMenuOpen(null);
    load();
  };

  const calcFee = (l) => {
    if (l.agentFeeFixed) return Number(l.agentFeeFixed);
    if (l.agentFeePercent && l.askingPrice)
      return (Number(l.agentFeePercent) / 100) * Number(l.askingPrice);
    return 0;
  };

  const filtered = listings.filter((l) => {
    const s = search.toLowerCase();
    return (
      (!search ||
        l.address?.toLowerCase().includes(s) ||
        l.clientName?.toLowerCase().includes(s) ||
        l.title?.toLowerCase().includes(s)) &&
      (filterStatus === "all" || l.status === filterStatus) &&
      (filterType === "all" || l.type === filterType)
    );
  });

  const stats = {
    total: listings.length,
    active: listings.filter((l) => l.status === "active").length,
    underOffer: listings.filter((l) => l.status === "under_offer").length,
    totalFees: listings.reduce((s, l) => s + calcFee(l), 0),
  };

  const inputCls =
    "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] bg-white";
  const Field = ({ label, children, span }) => (
    <div className={span}>
      <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: "Total Listings",
            value: stats.total,
            icon: Key,
            iconBg: "bg-[#eff6ff]",
            iconColor: "text-[#2563eb]",
          },
          {
            label: "Active",
            value: stats.active,
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
            label: "Projected Fees",
            value: fmt(stats.totalFees),
            icon: DollarSign,
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

      {/* Toolbar */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search listings…"
              className="w-full pl-9 pr-3 py-2 text-sm border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={inputCls + " sm:w-40"}
          >
            <option value="all">All Statuses</option>
            {Object.entries(listingStatusConfig).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className={inputCls + " sm:w-40"}
          >
            <option value="all">All Types</option>
            {listingTypes.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            New Listing
          </button>
        </div>
      </div>

      {/* List */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 bg-[#f8fafc] rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Key className="w-10 h-10 text-[#cbd5e1] mb-3" />
            <p className="text-sm font-medium text-[#374151] mb-1">
              No listings found
            </p>
            <p className="text-xs text-[#94a3b8] mb-4">
              Create your first listing
            </p>
            <button
              onClick={openAdd}
              className="px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium rounded-lg transition-colors"
            >
              New Listing
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[#f1f5f9]">
            {filtered.map((l) => {
              const sc =
                listingStatusConfig[l.status] || listingStatusConfig.active;
              const fee = calcFee(l);
              return (
                <div
                  key={l.id}
                  className="flex items-center justify-between px-5 py-4 hover:bg-[#f8fafc] transition-colors group"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#0f172a] to-[#1e3a5f] rounded-lg flex items-center justify-center flex-shrink-0">
                      <Key className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className="text-sm font-semibold text-[#1e293b] truncate">
                          {l.address || l.title || "Untitled"}
                        </span>
                        <span
                          className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${sc.bg} ${sc.text}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${sc.dot}`}
                          />
                          {sc.label}
                        </span>
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-[#f1f5f9] text-[#475569] flex-shrink-0">
                          {l.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-[#64748b] flex-wrap">
                        {l.clientName && (
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {l.clientName}
                          </span>
                        )}
                        {l.listedDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Listed {fmtDate(l.listedDate)}
                          </span>
                        )}
                        {l.expiryDate && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Expires {fmtDate(l.expiryDate)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 ml-4 flex-shrink-0">
                    <div className="text-right hidden md:block">
                      <div className="text-sm font-bold text-[#1e293b]">
                        {fmt(l.askingPrice)}
                      </div>
                      {fee > 0 && (
                        <div className="text-xs text-[#059669]">
                          Fee: {fmt(fee)}
                        </div>
                      )}
                    </div>
                    <div className="relative">
                      <button
                        onClick={() =>
                          setMenuOpen(menuOpen === l.id ? null : l.id)
                        }
                        className="p-1.5 text-[#94a3b8] hover:text-[#374151] hover:bg-[#e2e8f0] rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {menuOpen === l.id && (
                        <div className="absolute right-0 top-8 bg-white border border-[#e2e8f0] rounded-lg shadow-lg z-10 py-1 w-36">
                          <button
                            onClick={() => {
                              setViewListing(l);
                              setMenuOpen(null);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#374151] hover:bg-[#f8fafc]"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View
                          </button>
                          <button
                            onClick={() => openEdit(l)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#374151] hover:bg-[#f8fafc]"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(l.id)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#dc2626] hover:bg-[#fef2f2]"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-[#e2e8f0]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0] bg-[#f8fafc]">
              <h2 className="text-base font-semibold text-[#1e293b]">
                {editingListing ? "Edit Listing" : "New Listing"}
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
                  placeholder="Full property address"
                  className={inputCls}
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Listing Type">
                  <select
                    value={form.type}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, type: e.target.value }))
                    }
                    className={inputCls}
                  >
                    {listingTypes.map((t) => (
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
                    {Object.entries(listingStatusConfig).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <Field label="Asking Price (£)">
                <input
                  type="number"
                  value={form.askingPrice}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, askingPrice: e.target.value }))
                  }
                  placeholder="0"
                  className={inputCls}
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Agent Fee % (optional)">
                  <input
                    type="number"
                    step="0.01"
                    value={form.agentFeePercent}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        agentFeePercent: e.target.value,
                      }))
                    }
                    placeholder="e.g. 1.5"
                    className={inputCls}
                  />
                </Field>
                <Field label="Fixed Fee £ (optional)">
                  <input
                    type="number"
                    value={form.agentFeeFixed}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, agentFeeFixed: e.target.value }))
                    }
                    placeholder="0"
                    className={inputCls}
                  />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Listed Date">
                  <input
                    type="date"
                    value={form.listedDate}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, listedDate: e.target.value }))
                    }
                    className={inputCls}
                  />
                </Field>
                <Field label="Expiry Date">
                  <input
                    type="date"
                    value={form.expiryDate}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, expiryDate: e.target.value }))
                    }
                    className={inputCls}
                  />
                </Field>
              </div>
              <div className="border-t border-[#f1f5f9] pt-4">
                <p className="text-xs font-semibold text-[#374151] uppercase tracking-wide mb-3">
                  Client Details
                </p>
                <div className="grid grid-cols-3 gap-4">
                  <Field label="Name">
                    <input
                      value={form.clientName}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, clientName: e.target.value }))
                      }
                      placeholder="Client name"
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Phone">
                    <input
                      value={form.clientPhone}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, clientPhone: e.target.value }))
                      }
                      placeholder="Phone"
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Email">
                    <input
                      value={form.clientEmail}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, clientEmail: e.target.value }))
                      }
                      placeholder="Email"
                      className={inputCls}
                    />
                  </Field>
                </div>
              </div>
              <Field label="Portal Links (Rightmove, Zoopla…)">
                <input
                  value={form.portalLinks}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, portalLinks: e.target.value }))
                  }
                  placeholder="https://rightmove.co.uk/…"
                  className={inputCls}
                />
              </Field>
              <Field label="Notes">
                <textarea
                  value={form.notes}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, notes: e.target.value }))
                  }
                  rows={3}
                  placeholder="Additional notes…"
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
                  : editingListing
                    ? "Save Changes"
                    : "Create Listing"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewListing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg border border-[#e2e8f0] overflow-hidden">
            <div className="bg-gradient-to-br from-[#0f172a] to-[#1e3a5f] px-6 py-6">
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                  <Key className="w-6 h-6 text-white" />
                </div>
                <button
                  onClick={() => setViewListing(null)}
                  className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <h2 className="text-white font-bold text-lg mt-4">
                {viewListing.address}
              </h2>
              <div className="flex items-center gap-3 mt-2">
                <span
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${listingStatusConfig[viewListing.status]?.bg} ${listingStatusConfig[viewListing.status]?.text}`}
                >
                  {listingStatusConfig[viewListing.status]?.label}
                </span>
                <span className="text-white/60 text-xs">
                  {viewListing.type}
                </span>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-[#1e293b]">
                  {fmt(viewListing.askingPrice)}
                </span>
                {calcFee(viewListing) > 0 && (
                  <span className="text-sm font-semibold text-[#059669]">
                    Fee: {fmt(calcFee(viewListing))}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm text-[#64748b]">
                {viewListing.listedDate && (
                  <div>
                    <span className="font-medium text-[#374151]">Listed:</span>{" "}
                    {fmtDate(viewListing.listedDate)}
                  </div>
                )}
                {viewListing.expiryDate && (
                  <div>
                    <span className="font-medium text-[#374151]">Expires:</span>{" "}
                    {fmtDate(viewListing.expiryDate)}
                  </div>
                )}
              </div>
              {viewListing.clientName && (
                <div className="flex flex-col gap-1.5 pt-3 border-t border-[#f1f5f9]">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-[#2563eb]" />
                    <span className="text-sm font-semibold text-[#1e293b]">
                      {viewListing.clientName}
                    </span>
                  </div>
                  {viewListing.clientPhone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-[#94a3b8]" />
                      <span className="text-sm text-[#374151]">
                        {viewListing.clientPhone}
                      </span>
                    </div>
                  )}
                  {viewListing.clientEmail && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-[#94a3b8]" />
                      <span className="text-sm text-[#374151]">
                        {viewListing.clientEmail}
                      </span>
                    </div>
                  )}
                </div>
              )}
              {viewListing.portalLinks && (
                <a
                  href={viewListing.portalLinks}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-sm text-[#2563eb] hover:underline"
                >
                  <ExternalLink className="w-4 h-4" />
                  View on portal
                </a>
              )}
              {viewListing.notes && (
                <p className="text-sm text-[#374151] bg-[#f8fafc] rounded-lg p-3 border border-[#e2e8f0]">
                  {viewListing.notes}
                </p>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setViewListing(null);
                    openEdit(viewListing);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <Edit className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    handleDelete(viewListing.id);
                    setViewListing(null);
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-2 border border-[#fee2e2] bg-[#fef2f2] hover:bg-[#fee2e2] text-[#dc2626] text-sm font-medium rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
