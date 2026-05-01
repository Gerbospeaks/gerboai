import React, { useState, useEffect, useRef, useCallback } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth";
import logo from "../assets/img/solidflo-logo.png";
import { getIndustryConfig } from "../utils/industryConfig";
import { callClaude, extractInvoiceData } from "../utils/api";
import {
  Sparkles,
  Send,
  RotateCcw,
  User,
  Search,
  Copy,
  Check,
  AlertCircle,
  Loader2,
  Database,
  RefreshCw,
  Printer,
  Download,
  FileText,
  ArrowLeft,
  PanelRightClose,
  PanelRight,
  Receipt,
  ShoppingCart,
  ChevronRight,
  ChevronLeft,
  LayoutDashboard,
  Users,
  List,
  BarChart2,
  Layers,
  Settings,
  Lightbulb,
  MessageSquare,
  Eye,
  Menu,
  X,
} from "lucide-react";
import CustomerModal from "./CustomerModal";

const DOC_TYPES = [
  { id: "invoice",        label: "New Invoice",        sublabel: "Bill a client",       icon: FileText,    color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe" },
  { id: "estimate",       label: "New Quote",          sublabel: "Send a quote",        icon: Receipt,     color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe" },
  { id: "purchase_order", label: "New Purchase Order", sublabel: "Order from supplier", icon: ShoppingCart,color: "#059669", bg: "#f0fdf4", border: "#bbf7d0" },
];
const NAV_ITEMS = [
  { id: "search",   label: "Search",   icon: Search  },
  { id: "chats",    label: "Chats",    icon: MessageSquare },
  { id: "invoices", label: "Invoices", icon: FileText },
  { id: "quotes",   label: "Quotes",   icon: Receipt },
  { id: "recents",  label: "Recents",  icon: List    },
];
const SUGGESTIONS = {
  invoice: [
    "Invoice my last client for bookkeeping — 8hrs at R650/hr",
    "Bill for monthly retainer R5,500 plus VAT",
    "Repeat last invoice",
  ],
  estimate: [
    "Quote for annual financial statements — R9,500 flat",
    "Estimate for 3 months payroll at R2,200/month",
    "Send a quote for consulting services",
  ],
  purchase_order: [
    "Purchase order for 50 reams of paper at R85 each",
    "Order 3 laptops at R12,500 each from TechSupplies",
    "PO for cleaning supplies R3,200 total",
  ],
};

const loadAllUserData = async (uid) => {
  const result = {
    activeTemplate: "professional",
    purchasedTemplates: ["professional"],
    businessInfo: null,
    clients: [],
    recentInvoices: [],
  };
  try {
    const snap = await getDoc(
      doc(db, "users", uid, "settings", "templateSettings"),
    );
    if (snap.exists()) {
      const d = snap.data();
      result.activeTemplate = d.activeTemplate || "professional";
      result.purchasedTemplates = d.purchased || ["professional"];
    }
  } catch (e) {
    console.warn("templateSettings:", e.message);
  }
  try {
    const snap = await getDoc(
      doc(db, "users", uid, "settings", "businessInfo"),
    );
    if (snap.exists()) result.businessInfo = snap.data();
  } catch (e) {
    console.warn("businessInfo:", e.message);
  }
  try {
    const snap = await getDocs(
      query(
        collection(db, "users", uid, "clients"),
        orderBy("createdAt", "desc"),
      ),
    );
    result.clients = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((c) => !c._placeholder);
  } catch (e) {
    console.warn("clients:", e.message);
  }
  try {
    const snap = await getDocs(
      query(
        collection(db, "users", uid, "invoices"),
        orderBy("createdAt", "desc"),
      ),
    );
    result.recentInvoices = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((i) => !i._placeholder);
  } catch (e) {
    console.warn("invoices:", e.message);
  }
  return result;
};

const findClientInText = (text, clients) => {
  if (!clients?.length || !text) return null;
  const lower = text.toLowerCase();
  let match = clients.find(
    (c) => c.name && lower.includes(c.name.toLowerCase()),
  );
  if (match) return match;
  match = clients.find((c) => {
    if (!c.name) return false;
    const first = c.name.split(" ")[0].toLowerCase();
    return first.length > 2 && lower.includes(first);
  });
  return match || null;
};

const buildPrompt = (userData, documentType, industry = "default") => {
  const b = userData?.businessInfo;
  const inv = userData?.recentInvoices;
  const config = getIndustryConfig(industry);
  const bizBlock = b
    ? `## YOUR BUSINESS\n- Name: ${b.businessName || "—"}\n- VAT: ${b.vatNumber || "—"}\n- Reg: ${b.registrationNumber || "—"}`
    : "## YOUR BUSINESS\nNot configured.";
  const clientList = userData?.clients?.length
    ? `## SAVED CLIENTS (${userData.clients.length})\n${userData.clients
        .slice(0, 30)
        .map(
          (c, i) =>
            `${i + 1}. id:"${c.id}" name:"${c.name || ""}" email:${c.email || "—"}`,
        )
        .join("\n")}`
    : "## SAVED CLIENTS\nNone yet.";
  const invBlock = inv?.length
    ? `## RECENT INVOICES\n${inv
        .slice(0, 8)
        .map(
          (v, i) =>
            `${i + 1}. #${v.invoiceNumber || "N/A"} client:"${v.customer?.name || "—"}" items:${JSON.stringify((v.items || []).slice(0, 3).map((it) => ({ d: it.description, r: it.rate, q: it.qty })))}`,
        )
        .join("\n")}`
    : "## RECENT INVOICES\nNone.";
  const docLabel =
    documentType === "estimate"
      ? "quotation"
      : documentType === "purchase_order"
        ? "purchase order"
        : "invoice";

  return `You are SolidFlo AI — an expert ${docLabel} assistant for the ${industry} industry.

NOTE: Client fields are auto-filled from Firebase when a client is matched. You only need to return clientNotInDB if the client is genuinely new.
${config.promptHint ? `\nINDUSTRY HINT: ${config.promptHint}` : ""}

${bizBlock}
${clientList}
${invBlock}

## CURRENT DOCUMENT TYPE: ${documentType.toUpperCase()}

ALWAYS respond with:
1. 1–2 sentence friendly reply
2. A single valid JSON block like this:

\`\`\`json
{
  "matchedClientId": null,
  "clientNotInDB": null,
  "documentType": "${documentType}",
  ${config.jsonExtra}
  "items": [{"description":"Service","rate":500,"qty":2,"category":"${config.itemCategories[0]}","taxRate":15}],
  "notes": null,
  "paymentTerms": null,
  "dueInDays": null,
  "repeatLastInvoice": false
}
\`\`\`

RULES:
- matchedClientId: use the client id string if matched, otherwise null
- clientNotInDB: only fill if client is new and not in the saved list, otherwise null
- items: always an array, never null — use [] if no items
- category must be one of: ${config.itemCategories.join(", ")}
- "5hrs at R350/hr" → description:"Service", rate:350, qty:5, category:"${config.itemCategories[0]}", taxRate:15
- "no VAT" → taxRate:0
- taxRate defaults to 15
- repeatLastInvoice: true only if user says repeat/same as last
- General chat → items:[], all others null, repeatLastInvoice:false
- Return ONLY valid JSON inside the json block — no TypeScript types, no | null, no extra text
- NEVER add markdown outside the json block`;
};

