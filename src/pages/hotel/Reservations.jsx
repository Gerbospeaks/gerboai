import React, { useState, useEffect } from "react";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import {
  Calendar,
  Plus,
  Search,
  X,
  Edit2,
  Trash2,
  AlertCircle,
  User,
  Bed,
  Clock,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  DoorOpen,
  CreditCard,
  Phone,
  Mail,
  Hash,
  Users,
  StickyNote,
} from "lucide-react";

const STATUS_CONFIG = {
  confirmed: {
    label: "Confirmed",
    bg: "bg-[#dcfce7]",
    text: "text-[#166534]",
    dot: "bg-[#22c55e]",
  },
  pending: {
    label: "Pending",
    bg: "bg-[#dbeafe]",
    text: "text-[#1e40af]",
    dot: "bg-[#3b82f6]",
  },
  checked_in: {
    label: "Checked In",
    bg: "bg-[#f3e8ff]",
    text: "text-[#6b21a8]",
    dot: "bg-[#a855f7]",
  },
  checked_out: {
    label: "Checked Out",
    bg: "bg-[#f1f5f9]",
    text: "text-[#475569]",
    dot: "bg-[#94a3b8]",
  },
  cancelled: {
    label: "Cancelled",
    bg: "bg-[#fef2f2]",
    text: "text-[#991b1b]",
    dot: "bg-[#ef4444]",
  },
  no_show: {
    label: "No Show",
    bg: "bg-[#fef3c7]",
    text: "text-[#92400e]",
    dot: "bg-[#f59e0b]",
  },
};

// Keep Room Management's status in sync with whatever a reservation's
// status becomes. Same map CheckInOutModal uses — reservations and rooms
// now share one source of truth.
const ROOM_STATUS_BY_RESERVATION_STATUS = {
  confirmed: "reserved",
  pending: "reserved",
  checked_in: "occupied",
  checked_out: "available",
  cancelled: "available",
  no_show: "available",
};

