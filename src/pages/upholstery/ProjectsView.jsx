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
  Hammer,
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
  { id: "projects", label: "Active Jobs", icon: Hammer },
  { id: "work-orders", label: "Work Orders", icon: ClipboardList },
  { id: "materials", label: "Fabric & Materials", icon: Package },
];

// -- Upholstery & furniture production stages ----------------------------------
const PROJECT_STAGES = [
  "Quote & Measure",
  "Fabric Selection",
  "Strip & Assess",
  "Frame Repair / Build",
  "Padding & Foam",
  "Cutting & Sewing",
  "Upholstering",
  "Finishing & QC",
  "Ready for Delivery / Collection",
  "On Showroom Floor"
];

const STAGE_DESC = {
  "Quote & Measure": "Enquiry, site visit or showroom visit, measurements, quote and deposit.",
  "Fabric Selection": "Client chooses fabric, leather or colour; swatches approved and material ordered.",
  "Strip & Assess": "Remove old covering and check the frame, springs, webbing and foam.",
  "Frame Repair / Build": "Repair joints and timber, or build the new frame from scratch.",
  "Padding & Foam": "Webbing, springs, foam, dacron wrap and cushion inserts.",
  "Cutting & Sewing": "Patterns, fabric cutting, sewing covers, piping and cushion covers.",
  "Upholstering": "Stretch, staple and fit covers; buttoning, tufting and trims.",
  "Finishing & QC": "Legs, studs, dust cover, final inspection and photos.",
  "Ready for Delivery / Collection": "Wrapped, balance invoiced, delivery or collection booked.",
  "On Showroom Floor": "Finished piece tagged, priced and displayed for sale."
};

const ORDER_TYPES = [
  "Customer Job (Re-cover / Repair)",
  "Custom Order (Made to Order)",
  "Stock Build (Made for Showroom)"
];

const stageIndex = (phase) => PROJECT_STAGES.indexOf(phase);
const stageOptions = (current) =>
  current && !PROJECT_STAGES.includes(current)
    ? [current, ...PROJECT_STAGES]
    : PROJECT_STAGES;

// ── Seed data ─────────────────────────────────────────────────────────────────
const PROJECT_SEED = [
  {
    name: "Smith Lounge Suite Re-cover",
    client: "John Smith",
    type: "Sofa / Couch Reupholstery",
    orderType: "Customer Job (Re-cover / Repair)",
    wood: "Velvet",
    finish: "High-Density Foam",
    status: "active",
    progress: 65,
    budget: 28500,
    spent: 18525,
    start: "2026-10-12",
    end: "2026-11-20",
    crew: "Pieter, Johan, Sipho",
    phase: "Upholstering"
  },
  {
    name: "Riverside Restaurant Booths",
    client: "Riverside Properties",
    type: "Restaurant Booths & Banquettes",
    orderType: "Custom Order (Made to Order)",
    wood: "Vinyl (Commercial)",
    finish: "High-Density Foam",
    status: "active",
    progress: 30,
    budget: 96000,
    spent: 28800,
    start: "2026-10-26",
    end: "2026-12-11",
    crew: "Andile, Johan",
    phase: "Frame Repair / Build"
  },
  {
    name: "Ndlovu King Headboard & Base",
    client: "Thabo Ndlovu",
    type: "Headboard & Bed Base",
    orderType: "Custom Order (Made to Order)",
    wood: "Linen",
    finish: "Foam & Dacron Wrap",
    status: "active",
    progress: 85,
    budget: 14200,
    spent: 11800,
    start: "2026-10-05",
    end: "2026-11-06",
    crew: "Sipho, Andile",
    phase: "Finishing & QC"
  },
  {
    name: "Showroom Chesterfield 3-Seater (x2)",
    client: "Showroom Stock",
    type: "Showroom Piece (Made for Sale)",
    orderType: "Stock Build (Made for Showroom)",
    wood: "Leather (Genuine)",
    finish: "Feather & Down",
    status: "active",
    progress: 40,
    budget: 44000,
    spent: 17600,
    start: "2026-10-19",
    end: "2026-11-27",
    crew: "Andile, Johan",
    phase: "Cutting & Sewing"
  },
  {
    name: "Van der Berg Dining Chairs (x8)",
    client: "Carel van der Berg",
    type: "Dining Chair Recovering",
    orderType: "Customer Job (Re-cover / Repair)",
    wood: "Microfibre / Suede",
    finish: "High-Density Foam",
    status: "on-hold",
    progress: 20,
    budget: 9600,
    spent: 1920,
    start: "2026-11-09",
    end: "2026-11-27",
    crew: "TBD",
    phase: "Fabric Selection"
  },
  {
    name: "Patel Storage Ottoman",
    client: "Raj Patel",
    type: "Ottoman / Pouf / Bench",
    orderType: "Custom Order (Made to Order)",
    wood: "Cotton / Canvas",
    finish: "Hollow Fibre",
    status: "planning",
    progress: 0,
    budget: 4800,
    spent: 0,
    start: "2026-11-23",
    end: "2026-12-04",
    crew: "TBD",
    phase: "Quote & Measure"
  }
];

