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
  limit,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "../../firebase";
import { useCurrency } from "../../contexts/CurrencyContext";
import {
  Wrench,
  ClipboardList,
  Package,
  Plus,
  X,
  ChevronRight,
  Users,
  MapPin,
  Edit2,
  AlertTriangle,
  Loader2,
} from "lucide-react";

// Set to false to stop creating sample jobs, work orders and materials
// for new accounts.
const SEED_DEMO_DATA = true;

// ── Tab config ────────────────────────────────────────────────────────────────
const TABS = [
  { id: "projects", label: "Active Jobs", icon: Wrench },
  { id: "work-orders", label: "Work Orders", icon: ClipboardList },
  { id: "materials", label: "Glass & Materials", icon: Package },
];

// ── Window & windscreen job stages ────────────────────────────────────────────
const PROJECT_STAGES = [
  "Quote & Measure",
  "Order Glass & Parts",
  "Cutting & Fabrication",
  "Removal & Prep",
  "Fitting & Glazing",
  "Sealing & Curing",
  "Finishing & QC",
  "Handover & Sign-off",
];

const STAGE_DESC = {
  "Quote & Measure":
    "Enquiry, site or vehicle inspection, measurements, quote and deposit.",
  "Order Glass & Parts":
    "Glass, windscreen, frames and seals ordered; supplier lead times confirmed.",
  "Cutting & Fabrication":
    "Glass cut and edge-worked, IGUs made up, frames fabricated or modified.",
  "Removal & Prep":
    "Old glass or windscreen removed; frame, pinch-weld and rebate cleaned and checked.",
  "Fitting & Glazing":
    "New glass set, blocked and secured; hardware and gaskets fitted.",
  "Sealing & Curing":
    "Silicone or urethane applied; safe drive-away or cure time observed.",
  "Finishing & QC":
    "Glass cleaned, leak and operation tests done, final inspection and photos.",
  "Handover & Sign-off":
    "Client signs off, balance invoiced, warranty and care notes given.",
};

const CATEGORIES = ["Vehicle Glass", "Residential", "Commercial / Shopfront"];

const JOB_TYPES = [
  "Windscreen Replacement",
  "Windscreen Chip & Crack Repair",
  "Side / Rear Glass Replacement",
  "Window Pane Replacement",
  "Double Glazing / IGU Replacement",
  "Window Frame Repair",
  "Sliding Window / Door Repair",
  "Seal & Leak Repair",
  "New Window Installation",
  "Shopfront & Commercial Glazing",
  "Emergency Board-up",
];

const GLASS_TYPES = [
  "Windscreen (OEM)",
  "Windscreen (Aftermarket)",
  "Clear Float",
  "Tinted",
  "Toughened (Tempered)",
  "Laminated",
  "Double Glazed (IGU)",
  "Low-E",
  "Frosted / Obscure",
  "Mirror",
  "Customer-Supplied",
];

const FIXINGS = [
  "Bonded (Urethane)",
  "Aluminium Frame",
  "Timber Frame",
  "uPVC Frame",
  "Steel Frame",
  "Rubber Gasket",
  "Beading & Putty",
  "Frameless",
  "Not Applicable",
];

const UNITS = [
  "pc",
  "sheet",
  "m",
  "pair",
  "set",
  "box",
  "tube",
  "cartridge",
  "can",
  "bottle",
  "roll",
  "kg",
  "L",
];

const stageIndex = (phase) => PROJECT_STAGES.indexOf(phase);
const stageOptions = (current) =>
  current && !PROJECT_STAGES.includes(current)
    ? [current, ...PROJECT_STAGES]
    : PROJECT_STAGES;

// ── Date helpers ──────────────────────────────────────────────────────────────
const toISO = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
const isoIn = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return toISO(d);
};
const fmtDate = (iso) =>
  iso
    ? new Date(`${iso}T00:00:00`).toLocaleDateString("en-ZA", {
        day: "numeric",
        month: "short",
      })
    : "—";

// ── Seed data (dates are relative to today so it never looks stale) ──────────
const buildProjectSeed = () => [
  { key: "hilux", name: "Hilux Windscreen & ADAS Recalibration", client: "Thabo Mokoena", site: "2021 Toyota Hilux", category: "Vehicle Glass", type: "Windscreen Replacement", glassType: "Windscreen (OEM)", fixing: "Bonded (Urethane)", status: "active", progress: 70, budget: 4200, spent: 2950, start: isoIn(-2), end: isoIn(1), crew: "Sipho", phase: "Sealing & Curing" },
  { key: "greenview", name: "Greenview Flats – Bedroom Windows (x6)", client: "Greenview Body Corporate", site: "Greenview Flats, Block B", category: "Residential", type: "Window Pane Replacement", glassType: "Toughened (Tempered)", fixing: "Aluminium Frame", status: "active", progress: 35, budget: 38500, spent: 12400, start: isoIn(-6), end: isoIn(14), crew: "Andile, Johan", phase: "Cutting & Fabrication" },
  { key: "patel", name: "Patel Double Glazing Units (x4)", client: "Raj Patel", site: "14 Jacaranda Avenue", category: "Residential", type: "Double Glazing / IGU Replacement", glassType: "Double Glazed (IGU)", fixing: "Aluminium Frame", status: "on-hold", progress: 20, budget: 26800, spent: 5400, start: isoIn(3), end: isoIn(21), crew: "TBD", phase: "Order Glass & Parts" },
  { key: "cafe", name: "Corner Cafe Shopfront Glazing", client: "Corner Cafe (Pty) Ltd", site: "Main Street shopfront", category: "Commercial / Shopfront", type: "Shopfront & Commercial Glazing", glassType: "Laminated", fixing: "Aluminium Frame", status: "active", progress: 55, budget: 64000, spent: 31000, start: isoIn(-9), end: isoIn(7), crew: "Andile, Johan, Sipho", phase: "Fitting & Glazing" },
  { key: "dlamini", name: "Dlamini Emergency Board-up & Pane", client: "Nomsa Dlamini", site: "27 Protea Road", category: "Residential", type: "Emergency Board-up", glassType: "Clear Float", fixing: "Timber Frame", status: "completed", progress: 100, budget: 3600, spent: 3350, start: isoIn(-14), end: isoIn(-11), crew: "Sipho", phase: "Handover & Sign-off" },
  { key: "ruiz", name: "Ruiz Sliding Window Repair", client: "Maria Ruiz", site: "5 Baobab Close", category: "Residential", type: "Sliding Window / Door Repair", glassType: "Clear Float", fixing: "Aluminium Frame", status: "planning", progress: 0, budget: 2800, spent: 0, start: isoIn(7), end: isoIn(10), crew: "TBD", phase: "Quote & Measure" },
];

