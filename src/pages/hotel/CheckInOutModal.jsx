import React, { useState, useEffect } from "react";
import {
  X,
  Search,
  Calendar,
  User,
  Bed,
  Clock,
  CheckCircle,
  XCircle,
  UserCheck,
  UserX,
  Plus,
  Edit,
  Trash2,
  Filter,
  Download,
  Upload,
  AlertCircle,
} from "lucide-react";
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

// ── Brand tokens — matches HotelSidebar / AppHeader ─────────────────────────
const NAVY = "#0f1623";
const NAVY_MID = "#1e2535";
const ACCENT = "#c6f135";
const ACCENT_TEXT = "#0f1623";
const BORDER = "#e2e8f0";
const TEXT_MUTED = "#64748b";

// ─────────────────────────────────────────────────────────────
// This modal now reads and writes the SAME `reservations` collection
// that Reservations.jsx uses — check-in/check-out is just a status
// change on a reservation, not a separate record in a separate
// collection. That's what keeps the two screens in sync.
//
// Status vocabulary matches Reservations.jsx's STATUS_CONFIG:
// confirmed | pending | checked_in | checked_out | cancelled | no_show
// ─────────────────────────────────────────────────────────────

// Keep Room Management's status in sync with whatever a reservation's
// status becomes.
const ROOM_STATUS_BY_RESERVATION_STATUS = {
  confirmed: "reserved",
  pending: "reserved",
  checked_in: "occupied",
  checked_out: "available",
  cancelled: "available",
  no_show: "available",
};