const syncRoomStatus = async (db, userId, roomId, status) => {
  if (!userId || !roomId || !status) return;
  try {
    await updateDoc(doc(db, "users", userId, "rooms", roomId), {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    // Don't let a room-sync failure block saving the reservation.
    console.error("Error syncing room status:", error);
  }
};

const EMPTY_FORM = {
  guestName: "",
  guestEmail: "",
  guestPhone: "",
  guestId: "",
  roomId: "",
  roomNumber: "",
  roomType: "",
  checkInDate: "",
  checkOutDate: "",
  numberOfNights: "",
  numberOfGuests: "1",
  ratePerNight: "",
  totalAmount: "",
  depositPaid: "0",
  status: "confirmed",
  source: "Direct",
  specialRequests: "",
  notes: "",
};

const nights = (ci, co) => {
  if (!ci || !co) return 0;
  const diff = new Date(co) - new Date(ci);
  return Math.max(0, Math.round(diff / 86400000));
};

// Firestore Timestamps expose toMillis(); fall back to 0 for records that
// predate the createdAt field (or were added another way) so they still
// sort predictably instead of breaking the sort.
const toMillis = (ts) =>
  ts && typeof ts.toMillis === "function" ? ts.toMillis() : 0;

export default function Reservations({ user }) {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("list"); // "list" | "calendar"
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [viewReservation, setViewReservation] = useState(null);
  // Calendar month state
  const [calMonth, setCalMonth] = useState(new Date());
  // Rooms, pulled live from Room Management for the Room Number dropdown.
  const [rooms, setRooms] = useState([]);
  const [roomsLoading, setRoomsLoading] = useState(false);

  const db = getFirestore();

  useEffect(() => {
    if (user?.uid) {
      fetchReservations();
      loadRooms();
    }
  }, [user]);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      // NOTE: deliberately no server-side orderBy() here. Firestore's
      // orderBy() silently EXCLUDES any document missing that field, so a
      // reservation created without (or before) a `createdAt` timestamp
      // would just vanish from the results — showing "No reservations
      // found" even though the data is really there. Fetching everything
      // and sorting client-side avoids that trap.
      const snap = await getDocs(
        collection(db, "users", user.uid, "reservations"),
      );
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));
      setReservations(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadRooms = async () => {
    if (!user?.uid) return;
    setRoomsLoading(true);
    try {
      // Same reasoning as above: fetch raw and sort client-side rather
      // than relying on a server-side orderBy that could hide rooms.
      const snap = await getDocs(collection(db, "users", user.uid, "rooms"));
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      data.sort((a, b) =>
        (a.roomNumber || "").localeCompare(b.roomNumber || "", undefined, {
          numeric: true,
        }),
      );
      setRooms(data);
    } catch (e) {
      console.error("Error loading rooms:", e);
    } finally {
      setRoomsLoading(false);
    }
  };

  // Rooms selectable in the dropdown: only ones actually free right now,
  // plus whichever room is already on this reservation (so editing doesn't
  // lose the selection just because that room's status moved on).
  const selectableRooms = rooms.filter(
    (r) => r.status === "available" || r.id === form.roomId,
  );

  const handleRoomSelect = (roomId) => {
    const room = rooms.find((r) => r.id === roomId);
    const updated = {
      ...form,
      roomId,
      roomNumber: room?.roomNumber || "",
      roomType: room?.roomType || form.roomType,
    };
    // Convenience: pull the room's nightly rate across if one hasn't been
    // set yet, and recalculate the total to match.
    if (room?.ratePerNight && !form.ratePerNight) {
      updated.ratePerNight = String(room.ratePerNight);
      updated.totalAmount = String(
        Number(form.numberOfNights || 0) * Number(room.ratePerNight),
      );
    }
    setForm(updated);
  };

  // Auto-calc total when rate or nights change
  const handleFormChange = (key, value) => {
    const updated = { ...form, [key]: value };
    if (key === "checkInDate" || key === "checkOutDate") {
      const n = nights(
        key === "checkInDate" ? value : form.checkInDate,
        key === "checkOutDate" ? value : form.checkOutDate,
      );
      updated.numberOfNights = String(n);
      if (form.ratePerNight)
        updated.totalAmount = String(n * Number(form.ratePerNight));
    }
    if (key === "ratePerNight") {
      updated.totalAmount = String(
        Number(updated.numberOfNights || 0) * Number(value || 0),
      );
    }
    setForm(updated);
  };

  const openNew = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowModal(true);
  };
  const openEdit = (r) => {
    setForm({ ...EMPTY_FORM, ...r });
    setEditingId(r.id);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.guestName || !form.checkInDate || !form.checkOutDate) return;
    setSaving(true);
    try {
      const payload = { ...form, updatedAt: serverTimestamp() };
      if (editingId) {
        await updateDoc(
          doc(db, "users", user.uid, "reservations", editingId),
          payload,
        );
      } else {
        await addDoc(collection(db, "users", user.uid, "reservations"), {
          ...payload,
          createdAt: serverTimestamp(),
        });
      }

      // Keep the room's status in Room Management aligned with whatever
      // this reservation's status now is.
      const roomStatus = ROOM_STATUS_BY_RESERVATION_STATUS[payload.status];
      if (roomStatus && form.roomId) {
        await syncRoomStatus(db, user.uid, form.roomId, roomStatus);
      }

      setShowModal(false);
      fetchReservations();
      loadRooms();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const quickStatus = async (r, newStatus) => {
    try {
      await updateDoc(doc(db, "users", user.uid, "reservations", r.id), {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });

      const roomStatus = ROOM_STATUS_BY_RESERVATION_STATUS[newStatus];
      if (roomStatus && r.roomId) {
        await syncRoomStatus(db, user.uid, r.roomId, roomStatus);
        loadRooms();
      }

      setReservations((prev) =>
        prev.map((x) => (x.id === r.id ? { ...x, status: newStatus } : x)),
      );
      if (viewReservation?.id === r.id)
        setViewReservation({ ...viewReservation, status: newStatus });
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id) => {
    try {
      const target = reservations.find((r) => r.id === id);
      await deleteDoc(doc(db, "users", user.uid, "reservations", id));

      // Deleting an active (not yet checked-out/cancelled) reservation
      // releases its room back to available.
      if (
        target?.roomId &&
        !["checked_out", "cancelled", "no_show"].includes(target.status)
      ) {
        await syncRoomStatus(db, user.uid, target.roomId, "available");
        loadRooms();
      }

      setDeleteConfirm(null);
      setViewReservation(null);
      fetchReservations();
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = reservations.filter((r) => {
    const m =
      r.guestName?.toLowerCase().includes(search.toLowerCase()) ||
      r.roomNumber?.toLowerCase().includes(search.toLowerCase()) ||
      r.guestId?.toLowerCase().includes(search.toLowerCase());
    return m && (statusFilter === "all" || r.status === statusFilter);
  });

  // Calendar helpers
  const calDays = () => {
    const year = calMonth.getFullYear();
    const month = calMonth.getMonth();
    const first = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < first; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d));
    return days;
  };

  const resForDay = (day) => {
    if (!day) return [];
    const ds = day.toISOString().split("T")[0];
    return reservations.filter(
      (r) => r.checkInDate === ds || r.checkOutDate === ds,
    );
  };

  const stats = {
    total: reservations.length,
    today: reservations.filter((r) => {
      const t = new Date().toISOString().split("T")[0];
      return r.checkInDate === t || r.checkOutDate === t;
    }).length,
    arriving: reservations.filter(
      (r) =>
        r.checkInDate === new Date().toISOString().split("T")[0] &&
        r.status !== "checked_in",
    ).length,
    departing: reservations.filter(
      (r) =>
        r.checkOutDate === new Date().toISOString().split("T")[0] &&
        r.status === "checked_in",
    ).length,
    confirmed: reservations.filter((r) => r.status === "confirmed").length,
  };

  const inputCls =
    "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-lg bg-white text-[#1e293b] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#1d4ed8] focus:border-[#1d4ed8] transition-colors";
  const labelCls =
    "block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#0f172a] flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#1d4ed8]" /> Reservations
          </h1>
          <p className="text-sm text-[#64748b] mt-0.5">
            {stats.arriving > 0 && (
              <span className="text-[#059669] font-semibold">
                {stats.arriving} arriving ·{" "}
              </span>
            )}
            {stats.departing > 0 && (
              <span className="text-[#ef4444] font-semibold">
                {stats.departing} departing ·{" "}
              </span>
            )}
            {reservations.length} total bookings
          </p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 bg-[#1d4ed8] hover:bg-[#1e40af] text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> New Reservation
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: "Total Bookings",
            value: stats.total,
            icon: Calendar,
            color: "text-[#1d4ed8]",
            bg: "bg-[#dbeafe]",
          },
          {
            label: "Today Activity",
            value: stats.today,
            icon: Clock,
            color: "text-[#7c3aed]",
            bg: "bg-[#f3e8ff]",
          },
          {
            label: "Arriving Today",
            value: stats.arriving,
            icon: DoorOpen,
            color: "text-[#059669]",
            bg: "bg-[#dcfce7]",
          },
          {
            label: "Confirmed",
            value: stats.confirmed,
            icon: CheckCircle,
            color: "text-[#0e7490]",
            bg: "bg-[#e0f2fe]",
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
            placeholder="Search guest name, room, ID..."
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-[#e2e8f0] rounded-xl bg-white text-[#1e293b] placeholder-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#1d4ed8] transition-colors"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["all", ...Object.keys(STATUS_CONFIG)].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${statusFilter === s ? "bg-[#1d4ed8] text-white" : "bg-white border border-[#e2e8f0] text-[#64748b] hover:bg-[#f8fafc]"}`}
            >
              {s === "all" ? "All" : STATUS_CONFIG[s]?.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {[
            { mode: "list", icon: "☰" },
            { mode: "calendar", icon: "▦" },
          ].map(({ mode, icon }) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`w-9 h-9 rounded-xl text-sm font-bold border transition-colors ${viewMode === mode ? "bg-[#1d4ed8] text-white border-[#1d4ed8]" : "bg-white text-[#64748b] border-[#e2e8f0] hover:bg-[#f8fafc]"}`}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-[#1d4ed8] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : viewMode === "calendar" ? (
        /* ── Calendar view ── */
        <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
          {/* Month nav */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#e2e8f0] bg-[#f8fafc]">
            <button
              onClick={() =>
                setCalMonth(
                  new Date(calMonth.getFullYear(), calMonth.getMonth() - 1),
                )
              }
              className="p-1.5 rounded-lg hover:bg-[#e2e8f0] transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-[#64748b]" />
            </button>
            <h3 className="text-sm font-bold text-[#1e293b]">
              {calMonth.toLocaleString("default", {
                month: "long",
                year: "numeric",
              })}
            </h3>
            <button
              onClick={() =>
                setCalMonth(
                  new Date(calMonth.getFullYear(), calMonth.getMonth() + 1),
                )
              }
              className="p-1.5 rounded-lg hover:bg-[#e2e8f0] transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-[#64748b]" />
            </button>
          </div>
          <div className="grid grid-cols-7">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div
                key={d}
                className="py-2 text-center text-xs font-bold text-[#94a3b8] border-b border-[#e2e8f0]"
              >
                {d}
              </div>
            ))}
            {calDays().map((day, i) => {
              const dayRes = day ? resForDay(day) : [];
              const isToday =
                day && day.toDateString() === new Date().toDateString();
              return (
                <div
                  key={i}
                  className={`min-h-[80px] p-1.5 border-b border-r border-[#f1f5f9] ${!day ? "bg-[#fafafa]" : isToday ? "bg-[#eff6ff]" : "bg-white hover:bg-[#f8fafc]"} transition-colors`}
                >
                  {day && (
                    <>
                      <span
                        className={`text-xs font-semibold block mb-1 ${isToday ? "text-[#1d4ed8]" : "text-[#374151]"}`}
                      >
                        {day.getDate()}
                      </span>
                      {dayRes.slice(0, 2).map((r) => {
                        const s =
                          STATUS_CONFIG[r.status] || STATUS_CONFIG.confirmed;
                        const isCheckIn =
                          r.checkInDate === day.toISOString().split("T")[0];
                        return (
                          <button
                            key={r.id}
                            onClick={() => setViewReservation(r)}
                            className={`w-full text-left text-[10px] font-semibold px-1.5 py-0.5 rounded mb-0.5 truncate ${s.bg} ${s.text}`}
                          >
                            {isCheckIn ? "→" : "←"} {r.guestName?.split(" ")[0]}{" "}
                            {r.roomNumber ? `·${r.roomNumber}` : ""}
                          </button>
                        );
                      })}
                      {dayRes.length > 2 && (
                        <span className="text-[10px] text-[#94a3b8]">
                          +{dayRes.length - 2} more
                        </span>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-[#e2e8f0] rounded-xl flex flex-col items-center justify-center py-16 gap-3">
          <Calendar className="w-10 h-10 text-[#cbd5e1]" />
          <p className="text-sm text-[#94a3b8]">
            {reservations.length === 0
              ? "No reservations found"
              : "No reservations match your search/filter"}
          </p>
          <button
            onClick={openNew}
            className="text-sm text-[#1d4ed8] font-medium hover:underline"
          >
            Create the first one
          </button>
        </div>
      ) : (
        /* ── List view ── */
        <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                  {[
                    "Guest",
                    "Room",
                    "Check-In",
                    "Check-Out",
                    "Nights",
                    "Total",
                    "Source",
                    "Status",
                    "",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wide whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f5f9]">
                {filtered.map((r) => {
                  const s = STATUS_CONFIG[r.status] || STATUS_CONFIG.confirmed;
                  const n = nights(r.checkInDate, r.checkOutDate);
                  const today = new Date().toISOString().split("T")[0];
                  const isArrivingToday = r.checkInDate === today;
                  const isDepartingToday = r.checkOutDate === today;
                  return (
                    <tr
                      key={r.id}
                      onClick={() => setViewReservation(r)}
                      className="hover:bg-[#f8fafc] transition-colors cursor-pointer group"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-[#dbeafe] rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-3.5 h-3.5 text-[#1d4ed8]" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-[#1e293b]">
                              {r.guestName}
                            </div>
                            {r.guestId && (
                              <div className="text-xs text-[#94a3b8]">
                                {r.guestId}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-[#374151]">
                          {r.roomNumber || "—"}
                        </div>
                        {r.roomType && (
                          <div className="text-xs text-[#94a3b8] truncate max-w-[120px]">
                            {r.roomType}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div
                          className={`text-sm font-medium ${isArrivingToday ? "text-[#059669] font-bold" : "text-[#374151]"}`}
                        >
                          {r.checkInDate || "—"}
                        </div>
                        {isArrivingToday && (
                          <div className="text-[10px] text-[#059669] font-semibold">
                            Today
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div
                          className={`text-sm font-medium ${isDepartingToday ? "text-[#ef4444] font-bold" : "text-[#374151]"}`}
                        >
                          {r.checkOutDate || "—"}
                        </div>
                        {isDepartingToday && (
                          <div className="text-[10px] text-[#ef4444] font-semibold">
                            Today
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#64748b]">
                        {n || r.numberOfNights || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-[#1e293b]">
                        {r.totalAmount
                          ? `R${Number(r.totalAmount).toLocaleString()}`
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-[#64748b]">
                        {r.source || "Direct"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${s.dot}`}
                          />{" "}
                          {s.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div
                          className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => openEdit(r)}
                            className="p-1.5 text-[#64748b] hover:text-[#1d4ed8] hover:bg-[#dbeafe] rounded-lg transition-all"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(r.id)}
                            className="p-1.5 text-[#64748b] hover:text-[#ef4444] hover:bg-[#fef2f2] rounded-lg transition-all"
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
        </div>
      )}

      {/* View Reservation panel */}
      {viewReservation && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-end">
          <div className="w-full max-w-md h-full bg-white shadow-2xl flex flex-col border-l border-[#e2e8f0]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0] bg-[#f8fafc]">
              <div>
                <h2 className="text-sm font-bold text-[#1e293b]">
                  {viewReservation.guestName}
                </h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STATUS_CONFIG[viewReservation.status]?.bg} ${STATUS_CONFIG[viewReservation.status]?.text}`}
                  >
                    {STATUS_CONFIG[viewReservation.status]?.label}
                  </span>
                  {viewReservation.roomNumber && (
                    <span className="text-xs text-[#64748b]">
                      Room {viewReservation.roomNumber}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setViewReservation(null)}
                className="p-1.5 text-[#64748b] hover:text-[#1e293b] hover:bg-[#e2e8f0] rounded-lg transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Quick actions */}
              <div className="flex flex-wrap gap-2">
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                  <button
                    key={key}
                    onClick={() => quickStatus(viewReservation, key)}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${viewReservation.status === key ? `${cfg.bg} ${cfg.text} border-transparent` : "bg-white border-[#e2e8f0] text-[#64748b] hover:bg-[#f8fafc]"}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />{" "}
                    {cfg.label}
                  </button>
                ))}
              </div>

              {/* Info blocks */}
              <InfoBlock icon={User} label="Guest">
                <p className="text-sm font-semibold text-[#1e293b]">
                  {viewReservation.guestName}
                </p>
                {viewReservation.guestEmail && (
                  <p className="text-xs text-[#64748b] flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {viewReservation.guestEmail}
                  </p>
                )}
                {viewReservation.guestPhone && (
                  <p className="text-xs text-[#64748b] flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {viewReservation.guestPhone}
                  </p>
                )}
                {viewReservation.guestId && (
                  <p className="text-xs text-[#94a3b8]">
                    {viewReservation.guestId}
                  </p>
                )}
              </InfoBlock>
              <InfoBlock icon={Bed} label="Booking">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {[
                    { k: "Room", v: viewReservation.roomNumber },
                    { k: "Type", v: viewReservation.roomType },
                    { k: "Check-In", v: viewReservation.checkInDate },
                    { k: "Check-Out", v: viewReservation.checkOutDate },
                    {
                      k: "Nights",
                      v:
                        viewReservation.numberOfNights ||
                        nights(
                          viewReservation.checkInDate,
                          viewReservation.checkOutDate,
                        ),
                    },
                    { k: "Guests", v: viewReservation.numberOfGuests },
                  ]
                    .filter((x) => x.v)
                    .map(({ k, v }) => (
                      <div key={k}>
                        <span className="text-xs text-[#94a3b8]">{k}</span>
                        <p className="font-medium text-[#1e293b]">{v}</p>
                      </div>
                    ))}
                </div>
              </InfoBlock>
              <InfoBlock icon={CreditCard} label="Financials">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {[
                    {
                      k: "Rate/Night",
                      v: viewReservation.ratePerNight
                        ? `R${Number(viewReservation.ratePerNight).toLocaleString()}`
                        : null,
                    },
                    {
                      k: "Total",
                      v: viewReservation.totalAmount
                        ? `R${Number(viewReservation.totalAmount).toLocaleString()}`
                        : null,
                    },
                    {
                      k: "Deposit",
                      v: viewReservation.depositPaid
                        ? `R${Number(viewReservation.depositPaid).toLocaleString()}`
                        : null,
                    },
                    { k: "Source", v: viewReservation.source },
                  ]
                    .filter((x) => x.v)
                    .map(({ k, v }) => (
                      <div key={k}>
                        <span className="text-xs text-[#94a3b8]">{k}</span>
                        <p className="font-medium text-[#1e293b]">{v}</p>
                      </div>
                    ))}
                </div>
              </InfoBlock>
              {viewReservation.specialRequests && (
                <InfoBlock icon={StickyNote} label="Special Requests">
                  <p className="text-sm text-[#374151]">
                    {viewReservation.specialRequests}
                  </p>
                </InfoBlock>
              )}
              {viewReservation.notes && (
                <InfoBlock icon={StickyNote} label="Notes">
                  <p className="text-sm text-[#374151]">
                    {viewReservation.notes}
                  </p>
                </InfoBlock>
              )}
            </div>
            <div className="px-6 py-4 border-t border-[#e2e8f0] bg-[#f8fafc] flex gap-2">
              <button
                onClick={() => {
                  setViewReservation(null);
                  openEdit(viewReservation);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 border border-[#e2e8f0] text-[#374151] text-sm font-medium rounded-xl hover:bg-white transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit
              </button>
              <button
                onClick={() => {
                  setDeleteConfirm(viewReservation.id);
                }}
                className="px-4 py-2.5 border border-[#fecaca] text-[#ef4444] text-sm font-medium rounded-xl hover:bg-[#fef2f2] transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-[#e2e8f0]">
            <div className="w-12 h-12 bg-[#fef2f2] rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6 text-[#ef4444]" />
            </div>
            <h3 className="text-base font-bold text-[#1e293b] text-center mb-1">
              Delete Reservation?
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
                {editingId ? "Edit Reservation" : "New Reservation"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-[#64748b] hover:text-[#1e293b] hover:bg-[#e2e8f0] rounded-lg transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Guest */}
              <div>
                <SectionDivider icon={User} label="Guest Details" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Guest Name *</label>
                    <input
                      className={inputCls}
                      value={form.guestName}
                      onChange={(e) =>
                        handleFormChange("guestName", e.target.value)
                      }
                      placeholder="Full name"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Guest ID</label>
                    <input
                      className={inputCls}
                      value={form.guestId}
                      onChange={(e) =>
                        handleFormChange("guestId", e.target.value)
                      }
                      placeholder="GST-2026-XXXX"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Email</label>
                    <input
                      className={inputCls}
                      type="email"
                      value={form.guestEmail}
                      onChange={(e) =>
                        handleFormChange("guestEmail", e.target.value)
                      }
                      placeholder="guest@email.com"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Phone</label>
                    <input
                      className={inputCls}
                      value={form.guestPhone}
                      onChange={(e) =>
                        handleFormChange("guestPhone", e.target.value)
                      }
                      placeholder="082 xxx xxxx"
                    />
                  </div>
                </div>
              </div>
              {/* Booking */}
              <div>
                <SectionDivider icon={Bed} label="Booking Details" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Room Number</label>
                    <select
                      className={inputCls}
                      value={form.roomId}
                      onChange={(e) => handleRoomSelect(e.target.value)}
                    >
                      <option value="">
                        {roomsLoading
                          ? "Loading rooms..."
                          : selectableRooms.length === 0
                            ? "No available rooms — add one in Room Management"
                            : "Select a room"}
                      </option>
                      {selectableRooms.map((room) => (
                        <option key={room.id} value={room.id}>
                          {room.roomNumber} — {room.roomType}
                          {room.status !== "available"
                            ? ` (${room.status})`
                            : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Room Type</label>
                    <input
                      className={`${inputCls} bg-[#f8fafc]`}
                      value={form.roomType}
                      readOnly
                      placeholder="Auto-filled from selected room"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Check-In Date *</label>
                    <input
                      className={inputCls}
                      type="date"
                      value={form.checkInDate}
                      onChange={(e) =>
                        handleFormChange("checkInDate", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Check-Out Date *</label>
                    <input
                      className={inputCls}
                      type="date"
                      value={form.checkOutDate}
                      onChange={(e) =>
                        handleFormChange("checkOutDate", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Nights (auto)</label>
                    <input
                      className={`${inputCls} bg-[#f8fafc]`}
                      value={form.numberOfNights}
                      readOnly
                      placeholder="—"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Number of Guests</label>
                    <input
                      className={inputCls}
                      type="number"
                      min="1"
                      value={form.numberOfGuests}
                      onChange={(e) =>
                        handleFormChange("numberOfGuests", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Status</label>
                    <select
                      className={inputCls}
                      value={form.status}
                      onChange={(e) =>
                        handleFormChange("status", e.target.value)
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
                    <label className={labelCls}>Source</label>
                    <select
                      className={inputCls}
                      value={form.source}
                      onChange={(e) =>
                        handleFormChange("source", e.target.value)
                      }
                    >
                      {[
                        "Direct",
                        "Phone",
                        "Email",
                        "Booking.com",
                        "Airbnb",
                        "Expedia",
                        "Travel Agent",
                        "Walk-in",
                        "Other",
                      ].map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              {/* Financials */}
              <div>
                <SectionDivider icon={CreditCard} label="Financials" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className={labelCls}>Rate Per Night (R)</label>
                    <input
                      className={inputCls}
                      type="number"
                      value={form.ratePerNight}
                      onChange={(e) =>
                        handleFormChange("ratePerNight", e.target.value)
                      }
                      placeholder="e.g. 1500"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Total Amount (R)</label>
                    <input
                      className={`${inputCls} bg-[#f8fafc]`}
                      value={form.totalAmount}
                      readOnly
                      placeholder="Auto-calculated"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Deposit Paid (R)</label>
                    <input
                      className={inputCls}
                      type="number"
                      value={form.depositPaid}
                      onChange={(e) =>
                        handleFormChange("depositPaid", e.target.value)
                      }
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
              {/* Notes */}
              <div>
                <label className={labelCls}>Special Requests</label>
                <textarea
                  className={`${inputCls} resize-none`}
                  rows={2}
                  value={form.specialRequests}
                  onChange={(e) =>
                    handleFormChange("specialRequests", e.target.value)
                  }
                  placeholder="Late check-in, dietary requirements..."
                />
              </div>
              <div>
                <label className={labelCls}>Internal Notes</label>
                <textarea
                  className={`${inputCls} resize-none`}
                  rows={2}
                  value={form.notes}
                  onChange={(e) => handleFormChange("notes", e.target.value)}
                  placeholder="Staff notes..."
                />
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
                disabled={
                  saving ||
                  !form.guestName ||
                  !form.checkInDate ||
                  !form.checkOutDate
                }
                className="flex-1 px-4 py-2.5 bg-[#1d4ed8] hover:bg-[#1e40af] disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update"
                    : "Save Reservation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SectionDivider({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-2 text-xs font-bold text-[#1d4ed8] uppercase tracking-widest mb-3 pb-2 border-b border-[#e2e8f0]">
      <Icon className="w-3.5 h-3.5" /> {label}
    </div>
  );
}

function InfoBlock({ icon: Icon, label, children }) {
  return (
    <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4">
      <div className="flex items-center gap-2 text-xs font-bold text-[#64748b] uppercase tracking-widest mb-3">
        <Icon className="w-3.5 h-3.5" /> {label}
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}