const WO_SEED = [
  {
    number: "WO-001",
    projectName: "Smith Lounge Suite Re-cover",
    task: "Strip old covering & assess frame",
    assignedTo: "Pieter, Johan",
    priority: "high",
    status: "completed",
    phase: "Strip & Assess",
    estHours: 6,
    dueDate: "2026-10-14"
  },
  {
    number: "WO-002",
    projectName: "Smith Lounge Suite Re-cover",
    task: "Fit velvet covers, staple & button back cushions",
    assignedTo: "Pieter",
    priority: "high",
    status: "in-progress",
    phase: "Upholstering",
    estHours: 12,
    dueDate: "2026-11-06"
  },
  {
    number: "WO-003",
    projectName: "Riverside Restaurant Booths",
    task: "Site measure & booth templates",
    assignedTo: "Johan, Andile",
    priority: "medium",
    status: "completed",
    phase: "Quote & Measure",
    estHours: 4,
    dueDate: "2026-10-28"
  },
  {
    number: "WO-004",
    projectName: "Ndlovu King Headboard & Base",
    task: "Final trim, piping check & quality inspection",
    assignedTo: "Sipho, Andile",
    priority: "high",
    status: "in-progress",
    phase: "Finishing & QC",
    estHours: 6,
    dueDate: "2026-11-05"
  },
  {
    number: "WO-005",
    projectName: "Van der Berg Dining Chairs (x8)",
    task: "Collect chairs & confirm fabric swatch",
    assignedTo: "Pieter",
    priority: "medium",
    status: "pending",
    phase: "Fabric Selection",
    estHours: 3,
    dueDate: "2026-11-10"
  },
  {
    number: "WO-006",
    projectName: "Riverside Restaurant Booths",
    task: "Rebuild booth frames & reinforce bases",
    assignedTo: "Andile, Johan",
    priority: "medium",
    status: "pending",
    phase: "Frame Repair / Build",
    estHours: 20,
    dueDate: "2026-11-13"
  },
  {
    number: "WO-007",
    projectName: "Showroom Chesterfield 3-Seater (x2)",
    task: "Cut leather panels & stitch buttoned back",
    assignedTo: "Andile",
    priority: "medium",
    status: "in-progress",
    phase: "Cutting & Sewing",
    estHours: 18,
    dueDate: "2026-11-12"
  },
  {
    number: "WO-008",
    projectName: "Showroom Chesterfield 3-Seater (x2)",
    task: "Tag, price & photograph for showroom floor",
    assignedTo: "Manager",
    priority: "low",
    status: "pending",
    phase: "On Showroom Floor",
    estHours: 2,
    dueDate: "2026-11-27"
  }
];

