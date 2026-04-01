import React, { useState, useEffect, useCallback } from "react";
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
import { db } from "../../firebase";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Clock,
  UserCheck,
  Building,
  Edit,
  Trash2,
  Sun,
  Moon,
  Sunset,
  AlertCircle,
  CheckCircle,
  Calendar,
  Users,
  Filter,
  Search,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const SHIFT_TYPES = [
  {
    id: "day",
    label: "Day Shift",
    hours: "06:00 – 18:00",
    icon: Sun,
    color: "bg-[#fffbeb] text-[#b45309] border-[#fde68a]",
    dot: "bg-[#f59e0b]",
  },
  {
    id: "night",
    label: "Night Shift",
    hours: "18:00 – 06:00",
    icon: Moon,
    color: "bg-[#eff6ff] text-[#1d4ed8] border-[#bfdbfe]",
    dot: "bg-[#3b82f6]",
  },
  {
    id: "swing",
    label: "Swing Shift",
    hours: "14:00 – 22:00",
    icon: Sunset,
    color: "bg-[#f5f3ff] text-[#6d28d9] border-[#ddd6fe]",
    dot: "bg-[#8b5cf6]",
  },
  {
    id: "off",
    label: "Day Off",
    hours: "—",
    icon: CheckCircle,
    color: "bg-[#f0fdf4] text-[#15803d] border-[#bbf7d0]",
    dot: "bg-[#22c55e]",
  },
];

const shiftMeta = (id) =>
  SHIFT_TYPES.find((s) => s.id === id) || SHIFT_TYPES[0];

const inputCls =
  "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-lg bg-white text-[#1e293b] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-[#2563eb] transition-colors";
