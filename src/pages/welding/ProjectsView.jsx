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
  Flame,
  ClipboardList,
  Package,
  Plus,
  X,
  ChevronRight,
  Users,
  AlertTriangle,
  Loader2,
} from "lucide-react";

// ── Tab config ────────────────────────────────────────────────────────────────
const TABS = [
  { id: "projects", label: "Active Jobs", icon: Flame },
  { id: "work-orders", label: "Work Orders", icon: ClipboardList },
  { id: "materials", label: "Steel & Consumables", icon: Package },
];

// -- Welding & fabrication production stages -----------------------------------
export const PROJECT_STAGES = [
  "Quote & Site Measure",
  "Material Ordering",
  "Cutting & Prep",
  "Fit-up & Tack",
  "Welding",
  "Grinding & Finishing",
  "NDT / Inspection & QC",
  "Surface Treatment",
  "Ready for Delivery / Install",
  "Installed & Signed Off",
];

const STAGE_DESC = {
  "Quote & Site Measure": "Enquiry, site visit, measurements, drawings, quote and deposit.",
  "Material Ordering": "Steel, pipe, plate and consumables ordered; mill certificates requested.",
  "Cutting & Prep": "Cutting, bevelling, drilling and cleaning of material ready for fit-up.",
  "Fit-up & Tack": "Assemble components in jigs and tack weld; check dimensions and squareness.",
  "Welding": "Complete welds to the WPS using the specified process, certified welders only where required.",
  "Grinding & Finishing": "Grind back welds, remove spatter and slag, deburr and dress edges.",
  "NDT / Inspection & QC": "Visual, dye-penetrant, magnetic particle or other testing; weld log and sign-off.",
  "Surface Treatment": "Sand/shot blasting, galvanising, painting or powder coating.",
  "Ready for Delivery / Install": "Packed, balance invoiced, delivery or on-site installation booked.",
  "Installed & Signed Off": "Installed on site, client walk-through done and completion certificate issued.",
};

export const ORDER_TYPES = [
  "Customer Job (Repair / Maintenance)",
  "Custom Fabrication (Made to Order)",
  "On-site / Installation Job",
  "Stock Build (Standard Products)",
];

const stageIndex = (phase) => PROJECT_STAGES.indexOf(phase);
const stageOptions = (current) =>
  current && !PROJECT_STAGES.includes(current)
    ? [current, ...PROJECT_STAGES]
    : PROJECT_STAGES;

// ── Seed data ─────────────────────────────────────────────────────────────────
const PROJECT_SEED = [
  { name: "Sasol Pipeline Section A", client: "Sasol Contractors", type: "Pipe Welding", orderType: "On-site / Installation Job", material: "Mild Steel", process: "TIG/GTAW", status: "active", progress: 65, budget: 185000, spent: 120250, start: "2026-10-05", end: "2026-11-27", crew: "Sipho, Thabo, Pieter", phase: "Welding" },
  { name: "Riverside Mall Steel Structure", client: "Riverside Properties", type: "Structural Welding", orderType: "Custom Fabrication (Made to Order)", material: "Mild Steel", process: "MIG/GMAW", status: "active", progress: 30, budget: 420000, spent: 126000, start: "2026-10-19", end: "2026-12-18", crew: "Johan, Andile, Pieter", phase: "Fit-up & Tack" },
  { name: "Engen Depot Tank Repair", client: "Engen Depot", type: "Metal Repairs", orderType: "Customer Job (Repair / Maintenance)", material: "Stainless Steel", process: "TIG/GTAW", status: "active", progress: 85, budget: 76000, spent: 64600, start: "2026-10-12", end: "2026-11-06", crew: "Certified welders", phase: "NDT / Inspection & QC" },
  { name: "Van der Merwe Security Gate", client: "Hendrik van der Merwe", type: "Custom Fabrication", orderType: "Custom Fabrication (Made to Order)", material: "Galvanized Steel", process: "MIG/GMAW", status: "on-hold", progress: 20, budget: 18500, spent: 3700, start: "2026-11-09", end: "2026-11-27", crew: "TBD", phase: "Material Ordering" },
  { name: "Standard Braai Stand Batch (x20)", client: "Workshop Stock", type: "Stock Product Build", orderType: "Stock Build (Standard Products)", material: "Mild Steel", process: "Flux-Cored", status: "active", progress: 40, budget: 32000, spent: 12800, start: "2026-10-26", end: "2026-11-20", crew: "Andile, Johan", phase: "Cutting & Prep" },
  { name: "Patel Stainless Handrails", client: "Raj Patel", type: "Custom Fabrication", orderType: "Custom Fabrication (Made to Order)", material: "Stainless Steel", process: "TIG/GTAW", status: "planning", progress: 0, budget: 24500, spent: 0, start: "2026-11-23", end: "2026-12-04", crew: "TBD", phase: "Quote & Site Measure" },
];

