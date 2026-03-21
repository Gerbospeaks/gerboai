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
  Stethoscope,
  Plus,
  Search,
  X,
  Edit2,
  Trash2,
  AlertCircle,
  User,
  Calendar,
  FileText,
  Heart,
  Thermometer,
  Activity,
  Eye,
  ChevronDown,
  ChevronUp,
  Tag,
  Paperclip,
} from "lucide-react";

const RECORD_TYPES = [
  {
    value: "consultation",
    label: "Consultation",
    color: "bg-[#dbeafe] text-[#1e40af]",
  },
  {
    value: "lab_result",
    label: "Lab Result",
    color: "bg-[#dcfce7] text-[#166534]",
  },
  { value: "imaging", label: "Imaging", color: "bg-[#f3e8ff] text-[#6b21a8]" },
  {
    value: "procedure",
    label: "Procedure",
    color: "bg-[#fef3c7] text-[#92400e]",
  },
  {
    value: "vaccination",
    label: "Vaccination",
    color: "bg-[#e0f2fe] text-[#075985]",
  },
  {
    value: "referral",
    label: "Referral",
    color: "bg-[#fce7f3] text-[#9d174d]",
  },
  {
    value: "discharge",
    label: "Discharge",
    color: "bg-[#f1f5f9] text-[#475569]",
  },
  { value: "other", label: "Other", color: "bg-[#f8fafc] text-[#64748b]" },
];

const EMPTY_FORM = {
  patientName: "",
  patientId: "",
  recordType: "consultation",
  visitDate: new Date().toISOString().split("T")[0],
  chiefComplaint: "",
  diagnosis: "",
  findings: "",
  treatment: "",
  followUp: "",
  attendingDoctor: "",
  bloodPressure: "",
  heartRate: "",
  temperature: "",
  weight: "",
  height: "",
  oxygenSat: "",
  notes: "",
  confidential: false,
};