const labelCls =
  "block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const dateKey = (y, m, d) =>
  `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

const today = new Date();

// ═════════════════════════════════════════════════════════════════════════════
// SHIFT MODAL
// ═════════════════════════════════════════════════════════════════════════════
const ShiftModal = ({ shift, guards, sites, onSave, onDelete, onClose }) => {
  const [form, setForm] = useState({
    guardId: shift?.guardId || "",
    guardName: shift?.guardName || "",
    siteId: shift?.siteId || "",
    siteName: shift?.siteName || "",
    shiftType: shift?.shiftType || "day",
    date: shift?.date || "",
    startTime: shift?.startTime || "",
    endTime: shift?.endTime || "",
    notes: shift?.notes || "",
    status: shift?.status || "scheduled",
  });

  const set = (k) => (e) => {
    const val = e.target.value;
    setForm((p) => {
      const next = { ...p, [k]: val };
      if (k === "guardId") {
        const g = guards.find((x) => x.id === val);
        next.guardName = g ? g.name || g.guardName || "" : "";
      }
      if (k === "siteId") {
        const s = sites.find((x) => x.id === val);
        next.siteName = s ? s.name || s.siteName || "" : "";
      }
      if (k === "shiftType") {
        const meta = shiftMeta(val);
        const [st, et] = (meta.hours !== "—" ? meta.hours : "").split(" – ");
        next.startTime = st || "";
        next.endTime = et || "";
      }
      return next;
    });
  };

  const handleSave = () => {
    if (!form.guardId || !form.date || !form.shiftType) {
      alert("Please fill in Guard, Date and Shift Type.");
      return;
    }
    onSave({ ...form, ...(shift?.id ? { id: shift.id } : {}) });
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-[#e2e8f0]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0] bg-[#f8fafc]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#0f172a] rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#1e293b]">
                {shift?.id ? "Edit Shift" : "Add Shift"}
              </h2>
              <p className="text-xs text-[#64748b]">
                {form.date || "Select a date"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#64748b] hover:text-[#1e293b] hover:bg-[#e2e8f0] rounded-lg transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Shift type pills */}
          <div>
            <label className={labelCls}>Shift Type</label>
            <div className="grid grid-cols-2 gap-2">
              {SHIFT_TYPES.map(({ id, label, hours, icon: Icon, color }) => (
                <button
                  key={id}
                  onClick={() =>
                    setForm((p) => {
                      const meta = shiftMeta(id);
                      const [st, et] = (
                        meta.hours !== "—" ? meta.hours : ""
                      ).split(" – ");
                      return {
                        ...p,
                        shiftType: id,
                        startTime: st || "",
                        endTime: et || "",
                      };
                    })
                  }
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                    form.shiftType === id
                      ? color + " ring-2 ring-offset-1 ring-current"
                      : "bg-white border-[#e2e8f0] text-[#64748b] hover:bg-[#f8fafc]"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <div className="text-left">
                    <div>{label}</div>
                    <div className="font-normal opacity-70 text-[10px]">
                      {hours}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Guard */}
          <div>
            <label className={labelCls}>Guard</label>
            <select
              value={form.guardId}
              onChange={set("guardId")}
              className={inputCls}
            >
              <option value="">Select guard...</option>
              {guards.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name || g.guardName || g.id}
                </option>
              ))}
            </select>
          </div>

          {/* Site */}
          <div>
            <label className={labelCls}>Site</label>
            <select
              value={form.siteId}
              onChange={set("siteId")}
              className={inputCls}
            >
              <option value="">Select site...</option>
              {sites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name || s.siteName || s.id}
                </option>
              ))}
            </select>
          </div>

          {/* Date + Times */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>Date</label>
              <input
                type="date"
                value={form.date}
                onChange={set("date")}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Start</label>
              <input
                type="time"
                value={form.startTime}
                onChange={set("startTime")}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>End</label>
              <input
                type="time"
                value={form.endTime}
                onChange={set("endTime")}
                className={inputCls}
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className={labelCls}>Status</label>
            <select
              value={form.status}
              onChange={set("status")}
              className={inputCls}
            >
              <option value="scheduled">Scheduled</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="absent">Absent / No-show</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className={labelCls}>Notes</label>
            <textarea
              rows={2}
              value={form.notes}
              onChange={set("notes")}
              placeholder="Optional notes..."
              className={inputCls + " resize-none"}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#e2e8f0] bg-[#f8fafc]">
          {shift?.id ? (
            <button
              onClick={() => onDelete(shift.id)}
              className="flex items-center gap-1.5 px-3 py-2 text-[#dc2626] hover:bg-[#fef2f2] border border-[#fecaca] rounded-lg text-sm font-medium transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          ) : (
            <div />
          )}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-[#374151] bg-white border border-[#e2e8f0] rounded-lg hover:bg-[#f1f5f9] transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 text-sm text-white bg-[#2563eb] hover:bg-[#1d4ed8] rounded-lg transition-colors font-semibold shadow-sm"
            >
              {shift?.id ? "Update Shift" : "Add Shift"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// SHIFT CHIP (rendered inside calendar cell)
// ═════════════════════════════════════════════════════════════════════════════
const ShiftChip = ({ shift, onClick }) => {
  const meta = shiftMeta(shift.shiftType);
  const Icon = meta.icon;
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onClick(shift);
      }}
      className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border cursor-pointer hover:opacity-80 transition-opacity truncate ${meta.color}`}
    >
      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${meta.dot}`} />
      <span className="truncate">{shift.guardName || "Guard"}</span>
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// STATUS BADGE
// ═════════════════════════════════════════════════════════════════════════════
const StatusBadge = ({ status }) => {
  const map = {
    scheduled: "bg-[#eff6ff] text-[#1d4ed8]",
    confirmed: "bg-[#f0fdf4] text-[#15803d]",
    completed: "bg-[#f1f5f9] text-[#475569]",
    absent: "bg-[#fef2f2] text-[#dc2626]",
    cancelled: "bg-[#fef2f2] text-[#991b1b]",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${map[status] || map.scheduled}`}
    >
      {status}
    </span>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════════════
