import React, { useState, useEffect } from "react";
import { addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Video,
  Phone,
  Presentation,
  FileCheck,
  Calendar as CalendarIcon,
  ExternalLink,
} from "lucide-react";
import {
  inputCls,
  labelCls,
  primaryBtn,
  ghostBtn,
  toISODate,
  addDays,
  LoadingRow,
  PageHeader,
  StatCard,
  Modal,
  EmptyState,
  userCol,
  fetchAll,
  seedCollection,
} from "./VirtualViewKit";

/**
 * VirtualScheduleView – weekly calendar of sessions, calls, workshops and
 * deliverable due-dates for online service businesses.
 *
 * Firestore: users/{uid}/sessions
 *   { title, client, engagement, date:"YYYY-MM-DD", startTime:"HH:MM",
 *     endTime:"HH:MM", mode, meetingLink, status, notes }
 *
 * Unlike a fixed Mon–Sat grid, sessions are date-based (so they don't repeat
 * every week) and the week runs Mon–Sun, because online work often spills into
 * weekends and other time zones.
 */

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const MODES = {
  "Video Call": { icon: Video, cls: "bg-[#ede9fe] text-[#6d28d9]", bar: "bg-[#7c3aed]" },
  "Phone Call": { icon: Phone, cls: "bg-[#dbeafe] text-[#1d4ed8]", bar: "bg-[#3b82f6]" },
  "Workshop / Webinar": { icon: Presentation, cls: "bg-[#fce7f3] text-[#be185d]", bar: "bg-[#ec4899]" },
  "Deliverable Due": { icon: FileCheck, cls: "bg-[#dcfce7] text-[#166534]", bar: "bg-[#22c55e]" },
};

const STATUSES = {
  scheduled: { label: "Scheduled", cls: "text-[#475569]" },
  completed: { label: "Completed", cls: "text-[#059669]" },
  cancelled: { label: "Cancelled", cls: "text-[#dc2626] line-through" },
  "no-show": { label: "No-show", cls: "text-[#d97706]" },
};

const getMonday = (base) => {
  const d = new Date(base);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0 = Sun
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
  return d;
};

const toMinutes = (hhmm) => {
  const [h, m] = (hhmm || "0:0").split(":").map(Number);
  return h * 60 + (m || 0);
};

const isUrl = (s) => /^https?:\/\//i.test(s || "");

const BLANK = {
  title: "",
  client: "",
  engagement: "",
  date: toISODate(new Date()),
  startTime: "09:00",
  endTime: "10:00",
  mode: "Video Call",
  meetingLink: "",
  status: "scheduled",
  notes: "",
};

const t0 = new Date();
const SEED = [
  { title: "Discovery call", client: "Finwise Academy", engagement: "", date: toISODate(addDays(t0, 0)), startTime: "10:00", endTime: "11:00", mode: "Video Call", meetingLink: "https://meet.google.com/", status: "scheduled", notes: "" },
  { title: "Coaching session 4", client: "Nova Logistics", engagement: "Nova Leadership Coaching (6 sessions)", date: toISODate(addDays(t0, 1)), startTime: "14:00", endTime: "15:30", mode: "Video Call", meetingLink: "https://zoom.us/", status: "scheduled", notes: "Topic: delegation" },
  { title: "Design review", client: "Brightside Dental", engagement: "Brightside Website Redesign", date: toISODate(addDays(t0, 2)), startTime: "11:00", endTime: "12:00", mode: "Video Call", meetingLink: "", status: "scheduled", notes: "" },
  { title: "Homepage designs due", client: "Brightside Dental", engagement: "Brightside Website Redesign", date: toISODate(addDays(t0, 2)), startTime: "17:00", endTime: "17:30", mode: "Deliverable Due", meetingLink: "", status: "scheduled", notes: "" },
  { title: "Bookkeeping basics webinar", client: "Open to public", engagement: "", date: toISODate(addDays(t0, 4)), startTime: "18:00", endTime: "19:30", mode: "Workshop / Webinar", meetingLink: "https://zoom.us/", status: "scheduled", notes: "" },
  { title: "Retainer check-in", client: "Kopano Interiors", engagement: "Monthly SEO & Content Retainer", date: toISODate(addDays(t0, -2)), startTime: "09:30", endTime: "10:00", mode: "Phone Call", meetingLink: "", status: "completed", notes: "" },
];

