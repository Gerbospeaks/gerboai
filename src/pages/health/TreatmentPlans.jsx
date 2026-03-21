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
  ClipboardList,
  Plus,
  Search,
  X,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle,
  Clock,
  User,
  Calendar,
  Target,
  Activity,
  CheckSquare,
  Circle,
  TrendingUp,
} from "lucide-react";

const STATUS_CONFIG = {
  active: {
    label: "Active",
    bg: "bg-[#dcfce7]",
    text: "text-[#166534]",
    dot: "bg-[#22c55e]",
    bar: "bg-[#22c55e]",
  },
  completed: {
    label: "Completed",
    bg: "bg-[#f1f5f9]",
    text: "text-[#475569]",
    dot: "bg-[#94a3b8]",
    bar: "bg-[#94a3b8]",
  },
  pending: {
    label: "Pending",
    bg: "bg-[#dbeafe]",
    text: "text-[#1e40af]",
    dot: "bg-[#3b82f6]",
    bar: "bg-[#3b82f6]",
  },
  on_hold: {
    label: "On Hold",
    bg: "bg-[#fef3c7]",
    text: "text-[#92400e]",
    dot: "bg-[#f59e0b]",
    bar: "bg-[#f59e0b]",
  },
  cancelled: {
    label: "Cancelled",
    bg: "bg-[#fef2f2]",
    text: "text-[#991b1b]",
    dot: "bg-[#ef4444]",
    bar: "bg-[#ef4444]",
  },
};

const EMPTY_STEP = { title: "", done: false };
const EMPTY_FORM = {
  patientName: "",
  patientId: "",
  title: "",
  description: "",
  startDate: new Date().toISOString().split("T")[0],
  endDate: "",
  status: "active",
  assignedTo: "",
  goals: "",
  priority: "medium",
  steps: [],
};

