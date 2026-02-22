import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import HomeView from "../HomeView";
import BusinessSettingsModal from "../BusinessSettingsModal";
import AppHeader from "../AppHeader";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import {
  X,
  Search,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Trash2,
  UserPlus,
  Filter,
  Download,
} from "lucide-react";

const GuestsListModal = ({
  showModal,
  setShowModal,
  guests,
  onLoadGuest,
  onEditGuest,
  onAddNewGuest,
}) => {
  const { user, authUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredGuests, setFilteredGuests] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (guests) {
      // Filter guests based on search term
      const filtered = guests.filter((guest) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          guest.name?.toLowerCase().includes(searchLower) ||
          guest.email?.toLowerCase().includes(searchLower) ||
          guest.phone?.toLowerCase().includes(searchLower) ||
          guest.guestId?.toLowerCase().includes(searchLower) ||
          guest.nationality?.toLowerCase().includes(searchLower)
        );
      });
      setFilteredGuests(filtered);
    }
  }, [guests, searchTerm]);

  const handleDeleteGuest = async (guestId, guestName) => {
    if (!user?.uid) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to delete guest "${guestName}"? This action cannot be undone.`,
    );

    if (!confirmDelete) return;

    setLoading(true);
    try {
      const db = getFirestore();
      await deleteDoc(doc(db, "users", user.uid, "guests", guestId));
      alert("Guest deleted successfully!");

      // Refresh the guest list by filtering out the deleted guest
      setFilteredGuests((prev) => prev.filter((g) => g.id !== guestId));
    } catch (error) {
      console.error("Error deleting guest:", error);
      alert("Failed to delete guest. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadGuest = (guest) => {
    if (onLoadGuest) {
      onLoadGuest(guest);
      setShowModal(false);
    }
  };

  const handleClose = () => {
    setSearchTerm("");
    setShowModal(false);
  };

  const exportToCSV = () => {
    if (filteredGuests.length === 0) {
      alert("No guests to export");
      return;
    }

    const headers = [
      "Name",
      "Guest ID",
      "Email",
      "Phone",
      "Address",
      "Date of Birth",
      "Nationality",
      "ID Type",
      "ID Number",
    ];
    const rows = filteredGuests.map((guest) => [
      guest.name || "",
      guest.guestId || "",
      guest.email || "",
      guest.phone || "",
      guest.address || "",
      guest.dateOfBirth || "",
      guest.nationality || "",
      guest.idType || "",
      guest.idNumber || "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `guests_export_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-blue-600 to-blue-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-gray-800" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  All Guests ({filteredGuests.length})
                </h2>
                <p className="text-blue-100 text-sm">
                  Click on a guest to load their details
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-800 hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, phone, guest ID, or nationality..."
              className="w-full pl-12 pr-4 py-3 border-0 rounded-lg focus:ring-2 focus:ring-blue-300 text-gray-900"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-3 border-b bg-gray-800 flex justify-between items-center">
          <div className="flex gap-2">
            <button
              onClick={onAddNewGuest}
              className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-800 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <UserPlus className="w-4 h-4" />
              Add New Guest
            </button>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
          <div className="text-sm text-gray-600">
            {filteredGuests.length}{" "}
            {filteredGuests.length === 1 ? "guest" : "guests"} found
          </div>
        </div>

        {/* Guest List */}
        <div className="overflow-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredGuests.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm ? "No guests found" : "No guests yet"}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm
                  ? "Try adjusting your search terms"
                  : "Add your first guest to get started"}
              </p>
              {!searchTerm && (
                <button
                  onClick={onAddNewGuest}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-800 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  Add First Guest
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredGuests.map((guest) => (
                <div
                  key={guest.id}
                  className="border border-gray-200 rounded-lg hover:shadow-md transition-shadow bg-white overflow-hidden"
                >
                  <div
                    onClick={() => handleLoadGuest(guest)}
                    className="p-5 cursor-pointer hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">
                            {guest.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            ID: {guest.guestId}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {guest.email && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="truncate">{guest.email}</span>
                        </div>
                      )}
                      {guest.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span>{guest.phone}</span>
                        </div>
                      )}
                      {guest.address && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="truncate">{guest.address}</span>
                        </div>
                      )}
                      {guest.nationality && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span>{guest.nationality}</span>
                          {guest.dateOfBirth && (
                            <span className="text-gray-400">
                              • Born{" "}
                              {new Date(guest.dateOfBirth).toLocaleDateString(
                                "en-ZA",
                              )}
                            </span>
                          )}
                        </div>
                      )}
                      {guest.idType && guest.idNumber && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="text-sm font-medium">
                            {guest.idType}:
                          </span>
                          <span>{guest.idNumber}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="px-5 py-3 bg-gray-800 border-t flex justify-end gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditGuest(guest);
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteGuest(guest.id, guest.name);
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-800 text-center text-sm text-gray-600">
          Tip: Click on any guest card to load their details into the invoice
          form
        </div>
      </div>
    </div>
  );
};

export default GuestsListModal;
