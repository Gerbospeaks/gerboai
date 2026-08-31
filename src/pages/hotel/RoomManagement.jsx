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
  Bed,
  Plus,
  Search,
  X,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle,
  Clock,
  Wrench,
  Users,
  DollarSign,
  LayoutGrid,
  List,
  Filter,
  Hash,
  Wifi,
  Wind,
  Tv,
  Coffee,
} from "lucide-react";

const STATUS_CONFIG = {
  available: {
    label: "Available",
    bg: "bg-[#dcfce7]",
    text: "text-[#166534]",
    dot: "bg-[#22c55e]",
    card: "border-[#bbf7d0] bg-[#f0fdf4]",
  },
  occupied: {
    label: "Occupied",
    bg: "bg-[#dbeafe]",
    text: "text-[#1e40af]",
    dot: "bg-[#3b82f6]",
    card: "border-[#bfdbfe] bg-[#eff6ff]",
  },
  maintenance: {
    label: "Maintenance",
    bg: "bg-[#fef3c7]",
    text: "text-[#92400e]",
    dot: "bg-[#f59e0b]",
    card: "border-[#fde68a] bg-[#fffbeb]",
  },
  cleaning: {
    label: "Cleaning",
    bg: "bg-[#f3e8ff]",
    text: "text-[#6b21a8]",
    dot: "bg-[#a855f7]",
    card: "border-[#e9d5ff] bg-[#faf5ff]",
  },
  reserved: {
    label: "Reserved",
    bg: "bg-[#fce7f3]",
    text: "text-[#9d174d]",
    dot: "bg-[#ec4899]",
    card: "border-[#fbcfe8] bg-[#fdf2f8]",
  },
  blocked: {
    label: "Blocked",
    bg: "bg-[#f1f5f9]",
    text: "text-[#475569]",
    dot: "bg-[#94a3b8]",
    card: "border-[#e2e8f0] bg-[#f8fafc]",
  },
};

const ROOM_TYPES = [
  "Standard Single",
  "Standard Double",
  "Deluxe Single",
  "Deluxe Double",
  "Superior Room",
  "Junior Suite",
  "Suite",
  "Executive Suite",
  "Presidential Suite",
  "Family Room",
  "Connecting Rooms",
  "Studio",
  "Event Hosting",
  "Conference Facilities",
];

// Extra context for venue-style types (shown as a hint under the Room
// Type dropdown once one of these is selected). Regular guest rooms don't
// need a description, so this only covers the types that benefit from one.
const ROOM_TYPE_DESCRIPTIONS = {
  "Event Hosting":
    "A popular venue for birthday parties, romantic escapes, and end-of-year celebrations.",
  "Conference Facilities":
    "Setup options available for meetings and corporate gatherings.",
};

const AMENITIES_LIST = [
  { key: "wifi", icon: Wifi, label: "Wi-Fi" },
  { key: "ac", icon: Wind, label: "A/C" },
  { key: "tv", icon: Tv, label: "TV" },
  { key: "coffee", icon: Coffee, label: "Coffee" },
];

const FLOORS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "Penthouse"];

const EMPTY_FORM = {
  roomNumber: "",
  roomType: "Deluxe Double",
  floor: "1",
  capacity: "2",
  ratePerNight: "",
  status: "available",
  description: "",
  amenities: [],
  notes: "",
  bedType: "King",
  size: "",
  view: "",
};

