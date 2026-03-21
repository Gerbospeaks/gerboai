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
  Scale,
  Plus,
  X,
  Edit2,
  Trash2,
  Calendar,
  Clock,
  MapPin,
  User,
  FileText,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  Search,
  Filter,
} from "lucide-react";

const COURT_TYPES = [
  "High Court",
  "Supreme Court of Appeal",
  "Constitutional Court",
  "Magistrates Court",
  "Labour Court",
  "Land Claims Court",
  "Tax Court",
  "Electoral Court",
  "Special Tribunal",
  "Other",
];

const MATTER_TYPES = [
  "Commercial Litigation",
  "Criminal",
  "Family Law",
  "Labour",
  "Constitutional",
  "Administrative",
  "Insolvency",
  "Property",
  "Divorce",
  "Maintenance",
  "Appeal",
  "Review",
  "Urgent Application",
  "Motion Proceedings",
  "Trial",
  "Other",
];

const STATUS_CONFIG = {
  upcoming: {
    label: "Upcoming",
    bg: "bg-[#ede9fe]",
    text: "text-[#5b21b6]",
    dot: "bg-[#7c3aed]",
  },
  today: {
    label: "Today",
    bg: "bg-[#fef3c7]",
    text: "text-[#92400e]",
    dot: "bg-[#d97706]",
  },
  adjourned: {
    label: "Adjourned",
    bg: "bg-[#e0f2fe]",
    text: "text-[#075985]",
    dot: "bg-[#0891b2]",
  },
  struck_off: {
    label: "Struck Off",
    bg: "bg-[#fef2f2]",
    text: "text-[#991b1b]",
    dot: "bg-[#dc2626]",
  },
  finalised: {
    label: "Finalised",
    bg: "bg-[#dcfce7]",
    text: "text-[#166534]",
    dot: "bg-[#059669]",
  },
  settled: {
    label: "Settled",
    bg: "bg-[#f0fdf4]",
    text: "text-[#166534]",
    dot: "bg-[#16a34a]",
  },
  postponed: {
    label: "Postponed",
    bg: "bg-[#fff7ed]",
    text: "text-[#9a3412]",
    dot: "bg-[#ea580c]",
  },
};

const inputCls =
  "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-lg bg-white text-[#1e293b] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-[#7c3aed] transition-colors";
const labelCls =
  "block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5";
const selectCls =
  "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-lg bg-white text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-[#7c3aed] transition-colors";

const EMPTY_FORM = {
  caseNumber: "",
  caseName: "",
  clientName: "",
  courtType: "High Court",
  courtDivision: "",
  judgeName: "",
  matterType: "Commercial Litigation",
  hearingDate: "",
  hearingTime: "",
  venue: "",
  status: "upcoming",
  advocateName: "",
  opposingCounsel: "",
  opposingAttorney: "",
  notes: "",
  nextSteps: "",
  outcome: "",
};

