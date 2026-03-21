import React, { useState, useEffect } from "react";
import {
  Landmark, Plus, X, Save, Edit2, Trash2, ArrowUpRight,
  ArrowDownLeft, Search, Filter, RefreshCw, CreditCard,
  TrendingUp, TrendingDown, DollarSign, CheckCircle, Clock
} from "lucide-react";
import { db } from "../../firebase";
import {
  collection, query, getDocs, addDoc, updateDoc,
  deleteDoc, doc, serverTimestamp, orderBy
} from "firebase/firestore";

// ─── Constants ────────────────────────────────────────────────────────────────
const TX_TYPES = ["Income", "Expense", "Transfer", "Refund"];
const CATEGORIES_INCOME  = ["Invoice Payment", "Deposit", "Cash Payment", "EFT Received", "Other Income"];
const CATEGORIES_EXPENSE = ["Supplies", "Fuel", "Staff Wages", "Equipment", "Rent", "Utilities", "Insurance", "Maintenance", "Marketing", "Other Expense"];
const BANKS = ["FNB", "Standard Bank", "ABSA", "Nedbank", "Capitec", "Discovery Bank", "African Bank", "Other"];

const TYPE_CONFIG = {
  Income:   { icon: ArrowDownLeft,  bg: "bg-[#dcfce7]", text: "text-[#166534]",  dot: "bg-[#059669]", sign: "+" },
  Expense:  { icon: ArrowUpRight,   bg: "bg-[#fee2e2]", text: "text-[#991b1b]",  dot: "bg-[#dc2626]", sign: "-" },
  Transfer: { icon: RefreshCw,      bg: "bg-[#dbeafe]", text: "text-[#1d4ed8]",  dot: "bg-[#2563eb]", sign: "" },
  Refund:   { icon: ArrowDownLeft,  bg: "bg-[#f3e8ff]", text: "text-[#6b21a8]",  dot: "bg-[#7c3aed]", sign: "+" },
};

const EMPTY_TX = {
  date: new Date().toISOString().split("T")[0],
  description: "", type: "Income", category: "Invoice Payment",
  amount: "", reference: "", notes: "", reconciled: false, accountName: ""
};

