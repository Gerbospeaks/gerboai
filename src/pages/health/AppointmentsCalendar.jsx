import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  Plus,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Video,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Trash2,
  MessageSquare,
  Bot,
  RefreshCw,
} from "lucide-react";
import { 
  collection, 
  query, 
  orderBy, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  where,
  serverTimestamp 
} from "firebase/firestore";
import { db } from "../../firebase";

const AppointmentsCalendar = ({ user }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [viewMode, setViewMode] = useState("month"); // month, week, day
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [aiReceptionistData, setAiReceptionistData] = useState([]);
  const [showAiPanel, setShowAiPanel] = useState(false);

  // New appointment form state
  const [newAppointment, setNewAppointment] = useState({
    patientName: "",
    patientEmail: "",
    patientPhone: "",
    date: "",
    time: "",
    duration: "30",
    type: "consultation",
    status: "scheduled",
    notes: "",
    source: "manual",
  });

  useEffect(() => {
    if (user?.uid) {
      loadAppointments();
      loadAiReceptionistData();
    }
  }, [user]);

  useEffect(() => {
    filterAppointments();
  }, [appointments, searchTerm, filterStatus, selectedDate, viewMode]);

  const loadAppointments = async () => {
    if (!user?.uid) return;

    try {
      const appointmentsRef = collection(db, "users", user.uid, "appointments");
      const q = query(appointmentsRef, orderBy("date", "asc"));
      const snapshot = await getDocs(q);

      const appointmentsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setAppointments(appointmentsData);
    } catch (error) {
      console.error("Error loading appointments:", error);
    }
  };

  const loadAiReceptionistData = async () => {
    if (!user?.uid) return;

    try {
      // This would connect to your AI receptionist webhook/API
      const aiRef = collection(db, "users", user.uid, "aiAppointments");
      const q = query(aiRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);

      const aiData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setAiReceptionistData(aiData);
    } catch (error) {
      console.error("Error loading AI receptionist data:", error);
    }
  };

  const filterAppointments = () => {
    let filtered = [...appointments];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (apt) =>
          apt.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          apt.patientPhone?.includes(searchTerm) ||
          apt.patientEmail?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter((apt) => apt.status === filterStatus);
    }

    // Filter by date based on view mode
    if (viewMode === "day") {
      filtered = filtered.filter((apt) => {
        const aptDate = new Date(apt.date);
        return isSameDay(aptDate, selectedDate);
      });
    } else if (viewMode === "week") {
      filtered = filtered.filter((apt) => {
        const aptDate = new Date(apt.date);
        return isSameWeek(aptDate, selectedDate);
      });
    } else if (viewMode === "month") {
      filtered = filtered.filter((apt) => {
        const aptDate = new Date(apt.date);
        return isSameMonth(aptDate, currentDate);
      });
    }

    // Sort by date and time
    filtered.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateA - dateB;
    });

    setFilteredAppointments(filtered);
  };

  const handleAddAppointment = async () => {
    if (!user?.uid) return;

    if (!newAppointment.patientName || !newAppointment.date || !newAppointment.time) {
      alert("Please fill in patient name, date, and time");
      return;
    }

    try {
      const appointmentData = {
        ...newAppointment,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(
        collection(db, "users", user.uid, "appointments"),
        appointmentData
      );

      alert("Appointment added successfully!");
      setShowAddModal(false);
      resetForm();
      loadAppointments();
    } catch (error) {
      console.error("Error adding appointment:", error);
      alert("Failed to add appointment");
    }
  };

  const handleUpdateAppointment = async (appointmentId, updates) => {
    if (!user?.uid) return;

    try {
      await updateDoc(
        doc(db, "users", user.uid, "appointments", appointmentId),
        {
          ...updates,
          updatedAt: serverTimestamp(),
        }
      );

      alert("Appointment updated!");
      loadAppointments();
      setShowDetailsModal(false);
    } catch (error) {
      console.error("Error updating appointment:", error);
      alert("Failed to update appointment");
    }
  };

  const handleDeleteAppointment = async (appointmentId) => {
    if (!user?.uid) return;

    const confirmDelete = window.confirm("Delete this appointment?");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "users", user.uid, "appointments", appointmentId));
      alert("Appointment deleted!");
      loadAppointments();
      setShowDetailsModal(false);
    } catch (error) {
      console.error("Error deleting appointment:", error);
      alert("Failed to delete appointment");
    }
  };

  const handleImportFromAi = async (aiAppointment) => {
    if (!user?.uid) return;

    try {
      const appointmentData = {
        patientName: aiAppointment.patientName || "",
        patientEmail: aiAppointment.patientEmail || "",
        patientPhone: aiAppointment.patientPhone || "",
        date: aiAppointment.date || "",
        time: aiAppointment.time || "",
        duration: aiAppointment.duration || "30",
        type: aiAppointment.type || "consultation",
        status: "scheduled",
        notes: aiAppointment.notes || "",
        source: "ai-receptionist",
        aiData: aiAppointment,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(
        collection(db, "users", user.uid, "appointments"),
        appointmentData
      );

      alert("Appointment imported from AI receptionist!");
      loadAppointments();
      setShowAiPanel(false);
    } catch (error) {
      console.error("Error importing appointment:", error);
      alert("Failed to import appointment");
    }
  };

  const resetForm = () => {
    setNewAppointment({
      patientName: "",
      patientEmail: "",
      patientPhone: "",
      date: "",
      time: "",
      duration: "30",
      type: "consultation",
      status: "scheduled",
      notes: "",
      source: "manual",
    });
  };

  // Date utility functions
  const isSameDay = (date1, date2) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  const isSameWeek = (date1, date2) => {
    const oneDay = 24 * 60 * 60 * 1000;
    const firstDay = new Date(date2);
    firstDay.setDate(date2.getDate() - date2.getDay());
    const lastDay = new Date(firstDay);
    lastDay.setDate(firstDay.getDate() + 6);
    return date1 >= firstDay && date1 <= lastDay;
  };

  const isSameMonth = (date1, date2) => {
    return (
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const getAppointmentsForDay = (date) => {
    if (!date) return [];
    return appointments.filter((apt) => {
      const aptDate = new Date(apt.date);
      return isSameDay(aptDate, date);
    });
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "no-show":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      case "no-show":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const todayAppointments = appointments.filter((apt) => {
    const aptDate = new Date(apt.date);
    return isSameDay(aptDate, new Date());
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center space-x-3">
              <Calendar className="w-8 h-8" />
              <span>Appointments</span>
            </h1>
            <p className="text-purple-100">
              Manage your practice schedule and appointments
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">{todayAppointments.length}</div>
            <div className="text-sm text-purple-100">Today's Appointments</div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              <span>New Appointment</span>
            </button>

            <button
              onClick={() => setShowAiPanel(!showAiPanel)}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <Bot className="w-4 h-4" />
              <span>AI Receptionist ({aiReceptionistData.length})</span>
            </button>

            <button
              onClick={loadAppointments}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-300"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center space-x-2">
            {["month", "week", "day"].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-2 rounded-lg capitalize ${
                  viewMode === mode
                    ? "bg-gray-800 text-white"
                    : "border border-gray-300 hover:bg-gray-300"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mt-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search appointments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="all">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="no-show">No Show</option>
          </select>
        </div>
      </div>

      {/* AI Receptionist Panel */}
      {showAiPanel && (
        <div className="bg-white rounded-lg border border-purple-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <Bot className="w-5 h-5 text-purple-600" />
              <span>AI Receptionist Bookings</span>
            </h3>
            <button
              onClick={() => setShowAiPanel(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          {aiReceptionistData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bot className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p>No AI receptionist bookings yet</p>
              <p className="text-sm mt-2">
                Connect your website's AI receptionist to see bookings here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {aiReceptionistData.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-4 bg-purple-50 rounded-lg"
                >
                  <div>
                    <div className="font-medium">{booking.patientName}</div>
                    <div className="text-sm text-gray-600">
                      {booking.date} at {booking.time}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {booking.patientPhone} • {booking.patientEmail}
                    </div>
                  </div>
                  <button
                    onClick={() => handleImportFromAi(booking)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Import
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Calendar View */}
      {viewMode === "month" && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              {currentDate.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigateMonth(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-300"
              >
                Today
              </button>
              <button
                onClick={() => navigateMonth(1)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="text-center font-semibold text-gray-600 py-2"
              >
                {day}
              </div>
            ))}

            {getDaysInMonth(currentDate).map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="p-2"></div>;
              }

              const dayAppointments = getAppointmentsForDay(date);
              const isToday = isSameDay(date, new Date());
              const isSelected = isSameDay(date, selectedDate);

              return (
                <div
                  key={index}
                  onClick={() => {
                    setSelectedDate(date);
                    setViewMode("day");
                  }}
                  className={`min-h-24 p-2 border rounded-lg cursor-pointer transition-colors ${
                    isToday
                      ? "bg-blue-50 border-blue-500"
                      : isSelected
                      ? "bg-blue-100 border-blue-400"
                      : "hover:bg-gray-300 border-gray-200"
                  }`}
                >
                  <div
                    className={`text-sm font-medium mb-1 ${
                      isToday ? "text-blue-600" : ""
                    }`}
                  >
                    {date.getDate()}
                  </div>
                  {dayAppointments.slice(0, 2).map((apt) => (
                    <div
                      key={apt.id}
                      className="text-xs bg-gray-800 text-white rounded px-1 py-0.5 mb-1 truncate"
                    >
                      {apt.time} {apt.patientName}
                    </div>
                  ))}
                  {dayAppointments.length > 2 && (
                    <div className="text-xs text-gray-500">
                      +{dayAppointments.length - 2} more
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Day/Week List View */}
      {(viewMode === "day" || viewMode === "week") && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              {viewMode === "day"
                ? selectedDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })
                : "Week View"}
            </h2>
            <button
              onClick={() => setViewMode("month")}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-300"
            >
              Back to Month
            </button>
          </div>

          {filteredAppointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No appointments scheduled</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAppointments.map((apt) => (
                <div
                  key={apt.id}
                  onClick={() => {
                    setSelectedAppointment(apt);
                    setShowDetailsModal(true);
                  }}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-300 cursor-pointer"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-16 text-center">
                      <div className="text-2xl font-bold">{apt.time}</div>
                      <div className="text-xs text-gray-500">
                        {apt.duration}min
                      </div>
                    </div>
                    <div className="w-px h-12 bg-gray-200"></div>
                    <div>
                      <div className="font-semibold text-lg">
                        {apt.patientName}
                      </div>
                      <div className="text-sm text-gray-600 flex items-center space-x-4 mt-1">
                        <span className="flex items-center space-x-1">
                          <Phone className="w-4 h-4" />
                          <span>{apt.patientPhone}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Mail className="w-4 h-4" />
                          <span>{apt.patientEmail}</span>
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1 capitalize">
                        {apt.type}
                        {apt.source === "ai-receptionist" && (
                          <span className="ml-2 text-purple-600">
                            • Via AI Receptionist
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div>
                    <span
                      className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        apt.status
                      )}`}
                    >
                      {getStatusIcon(apt.status)}
                      <span className="capitalize">{apt.status}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Appointment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-semibold">New Appointment</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="overflow-auto p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Patient Name *
                    </label>
                    <input
                      type="text"
                      value={newAppointment.patientName}
                      onChange={(e) =>
                        setNewAppointment({
                          ...newAppointment,
                          patientName: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={newAppointment.patientPhone}
                      onChange={(e) =>
                        setNewAppointment({
                          ...newAppointment,
                          patientPhone: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newAppointment.patientEmail}
                    onChange={(e) =>
                      setNewAppointment({
                        ...newAppointment,
                        patientEmail: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Date *
                    </label>
                    <input
                      type="date"
                      value={newAppointment.date}
                      onChange={(e) =>
                        setNewAppointment({
                          ...newAppointment,
                          date: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Time *
                    </label>
                    <input
                      type="time"
                      value={newAppointment.time}
                      onChange={(e) =>
                        setNewAppointment({
                          ...newAppointment,
                          time: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Duration (min)
                    </label>
                    <select
                      value={newAppointment.duration}
                      onChange={(e) =>
                        setNewAppointment({
                          ...newAppointment,
                          duration: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border rounded-lg"
                    >
                      <option value="15">15</option>
                      <option value="30">30</option>
                      <option value="45">45</option>
                      <option value="60">60</option>
                      <option value="90">90</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Appointment Type
                    </label>
                    <select
                      value={newAppointment.type}
                      onChange={(e) =>
                        setNewAppointment({
                          ...newAppointment,
                          type: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border rounded-lg"
                    >
                      <option value="consultation">Consultation</option>
                      <option value="follow-up">Follow-up</option>
                      <option value="checkup">Check-up</option>
                      <option value="procedure">Procedure</option>
                      <option value="emergency">Emergency</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Status
                    </label>
                    <select
                      value={newAppointment.status}
                      onChange={(e) =>
                        setNewAppointment({
                          ...newAppointment,
                          status: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border rounded-lg"
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="confirmed">Confirmed</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Notes
                  </label>
                  <textarea
                    value={newAppointment.notes}
                    onChange={(e) =>
                      setNewAppointment({
                        ...newAppointment,
                        notes: e.target.value,
                      })
                    }
                    rows="3"
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>

                <button
                  onClick={handleAddAppointment}
                  className="w-full bg-gray-800 text-white py-3 rounded-lg hover:bg-blue-700"
                >
                  Create Appointment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Appointment Details Modal */}
      {showDetailsModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b flex items-center justify-between bg-gradient-to-r from-purple-600 to-blue-600 text-white">
              <h2 className="text-xl font-semibold">Appointment Details</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-white hover:text-gray-200 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="overflow-auto p-6 space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-300 rounded-lg">
                <div>
                  <div className="text-2xl font-bold">
                    {selectedAppointment.patientName}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {selectedAppointment.date} at {selectedAppointment.time}
                  </div>
                </div>
                <span
                  className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    selectedAppointment.status
                  )}`}
                >
                  {getStatusIcon(selectedAppointment.status)}
                  <span className="capitalize">{selectedAppointment.status}</span>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2 text-blue-600 mb-2">
                    <Phone className="w-4 h-4" />
                    <span className="font-semibold">Phone</span>
                  </div>
                  <div>{selectedAppointment.patientPhone || "N/A"}</div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2 text-blue-600 mb-2">
                    <Mail className="w-4 h-4" />
                    <span className="font-semibold">Email</span>
                  </div>
                  <div className="text-sm break-all">
                    {selectedAppointment.patientEmail || "N/A"}
                  </div>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center space-x-2 text-purple-600 mb-2">
                    <Clock className="w-4 h-4" />
                    <span className="font-semibold">Duration</span>
                  </div>
                  <div>{selectedAppointment.duration} minutes</div>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center space-x-2 text-purple-600 mb-2">
                    <Users className="w-4 h-4" />
                    <span className="font-semibold">Type</span>
                  </div>
                  <div className="capitalize">{selectedAppointment.type}</div>
                </div>
              </div>

              {selectedAppointment.notes && (
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <div className="flex items-center space-x-2 text-yellow-600 mb-2">
                    <MessageSquare className="w-4 h-4" />
                    <span className="font-semibold">Notes</span>
                  </div>
                  <div className="text-sm">{selectedAppointment.notes}</div>
                </div>
              )}

              {selectedAppointment.source === "ai-receptionist" && (
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center space-x-2 text-purple-600">
                    <Bot className="w-5 h-5" />
                    <span className="font-semibold">
                      Booked via AI Receptionist
                    </span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-4">
                <button
                  onClick={() =>
                    handleUpdateAppointment(selectedAppointment.id, {
                      status: "confirmed",
                    })
                  }
                  className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Confirm</span>
                </button>

                <button
                  onClick={() =>
                    handleUpdateAppointment(selectedAppointment.id, {
                      status: "completed",
                    })
                  }
                  className="flex items-center justify-center space-x-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-blue-700"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Complete</span>
                </button>

                <button
                  onClick={() =>
                    handleUpdateAppointment(selectedAppointment.id, {
                      status: "cancelled",
                    })
                  }
                  className="flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Cancel</span>
                </button>

                <button
                  onClick={() =>
                    handleDeleteAppointment(selectedAppointment.id)
                  }
                  className="flex items-center justify-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsCalendar;