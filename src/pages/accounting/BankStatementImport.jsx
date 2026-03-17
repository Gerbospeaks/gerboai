import React, { useState, useRef, useCallback } from "react";
import {
  getFirestore, collection, query, where,
  getDocs, addDoc, updateDoc, doc,
  serverTimestamp, getDoc,
} from "firebase/firestore";
import {
  Upload, FileText, CheckCircle, AlertCircle,
  ArrowRight, X, RefreshCw, ChevronDown,
  Trash2, AlertTriangle, Database, Eye,
  TrendingUp, TrendingDown, Minus,
} from "lucide-react";

// ── Design tokens ─────────────────────────────────────────────────────────────
const inputCls  = "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md bg-white text-[#1e293b] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-[#2563eb] transition-colors";
const labelCls  = "block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5";
const selectCls = "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md bg-white text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-[#2563eb] transition-colors";
const fmt       = (n) => Number(n || 0).toLocaleString("en-ZA", { minimumFractionDigits: 2 });

// ── SA Bank format profiles ───────────────────────────────────────────────────
// Each profile describes how to identify a bank's CSV and what its columns mean.
const BANK_PROFILES = [
  {
    id: "fnb",
    name: "FNB (First National Bank)",
    logo: "FNB",
    color: "#006400",
    // FNB exports: Date,Description,Amount,Balance  (single Amount col, negative = debit)
    detect: (headers) => headers.some((h) => /\bfnb\b/i.test(h)) || (headers.includes("amount") && !headers.includes("debit") && !headers.includes("credit") && headers.includes("balance")),
    dateCol:   ["date", "transaction date"],
    descCol:   ["description", "narrative", "details"],
    amountCol: ["amount"],          // signed — negative = debit
    debitCol:  [],
    creditCol: [],
    balanceCol:["balance", "running balance"],
    dateFormat:"DD/MM/YYYY",
  },
  {
    id: "standardbank",
    name: "Standard Bank",
    logo: "STD",
    color: "#003087",
    detect: (headers) => headers.some((h) => /standard/i.test(h)) || (headers.includes("debit") && headers.includes("credit") && headers.includes("balance") && !headers.includes("absa")),
    dateCol:   ["date", "transaction date"],
    descCol:   ["description", "transaction details", "narrative"],
    amountCol: [],
    debitCol:  ["debit", "debit amount"],
    creditCol: ["credit", "credit amount"],
    balanceCol:["balance", "closing balance"],
    dateFormat:"DD/MM/YYYY",
  },
  {
    id: "absa",
    name: "ABSA",
    logo: "ABSA",
    color: "#dc0a0a",
    detect: (headers) => headers.some((h) => /absa/i.test(h)) || (headers.includes("transaction date") && headers.includes("debit amount")),
    dateCol:   ["transaction date", "date"],
    descCol:   ["description", "transaction description"],
    amountCol: [],
    debitCol:  ["debit amount", "debit"],
    creditCol: ["credit amount", "credit"],
    balanceCol:["running balance", "balance"],
    dateFormat:"YYYY-MM-DD",
  },
  {
    id: "nedbank",
    name: "Nedbank",
    logo: "NED",
    color: "#007a3d",
    detect: (headers) => headers.some((h) => /nedbank/i.test(h)),
    dateCol:   ["date", "transaction date"],
    descCol:   ["description", "transaction description"],
    amountCol: [],
    debitCol:  ["debit", "debit amount"],
    creditCol: ["credit", "credit amount"],
    balanceCol:["closing balance", "balance"],
    dateFormat:"DD/MM/YYYY",
  },
  {
    id: "capitec",
    name: "Capitec",
    logo: "CAP",
    color: "#0066cc",
    detect: (headers) => headers.some((h) => /capitec/i.test(h)),
    dateCol:   ["date", "transaction date"],
    descCol:   ["transaction", "description", "details"],
    amountCol: [],
    debitCol:  ["debit", "debit amount"],
    creditCol: ["credit", "credit amount"],
    balanceCol:["balance"],
    dateFormat:"YYYY/MM/DD",
  },
  {
    id: "generic",
    name: "Other / Generic",
    logo: "GEN",
    color: "#64748b",
    detect: () => true, // fallback
    dateCol:   ["date", "transaction date", "value date"],
    descCol:   ["description", "details", "narrative", "transaction"],
    amountCol: ["amount"],
    debitCol:  ["debit", "debit amount"],
    creditCol: ["credit", "credit amount"],
    balanceCol:["balance", "running balance", "closing balance"],
    dateFormat:"DD/MM/YYYY",
  },
];

