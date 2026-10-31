import React, { useState, useEffect, useCallback } from "react";
import { useCurrency as useAppCurrency } from "../../contexts/CurrencyContext";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import BankStatementImport from "./BankStatementImport";
import {
  Landmark,
  ArrowLeftRight,
  CheckCircle,
  Circle,
  Plus,
  X,
  Edit2,
  Trash2,
  Search,
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  RefreshCw,
  Upload,
  AlertCircle,
} from "lucide-react";

const inputCls =
  "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md bg-white text-[#1e293b] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-[#2563eb] transition-colors";
const labelCls =
  "block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5";
const selectCls =
  "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md bg-white text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-[#2563eb] transition-colors";
const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString("en-ZA") : "—";

const TABS = [
  { id: "bank-accounts", label: "Bank Accounts", icon: Landmark },
  { id: "transactions", label: "Transactions", icon: ArrowLeftRight },
  { id: "reconciliation", label: "Reconciliation", icon: CheckCircle },
  { id: "import",         label: "Import CSV",     icon: Upload          },
];
const ACCOUNT_TYPES = ["Cheque", "Savings", "Credit Card", "Cash"];
const TX_CATEGORIES = [
  "Sales",
  "Expenses",
  "Payroll",
  "Tax",
  "Transfer",
  "Other",
];

// Props: user, clientId, clientName, defaultTab
export default function BankingView({
  user,
  clientId,
  clientName,
  defaultTab = "bank-accounts",
}) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  // ── Scoped path helper ────────────────────────────────────────────────────
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
        {activeTab === "bank-accounts" && (
          <BankAccountsTab
            user={user}
            clientBase={clientBase}
            clientName={clientName}
          />
        )}
        {activeTab === "transactions" && (
          <TransactionsTab
            user={user}
            clientBase={clientBase}
            clientName={clientName}
          />
        )}
        {activeTab === "reconciliation" && (
          <ReconciliationTab
            user={user}
            clientBase={clientBase}
            clientName={clientName}
          />
        )}
        {activeTab === "import" && (
  <div className="flex-1 overflow-y-auto p-6">
    <BankStatementImport
      user={user}
      clientId={clientId}
      clientName={clientName}
    />
  </div>
)}
      </div>
    </div>
  );
}