export default function TreatmentPlans({ user }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [newStep, setNewStep] = useState("");
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const db = getFirestore();

  useEffect(() => {
    if (user?.uid) fetchPlans();
  }, [user]);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "users", user.uid, "treatmentPlans"),
        orderBy("createdAt", "desc"),
      );
      const snap = await getDocs(q);
      setPlans(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openNew = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowModal(true);
  };
  const openEdit = (plan) => {
    setForm({ ...EMPTY_FORM, ...plan, steps: plan.steps || [] });
    setEditingId(plan.id);
    setShowModal(true);
  };

  const addStep = () => {
    if (!newStep.trim()) return;
    setForm((f) => ({
      ...f,
      steps: [...f.steps, { title: newStep.trim(), done: false }],
    }));
    setNewStep("");
  };

  const toggleStep = (i) =>
    setForm((f) => ({
      ...f,
      steps: f.steps.map((s, idx) => (idx === i ? { ...s, done: !s.done } : s)),
    }));

  const removeStep = (i) =>
    setForm((f) => ({ ...f, steps: f.steps.filter((_, idx) => idx !== i) }));

  const handleSave = async () => {
    if (!form.patientName || !form.title) return;
    setSaving(true);
    try {
      const payload = { ...form, updatedAt: serverTimestamp() };
      if (editingId) {
        await updateDoc(
          doc(db, "users", user.uid, "treatmentPlans", editingId),
          payload,
        );
      } else {
        await addDoc(collection(db, "users", user.uid, "treatmentPlans"), {
          ...payload,
          createdAt: serverTimestamp(),
        });
      }
      setShowModal(false);
      fetchPlans();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  // Toggle a plan step directly from the list view (quick check-off)
  const togglePlanStep = async (plan, stepIdx) => {
    const updated = plan.steps.map((s, i) =>
      i === stepIdx ? { ...s, done: !s.done } : s,
    );
    try {
      await updateDoc(doc(db, "users", user.uid, "treatmentPlans", plan.id), {
        steps: updated,
        updatedAt: serverTimestamp(),
      });
      setPlans((prev) =>
        prev.map((p) => (p.id === plan.id ? { ...p, steps: updated } : p)),
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "users", user.uid, "treatmentPlans", id));
      setDeleteConfirm(null);
      fetchPlans();
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = plans.filter((p) => {
    const m =
      p.patientName?.toLowerCase().includes(search.toLowerCase()) ||
      p.title?.toLowerCase().includes(search.toLowerCase());
    return m && (statusFilter === "all" || p.status === statusFilter);
  });

  const stats = {
    total: plans.length,
    active: plans.filter((p) => p.status === "active").length,
    completed: plans.filter((p) => p.status === "completed").length,
  };

  const progress = (plan) => {
    const steps = plan.steps || [];
    if (!steps.length) return 0;
    return Math.round(
      (steps.filter((s) => s.done).length / steps.length) * 100,
    );
  };

  const inputCls =
    "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-lg bg-white text-[#1e293b] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#0e7490] focus:border-[#0e7490] transition-colors";
  const labelCls =
    "block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#0f172a] flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-[#0e7490]" /> Treatment Plans
          </h1>
          <p className="text-sm text-[#64748b] mt-0.5">
            Track patient care plans and progress
          </p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 bg-[#0e7490] hover:bg-[#0c6578] text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> New Plan
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Total Plans",
            value: stats.total,
            icon: ClipboardList,
            color: "text-[#0e7490]",
            bg: "bg-[#e0f2fe]",
          },
          {
            label: "Active",
            value: stats.active,
            icon: Activity,
            color: "text-[#059669]",
            bg: "bg-[#dcfce7]",
          },
          {
            label: "Completed",
            value: stats.completed,
            icon: CheckCircle,
            color: "text-[#64748b]",
            bg: "bg-[#f1f5f9]",
          },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div
            key={label}
            className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#64748b] uppercase tracking-wide">
                {label}
              </span>
              <div
                className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center`}
              >
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
            </div>
            <div className="text-2xl font-bold text-[#0f172a]">{value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by patient or plan title..."
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-[#e2e8f0] rounded-xl bg-white text-[#1e293b] placeholder-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#0e7490] transition-colors"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {[
            "all",
            "active",
            "pending",
            "on_hold",
            "completed",
            "cancelled",
          ].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${statusFilter === s ? "bg-[#0e7490] text-white" : "bg-white border border-[#e2e8f0] text-[#64748b] hover:bg-[#f8fafc]"}`}
            >
              {s === "on_hold"
                ? "On Hold"
                : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Cards grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-[#0e7490] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-[#e2e8f0] rounded-xl flex flex-col items-center justify-center py-16 gap-3">
          <ClipboardList className="w-10 h-10 text-[#cbd5e1]" />
          <p className="text-sm text-[#94a3b8]">No treatment plans found</p>
          <button
            onClick={openNew}
            className="text-sm text-[#0e7490] font-medium hover:underline"
          >
            Create the first one
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((plan) => {
            const s = STATUS_CONFIG[plan.status] || STATUS_CONFIG.active;
            const pct = progress(plan);
            const isExpanded = expanded[plan.id];
            return (
              <div
                key={plan.id}
                className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Card header */}
                <div className="px-5 py-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-[#1e293b] truncate">
                        {plan.title}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <User className="w-3 h-3 text-[#94a3b8] flex-shrink-0" />
                        <span className="text-xs text-[#64748b] truncate">
                          {plan.patientName}
                        </span>
                        {plan.patientId && (
                          <span className="text-xs text-[#94a3b8]">
                            · {plan.patientId}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                        {s.label}
                      </span>
                      <button
                        onClick={() => openEdit(plan)}
                        className="p-1.5 text-[#64748b] hover:text-[#0e7490] hover:bg-[#e0f2fe] rounded-lg transition-all"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(plan.id)}
                        className="p-1.5 text-[#64748b] hover:text-[#ef4444] hover:bg-[#fef2f2] rounded-lg transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {plan.description && (
                    <p className="text-xs text-[#64748b] mb-3 line-clamp-2">
                      {plan.description}
                    </p>
                  )}

                  {/* Dates */}
                  <div className="flex items-center gap-4 mb-3">
                    {plan.startDate && (
                      <div className="flex items-center gap-1 text-xs text-[#64748b]">
                        <Calendar className="w-3 h-3" />
                        <span>Start: {plan.startDate}</span>
                      </div>
                    )}
                    {plan.endDate && (
                      <div className="flex items-center gap-1 text-xs text-[#64748b]">
                        <Target className="w-3 h-3" />
                        <span>End: {plan.endDate}</span>
                      </div>
                    )}
                  </div>

                  {/* Progress bar */}
                  {(plan.steps || []).length > 0 && (
                    <div className="mb-1">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-[#64748b] font-medium">
                          Progress
                        </span>
                        <span className="text-xs font-bold text-[#1e293b]">
                          {pct}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-[#f1f5f9] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${s.bar}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Steps toggle */}
                {(plan.steps || []).length > 0 && (
                  <>
                    <button
                      onClick={() =>
                        setExpanded((e) => ({ ...e, [plan.id]: !e[plan.id] }))
                      }
                      className="w-full flex items-center justify-between px-5 py-2.5 bg-[#f8fafc] border-t border-[#e2e8f0] text-xs font-semibold text-[#64748b] hover:text-[#1e293b] hover:bg-[#f1f5f9] transition-colors"
                    >
                      <span>
                        {plan.steps.filter((s) => s.done).length}/
                        {plan.steps.length} steps completed
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                    {isExpanded && (
                      <div className="px-5 py-3 border-t border-[#e2e8f0] space-y-2 bg-[#fafafa]">
                        {plan.steps.map((step, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2.5 group"
                          >
                            <button
                              onClick={() => togglePlanStep(plan, i)}
                              className={`flex-shrink-0 w-4 h-4 rounded border transition-all ${step.done ? "bg-[#0e7490] border-[#0e7490]" : "border-[#d1d5db] hover:border-[#0e7490]"} flex items-center justify-center`}
                            >
                              {step.done && (
                                <CheckCircle className="w-3 h-3 text-white" />
                              )}
                            </button>
                            <span
                              className={`text-xs flex-1 ${step.done ? "line-through text-[#94a3b8]" : "text-[#374151]"}`}
                            >
                              {step.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-[#e2e8f0]">
            <div className="w-12 h-12 bg-[#fef2f2] rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6 text-[#ef4444]" />
            </div>
            <h3 className="text-base font-bold text-[#1e293b] text-center mb-1">
              Delete Treatment Plan?
            </h3>
            <p className="text-sm text-[#64748b] text-center mb-6">
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2.5 border border-[#e2e8f0] text-[#374151] text-sm font-medium rounded-xl hover:bg-[#f8fafc] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2.5 bg-[#ef4444] text-white text-sm font-semibold rounded-xl hover:bg-[#dc2626] transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-[#e2e8f0]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0] bg-[#f8fafc] rounded-t-2xl">
              <h2 className="text-sm font-bold text-[#1e293b]">
                {editingId ? "Edit Treatment Plan" : "New Treatment Plan"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-[#64748b] hover:text-[#1e293b] hover:bg-[#e2e8f0] rounded-lg transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Section: Patient */}
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-[#0e7490] uppercase tracking-widest mb-3 pb-2 border-b border-[#e2e8f0]">
                  <User className="w-3.5 h-3.5" /> Patient
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Patient Name *</label>
                    <input
                      className={inputCls}
                      value={form.patientName}
                      onChange={(e) =>
                        setForm({ ...form, patientName: e.target.value })
                      }
                      placeholder="Full name"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Patient ID</label>
                    <input
                      className={inputCls}
                      value={form.patientId}
                      onChange={(e) =>
                        setForm({ ...form, patientId: e.target.value })
                      }
                      placeholder="PAT-2026-XXXX"
                    />
                  </div>
                </div>
              </div>

              {/* Section: Plan */}
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-[#0e7490] uppercase tracking-widest mb-3 pb-2 border-b border-[#e2e8f0]">
                  <ClipboardList className="w-3.5 h-3.5" /> Plan Details
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Plan Title *</label>
                    <input
                      className={inputCls}
                      value={form.title}
                      onChange={(e) =>
                        setForm({ ...form, title: e.target.value })
                      }
                      placeholder="e.g. Post-surgery recovery plan"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Description</label>
                    <textarea
                      className={`${inputCls} resize-none`}
                      rows={2}
                      value={form.description}
                      onChange={(e) =>
                        setForm({ ...form, description: e.target.value })
                      }
                      placeholder="Overview of treatment approach..."
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Start Date</label>
                    <input
                      className={inputCls}
                      type="date"
                      value={form.startDate}
                      onChange={(e) =>
                        setForm({ ...form, startDate: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className={labelCls}>End Date</label>
                    <input
                      className={inputCls}
                      type="date"
                      value={form.endDate}
                      onChange={(e) =>
                        setForm({ ...form, endDate: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Status</label>
                    <select
                      className={inputCls}
                      value={form.status}
                      onChange={(e) =>
                        setForm({ ...form, status: e.target.value })
                      }
                    >
                      {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Assigned To</label>
                    <input
                      className={inputCls}
                      value={form.assignedTo}
                      onChange={(e) =>
                        setForm({ ...form, assignedTo: e.target.value })
                      }
                      placeholder="Doctor / clinician name"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Treatment Goals</label>
                    <textarea
                      className={`${inputCls} resize-none`}
                      rows={2}
                      value={form.goals}
                      onChange={(e) =>
                        setForm({ ...form, goals: e.target.value })
                      }
                      placeholder="Desired outcomes and measurable goals..."
                    />
                  </div>
                </div>
              </div>

              {/* Section: Steps */}
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-[#0e7490] uppercase tracking-widest mb-3 pb-2 border-b border-[#e2e8f0]">
                  <CheckSquare className="w-3.5 h-3.5" /> Treatment Steps
                </div>
                <div className="space-y-2 mb-3">
                  {form.steps.map((step, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 p-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg"
                    >
                      <button
                        onClick={() => toggleStep(i)}
                        className={`flex-shrink-0 w-4 h-4 rounded border transition-all ${step.done ? "bg-[#0e7490] border-[#0e7490]" : "border-[#d1d5db]"} flex items-center justify-center`}
                      >
                        {step.done && (
                          <CheckCircle className="w-3 h-3 text-white" />
                        )}
                      </button>
                      <span
                        className={`flex-1 text-sm ${step.done ? "line-through text-[#94a3b8]" : "text-[#374151]"}`}
                      >
                        {step.title}
                      </span>
                      <button
                        onClick={() => removeStep(i)}
                        className="p-1 text-[#94a3b8] hover:text-[#ef4444] transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    className={inputCls}
                    value={newStep}
                    onChange={(e) => setNewStep(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addStep()}
                    placeholder="Add a step... (press Enter)"
                  />
                  <button
                    onClick={addStep}
                    className="px-3 py-2 bg-[#0e7490] text-white rounded-lg hover:bg-[#0c6578] transition-colors flex-shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-[#e2e8f0] bg-[#f8fafc] rounded-b-2xl">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2.5 border border-[#e2e8f0] text-[#374151] text-sm font-medium rounded-xl hover:bg-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.patientName || !form.title}
                className="flex-1 px-4 py-2.5 bg-[#0e7490] hover:bg-[#0c6578] disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                {saving ? "Saving..." : editingId ? "Update Plan" : "Save Plan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