export default function RoomManagement({ user }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [quickStatusRoom, setQuickStatusRoom] = useState(null);

  const db = getFirestore();

  useEffect(() => {
    if (user?.uid) fetchRooms();
  }, [user]);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "users", user.uid, "rooms"),
        orderBy("roomNumber", "asc"),
      );
      const snap = await getDocs(q);
      setRooms(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
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
  const openEdit = (r) => {
    setForm({ ...EMPTY_FORM, ...r, amenities: r.amenities || [] });
    setEditingId(r.id);
    setShowModal(true);
  };

  const toggleAmenity = (key) =>
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(key)
        ? f.amenities.filter((a) => a !== key)
        : [...f.amenities, key],
    }));

  const handleSave = async () => {
    if (!form.roomNumber || !form.roomType) return;
    setSaving(true);
    try {
      const payload = { ...form, updatedAt: serverTimestamp() };
      if (editingId) {
        await updateDoc(
          doc(db, "users", user.uid, "rooms", editingId),
          payload,
        );
      } else {
        await addDoc(collection(db, "users", user.uid, "rooms"), {
          ...payload,
          createdAt: serverTimestamp(),
        });
      }
      setShowModal(false);
      fetchRooms();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const quickUpdateStatus = async (room, newStatus) => {
    try {
      await updateDoc(doc(db, "users", user.uid, "rooms", room.id), {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });
      setRooms((prev) =>
        prev.map((r) => (r.id === room.id ? { ...r, status: newStatus } : r)),
      );
      setQuickStatusRoom(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "users", user.uid, "rooms", id));
      setDeleteConfirm(null);
      fetchRooms();
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = rooms.filter((r) => {
    const m =
      r.roomNumber?.toLowerCase().includes(search.toLowerCase()) ||
      r.roomType?.toLowerCase().includes(search.toLowerCase());
    return m && (statusFilter === "all" || r.status === statusFilter);
  });

  // Group by floor for grid view
  const byFloor = filtered.reduce((acc, r) => {
    const fl = r.floor || "1";
    if (!acc[fl]) acc[fl] = [];
    acc[fl].push(r);
    return acc;
  }, {});

  const stats = Object.entries(STATUS_CONFIG).map(([key, cfg]) => ({
    key,
    label: cfg.label,
    count: rooms.filter((r) => r.status === key).length,
    ...cfg,
  }));

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
            <Bed className="w-5 h-5 text-[#1d4ed8]" /> Room Management
          </h1>
          <p className="text-sm text-[#64748b] mt-0.5">
            {rooms.length} rooms ·{" "}
            {rooms.filter((r) => r.status === "available").length} available now
          </p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 bg-[#1d4ed8] hover:bg-[#1e40af] text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Room
        </button>
      </div>

      {/* Status overview strip */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {stats.map(({ key, label, count, bg, text, dot }) => (
          <button
            key={key}
            onClick={() => setStatusFilter(statusFilter === key ? "all" : key)}
            className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl border transition-all ${
              statusFilter === key
                ? "border-[#1d4ed8] bg-[#eff6ff] ring-1 ring-[#1d4ed8]"
                : "border-[#e2e8f0] bg-white hover:bg-[#f8fafc]"
            }`}
          >
            <div className={`w-2.5 h-2.5 rounded-full ${dot}`} />
            <span className="text-lg font-bold text-[#0f172a]">{count}</span>
            <span className="text-[10px] font-semibold text-[#64748b]">
              {label}
            </span>
          </button>
        ))}
      </div>

      {/* Filters + view toggle */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by room number or type..."
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-[#e2e8f0] rounded-xl bg-white text-[#1e293b] placeholder-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#1d4ed8] transition-colors"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-lg border transition-colors ${viewMode === "grid" ? "bg-[#1d4ed8] text-white border-[#1d4ed8]" : "bg-white text-[#64748b] border-[#e2e8f0] hover:bg-[#f8fafc]"}`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-lg border transition-colors ${viewMode === "list" ? "bg-[#1d4ed8] text-white border-[#1d4ed8]" : "bg-white text-[#64748b] border-[#e2e8f0] hover:bg-[#f8fafc]"}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-[#1d4ed8] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-[#e2e8f0] rounded-xl flex flex-col items-center justify-center py-16 gap-3">
          <Bed className="w-10 h-10 text-[#cbd5e1]" />
          <p className="text-sm text-[#94a3b8]">No rooms found</p>
          <button
            onClick={openNew}
            className="text-sm text-[#1d4ed8] font-medium hover:underline"
          >
            Add the first room
          </button>
        </div>
      ) : viewMode === "grid" ? (
        /* ── Floor-grouped grid ── */
        <div className="space-y-6">
          {Object.entries(byFloor)
            .sort(([a], [b]) => {
              if (a === "Penthouse") return 1;
              if (b === "Penthouse") return -1;
              return Number(a) - Number(b);
            })
            .map(([floor, floorRooms]) => (
              <div key={floor}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold text-[#64748b] uppercase tracking-widest">
                    Floor {floor}
                  </span>
                  <div className="flex-1 h-px bg-[#e2e8f0]" />
                  <span className="text-xs text-[#94a3b8]">
                    {floorRooms.length} rooms
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  {floorRooms.map((room) => {
                    const s =
                      STATUS_CONFIG[room.status] || STATUS_CONFIG.available;
                    return (
                      <div
                        key={room.id}
                        className={`relative border rounded-xl p-3.5 cursor-pointer hover:shadow-md transition-all group ${s.card}`}
                        onClick={() =>
                          setQuickStatusRoom(
                            quickStatusRoom?.id === room.id ? null : room,
                          )
                        }
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-lg font-bold text-[#0f172a]">
                            {room.roomNumber}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold ${s.bg} ${s.text}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${s.dot}`}
                            />{" "}
                            {s.label}
                          </span>
                        </div>
                        <p className="text-xs text-[#64748b] truncate mb-1.5">
                          {room.roomType}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-xs text-[#94a3b8]">
                            <Users className="w-3 h-3" /> {room.capacity || 2}
                          </div>
                          {room.ratePerNight && (
                            <span className="text-xs font-bold text-[#1d4ed8]">
                              R{Number(room.ratePerNight).toLocaleString()}
                            </span>
                          )}
                        </div>
                        {/* Amenity dots */}
                        {(room.amenities || []).length > 0 && (
                          <div className="flex gap-1 mt-2">
                            {AMENITIES_LIST.filter((a) =>
                              (room.amenities || []).includes(a.key),
                            ).map(({ key, icon: Icon }) => (
                              <div
                                key={key}
                                className="w-5 h-5 bg-white/70 rounded flex items-center justify-center"
                              >
                                <Icon className="w-3 h-3 text-[#64748b]" />
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Quick-action buttons on hover */}
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEdit(room);
                            }}
                            className="w-6 h-6 bg-white rounded border border-[#e2e8f0] flex items-center justify-center text-[#64748b] hover:text-[#1d4ed8] transition-colors shadow-sm"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirm(room.id);
                            }}
                            className="w-6 h-6 bg-white rounded border border-[#e2e8f0] flex items-center justify-center text-[#64748b] hover:text-[#ef4444] transition-colors shadow-sm"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Quick status popover */}
                        {quickStatusRoom?.id === room.id && (
                          <div
                            className="absolute top-full left-0 mt-1 z-20 bg-white border border-[#e2e8f0] rounded-xl shadow-xl p-2 w-44"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest px-2 mb-1.5">
                              Change Status
                            </p>
                            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                              <button
                                key={key}
                                onClick={() => quickUpdateStatus(room, key)}
                                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-[#f8fafc] ${room.status === key ? "bg-[#f1f5f9]" : ""}`}
                              >
                                <span
                                  className={`w-2 h-2 rounded-full ${cfg.dot}`}
                                />
                                {cfg.label}
                                {room.status === key && (
                                  <CheckCircle className="w-3 h-3 text-[#059669] ml-auto" />
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
        </div>
      ) : (
        /* ── List view ── */
        <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                  {[
                    "Room",
                    "Type",
                    "Floor",
                    "Capacity",
                    "Rate/Night",
                    "Amenities",
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
                {filtered.map((room) => {
                  const s =
                    STATUS_CONFIG[room.status] || STATUS_CONFIG.available;
                  return (
                    <tr
                      key={room.id}
                      className="hover:bg-[#f8fafc] transition-colors group"
                    >
                      <td className="px-4 py-3 font-bold text-[#1e293b]">
                        {room.roomNumber}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#374151]">
                        {room.roomType}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#64748b]">
                        {room.floor}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-sm text-[#374151]">
                          <Users className="w-3.5 h-3.5 text-[#94a3b8]" />{" "}
                          {room.capacity || 2}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-[#1d4ed8]">
                        {room.ratePerNight
                          ? `R${Number(room.ratePerNight).toLocaleString()}`
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {AMENITIES_LIST.filter((a) =>
                            (room.amenities || []).includes(a.key),
                          ).map(({ key, icon: Icon }) => (
                            <div
                              key={key}
                              className="w-6 h-6 bg-[#f1f5f9] rounded flex items-center justify-center"
                              title={key}
                            >
                              <Icon className="w-3.5 h-3.5 text-[#64748b]" />
                            </div>
                          ))}
                        </div>
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
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEdit(room)}
                            className="p-1.5 text-[#64748b] hover:text-[#1d4ed8] hover:bg-[#dbeafe] rounded-lg transition-all"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(room.id)}
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

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-[#e2e8f0]">
            <div className="w-12 h-12 bg-[#fef2f2] rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6 text-[#ef4444]" />
            </div>
            <h3 className="text-base font-bold text-[#1e293b] text-center mb-1">
              Delete Room?
            </h3>
            <p className="text-sm text-[#64748b] text-center mb-6">
              This cannot be undone.
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
                {editingId ? "Edit Room" : "Add New Room"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-[#64748b] hover:text-[#1e293b] hover:bg-[#e2e8f0] rounded-lg transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Basic info */}
              <div>
                <SectionDivider icon={Hash} label="Room Details" />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div>
                    <label className={labelCls}>Room Number *</label>
                    <input
                      className={inputCls}
                      value={form.roomNumber}
                      onChange={(e) =>
                        setForm({ ...form, roomNumber: e.target.value })
                      }
                      placeholder="e.g. 205"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Floor</label>
                    <select
                      className={inputCls}
                      value={form.floor}
                      onChange={(e) =>
                        setForm({ ...form, floor: e.target.value })
                      }
                    >
                      {FLOORS.map((f) => (
                        <option key={f} value={f}>
                          {f === "Penthouse" ? "Penthouse" : `Floor ${f}`}
                        </option>
                      ))}
                    </select>
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
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Room Type *</label>
                    <select
                      className={inputCls}
                      value={form.roomType}
                      onChange={(e) =>
                        setForm({ ...form, roomType: e.target.value })
                      }
                    >
                      {ROOM_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Capacity</label>
                    <input
                      className={inputCls}
                      type="number"
                      min="1"
                      max="20"
                      value={form.capacity}
                      onChange={(e) =>
                        setForm({ ...form, capacity: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Rate Per Night (R)</label>
                    <input
                      className={inputCls}
                      type="number"
                      value={form.ratePerNight}
                      onChange={(e) =>
                        setForm({ ...form, ratePerNight: e.target.value })
                      }
                      placeholder="e.g. 1500"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Bed Type</label>
                    <select
                      className={inputCls}
                      value={form.bedType}
                      onChange={(e) =>
                        setForm({ ...form, bedType: e.target.value })
                      }
                    >
                      {[
                        "King",
                        "Queen",
                        "Twin",
                        "Double",
                        "Single",
                        "Bunk",
                      ].map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Size (m²)</label>
                    <input
                      className={inputCls}
                      value={form.size}
                      onChange={(e) =>
                        setForm({ ...form, size: e.target.value })
                      }
                      placeholder="e.g. 35"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>View</label>
                    <input
                      className={inputCls}
                      value={form.view}
                      onChange={(e) =>
                        setForm({ ...form, view: e.target.value })
                      }
                      placeholder="e.g. Ocean view"
                    />
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div>
                <SectionDivider icon={Wifi} label="Amenities" />
                <div className="flex flex-wrap gap-2">
                  {AMENITIES_LIST.map(({ key, icon: Icon, label }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleAmenity(key)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                        form.amenities.includes(key)
                          ? "bg-[#1d4ed8] text-white border-[#1d4ed8]"
                          : "bg-white text-[#64748b] border-[#e2e8f0] hover:border-[#1d4ed8] hover:text-[#1d4ed8]"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" /> {label}
                    </button>
                  ))}
                  {/* Free-text amenities not in the preset list */}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className={labelCls}>Description / Notes</label>
                <textarea
                  className={`${inputCls} resize-none`}
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Additional information about this room..."
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
                disabled={saving || !form.roomNumber || !form.roomType}
                className="flex-1 px-4 py-2.5 bg-[#1d4ed8] hover:bg-[#1e40af] disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                {saving ? "Saving..." : editingId ? "Update Room" : "Add Room"}
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
