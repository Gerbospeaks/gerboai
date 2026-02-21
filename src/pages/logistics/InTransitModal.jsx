import React, { useState, useEffect } from "react";
import {
  X,
  Truck,
  MapPin,
  Clock,
  Package,
  Search,
  Filter,
  Eye,
  Printer,
  CheckCircle,
} from "lucide-react";
import {
  getFirestore,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

const InTransitModal = ({
  isOpen,
  onClose,
  user,
  onViewDetails,
  onPrintLabel,
}) => {
  const [inTransitWaybills, setInTransitWaybills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all, pending, in-transit, delayed
  const [selectedWaybill, setSelectedWaybill] = useState(null);

  useEffect(() => {
    if (isOpen && user?.uid) {
      loadInTransitWaybills();
    }
  }, [isOpen, user]);

  const loadInTransitWaybills = async () => {
    if (!user?.uid) return;

    setLoading(true);
    try {
      const db = getFirestore();
      const waybillsRef = collection(db, "users", user.uid, "waybills");

      // Query for waybills that are NOT delivered
      const q = query(
        waybillsRef,
        where("status", "in", [
          "pending",
          "in-transit",
          "picked-up",
          "at-depot",
          "out-for-delivery",
        ]),
        orderBy("createdAt", "desc"),
      );

      const snapshot = await getDocs(q);
      const waybills = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        // Calculate estimated delivery if not set
        estimatedDelivery:
          doc.data().estimatedDelivery ||
          calculateEstimatedDelivery(doc.data()),
      }));

      setInTransitWaybills(waybills);
    } catch (error) {
      console.error("Error loading in-transit waybills:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateEstimatedDelivery = (waybill) => {
    if (!waybill.dates?.shipmentDate) return null;

    const shipmentDate = new Date(waybill.dates.shipmentDate);
    // Add 2-3 days for standard delivery
    const estimatedDays = 3;
    const estimated = new Date(shipmentDate);
    estimated.setDate(estimated.getDate() + estimatedDays);

    return estimated.toISOString();
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
      "picked-up": "bg-blue-100 text-blue-800 border-blue-300",
      "in-transit": "bg-purple-100 text-purple-800 border-purple-300",
      "at-depot": "bg-indigo-100 text-indigo-800 border-indigo-300",
      "out-for-delivery": "bg-green-100 text-green-800 border-green-300",
      delayed: "bg-red-100 text-red-800 border-red-300",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "picked-up":
        return <Package className="w-4 h-4" />;
      case "in-transit":
        return <Truck className="w-4 h-4" />;
      case "at-depot":
        return <MapPin className="w-4 h-4" />;
      case "out-for-delivery":
        return <Truck className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const handleMarkDelivered = async (waybillId) => {
    if (!user?.uid) return;

    if (!window.confirm("Mark this shipment as delivered?")) return;

    try {
      const db = getFirestore();
      const waybillRef = doc(db, "users", user.uid, "waybills", waybillId);

      await updateDoc(waybillRef, {
        status: "delivered",
        "dates.deliveredDate": new Date().toISOString(),
        updatedAt: serverTimestamp(),
      });

      alert("Shipment marked as delivered!");
      loadInTransitWaybills(); // Refresh the list
    } catch (error) {
      console.error("Error marking as delivered:", error);
      alert("Failed to update shipment status");
    }
  };

  const filteredWaybills = inTransitWaybills.filter((waybill) => {
    const matchesSearch =
      waybill.waybillNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      waybill.shipment?.trackingNumber
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      waybill.sender?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      waybill.receiver?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === "all" ||
      waybill.status === filterStatus ||
      (filterStatus === "delayed" && isDelayed(waybill));

    return matchesSearch && matchesFilter;
  });

  const isDelayed = (waybill) => {
    if (!waybill.estimatedDelivery) return false;
    return (
      new Date(waybill.estimatedDelivery) < new Date() &&
      waybill.status !== "delivered"
    );
  };

  const getDaysInTransit = (waybill) => {
    if (!waybill.dates?.shipmentDate) return 0;
    const shipDate = new Date(waybill.dates.shipmentDate);
    const today = new Date();
    const diffTime = Math.abs(today - shipDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Truck className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">Shipments In Transit</h2>
                <p className="text-sm text-blue-100">
                  Real-time tracking and management
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-800 hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <div className="text-sm text-blue-100">Total In Transit</div>
              <div className="text-2xl font-bold">
                {inTransitWaybills.length}
              </div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <div className="text-sm text-blue-100">Pending Pickup</div>
              <div className="text-2xl font-bold">
                {inTransitWaybills.filter((w) => w.status === "pending").length}
              </div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <div className="text-sm text-blue-100">On The Road</div>
              <div className="text-2xl font-bold">
                {
                  inTransitWaybills.filter((w) => w.status === "in-transit")
                    .length
                }
              </div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <div className="text-sm text-blue-100">Out for Delivery</div>
              <div className="text-2xl font-bold">
                {
                  inTransitWaybills.filter(
                    (w) => w.status === "out-for-delivery",
                  ).length
                }
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by waybill, tracking number, sender or receiver..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending Pickup</option>
                <option value="picked-up">Picked Up</option>
                <option value="in-transit">In Transit</option>
                <option value="at-depot">At Depot</option>
                <option value="out-for-delivery">Out for Delivery</option>
                <option value="delayed">Delayed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Shipments List */}
        <div className="flex-1 overflow-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Truck className="w-12 h-12 text-gray-400 animate-bounce mx-auto mb-4" />
                <p className="text-gray-500">Loading shipments...</p>
              </div>
            </div>
          ) : filteredWaybills.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg text-sm font-medium">
                  No shipments found
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  {searchTerm
                    ? "Try adjusting your search or filter"
                    : "All shipments have been delivered"}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredWaybills.map((waybill) => (
                <div
                  key={waybill.id}
                  className="border rounded-lg p-4 hover:shadow-lg transition-shadow bg-white"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left Section - Waybill Info */}
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <div
                          className={`p-2 rounded-lg border-2 ${getStatusColor(waybill.status)}`}
                        >
                          {getStatusIcon(waybill.status)}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-lg">
                              {waybill.waybillNumber}
                            </h3>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold border-2 ${getStatusColor(waybill.status)}`}
                            >
                              {waybill.status?.toUpperCase().replace("-", " ")}
                            </span>
                            {isDelayed(waybill) && (
                              <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">
                                ⚠️ DELAYED
                              </span>
                            )}
                          </div>

                          <div className="text-sm text-gray-600 mt-1">
                            Tracking:{" "}
                            <span className="font-mono font-semibold">
                              {waybill.shipment?.trackingNumber}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                            <div>
                              <div className="text-xs text-gray-500">FROM</div>
                              <div className="font-semibold">
                                {waybill.sender?.name}
                              </div>
                              <div className="text-sm text-gray-600">
                                {waybill.shipment?.origin}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500">TO</div>
                              <div className="font-semibold">
                                {waybill.receiver?.name}
                              </div>
                              <div className="text-sm text-gray-600">
                                {waybill.shipment?.destination}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 mt-3 text-sm">
                            <div className="flex items-center gap-1 text-gray-600">
                              <Package className="w-4 h-4" />
                              <span>{waybill.shipment?.cargoType}</span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-600">
                              <Clock className="w-4 h-4" />
                              <span>
                                {getDaysInTransit(waybill)} days in transit
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Section - Actions & Info */}
                    <div className="flex flex-col items-end gap-3 lg:min-w-[200px]">
                      <div className="text-right">
                        <div className="text-sm text-gray-500">
                          Total Amount
                        </div>
                        <div className="text-2xl font-bold text-blue-600">
                          R {waybill.totals?.total?.toFixed(2) || "0.00"}
                        </div>
                      </div>

                      {waybill.estimatedDelivery && (
                        <div className="text-right">
                          <div className="text-xs text-gray-500">
                            Est. Delivery
                          </div>
                          <div className="text-sm font-semibold">
                            {new Date(
                              waybill.estimatedDelivery,
                            ).toLocaleDateString("en-ZA", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <button
                          onClick={() => onViewDetails(waybill)}
                          className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-gray-800 rounded-lg hover:bg-blue-700 text-sm"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                        <button
                          onClick={() => onPrintLabel(waybill)}
                          className="flex items-center gap-1 px-3 py-2 bg-gray-600 text-gray-800 rounded-lg hover:bg-gray-700 text-sm"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleMarkDelivered(waybill.id)}
                          className="flex items-center gap-1 px-3 py-2 bg-green-600 text-gray-800 rounded-lg hover:bg-green-700 text-sm"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Deliver
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Showing {filteredWaybills.length} of {inTransitWaybills.length}{" "}
            shipments
          </div>
          <button
            onClick={() => loadInTransitWaybills()}
            className="px-4 py-2 bg-blue-600 text-gray-800 rounded-lg hover:bg-blue-700 text-sm"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
};

export default InTransitModal;
