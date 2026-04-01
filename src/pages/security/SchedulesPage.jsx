import React, { useState, useEffect } from "react";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import {
  Plus,
  Calendar,
  CheckCircle,
  X,
  Save,
  AlertTriangle,
  Edit,
  Trash2,
} from "lucide-react";

const db = getFirestore();

const inputCls =
  "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md bg-white text-[#1e293b] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-[#2563eb] transition-colors";
const labelCls =
  "block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const EMPTY_SHIFT = {
  guard: "",
  site: "",
  shift: "",
  days: [0, 0, 0, 0, 0, 0, 0],
};

export default function SchedulesPage({ user }) {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editSchedule, setEditSchedule] = useState(null);
  const [form, setForm] = useState(EMPTY_SHIFT);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    if (!user?.uid) return;
    const q = query(
      collection(db, "users", user.uid, "schedules"),
      orderBy("createdAt", "desc"),
    );
    const unsub = onSnapshot(q, (snap) => {
      setSchedules(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const stats = {
    scheduled: schedules.length,
    totalHours: schedules.reduce(
      (a, s) => a + (s.days || []).reduce((b, d) => b + d, 0) * 12,
      0,
    ),
  };

  const openAdd = () => {
    setEditSchedule(null);
    setForm(EMPTY_SHIFT);
    setShowModal(true);
  };
  const openEdit = (s) => {
    setEditSchedule(s);
    setForm({ ...s, days: s.days || [0, 0, 0, 0, 0, 0, 0] });
    setShowModal(true);
  };

  const toggleDay = (idx) => {
    const days = [...(form.days || [0, 0, 0, 0, 0, 0, 0])];
    days[idx] = days[idx] ? 0 : 1;
    setForm({ ...form, days });
  };

  const handleSave = async () => {
    if (!user?.uid || !form.guard.trim()) return;
    setSaving(true);
    try {
      if (editSchedule) {
        await updateDoc(
          doc(db, "users", user.uid, "schedules", editSchedule.id),
          {
            ...form,
            updatedAt: serverTimestamp(),
          },
        );
      } else {
        await addDoc(collection(db, "users", user.uid, "schedules"), {
          ...form,
          days: form.days || [0, 0, 0, 0, 0, 0, 0],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      setShowModal(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "users", user.uid, "schedules", id));
    setDeleteConfirm(null);
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-6 py-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1e293b]">Schedules</h1>
          <p className="text-sm text-[#64748b] mt-0.5">
            Weekly guard shift scheduling
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Create Schedule
          </button>
        </div>
      </div>

      {/* Coverage summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Guards Scheduled", value: stats.scheduled },
          { label: "Total Hours / Week", value: `${stats.totalHours}h` },
          { label: "Mon–Sun Coverage", value: `${schedules.length} shifts` },
          {
            label: "Avg Hours / Guard",
            value: schedules.length
              ? `${Math.round(stats.totalHours / schedules.length)}h`
              : "—",
          },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="bg-white rounded-xl p-4 border border-[#e2e8f0] shadow-sm text-center"
          >
            {loading ? (
              <div className="h-7 bg-[#f1f5f9] rounded animate-pulse mb-1 mx-auto w-16" />
            ) : (
              <p className="text-xl font-bold text-[#1e293b]">{value}</p>
            )}
            <p className="text-xs text-[#64748b] mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Schedule Table */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-12 bg-[#f8fafc] rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : schedules.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Calendar className="w-10 h-10 text-[#cbd5e1] mb-3" />
            <p className="text-sm font-medium text-[#374151] mb-1">
              No schedules yet
            </p>
            <p className="text-xs text-[#94a3b8] mb-3">
              Create your first guard schedule
            </p>
            <button
              onClick={openAdd}
              className="px-4 py-1.5 bg-[#2563eb] text-white rounded-lg text-xs font-medium"
            >
              Create Schedule
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wide min-w-[160px]">
                    Guard
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wide">
                    Site
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wide">
                    Shift
                  </th>
                  {DAYS.map((d) => (
                    <th
                      key={d}
                      className="px-3 py-3 text-center text-xs font-semibold text-[#64748b] uppercase tracking-wide w-14"
                    >
                      {d}
                    </th>
                  ))}
                  <th className="px-3 py-3 text-center text-xs font-semibold text-[#64748b] uppercase tracking-wide">
                    Hrs
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-semibold text-[#64748b] uppercase tracking-wide"></th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((s) => {
                  const days = s.days || [0, 0, 0, 0, 0, 0, 0];
                  const hrs = days.reduce((a, b) => a + b, 0) * 12;
                  return (
                    <tr
                      key={s.id}
                      className="border-b border-[#f1f5f9] hover:bg-[#f8fafc]"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 bg-gradient-to-br from-[#2563eb] to-[#7c3aed] rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs font-bold">
                              {s.guard
                                ?.split(" ")
                                .map((n) => n[0])
                                .join("") || "?"}
                            </span>
                          </div>
                          <span className="text-sm font-semibold text-[#1e293b]">
                            {s.guard}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-sm text-[#374151]">
                        {s.site || "—"}
                      </td>
                      <td className="px-3 py-3 text-xs font-mono text-[#64748b] whitespace-nowrap">
                        {s.shift || "—"}
                      </td>
                      {days.map((on, di) => (
                        <td key={di} className="px-3 py-3 text-center">
                          <div
                            className={`w-7 h-7 rounded-lg mx-auto flex items-center justify-center ${on ? "bg-[#2563eb]" : "bg-[#f1f5f9]"}`}
                          >
                            {on ? (
                              <CheckCircle className="w-3.5 h-3.5 text-white" />
                            ) : (
                              <span className="w-1.5 h-1.5 rounded-full bg-[#cbd5e1]" />
                            )}
                          </div>
                        </td>
                      ))}
                      <td className="px-3 py-3 text-center text-sm font-bold text-[#1e293b]">
                        {hrs}h
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1 justify-center">
                          <button
                            onClick={() => openEdit(s)}
                            className="p-1.5 text-[#64748b] hover:text-[#2563eb] hover:bg-[#eff6ff] rounded-lg transition-all"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(s)}
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-[#e2e8f0]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0]">
              <h2 className="text-base font-semibold text-[#1e293b]">
                {editSchedule ? "Edit Schedule" : "Create Schedule"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-[#64748b] hover:bg-[#f1f5f9] rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={labelCls}>Guard Name *</label>
                <input
                  className={inputCls}
                  value={form.guard}
                  onChange={(e) => setForm({ ...form, guard: e.target.value })}
                  placeholder="James Mokoena"
                />
              </div>
              <div>
                <label className={labelCls}>Site</label>
                <input
                  className={inputCls}
                  value={form.site}
                  onChange={(e) => setForm({ ...form, site: e.target.value })}
                  placeholder="Sandton City Mall"
                />
              </div>
              <div>
                <label className={labelCls}>Shift Hours</label>
                <input
                  className={inputCls}
                  value={form.shift}
                  onChange={(e) => setForm({ ...form, shift: e.target.value })}
                  placeholder="06:00–18:00"
                />
              </div>
              <div>
                <label className={labelCls}>Working Days</label>
                <div className="flex gap-2 mt-1">
                  {DAYS.map((d, i) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => toggleDay(i)}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                        (form.days || [])[i]
                          ? "bg-[#2563eb] text-white"
                          : "bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0]"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-[#94a3b8] mt-1.5">
                  {(form.days || []).reduce((a, b) => a + b, 0)} days ·{" "}
                  {(form.days || []).reduce((a, b) => a + b, 0) * 12}h/week
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#e2e8f0]">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-[#64748b] border border-[#e2e8f0] rounded-lg hover:bg-[#f8fafc]"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.guard.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium rounded-lg disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? "Saving…" : editSchedule ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm border border-[#e2e8f0] p-6">
            <div className="w-12 h-12 bg-[#fef2f2] rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-[#dc2626]" />
            </div>
            <h3 className="text-base font-semibold text-[#1e293b] text-center mb-2">
              Delete Schedule?
            </h3>
            <p className="text-sm text-[#64748b] text-center mb-6">
              Remove <strong>{deleteConfirm.guard}</strong>'s schedule?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 text-sm border border-[#e2e8f0] rounded-lg hover:bg-[#f8fafc]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm.id)}
                className="flex-1 px-4 py-2 bg-[#dc2626] hover:bg-[#b91c1c] text-white text-sm font-medium rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