// ── CSV parser ────────────────────────────────────────────────────────────────
function parseCSV(text) {
  const lines  = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  const result = [];
  for (const line of lines) {
    if (!line.trim()) continue;
    const row = [];
    let cur = "", inQuote = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { inQuote = !inQuote; continue; }
      if (ch === "," && !inQuote) { row.push(cur.trim()); cur = ""; continue; }
      cur += ch;
    }
    row.push(cur.trim());
    result.push(row);
  }
  return result;
}

// ── Date normaliser ───────────────────────────────────────────────────────────
function normaliseDate(raw) {
  if (!raw) return null;
  const clean = raw.trim().replace(/['"]/g, "");

  // Try ISO first
  if (/^\d{4}-\d{2}-\d{2}/.test(clean)) return clean.slice(0, 10);

  // DD/MM/YYYY or DD-MM-YYYY
  const dmy = clean.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/);
  if (dmy) return `${dmy[3]}-${dmy[2].padStart(2,"0")}-${dmy[1].padStart(2,"0")}`;

  // MM/DD/YYYY
  const mdy = clean.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/);
  if (mdy) {
    const year = mdy[3].length === 2 ? `20${mdy[3]}` : mdy[3];
    return `${year}-${mdy[1].padStart(2,"0")}-${mdy[2].padStart(2,"0")}`;
  }

  // YYYY/MM/DD
  const ymd = clean.match(/^(\d{4})[\/\-\.](\d{2})[\/\-\.](\d{2})/);
  if (ymd) return `${ymd[1]}-${ymd[2]}-${ymd[3]}`;

  return null;
}