export const syncRoomStatus = async (userId, roomId, status) => {
  if (!userId || !roomId || !status) return;
  try {
    const db = getFirestore();
    await updateDoc(doc(db, "users", userId, "rooms", roomId), {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    // Don't let a room-sync failure block the check-in flow, just log it.
    console.error("Error syncing room status:", error);
  }
};

// Firestore Timestamps expose toMillis(); fall back to 0 for records that
// predate the createdAt field so sorting doesn't silently drop them.
const toMillis = (ts) =>
  ts && typeof ts.toMillis === "function" ? ts.toMillis() : 0;

// Helper function to create a reservation (status "pending") from an invoice
export const createCheckInFromInvoice = async (userId, invoiceData) => {
  if (!userId || !invoiceData) return;

  try {
    const db = getFirestore();
    const reservationData = {
      guestName: invoiceData.guest?.name || "",
      guestId: invoiceData.guest?.guestId || "",
      guestEmail: invoiceData.guest?.email || "",
      guestPhone: invoiceData.guest?.phone || "",
      guestAddress: invoiceData.guest?.address || "",
      guestDOB: invoiceData.guest?.dateOfBirth || "",
      guestNationality: invoiceData.guest?.nationality || "",
      idType: invoiceData.guest?.idType || "",
      idNumber: invoiceData.guest?.idNumber || "",
      roomId: invoiceData.booking?.roomId || "",
      roomNumber: invoiceData.booking?.roomNumber || "",
      roomType: invoiceData.booking?.roomType || "",
      checkInDate: invoiceData.booking?.checkInDate || "",
      checkOutDate: invoiceData.booking?.checkOutDate || "",
      numberOfGuests: invoiceData.booking?.numberOfGuests || "1",
      notes: invoiceData.booking?.specialRequests || "",
      status: "pending",
      invoiceNumber: invoiceData.invoiceNumber || "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      source: "invoice",
    };

    await addDoc(
      collection(db, "users", userId, "reservations"),
      reservationData,
    );
    if (reservationData.roomId) {
      await syncRoomStatus(userId, reservationData.roomId, "reserved");
    }
    console.log("Reservation created from invoice successfully");
    return true;
  } catch (error) {
    console.error("Error creating reservation from invoice:", error);
    return false;
  }
};

// Helper function to create a reservation (status "pending") from a guest
export const createCheckInFromGuest = async (
  userId,
  guestData,
  bookingData = {},
) => {
  if (!userId || !guestData) return;

  try {
    const db = getFirestore();
    const reservationData = {
      guestName: guestData.name || "",
      guestId: guestData.guestId || "",
      guestEmail: guestData.email || "",
      guestPhone: guestData.phone || "",
      guestAddress: guestData.address || "",
      guestDOB: guestData.dateOfBirth || "",
      guestNationality: guestData.nationality || "",
      idType: guestData.idType || "",
      idNumber: guestData.idNumber || "",
      roomId: bookingData.roomId || "",
      roomNumber: bookingData.roomNumber || "",
      roomType: bookingData.roomType || "Standard Double Room",
      checkInDate: bookingData.checkInDate || "",
      checkOutDate: bookingData.checkOutDate || "",
      numberOfGuests: bookingData.numberOfGuests || "1",
      notes: bookingData.notes || "",
      status: "pending",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      source: "guest",
    };

    await addDoc(
      collection(db, "users", userId, "reservations"),
      reservationData,
    );
    if (reservationData.roomId) {
      await syncRoomStatus(userId, reservationData.roomId, "reserved");
    }
    console.log("Reservation created from guest successfully");
    return true;
  } catch (error) {
    console.error("Error creating reservation from guest:", error);
    return false;
  }
};

const CheckInOutModal = ({ showModal, setShowModal, user }) => {
  const [activeTab, setActiveTab] = useState("upcoming"); // upcoming, checked_in, checked_out, all
  const [searchTerm, setSearchTerm] = useState("");
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [filterDate, setFilterDate] = useState("");

  useEffect(() => {
    if (showModal && user?.uid) {
      loadReservations();
    }
  }, [showModal, user]);

  const loadReservations = async () => {
    if (!user?.uid) return;

    setLoading(true);
    try {
      const db = getFirestore();
      // No server-side orderBy: Firestore's orderBy() silently excludes
      // any document missing that field, which would hide reservations
      // created without a createdAt timestamp. Sort client-side instead.
      const snapshot = await getDocs(
        collection(db, "users", user.uid, "reservations"),
      );
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));
      setReservations(data);
    } catch (error) {
      console.error("Error loading reservations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (reservation) => {
    if (!user?.uid) return;

    try {
      const db = getFirestore();
      await updateDoc(
        doc(db, "users", user.uid, "reservations", reservation.id),
        {
          status: "checked_in",
          actualCheckInTime: new Date().toISOString(),
          updatedAt: serverTimestamp(),
        },
      );

      // Room is now occupied
      if (reservation.roomId) {
        await syncRoomStatus(user.uid, reservation.roomId, "occupied");
      }

      alert("Guest checked in successfully!");
      loadReservations();
    } catch (error) {
      console.error("Error checking in:", error);
      alert("Failed to check in guest");
    }
  };

  const handleCheckOut = async (reservation) => {
    if (!user?.uid) return;

    try {
      const db = getFirestore();
      await updateDoc(
        doc(db, "users", user.uid, "reservations", reservation.id),
        {
          status: "checked_out",
          actualCheckOutTime: new Date().toISOString(),
          updatedAt: serverTimestamp(),
        },
      );

      // Room frees up — Room Management will mark it available. If the
      // room needs cleaning first, staff can flip it to "cleaning" there.
      if (reservation.roomId) {
        await syncRoomStatus(user.uid, reservation.roomId, "available");
      }

      alert("Guest checked out successfully!");
      loadReservations();
    } catch (error) {
      console.error("Error checking out:", error);
      alert("Failed to check out guest");
    }
  };

  const handleDelete = async (reservation) => {
    if (!window.confirm("Are you sure you want to delete this reservation?"))
      return;
    if (!user?.uid) return;

    try {
      const db = getFirestore();
      await deleteDoc(
        doc(db, "users", user.uid, "reservations", reservation.id),
      );

      // Deleting an active (not yet checked-out/cancelled) reservation
      // releases its room again.
      if (
        reservation.roomId &&
        !["checked_out", "cancelled", "no_show"].includes(reservation.status)
      ) {
        await syncRoomStatus(user.uid, reservation.roomId, "available");
      }

      alert("Reservation deleted successfully!");
      loadReservations();
    } catch (error) {
      console.error("Error deleting reservation:", error);
      alert("Failed to delete reservation");
    }
  };

  const filteredReservations = reservations.filter((r) => {
    const matchesSearch =
      r.guestName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.roomNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.guestId?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTab =
      activeTab === "all"
        ? true
        : activeTab === "upcoming"
          ? ["pending", "confirmed"].includes(r.status)
          : activeTab === "checked_in"
            ? r.status === "checked_in"
            : activeTab === "checked_out"
              ? r.status === "checked_out"
              : true;

    const matchesDate = filterDate
      ? r.checkInDate?.startsWith(filterDate)
      : true;

    return matchesSearch && matchesTab && matchesDate;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return "bg-[#fef9c3] text-[#854d0e]";
      case "confirmed":
        return "bg-[#dbeafe] text-[#1e40af]";
      case "checked_in":
        return "bg-[#ecfccb] text-[#3f6212]";
      case "checked_out":
        return "bg-[#f1f5f9] text-[#475569]";
      case "cancelled":
        return "bg-[#fee2e2] text-[#991b1b]";
      case "no_show":
        return "bg-[#ffedd5] text-[#9a3412]";
      default:
        return "bg-[#f1f5f9] text-[#475569]";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
      case "confirmed":
        return <Clock className="w-4 h-4" />;
      case "checked_in":
        return <UserCheck className="w-4 h-4" />;
      case "checked_out":
        return <UserX className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const stats = {
    upcoming: reservations.filter((r) =>
      ["pending", "confirmed"].includes(r.status),
    ).length,
    checkedIn: reservations.filter((r) => r.status === "checked_in").length,
    checkedOut: reservations.filter((r) => r.status === "checked_out").length,
    total: reservations.length,
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-[#e2e8f0]">
        {/* Header */}
        <div
          className="p-6 flex items-center justify-between flex-shrink-0"
          style={{ background: NAVY }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: ACCENT }}
            >
              <Bed className="w-5 h-5" style={{ color: ACCENT_TEXT }} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                Check-In / Check-Out
              </h2>
              <p className="text-xs text-[#8a93a6] mt-0.5">
                Manage guest arrivals and departures
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(false)}
            className="p-2 rounded-lg text-[#94a3b8] hover:text-white transition-colors"
            style={{ background: NAVY_MID }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-6 bg-[#f8fafc] border-b border-[#e2e8f0] flex-shrink-0">
          <StatTile
            label="Upcoming"
            value={stats.upcoming}
            icon={Clock}
            accent="text-[#a16207]"
            chipBg="bg-[#fef9c3]"
          />
          <StatTile
            label="Checked In"
            value={stats.checkedIn}
            icon={UserCheck}
            accent="text-[#3f6212]"
            chipBg="bg-[#ecfccb]"
          />
          <StatTile
            label="Checked Out"
            value={stats.checkedOut}
            icon={UserX}
            accent="text-[#475569]"
            chipBg="bg-[#f1f5f9]"
          />
          <StatTile
            label="Total"
            value={stats.total}
            icon={Bed}
            accent="text-[#0f1623]"
            chipBg="bg-[#e2e8f0]"
          />
        </div>

        {/* Search and Filters */}
        <div className="p-6 border-b border-[#e2e8f0] space-y-4 flex-shrink-0">
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-[#94a3b8]" />
                <input
                  type="text"
                  placeholder="Search by guest name, room number, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-[#e2e8f0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c6f135] focus:border-[#c6f135] transition-shadow"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-[#94a3b8]" />
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="pl-10 pr-4 py-2.5 text-sm border border-[#e2e8f0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c6f135] focus:border-[#c6f135] transition-shadow"
                />
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors hover:brightness-95"
                style={{ background: ACCENT, color: ACCENT_TEXT }}
              >
                <Plus className="w-4 h-4" />
                Add Reservation
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-[#e2e8f0]">
            {[
              { id: "all", label: "All", count: stats.total },
              { id: "upcoming", label: "Upcoming", count: stats.upcoming },
              {
                id: "checked_in",
                label: "Checked In",
                count: stats.checkedIn,
              },
              {
                id: "checked_out",
                label: "Checked Out",
                count: stats.checkedOut,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  activeTab === tab.id
                    ? "border-[#0f1623] text-[#0f1623]"
                    : "border-transparent text-[#64748b] hover:text-[#0f1623]"
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {/* Reservations List */}
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div
                className="animate-spin rounded-full h-10 w-10 border-2 border-t-transparent"
                style={{ borderColor: `${NAVY} transparent ${NAVY} ${NAVY}` }}
              ></div>
            </div>
          ) : filteredReservations.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[#f1f5f9] flex items-center justify-center">
                <Bed className="w-6 h-6 text-[#94a3b8]" />
              </div>
              <p className="text-[#374151] text-sm font-medium">
                No reservations found
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-3 text-sm font-semibold hover:underline"
                style={{ color: NAVY }}
              >
                Add your first reservation
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredReservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className="border border-[#e2e8f0] rounded-2xl p-4 hover:shadow-md hover:border-[#cbd5e1] transition-all bg-white"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3 flex-wrap">
                        <h3 className="text-sm font-bold text-[#0f1623]">
                          {reservation.guestName}
                        </h3>
                        <span
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusBadge(reservation.status)}`}
                        >
                          {getStatusIcon(reservation.status)}
                          {reservation.status?.replace("_", " ").toUpperCase()}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-[#64748b]">
                        <div>
                          <div className="flex items-center gap-1.5 text-[#94a3b8]">
                            <User className="w-3.5 h-3.5" />
                            <span className="font-semibold uppercase tracking-wide text-[10px]">
                              Guest ID
                            </span>
                          </div>
                          <div className="ml-5 mt-0.5 text-[#374151] font-medium">
                            {reservation.guestId || "N/A"}
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 text-[#94a3b8]">
                            <Bed className="w-3.5 h-3.5" />
                            <span className="font-semibold uppercase tracking-wide text-[10px]">
                              Room
                            </span>
                          </div>
                          <div className="ml-5 mt-0.5 text-[#374151] font-medium">
                            {reservation.roomNumber} - {reservation.roomType}
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 text-[#94a3b8]">
                            <Calendar className="w-3.5 h-3.5" />
                            <span className="font-semibold uppercase tracking-wide text-[10px]">
                              Check-In
                            </span>
                          </div>
                          <div className="ml-5 mt-0.5 text-[#374151] font-medium">
                            {reservation.checkInDate}
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 text-[#94a3b8]">
                            <Calendar className="w-3.5 h-3.5" />
                            <span className="font-semibold uppercase tracking-wide text-[10px]">
                              Check-Out
                            </span>
                          </div>
                          <div className="ml-5 mt-0.5 text-[#374151] font-medium">
                            {reservation.checkOutDate}
                          </div>
                        </div>
                      </div>

                      {reservation.notes && (
                        <div className="mt-3 text-xs text-[#64748b] bg-[#f8fafc] border border-[#f1f5f9] p-2.5 rounded-lg">
                          <span className="font-semibold text-[#374151]">
                            Notes:
                          </span>{" "}
                          {reservation.notes}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 flex-shrink-0">
                      {["pending", "confirmed"].includes(
                        reservation.status,
                      ) && (
                        <button
                          onClick={() => handleCheckIn(reservation)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors hover:brightness-95"
                          style={{ background: ACCENT, color: ACCENT_TEXT }}
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Check In
                        </button>
                      )}
                      {reservation.status === "checked_in" && (
                        <button
                          onClick={() => handleCheckOut(reservation)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-white text-xs font-semibold transition-colors hover:brightness-125"
                          style={{ background: NAVY }}
                        >
                          <UserX className="w-3.5 h-3.5" />
                          Check Out
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedReservation(reservation);
                          setShowAddModal(true);
                        }}
                        className="flex items-center gap-1.5 px-3 py-2 border border-[#e2e8f0] rounded-lg hover:bg-[#f8fafc] text-xs font-semibold text-[#374151] transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(reservation)}
                        className="flex items-center gap-1.5 px-3 py-2 border border-[#fecaca] text-[#dc2626] rounded-lg hover:bg-[#fef2f2] text-xs font-semibold transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <AddReservationModal
          showModal={showAddModal}
          setShowModal={setShowAddModal}
          user={user}
          existingReservation={selectedReservation}
          onSaved={() => {
            loadReservations();
            setSelectedReservation(null);
          }}
        />
      )}
    </div>
  );
};

// Small stat tile used in the header stats row
function StatTile({ label, value, icon: Icon, accent, chipBg }) {
  return (
    <div className="bg-white p-4 rounded-2xl border border-[#e2e8f0]">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-[#94a3b8] font-medium">{label}</div>
          <div className={`text-2xl font-bold mt-0.5 ${accent}`}>{value}</div>
        </div>
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${chipBg}`}
        >
          <Icon className={`w-5 h-5 ${accent}`} />
        </div>
      </div>
    </div>
  );
}

// Add/Edit Reservation Modal Component (quick check-in style form)
const AddReservationModal = ({
  showModal,
  setShowModal,
  user,
  existingReservation,
  onSaved,
}) => {
  const [formData, setFormData] = useState({
    guestName: "",
    guestId: "",
    guestEmail: "",
    guestPhone: "",
    roomId: "",
    roomNumber: "",
    roomType: "Standard Double Room",
    checkInDate: "",
    checkOutDate: "",
    numberOfGuests: "1",
    notes: "",
    status: "pending",
  });
  const [rooms, setRooms] = useState([]);
  const [roomsLoading, setRoomsLoading] = useState(false);

  useEffect(() => {
    if (existingReservation) {
      setFormData({ roomId: "", ...existingReservation });
    }
  }, [existingReservation]);

  // Pull the room list straight from Room Management so the dropdown is
  // always in sync with whatever rooms actually exist.
  useEffect(() => {
    if (showModal && user?.uid) {
      loadRooms();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showModal, user]);

  const loadRooms = async () => {
    if (!user?.uid) return;
    setRoomsLoading(true);
    try {
      const db = getFirestore();
      const snap = await getDocs(collection(db, "users", user.uid, "rooms"));
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      data.sort((a, b) =>
        (a.roomNumber || "").localeCompare(b.roomNumber || "", undefined, {
          numeric: true,
        }),
      );
      setRooms(data);
    } catch (error) {
      console.error("Error loading rooms:", error);
    } finally {
      setRoomsLoading(false);
    }
  };

  // Rooms selectable for a NEW reservation: only ones actually free right
  // now, plus whichever room the existing record already has (so editing
  // doesn't lose the current selection if that room's status moved on).
  const selectableRooms = rooms.filter(
    (r) => r.status === "available" || r.id === formData.roomId,
  );

  const handleRoomSelect = (roomId) => {
    const room = rooms.find((r) => r.id === roomId);
    setFormData({
      ...formData,
      roomId,
      roomNumber: room?.roomNumber || "",
      roomType: room?.roomType || formData.roomType,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.uid) return;
    if (!formData.roomId) {
      alert("Please select a room.");
      return;
    }

    try {
      const db = getFirestore();

      const dataToSave = {
        ...formData,
        updatedAt: serverTimestamp(),
      };

      if (existingReservation) {
        await updateDoc(
          doc(db, "users", user.uid, "reservations", existingReservation.id),
          dataToSave,
        );
        alert("Reservation updated successfully!");
      } else {
        await addDoc(collection(db, "users", user.uid, "reservations"), {
          ...dataToSave,
          createdAt: serverTimestamp(),
        });
        alert("Reservation added successfully!");
      }

      // Reflect the reservation's current status back onto the room
      // record (pending/confirmed -> reserved, checked_in -> occupied,
      // checked_out -> available).
      const roomStatus = ROOM_STATUS_BY_RESERVATION_STATUS[dataToSave.status];
      if (roomStatus) {
        await syncRoomStatus(user.uid, formData.roomId, roomStatus);
      }

      onSaved();
      setShowModal(false);
    } catch (error) {
      console.error("Error saving reservation:", error);
      alert("Failed to save reservation");
    }
  };

  if (!showModal) return null;

  const inputCls =
    "w-full px-4 py-2.5 text-sm border border-[#e2e8f0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c6f135] focus:border-[#c6f135] transition-shadow";
  const labelCls = "block text-xs font-semibold text-[#374151] mb-2";

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-[#e2e8f0]">
        <div
          className="p-5 flex items-center justify-between flex-shrink-0"
          style={{ background: NAVY }}
        >
          <h2 className="text-base font-bold text-white">
            {existingReservation ? "Edit Reservation" : "Add New Reservation"}
          </h2>
          <button
            onClick={() => setShowModal(false)}
            className="p-1.5 rounded-lg text-[#94a3b8] hover:text-white transition-colors"
            style={{ background: NAVY_MID }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-auto p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Guest Name *</label>
                <input
                  type="text"
                  required
                  value={formData.guestName}
                  onChange={(e) =>
                    setFormData({ ...formData, guestName: e.target.value })
                  }
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Guest ID</label>
                <input
                  type="text"
                  value={formData.guestId}
                  onChange={(e) =>
                    setFormData({ ...formData, guestId: e.target.value })
                  }
                  className={inputCls}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Email</label>
                <input
                  type="email"
                  value={formData.guestEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, guestEmail: e.target.value })
                  }
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Phone</label>
                <input
                  type="tel"
                  value={formData.guestPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, guestPhone: e.target.value })
                  }
                  className={inputCls}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Room Number *</label>
                <select
                  required
                  value={formData.roomId}
                  onChange={(e) => handleRoomSelect(e.target.value)}
                  className={`${inputCls} cursor-pointer`}
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
                      {room.status !== "available" ? ` (${room.status})` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Room Type</label>
                <input
                  type="text"
                  readOnly
                  value={formData.roomType}
                  className={`${inputCls} bg-[#f8fafc] text-[#64748b]`}
                  placeholder="Auto-filled from selected room"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Check-In Date *</label>
                <input
                  type="date"
                  required
                  value={formData.checkInDate}
                  onChange={(e) =>
                    setFormData({ ...formData, checkInDate: e.target.value })
                  }
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Check-Out Date *</label>
                <input
                  type="date"
                  required
                  value={formData.checkOutDate}
                  onChange={(e) =>
                    setFormData({ ...formData, checkOutDate: e.target.value })
                  }
                  className={inputCls}
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>Number of Guests</label>
              <input
                type="number"
                min="1"
                value={formData.numberOfGuests}
                onChange={(e) =>
                  setFormData({ ...formData, numberOfGuests: e.target.value })
                }
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows="3"
                className={`${inputCls} resize-none`}
                placeholder="Special requests, preferences, etc."
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 py-3 rounded-xl text-sm font-semibold transition-colors hover:brightness-95"
                style={{ background: ACCENT, color: ACCENT_TEXT }}
              >
                {existingReservation ? "Update Reservation" : "Add Reservation"}
              </button>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 border border-[#e2e8f0] py-3 rounded-xl hover:bg-[#f8fafc] text-sm font-semibold text-[#374151] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckInOutModal;
