import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  orderBy,
  query,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "../../firebase";
import {
  Layers,
  ClipboardList,
  Ruler,
  Wrench,
  Plus,
  X,
  ChevronRight,
  Users,
  AlertTriangle,
  Loader2,
} from "lucide-react";

// ── Tab config ────────────────────────────────────────────────────────────────
const TABS = [
  { id: "projects", label: "Active Projects", icon: Layers },
  { id: "measure", label: "Measure & Estimate", icon: Ruler },
  { id: "work-orders", label: "Work Orders", icon: ClipboardList },
  { id: "installations", label: "Installation Jobs", icon: Wrench },
];

// ── Flooring-specific seed data ───────────────────────────────────────────────
const PROJECT_SEED = [
  {
    name: "Sandton Penthouse",
    client: "Mark Reeves",
    type: "Hardwood",
    area: 320,
    phase: "Installation",
    status: "active",
    progress: 70,
    budget: 185000,
    spent: 129500,
    crew: "Johan, Sipho",
    start: "2025-02-10",
    end: "2025-03-20",
  },
  {
    name: "Rosebank Office Fit-out",
    client: "TechSpace (Pty) Ltd",
    type: "LVT Vinyl",
    area: 1200,
    phase: "Screed & Prep",
    status: "active",
    progress: 35,
    budget: 420000,
    spent: 147000,
    crew: "Andile, Pieter",
    start: "2025-02-20",
    end: "2025-05-10",
  },
  {
    name: "Fourways Mall Retail",
    client: "Retail Concepts SA",
    type: "Ceramic Tile",
    area: 650,
    phase: "Grouting",
    status: "active",
    progress: 85,
    budget: 210000,
    spent: 178500,
    crew: "Sipho, Blessing",
    start: "2025-01-15",
    end: "2025-03-05",
  },
  {
    name: "Hyde Park Residence",
    client: "Carel van der Berg",
    type: "Engineered Oak",
    area: 480,
    phase: "Planning",
    status: "on-hold",
    progress: 10,
    budget: 156000,
    spent: 15600,
    crew: "TBD",
    start: "2025-03-15",
    end: "2025-04-30",
  },
  {
    name: "Melrose Arch Apartment",
    client: "Priya Naidoo",
    type: "Laminate",
    area: 95,
    phase: "Pre-production",
    status: "planning",
    progress: 0,
    budget: 28500,
    spent: 0,
    crew: "TBD",
    start: "2025-04-01",
    end: "2025-04-20",
  },
];

const MEASURE_SEED = [
  {
    refNo: "MSR-001",
    client: "Sandton Penthouse",
    address: "12 Rivonia Rd, Sandton",
    measuredBy: "Johan",
    date: "2025-02-05",
    area: 320,
    flooringType: "Hardwood",
    wastage: 10,
    totalMaterial: 352,
    ratePerSqm: 580,
    estimatedCost: 204160,
    status: "approved",
  },
  {
    refNo: "MSR-002",
    client: "Rosebank Office Fit-out",
    address: "1 Bath Ave, Rosebank",
    measuredBy: "Pieter",
    date: "2025-02-15",
    area: 1200,
    flooringType: "LVT Vinyl",
    wastage: 8,
    totalMaterial: 1296,
    ratePerSqm: 320,
    estimatedCost: 414720,
    status: "approved",
  },
  {
    refNo: "MSR-003",
    client: "Parkhurst Home",
    address: "45 7th Ave, Parkhurst",
    measuredBy: "Andile",
    date: "2025-02-28",
    area: 210,
    flooringType: "Engineered Oak",
    wastage: 12,
    totalMaterial: 235,
    ratePerSqm: 620,
    estimatedCost: 145700,
    status: "pending",
  },
  {
    refNo: "MSR-004",
    client: "Bryanston Business Park",
    address: "3 Maxwell Drive, Bryanston",
    measuredBy: "Johan",
    date: "2025-03-02",
    area: 800,
    flooringType: "Epoxy Screed",
    wastage: 5,
    totalMaterial: 840,
    ratePerSqm: 280,
    estimatedCost: 235200,
    status: "pending",
  },
  {
    refNo: "MSR-005",
    client: "Linden Duplex",
    address: "22 Rustenburg Rd, Linden",
    measuredBy: "Sipho",
    date: "2025-03-05",
    area: 145,
    flooringType: "Laminate",
    wastage: 10,
    totalMaterial: 160,
    ratePerSqm: 195,
    estimatedCost: 31200,
    status: "quoted",
  },
];

