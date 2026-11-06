/**
 * src/pages/AdminDashboard.jsx
 * ─────────────────────────────────────────────────────────────────
 * Combined admin dashboard:
 *   • Business tools — clients, invoices, quotes, create
 *   • Dev tools      — seed accounts & listings
 *
 * Requires scripts/server.js running on localhost:3001 for seed ops.
 * ─────────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useRef } from "react";
import { collection, query, getDocs, orderBy } from "firebase/firestore";
import { db, auth } from "../firebase";
import { useAuth }   from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

import ClientsList    from "../components/admin/ClientsList";
import CreateInvoice  from "../components/admin/CreateInvoice";
import InvoicesList   from "../components/admin/InvoicesList";
import InvoicePreview from "../components/admin/InvoicePreview";

// ── Seed server ───────────────────────────────────────────────────
const SERVER = import.meta.env.DEV
  ? "http://localhost:3001"
  : "https://api.gerboai.com";

const ALL_INDUSTRIES = [
  "mechanics","healthcare","security","electrical","restaurant",
  "construction","cleaning","education","hotel","legal",
  "plumbing","retail","landscaping","logistics","photography",
  "realestate","flooring","hvac","accounting","painting",
  "pestcontrol","poolservices","solarinstallation","towing",
  "welding","carpentry","windowrepair",
];

async function getIdToken() {
  const u = auth.currentUser;
  if (!u) throw new Error("Not logged in.");
  return u.getIdToken();
}

async function streamRequest(endpoint, body, onLine, onDone) {
  const token = await getIdToken();
  const res   = await fetch(`${SERVER}${endpoint}`, {
    method:  "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body:    JSON.stringify(body),
  });
  const reader  = res.body.getReader();
  const decoder = new TextDecoder();
  let   buffer  = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n\n");
    buffer = parts.pop();
    parts.forEach((p) => {
      const line = p.replace(/^data: /, "").trim();
      if (line) onLine(line);
    });
  }
  onDone();
}

// ─────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  // ── Top-level mode ────────────────────────────────────────────
  const [mode, setMode] = useState("business");

  // ── Business state ────────────────────────────────────────────
  const [bizTab,          setBizTab]          = useState("clients");
  const [clients,         setClients]         = useState([]);
  const [invoices,        setInvoices]        = useState([]);
  const [quotes,          setQuotes]          = useState([]);
  const [bizLoading,      setBizLoading]      = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // ── Seed state ────────────────────────────────────────────────
  const [seedTab,            setSeedTab]            = useState("auto");
  const [serverOnline,       setServerOnline]       = useState(null);
  const [serverChecking,     setServerChecking]     = useState(true);
  const [logs,               setLogs]               = useState([]);
  const [running,            setRunning]            = useState(false);
  const [selectedIndustries, setSelectedIndustries] = useState(ALL_INDUSTRIES.slice(0, 10));
  const [perIndustry,        setPerIndustry]        = useState(5);
  const [listingsTotal,      setListingsTotal]      = useState(100);
  const [emailText,          setEmailText]          = useState("");
  const [manualTotal,        setManualTotal]        = useState(100);
  const [ownerIdsText,       setOwnerIdsText]       = useState("");
  const [seedTotal,          setSeedTotal]          = useState(100);

  const logEndRef = useRef(null);

  // ── Auth guard ────────────────────────────────────────────────
  useEffect(() => {
    if (!loading && (!user || !isAdmin)) navigate("/", { replace: true });
  }, [user, isAdmin, loading, navigate]);

  // ── Load business data ────────────────────────────────────────
  useEffect(() => { if (user) loadBizData(); }, [user]);

  const loadBizData = async () => {
    if (!user) return;
    setBizLoading(true);
    try {
      const usersSnap = await getDocs(query(collection(db, "users"), orderBy("createdAt", "desc")));
      setClients(usersSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(u => !u.isAdmin));

      const invSnap = await getDocs(query(collection(db, "users", user.uid, "adminInvoices"), orderBy("createdAt", "desc")));
      setInvoices(invSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      const qSnap = await getDocs(query(collection(db, "users", user.uid, "adminQuotes"), orderBy("createdAt", "desc")));
      setQuotes(qSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error("Error loading business data:", e);
    }
    setBizLoading(false);
  };

  // ── Server ping ───────────────────────────────────────────────
  useEffect(() => {
    const ping = async () => {
      try {
        const r = await fetch(`${SERVER}/ping`, { signal: AbortSignal.timeout(3000) });
        setServerOnline(r.ok);
      } catch { setServerOnline(false); }
      finally  { setServerChecking(false); }
    };
    ping();
    const id = setInterval(ping, 10000);
    return () => clearInterval(id);
  }, []);

  // ── Auto-scroll logs ──────────────────────────────────────────
  useEffect(() => { logEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [logs]);

  const addLog    = (line) => setLogs(p => [...p, { text: line, ts: Date.now() }]);
  const clearLogs = () => setLogs([]);

  // ── Seed runners ──────────────────────────────────────────────
  const runAutoSeed = async () => {
    if (running) return;
    setRunning(true); clearLogs();
    addLog(`▶ Starting auto-seed — ${selectedIndustries.length} industries × ${perIndustry} accounts...`);
    try {
      await streamRequest("/auto-seed",
        { industries: selectedIndustries, perIndustry, listingsTotal },
        addLog, () => { addLog("─── Stream ended ───"); setRunning(false); });
    } catch (e) { addLog(`❌ ${e.message}`); setRunning(false); }
  };

  const runCreateAccounts = async () => {
    if (running) return;
    const emails = emailText.split("\n").map(e => e.trim()).filter(Boolean);
    if (!emails.length) { addLog("❌ No emails entered."); return; }
    setRunning(true); clearLogs();
    addLog(`▶ Creating ${emails.length} accounts...`);
    try {
      await streamRequest("/create-accounts", { emails, total: manualTotal },
        addLog, () => { addLog("─── Stream ended ───"); setRunning(false); });
    } catch (e) { addLog(`❌ ${e.message}`); setRunning(false); }
  };

  const runSeedOnly = async () => {
    if (running) return;
    const ownerIds = ownerIdsText.split("\n").map(s => s.trim()).filter(Boolean);
    if (!ownerIds.length) { addLog("❌ No UIDs entered."); return; }
    setRunning(true); clearLogs();
    addLog(`▶ Seeding ${seedTotal} listings across ${ownerIds.length} owners...`);
    try {
      await streamRequest("/seed-listings", { ownerIds, total: seedTotal },
        addLog, () => { addLog("─── Stream ended ───"); setRunning(false); });
    } catch (e) { addLog(`❌ ${e.message}`); setRunning(false); }
  };

  const toggleIndustry = (id) =>
    setSelectedIndustries(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  if (loading || !user || !isAdmin) return null;

  // ── Styles ────────────────────────────────────────────────────
  const C = {
    page:      { minHeight: "100vh", background: "#0a0a0f", color: "#e2e8f0", fontFamily: "'IBM Plex Mono','Fira Code',monospace" },
    header:    { borderBottom: "1px solid #1e293b", padding: "18px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#0d0d15" },
    headerL:   { display: "flex", alignItems: "center", gap: 14 },
    title:     { fontSize: 17, fontWeight: 700, color: "#f8fafc", margin: 0 },
    sub:       { fontSize: 11, color: "#475569", margin: "2px 0 0" },
    badge:     (c, bg) => ({ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: c, background: bg, padding: "3px 8px", borderRadius: 3, border: `1px solid ${c}33` }),
    serverDot: (on) => ({ width: 7, height: 7, borderRadius: "50%", background: on === null ? "#475569" : on ? "#22c55e" : "#ef4444", boxShadow: on ? "0 0 6px #22c55e88" : "none", display: "inline-block", marginRight: 6 }),
    serverTxt: { fontSize: 11, color: "#94a3b8", display: "flex", alignItems: "center" },

    modebar:   { display: "flex", borderBottom: "1px solid #1e293b", background: "#0d0d15" },
    modeBtn:   (a) => ({ padding: "12px 28px", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", border: "none", cursor: "pointer", fontFamily: "inherit", background: a ? "#0a0a0f" : "transparent", color: a ? "#f8fafc" : "#475569", borderBottom: a ? "2px solid #3b82f6" : "2px solid transparent", transition: "all 0.15s" }),

    bizWrap:   { padding: 28 },
    bizTabs:   { display: "flex", gap: 6, marginBottom: 24, flexWrap: "wrap" },
    bizTab:    (a) => ({ padding: "8px 18px", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", border: `1px solid ${a ? "#3b82f6" : "#1e293b"}`, borderRadius: 4, cursor: "pointer", fontFamily: "inherit", background: a ? "#1e3a5f" : "#111827", color: a ? "#60a5fa" : "#475569", transition: "all 0.15s" }),
    bizBox:    { background: "#0d0d15", border: "1px solid #1e293b", borderRadius: 6, padding: 24, minHeight: 400 },
    bizSpin:   { color: "#475569", padding: 40, textAlign: "center", fontSize: 12 },

    seedBody:  { display: "grid", gridTemplateColumns: "360px 1fr", minHeight: "calc(100vh - 118px)" },
    sidebar:   { borderRight: "1px solid #1e293b", padding: "22px 18px", background: "#0d0d15" },
    seedTabs:  { display: "flex", gap: 4, marginBottom: 22 },
    seedTab:   (a) => ({ flex: 1, padding: "7px 0", fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", border: `1px solid ${a ? "#3b82f6" : "#1e293b"}`, borderRadius: 3, cursor: "pointer", fontFamily: "inherit", background: a ? "#1e3a5f" : "transparent", color: a ? "#60a5fa" : "#475569", transition: "all 0.15s" }),
    label:     { fontSize: 10, color: "#64748b", letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 5 },
    input:     { width: "100%", background: "#111827", border: "1px solid #1e293b", borderRadius: 4, color: "#e2e8f0", fontSize: 12, padding: "7px 10px", fontFamily: "inherit", outline: "none", boxSizing: "border-box" },
    textarea:  { width: "100%", background: "#111827", border: "1px solid #1e293b", borderRadius: 4, color: "#e2e8f0", fontSize: 11, padding: "7px 10px", fontFamily: "inherit", outline: "none", resize: "vertical", boxSizing: "border-box" },
    section:   { marginBottom: 18 },
    numRow:    { display: "flex", gap: 10 },
    runBtn:    (d) => ({ width: "100%", padding: "10px 0", background: d ? "#1e293b" : "#2563eb", color: d ? "#475569" : "#fff", border: "none", borderRadius: 4, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", cursor: d ? "not-allowed" : "pointer", marginTop: 6, fontFamily: "inherit", transition: "background 0.15s" }),
    igrid:     { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3, maxHeight: 240, overflowY: "auto" },
    chip:      (s) => ({ fontSize: 9, padding: "5px 4px", borderRadius: 3, cursor: "pointer", border: `1px solid ${s ? "#3b82f6" : "#1e293b"}`, background: s ? "#1e3a5f" : "#111827", color: s ? "#93c5fd" : "#475569", textAlign: "center", transition: "all 0.12s", userSelect: "none", letterSpacing: "0.03em" }),
    term:      { flex: 1, display: "flex", flexDirection: "column", padding: 22 },
    termHead:  { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
    termLbl:   { fontSize: 10, color: "#475569", letterSpacing: "0.08em", textTransform: "uppercase" },
    clearBtn:  { fontSize: 10, color: "#475569", background: "none", border: "1px solid #1e293b", borderRadius: 3, padding: "3px 10px", cursor: "pointer", fontFamily: "inherit" },
    termBox:   { flex: 1, background: "#050508", border: "1px solid #1e293b", borderRadius: 6, padding: "14px 18px", overflowY: "auto", minHeight: 380, maxHeight: "calc(100vh - 200px)" },
    logLine:   (t) => ({ fontSize: 11, lineHeight: "1.9", color: t.startsWith("❌") ? "#f87171" : t.startsWith("✅") ? "#4ade80" : t.startsWith("▶") ? "#60a5fa" : t.startsWith("⚠") ? "#fbbf24" : t.startsWith("───") ? "#1e293b" : "#94a3b8" }),
    emptyTerm: { color: "#1e293b", fontSize: 12, textAlign: "center", marginTop: 80 },
    spinner:   { display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: "#3b82f6", animation: "pulse 1s infinite", marginRight: 7 },
    hint:      { fontSize: 10, color: "#475569", marginBottom: 10, lineHeight: 1.6 },
  };

  return (
    <div style={C.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0a0a0f; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 2px; }
        input[type=number]::-webkit-inner-spin-button { opacity: 0.4; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }

        .biz-inner, .biz-inner * { color: #e2e8f0 !important; background: transparent !important; border-color: #1e293b !important; font-family: 'IBM Plex Mono', monospace !important; font-size: 12px !important; }
        .biz-inner table { width: 100%; border-collapse: collapse; }
        .biz-inner th { color: #64748b !important; font-size: 10px !important; letter-spacing: 0.06em; text-transform: uppercase; padding: 8px 12px; border-bottom: 1px solid #1e293b !important; }
        .biz-inner td { padding: 10px 12px; border-bottom: 1px solid #111827 !important; }
        .biz-inner tr:hover td { background: #111827 !important; }
        .biz-inner button { background: #1e3a5f !important; color: #60a5fa !important; border: 1px solid #3b82f6 !important; border-radius: 4px !important; padding: 6px 14px !important; cursor: pointer !important; font-family: inherit !important; font-size: 10px !important; font-weight: 700 !important; letter-spacing: 0.06em !important; text-transform: uppercase !important; }
        .biz-inner input, .biz-inner select, .biz-inner textarea { background: #111827 !important; border: 1px solid #1e293b !important; border-radius: 4px !important; color: #e2e8f0 !important; padding: 7px 10px !important; font-family: inherit !important; }
        .biz-inner label { color: #64748b !important; font-size: 10px !important; letter-spacing: 0.06em; text-transform: uppercase; }
        .biz-inner h2, .biz-inner h3 { color: #f8fafc !important; font-size: 14px !important; margin-bottom: 16px !important; }
      `}</style>

      {/* Header */}
      <div style={C.header}>
        <div style={C.headerL}>
          <span style={C.badge("#a78bfa", "#1e1b4b")}>ADMIN</span>
          <div>
            <p style={C.title}>GerboAI Admin Portal</p>
            <p style={C.sub}>Manage clients, invoices, and seed data</p>
          </div>
        </div>
        {mode === "dev" ? (
          <div style={C.serverTxt}>
            <span style={C.serverDot(serverChecking ? null : serverOnline)} />
            {serverChecking ? "checking..."
              : serverOnline ? "server online — :3001"
              : "server offline — node scripts/server.js"}
          </div>
        ) : (
          <span style={{ fontSize: 11, color: "#475569" }}>{user.email}</span>
        )}
      </div>

      {/* Mode switcher */}
      <div style={C.modebar}>
        <button style={C.modeBtn(mode === "business")} onClick={() => setMode("business")}>
          ⬡ &nbsp;Business
        </button>
        <button style={C.modeBtn(mode === "dev")} onClick={() => setMode("dev")}>
          ⌬ &nbsp;Dev Tools
        </button>
      </div>

      {/* ══ BUSINESS MODE ══════════════════════════════════════════ */}
      {mode === "business" && (
        <div style={C.bizWrap}>
          <div style={C.bizTabs}>
            {[
              ["clients",  `Clients (${clients.length})`],
              ["invoices", `Invoices (${invoices.length})`],
              ["quotes",   `Quotes (${quotes.length})`],
              ["create",   "+ Create New"],
              ...(selectedInvoice ? [["preview", "Preview"]] : []),
            ].map(([id, label]) => (
              <button key={id} style={C.bizTab(bizTab === id)} onClick={() => setBizTab(id)}>
                {label}
              </button>
            ))}
          </div>

          <div style={C.bizBox}>
            {bizLoading ? (
              <div style={C.bizSpin}>Loading data...</div>
            ) : (
              <div className="biz-inner">
                {bizTab === "clients" && (
                  <ClientsList clients={clients} onCreateInvoice={() => setBizTab("create")} />
                )}
                {bizTab === "invoices" && (
                  <InvoicesList invoices={invoices} onRefresh={loadBizData}
                    onView={(inv) => { setSelectedInvoice(inv); setBizTab("preview"); }} />
                )}
                {bizTab === "quotes" && (
                  <InvoicesList invoices={quotes} type="quote" onRefresh={loadBizData}
                    onView={(inv) => { setSelectedInvoice(inv); setBizTab("preview"); }} />
                )}
                {bizTab === "create" && (
                  <CreateInvoice clients={clients} adminUserId={user.uid}
                    onSuccess={() => { loadBizData(); setBizTab("invoices"); }} />
                )}
                {bizTab === "preview" && selectedInvoice && (
                  <InvoicePreview invoice={selectedInvoice} onBack={() => setBizTab("invoices")} />
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ DEV / SEED MODE ════════════════════════════════════════ */}
      {mode === "dev" && (
        <div style={C.seedBody}>

          {/* Sidebar */}
          <div style={C.sidebar}>
            <div style={C.seedTabs}>
              {[["auto","Auto Seed"],["manual","Accounts"],["only","Listings"]].map(([id, label]) => (
                <button key={id} style={C.seedTab(seedTab === id)} onClick={() => setSeedTab(id)}>
                  {label}
                </button>
              ))}
            </div>

            {/* Auto Seed */}
            {seedTab === "auto" && <>
              <div style={C.section}>
                <label style={C.label}>Industries ({selectedIndustries.length} selected)</label>
                <div style={C.igrid}>
                  {ALL_INDUSTRIES.map(id => (
                    <div key={id} style={C.chip(selectedIndustries.includes(id))} onClick={() => toggleIndustry(id)}>
                      {id}
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ ...C.section, ...C.numRow }}>
                <div style={{ flex: 1 }}>
                  <label style={C.label}>Accounts / industry</label>
                  <input type="number" min={1} max={20} value={perIndustry}
                    onChange={e => setPerIndustry(+e.target.value)} style={C.input} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={C.label}>Total listings</label>
                  <input type="number" min={10} max={500} value={listingsTotal}
                    onChange={e => setListingsTotal(+e.target.value)} style={C.input} />
                </div>
              </div>
              <p style={C.hint}>
                Creates {selectedIndustries.length * perIndustry} accounts using{" "}
                <code style={{ color: "#7c3aed" }}>@seed.dev</code> emails, then seeds {listingsTotal} listings.
              </p>
              <button style={C.runBtn(!serverOnline || running)} disabled={!serverOnline || running} onClick={runAutoSeed}>
                {running ? "Running..." : "▶  Run Auto Seed"}
              </button>
            </>}

            {/* Manual Accounts */}
            {seedTab === "manual" && <>
              <div style={C.section}>
                <label style={C.label}>Emails (one per line)</label>
                <textarea rows={10} value={emailText} onChange={e => setEmailText(e.target.value)}
                  placeholder={"mechanic1@test.com\nplumber1@fake.dev\n..."} style={C.textarea} />
              </div>
              <div style={C.section}>
                <label style={C.label}>Total listings to seed</label>
                <input type="number" min={10} max={500} value={manualTotal}
                  onChange={e => setManualTotal(+e.target.value)} style={C.input} />
              </div>
              <button style={C.runBtn(!serverOnline || running)} disabled={!serverOnline || running} onClick={runCreateAccounts}>
                {running ? "Running..." : "▶  Create + Seed"}
              </button>
            </>}

            {/* Seed Listings Only */}
            {seedTab === "only" && <>
              <div style={C.section}>
                <label style={C.label}>Owner UIDs (one per line)</label>
                <textarea rows={10} value={ownerIdsText} onChange={e => setOwnerIdsText(e.target.value)}
                  placeholder={"abc123uid\ndef456uid\n..."} style={C.textarea} />
              </div>
              <div style={C.section}>
                <label style={C.label}>Total listings to seed</label>
                <input type="number" min={10} max={500} value={seedTotal}
                  onChange={e => setSeedTotal(+e.target.value)} style={C.input} />
              </div>
              <button style={C.runBtn(!serverOnline || running)} disabled={!serverOnline || running} onClick={runSeedOnly}>
                {running ? "Running..." : "▶  Seed Listings"}
              </button>
            </>}
          </div>

          {/* Terminal */}
          <div style={C.term}>
            <div style={C.termHead}>
              <span style={C.termLbl}>
                {running && <span style={C.spinner} />}
                {running ? "running..." : "output"}
              </span>
              <button style={C.clearBtn} onClick={clearLogs}>clear</button>
            </div>
            <div style={C.termBox}>
              {logs.length === 0
                ? <p style={C.emptyTerm}>// output will appear here</p>
                : logs.map((l, i) => <div key={i} style={C.logLine(l.text)}>{l.text}</div>)
              }
              <div ref={logEndRef} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}