const ShiftCalendarPage = ({ user }) => {
  const [view, setView] = useState("month"); // month | week | list
  const [current, setCurrent] = useState(new Date());
  const [shifts, setShifts] = useState([]);
  const [guards, setGuards] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | { shift, date }
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedDay, setSelectedDay] = useState(null);

  const uid = user?.uid;

  // ── Fetch data ─────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    if (!uid) return;
    setLoading(true);
    try {
      const [shiftSnap, guardSnap, siteSnap] = await Promise.all([
        getDocs(
          query(collection(db, "users", uid, "shifts"), orderBy("date", "asc")),
        ),
        getDocs(collection(db, "users", uid, "guards")),
        getDocs(collection(db, "users", uid, "sites")),
      ]);
      setShifts(shiftSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setGuards(guardSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setSites(siteSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [uid]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ── Save shift ──────────────────────────────────────────────────────────
  const handleSave = async (data) => {
    if (!uid) return;
    try {
      if (data.id) {
        const { id, ...rest } = data;
        await updateDoc(doc(db, "users", uid, "shifts", id), {
          ...rest,
          updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, "users", uid, "shifts"), {
          ...data,
          createdAt: serverTimestamp(),
        });
      }
      setModal(null);
      fetchAll();
    } catch (err) {
      alert("Error saving shift: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!uid || !window.confirm("Delete this shift?")) return;
    await deleteDoc(doc(db, "users", uid, "shifts", id));
    setModal(null);
    fetchAll();
  };

  // ── Calendar helpers ────────────────────────────────────────────────────
  const year = current.getFullYear();
  const month = current.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

  const shiftsOnDate = (y, m, d) => {
    const k = dateKey(y, m, d);
    return shifts.filter(
      (s) =>
        s.date === k &&
        (filterType === "all" || s.shiftType === filterType) &&
        (!search ||
          (s.guardName || "").toLowerCase().includes(search.toLowerCase()) ||
          (s.siteName || "").toLowerCase().includes(search.toLowerCase())),
    );
  };

  const isToday = (d) =>
    d === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear();

  // ── Week view helpers ───────────────────────────────────────────────────
  const startOfWeek = (date) => {
    const d = new Date(date);
    d.setDate(d.getDate() - d.getDay());
    return d;
  };
  const weekStart = startOfWeek(current);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  // ── Stats ───────────────────────────────────────────────────────────────
  const monthShifts = shifts.filter((s) => {
    if (!s.date) return false;
    const [sy, sm] = s.date.split("-").map(Number);
    return sy === year && sm === month + 1;
  });

  const navPrev = () => {
    const d = new Date(current);
    view === "week" ? d.setDate(d.getDate() - 7) : d.setMonth(d.getMonth() - 1);
    setCurrent(d);
  };
  const navNext = () => {
    const d = new Date(current);
    view === "week" ? d.setDate(d.getDate() + 7) : d.setMonth(d.getMonth() + 1);
    setCurrent(d);
  };

  const openAdd = (date = "") => setModal({ shift: { date }, isNew: true });
  const openEdit = (shift) => setModal({ shift, isNew: false });

  // ── Filtered list view shifts ───────────────────────────────────────────
  const listShifts = shifts
    .filter(
      (s) =>
        (filterType === "all" || s.shiftType === filterType) &&
        (!search ||
          (s.guardName || "").toLowerCase().includes(search.toLowerCase()) ||
          (s.siteName || "").toLowerCase().includes(search.toLowerCase())),
    )
    .sort((a, b) => (a.date > b.date ? 1 : -1));

  return (
    <div className="flex-1 overflow-hidden flex flex-col h-full">
      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 bg-white border-b border-[#e2e8f0] px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold text-[#1e293b] flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#2563eb]" />
              Shift Calendar
            </h1>
            <p className="text-xs text-[#64748b] mt-0.5">
              {monthShifts.length} shifts scheduled this month
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94a3b8]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search guard / site…"
                className="pl-8 pr-3 py-1.5 text-xs border border-[#e2e8f0] rounded-lg bg-[#f8fafc] text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#2563eb] w-40"
              />
            </div>

            {/* Filter by shift type */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="text-xs border border-[#e2e8f0] rounded-lg px-2 py-1.5 bg-[#f8fafc] text-[#374151] focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
            >
              <option value="all">All Types</option>
              {SHIFT_TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>

            {/* View toggle */}
            <div className="flex rounded-lg border border-[#e2e8f0] overflow-hidden bg-[#f8fafc]">
              {["month", "week", "list"].map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-3 py-1.5 text-xs font-semibold capitalize transition-all ${
                    view === v
                      ? "bg-[#0f172a] text-white"
                      : "text-[#64748b] hover:text-[#1e293b] hover:bg-[#e2e8f0]"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>

            {/* Add shift */}
            <button
              onClick={() => openAdd()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Add Shift
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap gap-3 mt-4">
          {[
            {
              label: "Day Shifts",
              count: monthShifts.filter((s) => s.shiftType === "day").length,
              dot: "bg-[#f59e0b]",
              text: "text-[#b45309]",
            },
            {
              label: "Night Shifts",
              count: monthShifts.filter((s) => s.shiftType === "night").length,
              dot: "bg-[#3b82f6]",
              text: "text-[#1d4ed8]",
            },
            {
              label: "Swing Shifts",
              count: monthShifts.filter((s) => s.shiftType === "swing").length,
              dot: "bg-[#8b5cf6]",
              text: "text-[#6d28d9]",
            },
            {
              label: "Days Off",
              count: monthShifts.filter((s) => s.shiftType === "off").length,
              dot: "bg-[#22c55e]",
              text: "text-[#15803d]",
            },
            {
              label: "Guards",
              count: guards.length,
              dot: "bg-[#0f172a]",
              text: "text-[#1e293b]",
            },
          ].map(({ label, count, dot, text }) => (
            <div
              key={label}
              className="flex items-center gap-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg px-3 py-1.5"
            >
              <div className={`w-2 h-2 rounded-full ${dot}`} />
              <span className="text-xs text-[#64748b]">{label}</span>
              <span className={`text-xs font-bold ${text}`}>{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Calendar navigation ───────────────────────────────────────────── */}
      {view !== "list" && (
        <div className="flex-shrink-0 bg-white border-b border-[#e2e8f0] px-5 py-3 flex items-center justify-between">
          <button
            onClick={navPrev}
            className="p-1.5 text-[#64748b] hover:text-[#1e293b] hover:bg-[#f1f5f9] rounded-lg transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="text-center">
            <p className="text-sm font-bold text-[#1e293b]">
              {view === "month"
                ? `${MONTHS[month]} ${year}`
                : `${weekStart.toLocaleDateString("en-ZA", { day: "numeric", month: "short" })} – ${weekDays[6].toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })}`}
            </p>
          </div>
          <button
            onClick={navNext}
            className="p-1.5 text-[#64748b] hover:text-[#1e293b] hover:bg-[#f1f5f9] rounded-lg transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Content area ──────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto bg-[#f0f2f5]">
        {/* ════ MONTH VIEW ════ */}
        {view === "month" && (
          <div className="p-4">
            <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm overflow-hidden">
              {/* Day headers */}
              <div className="grid grid-cols-7 border-b border-[#e2e8f0]">
                {DAYS.map((d) => (
                  <div
                    key={d}
                    className="py-2.5 text-center text-xs font-bold text-[#64748b] uppercase tracking-widest bg-[#f8fafc]"
                  >
                    {d}
                  </div>
                ))}
              </div>

              {/* Grid */}
              <div
                className="grid grid-cols-7"
                style={{ gridAutoRows: "minmax(100px, auto)" }}
              >
                {Array.from({ length: totalCells }).map((_, idx) => {
                  const dayNum = idx - firstDay + 1;
                  const inMonth = dayNum >= 1 && dayNum <= daysInMonth;
                  const dayShifts = inMonth
                    ? shiftsOnDate(year, month, dayNum)
                    : [];
                  const todayCell = inMonth && isToday(dayNum);

                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        if (!inMonth) return;
                        openAdd(dateKey(year, month, dayNum));
                      }}
                      className={`border-r border-b border-[#f1f5f9] p-1.5 cursor-pointer transition-colors ${
                        inMonth
                          ? "hover:bg-[#f8fafc]"
                          : "bg-[#fafafa] opacity-40 cursor-default"
                      }`}
                    >
                      {inMonth && (
                        <>
                          <div
                            className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold mb-1 ${
                              todayCell
                                ? "bg-[#2563eb] text-white"
                                : "text-[#374151]"
                            }`}
                          >
                            {dayNum}
                          </div>
                          <div className="space-y-0.5">
                            {dayShifts.slice(0, 3).map((s) => (
                              <ShiftChip
                                key={s.id}
                                shift={s}
                                onClick={openEdit}
                              />
                            ))}
                            {dayShifts.length > 3 && (
                              <div className="text-[10px] text-[#94a3b8] font-semibold pl-1">
                                +{dayShifts.length - 3} more
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ════ WEEK VIEW ════ */}
        {view === "week" && (
          <div className="p-4">
            <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm overflow-hidden">
              <div className="grid grid-cols-7 border-b border-[#e2e8f0]">
                {weekDays.map((d, i) => {
                  const isT = d.toDateString() === today.toDateString();
                  return (
                    <div
                      key={i}
                      className={`py-3 text-center border-r border-[#f1f5f9] ${isT ? "bg-[#eff6ff]" : "bg-[#f8fafc]"}`}
                    >
                      <p className="text-xs text-[#94a3b8] font-semibold uppercase">
                        {DAYS[d.getDay()]}
                      </p>
                      <p
                        className={`text-lg font-bold mt-0.5 ${isT ? "text-[#2563eb]" : "text-[#1e293b]"}`}
                      >
                        {d.getDate()}
                      </p>
                      <p className="text-[10px] text-[#94a3b8]">
                        {MONTHS[d.getMonth()].slice(0, 3)}
                      </p>
                    </div>
                  );
                })}
              </div>
              <div className="grid grid-cols-7 min-h-[400px]">
                {weekDays.map((d, i) => {
                  const k = dateKey(d.getFullYear(), d.getMonth(), d.getDate());
                  const dayShifts = shifts.filter(
                    (s) =>
                      s.date === k &&
                      (filterType === "all" || s.shiftType === filterType) &&
                      (!search ||
                        (s.guardName || "")
                          .toLowerCase()
                          .includes(search.toLowerCase())),
                  );
                  return (
                    <div
                      key={i}
                      onClick={() => openAdd(k)}
                      className="border-r border-[#f1f5f9] p-2 space-y-1 cursor-pointer hover:bg-[#f8fafc] transition-colors"
                    >
                      {dayShifts.map((s) => {
                        const meta = shiftMeta(s.shiftType);
                        return (
                          <div
                            key={s.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              openEdit(s);
                            }}
                            className={`p-2 rounded-lg border text-xs cursor-pointer hover:opacity-80 transition-opacity ${meta.color}`}
                          >
                            <div className="font-bold truncate">
                              {s.guardName || "Guard"}
                            </div>
                            <div className="opacity-70 truncate">
                              {s.siteName || "—"}
                            </div>
                            <div className="flex items-center gap-1 mt-1 opacity-60">
                              <Clock className="w-2.5 h-2.5" />
                              {s.startTime || "—"} – {s.endTime || "—"}
                            </div>
                          </div>
                        );
                      })}
                      {dayShifts.length === 0 && (
                        <div className="flex items-center justify-center h-12 text-[#e2e8f0]">
                          <Plus className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ════ LIST VIEW ════ */}
        {view === "list" && (
          <div className="p-4 space-y-3">
            {loading ? (
              [1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-16 bg-white rounded-xl animate-pulse border border-[#e2e8f0]"
                />
              ))
            ) : listShifts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl border border-[#e2e8f0] shadow-sm">
                <div className="w-12 h-12 bg-[#f1f5f9] rounded-full flex items-center justify-center mb-4">
                  <Calendar className="w-6 h-6 text-[#94a3b8]" />
                </div>
                <p className="text-sm font-semibold text-[#374151] mb-1">
                  No shifts found
                </p>
                <p className="text-xs text-[#94a3b8] mb-4">
                  Add your first shift to get started
                </p>
                <button
                  onClick={() => openAdd()}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Shift
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                      {[
                        "Date",
                        "Guard",
                        "Site",
                        "Shift",
                        "Hours",
                        "Status",
                        "",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left text-xs font-bold text-[#64748b] uppercase tracking-wide"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {listShifts.map((s, i) => {
                      const meta = shiftMeta(s.shiftType);
                      const Icon = meta.icon;
                      return (
                        <tr
                          key={s.id}
                          className={`border-b border-[#f1f5f9] hover:bg-[#f8fafc] transition-colors ${i % 2 === 0 ? "" : "bg-[#fafafa]"}`}
                        >
                          <td className="px-4 py-3 text-sm font-semibold text-[#1e293b]">
                            {s.date || "—"}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 bg-[#0f172a] rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-[10px] font-bold">
                                  {(s.guardName || "?")[0].toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-[#1e293b]">
                                  {s.guardName || "—"}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5 text-xs text-[#374151]">
                              <Building className="w-3 h-3 text-[#94a3b8]" />
                              {s.siteName || "—"}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-[10px] font-bold ${meta.color}`}
                            >
                              <Icon className="w-3 h-3" />
                              {meta.label}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1 text-xs text-[#64748b]">
                              <Clock className="w-3 h-3" />
                              {s.startTime || "—"} – {s.endTime || "—"}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={s.status} />
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => openEdit(s)}
                              className="p-1.5 text-[#64748b] hover:text-[#1e293b] hover:bg-[#f1f5f9] rounded-lg transition-all"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Legend ────────────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 bg-white border-t border-[#e2e8f0] px-5 py-2.5 flex flex-wrap items-center gap-4">
        <span className="text-xs font-semibold text-[#94a3b8] uppercase tracking-widest">
          Legend
        </span>
        {SHIFT_TYPES.map(({ id, label, dot }) => (
          <div key={id} className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${dot}`} />
            <span className="text-xs text-[#64748b]">{label}</span>
          </div>
        ))}
        <div className="ml-auto text-xs text-[#94a3b8]">
          Click any cell to add a shift
        </div>
      </div>

      {/* ── Modal ─────────────────────────────────────────────────────────── */}
      {modal && (
        <ShiftModal
          shift={modal.shift}
          guards={guards}
          sites={sites}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
};

export default ShiftCalendarPage;
