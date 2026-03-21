import React, { useState, useEffect, useRef } from "react";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import {
  Activity,
  Plus,
  Search,
  X,
  Trash2,
  AlertCircle,
  User,
  Calendar,
  Heart,
  Thermometer,
  Wind,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
  ChevronUp,
  BarChart2,
} from "lucide-react";

const NORMAL_RANGES = {
  systolic: { min: 90, max: 120, warn: 140 },
  diastolic: { min: 60, max: 80, warn: 90 },
  heartRate: { min: 60, max: 100, warn: 110 },
  temperature: { min: 36.1, max: 37.2, warn: 38 },
  oxygenSat: { min: 95, max: 100, warn: 93 },
  weight: { min: 0, max: 9999, warn: 9999 },
};

const statusFor = (key, value) => {
  if (!value || isNaN(Number(value))) return "normal";
  const v = Number(value);
  const r = NORMAL_RANGES[key];
  if (!r) return "normal";
  if (key === "oxygenSat") {
    if (v < r.warn) return "critical";
    if (v < r.min) return "warning";
    return "normal";
  }
  if (v > r.warn || v < r.min) return "critical";
  if (v > r.max) return "warning";
  return "normal";
};

const STATUS_STYLE = {
  normal: {
    dot: "bg-[#22c55e]",
    text: "text-[#166534]",
    ring: "ring-[#bbf7d0]",
  },
  warning: {
    dot: "bg-[#f59e0b]",
    text: "text-[#92400e]",
    ring: "ring-[#fde68a]",
  },
  critical: {
    dot: "bg-[#ef4444]",
    text: "text-[#991b1b]",
    ring: "ring-[#fecaca]",
  },
};

const EMPTY_FORM = {
  patientName: "",
  patientId: "",
  recordedDate: new Date().toISOString().split("T")[0],
  recordedTime: new Date().toTimeString().slice(0, 5),
  bloodPressure: "",
  heartRate: "",
  temperature: "",
  oxygenSat: "",
  weight: "",
  height: "",
  bmi: "",
  respiratoryRate: "",
  notes: "",
};

// Tiny sparkline drawn on a canvas
function Sparkline({ values, width = 80, height = 28, color = "#0e7490" }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || values.length < 2) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width,
      H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    const nums = values.map(Number).filter((n) => !isNaN(n));
    if (nums.length < 2) return;
    const min = Math.min(...nums),
      max = Math.max(...nums);
    const range = max - min || 1;
    const pad = 3;
    const xStep = (W - pad * 2) / (nums.length - 1);
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.lineJoin = "round";
    nums.forEach((v, i) => {
      const x = pad + i * xStep;
      const y = H - pad - ((v - min) / range) * (H - pad * 2);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();
    // Endpoint dot
    const lx = pad + (nums.length - 1) * xStep;
    const ly =
      H - pad - ((nums[nums.length - 1] - min) / range) * (H - pad * 2);
    ctx.beginPath();
    ctx.arc(lx, ly, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }, [values, color]);
  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ display: "block" }}
    />
  );
}

