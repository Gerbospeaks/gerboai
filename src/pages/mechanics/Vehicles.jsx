import React, { useState, useEffect } from "react";
import {
  Car,
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  Calendar,
  Gauge,
  FileText,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

const Vehicles = ({ user }) => {
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    registration: "",
    make: "",
    model: "",
    year: "",
    vin: "",
    mileage: "",
    color: "",
    engineSize: "",
    fuelType: "Petrol",
    transmission: "Manual",
    ownerName: "",
    ownerPhone: "",
    ownerEmail: "",
    notes: "",
    lastServiceDate: "",
    nextServiceDue: "",
    status: "Active",
  });

  useEffect(() => {
    loadVehicles();
  }, [user]);

  useEffect(() => {
    filterVehicles();
  }, [searchTerm, vehicles]);

  const loadVehicles = async () => {
    if (!user?.uid) return;

    setLoading(true);
    try {
      const db = getFirestore();
      const vehiclesRef = collection(db, "users", user.uid, "vehicles");
      const q = query(vehiclesRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);

      const vehiclesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setVehicles(vehiclesData);
      setFilteredVehicles(vehiclesData);
    } catch (error) {
      console.error("Error loading vehicles:", error);
      alert("Failed to load vehicles");
    } finally {
      setLoading(false);
    }
  };

  const filterVehicles = () => {
    if (!searchTerm.trim()) {
      setFilteredVehicles(vehicles);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = vehicles.filter(
      (vehicle) =>
        vehicle.registration?.toLowerCase().includes(term) ||
        vehicle.make?.toLowerCase().includes(term) ||
        vehicle.model?.toLowerCase().includes(term) ||
        vehicle.vin?.toLowerCase().includes(term) ||
        vehicle.ownerName?.toLowerCase().includes(term),
    );

    setFilteredVehicles(filtered);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      registration: "",
      make: "",
      model: "",
      year: "",
      vin: "",
      mileage: "",
      color: "",
      engineSize: "",
      fuelType: "Petrol",
      transmission: "Manual",
      ownerName: "",
      ownerPhone: "",
      ownerEmail: "",
      notes: "",
      lastServiceDate: "",
      nextServiceDue: "",
      status: "Active",
    });
    setEditingVehicle(null);
  };

  const handleAddNew = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      registration: vehicle.registration || "",
      make: vehicle.make || "",
      model: vehicle.model || "",
      year: vehicle.year || "",
      vin: vehicle.vin || "",
      mileage: vehicle.mileage || "",
      color: vehicle.color || "",
      engineSize: vehicle.engineSize || "",
      fuelType: vehicle.fuelType || "Petrol",
      transmission: vehicle.transmission || "Manual",
      ownerName: vehicle.ownerName || "",
      ownerPhone: vehicle.ownerPhone || "",
      ownerEmail: vehicle.ownerEmail || "",
      notes: vehicle.notes || "",
      lastServiceDate: vehicle.lastServiceDate || "",
      nextServiceDue: vehicle.nextServiceDue || "",
      status: vehicle.status || "Active",
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!user?.uid) {
      alert("User not authenticated");
      return;
    }

    if (!formData.registration || !formData.make || !formData.model) {
      alert("Please fill in Registration, Make, and Model");
      return;
    }

    try {
      const db = getFirestore();
      const vehiclesRef = collection(db, "users", user.uid, "vehicles");

      const vehicleData = {
        ...formData,
        updatedAt: serverTimestamp(),
      };

      if (editingVehicle) {
        await updateDoc(
          doc(db, "users", user.uid, "vehicles", editingVehicle.id),
          vehicleData,
        );
        alert("Vehicle updated successfully!");
      } else {
        vehicleData.createdAt = serverTimestamp();
        await addDoc(vehiclesRef, vehicleData);
        alert("Vehicle added successfully!");
      }

      setShowModal(false);
      resetForm();
      loadVehicles();
    } catch (error) {
      console.error("Error saving vehicle:", error);
      alert("Failed to save vehicle");
    }
  };

  const handleDelete = async (vehicleId) => {
    if (!window.confirm("Are you sure you want to delete this vehicle?")) {
      return;
    }

    try {
      const db = getFirestore();
      await deleteDoc(doc(db, "users", user.uid, "vehicles", vehicleId));
      alert("Vehicle deleted successfully!");
      loadVehicles();
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      alert("Failed to delete vehicle");
    }
  };

  return (
    <div className="p-6 bg-gray-300 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Vehicles</h1>
        <p className="text-gray-600">
          Manage your vehicle inventory and records
        </p>
      </div>

      {/* Search and Add Bar */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by registration, make, model, VIN, or owner..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-gray-50 rounded-lg hover:bg-orange-700 transition-colors whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            Add Vehicle
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Vehicles</p>
              <p className="text-2xl font-bold text-gray-900">
                {vehicles.length}
              </p>
            </div>
            <Car className="w-10 h-10 text-orange-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600">
                {vehicles.filter((v) => v.status === "Active").length}
              </p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Service</p>
              <p className="text-2xl font-bold text-blue-600">
                {vehicles.filter((v) => v.status === "In Service").length}
              </p>
            </div>
            <Gauge className="w-10 h-10 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Inactive</p>
              <p className="text-2xl font-bold text-gray-600">
                {vehicles.filter((v) => v.status === "Inactive").length}
              </p>
            </div>
            <AlertCircle className="w-10 h-10 text-gray-600" />
          </div>
        </div>
      </div>

      {/* Vehicles List */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading vehicles...</div>
        </div>
      ) : filteredVehicles.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {searchTerm ? "No vehicles found" : "No vehicles yet"}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm
              ? "Try adjusting your search terms"
              : "Get started by adding your first vehicle"}
          </p>
          {!searchTerm && (
            <button
              onClick={handleAddNew}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-600 text-gray-50 rounded-lg hover:bg-orange-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Your First Vehicle
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredVehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Car className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">
                        {vehicle.registration}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs text-sm font-medium ${
                      vehicle.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : vehicle.status === "In Service"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {vehicle.status}
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-2 mb-4">
                  {vehicle.vin && (
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">VIN:</span>
                      <span className="text-gray-900 font-mono text-xs">
                        {vehicle.vin}
                      </span>
                    </div>
                  )}
                  {vehicle.mileage && (
                    <div className="flex items-center gap-2 text-sm">
                      <Gauge className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Mileage:</span>
                      <span className="text-gray-900">
                        {vehicle.mileage} km
                      </span>
                    </div>
                  )}
                  {vehicle.color && (
                    <div className="flex items-center gap-2 text-sm">
                      <div
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: vehicle.color.toLowerCase() }}
                      ></div>
                      <span className="text-gray-600">Color:</span>
                      <span className="text-gray-900">{vehicle.color}</span>
                    </div>
                  )}
                  {vehicle.ownerName && (
                    <div className="text-sm">
                      <span className="text-gray-600">Owner:</span>
                      <span className="text-gray-900 ml-2">
                        {vehicle.ownerName}
                      </span>
                    </div>
                  )}
                </div>

                {/* Service Info */}
                {(vehicle.lastServiceDate || vehicle.nextServiceDue) && (
                  <div className="border-t pt-4 mb-4">
                    <div className="text-xs text-gray-600 space-y-1">
                      {vehicle.lastServiceDate && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3" />
                          <span>
                            Last Service:{" "}
                            {new Date(
                              vehicle.lastServiceDate,
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {vehicle.nextServiceDue && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3" />
                          <span>
                            Next Service:{" "}
                            {new Date(
                              vehicle.nextServiceDue,
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(vehicle)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-800 transition-colors text-sm"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(vehicle.id)}
                    className="flex items-center justify-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                {editingVehicle ? "Edit Vehicle" : "Add New Vehicle"}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="overflow-auto p-6">
              <div className="space-y-6">
                {/* Vehicle Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Vehicle Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Registration Number *
                      </label>
                      <input
                        type="text"
                        name="registration"
                        value={formData.registration}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="ABC 123 GP"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Make *
                      </label>
                      <input
                        type="text"
                        name="make"
                        value={formData.make}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Toyota"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Model *
                      </label>
                      <input
                        type="text"
                        name="model"
                        value={formData.model}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Hilux"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Year
                      </label>
                      <input
                        type="text"
                        name="year"
                        value={formData.year}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="2020"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        VIN Number
                      </label>
                      <input
                        type="text"
                        name="vin"
                        value={formData.vin}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="1HGBH41JXMN109186"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Current Mileage (km)
                      </label>
                      <input
                        type="text"
                        name="mileage"
                        value={formData.mileage}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="45000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Color
                      </label>
                      <input
                        type="text"
                        name="color"
                        value={formData.color}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="White"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Engine Size
                      </label>
                      <input
                        type="text"
                        name="engineSize"
                        value={formData.engineSize}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="2.8L"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fuel Type
                      </label>
                      <select
                        name="fuelType"
                        value={formData.fuelType}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        <option value="Petrol">Petrol</option>
                        <option value="Diesel">Diesel</option>
                        <option value="Electric">Electric</option>
                        <option value="Hybrid">Hybrid</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Transmission
                      </label>
                      <select
                        name="transmission"
                        value={formData.transmission}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        <option value="Manual">Manual</option>
                        <option value="Automatic">Automatic</option>
                        <option value="Semi-Automatic">Semi-Automatic</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Owner Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Owner Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Owner Name
                      </label>
                      <input
                        type="text"
                        name="ownerName"
                        value={formData.ownerName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="John Smith"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Owner Phone
                      </label>
                      <input
                        type="tel"
                        name="ownerPhone"
                        value={formData.ownerPhone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="082 123 4567"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Owner Email
                      </label>
                      <input
                        type="email"
                        name="ownerEmail"
                        value={formData.ownerEmail}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Service Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Service Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Service Date
                      </label>
                      <input
                        type="date"
                        name="lastServiceDate"
                        value={formData.lastServiceDate}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Next Service Due
                      </label>
                      <input
                        type="date"
                        name="nextServiceDue"
                        value={formData.nextServiceDue}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        <option value="Active">Active</option>
                        <option value="In Service">In Service</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Any additional notes about this vehicle..."
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="flex-1 px-6 py-3 bg-gray-600 text-gray-800 rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    {editingVehicle ? "Update Vehicle" : "Add Vehicle"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vehicles;