// ── Amount normaliser ─────────────────────────────────────────────────────────
function normaliseAmount(raw) {
  if (!raw && raw !== 0) return null;
  const clean = String(raw).trim().replace(/['"R\s]/g, "").replace(/,/g, "");
  const n = parseFloat(clean);
  return isNaN(n) ? null : n;
}

// ── Find best matching header ─────────────────────────────────────────────────
function findCol(headers, candidates) {
  const lower = headers.map((h) => h.toLowerCase().trim());
  for (const c of candidates) {
    const idx = lower.indexOf(c.toLowerCase());
    if (idx !== -1) return idx;
  }
  // Partial match fallback
  for (const c of candidates) {
    const idx = lower.findIndex((h) => h.includes(c.toLowerCase()));
    if (idx !== -1) return idx;
  }
  return -1;
}

// ── Detect bank from headers ──────────────────────────────────────────────────
function detectBank(headers) {
  const lower = headers.map((h) => h.toLowerCase().trim());
  for (const profile of BANK_PROFILES.slice(0, -1)) { // skip "generic" in auto-detect
    if (profile.detect(lower)) return profile;
  }
  return BANK_PROFILES[BANK_PROFILES.length - 1]; // generic
}

// ── Build column map from profile ─────────────────────────────────────────────
function buildColMap(headers, profile) {
  return {
    date:    findCol(headers, profile.dateCol),
    desc:    findCol(headers, profile.descCol),
    amount:  findCol(headers, profile.amountCol),
    debit:   findCol(headers, profile.debitCol),
    credit:  findCol(headers, profile.creditCol),
    balance: findCol(headers, profile.balanceCol),
  };
}

// ── Parse a row into a transaction ────────────────────────────────────────────
function parseRow(row, colMap) {
  const date    = normaliseDate(colMap.date   >= 0 ? row[colMap.date]   : null);
  const desc    = colMap.desc  >= 0 ? (row[colMap.desc] || "").trim() : "";
  const balance = colMap.balance >= 0 ? normaliseAmount(row[colMap.balance]) : null;

  let amount = null, type = null;

  if (colMap.amount >= 0) {
    // Single signed amount column
    const raw = normaliseAmount(row[colMap.amount]);
    if (raw !== null) {
      amount = Math.abs(raw);
      type   = raw < 0 ? "debit" : "credit";
    }
  } else {
    // Separate debit / credit columns
    const debit  = colMap.debit  >= 0 ? normaliseAmount(row[colMap.debit])  : null;
    const credit = colMap.credit >= 0 ? normaliseAmount(row[colMap.credit]) : null;
    if (debit && debit > 0)  { amount = debit;  type = "debit";  }
    if (credit && credit > 0){ amount = credit; type = "credit"; }
  }

  return { date, desc, amount, type, balance };
}

// ── TX_CATEGORIES (same as BankingView) ───────────────────────────────────────
const TX_CATEGORIES = ["Sales","Expenses","Payroll","Tax","Transfer","Other"];

// ── Steps ─────────────────────────────────────────────────────────────────────
const STEPS = ["Upload", "Map columns", "Preview & edit", "Import"];

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// Props: user, clientId, clientName
// ══════════════════════════════════════════════════════════════════════════════
export default function BankStatementImport({ user, clientId, clientName }) {
  const [step,         setStep]         = useState(0);  // 0-3
  const [dragOver,     setDragOver]     = useState(false);
  const [fileName,     setFileName]     = useState("");
  const [rawRows,      setRawRows]      = useState([]);   // all parsed CSV rows
  const [headers,      setHeaders]      = useState([]);
  const [bank,         setBank]         = useState(null);
  const [colMap,       setColMap]       = useState({});
  const [bankAccounts, setBankAccounts] = useState([]);
  const [selectedAccId,setSelectedAccId]= useState("");
  const [txRows,       setTxRows]       = useState([]);   // parsed + editable rows
  const [importing,    setImporting]    = useState(false);
  const [importResult, setImportResult] = useState(null); // { imported, skipped, errors }
  const [loadingAccs,  setLoadingAccs]  = useState(false);

  const fileRef = useRef();
  const db      = getFirestore();
  const clientBase = ["users", user.uid, "clients", clientId];

  // ── Load bank accounts ──────────────────────────────────────────────────────
  const loadAccounts = useCallback(async () => {
    setLoadingAccs(true);
    try {
      const snap = await getDocs(collection(db, ...clientBase, "bankAccounts"));
      const accs  = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setBankAccounts(accs);
      if (accs.length > 0) setSelectedAccId(accs[0].id);
    } finally { setLoadingAccs(false); }
  }, [clientId, user.uid]);

  React.useEffect(() => { loadAccounts(); }, [loadAccounts]);

  // ── Handle file ─────────────────────────────────────────────────────────────
  const processFile = (file) => {
    if (!file || !file.name.endsWith(".csv")) {
      alert("Please upload a .csv file.");
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const rows     = parseCSV(e.target.result);
      if (rows.length < 2) { alert("CSV appears to be empty or has only headers."); return; }

      // Find header row (first non-empty row)
      let headerIdx = 0;
      for (let i = 0; i < Math.min(rows.length, 5); i++) {
        if (rows[i].some((c) => /date|description|amount|debit|credit|balance/i.test(c))) {
          headerIdx = i;
          break;
        }
      }

      const hdrs    = rows[headerIdx].map((h) => h.trim());
      const data    = rows.slice(headerIdx + 1).filter((r) => r.some((c) => c.trim()));
      const profile = detectBank(hdrs);
      const map     = buildColMap(hdrs, profile);

      setHeaders(hdrs);
      setRawRows(data);
      setBank(profile);
      setColMap(map);
      setStep(1);
    };
    reader.readAsText(file, "UTF-8");
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    processFile(e.dataTransfer.files[0]);
  };

  const handleFileInput = (e) => processFile(e.target.files[0]);

  // ── Proceed from column mapping → preview ──────────────────────────────────
  const buildPreview = () => {
    const parsed = rawRows
      .map((row, i) => {
        const tx = parseRow(row, colMap);
        return {
          _id:      i,
          _exclude: false,
          _error:   !tx.date ? "No date" : !tx.amount ? "No amount" : !tx.type ? "No type" : null,
          date:        tx.date     || "",
          description: tx.desc     || "",
          amount:      tx.amount   || 0,
          type:        tx.type     || "debit",
          balance:     tx.balance,
          category:    "Other",
          reference:   "",
        };
      });
    setTxRows(parsed);
    setStep(2);
  };

  // ── Import to Firestore ─────────────────────────────────────────────────────
  const handleImport = async () => {
    if (!selectedAccId) { alert("Please select a bank account."); return; }
    setImporting(true);
    let imported = 0, skipped = 0, errors = 0;

    try {
      // Fetch existing tx hashes for duplicate detection
      const existingSnap = await getDocs(
        query(collection(db, ...clientBase, "transactions"),
          where("accountId", "==", selectedAccId))
      );
      // Build a set of "date|amount|type" fingerprints
      const existing = new Set(
        existingSnap.docs.map((d) => {
          const tx = d.data();
          return `${tx.date}|${tx.amount}|${tx.type}`;
        })
      );

      const toImport = txRows.filter((r) => !r._exclude && !r._error);

      for (const row of toImport) {
        const fingerprint = `${row.date}|${row.amount}|${row.type}`;
        if (existing.has(fingerprint)) { skipped++; continue; }

        try {
          await addDoc(collection(db, ...clientBase, "transactions"), {
            accountId:   selectedAccId,
            date:        row.date,
            description: row.description,
            amount:      Number(row.amount),
            type:        row.type,
            category:    row.category,
            reference:   row.reference || "",
            balance:     row.balance   || null,
            reconciled:  false,
            importedAt:  serverTimestamp(),
            createdAt:   serverTimestamp(),
          });
          existing.add(fingerprint);
          imported++;
        } catch (_) { errors++; }
      }

      // Update bank account balance with the last balance figure
      const lastWithBalance = [...toImport].reverse().find((r) => r.balance !== null && r.balance !== undefined);
      if (lastWithBalance?.balance !== null && lastWithBalance?.balance !== undefined) {
        await updateDoc(doc(db, ...clientBase, "bankAccounts", selectedAccId), {
          currentBalance: lastWithBalance.balance,
          lastImportAt:   serverTimestamp(),
        });
      }

      setImportResult({ imported, skipped, errors, total: toImport.length + skipped });
      setStep(3);
    } finally { setImporting(false); }
  };

  // ── Reset ───────────────────────────────────────────────────────────────────
  const reset = () => {
    setStep(0); setFileName(""); setRawRows([]); setHeaders([]);
    setBank(null); setColMap({}); setTxRows([]); setImportResult(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  // ── Col map update helper ───────────────────────────────────────────────────
  const updateColMap = (field, idx) => {
    setColMap((p) => ({ ...p, [field]: Number(idx) }));
  };

  // ── Tx row edit helpers ─────────────────────────────────────────────────────
  const updateRow = (id, field, value) => {
    setTxRows((p) => p.map((r) => r._id === id ? { ...r, [field]: value } : r));
  };
  const toggleExclude = (id) => {
    setTxRows((p) => p.map((r) => r._id === id ? { ...r, _exclude: !r._exclude } : r));
  };
  const excludeAll = () => setTxRows((p) => p.map((r) => ({ ...r, _exclude: !!r._error })));

  const validRows   = txRows.filter((r) => !r._exclude && !r._error);
  const errorRows   = txRows.filter((r) => r._error);
  const excludedRows= txRows.filter((r) => r._exclude);
  const totalCredit = validRows.filter((r) => r.type === "credit").reduce((s, r) => s + Number(r.amount), 0);
  const totalDebit  = validRows.filter((r) => r.type === "debit").reduce((s, r) => s + Number(r.amount), 0);

  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="max-w-5xl mx-auto space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#eff6ff] rounded-lg flex items-center justify-center">
            <Upload className="w-5 h-5 text-[#2563eb]" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#1e293b]">Import Bank Statement</h2>
            <p className="text-xs text-[#64748b]">{clientName} · CSV import</p>
          </div>
        </div>
        {step > 0 && (
          <button onClick={reset} className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[#64748b] border border-[#e2e8f0] hover:bg-[#f8fafc] rounded-lg transition-colors">
            <RefreshCw className="w-3.5 h-3.5" />Start over
          </button>
        )}
      </div>

      {/* Step progress */}
      <div className="flex items-center gap-0 bg-white border border-[#e2e8f0] rounded-xl px-5 py-3.5 shadow-sm">
        {STEPS.map((label, i) => (
          <React.Fragment key={i}>
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step > i ? "bg-[#dcfce7] text-[#059669] ring-1 ring-[#059669]"
                : step === i ? "bg-[#2563eb] text-white"
                : "bg-[#e2e8f0] text-[#94a3b8]"
              }`}>
                {step > i ? "✓" : i + 1}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${
                step === i ? "text-[#2563eb]" : step > i ? "text-[#059669]" : "text-[#94a3b8]"
              }`}>{label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-px mx-2 ${step > i ? "bg-[#059669]" : "bg-[#e2e8f0]"}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* ── STEP 0: Upload ─────────────────────────────────────────────────── */}
      {step === 0 && (
        <div className="space-y-4">
          {/* Bank account selector */}
          <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-sm">
            <label className={labelCls}>Target Bank Account *</label>
            {loadingAccs ? (
              <p className="text-sm text-[#94a3b8]">Loading accounts…</p>
            ) : bankAccounts.length === 0 ? (
              <div className="px-4 py-3 bg-[#fff7ed] border border-[#fed7aa] rounded-lg text-sm text-[#9a3412]">
                No bank accounts found for this client. Add one in the Bank Accounts tab first.
              </div>
            ) : (
              <select className={selectCls} value={selectedAccId} onChange={(e) => setSelectedAccId(e.target.value)}>
                {bankAccounts.map((a) => (
                  <option key={a.id} value={a.id}>{a.name} — {a.bank} (Current: R{fmt(a.currentBalance)})</option>
                ))}
              </select>
            )}
          </div>

          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={`relative border-2 border-dashed rounded-xl cursor-pointer transition-all ${
              dragOver
                ? "border-[#2563eb] bg-[#eff6ff]"
                : "border-[#d1d5db] bg-white hover:border-[#2563eb] hover:bg-[#f8faff]"
            }`}
          >
            <input ref={fileRef} type="file" accept=".csv" onChange={handleFileInput} className="hidden" />
            <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-colors ${dragOver ? "bg-[#2563eb]" : "bg-[#f1f5f9]"}`}>
                <Upload className={`w-7 h-7 transition-colors ${dragOver ? "text-white" : "text-[#94a3b8]"}`} />
              </div>
              <p className="text-sm font-semibold text-[#1e293b] mb-1">
                {dragOver ? "Drop your CSV here" : "Drag & drop your bank statement CSV"}
              </p>
              <p className="text-xs text-[#94a3b8] mb-4">or click to browse · .csv files only</p>
              <div className="flex flex-wrap justify-center gap-2">
                {BANK_PROFILES.slice(0, -1).map((b) => (
                  <span key={b.id} style={{ borderColor: b.color + "40", color: b.color, background: b.color + "12" }}
                    className="px-2.5 py-0.5 rounded-full text-xs font-bold border">
                    {b.logo}
                  </span>
                ))}
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold border border-[#e2e8f0] text-[#64748b] bg-[#f8fafc]">+ any bank</span>
              </div>
            </div>
          </div>

          {/* Format tips */}
          <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4">
            <p className="text-xs font-semibold text-[#374151] mb-2">CSV format tips</p>
            <ul className="space-y-1 text-xs text-[#64748b]">
              <li>· Export directly from your bank's internet banking as CSV</li>
              <li>· Your file should have a header row (Date, Description, Amount/Debit/Credit)</li>
              <li>· FNB, Standard Bank, ABSA, Nedbank and Capitec formats are auto-detected</li>
              <li>· Duplicate transactions are automatically skipped on re-import</li>
            </ul>
          </div>
        </div>
      )}

      {/* ── STEP 1: Map columns ────────────────────────────────────────────── */}
      {step === 1 && bank && (
        <div className="space-y-4">
          {/* Detected bank */}
          <div className="flex items-center justify-between bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-sm">
            <div>
              <p className="text-xs text-[#64748b] mb-1">File detected as</p>
              <div className="flex items-center gap-2">
                <span style={{ background: bank.color + "18", color: bank.color, borderColor: bank.color + "40" }}
                  className="px-2.5 py-1 rounded-lg text-sm font-bold border">{bank.logo}</span>
                <span className="text-sm font-semibold text-[#1e293b]">{bank.name}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-[#64748b]">File</p>
              <p className="text-sm font-medium text-[#374151]">{fileName}</p>
              <p className="text-xs text-[#94a3b8]">{rawRows.length} data rows</p>
            </div>
          </div>

          {/* Column mapping */}
          <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-sm space-y-4">
            <div>
              <p className="text-sm font-semibold text-[#1e293b]">Confirm column mapping</p>
              <p className="text-xs text-[#64748b] mt-0.5">We auto-detected these mappings. Adjust if anything looks wrong.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { field: "date",    label: "Date *",          required: true  },
                { field: "desc",    label: "Description *",   required: true  },
                { field: "amount",  label: "Amount (signed)", required: false },
                { field: "debit",   label: "Debit column",    required: false },
                { field: "credit",  label: "Credit column",   required: false },
                { field: "balance", label: "Balance",         required: false },
              ].map(({ field, label }) => (
                <div key={field}>
                  <label className={labelCls}>{label}</label>
                  <select
                    className={selectCls}
                    value={colMap[field] ?? -1}
                    onChange={(e) => updateColMap(field, e.target.value)}
                  >
                    <option value={-1}>— not mapped —</option>
                    {headers.map((h, i) => (
                      <option key={i} value={i}>{h}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            {/* Header preview table */}
            <div>
              <p className="text-xs font-semibold text-[#64748b] mb-2 uppercase tracking-wide">First 3 rows preview</p>
              <div className="overflow-x-auto rounded-lg border border-[#e2e8f0]">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                      {headers.map((h, i) => (
                        <th key={i} className="px-3 py-2 text-left font-semibold text-[#64748b] whitespace-nowrap">
                          {h}
                          {Object.entries(colMap).find(([, v]) => v === i) && (
                            <span className="ml-1 px-1.5 py-0.5 bg-[#2563eb] text-white rounded text-[9px] font-bold">
                              {Object.entries(colMap).find(([, v]) => v === i)?.[0]}
                            </span>
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rawRows.slice(0, 3).map((row, i) => (
                      <tr key={i} className="border-b border-[#f8fafc] hover:bg-[#f8fafc]">
                        {row.map((cell, j) => (
                          <td key={j} className="px-3 py-2 text-[#374151] whitespace-nowrap">{cell || "—"}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Validation warning */}
          {(colMap.date < 0 || colMap.desc < 0 || (colMap.amount < 0 && colMap.debit < 0 && colMap.credit < 0)) && (
            <div className="flex items-center gap-2 px-4 py-3 bg-[#fff7ed] border border-[#fed7aa] rounded-lg text-sm text-[#9a3412]">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              Date, Description, and at least one amount column (Amount OR Debit/Credit) are required.
            </div>
          )}

          <div className="flex justify-between">
            <button onClick={reset} className="flex items-center gap-1.5 px-4 py-2 border border-[#e2e8f0] text-[#64748b] hover:bg-[#f8fafc] text-sm font-medium rounded-lg transition-colors">
              <ChevronDown className="w-4 h-4 rotate-90" />Back
            </button>
            <button
              onClick={buildPreview}
              disabled={colMap.date < 0 || colMap.desc < 0 || (colMap.amount < 0 && colMap.debit < 0 && colMap.credit < 0)}
              className="flex items-center gap-2 px-5 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-40"
            >
              Preview transactions <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 2: Preview & edit ─────────────────────────────────────────── */}
      {step === 2 && (
        <div className="space-y-4">
          {/* Summary bar */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "To import",  value: validRows.length,              color: "text-[#2563eb]", bg: "bg-[#eff6ff]" },
              { label: "With errors",value: errorRows.length,              color: "text-[#ea580c]", bg: "bg-[#fff7ed]" },
              { label: "Total credit",value: `R${fmt(totalCredit)}`,       color: "text-[#059669]", bg: "bg-[#f0fdf4]" },
              { label: "Total debit", value: `R${fmt(totalDebit)}`,        color: "text-[#dc2626]", bg: "bg-[#fef2f2]" },
            ].map(({ label, value, color, bg }) => (
              <div key={label} className={`${bg} border border-[#e2e8f0] rounded-xl p-3`}>
                <p className="text-xs font-semibold text-[#64748b]">{label}</p>
                <p className={`text-lg font-bold ${color} mt-0.5`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between bg-white border border-[#e2e8f0] rounded-xl px-4 py-3 shadow-sm">
            <p className="text-xs text-[#64748b]">
              Tick rows to exclude · rows with errors are automatically excluded
            </p>
            <button onClick={excludeAll} className="text-xs text-[#64748b] hover:text-[#374151] underline transition-colors">
              Exclude all error rows
            </button>
          </div>

          {/* Transaction table */}
          <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#e2e8f0] bg-[#f8fafc]">
                    <th className="w-10 px-3 py-3" />
                    {["Date","Description","Type","Amount","Category","Ref","Status"].map((h) => (
                      <th key={h} className="px-3 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {txRows.map((row) => (
                    <tr
                      key={row._id}
                      className={`border-b border-[#f8fafc] transition-colors ${
                        row._exclude ? "opacity-40 bg-[#f8fafc]"
                        : row._error  ? "bg-[#fff7ed]"
                        : "hover:bg-[#f8fafc]"
                      }`}
                    >
                      {/* Exclude checkbox */}
                      <td className="px-3 py-2">
                        <input
                          type="checkbox"
                          checked={row._exclude}
                          onChange={() => toggleExclude(row._id)}
                          className="w-3.5 h-3.5 rounded border-[#d1d5db] text-[#2563eb] cursor-pointer"
                        />
                      </td>

                      {/* Date */}
                      <td className="px-3 py-2">
                        <input
                          type="date"
                          value={row.date}
                          onChange={(e) => updateRow(row._id, "date", e.target.value)}
                          disabled={row._exclude}
                          className="text-xs border border-[#e2e8f0] rounded-md px-2 py-1 bg-white text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#2563eb] w-32"
                        />
                      </td>

                      {/* Description */}
                      <td className="px-3 py-2">
                        <input
                          value={row.description}
                          onChange={(e) => updateRow(row._id, "description", e.target.value)}
                          disabled={row._exclude}
                          className="text-xs border border-[#e2e8f0] rounded-md px-2 py-1 bg-white text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#2563eb] w-48"
                        />
                      </td>

                      {/* Type */}
                      <td className="px-3 py-2">
                        <select
                          value={row.type}
                          onChange={(e) => updateRow(row._id, "type", e.target.value)}
                          disabled={row._exclude}
                          className="text-xs border border-[#e2e8f0] rounded-md px-2 py-1 bg-white text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
                        >
                          <option value="credit">Credit</option>
                          <option value="debit">Debit</option>
                        </select>
                      </td>

                      {/* Amount */}
                      <td className="px-3 py-2">
                        <div className={`flex items-center gap-1 text-xs font-semibold ${row.type === "credit" ? "text-[#059669]" : "text-[#dc2626]"}`}>
                          {row.type === "credit"
                            ? <TrendingUp className="w-3 h-3" />
                            : <TrendingDown className="w-3 h-3" />}
                          R{fmt(row.amount)}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-3 py-2">
                        <select
                          value={row.category}
                          onChange={(e) => updateRow(row._id, "category", e.target.value)}
                          disabled={row._exclude}
                          className="text-xs border border-[#e2e8f0] rounded-md px-2 py-1 bg-white text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
                        >
                          {TX_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                        </select>
                      </td>

                      {/* Reference */}
                      <td className="px-3 py-2">
                        <input
                          value={row.reference}
                          onChange={(e) => updateRow(row._id, "reference", e.target.value)}
                          disabled={row._exclude}
                          placeholder="optional"
                          className="text-xs border border-[#e2e8f0] rounded-md px-2 py-1 bg-white text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#2563eb] w-24"
                        />
                      </td>

                      {/* Status */}
                      <td className="px-3 py-2">
                        {row._error ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-[#fff7ed] text-[#ea580c]">
                            <AlertCircle className="w-3 h-3" />{row._error}
                          </span>
                        ) : row._exclude ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-[#f1f5f9] text-[#94a3b8]">
                            <Minus className="w-3 h-3" />Excluded
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-[#f0fdf4] text-[#059669]">
                            <CheckCircle className="w-3 h-3" />Ready
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Target account confirm */}
          <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm">
            <label className={labelCls}>Import into account</label>
            <select className={selectCls} value={selectedAccId} onChange={(e) => setSelectedAccId(e.target.value)}>
              {bankAccounts.map((a) => (
                <option key={a.id} value={a.id}>{a.name} — {a.bank} (Current: R{fmt(a.currentBalance)})</option>
              ))}
            </select>
          </div>

          <div className="flex justify-between">
            <button onClick={() => setStep(1)} className="flex items-center gap-1.5 px-4 py-2 border border-[#e2e8f0] text-[#64748b] hover:bg-[#f8fafc] text-sm font-medium rounded-lg transition-colors">
              <ChevronDown className="w-4 h-4 rotate-90" />Back
            </button>
            <button
              onClick={handleImport}
              disabled={importing || validRows.length === 0}
              className="flex items-center gap-2 px-6 py-2 bg-[#059669] hover:bg-[#047857] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {importing ? (
                <><RefreshCw className="w-4 h-4 animate-spin" />Importing…</>
              ) : (
                <><Database className="w-4 h-4" />Import {validRows.length} transaction{validRows.length !== 1 ? "s" : ""}</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3: Result ────────────────────────────────────────────────── */}
      {step === 3 && importResult && (
        <div className="space-y-4">

          {/* Big result card */}
          <div className={`rounded-2xl border p-8 text-center ${
            importResult.errors === 0
              ? "bg-[#f0fdf4] border-[#bbf7d0]"
              : "bg-[#fff7ed] border-[#fed7aa]"
          }`}>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
              importResult.errors === 0 ? "bg-[#dcfce7]" : "bg-[#fef3c7]"
            }`}>
              {importResult.errors === 0
                ? <CheckCircle className="w-8 h-8 text-[#059669]" />
                : <AlertCircle className="w-8 h-8 text-[#d97706]" />}
            </div>
            <h2 className="text-lg font-bold text-[#1e293b]">
              {importResult.errors === 0 ? "Import complete!" : "Import finished with some errors"}
            </h2>
            <p className="text-sm text-[#64748b] mt-1">
              {bankAccounts.find((a) => a.id === selectedAccId)?.name || "Bank account"} · {fileName}
            </p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Imported",   value: importResult.imported, icon: CheckCircle, bg: "bg-[#f0fdf4]", color: "text-[#059669]" },
              { label: "Duplicates skipped", value: importResult.skipped,  icon: Minus,        bg: "bg-[#f8fafc]",  color: "text-[#64748b]" },
              { label: "Errors",     value: importResult.errors,   icon: AlertCircle,  bg: "bg-[#fff7ed]",  color: "text-[#ea580c]" },
              { label: "Total in file", value: importResult.total, icon: FileText,     bg: "bg-[#eff6ff]",  color: "text-[#2563eb]" },
            ].map(({ label, value, icon: Icon, bg, color }) => (
              <div key={label} className={`${bg} border border-[#e2e8f0] rounded-xl p-4`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-[#64748b]">{label}</span>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <div className={`text-2xl font-black ${color}`}>{value}</div>
              </div>
            ))}
          </div>

          {/* Duplicate explanation */}
          {importResult.skipped > 0 && (
            <div className="flex items-start gap-3 px-4 py-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-sm text-[#64748b]">
              <AlertTriangle className="w-4 h-4 text-[#94a3b8] flex-shrink-0 mt-0.5" />
              <span>
                <span className="font-semibold text-[#374151]">{importResult.skipped} duplicate{importResult.skipped !== 1 ? "s" : ""} skipped.</span>{" "}
                Transactions matching an existing date + amount + type combination were not re-imported.
              </span>
            </div>
          )}

          {/* Error note */}
          {importResult.errors > 0 && (
            <div className="flex items-start gap-3 px-4 py-3 bg-[#fff7ed] border border-[#fed7aa] rounded-xl text-sm text-[#9a3412]">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>
                <span className="font-semibold">{importResult.errors} transaction{importResult.errors !== 1 ? "s" : ""} failed</span> to save due to Firestore write errors.
                You can re-import the file — duplicates will be skipped automatically.
              </span>
            </div>
          )}

          {/* Next steps */}
          <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-sm">
            <p className="text-sm font-semibold text-[#374151] mb-3">What's next?</p>
            <div className="space-y-2">
              {[
                { icon: Eye,          color: "text-[#2563eb]", bg: "bg-[#eff6ff]",  text: "Review imported transactions in the Transactions tab"   },
                { icon: CheckCircle,  color: "text-[#7c3aed]", bg: "bg-[#faf5ff]",  text: "Reconcile the account against your bank statement"       },
                { icon: TrendingUp,   color: "text-[#059669]", bg: "bg-[#f0fdf4]",  text: "Run P&L or Cash Flow reports to see the updated figures" },
              ].map(({ icon: Icon, color, bg, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className={`w-7 h-7 ${bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                  <p className="text-sm text-[#64748b]">{text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between">
            <button
              onClick={reset}
              className="flex items-center gap-2 px-5 py-2.5 border border-[#e2e8f0] text-[#374151] hover:bg-[#f8fafc] text-sm font-medium rounded-lg transition-colors shadow-sm"
            >
              <Upload className="w-4 h-4" />Import another file
            </button>
            <button
              onClick={reset}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
            >
              <CheckCircle className="w-4 h-4" />Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}