export default function PatientVitals({ user }) {
  const [vitals, setVitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [groupBy, setGroupBy] = useState("patient"); // "patient" | "date"

  const db = getFirestore();

  useEffect(() => {
    if (user?.uid) fetchVitals();
  }, [user]);

  const fetchVitals = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "users", user.uid, "patientVitals"),
        orderBy("createdAt", "desc"),
      );
      const snap = await getDocs(q);
      setVitals(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Auto-calculate BMI
  const handleFormChange = (key, value) => {
    const updated = { ...form, [key]: value };
    if (
      (key === "weight" || key === "height") &&
      updated.weight &&
      updated.height
    ) {
      const w = Number(updated.weight);
      const h = Number(updated.height) / 100;
      if (w > 0 && h > 0) updated.bmi = (w / (h * h)).toFixed(1);
    }
    setForm(updated);
  };

  const handleSave = async () => {
    if (!form.patientName) return;
    setSaving(true);
    try {
      await addDoc(collection(db, "users", user.uid, "patientVitals"), {
        ...form,
        createdAt: serverTimestamp(),
      });
      setShowModal(false);
      setForm(EMPTY_FORM);
      fetchVitals();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "users", user.uid, "patientVitals", id));
      setDeleteConfirm(null);
      fetchVitals();
    } catch (e) {
      console.error(e);
    }
  };

  // Parse BP into systolic/diastolic
  const parseBP = (bp) => {
    if (!bp) return { systolic: null, diastolic: null };
    const parts = bp.split("/");
    return { systolic: parts[0]?.trim(), diastolic: parts[1]?.trim() };
  };

  const vitalStatus = (v) => {
    const { systolic, diastolic } = parseBP(v.bloodPressure);
    const checks = [
      statusFor("systolic", systolic),
      statusFor("diastolic", diastolic),
      statusFor("heartRate", v.heartRate),
      statusFor("temperature", v.temperature),
      statusFor("oxygenSat", v.oxygenSat),
    ];
    if (checks.includes("critical")) return "critical";
    if (checks.includes("warning")) return "warning";
    return "normal";
  };

  const filtered = vitals.filter(
    (v) =>
      v.patientName?.toLowerCase().includes(search.toLowerCase()) ||
      v.patientId?.toLowerCase().includes(search.toLowerCase()),
  );

  // Group by patient for history view
  const patientGroups = filtered.reduce((acc, v) => {
    const key = v.patientId || v.patientName;
    if (!acc[key])
      acc[key] = { name: v.patientName, id: v.patientId, records: [] };
    acc[key].records.push(v);
    return acc;
  }, {});

  const stats = {
    readings: vitals.length,
    patients: Object.keys(patientGroups).length,
    alerts: vitals.filter((v) => vitalStatus(v) !== "normal").length,
  };

  const inputCls =
    "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-lg bg-white text-[#1e293b] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#0e7490] focus:border-[#0e7490] transition-colors";
  const labelCls =
    "block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#0f172a] flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#0e7490]" /> Patient Vitals
          </h1>
          <p className="text-sm text-[#64748b] mt-0.5">
            Monitor and track patient vital signs over time
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#0e7490] hover:bg-[#0c6578] text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Record Vitals
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Total Readings",
            value: stats.readings,
            icon: BarChart2,
            color: "text-[#0e7490]",
            bg: "bg-[#e0f2fe]",
          },
          {
            label: "Patients",
            value: stats.patients,
            icon: User,
            color: "text-[#7c3aed]",
            bg: "bg-[#f3e8ff]",
          },
          {
            label: "Alerts",
            value: stats.alerts,
            icon: AlertCircle,
            color: stats.alerts > 0 ? "text-[#ef4444]" : "text-[#94a3b8]",
            bg: stats.alerts > 0 ? "bg-[#fef2f2]" : "bg-[#f1f5f9]",
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

      {/* Search + view toggle */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by patient name or ID..."
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-[#e2e8f0] rounded-xl bg-white text-[#1e293b] placeholder-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#0e7490] transition-colors"
          />
        </div>
        <div className="flex gap-2">
          {["patient", "date"].map((g) => (
            <button
              key={g}
              onClick={() => setGroupBy(g)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${groupBy === g ? "bg-[#0e7490] text-white" : "bg-white border border-[#e2e8f0] text-[#64748b] hover:bg-[#f8fafc]"}`}
            >
              Group by {g.charAt(0).toUpperCase() + g.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-[#0e7490] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-[#e2e8f0] rounded-xl flex flex-col items-center justify-center py-16 gap-3">
          <Activity className="w-10 h-10 text-[#cbd5e1]" />
          <p className="text-sm text-[#94a3b8]">No vitals recorded yet</p>
          <button
            onClick={() => setShowModal(true)}
            className="text-sm text-[#0e7490] font-medium hover:underline"
          >
            Record the first reading
          </button>
        </div>
      ) : groupBy === "patient" ? (
        /* ── Grouped by patient ── */
        <div className="space-y-4">
          {Object.entries(patientGroups).map(([key, group]) => {
            const latest = group.records[0];
            const isExp = expanded[key];
            const overall = vitalStatus(latest);
            const ss = STATUS_STYLE[overall];
            const hrHistory = group.records
              .map((r) => r.heartRate)
              .filter(Boolean)
              .reverse();
            const bpHistory = group.records
              .map((r) => parseBP(r.bloodPressure).systolic)
              .filter(Boolean)
              .reverse();

            return (
              <div
                key={key}
                className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden"
              >
                {/* Patient header */}
                <div
                  className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-[#f8fafc] transition-colors"
                  onClick={() => setExpanded((e) => ({ ...e, [key]: !e[key] }))}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-full bg-[#e0f2fe] flex items-center justify-center ring-2 ${ss.ring}`}
                    >
                      <User className="w-4 h-4 text-[#0e7490]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#1e293b]">
                          {group.name}
                        </span>
                        <span
                          className={`flex items-center gap-1 text-xs font-semibold ${ss.text}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${ss.dot}`}
                          />
                          {overall.charAt(0).toUpperCase() + overall.slice(1)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        {group.id && (
                          <span className="text-xs text-[#94a3b8]">
                            {group.id}
                          </span>
                        )}
                        <span className="text-xs text-[#94a3b8]">
                          · {group.records.length} reading
                          {group.records.length !== 1 ? "s" : ""}
                        </span>
                        {latest.recordedDate && (
                          <span className="text-xs text-[#94a3b8]">
                            · Last: {latest.recordedDate}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Latest vitals summary + sparklines */}
                  <div className="hidden sm:flex items-center gap-6 mr-4">
                    {latest.bloodPressure && (
                      <div className="text-center">
                        <div className="text-xs text-[#94a3b8] mb-1">BP</div>
                        <div className="text-sm font-bold text-[#1e293b]">
                          {latest.bloodPressure}
                        </div>
                        <Sparkline values={bpHistory} color="#ef4444" />
                      </div>
                    )}
                    {latest.heartRate && (
                      <div className="text-center">
                        <div className="text-xs text-[#94a3b8] mb-1">HR</div>
                        <div className="text-sm font-bold text-[#1e293b]">
                          {latest.heartRate}{" "}
                          <span className="text-xs font-normal text-[#94a3b8]">
                            bpm
                          </span>
                        </div>
                        <Sparkline values={hrHistory} color="#e11d48" />
                      </div>
                    )}
                    {latest.oxygenSat && (
                      <div className="text-center">
                        <div className="text-xs text-[#94a3b8] mb-1">SpO2</div>
                        <div className="text-sm font-bold text-[#1e293b]">
                          {latest.oxygenSat}
                          <span className="text-xs font-normal text-[#94a3b8]">
                            %
                          </span>
                        </div>
                        <Sparkline
                          values={group.records
                            .map((r) => r.oxygenSat)
                            .filter(Boolean)
                            .reverse()}
                          color="#0e7490"
                        />
                      </div>
                    )}
                  </div>

                  {isExp ? (
                    <ChevronUp className="w-4 h-4 text-[#94a3b8] flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#94a3b8] flex-shrink-0" />
                  )}
                </div>

                {/* Expanded readings */}
                {isExp && (
                  <div className="border-t border-[#e2e8f0]">
                    {group.records.map((v) => {
                      const vs = vitalStatus(v);
                      const vss = STATUS_STYLE[vs];
                      return (
                        <div
                          key={v.id}
                          className="flex items-start justify-between px-5 py-3.5 border-b border-[#f1f5f9] last:border-0 hover:bg-[#f8fafc] transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${vss.dot}`}
                            />
                            <div>
                              <div className="flex items-center gap-3 flex-wrap">
                                {v.bloodPressure && (
                                  <VitalChip
                                    label="BP"
                                    value={v.bloodPressure}
                                    unit="mmHg"
                                    status={vs}
                                  />
                                )}
                                {v.heartRate && (
                                  <VitalChip
                                    label="HR"
                                    value={v.heartRate}
                                    unit="bpm"
                                    status={statusFor("heartRate", v.heartRate)}
                                  />
                                )}
                                {v.temperature && (
                                  <VitalChip
                                    label="T°"
                                    value={v.temperature}
                                    unit="°C"
                                    status={statusFor(
                                      "temperature",
                                      v.temperature,
                                    )}
                                  />
                                )}
                                {v.oxygenSat && (
                                  <VitalChip
                                    label="SpO2"
                                    value={v.oxygenSat}
                                    unit="%"
                                    status={statusFor("oxygenSat", v.oxygenSat)}
                                  />
                                )}
                                {v.weight && (
                                  <VitalChip
                                    label="Wt"
                                    value={v.weight}
                                    unit="kg"
                                    status="normal"
                                  />
                                )}
                                {v.bmi && (
                                  <VitalChip
                                    label="BMI"
                                    value={v.bmi}
                                    unit=""
                                    status="normal"
                                  />
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                {v.recordedDate && (
                                  <span className="text-xs text-[#94a3b8]">
                                    {v.recordedDate} {v.recordedTime}
                                  </span>
                                )}
                                {v.notes && (
                                  <span className="text-xs text-[#64748b] italic truncate max-w-[200px]">
                                    · {v.notes}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => setDeleteConfirm(v.id)}
                            className="p-1.5 text-[#94a3b8] hover:text-[#ef4444] hover:bg-[#fef2f2] rounded-lg transition-all opacity-0 group-hover:opacity-100 flex-shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* ── Grouped by date (flat list) ── */
        <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                  {[
                    "Patient",
                    "Date",
                    "BP",
                    "HR",
                    "Temp",
                    "SpO2",
                    "Weight",
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
                {filtered.map((v) => {
                  const vs = vitalStatus(v);
                  const vss = STATUS_STYLE[vs];
                  return (
                    <tr
                      key={v.id}
                      className="hover:bg-[#f8fafc] transition-colors group"
                    >
                      <td className="px-4 py-3">
                        <div className="text-sm font-semibold text-[#1e293b]">
                          {v.patientName}
                        </div>
                        {v.patientId && (
                          <div className="text-xs text-[#94a3b8]">
                            {v.patientId}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-[#64748b] whitespace-nowrap">
                        {v.recordedDate} {v.recordedTime}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-[#1e293b]">
                        {v.bloodPressure || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#374151]">
                        {v.heartRate ? `${v.heartRate} bpm` : "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#374151]">
                        {v.temperature ? `${v.temperature}°C` : "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#374151]">
                        {v.oxygenSat ? `${v.oxygenSat}%` : "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#374151]">
                        {v.weight ? `${v.weight} kg` : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${vs === "critical" ? "bg-[#fef2f2] text-[#991b1b]" : vs === "warning" ? "bg-[#fef3c7] text-[#92400e]" : "bg-[#dcfce7] text-[#166534]"}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${vss.dot}`}
                          />
                          {vs.charAt(0).toUpperCase() + vs.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setDeleteConfirm(v.id)}
                          className="p-1.5 text-[#94a3b8] hover:text-[#ef4444] hover:bg-[#fef2f2] rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
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
              Delete Vitals Reading?
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

      {/* Record Vitals Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-[#e2e8f0]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0] bg-[#f8fafc] rounded-t-2xl">
              <h2 className="text-sm font-bold text-[#1e293b]">
                Record Patient Vitals
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
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Patient Name *</label>
                    <input
                      className={inputCls}
                      value={form.patientName}
                      onChange={(e) =>
                        handleFormChange("patientName", e.target.value)
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
                        handleFormChange("patientId", e.target.value)
                      }
                      placeholder="PAT-2026-XXXX"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Date</label>
                    <input
                      className={inputCls}
                      type="date"
                      value={form.recordedDate}
                      onChange={(e) =>
                        handleFormChange("recordedDate", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Time</label>
                    <input
                      className={inputCls}
                      type="time"
                      value={form.recordedTime}
                      onChange={(e) =>
                        handleFormChange("recordedTime", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Vitals */}
              <div>
                <SectionDivider icon={Activity} label="Vital Signs" />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div>
                    <label className={labelCls}>Blood Pressure</label>
                    <input
                      className={inputCls}
                      value={form.bloodPressure}
                      onChange={(e) =>
                        handleFormChange("bloodPressure", e.target.value)
                      }
                      placeholder="120/80 mmHg"
                    />
                    <NormalRange text="Normal: 90–120 / 60–80" />
                  </div>
                  <div>
                    <label className={labelCls}>Heart Rate</label>
                    <input
                      className={inputCls}
                      type="number"
                      value={form.heartRate}
                      onChange={(e) =>
                        handleFormChange("heartRate", e.target.value)
                      }
                      placeholder="72 bpm"
                    />
                    <NormalRange text="Normal: 60–100 bpm" />
                  </div>
                  <div>
                    <label className={labelCls}>Temperature</label>
                    <input
                      className={inputCls}
                      type="number"
                      step="0.1"
                      value={form.temperature}
                      onChange={(e) =>
                        handleFormChange("temperature", e.target.value)
                      }
                      placeholder="36.5 °C"
                    />
                    <NormalRange text="Normal: 36.1–37.2 °C" />
                  </div>
                  <div>
                    <label className={labelCls}>Oxygen Saturation</label>
                    <input
                      className={inputCls}
                      type="number"
                      value={form.oxygenSat}
                      onChange={(e) =>
                        handleFormChange("oxygenSat", e.target.value)
                      }
                      placeholder="98 %"
                    />
                    <NormalRange text="Normal: ≥95%" />
                  </div>
                  <div>
                    <label className={labelCls}>Respiratory Rate</label>
                    <input
                      className={inputCls}
                      type="number"
                      value={form.respiratoryRate}
                      onChange={(e) =>
                        handleFormChange("respiratoryRate", e.target.value)
                      }
                      placeholder="16 /min"
                    />
                    <NormalRange text="Normal: 12–20 /min" />
                  </div>
                  <div className="sm:col-span-1" />
                </div>
              </div>

              {/* Anthropometrics */}
              <div>
                <SectionDivider icon={User} label="Anthropometrics" />
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className={labelCls}>Weight (kg)</label>
                    <input
                      className={inputCls}
                      type="number"
                      step="0.1"
                      value={form.weight}
                      onChange={(e) =>
                        handleFormChange("weight", e.target.value)
                      }
                      placeholder="70"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Height (cm)</label>
                    <input
                      className={inputCls}
                      type="number"
                      value={form.height}
                      onChange={(e) =>
                        handleFormChange("height", e.target.value)
                      }
                      placeholder="175"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>BMI (auto)</label>
                    <input
                      className={`${inputCls} bg-[#f8fafc]`}
                      value={form.bmi}
                      readOnly
                      placeholder="—"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className={labelCls}>Notes</label>
                <textarea
                  className={`${inputCls} resize-none`}
                  rows={2}
                  value={form.notes}
                  onChange={(e) => handleFormChange("notes", e.target.value)}
                  placeholder="Additional observations..."
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
                disabled={saving || !form.patientName}
                className="flex-1 px-4 py-2.5 bg-[#0e7490] hover:bg-[#0c6578] disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                {saving ? "Saving..." : "Save Vitals"}
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

function NormalRange({ text }) {
  return <p className="text-[10px] text-[#94a3b8] mt-1">{text}</p>;
}

function VitalChip({ label, value, unit, status }) {
  const colors = {
    normal: "bg-[#f1f5f9] text-[#374151]",
    warning: "bg-[#fef3c7] text-[#92400e]",
    critical: "bg-[#fef2f2] text-[#991b1b]",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold ${colors[status] || colors.normal}`}
    >
      <span className="text-[#94a3b8] font-normal">{label}</span> {value}
      {unit}
    </span>
  );
}
