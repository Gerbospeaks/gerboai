import React, { useState, useEffect } from "react";
import {
  Clock,
  Plus,
  X,
  Save,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { db } from "../../firebase";
import {
  collection,
  query,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  orderBy,
} from "firebase/firestore";

const ATTENDANCE_STATUS = ["Present", "Absent", "Late", "Half Day", "Leave"];
const STATUS_STYLES = {
  Present: "bg-[#dcfce7] text-[#166534]",
  Absent: "bg-[#fee2e2] text-[#991b1b]",
  Late: "bg-[#fef3c7] text-[#92400e]",
  "Half Day": "bg-[#dbeafe] text-[#1d4ed8]",
  Leave: "bg-[#f3e8ff] text-[#6b21a8]",
};
const EMPTY = {
  staffName: "",
  date: "",
  status: "Present",
  clockIn: "08:00",
  clockOut: "16:00",
  hoursWorked: "8",
  jobAddress: "",
  notes: "",
};

export default function StaffAttendanceView({ user }) {
  const [records, setRecords] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [filterDate, setFilterDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  useEffect(() => {
    load();
  }, [user]);

  const load = async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const [attSnap, staffSnap] = await Promise.all([
        getDocs(
          query(
            collection(db, "users", user.uid, "attendance"),
            orderBy("date", "desc"),
          ),
        ),
        getDocs(query(collection(db, "users", user.uid, "staff"))),
      ]);
      setRecords(attSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setStaff(staffSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Auto-calc hours when times change
  const calcHours = (clockIn, clockOut) => {
    if (!clockIn || !clockOut) return "";
    const [ih, im] = clockIn.split(":").map(Number);
    const [oh, om] = clockOut.split(":").map(Number);
    const diff = oh * 60 + om - (ih * 60 + im);
    return diff > 0 ? (diff / 60).toFixed(1) : "";
  };

  const handleSave = async () => {
    if (!form.staffName || !form.date) return alert("Staff and date required");
    setSaving(true);
    try {
      const data = { ...form, updatedAt: serverTimestamp() };
      if (editItem)
        await updateDoc(
          doc(db, "users", user.uid, "attendance", editItem.id),
          data,
        );
      else
        await addDoc(collection(db, "users", user.uid, "attendance"), {
          ...data,
          createdAt: serverTimestamp(),
        });
      setShowModal(false);
      load();
    } catch (e) {
      alert("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this attendance record?")) return;
    await deleteDoc(doc(db, "users", user.uid, "attendance", id));
    load();
  };

  const filtered = filterDate
    ? records.filter((r) => r.date === filterDate)
    : records.slice(0, 50);
  const totalHours = filtered.reduce(
    (s, r) => s + (Number(r.hoursWorked) || 0),
    0,
  );
  const presentCount = filtered.filter((r) => r.status === "Present").length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1e293b] flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#0891b2]" />
            Attendance & Hours
          </h1>
          <p className="text-sm text-[#64748b] mt-0.5">
            Daily attendance and time tracking
          </p>
        </div>
        <button
          onClick={() => {
            setEditItem(null);
            setForm({ ...EMPTY, date: filterDate });
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-[#0891b2] hover:bg-[#0e7490] text-white text-sm font-medium rounded-lg"
        >
          <Plus className="w-4 h-4" />
          Log Attendance
        </button>
      </div>

      {/* Date filter + stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-3 shadow-sm sm:col-span-1">
          <label className="block text-xs font-semibold text-[#64748b] uppercase tracking-wide mb-1.5">
            Filter by Date
          </label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0891b2]"
          />
        </div>
        {[
          {
            label: "Present Today",
            value: presentCount,
            color: "text-[#059669]",
          },
          {
            label: "Total Hours",
            value: totalHours.toFixed(1),
            color: "text-[#0891b2]",
          },
          {
            label: "Absent / Late",
            value: filtered.filter(
              (r) => r.status === "Absent" || r.status === "Late",
            ).length,
            color: "text-[#dc2626]",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm"
          >
            <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wide">
              {s.label}
            </p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Records */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-[#e2e8f0] bg-[#f8fafc]">
          <p className="text-sm font-semibold text-[#374151]">
            Records {filterDate ? `for ${filterDate}` : "(recent)"} ·{" "}
            {filtered.length} entries
          </p>
        </div>
        {loading ? (
          <div className="py-8 text-center text-sm text-[#94a3b8]">
            Loading…
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-sm text-[#94a3b8]">
            No records for this date
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#e2e8f0] bg-[#f8fafc]">
                  {[
                    "Staff",
                    "Date",
                    "Status",
                    "Clock In",
                    "Clock Out",
                    "Hours",
                    "",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f5f9]">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-[#f8fafc]">
                    <td className="px-4 py-3 text-sm font-medium text-[#374151]">
                      {r.staffName}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#64748b]">
                      {r.date}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded ${STATUS_STYLES[r.status] || "bg-[#f1f5f9] text-[#475569]"}`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#64748b]">
                      {r.clockIn || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#64748b]">
                      {r.clockOut || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-[#0891b2]">
                      {r.hoursWorked ? `${r.hoursWorked}h` : "—"}
                    </td>
                    <td className="px-4 py-3 flex gap-1">
                      <button
                        onClick={() => {
                          setEditItem(r);
                          setForm({ ...EMPTY, ...r });
                          setShowModal(true);
                        }}
                        className="p-1.5 text-[#94a3b8] hover:text-[#374151] hover:bg-[#e2e8f0] rounded"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="p-1.5 text-[#94a3b8] hover:text-[#dc2626] hover:bg-[#fef2f2] rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#e2e8f0]">
              <h2 className="text-base font-semibold text-[#1e293b]">
                {editItem ? "Edit Record" : "Log Attendance"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-[#94a3b8] hover:bg-[#e2e8f0] rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">
                  Staff Member *
                </label>
                <select
                  value={form.staffName}
                  onChange={(e) =>
                    setForm({ ...form, staffName: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2]"
                >
                  <option value="">Select…</option>
                  {staff.map((s) => (
                    <option key={s.id} value={`${s.firstName} ${s.lastName}`}>
                      {s.firstName} {s.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2]"
                  >
                    {ATTENDANCE_STATUS.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">
                    Clock In
                  </label>
                  <input
                    type="time"
                    value={form.clockIn}
                    onChange={(e) => {
                      const h = calcHours(e.target.value, form.clockOut);
                      setForm({
                        ...form,
                        clockIn: e.target.value,
                        hoursWorked: h || form.hoursWorked,
                      });
                    }}
                    className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">
                    Clock Out
                  </label>
                  <input
                    type="time"
                    value={form.clockOut}
                    onChange={(e) => {
                      const h = calcHours(form.clockIn, e.target.value);
                      setForm({
                        ...form,
                        clockOut: e.target.value,
                        hoursWorked: h || form.hoursWorked,
                      });
                    }}
                    className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">
                  Hours Worked
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={form.hoursWorked}
                  onChange={(e) =>
                    setForm({ ...form, hoursWorked: e.target.value })
                  }
                  placeholder="8"
                  className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">
                  Notes
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2] resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 px-5 py-4 border-t border-[#e2e8f0]">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm border border-[#e2e8f0] rounded-lg text-[#64748b] hover:bg-[#f8fafc]"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-[#0891b2] text-white text-sm font-medium rounded-lg disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