const WO_SEED = [
  { number: "WO-001", projectName: "Sasol Pipeline Section A", task: "Pipe bevelling & fit-up of spools 1-6", assignedTo: "Sipho, Thabo", priority: "high", status: "completed", phase: "Fit-up & Tack", estHours: 16, dueDate: "2026-10-14" },
  { number: "WO-002", projectName: "Sasol Pipeline Section A", task: "TIG root & hot pass on spools 1-6", assignedTo: "Sipho", priority: "high", status: "in-progress", phase: "Welding", estHours: 24, dueDate: "2026-11-06" },
  { number: "WO-003", projectName: "Riverside Mall Steel Structure", task: "Site measure & column set-out", assignedTo: "Johan, Andile", priority: "medium", status: "completed", phase: "Quote & Site Measure", estHours: 6, dueDate: "2026-10-22" },
  { number: "WO-004", projectName: "Engen Depot Tank Repair", task: "Dye-penetrant test & weld log sign-off", assignedTo: "Certified welders", priority: "high", status: "in-progress", phase: "NDT / Inspection & QC", estHours: 8, dueDate: "2026-11-05" },
  { number: "WO-005", projectName: "Van der Merwe Security Gate", task: "Order galvanised tube & hinges", assignedTo: "Pieter", priority: "medium", status: "pending", phase: "Material Ordering", estHours: 2, dueDate: "2026-11-10" },
  { number: "WO-006", projectName: "Riverside Mall Steel Structure", task: "Fit-up & tack of roof trusses", assignedTo: "Andile, Johan", priority: "medium", status: "pending", phase: "Fit-up & Tack", estHours: 30, dueDate: "2026-11-13" },
  { number: "WO-007", projectName: "Standard Braai Stand Batch (x20)", task: "Cut & bevel tube and plate for 20 units", assignedTo: "Andile", priority: "medium", status: "in-progress", phase: "Cutting & Prep", estHours: 14, dueDate: "2026-11-12" },
  { number: "WO-008", projectName: "Patel Stainless Handrails", task: "Site visit, measure & quote", assignedTo: "Manager", priority: "low", status: "pending", phase: "Quote & Site Measure", estHours: 3, dueDate: "2026-11-23" },
];

const MATERIAL_SEED = [
  { projectName: "Sasol Pipeline Section A", material: "Mild Steel Pipe 168mm Sch40", needed: 48, unit: "m", inStock: 60, status: "ok" },
  { projectName: "Sasol Pipeline Section A", material: "TIG Filler Rod ER70S-2 2.4mm", needed: 12, unit: "kg", inStock: 20, status: "ok" },
  { projectName: "Sasol Pipeline Section A", material: "Argon Gas 50L Cylinder", needed: 4, unit: "cyl", inStock: 3, status: "low" },
  { projectName: "Riverside Mall Steel Structure", material: "H-Beam 203x203 (6m)", needed: 22, unit: "pc", inStock: 9, status: "out" },
  { projectName: "Riverside Mall Steel Structure", material: "MIG Wire ER70S-6 1.2mm", needed: 10, unit: "spool", inStock: 14, status: "ok" },
  { projectName: "Riverside Mall Steel Structure", material: "Steel Plate 12mm 1500x3000", needed: 6, unit: "sheet", inStock: 8, status: "ok" },
  { projectName: "Engen Depot Tank Repair", material: "316L Stainless Plate 6mm", needed: 3, unit: "sheet", inStock: 4, status: "ok" },
  { projectName: "Engen Depot Tank Repair", material: "Dye-Penetrant Test Kit", needed: 2, unit: "set", inStock: 1, status: "low" },
  { projectName: "Van der Merwe Security Gate", material: "Galvanised Tube 50x50x2", needed: 18, unit: "m", inStock: 6, status: "out" },
  { projectName: "Standard Braai Stand Batch (x20)", material: "Flux-Cored Wire 0.9mm", needed: 3, unit: "spool", inStock: 5, status: "ok" },
  { projectName: "Standard Braai Stand Batch (x20)", material: "Cutting & Grinding Discs 115mm", needed: 40, unit: "pc", inStock: 80, status: "ok" },
  { projectName: "Patel Stainless Handrails", material: "304 Stainless Tube 38mm", needed: 30, unit: "m", inStock: 12, status: "out" },
];