const WO_SEED = [
  {
    number: "WO-001",
    project: "Sandton Penthouse",
    task: "Screed preparation & levelling",
    assigned: "Pieter",
    priority: "high",
    status: "completed",
    phase: "Phase 1",
    estHours: 16,
    dueDate: "2025-02-12",
  },
  {
    number: "WO-002",
    project: "Sandton Penthouse",
    task: "Hardwood board installation — Lounge",
    assigned: "Johan",
    priority: "high",
    status: "in-progress",
    phase: "Phase 2",
    estHours: 24,
    dueDate: "2025-02-28",
  },
  {
    number: "WO-003",
    project: "Rosebank Office Fit-out",
    task: "Sub-floor DPM membrane installation",
    assigned: "Andile, Sipho",
    priority: "medium",
    status: "completed",
    phase: "Phase 1",
    estHours: 8,
    dueDate: "2025-02-22",
  },
  {
    number: "WO-004",
    project: "Fourways Mall Retail",
    task: "Tile grout — Section A & B",
    assigned: "Sipho",
    priority: "high",
    status: "in-progress",
    phase: "Phase 3",
    estHours: 12,
    dueDate: "2025-03-01",
  },
  {
    number: "WO-005",
    project: "Hyde Park Residence",
    task: "Site measure & moisture test",
    assigned: "Pieter",
    priority: "medium",
    status: "pending",
    phase: "Phase 1",
    estHours: 4,
    dueDate: "2025-03-18",
  },
  {
    number: "WO-006",
    project: "Rosebank Office Fit-out",
    task: "LVT plank layout and installation",
    assigned: "Andile, Pieter",
    priority: "high",
    status: "pending",
    phase: "Phase 2",
    estHours: 40,
    dueDate: "2025-04-01",
  },
  {
    number: "WO-007",
    project: "Fourways Mall Retail",
    task: "Skirting & transition strip installation",
    assigned: "Blessing",
    priority: "low",
    status: "pending",
    phase: "Phase 3",
    estHours: 6,
    dueDate: "2025-03-04",
  },
];

const INSTALL_SEED = [
  {
    number: "INS-001",
    project: "Sandton Penthouse",
    flooringType: "Hardwood 130mm",
    area: 320,
    crew: "Johan, Sipho",
    startDate: "2025-02-15",
    endDate: "2025-03-15",
    status: "in-progress",
    technique: "Glue-down",
    notes: "Herringbone pattern — master bedroom direct stick",
  },
  {
    number: "INS-002",
    project: "Rosebank Office Fit-out",
    flooringType: "LVT Plank 5mm",
    area: 1200,
    crew: "Andile, Pieter",
    startDate: "2025-03-10",
    endDate: "2025-04-30",
    status: "scheduled",
    technique: "Click float",
    notes: "Full building — 3 floors, start from top",
  },
  {
    number: "INS-003",
    project: "Fourways Mall Retail",
    flooringType: "Ceramic 600x600",
    area: 650,
    crew: "Sipho, Blessing",
    startDate: "2025-01-20",
    endDate: "2025-03-05",
    status: "in-progress",
    technique: "Adhesive set",
    notes: "Large format tile on screed base",
  },
  {
    number: "INS-004",
    project: "Hyde Park Residence",
    flooringType: "Engineered Oak",
    area: 480,
    crew: "TBD",
    startDate: "2025-03-20",
    endDate: "2025-04-25",
    status: "pending",
    technique: "Secret nail",
    notes: "Awaiting client sign-off on species selection",
  },
];

// ── Status configs ────────────────────────────────────────────────────────────
const PROJ_STATUS = {
  active: { label: "Active", cls: "bg-[#dcfce7] text-[#166534]" },
  "on-hold": { label: "On Hold", cls: "bg-[#fef3c7] text-[#92400e]" },
  planning: { label: "Planning", cls: "bg-[#eff6ff] text-[#1d4ed8]" },
  completed: { label: "Completed", cls: "bg-[#f1f5f9] text-[#475569]" },
};

const MEASURE_STATUS = {
  pending: { label: "Pending", cls: "bg-[#eff6ff] text-[#1d4ed8]" },
  quoted: { label: "Quoted", cls: "bg-[#fef3c7] text-[#92400e]" },
  approved: { label: "Approved", cls: "bg-[#dcfce7] text-[#166534]" },
};