export default function CourtDates({ user }) {
  const [dates, setDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const db = getFirestore();

  useEffect(() => {
    if (user?.uid) load();
  }, [user]);

  const load = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(
        query(
          collection(db, "users", user.uid, "courtDates"),
          orderBy("hearingDate", "asc"),
        ),
      );
      setDates(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (_) {}
    setLoading(false);
  };

  const openAdd = () => {
    setEditItem(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };
  const openEdit = (item) => {
    setEditItem(item);
    setForm({ ...EMPTY_FORM, ...item });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.caseNumber || !form.hearingDate)
      return alert("Case number and hearing date are required.");
    setSaving(true);
    try {
      const payload = { ...form, updatedAt: serverTimestamp() };
      if (editItem) {
        await updateDoc(
          doc(db, "users", user.uid, "courtDates", editItem.id),
          payload,
        );
      } else {
        await addDoc(collection(db, "users", user.uid, "courtDates"), {
          ...payload,
          createdAt: serverTimestamp(),
        });
      }
      setShowModal(false);
      load();
    } catch (_) {
      alert("Save failed.");
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "users", user.uid, "courtDates", id));
      setDeleteConfirm(null);
      load();
    } catch (_) {}
  };

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const getComputedStatus = (item) => {
    if (item.status !== "upcoming") return item.status;
    const today = new Date().toDateString();
    const itemDate = new Date(item.hearingDate).toDateString();
    if (itemDate === today) return "today";
    return "upcoming";
  };

  const filtered = dates.filter((d) => {
    const s = (search || "").toLowerCase();
    const matchSearch =
      !s ||
      d.caseNumber?.toLowerCase().includes(s) ||
      d.caseName?.toLowerCase().includes(s) ||
      d.clientName?.toLowerCase().includes(s) ||
      d.courtType?.toLowerCase().includes(s);
    const matchStatus =
      filterStatus === "all" || getComputedStatus(d) === filterStatus;
    return matchSearch && matchStatus;
  });

  const upcoming = dates.filter((d) =>
    ["upcoming", "today"].includes(getComputedStatus(d)),
  );
  const todayDates = dates.filter((d) => getComputedStatus(d) === "today");

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-5xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#ede9fe] rounded-xl flex items-center justify-center">
              <Scale className="w-5 h-5 text-[#7c3aed]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#1e293b]">Court Dates</h1>
              <p className="text-xs text-[#64748b]">
                Manage hearings, trials and deadlines
              </p>
            </div>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Court Date
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              label: "Total Matters",
              value: dates.length,
              bg: "bg-[#ede9fe]",
              color: "text-[#7c3aed]",
            },
            {
              label: "Today",
              value: todayDates.length,
              bg: "bg-[#fef3c7]",
              color: "text-[#d97706]",
            },
            {
              label: "Upcoming",
              value: upcoming.length,
              bg: "bg-[#f0fdf4]",
              color: "text-[#059669]",
            },
            {
              label: "Finalised",
              value: dates.filter((d) => d.status === "finalised").length,
              bg: "bg-[#e0f2fe]",
              color: "text-[#0891b2]",
            },
          ].map(({ label, value, bg, color }) => (
            <div
              key={label}
              className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm"
            >
              <p className="text-xs text-[#64748b] mb-1">{label}</p>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Today alert */}
        {todayDates.length > 0 && (
          <div className="bg-[#fef3c7] border border-[#fde68a] rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#d97706] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-[#92400e]">
                {todayDates.length} court appearance
                {todayDates.length > 1 ? "s" : ""} today
              </p>
              {todayDates.map((d) => (
                <p key={d.id} className="text-xs text-[#92400e] mt-0.5">
                  {d.hearingTime && `${d.hearingTime} — `}
                  {d.courtType}: {d.caseNumber} — {d.caseName || d.clientName}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search case number, name, client..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7c3aed]"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 text-sm border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7c3aed] bg-white"
          >
            <option value="all">All Statuses</option>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
        </div>

        {/* List */}
        <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-sm text-[#94a3b8]">
              Loading...
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-12 h-12 bg-[#f1f5f9] rounded-full flex items-center justify-center mb-4">
                <Scale className="w-6 h-6 text-[#94a3b8]" />
              </div>
              <p className="text-sm font-medium text-[#374151] mb-1">
                No court dates found
              </p>
              <p className="text-xs text-[#94a3b8] mb-4">
                Add your first court date to get started
              </p>
              <button
                onClick={openAdd}
                className="px-4 py-1.5 bg-[#7c3aed] text-white rounded-lg text-xs font-medium"
              >
                Add Court Date
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[#f1f5f9]">
              {filtered.map((item) => {
                const st =
                  STATUS_CONFIG[getComputedStatus(item)] ||
                  STATUS_CONFIG.upcoming;
                return (
                  <div
                    key={item.id}
                    className="flex items-start gap-4 px-5 py-4 hover:bg-[#f8fafc] transition-colors"
                  >
                    <div
                      className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${st.dot}`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-sm font-bold text-[#1e293b]">
                              {item.caseNumber}
                            </span>
                            {item.caseName && (
                              <span className="text-sm text-[#374151]">
                                — {item.caseName}
                              </span>
                            )}
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-semibold ${st.bg} ${st.text}`}
                            >
                              {st.label}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#64748b]">
                            {item.clientName && (
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {item.clientName}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {item.hearingDate
                                ? new Date(item.hearingDate).toLocaleDateString(
                                    "en-ZA",
                                    {
                                      weekday: "short",
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    },
                                  )
                                : "No date"}
                              {item.hearingTime && ` at ${item.hearingTime}`}
                            </span>
                            {item.courtType && (
                              <span className="flex items-center gap-1">
                                <Scale className="w-3 h-3" />
                                {item.courtType}
                                {item.courtDivision
                                  ? ` (${item.courtDivision})`
                                  : ""}
                              </span>
                            )}
                            {item.matterType && (
                              <span className="flex items-center gap-1">
                                <FileText className="w-3 h-3" />
                                {item.matterType}
                              </span>
                            )}
                          </div>
                          {item.judgeName && (
                            <p className="text-xs text-[#94a3b8] mt-1">
                              Judge: {item.judgeName}
                            </p>
                          )}
                          {item.notes && (
                            <p className="text-xs text-[#64748b] mt-1 truncate max-w-lg">
                              {item.notes}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => openEdit(item)}
                            className="p-1.5 text-[#64748b] hover:text-[#7c3aed] hover:bg-[#ede9fe] rounded-lg transition-all"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(item.id)}
                            className="p-1.5 text-[#64748b] hover:text-[#dc2626] hover:bg-[#fef2f2] rounded-lg transition-all"
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
        </div>
      </div>

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-sm font-semibold text-[#1e293b] mb-2">
              Delete Court Date
            </h3>
            <p className="text-xs text-[#64748b] mb-5">
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-[#e2e8f0] text-[#374151] text-sm rounded-lg hover:bg-[#f8fafc]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2 bg-[#dc2626] text-white text-sm rounded-lg hover:bg-[#b91c1c]"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0] bg-[#f8fafc] flex-shrink-0">
              <h2 className="text-base font-semibold text-[#1e293b]">
                {editItem ? "Edit Court Date" : "Add Court Date"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-[#64748b] hover:bg-[#e2e8f0] rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Case Info */}
              <div>
                <p className="text-xs font-bold text-[#7c3aed] uppercase tracking-widest mb-3">
                  Case Information
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Case Number *</label>
                    <input
                      value={form.caseNumber}
                      onChange={(e) => set("caseNumber", e.target.value)}
                      placeholder="e.g. 12345/2026"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Case Name</label>
                    <input
                      value={form.caseName}
                      onChange={(e) => set("caseName", e.target.value)}
                      placeholder="e.g. Smith v Jones"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Client Name</label>
                    <input
                      value={form.clientName}
                      onChange={(e) => set("clientName", e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Matter Type</label>
                    <select
                      value={form.matterType}
                      onChange={(e) => set("matterType", e.target.value)}
                      className={selectCls}
                    >
                      {MATTER_TYPES.map((m) => (
                        <option key={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Court Info */}
              <div>
                <p className="text-xs font-bold text-[#7c3aed] uppercase tracking-widest mb-3">
                  Court Details
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Court Type</label>
                    <select
                      value={form.courtType}
                      onChange={(e) => set("courtType", e.target.value)}
                      className={selectCls}
                    >
                      {COURT_TYPES.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Division / Location</label>
                    <input
                      value={form.courtDivision}
                      onChange={(e) => set("courtDivision", e.target.value)}
                      placeholder="e.g. WCC, GPJ, KZN"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Judge / Magistrate</label>
                    <input
                      value={form.judgeName}
                      onChange={(e) => set("judgeName", e.target.value)}
                      placeholder="e.g. Honourable Justice Smith"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Venue / Court Room</label>
                    <input
                      value={form.venue}
                      onChange={(e) => set("venue", e.target.value)}
                      placeholder="e.g. Court Room 4B"
                      className={inputCls}
                    />
                  </div>
                </div>
              </div>

              {/* Date & Time */}
              <div>
                <p className="text-xs font-bold text-[#7c3aed] uppercase tracking-widest mb-3">
                  Date & Time
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Hearing Date *</label>
                    <input
                      type="date"
                      value={form.hearingDate}
                      onChange={(e) => set("hearingDate", e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Time</label>
                    <input
                      type="time"
                      value={form.hearingTime}
                      onChange={(e) => set("hearingTime", e.target.value)}
                      className={inputCls}
                    />
                  </div>
                </div>
              </div>

              {/* Counsel */}
              <div>
                <p className="text-xs font-bold text-[#7c3aed] uppercase tracking-widest mb-3">
                  Counsel & Parties
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Advocate (Our Side)</label>
                    <input
                      value={form.advocateName}
                      onChange={(e) => set("advocateName", e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Opposing Counsel</label>
                    <input
                      value={form.opposingCounsel}
                      onChange={(e) => set("opposingCounsel", e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Opposing Attorney</label>
                    <input
                      value={form.opposingAttorney}
                      onChange={(e) => set("opposingAttorney", e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Status</label>
                    <select
                      value={form.status}
                      onChange={(e) => set("status", e.target.value)}
                      className={selectCls}
                    >
                      {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <p className="text-xs font-bold text-[#7c3aed] uppercase tracking-widest mb-3">
                  Notes & Outcome
                </p>
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>Notes</label>
                    <textarea
                      value={form.notes}
                      onChange={(e) => set("notes", e.target.value)}
                      rows={3}
                      placeholder="Hearing notes, preparation reminders..."
                      className={`${inputCls} resize-none`}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Next Steps</label>
                    <textarea
                      value={form.nextSteps}
                      onChange={(e) => set("nextSteps", e.target.value)}
                      rows={2}
                      placeholder="What needs to happen before next appearance..."
                      className={`${inputCls} resize-none`}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Outcome</label>
                    <textarea
                      value={form.outcome}
                      onChange={(e) => set("outcome", e.target.value)}
                      rows={2}
                      placeholder="Result of hearing..."
                      className={`${inputCls} resize-none`}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-[#e2e8f0] bg-[#f8fafc] flex-shrink-0">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-[#e2e8f0] text-[#374151] text-sm rounded-lg hover:bg-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60"
              >
                {saving ? "Saving..." : editItem ? "Update" : "Add Court Date"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
