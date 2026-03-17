import React, { useState, useEffect, useCallback } from "react";
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
  Users,
  DollarSign,
  Plus,
  X,
  Edit2,
  Trash2,
  Search,
  CheckCircle,
  Play,
  Eye,
  Briefcase,
  CreditCard,
} from "lucide-react";

// ── SA Tax helpers (2024/2025) ────────────────────────────────────────────────
function calcAnnualPAYE(gross) {
  const BRACKETS = [
    { limit: 237_100, base: 0, rate: 0.18 },
    { limit: 370_500, base: 42_678, rate: 0.26 },
    { limit: 512_800, base: 77_362, rate: 0.31 },
    { limit: 673_000, base: 121_475, rate: 0.36 },
    { limit: 857_900, base: 179_147, rate: 0.39 },
    { limit: 1_817_000, base: 251_258, rate: 0.41 },
    { limit: Infinity, base: 644_489, rate: 0.45 },
  ];
  const prev = [0, 237_100, 370_500, 512_800, 673_000, 857_900, 1_817_000];
  let tax = 0;
  for (let i = 0; i < BRACKETS.length; i++) {
    if (gross <= BRACKETS[i].limit) {
      tax = BRACKETS[i].base + (gross - prev[i]) * BRACKETS[i].rate;
      break;
    }
  }
  return Math.max(0, tax - 17_235);
}
const monthlyPAYE = (m) => calcAnnualPAYE(m * 12) / 12;
const monthlyUIF = (m) => Math.min(m * 0.01, 148.72);

const inputCls =
  "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md bg-white text-[#1e293b] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-[#2563eb] transition-colors";
const labelCls =
  "block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5";
const selectCls =
  "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md bg-white text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-[#2563eb] transition-colors";
const fmt = (n) =>
  Number(n || 0).toLocaleString("en-ZA", { minimumFractionDigits: 2 });

const TABS = [
  { id: "employees", label: "Employees", icon: Users },
  { id: "payroll-runs", label: "Payroll Runs", icon: DollarSign },
];
const DEPARTMENTS = [
  "Finance",
  "Operations",
  "Sales",
  "Marketing",
  "HR",
  "IT",
  "Management",
  "Other",
];
const EMP_TYPES = ["Permanent", "Contract", "Part-time", "Casual"];

// Props: user, clientId, clientName
export default function PayrollView({ user, clientId, clientName }) {
  const [activeTab, setActiveTab] = useState("employees");

  const db = getFirestore();
  const clientBase = ["users", user.uid, "clients", clientId];

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 border-b border-[#e2e8f0] bg-white px-6">
        <div className="flex gap-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-3.5 text-sm font-medium border-b-2 transition-all -mb-px ${activeTab === id ? "border-[#2563eb] text-[#2563eb]" : "border-transparent text-[#64748b] hover:text-[#374151]"}`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === "employees" && (
          <EmployeesTab
            db={db}
            clientBase={clientBase}
            clientName={clientName}
          />
        )}
        {activeTab === "payroll-runs" && (
          <PayrollRunsTab
            db={db}
            clientBase={clientBase}
            clientName={clientName}
          />
        )}
      </div>
    </div>
  );
}