const EMPTY_ACCOUNT = {
  bankName: "FNB", accountName: "", accountNumber: "",
  branchCode: "", accountType: "Cheque", openingBalance: "0", notes: ""
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function BankingView({ user }) {
  const [accounts, setAccounts]           = useState([]);
  const [transactions, setTransactions]   = useState([]);
  const [loading, setLoading]             = useState(true);
  const [activeTab, setActiveTab]         = useState("transactions"); // "transactions" | "accounts"
  const [showTxModal, setShowTxModal]     = useState(false);
  const [showAcctModal, setShowAcctModal] = useState(false);
  const [editTx, setEditTx]               = useState(null);
  const [editAcct, setEditAcct]           = useState(null);
  const [txForm, setTxForm]               = useState(EMPTY_TX);
  const [acctForm, setAcctForm]           = useState(EMPTY_ACCOUNT);
  const [saving, setSaving]               = useState(false);
  const [search, setSearch]               = useState("");
  const [filterType, setFilterType]       = useState("all");
  const [filterAcct, setFilterAcct]       = useState("all");

  useEffect(() => { if (user?.uid) load(); }, [user]);

  const load = async () => {
    setLoading(true);
    try {
      const [txSnap, acctSnap] = await Promise.all([
        getDocs(query(collection(db, "users", user.uid, "bankTransactions"), orderBy("date", "desc"))),
        getDocs(query(collection(db, "users", user.uid, "bankAccounts"), orderBy("createdAt", "desc"))),
      ]);
      setTransactions(txSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setAccounts(acctSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  // ── Transaction CRUD ────────────────────────────────────────────────────────
  const openTxCreate = () => { setEditTx(null); setTxForm(EMPTY_TX); setShowTxModal(true); };
  const openTxEdit   = (tx) => { setEditTx(tx); setTxForm({ ...EMPTY_TX, ...tx }); setShowTxModal(true); };

  const handleSaveTx = async () => {
    if (!txForm.description || !txForm.amount) return alert("Description and amount required");
    setSaving(true);
    try {
      const data = { ...txForm, amount: Number(txForm.amount), updatedAt: serverTimestamp() };
      if (editTx) {
        await updateDoc(doc(db, "users", user.uid, "bankTransactions", editTx.id), data);
      } else {
        await addDoc(collection(db, "users", user.uid, "bankTransactions"), { ...data, createdAt: serverTimestamp() });
      }
      setShowTxModal(false);
      load();
    } catch (e) { alert("Failed to save"); }
    finally { setSaving(false); }
  };

  const handleDeleteTx = async (id) => {
    if (!window.confirm("Delete this transaction?")) return;
    await deleteDoc(doc(db, "users", user.uid, "bankTransactions", id));
    load();
  };

  const toggleReconciled = async (tx) => {
    await updateDoc(doc(db, "users", user.uid, "bankTransactions", tx.id), {
      reconciled: !tx.reconciled, updatedAt: serverTimestamp()
    });
    load();
  };

  // ── Account CRUD ─────────────────────────────────────────────────────────────
  const openAcctCreate = () => { setEditAcct(null); setAcctForm(EMPTY_ACCOUNT); setShowAcctModal(true); };
  const openAcctEdit   = (a) => { setEditAcct(a); setAcctForm({ ...EMPTY_ACCOUNT, ...a }); setShowAcctModal(true); };

  const handleSaveAcct = async () => {
    if (!acctForm.accountName || !acctForm.accountNumber) return alert("Account name and number required");
    setSaving(true);
    try {
      const data = { ...acctForm, updatedAt: serverTimestamp() };
      if (editAcct) {
        await updateDoc(doc(db, "users", user.uid, "bankAccounts", editAcct.id), data);
      } else {
        await addDoc(collection(db, "users", user.uid, "bankAccounts"), { ...data, createdAt: serverTimestamp() });
      }
      setShowAcctModal(false);
      load();
    } catch (e) { alert("Failed to save"); }
    finally { setSaving(false); }
  };

  const handleDeleteAcct = async (id) => {
    if (!window.confirm("Remove this bank account?")) return;
    await deleteDoc(doc(db, "users", user.uid, "bankAccounts", id));
    load();
  };

  // ── Derived values ───────────────────────────────────────────────────────────
  const totalIncome  = transactions.filter(t => t.type === "Income"  || t.type === "Refund").reduce((s, t) => s + Number(t.amount || 0), 0);
  const totalExpense = transactions.filter(t => t.type === "Expense").reduce((s, t) => s + Number(t.amount || 0), 0);
  const netBalance   = totalIncome - totalExpense;
  const unreconciledCount = transactions.filter(t => !t.reconciled).length;

  const filteredTx = transactions.filter(tx => {
    const matchSearch = !search || tx.description?.toLowerCase().includes(search.toLowerCase()) || tx.reference?.toLowerCase().includes(search.toLowerCase());
    const matchType   = filterType === "all" || tx.type === filterType;
    const matchAcct   = filterAcct === "all" || tx.accountName === filterAcct;
    return matchSearch && matchType && matchAcct;
  });

  // ── Calculate account balance ────────────────────────────────────────────────
  const getAccountBalance = (acct) => {
    const opening = Number(acct.openingBalance || 0);
    const txs = transactions.filter(t => t.accountName === acct.accountName);
    const income  = txs.filter(t => t.type === "Income" || t.type === "Refund").reduce((s, t) => s + Number(t.amount || 0), 0);
    const expense = txs.filter(t => t.type === "Expense").reduce((s, t) => s + Number(t.amount || 0), 0);
    return opening + income - expense;
  };

  const categoryOptions = txForm.type === "Expense" ? CATEGORIES_EXPENSE : CATEGORIES_INCOME;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#1e293b] flex items-center gap-2">
            <Landmark className="w-5 h-5 text-[#0891b2]" /> Banking
          </h1>
          <p className="text-sm text-[#64748b] mt-0.5">
            Track transactions, accounts & reconciliation
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={openAcctCreate}
            className="flex items-center gap-2 px-3 py-2 bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#374151] text-sm font-medium rounded-lg border border-[#e2e8f0]"
          >
            <CreditCard className="w-4 h-4" /> Add Account
          </button>
          <button
            onClick={openTxCreate}
            className="flex items-center gap-2 px-4 py-2 bg-[#0891b2] hover:bg-[#0e7490] text-white text-sm font-medium rounded-lg"
          >
            <Plus className="w-4 h-4" /> Add Transaction
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Income",    value: `R${totalIncome.toFixed(2)}`,   color: "text-[#059669]", bg: "bg-[#dcfce7]", icon: TrendingUp },
          { label: "Total Expenses",  value: `R${totalExpense.toFixed(2)}`,  color: "text-[#dc2626]", bg: "bg-[#fee2e2]", icon: TrendingDown },
          { label: "Net Balance",     value: `R${netBalance.toFixed(2)}`,    color: netBalance >= 0 ? "text-[#0891b2]" : "text-[#dc2626]", bg: "bg-[#ecfeff]", icon: DollarSign },
          { label: "Unreconciled",    value: unreconciledCount,              color: unreconciledCount > 0 ? "text-[#d97706]" : "text-[#059669]", bg: unreconciledCount > 0 ? "bg-[#fef3c7]" : "bg-[#dcfce7]", icon: Clock },
        ].map(({ label, value, color, bg, icon: Icon }) => (
          <div key={label} className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wide">{label}</p>
              <div className={`w-7 h-7 ${bg} rounded-lg flex items-center justify-center`}>
                <Icon className={`w-3.5 h-3.5 ${color}`} />
              </div>
            </div>
            <p className={`text-xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Account cards (if any) */}
      {accounts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {accounts.map((acct, i) => {
            const balance = getAccountBalance(acct);
            const GRAD = ["from-[#0891b2] to-[#0e7490]","from-[#7c3aed] to-[#5b21b6]","from-[#059669] to-[#047857]","from-[#d97706] to-[#b45309]"];
            return (
              <div key={acct.id} className={`bg-gradient-to-br ${GRAD[i % GRAD.length]} rounded-xl p-4 text-white shadow-md relative overflow-hidden`}>
                <div className="absolute right-3 top-3 opacity-10">
                  <CreditCard className="w-16 h-16" />
                </div>
                <p className="text-xs font-semibold text-white/70 uppercase tracking-widest">{acct.bankName}</p>
                <p className="font-bold mt-1">{acct.accountName}</p>
                <p className="font-mono text-sm text-white/80 mt-0.5">
                  {acct.accountNumber.replace(/(\d{4})(?=\d)/g, "$1 ")}
                </p>
                <p className="text-2xl font-bold mt-3">R{balance.toFixed(2)}</p>
                <p className="text-xs text-white/60 mt-0.5">{acct.accountType}</p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => openAcctEdit(acct)}
                    className="text-xs px-2 py-1 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteAcct(acct.id)}
                    className="text-xs px-2 py-1 bg-white/20 hover:bg-red-500/40 rounded-lg transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
        <div className="flex border-b border-[#e2e8f0] bg-[#f8fafc]">
          {["transactions", "accounts"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                activeTab === tab
                  ? "border-[#0891b2] text-[#0891b2] bg-white"
                  : "border-transparent text-[#64748b] hover:text-[#374151]"
              }`}
            >
              {tab === "transactions" ? `Transactions (${transactions.length})` : `Accounts (${accounts.length})`}
            </button>
          ))}
        </div>

        {/* Transactions tab */}
        {activeTab === "transactions" && (
          <>
            {/* Filters */}
            <div className="p-3 border-b border-[#e2e8f0] flex flex-wrap gap-2">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94a3b8]" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search transactions…"
                  className="w-full pl-8 pr-3 py-1.5 text-sm border border-[#e2e8f0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0891b2] bg-[#f8fafc]"
                />
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {["all", ...TX_TYPES].map(t => (
                  <button
                    key={t}
                    onClick={() => setFilterType(t)}
                    className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors ${
                      filterType === t ? "bg-[#0891b2] text-white" : "bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0]"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              {accounts.length > 0 && (
                <select
                  value={filterAcct}
                  onChange={e => setFilterAcct(e.target.value)}
                  className="px-3 py-1.5 text-xs border border-[#e2e8f0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0891b2] bg-[#f8fafc] text-[#64748b]"
                >
                  <option value="all">All Accounts</option>
                  {accounts.map(a => <option key={a.id} value={a.accountName}>{a.accountName}</option>)}
                </select>
              )}
            </div>

            {/* Transaction list */}
            {loading ? (
              <div className="py-12 text-center text-sm text-[#94a3b8]">Loading…</div>
            ) : filteredTx.length === 0 ? (
              <div className="py-16 text-center">
                <Landmark className="w-10 h-10 text-[#cbd5e1] mx-auto mb-3" />
                <p className="text-sm text-[#94a3b8]">No transactions found</p>
                <button onClick={openTxCreate} className="mt-3 px-4 py-2 bg-[#0891b2] text-white text-sm rounded-lg">
                  Add First Transaction
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#e2e8f0] bg-[#f8fafc]">
                      {["Date", "Description", "Category", "Account", "Amount", "✓", ""].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wide">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f1f5f9]">
                    {filteredTx.map(tx => {
                      const cfg = TYPE_CONFIG[tx.type] || TYPE_CONFIG.Income;
                      const Icon = cfg.icon;
                      return (
                        <tr key={tx.id} className="hover:bg-[#f8fafc] transition-colors">
                          <td className="px-4 py-3 text-sm text-[#64748b] whitespace-nowrap">{tx.date}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className={`w-6 h-6 rounded-full ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                                <Icon className={`w-3 h-3 ${cfg.text}`} />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-[#374151] truncate max-w-[180px]">{tx.description}</p>
                                {tx.reference && <p className="text-xs text-[#94a3b8]">Ref: {tx.reference}</p>}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs bg-[#f1f5f9] text-[#475569] px-2 py-0.5 rounded">
                              {tx.category}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-[#64748b]">{tx.accountName || "—"}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`text-sm font-bold ${
                              tx.type === "Expense" ? "text-[#dc2626]" : "text-[#059669]"
                            }`}>
                              {cfg.sign}R{Number(tx.amount || 0).toFixed(2)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => toggleReconciled(tx)}
                              title={tx.reconciled ? "Reconciled — click to undo" : "Mark as reconciled"}
                              className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                                tx.reconciled
                                  ? "bg-[#dcfce7] text-[#059669] hover:bg-[#bbf7d0]"
                                  : "bg-[#f1f5f9] text-[#cbd5e1] hover:bg-[#e2e8f0] hover:text-[#94a3b8]"
                              }`}
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              <button
                                onClick={() => openTxEdit(tx)}
                                className="p-1.5 text-[#94a3b8] hover:text-[#374151] hover:bg-[#e2e8f0] rounded"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteTx(tx.id)}
                                className="p-1.5 text-[#94a3b8] hover:text-[#dc2626] hover:bg-[#fef2f2] rounded"
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
          </>
        )}

        {/* Accounts tab */}
        {activeTab === "accounts" && (
          <div className="p-4">
            {accounts.length === 0 ? (
              <div className="py-16 text-center">
                <CreditCard className="w-10 h-10 text-[#cbd5e1] mx-auto mb-3" />
                <p className="text-sm text-[#94a3b8]">No bank accounts added yet</p>
                <button onClick={openAcctCreate} className="mt-3 px-4 py-2 bg-[#0891b2] text-white text-sm rounded-lg">
                  Add Bank Account
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {accounts.map(acct => (
                  <div key={acct.id} className="flex items-center justify-between p-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#0891b2] rounded-lg flex items-center justify-center">
                        <Landmark className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-[#1e293b]">{acct.accountName}</p>
                        <p className="text-xs text-[#64748b]">{acct.bankName} · {acct.accountType} · {acct.accountNumber}</p>
                        {acct.branchCode && <p className="text-xs text-[#94a3b8]">Branch: {acct.branchCode}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xs text-[#94a3b8]">Balance</p>
                        <p className="font-bold text-[#059669]">R{getAccountBalance(acct).toFixed(2)}</p>
                      </div>
                      <button onClick={() => openAcctEdit(acct)} className="p-1.5 text-[#94a3b8] hover:text-[#374151] hover:bg-[#e2e8f0] rounded-lg">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteAcct(acct.id)} className="p-1.5 text-[#94a3b8] hover:text-[#dc2626] hover:bg-[#fef2f2] rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Transaction Modal ───────────────────────────────────────────────────── */}
      {showTxModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#e2e8f0]">
              <h2 className="text-base font-semibold text-[#1e293b]">
                {editTx ? "Edit Transaction" : "New Transaction"}
              </h2>
              <button onClick={() => setShowTxModal(false)} className="p-1.5 text-[#94a3b8] hover:bg-[#e2e8f0] rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">
                  Description *
                </label>
                <input
                  value={txForm.description}
                  onChange={e => setTxForm({ ...txForm, description: e.target.value })}
                  placeholder="e.g. Payment from Johnson Residence"
                  className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">Date</label>
                  <input
                    type="date"
                    value={txForm.date}
                    onChange={e => setTxForm({ ...txForm, date: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">
                    Amount (R) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={txForm.amount}
                    onChange={e => setTxForm({ ...txForm, amount: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">Type</label>
                  <select
                    value={txForm.type}
                    onChange={e => setTxForm({ ...txForm, type: e.target.value, category: "" })}
                    className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2]"
                  >
                    {TX_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">Category</label>
                  <select
                    value={txForm.category}
                    onChange={e => setTxForm({ ...txForm, category: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2]"
                  >
                    {categoryOptions.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {accounts.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">
                    Bank Account
                  </label>
                  <select
                    value={txForm.accountName}
                    onChange={e => setTxForm({ ...txForm, accountName: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2]"
                  >
                    <option value="">No specific account</option>
                    {accounts.map(a => <option key={a.id} value={a.accountName}>{a.accountName}</option>)}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">
                  Reference
                </label>
                <input
                  value={txForm.reference}
                  onChange={e => setTxForm({ ...txForm, reference: e.target.value })}
                  placeholder="Invoice number, cheque number…"
                  className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">Notes</label>
                <textarea
                  value={txForm.notes}
                  onChange={e => setTxForm({ ...txForm, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2] resize-none"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={txForm.reconciled}
                  onChange={e => setTxForm({ ...txForm, reconciled: e.target.checked })}
                  className="w-4 h-4 rounded border-[#d1d5db] text-[#0891b2] focus:ring-[#0891b2]"
                />
                <span className="text-sm text-[#374151]">Mark as reconciled</span>
              </label>
            </div>
            <div className="flex justify-end gap-3 px-5 py-4 border-t border-[#e2e8f0]">
              <button
                onClick={() => setShowTxModal(false)}
                className="px-4 py-2 text-sm border border-[#e2e8f0] rounded-lg text-[#64748b] hover:bg-[#f8fafc]"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTx}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-[#0891b2] text-white text-sm font-medium rounded-lg disabled:opacity-50"
              >
                <Save className="w-4 h-4" />{saving ? "Saving…" : "Save Transaction"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Account Modal ────────────────────────────────────────────────────────── */}
      {showAcctModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#e2e8f0]">
              <h2 className="text-base font-semibold text-[#1e293b]">
                {editAcct ? "Edit Account" : "Add Bank Account"}
              </h2>
              <button onClick={() => setShowAcctModal(false)} className="p-1.5 text-[#94a3b8] hover:bg-[#e2e8f0] rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">
                  Account Name *
                </label>
                <input
                  value={acctForm.accountName}
                  onChange={e => setAcctForm({ ...acctForm, accountName: e.target.value })}
                  placeholder="e.g. Sparkle Clean Main Account"
                  className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">Bank</label>
                  <select
                    value={acctForm.bankName}
                    onChange={e => setAcctForm({ ...acctForm, bankName: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2]"
                  >
                    {BANKS.map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">
                    Account Type
                  </label>
                  <select
                    value={acctForm.accountType}
                    onChange={e => setAcctForm({ ...acctForm, accountType: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2]"
                  >
                    {["Cheque", "Savings", "Current", "Credit", "Business"].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">
                    Account Number *
                  </label>
                  <input
                    value={acctForm.accountNumber}
                    onChange={e => setAcctForm({ ...acctForm, accountNumber: e.target.value })}
                    placeholder="62012345678"
                    className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">
                    Branch Code
                  </label>
                  <input
                    value={acctForm.branchCode}
                    onChange={e => setAcctForm({ ...acctForm, branchCode: e.target.value })}
                    placeholder="250655"
                    className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">
                  Opening Balance (R)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={acctForm.openingBalance}
                  onChange={e => setAcctForm({ ...acctForm, openingBalance: e.target.value })}
                  placeholder="0.00"
                  className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">Notes</label>
                <textarea
                  value={acctForm.notes}
                  onChange={e => setAcctForm({ ...acctForm, notes: e.target.value })}
                  rows={2}
                  placeholder="e.g. Primary operating account"
                  className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2] resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 px-5 py-4 border-t border-[#e2e8f0]">
              <button
                onClick={() => setShowAcctModal(false)}
                className="px-4 py-2 text-sm border border-[#e2e8f0] rounded-lg text-[#64748b] hover:bg-[#f8fafc]"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAcct}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-[#0891b2] text-white text-sm font-medium rounded-lg disabled:opacity-50"
              >
                <Save className="w-4 h-4" />{saving ? "Saving…" : "Save Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}