const buildWOSeed = () => [
  { number: "WO-001", projectKey: "hilux", task: "Remove old windscreen & prep pinch-weld", assignedTo: "Sipho", priority: "high", status: "completed", phase: "Removal & Prep", estHours: 2, dueDate: isoIn(-2) },
  { number: "WO-002", projectKey: "hilux", task: "Bond new windscreen & ADAS recalibration", assignedTo: "Sipho", priority: "high", status: "in-progress", phase: "Sealing & Curing", estHours: 3, dueDate: isoIn(1) },
  { number: "WO-003", projectKey: "greenview", task: "Measure and template all six openings", assignedTo: "Andile", priority: "medium", status: "completed", phase: "Quote & Measure", estHours: 4, dueDate: isoIn(-5) },
  { number: "WO-004", projectKey: "greenview", task: "Cut and edge-work toughened panes", assignedTo: "Andile, Johan", priority: "high", status: "in-progress", phase: "Cutting & Fabrication", estHours: 10, dueDate: isoIn(3) },
  { number: "WO-005", projectKey: "greenview", task: "Remove old panes and fit new glass", assignedTo: "Andile, Johan", priority: "medium", status: "pending", phase: "Fitting & Glazing", estHours: 16, dueDate: isoIn(10) },
  { number: "WO-006", projectKey: "patel", task: "Order IGUs from supplier", assignedTo: "Manager", priority: "medium", status: "pending", phase: "Order Glass & Parts", estHours: 1, dueDate: isoIn(4) },
  { number: "WO-007", projectKey: "cafe", task: "Fit laminated shopfront panels", assignedTo: "Andile, Johan, Sipho", priority: "high", status: "in-progress", phase: "Fitting & Glazing", estHours: 20, dueDate: isoIn(3) },
  { number: "WO-008", projectKey: "cafe", task: "Silicone, clean and final inspection", assignedTo: "Sipho", priority: "low", status: "pending", phase: "Finishing & QC", estHours: 4, dueDate: isoIn(7) },
];

const buildMaterialSeed = () => [
  { projectKey: "hilux", material: "Windscreen – Toyota Hilux (OEM)", needed: 1, unit: "pc", inStock: 1 },
  { projectKey: "hilux", material: "Urethane adhesive", needed: 2, unit: "cartridge", inStock: 6 },
  { projectKey: "hilux", material: "Primer kit", needed: 1, unit: "set", inStock: 2 },
  { projectKey: "hilux", material: "Windscreen moulding kit", needed: 1, unit: "set", inStock: 0 },
  { projectKey: "greenview", material: "6mm Toughened glass panes", needed: 6, unit: "pc", inStock: 4 },
  { projectKey: "greenview", material: "Glazing tape", needed: 30, unit: "m", inStock: 100 },
  { projectKey: "greenview", material: "Clear silicone", needed: 6, unit: "cartridge", inStock: 14 },
  { projectKey: "greenview", material: "Glazing blocks", needed: 24, unit: "pc", inStock: 60 },
  { projectKey: "patel", material: "Double glazed unit (IGU)", needed: 4, unit: "pc", inStock: 0 },
  { projectKey: "patel", material: "Glazing gasket", needed: 20, unit: "m", inStock: 40 },
  { projectKey: "cafe", material: "10mm Laminated glass", needed: 5, unit: "pc", inStock: 5 },
  { projectKey: "cafe", material: "Aluminium shopfront profile", needed: 24, unit: "m", inStock: 18 },
  { projectKey: "cafe", material: "Setting blocks", needed: 20, unit: "pc", inStock: 50 },
  { projectKey: "cafe", material: "Structural silicone", needed: 8, unit: "cartridge", inStock: 4 },
  { projectKey: "ruiz", material: "Sliding window rollers", needed: 2, unit: "pair", inStock: 3 },
  { projectKey: "ruiz", material: "Brush seal", needed: 6, unit: "m", inStock: 20 },
];

// Creates the sample data once per account; deleting it later keeps it deleted.
async function seedDemoOnce(uid) {
  const flagKey = `wr_projects_seeded_${uid}`;
  try {
    if (localStorage.getItem(flagKey) === "1") return;
  } catch (_) {}

  const projCol = collection(db, "users", uid, "projects");
  const woCol = collection(db, "users", uid, "workOrders");
  const matCol = collection(db, "users", uid, "materials");

  const existing = await getDocs(query(projCol, limit(1)));
  if (existing.empty) {
    const batch = writeBatch(db);
    const byKey = {};
    buildProjectSeed().forEach(({ key, ...p }) => {
      const ref = doc(projCol);
      byKey[key] = { id: ref.id, name: p.name };
      batch.set(ref, { ...p, createdAt: serverTimestamp() });
    });
    buildWOSeed().forEach(({ projectKey, ...w }) =>
      batch.set(doc(woCol), {
        ...w,
        projectId: byKey[projectKey].id,
        projectName: byKey[projectKey].name,
        createdAt: serverTimestamp(),
      }),
    );
    buildMaterialSeed().forEach(({ projectKey, ...m }) =>
      batch.set(doc(matCol), {
        ...m,
        projectId: byKey[projectKey].id,
        projectName: byKey[projectKey].name,
        inventoryId: "",
        createdAt: serverTimestamp(),
      }),
    );
    await batch.commit();
  }
  try {
    localStorage.setItem(flagKey, "1");
  } catch (_) {}
}