// ── Status configs ────────────────────────────────────────────────────────────
const PROJ_STATUS = {
  active: { label: "Active", cls: "bg-[#dcfce7] text-[#166534]" },
  "on-hold": { label: "On Hold", cls: "bg-[#fef3c7] text-[#c2410c]" },
  planning: { label: "Planning", cls: "bg-[#eff6ff] text-[#1d4ed8]" },
  completed: { label: "Completed", cls: "bg-[#f1f5f9] text-[#475569]" },
};

const WO_STATUS = {
  pending: { label: "Pending", cls: "bg-[#eff6ff] text-[#1d4ed8]" },
  "in-progress": { label: "In Progress", cls: "bg-[#fff7ed] text-[#c2410c]" },
  completed: { label: "Completed", cls: "bg-[#dcfce7] text-[#166534]" },
};
const WO_STATUS_CYCLE = ["pending", "in-progress", "completed"];

const PRIORITY_CFG = {
  high: { cls: "bg-[#fef2f2] text-[#dc2626]", dot: "bg-[#dc2626]" },
  medium: { cls: "bg-[#fffbeb] text-[#f59e0b]", dot: "bg-[#f59e0b]" },
  low: { cls: "bg-[#f0fdf4] text-[#16a34a]", dot: "bg-[#16a34a]" },
};

const MAT_STATUS = {
  ok: { label: "Sufficient", cls: "bg-[#dcfce7] text-[#166534]" },
  low: { label: "Low", cls: "bg-[#fef3c7] text-[#c2410c]" },
  out: { label: "Insufficient", cls: "bg-[#fef2f2] text-[#991b1b]" },
};

// ── Shared styles ─────────────────────────────────────────────────────────────
const inputCls =
  "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-lg bg-white text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#ea580c]";
const labelCls =
  "block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1";