const parseResponse = (text) => {
  try {
    const m = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (!m) return { reply: text.trim(), data: null };
    const cleaned = m[1]
      .trim()
      .replace(/\|\s*null/g, "")
      .replace(/,\s*}/g, "}")
      .replace(/,\s*]/g, "]");
    const data = JSON.parse(cleaned);
    const reply = text.slice(0, text.indexOf("```")).trim();
    return { reply: reply || "Got it — I've updated your document.", data };
  } catch (e) {
    console.error("parseResponse failed:", e.message);
    return { reply: text.trim(), data: null };
  }
};

const safeNum = (val) => Number(val) || 0;

/* ── Message Bubble ── */
function Bubble({ msg }) {
  const [copied, setCopied] = useState(false);
  const isUser = msg.role === "user";
  return (
    <div
      className={`flex gap-3 mb-5 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      <div
        className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5 ${isUser ? "bg-[#1655e0]" : "bg-[#0f172a]"}`}
      >
        {isUser ? (
          <User size={14} className="text-white" />
        ) : (
          <Sparkles size={14} className="text-white" />
        )}
      </div>
      <div
        className={`flex flex-col gap-1.5 ${isUser ? "items-end" : "items-start"}`}
        style={{ maxWidth: "85%", width: "100%" }}
      >
        <span
          className={`text-[10px] font-bold tracking-widest uppercase ${isUser ? "text-[#1655e0]" : "text-[#64748b]"}`}
        >
          {isUser ? "You" : "SolidFlo AI"}
        </span>
        <div
          className={`px-4 py-3 text-[13.5px] leading-relaxed ${isUser ? "bg-[#1655e0] text-white rounded-[18px_4px_18px_18px] shadow-lg shadow-[#1655e0]/20" : "bg-white text-[#1e293b] rounded-[4px_18px_18px_18px] border border-[#e5e7eb] shadow-sm"}`}
        >
          {msg.content}
        </div>
        {!isUser && (msg.appliedClient || msg.appliedItems) && (
          <div className="flex items-center gap-2 flex-wrap">
            {msg.appliedClient && (
              <span className="flex items-center gap-1 text-[11px] text-[#1d4ed8] font-semibold bg-[#eff6ff] border border-[#bfdbfe] px-2 py-0.5 rounded-full">
                <Database size={10} /> Loaded: {msg.appliedClient}
              </span>
            )}
            {msg.appliedItems > 0 && (
              <span className="flex items-center gap-1 text-[11px] text-green-700 font-semibold bg-[#f0fdf4] border border-[#bbf7d0] px-2 py-0.5 rounded-full">
                <Check size={10} /> {msg.appliedItems} item
                {msg.appliedItems > 1 ? "s" : ""} added
              </span>
            )}
            <button
              onClick={() => {
                navigator.clipboard.writeText(msg.content);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="text-[#cbd5e1] hover:text-[#64748b] transition-colors p-0.5"
            >
              {copied ? (
                <Check size={12} className="text-green-500" />
              ) : (
                <Copy size={12} />
              )}
            </button>
          </div>
        )}
        {!isUser && msg.clientSaved && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              borderRadius: 20,
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              fontSize: 11,
              color: "#15803d",
              fontWeight: 600,
              marginTop: 2,
            }}
          >
            <Check size={12} /> Client saved to your contacts!
          </div>
        )}
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex gap-3 mb-5">
      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-[#0f172a]">
        <img src={logo} alt="SolidFlo" style={{ width: 14, height: 14 }} />
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-bold tracking-widest uppercase text-[#64748b]">
          SolidFlo AI
        </span>
        <div className="px-4 py-3 bg-white border border-[#e5e7eb] rounded-[4px_18px_18px_18px] shadow-sm inline-flex gap-1.5 items-center">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2 h-2 rounded-full bg-[#94a3b8]"
              style={{
                animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function DocSidebar({
  activeType,
  onChange,
  collapsed,
  onToggle,
  businessInfo,
  user,
  onLogout,
  userData,
  activeNav,
  onNavSelect,
}) {
  return (
    <div style={{
      width: collapsed ? 64 : 220,
      flexShrink: 0,
      background: "#0f172a",
      display: "flex",
      flexDirection: "column",
      borderRight: "1px solid rgba(255,255,255,.07)",
      transition: "width .25s ease",
      overflow: "hidden",
    }}>
      {/* ── Header ── */}
      <div style={{
        height: 52,
        display: "flex",
        alignItems: "center",
        justifyContent: collapsed ? "center" : "space-between",
        padding: collapsed ? 0 : "0 14px",
        borderBottom: "1px solid rgba(255,255,255,.07)",
        flexShrink: 0,
      }}>
        {!collapsed && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <img src={logo} alt="SolidFlo" style={{ width: 18, height: 18 }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>SolidFlo</span>
          </div>
        )}
        <button onClick={onToggle} style={{
          background: "rgba(255,255,255,.07)",
          border: "1px solid rgba(255,255,255,.1)",
          borderRadius: 7, color: "rgba(255,255,255,.6)",
          cursor: "pointer", width: 28, height: 28,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
        </button>
      </div>

      {/* ── Create New ── */}
      <div style={{ padding: collapsed ? "12px 8px" : "12px 8px 4px" }}>
        {!collapsed && (
          <div style={{
            fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,.3)",
            letterSpacing: ".08em", textTransform: "uppercase",
            marginBottom: 6, paddingLeft: 4,
          }}>Create New</div>
        )}
        {DOC_TYPES.map((item) => {
          const Icon = item.icon;
          const active = activeType === item.id && !activeNav;
          return (
            <button key={item.id} onClick={() => { onChange(item.id); onNavSelect(null); }}
              title={collapsed ? item.label : undefined}
              style={{
                width: "100%", display: "flex", alignItems: "center",
                gap: 10, padding: collapsed ? "10px 0" : "8px 12px",
                justifyContent: collapsed ? "center" : "flex-start",
                borderRadius: 10, marginBottom: 2,
                border: active ? `1px solid ${item.color}40` : "1px solid transparent",
                background: active ? `${item.color}20` : "transparent",
                cursor: "pointer", transition: "all .15s", position: "relative",
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,.05)"; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
            >
              {collapsed && active && (
                <div style={{
                  position: "absolute", left: 4, width: 3, height: 20,
                  borderRadius: 2, background: item.color,
                }} />
              )}
              <div style={{
                width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                background: active ? item.color : "rgba(255,255,255,.08)",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "background .15s",
              }}>
                <Icon size={15} color={active ? "#fff" : "rgba(255,255,255,.5)"} />
              </div>
              {!collapsed && (
                <div style={{ textAlign: "left", minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: active ? "#fff" : "rgba(255,255,255,.65)", whiteSpace: "nowrap" }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: 10, color: active ? "rgba(255,255,255,.5)" : "rgba(255,255,255,.3)", whiteSpace: "nowrap" }}>
                    {item.sublabel}
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div style={{ height: 1, background: "rgba(255,255,255,.06)", margin: "6px 0" }} />

      {/* ── Navigation ── */}
      <div style={{ padding: collapsed ? "4px 8px" : "4px 8px", flex: 1 }}>
        {!collapsed && (
          <div style={{
            fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,.3)",
            letterSpacing: ".08em", textTransform: "uppercase",
            marginBottom: 6, paddingLeft: 4,
          }}>Library</div>
        )}
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = activeNav === item.id;

          // Badge counts
          const badge = item.id === "invoices"
            ? userData?.recentInvoices?.filter(i => i.documentType === "invoice" || !i.documentType).length || null
            : item.id === "quotations"
            ? userData?.recentInvoices?.filter(i => i.documentType === "estimate").length || null
            : item.id === "recents"
            ? Math.min(userData?.recentInvoices?.length || 0, 5) || null
            : null;

          return (
            <button key={item.id} onClick={() => onNavSelect(item.id)}
              title={collapsed ? item.label : undefined}
              style={{
                width: "100%", display: "flex", alignItems: "center",
                gap: 10, padding: collapsed ? "10px 0" : "8px 12px",
                justifyContent: collapsed ? "center" : "flex-start",
                borderRadius: 10, marginBottom: 2,
                border: active ? "1px solid rgba(22,85,224,.4)" : "1px solid transparent",
                background: active ? "rgba(22,85,224,.2)" : "transparent",
                cursor: "pointer", transition: "all .15s",
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,.05)"; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                background: active ? "rgba(22,85,224,.4)" : "rgba(255,255,255,.08)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon size={15} color={active ? "#93c5fd" : "rgba(255,255,255,.5)"} />
              </div>
              {!collapsed && (
                <>
                  <div style={{ flex: 1, fontSize: 12, fontWeight: 700, color: active ? "#fff" : "rgba(255,255,255,.65)", textAlign: "left" }}>
                    {item.label}
                  </div>
                  {badge && (
                    <div style={{
                      padding: "2px 7px", borderRadius: 10, fontSize: 10,
                      fontWeight: 700, background: "rgba(22,85,224,.25)", color: "#93c5fd",
                    }}>{badge}</div>
                  )}
                </>
              )}
            </button>
          );
        })}
      </div>

      <div style={{ height: 1, background: "rgba(255,255,255,.06)", margin: "4px 0" }} />

      {/* ── User ── */}
      {!collapsed && (
        <div style={{ padding: "10px 14px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                background: "linear-gradient(135deg,#1655e0,#7c3aed)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 700, color: "#fff",
              }}>
                {(user?.name || user?.email || "?")[0].toUpperCase()}
              </div>
              <div style={{ minWidth: 0 }}>
                {businessInfo?.businessName && (
                  <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,.8)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 120 }}>
                    {businessInfo.businessName}
                  </div>
                )}
                <div style={{ fontSize: 10, color: "rgba(255,255,255,.35)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 120 }}>
                  {user?.email}
                </div>
              </div>
            </div>
            <button onClick={onLogout} title="Sign out" style={{
              background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)",
              borderRadius: 7, cursor: "pointer", width: 28, height: 28, flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "rgba(255,255,255,.4)", transition: "all .15s",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(232,68,42,.2)"; e.currentTarget.style.color = "#f87171"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,.06)"; e.currentTarget.style.color = "rgba(255,255,255,.4)"; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
function DocListPanel({ activeNav, userData, searchQuery, setSearchQuery, onSelectDoc, selectedDoc }) {
  const allDocs = userData?.recentInvoices || [];

  const filtered = allDocs.filter(doc => {
    const matchNav =
      activeNav === "invoices" ? (doc.documentType === "invoice" || !doc.documentType) :
      activeNav === "quotes"   ? doc.documentType === "estimate" :
      activeNav === "recents"  ? true :
      activeNav === "chats"    ? true : true;

    const matchSearch = !searchQuery || [
      doc.customer?.name, doc.invoiceNumber, doc.total?.toString()
    ].some(f => f?.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchNav && matchSearch;
  }).slice(0, activeNav === "recents" ? 10 : 50);

  const title =
    activeNav === "invoices" ? "Invoices" :
    activeNav === "quotes"   ? "Quotes" :
    activeNav === "recents"  ? "Recent Documents" :
    activeNav === "search"   ? "Search" :
    activeNav === "chats"    ? "Chats" : "Documents";

  return (
    <div style={{
      width: 280, flexShrink: 0, borderRight: "1px solid rgba(255,255,255,.07)",
      background: "#0f172a", display: "flex", flexDirection: "column", height: "100%",
    }}>
      {/* Header */}
      <div style={{
        height: 48, padding: "0 16px", borderBottom: "1px solid rgba(255,255,255,.07)",
        display: "flex", alignItems: "center", gap: 8, flexShrink: 0,
        background: "#0f172a",
      }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: "#fff", flex: 1 }}>{title}</span>
        <span style={{
          fontSize: 11, fontWeight: 700, color: "#6b7280",
          background: "#f1f5f9", padding: "2px 8px", borderRadius: 10,
        }}>{filtered.length}</span>
      </div>

      {/* Search bar */}
      <div style={{ padding: "10px 12px", borderBottom: "1px solid #e5e7eb", background: "rgba(255,255,255,.06)" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "rgba(255,255,255,.06)", borderRadius: 10, padding: "7px 12px",
          border: "1px solid rgba(255,255,255,.1)",
        }}>
          <Search size={13} color="#94a3b8" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={`Search ${title.toLowerCase()}...`}
            style={{
              flex: 1, border: "none", background: "none", outline: "none",
              fontSize: 13, color: "#fff", fontFamily: "inherit",
            }}
          />
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {filtered.length === 0 ? (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", height: 200, gap: 8,
          }}>
            <FileText size={28} color="#d1d5db" />
            <p style={{ fontSize: 13, color: "#9ca3af" }}>No {title.toLowerCase()} yet</p>
          </div>
        ) : (
          filtered.map((doc, i) => {
            const isSelected = selectedDoc?.id === doc.id;
            const isPaid = doc.paymentStatus?.status === "paid";
            const isOverdue = doc.dueDate && !isPaid &&
              new Date(doc.dueDate?.seconds ? doc.dueDate.seconds * 1000 : doc.dueDate) < new Date();

            const statusColor = isPaid ? "#16a34a" : isOverdue ? "#dc2626" : "#d97706";
            const statusBg = isPaid ? "#dcfce7" : isOverdue ? "#fef2f2" : "#fef9c3";
            const statusLabel = isPaid ? "Paid" : isOverdue ? "Overdue" : "Pending";

            const date = doc.createdAt?.seconds
              ? new Date(doc.createdAt.seconds * 1000).toLocaleDateString("en-ZA")
              : "—";

            return (
              <button key={doc.id || i} onClick={() => onSelectDoc(doc)}
                style={{
                  width: "100%", padding: "12px 16px", textAlign: "left",
                  background: isSelected ? "rgba(22,85,224,.2)" : "transparent",
                  border: "none", borderBottom: "1px solid rgba(255,255,255,.05)",
                  borderLeft: isSelected ? "3px solid #2563eb" : "3px solid transparent",
                  cursor: "pointer", transition: "all .12s",
                }}
                onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = "#f8fafc"; }}
                onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>
                    {doc.customer?.name || "Unknown Client"}
                  </div>
                  <div style={{
                    fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 8,
                    background: statusBg, color: statusColor,
                  }}>{statusLabel}</div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,.5)" }}>
                    #{doc.invoiceNumber || "—"} · {date}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>
                    R{(doc.total || 0).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
/* ── Mobile Menu Drawer ── */
function MobileMenuDrawer({
  open,
  onClose,
  documentType,
  onChange,
  userData,
  onNavigate,
  onLogout,
  user,
  businessInfo,
}) {
  if (!open) return null;
  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,.6)",
          zIndex: 300,
          backdropFilter: "blur(2px)",
        }}
      />
      <div
        style={{
          position: "fixed",
          bottom: 64,
          left: 0,
          right: 0,
          zIndex: 301,
          background: "#0f172a",
          borderRadius: "20px 20px 0 0",
          padding: "20px 16px 8px",
          maxHeight: "70vh",
          overflowY: "auto",
        }}
      >
        {/* Handle */}
        <div
          style={{
            width: 36,
            height: 4,
            background: "rgba(255,255,255,.2)",
            borderRadius: 2,
            margin: "0 auto 20px",
          }}
        />

        {/* Business info */}
        {businessInfo?.businessName && (
          <div
            style={{
              padding: "10px 12px",
              background: "rgba(255,255,255,.05)",
              borderRadius: 10,
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "linear-gradient(135deg,#1655e0,#7c3aed)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                fontWeight: 700,
                color: "#fff",
                flexShrink: 0,
              }}
            >
              {businessInfo.businessName[0]}
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>
                {businessInfo.businessName}
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,.4)" }}>
                {user?.email}
              </div>
            </div>
          </div>
        )}

        {/* Document type */}
        <div
          style={{
            fontSize: 9,
            fontWeight: 700,
            color: "rgba(255,255,255,.3)",
            letterSpacing: ".08em",
            textTransform: "uppercase",
            marginBottom: 8,
            paddingLeft: 4,
          }}
        >
          Document Type
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
            marginBottom: 16,
          }}
        >
          {DOC_TYPES.map((item) => {
            const Icon = item.icon;
            const active = documentType === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onChange(item.id);
                  onClose();
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 14px",
                  borderRadius: 12,
                  border: active
                    ? `1px solid ${item.color}40`
                    : "1px solid rgba(255,255,255,.06)",
                  background: active
                    ? `${item.color}20`
                    : "rgba(255,255,255,.03)",
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 9,
                    background: active ? item.color : "rgba(255,255,255,.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon
                    size={16}
                    color={active ? "#fff" : "rgba(255,255,255,.5)"}
                  />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: active ? "#fff" : "rgba(255,255,255,.7)",
                      textAlign: "left",
                    }}
                  >
                    {item.label}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "rgba(255,255,255,.35)",
                      textAlign: "left",
                    }}
                  >
                    {item.sublabel}
                  </div>
                </div>
                {active && (
                  <div
                    style={{
                      marginLeft: "auto",
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: item.color,
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Navigation */}
        <div
          style={{
            fontSize: 9,
            fontWeight: 700,
            color: "rgba(255,255,255,.3)",
            letterSpacing: ".08em",
            textTransform: "uppercase",
            marginBottom: 8,
            paddingLeft: 4,
          }}
        >
          Navigate
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 6,
            marginBottom: 16,
          }}
        >
          {[
            { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
            { id: "clients", label: "Clients", icon: Users },
            { id: "invoices", label: "Invoices", icon: List },
            { id: "reports", label: "Reports", icon: BarChart2 },
            { id: "templates", label: "Templates", icon: Layers },
            { id: "settings", label: "Settings", icon: Settings },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate?.(item.id);
                  onClose();
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,.06)",
                  background: "rgba(255,255,255,.03)",
                  cursor: "pointer",
                }}
              >
                <Icon size={14} color="rgba(255,255,255,.45)" />
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "rgba(255,255,255,.6)",
                  }}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Sign out */}
        <button
          onClick={() => {
            onLogout();
            onClose();
          }}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "12px",
            borderRadius: 10,
            border: "1px solid rgba(239,68,68,.3)",
            background: "rgba(239,68,68,.08)",
            cursor: "pointer",
            color: "#f87171",
            fontSize: 13,
            fontWeight: 600,
            marginBottom: 8,
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Sign Out
        </button>
      </div>
    </>
  );
}

/* ── MAIN COMPONENT ── */
export default function AIInvoiceWindow({
  user,
  onExit,
  onNavigateTo,
  documentType: initDocType = "invoice",
  TemplateRenderer,
  industry = "default",
}) {
  const [userData, setUserData] = useState(null);
  const [extraData, setExtraData] = useState({});
  const [dataLoading, setDataLoading] = useState(true);
  const [documentType, setDocumentType] = useState(initDocType);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [pendingNewClient, setPendingNewClient] = useState(null);
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [taxId, setTaxId] = useState("");
  const [activeNav, setActiveNav] = useState(null);         
const [selectedDoc, setSelectedDoc] = useState(null);     
const [searchQuery, setSearchQuery] = useState(""); 
  const [billName, setBillName] = useState("");
  const [billEmail, setBillEmail] = useState("");
  const [billPhone, setBillPhone] = useState("");
  const [billAddress, setBillAddress] = useState("");
  const [items, setItems] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(true);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Mobile state
  const [isMobile, setIsMobile] = useState(false);
  const [mobileTab, setMobileTab] = useState("chat"); // "chat" | "preview" | "menu"
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const bottomRef = useRef(null);
  const chatRef = useRef(null);
  const inputRef = useRef(null);
  const historyRef = useRef([]);
  const msgCounter = useRef(0);

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const safeItems = items.map((item) => ({
    description: item.description || "",
    category: item.category || "Service",
    rate: safeNum(item.rate),
    qty: safeNum(item.qty) || 1,
    amount: safeNum(item.amount),
    taxRate: safeNum(item.taxRate),
    taxAmount: safeNum(item.taxAmount),
    totalAmount: safeNum(item.totalAmount),
  }));
  const subtotal = safeItems.reduce((s, i) => s + i.amount, 0);
  const totalTax = safeItems.reduce((s, i) => s + i.taxAmount, 0);
  const total = subtotal + totalTax;
  const invoiceNumber = `DRAFT-${Date.now().toString(36).toUpperCase()}`;

  const loadData = useCallback(async () => {
    if (!user?.uid) return;
    setDataLoading(true);
    try {
      setUserData(await loadAllUserData(user.uid));
    } finally {
      setDataLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!user?.uid) return;
    (async () => {
      try {
        const snap = await getDocs(
          query(
            collection(db, "users", user.uid, "aiChatHistory"),
            orderBy("createdAt", "asc"),
          ),
        );
        if (!snap.empty) {
          const loaded = snap.docs.map((d) => ({ ...d.data(), id: d.id }));
          setMessages(loaded);
          historyRef.current = loaded.map((m) => ({
            role: m.role,
            content: m.rawContent || m.content,
          }));
        } else {
          setMessages([
            {
              id: "welcome",
              role: "assistant",
              content:
                "Hi! I'm SolidFlo AI. Choose a document type then describe what you need. When you mention a saved client I'll load their details from your database instantly.",
            },
          ]);
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, [user?.uid]);

  useEffect(() => {
    setCustomerName("");
    setCustomerEmail("");
    setCustomerPhone("");
    setCustomerAddress("");
    setTaxId("");
    setBillName("");
    setBillEmail("");
    setBillPhone("");
    setBillAddress("");
    setItems([]);
  }, [documentType]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const saveMsg = async (msg) => {
    if (!user?.uid) return;
    try {
      await addDoc(collection(db, "users", user.uid, "aiChatHistory"), {
        ...msg,
        createdAt: serverTimestamp(),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const applyClientFromDB = useCallback((client) => {
    setCustomerName(client.name || "");
    setCustomerEmail(client.email || "");
    setCustomerPhone(client.phone || "");
    setCustomerAddress(client.address || "");
    setTaxId(client.tax_id || "");
    setBillName(client.name || "");
    setBillEmail(client.email || "");
    setBillPhone(client.phone || "");
    setBillAddress(client.address || "");
  }, []);

  const applyItems = useCallback((rawItems) => {
    if (!rawItems?.length) return 0;
    const formatted = rawItems.map((item) => {
      const rate = safeNum(item.rate),
        qty = safeNum(item.qty) || 1,
        taxR = safeNum(item.taxRate);
      const amt = rate * qty,
        tax = amt * (taxR / 100);
      return {
        description: item.description || "",
        category: item.category || "Service",
        rate,
        qty,
        amount: amt,
        taxRate: taxR,
        taxAmount: tax,
        totalAmount: amt + tax,
      };
    });
    setItems(formatted);
    return formatted.length;
  }, []);

  const send = async (override) => {
    const firebaseUser = getAuth().currentUser;
const userToken = firebaseUser ? await firebaseUser.getIdToken() : null;

if (!userToken) {
  setError("Session expired. Please sign in again.");
  return;
}
    const trimmed = (override || input).trim();
    if (!trimmed || loading) return;
    setInput("");
    setError("");
    // Switch to chat tab on mobile when sending
    if (isMobile) setMobileTab("chat");

    const userMsg = {
      id: `u-${++msgCounter.current}`,
      role: "user",
      content: trimmed,
      rawContent: trimmed,
    };
    setMessages((prev) => [...prev, userMsg]);
    historyRef.current = [
      ...historyRef.current,
      { role: "user", content: trimmed },
    ];
    await saveMsg(userMsg);
    setLoading(true);

    try {
      const mentionedClient = findClientInText(trimmed, userData?.clients);
      let appliedClient = null;
      if (mentionedClient) {
        applyClientFromDB(mentionedClient);
        appliedClient = mentionedClient.name;
      }

      const isRepeat =
        /repeat|same as last|last invoice|previous invoice/i.test(trimmed);
      if (isRepeat && userData?.recentInvoices?.length) {
        const last = userData.recentInvoices[0];
        if (last.customer) {
          setCustomerName(last.customer.name || "");
          setCustomerEmail(last.customer.email || "");
          setCustomerPhone(last.customer.phone || "");
          setCustomerAddress(last.customer.address || "");
          setTaxId(last.customer.tax_id || "");
          setBillName(last.customer.name || "");
          setBillEmail(last.customer.email || "");
          setBillPhone(last.customer.phone || "");
          setBillAddress(last.customer.address || "");
          if (!appliedClient) appliedClient = last.customer.name;
        }
        if (last.items?.length) applyItems(last.items);
      }

     // Run both in parallel — chat reply + structured extraction
const [rawText, extractedDirect] = await Promise.all([
  // 1. Existing chat flow (for the conversational reply)
  callClaude({
    system: buildPrompt(userData, documentType, industry),
    messages: historyRef.current,
  }),
extractInvoiceData(trimmed),
]);

const { reply, data: extracted } = parseResponse(rawText);

// Merge extracted data — direct extraction takes priority for items/client
if (extractedDirect?.line_items?.length) {
  applyItems(extractedDirect.line_items.map(i => ({
    description: i.description,
    rate: i.rate,
    qty: i.quantity,
    amount: i.amount,
    taxRate: 15,
    category: "Service",
  })));
}
if (extractedDirect?.client_name && !extracted?.matchedClientId) {
  setCustomerName(extractedDirect.client_name);
  setCustomerEmail(extractedDirect.client_email || "");
  setCustomerPhone(extractedDirect.client_phone || "");
  setCustomerAddress(extractedDirect.client_address || "");
}
     
      let appliedItems = 0;

      if (extracted) {
        const config = getIndustryConfig(industry);
        Object.keys(config.extraFields).forEach((key) => {
          if (extracted[key])
            setExtraData((prev) => ({ ...prev, [key]: extracted[key] }));
        });
        if (extracted.matchedClientId && !mentionedClient) {
          const dbClient = userData?.clients?.find(
            (c) => c.id === extracted.matchedClientId,
          );
          if (dbClient) {
            applyClientFromDB(dbClient);
            appliedClient = dbClient.name;
          }
        }
        if (extracted.items?.length && !isRepeat)
          appliedItems = applyItems(extracted.items);
        if (extracted.clientNotInDB?.name && !mentionedClient) {
          setPendingNewClient(extracted.clientNotInDB);
          setShowCustomerModal(true);
        }
        if (
          extracted.repeatLastInvoice &&
          userData?.recentInvoices?.length &&
          !isRepeat
        ) {
          const last = userData.recentInvoices[0];
          if (last.items?.length) appliedItems = applyItems(last.items);
        }
      }

      const aiMsg = {
        id: `a-${++msgCounter.current}`,
        role: "assistant",
        content: reply || "Got it — I've updated your document.",
        rawContent: rawText,
        appliedClient,
        appliedItems: appliedItems || null,
      };
      setMessages((prev) => [...prev, aiMsg]);
      historyRef.current = [
        ...historyRef.current,
        { role: "assistant", content: rawText },
      ];
      await saveMsg({ ...aiMsg, showSavePrompt: false });
    } catch (e) {
      setError(e.message || "Something went wrong. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const handlePrint = () => {
    const s = document.createElement("style");
    s.textContent = `@media print { * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } html,body { margin:0!important;padding:0!important;width:210mm!important;background:white!important; } body * { visibility:hidden!important; } #ai-print-area,#ai-print-area * { visibility:visible!important; } #ai-print-area { display:block!important;position:absolute!important;left:0!important;top:0!important;width:210mm!important;min-height:297mm!important;margin:0!important;padding:0!important;background:white!important; } @page { size:A4 portrait;margin:40px!important; } }`;
    document.head.appendChild(s);
    window.print();
    setTimeout(() => document.head.removeChild(s), 1000);
  };

  const hasContent = customerName || safeItems.length > 0;
  const activeDt = DOC_TYPES.find((d) => d.id === documentType) || DOC_TYPES[0];
  const bizInfo = userData?.businessInfo;
  const suggestions = SUGGESTIONS[documentType] || SUGGESTIONS.invoice;

  const templateProps = {
    templateId: userData?.activeTemplate || "professional",
    businessInfo: bizInfo,
    loading: false,
    invoiceNumber,
    customerName,
    billName,
    billEmail,
    billPhone,
    billAddress,
    customerEmail,
    customerPhone,
    customerAddress,
    taxId,
    items: safeItems,
    subtotal: safeNum(subtotal),
    totalTax: safeNum(totalTax),
    total: safeNum(total),
    documentType,
    showStamp: false,
    paymentStatus: { status: "pending" },
    extraData,
    industry,
  };

  if (dataLoading)
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 200,
          background: "#0f172a",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          fontFamily: "'DM Sans','Lato',sans-serif",
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: "linear-gradient(135deg,#1655e0,#7c3aed)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Sparkles size={22} color="#fff" />
        </div>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: "#fff",
              marginBottom: 6,
            }}
          >
            SolidFlo AI
          </div>
          <div
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,.4)",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Loader2
              size={14}
              color="rgba(255,255,255,.4)"
              style={{ animation: "spin 1s linear infinite" }}
            />
            Loading your template, clients and business data…
          </div>
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );

  /* ── Chat Panel ── */
  const ChatPanel =  (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "#0f172a",
      }}
    >
      {/* Desktop top bar — hidden on mobile (mobile uses bottom nav) */}
      {!isMobile && (
        <div
          style={{
            height: 48,
            background: "#0f172a",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 14px",
            flexShrink: 0,
            borderBottom: "1px solid rgba(255,255,255,.07)",
          }}
        >
          <button
            onClick={onExit}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "5px 12px",
              borderRadius: 8,
              background: "rgba(255,255,255,.08)",
              border: "1px solid rgba(255,255,255,.12)",
              color: "rgba(255,255,255,.7)",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            <ArrowLeft size={13} /> Back
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {hasContent && !previewOpen && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: 11,
                  color: "#4ade80",
                  fontWeight: 600,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#22c55e",
                    display: "inline-block",
                  }}
                />{" "}
                Live
              </div>
            )}
            <button
              onClick={() => setPreviewOpen((o) => !o)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "5px 12px",
                borderRadius: 8,
                background: previewOpen ? "rgba(22,85,224,.3)" : "#1655e0",
                border: `1px solid ${previewOpen ? "rgba(22,85,224,.5)" : "#1655e0"}`,
                color: "#fff",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {previewOpen ? (
                <>
                  <PanelRightClose size={13} /> Hide
                </>
              ) : (
                <>
                  <PanelRight size={13} /> Show Template
                </>
              )}
            </button>
            <button
              onClick={() => {
                if (window.confirm("Clear conversation?")) {
                  setMessages([]);
                  historyRef.current = [];
                }
              }}
              style={{
                background: "none",
                border: "1px solid #e2e8f0",
                borderRadius: 7,
                color: "#94a3b8",
                cursor: "pointer",
                padding: "5px 8px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <RotateCcw size={12} />
            </button>
          </div>
        </div>
      )}

      {/* Mobile top bar */}
      {isMobile && (
        <div
          style={{
            height: 52,
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 14px",
            flexShrink: 0,
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <button
            onClick={onExit}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "6px 12px",
              borderRadius: 8,
              background: "rgba(22,85,224,.1)",
              border: "none",
              color: "#1655e0",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            <ArrowLeft size={14} /> Back
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
              SolidFlo AI
            </div>
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#22c55e",
              }}
            />
          </div>
          <button
            onClick={() => {
              if (window.confirm("Clear conversation?")) {
                setMessages([]);
                historyRef.current = [];
              }
            }}
            style={{
              background: "none",
              border: "1px solid #e2e8f0",
              borderRadius: 7,
              color: "#94a3b8",
              cursor: "pointer",
              padding: "6px 8px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <RotateCcw size={13} />
          </button>
        </div>
      )}

      {/* Messages */}
      <div
        ref={chatRef}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: isMobile ? "16px 14px 8px" : "20px 18px 8px",
          scrollbarWidth: "thin",
          background: "#0f172a",
          scrollbarColor: "#858585 transparent",
        }}
      >
        {messages.length <= 1 && (
          <div style={{ marginBottom: 24 }}>
            {userData?.clients?.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#64748b",
                    letterSpacing: ".07em",
                    textTransform: "uppercase",
                    marginBottom: 8,
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <Database size={11} color="#1655e0" /> Your saved clients
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {userData.clients.slice(0, isMobile ? 4 : 5).map((c) => (
                    <button
                      key={c.id}
                      className="ai-sug"
                      onClick={() => {
                        applyClientFromDB(c);
                        send(
                          `${documentType === "purchase_order" ? "Purchase order from" : documentType === "estimate" ? "Quote for" : "Invoice"} ${c.name} for `,
                        );
                      }}
                      style={{
                        padding: "5px 12px",
                        borderRadius: 20,
                        background: "rgba(255,255,255,.05)",
                        border: "1px solid #e5e7eb",
                        cursor: "pointer",
                        fontSize: 12,
                        color: "rgba(255,255,255,.8)",
                        fontFamily: "inherit",
                        transition: "all .15s",
                      }}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "#64748b",
                letterSpacing: ".07em",
                textTransform: "uppercase",
                marginBottom: 8,
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <Lightbulb size={11} color="#f59e0b" /> Try one of these
            </div>
            {suggestions.map((s, i) => (
              <button
                key={i}
                className="ai-sug"
                onClick={() => send(s)}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "9px 13px",
                  marginBottom: 6,
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: 12,
                  cursor: "pointer",
                  fontSize: isMobile ? 12 : 13,
                  color: "#374151",
                  fontFamily: "inherit",
                  transition: "all .15s",
                  lineHeight: 1.4,
                }}
              >
                {s}
              </button>
            ))}
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={msg.id || i} className="ai-msg">
            <Bubble msg={msg} />
          </div>
        ))}
        {loading && <TypingDots />}
        {error && (
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 8,
              padding: "10px 14px",
              borderRadius: 12,
              marginBottom: 16,
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#dc2626",
              fontSize: 12,
            }}
          >
            <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />{" "}
            {error}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        style={{
          padding: isMobile ? "8px 12px 12px" : "10px 14px 14px",
          background: "#0f172a",
          borderTop: "1px solid rgba(255,255,255,.07)",
          flexShrink: 0,
        }}
      >
        {userData && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              marginBottom: 8,
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#22c55e",
                display: "inline-block",
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: 10, color: "#4ade80", fontWeight: 700 }}>
              Loaded
            </span>
            {[
              userData.clients.length && `${userData.clients.length} clients`,
              userData.recentInvoices.length &&
                `${userData.recentInvoices.length} invoices`,
              !isMobile &&
                userData.activeTemplate &&
                `Template: ${userData.activeTemplate}`,
            ]
              .filter(Boolean)
              .map((p, i) => (
                <span
                  key={i}
                  style={{
                    padding: "1px 7px",
                    borderRadius: 10,
                    background: "rgba(74,222,128,.1)",
                    border: "1px solid rgba(74,222,128,.2)",
                    fontSize: 10,
                    color: "#4ade80",
                    fontWeight: 600,
                  }}
                >
                  {p}
                </span>
              ))}
            <button
              onClick={loadData}
              style={{
                marginLeft: "auto",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#15803d",
                display: "flex",
                alignItems: "center",
                gap: 3,
                fontSize: 10,
              }}
            >
              <RefreshCw size={10} />
            </button>
          </div>
        )}
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "flex-end",
            background: "rgba(255,255,255,.06)",
            border: "1.5px solid rgba(255,255,255,.12)",
            borderRadius: 16,
            padding: "9px 9px 9px 14px",
            boxShadow: "0 1px 3px rgba(0,0,0,.05)",
          }}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={
              userData?.clients?.length
                ? `e.g. "Invoice ${userData.clients[0]?.name} for 5hrs at R750/hr"`
                : "Describe your invoice in plain English…"
            }
            rows={isMobile ? 1 : 2}
            style={{
              flex: 1,
              background: "none",
              border: "none",
              outline: "none",
              resize: "none",
              fontSize: isMobile ? 14 : 13.5,
              color: "#fff",
              fontFamily: "inherit",
              lineHeight: 1.6,
              maxHeight: 110,
              overflowY: "auto",
            }}
          />
          <button
            className="ai-send"
            onClick={() => send()}
            disabled={!input.trim() || loading}
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              background: "#1655e0",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              transition: "background .15s",
            }}
          >
            {loading ? (
              <Loader2
                size={16}
                color="#fff"
                style={{ animation: "spin 1s linear infinite" }}
              />
            ) : (
              <Send size={16} color="#fff" />
            )}
          </button>
        </div>
        {!isMobile && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 5,
              padding: "0 2px",
            }}
          >
            <span style={{ fontSize: 10, color: "#94a3b8" }}>
              <kbd
                style={{
                  padding: "1px 5px",
                  borderRadius: 4,
                  background: "#f1f5f9",
                  border: "1px solid #e2e8f0",
                  fontSize: 10,
                  color: "#64748b",
                  fontFamily: "monospace",
                }}
              >
                Enter
              </kbd>{" "}
              send ·{" "}
              <kbd
                style={{
                  padding: "1px 5px",
                  borderRadius: 4,
                  background: "#f1f5f9",
                  border: "1px solid #e2e8f0",
                  fontSize: 10,
                  color: "#64748b",
                  fontFamily: "monospace",
                }}
              >
                Shift+Enter
              </kbd>{" "}
              new line
            </span>
            <span
              style={{
                fontSize: 10,
                color: "#e2e8f0",
                fontFamily: "monospace",
              }}
            >
              {user?.uid?.slice(0, 8)}…
            </span>
          </div>
        )}
      </div>
    </div>
  );

  /* ── Preview Panel ── */
  const PreviewPanel =  (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "#0f172a",
      }}
    >
      <div
        style={{
          height: isMobile ? 52 : 48,
          background: "#f8fafc",
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          gap: 12,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            minWidth: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <activeDt.icon size={15} color={activeDt.color} />
            <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>
              {activeDt.label} preview
            </span>
          </div>
          {hasContent && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "3px 9px",
                borderRadius: 20,
                background: "#dcfce7",
                border: "1px solid #bbf7d0",
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#22c55e",
                  display: "inline-block",
                }}
              />
              <span style={{ fontSize: 11, fontWeight: 700, color: "#166534" }}>
                Live
              </span>
            </div>
          )}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            flexShrink: 0,
          }}
        >
          <button
            onClick={handlePrint}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 14px",
              borderRadius: 8,
              background: "rgba(255,255,255,.08)",
              border: "1px solid rgba(255,255,255,.12)",
              color: "rgba(255,255,255,.8)",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            <Download size={13} /> {isMobile ? "PDF" : "Download PDF"}
          </button>
          <button
            onClick={() => {}}
            disabled={!hasContent}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 16px",
              borderRadius: 8,
              background: hasContent ? "#1655e0" : "#94a3b8",
              border: "none",
              color: "#fff",
              cursor: hasContent ? "pointer" : "not-allowed",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            <Send size={13} /> Send
          </button>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: isMobile ? "16px 12px" : "24px 20px",
          display: "flex",
          justifyContent: "center",
          background: "#0f172a",
        }}
      >
        {!hasContent ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              textAlign: "center",
              gap: 16,
              maxWidth: 320,
            }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: 16,
                background: "#e5e7eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <activeDt.icon size={26} color="#d1d5db" />
            </div>
            <div>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#374151",
                  marginBottom: 6,
                }}
              >
                Your {activeDt.label.toLowerCase()} will appear here
              </div>
              <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>
                {isMobile
                  ? "Tap Chat and describe what you need"
                  : userData?.clients?.length
                    ? `Type a client name — I'll load their details from your ${userData.clients.length} saved contacts instantly`
                    : "Describe who you're billing and what for"}
              </div>
            </div>
            {isMobile && (
              <button
                onClick={() => setMobileTab("chat")}
                style={{
                  padding: "10px 24px",
                  borderRadius: 10,
                  background: "#1655e0",
                  border: "none",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Go to Chat
              </button>
            )}
          </div>
        ) : (
          <div
            id="ai-print-area"
            style={{
              width: "100%",
              maxWidth: 760,
              background: "#fff",
              borderRadius: 8,
              boxShadow: "0 4px 24px rgba(0,0,0,.1)",
              overflow: "hidden",
              animation: "slideUp .3s ease",
            }}
          >
            {TemplateRenderer ? (
              <TemplateRenderer {...templateProps} />
            ) : (
              <div
                style={{
                  padding: 40,
                  textAlign: "center",
                  color: "#94a3b8",
                  fontSize: 14,
                }}
              >
                Pass TemplateRenderer as a prop from your dashboard
              </div>
            )}
          </div>
        )}
      </div>

      {hasContent && (
        <div
          style={{
            height: 38,
            background: "#0f172a",
            borderTop: "1px solid #e5e7eb",
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "0 14px",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "#9ca3af",
              textTransform: "uppercase",
              letterSpacing: ".06em",
              whiteSpace: "nowrap",
            }}
          >
            On template:
          </span>
          {[
            customerName && { label: "Client", val: customerName },
            safeItems.length && { label: "Items", val: `${safeItems.length}` },
            total > 0 && { label: "Total", val: `R${total.toFixed(2)}` },
          ]
            .filter(Boolean)
            .map((item, i) => (
              <div
                key={i}
                style={{
                  padding: "2px 8px",
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: 6,
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                <span
                  style={{ fontSize: 10, color: "#6b7280", fontWeight: 700 }}
                >
                  {item.label}:{" "}
                </span>
                <span
                  style={{ fontSize: 10, color: "#1e293b", fontWeight: 600 }}
                >
                  {item.val}
                </span>
              </div>
            ))}
        </div>
      )}
    </div>
  );

  /* ── Mobile Bottom Nav ── */
  const MobileBottomNav =  (
    <div
      style={{
        height: 64,
        background: "#fff",
        borderTop: "1px solid #e5e7eb",
        display: "flex",
        alignItems: "stretch",
        flexShrink: 0,
        boxShadow: "0 -4px 16px rgba(0,0,0,.06)",
      }}
    >
      {[
        {
          id: "chat",
          label: "Chat",
          icon: MessageSquare,
          badge: loading ? "•" : null,
        },
        {
          id: "preview",
          label: "Preview",
          icon: Eye,
          badge: hasContent ? "•" : null,
        },
        { id: "menu", label: "Menu", icon: Menu },
      ].map((tab) => {
        const Icon = tab.icon;
        const active =
          mobileTab === tab.id || (tab.id === "menu" && mobileMenuOpen);
        return (
          <button
            key={tab.id}
            onClick={() => {
              if (tab.id === "menu") {
                setMobileMenuOpen((o) => !o);
              } else {
                setMobileTab(tab.id);
                setMobileMenuOpen(false);
              }
            }}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              background: "none",
              border: "none",
              cursor: "pointer",
              position: "relative",
              transition: "all .15s",
            }}
          >
            {/* Active indicator */}
            {active && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: "25%",
                  right: "25%",
                  height: 2,
                  background: "#1655e0",
                  borderRadius: "0 0 2px 2px",
                }}
              />
            )}
            <div style={{ position: "relative" }}>
              <Icon size={20} color={active ? "#1655e0" : "#94a3b8"} />
              {tab.badge && (
                <div
                  style={{
                    position: "absolute",
                    top: -3,
                    right: -3,
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background:
                      tab.id === "chat" && loading ? "#f59e0b" : "#22c55e",
                    border: "1.5px solid #fff",
                  }}
                />
              )}
            </div>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: active ? "#1655e0" : "#94a3b8",
                letterSpacing: ".02em",
              }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );

  /* ── RENDER ── */
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        flexDirection: "column",
        background: "#f4f5f8",
        fontFamily: "'DM Sans','Lato',sans-serif",
      }}
    >
      <style>{`
        @keyframes bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-5px)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .ai-msg{animation:slideUp .22s ease}
        .ai-send:hover:not(:disabled){background:#1245c0!important}
        .ai-send:disabled{opacity:.45;cursor:not-allowed}
        .ai-sug:hover{background:#eff6ff!important;border-color:#93c5fd!important;color:#1d4ed8!important}
      `}</style>

      <CustomerModal
        showModal={showCustomerModal}
        setShowModal={setShowCustomerModal}
        existingCustomer={null}
        onCustomerSaved={() => {
          loadData();
          setShowCustomerModal(false);
          setPendingNewClient(null);
        }}
      />

      {/* ── MOBILE LAYOUT ── */}
      {isMobile ? (
        <>
          <div style={{ flex: 1, overflow: "hidden", minHeight: 0 }}>
            {mobileTab === "chat" && !mobileMenuOpen && ChatPanel}
            {mobileTab === "preview" && !mobileMenuOpen && PreviewPanel}
          </div>
          {MobileBottomNav}
          <MobileMenuDrawer
            open={mobileMenuOpen}
            onClose={() => setMobileMenuOpen(false)}
            documentType={documentType}
            onChange={(type) => {
              setDocumentType(type);
              setMessages((prev) => [
                ...prev,
                {
                  id: `sys-${Date.now()}`,
                  role: "assistant",
                  content: `Switched to ${DOC_TYPES.find((d) => d.id === type)?.label}. What would you like to create?`,
                },
              ]);
            }}
            userData={userData}
            onNavigate={(id) => {
              onExit();
              onNavigateTo?.(id);
            }}
            onLogout={() => signOut(getAuth())}
            user={user}
            businessInfo={bizInfo}
          />
        </>
      ) : (
        /* ── DESKTOP LAYOUT ── */
        <div
          style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 }}
        >
         <DocSidebar
    activeType={documentType}
    onChange={(type) => {
      setDocumentType(type);
      setActiveNav(null);
      setSelectedDoc(null);
      setMessages(prev => [...prev, {
        id: `sys-${Date.now()}`, role: "assistant",
        content: `Switched to ${DOC_TYPES.find(d => d.id === type)?.label}. What would you like to create?`,
      }]);
    }}
    collapsed={sidebarCollapsed}
    onToggle={() => setSidebarCollapsed(o => !o)}
    businessInfo={bizInfo}
    user={user}
    onLogout={() => signOut(getAuth())}
    userData={userData}
    activeNav={activeNav}
    onNavSelect={(id) => {
      setActiveNav(id);
      setSelectedDoc(null);
      // Search and Chats don't show the list panel, just stay in chat
      if (id === "search" || id === "chats") {
        setActiveNav(null);
        inputRef.current?.focus();
      }
    }}
  />
{activeNav && ["invoices", "quotes", "recents"].includes(activeNav) && (
    <DocListPanel
      activeNav={activeNav}
      userData={userData}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      onSelectDoc={(doc) => {
        setSelectedDoc(doc);
        setPreviewOpen(true);
      }}
      selectedDoc={selectedDoc}
    />
  )}
          {/* Chat */}
          {!selectedDoc && (
    <div style={{
      width: previewOpen ? "42%" : "100%",
      minWidth: 320,
      display: "flex",
      flexDirection: "column",
      borderRight: previewOpen ? "1px solid #e5e7eb" : "none",
      transition: "width .3s ease",
      flexShrink: 0,
      overflow: "hidden",
    }}>
      {ChatPanel}
    </div>
  )}

          {/* Preview */}
          {(previewOpen || selectedDoc) && (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
      {selectedDoc ? (
        // ── Selected doc from list ──
        <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#e2e8f0" }}>
          {/* Toolbar */}
          <div style={{
            height: isMobile ? 52 : 48, background: "#0f172a", borderBottom: "1px solid rgba(255,255,255,.07)",
            display: "flex", alignItems: "center", padding: "0 16px", gap: 12, flexShrink: 0,
          }}>
            <button onClick={() => setSelectedDoc(null)} style={{
              display: "flex", alignItems: "center", gap: 6, padding: "5px 12px",
              borderRadius: 8, background: "#fff", border: "1px solid #e2e8f0",
              color: "#374151", cursor: "pointer", fontSize: 12, fontWeight: 600,
            }}>
              <ArrowLeft size={13} /> Back to chat
            </button>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", flex: 1 }}>
              {selectedDoc.customer?.name} · #{selectedDoc.invoiceNumber}
            </span>
            <button onClick={handlePrint} style={{
              display: "flex", alignItems: "center", gap: 6, padding: "6px 14px",
              borderRadius: 8, background: "#fff", border: "1px solid #e2e8f0",
              color: "#374151", cursor: "pointer", fontSize: 12, fontWeight: 600,
            }}>
              <Download size={13} /> Download PDF
            </button>
          </div>
          {/* Render selected doc */}
          <div style={{ flex: 1, overflowY: "auto", padding: "24px 20px", display: "flex", justifyContent: "center" }}>
            <div style={{
              width: "100%", maxWidth: 760, background: "#fff",
              borderRadius: 8, boxShadow: "0 4px 24px rgba(0,0,0,.1)", overflow: "hidden",
            }}>
              {TemplateRenderer ? (
                <TemplateRenderer
                  {...templateProps}
                  // Override with selected doc's data
                  customerName={selectedDoc.customer?.name || ""}
                  customerEmail={selectedDoc.customer?.email || ""}
                  customerPhone={selectedDoc.customer?.phone || ""}
                  customerAddress={selectedDoc.customer?.address || ""}
                  items={selectedDoc.items || []}
                  subtotal={selectedDoc.subtotal || 0}
                  totalTax={selectedDoc.totalTax || 0}
                  total={selectedDoc.total || 0}
                  invoiceNumber={selectedDoc.invoiceNumber || ""}
                  documentType={selectedDoc.documentType || "invoice"}
                  paymentStatus={selectedDoc.paymentStatus || { status: "pending" }}
                  showStamp={selectedDoc.paymentStatus?.status === "paid"}
                  stampText="PAID"
                  stampColor="#16a34a"
                />
              ) : (
                <div style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>
                  No template renderer provided
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        PreviewPanel
      )}
    </div>
  )}
        </div>
      )}
    </div>
  );
}