// ── Status configs ────────────────────────────────────────────────────────────
const PROJ_STATUS = {
  active: { label: "Active", cls: "bg-[#dcfce7] text-[#166534]" },
  "on-hold": { label: "On hold", cls: "bg-[#fef3c7] text-[#92400e]" },
  planning: { label: "Planning", cls: "bg-[#eff6ff] text-[#1d4ed8]" },
  completed: { label: "Completed", cls: "bg-[#f1f5f9] text-[#475569]" },
};

const WO_STATUS = {
  pending: { label: "Pending", cls: "bg-[#eff6ff] text-[#1d4ed8]" },
  "in-progress": { label: "In progress", cls: "bg-[#fff7ed] text-[#c2410c]" },
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
  low: { label: "Short", cls: "bg-[#fef3c7] text-[#92400e]" },
  out: { label: "None in stock", cls: "bg-[#fef2f2] text-[#991b1b]" },
};
// Worked out from the numbers, so it never goes out of date
const matStatus = (needed, inStock) =>
  inStock >= needed ? "ok" : inStock > 0 ? "low" : "out";

// ── Shared styles ─────────────────────────────────────────────────────────────
const inputCls =
  "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-lg bg-white text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#2563eb]";
const labelCls =
  "block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1";
const primaryBtn =
  "flex items-center gap-1.5 px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium rounded-lg shadow-sm";
const cancelBtn =
  "px-4 py-2 text-sm font-medium text-[#64748b] bg-[#f8fafc] border border-[#e2e8f0] rounded-lg hover:bg-[#e2e8f0]";
const saveBtn =
  "flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#2563eb] hover:bg-[#1d4ed8] rounded-lg shadow-sm disabled:opacity-60";
const deleteBtn =
  "px-4 py-2 text-sm font-medium text-[#dc2626] bg-[#fef2f2] border border-[#fecaca] rounded-lg hover:bg-[#fee2e2]";