export default function MedicalRecords({ user }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [viewModal, setViewModal] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showVitals, setShowVitals] = useState(true);

  const db = getFirestore();

  useEffect(() => {
    if (user?.uid) fetchRecords();
  }, [user]);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "users", user.uid, "medicalRecords"),
        orderBy("createdAt", "desc"),
      );
      const snap = await getDocs(q);
      setRecords(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
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
    setForm({ ...EMPTY_FORM, ...r });
    setEditingId(r.id);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.patientName) return;
    setSaving(true);
    try {
      const payload = { ...form, updatedAt: serverTimestamp() };
      if (editingId) {
        await updateDoc(
          doc(db, "users", user.uid, "medicalRecords", editingId),
          payload,
        );
      } else {
        await addDoc(collection(db, "users", user.uid, "medicalRecords"), {
          ...payload,
          createdAt: serverTimestamp(),
        });
      }
      setShowModal(false);
      fetchRecords();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "users", user.uid, "medicalRecords", id));
      setDeleteConfirm(null);
      fetchRecords();
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = records.filter((r) => {
    const m =
      r.patientName?.toLowerCase().includes(search.toLowerCase()) ||
      r.diagnosis?.toLowerCase().includes(search.toLowerCase()) ||
      r.patientId?.toLowerCase().includes(search.toLowerCase());
    return m && (typeFilter === "all" || r.recordType === typeFilter);
  });

  const typeConfig = (val) =>
    RECORD_TYPES.find((t) => t.value === val) ||
    RECORD_TYPES[RECORD_TYPES.length - 1];

  const inputCls =
    "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-lg bg-white text-[#1e293b] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#0e7490] focus:border-[#0e7490] transition-colors";
  const labelCls =
    "block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5";

  const stats = {
    total: records.length,
    thisMonth: records.filter((r) => {
      if (!r.visitDate) return false;
      const d = new Date(r.visitDate);
      const now = new Date();
      return (
        d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      );
    }).length,
    types: [...new Set(records.map((r) => r.patientId))].length,
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#0f172a] flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-[#0e7490]" /> Medical Records
          </h1>
          <p className="text-sm text-[#64748b] mt-0.5">
            Patient visit history and clinical notes
          </p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 bg-[#0e7490] hover:bg-[#0c6578] text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> New Record
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Total Records",
            value: stats.total,
            icon: FileText,
            color: "text-[#0e7490]",
            bg: "bg-[#e0f2fe]",
          },
          {
            label: "This Month",
            value: stats.thisMonth,
            icon: Calendar,
            color: "text-[#7c3aed]",
            bg: "bg-[#f3e8ff]",
          },
          {
            label: "Unique Patients",
            value: stats.types,
            icon: User,
            color: "text-[#059669]",
            bg: "bg-[#dcfce7]",
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
            placeholder="Search patient, diagnosis, ID..."
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-[#e2e8f0] rounded-xl bg-white text-[#1e293b] placeholder-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#0e7490] transition-colors"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setTypeFilter("all")}
            className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${typeFilter === "all" ? "bg-[#0e7490] text-white" : "bg-white border border-[#e2e8f0] text-[#64748b] hover:bg-[#f8fafc]"}`}
          >
            All
          </button>
          {RECORD_TYPES.slice(0, 5).map((t) => (
            <button
              key={t.value}
              onClick={() => setTypeFilter(t.value)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${typeFilter === t.value ? "bg-[#0e7490] text-white" : "bg-white border border-[#e2e8f0] text-[#64748b] hover:bg-[#f8fafc]"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-[#0e7490] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Stethoscope className="w-10 h-10 text-[#cbd5e1]" />
            <p className="text-sm text-[#94a3b8]">No records found</p>
            <button
              onClick={openNew}
              className="text-sm text-[#0e7490] font-medium hover:underline"
            >
              Create the first record
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                  {[
                    "Patient",
                    "Type",
                    "Visit Date",
                    "Diagnosis",
                    "Doctor",
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
                  const tc = typeConfig(r.recordType);
                  return (
                    <tr
                      key={r.id}
                      className="hover:bg-[#f8fafc] transition-colors group"
                    >
                      <td className="px-4 py-3">
                        <div className="text-sm font-semibold text-[#1e293b]">
                          {r.patientName}
                        </div>
                        {r.patientId && (
                          <div className="text-xs text-[#94a3b8]">
                            {r.patientId}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${tc.color}`}
                        >
                          {tc.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-[#64748b] whitespace-nowrap">
                        {r.visitDate || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-[#374151] max-w-[200px] truncate">
                          {r.diagnosis || r.chiefComplaint || "—"}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-[#64748b]">
                        {r.attendingDoctor || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setViewModal(r)}
                            className="p-1.5 text-[#64748b] hover:text-[#0e7490] hover:bg-[#e0f2fe] rounded-lg transition-all"
                            title="View"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openEdit(r)}
                            className="p-1.5 text-[#64748b] hover:text-[#0e7490] hover:bg-[#e0f2fe] rounded-lg transition-all"
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
        )}
      </div>

      {/* View Record Modal */}
      {viewModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-[#e2e8f0]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0] bg-[#f8fafc] rounded-t-2xl">
              <div>
                <h2 className="text-sm font-bold text-[#1e293b]">
                  {viewModal.patientName}
                </h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-md font-semibold ${typeConfig(viewModal.recordType).color}`}
                  >
                    {typeConfig(viewModal.recordType).label}
                  </span>
                  {viewModal.visitDate && (
                    <span className="text-xs text-[#64748b]">
                      {viewModal.visitDate}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setViewModal(null)}
                className="p-1.5 text-[#64748b] hover:text-[#1e293b] hover:bg-[#e2e8f0] rounded-lg transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Vitals */}
              {(viewModal.bloodPressure ||
                viewModal.heartRate ||
                viewModal.temperature ||
                viewModal.oxygenSat) && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    {
                      label: "BP",
                      value: viewModal.bloodPressure,
                      unit: "mmHg",
                      icon: Activity,
                      color: "text-[#dc2626]",
                    },
                    {
                      label: "HR",
                      value: viewModal.heartRate,
                      unit: "bpm",
                      icon: Heart,
                      color: "text-[#e11d48]",
                    },
                    {
                      label: "Temp",
                      value: viewModal.temperature,
                      unit: "°C",
                      icon: Thermometer,
                      color: "text-[#d97706]",
                    },
                    {
                      label: "SpO2",
                      value: viewModal.oxygenSat,
                      unit: "%",
                      icon: Activity,
                      color: "text-[#0e7490]",
                    },
                  ]
                    .filter((v) => v.value)
                    .map(({ label, value, unit, icon: Icon, color }) => (
                      <div
                        key={label}
                        className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-3 text-center"
                      >
                        <Icon className={`w-4 h-4 ${color} mx-auto mb-1`} />
                        <div className="text-xs text-[#64748b] font-semibold">
                          {label}
                        </div>
                        <div className="text-sm font-bold text-[#1e293b]">
                          {value}{" "}
                          <span className="text-xs font-normal text-[#94a3b8]">
                            {unit}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
              {[
                { label: "Chief Complaint", value: viewModal.chiefComplaint },
                { label: "Diagnosis", value: viewModal.diagnosis },
                { label: "Findings", value: viewModal.findings },
                { label: "Treatment", value: viewModal.treatment },
                { label: "Follow-up", value: viewModal.followUp },
                { label: "Notes", value: viewModal.notes },
              ]
                .filter((f) => f.value)
                .map(({ label, value }) => (
                  <div key={label}>
                    <div className="text-xs font-bold text-[#94a3b8] uppercase tracking-widest mb-1">
                      {label}
                    </div>
                    <p className="text-sm text-[#374151] bg-[#f8fafc] rounded-lg px-3 py-2 border border-[#e2e8f0]">
                      {value}
                    </p>
                  </div>
                ))}
            </div>
            <div className="px-6 py-4 border-t border-[#e2e8f0] bg-[#f8fafc] rounded-b-2xl flex justify-end gap-2">
              <button
                onClick={() => {
                  setViewModal(null);
                  openEdit(viewModal);
                }}
                className="flex items-center gap-1.5 px-4 py-2 border border-[#e2e8f0] text-[#374151] text-sm font-medium rounded-xl hover:bg-white transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit
              </button>
              <button
                onClick={() => setViewModal(null)}
                className="px-4 py-2 bg-[#0e7490] text-white text-sm font-semibold rounded-xl hover:bg-[#0c6578] transition-colors"
              >
                Close
              </button>
            </div>
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
              Delete Record?
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
                {editingId ? "Edit Record" : "New Medical Record"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-[#64748b] hover:text-[#1e293b] hover:bg-[#e2e8f0] rounded-lg transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Patient */}
              <div>
                <SectionDivider icon={User} label="Patient" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Patient Name *</label>
                    <input
                      className={inputCls}
                      value={form.patientName}
                      onChange={(e) =>
                        setForm({ ...form, patientName: e.target.value })
                      }
                      placeholder="Full name"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Patient ID</label>
                    <input
                      className={inputCls}
                      value={form.patientId}
                      onChange={(e) =>
                        setForm({ ...form, patientId: e.target.value })
                      }
                      placeholder="PAT-2026-XXXX"
                    />
                  </div>
                </div>
              </div>
              {/* Visit */}
              <div>
                <SectionDivider icon={Calendar} label="Visit Details" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Record Type</label>
                    <select
                      className={inputCls}
                      value={form.recordType}
                      onChange={(e) =>
                        setForm({ ...form, recordType: e.target.value })
                      }
                    >
                      {RECORD_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Visit Date</label>
                    <input
                      className={inputCls}
                      type="date"
                      value={form.visitDate}
                      onChange={(e) =>
                        setForm({ ...form, visitDate: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Attending Doctor</label>
                    <input
                      className={inputCls}
                      value={form.attendingDoctor}
                      onChange={(e) =>
                        setForm({ ...form, attendingDoctor: e.target.value })
                      }
                      placeholder="Dr. name"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Chief Complaint</label>
                    <input
                      className={inputCls}
                      value={form.chiefComplaint}
                      onChange={(e) =>
                        setForm({ ...form, chiefComplaint: e.target.value })
                      }
                      placeholder="Presenting symptom"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Diagnosis</label>
                    <input
                      className={inputCls}
                      value={form.diagnosis}
                      onChange={(e) =>
                        setForm({ ...form, diagnosis: e.target.value })
                      }
                      placeholder="Primary diagnosis"
                    />
                  </div>
                </div>
              </div>
              {/* Vitals */}
              <div>
                <SectionDivider icon={Activity} label="Vitals" />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {[
                    {
                      key: "bloodPressure",
                      label: "Blood Pressure",
                      placeholder: "e.g. 120/80",
                    },
                    {
                      key: "heartRate",
                      label: "Heart Rate (bpm)",
                      placeholder: "e.g. 72",
                    },
                    {
                      key: "temperature",
                      label: "Temperature (°C)",
                      placeholder: "e.g. 36.5",
                    },
                    {
                      key: "weight",
                      label: "Weight (kg)",
                      placeholder: "e.g. 70",
                    },
                    {
                      key: "height",
                      label: "Height (cm)",
                      placeholder: "e.g. 175",
                    },
                    {
                      key: "oxygenSat",
                      label: "SpO2 (%)",
                      placeholder: "e.g. 98",
                    },
                  ].map(({ key, label, placeholder }) => (
                    <div key={key}>
                      <label className={labelCls}>{label}</label>
                      <input
                        className={inputCls}
                        value={form[key]}
                        onChange={(e) =>
                          setForm({ ...form, [key]: e.target.value })
                        }
                        placeholder={placeholder}
                      />
                    </div>
                  ))}
                </div>
              </div>
              {/* Clinical */}
              <div>
                <SectionDivider icon={FileText} label="Clinical Notes" />
                <div className="space-y-4">
                  {[
                    {
                      key: "findings",
                      label: "Examination Findings",
                      placeholder: "Physical exam findings...",
                    },
                    {
                      key: "treatment",
                      label: "Treatment Given",
                      placeholder: "Interventions, medications administered...",
                    },
                    {
                      key: "followUp",
                      label: "Follow-up Plan",
                      placeholder: "Next appointment, instructions...",
                    },
                    {
                      key: "notes",
                      label: "Additional Notes",
                      placeholder: "Any other relevant information...",
                    },
                  ].map(({ key, label, placeholder }) => (
                    <div key={key}>
                      <label className={labelCls}>{label}</label>
                      <textarea
                        className={`${inputCls} resize-none`}
                        rows={2}
                        value={form[key]}
                        onChange={(e) =>
                          setForm({ ...form, [key]: e.target.value })
                        }
                        placeholder={placeholder}
                      />
                    </div>
                  ))}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="conf"
                      checked={form.confidential}
                      onChange={(e) =>
                        setForm({ ...form, confidential: e.target.checked })
                      }
                      className="w-4 h-4 accent-[#0e7490]"
                    />
                    <label
                      htmlFor="conf"
                      className="text-sm text-[#374151] cursor-pointer"
                    >
                      Mark as confidential
                    </label>
                  </div>
                </div>
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
                disabled={saving || !form.patientName}
                className="flex-1 px-4 py-2.5 bg-[#0e7490] hover:bg-[#0c6578] disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update Record"
                    : "Save Record"}
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
    <div className="flex items-center gap-2 text-xs font-bold text-[#0e7490] uppercase tracking-widest mb-3 pb-2 border-b border-[#e2e8f0]">
      <Icon className="w-3.5 h-3.5" /> {label}
    </div>
  );
}