// ── Bank Accounts ─────────────────────────────────────────────────────────────
function BankAccountsTab({ user, clientBase, clientName }) {
  const { formatCurrency: formatVisitorCurrency } = useAppCurrency();
  const fmt = (n) => formatVisitorCurrency(n, "ZAR");
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    bank: "",
    accountNumber: "",
    type: "Cheque",
    currency: "USD",
    openingBalance: "",
  });

  const db = getFirestore();
  const [usersCollection, userId, clientsCollection, scopedClientId] = clientBase;
  const col = useCallback(
    () =>
      collection(
        db,
        usersCollection,
        userId,
        clientsCollection,
        scopedClientId,
        "bankAccounts",
      ),
    [db, usersCollection, userId, clientsCollection, scopedClientId],
  );
  const ref = useCallback(
    (id) =>
      doc(
        db,
        usersCollection,
        userId,
        clientsCollection,
        scopedClientId,
        "bankAccounts",
        id,
      ),
    [db, usersCollection, userId, clientsCollection, scopedClientId],
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(col(), orderBy("createdAt", "desc")));
      setAccounts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } finally {
      setLoading(false);
    }
  }, [col]);

  useEffect(() => {
    load();
  }, [load]);

  const blank = () => ({
    name: "",
    bank: "",
    accountNumber: "",
    type: "Cheque",
    currency: "USD",
    openingBalance: "",
  });
  const openAdd = () => {
    setEditing(null);
    setForm(blank());
    setShowModal(true);
  };
  const openEdit = (a) => {
    setEditing(a);
    setForm({
      name: a.name,
      bank: a.bank || "",
      accountNumber: a.accountNumber || "",
      type: a.type || "Cheque",
      currency: a.currency || "USD",
      openingBalance: a.openingBalance || "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.bank.trim()) return;
    setSaving(true);
    const payload = {
      ...form,
      openingBalance: Number(form.openingBalance) || 0,
      currentBalance: editing
        ? editing.currentBalance
        : Number(form.openingBalance) || 0,
    };
    try {
      editing
        ? await updateDoc(ref(editing.id), {
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
    if (!window.confirm("Delete this account?")) return;
    await deleteDoc(ref(id));
    load();
  };
  const totalBal = accounts.reduce((s, a) => s + (a.currentBalance || 0), 0);

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#eff6ff] rounded-lg flex items-center justify-center">
            <Landmark className="w-5 h-5 text-[#2563eb]" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#1e293b]">
              Bank Accounts
            </h2>
            <p className="text-xs text-[#64748b]">
              {clientName} · {accounts.length} accounts · Total {fmt(totalBal)}
            </p>
          </div>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Account
        </button>
      </div>

      {loading ? (
        <EmptyState icon={Landmark} text="Loading…" />
      ) : accounts.length === 0 ? (
        <EmptyState
          icon={Landmark}
          text="No bank accounts yet"
          sub="Add the client's first bank account"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((a) => (
            <div
              key={a.id}
              className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-[#eff6ff] rounded-xl flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-[#2563eb]" />
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEdit(a)}
                    className="p-1.5 text-[#94a3b8] hover:text-[#2563eb] hover:bg-[#eff6ff] rounded-lg transition-all"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="p-1.5 text-[#94a3b8] hover:text-[#dc2626] hover:bg-[#fef2f2] rounded-lg transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <h3 className="text-sm font-semibold text-[#1e293b]">{a.name}</h3>
              <p className="text-xs text-[#64748b] mt-0.5">
                {a.bank} · {a.type}
              </p>
              <p className="text-xs text-[#94a3b8] font-mono mt-1">
                {a.accountNumber ? `****${a.accountNumber.slice(-4)}` : "—"}
              </p>
              <div className="mt-4 pt-3 border-t border-[#f1f5f9]">
                <p className="text-xs text-[#64748b]">Current Balance</p>
                <p
                  className={`text-xl font-bold ${(a.currentBalance || 0) >= 0 ? "text-[#059669]" : "text-[#dc2626]"}`}
                >
                  {fmt(a.currentBalance)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal
          title={editing ? "Edit Bank Account" : "Add Bank Account"}
          onClose={() => setShowModal(false)}
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={labelCls}>Account Nickname *</label>
              <input
                className={inputCls}
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="e.g. FNB Business Cheque"
              />
            </div>
            <div>
              <label className={labelCls}>Bank Name *</label>
              <input
                className={inputCls}
                value={form.bank}
                onChange={(e) =>
                  setForm((p) => ({ ...p, bank: e.target.value }))
                }
                placeholder="e.g. FNB"
              />
            </div>
            <div>
              <label className={labelCls}>Account Type</label>
              <select
                className={selectCls}
                value={form.type}
                onChange={(e) =>
                  setForm((p) => ({ ...p, type: e.target.value }))
                }
              >
                {ACCOUNT_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Account Number</label>
              <input
                className={inputCls}
                value={form.accountNumber}
                onChange={(e) =>
                  setForm((p) => ({ ...p, accountNumber: e.target.value }))
                }
              />
            </div>
            <div>
              <label className={labelCls}>Opening Balance (R)</label>
              <input
                type="number"
                className={inputCls}
                value={form.openingBalance}
                onChange={(e) =>
                  setForm((p) => ({ ...p, openingBalance: e.target.value }))
                }
                placeholder="0.00"
              />
            </div>
          </div>
          <ModalFooter
            onCancel={() => setShowModal(false)}
            onSave={handleSave}
            saving={saving}
            disabled={!form.name.trim() || !form.bank.trim()}
            label={editing ? "Update" : "Add Account"}
          />
        </Modal>
      )}
    </div>
  );
}

// ── Transactions ──────────────────────────────────────────────────────────────
function TransactionsTab({ user, clientBase, clientName }) {
  const { formatCurrency: formatVisitorCurrency } = useAppCurrency();
  const fmt = (n) => formatVisitorCurrency(n, "ZAR");
  const [transactions, setTransactions] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filterAcc, setFilterAcc] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    accountId: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
    type: "debit",
    amount: "",
    category: "Other",
    reference: "",
  });

  const db = getFirestore();
  const txCol = () => collection(db, ...clientBase, "transactions");
  const accCol = () => collection(db, ...clientBase, "bankAccounts");
  const accRef = (id) => doc(db, ...clientBase, "bankAccounts", id);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [txSnap, accSnap] = await Promise.all([
        getDocs(query(txCol(), orderBy("date", "desc"))),
        getDocs(query(accCol())),
      ]);
      setTransactions(txSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      const accs = accSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setBankAccounts(accs);
      if (accs.length > 0)
        setForm((p) => ({ ...p, accountId: p.accountId || accs[0].id }));
    } finally {
      setLoading(false);
    }
  }, [clientBase.join(",")]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async () => {
    if (!form.accountId || !form.description || !form.amount) return;
    setSaving(true);
    try {
      const amount = Number(form.amount);
      await addDoc(txCol(), {
        ...form,
        amount,
        reconciled: false,
        createdAt: serverTimestamp(),
      });
      const snap = await getDoc(accRef(form.accountId));
      if (snap.exists()) {
        const cur = snap.data().currentBalance || 0;
        const delta = form.type === "credit" ? amount : -amount;
        await updateDoc(accRef(form.accountId), {
          currentBalance: cur + delta,
          updatedAt: serverTimestamp(),
        });
      }
      setShowModal(false);
      setForm((p) => ({ ...p, description: "", amount: "", reference: "" }));
      load();
    } finally {
      setSaving(false);
    }
  };

  const filtered = transactions.filter((t) => {
    const q = search.toLowerCase();
    return (
      (filterAcc === "all" || t.accountId === filterAcc) &&
      (filterType === "all" || t.type === filterType) &&
      (t.description?.toLowerCase().includes(q) ||
        t.reference?.toLowerCase().includes(q))
    );
  });

  const totalDebits = filtered
    .filter((t) => t.type === "debit")
    .reduce((s, t) => s + (t.amount || 0), 0);
  const totalCredits = filtered
    .filter((t) => t.type === "credit")
    .reduce((s, t) => s + (t.amount || 0), 0);
  const accName = (id) => bankAccounts.find((a) => a.id === id)?.name || "—";

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#f0fdf4] rounded-lg flex items-center justify-center">
            <ArrowLeftRight className="w-5 h-5 text-[#059669]" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#1e293b]">Transactions</h2>
            <p className="text-xs text-[#64748b]">
              {clientName} · {filtered.length} transactions
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#059669] hover:bg-[#047857] text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Transaction
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Total Debits",
            value: `${fmt(totalDebits)}`,
            icon: TrendingDown,
            bg: "bg-[#fef2f2]",
            color: "text-[#dc2626]",
          },
          {
            label: "Total Credits",
            value: `${fmt(totalCredits)}`,
            icon: TrendingUp,
            bg: "bg-[#f0fdf4]",
            color: "text-[#059669]",
          },
          {
            label: "Net",
            value: `${fmt(totalCredits - totalDebits)}`,
            icon: DollarSign,
            bg: "bg-[#eff6ff]",
            color:
              totalCredits - totalDebits >= 0
                ? "text-[#2563eb]"
                : "text-[#dc2626]",
          },
        ].map(({ label, value, icon: Icon, bg, color }) => (
          <div
            key={label}
            className={`${bg} border border-[#e2e8f0] rounded-xl p-4`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#64748b]">
                {label}
              </span>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <div className={`text-xl font-bold ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 items-center bg-white border border-[#e2e8f0] rounded-xl px-4 py-3 shadow-sm">
        <div className="relative flex-1 min-w-40">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search…"
            className="w-full pl-9 pr-3 py-2 text-sm border border-[#e2e8f0] rounded-lg bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
          />
        </div>
        <select
          className="text-sm border border-[#e2e8f0] rounded-lg px-3 py-2 bg-[#f8fafc] text-[#374151] focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
          value={filterAcc}
          onChange={(e) => setFilterAcc(e.target.value)}
        >
          <option value="all">All Accounts</option>
          {bankAccounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
        <select
          className="text-sm border border-[#e2e8f0] rounded-lg px-3 py-2 bg-[#f8fafc] text-[#374151] focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="all">All Types</option>
          <option value="debit">Debit</option>
          <option value="credit">Credit</option>
        </select>
      </div>

      {loading ? (
        <EmptyState icon={ArrowLeftRight} text="Loading…" />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={ArrowLeftRight}
          text="No transactions found"
          sub="Add a transaction or adjust filters"
        />
      ) : (
        <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#e2e8f0] bg-[#f8fafc]">
                {[
                  "Date",
                  "Description",
                  "Account",
                  "Category",
                  "Type",
                  "Amount",
                  "Reconciled",
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
              {filtered.map((tx) => (
                <tr
                  key={tx.id}
                  className="border-b border-[#f8fafc] hover:bg-[#f8fafc] transition-colors"
                >
                  <td className="px-4 py-3 text-sm text-[#64748b]">
                    {fmtDate(tx.date)}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-[#1e293b]">
                    {tx.description}
                  </td>
                  <td className="px-4 py-3 text-xs text-[#94a3b8]">
                    {accName(tx.accountId)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-[#f1f5f9] text-[#64748b]">
                      {tx.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${tx.type === "credit" ? "bg-[#f0fdf4] text-[#059669]" : "bg-[#fef2f2] text-[#dc2626]"}`}
                    >
                      {tx.type}
                    </span>
                  </td>
                  <td
                    className={`px-4 py-3 text-sm font-semibold ${tx.type === "credit" ? "text-[#059669]" : "text-[#dc2626]"}`}
                  >
                    {tx.type === "credit" ? "+" : "-"}{fmt(tx.amount)}
                  </td>
                  <td className="px-4 py-3">
                    {tx.reconciled ? (
                      <CheckCircle className="w-4 h-4 text-[#059669]" />
                    ) : (
                      <Circle className="w-4 h-4 text-[#d1d5db]" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <Modal title="Add Transaction" onClose={() => setShowModal(false)}>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={labelCls}>Bank Account *</label>
              <select
                className={selectCls}
                value={form.accountId}
                onChange={(e) =>
                  setForm((p) => ({ ...p, accountId: e.target.value }))
                }
              >
                <option value="">Select…</option>
                {bankAccounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className={labelCls}>Description *</label>
              <input
                className={inputCls}
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
              />
            </div>
            <div>
              <label className={labelCls}>Date</label>
              <input
                type="date"
                className={inputCls}
                value={form.date}
                onChange={(e) =>
                  setForm((p) => ({ ...p, date: e.target.value }))
                }
              />
            </div>
            <div>
              <label className={labelCls}>Amount (R) *</label>
              <input
                type="number"
                className={inputCls}
                value={form.amount}
                onChange={(e) =>
                  setForm((p) => ({ ...p, amount: e.target.value }))
                }
                placeholder="0.00"
              />
            </div>
            <div>
              <label className={labelCls}>Type</label>
              <select
                className={selectCls}
                value={form.type}
                onChange={(e) =>
                  setForm((p) => ({ ...p, type: e.target.value }))
                }
              >
                <option value="credit">Credit (In)</option>
                <option value="debit">Debit (Out)</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Category</label>
              <select
                className={selectCls}
                value={form.category}
                onChange={(e) =>
                  setForm((p) => ({ ...p, category: e.target.value }))
                }
              >
                {TX_CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className={labelCls}>Reference</label>
              <input
                className={inputCls}
                value={form.reference}
                onChange={(e) =>
                  setForm((p) => ({ ...p, reference: e.target.value }))
                }
                placeholder="e.g. INV-2025-0042"
              />
            </div>
          </div>
          <ModalFooter
            onCancel={() => setShowModal(false)}
            onSave={handleSave}
            saving={saving}
            disabled={!form.accountId || !form.description || !form.amount}
            label="Add Transaction"
          />
        </Modal>
      )}
    </div>
  );
}

// ── Reconciliation ────────────────────────────────────────────────────────────
function ReconciliationTab({ user, clientBase, clientName }) {
  const { formatCurrency: formatVisitorCurrency } = useAppCurrency();
  const fmt = (n) => formatVisitorCurrency(n, "ZAR");
  const [bankAccounts, setBankAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [selectedAcc, setSelectedAcc] = useState("");
  const [statementBal, setStatementBal] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [checked, setChecked] = useState({});

  const db = getFirestore();
  const accCol = () => collection(db, ...clientBase, "bankAccounts");
  const txCol = () => collection(db, ...clientBase, "transactions");
  const accRef = (id) => doc(db, ...clientBase, "bankAccounts", id);
  const txRef = (id) => doc(db, ...clientBase, "transactions", id);

  useEffect(() => {
    const go = async () => {
      const snap = await getDocs(accCol());
      const accs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setBankAccounts(accs);
      if (accs.length > 0) setSelectedAcc(accs[0].id);
    };
    go();
  }, [clientBase.join(",")]);

  useEffect(() => {
    if (!selectedAcc) return;
    const go = async () => {
      setLoading(true);
      try {
        const q = query(
          txCol(),
          where("accountId", "==", selectedAcc),
          where("reconciled", "==", false),
          orderBy("date", "desc"),
        );
        const snap = await getDocs(q);
        setTransactions(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setChecked({});
      } finally {
        setLoading(false);
      }
    };
    go();
  }, [selectedAcc]);

  const toggle = (id) => setChecked((p) => ({ ...p, [id]: !p[id] }));
  const selAcc_ = bankAccounts.find((a) => a.id === selectedAcc);
  const bookBal = selAcc_?.currentBalance || 0;
  const checkedList = transactions.filter((t) => checked[t.id]);
  const checkedTot = checkedList.reduce(
    (s, t) => s + (t.type === "credit" ? t.amount : -t.amount),
    0,
  );
  const diff = Number(statementBal || 0) - (bookBal + checkedTot);
  const isBalanced = Math.abs(diff) < 0.01;

  const handleReconcile = async () => {
    if (!isBalanced) return;
    setSaving(true);
    try {
      for (const id of checkedList.map((t) => t.id))
        await updateDoc(txRef(id), {
          reconciled: true,
          reconciledAt: serverTimestamp(),
        });
      if (selectedAcc)
        await updateDoc(accRef(selectedAcc), {
          lastReconciledAt: serverTimestamp(),
          lastReconciledBalance: Number(statementBal),
        });
      const q = query(
        txCol(),
        where("accountId", "==", selectedAcc),
        where("reconciled", "==", false),
        orderBy("date", "desc"),
      );
      const snap = await getDocs(q);
      setTransactions(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setChecked({});
      alert("Reconciliation saved!");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-[#faf5ff] rounded-lg flex items-center justify-center">
          <RefreshCw className="w-5 h-5 text-[#7c3aed]" />
        </div>
        <div>
          <h2 className="text-base font-bold text-[#1e293b]">Reconciliation</h2>
          <p className="text-xs text-[#64748b]">
            {clientName} · Match book balance to bank statement
          </p>
        </div>
      </div>

      <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>Bank Account</label>
            <select
              className={selectCls}
              value={selectedAcc}
              onChange={(e) => setSelectedAcc(e.target.value)}
            >
              {bankAccounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Statement Closing Balance (R)</label>
            <input
              type="number"
              className={inputCls}
              value={statementBal}
              onChange={(e) => setStatementBal(e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div className="flex flex-col justify-end">
            <div
              className={`px-4 py-2.5 rounded-xl border text-sm font-semibold flex items-center gap-2 ${isBalanced && statementBal ? "bg-[#f0fdf4] border-[#bbf7d0] text-[#059669]" : "bg-[#f8fafc] border-[#e2e8f0] text-[#64748b]"}`}
            >
              {isBalanced && statementBal ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              {statementBal
                ? isBalanced
                  ? "Balanced ✓"
                  : `Difference: ${fmt(Math.abs(diff))}`
                : "Enter statement balance"}
            </div>
          </div>
        </div>
        {selAcc_ && (
          <div className="mt-4 grid grid-cols-3 gap-3 pt-4 border-t border-[#f1f5f9]">
            {[
              { label: "Book Balance", value: `${fmt(bookBal)}` },
              { label: "Cleared Adjustments", value: `${fmt(checkedTot)}` },
              {
                label: "Adjusted Balance",
                value: `${fmt(bookBal + checkedTot)}`,
              },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <p className="text-xs text-[#64748b]">{label}</p>
                <p className="text-base font-bold text-[#1e293b] mt-0.5">
                  {value}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <EmptyState icon={RefreshCw} text="Loading transactions…" />
      ) : transactions.length === 0 ? (
        <EmptyState
          icon={CheckCircle}
          text="All transactions reconciled"
          sub="No outstanding items for this account"
        />
      ) : (
        <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 bg-[#f8fafc] border-b border-[#e2e8f0] flex items-center justify-between">
            <span className="text-sm font-semibold text-[#374151]">
              Unreconciled Transactions
            </span>
            <span className="text-xs text-[#64748b] bg-[#e2e8f0] px-2 py-0.5 rounded-full">
              {transactions.length}
            </span>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#e2e8f0]">
                <th className="w-10 px-4 py-3" />
                {["Date", "Description", "Reference", "Type", "Amount"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr
                  key={tx.id}
                  onClick={() => toggle(tx.id)}
                  className={`border-b border-[#f8fafc] cursor-pointer transition-colors ${checked[tx.id] ? "bg-[#f0fdf4]" : "hover:bg-[#f8fafc]"}`}
                >
                  <td className="px-4 py-3">
                    {checked[tx.id] ? (
                      <CheckCircle className="w-4 h-4 text-[#059669]" />
                    ) : (
                      <Circle className="w-4 h-4 text-[#d1d5db]" />
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-[#64748b]">
                    {fmtDate(tx.date)}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-[#1e293b]">
                    {tx.description}
                  </td>
                  <td className="px-4 py-3 text-xs text-[#94a3b8]">
                    {tx.reference || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${tx.type === "credit" ? "bg-[#f0fdf4] text-[#059669]" : "bg-[#fef2f2] text-[#dc2626]"}`}
                    >
                      {tx.type}
                    </span>
                  </td>
                  <td
                    className={`px-4 py-3 text-sm font-semibold ${tx.type === "credit" ? "text-[#059669]" : "text-[#dc2626]"}`}
                  >
                    {tx.type === "credit" ? "+" : "-"}{fmt(tx.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-5 py-4 border-t border-[#e2e8f0] bg-[#f8fafc] flex justify-end">
            <button
              onClick={handleReconcile}
              disabled={
                !isBalanced ||
                !statementBal ||
                saving ||
                checkedList.length === 0
              }
              className="flex items-center gap-2 px-5 py-2 bg-[#059669] hover:bg-[#047857] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <CheckCircle className="w-4 h-4" />
              {saving
                ? "Saving…"
                : `Reconcile ${checkedList.length} item${checkedList.length !== 1 ? "s" : ""}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Shared helpers ─────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg border border-[#e2e8f0]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0]">
          <h2 className="text-sm font-semibold text-[#1e293b]">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-[#64748b] hover:bg-[#f1f5f9] rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 space-y-4">{children}</div>
      </div>
    </div>
  );
}
function ModalFooter({ onCancel, onSave, saving, disabled, label }) {
  return (
    <div className="flex justify-end gap-3 pt-4 border-t border-[#f1f5f9] mt-4">
      <button
        onClick={onCancel}
        className="px-4 py-2 text-sm text-[#64748b] hover:bg-[#f1f5f9] rounded-lg"
      >
        Cancel
      </button>
      <button
        onClick={onSave}
        disabled={saving || disabled}
        className="px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium rounded-lg disabled:opacity-50"
      >
        {saving ? "Saving…" : label}
      </button>
    </div>
  );
}
function EmptyState({ icon: Icon, text, sub }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center bg-white border border-[#e2e8f0] rounded-xl">
      <Icon className="w-10 h-10 text-[#cbd5e1] mb-3" />
      <p className="text-sm font-medium text-[#94a3b8]">{text}</p>
      {sub && <p className="text-xs text-[#cbd5e1] mt-1">{sub}</p>}
    </div>
  );
}