const MATERIAL_SEED = [
  {
    projectName: "Smith Lounge Suite Re-cover",
    material: "Velvet Emerald 140cm",
    needed: 18,
    unit: "m",
    inStock: 22,
    status: "ok"
  },
  {
    projectName: "Smith Lounge Suite Re-cover",
    material: "High-Density Foam 100mm",
    needed: 4,
    unit: "sheet",
    inStock: 6,
    status: "ok"
  },
  {
    projectName: "Smith Lounge Suite Re-cover",
    material: "Dacron Wadding",
    needed: 10,
    unit: "m",
    inStock: 40,
    status: "ok"
  },
  {
    projectName: "Smith Lounge Suite Re-cover",
    material: "Piping Cord 8mm",
    needed: 30,
    unit: "m",
    inStock: 120,
    status: "ok"
  },
  {
    projectName: "Smith Lounge Suite Re-cover",
    material: "Decorative Buttons 22mm",
    needed: 24,
    unit: "pc",
    inStock: 18,
    status: "low"
  },
  {
    projectName: "Riverside Restaurant Booths",
    material: "Commercial Vinyl Black 137cm",
    needed: 60,
    unit: "m",
    inStock: 25,
    status: "out"
  },
  {
    projectName: "Riverside Restaurant Booths",
    material: "High-Density Foam 50mm",
    needed: 12,
    unit: "sheet",
    inStock: 14,
    status: "ok"
  },
  {
    projectName: "Riverside Restaurant Booths",
    material: "Plywood 18mm 1220x2440 (frames)",
    needed: 10,
    unit: "sheet",
    inStock: 24,
    status: "ok"
  },
  {
    projectName: "Riverside Restaurant Booths",
    material: "Upholstery Staples 10mm",
    needed: 6,
    unit: "box",
    inStock: 8,
    status: "ok"
  },
  {
    projectName: "Ndlovu King Headboard & Base",
    material: "Linen Natural 150cm",
    needed: 9,
    unit: "m",
    inStock: 12,
    status: "ok"
  },
  {
    projectName: "Ndlovu King Headboard & Base",
    material: "Dacron Wadding",
    needed: 6,
    unit: "m",
    inStock: 40,
    status: "ok"
  },
  {
    projectName: "Ndlovu King Headboard & Base",
    material: "Headboard Buttons 28mm",
    needed: 40,
    unit: "pc",
    inStock: 40,
    status: "low"
  },
  {
    projectName: "Showroom Chesterfield 3-Seater (x2)",
    material: "Leather Hide Chocolate",
    needed: 14,
    unit: "hide",
    inStock: 10,
    status: "out"
  },
  {
    projectName: "Showroom Chesterfield 3-Seater (x2)",
    material: "Feather & Down Fill",
    needed: 6,
    unit: "kg",
    inStock: 8,
    status: "ok"
  },
  {
    projectName: "Showroom Chesterfield 3-Seater (x2)",
    material: "Coil Springs 8-gauge",
    needed: 36,
    unit: "pc",
    inStock: 120,
    status: "ok"
  }
];

// ── Status configs ────────────────────────────────────────────────────────────
const PROJ_STATUS = {
  active: { label: "Active", cls: "bg-[#dcfce7] text-[#166534]" },
  "on-hold": { label: "On Hold", cls: "bg-[#fef3c7] text-[#92400e]" },
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
  medium: { cls: "bg-[#fffbeb] text-[#d97706]", dot: "bg-[#d97706]" },
  low: { cls: "bg-[#f0fdf4] text-[#16a34a]", dot: "bg-[#16a34a]" },
};

const MAT_STATUS = {
  ok: { label: "Sufficient", cls: "bg-[#dcfce7] text-[#166534]" },
  low: { label: "Low", cls: "bg-[#fef3c7] text-[#92400e]" },
  out: { label: "Insufficient", cls: "bg-[#fef2f2] text-[#991b1b]" },
};

