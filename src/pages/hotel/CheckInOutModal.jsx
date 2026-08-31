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
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "checked_in":
        return "bg-green-100 text-green-800";
      case "checked_out":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "no_show":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
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
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-700 text-gray-800">
          <div>
            <h2 className="text-2xl font-bold">
              Check-In / Check-Out Management
            </h2>
            <p className="text-sm text-blue-100 mt-1">
              Manage guest arrivals and departures
            </p>
          </div>
          <button
            onClick={() => setShowModal(false)}
            className="text-gray-800 hover:bg-blue-800 p-2 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 p-6 bg-gray-50 border-b">
          <div className="bg-white p-4 rounded-lg border-2 border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Upcoming</div>
                <div className="text-2xl font-bold text-yellow-600">
                  {stats.upcoming}
                </div>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border-2 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Checked In</div>
                <div className="text-2xl font-bold text-green-600">
                  {stats.checkedIn}
                </div>
              </div>
              <UserCheck className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Checked Out</div>
                <div className="text-2xl font-bold text-gray-600">
                  {stats.checkedOut}
                </div>
              </div>
              <UserX className="w-8 h-8 text-gray-600" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border-2 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Total</div>
                <div className="text-2xl font-bold text-blue-600">
                  {stats.total}
                </div>
              </div>
              <Bed className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="p-6 border-b space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by guest name, room number, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Calendar className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-gray-800 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add Reservation
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b">
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
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
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
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredReservations.length === 0 ? (
            <div className="text-center py-12">
              <Bed className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No reservations found</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-4 text-blue-600 hover:underline"
              >
                Add your first reservation
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {reservation.guestName}
                        </h3>
                        <span
                          className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs text-sm font-medium ${getStatusBadge(reservation.status)}`}
                        >
                          {getStatusIcon(reservation.status)}
                          {reservation.status?.replace("_", " ").toUpperCase()}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              Guest ID:
                            </span>
                          </div>
                          <div className="ml-5">
                            {reservation.guestId || "N/A"}
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <Bed className="w-4 h-4" />
                            <span className="text-sm font-medium">Room:</span>
                          </div>
                          <div className="ml-5">
                            {reservation.roomNumber} - {reservation.roomType}
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              Check-In:
                            </span>
                          </div>
                          <div className="ml-5">{reservation.checkInDate}</div>
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              Check-Out:
                            </span>
                          </div>
                          <div className="ml-5">{reservation.checkOutDate}</div>
                        </div>
                      </div>

                      {reservation.notes && (
                        <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                          <span className="text-sm font-medium">Notes:</span>{" "}
                          {reservation.notes}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      {["pending", "confirmed"].includes(
                        reservation.status,
                      ) && (
                        <button
                          onClick={() => handleCheckIn(reservation)}
                          className="flex items-center gap-2 px-3 py-2 bg-green-600 text-gray-800 rounded-lg hover:bg-green-700 text-sm transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Check In
                        </button>
                      )}
                      {reservation.status === "checked_in" && (
                        <button
                          onClick={() => handleCheckOut(reservation)}
                          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-gray-800 rounded-lg hover:bg-blue-700 text-sm transition-colors"
                        >
                          <UserX className="w-4 h-4" />
                          Check Out
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedReservation(reservation);
                          setShowAddModal(true);
                        }}
                        className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(reservation)}
                        className="flex items-center gap-2 px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 text-sm transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {existingReservation ? "Edit Reservation" : "Add New Reservation"}
          </h2>
          <button
            onClick={() => setShowModal(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-auto p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Guest Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.guestName}
                  onChange={(e) =>
                    setFormData({ ...formData, guestName: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Guest ID
                </label>
                <input
                  type="text"
                  value={formData.guestId}
                  onChange={(e) =>
                    setFormData({ ...formData, guestId: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={formData.guestEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, guestEmail: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.guestPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, guestPhone: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Room Number *
                </label>
                <select
                  required
                  value={formData.roomId}
                  onChange={(e) => handleRoomSelect(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
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
                <label className="block text-sm font-medium mb-2">
                  Room Type
                </label>
                <input
                  type="text"
                  readOnly
                  value={formData.roomType}
                  className="w-full px-4 py-2 border rounded-lg bg-gray-50 text-gray-600"
                  placeholder="Auto-filled from selected room"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Check-In Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.checkInDate}
                  onChange={(e) =>
                    setFormData({ ...formData, checkInDate: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Check-Out Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.checkOutDate}
                  onChange={(e) =>
                    setFormData({ ...formData, checkOutDate: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Number of Guests
              </label>
              <input
                type="number"
                min="1"
                value={formData.numberOfGuests}
                onChange={(e) =>
                  setFormData({ ...formData, numberOfGuests: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows="3"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Special requests, preferences, etc."
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-gray-800 py-3 rounded-lg hover:bg-blue-700 text-sm font-medium"
              >
                {existingReservation ? "Update Reservation" : "Add Reservation"}
              </button>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 border border-gray-300 py-3 rounded-lg hover:bg-gray-50 text-sm font-medium"
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