function StatCards({ items }) {
  return (
    <div
      className={`grid gap-4 ${items.length === 3 ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-4"}`}
    >
      {items.map(({ label, value, color, bg }) => (
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
  );
}

function ModalShell({ title, onClose, footer, wide = false, children }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div
        className={`bg-white rounded-xl shadow-2xl w-full ${wide ? "max-w-lg" : "max-w-md"} border border-[#e2e8f0] max-h-[90vh] overflow-y-auto`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0] sticky top-0 bg-white z-10">
          <h2 className="text-base font-semibold text-[#1e293b]">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-[#64748b] hover:text-[#1e293b] hover:bg-[#e2e8f0] rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
        <div className="px-6 py-4 border-t border-[#e2e8f0] flex items-center justify-between sticky bottom-0 bg-white">
          {footer}
        </div>
      </div>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function ProjectsView({ user, defaultTab = "projects" }) {
  const { formatCurrency } = useCurrency();
  const money = (n) => formatCurrency(n || 0, "ZAR");

  const [tab, setTab] = useState(defaultTab);
  const [projects, setProjects] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState(null);

  const [showWOModal, setShowWOModal] = useState(false);
  const [showProjModal, setShowProjModal] = useState(false);
  const [showMatModal, setShowMatModal] = useState(false);
  const [editWOId, setEditWOId] = useState(null);
  const [editProjId, setEditProjId] = useState(null);
  const [editMatId, setEditMatId] = useState(null);
  const [formError, setFormError] = useState("");

  const WO_BLANK = {
    task: "",
    projectId: "",
    assignedTo: "",
    priority: "medium",
    phase: PROJECT_STAGES[0],
    estHours: "",
    dueDate: "",
    status: "pending",
  };
  const PROJ_BLANK = {
    name: "",
    client: "",
    site: "",
    category: CATEGORIES[0],
    type: JOB_TYPES[0],
    glassType: GLASS_TYPES[0],
    fixing: FIXINGS[0],
    status: "planning",
    progress: 0,
    budget: "",
    spent: 0,
    start: "",
    end: "",
    crew: "",
    phase: PROJECT_STAGES[0],
  };
  const MAT_BLANK = {
    projectId: "",
    inventoryId: "",
    material: "",
    needed: "",
    unit: "pc",
    inStock: "",
  };

  const [woForm, setWoForm] = useState(WO_BLANK);
  const [projForm, setProjForm] = useState(PROJ_BLANK);
  const [matForm, setMatForm] = useState(MAT_BLANK);

  const projectsCol = () => collection(db, "users", user.uid, "projects");
  const workOrdersCol = () => collection(db, "users", user.uid, "workOrders");
  const materialsCol = () => collection(db, "users", user.uid, "materials");

  // Stay in sync with sidebar route
  useEffect(() => {
    setTab(defaultTab);
  }, [defaultTab]);

  // ── Load everything ───────────────────────────────────────────────
  useEffect(() => {
    if (!user?.uid) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        if (SEED_DEMO_DATA) await seedDemoOnce(user.uid);
        const read = async (col) =>
          (await getDocs(query(col, orderBy("createdAt", "asc")))).docs.map(
            (d) => ({ id: d.id, ...d.data() }),
          );
        const [p, w, m, inv] = await Promise.all([
          read(projectsCol()),
          read(workOrdersCol()),
          read(materialsCol()),
          read(collection(db, "users", user.uid, "inventory")).catch(() => []),
        ]);
        if (cancelled) return;
        setProjects(p);
        setWorkOrders(w);
        setMaterials(m);
        setInventory(inv);
      } catch (e) {
        console.error("Projects load:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.uid]);

  // ── Lookups ───────────────────────────────────────────────────────
  const projectName = (rec) =>
    projects.find((p) => p.id === rec.projectId)?.name ||
    rec.projectName ||
    "Unknown job";
  const inventoryById = Object.fromEntries(inventory.map((i) => [i.id, i]));
  // Linked items follow live inventory; custom items use the typed-in number.
  const stockOf = (m) =>
    m.inventoryId && inventoryById[m.inventoryId]
      ? inventoryById[m.inventoryId].qty || 0
      : m.inStock || 0;
  const today = toISO(new Date());

  // ── Work order CRUD ───────────────────────────────────────────────
  const openAddWO = () => {
    setWoForm({ ...WO_BLANK, projectId: projects[0]?.id || "" });
    setEditWOId(null);
    setFormError("");
    setShowWOModal(true);
  };
  const openEditWO = (wo) => {
    setWoForm({
      ...WO_BLANK,
      ...wo,
      projectId:
        wo.projectId ||
        projects.find((p) => p.name === wo.projectName)?.id ||
        "",
      estHours: String(wo.estHours ?? ""),
    });
    setEditWOId(wo.id);
    setFormError("");
    setShowWOModal(true);
  };

  const nextWONumber = () => {
    const max = workOrders.reduce((m, w) => {
      const n = parseInt(String(w.number || "").replace(/\D/g, ""), 10);
      return Number.isFinite(n) ? Math.max(m, n) : m;
    }, 0);
    return `WO-${String(max + 1).padStart(3, "0")}`;
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
    if (!woForm.task.trim()) {
      setFormError("Describe the task.");
      return;
    }
    if (!woForm.projectId) {
      setFormError("Choose a job for this work order. Create a job first if the list is empty.");
      return;
    }
    setFormError("");
    setSaving(true);
    const payload = {
      task: woForm.task.trim(),
      projectId: woForm.projectId,
      projectName: projects.find((p) => p.id === woForm.projectId)?.name || "",
      assignedTo: (woForm.assignedTo || "").trim(),
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
        const number = nextWONumber();
        const ref = await addDoc(workOrdersCol(), {
          ...payload,
          number,
          createdAt: serverTimestamp(),
        });
        setWorkOrders((prev) => [...prev, { id: ref.id, number, ...payload }]);
      }
      setShowWOModal(false);
    } catch (e) {
      console.error("Save WO:", e);
      setFormError("Could not save this work order. Check your connection and try again.");
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
      console.error("Delete WO:", e);
      setFormError("Could not delete this work order. Try again.");
    }
  };

  // ── Job (project) CRUD ────────────────────────────────────────────
  const openAddProj = () => {
    setProjForm(PROJ_BLANK);
    setEditProjId(null);
    setFormError("");
    setShowProjModal(true);
  };
  const openEditProj = (p) => {
    setProjForm({
      ...PROJ_BLANK,
      ...p,
      budget: String(p.budget ?? ""),
      spent: String(p.spent ?? 0),
      progress: String(p.progress ?? 0),
    });
    setEditProjId(p.id);
    setFormError("");
    setShowProjModal(true);
  };

  const handleSaveProj = async () => {
    if (!projForm.name.trim()) {
      setFormError("Enter a job name.");
      return;
    }
    if (projForm.start && projForm.end && projForm.end < projForm.start) {
      setFormError("The end date is before the start date.");
      return;
    }
    setFormError("");
    setSaving(true);
    const payload = {
      name: projForm.name.trim(),
      client: (projForm.client || "").trim(),
      site: (projForm.site || "").trim(),
      category: projForm.category,
      type: projForm.type,
      glassType: projForm.glassType,
      fixing: projForm.fixing,
      status: projForm.status,
      progress: Math.min(100, Math.max(0, Number(projForm.progress) || 0)),
      budget: Number(projForm.budget) || 0,
      spent: Number(projForm.spent) || 0,
      start: projForm.start,
      end: projForm.end,
      crew: (projForm.crew || "").trim(),
      phase: projForm.phase,
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
      setFormError("Could not save this job. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  };

  // Deleting a job also removes its work orders and material lines
  const handleDeleteProj = async (id) => {
    const wos = workOrders.filter((w) => w.projectId === id);
    const mats = materials.filter((m) => m.projectId === id);
    const extra =
      wos.length + mats.length > 0
        ? ` This also deletes ${wos.length} work order${wos.length === 1 ? "" : "s"} and ${mats.length} material line${mats.length === 1 ? "" : "s"}.`
        : "";
    if (!window.confirm(`Delete this job?${extra}`)) return;
    try {
      const batch = writeBatch(db);
      batch.delete(doc(db, "users", user.uid, "projects", id));
      wos.forEach((w) =>
        batch.delete(doc(db, "users", user.uid, "workOrders", w.id)),
      );
      mats.forEach((m) =>
        batch.delete(doc(db, "users", user.uid, "materials", m.id)),
      );
      await batch.commit();
      setProjects((prev) => prev.filter((p) => p.id !== id));
      setWorkOrders((prev) => prev.filter((w) => w.projectId !== id));
      setMaterials((prev) => prev.filter((m) => m.projectId !== id));
      setShowProjModal(false);
    } catch (e) {
      console.error("Delete project:", e);
      setFormError("Could not delete this job. Try again.");
    }
  };

  // ── Material CRUD ─────────────────────────────────────────────────
  const openAddMat = () => {
    setMatForm({ ...MAT_BLANK, projectId: projects[0]?.id || "" });
    setEditMatId(null);
    setFormError("");
    setShowMatModal(true);
  };
  const openEditMat = (m) => {
    setMatForm({
      ...MAT_BLANK,
      ...m,
      needed: String(m.needed ?? ""),
      inStock: String(m.inStock ?? ""),
      inventoryId: m.inventoryId || "",
    });
    setEditMatId(m.id);
    setFormError("");
    setShowMatModal(true);
  };

  const pickInventoryItem = (id) => {
    const item = inventoryById[id];
    setMatForm((f) =>
      item
        ? { ...f, inventoryId: id, material: item.name, unit: item.unit || f.unit }
        : { ...f, inventoryId: "" },
    );
  };

  const handleSaveMat = async () => {
    if (!matForm.projectId) {
      setFormError("Choose a job for this material.");
      return;
    }
    if (!matForm.material.trim()) {
      setFormError("Enter the material name, or pick one from inventory.");
      return;
    }
    if (matForm.needed === "" || Number(matForm.needed) <= 0) {
      setFormError("Enter how much this job needs.");
      return;
    }
    setFormError("");
    setSaving(true);
    const payload = {
      projectId: matForm.projectId,
      projectName: projects.find((p) => p.id === matForm.projectId)?.name || "",
      inventoryId: matForm.inventoryId || "",
      material: matForm.material.trim(),
      needed: Number(matForm.needed),
      unit: matForm.unit,
      inStock: Number(matForm.inStock) || 0,
    };
    try {
      if (editMatId) {
        await updateDoc(doc(db, "users", user.uid, "materials", editMatId), {
          ...payload,
          updatedAt: serverTimestamp(),
        });
        setMaterials((prev) =>
          prev.map((m) => (m.id === editMatId ? { ...m, ...payload } : m)),
        );
      } else {
        const ref = await addDoc(materialsCol(), {
          ...payload,
          createdAt: serverTimestamp(),
        });
        setMaterials((prev) => [...prev, { id: ref.id, ...payload }]);
      }
      setShowMatModal(false);
    } catch (e) {
      console.error("Save material:", e);
      setFormError("Could not save this material. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMat = async (id) => {
    if (!window.confirm("Remove this material from the job?")) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "materials", id));
      setMaterials((prev) => prev.filter((m) => m.id !== id));
      setShowMatModal(false);
    } catch (e) {
      console.error("Delete material:", e);
      setFormError("Could not remove this material. Try again.");
    }
  };

  // ── Derived for materials tab ─────────────────────────────────────
  const materialsHaveIssues = materials.some(
    (m) => matStatus(m.needed || 0, stockOf(m)) !== "ok",
  );

  // ── Loading ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 gap-3 text-[#64748b]">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Loading jobs…</span>
      </div>
    );
  }

  const field = (setter) => (key) => (e) =>
    setter((f) => ({ ...f, [key]: e.target.value }));
  const setWo = field(setWoForm);
  const setProj = field(setProjForm);
  const setMat = field(setMatForm);

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-bold text-[#1e293b]">
            Jobs & Installations
          </h1>
          <p className="text-xs text-[#64748b] mt-0.5">
            Follow every repair and installation from quote to handover
          </p>
        </div>
        <div className="flex gap-2">
          {tab === "projects" && (
            <button onClick={openAddProj} className={primaryBtn}>
              <Plus className="w-4 h-4" />
              New job
            </button>
          )}
          {tab === "work-orders" && (
            <button onClick={openAddWO} className={primaryBtn}>
              <Plus className="w-4 h-4" />
              New work order
            </button>
          )}
          {tab === "materials" && (
            <button onClick={openAddMat} className={primaryBtn}>
              <Plus className="w-4 h-4" />
              Add material
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#e2e8f0] overflow-x-auto">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-all whitespace-nowrap ${
              tab === id
                ? "border-[#2563eb] text-[#2563eb] bg-[#eff6ff]"
                : "border-transparent text-[#64748b] hover:text-[#374151]"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* ══ ACTIVE JOBS ══════════════════════════════════════════════ */}
      {tab === "projects" && (
        <div className="space-y-4">
          <StatCards
            items={[
              { label: "Total jobs", value: projects.length, color: "text-[#1e293b]", bg: "bg-[#f8fafc]" },
              { label: "Active", value: projects.filter((p) => p.status === "active").length, color: "text-[#059669]", bg: "bg-[#f0fdf4]" },
              { label: "On hold", value: projects.filter((p) => p.status === "on-hold").length, color: "text-[#d97706]", bg: "bg-[#fffbeb]" },
              { label: "Total value", value: money(projects.reduce((s, p) => s + (p.budget || 0), 0)), color: "text-[#2563eb]", bg: "bg-[#eff6ff]" },
            ]}
          />

          {projects.length === 0 && (
            <div className="bg-white border border-[#e2e8f0] rounded-xl py-14 text-center">
              <Wrench className="w-8 h-8 text-[#cbd5e1] mx-auto mb-2" />
              <p className="text-sm text-[#64748b]">
                No jobs yet. Create one to start tracking it through each stage.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {projects.map((p) => {
              const { label: sLabel, cls: sCls } = PROJ_STATUS[p.status] || {
                label: p.status,
                cls: "bg-[#f1f5f9] text-[#475569]",
              };
              const budgetPct =
                p.budget > 0
                  ? Math.round(((p.spent || 0) / p.budget) * 100)
                  : 0;
              const isExpanded = expanded === p.id;
              const jobWOs = workOrders.filter((w) => w.projectId === p.id);
              const openWOs = jobWOs.filter((w) => w.status !== "completed");
              const shortMats = materials.filter(
                (m) =>
                  m.projectId === p.id &&
                  matStatus(m.needed || 0, stockOf(m)) !== "ok",
              );
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
                          <span className="text-xs text-[#64748b]">{p.type}</span>
                          {p.category && (
                            <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-semibold bg-[#eff6ff] text-[#1d4ed8]">
                              {p.category}
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm font-bold text-[#1e293b] truncate">
                          {p.name}
                        </h3>
                        <p className="text-xs text-[#64748b] mt-0.5">
                          {[p.client, p.glassType, p.fixing]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                        {p.site && (
                          <p className="text-xs text-[#94a3b8] mt-0.5 flex items-center gap-1">
                            <MapPin className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{p.site}</span>
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => openEditProj(p)}
                          title="Edit job"
                          className="p-1.5 text-[#94a3b8] hover:text-[#2563eb] hover:bg-[#eff6ff] rounded-lg transition-all"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setExpanded(isExpanded ? null : p.id)}
                          title={isExpanded ? "Show less" : "Show more"}
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
                        className={`h-2 rounded-full transition-all ${
                          p.progress >= 80
                            ? "bg-[#059669]"
                            : p.progress >= 40
                              ? "bg-[#2563eb]"
                              : "bg-[#60a5fa]"
                        }`}
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
                                className={`h-1 flex-1 rounded-full ${
                                  i <= stageIndex(p.phase)
                                    ? "bg-[#2563eb]"
                                    : "bg-[#e2e8f0]"
                                }`}
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
                        {money(p.budget)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#94a3b8] uppercase tracking-wide font-semibold">
                        Spent
                      </p>
                      <p
                        className={`font-bold ${budgetPct > 90 ? "text-[#dc2626]" : "text-[#374151]"}`}
                      >
                        {money(p.spent)}{" "}
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
                        {fmtDate(p.start)} → {fmtDate(p.end)}
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
                            {p.crew || "Not assigned"}
                          </span>
                        </span>
                      </div>
                      <div className="text-xs text-[#64748b]">
                        Remaining budget:{" "}
                        <span className="font-bold text-[#2563eb]">
                          {money((p.budget || 0) - (p.spent || 0))}
                        </span>
                      </div>
                      <div className="text-xs text-[#64748b]">
                        Work orders:{" "}
                        <span className="font-semibold text-[#374151]">
                          {openWOs.length} open of {jobWOs.length}
                        </span>
                      </div>
                      <div className="text-xs text-[#64748b]">
                        Materials:{" "}
                        {shortMats.length > 0 ? (
                          <span className="font-semibold text-[#d97706]">
                            {shortMats.length} short or out of stock
                          </span>
                        ) : (
                          <span className="font-semibold text-[#059669]">
                            All sufficient
                          </span>
                        )}
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
          <StatCards
            items={[
              { label: "Total", value: workOrders.length, color: "text-[#1e293b]", bg: "bg-[#f8fafc]" },
              { label: "In progress", value: workOrders.filter((w) => w.status === "in-progress").length, color: "text-[#c2410c]", bg: "bg-[#fff7ed]" },
              { label: "Pending", value: workOrders.filter((w) => w.status === "pending").length, color: "text-[#2563eb]", bg: "bg-[#eff6ff]" },
            ]}
          />

          <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#e2e8f0] bg-[#f8fafc]">
                    {["#", "Task", "Job", "Assigned", "Priority", "Stage", "Hrs", "Due", "Status", ""].map(
                      (h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wide whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {workOrders.length === 0 && (
                    <tr>
                      <td colSpan={10} className="px-4 py-14 text-center text-sm text-[#64748b]">
                        No work orders yet. Create one to assign a task to your crew.
                      </td>
                    </tr>
                  )}
                  {workOrders.map((wo) => {
                    const { label: sLabel, cls: sCls } = WO_STATUS[wo.status] || {};
                    const { cls: pCls, dot: pDot } = PRIORITY_CFG[wo.priority] || {};
                    const overdue =
                      wo.dueDate && wo.dueDate < today && wo.status !== "completed";
                    return (
                      <tr
                        key={wo.id}
                        className="border-b border-[#f1f5f9] hover:bg-[#f8fafc] transition-colors cursor-pointer"
                        onClick={() => openEditWO(wo)}
                      >
                        <td className="px-4 py-3 text-xs font-bold text-[#94a3b8] whitespace-nowrap">
                          {wo.number}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-[#1e293b]" style={{ maxWidth: 220 }}>
                          <div className="truncate">{wo.task}</div>
                        </td>
                        <td className="px-4 py-3 text-xs text-[#64748b] whitespace-nowrap">
                          {projectName(wo)}
                        </td>
                        <td className="px-4 py-3 text-xs text-[#374151] whitespace-nowrap">
                          {wo.assignedTo || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${pCls}`}>
                            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${pDot}`} />
                            {wo.priority?.charAt(0).toUpperCase() + wo.priority?.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-[#64748b] whitespace-nowrap">
                          {wo.phase}
                        </td>
                        <td className="px-4 py-3 text-sm text-[#374151] whitespace-nowrap">
                          {wo.estHours}h
                        </td>
                        <td
                          className={`px-4 py-3 text-xs whitespace-nowrap ${overdue ? "text-[#dc2626] font-semibold" : "text-[#64748b]"}`}
                        >
                          {fmtDate(wo.dueDate)}
                          {overdue && " (overdue)"}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap ${sCls}`}>
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
                            title="Move to next status"
                            className="w-7 h-7 flex items-center justify-center text-[#94a3b8] hover:text-[#2563eb] hover:bg-[#eff6ff] rounded-lg transition-all text-base"
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

      {/* ══ GLASS & MATERIALS ════════════════════════════════════════ */}
      {tab === "materials" && (
        <div className="space-y-5">
          {materialsHaveIssues && (
            <div className="bg-[#fffbeb] border border-[#fde68a] rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-[#d97706] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-[#92400e]">
                  Some jobs are short of materials
                </p>
                <p className="text-xs text-[#b45309] mt-0.5">
                  Order what is missing before the job reaches the fitting stage.
                </p>
              </div>
            </div>
          )}

          {materials.length === 0 && (
            <div className="bg-white border border-[#e2e8f0] rounded-xl py-14 text-center">
              <Package className="w-8 h-8 text-[#cbd5e1] mx-auto mb-2" />
              <p className="text-sm text-[#64748b]">
                No materials listed yet. Add the glass, seals and parts each job needs.
              </p>
            </div>
          )}

          {projects.map((p) => {
            const items = materials.filter((m) => m.projectId === p.id);
            if (items.length === 0) return null;
            const hasIssues = items.some(
              (m) => matStatus(m.needed || 0, stockOf(m)) !== "ok",
            );
            return (
              <div
                key={p.id}
                className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden"
              >
                <div
                  className={`px-5 py-3.5 border-b flex items-center justify-between ${hasIssues ? "bg-[#fffbeb] border-[#fde68a]" : "bg-[#f8fafc] border-[#e2e8f0]"}`}
                >
                  <div className="flex items-center gap-2 flex-wrap min-w-0">
                    <Wrench
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
                  <span className="text-xs text-[#64748b] flex-shrink-0 ml-2">
                    {items.length} material{items.length === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#e2e8f0]">
                        {["Material", "Needed", "In stock", "Difference", "Status"].map(
                          (h) => (
                            <th
                              key={h}
                              className="px-4 py-2.5 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wide whitespace-nowrap"
                            >
                              {h}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => {
                        const inStock = stockOf(item);
                        const status = matStatus(item.needed || 0, inStock);
                        const { label: mLabel, cls: mCls } = MAT_STATUS[status];
                        const diff = inStock - (item.needed || 0);
                        const linked =
                          item.inventoryId && inventoryById[item.inventoryId];
                        return (
                          <tr
                            key={item.id}
                            onClick={() => openEditMat(item)}
                            className="border-b border-[#f1f5f9] last:border-0 hover:bg-[#f8fafc] cursor-pointer"
                          >
                            <td className="px-4 py-3 text-sm font-medium text-[#374151] whitespace-nowrap">
                              {item.material}
                              {linked && (
                                <span className="ml-2 text-[10px] font-semibold text-[#2563eb] bg-[#eff6ff] px-1.5 py-0.5 rounded">
                                  Live stock
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm font-bold text-[#1e293b] whitespace-nowrap">
                              {item.needed} {item.unit}
                            </td>
                            <td className="px-4 py-3 text-sm text-[#374151] whitespace-nowrap">
                              {inStock} {item.unit}
                            </td>
                            <td className="px-4 py-3 text-sm font-bold whitespace-nowrap">
                              <span
                                className={diff >= 0 ? "text-[#059669]" : "text-[#dc2626]"}
                              >
                                {diff >= 0 ? `+${diff}` : diff} {item.unit}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap ${mCls}`}
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

      {/* ── Work order modal ───────────────────────────────────────── */}
      {showWOModal && (
        <ModalShell
          wide
          title={editWOId ? "Edit work order" : "New work order"}
          onClose={() => setShowWOModal(false)}
          footer={
            <>
              {editWOId ? (
                <button onClick={() => handleDeleteWO(editWOId)} className={deleteBtn}>
                  Delete
                </button>
              ) : (
                <div />
              )}
              <div className="flex gap-3">
                <button onClick={() => setShowWOModal(false)} className={cancelBtn}>
                  Cancel
                </button>
                <button onClick={handleSaveWO} disabled={saving} className={saveBtn}>
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editWOId ? "Save changes" : "Create work order"}
                </button>
              </div>
            </>
          }
        >
          <div className="p-6 grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={labelCls}>Task description *</label>
              <input
                value={woForm.task}
                onChange={setWo("task")}
                placeholder="e.g. Remove cracked pane and prep frame"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Job</label>
              <select
                value={woForm.projectId}
                onChange={setWo("projectId")}
                className={inputCls}
              >
                {projects.length === 0 && <option value="">No jobs yet</option>}
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Stage</label>
              <select value={woForm.phase} onChange={setWo("phase")} className={inputCls}>
                {stageOptions(woForm.phase).map((ph) => (
                  <option key={ph}>{ph}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Assigned to</label>
              <input
                value={woForm.assignedTo}
                onChange={setWo("assignedTo")}
                placeholder="e.g. Sipho, Andile"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Priority</label>
              <select value={woForm.priority} onChange={setWo("priority")} className={inputCls}>
                {["high", "medium", "low"].map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Est. hours</label>
              <input
                type="number"
                min="0"
                value={woForm.estHours}
                onChange={setWo("estHours")}
                placeholder="0"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Due date</label>
              <input
                type="date"
                value={woForm.dueDate}
                onChange={setWo("dueDate")}
                className={inputCls}
              />
            </div>
            <div className="col-span-2">
              <label className={labelCls}>Status</label>
              <select value={woForm.status} onChange={setWo("status")} className={inputCls}>
                {WO_STATUS_CYCLE.map((s) => (
                  <option key={s} value={s}>
                    {WO_STATUS[s].label}
                  </option>
                ))}
              </select>
            </div>
            {formError && (
              <p className="col-span-2 text-xs font-medium text-[#dc2626]">{formError}</p>
            )}
          </div>
        </ModalShell>
      )}

      {/* ── Job modal ──────────────────────────────────────────────── */}
      {showProjModal && (
        <ModalShell
          wide
          title={editProjId ? "Edit job" : "New job"}
          onClose={() => setShowProjModal(false)}
          footer={
            <>
              {editProjId ? (
                <button onClick={() => handleDeleteProj(editProjId)} className={deleteBtn}>
                  Delete
                </button>
              ) : (
                <div />
              )}
              <div className="flex gap-3">
                <button onClick={() => setShowProjModal(false)} className={cancelBtn}>
                  Cancel
                </button>
                <button onClick={handleSaveProj} disabled={saving} className={saveBtn}>
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editProjId ? "Save changes" : "Create job"}
                </button>
              </div>
            </>
          }
        >
          <div className="p-6 grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={labelCls}>Job name *</label>
              <input
                value={projForm.name}
                onChange={setProj("name")}
                placeholder="e.g. Hilux windscreen replacement"
                className={inputCls}
              />
            </div>
            <div className="col-span-2">
              <label className={labelCls}>Category</label>
              <select value={projForm.category} onChange={setProj("category")} className={inputCls}>
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Client</label>
              <input
                value={projForm.client}
                onChange={setProj("client")}
                placeholder="e.g. Thabo Mokoena"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Site / vehicle</label>
              <input
                value={projForm.site}
                onChange={setProj("site")}
                placeholder="e.g. 12 Oak St, or 2019 Hilux"
                className={inputCls}
              />
            </div>
            <div className="col-span-2">
              <label className={labelCls}>Work type</label>
              <select value={projForm.type} onChange={setProj("type")} className={inputCls}>
                {(JOB_TYPES.includes(projForm.type)
                  ? JOB_TYPES
                  : [projForm.type, ...JOB_TYPES]
                ).map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Glass type</label>
              <select value={projForm.glassType} onChange={setProj("glassType")} className={inputCls}>
                {GLASS_TYPES.map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Frame / fixing</label>
              <select value={projForm.fixing} onChange={setProj("fixing")} className={inputCls}>
                {FIXINGS.map((f) => (
                  <option key={f}>{f}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Status</label>
              <select value={projForm.status} onChange={setProj("status")} className={inputCls}>
                {Object.entries(PROJ_STATUS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.label}
                  </option>
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
                onChange={setProj("progress")}
                placeholder="0"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Budget</label>
              <input
                type="number"
                min="0"
                value={projForm.budget}
                onChange={setProj("budget")}
                placeholder="0"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Spent</label>
              <input
                type="number"
                min="0"
                value={projForm.spent}
                onChange={setProj("spent")}
                placeholder="0"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Start date</label>
              <input type="date" value={projForm.start} onChange={setProj("start")} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>End date</label>
              <input type="date" value={projForm.end} onChange={setProj("end")} className={inputCls} />
            </div>
            <div className="col-span-2">
              <label className={labelCls}>Crew</label>
              <input
                value={projForm.crew}
                onChange={setProj("crew")}
                placeholder="e.g. Sipho, Andile"
                className={inputCls}
              />
            </div>
            <div className="col-span-2">
              <label className={labelCls}>Current stage</label>
              <select value={projForm.phase} onChange={setProj("phase")} className={inputCls}>
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
            {formError && (
              <p className="col-span-2 text-xs font-medium text-[#dc2626]">{formError}</p>
            )}
          </div>
        </ModalShell>
      )}

      {/* ── Material modal ─────────────────────────────────────────── */}
      {showMatModal && (
        <ModalShell
          title={editMatId ? "Edit material" : "Add material"}
          onClose={() => setShowMatModal(false)}
          footer={
            <>
              {editMatId ? (
                <button onClick={() => handleDeleteMat(editMatId)} className={deleteBtn}>
                  Remove
                </button>
              ) : (
                <div />
              )}
              <div className="flex gap-3">
                <button onClick={() => setShowMatModal(false)} className={cancelBtn}>
                  Cancel
                </button>
                <button onClick={handleSaveMat} disabled={saving} className={saveBtn}>
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editMatId ? "Save changes" : "Add material"}
                </button>
              </div>
            </>
          }
        >
          <div className="p-6 space-y-4">
            <div>
              <label className={labelCls}>Job</label>
              <select value={matForm.projectId} onChange={setMat("projectId")} className={inputCls}>
                {projects.length === 0 && <option value="">No jobs yet</option>}
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>From inventory</label>
              <select
                value={matForm.inventoryId}
                onChange={(e) => pickInventoryItem(e.target.value)}
                className={inputCls}
              >
                <option value="">Custom material (not in inventory)</option>
                {inventory.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name} ({i.qty} {i.unit} in stock)
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-[#94a3b8] mt-1">
                Pick an inventory item and its stock level updates here automatically.
              </p>
            </div>
            <div>
              <label className={labelCls}>Material *</label>
              <input
                value={matForm.material}
                onChange={setMat("material")}
                placeholder="e.g. 6mm Toughened glass pane"
                className={inputCls}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Needed *</label>
                <input
                  type="number"
                  min="0"
                  value={matForm.needed}
                  onChange={setMat("needed")}
                  placeholder="0"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Unit</label>
                <select value={matForm.unit} onChange={setMat("unit")} className={inputCls}>
                  {UNITS.map((u) => (
                    <option key={u}>{u}</option>
                  ))}
                </select>
              </div>
            </div>
            {!matForm.inventoryId && (
              <div>
                <label className={labelCls}>In stock now</label>
                <input
                  type="number"
                  min="0"
                  value={matForm.inStock}
                  onChange={setMat("inStock")}
                  placeholder="0"
                  className={inputCls}
                />
              </div>
            )}
            {formError && (
              <p className="text-xs font-medium text-[#dc2626]">{formError}</p>
            )}
          </div>
        </ModalShell>
      )}
    </div>
  );
}