export default function VirtualScheduleView({ user }) {
  const [events, setEvents] = useState([]);
  const [engagements, setEngagements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(BLANK);

  const load = async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const [ev, pr] = await Promise.all([
        fetchAll(userCol(user.uid, "sessions")),
        fetchAll(userCol(user.uid, "projects")).catch(() => []),
      ]);
      setEvents(ev);
      setEngagements(pr);
    } catch (e) {
      console.error("Schedule load:", e);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, [user?.uid]);

  const loadSamples = async () => {
    setSeeding(true);
    try {
      await seedCollection(userCol(user.uid, "sessions"), SEED);
      await load();
    } catch (e) {
      alert("Failed to load sample data.");
    } finally {
      setSeeding(false);
    }
  };

  const monday = addDays(getMonday(new Date()), weekOffset * 7);
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  const weekKeys = weekDates.map(toISODate);
  const todayKey = toISODate(new Date());
  const weekLabel = `${weekDates[0].getDate()} ${MONTH_NAMES[weekDates[0].getMonth()]} – ${weekDates[6].getDate()} ${MONTH_NAMES[weekDates[6].getMonth()]} ${weekDates[6].getFullYear()}`;

  const eventsOn = (key) =>
    events
      .filter((e) => e.date === key)
      .sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime));

  const weekEvents = events.filter((e) => weekKeys.includes(e.date) && e.status !== "cancelled");
  const hoursBooked = weekEvents
    .filter((e) => e.mode !== "Deliverable Due")
    .reduce((s, e) => s + Math.max(0, toMinutes(e.endTime) - toMinutes(e.startTime)) / 60, 0);
  const todayCount = events.filter((e) => e.date === todayKey && e.status === "scheduled").length;

  const openAdd = (dateKey) => {
    setForm({ ...BLANK, date: dateKey || todayKey });
    setEditId(null);
    setShowModal(true);
  };
  const openEdit = (ev) => {
    setForm({ ...BLANK, ...ev });
    setEditId(ev.id);
    setShowModal(true);
  };

  const timeError =
    form.mode !== "Deliverable Due" && toMinutes(form.endTime) <= toMinutes(form.startTime)
      ? "End time must be after start time."
      : "";

  const handleSave = async () => {
    if (!form.title.trim() || !form.date || timeError) return;
    setSaving(true);
    const payload = {
      title: form.title.trim(),
      client: form.client.trim(),
      engagement: form.engagement,
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      mode: form.mode,
      meetingLink: form.meetingLink.trim(),
      status: form.status,
      notes: form.notes.trim(),
    };
    try {
      if (editId) {
        await updateDoc(doc(db, "users", user.uid, "sessions", editId), { ...payload, updatedAt: serverTimestamp() });
        setEvents((prev) => prev.map((e) => (e.id === editId ? { id: editId, ...payload } : e)));
      } else {
        const ref = await addDoc(userCol(user.uid, "sessions"), { ...payload, createdAt: serverTimestamp() });
        setEvents((prev) => [...prev, { id: ref.id, ...payload }]);
      }
      setShowModal(false);
    } catch (e) {
      console.error("Save session:", e);
      alert("Failed to save session.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editId || !window.confirm("Delete this session?")) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "sessions", editId));
      setEvents((prev) => prev.filter((e) => e.id !== editId));
      setShowModal(false);
    } catch (e) {
      alert("Failed to delete session.");
    }
  };

  if (loading) return <LoadingRow label="Loading schedule…" />;

  return (
    <div className="space-y-5">
      <PageHeader title="Schedule" subtitle={weekLabel}>
        <button onClick={() => setWeekOffset((w) => w - 1)} className={ghostBtn} aria-label="Previous week">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button onClick={() => setWeekOffset(0)} className={ghostBtn}>This week</button>
        <button onClick={() => setWeekOffset((w) => w + 1)} className={ghostBtn} aria-label="Next week">
          <ChevronRight className="w-4 h-4" />
        </button>
        <button onClick={() => openAdd()} className={primaryBtn}>
          <Plus className="w-4 h-4" />
          New Session
        </button>
      </PageHeader>

      {events.length === 0 ? (
        <EmptyState
          icon={CalendarIcon}
          title="No sessions scheduled"
          hint="Add client calls, workshops and deliverable due-dates, or load a few samples."
          onAdd={() => openAdd()}
          addLabel="New Session"
          onSeed={loadSamples}
          seeding={seeding}
        />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard label="This week" value={weekEvents.length} color="text-[#7c3aed]" bg="bg-[#f5f3ff]" />
            <StatCard label="Hours booked" value={`${Math.round(hoursBooked * 10) / 10}h`} color="text-[#2563eb]" bg="bg-[#eff6ff]" />
            <StatCard label="Today" value={todayCount} color="text-[#059669]" bg="bg-[#f0fdf4]" />
            <StatCard label="All sessions" value={events.length} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {weekDates.map((date, i) => {
              const key = weekKeys[i];
              const list = eventsOn(key);
              const isToday = key === todayKey;
              return (
                <div key={key} className={`bg-white border rounded-xl overflow-hidden flex flex-col min-h-[140px] ${isToday ? "border-[#7c3aed] ring-1 ring-[#7c3aed]/30" : "border-[#e2e8f0]"}`}>
                  <div className={`px-3 py-2 flex items-center justify-between border-b ${isToday ? "bg-[#f5f3ff] border-[#ddd6fe]" : "bg-[#f8fafc] border-[#e2e8f0]"}`}>
                    <div>
                      <p className={`text-xs font-bold ${isToday ? "text-[#6d28d9]" : "text-[#374151]"}`}>{DAY_NAMES[i]}</p>
                      <p className="text-[11px] text-[#94a3b8]">{date.getDate()} {MONTH_NAMES[date.getMonth()]}</p>
                    </div>
                    <button onClick={() => openAdd(key)} title="Add session" className="p-1 text-[#94a3b8] hover:text-[#7c3aed] hover:bg-white rounded-md">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="p-2 space-y-2 flex-1">
                    {list.length === 0 && <p className="text-[11px] text-[#cbd5e1] text-center py-3">Free</p>}
                    {list.map((ev) => {
                      const m = MODES[ev.mode] || MODES["Video Call"];
                      const Icon = m.icon;
                      const st = STATUSES[ev.status] || STATUSES.scheduled;
                      return (
                        <div key={ev.id} onClick={() => openEdit(ev)} className="relative cursor-pointer rounded-lg border border-[#f1f5f9] bg-white hover:shadow-md transition-shadow pl-3 pr-2 py-2 overflow-hidden">
                          <span className={`absolute left-0 top-0 bottom-0 w-1 ${m.bar}`} />
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className={`inline-flex items-center justify-center w-5 h-5 rounded ${m.cls}`}>
                              <Icon className="w-3 h-3" />
                            </span>
                            <span className="text-[11px] font-semibold text-[#374151]">
                              {ev.mode === "Deliverable Due" ? `Due ${ev.startTime}` : `${ev.startTime}–${ev.endTime}`}
                            </span>
                          </div>
                          <p className={`text-xs font-semibold text-[#1e293b] leading-snug ${ev.status === "cancelled" ? "line-through opacity-60" : ""}`}>{ev.title}</p>
                          {ev.client && <p className="text-[11px] text-[#64748b] truncate">{ev.client}</p>}
                          <div className="flex items-center justify-between mt-1">
                            <span className={`text-[10px] font-semibold ${st.cls}`}>{st.label}</span>
                            {isUrl(ev.meetingLink) && ev.status === "scheduled" && (
                              <a
                                href={ev.meetingLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-[#7c3aed] hover:underline"
                              >
                                Join <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {showModal && (
        <Modal
          wide
          title={editId ? "Edit Session" : "New Session"}
          onClose={() => setShowModal(false)}
          footer={
            <>
              {editId ? <button onClick={handleDelete} className="text-sm text-[#dc2626] hover:underline">Delete</button> : <span />}
              <div className="flex gap-2">
                <button onClick={() => setShowModal(false)} className={ghostBtn}>Cancel</button>
                <button onClick={handleSave} disabled={saving || !form.title.trim() || !form.date || !!timeError} className={primaryBtn}>
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            </>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelCls}>Title</label>
              <input className={inputCls} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Strategy session" />
            </div>
            <div>
              <label className={labelCls}>Type</label>
              <select className={inputCls} value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value })}>
                {Object.keys(MODES).map((m) => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Status</label>
              <select className={inputCls} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {Object.entries(STATUSES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Client</label>
              <input className={inputCls} value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Engagement (optional)</label>
              <select className={inputCls} value={form.engagement} onChange={(e) => setForm({ ...form, engagement: e.target.value })}>
                <option value="">None</option>
                {form.engagement && !engagements.some((p) => p.name === form.engagement) && <option>{form.engagement}</option>}
                {engagements.map((p) => <option key={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Date</label>
              <input type="date" className={inputCls} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={labelCls}>{form.mode === "Deliverable Due" ? "Due at" : "Start"}</label>
                <input type="time" className={inputCls} value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
              </div>
              {form.mode !== "Deliverable Due" && (
                <div>
                  <label className={labelCls}>End</label>
                  <input type="time" className={inputCls} value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
                </div>
              )}
            </div>
            {timeError && <p className="sm:col-span-2 text-xs text-[#dc2626] -mt-2">{timeError}</p>}
            <div className="sm:col-span-2">
              <label className={labelCls}>Meeting link</label>
              <input className={inputCls} value={form.meetingLink} onChange={(e) => setForm({ ...form, meetingLink: e.target.value })} placeholder="https://zoom.us/j/…" />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Notes</label>
              <textarea rows={3} className={inputCls} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