// ── Shared styles ─────────────────────────────────────────────────────────────
const inputCls =
  "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-lg bg-white text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#b45309]";
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
    projectName: "Smith Lounge Suite Re-cover",
    assignedTo: "",
    priority: "medium",
    phase: "Quote & Measure",
    estHours: "",
    dueDate: "",
    status: "pending",
  };
  const PROJ_BLANK = {
    name: "",
    client: "",
    type: "Sofa / Couch Reupholstery",
    orderType: ORDER_TYPES[0],
    wood: "Velvet",
    finish: "High-Density Foam",
    status: "planning",
    progress: 0,
    budget: "",
    spent: 0,
    start: "",
    end: "",
    crew: "",
    phase: "Quote & Measure",
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
      wood: projForm.wood,
      finish: projForm.finish,
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
            Track repairs, custom orders and showroom builds through every stage
          </p>
        </div>
        <div className="flex gap-2">
          {tab === "projects" && (
            <button
              onClick={openAddProj}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#b45309] hover:bg-[#92400e] text-white text-sm font-medium rounded-lg shadow-sm"
            >
              <Plus className="w-4 h-4" />
              New Project
            </button>
          )}
          {tab === "work-orders" && (
            <button
              onClick={openAddWO}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#b45309] hover:bg-[#92400e] text-white text-sm font-medium rounded-lg shadow-sm"
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
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-all whitespace-nowrap ${tab === id ? "border-[#b45309] text-[#b45309] bg-[#fff7ed]" : "border-transparent text-[#64748b] hover:text-[#374151]"}`}
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
                color: "text-[#d97706]",
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
                          {p.client} · {p.wood} · {p.finish}
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
                        className={`h-2 rounded-full transition-all ${p.progress >= 80 ? "bg-[#059669]" : p.progress >= 40 ? "bg-[#b45309]" : "bg-[#2563eb]"}`}
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
                                className={`h-1 flex-1 rounded-full ${i <= stageIndex(p.phase) ? "bg-[#b45309]" : "bg-[#e2e8f0]"}`}
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
                            className="w-7 h-7 flex items-center justify-center text-[#94a3b8] hover:text-[#b45309] hover:bg-[#fff7ed] rounded-lg transition-all text-base"
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
              <AlertTriangle className="w-5 h-5 text-[#d97706] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-[#92400e]">
                  Material shortfalls detected
                </p>
                <p className="text-xs text-[#b45309] mt-0.5">
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
                    <Hammer
                      className={`w-4 h-4 flex-shrink-0 ${hasIssues ? "text-[#d97706]" : "text-[#64748b]"}`}
                    />
                    <span className="text-sm font-bold text-[#1e293b]">
                      {p.name}
                    </span>
                    {hasIssues && (
                      <span className="bg-[#fef3c7] text-[#92400e] text-xs font-bold px-1.5 py-0.5 rounded-full">
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
                  placeholder="e.g. Strip old fabric & foam from 3-seater"
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
                  placeholder="e.g. Pieter, Sipho"
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
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#b45309] hover:bg-[#92400e] rounded-lg shadow-sm disabled:opacity-60"
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
                  placeholder="e.g. Smith Lounge Suite Re-cover"
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
                  Customer jobs are re-covers and repairs, custom orders are made
                  to order, stock builds are made to sell in the showroom.
                </p>
              </div>
              <div>
                <label className={labelCls}>Client</label>
                <input
                  value={projForm.client}
                  onChange={(e) =>
                    setProjForm((f) => ({ ...f, client: e.target.value }))
                  }
                  placeholder="e.g. John Smith"
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
                    "Sofa / Couch Reupholstery",
                    "Dining Chair Recovering",
                    "Headboard & Bed Base",
                    "Cushions & Loose Covers",
                    "Ottoman / Pouf / Bench",
                    "Office & Commercial Seating",
                    "Restaurant Booths & Banquettes",
                    "Furniture Repair & Restoration",
                    "Vehicle / Marine Trim",
                    "Custom Furniture (Made to Order)",
                    "Showroom Piece (Made for Sale)",
                    "Retail Sale (Ready-Made)",
                  ].map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Fabric / Covering</label>
                <select
                  value={projForm.wood}
                  onChange={(e) =>
                    setProjForm((f) => ({ ...f, wood: e.target.value }))
                  }
                  className={inputCls}
                >
                  {[
                    "Velvet",
                    "Linen",
                    "Cotton / Canvas",
                    "Chenille",
                    "Microfibre / Suede",
                    "Leather (Genuine)",
                    "Faux Leather / PU",
                    "Vinyl (Commercial)",
                    "Outdoor / Water-Resistant",
                    "Customer's Own Fabric",
                  ].map((w) => (
                    <option key={w}>{w}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Padding & Fill</label>
                <select
                  value={projForm.finish}
                  onChange={(e) =>
                    setProjForm((f) => ({ ...f, finish: e.target.value }))
                  }
                  className={inputCls}
                >
                  {[
                    "High-Density Foam",
                    "Foam & Dacron Wrap",
                    "Feather & Down",
                    "Hollow Fibre",
                    "Springs & Webbing Renewed",
                    "Re-use Existing Fill",
                    "Not Applicable (Retail Item)",
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
                  placeholder="e.g. Pieter, Sipho"
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
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#b45309] hover:bg-[#92400e] rounded-lg shadow-sm disabled:opacity-60"
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
