import React, { useState, useEffect } from "react";
import {
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase";
import {
  Briefcase,
  ClipboardList,
  Layers,
  Plus,
  ChevronRight,
  Users,
  AlertTriangle,
  Pencil,
} from "lucide-react";
import {
  inputCls,
  labelCls,
  primaryBtn,
  ghostBtn,
  fmtR,
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
 * VirtualProjectsView – Engagements, Tasks & Deliverables, Resources & Assets
 * (Virtual Services counterpart of the Upholstery "Jobs & Production" view)
 *
 * Firestore:
 *   users/{uid}/projects    – engagements
 *   users/{uid}/workOrders  – tasks & deliverables
 *   users/{uid}/materials   – resources & assets needed per engagement
 */

const TABS = [
  { id: "projects", label: "Active Engagements", icon: Briefcase },
  { id: "work-orders", label: "Tasks & Deliverables", icon: ClipboardList },
  { id: "materials", label: "Resources & Assets", icon: Layers },
];

// Service types match the Service step of VirtualMultiStepForm
const SERVICE_TYPES = [
  "Consultation",
  "Coaching Session",
  "Web Design",
  "Software Development",
  "Digital Marketing",
  "Online Course",
  "Subscription",
  "Other",
];

const ENGAGEMENT_TYPES = [
  "Fixed-Scope Project",
  "Monthly Retainer",
  "Hourly / Time & Materials",
  "Productised Package",
];

const CHANNELS = [
  "Zoom",
  "Google Meet",
  "Microsoft Teams",
  "Slack / Async",
  "Email / Async",
  "Phone",
];

// Virtual service delivery lifecycle
const STAGES = [
  "Enquiry & Discovery",
  "Proposal & Quote",
  "Onboarding & Kickoff",
  "Planning & Scoping",
  "Delivery in Progress",
  "Review & Revisions",
  "Handover / Go-Live",
  "Support & Retainer",
];

const STAGE_DESC = {
  "Enquiry & Discovery": "First call or form: understand goals, scope and budget.",
  "Proposal & Quote": "Quote sent and accepted; deposit invoice raised.",
  "Onboarding & Kickoff": "Contract signed, access and assets collected, kickoff call held.",
  "Planning & Scoping": "Roadmap, milestones and session schedule agreed.",
  "Delivery in Progress": "Sessions, builds or campaigns being delivered.",
  "Review & Revisions": "Client feedback gathered and revisions applied.",
  "Handover / Go-Live": "Final deliverables handed over, balance invoiced, go-live.",
  "Support & Retainer": "Ongoing support, check-ins or recurring subscription.",
};

const stageIndex = (s) => STAGES.indexOf(s);

const PROJ_STATUS = {
  active: { label: "Active", cls: "bg-[#dcfce7] text-[#166534]" },
  "on-hold": { label: "On Hold", cls: "bg-[#fef3c7] text-[#92400e]" },
  planning: { label: "Planning", cls: "bg-[#eff6ff] text-[#1d4ed8]" },
  completed: { label: "Completed", cls: "bg-[#f1f5f9] text-[#475569]" },
};

const TASK_STATUS = {
  pending: { label: "Pending", cls: "bg-[#eff6ff] text-[#1d4ed8]" },
  "in-progress": { label: "In Progress", cls: "bg-[#f5f3ff] text-[#6d28d9]" },
  completed: { label: "Completed", cls: "bg-[#dcfce7] text-[#166534]" },
};
const TASK_CYCLE = ["pending", "in-progress", "completed"];
const TASK_KINDS = ["Task", "Deliverable", "Meeting / Session", "Review"];

const PRIORITY_CFG = {
  high: { cls: "bg-[#fef2f2] text-[#dc2626]", dot: "bg-[#dc2626]" },
  medium: { cls: "bg-[#fffbeb] text-[#d97706]", dot: "bg-[#d97706]" },
  low: { cls: "bg-[#f0fdf4] text-[#16a34a]", dot: "bg-[#16a34a]" },
};

const RES_STATUS = {
  ok: { label: "Ready", cls: "bg-[#dcfce7] text-[#166534]" },
  low: { label: "Partial", cls: "bg-[#fef3c7] text-[#92400e]" },
  out: { label: "Missing", cls: "bg-[#fef2f2] text-[#991b1b]" },
};
const RES_UNITS = ["seat", "licence", "asset", "hr", "credit", "account", "file", "pc"];

const resStatus = (needed, available) => {
  const n = Number(needed) || 0;
  const a = Number(available) || 0;
  if (a >= n) return "ok";
  if (a > 0) return "low";
  return "out";
};

// ── Sample data (only written when the user clicks "Load sample data") ──────
const today = new Date();
const d = (n) => toISODate(addDays(today, n));

const PROJECT_SEED = [
  {
    name: "Brightside Website Redesign",
    client: "Brightside Dental",
    type: "Web Design",
    engagementType: "Fixed-Scope Project",
    channel: "Google Meet",
    status: "active",
    progress: 60,
    budget: 38000,
    spent: 21500,
    start: d(-21),
    end: d(14),
    crew: "Lerato, Dan",
    phase: "Delivery in Progress",
  },
  {
    name: "Nova Leadership Coaching (6 sessions)",
    client: "Nova Logistics",
    type: "Coaching Session",
    engagementType: "Productised Package",
    channel: "Zoom",
    status: "active",
    progress: 50,
    budget: 18000,
    spent: 9000,
    start: d(-14),
    end: d(28),
    crew: "Lerato",
    phase: "Delivery in Progress",
  },
  {
    name: "Monthly SEO & Content Retainer",
    client: "Kopano Interiors",
    type: "Digital Marketing",
    engagementType: "Monthly Retainer",
    channel: "Slack / Async",
    status: "active",
    progress: 85,
    budget: 12000,
    spent: 10200,
    start: d(-60),
    end: d(30),
    crew: "Dan, Priya",
    phase: "Support & Retainer",
  },
  {
    name: "Inventory App MVP",
    client: "Mthembu Traders",
    type: "Software Development",
    engagementType: "Hourly / Time & Materials",
    channel: "Microsoft Teams",
    status: "on-hold",
    progress: 25,
    budget: 64000,
    spent: 16000,
    start: d(-10),
    end: d(60),
    crew: "Dan, Priya",
    phase: "Planning & Scoping",
  },
  {
    name: "Intro to Bookkeeping Online Course",
    client: "Finwise Academy",
    type: "Online Course",
    engagementType: "Fixed-Scope Project",
    channel: "Email / Async",
    status: "planning",
    progress: 0,
    budget: 22000,
    spent: 0,
    start: d(7),
    end: d(45),
    crew: "TBD",
    phase: "Proposal & Quote",
  },
];

const TASK_SEED = [
  { number: "TASK-001", kind: "Meeting / Session", task: "Kickoff call & brand asset handover", projectName: "Brightside Website Redesign", assignedTo: "Lerato", priority: "high", status: "completed", phase: "Onboarding & Kickoff", estHours: 2, dueDate: d(-20) },
  { number: "TASK-002", kind: "Deliverable", task: "Homepage & service page designs (Figma)", projectName: "Brightside Website Redesign", assignedTo: "Lerato", priority: "high", status: "in-progress", phase: "Delivery in Progress", estHours: 16, dueDate: d(2) },
  { number: "TASK-003", kind: "Task", task: "Build booking form integration", projectName: "Brightside Website Redesign", assignedTo: "Dan", priority: "medium", status: "pending", phase: "Delivery in Progress", estHours: 10, dueDate: d(8) },
  { number: "TASK-004", kind: "Meeting / Session", task: "Coaching session 4: delegation", projectName: "Nova Leadership Coaching (6 sessions)", assignedTo: "Lerato", priority: "medium", status: "pending", phase: "Delivery in Progress", estHours: 1.5, dueDate: d(3) },
  { number: "TASK-005", kind: "Deliverable", task: "Monthly SEO report & content calendar", projectName: "Monthly SEO & Content Retainer", assignedTo: "Priya", priority: "medium", status: "in-progress", phase: "Support & Retainer", estHours: 6, dueDate: d(4) },
  { number: "TASK-006", kind: "Review", task: "Confirm MVP scope and sign off estimate", projectName: "Inventory App MVP", assignedTo: "Dan", priority: "low", status: "pending", phase: "Planning & Scoping", estHours: 3, dueDate: d(-2) },
];

const RESOURCE_SEED = [
  { projectName: "Brightside Website Redesign", resource: "Figma editor seats", needed: 2, unit: "seat", available: 2 },
  { projectName: "Brightside Website Redesign", resource: "Client logo & brand guide", needed: 1, unit: "asset", available: 1 },
  { projectName: "Brightside Website Redesign", resource: "Hosting account access", needed: 1, unit: "account", available: 0 },
  { projectName: "Nova Leadership Coaching (6 sessions)", resource: "Zoom Pro licence", needed: 1, unit: "licence", available: 1 },
  { projectName: "Nova Leadership Coaching (6 sessions)", resource: "Workbook PDFs", needed: 6, unit: "file", available: 4 },
  { projectName: "Monthly SEO & Content Retainer", resource: "Semrush projects", needed: 3, unit: "licence", available: 3 },
];

// ── Component ────────────────────────────────────────────────────────────────
export default function VirtualProjectsView({ user, defaultTab = "projects" }) {
  const [tab, setTab] = useState(defaultTab);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [expanded, setExpanded] = useState(null);

  const [modal, setModal] = useState(null); // "project" | "task" | "resource" | null
  const [editId, setEditId] = useState(null);

  const firstProject = projects[0]?.name || "";

  const PROJ_BLANK = {
    name: "",
    client: "",
    type: SERVICE_TYPES[0],
    engagementType: ENGAGEMENT_TYPES[0],
    channel: CHANNELS[0],
    status: "planning",
    progress: 0,
    budget: "",
    spent: 0,
    start: "",
    end: "",
    crew: "",
    phase: STAGES[0],
  };
  const TASK_BLANK = {
    task: "",
    kind: TASK_KINDS[0],
    projectName: firstProject,
    assignedTo: "",
    priority: "medium",
    phase: STAGES[0],
    estHours: "",
    dueDate: "",
    status: "pending",
  };
  const RES_BLANK = {
    resource: "",
    projectName: firstProject,
    needed: "",
    unit: RES_UNITS[0],
    available: "",
  };

  const [projForm, setProjForm] = useState(PROJ_BLANK);
  const [taskForm, setTaskForm] = useState(TASK_BLANK);
  const [resForm, setResForm] = useState(RES_BLANK);

  useEffect(() => setTab(defaultTab), [defaultTab]);

  const loadAll = async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const [p, t, r] = await Promise.all([
        fetchAll(userCol(user.uid, "projects")),
        fetchAll(userCol(user.uid, "workOrders")),
        fetchAll(userCol(user.uid, "materials")),
      ]);
      setProjects(p);
      setTasks(t);
      setResources(r);
    } catch (e) {
      console.error("Engagements load:", e);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadAll();
  }, [user?.uid]);

  const loadSamples = async () => {
    setSeeding(true);
    try {
      await Promise.all([
        seedCollection(userCol(user.uid, "projects"), PROJECT_SEED),
        seedCollection(userCol(user.uid, "workOrders"), TASK_SEED),
        seedCollection(userCol(user.uid, "materials"), RESOURCE_SEED),
      ]);
      await loadAll();
    } catch (e) {
      console.error(e);
      alert("Failed to load sample data.");
    } finally {
      setSeeding(false);
    }
  };

  const close = () => {
    setModal(null);
    setEditId(null);
  };

  // ── Generic save/delete against a collection ───────────────────────────────
  const save = async (colName, payload, setList, extra = {}) => {
    setSaving(true);
    try {
      if (editId) {
        await updateDoc(doc(db, "users", user.uid, colName, editId), {
          ...payload,
          updatedAt: serverTimestamp(),
        });
        setList((prev) =>
          prev.map((x) => (x.id === editId ? { ...x, ...payload } : x)),
        );
      } else {
        const ref = await addDoc(userCol(user.uid, colName), {
          ...payload,
          ...extra,
          createdAt: serverTimestamp(),
        });
        setList((prev) => [...prev, { id: ref.id, ...payload, ...extra }]);
      }
      close();
    } catch (e) {
      console.error(`Save ${colName}:`, e);
      alert("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (colName, id, setList, label) => {
    if (!window.confirm(`Delete this ${label}?`)) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, colName, id));
      setList((prev) => prev.filter((x) => x.id !== id));
      close();
    } catch (e) {
      alert("Failed to delete.");
    }
  };

  // ── Openers ────────────────────────────────────────────────────────────────
  const openProj = (p) => {
    setProjForm(
      p
        ? { ...PROJ_BLANK, ...p, budget: String(p.budget ?? ""), spent: String(p.spent ?? 0), progress: Number(p.progress) || 0 }
        : PROJ_BLANK,
    );
    setEditId(p?.id || null);
    setModal("project");
  };
  const openTask = (t) => {
    setTaskForm(
      t
        ? { ...TASK_BLANK, ...t, estHours: String(t.estHours ?? "") }
        : { ...TASK_BLANK, projectName: firstProject },
    );
    setEditId(t?.id || null);
    setModal("task");
  };
  const openRes = (r) => {
    setResForm(
      r
        ? { ...RES_BLANK, ...r, needed: String(r.needed ?? ""), available: String(r.available ?? "") }
        : { ...RES_BLANK, projectName: firstProject },
    );
    setEditId(r?.id || null);
    setModal("resource");
  };

  // ── Savers ─────────────────────────────────────────────────────────────────
  const saveProject = () => {
    if (!projForm.name.trim()) return;
    save(
      "projects",
      {
        name: projForm.name.trim(),
        client: projForm.client.trim(),
        type: projForm.type,
        engagementType: projForm.engagementType,
        channel: projForm.channel,
        status: projForm.status,
        progress: Math.min(100, Math.max(0, Number(projForm.progress) || 0)),
        budget: Number(projForm.budget) || 0,
        spent: Number(projForm.spent) || 0,
        start: projForm.start,
        end: projForm.end,
        crew: projForm.crew.trim(),
        phase: projForm.phase,
      },
      setProjects,
    );
  };

  const saveTask = () => {
    if (!taskForm.task.trim()) return;
    const extra = editId
      ? {}
      : { number: `TASK-${String(tasks.length + 1).padStart(3, "0")}` };
    save(
      "workOrders",
      {
        task: taskForm.task.trim(),
        kind: taskForm.kind,
        projectName: taskForm.projectName,
        assignedTo: taskForm.assignedTo.trim(),
        priority: taskForm.priority,
        phase: taskForm.phase,
        estHours: Number(taskForm.estHours) || 0,
        dueDate: taskForm.dueDate,
        status: taskForm.status,
      },
      setTasks,
      extra,
    );
  };

  const saveResource = () => {
    if (!resForm.resource.trim()) return;
    save(
      "materials",
      {
        resource: resForm.resource.trim(),
        projectName: resForm.projectName,
        needed: Number(resForm.needed) || 0,
        unit: resForm.unit,
        available: Number(resForm.available) || 0,
      },
      setResources,
    );
  };

  const cycleTask = async (t) => {
    const next = TASK_CYCLE[(TASK_CYCLE.indexOf(t.status) + 1) % TASK_CYCLE.length];
    try {
      await updateDoc(doc(db, "users", user.uid, "workOrders", t.id), {
        status: next,
        updatedAt: serverTimestamp(),
      });
      setTasks((prev) => prev.map((x) => (x.id === t.id ? { ...x, status: next } : x)));
    } catch (e) {
      console.error("Cycle status:", e);
    }
  };

  const todayStr = toISODate(new Date());
  const isOverdue = (t) => t.dueDate && t.dueDate < todayStr && t.status !== "completed";

  if (loading) return <LoadingRow label="Loading engagements…" />;

  const nothingYet = !projects.length && !tasks.length && !resources.length;
  const resByProject = projects
    .map((p) => ({ p, rows: resources.filter((r) => r.projectName === p.name) }))
    .filter((g) => g.rows.length);
  const orphanRes = resources.filter((r) => !projects.some((p) => p.name === r.projectName));
  const resIssues = resources.filter((r) => resStatus(r.needed, r.available) !== "ok").length;

  const addBtn =
    tab === "projects"
      ? { label: "New Engagement", onClick: () => openProj() }
      : tab === "work-orders"
        ? { label: "New Task", onClick: () => openTask() }
        : { label: "Add Resource", onClick: () => openRes() };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Engagements & Delivery"
        subtitle="Track projects, retainers and coaching programmes from first call to go-live"
      >
        <button onClick={addBtn.onClick} className={primaryBtn}>
          <Plus className="w-4 h-4" />
          {addBtn.label}
        </button>
      </PageHeader>

      {/* Tabs */}
      <div className="flex border-b border-[#e2e8f0] overflow-x-auto">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-all whitespace-nowrap ${tab === id ? "border-[#7c3aed] text-[#7c3aed] bg-[#f5f3ff]" : "border-transparent text-[#64748b] hover:text-[#374151]"}`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {nothingYet && (
        <EmptyState
          icon={Briefcase}
          title="No engagements yet"
          hint="Create your first engagement, or load a few samples to see how this view works."
          onAdd={() => openProj()}
          addLabel="New Engagement"
          onSeed={loadSamples}
          seeding={seeding}
        />
      )}

      {/* ══ ENGAGEMENTS ══ */}
      {!nothingYet && tab === "projects" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard label="Total" value={projects.length} />
            <StatCard label="Active" value={projects.filter((p) => p.status === "active").length} color="text-[#059669]" bg="bg-[#f0fdf4]" />
            <StatCard label="On Hold" value={projects.filter((p) => p.status === "on-hold").length} color="text-[#d97706]" bg="bg-[#fffbeb]" />
            <StatCard label="Total Value" value={fmtR(projects.reduce((s, p) => s + (p.budget || 0), 0))} color="text-[#7c3aed]" bg="bg-[#f5f3ff]" />
          </div>

          {projects.length === 0 ? (
            <EmptyState icon={Briefcase} title="No engagements" onAdd={() => openProj()} addLabel="New Engagement" />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {projects.map((p) => {
                const st = PROJ_STATUS[p.status] || PROJ_STATUS.planning;
                const budgetPct = p.budget > 0 ? Math.round(((p.spent || 0) / p.budget) * 100) : 0;
                const isOpen = expanded === p.id;
                const si = stageIndex(p.phase);
                return (
                  <div key={p.id} className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <div className="px-5 py-4 border-b border-[#f1f5f9]">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${st.cls}`}>{st.label}</span>
                            <span className="text-xs text-[#64748b]">{p.type}</span>
                            {p.engagementType && (
                              <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-semibold bg-[#f5f3ff] text-[#6d28d9]">
                                {p.engagementType}
                              </span>
                            )}
                          </div>
                          <h3 className="text-sm font-bold text-[#1e293b] truncate">{p.name}</h3>
                          <p className="text-xs text-[#64748b] mt-0.5">
                            {p.client}
                            {p.channel ? ` · ${p.channel}` : ""}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button onClick={() => openProj(p)} title="Edit" className="p-1.5 text-[#94a3b8] hover:text-[#7c3aed] hover:bg-[#f5f3ff] rounded-lg transition-all">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setExpanded(isOpen ? null : p.id)} title="Details" className="p-1.5 text-[#94a3b8] hover:text-[#374151] hover:bg-[#f8fafc] rounded-lg">
                            <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`} />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="px-5 py-3 border-b border-[#f1f5f9]">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-semibold text-[#64748b] uppercase tracking-wide">Progress</span>
                        <span className="text-xs font-bold text-[#1e293b]">{p.progress || 0}%</span>
                      </div>
                      <div className="w-full bg-[#f1f5f9] rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${p.progress >= 80 ? "bg-[#059669]" : p.progress >= 40 ? "bg-[#7c3aed]" : "bg-[#2563eb]"}`}
                          style={{ width: `${p.progress || 0}%` }}
                        />
                      </div>
                      <div className="mt-2">
                        <p className="text-xs text-[#64748b]">
                          <span className="font-semibold text-[#374151]">Stage:</span> {p.phase}
                          {si >= 0 && <span className="text-[#94a3b8]"> · {si + 1} of {STAGES.length}</span>}
                        </p>
                        {si >= 0 && (
                          <>
                            <div className="flex gap-0.5 mt-1.5">
                              {STAGES.map((s, i) => (
                                <div key={s} title={s} className={`h-1 flex-1 rounded-full ${i <= si ? "bg-[#7c3aed]" : "bg-[#e2e8f0]"}`} />
                              ))}
                            </div>
                            <p className="text-[11px] text-[#94a3b8] mt-1.5">{STAGE_DESC[p.phase]}</p>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="px-5 py-3 flex items-center justify-between gap-2 text-sm">
                      <div>
                        <p className="text-[10px] text-[#94a3b8] uppercase tracking-wide font-semibold">Budget</p>
                        <p className="font-bold text-[#1e293b]">{fmtR(p.budget)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[#94a3b8] uppercase tracking-wide font-semibold">Billed / Spent</p>
                        <p className={`font-bold ${budgetPct > 90 ? "text-[#dc2626]" : "text-[#374151]"}`}>
                          {fmtR(p.spent)} <span className="text-xs font-normal text-[#94a3b8]">({budgetPct}%)</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-[#94a3b8] uppercase tracking-wide font-semibold">Timeline</p>
                        <p className="text-xs text-[#374151]">{p.start || "—"} → {p.end || "—"}</p>
                      </div>
                    </div>

                    {isOpen && (
                      <div className="px-5 py-3 border-t border-[#f1f5f9] bg-[#f8fafc] space-y-2">
                        <div className="flex items-center gap-2">
                          <Users className="w-3.5 h-3.5 text-[#94a3b8]" />
                          <span className="text-xs text-[#64748b]">
                            Team: <span className="text-[#374151] font-semibold">{p.crew || "Unassigned"}</span>
                          </span>
                        </div>
                        <div className="text-xs text-[#64748b]">
                          Remaining: <span className="font-bold text-[#7c3aed]">{fmtR((p.budget || 0) - (p.spent || 0))}</span>
                        </div>
                        <div className="text-xs text-[#64748b]">
                          Open tasks:{" "}
                          <span className="font-semibold text-[#374151]">
                            {tasks.filter((t) => t.projectName === p.name && t.status !== "completed").length}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ══ TASKS ══ */}
      {!nothingYet && tab === "work-orders" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard label="Total" value={tasks.length} />
            <StatCard label="In Progress" value={tasks.filter((t) => t.status === "in-progress").length} color="text-[#6d28d9]" bg="bg-[#f5f3ff]" />
            <StatCard label="Pending" value={tasks.filter((t) => t.status === "pending").length} color="text-[#2563eb]" bg="bg-[#eff6ff]" />
            <StatCard label="Overdue" value={tasks.filter(isOverdue).length} color="text-[#dc2626]" bg="bg-[#fef2f2]" />
          </div>

          {tasks.length === 0 ? (
            <EmptyState icon={ClipboardList} title="No tasks yet" onAdd={() => openTask()} addLabel="New Task" />
          ) : (
            <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#e2e8f0] bg-[#f8fafc]">
                      {["#", "Task", "Engagement", "Assigned", "Priority", "Stage", "Hrs", "Due", "Status"].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((t) => {
                      const pc = PRIORITY_CFG[t.priority] || PRIORITY_CFG.medium;
                      const sc = TASK_STATUS[t.status] || TASK_STATUS.pending;
                      return (
                        <tr key={t.id} onClick={() => openTask(t)} className="border-b border-[#f1f5f9] hover:bg-[#f8fafc] cursor-pointer transition-colors">
                          <td className="px-4 py-3 text-xs font-semibold text-[#7c3aed] whitespace-nowrap">{t.number}</td>
                          <td className="px-4 py-3 text-sm text-[#374151] min-w-[220px]">
                            <div className="font-medium">{t.task}</div>
                            {t.kind && <div className="text-[11px] text-[#94a3b8]">{t.kind}</div>}
                          </td>
                          <td className="px-4 py-3 text-xs text-[#64748b]">{t.projectName}</td>
                          <td className="px-4 py-3 text-xs text-[#374151]">{t.assignedTo || "—"}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold capitalize ${pc.cls}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${pc.dot}`} />
                              {t.priority}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-[#64748b] whitespace-nowrap">{t.phase}</td>
                          <td className="px-4 py-3 text-xs text-[#374151]">{t.estHours}</td>
                          <td className={`px-4 py-3 text-xs whitespace-nowrap ${isOverdue(t) ? "text-[#dc2626] font-semibold" : "text-[#374151]"}`}>
                            {t.dueDate || "—"}
                            {isOverdue(t) && <span className="ml-1">· overdue</span>}
                          </td>
                          <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => cycleTask(t)}
                              title="Click to advance status"
                              className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap ${sc.cls}`}
                            >
                              {sc.label}
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
        </div>
      )}

      {/* ══ RESOURCES ══ */}
      {!nothingYet && tab === "materials" && (
        <div className="space-y-4">
          {resIssues > 0 && (
            <div className="flex items-center gap-2 px-4 py-3 bg-[#fffbeb] border border-[#fde68a] rounded-xl text-sm text-[#92400e]">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              {resIssues} resource{resIssues === 1 ? "" : "s"} still missing or partial. Delivery may be blocked until they arrive.
            </div>
          )}
          {resources.length === 0 ? (
            <EmptyState icon={Layers} title="No resources tracked" hint="Track licences, seats, client assets and accounts each engagement needs." onAdd={() => openRes()} addLabel="Add Resource" />
          ) : (
            [...resByProject, ...(orphanRes.length ? [{ p: { id: "orphan", name: "Unassigned" }, rows: orphanRes }] : [])].map(({ p, rows }) => (
              <div key={p.id} className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
                <div className="px-5 py-3 bg-[#f8fafc] border-b border-[#e2e8f0]">
                  <h3 className="text-sm font-semibold text-[#1e293b]">{p.name}</h3>
                </div>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#f1f5f9]">
                      {["Resource", "Needed", "Available", "Status"].map((h) => (
                        <th key={h} className="px-5 py-2.5 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => {
                      const sc = RES_STATUS[resStatus(r.needed, r.available)];
                      return (
                        <tr key={r.id} onClick={() => openRes(r)} className="border-b border-[#f1f5f9] hover:bg-[#f8fafc] cursor-pointer">
                          <td className="px-5 py-2.5 text-sm text-[#374151]">{r.resource}</td>
                          <td className="px-5 py-2.5 text-sm text-[#374151]">{r.needed} {r.unit}</td>
                          <td className="px-5 py-2.5 text-sm text-[#374151]">{r.available} {r.unit}</td>
                          <td className="px-5 py-2.5">
                            <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${sc.cls}`}>{sc.label}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ))
          )}
        </div>
      )}

      {/* ══ MODALS ══ */}
      {modal === "project" && (
        <Modal
          wide
          title={editId ? "Edit Engagement" : "New Engagement"}
          onClose={close}
          footer={
            <>
              {editId ? (
                <button onClick={() => remove("projects", editId, setProjects, "engagement")} className="text-sm text-[#dc2626] hover:underline">Delete</button>
              ) : <span />}
              <div className="flex gap-2">
                <button onClick={close} className={ghostBtn}>Cancel</button>
                <button onClick={saveProject} disabled={saving || !projForm.name.trim()} className={primaryBtn}>{saving ? "Saving…" : "Save"}</button>
              </div>
            </>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelCls}>Engagement Name</label>
              <input className={inputCls} value={projForm.name} onChange={(e) => setProjForm({ ...projForm, name: e.target.value })} placeholder="e.g. Brightside Website Redesign" />
            </div>
            <div>
              <label className={labelCls}>Client</label>
              <input className={inputCls} value={projForm.client} onChange={(e) => setProjForm({ ...projForm, client: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Team</label>
              <input className={inputCls} value={projForm.crew} onChange={(e) => setProjForm({ ...projForm, crew: e.target.value })} placeholder="Names, comma separated" />
            </div>
            <div>
              <label className={labelCls}>Service Type</label>
              <select className={inputCls} value={projForm.type} onChange={(e) => setProjForm({ ...projForm, type: e.target.value })}>
                {SERVICE_TYPES.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Engagement Model</label>
              <select className={inputCls} value={projForm.engagementType} onChange={(e) => setProjForm({ ...projForm, engagementType: e.target.value })}>
                {ENGAGEMENT_TYPES.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Delivery Channel</label>
              <select className={inputCls} value={projForm.channel} onChange={(e) => setProjForm({ ...projForm, channel: e.target.value })}>
                {CHANNELS.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Status</label>
              <select className={inputCls} value={projForm.status} onChange={(e) => setProjForm({ ...projForm, status: e.target.value })}>
                {Object.entries(PROJ_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Stage</label>
              <select className={inputCls} value={projForm.phase} onChange={(e) => setProjForm({ ...projForm, phase: e.target.value })}>
                {STAGES.map((o) => <option key={o}>{o}</option>)}
              </select>
              <p className="text-[11px] text-[#94a3b8] mt-1">{STAGE_DESC[projForm.phase]}</p>
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Progress: {projForm.progress}%</label>
              <input type="range" min="0" max="100" step="5" value={projForm.progress} onChange={(e) => setProjForm({ ...projForm, progress: e.target.value })} className="w-full accent-[#7c3aed]" />
            </div>
            <div>
              <label className={labelCls}>Budget (R)</label>
              <input type="number" className={inputCls} value={projForm.budget} onChange={(e) => setProjForm({ ...projForm, budget: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Billed / Spent (R)</label>
              <input type="number" className={inputCls} value={projForm.spent} onChange={(e) => setProjForm({ ...projForm, spent: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Start</label>
              <input type="date" className={inputCls} value={projForm.start} onChange={(e) => setProjForm({ ...projForm, start: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>End</label>
              <input type="date" className={inputCls} value={projForm.end} onChange={(e) => setProjForm({ ...projForm, end: e.target.value })} />
            </div>
          </div>
        </Modal>
      )}

      {modal === "task" && (
        <Modal
          title={editId ? "Edit Task" : "New Task"}
          onClose={close}
          footer={
            <>
              {editId ? (
                <button onClick={() => remove("workOrders", editId, setTasks, "task")} className="text-sm text-[#dc2626] hover:underline">Delete</button>
              ) : <span />}
              <div className="flex gap-2">
                <button onClick={close} className={ghostBtn}>Cancel</button>
                <button onClick={saveTask} disabled={saving || !taskForm.task.trim()} className={primaryBtn}>{saving ? "Saving…" : "Save"}</button>
              </div>
            </>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelCls}>Task / Deliverable</label>
              <input className={inputCls} value={taskForm.task} onChange={(e) => setTaskForm({ ...taskForm, task: e.target.value })} placeholder="e.g. Homepage designs (Figma)" />
            </div>
            <div>
              <label className={labelCls}>Kind</label>
              <select className={inputCls} value={taskForm.kind} onChange={(e) => setTaskForm({ ...taskForm, kind: e.target.value })}>
                {TASK_KINDS.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Engagement</label>
              <select className={inputCls} value={taskForm.projectName} onChange={(e) => setTaskForm({ ...taskForm, projectName: e.target.value })}>
                {taskForm.projectName && !projects.some((p) => p.name === taskForm.projectName) && <option>{taskForm.projectName}</option>}
                {projects.length === 0 && <option value="">No engagements yet</option>}
                {projects.map((p) => <option key={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Assigned To</label>
              <input className={inputCls} value={taskForm.assignedTo} onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Priority</label>
              <select className={inputCls} value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Stage</label>
              <select className={inputCls} value={taskForm.phase} onChange={(e) => setTaskForm({ ...taskForm, phase: e.target.value })}>
                {STAGES.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Status</label>
              <select className={inputCls} value={taskForm.status} onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}>
                {TASK_CYCLE.map((k) => <option key={k} value={k}>{TASK_STATUS[k].label}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Est. Hours</label>
              <input type="number" step="0.5" className={inputCls} value={taskForm.estHours} onChange={(e) => setTaskForm({ ...taskForm, estHours: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Due Date</label>
              <input type="date" className={inputCls} value={taskForm.dueDate} onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })} />
            </div>
          </div>
        </Modal>
      )}

      {modal === "resource" && (
        <Modal
          title={editId ? "Edit Resource" : "Add Resource"}
          onClose={close}
          footer={
            <>
              {editId ? (
                <button onClick={() => remove("materials", editId, setResources, "resource")} className="text-sm text-[#dc2626] hover:underline">Delete</button>
              ) : <span />}
              <div className="flex gap-2">
                <button onClick={close} className={ghostBtn}>Cancel</button>
                <button onClick={saveResource} disabled={saving || !resForm.resource.trim()} className={primaryBtn}>{saving ? "Saving…" : "Save"}</button>
              </div>
            </>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelCls}>Resource</label>
              <input className={inputCls} value={resForm.resource} onChange={(e) => setResForm({ ...resForm, resource: e.target.value })} placeholder="e.g. Figma editor seats, client logo files, hosting access" />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Engagement</label>
              <select className={inputCls} value={resForm.projectName} onChange={(e) => setResForm({ ...resForm, projectName: e.target.value })}>
                {resForm.projectName && !projects.some((p) => p.name === resForm.projectName) && <option>{resForm.projectName}</option>}
                {projects.length === 0 && <option value="">No engagements yet</option>}
                {projects.map((p) => <option key={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Needed</label>
              <input type="number" className={inputCls} value={resForm.needed} onChange={(e) => setResForm({ ...resForm, needed: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Available</label>
              <input type="number" className={inputCls} value={resForm.available} onChange={(e) => setResForm({ ...resForm, available: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Unit</label>
              <select className={inputCls} value={resForm.unit} onChange={(e) => setResForm({ ...resForm, unit: e.target.value })}>
                {RES_UNITS.map((u) => <option key={u}>{u}</option>)}
              </select>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