// ── Employees ─────────────────────────────────────────────────────────────────
function EmployeesTab({ db, clientBase, clientName }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const blank = () => ({
    name: "",
    idNumber: "",
    email: "",
    phone: "",
    position: "",
    department: "Finance",
    employmentType: "Permanent",
    grossSalary: "",
    salaryType: "monthly",
    taxNumber: "",
    bankName: "",
    bankAccount: "",
    bankBranch: "",
    startDate: new Date().toISOString().split("T")[0],
    isActive: true,
  });
  const [form, setForm] = useState(blank());

  const col = () => collection(db, ...clientBase, "employees");
  const docRef = (id) => doc(db, ...clientBase, "employees", id);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(col(), orderBy("name")));
      setEmployees(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } finally {
      setLoading(false);
    }
  }, [clientBase.join(",")]);

  useEffect(() => {
    load();
  }, [load]);

  const openAdd = () => {
    setEditing(null);
    setForm(blank());
    setShowModal(true);
  };
  const openEdit = (e) => {
    setEditing(e);
    setForm({
      name: e.name || "",
      idNumber: e.idNumber || "",
      email: e.email || "",
      phone: e.phone || "",
      position: e.position || "",
      department: e.department || "Finance",
      employmentType: e.employmentType || "Permanent",
      grossSalary: e.grossSalary || "",
      salaryType: e.salaryType || "monthly",
      taxNumber: e.taxNumber || "",
      bankName: e.bankName || "",
      bankAccount: e.bankAccount || "",
      bankBranch: e.bankBranch || "",
      startDate: e.startDate || "",
      isActive: e.isActive !== false,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.grossSalary) return;
    setSaving(true);
    const payload = { ...form, grossSalary: Number(form.grossSalary) };
    try {
      editing
        ? await updateDoc(docRef(editing.id), {
            ...payload,
            updatedAt: serverTimestamp(),
          })
        : await addDoc(col(), { ...payload, createdAt: serverTimestamp() });
      setShowModal(false);
      load();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this employee?")) return;
    await deleteDoc(docRef(id));
    load();
  };

  const filtered = employees.filter((e) => {
    const q = search.toLowerCase();
    return (
      e.name.toLowerCase().includes(q) ||
      (e.position || "").toLowerCase().includes(q)
    );
  });
  const activeCount = employees.filter((e) => e.isActive !== false).length;
  const totalPayroll = employees
    .filter((e) => e.isActive !== false)
    .reduce((s, e) => s + (e.grossSalary || 0), 0);

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#eff6ff] rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-[#2563eb]" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#1e293b]">Employees</h2>
            <p className="text-xs text-[#64748b]">
              {clientName} · {activeCount} active · Payroll: R
              {fmt(totalPayroll)}/mo
            </p>
          </div>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Employee
        </button>
      </div>

      {/* KPI tiles */}
      <div className="grid grid-cols-4 gap-4">
        {[
          {
            label: "Total Employees",
            value: employees.length,
            color: "text-[#2563eb]",
            bg: "bg-[#eff6ff]",
          },
          {
            label: "Active",
            value: activeCount,
            color: "text-[#059669]",
            bg: "bg-[#f0fdf4]",
          },
          {
            label: "Gross Payroll",
            value: `R${fmt(totalPayroll)}`,
            color: "text-[#7c3aed]",
            bg: "bg-[#faf5ff]",
          },
          {
            label: "Est. PAYE",
            value: `R${fmt(employees.filter((e) => e.isActive !== false).reduce((s, e) => s + monthlyPAYE(e.grossSalary || 0), 0))}`,
            color: "text-[#ea580c]",
            bg: "bg-[#fff7ed]",
          },
        ].map(({ label, value, color, bg }) => (
          <div
            key={label}
            className={`${bg} border border-[#e2e8f0] rounded-xl p-4`}
          >
            <p className="text-xs font-semibold text-[#64748b]">{label}</p>
            <p className={`text-xl font-bold mt-1 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search employees…"
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-[#e2e8f0] rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12 text-[#94a3b8] text-sm">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white border border-[#e2e8f0] rounded-xl">
          <Users className="w-10 h-10 text-[#cbd5e1] mb-3" />
          <p className="text-sm font-medium text-[#94a3b8]">No employees yet</p>
        </div>
      ) : (
        <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#e2e8f0] bg-[#f8fafc]">
                {[
                  "Employee",
                  "Department",
                  "Type",
                  "Gross",
                  "PAYE",
                  "UIF",
                  "Net Pay",
                  "",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((emp) => {
                const g = emp.grossSalary || 0,
                  p = monthlyPAYE(g),
                  u = monthlyUIF(g),
                  n = g - p - u;
                return (
                  <tr
                    key={emp.id}
                    className="border-b border-[#f8fafc] hover:bg-[#f8fafc] transition-colors"
                  >
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-[#1e293b]">
                        {emp.name}
                      </p>
                      <p className="text-xs text-[#94a3b8]">
                        {emp.position || "—"}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-[#eff6ff] text-[#2563eb]">
                        {emp.department}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#64748b]">
                      {emp.employmentType}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-[#1e293b]">
                      R{fmt(g)}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#ea580c]">
                      R{fmt(p)}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#d97706]">
                      R{fmt(u)}
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-[#059669]">
                      R{fmt(n)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => openEdit(emp)}
                          className="p-1.5 text-[#94a3b8] hover:text-[#2563eb] hover:bg-[#eff6ff] rounded-lg transition-all"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(emp.id)}
                          className="p-1.5 text-[#94a3b8] hover:text-[#dc2626] hover:bg-[#fef2f2] rounded-lg transition-all"
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl border border-[#e2e8f0] my-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0]">
              <h2 className="text-sm font-semibold text-[#1e293b]">
                {editing ? "Edit Employee" : "Add Employee"} — {clientName}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-[#64748b] hover:bg-[#f1f5f9] rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-5 overflow-y-auto max-h-[68vh]">
              <SectionTitle icon={Users} label="Personal Details" />
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className={labelCls}>Full Name *</label>
                  <input
                    className={inputCls}
                    value={form.name}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, name: e.target.value }))
                    }
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <label className={labelCls}>ID Number</label>
                  <input
                    className={inputCls}
                    value={form.idNumber}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, idNumber: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className={labelCls}>Email</label>
                  <input
                    type="email"
                    className={inputCls}
                    value={form.email}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, email: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className={labelCls}>Phone</label>
                  <input
                    className={inputCls}
                    value={form.phone}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, phone: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className={labelCls}>Start Date</label>
                  <input
                    type="date"
                    className={inputCls}
                    value={form.startDate}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, startDate: e.target.value }))
                    }
                  />
                </div>
              </div>

              <SectionTitle icon={Briefcase} label="Employment" />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Position / Role</label>
                  <input
                    className={inputCls}
                    value={form.position}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, position: e.target.value }))
                    }
                    placeholder="e.g. Senior Accountant"
                  />
                </div>
                <div>
                  <label className={labelCls}>Department</label>
                  <select
                    className={selectCls}
                    value={form.department}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, department: e.target.value }))
                    }
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Employment Type</label>
                  <select
                    className={selectCls}
                    value={form.employmentType}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, employmentType: e.target.value }))
                    }
                  >
                    {EMP_TYPES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>SARS Tax Ref</label>
                  <input
                    className={inputCls}
                    value={form.taxNumber}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, taxNumber: e.target.value }))
                    }
                  />
                </div>
              </div>

              <SectionTitle icon={DollarSign} label="Salary" />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Gross Salary (R) *</label>
                  <input
                    type="number"
                    className={inputCls}
                    value={form.grossSalary}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, grossSalary: e.target.value }))
                    }
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className={labelCls}>Salary Type</label>
                  <select
                    className={selectCls}
                    value={form.salaryType}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, salaryType: e.target.value }))
                    }
                  >
                    <option value="monthly">Monthly</option>
                    <option value="hourly">Hourly</option>
                    <option value="annual">Annual</option>
                  </select>
                </div>
                {form.grossSalary && (
                  <div className="col-span-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4">
                    <p className="text-xs font-semibold text-[#64748b] mb-3 uppercase tracking-wide">
                      Estimated Monthly Deductions
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        {
                          label: "PAYE",
                          value: fmt(monthlyPAYE(Number(form.grossSalary))),
                          color: "text-[#ea580c]",
                        },
                        {
                          label: "UIF",
                          value: fmt(monthlyUIF(Number(form.grossSalary))),
                          color: "text-[#d97706]",
                        },
                        {
                          label: "Net Pay",
                          value: fmt(
                            Number(form.grossSalary) -
                              monthlyPAYE(Number(form.grossSalary)) -
                              monthlyUIF(Number(form.grossSalary)),
                          ),
                          color: "text-[#059669]",
                        },
                      ].map(({ label, value, color }) => (
                        <div key={label} className="text-center">
                          <p className="text-xs text-[#64748b]">{label}</p>
                          <p className={`text-base font-bold ${color}`}>
                            R{value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <SectionTitle icon={CreditCard} label="Banking Details" />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Bank Name</label>
                  <input
                    className={inputCls}
                    value={form.bankName}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, bankName: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className={labelCls}>Account Number</label>
                  <input
                    className={inputCls}
                    value={form.bankAccount}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, bankAccount: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className={labelCls}>Branch Code</label>
                  <input
                    className={inputCls}
                    value={form.bankBranch}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, bankBranch: e.target.value }))
                    }
                    placeholder="e.g. 051001"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#e2e8f0]">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-[#64748b] hover:bg-[#f1f5f9] rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name.trim() || !form.grossSalary}
                className="px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium rounded-lg disabled:opacity-50"
              >
                {saving ? "Saving…" : editing ? "Update" : "Add Employee"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Payroll Runs ──────────────────────────────────────────────────────────────
function PayrollRunsTab({ db, clientBase, clientName }) {
  const [runs, setRuns] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showView, setShowView] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [period, setPeriod] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  const runCol = () => collection(db, ...clientBase, "payrollRuns");
  const runDoc = (id) => doc(db, ...clientBase, "payrollRuns", id);
  const empCol = () => collection(db, ...clientBase, "employees");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [runSnap, empSnap] = await Promise.all([
        getDocs(query(runCol(), orderBy("createdAt", "desc"))),
        getDocs(query(empCol(), orderBy("name"))),
      ]);
      setRuns(runSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setEmployees(
        empSnap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((e) => e.isActive !== false),
      );
    } finally {
      setLoading(false);
    }
  }, [clientBase.join(",")]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreateRun = async () => {
    if (!period || employees.length === 0) return;
    if (runs.some((r) => r.period === period)) {
      alert(`A payroll run for ${period} already exists.`);
      return;
    }
    setProcessing(true);
    try {
      const breakdown = employees.map((emp) => {
        const g = emp.grossSalary || 0,
          p = Math.round(monthlyPAYE(g) * 100) / 100,
          u = Math.round(monthlyUIF(g) * 100) / 100;
        return {
          employeeId: emp.id,
          name: emp.name,
          position: emp.position || "",
          department: emp.department || "",
          grossSalary: g,
          paye: p,
          uif: u,
          netPay: Math.round((g - p - u) * 100) / 100,
          bankName: emp.bankName || "",
          bankAccount: emp.bankAccount || "",
        };
      });
      const totals = breakdown.reduce(
        (s, e) => ({
          gross: s.gross + e.grossSalary,
          paye: s.paye + e.paye,
          uif: s.uif + e.uif,
          net: s.net + e.netPay,
          count: s.count + 1,
        }),
        { gross: 0, paye: 0, uif: 0, net: 0, count: 0 },
      );
      const ref = await addDoc(runCol(), {
        period,
        status: "processed",
        employees: breakdown,
        totals,
        processedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      });
      setShowCreate(false);
      await load();
      setShowView({
        id: ref.id,
        period,
        status: "processed",
        employees: breakdown,
        totals,
      });
    } finally {
      setProcessing(false);
    }
  };

  const markPaid = async (runId) => {
    await updateDoc(runDoc(runId), {
      status: "paid",
      paidAt: serverTimestamp(),
    });
    load();
    setShowView((p) => (p ? { ...p, status: "paid" } : p));
  };

  const statusBadge = (s) =>
    s === "paid"
      ? "bg-[#dcfce7] text-[#166534]"
      : s === "processed"
        ? "bg-[#dbeafe] text-[#1e40af]"
        : "bg-[#f1f5f9] text-[#64748b]";

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#f0fdf4] rounded-lg flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-[#059669]" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#1e293b]">Payroll Runs</h2>
            <p className="text-xs text-[#64748b]">
              {clientName} · {runs.length} runs · {employees.length} active
              employees
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#059669] hover:bg-[#047857] text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
        >
          <Play className="w-4 h-4" />
          Run Payroll
        </button>
      </div>

      {employees.length === 0 && (
        <div className="px-5 py-4 bg-[#fff7ed] border border-[#fed7aa] rounded-xl text-sm text-[#9a3412] flex items-center gap-2">
          <Users className="w-4 h-4" />
          Add employees first in the Employees tab.
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-[#94a3b8] text-sm">Loading…</div>
      ) : runs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white border border-[#e2e8f0] rounded-xl">
          <DollarSign className="w-10 h-10 text-[#cbd5e1] mb-3" />
          <p className="text-sm font-medium text-[#94a3b8]">
            No payroll runs yet
          </p>
        </div>
      ) : (
        <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#e2e8f0] bg-[#f8fafc]">
                {[
                  "Period",
                  "Employees",
                  "Gross",
                  "PAYE",
                  "UIF",
                  "Net",
                  "Status",
                  "",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {runs.map((run) => (
                <tr
                  key={run.id}
                  className="border-b border-[#f8fafc] hover:bg-[#f8fafc] transition-colors"
                >
                  <td className="px-4 py-3 text-sm font-semibold text-[#1e293b]">
                    {run.period}
                  </td>
                  <td className="px-4 py-3 text-sm text-[#64748b]">
                    {run.totals?.count || 0}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-[#1e293b]">
                    R{fmt(run.totals?.gross)}
                  </td>
                  <td className="px-4 py-3 text-sm text-[#ea580c]">
                    R{fmt(run.totals?.paye)}
                  </td>
                  <td className="px-4 py-3 text-sm text-[#d97706]">
                    R{fmt(run.totals?.uif)}
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-[#059669]">
                    R{fmt(run.totals?.net)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${statusBadge(run.status)}`}
                    >
                      {run.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setShowView(run)}
                      className="p-1.5 text-[#94a3b8] hover:text-[#2563eb] hover:bg-[#eff6ff] rounded-lg transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-[#e2e8f0]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0]">
              <h2 className="text-sm font-semibold text-[#1e293b]">
                Run Payroll — {clientName}
              </h2>
              <button
                onClick={() => setShowCreate(false)}
                className="p-1.5 text-[#64748b] hover:bg-[#f1f5f9] rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={labelCls}>Payroll Period *</label>
                <input
                  type="month"
                  className={inputCls}
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                />
              </div>
              <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4 space-y-2">
                <p className="text-xs font-semibold text-[#374151]">
                  Run Summary
                </p>
                {[
                  ["Employees", employees.length],
                  [
                    "Total Gross",
                    `R${fmt(employees.reduce((s, e) => s + (e.grossSalary || 0), 0))}`,
                  ],
                  [
                    "Total PAYE",
                    `R${fmt(employees.reduce((s, e) => s + monthlyPAYE(e.grossSalary || 0), 0))}`,
                  ],
                  [
                    "Total UIF",
                    `R${fmt(employees.reduce((s, e) => s + monthlyUIF(e.grossSalary || 0), 0))}`,
                  ],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm">
                    <span className="text-[#64748b]">{k}</span>
                    <span className="font-semibold text-[#1e293b]">{v}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm border-t border-[#e2e8f0] pt-2 mt-1">
                  <span className="font-semibold text-[#374151]">
                    Net Payroll
                  </span>
                  <span className="text-[#059669] font-bold">
                    R
                    {fmt(
                      employees.reduce((s, e) => {
                        const g = e.grossSalary || 0;
                        return s + g - monthlyPAYE(g) - monthlyUIF(g);
                      }, 0),
                    )}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#e2e8f0]">
              <button
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 text-sm text-[#64748b] hover:bg-[#f1f5f9] rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRun}
                disabled={processing || !period || employees.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-[#059669] hover:bg-[#047857] text-white text-sm font-medium rounded-lg disabled:opacity-50"
              >
                <Play className="w-4 h-4" />
                {processing ? "Processing…" : "Process Payroll"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View run modal */}
      {showView && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-[#e2e8f0]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0] flex-shrink-0">
              <div>
                <h2 className="text-sm font-semibold text-[#1e293b]">
                  Payroll Run — {showView.period}
                </h2>
                <p className="text-xs text-[#64748b] mt-0.5">
                  {clientName} · {showView.totals?.count} employees
                </p>
              </div>
              <div className="flex items-center gap-2">
                {showView.status === "processed" && (
                  <button
                    onClick={() => markPaid(showView.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#059669] hover:bg-[#047857] text-white text-xs font-medium rounded-lg"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Mark as Paid
                  </button>
                )}
                <button
                  onClick={() => setShowView(null)}
                  className="p-1.5 text-[#64748b] hover:bg-[#f1f5f9] rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="overflow-y-auto flex-1">
              <div className="grid grid-cols-4 gap-3 p-5 border-b border-[#f1f5f9]">
                {[
                  {
                    label: "Gross",
                    value: fmt(showView.totals?.gross),
                    color: "text-[#1e293b]",
                  },
                  {
                    label: "PAYE",
                    value: fmt(showView.totals?.paye),
                    color: "text-[#ea580c]",
                  },
                  {
                    label: "UIF",
                    value: fmt(showView.totals?.uif),
                    color: "text-[#d97706]",
                  },
                  {
                    label: "Net Payroll",
                    value: fmt(showView.totals?.net),
                    color: "text-[#059669]",
                  },
                ].map(({ label, value, color }) => (
                  <div
                    key={label}
                    className="text-center bg-[#f8fafc] rounded-xl p-3"
                  >
                    <p className="text-xs text-[#64748b]">{label}</p>
                    <p className={`text-base font-bold ${color}`}>R{value}</p>
                  </div>
                ))}
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#e2e8f0] bg-[#f8fafc]">
                    {[
                      "Employee",
                      "Dept",
                      "Gross",
                      "PAYE",
                      "UIF",
                      "Net",
                      "Bank",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wide"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(showView.employees || []).map((e, i) => (
                    <tr
                      key={i}
                      className="border-b border-[#f8fafc] hover:bg-[#f8fafc] transition-colors"
                    >
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-[#1e293b]">
                          {e.name}
                        </p>
                        <p className="text-xs text-[#94a3b8]">{e.position}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-[#64748b]">
                        {e.department}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-[#1e293b]">
                        R{fmt(e.grossSalary)}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#ea580c]">
                        R{fmt(e.paye)}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#d97706]">
                        R{fmt(e.uif)}
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-[#059669]">
                        R{fmt(e.netPay)}
                      </td>
                      <td className="px-4 py-3 text-xs text-[#94a3b8]">
                        {e.bankName}{" "}
                        {e.bankAccount ? `····${e.bankAccount.slice(-4)}` : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SectionTitle({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-2 pt-2">
      <Icon className="w-4 h-4 text-[#2563eb]" />
      <span className="text-xs font-bold text-[#374151] uppercase tracking-wide">
        {label}
      </span>
      <div className="flex-1 h-px bg-[#e2e8f0]" />
    </div>
  );
}