const WO_STATUS = {
  pending: { label: "Pending", cls: "bg-[#eff6ff] text-[#1d4ed8]" },
  "in-progress": { label: "In Progress", cls: "bg-[#fff7ed] text-[#c2410c]" },
  completed: { label: "Completed", cls: "bg-[#dcfce7] text-[#166534]" },
};
const WO_STATUS_CYCLE = ["pending", "in-progress", "completed"];

const INSTALL_STATUS = {
  pending: { label: "Pending", cls: "bg-[#eff6ff] text-[#1d4ed8]" },
  scheduled: { label: "Scheduled", cls: "bg-[#fef3c7] text-[#92400e]" },
  "in-progress": { label: "In Progress", cls: "bg-[#fff7ed] text-[#c2410c]" },
  completed: { label: "Completed", cls: "bg-[#dcfce7] text-[#166534]" },
};

const PRIORITY_CFG = {
  high: { cls: "bg-[#fef2f2] text-[#dc2626]", dot: "bg-[#dc2626]" },
  medium: { cls: "bg-[#fffbeb] text-[#d97706]", dot: "bg-[#d97706]" },
  low: { cls: "bg-[#f0fdf4] text-[#16a34a]", dot: "bg-[#16a34a]" },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const inputCls =
  "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-lg bg-white text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#d97706]";
const labelCls =
  "block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1";
const fmtR = (n) =>
  `R${(n || 0).toLocaleString("en-ZA", { maximumFractionDigits: 0 })}`;

async function seedIfEmpty(colRef, seedData) {
  const snap = await getDocs(query(colRef, orderBy("createdAt", "asc")));
  if (!snap.empty) return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const batch = writeBatch(colRef.firestore);
  seedData.forEach((item) =>
    batch.set(doc(colRef), { ...item, createdAt: serverTimestamp() }),
  );
  await batch.commit();
  const snap2 = await getDocs(query(colRef, orderBy("createdAt", "asc")));
  return snap2.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function FlooringProjectsView({
  user,
  defaultTab = "projects",
}) {
  const [tab, setTab] = useState(defaultTab);
  const [projects, setProjects] = useState([]);
  const [measures, setMeasures] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [installs, setInstalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [showWOModal, setShowWOModal] = useState(false);
  const [editWOId, setEditWOId] = useState(null);

  const WO_BLANK = {
    task: "",
    project: "Sandton Penthouse",
    assigned: "",
    priority: "medium",
    phase: "Phase 1",
    estHours: "",
    dueDate: "",
    status: "pending",
  };
  const [woForm, setWoForm] = useState(WO_BLANK);

  const projectsCol = () =>
    collection(db, "users", user.uid, "flooringProjects");
  const measuresCol = () =>
    collection(db, "users", user.uid, "flooringMeasures");
  const workOrdersCol = () =>
    collection(db, "users", user.uid, "flooringWorkOrders");
  const installsCol = () =>
    collection(db, "users", user.uid, "flooringInstallations");

  useEffect(() => {
    setTab(defaultTab);
  }, [defaultTab]);

  useEffect(() => {
    if (!user?.uid) return;
    (async () => {
      setLoading(true);
      try {
        const [p, m, w, i] = await Promise.all([
          seedIfEmpty(projectsCol(), PROJECT_SEED),
          seedIfEmpty(measuresCol(), MEASURE_SEED),
          seedIfEmpty(workOrdersCol(), WO_SEED),
          seedIfEmpty(installsCol(), INSTALL_SEED),
        ]);
        setProjects(p);
        setMeasures(m);
        setWorkOrders(w);
        setInstalls(i);
      } catch (e) {
        console.error("FlooringProjects load:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.uid]);

  const cycleWOStatus = async (id) => {
    const wo = workOrders.find((w) => w.id === id);
    if (!wo) return;
    const next =
      WO_STATUS_CYCLE[
        (WO_STATUS_CYCLE.indexOf(wo.status) + 1) % WO_STATUS_CYCLE.length
      ];
    try {
      await updateDoc(doc(db, "users", user.uid, "flooringWorkOrders", id), {
        status: next,
        updatedAt: serverTimestamp(),
      });
      setWorkOrders((prev) =>
        prev.map((w) => (w.id === id ? { ...w, status: next } : w)),
      );
    } catch (e) {
      console.error(e);
    }
  };

  const openAddWO = () => {
    setWoForm(WO_BLANK);
    setEditWOId(null);
    setShowWOModal(true);
  };
  const openEditWO = (wo) => {
    setWoForm({ ...wo, estHours: String(wo.estHours) });
    setEditWOId(wo.id);
    setShowWOModal(true);
  };

  const handleSaveWO = async () => {
    if (!woForm.task.trim()) return;
    setSaving(true);
    const payload = {
      task: woForm.task.trim(),
      project: woForm.project,
      assigned: woForm.assigned.trim(),
      priority: woForm.priority,
      phase: woForm.phase,
      estHours: Number(woForm.estHours) || 0,
      dueDate: woForm.dueDate,
      status: woForm.status,
    };
    try {
      if (editWOId) {
        await updateDoc(
          doc(db, "users", user.uid, "flooringWorkOrders", editWOId),
          { ...payload, updatedAt: serverTimestamp() },
        );
        setWorkOrders((prev) =>
          prev.map((w) => (w.id === editWOId ? { ...w, ...payload } : w)),
        );
      } else {
        const n = `WO-${String(workOrders.length + 1).padStart(3, "0")}`;
        const ref = await addDoc(workOrdersCol(), {
          ...payload,
          number: n,
          createdAt: serverTimestamp(),
        });
        setWorkOrders((prev) => [
          ...prev,
          { id: ref.id, number: n, ...payload },
        ]);
      }
      setShowWOModal(false);
    } catch (e) {
      alert("Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteWO = async (id) => {
    if (!window.confirm("Delete this work order?")) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "flooringWorkOrders", id));
      setWorkOrders((prev) => prev.filter((w) => w.id !== id));
      setShowWOModal(false);
    } catch (e) {
      alert("Failed to delete.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 gap-3 text-[#64748b]">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Loading projects…</span>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-bold text-[#1e293b]">
            Flooring Projects
          </h1>
          <p className="text-xs text-[#64748b] mt-0.5">
            Track jobs, estimates and installations
          </p>
        </div>
        {tab === "work-orders" && (
          <button
            onClick={openAddWO}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#d97706] hover:bg-[#b45309] text-white text-sm font-medium rounded-lg shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Work Order
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#e2e8f0] overflow-x-auto">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-all whitespace-nowrap flex-shrink-0 ${tab === id ? "border-[#d97706] text-[#d97706] bg-[#fffbeb]" : "border-transparent text-[#64748b] hover:text-[#374151]"}`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* ── ACTIVE PROJECTS ── */}
      {tab === "projects" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              {
                label: "Total",
                value: projects.length,
                color: "text-[#1e293b]",
                bg: "bg-[#f8fafc]",
              },
              {
                label: "Active",
                value: projects.filter((p) => p.status === "active").length,
                color: "text-[#059669]",
                bg: "bg-[#f0fdf4]",
              },
              {
                label: "On Hold",
                value: projects.filter((p) => p.status === "on-hold").length,
                color: "text-[#d97706]",
                bg: "bg-[#fffbeb]",
              },
              {
                label: "Total Value",
                value: fmtR(projects.reduce((s, p) => s + (p.budget || 0), 0)),
                color: "text-[#2563eb]",
                bg: "bg-[#eff6ff]",
              },
            ].map(({ label, value, color, bg }) => (
              <div
                key={label}
                className={`${bg} border border-[#e2e8f0] rounded-xl p-4`}
              >
                <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wide mb-1">
                  {label}
                </p>
                <p className={`text-xl font-bold ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {projects.map((p) => {
              const { label: sLabel, cls: sCls } = PROJ_STATUS[p.status] || {};
              const budgetPct =
                p.budget > 0
                  ? Math.round(((p.spent || 0) / p.budget) * 100)
                  : 0;
              const isExpanded = expanded === p.id;
              return (
                <div
                  key={p.id}
                  className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="px-5 py-4 border-b border-[#f1f5f9]">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${sCls}`}
                          >
                            {sLabel}
                          </span>
                          <span className="text-xs text-[#64748b]">
                            {p.type}
                          </span>
                          <span className="text-xs text-[#94a3b8]">
                            {p.area} sqm
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-[#1e293b] truncate">
                          {p.name}
                        </h3>
                        <p className="text-xs text-[#64748b] mt-0.5">
                          {p.client}
                        </p>
                      </div>
                      <button
                        onClick={() => setExpanded(isExpanded ? null : p.id)}
                        className="p-1.5 text-[#94a3b8] hover:text-[#374151] hover:bg-[#f8fafc] rounded-lg flex-shrink-0"
                      >
                        <ChevronRight
                          className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}
                        />
                      </button>
                    </div>
                  </div>
                  <div className="px-5 py-3 border-b border-[#f1f5f9]">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-[#64748b] uppercase tracking-wide">
                        Progress
                      </span>
                      <span className="text-xs font-bold text-[#1e293b]">
                        {p.progress}%
                      </span>
                    </div>
                    <div className="w-full bg-[#f1f5f9] rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${p.progress >= 80 ? "bg-[#059669]" : p.progress >= 40 ? "bg-[#d97706]" : "bg-[#2563eb]"}`}
                        style={{ width: `${p.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-[#64748b] mt-1.5">{p.phase}</p>
                  </div>
                  <div className="px-5 py-3 flex items-center justify-between gap-2 text-sm">
                    <div>
                      <p className="text-[10px] text-[#94a3b8] uppercase tracking-wide font-semibold">
                        Budget
                      </p>
                      <p className="font-bold text-[#1e293b]">
                        {fmtR(p.budget)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#94a3b8] uppercase tracking-wide font-semibold">
                        Spent
                      </p>
                      <p
                        className={`font-bold ${budgetPct > 90 ? "text-[#dc2626]" : "text-[#374151]"}`}
                      >
                        {fmtR(p.spent)}{" "}
                        <span className="text-xs font-normal text-[#94a3b8]">
                          ({budgetPct}%)
                        </span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-[#94a3b8] uppercase tracking-wide font-semibold">
                        Timeline
                      </p>
                      <p className="text-xs text-[#374151]">
                        {p.start} → {p.end}
                      </p>
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="px-5 py-3 border-t border-[#f1f5f9] bg-[#f8fafc] space-y-1.5">
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-[#94a3b8]" />
                        <span className="text-xs text-[#64748b]">
                          Crew:{" "}
                          <span className="font-semibold text-[#374151]">
                            {p.crew}
                          </span>
                        </span>
                      </div>
                      <div className="text-xs text-[#64748b]">
                        Remaining:{" "}
                        <span className="font-bold text-[#2563eb]">
                          {fmtR((p.budget || 0) - (p.spent || 0))}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── MEASURE & ESTIMATE ── */}
      {tab === "measure" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              {
                label: "Total Measures",
                value: measures.length,
                color: "text-[#1e293b]",
                bg: "bg-[#f8fafc]",
              },
              {
                label: "Approved",
                value: measures.filter((m) => m.status === "approved").length,
                color: "text-[#059669]",
                bg: "bg-[#f0fdf4]",
              },
              {
                label: "Estimated Value",
                value: fmtR(
                  measures.reduce((s, m) => s + (m.estimatedCost || 0), 0),
                ),
                color: "text-[#d97706]",
                bg: "bg-[#fffbeb]",
              },
            ].map(({ label, value, color, bg }) => (
              <div
                key={label}
                className={`${bg} border border-[#e2e8f0] rounded-xl p-4`}
              >
                <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wide mb-1">
                  {label}
                </p>
                <p className={`text-xl font-bold ${color}`}>{value}</p>
              </div>
            ))}
          </div>
          <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#e2e8f0] bg-[#f8fafc]">
                    {[
                      "Ref",
                      "Client",
                      "Address",
                      "Measured by",
                      "Area (sqm)",
                      "Flooring Type",
                      "Wastage %",
                      "Total Sqm",
                      "Rate/sqm",
                      "Estimated Cost",
                      "Status",
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
                <tbody>
                  {measures.map((m) => {
                    const { label: mLabel, cls: mCls } =
                      MEASURE_STATUS[m.status] || {};
                    return (
                      <tr
                        key={m.id}
                        className="border-b border-[#f1f5f9] hover:bg-[#f8fafc] transition-colors"
                      >
                        <td className="px-4 py-3 text-xs font-bold text-[#d97706]">
                          {m.refNo}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-[#374151]">
                          {m.client}
                        </td>
                        <td className="px-4 py-3 text-xs text-[#64748b]">
                          {m.address}
                        </td>
                        <td className="px-4 py-3 text-xs text-[#374151]">
                          {m.measuredBy}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-[#1e293b]">
                          {m.area}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex px-2 py-0.5 rounded text-xs font-semibold bg-[#fef3c7] text-[#92400e]">
                            {m.flooringType}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-[#374151]">
                          {m.wastage}%
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-[#1e293b]">
                          {m.totalMaterial}
                        </td>
                        <td className="px-4 py-3 text-sm text-[#374151]">
                          R{m.ratePerSqm}
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-[#d97706]">
                          {fmtR(m.estimatedCost)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${mCls}`}
                          >
                            {mLabel}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── WORK ORDERS ── */}
      {tab === "work-orders" && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {[
              {
                label: "Total",
                value: workOrders.length,
                color: "text-[#1e293b]",
                bg: "bg-[#f8fafc]",
              },
              {
                label: "In Progress",
                value: workOrders.filter((w) => w.status === "in-progress")
                  .length,
                color: "text-[#c2410c]",
                bg: "bg-[#fff7ed]",
              },
              {
                label: "Pending",
                value: workOrders.filter((w) => w.status === "pending").length,
                color: "text-[#2563eb]",
                bg: "bg-[#eff6ff]",
              },
            ].map(({ label, value, color, bg }) => (
              <div
                key={label}
                className={`${bg} border border-[#e2e8f0] rounded-xl p-4`}
              >
                <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wide mb-1">
                  {label}
                </p>
                <p className={`text-xl font-bold ${color}`}>{value}</p>
              </div>
            ))}
          </div>
          <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#e2e8f0] bg-[#f8fafc]">
                    {[
                      "#",
                      "Task",
                      "Project",
                      "Assigned",
                      "Priority",
                      "Phase",
                      "Hrs",
                      "Due",
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
                <tbody>
                  {workOrders.map((wo) => {
                    const { label: sLabel, cls: sCls } =
                      WO_STATUS[wo.status] || {};
                    const { cls: pCls, dot: pDot } =
                      PRIORITY_CFG[wo.priority] || {};
                    return (
                      <tr
                        key={wo.id}
                        className="border-b border-[#f1f5f9] hover:bg-[#f8fafc] cursor-pointer"
                        onClick={() => openEditWO(wo)}
                      >
                        <td className="px-4 py-3 text-xs font-bold text-[#94a3b8]">
                          {wo.number}
                        </td>
                        <td
                          className="px-4 py-3 text-sm font-medium text-[#1e293b]"
                          style={{ maxWidth: 200 }}
                        >
                          <div className="truncate">{wo.task}</div>
                        </td>
                        <td className="px-4 py-3 text-xs text-[#64748b] whitespace-nowrap">
                          {wo.project}
                        </td>
                        <td className="px-4 py-3 text-xs text-[#374151] whitespace-nowrap">
                          {wo.assigned || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${pCls}`}
                          >
                            <div
                              className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${pDot}`}
                            />
                            {wo.priority?.charAt(0).toUpperCase() +
                              wo.priority?.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-[#64748b] whitespace-nowrap">
                          {wo.phase}
                        </td>
                        <td className="px-4 py-3 text-sm text-[#374151] whitespace-nowrap">
                          {wo.estHours}h
                        </td>
                        <td className="px-4 py-3 text-xs text-[#64748b] whitespace-nowrap">
                          {wo.dueDate || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${sCls}`}
                          >
                            {sLabel}
                          </span>
                        </td>
                        <td
                          className="px-4 py-3"
                          onClick={(e) => {
                            e.stopPropagation();
                            cycleWOStatus(wo.id);
                          }}
                        >
                          <button
                            title="Advance status"
                            className="w-7 h-7 flex items-center justify-center text-[#94a3b8] hover:text-[#d97706] hover:bg-[#fffbeb] rounded-lg text-base"
                          >
                            ↻
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── INSTALLATIONS ── */}
      {tab === "installations" && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {[
              {
                label: "Total Jobs",
                value: installs.length,
                color: "text-[#1e293b]",
                bg: "bg-[#f8fafc]",
              },
              {
                label: "In Progress",
                value: installs.filter((i) => i.status === "in-progress")
                  .length,
                color: "text-[#c2410c]",
                bg: "bg-[#fff7ed]",
              },
              {
                label: "Scheduled",
                value: installs.filter((i) => i.status === "scheduled").length,
                color: "text-[#2563eb]",
                bg: "bg-[#eff6ff]",
              },
            ].map(({ label, value, color, bg }) => (
              <div
                key={label}
                className={`${bg} border border-[#e2e8f0] rounded-xl p-4`}
              >
                <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wide mb-1">
                  {label}
                </p>
                <p className={`text-xl font-bold ${color}`}>{value}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-4">
            {installs.map((inst) => {
              const { label: sLabel, cls: sCls } =
                INSTALL_STATUS[inst.status] || {};
              return (
                <div
                  key={inst.id}
                  className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm p-5"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-bold text-[#d97706]">
                          {inst.number}
                        </span>
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${sCls}`}
                        >
                          {sLabel}
                        </span>
                        <span className="inline-flex px-2 py-0.5 rounded text-xs font-semibold bg-[#fef3c7] text-[#92400e]">
                          {inst.flooringType}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-[#1e293b]">
                        {inst.project}
                      </h3>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-[#94a3b8]">{inst.area} sqm</p>
                      <p className="text-xs font-semibold text-[#374151]">
                        {inst.technique}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-[#64748b] border-t border-[#f1f5f9] pt-3">
                    <div>
                      <span className="font-semibold text-[#374151]">
                        Crew:{" "}
                      </span>
                      {inst.crew}
                    </div>
                    <div>
                      <span className="font-semibold text-[#374151]">
                        Start:{" "}
                      </span>
                      {inst.startDate}
                    </div>
                    <div>
                      <span className="font-semibold text-[#374151]">
                        End:{" "}
                      </span>
                      {inst.endDate}
                    </div>
                    <div className="col-span-2 sm:col-span-3">
                      <span className="font-semibold text-[#374151]">
                        Notes:{" "}
                      </span>
                      {inst.notes}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Work Order Modal */}
      {showWOModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg border border-[#e2e8f0]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0]">
              <h2 className="text-base font-semibold text-[#1e293b]">
                {editWOId ? "Edit Work Order" : "New Work Order"}
              </h2>
              <button
                onClick={() => setShowWOModal(false)}
                className="p-1.5 text-[#64748b] hover:text-[#1e293b] hover:bg-[#e2e8f0] rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className={labelCls}>Task *</label>
                <input
                  value={woForm.task}
                  onChange={(e) =>
                    setWoForm((f) => ({ ...f, task: e.target.value }))
                  }
                  placeholder="e.g. Screed preparation & levelling"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Project</label>
                <select
                  value={woForm.project}
                  onChange={(e) =>
                    setWoForm((f) => ({ ...f, project: e.target.value }))
                  }
                  className={inputCls}
                >
                  {projects.map((p) => (
                    <option key={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Phase</label>
                <select
                  value={woForm.phase}
                  onChange={(e) =>
                    setWoForm((f) => ({ ...f, phase: e.target.value }))
                  }
                  className={inputCls}
                >
                  {["Phase 1", "Phase 2", "Phase 3", "Final"].map((ph) => (
                    <option key={ph}>{ph}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Assigned To</label>
                <input
                  value={woForm.assigned}
                  onChange={(e) =>
                    setWoForm((f) => ({ ...f, assigned: e.target.value }))
                  }
                  placeholder="e.g. Johan, Sipho"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Priority</label>
                <select
                  value={woForm.priority}
                  onChange={(e) =>
                    setWoForm((f) => ({ ...f, priority: e.target.value }))
                  }
                  className={inputCls}
                >
                  {["high", "medium", "low"].map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Est. Hours</label>
                <input
                  type="number"
                  value={woForm.estHours}
                  onChange={(e) =>
                    setWoForm((f) => ({ ...f, estHours: e.target.value }))
                  }
                  placeholder="0"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Due Date</label>
                <input
                  type="date"
                  value={woForm.dueDate}
                  onChange={(e) =>
                    setWoForm((f) => ({ ...f, dueDate: e.target.value }))
                  }
                  className={inputCls}
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-[#e2e8f0] flex items-center justify-between">
              {editWOId ? (
                <button
                  onClick={() => handleDeleteWO(editWOId)}
                  className="px-4 py-2 text-sm font-medium text-[#dc2626] bg-[#fef2f2] border border-[#fecaca] rounded-lg hover:bg-[#fee2e2]"
                >
                  Delete
                </button>
              ) : (
                <div />
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowWOModal(false)}
                  className="px-4 py-2 text-sm font-medium text-[#64748b] bg-[#f8fafc] border border-[#e2e8f0] rounded-lg hover:bg-[#e2e8f0]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveWO}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#d97706] hover:bg-[#b45309] rounded-lg shadow-sm disabled:opacity-60"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editWOId ? "Update" : "Create"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