// ── Helper: seed a collection if empty ───────────────────────────────────────
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
export default function ProjectsView({ user, defaultTab = "projects" }) {
  const [tab, setTab] = useState(defaultTab);
  const [projects, setProjects] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [showWOModal, setShowWOModal] = useState(false);
  const [showProjModal, setShowProjModal] = useState(false);
  const [editWOId, setEditWOId] = useState(null);
  const [editProjId, setEditProjId] = useState(null);

  const WO_BLANK = {
    task: "",
    projectName: "Sasol Pipeline Section A",
    assignedTo: "",
    priority: "medium",
    phase: "Quote & Site Measure",
    estHours: "",
    dueDate: "",
    status: "pending",
  };
  const PROJ_BLANK = {
    name: "",
    client: "",
    type: "Structural Welding",
    orderType: ORDER_TYPES[0],
    material: "Mild Steel",
    process: "MIG/GMAW",
    status: "planning",
    progress: 0,
    budget: "",
    spent: 0,
    start: "",
    end: "",
    crew: "",
    phase: "Quote & Site Measure",
  };

  const [woForm, setWoForm] = useState(WO_BLANK);
  const [projForm, setProjForm] = useState(PROJ_BLANK);

  const projectsCol = () => collection(db, "users", user.uid, "projects");
  const workOrdersCol = () => collection(db, "users", user.uid, "workOrders");
  const materialsCol = () => collection(db, "users", user.uid, "materials");

  // Stay in sync with sidebar route
  useEffect(() => {
    setTab(defaultTab);
  }, [defaultTab]);

  // ── Load all three collections ────────────────────────────────────
  useEffect(() => {
    if (!user?.uid) return;
    (async () => {
      setLoading(true);
      try {
        const [p, w, m] = await Promise.all([
          seedIfEmpty(projectsCol(), PROJECT_SEED),
          seedIfEmpty(workOrdersCol(), WO_SEED),
          seedIfEmpty(materialsCol(), MATERIAL_SEED),
        ]);
        setProjects(p);
        setWorkOrders(w);
        setMaterials(m);
      } catch (e) {
        console.error("Projects load:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.uid]);

  // ── Work Order CRUD ───────────────────────────────────────────────
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

  const cycleStatus = async (id) => {
    const wo = workOrders.find((w) => w.id === id);
    if (!wo) return;
    const next =
      WO_STATUS_CYCLE[
        (WO_STATUS_CYCLE.indexOf(wo.status) + 1) % WO_STATUS_CYCLE.length
      ];
    try {
      await updateDoc(doc(db, "users", user.uid, "workOrders", id), {
        status: next,
        updatedAt: serverTimestamp(),
      });
      setWorkOrders((prev) =>
        prev.map((w) => (w.id === id ? { ...w, status: next } : w)),
      );
    } catch (e) {
      console.error("Cycle status:", e);
    }
  };

  const handleSaveWO = async () => {
    if (!woForm.task.trim()) return;
    setSaving(true);
    const payload = {
      task: woForm.task.trim(),
      projectName: woForm.projectName,
      assignedTo: woForm.assignedTo.trim(),
      priority: woForm.priority,
      phase: woForm.phase,
      estHours: Number(woForm.estHours) || 0,
      dueDate: woForm.dueDate,
      status: woForm.status,
    };
    try {
      if (editWOId) {
        await updateDoc(doc(db, "users", user.uid, "workOrders", editWOId), {
          ...payload,
          updatedAt: serverTimestamp(),
        });
        setWorkOrders((prev) =>
          prev.map((w) => (w.id === editWOId ? { ...w, ...payload } : w)),
        );
      } else {
        const n = workOrders.length + 1;
        const num = `WO-${String(n).padStart(3, "0")}`;
        const ref = await addDoc(workOrdersCol(), {
          ...payload,
          number: num,
          createdAt: serverTimestamp(),
        });
        setWorkOrders((prev) => [
          ...prev,
          { id: ref.id, number: num, ...payload },
        ]);
      }
      setShowWOModal(false);
    } catch (e) {
      console.error("Save WO:", e);
      alert("Failed to save work order.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteWO = async (id) => {
    if (!window.confirm("Delete this work order?")) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "workOrders", id));
      setWorkOrders((prev) => prev.filter((w) => w.id !== id));
      setShowWOModal(false);
    } catch (e) {
      alert("Failed to delete.");
    }
  };

  // ── Project CRUD ──────────────────────────────────────────────────
  const openAddProj = () => {
    setProjForm(PROJ_BLANK);
    setEditProjId(null);
    setShowProjModal(true);
  };
  const openEditProj = (p) => {
    setProjForm({
      ...p,
      budget: String(p.budget),
      spent: String(p.spent),
      progress: String(p.progress),
    });
    setEditProjId(p.id);
    setShowProjModal(true);
  };

  const handleSaveProj = async () => {
    if (!projForm.name.trim()) return;
    setSaving(true);
    const payload = {
      name: projForm.name.trim(),
      client: projForm.client.trim(),
      type: projForm.type,
      orderType: projForm.orderType || ORDER_TYPES[0],
      material: projForm.material,
      process: projForm.process,
      status: projForm.status,
      progress: Number(projForm.progress) || 0,
      budget: Number(projForm.budget) || 0,
      spent: Number(projForm.spent) || 0,
      start: projForm.start,
      end: projForm.end,
      crew: projForm.crew.trim(),
      phase: projForm.phase.trim(),
    };
    try {
      if (editProjId) {
        await updateDoc(doc(db, "users", user.uid, "projects", editProjId), {
          ...payload,
          updatedAt: serverTimestamp(),
        });
        setProjects((prev) =>
          prev.map((p) => (p.id === editProjId ? { ...p, ...payload } : p)),
        );
      } else {
        const ref = await addDoc(projectsCol(), {
          ...payload,
          createdAt: serverTimestamp(),
        });
        setProjects((prev) => [...prev, { id: ref.id, ...payload }]);
      }
      setShowProjModal(false);
    } catch (e) {
      console.error("Save project:", e);
      alert("Failed to save project.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProj = async (id) => {
    if (!window.confirm("Delete this project?")) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "projects", id));
      setProjects((prev) => prev.filter((p) => p.id !== id));
      setShowProjModal(false);
    } catch (e) {
      alert("Failed to delete.");
    }
  };

  // ── Derived for materials tab ─────────────────────────────────────
  const materialsByProject = projects.reduce((acc, p) => {
    acc[p.name] = materials.filter((m) => m.projectName === p.name);
    return acc;
  }, {});
  const materialsHaveIssues = materials.some((m) => m.status !== "ok");

  // ── Loading ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 gap-3 text-[#64748b]">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Loading projects…</span>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-bold text-[#1e293b]">Jobs & Production</h1>
          <p className="text-xs text-[#64748b] mt-0.5">
            Track repairs, fabrication jobs and on-site installs through every stage
          </p>
        </div>
        <div className="flex gap-2">
          {tab === "projects" && (
            <button
              onClick={openAddProj}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#ea580c] hover:bg-[#c2410c] text-white text-sm font-medium rounded-lg shadow-sm"
            >
              <Plus className="w-4 h-4" />
              New Project
            </button>
          )}
          {tab === "work-orders" && (
            <button
              onClick={openAddWO}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#ea580c] hover:bg-[#c2410c] text-white text-sm font-medium rounded-lg shadow-sm"
            >
              <Plus className="w-4 h-4" />
              New Work Order
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#e2e8f0]">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-all whitespace-nowrap ${tab === id ? "border-[#ea580c] text-[#ea580c] bg-[#fff7ed]" : "border-transparent text-[#64748b] hover:text-[#374151]"}`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* ══ ACTIVE PROJECTS ══════════════════════════════════════════ */}
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
                color: "text-[#f59e0b]",
                bg: "bg-[#fffbeb]",
              },
              {
                label: "Total Value",
                value: `R${projects.reduce((s, p) => s + (p.budget || 0), 0).toLocaleString("en-ZA")}`,
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
                          {p.orderType && (
                            <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-semibold bg-[#fff7ed] text-[#9a3412]">
                              {p.orderType.split(" (")[0]}
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm font-bold text-[#1e293b] truncate">
                          {p.name}
                        </h3>
                        <p className="text-xs text-[#64748b] mt-0.5">
                          {p.client} · {p.material} · {p.process}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => openEditProj(p)}
                          className="p-1.5 text-[#94a3b8] hover:text-[#2563eb] hover:bg-[#eff6ff] rounded-lg transition-all"
                        >
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => setExpanded(isExpanded ? null : p.id)}
                          className="p-1.5 text-[#94a3b8] hover:text-[#374151] hover:bg-[#f8fafc] rounded-lg"
                        >
                          <ChevronRight
                            className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}
                          />
                        </button>
                      </div>
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
                        className={`h-2 rounded-full transition-all ${p.progress >= 80 ? "bg-[#059669]" : p.progress >= 40 ? "bg-[#ea580c]" : "bg-[#2563eb]"}`}
                        style={{ width: `${p.progress}%` }}
                      />
                    </div>
                    <div className="mt-2">
                      <p className="text-xs text-[#64748b]">
                        <span className="font-semibold text-[#374151]">
                          Stage:
                        </span>{" "}
                        {p.phase}
                        {stageIndex(p.phase) >= 0 && (
                          <span className="text-[#94a3b8]">
                            {" "}
                            · {stageIndex(p.phase) + 1} of {PROJECT_STAGES.length}
                          </span>
                        )}
                      </p>
                      {stageIndex(p.phase) >= 0 && (
                        <>
                          <div className="flex gap-0.5 mt-1.5">
                            {PROJECT_STAGES.map((s, i) => (
                              <div
                                key={s}
                                title={s}
                                className={`h-1 flex-1 rounded-full ${i <= stageIndex(p.phase) ? "bg-[#ea580c]" : "bg-[#e2e8f0]"}`}
                              />
                            ))}
                          </div>
                          <p className="text-[11px] text-[#94a3b8] mt-1.5">
                            {STAGE_DESC[p.phase]}
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="px-5 py-3 flex items-center justify-between gap-2 text-sm">
                    <div>
                      <p className="text-[10px] text-[#94a3b8] uppercase tracking-wide font-semibold">
                        Budget
                      </p>
                      <p className="font-bold text-[#1e293b]">
                        R{(p.budget || 0).toLocaleString("en-ZA")}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#94a3b8] uppercase tracking-wide font-semibold">
                        Spent
                      </p>
                      <p
                        className={`font-bold ${budgetPct > 90 ? "text-[#dc2626]" : "text-[#374151]"}`}
                      >
                        R{(p.spent || 0).toLocaleString("en-ZA")}{" "}
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
                    <div className="px-5 py-3 border-t border-[#f1f5f9] bg-[#f8fafc] space-y-2">
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-[#94a3b8]" />
                        <span className="text-xs text-[#64748b]">
                          Crew:{" "}
                          <span className="text-[#374151] font-semibold">
                            {p.crew}
                          </span>
                        </span>
                      </div>
                      <div className="text-xs text-[#64748b]">
                        Remaining:{" "}
                        <span className="font-bold text-[#2563eb]">
                          R
                          {((p.budget || 0) - (p.spent || 0)).toLocaleString(
                            "en-ZA",
                          )}
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

      {/* ══ WORK ORDERS ══════════════════════════════════════════════ */}
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
                      "Stage",
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
                        className="border-b border-[#f1f5f9] hover:bg-[#f8fafc] transition-colors cursor-pointer"
                        onClick={() => openEditWO(wo)}
                      >
                        <td className="px-4 py-3 text-xs font-bold text-[#94a3b8] whitespace-nowrap">
                          {wo.number}
                        </td>
                        <td
                          className="px-4 py-3 text-sm font-medium text-[#1e293b]"
                          style={{ maxWidth: 220 }}
                        >
                          <div className="truncate">{wo.task}</div>
                        </td>
                        <td className="px-4 py-3 text-xs text-[#64748b] whitespace-nowrap">
                          {wo.projectName}
                        </td>
                        <td className="px-4 py-3 text-xs text-[#374151] whitespace-nowrap">
                          {wo.assignedTo || "—"}
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
                            cycleStatus(wo.id);
                          }}
                        >
                          <button
                            title="Advance status"
                            className="w-7 h-7 flex items-center justify-center text-[#94a3b8] hover:text-[#ea580c] hover:bg-[#fff7ed] rounded-lg transition-all text-base"
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

      {/* ══ MATERIALS LIST ═══════════════════════════════════════════ */}
      {tab === "materials" && (
        <div className="space-y-5">
          {materialsHaveIssues && (
            <div className="bg-[#fffbeb] border border-[#fde68a] rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-[#f59e0b] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-[#c2410c]">
                  Material shortfalls detected
                </p>
                <p className="text-xs text-[#ea580c] mt-0.5">
                  One or more projects have insufficient stock. Review below and
                  place orders.
                </p>
              </div>
            </div>
          )}

          {projects.map((p) => {
            const items = materialsByProject[p.name] || [];
            const hasIssues = items.some((i) => i.status !== "ok");
            if (items.length === 0) return null;
            return (
              <div
                key={p.id}
                className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden"
              >
                <div
                  className={`px-5 py-3.5 border-b flex items-center justify-between ${hasIssues ? "bg-[#fffbeb] border-[#fde68a]" : "bg-[#f8fafc] border-[#e2e8f0]"}`}
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <Flame
                      className={`w-4 h-4 flex-shrink-0 ${hasIssues ? "text-[#f59e0b]" : "text-[#64748b]"}`}
                    />
                    <span className="text-sm font-bold text-[#1e293b]">
                      {p.name}
                    </span>
                    {hasIssues && (
                      <span className="bg-[#fef3c7] text-[#c2410c] text-xs font-bold px-1.5 py-0.5 rounded-full">
                        Action needed
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-[#64748b] flex-shrink-0">
                    {items.length} materials
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#e2e8f0]">
                        {[
                          "Material",
                          "Needed",
                          "In Stock",
                          "Difference",
                          "Status",
                        ].map((h) => (
                          <th
                            key={h}
                            className="px-4 py-2.5 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wide whitespace-nowrap"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, i) => {
                        const { label: mLabel, cls: mCls } =
                          MAT_STATUS[item.status] || {};
                        const diff = (item.inStock || 0) - (item.needed || 0);
                        return (
                          <tr
                            key={i}
                            className="border-b border-[#f1f5f9] last:border-0 hover:bg-[#f8fafc]"
                          >
                            <td className="px-4 py-3 text-sm font-medium text-[#374151] whitespace-nowrap">
                              {item.material}
                            </td>
                            <td className="px-4 py-3 text-sm font-bold text-[#1e293b] whitespace-nowrap">
                              {item.needed} {item.unit}
                            </td>
                            <td className="px-4 py-3 text-sm text-[#374151] whitespace-nowrap">
                              {item.inStock} {item.unit}
                            </td>
                            <td className="px-4 py-3 text-sm font-bold whitespace-nowrap">
                              <span
                                className={
                                  diff >= 0
                                    ? "text-[#059669]"
                                    : "text-[#dc2626]"
                                }
                              >
                                {diff >= 0 ? `+${diff}` : diff} {item.unit}
                              </span>
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
            );
          })}
        </div>
      )}

      {/* ── New / Edit Work Order Modal ────────────────────────────── */}
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
                <label className={labelCls}>Task Description *</label>
                <input
                  value={woForm.task}
                  onChange={(e) =>
                    setWoForm((f) => ({ ...f, task: e.target.value }))
                  }
                  placeholder="e.g. TIG root pass on pipe spools 7-12"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Project</label>
                <select
                  value={woForm.projectName}
                  onChange={(e) =>
                    setWoForm((f) => ({ ...f, projectName: e.target.value }))
                  }
                  className={inputCls}
                >
                  {projects.map((p) => (
                    <option key={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Stage</label>
                <select
                  value={woForm.phase}
                  onChange={(e) =>
                    setWoForm((f) => ({ ...f, phase: e.target.value }))
                  }
                  className={inputCls}
                >
                  {stageOptions(woForm.phase).map((ph) => (
                    <option key={ph}>{ph}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Assigned To</label>
                <input
                  value={woForm.assignedTo}
                  onChange={(e) =>
                    setWoForm((f) => ({ ...f, assignedTo: e.target.value }))
                  }
                  placeholder="e.g. Sipho, Thabo"
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
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#ea580c] hover:bg-[#c2410c] rounded-lg shadow-sm disabled:opacity-60"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editWOId ? "Update" : "Create Work Order"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── New / Edit Project Modal ───────────────────────────────── */}
      {showProjModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg border border-[#e2e8f0] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0] sticky top-0 bg-white">
              <h2 className="text-base font-semibold text-[#1e293b]">
                {editProjId ? "Edit Project" : "New Project"}
              </h2>
              <button
                onClick={() => setShowProjModal(false)}
                className="p-1.5 text-[#64748b] hover:text-[#1e293b] hover:bg-[#e2e8f0] rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className={labelCls}>Project Name *</label>
                <input
                  value={projForm.name}
                  onChange={(e) =>
                    setProjForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="e.g. Sasol Pipeline Section B"
                  className={inputCls}
                />
              </div>
              <div className="col-span-2">
                <label className={labelCls}>Order Type</label>
                <select
                  value={projForm.orderType || ORDER_TYPES[0]}
                  onChange={(e) =>
                    setProjForm((f) => ({ ...f, orderType: e.target.value }))
                  }
                  className={inputCls}
                >
                  {ORDER_TYPES.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
                <p className="text-[11px] text-[#94a3b8] mt-1">
                  Customer jobs are repairs and maintenance, custom fabrication is made to
                  drawing, on-site jobs are installed at the client, stock builds are standard products.
                </p>
              </div>
              <div>
                <label className={labelCls}>Client</label>
                <input
                  value={projForm.client}
                  onChange={(e) =>
                    setProjForm((f) => ({ ...f, client: e.target.value }))
                  }
                  placeholder="e.g. Sasol Contractors"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Type</label>
                <select
                  value={projForm.type}
                  onChange={(e) =>
                    setProjForm((f) => ({ ...f, type: e.target.value }))
                  }
                  className={inputCls}
                >
                  {[
                    "Structural Welding",
                    "Pipe Welding",
                    "Custom Fabrication",
                    "Metal Repairs",
                    "Industrial",
                    "On-site Welding",
                    "Stock Product Build",
                    "Inspection & Testing",
                  ].map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Material</label>
                <select
                  value={projForm.material}
                  onChange={(e) =>
                    setProjForm((f) => ({ ...f, material: e.target.value }))
                  }
                  className={inputCls}
                >
                  {[
                    "Mild Steel",
                    "Stainless Steel",
                    "Aluminium",
                    "Cast Iron",
                    "Galvanized Steel",
                    "Chrome-Moly",
                    "Duplex Steel",
                    "Client-supplied Material",
                  ].map((w) => (
                    <option key={w}>{w}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Welding Process</label>
                <select
                  value={projForm.process}
                  onChange={(e) =>
                    setProjForm((f) => ({ ...f, process: e.target.value }))
                  }
                  className={inputCls}
                >
                  {[
                    "MIG/GMAW",
                    "TIG/GTAW",
                    "Stick/SMAW",
                    "Flux-Cored",
                    "Submerged Arc",
                    "Multi-process",
                  ].map((f) => (
                    <option key={f}>{f}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Status</label>
                <select
                  value={projForm.status}
                  onChange={(e) =>
                    setProjForm((f) => ({ ...f, status: e.target.value }))
                  }
                  className={inputCls}
                >
                  {["planning", "active", "on-hold", "completed"].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Progress %</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={projForm.progress}
                  onChange={(e) =>
                    setProjForm((f) => ({ ...f, progress: e.target.value }))
                  }
                  placeholder="0"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Budget (R)</label>
                <input
                  type="number"
                  value={projForm.budget}
                  onChange={(e) =>
                    setProjForm((f) => ({ ...f, budget: e.target.value }))
                  }
                  placeholder="0"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Spent (R)</label>
                <input
                  type="number"
                  value={projForm.spent}
                  onChange={(e) =>
                    setProjForm((f) => ({ ...f, spent: e.target.value }))
                  }
                  placeholder="0"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Start Date</label>
                <input
                  type="date"
                  value={projForm.start}
                  onChange={(e) =>
                    setProjForm((f) => ({ ...f, start: e.target.value }))
                  }
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>End Date</label>
                <input
                  type="date"
                  value={projForm.end}
                  onChange={(e) =>
                    setProjForm((f) => ({ ...f, end: e.target.value }))
                  }
                  className={inputCls}
                />
              </div>
              <div className="col-span-2">
                <label className={labelCls}>Crew</label>
                <input
                  value={projForm.crew}
                  onChange={(e) =>
                    setProjForm((f) => ({ ...f, crew: e.target.value }))
                  }
                  placeholder="e.g. Sipho, Thabo"
                  className={inputCls}
                />
              </div>
              <div className="col-span-2">
                <label className={labelCls}>Current Stage</label>
                <select
                  value={projForm.phase}
                  onChange={(e) =>
                    setProjForm((f) => ({ ...f, phase: e.target.value }))
                  }
                  className={inputCls}
                >
                  {stageOptions(projForm.phase).map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                {STAGE_DESC[projForm.phase] && (
                  <p className="text-[11px] text-[#94a3b8] mt-1">
                    {STAGE_DESC[projForm.phase]}
                  </p>
                )}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-[#e2e8f0] flex items-center justify-between sticky bottom-0 bg-white">
              {editProjId ? (
                <button
                  onClick={() => handleDeleteProj(editProjId)}
                  className="px-4 py-2 text-sm font-medium text-[#dc2626] bg-[#fef2f2] border border-[#fecaca] rounded-lg hover:bg-[#fee2e2]"
                >
                  Delete
                </button>
              ) : (
                <div />
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowProjModal(false)}
                  className="px-4 py-2 text-sm font-medium text-[#64748b] bg-[#f8fafc] border border-[#e2e8f0] rounded-lg hover:bg-[#e2e8f0]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProj}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#ea580c] hover:bg-[#c2410c] rounded-lg shadow-sm disabled:opacity-60"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editProjId ? "Update Project" : "Create Project"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
