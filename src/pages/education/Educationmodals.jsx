import React, { useState } from "react";
import {
  X,
  Save,
  Plus,
  Trash2,
  Megaphone,
  BookMarked,
  UserCheck,
  Calendar,
  Users,
  GraduationCap,
  Clock,
  AlertCircle,
  Info,
  DollarSign,
  CheckSquare,
  Phone,
  Mail,
  MapPin,
  Paperclip,
  KeyRound,
} from "lucide-react";

// ─── Shared styles ────────────────────────────────────────────────────────────
const MODAL_OVERLAY =
  "fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4";
const MODAL_BOX =
  "bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto";
const HEADER =
  "flex items-center justify-between p-6 border-b border-slate-100";
const BODY = "p-6 space-y-4";
const FOOTER = "flex justify-end gap-3 px-6 pb-6";
const LABEL =
  "block text-xs font-700 text-slate-500 mb-1.5 uppercase tracking-wide";
const INPUT =
  "w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition";
const SELECT = INPUT;
const BTN_PRIMARY =
  "flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-600 hover:bg-indigo-700 transition";
const BTN_GHOST =
  "flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-500 hover:bg-slate-50 transition";
const ICON_WRAP = (color) =>
  `w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`;

function ModalHeader({ icon: Icon, iconBg, title, subtitle, onClose }) {
  return (
    <div className={HEADER}>
      <div className="flex items-center gap-3">
        <div className={ICON_WRAP(iconBg)}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="text-base font-700 text-slate-900">{title}</div>
          {subtitle && (
            <div className="text-xs text-slate-400 mt-0.5">{subtitle}</div>
          )}
        </div>
      </div>
      <button
        onClick={onClose}
        className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function NoticeModal({ open, onClose, onSave }) {
  const EMPTY = {
    title: "",
    message: "",
    recipient: "All Parents",
    type: "info",
  };
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!form.title || !form.message) return;
    setSaving(true);
    await onSave(form);
    setForm(EMPTY);
    setSaving(false);
    onClose();
  };

  const typeOptions = [
    { value: "info", label: "Info", icon: Info },
    { value: "important", label: "Important", icon: AlertCircle },
    { value: "action", label: "Action Required", icon: CheckSquare },
    { value: "fee", label: "Fee Notice", icon: DollarSign },
  ];

  return (
    <div className={MODAL_OVERLAY} onClick={onClose}>
      <div className={MODAL_BOX} onClick={(e) => e.stopPropagation()}>
        <ModalHeader
          icon={Megaphone}
          iconBg="bg-amber-500"
          title="New Parent Notice"
          subtitle="Send a message to parents"
          onClose={onClose}
        />
        <div className={BODY}>
          {/* Type selector */}
          <div>
            <label className={LABEL}>Notice Type</label>
            <div className="grid grid-cols-2 gap-2">
              {typeOptions.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => set("type", value)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-500 transition ${
                    form.type === value
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Recipient */}
          <div>
            <label className={LABEL}>Send To</label>
            <select
              className={SELECT}
              value={form.recipient}
              onChange={(e) => set("recipient", e.target.value)}
            >
              {[
                "All Parents",
                "Pre-School Parents",
                "Grade 1 Parents",
                "Grade 2 Parents",
                "Grade 3 Parents",
                "Selected Parents",
              ].map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className={LABEL}>Subject / Title *</label>
            <input
              className={INPUT}
              placeholder="e.g. School closed on Friday"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
            />
          </div>

          {/* Message */}
          <div>
            <label className={LABEL}>Message *</label>
            <textarea
              className={INPUT}
              rows={4}
              placeholder="Type your message to parents..."
              value={form.message}
              onChange={(e) => set("message", e.target.value)}
              style={{ resize: "vertical" }}
            />
          </div>
        </div>

        <div className={FOOTER}>
          <button className={BTN_GHOST} onClick={onClose}>
            Cancel
          </button>
          <button
            className={BTN_PRIMARY}
            onClick={handleSave}
            disabled={saving}
          >
            <Megaphone className="w-4 h-4" />
            {saving ? "Sending…" : "Send Notice"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function HomeworkModal({ open, onClose, onSave }) {
  const EMPTY = {
    subject: "",
    grade: "Grade 1",
    title: "",
    dueDate: "",
    priority: "medium",
    attachmentUrl: "",
    attachmentName: "",
  };
  const [form, setForm] = useState(EMPTY);
  const [urlError, setUrlError] = useState("");
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const isValidUrl = (str) => {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  };

  const handleSave = async () => {
    if (!form.title || !form.subject) return;

    if (form.attachmentUrl && !isValidUrl(form.attachmentUrl)) {
      setUrlError("Please enter a valid URL (e.g. https://...)");
      return;
    }

    setSaving(true);

    // Strip empty attachment fields before saving
    const payload = { ...form };
    if (!payload.attachmentUrl) {
      delete payload.attachmentUrl;
      delete payload.attachmentName;
    }

    await onSave(payload);
    setForm(EMPTY);
    setUrlError("");
    setSaving(false);
    onClose();
  };

  const priorities = [
    {
      value: "low",
      label: "Low",
      color: "bg-emerald-50 border-emerald-300 text-emerald-700",
    },
    {
      value: "medium",
      label: "Medium",
      color: "bg-amber-50 border-amber-300 text-amber-700",
    },
    {
      value: "high",
      label: "Urgent",
      color: "bg-red-50 border-red-300 text-red-700",
    },
  ];

  return (
    <div className={MODAL_OVERLAY} onClick={onClose}>
      <div className={MODAL_BOX} onClick={(e) => e.stopPropagation()}>
        <ModalHeader
          icon={BookMarked}
          iconBg="bg-violet-500"
          title="New Homework Task"
          subtitle="Assign work to a class"
          onClose={onClose}
        />

        <div className={BODY}>
          {/* Subject + Grade */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL}>Subject *</label>
              <input
                className={INPUT}
                placeholder="e.g. Maths"
                value={form.subject}
                onChange={(e) => set("subject", e.target.value)}
              />
            </div>
            <div>
              <label className={LABEL}>Grade *</label>
              <select
                className={SELECT}
                value={form.grade}
                onChange={(e) => set("grade", e.target.value)}
              >
                {[
                  "Grade R",
                  "Grade 0",
                  "Grade 1",
                  "Grade 2",
                  "Grade 3",
                ].map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Task description */}
          <div>
            <label className={LABEL}>Task Description *</label>
            <input
              className={INPUT}
              placeholder="e.g. Complete worksheet pages 14–15"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
            />
          </div>

          {/* Due date */}
          <div>
            <label className={LABEL}>Due Date</label>
            <input
              type="date"
              className={INPUT}
              value={form.dueDate}
              onChange={(e) => set("dueDate", e.target.value)}
            />
          </div>

          {/* Priority */}
          <div>
            <label className={LABEL}>Priority</label>
            <div className="flex gap-2">
              {priorities.map(({ value, label, color }) => (
                <button
                  key={value}
                  onClick={() => set("priority", value)}
                  className={`flex-1 py-2 rounded-xl border text-sm font-600 transition ${
                    form.priority === value
                      ? color
                      : "border-slate-200 text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* ── PDF attachment ─────────────────────────────────────────── */}
          <div className="pt-1">
            {/* Divider */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 14,
              }}
            >
              <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#94a3b8",
                  whiteSpace: "nowrap",
                  letterSpacing: ".04em",
                }}
              >
                ATTACH DOCUMENT
              </span>
              <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
            </div>

            {/* URL input */}
            <div className="space-y-3">
              <div>
                <label className={LABEL}>
                  PDF / Document URL
                  <span
                    style={{ fontWeight: 400, color: "#94a3b8", marginLeft: 4 }}
                  >
                    (optional)
                  </span>
                </label>
                <div style={{ position: "relative" }}>
                  <Paperclip
                    style={{
                      position: "absolute",
                      left: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: 14,
                      height: 14,
                      color: "#94a3b8",
                    }}
                  />
                  <input
                    className={INPUT}
                    style={{
                      paddingLeft: 34,
                      borderColor: urlError ? "#ef4444" : undefined,
                    }}
                    placeholder="https://drive.google.com/file/... or any public link"
                    value={form.attachmentUrl}
                    onChange={(e) => {
                      set("attachmentUrl", e.target.value);
                      setUrlError("");
                    }}
                  />
                </div>
                {urlError ? (
                  <p
                    style={{
                      fontSize: 11,
                      color: "#ef4444",
                      marginTop: 4,
                      fontWeight: 500,
                    }}
                  >
                    {urlError}
                  </p>
                ) : (
                  <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
                    Google Drive, Dropbox, OneDrive or a direct PDF link. Make
                    sure it's set to public.
                  </p>
                )}
              </div>

              {/* File label — only shown when URL is filled */}
              {form.attachmentUrl && (
                <div>
                  <label className={LABEL}>
                    File Label
                    <span
                      style={{
                        fontWeight: 400,
                        color: "#94a3b8",
                        marginLeft: 4,
                      }}
                    >
                      (optional)
                    </span>
                  </label>
                  <input
                    className={INPUT}
                    placeholder='e.g. "Maths Worksheet – Chapter 4"'
                    value={form.attachmentName}
                    onChange={(e) => set("attachmentName", e.target.value)}
                  />
                  <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
                    This is the label parents see on the View &amp; Download
                    buttons.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={FOOTER}>
          <button className={BTN_GHOST} onClick={onClose}>
            Cancel
          </button>
          <button
            className={BTN_PRIMARY}
            onClick={handleSave}
            disabled={saving}
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving…" : "Save Task"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function AttendanceModal({
  open,
  onClose,
  students,
  attendance,
  onToggle,
  onSaveAll,
  dateStr,
}) {
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const handleSaveAll = async () => {
    setSaving(true);
    await onSaveAll(attendance);
    setSaving(false);
    onClose();
  };

  const statusStyle = {
    present: "bg-emerald-500 text-white border-emerald-500",
    absent: "bg-red-500 text-white border-red-500",
    late: "bg-amber-400 text-white border-amber-400",
  };
  const inactiveStyle =
    "bg-white text-slate-400 border-slate-200 hover:bg-slate-50";

  const presentCount = Object.values(attendance).filter(
    (v) => v === "present",
  ).length;
  const absentCount = Object.values(attendance).filter(
    (v) => v === "absent",
  ).length;
  const lateCount = Object.values(attendance).filter(
    (v) => v === "late",
  ).length;

  return (
    <div className={MODAL_OVERLAY} onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <ModalHeader
          icon={UserCheck}
          iconBg="bg-cyan-500"
          title="Attendance Register"
          subtitle={dateStr}
          onClose={onClose}
        />

        {/* Summary strip */}
        <div className="grid grid-cols-3 gap-3 px-6 pt-4">
          {[
            {
              label: "Present",
              count: presentCount,
              color: "text-emerald-600 bg-emerald-50",
            },
            {
              label: "Absent",
              count: absentCount,
              color: "text-red-600 bg-red-50",
            },
            {
              label: "Late",
              count: lateCount,
              color: "text-amber-600 bg-amber-50",
            },
          ].map((s) => (
            <div
              key={s.label}
              className={`rounded-xl p-3 text-center ${s.color}`}
            >
              <div className="text-2xl font-800">{s.count}</div>
              <div className="text-xs font-600 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Student list */}
        <div className="p-6 space-y-2">
          {students.map((s) => {
            const current = attendance[s.id] || "present";
            return (
              <div
                key={s.id}
                className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition"
              >
                {/* Avatar */}
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-700 flex-shrink-0"
                  style={{
                    background: `hsl(${s.id * 47},70%,88%)`,
                    color: `hsl(${s.id * 47},50%,35%)`,
                  }}
                >
                  {s.name
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                {/* Name */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-600 text-slate-800 truncate">
                    {s.name}
                  </div>
                  <div className="text-xs text-slate-400">{s.grade}</div>
                </div>
                {/* Toggle buttons */}
                <div className="flex gap-1.5">
                  {["present", "absent", "late"].map((st) => (
                    <button
                      key={st}
                      onClick={() => onToggle(s.id, st)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-600 transition ${
                        current === st ? statusStyle[st] : inactiveStyle
                      }`}
                    >
                      {st.charAt(0).toUpperCase() + st.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className={FOOTER}>
          <button className={BTN_GHOST} onClick={onClose}>
            Close
          </button>
          <button
            className={BTN_PRIMARY}
            onClick={handleSaveAll}
            disabled={saving}
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving…" : "Save Register"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function EventModal({ open, onClose, onSave }) {
  const EMPTY = {
    title: "",
    date: "",
    time: "08:00",
    type: "event",
    color: "blue",
    description: "",
  };
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!form.title || !form.date) return;
    setSaving(true);
    await onSave(form);
    setForm(EMPTY);
    setSaving(false);
    onClose();
  };

  const eventTypes = ["event", "meeting", "concert", "deadline"];
  const colors = [
    { value: "blue", bg: "bg-blue-500" },
    { value: "emerald", bg: "bg-emerald-500" },
    { value: "purple", bg: "bg-purple-500" },
    { value: "red", bg: "bg-red-500" },
    { value: "amber", bg: "bg-amber-400" },
    { value: "slate", bg: "bg-slate-500" },
  ];

  return (
    <div className={MODAL_OVERLAY} onClick={onClose}>
      <div className={MODAL_BOX} onClick={(e) => e.stopPropagation()}>
        <ModalHeader
          icon={Calendar}
          iconBg="bg-blue-500"
          title="New Event"
          subtitle="Add to school calendar"
          onClose={onClose}
        />
        <div className={BODY}>
          <div>
            <label className={LABEL}>Event Title *</label>
            <input
              className={INPUT}
              placeholder="e.g. Sports Day"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL}>Date *</label>
              <input
                type="date"
                className={INPUT}
                value={form.date}
                onChange={(e) => set("date", e.target.value)}
              />
            </div>
            <div>
              <label className={LABEL}>Time</label>
              <input
                type="time"
                className={INPUT}
                value={form.time}
                onChange={(e) => set("time", e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className={LABEL}>Event Type</label>
            <div className="grid grid-cols-2 gap-2">
              {eventTypes.map((t) => (
                <button
                  key={t}
                  onClick={() => set("type", t)}
                  className={`py-2 rounded-xl border text-sm font-500 capitalize transition ${
                    form.type === t
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                      : "border-slate-200 text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={LABEL}>Colour Tag</label>
            <div className="flex gap-2">
              {colors.map(({ value, bg }) => (
                <button
                  key={value}
                  onClick={() => set("color", value)}
                  className={`w-8 h-8 rounded-full ${bg} transition ring-offset-2 ${
                    form.color === value
                      ? "ring-2 ring-indigo-500 scale-110"
                      : "hover:scale-105"
                  }`}
                />
              ))}
            </div>
          </div>

          <div>
            <label className={LABEL}>Description</label>
            <textarea
              className={INPUT}
              rows={3}
              placeholder="Brief description of the event…"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              style={{ resize: "vertical" }}
            />
          </div>
        </div>

        <div className={FOOTER}>
          <button className={BTN_GHOST} onClick={onClose}>
            Cancel
          </button>
          <button
            className={BTN_PRIMARY}
            onClick={handleSave}
            disabled={saving}
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving…" : "Add Event"}
          </button>
        </div>
      </div>
    </div>
  );
}

// StaffModal.jsx — updated to include PIN field
// Drop-in replacement for your existing StaffModal in educationModals.jsx
// PIN auto-fills from last 4 digits of phone number when phone is entered

// StaffModal.jsx — updated to include PIN field
// Drop-in replacement for your existing StaffModal in educationModals.jsx
// PIN auto-fills from last 4 digits of phone number when phone is entered

export function StaffModal({ open, onClose, onSave, initial }) {
  const EMPTY = {
    name: "",
    role: "",
    subject: "",
    phone: "",
    email: "",
    status: "present",
    classes: [],
    pin: "",
  };
  const [form, setForm] = useState(initial || EMPTY);
  const [classInput, setClassInput] = useState("");
  const [pinError, setPinError] = useState("");
  const [pinAutoFilled, setPinAutoFilled] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  // Regular field setter
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  // Phone setter — always tracks last 4 digits of phone as PIN while auto-fill is active
  const setPhone = (v) => {
    const digits = v.replace(/\D/g, "");
    if (digits.length >= 4) {
      setPinAutoFilled(true);
      setForm((p) => ({ ...p, phone: v, pin: digits.slice(-4) }));
    } else {
      setPinAutoFilled(false);
      setForm((p) => ({ ...p, phone: v, pin: "" }));
    }
  };

  const addClass = (val = classInput) => {
    const trimmed = val.trim();
    if (trimmed && !form.classes.includes(trimmed))
      set("classes", [...form.classes, trimmed]);
    setClassInput("");
  };
  const removeClass = (c) =>
    set(
      "classes",
      form.classes.filter((x) => x !== c),
    );

  const handleSave = async () => {
    if (!form.name || !form.role) return;
    if (form.pin && !/^\d{4,6}$/.test(form.pin)) {
      setPinError("PIN must be 4–6 digits (numbers only).");
      return;
    }
    setSaving(true);
    await onSave(form);
    setForm(EMPTY);
    setPinError("");
    setPinAutoFilled(false);
    setSaving(false);
    onClose();
  };

  return (
    <div className={MODAL_OVERLAY} onClick={onClose}>
      <div className={MODAL_BOX} onClick={(e) => e.stopPropagation()}>
        <ModalHeader
          icon={Users}
          iconBg="bg-slate-600"
          title={initial ? "Edit Staff Member" : "Add Staff Member"}
          subtitle="Teaching or support staff"
          onClose={onClose}
        />

        <div className={BODY}>
          {/* Name + Role */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL}>Full Name *</label>
              <input
                className={INPUT}
                placeholder="e.g. Mrs. Sarah Johnson"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
              />
            </div>
            <div>
              <label className={LABEL}>Role *</label>
              <input
                className={INPUT}
                placeholder="e.g. Grade 1 Teacher"
                value={form.role}
                onChange={(e) => set("role", e.target.value)}
              />
            </div>
          </div>

          {/* Subject + Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL}>Subject / Phase</label>
              <input
                className={INPUT}
                placeholder="e.g. Foundation Phase"
                value={form.subject}
                onChange={(e) => set("subject", e.target.value)}
              />
            </div>
            <div>
              <label className={LABEL}>Status</label>
              <select
                className={SELECT}
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
              >
                <option value="present">Present</option>
                <option value="absent">Absent</option>
              </select>
            </div>
          </div>

          {/* Phone + Email */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL}>Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  className={INPUT + " pl-9"}
                  placeholder="082 123 4567"
                  value={form.phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className={LABEL}>Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  className={INPUT + " pl-9"}
                  placeholder="teacher@school.com"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Classes */}
          <div>
            <label className={LABEL}>Classes</label>
            <div className="flex gap-2 mb-2">
              <select
                className={INPUT}
                value=""
                onChange={(e) => {
                  if (e.target.value) addClass(e.target.value);
                }}
              >
                <option value="">Select a class…</option>
                <option value="Grade 1A">Grade 1A</option>
                <option value="Grade 1B">Grade 1B</option>
                <option value="Grade R">Grade R</option>
                <option value="Grade 0">Grade 0</option>
                <option value="Grade 3">Grade 3</option>
              </select>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.classes.map((c) => (
                <span
                  key={c}
                  className="flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-600"
                >
                  {c}
                  <button
                    onClick={() => removeClass(c)}
                    className="hover:text-red-500 transition"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* ── Staff Portal PIN ───────────────────────────────────────────── */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 14,
              }}
            >
              <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#94a3b8",
                  whiteSpace: "nowrap",
                  letterSpacing: ".04em",
                }}
              >
                STAFF PORTAL ACCESS
              </span>
              <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
            </div>

            <label className={LABEL}>
              Portal PIN
              <span
                style={{ fontWeight: 400, color: "#94a3b8", marginLeft: 4 }}
              >
                (4–6 digits)
              </span>
            </label>

            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                className={INPUT + " pl-9"}
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="Auto-filled from phone, or enter manually"
                value={form.pin}
                onChange={(e) => {
                  set("pin", e.target.value.replace(/\D/g, ""));
                  setPinAutoFilled(false); // manual edit disables auto-fill
                  setPinError("");
                }}
              />
              {/* Auto-filled badge */}
              {pinAutoFilled && form.pin && (
                <span
                  style={{
                    position: "absolute",
                    right: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#059669",
                    background: "#ecfdf5",
                    padding: "2px 8px",
                    borderRadius: 99,
                    border: "1px solid #6ee7b7",
                  }}
                >
                  auto-filled
                </span>
              )}
            </div>

            {pinError ? (
              <p
                style={{
                  fontSize: 11,
                  color: "#ef4444",
                  marginTop: 4,
                  fontWeight: 500,
                }}
              >
                {pinError}
              </p>
            ) : (
              <p
                style={{
                  fontSize: 11,
                  color: "#94a3b8",
                  marginTop: 4,
                  lineHeight: 1.5,
                }}
              >
                {pinAutoFilled && form.pin ? (
                  <>
                    PIN set to last 4 digits of phone:{" "}
                    <strong style={{ color: "#475569" }}>{form.pin}</strong>.
                    You can change it manually above.
                  </>
                ) : (
                  <>
                    Share this PIN with the staff member. You can use the last 4
                    digits of their phone number as a default.
                  </>
                )}
              </p>
            )}
          </div>
        </div>

        <div className={FOOTER}>
          <button className={BTN_GHOST} onClick={onClose}>
            Cancel
          </button>
          <button
            className={BTN_PRIMARY}
            onClick={handleSave}
            disabled={saving}
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving…" : initial ? "Update Staff" : "Save Staff"}
          </button>
        </div>
      </div>
    </div>
  );
}
export function StudentModal({ open, onClose, onSave, initial }) {
  const EMPTY = {
    name: "",
    grade: "Grade 1",
    age: "",
    parent: "",
    phone: "",
    email: "",
    fees: { paid: 0, total: 1500, status: "unpaid" },
  };
  const [form, setForm] = useState(initial || EMPTY);
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const setFee = (k, v) => {
    const fees = { ...form.fees, [k]: v };
    // auto-calculate status
    const paid = Number(k === "paid" ? v : fees.paid);
    const total = Number(k === "total" ? v : fees.total);
    fees.status = paid >= total ? "paid" : paid > 0 ? "partial" : "unpaid";
    set("fees", fees);
  };

  const handleSave = async () => {
    if (!form.name || !form.grade) return;
    setSaving(true);
    await onSave(form);
    setForm(EMPTY);
    setSaving(false);
    onClose();
  };

  return (
    <div className={MODAL_OVERLAY} onClick={onClose}>
      <div className={MODAL_BOX} onClick={(e) => e.stopPropagation()}>
        <ModalHeader
          icon={GraduationCap}
          iconBg="bg-indigo-500"
          title={initial ? "Edit Student" : "Add Student"}
          subtitle="Student & parent details"
          onClose={onClose}
        />
        <div className={BODY}>
          {/* Student info */}
          <div className="text-xs font-700 text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-100">
            Student Information
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={LABEL}>Full Name *</label>
              <input
                className={INPUT}
                placeholder="e.g. Amara Dlamini"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
              />
            </div>
            <div>
              <label className={LABEL}>Grade *</label>
              <select
                className={SELECT}
                value={form.grade}
                onChange={(e) => set("grade", e.target.value)}
              >
                {[
                  "Grade R",
                  "Grade 0",
                  "Grade 1",
                  "Grade 2",
                  "Grade 3",
                ].map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={LABEL}>Age</label>
              <input
                type="number"
                className={INPUT}
                placeholder="7"
                min="2"
                max="18"
                value={form.age}
                onChange={(e) => set("age", e.target.value)}
              />
            </div>
          </div>

          {/* Parent info */}
          <div className="text-xs font-700 text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-100 mt-2">
            Parent / Guardian
          </div>

          <div>
            <label className={LABEL}>Parent Name</label>
            <input
              className={INPUT}
              placeholder="e.g. Nomvula Dlamini"
              value={form.parent}
              onChange={(e) => set("parent", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL}>Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  className={INPUT + " pl-9"}
                  placeholder="071 234 5678"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className={LABEL}>Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  className={INPUT + " pl-9"}
                  placeholder="parent@email.com"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Fees */}
          <div className="text-xs font-700 text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-100 mt-2">
            Fee Information
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL}>Total Fees (R)</label>
              <input
                type="number"
                className={INPUT}
                placeholder="1500"
                value={form.fees.total}
                onChange={(e) => setFee("total", e.target.value)}
              />
            </div>
            <div>
              <label className={LABEL}>Amount Paid (R)</label>
              <input
                type="number"
                className={INPUT}
                placeholder="0"
                value={form.fees.paid}
                onChange={(e) => setFee("paid", e.target.value)}
              />
            </div>
          </div>

          {/* Fee status indicator */}
          <div
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-600 ${
              form.fees.status === "paid"
                ? "bg-emerald-50 text-emerald-700"
                : form.fees.status === "partial"
                  ? "bg-amber-50 text-amber-700"
                  : "bg-red-50 text-red-600"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                form.fees.status === "paid"
                  ? "bg-emerald-500"
                  : form.fees.status === "partial"
                    ? "bg-amber-400"
                    : "bg-red-500"
              }`}
            />
            Status:{" "}
            {form.fees.status.charAt(0).toUpperCase() +
              form.fees.status.slice(1)}
            {" · "}Balance: R
            {Math.max(
              0,
              Number(form.fees.total) - Number(form.fees.paid),
            ).toLocaleString()}
          </div>
        </div>

        <div className={FOOTER}>
          <button className={BTN_GHOST} onClick={onClose}>
            Cancel
          </button>
          <button
            className={BTN_PRIMARY}
            onClick={handleSave}
            disabled={saving}
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving…" : initial ? "Update Student" : "Add Student"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function TimetableModal({
  open,
  onClose,
  onSave,
  initialClass,
  timetable,
}) {
  const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const TIME_SLOTS = ["08:00", "09:00", "10:00", "10:30", "11:30", "12:30"];
  const CLASSES = [
    "Grade R",
    "Grade 0",
    "Grade 1",
    "Grade 2",
    "Grade 3",
  ];

  const [selectedClass, setSelectedClass] = useState(initialClass || "Grade 1");
  const [saving, setSaving] = useState(false);

  // Build editable grid: { Monday: ["Maths","English",...], ... }
  const buildEmpty = () =>
    DAYS.reduce(
      (acc, d) => ({ ...acc, [d]: Array(TIME_SLOTS.length).fill("") }),
      {},
    );

  const [schedule, setSchedule] = useState(() => {
    const existing = timetable?.[initialClass || "Grade 1"];
    return existing ? { ...buildEmpty(), ...existing } : buildEmpty();
  });

  if (!open) return null;

  // When class changes, load existing or blank schedule
  const handleClassChange = (cls) => {
    setSelectedClass(cls);
    const existing = timetable?.[cls];
    setSchedule(existing ? { ...buildEmpty(), ...existing } : buildEmpty());
  };

  const setCell = (day, index, value) => {
    setSchedule((prev) => {
      const days = [...(prev[day] || [])];
      days[index] = value;
      return { ...prev, [day]: days };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave(selectedClass, schedule);
    setSaving(false);
    onClose();
  };

  return (
    <div className={MODAL_OVERLAY} onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <ModalHeader
          icon={Clock}
          iconBg="bg-teal-500"
          title="Edit Timetable"
          subtitle="Set the weekly schedule for a class"
          onClose={onClose}
        />

        <div className="px-6 pt-4">
          {/* Class selector */}
          <div className="flex flex-wrap gap-2 mb-5">
            {CLASSES.map((c) => (
              <button
                key={c}
                onClick={() => handleClassChange(c)}
                className={`px-3 py-1.5 rounded-xl text-sm font-600 transition ${
                  selectedClass === c
                    ? "bg-teal-500 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="overflow-x-auto">
            <table className="w-full" style={{ minWidth: 540 }}>
              <thead>
                <tr>
                  <th className="text-left text-xs font-700 text-slate-400 pb-3 pr-3 w-16">
                    TIME
                  </th>
                  {DAYS.map((d) => (
                    <th
                      key={d}
                      className="text-center text-xs font-700 text-slate-500 pb-3 px-1"
                    >
                      {d}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIME_SLOTS.map((time, ti) => (
                  <tr key={time}>
                    <td className="text-xs font-700 text-slate-400 pr-3 py-1.5 align-middle">
                      {time}
                    </td>
                    {DAYS.map((day) => (
                      <td key={day} className="px-1 py-1">
                        <input
                          className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-400 focus:border-transparent transition text-center"
                          placeholder="—"
                          value={schedule[day]?.[ti] || ""}
                          onChange={(e) => setCell(day, ti, e.target.value)}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className={FOOTER + " mt-4"}>
          <button className={BTN_GHOST} onClick={onClose}>
            Cancel
          </button>
          <button
            className={BTN_PRIMARY}
            onClick={handleSave}
            disabled={saving}
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving…" : `Save ${selectedClass} Timetable`}
          </button>
        </div>
      </div>
    </div>
  );
}
